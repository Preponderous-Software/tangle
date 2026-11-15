# Playtest summary: playtest-run1

4 sessions, build tangle 0.1.0 (56193bd), generated 2026-11-15 00:44.

**Findings:** 32 reports in 30 groups -- 0 blocker, 5 major, 17 minor, 10 polish.

## Outcomes

| Session | Goal | Outcome | Fun | Minutes | Objectives | Deaths | Findings | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s01 | Play from the very beginning as a brand-new player who has never heard of Godel, Escher, Bach: the title card, the hall, then the Triangle and the Machine. Solve what you can. Note every moment of confusion, whether the captions and plaques told you what to do, and what you think each room was teaching. | partial | 3 | 27.2 | 1 | 0 | 9 | The writing is the best part. The welcome plaque, the Triangle plaque and its debrief explain the idea clearly to someone with no background, and the Machine's hover prompts (showing 'MIU -> MIUIU' before you press) make a formal system easy to touch. The main problems are the Triangle's audio-only 'warmer' cue and a solve zone tighter than what looks closed, so it turns into a pixel hunt. In the Machine room, room detection under the balcony swapped in the Screen room's objective and lost the 'climb the ramp' instruction, and I never managed to get onto the ramp. |
| s02 | Play the Screen room and the Staircase as a new player (start from the beginning, walk through the hall's door opposite the welcome plaque). Solve them if you can. Note whether the screen-inside-a-screen made sense, whether the sentence answers made sense, and whether the endless climb felt endless. | achieved | 3 | 26.1 | 2 | 0 | 10 | Both rooms work and both debriefs are clear and well written. The recursive screen (with its '4 of 6 levels deep: get closer, face it squarely' coaching) is the best moment, and the stairwell, with landings repeating above and below, looks properly endless. Two things hurt the experience: the liar-sentence button tells you your correct answer is wrong ('only lights when a sentence can't be answered either way'), and in the stairwell the HUD switches to the Machine room's objective. Aiming at the lectern while you can't see the board is a chore, and the stairwell is easy to walk down by mistake. |
| s03 | The List (Room 5). Start with --rooms all (the first four rooms count as solved and you stand in the small room outside the stairs); go through the door on your left and down the corridor. Make a row of tiles that isn't in the librarian's list, as a player who has never heard of Cantor. Say how long it took you to see the trick, which hints you needed, and whether the debrief explained why it matters. | achieved | 4 | 21.8 | 1 | 0 | 6 | The List room is a strong teaching puzzle. The live board, the 'row 7033 starts like yours' reveal, the librarian adding your row, and a debrief that ties it to Cantor, Godel and Turing all work. The one design gap is that round 1 gives a newcomer no pointer to the diagonal; the gold diagonal outline only appears in round 2, after you've won. The instruction plaque behind the desk is unreadable. On this machine heavy input lag made aiming at the desk switches slow. |
| s04 | Graphics and layout hunt in every room (hall, Triangle, Machine and balcony, Screen, vestibule, Staircase, List). Look in every direction, up and down. Screenshot and describe anything that looks wrong: gaps or seams, flicker, surfaces fighting, unreadable or overlapping text, walls you can see through or walk through, places you get stuck. | partial | 2 | 19.4 | 0 | 0 | 7 | The rooms I reached (vestibule, Staircase, List, Screen, hall) look clean and readable at headline level. The staircase shaft and the recursive screen are striking. The biggest problem was moving through doorways: the player sticks to jambs, and that ate most of my time and kept me out of the Machine and Triangle rooms. Visual problems were minor: black void slivers at two thresholds, dotted seams on door jambs, a staircase level where the HUD promises a door that is not drawn, and tiny sub-text that cannot be read. |

## Answers

Each agent's own words, verbatim from its report; a missing answer is listed under problems.

### Q1. In your own words, what is a strange loop, and what did each room you played show about it?

