// Tangle: the page. Boots the Strata hall engine, builds the house, runs walking, the two puzzles,
// the narration, the cards (title, pause menu, debrief) and the sound. Pure logic lives in walk.js,
// miu.js, tribar.js and world.js.
import {v3, MeshBuilder} from "./geom.js";
import * as Walk from "./walk.js";
import {moves, MAX_LEN} from "./miu.js";
import {buildTribar} from "./tribar.js";
import * as World from "./world.js";
import * as Text from "./text.js";
import * as Audio from "./audio.js";
import {SENTENCES, answer as answerSentence, nestingDepth} from "./sentences.js";
import * as Diag from "./diagonal.js";
import * as Prover from "./prover.js";

const $ = (id) => document.getElementById(id);
const params = new URLSearchParams(location.search);
const driven = params.get("drive") === "1";
const canvas = $("view");
const store = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* private window */ } },
};
const SAVE_KEY = "tangle.v1", SETTINGS_KEY = "tangle.settings";
const touchFirst = matchMedia("(pointer: coarse)").matches;
const HOLD = 1.0, MIN_HFOV = 74;
let ambient = 0.45, fovNow = 66;  // set from settings at boot
const SPAWN = {x: 0, z: -0.8, yaw: Math.PI / 2, pitch: -0.04};

