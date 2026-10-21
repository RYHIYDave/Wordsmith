// FLOOR 13'S DOUBLE BOSS IN THE GAME, THE SCRAPER AND THE QUILL (game/act1_rules/pair.ts, scraper.ts, quill.ts; their
// pictures art/act1_figs/scraper.ts and quill.ts; what they draw, render/act1_fx/scraper.ts and quill.ts), the art chat's
// (mockup/act2-palimpsest at ca004ef) with his yes: “Looks good (Recommended)”, by 21:30 Pacific, 20 Oct 2026. His word on
// their hit areas: “make the hit boxes on the attacks, and the attacks themselves big”: each is the art's mark.
//   1. the art's numbers as the rules hold them; built, and floor 13's boss with the switch on (the Palimpsest off);
//   2. floor 13 as the game makes it: both, the Quill beside the Scraper, asleep till met, met together, named together;
//   3. each blow strikes in its mark and not out of it: the snap, the scour, the rush (carried back, thrown aside), the
//      stab, the ink lines (and between them, nothing);
//   4. the Palimpsest, their combo: the Quill flies to the strip's far end, the Scraper scrapes it, the Quill swoops down it
//      writing; it bursts, striking who is on it and not who is beside it; the Quill felled first, it never bursts;
//   4b. THEIR ULTIMATE (his words, 21 Oct 2026, 10:58 Pacific: “The combo attack needs to be huge.  It’s their ultimate
//      ability.” and “Have them do the combo move, but do it 5 times in a row and about twice as fast”; his picks “Each one
//      at you (Recommended)”, “About every 30 s (Recommended)”): five strips in a row, each at him as it is planned, each at
//      twice the speed of its pictures; then over, the next 30 s from its start;
//   4c. THE QUILL QUICK (“a heron should be quick”; “Twice as fast (Recommended)”): its walk and its flight twice as fast;
//   5. Overwrite: the Quill writes over the Scraper's wounds, healing it, until struck, or the Scraper burns, or in time;
//   6. one falling, the other fights on as the floor's boss, the way shut, part of a hoard; both, the way open, the hoard;
//   7. the Quill in the air is struck, but held at the last of its life till it lands; nothing they draw is cyan.
//   run: tsx --test tests/pair_rules.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { paintWithoutCanvas, seasoned } from './helpers';
paintWithoutCanvas();
import { act1Fig } from '../src/art/act1_figs/index';
import { FIGURE_SIZE } from '../src/art/bestiary';
import * as AQ from '../src/art/quill';
import * as AS from '../src/art/scraper';
import * as AP from '../src/art/pair_shots';
import { RNG } from '../src/engine/rng';
import { bossKind } from '../src/game/bosses';
import { MONSTERS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { act1Rules } from '../src/game/act1_rules/index';
import * as PR from '../src/game/act1_rules/pair';
import { QL_ACTS, QMODE, keptOf as quillKept, onLine } from '../src/game/act1_rules/quill';
import { SR_ACTS, comboLine, keptOf as scraperKept } from '../src/game/act1_rules/scraper';
import { emptyControls } from '../src/game/state';
import type { GameEvent, Monster } from '../src/game/state';
import { act1Fx } from '../src/render/act1_fx/index';
import { cyan, measure, noteColours } from './act1_ledge_canyon_harness';
import { makeBestiary } from '../src/art/bestiary';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; deepEqual(a: unknown, b: unknown, msg?: string): void };
const near = (a: number, b: number, tol: number, what: string): void => assert.ok(Math.abs(a - b) <= tol, `${what}: ${a} against ${b} (within ${tol})`);

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
  damageMonster(m: Monster, dmg: number, el: string, crit: boolean, skill: number): void;
}
const hooks = (g: Game): Hooks => g as unknown as Hooks;

/** An empty practice room, the hero still in it, the Scraper and the Quill awake in it, not to be killed; their own moments put off unless asked. */
function room(): { g: Game; s: Monster; q: Monster } {
  const g = Game.forPractice('warrior', 5);
  hooks(g).waveT = 1e9;
  g.monsters.length = 0;
  const s = g.spawn('scraper', 8.5, 8.5, -2, 0, true, new RNG(3));
  const q = g.spawn('quill', 8.5, 11.5, -2, 0, true, new RNG(4));
  for (const m of [s, q]) {
    hooks(g).wakeUp(m);
    m.words = [];
    m.shield = 0;
    m.life = m.maxLife = 1e9;
    m.cd = 99;
  }
  scraperKept(s).combo = 1e9;
  scraperKept(s).heal = 1e9;
  return { g, s, q };
}

