// THE HIGH CITY, FLOOR 19: THE KING, its boss (game/act1_rules/gking.ts, behind HIGH_CITY, off). Here:
//   1. he is built: his rules, pictures and what he casts; the boss of floor 19 with HIGH_CITY on; his four blows chosen (his
//      rulebook: a boss four), the charge first (his word of 31 Oct: the sweep and the leap replaced), each bigger one waiting
//      longer; shorter waits each phase;
//   2. the Decree's lines with their gaps; his blows square to the way his picture faces; the Hush's arms and the line test;
//   3. THE CHARGE: he runs at the hero, strikes him, and the line of sparks behind him bursts under one who stands on it;
//   4. THE CROWN'S WEIGHT: it follows the hero; one who stands still under it is struck, one who keeps running gets out;
//   5. in a fight in his hall: he makes every one of his blows; at a third of his life the Hush climbs off him (nothing hurts him
//      while it does) and stands at his side, he the King alone after; THE HUSH'S THREE MOVES: it grabs the hero and drags him
//      before the King; it shields him (his blows on it, none on him) until struck off; its grey fog slows the hero;
//   6. as he dies, the Hush unwinds, and the songbird before his throne winds itself up and sings.
//   run: tsx --test tests/act2_gking.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { HUSH_MOVE, KING_TUNE, RULES, armsOut, birdPeril, brokenBird, hushPeril, offLine, shielding, squareOf } from '../src/game/act1_rules/gking';
import { decreeKnights, DECREE_GAPS } from '../src/art/king_fx';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { bossKind } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { backView, flipped } from '../src/game/facing';
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
function onHisFloor(seed: number): Game {
  const g = new Game('warrior', seed);
  g.depth = 19;
  g.cleared = 18;
  g.wayDepth = 19;
  g.enterDungeon();
  return g;
}
/** His gate fallen and his line said: he fights (game.ts bossWaits). */
function meet(g: Game, m: { act?: unknown }): void {
  const waits = (): boolean => (g as unknown as { bossWaits(q: unknown): boolean }).bossWaits(m);
  for (let k = 0; k < 12 / DT && waits(); k++) g.update(DT, emptyControls());
  assert.ok(!waits(), 'he fights');
}

/** On his floor, the others gone, the hero `off` tiles before him and unhurtable, the King made to fight and kept from dying. */
function facing(seed: number, off = 5): { g: Game; m: Monster } {
  const g = onHisFloor(seed);
  const m = g.monsters.find((q) => q.kind === 'gking')!;
  for (const q of g.monsters) if (q !== m) q.dead = true;
  g.hero.x = m.x;
  g.hero.y = m.y + off;
  g.hero.invuln = 1e9;
  m.state = 'chase';
  m.life = m.maxLife = 1e7;
  meet(g, m);
  return { g, m };
}
/** He makes act `id` now (his others put off). */
function make(g: Game, m: Monster, id: string): void {
  const R = (g as unknown as { bosses: { startAct(m: Monster, acts: readonly unknown[], i: number): void } }).bosses;
  R.startAct(m, RULES!.acts, RULES!.acts.findIndex((a) => a.id === id));
}
const hurtOf = (g: Game): number => g.hero.d.maxLife - g.hero.life;

test('1. built: the boss of floor 19; his four blows, the charge first, each bigger one waiting longer; shorter waits each phase', () => {
  assert.ok(RULES && act1Rules('gking') && act1Fig('gking') && act1Fx('gking'));
  assert.notEqual(bossKind(19), 'gking', 'off: not his floor');
  high(() => assert.equal(bossKind(19), 'gking'));
  const chosen = RULES!.acts.filter((a) => !a.forced);
  assert.deepEqual(chosen.map((a) => a.id), ['gking:charge', 'gking:decree', 'gking:weight', 'gking:curtains']);
  assert.equal(chosen[0].cooldown, 0);
  assert.ok(KING_TUNE.cd[0] > KING_TUNE.cd[1] && KING_TUNE.cd[1] > KING_TUNE.cd[2], 'shorter waits each phase');
  assert.equal(act1Fig('gking')!.looks!.length, 2, 'the King alone, and the Hush on its own');
});

