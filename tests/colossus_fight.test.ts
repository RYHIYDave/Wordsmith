// THE SWAMP COLOSSUS'S FIGHT, ITS RULES (game/colossus_fight.ts; COLOSSUS on since 25.3.0). Held here: every
// line his tentacles slam along is the art chat's (docs/mockups/eye_redo/README.md, "EACH TURN'S LINE"); nowhere safe (his pick); a
// slam stepped out of misses; his waves sweep the whole stone, dodged through; both at once crash in the middle; his shovel's gaps,
// its hit knocking the hero toward his mouth, his snap too near; his maw reaching nothing onto the stone; the phases in his order,
// the flasks refilled between; phase 3 his way (8 Nov): no tentacles, he slides forward, his eye's attacks and the siege's rain.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import {
  ColossusFight, COLOSSUS, CHANGE3, ENTRANCE, HOOK, PACE, WAKE, ROOTS, SHOVEL, SLAM, SNAP, STONE, TURNS, WAVE, CRASH, BODY2, GAZE, poolR, EYE3, EYE_SLAM, eyeHome,
  slamLine, turnToward, offLine, waveFront, bodyStrikeFront, stoneToWorld, worldToStone,
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

test('the switch off: floor 10 is laid as it was, the Drowned Eye in his pool in its ring, his old rules', () => {
  assert.equal(COLOSSUS.on, true, 'on in the game');
  COLOSSUS.on = false;
  try {
  const g = new Game('warrior', 9);
  g.depth = 10;
  g.cleared = 9;
  g.enterDungeon();
  const land = g.level.land!;
  assert.ok(land.pool && land.ring, 'the pool and the ring');
  assert.equal(land.stone, undefined);
  assert.equal(land.landing, undefined);
  const boss = g.monsters.find((m) => m.boss)!;
  assert.equal(boss.kind, 'eye');
  assert.ok(Math.hypot(boss.x - land.pool!.x, boss.y - land.pool!.y) < 0.6, 'in the middle of his pool');
  } finally {
    COLOSSUS.on = true;
  }
});