/** The game stepped on `secs`, the hero's life put back each step; every blow on him counted, and what `each` does after each step. */
function run(g: Game, secs: number, each?: (t: number) => boolean | void): { hurts: number; events: GameEvent[] } {
  const c = emptyControls();
  const h = g.hero;
  let hurts = 0;
  const events: GameEvent[] = [];
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const before = h.life;
    g.update(1 / 60, c);
    if (h.life < before) hurts++;
    h.life = h.d.maxLife;
    events.push(...g.events);
    g.events.length = 0;
    if (each && each((k + 1) / 60)) break;
  }
  return { hurts, events };
}

/** One of them made to make act `id` now, facing (fx, fy) at the hero, the hero at (hx, hy). */
function make(g: Game, m: Monster, id: string, hx: number, hy: number): void {
  const h = g.hero;
  h.x = hx;
  h.y = hy;
  const acts = m.kind === 'scraper' ? SR_ACTS : QL_ACTS;
  const i = acts.findIndex((a) => a.id === id);
  const R = (g as unknown as { bosses: { startAct(m: Monster, acts: unknown, i: number): void } }).bosses;
  R.startAct(m, acts, i);
}

test('1. the art\'s numbers as the rules hold them; built; floor 13\'s boss with the switch on, the Palimpsest off', () => {
  // (the moves' times and the carries)
  assert.equal(PR.SR_PACE, AS.SR_PACE);
  for (const [mine, art] of [[PR.SR_SNAP, AS.SR_SNAP], [PR.SR_SCOUR, AS.SR_SCOUR], [PR.SR_RUSH, AS.SR_RUSH], [PR.SR_STRIP, AS.SR_STRIP], [PR.QL_STAB, AQ.QL_STAB], [PR.QL_TAKEOFF, AQ.QL_TAKEOFF], [PR.QL_LAND, AQ.QL_LAND], [PR.QL_SWOOP, AQ.QL_SWOOP]] as const) {
    for (const [k, v] of Object.entries(mine)) assert.deepEqual(v, (art as Record<string, unknown>)[k], `${k}`);
  }
  assert.deepEqual(PR.QL_LINES.strokes, AQ.QL_LINES.strokes);
  assert.equal(PR.QL_LINES.long, AQ.QL_LINES.long);
  for (const k of ['RUSH_TILES'] as const) assert.equal(PR[k], AS[k]);
  for (const k of ['QL_PACE', 'STAB_AT', 'SWOOP_TILES', 'QL_FLY_PACE'] as const) assert.equal(PR[k], AQ[k]);
  assert.equal(PR.WRITE_AT.ahead, AQ.WRITE_AT.ahead);
  // (their marks: the hit areas)
  for (const k of ['SNAP_R', 'SNAP_FOR', 'SCOUR_REACH', 'SCOUR_HALF', 'SCOUR_FOR', 'RUSH_LANE', 'RUSH_HALF', 'RUSH_WAKE_FOR', 'STRIP_FROM', 'STRIP_TILES', 'STRIP_HALF', 'STRIP_BURST_RUN', 'STRIP_BURST_AFTER', 'STRIP_BURST_FOR', 'STRIP_STAIN_FOR', 'STAB_R', 'STAB_FOR', 'LINE_LONG', 'LINE_HALF', 'LINE_BURST_AFTER', 'LINE_BURST_FOR', 'LINE_STAIN_FOR'] as const) assert.equal(PR[k], AP[k], k);
  assert.deepEqual(PR.SNAP_AT, AP.SNAP_AT);
  assert.deepEqual([...PR.LINES_AT], [...AP.LINES_AT]);
  // (each act as long as its clip, its blow at its clip's moment)
  const sa = AS.makeScraperArt();
  const qa = AQ.makeQuillArt();
  for (const [acts, art] of [[SR_ACTS, sa], [QL_ACTS, qa]] as const) {
    for (const a of acts) {
      const clip = a.clip === 'attack' ? art.front.clips?.attack : art.front.clips?.moves?.[a.clip];
      assert.ok(clip, `${a.id}: its clip ${a.clip}`);
      if (clip!.loop !== undefined) continue;
      near((clip!.frames.length - 1) / clip!.fps, a.long, 0.04, `${a.id}: as long as its clip`);
    }
  }
  // (built: rules, pictures, what they draw; and floor 13's boss)
  for (const k of ['scraper', 'quill'] as const) {
    assert.ok(act1Rules(k) && act1Fig(k) && act1Fx(k), `${k}: rules, pictures, effects`);
    assert.equal(MONSTERS[k].size, 'boss');
  }
  assert.equal(PR.PAIR.on, true, 'on: his yes');
  assert.equal(bossKind(13), 'scraper');
  PR.PAIR.on = false;
  try {
    assert.equal(bossKind(13), 'palimpsest', 'off, the Palimpsest as before');
  } finally {
    PR.PAIR.on = true;
  }
  // (their sizes as the game holds them, measured off their stands)
  for (const [k, art] of [['scraper', sa], ['quill', qa]] as const) {
    const { head, reach } = measure(art.front.idle[0]);
    near(act1Fig(k)!.size.top, head, 4, `${k}: the top of it, standing`);
    assert.ok(act1Fig(k)!.size.half <= reach + 1 && act1Fig(k)!.size.half >= reach * 0.4, `${k}: half its width ${act1Fig(k)!.size.half}, its picture reaching ${reach}`);
    assert.deepEqual(FIGURE_SIZE[k], act1Fig(k)!.size);
  }
});

