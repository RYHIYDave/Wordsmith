# The floors' scene sounds, wired in (floors 1 to 20)

The sound chat's eighth batch (assets/sound/README.md, "Eighth batch": 82 one-shots and 22 loops) is wired into the game on
the branch `sound/scene-wiring`. It is NOT in the released game: the main chat brings it in.

## His words

- In the sound chat, 9 Nov 2026 (as assets/sound/README.md has them): “Scene sounds”; shown them on try-out 13, by 21:10
  Eastern, “All good, hand over (Recommended)”; the loops, “They're fine (Recommended)”.
- To this chat (a new chat of his, working from the queue), 11 Nov 2026, 14:09 Eastern: “Work on this task from the Wordsmith
  Queue: “Wire in the scene sounds for floors 1 to 20” (queue item wire-floor-scene-sounds).” The item said "Main chat only";
  his word here came first, so it was done on a branch of its own, and nothing was published or put on `main`.

## What plays where

Everything goes through the world's bus (engine/audio.ts worldSound, setLoops), so floors 11 to 15 are thin and muffled, as his
Hush rule has it. `src/game/scene_sounds.ts` is the one list of which floor plays which; `SCENE_SOUNDS.on = false` there puts
every floor back to how it sounded before.

- THE BACKGROUNDS. Each floor's own loop (`bed_f1` to `bed_f20`) goes round at full volume while he is on that floor, not in
  town or the camp; the last floor's fades as the next one's comes. `furnace` is heard near the Stoker's furnace on floor 3
  until the crank's turn is done. `pillar_fire` is heard near each of the Colossus's pillars on floor 10 while it burns (the
  nearest). (game/world_sounds.ts loopWants.)
- THE MOMENTS, floors 1 to 5 (three each) and 11 to 15 (one each): each is played once, at its own pitch and length, in the
  frame its film begins (render/pieces.ts, render/act1_pieces.ts, main.ts). Its jolts are in it, so while it is heard the
  screen still kicks but no blow is made in code on top of it. If it has not come yet, the blows in code sound as before. The
  House of Quiet's screen (floor 14) has its sound, through the muffling.
- FLOOR 3, THE STOKER'S CRANK: `crank_gear` as the gear is set in; `crank_turn` 0.3 s after; `furnace_out` as the turn ends
  (1.2 s); `gate_fire_out` 0.8 s after that.
