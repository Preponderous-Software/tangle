# Playtest summary: playtest-run2

4 sessions, build tangle 0.2.0 (5b003a1), generated 2026-11-15 12:05.

**Findings:** 27 reports in 26 groups -- 0 blocker, 1 major, 17 minor, 9 polish.

## Outcomes

| Session | Goal | Outcome | Fun | Minutes | Objectives | Deaths | Findings | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s01 | The Prover (Room 6, the last room). Start with --rooms prover (the first five rooms count as solved and you stand in the List facing the Prover's door); go through it. Play as someone who has never heard of Godel: feed the cards to the Prover, make card 81 talk about itself, and answer the questions. Say whether you understood WHY card 81 is true but can't be proved, which caption or board made it click (or didn't), and whether the two closing cards felt like a satisfying ending. | achieved | 4 | 12.8 | 1 | 0 | 6 | The Prover works as a lesson: the sequence (2+2=4 gets PROVED, 2+2=5 counts forever, card 81 looks exactly like 47 to the machine) plus the 'Suppose it did...' and 'That was the liar in the Screen room. This one isn't a paradox' wrong-answer captions taught me why card 81 is true and unprovable without any prior knowledge. The strongest explainer, the after-solve table showing 47 and 81 behave the same yet only 81 is true, appears behind the player after the closing cards, in tiny text; move it earlier or point to it. The two closing cards feel like a fitting, quiet ending ('Strange loops' recap ties all six rooms together), though 'Carry on' as the final button is a little flat for the last line of the game. |
| s02 | Play from the very beginning as a brand-new player who has never heard of Godel, Escher, Bach: the title card, the hall, then the Triangle and the Machine (climb to the balcony when the gate opens). Solve what you can. Note every moment of confusion, any doorway you got stuck in, and whether the captions and plaques told you what to do. | achieved | 3 | 24 | 2 | 0 | 8 | The writing is the star: the welcome plaque, the room plaques, the button prompts and both debriefs explain strange loops and the MU puzzle clearly to someone with no background, and the moment the triangle snapped shut was a real 'oh!'. The Triangle's search is too fussy, though. Almost-closed views aren't accepted, the 'getting warmer' feedback is faint, and the hint points to the door when the ring is by the bench. In the Machine, the balcony board's explanation is unreadable from where you stand, and the desk buttons are awkward to reach from the end of the desk. |
| s03 | The end game. Start with --rooms all (the first four rooms count as solved and you stand in the small room outside the stairs). Solve the List (through the door on your left and down the corridor), then find the door it opens and solve the Prover. Note whether you found your way between the rooms, whether the List's debrief told you where to go next, and whether the Prover felt like the right finale after the List. | achieved | 4 | 20.8 | 2 | 0 | 6 | The end game works and lands: the List teaches the diagonal by having you do it twice, its debrief names Godel and points onward, and the Prover's card 81 is clearly the same move turned on a proof machine, so it feels like the right finale and the closing 'Strange loops.' card ties all six rooms together. Wayfinding was fine (the corridor and the lit 'The Prover' plaque are visible), though the List debrief's 'right-hand wall' needs 'as you come in'. The weakest spots are the List's post-win board, which mixes first-mismatch notes with the diagonal story, and the card-81 number picker, which is solved by pressing until it says 81. |
| s04 | Graphics and layout hunt in the List and the Prover rooms and the doorway between them (start with --rooms prover). Look in every direction, up and down, and walk along every wall. Screenshot and describe anything that looks wrong: gaps or seams, flicker, surfaces fighting, unreadable or overlapping text, text you can't read from where you'd stand to use it, walls you can see through or walk through, places you get stuck. | partial | 3 | 13.7 | 0 | 0 | 7 | Geometry in the List, the Prover and the doorway between them held up. Walls, ceilings and the door jambs showed no gaps, z-fighting or walk-through, and sliding along the wall into the doorway worked smoothly. The real problem is text legibility: the Prover's plaque, its questions board subline, the main board's output column and the List board's header and explanation are all too small to read from where a player stands to use them, and the lectern buttons have no visible labels. Bigger fonts, or plaques mounted at eye height, would fix most of it. |

## Answers

Each agent's own words, verbatim from its report; a missing answer is listed under problems.

### Q1. In your own words, what is a strange loop, and what did each room you played show about it?

- **s01:** A strange loop is something that, by going up through levels (a machine talking about the things it handles, a sentence talking about sentences), comes back round to talk about itself. I only played the Prover. It showed a proving machine that is honest (never proves anything false) being handed a card that, through its own number, says 'the Prover can't prove card 81'. Because the card talks about itself, the Prover can never prove it (proving it would make it false), and that means what it says is true. So there is a true statement the machine can never reach, and you can only see that from outside the machine. The closing card says the other rooms show the same shape: a triangle that closes on itself, stairs that return, a list that misses a row built from itself.
- **s02:** A strange loop is a path that keeps moving forward (or up, or through steps) and still ends up back where it started, often by something describing or containing itself. The Triangle showed one you can see: three beams that seem to go round and close into an impossible triangle, but only from one exact spot; step aside and it's an open bent bar, so the loop was a trick of viewpoint. The Machine showed it with rules: inside you can press buttons forever (MI, MIU, MIUIU...) and never reach MU, and the rules can't tell you to stop. Only by stepping outside (the balcony) and noticing that the number of I's is never a multiple of 3 do you see that MU is impossible. The debrief tied this to Godel: arithmetic can describe its own rules, the system talks about itself, and that self-reference is the loop.
- **s03:** A strange loop is a path that keeps climbing up levels and still ends where it started, often because something ends up referring to itself. The List: the librarian claims to list every endless row, but by flipping row 1's tile 1, row 2's tile 2 and so on I built a row out of the list itself that differs from every row in it; when the librarian added it, the same trick beat the new list, so no list can hold every row. The Prover: card 81 says 'the Prover can't prove card 81'. If the honest Prover proved it, it would have proved something false, so it never can, and that is exactly what the card says, so the card is true but unprovable. The final card ties it together: the Prover's sentence is made from its own numbering the way my row was made from the list it escapes.
- **s04:** From what I saw, a strange loop is when something ends up referring back to itself: a sentence that talks about itself, or a system that makes a statement about its own powers. The List room (already solved in this start) shows a grid of rows with 'your row' built by flipping each row's diagonal tile, so your row can't be anywhere on the list (a list that can't contain everything). The Prover room sets up cards with numbers, with card 81 reading 'The Prover can't prove card 12', and a board asking you to 'Make card 81 talk about itself', so presumably card 81 ends up saying 'the Prover can't prove me'. I did not feed any cards, so I can't say how the room pays it off.

### Q2. Which moment was the most confusing, and why?

- **s01:** Question 2, 'So is card 81 true?'. My first instinct was CAN'T BE EITHER, because a sentence saying something about itself sounds like the liar paradox. The feedback ('That was the liar in the Screen room. This one isn't a paradox: you know it can't be proved, and that's all it says') cleared it up right away. Smaller confusions: the ITS NUMBER button only cycles 12 -> 47 -> 81, which is fine but means 'set its number' is guessing, not reasoning; and the best explainer (the table showing 47 and 81 both 'search forever' but only 81 is true) appeared only after the game was over, behind me.
- **s02:** Finding the spot in the Triangle room. I got the beams to look closed from a couple of places and nothing happened. The only feedback was a faint ring round the crosshair (I could not rely on the tone). The hint said the ring of light was near the door I came in, so I searched there, but it was by the bench in the far corner and on the floor, out of view until I tilted down. Second most confusing: in the Machine, the gate opened on its own while I was still fiddling with the desk, and the board I was told to read upstairs was too small to read.
- **s03:** Right after winning the List's second round: the board drew a gold diagonal and a caption saying 'row n differs at tile n', but also red boxes and notes saying rows differ at tile 1, 2, 1, 4, 1, 2, 1, 3. I had to stop and work out that the notes were the first mismatch, not the diagonal. A smaller one: the List debrief said the Prover door was in 'this room's right-hand wall' while I was facing the question wall, so 'right' pointed the wrong way until the NEXT line added 'as you come in'.
- **s04:** Arriving at the Prover lectern. Its three buttons have no labels you can see from where you stand, and the questions board's second line is too small to read, so I could not tell what the lectern was for or what each button meant. Input lag also made it hard to aim at things.

### Q3. Did anything look broken on screen? Describe each problem, where you were and which way you were facing.

- **s01:** 1) In the List, facing the Prover door (yaw 0) right after Continue, a solid black rectangle covered the top centre of the screen and the end of the NEXT text for about a second. 2) In the Prover, at the desk and at the questions lectern (left-hand wall, facing west/yaw about -100), the NEXT banner covered the top-left of the boards (Card 12's heading; the question title). 3) After solving, at the lectern facing the TRUE button, the crosshair still went gold with 'E: answer TRUE' although the buttons were dark and E did nothing. 4) Not visual but felt: walking and turning were about a quarter of normal speed at the low frame rate.
- **s02:** 1) At launch, a Chromium 'Page Unresponsive' dialog sat over the 'Loading Tangle' card; clicking Wait fixed it. 2) In the Triangle room, standing near the side wall at about x=-10.1, z=3.8, turning to face the wall made the screen show only a flat blue-grey wall with no floor at a level pitch; I was just very close to the wall. Tilting down at about +8 to +25 pitch made the view look rolled and skewed (t14/t16 screenshots), probably the wide field of view close to the wall rather than a bug. 3) Nothing else looked broken: text, beams and the debrief cards all rendered cleanly, apart from the balcony board's small text, which is too low-resolution to read at a slant.
- **s03:** 1) In the vestibule outside the stairs, facing south down the List corridor, just after Continue: a solid black box at top centre clipped the NEXT objective text; it went away after a few seconds. 2) In the List room, facing the librarian's list after the win: the mixed red first-mismatch marks next to the gold diagonal looked like a mistake. 3) In the List room near the Prover door (west side), facing the door at an angle: I stuck against the bookshelf next to the door. 4) In the Prover room, facing the question lectern: the caption box covered the lectern's button labels. Nothing crashed. The game ran at a few frames a second, so turning and tilting by holding keys overshot often.
- **s04:** (1) The first frame after Begin, in the List facing the Prover door: a black rectangle across the top centre, gone two seconds later. (2) Prover room plaque by the card cabinet (turn right on entry): body text illegible even from 2m, and a jagged broken border. (3) Prover questions board on the left wall above the lectern: the subline is unreadable from the lectern. (4) Prover main board, facing it from the lectern or the door: the header and output column are too small. (5) List board, facing it from the Prover door side: grid crammed into the left third with tiny text. I found no wall gaps, z-fighting, see-through or walk-through walls, and I never got stuck at the doorway; walking into the wall beside the Prover door blocked me cleanly and sliding along it took me through the door.

