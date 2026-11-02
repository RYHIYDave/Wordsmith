// THE CHAINED ONE'S NEW LOOK, THE GAUNT CHAIN-WRAITH (src/art/chained_look.ts, CHAINED_LOOK, off; docs/mockups/chained_look/README.md).
// The owner, 1 Nov 2026, at 21:29: “The chained one is very much just shapes and probably needs more help with his look”; asked which
// look, by 21:31: “Gaunt chain-wraith”. Told him: a real body in place of the tube-and-ball figure; his moves as approved stay the
// same; a picture first.
//   1. the switch off; nothing of the game imports the new look; every frame the game shows of the Chained One, in all three of his
//      states, hashes as it did (the values art/action_f3_chained recorded, tools/action_f3_chained_hash.ts);
//   2. his moves are the approved ones (art/chained_action.ts and the game's own), every key, every ease, every timing, his footwork and
//      his chains, made LOOK_K times as big: his bones are the old ones that much bigger;
//   3. every frame of every move of his, both ways round, in each of his three states: painted, the enemy's pink edge while he lives,
//      crisp, no cyan, nothing cut off;
//   4. THE WHOLE BOSSES' REVIEW (art/boss_checks.ts checkBoss) with his new body: on his bones at the size his moves were approved at,
//      nothing found; at his new size, nothing but five steps of the approved moves themselves, each just over one of the review's
//      lines in the game's pixels only because he is bigger (each is under it at the approved size: the review before);
//   5. taller and thinner: his head higher, his body narrower, his limbs thinner than the old's made as big.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { CO_KIT, coSolids, makeChainedArt3 } from '../src/art/bosses3';
import type { CoFreed } from '../src/art/bosses3';
import { chainedActionMob } from '../src/art/chained_action';
import { CHAINED_LOOK, LOOK_CANVAS, LOOK_K, chainedLookMob, lookShape, lookShapeApproved, lookSolids } from '../src/art/chained_look';
import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import type { Finding } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { deathOfMob, paintMob, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import type { Mob, MobMove } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const crypto = nodeCrypto as { createHash(a: string): { update(d: unknown): { digest(e: string): string }; digest(e: string): string } };

paintWithoutCanvas();

const K = LOOK_K;
const STATES: ReadonlyArray<CoFreed> = [0, 1, 2];

// (the hash of every frame the game shows of a figure, as tools/action_f3_hash.ts makes it)
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  if (s.heavy) out.push(['heavy3', s.heavy]);
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, c[k]!.frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}
function frameHash(sp: Sprite): string {
  const h = crypto.createHash('sha256') as unknown as { update(d: unknown): unknown; digest(e: string): string };
  const p = sp.img as unknown as Px;
  h.update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`);
  h.update(p.d);
  h.update(JSON.stringify(sp.lights ?? []));
  return h.digest('hex').slice(0, 12);
}
function hashOf(art: ActorArt): string {
  const out: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) out[`${view}:${name}`] = fr.map(frameHash);
  return crypto.createHash('sha256').update(JSON.stringify(out)).digest('hex').slice(0, 16);
}

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}
const rimKey = rgba(ENEMY_RIM).slice(0, 3).join(',');
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; edge: boolean } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let cyan: string | null = null;
  let edge = false;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      if (k === rimKey && a === RIM_ALPHA) rim++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge };
}
const moveOf = (mob: Mob, which: string): MobMove | undefined => (which === 'stand' || which === 'walk' || which === 'attack' || which === 'reel' ? mob[which] : which === 'dying' ? mob.dying : mob.more?.[which]);
const LENGTHS = new Set(['px', 'py', 'pz', 'lhx', 'lhy', 'lhz', 'rhx', 'rhy', 'rhz', 'lfx', 'lfy', 'lfz', 'rfx', 'rfy', 'rfz']);

test('1. the switch is off, nothing of the game imports the new look, and the game’s Chained One is every frame as he was', () => {
  assert.equal(CHAINED_LOOK.on, false, 'CHAINED_LOOK is off');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/chained_look.ts') continue;
    assert.ok(!/from ['"][^'"]*(chained_look|chained_look_scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  // (as docs/mockups/action_f3_chained/README.md recorded them, on 76b444b and on art/action-f3)
  const was: Record<CoFreed, string> = { 0: '18277bbf16b90de0', 1: 'f251451c0351c34f', 2: '28ae6fad9aaf4e04' };
  for (const freed of STATES) assert.equal(hashOf(makeChainedArt3(undefined, freed)), was[freed], `the game's Chained One (${freed}): every frame as it was`);
});

