import test from "node:test";
import assert from "node:assert/strict";
import {SELF, NUMBERS, cardText, nextNumber, feed, QUESTIONS, ANSWER_IDS, answer, searched} from "../src/prover.js";

test("card 81 is about itself only when its blank is its own number", () => {
  assert.equal(cardText(SELF, SELF), "The Prover can't prove card 81.");
  assert.equal(cardText(SELF, 12), "The Prover can't prove card 12.");
  let k = NUMBERS[0];
  const seen = new Set();
  for (let i = 0; i < NUMBERS.length; i++) { seen.add(k); k = nextNumber(k); }
  assert.deepEqual([...seen].sort(), [...NUMBERS].sort());
  assert.equal(k, NUMBERS[0]);
});

test("the Prover proves the true sum, searches forever on the false one", () => {
  assert.equal(feed(12, SELF, []).kind, "proved");
  assert.equal(feed(47, SELF, []).kind, "forever");
});

test("card 81 goes in only after both sums, and only when it talks about itself", () => {
  assert.equal(feed(SELF, SELF, [12]).kind, "refused");
  assert.equal(feed(SELF, 12, [12, 47]).kind, "refused");
  assert.equal(feed(SELF, 47, [12, 47]).kind, "refused");
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