test('the switch on: his stone laid on floor 10, an island with its jetty; the hero carried across from the landing; his fight begins as he steps onto it', () => {
  COLOSSUS.on = true;
  try {
    const g = new Game('warrior', 9);
    g.depth = 10;
    g.cleared = 9;
    g.enterDungeon();
    const L = g.level;
    const S = L.land!.stone!;
    assert.ok(S && L.land!.landing);
    let walk = 0;
    for (let u = 0.5; u < STONE.w; u += 1) for (let v = 0.5; v < STONE.d; v += 1) {
      const p = stoneToWorld(S, u, v);
      walk += L.walk[Math.floor(p.y) * L.floor.w + Math.floor(p.x)];
    }
    assert.ok(walk >= 160, `${walk} of 187 of the stone's tiles walked`);
    const boss = g.monsters.find((m) => m.boss)!;
    const at = worldToStone(S, boss.x, boss.y);
    assert.ok(near(at.u, 8.5, 0.01) && near(at.v, -7.9, 0.01), 'at his place in the water');
    const c = emptyControls();
    g.hero.x = L.land!.landing!.x;
    g.hero.y = L.land!.landing!.y;
    for (let i = 0; i < 180; i++) g.update(1 / 60, c);
    const on = worldToStone(S, g.hero.x, g.hero.y);
    assert.ok(near(on.u, 8.5, 0.01) && on.v > STONE.d, 'set down on the jetty');
    const mid = stoneToWorld(S, 8.5, 8);
    for (let i = 0; i < 60 * 12; i++) {
      g.hero.x = mid.x;
      g.hero.y = mid.y;
      g.hero.life = g.hero.d.maxLife;
      g.update(1 / 60, c);
    }
    const f = (boss.a1 as { fight?: ColossusFight }).fight!;
    assert.equal(f.mode, 'fight');
    const arms = g.monsters.filter((m) => m.kind === 'eye' && !m.boss && !m.dead);
    assert.equal(arms.length, 2, 'his two tentacles, monsters of their own');
    for (const m of arms) assert.ok(near(m.maxLife, boss.maxLife / 2, 1));
  } finally {
    COLOSSUS.on = true;
  }
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

test('his waking: the water still, nothing of him up and nothing hurting until his two tentacles burst up', () => {
  const f = new ColossusFight(new RNG(4));
  f.begin();
  const early = run(f, WAKE.rise - 0.05, () => ({ u: 8.5, v: 6, dodging: false }));
  assert.equal(f.arms.length, 0, 'no tentacles yet');
  assert.equal(early.filter((e) => e.t === 'armUp' || e.t === 'warn').length, 0);
  assert.equal(hurts(early).length, 0);
  const up = run(f, 0.1, () => ({ u: 8.5, v: 6, dodging: false }));
  assert.equal(up.filter((e) => e.t === 'armUp').length, 2, 'his two tentacles burst up');
  assert.ok(f.arms.every((a) => a.state === 'rise'));
});

test('a slam stood in hurts; stepped out of during its wind-up, it misses', () => {
  for (const step of [0, 1.3]) {
    const f = new ColossusFight(new RNG(3));
    f.begin();
  run(f, WAKE.rise + DT, () => ({ u: 8.5, v: 6, dodging: true }));
    run(f, WAKE.rise + DT, () => ({ u: 8.5, v: 6, dodging: true }));
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

test('phase 1: its two tentacles take turns, one warning at a time, a slam at most every 3 s (his “Half as often”)', () => {
  const f = new ColossusFight(new RNG(5));
  f.begin();
  run(f, WAKE.rise + DT, () => ({ u: 8.5, v: 6, dodging: true }));
  assert.equal(f.arms.length, 2);
  const starts = new Map<number, number[]>();
  let t = 0;
  for (let i = 0; i < 60 * 40; i++) {
    t += DT;
    for (const e of f.step(DT, { u: 8.5, v: 6, dodging: true })) if (e.t === 'warn') starts.set(e.id, [...(starts.get(e.id) ?? []), t]);
  }
  const all = [...starts.values()].flat().sort((a, b) => a - b);
  for (let i = 1; i < all.length; i++) assert.ok(all[i] - all[i - 1] >= PACE[1].gap * 1.5 - 0.05, `slams ${(all[i] - all[i - 1]).toFixed(2)} s apart`);
  assert.ok(all.length >= 11 && all.length <= 14, `${all.length} slams in 40 s`);
  for (const ts of starts.values()) assert.ok(ts.length >= 4, `one tentacle only ${ts.length} slams in 40 s`);
});

test('both killed: the flasks refilled, his entrance, three tentacles up, phase 2', () => {
  const f = new ColossusFight(new RNG(7));
  f.begin();
  run(f, WAKE.rise + DT, () => ({ u: 8.5, v: 6, dodging: true }));
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
  run(f, WAKE.rise + DT, () => ({ u: 8.5, v: 6, dodging: true }));
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

test("phase 2, his body's own attacks (the art's, his yes of 8 Nov): the bile arc lands where the hero stood as it began, its splash and burning pool hurt; the gaze ducks his middle tentacle and its beam hurts once as it crosses; rolled through, nothing", () => {
  const f = inPhase2(29);
  f.shovelIn = Infinity;
  f.waterIn = Infinity;
  // (his tentacles' slams aside: only his body's attacks counted)
  const mine = (ev: FightEvent[]): Extract<FightEvent, { t: 'hurt' }>[] => hurts(ev).filter((e) => e.by === 'bile' || e.by === 'pool' || e.by === 'gaze');
  const at = { u: 8.5, v: 6, dodging: false };
  let warned = -1;
  const got: FightEvent[] = [];
  for (let i = 0; i < 60 * 14 && warned < 0; i++) {
    const ev = f.step(DT, at);
    got.push(...ev);
    if (ev.some((e) => e.t === 'bileWarn')) warned = f.time;
  }
  assert.ok(warned > 0, 'a bile arc in phase 2');
  assert.equal(f.body2?.kind, 'bile');
  assert.ok(Math.abs(((f.body * 30) % 90) - BODY2.at) <= 1, `begun on his stand's frame ${BODY2.at}: ${((f.body * 30) % 90).toFixed(1)}`);
  assert.deepEqual(f.body2?.at, { u: 8.5, v: 6 });
  const after = run(f, BODY2.bile.long + 1.0, () => at);
  const landed = after.findIndex((e) => e.t === 'bile');
  assert.ok(landed >= 0);
  const m = mine(after);
  assert.equal(m.filter((e) => e.by === 'bile').length, 1, 'the splash');
  assert.ok(m.filter((e) => e.by === 'pool').length >= 2, 'the pool burning him');
  assert.ok(near(poolR(1.0), BODY2.bile.pool.r, 1e-9) && poolR(BODY2.bile.pool.life) === 0);
  // the gaze next: his middle tentacle ducks through it, the beam hurts once
  let gazed = false;
  const g2: FightEvent[] = [];
  for (let i = 0; i < 60 * 14 && !(gazed && !f.body2); i++) {
    const ev = f.step(DT, { u: 11, v: 5, dodging: false });
    g2.push(...ev);
    if (ev.some((e) => e.t === 'gazeWarn')) {
      gazed = true;
      const mid = f.arms.find((a) => a.side === 'm');
      assert.equal(mid?.state, 'duck', 'his middle tentacle ducks out of the arc');
      assert.ok(Math.abs((f.body2?.a1 ?? 0) - (f.body2?.a0 ?? 0) - 2 * GAZE.half) < 1e-9);
    }
  }
  assert.ok(gazed);
  assert.equal(mine(g2).filter((e) => e.by === 'gaze').length, 1, 'the beam, once');
  assert.notEqual(f.arms.find((a) => a.side === 'm')?.state, 'duck', 'back up after');
  // rolled through: nothing of his body's
  const r = inPhase2(29);
  r.shovelIn = Infinity;
  r.waterIn = Infinity;
  assert.equal(mine(run(r, 30, () => ({ u: 8.5, v: 6, dodging: true }))).length, 0);
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

test('phase 3 (his 8 Nov idea, as the art drew it): no tentacles; he slides forward; his gaze and his eye slam by turns, each begun as his stand comes round, at the baked aims and spots; the siege raining while a pillar burns', () => {
  const f = inPhase2(29);
  for (const a of [...f.arms]) f.armKilled(a.id);
  // (the change: his stand to its frame 24, then his slide from there; the grip on its frame 103)
  let grip = -1;
  let begun = -1;
  const got: FightEvent[] = [];
  for (let i = 0; i < Math.round((1 + 3 + CHANGE3.long + 0.2) / DT); i++) {
    for (const e of f.step(DT, { u: 8.5, v: 6, dodging: true })) {
      got.push(e);
      if (e.t === 'change') begun = f.time;
      if (e.t === 'grip') grip = f.time;
    }
  }
  assert.equal(f.ph, 3);
  assert.ok(begun > 0 && near(grip - begun, (24 + 103) / 30, 0.05), `the grip ${grip - begun}`);
  assert.equal(got.filter((e) => e.t === 'armUp').length, 0, 'no tentacles in phase 3');
  // his place and his eye's (the art's numbers)
  assert.ok(near(eyeHome().v, 1.52, 0.01) && near(eyeHome().u, 8.5, 1e-9));
  for (const [u, v] of EYE3.spots) {
    assert.ok(u >= 0 && u <= STONE.w && v >= 0 && v <= STONE.d, `a spot on the stone ${u}, ${v}`);
    assert.ok(Math.hypot(u - eyeHome().u, v - eyeHome().v) <= EYE_SLAM.reach + 1e-9, 'within his reach');
  }
  // his attacks: each as his stand comes round (frame 0 of it), at a baked spot or aim
  const later: FightEvent[] = [];
  for (let i = 0; i < Math.round(14 / DT); i++) {
    for (const e of f.step(DT, { u: 8.5, v: 6, dodging: false })) {
      later.push(e);
      if (e.t === 'gazeWarn' || e.t === 'eyeWarn') {
        const c = (f.body * 30) % 90;
        assert.ok(c < 1.5 || c > 88.5, `begun on his stand's frame ${c}`);
        const E = f.eye!;
        if (E.kind === 'slam') assert.deepEqual([E.at.u, E.at.v], EYE3.spots[E.pic]);
        else assert.ok(near(E.a0 + GAZE.half, EYE3.aims[E.pic], 1e-9) && near(E.a1 - GAZE.half, EYE3.aims[E.pic], 1e-9) && E.at.u === EYE3.gazeAt.u, 'the gaze along a baked aim, his left to his right');
      }
    }
  }
  assert.ok(later.some((e) => e.t === 'gazeWarn') && later.some((e) => e.t === 'eyeWarn'), 'his gaze and his eye slam');
  assert.ok(later.filter((e) => e.t === 'rainWarn').length >= 9, 'the siege raining');
  const by = new Set(hurts(later).map((e) => e.by));
  for (const k of ['gaze', 'eye', 'rain']) assert.ok(by.has(k as never), `standing still, hurt by ${k}`);
  assert.ok(!later.some((e) => e.t === 'warn' || e.t === 'smashWarn' || e.t === 'sink'), 'no slams, waves or shovel');
  // his eye reached (his ward turning blows while a pillar burns is the game's); from the stone's back edge
  const at = f.bodyStruck()!;
  assert.ok(at, 'his eye in reach');
  assert.ok(Math.hypot(at.at.u - 8.5, at.at.v - 0.3) - at.r < 0.6, 'reached from the back edge');
  // struck at rest, it flinches from the nearest of his stand's frames baked
  while (f.eye) f.step(DT, { u: 8.5, v: 6, dodging: true });
  f.eyeHit();
  assert.ok(f.struck && EYE3.struckFrom.includes(f.struck.from), 'his eye flinches');
  // the siege broken: no more bolts
  f.siege = false;
  const quiet = run(f, 6, () => ({ u: 8.5, v: 6, dodging: true }));
  assert.equal(quiet.filter((e) => e.t === 'rainWarn').length, 0, 'no bolts once the pillars are out');
  assert.deepEqual(f.bodyKilled(), [{ t: 'won' }]);
});
