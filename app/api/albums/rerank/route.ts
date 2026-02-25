import { NextResponse } from "next/server";

// This route has been replaced by /api/user-albums/rerank
export async function POST() {
  return NextResponse.json(
    { error: "Use /api/user-albums/rerank instead" },
    { status: 410 }
  );
}
