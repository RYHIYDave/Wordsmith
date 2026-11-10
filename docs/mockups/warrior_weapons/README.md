# The Warrior's battle axe and warhammer, step 1: their looks (the art chat's helper, 9 Nov 2026)

Branch `art/warrior-weapons`, from `origin/main` (the game as last released, 25.3.1). PICTURES ONLY: three takes on the battle
axe and three on the warhammer, for him to pick one of each; the moves come next, on the takes he picks, on these very drawings.
A mock-up behind a switch that is off, `WARRIOR_WEAPONS = { on: false }` (`src/art/warrior_up_weapons.ts`); nothing of the game
imports it or the drops' painter (`tests/warrior_weapons.test.ts`, 1).

## His words

From the main chat's board post of 8 Nov 2026, 06:35. 7 Nov 2026, 21:11: “Alright let’s figure out the warrior.  I want his skill tree to start with a three branch option to go to Battle Ax, Warhammer, or (insert two handed sword name).  Then he’ll need tap and holds, probably swipes for the three weapons.  These will change his current weapon drops as well.  Swords become hammers become axes.  I think, it seems crazy to have all three drop when he could only use one at any given time”

His picks, as the post gives them: the Greatsword (the third branch's name); the weapon is picked with his first talent point at
level 5 (the Greatsword till then); his weapon drops become the kind he picked; each weapon its own swipe. The moves, his “All
those are good”: GREATSWORD tap Strike, hold Whirl (a talent makes it Whirlwind), swipe Lunge; BATTLE AXE tap Cleave, hold a
thrown axe that comes back to him (a talent makes it Twin Axes, two thrown, one each side of his aim), swipe Leaping Chop;
WARHAMMER tap Smash, hold Earthquake (a talent makes it Tremors, three quakes, each weaker), swipe Shoulder Charge.

9 Nov 2026, in the art chat, his order: the seven words, then “The three new words (Recommended)”, then the Warrior's axe and
hammer.

## The picture: `pictures/weapons_looks.png` (1200 by 6942)

The three axe takes, then the three hammer takes, each a row: the weapon alone, three times the game's size (upright, its flat
to the eye, and turned); held by him in his guard (the dungeon) from toward you, side-on and away, twice the game's size; the
moment its tap is wound up and held (the Cleave, the Smash), from his side; on his back in town from the same three sides; as it drops, in the
bag at Normal, Magic, Rare and Unique (each in a slot as the game draws one, twice the size a phone shows it) and lying on a
dungeon's floor as the game lays loot, its name over it in its rarity's colour (twice the game's size; the name is the sheet's
lettering, not the game's); and at the game's own size: his guard from all eight sides, in town from three, the wind-up from his two sides,
and (the axes) thrown, spinning flat as it flies. His scarf's two ends are hung and settled as the game hangs them
(`engine/tails.ts`).

## The six takes

All original, two-handed and heavy, in his world's iron (a forged, darker cousin of his armour's steel), dark ash and brown
leather; what glows on each is the friend's cyan, as his great sword's blade glows. Each is SCULPTED in 3D as he is
(`dev/sculpt.ts`) and laid into his own sculpture as one picture with his hands (`graft`), so it is truly turned with him from
his eight sides, hides and is hidden truly, and is inked where it meets him; his friend's edge of light runs round it with him.

| Take | What it is | Its cyan |
|---|---|---|
| Axe A, the bearded axe | One broad blade, its edge long and swept, its beard hooked down toward his hands with the hollow under it open; a thick cheek round the eye thinning to the edge; a squared poll behind | its honed edge |
| Axe B, the war axe | Two flared bits, one each side of the haft, their edges swept out into horns; a narrow waist at the eye; a spike on top | both edges |
| Axe C, the crescent axe | A great half-moon blade held off a long haft by two sockets, the hollow between them open, its horns reaching past the top and down toward his hands; the longest | its honed edge |
| Hammer A, the maul | A squared iron block, its striking face a broad plate standing proud of it, a long spike behind, iron straps down the haft | the rim of its face, honed bright |
| Hammer B, the banded hammer | A round iron drum with flat faces, bound in three raised bands of blackened iron | a boss in the middle of each face |
| Hammer C, the rune hammer | A head flaring out from a blunt peen to a broad square face, marks of his own cut into the face and its sides | the cut marks burn |

