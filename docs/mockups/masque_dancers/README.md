# Floor 17, the Masque: the masked dancers (a mock-up; the branch `mockup/masque-dancers`)

Made for the art chat from `origin/mockup/swan-gardens` (floor 16, its mobs and its boss the models). Nothing here is in the
game until the main chat puts it there, on his yes. Nothing of the game imports any of it; its switch, `DANCERS_ON`, is off.

Floor 17, THE MASQUE: the Prince's masked ball, gone on for weeks, in a suite of seven rooms each in its own colour (blue,
purple, green, orange, white, violet, and a black one lit red through its windows), from Poe's "The Masque of the Red Death"
(1842), drawn only from the book. The floor's plan, approved by him: "Enemies: masked dancers who waltz until they notice
you, footmen, and the Silent Order among the guests." Its hazard: "the great ebony clock in the black room. Every so often it
chimes: every dancer stops dead and turns to look at you, then the music starts again and they all come at once."

## His pick

How they move, offered to him as a pop-up: “Gliding fast, whirling (Recommended)”.

The brief as offered with it: MASKED DANCERS (floor 17, small). Courtiers at the prince's ball, in gowns and frock coats of
the seven rooms' colours, each in a white porcelain mask; Hushed, grey breath; knight's size, in crowds, fun to smash; they
waltz in pairs round the room until they see you, then break off and whirl at you, fast; at the clock's chime they freeze and
turn to look; known by the masks, and dancing in pairs; one attack, a whirling spin into you, skirts and coat-tails flaring;
their death, the mask drops, the Hush leaves them, they sink down in a last bow; never clowns, never undead or gory; their
sound, a faint waltz around them, silent dancers. (Their death was made new on 30 Oct, on his pick: see "Their death" below.)

Built in from the first pass, from his words on the Princess (28 Oct): his Movement 9 (“Like the wind up and wind down are big
but the actual punch is lightning quick”; for the enemies, “Start from now on, but every enemy is going to need that change
eventually.  And bigger AOE to compensate for the extra time the player gets to evade”), and “It’s all too slow and too
narrow and too small.  I could dodge anything you’ve put in these moves with my eyes closed”, “Everything is always so
plodding when you first animate them”, “like the prince with a rapier, dancing is going to need to be fast and constantly
moving”. So they whirl at 3.4 tiles a second, three turns a second; their spin strikes in two frames and carries them a tile
and a quarter into you, striking a tile and a half round.

## The pictures (docs/mockups/masque_dancers/pictures/)

- `sheet.png`: the lady and the gentleman standing, from in front and from behind, beside the knight, three times as big.
- `crowd.png`: a crowd at the game's size (twice as big, for the phone): pairs waltzing in the seven rooms' colours, one pair
  caught by the chime with their masks on you, and four whirling at the knight.
- `film.mp4`: every move, from in front and from behind, the knight in it for size, on a floor laid in tiles so speeds and
  sizes read in tiles; the spin's strike again at half speed; and at the end the whole ballroom at the game's own size (an
  arena of about 17 by 20 tiles): the pairs waltz, the clock strikes, they stop dead and look at you, then they all come at once.
- `film_sheet.png`: every thirtieth frame of the film (one a second), for a look without playing it.
- `dancers_death_sheet.png` (their death made new, 30 Oct): sixteen frames, eight key moments each, the lady from in front
  and the gentleman from behind, twice the game's size: up on one toe; too fast, the mask flies; a lurch; a second lurch;
  sinking in a spiral; down in a swirl; lying back, the mask wobbling; still, alive, the mask face up.
- `dancers_death.mp4` (16.4 s): the death on its own: at the game's size, both kinds from in front and from behind, the
  knight beside them; the lady from in front and the gentleman from behind, three times as big; then at half speed, the
  last pirouette and the lurches (the gentleman, from in front) and the sinking into the swirl (the lady, from behind).
  (`film.mp4` and `film_sheet.png` still show their first death, the mask dropping and a last bow: not made again.)

