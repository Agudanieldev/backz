// Canonical public URL used in auth redirects. Set VITE_APP_URL only when you
// need to force one domain (e.g. production must always be
// https://app.tradezanga.com). Otherwise the current origin is used, which
// makes Vercel preview deployments and custom domains work automatically.
const configured = import.meta.env.VITE_APP_URL?.trim();

const fallback =
  typeof window !== "undefined"
    ? window.location.origin
    : "http://localhost:5173";

export const APP_URL = (configured || fallback).replace(/\/+$/, "");

export function appUrl(path: string) {
  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
