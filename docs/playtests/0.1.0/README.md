# Playtest of 0.1.0

Four AI playtesters ([playtester](https://github.com/Preponderous-Software/playtester), x11 driver, Chromium in software rendering) played commit 56193bd (all five rooms) on 2026-11-15. Profile: `tools/playtest/tangle.json`.

| Session | Goal | Outcome | Fun |
| --- | --- | --- | --- |
| s01 | A brand-new player: the title, the hall, the Triangle and the Machine | partial (Triangle solved) | 3/5 |
| s02 | The Screen and the Staircase | achieved | 3/5 |
| s03 | The List, as a player who has never heard of Cantor | achieved | 4/5 |
| s04 | Graphics and layout hunt in every room | partial | 2/5 |

`summary.md` is the aggregated report (32 findings: 0 blocker, 5 major, 17 minor, 10 polish). Each session directory holds its `report.json`, `findings.jsonl`, the game's probe `events.jsonl`, and the screenshots its findings cite. Local paths in the reports have been shortened to `.` (the game's checkout) and `playtest-run1` (the run directory).

The machine was heavily loaded during the run, so the game ran at a few frames a second. Reports of input lag and overshooting held keys come from that, not from the game.

## What was fixed after this run

- **Doorways snagged the player on the frame** (major). Walking into a doorway near its edge now drifts you toward the middle (`walk.doorAssist`, with a test).
- **The liar sentence refused CAN'T BE EITHER with a self-contradicting message** (major). It now says to try TRUE and FALSE first and see where each leads; the button prompts say "answer TRUE" and so on, and each answer's feedback also shows as a caption, since the board is out of view while you aim.
- **Room detection** (two majors). The Machine room's far edge counted as the Screen room, and the balcony's "you're up high" trigger fired on the stairs. Both now check the room.
- **The staircase showed a blank wall where the HUD promised the door.** Every loop of the stairwell now has the doorway, with the small room behind it.
- **Black gaps** in the thickness of two doorways (stairs to vestibule, vestibule to the Screen room) are filled.
- **The List's diagonal hint came too late.** It lights after the second CHECK, and the instruction plaque moved to the wall on your left as you come in.
- **The Triangle** accepts a slightly wider spot (0.5 m), and its debrief waits longer for you to step aside.
- **Smaller:** "NEXT Next:" in the objective, left and right swapped in the Screen room's directions, the self-reference caption shown longer, the Machine's rules plaque overlapping the word screen, and the List debrief's wording.
