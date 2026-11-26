// THE BRAWLER'S SWIPE, CARRYING THE FIRST LIT GLOBE: THE FLYING DOUBLE HAMMERFIST AND THE FLYING KNEE (the skins chat, 26 Nov 2026;
// dev/veteran_moves.ts HAMMERFIST, FLYKNEE; the queue's “Draw the Brawler's flying double hammerfist and his flying knee”). His idea:
// “Then have his swipe can be something like an interrupt to the combo, but whatever globe is next is now added to the swipe, so
// either a flying double hamerfist or a flying knee”; his three clips of a hammerfist, 26 Nov 2026, 07:41. His art rules: every
// frame from all eight sides clean (crisp, the friend's edge, no pink, nothing cut off, nothing in the floor, nothing through his
// body or what he wears, every joint as a body bends), slick, his feet gripping the floor; a big held wind-up, the blow in two
// frames; the force in the blow's colour, never pink, gold or cyan. And for the game: both carried only in the air (so the carry
// may be stretched to where the swipe points), the rules' numbers the art's.
//   run: npx tsx --test tests/vet_flying.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { FK_GO, HF_GO, VET_TILE, carryAt, forceGeo, inAir, motionById, placeOf, poseAt, skel, vetAt, worldOf } from '../src/dev/veteran_moves';
import type { VetMotion } from '../src/dev/veteran_moves';
import { VET_CANVAS, paintVeteran } from '../src/dev/sculpt_veteran';
import { MORE_TURN } from '../src/art/sides_more';
import { VET_LISTS } from '../src/art/veteran_art';
import { VET_MOVES, VET_REACT } from '../src/game/veteran';
import { VET_BAKED } from '../src/game/veteran_baked';
import { FX_KICK, FX_PUNCH, forceRing, globeFlame, ringCracks, ringStones } from '../src/dev/veteran_fx';
import { Px } from '../src/engine/px';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { coverFindings, jointFindings } from './veteran_checks';
import { slickFindings } from './vet_motion_checks';
import { hsv } from './floor_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; equal(a: unknown, b: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;

const HF = motionById('hammerfist');
const FK = motionById('flyknee');
const BOTH: VetMotion[] = [HF, FK];
const framesOf = (m: VetMotion): number[] => Array.from({ length: m.long + 1 }, (_, i) => i);
const dist = (a: readonly number[], b: readonly number[]): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

for (const m of BOTH) {
  test(`${m.name} (${m.id}): every frame from all eight of the game's sides: crisp, the friend's edge, no pink, nothing cut off, nothing in the floor, his body clean, nothing through what he wears`, () => {
    const found: string[] = [];
    for (const f of framesOf(m)) {
      const p = vetAt(m, f);
      for (const v of Object.values(MORE_TURN)) {
        const turn = v + placeOf(m, f).turn;
        const d = paintVeteran(p, turn);
        for (const x of pictureFindings(d.px)) found.push(`f${f} ${v}: ${x}`);
        for (const x of coverFindings(d, turn, VET_CANVAS.ax, VET_CANVAS.ay)) found.push(`f${f} ${v}: ${x}`);
        for (const x of bodyFindings(d.fig.sc, true)) if (!(p.air && x.startsWith('standing on nothing'))) found.push(`f${f} ${v}: ${x}`);
      }
    }
    assert.deepEqual([...new Set(found)], []);
  });

  test(`${m.name} (${m.id}): every joint as a body bends it; slick; a foot down on the floor held where it is`, () => {
    const found: string[] = [];
    for (const f of framesOf(m)) {
      const p = vetAt(m, f);
      for (const x of jointFindings(p.s, p)) found.push(`f${f}: ${x}`);
    }
    assert.deepEqual([...found, ...slickFindings(m)], []);
  });

  test(`${m.name} (${m.id}): carried only in the air (from his take-off to his landing), so the game may stretch it to where the swipe points`, () => {
    for (let f = 1; f <= m.long; f++) {
      const up = inAir(skel(poseAt(m, f))) || inAir(skel(poseAt(m, f - 1)));
      if (!up) assert.ok(Math.abs(carryAt(m, f)[0] - carryAt(m, f - 1)[0]) < 0.01, `${m.id}: carried at f${f} with a foot down`);
    }
    assert.ok(carryAt(m, 0)[0] === 0, 'not carried before he leaps');
  });

  test(`${m.name} (${m.id}): the rules' numbers are the art's (its frames, its blow, its frames in the air, how far it carries him), and it is among his lists`, () => {
    const r = VET_MOVES[m.id as keyof typeof VET_MOVES];
    const s = m.strikes[0];
    assert.equal(r.long, m.long);
    assert.deepEqual([r.strike?.from, r.strike?.at, r.strike?.kind], [s.from, s.at, s.kind]);
    const air = framesOf(m).filter((f) => inAir(skel(poseAt(m, f))));
    assert.deepEqual(r.air, [air[0], air[air.length - 1]], `${m.id}: in the air`);
    assert.ok(Math.abs(r.carry[0] - carryAt(m, m.long)[0] / VET_TILE) < 0.01, `${m.id}: carried ${carryAt(m, m.long)[0] / VET_TILE} tiles`);
    assert.equal(r.force?.shape, s.force?.shape);
    assert.ok(Math.abs((r.force?.reach ?? 0) - (s.force?.reach ?? 0) / VET_TILE) < 0.01, `${m.id}: its reach`);
    assert.equal(r.force?.react, s.force?.react);
    assert.ok(VET_LISTS.includes(m.id as never), `${m.id}: among his lists`);
    assert.equal(VET_BAKED[m.id as keyof typeof VET_BAKED].long, m.long, `${m.id}: baked for the rules`);
  });
}

