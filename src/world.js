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
// Room 5: the List, down a corridor from the vestibule's south door. The librarian's list is on the
// far wall, the switches for your row on a desk in front of it, the question on the east wall.
export const LIST = {x0: -16, z0: 25, x1: -2, z1: 37, h: 5};
export const DOOR5 = [-10.2, -8.8];  // x range of the vestibule's south door and the corridor to the List
export const LIST_BOARD = {c: [-9, 2.75, 36.83], w: 6.0, h: 3.5};  // in front of its frame (36.86)
export const DESK = {x0: -11.5, x1: -5.7, z0: 33.6, z1: 34.4, h: 1.0};
export const SWITCH_Y = 1.06, SWITCH_Z = 34.0;
// [id, label, x]: tile 1 on the left as you face the list (+x), CHECK on the right
export const SWITCHES = [...Array.from({length: 8}, (_, i) => [`t${i}`, String(i + 1), -6.3 - 0.5 * i]), ["check", "CHECK", -10.9]];
export const QLECTERN = {x0: -2.95, x1: -2.3, z0: 29.8, z1: 32.2, h: 1.0};
export const QANSWER_X = -2.62;
export const QANSWERS_Z = {q_long: 30.45, q_endless: 31.0, q_none: 31.55};
export const QBOARD = {c: [-2.13, 2.35, 31.0], w: 3.8, h: 1.6};  // in front of its frame (-2.1)
// Room 6: the Prover, through the List's west door (sealed until the List is solved). The Prover's
// board on the far wall, the desk of cards in front of it, the questions on the left-hand wall.
export const PRV = {x0: -27.3, z0: 25, x1: -16.3, z1: 37, h: 5};
export const DOOR6 = [30.3, 31.7];   // z range of the door between the List and the Prover
export const PBOARD = {c: [-26.43, 3.05, 31.0], w: 6.4, h: 3.4};  // in front of its frame (on the cabinet)
export const PCAB = {x0: -27.3, x1: -26.5, z0: 27.2, z1: 34.8, h: 1.1};  // the Prover's cabinet, under its board
export const PDESK = {x0: -24.4, x1: -23.6, z0: 29.4, z1: 33.4, h: 1.0};
export const PKEY_X = -24.0, PKEY_Y = 1.06;
// [id, label, z]: facing the Prover (-x), card 12 is on the left (+z)
export const PKEYS = [["g12", "CARD 12", 32.9], ["g47", "CARD 47", 32.1], ["g81", "CARD 81", 31.3], ["gnum", "ITS NUMBER", 30.1]];
export const GLECTERN = {x0: -23.2, x1: -20.8, z0: 35.1, z1: 35.75, h: 1.0};  // out from the wall, so the board reads from the lectern
export const GANSWER_Z = 35.42;
export const GANSWERS_X = {ga: -21.45, gb: -22.0, gc: -22.55};   // facing the wall (+z), ga is on the left
export const GBOARD = {c: [-22.0, 2.35, 36.87], w: 3.8, h: 1.6};  // in front of its frame (36.9)
// The Prover's dressing: two memory drums either side of its board, and the card catalogue (a drawer
// for every numbered card) against the wall on your left as you come in.
export const PDRUMS = [[-26.72, 26.1], [-26.72, 35.9]], PDRUM_R = 0.42, PDRUM_H = 4.1;
export const PCATALOG = {x0: -25.7, x1: -21.9, z0: 25, z1: 25.55, h: 1.35};
// The cabinet's lamps, which blink while the Prover searches: [y, z] on its face.
export const PLAMPS = [0.28, 0.5].flatMap((y) => [27.7, 28.3, 28.9, 29.5, 32.5, 33.1, 33.7, 34.3].map((z) => [y, z]));

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
  display: {c: [16.5, 3.3, -7.86], w: 6.6, h: 2.0},   // clear of the rules plaque beside it
  rules: {c: [11.0, 2.4, -7.86], w: 3.4, h: 2.4},
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
    ...wallBoxes(VEST, {w: DOOR4, e: DOOR4, s: DOOR5}),
    ...wallBoxes(LIST, {n: DOOR5, w: DOOR6}),
    {x0: LIST.x0 - 0.3, z0: DOOR6[0], x1: LIST.x0 + 0.1, z1: DOOR6[1], when: () => !(state.solved && state.solved.list)},  // sealed until the List is solved
    ...wallBoxes(PRV, {e: DOOR6}),
    {x0: PCAB.x0, z0: PCAB.z0, x1: PCAB.x1, z1: PCAB.z1},
    ...PDRUMS.map(([x, z]) => ({x0: x - PDRUM_R, z0: z - PDRUM_R, x1: x + PDRUM_R, z1: z + PDRUM_R})),
    {x0: PCATALOG.x0, z0: PCATALOG.z0, x1: PCATALOG.x1, z1: PCATALOG.z1},
    {x0: PDESK.x0, z0: PDESK.z0, x1: PDESK.x1, z1: PDESK.z1},
    {x0: GLECTERN.x0, z0: GLECTERN.z0, x1: GLECTERN.x1, z1: GLECTERN.z1},
    {x0: DOOR5[0] - 0.3, z0: VEST.z1, x1: DOOR5[0], z1: LIST.z0}, {x0: DOOR5[1], z0: VEST.z1, x1: DOOR5[1] + 0.3, z1: LIST.z0},
    {x0: DESK.x0, z0: DESK.z0, x1: DESK.x1, z1: DESK.z1},
    {x0: QLECTERN.x0, z0: QLECTERN.z0, x1: QLECTERN.x1, z1: QLECTERN.z1},
    {x0: LIST.x0, z0: 25.6, x1: LIST.x0 + 0.45, z1: 29.4}, {x0: LIST.x0, z0: 32.6, x1: LIST.x0 + 0.45, z1: 36.4},  // shelves
    {x0: -15.4, z0: LIST.z0, x1: -11.0, z1: LIST.z0 + 0.45}, {x0: -7.9, z0: LIST.z0, x1: -2.6, z1: LIST.z0 + 0.45},
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
  // every doorway, for walk.doorAssist
  const D = [DOOR.z0, DOOR.z1], doors = [
    {axis: "x", at: HUB.x0, c0: D[0], c1: D[1]}, {axis: "x", at: TRI.x1, c0: D[0], c1: D[1]},
    {axis: "x", at: HUB.x1, c0: D[0], c1: D[1]}, {axis: "x", at: MIU.x0, c0: D[0], c1: D[1]},
    {axis: "z", at: HUB.z1, c0: D[0], c1: D[1]}, {axis: "z", at: SCR.z0, c0: D[0], c1: D[1]},
    {axis: "x", at: SCR.x0, c0: DOOR4[0], c1: DOOR4[1]}, {axis: "x", at: VEST.x1, c0: DOOR4[0], c1: DOOR4[1]},
    {axis: "x", at: VEST.x0, c0: DOOR4[0], c1: DOOR4[1]}, {axis: "x", at: STAIR.x1, c0: DOOR4[0], c1: DOOR4[1]},
    {axis: "z", at: VEST.z1, c0: DOOR5[0], c1: DOOR5[1]}, {axis: "z", at: LIST.z0, c0: DOOR5[0], c1: DOOR5[1]},
    {axis: "x", at: LIST.x0, c0: DOOR6[0], c1: DOOR6[1]}, {axis: "x", at: PRV.x1, c0: DOOR6[0], c1: DOOR6[1]},
  ];
  return {boxes, floors, doors};
}

