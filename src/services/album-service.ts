import type { SpotifyApiClient } from "../spotify/spotify-api-client.js";
import type { SpotifyAlbum } from "../types/spotify.js";

export class AlbumService {
  public constructor(private readonly api: SpotifyApiClient) {}

  public async findByName(name: string): Promise<SpotifyAlbum | null> {
    const results = await this.api.search<SpotifyAlbum>("album", name, 1);
    const album = results.items[0];

    if (!album) {
      return null;
    }

    return await this.api.getAlbum(album.id);
  }
}
