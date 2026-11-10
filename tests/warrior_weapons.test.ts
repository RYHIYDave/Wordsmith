// THE WARRIOR'S BATTLE AXE AND WARHAMMER, STEP 1: THEIR LOOKS (src/art/warrior_up_weapons.ts, src/dev/warrior_weapons_items.ts;
// the art chat's helper, 9 Nov 2026; docs/mockups/warrior_weapons/README.md). A MOCK-UP BEHIND A SWITCH THAT IS OFF. Held here:
//   1. the switch is off, and nothing of the game imports either file (the pictures' tools only);
//   2. each of the six takes, held by him in his guard, on his back in town, and at the top of its tap's wind-up (the Cleave, the
//      Smash): NOTHING THROUGH ANYTHING (no solid of the take inside one of his, but where his two fists close round its grip),
//      and both his hands on the haft, at its grip;
//   3. IT READS FROM ALL EIGHT SIDES: in his guard and on his back, from each of his eight sides, at least 100 picture pixels
//      of its head are seen at the game's own size; at the top of the wind-up, from the two sides the sheet shows it (his two
//      sides side-on), 140;
//   4. every frame crisp (every pixel whole but his edge of light), the friend's cyan edge round him, and nothing on him of the enemy's pink or gold: what of the take is
//      seen is its own iron, wood and leather, and its glow the friend's cyan;
//   5. as items, each take at its four rarities in style A: 32 by 32, crisp, inside its frame with a clear pixel round it, the
//      rim of its rarity's colour; each rarer one finer (the four different; Magic with blue, Rare with gold or a yellow
//      stone, Unique with orange stones); nothing of the enemy's colours and no cyan.
//   6. THE HEADS TURNED AS HE ASKED (9 Nov 2026: “Have the blades and the hammers point down”; “All the hammers are pointing
//      the wrong way”; his pick, “The edge and the hammer face (Recommended)”): in his guard and at each wind-up's top the way
//      an axe's edge or a hammer's striking face points has a downward part, in the world and on the screen from every one of
//      his eight sides; at the wind-ups it points on toward the mark; on his back it is turned down and out; never at his head.
//   STEP 2, HIS MOVES WITH THE WAR AXE (src/art/warrior_up_axe_moves.ts; his pick of 9 Nov 2026, “B, the war axe”):
//   7. each move's frames are whole: as many as its beats say, him and the axe in each, and the lists the bake takes in the
//      shape the game holds a hero's;
//   8. IN EVERY FRAME OF EVERY MOVE, FROM EVERY ONE OF HIS EIGHT SIDES: his helm is seen (six tenths at least of what of it faces
//      the eye, the smear of a strike counted as hiding it); the working edge points down or toward the mark and never at his
//      own head; both hands grip the haft wherever the move has two on it (his right, wherever it has one); nothing of the axe
//      (or of the second, in Twin Axes) passes through him;
//   9. his stand and his run with it are the game's own, frame for frame: every number of his body and his legs;
//  10. his feet grip the floor: a foot that is down does not slide;
//  11. the thrown axe in the air: twelve pictures, a whole turn, crisp, its edges cyan; and the strikes' smears are the
//      friend's cyan, nothing of the enemy's.
//   run: tsx --test tests/warrior_weapons.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import { BLADE, CYAN, GLINT, INK, PINK, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME, MENACE } from '../src/art/mkit';
import { RARITY_COLOR } from '../src/art/palette';
import { rgba } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { WU_RIM, WU_SIDES, WU_SPIN, turnedStage } from '../src/art/warrior_up';
import { stage } from '../src/art/skin';
import { dot, norm, sub } from '../src/art/skeleton';
import type { WuSide } from '../src/art/warrior_up';
import { AXE, AXE_CHOP_END, AXE_CHOP_LAND, AXE_CHOP_LEAP, AXE_CLEAVE_HIT, AXE_FLIGHT, AXE_FLY_FRAMES, AXE_FRAME, AXE_LEAP_FRAMES, AXE_MOVES, AXE_REST, AXE_RUN, AXE_STAND, AXE_THROW_OUT, HELM_LEAST, axeFaults, axePosed, helmSeen, makeWarriorAxeArt, paintAxe, paintFlying } from '../src/art/warrior_up_axe_moves';
import type { AxeMove } from '../src/art/warrior_up_axe_moves';
import { KNIGHT_RUN3 } from '../src/art/moves3';
import { wuPosed } from '../src/art/warrior_up_art';
import { WU_REAR3, WU_REST as WU_REST_OF } from '../src/art/warrior_up_moves';
import { TAKES, TAKE_IDS, WARRIOR_WEAPONS, WW_DARK, WW_GLOW, WW_IRON, WW_LEATHER, WW_WOOD, armedThrough, edgeWay, handsOnHaft, holdBones, onTake, paintHold, takePlace, takeSeen } from '../src/art/warrior_up_weapons';
import { KNIGHT_BODY } from '../src/art/moves3';
import type { ArmedFrame, Hold, TakeId } from '../src/art/warrior_up_weapons';
import { paintWeaponItem } from '../src/dev/warrior_weapons_items';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