## Findings

### 1. [major] Walking and turning run at about a quarter of their stated speed at low frame rates, though game ticks advance at 60 a second

- **Category:** perf; **reported by** 1 agent(s): s01
- **Detail:** Ticks advanced at a steady ~60 a second (tick 6115 -> 37243 over 518 s wall time), but holding w for 6 s moved 3.4 m (expected ~15 m at 2.6 m/s) and holding Left for 2.9 s turned 72 degrees (expected ~300 at 103 deg/s). On a slow machine every walk and turn takes about four times as long as it should. Because of this, pt face reported ok:false after 8 turns with yaw unchanged, and pt walkto plaque timed out without moving. Expected: movement scaled by elapsed time, not by rendered frames.
- **Repro:** pt start ... --rooms prover; Return; pt hold w 6; compare pt state player x/z before and after; pt hold Left 2.9; compare yawDeg
- **Screenshots:** [faceslow.png](s01/shots/faceslow.png)

### 2. [minor] Solid black rectangle at top centre clips the NEXT objective line on entering the world

- **Category:** bug, ux; **reported by** 2 agent(s): s01, s03
- **Also reported as:** "Black empty rectangle flashes at the top centre over the NEXT banner right after Continue"
- **Detail:** Just after pressing Continue on the title, a black box (about x370-910, y45-96) sat at the top centre of the view and cut the objective text off at 'through the Screen room's l...'. It was gone a few seconds later. Expected: no empty overlay; the objective line fully readable.
- **Repro:** pt start ... --rooms all; pt key Return; pt await WORLD; pt shot
- **Screenshots:** [blackbar.png](s03/shots/blackbar.png) [w1.png](s01/shots/w1.png)

