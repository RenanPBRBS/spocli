# Contributing

Thanks for helping improve spocli.

## Development

```bash
npm install
npm run dev -- --help
npm run lint
npm test
npm run build
```

## Guidelines

- Keep Commander command modules thin.
- Put Spotify API calls in `src/spotify`.
- Put use-case behavior in `src/services`.
- Add unit tests for formatting, validation, data transformation, and service logic.
- Keep errors actionable for terminal users.

## Releases

The package is configured for npm publishing:

```bash
npm publish --access=public
```

`prepublishOnly` runs lint, tests, and build.
