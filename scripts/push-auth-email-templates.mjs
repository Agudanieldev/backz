import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { parseEnv } from "node:util";

// Load local env files so `npm run emails:push` picks up `.env` without extra
// shell flags. Real shell/CI variables always win; `.env.local` beats `.env`.
for (const file of [".env.local", ".env"]) {
  if (!existsSync(file)) continue;
  for (const [key, value] of Object.entries(parseEnv(readFileSync(file, "utf8")))) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

const API_BASE = "https://api.supabase.com/v1";
const SITE_URL = (
  process.env.APP_URL ??
  process.env.VITE_APP_URL ??
  "https://app.tradezanga.com"
).replace(/\/+$/, "");
const SUPABASE_URL =
  process.env.SUPABASE_URL ??
  process.env.VITE_SUPABASE_URL ??
  "https://wxtzvhobhvczzejbtxrx.supabase.co";
const PROJECT_REF =
  process.env.SUPABASE_PROJECT_REF ??
  new URL(SUPABASE_URL).hostname.split(".")[0];
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

const REDIRECT_URLS = [
  `${SITE_URL}/**`,
  "https://*.vercel.app/**",
  "http://localhost:5173/**",
  "http://127.0.0.1:5173/**",
  "http://localhost:3000/**",
];

if (!ACCESS_TOKEN) {
  console.error(
    "Missing SUPABASE_ACCESS_TOKEN.\n" +
      "Create a scoped token at https://supabase.com/dashboard/account/tokens,\n" +
      "add it to .env (or export it), then run:\n" +
      "  npm run emails:push",
  );
  process.exit(1);
}

const templateDir = join(process.cwd(), "supabase/templates");

// The templates are committed with the canonical domain; rewrite them to the
// SITE_URL in use so a Vercel deployment on another domain still works.
function render(file) {
  return readFile(join(templateDir, file), "utf8").then((html) =>
    html.replaceAll("https://app.tradezanga.com", SITE_URL),
  );
}

const confirmation = await render("confirmation.html");
const recovery = await render("recovery.html");
const emailChange = await render("email-change.html");
const invite = await render("invite.html");
const magicLink = await render("magic-link.html");

async function api(path, init = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase API ${response.status}: ${body}`);
  }

  return body ? JSON.parse(body) : null;
}

const current = await api(`/projects/${PROJECT_REF}/config/auth`);
const existingRedirects = String(current?.uri_allow_list ?? "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const redirects = Array.from(new Set([...existingRedirects, ...REDIRECT_URLS]));

await api(`/projects/${PROJECT_REF}/config/auth`, {
  method: "PATCH",
  body: JSON.stringify({
    site_url: SITE_URL,
    uri_allow_list: redirects.join(","),
    mailer_subjects_confirmation: "Confirm your TradeZanga account",
    mailer_templates_confirmation_content: confirmation,
    mailer_subjects_recovery: "Reset your TradeZanga password",
    mailer_templates_recovery_content: recovery,
    mailer_subjects_email_change: "Confirm your new TradeZanga email address",
    mailer_templates_email_change_content: emailChange,
    mailer_subjects_invite: "You're invited to TradeZanga",
    mailer_templates_invite_content: invite,
    mailer_subjects_magic_link: "Your TradeZanga sign-in link",
    mailer_templates_magic_link_content: magicLink,
  }),
});

console.log(`Updated auth emails for ${PROJECT_REF}.`);
console.log(`Site URL: ${SITE_URL}`);
console.log(`Allowed redirects: ${redirects.join(", ")}`);
