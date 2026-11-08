// THE SWAMP COLOSSUS'S FIGHT, ITS RULES (game/colossus_fight.ts; COLOSSUS off: nothing of the game uses it yet). Held here: every
// line his tentacles slam along is the art chat's (docs/mockups/eye_redo/README.md, "EACH TURN'S LINE"); nowhere safe (his pick); a
// slam stepped out of misses; his waves sweep the whole stone, dodged through; both at once crash in the middle; his shovel's gaps,
// its hit knocking the hero toward his mouth, his snap too near; his maw reaching nothing onto the stone; the phases in his order,
// the flasks refilled between; phase 3's rain and his body.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { RNG } from '../src/engine/rng';
import {
  ColossusFight, COLOSSUS, ENTRANCE, HOOK, PACE, ROOTS, SHOVEL, SLAM, SNAP, STONE, TURNS, WAVE, CRASH,
  slamLine, turnToward, offLine, waveFront, bodyStrikeFront,
} from '../src/game/colossus_fight';
import type { FightEvent, HeroOnStone } from '../src/game/colossus_fight';

const near = (a: number, b: number, by: number): boolean => Math.abs(a - b) <= by;
const DT = 1 / 60;
const hurts = (ev: FightEvent[]): Extract<FightEvent, { t: 'hurt' }>[] => ev.filter((e): e is Extract<FightEvent, { t: 'hurt' }> => e.t === 'hurt');

function run(f: ColossusFight, secs: number, hero: (t: number) => HeroOnStone): FightEvent[] {
  const all: FightEvent[] = [];
  const n = Math.round(secs / DT);
  for (let i = 0; i < n; i++) all.push(...f.step(DT, hero(f.time)));
  return all;
}

test('the switch is off, and nothing of the game uses the fight yet', () => {
  assert.equal(COLOSSUS.on, false);
  const walk = (d: string): string[] => readdirSync(d).flatMap((n: string) => (statSync(`${d}/${n}`).isDirectory() ? walk(`${d}/${n}`) : [`${d}/${n}`]));
  const users = walk('src').filter((p) => p.endsWith('.ts') && !p.endsWith('colossus_fight.ts') && readFileSync(p, 'utf8').includes('colossus_fight'));
  assert.deepEqual(users, []);
});

test("every slam's line is the art chat's (the README's table, in tiles from its root)", () => {
  const L1 = ROOTS[1][0];
  const L2 = ROOTS[2][0];
  const M = ROOTS[2][1];
  const R2 = ROOTS[2][2];
  const table: [number, number, number][] = [
    [L1, 0, 12.4], [L1, -75, 5.9], [L1, -45, 8.0], [L1, -24, 13.5], [L1, 42, 16.7], [L1, 45, 16.0], [L1, 78, 11.6],
    [L2, -60, 3.3], [L2, -15, 11.0], [L2, 48, 18.5], [L2, 78, 14.5],
    [M, 0, 12.4], [M, 36, 14.5], [M, 78, 8.7], [M, -78, 8.7],
    [R2, 60, 3.3], [R2, -48, 18.5],
  ];
  for (const [u, deg, len] of table) assert.ok(near(slamLine(u, deg).len, len, 0.06), `root ${u.toFixed(2)} at ${deg}: ${slamLine(u, deg).len.toFixed(2)} not ${len}`);
});

test('NOWHERE SAFE: in each phase every spot of the stone lies in some line, and the line laid toward the hero always reaches him', () => {
  for (const ph of [1, 2] as const) {
    const ranges = TURNS[ph];
    for (let u = 0.1; u < STONE.w; u += 0.25) for (let v = 0.1; v < STONE.d; v += 0.25) {
      let any = false;
      ROOTS[ph].forEach((ru, k) => {
        if (any) return;
        const turn = turnToward(ru, ranges[k], { u, v });
        if (offLine({ u, v }, slamLine(ru, turn)) <= SLAM.width / 2) any = true;
      });
      assert.ok(any, `phase ${ph}: (${u.toFixed(2)}, ${v.toFixed(2)}) in no line`);
    }
  }
});

test('a slam stood in hurts; stepped out of during its wind-up, it misses', () => {
  for (const step of [0, 1.3]) {
    const f = new ColossusFight(new RNG(3));
    f.begin();
    let at = { u: 5.67, v: 6 };
    let side = 0;
    const got: FightEvent[] = [];
    for (let i = 0; i < 60 * 8; i++) {
      const ev = f.step(DT, { ...at, dodging: false });
      got.push(...ev);
      const w = ev.find((e) => e.t === 'warn');
      if (w && w.t === 'warn' && side === 0) {
        // step across the line, square to it
        const ex = w.line.b.u - w.line.a.u;
        const ey = w.line.b.v - w.line.a.v;
        const l = Math.hypot(ex, ey);
        at = { u: at.u - (ey / l) * step, v: at.v + (ex / l) * step };
        side = 1;
      }
      if (side === 1 && got.some((e) => e.t === 'slam')) break;
    }
    const h = hurts(got).filter((e) => e.by === 'slam');
    assert.equal(h.length, step === 0 ? 1 : 0, `stepping ${step}`);
  }
});

