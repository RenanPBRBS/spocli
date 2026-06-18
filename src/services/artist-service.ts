import type { SpotifyApiClient } from "../spotify/spotify-api-client.js";
import type { SpotifyArtist, SpotifyTrack } from "../types/spotify.js";

export type ArtistDetails = {
  artist: SpotifyArtist;
  topTracks: SpotifyTrack[];
};

export class ArtistService {
  public constructor(private readonly api: SpotifyApiClient) {}

  public async findByName(name: string): Promise<ArtistDetails | null> {
    const results = await this.api.search<SpotifyArtist>("artist", name, 1);
    const artist = results.items[0];

    if (!artist) {
      return null;
    }

    const [fullArtist, topTracks] = await Promise.all([
      this.api.getArtist(artist.id),
      this.api.getArtistTopTracks(artist.id)
    ]);

    return { artist: fullArtist, topTracks };
  }
}
