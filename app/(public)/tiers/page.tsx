import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { getTierColor, scoreToTier } from "@/lib/utils";
import { Disc3 } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tier List",
  description: "Albums organized by tier",
};

export const dynamic = "force-dynamic";

const TIERS = ["S", "A", "B", "C", "D", "F"] as const;

const TIER_LABELS: Record<string, string> = {
  S: "Essential",
  A: "Excellent",
  B: "Great",
  C: "Good",
  D: "Decent",
  F: "Disappointing",
};

async function getAlbumsByTier() {
  const albums = await prisma.album.findMany({
    where: {
      status: "reviewed",
      OR: [{ tier: { not: null } }, { score: { not: null } }],
    },
    orderBy: { score: "desc" },
    select: {
      id: true,
      title: true,
      artist: true,
      coverUrl: true,
      score: true,
      tier: true,
      dominantColor: true,
    },
  });

  const grouped: Record<string, typeof albums> = {};
  TIERS.forEach((t) => (grouped[t] = []));

  albums.forEach((album) => {
    const tier = album.tier || (album.score ? scoreToTier(album.score) : null);
    if (tier && TIERS.includes(tier as (typeof TIERS)[number])) {
      grouped[tier].push(album);
    }
  });

  return grouped;
}

export default async function TiersPage() {
  const grouped = await getAlbumsByTier();
  const totalAlbums = Object.values(grouped).flat().length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-white mb-2">
          Tier List
        </h1>
        <p className="text-zinc-400">{totalAlbums} albums sorted into tiers</p>
      </div>

      <div className="space-y-6">
        {TIERS.map((tier) => {
          const albums = grouped[tier];
          if (albums.length === 0) return null;
          const color = getTierColor(tier);

          return (
            <div key={tier} className="flex gap-4">
              {/* Tier label */}
              <div
                className="w-16 flex-shrink-0 rounded-xl flex flex-col items-center justify-center gap-1 min-h-[80px]"
                style={{
                  backgroundColor: color + "22",
                  border: `1px solid ${color}44`,
                }}
              >
                <span
                  className="text-2xl font-serif font-black"
                  style={{ color }}
                >
                  {tier}
                </span>
                <span className="text-xs text-center px-1 leading-tight" style={{ color: color + "aa" }}>
                  {TIER_LABELS[tier]}
                </span>
              </div>

              {/* Albums */}
              <div className="flex-1 rounded-xl border border-white/5 bg-surface-1 p-3">
                <div className="flex flex-wrap gap-2">
                  {albums.map((album) => (
                    <Link
                      key={album.id}
                      href={`/album/${album.id}`}
                      className="group relative"
                    >
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden shadow-md transition-transform group-hover:scale-110 group-hover:z-10 group-hover:shadow-xl">
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
                            <Disc3 className="w-5 h-5 text-zinc-700" />
                          </div>
                        )}
                      </div>
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-white/10 rounded-lg text-xs text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                        <p className="font-medium">{album.title}</p>
                        <p className="text-zinc-400">{album.artist}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