const key = (c: string): string => rgba(c).slice(0, 3).join(',');
const ENEMY = new Set([...PINK, ...FLAME, ENEMY_RIM, MENACE.color, '#ff3a78'].map(key));
const GOLD_GLOW = new Set(['#ffb070', '#fff0a0', '#ffd448', '#f6cc5c'].map(key));
const CYANS = new Set([...CYAN, ...BLADE, ...SPARK, GLINT, WU_RIM, '#22d0e0', '#28dcf0'].map(key).filter((k) => k !== '255,255,255'));
const OWN = new Set([...WW_IRON, ...WW_DARK, ...WW_WOOD, ...WW_LEATHER, ...WW_GLOW, INK].map(key));

const holds = (id: TakeId): Hold[] => ['guard', 'town', TAKES[id].kind === 'axe' ? 'cleave' : 'smash'];
const frames = new Map<string, ArmedFrame>();
function frame(id: TakeId, hold: Hold, side: WuSide): ArmedFrame {
  const k = `${id}:${hold}:${side}`;
  let f = frames.get(k);
  if (!f) frames.set(k, (f = paintHold(TAKES[id], hold, side)));
  return f;
}
const pixel = (p: Px, i: number): string => `${p.d[i * 4]},${p.d[i * 4 + 1]},${p.d[i * 4 + 2]}`;

