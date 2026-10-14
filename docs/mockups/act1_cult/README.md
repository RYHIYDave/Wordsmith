# The cult's two new kinds for floors 6 to 10: the Chanter and the Firepot thrower

The art chat for floors 6 to 10 (13 Oct 2026), on the branch `mockup/act1-cult` (from `mockup/act1-quarry`,
bb7a5d7, floor 6 with his yes). NOTHING OF THE GAME IMPORTS ANY OF THIS: `src/art/act1_cultists.ts`, behind
`ACT1_CULT_ON` (off). Pictures to him first; the main chat puts them in.

## The brief

The planning chat's mob table (his doc "Wordsmith Act 1: The Descent (Levels 6–10)", kept with his yes), for
every area of the five: THE CHANTER (small), "A bolt of cursed words. Nearby cultists take less damage while it
lives, so kill it first."; THE FIREPOT THROWER (small), "Lobs pots that leave burning ground: the siege's
bombardier."

His answers, asked as pop-ups (his art rulebook's questions for a new character, and his sound rulebook's rule
7), 13 Oct:
- THE CHANTER, the one thing to know it by: "Hooded, a book of hymns (Recommended)", offered as: in the cult's
  violet robe, holding a great open book; pink rings pulse out as it chants, and the cultists it shields glow
  faintly pink. How it dies: "Its book burns", offered as: the book bursts into the cult's fire and burns away
  as it falls. Its sound: "Whispering voices", offered as: many whispers overlapping, rising as it casts.
- THE FIREPOT THROWER, the one thing to know it by: "A rack of pots on its back (Recommended)", offered as: a
  stooped cultist with a wooden frame of clay firepots on its back, one lit pot swinging from a sling. How it
  dies: "Its own pots go off (Recommended)", offered as: it falls; the pots on its back crack and burst in a
  whoosh of the cult's fire that burns out on the floor. Its sound: "Clinking clay and a whoosh
  (Recommended)", offered as: its pots clink as it walks; a fuse fizzes; the pot shatters with a whoosh of
  fire.
(The Chanter's three by 18:09; the Firepot thrower's by 18:28.)

## Their looks, standing (the first step)

Both are Mobs on the heroes' bones (art/new_mobs3.ts), of the cult's flock as the dagger cultist is
(art/cultists.ts: the cult's violet robe, a deep cowl with a point and two slashes of pink for eyes; its cowl
painted the same way here), a little shorter than the knight, the enemy's pink edge round them.
- `CHANTER`: its robe to the floor, the cult's pink stole down its front; it holds a great book of hymns open
  before it in both hands, low, its pages to the sky, rows of the cult's script burning pink on them (marks,
  not letters: his rulebook keeps letters for where a word is at work), their glow; its head bowed over it. Its
  stand (2.4 s round) chants: it sways, the book rising and falling with its voice, the script pulsing, and
  rings of the cult's power go out from it over the floor, one after another.
- `FIREPOT_THROWER`: stooped under a wooden rack lashed to its back, two poles from its hips to over its head
  and three crossbars, six clay firepots in it (two rows of three), their rag stoppers and cold fuses; its robe
  girded up to its knees with the cult's pink cord, its shins bound in rags; in its right fist a sling, the lit
  pot swinging below on its two cords, the fuse burning pink to gold and spitting sparks, its light. Its stand
  (2.0 s round): shifting under its load, the pots jiggling, the slung pot swinging, its cowl turning.


    node tools/preview.mjs src/dev/preview_act1_cult.ts shots/act1_cult_look.png 1014 640 look
    node tools/preview.mjs src/dev/preview_act1_cult.ts shots/ch_stand.png 900 2140 film:chanter:stand:10:2.4:front
    python3 tools/film_strip.py shots/ch_stand.png shots/chanter_stand.gif 24 10 300 3 2 260
    (the firepot thrower: film:pots:stand:10:2.0:front, 900 x 1820, 20 frames)

