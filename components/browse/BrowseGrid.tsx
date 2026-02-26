"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Search, Disc3, X, LayoutGrid, List, Crown } from "lucide-react";

type Album = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  releaseYear: number | null;
  spotifyGenres: string[];
  dominantColor: string | null;
};

type BordaRank = { rank: number; bordaScore: number; rankedByCount: number };

type SortOption = "recent" | "artist" | "year" | "ranked";
type ViewMode = "grid" | "list";

export function BrowseGrid({
  albums,
  bordaRanks = {},
}: {
  albums: Album[];
  bordaRanks?: Record<string, BordaRank>;
}) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [filterGenre, setFilterGenre] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    albums.forEach((a) => a.spotifyGenres.forEach((g) => genres.add(g)));
    return Array.from(genres).sort();
  }, [albums]);

  const filtered = useMemo(() => {
    let result = [...albums];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.artist.toLowerCase().includes(q)
      );
    }

    if (filterGenre) {
      result = result.filter((a) => a.spotifyGenres.includes(filterGenre));
    }

    if (sortBy === "ranked") {
      result = result.filter((a) => bordaRanks[a.id] !== undefined);
      result.sort(
        (a, b) => (bordaRanks[a.id]?.rank ?? Infinity) - (bordaRanks[b.id]?.rank ?? Infinity)
      );
    } else {
      result.sort((a, b) => {
        switch (sortBy) {
          case "artist":
            return a.artist.localeCompare(b.artist);
          case "year":
            return (b.releaseYear ?? 0) - (a.releaseYear ?? 0);
          default:
            return 0; // recent = already sorted by DB
        }
      });
    }

    return result;
  }, [albums, search, sortBy, filterGenre, bordaRanks]);

  const isRanked = sortBy === "ranked";

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search albums or artists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-2.5 bg-surface-2 border border-white/8 rounded-xl text-sm text-zinc-300 focus:outline-none focus:border-purple-500/50"
          >
            <option value="recent">Most Recent</option>
            <option value="artist">Artist A–Z</option>
            <option value="year">Release Year</option>
            <option value="ranked">Community Ranking</option>
          </select>

          {/* View toggle */}
          <div className="flex bg-surface-2 border border-white/8 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "px-3 py-2.5 transition-colors",
                viewMode === "grid"
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "px-3 py-2.5 transition-colors",
                viewMode === "list"
                  ? "bg-white/10 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Genre filter */}
      {allGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {filterGenre && (
            <button
              onClick={() => setFilterGenre(null)}
              className="px-3 py-1 rounded-full text-xs border border-purple-500/40 text-purple-400 bg-purple-500/10 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> {filterGenre}
            </button>
          )}
          {!filterGenre &&
            allGenres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                onClick={() => setFilterGenre(genre)}
                className="px-3 py-1 rounded-full text-xs border border-white/8 text-zinc-500 hover:text-zinc-300 hover:border-white/15 transition-colors"
              >
                {genre}
              </button>
            ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-zinc-500 mb-4">
        {filtered.length} album{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid / List */}
      <AnimatePresence mode="wait">
        {viewMode === "grid" ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {filtered.map((album) => (
              <AlbumCard
                key={album.id}
                album={album}
                rankNumber={isRanked ? bordaRanks[album.id]?.rank : undefined}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-1"
          >
            {filtered.map((album, i) => (
              <AlbumRow
                key={album.id}
                album={album}
                index={i}
                rankNumber={isRanked ? bordaRanks[album.id]?.rank : undefined}
                rankedByCount={isRanked ? bordaRanks[album.id]?.rankedByCount : undefined}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 && (
        <div className="text-center py-24">
          <Disc3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-500">No albums match your filters</p>
        </div>
      )}
    </div>
  );
}

function AlbumCard({
  album,
  rankNumber,
}: {
  album: Album;
  rankNumber?: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/album/${album.id}`} className="group block">
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-surface-2 shadow-md">
          {album.coverUrl ? (
            <Image
              src={album.coverUrl}
              alt={album.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc3 className="w-8 h-8 text-zinc-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          {rankNumber !== undefined && (
            <div className="absolute top-1.5 left-1.5">
              {rankNumber === 1 ? (
                <Crown className="w-4 h-4 text-yellow-400 drop-shadow" />
              ) : (
                <span className="text-xs font-bold text-white bg-black/60 rounded px-1.5 py-0.5">
                  {rankNumber}
                </span>
              )}
            </div>
          )}
        </div>
        <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors leading-snug">
          {album.title}
        </p>
        <p className="text-xs text-zinc-500 truncate">{album.artist}</p>
        {album.releaseYear && (
          <p className="text-xs text-zinc-600 mt-0.5">{album.releaseYear}</p>
        )}
      </Link>
    </motion.div>
  );
}

function AlbumRow({
  album,
  index,
  rankNumber,
  rankedByCount,
}: {
  album: Album;
  index: number;
  rankNumber?: number;
  rankedByCount?: number;
}) {
  const displayRank = rankNumber ?? index + 1;
  const isTop3 = rankNumber !== undefined && rankNumber <= 3;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15, delay: Math.min(index * 0.02, 0.3) }}
    >
      <Link
        href={`/album/${album.id}`}
        className={cn(
          "flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group",
          isTop3 && "hover:bg-white/3"
        )}
        style={
          isTop3 && album.dominantColor
            ? { background: `linear-gradient(135deg, ${album.dominantColor}15, transparent)` }
            : undefined
        }
      >
        <div className="w-8 text-center flex-shrink-0">
          {rankNumber === 1 ? (
            <Crown className="w-4 h-4 text-yellow-400 mx-auto" />
          ) : (
            <span
              className={cn(
                "font-mono",
                isTop3 ? "text-sm font-bold text-zinc-300" : "text-xs text-zinc-600"
              )}
            >
              {displayRank}
            </span>
          )}
        </div>
        <div
          className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2"
          style={
            isTop3 && album.dominantColor
              ? { boxShadow: `0 4px 16px ${album.dominantColor}44` }
              : undefined
          }
        >
          {album.coverUrl ? (
            <Image
              src={album.coverUrl}
              alt={album.title}
              fill
              className="object-cover"
              sizes="48px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Disc3 className="w-5 h-5 text-zinc-700" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
            {album.title}
          </p>
          <p className="text-xs text-zinc-500 truncate">
            {album.artist}
            {rankedByCount !== undefined && (
              <span className="text-zinc-600"> · {rankedByCount} {rankedByCount === 1 ? "ranking" : "rankings"}</span>
            )}
          </p>
        </div>
        {album.releaseYear && (
          <span className="text-xs text-zinc-600 hidden md:block flex-shrink-0">
            {album.releaseYear}
          </span>
        )}
        {!rankNumber && album.spotifyGenres.slice(0, 1).map((tag) => (
          <span
            key={tag}
            className="hidden lg:block text-xs px-2 py-0.5 rounded-full bg-white/5 text-zinc-500 flex-shrink-0"
          >
            {tag}
          </span>
        ))}
      </Link>
    </motion.div>
  );
}