- **s01:** From the game: a path that keeps going forward (or upward) and still ends up back where it started. The Triangle showed one you can see: three beams that seem to turn corners and close into a loop, but only from one exact spot. When you step aside it turns out to be an open, bent bar, so the loop is a trick of viewpoint. The Machine showed the same thing with rules instead of beams. You keep applying word-rules (MI -> MIU -> MIUIU ...) and the words grow and change, but you never get to MU. Then the game says you have been 'working inside the machine's rules' and opens a balcony so you can look at the system from outside. My guess is the lesson is that some questions can't be answered from inside the rules, only by stepping out of them. I couldn't reach the balcony board, so I couldn't confirm what it says.
- **s02:** A strange loop is when you keep moving in one direction (up, deeper, onward) through levels and end up back where you started; it often comes from something referring to itself. The Screen room showed a picture that contains itself, over and over, and then sentences that talk about themselves: most are simply true or false, but 'This sentence is false' flips forever and can't be either. The debrief tied that to Godel's 'this sentence can't be proved'. The Staircase showed a climb where every flight goes up a key (C, D, E... A#) but the next one up puts you back at C at the door, so there is no top, like Bach's ever-rising canon and Escher's stairs.
- **s03:** Something that refers back to itself: you follow a path forward or upward and end up where you started, or a thing is built out of the very list or system that describes it. I only played the List room. There, the row that beats the list is made from the list itself: tile n is the opposite of row n's tile n. Adding that row to the list doesn't help, because the same trick beats the new list. The debrief ties this to Cantor (some infinities are bigger), Godel (a sentence that says it is not on the list of things that can be proved) and Turing.
- **s04:** From what the game showed me: a path that keeps going forward or upward and still ends up back where it started. I did not solve any rooms in this session (the save already had four solved). The Staircase shows it most directly: you climb, every landing is one note higher, and the HUD still says you are level with the door. The Screen room's big screen shows itself inside itself, '3 levels deep'. The List is about a list that claims to hold everything, and you make a row of tiles that is not in it. I did not get into the Triangle or the Machine, so I cannot say what they show.

### Q2. Which moment was the most confusing, and why?

- **s01:** The Triangle search. Without sound, the 'tone rises as you get close' cue did nothing for me. Twice I stood where the triangle looked completely closed with the crosshair on it, and nothing happened. I couldn't tell whether I was in the wrong spot, needed to press E, or needed to wait. The ring hint helped, but even inside the ring it took several small side-steps before 'Hold still...' appeared. A close second: in the Machine room after the gate opened, the objective suddenly changed to the Screen room's 'look straight at the big screen' while I was still in the Machine room, and I couldn't find a way onto the ramp.
- **s02:** Pressing CAN'T BE EITHER on 'This sentence is false.' and being told 'Not yet: this one only lights when a sentence can't be answered either way.' I had the right answer and the message seemed to agree with me while refusing it. Only after trying FALSE and TRUE did it light up. A close second was the stairwell: I walked down instead of up without realising, and the HUD switched to a Machine-room objective about the MU board, which made me think I was in the wrong place.
- **s03:** The start of round 1. The plaque that explains the puzzle sits behind the desk and I couldn't read it, so the caption ('set the switches, then press CHECK') was my real instruction. After my first CHECK the red outlines marked each row's first differing tile, scattered around the grid, which shows that guessing fails but doesn't point at the diagonal. The gold diagonal outline that makes the trick obvious only appeared in round 2. Physically aiming at the switches with heavy input lag was also confusing: the view kept drifting after I let go of the keys.
- **s04:** One flight up the staircase. The HUD said 'on the stairs - level with the door', but there was only a blank wall where the door should have been, and I had to walk back down to find the real doorway. Close behind it: standing 'within reach' of the Machine door and seeing nothing but wall, unable to get through.

### Q3. Did anything look broken on screen? Describe each problem, where you were and which way you were facing.

