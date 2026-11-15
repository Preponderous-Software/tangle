# Playtest summary: playtest-run3

3 sessions, build tangle 0.2.0 (39a5be0), tangle 0.2.0 (dcac3e3), generated 2026-11-15 13:18.

**Findings:** 16 reports in 15 groups -- 0 blocker, 1 major, 7 minor, 8 polish.

## Outcomes

| Session | Goal | Outcome | Fun | Minutes | Objectives | Deaths | Findings | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s01 | Confirmation test after fixes. Play from the very beginning as a brand-new player who has never heard of Godel, Escher, Bach: the title card, the hall, the Triangle and the Machine. Check specifically: (1) does walking and turning keep its speed (hold w for a few seconds and compare distance with what you expect at 2.6 m/s); (2) if you can't find the Triangle's spot, does the hint's ring of light (with a glowing column above it) show up where the caption says; (3) after solving the Triangle, do you get to watch it break before the card appears, and does the NEXT line move on; (4) can you read the button labels on the Machine's desk while aiming at the buttons. Report anything still confusing. | achieved | 4 | 20.5 | 1 | 0 | 6 | All four fixes hold up: the hint ring shows where the caption says, the Triangle breaks on screen before the card, NEXT moves on, and the Machine labels are readable while aiming, with a great preview prompt (MIU -> MIUIU). Movement speed was right for most of the run but ran at ~60% early on, so it still seems tied to frame rate. The Machine's timed gate gives a false caption and a NEXT that disagrees with the caption, and keyboard pitch steps are too coarse to aim at a button. |
| s02 | Confirmation test after fixes. Start with --rooms all (the first four rooms count as solved; you stand in the small room outside the stairs). Solve the List, then the Prover, as someone who has never heard of Cantor or Godel. Check specifically: (1) can you read every lectern's and desk's button labels while aiming at the buttons; (2) after the List is won, does the board's story (the gold diagonal, row n differs at tile n) agree with its side notes; (3) does the List's debrief tell you clearly where the last door is, and can you walk through that door without snagging on the shelves; (4) in the Prover, can you read the plaque, the board and the questions from where you stand, and after the closing cards does the game point you to the board's verdict table. Report anything still confusing. | partial | 3 | 20.8 | 0 | 0 | 5 | The List's teaching is good. 'Differs at tile N' notes, a 'row 913 starts like yours' tease and a gold diagonal after a win walk a beginner toward Cantor's trick, and the desk labels are readable while aiming (check 1 passes for the List desk). Under software rendering, though, setting one switch takes a minute or two because pitch and strafe steps are huge and some key taps are dropped. I won only round 1 of the List, so checks 2-4 (side notes after the win, the debrief and the Prover door, and the Prover) could not be confirmed this run. Wandering onto the endless stairs from the vestibule cost several more minutes. |
| s03 | Confirmation test after fixes. Start with --rooms prover (the first five rooms count as solved; you stand in the List facing the Prover's door). Go through it and solve the Prover as someone who has never heard of Godel. The number keys 1-9 press the buttons of the desk or lectern you stand at, so you don't need to aim at small buttons. Check specifically: (1) can you read the Prover's plaque, its board and the questions from where you stand to use them; (2) can you read the lectern's and desk's button labels while looking at the buttons; (3) after the closing cards, does the game point you to the board's verdict table, and can you read it; (4) did you understand why card 81 is true but can't be proved. Report anything still confusing. | achieved | 4 | 9.6 | 1 | 0 | 5 | All four confirmation checks pass: the plaque, board and questions are readable from where you use them, desk and lectern labels are readable (front and top), the number keys 1-4 / 1-3 work reliably, and after the closing cards the NEXT line points you back to the board, whose verdict table is clear once you stand at the desk. The Prover now teaches 'true but unprovable' cleanly through the 47-vs-81 comparison; remaining issues are small: 'Turn round' from the lectern leaves the table too far to read, and a caption briefly covers the card-47 verdict line. |

## Answers

Each agent's own words, verbatim from its report; a missing answer is listed under problems.

### Q1. In your own words, what is a strange loop, and what did each room you played show about it?

- **s01:** A path that keeps going forward (or up) and still ends up back where it started. The Triangle: three beams that each turn a corner and seem to close into a loop, but only from one spot; step aside and it is an open bent bar, so the loop was a trick of viewpoint. The Machine: a word (MI) changed only by fixed rules; working inside the rules you keep making new words, and the game hints you need to step outside (the balcony) to see the machine as a whole. I did not finish the Machine, so I can't say what the balcony board shows.
- **s02:** From what I played, a strange loop is something that ends up back where it started or talks about itself, like a list that claims to hold everything until you make a row from the list itself that can't be in it. The List showed this: by making my row differ from row 1 at tile 1, row 2 at tile 2 and so on (the gold diagonal), it differed from every row, even after the librarian added it, which kept happening round after round. The staircase I fell onto by accident kept returning to the same landing ('C landing - level with the door') while saying I was going up or down. I did not reach the Prover, so I can't say what it shows.
- **s03:** A strange loop is when you go up or out through levels of something and end up back where you started, so a thing ends up referring to or containing itself. I only played the Prover: a card that, through its own number, talks about itself ('the Prover can't prove card 81'). Feeding it in, the Prover searches forever, just like for the false card 47; but from outside you can reason that if it were ever proved the Prover would have proved something false, so it never is, which makes what the card says true. So a system that talks about itself has a true sentence it can never prove. The closing card linked this to the other rooms (triangle, machine, screen, stairs, list) and to the idea that 'I' is such a loop.

### Q2. Which moment was the most confusing, and why?

- **s01:** In the Machine: the gate opened and the caption said I had been working inside the rules before I had pressed anything, and then after my first press the caption said 'keep going: can you reach MU?' while NEXT said to climb the ramp. I didn't know which to follow. Also aiming at a button with PageUp/PageDown was impossible because each step jumps ~16 degrees.
- **s02:** Getting dropped onto the endless staircase from the vestibule when I meant to head down the List corridor. The stairs' view was a dark wall or repeating flights, and the prompt said '0.7 m below the door, going down: turn round to climb', so I couldn't tell which way led out. Second: aiming at a single tile switch, because each key tap moved the view or my position by about a whole tile.
- **s03:** After the closing cards: the NEXT line says to turn round and look at the board, but from the lectern the verdict table is a tiny angled smudge; I had to walk back to the desk to read it. Second: right after feeding card 47 a caption covered the board's explanation of why 47 will never be proved, which is exactly the line you need to reason about card 81. Neither stopped me.

### Q3. Did anything look broken on screen? Describe each problem, where you were and which way you were facing.

- **s01:** In the hall right after Begin, facing the welcome plaque (north), a black empty bar sat at the top centre and hid a word of the NEXT line for a few seconds. Otherwise nothing looked broken; the Triangle closing view from the ring still shows a small gap at one corner when standing at the ring's edge, which is expected.
- **s02:** In the vestibule on the first frame after Begin, facing south down the List corridor (yaw -90), an empty black bar sat at top centre and covered part of the NEXT box. On the stairs, facing a wall, the whole view was flat dark purple with only the crosshair and the prompt, which looked like I was stuck in a void. Nothing else looked broken. List board text was small at 9 m but readable up close.
- **s03:** Nothing truly broken. In the Prover room at the desk, looking up at the board just after feeding card 47, the subtitle caption overlapped the board's verdict text. At the lectern on the left-hand wall, facing the questions board, the top-left NEXT box covered the board's 'ABOUT CARD 81' header. Once, walking into the plaque wall at an angle near the room entrance (facing roughly east/back toward the door), the plaque's text filled the whole screen in huge blurry letters, which is just being too close. Movement felt laggy and overshot at the low frame rate.

## Findings

### 1. [major] List desk: aiming at individual tile switches takes 1-2 minutes per tile at the software-render frame rate

- **Category:** perf; **reported by** 1 agent(s): s02
- **Detail:** Rendering ran at a few frames a second. Page Up/Page Down taps change pitch by about 15-17 degrees each (one frame of turning), so the crosshair jumps from the desk front past the switches. Strafing taps move 0.4-1.2 m, about one to two tiles. Strafing also drifts forward or back because the view is not square to the desk, so the crosshair falls off the switch row. Very short key holds (under about 0.1 s) and some single 'e' taps were dropped entirely (tile 5 needed 'pt hold e 0.2'). Setting 3 tiles and pressing CHECK took about 8 minutes of wall time. The whole List could not be finished in the 30-minute budget, and the Prover was never reached. A pitch or turn rate capped per frame, or one switch per key (1-8 number keys), would help.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir . --rooms all; walk to the List desk; pt key Next; pt state (pitchDeg jumps 0 -> 17.2 -> 34.4); pt hold a 0.15 repeatedly; watch prompt skip tiles; pt key e sometimes leaves list.guess unchanged
- **Screenshots:** [l7.png](s02/shots/l7.png)

### 2. [minor] After the closing cards, 'Turn round' from the lectern shows the verdict table too small and angled to read

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** The NEXT line says 'Every loop found. Turn round: the Prover's board shows why card 81 is true.' Turning round at the lectern (about 5 m from the board, well off its axis) shows the new TRUE, UNPROVED stamp clearly, but the verdict table (card / the Prover / true?) and the text under it are tiny, foreshortened smudges. Walking back to stand at the desk in front of the board makes everything perfectly readable (see verdict_table_readable.png). Expected: the hint to say 'walk back to the desk' or the table to be larger, since a player who only turns round may conclude it is unreadable.
- **Repro:** pt start --rooms prover; feed 12, 47, set number to 81, feed 81; answer NO then TRUE at the lectern; Return twice; pt face 133; pt key Prior; pt shot
- **Screenshots:** [verdict_from_lectern.png](s03/shots/verdict_from_lectern.png)

### 3. [minor] Caption box covers the board's verdict line for card 47 when viewed from the desk

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** Right after feeding card 47, the caption 'Now card 81. Its number can be changed with the button on the right of the desk.' sits on top of the board's green/gold line 'Still searching, and it always will be: 2 + 2 = 5 is false, and the Prover never proves anything false.', hiding half of it while you look up at the board from the desk. That sentence is a key step toward understanding card 81.
- **Repro:** pt start --rooms prover; walk to the desk; pt key 1; pt key Prior Prior Prior; pt key 2; pt wait 8; pt shot
- **Screenshots:** [caption_over_board.png](s03/shots/caption_over_board.png)

### 4. [minor] Keyboard pitch (PageUp/PageDown) too coarse to aim at Machine buttons

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** One tap of Next changes pitch by ~16 deg (6.9 -> 22.9); a 0.1s hold of Prior moved 15 deg. At 2 m from the desk 6.9 deg aims above the buttons and 22.9 below the desk edge, so I could not land on a button with keys alone and had to capture the mouse. A keyboard-only player would be stuck.
- **Repro:** stand ~2 m in front of the Machine desk; pt key Next / pt hold Prior 0.1 and read pitchDeg and prompt
- **Screenshots:** [labels.png](s01/shots/labels.png)

### 5. [minor] Machine gate opens on a timer, caption claims the player has been 'working inside the rules' before any button press

- **Category:** text; **reported by** 1 agent(s): s01
- **Detail:** About 2 minutes after entering the Machine room, without having pressed a single button, the caption said 'You've been working inside the machine's rules. The gate has opened...' and NEXT changed to 'Climb the ramp to the balcony and read the board.' Then pressing my first button gave 'That's how it works. Keep going: can you reach MU?' while NEXT still said climb the ramp, so two different instructions are on screen at once. Expected: the gate/caption to follow actual button presses, or NEXT and caption to agree.
- **Repro:** enter Machine room; walk around the desk ~2 min without pressing e; then aim at button 1 and press e
- **Screenshots:** [conflict.png](s01/shots/conflict.png)

### 6. [minor] Movement keeps going for a while after a key is released at low fps; strafing overshoots

- **Category:** perf; **reported by** 1 agent(s): s03
- **Detail:** With the software renderer, a held strafe/walk key seems to keep acting after release (positions in state kept changing seconds later): pt hold d 3 moved ~5 m, and a following pt hold a 1 still moved further in the d direction before reversing. Positioning in front of the board took several tries. Probably a harness/low-fps artefact rather than a game bug, but worth knowing.
- **Repro:** in the Prover room: pt hold d 3; pt hold a 1; pt state; pt wait 2; pt state
- **Screenshots:** [board_end2.png](s03/shots/board_end2.png)

### 7. [minor] Vestibule: the staircase door sits right next to the List corridor; walking toward 'the door' drops you onto the endless stairs

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** From the start spot the list corridor is straight ahead, but the staircase door is 1.3 m away and nearer. Heading for a door put me on the stairs ('on the stairs - 0.7 m below the door - going down: turn round to climb'). The stair view is a dark wall or repeating flights, so getting back out took several minutes. The vestibule's two openings could be told apart better, for example with a floor arrow or a sign on the List corridor.
- **Repro:** pt start ... --rooms all; pt key Return; pt walkto door
- **Screenshots:** [s1.png](s02/shots/s1.png)

### 8. [minor] Walk/turn speed ran at ~60% of spec early in the session, full speed later

- **Category:** perf; **reported by** 1 agent(s): s01
- **Detail:** Early in the hall: hold w 2.0s moved 3.18 m (expected 5.2 m), hold s 4.0s moved 6.42 m (1.6 m/s), hold Left 3.0s turned 180 deg (60 deg/s vs 103). tick/wallTime was ~60 tps throughout, so it was slow in real time. Later in the session it was correct: hold w 3.0s moved 7.81 m (2.6 m/s), hold w 1.8s moved 4.82 m (2.68 m/s), hold Right 0.8s turned 82.5 deg. Looks frame-rate dependent (slow when the machine is busy). Note: pt start warned the launcher was built before HEAD 39a5be0, so this build may not include the latest fix.
- **Repro:** pt start ...; pt key Return; hold w 2.0 / hold Left 3.0 in the hall right after start and compare player x/z/yaw in pt state before and after
- **Screenshots:** [speed.png](s01/shots/speed.png)

### 9. [polish] Black empty bar at top centre of the hall on first entry, covering part of the NEXT line

- **Category:** bug, ux; **reported by** 2 agent(s): s01, s02
- **Also reported as:** "Empty black bar at top centre of the view on first entering WORLD"
- **Detail:** Right after Begin, a solid black rectangle (approx x 370-910, y 45-96) sat at the top of the view, hiding the word 'on' in the NEXT line ('take the door [on] the left'). It was gone a few seconds later. May be the caption box drawn under the test-software infobar.
- **Repro:** pt start; pt key Return; pt await WORLD; pt shot
- **Screenshots:** [hall0.png](s01/shots/hall0.png) [start.png](s02/shots/start.png)

### 10. [polish] Entering the Prover room it is easy to walk straight past the plaque to the desk

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** The caption says 'Read the plaque on your right', but the red carpet leads straight to the desk and the board; holding w from the List door carries you past the plaque (it ends up behind you at about +124 degrees). Once found, the plaque is readable from about 5 m.
- **Repro:** pt start --rooms prover; pt hold w 8; pt state
- **Screenshots:** [in2.png](s03/shots/in2.png)

### 11. [polish] List desk labels: readable while aiming (check 1 passes for the List desk)

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** Positive confirmation. Tile numbers 1-8 are printed on the back strip and on the desk front, and CHECK is labelled. All of them stayed legible with the crosshair on a switch, and the prompt 'E: tile 5: make it light' names the switch. The Prover lectern was not reached, so its labels were not checked.
- **Repro:** walk to the List desk, aim at tile 5
- **Screenshots:** [list_desk_labels.png](s02/shots/list_desk_labels.png)

### 12. [polish] List feedback after CHECK is clear and good for a beginner

- **Category:** text; **reported by** 1 agent(s): s02
- **Detail:** Positive. A first CHECK with one light tile marked the differing tile of each row in red and added 'differs at tile N' notes. It also showed 'row 913 ... starts just like yours' with the line 'Does yours differ later on? You'd have to check forever.' A winning row brought up 'Your row differs from every row in the list, even the ones you can't see', a gold diagonal and 'The librarian added your row at the top'. The round-2 diagonal I read off the board matched what flipping the diagonal predicts.
- **Repro:** set tile 5 light, CHECK; then set the flipped diagonal, CHECK
- **Screenshots:** [list_round2.png](s02/shots/list_round2.png)

### 13. [polish] Objective HUD box hides the questions board's 'ABOUT CARD 81 - 1 of 2' header when standing at the lectern

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** Standing at the lectern looking straight at the questions board, the top-left NEXT box overlaps the board's small header. The question itself is fully readable; only the header/progress counter is hidden. Also the line 'Press your answer on the lectern.' is small and faint compared with the rest.
- **Repro:** pt start --rooms prover; after feeding 81, face the left-hand wall and walk up to the lectern; pt shot
- **Screenshots:** [lect1.png](s03/shots/lect1.png)

### 14. [polish] Title card does not mention arrow keys to turn or PageUp/PageDown to look up/down

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** Title says walk WASD, look with mouse, use E. The keyboard turn/tilt keys that you need without a mouse capture are not mentioned anywhere on screen.
- **Repro:** pt start; pt shot title
- **Screenshots:** [title.png](s01/shots/title.png)

### 15. [polish] Triangle hint caption fades fast and the ring was behind me

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** The hint caption (tick 27873) disappeared from the screen within a few seconds while I faced a corner; the ring was behind me. It does match the caption: on the left as you come in, ~5-6 m in, by the bench. The 'glowing column' is a sparse vertical line of faint dots, easy to miss against the dark wall. A follow-up caption ('Stand inside the ring of light...') did appear later, which helped.
- **Repro:** enter Triangle room, wander without finding the spot ~75 s
- **Screenshots:** [hintok.png](s01/shots/hintok.png)

## Objective timings

Game seconds from the start of the world to each objective (event tick / the game's ticks per second, from events.jsonl). Game time, not wall time: with many sessions on one machine a world can run slower than real time, and wall-clock timings would mostly measure the machine.

| # | Objective | s01 | s02 | s03 | min | median | max |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Solve The Prover | - | - | 404.3 | 404.3 | 404.3 | 404.3 |
| 0 | Solve The Triangle | 672.1 | - | - | 672.1 | 672.1 | 672.1 |

