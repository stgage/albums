import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { Crown, Disc3 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Global Rankings",
  description: "Albums ranked by the community using Borda count",
};

export const dynamic = "force-dynamic";

// Normalized Borda Count algorithm:
// For each user, normalize rank: score = 1 - (rank - 1) / max(total - 1, 1)
// Global score = sum of all users' normalized scores
async function getBordaRankedAlbums() {
  const userAlbums = await prisma.userAlbum.findMany({
    where: { rank: { not: null } },
    select: {
      userId: true,
      albumId: true,
      rank: true,
      album: {
        select: {
          id: true,
          title: true,
          artist: true,
          coverUrl: true,
          dominantColor: true,
          releaseYear: true,
        },
      },
    },
  });

  // Group by user to get each user's total ranked count
  const userTotals: Record<string, number> = {};
  for (const ua of userAlbums) {
    userTotals[ua.userId] = (userTotals[ua.userId] ?? 0) + 1;
  }

  // Compute normalized Borda scores per album
  const bordaScores: Record<string, number> = {};
  const albumMeta: Record<
    string,
    { id: string; title: string; artist: string; coverUrl: string | null; dominantColor: string | null; releaseYear: number | null; rankedByCount: number }
  > = {};

  for (const ua of userAlbums) {
    if (ua.rank === null) continue;
    const total = userTotals[ua.userId] ?? 1;
    const normalized = total > 1 ? 1 - (ua.rank - 1) / (total - 1) : 1;
    bordaScores[ua.albumId] = (bordaScores[ua.albumId] ?? 0) + normalized;
    if (!albumMeta[ua.albumId]) {
      albumMeta[ua.albumId] = { ...ua.album, rankedByCount: 0 };
    }
    albumMeta[ua.albumId].rankedByCount += 1;
  }

  // Sort by borda score descending
  return Object.entries(bordaScores)
    .sort(([, a], [, b]) => b - a)
    .map(([albumId, score], index) => ({
      ...albumMeta[albumId],
      bordaScore: score,
      rank: index + 1,
    }));
}

export default async function RankedPage() {
  const albums = await getBordaRankedAlbums();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-white mb-2">
          Global Rankings
        </h1>
        <p className="text-zinc-400">
          {albums.length} albums ranked by the community · Borda count method
        </p>
      </div>

      <div className="space-y-2">
        {albums.map((album) => {
          const isTop3 = album.rank <= 3;

          return (
            <Link
              key={album.id}
              href={`/album/${album.id}`}
              className="group flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/5 border border-transparent hover:border-white/8"
              style={
                isTop3
                  ? {
                      background: `linear-gradient(135deg, ${album.dominantColor || "#1a1a2e"}22, transparent)`,
                    }
                  : undefined
              }
            >
              {/* Rank */}
              <div className="w-12 text-center flex-shrink-0">
                {album.rank === 1 ? (
                  <Crown className="w-6 h-6 text-yellow-400 mx-auto" />
                ) : (
                  <span
                    className={
                      album.rank <= 3
                        ? "text-xl font-serif font-bold text-zinc-300"
                        : "text-sm font-mono text-zinc-500"
                    }
                  >
                    {album.rank}
                  </span>
                )}
              </div>

              {/* Cover */}
              <div
                className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg"
                style={
                  isTop3 && album.dominantColor
                    ? { boxShadow: `0 4px 24px ${album.dominantColor}44` }
                    : undefined
                }
              >
                {album.coverUrl ? (
                  <Image
                    src={album.coverUrl}
                    alt={album.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                ) : (
                  <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                    <Disc3 className="w-6 h-6 text-zinc-700" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                  {album.title}
                </p>
                <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
                <p className="text-xs text-zinc-600 mt-0.5">
                  ranked by {album.rankedByCount}{" "}
                  {album.rankedByCount === 1 ? "user" : "users"}
                </p>
              </div>

              {/* Borda score */}
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold text-zinc-300">
                  {album.bordaScore.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-600">borda</p>
              </div>
            </Link>
          );
        })}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-24">
          <Disc3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 mb-2">No rankings yet</p>
          <p className="text-zinc-600 text-sm">
            Be the first to rank albums in your collection
          </p>
          <Link
            href="/register"
            className="mt-4 inline-flex px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-xl transition-colors"
          >
            Get Started
          </Link>
        </div>
      )}
    </div>
  );
}
