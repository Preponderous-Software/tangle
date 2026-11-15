// The impossible triangle as a real object that closes from exactly one eye point.
//
// 1. Build it near-orthographically: bar A along x, B along y, C along z, an open path whose two free
//    ends are offset exactly along d = (1,1,1)/sqrt(3). Looking down d, both ends land on one spot.
//    Bar C passes in front of bar A there, so C is cut by the prism of A's silhouette (planes that
//    contain d), with exact polygon clipping. The cut walls are edge-on from along d.
// 2. Place it in the world so that d points from the sculpture's centre T at the eye point E.
// 3. Warp every vertex along its own line of sight from E: P' = E + (Q - E) * depth(P) / D, where Q is
//    P projected along d onto the plane through T. From E, P' looks exactly where Q looks, so the
//    perspective image from E is the orthographic image; depth order is kept, so occlusion is too.
//    The map is projective: flat faces stay flat. From anywhere else the sculpture is visibly broken
//    and tapered, like real forced-perspective tribar sculptures.
import {v3, MeshBuilder} from "./geom.js";

const D_LOCAL = v3.norm([1, 1, 1]);

function hull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const turn = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], hi = [];
  for (const p of pts) { while (lo.length >= 2 && turn(lo[lo.length - 2], lo[lo.length - 1], p) <= 1e-12) lo.pop(); lo.push(p); }
  for (const p of pts.slice().reverse()) { while (hi.length >= 2 && turn(hi[hi.length - 2], hi[hi.length - 1], p) <= 1e-12) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));  // counter-clockwise
}

// Keep the left side of a->b (or the right, keepLeft=false). Sutherland-Hodgman.
function clip2(poly, a, b, keepLeft) {
  const side = (q) => { const s = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]); return keepLeft ? s : -s; };
  const out = [];
  for (let k = 0; k < poly.length; k++) {
    const P = poly[k], Q = poly[(k + 1) % poly.length], sp = side(P), sq = side(Q);
    if (sp >= 0) out.push(P);
    if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([P[0] + t * (Q[0] - P[0]), P[1] + t * (Q[1] - P[1])]); }
  }
  return out;
}

function clip3(poly, n, c) {
  const out = [];
  for (let k = 0; k < poly.length; k++) {
    const P = poly[k], Q = poly[(k + 1) % poly.length], sp = v3.dot(n, P) - c, sq = v3.dot(n, Q) - c;
    if (sp >= 0) out.push(P);
    if ((sp >= 0) !== (sq >= 0)) out.push(v3.add(P, v3.mul(v3.sub(Q, P), sp / (sp - sq))));
  }
  return out;
}

const signedArea = (p) => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0);

