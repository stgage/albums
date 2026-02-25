import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Disc3, ArrowLeft, Crown } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ username: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username}'s Collection` };
}

export default async function UserCollectionPage({ params }: Props) {
  const { username } = await params;

  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      userAlbums: {
        include: {
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
        orderBy: [{ rank: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!user) notFound();

  const ranked = user.userAlbums.filter((ua) => ua.rank !== null);
  const unranked = user.userAlbums.filter((ua) => ua.rank === null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link
        href={`/u/${username}`}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        {user.name ?? user.username}&apos;s profile
      </Link>

      <h1 className="font-serif text-3xl font-bold text-white mb-1">
        {user.name ?? user.username}&apos;s Collection
      </h1>
      <p className="text-zinc-400 text-sm mb-8">
        {user.userAlbums.length} albums · {ranked.length} ranked
      </p>

      {ranked.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-xl font-bold text-white mb-4">
            Ranked List
          </h2>
          <div className="space-y-1.5">
            {ranked.map((ua, i) => (
              <Link
                key={ua.id}
                href={`/album/${ua.album.id}`}
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/8"
              >
                <div className="w-8 text-center flex-shrink-0">
                  {i === 0 ? (
                    <Crown className="w-4 h-4 text-yellow-400 mx-auto" />
                  ) : (
                    <span className="text-sm font-mono text-zinc-500">
                      {i + 1}
                    </span>
                  )}
                </div>
                <div className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                  {ua.album.coverUrl && (
                    <Image
                      src={ua.album.coverUrl}
                      alt={ua.album.title}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                    {ua.album.title}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    {ua.album.artist}
                  </p>
                  {ua.shortBlurb && (
                    <p className="text-xs text-zinc-600 truncate mt-0.5 hidden md:block">
                      {ua.shortBlurb}
                    </p>
                  )}
                </div>
                {ua.score != null && (
                  <span className="text-sm font-bold text-zinc-300 flex-shrink-0">
                    {ua.score.toFixed(1)}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {unranked.length > 0 && (
        <section>
          <h2 className="font-serif text-xl font-bold text-white mb-4">
            Unranked
          </h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {unranked.map((ua) => (
              <Link
                key={ua.id}
                href={`/album/${ua.album.id}`}
                className="group"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-surface-2">
                  {ua.album.coverUrl ? (
                    <Image
                      src={ua.album.coverUrl}
                      alt={ua.album.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="16vw"
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

      {user.userAlbums.length === 0 && (
        <div className="text-center py-20">
          <Disc3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No albums yet</p>
        </div>
      )}
    </div>
  );
}
