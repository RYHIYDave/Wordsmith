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
sound, a faint waltz around them, silent dancers.

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
- `film_sheet.png`: every tenth frame of the film, for a look without playing it.

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
- THE MASK DROPS (their death, 2.6 s, `DN_DIES`): jolted, the head snapped back; at 0.3 s the mask (and its ribbon) comes away
  and falls to lie face up on the floor before them, clear of them; their own face under it, drained, the eyes shut, no pink;
  the Hush pours out of them in one great grey breath (0.32 to 1.5 s); they sink in a last bow (hers a curtsey, his a courtly
  bow with his hand on his heart) down to their knees by 1.7 s, and settle back, the head bowed, the hands in the lap: people
  again, alive, still. Never undead, never gory.

## Bringing them in (for the main chat)

1. `DANCERS_ON.on = true`, and the game's rules for a small mob (one attack). Each of `DANCERS[who][room]` is a `Mob`;
   `makeDancerArt3(mob)` gives its pictures as the game holds a monster (its `more` moves under `clips.moves`).
2. A waltzing pair is a lady and a gentleman at one spot, both playing `waltz` from the same moment, drifting at
   `WALTZ_PACE`; or draw the pair as one picture with `pairPainted`.
3. The chime: both of a pair play `chime` from the waltz's first frame; as it ends each is moved to `chimeSplit(who)` from the
   pair's middle and whirls (`walk`, at `DN_PACE`). Noticing you: `chime` from `DN_CHIME.go`.
4. Out of the whirl (to stand or to spin) only as it comes round to you: `WHIRL_ROUND`.
5. The spin's blow at `DN_SPIN.hit`; they are carried `SPIN.lunge` tiles in by its strike and stand `SPIN_END` on at its end.
6. The death: the mask is a piece that falls by itself (`Mob.fall('mask')`), as the gardeners' tools do.

## The checks

- `tests/masque_dancers.test.ts` (12): nothing of the game imports them, their switch off; EVERY MOVE OF BOTH THROUGH EVERY BOSS
  CHECK (art/boss_checks.ts: feet that grip, nothing in the floor, no arm through the body, nothing jerks or jumps, the blow
  wound up, held and carried through, hips first, alive when still, his lightning strike), from in front and from behind, and
  every handover (the waltz into the chime, the chime into the whirl from where each stands, the whirl out as it comes round,
  the spin's end into their pose where it has carried them); HIS LIGHTNING STRIKE (two frames, landing on the second, smeared
  then and only then); every frame painted both ways round in every room's colours (nothing cyan, the pink edge while they live
  and none as they die, crisp); nothing cut off, a pair of them neither; nothing of them in the floor; the Hush leaking, pouring
  out as the mask drops, gone once they are still; the masks (on the face with the pink in its eyes, burning in the warning,
  dropped to lie face up clear of them, no pink left); the seven rooms' colours clear of pink and cyan; his sizes and speeds
  (the knight's size, the whirl's pace and three turns a second, the spin's tile and a quarter in two frames and its tile and a
  half round, the waltz's turn a second); the pair in hold (their hands on each other, nothing of one through the other); the
  chime (stopped dead, the masks on you, held still) and the whirl's mask kept on you.
- The shared tests' lists of mock-ups, each a line longer for these files (they import the Hushed's breath, the mob engine and
  the bosses' footwork): `tests/hushed.test.ts`, `tests/bosses.test.ts` (both its lists), `tests/new_mobs3.test.ts`.

## The tools

- `tools/masque_dancers_film.ts` (`sheet`, `crowd`, `film`) paints them in node as the game would, on the stand-in floor with
  the knight; `tools/masque_dancers_film.py` captions the frames and makes the film; `tools/masque_canvas.ts` is its canvas.
- `src/dev/preview_masque_dancers.ts`: the dev page (`sheet`, `big:<lady|gent>:<move>:<t>`, `pair:<waltz|chime>:<t>`).