- **s01:** 1) Title card: faint ghost text and a dark box show through behind the card. 2) Hall, first frame after Begin, facing the welcome plaque (north): a solid black bar over the top-centre that hid part of the NEXT objective. It was gone on later frames. 3) Machine room, facing the rules plaque on the wall to the left of the word screen: the plaque overlaps the screen, and a block of dotted tally marks from the screen pokes through the plaque's top-right corner. 4) Machine room, under the balcony near the far +z wall: the objective and caption switched to the Screen room's text (a logic error, not a rendering one). The Triangle hint ring wasn't broken, just very dim. Everything else rendered cleanly, if slowly (software rendering).
- **s02:** 1) Title card: faint ghost text ('of strange loops' and extra lines) shows through behind the card. 2) Hub at spawn, facing the welcome plaque: an empty black rectangle top centre covers the end of the NEXT objective line for a few seconds. 3) Stairwell, at several turns (e.g. the G# corner, facing the outer wall): the view is a flat dark wall with no detail, which is hard to read but probably not a rendering bug. 4) Screen room, facing the sentence board from the lectern: long sentences run past the visible edge ('...contains the lette') until you step back. 5) In the stairwell the HUD showed the Machine room's objective and caption. Nothing else looked broken; the screen recursion rendered cleanly.
- **s03:** 1) At spawn in the vestibule, facing down the List corridor (yaw -90), an empty black bar at the top centre covered the end of the objective line for a moment, and the objective read 'NEXT Next: ...' with a stale first half. 2) In the List room, standing at the desk facing the plaque to the right of the board, the plaque's body text is too small and blurry to read because the desk keeps you back. Nothing else looked broken; the board, the switches and the debrief rendered cleanly.
- **s04:** (1) Staircase C landing, facing back toward the vestibule doorway: a solid black strip along the threshold. (2) Vestibule corridor at about x-9.1 z21.4, facing north: a black wedge at the foot of the Screen-room doorway jamb. (3) Screen room, facing the west door, and the List door: a dotted line of light pixels down the jamb edge. (4) One flight up the staircase: no doorway drawn where the HUD says the door is level with you. (5) Vestibule, facing south just after Continue: an empty black box briefly covered the objective text. (6) Small sub-text on boards and stair signs is unreadable. (7) Doorways in general (Machine door from the hall, list corridor, staircase): the player gets stuck on the jambs.

## Findings

### 1. [major] Doorways snag the player on the jamb with no sliding (Machine door, staircase, list corridor, List door)

- **Category:** bug; **reported by** 1 agent(s): s04
- **Detail:** Several doorways were hard to get through. Holding w from a little off-centre pins the player against the jamb, and they barely move (about 0.2 m/s or nothing at all) instead of sliding into the opening. pt walkto door timed out three times, at the staircase door, the list corridor mouth (x-9.1 z19.3) and the List door. At the Machine door, walkto said 'within reach' at 0.8-1.2 m (bearing -5) while the screen showed only a flat wall, and in about 3 real minutes of strafing and turning I could not get into the Machine room. The staircase exit took about 2 minutes. Expected: the player slides along the jamb into the opening, or the openings are wider.
- **Repro:** pt start ... --rooms all; Continue; from the hall centre: pt walkto door (machine door); pt hold w 4 -> no progress, view is a wall. Also: from the List, pt face 180; pt hold w 5 at the corridor mouth -> no movement until pt hold a 0.5.
- **Screenshots:** [machine_door_snag.png](s04/shots/machine_door_snag.png)

### 2. [major] Lectern: correct 'CAN'T BE EITHER' answer to the liar sentence is refused with a self-contradicting message

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** Sentence 5 of 5 is 'This sentence is false.' Pressing CAN'T BE EITHER first (the right answer) gives 'Not yet: this one only lights when a sentence can't be answered either way.', which is exactly what this sentence is. Only after trying FALSE and TRUE does the button light. The unlit button still turns the crosshair gold and shows 'E: it can't be true or false', so it looks usable. A player who has just worked it out is told they're wrong. Expected: accept it, or say 'try TRUE and FALSE first' and don't show a usable prompt on the unlit button.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; solve the screen; at the lectern answer TRUE, FALSE, TRUE, FALSE; on 'This sentence is false.' aim at the purple button; pt key e
- **Screenshots:** [neither_rejected.png](s02/shots/neither_rejected.png)

### 3. [major] Machine room: HUD objective switches to the Screen room's while still in the Machine room, and the Machine objective is lost

