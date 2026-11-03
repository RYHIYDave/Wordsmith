// THE PHYSICIAN'S MOVES DONE THE ACTION WAY (src/art/physician_action.ts, PHYSICIAN_ACTION, off; what he sends out
// src/art/physician_action_fx.ts; docs/mockups/action_f14_physician/README.md). The owner's review of every enemy, 31 Oct 2026:
// offered Ether, he asked “Anything unique we can do?”; offered Diagnosis (a brass lens's light tracking you, filling a mark; break its
// line behind beds and pillars; full, he operates, one huge strike) or Stitches, he answered “Diagnosis (Recommended)”. Under his
// Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning quick”) and his rule for the enemies (“Start
// from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player
// gets to evade”), and his rulebook's Monsters 9, Action, like a movie.
//   1. the switch off; nothing of the game imports the mock-up; his stand, walk, struck and death are the game's own; the tonic gone
//      for the Diagnosis and his operation; the game's own moves kept;
//   2. THE GAME'S FRAMES THE SAME: every frame the game shows of him, and what it draws of his moves, hash as on 71e08ef;
//   3. every frame of the new moves, from in front and from behind: painted, the enemy's pink edge, crisp, no cyan, nothing cut off;
//   4. THE WHOLE BOSSES' REVIEW (art/boss_checks.ts checkBoss), every frame of every new move, both ways round, each rap of his rounds
//      its own, every handing over (the Diagnosis's look into his operation at any frame of it): nothing found;
//   5. Movement 9 and the numbers: each blow held, struck in two frames, smeared then only; bigger and further than the old;
//   6. what he sends out: crisp, no cyan, the enemy's pink, nothing cut off, nothing after; THE DIAGNOSIS: the beam's line broken by a
//      bed and a pillar, the mark filling in the light and draining in hiding, the beam following, the field struck.
//   7. (2 Nov) the owner: “It needs a little more excitement, and the meter needs to fill faster”; the mark full in 1.4 s (was 2.2); his
//      pick “Bigger operation”: the theatre plunged dark, one spotlight on you, his instruments ringed round it HELD, closing in from all
//      round in two frames with the strike, the light back after; every frame of it crisp, no cyan, the enemy's pink, nothing cut off.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import {
  DIAG, DRAW9, DRAW9_HIT, DRAW9_HOLD, DRAW9_STRIKE, OP_HIT, OP_HOLD, OP_STRIKE, PHYSICIAN_ACTION, PH_ACT_CANVAS, PH_ACT_MOVES, PH_ACT_SHAPE, PH_ACT_STRIKES, RAP9_HIT, RAP9_HOLD,
  RAP9_STRIKE, ROUNDS9_HITS, ROUNDS9_HOLD, ROUNDS9_STRIKES, lensAt, makePhysicianActionArt, phSmeared, physicianActionMob, tilesOf, tipAt,
} from '../src/art/physician_action';
import type { ActMove } from '../src/art/physician_action';
import { BEAM, BEAM_FILL_WAS, ESCAPE, FIELD, LUNGE, OPERATION, RAP, RINGS, TOOL_KINDS, blocked, diagnosis, drawStrikes, fieldStrikes, inLight, isoAt, litRGB, opDark, opLight, paintBeam, paintDial, paintDraw, paintField, paintMark, paintRap, paintRounds, paintSpotCone, paintSpotEdge, paintTools, rapStrikes, ringAt, ringStrikes, toolsAt } from '../src/art/physician_action_fx';
import type { Cover } from '../src/art/physician_action_fx';
import { PHYSICIAN, PH_DRAW, PH_RAP, PH_ROUNDS, PH_TONIC, makePhysicianArt } from '../src/art/physician_moves';
import { ROUNDS_RING_REACH, drawCaneRap, drawDrawAim, drawHeldWord, drawHushCloud, drawPhialFlight, drawRoundsRing, drawWordFreed } from '../src/art/physician_shots';
import '../src/game/bosses';
import { PHYSICIAN as RULES } from '../src/game/act1_rules/physician';
import { checkBoss, findingsSaid } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { paintMob } from '../src/art/new_mobs3';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { Px, rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { PxCtx } from '../src/dev/action_f3_scene';
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
// (as tools/physician_action_hash.ts hashes them: every frame of every move, both ways round; and what the game draws of his moves)
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
  const p = sp.img as unknown as Px;
  return sha().update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).digest('hex').slice(0, 12);
}
function hashMoves(art: ActorArt): string {
  const out: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) out[`${view}:${name}`] = fr.map((sp) => frameHash(sp));
  return sha().update(JSON.stringify(out)).digest('hex').slice(0, 16);
}
function shotsHash(): string {
  const h = sha();
  const at = (x: number, y: number): [number, number] => [300 + 32 * (x - y), 200 + 16 * (x + y)];
  for (let t = 0; t <= 4.2; t += 0.1) {
    const p = new Px(640, 420);
    const g = new PxCtx(p, 1) as unknown as CanvasRenderingContext2D;
    drawCaneRap(g, at, 1, 0, t);
    drawDrawAim(g, at, 0, 0, 2, 0, Math.min(1, t), t);
    drawHeldWord(g, 300, 120, 'fire', t);
    drawWordFreed(g, 300, 120, 420, 260, 'frost', t);
    drawPhialFlight(g, at, 0, 0, 3, 1, t, 1.7);
    drawHushCloud(g, at, 3, -1, t, 2);
    drawRoundsRing(g, at, -2, 1, t);
    h.update(p.d);
  }
  return h.digest('hex').slice(0, 16);
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
      const grey = p.d[i] === p.d[i + 1] && p.d[i + 1] === p.d[i + 2];
      if (!cyan && ((FRIEND.has(k) && !grey) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, pink, edge };
}
const moveOf = (name: string) => {
  const mob = physicianActionMob();
  return name === 'attack' ? mob.attack : mob.more![name];
};
const longOf = (name: string): number => {
  const k = moveOf(name).motion.keys;
  return k[k.length - 1].at;
};

test('1. the switch is off, nothing of the game imports the mock-up, the rest of him is the game’s own and the game’s moves are kept', () => {
  assert.equal(PHYSICIAN_ACTION.on, false, 'PHYSICIAN_ACTION is off');
  const mock = ['art/physician_action.ts', 'art/physician_action_fx.ts'];
  // (brought in by the main chat, 2 Nov 2026, behind the switch: his figure, his rules, what he draws, the dark of his operation)
  const BRINGS = ['art/act1_figs/physician.ts', 'game/act1_rules/physician.ts', 'render/act1_fx/physician.ts', 'render/render.ts'];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || mock.includes(f) || BRINGS.includes(f)) continue;
    assert.ok(!/from ['"][^'"]*(physician_action|physician_action_fx|physician_action_scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  const mob = physicianActionMob();
  for (const m of ['stand', 'walk', 'reel', 'dying'] as const) assert.ok(mob[m] === PHYSICIAN[m], `his ${m} is the game's own`);
  for (const m of PH_ACT_MOVES) assert.ok(moveOf(m) !== (m === 'attack' ? PHYSICIAN.attack : PHYSICIAN.more?.[m]), `his ${m} is the new one`);
  assert.ok(!mob.more?.tonic && PHYSICIAN.more?.tonic, 'the tonic gone for the Diagnosis (the game\'s own kept)');
  // (the game's own, kept as they were)
  assert.equal(PH_RAP.hit, 0.6);
  assert.equal(PH_DRAW.hit, 27 / 30);
  assert.equal(PH_TONIC.hit, 25 / 30);
  assert.equal(PH_ROUNDS.raps.join(), '0.62,0.92,1.22');
  const art = makePhysicianActionArt();
  assert.ok(art.front.clips?.moves?.diagnose && art.back.clips?.moves?.operate && art.front.clips?.moves?.rounds && art.front.clips?.attack, 'as the game holds a monster');
});

test('2. THE GAME’S FRAMES THE SAME: every frame the game shows of him, and what it draws of his moves', () => {
  // (made on 71e08ef, the branch this one came from, which this branch changes no file of the game's: tools/physician_action_hash.ts)
  assert.equal(hashMoves(makePhysicianArt()), 'a760e8052487ba6c', 'the Physician');
  assert.equal(shotsHash(), '0b3243670d124c61', 'what the game draws of his moves');
});

test('3. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const mob = physicianActionMob();
  for (const v of ['front', 'back'] as const) {
    for (const name of PH_ACT_MOVES) {
      const n = Math.round(longOf(name) * 30);
      for (let i = 0; i <= n; i++) {
        const p = paintMob(mob, name, i / 30, v);
        assert.equal(`${p.px.w}x${p.px.h}`, `${PH_ACT_CANVAS.w}x${PH_ACT_CANVAS.h}`);
        const l = look(p.px, p.lights);
        const tag = `${v} ${name} ${i}`;
        assert.ok(l.painted > 1200, `${tag}: only ${l.painted} pixels`);
        assert.ok(l.rim > 60, `${tag}: the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${tag}: pixels neither see-through nor whole`);
        assert.equal(l.cyan, null, `${tag}: a friend's colour`);
        assert.ok(!l.edge, `${tag}: cut off at the canvas's edge`);
      }
    }
  }
});

test('4. THE WHOLE BOSSES’ REVIEW: every frame of every new move, both ways round, each rap its own, every handing over: nothing found', () => {
  assert.equal(PH_ACT_SHAPE.blows?.rounds?.length, 3, 'the rounds: three raps');
  assert.ok((PH_ACT_SHAPE.handovers ?? []).filter((h) => h.from === 'diagnose' && h.to === 'operate').length >= 40, 'from every frame of the look into his operation');
  const found = checkBoss(physicianActionMob(), PH_ACT_SHAPE, [...PH_ACT_MOVES]);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('5. Movement 9: each blow held, struck in two frames, smeared then only; bigger and further than his old moves', () => {
  const seen = (p: V3): [number, number] => {
    const r = project(p, 'front');
    return [r[0] / 2, r[1] / 2];
  };
  for (const [move, strikes] of Object.entries(PH_ACT_STRIKES)) {
    for (const [s0, s1] of strikes) {
      assert.equal(Math.round((s1 - s0) * 30), 2, `${move}: a strike of two frames`);
      let most = 0;
      for (let f = Math.round(s0 * 30) - 3; f < Math.round(s0 * 30); f++) {
        const a = seen(tipAt(move as ActMove, f / 30));
        const b = seen(tipAt(move as ActMove, (f + 1) / 30));
        most = Math.max(most, Math.hypot(b[0] - a[0], b[1] - a[1]));
      }
      const a = seen(tipAt(move as ActMove, s0));
      const b = seen(tipAt(move as ActMove, s1));
      const flash = Math.hypot(b[0] - a[0], b[1] - a[1]) / 2;
      assert.ok(most < 1.6, `${move} at ${s0.toFixed(2)} s: held before it (${most.toFixed(1)} game pixels a frame at most)`);
      assert.ok(flash > 4 * most && flash > 8, `${move} at ${s0.toFixed(2)} s: struck in a flash (${flash.toFixed(1)} a frame)`);
      for (const f of [1, 2, 3]) assert.ok(phSmeared(move, s0 + f / 30), `${move}: smeared ${f} frames on`);
      assert.ok(!phSmeared(move, s0) && !phSmeared(move, s0 - 1 / 30) && !phSmeared(move, s1 + 2 / 30), `${move}: smeared only then`);
      const ropes = moveOf(move).ropes!;
      assert.ok(Object.keys(ropes(s0 + 1 / 30)).some((k) => k.startsWith('smear')) && !Object.keys(ropes(s0 - 0.2)).some((k) => k.startsWith('smear')), `${move}: its after-images there, and only there`);
    }
  }
  assert.ok(RAP9_HIT === RAP9_STRIKE[1] && DRAW9_HIT === DRAW9_STRIKE[1] && OP_HIT === OP_STRIKE[1] && ROUNDS9_HITS.every((h, i) => h === ROUNDS9_STRIKES[i][1]), 'each blow lands on the last frame of its strike');
  // HELD: each wind-up held long before its strike (the warning); his operation the longest, near a second
  for (const [what, held] of [['rap', RAP9_STRIKE[0] - RAP9_HOLD[0]], ['draw', DRAW9_STRIKE[0] - DRAW9_HOLD[0]], ['operation', OP_STRIKE[0] - OP_HOLD[0]], ['rounds', ROUNDS9_STRIKES[0][0] - ROUNDS9_HOLD[0]]] as const) {
    assert.ok(held >= 0.45 - 1e-6, `${what}: held ${held.toFixed(2)} s`);
  }
  assert.ok(OP_STRIKE[0] - OP_HOLD[0] >= 0.9, 'his operation held near a second');
  // THE RAP: the ferrule down further out than the old (1.22 tiles), a star of cracks round it
  const rap = tilesOf(tipAt('attack', RAP9_HIT + 2 / 30));
  assert.ok(rap[0] > 1.8 && Math.abs(rap[0] - RAP.ahead) < 0.15 && Math.abs(rap[1] - RAP.left) < 0.15, `the ferrule down at ${rap[0].toFixed(2)} tiles (old ${RULES.rap.at[0].toFixed(2)})`);
  assert.ok(RAP.ahead + RAP.r > 2 * (RULES.rap.at[0] + RULES.rap.beyond), `the rap reaches ${(RAP.ahead + RAP.r).toFixed(1)} tiles, twice the old (${(RULES.rap.at[0] + RULES.rap.beyond).toFixed(2)}) and more`);
  assert.ok(rapStrikes(3.2, 0) && rapStrikes(1, 0) && !rapStrikes(1, 1.5) && !rapStrikes(4, 0), 'what the rap strikes');
  // THE DRAW: the quill out further than the old (1.87), the needle down the lane further still
  const quill = tilesOf(tipAt('draw', DRAW9_HIT));
  assert.ok(quill[0] > RULES.draw.tip[0] + 0.15, `the quill out to ${quill[0].toFixed(2)} tiles (old ${RULES.draw.tip[0].toFixed(2)})`);
  assert.ok(LUNGE.to > RULES.draw.tip[0] + RULES.draw.beyond + 1.2 && LUNGE.half > RULES.draw.half, 'a longer, wider lane');
  assert.ok(drawStrikes(3.4, 0.5) && !drawStrikes(3.9, 0) && !drawStrikes(2, 0.8), 'what the draw strikes');
  assert.ok(DRAW9.push[0] > DRAW9.fill[1], 'the word pushed up over his head after it is drawn (as the game\'s own)');
  // ROUNDS: the rings out further than the old (3.5 tiles), each in a flash
  assert.ok(RINGS.reach > ROUNDS_RING_REACH + 2.5 && RINGS.out < RULES.rounds.ring.long, `rings out to ${RINGS.reach} tiles in ${RINGS.out} s (old ${ROUNDS_RING_REACH} in ${RULES.rounds.ring.long})`);
  assert.ok(ringStrikes(0, ROUNDS9_HITS[0] + 0.3, ringAt(0, ROUNDS9_HITS[0] + 0.3)!) && !ringStrikes(0, ROUNDS9_HITS[0] + 0.3, 0.5), 'what a ring strikes as it passes');
  // HIS OPERATION: one huge strike, a field 2.5 tiles round where you stood
  assert.ok(FIELD.r >= 2.5 && fieldStrikes(1.7, 1.7) && !fieldStrikes(2.2, 1.6), 'the field');
  // THE LENS: held up before his beak through the look, flung up over his head through the wind-up
  assert.ok(lensAt('diagnose', DIAG.loop[0])[2] > 70 && lensAt('operate', OP_HOLD[0] + 0.3)[2] > 95, 'the lens held up, and flung up');
});

test('6. what he sends out: crisp, no cyan, the enemy’s pink, nothing cut off, nothing after; the Diagnosis: its line broken, the mark filling and draining', () => {
  const W = 1300;
  const H = 760;
  const at = isoAt({ cx: W / 2, cy: H / 2 });
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
  for (const v of ['front', 'back'] as const) {
    for (const t of [RAP9_HOLD[0] + 0.1, RAP9_HIT - 0.05, RAP9_HIT + 0.05, RAP9_HIT + 0.3]) check(`rap ${v} ${t.toFixed(2)}`, (p) => paintRap(p, at, t, [0, 0], v), false, t < RAP9_HIT + 0.2);
    check(`rap ${v} after`, (p) => paintRap(p, at, RAP9_HIT + RAP.lie + 0.05, [0, 0], v), true);
    for (const t of [DRAW9_HOLD[0] + 0.1, DRAW9_HIT - 0.05, DRAW9_HIT + 0.05, DRAW9.fill[0] + 0.2]) check(`draw ${v} ${t.toFixed(2)}`, (p) => paintDraw(p, at, t, [0, 0], v));
    check(`draw ${v} after`, (p) => paintDraw(p, at, DRAW9.fill[1] + 0.1, [0, 0], v), true);
    for (const t of [ROUNDS9_HOLD[0] + 0.1, ROUNDS9_HITS[0] + 0.2, ROUNDS9_HITS[2] + 0.3]) check(`rounds ${v} ${t.toFixed(2)}`, (p) => paintRounds(p, at, t, [0, 0], v), false, t < ROUNDS9_HITS[2]);
    check(`rounds ${v} after`, (p) => paintRounds(p, at, ROUNDS9_HITS[2] + RINGS.out + 0.1, [0, 0], v), true);
  }
  for (const t of [0.2, OP_HOLD[0] + 0.5, OP_HIT - 0.01, OP_HIT + 0.01, OP_HIT + 0.5]) check(`field ${t.toFixed(2)}`, (p) => paintField(p, at, 1, 1, t), false, t < OP_HIT + 0.6);
  check('field after', (p) => paintField(p, at, 1, 1, OP_HIT + FIELD.lie + 0.05), true);
  for (const [fill, lit] of [[0, true], [0.5, true], [0.5, false], [1, true]] as const) {
    check(`mark ${fill} ${lit}`, (p) => paintMark(p, at, 1, 1, fill, lit, 1), false, fill > 0);
    check(`dial ${fill} ${lit}`, (p) => paintDial(p, 300, 200, fill, lit), false, false);
  }
  // THE BEAM on the floor: crisp, no cyan, nothing past the room (here 8 tiles each way round)
  const room = (x: number, y: number): boolean => Math.abs(x) < 8 && Math.abs(y) < 8;
  const cover: Cover[] = [{ kind: 'pillar', x: 0, y: -3, r: 0.32 }, { kind: 'bed', x0: -3.7, x1: -2.3, y0: 0.7, y1: 1.3 }];
  check('beam', (p) => paintBeam(p, { cx: W / 2, cy: H / 2 }, [0, 6], -Math.PI / 2, cover, 1, room), false, false);
  // ITS LINE BROKEN behind a pillar and a bed; whole in the open
  const L: [number, number] = [0, 6];
  assert.ok(blocked(L, [0, -5], cover) && blocked(L, [-3.6, 0], cover) && !blocked(L, [2, -5], cover) && !blocked(L, [-1.5, 0], cover), 'the line broken by the pillar and the bed, and only by them');
  assert.ok(inLight(L, -Math.PI / 2, [0.5, 0], cover) && !inLight(L, -Math.PI / 2, [0, -5], cover) && !inLight(L, -Math.PI / 2, [6, 3], cover), 'in the light: in the cone, the line whole');
  // THE MARK fills in BEAM.fill standing in the light; drains in BEAM.drain hid; the beam follows him
  const open = diagnosis(L, () => [0.5, 0], DIAG.up, DIAG.up + BEAM.fill + 0.05, cover);
  assert.ok(open.full !== null && Math.abs(open.full - DIAG.up - BEAM.fill) < 0.05, `full in ${BEAM.fill} s in the light (${((open.full ?? 0) - DIAG.up).toFixed(2)})`);
  const hid = diagnosis(L, (t) => (t < DIAG.up + 1 ? [0.5, 0] : [0, -5]), DIAG.up, DIAG.up + 1 + BEAM.drain, cover);
  assert.ok(hid.full === null && hid.fill < 0.02 && !hid.lit, 'drained behind the pillar');
  const ran = diagnosis(L, (t) => [-2 + 1.5 * (t - DIAG.up), -1], DIAG.up, DIAG.up + 2, []);
  assert.ok(ran.lit, 'the beam follows him as he runs');
});

test('7. (2 Nov) the mark fills faster; THE BIGGER OPERATION: dark, a spotlight, his instruments round it, closing in two frames', () => {
  // THE MARK: full in 1.4 s standing in the light (was 2.2)
  assert.ok(BEAM.fill === 1.4 && BEAM_FILL_WAS === 2.2, 'the mark fills in 1.4 s');
  // THE DARK: sudden (three frames), held through the wind-up and the strike, the light back after
  assert.ok(opDark(0) === 0 && opDark(OPERATION.fall[1]) === 1 && OPERATION.fall[1] - OPERATION.fall[0] <= 0.1 + 1e-9, 'the theatre plunged dark, suddenly');
  assert.ok(opDark(OP_HIT) === 1 && opDark(OPERATION.rise[1]) === 0 && OPERATION.rise[0] > OP_HIT, 'dark through the strike; the light back after');
  // THE SPOTLIGHT: the field, lit hard; the rest dark
  assert.ok(opLight(0.5, 0.5, 0.5) > 1 && opLight(FIELD.r + 0.5, 0, 0.5) < 0.3 && opLight(FIELD.r + 0.5, 0, OPERATION.rise[1] + 0.1) === 1, 'lit hard in the spotlight, dark outside it');
  const [r0, g0, b0] = litRGB(120, 90, 60, OPERATION.low);
  assert.ok(r0 < 40 && g0 < 40 && b0 < 40, 'the dark is dark');
  // HOW LONG TO GET OUT: from the dark falling to the close, a hero at 4.6 tiles a second gets out from the middle with time to spare
  assert.ok(ESCAPE > 1.1 && ESCAPE < 1.4 && FIELD.r / 4.6 < ESCAPE - 0.5, `out of the light in ${ESCAPE.toFixed(2)} s`);
  // THE RING: a dozen, of five kinds, at the light's edge, pointing in, held; in two frames at the middle
  const at = isoAt({ cx: 650, cy: 380 });
  const C: [number, number] = [0, 0];
  const coat = at(-6, 4, 58);
  const held = toolsAt(at, 0, 0, OP_STRIKE[0] - 0.05, coat, [-6, 4]);
  assert.ok(held.length === OPERATION.count && OPERATION.count >= 12 && new Set(held.map((x) => x.kind)).size === TOOL_KINDS.length, 'a dozen of his instruments, every kind');
  for (const x of held) {
    const d = Math.hypot(x.floor[0] - C[0], x.floor[1] - C[1]);
    assert.ok(d > FIELD.r && d < FIELD.r + OPERATION.out + OPERATION.back + 0.01, `held at the light's edge (${d.toFixed(2)})`);
    const mid = at(0, 0, OPERATION.high);
    const to: [number, number] = [mid[0] - x.P[0], mid[1] - x.P[1]];
    assert.ok((to[0] * x.dir[0] + to[1] * x.dir[1]) / (Math.hypot(...to) * Math.hypot(...x.dir)) > 0.95, 'pointing in at you');
  }
  const met = toolsAt(at, 0, 0, OP_HIT, coat, [-6, 4]);
  for (const x of met) assert.ok(Math.hypot(x.floor[0], x.floor[1]) <= OPERATION.meet + 1e-6 && x.smear, 'closed in on the middle in two frames, smeared');
  assert.ok(toolsAt(at, 0, 0, OP_STRIKE[0] + 1 / 30, coat, [-6, 4]).every((x) => x.smear), 'smeared through the close');
  assert.ok(toolsAt(at, 0, 0, OP_STRIKE[0], coat, [-6, 4]).every((x) => !x.smear) && toolsAt(at, 0, 0, OP_HIT + 3 / 30, coat, [-6, 4]).every((x) => !x.smear), 'smeared then only');
  assert.ok(toolsAt(at, 0, 0, OPERATION.home + 0.01, coat, [-6, 4]).length === 0 && toolsAt(at, 0, 0, 0.05, coat, [-6, 4]).length === 0, 'out of his coat after the dark, back in it by the end');
  assert.ok(OP_STRIKE[0] - OPERATION.fly[1] >= 0.8, `held round you ${(OP_STRIKE[0] - OPERATION.fly[1]).toFixed(2)} s`);
  // EVERY FRAME of it, the instruments and the spotlight's edge and cone: crisp, no cyan, nothing cut off; the enemy's pink and gold
  const W = 1300;
  const H = 760;
  for (let n = 0; n <= Math.round(OPERATION.home * 30) + 1; n++) {
    const t = n / 30;
    const p = new Px(W, H);
    paintTools(p, at, 0, 0, t, coat, [-6, 4]);
    paintSpotEdge(p, at, 0, 0, t);
    paintSpotCone(p, at(-6, 4, 110), at(0, 0), 32 * FIELD.r * Math.SQRT2, 16 * FIELD.r * Math.SQRT2, t);
    const l = look(p);
    const tag = `the operation, frame ${n}`;
    assert.equal(l.odd, 0, `${tag}: crisp`);
    assert.equal(l.cyan, null, `${tag}: no cyan`);
    assert.ok(!l.edge, `${tag}: nothing cut off`);
    if (t >= OPERATION.fly[1] && t < OPERATION.pull) assert.ok(l.painted > 2000 && l.pink > 6, `${tag}: painted (${l.painted}), his pink (${l.pink})`);
  }
  const after = new Px(W, H);
  paintTools(after, at, 0, 0, OPERATION.home + 0.05, coat, [-6, 4]);
  paintSpotEdge(after, at, 0, 0, OPERATION.home + 0.05);
  assert.equal(look(after).painted, 0, 'nothing after');
});