// --------------------------------------------------------------------------- meshes
const C = {
  hubWall: [0.62, 0.58, 0.54], hubFloor: [0.30, 0.31, 0.34], hubCeil: [0.78, 0.76, 0.72], trim: [0.20, 0.19, 0.18],
  triWall: [0.20, 0.25, 0.33], triFloor: [0.42, 0.40, 0.38], triCeil: [0.16, 0.19, 0.25],
  miuWall: [0.16, 0.30, 0.30], miuFloor: [0.34, 0.31, 0.27], miuCeil: [0.12, 0.20, 0.21],
  prvWall: [0.25, 0.23, 0.31], prvFloor: [0.29, 0.27, 0.27], prvCeil: [0.13, 0.12, 0.17],
  listWall: [0.22, 0.27, 0.22], listFloor: [0.33, 0.26, 0.19], listCeil: [0.14, 0.16, 0.13],
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
function corridorZ(m, z0, z1, colors, x0 = DOOR.z0, x1 = DOOR.z1) {
  const h = DOOR.h, mid = [(x0 + x1) / 2, h / 2, (z0 + z1) / 2];
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

function corridor(m, x0, x1, colors, z0 = DOOR.z0, z1 = DOOR.z1, dy = 0) {
  const h = DOOR.h, mid = [(x0 + x1) / 2, h / 2, (z0 + z1) / 2];
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
  shell(m, VEST, hub, {w: DOOR4, e: DOOR4, s: DOOR5});
  corridorZ(m, HUB.z1, SCR.z0, hub);
  corridorZ(m, VEST.z1, LIST.z0, hub, DOOR5[0], DOOR5[1]);
  const list = {wall: C.listWall, floor: C.listFloor, ceil: C.listCeil};
  shell(m, LIST, list, {n: DOOR5, w: DOOR6});
  shell(m, PRV, {wall: C.prvWall, floor: C.prvFloor, ceil: C.prvCeil}, {e: DOOR6});
  corridor(m, PRV.x1, LIST.x0, list, DOOR6[0], DOOR6[1]);   // through the wall: the List to the Prover
  shell(m, TRI, {wall: C.triWall, floor: C.triFloor, ceil: C.triCeil}, {e: [DOOR.z0, DOOR.z1]});
  shell(m, MIU, {wall: C.miuWall, floor: C.miuFloor, ceil: C.miuCeil}, {w: [DOOR.z0, DOOR.z1]});
  corridor(m, TRI.x1, HUB.x0, hub);
  corridor(m, HUB.x1, MIU.x0, hub);
  corridor(m, SCR.x0 - 0.3, SCR.x0, hub, DOOR4[0], DOOR4[1]);   // through the wall: Room 3 to the vestibule
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
  const ex = r.x1, col = NIGHT.map((c) => c * 0.96), R = r.rise, K = [-2, -1, 0, 1, 2];
  q([[ex, lo, r.z0], [ex, lo, d0], [ex, hi, d0], [ex, hi, r.z0]], col);
  q([[ex, lo, d1], [ex, lo, r.z1], [ex, hi, r.z1], [ex, hi, d1]], col);
  // above the door strip: wall between the openings, one opening at each loop's C landing
  let y = lo;
  for (const k of K) {
    q([[ex, y, d0], [ex, y, d1], [ex, k * R, d1], [ex, k * R, d0]], col);
    y = k * R + DOOR.h;
  }
  q([[ex, y, d0], [ex, y, d1], [ex, hi, d1], [ex, hi, d0]], col);
  q([[r.x0, lo, r.z0], [r.x1, lo, r.z0], [r.x1, lo, r.z1], [r.x0, lo, r.z1]], [0.05, 0.05, 0.08]);
  q([[r.x0, hi, r.z0], [r.x1, hi, r.z0], [r.x1, hi, r.z1], [r.x0, hi, r.z1]], [0.05, 0.05, 0.08]);
  const hub = {wall: C.hubWall, floor: C.hubFloor, ceil: C.hubCeil};
  for (const k of K) {
    const dy = k * R, x = ex;
    m.box([x - 0.08, dy, d0 - 0.12], [x + 0.08, dy + DOOR.h + 0.12, d0], C.trim);   // the door's frame
    m.box([x - 0.08, dy, d1], [x + 0.08, dy + DOOR.h + 0.12, d1 + 0.12], C.trim);
    m.box([x - 0.08, dy + DOOR.h, d0 - 0.12], [x + 0.08, dy + DOOR.h + 0.12, d1 + 0.12], C.trim);
    // through the wall, and (for the other loops) the same small room behind the door: the stairs
    // promise the same door every time round, so every loop has one
    const m2 = new MeshBuilder();
    corridor(m2, ex, VEST.x0, hub, d0, d1);
    if (k !== 0) {
      shell(m2, VEST, hub, {w: DOOR4});
      m2.box([-10.4, 0, 13.0], [-8.6, 1.0, 13.6], C.dark);
    }
    for (let i = 1; i < m2.positions.length; i += 3) m2.positions[i] += dy;
    m.append(m2);
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

// ------------------------------------------------------------------- the List (Room 5)
// The desk of switches, the frames of the list and the question board, the question's lectern,
// shelves of books (it's a library) and the sealed door to the last room.
export function buildList() {
  const m = new MeshBuilder(), L = LIST;
  const k = DESK;
  m.box([k.x0, 0, k.z0], [k.x1, k.h, k.z1], C.dark);
  m.box([k.x0 - 0.05, k.h, k.z0 - 0.05], [k.x1 + 0.05, k.h + 0.04, k.z1 + 0.05], C.brass);
  const b = LIST_BOARD;
  m.box([b.c[0] - b.w / 2 - 0.16, b.c[1] - b.h / 2 - 0.16, L.z1 - 0.14], [b.c[0] + b.w / 2 + 0.16, b.c[1] + b.h / 2 + 0.16, L.z1], C.brass);
  const q = QLECTERN;
  m.box([q.x0, 0, q.z0], [q.x1, q.h, q.z1], C.dark);
  m.box([q.x0 - 0.04, q.h, q.z0 - 0.04], [q.x1 + 0.04, q.h + 0.04, q.z1 + 0.04], C.brass);
  const qb = QBOARD;
  m.box([L.x1 - 0.1, qb.c[1] - qb.h / 2 - 0.12, qb.c[2] - qb.w / 2 - 0.12], [L.x1, qb.c[1] + qb.h / 2 + 0.12, qb.c[2] + qb.w / 2 + 0.12], C.brass);
  // shelves: a dark case with rows of books, along the walls (x0..x1 along `along`, against a wall)
  let seed = 11;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const BOOKS = [[0.45, 0.16, 0.12], [0.16, 0.28, 0.42], [0.2, 0.36, 0.24], [0.55, 0.42, 0.2], [0.32, 0.18, 0.34], [0.62, 0.58, 0.5]];
  const shelf = (a0, a1, wall, along, depth) => {
    const H = 2.6, rows = 5, box = (u0, u1, y0, y1, d0, d1, col) => {
      if (along === "z") m.box([wall + Math.min(d0, d1), y0, u0], [wall + Math.max(d0, d1), y1, u1], col);
      else m.box([u0, y0, wall + Math.min(d0, d1)], [u1, y1, wall + Math.max(d0, d1)], col);
    };
    box(a0, a1, 0, H, 0, depth * 0.15, C.wood.map((c) => c * 0.6));  // back
    for (let r = 0; r <= rows; r++) box(a0, a1, r * H / rows, r * H / rows + 0.04, 0, depth, C.wood);
    for (const a of [a0, a1]) box(a - 0.03, a + 0.03, 0, H, 0, depth, C.wood);
    for (let r = 0; r < rows; r++) {
      let u = a0 + 0.06;
      while (u < a1 - 0.1) {
        const w = 0.04 + rnd() * 0.05, h = (H / rows) * (0.62 + rnd() * 0.3);
        if (u + w > a1 - 0.06) break;
        box(u, u + w, r * H / rows + 0.04, r * H / rows + 0.04 + h, depth * 0.15, depth * (0.75 + rnd() * 0.2), BOOKS[Math.floor(rnd() * BOOKS.length)]);
        u += w + 0.005 + (rnd() < 0.08 ? 0.12 : 0);
      }
    }
  };
  shelf(25.6, 29.4, L.x0, "z", 0.42); shelf(32.6, 36.4, L.x0, "z", 0.42);
  shelf(-15.4, -11.0, L.z0, "x", 0.42); shelf(-7.9, -2.6, L.z0, "x", 0.42);
  return m;
}

// The sealed door to the Prover, in the List's west doorway (drawn until the List is solved).
export function buildSealedDoor() {
  const m = new MeshBuilder();
  m.box([LIST.x0 - 0.1, 0, DOOR6[0]], [LIST.x0 + 0.06, DOOR.h, DOOR6[1]], [0.13, 0.13, 0.15]);
  return m;
}

// Room 6: the Prover's cabinet and board frame, the desk of cards, the lectern and its board's frame.
export function buildProver() {
  const m = new MeshBuilder(), c = PCAB, b = PBOARD, k = PDESK, q = GLECTERN, g = GBOARD;
  m.box([c.x0, 0, c.z0], [c.x1, c.h, c.z1], C.dark);
  m.box([c.x0, c.h, c.z0 - 0.04], [c.x1 + 0.04, c.h + 0.05, c.z1 + 0.04], C.brass);
  m.box([c.x1 - 0.02, 0.62, 30.4], [c.x1 + 0.01, 0.7, 31.6], [0.9, 0.75, 0.35]);  // the card slot
  m.box([PRV.x0, b.c[1] - b.h / 2 - 0.16, b.c[2] - b.w / 2 - 0.16], [b.c[0] - 0.03, b.c[1] + b.h / 2 + 0.16, b.c[2] + b.w / 2 + 0.16], C.brass);
  m.box([PRV.x0, b.c[1] - b.h / 2 - 0.1, b.c[2] - b.w / 2 - 0.1], [b.c[0] - 0.02, b.c[1] + b.h / 2 + 0.1, b.c[2] + b.w / 2 + 0.1], C.dark);
  m.box([k.x0, 0, k.z0], [k.x1, k.h, k.z1], C.dark);
  m.box([k.x0 - 0.05, k.h, k.z0 - 0.05], [k.x1 + 0.05, k.h + 0.04, k.z1 + 0.05], C.brass);
  m.box([q.x0, 0, q.z0], [q.x1, q.h, q.z1], C.dark);
  m.box([q.x0 - 0.04, q.h, q.z0 - 0.04], [q.x1 + 0.04, q.h + 0.04, q.z1 + 0.04], C.brass);
  m.box([g.c[0] - g.w / 2 - 0.12, g.c[1] - g.h / 2 - 0.12, PRV.z1 - 0.1], [g.c[0] + g.w / 2 + 0.12, g.c[1] + g.h / 2 + 0.12, PRV.z1], C.brass);
  // the cabinet's face: a recessed panel of lamp sockets either side of the slot
  for (const [z0, z1] of [[27.4, 30.0], [32.0, 34.6]]) m.box([c.x1, 0.14, z0], [c.x1 + 0.02, 0.64, z1], [0.06, 0.06, 0.07]);
  // memory drums: tall dark cylinders with brass bands, wired to the board
  for (const [x, z] of PDRUMS) {
    m.box([x - 0.5, 0, z - 0.5], [x + 0.5, 0.12, z + 0.5], C.dark);
    m.cylinder([x, 0.12, z], PDRUM_R, PDRUM_H - 0.12, [0.15, 0.15, 0.19], 24);
    for (const y of [0.5, 1.4, 2.3, 3.2, PDRUM_H - 0.12]) m.cylinder([x, y, z], PDRUM_R + 0.025, 0.07, C.brass, 24);
    const toward = z < b.c[2] ? 1 : -1, edge = b.c[2] + toward * -(b.w / 2 + 0.16);
    m.box([x - 0.05, 3.7, Math.min(z, edge)], [x + 0.05, 3.8, Math.max(z, edge)], C.brass);  // a cable into the board
  }
  // the card catalogue: a drawer for every numbered card
  const k2 = PCATALOG, cols = 7, rowsN = 4, dw = (k2.x1 - k2.x0 - 0.1) / cols, dh = (k2.h - 0.14) / rowsN;
  m.box([k2.x0, 0, k2.z0], [k2.x1, k2.h, k2.z1], C.wood.map((v) => v * 0.7));
  m.box([k2.x0 - 0.03, k2.h, k2.z0], [k2.x1 + 0.03, k2.h + 0.04, k2.z1 + 0.03], C.brass);
  for (let i = 0; i < cols; i++) for (let j = 0; j < rowsN; j++) {
    const x0 = k2.x0 + 0.05 + i * dw, y0 = 0.08 + j * dh;
    m.box([x0 + 0.02, y0 + 0.02, k2.z1], [x0 + dw - 0.02, y0 + dh - 0.02, k2.z1 + 0.02], C.wood);
    m.box([x0 + dw / 2 - 0.06, y0 + dh * 0.45, k2.z1 + 0.02], [x0 + dw / 2 + 0.06, y0 + dh * 0.45 + 0.03, k2.z1 + 0.045], C.brass);
    m.box([x0 + dw / 2 - 0.08, y0 + dh * 0.62, k2.z1 + 0.02], [x0 + dw / 2 + 0.08, y0 + dh * 0.62 + 0.06, k2.z1 + 0.025], [0.9, 0.86, 0.76]);  // its label
  }
  // a few cards waiting on top of the catalogue
  for (let i = 0; i < 4; i++) m.box([k2.x0 + 0.4 + i * 0.07, k2.h + 0.04 + i * 0.012, k2.z0 + 0.12 + i * 0.03], [k2.x0 + 0.75 + i * 0.07, k2.h + 0.052 + i * 0.012, k2.z0 + 0.36 + i * 0.03], [0.93, 0.9, 0.82]);
  // a runner from the door to the desk
  m.box([k.x1 + 0.3, 0, 30.45], [PRV.x1 - 0.05, 0.012, 31.55], [0.32, 0.12, 0.1]);
  // pendant lamps over the desk and the lectern
  for (const [x, z, y] of [[-24.0, 31.0, 3.95], [-22.0, 34.6, 3.5]]) {
    m.box([x - 0.015, y + 0.18, z - 0.015], [x + 0.015, PRV.h, z + 0.015], C.dark);
    m.cylinder([x, y, z], 0.28, 0.2, C.brass, 20);
  }
  return m;
}
// solved: a warm light on the board, now that card 81 is known to be true
export function proverLights(solved = false) {
  const L = [[-21.8, 4.4, 31, 14, 0.85, 0.85, 1.0, 0.8], [-24.0, 3.7, 31, 6, 1.0, 0.9, 0.7, 0.75], [-22, 3.3, 34.6, 5, 1.0, 0.9, 0.75, 0.6]];
  if (solved) L.push([-25.2, 3.0, 31, 7, 1.0, 0.8, 0.45, 0.9]);
  return L;
}

export function listLights() {
  return [[-9, 4.4, 30, 14, 1.0, 0.92, 0.8, 0.85], [-9, 3.4, 34.5, 6, 1.0, 0.88, 0.65, 0.8], [-3.5, 3.2, 31, 5, 1.0, 0.9, 0.75, 0.6]];
}
