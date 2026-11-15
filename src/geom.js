// Mesh building in plain arrays, in the shape the hall engine's hall_mesh takes:
// {positions, normals, colors, uvs, indices}. No DOM, no engine.

export const v3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, s) => [a[0] * s, a[1] * s, a[2] * s],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  len: (a) => Math.hypot(a[0], a[1], a[2]),
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
};

export class MeshBuilder {
  constructor() { this.positions = []; this.normals = []; this.colors = []; this.uvs = []; this.indices = []; }

  get count() { return this.positions.length / 3; }

  // Another builder's geometry, added to this one (untextured meshes only).
  append(o) {
    const base = this.count;
    this.positions.push(...o.positions); this.normals.push(...o.normals); this.colors.push(...o.colors);
    for (const i of o.indices) this.indices.push(i + base);
  }

  vert(p, n, c, uv) {
    this.positions.push(p[0], p[1], p[2]);
    this.normals.push(n[0], n[1], n[2]);
    this.colors.push(c[0], c[1], c[2]);
    if (uv) this.uvs.push(uv[0], uv[1]);
    return this.count - 1;
  }

  // A flat polygon (convex, counter-clockwise seen from the front), fan-triangulated.
  // Newell's normal is robust for slivers; a polygon with no area at all is skipped (Strata
  // refuses a mesh with a zero-length normal).
  poly(pts, color, normal) {
    let n = normal;
    if (!n) {
      let x = 0, y = 0, z = 0;
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]);
      }
      if (Math.hypot(x, y, z) < 1e-12) return;
      n = v3.norm([x, y, z]);
    }
    const idx = pts.map((p) => this.vert(p, n, color));
    for (let k = 1; k + 1 < idx.length; k++) this.indices.push(idx[0], idx[k], idx[k + 1]);
  }

  quad(a, b, c, d, color) { this.poly([a, b, c, d], color); }

  // A flat polygon turned to face the point `toward` (for room walls seen from inside).
  facing(pts, color, toward) {
    const n = v3.cross(v3.sub(pts[1], pts[0]), v3.sub(pts[2], pts[0]));
    this.poly(v3.dot(n, v3.sub(toward, pts[0])) < 0 ? pts.slice().reverse() : pts, color);
  }

  // An axis-aligned box. color: [r,g,b] or {px,nx,py,ny,pz,nz: [r,g,b]}; skip: face names.
  box(lo, hi, color, skip = []) {
    const [x0, y0, z0] = lo, [x1, y1, z1] = hi;
    const f = {
      px: [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]],
      nx: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]],
      py: [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]],
      ny: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]],
      pz: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]],
      nz: [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]],
    };
    for (const k of Object.keys(f)) {
      if (skip.includes(k)) continue;
      this.poly(f[k], Array.isArray(color) ? color : color[k]);
    }
  }

  // A textured rectangle facing `normal`, centred at c, w wide and h tall (up = world y unless given).
  panel(c, normal, w, h, up = [0, 1, 0]) {
    const n = v3.norm(normal), r = v3.norm(v3.cross(up, n)), u = v3.cross(n, r);
    const hw = w / 2, hh = h / 2;
    const P = (sx, sy) => v3.add(c, v3.add(v3.mul(r, sx * hw), v3.mul(u, sy * hh)));
    const i = [
      this.vert(P(-1, -1), n, [1, 1, 1], [0, 1]), this.vert(P(1, -1), n, [1, 1, 1], [1, 1]),
      this.vert(P(1, 1), n, [1, 1, 1], [1, 0]), this.vert(P(-1, 1), n, [1, 1, 1], [0, 0]),
    ];
    this.indices.push(i[0], i[1], i[2], i[0], i[2], i[3]);
  }

  cylinder(base, radius, height, color, seg = 16) {
    const ring = (y) => Array.from({length: seg}, (_, s) => {
      const a = 2 * Math.PI * s / seg;
      return [base[0] + radius * Math.cos(a), y, base[2] + radius * Math.sin(a)];
    });
    const lo = ring(base[1]), hi = ring(base[1] + height);
    for (let s = 0; s < seg; s++) {
      const t = (s + 1) % seg;
      this.poly([lo[t], lo[s], hi[s], hi[t]], color);
    }
    this.poly(hi.slice().reverse(), color, [0, 1, 0]);
  }
}
