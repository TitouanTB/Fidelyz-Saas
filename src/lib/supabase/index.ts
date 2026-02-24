export { createClient, getSupabaseBrowserClient } from "./client";
export { createClient as createServerClient, getAuthUser, getAuthSession, signOut } from "./server";
export { updateSession, getSupabaseMiddlewareClient } from "./middleware";
export type { SupabaseClient, User, Session } from "./server";
