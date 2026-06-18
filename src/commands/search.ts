import type { Command } from "commander";
import ora from "ora";
import { createServices } from "../services/service-container.js";
import { logger } from "../utils/logger.js";
import { runAction } from "./action.js";
import { renderAlbums, renderArtists, renderPlaylists, renderTracks } from "./renderers.js";

export function registerSearchCommands(program: Command): void {
  const search = program.command("search").description("Search Spotify catalog");

  for (const type of ["track", "artist", "album", "playlist"] as const) {
    search
      .command(type)
      .argument("<query>", `Spotify ${type} search query`)
      .option("-l, --limit <number>", "number of results", "10")
      .description(`Search ${type}s`)
      .action(
        runAction(async (query: string, options: { limit: string }) => {
          const limit = Number(options.limit);
          const services = createServices();
          const spinner = ora(`Searching ${type}s...`).start();

          if (type === "track") {
            const results = await services.search.search("track", query, limit);
            spinner.stop();
            if (results.length > 0) {
              renderTracks(results);
            } else {
              logger.warn("No results found.");
            }
            return;
          }

          if (type === "artist") {
            const results = await services.search.search("artist", query, limit);
            spinner.stop();
            if (results.length > 0) {
              renderArtists(results);
            } else {
              logger.warn("No results found.");
            }
            return;
          }

          if (type === "album") {
            const results = await services.search.search("album", query, limit);
            spinner.stop();
            if (results.length > 0) {
              renderAlbums(results);
            } else {
              logger.warn("No results found.");
            }
            return;
          }

          const results = await services.search.search("playlist", query, limit);
          spinner.stop();
          if (results.length > 0) {
            renderPlaylists(results);
          } else {
            logger.warn("No results found.");
          }
        })
      );
  }
}
