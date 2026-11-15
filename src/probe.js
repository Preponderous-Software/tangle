// Playtester probe (Preponderous-Software/playtester, docs/PROBE_CONTRACT.md). Loaded only with
// ?probe: about twice a second the page posts what the player sees to tools/serve.py
// (--probe-dir), which writes state.json and events.jsonl. It reads the game and never changes it;
// failures are ignored.
import * as World from "./world.js";
import {QUESTION} from "./diagonal.js";
import {QUESTIONS as PROVER_Q, ANSWER_IDS} from "./prover.js";

const VERSION = "0.2.0";
const post = (path, body) => { fetch(path, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(body), keepalive: true}).catch(() => {}); };
const t0 = performance.now();
const tick = () => Math.max(0, Math.round((performance.now() - t0) / 1000 * 60));
const event = (type, fields = {}) => post("/__probe/event", {type, tick: tick(), wallTimeMs: Date.now(), ...fields});
const text = (id) => { const el = document.getElementById(id); return el && !el.hidden ? el.textContent.trim() || null : null; };

// Things a player walks to: doorways, plaques, and everything that can be pressed.
const DOORS = [["triangle door", -6, 0], ["machine door", 6, 0], ["screen door", 0, 6], ["screen room's hall door", 0, 9],
  ["vestibule door", -8, 16], ["staircase door", -10.7, 16], ["list corridor", -9.5, 19.4], ["list door", -9.5, 25], ["prover door", -16, 31]];
const PLAQUES = [["welcome plaque", 0, -6], ["triangle plaque", -10.9, -8], ["machine rules", 11.4, -8], ["screen plaque", -3.6, 9],
  ["staircase plaque", -10.7, 18.3], ["vestibule question", -9.5, 12.6], ["list plaque", -14, 37], ["librarian's list", -9, 37],
  ["list question", -2, 31], ["prover plaque", -19.3, 25], ["prover board", -27, 31], ["prover questions", -22, 37], ["big screen", 0, 23], ["sentence board", 8, 15], ["balcony board", 23, -0.5]];
function buttons() {
  const out = [];
  for (const [id, label, x] of World.BUTTONS) out.push([`machine ${label}`, x, World.BUTTON_Z, id]);
  for (const [id, label, z] of World.ANSWERS) out.push([`lectern ${label}`, World.ANSWER_X, z, id]);
  for (const [id, label, x] of World.TOP_ANSWERS) out.push([`vestibule ${label}`, x, 13.3, id]);
  for (const [id, label, x] of World.SWITCHES) out.push([id === "check" ? "list CHECK" : `list tile ${label}`, x, World.SWITCH_Z, id]);
  for (const [id, label] of QUESTION) out.push([`list answer ${label}`, World.QANSWER_X, World.QANSWERS_Z[id], id]);
  for (const [id, label, z] of World.PKEYS) out.push([`prover desk ${label}`, World.PKEY_X, z, id]);
  ANSWER_IDS.forEach((id, i) => out.push([`prover lectern button ${i + 1} (${PROVER_Q.map((q) => q.buttons[i]).join(" / ")})`, World.GANSWERS_X[id], World.GANSWER_Z, id]));
  out.push(["declare button (balcony)", World.MACHINE.declare[0], World.MACHINE.declare[2], "declare"]);
  return out;
}

function nearest(me) {
  const fx = -Math.cos(me.yaw), fz = -Math.sin(me.yaw);  // where the player faces, on the ground
  const rel = (name, x, z, id) => {
    const dx = x - me.x, dz = z - me.z;
    const bearing = Math.atan2(dx * -fz + dz * fx, dx * fx + dz * fz) * 180 / Math.PI;  // + to the right
    return {name, ...(id ? {id} : {}), distance: +Math.hypot(dx, dz).toFixed(2), bearing: +bearing.toFixed(1)};
  };
  const sort = (l) => l.sort((a, b) => a.distance - b.distance).slice(0, 6);
  return {
    door: sort(DOORS.map(([n, x, z]) => rel(n, x, z, n))),
    plaque: sort(PLAQUES.map(([n, x, z]) => rel(n, x, z, n))),
    button: sort(buttons().map(([n, x, z, id]) => rel(n, x, z, id))),
  };
}

export function startProbe() {
  let lastScreen = null, lastObjective = null, lastCaption = null, lastPanel = null, solvedSeen = null, worldSent = false;
  const NAMES = {tribar: "The Triangle", miu: "The Machine", scr: "The Screen", stair: "The Staircase", list: "The List", godel: "The Prover"};
  setInterval(() => {
    try {
      const g = window.__tangle;
      if (!g) { post("/__probe/state", {wallTimeMs: Date.now(), version: VERSION, screen: "LOADING", world: false}); return; }
      const s = g.state, me = g.me;
      const screen = s.card === "title" ? "TITLE" : s.card === "menu" ? "PAUSE" : s.card === "panel" ? "DEBRIEF" : "WORLD";
      if (screen !== lastScreen) { event("screen", {from: lastScreen, to: screen}); lastScreen = screen; }
      if (screen !== "TITLE" && !worldSent) { worldSent = true; event("world", {how: "created", seed: 0}); }
      const objective = text("objective");
      if (objective && objective !== lastObjective) { event("objective", {text: objective}); lastObjective = objective; }
      const caption = text("caption");
      if (caption && caption !== lastCaption) { event("status", {text: caption}); lastCaption = caption; }
      const panel = screen === "DEBRIEF" ? text("panel-title") : null;
      if (panel && panel !== lastPanel) event("debrief", {title: panel});
      lastPanel = panel;
      if (!solvedSeen) solvedSeen = {...s.solved};
      let n = 0;
      for (const k of Object.keys(NAMES)) {
        if (s.solved[k]) n++;
        if (s.solved[k] && !solvedSeen[k]) event("objective_completed", {title: `Solve ${NAMES[k]}`, id: k, x: +me.x.toFixed(2), z: +me.z.toFixed(2)});
      }
      solvedSeen = {...s.solved};
      post("/__probe/state", {
        wallTimeMs: Date.now(), version: VERSION, screen, world: screen !== "TITLE", tick: tick(), seed: 0,
        fps: window.__strataKit && window.__strataKit.fps ? Math.round(window.__strataKit.fps) : undefined,
        player: {x: +me.x.toFixed(3), z: +me.z.toFixed(3), y: +me.y.toFixed(3), yawDeg: +(me.yaw * 180 / Math.PI).toFixed(1),
          pitchDeg: +(me.pitch * 180 / Math.PI).toFixed(1), speed: 2.6, alive: true},
        room: s.room, objective: objective ? {number: n + 1, title: objective, completed: n} : null,
        solved: s.solved, prompt: text("prompt"), caption, openPanels: screen === "WORLD" ? [] : [screen.toLowerCase()],
        list: {round: s.diag.round, checks: s.diag.checks, guess: s.diag.guess.join("")},
        prover: {fed: s.prv.fed, number: s.prv.blank, unlocked: s.prv.selfFed, question: s.prv.q, running: s.prv.run ? s.prv.run.n : null},
        stairs: {loops: s.loops, loopedOnce: s.loopedOnce}, screenDepth: s.depth,
        nearest: nearest(me),
      });
    } catch (e) { /* never take the game down */ }
  }, 500);
}
