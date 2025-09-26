import { NextResponse } from "next/server";
import { sendExpiryNotifications } from "@/lib/contractExpiryNotifier";

// Manual trigger endpoint (protect in production via secret header or similar)
export async function GET() {
  try {
    const result = await sendExpiryNotifications();
    return NextResponse.json({ ok: true, ...result });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
