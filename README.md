# spocli

Spotify Command Line Interface for people who want search, playback, playlists, stats, and a small terminal Wrapped without leaving the shell.

## Features

- Spotify OAuth 2.0 Authorization Code Flow with PKCE
- Persistent local token storage with automatic refresh
- Search tracks, artists, albums, and playlists
- Artist and album detail views
- Playlist listing, creation, viewing, and deletion by unfollowing
- Spotify Connect playback controls
- Current playback view with progress bar
- Recommendations from artist, genre, or track seeds
- Top artists, tracks, genres, and terminal Wrapped cards
- CSV and JSON exports
- Recent tracks, devices, device switching, and lyrics availability helper

## Requirements

- Node.js 22 or newer
- A Spotify account
- A Spotify Developer application

## Install

From npm after publishing:

```bash
npm install -g @renancandim/spocli
```

From source:

```bash
npm install
npm run build
npm link
```

## Spotify Developer Setup

1. Open the Spotify Developer Dashboard.
2. Create an app.
3. Add this Redirect URI:

```text
http://127.0.0.1:8888/callback
```

4. Export your Client ID:

```bash
export SPOTIFY_CLIENT_ID="your-client-id"
```

PowerShell:

```powershell
$env:SPOTIFY_CLIENT_ID = "your-client-id"
```

No client secret is needed because spocli uses PKCE.

See [docs/SPOTIFY_SETUP.md](docs/SPOTIFY_SETUP.md) for more options.

## Authentication

```bash
spocli login
spocli whoami
spocli logout
```

`spocli login` opens your browser, starts a localhost callback server, exchanges the code using PKCE, and stores tokens in your user config directory with restricted file permissions.

## Commands

### Search

```bash
spocli search track "numb"
spocli search artist "linkin park"
spocli search album "meteora"
spocli search playlist "focus"
```

Use `--limit` to change result count:

```bash
spocli search track "jazz" --limit 20
```

### Artist

```bash
spocli artist "Linkin Park"
```

Shows followers, genres, popularity, top tracks, and Spotify URL.

### Album

```bash
spocli album "Meteora"
```

Shows album metadata, release date, duration, artists, and track list.

### Playlists

```bash
spocli playlists
spocli playlists --limit 50 --offset 50
spocli playlist show <playlist-id>
spocli playlist create "Terminal Favorites"
spocli playlist delete <playlist-id>
spocli playlist delete <playlist-id> --yes
```

Spotify removes owned playlists from your account by unfollowing them, which is what `playlist delete` performs.

### Playback

```bash
spocli play
spocli pause
spocli next
spocli previous
spocli volume 65
spocli now
```

Playback commands use Spotify Connect and require an active Spotify device.

Example current playback output:

```text
♪ Now Playing

Track: Numb
Artist: Linkin Park
Album: Meteora
Device: Desktop

[██████████████░░░░░░░░░] 2:15 / 3:08
```

### Recommendations

```bash
spocli recommend --artist "Daft Punk"
spocli recommend --genre "synth-pop"
spocli recommend --track "One More Time"
spocli recommend --artist "Daft Punk" --genre "dance"
```

### Stats

```bash
spocli stats
spocli stats --range month
spocli stats --range 6-months
spocli stats --range all-time
```

Shows top artists, top tracks, top genres, and listening habit signals based on Spotify top-item ranges.

### Wrapped

```bash
spocli wrapped
spocli wrapped --range all-time
```

Renders terminal cards for top artists, songs, genres, and a summary.

### Export

```bash
spocli export csv
spocli export json
spocli export csv --output ./exports
```

Exports top tracks, top artists, and playlists.

### Bonus

```bash
spocli recent
spocli devices
spocli device switch <device-id>
spocli lyrics
```

Spotify Web API does not expose full lyrics. `spocli lyrics` shows the current track and explains where to open Spotify lyrics.

## Configuration

Environment variables:

- `SPOTIFY_CLIENT_ID`: required for authenticated commands.
- `SPOTIFY_REDIRECT_URI`: optional full redirect URI override.
- `SPOCLI_REDIRECT_PORT`: optional localhost port, default `8888`.
- `SPOCLI_CONFIG_DIR`: optional token/config directory override.

## Architecture

```text
src/commands  Commander command definitions and terminal rendering calls
src/services  Use-case orchestration and business logic
src/spotify   Spotify Web API client
src/auth      OAuth PKCE, callback server, token persistence
src/utils     Formatting, config, tables, logging, errors
src/types     Strong Spotify domain types
```

Commands are intentionally thin. Services coordinate use cases. `SpotifyApiClient` owns API transport, authorization headers, and Spotify error mapping.

## Development

```bash
npm install
npm run dev -- --help
npm run lint
npm test
npm run build
```

## CI

GitHub Actions runs:

- dependency install
- ESLint
- Vitest
- TypeScript build

## Publishing

```bash
npm publish --access=public
```

Users can then install globally:

```bash
npm install -g @renancandim/spocli
```

## License

MIT