The floor in them is a stand-in (polished stone in the blue room's colours): the Masque's own floor is not drawn yet.

## Who they are (src/art/masque_dancers.ts)

Two kinds, mixed in a crowd; each in any of the seven rooms' colours (`ROOMS`, `ROOM_ORDER`): fourteen dancers, `DANCERS.lady.blue`
… `DANCERS.gent.black`. On the Hushed's own skin and breath (art/hushed.ts), as floor 16's gardeners and grooms are.

- THE LADY (`LADY_BODY`, 56 tall, the knight 58): a gown of her room's colour, the bodice fitted, an ivory-silver stomacher
  pointed at the waist; elbow sleeves with white lace falling from them; long white gloves; a full skirt to the floor, built
  in eight gores, open at its front over a petticoat of pale silver silk, its hem trimmed. Her hair dark chestnut, swept up into
  a knot, curls at the nape, three slender feathers of her room's colours standing from it and streaming as she goes.
- THE GENTLEMAN (`GENT_BODY`, 59 tall): a frock coat of his room's colour open down the front over a pale silver waistcoat, its
  skirts to the knee in two halves parted at the vent behind (the coat-tails), deep turned-back cuffs of ivory, silver buttons;
  a white cravat and jabot; breeches, ivory garters, white stockings, black shoes with silver buckles; his hair dark, tied back
  in a short queue with a black ribbon.
- THE MASK (their mark): a whole face of white porcelain, cool, the brightest thing on them; almond eye holes, dark, the dull
  pink of the Hushed in them (hot pink through the warning, their glow lit); brows painted in their room's colour; the lips a
  dark slit, from which the grey breath leaks; tied on with a ribbon of the room that trails behind. Original: no Venetian or
  other mask copied; nothing of a clown.
- THE SEVEN ROOMS' COLOURS: blue, purple, green, orange, white, violet, black (its trim a deep scarlet, the windows' red).
  Every one clear of the enemy's pink (hues 300 to 350) and the friend's cyan (160 to 205): a test holds them to it.
- Nothing cyan; the enemy's pink edge while they live; the pink in their eyes their only glow.

## Their moves (src/art/masque_dancers_moves.ts)

Each is a mob as the game holds a monster (`Mob`, art/new_mobs3.ts): `stand`, `walk` (the whirl), `attack` (the spin),
`reel`, `dying`, and `more.waltz`, `more.chime`. `makeDancerArt3(mob)` gives `{ front, back }`. Their picture
(`DANCER_CANVAS`) is 300 by 230, the floor point at (150, 168): room for the spin's whole sweep.

- POSED (their stand, 24 frames at 10 a second): upright, the chin up; she holds her skirt out a little at her sides; he has
  his left hand behind his back and the right held out low before him, as if to offer it. They breathe, sway, turn the head;
  the grey breath leaks from the mask.
