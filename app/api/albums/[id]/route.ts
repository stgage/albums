import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
    include: { relistens: true, rankHistory: true },
  });
  if (!album) return new NextResponse("Not found", { status: 404 });
  return NextResponse.json(album);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const album = await prisma.album.update({
    where: { id },
    data: {
      title: body.title,
      artist: body.artist,
      coverUrl: body.coverUrl ?? undefined,
      releaseYear: body.releaseYear ?? undefined,
      spotifyId: body.spotifyId ?? undefined,
      score: body.score ?? null,
      tier: body.tier ?? null,
      rank: body.rank ?? null,
      status: body.status ?? undefined,
      shortBlurb: body.shortBlurb ?? null,
      review: body.review ?? null,
      listenDate: body.listenDate ? new Date(body.listenDate) : null,
      moodTags: body.moodTags ?? undefined,
      userGenreTags: body.userGenreTags ?? undefined,
      favoriteTracks: body.favoriteTracks ?? undefined,
    },
  });

  return NextResponse.json(album);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { id } = await params;
  await prisma.album.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
