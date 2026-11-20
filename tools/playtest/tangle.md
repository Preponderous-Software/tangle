# Tangle: notes for AI playtesters

Tangle is a first-person game in a browser window (Chromium app mode). It renders in software here,
so it is slow: expect a few frames a second. Give each action time and take a `pt shot` to see what
happened.

## Starting

- The title card shows first (`screen: TITLE`). Press `Return` (the Begin button has focus) or click
  Begin. Then `screen` is `WORLD`.
- A dark bar at the top of the window may say Chrome is being controlled by test software. Ignore it.

## Controls

- `w` `a` `s` `d` walk (hold with `pt hold w 1.5`); `Shift_L+w` runs.
- `Left` / `Right` turn at about 103 degrees a second; `pt face DEG` uses them.
- `Prior` / `Next` (Page Up / Page Down) tilt the view up and down. You need this to aim at buttons on
  desks: look down until the crosshair is on the button.
- At a desk or lectern (within a few steps of it), the number keys `1`–`9` press its buttons in label
  order without aiming, and `Return` presses the List's CHECK.
- `e` uses what the crosshair is on. When something can be used, the crosshair turns gold and a
  prompt at the bottom says what `e` will do (also in `pt state` as `prompt`).
- A click on the view captures the mouse; then `pt look DX DY` turns too. `Escape` releases it, which
  opens the pause menu (`screen: PAUSE`); click Resume or press `Escape` again.
- After a puzzle is solved, a debrief card appears (`screen: DEBRIEF`). Read it, then press
  `Return` or click Continue.

## Finding your way

- `pt state` shows `room` (hub, tri, miu, scr, vest, stair, list, prv, or out in the epilogue's
  passage), the NEXT `objective` line, the
  latest `caption`, the `prompt`, and `solved` for each room.
- `nearest` lists `door`, `plaque` and `button` with distance and bearing. `pt walkto door` and
  `pt walkto plaque` work; buttons sit on desks and lecterns, so walk near (`pt walkto button`), then
  tilt down and aim.
- The hall (hub) has doors west (the Triangle), east (the Machine) and south (the Screen). The
  Screen room's west door leads to a small vestibule; from there the stairs are straight ahead and the
  List is through the door on the left (south), down a corridor. Once the List is solved, a door in
  the List's west wall (on your right as you come in) opens onto the Prover, the last room.
- Once all six rooms are solved, a door opens in the hall's north wall, where the welcome plaque was:
  the way out. Its passage holds the last plaque, and walking straight on brings you back into the
  hall through the south side.
- `pt state` also has `prover`: the cards fed so far, card 81's number, whether the questions are
  open, and which question you're on.

## What not to do

Do not use the `?drive`, `?skip` or `?new` URL parameters, `window.__tangle`, or the developer
tools, and do not edit localStorage. Judge the game by what a player sees.
