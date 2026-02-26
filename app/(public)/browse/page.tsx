import { prisma } from "@/lib/prisma";
import { BrowseGrid } from "@/components/browse/BrowseGrid";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse",
  description: "Browse all albums in the library",
};

export const dynamic = "force-dynamic";

async function getAllAlbums() {
  return prisma.album.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      artist: true,
      coverUrl: true,
      releaseYear: true,
      spotifyGenres: true,
      dominantColor: true,
    },
  });
}

async function getBordaRanks(): Promise<
  Record<string, { rank: number; bordaScore: number; rankedByCount: number }>
> {
  const userAlbums = await prisma.userAlbum.findMany({
    where: { rank: { not: null } },
    select: { userId: true, albumId: true, rank: true },
  });

  const userTotals: Record<string, number> = {};
  for (const ua of userAlbums) {
    userTotals[ua.userId] = (userTotals[ua.userId] ?? 0) + 1;
  }

  const scores: Record<string, { score: number; count: number }> = {};
  for (const ua of userAlbums) {
    if (ua.rank === null) continue;
    const total = userTotals[ua.userId] ?? 1;
    const normalized = total > 1 ? 1 - (ua.rank - 1) / (total - 1) : 1;
    if (!scores[ua.albumId]) scores[ua.albumId] = { score: 0, count: 0 };
    scores[ua.albumId].score += normalized;
    scores[ua.albumId].count += 1;
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b.score - a.score);
  const result: Record<string, { rank: number; bordaScore: number; rankedByCount: number }> = {};
  sorted.forEach(([albumId, { score, count }], index) => {
    result[albumId] = { rank: index + 1, bordaScore: score, rankedByCount: count };
  });
  return result;
}

export default async function BrowsePage() {
  const [albums, bordaRanks] = await Promise.all([getAllAlbums(), getBordaRanks()]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <BrowseGrid albums={albums} bordaRanks={bordaRanks} />
    </div>
  );
}
