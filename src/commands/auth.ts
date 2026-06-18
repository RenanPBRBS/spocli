import type { Command } from "commander";
import ora from "ora";
import { FileTokenStore } from "../auth/token-store.js";
import { createServices } from "../services/service-container.js";
import { logger } from "../utils/logger.js";
import { runAction } from "./action.js";

export function registerAuthCommands(program: Command): void {
  program
    .command("login")
    .description("Authenticate with Spotify using OAuth 2.0 Authorization Code Flow with PKCE")
    .action(runAction(async () => createServices().auth.login()));

  program
    .command("logout")
    .description("Remove stored Spotify credentials")
    .action(
      runAction(async () => {
        await new FileTokenStore().clear();
        logger.success("Logged out.");
      })
    );

  program
    .command("whoami")
    .description("Show the authenticated Spotify profile")
    .action(
      runAction(async () => {
        const spinner = ora("Loading profile...").start();
        const profile = await createServices().api.getMe();
        spinner.stop();
        logger.plain(`ID: ${profile.id}`);
        logger.plain(`Name: ${profile.display_name ?? "Unknown"}`);
        logger.plain(`Email: ${profile.email ?? "Hidden"}`);
        logger.plain(`Country: ${profile.country ?? "Unknown"}`);
        logger.plain(`Plan: ${profile.product ?? "Unknown"}`);
        logger.plain(`URL: ${profile.external_urls.spotify}`);
      })
    );
}
