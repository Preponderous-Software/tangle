"""Serves Tangle on this PC only (127.0.0.1), with the right types for .js and .wasm (Windows'
registry often says text/plain for .js) and no caching, so the window always runs the files just
copied. Used by tools/play-tangle.bat and tools/playtest-launch.sh.

    py -3 tools/serve.py <game dir> [port] [--probe-dir DIR]

With --probe-dir, the page's playtester probe (?probe, src/probe.js) posts here, and this writes
DIR/state.json (atomically) and appends DIR/events.jsonl (Preponderous-Software/playtester's
probe contract).
"""
import functools, http.server, json, os, sys

PROBE_DIR = None


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map,
                          **{".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm",
                             ".html": "text/html", ".css": "text/css"})

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_POST(self):
        if not PROBE_DIR or self.path not in ("/__probe/state", "/__probe/event"):
            self.send_error(404)
            return
        n = min(int(self.headers.get("Content-Length") or 0), 1 << 20)
        try:
            body = json.loads(self.rfile.read(n) or b"{}")
            if self.path == "/__probe/state":
                tmp = os.path.join(PROBE_DIR, ".state.json.tmp")
                with open(tmp, "w", encoding="utf-8") as f:
                    json.dump(body, f)
                os.replace(tmp, os.path.join(PROBE_DIR, "state.json"))
            else:
                with open(os.path.join(PROBE_DIR, "events.jsonl"), "a", encoding="utf-8") as f:
                    f.write(json.dumps(body) + "\n")
        except (ValueError, OSError):
            pass  # the probe never takes the game down
        self.send_response(204)
        self.end_headers()

    def log_message(self, *args):
        pass


def main():
    global PROBE_DIR
    args = sys.argv[1:]
    if "--probe-dir" in args:
        i = args.index("--probe-dir")
        PROBE_DIR = args[i + 1]
        del args[i:i + 2]
        os.makedirs(PROBE_DIR, exist_ok=True)
    root = args[0] if len(args) > 0 else "."
    port = int(args[1]) if len(args) > 1 else 8786
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Handler, directory=root))
    print(f"Tangle is at http://127.0.0.1:{port}/  (this window stops when the game closes)")
    server.serve_forever()


if __name__ == "__main__":
    main()
