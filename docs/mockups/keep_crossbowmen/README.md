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
  blue, front and back, edged old gold, THE ROYAL SWAN in old gold on its breast and its back; dark hose; short boots
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
  painted canvas: the royal blue, a border of old gold, and THE ROYAL SWAN in old gold (his pick for the royal mark, “Keep the royal
  swan”: floor 16's royal crest, a swan, its wings raised, its neck in its S; `royalSwan`); the paint chipped to the planks here and there; a raised spine down its middle; iron
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
- HIS DEATH (`dying`, 2.6 s; `CB_DIES`): made new on 30 Oct; see "Their death" below.

## Their death (made new, 30 Oct)

To make Act 2's enemies differ (nearly every Hushed kind died the same way), offered to him as a pop-up: "THE CROSSBOWMEN
knocked back over the shield, the last bolt firing into the air, sprawling backwards, the shield falling flat ... the Hush
leaving them in a grey breath, alive." His pick: “Yes, these (Recommended)”. Only the death changed: every other move is
as it was, pixel for pixel (all 414 of their living frames, both ways round, painted before and after and found the same).

Read as: struck dead behind his planted pavise, he is thrown back hard and goes over backwards, away from it (it stands
before him); the trigger jerks and his last bolt goes up into the air; the pavise, nothing behind it now, tips back after
him and falls flat.

What it is (`deathPose`, `HELM`, `paviseDying` and `lastBolt` in `src/art/keep_crossbowmen_moves.ts`; seconds, and frames at
the game's 20 a second for a death):

- STRUCK (0 to 0.06 s): jolted back, his chest snapped back, his head thrown back; his right arm jerks the crossbow up off
  his shoulder, on end.
- THE LAST BOLT (0.06 s): the trigger jerks, the prod snaps, the string goes slack, and the bolt shoots straight up
  out of the crossbow: a white-hot streak (the shot's own white heat) climbing away at 19 tiles a second, its wake pale air,
  gone up into the dark 1.8 tiles above the crossbow by 0.155 s, its wake by 0.26 s (`LAST_BOLT`,
  `lastBoltAt(t)`). It is painted on his own picture, inside it.
- THROWN BACK, FAST (0 to 0.42 s): lifted off his feet at once (no foot slides), thrown back 1.25 tiles in under half a
  second; his feet swept up from under him, he goes over backwards, away from the pavise, his feet up above his hips in
  the air (0.38 to 0.50 s), his arms flung out wide, the crossbow still in his outflung right hand.
- THE CROSSBOW FLUNG (0.30 s): out of his right hand, out to his right; it clatters down on the floor beside him,
  flat, a little hop, and is still by 0.95 s.
- DOWN FLAT ON HIS BACK (0.42 s), a little bounce; his legs come down after him (0.52 s), spread; his
  arms slap down flat on the floor out at his sides. He lies 1.4 tiles behind where he stood, sprawled: arms and legs out.
- HIS HELM KNOCKED OFF (0.40 s) as his head comes down: flung back off his head, turning over, it comes down on the
  back of its brim behind his head, rocks on its brim, less and less, turning a little, and is still, crown up, by 1.55 s.
  Its chin strap is snapped.
- THE PAVISE AFTER HIM (0.13 to 1.04 s): its prop gives as he is thrown (0.11 s) and folds up against its back; it
  tips back toward him about its feet as a heavy board falls, slow to start and faster and faster (9 degrees back at
  0.40 s, 18 at 0.60, 38 at 0.80, 54 at 0.90, 77 at 1.00), and SLAPS DOWN FLAT ON ITS BACK at 1.04 s, the royal
  swan to the sky, its feet kicked forward along the floor, a little bounce; a puff of dust out from under its edges (to
  1.49 s); still. The heavy beat: 0.62 s after he is down. It lies between where he stood and his boots, clear of him.
- THE HUSH LEAVES HIM (0.50 to 1.62 s): coughed out of him by the blow; down, it rises out of him in a
  great grey breath, and thins away. The pink goes out of his eyes (0.45 to 1.1 s).
- STILL (from 1.2 s): his head lolls over to his right (0.62 to 1.2 s), and he lies still on his back, a man again,
  alive. Not a corpse, nothing gory.

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
  stand; `attack` is always followed by `reload`, then stand; struck from the stand; dying from the stand or from struck. They are turrets: once
  planted they do not move again. (Struck or killed while still jogging: not drawn; for the main chat, either let them
  plant first or flash them without the reel.)
- THE SHOT: the line warns from 0.62 s, is at full length from 0.76 s; the bolt flies at 1.367 s and lands at 1.433 s
  (`CB_SHOT.hit`), 12 tiles out along the lane, hitting anything in the lane's 0.8 tile; draw `shotPainted` from where
  they stand, turned to where they aim, cut short at a wall.
- Sounds (his sound rule, as the brief says): the crank (the attack's two turns from 0.16 s, the reload's five), the thunk
  of the prod at 1.367 s, the bolt's hiss down the line; no voices, a gasp as they die.
- WHAT CHANGED FOR THE GAME WITH THEIR NEW DEATH (30 Oct): only `dying`. Its length is as it was (2.6 s, `dieTime`; 53
  frames at the game's 20 a second), and the picture is as big as it was (300 by 240, its floor point at 132, 168). The
  last bolt is painted on his own picture, inside it: there is nothing new for the game to draw. But his death now covers
  ground behind his spot: he ends lying 1.4 tiles back (his head nearly 2 tiles back, his helm beyond it) and his pavise
  falls flat between; so let it be drawn whole there, and the game's one shadow under his feet should go back with him as
  he is thrown. Killed mid-aim or mid-reload, the crossbow is back on his shoulder in the death's first frame (as with the
  old death: a death starts from his stand); his body is within the handover rule there but for four frames of the shot's
  wind-down (3.07 against 3), the crossbow is not (a jump of up to 18). Sounds for it: the thunk of the last bolt at 0.06 s
  and its hiss up into the air; the thud as he lands, 0.42 s; the crossbow's clatter; the pavise's slap, 1.04 s.
  `CB_DIES`'s fields are new (`fire`, `prop`, `tip`, `drop`, `land`, `heels`, `out`, `breath`, `loll`, `helmOff`,
  `helmStill`, `slap`; the old `gasp`, `knees`, `sit` are gone); `LAST_BOLT` and `lastBoltAt` are new.

## The checks (tests/keep_crossbowmen.test.ts)

1. the switch is off, and nothing of the game imports them;
2. EVERY MOVE THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts `checkBoss`): every frame of every move (stand, jog, shot,
   struck, death, plant, reload), from in front and from behind, and every handover the game plays: nothing through them
   (the crossbow, its crank and prod, the pavise), feet that grip, nothing in the floor, nothing jerky, the blow (the bolt)
   drawn back, held and carried through, alive when still, and HIS LIGHTNING STRIKE;
3. the shot strikes in two frames and lands on the second, smeared then and only then;
4. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel
   whole or empty but the edge;
5. NOTHING CUT OFF; 6. NOTHING IN THE FLOOR (all they wear and carry, the pavise and its prop, lying or fallen; the helm's
   crown measured as the half shell it is painted);
7. the Hush leaking while they live, a great breath of it as it leaves them, none once it has;
8. the dull pink in their eyes while they live, out once down;
9. the flung crossbow lies clear of him and of the pavise, both ways round;
10. his brief: the knight's size; the pavise on the back jogging and planted after (the same spot in every move but his
    death); the
    jog's pace; the hands on the crossbow; two turns of the crank in the wind-up, five in the reload; the string loosed
    and spanned; the bolt loosed and laid in;
