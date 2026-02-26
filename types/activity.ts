export type ActivityItem = {
  id: string;
  type: string;
  data: unknown;
  createdAt: Date | string;
  user: {
    username: string | null;
    name: string | null;
    image: string | null;
  };
  album: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string | null;
    dominantColor: string | null;
  };
};