### 3. [minor] Balcony board explanation is too small to read from the balcony at the angle you have to stand at

- **Category:** text; **reported by** 1 agent(s): s02
- **Detail:** The board is on a side wall at the end of the narrow balcony, so you see it at a slant. The headline and the 'MU can't be made' sign are legible, but the body text (the argument about counting I's) blurs into lines at about 2 m. The debrief card explained it clearly afterwards, but the board, which the objective tells you to read, didn't.
- **Repro:** pt start ...; solve or wait out the Machine until the gate opens; climb the ramp; face the balcony board
- **Screenshots:** [board-small.png](s02/shots/board-small.png)

### 4. [minor] Chromium 'Page Unresponsive' dialog over the loading screen at launch

- **Category:** perf; **reported by** 1 agent(s): s02
- **Detail:** The first screenshot showed the 'Page Unresponsive: Exit page / Wait' dialog over 'Loading Tangle 1.0 of 1.0 MB', while the probe already said TITLE. Clicking Wait brought up the title card normally. A real player could click Exit page.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt await TITLE; pt shot
- **Screenshots:** [unresponsive.png](s02/shots/unresponsive.png)

### 5. [minor] Got stuck on the Triangle door frame from the hall; movement felt very delayed

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** pt walkto door stopped 1.2 m from the triangle door ('stuck: not getting closer'), against the jamb at a slight angle. A further 2 s hold of w didn't move me; a later 4 s hold did, and then a press of s still carried me forward into the room, as if input was being applied late. Turning with pt face often undershot by 10 to 35 degrees. Some of this is the slow software renderer on a busy machine, but the door frame catching you at a slight angle is real.
- **Repro:** pt start ...; key Return; face -98; walkto door
- **Screenshots:** [stuck1.png](s02/shots/stuck1.png)

