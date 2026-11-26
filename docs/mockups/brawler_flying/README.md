# The Brawler's swipe: the flying double hammerfist and the flying knee

The skins chat of 13 Nov, 26 Nov 2026, from the queue's “Draw the Brawler's flying double hammerfist and his flying knee (art chat)”
(the Godot chat's, at his word to it: “Send the hammer fist and flying knee to the queue and art chat.  I don’t trust you to do it”).
Branch `art/brawler-flying-blows`, from `main` 41f47ac1 (25.3.22).

## What he asked for

His idea for the Brawler, to the Godot chat: “Then have his swipe can be something like an interrupt to the combo, but whatever globe
is next is now added to the swipe, so either a flying double hamerfist or a flying knee”. In the new combo a tap is a punch (green
globe), a hold a kick (orange globe); a SWIPE breaks off whatever he is doing and he flies at the enemy where it points, carrying the
first lit globe: a punch globe the FLYING DOUBLE HAMMERFIST (a round blow all about him that knocks everything down), a kick globe the
FLYING KNEE (one knee driven through the one before him, a straight line). Both go forward to the target.

To this chat, 26 Nov 2026, 07:41: “Can you work on the new brawler animations in the queue?  Make sure they follow the art and
animation rulesets.  I’ll send some hammerfist examples”. He sent three clips. Read as, and told him so: he leaps, hangs at the top
with both fists clasped high and his back arched (a long wind-up), then one fast, smeared arc down, a great burst, and he lands
crouched in the wreck of it. Drawn as the Brawler's own (Original designs only): nothing of the clips' figures or looks.

## What is in it

Both are moves of his like every other (`src/dev/veteran_moves.ts`, keys of his bones at 30 frames a second), so the game paints them
from all eight of his sides, truly turned, as it does the rest (`src/art/veteran_art.ts`, `VET_LISTS`: added last, so the lists
before keep their places in the bake).

**The flying double hammerfist** (`hammerfist`, a swipe carrying a punch globe; 48 frames):
- 0 to 7, THE GATHER, quick (it is an interrupt): squared up and sunk deep, both arms flung down and back.
- 8, THE LEAP up and on at them, the arms swung up past his face; the punch globe he carries BURNS GREEN ON HIS FISTS from here to
  the slam (`flame`), growing, its sparks blown back by his flight.
- 14 to 21, THE HANG, HELD: both fists clasped together high over and behind his head, his back arched right back, his knees drawn up
  under him and his shins swept back.
- 21 to 23, THE SLAM, in two frames: he jackknifes and drops, the clasped fists brought down in one great green arc (smeared, his
  after-images along it) onto the floor before his feet as he lands, deep. A great burst where they strike.
- THE RING OF FORCE rolls out along the floor round where the fists struck, 2 tiles, and knocks everyone in it DOWN (`floored`): its
  leading edge stands up off the floor in shards of light, stones of the floor are flung up and fall back as it passes, cracks are
  struck out across the floor, glowing green, then dark, then gone. The screen shakes 6 frames.
- 23 to 48: held in the wreck of it a moment (the weight of it), then he rises out of it to his guard.

**The flying knee, made new** (`flyknee`, a swipe carrying a kick globe; 46 frames). The knee of combo 2 (`knee`) is kept as it was,
for the game as it is; this one is the swipe's.
- 0 to 7, THE DIP, quick: down onto his lead foot, leaning in, both arms flung back.
- 9, THE LAUNCH off it, long and low, straight at them (out of a run or a combo, not after a jump); the kick globe he carries BURNS
  HOT ORANGE ON HIS KNEE from here to the blow.
- 13 to 15, THE KNEE COCKED, HELD, as he flies: his rear thigh drawn right back and down, the shin folded up behind him, both hands
  reaching out ahead of him for their head.
- 15 to 17, THE KNEE, in two frames: the hips thrown through, the thigh whipped up level and the knee driven straight through them
  (orange smear under him, after-images, the burst), both arms yanked back past his hips, his lead leg flung straight back; a
  NARROW STRAIGHT LINE OF FORCE (a cone 26° wide) on through them, 1.6 tiles past his knee.
- 17 to 20 held there as he flies on; down onto his lead foot at 24, the other after, deep, and up to his guard by 46.

## The numbers, for the rules (`src/game/veteran.ts` `VET_MOVES`; a test holds them to the art)

| | the hammerfist | the flying knee |
| --- | --- | --- |
| frames (`long`, 30 a second) | 48 | 46 |
| strike: held wind-up's last frame, the blow (`from`, `at`) | 21, 23 (a punch) | 15, 17 (a kick) |
| in the air (`air`, first and last frame) | 8 to 22 | 9 to 23 |
| how far it carries him (`carry`, tiles, all of it in the air) | 2.5 | 3.0 (2.52 by the blow) |
| its force | a RING, 2 tiles round where the fists strike the floor (3.06 tiles on from where he stood), out in 7 frames | a cone 26° wide, straight on, to 4.6 tiles from where he stood (1.6 past the knee), out in 4 frames |
| what it does to them (`react`) | `floored`: knocked down (new) | `kneed` |
| who it reaches in the art's own test | three about him, all at frame 25; one outside the ring, not | the one before him, at frame 17 |
| `share` (a start; the rules' to set) | 1.6 | 2.2 (the old knee stays the strongest, 2.4) |
| globe | `punchFire` | `kickFire` |

New in the rules' types: the force shape `ring` (its `reach` is round where the blow strikes the floor, not from where he stood:
he has flown there) and the reaction `floored` (`VET_REACT.floored`: back 0.35 tiles, stunned 1.2 s; the rules' to set).

BOTH ARE CARRIED ONLY IN THE AIR: his feet are on the floor where they were until he leaves it, and where they come down after, so
the game may carry him further or less far than the art does, to where the swipe points, by stretching his carry between his
take-off and his landing (frames `air[0]` to `air[1] + 1`) without a foot sliding. His effects are painted in the move's own scene,
round where he stood as it began; a game that stretches the carry lays the frames from his landing on by the same stretch (the ring,
its cracks and stones, round where he lands).

## For the Godot chat, which builds the rules behind a switch and bakes him

- Bring in this branch; bake his pictures again (all eight sides: the hero bake, `tools/bake_heroes.mjs`) and his numbers
  (`tools/godot_veteran.ts` → `veteran.json`, `veteran_fx`); `VET_LISTS` has the two at its end.
- `tools/godot_veteran.ts` puts a shockwave ring under each foe a heavy blow lands on: leave it off for `floored` (the ring of force
  is theirs), as the art's film does (`src/dev/veteran_scene.ts`).
- A strike may now carry `fade` (frames its smear dies away over; the hammerfist's 2, its smear's head lying right before him) and
  `strikeEnd` (`src/dev/veteran_moves.ts`): a ring's smear and after-images end at its blow, not at its last hit
  (`vetLastHit` says so).
- The ring's foes are hit as its front comes to them (`forceHit`): `when(d - 7)` from its centre.

## Checked

Against his rulebooks (docs/art/RULEBOOK.md): Movement 1 to 9 and Animations 1 to 8, and Heroes 6 and 7, in every frame, by tests
that run every time (`tests/vet_flying.test.ts`, new; and every check `tests/veteran.test.ts` asks of every move of his, which these two
now are): crisp, the friend's cyan edge, no pink, nothing cut off, nothing in the floor, nothing through his body or what he wears,
FROM ALL EIGHT SIDES; every joint as a body bends it; slick; his feet gripping the floor; a held wind-up and the blow in two frames,
smeared; the ring, its stones, its cracks and the globe's flame never pink, gold or cyan. Animations 1 (“as big and wild and kinetic
and weighty as possible”), checked before he sees it: the leap, the long hang with the globe's fire on his fists, the slam in two
frames, the burst, the ring with its shards, stones and cracks, the shake, the held landing; the knee's long low flight, the cocked
knee burning, the knee in two frames and its line of force. Looked at as a phone shows him (`tools/vet_flying_game.ts`, the game's own
layers at the game's grain).

`node tools/unit.mjs --only vet_flying,veteran,veteran_art,veteran_rules,veteran_packs,baked_packs,sides_more,wrap_skins,reflections_up,
veteran_talents,veteran_words,windup,class_cards_paint,uniques_heroes` and the core, on 110127f9: 37 files, 35 passed. The two that
failed fail on `main` as it is, nothing of this: `windup.test.ts` (the Ranger's Snipe, 0.333 s; run on `main` 41f47ac1 alone, the same)
and `reflections_up.test.ts` 5 (the Warrior's eyes in floor 18's glass; failed so on an earlier run, 6982329f). `tsc --noEmit`: clean
but for `tests/relief.test.ts` line 378, on `main` as it is.

## Pictures

- `pictures/brawler_flying_key_frames.jpg`: the hammerfist at the top, the slam, the ring; the knee cocked, the knee, its line of force.
- `pictures/brawler_flying_blows.mp4`: each from in front and from behind, at half speed, from all eight sides, out of a run, and out
  of a combo with the globes over him (`FILM=flying npx tsx tools/veteran_film.ts <out.mp4>`; its parts `FLYING_FILM`,
  `src/dev/veteran_plays.ts`).
- `tools/vet_flying_pics.ts`: his frames in a sheet, with what the checks find; `tools/vet_flying_game.ts`: as the game paints them.

## Waiting

SHOWN HIM, 26 Nov 2026: the film and the key frames; asked by pop-up whether they are right.
