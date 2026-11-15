// First-person walking: eased velocity, sliding along walls, floors at several heights (ramps, a
// balcony). Pure: no DOM, no engine, so node tests run it. The yaw convention is the Strata web
// kit's orbit convention: the walker looks along (-cos yaw, -sin yaw) on the floor, pitch > 0
// looks down.

export const EYE = 1.62, RADIUS = 0.3, WALK = 2.6, RUN = 4.8, ACCEL = 9, DAMP = 12, STEP = 0.35;

// world: {boxes: [{x0, z0, x1, z1, when?(me)}], floors: [{x0, z0, x1, z1, h(x, z), only?}]}
// A box is solid while its `when` (if any) says so. The ground (height 0) is a floor everywhere,
// except where a floor marked `only` covers the point (a staircase whose flights go below 0).
// The highest floor within a step of fromY wins; if none is within reach, the walker stays put.
export function floorAt(world, x, z, fromY) {
  let best = -Infinity, ground = true;
  for (const f of world.floors) {
    if (x < f.x0 || x > f.x1 || z < f.z0 || z > f.z1) continue;
    if (f.only && (!f.inside || f.inside(x, z))) ground = false;
    if (f.inside && !f.inside(x, z)) continue;
    const h = f.h(x, z);
    if (h <= fromY + STEP && h > best) best = h;
  }
  if (ground && 0 <= fromY + STEP && 0 > best) best = 0;
  return best === -Infinity ? fromY : best;
}

export function resolve(world, me, x, z) {
  for (let pass = 0; pass < 3; pass++) {
    for (const b of world.boxes) {
      if (b.when && !b.when(me)) continue;
      const cx = Math.min(Math.max(x, b.x0), b.x1), cz = Math.min(Math.max(z, b.z0), b.z1);
      const dx = x - cx, dz = z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= RADIUS * RADIUS) continue;
      if (d2 > 1e-12) {
        const d = Math.sqrt(d2), push = (RADIUS - d) / d;
        x += dx * push; z += dz * push;
      } else {  // centre inside the box: out through the nearest side
        const opts = [[b.x0 - RADIUS - x, 0], [b.x1 + RADIUS - x, 0], [0, b.z0 - RADIUS - z], [0, b.z1 + RADIUS - z]];
        opts.sort((a, c) => Math.abs(a[0] + a[1]) - Math.abs(c[0] + c[1]));
        x += opts[0][0]; z += opts[0][1];
      }
    }
  }
  return {x, z};
}

// Doorways ease you through: walking into one near its edge (where a door frame's corner would
// stop you dead) adds a sideways drift toward the middle. door: {axis: "x" | "z" (the coordinate
// fixed along the doorway's line), at, c0, c1 (its span on the other coordinate), when?()}.
export function doorAssist(doors, x, z, vx, vz) {
  for (const d of doors || []) {
    if (d.when && !d.when()) continue;                                // a closed door eases no one through
    const [along, side, va] = d.axis === "x" ? [x, z, vx] : [z, x, vz];
    const dist = d.at - along;
    if (Math.abs(dist) > 1.0 || va * Math.sign(dist) < 0.3) continue;   // near the doorway, heading into it
    const lo = d.c0 + RADIUS + 0.06, hi = d.c1 - RADIUS - 0.06;
    if (side >= lo && side <= hi) continue;                           // already clear of the frame
    if (side < d.c0 - 0.7 || side > d.c1 + 0.7) continue;              // walking at the wall, not the door
    const push = Math.sign((lo + hi) / 2 - side) * Math.min(1.6, Math.abs(va) * 0.9);
    return d.axis === "x" ? [vx, vz + push] : [vx + push, vz];
  }
  return [vx, vz];
}

// input: {forward, right in -1..1, run}. Returns the new walker; never touches yaw or pitch.
export function step(me, input, dt, world) {
  const f = [-Math.cos(me.yaw), -Math.sin(me.yaw)], r = [Math.sin(me.yaw), -Math.cos(me.yaw)];
  let ix = f[0] * input.forward + r[0] * input.right, iz = f[1] * input.forward + r[1] * input.right;
  const m = Math.hypot(ix, iz);
  if (m > 1) { ix /= m; iz /= m; }
  const speed = input.run ? RUN : WALK;
  const want = [ix * speed, iz * speed];
  const out = {...me};
  let t = dt;
  while (t > 1e-6) {
    const h = Math.min(t, 0.03); t -= h;
    const k = 1 - Math.exp(-(m > 0.01 ? ACCEL : DAMP) * h);
    out.vx += (want[0] - out.vx) * k; out.vz += (want[1] - out.vz) * k;
    if (Math.hypot(out.vx, out.vz) < 0.02 && m < 0.01) { out.vx = 0; out.vz = 0; }
    const [ax, az] = m > 0.01 ? doorAssist(world.doors, out.x, out.z, out.vx, out.vz) : [out.vx, out.vz];
    const p = resolve(world, out, out.x + ax * h, out.z + az * h);
    const y = floorAt(world, p.x, p.z, out.y);
    out.x = p.x; out.z = p.z; out.y = y;
  }
  return out;
}

export function spawn(x, z, yaw, pitch = 0) { return {x, z, y: 0, yaw, pitch, vx: 0, vz: 0}; }

// The look direction for a yaw and pitch (world space).
export function lookDir(yaw, pitch) {
  const cp = Math.cos(pitch);
  return [-cp * Math.cos(yaw), -Math.sin(pitch), -cp * Math.sin(yaw)];
}

// A joystick offset in CSS pixels -> {forward, right, run}.
export function stick(dx, dy, radius) {
  const m = Math.hypot(dx, dy), dead = 0.12 * radius;
  if (m < dead) return {forward: 0, right: 0, run: false};
  const k = Math.min((m - dead) / (radius - dead), 1) / m;
  return {forward: -dy * k, right: dx * k, run: m > radius * 0.95};
}
