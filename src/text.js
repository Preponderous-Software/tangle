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
      "Each room here holds one kind of loop, as a puzzle. Start with the Triangle (left), then the Machine (right), then the Screen (behind you), and the Staircase and the List beyond it."},
  soon: {kicker: "Coming soon", title: "The last room", w: 2.1, h: 1.5, titleSize: 0.1, dark: true,
    body: "A sentence that says it can't be proved.", bodySize: 0.08},
  list: {kicker: "The List", title: "Find a row that isn't there", w: 2.6, h: 2.4, bodySize: 0.046,
    body: "The librarian says this list holds every endless row of light and dark tiles. It goes on forever, row after row, and each row goes on forever too.\n" +
      "Set the switches on the desk to start a row, and press CHECK. Can you make a row that is certainly nowhere in the list?"},
  stair: {kicker: "The Staircase", title: "Climb to the top", w: 2.2, h: 2.2, bodySize: 0.05,
    body: "Bach wrote a canon that rises a whole tone every time it repeats. These stairs do the same: " +
      "each flight is one key higher, C, D, E, F\u266f, G\u266f, A\u266f.\nGo through the door, climb, and find the top. Then come back here."},
  scr: {kicker: "The Screen", title: "A picture of itself", w: 3.0, h: 2.0, bodySize: 0.043,
    body: "The big screen shows exactly what you see, turned a little.\nWalk up to it and look straight at it. What does a screen show when it is showing itself?\n" +
      "Then try the sentences on the board by the lectern, halfway along the room: each one talks about itself."},
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
  const n = ["tribar", "miu", "scr", "stair", "list"].filter((k) => solved[k]).length;
  return {kicker: "Progress", title: `${n} of 5 rooms solved`, w: 2.1, h: 1.0, titleSize: 0.1,
    body: n === 5 ? "That's this part of the house, for now." : !solved.tribar ? "Start with the Triangle, on the left." : !solved.miu ? "Next: the Machine, on the right." : !solved.scr ? "Next: the Screen, behind you." : !solved.stair ? "Next: the Staircase, beyond the Screen." : "Next: the List, beyond the Screen.",
    bodySize: 0.075, dark: true};
}

