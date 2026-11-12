# Floor 18: your reflections, the heroes as they look now (mock-ups; branch `art/reflections-up`)

From the Wordsmith Queue's item `make-floor-18-reflections`, pulled by a chat of his working from the queue on 12 Nov 2026
(his words: “Please knock out some queue items”). Cut from `main` at 10161fc (25.3.10). Nothing here is in the game until the
main chat puts it there, on his yes. Its switch, `REFLECTIONS_UP` (src/art/reflections_up.ts), is off; nothing of the game
imports the file.

## The ask

Floor 18's mirror reflections are made from the OLD heroes' moves (src/art/reflections.ts, from art/heroes3.ts `paintMove3`):
what the game shows today on floor 18 is the old knight, ranger and mage in glass, and for the Warlock, the Tinkerer and the
Brawler the old mage's, ranger's and knight's (art/act1_figs/reflection.ts `looks`). Wanted (the queue item; the main chat's
board post of 7 Nov 14:57 and an older ask; the Mage added by the Mage chat, 11 Nov): glass copies of the Warrior and the
Ranger as they look now, of the Mage redrawn, and of the Warlock, the Tinkerer and the Brawler.

His words on the first reflections, which these keep to (docs/mockups/reflections/README.md): “Glassy copy of you
(Recommended)”; of the sheet and the film, “Yes, that's them (Recommended)”; of what glows cyan on the hero, “Pink, like
enemies (Recommended)”.

## How it is made (src/art/reflections_up.ts)

EACH HERO'S OWN PAINTER, the very function the game paints him with, at the same moment of the same move, from every side
he has, then turned to glass by THE SAME STEPS as the first reflections (src/art/reflections.ts, split into shared steps for
this: `glassOfPainting`, `brightEdges`, `lightCracks`, `sheenOver`, `glassColours`; the first reflections' own pictures are
the same to the pixel: a hash of 111 of their frames, steps and shatterings taken before and after):

| Hero | Painted by | Sides | Its tap, its hold |
| --- | --- | --- | --- |
| Warrior | art/warrior_up_art.ts `paintWu` | eight | Strike, the Slam (the great sword) |
| Ranger | art/ranger_up_art.ts `paintRuMove` | eight | the Shot, the Volley |
| Mage | art/mage_up_art.ts `paintMuMove` | eight | the Wave, the Orb |
| Warlock | dev/warlock_moves.ts `drawWarlockAt` (the man) | two | the hellfire bolt, the Curse |
| Tinkerer | dev/tinkerer_moves.ts `drawTinkerAt` (her hold `drawTinkerHoldAt`) | eight (EIGHT_MORE.tinkerer) | the vial toss, her whistle |
| Brawler | dev/sculpt_veteran.ts `paintVeteran` (the Veteran) | two while EIGHT_MORE.brawler is off; eight with it | the jab, the roundhouse kick |

1. SILVERED on the two glasses, warm to grey-violet, cool to silver; the seams the style's indigo. Cyan that is cloth (the
   Ranger's cloak and cap, the Mage's cape) is cool: silver glass, as the first reflections had the ranger's teal.
2. GLASS IS BRIGHT AT ITS EDGES.
3. FINE CRACKS, FIXED TO THE BODY: the same five lines (`CRACKS`), laid on the figure's own solids, found by their names in
   his sculpture (`ribs`, `belly`, `pelvis` or `seat`, `skull`), so they go where the body goes. Seen only on the side of the
   solid that faces the eye; where that solid's skin is what is drawn there; and through cloth over the trunk (a coat, a
   cape, a hood) but never through a limb or what the hands hold (by the drawing's own depth of every pixel).
4. A SHEEN, a whole number of times round in a loop, once over a blow.
5. NOTHING CYAN LEFT: the kit's glows (the first reflections' `FRIEND_TO_ENEMY`), and every cyan pixel of a material of his that
   glows (a ramp of the kit's bright cyan: a vial, an arrow's head), of what is drawn of the old kind (a bowstring, an arrow,
   her crystal, his blade's light and smear) and of a gem marked on him (a buckle): the enemy's pink, by how bright it is
   (`asEnemy`). The Warlock's arm fire is pink.
6. THE HUSH'S DULL PINK IN ITS EYES: each hero's own eye marks from his sculptor: the Warrior's glints in his visor, the
   Ranger's and the Mage's dark eyes, the Tinkerer's, the Warlock's lit eyes under his hood, the Brawler's good eye and his
   milky one.
7. THE ENEMY'S PINK EDGE.

The silhouette is the hero's own, pixel for pixel. ITS STEPPING OUT OF A MIRROR and ITS SHATTERING are the first
reflections' (art/reflections_fx.ts), made from these frames: `stepOutPainted` takes a `StepSource` (its stand and its own
stumble forward), and every frame is laid on the heroes' canvas first (`onHeroCanvas`: the Brawler's canvas is bigger).

