# Mock-up: THE HEADSMAN, MADE NEW (NOT IN THE GAME until the main chat puts him there)

**What it is.** Floor 2's boss drawn again from nothing: his look, and every move of his, all new. He is
behind a switch that is off: `HEADSMAN2` in `src/art/headsman2.ts`. Nothing of the game imports him
(tests/headsman2.test.ts checks it); the game's Headsman is the first one (`src/art/bosses3.ts`), as before.
Branch: `mockup/headsman-redo`, from main at Version 22.1 (99a128c).

- `src/art/headsman2.ts`: his look (his build, his coat, his hood, his axe; his painter).
- `src/art/headsman2_moves.ts`: his moves; `HEADSMAN_2` (a `Mob`, as the game holds a monster);
  `makeHeadsman2Art()`; `H2_SHAPE`, what the boss checks see of him.
- Films of each move: `src/dev/preview_bosses.ts`, mode `h2:<move>` (e.g. `h2:vault`); the old and the new
  side by side: mode `redo`.

## His words (times Eastern)

- To the main chat, 17 Oct 2026, 11:37, sent to the art chat at his word: "I’d like the headsman completely
  redesigned to be sleeker and more agile."
- His picks, one pop-up, by 15:55: his build, "Lean, with a long axe (Recommended)"; how he moves,
  "Darting dashes"; his attacks, "All new attacks".
- To the first look of him, by 17:51: "The crescent head of the axe is weird, and I like the full coat look
  with the wiry frame underneath". And of four attacks offered, "Yes, these four (Recommended)".
- To the second look (a solid blade, the long coat), by 17:57: "Yes, animate him (Recommended)".
- At 17:57: "Make sure he passes the clipping checks". Read as: every boss check, every move, from in front
  and from behind; nothing through him or his coat; nothing cut off; and nothing of him goes to him until it
  all passes.

## What he is

Lean and wiry, the Warden's height, in tight leathers and knee boots under a long coat of dark leather cut
close, from his throat to his calves, its skirts split before and behind so that they part as he strides and
fly out after him as he darts. The executioner's tall pointed hood, blood-red, swept back like a flame, and
nobody in it: two points of pink burning in the dark. A short cape of the hood's red over his shoulders; a
blood-red sash at his waist, its two tails flying. A long axe, its haft as long as he is tall, bound in iron,
a spike at its foot, a broad blade of black steel with a bright edge (not a crescent), a blood-red tassel
under its head; held at its middle and spun like a staff.

## His moves (seconds from each move's start; `src/art/headsman2_moves.ts`)

His stand and every other move begin and end in his guard (on his toes, the axe up behind his right
shoulder). Where a move carries him, it ends where he has gone to, and the game moves him there when it ends
(`H2_SHIFT`, in tiles: forward, to his left).

- **Stand** (idle): 20 frames at 10 a second (2.0 s round). Light on his feet, bouncing on his knees, his
  weight from foot to foot, his hood keeping you in it.
- **Prowl** (walk): 10 frames at 15 a second (0.67 s a round), painted for `H2_PACE` 1.6 tiles a second; low
  and quick, the axe carried up by his right shoulder. **Setting off** 0.34 s; **stopping** 0.41 s.
- **The lunge** (attack, his basic): 1.5 s, 30 frames a second. He coils, the axe swung down and back low
  behind him (0.13 to 0.26); held, trembling (the warning, 0.26 to 0.5); his left foot shoots a long stride
  forward (0.5 to 0.59), his hips and then his chest turn, and the blade comes round flat and low at full
  reach and hooks across before him: THE BLOW at `H2_LUNGE_HIT` 0.6 (its edge about 3.2 tiles before where
  he stands and 1.3 to his left, going on round to his left); a band of fire along its path; he springs back
  onto his feet (0.92 to 1.2) and is in his guard by 1.5, where he began.
- **The flurry**: 2.38 s. The axe cocked high behind his right shoulder in both hands, held, trembling (the
  warning, 0.22 to 0.42); then three darts, a cut at each (`H2_FLURRY_HITS`): 0.62, forward and to his left,
  the blade down across him from his right (its edge about 3.4 tiles forward); 1.08, forward and to his right,
  the blade down across him from his left (about 4.0 tiles forward); 1.54, straight on, the heaviest: the axe
  over his head and down before him, ITS BLADE BITING THE FLOOR about 5.4 tiles forward at about 1.6 (stone
  chips and dust), stopped dead there, and wrenched up out of it from 1.74; in his guard by 2.38, 2.3 tiles
  forward of where he began (`H2_SHIFT.flurry`).
