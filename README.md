# THE HEROES' BAKE, mark 5482604e8eb0 (the hero cards from the bake, on 25.3.9)

The heroes' bake of `bring-in/hero-cards` (f203e3d4: main 0da5127e, 25.3.9, with the hero cards from the bake): 37 files of
pictures and their lists, 17.11 MB, and `done.json`. HOW IT WAS MADE (its `done.json` says so too): baked whole by
`node tools/bake_heroes.mjs` on that branch at 5d868209 (mark 79ea28e6e46e, 12 Nov 2026, 13:19 to 13:56 UTC; every sheet read
back and checked against every frame on it as painted); the code then changed (ceab67ef, so that the monsters' bake keeps
main's mark), painting nothing differently: these are those files with the mark in each changed, after checking that every key
of every group asks for the same lists' lengths and the same places in the same order, and the cards' group baked again with
that code, the same byte for byte.

AGAINST MAIN'S BAKE (1fdc8d09059a, on gh-pages): every hero's own sheets the same byte for byte (30 sheets), and their frames,
parts and places; their lists one more (a hero's making ready, art/heroes3.ts bakeLists, empty in every place but a card's).
ONLY THE CARDS' GROUP IS NEW: 1,261 frames for 1,278 places on 2 sheets (4,793,320 pixels), where 471 on one.

TO USE THEM in place of baking again (about 38 minutes on two cores): put every file here but this one into
`.bake/5482604e8eb0/` of the work copy. `tools/build.mjs` then takes them as baked, IF THE MARK IS STILL 5482604e8eb0 (the
hash of the bake page's bundle, made from the work copy's own folder): anything else merged first that the bake page is made
of makes a new mark, and then the heroes are baked again.

    mkdir -p .bake/5482604e8eb0 && git archive origin/bake/5482604e8eb0 | tar -x -C .bake/5482604e8eb0 && rm .bake/5482604e8eb0/README.md
