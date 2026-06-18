import type { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createServices } from "../services/service-container.js";
import { formatArtists, formatDuration } from "../utils/format.js";
import { logger } from "../utils/logger.js";
import { createTable } from "../utils/table.js";
import { runAction } from "./action.js";

export function registerAlbumCommands(program: Command): void {
  program
    .command("album")
    .argument("<name>", "album name")
    .description("Show album details and track list")
    .action(
      runAction(async (name: string) => {
        const spinner = ora("Loading album...").start();
        const album = await createServices().album.findByName(name);
        spinner.stop();

        if (!album) {
          logger.warn(`Album "${name}" was not found.`);
          return;
        }

        const tracks = album.tracks?.items ?? [];
        const duration = tracks.reduce((total, track) => total + track.duration_ms, 0);

        logger.plain(chalk.bold.cyan(album.name));
        logger.plain(`Artists: ${formatArtists(album.artists)}`);
        logger.plain(`Release date: ${album.release_date}`);
        logger.plain(`Tracks: ${album.total_tracks}`);
        logger.plain(`Duration: ${formatDuration(duration)}`);
        logger.plain(`URL: ${album.external_urls.spotify}`);
        logger.plain("");

        const table = createTable(["#", "Track", "Artists", "Duration"]);
        tracks.forEach((track, index) => {
          table.push([index + 1, track.name, formatArtists(track.artists), formatDuration(track.duration_ms)]);
        });
        logger.plain(table.toString());
      })
    );
}
