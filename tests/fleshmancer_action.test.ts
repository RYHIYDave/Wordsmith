// THE FLESHMANCER'S MOVES DONE THE ACTION WAY (src/art/fleshmancer_action.ts, FLESH_ACTION, off; what he sends out
// src/art/fleshmancer_action_fx.ts; docs/mockups/action_f5_fleshmancer/README.md). The owner, 31 Oct 2026, of the Fleshmancer: offered
// as "Keep: rings of hands, fire sweeping round him, teleports: already fills his lair"; his rulebook's Monsters 9, Action, like a
// movie (his yes, 1 Nov); and of the last two bosses' first passes, “He needs some work.  I think the action really needs to be
// applied to his moves” and “add the action to all his moves cause he is not intimidating at all”, “pretty lackluster”, “The rakes
// are lackluster”. Under his Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning quick”) and his
// rule for the enemies (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate
// for the extra time the player gets to evade”).
//   1. the switch off; nothing of the game imports the mock-up; his stand, glide, setting off and stopping, struck and death are
//      the game's own; the game's own moves kept;
//   2. THE GAME'S FRAMES THE SAME: every frame the game shows of him, of the mini fleshmancer and of his ring's hands hashes as on
//      the branch this came from (b993034);
//   3. every frame of the new moves (and the mini fleshmancer's fire), from in front and from behind: painted, the enemy's pink
//      edge, crisp, no cyan, nothing cut off;
//   4. THE WHOLE BOSSES' REVIEW (art/boss_checks.ts checkBoss), every frame of every new move, both ways round, each blow of each
//      combo its own, every handing over: nothing found (the mini fleshmancer: nothing the game's own fire does not show too);
//   5. Movement 9 and the numbers: each blow held, struck in two frames, smeared then only; bigger, faster, wider than the old;
//   6. what he sends out: crisp, no cyan, the enemy's pink, nothing cut off, nothing after.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import {
  FIRE_HIT, FIRE_LONG, FIRE_STOP, FIRE_STRIKE, FLESH_ACTION, FM_ACT_MOVES, FM_ACT_SHAPE, FM_ACT_SHAPE_UNDER, FM_ACT_STRIKES, MINI_HIT, MINI_LONG, MINI_STOP, MINI_STRIKE, MINI_ACT_LOOK, MINI_WHIP,
  RAISE_HIT, RAISE_STRIKE, RING_HITS, RING_STRIKES, RISE_HIT, RISE_STRIKE, SHARD_HITS, SHARD_STRIKES, SINK_HIT, SINK_STRIKE, WHIP, fireWay,
  fleshmancerActionMob, fmSmeared, makeFleshmancerActionArt, miniActionMob, miniHands, miniSmeared, miniWay,
} from '../src/art/fleshmancer_action';
import { FIRE, MINI_FIRE, RINGS, RISE_MARK, SHARDS, fireLanes, fireStrikes, paintFire, paintHeap, paintRingCracks, paintRiseMark, paintShards, paintSinkPit, ringBurst, ringHands, ringStrikes, shardsAt } from '../src/art/fleshmancer_action_fx';
import type { At } from '../src/art/fleshmancer_action_fx';
import { FLESHMANCER, FM_FIRE, FM_RINGS, FM_SHARDS, fmSolids, staffOf, withFmLook } from '../src/art/fleshmancer';
import { MINI_FM, MINI_FM_LOOK, MINI_K } from '../src/art/cultists';
import { FLESHMANCER as RULES, MINIFM } from '../src/game/bosses';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import type { BossShape } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { paintMob, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { project } from '../src/art/skeleton';
import type { Skeleton, V3 } from '../src/art/skeleton';
import { Px, rgba } from '../src/engine/px';
import { FM_HAND_KINDS, makeFleshmancerArt3, makeRingHandArt } from '../src/art/fleshmancer';
import { makeMiniFleshmancerArt3 } from '../src/art/cultists';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
interface Hasher {
  update(d: string | Uint8ClampedArray): Hasher;
  digest(e: 'hex'): string;
}
const sha = (): Hasher => (nodeCrypto as { createHash(a: string): Hasher }).createHash('sha256');
// (as tools/action_f3_hash.ts and tools/action_f5_fm_hash.ts hash them: every frame of every move, both ways round)
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
function frameHash(sp: Sprite, density = true): string {
  const p = sp.img as unknown as Px;
  return sha().update(density ? `${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};` : `${p.w}x${p.h}@${sp.ax},${sp.ay};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).digest('hex').slice(0, 12);
}
function hashMoves(art: ActorArt): string {
  const out: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) out[`${view}:${name}`] = fr.map((sp) => frameHash(sp));
  return sha().update(JSON.stringify(out)).digest('hex').slice(0, 16);
}
function fmHashes(): { fleshmancer: string; mini: string; hands: string } {
  const hands: Record<string, string[]> = {};
  for (const v of ['front', 'back'] as const) for (let k = 0; k < FM_HAND_KINDS; k++) hands[`${v}:${k}`] = makeRingHandArt(v, k).map((sp) => frameHash(sp, false));
  return { fleshmancer: hashMoves(makeFleshmancerArt3()), mini: hashMoves(makeMiniFleshmancerArt3()), hands: sha().update(JSON.stringify(hands)).digest('hex').slice(0, 16) };
}


paintWithoutCanvas();

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
const pinkKeys = new Set([FLAME[1], FLAME[2], FLAME[3]].map((c) => rgba(c).slice(0, 3).join(',')));
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; pink: number; edge: boolean } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let pink = 0;
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
      if (pinkKeys.has(k)) pink++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, pink, edge };
}
const moveOf = (name: string) => {
  const mob = fleshmancerActionMob();
  return name === 'attack' ? mob.attack : mob.more![name];
};
const longOf = (name: string): number => {
  const k = moveOf(name).motion.keys;
  return k[k.length - 1].at;
};
/** The mini fleshmancer as the checks see him (the game has no shape of his own for them): his master's, at his size. */
function miniShape(): BossShape {
  const H = MINI_FM_LOOK.hood;
  const body = (s: Skeleton) => {
    const b = fmSolids(s);
    return {
      limbs: b.limbs.map((l) => ({ ...l, r: l.r * MINI_K })),
      lumps: b.lumps.map((l) => (l.name === 'hood' ? { ...l, c: [0, 1, 2].map((k) => s.head[k] + s.face[0][k] * H.fwd + s.face[2][k] * H.up) as unknown as V3, h: H.r } : { ...l, h: l.h.map((v) => v * MINI_K) as unknown as V3 })),
    };
  };
  return { body, tip: (_m, _t, s) => miniHands(s), strikes: { attack: MINI_STRIKE }, smeared: miniSmeared, handovers: [{ from: 'stand', at: 0, to: 'attack', toAt: 0 }, { from: 'attack', at: 'end', to: 'stand', toAt: 0 }] };
}

test('1. the switch is off, nothing of the game imports the mock-up, the rest of him is the game’s own and the game’s moves are kept', () => {
  assert.equal(FLESH_ACTION.on, false, 'FLESH_ACTION is off');
  const mock = ['art/fleshmancer_action.ts', 'art/fleshmancer_action_fx.ts'];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || mock.includes(f)) continue;
    assert.ok(!/from ['"][^'"]*(fleshmancer_action|fleshmancer_action_fx|action_f5_fm_scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  const mob = fleshmancerActionMob();
  for (const m of ['stand', 'walk', 'reel', 'dying'] as const) assert.ok(mob[m] === FLESHMANCER[m], `his ${m} is the game's own`);
  for (const m of ['setOff', 'halt']) assert.ok(mob.more?.[m] === FLESHMANCER.more?.[m], `his ${m} is the game's own`);
  for (const m of FM_ACT_MOVES) assert.ok(moveOf(m) !== (m === 'attack' ? FLESHMANCER.attack : FLESHMANCER.more?.[m]), `his ${m} is the new one`);
  // (the game's own, kept as they were)
  assert.equal(FLESHMANCER.attack.motion.hit, FM_SHARDS.hit);
  assert.equal(FM_SHARDS.long, 1.4);
  assert.equal(FM_RINGS.hit, 0.86);
  assert.equal(FM_FIRE.stop, 3.9);
  const mini = miniActionMob();
  assert.ok(mini.attack !== MINI_FM.attack && mini.more === MINI_FM.more && mini.stand === MINI_FM.stand && mini.dying === MINI_FM.dying, 'the mini fleshmancer: only his fire is new');
  const art = makeFleshmancerActionArt();
  assert.ok(art.front.clips?.moves?.rings && art.back.clips?.moves?.rise && art.front.clips?.attack, 'as the game holds a monster');
});

test('2. THE GAME’S FRAMES THE SAME: every frame the game shows of him, of the mini fleshmancer and of his ring’s hands', () => {
  // (made on b993034, before this branch's one change to art/fleshmancer.ts: tools/action_f5_fm_hash.ts)
  const h = fmHashes();
  assert.equal(h.fleshmancer, '1ce4c1881a2b2fbd', 'the Fleshmancer');
  assert.equal(h.mini, '7ad1f87dba37b42c', 'the mini fleshmancer');
  assert.equal(h.hands, '3d68e732d33a9315', 'the hands of his rings');
});

test('3. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const mob = fleshmancerActionMob();
  const mini = miniActionMob();
  for (const v of ['front', 'back'] as const) {
    for (const [who, name] of [...FM_ACT_MOVES.map((m) => [mob, m] as const), [mini, 'attack'] as const]) {
      const k = (name === 'attack' ? who.attack : who.more![name]).motion.keys;
      const n = Math.round(k[k.length - 1].at * 30);
      for (let i = 0; i <= n; i++) {
        const t = i / 30;
        const p = paintMob(who, name, t, v);
        const l = look(p.px, p.lights);
        const tag = `${who === mini ? 'mini ' : ''}${v} ${name} ${i}`;
        // (his teleport: under the floor he is nowhere, nothing of him painted)
        const under = (name === 'sink' && skeletonAt(who, name, t).head[2] < -10) || (name === 'rise' && skeletonAt(who, name, t).head[2] < -10);
        if (!under) {
          assert.ok(l.painted > (who === mini ? 400 : 800), `${tag}: only ${l.painted} pixels`);
          assert.ok(l.rim > 20, `${tag}: the pink edge (${l.rim})`);
        }
        assert.equal(l.odd, 0, `${tag}: pixels neither see-through nor whole`);
        assert.equal(l.cyan, null, `${tag}: a friend's colour`);
        assert.ok(!l.edge, `${tag}: cut off at the canvas's edge`);
      }
    }
  }
});

