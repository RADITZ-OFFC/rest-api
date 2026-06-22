import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const protectedUserRoutes = ["/dashboard", "/orders"];
const protectedAdminRoutes = ["/admin"];
const authRoutes = ["/login", "/register"];

async function verifyTokenEdge(token) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("auth_token")?.value;
  const user = token ? await verifyTokenEdge(token) : null;

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (user) {
      const redirectUrl = user.role === "admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.next();
  }

  if (protectedAdminRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (protectedUserRoutes.some((route) => pathname.startsWith(route))) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
