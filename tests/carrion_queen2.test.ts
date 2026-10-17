// FLOOR 7'S BOSS, THE CARRION QUEEN MADE NEW (src/art/carrion_queen2.ts, her look and stand; src/art/carrion_queen2_moves.ts,
// her moves; behind QUEEN2_ON; in the game through art/act1_figs/queen.ts), held to his art rulebook before he sees
// her, as a boss (How art is made 7: the whole review, in every frame, from in front and from behind). She is not on
// the heroes' bones (her own skeleton of a bird), so the review (art/boss_checks.ts, made for figures on them) is
// written out here for her, rule by rule:
//   - crisp pixels; her pink edge while she lives; nothing cyan; every light the cult's fire; nothing cut off;
//   - her size, his (“Wings wider than the trail (Recommended)”, offered as: perched, about the Unfinished's height;
//     wings spread, wider than the trail is across); the one thing to know her by, her crown and the cult's mark;
//   - FLOOR: nothing of her under the rock (her death aside: she goes over the edge into the drop);
//   - SLIDE: a foot that is down stays where it came down (hopping, the rock going by under it at her pace);
//   - THROUGH: no leg through the other, no wing's bones through her body;
//   - JERK: nothing leaps from one frame to the next (her wings sweep over several frames, never flick); her stand and
//     hop close their loops; JUMP: where one move hands over to the next, the picture does not leap;
//   - BLOW: every blow wound up, held (the warning, a pose) and followed through; the dive's strike held a tenth;
//   - ALIVE: never still; she breathes and sways; her head darts (his pick, “Fast and vicious (Recommended)”);
//   - struck; her death as his pick asks (off the edge); what her moves throw off comes and goes; her pictures as the
//     game holds them.
//   run: tsx --test tests/carrion_queen2.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import * as nodeFs from 'node:fs';