// ------------------------------------------------------------------ state
if (params.get("new") === "1") {  // play-tangle.bat new: start over, once (the address forgets it)
  store.set(SAVE_KEY, "{}");
  params.delete("new");
  history.replaceState(null, "", location.pathname + (params.toString() ? "?" + params : ""));
}
function validRow(r) { return Array.isArray(r) && r.length === Diag.N && r.every((b) => b === 0 || b === 1) ? r.slice() : null; }
function validList(l) { return Array.isArray(l) && l.length === Diag.N && l.every(validRow) ? l.map((r) => r.slice()) : null; }
if (params.get("skip") === "4" || params.get("skip") === "5") {
  // playtesting: the first four rooms solved, standing in the vestibule (4), or all five, in the List by the Prover's door (5)
  const five = params.get("skip") === "5";
  store.set(SAVE_KEY, JSON.stringify({tribar: true, miu: true, scr: true, stair: true, list: five, gateOpen: true, screenDone: true, loopedOnce: true,
    boardShown: true, sentence: 4, seen: ["hub", "tri", "miu", "scr", "vest", "stair", ...(five ? ["list"] : [])],
    pose: five ? {x: -13.5, z: 31, y: 0, yaw: 0, pitch: 0} : {x: -9.5, z: 15.6, y: 0, yaw: -Math.PI / 2, pitch: 0}}));
  params.delete("skip");
  history.replaceState(null, "", location.pathname + (params.toString() ? "?" + params : ""));
}
const read = (k) => { try { return JSON.parse(store.get(k) || "{}"); } catch (e) { return {}; } };
const saved = read(SAVE_KEY);
const settings = Object.assign({sens: 1, invert: false, sound: true, fov: 66, text: 1}, read(SETTINGS_KEY));
document.documentElement.style.setProperty("--ui", settings.text);
const state = {
  solved: {tribar: !!saved.tribar, miu: !!saved.miu, scr: !!saved.scr, stair: !!saved.stair, list: !!saved.list, godel: !!saved.godel},
  // Room 6: the Prover. fed: cards fed so far; blank: card 81's number; selfFed: card 81 fed while about itself; q: question
  prv: {fed: Array.isArray(saved.prv && saved.prv.fed) ? saved.prv.fed.filter((n) => n === 12 || n === 47) : [],
    blank: Prover.NUMBERS.includes(saved.prv && saved.prv.blank) ? saved.prv.blank : 12,
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
};
const hasProgress = state.solved.tribar || state.solved.miu || state.solved.scr || state.solved.stair || state.solved.list || state.solved.godel || state.made.length > 1 || state.seenRooms.size > 0;
function save() {
  store.set(SAVE_KEY, JSON.stringify({tribar: state.solved.tribar, miu: state.solved.miu, scr: state.solved.scr, stair: state.solved.stair, list: state.solved.list, godel: state.solved.godel, prv: {fed: state.prv.fed, blank: state.prv.blank, selfFed: state.prv.selfFed, q: state.prv.q}, loopedOnce: state.loopedOnce,
    diag: {list: state.diag.list, guess: state.diag.guess, round: state.diag.round, checks: state.diag.checks, escaped: state.diag.escaped, hint: state.diag.hint},
    screenDone: state.screenDone, sentence: state.sentence, liarTried: state.liarTried, neitherOn: state.neitherOn, gateOpen: state.gateOpen,
    made: state.made.slice(-200), word: state.word, trail: state.history.slice(-40), presses: state.presses,
    seen: [...state.seenRooms], boardShown: state.boardShown, pose: {x: me.x, z: me.z, y: me.y, yaw: me.yaw, pitch: me.pitch}}));
}
function saveSettings() { store.set(SETTINGS_KEY, JSON.stringify(settings)); }

const collide = World.collision(state);
let me = Walk.spawn(SPAWN.x, SPAWN.z, SPAWN.yaw, SPAWN.pitch);
if (saved.pose && Number.isFinite(saved.pose.x)) {  // back where you left off
  const p = saved.pose, y = Walk.floorAt(collide, p.x, p.z, p.y || 0);
  me = {...Walk.spawn(p.x, p.z, p.yaw, p.pitch || 0), y};
}
let mod = null, kit = null;

// ------------------------------------------------------------------ engine plumbing (engine/host.cpp)
function heap() { return new Uint8Array(mod.HEAPF32.buffer); }
function put(typed) {
  const bytes = new Uint8Array(typed.buffer, typed.byteOffset, typed.byteLength);
  const ptr = mod._malloc(Math.max(bytes.length, 4));
  heap().set(bytes, ptr);
  return ptr;
}
function texture(slot, img) {
  const ptr = put(new Uint8Array(img.rgba.buffer, img.rgba.byteOffset, img.rgba.byteLength));
  try { return mod._tangle_texture(slot, img.w, img.h, ptr, 0); } finally { mod._free(ptr); }
}
const MESH_UNLIT = 1, LATE = 0x10000;
const EMPTY = {positions: [], normals: [], colors: [], uvs: [], indices: []};
function mesh(slot, mb, textureSlot = -1, flags = 0) {
  const p = put(new Float32Array(mb.positions)), n = put(new Float32Array(mb.normals));
  const c = put(new Float32Array(mb.colors)), u = mb.uvs.length ? put(new Float32Array(mb.uvs)) : 0;
  const i = put(new Uint32Array(mb.indices));
  try {
    const bad = mod._tangle_mesh(slot, p, n, c, u, mb.positions.length / 3, i, mb.indices.length, textureSlot, flags);
    if (bad && mb.positions.length) console.error(`tangle: the engine refused mesh slot ${slot}`);
    return bad;
  } finally { [p, n, c, u, i].forEach((x) => x && mod._free(x)); }
}
function rows(fn, list) {
  const flat = new Float32Array(list.flat());
  const ptr = put(flat.length ? flat : new Float32Array(1));
  try { fn(ptr, list.length); } finally { mod._free(ptr); }
}

// ------------------------------------------------------------------ building the house
const SLOT = {shells: 1, props: 2, tribar: 3, pole: 4, gate: 5, hub: 10, west: 11, east: 12, tri: 13, rules: 14,
  declare: 15, progress: 16, legend: 17, gatesign: 18, soon: 19, rug: 21, scrPlaque: 22, south: 23, lectern: 24, vestPlaque: 25, door4: 26, vestLegend: 27, sealed4: 28, display: 30, board: 31, screen: 32,
  sentences: 33, top: 34, stairs: 40, stairShell: 41, keySign: 42 /* ..47 */,
  list: 50, listBoard: 51, qBoard: 52, qLegend: 53, deskLegend: 54, listPlaque: 55, door5: 56,
  prv: 57, pBoard: 58, pLegend: 59, gBoard: 60, gLegend: 61, prvPlaque: 62, door6: 63, sealed6: 64, sealedPlaque: 65};
let tribar = null;

function panelMesh(slot, spec, c, normal) {
  texture(slot, Text.plaque(document, spec));
  const m = new MeshBuilder();
  m.panel(c, normal, spec.w, spec.h);
  mesh(slot, m, slot, MESH_UNLIT);
}

function buildScene() {
  mesh(SLOT.shells, World.buildShells(), -1, LATE);
  mesh(SLOT.props, World.buildProps());
  tribar = buildTribar({eye: World.TRIBAR.eye, centre: World.TRIBAR.centre, L: World.TRIBAR.L, w: World.TRIBAR.w});
  mesh(SLOT.tribar, tribar.mesh);
  // a slim pole from the floor to the middle of bar A (the far bar), as on real tribar sculptures
  const foot = tribar.toWorld([World.TRIBAR.L * 0.5, 0, World.TRIBAR.w * 0.5]);
  const pole = new MeshBuilder();
  pole.cylinder([foot[0], 0, foot[2]], 0.05, foot[1], [0.25, 0.25, 0.27], 10);
  pole.cylinder([foot[0], 0, foot[2]], 0.5, 0.08, [0.25, 0.25, 0.27], 20);
  mesh(SLOT.pole, pole);
  collide.boxes.push({x0: foot[0] - 0.45, z0: foot[2] - 0.45, x1: foot[0] + 0.45, z1: foot[2] + 0.45});
  const H = World.HUB, D = World.MACHINE;
  panelMesh(SLOT.hub, Text.PLAQUES.hub, [0, 2.2, H.z0 + 0.02], [0, 0, 1]);
  panelMesh(SLOT.tri, Text.PLAQUES.tri, [-10.9, 1.75, World.TRI.z0 + 0.02], [0, 0, 1]);
  panelMesh(SLOT.rules, Text.PLAQUES.rules, D.rules.c, [0, 0, 1]);
  panelMesh(SLOT.declare, Text.PLAQUES.declare, [D.declare[0] + 0.45, D.declare[1] + 0.75, D.declare[2]], [-1, 0, 0]);
  {
    const k = World.MACHINE.console;
    texture(SLOT.legend, Text.legend(document, World.BUTTONS, k.x0, k.x1 - k.x0));
    const m = new MeshBuilder();
    m.panel([(k.x0 + k.x1) / 2, k.h - 0.17, k.z1 + 0.01], [0, 0, 1], k.x1 - k.x0, 0.32);
    mesh(SLOT.legend, m, SLOT.legend, MESH_UNLIT);
  }
  // Room 3: the plaque by its door, the sealed door to the rooms still to come, the screen, the lectern
  const R = World.SCR;
  panelMesh(SLOT.scrPlaque, Text.PLAQUES.scr, [-3.6, 1.75, R.z0 + 0.02], [0, 0, 1]);
  const V = World.VEST;
  panelMesh(SLOT.vestPlaque, Text.PLAQUES.stair, [V.x0 + 0.02, 1.7, 18.37], [1, 0, 0]);  // clear of the stair door's frame (17.32)
  buildStairwell();
  buildListRoom();
  buildProverRoom();
  {
    const sc = World.SCREEN, m = new MeshBuilder();
    m.panel(sc.c, [0, 0, -1], sc.w, sc.h);
    const W0 = 256, H0 = 160, px = new Uint8ClampedArray(W0 * H0 * 4);
    for (let i = 0; i < W0 * H0; i++) { const v = 20 + ((i * 2654435761) >>> 27); px.set([v, v, v + 6, 255], i * 4); }
    texture(SLOT.screen, {w: W0, h: H0, rgba: px});
    mesh(SLOT.screen, m, SLOT.screen, MESH_UNLIT);
    const L = World.LECTERN;
    texture(SLOT.lectern, Text.legend(document, World.ANSWERS.map(([id, , z]) => [id, id === "neither" ? "NEITHER" : id.toUpperCase(), z]), L.z0, L.z1 - L.z0, 52));
    const lm = new MeshBuilder();
    lm.panel([L.x0 - 0.01, L.h - 0.17, (L.z0 + L.z1) / 2], [-1, 0, 0], L.z1 - L.z0, 0.3);
    mesh(SLOT.lectern, lm, SLOT.lectern, MESH_UNLIT);
  }
  refreshSentences();
  // the rug: a flat textured quad just above the floor (normal up)
  texture(SLOT.rug, Text.rug(document));
  const rug = new MeshBuilder();
  rug.panel([0, 0.012, 1.4], [0, 1, 0], 4.2, 4.2, [0, 0, -1]);
  mesh(SLOT.rug, rug, SLOT.rug, 0);
  refreshGate();
  refreshDoors();
  refreshDisplay();
  refreshBoard();
  refreshLights();
  refreshItems();
  refreshPoints();
}

function refreshDoors() {
  const H = World.HUB;
  panelMesh(SLOT.west, Text.doorPlaque(1, "The Triangle", "A loop you can see", state.solved.tribar), [H.x0 + 0.02, 3.45, 0], [1, 0, 0]);
  panelMesh(SLOT.east, Text.doorPlaque(2, "The Machine", "A loop in rules", state.solved.miu), [H.x1 - 0.02, 3.45, 0], [-1, 0, 0]);
  panelMesh(SLOT.south, Text.doorPlaque(3, "The Screen", "A loop of pictures and words", state.solved.scr), [0, 3.45, H.z1 - 0.02], [0, 0, -1]);
  panelMesh(SLOT.progress, Text.progressPlaque(state.solved), [4.6, 1.9, H.z0 + 0.02], [0, 0, 1]);
  panelMesh(SLOT.door4, Text.doorPlaque(4, "The Staircase", "A loop you can climb", state.solved.stair), [World.SCR.x0 + 0.02, 3.45, 16], [1, 0, 0]);
  // Room 5's plaque: on the vestibule's east wall, beside the south door (no room above a door there)
  panelMesh(SLOT.door5, {...Text.doorPlaque(5, "The List", "A list that can't hold everything", state.solved.list), w: 1.7, h: 0.86},
    [World.VEST.x1 - 0.02, 1.75, 18.35], [-1, 0, 0]);
  // Room 6's: above its door in the List's west wall, and the sealed door until the List is solved
  panelMesh(SLOT.door6, Text.doorPlaque(6, "The Prover", "A sentence about itself", state.solved.godel), [World.LIST.x0 + 0.02, 3.45, 31.0], [1, 0, 0]);
  if (state.solved.list) { mesh(SLOT.sealed6, EMPTY); mesh(SLOT.sealedPlaque, EMPTY); }
  else { mesh(SLOT.sealed6, World.buildSealedDoor()); panelMesh(SLOT.sealedPlaque, Text.PLAQUES.sealed, [World.LIST.x0 + 0.09, 1.6, 31.0], [1, 0, 0]); }
}

function refreshGate() {
  if (state.gateOpen) { mesh(SLOT.gate, EMPTY); mesh(SLOT.gatesign, EMPTY); return; }
  mesh(SLOT.gate, World.buildGate());
  const g = World.MACHINE.gate;
  panelMesh(SLOT.gatesign, Text.PLAQUES.gate, [g.x0 - 0.04, 1.45, (g.z0 + g.z1) / 2], [-1, 0, 0]);
}

function refreshLights() {
  const L = World.lights().map((l) => l.slice()).concat(World.stairLights(), World.listLights(), World.proverLights(state.solved.godel));
  if (state.glow > 0.01) L.push([...World.TRIBAR.centre.map((v, i) => v + [1.2, 1.0, 1.6][i]), 7, 1.0, 0.82, 0.5, 2.8 * state.glow]);
  if (state.gateOpen && !state.solved.miu) L.push([12.6, 2.6, 7.2, 6, 1.0, 0.85, 0.55, 1.1]);
  rows(mod._tangle_lights, L);
}

// Room 4: the stairwell (five copies, a loop apart), its key signs, and the vestibule's lectern.
function buildStairwell() {
  mesh(SLOT.stairShell, World.buildStairShell(), -1, LATE);
  mesh(SLOT.stairs, World.buildStairs());
  const R = World.STAIR.rise;
  for (const spot of World.keySignSpots()) {
    texture(SLOT.keySign + spot.key, Text.keySign(document, World.KEYS[spot.key]));
    const m = new MeshBuilder();
    for (const k of [-2, -1, 0, 1, 2]) m.panel([spot.c[0], spot.c[1] + k * R, spot.c[2]], spot.n, 0.9, 0.9);
    mesh(SLOT.keySign + spot.key, m, SLOT.keySign + spot.key, MESH_UNLIT);
  }
  texture(SLOT.vestLegend, Text.legend(document, World.TOP_ANSWERS.map(([id, label, x]) => [id, label, x]), -10.4, 1.8, 40));
  const lm = new MeshBuilder();
  lm.panel([-9.5, 0.83, 13.61], [0, 0, 1], 1.8, 0.3);
  mesh(SLOT.vestLegend, lm, SLOT.vestLegend, MESH_UNLIT);
  refreshTop();
}

function refreshTop() {
  texture(SLOT.top, Text.topBoard(document, {locked: !state.loopedOnce, message: state.topMsg, good: state.topGood, solved: state.solved.stair}));
  const m = new MeshBuilder();
  m.panel([-9.5, 2.05, World.VEST.z0 + 0.02], [0, 0, 1], 2.2, 0.88);
  mesh(SLOT.top, m, SLOT.top, MESH_UNLIT);
}

// Room 5: the List. The desk of switches, the librarian's list, the question and its lectern.
function buildListRoom() {
  const L = World.LIST;
  mesh(SLOT.list, World.buildList());
  panelMesh(SLOT.listPlaque, Text.PLAQUES.list, [L.x1 - 0.02, 1.75, 27.2], [-1, 0, 0]);  // on your left as you come in
  const k = World.DESK;
  texture(SLOT.deskLegend, Text.legend(document, World.SWITCHES.map(([id, label, x]) => [id, label, k.x1 - x]), 0, k.x1 - k.x0, 52));
  const dm = new MeshBuilder();
  dm.panel([(k.x0 + k.x1) / 2, k.h - 0.17, k.z0 - 0.01], [0, 0, -1], k.x1 - k.x0, 0.3);
  mesh(SLOT.deskLegend, dm, SLOT.deskLegend, MESH_UNLIT);
  const q = World.QLECTERN;
  texture(SLOT.qLegend, Text.legend(document, Diag.QUESTION.map(([id, label]) => [id, label, World.QANSWERS_Z[id]]), q.z0, q.z1 - q.z0, 52));
  const qm = new MeshBuilder();
  qm.panel([q.x0 - 0.01, q.h - 0.17, (q.z0 + q.z1) / 2], [-1, 0, 0], q.z1 - q.z0, 0.3);
  mesh(SLOT.qLegend, qm, SLOT.qLegend, MESH_UNLIT);
  if (state.diag.round === 0 && state.diag.escaped) insertRow();  // reloaded while the librarian was adding it
  refreshList(); refreshQuestion();
}

function refreshList() {
  const d = state.diag;
  texture(SLOT.listBoard, Text.listBoard(document, {rows: d.list, guess: d.guess, diffs: d.diffs, diag: d.hint >= 2 || d.round > 0,
    later: d.later, escaped: d.escaped, message: d.msg, good: d.good, round: d.round > 0 ? 1 : 0}));
  const b = World.LIST_BOARD, m = new MeshBuilder();
  m.panel(b.c, [0, 0, -1], b.w, b.h);
  mesh(SLOT.listBoard, m, SLOT.listBoard, MESH_UNLIT);
}

function refreshQuestion() {
  const d = state.diag;
  texture(SLOT.qBoard, Text.questionBoard(document, {locked: d.round < 2, message: d.qMsg, good: d.qGood, solved: state.solved.list}));
  const b = World.QBOARD, m = new MeshBuilder();
  m.panel(b.c, [-1, 0, 0], b.w, b.h);
  mesh(SLOT.qBoard, m, SLOT.qBoard, MESH_UNLIT);
}

// Room 6: the Prover. Its board and cabinet, the desk of cards, the lectern of questions about card 81.
function buildProverRoom() {
  const P = World.PRV;
  mesh(SLOT.prv, World.buildProver());
  panelMesh(SLOT.prvPlaque, Text.PLAQUES.prover, [-19.3, 1.75, P.z0 + 0.02], [0, 0, 1]);  // on your right as you come in
  const k = World.PDESK;
  texture(SLOT.pLegend, Text.legend(document, World.PKEYS.map(([id, label, z]) => [id, label, k.z1 - z]), 0, k.z1 - k.z0, 40));
  const dm = new MeshBuilder();
  dm.panel([k.x1 + 0.01, k.h - 0.17, (k.z0 + k.z1) / 2], [1, 0, 0], k.z1 - k.z0, 0.3);
  mesh(SLOT.pLegend, dm, SLOT.pLegend, MESH_UNLIT);
  refreshProverLegend(); refreshProver(); refreshGQuestion();
}
function refreshProverLegend() {
  const q = World.GLECTERN, Q = Prover.QUESTIONS[Math.min(state.prv.q, Prover.QUESTIONS.length - 1)];
  texture(SLOT.gLegend, Text.legend(document, Prover.ANSWER_IDS.map((id, i) => [id, Q.buttons[i], q.x1 - World.GANSWERS_X[id]]), 0, q.x1 - q.x0, 36));
  const m = new MeshBuilder();
  m.panel([(q.x0 + q.x1) / 2, q.h - 0.17, q.z0 - 0.01], [0, 0, -1], q.x1 - q.x0, 0.3);
  mesh(SLOT.gLegend, m, SLOT.gLegend, MESH_UNLIT);
}
function proverRun(now = performance.now()) {
  const r = state.prv.run;
  if (!r) return null;
  const t = (now - r.t0) / 1000;
  if (r.kind === "proved") { const k = Math.min(Prover.PROOF.length, 1 + Math.floor(t * 1.5)); return {n: r.n, kind: "proved", count: k, proof: Prover.PROOF.slice(0, k)}; }
  return {n: r.n, kind: "forever", count: Prover.searched(t), long: t > 4};
}
function refreshProver(now) {
  const p = state.prv;
  texture(SLOT.pBoard, Text.proverBoard(document, {fed: p.fed, blank: p.blank, run: proverRun(now), message: p.msg, good: p.good, solved: state.solved.godel, unlocked: p.selfFed}));
  const b = World.PBOARD, m = new MeshBuilder();
  m.panel(b.c, [1, 0, 0], b.w, b.h);
  mesh(SLOT.pBoard, m, SLOT.pBoard, MESH_UNLIT);
}
function refreshGQuestion() {
  const p = state.prv, Q = Prover.QUESTIONS[Math.min(p.q, Prover.QUESTIONS.length - 1)];
  texture(SLOT.gBoard, Text.proverQuestion(document, {locked: !p.selfFed, ask: Q.ask, legend: Q.legend, step: p.q, total: Prover.QUESTIONS.length,
    message: p.qMsg, good: p.qGood, solved: state.solved.godel}));
  const b = World.GBOARD, m = new MeshBuilder();
  m.panel(b.c, [0, 0, -1], b.w, b.h);
  mesh(SLOT.gBoard, m, SLOT.gBoard, MESH_UNLIT);
}
function feedCard(n) {
  const p = state.prv, r = Prover.feed(n, p.blank, p.fed);
  if (state.solved.godel) { Audio.cue("nope"); return; }
  p.msg = r.message; p.good = r.kind === "proved";
  if (r.kind === "refused") { Audio.cue("nope"); say(r.message, 6000, true); refreshProver(); return; }
  Audio.cue("click");
  p.run = {n, kind: r.kind, t0: performance.now()};
  if (n !== 81 && !p.fed.includes(n)) p.fed.push(n);
  if (n === 12) say("Watch the board: the Prover finds a proof of 2 + 2 = 4 and stamps the card.", 6000, true);
  if (n === 47) say("2 + 2 = 5 is false. The Prover will never find a proof of it, so it searches forever.", 7000, true);
  if (n !== 81 && p.fed.includes(12) && p.fed.includes(47) && !p.selfFed) {
    say("Now card 81. Its number can be changed with the button on the right of the desk.", 7000);
    objective("Card 81 says the Prover can't prove some card. Set its number so it talks about itself, then feed it in.");
  }
  if (n === 81) say("Card 81 says: “The Prover can't prove card 81.” It's talking about itself. Watch what the Prover does.", 8000, true);
  refreshProver(); refreshItems(performance.now()); save();
}
function turnBlank() {
  const p = state.prv;
  if (state.solved.godel) { Audio.cue("nope"); return; }
  p.blank = Prover.nextNumber(p.blank);
  p.msg = p.blank === Prover.SELF ? "Card 81 now says: “The Prover can't prove card 81.” It talks about itself." : `Card 81 now talks about card ${p.blank}.`;
  p.good = p.blank === Prover.SELF;
  if (p.run && p.run.n === 81) p.run = null;  // a different card now
  Audio.cue("click");
  refreshProver(); refreshItems(performance.now()); save();
}
// The lamps on the Prover's cabinet: dim while it waits, flickering while it searches, green once it
// has proved a card, gold once you've seen that card 81 is true.
function proverLamps(t) {
  const r = state.prv.run, X = World.PCAB.x1 + 0.03;
  return World.PLAMPS.map(([y, z], i) => {
    let col = [0.5, 0.42, 0.3], a = 0.25;
    if (state.solved.godel) { col = [1.0, 0.78, 0.35]; a = 0.95; }
    else if (r && r.kind === "proved") { col = [0.45, 0.95, 0.6]; a = 0.9; }
    else if (r) { const k = Math.floor(t * 7) * 31 + i * 17; col = [1.0, 0.72, 0.3]; a = (Math.imul(k, 2654435761 | 0) >>> 7) % 3 ? 0.95 : 0.15; }
    return [X, y, z, 9, 0.09, ...col, a];
  });
}
function proverTick(now) {  // while a card is in the Prover: count, and unlock the questions once card 81 has run a while
  const p = state.prv;
  if (!p.run) return;
  const t = (now - p.run.t0) / 1000;
  if (p.run.kind === "proved" && t > 4) return;  // the proof is up; nothing more to draw
  if (p.run.kind === "proved" && t >= 2 && !p.run.stamped) { p.run.stamped = true; Audio.stamp(); Audio.cue("open"); }  // the proof is done: stamp the card
  if (p.run.kind === "forever") Audio.proverWork(Math.min(1, t / 8));
  refreshProver(now); refreshPoints(now / 1000);
  if (p.run.n === 81 && p.run.kind === "forever" && t > 6 && !p.selfFed) {
    p.selfFed = true;
    p.msg = "Still searching, and it always will be. Why? Answer the questions on the left-hand wall.";
    p.good = true;
    Audio.cue("open");
    say("The lectern on the left-hand wall has woken up. Can the Prover ever prove card 81?", 8000, true);
    objective("Answer the questions on the left-hand wall about card 81.");
    refreshProver(now); refreshGQuestion(); refreshItems(now); save();
  }
}
function proverAnswer(id) {
  const p = state.prv;
  if (state.solved.godel) return;
  if (!p.selfFed) { Audio.cue("nope"); say("First make card 81 talk about itself, and feed it to the Prover.", 5000); return; }
  const r = Prover.answer(p.q, id);
  p.qMsg = r.message; p.qGood = r.ok;
  say(r.message, 8000, true);  // the board is out of view while you aim
  Audio.cue(r.ok ? "click" : "nope");
  if (r.ok) {
    p.q++;
    if (p.q >= Prover.QUESTIONS.length) { refreshGQuestion(); solveGodel(); return; }
    refreshProverLegend();
  }
  refreshGQuestion(); refreshItems(performance.now()); save();
}
function solveGodel() {
  state.solved.godel = true;
  state.prv.msg = "Card 81 is true, and the Prover will never prove it."; state.prv.good = true;
  save(); refreshDoors(); refreshItems(); refreshProver(); refreshLights(); refreshPoints(); Audio.stamp(); Audio.cue("solve"); flash();
  setTimeout(() => debrief({title: "True, and it can't be proved.",
    what: "Card 81 talks about itself through its number. If the Prover proved it, it would have proved something false, and it never does. " +
      "So it never proves card 81, and that is exactly what card 81 says. You could see it's true by stepping outside the Prover and thinking about it, " +
      "the way the balcony let you see the Machine from outside.",
    why: "In 1931 Kurt Gödel built card 81 inside arithmetic itself. He gave every sentence about numbers a number, so that sentences could talk about sentences, " +
      "and wrote one that says “there is no proof of me”. So any honest set of rules for arithmetic misses some truths. " +
      "Add card 81 as a new rule and a new card 81 appears, the way the librarian's list always had a row missing."}), 900);
  pendingEnd = {title: "Strange loops.",
    what: "A triangle that closes on itself. A machine whose rules can't see their own limits. A screen inside itself, and a sentence about itself. " +
      "Stairs that climb back to where they started. A row made from the list it escapes. A sentence that says it can't be proved.",
    why: "Each of these is what Douglas Hofstadter calls a strange loop: you move up through levels, and find yourself back where you began. " +
      "In Gödel, Escher, Bach he suggests that your sense of “I” is a loop like this: a pattern in the brain that ends up standing for itself. " +
      "Thank you for playing Tangle."};
  objective(allSolved() ? "Every loop found. Wander as you like." : nextObjective());
}
let pendingEnd = null;

function toggleTile(i) {
  const d = state.diag;
  if (d.round >= 2 || d.busy) { Audio.cue("nope"); say(d.round >= 2 ? "You've beaten the list. Now the question on the left-hand wall." : "Wait: the librarian is adding your row to the list.", 4000); return; }
  d.guess[i] = 1 - d.guess[i]; d.diffs = null; d.later = null; d.msg = null;
  Audio.cue("click"); refreshList(); refreshItems(performance.now()); save();
}

function checkRow() {
  const d = state.diag;
  if (d.round >= 2 || d.busy) { Audio.cue("nope"); say(d.round >= 2 ? "You've beaten the list. Now the question on the left-hand wall." : "Wait: the librarian is adding your row to the list.", 4000); return; }
  const r = Diag.check(d.guess, d.list);
  d.checks++; d.diffs = r.diffs; d.later = null; d.good = r.kind === "escapes";
  if (r.kind === "row") {
    d.msg = `That's row ${r.row}, tile for tile. Change something and check again.`;
    Audio.cue("nope");
  } else if (r.kind === "later") {
    d.later = {row: r.row, tiles: d.guess.slice()};
    d.msg = `Yours differs from rows 1 to 8, but row ${r.row}, further down, starts just like it. Does yours differ later on? You'd have to check forever.`;
    Audio.cue("nope");
  }
  if (r.kind !== "escapes") {  // hints, whichever way the check failed
    if (d.checks >= 2 && d.hint < 2) {
      d.hint = 2;
      say("You can't check every row: the list never ends. Instead, can you make sure your row differs from row 1? And from row 2? From every row?", 10000, true);
      say("Look at the gold tiles: row 1's tile 1, row 2's tile 2, row 3's tile 3, and on down the list.", 9000);
    }
    if (d.checks >= 4 && d.hint < 3) {
      d.hint = 3;
      say("Make each of your tiles the opposite of the gold tile in its column. Then your row differs from every row somewhere.", 10000);
    }
  } else {
    d.escaped = true;
    d.msg = "Row 1 differs at tile 1, row 2 at tile 2: row n differs at tile n, for every n, however far down. Your row is nowhere in the list.";
    Audio.cue("gate");
    if (d.round === 0) {
      d.busy = true;
      say("Your row differs from every row in the list, even the ones you can't see.", 6000, true);
      setTimeout(insertRow, 5500);
    } else {
      d.round = 2;
      say("Beaten again, the same way. Now answer the question on the left-hand wall.", 7000, true);
      objective("Answer the question on the left-hand wall: which list could hold every endless row?");
      refreshQuestion();
    }
  }
  refreshList(); refreshItems(performance.now()); save();
}

function insertRow() {
  const d = state.diag;
  d.list = Diag.addRow(d.list, d.guess); d.guess = Array(Diag.N).fill(0);
  d.round = 1; d.busy = false; d.escaped = false; d.diffs = null; d.later = null; d.good = false;
  d.msg = "The librarian added your row at the top, and every row moved down one. Is every row in the list now?";
  if (kit) {
    say("The librarian has added your row to the list. Can you beat it again?", 7000, true);
    objective("The librarian added your row. Make a row that still isn't in the list.");
    Audio.cue("open"); refreshList(); refreshItems(performance.now()); save();
  }
}

function questionAnswer(id) {
  if (state.solved.list) return;
  if (state.diag.round < 2) { Audio.cue("nope"); say("First beat the list: make a row it doesn't hold.", 4500); return; }
  const r = Diag.answerQuestion(id);
  state.diag.qMsg = r.message; state.diag.qGood = r.ok;
  refreshQuestion();
  if (r.ok) solveList(); else Audio.cue("nope");
}

function solveList() {
  state.solved.list = true;
  save(); refreshDoors(); refreshItems(); Audio.cue("solve"); flash();
  setTimeout(() => debrief({title: "No list holds them all.",
    what: "The winning row is built from the list itself: tile 1 the opposite of row 1's tile 1, tile 2 the opposite of row 2's tile 2, and on down. " +
      "So it differs from every row somewhere, however long the list is. When the librarian added it, the same trick beat the new list.",
    why: "Georg Cantor found this diagonal in 1891. It shows there are more endless rows than counting numbers, so some infinities are bigger than others. " +
      "Gödel's proof makes the same move. He gave every statement about numbers a number of its own, and built a sentence that says, in effect, " +
      "\u201cI am not on the list of things arithmetic can prove.\u201d Like your row, it is made from the list it escapes. " +
      "Alan Turing used the diagonal again to show that no program can tell, for every program, whether it will ever stop." +
      (allSolved() ? " Every room is solved." : state.solved.godel ? "" : " One room is left: its door, in this room's right-hand wall, has opened.")}), 900);
  objective(allSolved() ? "Every room solved. Wander as you like." : nextObjective());
}

function refreshSentences() {
  const i = Math.min(state.sentence, SENTENCES.length - 1);
  texture(SLOT.sentences, Text.sentenceBoard(document, {locked: !state.screenDone, index: state.solved.scr ? SENTENCES.length - 1 : i,
    total: SENTENCES.length, sentence: SENTENCES[i].text, message: state.boardMsg, good: state.boardGood}));
  const b = World.SENTENCE_BOARD, m = new MeshBuilder();
  m.panel(b.c, [-1, 0, 0], b.w, b.h);
  mesh(SLOT.sentences, m, SLOT.sentences, MESH_UNLIT);
}

function spotsOf(word) { return moves(word).filter((m) => m.rule === 3 || m.rule === 4); }

function refreshDisplay(last) {
  const sp = spotsOf(state.word), s = sp.length ? sp[state.sel % sp.length] : null;
  texture(SLOT.display, Text.display(document, {word: state.word, spot: s && {at: s.at, len: s.rule === 3 ? 3 : 2},
    made: new Set(state.made).size, last, trail: [...state.history.slice(-3), state.word]}));
  const d = World.MACHINE.display;
  const m = new MeshBuilder();
  m.panel(d.c, [0, 0, 1], d.w, d.h);
  mesh(SLOT.display, m, SLOT.display, MESH_UNLIT);
}

function refreshBoard() {
  texture(SLOT.board, state.boardShown ? Text.board(document, [...new Set(state.made)]) : Text.boardCover(document));
  const b = World.MACHINE.board;
  const m = new MeshBuilder();
  m.panel(b.c, [-1, 0, 0], b.w, b.h);
  mesh(SLOT.board, m, SLOT.board, MESH_UNLIT);
}

// Buttons as primitives (kind 0 = cube): rows of kind, x, y, z, sx, sy, sz, r, g, b.
let pressed = {id: null, until: 0};
function refreshItems(now = 0) {
  const items = [];
  for (const [id, , x] of World.BUTTONS) {
    const down = pressed.id === id && now < pressed.until;
    const col = id.startsWith("r") ? [0.86, 0.72, 0.35] : [0.55, 0.62, 0.66];
    items.push([0, x, World.BUTTON_Y - (down ? 0.03 : 0), World.BUTTON_Z, 0.46, 0.08, 0.42, ...(focus && focus.id === id ? col.map((c) => Math.min(1, c * 1.3)) : col)]);
  }
  for (const [id, , z] of World.ANSWERS) {
    const down = pressed.id === id && now < pressed.until;
    const off = !state.screenDone || (id === "neither" && !state.neitherOn) || state.solved.scr;
    const base = id === "true" ? [0.35, 0.72, 0.45] : id === "false" ? [0.82, 0.38, 0.3] : [0.75, 0.62, 0.9];
    const col = off ? base.map((c) => c * 0.35) : focus && focus.id === id ? base.map((c) => Math.min(1, c * 1.3)) : base;
    items.push([0, World.ANSWER_X, World.ANSWER_Y - (down ? 0.03 : 0), z, 0.42, 0.08, 0.46, ...col]);
  }
  for (const [id, , x] of World.TOP_ANSWERS) {
    const down = pressed.id === id && now < pressed.until, off = !state.loopedOnce || state.solved.stair;
    const base = [0.62, 0.68, 0.86], col = off ? base.map((c) => c * 0.35) : focus && focus.id === id ? base.map((c) => Math.min(1, c * 1.3)) : base;
    items.push([0, x, 1.06 - (down ? 0.03 : 0), 13.3, 0.4, 0.08, 0.4, ...col]);
  }
  {
    const d = state.diag, off = d.round >= 2 || d.busy;
    for (const [id, , x] of World.SWITCHES) {
      const down = pressed.id === id && now < pressed.until, lit = focus && focus.id === id;
      let col = id === "check" ? [0.3, 0.66, 0.68] : d.guess[Number(id.slice(1))] ? [0.93, 0.9, 0.8] : [0.16, 0.16, 0.18];
      if (lit) col = col.map((c) => Math.min(1, c * 1.25 + 0.08));
      if (off && id === "check") col = col.map((c) => c * 0.4);
      items.push([0, x, World.SWITCH_Y - (down ? 0.03 : 0), World.SWITCH_Z, id === "check" ? 0.8 : 0.4, 0.08, 0.42, ...col]);
    }
    for (const [id] of Diag.QUESTION) {
      const down = pressed.id === id && now < pressed.until, qoff = d.round < 2 || state.solved.list;
      const base = [0.62, 0.68, 0.86], col = qoff ? base.map((c) => c * 0.35) : focus && focus.id === id ? base.map((c) => Math.min(1, c * 1.3)) : base;
      items.push([0, World.QANSWER_X, 1.06 - (down ? 0.03 : 0), World.QANSWERS_Z[id], 0.42, 0.08, 0.46, ...col]);
    }
  }
  {
    const p = state.prv, down = (id) => pressed.id === id && now < pressed.until, lit = (id) => focus && focus.id === id;
    for (const [id, , z] of World.PKEYS) {
      let col = id === "gnum" ? [0.3, 0.66, 0.68] : id === "g81" && p.blank === Prover.SELF ? [0.95, 0.75, 0.3] : [0.9, 0.86, 0.76];
      if (id === "g81" && !(p.fed.includes(12) && p.fed.includes(47))) col = col.map((c) => c * 0.4);
      if (lit(id)) col = col.map((c) => Math.min(1, c * 1.25 + 0.06));
      items.push([0, World.PKEY_X, World.PKEY_Y - (down(id) ? 0.03 : 0), z, 0.42, 0.08, id === "gnum" ? 0.6 : 0.46, ...col]);
    }
    const off = !p.selfFed || state.solved.godel;
    for (const id of Prover.ANSWER_IDS) {
      const base = [0.62, 0.68, 0.86], col = off ? base.map((c) => c * 0.35) : lit(id) ? base.map((c) => Math.min(1, c * 1.3)) : base;
      items.push([0, World.GANSWERS_X[id], 1.06 - (down(id) ? 0.03 : 0), World.GANSWER_Z, 0.46, 0.08, 0.42, ...col]);
    }
  }
  const dp = World.MACHINE.declare, ddown = pressed.id === "declare" && now < pressed.until;
  const lit = focus && focus.id === "declare";
  items.push([0, dp[0], dp[1] - (ddown ? 0.03 : 0), dp[2], 0.34, 0.1, 0.34, ...(state.solved.miu ? [0.3, 0.7, 0.4] : lit ? [1, 0.4, 0.3] : [0.85, 0.25, 0.2])]);
  rows(mod._tangle_items, items);
}

// Glow points: the ring of light at the tribar's viewpoint (a hint, then a marker once solved).
function refreshPoints(t = 0) {
  const pts = [];
  for (const l of World.lights().slice(0, 3)) pts.push([l[0], l[1] - 0.05, l[2], 10, 0.5, 1.0, 0.95, 0.85, 0.9]);
  pts.push([-19.6, 5.35, -3.6, 8, 0.35, 1.0, 0.9, 0.75, 0.8], [16, 2.35, -3.5, 6, 0.0, 1, 0.85, 0.6, 0.0]);
  if (state.hint || state.solved.tribar) {
    const [ex, , ez] = World.TRIBAR.eye, solved = state.solved.tribar;
    const pulse = solved ? 0.9 : 0.75 + 0.25 * Math.sin(t * 2.2);   // bright enough to spot from across the room
    for (let k = 0; k < 28; k++) {
      const a = 2 * Math.PI * k / 28;
      pts.push([ex + 0.42 * Math.cos(a), 0.03, ez + 0.42 * Math.sin(a), solved ? 7 : 9, 0, ...(solved ? [1.0, 0.8, 0.3] : [0.95, 0.85, 0.55]), pulse]);
    }
  }
  if (state.gateOpen && !state.solved.miu) {  // the Machine: a trail of lights through the open gate and up the ramp
    const rp = World.MACHINE.ramp, zc = (rp.z0 + rp.z1) / 2;
    for (let x = 10.0; x < rp.x1 - 0.2; x += 0.5) {
      const y = Math.max(0, (x - rp.x0) / (rp.x1 - rp.x0)) * rp.top + 0.04;
      pts.push([x, y, zc, 10, 0, 1.0, 0.82, 0.45, 1.0]);
    }
  }
  pts.push(...proverLamps(t));
  rows(mod._tangle_points, pts);
}

// ------------------------------------------------------------------ the machine
const LEGEND = {r1: "rule 1: if it ends in I, add U", r2: "rule 2: double everything after M", r3: "rule 3: replace III with U",
  a_up: "higher up: keep climbing", a_loop: "there isn't one: the stairs loop", a_as: "at the A\u266f landing",
  true: "answer TRUE", false: "answer FALSE", neither: "answer NEITHER: it can't be true or false",
  r4: "rule 4: remove UU", check: "check your row against the list",
  q_long: "a longer list could hold them all", q_endless: "an endless list could hold them all", q_none: "no list can hold them all", next: "move the highlight to the next III or UU", undo: "take back the last step", declare: "say: MU can't be made"};

function label(id) {
  if (id === "g12" || id === "g47" || id === "g81") return `feed card ${id.slice(1)} to the Prover: \u201c${Prover.cardText(Number(id.slice(1)), state.prv.blank)}\u201d`;
  if (id === "gnum") return `change card 81's number (it says card ${state.prv.blank} now)`;
  if (id === "ga" || id === "gb" || id === "gc") return `answer ${Prover.QUESTIONS[Math.min(state.prv.q, Prover.QUESTIONS.length - 1)].buttons[Prover.ANSWER_IDS.indexOf(id)]}`;
  if (/^t\d$/.test(id)) { const i = Number(id.slice(1)); return `tile ${i + 1}: make it ${state.diag.guess[i] ? "dark" : "light"}`; }
  return LEGEND[id];
}

function press(id) {
  const now = performance.now();
  pressed = {id, until: now + 160};
  if (id === "declare") { Audio.cue("click"); declare(); return; }
  if (id === "true" || id === "false" || id === "neither") { answerPressed(id); return; }
  if (id.startsWith("a_")) { topAnswer(id); return; }
  if (/^t\d$/.test(id)) { toggleTile(Number(id.slice(1))); return; }
  if (id === "check") { checkRow(); return; }
  if (id.startsWith("q_")) { questionAnswer(id); return; }
  if (id === "g12" || id === "g47" || id === "g81") { feedCard(Number(id.slice(1))); return; }
  if (id === "gnum") { turnBlank(); return; }
  if (id === "ga" || id === "gb" || id === "gc") { proverAnswer(id); return; }
  let last = "", ok = true;
  const all = moves(state.word), sp = spotsOf(state.word);
  if (id === "undo") {
    if (state.history.length) { state.word = state.history.pop(); state.sel = 0; last = "took back a step"; } else { last = "nothing to take back"; ok = false; }
  } else if (id === "next") {
    if (sp.length) { state.sel = (state.sel + 1) % sp.length; const nx = sp[state.sel]; last = `rule ${nx.rule} acts on the highlight`; } else { last = "no III or UU to pick from"; ok = false; }
  } else {
    const rule = Number(id[1]);
    let mv = null;
    if (rule === 3 || rule === 4) {
      const s = sp.length ? sp[state.sel % sp.length] : null;
      mv = s && s.rule === rule ? s : all.find((m) => m.rule === rule);
      if (mv && !(s && s.rule === rule)) state.sel = sp.indexOf(mv);
    } else mv = all.find((m) => m.rule === rule);
    if (!mv) { last = {1: "rule 1 needs a word that ends in I", 3: "rule 3 needs III somewhere", 4: "rule 4 needs UU somewhere"}[rule] || "can't"; ok = false; }
    else if (mv.result.length > MAX_LEN) { last = "too long for the screen: try ↶"; ok = false; }
    else {
      state.history.push(state.word); state.word = mv.result; state.sel = 0; state.made.push(mv.result);
      state.presses++; last = `rule ${rule}`;
      refreshBoard();
      if (state.presses === 1) say("That's how it works. Keep going: can you reach MU?", 5000);
    }
  }
  Audio.cue(ok ? "click" : "nope");
  refreshDisplay(last);
  save();
  maybeOpenGate();
}

// What a rule button would do to the word now, for the prompt: "  ·  MI → MIU".
function preview(id) {
  if (!/^r[1-4]$/.test(id)) return "";
  const rule = Number(id[1]), all = moves(state.word), sp = spotsOf(state.word), s = sp[state.sel % (sp.length || 1)];
  const mv = (rule >= 3 && s && s.rule === rule) ? s : all.find((m) => m.rule === rule);
  if (!mv) return "  ·  can't apply now";
  const short = (w) => (w.length > 14 ? w.slice(0, 13) + "…" : w);
  return `  ·  ${short(state.word)} → ${short(mv.result)}`;
}

function answerPressed(id) {
  if (state.solved.scr) return;
  if (!state.screenDone) { Audio.cue("nope"); say("The lectern wakes once you've looked at yourself in the big screen.", 4000); return; }
  if (id === "neither" && !state.neitherOn) {
    Audio.cue("nope");
    say(SENTENCES[state.sentence].answer === null ? "Maybe. Before you say so, press TRUE and see where it leads, then FALSE." : "This one is plainly true or false. Check what it says about itself.", 6000, true);
    return;
  }
  const r = answerSentence(state.sentence, id, state.liarTried);
  state.boardMsg = r.message; state.boardGood = r.ok;
  say(r.ok && r.next != null ? `${r.message} Next sentence on the board.` : r.message, 6500, true);  // the board is out of view while you aim
  if (r.tried) state.liarTried = r.tried;
  if (r.unlockNeither && !state.neitherOn) {
    state.neitherOn = true;
    say("Both answers lead to a contradiction. The third button on the lectern, NEITHER, has lit up.", 7000, true);
    Audio.cue("open");
  }
  if (r.ok && r.next != null) { state.sentence = r.next; state.boardMsg = `${r.message} Next one.`; }
  Audio.cue(r.ok ? "click" : "nope");
  refreshSentences(); refreshItems(performance.now()); save();
  if (r.done) solveScreen();
}

function topAnswer(id) {
  if (state.solved.stair) return;
  if (!state.loopedOnce) { Audio.cue("nope"); say("Climb the stairs first: go all the way round, past A\u266f.", 4500); return; }
  if (id === "a_loop") {
    state.topMsg = "Right: there is no top. Every flight goes up, and the stairs come back to where they began."; state.topGood = true;
    refreshTop(); solveStair(); return;
  }
  state.topMsg = id === "a_up" ? "You could climb for as long as you like. The height keeps rising, but you keep arriving at the same door."
    : "Climb one more flight past A\u266f: it goes up, and lands at C, right by the door you came in.";
  state.topGood = false; Audio.cue("nope"); refreshTop();
}

function solveStair() {
  state.solved.stair = true;
  save(); refreshDoors(); refreshItems(); Audio.cue("solve"); flash();
  setTimeout(() => debrief({title: "There is no top.",
    what: "Every flight went up one whole tone, C to D to E and on to A\u266f, and the next one up brought you back to C, at the door. " +
      "The height kept rising, yet you never got anywhere. That's what the tones did too: each one sounded higher, and they never got high.",
    why: "Bach's Canon per Tonos rises a whole tone each time it repeats and, after six climbs, is back in its first key. Escher drew monks walking stairs like these forever, in Ascending and Descending. " +
      "Hofstadter calls this a strange loop: you move up through the levels of a hierarchy and find yourself back where you began. " +
      "Gödel found one in mathematics: statements about numbers that turn out to be statements about themselves." +
      (allSolved() ? " Every room is solved." : "")}), 900);
  objective(allSolved() ? "Every room solved. Wander as you like." : nextObjective());
}

function solveScreen() {
  state.solved.scr = true;
  save(); refreshDoors(); refreshItems(); Audio.cue("solve"); flash();
  setTimeout(() => debrief({title: "This sentence is false.",
    what: "The screen showed a picture that contains itself, and the sentences talked about themselves. Most of them were simply true or false. " +
      "The last one can't be either: if it's true it's false, and if it's false it's true. Self-reference can trap a system in a loop.",
    why: "Gödel used a careful cousin of this sentence. He built one, in the language of arithmetic, that says \u201cThis sentence can't be proved.\u201d " +
      "It isn't a paradox: if it could be proved, it would be false, so it can't be, and that is exactly what it says. So it's true, but unprovable. " +
      "That's the heart of Gödel, Escher, Bach: a system that can talk about itself always has truths it can't reach."}), 900);
  objective(allSolved() ? "Every room solved. Wander as you like." : nextObjective());
}

// Room 4: keep the walker's height within one loop of the stairs (the geometry repeats every loop,
// so the view doesn't change), count the loops, and mark each landing reached.
function stairs(before) {
  if (roomAt(me.x, me.z) !== "stair") return;
  const R = World.STAIR.rise;
  state.stairTrend = (state.stairTrend || 0) * 0.95 + (me.y - before.y);  // > 0 climbing, < 0 going down
  if (me.y >= R - 1e-6) { me = {...me, y: me.y - R}; state.loops++; kit.cam.ty -= R; }
  else if (me.y < -1e-6) { me = {...me, y: me.y + R}; state.loops--; kit.cam.ty += R; }
  const sg = World.stairSeg(me.x, me.z);
  if (!state.loopedOnce && !state.saidDown && state.loops * R + me.y < -1.2 && state.stairTrend < 0) {
    state.saidDown = true;
    say("You're going down. To climb, turn round and go back past the door.", 6000, true);
  }
  if (sg && sg.land && sg.key !== state.lastKey) {
    state.lastKey = sg.key;
    Audio.keyChord(sg.key * 2);
    if (sg.key === 0 && state.loops >= 1 && !state.loopedOnce) {
      state.loopedOnce = true; save(); refreshTop(); refreshItems();
      say("Back at C, at the door you came in. Yet every step went up.", 7000, true);
      say("Go out to the vestibule and answer the question on the wall.", 6000);
      objective("In the vestibule, answer: where is the top of the staircase?");
    } else if (sg.key === 0 && state.loops >= 2 && state.saidLoop2 !== state.loops) {
      state.saidLoop2 = state.loops;
      say(`Still the same door, ${(state.loops * R).toFixed(1)} metres up. You could climb forever.`, 6000);
    }
  }
}

// Room 3, part 1: how many nested copies of the screen are on screen right now.
function measureScreen(dt) {
  if (state.room !== "scr" || state.card) { state.depth = 0; return; }
  const sc = World.SCREEN, hw = sc.w / 2, hh = sc.h / 2;
  const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([x, y]) => kit.project(sc.c[0] + x, sc.c[1] + y, sc.c[2]));
  const W0 = canvas.clientWidth, H0 = canvas.clientHeight;
  let depth = 0;
  state.tooClose = false;
  if (pts.every((p) => p)) {
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    const cx = (Math.max(...xs) + Math.min(...xs)) / 2, cy = (Math.max(...ys) + Math.min(...ys)) / 2;
    const s = Math.min((Math.max(...xs) - Math.min(...xs)) / W0, (Math.max(...ys) - Math.min(...ys)) / H0);
    const facing = cx > 0 && cx < W0 && cy > 0 && cy < H0;
    // a screen bigger than the view shows copies that grow, not shrink: no tunnel to see
    if (facing && s > 0.97) state.tooClose = true;
    else if (facing && pts.every((p) => p.x >= -2 && p.x <= W0 + 2 && p.y >= -2 && p.y <= H0 + 2))
      depth = 1 + nestingDepth(s, Math.max(W0, H0) * (window.devicePixelRatio > 1 ? 1.4 : 1));
  }
  state.depth = depth;
  // the copies shrink by the screen's share of the view's width and height; in a tall portrait view the
  // height share stays small, so fewer levels show however you stand
  state.depthNeed = W0 >= H0 ? 6 : 4;
  if (state.screenDone) return;
  state.depthHold = depth >= state.depthNeed ? state.depthHold + dt : 0;
  if (state.depthHold > 1.2) {
    state.screenDone = true; save(); refreshSentences(); refreshItems(); Audio.cue("gate");
    say("A picture that contains itself, which contains itself, and so on down. That's self-reference.", 11000, true);
    say("Now the sentences: turn round. The lectern by the side wall has woken up.", 7000);
    objective("Answer the lectern's sentences: is each one true or false?");
  }
}