### 6. [minor] Heavy input lag: movement and turns were applied many seconds after the keys

- **Category:** perf; **reported by** 1 agent(s): s04
- **Detail:** With this many sessions sharing the software renderer, held keys were processed long after release. 'pt face' often ended 20-75 degrees off, 'pt walkto' timed out without moving, and state.json showed the player still in the List while the screenshot showed the Prover doorway. Ticks ran near 60/s, so frame rate (not game time) seems to be the bottleneck. I could not fully cover every wall in the time budget because of this.
- **Repro:** pt start --rooms prover; Return; pt face 90; pt hold w 2; compare pt state with pt shot
- **Screenshots:** [door3.png](s04/shots/door3.png)

### 7. [minor] Lectern still shows gold crosshair and 'E: answer TRUE' after the Prover is solved, but E does nothing

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** After both questions and both closing cards, the lectern buttons go dark, yet aiming at TRUE still turns the crosshair gold with the prompt 'E: answer TRUE'. Pressing E does nothing and no event appears. Expected: no prompt, or a short line saying it is already answered.
- **Repro:** finish the Prover; Return Return; stay at the lectern aimed at TRUE; pt key e
- **Screenshots:** [stalelectern.png](s01/shots/stalelectern.png)

### 8. [minor] List debrief says the Prover door is 'in this room's right-hand wall' without saying from where

- **Category:** text; **reported by** 1 agent(s): s03
- **Detail:** The debrief card ends 'One room is left: its door, in this room's right-hand wall, has opened.' When it appears you are at the answer lectern facing the question wall, and from there the Prover door is behind you, not on your right. The NEXT line that follows adds 'as you come in', which fixed it for me, and the door has a lit plaque saying 'The Prover' that is easy to spot once you turn round. Expected: the debrief uses the same wording as the objective ('on your right as you came in', or 'beside the bookshelves').
- **Repro:** solve the List by answering NONE at the lectern; read the debrief card
- **Screenshots:** [debrief_list.png](s03/shots/debrief_list.png)

### 9. [minor] List's post-win board labels each row with its FIRST mismatch, contradicting the 'row n differs at tile n' caption

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** After the second CHECK wins, the librarian's list shows red boxes and right-hand notes 'differs at tile 1 / 2 / 1 / 4 / 1 / 2 / 1 / 3' (the first tile where each row differs from mine), while the gold diagonal and the line under the board say 'row 1 differs at tile 1, row 2 at tile 2: row n differs at tile n'. Two explanations are drawn at once, and the numbers for rows 3-8 disagree with the diagonal idea the debrief then teaches. A newcomer reading the numbers would not see why the diagonal matters. Expected: annotate the diagonal tile (row n: differs at tile n), or drop the first-mismatch marks.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir . --rooms all; walk down the List corridor; set YOUR ROW to the flipped diagonal, CHECK; repeat for round 2, CHECK; step back and look at the board
- **Screenshots:** [list_mixed_marks.png](s03/shots/list_mixed_marks.png)

