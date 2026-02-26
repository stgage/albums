"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { GripVertical, Disc3, Crown, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

type UserAlbumItem = {
  id: string;
  rank: number;
  shortBlurb: string | null;
  album: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    dominantColor: string | null;
    releaseYear?: number | null;
  };
};

// Static row for visitors
function StaticRow({ item, index }: { item: UserAlbumItem; index: number }) {
  const rank = index + 1;
  const isTop3 = rank <= 3;

  return (
    <Link
      href={`/album/${item.album.id}`}
      className="group flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
      style={
        isTop3 && item.album.dominantColor
          ? { background: `linear-gradient(135deg, ${item.album.dominantColor}15, transparent)` }
          : undefined
      }
    >
      <div className="w-8 text-center flex-shrink-0">
        {rank === 1 ? (
          <Crown className="w-4 h-4 text-yellow-400 mx-auto" />
        ) : (
          <span className={cn("text-sm font-mono", isTop3 ? "font-bold text-zinc-300" : "text-zinc-500")}>
            {rank}
          </span>
        )}
      </div>
      <div
        className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0"
        style={
          isTop3 && item.album.dominantColor
            ? { boxShadow: `0 4px 16px ${item.album.dominantColor}44` }
            : undefined
        }
      >
        {item.album.coverUrl ? (
          <Image src={item.album.coverUrl} alt={item.album.title} fill className="object-cover" sizes="44px" />
        ) : (
          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
            <Disc3 className="w-4 h-4 text-zinc-700" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
          {item.album.title}
        </p>
        <p className="text-xs text-zinc-500 truncate">
          {item.album.artist}
          {item.album.releaseYear && ` · ${item.album.releaseYear}`}
        </p>
        {item.shortBlurb && (
          <p className="text-xs text-zinc-600 truncate mt-0.5 hidden md:block">{item.shortBlurb}</p>
        )}
      </div>
    </Link>
  );
}

// Draggable row for owner
function SortableRow({ item, index, saving }: { item: UserAlbumItem; index: number; saving: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = { transform: CSS.Transform.toString(transform), transition };
  const rank = index + 1;
  const isTop3 = rank <= 3;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl border transition-all",
        isDragging
          ? "bg-surface-1 border-purple-500/40 shadow-xl shadow-black/40 z-50 opacity-90"
          : "bg-surface/40 border-white/5 hover:border-white/10 hover:bg-white/3",
        saving && "opacity-50 pointer-events-none"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-zinc-600 hover:text-zinc-400 cursor-grab active:cursor-grabbing touch-none flex-shrink-0 p-1"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-8 text-center flex-shrink-0">
        {rank === 1 ? (
          <Crown className="w-4 h-4 text-yellow-400 mx-auto" />
        ) : (
          <span className={cn("text-sm font-mono", isTop3 ? "font-bold text-zinc-200" : "text-zinc-500")}>
            {rank}
          </span>
        )}
      </div>
      <div
        className="relative w-11 h-11 rounded-lg overflow-hidden flex-shrink-0"
        style={
          isTop3 && item.album.dominantColor
            ? { boxShadow: `0 4px 16px ${item.album.dominantColor}44` }
            : undefined
        }
      >
        {item.album.coverUrl ? (
          <Image src={item.album.coverUrl} alt={item.album.title} fill className="object-cover" sizes="44px" />
        ) : (
          <div className="w-full h-full bg-surface-2 flex items-center justify-center">
            <Disc3 className="w-4 h-4 text-zinc-700" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{item.album.title}</p>
        <p className="text-xs text-zinc-500 truncate">
          {item.album.artist}
          {item.album.releaseYear && ` · ${item.album.releaseYear}`}
        </p>
        {item.shortBlurb && (
          <p className="text-xs text-zinc-600 truncate mt-0.5 hidden md:block">{item.shortBlurb}</p>
        )}
      </div>
      <Link
        href={`/my/album/${item.id}`}
        className="p-2 text-zinc-600 hover:text-zinc-300 hover:bg-white/5 rounded-lg transition-colors flex-shrink-0"
        aria-label="Edit"
      >
        <Pencil className="w-3.5 h-3.5" />
      </Link>
    </div>
  );
}

export function RankedList({
  items: initialItems,
  isOwner = false,
}: {
  items: UserAlbumItem[];
  isOwner?: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      const reordered = arrayMove(items, oldIndex, newIndex);

      setItems(reordered);
      setSaving(true);
      try {
        await fetch("/api/user-albums/rerank", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: reordered.map((item, idx) => ({ id: item.id, rank: idx + 1 })) }),
        });
      } catch {
        setItems(initialItems);
      } finally {
        setSaving(false);
      }
    },
    [items, initialItems]
  );

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <Disc3 className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-500 text-sm">No ranked albums yet</p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="space-y-1">
        {items.map((item, index) => (
          <StaticRow key={item.id} item={item} index={index} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {saving && (
        <p className="text-xs text-purple-400 text-center mb-2 animate-pulse">Saving order...</p>
      )}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item, index) => (
            <SortableRow key={item.id} item={item} index={index} saving={saving} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
