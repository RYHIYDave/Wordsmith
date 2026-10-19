// FLOOR 12'S BOSS, THE RAT KING (src/art/rat_king.ts; what it throws, src/art/rat_king_shots.ts). A MOCK-UP: NOT IN
// THE GAME, behind RAT_KING_ON, off. Its brief is this chat's, on his word of 18 Oct (“Hey go without my say so.  If
// something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”), sent him with its films.
// Held to his art rulebook before he sees it, in every frame of every move, from in front and from behind, as the hounds
// are (tests/hounds.test.ts) and as every boss is (Approval 7: “I need all bosses ran through all checks from now on”):
//   - the switch off, nothing of the game importing it;
//   - crisp pixels; the pink edge while it lives; nothing cyan; every light the enemy's; its eyes burning while it
//     lives; nothing cut off at its canvas's edge;
//   - its size: its King's head about the knight's chest (he is 58 tall);
//   - FLOOR: nothing of it below the floor;
//   - SLIDE: a foot that is down stays where it came down (scuttling, the floor going by under it at its pace); its
//     ball rolls without sliding at the pace it is painted for;
//   - JERK: nothing leaps from one frame to the next; its stand, scuttle and roll close their loops; JUMP: where one
//     move hands over to another, the picture does not leap;
//   - ALIVE: never still;
//   - its moves: THE BITE (rearing, held trembling, the surge and the snap, held a tenth); THE ROLL; UNKNOT and KNOT;
//     STOLEN WORDS (a word gathering before the King, gone as it flies; the words drawn in the enemy's fire);
//   - its death (the crown off and lying on the floor, the cord snapped, the voices pouring up and going pale, the rats
//     gone into the cracks; still);
//   - its pictures as the game holds them.
//   run: tsx --test tests/rat_king.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { RAT_KING_ON, RK_BITE, RK_DIE, RK_ROLL, RK_STAND, RK_UNKNOT, RK_WALK, RK_WORDS, ROLL_PACE, RK_PACE, makeRatKingArt, ratKingLong, ratKingPainted, ratKingPose, ratKingSolids } from '../src/art/rat_king';
import { WORD_BURST_FOR, SWARM_FOR, WORD_SPEED, drawStolenWord, drawSwarm, drawWordAim, drawWordBurst } from '../src/art/rat_king_shots';
import type { FloorAt } from '../src/art/mob_shots';
import { TILE3 } from '../src/art/new_mobs3';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { stage } from '../src/art/skin';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; notEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
type Frame = { name: string; move: string; t: number; alive: boolean; painted: () => Painted };
const frames: Frame[] = [];
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
const MOVES = ['stand', 'walk', 'attack', 'reel', 'curl', 'roll', 'uncurl', 'unknot', 'knot', 'words', 'dying'];
const FPS: Record<string, number> = { stand: RK_STAND.fps, walk: RK_WALK.fps, roll: RK_ROLL.fps };
const LONG: [string, number, number][] = MOVES.map((m) => [m, ratKingLong(m), FPS[m] ?? 30]);
const LOOPS = new Set(['stand', 'walk', 'roll']);
for (const view of ['front', 'back'] as const) {
  for (const [move, long, fps] of LONG) {
    const n = Math.round(long * fps);
    const step = LOOPS.has(move) ? 1 : 3;
    for (let i = 0; i <= n; i += i + step > n && i !== n ? n - i : step) {
      if (LOOPS.has(move) && i === n) break;
      frames.push({ name: `${move} ${view} ${i}/${fps}`, move, t: i / fps, alive: move !== 'dying', painted: memo(() => ratKingPainted(move, i / fps, view)) });
    }
  }
}
type Solid = { part: string; piece: string; shape: any };
const solids = (move: string, t: number, view: 'front' | 'back' = 'front'): Solid[] => ratKingSolids(move, t, view) as Solid[];
function bottomOf(sh: any): number {
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  if (sh.k === 'band') return sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  return Infinity;
}
function topOf(sh: any): number {
  if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
  if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  return -Infinity;
}
function centreOf(sh: any): number[] {
  if (sh.k === 'rod') return [(sh.a[0] + sh.b[0]) / 2, (sh.a[1] + sh.b[1]) / 2, (sh.a[2] + sh.b[2]) / 2];
  if (sh.k === 'dot' || sh.k === 'glow' || sh.k === 'mote') return sh.p;
  if (sh.k === 'band') return sh.ring.c;
  return sh.c;
}
function geom(move: string, t: number): string {
  const sol = solids(move, t).filter((x) => x.shape.k !== 'mote');
  return JSON.stringify(sol, (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e6) : v));
}
/** The largest move of any solid's middle from one thirtieth of a second to the next (by part and piece and order). */
function biggestStep(move: string, long: number, which: (x: Solid) => boolean): { d: number; piece: string; t: number } {
  let best = { d: 0, piece: '', t: 0 };
  const n = Math.round(long * 30);
  const keyed = (sol: Solid[]): Map<string, Solid> => {
    const seen = new Map<string, number>();
    const m = new Map<string, Solid>();
    for (const x of sol) {
      const id = `${x.part}/${x.piece}`;
      const k = seen.get(id) ?? 0;
      seen.set(id, k + 1);
      m.set(`${id}#${k}`, x);
    }
    return m;
  };
  for (let i = 0; i < n; i++) {
    const a = keyed(solids(move, i / 30));
    for (const [key, x] of keyed(solids(move, (i + 1) / 30))) {
      const before = a.get(key);
      if (!before || !which(x) || x.shape.k === 'mote' || x.shape.k === 'glow') continue;
      const p = centreOf(before.shape);
      const q = centreOf(x.shape);
      const d = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]);
      if (d > best.d) best = { d, piece: key, t: (i + 1) / 30 };
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

test('the switch is off, and nothing of the game imports it', () => {
  assert.equal(RAT_KING_ON.on, false, 'RAT_KING_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/rat_king(_shots)?\.ts$/.test(f)) continue;
    if (/from ['"][^'"]*\/rat_king(_shots)?['"]/.test(fs.readFileSync(`src/${f}`, 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'game files that import it');
});

test('crisp: every pixel all there or not at all (but the pink edge); its pink edge round it while it lives', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = f.painted();
    let soft = 0;
    let rim = 0;
    let body = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 255) body++;
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    if (f.alive && body > 400) assert.ok(rim > 100, `${f.name}: its pink edge, ${rim} pixels`);
    if (!f.alive) assert.ok(rim === 0, `${f.name}: a pink edge on it dead`);
  }
});

test('nothing cyan, every light the enemy\'s, its eyes burning while it lives, and nothing of it cut off at its canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    let eyes = 0;
    let body = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      body++;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
      if (FIRE.has(`${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`)) eyes++;
    }
    if (f.alive && body > 400) assert.ok(eyes > 0 || lights.length > 0, `${f.name}: its eyes`);
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: its light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on its canvas's edge`);
  }
});