import { CROWN, QUEEN2_ON, Q2_IDLE, Q2_SCALE, Q2_STAND, queen2Bits, queen2Frame, queen2Painted, standPose, wingBones } from '../src/art/carrion_queen2';
import type { QueenPose } from '../src/art/carrion_queen2';
import { Q2_CALL, Q2_DIE, Q2_DIVE, Q2_GUST, Q2_HOP, Q2_MOVES, Q2_PACE, Q2_RAKE, Q2_REEL, Q2_WALK, makeQueen2Art, queen2Grains, queen2Long, queen2MovePainted, queen2MovePose } from '../src/art/carrion_queen2_moves';
import { RIM_ALPHA } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { TILE3 } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { unfinishedStanding } from '../src/art/unfinished';
import { rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

const test = nodeTest as (name: string, fn: () => void) => void;
const assert = nodeAssert as { ok(v: unknown, msg?: string): void; equal(a: unknown, b: unknown, msg?: string): void; notEqual(a: unknown, b: unknown, msg?: string): void };
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();

const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
/** Each move's own frames a second, as the game shows it. */
const FPS: Record<string, number> = { stand: Q2_IDLE.fps, walk: Q2_WALK.fps, dying: 20 };
const fpsOf = (m: string): number => FPS[m] ?? 30;
const LOOPS = new Set(['stand', 'walk']);
/** Every frame of a move the game would show (its loop's last aside), as times. */
function timesOf(m: string, step = 1): number[] {
  const fps = fpsOf(m);
  const n = Math.round(queen2Long(m) * fps);
  const out: number[] = [];
  for (let i = 0; i < n; i += step) out.push(i / fps);
  if (!LOOPS.has(m)) out.push(n / fps);
  return out;
}
type Frame = { name: string; move: string; t: number; view: 'front' | 'back'; painted: () => Painted };
const memo = (f: () => Painted): (() => Painted) => {
  let p: Painted | null = null;
  return () => (p ??= f());
};
// (every frame of her stand and hop; every other frame of her other moves and their last; from in front and behind)
const frames: Frame[] = [];
for (const view of ['front', 'back'] as const) {
  for (const m of Q2_MOVES) for (const t of timesOf(m, LOOPS.has(m) ? 1 : 2)) frames.push({ name: `${m} ${view} ${t.toFixed(3)}`, move: m, t, view, painted: memo(() => queen2MovePainted(m, t, view)) });
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
function tallOf(sp: Sprite): number {
  const q = paintingOf(sp);
  let top = q.h;
  let bottom = -1;
  for (let y = 0; y < q.h; y++) for (let x = 0; x < q.w; x++) if (q.d[(y * q.w + x) * 4 + 3] === 255) {
    top = Math.min(top, y);
    bottom = Math.max(bottom, y);
  }
  return bottom - top + 1;
}
type Solid = { part: string; piece: string; shape: any };
const solids = (m: string, t: number): Solid[] => queen2Bits(queen2MovePose(m, t), t) as Solid[];
const pieceOf = (sol: Solid[], part: string, piece: string): any => sol.find((x) => x.part === part && x.piece === piece)?.shape;
function lowOf(sh: any): number {
  if (sh.k === 'panel') return Math.min(...[-1, 1].flatMap((a) => [-1, 1].map((b) => sh.c[2] + a * sh.u[2] + b * sh.v[2])));
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  return Infinity;
}
const ang = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => (Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b))))) * 180) / Math.PI;
const dist = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
/** The shortest way between two segments. */
function segGap(p1: number[], q1: number[], p2: number[], q2: number[]): number {
  let best = Infinity;
  for (let i = 0; i <= 20; i++) {
    const a = p1.map((v, k) => v + ((q1[k] - v) * i) / 20);
    for (let j = 0; j <= 20; j++) {
      const b = p2.map((v, k) => v + ((q2[k] - v) * j) / 20);
      best = Math.min(best, dist(a, b));
    }
  }
  return best;
}
/** Whether a point is inside a ball (its middle and its three half-axes, square to each other). */
function inBall(p: number[], sh: any): boolean {
  let s = 0;
  for (const a of sh.ax as number[][]) {
    const l2 = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    const d = ((p[0] - sh.c[0]) * a[0] + (p[1] - sh.c[1]) * a[1] + (p[2] - sh.c[2]) * a[2]) / l2;
    s += d * d;
  }
  return s < 1;
}

// (IN THE GAME SINCE ACT 1 CAME IN, 16 Oct: through art/act1_figs/queen.ts, her pictures as the game holds a monster;
// her switch goes on with the descent there, art/bestiary.ts useAct1Figs. Nothing else of the game imports her; and
// nothing of the game imports the old one, art/carrion_queen.ts: tests/act1_queen.test.ts.)
test('her switch is off by itself, and of the game only her figure imports her', () => {
  assert.equal(QUEEN2_ON.on, false);
  for (const f of fs.readdirSync('src', { recursive: true })) {
    const name = f.replace(/\\/g, '/');
    if (!name.endsWith('.ts') || name.startsWith('dev') || /carrion_queen2(_moves)?\.ts$/.test(name) || name === 'art/act1_figs/queen.ts') continue;
    assert.ok(!/from ['"][^'"]*carrion_queen2(_moves)?['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the new Carrion Queen`);
  }
});

test('crisp: every pixel all there or not at all (but the pink edge); her pink edge round her while she lives', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const f of frames) {
    const { px } = f.painted();
    let soft = 0;
    let rim = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      if (a === 0 || a === 255) continue;
      if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
      else soft++;
    }
    assert.ok(soft === 0, `${f.name}: ${soft} soft pixels`);
    // (the game paints every monster's death without its pink edge: hers too)
    if (f.move !== 'dying') assert.ok(rim > 500, `${f.name}: her pink edge, ${rim} pixels`);
    else assert.ok(rim === 0, `${f.name}: a pink edge on her death`);
  }
});