test('1. the switch is off, and nothing of the game imports the new weapons or their drops', () => {
  assert.equal(WARRIOR_WEAPONS.on, false, 'WARRIOR_WEAPONS is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (his moves with the axe are of the mock-up too, and the page its film is shot on, which nothing ships: both below)
    if (!f.endsWith('.ts') || f === 'art/warrior_up_weapons.ts' || f === 'dev/warrior_weapons_items.ts' || f === 'art/warrior_up_axe_moves.ts' || f === 'dev/axe_film_main.ts') continue;
    const text = fs.readFileSync(`src/${f}`, 'utf8');
    if (/from ['"][^'"]*(warrior_up_weapons|warrior_weapons_items|warrior_up_axe_moves|axe_film_main)['"]/.test(text)) users.push(f);
  }
  assert.deepEqual(users, [], 'what imports them');
  // (the film's page holds the game, not the game the page: the game's own entry does not know it)
  assert.ok(!/axe_film|warrior_axe/.test(fs.readFileSync('src/main.ts', 'utf8')), 'main.ts does not know the film or the moves');
  // (the drops reach the game's item painter, art/items_a.ts, only to paint as it paints: it does not reach them)
  assert.ok(!/from ['"][^'"]*warrior_weapons/.test(fs.readFileSync('src/art/items_a.ts', 'utf8')), 'items_a does not import the drops');
});

test('2. nothing through anything: no solid of a take inside one of his but where his fists hold it; both hands on its grip', () => {
  const bad: string[] = [];
  for (const id of TAKE_IDS) for (const hold of holds(id)) {
    // (the solids are his and its whichever side he is seen from: one side is enough)
    const f = frame(id, hold, 'front');
    for (const t of armedThrough(f)) bad.push(`${id} ${hold}: ${t}`);
    if (hold !== 'town') for (const h of handsOnHaft(f)) bad.push(`${id} ${hold}: ${h}`);
  }
  assert.deepEqual(bad, [], 'through, or a hand off the haft');
});

test('2. ... and the check sees a take put through him (the axe laid level through his chest)', () => {
  const f = frame('axeA', 'guard', 'front');
  const s = f.s;
  // (the same frame, the take moved so its haft runs through his ribs)
  const moved = { ...f, placed: { ...f.placed, o: s.ribs } } as ArmedFrame;
  const sc = f.sc;
  const its = sc.prims.slice(f.firstPrim);
  const shift = [s.ribs[0] - f.placed.o[0], s.ribs[1] - f.placed.o[1], s.ribs[2] - f.placed.o[2]];
  const at = (p: readonly number[]): [number, number, number] => [p[0] + shift[0], p[1] + shift[1], p[2] + shift[2]];
  const prims = [...sc.prims.slice(0, f.firstPrim), ...its.map((p) => (p.k === 'cone' ? { ...p, a: at(p.a), b: at(p.b) } : p.k === 'tri' ? { ...p, a: at(p.a), b: at(p.b), c: at(p.c) } : { ...p, c: at(p.c) }))];
  const through = armedThrough({ ...moved, sc: { ...sc, prims } as typeof sc });
  assert.ok(through.some((t) => /trunk/.test(t)), `seen: ${through.join('; ')}`);
});

test('3. each take reads from all eight sides, in his guard and on his back (100 pixels of its head at least), and at the top of its wind-up (140)', () => {
  const least: string[] = [];
  const short: string[] = [];
  for (const id of TAKE_IDS) {
    for (const hold of ['guard', 'town'] as Hold[]) {
      let low = Infinity;
      let where = '';
      for (const side of WU_SIDES) {
        const n = takeSeen(frame(id, hold, side)).head;
        if (n < low) [low, where] = [n, side];
        if (n < 100) short.push(`${id} ${hold} ${side}: ${n}`);
      }
      least.push(`${id} ${hold} ${low} (${where})`);
    }
    const key = holds(id)[2];
    for (const side of ['side', 'sideL'] as WuSide[]) {
      const n = takeSeen(frame(id, key, side)).head;
      if (n < 140) short.push(`${id} ${key} ${side}: ${n}`);
    }
  }
  console.log(`  the least of each take's head seen: ${least.join('; ')}`);
  assert.deepEqual(short, [], 'too little of the head seen');
});

test('4. crisp; the friend\'s cyan edge round him; nothing of the enemy\'s; what of the take is seen is its own iron, wood and leather, and its glow cyan', () => {
  const bad: string[] = [];
  const glows = new Map<string, { seen: number; of: number }>();
  for (const id of TAKE_IDS) for (const hold of holds(id)) for (const side of WU_SIDES) {
    if (hold !== 'guard' && hold !== 'town' && side !== 'sideL' && side !== 'side') continue;
    const f = frame(id, hold, side);
    const p = f.px;
    const at = `${id} ${hold} ${side}`;
    let rim = 0;
    let glow = 0;
    const its = new Set<number>();
    for (let m = f.firstMat; m < f.sc.mats.length; m++) its.add(m);
    for (let i = 0; i < p.w * p.h; i++) {
      const a = p.d[i * 4 + 3];
      if (!a) continue;
      const c = pixel(p, i);
      // (every pixel whole but his edge of light, which the game lays at its own strength)
      if (a !== 255 && c !== key(WU_RIM)) bad.push(`${at}: a pixel half see-through (${c}, ${a})`);
      if (ENEMY.has(c) || GOLD_GLOW.has(c)) bad.push(`${at}: the enemy's colour ${c}`);
      if (c === key(WU_RIM)) rim++;
      if (its.has(f.drawn.stuff[i])) {
        if (!OWN.has(c)) bad.push(`${at}: the take painted ${c}, not its own`);
        if (CYANS.has(c) || c === '255,255,255') glow++;
      }
    }
    if (rim < 100) bad.push(`${at}: his cyan edge only ${rim} pixels`);
    // (its cyan seen: a face turned to the floor hides its own glow from some sides, so it is counted over the sides, below)
    if (hold !== 'town') {
      const k = `${id} ${hold}`;
      const g = glows.get(k) ?? { seen: 0, of: 0 };
      g.of++;
      if (glow >= 4) g.seen++;
      glows.set(k, g);
    }
    if (bad.length > 20) break;
  }
  // (the friend's cyan is seen on each take in his hands: in his guard from five of his eight sides at least, at its wind-up from one of the two shown)
  for (const [k, g] of glows) if (g.seen < (g.of === 8 ? 5 : 1)) bad.push(`${k}: its cyan seen from only ${g.seen} of ${g.of} sides`);
  console.log(`  each take's cyan seen, sides of those looked at: ${[...glows].map(([k, g]) => `${k} ${g.seen}/${g.of}`).join('; ')}`);
  assert.deepEqual(bad.slice(0, 20), [], 'crisp, cyan, his own');
});

test('5. as items: each take at its four rarities, 32 by 32, crisp, inside its frame, its rarity\'s rim; each rarer one finer; no enemy\'s colour, no cyan', () => {
  const BLUE = new Set(['#0c1440', '#16286e', '#2446a8', '#4a74e0', '#9ab8ff', '#0a1048', '#18288a', '#2a50cc', '#5a8aff', '#d6e4ff'].map(key));
  const GOLD = new Set(['#4a2408', '#8a4e14', '#d0902c', '#f6cc5c', '#fff4c0', '#4a2a04', '#8a5208', '#d89a14', '#ffd448', '#fff8d0', '#e0a040'].map(key));
  const AMBER = new Set(['#4a1404', '#8a2c08', '#d85a14', '#ff9a3c', '#ffe0b0'].map(key));
  const bad: string[] = [];
  for (const id of TAKE_IDS) {
    const seen = new Set<string>();
    const finery: number[] = [];
    for (let r = 0; r < 4; r++) {
      const p = paintWeaponItem(id, r as 0);
      const at = `${id} (rarity ${r})`;
      if (p.w !== 32 || p.h !== 32) bad.push(`${at}: ${p.w} by ${p.h}`);
      let rim = 0;
      let blue = 0;
      let gold = 0;
      let amber = 0;
      let painted = 0;
      const sig: string[] = [];
      for (let y = 0; y < 32; y++) for (let x = 0; x < 32; x++) {
        const i = y * 32 + x;
        const a = p.d[i * 4 + 3];
        if (a !== 0 && a !== 255) bad.push(`${at}: half see-through at ${x},${y}`);
        if (!a) continue;
        painted++;
        if (x === 0 || y === 0 || x === 31 || y === 31) bad.push(`${at}: touches its frame at ${x},${y}`);
        const c = pixel(p, i);
        sig.push(c);
        if (ENEMY.has(c)) bad.push(`${at}: the enemy's ${c}`);
        if (CYANS.has(c)) bad.push(`${at}: cyan ${c}`);
        if (c === key(RARITY_COLOR[r])) rim++;
        if (BLUE.has(c)) blue++;
        if (GOLD.has(c)) gold++;
        if (AMBER.has(c)) amber++;
      }
      if (rim < 50) bad.push(`${at}: its rim ${rim} pixels`);
      if (painted < 150) bad.push(`${at}: only ${painted} pixels`);
      if (r === 1 && blue < 6) bad.push(`${at}: no blue`);
      if (r === 2 && gold < 10) bad.push(`${at}: no gold`);
      if (r === 3 && amber < 4) bad.push(`${at}: no orange stones`);
      finery.push(gold + amber + blue);
      seen.add(sig.join(';'));
    }
    if (seen.size !== 4) bad.push(`${id}: its four rarities are not all different`);
    if (!(finery[3] > finery[0])) bad.push(`${id}: the Unique no finer than the Normal`);
  }
  assert.deepEqual(bad, [], 'the items');
});

test('6. the heads turned as he asked: in his guard and at each wind-up the edge or the face points down, in the world and on the screen from all eight sides; on his back down and out; never at his head', () => {
  const bad: string[] = [];
  const said: string[] = [];
  for (const id of TAKE_IDS) {
    const take = TAKES[id];
    for (const hold of holds(id)) {
      // (where the take is and which way its edge or face points is the pose's, whichever side he is seen from)
      const { q, s } = holdBones(hold, take);
      const pl = takePlace(take, KNIGHT_BODY, s, q);
      const way = edgeWay(pl);
      // (the middle of its head, and a point a little on the way its edge or face points)
      const heart = onTake(pl, [take.heart + 5, 0, 0]);
      const on = onTake(pl, [take.heart + 5, 6, 0]);
      const at = `${id} ${hold}`;
      if (!(way[2] < -0.3)) bad.push(`${at}: its edge or face points ${way[2].toFixed(2)} up or down (wanted well down)`);
      const atHead = dot(way, norm(sub(s.head, heart)));
      if (atHead > 0.3) bad.push(`${at}: its edge or face is turned toward his head (${atHead.toFixed(2)})`);
      if (hold === 'cleave' || hold === 'smash') {
        // (toward where the blow will land: on toward the mark, the way he faces)
        if (!(way[0] > 0.5)) bad.push(`${at}: its edge or face is not turned toward the mark (${way[0].toFixed(2)} forward)`);
      }
      if (hold === 'town') {
        // (out from him: to his right, away from his spine)
        if (!(dot(way, s.chest[1]) < -0.5)) bad.push(`${at}: its edge or face is not turned out from him`);
        continue;
      }
      let least = Infinity;
      for (const side of WU_SIDES) {
        const st = turnedStage(stage(WU_SPIN[side].camera, WU_SPIN[side].ax), WU_SPIN[side].spin);
        const down = st.at(on)[1] - st.at(heart)[1];
        least = Math.min(least, down);
        if (!(down > 0)) bad.push(`${at} ${side}: on the screen its edge or face points ${(-down).toFixed(1)} up`);
      }
      if (id === 'axeA' || id === 'hammerA') said.push(`${at} ${way.map((v) => v.toFixed(2)).join(',')} (the least down on the screen ${least.toFixed(1)} of 6)`);
    }
  }
  console.log(`  the way the edge or face points (forward, left, up): ${said.join('; ')}`);
  assert.deepEqual(bad, [], 'an edge or a face not turned down');
});

// ---------------------------------------------------------------------------------------------
// STEP 2: HIS MOVES WITH THE WAR AXE

const MOVE_NAMES = Object.keys(AXE_MOVES);
/** How many pictures each move is (30 a second; a loop, a whole turn of it). */
const LONG: Record<string, number> = { stand: 60, run: 15, cleave: 37, cleave2: 28, throw: 21, braced: 30, catch: 19, twin: 21, twinBraced: 30, twinCatch: 23, chop: AXE_CHOP_END + 1 };
const framesOf = (m: AxeMove): number => Math.round(m.keys[m.keys.length - 1].at / AXE_FRAME) + (m.loop !== undefined ? 0 : 1);

test('7. each move with the war axe is whole: its frames as many as its beats say, him and the axe in each, and the bake\'s lists in the game\'s shape', () => {
  assert.equal(AXE.id, 'axeB', 'his pick: the war axe');
  const bad: string[] = [];
  for (const name of MOVE_NAMES) {
    const m = AXE_MOVES[name];
    if (framesOf(m) !== LONG[name]) bad.push(`${name}: ${framesOf(m)} frames, not ${LONG[name]}`);
    // (its first, its middle and its last picture: him in it, and the axe where the move has it in his hands)
    for (const i of [0, Math.floor(LONG[name] / 2), LONG[name] - 1]) {
      const f = paintAxe(m, i * AXE_FRAME, 'front');
      let painted = 0;
      for (let k = 0; k < f.px.w * f.px.h; k++) if (f.px.d[k * 4 + 3]) painted++;
      if (painted < 1500) bad.push(`${name} f${i}: only ${painted} pixels of him`);
      const p = axePosed(m, i * AXE_FRAME);
      const seen = takeSeen(f);
      if (p.holding.axe && seen.head < 60) bad.push(`${name} f${i}: the axe in his hands, ${seen.head} pixels of its head seen`);
      if (!p.holding.axe && !p.twin && seen.all !== 0) bad.push(`${name} f${i}: his hands empty, ${seen.all} pixels of an axe`);
    }
  }
  // the beats, in thirtieths of a second
  assert.equal(Math.round(AXE_CLEAVE_HIT / AXE_FRAME), 10, 'Cleave lands at 10 frames, as his Strike');
  assert.equal(Math.round(AXE_THROW_OUT / AXE_FRAME), 11, 'the axe leaves his hand at 11');
  assert.deepEqual([AXE_CHOP_LEAP, AXE_CHOP_LAND, AXE_CHOP_END], [5, 20, 42], 'Leaping Chop: he leaves the floor at 5, lands at 20, is in his guard at 42');
  // the lists the bake takes, from one of his sides (each side's are the same lists)
  const set = makeWarriorAxeArt().front;
  const c = set.clips ?? {};
  const got = {
    idle: set.idle.length, walk: set.walk.length, attack: c.attack?.frames.length, attack2: c.attack2?.frames.length, heavy: c.heavy?.frames.length, hold: c.hold?.frames.length,
    release: c.release?.frames.length, leap: c.leap?.frames.length, land: c.land?.frames.length, crouch: c.moves?.chopCrouch.frames.length,
    twinThrow: c.moves?.twinThrow.frames.length, twinBraced: c.moves?.twinBraced.frames.length, twinCatch: c.moves?.twinCatch.frames.length,
  };
  assert.deepEqual(got, { idle: 60, walk: 15, attack: 37, attack2: 28, heavy: 21, hold: 30, release: 19, leap: AXE_LEAP_FRAMES, land: 23, crouch: 6, twinThrow: 21, twinBraced: 30, twinCatch: 23 }, 'the lists');
  assert.ok(Math.abs((c.attack?.hit ?? 0) - 10 / 30) < 1e-6 && Math.abs((c.attack?.poise ?? 0) - 21 / 30) < 1e-6 && c.attack?.tail === true, 'Cleave: its blow, where it waits, its tail');
  assert.ok(Math.abs((c.heavy?.hit ?? 0) - 11 / 30) < 1e-6 && c.hold?.loop === 0, 'the throw: the moment it leaves; braced is a loop');
  assert.ok(Math.abs((c.leap?.fps ?? 0) - 30) < 1e-6 && Math.abs((c.land?.hit ?? -1) - 0) < 1e-6, 'the leap: sixteen pictures over its half second; the landing begins with the blow');
  assert.deepEqual(bad, [], 'a move not whole');
});

test('8. in every frame of every move, from every one of his eight sides: his helm seen; the edge down or toward the mark, never at his head; his hands on the haft; nothing through him', () => {
  const bad: string[] = [];
  const least = new Map<string, { share: number; where: string }>();
  let frames = 0;
  for (const name of MOVE_NAMES) {
    const m = AXE_MOVES[name];
    for (let i = 0; i < LONG[name]; i++) {
      const t = i * AXE_FRAME;
      const p = axePosed(m, t);
      for (const side of WU_SIDES) {
        const f = paintAxe(m, t, side);
        frames++;
        const share = helmSeen(f).share;
        const was = least.get(name);
        if (!was || share < was.share) least.set(name, { share, where: `f${i} ${side}` });
        // (what is through him, his hands and the edge's way are the pose's, the same from every side: said once)
        for (const x of axeFaults(m, t, f, p)) if (/helm/.test(x) || side === 'front') bad.push(`${name} f${i} ${side}: ${x}`);
      }
    }
  }
  console.log(`  ${frames} frames looked at; the least of his helm seen in each move (of what of it faces the eye; ${HELM_LEAST} at least): ${[...least].map(([k, v]) => `${k} ${Math.round(v.share * 100)}% (${v.where})`).join('; ')}`);
  assert.deepEqual(bad.slice(0, 30), [], 'a frame that breaks a rule');
});

test('9. his stand and his run with the axe are the game\'s own, frame for frame: every number of his body and his legs, and in his stand every joint of them where the game\'s has it', () => {
  const ARMS = new Set(['rhIn', 'rhx', 'rhy', 'rhz', 'lhIn', 'lhx', 'lhy', 'lhz', 'le', 're', 'wAz', 'wEl', 'wRoll']);
  for (const [mine, his] of [[AXE_STAND, WU_REAR3.motion.keys], [AXE_RUN, KNIGHT_RUN3.motion.keys]] as const) {
    assert.equal(mine.keys.length, his.length, `${mine.name}: as many keys`);
    his.forEach((k, i) => {
      assert.equal(mine.keys[i].at, k.at, `${mine.name}: key ${i} at the same moment`);
      for (const [f, v] of Object.entries(k.pose)) if (!ARMS.has(f)) assert.equal((mine.keys[i].pose as Record<string, unknown>)[f], v, `${mine.name}: key ${i}, ${f}`);
    });
  }
  // (and on his own stance: his guard's legs)
  for (const f of ['lfx', 'lfy', 'rfx', 'rfy', 'lft', 'rft', 'lk', 'rk', 'yaw', 'twist', 'pz'] as const) assert.equal(AXE_REST[f], WU_REST_OF[f], `his guard with the axe: ${f}`);
  // (his feet, his knees, his hips and his head in every frame of his stand where the game's own stand has them)
  for (let i = 0; i < 60; i++) {
    const s = axePosed(AXE_STAND, i * AXE_FRAME).s;
    const his = wuPosed(WU_REAR3, i * AXE_FRAME).s;
    for (const j of ['toeL', 'toeR', 'heelL', 'heelR', 'kneeL', 'kneeR', 'pelvis', 'neck', 'head'] as const) assert.ok(Math.hypot(s[j][0] - his[j][0], s[j][1] - his[j][1], s[j][2] - his[j][2]) < 1e-6, `standing, f${i}: his ${j} not where the game's stand has it`);
  }
});

test('10. his feet grip the floor: in every move a foot that is down does not slide (the game carries him only on a swing\'s first step and through the leap)', () => {
  const bad: string[] = [];
  let worst = 0;
  for (const name of MOVE_NAMES) {
    if (name === 'run') continue;
    const m = AXE_MOVES[name];
    // (the frames in which the game itself carries him: the skip-step of a cut, the leap)
    const carried = (i: number): boolean => ((name === 'cleave' || name === 'cleave2') && i <= 4) || (name === 'chop' && i > AXE_CHOP_LEAP - 1 && i <= AXE_CHOP_LAND);
    for (let i = 1; i < LONG[name]; i++) {
      if (carried(i)) continue;
      const a = axePosed(m, (i - 1) * AXE_FRAME);
      const b = axePosed(m, i * AXE_FRAME);
      for (const [foot, toe, lift] of [['left', 'toeL', 'lfz'], ['right', 'toeR', 'rfz']] as const) {
        // (a foot is down when its toes are on the floor in both frames: a heel may rise on them)
        if (a.s[toe][2] > 1.6 || b.s[toe][2] > 1.6) continue;
        // (a foot stepping: lifted in either frame by more than a heel's rise takes it)
        const up = (q: typeof a): number => q.q[lift] - (q.q[foot === 'left' ? 'lfp' : 'rfp'] > 0 ? 0.11 * q.q[foot === 'left' ? 'lfp' : 'rfp'] : 0);
        if (up(a) > 1.2 || up(b) > 1.2) continue;
        const slid = Math.hypot(b.s[toe][0] - a.s[toe][0], b.s[toe][1] - a.s[toe][1]);
        worst = Math.max(worst, slid);
        if (slid > 1.5) bad.push(`${name} f${i}: his ${foot} foot slid ${slid.toFixed(1)}`);
      }
    }
  }
  console.log(`  the most a foot that is down moves between two frames: ${worst.toFixed(2)} picture pixels`);
  assert.deepEqual(bad, [], 'a foot that slid');
});

test('11. the thrown axe in the air: twelve pictures, a whole turn, crisp, its edges cyan; the strikes\' smears are the friend\'s cyan and nothing of the enemy\'s', () => {
  const bad: string[] = [];
  assert.equal(AXE_FLY_FRAMES, 12, 'a whole turn in twelve');
  assert.ok(AXE_FLIGHT.far === 6 && AXE_FLIGHT.time === 1, 'six tiles out and back in a second');
  const seen = new Set<string>();
  for (let i = 0; i < AXE_FLY_FRAMES; i++) {
    const p = paintFlying((360 * i) / AXE_FLY_FRAMES).px;
    let cyan = 0;
    let painted = 0;
    const sig: number[] = [];
    for (let k = 0; k < p.w * p.h; k++) {
      const a = p.d[k * 4 + 3];
      if (!a) continue;
      painted++;
      sig.push(k);
      const c = pixel(p, k);
      if (a !== 255 && c !== key(WU_RIM)) bad.push(`in the air, picture ${i}: a pixel half see-through`);
      if (ENEMY.has(c) || GOLD_GLOW.has(c)) bad.push(`in the air, picture ${i}: the enemy's colour ${c}`);
      if (CYANS.has(c)) cyan++;
    }
    if (painted < 300) bad.push(`in the air, picture ${i}: only ${painted} pixels`);
    if (cyan < 30) bad.push(`in the air, picture ${i}: its cyan only ${cyan} pixels`);
    seen.add(sig.join(','));
  }
  // (two bits: half a turn on it is the same axe, so six pictures differ)
  if (seen.size < 6) bad.push(`in the air: only ${seen.size} different pictures`);
  // the smears: each strike's frames from two of his sides
  const strikes: [string, number[]][] = [['cleave', [9, 10, 11]], ['cleave2', [9, 10, 11]], ['throw', [10, 11]], ['catch', [1, 2, 3]], ['twin', [10, 11]], ['chop', [19, 20, 21]]];
  for (const [name, list] of strikes) for (const i of list) for (const side of ['front', 'sideL'] as WuSide[]) {
    const f = paintAxe(AXE_MOVES[name], i * AXE_FRAME, side);
    const p = f.px;
    let smear = 0;
    for (let k = 0; k < p.w * p.h; k++) {
      const a = p.d[k * 4 + 3];
      if (!a) continue;
      const c = pixel(p, k);
      if (a !== 255 && c !== key(WU_RIM)) bad.push(`${name} f${i} ${side}: a pixel half see-through`);
      if (ENEMY.has(c) || GOLD_GLOW.has(c)) bad.push(`${name} f${i} ${side}: the enemy's colour ${c}`);
      // (the smear's sheets: stuffs past the sculpture's own)
      if (f.drawn.stuff[k] >= 1000 && CYANS.has(c)) smear++;
    }
    if (smear < 40 && !(name === 'catch' && i === 3)) bad.push(`${name} f${i} ${side}: its smear only ${smear} pixels`);
    if (bad.length > 20) break;
  }
  assert.deepEqual(bad.slice(0, 20), [], 'the thrown axe and the smears');
});
