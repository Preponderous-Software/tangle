#!/usr/bin/env bash
# Builds Tangle's engine (engine/host.cpp) into engine/tangle-engine.{js,wasm}, and copies the
# Strata web kit's page scripts (strata-kit.js, strata-loader.js) beside them. All four are
# committed, so playing Tangle needs no build step; run this only after changing host.cpp.
#
# Strata comes from its public v0.7.0 release (the wasm32-emscripten tarball, kit 1.1), checked
# against its SHA-256. Needs emsdk 6.0.11 activated: the version Strata's release is built with
# (everything linked into one .wasm must agree on it and on -fwasm-exceptions).
#
#   source /path/to/emsdk/emsdk_env.sh && engine/build.sh
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
work="${TANGLE_ENGINE_WORK:-$here/.build}"
mkdir -p "$work"

export STRATA_VERSION=0.7.0
export STRATA_SHA256=1aab559eb2477f42bfbeae1cd2e3cf70fcb8aa8b28fc8dce16ba1e0ba855049f
tarball="$work/strata-$STRATA_VERSION-wasm32-emscripten.tar.gz"
if [ ! -f "$tarball" ]; then
  curl -fsSL -o "$tarball.part" \
    "https://github.com/Preponderous-Software/strata/releases/download/v$STRATA_VERSION/strata-$STRATA_VERSION-wasm32-emscripten.tar.gz"
  mv "$tarball.part" "$tarball"
fi
echo "$STRATA_SHA256  $tarball" | sha256sum -c --quiet -
rm -rf "$work/strata" && mkdir -p "$work/strata"
tar xzf "$tarball" -C "$work/strata"

export STRATA_TARBALL="$tarball"
export KIT_DIR="$work/strata/kit"
export KIT_SOURCE="$here/host.cpp"
export KIT_OUT="$here"
export KIT_NAME=tangle-engine
export KIT_EXPORT_NAME=createTangleEngine
export KIT_EXPORTS=_tangle_configure,_tangle_view,_tangle_texture,_tangle_mesh,_tangle_items,_tangle_points,_tangle_lights
export KIT_WORK="$work"
export EMSDK_VERSION=6.0.11

bash "$KIT_DIR/build-kit.sh"