### 10. [minor] Machine desk: from the end of the desk the far buttons (→ and ↶) are out of reach and the word screen is out of view

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** Walking to the desk (pt walkto button) leaves you at its end near rule 1. Rules 1 to 4 can be aimed by tilting the view, but the → and ↶ buttons are about 2.6 m away, so nothing is prompted. From there the word screen is behind your left shoulder, so you can't see what a press did without turning. I expected to stand in front of the desk facing the screen.
- **Repro:** pt start ...; enter the Machine; pt walkto button; tilt up and down along the desk and watch the prompt
- **Screenshots:** [m10.png](s02/shots/m10.png)

### 11. [minor] NEXT objective banner covers the top-left of the Prover board and the question board when the player stands close

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** At the questions lectern the NEXT banner sits over 'Could the Prover ever stamp card 81 PROVED?' and over the 'About card 81 · 1 of 2' header; on the main board it covers Card 12's heading when standing at the desk. Expected: the boards to stay readable from where you press their buttons, or the banner to fade while a board fills the view.
- **Repro:** pt start ... --rooms prover; walk to the lectern on the left-hand wall (prover questions) and look up at the board
- **Screenshots:** [overlap.png](s01/shots/overlap.png)

### 12. [minor] Prover board's best explainer (47 vs 81 table) appears only after the closing cards, behind the player, in tiny text

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** After the last answer the main board shows a summary table: card 12 'proves it' / true yes; 47 'searches forever' / no; 81 'searches forever' / YES, with a line starting 'To the Prover, cards 47 and 81 look the same. Only from outside you can see...'. This was the moment the idea really clicked for me: the Prover behaves identically on a false card and on card 81, but one of them is true. But it appears only after both debrief cards, while the player stands at the lectern on the opposite wall facing away; nothing prompts them to turn around. The key line is the smallest text on the board and was hard to read even ~3 m away at 1280x720. Expected: the table to be shown (or pointed to by a caption) before or during the questions, with the 'look the same' line at the size of the other board captions.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir . --rooms prover; feed 12, 47, set ITS NUMBER to 81, feed 81; answer NO then TRUE at the lectern; Return twice; turn ~180 degrees to the board
- **Screenshots:** [board_table.png](s01/shots/board_table.png)

### 13. [minor] Prover lectern answer buttons have no label visible from the use position

