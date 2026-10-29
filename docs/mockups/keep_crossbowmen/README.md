# Floor 19, the Keep: the crossbowmen on the walls (mock-ups; the art chat's branch `mockup/keep-crossbowmen`)

The art chat's branch, from `origin/mockup/swan-gardens` at 55945b3 (floor 16 finished, whose mobs and boss are the
models). Nothing here is in the game until the main chat puts it there, on his yes. Nothing of the game imports any of it;
its switch, `CROSSBOW_ON`, is off.

The measure is floor 19's plan, approved by him: THE KEEP, "the old castle at the hill's crown, where the king lies
dying"; its palette cold stone, royal blue, old gold; its book Andersen's "The Nightingale" (1843), drawn only from the
book; its enemies: "Enemies: the king's knights, still loyal and silent in their armour, crossbowmen on the walls, and the
Silent Order's last."

## His pick, as given

Offered to him as a pop-up, "THE CROSSBOWMEN on the walls (small, one attack). How should they move?"; his pick, not the
one recommended: “Stand and shoot”, offered as "Same brief, but they plant and hold their spot."

The brief as offered: the keep's crossbowmen in padded jacks and kettle helms, royal blue tabards, a heavy crossbow and a
tall painted shield (a pavise) planted in front. Hushed: grey breath. Size: knight's size, in groups along the walls. Move:
they plant and hold their spot. Mark: the planted tall shield and the crossbow. Attack (one): a long aimed shot: a red aim
line, held, then the bolt in a flash, far and straight. Death: the crossbow drops, the Hush leaves them, they slump behind
the shield. Never: not elves or rangers, not undead. Sound: the crank, the thunk, the bolt's hiss.

Read as: turrets. They jog to a spot on the walls with the pavise on their backs, plant it, and hold the spot; small, one
attack. Built from the first pass to his rules for every new enemy: his Movement 9 (24 Oct, “Like the wind up and wind
down are big but the actual punch is lightning quick”, for “All attacks, melee most (Recommended)”; 28 Oct, “Start from
now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the
player gets to evade”), and his words on speed and size (28 Oct: “It’s all too slow and too narrow and too small.  I
could dodge anything you’ve put in these moves with my eyes closed”; “Everything is always so plodding when you first
animate them.  I could tell you I want a cheetah boss and it would walk around like an old dog.”).

## Their look (src/art/keep_crossbowmen.ts)

The old king's own crossbowmen, their words stolen like the city's: grown men, the knight's height (58), stocky; nothing
of a ranger about them (no hood, no cloak, no longbow, nothing light) and nothing of floor 16's guard (no plate, no plume,
no closed helm, not a head taller).

- A PADDED JACK of undyed linen, quilted in long channels, its sleeves quilted fat in rolls; over it A TABARD of the royal
  blue, front and back, edged old gold, THE KING'S BIRD in old gold on its breast and its back; dark hose; short boots
  with turned-down tops; a belt, and A BOLT CASE at the right hip, its bolts' fletching out of its top; leather gloves.
- A KETTLE HELM of cold steel: a round crown with a comb over it, a broad brim turned down all round, worn pushed back so
  that it clears the eyes in front; a strap under the chin. Under it their faces drained grey, a few days' stubble, the
  dull pink in their eyes, the mouth hanging open and working.
