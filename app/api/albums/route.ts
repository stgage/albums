import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getSpotifyAlbum, getBestImage, parseReleaseYear } from "@/lib/spotify";
import { extractColors } from "@/lib/colors";

export async function GET() {
  const albums = await prisma.album.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(albums);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const body = await req.json();

  // Fetch full Spotify data if spotifyId provided
  let spotifyData: Partial<{
    coverUrl: string;
    trackCount: number;
    durationMs: number;
    spotifyGenres: string[];
    tracks: unknown;
  }> = {};

  if (body.spotifyId) {
    try {
      const spotifyAlbum = await getSpotifyAlbum(body.spotifyId);
      const coverUrl = getBestImage(spotifyAlbum.images);
      spotifyData = {
        coverUrl,
        trackCount: spotifyAlbum.total_tracks,
        durationMs: spotifyAlbum.tracks?.items.reduce(
          (sum: number, t) => sum + t.duration_ms,
          0
        ),
        spotifyGenres: spotifyAlbum.genres ?? [],
        tracks: spotifyAlbum.tracks?.items ?? [],
      };

      // Extract colors from cover art
      if (coverUrl) {
        try {
          const colors = await extractColors(coverUrl);
          spotifyData = {
            ...spotifyData,
            ...(colors as object),
          };
        } catch (e) {
          console.error("Color extraction failed:", e);
        }
      }
    } catch (e) {
      console.error("Spotify fetch failed:", e);
    }
  }

  const album = await prisma.album.create({
    data: {
      title: body.title,
      artist: body.artist,
      coverUrl: body.coverUrl || spotifyData.coverUrl || null,
      releaseYear: body.releaseYear ?? null,
      spotifyId: body.spotifyId ?? null,
      trackCount: spotifyData.trackCount ?? null,
      durationMs: spotifyData.durationMs ?? null,
      spotifyGenres: spotifyData.spotifyGenres ?? [],
      tracks: spotifyData.tracks ?? undefined,
      score: body.score ?? null,
      tier: body.tier ?? null,
      rank: body.rank ?? null,
      status: body.status ?? "reviewed",
      shortBlurb: body.shortBlurb ?? null,
      review: body.review ?? null,
      listenDate: body.listenDate ? new Date(body.listenDate) : null,
      moodTags: body.moodTags ?? [],
      userGenreTags: body.userGenreTags ?? [],
      favoriteTracks: body.favoriteTracks ?? [],
    },
  });

  return NextResponse.json(album, { status: 201 });
}
