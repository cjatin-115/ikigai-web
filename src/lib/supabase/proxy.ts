import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Session refresh and request interception utility.
 * Reads cookies from the incoming Next.js request, creates an isolated server Supabase client,
 * invokes supabase.auth.getUser() to validate and refresh authentication tokens,
 * and passes any modified Set-Cookie headers into the returned response.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do NOT use getSession() for server-side security decisions.
  // Use getClaims() for server-side session verification and refresh.
  // getClaims() validates the JWT expiration and claims integrity, while triggering
  // token refresh and cookie updating via @supabase/ssr setAll when needed.
  const { data: claimsData } = await supabase.auth.getClaims();
  const hasValidSession = Boolean(claimsData?.claims);

  const url = request.nextUrl.clone();
  const isDashboardRoute = url.pathname.startsWith("/dashboard");
  const isLoginRoute = url.pathname === "/login";

  // Unauthenticated access to protected routes -> redirect to /login
  if (isDashboardRoute && !hasValidSession) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // Authenticated access to login page -> redirect to /dashboard
  if (isLoginRoute && hasValidSession) {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}
