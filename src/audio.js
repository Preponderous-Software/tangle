// Every sound is synthesised (no recordings): cues, footsteps, a quiet tone for each room, and the
// "warmer" tone that guides you towards the triangle's viewpoint. Starts on the first gesture.
let ctx = null, master = null, roomBus = null, warm = null, noise = null;
let muted = false;
const rooms = {};

export function start() {
  if (ctx) { if (ctx.state === "suspended") ctx.resume(); return; }
  try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
  master = ctx.createGain(); master.gain.value = muted ? 0 : 1; master.connect(ctx.destination);
  roomBus = ctx.createGain(); roomBus.gain.value = 1; roomBus.connect(master);
  // a second of white noise, reused for footsteps
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  // room tones: soft chords, faded in by room()
  const chord = (freqs, type, gain) => {
    const g = ctx.createGain(); g.gain.value = 0; g.connect(roomBus);
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900; lp.connect(g);
    for (const f of freqs) {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
      const og = ctx.createGain(); og.gain.value = gain / freqs.length; o.connect(og); og.connect(lp); o.start();
      // a slow wobble, so the tone breathes
      const lfo = ctx.createOscillator(), lg = ctx.createGain(); lfo.frequency.value = 0.07 + Math.random() * 0.05; lg.gain.value = f * 0.003;
      lfo.connect(lg); lg.connect(o.frequency); lfo.start();
    }
    return g;
  };
  rooms.hub = chord([110, 165, 220], "sine", 0.05);
  rooms.tri = chord([98, 147, 196, 247], "sine", 0.05);
  rooms.miu = chord([60, 120, 180], "triangle", 0.035);
  rooms.scr = chord([82.4, 123.5, 164.8, 207.7], "sine", 0.045);
  // the warmer tone
  const o = ctx.createOscillator(); o.type = "sine"; o.frequency.value = 330;
  const g = ctx.createGain(); g.gain.value = 0; o.connect(g); g.connect(master); o.start();
  warm = {o, g};
}

export function setMuted(m) {
  muted = m;
  if (master) master.gain.setTargetAtTime(m ? 0 : 1, ctx.currentTime, 0.1);
}

export function room(name) {
  if (!ctx) return;
  for (const [k, g] of Object.entries(rooms)) g.gain.setTargetAtTime(k === name ? 1 : 0, ctx.currentTime, 0.8);
}

// 0 (cold) .. 1 (lined up): louder and higher as you close in.
export function warmth(x) {
  if (!warm) return;
  const t = ctx.currentTime;
  warm.g.gain.setTargetAtTime(x > 0.02 ? 0.015 + 0.06 * x * x : 0, t, 0.12);
  warm.o.frequency.setTargetAtTime(262 + 262 * x, t, 0.12);
}

function note(f, at, dur, gain = 0.12, type = "sine") {
  const t = ctx.currentTime;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f; o.connect(g); g.connect(master);
  g.gain.setValueAtTime(0, t + at); g.gain.linearRampToValueAtTime(gain, t + at + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0005, t + at + dur); o.start(t + at); o.stop(t + at + dur + 0.05);
}

export function step(surface = "hub") {
  if (!ctx) return;
  const src = ctx.createBufferSource(); src.buffer = noise;
  const bp = ctx.createBiquadFilter(); bp.type = "bandpass";
  bp.frequency.value = ({hub: 420, tri: 300, miu: 520, scr: 380, wood: 700}[surface] || 420) * (0.9 + Math.random() * 0.2); bp.Q.value = 1.2;
  const g = ctx.createGain(), t = ctx.currentTime;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.09, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0005, t + 0.11);
  src.connect(bp); bp.connect(g); g.connect(master);
  src.start(t, Math.random() * 0.8, 0.14);
}

export function cue(kind) {
  if (!ctx) return;
  if (kind === "click") note(880, 0, 0.06, 0.05, "square");
  if (kind === "nope") { note(180, 0, 0.12, 0.06, "square"); note(150, 0.08, 0.14, 0.05, "square"); }
  if (kind === "gate") [392, 523, 659, 784].forEach((f, i) => note(f, i * 0.12, 0.7, 0.08));
  if (kind === "solve") [523, 659, 784, 1047, 1319].forEach((f, i) => note(f, i * 0.13, 1.6, 0.09));
  if (kind === "open") [440, 554].forEach((f, i) => note(f, i * 0.07, 0.3, 0.05));
}

// A Shepard tone for pitch class pc (semitones, any integer): the same note in eight octaves at
// once, loudest in the middle, so a scale of them seems to rise forever without getting high.
export function shepard(pc, dur = 0.35, gain = 0.07, at = 0) {
  if (!ctx) return;
  const t = ctx.currentTime + at, base = 32.7, k = ((pc % 12) + 12) % 12;
  for (let oct = 0; oct < 8; oct++) {
    const pos = oct + k / 12, f = base * Math.pow(2, pos);
    const w = Math.exp(-Math.pow((pos - 4) / 1.6, 2));
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.value = f; o.connect(g); g.connect(master);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(gain * w, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0003, t + dur); o.start(t); o.stop(t + dur + 0.05);
  }
}

// A landing's key, as a rising major chord of Shepard tones.
export function keyChord(pc) {
  if (!ctx) return;
  [0, 4, 7].forEach((iv, i) => shepard(pc + iv, 1.4, 0.05, i * 0.09));
}
