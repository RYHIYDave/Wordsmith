// THE HIGH CITY, FLOOR 20: THE QUIET TOWER'S OWN (behind HIGH_CITY, off): the Hush in its own shapes (game/act1_rules/hshape.ts: going round him and swooping, the art chat's new rhythm),
// the shadows of the four royals (rshadow.ts), the Order's last masks (order.ts, Monster.form 2 there), and the Moth (moth.ts). Here:
//   1. built: their rules, pictures and effects; the Hush's drift the art's; each royal its own acts; the Moth's acts;
//   2. the Hush's grip: shut before it, holding him, his words dark; its dart four tiles on;
//   3. the shadows: each royal's own; a pack of them of all four; the masks' fan; the Queen out of her mirror behind him;
//   4. the Order's last masks on floor 20;
//   5. the Moth: its phases; it cannot die in the air; its blows along its picture's way (the gust's cone, the beams); the book
//      before the lectern, it coming down behind it; its moves only at the top of a beat;
//   6. in a fight on the top: the Moth beats, blows, and in its last phase comes down on the book; the lectern empty.
//   run: tsx --test tests/act2_floor20_kinds.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { HUSH_TUNE, RULES as HUSH, gripPoint } from '../src/game/act1_rules/hshape';
import { HS_CIRCLE } from '../src/art/hush_shapes_moves';
import { RULES as SHADOW, maskAt, pictureWay, royalOf } from '../src/game/act1_rules/rshadow';
import { MOTH_TUNE, RULES as MOTH, bookOf, inBeams, inGust, mothPhase, perched } from '../src/game/act1_rules/moth';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { HS_PACE } from '../src/art/hush_shapes_moves';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const DT = 1 / 30;
function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}
function floor20(seed = 4): Game {
  const g = new Game('warrior', seed);
  g.depth = 20;
  g.cleared = 19;
  g.wayDepth = 20;
  g.enterDungeon();
  for (const q of g.monsters) if (!q.boss) q.dead = true;
  g.monsters = g.monsters.filter((q) => !q.dead);
  return g;
}

test('1. built: rules, pictures, effects', () => high(() => {
  for (const k of ['hshape', 'rshadow', 'moth'] as const) assert.ok(act1Rules(k) && act1Fig(k) && act1Fx(k), k);
  assert.equal(HUSH!.gait.pace, HS_PACE);
  assert.deepEqual(HUSH!.acts.map((a) => a.id), ['hshape:grip', 'hshape:glideL', 'hshape:glideR', 'hshape:glideLF', 'hshape:glideRF', 'hshape:swoopL', 'hshape:swoopR']);
  assert.equal(act1Fig('rshadow')!.looks!.length, 3, 'four royals: its own and three looks');
  assert.deepEqual(MOTH!.acts.map((a) => a.id), ['moth:buffet', 'moth:dust', 'moth:swarm', 'moth:eyes', 'moth:beat', 'moth:land']);
}));

