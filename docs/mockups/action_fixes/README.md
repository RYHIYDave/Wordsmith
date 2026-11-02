# Three fixes from his look at the night's films (mock-ups; branch `art/action-fixes`)

An art helper's work on `art/action-fixes` (from `art/action-f16` 8fafbbf: all the action work so far). Each mock-up is changed IN
PLACE, in its own files, behind its own switch, still off; its own test and README say what changed. Nothing here is in the game
until the main chat puts it there, on his yes. The game's own frames are unchanged (each mock-up's test checks its hashes).

## His words, 2 Nov 2026

- 07:32: “The carrion queen’s dive should be a much bigger AOE, and really sell it with dirt and dust on the impact.  The sluice
  gates should just open periodically in the rat king fight, I don’t think it needs to be one of his moves.  Just an arena hazard.”
- 07:33: “I’m not in love with the bramble charge from the deer.  Maybe it’s just the look I don’t love, not sure”
- By 07:36, asked what goes in the sluices' place among the Rat King's moves: “His roll, back and bigger (Recommended)” (offered as:
  he curls into a ball, a big held wind-up, then barrels down a wider marked lane, fast).
- By 07:36, asked about the deer: “Redo hedge and gallop (Recommended)” (offered as: same move; the hedge becomes dark, living
  brambles: leaves, hooked thorns, writhing up; the deer stretches into a full gallop).

## The three

1. **THE CARRION QUEEN'S DIVE** (docs/mockups/action_f7_queen/README.md, `QUEEN_ACTION`; art/carrion_queen_action.ts `QA_DIVE`,
   art/carrion_queen_action_fx.ts `diveStrikes`, `paintDiveMarks`, `paintDiveBurst`). The area she strikes **3.2 round** (was 1.6;
   the game's own 1.1), marked plain on the rock while she hangs (a thick ring closing in, a fainter one inside, her shadow growing).
   Where she strikes THE ROCK BURSTS: a fountain of dirt, grit and broken rock (a column at its middle, up to about 200 of the
   picture's pixels), a thick ring of dust rolling out to the area's edge in under half a second, chunks falling back and bouncing
   twice, the dust hanging and drifting off with the wind for **2.3 s**, the crater and its cracks left **2 s**; the game's shake 8
   (the most it uses). The eyrie's own colours; never cyan. Her body and her timings unchanged (2.8 s, her talons in at 1.6 s).
2. **THE RAT KING** (docs/mockups/action_f12_ratking/README.md, `RATKING_ACTION`; art/ratking_action.ts, art/ratking_action_fx.ts).
   - THE SLUICES are the cistern's own now: **every 14 s, the first 9 s in** (a suggestion; `SLUICES`, `sluiceAt`): the lanes marked
     first, the gates grinding open from 0.6 s, bursting at **2.0 s**; the flood down the lanes **3 s**, draining 0.8 s; the dry
     ledges plain. Drawn by itself, needing nothing from him: they go off while he bites, spits a word or rolls. What the rules need
     to run them: a clock of the fight's own (README there).
   - His rearing summons is gone from his moves; HIS ROLL is back, bigger, by Movement 9 (one clip, `moves.roll`, 3.2 s): curled into
     a ball by 0.5 s, rocked back and HELD 0.8 s spinning up in place; **off the line in two frames (2.2 tiles)**; **13 tiles a
     second** (was 6.45) down a lane **2.4 wide** (was 1.5), **11.1 tiles** long; bursting open where he stops, **a ring 2.2 round**.
3. **THE TWISTED DEER'S BRAMBLE CHARGE** (docs/mockups/action_f9/README.md, `DEER_BRAMBLE`; art/action_f9_pinewood.ts). Same move,
   same times, sizes and wall. THE GALLOP: body low and long, head and antlers down and forward, legs reaching far out in front (29
   of its lengths, was 11 at its stand) and far back (35), gathering and stretching, two flights a stride, feet gripping, mud kicked
   up. THE HEDGE: living bramble, green-black canes coiled as they come up and writhing open, arching over, curling at their tips,
   dark three-fingered leaves, big hooked thorns, writhing slowly while it stands, withering and sinking at the end.

## The pictures (`pictures/`)

- `action_fixes.mp4` (1200 × 676, 47.2 s, 30 a second, H.264 yuv420p, captioned): the Queen's dive with the knight, from in front
  (he runs clear of the marked ground) and from behind (he is caught in it), then its impact at half speed; the Rat King's cistern
  from above (the game's own picture pixels), the sluices opening on their own twice while he spits a word and while he rolls, the
  knight on the ledges; his roll close (twice as big), from in front and from behind, and at half speed; the deer's charge and its
  bramble with the knight (three times as big), from in front and from behind, its gallop at half speed, and the bramble withering.
- `action_fixes_sheet.png` (1200 wide): each one's old beside its new at the same scale (the old from the branch before, made by its
  own film tools at the same zoom), and the key moments of each.

Made by: `tools/action_fixes_film.ts` (the film), `tools/action_fixes_sheet.ts` and `tools/action_fixes_sheet.py` (the sheet),
`tools/action_fixes_peek.ts` (the helper's own stills). The scenes are each mock-up's own (src/dev/action_f7_queen_scene.ts,
src/dev/ratking_action_scene.ts, src/dev/action_f9_scene.ts).

## The checks

- `tests/queen_action.test.ts`, `tests/ratking_action.test.ts`, `tests/action_f9.test.ts`: each updated to its new numbers and
  passing (each mock-up's README says what each checks); the game's own frames hash as before in each.
- `tsc --noEmit -p tsconfig.json` clean.
- Changed outside the mock-ups' own files (no frame of the game's changes): art/rat_king.ts, its ball (`BALL_R`, `BALL_Z`,
  `ballPose`) exported (`export` added; nothing else).

## For him to decide (the art chat's to ask)

- How often the sluices open (a suggestion: every 14 s, the first 9 s into the fight).
- The Queen's dust: hanging 2.3 s over the area (it hides what is under it a moment), or thinner and shorter.
- The Rat King's roll: 13 tiles a second, 11 tiles long, held 0.8 s spinning up first.
- The deer's bramble: its thorns a dull red-brown (to read on its green-black canes), or darker.
