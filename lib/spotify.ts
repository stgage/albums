const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Spotify token error: ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

export interface SpotifyAlbum {
  id: string;
  name: string;
  artists: { name: string }[];
  images: { url: string; width: number; height: number }[];
  release_date: string;
  total_tracks: number;
  genres: string[];
  tracks?: {
    items: SpotifyTrack[];
  };
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  duration_ms: number;
  track_number: number;
  disc_number: number;
  preview_url: string | null;
  artists: { name: string }[];
}

export async function searchAlbums(query: string): Promise<SpotifyAlbum[]> {
  const token = await getAccessToken();
  const res = await fetch(
    `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=album&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    }
  );

  if (!res.ok) throw new Error(`Spotify search error: ${res.statusText}`);
  const data = await res.json();
  return data.albums?.items ?? [];
}

export async function getSpotifyAlbum(spotifyId: string): Promise<SpotifyAlbum> {
  const token = await getAccessToken();
  const res = await fetch(`${SPOTIFY_API_BASE}/albums/${spotifyId}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`Spotify album error: ${res.statusText}`);
  return res.json();
}

export function getBestImage(images: SpotifyAlbum["images"]): string {
  if (!images || images.length === 0) return "/placeholder.png";
  const sorted = [...images].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0].url;
}

export function parseReleaseYear(releaseDate: string): number {
  return parseInt(releaseDate.split("-")[0]);
}
