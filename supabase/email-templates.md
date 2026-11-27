# Auth email templates

Supabase stores the **live** email copy in the hosted project
(**Authentication → Email Templates**). The HTML files here are versioned
source copies. `npm run emails:push` copies them from this repo into Supabase
through the Management API. If you edit the copy directly in the Supabase
dashboard, you never need a token — the files here are just a backup.

Custom HTML templates for Supabase Auth:

- `templates/confirmation.html` — confirm signup
- `templates/recovery.html` — reset password
- `templates/email-change.html` — confirm a new email address
- `templates/invite.html` — accept an invitation
- `templates/magic-link.html` — passwordless sign-in link

All templates link directly to:

```
https://app.tradezanga.com/auth/confirm?token_hash=...&type=...&next=...
```

The app verifies the token on `/auth/confirm` and then redirects to the
dashboard, profile or reset-password page. This does not depend on Supabase's
Site URL or redirect allow list, so emails never fall back to `localhost`.

The committed templates use the canonical `https://app.tradezanga.com` domain.
`npm run emails:push` rewrites those links to the `SITE_URL` of the deployment
it is pushing for (`APP_URL` → `VITE_APP_URL` → the canonical domain), so the
same templates work on a Vercel domain.

The hosted project Site URL should be the production URL:

```
https://app.tradezanga.com
```

## Apply with the Management API

1. Create a **scoped** personal access token at
   https://supabase.com/dashboard/account/tokens. Grant **Auth Config:
   Read-write** *and* **Project Settings: Read-write** for this project. The
   Management API rejects the auth-config update with
   `Missing required permission(s): project_admin_write` unless both are
   present. Choose a 1-year or no-expiry token if you want to reuse it, or a
   24-hour token for a one-time push.
2. Put it in `.env` (or export it), then run:

```bash
npm run emails:push
```

The token is only needed for this push. It is not used to send emails and can
be removed from `.env` afterwards.

The script loads `.env` automatically. To push for a different domain:

```bash
APP_URL=https://your-project.vercel.app npm run emails:push
```

This updates the confirmation, recovery, email-change, invite and magic-link
templates, sets the Site URL, and merges the production, Vercel preview and
local development URLs into the redirect allow list.

## Apply from GitHub Actions

`.github/workflows/push-auth-emails.yml` runs the same script from GitHub, so no
token is needed on your machine:

1. Create a scoped token as described above.
2. In GitHub, open **Settings → Secrets and variables → Actions** and add a
   repository secret named `SUPABASE_ACCESS_TOKEN`.
3. Open the **Actions** tab, select **Push auth email templates**, and click
   **Run workflow**.

The workflow pushes for `https://app.tradezanga.com` by default. The token is
only used inside that workflow run; it is never exposed to the built site.

## Apply manually

In the Supabase dashboard, open **Authentication → Email Templates**:

### Confirm sign up

Subject:

```
Confirm your TradeZanga account
```

Body: paste `templates/confirmation.html`.

### Reset password

Subject:

```
Reset your TradeZanga password
```

Body: paste `templates/recovery.html`.

### Change email address

Subject:

```
Confirm your new TradeZanga email address
```

Body: paste `templates/email-change.html`.

### Invite user

Subject:

```
You're invited to TradeZanga
```

Body: paste `templates/invite.html`.

### Magic link

Subject:

```
Your TradeZanga sign-in link
```

Body: paste `templates/magic-link.html`.

Then open **Authentication → URL Configuration** and set:

- Site URL: `https://app.tradezanga.com`
- Redirect URLs:
  - `https://app.tradezanga.com/**`
  - `https://*.vercel.app/**` (preview deployments)
  - `http://localhost:5173/**`
  - `http://127.0.0.1:5173/**`
  - `http://localhost:3000/**` (only needed if you run the app on port 3000)

The templates live in the hosted Supabase project, not in the SPA bundle, so
they must be applied once per Supabase project.
