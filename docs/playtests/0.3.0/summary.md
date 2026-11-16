# Playtest summary: playtest-run4

2 sessions, build tangle 0.2.0 (308671f), generated 2026-11-15 22:09.

**Findings:** 10 reports in 10 groups -- 0 blocker, 0 major, 4 minor, 6 polish.

## Outcomes

| Session | Goal | Outcome | Fun | Minutes | Objectives | Deaths | Findings | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| s01 | Start with --rooms prover (the first five rooms count as solved; you stand in the List facing the Prover's door). Solve the Prover as someone who has never heard of Godel. Card 81's number is now set with two digit buttons (TENS and ONES) instead of one button; number keys 1-5 press the desk's buttons in order. Report: did you work out what number card 81 should have and WHY (not just by trying numbers)? Were the explanations for wrong numbers helpful? How many presses did it take? Was the dial fun or a chore? | achieved | 4 | 13.5 | 0 | 0 | 5 | The Prover lands: feeding 12 (PROVED) and 47 (searches forever) sets up the rule 'it never proves anything false', the objective 'set its number so it talks about itself' makes 81 an act of understanding rather than guessing, and the two lectern questions walk a newcomer to 'true, and it can't be proved' with clear right-answer explanations. The two-digit dial is quick (8 presses from 47 to 81) and the board explains every intermediate number live, so it reads as feedback, not a chore. The friction is physical: desk keys silently fail out of range, lectern aiming is fiddly, and the finale sends you to the desk and to the hall at the same time. |
| s02 | Start with --rooms done (all six rooms count as solved; you stand in the hall facing a new door in the far wall). This is the game's epilogue. Go through the new door, read what you find, and keep going. Report: did you notice what happened (where you ended up) and did it feel like a fitting end to a game about strange loops? Was anything confusing or broken (walls, seams, plaques you can't read, getting stuck, the transition back into the hall)? Then look around the hall: does it still make sense after the epilogue? | achieved | 4 | 10.4 | 0 | 0 | 5 | The epilogue works: walking out the 'way out' and stepping back into the same hall through the Screen's door is seamless (no visible seam or pop, a calm caption, then the 'Back where you started.' debrief) and is a genuinely fitting last beat for a game about strange loops. The one real weakness is that the actual thesis plaque ('"I" is a strange loop') hangs side-on in a very short passage, so a player obeying 'keep walking straight ahead' loops back without ever reading it. The hall stays coherent afterwards, with an updated progress plaque and objective; only a few floating dark specks and an unchanged 'The way out' sign stand out. |

## Answers

Each agent's own words, verbatim from its report; a missing answer is listed under problems.

### Q1. In your own words, what is a strange loop, and what did each room you played show about it?

- **s01:** A strange loop is when something climbs through levels (a sentence, a picture, a system of rules) and ends up pointing back at itself. I only played the Prover: card 81 says 'The Prover can't prove card 81', so through its number it talks about itself. Because the Prover is honest, it can never prove card 81 (that would prove something false), which is exactly what the card says, so it is true but unprovable. The game's final card says the other rooms show the same shape: a triangle that closes on itself, a screen inside itself, stairs back to the start, a list row escaping its list.
- **s02:** A strange loop is a path where you keep moving 'forward' or 'up' a level, yet end up back where you started, so the thing ends up referring to or containing itself. I only played the epilogue: walking straight out through the hall's far door and arriving back in the same hall through the opposite (Screen) door showed it physically, and the debrief said the hall seen through the far door contains the hall again, like a screen showing itself. The passage plaque applied it to the self: one of the brain's patterns stands for the brain itself, and that self-pointing loop is what 'I' means. I did not play the six rooms, though I passed through the Screen room by accident and saw the screen inside a screen ('3 levels deep').

### Q2. Which moment was the most confusing, and why?

- **s01:** Not the puzzle itself; the controls around it. Pressing 2 a few metres from the desk did nothing with no message, so I briefly thought feeding card 47 had failed. Second, at the end the NEXT box told me to walk back to the desk to see why card 81 is true, while the debrief said a door had opened in the hall, so I did not know where to go. Conceptually, the second question ('is card 81 true?') needs a moment of stepping back, but the plaque line 'it never proves anything false' and the first answer's explanation set it up well.
- **s02:** The first trip through the way-out door: I was holding w as the sign said and suddenly a caption said I had come back into the hall, with no memory of the passage. It took a moment to realise I had looped, and I had missed the plaque in the passage entirely. Only the debrief made it clear. Also slightly puzzling: the debrief says I came in through the Screen's door, but walking back through that door leads to the Screen room, not the passage (an intended Escher-style contradiction, I think).

