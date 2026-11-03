# The Brawler reworked: twenty rough looks (the art chat, 2 Nov 2026)

Branch `art/brawler-looks`, from `origin/high-city` (f6688d9). Pictures only: dev files, nothing of the game touched.

## His words

- 2 Nov 2026, 19:59: “Or we might have to do a rework of the brawler.  He’s not really what I’m looking for”
- Asked what isn't right: “I think it can go two ways.  More of an old timey boxer.  Longer wind ups for hits so you have
  time for inputting combos.  Or an actual fighter, tap for punch, hold for kick, and swipe for jump to insert the swipe
  into the combo for jump kicks or flying uppercuts”
- Asked how to decide: “Give me some possible looks, 10 for each”
- By 21:06: “Just some rough ideas, don’t need some fully animated sprites or whatever”

So: rough concept figures, standing, one view each (the game's three-quarter view from in front), three times the game's
size, each beside the knight for size. Sculpted as the classes are (one body of flesh, not circles and squares), fists
big (his “His hands are tiny compared to his body”), original designs. No polish, no game-size versions, no moves.

## The pictures (`pictures/`)

- `boxers_sheet.png`: the ten old-timey boxers, numbered 1 to 10, each with its line; the Brawler as he is today at the
  top for comparison.
- `fighters_sheet.png`: the ten real fighters, numbered 1 to 10, each with its line.

## The ten old-timey boxers (in the old ring's upright stance, fists up)

1. The Champion: waxed handlebar moustache, black hair parted down the middle, the broad brass champion's belt over
   high-waisted black tights, laced boots; bare knuckles.
2. The Iron Squire: grey mutton chops, a bald pate fringed in grey, a striped sleeveless vest, plain grey tights, a sash.
3. The Bruiser: flat-top crop, a broken nose, cauliflower ears, stubble; grey long johns rolled down and tied at the waist,
   braces let down; bare knuckles.
4. The Tattooed Tar: shaven head, drooping moustache, sailor's tattoos up his arms and chest; cream tights, red sash.
5. The Young Contender: lean and long, clean-shaven, black curls; high-waisted maroon trunks, old ox-blood leather gloves,
   tall laced boots.
6. The Old Lion: a heavyweight gone grey, a walrus moustache and full grey whiskers, a big belly; red flannel long johns
   buttoned down the front, a belt; fists wrapped.
7. The Georgian Gentleman: the oldest ring; tied-back hair, a pencil moustache, cream knee breeches, white stockings,
   buckled shoes, a green sash.
8. The Dock Fighter: a short dark beard, braces over his bare chest, rolled work trousers, hobnailed boots, leather straps
   over his knuckles, his flat cap set down on the floor.
9. The Bearded Giant: bald and huge, a black forked beard, black tights, a green sash, wrapped fists. NEAREST TO TODAY'S
   Brawler (the bald head and the big beard).
10. The Copper Kid: short and wiry, a shock of red hair, freckles, a curled red moustache, green striped tights to the knee
    and wool socks, wrapped fists.

## The ten real fighters (light on their feet, legs and feet free to kick; three with a knee up ready to kick)

1. The Wandering Monk: shaven, a short grey beard; an ochre sleeveless wrap, wooden beads, loose grey trousers bound at the
   shins, bare feet; knee up.
2. The Pit Kicker: a crest of black hair, a goatee, cords round his arms, short green trunks, shins and feet bound.
3. The Savate Man: old French boxing that kicks; a curled moustache, slicked hair, a navy sleeveless top and long tights,
   laced pointed shoes, up on his toes.
4. The Wrestler: low and wide; shaved head, cauliflower ears, broken nose; a maroon singlet, leather knee pads, laced boots.
5. The Temple Fighter: a topknot, a teal tunic crossed at the chest, a cream sash, loose trousers wrapped from the shin.
6. The Sailor: a knitted cap, a striped sleeveless shirt, a red neckerchief, wide trousers rolled up, bare feet, tattoos.
7. The Veteran: grey and scarred, a patch over one eye, a short grey beard; trousers cut off at the knee, one shin bound and
   the other bare and scarred, leather straps on his fists; knee up.
8. The Tumbler: a fairground acrobat, lean and springy; a sandy ponytail, a short leather vest, two-tone tights, soft shoes.
9. The Caravan Guard: a cloth wound round his head, a black beard, a strap across his bare chest, loose ochre trousers,
   sandals and shin wraps.
10. The Hill Runner: long red hair tied back, a red beard, bare-chested, a green checked kilt, wool socks and brogues;
    knee up.

## How the pictures are made

- `src/dev/sculpt_brawler_looks.ts`: the twenty (`OLD_BOXERS`, `REAL_FIGHTERS`), each a build, a head (hair, whiskers,
  ears, nose, marks), fists (bare, wrapped, strapped, taped or gloved), a stance and clothes, sculpted on the heroes'
  bones with the classes' sculptor (`src/dev/sculpt.ts`, `src/dev/sculpt_classes.ts` manBody, manHead, tailorFor).
- `src/dev/preview_brawler_looks.ts`: the sheet. Made with
  `node tools/preview.mjs src/dev/preview_brawler_looks.ts docs/mockups/brawler_looks/pictures/boxers_sheet.png 1200 100 boxers`
  (and `fighters` for the other).
- `tests/brawler_looks.test.ts`: nothing of the game imports them; ten of each numbered 1 to 10; each painted about the
  knight's height. Rough, at his word: the full character checks (every pixel, eight turns) are for the one he picks.
