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
leaves at once.

HIS TWO ANSWERS, 9 Nov 2026, 22:37 (told those two questions): “Yes he can move.  Yes leaping chop can”. Read as: (1) HE MAY
MOVE WHILE THE AXE FLIES: so the axe has his run empty-handed and the catch on the run (step 3, below), and the braced loop is his
standing wait; (2) the Leaping Chop keeps its crouch as drawn. AND SEEN IN THE FILM: his life bar stays at his ground height while he is lifted in a leap, so it crosses his
body in the air (the game's own; it should ride with his lift).

# Step 3: his moves with the maul, and the last pieces for both weapons (the art chat's helper, 9 to 11 Nov 2026)

Still a mock-up behind the switch that is off (`WARRIOR_WEAPONS`). The maul's moves: `src/art/warrior_up_hammer_moves.ts`
(made on the axe's machinery: `heavyKit` in `src/art/warrior_up_axe_moves.ts` now makes the keys for either weapon; the axe's
pictures are unchanged, every one of a sample of 708 the same to the byte). The last pieces: `src/art/warrior_up_heavy_art.ts`.
Nothing of the game imports either (`tests/warrior_weapons.test.ts`, 1).

## The films

- `pictures/hammer_moves.mp4`: 38.0 s (1,139 pictures; made again in step 3b with the new Earthquake and Tremors, and in step 3c
  with the ground quaking and a slow, close Tremors), 30 a second, H.264 (yuv420p), 1266 by 652, 6.5 MB. Shot as `axe_moves.mp4`
  was, in the practice room on the phone's wide screen, the game drawing it: standing; running once round a ring; SMASH and its
  second tap (toward you, side-on, away); EARTHQUAKE (side-on, away); TREMORS (toward you); SHOULDER CHARGE (side-on, toward
  you, away); each a second time at half speed and twice the size. The game's own pound and slam on the floor, its hits and its
  knock. Made by `tools/scenarios/hammer_film.mjs` on the axe's film page (it now holds both weapons' moves).
- `pictures/axe_run_catch.mp4`: 9.2 s (275 pictures), the same format, 2.0 MB: the axe thrown, him running on empty-handed while
  it flies, and catching it on the run; Twin Axes the same; and at half speed, twice the size (`tools/scenarios/axe_run_catch.mjs`).

## How he holds the maul

His LEFT hand at the butt and his RIGHT up the haft, as with the axe; for a blow his right slides down to his left. THE MAUL HAS
ONE FACE, so its head is never rolled about its haft: from his guard (the haft trailing back, the face down) it is SWUNG LOW
ROUND HIS RIGHT SIDE AND UP BEFORE HIS RIGHT SHOULDER, which brings the face round to the mark of itself; past upright it is laid
back over his right shoulder, his hands by his right ear, so his helm is seen from every side; and it comes down from there face
first. (Lifted straight up behind him its face would point back at the top, and turned in his hands it would point sideways on
the way.)

## The moves (30 pictures a second; from all eight of his sides)

| List | Pictures | Beats (frames; seconds) |
|---|---|---|
| Standing, his guard alive | 60 (2 s, a loop) | his own stand (`WU_REAR3`), frame for frame; the maul's head stirs less than the axe's: it hangs |
| Running | 15 (0.5 s, a loop) | the game's own run (`KNIGHT_RUN3`), frame for frame; the maul before his right hip in both hands, its head up behind him, face down, carried a little lower than the axe; its head DIPS AND RISES a sixteenth of a second BEHIND each step and swings wider: its weight lags |
| SMASH, the first blow (tap) | 39 (1.3 s) | skip-step in 0 to 2 (the game's step on a swing); swung low round his right side and up 2 to 7; wind-up reached 8, HELD 8 to 11 (up on his toes, arched, the maul laid back over his right shoulder, its face to the mark); strike 12 and 13, smeared; THE BLOW at 13 (0.433 s), the face flat on the floor; freeze to 16, sunk over it; waits at 21 (0.7 s) for a second tap, the maul still on the floor; hauled up and swung low round his right side; in his guard at 38 |
| SMASH, the second blow (second tap) | 39 (1.3 s) | from where the first waits: skip-step 0 to 2 as he heaves it up off the floor round his right side; the same top at 8, HELD 8 to 11; THE BLOW at 13 (0.433 s); the same wind-down; in his guard at 38 |
| EARTHQUAKE (hold; and TREMORS): A FULL SPIN, THEN DOWN (step 3b) | 50 (1.67 s) | THE COIL reached 2 (sunk, wound round to his right, the maul drawn back round to his right side, low), HELD 2 to 4; THE WHIRL 4 to 13 (0.3 s): a full turn and an eighth, the maul's head swept wide and level round him at his waist, both hands together at its butt, his arms out, his body turning with it, HIS FEET STEPPING ROUND (five steps: right, left, right, left, right, the last two home to his guard's stance), the head smeared as it goes (6 to 14); UP AND OVER the top out of the turn 14 and 15; laid back over his right shoulder at 16, HUNG a beat to 17; strike 18, smeared (18 to 20); THE BLOW at 19 (0.633 s), deeper than a Smash; a long freeze, sunk over it as the ground heaves, to 24; the heavy haul back; in his guard at 49 |
| SHOULDER CHARGE (swipe) | 43 (1.43 s) | crouch reached 3, HELD 3 to 6 (0.1 s, on the spot: low, his left shoulder to the mark, the maul let down into his right hand and drawn back low behind him); THE DRIVE 6 to 21 (0.5 s, the game carries him): his own run's legs, a turn of it, driven low and long, pitched forward, HIS LEFT SHOULDER LEADING, the maul trailed low behind him, face down, his cloth streaming; THE SKID 21 to 27 (the game carries him on, slowing), front foot planted, weight thrown back, the maul's weight carried on round his right side to before him; his left hand to the butt and up behind him; in his guard at 42 |

