// The house: three rooms, their walls (meshes and collision), floors, lights and the fixed places
// the game logic needs. Metres, y up. Pure data + mesh building (no DOM, no engine).
import {MeshBuilder} from "./geom.js";
import {EYE} from "./walk.js";

export const HUB = {x0: -6, z0: -6, x1: 6, z1: 6, h: 4.2};
export const TRI = {x0: -23, z0: -8, x1: -9, z1: 8, h: 6};
export const MIU = {x0: 9, z0: -8, x1: 23, z1: 8, h: 7.5};
export const SCR = {x0: -8, z0: 9, x1: 8, z1: 23, h: 4.6};
// Room 4: a vestibule (outside the loop) and the stairwell of six flights around a well.
export const VEST = {x0: -10.7, z0: 12.6, x1: -8.3, z1: 19.4, h: 3.2};
export const STAIR = {x0: -23, z0: 10, x1: -11, z1: 22, wd: 1.8, rise: 4.8};
export const DOOR4 = [14.8, 17.2];   // z range of the doors between Room 3, the vestibule and the stairs
export const TOP_ANSWERS = [["a_up", "KEEP CLIMBING", -10.0], ["a_loop", "IT LOOPS", -9.5], ["a_as", "AT A\u266f", -9.0]];
export const KEYS = ["C", "D", "E", "F\u266f", "G\u266f", "A\u266f"];

// The stairwell, going up: landings (flat) and flights (each one whole tone, 0.8 m, higher).
// Flight `dir`: +1 rises as the coordinate along `along` grows, -1 as it shrinks.
export const STAIR_SEGS = (() => {
  const {x0: X0, x1: X1, z0: Z0, z1: Z1, wd: W} = STAIR, [d0, d1] = DOOR4, f = 0.8;
  return [
    {land: true, x: [X1 - W, X1], z: [d0, d1], h: 0, key: 0, side: "e"},
    {x: [X1 - W, X1], z: [Z0 + W, d0], along: "z", dir: -1, h0: 0, h1: f},
    {land: true, x: [X1 - W, X1], z: [Z0, Z0 + W], h: f, key: 1, side: "n"},
    {x: [X0 + W, X1 - W], z: [Z0, Z0 + W], along: "x", dir: -1, h0: f, h1: 2 * f},
    {land: true, x: [X0, X0 + W], z: [Z0, Z0 + W], h: 2 * f, key: 2, side: "w"},
    {x: [X0, X0 + W], z: [Z0 + W, d0], along: "z", dir: 1, h0: 2 * f, h1: 3 * f},
    {land: true, x: [X0, X0 + W], z: [d0, d1], h: 3 * f, key: 3, side: "w"},
    {x: [X0, X0 + W], z: [d1, Z1 - W], along: "z", dir: 1, h0: 3 * f, h1: 4 * f},
    {land: true, x: [X0, X0 + W], z: [Z1 - W, Z1], h: 4 * f, key: 4, side: "s"},
    {x: [X0 + W, X1 - W], z: [Z1 - W, Z1], along: "x", dir: 1, h0: 4 * f, h1: 5 * f},
    {land: true, x: [X1 - W, X1], z: [Z1 - W, Z1], h: 5 * f, key: 5, side: "e"},
    {x: [X1 - W, X1], z: [d1, Z1 - W], along: "z", dir: -1, h0: 5 * f, h1: 6 * f},
  ];
})();

export function inStairWell(x, z) {  // the open well in the middle (no floor)
  const {x0, x1, z0, z1, wd} = STAIR;
  return x > x0 + wd && x < x1 - wd && z > z0 + wd && z < z1 - wd;
}
export function stairSeg(x, z) {
  for (const sg of STAIR_SEGS) if (x >= sg.x[0] && x <= sg.x[1] && z >= sg.z[0] && z <= sg.z[1]) return sg;
  return null;
}
// The floor's height on the stairs, in 0..rise (the C landing is 0; the last flight ends at rise).
export function stairHeight(x, z) {
  const sg = stairSeg(x, z);
  if (!sg) return 0;
  if (sg.land) return sg.h;
  const [lo, hi] = sg[sg.along], c = sg.along === "x" ? x : z;
  const t = Math.min(1, Math.max(0, sg.dir > 0 ? (c - lo) / (hi - lo) : (hi - c) / (hi - lo)));
  return sg.h0 + t * (sg.h1 - sg.h0);
}
const DOOR = {z0: -1.2, z1: 1.2, h: 2.8};

