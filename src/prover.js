// Room 6: the Prover. Pure logic (no DOM): the cards, what the Prover does with each, and the two
// questions about card 81. Tested in tests/prover.test.mjs.

// Every card has a number, so a card can talk about another card, or about itself.
export const SELF = 81;
export const CARDS = [12, 47, 81];   // the cards on the desk
export const START = 47;             // card 81's blank, before you touch the dial
export const PROOF = ["2 + 2", "= 2 + 1 + 1", "= 3 + 1", "= 4"];

export function cardText(n, blank = SELF) {
  if (n === 12) return "2 + 2 = 4";
  if (n === 47) return "2 + 2 = 5";
  return `The Prover can't prove card ${pad2(blank)}.`;
}
// Card 81's blank is a two-digit dial: one button turns the tens, one the ones (9 wraps to 0).
// Nothing tells you to set 81: you have to see that the card's own number is the one it needs.
export function validBlank(k) { return Number.isInteger(k) && k >= 0 && k <= 99; }
export function turn(k, digit) {
  const tens = Math.floor(k / 10), ones = k % 10;
  return digit === "tens" ? ((tens + 1) % 10) * 10 + ones : tens * 10 + (ones + 1) % 10;
}
export function pad2(k) { return String(k).padStart(2, "0"); }

// What card 81 says now, and what that means: the explanation the board shows as you turn the dial.
export function about(blank, fed = []) {
  const b = pad2(blank);
  if (blank === SELF) return {self: true, message: "Card 81 now says: \u201cThe Prover can't prove card 81.\u201d It talks about itself."};
  if (blank === 12) return {self: false, message: fed.includes(12)
    ? "Card 81 now talks about card 12. You watched the Prover prove card 12, so card 81 is simply false. It isn't about itself."
    : "Card 81 now talks about card 12, 2 + 2 = 4. That one can be proved, so card 81 would simply be false. It isn't about itself."};
  if (blank === 47) return {self: false, message: "Card 81 now talks about card 47, 2 + 2 = 5. The Prover can't prove that, so card 81 is simply true. It isn't about itself."};
  return {self: false, message: `Card 81 now talks about card ${b}, and there's no card ${b} on the desk. Which card should card 81 talk about, to talk about itself?`};
}

// What happens when a card goes into the Prover.
// kind: "proved" (finds a proof), "forever" (searches without end), "refused" (not fed: card 81 isn't about itself yet)
export function feed(n, blank, fed) {
  if (n === 12) return {kind: "proved", message: "Proved, in three steps. It's true, and the Prover found the proof."};
  if (n === 47) return {kind: "forever", message: "Still searching, and it always will be: 2 + 2 = 5 is false, and the Prover never proves anything false."};
  if (!fed.includes(12) || !fed.includes(47)) return {kind: "refused", message: "First feed it card 12 and card 47, and watch what the Prover does with each."};
  if (blank !== SELF) return {kind: "refused", message: `Card 81 now talks about card ${pad2(blank)}, not about itself. Turn its number, with the two dials on the desk, until it does.`};
  return {kind: "forever", message: "Card 81 says the Prover can't prove card 81: it is talking about itself. The Prover is searching…"};
}

// [id, label] per question; the lectern's three buttons are ga, gb, gc.
export const QUESTIONS = [
  {ask: "Could the Prover ever stamp card 81 PROVED?", buttons: ["YES", "NO", "ONE DAY"],
    legend: "YES: it could   NO: it never will   ONE DAY: if it searches long enough", right: "gb"},
  {ask: "So is card 81 true?", buttons: ["TRUE", "FALSE", "CAN'T BE EITHER"],
    legend: "Card 81 says: “The Prover can't prove card 81.”", right: "ga"},
];
export const ANSWER_IDS = ["ga", "gb", "gc"];

export function answer(q, id) {
  if (q === 0) {
    if (id === "gb") return {ok: true, message: "Right. If it proved card 81, it would have proved something false, and it never does. So it never will."};
    return {ok: false, message: "Suppose it did. Card 81 says “I can't be proved”, so that would make card 81 false, and the Prover never proves false things."};
  }
  if (id === "ga") return {ok: true, message: "True. It says the Prover can't prove it, and that is exactly so. True, and it can't be proved."};
  if (id === "gb") return {ok: false, message: "Card 81 says the Prover can't prove it. You've just worked out that it can't. So what it says is so."};
  return {ok: false, message: "That was the liar in the Screen room. This one isn't a paradox: you know it can't be proved, and that's all it says."};
}

// How many proofs the Prover has checked after t seconds of searching (it speeds up).
export function searched(t) { return Math.floor(400 * Math.pow(Math.max(0, t), 2.6) * (1 + t / 4)); }