test('phase 1: its two tentacles take turns, one warning at a time, each slamming every 3 to 4.5 s', () => {
  const f = new ColossusFight(new RNG(5));
  f.begin();
  assert.equal(f.arms.length, 2);
  const starts = new Map<number, number[]>();
  let t = 0;
  for (let i = 0; i < 60 * 40; i++) {
    t += DT;
    for (const e of f.step(DT, { u: 8.5, v: 6, dodging: true })) if (e.t === 'warn') starts.set(e.id, [...(starts.get(e.id) ?? []), t]);
  }
  const all = [...starts.values()].flat().sort((a, b) => a - b);
  for (let i = 1; i < all.length; i++) assert.ok(all[i] - all[i - 1] > SLAM.hit, 'two warnings laid at once');
  for (const ts of starts.values()) {
    assert.ok(ts.length >= 7, `only ${ts.length} slams in 40 s`);
    for (let i = 1; i < ts.length; i++) assert.ok(ts[i] - ts[i - 1] >= 2.95 && ts[i] - ts[i - 1] <= 4.51 + 1.5, `a gap of ${(ts[i] - ts[i - 1]).toFixed(2)} s`);
  }
});

test('both killed: the flasks refilled, his entrance, three tentacles up, phase 2', () => {
  const f = new ColossusFight(new RNG(7));
  f.begin();
  run(f, 3, () => ({ u: 8.5, v: 6, dodging: true }));
  const ev = [...f.armKilled(f.arms[0].id), ...f.armKilled(f.arms[1].id)];
  assert.ok(ev.some((e) => e.t === 'flasks'));
  const later = run(f, 1 + 3 + ENTRANCE.long + 0.2, () => ({ u: 8.5, v: 6, dodging: false }));
  const ch = later.findIndex((e) => e.t === 'change');
  assert.ok(ch >= 0);
  assert.equal(later.filter((e) => e.t === 'armUp').length, 3);
  assert.ok(later.some((e) => e.t === 'phase' && e.ph === 2));
  assert.equal(f.ph, 2);
  assert.equal(hurts(later).length, 0, 'nothing hurts while he changes');
});

function inPhase2(seed: number): ColossusFight {
  const f = new ColossusFight(new RNG(seed));
  f.begin();
  for (const a of [...f.arms]) f.armKilled(a.id);
  run(f, 1 + 3 + ENTRANCE.long + 0.1, () => ({ u: 8.5, v: 6, dodging: true }));
  assert.equal(f.ph, 2);
  return f;
}

test('the water slams in his order, left, right, both; each wave sweeps the whole depth and is dodged through', () => {
  const f = inPhase2(11);
  f.shovelIn = Infinity;
  const order: string[] = [];
  const got: FightEvent[] = [];
  let t = 0;
  let smashAt = -1;
  for (let i = 0; i < 60 * 40; i++) {
    t += DT;
    const ev = f.step(DT, { u: 12, v: 10.5, dodging: false });
    got.push(...ev);
    for (const e of ev) if (e.t === 'smashWarn') order.push(e.from);
    if (smashAt < 0 && ev.some((e) => e.t === 'smash')) smashAt = t;
  }
  assert.deepEqual(order.slice(0, 4), ['l', 'r', 'l', 'r'], 'left, right, then both (a pair)');
  assert.ok(got.some((e) => e.t === 'crash'));
  assert.ok(hurts(got).filter((e) => e.by === 'wave').length >= 2, 'the near edge is not safe from a wave');
  // a wave's front at the back crosses the far end 2.94 s after its smash
  assert.ok(near(waveFront('l', 2.94, 0), STONE.w, 0.05));
  assert.ok(near(waveFront('r', 2.94, 0), 0, 0.05));
  // rolling through it untouched
  const g = inPhase2(11);
  g.shovelIn = Infinity;
  const rolled = run(g, 40, () => ({ u: 12, v: 10.5, dodging: true }));
  assert.equal(hurts(rolled).length, 0);
});

