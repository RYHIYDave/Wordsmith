// THE FLOORS' SCENE SOUNDS, FLOORS 1 TO 20 (the sound chat's eighth batch, 9 Nov 2026: his word, “Scene sounds”; shown them on
// try-out 13, his pick by 21:10 Eastern, “All good, hand over (Recommended)”; the loops, “They're fine (Recommended)”;
// assets/sound/README.md, "Eighth batch"). What is heard where:
//   THE BACKGROUNDS: one loop a floor (bed_f1 to bed_f20), the Stoker's furnace on floor 3 and the Colossus's burning pillars on
//     floor 10: game/world_sounds.ts loopWants (engine/audio.ts setLoops plays them, and lets a floor's go with the floor).
//   THE MOMENTS AROUND THE HERO (floors 1 to 5, three each; 11 to 15, one each): each made whole to its film's frames, so played
//     once, at its own pitch, as the moment's frame 0 is shown (render/pieces.ts and render/act1_pieces.ts say when; main.ts
//     plays it, and where it was heard its jolts are not sounded a second time in code).
//   THE QUEST PIECES AND THE TRAPS: one-shots the game times (game/game.ts and the floors' own rules), by the names below.
// All of it through the world's bus (engine/audio.ts worldSound), so floors 11 to 15 are heard thin and muffled, as the rest of
// the world is there. A floor's are fetched as it is come into (sceneSoundsOf; main.ts, with its enemies': engine/audio.ts
// warmNamed), and let go with them once it is left behind; they ship in packs of their own by act (tools/sound_packs.mjs), so a
// floor fetches its own act's and not all 82.

/** The switch: off, none of the eighth batch is played (the floors sound as they did before it). */
export const SCENE_SOUNDS = { on: true };

/** How loud a moment's sound is played (the takes are made as the combat sounds are: engine/audio.ts RECORDED_GAIN holds). */
export const MOMENT_VOL = 0.9;

/**
 * THE MOMENTS' SOUNDS, floor by floor, in the art's order (floors 1 to 5: game/first5.ts FLOOR_SETS' `moments`, MomentHost.n;
 * floors 11 to 15 their one, game/act2_moments.ts): "dust and a falling stone", "rats bolt", "a candle gutters out"; "the ravens
 * take flight", "the bell tolls", "the gibbet swings"; "the chains pull", "the ball falls", "the bars shake"; "the skull wall
 * spills", "the cart runs", "the bones stir"; "the roof comes in", "the winch runs wild", "the rift breathes"; the pigeons, the
 * surge, the whirl of pages, the screen, the chandelier.
 */
export const MOMENT_SOUND: Readonly<Record<number, readonly string[]>> = {
  1: ['f1_stone', 'f1_rats', 'f1_candles'],
  2: ['f2_ravens', 'f2_bell', 'f2_gibbet'],
  3: ['f3_chains', 'f3_ball', 'f3_bars'],
  4: ['f4_wall', 'f4_cart', 'f4_bones'],
  5: ['f5_roof', 'f5_winch', 'f5_rift'],
  11: ['f11_pigeons'],
  12: ['f12_surge'],
  13: ['f13_whirl'],
  14: ['f14_screen'],
  15: ['f15_chandelier'],
};

/** The sound of moment `n` of floor `floor`, or null where it has none (or the batch is switched off). */
export function momentSound(floor: number, n: number): string | null {
  if (!SCENE_SOUNDS.on) return null;
  return MOMENT_SOUND[floor]?.[n] ?? null;
}

/**
 * A FLOOR'S TRAP, SPRUNG (laid as a spike floor's beat, game/traps.ts; its picture the floor's own, game/act1_dress.ts): the
 * Ledge Road's crumbling ledge, the Fen's sucking bog, the Glass Gallery's skylight, the Keep's murder hole. The other floors'
 * keep the spikes' sound.
 */
export const TRAP_SOUND: Readonly<Record<number, string>> = { 7: 'ledge_crumble', 10: 'bog_step', 18: 'skylight', 19: 'pitch_pour' };

