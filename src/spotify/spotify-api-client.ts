import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { AuthService } from "../auth/auth-service.js";
import { SpocliError } from "../utils/errors.js";
import type {
  SearchType,
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyDevice,
  SpotifyPaging,
  SpotifyPlayback,
  SpotifyPlaylist,
  SpotifyTrack,
  SpotifyUser,
  TimeRange
} from "../types/spotify.js";

type SearchResponse = Partial<Record<`${SearchType}s`, SpotifyPaging<unknown>>>;

export class SpotifyApiClient {
  private readonly http: AxiosInstance;

  public constructor(private readonly authService: AuthService) {
    this.http = axios.create({
      baseURL: "https://api.spotify.com/v1",
      timeout: 15_000
    });
  }

  public async getMe(): Promise<SpotifyUser> {
    return await this.request<SpotifyUser>({ method: "GET", url: "/me" });
  }

  public async search<T>(type: SearchType, query: string, limit = 10): Promise<SpotifyPaging<T>> {
    const data = await this.request<SearchResponse>({
      method: "GET",
      url: "/search",
      params: { q: query, type, limit }
    });

    const key = `${type}s` as const;
    return data[key] as SpotifyPaging<T>;
  }

  public async getArtist(id: string): Promise<SpotifyArtist> {
    return await this.request<SpotifyArtist>({ method: "GET", url: `/artists/${id}` });
  }

  public async getArtistTopTracks(id: string, market = "US"): Promise<SpotifyTrack[]> {
    const data = await this.request<{ tracks: SpotifyTrack[] }>({
      method: "GET",
      url: `/artists/${id}/top-tracks`,
      params: { market }
    });
    return data.tracks;
  }

  public async getAlbum(id: string): Promise<SpotifyAlbum> {
    return await this.request<SpotifyAlbum>({ method: "GET", url: `/albums/${id}` });
  }

  public async getMyPlaylists(limit = 20, offset = 0): Promise<SpotifyPaging<SpotifyPlaylist>> {
    return await this.request<SpotifyPaging<SpotifyPlaylist>>({
      method: "GET",
      url: "/me/playlists",
      params: { limit, offset }
    });
  }

  public async getPlaylist(id: string): Promise<SpotifyPlaylist> {
    return await this.request<SpotifyPlaylist>({ method: "GET", url: `/playlists/${id}` });
  }

  public async getPlaylistTracks(id: string, limit = 50): Promise<SpotifyPaging<{ track: SpotifyTrack }>> {
    return await this.request<SpotifyPaging<{ track: SpotifyTrack }>>({
      method: "GET",
      url: `/playlists/${id}/tracks`,
      params: { limit }
    });
  }

  public async createPlaylist(userId: string, name: string): Promise<SpotifyPlaylist> {
    return await this.request<SpotifyPlaylist>({
      method: "POST",
      url: `/users/${userId}/playlists`,
      data: { name, public: false }
    });
  }

  public async unfollowPlaylist(id: string): Promise<void> {
    await this.request<void>({ method: "DELETE", url: `/playlists/${id}/followers` });
  }

  public async play(): Promise<void> {
    await this.request<void>({ method: "PUT", url: "/me/player/play" });
  }

  public async pause(): Promise<void> {
    await this.request<void>({ method: "PUT", url: "/me/player/pause" });
  }

  public async next(): Promise<void> {
    await this.request<void>({ method: "POST", url: "/me/player/next" });
  }

  public async previous(): Promise<void> {
    await this.request<void>({ method: "POST", url: "/me/player/previous" });
  }

  public async setVolume(volumePercent: number): Promise<void> {
    await this.request<void>({
      method: "PUT",
      url: "/me/player/volume",
      params: { volume_percent: volumePercent }
    });
  }

  public async getPlayback(): Promise<SpotifyPlayback | null> {
    return await this.request<SpotifyPlayback | null>({ method: "GET", url: "/me/player" });
  }

  public async getRecommendations(params: Record<string, string>): Promise<SpotifyTrack[]> {
    const data = await this.request<{ tracks: SpotifyTrack[] }>({
      method: "GET",
      url: "/recommendations",
      params: { limit: 20, ...params }
    });
    return data.tracks;
  }

  public async getTopArtists(timeRange: TimeRange, limit = 20): Promise<SpotifyPaging<SpotifyArtist>> {
    return await this.request<SpotifyPaging<SpotifyArtist>>({
      method: "GET",
      url: "/me/top/artists",
      params: { time_range: timeRange, limit }
    });
  }

  public async getTopTracks(timeRange: TimeRange, limit = 20): Promise<SpotifyPaging<SpotifyTrack>> {
    return await this.request<SpotifyPaging<SpotifyTrack>>({
      method: "GET",
      url: "/me/top/tracks",
      params: { time_range: timeRange, limit }
    });
  }

  public async getRecentlyPlayed(limit = 20): Promise<{ items: { track: SpotifyTrack; played_at: string }[] }> {
    return await this.request<{ items: { track: SpotifyTrack; played_at: string }[] }>({
      method: "GET",
      url: "/me/player/recently-played",
      params: { limit }
    });
  }

  public async getDevices(): Promise<SpotifyDevice[]> {
    const data = await this.request<{ devices: SpotifyDevice[] }>({ method: "GET", url: "/me/player/devices" });
    return data.devices;
  }

  public async transferPlayback(deviceId: string): Promise<void> {
    await this.request<void>({
      method: "PUT",
      url: "/me/player",
      data: { device_ids: [deviceId], play: true }
    });
  }

  private async request<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const accessToken = await this.authService.getAccessToken();
      const response = await this.http.request<T>({
        ...config,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${accessToken}`
        }
      });
      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        const status = error.response?.status;
        const message = getSpotifyErrorMessage(error);
        throw new SpocliError(status ? `Spotify API ${status}: ${message}` : message);
      }

      throw error;
    }
  }
}

function getSpotifyErrorMessage(error: AxiosError): string {
  const data = error.response?.data;

  if (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    typeof data.error === "object" &&
    data.error !== null &&
    "message" in data.error
  ) {
    return String(data.error.message);
  }

  return error.message;
}
