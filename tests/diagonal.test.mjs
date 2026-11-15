import test from "node:test";
import assert from "node:assert/strict";
import {N, START, diagonal, flipped, escapes, differences, check, addRow, laterRow, answerQuestion} from "../src/diagonal.js";

test("the wall shows an N by N corner of the list", () => {
  assert.equal(START.length, N);
  for (const row of START) { assert.equal(row.length, N); assert.ok(row.every((b) => b === 0 || b === 1)); }
});

test("the flipped diagonal differs from row n at tile n, so it is in no shown row", () => {
  const f = flipped(START);
  assert.ok(escapes(f, START));
  const d = differences(f, START);
  d.forEach((at, n) => assert.ok(at >= 0 && at <= n, `row ${n + 1} differs by tile ${n + 1}`));
  assert.equal(check(f, START).kind, "escapes");
});

test("a shown row is found; any other row is claimed further down", () => {
  assert.deepEqual(check(START[4], START), {kind: "row", row: 5, diffs: differences(START[4], START)});
  const other = START[4].map((b, i) => (i === 7 ? 1 - b : b));  // differs from every shown row, but not on the diagonal
  const r = check(other, START);
  if (!escapes(other, START)) { assert.ok(r.kind === "row" || r.kind === "later"); }
  const zeros = Array(N).fill(0);
  assert.equal(check(zeros, START).kind, escapes(zeros, START) ? "escapes" : "later");
  assert.ok(laterRow(zeros) > N && laterRow(zeros) === laterRow(zeros.slice()));
});

test("only the flipped diagonal escapes: every other row agrees with some row n at tile n", () => {
  for (let v = 0; v < 2 ** N; v++) {
    const g = Array.from({length: N}, (_, i) => (v >> (N - 1 - i)) & 1);
    assert.equal(escapes(g, START), g.every((b, i) => b === flipped(START)[i]));
  }
});

test("adding the escaped row makes a new list whose own flipped diagonal escapes it", () => {
  const f = flipped(START), next = addRow(START, f);
  assert.equal(next.length, N);
  assert.deepEqual(next[0], f);
  assert.deepEqual(next[1], START[0]);
  assert.equal(escapes(f, next), false, "the old answer is in the list now");
  assert.ok(escapes(flipped(next), next));
  assert.equal(escapes(Array(N).fill(0), next), false, "the cleared switches don't win by accident");
  assert.deepEqual(diagonal(next).length, N);
});

test("only 'none can' answers the question", () => {
  assert.equal(answerQuestion("q_none").ok, true);
  assert.equal(answerQuestion("q_long").ok, false);
  assert.equal(answerQuestion("q_endless").ok, false);
});
