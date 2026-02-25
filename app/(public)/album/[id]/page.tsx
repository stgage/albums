import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { formatDuration, formatTrackDuration } from "@/lib/utils";
import { Clock, Disc3, Music, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

async function getAlbum(id: string) {
  return prisma.album.findUnique({
    where: { id },
    include: {
      userAlbums: {
        where: { rank: { not: null } },
        select: {
          userId: true,
          rank: true,
          score: true,
          shortBlurb: true,
          review: true,
          user: { select: { username: true, name: true } },
        },
        orderBy: { rank: "asc" },
      },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) return { title: "Album Not Found" };
  return {
    title: `${album.title} — ${album.artist}`,
    description: `${album.title} by ${album.artist}`,
  };
}

export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const bgColor = album.dominantColor ?? "#1a1a2e";

  const tracks = album.tracks as Array<{
    id: string;
    name: string;
    duration_ms: number;
    track_number: number;
  }> | null;

  return (
    <div className="min-h-screen">
      {/* Hero banner */}
      <div
        className="relative h-[50vh] min-h-[380px]"
        style={{
          background: `linear-gradient(to bottom, ${bgColor}88 0%, ${bgColor}44 40%, transparent 100%),
                       linear-gradient(135deg, ${bgColor}55 0%, #0a0a0f 100%)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-surface" />

        <div className="relative max-w-6xl mx-auto px-4 h-full flex items-end pb-0">
          <div className="flex items-end gap-8 pb-8">
            {/* Cover */}
            <div
              className="relative w-44 h-44 md:w-56 md:h-56 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0"
              style={{ boxShadow: `0 20px 60px ${bgColor}88` }}
            >
              {album.coverUrl ? (
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  fill
                  className="object-cover"
                  sizes="224px"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                  <Disc3 className="w-16 h-16 text-zinc-700" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="pb-2">
              <p className="text-xs text-zinc-400 uppercase tracking-widest mb-2">
                Album
              </p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold text-white leading-tight mb-2">
                {album.title}
              </h1>
              <p className="text-xl text-zinc-300 mb-3">{album.artist}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-400">
                {album.releaseYear && <span>{album.releaseYear}</span>}
                {album.trackCount && (
                  <span className="flex items-center gap-1">
                    <Music className="w-3.5 h-3.5" />
                    {album.trackCount} tracks
                  </span>
                )}
                {album.durationMs && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(album.durationMs)}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link
            href="/browse"
            className="text-sm text-zinc-500 hover:text-zinc-300 flex items-center gap-1.5 w-fit"
          >
            <ArrowLeft className="w-4 h-4" /> Back to browse
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2 space-y-8">
            {/* Community reviews */}
            {album.userAlbums.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-white mb-4">
                  Community Reviews
                </h2>
                <div className="space-y-4">
                  {album.userAlbums.map((ua) => (
                    <div
                      key={ua.userId}
                      className="p-4 rounded-xl glass border border-white/5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-purple-300 text-xs font-bold">
                          {ua.user.name?.[0] ?? ua.user.username?.[0] ?? "?"}
                        </div>
                        <div>
                          <Link
                            href={`/u/${ua.user.username ?? ""}`}
                            className="text-sm font-medium text-white hover:text-purple-300 transition-colors"
                          >
                            {ua.user.name ?? ua.user.username}
                          </Link>
                          <div className="flex items-center gap-2 text-xs text-zinc-500">
                            {ua.rank && <span>Ranked #{ua.rank}</span>}
                            {ua.score && <span>· {ua.score.toFixed(1)}/10</span>}
                          </div>
                        </div>
                      </div>
                      {ua.shortBlurb && (
                        <p className="text-sm text-zinc-300 italic">
                          &ldquo;{ua.shortBlurb}&rdquo;
                        </p>
                      )}
                      {ua.review && (
                        <div
                          className="text-sm text-zinc-400 mt-2 prose prose-invert max-w-none"
                          dangerouslySetInnerHTML={{ __html: ua.review }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tracklist */}
            {tracks && tracks.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-white mb-4">
                  Tracklist
                </h2>
                <div className="space-y-1">
                  {tracks.map((track) => (
                    <div
                      key={track.id}
                      className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="text-xs text-zinc-600 font-mono w-5 text-right">
                        {track.track_number}
                      </span>
                      <span className="flex-1 text-sm text-zinc-300">
                        {track.name}
                      </span>
                      <span className="text-xs text-zinc-600 font-mono">
                        {formatTrackDuration(track.duration_ms)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meta info */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
                Details
              </h3>

              {album.releaseYear && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Released</p>
                  <p className="text-sm text-zinc-200">{album.releaseYear}</p>
                </div>
              )}

              {album.spotifyGenres.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {album.spotifyGenres.slice(0, 6).map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Color palette */}
            {album.paletteColors.length > 0 && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                  Palette
                </h3>
                <div className="flex gap-2">
                  {album.paletteColors.slice(0, 6).map((color) => (
                    <div
                      key={color}
                      className="w-8 h-8 rounded-full shadow-md"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