## What a reflection has (`makeReflectionUpArt().of(cls)`)

What it does in the game (game/act1_rules/reflection.ts): it stands, runs, makes its tap's blow and its hold's, steps out of
a mirror and shatters. So, from every side the hero has (the same keys as the hero's own art, so the game can choose the side
as it does for him: art/sides.ts): `idle`, `walk`, `attack` and `heavy` (three frames each, as older code asks), `clips.attack`
and `clips.heavy` (each as many frames as the hero's own, at his pace, the blow at the same moment), `clips.die` (its
shattering), and from in front `clips.moves.stepOut`. Not the hero's other moves (his leap, roll, whirl, struck): a
reflection does not make them. Lists of the Warlock, the Tinkerer and the Brawler are HEAVY, as theirs are (the side painter's).

## The pictures (docs/mockups/reflections_up/pictures/)

- `reflections_up_1.png` (Warrior, Ranger, Mage) and `reflections_up_2.png` (Warlock, Tinkerer, Brawler): each hero, then his
  reflection standing, running, from behind, at his tap's blow and his hold's, twice as big; under them, each at the game's
  own size (a picture pixel to a pixel), you and then your reflection. Wide, not tall (his phone shows a tall sheet too small).
- `reflections_up_moments.png`: each stepping out of the mirror (the stand-in mirror) and shattering, a few moments of each.
- `reflections_up_film.mp4`: 68 s, 1080 x 1080, 30 a second, captioned. For each hero: you and your reflection; it stepping
  out of a mirror; turning round (every side it has); running; its tap; its hold; struck down, it shatters.

Made by `npx tsx tools/reflections_up_pics.ts <dir> stills` then `python3 tools/reflections_up_sheet.py <dir> <out>`, and
`npx tsx tools/reflections_up_pics.ts <dir> film` then `python3 tools/reflections_up_film.py <dir> <out.mp4>`.

## The checks (tests/reflections_up.test.ts, 5, all passed; tests/reflections.test.ts, 9, all passed)

1. The switch is off, and nothing of the game imports it.
2. Every hero: the hero's own sides; his stance and run as long as his own lists, at his pace, his stride; his tap and hold
   as many frames as his own, the blow at the same moment; its shattering; its stepping out from in front only.
3. Every hero, from in front and another side, standing, running, at his tap's blow and his hold's: no cyan pixel, no cyan
   light; every pixel whole or empty but the pink edge; the pink edge round it. Its shattering and its stepping out: no cyan.
4. The hero's shape: its silhouette his own, pixel for pixel, in the same place.
5. The Hush's pink in its eyes and cracks on it, from in front.

tests/reflections.test.ts's first check counts this file among the reflections' own (it imports them, and is a mock-up).
Not run: the whole suite; `tools/unit.mjs` (run each file alone with tsx here); a playtest (nothing of the game changes).

## His word

12 Nov 2026, sent the two sheets, the sheet of moments and the film, asked by pop-up “Floor 18's reflections, remade from
the six heroes as they look now (the two sheets and the film): are these your glass copies?”: “Yes, hand to main
(Recommended)”. So it is handed to the main chat (the queue's item, retitled to bring this branch in).

## For the main chat, once he says yes

- floor 18's figure (art/act1_figs/reflection.ts) takes `makeReflectionUpArt().of(cls)` for every form (FORM_OF: the six
  classes), in place of the old pictures and the stand-ins; the game's monster drawing then needs the side for the way it
  faces, as the heroes have it (art/sides.ts `heroSides`), for the eight-sided ones.
- each class's own blows (game/act1_rules/reflection.ts STYLE_OF, REFLECT.hit): the new three are now the old styles' stand-ins
  (the Warlock magic, the Tinkerer a bow, the Brawler a blade). Their own tap and hold land at the moments above (its
  `clips.attack.hit`, `clips.heavy.hit`), and what the game draws for them besides the figure (a bolt, a vial, the Golem) would
  want the enemy's colours (`asEnemy`).
- THE BAKE: the reflections ride in the monsters' bake (render/monsters_baked.ts `gqueen: ['reflection']`). Six heroes, most
  from eight sides, is far more than the first three from two: only the player's own class is ever wanted on a run, so bake and
  fetch them by form.
- The Warrior's war axe and maul (build/warrior-tree, not in main): when his weapon tree is live, his reflection should hold
  what he holds; `warrior()` takes his great sword today.
- The Warlock is being redrawn (the queue's finish-mage-and-warlock-eight-sides) and the Brawler's eight sides wait on his
  word: both reflections are made from their painters, so they follow them (the Living Shadow's demon is not a reflection's:
  his reflection is the man).

## In the game, behind its switch (the queue's `wire-floor-18-new-reflections`, branch `build/reflections-in-play`)

Built by a chat of his working from the queue (his words, 12 Nov 2026, 13:32 Eastern: “Please work on the next queue item”), not
the main chat: cut from `main` at 40c62c8d (25.3.11) with this branch (7fcc5330) merged in, as the main chat did for 25.3.12.
`main` untouched, nothing published. EVERYTHING BELOW IS BEHIND `REFLECTIONS_UP`, OFF: off, the game is as it was, to the number
(tests/reflections_play.test.ts, check 1).

- THE SWITCH lives with the rules now (game/act1_rules/reflection.ts `REFLECTIONS_UP`; this file hands it on). It is on only in a
  page built to try it (`__TRY__` 'reflections': tools/reflections_try_page.mjs), so that the game and its painter's worker, the
  same script, have it on from the first (it says which pictures a figure is made of, and the two must agree). AT HIS YES: make it
  `{ on: true }`.
- THE FIGURE (art/act1_figs/reflection.ts): each form's look is `makeReflectionUpArt().ofForm(form)` with the switch on, the first
  reflections' with it off. EIGHT FORMS NOW: the six classes (FORM_OF), and THE WARRIOR HOLDING WHAT HE HOLDS (`WEAPON_FORM`:
  6 his war axe, 7 his maul; game/talents.ts heavyDrawn, by his tree as it comes into the world: `formOf`). With the switch off
  6 and 7 are the knight's and never come. The axe's and the maul's copies are made here from his own moves with them
  (`warriorWith`: stand, run, Cleave, the thrown axe thrown, braced while it flies and caught, Smash, the Earthquake, struck; what
  his hands hold never seen through by a crack: `heldFrom`). Sizes: `SIZE_UP`, read live (FIGURE_SIZE holds the very object).
- SEEN FROM EIGHT SIDES, as the heroes are: render/render.ts `monsterSpriteNow` shows the side for the way it faces
  (art/warrior_up_art.ts `wuFacing`), kept until it has clearly turned out of it (as the hero's figure keeps his, `EIGHT_STICK`),
  never mirrored; its fall from the side it faced (fx.ts `Fallen.fx/fy`). Every other monster as ever. THE BESTIARY, THE PAINTER'S
  WORKER AND THE MONSTERS' BAKE go by every side a figure has (art/sides.ts `heroSides`: front and back first, so every other
  figure is numbered as it was): art/bestiary.ts (its painting ahead, `forget`, `paintOrder`, `giveFrame`), render/painter.ts,
  render/monsters_bake_list.ts `figureLens`, render/monsters_baked.ts, src/dev/bake_monsters_page.ts.
- EACH FORM'S OWN TWO BLOWS (game/act1_rules/reflection.ts `UP`), the hero's own tap and hold, each landing when its picture's does
  and played as long (the art's clips' `hit` and length: check 2 holds them to it), after the same warnings as before; each form
  makes only its own (`reflection:tap3`, `reflection:hold3`: `can`). As read by this chat (to tell him; his to change):
  0 great sword, Strike (a cut) and the Slam (a ring before it); 1 the Ranger, the Shot and the Volley; 2 the Mage, the Wave and the
  Orb (both as the first reflections'); 3 the Warlock, a Hellfire Bolt at him and the Curse all round it; 4 the Tinkerer, a vial
  tossed where he stood, and on the hold THREE VIALS side by side (NO WHISTLE: his word of 12 Nov 2026, shown her copy whistling for
  a Golem that was not there, “I think just have the tinkerer throw her vials if there’s no golem”; her copy's hold picture is her
  toss: art/reflections_up.ts); 5 the Brawler, the jab and
  the roundhouse kick (a wide fan); 6 war axe, Cleave and the thrown axe out at him and back (the art's flight, a second);
  7 maul, Smash and the Earthquake round it. Their reach the first reflections' where the move is theirs, near them where new
  (medium: two blows). What it sends is drawn in the enemy's pink (render/act1_fx/reflection.ts: the bolt, the axe turning end
  over end, the vial); a slam, a quake and the Curse leave the game's ring (`burst`).
- FETCHED BY FORM: the floor's figures are its monsters' own (a reflection's is `reflection:<form>`), so only the hero's own form is
  painted or taken in; the glass Queen's call for hers (monsters_baked.ts BRINGS `gqueen`) now asks, under the loading screen, for
  the hero's own form's (main.ts), where it asked for the knight's whatever the hero was.

### Checked
tsc clean; tests/reflections_play.test.ts (new, 5); `node tools/unit.mjs --only act2_gqueen,reflections,reflections_up,
reflections_play,monsters_baked` and the core on 0dc6e26b5b: 28 files, 318 tests, all passed. The heroes' bake mark unchanged
(0b437a9dc71f). Filmed in play on floor 18 with the switch on (tools/scenarios/reflections_in_play.mjs, every form; the film
`pictures/reflections_in_play.mp4`, made by tools/reflections_play_film.py). NOT CHECKED: his phone; a release build with the
bakes; the published page's playtests.

### His word on it in play
12 Nov 2026, by pop-up. Sent the film of every form (pictures/reflections_in_play.mp4, as it was then), asked whether that is how
they should fight: “I think just have the tinkerer throw her vials if there’s no golem”; and “Yes, send it to GitHub
(Recommended)”. Done: her hold three vials, her toss's picture; the film made again. Sent her ten seconds again
(tinkerer_vials.mp4, not kept here: the film's own part), asked whether they are ready for the main chat to switch on, by 15:28
Eastern: “Yes, hand it to main (Recommended)”.

### For the main chat, to bring it in
- THE MONSTERS' MARK CHANGES (the bestiary and the bake's page go by every side): 72241754ab67 (25.3.11) to a new one. WITH THE
  SWITCH OFF the pictures are the same (the first reflections' are, to the pixel, as this branch's README says; nothing else is
  touched): `node tools/bake_monsters.mjs --from 72241754ab67`. With the switch on, the reflections' eight figures are new
  pictures: bake them (`--only reflection,reflection:1,...,reflection:7`) and take the rest `--from`.
- HIS YES IS GIVEN (above): `REFLECTIONS_UP` `{ on: true }` (game/act1_rules/reflection.ts), the bake, a release, the
  published page's playtests (tools/scenarios/reflections_in_play.mjs on the release page, each CLS, and high18_reflections.mjs).
