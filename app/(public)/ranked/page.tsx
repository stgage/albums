import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

import { Crown, Disc3 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ranked",
  description: "Every album ranked from best to worst",
};

export const dynamic = "force-dynamic";

async function getRankedAlbums() {
  return prisma.album.findMany({
    where: {
      status: "reviewed",
      score: { not: null },
    },
    orderBy: [{ rank: "asc" }, { score: "desc" }],
    select: {
      id: true,
      title: true,
      artist: true,
      coverUrl: true,
      score: true,
      rank: true,
      releaseYear: true,
      shortBlurb: true,
      dominantColor: true,
      userGenreTags: true,
    },
  });
}

export default async function RankedPage() {
  const albums = await getRankedAlbums();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-white mb-2">
          Ranked
        </h1>
        <p className="text-zinc-400">
          {albums.length} albums in order from best to worst
        </p>
      </div>

      <div className="space-y-2">
        {albums.map((album, index) => {
          const rank = album.rank ?? index + 1;
          const isTop3 = rank <= 3;

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
                {rank === 1 ? (
                  <Crown className="w-6 h-6 text-yellow-400 mx-auto" />
                ) : (
                  <span
                    className={
                      rank <= 3
                        ? "text-xl font-serif font-bold text-zinc-300"
                        : "text-sm font-mono text-zinc-500"
                    }
                  >
                    {rank}
                  </span>
                )}
              </div>

              {/* Cover */}
              <div
                className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 shadow-lg"
                style={
                  isTop3 && album.dominantColor
                    ? {
                        boxShadow: `0 4px 24px ${album.dominantColor}44`,
                      }
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
                {album.shortBlurb && (
                  <p className="text-xs text-zinc-600 truncate mt-0.5 hidden md:block">
                    {album.shortBlurb}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="hidden lg:flex gap-1 flex-wrap max-w-[160px] justify-end">
                {album.userGenreTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-500"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Score */}
              <div className="flex items-center gap-3 flex-shrink-0">
                {album.score && (
                  <span className="text-lg font-bold text-white w-10 text-right">
                    {album.score.toFixed(1)}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {albums.length === 0 && (
        <div className="text-center py-24">
          <Disc3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No ranked albums yet</p>
        </div>
      )}
    </div>
  );
}
