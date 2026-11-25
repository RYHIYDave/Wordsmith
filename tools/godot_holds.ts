// THE GODOT PORT: WHAT HAPPENS ON FLOORS 6 TO 10 BESIDES THEIR FIGHTS, as the game itself has it, for godot/scripts/act1/holds.gd,
// quest610.gd and pillars.gd. Taken from the game's own map-maker and rules (a new Warrior's game into each floor, as
// tools/godot_export.ts makes it), written to files of their own so that the floors' layouts are not made again:
//   godot/assets/floor<N>/holds.json (N 6 to 10): THE CULT'S STRONGHOLDS on that floor (game/act1_layout.ts Land.holds: the gate's
//     foot, the altar, the yard, the guards' places, the hall, its hallway, where he comes in and where its fight stands; the two
//     guards' ids among the floor's monsters), and each one's FIVE WAVES (game.ts holdWave, HOLD_WAVES on): every monster the game
//     itself spawns for each wave, where, with its words and life before the door's words and the wave's own growth are put on it
//     (the Godot side puts them on: holds.gd), and how long after the wave comes each comes up out of its rift (ARRIVALS); the
//     floor's `power` (the reward's gold); the kinds' numbers. FLOOR 7: THE EYRIE'S EDGE (game.ts queenDown: where he is walked to,
//     and which way across the screen the drop lies). FLOOR 10: THE CULT'S THREE OBELISKS, the pillars of the Swamp Colossus's
//     third phase (game/act1_rules/colossus.ts: EYE3.pillars on his stone, in the order the fight lights them).
//   godot/assets/act1/quest610.json: the game's own words and numbers for them (game/act1_holds.ts HOLD_TUNE, HOLD_WAVES, WAVE_MAKE;
//     game/defs.ts LOOT2; game/quests610.ts QUEST610_TEXT, EYRIE_SCENE, EYRIE_LINES, PIECE_BOSSES, HUNT_LINE, PILLARS, MUSTER_TEXT;
//     game/quest_marks.ts; render/quest_mark.ts the marker's rune; game/arrivals.ts ARRIVALS; art/meld_drops.ts runedust's heaps).
//   npx tsx tools/godot_holds.ts [seed]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { Game } from '../src/game/game';
import { LOOT2, MONSTERS } from '../src/game/defs';
import { figureOf } from '../src/art/bestiary';
import { bakeName } from '../src/render/monsters_bake_list';
import { ALTAR_GOES, HOLD_GUARD_ID, HOLD_PACK, HOLD_TUNE, HOLD_WAVES, WAVE_MAKE } from '../src/game/act1_holds';
import { HOLD_HALLWAY } from '../src/game/act1_layout';
import { ARRIVALS, riftSize } from '../src/game/arrivals';
import { EYRIE_LINES, EYRIE_SCENE, HUNT_LINE, MUSTER, MUSTER_TEXT, PIECE_BOSSES, PILLARS, QUEST610_TEXT, QUESTS610 } from '../src/game/quests610';
import { QUEST_MARKS, SPEAK_BACK, SPEAK_NEW, SPEAK_RETURN, SPEAK_WHERE } from '../src/game/quest_marks';
import { RUNE_COLORS, RUNE_FINE, RUNE_FLASH, RUNE_HOT, RUNE_MARK } from '../src/render/quest_mark';
import { F9_LAIRS } from '../src/game/f9_lairs';
import { COLOSSUS, EYE3, stoneToWorld } from '../src/game/colossus_fight';
import { MELD_DUST_COLOR } from '../src/game/melds';
import { DUST_FPS, SPILL_SECS, WHIRL_SECS } from '../src/art/meld_drops';

declare const process: { argv: string[] };
paintWithoutCanvas();
gameSwitches();
const seed = Number(process.argv[2] ?? 1) >>> 0;

