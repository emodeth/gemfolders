# Polar.sh Subscription Integration

This document explains how to set up and configure the Polar.sh subscription system for Gemfolders.

## Overview

The subscription system uses:

- **Polar.sh** - Payment processing and subscription management
- **Supabase** - Database and user authentication
- **Edge Functions** - Webhook handling

## Polar.sh Checkout Links

| Plan     | Price       | Link                                                                      |
| -------- | ----------- | ------------------------------------------------------------------------- |
| Lifetime | $49.99      | https://buy.polar.sh/polar_cl_E6Fwbbk8vTTZcHQayBPiuudNRLqaUtMw58Rwk137x1P |
| Yearly   | $29.99/year | https://buy.polar.sh/polar_cl_GZgmt1oujamSCgyttendwbjsqWwgsRSQRJQZM0h7vas |
| Monthly  | $4.99/month | https://buy.polar.sh/polar_cl_59S8hiroPMS5ifuhn7IYIgyCTplxH5lN1DY2M0QOAZP |

## Database Schema

The `user_access` table tracks subscription status:

```sql
create table public.user_access (
  user_id uuid references auth.users not null primary key,
  polar_subscription_id text,
  polar_order_id text,
  access_status access_level default 'free',
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Create the enum type for access levels
create type access_level as enum ('free', 'pro', 'yearly', 'lifetime');

-- Enable Row Level Security
alter table public.user_access enable row level security;

-- Policy: Users can only read their own access record
create policy "Users can view own access" on public.user_access
  for select using (auth.uid() = user_id);

-- Policy: Service role can do anything (for webhooks)
create policy "Service role full access" on public.user_access
  for all using (auth.role() = 'service_role');

-- Enable realtime for the table
alter publication supabase_realtime add table public.user_access;
```

## Setting Up Webhooks

### 1. Deploy the Edge Function

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <your-project-ref>

# Set the webhook secret
supabase secrets set POLAR_WEBHOOK_SECRET=<your-polar-webhook-secret>

# Deploy the function
supabase functions deploy polar-webhook
```

### 2. Configure Polar.sh Webhook

1. Go to your [Polar.sh Dashboard](https://polar.sh)
2. Navigate to **Settings** > **Developers** > **Webhooks**
3. Click **Add Endpoint**
4. Enter your webhook URL: `https://<your-project-ref>.supabase.co/functions/v1/polar-webhook`
5. Set the secret (same as `POLAR_WEBHOOK_SECRET`)
6. Subscribe to these events:
   - `order.created`
   - `order.paid`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.active`
   - `subscription.canceled`
   - `subscription.revoked`

### 3. Environment Variables

Make sure these are set in your Supabase project:

| Variable                    | Description                  |
| --------------------------- | ---------------------------- |
| `POLAR_WEBHOOK_SECRET`      | Your Polar.sh webhook secret |
| `SUPABASE_URL`              | Auto-set by Supabase         |
| `SUPABASE_SERVICE_ROLE_KEY` | Auto-set by Supabase         |

## How It Works

### Payment Flow

1. User clicks on a pricing plan in the PaywallModal
2. Opens Polar.sh checkout with user's email pre-filled
3. User completes payment on Polar.sh
4. Polar.sh sends webhook to our Edge Function
5. Edge Function updates `user_access` table
6. SubscriptionContext receives realtime update
7. UI updates to reflect new subscription status

### Access Levels

| Level      | Description                      |
| ---------- | -------------------------------- |
| `free`     | Default, limited features        |
| `pro`      | Monthly subscription             |
| `yearly`   | Yearly subscription              |
| `lifetime` | One-time purchase, never expires |

### Subscription Expiry

- **Lifetime**: Never expires
- **Yearly/Monthly**: `current_period_end` determines when access expires
- The `SubscriptionContext` checks if `current_period_end > now()` to validate access

## Testing

1. Use Polar.sh sandbox environment for testing
2. Create test products with the same structure
3. Update the checkout URLs for testing

## Troubleshooting

### User not found after payment

- The user must be registered with the same email used in checkout
- Consider adding a mechanism to link purchases to users post-registration

### Webhook not receiving events

- Check the webhook logs in Polar.sh dashboard
- Verify the webhook URL is correct
- Ensure the Edge Function is deployed and accessible

### Subscription not updating in UI

- Check browser console for errors
- Verify realtime is enabled for `user_access` table
- Check Supabase logs for database errors
