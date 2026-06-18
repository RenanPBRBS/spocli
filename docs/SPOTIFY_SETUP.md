# Spotify Developer Setup

1. Visit the Spotify Developer Dashboard and create an app.
2. Copy the app Client ID.
3. Add `http://127.0.0.1:8888/callback` as a Redirect URI.
4. Export the Client ID before running `spocli login`.

```bash
export SPOTIFY_CLIENT_ID="your-client-id"
```

PowerShell:

```powershell
$env:SPOTIFY_CLIENT_ID = "your-client-id"
```

The CLI uses Authorization Code Flow with PKCE, so no client secret is required.

Optional environment variables:

- `SPOTIFY_REDIRECT_URI`: override the full redirect URI.
- `SPOCLI_REDIRECT_PORT`: change the localhost callback port when using the default redirect URI.
- `SPOCLI_CONFIG_DIR`: override token storage location.
