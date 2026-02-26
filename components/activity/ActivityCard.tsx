import Image from "next/image";
import Link from "next/link";
import { UserAvatar } from "@/components/user/UserAvatar";
import { formatRelativeTime } from "@/lib/utils";
import { Disc3 } from "lucide-react";
import type { ActivityItem } from "@/types/activity";

function activityVerb(type: string, data: Record<string, unknown> | null): string {
  switch (type) {
    case "reviewed":
      return "added to their collection";
    case "ranked":
      return `ranked at #${data?.rank ?? "?"}`;
    case "reranked":
      return `moved to #${data?.rank ?? "?"} in their rankings`;
    case "score_updated":
      return `gave ${data?.score ?? "?"}/10`;
    default:
      return "reviewed";
  }
}

export function ActivityCard({ activity }: { activity: ActivityItem }) {
  const data = activity.data as Record<string, unknown> | null;
  const userName = activity.user.name ?? activity.user.username ?? "Someone";
  const userSlug = activity.user.username ?? "";

  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl glass border border-white/5 hover:border-white/10 transition-colors">
      {/* User */}
      <Link
        href={`/u/${userSlug}`}
        className="flex-shrink-0"
        aria-label={userName}
      >
        <UserAvatar
          name={userName}
          image={activity.user.image}
          size={36}
        />
      </Link>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-zinc-200 leading-snug">
          <Link
            href={`/u/${userSlug}`}
            className="font-medium text-white hover:text-purple-300 transition-colors"
          >
            {userName}
          </Link>{" "}
          <span className="text-zinc-400">{activityVerb(activity.type, data)}</span>
        </p>
        <Link
          href={`/album/${activity.album.id}`}
          className="text-sm font-medium text-purple-300 hover:text-purple-200 transition-colors truncate block"
        >
          {activity.album.title}
          <span className="text-zinc-500 font-normal"> · {activity.album.artist}</span>
        </Link>
        <p className="text-xs text-zinc-600 mt-0.5">
          {formatRelativeTime(activity.createdAt)}
        </p>
      </div>

      {/* Album art */}
      <Link
        href={`/album/${activity.album.id}`}
        className="flex-shrink-0 relative w-12 h-12 rounded-lg overflow-hidden bg-surface-2 hover:opacity-80 transition-opacity"
      >
        {activity.album.coverUrl ? (
          <Image
            src={activity.album.coverUrl}
            alt={activity.album.title}
            fill
            className="object-cover"
            sizes="48px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Disc3 className="w-5 h-5 text-zinc-700" />
          </div>
        )}
      </Link>
    </div>
  );
}
