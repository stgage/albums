import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTierColor, scoreToTier, formatDuration, formatTrackDuration } from "@/lib/utils";
import { Calendar, Clock, Disc3, Music, ArrowLeft, RotateCcw, Heart } from "lucide-react";
import { format } from "date-fns";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

async function getAlbum(id: string) {
  return prisma.album.findUnique({
    where: { id },
    include: {
      relistens: { orderBy: { date: "desc" } },
      rankHistory: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) return { title: "Album Not Found" };
  return {
    title: `${album.title} — ${album.artist}`,
    description: album.shortBlurb ?? `${album.title} by ${album.artist}, reviewed by Sam`,
  };
}

export default async function AlbumPage({ params }: Props) {
  const { id } = await params;
  const album = await getAlbum(id);
  if (!album) notFound();

  const tier = album.tier || (album.score ? scoreToTier(album.score) : null);
  const tierColor = tier ? getTierColor(tier) : null;
  const bgColor = album.dominantColor ?? "#1a1a2e";

  const tracks = album.tracks as Array<{
    id: string;
    name: string;
    duration_ms: number;
    track_number: number;
    artists: { name: string }[];
  }> | null;

  return (
    <div className="min-h-screen">
      {/* Hero banner with album color */}
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
            {/* Score / Tier */}
            {(album.score || tier) && (
              <div className="flex items-center gap-4">
                {album.score && (
                  <div>
                    <p className="text-5xl font-serif font-bold text-white">
                      {album.score.toFixed(1)}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">out of 10</p>
                  </div>
                )}
                {tier && (
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-serif font-black"
                    style={{
                      backgroundColor: (tierColor ?? "#fff") + "22",
                      color: tierColor ?? "#fff",
                      border: `2px solid ${tierColor ?? "#fff"}44`,
                    }}
                  >
                    {tier}
                  </div>
                )}
                {album.rank && (
                  <div className="text-zinc-400">
                    <p className="text-lg font-semibold text-white">
                      #{album.rank}
                    </p>
                    <p className="text-xs">all-time rank</p>
                  </div>
                )}
              </div>
            )}

            {/* Short blurb */}
            {album.shortBlurb && (
              <p className="text-lg text-zinc-300 leading-relaxed italic border-l-4 border-purple-500/50 pl-4">
                &ldquo;{album.shortBlurb}&rdquo;
              </p>
            )}

            {/* Full review */}
            {album.review && (
              <div>
                <h2 className="font-serif text-xl font-bold text-white mb-4">
                  Review
                </h2>
                <div
                  className="prose prose-invert max-w-none text-zinc-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: album.review }}
                />
              </div>
            )}

            {/* Favorite tracks */}
            {album.favoriteTracks.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-400" />
                  Favorite Tracks
                </h2>
                <div className="flex flex-wrap gap-2">
                  {album.favoriteTracks.map((track) => (
                    <span
                      key={track}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-300 text-sm rounded-lg"
                    >
                      {track}
                    </span>
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
                  {tracks.map((track) => {
                    const isFav = album.favoriteTracks.includes(track.name);
                    return (
                      <div
                        key={track.id}
                        className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors group"
                      >
                        <span className="text-xs text-zinc-600 font-mono w-5 text-right">
                          {track.track_number}
                        </span>
                        <span
                          className={`flex-1 text-sm ${isFav ? "text-white font-medium" : "text-zinc-300"}`}
                        >
                          {track.name}
                          {isFav && (
                            <Heart className="inline w-3 h-3 text-red-400 ml-1.5 mb-0.5" />
                          )}
                        </span>
                        <span className="text-xs text-zinc-600 font-mono">
                          {formatTrackDuration(track.duration_ms)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Relistens */}
            {album.relistens.length > 0 && (
              <div>
                <h2 className="font-serif text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-purple-400" />
                  Relistens
                </h2>
                <div className="space-y-3">
                  {album.relistens.map((relisten) => (
                    <div
                      key={relisten.id}
                      className="flex items-start gap-3 p-3 rounded-xl bg-surface-1 border border-white/5"
                    >
                      <Calendar className="w-4 h-4 text-zinc-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-zinc-300">
                          {format(new Date(relisten.date), "MMMM d, yyyy")}
                        </p>
                        {relisten.notes && (
                          <p className="text-xs text-zinc-500 mt-1">
                            {relisten.notes}
                          </p>
                        )}
                      </div>
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

              {album.listenDate && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">First Listened</p>
                  <p className="text-sm text-zinc-200">
                    {format(new Date(album.listenDate), "MMMM d, yyyy")}
                  </p>
                </div>
              )}

              {album.releaseYear && (
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Released</p>
                  <p className="text-sm text-zinc-200">{album.releaseYear}</p>
                </div>
              )}

              {(album.userGenreTags.length > 0 || album.spotifyGenres.length > 0) && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Genres</p>
                  <div className="flex flex-wrap gap-1.5">
                    {album.userGenreTags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                    {album.spotifyGenres
                      .filter((g) => !album.userGenreTags.includes(g))
                      .slice(0, 3)
                      .map((tag) => (
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

              {album.moodTags.length > 0 && (
                <div>
                  <p className="text-xs text-zinc-500 mb-2">Mood / Vibe</p>
                  <div className="flex flex-wrap gap-1.5">
                    {album.moodTags.map((tag) => (
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

            {/* Similar albums */}
            {album.similarAlbums.length > 0 && (
              <SimilarAlbums ids={album.similarAlbums} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

async function SimilarAlbums({ ids }: { ids: string[] }) {
  const albums = await prisma.album.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      artist: true,
      coverUrl: true,
    },
    take: 4,
  });

  if (albums.length === 0) return null;

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
        Similar Albums
      </h3>
      <div className="space-y-2">
        {albums.map((album) => (
          <Link
            key={album.id}
            href={`/album/${album.id}`}
            className="flex items-center gap-3 hover:bg-white/5 rounded-lg p-1.5 transition-colors group"
          >
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
              {album.coverUrl && (
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-sm text-white truncate group-hover:text-purple-300 transition-colors">
                {album.title}
              </p>
              <p className="text-xs text-zinc-500 truncate">{album.artist}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
