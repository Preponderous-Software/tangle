// Plaques and screens, drawn on a canvas and handed to the engine as RGBA textures.
// Each spec is pure data (what to say); draw() turns it into pixels in the page.
import {countI} from "./miu.js";

export const INK = "#1d1f24", PAPER = "#efe9dd", TEAL = "#1f8f93", GOLD = "#c98a1f", RED = "#c0392b";
const SERIF = 'Georgia, "Times New Roman", serif', MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

function wrap(ctx, text, maxW) {
  const out = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const t = line ? line + " " + word : word;
      if (ctx.measureText(t).width > maxW && line) { out.push(line); line = word; } else line = t;
    }
    out.push(line);
  }
  return out;
}

// A plaque: {title, kicker?, body, w (m), h (m), dark?}. Returns {w, h, rgba} at ~200 px per metre.
export function plaque(doc, spec) {
  const W = Math.round(Math.min(1600, Math.max(760, spec.w * 230))), H = Math.round(W * spec.h / spec.w);
  const c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  const bg = spec.dark ? "#16191d" : PAPER, fg = spec.dark ? "#ece6da" : INK;
  const pad = W * 0.07;
  // Lay out at full size, then shrink everything until it fits the plaque.
  const layout = (k) => {
    const ops = []; let y = pad;
    if (spec.kicker) { ops.push(["kicker", spec.kicker.toUpperCase(), y + W * 0.03 * k]); y += W * 0.06 * k; }
    if (spec.title) {
      const size = W * (spec.titleSize || 0.075) * k;
      g.font = `700 ${Math.round(size)}px ${SERIF}`;
      for (const l of wrap(g, spec.title, W - 2 * pad)) { y += size * 1.05; ops.push(["title", l, y, size]); }
      y += W * 0.035 * k;
    }
    if (spec.body) {
      const size = W * (spec.bodySize || 0.038) * k;
      g.font = `400 ${Math.round(size)}px ${SERIF}`;
      for (const l of wrap(g, spec.body, W - 2 * pad)) { y += size * 1.42; ops.push(["body", l, y, size]); }
    }
    return {ops, bottom: y};
  };
  let k = 1, lay = layout(k);
  while (lay.bottom > H - pad * 0.8 && k > 0.4) { k *= 0.94; lay = layout(k); }
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  g.strokeStyle = spec.dark ? "#c9a24f" : INK; g.lineWidth = W * 0.006; g.strokeRect(W * 0.02, W * 0.02, W - W * 0.04, H - W * 0.04);
  for (const [kind, text, y, size] of lay.ops) {
    if (kind === "kicker") { g.fillStyle = spec.dark ? "#c9a24f" : "#6a6256"; g.font = `600 ${Math.round(W * 0.032 * k)}px ${MONO}`; }
    if (kind === "title") { g.fillStyle = fg; g.font = `700 ${Math.round(size)}px ${SERIF}`; }
    if (kind === "body") { g.fillStyle = fg; g.font = `400 ${Math.round(size)}px ${SERIF}`; }
    g.fillText(text, pad, y);
  }
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data, scale: k};
}

// The machine's display: the word, the spot the next rule 3/4 press acts on, and the goal.
export function display(doc, {word, spot, made, last, trail = []}) {
  const W = 1400, H = 408;
  const c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#0d1214"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#7fd0c9"; g.font = `600 30px ${MONO}`;
  g.fillText(`WORD  ·  ${made} different words so far`, 48, 64);
  g.textAlign = "right"; g.fillStyle = "#e6c46a"; g.fillText("GOAL: MU", W - 48, 64); g.textAlign = "left";
  const n = word.length, cell = Math.min(110, (W - 96) / Math.max(n, 1));
  g.font = `700 ${Math.round(cell * 1.25)}px ${MONO}`;
  const x0 = (W - cell * n) / 2, base = 240;
  for (let i = 0; i < n; i++) {
    const inSpot = spot && i >= spot.at && i < spot.at + spot.len;
    if (inSpot) { g.fillStyle = "rgba(230,196,106,0.25)"; g.fillRect(x0 + i * cell, base - cell * 1.05, cell, cell * 1.3); }
    g.fillStyle = word[i] === "I" ? "#ffffff" : word[i] === "U" ? "#9fe3dc" : "#e6c46a";
    g.textAlign = "center"; g.fillText(word[i], x0 + (i + 0.5) * cell, base);
  }
  // the last few steps, oldest first, then what the last press did
  g.textAlign = "left"; g.font = `400 30px ${MONO}`; g.fillStyle = "#5f9e98";
  let tr = trail.join("  →  ");
  while (g.measureText(tr).width > W * 0.5 && tr.includes("→")) tr = "…" + tr.slice(tr.indexOf("→") + 1);
  g.fillText(tr, 48, H - 40);
  if (last) { g.textAlign = "right"; g.fillStyle = /needs|nothing|too long|no III/.test(last) ? "#f08a6c" : "#7fd0c9"; g.fillText(last, W - 48, H - 40); }
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}

