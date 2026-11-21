// FLOOR 5'S BOSS, THE FLESHMANCER, BROUGHT UP TO PAR (art/fm2_switch.ts FLESH2, on at his yes): his fire as flames, his circle and
// light about him, his death worthy of him. Here:
//   1. the switch is on, at his yes (“Yes, switch him on (Recommended)”, 14 Nov 2026); of the game only his own files reach the new ones;
//   2. his fire as flames: drawn over its whole time, crisp, his pink in it, never cyan, nothing cut off, nothing after; the floor under
//      it (the char) as it was;
//   3. his circle, his power, his death's burst and pillar: drawn, never cyan;
//   4. in play: killed in the middle of his fire, nothing of his harms the hero after; his rings' hands sink; his death drawn;
//   5. the game draws him and his death without a fault.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { FLESH2 } from '../src/art/fm2_switch';
import { FM_END, drawCircle, drawDeathFloor, drawDeathPillar, drawPowerMotes } from '../src/art/fm2_fx';
import { FIRE, MINI_FIRE, fireLanes, fireStrikes, paintFire } from '../src/art/fleshmancer_action_fx';
import type { At } from '../src/art/fleshmancer_action_fx';
import { FIRE_HIT, FIRE_STOP, MINI_HIT, MINI_STOP } from '../src/art/fleshmancer_action';
import { useFmAction } from '../src/art/bestiary';
import { FM2, FM_DEATH_FX, FM_FIRE, FM_RINGS } from '../src/game/fm_action';
import { beside } from '../src/game/facing';
import { Game } from '../src/game/game';
import type { Monster, Peril } from '../src/game/state';
import { FX } from '../src/render/act1_fx/fm';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { FLAME } from '../src/art/mkit';
import { Px } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
function on<T>(fn: () => T): T {
  const was = FLESH2.on;
  FLESH2.on = true;
  try {
    return fn();
  } finally {
    FLESH2.on = was;
  }
}
/** Any colour of the cyan family (a hue of 165 to 205, not grey): the friend's. */
function cyanish(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min || (max - min) / max < 0.2) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}
const hexCyan = (c: string): boolean => {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(c);
  return !!m && cyanish(parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16));
};
/** A canvas that only counts what is drawn on it, and in which colours. */
function counting(): { g: CanvasRenderingContext2D; n: () => number; colours: Set<string> } {
  const colours = new Set<string>();
  let n = 0;
  const st = { fillStyle: '' as string, globalAlpha: 1 };
  const g = {
    get fillStyle() {
      return st.fillStyle;
    },
    set fillStyle(v: string) {
      st.fillStyle = v;
    },
    get globalAlpha() {
      return st.globalAlpha;
    },
    set globalAlpha(v: number) {
      assert.ok(Number.isFinite(v), 'a whole number of light');
      st.globalAlpha = v;
    },
    fillRect(x: number, y: number, w: number, h: number) {
      assert.ok([x, y, w, h].every(Number.isFinite), 'drawn where it is');
      if (st.globalAlpha > 0.01 && w > 0 && h > 0) {
        n++;
        colours.add(st.fillStyle);
      }
    },
  } as unknown as CanvasRenderingContext2D;
  return { g, n: () => n, colours };
}
const at = (x: number, y: number): readonly [number, number] => [300 + (x - y) * 16, 150 + (x + y) * 8];

test('1. the switch is on, at his yes; of the game only his own files reach the new ones', () => {
  assert.equal(FLESH2.on, true, 'FLESH2 is on');
  const its = /^art\/fm2_(switch|fx)$/;
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x: string) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || its.test(f.replace(/\.ts$/, ''))) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (its.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].sort().join(' '), 'art/fleshmancer_action_fx.ts game/bosses.ts game/fm_action.ts main.ts render/act1_fx/fm.ts', 'game files that reach them');
});

