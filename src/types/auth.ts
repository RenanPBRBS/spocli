export type TokenSet = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  scope: string;
  tokenType: "Bearer";
};

export type SpotifyCredentials = {
  clientId: string;
  redirectUri: string;
};
