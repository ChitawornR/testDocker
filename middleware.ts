import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

interface JwtPayload {
  id: number;
  email: string;
  role: "user" | "admin";
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const JWT_SECRET = process.env.JWT_SECRET;

  const protectedPaths = [
    "/dashboard",
    "/admin",
    "/api/users/me",
    "/api/admin",
  ];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (token && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    // In a real application, you might want to redirect to an error page or show a generic error
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }


  try {
    // jose ต้องใช้ Uint8Array
    const secretKey = new TextEncoder().encode(JWT_SECRET);

    // ต้อง await
    const { payload } = await jwtVerify(token, secretKey);

    const decoded = payload as unknown as JwtPayload;
    // const decoded = jwtVerify(token, JWT_SECRET) as JwtPayload;

    // Attach user info to the request for API routes if needed,
    // though for pages you'd typically refetch or pass props.
    // This example focuses on protecting the route.
    const response = NextResponse.next();
    // You could set headers here if you want to pass info to API routes in Next.js
    // For pages, you would fetch user data on the page itself.
    response.headers.set("x-user-id", decoded.id.toString());
    response.headers.set("x-user-role", decoded.role);
    response.headers.set("x-user-email", decoded.email);

    // Role-based access control
    if (
      request.nextUrl.pathname.startsWith("/admin") &&
      decoded.role !== "admin"
    ) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return response;
  } catch (error) {
    console.error("Token verification failed:", error);
    // If token is invalid or expired, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/api/users/me/:path*",
    "/api/admin/:path*",
    "/login",
  ],
};
