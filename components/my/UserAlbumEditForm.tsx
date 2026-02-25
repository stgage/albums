"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Check,
  Trash2,
  Plus,
  X,
  Disc3,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { format } from "date-fns";

const inputClass =
  "w-full px-3 py-2.5 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50";

function TagInput({
  label,
  tags,
  onAdd,
  onRemove,
  color = "purple",
}: {
  label: string;
  tags: string[];
  onAdd: (t: string) => void;
  onRemove: (t: string) => void;
  color?: "purple" | "blue" | "red";
}) {
  const [value, setValue] = useState("");
  const colorClass = {
    purple: "bg-purple-500/15 text-purple-300 border-purple-500/20",
    blue: "bg-blue-500/15 text-blue-300 border-blue-500/20",
    red: "bg-red-500/15 text-red-300 border-red-500/20",
  }[color];

  return (
    <div>
      <label className="block text-xs font-medium text-zinc-400 mb-1.5">
        {label}
      </label>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span
            key={t}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border",
              colorClass
            )}
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

type UserAlbumData = {
  id: string;
  rank: number | null;
  score: number | null;
  status: string;
  shortBlurb: string | null;
  review: string | null;
  listenDate: Date | null;
  moodTags: string[];
  userGenreTags: string[];
  favoriteTracks: string[];
  relistens: { id: string; date: string; notes: string | null }[];
  album: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    releaseYear: number | null;
  };
};

