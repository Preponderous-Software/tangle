// Room 3's sentences that talk about themselves. Pure data and checks, so tests can confirm that
// each answer really is what the sentence says about itself.
//   answer: true | false | null (null: it can't be either, the liar)
//   why: what the display says after a wrong answer (or after either answer, for the liar)

export const SENTENCES = [
  {text: "This sentence has five words.", answer: true,
    why: "Count them: This, sentence, has, five, words. Five, so it's true."},
  {text: "This sentence is written in capital letters.", answer: false,
    why: "Look again: only its first letter is a capital, so it's false."},
  {text: "This sentence contains the letter z.", answer: true,
    why: "It does: the z near the end. By mentioning z, the sentence made itself true."},
  {text: "This sentence has no verb.", answer: false,
    why: "\"has\" is a verb, so what it says about itself is wrong: false."},
  {text: "This sentence is false.", answer: null,
    whyTrue: "If it's true, then what it says holds, so it's false. That can't be.",
    whyFalse: "If it's false, then what it says is wrong, so it's true. That can't be either."},
];

// The facts the first four claim, worked out from the text itself (for tests).
export const facts = {
  words: (s) => s.replace(/[.?!]$/, "").split(/\s+/).length,
  allCaps: (s) => s === s.toUpperCase(),
  hasZ: (s) => /z/i.test(s),
};

// Pressing an answer: {ok, next, message, unlockNeither}. tried: which answers the liar has seen.
export function answer(index, choice, tried = {}) {
  const s = SENTENCES[index];
  if (s.answer === null) {
    if (choice === "neither") return {ok: true, done: true, message: "Right: it can't be true and it can't be false."};
    const message = choice === "true" ? s.whyTrue : s.whyFalse;
    const seen = {...tried, [choice]: true};
    return {ok: false, message, tried: seen, unlockNeither: !!(seen.true && seen.false)};
  }
  if (choice === "neither") return {ok: false, message: "This one is plainly true or false. Check what it says about itself."};
  const want = s.answer ? "true" : "false";
  if (choice === want) return {ok: true, next: index + 1, message: s.answer ? "True." : "False."};
  return {ok: false, message: s.why};
}

// How many nested copies of a screen are visible, given its apparent size: each copy is the
// screen's fraction `s` of the one around it, and copies smaller than `minPx` can't be seen.
export function nestingDepth(s, viewPx, minPx = 6) {
  if (!(s > 0.02) || s >= 0.98) return s >= 0.98 ? 30 : 0;
  return Math.max(0, Math.floor(Math.log(minPx / viewPx) / Math.log(s)));
}