test('the flying double hammerfist: at the top both fists clasped together high over his head, held; at the blow both on the floor before his feet, in two frames; a ring of force two tiles round where they strike knocks down all in it, and no one outside it', () => {
  const s = HF.strikes[0];
  assert.equal(s.at - s.from, 2, 'the slam in two frames');
  const top = skel(poseAt(HF, s.from));
  assert.ok(dist(top.handL, top.handR) < 7.5, `the fists ${dist(top.handL, top.handR).toFixed(1)} apart: clasped`);
  assert.ok(Math.min(top.handL[2], top.handR[2]) > top.head[2] + 10, 'the fists high over his head');
  assert.ok(top.head[0] < top.pelvis[0] - 6, 'his back arched right back (his head behind his hips)');
  // (held: the fists barely move over the frames before the slam, against how far they go in it)
  const before = skel(poseAt(HF, s.from - 3));
  const blow = skel(poseAt(HF, s.at));
  assert.ok(dist(before.handR, top.handR) < 0.15 * dist(top.handR, blow.handR), 'the hang held');
  // (the blow: both fists on the floor before his feet, his feet down)
  for (const h of [blow.handL, blow.handR]) assert.ok(h[2] < 10 && h[0] > blow.pelvis[0] + 10, 'the fists on the floor before him');
  assert.ok(!inAir(blow), 'landed as the fists strike');
  // (the ring: round the floor under the fists, two tiles)
  const g = forceGeo(HF, s);
  const fist = worldOf(HF, s.at, blow.handR);
  assert.equal(g.shape, 'ring');
  assert.ok(Math.hypot(g.o[0] - fist[0], g.o[1] - fist[1]) < 0.5 && g.o[2] < 2, 'round the floor under the fists');
  assert.ok(Math.abs(g.r1 - 2 * VET_TILE) < 0.01, 'two tiles round');
  assert.ok(Math.abs(carryAt(HF, HF.long)[0] - HF_GO) < 0.01, `flown ${HF_GO / VET_TILE} tiles at them`);
  // (who it reaches: the three about him knocked down, each once; the one outside it not)
  const hit = s.hits.map((h) => h.foe).sort();
  assert.deepEqual(hit, [0, 1, 2]);
  assert.ok(s.hits.every((h) => h.react === 'floored' && h.f >= s.at), 'knocked down, after the fists strike');
  assert.ok(VET_REACT.floored && (VET_REACT.floored.stun ?? 0) > 0, 'the rules knock them down');
  // (the punch globe he carries burns on his fists from his leap to the slam)
  assert.deepEqual(HF.flame, { joint: 'fists', from: 8, to: s.at, kind: 'punch' });
});