// What the screen shows: the frame just drawn, turned a little and pasted onto the screen.
const grab = document.createElement("canvas"); grab.width = 256; grab.height = 160;
const gctx = grab.getContext("2d", {willReadFrequently: true});
let lastGrab = 0;
function captureScreen(now) {
  if (state.room !== "scr" || now - lastGrab < 45) return;
  lastGrab = now;
  gctx.fillStyle = "#0b0c10"; gctx.fillRect(0, 0, grab.width, grab.height);
  gctx.save(); gctx.translate(grab.width / 2, grab.height / 2); gctx.rotate(0.14); gctx.scale(1.06, 1.06);
  try { gctx.drawImage(canvas, -grab.width / 2, -grab.height / 2, grab.width, grab.height); } catch (e) { /* no frame yet */ }
  gctx.restore();
  texture(SLOT.screen, {w: grab.width, h: grab.height, rgba: gctx.getImageData(0, 0, grab.width, grab.height).data});
}

function allSolved() { return state.solved.tribar && state.solved.miu && state.solved.scr && state.solved.stair && state.solved.list && state.solved.godel; }
function nextObjective() {
  return !state.solved.tribar ? "Next: the Triangle, through the hall's left-hand door." :
    !state.solved.miu ? "Next: the Machine, through the hall's right-hand door." :
    !state.solved.scr ? "Next: the Screen, through the hall's third door, opposite the welcome plaque." :
    !state.solved.stair ? "Next: the Staircase, through the Screen room's left-hand door." :
    !state.solved.list ? "Next: the List, through the Screen room's left-hand door, then the small room's left-hand door." :
    "Next: the Prover, through the door in the List's right-hand wall as you come in.";
}

