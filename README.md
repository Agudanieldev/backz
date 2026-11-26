# backz — TradeZanga client portal

React + TypeScript + Tailwind rewrite of the original static TradeZanga app.

- **Stack:** Vite, React 19, React Router, Tailwind CSS v4, Supabase JS
- **Design system:** tokens and components adapted from `kove-main`, using the TradeZanga green (`#26ba5e`) as primary
- **Navigation:** desktop sidebar, mobile bottom tab bar
- **Tables:** TanStack Table (user list pagination)
- **Forms:** custom portalled select dropdown, debounced search
- **Legacy site:** the original HTML/CSS/JS lives in `legacy/` for reference

## Pages

| Route              | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `/login`           | Sign in (redirects admins to `/admin`, users to `/dashboard`)   |
| `/signup`          | Create an account                                              |
| `/forgot-password` | Send a password reset email                                    |
| `/reset-password`  | Set a new password from the emailed link                       |
| `/dashboard`       | Balances, deposit/withdrawal requests, request history         |
| `/invest`          | Real estate and digital packages (tabbed)                      |
| `/tools`           | Forex / Crypto / Stocks widgets (tabbed)                       |
| `/admin`           | Admin only: aggregates, pending requests, contact messages     |
| `/admin/users`     | Admin only: paginated user list with editable balances         |
| `/profile`         | Both roles: name, email, password, theme preference, log out   |

`/forex`, `/crypto` and `/stocks` redirect to the matching tab on `/tools`.

Any other path renders the 404 page.

Admins do not see the market tools or investment packages; those routes
redirect to the admin panel. The admin panel shows totals across all users
(balance, deposits, profit, properties). The sidebar and mobile tab bar are
role-aware: users get Home / Invest / Tools / Profile, admins get Admin /
Users / Profile.

## Theme

Light and dark themes are supported. The toggle lives on the Profile page for
both roles. The choice is saved in `localStorage`, applied before paint, and
TradingView embeds switch their palette with the app theme.

## User management (admin)

`/admin/users` lists every user with pagination, debounced search and the
custom select dropdown (TanStack Table).
Selecting a row opens a modal where an admin can edit:

- active deposit
- profit
- total balance
- investment plan
- properties owned

Saves go straight to `profiles` (the existing "Admins can update profiles" RLS
policy covers this). Success notices include the user's name.

## Development

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run typecheck   # tsc --noEmit
npm run build       # typecheck + production build into dist/
npm run preview     # preview the production build
```

## Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_..."
```

Only publishable (browser-safe) keys belong in `VITE_*` variables. Anything
without the `VITE_` prefix stays server-side and is never bundled into the
client. `.env` is gitignored — never commit it.

`VITE_APP_URL` is optional. When unset, auth redirects use the current origin,
so the production domain, Vercel preview deployments and localhost all work
without changes. Set it only when you need to force one canonical URL.

## Language and support chat

The dashboard includes the same Google Translate and Tawk.to integrations as
the legacy site:

- **Google Translate** is controlled by the language picker in the desktop
  sidebar, mobile header and auth screens. The choice is stored in
  `localStorage` and in the `googtrans` cookie. On `tradezanga.com` and its
  subdomains the cookie is scoped to `.tradezanga.com`, so the language picked
  on the marketing site carries over to `app.tradezanga.com` (and back).
  `?lang=fr` is also honoured on first load. Google's injected banner and
  tooltip chrome are hidden; the app's own picker remains the only control.
- **Tawk.to** loads the legacy property
  (`683623d24a34301911ec75e0/1is9nnrs7`) once per session. Override it with
  `VITE_TAWK_EMBED_URL`, or set that variable to `off` to disable chat. If the
  bubble is missing on a preview/localhost origin, check the property's allowed
  domains in the Tawk dashboard. On authenticated mobile screens Tawk's floating
  bubble is hidden; the customer-care icon in the bottom navigation opens the
  chat instead. Auth screens keep the bubble.

## Installable app (PWA)

The portal is installable as a standalone app:

- `public/manifest.webmanifest` defines the name, icons, theme colours, start
  URL and app shortcuts.
- `public/sw.js` caches the app shell for offline launch; it is registered only
  in production builds.
- A dismissible **Install TradeZanga** banner appears in the signed-in shell
  when the browser offers installation. On desktop it sits in the sidebar
  footer; on mobile it appears above the page content. The Profile page also
  has a persistent install card.
- iOS browsers get Add to Home Screen instructions instead of the native
  install prompt.

App icons live in `public/icons/` (`icon-192.png`, `icon-512.png`,
`apple-touch-icon.png` and `icon-32.png`) and use the main TradeZanga mark.

## Supabase settings

The reset flow redirects to `/reset-password`. In
**Authentication → URL Configuration**, keep the Site URL pointed at the
production domain and add the redirect URLs:

```
https://app.tradezanga.com/**
https://*.vercel.app/**
http://localhost:5173/**
http://127.0.0.1:5173/**
```

Custom signup and password-reset emails live in `supabase/templates/`. Apply
them with a scoped personal access token (set `SUPABASE_ACCESS_TOKEN` in
`.env`):

```bash
npm run emails:push
```

The script reads `.env` automatically, updates the Site URL, merges the
redirect allow list (including Vercel previews) and rewrites the template links
to the current `SITE_URL`. See `supabase/email-templates.md` for the manual
dashboard steps as well.

Data access is unchanged: `profiles`, `transactions`, `contact_messages`, and
the `review_transaction` RPC, all guarded by the existing RLS policies. See
`legacy/README-supabase.md` for the original schema notes.

## Deploying to Vercel

The app is a single-page app: every route (`/login`, `/dashboard`,
`/admin/users`, …) must serve `index.html`, which `vercel.json` handles with a
catch-all rewrite. No `404.html` or `CNAME` file is needed.

1. Import the repository at <https://vercel.com/new>. Vercel detects Vite; the
   build command (`npm run build`) and output directory (`dist`) are already
   pinned in `vercel.json`.
2. Add the environment variables for **Production**, **Preview** and
   **Development** under Project → Settings → Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_APP_URL` (optional, only to force a canonical URL)
3. Deploy. Then add the custom domain under Project → Domains and point DNS at
   Vercel (`A 76.76.21.21` for the apex, or
   `CNAME cname.vercel-dns.com` for a subdomain). Remove the old GitHub Pages
   DNS records so nothing still points at Pages.
4. After the domain resolves, update Supabase to allow it:

   ```bash
   APP_URL=https://app.tradezanga.com npm run emails:push
   ```

Vercel can also be driven from the CLI (`vercel` / `vercel --prod`). The
`.vercel` link directory is gitignored.

`npm run build` writes the static site to `dist/`; serving that folder from any
SPA-aware host works too.


## Notes

- Icons come from `lucide-react`; there is no icon font dependency.
- TradingView embeds load client-side and keep the original widget configs.
  The Forex page chart now opens on `FX:EURUSD` instead of `NASDAQ:AAPL`.
- Auth session restoration is role-aware: `/admin` waits for the profile before
  deciding access.
