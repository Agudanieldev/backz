import { createClient } from "@supabase/supabase-js";
import type { Profile } from "./types";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error(
    "Supabase is not configured. Copy .env.example to .env and set " +
      "VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY, or add them to " +
      "your Vercel project's environment variables.",
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Could not load profile:", error.message);
    return null;
  }

  return data as Profile;
}