function maybeOpenGate() {
  if (state.gateOpen) return;
  const distinct = new Set(state.made).size;
  if (distinct >= 9 || state.presses >= 18 || state.machineTime > 120) {
    state.gateOpen = true;
    refreshGate(); refreshLights(); refreshPoints(); save();
    Audio.cue("gate");
    say("You've been working inside the machine's rules. The gate has opened: it's at the foot of the ramp, in the corner on your right as you come in. Follow the lights up and look at the machine from outside.", 10000, true);
    objective("Climb the ramp to the balcony and read the board.");
  }
}

function declare() {
  if (state.solved.miu) return;
  state.solved.miu = true;
  save(); refreshDoors(); refreshItems(); refreshLights(); refreshPoints(); Audio.cue("solve"); flash();
  setTimeout(() => debrief({title: "MU can't be made.",
    what: "Inside the machine you could press buttons forever without making MU, and the buttons alone could never tell you to stop. " +
      "Up here you saw the pattern from outside: the number of I's is never a multiple of 3, and MU has none.",
    why: "Some facts about a set of rules can only be seen from outside the rules. In 1931 Kurt Gödel showed this is true even of the rules of " +
      "arithmetic: there are true statements those rules can never prove. Where is the loop? Gödel's trick was to make arithmetic describe its own rules, " +
      "so the system talks about itself, the way a picture of a picture contains itself. That self-reference is the strange loop at the heart of the book." +
      (allSolved() ? " Every room is solved." : "")}), 900);
  objective(allSolved() ? "Every room solved. Wander as you like." : nextObjective());
}

