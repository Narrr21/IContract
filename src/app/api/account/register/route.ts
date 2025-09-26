import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { email, password, firstname, lastname } = await req.json();

  // Perform registration logic here

  return NextResponse.json({ message: "Registration successful" });
}