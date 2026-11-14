// FLOOR 20'S BOSS, THE MOTH, MADE GHOSTLY (art/moth2.ts, art/moth2_fx.ts; behind MOTH2, off until his yes). His words, 14 Nov 2026:
// “as of right now the moth is the end boss of the compaign so it needs to be good.  dont make mistakes, make some cool original
// attacks.  very ethereal”; his pick, “Yes, build these (Recommended)”. Here:
//   1. the switch is off; of the game only her own files reach the new ones;
//   2. ECLIPSE's shadow: over him where she casts it, not under her, not past its head, not far aside; it grows; about eleven tiles across;
//   3. ECLIPSE in play: struck in the shadow at the blow; out of it, or rolling, not; its peril laid; her shadow cast at him;
//   4. PHANTOMS in play: three lanes, the first at him; each strikes him once as it passes over him, in turn; out of their lanes, never;
//   5. what she draws, over each move's whole time and her death: drawn, and never cyan;
//   6. her pictures made ghostly: no little moths crawling on her; as she dies, nothing of her left lying on the top, her flakes rising;
//      with the switch off, as they were;
//   7. a fight on the top with the switch on: her moves made, Eclipse's and the Phantoms' perils in place of the beams' and the swarm's.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
// @ts-ignore
import path from 'node:path';
import { HIGH_CITY } from '../src/game/act1';
import { RULES as MOTH, perched } from '../src/game/act1_rules/moth';
import { ECLIPSE, MOTH2, PHANTOMS, PHANTOMS_LONG, eclipseShape, eclipseSize, inEclipse, inEclipseAt, phantomOver, phantomWay } from '../src/art/moth2';
import { FLAME_DULL, GLOW_DUST } from '../src/art/moth2_switch';
import { drawEclipse, drawGhostWing, drawHushGround, drawHushSnow, drawMoon, drawPagesLoosing, drawPhantoms, drawPhantomsGather, drawUnwritingGround, drawUnwritingPages, moonAt } from '../src/art/moth2_fx';
import { MOTH_DIES, MOTH_SWARM, mothCrawlersAt, mothGrainsAt } from '../src/art/moth_moves';
import { FX } from '../src/render/act1_fx/moth';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster, Peril } from '../src/game/state';
import type { Act1FxCtx } from '../src/render/act1_fx/types';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const DT = 1 / 30;
function on<T>(fn: () => T): T {
  const was = [HIGH_CITY.on, MOTH2.on];
  HIGH_CITY.on = true;
  MOTH2.on = true;
  try {
    return fn();
  } finally {
    [HIGH_CITY.on, MOTH2.on] = was;
  }
}
function floor20(seed = 4): { g: Game; m: Monster } {
  const g = new Game('warrior', seed);
  g.depth = 20;
  g.cleared = 19;
  g.wayDepth = 20;
  g.enterDungeon();
  for (const q of g.monsters) if (!q.boss) q.dead = true;
  g.monsters = g.monsters.filter((q) => !q.dead);
  const m = g.monsters.find((q) => q.kind === 'moth')!;
  return { g, m };
}
const act = (id: string) => MOTH!.acts.find((a) => a.id === id)!;
/** Any colour of the cyan family (a hue of 165 to 205, not grey): the friend's. */
function cyanish(col: string): boolean {
  const m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(col);
  if (!m) return false;
  const [r, g, b] = [1, 2, 3].map((i) => parseInt(m[i], 16));
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
const at = (x: number, y: number): readonly [number, number] => [300 + (x - y) * 16, 100 + (x + y) * 8];

test('1. the switch is off; of the game only her own files reach the new ones', () => {
  assert.equal(MOTH2.on, false, 'MOTH2 is off');
  const its = /^art\/moth2(_fx|_switch)?$/;
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
  assert.equal([...new Set(users)].sort().join(' '), 'art/moth_moves.ts game/act1_rules/moth.ts main.ts render/act1_fx/moth.ts render/painter.ts', 'game files that reach them');
});

test('2. Eclipse\'s shadow: over him where she casts it; not under her, past its head or far aside; it grows; about eleven tiles across', () => {
  assert.ok(inEclipseAt(4.2, 0), 'where he stands, before her');
  assert.ok(inEclipseAt(4.6, 3.2) && inEclipseAt(4.6, -3.2), 'under her forewings');
  assert.ok(!inEclipseAt(0.2, 0), 'not under her');
  assert.ok(!inEclipseAt(7.2, 0), 'not past its head');
  assert.ok(!inEclipseAt(2, 3.4) && !inEclipseAt(4, 6), 'not far aside');
  let wide = 0;
  for (let v = -8; v <= 8; v += 0.05) for (let u = 0; u <= 8; u += 0.25) if (inEclipseAt(u, v)) {
    wide = Math.max(wide, Math.abs(v));
    break;
  }
  assert.ok(wide > 5 && wide < 6.2, `about eleven tiles across (${(wide * 2).toFixed(1)})`);
  assert.ok(eclipseSize(0) === ECLIPSE.from && eclipseSize(ECLIPSE.grow[1]) === 1 && eclipseSize(0.5) > ECLIPSE.from && eclipseSize(0.5) < 1, 'it grows');
  // (cast along its way, wherever that is)
  assert.ok(inEclipse(10, 10, 0, 1, 10, 14.2) && !inEclipse(10, 10, 0, 1, 14.2, 10));
  assert.equal(eclipseShape().wings.length, 4);
});

test('3. Eclipse in play: struck in the shadow at the blow; out of it, or rolling, not; her shadow cast at him', () => on(() => {
  const { g, m } = floor20();
  const h = g.hero;
  const R = g.bosses;
  const eyes = act('moth:eyes');
  assert.equal(eyes.near, 1.5);
  assert.equal(eyes.far, 6);
  h.life = h.d.maxLife = 1e7;
  // (he stands 4.2 tiles off her, off her picture's axis: her shadow goes at him, not along it)
  const ang = 0.6;
  const place = (d: number, a: number): void => {
    h.x = m.x + Math.cos(a) * d;
    h.y = m.y + Math.sin(a) * d;
  };
  place(4.2, ang);
  m.a1 = { beat: 0 };
  m.fx = 1;
  m.fy = 0;
  MOTH!.start!(R, m, eyes);
  assert.ok(Math.abs((m.a1!.ax ?? 0) - Math.cos(ang)) < 1e-6 && Math.abs((m.a1!.ay ?? 0) - Math.sin(ang)) < 1e-6, 'cast at him');
  let life = h.life;
  MOTH!.acting!(R, m, eyes, eyes.hit - 0.01, eyes.hit + 0.01, 0.02);
  assert.ok(h.life < life, 'in her shadow: struck');
  assert.ok(g.perils.some((p) => p.a1 === 'moth:eclipse'), 'its strike drawn on after');
  assert.ok(!g.perils.some((p) => p.a1 === 'moth:beams'), 'no beams');
  // (out in the moonlight: past its edge, to the side)
  h.invuln = 0;
  life = h.life;
  place(4.2, ang + Math.PI / 2);
  MOTH!.acting!(R, m, eyes, eyes.hit - 0.01, eyes.hit + 0.01, 0.02);
  assert.equal(h.life, life, 'out of it: not struck');
  // (rolling through it)
  place(4.2, ang);
  h.move = { t: 0, dur: 0.4, fx: 1, fy: 0 } as unknown as typeof h.move;
  MOTH!.acting!(R, m, eyes, eyes.hit - 0.01, eyes.hit + 0.01, 0.02);
  assert.equal(h.life, life, 'rolling: not struck');
}));

test('4. Phantoms in play: three lanes, the first at him; each strikes him once as it passes over him; out of their lanes, never', () => on(() => {
  const { g, m } = floor20();
  const h = g.hero;
  const R = g.bosses;
  const swarm = act('moth:swarm');
  h.life = h.d.maxLife = 1e7;
  // (she aims at where he stands as she begins; he may be elsewhere as they pass)
  const run = (hx: number, hy: number, aimX = hx, aimY = hy): { hits: number[]; p: Peril } => {
    g.perils.length = 0;
    m.a1 = { beat: 0 };
    h.x = aimX;
    h.y = aimY;
    h.move = null as unknown as typeof h.move;
    MOTH!.start!(R, m, swarm);
    h.x = hx;
    h.y = hy;
    MOTH!.acting!(R, m, swarm, swarm.hit - 0.01, swarm.hit + 0.01, 0.02);
    const p = g.perils.find((q) => q.a1 === 'moth:phantoms')!;
    assert.ok(p, 'the phantoms set off');
    assert.ok(!g.perils.some((q) => q.a1 === 'moth:swarm'), 'no swarm');
    const hits: number[] = [];
    for (p.t = 0; p.t <= PHANTOMS_LONG; p.t += DT) {
      const was = h.life;
      h.invuln = 0;
      MOTH!.peril!(R, p, DT);
      if (h.life < was) hits.push(p.t);
    }
    return { hits, p };
  };
  // (five tiles off her: the first comes at him)
  const a = 0.3;
  let r = run(m.x + Math.cos(a) * 5, m.y + Math.sin(a) * 5);
  const [wx, wy] = phantomWay(r.p.fx, r.p.fy, 0);
  assert.ok(Math.abs(wx - Math.cos(a)) < 1e-6 && Math.abs(wy - Math.sin(a)) < 1e-6, 'the first lane at him');
  assert.equal(r.hits.length, 1, `struck once (${r.hits.map((t) => t.toFixed(2)).join(', ')})`);
  assert.ok(r.hits[0] < 0.6, 'by the first, as it passes');
  // (where the first lane and the second cross near her, struck by both, one after the other)
  const [w1x, w1y] = phantomWay(r.p.fx, r.p.fy, 1);
  const mid = Math.hypot(wx + w1x, wy + w1y);
  r = run(m.x + ((wx + w1x) / mid) * 3.5, m.y + ((wy + w1y) / mid) * 3.5, m.x + Math.cos(a) * 5, m.y + Math.sin(a) * 5);
  assert.equal(r.hits.length, 2, `struck by two (${r.hits.map((t) => t.toFixed(2)).join(', ')})`);
  assert.ok(r.hits[1] - r.hits[0] > PHANTOMS.apart * 0.6, 'one after the other');
  // (behind her, out of every lane: never)
  r = run(m.x - Math.cos(a) * 4, m.y - Math.sin(a) * 4, m.x + Math.cos(a) * 5, m.y + Math.sin(a) * 5);
  assert.equal(r.hits.length, 0, 'out of their lanes');
  // (and each passes him only where it is)
  assert.ok(phantomOver(0, 0, 1, 0, 0, 0.3, 4.3, 0) && !phantomOver(0, 0, 1, 0, 0, 0.3, 4.3, 2.2) && !phantomOver(0, 0, 1, 0, 1, 0.1, 4.3, 0));
}));

test('5. what she draws, over each move\'s whole time and her death: drawn, and never cyan', () => {
  const all = new Set<string>();
  const check = (name: string, draw: (g: CanvasRenderingContext2D, t: number) => void, t0: number, t1: number): void => {
    const c = counting();
    for (let t = t0; t <= t1; t += 1 / 15) draw(c.g, t);
    assert.ok(c.n() > 200, `${name}: drawn (${c.n()})`);
    for (const col of c.colours) all.add(col);
  };
  check('ghost wing', (g, t) => drawGhostWing(g, at, 4, 4, Math.SQRT1_2, Math.SQRT1_2, t), 0, 1.25);
  check('moon', (g, t) => drawMoon(g, 300, 60, moonAt(t), t), 0, ECLIPSE.hit + ECLIPSE.after);
  check('eclipse', (g, t) => drawEclipse(g, at, 3, 3, Math.SQRT1_2, Math.SQRT1_2, t, 380, 200, t), 0, ECLIPSE.hit + ECLIPSE.after);
  check('phantoms gathering', (g, t) => drawPhantomsGather(g, at, 3, 3, 1, 0, Math.min(1, t), 90, t), 0, 1.1);
  check('phantoms', (g, t) => drawPhantoms(g, at, 2, 2, Math.SQRT1_2, Math.SQRT1_2, t), 0, PHANTOMS_LONG);
  check('the hush', (g, t) => {
    drawHushGround(g, at, 7, 7, 3.5, t, t);
    drawHushSnow(g, at, 7, 7, 3.5, t);
  }, 0, 6.6);
  check('pages loosing', (g, t) => drawPagesLoosing(g, at, 7, 7, Math.min(1, t), t), 0, 1);
  check('the unwriting', (g, t) => {
    drawUnwritingGround(g, at, 7, 7, 2 + t * 8, 0.75, 1 - t / 1.25);
    drawUnwritingPages(g, at, 7, 7, 2 + t * 8, t, 1 - t / 1.25);
  }, 0, 1.2);
  const bad = [...all].filter(cyanish);
  assert.deepEqual(bad, [], 'nothing cyan');
  assert.ok(all.has('#ff4f8a') || all.has('#c0206a'), 'the enemy\'s pink in it');
});

test('5b. the game draws each of her new moves, as it plays them, without a fault', () => on(() => {
  const { g, m } = floor20();
  const c = counting();
  const ctx: Act1FxCtx = { g: c.g, at, game: g, t: 0, bestiary: null as never, stand: () => undefined, spot: (x, y, r, a) => assert.ok([x, y, r, a].every(Number.isFinite)) };
  for (const id of ['moth:buffet', 'moth:dust', 'moth:eyes', 'moth:swarm', 'moth:beat']) {
    const a = act(id);
    m.a1 = { beat: 0, ax: 0.8, ay: 0.6, wx: 1, wy: 0 };
    for (let t = 0; t < a.long; t += 0.1) {
      m.act = { ...a, t, hand: 1 } as never;
      ctx.t = t;
      FX!.ground!(ctx, m, null);
      FX!.air!(ctx, m, null);
      FX!.glow!(ctx, m, null);
    }
  }
  m.act = null as never;
  for (const [a1, long] of [['moth:gust', 1.25], ['moth:eclipse', ECLIPSE.after], ['moth:phantoms', PHANTOMS_LONG], ['moth:dust', 6.6], ['moth:shed', 6.6], ['moth:wave', 1.25], ['moth:words', 6]] as const) {
    const p = { a1, x: m.x, y: m.y, fx: 0.8, fy: 0.6, t: a1 === 'moth:shed' ? -1 : 0, b: m.x, c: m.y } as unknown as Peril;
    for (; p.t < long; p.t += 0.1) {
      ctx.t = p.t;
      FX!.ground!(ctx, null, p);
      FX!.air!(ctx, null, p);
      FX!.glow!(ctx, null, p);
      FX!.standing!(ctx, null, p);
    }
  }
  assert.ok(c.n() > 5000, `drawn (${c.n()})`);
  assert.deepEqual([...c.colours].filter(cyanish), [], 'nothing cyan');
}));

test('6. her pictures made ghostly: no little moths crawling on her; dying, nothing of her left lying; with the switch off, as they were', () => {
  const lying = (): number => mothGrainsAt('dying', MOTH_DIES.long).filter(([p]) => p[2] < 3).length;
  MOTH2.on = false;
  try {
    assert.ok(mothCrawlersAt('swarm', 0.9).length > 20, 'off: the little moths crawl on her');
    assert.ok(lying() > 200, 'off: her dust in a heap on the top');
    MOTH2.on = true;
    assert.equal(mothCrawlersAt('swarm', 0.9).length, 0, 'on: none crawl on her');
    assert.equal(lying(), 0, 'on: nothing of her lying on the top');
    const mid = mothGrainsAt('dying', (MOTH_DIES.crumble[0] + MOTH_DIES.crumble[1]) / 2);
    const light = mid.filter(([, c]) => GLOW_DUST.includes(c) || c === FLAME_DULL);
    assert.ok(light.length > 100, `coming apart into light (${light.length})`);
    for (const [, c] of mid) assert.ok(!cyanish(c), `${c} not cyan`);
    // (her scales glowing as they fall as she hovers)
    const fall = mothGrainsAt('stand', 0.5);
    assert.ok(fall.length > 20 && fall.every(([, c]) => GLOW_DUST.includes(c) || c === FLAME_DULL), 'her scales glowing');
    void MOTH_SWARM;
  } finally {
    MOTH2.on = false;
  }
});

test('7. a fight on the top with the switch on: her moves made; Eclipse\'s and the Phantoms\' in place of the beams and the swarm', () => on(() => {
  const { g, m } = floor20();
  const T = g.level.land!.tower!;
  const h = g.hero;
  h.x = T.top.cx + 1;
  h.y = T.top.cy + 4;
  h.life = h.d.maxLife = 1e8;
  m.life = m.maxLife = 1e6;
  m.words = [];
  const seen = new Set<string>();
  const perils = new Set<string>();
  for (let k = 0; k < 70 / DT; k++) {
    g.update(DT, emptyControls());
    h.life = h.d.maxLife;
    h.invuln = 99;
    if (m.act) seen.add(m.act.id);
    for (const p of g.perils) if (p.a1) perils.add(p.a1);
  }
  assert.ok(seen.has('moth:eyes') && seen.has('moth:swarm'), `Eclipse and Phantoms made (${[...seen].join(', ')})`);
  assert.ok(perils.has('moth:eclipse') && perils.has('moth:phantoms'), `their perils (${[...perils].join(', ')})`);
  assert.ok(!perils.has('moth:beams') && !perils.has('moth:swarm'), 'not the old');
  m.life = m.maxLife * 0.3;
  for (let k = 0; k < 30 / DT && !perched(m); k++) {
    g.update(DT, emptyControls());
    h.life = h.d.maxLife;
    h.invuln = 99;
  }
  assert.ok(perched(m), 'down on the book');
}));
