// Screenshots of fixed poses, driving the game frame by frame (?drive=1).
// npm run shots -- [url] [outdir]   (after npm install && npx playwright install chromium)
const { chromium, devices } = require("playwright");
const path = require("path");
const url = process.argv[2] || "http://127.0.0.1:8781/";
const out = process.argv[3] || path.join(__dirname, "..", "shots");
require("fs").mkdirSync(out, { recursive: true });

const SHOTS = [
  // name, [x, z, yaw, pitch], setup js
  ["01-hub", [0, 4.2, Math.PI / 2, 0.05]],
  ["02-tri-entrance", [-9.6, 0, 0.35, 0.02]],
  ["03-tri-magic", "magic"],
  ["03a-tri-holding", "magic", "half"],
  ["03b-tri-solved", "magic", "hold"],
  ["04-tri-side", [-14.2, 4.8, 0, 0.0], "lookAtTribar"],
  ["05-tri-far-side", [-19.5, 4.5, 0, 0], "lookAtTribar"],
  ["06-miu-console", [16, -2.2, Math.PI / 2, 0.3], "playMachine"],
  ["07-miu-ramp", [10.5, 3.5, Math.PI, 0.1]],
  ["07b-miu-gate", [10.0, 5.0, Math.PI + 0.75, 0.15]],
  ["08-miu-board", [19.0, -0.5, Math.PI, -0.1], "openGate"],
  ["09-miu-declare", [20.9, 3.2, Math.PI, 0.55], "declare"],
  ["10-hub-again", [0, 2.0, Math.PI / 2, -0.05]],
  ["11-menu", [0, 2.4, Math.PI / 2, 0], "menu"],
  ["12-hub-south", [0, -1.5, -Math.PI / 2, 0]],
  ["13-tri-bench", [-14.5, 2.0, -2.4, 0.15]],
  ["14-scr-entrance", [0, 10.4, -Math.PI / 2 - 0.25, 0.02], "frames40"],
  ["15-scr-screen-far", [0, 14.5, -Math.PI / 2, -0.04], "frames40"],
  ["16-scr-screen-close", [0, 20.2, -Math.PI / 2, -0.06], "frames60"],
  ["17-scr-lectern", [5.35, 15.0, Math.PI, 0.32], "answerFirst"],
  ["18-scr-liar", [5.35, 15.0, Math.PI - 0.05, 0.05], "toLiar"],
  ["19-scr-solved", [5.35, 15.0, Math.PI - 0.05, 0.05], "solveLiar"],
];

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(url + "?drive=1", { waitUntil: "commit" });
  await page.waitForFunction(() => window.__tangle && window.__strataKit, null, { timeout: 90000 });
  await page.evaluate(() => { window.__tangle.reset(); });
  let t = 1;
  const drive = async (n = 2) => { for (let i = 0; i < n; i++) { t += 1 / 30; await page.evaluate((tt) => window.__strataKit.drive(tt), t); } };
  for (const [name, pose, setup] of SHOTS) {
    await page.evaluate(({ pose, setup }) => {
      if (setup !== "afterSolve" && window.__tangle.state.card) window.__tangle.card(null);
      const g = window.__tangle, W = { eye: [-12.2, 1.62, 5.4], c: [-19.6, 2.9, -3.6] };
      const aimAt = (x, z, y = 1.62) => {
        const dx = W.c[0] - x, dz = W.c[2] - z, dy = W.c[1] - y, h = Math.hypot(dx, dz);
        return [Math.atan2(-dz, -dx), Math.atan2(-dy, h)];
      };
      if (pose === "magic") { const [yaw, pitch] = aimAt(W.eye[0], W.eye[2]); g.pose(W.eye[0], W.eye[2], yaw, pitch); }
      else if (setup === "lookAtTribar") { const [yaw, pitch] = aimAt(pose[0], pose[1]); g.pose(pose[0], pose[1], yaw, pitch); }
      else g.pose(...pose);
      if (setup === "playMachine") ["r2", "r2", "r1", "next"].forEach((b) => g.press(b));
      if (setup === "openGate") { for (let i = 0; i < 20; i++) g.press(i % 2 ? "undo" : "r2"); g.pose(19.9, -0.5, Math.PI, -0.12); }
      if (setup === "declare") g.press("declare");
      if (setup === "menu") g.openMenu();
      if (setup === "answerFirst") g.press("true");
      if (setup === "toLiar") ["false", "true", "false", "true"].forEach((b) => g.press(b));
      if (setup === "solveLiar") ["false", "neither"].forEach((b) => g.press(b));
    }, { pose, setup });
    await drive(setup === "hold" ? 90 : setup === "half" ? 16 : /^frames(\d+)$/.test(setup || "") ? Number(setup.slice(6)) : 3);
    await page.screenshot({ path: path.join(out, name + ".png") });
    const st = await page.evaluate(() => ({ room: window.__tangle.state.room, solved: window.__tangle.state.solved, me: window.__tangle.me }));
    console.log(name, JSON.stringify(st.solved), st.room, st.me.y.toFixed(2), await page.evaluate(() => `depth ${window.__tangle.state.depth} screenDone ${window.__tangle.state.screenDone} sentence ${window.__tangle.state.sentence}`));
  }
  // the title card, as a player first sees it (not driven)
  const p2 = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  p2.on("pageerror", (e) => errors.push(e.message));
  await p2.goto(url, { waitUntil: "commit" });
  await p2.waitForFunction(() => window.__tangle, null, { timeout: 90000 });
  await p2.waitForTimeout(2500);
  await p2.screenshot({ path: path.join(out, "00-title.png") });
  // a player's first seconds: Begin (starts the sound), walk forward, Esc for the menu
  await p2.evaluate(() => window.__tangle.reset());
  await p2.click("#begin");
  await p2.keyboard.down("KeyW"); await p2.waitForTimeout(1200); await p2.keyboard.up("KeyW");
  const walked = await p2.evaluate(() => ({ z: window.__tangle.me.z, card: window.__tangle.state.card }));
  await p2.evaluate(() => window.__tangle.openMenu());
  await p2.waitForTimeout(300);
  const menu = await p2.evaluate(() => window.__tangle.state.card);
  await p2.click("#resume");
  console.log("player: walked to z", walked.z.toFixed(2), "card", walked.card, "menu", menu, "after resume", await p2.evaluate(() => window.__tangle.state.card));
  console.log("errors", errors);
  await browser.close();
})();
