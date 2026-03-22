import { NextResponse } from "next/server";

export async function POST() {
    try {
        const response = NextResponse.json(
            { success: true, message: "Logged out successfully" },
            { status: 200 }
        );

        // Clear the auth token cookie
        response.cookies.set("token", "", {
            httpOnly: true,
            expires: new Date(0), // Set expiration to the past
            path: "/",
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
        });

        return response;
    } catch (error) {
        console.error("[Logout API Error]", error);
        return NextResponse.json(
            { success: false, error: "Failed to logout" },
            { status: 500 }
        );
    }
}
