import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { getTierColor, scoreToTier } from "@/lib/utils";
import { Disc3, Edit, Plus } from "lucide-react";
import { format } from "date-fns";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Manage Albums — Admin" };
export const dynamic = "force-dynamic";

async function getAlbums() {
  return prisma.album.findMany({
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      title: true,
      artist: true,
      coverUrl: true,
      score: true,
      tier: true,
      status: true,
      rank: true,
      updatedAt: true,
    },
  });
}

export default async function ManageAlbumsPage() {
  const albums = await getAlbums();

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-white">Albums</h1>
          <p className="text-zinc-500 mt-1">{albums.length} total</p>
        </div>
        <Link
          href="/admin/albums/new"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Album
        </Link>
      </div>

      <div className="space-y-2">
        {albums.map((album) => {
          const tier =
            album.tier || (album.score ? scoreToTier(album.score) : null);
          const tierColor = tier ? getTierColor(tier) : null;

          return (
            <div
              key={album.id}
              className="flex items-center gap-3 p-3 rounded-xl glass"
            >
              <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                {album.coverUrl && (
                  <Image
                    src={album.coverUrl}
                    alt={album.title}
                    fill
                    className="object-cover"
                    sizes="44px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {album.title}
                </p>
                <p className="text-xs text-zinc-500 truncate">{album.artist}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full hidden md:block ${
                  album.status === "reviewed"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-zinc-500/10 text-zinc-400"
                }`}
              >
                {album.status}
              </span>
              {album.rank && (
                <span className="text-xs text-zinc-500 hidden md:block">
                  #{album.rank}
                </span>
              )}
              {tier && (
                <span
                  className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    backgroundColor: (tierColor ?? "#fff") + "22",
                    color: tierColor ?? "#fff",
                  }}
                >
                  {tier}
                </span>
              )}
              {album.score && (
                <span className="text-sm font-semibold text-zinc-300 w-8 text-right">
                  {album.score.toFixed(1)}
                </span>
              )}
              <span className="text-xs text-zinc-600 hidden lg:block w-14 text-right">
                {format(new Date(album.updatedAt), "MMM d")}
              </span>
              <Link
                href={`/admin/albums/${album.id}`}
                className="p-2 text-zinc-500 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