// The strip on the console's front edge: each button's symbol under it. xs: button x positions.
export function legend(doc, buttons, x0, width, size = 76) {
  const W = 1400, H = 126;
  const c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#16191d"; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.fillStyle = "#e6c46a"; g.font = `700 ${size}px ${MONO}`;
  for (const [, label, x] of buttons) g.fillText(label, (x - x0) / width * W, 63 + size * 0.38);
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

// The lectern's board: one sentence about itself at a time, and what the last answer showed.
export function sentenceBoard(doc, {locked, index, total, sentence, message, good}) {
  const W = 1400, H = Math.round(1400 * 1.6 / 3.8);
  const c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#151a1d"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#c9a24f"; g.font = `600 30px ${MONO}`;
  g.fillText(locked ? "SENTENCES ABOUT THEMSELVES" : `SENTENCES ABOUT THEMSELVES  ·  ${Math.min(index + 1, total)} of ${total}`, 50, 62);
  if (locked) {
    g.fillStyle = "#9aa3a6"; g.font = `400 46px ${SERIF}`;
    g.fillText("Look at yourself in the big screen first.", 50, 220);
    return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
  }
  g.fillStyle = "#f1ece2"; g.font = `700 64px ${SERIF}`;
  let y = 170;
  for (const l of wrap(g, `\u201c${sentence}\u201d`, W - 100)) { g.fillText(l, 50, y); y += 74; }
  g.font = `400 34px ${SERIF}`; g.fillStyle = "#9aa3a6";
  g.fillText("Is it true or false? Press the answer on the lectern.", 50, y + 6);
  if (message) {
    g.font = `600 36px ${SERIF}`; g.fillStyle = good ? "#7fd0a0" : "#f0a080";
    let yy = H - 40 - 46 * (wrap(g, message, W - 100).length - 1);
    for (const l of wrap(g, message, W - 100)) { g.fillText(l, 50, yy); yy += 46; }
  }
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}

// A landing's key sign: the note name, large.
export function keySign(doc, name) {
  const W = 512, H = 512, c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#15131f"; g.fillRect(0, 0, W, H);
  g.strokeStyle = "#c9a24f"; g.lineWidth = 10; g.strokeRect(14, 14, W - 28, H - 28);
  g.fillStyle = "#e8d5a8"; g.textAlign = "center"; g.textBaseline = "middle";
  g.font = `700 ${name.length > 1 ? 230 : 280}px ${SERIF}`; g.fillText(name, W / 2, H / 2 - 20);
  g.fillStyle = "#c9a24f"; g.font = `600 34px ${MONO}`; g.fillText("LANDING", W / 2, H - 70);
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}

// The vestibule's question board.
export function topBoard(doc, {locked, message, good, solved}) {
  const W = 1400, H = 560, c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#151a1d"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#c9a24f"; g.font = `600 30px ${MONO}`; g.fillText("OUTSIDE THE STAIRS", 50, 62);
  g.fillStyle = "#f1ece2"; g.font = `700 70px ${SERIF}`; g.fillText("Where is the top of the staircase?", 50, 170);
  g.font = `400 36px ${SERIF}`; g.fillStyle = "#9aa3a6";
  g.fillText(locked ? "Climb the stairs first: go all the way round, past A\u266f." : solved ? "Solved." : "Press your answer on the lectern.", 50, 240);
  if (message) {
    g.font = `600 38px ${SERIF}`; g.fillStyle = good ? "#7fd0a0" : "#f0a080";
    let y = H - 40 - 48 * (wrap(g, message, W - 100).length - 1);
    for (const l of wrap(g, message, W - 100)) { g.fillText(l, 50, y); y += 48; }
  }
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}

// Room 5: the librarian's list. rows: the shown corner (N rows of N tiles); guess: your switches;
// diffs: where each row first differs from your last checked row (or null); diag: light the
// diagonal; later: {row, tiles} for a row further down that starts like yours; escaped: you won.
export function listBoard(doc, {rows, guess, diffs, diag, later, escaped, message, good, round}) {
  const W = 1400, H = Math.round(1400 * 3.5 / 6.0), N = rows.length;
  const c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#151a17"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#c9a24f"; g.font = `600 28px ${MONO}`;
  g.fillText(round ? "THE LIBRARIAN'S LIST  ·  NOW WITH YOUR ROW ADDED AT THE TOP" : "THE LIBRARIAN'S LIST", 46, 52);
  g.fillStyle = "#f1ece2"; g.font = `700 40px ${SERIF}`;
  g.fillText("Every endless row of light and dark tiles is in here.", 46, 104);
  const T = 42, gap = 8, X0 = 210, Y0 = 170, RH = T + 8;
  const tile = (x, y, b, ring) => {
    g.fillStyle = b ? "#efe6cf" : "#2b2f33"; g.fillRect(x, y, T, T);
    g.strokeStyle = "#596057"; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, T - 2, T - 2);
    if (ring) { g.strokeStyle = ring; g.lineWidth = 6; g.strokeRect(x - 3, y - 3, T + 6, T + 6); }
  };
  g.font = `600 24px ${MONO}`; g.fillStyle = "#8d968c"; g.textAlign = "center";
  for (let i = 0; i < N; i++) g.fillText(`${i + 1}`, X0 + i * (T + gap) + T / 2, Y0 - 14);
  g.textAlign = "left"; g.fillText("tile", X0 - 92, Y0 - 14);
  for (let r = 0; r < N; r++) {
    const y = Y0 + r * RH;
    g.fillStyle = round && r === 0 ? "#e6c46a" : "#b7bdb2"; g.font = `600 28px ${MONO}`;
    g.fillText(`row ${r + 1}`, 46, y + 32);
    for (let i = 0; i < N; i++) {
      const ring = diffs && diffs[r] === i ? "#e0634a" : diag && i === r ? "#e6c46a" : null;
      tile(X0 + i * (T + gap), y, rows[r][i], ring);
    }
    g.fillStyle = "#8d968c"; g.font = `700 32px ${SERIF}`; g.fillText("…", X0 + N * (T + gap) + 4, y + 32);
    if (diffs) {
      g.font = `600 26px ${MONO}`;
      if (diffs[r] < 0) { g.fillStyle = "#f0a080"; g.fillText("the same as yours", X0 + N * (T + gap) + 56, y + 31); }
      else { g.fillStyle = "#7fd0a0"; g.fillText(`differs at tile ${diffs[r] + 1}`, X0 + N * (T + gap) + 56, y + 31); }
    }
  }
  let y = Y0 + N * RH;
  g.fillStyle = "#8d968c"; g.font = `700 34px ${SERIF}`; g.fillText("⋮", 70, y + 30);
  g.font = `400 26px ${SERIF}`; g.fillText("and on forever", 110, y + 28);
  if (later) {
    y += 42;
    g.fillStyle = "#f0a080"; g.font = `600 28px ${MONO}`; g.fillText(`row ${later.row}`, 46, y + 32);
    later.tiles.forEach((b, i) => tile(X0 + i * (T + gap), y, b, null));
    g.fillStyle = "#8d968c"; g.font = `700 32px ${SERIF}`; g.fillText("…", X0 + N * (T + gap) + 4, y + 32);
    g.fillStyle = "#f0a080"; g.font = `600 26px ${MONO}`; g.fillText("starts just like yours", X0 + N * (T + gap) + 56, y + 31);
  }
  y += 58;
  g.strokeStyle = "#3b4139"; g.lineWidth = 2; g.beginPath(); g.moveTo(46, y - 12); g.lineTo(W - 46, y - 12); g.stroke();
  g.fillStyle = "#e6c46a"; g.font = `700 28px ${MONO}`; g.fillText("YOUR ROW", 46, y + 32);
  guess.forEach((b, i) => tile(X0 + i * (T + gap), y, b, escaped ? "#7fd0a0" : null));
  g.fillStyle = "#8d968c"; g.font = `700 32px ${SERIF}`; g.fillText("…", X0 + N * (T + gap) + 4, y + 32);
  g.font = `400 26px ${SERIF}`; g.fillStyle = "#b7bdb2";
  g.fillText(escaped ? "and on by the same rule: tile n is the opposite of row n's tile n" : "set by the switches on the desk", X0 + N * (T + gap) + 56, y + 30);
  if (message) {
    g.font = `600 28px ${SERIF}`; g.fillStyle = good ? "#7fd0a0" : "#f0a080";
    const lines = wrap(g, message, W - 92).slice(0, 2);
    let yy = H - 26 - 34 * (lines.length - 1);
    for (const l of lines) { g.fillText(l, 46, yy); yy += 34; }
  }
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}