test('nothing cyan, every light the cult\'s fire, and nothing of her cut off at her canvas\'s edge', () => {
  for (const f of frames) {
    const { px, lights } = f.painted();
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] === 0) continue;
      const [h, sat] = hue(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(sat > 0.4 && Math.max(px.d[i], px.d[i + 1], px.d[i + 2]) > 140 && h >= 165 && h <= 205), `${f.name}: cyan`);
    }
    for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${f.name}: her light ${L.color}`);
    let cut = 0;
    for (let x = 0; x < px.w; x++) for (const y of [0, px.h - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    for (let y = 0; y < px.h; y++) for (const x of [0, px.w - 1]) if (px.d[(y * px.w + x) * 4 + 3] > 0) cut++;
    assert.ok(cut === 0, `${f.name}: ${cut} pixels on her canvas's edge`);
  }
});

test('her size, his: about the Unfinished\'s height as she stands; her wings, held about her, wider than the trail (four tiles and more)', () => {
  const k = tallOf(queen2Frame('stand', 0.1, 'front')) / tallOf(unfinishedStanding(0.4, 'front'));
  assert.ok(k > 0.85 && k < 1.3, `${k.toFixed(2)} times the Unfinished's height`);
  for (const t of timesOf('stand')) {
    const P = standPose(t);
    const a = wingBones(P, 1);
    const b = wingBones(P, -1);
    // (across her, from the tip of one hand to the other, the feathers past them not counted)
    const span = Math.hypot(a.tip[0] - b.tip[0], a.tip[1] - b.tip[1]) * Q2_SCALE;
    assert.ok(span > 4 * TILE3, `at ${t.toFixed(2)} s her wings are ${(span / TILE3).toFixed(1)} tiles across`);
  }
});

test('the one thing to know her by: her crown bone-pale, the cult\'s mark burning on her breast', () => {
  for (const t of [0.1, 0.7, 1.45]) {
    const { px } = queen2Painted('stand', t, 'front');
    const crown = new Set(CROWN.map((c) => rgba(c).slice(0, 3).join(',')));
    let pale = 0;
    let fire = 0;
    for (let i = 0; i < px.d.length; i += 4) {
      if (px.d[i + 3] !== 255) continue;
      const k = `${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`;
      if (crown.has(k)) pale++;
      if (FIRE.has(k)) fire++;
    }
    assert.ok(pale > 250, `at ${t} s her crown: ${pale} pixels`);
    assert.ok(fire > 250, `at ${t} s the cult's fire (her mark, her crown's tips, her eyes): ${fire} pixels`);
  }
});

test('FLOOR: nothing of her under the rock, in any frame of any move but her death (she goes over the edge into the drop)', () => {
  for (const m of Q2_MOVES) {
    if (m === 'dying') continue;
    for (let i = 0; i <= Math.round(queen2Long(m) * 30); i++) {
      const t = i / 30;
      for (const b of solids(m, t)) {
        const z = lowOf(b.shape);
        assert.ok(z >= -0.5, `${m} at ${t.toFixed(3)} s: her ${b.part} ${b.piece} is ${(-z).toFixed(1)} under the rock`);
      }
    }
  }
});

