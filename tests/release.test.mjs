import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

test("src/probe.js's VERSION is package.json's version, in the one-line form release tooling rewrites", () => {
  const pkg = JSON.parse(read("../package.json"));
  assert.match(pkg.version, /^\d+\.\d+\.\d+$/);
  const lines = read("../src/probe.js").split("\n").filter((l) => /\bVERSION\s*=/.test(l));
  assert.equal(lines.length, 1);
  assert.equal(lines[0], `const VERSION = "${pkg.version}";`);
});

test("the release zip ships exactly the files the arcade deploy gathers", () => {
  // the cp lines of test.yml's "Gather the site" step, word for word, in tools/build-release.sh
  const deploy = read("../.github/workflows/test.yml").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("cp "));
  const build = read("../tools/build-release.sh").split("\n").map((l) => l.trim()).filter((l) => l.startsWith("cp "));
  assert.ok(deploy.length >= 3, "found the deploy's cp lines");
  const norm = (l) => l.replace(/"\$site\/?([^"]*)"/g, "SITE/$1");
  assert.deepEqual(build.map(norm), deploy.map(norm));
});
