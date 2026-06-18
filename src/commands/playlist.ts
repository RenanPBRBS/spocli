import { confirm } from "@inquirer/prompts";
import type { Command } from "commander";
import chalk from "chalk";
import ora from "ora";
import { createServices } from "../services/service-container.js";
import { logger } from "../utils/logger.js";
import { runAction } from "./action.js";
import { renderPlaylists, renderTracks } from "./renderers.js";

export function registerPlaylistCommands(program: Command): void {
  program
    .command("playlists")
    .description("List your playlists")
    .option("-l, --limit <number>", "page size", "20")
    .option("-o, --offset <number>", "page offset", "0")
    .action(
      runAction(async (options: { limit: string; offset: string }) => {
        const spinner = ora("Loading playlists...").start();
        const page = await createServices().playlist.list(Number(options.limit), Number(options.offset));
        spinner.stop();
        renderPlaylists(page.items);
        logger.plain(`Showing ${page.items.length} of ${page.total}. Offset ${page.offset}.`);
      })
    );

  const playlist = program.command("playlist").description("Manage playlists");

  playlist
    .command("show")
    .argument("<id>", "playlist id")
    .description("Show playlist details and tracks")
    .action(
      runAction(async (id: string) => {
        const spinner = ora("Loading playlist...").start();
        const details = await createServices().playlist.show(id);
        spinner.stop();
        logger.plain(chalk.bold.cyan(details.playlist.name));
        logger.plain(`Owner: ${details.playlist.owner.display_name ?? details.playlist.owner.id}`);
        logger.plain(`Tracks: ${details.playlist.tracks.total}`);
        logger.plain(`URL: ${details.playlist.external_urls.spotify}`);
        logger.plain("");
        renderTracks(details.tracks);
      })
    );

  playlist
    .command("create")
    .argument("<name>", "playlist name")
    .description("Create a private playlist")
    .action(
      runAction(async (name: string) => {
        const spinner = ora("Creating playlist...").start();
        const created = await createServices().playlist.create(name);
        spinner.stop();
        logger.success(`Created playlist: ${created.name}`);
        logger.plain(`ID: ${created.id}`);
        logger.plain(`URL: ${created.external_urls.spotify}`);
      })
    );

  playlist
    .command("delete")
    .argument("<id>", "playlist id")
    .option("-y, --yes", "skip confirmation")
    .description("Unfollow/delete a playlist from your library")
    .action(
      runAction(async (id: string, options: { yes?: boolean }) => {
        const shouldDelete =
          options.yes ??
          (await confirm({
            message: "Spotify deletes owned playlists by unfollowing them. Continue?",
            default: false
          }));

        if (!shouldDelete) {
          logger.warn("Cancelled.");
          return;
        }

        const spinner = ora("Deleting playlist...").start();
        await createServices().playlist.remove(id);
        spinner.stop();
        logger.success("Playlist removed from your library.");
      })
    );
}