test('SLIDE: a foot that is down stays where it came down; hopping, it goes back under her at her pace as the rock goes by (Movement 8)', () => {
  const dt = 1 / 600;
  const V = (Q2_PACE * TILE3) / Q2_SCALE;
  let down = 0;
  let lifted = 0;
  for (const m of Q2_MOVES) {
    if (m === 'dying') continue;
    const long = queen2Long(m);
    for (let t = 0; t + dt <= long; t += dt) {
      const a = queen2MovePose(m, t).feet;
      const b = queen2MovePose(m, t + dt).feet;
      for (const i of [0, 1]) {
        if (a[i][2] > 1e-6 || b[i][2] > 1e-6) {
          if (m === 'walk') lifted++;
          continue;
        }
        const want = m === 'walk' ? -V * dt : 0;
        assert.ok(Math.abs(b[i][0] - a[i][0] - want) < 1e-6 && Math.abs(b[i][1] - a[i][1]) < 1e-6, `${m}: her foot ${i} slides at ${t.toFixed(3)} s`);
        if (m === 'walk') down++;
      }
    }
  }
  // (hopping, both feet down for half her round and lifted for the other half)
  assert.ok(down > 0 && lifted > 0 && Math.abs(down - lifted) / (down + lifted) < 0.15, `hopping, down ${down}, lifted ${lifted}`);
  // (her feet down in her stand stand on their spots)
  for (const t of timesOf('stand')) assert.equal(JSON.stringify(standPose(t).feet), JSON.stringify(standPose(0).feet), `her feet move in her stand at ${t}`);
  // (she lands from her hop where her feet left, a hop on)
  const T = Q2_WALK.frames / Q2_WALK.fps;
  const off = queen2MovePose('walk', Q2_HOP.off).feet[0][0];
  const on = queen2MovePose('walk', Q2_HOP.land).feet[0][0];
  assert.ok(Math.abs(on - off - V * (T - (Q2_HOP.land - Q2_HOP.off))) < 1e-6, `her hop is ${(on - off).toFixed(1)} long`);
});

test('THROUGH: no leg through the other, no wing\'s bones through her body, in any frame of any move but her fall (Heroes 6, for every boss)', () => {
  for (const m of Q2_MOVES) {
    const long = m === 'dying' ? Q2_DIE.over : queen2Long(m);
    for (let i = 0; i <= Math.round(long * 30); i++) {
      const t = i / 30;
      const sol = solids(m, t);
      const leg = (k: number): { a: number[]; b: number[]; r: number }[] => ['thigh', 'tarsus'].map((p) => {
        const sh = pieceOf(sol, `leg${k}`, p);
        return { a: sh.a, b: sh.b, r: Math.max(sh.ra, sh.rb) };
      });
      for (const s1 of leg(0)) for (const s2 of leg(1)) {
        const gap = segGap(s1.a, s1.b, s2.a, s2.b);
        assert.ok(gap > (s1.r + s2.r) * 0.85, `${m}: her legs pass through each other at ${t.toFixed(3)} s (${gap.toFixed(1)} apart)`);
      }
      const body = [pieceOf(sol, 'body', 'torso'), pieceOf(sol, 'body', 'breast')];
      for (const part of ['wingL', 'wingR']) {
        for (const [piece, from] of [['hum', 0.35], ['fore', 0], ['hand', 0]] as [string, number][]) {
          const sh = pieceOf(sol, part, piece);
          for (let q = from; q <= 1.001; q += 0.1) {
            const p = sh.a.map((v: number, k: number) => v + (sh.b[k] - v) * q);
            for (const b of body) assert.ok(!inBall(p, b), `${m}: her ${part}'s ${piece} goes through her body at ${t.toFixed(3)} s`);
          }
        }
      }
    }
  }
});