test('2. floor 13 as the game makes it: both, the Quill beside the Scraper, asleep till met; met together, named together', () => {
  const g = seasoned(new Game('warrior', 7), 1);
  g.depth = 13;
  g.cleared = 13;
  g.enterDungeon();
  const s = g.monsters.find((m) => m.kind === 'scraper');
  const q = g.monsters.find((m) => m.kind === 'quill');
  assert.ok(s && q, 'both');
  assert.ok(!g.monsters.some((m) => m.kind === 'palimpsest'), 'no Palimpsest');
  assert.equal(g.boss, s, 'the Scraper the floor\'s boss');
  assert.ok(s!.boss && q!.boss && s!.packId === q!.packId, 'both bosses, of one pack');
  assert.ok(Math.hypot(s!.x - q!.x, s!.y - q!.y) <= 3, 'the Quill beside it');
  assert.ok(g.free(g.level.walk, q!.x, q!.y, 0.42), 'on floor with room');
  assert.equal(s!.state, 'sleep');
  assert.equal(q!.state, 'sleep');
  // (the hero comes into their ground: both wake, and both their names come up)
  const h = g.hero;
  h.x = s!.x + 3;
  h.y = s!.y;
  if (!g.free(g.level.walk, h.x, h.y, 0.3)) {
    h.x = q!.x;
    h.y = q!.y + 2;
  }
  const seen = run(g, 0.5);
  assert.ok(s!.state !== 'sleep' && q!.state !== 'sleep', 'both awake');
  const intro = seen.events.find((e) => e.t === 'bossIntro');
  assert.ok(intro && intro.t === 'bossIntro' && intro.name === `${s!.name} and ${q!.name.replace(/^The /, 'the ')}`, `named together: ${intro && intro.t === 'bossIntro' ? intro.name : ''}`);
});

