// Canonical public URL used in auth redirects. Auth emails must always send
// users to the production app, so the default is https://app.tradezanga.com
// rather than the current origin (which may be localhost or a preview deploy).
// Set VITE_APP_URL to override it when testing auth emails on another origin.
const configured = import.meta.env.VITE_APP_URL?.trim();

const fallback = "https://app.tradezanga.com";

export const APP_URL = (configured || fallback).replace(/\/+$/, "");

export function appUrl(path: string) {
  return `${APP_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