test('4. THE WHOLE BOSSES’ REVIEW: every frame of every new move, both ways round, each blow its own, every handing over: nothing found', () => {
  const mob = fleshmancerActionMob();
  assert.equal(FM_ACT_SHAPE.blows?.attack?.length, 2, 'the shards: two fans');
  assert.equal(FM_ACT_SHAPE.blows?.rings?.length, 2, 'the rings: two slams');
  const found = checkBoss(mob, FM_ACT_SHAPE, ['attack', 'rings', 'raise', 'fire']);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
  // (his teleport, dragged under the floor and pushed up through it, as the game's is reviewed: FM_SHAPE_UNDER)
  const under = checkBoss(mob, FM_ACT_SHAPE_UNDER, ['sink', 'rise']);
  assert.equal(under.length, 0, findingsSaid(under).slice(0, 12).join('; '));
  // THE MINI FLESHMANCER: the game has no shape of his for the checks; under his master's at his size, his new fire shows nothing
  // the game's own does not (his arms pass the stand-in hood's solid, in his game's fire too), and none of its jerks or its blow
  const kinds = (fs2: ReturnType<typeof checkBoss>): Set<string> => new Set(fs2.map((x) => `${x.kind}:${x.what.replace(/\(.*\)/, '').replace(/[0-9.]+/g, '#').trim()}`));
  const old = withFmLook(MINI_FM_LOOK, () => checkBoss(MINI_FM, { ...miniShape(), strikes: undefined }, ['attack']));
  const now = withFmLook(MINI_ACT_LOOK, () => checkBoss(miniActionMob(), miniShape(), ['attack']));
  const oldK = kinds(old);
  for (const k of kinds(now)) assert.ok(oldK.has(k) && k.startsWith('arm:'), `the mini fleshmancer's fire: ${k}`);
  assert.ok(!now.some((x) => x.kind === 'jerk' || x.kind === 'blow' || x.kind === 'strike' || x.kind === 'jump'), 'no jerk, no weak blow, its strike a flash');
});

