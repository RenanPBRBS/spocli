#!/usr/bin/env node
import { Command } from "commander";
import { registerAlbumCommands } from "./commands/album.js";
import { registerArtistCommands } from "./commands/artist.js";
import { registerAuthCommands } from "./commands/auth.js";
import { registerExportCommand } from "./commands/export.js";
import { registerPlaybackCommands } from "./commands/playback.js";
import { registerPlaylistCommands } from "./commands/playlist.js";
import { registerRecommendCommand } from "./commands/recommend.js";
import { registerSearchCommands } from "./commands/search.js";
import { registerStatsCommands } from "./commands/stats.js";

const program = new Command();

program
  .name("spocli")
  .description("Spotify Command Line Interface")
  .version("1.0.0")
  .showHelpAfterError()
  .showSuggestionAfterError();

registerAuthCommands(program);
registerSearchCommands(program);
registerArtistCommands(program);
registerAlbumCommands(program);
registerPlaylistCommands(program);
registerPlaybackCommands(program);
registerRecommendCommand(program);
registerStatsCommands(program);
registerExportCommand(program);

await program.parseAsync(process.argv);
