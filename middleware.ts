import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { getIronSession } from "iron-session";

//*lib
import { SessionData, sessionOptions } from "@/lib/session";

export async function middleware(req: NextRequest) {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(
    cookieStore,
    sessionOptions
  );
  const res = NextResponse.next();

  const { pathname } = req.nextUrl;
  const nextUrl = req.nextUrl.clone();

  if (
    pathname === "/signin" ||
    pathname === "/signup" ||
    pathname === "/verifyemail" ||
    pathname === "/forgotpassword" ||
    pathname === "/resetpassword"
  ) {
    if (session.isLoggedIn) {
      nextUrl.pathname = "/";
      return NextResponse.redirect(nextUrl);
    } else return res;
  } else {
    if (session.isLoggedIn) {
      return res;
    } else {
      nextUrl.pathname = "/signin";
      nextUrl.search = `?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(nextUrl);
    }
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
