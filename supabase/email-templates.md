# Auth email templates

Custom HTML templates for Supabase Auth:

- `templates/confirmation.html` — confirm signup
- `templates/recovery.html` — reset password

Both templates link directly to:

```
https://app.tradezanga.com/auth/confirm?token_hash=...&type=...&next=...
```

The app verifies the token on `/auth/confirm` and then redirects to the
dashboard or reset-password page. This does not depend on Supabase's Site URL
or redirect allow list, so emails no longer fall back to `localhost:3000`.

The committed templates use the canonical `https://app.tradezanga.com` domain.
`npm run emails:push` rewrites those links to the `SITE_URL` of the deployment
it is pushing for (`APP_URL` → `VITE_APP_URL` → the canonical domain), so the
same templates work on a Vercel domain.

The hosted project Site URL should be the production URL:

```
https://app.tradezanga.com
```

## Apply with the Management API

1. Create a scoped personal access token:
   https://supabase.com/dashboard/account/tokens
2. Put it in `.env` (or export it), then run:

```bash
npm run emails:push
```

The script loads `.env` automatically. To push for a different domain:

```bash
APP_URL=https://your-project.vercel.app npm run emails:push
```

This updates the confirmation and recovery templates, sets the Site URL, and
merges the production, Vercel preview and local development URLs into the
redirect allow list.

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