- **Category:** ux; **reported by** 1 agent(s): s04
- **Detail:** Standing at the lectern (1.6m) and looking down at its three buttons, they are plain dark blocks with no text. Their meanings (YES/TRUE, NO/FALSE, ONE DAY/CAN'T BE EITHER) appear only in the probe; the only marks are tiny gold glyphs on the lectern's front face, which you can't see while aiming at the buttons. Questions were not unlocked yet, so labels may appear later, but nothing on screen said so.
- **Repro:** pt start --rooms prover; Return; walk to the lectern under the side-wall board 'Make card 81 talk about itself'; tilt down (Next) until the top is in view
- **Screenshots:** [f_lectern_unlabeled.png](s04/shots/f_lectern_unlabeled.png)

### 14. [minor] Prover main board header and output column too small to read from lectern or door

- **Category:** text; **reported by** 1 agent(s): s04
- **Detail:** From the lectern (~4-5m) and the doorway (~8m), card texts on the main board are fine, but the board header ('THE PROVER - it never proves anything false') and the right-hand output column ('Empty. Press a card on the desk in front of you to feed it in.') are tiny blurry text. They only become readable when standing at the desk directly in front. That output column is where the machine's results show, so it should read from a few metres away.
- **Repro:** pt start --rooms prover; Return; enter Prover; stand by the lectern and face the main board; pt shot
- **Screenshots:** [f_board_right_column.png](s04/shots/f_board_right_column.png)

### 15. [minor] Prover questions board second line unreadable from the lectern

- **Category:** text; **reported by** 1 agent(s): s04
- **Detail:** On the side-wall board above the lectern, the headline 'Make card 81 talk about itself.' reads at ~3m, but the 'ABOUT CARD 81' header and the second line (something like 'Then feed it to the Prover...') are thin, blurry text I could not reliably read from where you stand to use the lectern.
- **Repro:** pt start --rooms prover; Return; enter Prover; walk ~3m toward the lectern on the left wall; pt shot
- **Screenshots:** [f_questions_subline.png](s04/shots/f_questions_subline.png)

### 16. [minor] Prover room plaque 'A sentence about itself' body text is illegible even from ~2m

- **Category:** text; **reported by** 1 agent(s): s04
- **Detail:** The plaque in the corner right of the card cabinet is the one the game tells you to read on entry ('Read the plaque on your right'). From ~3m only the title reads; from ~2m (as close as is comfortable) the 6-7 body lines ('Feed the Prover a card and it tries every possible proof...', 'Every card has a number... Start with cards 12 and 47') are still low-res and partly unreadable. The black border also renders as a broken, jagged double line. Expected: body text sized so a player standing in front of it can read it.
- **Repro:** pt start --rooms prover; Return; walk through the Prover door, turn right ~120 deg, walk to the plaque by the card cabinet; pt shot
- **Screenshots:** [f_prover_plaque_near.png](s04/shots/f_prover_plaque_near.png)

### 17. [minor] Triangle hint says the ring of light is 'near the door you came in', but it is by the bench in the far corner, about 8 m from that door

- **Category:** text; **reported by** 1 agent(s): s02
- **Detail:** After about 4 minutes in the Triangle room the caption said 'Hint: a ring of light has appeared on the floor, near the door you came in. Stand in it and look at the triangle.' I searched by the triangle door and found nothing. The ring was beside the bench in the corner at about x=-12.2, z=5.2; the probe put the triangle door 8.1 m away. The ring is also on the floor, so at the default pitch you only see it if you tilt the view down or are already a few metres from it. I expected the hint to name the bench or the corner.
- **Repro:** pt start ...; key Return; walk into the Triangle room (west door); wander for about 4 min until the hint caption; look for the ring near the entrance door
- **Screenshots:** [tri-solved.png](s02/shots/tri-solved.png)

### 18. [minor] Triangle: views where the beams look closed are not accepted; the only feedback is a faint crosshair ring (and a tone you may not hear)

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** From x=-10.1, z=3.8 (about 1.5 m from the real spot) the triangle looked closed on screen and the crosshair ring glowed faintly, but nothing happened. It was solved only when I stood inside the floor ring and put the crosshair on the triangle. I took about 10 minutes of game time to solve it, most of it moving in small steps. A brighter 'getting warmer' cue, or a tolerance that matches what the eye accepts, would help, especially for players with no sound.
- **Repro:** pt start ...; go into the Triangle room; strafe left (a) from the doorway while facing the triangle until the beam ends overlap at about x=-10.1, z=3.8; face it
- **Screenshots:** [almost-closed.png](s02/shots/almost-closed.png)

### 19. [polish] Black rectangle over the top of the view on the first frame after Begin

- **Category:** bug; **reported by** 1 agent(s): s04
- **Detail:** In the first screenshot after pressing Return on the title (List room, facing the Prover door), a solid black rectangle covered x 370-910, y 45-95, hiding the end of the NEXT objective text and the 'A sentence about itself' sign. Two seconds later it was gone. Probably a leftover from the title card or a frame not yet drawn.
- **Repro:** pt start --rooms prover; pt await TITLE; pt key Return; pt await WORLD; pt shot immediately
- **Screenshots:** [w0.png](s04/shots/w0.png)

### 20. [polish] Bookshelves either side of the Prover door catch the player; easy to get wedged beside the door

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** Walking from the List's answer lectern toward the Prover door I slid along the left-hand bookshelf and stuck against it about 3 m from the door (x=-15.25 z=34.2). The opening between the shelves is narrow at a diagonal approach; I had to back up and line up square. pt walkto door also timed out at that spot.
- **Repro:** after solving the List, turn round from the answer lectern and hold w toward the Prover plaque
- **Screenshots:** [prover_found.png](s03/shots/prover_found.png)

### 21. [polish] Card 81's ITS NUMBER button cycles 12 -> 47 -> 81, so 'make it talk about itself' is two presses

- **Category:** balance; **reported by** 1 agent(s): s03
- **Detail:** The key step of the finale (pick card 81's own number) has only three choices, and they cycle in desk order, so pressing until something changes gets it with no thought. The board then says 'Card 81 now says... It talks about itself' and marks it ABOUT ITSELF, which is a good moment, but the player did not have to work it out. A small thought step (for example the choices including other numbers, or a prompt asking 'which number makes it about itself?') would make the click feel earned.
- **Repro:** in the Prover, feed 12 and 47; aim at ITS NUMBER and press e twice
- **Screenshots:** [w45.png](s03/shots/w45.png)

### 22. [polish] List board layout: grid packed into the left third, right two-thirds empty, explanation squeezed into tiny text

- **Category:** ux; **reported by** 1 agent(s): s04
- **Detail:** On the Librarian's List board, the 8x8 grid and 'your row' boxes take the left third; the rest is empty dark board. Meanwhile the header and the explanation beside 'your row' ('...tile n is the opposite of row n's tile n') are tiny and slanted. The grid and text could be made larger to fill the board.
- **Repro:** pt start --rooms prover; Return; turn to face the List's big board (yaw ~263 from spawn); pt shot
- **Screenshots:** [f_list_board_layout.png](s04/shots/f_list_board_layout.png)

### 23. [polish] NEXT box still says 'Walk sideways and watch it break' while you walk to the Machine

- **Category:** text; **reported by** 1 agent(s): s02
- **Detail:** After the Triangle debrief the NEXT box kept 'Walk sideways and watch it break. Then the Machine...' until I entered the Machine room, though that part was done.
- **Repro:** solve the Triangle; close the debrief; walk back into the hall
- **Screenshots:** [m1.png](s02/shots/m1.png)

### 24. [polish] Prover caption box covers the lectern's button labels

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** After answering question 1, the caption 'Right. If it proved card 81...' sits over the lectern's TRUE/FALSE/CAN'T BE EITHER labels at the bottom of the view while you are deciding question 2. I had to wait or tilt to read which button was which.
- **Repro:** answer NO to question 1 at the Prover lectern; step back one pace
- **Screenshots:** [w50.png](s03/shots/w50.png)

### 25. [polish] Question 1's hint 'Remember: the Prover never proves anything false' is small italic grey text, hard to read from the lectern distance

- **Category:** text; **reported by** 1 agent(s): s01
- **Detail:** This is the hint that unlocks question 1, but it is the dimmest line on the board, in small grey italics. From the lectern (about 2 m away) it was barely legible until I walked right up. The wrong-answer feedback ('Suppose it did...') was large and clear, so a player who misses the hint still learns, but only after guessing wrong.
- **Repro:** pt start ... --rooms prover; unlock the questions; stand at the lectern and look at the board
- **Screenshots:** [q1.png](s01/shots/q1.png)

### 26. [polish] Triangle debrief pops up as soon as you sidestep, covering the 'watch it break' moment

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** The objective says 'Walk sideways and watch it break', but after about a metre of strafing the debrief card covered the screen, so I never saw the triangle come apart. The card then says 'When you stepped aside, the triangle came apart'. I expected a short delay before the card.
- **Repro:** solve the Triangle; hold d for 1.5 s
- **Screenshots:** [t33.png](s02/shots/t33.png)

## Objective timings

Game seconds from the start of the world to each objective (event tick / the game's ticks per second, from events.jsonl). Game time, not wall time: with many sessions on one machine a world can run slower than real time, and wall-clock timings would mostly measure the machine.

| # | Objective | s01 | s02 | s03 | s04 | min | median | max |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Solve The List | - | - | 710.9 | - | 710.9 | 710.9 | 710.9 |
| 0 | Solve The Machine | - | 1416.6 | - | - | 1416.6 | 1416.6 | 1416.6 |
| 0 | Solve The Prover | 620.7 | - | 1207.7 | - | 620.7 | 914.2 | 1207.7 |
| 0 | Solve The Triangle | - | 780.2 | - | - | 780.2 | 780.2 | 780.2 |