- **The blade wheel**: 2.36 s (`H2_WHEEL`). He squares up, the axe upright before him in his right hand at
  its middle, held (the warning, 0.24 to 0.5); he spins it like a staff, a wheel of steel before him, from 0.5,
  at full spin by 0.78, a ring of the enemy's fire where its edge goes round; the blade first comes down
  before him at `H2_WHEEL.hit` 0.8 (and at each turn after: about 2.7 turns a second; how often it strikes is
  the rules'); he drives forward behind it from 0.6 to 1.7, 2.5 tiles, running; it slows from 1.62 and stops
  by 1.86; in his guard by 2.36, 2.5 tiles on (`H2_SHIFT.wheel`).
- **The vault**: 2.0 s (`H2_VAULT`). He drives the spike of the axe into the floor before him and to his
  right and crouches behind it, gripping the haft high, the edge glinting over him (the warning, 0.26 on; the
  game marks the spot); springs up off it at 0.56, up and over on the haft, tears it out and swings it over
  his head (the top of his leap at 0.84, his hips 42 of his lengths up); lands at 1.1 and the blade comes
  down blade first: THE BLOW at `H2_VAULT.hit` 1.12, its edge on the floor about 4.5 tiles before where he
  began (THE SPOT), driving on into the stone a little and stopped dead there, held while he sinks onto his
  heels; wrenched out from 1.42; in his guard by 2.0, 1.5 tiles on (`H2_SHIFT.vault`).
- **The dashes** (dashL, dashR): 0.5 s each, a quick low bound 1.5 tiles to his left or his right
  (`H2_DASH`): he dips, pushes off; his near foot up 0.1 to 0.33, his far foot up 0.16 to 0.42, both off the
  floor between; his coat streaming; in his guard where he landed (`H2_SHIFT.dashL`, `dashR`).
- **Struck** (reel): 0.3 s. Rocked back on his toes, his hood knocked back, his coat and the fire in his hood
  flaring.
- **His death**, as the first Headsman's, which he said yes to on 9 Oct ("His hood falls empty"): 2.6 s, 53
  frames at the game's 20 a second; rocked back, the fire in his hood flaring; the axe slips from his hands
  at 0.3 and falls clear of him; his knees give and he sinks onto them; he folds forward and topples onto his
  face (down by 2.1); his hood slides off at 1.32 and rolls clear by itself, empty, the last of the pink
  rising out of his collar. No pink edge as he dies.

## How it is checked (tests/headsman2.test.ts, 7 tests)

1. The switch is off; nothing of the game imports him.
2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (`src/art/boss_checks.ts`, the art rulebook's), every frame,
   from in front and from behind: nothing through him or his coat (the haft, the collar and the blade
   against his legs, coat skirts, arms, chest, belly, hips and hood), feet that grip, nothing in the floor,
   nothing jerky, nothing that jumps from one move to the next (from his stand into each and back, into his
   prowl and out of it; a move that carries him ending where the game puts him), blows drawn back, held and
   carried through, hips first, alive when still. 0 findings.
3. Every frame of every move both ways round: nothing cyan; his pink edge while he lives and none as he
   dies; every pixel whole or empty but the edge; no pixel alone.
4. Nothing cut off: in every frame he is inside his picture with room to spare (at least 8 pixels; his
   canvas, `H2_CANVAS`, 460 by 430).
5. Nothing of him in the floor, all he wears and carries (his coat, his sash, his cape, his hood, his
   axe), but his blade's edge where it bites (the vault, the flurry's third cut: no more than 4 of his own
   lengths) and the spike he vaults on.
6. Where his blade bites the floor it stops dead and stays where it bit while he is bent over it.
7. His axe and his hood, fallen, lie clear of him once he is down, from in front and from behind.

And: `tests/bosses.test.ts` (the first Headsman and the other bosses, unchanged); tsc; the whole unit suite.
The checks' one addition (`src/art/boss_checks.ts`): a handover may say how far the move has carried him
(`Handover.shift`), so that a move that ends where he has gone to is checked against his stand there.

## His room

Every frame both ways round, as the game would hold them (trimmed pictures, 4 bytes a pixel, counted by
`makeHeadsman2Art()`): 806 frames, 53.1 MB. The first Headsman's: 1122 frames, 69.5 MB.

## To make him the game's (the main chat)

- `HEADSMAN2.on`, and the bestiary to make him by `makeHeadsman2Art()` in place of the first Headsman's
  (both are `id: 'headsman'`).
- HIS FIGHT IS YOURS TO CHANGE TO THESE (his pick, "All new attacks"): the lunge, the flurry, the blade wheel
  and the vault, and the dashes, with the timings above; what each blow hurts and how far, the vault's mark,
  and when he dashes, are the rules'. His moves are on `HEADSMAN_2.more` (`flurry`, `wheel`, `vault`,
  `dashL`, `dashR`, and `setOff`, `halt`), the lunge as his attack.
- Where a move carries him (`H2_SHIFT`: the flurry, the wheel, the vault, the dashes), move him by it when it
  ends.
- Paint him ahead with the rest of his floor (anything painted first in a fight is a stall).
