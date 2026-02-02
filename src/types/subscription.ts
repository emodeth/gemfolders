export type AccessLevel = "free" | "pro" | "yearly" | "lifetime"

export interface UserAccess {
  user_id: string
  polar_subscription_id: string | null
  polar_order_id: string | null
  access_status: AccessLevel
  current_period_end: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionPlan {
  id: string
  name: string
  price: number
  period: "monthly" | "yearly" | "lifetime"
  checkoutUrl: string
  isPopular?: boolean
}

const IS_SANDBOX = process.env.PLASMO_PUBLIC_POLAR_ENV === "sandbox"

const PRODUCTION_LINKS = {
  lifetime:
    "https://buy.polar.sh/polar_cl_H115ooWkDDgvnGbWQSytEjgOeAqixbMDnClBe30JuQF",
  yearly:
    "https://buy.polar.sh/polar_cl_epR5FPaaNgrFAGo1h4fAkxwCZ0IxZdDnIS1PZ0GQS8n",
  monthly:
    "https://buy.polar.sh/polar_cl_UPTOuohBCRsHX2OC494F99Xy3xSCcYYi132hf4W6Ctr"
} as const

const SANDBOX_LINKS = {
  lifetime:
    "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_xuJnctKAEpuRBmvd2uKvUHtFxhDFJn3pK33Rc3dI3oL/redirect",
  yearly:
    "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_1MuOTuZVIFp7cAXodzAwU94YSfnXNjI2giBkl3XCDjW/redirectD",
  monthly:
    "https://sandbox-api.polar.sh/v1/checkout-links/polar_cl_tJYcMY977Do9fi9vf1Eq7V6r734cZqFiZsym94Bqwrz/redirect"
} as const

export const POLAR_CHECKOUT_LINKS = IS_SANDBOX
  ? SANDBOX_LINKS
  : PRODUCTION_LINKS

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "lifetime",
    name: "Lifetime",
    price: 49.99,
    period: "lifetime",
    checkoutUrl: POLAR_CHECKOUT_LINKS.lifetime
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 29.99,
    period: "yearly",
    checkoutUrl: POLAR_CHECKOUT_LINKS.yearly,
    isPopular: true
  },
  {
    id: "monthly",
    name: "Monthly",
    price: 4.99,
    period: "monthly",
    checkoutUrl: POLAR_CHECKOUT_LINKS.monthly
  }
]
