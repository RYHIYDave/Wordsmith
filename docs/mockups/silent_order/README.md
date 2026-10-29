# The Silent Order, the High City's medium mob (floors 17, 19 and 20): its art (mock-up; branch `mockup/silent-order`)

A helper of the art chat made this, on its own branch from `origin/mockup/swan-gardens`. Nothing here is in the game until
the main chat puts it there, on his yes. Nothing of the game imports any of it, and its switch, `ORDER_ON`, is off.

## The brief

The High City plan (his doc, approved by him): floor 17's enemies include "the Silent Order among the guests" (the
prince's masked ball); floor 19's "the Silent Order's last" (the Keep); floor 20's "the Silent Order's last masks" (the
Quiet Tower, the lair of the Moth, grey fog, no colour). The story: "the prince opened the city to the Silent Order in
return for his walls."

His pick for how they move: “Still, then sudden (Recommended)”.

The brief as offered: the cult that let the Hush in; black velvet hooded cloaks, the Order's blank white mask with no
mouth; on 17 cloaked guests mingling at the ball; on 19 the Order's last, armed, cloaks over mail; on 20 only their masks,
floating in the fog; the knight's size; utterly still, then a sudden rush close; their mark the mouthless mask; two
attacks, a hushing palm that darkens your words and a thrown curved knife; dying, the mask cracks in two and the cloak
falls empty to the floor; never gory, not a clown or a ghost; no sound at all, only cloth.

Built in from the first pass, his words of 24 and 28 Oct: Movement 9, “Like the wind up and wind down are big but the
actual punch is lightning quick” (for enemies, “Start from now on, but every enemy is going to need that change
eventually.  And bigger AOE to compensate for the extra time the player gets to evade”), and “It’s all too slow and too
narrow and too small.  I could dodge anything you’ve put in these moves with my eyes closed”. So every blow is a big held
wind-up, a strike of two frames smeared with its after-images, and a big wind-down; the rush is the same, still and then
two frames; and their pace and their reach are measured in tiles (`TILE3`).

## His words on it

- Asked “The Silent Order (sheet.png, crowd.png and the film): is this the cult? The floor 20 masks are meant to be faint in
  their fog.”: “Yes, that's the Order (Recommended)”.
- Asked “The armed Order on floor 19 throws one curved knife. Should it throw a fan of three instead?” (offered as: a wider
  area for the armed ones; the guests keep one): “A fan of three on 19 (Recommended)”. Done: the armed last draws three
  knives from the belt in the same wind-up, holds them fanned in the fist, and throws all three in the same two frames,
  `KNIFE_FAN.spread` = 35 degrees apart (`fanOf('armed')`: -35, 0, 35), each flying 8 tiles at 20 tiles a second,
  spinning, smeared, and lying where it comes down. The guest and the masks keep one. Picture: `pictures/fan_of_three.png`
  (the film was made before it, and shows the armed last throwing one).

## One design, three dressings (src/art/silent_order.ts)

On the heroes' bones, the knight's size (58 tall; the armed last 59 and broader). `ORDER_GUEST`, `ORDER_ARMED`,
`ORDER_MASK` (src/art/silent_order_moves.ts); `makeOrderArt3(mob)` gives `{ front, back }`; their other moves are
`more.knife` and `more.rush`.

