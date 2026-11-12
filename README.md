# THE HEROES' BAKE, mark d7fec6fa0251 (the Brawler from all eight sides, HIS MOVES KEPT PACKED)

The files of `.bake/d7fec6fa0251/` as `node tools/bake_heroes.mjs` made them on 12 Nov 2026 on the branch
`build/brawler-packed` (main at 9f3cf44, 25.3.7, with bring-in/eight-sides merged in and the Brawler's moves kept packed:
render/baked.ts PACKS; EIGHT_MORE on for both on that branch): 129 files of pictures and their lists, 20.78 MB, and `done.json`
(what the bake said of each group). Every sheet, the Brawler's 96 packs' among them, was read back and checked against every
frame on it as painted.

THE BRAWLER'S FILES: `brawler.json`, `brawler-0.png` (what he always holds: his stance, his run, struck, the first frame of
every move) and 96 packs, `brawler-<move>-<side>.png` (his eleven moves and his fall from each of eight sides). Every other
hero's files are laid out as they always were.

TO USE THEM in place of baking again (38 to 45 minutes): put every file here but this one into `.bake/d7fec6fa0251/` of the
work copy. `tools/build.mjs` then takes them as baked, IF THE MARK IS STILL d7fec6fa0251: it is the hash of the bake page's
bundle, so anything else merged first that the bake page is made of makes a new mark, and then the heroes are baked again.
(The packs' budget is NOT in the bake's page: `PACKS.budget` is tuned without a new bake.)

    mkdir -p .bake/d7fec6fa0251 && git archive origin/bake/d7fec6fa0251 | tar -x -C .bake/d7fec6fa0251 && rm .bake/d7fec6fa0251/README.md

What is in it, and how it was weighed and played: `docs/mockups/eight_sides/PACKED.md` on `build/brawler-packed`.
