import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Disc3, Users, TrendingUp } from "lucide-react";
import { ActivityFeed } from "@/components/activity/ActivityFeed";

export const dynamic = "force-dynamic";

async function getHomeData() {
  const [activities, totalAlbums, totalUsers] = await Promise.all([
    prisma.activity.findMany({
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
    }),
    prisma.album.count(),
    prisma.user.count(),
  ]);

  return { activities, totalAlbums, totalUsers };
}

export default async function HomePage() {
  const { activities, totalAlbums, totalUsers } = await getHomeData();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-surface" />

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <p className="text-purple-400 text-sm font-medium tracking-widest uppercase mb-4">
            Social Music Journal
          </p>
          <h1 className="font-serif text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Every album
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300">
              worth hearing
            </span>
          </h1>
          <p className="text-zinc-400 text-lg mb-8 max-w-md leading-relaxed">
            A community of music lovers ranking and reviewing albums together.
            Discover what&apos;s worth your time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/browse"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
            >
              Browse Collection
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ranked"
              className="inline-flex items-center gap-2 px-6 py-3 glass glass-hover text-zinc-300 font-medium rounded-xl transition-colors"
            >
              See Global Rankings
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-y border-white/5 bg-surface-1">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-3 gap-6">
          {[
            { icon: Disc3, label: "Albums in Library", value: totalAlbums },
            { icon: Users, label: "Community Members", value: totalUsers },
            { icon: TrendingUp, label: "Global Rankings", value: "Live" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-xs text-zinc-500">{stat.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Activity Feed */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-3xl font-bold text-white">
              Community Activity
            </h2>
            <p className="text-zinc-500 text-sm mt-1">
              What the community has been listening to
            </p>
          </div>
          <Link
            href="/browse"
            className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            Browse all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <ActivityFeed activities={activities} />
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 pb-24">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/30 to-violet-900/20 border border-purple-500/20 p-8 md:p-12 text-center">
          <div className="absolute inset-0 bg-gradient-radial from-purple-500/5 to-transparent" />
          <h2 className="relative font-serif text-3xl md:text-4xl font-bold text-white mb-4">
            Join the community
          </h2>
          <p className="relative text-zinc-400 mb-8 max-w-md mx-auto">
            Sign up to add your own ranked list, write reviews, and contribute to
            the global Borda ranking.
          </p>
          <div className="relative flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors"
            >
              Create Account
            </Link>
            <Link
              href="/ranked"
              className="px-6 py-3 glass glass-hover text-zinc-300 font-medium rounded-xl"
            >
              View Global Rankings
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
