import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { UserAlbumEditForm } from "@/components/my/UserAlbumEditForm";
import type { Metadata } from "next";

type Props = { params: Promise<{ userAlbumId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userAlbumId } = await params;
  const ua = await prisma.userAlbum.findUnique({
    where: { id: userAlbumId },
    select: { album: { select: { title: true } } },
  });
  return { title: ua ? `Edit ${ua.album.title}` : "Edit Album" };
}

export default async function UserAlbumEditPage({ params }: Props) {
  const { userAlbumId } = await params;
  const session = await auth();
  if (!session?.user) redirect("/login");
  // @ts-expect-error custom session
  const userId: string = session.user.id;

  const userAlbum = await prisma.userAlbum.findUnique({
    where: { id: userAlbumId },
    include: {
      album: true,
      relistens: { orderBy: { date: "desc" } },
    },
  });

  if (!userAlbum || userAlbum.userId !== userId) notFound();

  // Total ranked count for rank input max
  const totalRanked = await prisma.userAlbum.count({
    where: { userId, rank: { not: null } },
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <UserAlbumEditForm
        userAlbum={{
          id: userAlbum.id,
          rank: userAlbum.rank,
          status: userAlbum.status,
          shortBlurb: userAlbum.shortBlurb,
          review: userAlbum.review,
          listenDate: userAlbum.listenDate,
          moodTags: userAlbum.moodTags,
          userGenreTags: userAlbum.userGenreTags,
          favoriteTracks: userAlbum.favoriteTracks,
          relistens: userAlbum.relistens.map((r) => ({
            id: r.id,
            date: r.date.toISOString(),
            notes: r.notes,
          })),
          album: {
            id: userAlbum.album.id,
            title: userAlbum.album.title,
            artist: userAlbum.album.artist,
            coverUrl: userAlbum.album.coverUrl,
            releaseYear: userAlbum.album.releaseYear,
          },
        }}
        totalRanked={totalRanked}
      />
    </div>
  );
}
