# THE SWAMP COLOSSUS'S PHASE 2 GAZE AIMED AT THE HERO: READY FOR THE MAIN CHAT (branch `build/colossus-gaze2`)

The queue's `aim-colossus-phase-2-gaze`, pulled 12 Nov 2026 (09:17, Eastern) by the Colossus gaze chat, a chat of his working from
the queue. Found by the main chat (9 Nov, the handoff's 13:15 paragraph: "phase 2's gaze aimed where the hero is ... worth doing only
by baking his tongue apart as phase 3 is"); he had not asked for it.

## His word

Shown it as a film (the gaze as it is, then aimed, the same spot on the stone, at the game's pace and at half speed) and a close
picture of his eye, then asked as a pop-up, 12 Nov 2026, by 10:42: **“Yes, hand it to main (Recommended)”** (offered as: turned on,
and the main chat puts it in the next update; told it adds about 9 MB of his pictures and holds about the memory it does now).
`GAZE2_AIMED` IS ON ON THE BRANCH.

## What was wrong

In phase 2 his gaze's beam was laid toward the hero, but his pictures were the art's film take (`gaze`): his eye sweeping the
film's arc, toward where the film's Warrior stood, wherever the hero was. From the side his eye looked one way and the beam went
another; the beam left a fixed point over the water under his eye, not his eye.

## What the branch does (cut from `main` at 10161fc, 25.3.10's records)

- `game/colossus_fight.ts`: `GAZE2_AIMED` (on). The phase 2 gaze is laid along the nearest of `BODY2.aims` (-60 to 60, every 20
  degrees; every spot on the stone is within 10 of one, deep inside the 32-degree arc), as phase 3's is along `EYE3.aims`; its sides
  held within `BODY2.lim` (85), as the art's `gazeArcAt` holds them (past about 64 the beam is off the stone: no change in play);
  `BodyMove.pic` the aim's index. `gaze2AimNear`. Off, exactly as before.
- `render/colossus_baked.ts`: `P2_BAKE`; `colossusHas`; the `p2` family (the last two aims kept a while in phase 2).
- `render/act1_fx/colossus.ts`: `colossusGaze2`; in his gaze, his body (`p2body` at his stand's frame run on from frame 24, where the
  gaze begins) and over it his tongue and eye of the aim (`gaze2.<j>`); until both are here, as before. Wants: `p2body` and the aim
  under way, or the one where the hero is now, when the gaze is next; the old `gaze` no longer wanted while on.
  `eyeAt2`: the beam leaves his eye where his picture has it (`render/act1_fx/colossus_fx.ts`, as phase 3's does).
- `tools/bake_colossus.ts`: moves `p2body` (his stand's jaws and drool, 90 frames) and `gaze2.0` to `gaze2.6` (his tongue and eye
  alone, the art's own `bodyFrame(..., aim)`, its strike's after-image, cut where his jaws and drool are before it; his eye's place in
  each frame in the manifest, `eyes`). `phase2` names them all.
- `main.ts`: `dbg.gaze2`, the switch, for pictures.
- Tests: `tests/colossus_gaze2.test.ts` (the rules, on and off; the aims cover the stone; the art's aimed gaze turns about the same
  water and sweeps the same arc at the same time as the game's beam, frame by frame; what is drawn) and
  `tests/colossus_gaze2_pack.test.ts` (the pack: a file of its own).
- The film: `tools/scenarios/colossus_gaze2_film.mjs` and `tools/gaze2_film.py`.

## THE BAKE: A NEW COLOSSUS MARK, `f133999cbf23` (122 files), in `assets/colossus/` on the branch

Painted here (894 layers, 56 minutes on two cores) and packed with `merge` beside his others, none of which changed: all 137 old
moves, 99 old groups and the roots the same byte for byte in `colossus.json`; no old sheet touched. New, 9 files, 9.1 MB:
`colossus-p2body-0.png`, `-1.png` (90 pictures; 19.7 MB decoded, where the old `gaze` is 22.8) and `colossus-gaze2_0-0.png` to
`colossus-gaze2_6-0.png` (102 pictures each, 0.57 to 0.63 MB; about 3 MB decoded each). In his gaze a phone now holds `p2body` and
one or two aims (about 23 to 26 MB) where it held `gaze` (22.8). The old `gaze` sheets (`colossus-gaze-0.png`, `-1.png`, 6.3 MB) are
kept for the switch off; nothing fetches them while it is on.

`tools/build.mjs` ships it as it ships the pack: `dist/colossus/f133999cbf23/`. THE CLAUDE.AI PAGE: the folder
`colossus/7cf0996e564d` (113 files) goes and `colossus/f133999cbf23` (122) comes: 203 files there become 212, under 511. A page
built from this branch asks for the new folder only.

## For the main chat

1. Merge `build/colossus-gaze2` into `main` (a fast-forward from 10161fc if `main` has not moved; it touches `src/main.ts` in two
   lines only: the import of `colossus_fight` and `dbg.gaze2` after `dbg.colossus`).
2. Its checks are done (below); with the version's own checks (only what changed and the core), the published page's playtests: add
   `tools/scenarios/colossus_gaze.mjs` and `colossus_baked.mjs` to the version's wrap script.
3. The new Colossus folder goes with the page (gh-pages and the claude.ai page).

## Checked here

- tsc clean. `node tools/unit.mjs --only colossus_gaze2,colossus_gaze2_pack,colossus_fight` and the core: on 56cc0df4ff (switch off),
  26 files, all passed; on the switch's commit: the foot of this file.
- Pages built with `tools/build_to.mjs` and served: the film (`colossus_gaze2_film.mjs`) with the switch off on the old mark and on
  with the new, both clean (the gaze along aim -40 from (2.5, 2.5), its pictures fetched and drawn, the beam from his eye);
  `colossus_baked.mjs` on the new mark, clean.
- Looked at: his eye turned toward the hero's side through the wind-up and following the beam across; no seam seen where his tongue
  is laid over his body (phase 3 is laid the same way).