- FLOOR 5, THE SHAFT: `cage_down` from the frame the cage starts down (the Fleshmancer's death), `cage_up` from the frame he
  rides up. The slams the game made in code at the cage's jolts are now stand-ins: silent while the recording is heard.
- FLOORS 7, 10, 18, 19, THE FLOOR'S OWN TRAP: `ledge_crumble`, `bog_step`, `skylight`, `pitch_pour` as the trap springs, in
  place of the spikes' sound, louder the nearer he is. The other floors' traps keep the spikes' sound.
- FLOOR 7: `eyrie_wind` as the picture begins to pan out from the eyrie's edge.
- FLOOR 8: `singing_stones` as he comes within 1.9 tiles of a singing stone; not again from that stone until he has gone 3.6
  tiles from it.
- FLOORS 6 TO 10, THE STRONGHOLDS: `altar_word` as a word is laid on the altar (in place of the word sound), `seal_burn` as
  the door's seal breaks (in place of the power sound).
- FLOORS 11 TO 15, THE BELLS: `bell_ring` as a bell is rung (in place of the portal sound); `bell_muffled` as the Muffled Bell
  is struck, with the roar that was already there.
- FLOOR 16: `nettle` as he walks into a nettle bed and at each sting.
- FLOOR 17: `clock_chime` as the ebony clock chimes (in place of the echo).
- FLOOR 18: `mirror_crack` as a blow cracks a mirror (in place of the quiet breaking glass).
- FLOOR 19: `portcullis` begun 0.5 s before the slam, so its chain is heard first and its slam lands with the picture (the
  slam in code is its stand-in); `songbird` as the clockwork songbird begins to sing, 1.8 s after the King dies.

## How it ships and what it costs

- The 82 one-shots are in four packs of their own by act (tools/sound_packs.mjs): `scene-1` (floors 1 to 5, 2.21 MB),
  `scene-2` (0.41 MB), `scene-3` (0.77 MB), `scene-4` (0.44 MB). A floor fetches its own act's pack, and its own sounds from
  it, as it is come into (main.ts, with its enemies': engine/audio.ts warmNamed), and they are let go with its enemies' once
  the floor is two places back.
- The 22 loops ship as files of their own (WAV), as the first six do. A floor's own loop is fetched on that floor. Once the
  loop has been let go of (6 s after it is no longer wanted), its decoded sound is let go too, so the twenty do not pile up
  over a sitting (engine/audio.ts setLoops).
- The sounds' folder beside the page holds 49 files now (19 packs, 28 loops, the title theme, the index). The sounds' mark
  changes, so a new `sounds/<mark>/` folder ships with the page.

## Choices made here, his or the main chat's to change

1. LOUDNESS. The numbers are in game/scene_sounds.ts and at each call: the moments 0.9; the furnace's loop up to 0.6 and the
   pillars' up to 0.55 by nearness; the floor's own trap 0.3 to 0.8 by nearness. He has not heard them in play.
2. THE GATEWAY'S FIRE (floor 3). The Chained One's gateway is 37 to 105 tiles from the crank on eight floors measured, so by
   nearness it would never be heard. It is played quieter (0.4), 0.8 s after the furnace begins to die.
3. THE TRAPS' OWN SOUNDS are played as the trap springs near him (as the spikes' sound is), not only when it catches him.
4. `bell_muffled` is added under the roar that was there; the README does not say "in place of" for it.
5. THE OLD `water` LOOP still goes round on floors 10, 12 and 13, over the new backgrounds there (floor 12's is running
   water). Left as it was: taking it off is a change to the fourth batch.
6. THE SINGING STONES are rare: on ten floors 8 laid by the game's own dice, seven had none (the others three, one and one).
   The hum is wired where they stand.

## Checked

- `tsc --noEmit -p tsconfig.json`: clean.
- `node tools/unit.mjs --only scene_sounds,recorded_sounds,sounds2,memory_floors,colossus_sounds,keep_portcullis,act2_bells,
  hold_altar,act2_swangardens,gallery_mirrors,act2_masque,masque,act2_gking,traps,ways,quests610,furnace_arena,stoker,
  act2_moments,act2_keep` (and the core) on c4c248aa4d, the merge with main at 9d3501b: 43 files, 401 tests, all passed. (The
  same list on 58856780d6, before the merge: 43 files, 401 tests, all passed.) `tests/scene_sounds.test.ts` is new: 10 tests.
- In a browser, on a readable build served with its sounds (not the release build; made as tools/build.mjs packs them):
  `tools/scenarios/scene_sounds.mjs` (new), finished clean, no errors, no sound failed. In it: floor 1's background going
  round; a floor 1 moment begun and its sound heard, with no blow in code over it; on floor 3 the furnace's loop by the crank,
  then `crank_gear`, `crank_turn`, `furnace_out` and `gate_fire_out` heard and the furnace's loop gone; on floor 2 only floor
  2's background still held decoded, and floor 1's moments let go; on floor 6 `altar_word` and `seal_burn` heard; on floor 11
  `bell_muffled`, `bell_ring` and the pigeons' moment heard. Packs fetched: scene-1, scene-2, scene-3 as their floors were
  come into. `tools/scenarios/world_sounds.mjs` on the same page: finished clean, the town's loops and sounds as before.

NOT CHECKED:
- How any of it sounds to an ear. Nobody has listened to the game with these in it.
- The release build and the published page.
- In the browser: the cage, the eyrie, the traps' own sounds, the singing stones, the nettles, the clock, the mirrors, the
  portcullis, the songbird, and the pillars' loop. The unit tests hold that the game asks for the altar, the seal, the crank,
  the cage's stand-ins, the stones and the portcullis's chain; the rest are single calls beside the sound each replaces.
- Memory on a phone. The decoded sound held floor by floor was not measured.

## For the main chat

1. Bring in `sound/scene-wiring`. It has main at 9d3501b (25.3.3) merged into it, and carries work-f5's commit 9e64093 (the 104
   files). The one conflict with main was the imports at the head of game/game.ts.
2. With `colossus-sounds` at c333b51 (tried here, not committed): one conflict, the end of assets/sound/README.md, where both
   add. Keep both. The code merges by itself.
3. Build; the sounds' mark changes. Run the published page's playtests, `tools/scenarios/scene_sounds.mjs` among them (it wants
   `--serve`; a floor's moment film takes 15 to 90 s to be painted in a headless browser, and the playtest waits for it).
4. Tell him, and ask how the floors sound on his phone. The choices above are his to change.
