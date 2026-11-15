import test from "node:test";
import assert from "node:assert/strict";
import {SENTENCES, facts, answer, nestingDepth} from "../src/sentences.js";

test("each sentence's answer is what it says about itself", () => {
  const [five, caps, z, verb] = SENTENCES.map((s) => s.text);
  assert.equal(facts.words(five) === 5, SENTENCES[0].answer);
  assert.equal(facts.allCaps(caps), SENTENCES[1].answer);
  assert.equal(facts.hasZ(z), SENTENCES[2].answer);
  assert.ok(/\bhas\b/.test(verb) && SENTENCES[3].answer === false);
  assert.equal(SENTENCES[4].answer, null);
});

test("answering: right moves on, wrong explains, the liar needs both tries before 'neither'", () => {
  assert.equal(answer(0, "true").next, 1);
  assert.equal(answer(0, "false").ok, false);
  let r = answer(4, "true");
  assert.equal(r.ok, false); assert.equal(r.unlockNeither, false);
  r = answer(4, "false", r.tried);
  assert.equal(r.unlockNeither, true);
  assert.equal(answer(4, "neither", r.tried).done, true);
});

test("nesting depth grows as the screen fills the view", () => {
  assert.equal(nestingDepth(0.01, 800), 0);
  assert.ok(nestingDepth(0.3, 800) < 6);
  assert.ok(nestingDepth(0.5, 800) >= 6);
  assert.ok(nestingDepth(0.7, 800) > nestingDepth(0.5, 800));
});
