import { searchAlbums } from "@/lib/spotify";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if (!q) return NextResponse.json([]);

  try {
    const results = await searchAlbums(q);
    return NextResponse.json(results);
  } catch (error) {
    console.error("Spotify search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