test('3. each blow strikes in its mark and not out of it', () => {
  const at = (m: Monster, f: number, side: number): { x: number; y: number } => PR.ahead(m.x, m.y, m.fx, m.fy, f, side);
  const once = (id: string, who: 'scraper' | 'quill', spot: (m: Monster) => { x: number; y: number }, secs: number): number => {
    const { g, s, q } = room();
    const m = who === 'scraper' ? s : q;
    const other = who === 'scraper' ? q : s;
    other.x = 22;
    other.y = 22;
    m.fx = 1 / Math.SQRT2;
    m.fy = 1 / Math.SQRT2;
    // (made facing the hero, who stands where it faces: then moved to the spot, before the blow)
    const p = spot(m);
    make(g, m, id, m.x + m.fx * 2, m.y + m.fy * 2);
    g.hero.x = p.x;
    g.hero.y = p.y;
    return run(g, secs).hurts;
  };
  // THE SNAP: in its ring, struck; past it, not
  assert.ok(once('scraper:snap', 'scraper', (m) => at(m, PR.SNAP_AT.ahead + 0.3, PR.SNAP_AT.left + 0.6), 1.0) >= 1, 'the snap: in its ring');
  assert.equal(once('scraper:snap', 'scraper', (m) => at(m, PR.SNAP_AT.ahead + PR.SNAP_R + 0.6, 0), 1.0), 0, 'the snap: past its ring');
  // THE SCOUR: in the fan, near its edge and near its middle, struck; out of its reach, not
  assert.ok(once('scraper:scour', 'scraper', (m) => at(m, 1.0, 3.0), 2.6) >= 1, 'the scour: at its edge');
  assert.ok(once('scraper:scour', 'scraper', (m) => at(m, 3.2, 0.2), 2.6) >= 1, 'the scour: before it');
  assert.equal(once('scraper:scour', 'scraper', (m) => at(m, PR.SCOUR_REACH + 0.8, 0), 2.6), 0, 'the scour: out of its reach');
  // THE STAB: in its ring, struck; to the side of it, not
  assert.ok(once('quill:stab', 'quill', (m) => at(m, PR.STAB_AT + 0.5, 0.5), 1.3) >= 1, 'the stab: in its ring');
  assert.equal(once('quill:stab', 'quill', (m) => at(m, PR.STAB_AT, PR.STAB_R + 0.7), 1.3), 0, 'the stab: beside it');
  // INK LINES: on a line as it bursts, struck; between two lines, not
  assert.ok(once('quill:lines', 'quill', (m) => at(m, PR.LINES_AT[1], 0), 3.5) >= 1, 'the lines: on the middle one');
  assert.equal(once('quill:lines', 'quill', (m) => at(m, (PR.LINES_AT[0] + PR.LINES_AT[1]) / 2, 1.2), 3.5), 0, 'the lines: between two of them');
  assert.ok(onLine(0, 0, 1, 0, 2, PR.LINES_AT[2] + 0.25, -2.4), 'the last line slants as it is drawn');
  // THE RUSH: it turns its tail on him and is carried back down its lane, striking him and throwing him aside
  {
    // (the practice room's row 8 is floor from wall to wall: the Scraper at its west end, he 6 tiles east of it)
    const { g, s, q } = room();
    q.x = 21.5;
    q.y = 21.5;
    s.x = 7.5;
    s.y = 8.5;
    const h = g.hero;
    make(g, s, 'scraper:rush', 13.5, 8.5);
    const from = { x: s.x, y: s.y };
    let tail = true;
    const seen = run(g, 2.0, () => {
      if (s.act?.id === 'scraper:rush' && !(s.fx < -0.99)) tail = false;
    });
    assert.ok(tail, 'its tail on him all the way');
    near(Math.hypot(s.x - from.x, s.y - from.y), PR.RUSH_TILES, 0.3, 'carried back its five tiles');
    assert.ok(s.x > from.x, 'back toward him');
    assert.ok(seen.hurts >= 1, 'he is struck in its lane');
    assert.ok(Math.hypot(h.x - 13.5, h.y - 8.5) > 0.3, 'and thrown aside');
  }
});

