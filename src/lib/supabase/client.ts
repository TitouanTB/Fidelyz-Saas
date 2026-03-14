import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

export type { SupabaseClient };

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    if (process.env.NODE_ENV === "production" && !process.env.VERCEL) {
      console.warn("Missing Supabase environment variables");
    }
    // Return a dummy client during build/dev if variables are missing
    return createBrowserClient(
      url || "https://mock.supabase.co",
      key || "mock-key"
    );
  }

  return createBrowserClient(url, key);
}

let client: ReturnType<typeof createClient> | undefined;

export function getSupabaseBrowserClient() {
  if (client) {
    return client;
  }
  client = createClient();
  return client;
}
