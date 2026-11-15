#!/usr/bin/env bash
# Starts Tangle for playtester (Preponderous-Software/playtester, x11 driver): serves the game on a
# free local port and opens it in Chromium's app mode, which is the game's window.
# Usage: tools/playtest-launch.sh --data DIR [--playtest-out DIR] [--width W] [--height H] [--rooms all]
#   --rooms all   start with the first four rooms solved (to test the List and the end)
set -euo pipefail
here="$(cd "$(dirname "$0")/.." && pwd)"
data="" probe="" w=1280 h=720 rooms=""
while [ $# -gt 0 ]; do
  case "$1" in
    --data) data="$2"; shift 2;;
    --playtest-out) probe="$2"; shift 2;;
    --width) w="$2"; shift 2;;
    --height) h="$2"; shift 2;;
    --rooms) rooms="$2"; shift 2;;
    *) echo "unknown argument: $1" >&2; exit 2;;
  esac
done
[ -n "$data" ] || { echo "--data is required" >&2; exit 2; }
mkdir -p "$data"
port=$(python3 -c 'import socket; s=socket.socket(); s.bind(("127.0.0.1", 0)); print(s.getsockname()[1])')
python3 "$here/tools/serve.py" "$here" "$port" ${probe:+--probe-dir "$probe"} > "$data/serve.log" 2>&1 &
srv=$!
cleanup() { kill "$srv" 2>/dev/null || true; }
trap cleanup EXIT INT TERM
for _ in $(seq 100); do curl -s -o /dev/null "http://127.0.0.1:$port/" && break; sleep 0.1; done
q="?new=1"; [ -n "$probe" ] && q="$q&probe"; [ "$rooms" = all ] && q="$q&skip=4"
chrome="${PT_CHROMIUM:-$(ls -d "$HOME"/.cache/ms-playwright/chromium-*/chrome-linux*/chrome 2>/dev/null | sort -V | tail -1)}"
[ -x "$chrome" ] || { echo "No Chromium found: set PT_CHROMIUM or run 'npx playwright install chromium'" >&2; exit 1; }
sandbox=(); [ "$(id -u)" = 0 ] && sandbox=(--no-sandbox)  # Chromium refuses to run as root otherwise
# A fresh profile per session keeps saves apart.
"$chrome" --app="http://127.0.0.1:$port/index.html$q" --user-data-dir="$data/chrome" \
  --window-size="$w,$h" --window-position=0,0 --no-first-run --no-default-browser-check --disable-features=Translate \
  --use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader --autoplay-policy=no-user-gesture-required \
  --password-store=basic --test-type --class=Tangle "${sandbox[@]}" > "$data/chrome.log" 2>&1
