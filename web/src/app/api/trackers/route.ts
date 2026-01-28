import { NextRequest, NextResponse } from "next/server";
import { createServerClient, parseUclaUrl } from "@/lib/supabase";

// GET /api/trackers?email=xxx - Get all trackers for an email
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerClient();

    // If token provided, verify it first
    if (token) {
      const { data: tokenData, error: tokenError } = await supabase
        .from("email_tokens")
        .select("*")
        .eq("token", token)
        .eq("email", email)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .single();

      if (tokenError || !tokenData) {
        return NextResponse.json(
          { error: "Invalid or expired token" },
          { status: 401 }
        );
      }

      // Mark token as used
      await supabase
        .from("email_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", tokenData.id);
    }

    // Get trackers for this email
    const { data: trackers, error } = await supabase
      .from("tracked_urls")
      .select("id, email, ucla_url, class_name, term_code, subject_area, catalog_number, selector, check_interval, expires_at, last_checked_at, last_change_at, is_active, created_at")
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching trackers:", error);
      return NextResponse.json(
        { error: "Failed to fetch trackers" },
        { status: 500 }
      );
    }

    return NextResponse.json({ trackers });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/trackers - Create a new tracker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      resendApiKey,
      uclaUrl,
      className,
      termCode,
      subjectArea,
      catalogNumber,
      checkInterval = "hourly",
      expiresAt,
    } = body;

    // Validation
    if (!email || !uclaUrl || !resendApiKey || !expiresAt) {
      return NextResponse.json(
        { error: "Email, UCLA URL, Resend API key, and end date are required" },
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

    // Validate Resend API key format
    if (!resendApiKey.startsWith("re_")) {
      return NextResponse.json(
        { error: "Invalid Resend API key format - should start with 're_'" },
        { status: 400 }
      );
    }

    // Validate the Resend API key by making a test request
    try {
      const resendResponse = await fetch("https://api.resend.com/domains", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!resendResponse.ok) {
        const errorData = await resendResponse.json().catch(() => ({}));
        console.error("Resend API error:", errorData);
        
        // Check for invalid API key errors (400, 401, 403)
        if (resendResponse.status === 400 || resendResponse.status === 401 || resendResponse.status === 403) {
          const errorMessage = errorData.message || "Invalid API key";
          return NextResponse.json(
            { error: `Invalid Resend API key: ${errorMessage}` },
            { status: 400 }
          );
        }
      }
    } catch (resendError) {
      console.error("Error validating Resend key:", resendError);
      return NextResponse.json(
        { error: "Could not validate Resend API key - please try again" },
        { status: 400 }
      );
    }

    // Validate UCLA URL
    const parsed = parseUclaUrl(uclaUrl);
    if (!parsed) {
      return NextResponse.json(
        { error: "Invalid UCLA class URL" },
        { status: 400 }
      );
    }

    // Validate check interval
    if (!["hourly", "6hours", "daily"].includes(checkInterval)) {
      return NextResponse.json(
        { error: "Invalid check interval" },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // Check if this URL is already being tracked by this email
    const { data: existing } = await supabase
      .from("tracked_urls")
      .select("id")
      .eq("email", email)
      .eq("ucla_url", uclaUrl)
      .eq("is_active", true)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "You are already tracking this class" },
        { status: 409 }
      );
    }

    // Create the tracker
    const { data: tracker, error } = await supabase
      .from("tracked_urls")
      .insert({
        email,
        resend_api_key: resendApiKey,
        ucla_url: uclaUrl,
        class_name: className || `${subjectArea} ${catalogNumber}`.trim(),
        term_code: termCode || parsed.termCode,
        subject_area: subjectArea || parsed.subjectArea,
        catalog_number: catalogNumber || parsed.catalogNumber,
        check_interval: checkInterval,
        expires_at: expiresAt || null,
        is_active: true,
      })
      .select("id, class_name, created_at")
      .single();

    if (error) {
      console.error("Error creating tracker:", error);
      return NextResponse.json(
        { error: "Failed to create tracker" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        message: "Tracker created successfully",
        tracker 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/trackers?id=xxx&email=xxx - Delete a tracker
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  const email = searchParams.get("email");

  if (!id || !email) {
    return NextResponse.json(
      { error: "Tracker ID and email are required" },
      { status: 400 }
    );
  }

  try {
    const supabase = createServerClient();

    // Soft delete - set is_active to false
    const { error } = await supabase
      .from("tracked_urls")
      .update({ is_active: false })
      .eq("id", id)
      .eq("email", email);

    if (error) {
      console.error("Error deleting tracker:", error);
      return NextResponse.json(
        { error: "Failed to delete tracker" },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: "Tracker deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