// ------------------------------------------------------------------ the triangle
let warmthNow = 0;
function checkTribar(dt) {
  const fill = document.querySelector("#cross .fill");
  if (state.solved.tribar || state.room !== "tri" || state.card) {
    state.hold = 0; fill.style.strokeDashoffset = 69.1; Audio.warmth(0);
    if (!focus) document.querySelector("#cross .ring").style.stroke = "";
    return;
  }
  const [ex, ey, ez] = World.TRIBAR.eye;
  const eye = [me.x, me.y + Walk.EYE, me.z];
  const off = Math.hypot(me.x - ex, me.z - ez);
  const look = Walk.lookDir(me.yaw, me.pitch), to = v3.norm(v3.sub(World.TRIBAR.centre, eye));
  const angle = Math.acos(Math.min(1, v3.dot(look, to))) * 180 / Math.PI;
  // warmer as you near the spot while looking at the triangle
  const target = Math.max(0, 1 - off / 8) ** 1.5 * Math.max(0, 1 - angle / 45);
  warmthNow += (target - warmthNow) * Math.min(1, dt * 6);
  Audio.warmth(warmthNow);
  document.querySelector("#cross .ring").style.stroke = `rgba(214,167,90,${(0.15 + 0.85 * warmthNow) * (warmthNow > 0.03 ? 1 : 0)})`;
  const lined = off < 0.5 && Math.abs(eye[1] - ey) < 0.2 && angle < 11;
  state.hold = lined ? state.hold + dt : Math.max(0, state.hold - dt * 2);
  fill.style.strokeDashoffset = 69.1 * (1 - Math.min(1, state.hold / HOLD));
  if (lined && state.hold < dt * 1.5) say("Hold still...", 1600);
  if (state.hold >= HOLD) solveTribar();
}

