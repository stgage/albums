import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: {
        select: { username: true, name: true, image: true },
      },
      album: {
        select: {
          id: true,
          title: true,
          artist: true,
          coverUrl: true,
          dominantColor: true,
        },
      },
    },
  });

  return NextResponse.json(activities);
}
