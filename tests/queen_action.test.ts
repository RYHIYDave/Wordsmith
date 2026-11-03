// THE CARRION QUEEN'S MOVES DONE THE ACTION WAY (src/art/carrion_queen_action.ts, QUEEN_ACTION, off; what they do to her eyrie,
// src/art/carrion_queen_action_fx.ts; docs/mockups/action_f7_queen/README.md). The owner, 31 Oct 2026: “I hesitate to have any move
// push or something cause I don’t want any player to get one shot cause they fell off a cliff or whatever”; “I don’t want too much
// of the same thing.  So can we do something we haven’t done yet?”; his picks “Yes, no drop-pushes (Recommended)” and “Eclipse
// (Recommended)”. Under his Movement 9 (“Like the wind up and wind down are big but the actual punch is lightning quick”) and his rule
// for the enemies (“Start from now on, but every enemy is going to need that change eventually.  And bigger AOE to compensate for the
// extra time the player gets to evade”).
//   1. the switch off; nothing of the game imports the mock-up; her stand, hop, call, struck and death are the game's own;
//   2. THE GAME'S FRAMES THE SAME: every frame the game shows of her hashes as on the branch this came from (a8d862a);
//   3. every frame of her four new moves, from in front and from behind: crisp, the enemy's pink edge, no cyan, every light the cult's
//      fire, nothing cut off at her canvas's edge;
//   4. THE BOSSES' REVIEW, written out for her as tests/carrion_queen2.test.ts writes it (she is not on the heroes' bones, so
//      art/boss_checks.ts checkBoss cannot take her): FLOOR, SLIDE, THROUGH, JERK, JUMP, BLOW and ALIVE, and his STRIKE, every frame
//      of every new move, from in front and from behind where the picture is asked;
//   5. Movement 9 and the numbers: each strike two frames, held before it, smeared then only, landing on its last frame; each area
//      bigger than the old;
//   6. what her moves do to her eyrie: crisp, no cyan, her pink, nothing after; her gust's rays straight out from her and its shove
//      straight away from her; the Eclipse's dark readable (darkened, not black), its pools lit, drifting slowly, never meeting;
//      HIS FIX, 2 Nov 2026, 07:32 (“The carrion queen’s dive should be a much bigger AOE, and really sell it with dirt and dust on the
//      impact.”): her dive's area 3.2 round (twice the first pass's), its burst of rock and dust out to its edge, hanging, then gone.
//   run: tsx --test tests/queen_action.test.ts
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import { QA_DIVE, QA_ECLIPSE, QA_GUST, QA_HITS, QA_HOLDS, QA_MOVES, QA_NEW, QA_RAKE, QA_STRIKES, QA_TILE, QUEEN_ACTION, f, makeQueenActionArt, qaSmear, qaSmeared, queenActionGrains, queenActionLong, queenActionPainted, queenActionPose, talonTips } from '../src/art/carrion_queen_action';
import { DARK_FLOOR, darkened, diveStrikes, eclipseDark, from, gustRays, gustShove, gustStrikes, inPool, lightAt, paintDiveBurst, paintDiveMarks, paintGustMarks, paintPoolRims, paintRakeMarks, paintVultureLine, poolsAt, rakeStrikes } from '../src/art/carrion_queen_action_fx';
import type { At } from '../src/art/carrion_queen_action_fx';
import { Q2_CANVAS, Q2_IDLE, Q2_SCALE, queen2Bits, standPose, wingBones } from '../src/art/carrion_queen2';
import type { QueenPose } from '../src/art/carrion_queen2';
import { Q2_DIVE, Q2_GUST, Q2_RAKE, queen2Long, queen2MovePose } from '../src/art/carrion_queen2_moves';
// (her old numbers, as her rules have them: game/act1_rules/queen.ts QN, not imported here: it brings in all the descent's rules)
const QN = { edge: 1.715, rake: { to: 2.5, half: 0.9 }, gust: { far: 5.5, wide: 1.2, spread: 0.45, push: 3.4 }, dive: { at: 2.858, r: 1.1, half: 0.6 } } as const;
import { CYAN, BLADE, SPARK, GLINT, RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { TILE3 } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { Px, rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';
import { makeQueen2Art } from '../src/art/carrion_queen2_moves';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import type { Sprite } from '../src/engine/px';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
paintWithoutCanvas();
interface Hasher {
  update(d: string | Uint8ClampedArray): Hasher;
  digest(e: 'hex'): string;
}
const sha = (): Hasher => (nodeCrypto as { createHash(a: string): Hasher }).createHash('sha256');
// (as tools/action_f7_queen_hash.ts hashes them: every frame of every move, both ways round)
function queenHash(art: ActorArt): string {
  const lists = (s: AnimSet): [string, Sprite[]][] => {
    const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
    const c = s.clips;
    if (c) {
      for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, c[k]!.frames]);
      for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
    }
    return out;
  };
  const frame = (sp: Sprite): string => {
    const p = sp.img as unknown as Px;
    return sha().update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).update(JSON.stringify(sp.aura ?? null)).digest('hex').slice(0, 12);
  };
  const m: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) m[`${view}:${name}`] = fr.map(frame);
  return sha().update(JSON.stringify(m)).digest('hex').slice(0, 16);
}

