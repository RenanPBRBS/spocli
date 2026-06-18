import type { Command } from "commander";
import ora from "ora";
import { createServices } from "../services/service-container.js";
import { SpocliError } from "../utils/errors.js";
import { logger } from "../utils/logger.js";
import { runAction } from "./action.js";

export function registerExportCommand(program: Command): void {
  program
    .command("export")
    .argument("<format>", "csv or json")
    .option("-o, --output <dir>", "output directory", process.cwd())
    .description("Export top tracks, top artists, and playlists")
    .action(
      runAction(async (format: string, options: { output: string }) => {
        if (format !== "csv" && format !== "json") {
          throw new SpocliError("Export format must be csv or json.");
        }

        const spinner = ora("Exporting Spotify data...").start();
        const filePath = await createServices().export.export(format, options.output);
        spinner.stop();
        logger.success(`Exported ${filePath}`);
      })
    );
}
