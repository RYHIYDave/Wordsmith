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

## What is built (19 Oct 2026), all behind ACT2 (off)

Branch `act2/build`: the frame, then each part from a helper's branch merged in (act2/f11 to f15 the floors' map-makers and
dressers, act2/k11a, k11b, k12 to k15 the kinds, the Bells the planning chat's own).

- THE FLOORS, each its own map-maker and dresser (game/act2/<ground>.ts, BUILT), every one laid by the Bells' contract above:
  11 the Gate Ward (houses everywhere, the floor cut out of them: the broken gate's street, eight squares joined by lanes, the
  Crier's Square at the far end; up to nine houses walked into that fade as he goes in, render/act2_houses.ts); 12 the
  Undercity (chambers and tunnels on a lattice, the channels pits to the rules so shots go over them, grates and planks
  across; the flood and the slick its traps); 13 the Millrace (open fields as the Pinewood, the cart track, the mill off the
  middle of the way with its wheel and race, the river, the Pulping Floor; the wheel and the stamping mill its traps, the
  drying lines seen through); 14 the House of Quiet (wards of beds, the chapel, the Physician's Theatre); 15 the Great Library
  (halls of shelves, the reading desks, the Reading Room). Only the floor's own pieces and the Hush's set are laid.
- THE KINDS (game/act1_rules, art/act1_figs, render/act1_fx: <kind>.ts each): 11 the Hushed townsfolk (the porter, goodwife
  and baker), the Hushed watch (the sergeant leads a yellow pack, hounds at his heels), the Silent Order's scribes, the mute
  watch hounds, and the Crier; 12 the King's rats, the dredgers (the hook and haul), the Rat King (the bite, Stolen Words, the
  Roll, Unknot); 13 the Hushed reapers and gleaners, the night carters (the lash), the Palimpsest (more torn as it weakens, its
  pages burn under fire); 14 the Hushed patients (they lie in the ward's beds and rise, the silent scream), the orderlies (the
  mallet), the Physician (the rap, the Draw that takes one of your words until you hit it back out, Tonic, Rounds); 15 the
  inklings (they melt to a pool and rise at you), the Bookwardens (the tome slam), the Censor (the slash, Strike-Through, the
  Redaction bars, the Hush, and at half life the floor blacked out at his room's walls).
- THE BELLS (game/bells.ts; Game "ACT 2: THE BELLS"; render/bells.ts; the HUD's clock and the minimap's veil): above.
- One naming for a kind's other looks, '<kind>:<form>' (art/act1_figs/types.ts `looks`): 'hushed:1', 'hushed:2', 'watch:1',
  'fieldhand:1', 'palimpsest:1' and ':2'. A lair's guardian on the Hush's floors is shown as its own kind, never the old
  Guardian's figure (art/bestiary.ts figureOf).
- Tests: tests/act2*.test.ts (every part's, 194 at the join, all passing), and the art's own tests of floors 11 to 15 (their
  "nothing of the game imports it" checks now "in the game only through its own", as the descent's are).

## Calls made (to tell him)

The planning chat's helpers' picks where the art left a number to the game, each his to change:
- Speeds and reaches as the pictures are painted (each kind's walk at its painted pace so its feet do not slide; each blow
  landing at the moment its picture strikes, its reach measured off the picture). In game/defs.ts MONSTERS, marked.
- The Rat King: words 0.9 of his blow, the Roll 1.4, the swarm's bite 0.35; cooldowns words 6 s, Roll 9 s, Unknot 13 s; his
  radius 1.45 (his heap's). The dredger's hook hauls in anyone 1.4 tiles or further out.
- The Physician: the Draw 9 s, Tonic 11 s, Rounds 18 s; the word he draws comes back after 5 hits or a twentieth of his life,
  or at his death, and is never lost (saved, left on the level or dying: given back). A patient lies in its bed until the
  hero is within 3.5 tiles, it is struck, or Rounds calls it.
- The Censor: Strike-Through 7 s, Redaction 10 s, the Hush 18 s; the blackout at half life about a quarter of his room, at
  its walls, once.
- The Bells: as told him (15 seconds a bell; the explosion gear, gold, runedust and a chance at a word).
- The Hushed townsfolk on every floor of the Hush (floor 15 too), as told him.

## Not done yet, or not sure

- THE MOMENTS (his Places 8: one a floor, the art's films): being wired by a helper (act2/moments).
- Medium kinds with one attack, as the art drew them (his rule of 9 Oct gives them two): the watch, the dredgers, the
  orderlies, the Bookwardens. A second each needs a picture from the art chat.
- The woman patient (the art drew two) is not in: the game holds one figure a patient.
- The Knell (his 05:41, the Hush's own boss at the last bell): not drawn yet.
- No picture of the Censor's emptied book (it still shows its words after his death).
- The Undercity's sewerman's handbell is not laid (the contract names only the alarm bells); the slick hurts on the spike
  beat and does not make him slide.
- The Millrace's breakables (reams, barrels of ink, jars) stand whole: the game breaks only barrels and urns.
- The Crier's gate at his square's mouth stands open and never shuts behind the hero; floor 11's moving pieces stand still;
  the Palimpsest's Rewrite always shows 14 pages.
- Sounds: the Hush's kinds make no mouth sounds; their other sounds are the sound chat's.
