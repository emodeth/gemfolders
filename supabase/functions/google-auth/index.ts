import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

import { corsHeaders } from "../_shared/cors.ts"

interface GoogleUserInfo {
  id: string
  email: string
  verified_email: boolean
  name: string
  picture: string
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { access_token } = await req.json()

    if (!access_token) {
      return new Response(JSON.stringify({ error: "Missing access_token" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const googleResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    )

    if (!googleResponse.ok) {
      return new Response(JSON.stringify({ error: "Invalid Google token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      })
    }

    const googleUser: GoogleUserInfo = await googleResponse.json()

    if (!googleUser.email || !googleUser.verified_email) {
      return new Response(
        JSON.stringify({ error: "Email not verified with Google" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      (u: { email?: string }) => u.email === googleUser.email
    )

    let userId: string

    if (existingUser) {
      userId = existingUser.id

      await supabaseAdmin.auth.admin.updateUserById(userId, {
        user_metadata: {
          full_name: googleUser.name,
          avatar_url: googleUser.picture,
          provider: "google"
        }
      })
    } else {
      const { data: newUser, error: createError } =
        await supabaseAdmin.auth.admin.createUser({
          email: googleUser.email,
          email_confirm: true,
          user_metadata: {
            full_name: googleUser.name,
            avatar_url: googleUser.picture,
            provider: "google"
          }
        })

      if (createError || !newUser.user) {
        console.error("Error creating user:", createError)
        return new Response(
          JSON.stringify({ error: "Failed to create user" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          }
        )
      }

      userId = newUser.user.id
    }

    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: googleUser.email
      })

    if (linkError || !linkData) {
      console.error("Error generating link:", linkError)
      return new Response(
        JSON.stringify({ error: "Failed to generate session" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    const token_hash = linkData.properties?.hashed_token

    if (!token_hash) {
      const actionLink = linkData.properties?.action_link
      if (actionLink) {
        try {
          const url = new URL(actionLink)
          const extractedToken =
            url.searchParams.get("token_hash") || url.searchParams.get("token")
          if (extractedToken) {
            return new Response(
              JSON.stringify({
                token_hash: extractedToken,
                type: "magiclink",
                email: googleUser.email
              }),
              {
                headers: { ...corsHeaders, "Content-Type": "application/json" }
              }
            )
          }
        } catch (e) {
          console.error("Error parsing action_link:", e)
        }
      }

      console.error("No token found in linkData:", JSON.stringify(linkData))
      return new Response(
        JSON.stringify({ error: "Failed to extract session token" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      )
    }

    return new Response(
      JSON.stringify({
        token_hash,
        type: "magiclink",
        email: googleUser.email
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Error in google-auth function:", error)
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    })
  }
})
