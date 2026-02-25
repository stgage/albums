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

export default async function BrowsePage() {
  const albums = await getAllAlbums();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-white mb-2">
          Browse
        </h1>
        <p className="text-zinc-400">
          {albums.length} albums · Filter, search, and explore
        </p>
      </div>
      <BrowseGrid albums={albums} />
    </div>
  );
}
