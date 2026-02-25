import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Disc3, Crown, Calendar } from "lucide-react";
import { format } from "date-fns";
import type { Metadata } from "next";

type Props = { params: Promise<{ username: string }> };

async function getUserProfile(username: string) {
  return prisma.user.findUnique({
    where: { username },
    select: {
      id: true,
      name: true,
      username: true,
      bio: true,
      image: true,
      createdAt: true,
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
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const user = await getUserProfile(username);
  if (!user) return { title: "Profile Not Found" };
  return {
    title: `${user.name ?? user.username} — Albums`,
    description: user.bio ?? `${user.name ?? user.username}'s album collection`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const user = await getUserProfile(username);
  if (!user) notFound();

  const ranked = user.userAlbums.filter((ua) => ua.rank !== null);
  const totalAlbums = user.userAlbums.length;
  const avgScore =
    user.userAlbums.filter((ua) => ua.score != null).length > 0
      ? user.userAlbums
          .filter((ua) => ua.score != null)
          .reduce((sum, ua) => sum + (ua.score ?? 0), 0) /
        user.userAlbums.filter((ua) => ua.score != null).length
      : null;

  const top5 = ranked.slice(0, 5);
  const recentlyAdded = [...user.userAlbums]
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 6);

  const initials = (user.name ?? user.username ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="flex items-start gap-5 mb-10">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? user.username ?? ""}
            width={80}
            height={80}
            className="rounded-full flex-shrink-0"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-2xl font-bold">{initials}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-3xl font-bold text-white mb-1">
            {user.name ?? user.username}
          </h1>
          {user.name && user.username && (
            <p className="text-zinc-500 text-sm mb-2">@{user.username}</p>
          )}
          {user.bio && (
            <p className="text-zinc-300 text-sm mb-3 max-w-lg">{user.bio}</p>
          )}
          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-600">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Joined {format(new Date(user.createdAt), "MMMM yyyy")}
            </span>
            <span>{totalAlbums} albums</span>
            <span>{ranked.length} ranked</span>
            {avgScore != null && <span>{avgScore.toFixed(1)} avg score</span>}
          </div>
        </div>
      </div>

      {totalAlbums === 0 ? (
        <div className="text-center py-20">
          <Disc3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No albums in collection yet</p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Top 5 ranked */}
          {top5.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-400" />
                  Top Ranked
                </h2>
                {ranked.length > 5 && (
                  <Link
                    href={`/u/${username}/collection`}
                    className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    View all {ranked.length} →
                  </Link>
                )}
              </div>
              <div className="space-y-2">
                {top5.map((ua, i) => (
                  <Link
                    key={ua.id}
                    href={`/album/${ua.album.id}`}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/8"
                    style={
                      i === 0 && ua.album.dominantColor
                        ? {
                            background: `linear-gradient(135deg, ${ua.album.dominantColor}15, transparent)`,
                          }
                        : undefined
                    }
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
                    <div
                      className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0"
                      style={
                        i === 0 && ua.album.dominantColor
                          ? {
                              boxShadow: `0 4px 20px ${ua.album.dominantColor}44`,
                            }
                          : undefined
                      }
                    >
                      {ua.album.coverUrl ? (
                        <Image
                          src={ua.album.coverUrl}
                          alt={ua.album.title}
                          fill
                          className="object-cover"
                          sizes="48px"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                          <Disc3 className="w-5 h-5 text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                        {ua.album.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {ua.album.artist}
                      </p>
                      {ua.shortBlurb && (
                        <p className="text-xs text-zinc-600 truncate hidden md:block mt-0.5">
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

          {/* Recently added */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-2xl font-bold text-white">
                Recently Added
              </h2>
              {totalAlbums > 6 && (
                <Link
                  href={`/u/${username}/collection`}
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
                >
                  Full collection →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {recentlyAdded.map((ua) => (
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
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 33vw, 16vw"
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
        </div>
      )}
    </div>
  );
}
