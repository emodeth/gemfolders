import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const POLAR_WEBHOOK_SECRET = Deno.env.get("POLAR_WEBHOOK_SECRET")!
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

interface PolarWebhookPayload {
  type: string
  data: {
    id: string
    customer_id: string
    customer_email?: string
    customer?: {
      email?: string
      id?: string
    }
    product?: {
      id: string
      name: string
    }
    price?: {
      id: string
      type: "one_time" | "recurring"
      recurring_interval?: "month" | "year"
    }
    subscription?: {
      id: string
      status: string
      current_period_end: string
    }
    order?: {
      id: string
    }
    user_id?: string
    metadata?: Record<string, string>
  }
}

async function verifyWebhookSignature(
  payload: string,
  signature: string,
  timestamp: string,
  webhookId: string,
  secret: string
): Promise<boolean> {
  try {
    const encoder = new TextEncoder()

    const signedPayload = `${webhookId}.${timestamp}.${payload}`

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    )

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    )

    const computedSignature = btoa(
      String.fromCharCode(...new Uint8Array(signatureBytes))
    )

    const receivedSignatures = signature.split(" ").flatMap((s) => {
      const parts = s.split(",")
      return parts.filter((p) => p.length > 20 && !p.startsWith("v"))
    })

    const isValid = receivedSignatures.includes(computedSignature)

    if (isValid) {
      console.log("Webhook signature verified")
    } else {
      console.error("Webhook signature verification failed")
      console.error("Expected:", computedSignature)
      console.error("Received:", receivedSignatures)
    }

    return isValid
  } catch (error) {
    console.error("Signature verification error:", error)
    return false
  }
}

function getAccessLevel(priceType: string, interval?: string): string {
  if (priceType === "one_time") {
    return "lifetime"
  }
  if (interval === "year") {
    return "yearly"
  }
  if (interval === "month") {
    return "pro"
  }
  return "pro"
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 })
  }

  try {
    const body = await req.text()
    const webhookId = req.headers.get("webhook-id")
    const webhookTimestamp = req.headers.get("webhook-timestamp")
    const webhookSignature = req.headers.get("webhook-signature")

    console.log("=== Webhook Request ===")
    console.log("Event received, body length:", body.length)

    if (
      POLAR_WEBHOOK_SECRET &&
      webhookId &&
      webhookTimestamp &&
      webhookSignature
    ) {
      const isValid = await verifyWebhookSignature(
        body,
        webhookSignature,
        webhookTimestamp,
        webhookId,
        POLAR_WEBHOOK_SECRET
      )

      if (!isValid) {
        console.error("Invalid webhook signature")
        return new Response("Invalid signature", { status: 401 })
      }
    } else {
      console.log("Skipping signature verification")
    }

    const payload: PolarWebhookPayload = JSON.parse(body)
    console.log("Webhook type:", payload.type)
    console.log("Webhook data:", JSON.stringify(payload.data, null, 2))

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const email =
      payload.data.customer_email || payload.data.customer?.email || null

    switch (payload.type) {
      case "checkout.created":
        console.log("Checkout created:", payload.data.id)
        break

      case "order.created":
      case "order.paid": {
        if (!email) {
          console.error("No customer email in order payload")
          console.error("Payload data:", JSON.stringify(payload.data, null, 2))
          return new Response("Missing customer email", { status: 400 })
        }

        const { data: userData, error: userError } =
          await supabase.auth.admin.listUsers()
        if (userError) {
          console.error("Error fetching users:", userError)
          return new Response("Error fetching users", { status: 500 })
        }

        const user = userData.users.find((u) => u.email === email)
        if (!user) {
          console.error("User not found for email:", email)
          return new Response("User not found", { status: 404 })
        }

        const { error: upsertError } = await supabase
          .from("user_access")
          .upsert(
            {
              user_id: user.id,
              polar_order_id: payload.data.id,
              access_status: "lifetime",
              current_period_end: null,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: "user_id"
            }
          )

        if (upsertError) {
          console.error("Error upserting user_access:", upsertError)
          return new Response("Database error", { status: 500 })
        }

        console.log("Lifetime access granted for user:", user.id)
        break
      }

      case "subscription.created":
      case "subscription.updated":
      case "subscription.active": {
        if (!email) {
          console.error("No customer email in subscription payload")
          console.error("Payload data:", JSON.stringify(payload.data, null, 2))
          return new Response("Missing customer email", { status: 400 })
        }

        const { data: userData, error: userError } =
          await supabase.auth.admin.listUsers()
        if (userError) {
          console.error("Error fetching users:", userError)
          return new Response("Error fetching users", { status: 500 })
        }

        const user = userData.users.find((u) => u.email === email)
        if (!user) {
          console.error("User not found for email:", email)
          return new Response("User not found", { status: 404 })
        }

        const accessLevel = getAccessLevel(
          payload.data.price?.type || "recurring",
          payload.data.price?.recurring_interval
        )

        const currentPeriodEnd = payload.data.subscription?.current_period_end

        const { error: upsertError } = await supabase
          .from("user_access")
          .upsert(
            {
              user_id: user.id,
              polar_subscription_id:
                payload.data.subscription?.id || payload.data.id,
              access_status: accessLevel,
              current_period_end: currentPeriodEnd,
              updated_at: new Date().toISOString()
            },
            {
              onConflict: "user_id"
            }
          )

        if (upsertError) {
          console.error("Error upserting user_access:", upsertError)
          return new Response("Database error", { status: 500 })
        }

        console.log(`Subscription ${accessLevel} granted for user:`, user.id)
        break
      }

      case "subscription.canceled":
      case "subscription.revoked": {
        if (!email) {
          console.log("No email in cancellation payload, skipping")
          return new Response("OK", { status: 200 })
        }

        const { data: userData } = await supabase.auth.admin.listUsers()
        const user = userData?.users.find((u) => u.email === email)

        if (user) {
          const { error: updateError } = await supabase
            .from("user_access")
            .update({
              access_status: "canceled",
              updated_at: new Date().toISOString()
            })
            .eq("user_id", user.id)

          if (updateError) {
            console.error("Error updating user_access:", updateError)
          } else {
            console.log("Subscription canceled for user:", user.id)
          }
        }
        break
      }

      default:
        console.log("Unhandled event type:", payload.type)
    }

    return new Response("OK", { status: 200 })
  } catch (error) {
    console.error("Webhook error:", error)
    return new Response("Internal server error", { status: 500 })
  }
})
