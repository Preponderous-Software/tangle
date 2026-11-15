# Playtest of 0.2.0

Four AI playtesters ([playtester](https://github.com/Preponderous-Software/playtester), x11 driver, Chromium in software rendering) played commit 5b003a1 (all six rooms, after the polish pass) on 2026-11-15. This was the first new-player test of the Prover. Profile: `tools/playtest/tangle.json`.

| Session | Goal | Outcome | Fun |
| --- | --- | --- | --- |
| s01 | The Prover as someone who has never heard of Gödel | achieved | 4/5 |
| s02 | A brand-new player: the title, the hall, the Triangle and the Machine | achieved | 3/5 |
| s03 | The end game: the List, then the Prover | achieved | 4/5 |
| s04 | Graphics and layout hunt in the List, the Prover and the doorway between them | partial | 3/5 |

`summary.md` is the aggregated report (27 findings: 0 blocker, 1 major, 17 minor, 9 polish). Each session directory holds its `report.json`, `findings.jsonl`, the game's probe `events.jsonl`, and the screenshots its findings cite. Local paths are shortened to `.` (the game's checkout) and `playtest-run2` (the run directory).

Compared with 0.1.0: every session reached its goal except the graphics hunt, which covered both rooms but didn't walk every wall. No geometry problems were found (no gaps, seams, z-fighting or walk-through walls). Both testers who reached the Prover understood why card 81 is true but can't be proved.

## What was fixed after this run

- **Walking and turning ran at a quarter speed at low frame rates** (major). The frame step was capped at 50 ms, so at the 4–5 fps of software rendering most of each frame's time was dropped. A slow frame is now walked in 50 ms steps instead.
- **Lectern buttons had no labels you could see while aiming.** Every lectern and desk now also shows its labels on a strip standing behind the buttons.
- **Solved lecterns still showed "E: answer …"**, which did nothing. They stop taking aim once their room is solved.
- **The Prover:**
  - its plaque is bigger
  - the verdict table's note ("To the Prover, cards 47 and 81 look the same…") and the questions' hint are larger and brighter
  - after the closing cards, the NEXT line sends you back to the board
- **The NEXT banner covered boards.** Once read, it steps back: smaller and see-through.
- **The List:**
  - a winning row is marked on the diagonal, not at each row's first mismatch, which contradicted the diagonal story
  - the debrief says plainly where the last door is
  - the shelves beside the Prover's door are trimmed so they don't snag you
- **The Triangle:**
  - the hint said the ring of light was near the hall door; it is on your left as you come in, on the floor, and now under a pulsing column of light
  - the debrief waits 2.6 s after you step aside, so you see the triangle come apart
  - the NEXT line moves on when the debrief opens

## Not changed

- **The "black box at the top centre" after Begin** is Chrome's own "Press Esc to show your cursor" bubble, shown when the mouse is captured. A page can't change it.
- **"Page Unresponsive" at launch, input lag and overshooting turns** come from the shared machine's software renderer under load.
- **Card 81's number picker** cycles 12 → 47 → 81. Testers found it easy, but the puzzle's weight is in the questions, not the picker.
- **The Machine's balcony board and desk reach** were left for a later pass.

## Confirmation round

Three short sessions on the fixed builds (39a5be0, then dcac3e3) are in `confirmation/` (16 findings: 0 blocker, 1 major, 7 minor, 8 polish).

| Session | Goal | Outcome | Fun |
| --- | --- | --- | --- |
| s01 | From the start to the Machine: speed, the Triangle hint, labels | achieved | 4/5 |
| s02 | The List and the Prover: labels, the board's story, the door | partial (ran out of time in the List) | 3/5 |
| s03 | The Prover only: readability, labels, the verdict table | achieved | 4/5 |

What each session confirmed:
- **s01** confirmed the hint ring, watching the triangle break, the NEXT line moving on, and readable labels. It found speed was still low while the machine was busiest.
- **s02** found that aiming at small switches took minutes per tile at software-render frame rates (major).
- **s03** confirmed that every Prover check passed and the reasoning landed.

Fixed after it:
- **Number keys:** 1–9 press the buttons of the desk or lectern you stand at, and Enter presses CHECK, so no aiming is needed and keyboard-only players can play. The title card lists them with the arrow and PageUp/PageDown keys.
- **Tilt:** a PageUp/PageDown tap tilts a small, fixed step.
- **Slow frames:** frames up to 0.5 s keep full speed.
- **The Machine's gate caption:** it no longer contradicts the objective.
- **The Triangle's column of light:** it is brighter.
- **The Prover:**
  - after the closing cards, NEXT sends you back to the desk, where the verdict table can be read
  - the caption that covered the board's line about card 47 is gone
  - the plaque's direction is clearer