// The triangle room's one viewpoint and its sculpture.
export const TRIBAR = {eye: [-12.2, EYE, 5.4], centre: [-19.6, 2.9, -3.6], L: 4.2, w: 0.7};

// Room 3: the screen that shows what you see, and the lectern of sentences about themselves.
export const SCREEN = {c: [0, 2.15, 22.83], w: 4.4, h: 2.75};  // in front of its bezel (22.86)
export const LECTERN = {x0: 6.3, x1: 6.95, z0: 13.8, z1: 16.2, h: 1.0};
export const ANSWERS = [["true", "TRUE", 14.45], ["false", "FALSE", 15.0], ["neither", "CAN'T BE EITHER", 15.55]];
export const ANSWER_X = 6.62, ANSWER_Y = 1.06;
export const SENTENCE_BOARD = {c: [7.87, 2.35, 15.0], w: 3.8, h: 1.6};  // in front of its frame (7.9)

// The machine room: console, display, the ramp up to the balcony, the gate.
export const MACHINE = {
  console: {x0: 14, z0: -5.7, x1: 18, z1: -4.7, h: 1.0},
  display: {c: [16, 3.3, -7.86], w: 7.2, h: 2.1},
  rules: {c: [11.4, 2.4, -7.86], w: 3.4, h: 2.4},
  ramp: {x0: 12.6, x1: 19.5, z0: 6.4, z1: 8, top: 3.6},
  balcony: {x0: 19.5, x1: 23, z0: -8, z1: 8, y: 3.6},
  gate: {x0: 11.9, x1: 12.3, z0: 6.4, z1: 8},
  board: {c: [22.86, 3.6 + 2.0, -0.5], w: 5.6, h: 3.1},
  declare: [21.6, 3.6 + 1.05, 3.2],
};

// Buttons on the console: [id, label, x offset along the desk].
export const BUTTONS = [
  ["r1", "1", 14.45], ["r2", "2", 15.1], ["r3", "3", 15.75], ["r4", "4", 16.4],
  ["next", "→", 17.05], ["undo", "↶", 17.7],
];
export const BUTTON_Y = 1.06, BUTTON_Z = -5.15;

// Collision boxes for a room's walls with door gaps. doors: {w: [z0,z1], e: [z0,z1]}.
function wallBoxes(r, doors) {
  const t = 0.3, out = [];
  const side = (x0, x1, z0, z1) => out.push({x0, z0, x1, z1});
  for (const [key, z0, z1] of [["n", r.z0 - t, r.z0], ["s", r.z1, r.z1 + t]]) {   // doors: [x0, x1]
    const d = doors[key];
    if (!d) { side(r.x0 - t, r.x1 + t, z0, z1); continue; }
    side(r.x0 - t, d[0], z0, z1); side(d[1], r.x1 + t, z0, z1);
  }
  for (const [key, x0, x1] of [["w", r.x0 - t, r.x0], ["e", r.x1, r.x1 + t]]) {   // doors: [z0, z1]
    const d = doors[key];
    if (!d) { side(x0, x1, r.z0, r.z1); continue; }
    side(x0, x1, r.z0, d[0]); side(x0, x1, d[1], r.z1);
  }
  return out;
}

