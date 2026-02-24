import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/dashboard";

  // Handle OAuth callback with code
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error) {
      // For OAuth logins, check if user needs onboarding
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Check if user has an organization (onboarding completed)
        const { data: memberships } = await supabase
          .from("organization_members")
          .select("id")
          .eq("userId", user.id)
          .limit(1);

        const redirectPath = memberships && memberships.length > 0 ? next : "/onboarding";
        return NextResponse.redirect(`${origin}${redirectPath}`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Handle magic link or email verification with token_hash
  if (token_hash && type) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "signup" | "email_change" | "recovery" | "magiclink",
    });

    if (!error) {
      // Redirect to appropriate page based on type
      let redirectPath = next;
      
      if (type === "recovery") {
        redirectPath = "/reset-password";
      } else if (type === "signup") {
        // Check if user needs onboarding
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: memberships } = await supabase
            .from("organization_members")
            .select("id")
            .eq("userId", user.id)
            .limit(1);
          
          redirectPath = memberships && memberships.length > 0 ? "/dashboard" : "/onboarding";
        }
      }

      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  // If we get here, something went wrong
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}