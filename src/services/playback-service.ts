import { SpocliError } from "../utils/errors.js";
import type { SpotifyApiClient } from "../spotify/spotify-api-client.js";
import type { SpotifyDevice, SpotifyPlayback } from "../types/spotify.js";

export class PlaybackService {
  public constructor(private readonly api: SpotifyApiClient) {}

  public async play(): Promise<void> {
    await this.api.play();
  }

  public async pause(): Promise<void> {
    await this.api.pause();
  }

  public async next(): Promise<void> {
    await this.api.next();
  }

  public async previous(): Promise<void> {
    await this.api.previous();
  }

  public async volume(volume: number): Promise<void> {
    if (!Number.isInteger(volume) || volume < 0 || volume > 100) {
      throw new SpocliError("Volume must be an integer from 0 to 100.");
    }

    await this.api.setVolume(volume);
  }

  public async now(): Promise<SpotifyPlayback | null> {
    return await this.api.getPlayback();
  }

  public async recent(limit = 20): Promise<{ track: { name: string; artists: { name: string }[] }; played_at: string }[]> {
    const data = await this.api.getRecentlyPlayed(limit);
    return data.items;
  }

  public async devices(): Promise<SpotifyDevice[]> {
    return await this.api.getDevices();
  }

  public async switchDevice(id: string): Promise<void> {
    await this.api.transferPlayback(id);
  }
}
