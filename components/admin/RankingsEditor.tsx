"use client";

import { useState } from "react";
import Image from "next/image";
import { GripVertical, Loader2, Check, Disc3 } from "lucide-react";
import { cn } from "@/lib/utils";

type Album = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  score: number | null;
  rank: number | null;
};

export function RankingsEditor({ albums: initialAlbums }: { albums: Album[] }) {
  const [albums, setAlbums] = useState(initialAlbums);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);

  function handleDragStart(i: number) {
    setDragIdx(i);
  }

  function handleDragOver(e: React.DragEvent, i: number) {
    e.preventDefault();
    setOverIdx(i);
  }

  function handleDrop(e: React.DragEvent, toIdx: number) {
    e.preventDefault();
    if (dragIdx === null || dragIdx === toIdx) return;

    const reordered = [...albums];
    const [moved] = reordered.splice(dragIdx, 1);
    reordered.splice(toIdx, 0, moved);
    setAlbums(reordered);
    setDragIdx(null);
    setOverIdx(null);
  }

  async function saveRankings() {
    setSaving(true);
    try {
      const updates = albums.map((album, i) => ({
        id: album.id,
        rank: i + 1,
      }));

      await fetch("/api/albums/rerank", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      setAlbums(albums.map((a, i) => ({ ...a, rank: i + 1 })));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="space-y-1.5 mb-6">
        {albums.map((album, i) => (
          <div
            key={album.id}
            draggable
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => handleDragOver(e, i)}
            onDrop={(e) => handleDrop(e, i)}
            onDragEnd={() => { setDragIdx(null); setOverIdx(null); }}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing",
              dragIdx === i
                ? "opacity-50 border-purple-500/40 bg-purple-500/10"
                : overIdx === i
                ? "border-purple-500/30 bg-white/5"
                : "border-transparent hover:bg-white/5"
            )}
          >
            <GripVertical className="w-4 h-4 text-zinc-600 flex-shrink-0" />
            <span className="w-7 text-center text-sm font-mono text-zinc-500">
              {i + 1}
            </span>
            <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
              {album.coverUrl ? (
                <Image
                  src={album.coverUrl}
                  alt={album.title}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Disc3 className="w-4 h-4 text-zinc-700" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {album.title}
              </p>
              <p className="text-xs text-zinc-500 truncate">{album.artist}</p>
            </div>
            {album.score && (
              <span className="text-sm font-semibold text-zinc-300">
                {album.score.toFixed(1)}
              </span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={saveRankings}
        disabled={saving}
        className="flex items-center gap-2 px-6 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
      >
        {saving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : saved ? (
          <Check className="w-4 h-4 text-green-400" />
        ) : null}
        {saving ? "Saving..." : saved ? "Saved!" : "Save Rankings"}
      </button>
    </div>
  );
}