// Room 5's question board, once the list has been beaten twice.
export function questionBoard(doc, {locked, message, good, solved}) {
  const W = 1400, H = Math.round(1400 * 1.6 / 3.8), c = doc.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = "#151a1d"; g.fillRect(0, 0, W, H);
  g.fillStyle = "#c9a24f"; g.font = `600 30px ${MONO}`; g.fillText("A QUESTION FOR THE LIBRARIAN", 50, 62);
  g.fillStyle = "#f1ece2"; g.font = `700 60px ${SERIF}`; g.fillText("Which list could hold every endless row?", 50, 160);
  g.font = `400 36px ${SERIF}`; g.fillStyle = "#9aa3a6";
  g.fillText(locked ? "First, beat the list: make a row that isn't in it." : solved ? "Solved." : "Press your answer on the lectern.", 50, 228);
  g.font = `600 30px ${MONO}`; g.fillStyle = "#e6c46a";
  g.fillText("LONGER: a longer list   ENDLESS: an endless one   NONE: no list can", 50, 290);
  if (message) {
    g.font = `600 36px ${SERIF}`; g.fillStyle = good ? "#7fd0a0" : "#f0a080";
    let yy = H - 40 - 46 * (wrap(g, message, W - 100).length - 1);
    for (const l of wrap(g, message, W - 100)) { g.fillText(l, 50, yy); yy += 46; }
  }
  return {w: W, h: H, rgba: g.getImageData(0, 0, W, H).data};
}