test('5. Movement 9: each blow held, struck in two frames, smeared then only; bigger, faster and wider than his old moves', () => {
  const mob = fleshmancerActionMob();
  const seen = (p: V3): [number, number] => {
    const r = project(p, 'front');
    return [r[0] / 2, r[1] / 2];
  };
  const tipOf = (move: string, t: number): V3 => {
    const s = skeletonAt(mob, move, t);
    return move === 'rings' ? s.handL : staffOf(s).skull;
  };
  for (const [move, strikes] of Object.entries(FM_ACT_STRIKES)) {
    for (const { s: [s0, s1] } of strikes) {
      assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: a strike of two frames`);
      let most = 0;
      for (let f = Math.round(s0 * 30) - 6; f < Math.round(s0 * 30) - 1; f++) {
        const a = seen(tipOf(move, f / 30));
        const b = seen(tipOf(move, (f + 1) / 30));
        most = Math.max(most, Math.hypot(b[0] - a[0], b[1] - a[1]));
      }
      const a = seen(tipOf(move, s0));
      const b = seen(tipOf(move, s1));
      const flash = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2;
      assert.ok(most < 1.5, `${move} at ${s0.toFixed(2)} s: held before it (${most.toFixed(1)} game pixels a frame at most)`);
      assert.ok(flash > 4 * most && flash > 5, `${move} at ${s0.toFixed(2)} s: struck in a flash (${flash.toFixed(1)} a frame)`);
      for (const f of [1, 2, 3]) assert.ok(fmSmeared(move, s0 + f / 30), `${move}: smeared ${f} frames on`);
      assert.ok(!fmSmeared(move, s0) && !fmSmeared(move, s0 - 1 / 30) && !fmSmeared(move, s1 + 2 / 30), `${move}: smeared only then`);
      const ropes = moveOf(move).ropes!;
      assert.ok(Object.keys(ropes(s0 + 1 / 30)).some((k) => k.startsWith('smear')) && !Object.keys(ropes(s0 - 0.2)).some((k) => k.startsWith('smear')), `${move}: its after-images there, and only there`);
    }
  }
  assert.ok(SHARD_HITS.every((h, i) => h === SHARD_STRIKES[i][1]) && RING_HITS.every((h, i) => h === RING_STRIKES[i][1]) && FIRE_HIT === FIRE_STRIKE[1] && RAISE_HIT === RAISE_STRIKE[1] && SINK_HIT === SINK_STRIKE[1] && RISE_HIT === RISE_STRIKE[1] && MINI_HIT === MINI_STRIKE[1], 'each blow lands on the last frame of its strike');
  // HELD: each wind-up held at least a fifth of a second before its strike (the warning)
  for (const [move, s0, from] of [['attack', SHARD_STRIKES[0][0], 14], ['attack', SHARD_STRIKES[1][0], 44], ['rings', RING_STRIKES[0][0], 16], ['rings', RING_STRIKES[1][0], 52], ['fire', FIRE_STRIKE[0], 14], ['raise', RAISE_STRIKE[0], 22], ['sink', SINK_STRIKE[0], 10], ['rise', RISE_STRIKE[0], 0]] as const) {
    assert.ok(s0 - from / 30 >= 0.2 - 1e-6, `${move}: held ${(s0 - from / 30).toFixed(2)} s`);
  }
  // THE SHARDS: two fans (9 and 8; old 7), the second in the first one's gaps; faster (15 tiles a second; old 9); drawn up and hung before they fly
  assert.equal(SHARDS.fan[0] + SHARDS.fan[1], 17);
  assert.ok(SHARDS.speed > 1.6 * RULES.shards.speed && SHARDS.reach >= RULES.shards.reach, 'faster, as far');
  const fans = shardsAt(SHARD_HITS[1] - 0.05, 0);
  const a0 = fans.filter((s) => s.fan === 0).map((s) => Math.atan2(s.y, s.x)).sort((a, b) => a - b);
  const a1 = shardsAt(SHARD_HITS[1] - 0.05, 0).filter((s) => s.fan === 1).map((s) => s.a).sort((a, b) => a - b);
  assert.ok(a1.length === 8 && a1.every((a, j) => Math.abs(a - (j - 3.5) * SHARDS.apart * (Math.PI / 180)) < 1e-9), 'the second fan in the first one’s gaps');
  assert.ok(a0.length === 9, 'the first fan flying as the second hangs');
  assert.ok(shardsAt(SHARD_HITS[0] - 0.1, 0).filter((s) => s.state === 'hanging').length === 9, 'the first fan hangs, aimed, before it flies');
  // THE RINGS: five, out to 6.2 tiles (old: three, to 4.3); every other ring at each slam; gaps in each
  assert.equal(RINGS.radii.length, 5);
  assert.ok(RINGS.radii[4] > 1.4 * RULES.rings.laid[2][0], 'out to the walls');
  assert.ok(ringBurst(0) === RING_HITS[0] && ringBurst(1) === RING_HITS[1] && ringBurst(2) > RING_HITS[0] && ringBurst(2) < RING_HITS[1], 'every other ring at each slam');
  for (let i = 0; i < 5; i++) {
    const h = ringHands(i);
    assert.ok(h.n - h.hands.length >= 6 && h.hands.length >= 8, `ring ${i}: ${h.hands.length} hands, its gaps`);
    const g = h.gaps[0];
    assert.ok(!ringStrikes(i, Math.cos(g) * RINGS.radii[i], Math.sin(g) * RINGS.radii[i]), `ring ${i}: its gap is a way through`);
    assert.ok(ringStrikes(i, Math.cos(h.hands[0].a) * RINGS.radii[i], Math.sin(h.hands[0].a) * RINGS.radii[i]), `ring ${i}: a hand strikes`);
  }
  // THE FIRE: whipped round once and more in 1.2 s (old: once round in 3.3 s); out to 7 tiles (old 4.8); the floor left burning
  assert.ok(FIRE_STOP - FIRE_HIT <= 1.21 && WHIP.round >= 2 * Math.PI, `a turn and more in ${(FIRE_STOP - FIRE_HIT).toFixed(2)} s`);
  assert.ok(FIRE.reach > 1.4 * RULES.fire.reach && FIRE.half >= RULES.fire.half, 'out further, as wide');
  assert.ok(Math.abs((fireWay(FIRE_STOP) as number) - (WHIP.from + WHIP.round)) < 1e-9 && fireWay(FIRE_HIT - 0.05) === null, 'its whip');
  const lanes = fireLanes();
  assert.ok(lanes.length >= 9 && lanes.every((l, i) => i === 0 || l.at > lanes[i - 1].at), `${lanes.length} lanes, in turn`);
  assert.ok(fireStrikes(lanes[3].at + 1.0, Math.cos(lanes[3].a) * 4, Math.sin(lanes[3].a) * 4) && !fireStrikes(lanes[3].at + FIRE.burn + 0.1, Math.cos(lanes[3].a) * 4, Math.sin(lanes[3].a) * 4), 'a lane burns, and goes out');
  assert.ok(!fireStrikes(lanes[3].at + 1.0, Math.cos(lanes[3].a + FIRE.every / 2) * 4, Math.sin(lanes[3].a + FIRE.every / 2) * 4), 'between the lanes, no fire');
  // THE TELEPORT: where he rises marked a second before; the burst all round
  assert.ok(RISE_MARK.warn >= 0.9 && RISE_MARK.r >= 2, 'marked first; a burst all round');
  // THE MINI FLESHMANCER: his whip across in 0.6 s (old 1.5), out to 3.6 tiles (old 2.6), the floor left burning
  assert.ok(MINI_STOP - MINI_HIT <= 0.61 && MINI_WHIP.round > 2.2 && MINI_FIRE.reach > 1.3 * MINIFM.fire.reach, 'the mini fleshmancer: faster, further');
  assert.ok(Math.abs((miniWay(MINI_STOP) as number) - (MINI_WHIP.from + MINI_WHIP.round)) < 1e-9 && MINI_LONG < 2.8, 'his whip');
  assert.ok(FIRE_LONG > 3 && posedOfMob(mob, 'fire', FIRE_HIT).prop === 4, 'his fire');
});

test('6. what he sends out: crisp, no cyan, the enemy’s pink, nothing cut off, nothing after', () => {
  const W = 1500;
  const H = 900;
  const at: At = (x, y, z = 0) => [W / 2 + 32 * (x - y), H / 2 + 16 * (x + y) - z];
  const check = (name: string, paint: (p: Px) => void, empty = false, pinkToo = true): void => {
    const p = new Px(W, H);
    paint(p);
    const l = look(p);
    if (empty) {
      assert.equal(l.painted, 0, `${name}: nothing after`);
      return;
    }
    assert.ok(l.painted > 40, `${name}: painted (${l.painted})`);
    if (pinkToo) assert.ok(l.pink > 10, `${name}: the enemy's pink (${l.pink})`);
    assert.equal(l.odd, 0, `${name}: crisp`);
    assert.equal(l.cyan, null, `${name}: no cyan`);
    assert.ok(!l.edge, `${name}: nothing cut off`);
  };
  const C: [number, number] = [0, 0];
  for (const t of [0.3, 0.6, SHARD_HITS[0] + 0.1, 1.3, SHARD_HITS[1] + 0.2, SHARD_HITS[1] + 0.62]) {
    // (the floor under them: their lanes in his pink while they hang; only their shadows as they fly)
    check(`shards floor ${t.toFixed(2)}`, (p) => paintShards(p, at, t, C, 0.4, 'floor'), t > SHARD_HITS[1] + 0.6, t < SHARD_HITS[0] || (t > 1.25 && t < SHARD_HITS[1]));
    check(`shards air ${t.toFixed(2)}`, (p) => paintShards(p, at, t, C, 0.4, 'air'));
  }
  check('shards after', (p) => paintShards(p, at, SHARD_HITS[1] + 1.5, C, 0.4, 'air'), true);
  // (lit in his pink until the hands are up; then dark cracks, cooling, and gone)
  for (const t of [0.4, 1.0, RING_HITS[0] + 0.05, RING_HITS[1] + 0.05, RING_HITS[1] + 1.0]) check(`rings ${t.toFixed(2)}`, (p) => paintRingCracks(p, at, t, C, 0), false, t < RING_HITS[1] + 0.5);
  check('rings after', (p) => paintRingCracks(p, at, RING_HITS[1] + 2.0, C, 0), true);
  const mouth: [number, number] = [W / 2, H / 2 - 70];
  for (const mini of [false, true]) {
    const [h, s] = mini ? [MINI_HIT, MINI_STOP] : [FIRE_HIT, FIRE_STOP];
    for (const t of [h + 0.05, (h + s) / 2, s, s + 1.0]) {
      check(`${mini ? 'mini ' : ''}fire air ${t.toFixed(2)}`, (p) => paintFire(p, at, t, C, 0.3, t <= s ? mouth : null, 'air', mini));
      check(`${mini ? 'mini ' : ''}fire floor ${t.toFixed(2)}`, (p) => paintFire(p, at, t, C, 0.3, null, 'floor', mini), false, false);
    }
    const S = mini ? MINI_FIRE : FIRE;
    check(`${mini ? 'mini ' : ''}fire after`, (p) => {
      paintFire(p, at, s + S.burn + S.scorch + 0.1, C, 0.3, null, 'floor', mini);
      paintFire(p, at, s + S.burn + S.scorch + 0.1, C, 0.3, null, 'air', mini);
    }, true);
  }
  for (const t of [RAISE_HIT - 0.3, RAISE_HIT + 0.05, RAISE_HIT + 0.3]) {
    check(`heap floor ${t.toFixed(2)}`, (p) => paintHeap(p, at, t, [1, 1], 0, 'floor'));
    // (its flash his pink; the bone and grave dirt thrown after it, bone and dirt)
    if (t > RAISE_HIT) check(`heap air ${t.toFixed(2)}`, (p) => paintHeap(p, at, t, [1, 1], 0, 'air'), false, t < RAISE_HIT + 0.1);
  }
  check('heap after', (p) => paintHeap(p, at, RAISE_HIT + 1.0, [1, 1], 0, 'air'), true);
  for (const t of [0.2, 0.6]) check(`sink pit ${t}`, (p) => paintSinkPit(p, at, t, C));
  for (const m of [-0.8, -0.3, 0.05, 0.2]) {
    check(`rise mark floor ${m}`, (p) => paintRiseMark(p, at, m, C, 'floor'));
    if (m > 0) check(`rise burst ${m}`, (p) => paintRiseMark(p, at, m, C, 'air'));
  }
  check('rise after', (p) => {
    paintRiseMark(p, at, 1.0, C, 'floor');
    paintRiseMark(p, at, 1.0, C, 'air');
  }, true);
});
