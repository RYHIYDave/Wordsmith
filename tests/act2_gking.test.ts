// THE HIGH CITY, FLOOR 19: THE KING, its boss (game/act1_rules/gking.ts, behind HIGH_CITY, off). Here:
//   1. he is built: his rules, pictures and what he casts; the boss of floor 19 with HIGH_CITY on; his four blows chosen (his
//      rulebook: a boss four), the sweep first, each bigger one waiting longer; shorter waits each phase;
//   2. the sweep's wedge (behind his left clear) and its wave out to ten tiles; the Crown's ring; the Decree's lines with their
//      gaps; his blows square to the way his picture faces;
//   3. in a fight in his hall: he makes every one of his blows; at a third of his life the Hush climbs off him (nothing hurts him
//      while it does) and stands at his side, he the King alone after;
//   4. as he dies, the Hush unwinds, and the songbird before his throne winds itself up and sings.
//   run: tsx --test tests/act2_gking.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { KING_TUNE, RULES, birdPeril, brokenBird, hushPeril, inWedge, ringFront, squareOf, sweepFront } from '../src/game/act1_rules/gking';
import { decreeKnights, DECREE_GAPS, KG_REACH } from '../src/art/king_fx';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { bossKind } from '../src/game/bosses';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
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

test('1. built: the boss of floor 19; his four blows, the sweep first, each bigger one waiting longer; shorter waits each phase', () => {
  assert.ok(RULES && act1Rules('gking') && act1Fig('gking') && act1Fx('gking'));
  assert.notEqual(bossKind(19), 'gking', 'off: not his floor');
  high(() => assert.equal(bossKind(19), 'gking'));
  const chosen = RULES!.acts.filter((a) => !a.forced);
  assert.deepEqual(chosen.map((a) => a.id), ['gking:sweep', 'gking:decree', 'gking:crown', 'gking:curtains']);
  assert.equal(chosen[0].cooldown, 0);
  assert.ok(KING_TUNE.cd[0] > KING_TUNE.cd[1] && KING_TUNE.cd[1] > KING_TUNE.cd[2], 'shorter waits each phase');
  assert.equal(act1Fig('gking')!.looks!.length, 2, 'the King alone, and the Hush on its own');
});

test('2. the sweep\'s wedge and wave; the Crown\'s ring; the Decree\'s gaps; square to his picture', () => {
  // (the wedge: before him and to his right struck, behind his left clear)
  const p = { x: 0, y: 0, fx: 1, fy: 0, hand: 1 };
  const at = (deg: number, r: number): [number, number] => {
    // (left of a figure facing +x drawn with hand 1 is -y: game/facing.ts beside)
    const a = (deg * Math.PI) / 180;
    return [Math.cos(a) * r, -Math.sin(a) * r];
  };
  for (const deg of [0, 45, -90, -150, 65]) assert.ok(inWedge(p, ...at(deg, 4)), `${deg} degrees struck`);
  for (const deg of [100, 150, 179, -175]) assert.ok(!inWedge(p, ...at(deg, 4)), `${deg} degrees clear (behind his left)`);
  assert.ok(sweepFront(0) < 2.6 && Math.abs(sweepFront(0.5) - KG_REACH.sweep) < 0.05, 'the wave out to ten tiles in half a second');
  assert.ok(ringFront(0) < 1 && Math.abs(ringFront(0.8) - KG_REACH.crown) < 0.05, 'the ring out to ten tiles');
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
});

test('3-4. a fight in his hall: every blow; the Hush climbs off and stands at his side; dying, the Hush unwinds and the bird sings', () => high(() => {
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
  let climbHurt = false;
  let perils = new Set<string>();
  for (let k = 0; k < 90 / DT; k++) {
    if (k === Math.round(40 / DT)) m!.life = m!.maxLife * 0.5;
    if (k === Math.round(60 / DT)) m!.life = m!.maxLife * 0.3;
    // (he keeps a little way off, round the King)
    h.x = m!.x + Math.cos(k * DT * 0.3) * 4.5;
    h.y = m!.y + Math.sin(k * DT * 0.3) * 4.5;
    if (!g.isOpen(h.x, h.y)) {
      h.x = m!.x;
      h.y = m!.y + 3;
    }
    g.update(DT, emptyControls());
    const id = m!.act?.id ?? '';
    if (id) seen.add(id);
    if (id === 'gking:climb') climbHurt = RULES!.invulnerable!(m!);
    for (const p of g.perils) if (p.a1) perils.add(p.a1);
  }
  for (const a of ['gking:sweep', 'gking:decree', 'gking:crown', 'gking:curtains', 'gking:climb']) assert.ok(seen.has(a), `he made ${a}`);
  for (const a of ['gking:wave', 'gking:decree', 'gking:ring', 'gking:faces', 'gking:hush']) assert.ok(perils.has(a), `${a} on the floor`);
  assert.ok(climbHurt, 'nothing hurts him as the Hush climbs off');
  assert.equal(m!.form, 1, 'the King alone after');
  const hp = hushPeril(g)!;
  assert.ok(hp && Math.hypot(hp.x - m!.x, hp.y - m!.y) < 2, 'the Hush at his side');
  // (dying)
  RULES!.died!(g.bosses, m!);
  assert.equal(hushPeril(g)!.c, 1, 'the Hush unwinds');
  assert.ok(birdPeril(g), 'the songbird winds itself up');
  assert.ok(!brokenBird(g.level), 'no longer lying broken');
  perils = new Set();
  void perils;
}));
