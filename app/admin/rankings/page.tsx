import { prisma } from "@/lib/prisma";
import { RankingsEditor } from "@/components/admin/RankingsEditor";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Rankings — Admin" };
export const dynamic = "force-dynamic";

async function getAlbums() {
  return prisma.album.findMany({
    where: { status: "reviewed", score: { not: null } },
    orderBy: [{ rank: "asc" }, { score: "desc" }],
    select: {
      id: true,
      title: true,
      artist: true,
      coverUrl: true,
      score: true,
      rank: true,
    },
  });
}

export default async function RankingsPage() {
  const albums = await getAlbums();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Rankings</h1>
        <p className="text-zinc-500 mt-1">
          Drag to reorder · {albums.length} albums
        </p>
      </div>
      <RankingsEditor albums={albums} />
    </div>
  );
}
