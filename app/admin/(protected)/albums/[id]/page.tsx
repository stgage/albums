import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { AlbumForm } from "@/components/admin/AlbumForm";
import type { Metadata } from "next";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const album = await prisma.album.findUnique({ where: { id }, select: { title: true } });
  return { title: album ? `Edit ${album.title} — Admin` : "Edit Album" };
}

export default async function EditAlbumPage({ params }: Props) {
  const { id } = await params;
  const album = await prisma.album.findUnique({
    where: { id },
  });

  if (!album) notFound();

  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Edit Album</h1>
        <p className="text-zinc-500 mt-1">
          {album.title} — {album.artist}
        </p>
      </div>
      <AlbumForm album={album} />
    </div>
  );
}
