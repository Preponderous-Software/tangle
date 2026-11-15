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
const read = (k) => { try { return JSON.parse(store.get(k) || "{}"); } catch (e) { return {}; } };
const saved = read(SAVE_KEY);
const settings = Object.assign({sens: 1, invert: false, sound: true, fov: 66, text: 1}, read(SETTINGS_KEY));
document.documentElement.style.setProperty("--ui", settings.text);
const state = {
  solved: {tribar: !!saved.tribar, miu: !!saved.miu},
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
const hasProgress = state.solved.tribar || state.solved.miu || state.made.length > 1 || state.seenRooms.size > 0;
function save() {
  store.set(SAVE_KEY, JSON.stringify({tribar: state.solved.tribar, miu: state.solved.miu, gateOpen: state.gateOpen,
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
  declare: 15, progress: 16, legend: 17, gatesign: 18, soon: 19, sealed: 20, rug: 21, display: 30, board: 31};
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
  // a sealed doorway in the hall's south wall: the rooms still to come
  const sealed = new MeshBuilder();
  sealed.box([-1.3, 0, H.z1 - 0.12], [1.3, 2.9, H.z1 - 0.02], [0.13, 0.13, 0.15]);
  sealed.box([-1.45, 0, H.z1 - 0.16], [-1.3, 3.05, H.z1], [0.2, 0.19, 0.18]);
  sealed.box([1.3, 0, H.z1 - 0.16], [1.45, 3.05, H.z1], [0.2, 0.19, 0.18]);
  sealed.box([-1.45, 2.9, H.z1 - 0.16], [1.45, 3.05, H.z1], [0.2, 0.19, 0.18]);
  mesh(SLOT.sealed, sealed);
  // the rug: a flat textured quad just above the floor (normal up)
  texture(SLOT.rug, Text.rug(document));
  const rug = new MeshBuilder();
  rug.panel([0, 0.012, 1.4], [0, 1, 0], 4.2, 4.2, [0, 0, -1]);
  mesh(SLOT.rug, rug, SLOT.rug, 0);
  panelMesh(SLOT.soon, Text.PLAQUES.soon, [0, 1.6, H.z1 - 0.13], [0, 0, -1]);
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
  panelMesh(SLOT.progress, Text.progressPlaque(state.solved), [4.6, 1.9, H.z0 + 0.02], [0, 0, 1]);
}

function refreshGate() {
  if (state.gateOpen) { mesh(SLOT.gate, EMPTY); mesh(SLOT.gatesign, EMPTY); return; }
  mesh(SLOT.gate, World.buildGate());
  const g = World.MACHINE.gate;
  panelMesh(SLOT.gatesign, Text.PLAQUES.gate, [g.x0 - 0.04, 1.45, (g.z0 + g.z1) / 2], [-1, 0, 0]);
}

function refreshLights() {
  const L = World.lights().map((l) => l.slice());
  if (state.glow > 0.01) L.push([...World.TRIBAR.centre.map((v, i) => v + [1.2, 1.0, 1.6][i]), 7, 1.0, 0.82, 0.5, 2.8 * state.glow]);
  if (state.gateOpen && !state.solved.miu) L.push([12.6, 2.6, 7.2, 6, 1.0, 0.85, 0.55, 1.1]);
  rows(mod._tangle_lights, L);
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
    const pulse = solved ? 0.9 : 0.45 + 0.25 * Math.sin(t * 2.2);
    for (let k = 0; k < 28; k++) {
      const a = 2 * Math.PI * k / 28;
      pts.push([ex + 0.42 * Math.cos(a), 0.03, ez + 0.42 * Math.sin(a), 7, 0, ...(solved ? [1.0, 0.8, 0.3] : [0.95, 0.85, 0.55]), pulse]);
    }
  }
  rows(mod._tangle_points, pts);
}

// ------------------------------------------------------------------ the machine
const LEGEND = {r1: "rule 1: if it ends in I, add U", r2: "rule 2: double everything after M", r3: "rule 3: replace III with U",
  r4: "rule 4: remove UU", next: "move the highlight to the next III or UU", undo: "take back the last step", declare: "say: MU can't be made"};

function press(id) {
  const now = performance.now();
  pressed = {id, until: now + 160};
  if (id === "declare") { Audio.cue("click"); declare(); return; }
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

function maybeOpenGate() {
  if (state.gateOpen) return;
  const distinct = new Set(state.made).size;
  if (distinct >= 9 || state.presses >= 18 || state.machineTime > 120) {
    state.gateOpen = true;
    refreshGate(); refreshLights(); save();
    Audio.cue("gate");
    say("You've been working inside the machine's rules. The gate at the foot of the ramp, by the door you came in, has opened: go up and look at the machine from outside.", 9000, true);
    objective("Climb the ramp to the balcony and read the board.");
  }
}

function declare() {
  if (state.solved.miu) return;
  state.solved.miu = true;
  save(); refreshDoors(); refreshItems(); refreshLights(); Audio.cue("solve"); flash();
  const both = state.solved.tribar;
  setTimeout(() => debrief({title: "MU can't be made.",
    what: "Inside the machine you could press buttons forever without making MU, and the buttons alone could never tell you to stop. " +
      "Up here you saw the pattern from outside: the number of I's is never a multiple of 3, and MU has none.",
    why: "Some facts about a set of rules can only be seen from outside the rules. In 1931 Kurt Gödel showed this is true even of the rules of " +
      "arithmetic: there are true statements those rules can never prove. Where is the loop? Gödel's trick was to make arithmetic describe its own rules, " +
      "so the system talks about itself, the way a picture of a picture contains itself. That self-reference is the strange loop at the heart of the book." +
      (both ? " You've solved both rooms. More are coming: a screen that shows itself, a staircase that climbs forever, and a list that can't hold everything."
        : " The Triangle room is on the other side of the hall.")}), 900);
  objective(both ? "Both rooms solved. Wander as you like." : "Next: the Triangle, across the hall.");
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
  const lined = off < 0.38 && Math.abs(eye[1] - ey) < 0.2 && angle < 11;
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
  state.tribarDebrief = () => debrief({title: "You found it.",
    what: "From exactly this spot, the far end of one beam lines up with the near end of another, so your eye joins them into a triangle. " +
      "When you stepped aside, the triangle came apart: it was an open, bent bar all along, cut at a slant.",
    why: "Going round the triangle, you keep moving forward and arrive back where you started. Hofstadter calls that a strange loop. " +
      "It only worked from one point of view, and stepping out of that view showed you how it was done. " +
      "The Machine, across the hall, does the same thing with rules instead of beams."});
  objective(state.solved.miu ? "Both rooms solved. Wander as you like." : "Walk sideways and watch it break. Then try the Machine, across the hall.");
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
  if (touchFirst) { const o = $("objective").getBoundingClientRect(); el.style.top = `${Math.round(o.bottom + 8)}px`; }
  el.textContent = showing.text; el.hidden = false;
  requestAnimationFrame(() => el.classList.remove("out"));
}
let freshTimer = 0;
function objective(text) {
  const el = $("objective");
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
}
function play() {  // leave a card and go back to the house
  setCard(null);
  if (pendingDebrief) { const d = pendingDebrief; pendingDebrief = null; debrief(d); return; }
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
  objective("Read the plaque ahead, then take the door on the left.");
  say("Welcome. Walk up to the plaque on the far wall and read it.", 6000);
}
function welcomeBack() {
  objective(state.solved.tribar && state.solved.miu ? "Both rooms solved. Wander as you like." :
    state.solved.tribar ? "Next: the Machine, through the hall's right-hand door." :
    state.solved.miu ? "Next: the Triangle, through the hall's left-hand door." : "Find the Triangle, through the hall's left-hand door.");
}

function roomAt(x) { return x < World.HUB.x0 - 1.5 ? "tri" : x > World.HUB.x1 + 1.5 ? "miu" : "hub"; }
function enterRoom(r) {
  Audio.room(r);
  if (r === "hub") {
    const n = (state.solved.tribar ? 1 : 0) + (state.solved.miu ? 1 : 0);
    if (n === 2 && !state.saidEnd) { state.saidEnd = true; say("That's the first part of the house. The sealed door behind you is where the next rooms will go. Thank you for playing.", 9000); }
    else if (n === 1 && !state.saidOne) { state.saidOne = true; say(state.solved.tribar ? "One loop found. The Machine is through the door on the right." : "One loop found. The Triangle is through the door on the left.", 6000); }
  }
  if (state.seenRooms.has(r)) return;
  state.seenRooms.add(r); save();
  if (r === "tri" && !state.solved.tribar) {
    say("Somewhere in here is a triangle that shouldn't exist.", 4500);
    say("Read the plaque on the wall to your right, then explore. A tone gets higher as you get close.", 7000);
    objective("Find the one spot where the triangle closes.");
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
  if (["KeyW", "KeyA", "KeyS", "KeyD", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.code)) e.preventDefault();
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

function input() {
  const k = (c) => keys.has(c);
  let forward = (k("KeyW") || k("ArrowUp") ? 1 : 0) - (k("KeyS") || k("ArrowDown") ? 1 : 0);
  let right = (k("KeyD") ? 1 : 0) - (k("KeyA") ? 1 : 0);
  if (k("ArrowLeft") && kit) { kit.cam.yaw -= 0.03 * settings.sens; camSeen = {yaw: kit.cam.yaw, pitch: kit.cam.pitch}; }
  if (k("ArrowRight") && kit) { kit.cam.yaw += 0.03 * settings.sens; camSeen = {yaw: kit.cam.yaw, pitch: kit.cam.pitch}; }
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
let lastT = null, stride = 0, lastSave = 0, lastGlowT = 0;
function tick(t, now) {
  const dt = lastT == null ? 0 : Math.min(0.05, t - lastT); lastT = t;
  settleDrag();
  me.yaw = kit.cam.yaw; me.pitch = kit.cam.pitch;
  fitFov();
  if (!state.card) {
    const before = me;
    const inp = input();
    me = Walk.step(me, inp, dt, collide);
    stride += Math.hypot(me.x - before.x, me.z - before.z);
    if (stride > (inp.run ? 1.05 : 0.78)) {
      stride = 0;
      Audio.step(me.y > 0.05 || (me.x > World.MACHINE.ramp.x0 - 0.6 && me.z > World.MACHINE.ramp.z0 && me.x < World.MACHINE.ramp.x1) ? "wood" : state.room);
    }
    if (t - lastSave > 3) { lastSave = t; save(); }
  }
  kit.cam.tx = me.x; kit.cam.ty = me.y + Walk.EYE; kit.cam.tz = me.z; kit.cam.dist = 1;
  const r = roomAt(me.x);
  if (r !== state.room) { state.room = r; enterRoom(r); }
  if (r === "tri" && !state.solved.tribar && !state.card) {
    state.triTime += dt;
    if (!state.hint && state.triTime > 70) { state.hint = true; say("Hint: a ring of light has appeared on the floor, near the door you came in. Stand in it and look at the triangle.", 8000, true); }
    if (state.hint && state.triTime > 150 && !state.hint2) { state.hint2 = true; say("Stand inside the ring of light near the door, and face the triangle.", 8000); }
  }
  if ((state.hint || state.solved.tribar) && r === "tri") refreshPoints(t);
  if (state.glow > 0.01 && t - lastGlowT > 0.1) { lastGlowT = t; state.glow *= 0.93; refreshLights(); }
  if (me.y > 3 && !state.saidBalcony && !state.solved.miu) {
    state.saidBalcony = true;
    if (!state.boardShown) { state.boardShown = true; refreshBoard(); save(); }
    say("From up here you can see the machine from outside. Read the board on the wall: it shows every word you made.", 8000, true);
    objective("Read the board. If you're convinced MU can't be made, press the red button beside it.");
  }
  if (r === "miu" && !state.gateOpen && !state.card) { state.machineTime += dt; if (state.frames % 30 === 0) maybeOpenGate(); }
  checkTribar(dt);
  if (state.tribarDebrief && !state.card) {
    const a = state.solvedAt, moved = Math.hypot(me.x - a.x, me.z - a.z);
    if (moved > 1.3 || now - a.t > 9000) {
      const show = state.tribarDebrief; state.tribarDebrief = null;  // a function that shows the card
      setTimeout(show, moved > 1.3 ? 700 : 0);
    }
  }
  const prev = focus && focus.id;
  focus = r === "miu" && !state.card ? aim(Walk.lookDir(me.yaw, me.pitch)) : null;
  $("cross").classList.toggle("active", !!focus);
  $("use").classList.toggle("ready", !!focus);
  const p = $("prompt");
  if (focus) { p.textContent = `${touchFirst ? "Use" : "E"}: ${LEGEND[focus.id]}${preview(focus.id)}`; p.hidden = false; } else p.hidden = true;
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
  state.room = roomAt(me.x);
  if (driven) { setCard(null); welcomeBack(); } else { setCard("title"); $("begin").focus(); }
  if (!driven) kit.start();
  StrataLoader.done();
  // tools (tools/shots.cjs) drive the game through this
  window.__tangle = {
    state, get me() { return me; },
    pose(x, z, yaw, pitch = 0) { me = {...me, x, z, y: Walk.floorAt(collide, x, z, x > 19 ? 9 : 0), yaw, pitch}; Object.assign(kit.cam, {yaw, pitch, tx: x, ty: me.y + Walk.EYE, tz: z}); camSeen = {yaw, pitch}; },
    look(yaw, pitch) { kit.cam.yaw = yaw; kit.cam.pitch = pitch; camSeen = {yaw, pitch}; },
    press, card: setCard, openMenu, step(dt, inp) { me = Walk.step(me, inp, dt, collide); },
    reset() { store.set(SAVE_KEY, "{}"); },
  };
}
boot().catch((e) => { console.error(e); StrataLoader.fallback && StrataLoader.fallback("engine", String(e)); });