**My picks: axe A and hammer A.** Axe A is the heaviest-looking single blade and the least like his great sword; spinning
when thrown, its one bit shows the spin. Hammer A has the crispest outline at the game's size (block, face, spike).

Each axe's blade is a wedge, thick at the eye and thinning to a third of a pixel either side at the edge, so it turns in the
light; each is throwable: lying flat in the air it reads at the game's size at every turn of its spin (the sheet's strip).

## How he holds them (`src/art/warrior_up_weapons.ts`)

- HIS GUARD (`GUARD_HEAVY`), in a dungeon: his rear stance, his legs made true as the great sword's (`WU_REST`), both hands at
  his right hip, the haft trailing back behind him; his LEFT HAND AT THE BUTT (the knob just out of his fist: his forearm runs on
  from his fist the way the butt points, so a haft that went on past it would go up his sleeve), his right hand up the haft.
  RAISED BY HIS SHOULDER, SO IT READS FROM ALL EIGHT SIDES: the haft rises a little (18 degrees) as it trails back, its head at
  the height of his chest behind him (on the screen, about his shoulders), his hands at the top of his hip (33 up, the sword's
  25). Held low as the great sword is, a head trailing behind him is wholly hidden from down and to the left (as his great sword
  is today); raised so, it is seen from every side, over his shoulder from there. THE HEAD TURNED EDGE DOWN, at his word (below):
  an axe's cutting edge, a hammer's striking face, hangs under the haft and points at the floor; a hammer's spike or peen is up.
