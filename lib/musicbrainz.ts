const MB_BASE = "https://musicbrainz.org/ws/2";
const USER_AGENT = "Albums/1.0 (https://github.com/stgage/albums)";

export type MusicBrainzAlbum = {
  id: string; // release group MBID
  title: string;
  artist: string;
  releaseDate: string;
  primaryType: string;
  genres: string[];
};

export async function searchAlbums(query: string): Promise<MusicBrainzAlbum[]> {
  const url = `${MB_BASE}/release-group?query=${encodeURIComponent(query)}&fmt=json&limit=25`;
  const res = await fetch(url, {
    headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error(`MusicBrainz search error: ${res.statusText}`);
  const data = await res.json();

  return (data["release-groups"] ?? [])
    .filter((rg: RawReleaseGroup) =>
      ["Album", "EP"].includes(rg["primary-type"] ?? "")
    )
    .map((rg: RawReleaseGroup) => ({
      id: rg.id,
      title: rg.title,
      artist:
        rg["artist-credit"]?.[0]?.name ??
        rg["artist-credit"]?.[0]?.artist?.name ??
        "Unknown Artist",
      releaseDate: rg["first-release-date"] ?? "",
      primaryType: rg["primary-type"] ?? "Album",
      genres: (rg.tags ?? [])
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((t) => t.name),
    }));
}

type RawReleaseGroup = {
  id: string;
  title: string;
  "artist-credit"?: { name?: string; artist?: { name: string } }[];
  "first-release-date"?: string;
  "primary-type"?: string;
  tags?: { name: string; count: number }[];
};
