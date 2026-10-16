// FLOOR 7'S CLIFF CRAWLER (src/art/ledge_crawlers.ts; a mock-up nothing of the game imports), held to his rulebook before
// he sees its pictures: crisp in every frame; the enemy's pink edge round it while it lives, and none once it is dead;
// nothing cyan, no blood, its eyes and its lights the enemy's pink and fire only; nothing of it cut off at its canvas's
// edge; about waist-high to the knight; nothing of it below the rock; the stand never still; the walk a tripod whose feet
// stay on their spots on the rock; the claw swipe and the leap wound up and followed through; the leap's landing held a
// tenth of a second; the flinch and the death as his picks ask; nothing of it jumps from one frame to the next.
//   run: tsx --test tests/ledge_crawlers.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { FIG as FIG_CRAWLER } from '../src/art/act1_figs/crawler';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { TILE3 } from '../src/art/new_mobs3';
import { rgba } from '../src/engine/px';
import { CRAWLER_ON, CR_DIE, CR_LEAP, CR_PACE, CR_REEL, CR_STAND, CR_SWIPE, CR_WALK, crawlerChipCount, crawlerPainted, crawlerSolids, makeCrawlerArt } from '../src/art/ledge_crawlers';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as {
  ok(v: unknown, msg?: string): void;
  equal(a: unknown, b: unknown, msg?: string): void;
  notEqual(a: unknown, b: unknown, msg?: string): void;
  deepEqual(a: unknown, b: unknown, msg?: string): void;
};
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(Array.from(FLAME, (c) => rgba(c).slice(0, 3).join(',')));
const PINK = new Set(Array.from(FIRE).concat([rgba(ENEMY_RIM).slice(0, 3).join(',')]));
/** The knight's height in picture pixels (the rulebook's soldier: 58). */
const KNIGHT_HEIGHT = 58;

type Solid = { part: string; piece: string; shape: any };
const pieceAt = (move: string, t: number, piece: string): any => (crawlerSolids(move, t) as Solid[]).find((s) => s.piece === piece)!.shape;

