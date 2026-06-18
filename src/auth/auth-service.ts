import http from "node:http";
import { URL } from "node:url";
import axios from "axios";
import open from "open";
import ora from "ora";
import { createCodeChallenge, generateCodeVerifier, generateState } from "./pkce.js";
import type { TokenStore } from "./token-store.js";
import { spotifyScopes } from "../utils/config.js";
import { SpocliError } from "../utils/errors.js";
import type { SpotifyCredentials, TokenSet } from "../types/auth.js";

type SpotifyTokenResponse = {
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: "Bearer";
};

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const EXPIRY_BUFFER_MS = 60_000;

export class AuthService {
  public constructor(
    private readonly tokenStore: TokenStore,
    private readonly credentials: SpotifyCredentials
  ) {}

  public async login(): Promise<void> {
    const verifier = generateCodeVerifier();
    const state = generateState();
    const challenge = createCodeChallenge(verifier);
    const redirectUrl = new URL(this.credentials.redirectUri);

    const authUrl = new URL(AUTHORIZE_ENDPOINT);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("client_id", this.credentials.clientId);
    authUrl.searchParams.set("scope", spotifyScopes);
    authUrl.searchParams.set("redirect_uri", this.credentials.redirectUri);
    authUrl.searchParams.set("state", state);
    authUrl.searchParams.set("code_challenge_method", "S256");
    authUrl.searchParams.set("code_challenge", challenge);

    const callback = this.listenForCallback(Number(redirectUrl.port), redirectUrl.pathname, state);
    const spinner = ora("Waiting for Spotify authorization...").start();
    await open(authUrl.toString());
    const tokenResponse = await callback;
    const tokens = await this.exchangeCode(tokenResponse, verifier);
    await this.tokenStore.set(tokens);
    spinner.succeed("Authenticated with Spotify.");
  }

  public async logout(): Promise<void> {
    await this.tokenStore.clear();
  }

  public async getAccessToken(): Promise<string> {
    const tokens = await this.tokenStore.get();

    if (!tokens) {
      throw new SpocliError("You are not logged in. Run `spocli login` first.");
    }

    if (tokens.expiresAt - EXPIRY_BUFFER_MS > Date.now()) {
      return tokens.accessToken;
    }

    const refreshed = await this.refresh(tokens);
    await this.tokenStore.set(refreshed);
    return refreshed.accessToken;
  }

  private async listenForCallback(port: number, pathname: string, expectedState: string): Promise<string> {
    return await new Promise((resolve, reject) => {
      const server = http.createServer((request, response) => {
        try {
          const requestUrl = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);

          if (requestUrl.pathname !== pathname) {
            response.writeHead(404).end("Not found");
            return;
          }

          const error = requestUrl.searchParams.get("error");
          if (error) {
            throw new SpocliError(`Spotify authorization failed: ${error}`);
          }

          const code = requestUrl.searchParams.get("code");
          const state = requestUrl.searchParams.get("state");

          if (!code || state !== expectedState) {
            throw new SpocliError("Invalid OAuth callback received.");
          }

          response
            .writeHead(200, { "content-type": "text/html" })
            .end("<h1>spocli is connected</h1><p>You can close this browser tab.</p>");
          server.close();
          resolve(code);
        } catch (error) {
          response
            .writeHead(400, { "content-type": "text/html" })
            .end("<h1>spocli authorization failed</h1><p>Return to your terminal.</p>");
          server.close();
          reject(error instanceof Error ? error : new Error(String(error)));
        }
      });

      server.once("error", (error) => reject(error));
      server.listen(port, "127.0.0.1");
    });
  }

  private async exchangeCode(code: string, verifier: string): Promise<TokenSet> {
    const body = new URLSearchParams({
      client_id: this.credentials.clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: this.credentials.redirectUri,
      code_verifier: verifier
    });

    const { data } = await axios.post<SpotifyTokenResponse>(TOKEN_ENDPOINT, body, {
      headers: { "content-type": "application/x-www-form-urlencoded" }
    });

    if (!data.refresh_token) {
      throw new SpocliError("Spotify did not return a refresh token. Try logging in again.");
    }

    return mapTokenResponse(data);
  }

  private async refresh(tokens: TokenSet): Promise<TokenSet> {
    const body = new URLSearchParams({
      client_id: this.credentials.clientId,
      grant_type: "refresh_token",
      refresh_token: tokens.refreshToken
    });

    const { data } = await axios.post<SpotifyTokenResponse>(TOKEN_ENDPOINT, body, {
      headers: { "content-type": "application/x-www-form-urlencoded" }
    });

    return {
      ...mapTokenResponse(data),
      refreshToken: data.refresh_token ?? tokens.refreshToken
    };
  }
}

function mapTokenResponse(response: SpotifyTokenResponse): TokenSet {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token ?? "",
    expiresAt: Date.now() + response.expires_in * 1000,
    scope: response.scope,
    tokenType: response.token_type
  };
}