- THE HUSH, in the keep's cold: each breath out of the open mouth clouds grey before the face, rolls forward and up past
  the brim and thins away; held in as they aim, bursting out after the shot; pouring out in one great breath as it leaves
  them (art/hushed.ts `hushLeaves`, as the gardeners').
- THE HEAVY CROSSBOW (`CB`, `crossbowAt`): a walnut stock, thick at the butt; a steel prod lashed at its nose, its arms
  bending back as it is spanned; a hemp string to the nut; an iron stirrup at the nose; a long trigger lever under it; a
  CRANEQUIN on its right side, a geared drum and a crank with a wooden knob, and its rack along the top. It is a thing of
  its own (it has its own place at every moment), and the hands go to it: the right to its grip or its crank, the left
  under its fore-stock.
- THE PAVISE (`PAVISE`, `planted`, `onBack`): as tall as his chest (42), 22 across, its top corners cut; planks under
  painted canvas: the royal blue, a border of old gold, and THE KING'S BIRD in old gold (an original mark, from the book:
  the emperor's jewelled singing bird of gold, its tail raised, the key it was wound by standing from its back, on a
  branch, the king's crown over it); the paint chipped to the planks here and there; a raised spine down its middle; iron
  feet; behind, bare planks, a carrying strap and a prop. Planted 24 before their feet (`PLANTED_AT`, most of a tile),
  leaning back 6 degrees onto its prop; on the back while jogging, slung by its strap over the left shoulder, its painted
  face out behind them.
- WHAT GLOWS: nothing. The enemy's pink edge while they live; the dull pink in their eyes; nothing cyan anywhere.

## Their moves (src/art/keep_crossbowmen_moves.ts), and their numbers

Every move is made from smooth tracks through key poses, sampled sixty times a second (`make`); every frame the game shows
falls between them. Frames below are the game's thirty a second.

- STANDING (`stand`, 24 frames at 10 a second, 2.4 s round): planted behind the pavise, the crossbow on the right shoulder
  (its stock over the shoulder, the prod up behind the helm), the left thumb in the belt; breathing, the weight shifting,
  the head turning slowly along the walls (18 degrees either way), the mouth working, the Hush clouding.
- THE JOG (`walk`, 12 frames at 20 a second; `CB_PACE` 2.0 tiles a second, the knight walks 2.5): leaning into it, the
  pavise on the back bouncing, the left hand on its strap, the crossbow carried low in the right hand, its nose forward and
  down. Feet grip at that pace.
- THE PLANT (`more.plant`, 0.8 s): the left hand up over the shoulder to the pavise's top (0.12 s); swung off the back, up
  over the left shoulder and round the left side, the body twisting with it (to 0.40 s); driven down into the floor before
  them with a stamp of the left foot (0.40 to 0.47 s, `CB_PLANT.slam`), grit flying from its foot; the crossbow swung up
  onto the shoulder, the left foot drawn back (to 0.8 s).
- THE AIMED SHOT (`attack`, 2.1 s; `CB_SHOT`), his Movement 9:
  - THE WIND-UP, big and held (1.37 s): off the shoulder, the crossbow held up before them over the pavise (0 to 0.16 s);
    THE CRANK, two hard turns, the right hand on the knob (0.16 to 0.52 s); raised to the shoulder, the cheek on the
    stock, the body turned side-on and leaning into the pavise (0.52 to 0.72 s); the RED AIM LINE drawn out across the
    floor (0.62 to 0.76 s) and HELD at its full length 0.6 s (0.76 to 1.367 s: the warning), the crossbow trembling;
    steadied for the last 0.15 s (the last warning: the line flares). The Hush held in.
  - THE STRIKE, two frames (1.367 to 1.433 s, `CB_SHOT.strike`; the blow lands on the second, `CB_SHOT.hit`): the lever
    squeezed, the prod snaps forward, the string loosed, THE BOLT down the whole line, half way in the first frame and at
    its end, 12 tiles off, in the second (180 tiles a second); the crossbow kicks up 13 degrees and back; smeared with
    after-images (the strike's frames and the one after: `smearedAt`).
  - THE WIND-DOWN, big (0.67 s): the kick carried on to 18 degrees; rocked back on the heels, the Hush bursting out; the
    crossbow lowered before them, the string slack.
- THE RELOAD (`more.reload`, 2.2 s; `CB_RELOAD`), played after every shot: the crossbow held up before them over the
  pavise, the right hand on the crank, FIVE TURNS (0.16 to 1.30 s), the string drawn back a notch with each half turn
  until it clicks onto the nut; a bolt drawn from the case at the hip (1.46 s) and laid in the groove (1.64 s); back up
  onto the shoulder.
- STRUCK (`reel`, 0.4 s): jolted back, the head snapped back, the Hush coughed out; the crossbow stays on the shoulder.
- THE HUSH LEAVES HIM (`dying`, 2.6 s; `CB_DIES`): jolted; a gasp, the head thrown back, the Hush pouring out in one great
  grey breath (0.14 to 1.6 s); the crossbow drops from the shoulder (0.32 s) and falls clear to his right; his feet step
  back under him and his knees give (to 0.95 s); he sinks back onto his heels behind the pavise, slumped, his head bowed
  (1.6 s), the pink gone from his eyes: a man again, still. The pavise stands.

## Their aim line and their bolt (src/art/keep_crossbowmen_fx.ts)

Drawn by the game where they stand, `t` seconds into the shot (`shotPainted(t, view, deg, tiles)`: `under` the figures and
`over` them; `deg` turns it to where the game aims, `tiles` cuts it short at a wall). His “bigger AOE”: the danger is a
lane, not a thread.

- THE LANE (`CB_LANE`): from just before the pavise to 12 tiles from their feet, 0.8 of a tile across: a dither of deep
  warning red on the floor, its edges solid; drawn out in 0.14 s, held, pulsing; flaring for the last 0.15 s; gone the
  moment the bolt flies.
- THE SIGHT: a thin bright red line from the bolt's head along the crossbow, level, to the lane's end; it trembles with the
  crossbow and steadies with him.
- THE BOLT: a white-hot streak down the whole line in two frames, its after-images behind it; a burst of grit where it
  strikes at the end; the streak thinning and gone in 0.22 s, a wake of pale air along it (the hiss).
- THE RED is a deep warning red, its hues 0 to 12 degrees (`LINE_RED`): never the enemy's pink glow (300 to 350), never
  cyan.

## For the main chat: how to bring them in

- `CROSSBOWMAN` (a `Mob`), `makeCrossbowArt3()` for the game's pictures (front and back); the moves `stand`, `walk`,
  `attack`, `reel`, `dying`, and `more.plant`, `more.reload`.
- THE ORDER THE GAME PLAYS THEM IN (the checks' handovers, `CB_SHAPE.handovers`): jog to the spot, then `plant`, then
  stand; `attack` is always followed by `reload`, then stand; struck and dying from the stand. They are turrets: once
  planted they do not move again. (Struck or killed while still jogging: not drawn; for the main chat, either let them
  plant first or flash them without the reel.)
- THE SHOT: the line warns from 0.62 s, is at full length from 0.76 s; the bolt flies at 1.367 s and lands at 1.433 s
  (`CB_SHOT.hit`), 12 tiles out along the lane, hitting anything in the lane's 0.8 tile; draw `shotPainted` from where
  they stand, turned to where they aim, cut short at a wall.
- Sounds (his sound rule, as the brief says): the crank (the attack's two turns from 0.16 s, the reload's five), the thunk
  of the prod at 1.367 s, the bolt's hiss down the line; no voices, a gasp as they die.

## The checks (tests/keep_crossbowmen.test.ts)

1. the switch is off, and nothing of the game imports them;
2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`): every frame of every move (stand, jog, shot,
   struck, death, plant, reload), from in front and from behind, and every handover the game plays: nothing through them
   (the crossbow, its crank and prod, the pavise), feet that grip, nothing in the floor, nothing jerky, the blow (the bolt)
   drawn back, held and carried through, alive when still, and HIS LIGHTNING STRIKE;
3. the shot strikes in two frames and lands on the second, smeared then and only then;
4. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel
   whole or empty but the edge;
5. NOTHING CUT OFF; 6. NOTHING IN THE FLOOR (all they wear and carry, the pavise and its prop);
7. the Hush leaking while they live, a great breath of it as it leaves them, none once it has;
8. the dull pink in their eyes while they live, out once down; slumped low, behind the pavise;
9. the dropped crossbow lies clear of him and of the pavise, both ways round;
10. his brief: the knight's size; the pavise on the back jogging and planted after (the same spot in every move); the
    jog's pace; the hands on the crossbow; two turns of the crank in the wind-up, five in the reload; the string loosed
    and spanned; the bolt loosed and laid in;
11. the aim line and the bolt: 12 tiles, 0.8 across, held 0.6 s at full length, gone at the strike; the bolt half way,
    then at the end, in two frames; a deep warning red, never pink, never cyan;
12. nothing folds flat.

Shared tests touched (the smallest change, so that they know these new mock-up files): tests/bosses.test.ts (its two
lists of mock-ups that may use the bosses' review) and tests/hushed.test.ts (its list of mock-ups that take the Hush's
breath from art/hushed.ts) each name `keep_crossbowmen`.

## The dev page and the tools

- `src/dev/preview_keep_crossbowmen.ts`, on a floor of cold flagstones painted for the pictures only (floor 19's own
  ground is not made here): `sheet`, `big:<move>:<t>`, `zoom:<move>:<t>`, `head:<move>:<t>`, `grid:<move>:<t>,...`,
  `shot:<front|back>:<t>` (the shot at the arena's scale), `film` (frame by frame, `window.__film`).
- `tools/crossbow_shots.mjs` (several stills in one browser), `tools/crossbow_film.mjs` (the film, MP4).

## The pictures (pictures/)

To come.