- IN TOWN (`TOWN_HEAVY`, the game's town stance, his arms folded): on his back as the great sword is, but the head up behind his
  right shoulder and the haft down across his back to his left hip, flat against it, its edge or face turned out to his right
  and down, away from his head; the strap across his chest as the great sword's.
- THE CLEAVE, TOP OF ITS WIND-UP (`CLEAVE_TOP`, held): the axe lifted right up over him, both hands above his helm, the haft
  tipped toward the mark so that its edge is turned to where the blow will land, forward and down: a blow about to fall. His
  body wound round away from the mark, side-on to it, weight back and sunk on his back leg, back arched, his eyes on the mark.
- THE SMASH, TOP OF ITS WIND-UP (`SMASH_TOP`, held): the hammer lifted right up over him, both hands above his helm, the haft
  tipped toward the spot so that its striking face is turned to where it will land, forward and down, its spike or peen up and
  back; up on his toes, back arched, his eyes on the spot.
- WHICH HAND IS WHERE: held low (his guard) his right hand is up the haft and his left at the butt; raised over him (a wind-up:
  the pose puts his left hand above his right, `lhx` more than 0) his right hand is at the butt and his left a fist above it
  (`rightHandOn`). Either way no arm has haft running on from its fist the way its forearm comes.
- `paintArmed(take, s, q, side)` paints him at any pose of his bones with any take in his hands, or on his back when the pose
  stows it: his own painter (`paintWarriorUp`), the take grafted into his sculpture where the pose holds it, drawn again as one
  picture without the great sword. So a move is only its keys.

## The checks (`tests/warrior_weapons.test.ts`, all passing)

1. The switch is off; nothing of the game imports `art/warrior_up_weapons.ts` or `dev/warrior_weapons_items.ts`.
2. NOTHING THROUGH ANYTHING: in his guard, on his back and at each wind-up, no solid of the take is inside one of his (his body,
   tabard and skirt, scarf, helm, pauldrons, arms, legs) by 0.6 of a picture pixel or more, but where his two fists close round its
   grip (3 picture pixels round the middle of each fist: the fist and its flared cuff); and both his hands are on the haft, at its
   grip. The check sees a take put through him.
3. IT READS FROM ALL EIGHT SIDES: at the game's own size, in his guard and on his back, from each of his eight sides, at least 100
   picture pixels of its head are seen; at each wind-up, from the two sides the sheet shows (his two sides, side-on), 140. The
   least of each, from the test: axe A guard 145, town 125; axe B 187, 154; axe C 178, 146; hammer A 186, 165; hammer B 140,
   128; hammer C 260, 217.
4. Every frame crisp (every pixel whole but his edge of light), his cyan edge round him, nothing of the enemy's pink or gold; what
   of the take is seen is its own iron, wood and leather, and its glow the friend's cyan (seen in his guard from five of his
   eight sides at least: hammer B's bosses are on its faces, and the one turned to the floor is hidden, 6 of 8).
5. As items: each take at its four rarities in style A, 32 by 32, crisp, inside its frame with a clear pixel round it, the rim of
   its rarity's colour; each rarer one finer (Magic blue, Rare gold, Unique orange stones); no enemy's colour, no cyan.
6. THE HEADS TURNED AS HE ASKED: in his guard and at each wind-up's top the way an axe's edge or a hammer's striking face points
   has a downward part, in the world and on the screen from every one of his eight sides; at the wind-ups it points on toward the
   mark; on his back it is turned down and out from him; never toward his head. From the test (forward, left, up): his guard
   -0.29, -0.10, -0.95; the wind-ups 0.78, -0.14, -0.62.

Looked at close at the game's size before it went to him: the six takes from every side, on his back, at their wind-ups. Mended
on the way: every haft's left hand moved to the butt (the haft had gone up his left sleeve); his guard raised (the head was hidden
from down and to the left); the Cleave's hands moved (the long haft of axe C touched his helm); hammer B's bands and every collar
cut flat (a rod's ends are round: the bands had swallowed the drum, a plain lump).

## The drops (`src/dev/warrior_weapons_items.ts`)

Style A, his pick of 3 Nov (“A, painted”; “Finer and a rim”), painted by the game's own item painter (`art/items_a.ts`, now
exporting it and its pieces for this: nothing of its pictures changes), each drawn from the very outline of the head he holds.
On the diagonal, the butt at the bottom left; the head big and the haft short, as an item's picture is, so the head is what reads
at 16 game pixels. Normal plain iron, ash and leather; Magic a blue grip and a blue stone; Rare gold fittings, a gold line along
the head (a hammer C's marks filled with gold) and a yellow stone; Unique the head blackened and inlaid with gold, an ebony haft,
a red grip, orange stones. Nothing glows on them, as on the game's great sword picture. `weaponItemArt(take, rarity)`: 16 by 16
game pixels, anchor the middle, as `itemArt` gives.

## For the main chat (when he has picked)

- THE GAME DRAWS NO WEAPON IN HIS HAND BY RARITY TODAY (his rulebook's Heroes 3, “a rarer weapon looks finer”, is held only by the
  item pictures). The takes here are drawn as one look in his hand; finery in the hand would be new work.
- THE KINDS: the axe and the hammer each a `WeaponKind` with its bases, name, quick attack and drops (his picks above); the item
  painters move into `art/items_a.ts` PAINTERS under the kinds' keys. Note the OLD keys `axe` and `maul` (and `mace`) still exist:
  an old save's axe shows as the sword and its maul as the greatsword (`ITEM_A_OLD`, items.ts `migrateItem`); the new kinds want
  keys of their own (say `battleaxe`, `warhammer`) or those old keys taken back.
- THE BAKE (`tools/bake_heroes.mjs`): each weapon is a whole set of his lists from eight sides (his guard, town, every move with
  it). Three weapons is three times the Warrior's pictures (a dungeon alone, from eight sides, was 2,264 pictures, 34.2 MB decoded,
  2.39 MB packed for the great sword: README of `docs/mockups/warrior_up`), unless only the weapon he has picked is held. His run
  and town lists may share their legs but not their pictures, since the weapon is in them.
- PAINTING COST: a frame of him armed was 88 thousandths of a second here (him alone 34): `paintArmed` painted him once with the
  great sword and again with the take. Since step 2 his painter has a hook for what he holds (`WuAround.held`, below) and he is
  painted once.
- HIS GUARD WITH THESE IS RAISED (above): his look in a dungeon with an axe or a hammer differs from the great sword's there, so
  the heavy weapons read from every side. His to see in the picture.
- HAMMER C's MARKS: his own marks (a diamond, a stroke, chevrons), no alphabet's and no word; his rulebook's “Words in the world”
  keeps letters for words at work, so if he wants it, the marks stay marks.

