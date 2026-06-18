import os from "node:os";
import path from "node:path";
import { SpocliError } from "./errors.js";
import type { SpotifyCredentials } from "../types/auth.js";

const DEFAULT_PORT = 8888;

export function getConfigDir(): string {
  if (process.env.SPOCLI_CONFIG_DIR) {
    return process.env.SPOCLI_CONFIG_DIR;
  }

  if (process.platform === "win32") {
    return path.join(process.env.APPDATA ?? os.homedir(), "spocli");
  }

  return path.join(process.env.XDG_CONFIG_HOME ?? path.join(os.homedir(), ".config"), "spocli");
}

export function getCredentials(): SpotifyCredentials {
  const clientId = process.env.SPOTIFY_CLIENT_ID;

  if (!clientId) {
    throw new SpocliError(
      "SPOTIFY_CLIENT_ID is required. Create a Spotify app and export SPOTIFY_CLIENT_ID first."
    );
  }

  const port = Number(process.env.SPOCLI_REDIRECT_PORT ?? DEFAULT_PORT);
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI ?? `http://127.0.0.1:${port}/callback`;
  return { clientId, redirectUri };
}

export const spotifyScopes = [
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "user-read-recently-played",
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private"
].join(" ");