test('the flying knee: the knee cocked back as he flies, held; at the blow the thigh up level, the knee leading him, at their chest; a narrow straight line of force on through the one before him', () => {
  const s = FK.strikes[0];
  assert.equal(s.at - s.from, 2, 'the knee in two frames');
  const cock = skel(poseAt(FK, s.from));
  assert.ok(cock.kneeR[0] < cock.pelvis[0], 'cocked: the knee drawn back behind his hips');
  assert.ok(inAir(cock), 'flying as it is cocked (out of a run or a combo, not after a jump)');
  const before = skel(poseAt(FK, s.from - 2));
  const k = skel(poseAt(FK, s.at));
  assert.ok(dist(before.kneeR, cock.kneeR) < 0.15 * dist(cock.kneeR, k.kneeR), 'the cocked knee held');
  const thigh = [k.kneeR[0] - k.hipR[0], k.kneeR[1] - k.hipR[1], k.kneeR[2] - k.hipR[2]];
  assert.ok(thigh[2] > -0.2 * Math.hypot(...thigh), 'the thigh up level');
  for (const j of ['handL', 'handR', 'toeL', 'toeR', 'head', 'ankleR'] as const) assert.ok(k.kneeR[0] >= k[j][0], `the knee leading him (the ${j} further forward)`);
  assert.ok(k.kneeR[2] > 40, `the knee ${k.kneeR[2].toFixed(1)} over the floor: at their chest`);
  const g = forceGeo(FK, s);
  assert.ok(g.shape === 'cone' && (s.force?.deg ?? 99) <= 30 && Math.abs(g.dir) < 0.05, 'a narrow cone straight on');
  assert.ok(g.r1 > 1.2 * VET_TILE, 'on past him');
  assert.deepEqual(s.hits.map((h) => [h.foe, h.react]), [[0, 'kneed']], 'the one before him');
  assert.ok(Math.abs(carryAt(FK, FK.long)[0] - FK_GO) < 0.01, `flown ${FK_GO / VET_TILE} tiles at them`);
  assert.deepEqual(FK.flame, { joint: 'kneeR', from: 9, to: s.at, kind: 'kick' });
  // (the knee of combo 2 kept as it was)
  assert.equal(motionById('knee').long, 58);
});

test('the ring of force, its stones and cracks, and the globe burning on him: crisp, the blow\'s colour or the floor\'s stone, never pink, gold or cyan', () => {
  const cyan = (h: number, s: number, v: number): boolean => h >= 170 && h <= 200 && s > 0.45 && v > 0.45;
  for (const [cols, want] of [[FX_PUNCH, 'green'], [FX_KICK, 'orange']] as const) {
    const px = new Px(260, 180);
    const to = (q: readonly number[]): [number, number] => [130 + 0.82 * (q[0] + q[1]), 110 + 0.41 * (q[0] - q[1]) - q[2]];
    for (const age of [0, 3, 8]) {
      forceRing(px, to, [0, 0, 1], 20 + age * 8, 13, cols, age, 0, 7);
      ringStones(px, to, [0, 0, 1], 20 + age * 8, 78, cols, age, 7);
      ringCracks(px, to, [0, 0, 1], 78, cols, age, 7);
    }
    globeFlame(px, 40, 40, 5, cols, 3, 1, [4, -1]);
    let saw = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      assert.ok(a === 0 || a === 255, 'a pixel neither there nor not');
      if (!a) continue;
      saw++;
      const [h, sat, v] = hsv(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(h >= 290 && h <= 352 && sat > 0.4 && v > 0.4), `${want}: pink`);
      assert.ok(!(h >= 38 && h <= 64 && sat > 0.45 && v > 0.55), `${want}: gold`);
      assert.ok(!cyan(h, sat, v), `${want}: the friend's cyan`);
    }
    assert.ok(saw > 800, `${want}: painted (${saw})`);
  }
});
