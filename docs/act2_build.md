# Act 2, part one, the Hush (floors 11 to 15) as one version: the build's working notes

Written by the planning chat as it builds (from 19 Oct 2026, 11:01 Pacific, his words: "Get levels 11-15 into the game"),
as the main chat built floors 6 to 10 (docs/act1_build.md, read it: the same way of working). Nothing here is live until he
has seen it from the game and said yes; then the main chat takes the branch, runs the release's tests and puts it live.

## His words while it is being built

- 19 Oct 2026, 11:01 Pacific: "Get levels 11-15 into the game".
- Told him (plain message, 19 Oct about 11:05), as the planning chat's picks for his doc's open questions, his to change:
  15 seconds a bell; a bell rung by hitting it with any attack (a ranger can ring one from afar); the loot explosion gear,
  gold, runedust and a chance at a word (floors 11 to 15's runedust, as the strongholds' was on 6 to 10); one bell event a
  floor; the event's Hush only brings enemies (no darkening); the Hush status the bosses' own, about 4 seconds, every word
  dark; the Physician's Draw takes one of your words until you hit it back out of him; each floor's mobs the art chat made
  for it, floor 11's Hushed townsfolk on later floors too; the town still the hub, the city unnamed; the Knell later (not
  drawn yet). And that the art chat's pieces that went ahead on his word of 18 Oct, 21:24 Pacific ("Hey go without my say
  so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15") are read as his yes to go
  in, anything he flags mended.

His standing words for the act's enemies (to the art chat, 18 Oct): 15:47 Pacific, "I’d like no not reuse any enemies from
the previous act"; 15:47, "So some of the new enemies can be used throughout the next 10 levels."; 15:48, "But let’s keep
the acts separate". So NOTHING OF FLOORS 1 TO 10 FIGHTS ON 11 TO 15.

## Where the work is

- Branch `act2/build` (from `next` at 7aaaf53, the art chat's `mockup/act2-library` at e2cad3a merged in: floors 11 to 15's
  art whole, docs/mockups/act2_*/README.md), then THE FRAME (68286d1): everything below that every part is built in.
- Each part is built by a helper of the planning chat on a branch of its own from `act2/build`, merged back here.

## The frame (what every part is built in)

- `game/act1.ts`: `ACT2` (OFF; tests and pictures switch it on: `__dbg.act2(true, depth)` takes the hero to a floor at
  once). Floors 11 to 15 are LandKinds of their own ('gateward', 'undercity', 'millrace', 'housequiet', 'library') in
  ACT1_FLOORS (his doc's places, the bosses' floors, their light). `act1Floor(depth)` answers for 11 to 15 too (where the
  game asks "a floor laid as open ground?": they are painted by the descent's painter, art/terrain.ts, each with its own
  look); `act2Floor(depth)` is the Hush alone; `descentFloor(depth)` the descent alone; `lastFloor()`.
- `game/act2_types.ts`: what only the Hush's floors have, on Land (game/act1_layout.ts): `zones` (a tile each: the floor's
  GW_ZONE, UC_ZONE, HQ_ZONE or LB_ZONE), `water` (the Undercity), `squares` and `houses` (the Gate Ward), `race`, `tracks`,
  `yards` (the Millrace; its river is Land.river), and `bells` (THE BELLS' plan, below). Plain arrays only: the Land goes to
  the painter's worker as it is.
- `game/act2/<ground>.ts`, one a floor: its map-maker (`BUILT`, `generate(depth, seed): Laid | null`) and its dresser
  (`dress(L, depth, seed): Act1Dress | null`). Not built, the descent's stand in (its open areas laid as the Quarry's, no
  stronghold, no camp of the cult; the generic dresser with ACT1_SETS[11 to 15]).
- `render/outdoor.ts`: `landTerrain(land, floor)` and `landLook` give each floor the art chat's look from its Land.
  `render/act1_pieces.ts`: `act1Pieces(n)` for 11 to 15 is the floor's own 25 and the Hush's 25 (art/act2_set.ts).