test('its size: a heap more than two tiles across, its King\'s head about the knight\'s chest (he is 58 tall)', () => {
  let top = 0;
  let wide = 0;
  for (const b of solids('stand', 0)) {
    top = Math.max(top, topOf(b.shape));
    const c = centreOf(b.shape);
    wide = Math.max(wide, Math.hypot(c[0], c[1]));
  }
  assert.ok(top > 34 && top < 52, `its top ${top.toFixed(1)} up`);
  assert.ok(wide > 1.0 * TILE3 && wide < 1.5 * TILE3, `out to ${(wide / TILE3).toFixed(2)} tiles from its middle`);
});

test('FLOOR: nothing of it below the floor, in any frame of any move, its death too, from in front or behind', () => {
  for (const view of ['front', 'back'] as const) {
    for (const [move, long] of LONG) {
      let low = Infinity;
      let what = '';
      for (let i = 0; i <= Math.round(long * 30); i++) {
        for (const x of solids(move, i / 30, view)) {
          const b = bottomOf(x.shape);
          if (b < low) {
            low = b;
            what = `${x.part}/${x.piece} at ${(i / 30).toFixed(2)}`;
          }
        }
      }
      assert.ok(low >= -0.5, `${move} ${view}: its lowest point is ${low.toFixed(2)}, under the floor (${what})`);
    }
  }
});

