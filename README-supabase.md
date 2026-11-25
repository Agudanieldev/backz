# Supabase setup notes

This project now uses Supabase for authentication and data (Firebase was removed).

- **Project URL:** `https://wxtzvhobhvczzejbtxrx.supabase.co`
- **Publishable key:** stored in `js/supabase.js` (safe to expose in the browser)

## Demo accounts

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | `admin@tradezanga.com` | `Admin123!` |
| User  | `demo@tradezanga.com`  | `Demo123!`  |

Change or delete these accounts before going live.

## Pages

| File              | Purpose                                      |
|-------------------|----------------------------------------------|
| `index.html`      | Login (redirects by role)                     |
| `signup.html`     | Create account                                |
| `home.html`       | User dashboard (stats, deposit/withdraw, own requests) |
| `admin.html`      | Admin dashboard (stats, approve/reject requests, users) |
| `forgotpass.html` | Send password reset email                     |
| `reset.html`      | Set a new password from the reset email       |

## Database

Three tables in the `public` schema:

- **`profiles`** – one row per auth user (name, role, balances, plan).
- **`transactions`** – deposit/withdraw requests with a `pending` / `approved` / `rejected` status.
- **`contact_messages`** – messages sent from the marketing site contact form.

A trigger (`handle_new_user`) creates the profile automatically when someone signs up.

Security is enforced with RLS:

- Users can only read their own profile and requests.
- Users can only create pending requests for themselves.
- Anyone can submit a contact message, but only admins can read them.
- Admins can read everyone.
- Approving a request goes through the `review_transaction` function, which checks the admin role server-side and updates balances.

### Make another user an admin

```sql
update public.profiles
   set role = 'admin'
 where email = 'someone@example.com';
```

## Supabase dashboard settings

1. **Authentication → URL Configuration**
   - Set the Site URL to your production URL.
   - Add your `/reset.html` URL to the allowed Redirect URLs.
2. **Email confirmation** is currently enabled. New users must confirm their email before they can log in.
3. **Authentication → Password Security**: enable "Leaked password protection" (Supabase currently reports it as disabled).
4. The demo accounts above were created already-confirmed so you can log in immediately.
5. Supabase's built-in email sender is heavily rate-limited (a few emails per hour). Configure custom SMTP for production, or temporarily disable "Confirm email" while testing signups.

## Local preview

Any static server works, for example:

```powershell
python -m http.server 8123
```

Then open `http://127.0.0.1:8123/index.html`.

## Centralized auth URLs

Auth lives only on the app domain now:

- Login: `https://app.tradezanga.com/index.html`
- Signup: `https://app.tradezanga.com/signup.html`

The marketing site (`frontz`) and the Infinite Shares site (`infinite`) redirect their login/signup links to these URLs.