export function collision(state) {
  const boxes = [
    ...wallBoxes(HUB, {w: [DOOR.z0, DOOR.z1], e: [DOOR.z0, DOOR.z1], s: [DOOR.z0, DOOR.z1]}),
    ...wallBoxes(SCR, {n: [DOOR.z0, DOOR.z1], w: DOOR4}),
    ...wallBoxes(VEST, {w: DOOR4, e: DOOR4}),
    ...wallBoxes(STAIR, {e: DOOR4}),
    {x0: STAIR.x0 + STAIR.wd, z0: STAIR.z0 + STAIR.wd, x1: STAIR.x1 - STAIR.wd, z1: STAIR.z1 - STAIR.wd},  // the well's rail
    {x0: -10.4, z0: 13.0, x1: -8.6, z1: 13.6},  // the vestibule's lectern
    {x0: DOOR.z0 - 0.3, z0: HUB.z1, x1: DOOR.z0, z1: SCR.z0}, {x0: DOOR.z1, z0: HUB.z1, x1: DOOR.z1 + 0.3, z1: SCR.z0},
    {x0: LECTERN.x0, z0: LECTERN.z0, x1: LECTERN.x1, z1: LECTERN.z1},
    ...wallBoxes(TRI, {e: [DOOR.z0, DOOR.z1]}),
    ...wallBoxes(MIU, {w: [DOOR.z0, DOOR.z1]}),
    // corridors
    {x0: TRI.x1, z0: DOOR.z0 - 0.3, x1: HUB.x0, z1: DOOR.z0}, {x0: TRI.x1, z0: DOOR.z1, x1: HUB.x0, z1: DOOR.z1 + 0.3},
    {x0: HUB.x1, z0: DOOR.z0 - 0.3, x1: MIU.x0, z1: DOOR.z0}, {x0: HUB.x1, z0: DOOR.z1, x1: MIU.x0, z1: DOOR.z1 + 0.3},
    // machine console
    {...MACHINE.console, x0: MACHINE.console.x0, x1: MACHINE.console.x1},
    // benches
    {x0: -3.85, z0: 2.6, x1: -3.35, z1: 4.2}, {x0: 3.35, z0: 2.6, x1: 3.85, z1: 4.2},
    {x0: TRIBAR.eye[0] + 0.3, z0: TRIBAR.eye[2] + 0.78, x1: TRIBAR.eye[0] + 1.9, z1: TRIBAR.eye[2] + 1.22},
    // ramp: its open side (always: on the ramp it is a rail, below it the ramp's body)
    {x0: MACHINE.ramp.x0, z0: MACHINE.ramp.z0 - 0.08, x1: MACHINE.ramp.x1, z1: MACHINE.ramp.z0},
    // the balcony's rail (only up there) and its underside edge at the ramp's top
    {x0: MACHINE.balcony.x0 - 0.08, z0: MACHINE.balcony.z0, x1: MACHINE.balcony.x0, z1: MACHINE.ramp.z0 - 0.08, when: (me) => me.y > 1},
    // the gate at the ramp's foot, while the machine room keeps it shut
    {...MACHINE.gate, when: () => !state.gateOpen},
  ];
  const r = MACHINE.ramp, b = MACHINE.balcony;
  // the stairs: three copies of the flights, a loop's height apart, so walking past the C landing
  // either way finds the next floor; the game wraps the walker's height back into 0..rise
  const R = STAIR.rise, ring = {x0: STAIR.x0, x1: STAIR.x1, z0: STAIR.z0, z1: STAIR.z1, only: true,
    inside: (x, z) => !inStairWell(x, z)};
  const floors = [
    {...ring, h: (x, z) => stairHeight(x, z)},
    {...ring, h: (x, z) => stairHeight(x, z) + R},
    {...ring, h: (x, z) => stairHeight(x, z) - R},
    {x0: r.x0 - 0.6, x1: r.x1, z0: r.z0, z1: r.z1, h: (x) => Math.max(0, (x - r.x0) / (r.x1 - r.x0)) * r.top},
    {x0: b.x0, x1: b.x1, z0: b.z0, z1: b.z1, h: () => b.y},
  ];
  return {boxes, floors};
}

// --------------------------------------------------------------------------- meshes
const C = {
  hubWall: [0.62, 0.58, 0.54], hubFloor: [0.30, 0.31, 0.34], hubCeil: [0.78, 0.76, 0.72], trim: [0.20, 0.19, 0.18],
  triWall: [0.20, 0.25, 0.33], triFloor: [0.42, 0.40, 0.38], triCeil: [0.16, 0.19, 0.25],
  miuWall: [0.16, 0.30, 0.30], miuFloor: [0.34, 0.31, 0.27], miuCeil: [0.12, 0.20, 0.21],
  scrWall: [0.30, 0.22, 0.30], scrFloor: [0.28, 0.27, 0.29], scrCeil: [0.17, 0.13, 0.18],
  brass: [0.72, 0.56, 0.26], dark: [0.10, 0.11, 0.12], wood: [0.42, 0.29, 0.18], rail: [0.70, 0.72, 0.74],
};