test('2. his fire as flames: drawn, crisp, his pink, never cyan, nothing cut off, nothing after; the char under it as it was', () => on(() => {
  const W = 1500;
  const H = 900;
  const pa: At = (x, y, z = 0) => [W / 2 + 32 * (x - y), H / 2 + 16 * (x + y) - z];
  const pink = new Set([FLAME[1], FLAME[2], FLAME[3]].map((c) => c.toLowerCase()));
  const look = (p: Px): { painted: number; odd: number; cyan: boolean; pink: number; edge: boolean } => {
    let painted = 0;
    let odd = 0;
    let pk = 0;
    let cyan = false;
    let edge = false;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      if (p.d[i + 3] === 0) continue;
      painted++;
      if (p.d[i + 3] !== 255) odd++;
      const hex = `#${[p.d[i], p.d[i + 1], p.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
      if (pink.has(hex)) pk++;
      if (cyanish(p.d[i], p.d[i + 1], p.d[i + 2])) cyan = true;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
    return { painted, odd, cyan, pink: pk, edge };
  };
  const mouth: [number, number] = [W / 2, H / 2 - 70];
  for (const mini of [false, true]) {
    const [h, s] = mini ? [MINI_HIT, MINI_STOP] : [FIRE_HIT, FIRE_STOP];
    for (const t of [h + 0.05, (h + s) / 2, s, s + 1.0]) {
      const p = new Px(W, H);
      paintFire(p, pa, t, [0, 0], 0.3, t <= s ? mouth : null, 'air', mini);
      const l = look(p);
      assert.ok(l.painted > 400, `${mini ? 'mini ' : ''}flames ${t.toFixed(2)}: drawn (${l.painted})`);
      assert.equal(l.odd, 0, 'crisp');
      assert.ok(!l.cyan, 'never cyan');
      assert.ok(l.pink > 100, 'his pink');
      assert.ok(!l.edge, 'nothing cut off');
      // (the char under it the same with the switch on as off)
      const a = new Px(W, H);
      paintFire(a, pa, t, [0, 0], 0.3, null, 'floor', mini);
      FLESH2.on = false;
      const b = new Px(W, H);
      paintFire(b, pa, t, [0, 0], 0.3, null, 'floor', mini);
      FLESH2.on = true;
      assert.ok(a.d.every((v, i) => v === b.d[i]), 'the char as it was');
    }
    const S = mini ? MINI_FIRE : FIRE;
    const p = new Px(W, H);
    paintFire(p, pa, s + S.burn + 0.1, [0, 0], 0.3, null, 'air', mini);
    assert.equal(look(p).painted, 0, 'nothing after');
  }
}));

test('3. his circle, his power, his death\'s burst and pillar: drawn, never cyan', () => {
  const c = counting();
  for (let t = 0; t < 4; t += 1 / 15) {
    drawCircle(c.g, at, 5, 5, t);
    drawPowerMotes(c.g, 300, 200, 38, t);
    drawDeathFloor(c.g, at, 5, 5, t);
    drawDeathPillar(c.g, 300, 200, t);
  }
  assert.ok(c.n() > 3000, `drawn (${c.n()})`);
  assert.deepEqual([...c.colours].filter(hexCyan), [], 'nothing cyan');
  assert.ok(FM_END.pillar[0] > FM_END.hands[1] && FM_END.long >= FM_END.pillar[1], 'the pillar after the hands, within his death');
});

/** Floor 5 with his moves the action way (as the game has them), and him. */
function floor5(): { g: Game; m: Monster } {
  useFmAction(true);
  const g = new Game('warrior', 5);
  g.depth = 5;
  g.cleared = 4;
  g.wayDepth = 5;
  g.enterDungeon();
  const m = g.monsters.find((q) => q.kind === 'fleshmancer' && q.boss)!;
  assert.ok(m, 'the Fleshmancer');
  return { g, m };
}

test('4. in play: killed in the middle of his fire, nothing of his harms the hero after; his rings sink; his death drawn', () => on(() => {
  const { g, m } = floor5();
  const h = g.hero;
  h.life = h.d.maxLife = 1e7;
  const R = g.bosses;
  // (his fire, a lane of it burning, the hero standing in it)
  R.peril(m, 'act1', m.x, m.y, { a1: FM_FIRE, dur: FM2.lasts.fire, dmg: 50, d: 0, c: -1, a: m.id, fx: 1, fy: 0, hand: 1 });
  R.peril(m, 'act1', m.x, m.y, { a1: FM_RINGS, dur: FM2.lasts.rings, dmg: 50, b: 0, d: 0, a: m.id });
  const fire = g.perils.find((p) => p.a1 === FM_FIRE)!;
  const rings = g.perils.find((p) => p.a1 === FM_RINGS)!;
  const l = fireLanes()[2];
  fire.t = l.at + 0.4;
  rings.t = 0;
  const q = beside(m.x, m.y, 1, 0, fire.hand ?? 1, Math.cos(l.a) * 3, Math.sin(l.a) * 3);
  h.x = q.x;
  h.y = q.y;
  assert.ok(fireStrikes(fire.t, Math.cos(l.a) * 3, Math.sin(l.a) * 3), 'he stands in a lane burning');
  let life = h.life;
  h.invuln = 0;
  R.stepPerils(0.3);
  assert.ok(h.life < life, 'burned while he lives');
  // (killed)
  const killedAt = fire.t;
  g.kill(m);
  assert.equal(fire.done, 2, 'his fire marked');
  assert.equal(rings.done, 2, 'his rings marked');
  assert.ok(rings.c >= 0, 'his rings sinking from now');
  assert.ok(g.perils.some((p) => p.a1 === FM_DEATH_FX), 'his death drawn');
  life = h.life;
  for (let k = 0; k < 10; k++) {
    h.invuln = 0;
    R.stepPerils(0.05);
  }
  assert.equal(h.life, life, 'nothing of his harms him once he is dead');
  assert.ok(fire.dur <= killedAt + 0.6 + 1e-9, 'his fire dies down');
}));

test('5. the game draws him and his death without a fault, nothing cyan', () => on(() => {
  const { g, m } = floor5();
  const c = counting();
  const ctx: Act1FxCtx = { g: c.g, at, game: g, t: 0, bestiary: null as never, stand: () => undefined, spot: (x, y, r, a) => assert.ok([x, y, r, a].every(Number.isFinite)) };
  for (let t = 0; t < 2; t += 0.1) {
    ctx.t = t;
    FX!.ground!(ctx, m, null);
    FX!.glow!(ctx, m, null);
  }
  const p = { a1: FM_DEATH_FX, kind: 'act1', x: m.x, y: m.y, fx: 1, fy: 0, t: 0, a: m.id } as unknown as Peril;
  for (; p.t < FM_END.long; p.t += 0.05) {
    ctx.t = p.t;
    FX!.ground!(ctx, null, p);
    FX!.standing!(ctx, null, p);
    FX!.air!(ctx, null, p);
    FX!.glow!(ctx, null, p);
  }
  assert.ok(c.n() > 2000, `drawn (${c.n()})`);
  assert.deepEqual([...c.colours].filter(hexCyan), [], 'nothing cyan');
}));
