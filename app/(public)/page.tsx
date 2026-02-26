import { prisma } from "@/lib/prisma";
import { ActivityFeed } from "@/components/activity/ActivityFeed";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      user: { select: { username: true, name: true, image: true } },
      album: {
        select: {
          id: true,
          title: true,
          artist: true,
          coverUrl: true,
          dominantColor: true,
        },
      },
    },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <ActivityFeed activities={activities} />
    </div>
  );
}