test('2. his moves are the approved ones, every key, ease and timing, his footwork and his chains, made LOOK_K times as big', () => {
  for (const freed of STATES) {
    const now = chainedLookMob(freed);
    const was = chainedActionMob(freed);
    assert.equal(movesOf(now).join(), movesOf(was).join(), `${freed}: the same moves`);
    for (const name of movesOf(was)) {
      const a = moveOf(was, name)!;
      const b = moveOf(now, name)!;
      assert.equal(b.motion.keys.length, a.motion.keys.length, `${freed} ${name}: as many keys`);
      assert.equal(b.motion.hit, a.motion.hit, `${freed} ${name}: its blow when it was`);
      assert.equal(b.motion.loop, a.motion.loop, `${freed} ${name}: its loop`);
      a.motion.keys.forEach((ka, i) => {
        const kb = b.motion.keys[i];
        assert.ok(kb.at === ka.at && kb.ease === ka.ease, `${freed} ${name} key ${i}: its moment and its ease`);
        for (const [f, v] of Object.entries(ka.pose)) {
          const w = (kb.pose as Record<string, unknown>)[f];
          if (typeof v === 'number') assert.ok(Math.abs((w as number) - (LENGTHS.has(f) ? v * K : v)) < 1e-9, `${freed} ${name} key ${i}: ${f}`);
          else assert.equal(w, v, `${freed} ${name} key ${i}: ${f}`);
        }
      });
      // (his bones, his feet and his chains at every frame the game shows: the old made as big as he now is)
      for (const t of framesOf(was, name)) {
        const sa = skeletonAt(was, name, t);
        const sb = skeletonAt(now, name, t);
        for (const p of ['head', 'handL', 'handR', 'toeL', 'heelR', 'kneeL', 'pelvis'] as const) assert.ok(Math.hypot(sb[p][0] - K * sa[p][0], sb[p][1] - K * sa[p][1], sb[p][2] - K * sa[p][2]) < 0.15, `${freed} ${name} ${t.toFixed(2)}: his ${p}`);
        const ra = a.ropes?.(t) ?? {};
        const rb = b.ropes?.(t) ?? {};
        for (const [k, v] of Object.entries(ra)) v.forEach((q, i) => assert.ok(Math.hypot(rb[k][i][0] - K * q[0], rb[k][i][1] - K * q[1], rb[k][i][2] - K * q[2]) < 1e-6, `${freed} ${name} ${t.toFixed(2)}: his ${k}`));
      }
    }
  }
});

test('3. every frame of every move of his, both ways round, in each of his three states: painted, the pink edge while he lives, crisp, no cyan, nothing cut off', () => {
  for (const freed of STATES) {
    const mob = chainedLookMob(freed);
    for (const v of ['front', 'back'] as const) {
      for (const name of movesOf(mob)) {
        const ts = framesOf(mob, name);
        for (const t of ts) {
          const p = name === 'dying' ? deathOfMob(mob, t / mob.dieTime, v) : paintMob(mob, name, t, v);
          assert.ok(p.px.w === LOOK_CANVAS.w && p.px.h === LOOK_CANVAS.h, 'on his canvas');
          const l = look(p.px, p.lights);
          const at = `${freed} ${v} ${name} ${t.toFixed(2)}`;
          assert.ok(l.painted > 800, `${at}: only ${l.painted} pixels`);
          if (name !== 'dying') assert.ok(l.rim > 60, `${at}: the pink edge (${l.rim})`);
          assert.equal(l.odd, 0, `${at}: pixels neither see-through nor whole`);
          assert.equal(l.cyan, null, `${at}: a friend's colour`);
          assert.ok(!l.edge, `${at}: cut off at the canvas's edge`);
        }
      }
    }
  }
});

