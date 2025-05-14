import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";

//*lib
import { SessionData, sessionOptions } from "@/lib/session";

// Middleware function to handle requests
export async function middleware(req: NextRequest) {
  // Get cookies and session data
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  const res = NextResponse.next();

  // Extract pathname from the request URL
  const { pathname } = req.nextUrl;
  const nextUrl = req.nextUrl.clone();

  // Check if the request is for an authentication-related route
  if (
    [
      "/admin/signin",
      "/admin/forgotpassword",
      "/admin/signup",
      "/signin",
      "/signup",
      "/verifyemail",
      "/forgotpassword",
      "/resetpassword",
      "/api/auth/forgotPassword",
      "/api/auth/resendVerification",
      "/api/auth/resetPassword",
      "/api/auth/signIn",
      "/api/auth/signUp",
      "/api/auth/verifyEmail",
      "/payment",
    ].includes(pathname)
  ) {
    // Redirect logged-in users away from auth routes
    if (session.isLoggedIn) {
      if (pathname === "/admin/signin") {
        if (session.role === "USER") {
          nextUrl.pathname = "/unauthorized";
          return NextResponse.redirect(nextUrl);
        } else {
          nextUrl.pathname = "/admin";
          return NextResponse.redirect(nextUrl);
        }
      } else {
        nextUrl.pathname = "/";
        return NextResponse.redirect(nextUrl);
      }
    } else return res;
  } else {
    // Handle non-auth routes
    if (session.isLoggedIn) {
      // Restrict access to admin routes for non-admin users
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        if (session.role === "USER") {
          nextUrl.pathname = "/unauthorized";
          return NextResponse.redirect(nextUrl);
        } else return res;
      } else return res;
    } else {
      if (pathname === "/admin") {
        nextUrl.pathname = "/admin/signin";
        nextUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(nextUrl);
      }
      // Redirect non-logged-in users to the sign-in page
      else {
        nextUrl.pathname = "/signin";
        nextUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
        return NextResponse.redirect(nextUrl);
      }
    }
  }
}

// Configuration for the middleware matcher
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|image).*)",
  ],
};