test('2. the Decree\'s gaps; square to his picture; the Hush\'s arms; the line test', () => {
  // (each line of the Decree has its gaps: two knights' room, nobody in them)
  const ks = decreeKnights(5, {});
  for (const gaps of DECREE_GAPS) for (const gp of gaps) assert.ok(!ks.some((k) => Math.abs(k.y - gp) < 0.5 && Math.abs(k.x - ks[0].x) < 0.01), `a gap at ${gp}`);
  // (square: the same picture, one of the floor's four ways)
  for (const [fx, fy] of [[0.9, 0.3], [0.2, 0.95], [-0.6, -0.7], [0.5, -0.8], [-0.9, 0.2]]) {
    const s = squareOf(fx, fy);
    assert.equal(Math.abs(s.fx) + Math.abs(s.fy), 1);
    assert.equal(backView(s.fx, s.fy), backView(fx, fy), 'the same view');
    assert.equal(flipped(s.fx, s.fy), flipped(fx, fy), 'turned the same way');
  }
  const G = KING_TUNE.hush.grab;
  assert.equal(armsOut(G.warn - 0.01), 0, 'its arms rear back first');
  assert.ok(armsOut(G.warn + 0.25) > 3 && armsOut(9) === G.reach, 'then shoot out, as far as its reach');
  assert.equal(offLine(0, 0, 4, 0, 2, 1), 1);
  assert.equal(offLine(0, 0, 4, 0, 6, 0), 2);
});

test('3. THE CHARGE: he runs at the hero and strikes him; the line of sparks bursts under one who stands on it', () => high(() => {
  const { g, m } = facing(4, 5);
  const h = g.hero;
  const from = { x: m.x, y: m.y };
  h.invuln = 0;
  h.life = h.d.maxLife = 1e6;
  make(g, m, 'gking:charge');
  let sparks = false;
  for (let k = 0; k < KING_TUNE.charge.long / DT; k++) {
    g.update(DT, emptyControls());
    if (g.perils.some((p) => p.a1 === 'gking:sparks')) sparks = true;
  }
  assert.ok(Math.hypot(m.x - from.x, m.y - from.y) > 3, 'he ran at him');
  assert.ok(hurtOf(g) > 0, 'and struck him');
  assert.ok(sparks, 'the line of sparks cut behind him');
  // (one standing on the line as it bursts is struck by it)
  const { g: g2, m: m2 } = facing(4, 6);
  const h2 = g2.hero;
  h2.invuln = 0;
  h2.life = h2.d.maxLife = 1e6;
  make(g2, m2, 'gking:charge');
  const line = { x: m2.x, y: m2.y };
  let before = 0;
  for (let k = 0; k < 6 / DT; k++) {
    // (he steps aside as the King comes, then back onto the line behind him)
    const sp = g2.perils.find((p) => p.a1 === 'gking:sparks');
    if (sp && sp.d && !sp.c) {
      h2.x = (sp.x + sp.a) / 2;
      h2.y = (sp.y + sp.b) / 2;
      before = hurtOf(g2);
    } else if (!sp || !sp.d) {
      h2.x = line.x + 3;
      h2.y = line.y + 3;
    }
    g2.update(DT, emptyControls());
    if (sp && sp.c) break;
  }
  assert.ok(hurtOf(g2) > before, 'the line burst under him');
}));

test('4. THE CROWN\'S WEIGHT: it follows the hero; one who stands still under it is struck, one who keeps running gets out', () => high(() => {
  const W = KING_TUNE.weight;
  assert.ok(W.pace < 4.6, 'slower than he runs');
  for (const runs of [false, true]) {
    const { g, m } = facing(4, 6);
    const h = g.hero;
    h.invuln = 0;
    h.life = h.d.maxLife = 1e6;
    make(g, m, 'gking:weight');
    const start = { x: h.x, y: h.y };
    let crown: { x: number; y: number } | null = null;
    let dir = 1;
    for (let k = 0; k < (W.long + W.follow + W.hold + 0.3) / DT; k++) {
      // (stopping the King from doing more than this)
      if (m.act && m.act.id !== 'gking:weight') m.act = undefined;
      if (runs && g.perils.some((p) => p.a1 === 'gking:weight')) {
        // (running back and forth along the hall, as fast as he goes)
        const nx = h.x + dir * 4.6 * DT;
        if (!g.isOpen(nx, h.y) || Math.abs(nx - start.x) > 7) dir = -dir;
        else h.x = nx;
      }
      g.update(DT, emptyControls());
      const p = g.perils.find((q) => q.a1 === 'gking:weight');
      if (p && !crown) crown = { x: p.x, y: p.y };
    }
    assert.ok(crown, 'his crown went up over the hero');
    if (runs) assert.equal(hurtOf(g), 0, 'he kept running and got out from under it');
    else assert.ok(hurtOf(g) > 0, 'standing still, he was struck');
  }
}));

