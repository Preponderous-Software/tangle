// Room 5's list: Cantor's diagonal as a puzzle. The librarian's list claims to hold every endless row
// of light (1) and dark (0) tiles. The wall shows the first N rows and the first N tiles of each; the
// player sets N switches (the start of their row) and checks it. Pure data and checks, for tests.
export const N = 8;

// The rows the wall shows at first (row 1 at the top). Irregular on purpose.
export const START = [
  "10110010", "01101100", "11010001", "00111010", "10011101", "01000111", "11100100", "00101011",
].map((s) => [...s].map(Number));

export const diagonal = (list) => list.map((row, i) => row[i]);
export const flipped = (list) => diagonal(list).map((b) => 1 - b);

// A row escapes the list when tile n differs from row n's tile n for every n: then it differs from
// every row somewhere, however long the list goes on.
export function escapes(guess, list) { return guess.every((b, i) => b !== list[i][i]); }

// Where each shown row first differs from the guess (-1: the same in every shown tile).
export function differences(guess, list) { return list.map((row) => row.findIndex((b, i) => b !== guess[i])); }

// A row number further down the list that starts exactly like the guess. The list is endless and
// holds every way a row can start, so the librarian can always point to one (made up, but fixed).
export function laterRow(guess) {
  const v = guess.reduce((a, b) => a * 2 + b, 0);
  return N + 1 + ((v * 2654435761) >>> 0) % 9000;
}

// Pressing CHECK: {kind: "escapes" | "row" | "later", row?, diffs}.
export function check(guess, list) {
  const diffs = differences(guess, list);
  if (escapes(guess, list)) return {kind: "escapes", diffs};
  const same = diffs.indexOf(-1);
  if (same >= 0) return {kind: "row", row: same + 1, diffs};
  return {kind: "later", row: laterRow(guess), diffs};
}

// The librarian adds the player's row at the top: every row moves down one, and the wall still shows
// the first N.
export function addRow(list, guess) { return [guess.slice(), ...list.map((r) => r.slice())].slice(0, N); }

// The question once the list has been beaten twice: which list could hold every endless row?
export const QUESTION = [["q_long", "LONGER"], ["q_endless", "ENDLESS"], ["q_none", "NONE"]];
export function answerQuestion(id) {
  if (id === "q_none") return {ok: true, message: "Right: no list can hold every endless row. Whatever the list, flip every tile on its diagonal and you get a row that isn't in it."};
  if (id === "q_long") return {ok: false, message: "Add as many rows as you like: the new list has a new diagonal, and flipping it gives a row that's missing. You just saw it happen twice."};
  return {ok: false, message: "This list is endless already, and flipping its diagonal still made a row that wasn't in it."};
}