test('4. the Palimpsest: the Quill to the strip\'s far end, the strip scraped, written down, bursting on who is on it', () => {
  const play = (heroOn: boolean, fell: boolean): { hurts: number; strip: boolean; burst: boolean; quillAt: { x: number; y: number } } => {
    const { g, s, q } = room();
    s.x = 6.8;
    s.y = 6.8;
    q.x = 9;
    q.y = 6.6;
    const k = scraperKept(s);
    k.combo = 0;
    // (the hero five tiles out toward the room's middle, where it plans its line; then put on that line, or 2.2 tiles off
    // it, and kept there through it all, as the jostle and the knocks move him)
    const u = Math.SQRT1_2;
    const h = g.hero;
    h.x = s.x + u * 5;
    h.y = s.y + u * 5;
    let line: { ux: number; uy: number } | null = null;
    let strip = false;
    let burst = false;
    let hurts = 0;
    let quillAt = { x: 0, y: 0 };
    let first: { c: number; done: number } | null = null;
    const seen = run(g, 9, () => {
      // (the first strip only: done once it has burst and its burst has run, or has faded)
      if (first && (first.done === 2 || (first.done === 1 && g.perils.indexOf(first as never) < 0))) return true;
      // (none of their own blows meanwhile: only the combo's)
      s.cd = 99;
      q.cd = 99;
      if (!line && k.plan === 1) line = { ux: k.ux, uy: k.uy };
      if (line) {
        const p = PR.ahead(s.x, s.y, line.ux, line.uy, 5, heroOn ? 0 : 2.2);
        h.x = p.x;
        h.y = p.y;
      }
      const p = g.perils.find((x) => x.a1 === 'scraper:strip');
      if (p && !first) first = p;
      if (first) {
        strip = true;
        if (first.done === 1) burst = true;
        if (first.done === 1 && g.perils.indexOf(first as never) >= 0 && (first as unknown as { t: number }).t - first.c > 1.2) return true;
      }
      if (q.act?.id === 'quill:swoop' && !quillAt.x) quillAt = { x: q.x, y: q.y };
      if (fell && q.act?.id === 'quill:swoop' && q.act.t > 1.0 && !q.dead) {
        q.life = 1;
        // (a blow in the air is held at the last of its life: it is felled as it lands, here at once by the rules' kill)
        g.kill(q);
      }
      return false;
    });
    hurts = seen.hurts;
    void k;
    return { hurts, strip, burst, quillAt };
  };
  const on = play(true, false);
  assert.ok(on.strip, 'the strip is scraped');
  near(Math.hypot(on.quillAt.x - 6.8, on.quillAt.y - 6.8), PR.PAIR_TUNE.combo.stand, 0.3, 'the Quill swoops from the strip\'s far end');
  assert.ok(on.burst, 'it bursts once written');
  assert.ok(on.hurts >= 1, 'who is on it is struck');
  const off = play(false, false);
  assert.ok(off.burst, 'it bursts');
  assert.equal(off.hurts, 0, 'who stands beside it is not');
  const felled = play(true, true);
  assert.ok(felled.strip && !felled.burst, 'the Quill felled before it has written it: it never bursts');
  // (where its far end has no room for the Quill, it stands nearer, as far as `short`, and has him on the strip still)
  {
    const { g, s } = room();
    s.x = 12.5;
    s.y = 14.5;
    g.hero.x = 17.5;
    g.hero.y = 14.5;
    const R = (g as unknown as { bosses: Parameters<typeof comboLine>[0] }).bosses;
    const L = comboLine(R, s, true);
    assert.ok(L && L.ux > 0.99 && L.stand < PR.PAIR_TUNE.combo.stand && L.stand >= PR.PAIR_TUNE.combo.stand - PR.PAIR_TUNE.combo.short, `nearer, at him: ${JSON.stringify(L)}`);
  }
  // (where the floor has no room for the line, no combo)
  const { g, s } = room();
  s.x = 8.5;
  s.y = 8.5;
  g.hero.x = 6.5;
  g.hero.y = 8.5;
  const R = (g as unknown as { bosses: Parameters<typeof comboLine>[0] }).bosses;
  assert.equal(comboLine(R, s), null, 'its back to the wall: no line');
});

test('4b. their ultimate: five strips in a row, each at him as it is planned, each at twice the speed of its pictures; then over', () => {
  const { g, s, q } = room();
  // (the practice room's row 14 is floor from wall to wall: the Scraper at its west end, he five tiles east of it)
  s.x = 7.5;
  s.y = 14.5;
  q.x = 9;
  q.y = 12.5;
  const h = g.hero;
  h.x = 12.5;
  h.y = 14.5;
  const k = scraperKept(s);
  k.combo = 0;
  // (he moves round it between the strips, so that each is made at where he is then)
  const spots = [[12.5, 14.5], [11.3, 17.6], [12.0, 12.2], [12.5, 15.5], [11.6, 11.8]];
  let planned = 0;
  let wasPlan = 0;
  const aims: number[] = [];
  const rates = new Set<string>();
  const strips: unknown[] = [];
  let started = -1;
  let over = -1;
  let combo = 0;
  run(g, 30, (t) => {
    s.cd = 99;
    q.cd = 99;
    if (k.ult === 1 && started < 0) {
      started = t;
      combo = k.combo;
    }
    if (k.plan === 1 && wasPlan !== 1) {
      // (a strip planned: its line against the way to him)
      aims.push(Math.abs(Math.atan2(h.y - s.y, h.x - s.x) - Math.atan2(k.uy, k.ux)));
      planned++;
    }
    wasPlan = k.plan;
    if (s.act?.id === 'scraper:strip') rates.add(`strip ${s.act.rate}`);
    if (q.act?.id === 'quill:swoop') rates.add(`swoop ${q.act.rate}`);
    for (const p of g.perils) if (p.a1 === 'scraper:strip' && !strips.includes(p)) strips.push(p);
    // (once a strip has burst, he steps to the next spot)
    const burst = g.perils.filter((p) => p.a1 === 'scraper:strip' && p.done === 1).length;
    const at = spots[Math.min(spots.length - 1, burst)];
    h.x = at[0];
    h.y = at[1];
    if (started >= 0 && k.ult === 0 && over < 0) over = t;
    return over > 0 && t > over + 1.5;
  });
  assert.equal(planned, PR.PAIR_TUNE.combo.times, 'five planned');
  assert.equal(strips.length, PR.PAIR_TUNE.combo.times, 'five strips scraped');
  assert.ok(strips.every((p) => (p as { done: number }).done === 1), 'each burst');
  for (const a of aims) assert.ok(a < 0.2, `each at him: ${a}`);
  assert.deepEqual([...rates].sort(), [`strip ${PR.PAIR_TUNE.combo.rate}`, `swoop ${PR.PAIR_TUNE.combo.rate}`], 'twice the speed of their pictures');
  assert.ok(over > 0 && over - started < PR.PAIR_TUNE.combo.times * 3.6, `over, and quick: ${(over - started).toFixed(2)} s`);
  near(combo, PR.PAIR_TUNE.combo.every, 0.1, 'the next 30 s from its start');
  assert.equal(quillKept(q).mode, QMODE.free, 'the Quill free again');
});