// One room's shell: floor, ceiling, walls with door openings (a lintel over each door).
function shell(m, r, colors, doors) {
  const {wall, floor, ceil} = colors;
  const mid = [(r.x0 + r.x1) / 2, r.h / 2, (r.z0 + r.z1) / 2];
  const q = (pts, col) => m.facing(pts, col, mid);
  q([[r.x0, 0, r.z1], [r.x1, 0, r.z1], [r.x1, 0, r.z0], [r.x0, 0, r.z0]], floor);
  q([[r.x0, r.h, r.z0], [r.x1, r.h, r.z0], [r.x1, r.h, r.z1], [r.x0, r.h, r.z1]], ceil);
  for (const [key, z, shade] of [["n", r.z0, 1], ["s", r.z1, 0.92]]) {
    const d = doors[key], col = wall.map((c) => c * shade);
    const side = (xa, xb, ya, yb) => q([[xa, ya, z], [xb, ya, z], [xb, yb, z], [xa, yb, z]], col);
    if (!d) { side(r.x0, r.x1, 0, r.h); continue; }
    side(r.x0, d[0], 0, r.h); side(d[1], r.x1, 0, r.h); side(d[0], d[1], DOOR.h, r.h);
  }
  for (const [key, x] of [["w", r.x0], ["e", r.x1]]) {
    const d = doors[key], col = wall.map((c) => c * 0.96);
    const side = (za, zb, ya, yb) => q([[x, ya, za], [x, ya, zb], [x, yb, zb], [x, yb, za]], col);
    if (!d) { side(r.z0, r.z1, 0, r.h); continue; }
    side(r.z0, d[0], 0, r.h); side(d[1], r.z1, 0, r.h); side(d[0], d[1], DOOR.h, r.h);
  }
  const s = 0.12;  // skirting
  const nd = doors.n, sd = doors.s;
  for (const [z0, z1, d] of [[r.z0, r.z0 + 0.03, nd], [r.z1 - 0.03, r.z1, sd]]) {
    if (!d) { m.box([r.x0, 0, z0], [r.x1, s, z1], C.trim); continue; }
    m.box([r.x0, 0, z0], [d[0], s, z1], C.trim); m.box([d[1], 0, z0], [r.x1, s, z1], C.trim);
  }
}

// A corridor running along z (x between the door's edges), from z0 to z1.
function corridorZ(m, z0, z1, colors) {
  const x0 = DOOR.z0, x1 = DOOR.z1, h = DOOR.h, mid = [0, h / 2, (z0 + z1) / 2];
  const q = (pts, col) => m.facing(pts, col, mid);
  q([[x0, 0, z0], [x1, 0, z0], [x1, 0, z1], [x0, 0, z1]], colors.floor);
  q([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], colors.ceil);
  q([[x0, 0, z0], [x0, 0, z1], [x0, h, z1], [x0, h, z0]], colors.wall);
  q([[x1, 0, z0], [x1, 0, z1], [x1, h, z1], [x1, h, z0]], colors.wall);
  for (const z of [z0, z1]) {
    m.box([x0 - 0.12, 0, z - 0.08], [x0, h + 0.12, z + 0.08], C.trim);
    m.box([x1, 0, z - 0.08], [x1 + 0.12, h + 0.12, z + 0.08], C.trim);
    m.box([x0 - 0.12, h, z - 0.08], [x1 + 0.12, h + 0.12, z + 0.08], C.trim);
  }
}

function corridor(m, x0, x1, colors) {
  const {z0, z1, h} = DOOR, mid = [(x0 + x1) / 2, h / 2, 0];
  const q = (pts, col) => m.facing(pts, col, mid);
  q([[x0, 0, z1], [x1, 0, z1], [x1, 0, z0], [x0, 0, z0]], colors.floor);
  q([[x0, h, z0], [x1, h, z0], [x1, h, z1], [x0, h, z1]], colors.ceil);
  q([[x1, 0, z0], [x0, 0, z0], [x0, h, z0], [x1, h, z0]], colors.wall);
  q([[x0, 0, z1], [x1, 0, z1], [x1, h, z1], [x0, h, z1]], colors.wall);
  for (const x of [x0, x1]) {
    m.box([x - 0.08, 0, z0 - 0.12], [x + 0.08, h + 0.12, z0], C.trim);
    m.box([x - 0.08, 0, z1], [x + 0.08, h + 0.12, z1 + 0.12], C.trim);
    m.box([x - 0.08, h, z0 - 0.12], [x + 0.08, h + 0.12, z1 + 0.12], C.trim);
  }
}