function flash() {
  const el = $("flash"); el.classList.add("on");
  setTimeout(() => el.classList.remove("on"), 180);
}
function solveTribar() {
  state.solved.tribar = true; state.hint = true; state.glow = 1;
  save(); refreshDoors(); Audio.warmth(0); Audio.cue("solve"); flash();
  document.querySelector("#cross .fill").style.strokeDashoffset = 69.1;
  say("There: three beams closing into a loop. Now take a few steps sideways and watch it.", 7000, true);
  state.solvedAt = {x: me.x, z: me.z, t: performance.now()};
  state.tribarDebrief = (stepped) => debrief({title: "You found it.",
    what: "From exactly this spot, the far end of one beam lines up with the near end of another, so your eye joins them into a triangle. " +
      (stepped ? "When you stepped aside, the triangle came apart: it was an open, bent bar all along, cut at a slant."
        : "Step aside and it comes apart: it's an open, bent bar, cut at a slant. It only closes from here."),
    why: "Going round the triangle, you keep moving forward and arrive back where you started. Hofstadter calls that a strange loop. " +
      "It only worked from one point of view, and stepping out of that view showed you how it was done. " +
      "The Machine, across the hall, does the same thing with rules instead of beams."});
  objective(allSolved() ? "Every room solved. Wander as you like." : "Walk sideways and watch it break. " + nextObjective().replace("Next: ", "Then "));
}

// ------------------------------------------------------------------ HUD: captions, objective, cards
const queue = [];
let showing = null, showUntil = 0;
function say(text, ms = 6000, urgent = false) {
  if (showing && showing.text === text) return;
  if (urgent) { queue.length = 0; showing = null; }
  if (queue.some((q) => q.text === text)) return;
  queue.push({text, ms});
}
function captions(now) {
  const el = $("caption");
  if (showing && now < showUntil) return;
  if (showing) { showing = null; el.classList.add("out"); return; }
  if (!queue.length || state.card) return;
  showing = queue.shift(); showUntil = now + showing.ms;
  el.textContent = showing.text; el.hidden = false;
  requestAnimationFrame(() => el.classList.remove("out"));
}
let freshTimer = 0;
function objective(text) {
  const el = $("objective");
  text = text.replace(/^Next: (.)/, (m, c) => c.toUpperCase());  // the box already says NEXT
  if (el.textContent === text) return;
  el.textContent = text; el.hidden = false; el.classList.add("fresh");
  clearTimeout(freshTimer); freshTimer = setTimeout(() => el.classList.remove("fresh"), 1400);
}
function setCard(name) {
  for (const id of ["title", "menu", "panel"]) $(id).hidden = id !== name;
  state.card = name;
  document.body.classList.toggle("carded", !!name);
  if (name && document.pointerLockElement) document.exitPointerLock();
  if (name) keys.clear();
  holdView(!!name);
}
// While a card is up nothing in the house needs to move, so stop drawing it: on a slow, software-
// rendered machine each frame can take a second or more, and the card's buttons wait behind it. A
// frame or two still draws first, so the house shows (dimmed) behind the card.
function holdView(hold) {
  if (!kit || driven) return;
  if (hold) {
    requestAnimationFrame(() => requestAnimationFrame(() => { if (state.card) kit.running = false; }));
  } else {
    // A loop frame still pending from before the hold was asked for earlier than this one, so it
    // runs first, sees running is false and stops: there is never a second loop.
    requestAnimationFrame(() => {
      if (state.card || kit.running) return;
      document.dispatchEvent(new Event("visibilitychange"));  // the kit restarts its frame-time window
      kit.start();
    });
  }
}
function play() {  // leave a card and go back to the house
  setCard(null);
  if (pendingDebrief) { const d = pendingDebrief; pendingDebrief = null; debrief(d); return; }
  if (pendingEnd && state.solved.godel) { const d = pendingEnd; pendingEnd = null; debrief(d); return; }
  Audio.start(); Audio.setMuted(!settings.sound); Audio.room(state.room);
  if (!touchFirst) lockPointer();
  canvas.focus();
}
let pendingDebrief = null;
// Chrome refuses a re-lock within about a second of Esc (and says so through a promise): then a
// click on the view locks it.
function lockPointer() {
  try { const p = canvas.requestPointerLock(); if (p && p.catch) p.catch(() => {}); } catch (e) { /* unsupported */ }
}
function debrief(d) {
  if (state.card) { pendingDebrief = d; return; }  // shown when the player is back in the house
  const {title, what, why} = d;
  $("panel-title").textContent = title; $("panel-what").textContent = what; $("panel-why").textContent = why;
  setCard("panel"); $("panel-ok").focus();
}
$("panel-ok").addEventListener("click", play);
$("begin").addEventListener("click", () => { play(); if (!hasProgress) intro(); else welcomeBack(); });
let freshArmed = false;
$("fresh").addEventListener("click", (e) => {
  if (!freshArmed) { freshArmed = true; e.target.textContent = "Sure? This forgets your progress"; return; }
  store.set(SAVE_KEY, "{}"); location.reload();
});
$("resume").addEventListener("click", play);
let restartArmed = false;
$("restart").addEventListener("click", (e) => {
  if (!restartArmed) { restartArmed = true; e.target.textContent = "Sure? This forgets your progress"; e.target.classList.add("danger"); return; }
  store.set(SAVE_KEY, "{}"); location.reload();
});
$("menubtn").addEventListener("click", () => openMenu());
function openMenu() {
  restartArmed = false; $("restart").textContent = "Start over"; $("restart").classList.remove("danger");
  setCard("menu"); $("resume").focus();
}
$("fov").value = settings.fov; $("textsize").value = String(settings.text);
$("fov").addEventListener("input", (e) => { settings.fov = Number(e.target.value); saveSettings(); });
$("textsize").addEventListener("change", (e) => { settings.text = Number(e.target.value); document.documentElement.style.setProperty("--ui", settings.text); saveSettings(); });
$("sens").value = settings.sens; $("invert").checked = settings.invert; $("soundon").checked = settings.sound;
$("sens").addEventListener("input", (e) => { settings.sens = Number(e.target.value); saveSettings(); });
$("invert").addEventListener("change", (e) => { settings.invert = e.target.checked; saveSettings(); });
$("soundon").addEventListener("change", (e) => { settings.sound = e.target.checked; Audio.setMuted(!settings.sound); saveSettings(); });

const KEYS = touchFirst
  ? [["Stick", "walk (push far to run)"], ["Drag", "look around"], ["Use / tap", "press what you're looking at"], ["≡", "this menu"]]
  : [["W A S D", "walk (Shift to run)"], ["Mouse", "look around"], ["E / click", "use what you're looking at"], ["Esc", "this menu"]];
$("keys").innerHTML = KEYS.map(([k, v]) => `<kbd>${k}</kbd><span>${v}</span>`).join("");
$("how").innerHTML = touchFirst
  ? "<b>Walk</b> with the stick · <b>look</b> by dragging · <b>use</b> things with the Use button. Each room is a puzzle; read the plaques."
  : "<b>Walk</b> with W A S D · <b>look</b> with the mouse · <b>use</b> things with E. Esc pauses. Each room is a puzzle; read the plaques.";