test('both at once: they meet in the middle 1.56 s after the smash, the crash hurts there, the surge slows him', () => {
  const f = inPhase2(13);
  f.shovelIn = Infinity;
  f.waterNext = 'both';
  f.waterIn = 0;
  let smash = -1;
  let crash = -1;
  const got: FightEvent[] = [];
  let surgePace = 1;
  for (let i = 0; i < 60 * 12 && crash < 0; i++) {
    const ev = f.step(DT, { u: 8.5, v: 1.0, dodging: false });
    got.push(...ev);
    if (smash < 0 && ev.filter((e) => e.t === 'smash').length === 2) smash = f.time;
    if (ev.some((e) => e.t === 'crash')) crash = f.time;
  }
  assert.ok(smash > 0 && crash > 0);
  assert.ok(near(crash - smash, (STONE.w / 2 + WAVE.off) / WAVE.speed, 0.05), `${(crash - smash).toFixed(2)}`);
  got.push(...run(f, 1, () => ({ u: 8.5, v: 1.0, dodging: false })));
  assert.ok(hurts(got).some((e) => e.by === 'crash'));
  surgePace = f.paceAt({ u: 8.5, v: 5 });
  assert.equal(surgePace, CRASH.slow);
  assert.equal(f.paceAt({ u: 0.5, v: 5 }), 1);
});

function shovelling(seed: number, end: 'l' | 'r'): ColossusFight {
  for (let s = seed; ; s++) {
    const f = inPhase2(s);
    f.waterIn = Infinity;
    f.shovelIn = 0;
    for (let i = 0; i < 60 * 8 && !f.shovel; i++) f.step(DT, { u: 8.5, v: 6, dodging: true });
    if (f.shovel && f.shovel.end === end) return f;
  }
}

test("the shovel: weaving through the gaps as his drawing has it, nothing hits; standing in a hook's way, it knocks him toward the mouth", () => {
  for (const end of ['l', 'r'] as const) {
    const f = shovelling(17, end);
    const t0 = f.time;
    const weave = (t: number): HeroOnStone => {
      const s = t - t0;
      const back = s < SHOVEL.hooks[1].at || (s >= SHOVEL.hooks[2].at && s < SHOVEL.hooks[3].at);
      return { u: 8.5, v: back ? 9.4 : 2.2, dodging: false };
    };
    const got = run(f, SHOVEL.long + 0.5, weave);
    assert.equal(hurts(got).length, 0, `${end}: hurt weaving`);
    assert.equal(got.filter((e) => e.t === 'hook').length, 4);
    assert.ok(got.some((e) => e.t === 'armUp'), 'his tentacles back up with him');
    const g = shovelling(17, end);
    const stood = run(g, SHOVEL.long + 0.5, () => ({ u: 8.5, v: 5.5, dodging: false }));
    const h = hurts(stood).filter((e) => e.by === 'scrape');
    assert.equal(h.length, 4, `${end}: the middle of the stone is in every hook's reach`);
    for (const e of h) assert.ok(end === 'l' ? e.du < 0 && e.du >= -HOOK.knock : e.du > 0 && e.du <= HOOK.knock, 'knocked toward his mouth');
  }
});

test('his snap: too near his gaping maw, he twitches and slams shut for massive damage; just clear, nothing', () => {
  for (const [from, hit] of [[1.0, true], [3.8, false]] as const) {
    const f = shovelling(19, 'l');
    const t0 = f.time;
    const got = run(f, SHOVEL.long, (t) => ({ u: t - t0 > SHOVEL.gape[0] ? from : 8.5, v: 5.5, dodging: false }));
    const s = hurts(got).filter((e) => e.by === 'snap');
    if (hit) {
      assert.ok(got.some((e) => e.t === 'twitch'));
      assert.ok(s.length >= 1);
      assert.equal(s[0].mult, 3.0);
    } else assert.equal(s.length + got.filter((e) => e.t === 'twitch').length, 0);
  }
  assert.ok(SNAP.shut > 0.2, 'the twitch is held before he shuts');
});

test('his maw reaches nothing onto the stone at an end; the hero is never knocked off it', () => {
  assert.ok(near(bodyStrikeFront(), -0.32, 0.03), `${bodyStrikeFront()}`);
  const f = shovelling(23, 'r');
  const t0 = f.time;
  const got = run(f, SHOVEL.long, (t) => ({ u: 14.5, v: 5.5, dodging: false }));
  for (const e of hurts(got)) if (e.by === 'scrape') assert.ok(14.5 + e.du <= STONE.w - 0.3 + 1e-9);
  void t0;
});

test('phase 3: his tentacles up again, the siege raining down, his body struck only with the pillars out', () => {
  const f = inPhase2(29);
  for (const a of [...f.arms]) f.armKilled(a.id);
  f.shielded = true;
  const got = run(f, 1 + 3 + 4.2, () => ({ u: 8.5, v: 6, dodging: true }));
  assert.equal(f.ph, 3);
  assert.equal(got.filter((e) => e.t === 'armUp').length, 3);
  const later = run(f, 8, () => ({ u: 8.5, v: 6, dodging: false }));
  assert.ok(later.filter((e) => e.t === 'rainWarn').length >= 6);
  assert.ok(hurts(later).some((e) => e.by === 'rain'));
  assert.equal(f.bodyStruck(), null);
  f.shielded = false;
  if (!f.shovel) assert.ok(f.bodyStruck());
  assert.deepEqual(f.bodyKilled(), [{ t: 'won' }]);
  void PACE;
});