export function UserAlbumEditForm({
  userAlbum,
  totalRanked,
}: {
  userAlbum: UserAlbumData;
  totalRanked: number;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [rank, setRank] = useState(userAlbum.rank?.toString() ?? "");
  const [score, setScore] = useState(userAlbum.score?.toString() ?? "");
  const [status, setStatus] = useState(userAlbum.status);
  const [shortBlurb, setShortBlurb] = useState(userAlbum.shortBlurb ?? "");
  const [review, setReview] = useState(userAlbum.review ?? "");
  const [listenDate, setListenDate] = useState(
    userAlbum.listenDate
      ? new Date(userAlbum.listenDate).toISOString().split("T")[0]
      : ""
  );
  const [moodTags, setMoodTags] = useState(userAlbum.moodTags);
  const [genreTags, setGenreTags] = useState(userAlbum.userGenreTags);
  const [favTracks, setFavTracks] = useState(userAlbum.favoriteTracks);

  // Relisten log
  const [relistens, setRelistens] = useState(userAlbum.relistens);
  const [newRelistenDate, setNewRelistenDate] = useState("");
  const [newRelistenNotes, setNewRelistenNotes] = useState("");
  const [addingRelisten, setAddingRelisten] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/user-albums/${userAlbum.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rank: rank ? parseInt(rank) : null,
          score: score ? parseFloat(score) : null,
          status,
          shortBlurb: shortBlurb || null,
          review: review || null,
          listenDate: listenDate || null,
          moodTags,
          userGenreTags: genreTags,
          favoriteTracks: favTracks,
        }),
      });

      if (!res.ok) throw new Error("Save failed");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Remove "${userAlbum.album.title}" from your collection?`))
      return;
    setDeleting(true);
    await fetch(`/api/user-albums/${userAlbum.id}`, { method: "DELETE" });
    router.push("/my/collection");
  }

  async function handleAddRelisten() {
    if (!newRelistenDate) return;
    setAddingRelisten(true);
    try {
      const res = await fetch(`/api/user-albums/${userAlbum.id}/relistens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newRelistenDate,
          notes: newRelistenNotes || null,
        }),
      });
      if (res.ok) {
        const newR = await res.json();
        setRelistens((p) => [newR, ...p]);
        setNewRelistenDate("");
        setNewRelistenNotes("");
      }
    } finally {
      setAddingRelisten(false);
    }
  }

  return (
    <div>
      {/* Back */}
      <Link
        href="/my/collection"
        className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to collection
      </Link>

      {/* Album header */}
      <div className="flex items-center gap-4 mb-8">
        {userAlbum.album.coverUrl ? (
          <Image
            src={userAlbum.album.coverUrl}
            alt={userAlbum.album.title}
            width={72}
            height={72}
            className="rounded-xl flex-shrink-0"
          />
        ) : (
          <div className="w-18 h-18 rounded-xl bg-surface-2 flex items-center justify-center flex-shrink-0">
            <Disc3 className="w-8 h-8 text-zinc-600" />
          </div>
        )}
        <div>
          <h1 className="font-serif text-2xl font-bold text-white">
            {userAlbum.album.title}
          </h1>
          <p className="text-zinc-400">{userAlbum.album.artist}</p>
          <Link
            href={`/album/${userAlbum.album.id}`}
            className="text-xs text-purple-400 hover:text-purple-300 transition-colors"
          >
            View album page →
          </Link>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Ranking & Score */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Ranking & Score
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Rank{" "}
                <span className="text-zinc-600">
                  (1–{Math.max(totalRanked, userAlbum.rank ?? 1)})
                </span>
              </label>
              <input
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                min={1}
                max={Math.max(totalRanked, userAlbum.rank ?? 1)}
                className={inputClass}
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Score (0–10)
              </label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                min={0}
                max={10}
                step={0.1}
                className={inputClass}
                placeholder="—"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={inputClass}
              >
                <option value="reviewed">Reviewed</option>
                <option value="listening">Listening</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-zinc-600">
            Rank determines your position in the global Borda count. Score is personal and optional.
          </p>
        </div>

        {/* Review */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Review
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
              placeholder="One-sentence take..."
              className={cn(inputClass, "resize-none")}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5">
              Full Review
            </label>
            <div className="border border-white/8 rounded-xl overflow-hidden">
              <RichTextEditor
                content={review}
                onChange={setReview}
                placeholder="Write a longer review..."
              />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">
            Tags
          </h2>
          <TagInput
            label="Genre Tags"
            tags={genreTags}
            onAdd={(t) => setGenreTags((p) => [...p, t])}
            onRemove={(t) => setGenreTags((p) => p.filter((g) => g !== t))}
            color="purple"
          />
          <TagInput
            label="Mood / Vibe"
            tags={moodTags}
            onAdd={(t) => setMoodTags((p) => [...p, t])}
            onRemove={(t) => setMoodTags((p) => p.filter((m) => m !== t))}
            color="blue"
          />
          <TagInput
            label="Favorite Tracks"
            tags={favTracks}
            onAdd={(t) => setFavTracks((p) => [...p, t])}
            onRemove={(t) => setFavTracks((p) => p.filter((f) => f !== t))}
            color="red"
          />
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
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 glass glass-hover text-zinc-400 font-medium rounded-xl"
            >
              Cancel
            </button>
          </div>
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
            Remove from Collection
          </button>
        </div>
      </form>

      {/* Relistens */}
      <div className="mt-10 glass rounded-2xl p-5">
        <h2 className="font-serif text-lg font-bold text-white mb-4 flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-purple-400" />
          Relistens
        </h2>

        {/* Add relisten */}
        <div className="flex gap-2 mb-4">
          <input
            type="date"
            value={newRelistenDate}
            onChange={(e) => setNewRelistenDate(e.target.value)}
            className={cn(
              "flex-1 px-3 py-2 bg-surface-2 border border-white/8 rounded-xl text-sm text-white [color-scheme:dark] focus:outline-none focus:border-purple-500/50"
            )}
          />
          <input
            type="text"
            value={newRelistenNotes}
            onChange={(e) => setNewRelistenNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="flex-[2] px-3 py-2 bg-surface-2 border border-white/8 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
          />
          <button
            type="button"
            onClick={handleAddRelisten}
            disabled={!newRelistenDate || addingRelisten}
            className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 disabled:opacity-50 text-purple-300 rounded-xl transition-colors"
          >
            {addingRelisten ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </button>
        </div>

        {relistens.length > 0 ? (
          <div className="space-y-2">
            {relistens.map((r) => (
              <div
                key={r.id}
                className="flex items-start gap-3 py-2 border-t border-white/5"
              >
                <span className="text-xs text-zinc-400 font-mono w-24 flex-shrink-0 pt-0.5">
                  {format(new Date(r.date), "MMM d, yyyy")}
                </span>
                {r.notes && (
                  <p className="text-xs text-zinc-500">{r.notes}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-zinc-600">No relistens logged yet.</p>
        )}
      </div>
    </div>
  );
}
