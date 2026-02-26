import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
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
    mbid,
    albumId: existingAlbumId,
    title,
    artist,
    coverUrl: providedCoverUrl,
    releaseYear,
    genres,
    shortBlurb,
    review,
    listenDate,
    moodTags,
    favoriteTracks,
    status,
  } = body;

  // Find or create the canonical Album
  let album;

  if (existingAlbumId) {
    album = await prisma.album.findUnique({ where: { id: existingAlbumId } });
    if (!album) return NextResponse.json({ error: "Album not found" }, { status: 404 });
  } else if (mbid) {
    // Find existing by MusicBrainz ID (stored in spotifyId field) or create
    album = await prisma.album.findUnique({ where: { spotifyId: mbid } });

    if (!album) {
      const coverUrl = providedCoverUrl ?? null;
      let dominantColor: string | null = null;
      let paletteColors: string[] = [];

      if (coverUrl) {
        try {
          const colors = await extractColors(coverUrl);
          dominantColor = (colors as { dominantColor?: string }).dominantColor ?? null;
          paletteColors = (colors as { paletteColors?: string[] }).paletteColors ?? [];
        } catch {
          // color extraction optional
        }
      }

      album = await prisma.album.create({
        data: {
          spotifyId: mbid,
          title: title ?? "Unknown Album",
          artist: artist ?? "Unknown Artist",
          coverUrl,
          releaseYear: releaseYear ?? null,
          spotifyGenres: genres ?? [],
          dominantColor,
          paletteColors,
        },
      });
    }
  } else {
    // Manual album
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
      shortBlurb: shortBlurb ?? null,
      review: review ?? null,
      listenDate: listenDate ? new Date(listenDate) : null,
      moodTags: moodTags ?? [],
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
      data: { rank: nextRank, blurb: shortBlurb ?? null },
    },
  });

  return NextResponse.json(userAlbum, { status: 201 });
}