if (hasProgress) { $("begin").textContent = "Continue"; $("fresh").hidden = false; }

function intro() {
  objective("Read the plaque ahead, then take the door on the left: Room 1, the Triangle.");
  say("Welcome. Read the plaque on the far wall: you can read it from here.", 6000);
  say("Then take the door on your left, into the Triangle room.", 6000);
}
function welcomeBack() {
  objective(allSolved() ? "Every room solved. Wander as you like." : nextObjective());
}

function roomAt(x, z = 0) {
  if (z > World.LIST.z0 - 0.5) return x < World.LIST.x0 - 0.15 ? "prv" : "list";
  if (z > World.MIU.z1 + 0.5) return x < World.VEST.x0 ? "stair" : x < World.SCR.x0 ? "vest" : "scr";
  return x < World.HUB.x0 - 1.5 ? "tri" : x > World.HUB.x1 + 1.5 ? "miu" : "hub";
}
function enterRoom(r) {
  Audio.room(r);
  if (r === "hub") {
    const n = ["tribar", "miu", "scr", "stair", "list", "godel"].filter((k) => state.solved[k]).length;
    if (n === 6 && !state.saidEnd) { state.saidEnd = true; say("Every loop in the house, found. Thank you for playing.", 9000); }
    else if (n > 0 && n < 6 && state.saidN !== n) { state.saidN = n; say(`${["One loop", "Two loops", "Three loops", "Four loops", "Five loops"][n - 1]} found. ${nextObjective().replace("Next: ", "Next is ")}`, 6000); }
  }
  if (state.seenRooms.has(r)) return;
  state.seenRooms.add(r); save();
  if (r === "tri" && !state.solved.tribar) {
    say("Somewhere in here is a triangle that shouldn't exist.", 4500);
    say("Read the plaque on the wall to your right, then explore. As you get close, a tone rises and the ring round the crosshair glows.", 8000);
    objective("Find the one spot where the triangle closes.");
  }
  if (r === "vest" && !state.solved.stair) {
    say("A small room outside a stairwell. Read the plaque, then go through the door straight ahead and climb.", 7000);
    objective(state.loopedOnce ? "Answer the question on the wall: where is the top of the staircase?" : "Climb the staircase and find the top.");
  }
  if (r === "stair" && !state.solved.stair && !state.loopedOnce) {
    say("The stairs go up to your right. Each landing is one key higher: listen to your footsteps as you climb.", 7000);
  }
  if (r === "list" && !state.solved.list) {
    say("A library, and a list that claims to hold everything. Read the plaque on your left as you come in.", 7000);
    say("Set the switches on the desk to make a row, then press CHECK.", 6000);
    objective(state.diag.round >= 2 ? "Answer the question on the left-hand wall: which list could hold every endless row?" :
      state.diag.round === 1 ? "The librarian added your row. Make a row that still isn't in the list." : "Make a row of tiles that isn't anywhere in the librarian's list.");
  }
  if (r === "prv" && !state.solved.godel) {
    say("The last room. A machine that proves things, and some numbered cards. Read the plaque on your right.", 7000);
    say("Press a card on the desk to feed it to the Prover. Start with cards 12 and 47.", 6500);
    objective(state.prv.selfFed ? "Answer the questions on the left-hand wall about card 81." :
      state.prv.fed.length < 2 ? "Feed cards 12 and 47 to the Prover, and watch what it does with each." :
      "Card 81 says the Prover can't prove some card. Set its number so it talks about itself, then feed it in.");
  }
  if (r === "scr" && !state.solved.scr) {
    say("A screen that shows whatever you're looking at. Read the plaque by the door.", 6000);
    say("Walk up to the big screen and look straight at it.", 6000);
    objective(state.screenDone ? "Answer the lectern's sentences: is each one true or false?" : "Look straight at the big screen until it shows itself many levels deep.");
  }
  if (r === "miu" && !state.solved.miu) {
    say("A machine that changes words. The rules are on the wall, the buttons on the desk.", 6000);
    say("Look at a button and press it to apply its rule. Try to turn MI into MU.", 7000);
    objective("Turn MI into MU, using only the buttons.");
  }
}

// ------------------------------------------------------------------ input
const keys = new Set();
addEventListener("keydown", (e) => {
  if (state.card === "panel" && (e.key === "Enter" || e.key === "Escape") && document.activeElement !== $("panel-ok")) { play(); return; }
  if (state.card === "menu" && e.key === "Escape") { play(); return; }
  if (state.card) return;
  keys.add(e.code);
  if (e.code === "KeyE" && !e.repeat) use();
  if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown"].includes(e.code)) e.preventDefault();
});
addEventListener("keyup", (e) => keys.delete(e.code));
addEventListener("blur", () => keys.clear());

canvas.addEventListener("click", () => {
  if (touchFirst || state.card) return;
  if (document.pointerLockElement !== canvas) lockPointer();
  else use();
});
// Esc frees the mouse: that is the pause menu (unless a card is already up)
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement !== canvas && !state.card && !driven && !touchFirst) openMenu();
});
let camSeen = null;  // the camera as this page last left it; a drag (the kit's) moves it in between
document.addEventListener("mousemove", (e) => {
  if (document.pointerLockElement !== canvas || !kit || state.card) return;
  const k = 0.0024 * settings.sens;
  kit.cam.yaw += e.movementX * k;
  kit.cam.pitch = Math.min(Math.max(kit.cam.pitch + e.movementY * k * (settings.invert ? -1 : 1), -1.2), 1.2);
  camSeen = {yaw: kit.cam.yaw, pitch: kit.cam.pitch};
});
// A drag on the view (touch, or a mouse without the pointer lock) turns the camera through the kit:
// scale that turn by the look speed and flip it for invert, as the locked mouse is.
function settleDrag() {
  if (camSeen) {
    const dy = kit.cam.yaw - camSeen.yaw, dp = kit.cam.pitch - camSeen.pitch;
    if (dy || dp) {
      kit.cam.yaw = camSeen.yaw + dy * settings.sens;
      kit.cam.pitch = Math.min(Math.max(camSeen.pitch + dp * settings.sens * (settings.invert ? -1 : 1), -1.2), 1.2);
    }
  }
  camSeen = {yaw: kit.cam.yaw, pitch: kit.cam.pitch};
}
document.addEventListener("visibilitychange", () => { if (document.hidden && kit) save(); });
addEventListener("pagehide", () => { if (kit) save(); });

// touch: a stick on the left, a Use button on the right; dragging the view looks around (the kit's drag)
let stickInput = {forward: 0, right: 0, run: false}, stickId = null, stickOrigin = null;
const stickEl = $("stick"), knob = $("knob");
stickEl.addEventListener("pointerdown", (e) => { stickId = e.pointerId; stickOrigin = [e.clientX, e.clientY]; stickEl.setPointerCapture(e.pointerId); e.preventDefault(); Audio.start(); });
stickEl.addEventListener("pointermove", (e) => {
  if (e.pointerId !== stickId) return;
  const dx = e.clientX - stickOrigin[0], dy = e.clientY - stickOrigin[1], R = 56;
  stickInput = Walk.stick(dx, dy, R);
  const m = Math.min(1, Math.hypot(dx, dy) / R), a = Math.atan2(dy, dx);
  knob.style.transform = `translate(${Math.cos(a) * m * R}px, ${Math.sin(a) * m * R}px)`;
});
const stickEnd = (e) => { if (e.pointerId !== stickId) return; stickId = null; stickInput = {forward: 0, right: 0, run: false}; knob.style.transform = ""; };
stickEl.addEventListener("pointerup", stickEnd); stickEl.addEventListener("pointercancel", stickEnd);
$("use").addEventListener("click", () => use());
if (touchFirst) document.body.classList.add("touch");

function input(dt) {
  const k = (c) => keys.has(c);
  let forward = (k("KeyW") || k("ArrowUp") ? 1 : 0) - (k("KeyS") || k("ArrowDown") ? 1 : 0);
  let right = (k("KeyD") ? 1 : 0) - (k("KeyA") ? 1 : 0);
  // the arrow keys turn at a steady 1.8 rad a second (about 103 degrees), whatever the frame rate
  if (k("ArrowLeft") && kit) { kit.cam.yaw -= 1.8 * dt * settings.sens; camSeen = {yaw: kit.cam.yaw, pitch: kit.cam.pitch}; }
  if (k("ArrowRight") && kit) { kit.cam.yaw += 1.8 * dt * settings.sens; camSeen = {yaw: kit.cam.yaw, pitch: kit.cam.pitch}; }
  // Page Up / Page Down tilt the view (for keyboard-only players)
  if ((k("PageUp") || k("PageDown")) && kit) {
    kit.cam.pitch = Math.min(Math.max(kit.cam.pitch + (k("PageDown") ? 1 : -1) * 1.2 * dt * settings.sens, -1.2), 1.2);
    camSeen = {yaw: kit.cam.yaw, pitch: kit.cam.pitch};
  }
  if (stickId != null) { forward = stickInput.forward; right = stickInput.right; }
  return {forward, right, run: k("ShiftLeft") || k("ShiftRight") || stickInput.run};
}

