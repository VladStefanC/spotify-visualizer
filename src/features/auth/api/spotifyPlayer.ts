export type CurrentPlayback = {
  isPlaying: boolean;
  progressMs: number;
  durationMs: number;
  trackId: string | null;
  trackName: string | null;
  artistNames: string | null;
  albumName: string | null;
  albumImage: string | null;
};

type SpotifyPlayerResponse = {
  is_playing: boolean;
  progress_ms: number;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    album: {
      name: string;
      images: { url: string }[];
    };
    artists: { name: string }[];
  } | null;
};

const NOW_PLAYING_ENDPOINT =
  "https://api.spotify.com/v1/me/player/currently-playing";

export async function getCurrentlyPlaying(
  token: string,
): Promise<CurrentPlayback | null> {
  const res = await fetch(NOW_PLAYING_ENDPOINT, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 204) {
    return null;
  }

  if (!res.ok) {
    console.error("Failed to fetch current playback", res.status);
    return null;
  }

  const data = (await res.json()) as SpotifyPlayerResponse;

  const track = data.item;
  if (!track) {
    return null;
  }

  return {
    isPlaying: data.is_playing,
    progressMs: data.progress_ms,
    durationMs: track.duration_ms,
    trackId: track.id,
    trackName: track.name,
    artistNames: track.artists.map((artist) => artist.name).join(", "),
    albumName: track.album.name,
    albumImage: track.album.images[0]?.url ?? null,
  };
}