const FR = 1 / 30;
const FIRE = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 140 || max - min < 0.4 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 160 && h <= 205;
}
/** Every frame of a move the game would show, as times (at 30 a second, its last too). */
function timesOf(m: string): number[] {
  const n = Math.round(queenActionLong(m) * 30);
  return Array.from({ length: n + 1 }, (_, i) => i / 30);
}
type Solid = { part: string; piece: string; shape: any };
const solids = (m: string, t: number): Solid[] => queen2Bits(queenActionPose(m, t), t) as Solid[];
const pieceOf = (sol: Solid[], part: string, piece: string): any => sol.find((x) => x.part === part && x.piece === piece)?.shape;
function lowOf(sh: any): number {
  if (sh.k === 'panel') return Math.min(...[-1, 1].flatMap((a) => [-1, 1].map((b) => sh.c[2] + a * sh.u[2] + b * sh.v[2])));
  if (sh.k === 'ball') return sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  if (sh.k === 'rod') return Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  return Infinity;
}
const ang = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => (Math.acos(Math.max(-1, Math.min(1, (a[0] * b[0] + a[1] * b[1] + a[2] * b[2]) / (Math.hypot(...a) * Math.hypot(...b))))) * 180) / Math.PI;
const dist = (a: ReadonlyArray<number>, b: ReadonlyArray<number>): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
function segGap(p1: number[], q1: number[], p2: number[], q2: number[]): number {
  let best = Infinity;
  for (let i = 0; i <= 20; i++) {
    const a = p1.map((v, k) => v + ((q1[k] - v) * i) / 20);
    for (let j = 0; j <= 20; j++) best = Math.min(best, dist(a, p2.map((v, k) => v + ((q2[k] - v) * j) / 20)));
  }
  return best;
}
function inBall(p: number[], sh: any): boolean {
  let s = 0;
  for (const a of sh.ax as number[][]) {
    const l2 = a[0] * a[0] + a[1] * a[1] + a[2] * a[2];
    const d = ((p[0] - sh.c[0]) * a[0] + (p[1] - sh.c[1]) * a[1] + (p[2] - sh.c[2]) * a[2]) / l2;
    s += d * d;
  }
  return s < 1;
}
/** Whether moving from `t` to the next frame is a step of a strike (its frames, or the one as it lands). */
const inStrike = (m: string, t: number): boolean => {
  const s = QA_STRIKES[m];
  return !!s && t >= s[0] - 1e-6 && t < s[1] + FR - 1e-6;
};
/** The end she strikes with, in her lengths: her talons in her rake, her wings' tips in her gust and Eclipse, her body in her dive. */
function striking(m: string, P: QueenPose): ReadonlyArray<ReadonlyArray<number>> {
  if (m === 'attack') return talonTips(P);
  if (m === 'dive') return [P.body, P.head];
  return [wingBones(P, 1).tip, wingBones(P, -1).tip];
}
const travel = (m: string, a: number, b: number): number => {
  const A = striking(m, queenActionPose(m, a));
  const B = striking(m, queenActionPose(m, b));
  return Math.max(...A.map((p, i) => dist(p, B[i])));
};

// =============================================================================================