export function buildShells() {
  const m = new MeshBuilder();
  const hub = {wall: C.hubWall, floor: C.hubFloor, ceil: C.hubCeil};
  shell(m, HUB, hub, {w: [DOOR.z0, DOOR.z1], e: [DOOR.z0, DOOR.z1], s: [DOOR.z0, DOOR.z1]});
  shell(m, SCR, {wall: C.scrWall, floor: C.scrFloor, ceil: C.scrCeil}, {n: [DOOR.z0, DOOR.z1], w: DOOR4});
  shell(m, VEST, hub, {w: DOOR4, e: DOOR4});
  corridorZ(m, HUB.z1, SCR.z0, hub);
  shell(m, TRI, {wall: C.triWall, floor: C.triFloor, ceil: C.triCeil}, {e: [DOOR.z0, DOOR.z1]});
  shell(m, MIU, {wall: C.miuWall, floor: C.miuFloor, ceil: C.miuCeil}, {w: [DOOR.z0, DOOR.z1]});
  corridor(m, TRI.x1, HUB.x0, hub);
  corridor(m, HUB.x1, MIU.x0, hub);
  return m;
}

export function buildProps() {
  const m = new MeshBuilder();
  // benches: two in the hall, and one in the triangle room just behind the viewpoint, facing the sculpture
  const bench = (cx, cz, along) => {
    const [hx, hz] = along === "x" ? [0.8, 0.22] : [0.22, 0.8];
    m.box([cx - hx, 0.42, cz - hz], [cx + hx, 0.48, cz + hz], C.wood);
    for (const sx of [-1, 1]) {  // a leg at each end, across the seat
      if (along === "x") { const lx = cx + sx * (hx - 0.1); m.box([lx - 0.05, 0, cz - hz + 0.03], [lx + 0.05, 0.42, cz + hz - 0.03], C.dark); }
      else { const lz = cz + sx * (hz - 0.1); m.box([cx - hx + 0.03, 0, lz - 0.05], [cx + hx - 0.03, 0.42, lz + 0.05], C.dark); }
    }
  };
  bench(-3.6, 3.4, "z"); bench(3.6, 3.4, "z");
  bench(TRIBAR.eye[0] + 1.1, TRIBAR.eye[2] + 1.0, "x");
  // room 3: the screen's bezel, the lectern, the sealed door to the rooms still to come
  const sc = SCREEN;
  m.box([sc.c[0] - sc.w / 2 - 0.16, sc.c[1] - sc.h / 2 - 0.16, SCR.z1 - 0.14], [sc.c[0] + sc.w / 2 + 0.16, sc.c[1] + sc.h / 2 + 0.16, SCR.z1], C.dark);
  m.box([sc.c[0] - 0.5, 0, SCR.z1 - 0.5], [sc.c[0] + 0.5, sc.c[1] - sc.h / 2 - 0.16, SCR.z1 - 0.1], C.dark);
  const L = LECTERN;
  m.box([L.x0, 0, L.z0], [L.x1, L.h, L.z1], C.dark);
  m.box([L.x0 - 0.04, L.h, L.z0 - 0.04], [L.x1 + 0.04, L.h + 0.04, L.z1 + 0.04], C.brass);
  const sb = SENTENCE_BOARD;
  m.box([SCR.x1 - 0.1, sb.c[1] - sb.h / 2 - 0.12, sb.c[2] - sb.w / 2 - 0.12], [SCR.x1, sb.c[1] + sb.h / 2 + 0.12, sb.c[2] + sb.w / 2 + 0.12], C.brass);
  // machine console: a dark desk with a brass edge
  const k = MACHINE.console;
  m.box([k.x0, 0, k.z0], [k.x1, k.h, k.z1], C.dark);
  m.box([k.x0 - 0.05, k.h, k.z0 - 0.05], [k.x1 + 0.05, k.h + 0.04, k.z1 + 0.05], C.brass);
  // display frame
  const d = MACHINE.display;
  m.box([d.c[0] - d.w / 2 - 0.15, d.c[1] - d.h / 2 - 0.15, -8], [d.c[0] + d.w / 2 + 0.15, d.c[1] + d.h / 2 + 0.15, -7.9], C.brass);
  // ramp: a slab with a rail
  const r = MACHINE.ramp, b = MACHINE.balcony;
  const y = (x) => (x - r.x0) / (r.x1 - r.x0) * r.top;
  m.quad([r.x0, 0.01, r.z1], [r.x1, r.top, r.z1], [r.x1, r.top, r.z0], [r.x0, 0.01, r.z0], C.wood);   // walking surface
  m.quad([r.x1, r.top, r.z0], [r.x1, 0, r.z0], [r.x0, 0, r.z0], [r.x0, 0.01, r.z0], C.wood.map((c) => c * 0.7));  // side
  for (let x = r.x0 + 0.5; x <= r.x1; x += 1.15) m.box([x - 0.03, y(x), r.z0 - 0.06], [x + 0.03, y(x) + 1.0, r.z0], C.rail);
  // ramp handrail as a sloped thin quad strip
  m.quad([r.x0, 1.0, r.z0 - 0.07], [r.x1, r.top + 1.0, r.z0 - 0.07], [r.x1, r.top + 1.06, r.z0 - 0.07], [r.x0, 1.06, r.z0 - 0.07], C.rail);
  m.quad([r.x1, r.top + 1.0, r.z0 + 0.0], [r.x0, 1.0, r.z0 + 0.0], [r.x0, 1.06, r.z0 + 0.0], [r.x1, r.top + 1.06, r.z0 + 0.0], C.rail);
  // balcony: floor slab, underside, front face, rail
  m.box([b.x0, b.y - 0.25, b.z0], [b.x1, b.y, b.z1], {py: C.wood, ny: C.wood.map((c) => c * 0.5), px: C.wood, nx: C.wood.map((c) => c * 0.7), pz: C.wood, nz: C.wood});
  for (let z = b.z0 + 0.4; z < r.z0; z += 1.1) m.box([b.x0 - 0.06, b.y, z - 0.03], [b.x0, b.y + 1.0, z + 0.03], C.rail);
  m.box([b.x0 - 0.08, b.y + 1.0, b.z0], [b.x0 + 0.02, b.y + 1.06, r.z0], C.rail);
  // balcony posts down to the floor
  for (const z of [-6, -2, 2]) m.box([b.x0 + 0.05, 0, z - 0.1], [b.x0 + 0.25, b.y - 0.25, z + 0.1], C.wood.map((c) => c * 0.8));
  // declare pedestal on the balcony
  const dp = MACHINE.declare;
  m.box([dp[0] - 0.35, b.y, dp[2] - 0.35], [dp[0] + 0.35, dp[1] - 0.1, dp[2] + 0.35], C.dark);
  m.box([dp[0] - 0.4, dp[1] - 0.1, dp[2] - 0.4], [dp[0] + 0.4, dp[1] - 0.06, dp[2] + 0.4], C.brass);
  return m;
}

