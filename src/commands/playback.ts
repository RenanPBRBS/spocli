import type { Command } from "commander";
import ora from "ora";
import { createServices } from "../services/service-container.js";
import { logger } from "../utils/logger.js";
import { createTable } from "../utils/table.js";
import { formatArtists } from "../utils/format.js";
import { runAction } from "./action.js";
import { renderDevices, renderNowPlaying } from "./renderers.js";

export function registerPlaybackCommands(program: Command): void {
  for (const commandName of ["play", "pause", "next", "previous"] as const) {
    program
      .command(commandName)
      .description(`${commandName} Spotify playback`)
      .action(
        runAction(async () => {
          const spinner = ora(`${commandName}...`).start();
          await createServices().playback[commandName]();
          spinner.stop();
          logger.success("Done.");
        })
      );
  }

  program
    .command("volume")
    .argument("<0-100>", "target volume percent")
    .description("Set Spotify Connect device volume")
    .action(
      runAction(async (value: string) => {
        const spinner = ora("Setting volume...").start();
        await createServices().playback.volume(Number(value));
        spinner.stop();
        logger.success(`Volume set to ${value}%.`);
      })
    );

  program
    .command("now")
    .description("Show current playback")
    .action(
      runAction(async () => {
        const spinner = ora("Loading current playback...").start();
        const playback = await createServices().playback.now();
        spinner.stop();
        renderNowPlaying(playback);
      })
    );

  program
    .command("recent")
    .description("Show recently played tracks")
    .option("-l, --limit <number>", "number of tracks", "20")
    .action(
      runAction(async (options: { limit: string }) => {
        const spinner = ora("Loading recent tracks...").start();
        const items = await createServices().playback.recent(Number(options.limit));
        spinner.stop();
        const table = createTable(["#", "Track", "Artist", "Played at"]);
        items.forEach((item, index) => {
          table.push([index + 1, item.track.name, formatArtists(item.track.artists), item.played_at]);
        });
        logger.plain(table.toString());
      })
    );

  program
    .command("devices")
    .description("List Spotify Connect devices")
    .action(
      runAction(async () => {
        const spinner = ora("Loading devices...").start();
        const devices = await createServices().playback.devices();
        spinner.stop();
        renderDevices(devices);
      })
    );

  program
    .command("lyrics")
    .description("Show lyrics availability for the current track")
    .action(
      runAction(async () => {
        const playback = await createServices().playback.now();
        renderNowPlaying(playback);
        logger.warn("Spotify Web API does not expose full lyrics. Open the Spotify URL above for synced lyrics.");
      })
    );

  const device = program.command("device").description("Manage Spotify Connect devices");
  device
    .command("switch")
    .argument("<id>", "device id")
    .description("Transfer playback to a device")
    .action(
      runAction(async (id: string) => {
        const spinner = ora("Switching device...").start();
        await createServices().playback.switchDevice(id);
        spinner.stop();
        logger.success("Playback transferred.");
      })
    );
}