test('1. the switch off; nothing of the game imports the mock-up but what brings it in; her stand, hop, call, struck and death the game\'s own', () => {
  assert.equal(QUEEN_ACTION.on, false);
  // (brought in by the main chat, 2 Nov 2026, behind the switch: only through her figure, her rules, what she leaves, and the dark of
  // her Eclipse in the floor's light)
  const BRINGS = /^(art\/act1_figs\/queen|game\/act1_rules\/queen|render\/act1_fx\/queen|render\/render)\.ts$/;
  for (const f0 of fs.readdirSync('src', { recursive: true })) {
    const name = f0.replace(/\\/g, '/');
    if (!name.endsWith('.ts') || name.startsWith('dev') || name.startsWith('art/carrion_queen_action') || BRINGS.test(name)) continue;
    assert.ok(!/from ['"][^'"]*carrion_queen_action(_fx)?['"]/.test(fs.readFileSync(`src/${f0}`, 'utf8')), `src/${name} imports the mock-up`);
  }
  for (const m of ['stand', 'walk', 'call', 'reel', 'dying']) {
    for (const t of [0, 0.3, 0.7, 1.1]) assert.equal(JSON.stringify(queenActionPose(m, t)), JSON.stringify(queen2MovePose(m, t)), `${m} at ${t}: not the game's own`);
    assert.equal(queenActionLong(m), queen2Long(m));
  }
  // (as the game holds her: her stand and hop, her rake, her gust, dive, call and the Eclipse, struck, her death)
  const art = makeQueenActionArt();
  for (const v of [art.front, art.back]) {
    assert.equal(v.idle.length, Q2_IDLE.frames);
    assert.ok(v.clips?.attack?.hit === QA_RAKE.hit && v.clips?.moves?.gust?.hit === QA_GUST.hit && v.clips?.moves?.dive?.hit === QA_DIVE.hit && v.clips?.moves?.eclipse?.hit === QA_ECLIPSE.hit);
    assert.equal(v.clips?.moves?.call?.frames.length, Math.round(queen2Long('call') * 30) + 1);
    assert.equal(v.clips?.moves?.eclipse?.frames.length, Math.round(QA_ECLIPSE.long * 30) + 1);
  }
});

test('2. THE GAME\'S FRAMES THE SAME: every frame the game shows of her, both ways round, hashes as on a8d862a', () => {
  // (tools/action_f7_queen_hash.ts, run on a8d862a: her pictures as art/act1_figs/queen.ts hands them over)
  assert.equal(queenHash(makeQueen2Art()), 'd41a8cbde1d948d1');
});

test('3. every frame of her four new moves, both ways round: crisp, her pink edge, no cyan, every light the cult\'s fire, nothing cut off', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  for (const m of QA_NEW) {
    for (const view of ['front', 'back'] as const) {
      for (const t of timesOf(m)) {
        const { px, lights } = queenActionPainted(m, t, view);
        const name = `${m} ${view} ${t.toFixed(3)}`;
        let soft = 0;
        let rim = 0;
        let cut = 0;
        let cyan: string | null = null;
        for (let y = 0; y < px.h; y++) {
          for (let x = 0; x < px.w; x++) {
            const i = (y * px.w + x) * 4;
            const a = px.d[i + 3];
            if (a === 0) continue;
            if (a === RIM_ALPHA && px.d[i] === pr && px.d[i + 1] === pg && px.d[i + 2] === pb) rim++;
            else if (a !== 255) soft++;
            const k = `${px.d[i]},${px.d[i + 1]},${px.d[i + 2]}`;
            if (!cyan && (FRIEND.has(k) || cyanGlow(px.d[i], px.d[i + 1], px.d[i + 2]))) cyan = k;
            if (x === 0 || y === 0 || x === px.w - 1 || y === px.h - 1) cut++;
          }
        }
        assert.ok(soft === 0, `${name}: ${soft} soft pixels`);
        assert.ok(rim > 500, `${name}: her pink edge, ${rim} pixels`);
        assert.ok(!cyan, `${name}: cyan ${cyan}`);
        assert.ok(cut === 0, `${name}: ${cut} pixels on her canvas's edge`);
        for (const L of lights) assert.ok(FIRE.has(rgba(L.color).slice(0, 3).join(',')), `${name}: her light ${L.color}`);
      }
    }
  }
});

