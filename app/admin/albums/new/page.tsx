import { AlbumForm } from "@/components/admin/AlbumForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Add Album — Admin" };

export default function NewAlbumPage() {
  return (
    <div className="p-8 max-w-3xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-white">Add Album</h1>
        <p className="text-zinc-500 mt-1">
          Search Spotify and add a new album to your collection
        </p>
      </div>
      <AlbumForm />
    </div>
  );
}
