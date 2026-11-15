// The MIU system (Hofstadter, GEB chapter I). Pure functions.
//   1: xI  -> xIU        2: Mx -> Mxx        3: III -> U        4: UU -> (nothing)

// Every place a rule applies, as {rule, at, result}.
export function moves(s) {
  const out = [];
  if (s.endsWith("I")) out.push({rule: 1, at: s.length - 1, result: s + "U"});
  if (s.startsWith("M")) out.push({rule: 2, at: 1, result: "M" + s.slice(1) + s.slice(1)});
  for (let i = 1; i + 3 <= s.length; i++) if (s.slice(i, i + 3) === "III") out.push({rule: 3, at: i, result: s.slice(0, i) + "U" + s.slice(i + 3)});
  for (let i = 1; i + 2 <= s.length; i++) if (s.slice(i, i + 2) === "UU") out.push({rule: 4, at: i, result: s.slice(0, i) + s.slice(i + 2)});
  return out;
}

export const countI = (s) => [...s].filter((c) => c === "I").length;

// The places rule `rule` can act on in s (for the machine's "next spot" button).
export const spots = (s, rule) => moves(s).filter((m) => m.rule === rule);

// Everything reachable from MI in up to `depth` steps with strings up to maxLen.
export function reachable(depth = 6, maxLen = 10) {
  const seen = new Set(["MI"]);
  let front = ["MI"];
  for (let k = 0; k < depth; k++) {
    const next = [];
    for (const s of front) for (const m of moves(s)) if (m.result.length <= maxLen && !seen.has(m.result)) { seen.add(m.result); next.push(m.result); }
    front = next;
  }
  return seen;
}

export const MAX_LEN = 24;  // the machine's display holds this many letters