test('4c. the Quill quick: its walk and its flight twice as fast as painted, its taking off and landing too', () => {
  assert.equal(PR.PAIR_TUNE.quick, 2);
  near(MONSTERS.quill.speed, PR.QL_PACE * PR.PAIR_TUNE.quick, 1e-9, 'its walk');
  near(PR.PAIR_TUNE.fly, PR.QL_FLY_PACE * PR.PAIR_TUNE.quick, 1e-9, 'its flight');
  near(MONSTERS.scraper.speed, PR.SR_PACE, 1e-9, 'the Scraper as slow as it was');
  const { g, q } = room();
  make(g, q, 'quill:takeoff', 14, 14);
  assert.equal(q.act?.rate, PR.PAIR_TUNE.quick, 'taking off');
  // (a 6-tile flight: there in its taking off, its flight at twice the pace, and its landing)
  const k = quillKept(q);
  k.mode = QMODE.going;
  k.what = 0;
  k.tx = q.x + 6;
  k.ty = q.y;
  q.act!.t = 0;
  let landed = -1;
  run(g, 4, (t) => {
    if (landed < 0 && q.act?.id === 'quill:land') {
      landed = t;
      assert.equal(q.act.rate, PR.PAIR_TUNE.quick, 'landing');
    }
    return landed > 0;
  });
  near(landed, PR.QL_TAKEOFF.long / 2 + 6 / PR.PAIR_TUNE.fly, 0.1, 'there so soon');
});

test('5. Overwrite: the Quill writes over the Scraper\'s wounds, healing it, until struck, or the Scraper burns, or in time', () => {
  const setup = (): { g: Game; s: Monster; q: Monster } => {
    const r = room();
    r.s.maxLife = 1000;
    r.s.life = 500;
    r.q.maxLife = r.q.life = 1e6;
    scraperKept(r.s).heal = 0;
    r.g.hero.x = 20;
    r.g.hero.y = 20;
    return r;
  };
  // (left to write: it heals `heal` a second, for `most` seconds)
  {
    const { g, s, q } = setup();
    let wrote = 0;
    let far = 0;
    run(g, 10, () => {
      if (q.act?.id === 'quill:write') {
        wrote += 1 / 60;
        far = Math.max(far, Math.hypot(q.x - s.x, q.y - s.y));
      }
      return false;
    });
    near(wrote, PR.PAIR_TUNE.overwrite.most, 0.1, 'it writes its while');
    near(s.life, 500 + 1000 * PR.PAIR_TUNE.overwrite.heal * PR.PAIR_TUNE.overwrite.most, 3, 'and heals so much');
    assert.ok(far > 0 && far <= PR.WRITE_AT.ahead + 0.3, `beside it as it writes: ${far}`);
    assert.equal(scraperKept(s).written, 0, 'done: no longer written over');
  }
  // (struck, it stops)
  {
    const { g, s, q } = setup();
    let struck = false;
    let stopped = -1;
    run(g, 10, (t) => {
      if (q.act?.id === 'quill:write' && q.act.t > 1 && !struck) {
        struck = true;
        hooks(g).damageMonster(q, 5, 'phys', false, -1);
      } else if (struck && stopped < 0 && q.act?.id !== 'quill:write') stopped = t;
      return stopped > 0;
    });
    assert.ok(struck && stopped > 0, 'a blow on the Quill stops it');
    assert.ok(s.life < 500 + 1000 * PR.PAIR_TUNE.overwrite.heal * 1.5, 'having healed only a little');
    assert.equal(quillKept(q).mode, QMODE.free, 'free again');
  }
  // (the Scraper burning, it stops)
  {
    const { g, s, q } = setup();
    let lit = false;
    let stopped = false;
    run(g, 10, () => {
      if (q.act?.id === 'quill:write' && q.act.t > 1 && !lit) {
        lit = true;
        s.burnT = 3;
        s.burnDps = 1;
      } else if (lit && q.act?.id !== 'quill:write') stopped = true;
      return stopped;
    });
    assert.ok(lit && stopped, 'the writing burns');
  }
});

