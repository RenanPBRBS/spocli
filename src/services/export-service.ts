import fs from "node:fs/promises";
import path from "node:path";
import type { PlaylistService } from "./playlist-service.js";
import type { StatsService } from "./stats-service.js";
import { formatArtists } from "../utils/format.js";

export type ExportFormat = "csv" | "json";

export class ExportService {
  public constructor(
    private readonly statsService: StatsService,
    private readonly playlistService: PlaylistService
  ) {}

  public async export(format: ExportFormat, outputDir = process.cwd()): Promise<string> {
    const [stats, playlists] = await Promise.all([
      this.statsService.getStats("medium_term"),
      this.playlistService.list(50, 0)
    ]);

    await fs.mkdir(outputDir, { recursive: true });
    const filePath = path.join(outputDir, `spocli-export.${format}`);

    if (format === "json") {
      await fs.writeFile(
        filePath,
        `${JSON.stringify(
          {
            exportedAt: new Date().toISOString(),
            topTracks: stats.topTracks,
            topArtists: stats.topArtists,
            playlists: playlists.items
          },
          null,
          2
        )}\n`
      );
      return filePath;
    }

    const rows = [
      ["type", "rank", "name", "artists_or_owner", "url"],
      ...stats.topTracks.map((track, index) => [
        "top_track",
        String(index + 1),
        track.name,
        formatArtists(track.artists),
        track.external_urls.spotify
      ]),
      ...stats.topArtists.map((artist, index) => [
        "top_artist",
        String(index + 1),
        artist.name,
        "",
        artist.external_urls.spotify
      ]),
      ...playlists.items.map((playlist, index) => [
        "playlist",
        String(index + 1),
        playlist.name,
        playlist.owner.display_name ?? playlist.owner.id,
        playlist.external_urls.spotify
      ])
    ];

    await fs.writeFile(filePath, `${rows.map(toCsvRow).join("\n")}\n`);
    return filePath;
  }
}

function toCsvRow(values: string[]): string {
  return values.map((value) => `"${value.replaceAll('"', '""')}"`).join(",");
}
