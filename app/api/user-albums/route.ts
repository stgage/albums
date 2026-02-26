import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getSpotifyAlbum, getBestImage } from "@/lib/spotify";
import { extractColors } from "@/lib/colors";

export async function GET() {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const userAlbums = await prisma.userAlbum.findMany({
    where: { userId },
    include: {
      album: {
        select: {
          id: true,
          title: true,
          artist: true,
          coverUrl: true,
          releaseYear: true,
          dominantColor: true,
          spotifyGenres: true,
          trackCount: true,
          durationMs: true,
          tracks: true,
          paletteColors: true,
        },
      },
    },
    orderBy: [{ rank: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(userAlbums);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const body = await req.json();
  const {
    spotifyId,
    albumId: existingAlbumId,
    title,
    artist,
    coverUrl: providedCoverUrl,
    releaseYear,
    score,
    shortBlurb,
    review,
    listenDate,
    moodTags,
    userGenreTags,
    favoriteTracks,
    status,
  } = body;

  // Find or create the canonical Album
  let album;

  if (existingAlbumId) {
    // Use a specific existing album
    album = await prisma.album.findUnique({ where: { id: existingAlbumId } });
    if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });
  } else if (spotifyId) {
    // Find existing by Spotify ID or create from Spotify data
    album = await prisma.album.findUnique({ where: { spotifyId } });

    if (!album) {
      let coverUrl = providedCoverUrl ?? null;
      let spotifyGenres: string[] = [];
      let trackCount: number | null = null;
      let durationMs: number | null = null;
      let tracks: unknown = undefined;
      let dominantColor: string | null = null;
      let paletteColors: string[] = [];

      try {
        const spotifyAlbum = await getSpotifyAlbum(spotifyId);
        coverUrl = getBestImage(spotifyAlbum.images) ?? coverUrl;
        spotifyGenres = spotifyAlbum.genres ?? [];
        trackCount = spotifyAlbum.total_tracks ?? null;
        durationMs =
          spotifyAlbum.tracks?.items.reduce(
            (sum: number, t) => sum + t.duration_ms,
            0
          ) ?? null;
        tracks = spotifyAlbum.tracks?.items ?? null;

        if (coverUrl) {
          try {
            const colors = await extractColors(coverUrl);
            dominantColor = (colors as { dominantColor?: string }).dominantColor ?? null;
            paletteColors = (colors as { paletteColors?: string[] }).paletteColors ?? [];
          } catch {
            // color extraction optional
          }
        }
      } catch (e) {
        console.error("Spotify fetch failed:", e);
      }

      album = await prisma.album.create({
        data: {
          spotifyId,
          title: title ?? "Unknown Album",
          artist: artist ?? "Unknown Artist",
          coverUrl,
          releaseYear: releaseYear ?? null,
          spotifyGenres,
          trackCount,
          durationMs,
          tracks: tracks as never,
          dominantColor,
          paletteColors,
        },
      });
    }
  } else {
    // Manual album (no Spotify)
    album = await prisma.album.create({
      data: {
        title: title ?? "Unknown Album",
        artist: artist ?? "Unknown Artist",
        coverUrl: providedCoverUrl ?? null,
        releaseYear: releaseYear ?? null,
      },
    });
  }

  // Check for duplicate
  const existing = await prisma.userAlbum.findUnique({
    where: { userId_albumId: { userId, albumId: album.id } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Album already in your collection" },
      { status: 409 }
    );
  }

  // Determine rank: add to bottom of ranked list
  const maxRankResult = await prisma.userAlbum.aggregate({
    where: { userId, rank: { not: null } },
    _max: { rank: true },
  });
  const nextRank = (maxRankResult._max.rank ?? 0) + 1;

  const userAlbum = await prisma.userAlbum.create({
    data: {
      userId,
      albumId: album.id,
      rank: nextRank,
      score: score != null ? parseFloat(score) : null,
      shortBlurb: shortBlurb ?? null,
      review: review ?? null,
      listenDate: listenDate ? new Date(listenDate) : null,
      moodTags: moodTags ?? [],
      userGenreTags: userGenreTags ?? [],
      favoriteTracks: favoriteTracks ?? [],
      status: status ?? "reviewed",
    },
    include: { album: true },
  });

  // Log activity
  await prisma.activity.create({
    data: {
      userId,
      albumId: album.id,
      type: "reviewed",
      data: { rank: nextRank, score: score ?? null, blurb: shortBlurb ?? null },
    },
  });

  return NextResponse.json(userAlbum, { status: 201 });
}