Asked as a pop-up "Are these the Chanter and the Firepot thrower?", his pick by 18:35 (13 Oct): "Yes, animate
them (Recommended)", offered as: next their walks, their attacks (the cursed bolt, the lobbed pot), flinches and
deaths, as films.

## Their moves

Every move of both through the whole review the bosses have (art/boss_checks.ts; their shapes in
tests/act1_cult_shape.ts): nothing through the body, feet that grip, nothing into the floor, nothing that jerks,
blows that wind up and follow through (their throws streaked on the frames they fly), breath when still.
- THE CHANTER (`CH_PACE` 1.0 tiles a second): walk, a slow procession (8 frames at 8 a second); attack, THE
  BOLT OF CURSED WORDS (`CH_BOLT`: 1.2 s; it heaves the book up before it, the script blazing, held (the
  warning, from 0.25); thrusts the book out at you, its pages turned to you, at 19/30 s, and the bolt leaves
  them, from `chanterBookAt()`); reel (0.3 s); dying, "Its book burns" (`CH_DIES`: 1.6 s; thrown back, the
  book catches the cult's fire at 0.14, on its knees at 0.5 holding it burning, on its face at 0.9, its feet
  where it stood; the book burns away to a heap of ash by 1.35; no light at the end). The bolt in flight:
  `curseBolt(0..3)` (a knot of the cult's script whirling round a burning heart; its light; no edge). ITS WARD,
  for the cultists it shields (his pick's "the cultists it shields glow faintly pink"): `chantWard(0..3)`, a
  faint ring of pink marks turning at one's feet (8 a second), a floor piece. How far it shields and how much
  are the main chat's.
- THE FIREPOT THROWER (`POTS_PACE` 1.1): walk, a hunched trudge (8 frames at 8 a second); attack, THE LOB
  (`POTS_LOB`: 1.7 s; it hauls the sling up and whirls the pot round over its head, faster and faster, the fuse
  flaring (the warning, from 0.4); heaves forward and lets it fly at 27/30 s (`potsPotAt()` where the pot is);
  the sling empty, it reaches back over its shoulder to its rack and has another pot in the sling by 1.36);
  reel (0.3 s); dying, "Its own pots go off" (`POTS_DIES`: 1.9 s; on its knees at 0.36, on its face at 0.68,
  its feet where it stood; the pots on its back burst at 0.74 in a whoosh of the cult's fire, shards flung,
  the fire out by 1.75; the slung pot comes down by its hand; no light at the end). The pot in flight:
  `firepotFlying(turn)` (`FIREPOT_FRAMES` 8 a turn, the enemy's edge, its fuse's light); where it comes down,
  `firepotFire(0..3)` the burst, then `firepotFire(4..7)` the fire burning on the floor, round and round for as
  long as the game keeps it (a floor piece; its light). How far, how long it burns and what it hurts are the
  main chat's.

    node tools/preview.mjs src/dev/preview_act1_cult.ts shots/ch_seq.png 900 10660 seq:chanter:20
    python3 tools/film_strip.py shots/ch_seq.png shots/chanter_moves.gif 122 20 300 3 1 260
    node tools/preview.mjs src/dev/preview_act1_cult.ts shots/ch_shot.png 1280 7600 shotfilm:chanter:20
    python3 tools/film_strip.py shots/ch_shot.png shots/chanter_bolt.gif 37 20 640 2 1 400
    (the thrower: seq:pots:20, 900 x 11180, 128 frames; shotfilm:pots:20, 1280 x 9600, 47 frames)

`tests/act1_cultists.test.ts` (8): the switch off and nothing importing it; crisp, the pink edge on the
living and none on the dying; nothing cyan, every light the cult's fire; nothing cut off at the canvas's
edge; about the knight's height; the whole review; the book burning and the pots going off, no light at the
end; what they send crisp.

Asked as a pop-up "Are the Chanter's and the Firepot thrower's moves right?", his pick by 19:26 (13 Oct): "Yes,
send them to main (Recommended)", offered as: both go to the main chat; then floor 7, the Ledge Road, its
ground and sky first.