test('4a. FLOOR: nothing of her under the rock; SLIDE: a foot that is down stays where it came down (Movement 8)', () => {
  for (const m of QA_NEW) {
    for (const t of timesOf(m)) for (const b of solids(m, t)) assert.ok(lowOf(b.shape) >= -0.5, `${m} at ${t.toFixed(3)} s: her ${b.part} ${b.piece} is under the rock`);
    const dt = 1 / 600;
    for (let t = 0; t + dt <= queenActionLong(m); t += dt) {
      const a = queenActionPose(m, t).feet;
      const b = queenActionPose(m, t + dt).feet;
      for (const i of [0, 1]) {
        if (a[i][2] > 1e-6 || b[i][2] > 1e-6) continue;
        assert.ok(Math.abs(b[i][0] - a[i][0]) < 1e-6 && Math.abs(b[i][1] - a[i][1]) < 1e-6, `${m}: her foot ${i} slides at ${t.toFixed(3)} s`);
      }
    }
  }
});

test('4b. THROUGH: no leg through the other, no wing\'s bones through her body, in any frame (Heroes 6, for every boss)', () => {
  for (const m of QA_NEW) {
    for (const t of timesOf(m)) {
      const sol = solids(m, t);
      const leg = (k: number): { a: number[]; b: number[]; r: number }[] => ['thigh', 'tarsus'].map((p) => {
        const sh = pieceOf(sol, `leg${k}`, p);
        return { a: sh.a, b: sh.b, r: Math.max(sh.ra, sh.rb) };
      });
      for (const s1 of leg(0)) for (const s2 of leg(1)) assert.ok(segGap(s1.a, s1.b, s2.a, s2.b) > (s1.r + s2.r) * 0.85, `${m}: her legs pass through each other at ${t.toFixed(3)} s`);
      const body = [pieceOf(sol, 'body', 'torso'), pieceOf(sol, 'body', 'breast')];
      for (const part of ['wingL', 'wingR']) {
        for (const [piece, from0] of [['hum', 0.35], ['fore', 0], ['hand', 0]] as [string, number][]) {
          const sh = pieceOf(sol, part, piece);
          for (let q = from0; q <= 1.001; q += 0.1) {
            const p = sh.a.map((v: number, k: number) => v + (sh.b[k] - v) * q);
            for (const b of body) assert.ok(!inBall(p, b), `${m}: her ${part}'s ${piece} goes through her body at ${t.toFixed(3)} s`);
          }
        }
      }
    }
  }
});

test('4c. JERK: outside the strikes nothing leaps from one frame to the next; her wings sweep, never flick (Movement 5)', () => {
  // (as tests/carrion_queen2.test.ts allows her moves: a wing's bone's turn, her pitch, her head and her body in a frame, her lengths)
  const limit: Record<string, [number, number, number, number]> = { attack: [40, 14, 26, 24], gust: [40, 12, 20, 12], dive: [36, 32, 46, 44], eclipse: [40, 12, 22, 12] };
  for (const m of QA_NEW) {
    const [wl, pl, hl, bl] = limit[m];
    const ts = timesOf(m);
    for (let i = 0; i + 1 < ts.length; i++) {
      if (inStrike(m, ts[i])) continue;
      const A = queenActionPose(m, ts[i]);
      const B = queenActionPose(m, ts[i + 1]);
      const when = `${m} at ${ts[i + 1].toFixed(3)} s`;
      for (const sd of [1, -1] as const) {
        const a = wingBones(A, sd);
        const b = wingBones(B, sd);
        for (const k of ['hum', 'fore', 'hand'] as const) assert.ok(ang(a[k], b[k]) <= wl, `${when}: a wing's ${k} turns ${ang(a[k], b[k]).toFixed(0)} degrees`);
      }
      assert.ok(Math.abs(A.pitch - B.pitch) <= pl, `${when}: she pitches ${Math.abs(A.pitch - B.pitch).toFixed(0)}`);
      assert.ok(dist(A.head, B.head) <= hl, `${when}: her head goes ${dist(A.head, B.head).toFixed(1)}`);
      assert.ok(dist(A.body, B.body) <= bl, `${when}: her body goes ${dist(A.body, B.body).toFixed(1)}`);
    }
  }
});

