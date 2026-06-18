import type { SpotifyApiClient } from "../spotify/spotify-api-client.js";
import type { SpotifyPaging, SpotifyPlaylist, SpotifyTrack } from "../types/spotify.js";

export type PlaylistDetails = {
  playlist: SpotifyPlaylist;
  tracks: SpotifyTrack[];
};

export class PlaylistService {
  public constructor(private readonly api: SpotifyApiClient) {}

  public async list(limit: number, offset: number): Promise<SpotifyPaging<SpotifyPlaylist>> {
    return await this.api.getMyPlaylists(limit, offset);
  }

  public async show(id: string): Promise<PlaylistDetails> {
    const [playlist, tracks] = await Promise.all([
      this.api.getPlaylist(id),
      this.api.getPlaylistTracks(id)
    ]);

    return {
      playlist,
      tracks: tracks.items.map((item) => item.track).filter(Boolean)
    };
  }

  public async create(name: string): Promise<SpotifyPlaylist> {
    const user = await this.api.getMe();
    return await this.api.createPlaylist(user.id, name);
  }

  public async remove(id: string): Promise<void> {
    await this.api.unfollowPlaylist(id);
  }
}
