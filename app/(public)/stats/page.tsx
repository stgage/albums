import { prisma } from "@/lib/prisma";
import { StatsCharts } from "@/components/stats/StatsCharts";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stats",
  description: "Stats and insights about Sam's album collection",
};

export const dynamic = "force-dynamic";

async function getStats() {
  const [
    allAlbums,
    totalReviewed,
    totalWantToListen,
    avgScore,
  ] = await Promise.all([
    prisma.album.findMany({
      where: { status: "reviewed" },
      select: {
        score: true,
        tier: true,
        releaseYear: true,
        userGenreTags: true,
        moodTags: true,
        listenDate: true,
        artist: true,
      },
    }),
    prisma.album.count({ where: { status: "reviewed" } }),
    prisma.album.count({ where: { status: "want_to_listen" } }),
    prisma.album.aggregate({
      where: { status: "reviewed", score: { not: null } },
      _avg: { score: true },
    }),
  ]);

  // Score distribution
  const scoreDistribution = Array.from({ length: 10 }, (_, i) => {
    const min = i + 1;
    const max = i + 1.99;
    return {
      range: `${min}–${min + 1}`,
      count: allAlbums.filter(
        (a) => a.score !== null && a.score >= min && a.score < max + 0.01
      ).length,
    };
  }).filter((d) => d.count > 0);

  // Albums per year (listen date)
  const yearCounts: Record<number, number> = {};
  allAlbums.forEach((a) => {
    if (a.listenDate) {
      const year = new Date(a.listenDate).getFullYear();
      yearCounts[year] = (yearCounts[year] ?? 0) + 1;
    }
  });
  const albumsPerYear = Object.entries(yearCounts)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);

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

  // Top genres
  const genreCounts: Record<string, number> = {};
  allAlbums.forEach((a) => {
    a.userGenreTags.forEach((g) => {
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
    totalReviewed,
    totalWantToListen,
    avgScore: avgScore._avg.score ?? 0,
    scoreDistribution,
    albumsPerYear,
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Albums Reviewed", value: stats.totalReviewed },
          { label: "Average Score", value: stats.avgScore.toFixed(2) },
          { label: "Want to Listen", value: stats.totalWantToListen },
          {
            label: "Years Covered",
            value: stats.albumsPerYear.length > 0
              ? `${stats.albumsPerYear[0]?.year}–${stats.albumsPerYear[stats.albumsPerYear.length - 1]?.year}`
              : "—",
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