const plain = (o: object): Record<string, number | string | boolean> => {
  const out: Record<string, number | string | boolean> = {};
  for (const [k, v] of Object.entries(o)) if (typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean') out[k] = v;
  return out;
};
type Any = Record<string, any>;

for (let depth = 6; depth <= 10; depth++) {
  // (WS_FLOORS: only these floors, as "7,8": the remade floors, game/levels2.ts)
  if (process.env.WS_FLOORS && !process.env.WS_FLOORS.split(',').includes(String(depth))) continue;
  // (a hero whose wordsmith's ring is lit, as every hero is by now: the monsters carry words, as the export's `lit` game has them)
  const game = new Game('warrior', seed);
  game.depth = depth;
  game.hero.ring = true;
  game.enterDungeon();
  const G = game as unknown as Any;
  const L = game.level;
  const land = L.land!;
  // (is this the level the Godot side has laid out? its tiles held to godot/assets/floor<N>/layout.json)
  const lay = JSON.parse(readFileSync(`godot/assets/floor${depth}${process.env.WS_OUT_SUFFIX ?? ""}/layout.json`, 'utf8'));
  let hash = 0;
  let mine = 0;
  for (const t of lay.tiles) hash = (Math.imul(hash, 31) + t) | 0;
  for (const t of L.floor.tiles) mine = (Math.imul(mine, 31) + t) | 0;
  if (hash !== mine) throw new Error(`floor ${depth}: not the level in godot/assets/floor${depth}/layout.json`);
  const kinds = new Set<string>();
  const holds = land.holds.map((q) => {
    // (THE WAVES: each as the game's holdWave spawns it for this stronghold, with nothing yet on its altar and the wave's own
    // growth left off: the Godot side puts both on, as the game does, by the words burned at the door)
    const st = L.holds![q.n];
    const grow = HOLD_WAVES.life;
    HOLD_WAVES.life = 0;
    const waves: Any[] = [];
    for (let k = 1; k <= HOLD_WAVES.n; k++) {
      st.won = false;
      st.words = [];
      G.risers.length = 0;
      const from = game.monsters.length;
      G.holdWave(q.n, k);
      const came: Any[] = [];
      // (ARRIVALS: they come up out of rifts, each a little after the one before: game.ts arriveFrom)
      for (const r of G.risers) {
        const m = r.m;
        kinds.add(m.kind);
        came.push({ ...plain(m), figure: bakeName(figureOf(m)), words: [...m.words], half: [...(m.half ?? [])], carries: [...m.carries], after: -r.age, rise: r.rise ?? ARRIVALS.rise, rift: riftSize(MONSTERS[m.kind as keyof typeof MONSTERS]?.size) });
      }
      for (const m of game.monsters.slice(from)) {
        kinds.add(m.kind);
        came.push({ ...plain(m), figure: bakeName(figureOf(m)), words: [...m.words], half: [...(m.half ?? [])], carries: [...m.carries], after: 0, rise: 0, rift: 0 });
      }
      game.monsters.length = from;
      G.risers.length = 0;
      waves.push({ k, packs: [...(st.packs ?? [])], monsters: came });
    }
    HOLD_WAVES.life = grow;
    st.wave = undefined;
    st.packs = undefined;
    return {
      n: q.n, gx: q.gx, gy: q.gy, altar: { ...q.altar }, yard: q.yard, guards: q.guards.map((g) => ({ ...g })), guardIds: [HOLD_GUARD_ID(q.n, 0), HOLD_GUARD_ID(q.n, 1)],
      hall: q.hall, inside: { ...q.inside }, entry: { ...q.entry }, fight: { ...q.fight }, ...(q.way ? { way: { ...q.way } } : {}), pack: st.pack, waves,
    };
  });
  const defs: Record<string, Any> = {};
  for (const k of kinds) defs[k] = plain(MONSTERS[k as keyof typeof MONSTERS]);
  const out: Any = { depth, seed, power: game.power, own: HOLD_PACK[depth], holds, defs };
  // FLOOR 7: THE EYRIE'S EDGE (game.ts queenDown, with the Queen fallen where her ground's middle is)
  if (depth === 7) {
    const area = land.areas.find((a) => a.role === 'boss')!;
    G.queenDown({ kind: 'queen', x: area.blob.x, y: area.blob.y });
    const S = G.scene;
    if (S) out.eyrie = { to: { ...S.to }, side: S.side };
    G.scene = null;
  }
  // FLOOR 10: THE CULT'S OBELISKS (the Swamp Colossus's stone: EYE3.pillars, as the fight lights them)
  if (depth === 10 && land.stone) out.pillars = EYE3.pillars.map(([u, v]) => stoneToWorld(land.stone!, u, v));
  mkdirSync(`godot/assets/floor${depth}${process.env.WS_OUT_SUFFIX ?? ""}`, { recursive: true });
  writeFileSync(`godot/assets/floor${depth}${process.env.WS_OUT_SUFFIX ?? ""}/holds.json`, JSON.stringify(out, null, 0));
  console.log(`floor ${depth}: ${holds.length} stronghold${holds.length === 1 ? '' : 's'} (${holds.map((h) => `gate ${h.gx},${h.gy}, hall ${h.inside.x},${h.inside.y} ${h.inside.w}x${h.inside.h}; waves ${h.waves.map((w) => w.monsters.length).join('/')}`).join('; ')}); kinds ${[...kinds].join(', ')}${out.eyrie ? `; the eyrie's edge ${out.eyrie.to.x},${out.eyrie.to.y} (side ${out.eyrie.side})` : ''}${out.pillars ? `; obelisks ${out.pillars.map((p: Any) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')}` : ''}`);
}

