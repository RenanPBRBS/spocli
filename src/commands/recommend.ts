import type { Command } from "commander";
import ora from "ora";
import { createServices } from "../services/service-container.js";
import { runAction } from "./action.js";
import { renderTracks } from "./renderers.js";

export function registerRecommendCommand(program: Command): void {
  program
    .command("recommend")
    .description("Get song recommendations")
    .option("--artist <artist>", "seed artist")
    .option("--genre <genre>", "seed genre")
    .option("--track <track>", "seed track")
    .action(
      runAction(async (options: { artist?: string; genre?: string; track?: string }) => {
        const spinner = ora("Finding recommendations...").start();
        const tracks = await createServices().recommend.recommend(options);
        spinner.stop();
        renderTracks(tracks);
      })
    );
}
