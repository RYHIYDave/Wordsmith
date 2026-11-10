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

## The picture: `pictures/weapons_looks.png` (1200 by 6820)

The three axe takes, then the three hammer takes, each a row: the weapon alone, three times the game's size (upright, its flat
to the eye, and turned); held by him in his guard (the dungeon) from toward you, side-on and away, twice the game's size; the
moment its tap is wound up and held (the Cleave, the Smash); on his back in town from the same three sides; as it drops, in the
bag at Normal, Magic, Rare and Unique (each in a slot as the game draws one, twice the size a phone shows it) and lying on a
dungeon's floor as the game lays loot, its name over it in its rarity's colour (twice the game's size; the name is the sheet's
lettering, not the game's); and at the game's own size: his guard from all eight sides, in town from three, the wind-up from two,
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
  ONE CHANGE FROM THE GREAT SWORD'S GUARD, SO IT READS FROM ALL EIGHT SIDES: the haft rises a little (18 degrees) as it trails
  back, its head at the height of his chest behind him (on the screen, about his shoulders), its flat turned up, his hands at
  the top of his hip (30 up, the sword's 25). Held low as the great sword is, a head trailing behind him is wholly hidden from down and to the left (as his
  great sword is today); raised so, it is seen from every side, over his shoulder from there.
- IN TOWN (`TOWN_HEAVY`, the game's town stance, his arms folded): on his back as the great sword is, but the head up behind his
  right shoulder and the haft down across his back to his left hip, flat against it, its edge out to his right; the strap across
  his chest as the great sword's.
- THE CLEAVE, TOP OF ITS WIND-UP (`CLEAVE_TOP`, held): the axe cocked back over his right shoulder, its head out behind his helm,
  its edge up; both hands by his right ear; wound round away from the mark, weight back and sunk on his back leg, back arched,
  his eyes on the mark.
- THE SMASH, TOP OF ITS WIND-UP (`SMASH_TOP`, held): the hammer raised up over his head and back, its head high behind him; both
  hands over his brow; up on his toes, back arched, his eyes on the spot it will land.
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
   picture pixels of its head are seen; at each wind-up, from the two sides the sheet shows, 150. The least of each, from the
   test: axe A guard 143, town 125; axe B 179, 154; axe C 160, 146; hammer A 200, 165; hammer B 139, 128; hammer C 259, 217.
4. Every frame crisp (every pixel whole but his edge of light), his cyan edge round him, nothing of the enemy's pink or gold; what
   of the take is seen is its own iron, wood and leather, and its glow the friend's cyan.
5. As items: each take at its four rarities in style A, 32 by 32, crisp, inside its frame with a clear pixel round it, the rim of
   its rarity's colour; each rarer one finer (Magic blue, Rare gold, Unique orange stones); no enemy's colour, no cyan.

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
- PAINTING COST: a frame of him armed is 88 thousandths of a second here (him alone 34): `paintArmed` paints him once with the
  great sword and again with the take. A hook in `paintWarriorUp` for what he holds (the next step's) halves it.
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
six times, wound up at four times, and its loot pictures. FROM NOW ON every picture for him is made this way: no wider than
about 1260, no taller than about 2200, a few big things in each, several pictures before one tall sheet.