- `game/act2_mobs.ts`: who fights where (each floor's own; the townsfolk everywhere; scribes in the sewers and the library);
  a lair's guardian the floor's medium kind; a kind not built stood in for (the Hushed, once built).
- The 17 new MonsterKinds (game/types.ts ACT2_MOBS, ACT2_BOSSES): their stats (game/defs.ts MONSTERS, the planning chat's
  first picks beside their Act 1 likenesses), and EMPTY FILES FOR EACH, registered already: `game/act1_rules/<kind>.ts`
  (RULES), `art/act1_figs/<kind>.ts` (FIG), `render/act1_fx/<kind>.ts` (FX). A kind is built by filling its three files:
  nothing else need be registered. Kinds: hushed, watch, scribe, hound (floor 11, and the city's); rat, dredger (12);
  fieldhand, carter (13); patient, orderly (14); inkling, bookwarden (15); the bosses crier, ratking, palimpsest, physician,
  censor (`bossKind`: the Warden stands in until one is built). Their sizes for the game (art/bestiary.ts) are from the art
  chat's notes until FIG.size says.
- THE HUSH STATUS on the hero: `Game.hush(secs = HUSH_FOR)` (4 s): his words dark (every attack resolved as with no word in
  it, the words left where they are), back as it runs out; lifted on leaving a level; event `{ t: 'hushed', on }`.
- The way on: floor 10's takes him home (the siege broken) and the town's waypoint on to floor 11; 11 to 14 on to the next;
  15 home ("The stolen words fly home. High above, the gates of the High City swing shut.").
- tests/act2.test.ts; tools/scenarios/act2_look.mjs (each floor where the hero comes in).

## THE BELLS, the contract between the floors and the event (game/bells.ts, the planning chat's)

Each floor's map-maker sets `land.bells`:
- `muffled`: the Muffled Bell, a tile's middle (world), on whole floor reached from the start, OFF THE MAIN WAY (in a side
  area or a room off it), at least 12 tiles from the start and not in the boss's ground.
- `bells`: 4 to 7 of them (by depth: 11 four or five, 12 and 13 five or six, 14 six, 15 six or seven), each a tile's middle on
  whole floor reached from the start, SPREAD ABOUT THE MAP (no two within 8 tiles), none in the boss's ground, none within 10
  tiles of the start.
- `hush`: { x, y, r }: a circle round the Muffled Bell (x, y its middle, roughly) holding every bell with at least 4 tiles to
  spare, not reaching the start (12 tiles clear) nor the boss's ground.
Its dresser lays a PIECE PROP (kind 'piece', solid, state 0, variant 0) at each: the Muffled Bell's own name on the bell's
tile, the small bells' names on theirs, and keeps the 8 tiles round each walkable and clear of anything solid. The names:
- 11: "the market bell (the Muffled Bell)"; the bells "a wayside shrine's bell", "a shop's doorbell" (on the wall: lay it on a
  floor tile at a house front's foot, the street side), "the watch's alarm bell" (mixed).
- 12: "the diver's bell (the Muffled Bell)"; "an alarm bell at a sluice".
- 13: "the mill bell on its gable (the Muffled Bell)" (by the mill: its gable); "a farm bell on its post".
- 14: "the chapel bell (the Muffled Bell)" (in the chapel); "a patient's call bell" (on the wall, by a ward's bed).
- 15: "the library's closing bell (the Muffled Bell)"; "a hand bell" (on the reading desks and in the halls).
Their frames (the art's): a small bell 0 quiet, 1 awake, 2 rung one way, 3 rung back; the Muffled Bell 0 gagged, then 1 to 3
swinging. Which frame shows is the event's (it sets the prop's `state`); a dresser lays them at state 0.

## How a helper works (every helper: read this)

- YOUR OWN WORKING COPY AND BRANCH: you are given a folder (a git worktree of the repo) on a branch of your own from
  `act2/build`. Work and commit there only; push your branch (`git push -u origin <branch>`). Never touch `main`, `next`,
  `gh-pages` or `act2/build`; never merge others' branches.
- THE MACHINE IS SHARED by up to a dozen helpers and has two processors: WRAP EVERY HEAVY COMMAND (tsc, tsx --test, a build,
  a playtest) in the slot lock: `/tmp/claude-0/-home-claude/f24b827a-622d-5f9d-8edd-1614a2fbe280/scratchpad/heavy.sh <command>`.
  Run only your own tests and the ones nearest yours, never the whole unit suite (it takes half an hour) and never the
  regression. Do not install packages (the registry refuses; everything needed is installed: tsx, typescript, esbuild via
  /opt/npm-tools, playwright with Chromium).
- STAY IN YOUR FILES. Each brief names what is yours. A shared file you must touch (game.ts, render.ts, main.ts, defs.ts):
  as little as you can, each change marked with a comment naming the act ("(ACT 2, THE HUSH: ...)"), so the planning chat
  can bring the branches together.
- THE PROJECT'S RULES (CLAUDE.md): the owner does no coding; pictures first (everything here is behind ACT2, off: keep it
  so); what glows on a friend is cyan, pink and gold glows are the enemy's; the Silent Order and the Hushed make no sound
  with their mouths (the sound chat's, later); nothing gory; original designs only; his words quoted only exactly. The art
  is the art chat's: use its numbers (every move's timing and reach is in its README and its *_moves.ts / *_shots.ts files)
  and do not repaint it; where the art leaves a number to the game ("What is yours"), pick and say what you picked.
- HOW THE CODE IS WRITTEN HERE: TypeScript in this project's long-comment style (read a few files of the descent's first:
  each rule says whose word it is, in plain words). Keep `npx --no-install tsc --noEmit -p tsconfig.json` clean.
- WHEN DONE: commit, push, and end with a short report: what is built, the numbers you chose, what is NOT done or not sure,
  every file outside your own you changed and why, the tests you ran and their counts.

## Calls made (to tell him)

(kept as the build goes)
