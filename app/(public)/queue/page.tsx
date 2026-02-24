import { prisma } from "@/lib/prisma";
import Image from "next/image";
import { Disc3, BookmarkPlus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Queue",
  description: "Albums on the want-to-listen list",
};

export const dynamic = "force-dynamic";

async function getQueue() {
  return prisma.album.findMany({
    where: { status: "want_to_listen" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      artist: true,
      coverUrl: true,
      releaseYear: true,
      userGenreTags: true,
      spotifyGenres: true,
      createdAt: true,
    },
  });
}

export default async function QueuePage() {
  const albums = await getQueue();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-white mb-2">
          Queue
        </h1>
        <p className="text-zinc-400">
          {albums.length} album{albums.length !== 1 ? "s" : ""} on the list
        </p>
      </div>

      {albums.length === 0 ? (
        <div className="text-center py-24">
          <BookmarkPlus className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No albums in the queue</p>
        </div>
      ) : (
        <div className="space-y-2">
          {albums.map((album, index) => (
            <div
              key={album.id}
              className="flex items-center gap-4 p-4 rounded-xl bg-surface-1 border border-white/5"
            >
              <span className="text-sm font-mono text-zinc-600 w-6 text-center">
                {index + 1}
              </span>
              <div className="relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                {album.coverUrl ? (
                  <Image
                    src={album.coverUrl}
                    alt={album.title}
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Disc3 className="w-5 h-5 text-zinc-700" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{album.title}</p>
                <p className="text-sm text-zinc-400 truncate">{album.artist}</p>
                <div className="flex gap-1.5 mt-1 flex-wrap">
                  {album.userGenreTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-500"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              {album.releaseYear && (
                <span className="text-sm text-zinc-500">{album.releaseYear}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