- THE MASK, theirs (as the Lower City's banners and hooded lanterns have it, src/art/act2_set.ts): a blank oval of bone
  white, sculpted (a brow, the ridge of a nose, hollowed cheeks, a narrow chin), two almond eye holes drawn a little
  toward whoever looks (as the heroes' eyes are), NO MOUTH. In the dark of each eye hole the dull pink of the Hush (the
  only colour on them), flaring brighter through a warning and the rush. Seen from behind, its inside.
- THE GUEST (17): a deep hood and a domino cloak of black velvet to the floor, lined dull grey, open before them, its
  front edges piped grey, its hem edged grey, a mantle over the shoulders and a silver clasp at the throat (the blank mask
  on it); under it court clothes: a charcoal doublet buttoned in silver, a cascade of bone-white lace at the throat and the
  wrists, black breeches, grey silk stockings, black buckled shoes; bone-white gloves; a grey sash, a curved knife in it.
- THE ARMED LAST (19): the same cloak over a hauberk of mail to the knee and mail sleeves; black leather vambraces and
  boots; grey steel gauntlets; a broad belt with curved knives sheathed round its front and a baldric across the chest with
  three more, their handles bone.
- THE MASKS (20): only the mask, floating where the face would be, held up by grey fog: a wisp of it in the hood's shape
  round the mask, a neck of it under it, and below the cloak's ghost of a shape, barely there, a few grey grains drifting on
  its surface and thinning to nothing at the floor. Their arms thicken into fog when they strike or throw; the knife is
  real steel. The fog is laid as grains (no pink edge of its own); the mask (and the knife in hand) wear the edge.
- THE CURVED KNIFE: a crescent of blackened steel, its edge ground bright, a bone handle (`KNIFE`, `knifeOf`).
- Colours: black velvet, bone white, grey; the dull pink only in the eye holes, the knife's pink glint in the warning, and
  the enemy's pink edge while they live. Nothing cyan (the test looks).

## Their moves (src/art/silent_order_moves.ts) and their numbers

Frames are the game's thirty a second unless said.

- STANDING (`ORDER_STAND`, 32 frames at 10 a second, 3.2 s round): utterly still, the hands folded before the waist; the
  breath barely shows (the chest rises 0.78 game pixels either way, the weight shifts under a pixel: the least the review
  passes); the masked head tilts a hair and back; only the cloak stirs.
- THE RUN (their walk; `ORDER_PACE` 5.5 tiles a second, twice the knight's 2.5 and more; `ORDER_RUN` 10 frames at 30):
  above the waist as still as they stand, hands folded, the mask level and on you; below, the legs race under the cloak,
  the heels flicking up behind, its back streaming out flat and flapping off each stride. Feet grip (the review's).
- THE RUSH (`more.rush`, `RUSH`, 0.9 s; "still, then sudden"): still to 0.18 s; a flick of a crouch to 0.30 s; the
  launch, two frames (0.30 to 0.367 s, its strike, smeared); in the air from 0.30 to 0.50 s, low and flung forward, the
  front foot reaching, the back one trailing, THE GAME CARRYING THEM `RUSH.carry` = 4.5 tiles in 0.2 s (`rushCarry(t)`:
  how far, along their forward, at each moment; none before the launch, all of it by the landing; both feet off the floor
  all the while it carries them); landed at 0.50 s on the front foot, the cloak flying on past them and settling; still by
  0.80 s. Smeared through the air: after-images of them streaked back along the way they came, and their ghosts, dark and
  broken, a tile and more behind. The game may play it again and again to close on you.
- THE HUSHING PALM (`attack`, `PALM`, 2.0 s, the blow at frame 28 = 0.933 s): the left forefinger laid before the
  mouthless mask; the right palm drawn back out beside the head, fingers up, the body turned away and coiled low, the grey
  of the Hush drawn spiralling into the palm, the eye holes flaring (THE WARNING, held 0.44 to 0.867 s, shaking); the left
  foot forward and the right back into the coil; hips first; THE STRIKE in two frames (26 to 28), smeared: the palm thrust
  out at arm's length, the lunge onto the front foot, the back heel up; THE GREY WAVE bursts from it (below); the palm held
  out as the wave rolls on (to 1.34 s); drawn back; at rest by 2.0 s.
- THE GREY WAVE (src/art/silent_order_fx.ts, `PALM_WAVE`, `wavePainted(t, view, reach)`, from the blow): its front races
  out over a cone before them in four frames, `PALM_WAVE.reach` = 5.5 tiles out and 100 degrees across (`half` 50); the
  floor under it dimmed, streaks of grey swept across it, its front a wall of grey murk rolling and breathing, grey rising
  off it; it hangs to 0.95 s and is gone by 1.4 s. Grey, never cyan, no pink. Words caught in it are darkened: the game's
  (`inWave(x, y, t)` says whether a spot of the floor is in it). A sixth of a boss arena and more, from a medium mob: his
  “bigger AOE”.
- THE CURVED KNIFE (`more.knife`, `THROW`, 2.0 s, the blow at 0.933 s): a knife drawn from the left hip (0.10 to 0.24 s);
  swung out before the chest and up behind the right shoulder (round the head, never across it); raised high, the left hand
  levelled at you, leaning back, its edge glinting pink (THE WARNING, held 0.46 to 0.867 s, shaking); hips first; THE
  THROW in two frames (26 to 28), smeared: the arm whips over and the knife leaves the hand at the blow (`knifeLeaves(mob)`:
  where, from their floor point); carried right through and down to the left knee; drawn back up; at rest by 2.0 s.
- THE ARMED LAST'S FAN OF THREE (his pick): three knives drawn from the belt, fanned in the fist (`fannedOf`), thrown
  together; in flight each goes its own way (`fanOf('armed')`, 35 degrees apart), drawn by `knifePainted(t, view, z0, way)`.
- THE KNIFE IN FLIGHT (`KNIFE_FLIGHT`: 20 tiles a second, 8 tiles, spinning 6 turns a second; `knifeAt(t, z0)`,
  `knifePainted(t, view, z0)`): spinning end over end, smeared (its edge where it was a third and two thirds of a frame ago,
  and a streak behind it), dropping a little; at 8 tiles (0.4 s) it falls to the floor and lies there. The game moves it
  (`knifeAt(t).x` tiles along their forward from where it left the hand) and draws its shadow.
- STRUCK (`ORDER_REEL` 0.4 s): jolted back, the head thrown back, the cloak flung.
- THE MASK CRACKS, THE CLOAK FALLS EMPTY (`ORDER_DIES`, 2.2 s): jolted; then utterly still while a crack runs down the mask
  from the brow (0.12 to 0.30 s) and the pink gutters out of its eyes; it splits, and the halves fall away from the face,
  the left at 0.34 s, the right at 0.37 s (`Mob.fall`: they land and lie face up, clear before the heap); at 0.40 s there
  is no one in the cloak: a last grey breath out of the empty hood, and the cloak falls straight down, emptied, crumpling into
  a heap of velvet on the floor by about 1.1 s, the empty hood on top of it, dust thrown up off the floor round it (the armed
  last's belt of knives on the heap). THE MASKS: the mask cracks and falls the same, and their fog is flung out and gone.
  Never gory.

## How the main chat brings it in

- Their pictures: `makeOrderArt3(ORDER_GUEST | ORDER_ARMED | ORDER_MASK)`, as floor 16's guard (`makeGuardArt3`). Their
  stand loops; their run is their walk (`pace` 5.5); the palm is `attack` (its `hit`), the knife and the rush are in
  `clips.moves` (`knife` with its `hit`, `rush`).
- The rush: while it plays, carry them `rushCarry(t)` along their forward (it is 0 until 0.30 s and 4.5 tiles by 0.50 s);
  they hand over to their stand at its end where they landed. Chained rushes close on you 4.5 tiles at a time.
- The palm: at its `hit`, lay `wavePainted(t, view)` at their floor point turned their way (its canvas `WAVE_CANVAS`);
  what is in it is `inWave`. The size is `PALM_WAVE.reach` (drawn to the size the game gives it).
- The knife: at the knife's `hit`, launch it from `knifeLeaves(mob)`; draw `knifePainted(t, view, z0)` (its canvas
  `KNIFE_CANVAS`) at `knifeAt(t, z0).x` tiles along their forward.
- Their picture is `ORDER_CANVAS` (340 by 260, the floor point at 176, 200): room for the knife raised high, the palm
  thrust out, the cloak flung and the rush's streak behind.
- Sound (his sound rulebook's, the brief as offered): none at all, only cloth.

## The checks (tests/silent_order.test.ts, 11; all 11 pass)

1. The switch is off, and nothing of the game imports them.
2. EVERY MOVE OF ALL THREE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts, `checkBoss`): every frame, from in front and
   from behind, every handover (`ORDER_SHAPES`): slide, floor, arm, through, jerk, jump, blow, hips, alive, strike.
3. His lightning strikes: the palm, the knife and the rush's launch each strike in two frames, the blows landing on the
   second; smeared then (and the frame after), and nothing else smeared.
4. Every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel
   whole or empty but the edge.
5. Nothing cut off. 6. Nothing of them in the floor.
7. The pink only in the eye holes (and the knife's glint as it is wound up): lit while they live, out as they die; their
   grains grey, never pink, never cyan.
8. The mask cracks in two and the cloak falls empty: whole, then two halves; nobody in the cloak once it empties; the
   halves lie clear of the heap; the heap lies low (under 0.42 of their standing height); the masks' fog gone.
9. The brief's sizes and speeds, in tiles: the knight's size; two blows; the run 5.5 tiles a second; the rush 4.5 tiles
   in 0.2 s, both feet off the floor while carried, still before it; the wave 5.5 tiles and 100 degrees, out in four frames;
   the knife 8 tiles at 20 a second, then lying; the warnings held a third of a second and more.
10. Nothing they wear folds flat; the wave and the knife hold nothing cyan, the wave no pink.
11. His fan of three: the armed last throws three, 30 to 40 degrees apart, three in the fist through the warning; the guest
    and the masks one; each of the three painted flying its own way, nothing cyan.

Floor 16's models still pass with it (tests/palace_hands.test.ts, tests/princess.test.ts, tests/palace_guard.test.ts: 29
of 29), and tests/bosses.test.ts (14 of 14); `tsc --noEmit` is clean. `src/art/boss_checks.ts` is unchanged. `tests/bosses.test.ts`'s two lists of mock-up files that may use the bosses' helpers
and checks name `silent_order` too (the smallest change: the same as for the Princess's and the guard's).

## The dev pages and the film

- `src/dev/preview_silent_order.ts`: `sheet`, `crowd`, `big:<guest|armed|mask>:<move>:<t>`, `grid:<who>:<move>:<t>,<t>,...`,
  `filmframe:<all|who>:<k>`, `film:<all|who>` (src/dev/order_film_plan.ts; src/dev/order_kit.ts, the ballroom floor).
- `node tools/order_film.mjs <all|guest|armed|mask> <out.mp4>`: the film, frame by frame, to an MP4 (30 a second, H.264).

## The pictures (docs/mockups/silent_order/pictures/)

Each about 1200 wide, for a phone. In the grids, each column a moment (its time in seconds above it), from in front on top,
from behind below, three times as big.

- `sheet.png`: standing, from in front and from behind, the guest, the armed last and the masks, between the knight from
  in front and from behind, three times as big.
- `crowd.png`: at the game's size, a few of each with the knight; and the same twice as big.
- `close_guest.png`, `close_armed.png`, `close_masks.png`: each standing, four times as big, from in front and from behind
  (the mask, the court clothes, the mail and the knives, the fog).
- `moves_palm.png`: the guest's hushing palm (the held warning, the two-frame strike smeared, held out, drawn back).
- `fan_of_three.png`: the armed last's fan of three: held fanned and thrown (three times as big, in front and behind), then
  in flight and lying where they came down (at the game's size, the knight in it), in front and behind.
- `moves_knife.png`: the armed last's curved knife (made before the fan: one knife) (drawn, raised and held, the two-frame throw smeared, carried through).
- `moves_rush.png`: the guest's rush (still, the crouch, the launch, in the air smeared, landed, still).
- `moves_run.png`: the armed last's run, one stride.
- `moves_death.png`: the guest's death (the crack, the halves falling, the cloak empty and falling, the heap).
- `moves_death_masks.png`: the masks' death (the crack, the fog scattering, the halves lying).
- `film.mp4` (47 s, 30 frames a second, 1200 by 1300): every move of all three on a ballroom floor of tiles, twice the game's
  size, the knight in it for size, from in front (above) and from behind (below), captioned: the guest's stand, rush (and at
  half speed), run, palm with its wave (and at half speed), knife in flight (and at half speed), struck, death; then the
  armed last's and the masks' at full speed.

## Open for him to decide

- The masks (20) are a mask held up by fog, the cloak's shape barely there; on a dark floor they are faint by design, and
  the Quiet Tower's own grey fog will change how they read: worth seeing them on that floor once it is painted.
- The wave darkens words: how dark, and for how long after you leave it, is the game's.
