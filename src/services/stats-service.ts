import type { SpotifyApiClient } from "../spotify/spotify-api-client.js";
import type { SpotifyArtist, SpotifyTrack, TimeRange } from "../types/spotify.js";

export type UserStats = {
  topArtists: SpotifyArtist[];
  topTracks: SpotifyTrack[];
  topGenres: { genre: string; count: number }[];
};

export class StatsService {
  public constructor(private readonly api: SpotifyApiClient) {}

  public async getStats(timeRange: TimeRange): Promise<UserStats> {
    const [artists, tracks] = await Promise.all([
      this.api.getTopArtists(timeRange, 20),
      this.api.getTopTracks(timeRange, 20)
    ]);

    return {
      topArtists: artists.items,
      topTracks: tracks.items,
      topGenres: countGenres(artists.items)
    };
  }
}

export function countGenres(artists: SpotifyArtist[]): { genre: string; count: number }[] {
  const counts = new Map<string, number>();

  for (const artist of artists) {
    for (const genre of artist.genres ?? []) {
      counts.set(genre, (counts.get(genre) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .map(([genre, count]) => ({ genre, count }))
    .sort((a, b) => b.count - a.count || a.genre.localeCompare(b.genre));
}
