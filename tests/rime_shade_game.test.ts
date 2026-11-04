// FLOOR 20'S RIME SHADE IN THE GAME (game/act1_rules/rshade.ts, render/act1_fx/rshade.ts, behind RIME_SHADE_ON), the art chat's
// pictures and numbers (art/rime_shade*.ts) brought in by the main chat at his word, 3 Nov 2026: “In 25.0 too”. Here:
//   1. built: its rules, its figure, what its breath does drawn; its drift the art's; one act, the Rime Breath; on floor 20's list
//      only while it is on, two or three together;
//   2. THE LINE: marked at RS_BREATH.mark straight at where he stands, kept; its front creeping from the hit at 3.5 tiles a second;
//      where it reaches him, struck and FROZEN IN PLACE 0.8 s (the ice at his feet), when the art says;
//   3. stepped out of it, neither; running away down it, never reached; dodging through it, neither;
//   4. THE RIME LYING slows him (his “Yes, and lying rime slows (Recommended)”), never freezes him;
//   5. never a lock: a second line reaching him just after he is let go strikes him, but does not freeze him again;
//   6. killed before it breathes out: its mark gone with it;
//   7. in a fight: two of them breathe at him, their lines laid, and he is frozen and let go.
//   run: tsx --test tests/rime_shade_game.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { ICE_PERIL, LINE_PERIL, RIME_TUNE, RULES, onLine } from '../src/game/act1_rules/rshade';
import { ACT2_OWN, act2Pack } from '../src/game/act2_mobs';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { lineView } from '../src/render/act1_fx/rshade';
import { RIME_SHADE_ON } from '../src/art/rime_shade';
import { RS_BREATH, RS_PACE } from '../src/art/rime_shade_moves';
import { FROZEN, LINE_GONE, RIME_LINE, reachesAt } from '../src/art/rime_shade_fx';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster, Peril } from '../src/game/state';
import { RNG } from '../src/engine/rng';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const DT = 1 / 30;
function on<T>(fn: () => T): T {
  const was = [HIGH_CITY.on, RIME_SHADE_ON.on];
  HIGH_CITY.on = true;
  RIME_SHADE_ON.on = true;
  try {
    return fn();
  } finally {
    [HIGH_CITY.on, RIME_SHADE_ON.on] = was;
  }
}
function floor20(seed = 4): Game {
  const g = new Game('warrior', seed);
  g.depth = 20;
  g.cleared = 19;
  g.wayDepth = 20;
  g.enterDungeon();
  g.monsters = g.monsters.filter((q) => q.boss);
  g.perils.length = 0;
  const h = g.hero;
  h.life = h.d.maxLife = 1e6;
  return g;
}
/** A Rime Shade `d` tiles from him along (ux, uy) (open floor there), breathing: its line laid at the mark, straight at him. */
function breathing(g: Game, d = 3): { m: Monster; p: Peril } {
  const h = g.hero;
  for (const [ux, uy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-0.6, -0.8], [0.8, 0.6]]) {
    let open = true;
    for (let k = 0; k <= d + 3; k += 0.25) if (!g.isOpen(h.x + ux * (k - 3), h.y + uy * (k - 3))) open = false;
    if (!open) continue;
    const m = g.spawn('rshade', h.x + ux * d, h.y + uy * d, 970, 0, false, g.rng) as Monster;
    m.words = [];
    m.fx = -ux;
    m.fy = -uy;
    const a = RULES!.acts[0];
    m.state = 'act';
    m.act = { id: a.id, t: RS_BREATH.mark, hand: 1 } as unknown as Monster['act'];
    RULES!.acting(g.bosses, m, a, RS_BREATH.mark - 0.01, RS_BREATH.mark + 0.01, 0.02);
    const p = g.perils.find((q) => q.a1 === LINE_PERIL)!;
    return { m, p };
  }
  throw new Error('no room');
}
/** The perils stepped `secs` (the Rime Shade's act kept going as its clock runs); `each` after each step. */
function run(g: Game, secs: number, m: Monster | null, each?: (t: number) => void): void {
  for (let t = 0; t < secs; t += DT) {
    if (m && m.act) m.act.t += DT;
    g.bosses.stepPerils(DT);
    if (g.hero.iceT) g.hero.iceT = Math.max(0, g.hero.iceT - DT);
    g.time += DT;
    each?.(t + DT);
  }
}