/** Her points the eye goes by, on the picture (as tests/carrion_queen2.test.ts has them). */
const KEYS: [string, string, 'a' | 'b' | 'c'][] = [['head', 'skull', 'c'], ['head', 'hook1', 'b'], ['wingL', 'fore', 'b'], ['wingL', 'hand', 'b'], ['wingR', 'fore', 'b'], ['wingR', 'hand', 'b'], ['leg0', 'heel', 'c'], ['leg1', 'heel', 'c'], ['leg0', 'toe0', 'a'], ['leg1', 'toe0', 'a'], ['body', 'torso', 'c'], ['tail', 'tl0', 'c']];
function pointsOf(m: string, t: number, view: 'front' | 'back', P?: QueenPose): number[][] {
  const st = stage(view, 0, 0, { w: 2, h: 2 });
  const sol = queen2Bits(P ?? (m === 'stand' ? standPose(t) : queenActionPose(m, t)), t) as Solid[];
  return KEYS.map(([part, piece, w]) => st.at(pieceOf(sol, part, piece)[w]) as unknown as number[]);
}
const leap = (a: number[][], b: number[][], from0 = 0, to = KEYS.length): number => {
  let s = 0;
  for (let i = from0; i < to; i++) s += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]) / 2;
  return s / (to - from0);
};

test('4d. JUMP: her stand, from whatever frame it has come to, into each new move and back, does not leap (the review\'s 3 game pixels)', () => {
  for (const view of ['front', 'back'] as const) {
    const stands = Array.from({ length: Q2_IDLE.frames }, (_, i) => pointsOf('stand', i / Q2_IDLE.fps, view));
    const rest = pointsOf('stand', 0, view);
    let snap = 0;
    for (const a of stands) for (const b of stands) snap = Math.max(snap, leap(a, b, 0, 2));
    for (const m of QA_NEW) {
      const first = pointsOf(m, 0, view);
      stands.forEach((s, i) => {
        assert.ok(leap(s, first, 2) <= 3, `${view}: her stand at ${(i / Q2_IDLE.fps).toFixed(2)} s into her ${m} leaps ${leap(s, first, 2).toFixed(2)}`);
        assert.ok(leap(s, first, 0, 2) <= snap + 1e-9, `${view}: her head leaps into her ${m}`);
      });
      assert.ok(leap(pointsOf(m, queenActionLong(m), view), rest) <= 3, `${view}: her ${m}'s end back to her stand leaps`);
    }
  }
});

test('4e. BLOW and ALIVE: each blow wound up and HELD (the warning, a pose), trembling, never still; followed through after', () => {
  for (const m of QA_NEW) {
    const [h0, h1] = QA_HOLDS[m];
    const hit = QA_HITS[m];
    assert.ok(h1 - h0 >= 0.39, `${m}: held ${(h1 - h0).toFixed(2)} s`);
    // (held: her striking end barely goes anywhere from frame to frame, but she is never still)
    let most = 0;
    for (let t = h0 + FR; t < h1 - 1e-6; t += FR) {
      most = Math.max(most, travel(m, t, t + FR));
      assert.ok(JSON.stringify(queenActionPose(m, t)) !== JSON.stringify(queenActionPose(m, t + FR)), `${m}: still at ${t.toFixed(3)} s`);
    }
    assert.ok(most < 14, `${m}: in her hold her striking end goes ${most.toFixed(1)} in a frame`);
    // (followed through: she is not back on her stand for a third of a second and more after the blow)
    assert.ok(queenActionLong(m) - hit >= 0.6, `${m}: her wind-down is ${(queenActionLong(m) - hit).toFixed(2)} s`);
    const P = queenActionPose(m, hit + 0.15);
    assert.ok(dist(P.head, standPose(0).head) > 8 || dist(P.body, standPose(0).body) > 8, `${m}: back on her stand right after her blow`);
  }
});

test('4f. STRIKE (his Movement 9): each strike two frames, far faster than anything of its wind-up or wind-down, landing on its last frame; smeared then only', () => {
  for (const m of QA_NEW) {
    const [s0, s1] = QA_STRIKES[m];
    assert.equal(Math.round((s1 - s0) * 30), 2, `${m}: its strike is ${Math.round((s1 - s0) * 30)} frames`);
    assert.ok(Math.abs(QA_HITS[m] - s1) < 1e-9, `${m}: it lands on its last frame`);
    assert.ok(Math.abs(QA_HOLDS[m][1] - s0) < 1e-9, `${m}: struck straight out of its hold`);
    const strike = Math.min(travel(m, s0, s0 + FR), travel(m, s0 + FR, s1));
    let other = 0;
    for (const t of timesOf(m)) if (!inStrike(m, t) && t + FR <= queenActionLong(m) + 1e-9) other = Math.max(other, travel(m, t, t + FR));
    assert.ok(strike > 2.2 * other, `${m}: its strike goes ${strike.toFixed(1)} a frame, the rest up to ${other.toFixed(1)}`);
    // (the smear: on the strike's frames and the one after, after-images of her striking end, white-hot; on no other frame)
    for (const t of timesOf(m)) {
      const sm = qaSmeared(m, t);
      const after = qaSmear(m, t, 'front').length;
      assert.ok(sm ? after >= 40 : after === 0, `${m} at ${t.toFixed(3)}: ${after} after-images`);
      if (sm) assert.ok(queenActionGrains(m, t, 'front').length >= after, `${m} at ${t.toFixed(3)}: its smear not painted`);
      assert.equal(sm, t > s0 + 1e-6 && t <= s1 + FR + 1e-6, `${m} at ${t.toFixed(3)}: smeared or not`);
    }
  }
});

