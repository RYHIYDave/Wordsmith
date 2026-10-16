// THE EYESPAWN, FLOOR 10'S MEDIUM MOB (src/art/eyespawn.ts; a mock-up nothing of the game imports), held to his
// rulebook before he sees it: crisp in every frame, the enemy's pink edge round it while it lives, nothing cyan and
// every light the enemy's fire, nothing of it cut off at its canvas's edge; its size (his pick: the knight's height);
// its one staring eye (his pick), his eye small: its iris the enemy's fire, looking at you from in front, its light
// gold; its back its flesh.
//   run: tsx --test tests/eyespawn.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { ES_DIE, ES_GAZE, ES_HABITS, ES_HATCH, ES_LASH, ES_PACE, ES_R, ES_REEL, ES_STAND, ES_WALK, IRIS, SPAWN_ON, beamAt, dyingSpec, eyespawnPainted, eyespawnPose, gazeSpec, hatchSpec, haulSpec, lashSpec, makeEyespawnArt, reelSpec, standPose, standSpec } from '../src/art/eyespawn';
import type { Spec } from '../src/art/eyespawn';
import { TILE3 } from '../src/art/new_mobs3';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { rgba } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const IRIS_SET = new Set(IRIS.slice(1).map((c) => rgba(c).slice(0, 3).join(',')));
const VIEWS = ['front', 'back'] as const;
type Frame = { name: string; t: number; view: string; px: Px; lights: { color: string }[] };
const living: Frame[] = [];
for (let i = 0; i < Math.round(ES_STAND * 15); i++) for (const view of VIEWS) {
  const p = eyespawnPainted('stand', i / 15, view);
  living.push({ name: `eyespawn stand ${view} ${(i / 15).toFixed(2)}`, t: i / 15, view, px: p.px, lights: p.lights });
}
function hue(r: number, g: number, b: number): [number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max];
}
const moving: Frame[] = [];
const moves: [string, number, number][] = [['walk', ES_WALK.frames / ES_WALK.fps, 1], ['attack', ES_LASH.long, 2], ['gaze', ES_GAZE.long, 2], ['reel', ES_REEL, 1], ['hatch', ES_HATCH.long, 2]];
for (const [mv, long, every] of moves) for (let i = 0; i <= Math.round(long * 30); i += every) for (const view of VIEWS) {
  const p = eyespawnPainted(mv, i / 30, view);
  moving.push({ name: `eyespawn ${mv} ${view} ${(i / 30).toFixed(2)}`, t: i / 30, view, px: p.px, lights: p.lights });
}
const dying: Frame[] = [];
for (let i = 0; i <= ES_DIE.long * 20; i++) for (const view of VIEWS) {
  const p = eyespawnPainted('dying', i / 20, view);
  dying.push({ name: `eyespawn dying ${view} ${(i / 20).toFixed(2)}`, t: i / 20, view, px: p.px, lights: p.lights });
}
/** How far apart two poses are (as numbers): the most any of them differs. */
function gap(a: Spec, b: Spec): number {
  let g = Math.max(...a.E.map((v, i) => Math.abs(v - b.E[i])), Math.abs(a.fy - b.fy), Math.abs(a.ly - b.ly), Math.abs(a.lid - b.lid) * 10, Math.abs(a.size - b.size) * 10);
  a.tips.forEach((q, i) => (g = Math.max(g, ...q.map((v, k) => Math.abs(v - b.tips[i][k])))));
  a.arms.forEach((A, i) => (g = Math.max(g, Math.abs(A.rise - b.arms[i].rise) * 10, Math.abs(A.reach - b.arms[i].reach) * 10, Math.abs(A.swing - b.arms[i].swing), Math.abs(A.lag - b.arms[i].lag))));
  return g;
}
const irisOf = (px: Px): number => {
  let n = 0;
  for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] === 255 && IRIS_SET.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) n++;
  return n;
};
const blinking = (t: number): boolean => t > ES_HABITS.blink[0] - 0.02 && t < ES_HABITS.blink[1] + 0.02;

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(SPAWN_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('eyespawn.ts')) continue;
    assert.ok(!/from ['"][^'"]*\/eyespawn['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the Eyespawn`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge), and the pink edge round it while it lives', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const { name, px } of [...living, ...moving]) {
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
    assert.ok(rim > (name.includes('hatch') ? 50 : 100), `${name}: its pink edge, ${rim} pixels`);
  }
});

test('crisp as it dies, and no pink edge once it is dying', () => {
  for (const { name, px } of dying) {
    let soft = 0;
    for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] !== 0 && px.d[i + 3] !== 255) soft++;
    assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
  }
});

