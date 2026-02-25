import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { ArrowRight, Disc3, Star, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const currentYear = new Date().getFullYear();
  const yearStart = new Date(currentYear, 0, 1);
  const yearEnd = new Date(currentYear + 1, 0, 1);

  const [recentAlbums, topAlbums, totalCount, avgScoreResult, thisYearCount] = await Promise.all([
    prisma.album.findMany({
      where: { status: "reviewed" },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        score: true,
        dominantColor: true,
      },
    }),
    prisma.album.findMany({
      where: { status: "reviewed", score: { not: null } },
      orderBy: { score: "desc" },
      take: 5,
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        score: true,
        rank: true,
        dominantColor: true,
      },
    }),
    prisma.album.count({ where: { status: "reviewed" } }),
    prisma.album.aggregate({
      _avg: { score: true },
      where: { status: "reviewed", score: { not: null } },
    }),
    prisma.album.count({
      where: {
        status: "reviewed",
        listenDate: { gte: yearStart, lt: yearEnd },
      },
    }),
  ]);

  const avgScore = avgScoreResult._avg.score;

  return { recentAlbums, topAlbums, totalCount, avgScore, thisYearCount };
}

export default async function HomePage() {
  const { recentAlbums, topAlbums, totalCount, avgScore, thisYearCount } = await getHomeData();
  const featuredAlbum = topAlbums[0];

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {featuredAlbum?.dominantColor && (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse at 60% 50%, ${featuredAlbum.dominantColor} 0%, transparent 70%)`,
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-4">
              Personal Music Journal
            </p>
            <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Every album
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
                worth hearing
              </span>
            </h1>
            <p className="text-zinc-400 text-lg mb-8 max-w-md leading-relaxed">
              {totalCount} albums reviewed, ranked, and obsessed over. A living
              document of sound.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/browse"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
              >
                Browse Collection
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ranked"
                className="inline-flex items-center gap-2 px-6 py-3 glass glass-hover text-zinc-300 font-medium rounded-xl transition-colors"
              >
                See Rankings
              </Link>
            </div>
          </div>

          {/* Top 5 */}
          {topAlbums.length > 0 && (
            <div className="hidden md:block">
              <div className="space-y-2">
                {topAlbums.map((album, i) => (
                  <Link
                    key={album.id}
                    href={`/album/${album.id}`}
                    className={cn(
                      "flex items-center gap-4 p-3 rounded-xl transition-all group",
                      i === 0
                        ? "bg-white/8 border border-white/10"
                        : "hover:bg-white/5"
                    )}
                  >
                    <span
                      className={cn(
                        "text-lg font-serif font-bold w-6 text-center",
                        i === 0 ? "text-yellow-400" : "text-zinc-500"
                      )}
                    >
                      {i + 1}
                    </span>
                    {album.coverUrl && (
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        width={44}
                        height={44}
                        className={cn(
                          "rounded-lg object-cover",
                          i === 0 && "ring-2 ring-yellow-400/50 shadow-lg shadow-yellow-400/10"
                        )}
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {album.title}
                      </p>
                      <p className="text-xs text-zinc-400 truncate">
                        {album.artist}
                      </p>
                    </div>
                    {album.score && (
                      <span className="text-sm font-bold text-zinc-300">
                        {album.score.toFixed(1)}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-y border-white/5 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: Disc3, label: "Albums Reviewed", value: totalCount },
            { icon: Star, label: "Average Score", value: avgScore ? avgScore.toFixed(1) : "—" },
            { icon: TrendingUp, label: "This Year", value: thisYearCount },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Reviews */}
      {recentAlbums.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-serif text-3xl font-bold text-white">
                Recent Reviews
              </h2>
              <p className="text-zinc-500 text-sm mt-1">
                Latest additions to the collection
              </p>
            </div>
            <Link
              href="/browse"
              className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentAlbums.map((album) => {
              return (
                <Link
                  key={album.id}
                  href={`/album/${album.id}`}
                  className="group"
                >
                  <div className="relative aspect-square rounded-xl overflow-hidden mb-3 shadow-lg">
                    {album.coverUrl ? (
                      <Image
                        src={album.coverUrl}
                        alt={album.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-surface-2 flex items-center justify-center">
                        <Disc3 className="w-8 h-8 text-zinc-600" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                    {album.title}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">{album.artist}</p>
                  {album.score && (
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {album.score.toFixed(1)} / 10
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-violet-900/20 border border-purple-500/20 p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 to-transparent" />
          <h2 className="relative font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Explore the full collection
          </h2>
          <p className="relative text-zinc-400 mb-8 max-w-md mx-auto">
            Dive deep into rankings, stats, and every album ever reviewed.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Link
              href="/ranked"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
            >
              Browse Rankings
            </Link>
            <Link
              href="/stats"
              className="px-6 py-3 glass glass-hover text-zinc-300 font-medium rounded-xl"
            >
              See Stats
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