## How the pictures are made

    npx tsx tools/warrior_weapons_pics.ts <dir>                 # every picture as a PNG, and what the checks find (said.json)
    python3 tools/warrior_weapons_pics.py <dir> docs/mockups/warrior_weapons/pictures/weapons_looks.png
    npx tsx tools/warrior_weapons_peek.ts <take> <hold> <out.png> [scale] [sides]   # a quick look: one take, one hold, eight sides

## The sheet cut for a phone (his word)

9 Nov 2026, by 20:05. Sent `pictures/weapons_looks.png` (1200 by 6820) and asked “Which battle axe for the Warrior
(weapons_looks.png)?”, he wrote: “These picture resolutions are so bad on phone I can see anything” (and gave no pick of a
hammer). Read as: the sheet is far too tall and its pictures too small on his phone. So the same pictures cut for a phone
held upright, by `tools/warrior_weapons_phone.py`: `pictures/axes_phone.png` and `pictures/hammers_phone.png` (each 1260
wide, about 2100 to 2200 tall): A, B and C side by side; the weapon alone at nine times the game's size, held facing you at
six times, wound up at four times, and its loot pictures. (Since his word on the heads, below: held and wound up are shown
from his side, each at four times; 1260 by 2017 and 1260 by 1916.) FROM NOW ON every picture for him is made this way: no wider than
about 1260, no taller than about 2200, a few big things in each, several pictures before one tall sheet.

## His word on the looks: the heads turned (step 1b, 9 Nov 2026)

Sent `axes_phone.png` and `hammers_phone.png`. Asked “Which battle axe for the Warrior (axes_phone.png)?”, by 20:17 he wrote:
“Have the blades and the hammers point down”. Asked “Which warhammer for the Warrior (hammers_phone.png)?”, he wrote: “All the
hammers are pointing the wrong way”. Asked “Got it, the heads are turned wrong. So I fix it the right way: what should point
down?”, he picked “The edge and the hammer face (Recommended)” (offered as: he still holds them up by his shoulder, but the
axe's cutting edge and the hammer's striking face turn to point down at the enemy, not up or back at him). He has not picked a
take yet.

What was turned, all six takes, every picture:

- IN HIS GUARD: the head turned half round about the haft (`wRoll` 180, it was 90: its flat had been up and its edge out to the
  side). The edge or the face now hangs under the haft and points at the floor: as far down as a head on that haft can turn
  (it points 0.95 down; the haft rises as it trails back, so what is left leans a little back, not forward). Axe B: one bit
  down, the other up, its spike along the haft. Hammer A: its bright-rimmed face down, its spike up. Hammers B and C: a face
  down. His hands a little higher and further back (33 up and 6 back, they were 30 and 4) and the haft a little straighter
  behind him (162 degrees round, it was 157), so the head, now hanging lower, is still seen from every side.
- THE WIND-UPS: made again. Laid back behind him as they were, an edge turned to the mark could only face the sky. Now the
  weapon is lifted right up over him and tipped 38 degrees toward the mark, so the edge or the face is turned to where the blow
  will land (0.78 forward, 0.62 down). To hold it so, his right hand is at the butt and his left a fist above it (as it was, the
  haft below his upper hand ran up his forearm).
- ON HIS BACK: as it was, which already had the edge or the face out to his right and down (0.88 out, 0.42 down), away from
  his head; the test now holds it.
