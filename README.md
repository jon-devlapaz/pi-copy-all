# pi-copy-all

Copy the user and assistant messages on the current Pi conversation branch to the clipboard with `/copy-all`.

## Install

Requires Node.js 22.19+ and Pi. Tested with Pi 1.4.0.

```sh
pi install git:github.com/jon-devlapaz/pi-copy-all
```

Restart Pi or run `/reload`, then run `/copy-all`. To pin the initial release, install `git:github.com/jon-devlapaz/pi-copy-all@v0.1.0`.

Do not also load a local copy of the extension: it registers the same command.

## Behavior and privacy

- Waits until the agent is idle, then reads only the current conversation branch.
- Includes user and assistant text, separated by role labels.
- Represents images as `[image]`; excludes tool results and non-text assistant blocks.
- Uses Pi's clipboard helper. Clipboard availability depends on the host environment.
- Makes no network requests and does not modify session history.

Conversation text may contain sensitive information. The command copies that text without redacting it; clipboard managers, synchronization, and other applications may retain or read it.

## Development

```sh
npm ci --ignore-scripts
npm run check
npm test
npm run format:check
npm pack --dry-run --ignore-scripts
```

Tests use synthetic conversations and mock the clipboard; they do not read your sessions or change your clipboard. Pi supplies the SDK at runtime; its development dependency is not bundled.

## Provenance and license

Extracted from [`extensions/copy-all` in tink-pi-config](https://github.com/jon-devlapaz/tink-pi-config/tree/ee119209b8ee479c3d1463f0ea8602fa30c756bc/extensions/copy-all), first recorded on September 25, 2026 under `jon-devlapaz`. The repository owner confirmed permission to release the source under MIT before this extraction. Git attribution does not establish whether code was human-written or AI-assisted.

MIT. See [LICENSE](LICENSE).
