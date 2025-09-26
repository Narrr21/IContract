import { NextRequest, NextResponse } from "next/server";

const PDFFILLER_CONFIG = {
  apiUrl: "https://api.pdffiller.com/v2",
  clientId: process.env.PDFFILLER_CLIENT_ID,
  clientSecret: process.env.PDFFILLER_CLIENT_SECRET,
};

// Handle OAuth callback from PDFfiller
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const error = url.searchParams.get("error");

    if (error) {
      return NextResponse.redirect(
        new URL(`/error?message=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: "Authorization code not provided" },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      `${PDFFILLER_CONFIG.apiUrl}/oauth/token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: PDFFILLER_CONFIG.clientId || "",
          client_secret: PDFFILLER_CONFIG.clientSecret || "",
          code: code,
          redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/pdffiller/callback`,
        }),
      }
    );

    if (!tokenResponse.ok) {
      throw new Error(`Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    // Store the access token (you might want to save this in a database)
    // For now, we'll redirect with the token
    return NextResponse.redirect(
      new URL(`/pdffiller-success?token=${tokenData.access_token}`, request.url)
    );
  } catch (error) {
    console.error("OAuth callback error:", error);
    return NextResponse.redirect(
      new URL(
        `/error?message=${encodeURIComponent("OAuth callback failed")}`,
        request.url
      )
    );
  }
}