**SMASH** (beside his Strike, heavier and slower: its blow at 13 frames, his Strike's at 10). ONE CRUSHING BLOW STRAIGHT DOWN BEFORE
HIM: the middle of the face lands 1.43 tiles before his feet (measured on his frames; the test holds 1.4 within 0.15), its face
flat on the floor. The rules: `HAMMER_SMASH_AT` 1.4 tiles before him, a round of `HAMMER_SMASH_ROUND` 0.4 tiles (a little less than
a tile across; its far edge 1.8, his Strike's reach 1.7); the game's step on a swing as Strike's. HOW A SECOND TAP CHAINS, as his
Strike's: the first waits at 21 (0.7 s, its `poise`), the maul on the floor and he gathered over it; a second tap is the second
blow, heaved straight up from there, the same numbers; with no second tap the first plays on into his guard (38). THE GAME DRAWS:
its pound at the spot (in the film `blast(..., 'pound')`: cracks and dust).

**EARTHQUAKE** (beside his Slam: struck 1.4 tiles before him, 2.0 round; since step 3b A FULL SPIN, THEN DOWN, so its blow is at
0.633 s, not the Slam's 0.5: the whirl does not read in less). THE WHIRL IS HIS WIND-UP, NOT A BLOW: it strikes nothing; what
hurts is the ring. The face lands 1.4 tiles before him (`HAMMER_QUAKE_AT`; measured 1.46). THE GROUND HEAVES OUT IN A RING (the game's to draw: in the film its slam, `blast(..., 'slam')`):
`HAMMER_QUAKE_ROUND` 2.0 tiles round that point, rolling out to its edge in `HAMMER_QUAKE_ROLL` 0.35 s. TREMORS (the talent:
“three quakes, each weaker”): DRAWN AS ONE BLOW, the same spin and the same 50 frames (no more pictures): the ground heaves THREE TIMES from
the one blow, one after another, `HAMMER_TREMORS`: 0.35 s apart (at 0.633, 0.983 and 1.333 s), each 0.6 tiles WIDER (2.0, 2.6, 3.2 tiles) and
WEAKER (1, 0.6 and 0.35 of the first's damage); he stays sunk over the maul as the first rolls out and is hauling it up as the last
does.

**SHOULDER CHARGE** (beside his Lunge: its range, 6 tiles; its half second on the way). He leaves the spot at 0.2 s
(`HAMMER_CHARGE_GO` 6; his Lunge leaves at once, the Leaping Chop at 0.167 s); THE GAME CARRIES HIM up to `HAMMER_CHARGE_FAR` 6
tiles over the half second of the drive (in the film 4.4) and `HAMMER_CHARGE_SLIDE` 0.6 more through the skid, slowing; the drive
is spread over by how far through he is (16 pictures), as his Lunge's is. WHAT HE MEETS is struck and THROWN ASIDE: all within
`HAMMER_CHARGE_WIDE` 0.7 tiles either side of his path, struck as he reaches them and thrown `HAMMER_CHARGE_THROW` 1.6 tiles off
his path to their own side (in the film over a quarter of a second: the game's knock would do it). His cloth streams as he goes
(the figure a frame and three frames before is drawn where the game carried him from: `carried`).

## The rules every frame keeps (the checks: `tests/warrior_weapons.test.ts` 12 to 16, as the axe's 7 to 11)

Every one of the 246 frames of his six lists with the maul, from every one of his eight sides (1,968 pictures): HIS HELM IS SEEN
(the least in each: standing 79%, running 81%, Smash 60% and 63%, Earthquake 60% (step 3b's spin), Shoulder Charge 71%); THE FACE points down or
toward the mark by a quarter at least and never at his own head; BOTH HANDS ON THE GRIP wherever the move has two on it, his right
wherever one; NOTHING OF THE MAUL THROUGH HIM; his stand and his run the game's own, every number of his body and legs; HIS FEET
GRIP (the most a foot that is down moves between two frames: 1.37 picture pixels; the game carries him only on a Smash's first
step and through the charge); the smears the friend's cyan, every pixel whole, nothing of the enemy's; the blows land where the
rules put them.

Looked at close at the game's size from all eight sides (`tools/warrior_axe_peek.ts`, which now shows the maul's moves and the
last pieces too, with where the face is) and in the film. Mended on the way: the wind-up's maul had stood straight up before his
face (his helm hidden from his right, 23%): it now comes up round his right side and is laid back over his shoulder; its
forearms set across the haft through the haul back; the second tap's heave kept out of his face from the front; the charge's
skid takes both hands on the haft as the Smash's haul back does (one-handed, the haft lay up his forearm).

**Beside the Brawler and the Gate Ward** (his measure): the Warrior with the maul (standing, the Smash's top and blow, Earthquake's
top and blow, the charge) laid beside the Veteran (his stance, his jab, his cross) at the game's own size: the maul is sculpted and
inked as his armour is, its iron in the same five tones, its bright rim the friend's cyan, its smear made as the axe's and the
great sword's; at their level, neither finer nor rougher. (The Gate Ward's ground is the film's room's own in `axe_moves.mp4`; it
was not set up again for this look.)

## While the axe flies he may move (his word, above)

`AXE_RUN_MOVES` in `src/art/warrior_up_axe_moves.ts`, from all eight sides:

| List | Pictures | What |
|---|---|---|
| `runEmpty` | 15 (0.5 s, a loop) | his own run (`KNIGHT_RUN3`) key for key, his arms as the game's run swings them, NOTHING IN HIS HANDS: the axe's run while it flies, and Twin Axes' (both are out) |
| `runCatch` | 15 (0.5 s) | THE CATCH ON THE RUN: his run's steps frame for frame from its first picture (his feet where his run puts them), the catch in his arms: it smacks into his hand (0), his arm carried back by it (1 to 3), held (to 6), brought down round his right side (8, 10), his left hand to the butt, carried as his run carries it (12); it ends where his run begins, so it goes on into his run |
| `twinRunCatch` | 30 (1 s) | the same with Twin Axes: both caught, the second put away over his left shoulder (11), his own brought down into his run (15 to 22); two turns of his run |

On the run his body above his feet is turned and bent as the standing catch has it (his feet stepping as his run's), handed
back to his run's as the axe comes down. Standing, he waits braced (`hold`, `twinBraced`) as before. Shown in `axe_run_catch.mp4`. Checked as the moves are
(`tests/warrior_weapons.test.ts` 17).

## The last pieces, for both weapons (`src/art/warrior_up_heavy_art.ts`)

`makeWarriorHeavyArt(weapon, place)`: 'axe' or 'hammer'; a dungeon, town or his card; the shape `makeWarriorUpArt` gives. Each is
THE GAME'S OWN MOVE OF HIS, his body and legs frame for frame (`heavyOf`), the weapon in place of the sword:

- STRUCK from in front (`clips.reel`, 8) and from behind (`clips.lurch`, 8): both hands keep it in his guard as his body is
  thrown about (his right elbow swung a little, so his forearm stays across the haft).
- HIS FALL (`clips.fall`, 47): his left hand leaves the haft for his knee; his right holds it at the butt and he goes down LEANING
  ON IT, its head on the floor (where his great sword's point goes), its edge or face down; his lights go out as the game's do.
- TOWN AND HIS CARD: `idle` (12, at 10 a second) and `walk` (15) the game's town stand and run with it ON HIS BACK as step 1 drew
  it; on his front side `clips.idleA` (he looks about him, 73 at 20 a second) and `clips.ready` (41: he reaches over his
  shoulder as the game's draw does and has it in his guard from the moment his hand is at it, two frames before the sword would
  leave his back).
- In a dungeon, all his moves with it (`makeWarriorAxeArt`, `makeWarriorHammerArt`) and with the axe `clips.moves.runEmpty`,
  `runCatch`, `twinRunCatch`.

Checked (`tests/warrior_weapons.test.ts` 18): his bones the game's; every rule kept from every side, HIS HELM SEEN ON HIS BACK TOO.
(As step 3 was handed back, the head of the weapon on his back stood before his helm from behind and behind-left, 0% to 9% of it
seen, in town, on his card and in the draw's first frames: step 1's carry, the head up behind his right shoulder. MENDED BY THE
ART CHAT, 11 Nov 2026, before he was asked anything: the weapon is slung ACROSS his back, its head out past his right shoulder
and clear of his helm, the haft down to his left hip (`onHisBack`: `BACK_LEAN` 54, the head's heart 1.75 shoulder-halves out;
a hammer's 2 above the root of his neck, an axe's wider head 4 below it). The least of his helm seen now, in every frame from
every side: the maul, town 81%, his town run 76%, his look about him 79%, the draw 81%; the war axe, 81%, 69%, 79%, 82%.
Nothing through him. The head still reads from all eight sides (the least, from his front-left: the maul 136 picture pixels,
the war axe 137; the rule is 100). Test 18 holds the helm rule on his back as everywhere else; test 3 keeps the reads-on-his-back
rule for the two takes he picked (the bearded axe he did not pick shows 29 from his front-left there, and is drawn no more).
`pictures/weapons_looks.png` is step 1's sheet and still shows the old carry; the new one is `pictures/carry_phone.png`
(1260 by 1428, phone-shaped: each weapon on his back in town from his eight sides, three times the game's size).)

## What the main chat needs

**The lists** (each side's made when first asked for, each frame painted when first read):
- `makeWarriorHammerArt()` (the maul in a dungeon): `idle` 60, `walk` 15, `clips.attack` 39 (Smash: `hit` 0.433, `poise` 0.7,
  `tail`), `clips.attack2` 39 (the second blow), `clips.heavy` 50 (Earthquake and Tremors: `hit` 0.633), `clips.leap` 16 (the
  charge's drive by how far through he is), `clips.land` 22 (the skid, from its first frame, to his guard), `clips.moves.
  chargeCrouch` 7. The three-picture `attack`, `heavy`, `leap` are picked from those (no pictures of their own).

**ONE LIST, FOR BOTH WEAPONS, OF EVERYTHING THE BAKE TAKES** (`tools/bake_heroes.mjs`; pictures a side, from all eight sides):

| Weapon, place | Lists | A side | Eight sides |
|---|---|---|---|
| War axe, a dungeon | `makeWarriorHeavyArt('axe', 'dungeon')`: idle 60, walk 15, attack 37, attack2 28, heavy 21, hold 30, release 19, leap 16, land 23, reel 8, lurch 8, fall 47; moves: chopCrouch 6, twinThrow 21, twinBraced 30, twinCatch 23, runEmpty 15, runCatch 15, twinRunCatch 30, cleaveAppear 4 | 456 | 3,648 |
| The thrown axe in the air | `axeFlying()`: 12 (one list for every way) | | 12 |
| The glint (the thrown axe gone into the one he holds) | `axeGlint()`: 6 (one list for every way) | | 6 |
| Maul, a dungeon | `makeWarriorHeavyArt('hammer', 'dungeon')`: idle 60, walk 15, attack 39, attack2 39, heavy 50, leap 16, land 22, reel 8, lurch 8, fall 47; moves: chargeCrouch 7 | 311 | 2,488 |
| Either, town (and his card: the same lists) | idle 12, walk 15; on his front side also idleA 73, ready 41 | 27 (front 141) | 330 each |

So the war axe is 3,996 pictures and the maul 2,818, beside the great sword's 2,264 in a dungeon: if every weapon is baked, the
Warrior is about four times the pictures he was; if only the weapon he has picked, never more than the axe's. A frame is about 70
thousandths of a second to paint here.

**The rules** (they follow these frames; with the axe's, above):
- SMASH: the blow at 0.433 s, all within 0.4 tiles of a point 1.4 tiles before him; the game's step on a swing; a second tap while
  the first waits (to 0.7 s, and the game's own window after) is the second blow, the same numbers; the game's pound there.
- EARTHQUAKE: the blow at 0.633 s (the whirl before it strikes nothing); the ground heaves in a ring 2.0 tiles round a point 1.4 before him, out to its edge in 0.35 s
  (the game's slam). TREMORS: the same blow; three rings, 0.35 s apart, 2.0, 2.6 and 3.2 round, 1, 0.6 and 0.35 of the damage.
- SHOULDER CHARGE: 0.2 s crouched on the spot; then up to 6 tiles in 0.5 s and 0.6 more in the skid (0.2 s), the game carrying
  him; all within 0.7 tiles of his path struck and thrown 1.6 tiles aside; in his guard at 1.4 s.
- THE AXE WHILE IT FLIES: he may move; moving, his run is `runEmpty`, and if he is running when it reaches him the catch is
  `runCatch` (`twinRunCatch`), else the standing catch. THE CATCH ON THE RUN BEGINS WITH HIS RUN'S FIRST PICTURE: the game starts
  his run's clock again from it as the catch begins (he is mid-stride either way; else it would want the catch drawn from each of
  the run's 15 pictures).
- HIS SIDE: by `wuFacing`, as the great sword's.

**The game's files this step touched** (nothing changes while they are not used): `art/warrior_up_axe_moves.ts` (its keys'
makers shared with the maul, `heavyKit`; a move may give his bones itself, `pose`, and say how far the game carries him,
`carried`; `axeFaults` leaves the hands and the edge alone while the weapon is on his back), `dev/axe_film_main.ts` (the film's
page holds both weapons' moves), `tools/warrior_axe_peek.ts`.

## For him to decide

1. (SETTLED, not his to decide: mended 11 Nov 2026, above.) In town, from behind, the head of the axe or the maul on his back
   stood before his helm; it is slung lower and further out now, and his helm is seen from every side.
2. TREMORS are drawn as THREE QUAKES FROM THE ONE BLOW (no more pictures); three blows would be about 30 more pictures a side.

# His words on step 3's films (11 Nov 2026), and what they ask for (step 3b)

Shown `pictures/hammer_moves.mp4` and `pictures/axe_run_catch.mp4` (at 94a5004b) and `pictures/carry_phone.png` (the carry
mended, 99a230d7), and told that the Earthquake's swing was much like the Smash's, he was asked two things, and answered by
09:03:
- “Are the warhammer's moves right (hammer_moves.mp4), with the axe's catch on the run (axe_run_catch.mp4)?”: “Bigger Earthquake
  swing” (offered as: give the Earthquake a swing of its own, so it doesn't look like the Smash; then hand both to main).
- “Is the weapon on his back right in town (carry_phone.png)? It is slung across his back now, so his helm shows from behind.”:
  “Yes, like that (Recommended)”. SO THE CARRY IS SETTLED WITH HIS YES.

At 09:03 he wrote: “I want to make sure you can still do the tap attack while the axe hold is still flying”. Read as: while the
thrown axe is out, a tap still Cleaves (a rule for the main chat, and pictures for it from art). And: “What does the hammer tap
actually do?” (answered: Smash, one heavy blow straight down on a small spot before him, slower and heavier than the Strike;
tap again for a second blow; how hard it hits, and whether it does more, is the main chat's to write and his to say).

Asked two more, he answered by 09:07:
- “While the Warrior's thrown axe is still flying his hands are empty. What should a tap swing?” (offered: another axe from his
  back; his fists; call the axe back): he wrote “I understand that the axe is going to kind of materialize to keep fighting but I
  do need that to work that way”. Read as: AN AXE APPEARS IN HIS HANDS and he Cleaves as drawn; it must work.
- “How should the Warrior's Earthquake swing go, so it looks bigger than the Smash?” (offered: he jumps and slams down; a full
  spin, then down): “A full spin, then down” (offered as: he whirls the maul once round himself and brings it over onto the
  floor).

## Step 3b: what was made of his words (the art chat's helper, 11 Nov 2026)

**THE EARTHQUAKE: A FULL SPIN, THEN DOWN** (his pick). From its first frame it is not the Smash: a coil, held; one full turn with
the maul swept wide and level round him and his feet stepping round under him; up and over the top, hung a beat, and down.
Its beats and numbers are in the table and under EARTHQUAKE above (the blow at 0.633 s, 19 frames; 50 frames, 1.67 s; the ring
and Tremors as before, from the one blow). HOW HIS FEET GO ROUND: his feet are set on the floor as the floor has them, so a foot
that is down stays where it is while his hips turn over it; each in turn lifts and steps round to where his stance puts it for the
turn to come (`whirlFeet`); a foot that is down moves at most 1.37 picture pixels between two frames; the game does not carry him.
From the whirl on his hips and the maul's way are said a turn further round (the same pose). The whirl is drawn smeared as the
strikes are (a longer arc), never over his helm. In the film the enemies stand outside the maul's circle and inside the ring.
`pictures/hammer_moves.mp4` made again with it (below).

**A TAP WHILE THE THROWN AXE IS OUT: AN AXE APPEARS IN HIS HANDS AND HE CLEAVES.** What is drawn:
- THE CLEAVE AS IT IS, frame for frame, begun from his empty hands (standing braced or on his run empty-handed: the game starts
  the Cleave from there as from anywhere). Over its FIRST FOUR FRAMES THE AXE GATHERS IN HIS HANDS (`AXE_CLEAVE_APPEAR`,
  `gatherIn`): light in the friend's cyan runs up the haft from his hands into the head; where it has not come, nothing of the
  axe; at its front the axe is cyan, brightest at the front; behind it the axe as it is; a few sparks thrown off the front of the
  light, only where nothing of him is (never over his helm); on the fourth frame the head is still lit. FOR THE BAKE:
  `clips.moves.cleaveAppear`, 4 pictures a side (32 in all); from the fifth frame on the game plays `clips.attack` from its
  fifth picture: the Cleave's own pictures, shared. Its cut back on a second tap is the Cleave's own (the axe is in his hands
  by then).
- WHEN THE THROWN AXE COMES BACK TO HANDS THAT HOLD ONE: no catch; it is gone into the one he holds, with THE GLINT at his hands
  (`axeGlint()`: 6 pictures, a fifth of a second, one list for every side; anchored at his feet, its flash `AXE_GLINT_HIGH` 16
  game pixels above them; the game draws it over him on his own spot, a little nearer the eye, whatever he is doing). If his
  hands are empty when it comes back, the catch as drawn (standing, or on the run). With Twin Axes the same: an axe appears for
  the tap, and each one coming back is gone into it with the glint.
- `pictures/axe_tap_flying.mp4` (7.2 s, 217 pictures, 1266 by 652, 1.2 MB): he throws, taps at once, the axe appears and he Cleaves a skeleton while the thrown one is still
  out; it comes back and is gone into the one he holds; once standing, once on the run; then once slow and close.
- THE RULE IS THE MAIN CHAT'S: a tap (and its second tap) while the axe is out is the Cleave from `cleaveAppear`; the thrown axe
  coming back to full hands is gone (the glint), to empty hands caught. HE HAS NOT BEEN ASKED about the swipe (Leaping Chop) or a
  second hold while the axe is out.
- Checked (`tests/warrior_weapons.test.ts` 19): the appearing axe's frames from all eight sides, his helm seen, its light and the
  glint the friend's cyan, nothing of the enemy's; from the fifth frame the Cleave's own pictures.

# His words on step 3b's films (11 Nov 2026), and what they ask for (step 3c)

Shown `pictures/hammer_moves.mp4` (the Earthquake a full spin, then down) and `pictures/axe_tap_flying.mp4` (at fbfe2c60) and
asked “Are the new Earthquake (hammer_moves.mp4, about 15 seconds in) and the tap while the thrown axe is out
(axe_tap_flying.mp4) right?”, he answered by 09:41: “Earthquake still not right”. Asked “What's off about the Warrior's
Earthquake? Pick any that fit, or tell me in your own words.” (offered: the ground should really quake; the spin is too small
and quick; the finish still looks like the Smash), he picked only: “The ground should really quake (Recommended)” (offered as:
right now the floor only gets the game's thin dotted ring; I'd draw cracks running out, the floor slabs heaving up in a ring,
and dust). Read as: THE SWING STAYS (the full spin, then down); THE GROUND IS TO BE DRAWN, in place of the game's thin ring.
He did not fault the tap while the axe is out.

At 09:41 he wrote: “Tap should have a small knockback and high stun buildup/chance”. Read as the hammer's tap, the SMASH (he had
asked “What does the hammer tap actually do?”): what it hits is pushed back a little, and it builds stun fast or has a high
chance to stun. A RULE FOR THE MAIN CHAT, passed on with the hand-over; no new pictures asked of art for it.

## Step 3c: the Earthquake's ground, drawn (the art chat's helper, 11 Nov 2026)

His pick: “The ground should really quake (Recommended)”. THE SWING STAYS AS IT IS (the full spin, then down: not one frame or
number changed). What is new is the earthquake itself, drawn IN PLACE OF THE GAME'S THIN SLAM RING: `src/art/warrior_up_quake_ground.ts`
(behind the switch that is off; nothing of the game imports it: `tests/warrior_weapons.test.ts` 1).

**What is drawn** (at the game's own size, on the floor's own plane: a ring on the floor is an ellipse twice as wide as tall; in
the floor's stone and the game's ink, `P.st1` to `P.st7`, `P.ink`, `P.black`, as the game's own cracked floor and dust are, so it
sits on any floor; the only light a thin line of the friend's cyan on the crest's first frames; nothing pink or gold; every
pixel whole):
- THE BLOW: the stone broken under the maul's face (a small dark hollow at the mark), grit thrown up out of it, and CRACKS
  tearing out from the mark: forked and jagged, longest along the way he struck (3 pictures as they tear open, for each of his
  eight sides).
- THE HEAVE: a wave runs out through the floor to the ring's edge in 0.35 s; where it is, THE FLAGSTONES LIFT AND TILT, each its own
  height and a little crooked: a ridge of broken stones, their lifted edges lit, the dark where each stood showing under it, each
  dropping back as the wave passes on; it dies at the edge over a sixth of a second.
- THE SETTLING: dust thrown up off the ridge where the wave passed hangs, spreads, thins and goes (pixel by pixel, never half
  see-through); a few small stones hop twice and come to rest. The cracks stay.

**Frames** (30 a second; frame 0 is the blow, 0.633 s into the Earthquake): the heave 0 to 10 (0.35 s), dying by 15; the dust and
the stones to 29 (1 s in all for the heave and the settling); the cracks torn open 0 to 2, then kept by the game 2.4 s from the
blow and faded over the last four tenths of that, as its own cracked floor (`QUAKE_CRACKS_LAST`).

**For the game, each quake anchored at the mark** (the ring's middle, where the face struck, 1.46 tiles before him), as
`quakeGround(i)`: `cracks[side]` (3; UNDER everyone; the game keeps the last and fades it), `under` (30; UNDER everyone: the
heaved stones) and `over` (30; drawn at the mark's own depth among those standing: the dust, the grit, the stones). Quake 0 is
the Earthquake's (and Tremors' first): 2.0 tiles round; Tremors' second and third (`quakeGround(1)`, `(2)`): 2.6 and 3.2 tiles
round, 0.35 s and 0.7 s after the first, EACH WEAKER (a lower ridge, less dust, fewer and thinner cracks), DRAWN AT EACH SIZE,
the first's cracks still lying there.
**Counts for the bake**: each quake 30 + 30 + 3 × 8 = 84 pictures; the three, 252 (one list for every side but the cracks).

**What the game must do**: for the Earthquake (and Tremors), DRAW THESE IN PLACE OF ITS SLAM RING (its blast's 'slam' rings and
specks); the cracks under everyone, kept and faded as its own; the hurt as now (the ring's: what the wave reaches as it reaches
it, in the film).

**The film and the picture**: `pictures/hammer_moves.mp4` made again (38.0 s): its Earthquake and Tremors with the ground and
without the game's dotted ring; the slow, close Earthquake framed on the mark so the whole ring is seen, and now a slow, close
Tremors too. `pictures/quake_phone.png` (1260 by 1816): six moments of the one Earthquake (the blow; the wave a third out; two
thirds; at the edge; the dust settling; what is left), two across, and under them Tremors' three quakes side by side
(`tools/quake_phone.py`, from the film's stills).

**Checked** (`tests/warrior_weapons.test.ts` 20): the lists whole; crisp; only the floor's stone, its ink and the friend's cyan,
nothing of the enemy's; the heave reaches the ring's edge and not past it by more than a third of a tile; each of Tremors'
quakes lower, with fewer cracks and less dust, than the one before.

**His measure**: looked at in the film at the game's size among the practice room's skeletons, cultist and brute, where the
stones, cracks and dust sit at their level. NOT laid beside the Gate Ward and the Brawler this time: a quick attempt to paint
them side by side came out wrong (colours and places) and was not mended.

# His word on step 3c's quaking ground (11 Nov 2026), and what it asks for (step 3d)

Shown `pictures/quake_phone.png` and `pictures/hammer_moves.mp4` (at 8ff854a2), told that the lifted stones were plain grey and
would be better as the floor's own stone, and asked “Is the Earthquake's quaking ground right (quake_phone.png)? The lifted
stones are plain grey at the moment.” (offered: yes, in the floor's own colour; yes, as it is; something else is off), he wrote,
by 10:14: “If the floor’s own stone is too much work or too big file-wise, just add some generic fissurey spikes and cracks”.
Read as: THE FLOOR'S OWN STONE IF IT IS CHEAP IN WORK AND IN FILES; if not, generic fissures, spikes and cracks. He did not
fault the cracks, the heaving ring or the dust.

## Step 3d: the quaking ground in the floor's own stone, and more jagged (the art chat's helper, 11 Nov 2026)

His word (above): the floor's own stone if it is cheap in work and in files. It is both: no files at all.

**What changed** (`src/art/warrior_up_quake_ground.ts`; the swing, the heave's frames and the numbers as in step 3c):
- THE FLOOR'S OWN STONE: `quakeGround(i, theme)` takes the floor's `Theme` (art/ground.ts), and `quakeTones(theme)` gives every
  colour: a lifted flagstone's top in the floor's usual slab tones (the highest in its lit lip, as a stone tipped to the light),
  its lifted edge in its lit lip, its sides in its shaded lip; the gaps under the stones and the cracks in its `mortar` and the
  game's ink (the dark under a stone thrown highest in its earth's dark where the floor has earth); the dust and grit in its
  lighter slab tones, or its earth's where it has earth; the hopping stones in its lit lip. The only other colour the thin cyan
  on the crest's first frames. THE PRACTICE ROOM'S BLUE is its Theme's own: the practice room is laid with the vault's stone,
  `VAULT` (main.ts: “the practice room is no floor of the Crypt: it keeps the vault's stone”), whose slabs are that blue; the
  Crypt's floors are themes of their own (art/crypt.ts `CRYPT_FLOORS`), the lair `LAIR`, the town's and the hall's theirs.
- MORE JAGGED: about one lifted stone in four thrusts a corner up as the wave passes, like a broken tooth, with the dark of the
  floor's mortar (or earth) under it between the stones; the cracks at the mark deeper (its mortar either side of an inked core
  for the first stretch) and running out further, the longest, along the way he struck, three quarters of the way to the edge,
  past where the ridge has been. Still flagstones heaving, not a crown of spikes. Tremors as before, each weaker.

**For the game**: `quakeGround(i, theme)` FOR THE FLOOR HE IS ON, in place of its slam ring (quake 0 the Earthquake's and
Tremors' first; 1 and 2 Tremors' second and third); `cracks[side]` and `under` under everyone, `over` at the mark's depth; the
cracks kept and faded as its own (`QUAKE_CRACKS_LAST`: 2.4 s from the blow, faded over the last four tenths). PAINTED, NOT BAKED:
per floor's theme, 84 pictures a quake, 252 for the three, painted in code as the floor itself is: with the floor's ground art
(as `makeGroundArt(theme)` is made when a floor is entered), or the first time an Earthquake is used on that floor. MEASURED
here: one quake's 84 pictures for a floor painted in 65 to 97 thousandths of a second (`tools/quake_floors_phone.ts` prints
it), so the three in about a quarter of a second.

**The film and the pictures**:
- `pictures/hammer_moves.mp4` made again with it (38.0 s, 1,139 pictures, 6.3 MB; the practice room's own blue stone); the slow, close Earthquake and Tremors
  keep the whole ring in the frame.
- `pictures/quake_phone.png` (1260 by 1518): the six moments of the one Earthquake, two across, each cut centred on the mark so the ring is
  whole (no Tremors on it); `pictures/tremors_phone.png` (1260 by 1818): Tremors' three quakes, one above another, big (both
  `tools/quake_phone.py`, from the film's stills).
- `pictures/quake_floors_phone.png` (1260 by 1878): the same heave at the ring's edge on three floors, painted straight from each floor's
  `makeGroundArt(theme)` and the quake's lists for it, the Warrior over it (`tools/quake_floors_phone.ts` and `.py`): the
  practice room (`VAULT`), the Crypt's third floor (`CRYPT_FLOORS[2]`, with its earth), and FLOOR 11, THE GATE WARD: it has no
  Theme of its own (its ground is its own setts, art/gateward.ts), so this is the game's flagstone floor laid in the Gate Ward's
  own flag stone (`GW_FLAG`) and its deep (`GW_DEEP`), not its own setts; and the Gate Ward's own pieces are not stood beside it.

**Checked** (`tests/warrior_weapons.test.ts` 20, on the vault's stone and on the Crypt's third floor): the lists whole; crisp;
only the floor's theme's colours (its mortar, slab tones and earth), the game's ink and the friend's cyan, nothing of the
enemy's; the heave reaches the ring's edge and not past it by more than a third of a tile; each of Tremors' quakes lower, with
fewer cracks and less dust, than the one before.
