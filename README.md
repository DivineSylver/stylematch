# StyleMatch — Twitter Style Emulator

Full MVP: Study any creator's writing style by pasting their tweets, generate fresh posts in their voice using Claude, pay with points via Stripe, and let creators see analytics on who studies them (paid tier).

## Stack
- **Frontend**: Next.js 16 (App Router) — deploy to Vercel
- **"Backend"**: Next.js API routes (Node). Easy to split into Express later if desired. Deploy API part on Render if you want.
- **Database + Auth**: Supabase (Postgres + Supabase Auth)
- **Payments**: Stripe (one-time points packs + monthly creator subscription)
- **AI**: Anthropic Claude Sonnet 4 (`claude-sonnet-4-6` or latest sonnet)

## What you get
- Completely free and unlimited generations for everyone
- Paste tweets → analyze voice → generate
- Watcher logging (silent)
- Stripe top-ups + webhooks (never credit until webhook)
- Creator dashboard gated behind $9/mo subscription
- Full RLS + secure server-only keys

## Quick start — Get localhost running RIGHT NOW (Windows)

```powershell
# Make sure you have the latest .env.local
copy .env.example .env.local /Y
```

1. **Edit `.env.local`** and fill in real values (see the 3 main services below).

2. **Run the Supabase schema** (critical):
   - Create a project at https://supabase.com
   - Open SQL Editor
   - Paste **everything** from `supabase/schema.sql` and run it.

3. Start the dev server:
   ```powershell
   npm run dev
   ```

4. Open **http://localhost:3000** in your browser.

   Sign up with any email + password. You should be credited 5 points automatically.

**Fast testing without Stripe payments:**
After you sign up, open your Supabase Dashboard → Table Editor → `users` table → edit your row and set:
- `points_balance = 15`
- `subscription_status = 'active'`

This lets you fully test generation + creator dashboard instantly.

---

### The three things you must configure

**A. Supabase** (Database + Auth)
- URL + anon key + service_role key go into .env.local

**B. Anthropic Claude**
- Get key from https://console.anthropic.com/settings/keys
- Add a little billing credit

**C. Stripe (Test mode)**
- https://dashboard.stripe.com/test/apikeys
- Create two Products/Prices:
  1. One-time "20 Points Pack" → $4 → copy the `price_xxxx` ID
  2. Recurring "Creator Insights" → $9 / month → copy the `price_yyyy` ID
- For local webhooks (to credit points/subscriptions):
  ```powershell
  # Install Stripe CLI once from https://stripe.com/docs/stripe-cli
  stripe login
  stripe listen --forward-to localhost:3000/api/stripe/webhook
  ```
  Copy the `whsec_...` value into `STRIPE_WEBHOOK_SECRET`

Then `npm run dev` + test the flows.

When everything works on localhost, you're ready for Vercel or Netlify.

## Full manual steps (if you prefer)

1. Copy env
   ```powershell
   copy .env.example .env.local
   ```

2. Follow the numbered steps in the script output or the sections below for Supabase, Anthropic, and Stripe.

## Important: Database schema (run once in Supabase SQL Editor)

See `supabase/schema.sql`. It includes:
- `users` table (points_balance, subscription_status)
- `study_sessions`, `watcher_log`, `transactions`
- RLS policies (users can only see their own rows)
- Trigger that inserts a `users` row with 5 points on new auth.users signup

After running schema, also enable Row Level Security on all tables (the SQL does it).

## Key API routes (all server-only secrets)
- `POST /api/generate` — main magic. Checks points, deducts atomically, calls Claude, logs watcher + session.
- `POST /api/stripe/create-checkout` — creates Stripe Checkout for points or subscription
- `POST /api/stripe/webhook` — the only place points or subscriptions are granted
- `GET /api/me` — current user + points (optional helper)
- Creator stats are fetched server-side inside the /creator page using service role.

## Points & monetization rules (strict)
- Signup → 5 points (trigger)
- Generation: check balance → deduct in same transaction as the Claude call. Rollback on failure.
- Top-up and subscription: ONLY credit/unlock in the webhook handler after Stripe confirms.
- Never trust the client for balance or subscription status.

## Pages implemented
- `/` — landing
- `/signup`, `/login`
- `/dashboard` — generation tool + points + past sessions
- `/topup` — buy points pack
- `/creator` — claim handle + insights (subscription gated)
- `/pricing`

## Environment variables you need
See `.env.example`. All required.

## Localhost vs Deploy (Vercel recommended, Netlify possible)

Test everything on **http://localhost:3000** first (exactly what you asked for).

Once signup → generate → top-up simulation → creator dashboard all work locally, then deploy.

**Vercel (strongly recommended):**
- Push to GitHub
- Import on vercel.com
- Add all variables from your `.env.local` in the Vercel project settings (Environment Variables)
- Deploy

**Netlify:**
- Possible but you may need to configure functions or use a separate backend for some API routes. Vercel is much smoother for this fullstack Next.js app.

The middleware deprecation warning is safe to ignore for now.

## Deploy

**Vercel (recommended for whole app)**
1. Push to GitHub
2. Import on Vercel
3. Add all the env vars from `.env.example` (except local ones)
4. Deploy
5. Set up Supabase production project (or use same)
6. Update Stripe webhook URL to your production `/api/stripe/webhook`

**Optional separate backend**
The current implementation keeps everything in Next.js API routes. If you want a pure Express/FastAPI backend on Render:
- Move the `/api/*` logic (generate, stripe, auth callbacks) into a separate Express app
- Have the Next.js frontend call your Render URL
- Share the same Supabase project

## Claude prompt details (enforced server-side)
The system prompt tells Claude to:
- Deeply analyze the provided tweets for hook patterns, sentence length/variety, tone (sarcastic, earnest, deadpan...), vocabulary sophistication, use of questions/calls to action, formatting (threads? emojis? all-caps? line breaks), pacing.
- Generate **exactly 7** brand new tweets on the requested topic.
- Each < 280 characters.
- Match the voice **without copying phrases** from the source material.
- Return ONLY a raw JSON array of strings. No markdown, no extra text.

## Development tips
- Use Stripe test cards: `4242 4242 4242 4242`
- For subscriptions in test, use the subscription product and the "Trigger a test invoice" in dashboard or CLI.
- To simulate low points, you can manually edit your row in Supabase table editor.
- The watcher_log is written on every generation regardless of whether the creator has subscribed.

## Next improvements (post-MVP)
- Add display_name / @handle on user profiles
- Masked emails in creator dashboard for lower tier
- History pagination + "re-generate similar"
- Stripe Customer Portal for managing subscription
- Rate limiting per user
- Better tweet paste parser (support copy-paste from Twitter with dates etc.)
- Public creator profiles
- Usage analytics for the user

## License / note
This is a complete functional MVP built following the exact spec you provided. All critical security (keys server-only, atomic deduction, webhook-only fulfillment) is implemented.

Enjoy studying (and being studied on) Twitter voices!
