"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Loader2,
  Disc3,
  ArrowLeft,
  Plus,
  X,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ItunesAlbum } from "@/lib/itunes";

const inputClass =
  "w-full px-3 py-2.5 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50";

function artworkUrl(url: string, size = 600) {
  return url.replace("100x100bb", `${size}x${size}bb`);
}

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
}: {
  label: string;
  tags: string[];
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs bg-purple-500/15 text-purple-300 border border-purple-500/20"
          >
            {t}
            <button
              type="button"
              onClick={() => onRemove(t)}
              className="hover:opacity-70"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (value.trim() && !tags.includes(value.trim())) {
                onAdd(value.trim());
                setValue("");
              }
            }
          }}
          placeholder={`Add ${label.toLowerCase()}...`}
          className="flex-1 px-3 py-2 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
        />
        <button
          type="button"
          onClick={() => {
            if (value.trim() && !tags.includes(value.trim())) {
              onAdd(value.trim());
              setValue("");
            }
          }}
          className="px-3 py-2 bg-white/8 hover:bg-white/12 rounded-xl text-zinc-300 transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function MyAddPage() {
  const router = useRouter();
  const { data: session } = useSession();
  // @ts-expect-error custom session fields
  const username = session?.user?.username as string | null | undefined;
  const profileHref = username ? `/u/${username}` : "/";
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ItunesAlbum[]>([]);
  const [selected, setSelected] = useState<ItunesAlbum | null>(null);

  const [shortBlurb, setShortBlurb] = useState("");
  const [listenDate, setListenDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/spotify?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setResults(data);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/user-albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itunesId: selected.collectionId.toString(),
          title: selected.collectionName,
          artist: selected.artistName,
          coverUrl: artworkUrl(selected.artworkUrl100),
          releaseYear: new Date(selected.releaseDate).getFullYear(),
          genres: selected.primaryGenreName ? [selected.primaryGenreName] : [],
          shortBlurb: shortBlurb || null,
          listenDate: listenDate || null,
          moodTags: tags,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to add album");
        return;
      }

      router.push(profileHref);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Back */}
      <Link
        href={profileHref}
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      <h1 className="font-serif text-4xl font-bold text-white mb-8">
        Add Album
      </h1>

      {/* Step 1: Search */}
      {!selected ? (
        <div>
          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleSearch())
                }
                placeholder="Search for an album or artist..."
                className="w-full pl-9 pr-4 py-3 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
                autoFocus
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              disabled={searching || !searchQuery.trim()}
              className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>

          {results.length > 0 && (
            <div className="space-y-1.5">
              {results.map((result) => (
                <button
                  key={result.collectionId}
                  type="button"
                  onClick={() => {
                    setSelected(result);
                    setResults([]);
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 transition-colors text-left border border-white/5 hover:border-white/10"
                >
                  {result.artworkUrl100 ? (
                    <Image
                      src={artworkUrl(result.artworkUrl100, 48)}
                      alt={result.collectionName}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-surface-2 flex items-center justify-center flex-shrink-0">
                      <Disc3 className="w-5 h-5 text-zinc-600" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {result.collectionName}
                    </p>
                    <p className="text-xs text-zinc-400">
                      {result.artistName} ·{" "}
                      {new Date(result.releaseDate).getFullYear()} ·{" "}
                      {result.trackCount} tracks
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-zinc-500" />
                </button>
              ))}
            </div>
          )}

          {results.length === 0 && searchQuery && !searching && (
            <p className="text-zinc-600 text-sm text-center py-8">
              No results. Try a different search.
            </p>
          )}
        </div>
      ) : (
        /* Step 2: Confirm + add details */
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected album header */}
          <div className="flex items-center gap-4 p-4 rounded-2xl glass border border-white/8">
            {selected.artworkUrl100 && (
              <Image
                src={artworkUrl(selected.artworkUrl100)}
                alt={selected.collectionName}
                width={64}
                height={64}
                className="rounded-xl flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-white">{selected.collectionName}</p>
              <p className="text-sm text-zinc-400">
                {selected.artistName} ·{" "}
                {new Date(selected.releaseDate).getFullYear()}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="p-2 text-zinc-500 hover:text-white hover:bg-white/8 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Optional details */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
              Your Notes{" "}
              <span className="normal-case text-zinc-600 ml-1">
                (all optional)
              </span>
            </h2>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Listen Date
              </label>
              <input
                type="date"
                value={listenDate}
                onChange={(e) => setListenDate(e.target.value)}
                className={cn(inputClass, "text-white [color-scheme:dark]")}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Short Blurb
              </label>
              <textarea
                value={shortBlurb}
                onChange={(e) => setShortBlurb(e.target.value)}
                rows={2}
                placeholder="One sentence take on this album..."
                className={cn(inputClass, "resize-none")}
              />
            </div>

            <TagInput
              label="Tags"
              tags={tags}
              onAdd={(t) => setTags((p) => [...p, t])}
              onRemove={(t) => setTags((p) => p.filter((m) => m !== t))}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Add to Collection
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="px-6 py-3 glass glass-hover text-zinc-400 font-medium rounded-xl"
            >
              Back to Search
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