// The gate: two posts and a glowing bar across the ramp's foot (a separate mesh so it can go).
export function buildGate() {
  const m = new MeshBuilder(), g = MACHINE.gate;
  m.box([g.x0, 0, g.z0], [g.x1, 1.1, g.z0 + 0.12], C.brass);
  m.box([g.x0, 0, g.z1 - 0.12], [g.x1, 1.1, g.z1], C.brass);
  m.box([g.x0 + 0.1, 0.92, g.z0], [g.x1 - 0.1, 1.0, g.z1], [0.9, 0.3, 0.2]);
  m.box([g.x0 + 0.1, 0.52, g.z0], [g.x1 - 0.1, 0.6, g.z1], [0.9, 0.3, 0.2]);
  return m;
}

// Point lights: rows of [x, y, z, range, r, g, b, intensity]. The first two are fills.
export function lights() {
  return [
    [0, 3.8, 0, 14, 1.0, 0.95, 0.88, 0.9],
    [16, 6.8, 0, 18, 0.85, 1.0, 0.95, 0.8],
    [-16, 5.5, 0, 16, 0.85, 0.9, 1.0, 0.9],
    [-19.6, 5.4, -3.6, 8, 1.0, 0.9, 0.75, 1.2],
    [16, 2.4, -3.5, 6, 1.0, 0.85, 0.6, 0.9],
    [21.5, 6.6, 0, 7, 1.0, 0.95, 0.85, 0.9],
    [0, 3.0, -4.5, 6, 1.0, 0.9, 0.8, 0.6],
    [-12.2, 4.5, 5.4, 4, 1.0, 0.85, 0.5, 0.4],
    [0, 4.2, 15, 15, 1.0, 0.9, 1.0, 0.85],
    [5.6, 3.0, 15, 6, 1.0, 0.9, 0.7, 0.8],
  ];
}

// ---------------------------------------------------------------- the stairwell (Room 4)
const STONE = [0.62, 0.6, 0.58], LANDING = [0.5, 0.48, 0.47], RAIL = [0.72, 0.56, 0.26], NIGHT = [0.12, 0.11, 0.2];

