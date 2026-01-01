import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  // Debug: log cookie header and pathname to help diagnose missing token
  const cookieHeader = req.headers.get("cookie") || "";
  const token = req.cookies.get("token")?.value;
  console.log("[middleware] path=", req.nextUrl.pathname, "cookieHeader=", cookieHeader, "token=", token);

  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/teacher-dashboard",
    "/student-dashboard",
    "/auth/forgot-password",
    "/login",
    "/register",
    "/forgot-password",
    "/dashboard",
    "/dashboard/students", 
    "/dashboard/classes", 
    "/dashboard/teachers", 
    "/dashboard/attendance", 
    "/dashboard/fees", 
    "/dashboard/timetable", 
    "/dashboard/exams", 
    "/dashboard/notifications", 
    "/dashboard/events", 
    "/dashboard/transport/routes", 
    "/dashboard/meal-plan", 
    "/dashboard/settings", 
    "/dashboard/gallery", 
    "/dashboard/log-activity",
    "/students",
    "/teachers",
    "/attendance",
    "/fees",
    "/timetable",
    "/exams",
    "/notifications"// TEMP: for testing if middleware is the blocker
  ];

  if (publicRoutes.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }

  if (!token) {
    console.log("[middleware] no token - redirecting to /auth/login");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!);
    return NextResponse.next();
  } catch (err) {
    console.log("[middleware] token verify failed", err);
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/teacher-dashboard/:path*",
    "/student-dashboard/:path*",
    "/parent-dashboard/:path*",
    "/students/:path*",
    "/teachers/:path*",
    "/attendance/:path*",
    "/fees/:path*",
    "/timetable/:path*",
    "/exams/:path*",
    "/notifications/:path*",
    "/events/:path*",
    "/transport/:path*",
    "/meal-plan/:path*",
    "/gallery/:path*",
    "/parent-portal/:path*",
    "/settings/:path*",
  ],
};
