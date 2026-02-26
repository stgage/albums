import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const { id } = await params;
  const userAlbum = await prisma.userAlbum.findUnique({
    where: { id },
    include: {
      album: true,
      relistens: { orderBy: { date: "desc" } },
    },
  });

  if (!userAlbum || userAlbum.userId !== userId) {
    return new NextResponse("Not found", { status: 404 });
  }

  return NextResponse.json(userAlbum);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.userAlbum.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Handle rank change — if moving to a new rank, shift others
  if (body.rank != null && body.rank !== existing.rank) {
    const newRank = parseInt(body.rank);
    const oldRank = existing.rank;

    await prisma.$transaction(async (tx) => {
      if (oldRank === null) {
        // Moving from unranked to a rank: shift everything at newRank and below down
        await tx.userAlbum.updateMany({
          where: { userId, rank: { gte: newRank } },
          data: { rank: { increment: 1 } },
        });
      } else if (newRank < oldRank) {
        // Moving up: shift items between newRank and oldRank-1 down by 1
        await tx.userAlbum.updateMany({
          where: { userId, rank: { gte: newRank, lt: oldRank } },
          data: { rank: { increment: 1 } },
        });
      } else {
        // Moving down: shift items between oldRank+1 and newRank up by 1
        await tx.userAlbum.updateMany({
          where: { userId, rank: { gt: oldRank, lte: newRank } },
          data: { rank: { decrement: 1 } },
        });
      }
    });
  }

  const newRankValue = body.rank != null ? parseInt(body.rank) : existing.rank;
  const newScoreValue = body.score != null ? parseFloat(body.score) : existing.score;

  const updated = await prisma.userAlbum.update({
    where: { id },
    data: {
      score: newScoreValue,
      rank: newRankValue,
      shortBlurb:
        "shortBlurb" in body ? body.shortBlurb : existing.shortBlurb,
      review: "review" in body ? body.review : existing.review,
      listenDate:
        "listenDate" in body
          ? body.listenDate
            ? new Date(body.listenDate)
            : null
          : existing.listenDate,
      moodTags: body.moodTags ?? existing.moodTags,
      userGenreTags: body.userGenreTags ?? existing.userGenreTags,
      favoriteTracks: body.favoriteTracks ?? existing.favoriteTracks,
      status: body.status ?? existing.status,
    },
    include: { album: true },
  });

  // Log activity for significant changes (best-effort)
  try {
    if (body.rank != null && body.rank !== existing.rank) {
      if (existing.rank === null) {
        await prisma.activity.create({
          data: {
            userId,
            albumId: existing.albumId,
            type: "ranked",
            data: { rank: newRankValue },
          },
        });
      } else {
        await prisma.activity.create({
          data: {
            userId,
            albumId: existing.albumId,
            type: "reranked",
            data: { rank: newRankValue, prevRank: existing.rank },
          },
        });
      }
    } else if (body.score != null && body.score !== existing.score) {
      await prisma.activity.create({
        data: {
          userId,
          albumId: existing.albumId,
          type: "score_updated",
          data: { score: newScoreValue },
        },
      });
    }
  } catch {
    // Activity logging is best-effort, never fail the request
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const { id } = await params;
  const existing = await prisma.userAlbum.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const deletedRank = existing.rank;

  await prisma.userAlbum.delete({ where: { id } });

  // Compact ranks to fill the gap
  if (deletedRank !== null) {
    await prisma.userAlbum.updateMany({
      where: { userId, rank: { gt: deletedRank } },
      data: { rank: { decrement: 1 } },
    });
  }

  return new NextResponse(null, { status: 204 });
}
