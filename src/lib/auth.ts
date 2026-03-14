import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

/**
 * Get the current authenticated user.
 * Memoized per request.
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
});

/**
 * Get the organization member record for the current user.
 * Memoized per request.
 */
export const getOrgMember = cache(async (userId: string) => {
  return prisma.organizationMember.findFirst({
    where: { userId },
    include: {
      organization: true,
    },
  });
});

/**
 * High-level helper to get the current organization, user, and member status.
 * Throws or redirects if not authenticated or no organization (optional).
 */
export async function getAuthContext(options: { redirectIfNotFound?: boolean } = {}) {
  const user = await getUser();
  
  if (!user) {
    if (options.redirectIfNotFound) redirect("/login");
    return { user: null, member: null, organization: null };
  }

  let member = null;
  try {
    member = await getOrgMember(user.id);
  } catch (error) {
    console.error("Database connection error in getAuthContext:", error);
    // In case of DB failure, we still return the user but with no organization info
    // This avoids a 500 error if the DB is temporarily down or misconfigured
    return { user, member: null, organization: null, dbError: true };
  }
  
  if (!member) {
    if (options.redirectIfNotFound) redirect("/onboarding");
    return { user, member: null, organization: null };
  }

  return {
    user,
    member,
    organization: member.organization,
  };
}
