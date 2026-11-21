// Tangle's save: what the game keeps in localStorage and how it reads it back. Pure (no DOM, no
// storage), so node runs it too (tests/saves.test.mjs). src/game.js does the storage calls.
//
// Two keys, each a JSON string:
//   tangle.v1        the progress: rooms solved, each puzzle's state, the rooms seen, where you stand
//   tangle.settings  look speed, invert, sound, field of view, text size
//
// Save format contract: SAVE_VERSION is the format of both. Bump it when what is stored changes
// shape, add a migration on load (restoreState / loadSettings keep reading every older format as
// it loaded before), and add a fixture tests/fixtures/saves/v<SAVE_VERSION>-<name>.json, listed in
// tests/saves.test.mjs. Released fixtures never change.
import * as Diag from "./diagonal.js";
import * as Prover from "./prover.js";

export const SAVE_VERSION = 1;

export const SAVE_KEY = "tangle.v1", SETTINGS_KEY = "tangle.settings";
export const SETTINGS_DEFAULTS = {sens: 1, invert: false, sound: true, fov: 66, text: 1};

export function validRow(r) { return Array.isArray(r) && r.length === Diag.N && r.every((b) => b === 0 || b === 1) ? r.slice() : null; }
export function validList(l) { return Array.isArray(l) && l.length === Diag.N && l.every(validRow) ? l.map((r) => r.slice()) : null; }

/** A stored string (or null when there is none) as an object; a broken record reads as {}. */
export function parseRecord(raw) { try { return JSON.parse(raw || "{}"); } catch (e) { return {}; } }

/** The settings from their stored string: the defaults, overridden by whatever was stored. */
export function loadSettings(raw) { return Object.assign({...SETTINGS_DEFAULTS}, parseRecord(raw)); }

/** The game's state from a parsed save record (parseRecord). driven: the page is driven by a tool (no title card). */
export function restoreState(saved, {driven = false} = {}) {
  return {
    solved: {tribar: !!saved.tribar, miu: !!saved.miu, scr: !!saved.scr, stair: !!saved.stair, list: !!saved.list, godel: !!saved.godel},
    // Room 6: the Prover. fed: cards fed so far; blank: card 81's number; selfFed: card 81 fed while about itself; q: question
    prv: {fed: Array.isArray(saved.prv && saved.prv.fed) ? saved.prv.fed.filter((n) => n === 12 || n === 47) : [],
      blank: Prover.validBlank(saved.prv && saved.prv.blank) ? saved.prv.blank : Prover.START,
      selfFed: !!(saved.prv && saved.prv.selfFed) || !!saved.godel, q: saved.godel ? Prover.QUESTIONS.length : Math.min(1, (saved.prv && saved.prv.q) || 0),
      run: null, msg: null, good: false, qMsg: null, qGood: !!saved.godel},
    // Room 5: the librarian's list. round 0: the first list; 1: your row added; 2: beaten twice (the question)
    diag: {list: validList(saved.diag && saved.diag.list) || Diag.START.map((r) => r.slice()),
      guess: (saved.diag && validRow(saved.diag.guess)) || Array(Diag.N).fill(0),
      round: (saved.diag && saved.diag.round) || (saved.list ? 2 : 0), checks: (saved.diag && saved.diag.checks) || 0,
      escaped: !!(saved.diag && saved.diag.escaped) || !!saved.list, hint: (saved.diag && saved.diag.hint) || 0,
      diffs: null, later: null, msg: null, good: false, busy: false, qMsg: null, qGood: !!saved.list},
    loops: 0, loopedOnce: !!saved.loopedOnce || !!saved.stair, lastKey: -1, topMsg: null, topGood: false,
    screenDone: !!saved.screenDone || !!saved.scr,   // Room 3, part 1: seen the screen inside itself
    sentence: saved.sentence || 0, liarTried: saved.liarTried || {}, neitherOn: !!saved.neitherOn, boardMsg: null, boardGood: false,
    depth: 0, depthHold: 0,
    gateOpen: !!saved.gateOpen || !!saved.miu,
    made: saved.made || ["MI"],
    word: saved.word || "MI",
    history: saved.trail || [],
    sel: 0,                 // index into the current word's rule 3/4 spots
    presses: saved.presses || 0,
    machineTime: 0,
    triTime: 0,
    hint: !!saved.tribar,
    hold: 0,                // seconds lined up with the tribar
    card: driven ? null : "title",   // "title" | "menu" | "panel" | null
    frames: 0,
    room: "hub",
    seenRooms: new Set(saved.seen || []),
    glow: 0,                // the sculpture's solve light, fading
    boardShown: !!saved.boardShown || !!saved.miu,
    epilogue: !!saved.epilogue,   // walked the hall's last loop (out of the north door, in through the south)
    hallLoops: 0,
  };
}

/** The stored string for the game's state and where the player stands (me: {x, z, y, yaw, pitch}). */
export function saveRecord(state, me) {
  return JSON.stringify({tribar: state.solved.tribar, miu: state.solved.miu, scr: state.solved.scr, stair: state.solved.stair, list: state.solved.list, godel: state.solved.godel, prv: {fed: state.prv.fed, blank: state.prv.blank, selfFed: state.prv.selfFed, q: state.prv.q}, loopedOnce: state.loopedOnce,
    diag: {list: state.diag.list, guess: state.diag.guess, round: state.diag.round, checks: state.diag.checks, escaped: state.diag.escaped, hint: state.diag.hint},
    screenDone: state.screenDone, sentence: state.sentence, liarTried: state.liarTried, neitherOn: state.neitherOn, gateOpen: state.gateOpen,
    made: state.made.slice(-200), word: state.word, trail: state.history.slice(-40), presses: state.presses,
    seen: [...state.seenRooms], boardShown: state.boardShown, epilogue: state.epilogue, pose: {x: me.x, z: me.z, y: me.y, yaw: me.yaw, pitch: me.pitch}});
}
