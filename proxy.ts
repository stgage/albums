import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionToken =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  const isAuthenticated = !!sessionToken;

  // Public auth pages — always accessible
  const isPublicAuthPage =
    pathname === "/login" || pathname === "/register";

  // Routes requiring any login
  const isProtectedRoute =
    pathname.startsWith("/my/") ||
    pathname.startsWith("/settings");

  // Routes requiring admin
  const isAdminRoute =
    pathname.startsWith("/admin") && pathname !== "/admin/login";

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAdminRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Note: isAdmin enforcement for admin routes is done in the layout itself,
  // since we can't read DB-level isAdmin from the cookie here.

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/my/:path*", "/settings"],
};