// THE WORDS AND NUMBERS
const T = QUEST610_TEXT;
mkdirSync('godot/assets/act1', { recursive: true });
writeFileSync('godot/assets/act1/quest610.json', JSON.stringify({
  switches: { quests610: QUESTS610.on, f9Lairs: F9_LAIRS.on, colossus: COLOSSUS.on, pillars: PILLARS.on, holdWaves: HOLD_WAVES.on, altarGoes: ALTAR_GOES.on, hallway: HOLD_HALLWAY.on, questMarks: QUEST_MARKS.on, speakNew: SPEAK_NEW.on, speakReturn: SPEAK_RETURN.on, muster: MUSTER.on, arrivals: ARRIVALS.on },
  hold: { tune: HOLD_TUNE, waves: HOLD_WAVES, make: WAVE_MAKE, loot2: { on: LOOT2.on, hold: LOOT2.hold, dust: LOOT2.dust, gold: LOOT2.gold }, hallway: HOLD_HALLWAY },
  arrivals: ARRIVALS,
  text: {
    ...Object.fromEntries(Object.entries(T).filter(([, v]) => typeof v === 'string')),
    pieceGot: [1, 2, 3].map((k) => T.pieceGot(k)),
    pillarSet: [0, 1, 2].map((k) => T.pillarSet(k)),
    pillarBroken: [0, 1, 2].map((k) => T.pillarBroken(k)),
    rollGot: [1, 2, 3].map((k) => MUSTER_TEXT.got(k)),
    rollLabel: MUSTER_TEXT.label,
    eyrie: EYRIE_LINES.warrior,
  },
  eyrie: EYRIE_SCENE,
  pieces: PIECE_BOSSES,
  hunt: HUNT_LINE,
  pillars: PILLARS,
  muster: { pages: MUSTER.pages },
  marks: { secs: QUEST_MARKS.secs, where: SPEAK_WHERE, back: SPEAK_BACK, rune: RUNE_FINE, colors: RUNE_COLORS, hot: RUNE_HOT, flash: RUNE_FLASH, mark: RUNE_MARK },
  dust: { color: MELD_DUST_COLOR, fps: DUST_FPS, spill: SPILL_SECS, whirl: WHIRL_SECS },
}, null, 1));
console.log('act1/quest610.json: the words and numbers');
