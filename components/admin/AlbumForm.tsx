"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Loader2, Check, Trash2 } from "lucide-react";

type SpotifyResult = {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string }[];
  release_date: string;
  total_tracks: number;
};

type Album = {
  id: string;
  spotifyId: string | null;
  title: string;
  artist: string;
  coverUrl: string | null;
  releaseYear: number | null;
  trackCount: number | null;
};

export function AlbumForm({ album }: { album?: Album }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  // Spotify search
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyResult[]>([]);

  // Form state — canonical metadata only
  const [title, setTitle] = useState(album?.title ?? "");
  const [artist, setArtist] = useState(album?.artist ?? "");
  const [coverUrl, setCoverUrl] = useState(album?.coverUrl ?? "");
  const [releaseYear, setReleaseYear] = useState(
    album?.releaseYear?.toString() ?? ""
  );
  const [spotifyId, setSpotifyId] = useState(album?.spotifyId ?? "");

  async function handleSpotifySearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `/api/spotify?q=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();
      setSearchResults(data);
    } finally {
      setSearching(false);
    }
  }

  function selectSpotifyAlbum(result: SpotifyResult) {
    setTitle(result.name);
    setArtist(result.artists.map((a) => a.name).join(", "));
    setCoverUrl(result.images[0]?.url ?? "");
    setReleaseYear(result.release_date.split("-")[0]);
    setSpotifyId(result.id);
    setSearchResults([]);
    setSearchQuery("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        title,
        artist,
        coverUrl: coverUrl || null,
        releaseYear: releaseYear ? parseInt(releaseYear) : null,
        spotifyId: spotifyId || null,
      };

      const res = album
        ? await fetch(`/api/albums/${album.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/albums", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });

      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (!album) router.push(`/admin/albums/${data.id}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!album || !confirm("Delete this album? This cannot be undone.")) return;
    setDeleting(true);
    await fetch(`/api/albums/${album.id}`, { method: "DELETE" });
    router.push("/admin/albums");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Spotify search (new albums only) */}
      {!album && (
        <div className="glass rounded-2xl p-5">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">
            Search Spotify
          </h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleSpotifySearch())
                }
                placeholder="Search artist, album..."
                className="w-full pl-9 pr-4 py-2.5 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
              />
            </div>
            <button
              type="button"
              onClick={handleSpotifySearch}
              disabled={searching}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors flex items-center gap-2"
            >
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => selectSpotifyAlbum(result)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/8 transition-colors text-left"
                >
                  {result.images[0] && (
                    <Image
                      src={result.images[0].url}
                      alt={result.name}
                      width={40}
                      height={40}
                      className="rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {result.name}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {result.artists.map((a) => a.name).join(", ")} ·{" "}
                      {result.release_date.split("-")[0]}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cover preview */}
      {coverUrl && (
        <div className="flex items-center gap-4">
          <Image
            src={coverUrl}
            alt={title}
            width={80}
            height={80}
            className="rounded-xl shadow-lg"
          />
          <div>
            <p className="font-medium text-white">{title || "Album Title"}</p>
            <p className="text-sm text-zinc-400">{artist || "Artist"}</p>
          </div>
        </div>
      )}

      {/* Basic info — canonical metadata only */}
      <div className="glass rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
          Album Info
        </h2>
        <p className="text-xs text-zinc-600">
          Canonical metadata shared across all users. User-specific data
          (reviews, scores, rankings) is managed from each user&apos;s collection.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Artist" required>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              required
              className={inputClass}
            />
          </Field>
          <Field label="Release Year">
            <input
              type="number"
              value={releaseYear}
              onChange={(e) => setReleaseYear(e.target.value)}
              min={1900}
              max={2030}
              className={inputClass}
            />
          </Field>
          <Field label="Cover Image URL">
            <input
              type="url"
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </Field>
          <Field label="Spotify ID">
            <input
              type="text"
              value={spotifyId}
              onChange={(e) => setSpotifyId(e.target.value)}
              className={inputClass}
              placeholder="spotify album id"
            />
          </Field>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <Check className="w-4 h-4 text-green-400" />
            ) : null}
            {saving
              ? "Saving..."
              : saved
              ? "Saved!"
              : album
              ? "Save Changes"
              : "Add Album"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 glass glass-hover text-zinc-400 font-medium rounded-xl"
          >
            Cancel
          </button>
        </div>
        {album && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors text-sm"
          >
            {deleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            Delete
          </button>
        )}
      </div>
    </form>
  );
}

const inputClass =
  "w-full px-3 py-2.5 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50";

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