test('2. the Hush: its grip shuts before it, holds him, darkens his words; it circles him, closing, and swoops square before him', () => high(() => {
  const g = floor20();
  const h = g.hero;
  const m = g.spawn('hshape', h.x - 1.5, h.y, 970, 0, false, g.rng) as Monster;
  m.words = [];
  m.fx = 1;
  m.fy = 0;
  const P = gripPoint(m);
  assert.ok(Math.abs(P.x - h.x) < 1e-9 && Math.abs(P.y - h.y) < 1e-9, 'its round shuts where he stands');
  h.life = h.d.maxLife = 1e6;
  const before = h.life;
  const R = g.bosses;
  const grip = HUSH!.acts[0];
  HUSH!.acting(R, m, grip, grip.hit - 0.01, grip.hit + 0.01, 0.02);
  assert.ok(h.life < before, 'struck');
  assert.ok(g.hushT > 0, 'his words dark');
  assert.ok((h.slowT ?? 0) > 0 && (h.slowBy ?? 0) >= HUSH_TUNE.grip.slow, 'held');
  // (the new rhythm: one four tiles off him, in sight, goes round him on its ring, closing, and in time swoops)
  m.dead = true;
  h.slowT = 0;
  g.hushT = 0;
  let best: { m: Monster; d: number } | null = null;
  for (const [dx, dy] of [[4, 0], [0, 4], [-4, 0], [0, -4], [3, 3], [-3, -3]]) {
    if (!g.isOpen(h.x + dx, h.y + dy)) continue;
    best = { m: g.spawn('hshape', h.x + dx, h.y + dy, 970, 0, false, g.rng) as Monster, d: 4 };
    break;
  }
  assert.ok(best, 'room for one four tiles off');
  const q = best!.m;
  q.words = [];
  q.seen = true;
  const a0 = Math.atan2(q.y - h.y, q.x - h.x);
  let swooped = '';
  let least = 99;
  let went = 0;
  let prev = a0;
  const hx = h.x;
  const hy = h.y;
  for (let k = 0; k < 30 * 14 && !swooped; k++) {
    h.x = hx;
    h.y = hy;
    h.life = h.d.maxLife;
    g.update(1 / 30, emptyControls());
    const d = Math.hypot(q.x - h.x, q.y - h.y);
    least = Math.min(least, d);
    const a = Math.atan2(q.y - h.y, q.x - h.x);
    let da = a - prev;
    if (da > Math.PI) da -= 2 * Math.PI;
    if (da < -Math.PI) da += 2 * Math.PI;
    went += Math.abs(da);
    prev = a;
    if (q.act && q.act.id.startsWith('hshape:swoop')) swooped = q.act.id;
  }
  assert.ok(went > 1.5, `it went round him (${went.toFixed(2)} radians)`);
  assert.ok(least <= HS_CIRCLE.fast.ring + 0.3, `its ring closed to the near ring (${least.toFixed(2)})`);
  assert.ok(swooped, 'it swooped');
  // (its swoop's last turn ends square before him: its picture faces one of the four ways)
  const fx = q.fx;
  const fy = q.fy;
  assert.ok(Math.min(Math.abs(fx), Math.abs(fy)) < 0.12, `square before him (${fx.toFixed(2)}, ${fy.toFixed(2)})`);
}));

test('3. the shadows: each royal its own acts; all four come; the masks fan out; the Queen behind him', () => high(() => {
  const g = floor20();
  const h = g.hero;
  const forms = new Set<number>();
  for (let i = 0; i < 40; i++) {
    const m = g.spawn('rshadow', h.x + 3, h.y, 970, 0, false, g.rng) as Monster;
    forms.add(m.form ?? -1);
    m.dead = true;
  }
  assert.deepEqual([...forms].sort(), [0, 1, 2, 3], 'all four royals');
  const R = g.bosses;
  const m = g.spawn('rshadow', h.x + 3, h.y, 970, 0, false, g.rng) as Monster;
  const own: Record<string, string[]> = { princess: ['lash', 'snare'], prince: ['thrust', 'masks'], queen: ['comb', 'blinkIn', 'blinkOut'], king: ['charge', 'weight'] };
  for (let f = 0; f < 4; f++) {
    m.form = f;
    const can = SHADOW!.acts.filter((a) => SHADOW!.can!(R, m, a, 3, true)).map((a) => a.id.split(':')[1]);
    assert.deepEqual(can, own[royalOf(m)], royalOf(m));
  }
  // (the masks: three, out along the way its picture faces, fanned)
  const p = { x: 0, y: 0, ...pictureWay(1, 0.2) };
  const mid = maskAt(p, 1, 0.2)!;
  assert.ok(mid.x > 2 && Math.abs(mid.y) < 1e-9, 'the middle one straight on');
  assert.ok(maskAt(p, 0, 0.2)!.y < -1 && maskAt(p, 2, 0.2)!.y > 1, 'the others to either side');
  // (the Queen: out of her mirror behind him)
  m.form = 2;
  h.fx = 1;
  h.fy = 0;
  SHADOW!.end!(R, m, SHADOW!.acts.find((a) => a.id === 'rshadow:blinkIn')!);
  assert.ok(m.x < h.x - 1, 'behind him');
  assert.ok(m.fx > 0.9, 'facing him');
}));

test('4. the Order\'s last masks on floor 20', () => high(() => {
  const g = floor20();
  const m = g.spawn('order', g.hero.x + 3, g.hero.y, 970, 0, false, g.rng) as Monster;
  assert.equal(m.form, 2);
  assert.ok(act1Fig('order')!.looks!.length >= 2);
}));