- THE WALTZ (`more.waltz`, a loop of a second, 24 frames at 24 a second): in pairs, in hold: his left hand and her right
  joined high out to his left; his right hand on her back below her left shoulder blade; her left on his right shoulder (each
  hand laid on the other's own body as it moves). The pair turns round each other once a second (to their right), six steps to
  the turn, the waltz's rise and fall, she arched back looking over her left shoulder; drifting round the room at
  `WALTZ_PACE`, 1.2 tiles a second (the game carries the pair; their feet grip as it does). Each dancer is a mob of its own whose
  floor point is the pair's middle: A LADY AND A GENTLEMAN PLAYED TOGETHER AT ONE SPOT ARE THE PAIR. To draw a pair as one
  picture (each in front of the other where they truly are), `pairPainted(lady, gent, move, t, view)`.
- THE WHIRL (their walk, a loop of a second, 24 frames at 24 a second): gliding fast at you at `DN_PACE`, 3.4 tiles a second
  (the knight runs 4.6; the Princess glides at 4), three whole turns a second (to their right), a step for every half turn, on
  the balls of their feet, turning on them as the body goes over; the skirt and the coat-tails flying out in waves; the mask
  kept on you (spotted, whipped round once a turn). It comes round to face you as it set off three times in its second
  (`WHIRL_ROUND`: 0, 1/3, 2/3 s): FOR THE MAIN CHAT, the game leaves the whirl (to stand, or to spin) only at one of those.
- THE CHIME (`more.chime`, 1.9 s, `DN_CHIME`): from the waltz's first frame they stop dead (by 0.06 s); their masks snap round
  to look at you (by 0.26 s; she, turned away from you, twists and looks over her shoulder); held still but for a breath until
  1.3 s; then the hold breaks, the hands lead out of it, and each turns to you, ready to whirl (its end is the whirl's first
  frame). FOR THE MAIN CHAT: each of the pair ends where it stood in the pair (`chimeSplit(who)`, from the pair's middle); the
  game sets each off from there. Noticing you without a chime, the game may play the chime from `DN_CHIME.go` (the break alone).
  The chime begins at the waltz's first frame; the waltz comes round to it once a second.
- THE WHIRLING SPIN (their one attack, 1.8 s, `DN_SPIN`; his Movement 9):
  - the wind-up: wound round the other way (the hips 75 degrees, the chest 35 more) and crouched low, leaning away, one arm
    swept high, the other wrapped across the waist; the mask looking back at you over the shoulder; the eyes burning hot pink,
    pink glints at the fingertips, the Hush puffing hard; HELD from 0.36 to 0.7 s, trembling (THE WARNING);
  - hips first (the last frame of the wind-up: the hips begin to come round, the chest held);
  - THE STRIKE, in two frames (22/30 to 24/30 s; it lands on the second, `DN_SPIN.hit`, 0.8 s): a leaping whirl a whole turn
    round that carries them `SPIN.lunge`, 1.25 tiles, into you, the arms flung wide, the skirt and the coat-tails flung out,
    smeared: after-images of the arms and the flying hem, and streaks of their going spiralling out to `SPIN.area`, 1.5 tiles
    round where they land (the area it strikes: a circle three tiles across); their grey breath whipped round in a spiral;
  - the wind-down: still turning (another turn and a fifth), slowing, the skirt wrapping round, into a flourish, a deep dip
    with the arms out, and back up to their pose. They end a little past where they landed: `SPIN_END` (1.42 tiles) on from
    where they began. FOR THE MAIN CHAT: what strikes is the whirl itself, its middle; the area is the main chat's to set (his
    “bigger AOE”), and the art is drawn to the tile and a half; the game moves them on by `SPIN_END` as the spin ends.
- STRUCK (0.4 s): knocked back and half turned, the head thrown back, the arms flung up.
- THEIR DEATH (`DN_DIES`, 3.2 s): made new on 30 Oct: a last pirouette spinning out of control, down in a swirl of skirts
  or coat-tails, the mask rolling away. Its own section below, "Their death".

## Their death (made new, 30 Oct)

To make Act 2's enemies die differently (nearly every Hushed kind went to one knee, then down), offered to him as a pop-up:
"THE DANCERS a last pirouette spinning out of control, then a collapse into a swirl of skirts or coat-tails, the mask
rolling away ... the Hush leaving them in a grey breath, alive." His pick: “Yes, these (Recommended)”. Only the death
changed: every other move of theirs is as it was, pixel for pixel (1954 frames, every living frame of the two the checks run
on both ways round, every fifth of the other twelve, and the pair waltzing and at the chime, painted before and after and
found the same).

What it is (`diesPlan`, `maskPath` and `maskLooseAt` in `src/art/masque_dancers_moves.ts`; seconds, and frames at the game's
20 a second for a death; both kinds alike, each in their own clothes):

- STRUCK (0 to 0.10 s, frames 0 to 2): jolted back, the head snapped back, the arms flung, turned a little to their left.
- UP INTO THE LAST PIROUETTE (0.10 to 0.32 s, frames 2 to 6): up on the ball of the left foot, its heel well up; the right
  foot drawn up to the left knee, turned out (a pirouette's retiré: his shows, hers is under the gown); the arms rounded
  before them; turning to their right, faster and faster.
- TOO FAST (0.32 to 0.80 s, frames 6 to 16): whirling at up to 3.5 turns a second (they whirl at you at 3); the arms flung
  wide; no spotting now, the head lolling round with them; THE MASK IS FLUNG OFF (0.46 s, frame 9); the wobble grows, the
  whole of them leaning off their toe further and further, the lean going round (as a top's does before it falls).
- OUT OF CONTROL, TWO LURCHES (0.80 to 0.95 s, frames 16 to 19; 1.05 to 1.20 s, frames 21 to 24): each time they fall the
  way they lean and a foot is flung out to catch them, the right then the left, carrying them a fifth of a tile and more
  each time, still turning, the arms flailing.
- SINKING IN A SPIRAL (1.20 to 1.90 s, frames 24 to 38): still turning, slower and slower, down on the ball of the left foot,
  its knee bending right down, the heel coming down toward the floor at the last, the right leg swung round low with them
  and out before them; the skirt (or the coat-tails) flared by the spin, its hem carried on round after them as they slow.
  Four whole turns from the blow to the floor.
- DOWN IN A SWIRL (1.90 s, frame 38), and LYING BACK (1.92 to 2.38 s, frames 38 to 48): sat down in the gown (or the
  coat-tails) spread round them; then back onto the floor, the right arm flung out beside the head, the left out at the side,
  the face turned up and over toward their right (so that it is seen from in front and from behind), a tired face, grey
  from the Hush, not a corpse. Her gown lies flat on the floor round her in a wide swirl (its hem 23 of her own lengths out,
  over half a tile, carried 110 degrees round after her so that its gores spiral), her legs under it, the knees fallen out;
  his coat-tails lie spread on the floor about his hips (16 out), open toward his legs, which lie out before him, a little
  bent, the feet turned out. They lie 0.37 tiles from where they stood.
- THE HUSH LEAVES THEM (2.00 to 3.05 s, frames 40 to 61): it leaks hard from them all the while they whirl; once they lie,
  it rises out of them in one great grey breath and thins away. The pink goes from their eyes as it leaves (2.0 s).
- STILL from 2.75 s (frame 55): people again, alive, lying still.

THE MASK (`MASK_ROLL`; `maskLooseAt(who, t)` gives its middle, its face's way and its brow's way at any moment):

- FLUNG OFF (0.46 s): out of the whirl, up a little above their heads and away, tumbling over once
  more than it must, its ribbon trailing after it.
- DOWN ON ITS RIM (1.12 s, frame 22), a little hop off it as it knocks, about a tile from where they stood; ROLLING AWAY ON
  IT (to 1.72 s), its face up and to one side, curving to the right as a tipped wheel does, tipping more and more, rolling
  (turning about its own face's line as it goes, not sliding); WOBBLING round on its rim where it is (1.72 to 2.40 s),
  flatter and flatter, faster and faster, as a coin settles; its hollow back (painted: the inside of the mask, unglazed)
  and its white face flash by turns; STILL, FACE UP, from 2.40 s (frame 48): 1.35 tiles from where they stood, 1.7 from where
  they lie, clear of them from in front and from behind. Its eye holes empty and dark: no pink in it once it is off.

For the main chat: nothing of them falls apart as they die (`Mob.fall` is null): the mask, flying and rolling, is painted in
their own death's frames. The game's soft shadow under them is at their feet; as they lie it should lie under them, and the
mask could have a small one. Sound (the brief): the waltz faltering as they whirl out of control; the mask's knock on the
floor (1.12 s), its roll and its quickening rattle to a last ring (2.4 s); the soft fall of silk (1.9 s); a grey breath.

## Bringing them in (for the main chat)

1. `DANCERS_ON.on = true`, and the game's rules for a small mob (one attack). Each of `DANCERS[who][room]` is a `Mob`;
   `makeDancerArt3(mob)` gives its pictures as the game holds a monster (its `more` moves under `clips.moves`).
2. A waltzing pair is a lady and a gentleman at one spot, both playing `waltz` from the same moment, drifting at
   `WALTZ_PACE`; or draw the pair as one picture with `pairPainted`.
3. The chime: both of a pair play `chime` from the waltz's first frame; as it ends each is moved to `chimeSplit(who)` from the
   pair's middle and whirls (`walk`, at `DN_PACE`). Noticing you: `chime` from `DN_CHIME.go`.
4. Out of the whirl (to stand or to spin) only as it comes round to you: `WHIRL_ROUND`.
5. The spin's blow at `DN_SPIN.hit`; they are carried `SPIN.lunge` tiles in by its strike and stand `SPIN_END` on at its end.
6. The death: `dying` as before (`dieTime` 3.2 s); the mask, flying and rolling, is in its own frames (nothing to draw beside
   them, nothing falls by itself). Into the death from their pose (any frame), from struck, or from the whirl as it comes
   round to you (`WHIRL_ROUND`): test 13 holds each without a jump.

## The checks

- `tests/masque_dancers.test.ts` (13): nothing of the game imports them, their switch off; EVERY MOVE OF BOTH THROUGH EVERY BOSS
  CHECK (art/boss_checks.ts: feet that grip, nothing in the floor, no arm through the body, nothing jerks or jumps, the blow
  wound up, held and carried through, hips first, alive when still, his lightning strike), from in front and from behind, and
  every handover (the waltz into the chime, the chime into the whirl from where each stands, the whirl out as it comes round,
  the spin's end into their pose where it has carried them); HIS LIGHTNING STRIKE (two frames, landing on the second, smeared
  then and only then); every frame painted both ways round in every room's colours (nothing cyan, the pink edge while they live
  and none as they die, crisp); nothing cut off, a pair of them neither; nothing of them in the floor; the Hush leaking, pouring
  out as the mask drops, gone once they are still; the masks (on the face with the pink in its eyes, burning in the warning,
  flung off empty, to lie face up clear of them, no pink left once the Hush has gone); the seven rooms' colours clear of pink and cyan; his sizes and speeds
  (the knight's size, the whirl's pace and three turns a second, the spin's tile and a quarter in two frames and its tile and a
  half round, the waltz's turn a second); the pair in hold (their hands on each other, nothing of one through the other); the
  chime (stopped dead, the masks on you, held still) and the whirl's mask kept on you; and THEIR DEATH (test 13): up on the
  ball of the left foot, the right drawn up; round three times and more (four), faster than they whirl; two lurches, a foot
  down to catch each; lying on their back, still from 2.75 s; the gown or the coat-tails flat on the floor round them, wide,
  its hem carried round; the mask off the face at 0.46 s, down on its rim, rolling more than 15 of their own lengths, never
  in the floor (its porcelain face and its hollow back, sampled all over, every 1/120 s), still and face up from 2.40 s, more
  than a tile from them; and into the death from their pose, from struck and from the whirl as it comes round, without a
  jump. (Test 6 leaves the loose mask to test 13: it is half a shell, not the whole ball test 6 would measure.)
- The shared tests' lists of mock-ups, each a line longer for these files (they import the Hushed's breath, the mob engine and
  the bosses' footwork): `tests/hushed.test.ts`, `tests/bosses.test.ts` (both its lists), `tests/new_mobs3.test.ts`.

## The tools

- `tools/masque_dancers_film.ts` (`sheet`, `crowd`, `film`, and for their death `deathsheet` and `deathfilm`) paints them in
  node as the game would, on the stand-in floor with the knight; `tools/masque_dancers_film.py` captions the frames and makes
  the film (`film`), and labels the death sheet (`sheet`); `tools/masque_canvas.ts` is its canvas.
  `npx tsx tools/masque_dancers_film.ts deathsheet /tmp/ds.png && python3 tools/masque_dancers_film.py sheet /tmp/ds.png docs/mockups/masque_dancers/pictures/dancers_death_sheet.png "Their death, made new" "..."`
  `npx tsx tools/masque_dancers_film.ts deathfilm /tmp/df && python3 tools/masque_dancers_film.py film /tmp/df docs/mockups/masque_dancers/pictures/dancers_death.mp4`
- `src/dev/preview_masque_dancers.ts`: the dev page (`sheet`, `big:<lady|gent>:<move>:<t>`, `pair:<waltz|chime>:<t>`; any
  moment of the death close up: `big:lady:dying:1.9`).

## His word on the pictures

The crowd, the sheet and the film (`crowd.png`, `sheet.png`, `film.mp4`), asked “Floor 17's masked dancers (crowd.png,
sheet.png and the film): are these right? With them, floor 17 is complete.”: “Yes, that's them (Recommended)”.
