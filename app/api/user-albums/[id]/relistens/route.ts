import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const { id: userAlbumId } = await params;

  // Verify ownership
  const userAlbum = await prisma.userAlbum.findUnique({
    where: { id: userAlbumId },
    select: { userId: true },
  });
  if (!userAlbum || userAlbum.userId !== userId) {
    return new NextResponse("Not found", { status: 404 });
  }

  const body = await req.json();
  const { date, notes } = body;

  const relisten = await prisma.relisten.create({
    data: {
      userAlbumId,
      date: new Date(date),
      notes: notes ?? null,
    },
  });

  return NextResponse.json(relisten, { status: 201 });
}