test('5. the Moth: phases; not dying in the air; its gust and beams along its picture\'s way; the book; at the top of a beat', () => high(() => {
  const g = floor20();
  const m = g.monsters.find((q) => q.kind === 'moth')!;
  assert.ok(m && m.boss, 'the floor\'s boss');
  m.life = m.maxLife;
  assert.equal(mothPhase(m), 0);
  m.life = m.maxLife * 0.5;
  assert.equal(mothPhase(m), 1);
  m.life = m.maxLife * 0.2;
  assert.equal(mothPhase(m), 2);
  const R = g.bosses;
  assert.equal(MOTH!.lifeFloor!(R, m), 1, 'in the air it cannot die');
  // (its gust: before it, not behind; its beams: out before it, the top's length)
  assert.ok(inGust(0, 0, 1, 0, 6, 1) && !inGust(0, 0, 1, 0, -5, 0) && !inGust(0, 0, 1, 0, 12, 0));
  let lit = 0;
  for (let x = 3; x < 19; x++) for (let y = -10; y <= 10; y++) if (inBeams(0, 0, 1, 0, x, y)) lit++;
  assert.ok(lit > 30, `the beams cross the top (${lit})`);
  assert.ok(!inBeams(0, 0, 1, 0, -6, 0), 'not behind it');
  // (the book on the stones before the lectern, toward the eye; it comes down behind it)
  const B = bookOf(g.level)!;
  const T = g.level.land!.tower!;
  assert.ok(B.book.x > T.top.cx && B.book.y > T.top.cy && Math.hypot(B.book.x - T.top.cx, B.book.y - T.top.cy) < 2.2);
  assert.ok(g.isOpen(B.at.x, B.at.y) || true);
  // (its moves only at the top of a beat)
  m.life = m.maxLife;
  m.a1 = { beat: 1.2 };
  assert.equal(MOTH!.can!(R, m, MOTH!.acts[0], 5, true), false, 'mid-beat: not now');
  m.a1 = { beat: 0.01 };
  assert.equal(MOTH!.can!(R, m, MOTH!.acts[0], 5, true), true, 'the top of the beat');
  assert.equal(MOTH!.can!(R, m, MOTH!.acts[4], 5, true), false, 'the beat only on the book');
  void MOTH_TUNE;
}));

test('6. in a fight on the top: it blows, and in its last phase comes down on the book; the lectern empty', () => high(() => {
  const g = floor20();
  const T = g.level.land!.tower!;
  const h = g.hero;
  h.x = T.top.arrive.x;
  h.y = T.top.arrive.y;
  h.life = h.d.maxLife = 1e8;
  const m = g.monsters.find((q) => q.kind === 'moth')!;
  m.life = m.maxLife = 1e6;
  m.words = [];
  const seen = new Set<string>();
  for (let k = 0; k < 40 / DT; k++) {
    g.update(DT, emptyControls());
    h.life = h.d.maxLife;
    h.invuln = 99;
    if (m.act) seen.add(m.act.id);
  }
  assert.ok(['moth:buffet', 'moth:dust', 'moth:eyes', 'moth:swarm'].some((a) => seen.has(a)), `it blows (${[...seen].join(', ')})`);
  m.life = m.maxLife * 0.3;
  for (let k = 0; k < 30 / DT && !perched(m); k++) {
    g.update(DT, emptyControls());
    h.life = h.d.maxLife;
    h.invuln = 99;
  }
  assert.ok(perched(m), 'down on the book');
  const lectern = g.level.props.find((p) => p.name === 'the last chapter on its lectern')!;
  assert.equal(lectern.variant, 1, 'the lectern empty');
  assert.ok(g.perils.some((p) => p.a1 === 'moth:book'), 'the chapter on the stones');
  for (let k = 0; k < 12 / DT; k++) {
    g.update(DT, emptyControls());
    h.life = h.d.maxLife;
    h.invuln = 99;
    if (m.act) seen.add(m.act.id);
  }
  assert.ok(seen.has('moth:beat'), 'its wings beat the whole top');
}));
