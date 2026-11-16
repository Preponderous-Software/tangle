# Playtest of 0.3.0

Two AI playtesters ([playtester](https://github.com/Preponderous-Software/playtester), x11 driver, Chromium in software rendering) played commit 308671f on 2026-11-15. This was the first test of card 81's two-digit dial and of the epilogue. Profile: `tools/playtest/tangle.json`.

| Session | Goal | Outcome | Fun |
| --- | --- | --- | --- |
| s01 | The Prover with the new dial, as someone who has never heard of Gödel | achieved | 4/5 |
| s02 | The epilogue: the hall's new door, the passage, and the way back | achieved | 4/5 |

`summary.md` is the aggregated report (10 findings: 0 blocker, 0 major, 4 minor, 6 polish). Each session directory holds its `report.json`, `findings.jsonl`, the game's probe `events.jsonl`, and the screenshots its findings cite. The build line in the summary says 0.2.0 because the probe still reported that version; the run directory is shortened to `playtest-run4`.

Both testers reached their goal. The dial took 8 presses from 47 to 81, and the board explained each number on the way, so it read as feedback rather than a chore. Looping back into the hall felt like a fitting last beat, with no visible seam.

## What was fixed after this run

- **The passage's plaque ("I" is a strange loop) was easy to walk past** (minor). It hangs side-on in a short passage, so walking straight on, as the sign says, passed it unread. The first time through, it is now shown as a card.
- **The finale pointed two ways at once** (minor). After the Prover there is now one objective: see the board, then the new door.
- **Number keys failed silently away from a desk** (minor). They now say why when you're not at a desk or press past its buttons, and they reach a little further (3.6 m).
- **The sign over the door still read "The way out" after the loop.** Once you've been round it reads "The way out?".
- **The TENS/ONES labels under card 81's digits were too small.** They are bigger.
- `tools/playtest-launch.sh --rooms done` starts in the solved hall.

## Not changed

- **Aiming at the Prover lectern's answers with Page Up/Down** is fiddly at the few frames per second of software rendering; the number keys press them without aiming.
- **The black box at the top centre** is Chrome's own "Press Esc to show your cursor" bubble, shown when the mouse is captured (as in 0.2.0).
- **Dark specks near the way-out door and a snag on its jamb** are left for a later pass.