test('nothing cyan, and every light it gives is the enemy\'s fire', () => {
  for (const { name, px, lights } of [...living, ...moving, ...dying]) {
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${name}: cyan ${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: its light ${L.color}`);
  }
});

test('nothing of it cut off at its canvas\'s edge, in any frame', () => {
  for (const { name, px } of [...living, ...moving, ...dying]) {
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${name}: ${cut} pixels on the canvas's edge`);
  }
});

test('its size (his pick): the knight\'s height (the knight is 58 of the figure\'s lengths), its legs on the floor', () => {
  for (let i = 0; i < 24; i++) {
    const P = standPose(i / 10);
    const top = Math.max(P.E[2] + ES_R, ...P.arms.map((a) => Math.max(...a.map((q) => q[2]))));
    assert.ok(top > 0.85 * 58 && top < 1.15 * 58, `its top ${top.toFixed(1)} up`);
    assert.ok(P.tips.filter((q) => q[2] < 0.5).length >= 4, 'standing on its legs');
  }
});

test('its one staring eye (his pick): from in front its iris the enemy\'s fire, open but for its blink, its light gold; from behind its flesh, no iris', () => {
  for (const f of living) {
    if (f.view === 'front' && !blinking(f.t)) {
      assert.ok(irisOf(f.px) >= 20, `${f.name}: its iris, ${irisOf(f.px)} pixels`);
      assert.ok(f.lights.some((L) => L.color === FLAME[3]), `${f.name}: its gold light`);
    }
    if (f.view === 'back') assert.ok(irisOf(f.px) < 6, `${f.name}: its iris seen from behind, ${irisOf(f.px)} pixels`);
  }
  const shut = eyespawnPainted('stand', (ES_HABITS.blink[0] + ES_HABITS.blink[1]) / 2, 'front');
  assert.ok(irisOf(shut.px) < 6 && shut.lights.length === 0, 'shut as it blinks, no light');
});

test('ITS HAUL (his pick): each leg gripping the floor where it came down until it lifts, the game carrying it on at its pace; its round closing; its eye on you', () => {
  const V = ES_PACE * TILE3;
  const T = ES_WALK.frames / ES_WALK.fps;
  for (let leg = 0; leg < 5; leg++) {
    let from: number | null = null;
    for (let i = 0; i <= 120; i++) {
      const t = (i / 120) * T;
      const q = haulSpec(t).tips[leg];
      if (q[2] > 0.05) {
        from = null;
        continue;
      }
      const x = q[0] + V * t;
      if (from === null) from = x;
      assert.ok(Math.abs(x - from) < 0.3, `leg ${leg} sliding ${Math.abs(x - from).toFixed(2)} at ${t.toFixed(3)} s`);
    }
  }
  assert.ok(gap(haulSpec(0), haulSpec(T)) < 0.05, 'its round closes');
  for (let i = 0; i < 12; i++) assert.ok(haulSpec((i / 12) * T).tips.filter((q) => q[2] < 0.05).length >= 2, 'always gripping on two legs or more');
  const eyes = moving.filter((f) => f.name.includes('walk front'));
  for (const f of eyes) assert.ok(irisOf(f.px) >= 20, `${f.name}: its eye on you, ${irisOf(f.px)} pixels of its iris`);
});

test('ITS LASH (his pick, its basic attack): from its stand; coiled back and up through its warning; its arm whipped out before it at the blow, low, as far as its reach; back as it stood', () => {
  const s0 = standSpec(0);
  assert.ok(gap(lashSpec(0), s0) < 0.01, 'from its stand');
  assert.ok(gap(lashSpec(ES_LASH.long), s0) < 0.01, 'back as it stood');
  const armOf = (t: number) => {
    const P = eyespawnPose('attack', t);
    return P.arms[0];
  };
  for (let t = ES_LASH.warn[0]; t <= ES_LASH.warn[1]; t += 0.04) {
    const tip = armOf(t)[13];
    assert.ok(tip[2] > 50 && tip[0] < 5, `${t.toFixed(2)} s: coiled up and back (its tip ${tip.map((v) => v.toFixed(0)).join(', ')})`);
  }
  const tip = armOf(ES_LASH.hit)[13];
  const far = Math.hypot(tip[0], tip[1]) / TILE3;
  assert.ok(tip[0] > 20 && tip[2] < 25 && Math.abs(far - ES_LASH.reach) < 0.25, `out before it at the blow, low, ${far.toFixed(2)} tiles (its tip ${tip.map((v) => v.toFixed(0)).join(', ')})`);
});