test('JERK: nothing leaps from one frame to the next in any move (Movement 5); her wings sweep, never flick; her stand and hop close their loops', () => {
  // (in a frame of each move as the game shows it: how far a wing's bone may turn, her body pitch over, her head and
  // her body go, in her own lengths. The dive's stoop is a blur by its nature, its own streak behind it: her body and
  // head drop fastest there, and she pitches over as she brakes; falling to her death she gathers speed)
  const limit: Record<string, [number, number, number, number]> = { stand: [12, 8, 18, 6], walk: [32, 8, 16, 14], attack: [40, 14, 24, 22], gust: [40, 12, 20, 10], dive: [36, 32, 46, 44], call: [20, 8, 12, 6], reel: [32, 10, 20, 8], dying: [40, 12, 20, 16] };
  for (const m of Q2_MOVES) {
    const fps = fpsOf(m);
    const n = Math.round(queen2Long(m) * fps);
    const [wl, pl, hl, bl] = limit[m];
    for (let i = 0; i < n; i++) {
      const A = queen2MovePose(m, i / fps);
      const B = queen2MovePose(m, (i + 1) / fps);
      const when = `${m} at ${((i + 1) / fps).toFixed(3)} s`;
      for (const sd of [1, -1] as const) {
        const a = wingBones(A, sd);
        const b = wingBones(B, sd);
        for (const k of ['hum', 'fore', 'hand'] as const) assert.ok(ang(a[k], b[k]) <= wl, `${when}: a wing's ${k} turns ${ang(a[k], b[k]).toFixed(0)} degrees in a frame`);
      }
      assert.ok(Math.abs(A.pitch - B.pitch) <= pl, `${when}: she pitches ${Math.abs(A.pitch - B.pitch).toFixed(0)} degrees in a frame`);
      assert.ok(dist(A.head, B.head) <= hl, `${when}: her head goes ${dist(A.head, B.head).toFixed(1)} in a frame`);
      assert.ok(dist(A.body, B.body) <= bl, `${when}: her body goes ${dist(A.body, B.body).toFixed(1)} in a frame`);
    }
  }
  const same = (a: QueenPose, b: QueenPose): string => JSON.stringify(a, (_k, v) => (typeof v === 'number' ? Math.round(v * 1e6) : v)) + (JSON.stringify(b, (_k, v) => (typeof v === 'number' ? Math.round(v * 1e6) : v)) === JSON.stringify(a, (_k, v) => (typeof v === 'number' ? Math.round(v * 1e6) : v)) ? '' : ' differs');
  assert.ok(!same(standPose(0), standPose(Q2_STAND)).endsWith('differs'), 'her stand\'s last moment is not its first');
  const T = Q2_WALK.frames / Q2_WALK.fps;
  assert.ok(!same(queen2MovePose('walk', 0), queen2MovePose('walk', T)).endsWith('differs'), 'her hop\'s last moment is not its first');
});

/** Her points the eye goes by (her head and her beak's hook; her wrists and her hands' tips; her heels and toes; her body; her tail), where they are on the picture. */
const KEYS: [string, string, 'a' | 'b' | 'c'][] = [['head', 'skull', 'c'], ['head', 'hook1', 'b'], ['wingL', 'fore', 'b'], ['wingL', 'hand', 'b'], ['wingR', 'fore', 'b'], ['wingR', 'hand', 'b'], ['leg0', 'heel', 'c'], ['leg1', 'heel', 'c'], ['leg0', 'toe0', 'a'], ['leg1', 'toe0', 'a'], ['body', 'torso', 'c'], ['tail', 'tl0', 'c']];
function pointsOf(m: string, t: number, view: 'front' | 'back'): number[][] {
  const st = stage(view, 0, 0, { w: 2, h: 2 });
  const sol = solids(m, t);
  return KEYS.map(([part, piece, w]) => st.at(pieceOf(sol, part, piece)[w]) as unknown as number[]);
}
/** How far the picture leaps from one moment to another, in game pixels: the mean of its points (`from`, `to`: which of them). */
const leap = (a: number[][], b: number[][], from = 0, to = KEYS.length): number => {
  let s = 0;
  for (let i = from; i < to; i++) s += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]) / 2;
  return s / (to - from);
};

