import { NextResponse } from "next/server";
import {
  sendExpiryNotifications,
  autoExpireContracts,
} from "@/lib/contractExpiryNotifier";

// Manual trigger endpoint (protect in production via secret header or similar)
export async function GET() {
  try {
    const result = await sendExpiryNotifications();
    const expired = await autoExpireContracts();
    return NextResponse.json({ ok: true, ...result, ...expired });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
