# Releasing Tangle

Releases are GitHub releases tagged `vX.Y.Z` (`v0.3.0`); the version inside the tag, in
`package.json` and in the download's name is the bare `X.Y.Z`. They are made by the fleet's release
automation: it sets the version in a pull request, checks the merged commit (saves, CI, a dry run of
the release workflow) and pushes the tag. The tag push runs the `Release` workflow
([`.github/workflows/release.yml`](../.github/workflows/release.yml)), which builds the download,
creates the release if it does not exist yet ("Tangle <version>") and attaches the download.

The arcade (https://tangle.play.danielstephenson.dev) is separate and unchanged: `test.yml` deploys
every push to `main`, stamped `<version>+g<sha>` from `package.json`.

## Versions

Two places hold the version, and must agree (`tests/release.test.mjs` and the workflow check):

| File | Field |
| --- | --- |
| `package.json` | `"version"` |
| `src/probe.js` | `const VERSION = "x.y.z";` (exactly this form, one line): the version the playtest probe reports |

## The download

| Asset | Contents |
| --- | --- |
| `tangle-<version>-web.zip` | `tangle-<version>-web/`: exactly what the arcade deploy ships (`index.html`, `src/`, `assets/`, the four `engine/` files) plus `version.txt` (`<version>+g<sha>`). Unzip, serve the folder (`python3 -m http.server`), play. |
| `tangle-<version>-web.zip.sha256` | Its SHA-256, in the format `sha256sum -c` reads |

[`tools/build-release.sh`](../tools/build-release.sh) builds it; its file list matches the deploy's
"Gather the site" step in `test.yml` (`tests/release.test.mjs` checks). To build it locally:

```bash
tools/build-release.sh 0.3.0 "$(git rev-parse HEAD)" dist
```

A pull request that changes the workflow, the build script or `package.json` runs the workflow as a
dry run; running it by hand with no tag does the same:

```bash
gh workflow run release.yml --repo Preponderous-Software/tangle --ref <branch>
```

## Saves

The game keeps two localStorage keys: `tangle.v1` (the progress) and `tangle.settings`. Reading,
restoring and writing them is in [`src/save.js`](../src/save.js), which also holds `SAVE_VERSION`,
the format version of both.

- `tests/fixtures/saves/v<N>-<name>.json` are real saves: what localStorage held (key -> stored
  string) after a playthrough of the released build wrote them (`v1-early.json`), or what
  `src/save.js` itself writes for a given progress (`v1-complete.json`: every room solved and the
  settings changed).
- [`tests/saves.test.mjs`](../tests/saves.test.mjs) lists every fixture by file name, fails on an
  unlisted file, and loads each one through `src/save.js`, the path the game loads with.
- Released fixtures never change. A change to what is stored bumps `SAVE_VERSION`, adds a migration
  on load (older saves keep loading as they did) and adds a `v<SAVE_VERSION>-<name>.json` fixture,
  listed in the test. The release automation refuses a release that edits a released fixture,
  lowers `SAVE_VERSION`, or lacks a fixture for a format.
