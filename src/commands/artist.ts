import type { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createServices } from "../services/service-container.js";
import { formatNumber } from "../utils/format.js";
import { logger } from "../utils/logger.js";
import { runAction } from "./action.js";
import { renderTracks } from "./renderers.js";

export function registerArtistCommands(program: Command): void {
  program
    .command("artist")
    .argument("<name>", "artist name")
    .description("Show artist details and top tracks")
    .action(
      runAction(async (name: string) => {
        const spinner = ora("Loading artist...").start();
        const details = await createServices().artist.findByName(name);
        spinner.stop();

        if (!details) {
          logger.warn(`Artist "${name}" was not found.`);
          return;
        }

        logger.plain(chalk.bold.cyan(details.artist.name));
        logger.plain(`Followers: ${formatNumber(details.artist.followers?.total)}`);
        logger.plain(`Genres: ${details.artist.genres?.join(", ") || "Unknown"}`);
        logger.plain(`Popularity: ${details.artist.popularity ?? "Unknown"}`);
        logger.plain(`URL: ${details.artist.external_urls.spotify}`);
        logger.plain("");
        logger.plain(chalk.bold("Top tracks"));
        renderTracks(details.topTracks.slice(0, 10));
      })
    );
}
