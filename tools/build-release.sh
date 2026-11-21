#!/usr/bin/env bash
# Builds Tangle's release download into <out-dir>:
#
#   tangle-<version>-web.zip          tangle-<version>-web/: exactly the files the arcade deploy ships
#                                     (index.html, src/, assets/, the four engine files), plus version.txt
#   tangle-<version>-web.zip.sha256   its SHA-256, in the format `sha256sum -c` reads
#
# The release workflow (.github/workflows/release.yml) runs this; it also runs by hand on Linux with
# python3 and sha256sum:
#
#   tools/build-release.sh 0.3.0 "$(git rev-parse HEAD)" dist
#
# The file list is the one in .github/workflows/test.yml's "Gather the site" step; keep the two in step
# (tests/release.test.mjs checks).
set -euo pipefail

version=${1:?usage: build-release.sh <version> <commit-sha> <out-dir>}
sha=${2:?usage: build-release.sh <version> <commit-sha> <out-dir>}
out=${3:?usage: build-release.sh <version> <commit-sha> <out-dir>}

root=$(cd "$(dirname "$0")/.." && pwd)
mkdir -p "$out"
out=$(cd "$out" && pwd)
work=$(mktemp -d)
trap 'rm -rf "$work"' EXIT

name="tangle-${version}-web"
site="$work/$name"
mkdir -p "$site/engine"
cd "$root"
cp index.html "$site/"
cp -r src assets "$site/"
cp engine/tangle-engine.js engine/tangle-engine.wasm engine/strata-kit.js engine/strata-loader.js "$site/engine/"
echo "${version}+g${sha::7}" > "$site/version.txt"

rm -f "$out/$name.zip" "$out/$name.zip.sha256"
(cd "$work" && python3 -m zipfile -c "$out/$name.zip" "$name")
(cd "$out" && sha256sum "$name.zip" > "$name.zip.sha256")
ls -l "$out"
