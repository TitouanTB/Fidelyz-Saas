import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isHTTPError } from "@/lib/supabase/middleware";
import { rateLimit } from "@/lib/rate-limit";

export async function proxy(request: NextRequest) {
  // 1. Rate Limiting
  const ip = (request as any).ip ?? request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(',')[0] ?? "anonymous";
  const isApi = request.nextUrl.pathname.startsWith("/api");
  const isPublicApi = request.nextUrl.pathname.startsWith("/api/public") || request.nextUrl.pathname.startsWith("/api/health");

  // stricter limits for public APIs
  const limit = isPublicApi ? 30 : 100;
  const { success, info } = await rateLimit(`ratelimit_${ip}_${request.nextUrl.pathname}`, limit);

  if (!success && isApi) {
    return NextResponse.json(
      { error: "Too many requests", retryAfter: info.reset },
      { 
        status: 429,
        headers: {
          "X-RateLimit-Limit": info.limit.toString(),
          "X-RateLimit-Remaining": info.remaining.toString(),
          "X-RateLimit-Reset": info.reset.toString(),
        }
      }
    );
  }

  // Add security headers
  const response = NextResponse.next({
    request,
  });

  // Content Security Policy
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com;
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co https://api.stripe.com;
    frame-src https://js.stripe.com https://hooks.stripe.com;
    worker-src 'self' blob:;
  `.replace(/\s{2,}/g, ' ').trim();

  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Update session for Supabase Auth
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // This refreshes the session if needed
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) throw error;

    return response;
  } catch (error) {
    // Handle auth errors gracefully
    if (isHTTPError(error)) {
      // For auth-related errors, redirect to login with return URL
      if (error.status === 401 || error.status === 403) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
      }
    }
    
    // For other errors, continue with the response
    return response;
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