- **Category:** bug; **reported by** 1 agent(s): s01
- **Detail:** After the MIU gate opened ('Climb the ramp to the balcony and read the board'), I walked along the wall under the balcony near the ramp foot (around x 11-23, z 7.7). The probe room went from 'miu' to 'scr', and the NEXT line and caption changed to 'Look straight at the big screen until it shows itself many levels deep' / 'A screen that shows whatever you're looking at. Read the plaque by the door.' When I walked back into the middle of the Machine room (room 'miu' again), the HUD still showed the Screen objective, so the ramp/balcony instruction was gone. A player would be told to look for a screen that is not in this room. Expected: room detection that matches the walls, with the objective tied to the room the player is actually in.
- **Repro:** pt start ...; solve the Triangle; enter the Machine room; press buttons until the caption says the gate opened; walk along the +z wall under the balcony toward x~11-22, z~7.7; pt state shows room 'scr' and the Screen objective; walk back to (12.4, 6.1): room 'miu', but the objective stays on the Screen one
- **Screenshots:** [wrong-room.png](s01/shots/wrong-room.png)

### 4. [major] Staircase: Machine-room objective and caption fire while climbing the stairwell

- **Category:** bug; **reported by** 1 agent(s): s02
- **Detail:** About 1 s into the stairwell (tick 68044, room=stair, y~4.4, stairs.loops=-1 after I accidentally went down), the NEXT line changed to 'Read the board. If you're convinced MU can't be made, press the red button beside it.' and the caption to 'From up here you can see the machine from outside. Read the board on the wall...'. I had never entered the Machine room. It stayed until the staircase loop completed (tick 82363). The player is told to do something in a room they're not in, while trying to find the top of the stairs.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; walk to the Screen room, solve it, walk west into the vestibule and through the staircase door; pt hold Shift_L+w 8; pt shot
- **Screenshots:** [stair_miu_leak.png](s02/shots/stair_miu_leak.png)

### 5. [major] Triangle: the only proximity cue is an audio tone, and the solve zone is much tighter than 'looks closed'

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** The plaque says 'Listen: a tone rises as you get close.' With no sound there is no visual 'warmer/colder' cue, apart from a faint ring round the crosshair that I only noticed late. I found a viewpoint, (-12.3, 3.2) and later (-12.6, 5.2), where the tribar looked closed on screen with the crosshair on it, and nothing happened for several seconds each time. A hint caption about a floor ring appeared about 5 minutes in (tick 32718). Even standing on the ring and looking at the triangle, it took four small strafes of about 0.4 m before 'Hold still...' fired. It took about 15 game minutes in total (solved at tick 56952). Expected: a visual proximity cue (a brightening glow or tightening crosshair ring) and a tolerance that matches what looks closed.
- **Repro:** pt start ...; Begin; enter the Triangle room (west); walk to (-12.6, 5.2) and face yaw ~52, pitch ~-5; the tribar looks closed but it is not solved; strafe a/d 0.4 m at a time until it solves at about (-12.2, 5.5)
- **Screenshots:** [tri-near.png](s01/shots/tri-near.png)

### 6. [minor] Hall: a black rectangle covers part of the NEXT objective on the first frame; the title card has ghosted text behind it

- **Category:** bug, ux; **reported by** 3 agent(s): s01, s02, s04
- **Also reported as:** "Empty black box covers the NEXT objective text right after Continue"; "Title card has ghost text showing through behind it"
- **Detail:** On the first WORLD frame after Begin, a solid black bar (about x370-910, y45-96) sat over the top-centre of the view and hid the end of the NEXT line. It was gone on later frames. On the title card, faint duplicate text shows through behind the card ('...of strange loops' behind the wordmark, extra lines behind Begin) along with a dark rectangle on the right, as if a second layer is bleeding through.
- **Repro:** pt start ...; pt shot title; pt key Return; pt await WORLD; pt shot hall1
- **Screenshots:** [hall-blackbar.png](s01/shots/hall-blackbar.png) [title_ghost.png](s02/shots/title_ghost.png) [black_bar_over_objective.png](s04/shots/black_bar_over_objective.png)

### 7. [minor] Caption says the lectern is 'on the right' but it is on the left when facing the screen

