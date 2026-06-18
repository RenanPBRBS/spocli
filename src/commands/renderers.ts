import chalk from "chalk";
import { createTable } from "../utils/table.js";
import { formatArtists, formatDuration, formatNumber, progressBar, truncate } from "../utils/format.js";
import { logger } from "../utils/logger.js";
import type {
  SpotifyAlbum,
  SpotifyArtist,
  SpotifyDevice,
  SpotifyPlayback,
  SpotifyPlaylist,
  SpotifyTrack
} from "../types/spotify.js";

export function renderTracks(tracks: SpotifyTrack[]): void {
  const table = createTable(["#", "Track", "Artist", "Album", "Time"]);
  tracks.forEach((track, index) => {
    table.push([
      index + 1,
      truncate(track.name, 34),
      truncate(formatArtists(track.artists), 28),
      truncate(track.album?.name ?? "Unknown", 20),
      formatDuration(track.duration_ms)
    ]);
  });
  logger.plain(table.toString());
}

export function renderArtists(artists: SpotifyArtist[]): void {
  const table = createTable(["#", "Artist", "Genres", "Followers", "Pop."]);
  artists.forEach((artist, index) => {
    table.push([
      index + 1,
      truncate(artist.name, 34),
      truncate(artist.genres?.join(", ") || "Unknown", 28),
      formatNumber(artist.followers?.total),
      artist.popularity ?? "?"
    ]);
  });
  logger.plain(table.toString());
}

export function renderAlbums(albums: SpotifyAlbum[]): void {
  const table = createTable(["#", "Album", "Artist", "Release", "Tracks"]);
  albums.forEach((album, index) => {
    table.push([
      index + 1,
      truncate(album.name, 34),
      truncate(formatArtists(album.artists), 28),
      album.release_date,
      album.total_tracks
    ]);
  });
  logger.plain(table.toString());
}

export function renderPlaylists(playlists: SpotifyPlaylist[]): void {
  const table = createTable(["#", "Playlist", "Owner", "Tracks", "ID"]);
  playlists.forEach((playlist, index) => {
    table.push([
      index + 1,
      truncate(playlist.name, 34),
      truncate(playlist.owner.display_name ?? playlist.owner.id, 28),
      playlist.tracks.total,
      playlist.id
    ]);
  });
  logger.plain(table.toString());
}

export function renderDevices(devices: SpotifyDevice[]): void {
  const table = createTable(["#", "Name", "Type", "Volume", "ID"]);
  devices.forEach((device, index) => {
    table.push([
      device.is_active ? chalk.green("*") : index + 1,
      truncate(device.name, 34),
      device.type,
      device.volume_percent ?? "?",
      device.id ?? "Unavailable"
    ]);
  });
  logger.plain(table.toString());
}

export function renderNowPlaying(playback: SpotifyPlayback | null): void {
  if (!playback?.item) {
    logger.warn("Nothing is currently playing.");
    return;
  }

  const progress = playback.progress_ms ?? 0;
  const duration = playback.item.duration_ms;
  logger.plain(chalk.green("♪ Now Playing"));
  logger.plain("");
  logger.plain(`${chalk.bold("Track:")} ${playback.item.name}`);
  logger.plain(`${chalk.bold("Artist:")} ${formatArtists(playback.item.artists)}`);
  logger.plain(`${chalk.bold("Album:")} ${playback.item.album?.name ?? "Unknown"}`);
  logger.plain(`${chalk.bold("Device:")} ${playback.device.name}`);
  logger.plain("");
  logger.plain(`${progressBar(progress, duration)} ${formatDuration(progress)} / ${formatDuration(duration)}`);
}

export function renderWrappedCard(title: string, lines: string[]): void {
  const width = 64;
  const border = "═".repeat(width - 2);
  logger.plain(chalk.magenta(`╔${border}╗`));
  logger.plain(chalk.magenta(`║ ${title.padEnd(width - 4)} ║`));
  logger.plain(chalk.magenta(`╠${border}╣`));
  for (const line of lines) {
    logger.plain(chalk.magenta("║ ") + line.padEnd(width - 4).slice(0, width - 4) + chalk.magenta(" ║"));
  }
  logger.plain(chalk.magenta(`╚${border}╝`));
}