test('JUMP: where one move hands over to the next (her stand, from whatever frame it has come to, into each move and back; out of her hop as it comes round), the picture does not leap (Movement 5; the review\'s 3 game pixels); her head no more than it snaps in her stand', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = timesOf('stand').map((t) => pointsOf('stand', t, view));
    const rest = pointsOf('stand', 0, view);
    // (her head darts from one place to the next all through her stand: into a move it may go no further than that)
    let snap = 0;
    for (const a of stands) for (const b of stands) snap = Math.max(snap, leap(a, b, 0, 2));
    for (const m of Q2_MOVES) {
      if (m === 'stand') continue;
      const first = pointsOf(m, 0, view);
      stands.forEach((s, i) => {
        assert.ok(leap(s, first, 2) <= 3, `${view}: her stand at ${(i / Q2_IDLE.fps).toFixed(2)} s into her ${m} leaps ${leap(s, first, 2).toFixed(2)}`);
        assert.ok(leap(s, first, 0, 2) <= snap + 1e-9, `${view}: her head leaps into her ${m}`);
      });
      if (m !== 'dying' && m !== 'walk') assert.ok(leap(pointsOf(m, queen2Long(m), view), rest) <= 3, `${view}: her ${m}'s end back to her stand leaps`);
    }
    // (out of her hop as the game's bosses stop: as her hop comes round to its first frame, game/bosses.ts)
    const w = pointsOf('walk', Q2_WALK.frames / Q2_WALK.fps, view);
    assert.ok(leap(w, rest) <= 3, `${view}: her hop's round back to her stand leaps ${leap(w, rest).toFixed(2)}`);
  }
});

test('BLOW: her talon rake: gathered, burst up, her talons cocked up and forward and held trembling (the warning, a pose); raked down and through, ahead of her; down on the spot after it, mantling; back where she stood (Movement 3, Monsters 4)', () => {
  const P = (t: number): QueenPose => queen2MovePose('attack', t);
  for (let t = Q2_RAKE.warn; t <= Q2_RAKE.hit - 0.1; t += 1 / 30) {
    const p = P(t);
    for (const f of p.feet) assert.ok(f[2] > 90 && f[0] > p.body[0] + 40, `her talons are not cocked at ${t.toFixed(2)} s`);
    assert.ok(p.body[2] > 130, `she is not up at ${t.toFixed(2)} s`);
  }
  const hit = P(Q2_RAKE.hit);
  for (const f of hit.feet) assert.ok(f[2] < 25 && f[0] > Q2_RAKE.landX + 20, 'her talons are not raked down and through at the blow');
  for (let t = Q2_RAKE.land; t <= 1.0; t += 1 / 30) for (const [i, f] of P(t).feet.entries()) assert.ok(f[2] === 0 && Math.abs(f[0] - (standPose(0).feet[i][0] + Q2_RAKE.landX)) < 1e-9, `she is not down on her spot at ${t.toFixed(2)} s`);
  assert.equal(JSON.stringify(P(Q2_RAKE.long).feet), JSON.stringify(standPose(0).feet), 'she is not back where she stood');
});

test('BLOW: her wing gust: reared, her wings drawn back and held trembling (the warning); clapped forward, her body thrown after them; rocked back by her own blow; settled', () => {
  const P = (t: number): QueenPose => queen2MovePose('gust', t);
  for (let t = Q2_GUST.warn; t <= Q2_GUST.hit - 0.18; t += 1 / 30) {
    const p = P(t);
    for (const sd of [1, -1] as const) {
      const b = wingBones(p, sd);
      assert.ok(b.wr[0] < b.sh[0] - 20 && b.wr[2] > b.sh[2] + 30, `her wings are not drawn back at ${t.toFixed(2)} s`);
    }
    assert.ok(p.pitch > 50, `she is not reared at ${t.toFixed(2)} s`);
  }
  const hit = P(Q2_GUST.hit);
  for (const sd of [1, -1] as const) {
    const b = wingBones(hit, sd);
    assert.ok(b.wr[0] > b.sh[0] + 40, 'her wings are not clapped forward at the blow');
  }
  assert.ok(P(Q2_GUST.hit + 0.14).body[0] < hit.body[0] - 10, 'her own blow does not rock her back');
});