- THE PICTURES: the sheet in the same layout, its wind-up shown from his side (and at the game's size from his two sides);
  the phone pictures show him held and wound up FROM HIS SIDE, where the edge or the face is seen pointing down (facing you, the
  head is seen end on and its turn cannot be seen).

NOTE (the art chat, 9 Nov, after step 1b): the wind-up row is left out of the two phone pictures for his pick
(`WIND_UP = False` in `tools/warrior_weapons_phone.py`): in the new wind-ups, seen from his side, his raised arms hide his
helm, so he reads as headless. TO MEND WITH THE MOVES (step 2): his helm seen in every frame of every move from every side
(elbows bent, his hands over and behind his head, his head tipped to the mark), the edge or the face still coming down.

# Step 2: his moves with the battle axe (the art chat's helper, 9 Nov 2026)

Still a mock-up behind the switch that is off (`WARRIOR_WEAPONS`). The moves: `src/art/warrior_up_axe_moves.ts`. Nothing of the game
imports it (`tests/warrior_weapons.test.ts`, 1). The warhammer's moves are the step after this one.

## His picks (9 Nov 2026)

After the heads were turned (his “Have the blades and the hammers point down”, “All the hammers are pointing the wrong way”, and
his pick “The edge and the hammer face (Recommended)”), shown `axes_phone.png` and `hammers_phone.png` (at `00b506bd`) and asked
“Which battle axe for the Warrior (axes_phone.png)?”, by 20:44: “B, the war axe”; asked “Which warhammer for the Warrior
(hammers_phone.png)?”: “A, the maul (Recommended)”.

So THE BATTLE AXE IS TAKE B, THE WAR AXE (two flared bits, a spike), and THE WARHAMMER IS TAKE A, THE MAUL. Takes A and C of
the axe and B and C of the hammer are not used: their code is left, nothing more is drawn with them.

## The film: `pictures/axe_moves.mp4`

40.1 s (1,204 pictures), 30 pictures a second, H.264 (yuv420p), 1266 by 652, 6.6 MB.

Shot in the game's own practice room on a phone's wide screen (844 by 390), the game drawing it: the film's page is the game
with his moves shown in place of his picture (`src/dev/axe_film_main.ts`), so his depth among the enemies, his light, his scarf,
the hits on the enemies and the cracked floor and dust where the Leaping Chop lands are the game's own. In order: standing;
running once round a ring (all eight sides); then each move at the game's own size from two or three sides, and again at half
speed and twice the size: Cleave (the cut across, then a second tap's cut back: toward you, side-on, away), the thrown axe
(side-on, away), Twin Axes (away, side-on), Leaping Chop (side-on, toward you, away). The enemies stand clear of him and of
each other; the blows strike them as the game strikes (its flash, its numbers, its knock). A line under the picture says what is
shown. The practice room's own buttons are in the picture, as he sees them.

## How he holds it

His LEFT hand at the butt and his RIGHT hand up the haft, in every move (a right-hander's grip, as his guard of step 1 has it);
the two never change places. For a swing his right hand SLIDES DOWN the haft to his left (a fist's width above it) and back up
after, as an axe is swung. In a throw his right hand alone, low on the grip. EACH FOREARM COMES TO THE HAFT ACROSS IT, never
along it (a forearm along the haft has the haft up its sleeve): every key's elbows are set for that (`elbowed`), and it is what
shapes the moves: an upright axe is held with the elbows out; a level one with the hands low and the forearms hanging to it.

## The moves (30 pictures a second; from all eight of his sides)

| List | Pictures | Beats (frames; seconds) |
|---|---|---|
| Standing, his guard alive | 60 (2 s, a loop) | his own stand as the game has it (`WU_REAR3`), his body and legs frame for frame; the head of the axe stirs behind him as his sword's point does |
| Running | 15 (0.5 s, a loop) | the game's own run (`KNIGHT_RUN3`), frame for frame; the axe before his right hip in both hands, its head trailing up behind him, edge down, riding with his steps |
| CLEAVE, the cut across (tap) | 37 (1.23 s) | skip-step in on the game's step 0 to 2; wind-up reached 6, HELD 6 to 8; strike 9 and 10; THE BLOW at 10 (0.333 s); freeze 11; wind-down to 20; waits at 21 (0.7 s) for a second tap; in his guard at 36 (1.2 s) |
| CLEAVE, the cut back (second tap) | 28 (0.93 s) | from where the first waits: skip-step 0 to 2; wind-up 6, HELD 6 to 8; strike 9 and 10; THE BLOW at 10 (0.333 s); freeze 11; wind-down 18; in his guard at 27 (0.9 s) |
| THE THROWN AXE, the throw (hold) | 21 (0.7 s) | wind-up reached 6, HELD 6 to 9; the throw 10 and 11; IT LEAVES HIS HAND at 11 (0.367 s); his arm carries on 14; braced at 20 |
| ... braced while it flies | 30 (1 s, a loop) | empty-handed, low and square, his right hand out for it; alive |
| ... the catch | 19 (0.63 s) | in his hand at 0; his arm carried back by it 1 to 3; held 4 to 6; in his guard at 18 |
| TWIN AXES, the throw | 21 (0.7 s) | as the one's; the second axe first seen in his left hand at 4; both leave at 11 |
| ... braced for two | 30 (1 s, a loop) | both hands out |
| ... the catch | 23 (0.77 s) | his own in his right hand at 0, the second in his left at 3; both back behind his shoulders 6 to 8; the second last seen at 11; in his guard at 22 |
| LEAPING CHOP (swipe) | 43 (1.43 s) | crouch reached 3, HELD 3 to 5 (0.167 s, on the spot); THE LEAP 5 to 20 (0.5 s in the air: the game carries and lifts him); the chop 19 and 20; THE BLOW at 20 (0.667 s), as his feet land; freeze to 23; wind-down; in his guard at 42 |

**CLEAVE** (beside his Strike: its wind-up and its reach). The wind-up: sunk on his back leg, wound round away, THE AXE LIFTED
HIGH, its haft upright before his right shoulder and its head over him, ITS EDGE TOWARD THE MARK. The strike: his hips whip
round, his hands drop to his hip and the axe comes down and across at the height of a hip. On his frames the far end of its head
is 71 degrees to his right at frame 9 (1.42 tiles from the floor point under him), 21 to his left at 10 (1.57 tiles), 42 to
his left at 11, and is carried on round: THE CUT IS 150 DEGREES WIDE BEFORE HIM (75 each side of his aim) and reaches 1.7 tiles
(his Strike's), the game's step on a swing (0.33 tiles in 0.12 s) as his Strike has it. The wind-down: carried on round and LOW
to his left, its head down by the floor, all of him turned and sunk after it. HOW A SECOND TAP CHAINS, as his Strike's does:
the first cut waits there at 21 (its `poise`) while a second tap may come; the second tap is the cut BACK, left to right, from
that very pose (the same beats; it ends in his guard of itself). With no second tap the first plays on from 21 into his guard.

**THE THROWN AXE.** The wind-up: his left hand leaves the haft and goes out toward the mark; his right draws the axe back
behind his right shoulder, its head up behind him and its edge down, all of him wound round after it. The throw: his arm comes
through level, the axe laid flat and trailing, and is whipped on round his hand and let go. THE GAME DRAWS IT IN THE AIR
(`axeFlying()`: 12 pictures, a whole turn, lying flat, its two edges each trailing a short streak of light; the same list
whichever way it flies): out along his aim and back, `AXE_FLIGHT`: 6 tiles from him at its furthest, 1 second out and back,
slowing as it turns (`axeFlightAt(t)`); from 0.8 tiles before him (where his hand lets it go) back to 0.4 (where his hand takes
it), 19 game pixels above the floor; turning once in 0.4 s (a picture a frame); striking what comes within 0.6 tiles of it once
on the way out and once on the way back. While it flies he stands braced (a loop, so the flight may be any length); the catch
begins on the frame it reaches his hand: it smacks into his hand and his arm is carried back by it, round his right side and up
behind his shoulder, he rocked onto his back leg; then his left hand comes to the butt and it is brought down into his guard.

**TWIN AXES** (the talent: “two thrown, one each side of his aim”). WHAT IS DRAWN: a second axe, the same, DRAWN FROM HIS BACK
over his left shoulder by his left hand as he winds up (first seen in his hand at frame 4), one drawn back behind each shoulder,
his chest out between them; both thrown at once, each `AXE_TWIN_SPREAD` 14 degrees to its own side of his aim; both caught (his
own, then the second 3 frames later: its flight is that much longer); and THE SECOND PUT AWAY again over his left shoulder (last
seen in his hand at frame 11 of the catch). Between whiles it is not seen on him.

**LEAPING CHOP** (beside his Lunge: its range, 6 tiles; its landing, 1.6 tiles round; its half second in the air). The crouch,
held, on the spot; he drives up off both feet; THE AXE IS LAID BACK OVER HIS RIGHT SHOULDER, his hands by his right ear (not
over his helm: from behind, hands over his head hide it), his knees up under him, arched at the top; THE CHOP comes over past
his right ear and DOWN INTO THE FLOOR as his feet land, his right hand slid down the haft, all his weight on it. The game lifts
him `AXE_CHOP_HIGH` 40 game pixels at the top (its own leap's lift, `LEAP_LIFT`; his Lunge's is 9). THE AXE STRIKES THE FLOOR
1.5 TILES BEFORE WHERE HIS FEET COME DOWN (`AXE_CHOP_STRIKE`: the far end of its head is 1.62 tiles before him on the blow's
frame, its middle 1.39). THE CRACK AND THE DUST ARE THE GAME'S, there (in the film: the game's own leap landing,
`render/wild.ts` `landing`, cracks, a flash and dust; with his Lunge on, a Warrior's landing draws the Lunge's instead, so the
film has it off). Then a freeze, sunk over it; he wrenches it out, swings it low round his right side as his front foot comes
home, and is in his guard.

## The rules every frame keeps (the checks: `tests/warrior_weapons.test.ts` 7 to 11)

Every one of the 327 frames, from every one of his eight sides (2,616 pictures):

- HIS HELM IS SEEN: six tenths at least of what of it faces the eye (`helmSeen`), the smear of a strike counted as hiding it.
  The least in each move: standing 79%, running 81%, Cleave 62% and 66%, the throw 83%, braced 78%, the catch 83%, Twin Axes 80%,
  83% and 82%, Leaping Chop 63%. How: an upright axe is held before his right shoulder, never before his face; overhead it is
  laid back over his right shoulder with his hands by his ear; and NO SMEAR IS PAINTED OVER HIS HELM (a sweep that passes his
  head passes behind it: his rulebook's Animations 4).
- THE EDGE'S WAY: the working edge (of the war axe's two bits, the one turned more down or toward the mark) points down or
  toward the mark by a quarter at least, and is never turned toward his own head. Standing, running and waiting, a bit hangs
  under the haft; lifted for a blow, a bit faces the mark; in a strike, a bit leads the cut.
- BOTH HANDS ON THE GRIP wherever the move has two on it; his right wherever it has one; in Twin Axes his left on the second's.
- NOTHING OF THE AXE THROUGH HIM (step 1's check, every frame; the second axe too).
- HIS STAND AND HIS RUN ARE THE GAME'S OWN: every number of his body and his legs the game's, frame for frame.
- HIS FEET GRIP THE FLOOR: a foot that is down moves no more than 1.41 picture pixels between two frames (a heel turning on its
  toes); the game carries him only on a cut's first step and through the leap.
- Crisp, the friend's cyan, nothing of the enemy's; the thrown axe in the air the same.

Looked at close, at the game's size, from all eight sides (contact sheets, `tools/warrior_axe_peek.ts`), and in the film.
Mended on the way: his forearms laid across the haft (the haft was up his right sleeve in every swing); Cleave made a low cut
(hands at his hip) so that they can be; the head of the axe no longer spun half round as it is lifted; the overhead holds moved
off his helm to his right shoulder; the Leaping Chop's haft kept clear of his right pauldron on the way up; Twin Axes' two held
wider and lower (the second hid his helm from behind); the smear made again (below).

**Beside the Brawler and the Gate Ward** (the measure for new art): the Warrior with the war axe, his wind-up, his blow and the
axe in the air were put beside the Veteran (his stance, his cross and his round kick with their effects) on the Gate Ward's
ground at the game's own size. The axe itself sits at their level: sculpted and inked as his armour is, five tones of iron, its
edges the friend's cyan. ITS SMEAR DID NOT: it was rougher than his great sword's and the Veteran's streaks (a thin faceted
band, with two big flat copies of the axe's head standing off it). It is now made exactly as his great sword's is (one tapering
crescent, bright behind the head, breaking up at its old end, a lit rim, two slender after-images lying on it), and reads at
his sword's level.

## What the main chat needs

**The lists** (`makeWarriorAxeArt()`: one `AnimSet` for each of his eight sides, in the shape `makeWarriorUpArt` gives; each
frame painted when first read): `idle` 60, `walk` 15, `clips.attack` 37 (`hit` 0.333, `poise` 0.7, `tail`), `clips.attack2` 28,
`clips.heavy` 21 (the throw; `hit` 0.367 is the moment it leaves), `clips.hold` 30 (braced, a loop), `clips.release` 19 (the
catch), `clips.leap` 16 (the leap by how far through he is, the last the blow), `clips.land` 23 (from the blow), and under
`clips.moves`: `chopCrouch` 6, `twinThrow` 21, `twinBraced` 30, `twinCatch` 23. That is 329 pictures a side, 2,632 for his eight;
and `axeFlying()`, 12 of the axe in the air (one list for every way). A frame is about 70 thousandths of a second to paint here.
NOT DRAWN YET with the axe: struck from in front and behind, his fall, town and his card (step 1's hold on his back is a pose,
not lists), and a run empty-handed.

**The rules** (they follow these frames):
- CLEAVE: the blow at 0.333 s (his Strike's `windup`), all who stand within 1.7 tiles and 75 degrees either side of his aim; the
  game's step on a swing as Strike's; a second tap while the first waits (to 0.7 s, and the game's own window after) is the cut
  back, the same numbers.
- THE THROWN AXE: it leaves at 0.367 s; the flight above (`AXE_FLIGHT`); the game draws the axe, moves it, and strikes with it
  both ways; the catch begins when it reaches him. AS DRAWN HE STANDS while it flies (about 2 s from the hold to his guard).
- TWIN AXES: two, 14 degrees each side of his aim; the second comes back 0.1 s after the first.
- LEAPING CHOP: 0.167 s crouched before he leaves the floor (his Lunge leaves at once), then the Lunge's half second in the air
  (the game's carry and its lift, 40 game pixels); the blow as he lands, 1.6 tiles round a point 1.5 tiles before his feet (so:
  either he lands 1.5 tiles short of the spot aimed at, or the area is put there); the game's cracked floor and dust at that point.
- HIS SIDE: by `wuFacing` as his great sword's lists are; an attack's side is his aim's.

**The game's files this step touched** (nothing changes while they are not used): `art/warrior_up.ts`: his painter takes what he
holds in place of his great sword (`WuAround.held`: laid into his sculpture and drawn with him as one picture; his great sword is
then not drawn). `art/warrior_up_moves.ts`: four of its helpers for his feet are exported (`onToes`, `backFoot`, `lightFeet`,
`skipFeet`). `tests/warrior_up.test.ts` holds every frame of his as it was.

## For him to decide

1. TWIN AXES' SECOND AXE: as drawn it comes from his back and goes back there, and is not seen on him between. If he would
   rather it were always on his back once he has the talent, his standing and running lists want a second set with it there.
2. WHILE THE AXE FLIES: as drawn he stands braced for it. If he is to move meanwhile, a run and a catch on the run want drawing.
3. LEAPING CHOP'S CROUCH: it is held a sixth of a second before he leaves the floor, where his Lunge leaves at once.

## How the pictures are made

    npx tsx tools/warrior_axe_peek.ts <move> <out.png> [scale] [sides] [frames]   # a move's frames from his eight sides, and what the checks find
    node tools/axe_film_page.mjs                                                   # the film's page: dist/axe_film.html
    OUT=<frames dir> node tools/playtest.mjs --file dist/axe_film.html --touch --size 844x390 --dpr 3 --init tools/axe_film_init.js --scenario tools/scenarios/axe_film.mjs --out <frames dir>/x
    python3 tools/warrior_axe_film.py <frames dir> docs/mockups/warrior_weapons/pictures/axe_moves.mp4

## His word on the axe's moves (step 2)

9 Nov 2026, by 22:34. Shown `pictures/axe_moves.mp4` (at 58ec9c84) and asked “Are the battle axe's moves right
(axe_moves.mp4)?”: “Yes, on to the hammer (Recommended)” (offered as: next, the maul's moves: Smash, Earthquake and Shoulder
Charge). Asked “With the Twin Axes talent, when should the second axe show?”: “Only when he throws it (Recommended)” (offered
as: he pulls it from his back to throw and puts it away after; no extra pictures for the phone to hold). So the second axe
is as drawn: seen only in the Twin Axes throw and catch; no second set of stand and run pictures.

STILL FOR THE MAIN CHAT TO SETTLE WITH HIM (rules, not looks): whether he may move while the axe flies (as drawn he stands
braced, about 2 s from hold to guard); whether Leaping Chop's crouch may hold the swipe a sixth of a second where the Lunge
leaves at once. AND SEEN IN THE FILM: his life bar stays at his ground height while he is lifted in a leap, so it crosses his
body in the air (the game's own; it should ride with his lift).
