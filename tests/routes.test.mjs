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