test('SLIDE: a foot that is down stays where it came down, in every move; scuttling, the floor goes by under it at its pace; its ball rolls without sliding', () => {
  const dt = 1 / 600;
  const feetAt = (move: string, t: number): number[][][] => ratKingPose(move, t).rats.map((r) => r.feet as unknown as number[][]);
  const V = RK_PACE * TILE3;
  for (let t = 0; t < RK_WALK.period * 2; t += dt) {
    const a = feetAt('walk', t);
    const b = feetAt('walk', t + dt);
    a.forEach((fa, r) => fa.forEach((p, i) => {
      const q = b[r][i];
      if (p[2] < 1e-6 && q[2] < 1e-6) assert.ok(Math.abs(q[0] - p[0] + V * dt) < 1e-6 && Math.abs(q[1] - p[1]) < 1e-9, `scuttling: rat ${r} foot ${i} slips at ${t.toFixed(4)} s`);
    }));
  }
  for (const move of ['stand', 'attack', 'reel', 'unknot', 'knot', 'words', 'dying']) {
    for (let t = 0; t + dt < ratKingLong(move); t += dt) {
      const a = feetAt(move, t);
      const b = feetAt(move, t + dt);
      a.forEach((fa, r) => fa.forEach((p, i) => {
        const q = b[r][i];
        if (p[2] < 1e-6 && q[2] < 1e-6) assert.ok(Math.abs(q[0] - p[0]) + Math.abs(q[1] - p[1]) < 1e-6, `${move}: rat ${r} foot ${i} slides at ${t.toFixed(4)} s`);
      }));
    }
  }
  // (the ball turns once round in a loop of its frames, as far as it rolls in that time: its skin stands still on the floor)
  const turn = 2 * Math.PI * (ratKingPose('roll', 0).knot[2]);
  assert.ok(Math.abs(turn - ROLL_PACE * TILE3 * (RK_ROLL.frames / RK_ROLL.fps)) < 1e-6, 'its roll slides on the floor');
});

test('JERK: nothing leaps from one frame to the next in any move; its stand, scuttle and roll close their loops', () => {
  // (how far a solid's middle may move in a thirtieth of a second, by move: its feet and legs; the rest of it. Its
  // scuttle patters fast; its bite snaps; rolling, its rats are carried round the ball; unknotting and knotting, they run)
  const limit: Record<string, [number, number]> = { stand: [1.5, 2.2], walk: [10, 4], attack: [10, 11], reel: [4, 5], curl: [10, 9], roll: [9, 9], uncurl: [10, 9], unknot: [13, 14], knot: [13, 14], words: [4, 6], dying: [13, 10] };
  const leg = (x: Solid): boolean => /^(foreleg|hindleg|paw)$/.test(x.piece);
  for (const [move, long] of LONG) {
    const [lg, rs] = limit[move];
    const a = biggestStep(move, long, leg);
    const c = biggestStep(move, long, (x) => !leg(x) && !/^(cord|crown)$/.test(x.part));
    assert.ok(a.d <= lg, `${move}: its ${a.piece} moves ${a.d.toFixed(1)} in a thirtieth, at ${a.t.toFixed(3)} s`);
    assert.ok(c.d <= rs, `${move}: its ${c.piece} moves ${c.d.toFixed(1)} in a thirtieth, at ${c.t.toFixed(3)} s`);
  }
  assert.equal(geom('stand', 0), geom('stand', RK_STAND.period), 'its stand\'s last moment is not its first');
  assert.equal(geom('walk', 0), geom('walk', RK_WALK.period), 'its scuttle\'s last moment is not its first');
  assert.equal(geom('roll', 0), geom('roll', RK_ROLL.frames / RK_ROLL.fps), 'its roll\'s last moment is not its first');
});

/** Where the eye goes on it (each rat's head and rump, the knot), on the picture. */
function pointsOf(move: string, t: number, view: 'front' | 'back'): number[][] {
  const st = stage(view, 0, 0, { w: 2, h: 2 });
  return solids(move, t, view).filter((x) => /^(head|rump)$/.test(x.piece) || x.part === 'knot' && x.piece === 'knot' && x.shape.k === 'ball').map((x) => st.at(x.shape.c) as unknown as number[]);
}
const leap = (a: number[][], b: number[][]): number => (a.length === b.length ? a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length / 2 : Infinity);

test('JUMP: where one move hands over to the next, the picture does not leap (the review\'s 3 game pixels)', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = Array.from({ length: RK_STAND.frames }, (_, i) => pointsOf('stand', i / RK_STAND.fps, view));
    const rest = pointsOf('stand', 0, view);
    for (const move of ['walk', 'attack', 'reel', 'curl', 'unknot', 'words', 'dying']) {
      const first = pointsOf(move, 0, view);
      for (let i = 0; i < stands.length; i++) assert.ok(leap(stands[i], first) <= 3, `${view}: its stand at ${(i / RK_STAND.fps).toFixed(2)} s into its ${move} leaps ${leap(stands[i], first).toFixed(2)}`);
    }
    for (const move of ['attack', 'reel', 'uncurl', 'knot', 'words']) assert.ok(leap(pointsOf(move, ratKingLong(move), view), rest) <= 3, `${view}: its ${move}'s end back to its stand leaps ${leap(pointsOf(move, ratKingLong(move), view), rest).toFixed(2)}`);
    // (curled into its roll; out of its roll into its uncurling)
    assert.ok(leap(pointsOf('curl', RK_ROLL.curl, view), pointsOf('roll', 0, view)) <= 3, `${view}: its curl into its roll leaps`);
    assert.ok(leap(pointsOf('roll', 0, view), pointsOf('uncurl', 0, view)) <= 3, `${view}: its roll into its uncurling leaps`);
    for (let i = 0; i < RK_WALK.frames; i++) assert.ok(leap(pointsOf('walk', i / RK_WALK.fps, view), rest) <= 3, `${view}: its scuttle at ${(i / RK_WALK.fps).toFixed(3)} s back to its stand leaps`);
  }
});