/** The steps of the approved moves that his size takes over the review's lines (in the game's pixels): each is under it at the approved size. */
const BIGGER: ReadonlyArray<readonly [string, string, number]> = [
  ['attack', 'leaps', 2.87], // the finisher: the step as his hips go, just before the strike (4.04 game pixels; the line, 4)
  ['whirl', 'stalls', 1.0], // the gathering ending as the spin begins (2.73 and 5.79 either side; the line, 2.5)
  ['ball', 'stalls', 0.13], // his look round over his shoulder, before he wheels to the ball
  ['walk', 'turns straight back at speed', 0.38], // his head nodding as he lurches (3.3; the line, 3)
  ['breakBall', 'stalls', 0.5], // his hands taking hold of his collar
];
test('4. THE WHOLE BOSSES’ REVIEW with his new body: nothing on his bones as approved; at his new size, only the approved moves’ own steps made bigger', () => {
  for (const freed of STATES) {
    const was = chainedActionMob(freed);
    const found = checkBoss(was, lookShapeApproved(was));
    assert.equal(found.length, 0, `${freed}, on his bones as approved: ${findingsSaid(found).slice(0, 12).join('; ')}`);
    const now = chainedLookMob(freed);
    const shape = lookShape(now);
    assert.ok(shape.handovers?.some((h) => h.from === 'attack' && h.at === 'end' && Math.abs((h.shift?.[0] ?? 0) - 40 * K) < 1e-9), 'the lash ends where his (longer) steps have taken him');
    const big = checkBoss(now, shape);
    const known = (f: Finding): boolean => f.kind === 'jerk' && BIGGER.some(([m, what, t]) => f.move === m && f.what.includes(what) && Math.abs(f.t - t) < 0.02);
    const other = big.filter((f) => !known(f));
    assert.equal(other.length, 0, `${freed}, at his new size: ${findingsSaid(other).slice(0, 12).join('; ')}`);
    for (const f of big) assert.ok(f.by < 4.2, `${freed}: ${f.move} ${f.what} only just over the line (${f.by.toFixed(2)})`);
  }
});

test('5. taller and thinner: his head higher, his body narrower, his limbs thinner than the old’s made as big', () => {
  const was = chainedActionMob(0);
  const now = chainedLookMob(0);
  const sa = skeletonAt(was, 'stand', 0);
  const sb = skeletonAt(now, 'stand', 0);
  assert.ok(sb.head[2] > 1.18 * sa.head[2], `his head ${sb.head[2].toFixed(0)} of his lengths off the floor (the old ${sa.head[2].toFixed(0)})`);
  const old = coSolids(sb);
  const mine = lookSolids(sb);
  // (the old's solids are of the old's sizes: made as big as he now is to compare)
  const oldR = (n: string): number => (old.limbs.find((l) => l.name === n)?.r ?? 0) * K;
  for (const n of ['legL', 'shinL', 'upperL', 'foreL', 'neck', 'head']) assert.ok((mine.limbs.find((l) => l.name === n)?.r ?? 0) < oldR(n) + 1e-9, `his ${n} no thicker than the old's`);
  const chestOld = old.lumps.find((l) => l.name === 'chest')!.h[1];
  const chestNew = mine.lumps.find((l) => l.name === 'chest')!.h[1];
  assert.ok(chestNew < 0.85 * chestOld * K, `his chest ${chestNew.toFixed(1)} across (the old's made as big: ${(chestOld * K).toFixed(1)})`);
  // (and as the review sees him: the same chains, as thick as he is big)
  assert.ok(Math.abs(lookShape(now).things!('stand', 0, sb, posedOfMob(now, 'stand', 0))[0].r - CO_KIT.spec.L.r * K) < 1e-9);
});