test('5. the numbers: every area bigger than her old one; her dive further; held long enough to read', () => {
  const tile = (lengths: number): number => lengths / QA_TILE;
  // (her lengths to a tile, as the game's: 60 of them her death's edge, QN.edge)
  assert.ok(Math.abs(tile(60) - QN.edge) < 0.01, `a tile: ${QA_TILE.toFixed(2)} of her lengths`);
  assert.ok(Math.abs(QA_TILE * Q2_SCALE - TILE3) < 1e-9);
  // the rake: out to 3.4 tiles (old 2.5), 0.65 to 1.5 to either side (old 0.9)
  assert.ok(QA_RAKE.to > QN.rake.to + 0.8 && QA_RAKE.half + QA_RAKE.spread * QA_RAKE.to > QN.rake.half + 0.5);
  assert.ok(rakeStrikes(3.3, 1.3) && !rakeStrikes(3.6, 0) && !rakeStrikes(1, 1.2));
  assert.ok(QA_RAKE.long > Q2_RAKE.long && QA_RAKE.hit > Q2_RAKE.hit);
  // the gust: out to 7 tiles (old 5.5), wider
  assert.ok(QA_GUST.far > QN.gust.far && QA_GUST.wide > QN.gust.wide && QA_GUST.spread > QN.gust.spread);
  assert.ok(gustStrikes(6.9, 5.5) && !gustStrikes(7.2, 0));
  assert.ok(QA_GUST.hit > Q2_GUST.hit);
  // the dive: 4 tiles out (old 2.86), her line 0.9 to either side (old 0.6); HIS FIX, 2 Nov 2026 (“The carrion queen’s dive should
  // be a much bigger AOE”): the area she strikes 3.2 round, twice the first pass's 1.6 (the game's own 1.1)
  assert.ok(Math.abs(tile(QA_DIVE.strikeX + 8) - QA_DIVE.at) < 0.01, `her talons strike ${tile(QA_DIVE.strikeX + 8).toFixed(2)} tiles out`);
  assert.ok(QA_DIVE.at > QN.dive.at && QA_DIVE.r >= 2 * 1.6 && QA_DIVE.r > 2.5 * QN.dive.r && QA_DIVE.half > QN.dive.half);
  assert.ok(diveStrikes(4, 3.1) && diveStrikes(4 + 3.1, 0) && diveStrikes(1.0, 0.8) && !diveStrikes(4, 3.3) && !diveStrikes(0.5, 1.0));
  // (the dust hangs a second and more after her strike, the crater stays a moment; the game's shake the most it uses)
  assert.ok(QA_DIVE.dust >= 2 && QA_DIVE.crater >= 1.5 && QA_DIVE.shake === 8);
  assert.ok(QA_DIVE.hit > Q2_DIVE.hit);
  // (her rake comes down where her pictures put her talons; her dive where they strike)
  const R = queenActionPose('attack', QA_RAKE.hit);
  assert.ok(R.feet.every((p) => p[2] === 0) && Math.abs(tile(R.feet[0][0]) - tile(QA_RAKE.landX + 4)) < 0.05);
  const Dv = queenActionPose('dive', QA_DIVE.hit);
  assert.ok(Dv.feet.every((p) => p[2] === 0) && Math.abs(tile((Dv.feet[0][0] + Dv.feet[1][0]) / 2) - QA_DIVE.at) < 0.1);
  // the Eclipse: its summoning held more than three quarters of a second; the dark long enough to dance in
  assert.ok(QA_ECLIPSE.hold[1] - QA_ECLIPSE.hold[0] > 0.8 && QA_ECLIPSE.dark >= 6);
  assert.ok(QA_MOVES.length === 9);
});

