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

Their other moves are their stand for now: placeholders, not for use.

    node tools/preview.mjs src/dev/preview_act1_cult.ts shots/act1_cult_look.png 1014 640 look
    node tools/preview.mjs src/dev/preview_act1_cult.ts shots/ch_stand.png 900 2140 film:chanter:stand:10:2.4:front
    python3 tools/film_strip.py shots/ch_stand.png shots/chanter_stand.gif 24 10 300 3 2 260
    (the firepot thrower: film:pots:stand:10:2.0:front, 900 x 1820, 20 frames)