test('ITS GAZE BEAM (his pick, its big attack): from its stand; the line of light on the floor through its warning; its beam burning from its eye to the floor and out along the line to its reach, its light there; the burnt line gone and back as it stood by its end', () => {
  const s0 = standSpec(0);
  assert.ok(gap(gazeSpec(0), s0) < 0.01, 'from its stand');
  assert.ok(gap(gazeSpec(ES_GAZE.long), s0) < 0.01, 'back as it stood');
  const fire = (t: number): number => {
    const p = eyespawnPainted('gaze', t, 'front').px;
    let n = 0;
    for (let i = 0; i < p.d.length; i += 4) if (p.d[i + 3] === 255 && FIRE.has(`${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`)) n++;
    return n;
  };
  const calm = fire(0);
  assert.ok(fire(0.6) > calm + 30, `the line of light in its warning (${fire(0.6)} against ${calm})`);
  assert.equal(beamAt(ES_GAZE.beam[0] - 0.01), null);
  assert.equal(beamAt(ES_GAZE.beam[1] + 0.01), null);
  const end = beamAt(ES_GAZE.beam[1]);
  assert.ok(end !== null && Math.abs(end[0] / TILE3 - ES_GAZE.reach) < 0.01, 'out to its reach');
  for (let t = ES_GAZE.beam[0]; t <= ES_GAZE.beam[1]; t += 0.1) {
    const p = eyespawnPainted('gaze', t, 'front');
    let core = 0;
    for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3] === 255 && p.px.d[i] === 0xff && p.px.d[i + 1] === 0xf6 && p.px.d[i + 2] === 0xd8) core++;
    assert.ok(core > 20, `${t.toFixed(2)} s: its beam, ${core} pixels`);
    assert.ok(p.lights.length >= 2, `${t.toFixed(2)} s: its beam's light`);
  }
  // (its fire at the end no more than its iris's as it stands: the line burnt out)
  assert.ok(fire(ES_GAZE.long) === calm, `the burnt line gone by its end (${fire(ES_GAZE.long)} pixels of fire against ${calm})`);
});

test('STRUCK: from its stand, its eye shut, and back as it stood', () => {
  const s0 = standSpec(0);
  assert.ok(gap(reelSpec(0), s0) < 0.01 && gap(reelSpec(ES_REEL), s0) < 0.01, 'from its stand and back');
  assert.ok(reelSpec(ES_REEL * 0.2).lid > 0.9, 'its eye shut');
});

test('ITS DEATH (his pick: its eye bursts): it swells first; its eye bursts at its time, its fire out; it lies slumped, a slack heap; no light after', () => {
  assert.ok(dyingSpec(ES_DIE.burst - 0.02).swell > 1.25, 'swollen before it bursts');
  assert.ok(dyingSpec(ES_DIE.burst + 0.15).burst > 0.99, 'burst');
  for (const f of dying.filter((d) => d.t >= ES_DIE.burst + 0.25)) assert.equal(f.lights.length, 0, `${f.name}: no light once burst`);
  const S = dyingSpec(ES_DIE.long);
  assert.ok(S.E[2] < 15 && S.dark > 0.99, 'slumped, dark');
  assert.ok(S.arms.every((A) => A.rise < 0), 'its arms flopped down');
});

test('HATCHING out of his egg: small and curled, its eye shut, at first; growing to its height as it unfurls; its eye snapping open, its light; into its stand', () => {
  const h0 = hatchSpec(0);
  assert.ok(h0.size < 0.6 && h0.lid > 0.99, 'small and curled, its eye shut');
  assert.equal(eyespawnPainted('hatch', 0, 'front').lights.length, 0, 'no light while shut');
  assert.ok(hatchSpec(ES_HATCH.unfurl[1]).size > 0.99, 'grown as it unfurls');
  assert.ok(eyespawnPainted('hatch', ES_HATCH.open[1], 'front').lights.length > 0, 'its eye open, its light');
  assert.ok(gap(hatchSpec(ES_HATCH.long), standSpec(0)) < 0.01, 'into its stand');
});

test('as the game holds a monster: both facings, its haul, its lash on its frame, its gaze and hatching as moves, its flinch and death', () => {
  const art = makeEyespawnArt();
  for (const v of ['front', 'back'] as const) {
    const a = art[v];
    assert.equal(a.walk.length, ES_WALK.frames);
    assert.equal(a.walkFps, ES_WALK.fps);
    assert.equal(a.clips?.attack?.hit, ES_LASH.hit);
    assert.equal(a.clips?.moves?.gaze?.hit, ES_GAZE.beam[0]);
    assert.ok((a.clips?.moves?.hatch?.frames.length ?? 0) > 30, 'hatching');
    assert.ok((a.clips?.die?.frames.length ?? 0) > 30 && (a.clips?.reel?.frames.length ?? 0) > 10, 'its death and flinch');
  }
});
