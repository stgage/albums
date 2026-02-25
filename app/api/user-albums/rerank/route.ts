import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Batch rank update — called after drag-to-reorder
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const { updates } = (await req.json()) as {
    updates: { id: string; rank: number }[];
  };

  // Verify all userAlbums belong to this user
  const ids = updates.map((u) => u.id);
  const existing = await prisma.userAlbum.findMany({
    where: { id: { in: ids }, userId },
    select: { id: true },
  });

  if (existing.length !== ids.length) {
    return NextResponse.json({ error: "Invalid album IDs" }, { status: 403 });
  }

  // Batch update in a single transaction
  await prisma.$transaction(
    updates.map(({ id, rank }) =>
      prisma.userAlbum.update({ where: { id }, data: { rank } })
    )
  );

  return NextResponse.json({ ok: true });
}
