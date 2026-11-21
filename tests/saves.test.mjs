// Released saves keep loading. Each fixture in tests/fixtures/saves/ is what localStorage held (key ->
// the stored string) after a playthrough of the released build (tools/playthrough.cjs's route, through
// the real inputs) wrote it. Every one is loaded here through src/save.js, the path the game loads with,
// and must come back with its progress.
//
// Contract (src/save.js): released fixtures never change. A new save format bumps SAVE_VERSION, adds a
// migration on load and a v<SAVE_VERSION>-<name>.json fixture, listed below by its file name.
import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync, readdirSync} from "node:fs";
import {SAVE_VERSION, SAVE_KEY, SETTINGS_KEY, SETTINGS_DEFAULTS, parseRecord, loadSettings, restoreState, saveRecord} from "../src/save.js";

const FIXTURES = [
  "v1-early.json",
];
const DIR = new URL("./fixtures/saves/", import.meta.url);

function fixture(name) {
  const data = JSON.parse(readFileSync(new URL(name, DIR), "utf8"));
  for (const [k, v] of Object.entries(data)) assert.equal(typeof v, "string", `${name}: ${k} must hold the stored string`);
  return data;
}
// what the game does at boot: store.get(key) is localStorage.getItem(key), null when absent
function boot(name) {
  const data = fixture(name);
  const get = (k) => (k in data ? data[k] : null);
  const saved = parseRecord(get(SAVE_KEY));
  return {data, saved, state: restoreState(saved), settings: loadSettings(get(SETTINGS_KEY))};
}

test("every fixture is listed, and every listed fixture exists", () => {
  assert.deepEqual(readdirSync(DIR).sort(), [...FIXTURES].sort());
});

test("there is a fixture for every save format up to SAVE_VERSION", () => {
  assert.equal(SAVE_VERSION, 1);
  for (let v = 1; v <= SAVE_VERSION; v++) assert.ok(FIXTURES.some((f) => f.startsWith(`v${v}-`)), `no fixture for format ${v}`);
  for (const f of FIXTURES) assert.match(f, /^v\d+-[a-z0-9-]+\.json$/);
});

test("v1-early.json: the triangle solved, nothing else", () => {
  const {state, settings} = boot("v1-early.json");
  assert.deepEqual(state.solved, {tribar: true, miu: false, scr: false, stair: false, list: false, godel: false});
  assert.equal(state.hint, true);
  assert.deepEqual([...state.seenRooms], ["tri"]);
  assert.equal(state.gateOpen, false);
  assert.deepEqual(state.made, ["MI"]);
  assert.equal(state.epilogue, false);
  assert.deepEqual(settings, SETTINGS_DEFAULTS);  // settings never touched: none stored
});

test("loading a fixture and saving straight away writes back the same string", () => {
  for (const name of FIXTURES) {
    const {data, saved, state} = boot(name);
    assert.equal(saveRecord(state, saved.pose), data[SAVE_KEY], name);
  }
});

test("a missing or broken record reads as a new game with the default settings", () => {
  for (const raw of [null, "", "{", "not json"]) {
    assert.deepEqual(parseRecord(raw), {});
    assert.deepEqual(restoreState(parseRecord(raw)).solved, {tribar: false, miu: false, scr: false, stair: false, list: false, godel: false});
    assert.deepEqual(loadSettings(raw), SETTINGS_DEFAULTS);
  }
});
