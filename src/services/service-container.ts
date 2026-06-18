import { AuthService } from "../auth/auth-service.js";
import { FileTokenStore } from "../auth/token-store.js";
import { SpotifyApiClient } from "../spotify/spotify-api-client.js";
import { getCredentials } from "../utils/config.js";
import { AlbumService } from "./album-service.js";
import { ArtistService } from "./artist-service.js";
import { ExportService } from "./export-service.js";
import { PlaybackService } from "./playback-service.js";
import { PlaylistService } from "./playlist-service.js";
import { RecommendationService } from "./recommendation-service.js";
import { SearchService } from "./search-service.js";
import { StatsService } from "./stats-service.js";

export type ServiceContainer = ReturnType<typeof createServices>;

export function createServices() {
  const tokenStore = new FileTokenStore();
  const auth = new AuthService(tokenStore, getCredentials());
  const api = new SpotifyApiClient(auth);
  const search = new SearchService(api);
  const artist = new ArtistService(api);
  const album = new AlbumService(api);
  const playlist = new PlaylistService(api);
  const playback = new PlaybackService(api);
  const stats = new StatsService(api);

  return {
    auth,
    api,
    search,
    artist,
    album,
    playlist,
    playback,
    recommend: new RecommendationService(api, search),
    stats,
    export: new ExportService(stats, playlist)
  };
}