// What the crosshair is on: a console button or the declare button, within reach.
let focus = null;
function rayHit(o, d, lo, hi) {
  let t0 = 0, t1 = 4;
  for (let i = 0; i < 3; i++) {
    if (Math.abs(d[i]) < 1e-9) { if (o[i] < lo[i] || o[i] > hi[i]) return null; continue; }
    let a = (lo[i] - o[i]) / d[i], b = (hi[i] - o[i]) / d[i];
    if (a > b) [a, b] = [b, a];
    t0 = Math.max(t0, a); t1 = Math.min(t1, b);
    if (t0 > t1) return null;
  }
  return t0;
}
function targets() {
  const t = [];
  for (const [id, , x] of World.BUTTONS) t.push({id, lo: [x - 0.26, World.BUTTON_Y - 0.08, World.BUTTON_Z - 0.24], hi: [x + 0.26, World.BUTTON_Y + 0.1, World.BUTTON_Z + 0.24]});
  for (const [id, , x] of World.TOP_ANSWERS) t.push({id, lo: [x - 0.22, 0.98, 13.08], hi: [x + 0.22, 1.16, 13.52]});
  for (const [id, , z] of World.ANSWERS) t.push({id, lo: [World.ANSWER_X - 0.24, World.ANSWER_Y - 0.08, z - 0.26], hi: [World.ANSWER_X + 0.24, World.ANSWER_Y + 0.1, z + 0.26]});
  for (const [id, , x] of World.SWITCHES) {
    // the switch's own size (0.4 wide, top at +0.04): bigger boxes catch a glancing look at the next one
    const hw = id === "check" ? 0.4 : 0.2;
    t.push({id, lo: [x - hw, World.SWITCH_Y - 0.06, World.SWITCH_Z - 0.21], hi: [x + hw, World.SWITCH_Y + 0.045, World.SWITCH_Z + 0.21]});
  }
  for (const [id] of Diag.QUESTION) {
    const z = World.QANSWERS_Z[id];
    t.push({id, lo: [World.QANSWER_X - 0.24, 0.98, z - 0.26], hi: [World.QANSWER_X + 0.24, 1.16, z + 0.26]});
  }
  for (const [id, , z] of World.PKEYS) {
    const hz = id === "gnum" ? 0.3 : 0.23;
    t.push({id, lo: [World.PKEY_X - 0.21, World.PKEY_Y - 0.06, z - hz], hi: [World.PKEY_X + 0.21, World.PKEY_Y + 0.045, z + hz]});
  }
  for (const id of Prover.ANSWER_IDS) {
    const x = World.GANSWERS_X[id];
    t.push({id, lo: [x - 0.24, 0.98, World.GANSWER_Z - 0.24], hi: [x + 0.24, 1.16, World.GANSWER_Z + 0.24]});
  }
  const dp = World.MACHINE.declare;
  if (me.y > 1) t.push({id: "declare", lo: [dp[0] - 0.22, dp[1] - 0.1, dp[2] - 0.22], hi: [dp[0] + 0.22, dp[1] + 0.12, dp[2] + 0.22]});
  return t;
}
function aim(dir) {
  const o = [me.x, me.y + Walk.EYE, me.z];
  let best = null;
  for (const t of targets()) { const h = rayHit(o, dir, t.lo, t.hi); if (h != null && h < 3.2 && (!best || h < best.t)) best = {id: t.id, t: h}; }
  return best;
}
function use() {
  if (state.card) return;
  if (focus) press(focus.id);
}
function fitFov() {
  const asp = canvas.clientWidth / Math.max(1, canvas.clientHeight);
  const need = 2 * Math.atan(Math.tan(MIN_HFOV * Math.PI / 360) / asp) * 180 / Math.PI;
  const f = Math.min(100, Math.max(settings.fov, need));
  if (Math.abs(f - fovNow) > 0.1) { fovNow = f; mod._tangle_view(ambient, fovNow); }
}
function screenRay(nx, ny) {  // normalised device coords -> world direction
  const f = Walk.lookDir(me.yaw, me.pitch), r = v3.norm(v3.cross(f, [0, 1, 0])), u = v3.cross(r, f);
  const th = Math.tan(fovNow * Math.PI / 360), asp = canvas.clientWidth / Math.max(1, canvas.clientHeight);
  return v3.norm(v3.add(f, v3.add(v3.mul(r, nx * th * asp), v3.mul(u, ny * th))));
}

// ------------------------------------------------------------------ frame
let lastT = null, stride = 0, lastSave = 0, lastGlowT = 0, lastProverT = 0;
function tick(t, now) {
  const dt = lastT == null ? 0 : Math.min(0.05, t - lastT); lastT = t;
  settleDrag();
  me.yaw = kit.cam.yaw; me.pitch = kit.cam.pitch;
  fitFov();
  if (!state.card) {
    const before = me;
    const inp = input(dt);
    me = Walk.step(me, inp, dt, collide);
    stride += Math.hypot(me.x - before.x, me.z - before.z);
    stairs(before);
    if (stride > (inp.run ? 1.05 : 0.78)) {
      stride = 0;
      if (state.room === "stair") Audio.shepard(Math.round((state.loops * World.STAIR.rise + me.y) / World.STAIR.rise * 12));
      else Audio.step(me.y > 0.05 || (me.x > World.MACHINE.ramp.x0 - 0.6 && me.z > World.MACHINE.ramp.z0 && me.x < World.MACHINE.ramp.x1) ? "wood" : state.room);
    }
    if (t - lastSave > 3) { lastSave = t; save(); }
  }
  kit.cam.tx = me.x; kit.cam.ty = me.y + Walk.EYE; kit.cam.tz = me.z; kit.cam.dist = 1;
  const r = roomAt(me.x, me.z);
  if (r !== state.room) { state.room = r; enterRoom(r); }
  if (r === "tri" && !state.solved.tribar && !state.card) {
    state.triTime += dt;
    if (!state.hint && state.triTime > 70) { state.hint = true; say("Hint: a ring of light has appeared on the floor, near the door you came in. Stand in it and look at the triangle.", 8000, true); }
    if (state.hint && state.triTime > 150 && !state.hint2) { state.hint2 = true; say("Stand inside the ring of light near the door, and face the triangle.", 8000); }
  }
  if ((state.hint || state.solved.tribar) && r === "tri") refreshPoints(t);
  if (state.glow > 0.01 && t - lastGlowT > 0.1) { lastGlowT = t; state.glow *= 0.93; refreshLights(); }
  if (r === "miu" && me.y > 3 && !state.saidBalcony && !state.solved.miu) {
    state.saidBalcony = true;
    if (!state.boardShown) { state.boardShown = true; refreshBoard(); save(); }
    say("From up here you can see the machine from outside. Read the board on the wall: it shows every word you made.", 8000, true);
    objective("Read the board. If you're convinced MU can't be made, press the red button beside it.");
  }
  if (r === "miu" && !state.gateOpen && !state.card) { state.machineTime += dt; if (state.frames % 30 === 0) maybeOpenGate(); }
  checkTribar(dt);
  if (state.tribarDebrief && !state.card) {
    const a = state.solvedAt, moved = Math.hypot(me.x - a.x, me.z - a.z);
    if (moved > 1.3 || now - a.t > 25000) {
      const show = state.tribarDebrief; state.tribarDebrief = null;  // a function that shows the card
      setTimeout(() => show(moved > 1.3), moved > 1.3 ? 700 : 0);
    }
  }
  const prev = focus && focus.id;
  focus = (r === "miu" || r === "scr" || r === "vest" || r === "list" || r === "prv") && !state.card ? aim(Walk.lookDir(me.yaw, me.pitch)) : null;
  measureScreen(dt);
  if (r === "prv" && state.prv.run && performance.now() - lastProverT > 300) { lastProverT = performance.now(); proverTick(lastProverT); }
  $("cross").classList.toggle("active", !!focus);
  $("use").classList.toggle("ready", !!focus);
  const p = $("prompt");
  if (focus) { p.textContent = `${touchFirst ? "Use" : "E"}: ${label(focus.id)}${preview(focus.id)}`; p.hidden = false; }
  else if (r === "stair" && !state.card) {
    const sg = World.stairSeg(me.x, me.z), h = state.loops * World.STAIR.rise + me.y;
    const where = sg && sg.land ? `${World.KEYS[sg.key]} landing` : "on the stairs";
    const level = Math.abs(h) < 0.05 ? "level with the door" : h > 0 ? `${h.toFixed(1)} m above the door` : `${(-h).toFixed(1)} m below the door`;
    const down = h < -0.4 && state.stairTrend < -0.005 ? "  \u00b7  going down: turn round to climb" : "";
    p.textContent = `${where}  \u00b7  ${level}${down}`; p.hidden = false;
  }
  else if (state.tooClose && !state.card) { p.textContent = "Too close: step back a little"; p.hidden = false; }
  else if (state.depth >= 2) {
    const need = state.depthNeed || 6;
    p.textContent = state.screenDone ? `${state.depth} levels deep` : `${Math.min(state.depth, need)} of ${need} levels deep${state.depth >= need ? ": hold still" : ": get closer, face it squarely"}`;
    p.hidden = false;
  }
  else p.hidden = true;
  if ((focus && focus.id) !== prev || (pressed.id && now > pressed.until)) { if (pressed.id && now > pressed.until) pressed.id = null; refreshItems(now); }
  captions(now);
  state.frames++;
}

// ------------------------------------------------------------------ boot
async function boot() {
  mod = await StrataLoader.load({script: "engine/tangle-engine.js", factory: "createTangleEngine", wasm: "engine/tangle-engine.wasm",
    title: "Tangle", poster: "assets/poster.jpg", fallback: {href: "https://get.webgl.org/webgl2/", text: "Check WebGL 2 on this computer"}});
  const name = (() => { try { const g = document.createElement("canvas").getContext("webgl2"); const x = g.getExtension("WEBGL_debug_renderer_info"); return String(g.getParameter(x ? x.UNMASKED_RENDERER_WEBGL : g.RENDERER)); } catch (e) { return ""; } })();
  const software = /swiftshader|llvmpipe|software/i.test(name);
  mod._tangle_configure(software ? 0 : 1, driven ? 1 : 0);
  kit = StrataKit.create({
    module: mod, canvas,
    camera: {yaw: me.yaw, pitch: me.pitch, dist: 1, tx: me.x, ty: me.y + Walk.EYE, tz: me.z},
    limits: {minPitch: -1.2, maxPitch: 1.2, minDist: 1, maxDist: 1},
    idleOrbit: false, dprCap: software ? 0.75 : 1.5, quality: software ? 0 : undefined,
    frame: tick,
    after: (t, now) => captureScreen(now),
    onKey: (e) => e.key !== "Tab",
    pick: (x, y) => aim(screenRay(x / canvas.clientWidth * 2 - 1, 1 - y / canvas.clientHeight * 2)),
    idOf: (hit) => hit.id,
    onTap: (hit) => { if (touchFirst && hit && !state.card) press(hit.id); },
    // still slow at the lowest tier: fewer pixels and brighter ambient instead of point lights
    onSlow: () => { kit.dprCap = Math.max(0.5, kit.dprCap * 0.75); ambient = 0.62; mod._tangle_view(ambient, fovNow); },
    onFatal: (code, msg) => StrataLoader.fallback(code, msg),
  });
  ambient = software ? 0.62 : 0.45; fovNow = settings.fov;
  mod._tangle_view(ambient, fovNow);
  buildScene();
  state.room = roomAt(me.x, me.z);
  if (driven) { setCard(null); welcomeBack(); } else { setCard("title"); $("begin").focus(); }
  if (!driven) kit.start();  // setCard("title") above stops it again after the first frame
  // The loader fades out over a few frames, which on a slow machine is seconds of a ghostly "Loading"
  // card over the title. index.html hides it outright once it's done; this makes sure.
  StrataLoader.done();
  for (const l of document.querySelectorAll(".sk-loader")) if (StrataLoader.state === "done") l.hidden = true;
  // tools (tools/shots.cjs) drive the game through this
  window.__tangle = {
    state, get me() { return me; },
    pose(x, z, yaw, pitch = 0) { me = {...me, x, z, y: Walk.floorAt(collide, x, z, x > 19 ? 9 : 0), yaw, pitch}; Object.assign(kit.cam, {yaw, pitch, tx: x, ty: me.y + Walk.EYE, tz: z}); camSeen = {yaw, pitch}; },
    look(yaw, pitch) { kit.cam.yaw = yaw; kit.cam.pitch = pitch; camSeen = {yaw, pitch}; },
    press, card: setCard, openMenu, step(dt, inp) { me = Walk.step(me, inp, dt, collide); },
    reset() { store.set(SAVE_KEY, "{}"); },
  };
}
if (params.has("probe")) import("./probe.js").then((m) => m.startProbe()).catch(() => {});  // playtester (tools/playtest)
boot().catch((e) => { console.error(e); StrataLoader.fallback && StrataLoader.fallback("engine", String(e)); });