// The balcony board: every word made, coloured by its number of I's mod 3, and the reason.
export function board(doc, words) {
  const W = 1400, H = 776;
  const c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  g.strokeStyle = INK; g.lineWidth = 8; g.strokeRect(14, 14, W - 28, H - 28);
  g.fillStyle = "#6a6256"; g.font = `600 30px ${MONO}`; g.fillText("FROM OUTSIDE THE MACHINE", 70, 82);
  g.fillStyle = INK; g.font = `700 54px ${SERIF}`; g.fillText("Count the I's in every word you made", 70, 150);
  // the words, as chips
  g.font = `600 30px ${MONO}`;
  let x = 70, y = 200;
  const list = words.slice(-40);
  for (const wd of list) {
    const k = countI(wd) % 3, label = `${wd}  ${countI(wd)}`;
    const w = g.measureText(label).width + 28;
    if (x + w > W - 70) { x = 70; y += 50; }
    if (y > 410) break;
    g.fillStyle = k === 1 ? TEAL : k === 2 ? GOLD : RED;
    g.fillRect(x, y, w, 40);
    g.fillStyle = "#fff"; g.fillText(label, x + 14, y + 30);
    x += w + 12;
  }
  g.fillStyle = INK; g.font = `400 33px ${SERIF}`;
  const lines = [
    "Teal: 1, 4, 7, 10 … I's.   Gold: 2, 5, 8, 11 … I's.   Never 0, 3, 6, 9 …",
    "Why: you start with 1 I. Rules 1 and 4 don't change the count. Rule 3 takes away 3.",
    "Rule 2 doubles it: 1, 2, 4, 8, 16 … never lands on a multiple of 3, and taking 3 away can't help.",
    "MU has 0 I's, and 0 is a multiple of 3. So no amount of pressing will ever make MU.",
    "You can't see that by pressing buttons. You see it from out here, looking at the machine as a whole.",
  ];
  let yy = 500;
  g.font = `400 31px ${SERIF}`;
  for (const l of lines) { g.fillText(l, 70, yy); yy += 50; }
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}

export const PLAQUES = {
  hub: {kicker: "Welcome", title: "Tangle: a house of strange loops", w: 6.4, h: 3.3, bodySize: 0.036,
    body: "A strange loop is a path that keeps going forward, or upward, and still ends up back where it started. " +
      "The idea comes from the book Gödel, Escher, Bach by Douglas Hofstadter.\n" +
      "Each room here holds one kind of loop, as a puzzle. Start with the Triangle (left), then the Machine (right)."},
  soon: {kicker: "Coming soon", title: "More rooms", w: 2.1, h: 1.5, titleSize: 0.1, dark: true,
    body: "A screen that shows itself. A staircase that climbs forever. A list that can't hold everything.", bodySize: 0.075},
  gate: {title: "Closed for now", body: "It opens once you've given the machine a fair try.", w: 1.3, h: 0.62, titleSize: 0.11, bodySize: 0.07, dark: true},
  tri: {kicker: "The Triangle", title: "Find where it closes", w: 3.0, h: 2.0, bodySize: 0.043,
    body: "The artist M. C. Escher drew a triangle that cannot exist: three straight beams, each turning a right angle, " +
      "meeting in a loop.\nThe one in this room is real. From almost everywhere it looks broken. Find the one spot where it closes, " +
      "and look at it from there.\nListen: a tone rises as you get close."},
  rules: {kicker: "The Machine", title: "Turn MI into MU", w: 3.4, h: 2.4, bodySize: 0.039,
    body: "Change the word on the screen with the buttons on the desk:\n" +
      "1   If the word ends in I, add a U.   MI → MIU\n" +
      "2   Double everything after the M.   MIU → MIUIU\n" +
      "3   Replace III with U.   MIIII → MUI\n" +
      "4   Remove UU.   MUUI → MI\n" +
      "→   choose which spot rule 3 or 4 works on\n" +
      "↶   take back the last step"},
  declare: {title: "MU can't be made", body: "Press the red button to say so.", w: 0.85, h: 0.42, titleSize: 0.11, bodySize: 0.08, dark: true},
};