test('1. built: rules, figure, effects; its drift the art\'s; one act; on floor 20 only while on, two or three together', () => on(() => {
  assert.ok(act1Rules('rshade') && act1Fig('rshade') && act1Fx('rshade'));
  assert.equal(RULES!.gait.pace, RS_PACE);
  assert.deepEqual(RULES!.acts.map((a) => a.id), ['rshade:breath']);
  assert.equal(RULES!.acts[0].hit, RS_BREATH.hit);
  assert.equal(RULES!.acts[0].long, RS_BREATH.long);
  assert.ok(ACT2_OWN[20].some((k) => k.kind === 'rshade'), 'on floor 20\'s list');
  const kinds = (sw: boolean): Map<string, number[]> => {
    RIME_SHADE_ON.on = sw;
    const rng = new RNG(7);
    const seen = new Map<string, number[]>();
    for (let i = 0; i < 400; i++) {
      const p = act2Pack(20, rng, 'normal');
      seen.set(p.kind, [...(seen.get(p.kind) ?? []), p.size]);
    }
    return seen;
  };
  const off = kinds(false);
  assert.ok(!off.has('rshade'), 'none while it is off');
  const with_ = kinds(true);
  assert.ok(with_.has('rshade'), 'drawn while it is on');
  for (const n of with_.get('rshade')!) assert.ok(n >= RIME_TUNE.pack[0] && n <= RIME_TUNE.pack[1], `a pack of ${n}`);
}));

test('2. THE LINE: marked straight at him; its front reaches him when the art says; struck and frozen in place 0.8 s', () => on(() => {
  const g = floor20();
  const h = g.hero;
  const { m, p } = breathing(g, 3);
  assert.ok(Math.abs(Math.hypot(p.fx, p.fy) - 1) < 1e-9);
  const r = onLine(p, h.x, h.y);
  assert.ok(Math.abs(r.fwd - 3) < 1e-6 && Math.abs(r.side) < 1e-6, `straight at him: ${JSON.stringify(r)}`);
  assert.ok(Math.abs(p.t + (RS_BREATH.hit - RS_BREATH.mark)) < 1e-9, 'its clock 0 as it breathes out');
  const life = h.life;
  let frozeAt = -1;
  let iceAt = -1;
  run(g, 3, m, (t) => {
    if (frozeAt < 0 && (h.iceT ?? 0) > 0) frozeAt = t - (RS_BREATH.hit - RS_BREATH.mark);
    if (iceAt < 0 && g.perils.some((q) => q.a1 === ICE_PERIL)) iceAt = t;
  });
  const want = reachesAt(3 - 0.15)!;
  assert.ok(frozeAt > 0, 'frozen');
  assert.ok(Math.abs(frozeAt - want) <= DT * 1.5, `frozen as the front reaches him: ${frozeAt.toFixed(3)} s after it breathes out, the art's ${want.toFixed(3)}`);
  assert.ok(h.life < life, 'struck');
  assert.ok(iceAt > 0, 'the ice at his feet');
}));

test('2b. frozen: he cannot walk, and is let go after FROZEN.hold', () => on(() => {
  const g = floor20();
  const h = g.hero;
  g.monsters = g.monsters.filter((q) => q.boss);
  h.iceT = FROZEN.hold;
  const [x0, y0] = [h.x, h.y];
  const c = { ...emptyControls(), mx: 1, my: 0 };
  for (let i = 0; i < Math.round((FROZEN.hold - 0.1) / DT); i++) g.update(DT, c);
  assert.ok(Math.hypot(h.x - x0, h.y - y0) < 1e-6, 'held where he stood');
  for (let i = 0; i < 20; i++) g.update(DT, c);
  assert.ok(Math.hypot(h.x - x0, h.y - y0) > 0.3, 'let go, and off');
}));

test('3. stepped out of it, neither; running away down it, never reached; dodging through it, neither', () => on(() => {
  // (a step to its side)
  {
    const g = floor20();
    const h = g.hero;
    const { m, p } = breathing(g, 3);
    h.x += p.fy * 0.75;
    h.y -= p.fx * 0.75;
    const life = h.life;
    run(g, LINE_GONE, m);
    assert.ok(!g.perils.some((q) => q.a1 === ICE_PERIL) && h.life === life, 'stepped out: neither struck nor frozen');
  }
  // (running away down it at the hero's pace from the moment it breathes out)
  {
    const g = floor20();
    const h = g.hero;
    const { m, p } = breathing(g, 1.6);
    const life = h.life;
    const speed = 4.6;
    run(g, LINE_GONE, m, (t) => {
      if (t < RS_BREATH.hit - RS_BREATH.mark) return;
      h.x += p.fx * speed * DT;
      h.y += p.fy * speed * DT;
    });
    assert.ok(h.life === life && !g.perils.some((q) => q.a1 === ICE_PERIL), 'outrun');
  }
  // (dodging as it passes)
  {
    const g = floor20();
    const h = g.hero;
    const { m } = breathing(g, 3);
    const life = h.life;
    run(g, LINE_GONE, m, (t) => {
      h.invuln = Math.abs(t - (RS_BREATH.hit - RS_BREATH.mark) - reachesAt(2.85)!) < 0.25 ? 0.1 : 0;
    });
    assert.ok(h.life === life && !g.perils.some((q) => q.a1 === ICE_PERIL), 'dodged through');
  }
}));

