import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Plus, Disc3, ListOrdered, BarChart3 } from "lucide-react";
import { format } from "date-fns";

async function getDashboardData() {
  const [totalAlbums, recent] = await Promise.all([
    prisma.album.count(),
    prisma.album.findMany({
      orderBy: { updatedAt: "desc" },
      take: 8,
      select: {
        id: true,
        title: true,
        artist: true,
        coverUrl: true,
        updatedAt: true,
      },
    }),
  ]);

  return { totalAlbums, recent };
}

export default async function AdminPage() {
  const { totalAlbums, recent } = await getDashboardData();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-500 mt-1">Manage canonical album metadata</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {[
          { icon: Disc3, label: "Total Albums", value: totalAlbums, color: "purple" },
          { icon: BarChart3, label: "In Library", value: totalAlbums, color: "green" },
          { icon: ListOrdered, label: "Users", value: "—", color: "orange" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Icon className="w-4.5 h-4.5 text-purple-400" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-zinc-500">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/admin/albums/new"
          className="flex items-center gap-3 p-4 rounded-xl bg-purple-600/20 border border-purple-500/30 hover:bg-purple-600/30 transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
            <Plus className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-white">Add New Album</p>
            <p className="text-xs text-zinc-500">Search Spotify and add to library</p>
          </div>
        </Link>
        <Link
          href="/admin/albums"
          className="flex items-center gap-3 p-4 rounded-xl glass glass-hover transition-colors group"
        >
          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
            <Disc3 className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <p className="font-medium text-white">Manage Albums</p>
            <p className="text-xs text-zinc-500">Edit canonical album metadata</p>
          </div>
        </Link>
      </div>

      {/* Recent */}
      <div>
        <h2 className="font-serif text-lg font-bold text-white mb-4">
          Recently Updated
        </h2>
        <div className="space-y-2">
          {recent.map((album) => (
            <Link
              key={album.id}
              href={`/admin/albums/${album.id}`}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-surface-2">
                {album.coverUrl && (
                  <Image
                    src={album.coverUrl}
                    alt={album.title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate group-hover:text-purple-300 transition-colors">
                  {album.title}
                </p>
                <p className="text-xs text-zinc-500 truncate">{album.artist}</p>
              </div>
              <span className="text-xs text-zinc-600 hidden md:block w-20 text-right">
                {format(new Date(album.updatedAt), "MMM d")}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
