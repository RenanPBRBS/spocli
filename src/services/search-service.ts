import type { SpotifyApiClient } from "../spotify/spotify-api-client.js";
import type {
  SearchType,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyPlaylist,
  SpotifyTrack
} from "../types/spotify.js";

type SearchResultMap = {
  track: SpotifyTrack;
  artist: SpotifyArtist;
  album: SpotifyAlbum;
  playlist: SpotifyPlaylist;
};

export class SearchService {
  public constructor(private readonly api: SpotifyApiClient) {}

  public async search<TType extends SearchType>(
    type: TType,
    query: string,
    limit = 10
  ): Promise<SearchResultMap[TType][]> {
    const results = await this.api.search<SearchResultMap[TType]>(type, query, limit);
    return results.items;
  }
}
