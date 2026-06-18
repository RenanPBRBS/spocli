import type { SearchService } from "./search-service.js";
import type { SpotifyApiClient } from "../spotify/spotify-api-client.js";
import { SpocliError } from "../utils/errors.js";
import type { SpotifyTrack } from "../types/spotify.js";

export type RecommendationInput = {
  artist?: string;
  genre?: string;
  track?: string;
};

export class RecommendationService {
  public constructor(
    private readonly api: SpotifyApiClient,
    private readonly searchService: SearchService
  ) {}

  public async recommend(input: RecommendationInput): Promise<SpotifyTrack[]> {
    const seeds: Record<string, string> = {};

    if (input.artist) {
      const [artist] = await this.searchService.search("artist", input.artist, 1);
      if (!artist) {
        throw new SpocliError(`Artist "${input.artist}" was not found.`);
      }
      seeds.seed_artists = artist.id;
    }

    if (input.track) {
      const [track] = await this.searchService.search("track", input.track, 1);
      if (!track) {
        throw new SpocliError(`Track "${input.track}" was not found.`);
      }
      seeds.seed_tracks = track.id;
    }

    if (input.genre) {
      seeds.seed_genres = input.genre;
    }

    if (Object.keys(seeds).length === 0) {
      throw new SpocliError("Provide at least one seed: --artist, --genre, or --track.");
    }

    return await this.api.getRecommendations(seeds);
  }
}
