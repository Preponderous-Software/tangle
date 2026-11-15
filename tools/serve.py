"""Serves Tangle on this PC only (127.0.0.1), with the right types for .js and .wasm (Windows'
registry often says text/plain for .js) and no caching, so the window always runs the files just
copied. Used by tools/play-tangle.bat.

    py -3 tools/serve.py <game dir> [port]
"""
import functools, http.server, sys


class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = dict(http.server.SimpleHTTPRequestHandler.extensions_map,
                          **{".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm",
                             ".html": "text/html", ".css": "text/css"})

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, *args):
        pass


def main():
    root = sys.argv[1] if len(sys.argv) > 1 else "."
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 8786
    server = http.server.ThreadingHTTPServer(("127.0.0.1", port), functools.partial(Handler, directory=root))
    print(f"Tangle is at http://127.0.0.1:{port}/  (this window stops when the game closes)")
    server.serve_forever()


if __name__ == "__main__":
    main()
