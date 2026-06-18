export type SpotifyImage = {
  url: string;
  height: number | null;
  width: number | null;
};

export type SpotifyExternalUrls = {
  spotify: string;
};

export type SpotifyFollowers = {
  total: number;
};

export type SpotifyArtist = {
  id: string;
  name: string;
  genres?: string[];
  followers?: SpotifyFollowers;
  popularity?: number;
  external_urls: SpotifyExternalUrls;
  images?: SpotifyImage[];
};

export type SpotifyAlbum = {
  id: string;
  name: string;
  album_type: string;
  release_date: string;
  total_tracks: number;
  artists: SpotifyArtist[];
  external_urls: SpotifyExternalUrls;
  images?: SpotifyImage[];
  tracks?: SpotifyPaging<SpotifyTrack>;
};

export type SpotifyTrack = {
  id: string;
  name: string;
  duration_ms: number;
  explicit: boolean;
  popularity?: number;
  artists: SpotifyArtist[];
  album?: SpotifyAlbum;
  external_urls: SpotifyExternalUrls;
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string | null;
  public: boolean | null;
  collaborative: boolean;
  tracks: {
    total: number;
  };
  owner: {
    id: string;
    display_name: string | null;
  };
  external_urls: SpotifyExternalUrls;
};

export type SpotifyDevice = {
  id: string | null;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number | null;
};

export type SpotifyPaging<T> = {
  href: string;
  items: T[];
  limit: number;
  next: string | null;
  offset: number;
  previous: string | null;
  total: number;
};

export type SpotifyUser = {
  id: string;
  display_name: string | null;
  email?: string;
  country?: string;
  product?: string;
  external_urls: SpotifyExternalUrls;
  followers?: SpotifyFollowers;
};

export type SpotifyPlayback = {
  device: SpotifyDevice;
  repeat_state: string;
  shuffle_state: boolean;
  context: unknown;
  timestamp: number;
  progress_ms: number | null;
  is_playing: boolean;
  item: SpotifyTrack | null;
};

export type TimeRange = "short_term" | "medium_term" | "long_term";

export type SearchType = "track" | "artist" | "album" | "playlist";