test('6. one falling, the other fights on as the floor\'s boss, the way shut, part of a hoard; both, the way open, the whole', () => {
  const g = seasoned(new Game('warrior', 11), 1);
  g.depth = 13;
  g.cleared = 13;
  g.enterDungeon();
  const s = g.monsters.find((m) => m.kind === 'scraper')!;
  const q = g.monsters.find((m) => m.kind === 'quill')!;
  const W = g.level.ways!;
  const items = (): number => g.drops.filter((d) => d.kind === 'item').length;
  const before = items();
  g.kill(q);
  assert.equal(g.boss, s, 'the Scraper fights on, the floor\'s boss');
  assert.ok(!W.onward || !W.onward.awake, 'the way on still shut');
  const part = items() - before;
  assert.equal(part, 1, 'the first to fall: a piece of a hoard');
  g.kill(s);
  assert.equal(g.boss, null);
  assert.ok(W.onward && W.onward.awake, 'both fallen: the way on open');
  assert.ok(items() - before - part > 1, 'the last: the whole hoard');
});

test('7. the Quill in the air is struck, but held at the last of its life till it lands; nothing they draw is cyan', () => {
  const { g, s, q } = room();
  q.life = q.maxLife = 100;
  quillKept(q).mode = QMODE.going;
  const k = quillKept(q);
  k.what = 0;
  k.tx = 20;
  k.ty = 20;
  k.tfx = 1;
  k.tfy = 0;
  g.hero.x = 20;
  g.hero.y = 8;
  let flew = false;
  run(g, 6, () => {
    if (q.act?.id === 'quill:fly' && !flew) {
      flew = true;
      hooks(g).damageMonster(q, 60, 'phys', false, -1);
      assert.ok(q.life < 100, 'struck in the air');
      hooks(g).damageMonster(q, 500, 'phys', false, -1);
      assert.ok(!q.dead && q.life >= 1, 'held at the last of its life');
    }
    return flew && q.state !== 'act';
  });
  assert.ok(flew, 'it flew');
  hooks(g).damageMonster(q, 5, 'phys', false, -1);
  assert.ok(q.dead, 'landed, the next blow fells it');
  // (what they draw: the enemy's pink and gold, the Order's ink, never cyan)
  const r = room();
  for (const [m, id] of [[r.s, 'scraper:scour'], [r.s, 'scraper:strip'], [r.q, 'quill:lines']] as const) {
    make(r.g, m, id, m.x + 3, m.y + 3);
    run(r.g, 1.2);
  }
  const { ctx, colours } = noteColours();
  const c = { g: ctx, at: (x: number, y: number): readonly [number, number] => [(x - y) * 16, (x + y) * 8], game: r.g, t: 1, bestiary: makeBestiary(), stand: () => undefined, spot: () => undefined };
  for (const p of r.g.perils) act1Fx(p.a1!.split(':')[0])!.ground!(c, null, p);
  for (const m of [r.s, r.q]) act1Fx(m.kind)!.ground!(c, m, null);
  assert.ok(colours.size > 0, 'they are drawn');
  for (const col of colours) assert.ok(!cyan(col), `${col} is not cyan`);
  void s;
});
