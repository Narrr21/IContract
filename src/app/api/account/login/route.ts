import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  // Perform login logic here

  return NextResponse.json({ message: "Login successful" });
}