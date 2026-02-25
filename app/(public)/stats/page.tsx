import { prisma } from "@/lib/prisma";
import { StatsCharts } from "@/components/stats/StatsCharts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats",
  description: "Stats and insights about the album community",
};

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    allAlbums,
    totalAlbums,
    totalUsers,
    totalRanked,
  ] = await Promise.all([
    prisma.album.findMany({
      select: {
        releaseYear: true,
        spotifyGenres: true,
        artist: true,
      },
    }),
    prisma.album.count(),
    prisma.user.count(),
    prisma.userAlbum.count({ where: { rank: { not: null } } }),
  ]);

  // Release decades
  const decadeCounts: Record<string, number> = {};
  allAlbums.forEach((a) => {
    if (a.releaseYear) {
      const decade = `${Math.floor(a.releaseYear / 10) * 10}s`;
      decadeCounts[decade] = (decadeCounts[decade] ?? 0) + 1;
    }
  });
  const releaseDecades = Object.entries(decadeCounts)
    .map(([decade, count]) => ({ decade, count }))
    .sort((a, b) => a.decade.localeCompare(b.decade));

  // Top Spotify genres
  const genreCounts: Record<string, number> = {};
  allAlbums.forEach((a) => {
    a.spotifyGenres.forEach((g) => {
      genreCounts[g] = (genreCounts[g] ?? 0) + 1;
    });
  });
  const topGenres = Object.entries(genreCounts)
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  // Top artists
  const artistCounts: Record<string, number> = {};
  allAlbums.forEach((a) => {
    artistCounts[a.artist] = (artistCounts[a.artist] ?? 0) + 1;
  });
  const topArtists = Object.entries(artistCounts)
    .map(([artist, count]) => ({ artist, count }))
    .sort((a, b) => b.count - a.count)
    .filter((a) => a.count > 1)
    .slice(0, 10);

  return {
    totalAlbums,
    totalUsers,
    totalRanked,
    // Keep these compatible with StatsCharts (pass empty/zero for removed fields)
    totalReviewed: totalAlbums,
    avgScore: 0,
    scoreDistribution: [],
    albumsPerYear: [],
    releaseDecades,
    topGenres,
    topArtists,
  };
}

export default async function StatsPage() {
  const stats = await getStats();

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="font-serif text-4xl font-bold text-white mb-2">
          Stats
        </h1>
        <p className="text-zinc-400">By the numbers</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {[
          { label: "Albums in Library", value: stats.totalAlbums },
          { label: "Community Members", value: stats.totalUsers },
          {
            label: "Total Rankings",
            value: stats.totalRanked,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="glass rounded-2xl p-5 text-center"
          >
            <p className="text-3xl font-bold font-serif text-white mb-1">
              {stat.value}
            </p>
            <p className="text-xs text-zinc-500">{stat.label}</p>
          </div>
        ))}
      </div>

      <StatsCharts stats={stats} />
    </div>
  );
}
