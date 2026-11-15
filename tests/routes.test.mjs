// Walk the house's real routes with the real collision: every place the game needs is reachable.
import test from "node:test";
import assert from "node:assert/strict";
import * as Walk from "../src/walk.js";
import * as World from "../src/world.js";

// Turn toward each waypoint (a test harness may steer; the game never turns the camera itself).
function walk(me, points, world, limit = 60) {
  let t = 0;
  for (const [x, z] of points) {
    while (Math.hypot(me.x - x, me.z - z) > 0.25 && t < limit) {
      me.yaw = Math.atan2(-(z - me.z), -(x - me.x));
      me = Walk.step(me, {forward: 1, right: 0}, 1 / 30, world);
      t += 1 / 30;
    }
  }
  return me;
}

test("hub to the triangle's viewpoint", () => {
  const w = World.collision({gateOpen: false});
  const me = walk(Walk.spawn(0, 4.2, Math.PI / 2), [[0, 0], [-7.5, 0], [-10.5, 0], World.TRIBAR.eye.filter((_, i) => i !== 1)], w);
  assert.ok(Math.hypot(me.x - World.TRIBAR.eye[0], me.z - World.TRIBAR.eye[2]) < 0.3);
});

test("hub to the console; the gate keeps you off the ramp until it opens", () => {
  const state = {gateOpen: false};
  const w = World.collision(state);
  let me = walk(Walk.spawn(0, 4.2, Math.PI / 2), [[0, 0], [7.5, 0], [11, 0], [16, -4.1]], w);
  assert.ok(Math.hypot(me.x - 16, me.z + 4.1) < 0.3, "at the console");
  me = walk(me, [[11, 4], [11.2, 7.2], [18.5, 7.2]], w, 30);
  assert.ok(me.y < 0.1 && me.x < 12.2, `stopped by the gate (x ${me.x.toFixed(2)}, y ${me.y.toFixed(2)})`);
  state.gateOpen = true;
  me = walk(me, [[18.5, 7.2], [20.5, 7.0], [21, 0]], w, 40);
  assert.ok(Math.abs(me.y - World.MACHINE.balcony.y) < 0.01, `on the balcony (y ${me.y})`);
  assert.ok(Math.hypot(me.x - 21, me.z) < 0.3);
});

test("the balcony rail stops a walk off the edge", () => {
  const w = World.collision({gateOpen: true});
  let me = {...Walk.spawn(21, 0, 0), y: World.MACHINE.balcony.y};
  me = walk(me, [[15, 0]], w, 5);
  assert.ok(me.x > World.MACHINE.balcony.x0 && Math.abs(me.y - 3.6) < 0.01);
});

test("hub to the Screen room: the big screen and the lectern", () => {
  const w = World.collision({gateOpen: false});
  let me = walk(Walk.spawn(0, 2, -Math.PI / 2), [[0, 5.5], [0, 9.5], [0, 20.5]], w);
  assert.ok(Math.hypot(me.x, me.z - 20.5) < 0.3, `in front of the screen (at ${me.x.toFixed(2)}, ${me.z.toFixed(2)})`);
  me = walk(me, [[5.6, 15]], w);
  assert.ok(Math.hypot(me.x - 5.6, me.z - 15) < 0.3, "at the lectern");
});

// The game wraps the walker's height into 0..rise on the stairs and counts the loops.
function wrapStairs(me) {
  const R = World.STAIR.rise;
  if (me.x < World.STAIR.x1 + 0.01 && me.z > World.STAIR.z0 && me.y >= R - 1e-6) { me.y -= R; me.loops = (me.loops || 0) + 1; }
  if (me.x < World.STAIR.x1 + 0.01 && me.z > World.STAIR.z0 && me.y < -1e-6) { me.y += R; me.loops = (me.loops || 0) - 1; }
  return me;
}
function walkStairs(me, points, world, limit = 120) {
  let t = 0, highest = 0;
  for (const [x, z] of points) {
    while (Math.hypot(me.x - x, me.z - z) > 0.25 && t < limit) {
      me.yaw = Math.atan2(-(z - me.z), -(x - me.x));
      me = wrapStairs({...Walk.step(me, {forward: 1, right: 0}, 1 / 30, world), loops: me.loops});
      highest = Math.max(highest, (me.loops || 0) * World.STAIR.rise + me.y);
      t += 1 / 30;
    }
  }
  return {me, highest};
}