test('4. THE RIME LYING slows him, never freezes him', () => on(() => {
  const g = floor20();
  const h = g.hero;
  const { m, p } = breathing(g, 3);
  // (off to its side as its front passes, then onto it behind its front)
  const home = [h.x, h.y];
  h.x += p.fy * 1.5;
  h.y -= p.fx * 1.5;
  run(g, (RS_BREATH.hit - RS_BREATH.mark) + reachesAt(5)!, m);
  [h.x, h.y] = home;
  h.slowT = 0;
  run(g, 0.3, m);
  assert.ok((h.slowT ?? 0) > 0 && Math.abs((h.slowBy ?? 0) - RIME_TUNE.slow) < 1e-9, `slowed by ${h.slowBy}`);
  assert.ok(!g.perils.some((q) => q.a1 === ICE_PERIL) && !(h.iceT ?? 0), 'not frozen');
  // (melted away: no longer)
  run(g, LINE_GONE, m);
  h.slowT = 0;
  run(g, 0.3, m);
  assert.ok(!((h.slowT ?? 0) > 0), 'melted: no longer slowed');
}));

test('5. never a lock: a second line just after he is let go strikes him, but does not freeze him again', () => on(() => {
  const g = floor20();
  const h = g.hero;
  const a = breathing(g, 3);
  const lead = RS_BREATH.hit - RS_BREATH.mark;
  let let0 = -1;
  run(g, lead + reachesAt(2.85)! + FROZEN.hold + 0.05, a.m, (t) => {
    if (let0 < 0 && t > lead + 0.1 && !(h.iceT ?? 0)) let0 = t;
  });
  assert.equal(h.iceT ?? 0, 0, 'let go');
  // (another, from elsewhere, reaching him at once)
  const m2 = g.spawn('rshade', h.x + 0.6 * 1.6, h.y + 0.8 * 1.6, 970, 0, false, g.rng) as Monster;
  m2.words = [];
  m2.state = 'act';
  m2.act = { id: 'rshade:breath', t: RS_BREATH.mark, hand: 1 } as unknown as Monster['act'];
  RULES!.acting(g.bosses, m2, RULES!.acts[0], RS_BREATH.mark - 0.01, RS_BREATH.mark + 0.01, 0.02);
  const life = h.life;
  let frozen = false;
  run(g, lead + 0.6, m2, () => {
    if ((h.iceT ?? 0) > 0) frozen = true;
  });
  assert.ok(h.life < life, 'struck');
  assert.ok(!frozen, 'not frozen again within the grace');
}));

test('6. killed before it breathes out: its mark gone with it', () => on(() => {
  const g = floor20();
  const { m } = breathing(g, 3);
  m.dead = true;
  run(g, 0.2, null);
  assert.ok(!g.perils.some((q) => q.a1 === LINE_PERIL), 'gone');
}));

test('6b. its line painted along the way it runs, whichever way that is (seen from in front or truly from behind, never turned over)', () => {
  for (let k = 0; k < 16; k++) {
    const a = (k / 16) * Math.PI * 2;
    const fx = Math.cos(a);
    const fy = Math.sin(a);
    const { view, turn } = lineView(fx, fy);
    // (the picture's own way, turned `turn` to its left: front faces +x, its left -y; behind faces -y, its left -x)
    const [bx, by, lx, ly] = view === 'front' ? [1, 0, 0, -1] : [0, -1, -1, 0];
    const wx = bx * Math.cos(turn) + lx * Math.sin(turn);
    const wy = by * Math.cos(turn) + ly * Math.sin(turn);
    assert.ok(Math.hypot(wx - fx, wy - fy) < 1e-9, `${k}: ${view} ${turn.toFixed(3)}`);
    // (its left toward the screen's right from in front, toward its left from behind: the crystals lean out from its middle)
    const left = [fy, -fx];
    const screenX = left[0] - left[1];
    assert.ok(view === 'front' ? screenX >= -1e-9 : screenX < 0, `${k}: its left`);
  }
});

test('7. in a fight: two of them breathe at him; their lines laid; he is frozen and let go', () => on(() => {
  const g = floor20(9);
  const h = g.hero;
  let n = 0;
  for (const [dx, dy] of [[4, 0], [-4, 0], [0, 4], [0, -4], [3, 3], [-3, -3]]) {
    if (n >= 2 || !g.isOpen(h.x + dx, h.y + dy)) continue;
    const m = g.spawn('rshade', h.x + dx, h.y + dy, 970, 0, false, g.rng) as Monster;
    (g as unknown as { wakeUp(m: Monster): void }).wakeUp(m);
    n++;
  }
  assert.equal(n, 2, 'room for two');
  const c = emptyControls();
  let lines = 0;
  let frozen = 0;
  let wasIce = false;
  const seen = new Set<Peril>();
  for (let i = 0; i < 12 * 30; i++) {
    g.update(DT, c);
    for (const p of g.perils) if (p.a1 === LINE_PERIL && !seen.has(p)) { seen.add(p); lines++; }
    const ice = (h.iceT ?? 0) > 0;
    if (ice && !wasIce) frozen++;
    wasIce = ice;
    h.life = h.d.maxLife;
  }
  assert.ok(lines >= 4, `lines breathed: ${lines}`);
  assert.ok(frozen >= 1, `frozen ${frozen} times`);
  assert.ok(!((h.iceT ?? 0) > FROZEN.hold), 'never held longer than a freeze');
}));