### Q3. Did anything look broken on screen? Describe each problem, where you were and which way you were facing.

- **s01:** One thing: right after Begin, standing in the List facing west at the Prover's door, a solid black rectangle sat at the top centre of the view and cut off the end of the NEXT box text. It disappeared once I walked into the Prover. Otherwise text and cards rendered cleanly; the TENS/ONES labels under card 81's digits on the board (seen from the doorway, facing the board) are too small to read.
- **s02:** Nothing seriously broken; the loop transition itself was seamless. Small issues: (1) in the hall's south half facing north toward the way-out door, rows of small dark specks near the ceiling right of the door and on the floor in front of the passage; (2) on the very first frame in the hall, facing north from the centre, an empty black rectangle at the top centre of the screen that vanished seconds later; (3) approaching the north door slightly right of centre, I stuck on the door jamb with no slide. The passage plaque is readable but only side-on at close range.

## Findings

### 1. [minor] Aiming at the Prover lectern's three answer buttons with Page Up/Down is fiddly

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** Answering the two questions took about 10 tilt/turn attempts: the buttons sit low and wide, each key tap at a few fps overshoots (pitch jumped 31 -> 69 degrees, one Right tap turned ~50 degrees), and the gold prompt only shows when the crosshair is exactly on a button. Number keys 1-5 work for the desk but do not seem to be offered for the lectern (YES/NO/ONE DAY are labelled 1/2/3 in the probe). Expected the lectern to accept 1-3 like the desk, or bigger hit areas.
- **Repro:** after feeding card 81, walk to the lectern on the left wall; use Next/Prior and Left/Right to put the crosshair on NO
- **Screenshots:** [aim8.png](s01/shots/aim8.png)

### 2. [minor] Epilogue's key plaque ('THE LAST LOOP: "I" is a strange loop') in the passage is easy to walk past unread

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** The sign over the far door says 'Go through, and keep walking straight ahead.' Doing exactly that (holding w from the hall centre) took me through the short passage and back into the hall before I ever saw the plaque, which hangs side-on on the passage's west wall. It is the thematic payoff of the whole game (Hofstadter's 'I' as a strange loop, tying back to card 81 and the screen). I only read it on a second, deliberate trip: stop in the passage, turn ~90 degrees left, back up. Expected: the plaque placed facing the player (e.g. on the passage end or angled), or the passage long enough / the loop trigger far enough in that a walking player sees it.
- **Repro:** pt start ... --rooms done; Return; pt hold w 2; pt hold w 2.5 -> already back in hall (caption 'You walked straight ahead...'), plaque never on screen. Second trip: stop at z~-7.6, pt hold Left ~1.0 to face west wall.
- **Screenshots:** [last_plaque.png](s02/shots/last_plaque.png)

### 3. [minor] Finale gives two different directions: 'walk back to the desk' vs 'a door has opened in the hall'

- **Category:** text; **reported by** 1 agent(s): s01
- **Detail:** After the second answer, the NEXT box says 'Every loop found. Walk back to the desk: the Prover's board now shows why card 81 is true.' The 'Strange loops.' debrief on top of it says 'One last door has opened, in the hall's far wall, where the welcome plaque was.' The player is told to go two places at once; the first debrief also appears before the board payoff the objective promises.
- **Repro:** solve the Prover; read the two debrief cards with the NEXT box visible behind them
- **Screenshots:** [finale_conflict.png](s01/shots/finale_conflict.png)

### 4. [minor] Prover desk number keys 1-5 are silently ignored when a few metres from the desk

- **Category:** ux; **reported by** 1 agent(s): s01
- **Detail:** After feeding card 12 I had drifted ~3 m beside the desk (x -22.8, z 27.5) while turning to read the board. Pressing 2 to feed card 47 did nothing: no prompt, no caption, no sound. Only after walking back to the desk did 2 work. A player who learned the keys would think they had broken. Expected either a wider range while in the Prover room, or a hint like 'Step up to the desk to use its buttons'.
- **Repro:** pt start --rooms prover; Return; walk into the Prover; pt walkto button; pt key 1; strafe/walk ~2-3 m away along the desk; pt key 2 -> nothing happens; pt walkto button; pt key 2 -> card 47 feeds
- **Screenshots:** [keys_range.png](s01/shots/keys_range.png)

