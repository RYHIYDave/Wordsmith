# THE HEROES' BAKE, mark 50c0ea6dc501 (the hero cards from the bake)

The files of `.bake/50c0ea6dc501/` as `node tools/bake_heroes.mjs` made them on 12 Nov 2026 on the branch
`fix/hero-cards-from-bake` (db26d64c: main 9f3cf44 with fix/frames-from-sheets de6fea61 and the hero cards fix): 37 files of
pictures and their lists, 17.11 MB, and `done.json` (what the bake said of each group). Every sheet was read back and checked
against every frame on it as painted.

AGAINST MAIN'S BAKE (0ed837378e63): every hero's own sheets the same byte for byte (warrior, ranger, mage, warlock, tinkerer,
brawler: 30 sheets), and their frames, parts and places the same; their lists one more (a hero's making ready, a card's only,
art/heroes3.ts READY_LIST: empty in every place). ONLY THE CARDS' GROUP IS NEW: 1,261 frames for 1,278 places on 2 sheets
(4,793,320 pixels) where 471 on one: everything a class card shows.

TO USE THEM in place of baking again (about 38 minutes on two cores): put every file here but this one into
`.bake/50c0ea6dc501/` of the work copy. `tools/build.mjs` then takes them as baked, IF THE MARK IS STILL 50c0ea6dc501: it is the
hash of the bake page's bundle, so anything else merged first that the bake page is made of makes a new mark, and then the
heroes are baked again.

    mkdir -p .bake/50c0ea6dc501 && git archive origin/bake/50c0ea6dc501 | tar -x -C .bake/50c0ea6dc501 && rm .bake/50c0ea6dc501/README.md