/** A blank picture, a floor point `x`, `y` tiles from its middle at (300, 200) and `z` up. */
const blank = (): Px => new Px(600, 400);
const at: At = (x, y, z = 0) => [300 + 32 * (x - y), 200 + 16 * (x + y) - z];
function fxLook(p: Px): { painted: number; soft: number; cyan: boolean; pink: number } {
  let painted = 0;
  let soft = 0;
  let pink = 0;
  let cyan = false;
  for (let i = 0; i < p.d.length; i += 4) {
    if (!p.d[i + 3]) continue;
    painted++;
    if (p.d[i + 3] !== 255) soft++;
    const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
    if (FIRE.has(k)) pink++;
    if (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2])) cyan = true;
  }
  return { painted, soft, cyan, pink };
}

test('6a. what her moves do to her eyrie: marked in her pink while she winds up, struck, then gone; crisp; no cyan', () => {
  const B: [number, number] = [-2, -1];
  const painters: [string, (p: Px, t: number) => void, number, number, number][] = [
    ['rake', (p, t) => paintRakeMarks(p, at, B, 0, t), QA_RAKE.hold[0], QA_RAKE.hit, QA_RAKE.long + 1],
    ['gust', (p, t) => paintGustMarks(p, at, B, 0, t), QA_GUST.hold[0], QA_GUST.hit, QA_GUST.hit + 1],
    ['dive', (p, t) => paintDiveMarks(p, at, B, 0, t), QA_DIVE.hold[0], QA_DIVE.hit, QA_DIVE.hit + QA_DIVE.crater + 0.01],
  ];
  for (const [name, paint, warn, hit, gone] of painters) {
    for (let t = 0; t <= gone + 0.1; t += FR) {
      const p = blank();
      paint(p, t);
      const L = fxLook(p);
      assert.ok(L.soft === 0 && !L.cyan, `${name} at ${t.toFixed(3)}: soft ${L.soft}, cyan ${L.cyan}`);
      if (t >= warn && t < hit) assert.ok(L.pink > 150, `${name} at ${t.toFixed(3)}: its warning in her pink, ${L.pink}`);
      if (t > gone) assert.equal(L.painted, 0, `${name} at ${t.toFixed(3)}: left behind`);
    }
  }
  for (let k = 0; k <= 1.0001; k += 0.1) {
    const p = blank();
    paintVultureLine(p, at, [-3, -2], [1, 1], k);
    const L = fxLook(p);
    assert.ok(L.soft === 0 && !L.cyan && (k < 0.05 || L.pink > 20), `a vulture's line at ${k.toFixed(1)}`);
  }
});

test('6d. HER DIVE’S BURST (his fix, 2 Nov 2026: “really sell it with dirt and dust on the impact”): the rock flung up, the dust ringed out to the area’s edge, hanging, then gone; crisp; no cyan', () => {
  const B: [number, number] = [-2, -1];
  const big = (): Px => new Px(1000, 700);
  const at2: At = (x, y, z = 0) => [500 + 32 * (x - y), 330 + 16 * (x + y) - z];
  const [cx, cy] = from(B, 0, QA_DIVE.at, 0);
  for (let t = QA_DIVE.hit - 0.1; t <= QA_DIVE.hit + QA_DIVE.dust + 0.1; t += FR) {
    const s = t - QA_DIVE.hit;
    for (const part of ['back', 'front'] as const) {
      const p = big();
      paintDiveBurst(p, at2, B, 0, t, part);
      const L = fxLook(p);
      assert.ok(L.soft === 0 && !L.cyan, `the burst (${part}) at ${s.toFixed(3)}: soft ${L.soft}, cyan ${L.cyan}`);
      if (s < 0 || s > QA_DIVE.dust) assert.equal(L.painted, 0, `the burst (${part}) at ${s.toFixed(3)}: there before or after`);
    }
    // (both halves together: plenty of it from the first frame, and it reaching out to the area's edge)
    if (s > 0.02 && s < 1.0) {
      const p = big();
      paintDiveBurst(p, at2, B, 0, t, 'back');
      paintDiveBurst(p, at2, B, 0, t, 'front');
      let n = 0;
      let far = 0;
      const [X0, Y0] = at2(cx, cy);
      for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
        if (!p.d[(y * p.w + x) * 4 + 3]) continue;
        n++;
        // (how far out along the floor: the picture's across, in tiles: 45 pixels a tile at the most)
        far = Math.max(far, Math.abs(x - X0) / (32 * Math.SQRT2));
        void Y0;
      }
      assert.ok(n > 3000, `the burst at ${s.toFixed(3)}: ${n} pixels`);
      if (s > 0.45) assert.ok(far >= QA_DIVE.r * 0.9, `the dust out to ${far.toFixed(2)} tiles at ${s.toFixed(3)}`);
    }
  }
});

