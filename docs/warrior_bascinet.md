# THE WARRIOR'S HELM A HOUNSKULL BASCINET: FOR THE MAIN CHAT (14 Nov 2026)

A chat of his of 14 Nov (the skins chat), on `art/warrior-pig-helm`, from `main` 8ccc8b9 (25.3.19). Not the main chat: `main`
is untouched, nothing is published.

## His words (14 Nov 2026, Eastern)

- 12:09: “i dont like the warriors helmet.. i feel like he lost his pig helmet look”.
- Shown a short, blunt pig's snout in its place, asked by pop-up: “No, I want a houndskull bascinet”.
- Shown the bascinet: “Kind of, the eyes are kinda all over the place”.
- Shown an eye fixed in each slit, asked by pop-up whether to ship it: “Yes, ship it (Recommended)”.

## What it is (src/art/warrior_up.ts, THE HEAD and BASCINET)

As the real ones of about 1370 to 1420 are:

- THE SKULL tall and drawn up to a point a little behind the crown (a cone, `apex`), coming down low at the sides and back.
- THE VISOR a muzzle over his whole face drawn out to a sharp point, out THE WAY HIS HEAD FACES (`s.face[0]`) and a little down,
  so that it stands out of his head's outline from in front. (It was drawn toward the eye before: from in front it read as a
  long face plate.) A crisp ridge down its top.
- TWO EYE SLITS across the top of the muzzle, each with its flange lit above and in shadow below, the ridge between them.
- HIS EYES: the faint cyan point of each painted IN ITS SLIT (`eyeAt` in the steel's paint), 36 degrees round from the middle,
  only where that eye looks out toward the one watching. (They were marks set where his eyes are turned toward the eye, which
  put them anywhere on the helm: “all over the place”.)
- BREATHING HOLES in rows on his right cheek of the muzzle, one on the left, and a mouth slit under the point.
- Rivets at the visor's pivots, by his true facing.
- THE AVENTAIL: a mantle of mail from the skull's rim over his neck, under his scarf.

The axe and the hammer are painted on the same body, so they wear it too.

## Also changed

- `src/art/warrior_up_review.ts` wuBody: the boss checks' snout is the new muzzle (BASCINET).
- `src/art/warrior_up_axe_moves.ts` helmSeen: counts the helm's cones too (the skull's point and the muzzle), not only its
  ellipsoids. With the skull drawn up into a cone, the old count left the top of his helm out and read a weapon over his head
  as hiding more of the helm than it does (58% where 60% is the least). Its own note always said “its skull and its snout”.
  Then, after his yes, two frames still read just under (the axe's chop f7 and the maul's smash f7, from behind, 60% and 59%):
  the skull's low back drawn a touch higher and the aventail hung a touch lower and narrower (BASCINET.low, rimU, mailTop),
  which lifted them to 62% and more; and one frame of the maul's Earthquake (f17, in front, left: in the air, both arms up
  before his face) from 59.7% to 60.7% by the skull's point set a touch lower and further back (apexU, apexB). Looked at beside
  the pictures he said yes to, from all eight sides: the same helm.
- `tests/warrior_up.test.ts` test 8: named for the bascinet's slits (the check itself unchanged).

## What the main chat must do

- THE HEROES' BAKE HAS A NEW MARK: every Warrior picture changes (all his moves, all eight sides, the card, the axe and hammer).
  Bake again as the build does.
- Playtests of the Warrior on the release page with its bake (his stand, run, strikes, town, card).

## Checked

- tsc clean.
- `tests/warrior_up.test.ts` 3 (every frame of every move through every boss check, from all eight sides), 6 (every frame
  from all eight sides: crisp, the friend's cyan edge, nothing of the enemy's colours, nothing cut off) and 8 (the slits), on
  5e18946.
- `tests/warrior_weapons.test.ts` 8, 13 and 19 (his helm seen in every frame of every axe and maul move from every side), on
  5e18946.
- Pictures from all eight sides and in his run, strike, town stance, card draw and slam, at close size and the card's.
- NOT run: tests/warrior_up.test.ts 4, 9 to 11 (what he wears over his mail, his legs, his sword), which the head does not
  touch; a baked page; his phone.
