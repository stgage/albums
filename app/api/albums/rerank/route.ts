import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return new NextResponse("Unauthorized", { status: 401 });

  const { updates } = await req.json() as {
    updates: { id: string; rank: number }[];
  };

  // Update all ranks in a transaction
  await prisma.$transaction(
    updates.map(({ id, rank }) =>
      prisma.album.update({
        where: { id },
        data: { rank },
      })
    )
  );

  return NextResponse.json({ ok: true });
}
