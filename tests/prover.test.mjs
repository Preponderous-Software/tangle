import test from "node:test";
import assert from "node:assert/strict";
import {SELF, CARDS, START, cardText, validBlank, turn, pad2, about, feed, QUESTIONS, ANSWER_IDS, answer, searched} from "../src/prover.js";

test("card 81 is about itself only when its blank is its own number", () => {
  assert.equal(cardText(SELF, SELF), "The Prover can't prove card 81.");
  assert.equal(cardText(SELF, 12), "The Prover can't prove card 12.");
  assert.equal(cardText(SELF, 5), "The Prover can't prove card 05.");
  for (let k = 0; k < 100; k++) assert.equal(about(k).self, k === SELF);
});

test("the dial: two digits that each wrap, every number reachable, none outside 00..99", () => {
  assert.equal(turn(47, "tens"), 57); assert.equal(turn(47, "ones"), 48);
  assert.equal(turn(97, "tens"), 7); assert.equal(turn(49, "ones"), 40);
  assert.ok(validBlank(START) && START !== SELF && CARDS.includes(START));
  const seen = new Set();
  for (let a = 0, k = 0; a < 10; a++, k = turn(k, "tens")) for (let b = 0, j = k; b < 10; b++, j = turn(j, "ones")) { assert.ok(validBlank(j)); seen.add(j); }
  assert.equal(seen.size, 100);
  for (const bad of [-1, 100, 4.5, "81", null, undefined]) assert.equal(validBlank(bad), false);
  assert.equal(pad2(7), "07");
  // from the start, card 81 is a handful of presses away (not a long grind)
  let k = START, presses = 0;
  while (Math.floor(k / 10) !== 8) { k = turn(k, "tens"); presses++; }
  while (k % 10 !== 1) { k = turn(k, "ones"); presses++; }
  assert.equal(k, SELF); assert.ok(presses <= 9, `${presses} presses`);
});

test("every wrong number is explained, and differently for the cards on the desk", () => {
  const twelve = about(12, [12]).message, fortySeven = about(47).message, other = about(52).message;
  assert.match(twelve, /proved? card 12|prove card 12/); assert.match(twelve, /false/);
  assert.match(fortySeven, /true/); assert.match(other, /no card 52/);
  assert.notEqual(about(12, []).message, twelve);  // before you've watched card 12 proved, it says so differently
  for (const k of [12, 47, 52, 0]) assert.match(about(k).message, /isn't about itself|talk about itself/);
});

test("the Prover proves the true sum, searches forever on the false one", () => {
  assert.equal(feed(12, SELF, []).kind, "proved");
  assert.equal(feed(47, SELF, []).kind, "forever");
});

test("card 81 goes in only after both sums, and only when it talks about itself", () => {
  assert.equal(feed(SELF, SELF, [12]).kind, "refused");
  assert.equal(feed(SELF, 12, [12, 47]).kind, "refused");
  assert.equal(feed(SELF, 47, [12, 47]).kind, "refused");
  assert.equal(feed(SELF, 18, [12, 47]).kind, "refused");
  assert.match(feed(SELF, 18, [12, 47]).message, /card 18/);
  assert.equal(feed(SELF, SELF, [47, 12]).kind, "forever");
});

test("each question has exactly one right answer, and it is the reasoned one", () => {
  for (let q = 0; q < QUESTIONS.length; q++) {
    const right = ANSWER_IDS.filter((id) => answer(q, id).ok);
    assert.deepEqual(right, [QUESTIONS[q].right]);
    assert.equal(QUESTIONS[q].buttons.length, ANSWER_IDS.length);
  }
  assert.equal(QUESTIONS[0].buttons[ANSWER_IDS.indexOf(QUESTIONS[0].right)], "NO");
  assert.equal(QUESTIONS[1].buttons[ANSWER_IDS.indexOf(QUESTIONS[1].right)], "TRUE");
});

test("the search count only grows", () => {
  let last = -1;
  for (let t = 0; t < 30; t += 0.25) { const n = searched(t); assert.ok(n >= last); last = n; }
  assert.ok(searched(10) > 1e5);
});