// Local, orthographic construction. Returns {polys: [{pts, color, both}], target, ends}.
export function buildLocal({L = 2.4, w = 0.4, color = [0.82, 0.66, 0.46]} = {}) {
  const d = D_LOCAL, u = v3.norm(v3.cross([0, 1, 0], d)), v = v3.cross(d, u);
  const proj = (p) => [v3.dot(p, u), v3.dot(p, v)];
  const polys = [];
  const boxPolys = (lo, hi, skip = []) => {
    const m = new MeshBuilder(); m.box(lo, hi, color, skip);
    for (let i = 0; i < m.indices.length; i += 6) {
      const ids = [m.indices[i], m.indices[i + 1], m.indices[i + 2], m.indices[i + 5]];
      polys.push({pts: ids.map((j) => m.positions.slice(3 * j, 3 * j + 3)), color});
    }
  };
  boxPolys([0, 0, 0], [L, w, w]);                          // A along x
  boxPolys([L - w, w, 0], [L, L, w], ["ny"]);              // B along y
  boxPolys([L - w, L - w, 0], [L, L, w], ["pz", "ny"]);    // B/C corner block

  const corners = [];
  for (const x of [0, L]) for (const y of [0, w]) for (const z of [0, w]) corners.push(proj([x, y, z]));
  const hex = hull(corners);
  const lift = (q, n, c) => {
    const base = v3.add(v3.mul(u, q[0]), v3.mul(v, q[1]));
    return v3.add(base, v3.mul(d, (c - v3.dot(n, base)) / v3.dot(n, d)));
  };
  const [x0, y0, z0, x1, y1, z1] = [L - w, L - w, w, L, L, L];
  const faces = [
    [[1, 0, 0], [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]]],
    [[-1, 0, 0], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]]],
    [[0, 1, 0], [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]]],
    [[0, -1, 0], [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]]],
    [[0, 0, 1], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]],
  ];
  const emit = (poly2, n, c) => {
    if (poly2.length < 3 || Math.abs(signedArea(poly2)) < 1e-10) return;
    let pts = poly2.map((q) => lift(q, n, c));
    const nn = v3.cross(v3.sub(pts[1], pts[0]), v3.sub(pts[2], pts[0]));
    if (v3.dot(nn, n) < 0) pts = pts.reverse();
    polys.push({pts, color});
  };
  for (const [n, quad] of faces) {
    const c = v3.dot(n, quad[0]);
    let rest = quad.map(proj);
    if (signedArea(rest) < 0) rest = rest.reverse();
    for (let k = 0; k < hex.length && rest.length >= 3; k++) {
      const A = hex[k], B = hex[(k + 1) % hex.length];
      emit(clip2(rest, A, B, false), n, c);   // the piece outside edge k
      rest = clip2(rest, A, B, true);
    }
  }
  // The cut walls: for each hexagon edge, the plane through it and d, inside C and within the edge's span.
  const c8 = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) c8.push([x, y, z]);
  const edges = [];
  for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++)
    if ([0, 1, 2].filter((k) => c8[i][k] !== c8[j][k]).length === 1) edges.push([i, j]);
  for (let k = 0; k < hex.length; k++) {
    const A = hex[k], B = hex[(k + 1) % hex.length];
    const a3 = v3.add(v3.mul(u, A[0]), v3.mul(v, A[1])), b3 = v3.add(v3.mul(u, B[0]), v3.mul(v, B[1]));
    const e3 = v3.norm(v3.sub(b3, a3)), n = v3.norm(v3.cross(d, e3)), c0 = v3.dot(n, a3);
    let pts = [];
    for (const [i, j] of edges) {
      const fi = v3.dot(n, c8[i]) - c0, fj = v3.dot(n, c8[j]) - c0;
      if ((fi < 0) !== (fj < 0)) pts.push(v3.add(c8[i], v3.mul(v3.sub(c8[j], c8[i]), fi / (fi - fj))));
    }
    if (pts.length < 3) continue;
    const cen = v3.mul(pts.reduce((s, p) => v3.add(s, p), [0, 0, 0]), 1 / pts.length);
    const ax = v3.norm(v3.sub(pts[0], cen)), ay = v3.cross(n, ax);
    pts.sort((p, q) => Math.atan2(v3.dot(v3.sub(p, cen), ay), v3.dot(v3.sub(p, cen), ax)) -
                       Math.atan2(v3.dot(v3.sub(q, cen), ay), v3.dot(v3.sub(q, cen), ax)));
    pts = clip3(pts, e3, v3.dot(e3, a3));
    pts = clip3(pts, v3.mul(e3, -1), -v3.dot(e3, b3));
    if (pts.length >= 3) polys.push({pts, color: color.map((x) => x * 0.8), both: true});
  }
  // Centre on the silhouette's middle (so the eye looks at the middle of the picture).
  const all = [];
  for (const p of polys) for (const q of p.pts) all.push(q);
  const pu = all.map((q) => v3.dot(q, u)), pv = all.map((q) => v3.dot(q, v)), pd = all.map((q) => v3.dot(q, d));
  const mid = (a) => (Math.min(...a) + Math.max(...a)) / 2;
  const target = v3.add(v3.add(v3.mul(u, mid(pu)), v3.mul(v, mid(pv))), v3.mul(d, mid(pd)));
  return {polys, target, frame: {u, v, d}, ends: {aFree: [w / 2, w / 2, w / 2], cFree: [L - w / 2, L - w / 2, L - w / 2]}};
}

// Place and warp. eye: E (world), centre: T (world). Returns {mesh, toWorld}.
export function buildTribar({eye, centre, roll = 0, ...opts}) {
  const loc = buildLocal(opts);
  const {u, v, d} = loc.frame;
  const w = v3.norm(v3.sub(eye, centre)), D = v3.len(v3.sub(eye, centre));
  let r = v3.norm(v3.cross([0, 1, 0], w)), up = v3.cross(w, r);
  if (roll) {
    const c = Math.cos(roll), s = Math.sin(roll);
    [r, up] = [v3.add(v3.mul(r, c), v3.mul(up, s)), v3.add(v3.mul(up, c), v3.mul(r, -s))];
  }
  const place = (p) => {   // rigid: local (u, v, d) about the target -> world (r, up, w) about the centre
    const q = v3.sub(p, loc.target);
    return v3.add(centre, v3.add(v3.add(v3.mul(r, v3.dot(q, u)), v3.mul(up, v3.dot(q, v))), v3.mul(w, v3.dot(q, d))));
  };
  const warp = (P) => {
    const along = v3.dot(v3.sub(P, centre), w);
    const Q = v3.sub(P, v3.mul(w, along));
    return v3.add(eye, v3.mul(v3.sub(Q, eye), (D - along) / D));
  };
  const toWorld = (p) => warp(place(p));
  const mesh = new MeshBuilder();
  for (const p of loc.polys) {
    const pts = p.pts.map(toWorld);
    mesh.poly(pts, p.color);
    if (p.both) mesh.poly(pts.slice().reverse(), p.color);
  }
  return {mesh, toWorld, ends: loc.ends};
}