test('ALIVE: never still from one frame to the next', () => {
  for (let i = 0; i < RK_STAND.frames; i++) assert.notEqual(geom('stand', i / RK_STAND.fps), geom('stand', (i + 1) / RK_STAND.fps), `frames ${i} and ${i + 1} are the same`);
});

test('THE BITE: the front rats rear up, mouths wide, held trembling (the warning); the heap surges and they snap down; held a tenth', () => {
  const B = RK_BITE;
  const front = (t: number): any => ratKingPose('attack', t).rats[0];
  assert.ok(front(B.warn[0] + 0.05).f[2] > front(0).f[2] + 0.3, 'the front rat rears up');
  assert.ok(front(B.warn[0] + 0.05).gape > 0.8, 'its mouth wide');
  let most = 0;
  for (let t = B.warn[0] + 0.06; t < B.warn[1]; t += 1 / 30) most = Math.max(most, Math.abs(front(t).c[0] - front(B.warn[0] + 0.06).c[0]));
  assert.ok(most > 0.1 && most < 2, `trembling ${most.toFixed(2)}`);
  assert.ok(front(B.hit).c[0] > front(0).c[0] + 8, `the surge ${(front(B.hit).c[0] - front(0).c[0]).toFixed(1)}`);
  const nose = (t: number): number => (ratKingSolids('attack', t) as any[]).filter((x) => x.part === 'r0' && x.piece === 'nose')[0].shape.c[2];
  assert.ok(nose(B.hit) < nose(B.warn[1]) - 6 && front(B.hit).gape < 0.3, `it snaps down: its nose from ${nose(B.warn[1]).toFixed(1)} to ${nose(B.hit).toFixed(1)}, its jaws shut`);
  const held = geom('attack', B.hit);
  for (const t of [B.hit + 0.03, B.hit + B.freeze - 0.005]) assert.equal(geom('attack', t), held, `the bite moves in its freeze at ${t.toFixed(3)} s`);
});

test('THE ROLL; UNKNOT AND KNOT: balled up round its knot; gone into the cracks, the King with the cord in its teeth; back and knotted', () => {
  const ball = ratKingPose('roll', 0.3);
  const C = ball.knot;
  for (const r of ball.rats) {
    const d = Math.hypot(r.c[0] - C[0], r.c[1] - C[1], r.c[2] - C[2]);
    assert.ok(d < C[2] && d > C[2] * 0.4, `a rat ${d.toFixed(1)} from the ball's middle`);
  }
  const out = ratKingPose('unknot', RK_UNKNOT.out);
  assert.ok(out.rats.every((r) => r.gone > 0.98), 'all gone into the cracks at its end');
  assert.equal(ratKingPose('unknot', RK_UNKNOT.out * 0.5).cordAt, 'mouth', 'the cord in the King\'s teeth as they go');
  const back = ratKingPose('knot', RK_UNKNOT.in);
  assert.ok(back.rats.every((r) => r.gone === 0) && back.cordAt === 'knot' && (back.lump ?? 1) > 0.99, 'back and knotted, the cord round it');
});

