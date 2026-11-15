// A whole playthrough through the real inputs: the W key walks, the camera is turned toward each
// waypoint (as a player would with the mouse), E presses what the crosshair is on. Fails unless
// every room ends solved with no console errors.
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

  // the Screen: look at yourself until the screen shows itself six levels deep, then the sentences
  await walkTo(20.6, 6.0); await walkTo(18.8, 7.2); await walkTo(11.3, 7.2); await walkTo(11, 0);
  await walkTo(7.5, 0); await walkTo(0, 0); await walkTo(0, 5.5); await walkTo(0, 9.6); await walkTo(0, 19.6);
  await lookAt([0, 2.15, 22.83]); await frames(60);
  step(`screen: ${await page.evaluate(() => `${window.__tangle.state.depth} levels deep, done ${window.__tangle.state.screenDone}`)}`);
  await walkTo(5.4, 15.0);
  const Z = { true: 14.45, false: 15.0, neither: 15.55 };
  for (const b of ["true", "false", "true", "false", "true", "false", "neither"]) {
    await lookAt([6.62, 1.08, Z[b]]); await frames(2);
    await page.keyboard.press("KeyE"); await frames(2);
  }
  step(`sentences card: ${await closeCard()}`);

  // the Staircase: through the vestibule, once round the stairs (every flight up), back out, answer
  await walkTo(3, 16); await walkTo(-2, 16); await walkTo(-7.5, 16); await walkTo(-9.5, 16); await walkTo(-11.9, 16);
  for (const [x, z] of [[-11.9, 13], [-11.9, 10.9], [-17, 10.9], [-22.1, 10.9], [-22.1, 16], [-22.1, 21.1], [-17, 21.1], [-11.9, 21.1], [-11.9, 16]]) await walkTo(x, z);
  step(`stairs: ${await page.evaluate(() => `loops ${window.__tangle.state.loops}, looped ${window.__tangle.state.loopedOnce}, prompt "${document.getElementById("prompt").textContent}"`)}`);
  await walkTo(-9.5, 16); await walkTo(-9.5, 14.4);
  await lookAt([-9.5, 1.08, 13.3]); await frames(3);
  await page.keyboard.press("KeyE"); await frames(3);
  step(`staircase card: ${await closeCard()}`);

  // the List: a guess first (the librarian finds it further down), then the flipped diagonal, twice
  await walkTo(-9.5, 16); await walkTo(-9.5, 19.2); await walkTo(-9.5, 24); await walkTo(-9.5, 27); await walkTo(-8.6, 32.7);
  const SW = (i) => (i === "check" ? -10.9 : -6.3 - 0.5 * i);
  const pressSwitch = async (i) => { await lookAt([SW(i), 1.1, 34.0]); await frames(2); await page.keyboard.press("KeyE"); await frames(2); };
  const diag = () => page.evaluate(() => JSON.parse(JSON.stringify(window.__tangle.state.diag)));
  await pressSwitch(2); await pressSwitch(5); await pressSwitch("check");
  step(`list guess: ${(await diag()).msg}`);
  for (const round of [0, 1]) {
    const d = await diag(), want = d.list.map((r, i) => 1 - r[i]);
    for (let i = 0; i < 8; i++) if (d.guess[i] !== want[i]) await pressSwitch(i);
    await pressSwitch("check");
    step(`list round ${round}: escaped ${(await diag()).escaped}`);
    if (round === 0) { for (let k = 0; k < 80 && (await diag()).round === 0; k++) { await page.waitForTimeout(100); await frames(1); } }
  }
  step(`list: round ${(await diag()).round}`);
  await walkTo(-4.4, 31.0);
  await lookAt([-2.62, 1.08, 31.55]); await frames(3);
  await page.keyboard.press("KeyE"); await frames(3);
  step(`list card: ${await closeCard()}`);

  // the Prover: the two sums, then card 81 set to talk about itself, then the two questions
  await walkTo(-9, 31); await walkTo(-13.5, 31); await walkTo(-17, 31); await walkTo(-22.6, 31);
  const KEY = { g12: 32.9, g47: 32.1, g81: 31.3, gnum: 30.1 };
  const pressKey = async (id) => { await lookAt([-24.0, 1.1, KEY[id]]); await frames(2); await page.keyboard.press("KeyE"); await frames(2); };
  const prv = () => page.evaluate(() => { const p = window.__tangle.state.prv; return { fed: p.fed, blank: p.blank, selfFed: p.selfFed, q: p.q, msg: p.msg, qMsg: p.qMsg }; });
  await pressKey("g81");
  step(`prover, card 81 too soon: ${(await prv()).msg}`);
  await pressKey("g12"); await pressKey("g47");
  step(`prover fed: ${JSON.stringify((await prv()).fed)}`);
  while ((await prv()).blank !== 81) await pressKey("gnum");
  await pressKey("g81");
  for (let k = 0; k < 100 && !(await prv()).selfFed; k++) { await page.waitForTimeout(100); await frames(2); }
  step(`prover: card 81 fed, questions ${(await prv()).selfFed ? "open" : "SHUT"}`);
  await walkTo(-22, 34.4);
  const GX = { ga: -21.45, gb: -22.0, gc: -22.55 };
  const answerG = async (id) => { await lookAt([GX[id], 1.08, 35.42]); await frames(3); await page.keyboard.press("KeyE"); await frames(3); };
  await answerG("ga");
  step(`prover q1 wrong: ${(await prv()).qMsg}`);
  await answerG("gb"); await answerG("ga");
  step(`prover card: ${await closeCard()}`);
  step(`ending card: ${await closeCard()}`);
  const end = await st();
  step(`end: ${JSON.stringify(end.solved)}`);
  console.log("errors", errors);
  await browser.close();
  if (!end.solved.tribar || !end.solved.miu || !end.solved.scr || !end.solved.stair || !end.solved.list || !end.solved.godel || errors.length) process.exit(1);
})().catch((e) => { console.error(e.message); process.exit(1); });
