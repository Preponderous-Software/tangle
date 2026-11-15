import test from "node:test";
import assert from "node:assert/strict";
import {buildTribar} from "../src/tribar.js";
import {v3} from "../src/geom.js";
import {moves, countI, reachable, spots} from "../src/miu.js";
import {step, spawn, resolve, floorAt, lookDir} from "../src/walk.js";

const eye = [-11, 1.62, 4.5], centre = [-18.5, 2.4, -2.5];

// Screen direction of a point seen from the eye (unit vector).
const dirFrom = (p) => v3.norm(v3.sub(p, eye));

test("tribar: the two free ends line up exactly from the eye", () => {
  const t = buildTribar({eye, centre});
  const a = dirFrom(t.toWorld(t.ends.aFree)), c = dirFrom(t.toWorld(t.ends.cFree));
  assert.ok(v3.len(v3.sub(a, c)) < 1e-9, "ends should be on one line of sight");
  // ...and they really are apart in space
  assert.ok(v3.len(v3.sub(t.toWorld(t.ends.aFree), t.toWorld(t.ends.cFree))) > 1.0);
});

test("tribar: from a metre to the side the ends separate", () => {
  const t = buildTribar({eye, centre});
  const side = [eye[0] + 1, eye[1], eye[2]];
  const d = (p) => v3.norm(v3.sub(p, side));
  const gap = v3.len(v3.sub(d(t.toWorld(t.ends.aFree)), d(t.toWorld(t.ends.cFree))));
  assert.ok(gap > 0.01, `gap ${gap}`);  // about 1 degree per metre at 10 m: a forgiving sweet spot
});

test("tribar: the mesh is well formed", () => {
  const {mesh} = buildTribar({eye, centre});
  assert.equal(mesh.positions.length % 3, 0);
  assert.equal(mesh.indices.length % 3, 0);
  assert.ok(mesh.indices.every((i) => i < mesh.count));
  assert.ok(mesh.positions.every(Number.isFinite));
  for (let i = 0; i < mesh.normals.length; i += 3)  // Strata refuses a mesh with any zero-length normal
    assert.ok(Math.hypot(mesh.normals[i], mesh.normals[i + 1], mesh.normals[i + 2]) > 0.5, `normal ${i / 3}`);
});

test("miu: the four rules", () => {
  const r = (s) => moves(s).map((m) => `${m.rule}:${m.result}`).sort();
  assert.deepEqual(r("MI"), ["1:MIU", "2:MII"]);
  assert.deepEqual(r("MIIII").filter((x) => x[0] === "3"), ["3:MIU", "3:MUI"]);
  assert.deepEqual(r("MUUI").filter((x) => x[0] === "4"), ["4:MI"]);
  assert.equal(spots("MIIII", 3).length, 2);
});

test("miu: no reachable string has a multiple of 3 I's, so MU is unreachable", () => {
  const all = reachable(7, 12);
  assert.ok(all.size > 40);
  for (const s of all) assert.notEqual(countI(s) % 3, 0, s);
  assert.ok(!all.has("MU"));
});

const room = {boxes: [{x0: -5, z0: -5.2, x1: 5, z1: -5}, {x0: 2, z0: -1, x1: 3, z1: 1, when: (me) => me.gate}],
  floors: [{x0: 0, z0: 2, x1: 4, z1: 3, h: (x) => x * 0.5}]};

test("walk: eased start, never auto-turns, slides on walls", () => {
  let me = spawn(0, 0, Math.PI / 2);  // looking along -z
  me = step(me, {forward: 1, right: 0}, 0.1, room);
  const v1 = Math.hypot(me.vx, me.vz);
  me = step(me, {forward: 1, right: 0}, 0.5, room);
  assert.ok(v1 < Math.hypot(me.vx, me.vz), "speeds up gradually");
  for (let i = 0; i < 100; i++) me = step(me, {forward: 1, right: 0.3}, 0.05, room);
  assert.ok(me.z > -5 - 1e-9 + 0.29, "stays out of the wall");
  assert.equal(me.yaw, Math.PI / 2);
  const d = lookDir(Math.PI / 2, 0);
  assert.ok(Math.abs(d[2] + 1) < 1e-9);
});

test("walk: conditional boxes and ramps", () => {
  assert.equal(resolve(room, {gate: false}, 2.5, 0).x, 2.5);
  assert.notEqual(resolve(room, {gate: true}, 2.5, 0).x, 2.5);
  assert.equal(floorAt(room, 0.4, 2.5, 0), 0.2);
  assert.equal(floorAt(room, 3.8, 2.5, 0), 0, "too high a step from the ground");
});
