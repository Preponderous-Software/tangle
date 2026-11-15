// A whole playthrough through the real inputs: the W key walks, the camera is turned toward each
// waypoint (as a player would with the mouse), E presses what the crosshair is on. Fails unless
// both rooms end solved with no console errors.
// npm run playthrough -- [url]   (after npm install && npx playwright install chromium)
const { chromium } = require("playwright");
const url = process.argv[2] || "http://127.0.0.1:8781/";
const EYE = 1.62;

(async () => {
  const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
  const page = await browser.newPage({ viewport: { width: 640, height: 360 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(url + "?drive=1&new=1", { waitUntil: "commit" });
  await page.waitForFunction(() => window.__tangle && window.__strataKit, null, { timeout: 90000 });
  let t = 1;
  const frames = async (n) => page.evaluate(({ t0, n }) => { for (let i = 1; i <= n; i++) window.__strataKit.drive(t0 + i / 30); }, { t0: t, n }).then(() => { t += n / 30; });
  const me = () => page.evaluate(() => window.__tangle.me);
  const st = () => page.evaluate(() => ({ solved: window.__tangle.state.solved, card: window.__tangle.state.card, gate: window.__tangle.state.gateOpen, word: window.__tangle.state.word }));
  const lookAt = async (p, from) => {
    const m = from || await me();
    const dx = p[0] - m.x, dy = p[1] - (m.y + EYE), dz = p[2] - m.z, h = Math.hypot(dx, dz);
    await page.evaluate(([y, pi]) => window.__tangle.look(y, pi), [Math.atan2(-dz, -dx), Math.atan2(-dy, h)]);
  };
  const walkTo = async (x, z, limit = 900) => {
    for (let i = 0; i < limit; i += 6) {
      const m = await me();
      if (Math.hypot(m.x - x, m.z - z) < 0.22) { await page.keyboard.up("KeyW"); await frames(10); return; }
      await lookAt([x, m.y + EYE, z], m);
      await page.keyboard.down("KeyW");
      await frames(6);
    }
    await page.keyboard.up("KeyW");
    const m = await me();
    throw new Error(`stuck walking to ${x},${z}: at ${m.x.toFixed(2)},${m.z.toFixed(2)}`);
  };
  const closeCard = async () => {
    for (let i = 0; i < 40; i++) {
      const s = await st();
      if (s.card === "panel") {
        const title = await page.textContent("#panel-title");
        if (!title.trim()) throw new Error("a debrief card opened with no text");
        await page.click("#panel-ok"); return title;
      }
      await page.waitForTimeout(100); await frames(2);
    }
    return false;
  };
  const step = (msg) => console.log(`[${t.toFixed(1)}s] ${msg}`);

  // the Triangle
  await walkTo(0, 0); await walkTo(-7.5, 0); await walkTo(-10.5, 0); await walkTo(-12.2, 5.4);
  await lookAt([-19.6, 2.9, -3.6]); await frames(45);
  step(`triangle: solved ${(await st()).solved.tribar}`);
  await walkTo(-12.2 + 1.6, 5.4 - 1.2);  // step aside and watch it break; the debrief follows
  step(`debrief card: ${await closeCard()}`);

  // the Machine
  await walkTo(-7.5, 0); await walkTo(7.5, 0); await walkTo(11, 0); await walkTo(16, -4.0);
  // a player trying things: double, add U, take back, until the machine has had a fair try
  // a curious player: press a rule that applies and makes a word not seen yet, else take a step back
  const { moves } = await import("../src/miu.js");
  const seen = new Set(["MI"]);
  const pick = (word) => {
    const fresh = moves(word).filter((m) => m.rule <= 2 && m.result.length <= 24 && !seen.has(m.result));
    const any = moves(word).filter((m) => m.result.length <= 24 && !seen.has(m.result));
    const m = fresh[0] || any[0];
    if (!m) return "undo";
    seen.add(m.result);
    return "r" + m.rule;
  };
  const X = { r1: 14.45, r2: 15.1, r3: 15.75, r4: 16.4, next: 17.05, undo: 17.7 };
  for (let i = 0; i < 40; i++) {
    const s0 = await st();
    if (s0.gate) break;
    const b = pick(s0.word);
    await lookAt([X[b], 1.08, -5.15]); await frames(2);
    await page.keyboard.press("KeyE"); await frames(2);
  }
  step(`machine: word ${(await st()).word}, gate open ${(await st()).gate}, ${await page.evaluate(() => JSON.stringify({p: window.__tangle.state.presses, made: new Set(window.__tangle.state.made).size, focus: window.__tangle.state.lastFocus}))}`);
  await walkTo(11, 4); await walkTo(11.3, 7.2); await walkTo(18.8, 7.2); await walkTo(20.6, 6.0); await walkTo(20.7, 3.2);
  step(`balcony: height ${(await me()).y.toFixed(2)}`);
  await lookAt([21.6, 4.65, 3.2]); await frames(3);
  await page.keyboard.press("KeyE"); await frames(3);
  step(`declare card: ${await closeCard()}`);
  const end = await st();
  step(`end: ${JSON.stringify(end.solved)}`);
  console.log("errors", errors);
  await browser.close();
  if (!end.solved.tribar || !end.solved.miu || errors.length) process.exit(1);
})().catch((e) => { console.error(e.message); process.exit(1); });