test('6b. HER GUST, NO DROP-PUSH: its rays run straight out from her, and it shoves straight away from her, harder the nearer', () => {
  const rays = gustRays();
  assert.equal(rays.length, QA_GUST.rays);
  // (symmetric about the way she faces, the outer two on the cone's edges)
  for (let i = 0; i < rays.length; i++) assert.ok(Math.abs(rays[i].a + rays[rays.length - 1 - i].a) < 1e-9);
  // (every ray a straight line from her: points along it on one line through her spot)
  const B: [number, number] = [1, 2];
  for (const { a } of rays) {
    const p1 = from(B, 0.3 + a, 1, 0);
    const p2 = from(B, 0.3 + a, 5, 0);
    const cross = (p1[0] - B[0]) * (p2[1] - B[1]) - (p1[1] - B[1]) * (p2[0] - B[0]);
    assert.ok(Math.abs(cross) < 1e-9, 'a ray bends');
  }
  assert.ok(gustShove(0) > gustShove(3) && gustShove(3) > gustShove(6.9) && gustShove(6.9) >= QA_GUST.least);
  assert.ok(gustShove(0) > QN.gust.push, 'her shove is bigger than the old');
});

test('6c. THE ECLIPSE: the dark comes in a few frames and goes; readable (darkened, never black); the pools lit, drifting slowly, never meeting', () => {
  const E = QA_ECLIPSE;
  assert.equal(eclipseDark(0), 0);
  assert.ok(eclipseDark(E.hold[1]) > 0 && eclipseDark(E.hold[1]) < 0.25, 'dimming as she screams');
  assert.ok(E.fall <= 0.25 && eclipseDark(E.hit + E.fall) === 1, 'the light going in a few frames');
  assert.equal(eclipseDark(E.hit + E.dark - 0.1), 1);
  assert.equal(eclipseDark(E.hit + E.dark + E.back + 0.01), 0);
  // (readable: the rock darkened to a third, never black; her fire and the knight's cyan kept)
  assert.ok(DARK_FLOOR >= 0.3);
  const [r, g, b] = darkened(118, 109, 124, DARK_FLOOR);
  assert.ok(r + g + b > 90, `the dark rock ${r},${g},${b}`);
  const fire = rgba(FLAME[2]);
  assert.equal(JSON.stringify(darkened(fire[0], fire[1], fire[2], DARK_FLOOR)), JSON.stringify([fire[0], fire[1], fire[2]].map((v) => Math.round(v * 0.92))));
  // (the pools: three, lit, drifting at their pace, never meeting)
  for (let s = 0.5; s < E.dark - 0.5; s += 0.25) {
    const P = poolsAt(E.hit + s);
    assert.equal(P.length, E.pools);
    for (const q of P) assert.ok(lightAt(q.x, q.y, 1, P) === 1 && inPool(P, q.x, q.y), 'a pool unlit');
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) assert.ok(Math.hypot(P[i].x - P[j].x, P[i].y - P[j].y) > 2 * E.r + 2, 'two pools meet');
    const Q = poolsAt(E.hit + s + 0.5);
    for (let i = 0; i < P.length; i++) {
      const v = Math.hypot(Q[i].x - P[i].x, Q[i].y - P[i].y) / 0.5;
      assert.ok(v > E.drift * 0.6 && v < E.drift * 1.6, `a pool drifts ${v.toFixed(2)} tiles a second`);
    }
    assert.ok(lightAt(9, 9, 1, P) === 1 - (1 - DARK_FLOOR), 'outside the pools: the dark');
  }
  assert.equal(poolsAt(E.hit + E.dark + 0.1).length, 0);
  const p = blank();
  paintPoolRims(p, at, poolsAt(E.hit + 2), 0);
  const L = fxLook(p);
  assert.ok(L.painted > 100 && L.soft === 0 && !L.cyan, 'the pools\' rims');
});
