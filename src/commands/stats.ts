import type { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createServices } from "../services/service-container.js";
import { normalizeTimeRange } from "../utils/format.js";
import { logger } from "../utils/logger.js";
import { createTable } from "../utils/table.js";
import { runAction } from "./action.js";
import { renderArtists, renderTracks, renderWrappedCard } from "./renderers.js";

export function registerStatsCommands(program: Command): void {
  program
    .command("stats")
    .description("Show your Spotify listening statistics")
    .option("-r, --range <range>", "month, 6-months, or all-time", "6-months")
    .action(
      runAction(async (options: { range: string }) => {
        const spinner = ora("Loading stats...").start();
        const stats = await createServices().stats.getStats(normalizeTimeRange(options.range));
        spinner.stop();
        logger.plain(chalk.bold.cyan("Top artists"));
        renderArtists(stats.topArtists.slice(0, 10));
        logger.plain(chalk.bold.cyan("Top tracks"));
        renderTracks(stats.topTracks.slice(0, 10));
        logger.plain(chalk.bold.cyan("Top genres"));
        const table = createTable(["#", "Genre", "Count"]);
        stats.topGenres.slice(0, 10).forEach((genre, index) => table.push([index + 1, genre.genre, genre.count]));
        logger.plain(table.toString());
      })
    );

  program
    .command("wrapped")
    .description("Generate a terminal Spotify Wrapped experience")
    .option("-r, --range <range>", "month, 6-months, or all-time", "all-time")
    .action(
      runAction(async (options: { range: string }) => {
        const spinner = ora("Preparing Wrapped...").start();
        const stats = await createServices().stats.getStats(normalizeTimeRange(options.range));
        spinner.stop();
        renderWrappedCard("spocli Wrapped", [
          `Your #1 artist: ${stats.topArtists[0]?.name ?? "Unknown"}`,
          `Your #1 song: ${stats.topTracks[0]?.name ?? "Unknown"}`,
          `Signature genre: ${stats.topGenres[0]?.genre ?? "Unknown"}`,
          `Artists analyzed: ${stats.topArtists.length}`,
          `Tracks analyzed: ${stats.topTracks.length}`
        ]);
        logger.plain("");
        renderWrappedCard(
          "Top Artists",
          stats.topArtists.slice(0, 5).map((artist, index) => `${index + 1}. ${artist.name}`)
        );
        logger.plain("");
        renderWrappedCard(
          "Top Songs",
          stats.topTracks.slice(0, 5).map((track, index) => `${index + 1}. ${track.name}`)
        );
      })
    );
}