test('BLOW: her dive: up and out of sight, hung there (the game marks her line); stooped, her wings swept back; her talons in the rock along her line, held a tenth (Movement 7); home', () => {
  const P = (t: number): QueenPose => queen2MovePose('dive', t);
  for (let t = Q2_DIVE.warn; t <= Q2_DIVE.stoop; t += 1 / 30) assert.ok(P(t).body[2] > 280, `she is not up at ${t.toFixed(2)} s`);
  for (let t = Q2_DIVE.stoop + 0.02; t <= 0.92; t += 1 / 30) {
    const p = P(t);
    assert.ok(p.pitch < -30, `she is not stooping at ${t.toFixed(2)} s`);
    for (const sd of [1, -1] as const) {
      const b = wingBones(p, sd);
      assert.ok(b.wr[2] > b.sh[2] + 20, `her wings are not swept back at ${t.toFixed(2)} s`);
    }
  }
  const a = P(Q2_DIVE.hit);
  const b = P(Q2_DIVE.hit + Q2_DIVE.freeze);
  for (const i of [0, 1]) {
    assert.ok(a.feet[i][2] === 0 && Math.abs(a.feet[i][0] - Q2_DIVE.strikeX) < 16, 'her talons are not in the rock along her line at the strike');
    assert.equal(JSON.stringify(a.feet[i]), JSON.stringify(b.feet[i]), 'her talons do not hold');
  }
  assert.ok(dist(a.body, b.body) < 2 && dist(a.head, b.head) < 3, 'she is not held a tenth at the strike');
  assert.equal(JSON.stringify(P(Q2_DIVE.long).feet), JSON.stringify(standPose(0).feet), 'she is not home');
});

test('her call: reared, her wings flung wide and high, her head thrown back, her beak open to the sky, screeching; her crown and mark at their hottest; rings of the cult\'s fire going out over the rock', () => {
  for (let t = Q2_CALL.screech[0] + 0.04; t <= Q2_CALL.screech[1]; t += 1 / 30) {
    const p = queen2MovePose('call', t);
    assert.ok(p.look[2] > 0.8 && p.gape > 0.9 && p.heat > 0.9, `she is not screeching to the sky at ${t.toFixed(2)} s`);
    for (const sd of [1, -1] as const) assert.ok(wingBones(p, sd).wr[2] > wingBones(p, sd).sh[2] + 50, `her wings are not flung high at ${t.toFixed(2)} s`);
  }
  for (const at of Q2_CALL.rings) {
    const fire = queen2Grains('call', at + 0.15).filter((g) => FIRE.has(rgba(g[1]).slice(0, 3).join(',')) && g[0][2] < 6);
    assert.ok(fire.length > 20, `no ring of fire at ${at} s`);
  }
});

test('ALIVE: never still from one frame to the next; she breathes, her body rising and falling; she sways; her head darts (his pick, fast and vicious) (Movement 6)', () => {
  const ts = timesOf('stand');
  const geo = (t: number): string => JSON.stringify(solids('stand', t), (k, v) => (k === 'skin' || k === 'ramp' ? undefined : typeof v === 'number' ? Math.round(v * 1e4) : v));
  for (let i = 0; i < ts.length; i++) assert.notEqual(geo(ts[i]), geo(ts[(i + 1) % ts.length]), `frames ${i} and ${i + 1} are the same`);
  const z = ts.map((t) => standPose(t).body[2]);
  const roll = ts.map((t) => standPose(t).roll);
  assert.ok(Math.max(...z) - Math.min(...z) > 3, 'she does not breathe');
  assert.ok(Math.max(...roll) - Math.min(...roll) > 2.5, 'she does not sway');
  let darts = 0;
  for (let i = 0; i < ts.length; i++) {
    const a = standPose(ts[i]).head;
    const b = standPose(ts[(i + 1) % ts.length]).head;
    if (dist(a, b) * Q2_SCALE > TILE3 / 5) darts++;
  }
  assert.ok(darts >= 4, `her head darts ${darts} times a round`);
});