test("the staircase climbs forever: once round, you are back at the C landing, a loop higher", () => {
  const w = World.collision({gateOpen: false});
  let me = walk(Walk.spawn(0, 2, -Math.PI / 2), [[0, 5.5], [0, 9.5], [-2, 16], [-7.5, 16], [-9.5, 16], [-11.9, 16]], w);
  assert.ok(Math.hypot(me.x + 11.9, me.z - 16) < 0.3, `on the C landing (at ${me.x.toFixed(2)}, ${me.z.toFixed(2)})`);
  const path = [[-11.9, 13], [-11.9, 10.9], [-17, 10.9], [-22.1, 10.9], [-22.1, 16], [-22.1, 21.1], [-17, 21.1], [-11.9, 21.1], [-11.9, 16]];
  const up = walkStairs({...me, loops: 0}, path, w);
  assert.equal(up.me.loops, 1, "one loop climbed");
  assert.ok(Math.abs(up.me.y) < 0.05, `back at the C landing's height (y ${up.me.y})`);
  assert.ok(up.highest > 4.7, `climbed the whole rise (${up.highest.toFixed(2)})`);
  const down = walkStairs(up.me, path.slice(0, -1).reverse().concat([[-11.9, 16]]), w);
  assert.equal(down.me.loops, 0, "and back down again");
});

test("the vestibule to the List: the desk of switches and the question's lectern", () => {
  const w = World.collision({gateOpen: false});
  let me = walk(Walk.spawn(-9.5, 16, -Math.PI / 2), [[-9.5, 19], [-9.5, 24], [-9.5, 27], [-8.6, 32.7]], w);
  assert.ok(Math.hypot(me.x + 8.6, me.z - 32.7) < 0.3, `at the desk (at ${me.x.toFixed(2)}, ${me.z.toFixed(2)})`);
  for (const [, , x] of World.SWITCHES) {
    const d = Math.hypot(x - me.x, World.SWITCH_Y - (me.y + Walk.EYE), World.SWITCH_Z - me.z);
    assert.ok(d < 3.1, `switch at x ${x} within reach (${d.toFixed(2)} m)`);
  }
  me = walk(me, [[-4.4, 31]], w);
  assert.ok(Math.hypot(me.x + 4.4, me.z - 31) < 0.3, "at the question's lectern");
  me = walk(me, [[-9, 35.5]], w, 10);
  assert.ok(me.z < World.DESK.z0, "the desk stops a walk through it");
});

test("walking into a doorway off-centre slides you through instead of pinning you on the frame", () => {
  const w = World.collision({gateOpen: false});
  // aim straight east at the Machine door, 1.15 m off its middle (into the frame's corner)
  for (const z of [1.15, -1.15, 1.4]) {
    let me = Walk.spawn(3.5, z, Math.PI);  // yaw PI looks along +x
    for (let i = 0; i < 90; i++) me = Walk.step(me, {forward: 1, right: 0}, 1 / 30, w);
    assert.ok(me.x > 7, `through the door from z ${z} (at ${me.x.toFixed(2)}, ${me.z.toFixed(2)})`);
  }
  // the List corridor, 0.55 m off its middle
  let me = Walk.spawn(-9.5 + 0.55, 18, -Math.PI / 2);
  for (let i = 0; i < 120; i++) me = Walk.step(me, {forward: 1, right: 0}, 1 / 30, w);
  assert.ok(me.z > 22, `into the corridor (at ${me.x.toFixed(2)}, ${me.z.toFixed(2)})`);
});

test("the List to the Prover: sealed until the List is solved, then the desk of cards and the lectern", () => {
  const sealed = World.collision({gateOpen: true, solved: {list: false}});
  let me = walk(Walk.spawn(-13.5, 31, 0), [[-20, 31]], sealed, 8);
  assert.ok(me.x > World.LIST.x0, `the sealed door stops you (at ${me.x.toFixed(2)})`);
  const w = World.collision({gateOpen: true, solved: {list: true}});
  me = walk(Walk.spawn(-13.5, 31, 0), [[-17, 31], [-22.9, 31.2]], w);
  assert.ok(Math.hypot(me.x + 22.9, me.z - 31.2) < 0.3, `at the desk (at ${me.x.toFixed(2)}, ${me.z.toFixed(2)})`);
  for (const [, , z] of World.PKEYS) {
    const d = Math.hypot(World.PKEY_X - me.x, World.PKEY_Y - (me.y + Walk.EYE), z - me.z);
    assert.ok(d < 3.1, `card button at z ${z} within reach (${d.toFixed(2)} m)`);
  }
  me = walk(me, [[-22, 34.4]], w);
  assert.ok(Math.hypot(me.x + 22, me.z - 34.4) < 0.3, "at the questions' lectern");
  me = walk(me, [[-25, 31]], w, 10);
  assert.ok(me.x > World.PDESK.x1 - 0.01 || me.z > World.PDESK.z1, "the desk stops a walk through it");
});