/** The lowest point of a solid, above the rock (picture units). */
function bottomOf(sh: any): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return Infinity;
}
/** The highest point of a solid. */
function topOf(sh: any): number {
  if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
  if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return -Infinity;
}
/** A solid's middle (a dot or a glow is a point; a ball its centre; a rod the middle of its length). */
function centreOf(sh: any): number[] {
  if (sh.k === 'rod') return [(sh.a[0] + sh.b[0]) / 2, (sh.a[1] + sh.b[1]) / 2, (sh.a[2] + sh.b[2]) / 2];
  if (sh.k === 'dot' || sh.k === 'glow') return sh.p;
  return sh.c;
}
/** The geometry of one moment, each number to a millionth (its skins are functions, so they are left out). */
function geom(move: string, t: number): string {
  return JSON.stringify(crawlerSolids(move, t), (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
/** The number of picture values that differ between two moments of one move. */
function samePicture(move: string, a: number, b: number, view: 'front' | 'back' = 'front'): number {
  const p = crawlerPainted(move, a, view).px;
  const q = crawlerPainted(move, b, view).px;
  let diff = 0;
  for (let i = 0; i < p.d.length; i++) if (p.d[i] !== q.d[i]) diff++;
  return diff;
}
/** Each foot's place, as its claw meets the rock (its contact point, on the rock when z is 0). */
function feetAt(move: string, t: number): { x: number; y: number; z: number }[] {
  const out: { x: number; y: number; z: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const c = pieceAt(move, t, `claw${i}`).c as number[];
    out.push({ x: c[0], y: c[1], z: c[2] - 1.6 });
  }
  return out;
}
/** The largest move of any part (by its middle) from one frame (1/30 s) to the next, and where it was. */
function biggestStep(move: string, long: number, skip: (piece: string) => boolean): { d: number; piece: string; t: number } {
  let best = { d: 0, piece: '', t: 0 };
  const n = Math.round(long * 30);
  for (let i = 0; i < n; i++) {
    const a = new Map<string, Solid>((crawlerSolids(move, i / 30) as Solid[]).map((s) => [s.piece, s] as [string, Solid]));
    for (const s of crawlerSolids(move, (i + 1) / 30) as Solid[]) {
      // (a part paired by its name: the eyes come and go with their light, so the list is not the same length each frame)
      const before = a.get(s.piece);
      if (!before || skip(s.piece)) continue;
      const p = centreOf(before.shape);
      const q = centreOf(s.shape);
      const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      if (d > best.d) best = { d, piece: s.piece, t: (i + 1) / 30 };
    }
  }
  return best;
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

// every move it has, both views, frame by frame at thirty a second through its whole length
const LONG: [string, number][] = [
  ['stand', CR_STAND.period],
  ['walk', CR_WALK.period * 2],
  ['attack', CR_SWIPE.long],
  ['leap', CR_LEAP.long],
  ['reel', CR_REEL.long],
  ['dying', CR_DIE.long],
];
const frames: { name: string; move: string; t: number; view: 'front' | 'back' }[] = [];
for (const view of ['front', 'back'] as const) {
  for (const [move, long] of LONG) {
    for (let i = 0; i <= Math.round(long * 30); i++) frames.push({ name: `${move} ${view} ${i}/30`, move, t: i / 30, view });
  }
}

// (ACT 1 IN THE GAME: no longer a mock-up nothing imports. The game holds its pictures through art/act1_figs/crawler.ts
// alone, and its switch goes on with the descent, as the bestiary throws the switches of every kind of it.)
test('in the game through art/act1_figs/crawler.ts alone, its switch thrown with the descent', () => {
  assert.ok(FIG_CRAWLER !== null && (FIG_CRAWLER.switches ?? []).includes(CRAWLER_ON), 'its switch is one the bestiary throws with the descent');
  for (const f of fs.readdirSync('src', { recursive: true })) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f.endsWith('ledge_crawlers.ts')) continue;
    const at = f.split('\\').join('/');
    if (at === 'art/act1_figs/crawler.ts') continue;
    assert.ok(!/from ['"][^'"]*ledge_crawlers['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the crawler`);
  }
});

test('crisp: every pixel all there or not at all, and the enemy\'s pink edge round it while it lives (none once it is dead)', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = crawlerPainted(f.move, f.t, f.view);
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.equal(soft, 0, `${f.name}: ${soft} soft pixels`);
    if (f.move === 'dying') assert.equal(rim, 0, `${f.name}: ${rim} pixels of pink edge (a dead thing gives it up)`);
    else assert.ok(rim > 80, `${f.name}: its pink edge, ${rim} pixels`);
  }
});

test('nothing cyan, no blood (nothing red but the enemy\'s pink), its lights the enemy\'s fire only, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = crawlerPainted(f.move, f.t, f.view);
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const r = px.d[i];
      const g = px.d[i + 1];
      const b = px.d[i + 2];
      const [h, sat] = hue(r, g, b);
      assert.ok(!(sat > 0.4 && Math.max(r, g, b) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
      const reddish = r > 120 && r > g + 50 && r > b + 30;
      if (reddish) assert.ok(PINK.has(`${r},${g},${b}`), `${f.name}: a red pixel ${r},${g},${b}: blood`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.equal(cut, 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its eyes burn the enemy\'s pink: four of them, lit while it lives, from either side', () => {
  for (const view of ['front', 'back'] as const) {
    for (const t of [0, 0.3, 0.6]) {
      const eyes = crawlerPainted('stand', t, view).lights.filter((L) => L.color === FLAME[2]);
      assert.equal(eyes.length, 4, `${view} at ${t} s: ${eyes.length} eye lights`);
    }
  }
});

test('its size: about waist-high to the knight, its body top about half the knight\'s height', () => {
  const top = Math.max(...(crawlerSolids('stand', 0) as Solid[]).map((s) => topOf(s.shape)));
  assert.ok(top > KNIGHT_HEIGHT * 0.4 && top < KNIGHT_HEIGHT * 0.62, `its top is ${top.toFixed(1)} above the rock; the knight is ${KNIGHT_HEIGHT}`);
});

test('nothing of it sinks into the rock: its lowest point is on the rock or above it, in every move and every frame', () => {
  for (const [move, long] of LONG) {
    let low = Infinity;
    for (let i = 0; i <= Math.round(long * 30); i++) for (const s of crawlerSolids(move, i / 30) as Solid[]) low = Math.min(low, bottomOf(s.shape));
    assert.ok(low >= -0.5, `${move}: its lowest point is ${low.toFixed(2)}, under the rock`);
  }
});

test('the stand is alive: never still from one frame to the next, and its feet stay where they are (Movement 6, Movement 8)', () => {
  for (let i = 0; i < 12; i++) {
    assert.notEqual(geom('stand', i / 10), geom('stand', (i + 1) / 10), `frames ${i} and ${i + 1} are the same`);
    assert.equal(JSON.stringify(feetAt('stand', i / 10)), JSON.stringify(feetAt('stand', 0)), `its feet move at ${i / 10} s`);
  }
});

test('its stand and its walk each close their loop: the first and the last moments are the same picture', () => {
  for (const [move, period] of [['stand', CR_STAND.period], ['walk', CR_WALK.period]] as const) {
    assert.equal(geom(move, 0), geom(move, period), `${move}: its shape at the loop's end differs`);
    for (const view of ['front', 'back'] as const) assert.equal(samePicture(move, 0, period, view), 0, `${move} ${view}: its picture differs at the loop's end`);
  }
});

test('its walk: a tripod, at least three feet on the rock at every moment, and the two tripods take turns (Movement 8)', () => {
  let fewest = 6;
  for (let i = 0; i < 256; i++) {
    const down = feetAt('walk', (i / 256) * CR_WALK.period).filter((f) => f.z < 1e-6).length;
    fewest = Math.min(fewest, down);
  }
  assert.ok(fewest >= 3, `at some moment only ${fewest} feet are on the rock`);
  const downAt = (t: number): number[] => {
    const out: number[] = [];
    feetAt('walk', t).forEach((f, i) => {
      if (f.z < 1e-6) out.push(i);
    });
    return out;
  };
  assert.deepEqual(downAt(0.1 * CR_WALK.period), [0, 3, 4], 'the first tripod on the rock');
  assert.deepEqual(downAt(0.6 * CR_WALK.period), [1, 2, 5], 'then the second');
});

test('its walk: a foot on the rock stays on its spot while the rock slides under it at its pace (Movement 8)', () => {
  const V = CR_PACE * TILE3;
  const dt = 1 / 480;
  for (let leg = 0; leg < 6; leg++) {
    for (let t = 0; t + dt < CR_WALK.period * 2; t += dt) {
      const a = feetAt('walk', t)[leg];
      const b = feetAt('walk', t + dt)[leg];
      if (a.z < 1e-6 && b.z < 1e-6) {
        const slip = V * dt + (b.x - a.x);
        assert.ok(Math.abs(slip) < 1e-6, `leg ${leg} slips ${slip.toFixed(4)} at ${t.toFixed(4)} s`);
      }
    }
  }
});

test('its claw swipe: its claw cocked up and held as the warning, struck at its time, followed through, and back on its stand (Movement 3, Monsters 4)', () => {
  const clawAt = (t: number): number[] => pieceAt('attack', t, 'claw0').c;
  const x0 = clawAt(0)[0];
  assert.ok(clawAt(0.25)[2] > 14, `its claw is ${clawAt(0.25)[2].toFixed(1)} up in the warning, not raised`);
  assert.ok(clawAt(CR_SWIPE.hit)[0] > x0 + 25, `its claw strikes ${(clawAt(CR_SWIPE.hit)[0] - x0).toFixed(1)} forward at ${CR_SWIPE.hit} s`);
  assert.equal(geom('attack', 0.85), geom('stand', 0), 'it is back on its stand by 0.85 s');
  assert.equal(geom('attack', CR_SWIPE.long), geom('stand', 0), 'and at its end');
});

test('its leap: the crouch holds its warning, the spring leaves the rock, and the landing is held a tenth of a second (Animations 4, Movement 7)', () => {
  const still = geom('leap', CR_LEAP.hit);
  for (const t of [CR_LEAP.hit + 0.02, CR_LEAP.hit + 0.05, CR_LEAP.hit + CR_LEAP.freeze - 0.01]) {
    assert.equal(geom('leap', t), still, `the landing moves at ${t.toFixed(3)} s`);
  }
  assert.equal(samePicture('leap', CR_LEAP.hit, CR_LEAP.hit + 0.09), 0, 'and its picture is the same through the tenth (nothing flies off in the freeze)');
  for (let t = CR_LEAP.warn + 0.03; t <= CR_LEAP.hit - 0.03; t += 0.03) {
    for (const f of feetAt('leap', t)) assert.ok(f.z > 0.5, `a foot is on the rock (${f.z.toFixed(2)}) at ${t.toFixed(2)} s, in the air`);
  }
  for (const t of [0, 0.2, 0.3, 0.9]) assert.ok(feetAt('leap', t).every((f) => f.z < 1e-6), `a foot is off the rock at ${t} s`);
  assert.equal(geom('leap', CR_LEAP.long), geom('stand', 0), 'its hop back ends on its stand, so the stand takes it up with no jump');
});

test('its flinch: frozen a tenth as the blow lands, knocked back, its eyes flashing and fading, and back on its stand by 0.3 s (Hits 3, Movement 7)', () => {
  const frozen = geom('reel', 0);
  for (const t of [0.02, 0.05, CR_REEL.freeze - 0.005]) assert.equal(geom('reel', t), frozen, `moves during the freeze at ${t}`);
  const headX = (t: number): number => pieceAt('reel', t, 'head').c[0];
  assert.ok(headX(0.2) < headX(0) - 4, `its head goes back ${(headX(0) - headX(0.2)).toFixed(1)} at the knock`);
  const glow = (t: number): number => pieceAt('reel', t, 'eyeLight0').r;
  assert.ok(glow(0.11) > glow(0.29), `its eyes flash, then fade (${glow(0.11).toFixed(1)} to ${glow(0.29).toFixed(1)})`);
  assert.equal(geom('reel', CR_REEL.long), geom('stand', 0), 'it is back on its stand by its end');
});

test('its death: frozen a tenth as the blow lands, its eyes out by 0.5 s, and still from 0.8 s to its end (Hits 5, Animations 4)', () => {
  const frozen = geom('dying', 0);
  for (const t of [0.02, 0.07]) assert.equal(geom('dying', t), frozen, `moves in the blow's freeze at ${t}`);
  const still = geom('dying', CR_DIE.still);
  for (const t of [CR_DIE.still + 0.1, 0.9, CR_DIE.long]) assert.equal(geom('dying', t), still, `something moves at ${t} s`);
  for (const view of ['front', 'back'] as const) {
    assert.equal(samePicture('dying', CR_DIE.still, CR_DIE.long, view), 0, `its picture changes after ${CR_DIE.still} s (${view})`);
  }
  assert.equal(crawlerPainted('dying', CR_DIE.eyesOut, 'front').lights.length, 0, 'its eyes are out by 0.5 s');
  assert.equal(crawlerPainted('dying', 0.2, 'front').lights.length, 4, 'and still burning at 0.2 s');
});

test('its death: its legs tuck in under it, and once tucked no foot moves again (Movement 8)', () => {
  const tucked = JSON.stringify(feetAt('dying', 0.56));
  for (const t of [0.6, 0.7, 0.8, 1]) assert.equal(JSON.stringify(feetAt('dying', t)), tucked, `a foot moves at ${t} s`);
  for (const f of feetAt('dying', 0.56)) {
    assert.ok(Math.abs(f.z) < 1e-6 && Math.abs(f.x) < 21 && Math.abs(f.y) < 18, `a foot at (${f.x.toFixed(1)}, ${f.y.toFixed(1)}) is not tucked under it`);
  }
});

test('no foot on the rock moves across it in any move but the walk: a foot that is down stays where it lands (Movement 8)', () => {
  const dt = 1 / 300;
  for (const move of ['stand', 'attack', 'leap', 'reel', 'dying']) {
    const long = LONG.find((l) => l[0] === move)![1];
    for (let t = 0; t + dt <= long; t += dt) {
      const a = feetAt(move, t);
      const b = feetAt(move, t + dt);
      for (let i = 0; i < 6; i++) {
        if (a[i].z < 1e-6 && b[i].z < 1e-6) {
          assert.ok(Math.abs(a[i].x - b[i].x) + Math.abs(a[i].y - b[i].y) < 1e-6, `${move}: foot ${i} slides at ${t.toFixed(3)} s`);
        }
      }
    }
  }
});

test('nothing jumps: from one frame to the next no part moves further than its move can (Movement 5); the swipe\'s blow alone is quick', () => {
  // (leap 14, not 10: its spring is wilder now, as Animations 1 asks. Its launch is its fastest moment: its middle rises
  // 37 picture pixels, from 10 to about 47 above the rock, and at most about 13 a frame at 30 a second; it is still one
  // continuous arc, with nothing teleporting)
  // (reel 15, not 9: its flinch's knock snaps back as the blow's freeze ends (Animations 1), quick and then slow to give way;
  // its fastest step is about 14.6 picture pixels in the first frame of the knock, on one continuous arc: the blow's own
  // punch, not a jump. Its head follows it two frames late, and it is back on its stand by 0.7 of the way through the move)
  // (dying 15, not 6: after the blow's freeze its death snaps it up and back and rolls it over, its legs flailing (Animations
  // 1; a hit-stop, then the throw). Its fastest step is about 14.6 picture pixels a frame, at its head, at the snap, on a
  // continuous arc: its wildest moment, and no teleporting)
  const limit: Record<string, number> = { stand: 2, walk: 4, leap: 14, reel: 15, dying: 15 };
  for (const [move, long] of LONG) {
    if (move === 'attack') continue;
    const worst = biggestStep(move, long, () => false);
    assert.ok(worst.d <= limit[move], `${move}: ${worst.piece} moves ${worst.d.toFixed(1)} in one frame, at ${worst.t.toFixed(3)} s`);
  }
  // (its body, head, jaws and five other legs move little; the leg that strikes, its claw and all, is the blow itself)
  const body = biggestStep('attack', CR_SWIPE.long, (piece) => /(thigh|shin|knee|claw)0$/.test(piece));
  assert.ok(body.d <= 6, `the swipe's body moves ${body.d.toFixed(1)} in one frame, at ${body.t.toFixed(3)} s`);
  const striking = biggestStep('attack', CR_SWIPE.long, (piece) => !/(thigh|shin|knee|claw)0$/.test(piece));
  assert.ok(striking.d <= 30, `its striking leg moves ${striking.d.toFixed(1)} in one frame, at ${striking.t.toFixed(3)} s`);
  const blow = (() => {
    let d = 0;
    for (let i = 0; i < Math.round(CR_SWIPE.long * 30); i++) {
      const p = centreOf(pieceAt('attack', i / 30, 'claw0'));
      const q = centreOf(pieceAt('attack', (i + 1) / 30, 'claw0'));
      d = Math.max(d, Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]));
    }
    return d;
  })();
  assert.ok(blow <= 30, `its claw moves ${blow.toFixed(1)} in one frame at the blow`);
});

test('what a blow throws off is its own shell: it lasts half a second, and comes only in its flinch, its swipe, its landing and its death', () => {
  for (const move of ['stand', 'walk']) for (const t of [0, 0.3, 0.6, 0.9]) assert.equal(crawlerChipCount(move, t), 0, `${move} at ${t} s throws nothing off`);
  assert.ok(crawlerChipCount('reel', 0.2) > 0, 'its flinch throws shell off');
  assert.ok(crawlerChipCount('attack', CR_SWIPE.hit + 0.1) > 0, 'its swipe throws shell off at the blow');
  assert.equal(crawlerChipCount('leap', CR_LEAP.hit + 0.05), 0, 'none flies off in the landing\'s freeze');
  assert.ok(crawlerChipCount('leap', CR_LEAP.hit + CR_LEAP.freeze + 0.1) > 0, 'its landing throws shell off, as it sinks');
  assert.ok(crawlerChipCount('dying', 0.5) > 0, 'its death throws shell off');
  // (gone by half a second on: each checked a hair past it, so that no rounding of a sum decides it)
  assert.equal(crawlerChipCount('attack', CR_SWIPE.hit + 0.51), 0, 'gone by half a second on, after the swipe');
  assert.equal(crawlerChipCount('leap', CR_LEAP.hit + CR_LEAP.freeze + 0.51), 0, 'gone by half a second on, after the landing');
  assert.equal(crawlerChipCount('dying', 0.81), 0, 'gone by 0.8 s, after the death');
});

test('its pictures as the game holds them: standing ten a second, walking sixteen, the swipe, the leap, the flinch and the death at thirty', () => {
  const art = makeCrawlerArt() as any;
  const f = art.front;
  assert.equal(f.idle.length, CR_STAND.frames);
  assert.equal(f.walk.length, CR_WALK.frames);
  assert.equal(f.idleFps, 10);
  assert.equal(f.walkFps, 16);
  assert.equal(f.attack.length, 3);
  assert.equal(f.clips.attack.fps, 30);
  assert.equal(f.clips.attack.hit, CR_SWIPE.hit);
  assert.equal(f.clips.moves.leap.hit, CR_LEAP.hit);
  assert.equal(f.clips.moves.leap.frames.length, Math.round(CR_LEAP.long * 30) + 1);
  assert.equal(f.clips.die.frames.length, Math.round(CR_DIE.long * 30) + 1);
  assert.equal(f.clips.reel.frames.length, Math.round(CR_REEL.long * 30) + 1);
  assert.equal(art.back.walk.length, CR_WALK.frames);
});