- **Category:** text; **reported by** 1 agent(s): s02
- **Detail:** Right after solving the big screen (you're facing it), the caption says 'Now the sentences: the lectern on the right has woken up.' The lectern is about 120 degrees to the LEFT from that spot (probe bearing -122).
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; solve the big screen; pt state (lectern bearing negative)
- **Screenshots:** [w10.png](s02/shots/w10.png)

### 8. [minor] Empty black rectangle covers the top of the HUD at spawn

- **Category:** bug; **reported by** 1 agent(s): s02
- **Detail:** Right after Begin, a solid black box sits top centre (about x 370-910, y 45-95) and hides the end of the NEXT objective line ('...then take the [hidden] left.'). It was gone a few seconds later.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; pt shot right after WORLD
- **Screenshots:** [black_bar.png](s02/shots/black_bar.png)

### 9. [minor] Hall: you can't 'read' the welcome plaque to tick off the first objective, and walking up close leaves the text too big to read

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** The first objective is 'Read the plaque ahead, then take the door on the left.' Walking up to the plaque leaves you 0.94 m away, where the text overflows the screen. Pressing E shows no prompt and does nothing. The objective never ticks, so you can't tell whether reading it 'counted'; it only changes when you enter the Triangle room. The plaque is perfectly readable from where you start, so the instruction to walk up to it makes things worse.
- **Repro:** pt start ...; pt key Return; pt walkto plaque; pt key e; no prompt, objective still 'Read the plaque ahead...'
- **Screenshots:** [plaque-no-e.png](s01/shots/plaque-no-e.png)

### 10. [minor] Lectern FALSE prompt reads 'E: this sentence is false', the liar sentence itself

- **Category:** text; **reported by** 1 agent(s): s02
- **Detail:** The answer prompts are 'E: this sentence is true' and 'E: this sentence is false'. In a room about sentences that refer to themselves, the FALSE prompt is word for word the paradox on sentence 5, so it is unclear whether the button answers or is a statement. Suggest 'E: answer TRUE' / 'E: answer FALSE'.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; go to the Screen room lectern; aim at the red button
- **Screenshots:** [prompt_liar.png](s02/shots/prompt_liar.png)

### 11. [minor] Lectern: can't see the sentence board while aiming at the buttons; answer feedback is on the board

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** The buttons are low on the lectern and the board is high on the wall behind, so when you tilt down to aim, the sentence and the green or red feedback line ('True. Yes it does.') are off screen or at the top edge. For every sentence I had to step back and tilt up to read it, walk in and tilt down to answer, then step back again to see if I was right. Pitch steps are coarse (~3.5-7 degrees per tap at this frame rate), which makes aiming at the three slabs slow. Long sentences were also cut off at the board's edge from the answering spot ('...contains the lette').
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; walk to the lectern (pt walkto button); pt hold Next 1.0; pt shot
- **Screenshots:** [w16.png](s02/shots/w16.png)

### 12. [minor] List room plaque 'Find a row that isn't there' is unreadable: it sits behind the desk and can't be approached

- **Category:** text; **reported by** 1 agent(s): s03
- **Detail:** The plaque with the room's instructions stands on the far side of the switch desk. The desk blocks the player, so even at the closest point the body text is a few pixels tall and blurry. I could only half-read it from ~6 m with image zoom ('The librarian says this list holds every endless row of light and dark tiles... Set the switches on the desk... press CHECK. Can you make a row that's actually nowhere in the list?'). The status text even says 'Read the plaque to the right of the list.' Expected: plaque reachable/readable, or larger text.
- **Repro:** pt start ... --rooms all; enter the List room; walk up to the desk next to the plaque; pt shot
- **Screenshots:** [plaque_unreadable.png](s03/shots/plaque_unreadable.png)

### 13. [minor] List room round 1: nothing points a newcomer at the diagonal; the gold diagonal hint only appears in round 2

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** In round 1 the board shows 8 rows and, after a CHECK, outlines in red each row's FIRST differing tile (scattered positions) and says 'row 7033, further down, starts just like yours ... You'd have to check forever.' That nicely shows why trial and error fails, but gives no nudge toward 'make tile n differ from row n'. Only after the first win does the board outline the diagonal (row n, tile n) in gold. A player who has never heard of Cantor has to discover the construction unaided in round 1; the hint arrives when they no longer need it. Honest caveat: I know Cantor's argument, so after one exploratory CHECK (row 10000000) I built the diagonal flip directly; I cannot measure how long a true newcomer would take. Expected: the diagonal highlight (or an escalating hint after 2-3 failed CHECKs) in round 1.
- **Repro:** pt start ... --rooms all; walk down the list corridor; set tile 1 light; press CHECK; observe red first-difference outlines (no diagonal); flip the diagonal and CHECK; round 2 now shows the gold diagonal
- **Screenshots:** [round2_diagonal_hint.png](s03/shots/round2_diagonal_hint.png)

