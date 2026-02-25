import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Plus, Disc3 } from "lucide-react";
import { RankedList } from "@/components/my/RankedList";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "My Collection" };
export const dynamic = "force-dynamic";

export default async function MyCollectionPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const userAlbums = await prisma.userAlbum.findMany({
    where: { userId },
    include: {
      album: {
        select: {
          id: true,
          title: true,
          artist: true,
          coverUrl: true,
          dominantColor: true,
          releaseYear: true,
          spotifyGenres: true,
        },
      },
    },
    orderBy: [{ rank: "asc" }, { createdAt: "desc" }],
  });

  const ranked = userAlbums.filter((ua) => ua.rank !== null) as typeof userAlbums & { rank: number }[];
  const unranked = userAlbums.filter((ua) => ua.rank === null);

  // Stats
  const avgScore =
    userAlbums.filter((ua) => ua.score != null).length > 0
      ? userAlbums
          .filter((ua) => ua.score != null)
          .reduce((sum, ua) => sum + (ua.score ?? 0), 0) /
        userAlbums.filter((ua) => ua.score != null).length
      : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-bold text-white mb-1">
            My Collection
          </h1>
          <p className="text-zinc-400 text-sm">
            {userAlbums.length} albums ·{" "}
            {ranked.length} ranked
            {avgScore != null && ` · ${avgScore.toFixed(1)} avg`}
          </p>
        </div>
        <Link
          href="/my/add"
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-xl transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Album
        </Link>
      </div>

      {userAlbums.length === 0 ? (
        <div className="text-center py-24">
          <Disc3 className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h2 className="font-serif text-xl font-bold text-white mb-2">
            Your collection is empty
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            Start adding albums you love — they&apos;ll be ranked and contribute
            to the global Borda ranking.
          </p>
          <Link
            href="/my/add"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Your First Album
          </Link>
        </div>
      ) : (
        <>
          {/* Ranked list — drag to reorder */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-white">
                Ranked
              </h2>
              <span className="text-xs text-zinc-600">
                Drag to reorder
              </span>
            </div>
            <RankedList
              items={ranked.map((ua) => ({
                id: ua.id,
                rank: ua.rank as number,
                score: ua.score,
                shortBlurb: ua.shortBlurb,
                album: ua.album,
              }))}
            />
          </section>

          {/* Unranked grid */}
          {unranked.length > 0 && (
            <section>
              <h2 className="font-serif text-xl font-bold text-white mb-4">
                Unranked
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {unranked.map((ua) => (
                  <Link
                    key={ua.id}
                    href={`/my/album/${ua.id}`}
                    className="group"
                  >
                    <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-surface-2">
                      {ua.album.coverUrl ? (
                        <Image
                          src={ua.album.coverUrl}
                          alt={ua.album.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 33vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc3 className="w-6 h-6 text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {ua.album.title}
                    </p>
                    <p className="text-xs text-zinc-600 truncate">
                      {ua.album.artist}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
