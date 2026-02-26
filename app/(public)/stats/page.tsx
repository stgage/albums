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
    scoredUserAlbums,
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
    prisma.userAlbum.findMany({
      where: { score: { not: null } },
      select: { score: true },
    }),
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

  // Score distribution from user scores
  const scoreBuckets: Record<string, number> = {
    "1–2": 0, "3–4": 0, "5–6": 0, "7–8": 0, "9–10": 0,
  };
  let scoreSum = 0;
  scoredUserAlbums.forEach(({ score }) => {
    if (score == null) return;
    scoreSum += score;
    if (score <= 2) scoreBuckets["1–2"]++;
    else if (score <= 4) scoreBuckets["3–4"]++;
    else if (score <= 6) scoreBuckets["5–6"]++;
    else if (score <= 8) scoreBuckets["7–8"]++;
    else scoreBuckets["9–10"]++;
  });
  const scoreDistribution = Object.entries(scoreBuckets).map(([range, count]) => ({ range, count }));
  const avgScore = scoredUserAlbums.length > 0
    ? scoreSum / scoredUserAlbums.length
    : null;

  return {
    totalAlbums,
    totalUsers,
    totalRanked,
    totalScored: scoredUserAlbums.length,
    avgScore,
    scoreDistribution,
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
        <p className="text-zinc-400">Community by the numbers</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {[
          { label: "Albums in Library", value: stats.totalAlbums },
          { label: "Community Members", value: stats.totalUsers },
          { label: "Total Rankings", value: stats.totalRanked },
          {
            label: "Avg Score",
            value: stats.avgScore != null ? `${stats.avgScore.toFixed(1)}/10` : "—",
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
