import { ActivityCard } from "./ActivityCard";
import { Disc3 } from "lucide-react";
import type { ActivityItem } from "@/types/activity";

export function ActivityFeed({ activities }: { activities: ActivityItem[] }) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-16">
        <Disc3 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
        <p className="text-zinc-600 text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity) => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  );
}