/** The trap's sound on floor `depth`, sprung `d` tiles from him: its name, how loud, and the sound made in code until it has come. */
export function trapSound(depth: number, d: number): { name: string; vol: number } {
  const own = SCENE_SOUNDS.on ? TRAP_SOUND[depth] : undefined;
  // (the spikes as they were: one loudness wherever within earshot; a floor's own the louder the nearer, as it lasts longer)
  if (!own) return { name: 'trap_spikes', vol: 0.55 };
  const k = d <= 1.5 ? 1 : d >= 9 ? 0 : 1 - (d - 1.5) / 7.5;
  return { name: own, vol: 0.3 + 0.5 * k };
}

/** The quest pieces' and the traps' sounds, by the floor that plays them (the moments' apart: MOMENT_SOUND). */
const PIECES: Readonly<Record<number, readonly string[]>> = {
  // (the Stoker's quest: the gear set into the crank, the crank turned, the furnace dying, the fire across the Chained One's gateway going out)
  3: ['crank_gear', 'crank_turn', 'furnace_out', 'gate_fire_out'],
  // (the mine shaft's cage: down as the Fleshmancer dies, up with him in it)
  5: ['cage_down', 'cage_up'],
  7: ['ledge_crumble', 'eyrie_wind'],
  8: ['singing_stones'],
  10: ['bog_step'],
  16: ['nettle'],
  17: ['clock_chime'],
  18: ['mirror_crack', 'skylight'],
  19: ['portcullis', 'pitch_pour', 'songbird'],
};
/** Every stronghold, floors 6 to 10: a word set into the altar of the words, the door's seal burning away. */
const HOLD_SOUNDS = ['altar_word', 'seal_burn'] as const;
/** Every Hush floor, 11 to 15: a bell rung, the Muffled Bell struck. */
const BELL_SOUNDS = ['bell_ring', 'bell_muffled'] as const;

/** THE SCENE SOUNDS FLOOR `depth` MAY PLAY (their names, two takes each): fetched as it is come into. None in town, or switched off. */
export function sceneSoundsOf(depth: number): string[] {
  if (!SCENE_SOUNDS.on) return [];
  const out = [...(MOMENT_SOUND[depth] ?? []), ...(PIECES[depth] ?? [])];
  if (depth >= 6 && depth <= 10) out.push(...HOLD_SOUNDS);
  if (depth >= 11 && depth <= 15) out.push(...BELL_SOUNDS);
  return out;
}

/** The act a floor is of, 1 to 4 (floors 1 to 5, 6 to 10, 11 to 15, 16 to 20): its scene sounds' pack is `scene-<act>` (tools/sound_packs.mjs). */
export function sceneAct(depth: number): number {
  return Math.max(1, Math.min(4, Math.ceil(depth / 5)));
}

/** The floor's background loop (engine/audio.ts setLoops: `<name>_loop.wav`), or null where it has none. */
export function bedOf(depth: number): string | null {
  return SCENE_SOUNDS.on && depth >= 1 && depth <= 20 ? `bed_f${depth}` : null;
}

/**
 * THE SINGING STONES (floor 8, Echo Canyon: the art's 'singing stones', game/act1_dress.ts): a low hum as he passes one. One
 * hums as he comes within `near` tiles of it, and not again until he has gone `far` from it; never two within `gap` seconds
 * (three stand in a ring).
 */
export const SINGING = { name: 'singing stones', near: 1.9, far: 3.6, gap: 2.2, vol: 0.8 } as const;

/** The furnace's and the pillars' fires, heard by nearness (tiles: full within `near`, nothing past `far`), at most this loud. */
export const FURNACE_LOOP = { vol: 0.6, near: 2, far: 11 } as const;
export const PILLAR_LOOP = { vol: 0.55, near: 2, far: 10 } as const;

/**
 * THE STOKER'S CRANK, IN ORDER (seconds from when it is turned; game/quests15.ts CRANK_TIMES has the pictures' times): the gear
 * set in at once; the crank's one turn a moment after (the art turns it once and a quarter in 1.2 s, eased in and out); the
 * furnace dying, and the fire in the gateway, as the turn ends (CRANK_TIMES.turn).
 */
export const CRANK_SOUND = { turnAt: 0.3 } as const;

/** THE KEEP'S PORTCULLIS: its sound has the chain falling first, the slam landing this long into it (seconds), so it is begun that long before the slam. */
export const PORT_SOUND_LEAD = 0.5;
