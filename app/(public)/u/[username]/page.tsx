import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Disc3, Calendar, Plus, Pencil } from "lucide-react";
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
    description: user.bio ?? `${user.name ?? user.username}'s album rankings`,
  };
}

export default async function UserProfilePage({ params }: Props) {
  const { username } = await params;
  const [user, session] = await Promise.all([
    getUserProfile(username),
    auth(),
  ]);
  if (!user) notFound();

  const isOwner = (session?.user as { id?: string } | undefined)?.id === user.id;

  const ranked = user.userAlbums.filter((ua) => ua.rank !== null);
  const unranked = user.userAlbums.filter((ua) => ua.rank === null);
  const totalAlbums = user.userAlbums.length;

  const initials = (user.name ?? user.username ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Profile header */}
      <div className="flex items-start gap-5 mb-10">
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? user.username ?? ""}
            width={64}
            height={64}
            className="rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-violet-700 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xl font-bold">{initials}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="font-serif text-2xl font-bold text-white mb-0.5">
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
            {ranked.length > 0 && <span>{ranked.length} ranked</span>}
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/my/add"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </Link>
            <Link
              href="/my/collection"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/8 hover:bg-white/12 text-zinc-300 text-sm font-medium rounded-lg transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
              Edit
            </Link>
          </div>
        )}
      </div>

      {totalAlbums === 0 ? (
        <div className="text-center py-20">
          <Disc3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No albums yet</p>
          {isOwner && (
            <Link
              href="/my/add"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add your first album
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-12">
          {/* Full ranked list */}
          {ranked.length > 0 && (
            <section>
              <h2 className="font-serif text-xl font-bold text-white mb-4">
                Ranked
              </h2>
              <div className="space-y-1">
                {ranked.map((ua, i) => (
                  <Link
                    key={ua.id}
                    href={`/album/${ua.album.id}`}
                    className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors"
                    style={
                      i === 0 && ua.album.dominantColor
                        ? {
                            background: `linear-gradient(135deg, ${ua.album.dominantColor}15, transparent)`,
                          }
                        : undefined
                    }
                  >
                    <span className="w-7 text-right text-sm font-mono text-zinc-600 flex-shrink-0">
                      {i + 1}
                    </span>
                    <div
                      className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0"
                      style={
                        i === 0 && ua.album.dominantColor
                          ? { boxShadow: `0 4px 16px ${ua.album.dominantColor}44` }
                          : undefined
                      }
                    >
                      {ua.album.coverUrl ? (
                        <Image
                          src={ua.album.coverUrl}
                          alt={ua.album.title}
                          fill
                          className="object-cover"
                          sizes="44px"
                        />
                      ) : (
                        <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                          <Disc3 className="w-4 h-4 text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate group-hover:text-purple-300 transition-colors text-sm">
                        {ua.album.title}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {ua.album.artist}
                        {ua.album.releaseYear && ` · ${ua.album.releaseYear}`}
                      </p>
                      {ua.shortBlurb && (
                        <p className="text-xs text-zinc-600 truncate mt-0.5 hidden md:block">
                          {ua.shortBlurb}
                        </p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Unranked */}
          {unranked.length > 0 && (
            <section>
              <h2 className="font-serif text-xl font-bold text-white mb-4">
                Also in collection
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                {unranked.map((ua) => (
                  <Link key={ua.id} href={`/album/${ua.album.id}`} className="group">
                    <div className="relative aspect-square rounded-lg overflow-hidden mb-1.5 bg-surface-2">
                      {ua.album.coverUrl ? (
                        <Image
                          src={ua.album.coverUrl}
                          alt={ua.album.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 25vw, 16vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Disc3 className="w-5 h-5 text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                      {ua.album.title}
                    </p>
                    <p className="text-xs text-zinc-600 truncate">{ua.album.artist}</p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
