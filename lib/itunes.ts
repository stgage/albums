export type ItunesAlbum = {
  collectionId: number;
  collectionName: string;
  artistName: string;
  artworkUrl100: string;
  releaseDate: string;
  trackCount: number;
  primaryGenreName: string;
};

export async function searchAlbums(query: string): Promise<ItunesAlbum[]> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=12`,
    { next: { revalidate: 60 } }
  );
  if (!res.ok) throw new Error(`iTunes search error: ${res.statusText}`);
  const data = await res.json();
  return (data.results ?? []).filter(
    (r: { wrapperType: string }) => r.wrapperType === "collection"
  );
}
