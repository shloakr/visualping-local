import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { randomBytes } from "crypto";

// POST /api/verify - Send verification email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Look up the user's existing trackers to get their Resend key
    const { data: trackers } = await supabase
      .from("tracked_urls")
      .select("resend_api_key")
      .eq("email", email)
      .eq("is_active", true)
      .limit(1);

    if (!trackers || trackers.length === 0) {
      return NextResponse.json(
        { error: "No trackers found for this email. Create a tracker first." },
        { status: 404 }
      );
    }

    const resendApiKey = trackers[0].resend_api_key;

    if (!resendApiKey) {
      return NextResponse.json(
        { error: "No Resend API key found for your account" },
        { status: 400 }
      );
    }

    // Generate a secure token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store the token
    const { error: tokenError } = await supabase.from("email_tokens").insert({
      email,
      token,
      expires_at: expiresAt.toISOString(),
    });

    if (tokenError) {
      console.error("Error creating token:", tokenError);
      return NextResponse.json(
        { error: "Failed to create verification token" },
        { status: 500 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const verifyUrl = `${appUrl}/manage?email=${encodeURIComponent(email)}&token=${token}`;

    // Send verification email using the user's saved Resend key
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: "UCLA Class Tracker <onboarding@resend.dev>",
          to: [email],
          subject: "Verify your email - UCLA Class Tracker",
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #2774AE;">UCLA Class Tracker</h2>
              <p>Click the link below to verify your email and manage your trackers:</p>
              <p style="margin: 20px 0;">
                <a href="${verifyUrl}" style="background-color: #2774AE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                  Manage My Trackers
                </a>
              </p>
              <p style="color: #666; font-size: 14px;">
                Or copy this link: <br/>
                <a href="${verifyUrl}" style="color: #2774AE;">${verifyUrl}</a>
              </p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                This link expires in 24 hours. If you didn't request this, you can ignore this email.
              </p>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Resend error:", error);
        return NextResponse.json(
          { error: "Failed to send verification email. Please check your Resend API key." },
          { status: 400 }
        );
      }

      return NextResponse.json({
        message: "Verification email sent! Check your inbox.",
        emailSent: true,
      });
    } catch (emailError) {
      console.error("Email error:", emailError);
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