11. the aim line and the bolt: 12 tiles, 0.8 across, held 0.6 s at full length, gone at the strike; the bolt half way,
    then at the end, in two frames; a deep warning red, never pink, never cyan;
12. nothing folds flat;
13. HIS DEATH: thrown back more than a tile before he is down (by 0.45 s), off his feet at once; the last bolt loosed at the
    jerk, straight up, climbing away and gone; flat on his back, sprawled (arms and legs out), all of him behind where the
    pavise stood and clear of it as it lies, and still; the pavise tipped back after him a heavy beat later (0.4 s or
    more), flat on its back, face up, and still; the crossbow and his helm (crown up) down and still; his helm never in the
    floor; his handovers into his death from every frame of his stand and of struck.

Shared tests touched (the smallest change, so that they know these new mock-up files): tests/bosses.test.ts (its two
lists of mock-ups that may use the bosses' review) and tests/hushed.test.ts (its list of mock-ups that take the Hush's
breath from art/hushed.ts) each name `keep_crossbowmen`.

## The dev page and the tools

- `src/dev/preview_keep_crossbowmen.ts`, on a floor of cold flagstones painted for the pictures only (floor 19's own
  ground is not made here): `sheet`, `big:<move>:<t>`, `zoom:<move>:<t>`, `head:<move>:<t>`, `grid:<move>:<t>,...`,
  `shot:<front|back>:<t>` (the shot at the arena's scale), `at:<move>:<t>,<view>,<times>,<x>,<y>` (one of him, placed),
  `film` (frame by frame, `window.__film`), `deathsheet` and `deathfilm` (his death on its own).
- `tools/crossbow_shots.mjs` (several stills in one browser), `tools/crossbow_film.mjs` (the film, MP4; its last argument
  `deathfilm` makes the death's film).

## The pictures (pictures/)

- `crossbowmen_sheet.png`: standing, from in front and from behind, beside the knight, three times as big; and a group of
  them planted along the walls at the game's size, the knight before them.
- `crossbowmen_shot.png`: the aimed shot at the arena's scale, from in front: the red lane and the sight held across 12
  tiles, the knight standing in it 8 tiles off.
- `crossbowmen_film.mp4` (1200 by 680, 30 a second): every move, from in front and from behind, captioned, the knight for
  size: standing; the jog; the plant (half speed); the aimed shot and the reload after it at the arena's scale from in front
  (the knight steps out of the lane during the warning), and from behind (the knight stands at the line's end); the strike
  again at half speed, from in front and from behind; the reload; struck; the Hush leaving him. (Made before the new death:
  its last part shows the old one. Not made again: the death has its own film, below.)
- `crossbowmen_death_sheet.png` (1200 by 820): the new death in eight key frames from in front, twice the game's size: the
  last bolt up, thrown back, over with his legs up, down with his helm off, the pavise tipping, its slap and dust, the Hush
  leaving him, still.
- `crossbowmen_death.mp4` (1200 by 680, 30 a second, 15.5 s): the new death, captioned: at the game's size from in front
  and from behind, the knight beside him; each three times as big, the knight beside; then its first 1.4 s at half speed,
  from in front and from behind.

## His word on the pictures

The sheet, the shot and the film (`crossbowmen_sheet.png`, `crossbowmen_shot.png`, `crossbowmen_film.mp4`), asked
“Floor 19's crossbowmen (crossbowmen_sheet.png, crossbowmen_shot.png and the film): are these right? With them, floor 19
is complete.”: “Yes, that's them (Recommended)”.
