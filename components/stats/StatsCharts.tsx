"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";

type Stats = {
  scoreDistribution: { range: string; count: number }[];
  albumsPerYear: { year: number; count: number }[];
  releaseDecades: { decade: string; count: number }[];
  topGenres: { genre: string; count: number }[];
  topArtists: { artist: string; count: number }[];
  avgScore?: number | null;
  totalScored?: number;
};

const PURPLE = "#a855f7";
const VIOLET = "#7c3aed";
const CHART_COLORS = [
  "#a855f7",
  "#7c3aed",
  "#6366f1",
  "#8b5cf6",
  "#c084fc",
  "#ddd6fe",
  "#4f46e5",
  "#818cf8",
  "#a78bfa",
  "#c4b5fd",
  "#e879f9",
  "#f0abfc",
];

const tooltipStyle = {
  backgroundColor: "#18181f",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: "10px",
  color: "#e8e8f0",
  fontSize: 12,
};

export function StatsCharts({ stats }: { stats: Stats }) {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Score Distribution */}
      <div className="glass rounded-2xl p-6">
        <h2 className="font-serif text-lg font-bold text-white mb-1">
          Score Distribution
        </h2>
        <p className="text-xs text-zinc-500 mb-4">
          How community scores are spread
          {stats.totalScored ? ` · ${stats.totalScored} ratings` : ""}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={stats.scoreDistribution} barCategoryGap="20%">
            <XAxis
              dataKey="range"
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#71717a", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {stats.scoreDistribution.map((_, index) => (
                <Cell
                  key={index}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Albums listened per year */}
      {stats.albumsPerYear.length > 1 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-serif text-lg font-bold text-white mb-1">
            Albums Per Year
          </h2>
          <p className="text-xs text-zinc-500 mb-4">How many albums I listened to each year</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stats.albumsPerYear}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="year"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={30}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Line
                type="monotone"
                dataKey="count"
                stroke={PURPLE}
                strokeWidth={2}
                dot={{ fill: PURPLE, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: PURPLE }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Top Genres */}
      {stats.topGenres.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-serif text-lg font-bold text-white mb-1">
            Top Genres
          </h2>
          <p className="text-xs text-zinc-500 mb-4">Most common genre tags</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={stats.topGenres}
              layout="vertical"
              barCategoryGap="15%"
            >
              <XAxis
                type="number"
                tick={{ fill: "#71717a", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="genre"
                tick={{ fill: "#a1a1aa", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="count" fill={VIOLET} radius={[0, 4, 4, 0]}>
                {stats.topGenres.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Release Decades */}
      {stats.releaseDecades.length > 0 && (
        <div className="glass rounded-2xl p-6">
          <h2 className="font-serif text-lg font-bold text-white mb-1">
            Release Decades
          </h2>
          <p className="text-xs text-zinc-500 mb-4">What era the music is from</p>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={stats.releaseDecades}
                dataKey="count"
                nameKey="decade"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={({ decade, percent }) =>
                  `${decade} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: "rgba(255,255,255,0.15)" }}
              >
                {stats.releaseDecades.map((_, i) => (
                  <Cell
                    key={i}
                    fill={CHART_COLORS[i % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Most reviewed artists */}
      {stats.topArtists.length > 0 && (
        <div className="glass rounded-2xl p-6 md:col-span-2">
          <h2 className="font-serif text-lg font-bold text-white mb-1">
            Most Reviewed Artists
          </h2>
          <p className="text-xs text-zinc-500 mb-4">Artists with multiple albums reviewed</p>
          <div className="flex flex-wrap gap-3">
            {stats.topArtists.map((a) => (
              <div
                key={a.artist}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-2 border border-white/5"
              >
                <span className="text-sm text-white font-medium">
                  {a.artist}
                </span>
                <span className="text-xs text-zinc-500 bg-white/5 px-1.5 py-0.5 rounded">
                  {a.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
