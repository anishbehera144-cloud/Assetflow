import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "assetflow_session";

const secretValue = process.env.AUTH_SECRET;

function getSecret() {
  if (!secretValue) {
    throw new Error("AUTH_SECRET is not configured.");
  }

  return new TextEncoder().encode(secretValue);
}

const publicPaths = ["/login"];

const protectedPrefixes = [
  "/dashboard",
  "/assets",
  "/employees",
  "/allocations",
  "/return-requests",
  "/maintenance",
  "/licenses", 
  "/reports",
  "/audit",
  "/settings",
];

function isPublicPath(pathname: string) {
  return publicPaths.some(
    (path) =>
      pathname === path ||
      pathname.startsWith(`${path}/`)
  );
}

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) =>
      pathname === prefix ||
      pathname.startsWith(`${prefix}/`)
  );
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;

  let authenticated = false;

  if (token) {
    try {
      await jwtVerify(token, getSecret());
      authenticated = true;
    } catch {
      authenticated = false;
    }
  }

  if (isProtectedPath(pathname) && !authenticated) {
    const loginUrl = new URL("/login", request.url);

    loginUrl.searchParams.set(
      "callbackUrl",
      pathname
    );

    return NextResponse.redirect(loginUrl);
  }

  if (isPublicPath(pathname) && authenticated) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/assets/:path*",
    "/employees/:path*",
    "/allocations/:path*",
    "/return-requests/:path*",
    "/maintenance/:path*",
    "/licenses/:path*",
    "/reports/:path*",
    "/audit/:path*",
    "/settings/:path*",
  ],
};