"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Check, Loader2, Pencil } from "lucide-react";

type Props = {
  albumId: string;
  userAlbumId?: string | null;
};

export function AddToCollectionButton({ albumId, userAlbumId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  // Already in collection → link to edit page
  if (userAlbumId) {
    return (
      <Link
        href={`/my/album/${userAlbumId}`}
        className="inline-flex items-center gap-2 px-4 py-2 glass border border-white/10 hover:border-white/20 text-zinc-300 text-sm font-medium rounded-xl transition-colors"
      >
        <Pencil className="w-4 h-4" />
        Edit My Review
      </Link>
    );
  }

  async function handleAdd() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/user-albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ albumId }),
      });
      if (res.ok) {
        setAdded(true);
        setTimeout(() => router.push("/my/collection"), 1200);
      } else {
        const data = await res.json();
        setError(data.error ?? "Failed to add");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleAdd}
        disabled={loading || added}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : added ? (
          <Check className="w-4 h-4" />
        ) : (
          <Plus className="w-4 h-4" />
        )}
        {added ? "Added!" : loading ? "Adding…" : "Add to Collection"}
      </button>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}