test('struck: her head whipped back, her wings snapping open, her feathers bursting from her breast; her head snapping forward to glare; back on her stand at its end (Hits 3, 4)', () => {
  const p = queen2MovePose('reel', 0.08);
  assert.ok(p.look[2] > 0.4 && p.gape > 0.6, 'her head is not whipped back');
  assert.ok(queen2MovePose('reel', 0.2).look[2] < -0.4, 'her head does not snap forward to glare');
  assert.ok(queen2Grains('reel', 0.15).length > 10, 'no feathers burst from her');
  assert.equal(queen2Grains('reel', Q2_REEL).length, 0, 'her feathers are not gone by her flinch\'s end');
  assert.equal(JSON.stringify(queen2MovePose('reel', Q2_REEL)), JSON.stringify(standPose(0)), 'she is not back on her stand');
});

test('her death, his pick ("Topples off the edge (Recommended)"): screaming, her fire going out; two steps back; clawing; over backward into the drop, her wings flailing, her feathers swirling up after her', () => {
  const p = (t: number): QueenPose => queen2MovePose('dying', t);
  assert.ok(p(0.2).look[2] > 0.8 && p(0.2).gape > 0.9, 'she does not scream');
  const back0 = p(0.15).feet.map((f) => f[0]);
  const back1 = p(0.6).feet.map((f) => f[0]);
  for (const i of [0, 1]) assert.ok(back1[i] < back0[i] - 30, 'she does not stagger back');
  assert.ok(p(0.9).lit < 0.1, 'her fire is not out as she goes over');
  const late = queen2MovePainted('dying', 1.2, 'front');
  let fire = 0;
  for (let i = 0; i < late.px.d.length; i += 4) if (late.px.d[i + 3] === 255 && FIRE.has(`${late.px.d[i]},${late.px.d[i + 1]},${late.px.d[i + 2]}`)) fire++;
  assert.ok(fire === 0 && late.lights.length === 0, `her fire still burns as she falls (${fire} pixels)`);
  assert.ok(p(Q2_DIE.long).body[2] < -100 && p(Q2_DIE.long).body[0] < -100, 'she is not over the edge, behind her, into the drop');
  assert.ok(queen2Grains('dying', 1.5).length > 16, 'no feathers swirl up after her');
});

test('what her moves throw off comes and goes: nothing at their start or their end', () => {
  for (const m of Q2_MOVES) {
    assert.equal(queen2Grains(m, 0).length, 0, `${m}: something thrown off at its start`);
    if (m !== 'dying') assert.equal(queen2Grains(m, queen2Long(m)).length, 0, `${m}: something thrown off at its end`);
  }
  assert.ok(queen2Grains('attack', Q2_RAKE.hit).length > 20, 'her rake leaves no claw-streaks');
  assert.ok(queen2Grains('gust', Q2_GUST.hit + 0.1).length > 40, 'her gust drives out no blast');
  assert.ok(queen2Grains('dive', Q2_DIVE.hit + 0.15).length > 30, 'her dive throws up no crater');
});

test('her pictures as the game holds them: standing fifteen a second, hopping twenty; her rake, gust, dive and call, and struck, at thirty; her death at twenty', () => {
  const art = makeQueen2Art();
  for (const set of [art.front, art.back]) {
    assert.equal(set.idle.length, Q2_IDLE.frames);
    assert.equal(set.idleFps, Q2_IDLE.fps);
    assert.equal(set.walk.length, Q2_WALK.frames);
    assert.equal(set.walkFps, Q2_WALK.fps);
    const c = set.clips!;
    assert.equal(c.attack!.frames.length, Math.round(Q2_RAKE.long * 30) + 1);
    assert.equal(c.attack!.hit, Q2_RAKE.hit);
    assert.equal(c.die!.fps, 20);
    assert.equal(c.reel!.frames.length, Math.round(Q2_REEL * 30) + 1);
    assert.equal(c.moves!.gust.hit, Q2_GUST.hit);
    assert.equal(c.moves!.dive.hit, Q2_DIVE.hit);
    assert.equal(c.moves!.call.frames.length, Math.round(Q2_CALL.long * 30) + 1);
  }
});
