# The Veteran's three ability icons (a first pass, to show him)

Branch `art/veteran-icons`, from `work-f4`. Pictures first: nothing here changes what anyone sees in the game until the main
chat points the Veteran's three skills at these icons, on his yes.

## What was asked, in the words given

- The main chat on the board, 3 Nov 2026, 11:32: “PLEASE DRAW: THE VETERAN'S THREE ABILITY ICONS for the HUD's TAP, HOLD and
  SWIPE (Punch, Kick, Jump: art/ability_icons.ts; today they borrow the old Brawler's jab, cross and slip, which he does not
  want reused). His globes, cyan, hot orange and white, would read at once; your call.”
- His punch's colour since, 3 Nov 2026, 10:44: “...the brawler is Str/dex, so I think we change the color of the globe for a
  punch to green and the kicks stay orange/red.”
- His word on the old Brawler: “I don’t want anything reused from the original brawler, we need a totally new look.”

So the punch is the Veteran's emerald green, the kick his hot orange-red, the jump his white: his globes' own colours
(`GLOBE_GREEN`, `GLOBE_ORANGE`, `GLOBE_WHITE`, dev/veteran_globes.ts on `art/brawler-looks`). Never pink, never gold.

## The picture

`pictures/veteran_icons.png` (1200 wide): the three large; then the game's own buttons on a phone held sideways, with his three
on them (a real screenshot of the game, 844 by 390 points at three pixels to a point); then his three beside the other heroes'
three (Warrior, Ranger, Mage, Warlock, Tinkerer) at the game's size.

The screenshot is the practice room with the Brawler, whose three buttons were made to show the Veteran's icons and names for
the picture only (`tools/veteran_icons_page.ts`), since the Veteran's own code is not on `work-f4` as pushed.

## The three

Each is 32 by 32 picture pixels, two to a game pixel, in the 16 game pixels a button gives, painted in code in the heroes'
manner: flat tones, three to a material, the light from the upper left, a dark seam between one part and the next. In his own
colours (the art chat's sculpt of him: his weathered skin, his linen wraps grey with use, his leather straps, his grey-blue
trousers) and his globes'.

| Button | Icon | What it is |
|---|---|---|
| TAP | Punch | His big wrapped fist driven straight out at you, knuckles first, the linen over the knuckles and the wrist, the thumb across the fingers; a star of his green bursting behind it, white at its heart. |
| HOLD | Kick | His wrapped shin and foot whipping round from the knee, toes pointed, a strap under the knee; the hot orange crescent of its path over it, thin at its tail, thick and white-hot at its head; a spark where it lands. |
| SWIPE | Jump | His two wrapped feet springing up, toes pointed, out of a white burst of dust (a cloud along the floor, spikes flung up and out), the air streaking past them. |

Nothing is taken from the old Brawler's icons (`art/brawler_icons.ts`): not imported, none of its colours, its punch a fist
seen from the side; this one comes at you.

## In the code

- `src/art/veteran_icons.ts`: `vetPunchIcon`, `vetKickIcon`, `vetJumpIcon` (and `VETERAN_ICONS`), and his colours.
- Hooked up as the Warlock's and the Tinkerer's are: three ability ids of their own, `'vetpunch' | 'vetkick' | 'vetjump'`, in
  `AbilityId` (src/game/types.ts), and painted by `makeAbilityIcons` (src/art/ability_icons.ts `PAINTERS`). Nothing uses them
  yet, so nothing in the game changes.
- **What the main chat changes to show them:** in the Veteran's three skill definitions (his Punch, Kick and Jump, in
  game/defs.ts `SKILLS`, behind VETERAN on its own branch), set `icon: 'vetpunch'`, `icon: 'vetkick'` and `icon: 'vetjump'` in
  place of `'jab'`, `'cross'` and `'slip'`. If its branch has touched the `AbilityId` union or `PAINTERS` too, keep both sides'
  lines when merging. Nothing else.

## Checks

`tests/veteran_icons.test.ts`: each is 32 by 32; crisp (every pixel wholly there or not); never pink, never gold; nothing of
the old Brawler's (no import, none of its colours in the file or the pictures); each in its globe's colour (the punch green,
the kick orange, the jump white, and none of one another's), his green an emerald well off the friend's cyan and the poison's
yellow-green; each a real shape filling its button; hooked up (the three ids and the painters). `tsc --noEmit` clean.

## How the picture is made

```
node tools/veteran_icons_page.mjs dist/vet_icons_picture.html
node tools/playtest.mjs --file dist/vet_icons_picture.html --size 844x390 --dpr 3 --touch --scenario tools/scenarios/veteran_icons_hud.mjs --out shots/vet/land
node tools/preview.mjs src/dev/preview_veteran_icons.ts shots/vet/page.png 1200 400
python3 tools/veteran_icons_picture.py shots/vet/page.png shots/vet/land_hud.png docs/mockups/veteran_icons/pictures/veteran_icons.png
```