### 5. [polish] After the epilogue the north sign still reads 'The way out / Go through, and keep walking straight ahead.'

- **Category:** text; **reported by** 1 agent(s): s02
- **Detail:** Everything else in the hall updates after the loop is found (objective: 'Every loop found, the hall's too. Wander as you like.'; progress plaque: '6 of 6 rooms solved / And the hall itself is a loop. Thank you for playing.'). The way-out sign stays the same even though the player now knows it is not a way out. Could be an intentional joke; if so, a small wink in its subtitle after the loop (e.g. 'The way out?') would land it. Otherwise the hall makes sense: Screen door still leads to the Screen room, Triangle/Machine doors in place.
- **Repro:** pt start ... --rooms done; walk through the north door until looped back; Return on the debrief; walk to the north wall and read the sign above the door.
- **Screenshots:** [hall_after.png](s02/shots/hall_after.png)

### 6. [polish] Black rectangle at the top centre of the view on arrival, clipping the NEXT box

- **Category:** bug; **reported by** 1 agent(s): s01
- **Detail:** Right after Begin, standing in the List facing the Prover door, a solid black box (about x 370-910, y 45-95) covered the top of the view and cut off the NEXT objective text ('...door in the L'). It was gone once I entered the Prover. Possibly an empty caption/banner element.
- **Repro:** pt start --rooms prover; pt key Return; pt await WORLD; pt shot
- **Screenshots:** [black_bar.png](s01/shots/black_bar.png)

### 7. [polish] Empty black rectangle at top centre of the screen on the first frame in the hall

- **Category:** bug; **reported by** 1 agent(s): s02
- **Detail:** Right after Begin, a solid black box (~540x50 px) sat at the top centre of the view, overlapping the NEXT box area. It was gone 2 seconds later. Possibly an empty caption/banner element rendering before its text. Expected: nothing, or a banner with text.
- **Repro:** pt start ... --rooms done; pt await TITLE; pt key Return; pt await WORLD; pt shot start
- **Screenshots:** [start.png](s02/shots/start.png)

### 8. [polish] Rows of small dark specks floating in the hall near the far (way-out) door

- **Category:** bug; **reported by** 1 agent(s): s02
- **Detail:** Facing north from the south half of the hall, a row of ~6 small dark dots hangs near the ceiling right of the way-out door and a row of ~4 sits on the floor in front of the passage. They look like stray geometry or tiny unlit boxes. Expected: clean wall/floor.
- **Repro:** pt start ... --rooms done; walk through the way-out passage once so you re-enter at the south end; face north (yaw ~90) at about x=-0.6 z=3.9; pt shot
- **Screenshots:** [specks.png](s02/shots/specks.png)

### 9. [polish] TENS / ONES labels under card 81's digits on the board are unreadably small

- **Category:** text; **reported by** 1 agent(s): s01
- **Detail:** On the board, card 81 shows its two gold digit tiles with tiny 'TENS ONES' captions beneath them that cannot be read from the desk. The desk labels are clear, so it works, but the link between the board digits and the desk buttons would be stronger with bigger labels.
- **Repro:** walk into the Prover and look at the board from the doorway
- **Screenshots:** [w2.png](s01/shots/w2.png)

### 10. [polish] Walking straight north from the hall centre at a slight angle catches on the way-out door jamb

- **Category:** ux; **reported by** 1 agent(s): s02
- **Detail:** Approaching the north door from x~1.4 I stopped dead against the right side of the frame with no feedback and had to strafe left. Narrow doorway for a 'keep walking straight ahead' instruction. Minor; sliding along the jamb would help.
- **Repro:** From hub x~0.9 z~7, face yaw ~94 (slightly right of north), pt hold w 4.5 -> stuck at x=1.41 z=-5.38.
- **Screenshots:** [walk5.png](s02/shots/walk5.png)

## Objective timings

Game seconds from the start of the world to each objective (event tick / the game's ticks per second, from events.jsonl). Game time, not wall time: with many sessions on one machine a world can run slower than real time, and wall-clock timings would mostly measure the machine.

No objective was completed (or the game has no probe).