test('5. a fight in his hall: every blow; the Hush climbs off; its three moves: the grab and drag, the shield, the grey fog', () => high(() => {
  const g = onHisFloor(4);
  const m = g.monsters.find((q) => q.kind === 'gking');
  assert.ok(m, 'he is on his floor');
  assert.ok(brokenBird(g.level), 'his songbird lies broken before his throne');
  for (const q of g.monsters) if (q !== m) q.dead = true;
  const h = g.hero;
  h.x = m!.x;
  h.y = m!.y + 5;
  h.invuln = 1e9;
  m!.state = 'chase';
  m!.life = m!.maxLife = 1e7;
  meet(g, m!);
  const seen = new Set<string>();
  const perils = new Set<string>();
  const hushMoves = new Set<number>();
  let climbHurt = false;
  let dragged = false;
  let slowed = false;
  let shieldedHit = false;
  let struckOff = false;
  const hit = (n: number): void => (g as unknown as { damageMonster: (m: Monster, n: number, el: string, crit: boolean, skill: number) => void }).damageMonster(m!, n, 'phys', false, 0);
  for (let k = 0; k < 140 / DT; k++) {
    if (k === Math.round(40 / DT)) m!.life = m!.maxLife * 0.5;
    if (k === Math.round(60 / DT)) m!.life = m!.maxLife * 0.3;
    // (he keeps a little way off, round the King, unless he is held; he stands still as the Hush reaches for him)
    const reaching = hushPeril(g)?.b === HUSH_MOVE.grab;
    if (h.held && h.held > 0) dragged = true;
    else if (!reaching) {
      h.x = m!.x + Math.cos(k * DT * 0.3) * 5;
      h.y = m!.y + Math.sin(k * DT * 0.3) * 5;
      if (!g.isOpen(h.x, h.y)) {
        h.x = m!.x;
        h.y = m!.y + 4;
      }
    }
    g.update(DT, emptyControls());
    const id = m!.act?.id ?? '';
    if (id) seen.add(id);
    if (id === 'gking:climb') climbHurt = RULES!.invulnerable!(m!);
    for (const p of g.perils) if (p.a1) perils.add(p.a1);
    const hp = hushPeril(g);
    if (hp) hushMoves.add(hp.b);
    if ((h.slowT ?? 0) > 0) slowed = true;
    // (the Hush round him: his blows land on it, not him; enough of them strike it off)
    if (shielding(g) && k % 10 === 0) {
      const life = m!.life;
      hit(50);
      if (m!.life === life) shieldedHit = true;
    }
    if (hp && hp.b === HUSH_MOVE.stand && shieldedHit && !struckOff && (m!.a1 as Record<string, number>).dazed > 0) struckOff = true;
  }
  for (const a of ['gking:charge', 'gking:decree', 'gking:weight', 'gking:curtains', 'gking:climb']) assert.ok(seen.has(a), `he made ${a}`);
  for (const a of ['gking:sparks', 'gking:decree', 'gking:weight', 'gking:faces', 'gking:hush', 'gking:fog']) assert.ok(perils.has(a), `${a} on the floor`);
  assert.ok(climbHurt, 'nothing hurts him as the Hush climbs off');
  assert.equal(m!.form, 1, 'the King alone after');
  for (const mv of [HUSH_MOVE.grab, HUSH_MOVE.shield, HUSH_MOVE.fog]) assert.ok(hushMoves.has(mv), `the Hush made its move ${mv}`);
  assert.ok(dragged, 'it caught him and dragged him');
  assert.ok(shieldedHit, 'wrapped round the King, it took his blows');
  assert.ok(struckOff, 'and was struck off');
  assert.ok(slowed, 'its fog slowed him');
}));

test('6. dying, the Hush unwinds and the songbird winds itself up and sings', () => high(() => {
  const { g, m } = facing(4, 5);
  m.life = m.maxLife * 0.3;
  for (let k = 0; k < 6 / DT; k++) g.update(DT, emptyControls());
  assert.ok(hushPeril(g), 'the Hush at his side');
  RULES!.died!((g as unknown as { bosses: never }).bosses, m);
  assert.equal(hushPeril(g)!.c, 1, 'the Hush unwinds');
  assert.ok(birdPeril(g), 'the songbird winds itself up');
  assert.ok(!brokenBird(g.level), 'no longer lying broken');
}));
