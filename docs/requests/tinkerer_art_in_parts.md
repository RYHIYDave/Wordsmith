# The Tinkerer's art set up without a 2-second wait (12 Nov 2026)

The Pips chat, a chat of his working from the queue (item `make-tinkerers-art-set-up-in-parts`; his words, 12 Nov, 12:55
Eastern: “Work on the next queue item”). Branch `build/tinkerer-art-in-parts`, cut from `build/smooth-loading-frames` 713b3058
(the item waits on that branch: it is built on it). Main is untouched; nothing is published. He has not been asked anything:
NOTHING HE SEES CHANGES.

## What the wait was

Into town as the Tinkerer, one wait of over two seconds under the loading screen (Chrome on a two-core cloud machine, a phone's
screen, `tools/scenarios/loading_frames.mjs CLS=tinkerer`): as her baked group came in, `render/baked.ts` asked for her art
(`art.of`) and her art was made whole: `makeTinkererArt` > `herSet` > `holdMove` > `tinkerHold`, and in it
`steadied` (`dev/brawler_punches.ts`): her elbows steadied, six ways tried, each elbow nudged key by key, some 142,000 poses
solved. 2.7 s in node; 2.1 s in the browser. Her art needs only how long that move is; her pictures taken from the bake never
need its poses at all.

## The mend

- `src/dev/keys_later.ts` (new): a move's keys worked out WHEN FIRST READ (`motion.keys`, a getter: a picture of the move
  painted), or AHEAD, a few slices a step (`keysAhead`, `KEYS_SLICES.per` = 4; a slice is one key's pose, or one key's elbow
  steadied: some 1 to 3 ms here).
- `src/dev/brawler_punches.ts`: `steadiedInSlices`, the same work as `steadied`, stopping between keys; `steadied` runs it
  through. The same calls in the same order: the very numbers.
- `src/dev/tinkerer_hold.ts` `tinkerHold` and `src/dev/tinkerer_fall.ts` `tinkerFall` (her fall's keys, a tenth of a second,
  the same way): their keys worked out later.
- `src/art/tinkerer_art.ts` `tinkererAhead`: her hold's and her fall's keys ahead, as steps.
- `src/main.ts` `heroAhead`, at the end of `loadSteps`: those steps, WHERE HER PICTURES IN THIS PLACE ARE PAINTED AND NOT TAKEN
  FROM THE BAKE (from the bake they are never needed); so that, painted, they are never worked out in a fight (the old comment's
  care: “seconds' wait the first time she whistles would be felt in a fight”). With `LOAD_SLICE` off, all at once where `prepare`
  is, as before.
- One case not covered: her bake failing as it comes in (then her pictures are painted, and the hold's keys are worked out as its
  first picture is painted: 2.7 s then). It was 2.7 s at her art's set-up before.

## Measured (the same machine and way; `loading_frames.mjs CLS=tinkerer`, served, `--touch --size 844x390 --dpr 3`)

| into town as the Tinkerer | the longest wait the browser showed | her art set up for a place, the longest (`stats.artMax`) |
|---|---|---|
| before, her pictures from the bake (the live 1fdc8d09059a) | 2,217 ms | 2,144 ms |
| after, from the bake (the same pictures, the bake's mark changed in its files) | 217 to 300 ms | 166 to 240 ms |
| before, no bake (her pictures painted) | 3,250 ms | (no bake) |
| after, no bake | 317 to 433 ms (the world's first drawing) | (no bake) |

What is left over 150 ms into town is the loading screen's own (the castle hall's pieces, as for every hero: see
`docs/requests/loading_slices.md`). With no bake the loading screen is up longer (about 100 frames where 46): the same work,
in slices.

## THE BAKES' MARKS CHANGE (no picture does)

The heroes' and the monsters' bakes are marked by their code, and this touches the Tinkerer's art code, which both carry:
heroes `1fdc8d09059a` to `d274bb75a6ce`; monsters `1b2f6c2fbd50` (as on `build/smooth-loading-frames`) to `e63f16254b43`. NOT A PICTURE CHANGES: her keys and the Brawler's steadied moves are the very
numbers they were (`tests/tinkerer_hold_ahead.test.ts`: their hashes taken on the code before). So the next bake is needed for
the mark only, or the files relabelled (as the hero-cards chat did): the measuring here used the live heroes' bake with its mark
changed in each file.

FOR THE MAIN CHAT TO KNOW, NOT OF THIS BRANCH: `build/smooth-loading-frames` itself already gives the monsters a new mark:
main 25.3.10 `4f510caa1c9d`, that branch `1b2f6c2fbd50` (its note says nothing to bake).

## Checked

- tsc clean.
- `tests/tinkerer_hold_ahead.test.ts` (new, 5): her art set up does not work out her hold or her fall, a picture of each
  painted does; her hold's keys the very numbers, read at once and made a slice a step (some 380 steps); her fall's the same;
  the Brawler's steadied moves (struck, struck from behind) the same.
- Unit: see the commit's run (`.unit/<commit>/summary.txt`): `--only tinkerer_hold_ahead,tinkerer_moves,tinkerer,load_slice` and
  the core.
- Playtests above, each finished clean; the town looked at.

NOT CHECKED: his phone; a release build with every bake beside it; the published page's playtests.

## For the main chat

Merge it after `build/smooth-loading-frames` (it is cut from it); bake (or relabel) with the next version; the published
page's playtests, `loading_frames.mjs CLS=tinkerer` among them.
