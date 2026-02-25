import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

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
      releaseYear: true,
      trackCount: true,
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
          <p className="text-zinc-500 mt-1">{albums.length} in library</p>
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
              {album.releaseYear && (
                <span className="text-xs text-zinc-500 hidden md:block">
                  {album.releaseYear}
                </span>
              )}
              {album.trackCount && (
                <span className="text-xs text-zinc-600 hidden md:block">
                  {album.trackCount} tracks
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

      {albums.length === 0 && (
        <div className="text-center py-24">
          <Disc3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500 mb-4">No albums in library yet</p>
          <Link
            href="/admin/albums/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add First Album
          </Link>
        </div>
      )}
    </div>
  );
}