// A bar of square section from p0 to p1 (a sloping handrail).
function bar(m, p0, p1, w, color) {
  const d = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]], L = Math.hypot(...d), t = d.map((v) => v / L);
  const a = Math.abs(t[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
  let u = [t[1] * a[2] - t[2] * a[1], t[2] * a[0] - t[0] * a[2], t[0] * a[1] - t[1] * a[0]];
  const ul = Math.hypot(...u); u = u.map((v) => v / ul * w / 2);
  const v = [t[1] * u[2] - t[2] * u[1], t[2] * u[0] - t[0] * u[2], t[0] * u[1] - t[1] * u[0]];
  const P = (p, su, sv) => [p[0] + u[0] * su + v[0] * sv, p[1] + u[1] * su + v[1] * sv, p[2] + u[2] * su + v[2] * sv];
  const c = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
  for (const [a1, b1, a2, b2] of [[1, 1, -1, 1], [-1, 1, -1, -1], [-1, -1, 1, -1], [1, -1, 1, 1]])
    m.facing([P(p0, a1, b1), P(p1, a1, b1), P(p1, a2, b2), P(p0, a2, b2)], color, [c[0] + (u[0] * (a1 + a2) + v[0] * (b1 + b2)) * 4, c[1] + (u[1] * (a1 + a2) + v[1] * (b1 + b2)) * 4, c[2] + (u[2] * (a1 + a2) + v[2] * (b1 + b2)) * 4]);
}

// The inner edge of a segment (beside the well), as a coordinate pair, or null for a corner landing.
function innerEdge(sg) {
  const {x0, x1, z0, z1, wd} = STAIR;
  if (sg.x[0] === x1 - wd && sg.z[0] >= z0 + wd - 1e-9 && sg.z[1] <= z1 - wd + 1e-9) return {fixed: "x", at: x1 - wd};
  if (sg.x[1] === x0 + wd && sg.z[0] >= z0 + wd - 1e-9 && sg.z[1] <= z1 - wd + 1e-9) return {fixed: "x", at: x0 + wd};
  if (sg.z[1] === z0 + wd && sg.x[0] >= x0 + wd - 1e-9 && sg.x[1] <= x1 - wd + 1e-9) return {fixed: "z", at: z0 + wd};
  if (sg.z[0] === z1 - wd && sg.x[0] >= x0 + wd - 1e-9 && sg.x[1] <= x1 - wd + 1e-9) return {fixed: "z", at: z1 - wd};
  return null;
}

// Every flight, landing and rail, once for each copy in `copies` (a loop's height apart), so the
// stairs seem to carry on forever above and below.
export function buildStairs(copies = [-2, -1, 0, 1, 2]) {
  const m = new MeshBuilder(), R = STAIR.rise, N = 5;
  for (const k of copies) {
    const dy = k * R;
    for (const sg of STAIR_SEGS) {
      if (sg.land) { m.box([sg.x[0], dy + sg.h - 0.3, sg.z[0]], [sg.x[1], dy + sg.h, sg.z[1]], LANDING); continue; }
      const [lo, hi] = sg[sg.along];
      for (let i = 0; i < N; i++) {
        const a = lo + (hi - lo) * i / N, b = lo + (hi - lo) * (i + 1) / N;
        const step = sg.dir > 0 ? i : N - 1 - i;
        const top = dy + sg.h0 + (sg.h1 - sg.h0) * (step + 1) / N;
        const lo3 = sg.along === "x" ? [a, top - 0.5, sg.z[0]] : [sg.x[0], top - 0.5, a];
        const hi3 = sg.along === "x" ? [b, top, sg.z[1]] : [sg.x[1], top, b];
        m.box(lo3, hi3, (step % 2) ? STONE : STONE.map((c) => c * 0.94));
      }
    }
    // rails beside the well: posts and a rail that follows the slope
    for (const sg of STAIR_SEGS) {
      const e = innerEdge(sg);
      if (!e) continue;
      const span = e.fixed === "x" ? sg.z : sg.x, inset = e.at === STAIR.x1 - STAIR.wd || e.at === STAIR.z1 - STAIR.wd ? -0.06 : 0.06;
      const at = (c) => (e.fixed === "x" ? [e.at + inset, 0, c] : [c, 0, e.at + inset]);
      const hAt = (c) => dy + (e.fixed === "x" ? stairHeight(e.at - inset * 2 + (inset > 0 ? -0.2 : 0.2), c) : stairHeight(c, e.at - inset * 2 + (inset > 0 ? -0.2 : 0.2)));
      const n = Math.max(1, Math.round((span[1] - span[0]) / 1.2));
      for (let i = 0; i <= n; i++) {
        const c = span[0] + (span[1] - span[0]) * i / n, p = at(c), h = hAt(c);
        m.box([p[0] - 0.03, h, p[2] - 0.03], [p[0] + 0.03, h + 1.0, p[2] + 0.03], RAIL);
      }
      const p0 = at(span[0]), p1 = at(span[1]);
      bar(m, [p0[0], hAt(span[0]) + 1.0, p0[2]], [p1[0], hAt(span[1]) + 1.0, p1[2]], 0.06, RAIL);
    }
  }
  return m;
}

// The stairwell's walls: tall and dark, from far below to far above, with the door from the vestibule.
export function buildStairShell() {
  const m = new MeshBuilder(), r = STAIR, lo = -12, hi = 14.5, [d0, d1] = DOOR4;
  const mid = [(r.x0 + r.x1) / 2, 0, (r.z0 + r.z1) / 2];
  const q = (pts, col) => m.facing(pts, col, mid);
  q([[r.x0, lo, r.z0], [r.x1, lo, r.z0], [r.x1, hi, r.z0], [r.x0, hi, r.z0]], NIGHT);
  q([[r.x0, lo, r.z1], [r.x1, lo, r.z1], [r.x1, hi, r.z1], [r.x0, hi, r.z1]], NIGHT.map((c) => c * 0.92));
  q([[r.x0, lo, r.z0], [r.x0, lo, r.z1], [r.x0, hi, r.z1], [r.x0, hi, r.z0]], NIGHT.map((c) => c * 0.96));
  const ex = r.x1, col = NIGHT.map((c) => c * 0.96);
  q([[ex, lo, r.z0], [ex, lo, d0], [ex, hi, d0], [ex, hi, r.z0]], col);
  q([[ex, lo, d1], [ex, lo, r.z1], [ex, hi, r.z1], [ex, hi, d1]], col);
  q([[ex, lo, d0], [ex, lo, d1], [ex, -0.3, d1], [ex, -0.3, d0]], col);
  q([[ex, DOOR.h, d0], [ex, DOOR.h, d1], [ex, hi, d1], [ex, hi, d0]], col);
  q([[r.x0, lo, r.z0], [r.x1, lo, r.z0], [r.x1, lo, r.z1], [r.x0, lo, r.z1]], [0.05, 0.05, 0.08]);
  q([[r.x0, hi, r.z0], [r.x1, hi, r.z0], [r.x1, hi, r.z1], [r.x0, hi, r.z1]], [0.05, 0.05, 0.08]);
  for (const x of [ex]) {  // the door's frame
    m.box([x - 0.08, 0, d0 - 0.12], [x + 0.08, DOOR.h + 0.12, d0], C.trim);
    m.box([x - 0.08, 0, d1], [x + 0.08, DOOR.h + 0.12, d1 + 0.12], C.trim);
    m.box([x - 0.08, DOOR.h, d0 - 0.12], [x + 0.08, DOOR.h + 0.12, d1 + 0.12], C.trim);
  }
  return m;
}

// Where each landing's key sign hangs (on the outer wall beside it), at that landing's height.
export function keySignSpots() {
  const {x0, x1, z0, z1, wd} = STAIR, [d0, d1] = DOOR4, out = [];
  for (const sg of STAIR_SEGS.filter((g) => g.land)) {
    const cx = (sg.x[0] + sg.x[1]) / 2, cz = (sg.z[0] + sg.z[1]) / 2, y = sg.h + 1.85;
    if (sg.key === 0) out.push({key: 0, c: [x1 - 0.02, DOOR.h + 0.75, (d0 + d1) / 2], n: [-1, 0, 0]});
    else if (sg.side === "n") out.push({key: sg.key, c: [cx, y, z0 + 0.02], n: [0, 0, 1]});
    else if (sg.side === "s") out.push({key: sg.key, c: [cx, y, z1 - 0.02], n: [0, 0, -1]});
    else if (sg.side === "w") out.push({key: sg.key, c: [x0 + 0.02, y, cz], n: [1, 0, 0]});
    else out.push({key: sg.key, c: [x1 - 0.02, y, cz], n: [-1, 0, 0]});
  }
  return out;
}

export function stairLights() {  // one over each landing
  return STAIR_SEGS.filter((g) => g.land).map((g) => [(g.x[0] + g.x[1]) / 2, g.h + 2.5, (g.z[0] + g.z[1]) / 2, 7, 1.0, 0.86, 0.62, 0.8]);
}