### 14. [minor] Machine: button tops have no labels, the desk faces away from the screen, and far buttons are hard to aim at with the coarse pitch steps

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** The six desk buttons are plain yellow and grey slabs. Their labels (1 2 3 4 -> undo) are small glyphs on the desk's front edge that you can't see while looking down at the buttons. When you aim at a button, the word screen is out of view, so you have to turn after every press to see the result. Each Page Up/Down tap moves the view 3.5-7 degrees, so aiming at buttons 3-6 from the end of the desk kept skipping past them; I had to walk along the desk. The hover prompt ('E: rule 2 ... MIU -> MIUIU', 'can't apply now') saves it and is excellent. Undo's prompt doesn't show what the word will become.
- **Repro:** pt walkto button; pt key Next (repeat) and watch prompt; buttons 3/4/->/undo are skipped between pitch steps from the near end
- **Screenshots:** [desk5.png](s01/shots/desk5.png)

### 15. [minor] Machine: the ramp foot is hard to find; from the floor the railing side reads as a wall

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** After the gate opened I spent about 4 minutes failing to get onto the ramp. From most of the room you see the ramp's side panel and railing, not its walkable surface. The caption says the gate is 'at the foot of the ramp, by the door you came in', but I couldn't see a gate or an obvious opening. I ended up walking under the balcony instead. Expected: a visible open gate, or a light or arrow at the ramp's foot.
- **Repro:** after the MIU gate caption, try to reach the balcony from the desk area
- **Screenshots:** [under-balcony.png](s01/shots/under-balcony.png)

### 16. [minor] Objective at --rooms all spawn reads 'NEXT Next: ...', is stale, and is briefly covered by an empty black bar

- **Category:** text; **reported by** 1 agent(s): s03
- **Detail:** Spawning in the vestibule, the objective line reads 'NEXT Next: the List, through the Screen room's left-hand door, then the small room's left-hand door.' The word Next is doubled, and the first half is out of date because I already stand in the small room. On the first frame an empty black rectangle at the top centre (x370-910, y45-96) covered the end of the line; it was gone a few seconds later.
- **Repro:** pt start ... --rooms all; pt key Return; pt await WORLD; pt shot
- **Screenshots:** [objective_overlap.png](s03/shots/objective_overlap.png)

### 17. [minor] Pure-black void shows along doorway thresholds (staircase to vestibule, vestibule to Screen room)

- **Category:** bug; **reported by** 1 agent(s): s04
- **Detail:** From the staircase C landing, looking back at the vestibule doorway (yaw ~178), a solid black strip runs the full width of the threshold at floor level. From the vestibule corridor looking north (x-9.1 z21.4), a black wedge shows at the foot of the Screen-room doorway jamb. Both look like gaps in the floor or wall where the empty background shows through. Expected: floor continuous across the threshold.
- **Repro:** Stand on the staircase C landing at about x-11.0 z15.9 and face the vestibule doorway; or stand at x-9.1 z21.4 in the vestibule corridor and face north.
- **Screenshots:** [stair_threshold_gap.png](s04/shots/stair_threshold_gap.png)

### 18. [minor] Severe input lag: held movement keys keep applying long after release, causing big overshoots

- **Category:** perf; **reported by** 1 agent(s): s03
- **Detail:** At the game's low tick rate (about 80 game ticks per 6 s wall in places) movement and turns land seconds late. 'pt hold w 4' moved ~0.3 m, then the move showed up later; a 'pt hold s 1.5' was followed by an ~8 m displacement (x -9.4,z 32.2 -> x -2.3,z 25.3). 'pt face' never converged (offBy 15-35 deg every time). Aiming at desk switches took many look/check cycles. Software renderer under load is likely the cause, but movement that keeps going after key-up suggests inputs are queued, not sampled.
- **Repro:** pt start ... --rooms all; pt hold w 4; pt state (little movement); pt wait 5; pt state (movement appears); pt face 26 -> ok:false
- **Screenshots:** [aim1.png](s03/shots/aim1.png)

### 19. [minor] Staircase: one flight up, the HUD says 'level with the door' but there is only a blank wall where the door should be

- **Category:** bug; **reported by** 1 agent(s): s04
- **Detail:** I ran up one flight from the C landing (x-11.4 z17.2 y4.8, yaw ~125). The HUD chip read 'on the stairs - level with the door' and the probe put the staircase door 1.4 m ahead, but the view showed a flat dark wall with a D sign and no opening. Walking forward pressed into the wall. A player trying to leave gets stuck, with the HUD telling them the door is right there. Expected: the door is drawn at every level the HUD calls 'level with the door', or the HUD wording changes.
- **Repro:** From the vestibule, enter the staircase; pt face 180; pt hold Shift_L+w 4; pt walkto door -> timed out, facing a wall.
- **Screenshots:** [stair_door_missing.png](s04/shots/stair_door_missing.png)

### 20. [minor] Stairwell is disorienting: easy to go down without noticing, and the walls are featureless

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** From the staircase door, walking ahead took me DOWN (loops=-1, ending at 'G# landing - 1.6 m below the door') with no clear sign that I was going the wrong way, apart from the small HUD line. Several turns left me staring at a flat dark wall (shots/w41, w43) with nothing to tell up from down. A clear 'up' arrow, or the first flight going only up from the door, would help.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; enter staircase; pt hold Shift_L+w 8; pt state (y falls, loops -1)
- **Screenshots:** [w41.png](s02/shots/w41.png)

### 21. [minor] The Screen room's self-reference explanation shows for only ~7 s and gets missed

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** On reaching 6 of 6 levels, the caption 'A picture that contains itself, which contains itself, and so on down. That's self-reference.' (tick 19923) is replaced by 'Now the sentences...' at tick 20358, about 7 game seconds later. There's no debrief for this half of the room, so at a few fps the main lesson of the screen is easy to miss. (The final debrief does sum it up.)
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; walk up to the big screen and face it until 6 of 6; pt wait 6; pt shot
- **Screenshots:** [scr_caption_fleeting.png](s02/shots/scr_caption_fleeting.png)

### 22. [minor] Triangle debrief says 'When you stepped aside, the triangle came apart' before the player has stepped aside

- **Category:** text; **reported by** 1 agent(s): s01
- **Detail:** After solving, the NEXT line says 'Walk sideways and watch it break', but the 'You found it.' debrief pops up about 9 s later (tick 57482) while I was still standing still. It describes the break in the past tense, as if I had already seen it. The reveal it talks about is skipped unless the player does it after closing the card. Expected: wait to open the debrief until the player has moved aside, or change the wording to 'Step aside and...'.
- **Repro:** solve the Triangle and do not move; the debrief opens about 530 ticks later with past-tense 'When you stepped aside' text
- **Screenshots:** [debrief-premature.png](s01/shots/debrief-premature.png)

### 23. [polish] Debrief says 'You built your row from the list itself' whatever method the player used

- **Category:** text; **reported by** 1 agent(s): s03
- **Detail:** The debrief is excellent (diagonal explained in plain words; Cantor 1891, bigger infinities, Godel's sentence, Turing's halting problem). But 'What just happened' states the player used the diagonal even if they won round 1 by trial and error. Something like 'Here is the trick that always works' would read better for a lucky winner.
- **Repro:** complete the List room; read the debrief
- **Screenshots:** [debrief_good.png](s03/shots/debrief_good.png)

### 24. [polish] Dotted line of light pixels along door jamb edges (Screen room west door, List door)

- **Category:** bug; **reported by** 1 agent(s): s04
- **Detail:** A dotted line of light pixels runs down the inner edge of door jambs, like a crack or two surfaces fighting. Clearest on the Screen room's west door to the vestibule, seen from x-5.1 z11.9. Also on the left jamb of the List door (shots/list3.png).
- **Repro:** Stand in the Screen room at about x-5.1 z11.9 and look at the west (vestibule) doorway.
- **Screenshots:** [jamb_dotted_seam.png](s04/shots/jamb_dotted_seam.png)

### 25. [polish] Machine: rules plaque and word screen overlap; tally marks from the screen poke through the plaque corner

- **Category:** bug; **reported by** 1 agent(s): s01
- **Detail:** The rules plaque is mounted over the left edge of the word screen. A block of dotted marks from the screen shows through the plaque's top-right corner beside the title 'Turn MI into MU'.
- **Repro:** enter the Machine room; pt walkto plaque (machine rules); pt hold s 2; pt shot
- **Screenshots:** [rules-overlap.png](s01/shots/rules-overlap.png)

### 26. [polish] Objective HUD repeats itself: 'NEXT  Next: the List...'

- **Category:** text; **reported by** 1 agent(s): s04
- **Detail:** The objective box has a gold 'NEXT' label, and then the text also starts with 'Next:'.
- **Repro:** Load a save with 4 rooms solved; read the top-left HUD.
- **Screenshots:** [hub1.png](s04/shots/hub1.png)

### 27. [polish] Positive: CHECK feedback in the List room is clear and satisfying

- **Category:** ux; **reported by** 1 agent(s): s03
- **Detail:** Your row appears live on the board under YOUR ROW. CHECK outlines the differing tile in each row and adds 'differs at tile N', then reveals a far-down row ('row 7033') that starts the same, with 'You'd have to check forever.' Round 2 inserts your row at the top and shifts the list. All of this teaches the idea well. Keep it.
- **Repro:** set any row; press CHECK
- **Screenshots:** [check_feedback_good.png](s03/shots/check_feedback_good.png)

### 28. [polish] Small text on boards is unreadable at normal distance (vestibule board, hall progress board, stair signs)

- **Category:** text; **reported by** 1 agent(s): s04
- **Detail:** The second line on the vestibule question board and the hall progress board, and the small captions under staircase landing letters, are a few pixels high and come out as smudges. The sharp sign in 'AT A#' on the vestibule button and on far landing signs ('F#') breaks up into noise at a distance. Headline text is fine.
- **Repro:** Look at the vestibule question board from the middle of the vestibule; look at the hall's '4 of 5 rooms solved' board.
- **Screenshots:** [vest_30024.png](s04/shots/vest_30024.png)

### 29. [polish] Stale caption stays after a room is solved

- **Category:** text; **reported by** 1 agent(s): s02
- **Detail:** After the Screen debrief, the caption still read 'Both answers lead to a contradiction. A third button on the lectern has lit up.' while walking to the vestibule.
- **Repro:** pt start --profile ./tools/playtest/tangle.json --game-dir .; pt key Return; solve the Screen room; Carry on; pt state
- **Screenshots:** [w36.png](s02/shots/w36.png)

### 30. [polish] Triangle hint ring is very dim

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** The hint ring is a circle of small, faint dots next to the bench by the entry door. When I first looked back toward the door I missed it, and only spotted it on a slow 360-degree sweep. It would be easier to see as a solid glowing disc.
- **Repro:** wait in the Triangle room until the 'ring of light' hint; look around from the middle of the room
- **Screenshots:** [ring-found.png](s01/shots/ring-found.png)

## Objective timings

Game seconds from the start of the world to each objective (event tick / the game's ticks per second, from events.jsonl). Game time, not wall time: with many sessions on one machine a world can run slower than real time, and wall-clock timings would mostly measure the machine.

| # | Objective | s01 | s02 | s03 | s04 | min | median | max |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | Solve The List | - | - | 1284.6 | - | 1284.6 | 1284.6 | 1284.6 |
| 0 | Solve The Screen | - | 1008.6 | - | - | 1008.6 | 1008.6 | 1008.6 |
| 0 | Solve The Staircase | - | 1544.8 | - | - | 1544.8 | 1544.8 | 1544.8 |
| 0 | Solve The Triangle | 949.2 | - | - | - | 949.2 | 949.2 | 949.2 |