export function progressPlaque(solved) {
  const n = (solved.tribar ? 1 : 0) + (solved.miu ? 1 : 0);
  return {kicker: "Progress", title: `${n} of 2 rooms solved`, w: 2.1, h: 1.0, titleSize: 0.1,
    body: n === 2 ? "That's this part of the house, for now." : (solved.tribar ? "Next: the Machine, on the right." : "Start with the Triangle, on the left."),
    bodySize: 0.075, dark: true};
}

// The strip on the console's front edge: each button's symbol under it. xs: button x positions.
export function legend(doc, buttons, x0, width) {
  const W = 1400, H = 126;
  const c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#16191d"; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.fillStyle = "#e6c46a"; g.font = `700 76px ${MONO}`;
  for (const [, label, x] of buttons) g.fillText(label, (x - x0) / width * W, 92);
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}

export function doorPlaque(n, title, body, solved) {
  return {kicker: solved ? `Room ${n}  ·  solved ✓` : `Room ${n}`, title, body, w: 2.2, h: 1.0, titleSize: 0.12, bodySize: 0.07};
}

// The board before you've climbed up to it: no answers from the machine floor.
export function boardCover(doc) {
  const W = 1400, H = 776;
  const c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#1b2124"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#c9a24f"; g.lineWidth = 8; g.strokeRect(14, 14, W - 28, H - 28);
  g.fillStyle = "#c9a24f"; g.font = `600 34px ${MONO}`; g.textAlign = "center";
  g.fillText("FROM OUTSIDE THE MACHINE", W / 2, H / 2 - 20);
  g.fillStyle = "#9aa3a6"; g.font = `400 36px ${SERIF}`;
  g.fillText("Come up here and look.", W / 2, H / 2 + 40);
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}

// The hall's rug: "GÖDEL · ESCHER · BACH ·" running round a circle with no first or last word.
export function rug(doc) {
  const N = 1024, c = doc.createElement("canvas"); c.width = N; c.height = N;
  const g = c.getContext("2d"), m = N / 2;
  g.fillStyle = "#2a2f36"; g.fillRect(0, 0, N, N);
  g.fillStyle = "#3a2f2a"; g.beginPath(); g.arc(m, m, m - 4, 0, Math.PI * 2); g.fill();
  g.strokeStyle = "#c9a24f"; g.lineWidth = 6;
  for (const r of [m - 20, m - 120]) { g.beginPath(); g.arc(m, m, r, 0, Math.PI * 2); g.stroke(); }
  // the words, each letter turned to follow the circle
  const text = "GÖDEL · ESCHER · BACH · ".repeat(3);
  g.fillStyle = "#e8d5a8"; g.font = `700 46px ${SERIF}`; g.textAlign = "center"; g.textBaseline = "middle";
  const r = m - 70, step = (Math.PI * 2) / text.length;
  for (let i = 0; i < text.length; i++) {
    const a = i * step - Math.PI / 2;
    g.save(); g.translate(m + r * Math.cos(a), m + r * Math.sin(a)); g.rotate(a + Math.PI / 2); g.fillText(text[i], 0, 0); g.restore();
  }
  // in the middle, the triangle that closes
  g.strokeStyle = "#c9a24f"; g.lineWidth = 34; g.lineJoin = "round";
  const R = m * 0.42;
  g.beginPath();
  for (let k = 0; k <= 3; k++) { const a = -Math.PI / 2 + k * 2 * Math.PI / 3; g[k ? "lineTo" : "moveTo"](m + R * Math.cos(a), m + R * Math.sin(a)); }
  g.closePath(); g.stroke();
  return {w: N, h: N, rgba: g.getImageData(0, 0, N, N).data};
}