test('STOLEN WORDS: a word gathers before the King (the warning), and is gone as it flies; the words in the enemy\'s fire, each its own shape; the swarm', () => {
  const W = RK_WORDS;
  const k = (t: number): number => ratKingPose('words', t).charge?.k ?? 0;
  assert.equal(k(0.1), 0, 'nothing before the warning');
  assert.ok(k((W.warn[0] + W.hit) / 2) > 0.2 && k(W.hit - 0.02) > 0.9, 'it gathers through the warning');
  assert.equal(k(W.hit + 0.02), 0, 'gone as it flies');
  const drawn: string[] = [];
  const c: { fillStyle: string; globalAlpha: number; fillRect(): void } = { fillStyle: '', globalAlpha: 1, fillRect(): void { drawn.push(c.fillStyle); } };
  const g = c as unknown as CanvasRenderingContext2D;
  const ISO: FloorAt = (x, y) => [(x - y) * 16, (x + y) * 8];
  const count = (draw: () => void): number => {
    const was = drawn.length;
    draw();
    return drawn.length - was;
  };
  const long = 6 / WORD_SPEED;
  for (const kind of ['fire', 'frost', 'lightning', 'poison'] as const) {
    for (let t = 0.02; t < long; t += 0.1) assert.ok(count(() => drawStolenWord(g, ISO, kind, 0, 0, 30, 6, 0, t)) > 6, `${kind} @${t.toFixed(2)}: drawn`);
    assert.equal(count(() => drawStolenWord(g, ISO, kind, 0, 0, 30, 6, 0, long + 0.02)), 0, `${kind}: there and gone`);
    for (let t = 0.02; t < WORD_BURST_FOR; t += 0.1) assert.ok(count(() => drawWordBurst(g, ISO, kind, 6, 0, t)) > 6, `${kind}'s burst @${t.toFixed(2)}`);
  }
  for (let q = 0.1; q <= 1; q += 0.3) assert.ok(count(() => drawWordAim(g, ISO, 0, 0, 6, 0, q, q)) > 4, `its aim at ${q.toFixed(1)}`);
  for (let t = 0.1; t < SWARM_FOR - 0.1; t += 0.1) assert.ok(count(() => drawSwarm(g, ISO, 0, 0, 8, 3, t)) > 8, `the swarm @${t.toFixed(2)}`);
  const fire = new Set(FLAME.map((x) => x.toLowerCase()));
  const bright = [...new Set(drawn)].filter((x) => x.startsWith('#') && !fire.has(x.toLowerCase()) && (() => { const [r, gg, b] = rgba(x); return hue(r, gg, b)[1] > 0.45 && Math.max(r, gg, b) > 150; })());
  assert.equal(bright.join(' '), '', 'a bright colour not the enemy\'s fire');
});

test('ITS DEATH: the crown knocked off and lying on the floor; the cord snapped; the voices pouring up out of them and going pale; the rats gone into the cracks; still', () => {
  const Dd = RK_DIE;
  assert.equal(ratKingPose('dying', Dd.crown - 0.02).crownAt, null, 'the crown on its head before');
  assert.ok(ratKingPose('dying', Dd.long).crownAt, 'the crown off its head at its end');
  const low = Math.min(...solids('dying', Dd.long).filter((x) => x.part === 'crown').map((x) => bottomOf(x.shape)));
  assert.ok(low > -0.5 && low < 1.5, `the crown lying on the floor at its end (its lowest ${low.toFixed(2)} up)`);
  assert.equal(ratKingPose('dying', Dd.snap + 0.1).cordAt, 'snapped', 'the cord snapped');
  let pale = 0;
  let most = 0;
  for (let t = Dd.voices[0]; t < Dd.voices[1]; t += 0.05) {
    const g = ratKingPose('dying', t).grains;
    most = Math.max(most, g.length);
    pale += g.filter(([, c]) => { const [r, gg, b] = rgba(c); return hue(r, gg, b)[1] < 0.25 && r > 150; }).length;
  }
  assert.ok(most > 40, `the voices pouring out: ${most} at most`);
  assert.ok(pale > 20, 'the voices going pale as they go free');
  assert.ok(ratKingPose('dying', Dd.long).rats.every((r) => r.gone > 0.98), 'the rats gone at its end');
  const still = geom('dying', Dd.still);
  for (const t of [Dd.still + 0.1, Dd.long]) assert.equal(geom('dying', t), still, `something moves at ${t} s`);
});

test('its pictures as the game holds them: standing fifteen a second, scuttling twenty-four; its bite, struck, its moves and its death at thirty', () => {
  const art = makeRatKingArt() as any;
  for (const f of [art.front, art.back]) {
    assert.equal(f.idle.length, RK_STAND.frames);
    assert.equal(f.walk.length, RK_WALK.frames);
    assert.equal(f.idleFps, RK_STAND.fps);
    assert.equal(f.walkFps, RK_WALK.fps);
    assert.equal(f.attack.length, 3);
    assert.equal(f.clips.attack.hit, RK_BITE.hit);
    assert.equal(f.clips.attack.frames.length, Math.round(RK_BITE.long * 30) + 1);
    assert.equal(f.clips.die.frames.length, Math.round(RK_DIE.long * 30) + 1);
    assert.equal(f.clips.moves.roll.frames.length, RK_ROLL.frames);
    assert.equal(f.clips.moves.words.hit, RK_WORDS.hit);
  }
});
