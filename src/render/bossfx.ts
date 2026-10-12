// THE FIRST FIVE FLOORS: WHAT THE BOSSES OF FLOORS 2 TO 5 DO TO THE FLOOR AND SEND ACROSS IT, DRAWN.
//
// The rules (game/bosses.ts) say what each act does and when, and what it leaves on the floor (the
// perils). The pictures are the art chat's: what is drawn on the floor in the game's own pixels
// (art/boss_shots.ts, art/fm_spells.ts, art/mob_shots.ts), and the pictures of what flies and what
// bursts up (art/bosses3.ts, art/fleshmancer.ts). This puts each where the rules have it:
//   ground()   on the floor, under everything that stands
//   standing() what stands among the figures, each at its depth
//   air()      over what stands
//   lights()   what of it lights the dark
// A thing that is to one side of a boss is on the side his picture shows it (game/facing.ts): for a
// boss whose picture is turned over, the floor's drawings are turned over with it (`mirrored`).

import type { ActorArt } from '../art/actor_types';
import type { Bestiary } from '../art/bestiary';
import { SENTENCE_FROM, drawArmCrack, drawAxeShadow, drawBallCrash, drawBallShadow, drawChainOut, drawChopCrack, drawClawRake, drawScrape, drawSentenceLine, drawSentenceSplit, drawSweepRing, drawThrowPath, throwPathAt } from '../art/boss_shots';
import { AXE_SHOT_FRAMES, BALL_SHOT_FRAMES, FLOOR_ARM_FPS, FLOOR_ARM_FRAMES, FLOOR_ARM_TIME, HEADSMAN as HS_MOB, HOOK_SHOT_FRAMES, HS_CATCH, HS_THROW_HIT, SWARM_SKULL_FPS, SWARM_SKULL_FRAMES, amRakeAt, coBallPath, coCollarAt, coCuffAt, coHookPath, coWhirlReach, makeAxeShotArt, makeBallShotArt, makeFloorArmArt, makeHookShotArt, makeLeftBehindArt, makeSwarmSkullArt } from '../art/bosses3';
import { MINI_FIRE_SIZE, miniFireAt } from '../art/cultists';
import { FM_HAND_FPS, FM_HAND_FRAMES, FM_HAND_KINDS, FM_HAND_TIME, fmMouthAt, makeRingHandArt } from '../art/fleshmancer';
import { FM_FIRE_SIZE, drawBoneShard, drawFireStream, drawHandCrack, drawRaiseGlow, drawScorch, drawShardBreak, drawShardShadow, drawSlamWave } from '../art/fm_spells';
import type { FireSize } from '../art/fm_spells';
import { drawAimLine, drawSkullBurst, drawSkullShadow } from '../art/mob_shots';
import type { FloorAt } from '../art/mob_shots';
import { TILE3, handAt } from '../art/new_mobs3';
import type { GameView } from '../art/skin';
import { flipSprite } from '../engine/px';
import type { Sprite } from '../engine/px';
import { AMALGAM, CHAINED, FLESHMANCER, GAITS, HEADSMAN, MINIFM, actDef, axeAt, fireTurn, hookAt, inGap, ringHand } from '../game/bosses';
import type { GaitedKind } from '../game/bosses';
import { backView, beside, flipped } from '../game/facing';
import type { Game } from '../game/game';
import type { Monster, Peril } from '../game/state';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const smooth01 = (u: number): number => {
  const k = clamp01(u);
  return k * k * (3 - 2 * k);
};

/** A sprite to stand among the figures: where its floor point is on the floor (tiles, for its depth) and on the screen. */
export type StandFn = (depth: number, s: Sprite, sx: number, sy: number) => void;
/** A light in the dark: where on the screen, how wide, how strong. */
export type SpotFn = (x: number, y: number, r: number, a: number) => void;

/** Which of a figure's two pictures shows one facing (fx, fy), and whether it is turned over. */
function viewOf(fx: number, fy: number): { view: GameView; flip: boolean } {
  return { view: backView(fx, fy) ? 'back' : 'front', flip: flipped(fx, fy) };
}

export class BossFx {
  private axes: Record<GameView, Sprite[]> | null = null;
  private hooks: Record<GameView, Sprite[]> | null = null;
  private balls: Record<GameView, Sprite[]> | null = null;
  private lefts: Record<string, Sprite> = {};
  private arms: Sprite[] | null = null;
  private skulls: Record<GameView, Sprite[]> | null = null;
  private hands: Sprite[][] | null = null;
  private axeFrom: readonly [number, number, number] | null = null;
  private axeTo: readonly [number, number, number] | null = null;
  /** What lights the dark this frame (gathered as things are drawn; given out by `lights`). */
  private spots: [number, number, number, number][] = [];

  constructor(private readonly bestiary: Bestiary) {}

  /** Begin a frame. */
  begin(): void {
    this.spots.length = 0;
  }

  /** The floor's drawings for one who is drawn turned over: turned over about the way he faces. */
  private mirrored(at: FloorAt, m: { x: number; y: number; fx: number; fy: number }, hand: number): FloorAt {
    if (hand > 0) return at;
    return (x, y) => {
      const dx = x - m.x;
      const dy = y - m.y;
      const along = dx * m.fx + dy * m.fy;
      const side = dx * m.fy - dy * m.fx;
      // (the same way along, the other side)
      return at(m.x + m.fx * along - m.fy * side, m.y + m.fy * along + m.fx * side);
    };
  }

  /** A point of a figure's own picture (tiles before it and to its left, a height in game pixels) on the screen, as its picture is drawn (not as the floor has it: the picture is one of four ways round). */
  private onPicture(at: FloorAt, m: Monster, fwd: number, left: number, high: number): [number, number] {
    const G = GAITS[m.kind as GaitedKind];
    const { view, flip } = viewOf(m.fx, m.fy);
    // (art's floorOf: facing you, along the floor's x; from behind as the camera truly sees it, along its -y)
    const [fx, fy] = view === 'front' ? [fwd, -left] : G && G.trueBack ? [-left, -fwd] : [left, -fwd];
    const [ox, oy] = at(m.x, m.y);
    const dx = (fx - fy) * 16;
    const dy = (fx + fy) * 8 - high;
    return [ox + (flip ? -dx : dx), oy + dy];
  }

  // ---------------------------------------------------------------------------------------------

  /** ON THE FLOOR, under everything that stands: the warnings of what is coming, what a blow leaves, the shadows of what flies. `t`: the screen's clock. */
  ground(g: CanvasRenderingContext2D, at: FloorAt, game: Game, t: number, here: (x: number, y: number) => boolean): void {
    for (const m of game.monsters) {
      if (m.dead || !m.act || m.state !== 'act') continue;
      if (!here(m.x, m.y)) continue;
      const a = actDef(m);
      if (!a) continue;
      const act = m.act;
      const T = act.t;
      const mat = this.mirrored(at, m, act.hand);
      const B = (fwd: number, left: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, act.hand, fwd, left);
      switch (act.id) {
        case 'sentence': {
          if (T >= a.hit) break;
          const S = HEADSMAN.sentence;
          const o = B(S.bite - S.from, S.left);
          drawSentenceLine(g, at, o.x, o.y, m.fx, m.fy, clamp01((T - S.warnFrom) / (a.hit - S.warnFrom - 0.1)), t);
          break;
        }
        case 'sweep':
          if (T < HEADSMAN.sweep.from) drawSweepRing(g, mat, m.x, m.y, HEADSMAN.sweep.reach, clamp01((T - HEADSMAN.sweep.warnFrom) / (HEADSMAN.sweep.from - HEADSMAN.sweep.warnFrom - 0.05)), t);
          break;
        case 'axe': {
          const A = HEADSMAN.axe;
          const [from, to] = this.axeHands();
          if (T < A.let) drawThrowPath(g, mat, m.x, m.y, m.fx, m.fy, from, to, clamp01((T - A.warnFrom) / (A.let - A.warnFrom - 0.1)), t, act.a);
          const u = (T - A.let) / (A.back - A.let);
          if (u >= 0 && u < 1) {
            const p = axeAt(u, act.a);
            const w = B(p.fwd, p.left);
            drawAxeShadow(g, at, w.x, w.y);
          }
          break;
        }
        case 'hook': {
          const H = CHAINED.hook;
          if (T < H.let) {
            // (he points: the line it will fly along)
            const e = B(act.a, H.toLeft);
            const s = B(0.6, H.from[1]);
            drawAimLine(g, at, s.x, s.y, e.x, e.y, clamp01((T - H.warnFrom) / (H.let - H.warnFrom)), t);
          } else {
            const p = hookAt(T, act.a);
            if (p && !p.flying) {
              const w = B(p.fwd, p.left);
              const far = B(act.a, H.toLeft);
              drawScrape(g, at, w.x, w.y, far.x, far.y, 1);
            }
          }
          break;
        }
        case 'whirl':
          if (T < CHAINED.whirl.from) drawSweepRing(g, mat, m.x, m.y, CHAINED.whirl.reach, clamp01((T - CHAINED.whirl.warnFrom) / (CHAINED.whirl.from - CHAINED.whirl.warnFrom - 0.05)), t);
          break;
        case 'ball': {
          const Bl = CHAINED.ball;
          if (T >= Bl.warnFrom && T < Bl.land) drawBallShadow(g, at, act.x, act.y, T < Bl.let ? 0.15 * Math.min(1, (T - Bl.warnFrom) / 0.4) : 0.15 + 0.85 * ((T - Bl.let) / (Bl.land - Bl.let)));
          const b = coBallPath(T);
          if (b && !b.flying) {
            const w = B(b.at[0], b.at[1]);
            drawScrape(g, at, w.x, w.y, act.x, act.y, 1);
          }
          break;
        }
        case 'devour': {
          const D = AMALGAM.devour;
          if (T < D.from) break;
          // (its claws gouge the floor along the way they rake, from where they came down to where they are)
          const k = T < D.to ? 1 : 1 - (T - D.to) / 1.2;
          for (const n of ['R1', 'L1'] as const) {
            const pts: [number, number][] = [];
            for (let u = D.from; u <= Math.min(T, D.to) + 1e-6; u += 0.04) {
              const p = amRakeAt(u)[n];
              const w = B(p[0] / TILE3, p[1] / TILE3);
              pts.push([w.x, w.y]);
            }
            drawClawRake(g, at, pts, k);
          }
          break;
        }
        case 'fire':
        case 'miniFire': {
          const mini = act.id === 'miniFire';
          const F = mini ? MINIFM.fire : FLESHMANCER.fire;
          drawScorch(g, at, m.x, m.y, this.fireWay(m, act.hand, mini), T, F.burst, this.fireSize(mini));
          break;
        }
        default:
          break;
      }
    }
    for (const p of game.perils) {
      if (p.t < 0 || !here(p.x, p.y)) continue;
      switch (p.kind) {
        case 'crack':
          drawChopCrack(g, at, p.x, p.y, p.fx, p.fy, p.t);
          break;
        case 'crash':
          drawBallCrash(g, at, p.x, p.y, p.t);
          break;
        case 'arm':
          drawArmCrack(g, at, p.x, p.y, p.t - p.hit, FLOOR_ARM_TIME);
          break;
        case 'skull':
          if (!p.done) drawSkullShadow(g, at, p.x, p.y, this.skullHigh(p), p.b);
          else drawSkullBurst(g, at, p.x, p.y, p.t - p.hit);
          break;
        case 'shard':
          if (!p.done) {
            const [sx, sy] = at(p.x, p.y);
            drawShardShadow(g, sx, sy);
          }
          break;
        case 'wave':
          drawSlamWave(g, at, p.x, p.y, p.t);
          break;
        case 'ring': {
          const n = p.b;
          for (let j = 0; j < n; j++) {
            if (inGap(n, p.c, p.fy, j)) continue;
            const q = ringHand(p.x, p.y, p.a, n, p.fx, j);
            drawHandCrack(g, at, q.x, q.y, p.t - p.hit - this.handLate(j), FM_HAND_TIME, p.d * 31 + j);
          }
          break;
        }
        case 'scorch': {
          const mini = p.a === 1;
          const F = mini ? MINIFM.fire : FLESHMANCER.fire;
          const was = g.globalAlpha;
          // (it fades over its last three seconds)
          g.globalAlpha = was * clamp01((p.dur - p.t) / 3);
          drawScorch(g, at, p.x, p.y, this.fireWay(p, p.hand, mini), F.stop + p.t, F.burst, this.fireSize(mini));
          g.globalAlpha = was;
          break;
        }
        case 'left': {
          // (what his breaking chain left lying, as he was seen then)
          const { view, flip } = viewOf(p.fx, p.fy);
          const key = `${p.a}:${view}`;
          const sp = this.lefts[key] ?? (this.lefts[key] = makeLeftBehindArt(p.a === 0 ? 'L' : 'ball', view));
          const s = flip ? flipSprite(sp) : sp;
          const [sx, sy] = at(p.x, p.y);
          g.drawImage(s.img, Math.round(sx - s.ax), Math.round(sy - s.ay), s.w, s.h);
          break;
        }
        default:
          break;
      }
    }
  }

  // ---------------------------------------------------------------------------------------------

  /** WHAT STANDS among the figures: an axe, a hook or a ball in flight, arms of the dead and hands out of the floor, skulls on the wing. */
  standing(at: FloorAt, game: Game, stand: StandFn, here: (x: number, y: number) => boolean): void {
    for (const m of game.monsters) {
      if (m.dead || !m.act || m.state !== 'act' || !m.seen) continue;
      const act = m.act;
      const T = act.t;
      const { view, flip } = viewOf(m.fx, m.fy);
      const turned = (s: Sprite): Sprite => (flip ? flipSprite(s) : s);
      const B = (fwd: number, left: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, act.hand, fwd, left);
      if (act.id === 'axe') {
        const A = HEADSMAN.axe;
        const u = (T - A.let) / (A.back - A.let);
        if (u < 0 || u >= 1) continue;
        const [from, to] = this.axeHands();
        const p = axeAt(u, act.a);
        const w = B(p.fwd, p.left);
        const high = throwPathAt(u, from, to, act.a)[2];
        const set = (this.axes ?? (this.axes = { front: makeAxeShotArt('front'), back: makeAxeShotArt('back') }))[view];
        const [sx, sy] = at(w.x, w.y);
        stand(w.x + w.y, turned(set[Math.floor((T * 3.2 * AXE_SHOT_FRAMES) % AXE_SHOT_FRAMES)]), sx, sy - high);
      } else if (act.id === 'hook') {
        const p = hookAt(T, act.a);
        if (!p) continue;
        const w = B(p.fwd, p.left);
        const art = coHookPath(T);
        const high = art ? art.at[2] : 1;
        const set = (this.hooks ?? (this.hooks = { front: makeHookShotArt('front'), back: makeHookShotArt('back') }))[view];
        const [sx, sy] = at(w.x, w.y);
        stand(w.x + w.y, turned(p.flying ? set[Math.floor((T * 2.5 * HOOK_SHOT_FRAMES) % HOOK_SHOT_FRAMES)] : set[HOOK_SHOT_FRAMES]), sx, sy - high);
      } else if (act.id === 'ball') {
        const b = coBallPath(T);
        if (!b) continue;
        const w = B(b.at[0], b.at[1]);
        const set = (this.balls ?? (this.balls = { front: makeBallShotArt('front'), back: makeBallShotArt('back') }))[view];
        const [sx, sy] = at(w.x, w.y);
        stand(w.x + w.y, turned(set[b.flying ? Math.floor((T * 1.6 * BALL_SHOT_FRAMES) % BALL_SHOT_FRAMES) : 0]), sx, sy - b.at[2]);
      }
    }
    for (const p of game.perils) {
      if (p.t < 0 || !here(p.x, p.y)) continue;
      if (p.kind === 'arm') {
        const u = p.t - p.hit;
        if (u < 0 || u >= FLOOR_ARM_TIME) continue;
        const set = this.arms ?? (this.arms = makeFloorArmArt('front'));
        const [sx, sy] = at(p.x, p.y);
        stand(p.x + p.y, set[Math.min(FLOOR_ARM_FRAMES - 1, Math.floor(u * FLOOR_ARM_FPS + 1e-6))], sx, sy);
      } else if (p.kind === 'skull') {
        if (p.done) continue;
        const { view, flip } = viewOf(p.fx, p.fy);
        const set = (this.skulls ?? (this.skulls = { front: makeSwarmSkullArt('front'), back: makeSwarmSkullArt('back') }))[view];
        const sp = set[Math.floor(p.t * SWARM_SKULL_FPS + p.c) % SWARM_SKULL_FRAMES];
        const [sx, sy] = at(p.x, p.y);
        stand(p.x + p.y, flip ? flipSprite(sp) : sp, sx, sy - this.skullHigh(p));
        this.spots.push([sx, sy - 6, 16, 0.5]);
      } else if (p.kind === 'ring') {
        const n = p.b;
        const hands = this.hands ?? (this.hands = Array.from({ length: FM_HAND_KINDS }, (_, k) => makeRingHandArt('front', k)));
        for (let j = 0; j < n; j++) {
          if (inGap(n, p.c, p.fy, j)) continue;
          const f = Math.floor((p.t - p.hit - this.handLate(j)) * FM_HAND_FPS);
          if (f < 0 || f >= FM_HAND_FRAMES) continue;
          const q = ringHand(p.x, p.y, p.a, n, p.fx, j);
          const [sx, sy] = at(q.x, q.y);
          stand(q.x + q.y, hands[j % FM_HAND_KINDS][f], sx, sy);
          this.spots.push([sx, sy - 10, 26, 0.6]);
        }
      }
    }
  }

  /** One of the dead the Fleshmancer raises, `age` seconds since its heap was called on: the game's own skeleton's death played backwards, its bones snatched up and slammed together; then it stands. (art/fm_spells.ts) */
  gathering(art: ActorArt, back: boolean, age: number): Sprite | null {
    const clip = (back ? art.back : art.front).clips?.die;
    if (!clip || clip.frames.length === 0) return null;
    const R = FLESHMANCER.raise;
    const last = clip.frames.length - 1;
    const k = clamp01((age - R.stir) / R.rise);
    return clip.frames[Math.max(0, Math.min(last, Math.round((1 - k) * last)))];
  }

  // ---------------------------------------------------------------------------------------------

  /** OVER WHAT STANDS: fire bursting up out of a split floor, chains out across the room, shards in flight, a stream of fire, his light on a heap. */
  air(g: CanvasRenderingContext2D, at: FloorAt, game: Game, here: (x: number, y: number) => boolean): void {
    for (const m of game.monsters) {
      if (m.dead || !m.act || m.state !== 'act' || !m.seen) continue;
      const act = m.act;
      const T = act.t;
      const B = (fwd: number, left: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, act.hand, fwd, left);
      if (act.id === 'hook') {
        const p = hookAt(T, act.a);
        const art = coHookPath(T);
        if (!p || !art) continue;
        const w = B(p.fwd, p.left);
        const [sx, sy] = at(w.x, w.y);
        const c = coCuffAt('hook', T);
        const [cx, cy] = this.onPicture(at, m, c[0] / TILE3, c[1] / TILE3, c[2] / 2);
        drawChainOut(g, cx, cy, sx, sy - art.at[2], p.flying ? 6 : 1);
      } else if (act.id === 'ball') {
        const b = coBallPath(T);
        if (!b) continue;
        const w = B(b.at[0], b.at[1]);
        const [sx, sy] = at(w.x, w.y);
        const c = coCollarAt('ball', T);
        const [cx, cy] = this.onPicture(at, m, c[0] / TILE3, c[1] / TILE3, c[2] / 2);
        drawChainOut(g, cx, cy, sx, sy - b.at[2], b.flying ? 8 : 2);
      } else if (act.id === 'fire' || act.id === 'miniFire') {
        const mini = act.id === 'miniFire';
        const F = mini ? MINIFM.fire : FLESHMANCER.fire;
        const { view, flip } = viewOf(m.fx, m.fy);
        // (where it pours from: the skull's jaws over his head; between the mini's claws. Picture pixels from his floor point, as he is painted)
        const mouth = mini ? miniFireAt(Math.min(T, MINIFM.fire.stop + 0.6), view) : fmMouthAt('fire', Math.min(T, 4.6), view);
        const [ox, oy] = at(m.x, m.y);
        const mx = ox + ((flip ? -1 : 1) * mouth[0]) / 2;
        const my = oy + mouth[1] / 2;
        const way = this.fireWay(m, act.hand, mini);
        drawFireStream(g, at, m.x, m.y, mx, my, way, T, F.burst, F.stop, this.fireSize(mini));
        const w = way(T);
        if (w) {
          for (const d of mini ? [0.8, 1.8] : [1, 2.2, 3.4, 4.6]) {
            const [x, y] = at(m.x + w[0] * d, m.y + w[1] * d);
            this.spots.push([x, y - 4, mini ? 28 : 40, 0.8]);
          }
          this.spots.push([mx, my, mini ? 20 : 30, 0.8]);
        }
      }
    }
    for (const p of game.perils) {
      if (p.t < 0 || !here(p.x, p.y)) continue;
      if (p.kind === 'split') {
        drawSentenceSplit(g, at, p.x, p.y, p.fx, p.fy, p.t);
        if (p.t < HEADSMAN.sentence.burn * 0.7) {
          for (const d of [SENTENCE_FROM + 0.8, SENTENCE_FROM + 3, SENTENCE_FROM + 5]) {
            const [x, y] = at(p.x + p.fx * d, p.y + p.fy * d);
            this.spots.push([x, y - 4, 36, 0.7 * (1 - p.t / (HEADSMAN.sentence.burn * 0.7))]);
          }
        }
      } else if (p.kind === 'shard') {
        const S = FLESHMANCER.shards;
        // (its height: from the skull's jaws down to the floor at the end of its reach, a little arc on the way)
        const high = (d: number): number => p.c * (1 - d / S.reach) + 16 * (d / S.reach) * (1 - d / S.reach);
        const [sx, sy] = at(p.x, p.y);
        const [qx, qy] = at(p.x - p.fx * 0.15, p.y - p.fy * 0.15);
        const z = high(Math.min(S.reach, p.d));
        const zq = high(Math.max(0, Math.min(S.reach, p.d) - 0.15));
        if (!p.done) {
          drawBoneShard(g, sx, sy, z, sx - qx, sy - z - (qy - zq), p.t, p.b * 1.7);
          this.spots.push([sx, sy - z, 18, 0.5]);
        } else {
          drawShardBreak(g, sx, sy, z, sx - qx, sy - z - (qy - zq), p.t - p.hit);
          this.spots.push([sx, sy - z, 26, 0.7 * (1 - clamp01((p.t - p.hit) / S.burst))]);
        }
      } else if (p.kind === 'wave') {
        const [x, y] = at(p.x, p.y);
        if (p.t < 1.4) this.spots.push([x, y, 40 + 70 * Math.min(1, p.t), 0.8 * (1 - p.t / 1.4)]);
      }
    }
    // (his light boiling up out of a heap as one of the dead comes back up out of it; and the mini's fire catching a cultist's body)
    for (const r of game.risers) {
      if (r.way !== 'gather' || r.age < 0 || !here(r.m.x, r.m.y)) continue;
      const [x, y] = at(r.m.x, r.m.y);
      drawRaiseGlow(g, x, y, r.age, FLESHMANCER.raise.rise);
      this.spots.push([x, y - 8, 30, 0.7]);
    }
    for (const r of game.risers) {
      if (r.way || r.age >= 0 || r.age < -MINIFM.raise.glow || r.m.packId < 0 || !here(r.m.x, r.m.y)) continue;
      const [x, y] = at(r.m.x, r.m.y);
      drawRaiseGlow(g, x, y, r.age + MINIFM.raise.glow, 0.2);
    }
  }

  /** What of all that lights the dark. (Called as the dark is laid: after everything has been drawn.) */
  lights(spot: SpotFn): void {
    for (const [x, y, r, a] of this.spots) spot(x, y, r, a);
  }

  // ---------------------------------------------------------------------------------------------

  /** Where the Headsman's axe leaves his hand and where it comes back to it: tiles before him, to his left, and its height (art/bosses3.ts). */
  private axeHands(): [readonly [number, number, number], readonly [number, number, number]] {
    const tiles = (p: readonly number[]): [number, number, number] => [p[0] / TILE3, p[1] / TILE3, p[2] / 2];
    if (!this.axeFrom) this.axeFrom = tiles(handAt(HS_MOB, 'throw', HS_THROW_HIT - 0.02, 'R'));
    if (!this.axeTo) this.axeTo = tiles(handAt(HS_MOB, 'throw', HS_CATCH, 'R'));
    return [this.axeFrom, this.axeTo];
  }

  /** Which way a stream of fire pours on the floor at a moment of its act, from one who faces (fx, fy) and is drawn with `hand`. */
  private fireWay(m: { fx: number; fy: number }, hand: number, mini: boolean): (t: number) => readonly [number, number] | null {
    return (t) => {
      const a = fireTurn(mini, t);
      if (a === null) return null;
      const w = beside(0, 0, m.fx, m.fy, hand, Math.cos(a), Math.sin(a));
      return [w.x, w.y];
    };
  }
  private fireSize(mini: boolean): FireSize {
    return mini ? MINI_FIRE_SIZE : FM_FIRE_SIZE;
  }

  /** How high a skull of the swarm flies now (game pixels): level, then diving to the floor at the end of its way. */
  private skullHigh(p: Peril): number {
    const left = (p.a - p.d) / AMALGAM.swarm.speed;
    return p.b * (1 - smooth01(1 - left / 0.28));
  }

  /** How much later than its ring's moment the `j`th hand of a ring comes up (seconds: the film's, so that a ring does not come up as one). */
  private handLate(j: number): number {
    return ((j * 7) % 5) * 0.012;
  }
}

/** (for the tests) How far the Chained One's chains reach as he whirls, in tiles (art/bosses3.ts). */
export function whirlReachOfArt(): number {
  return coWhirlReach() / TILE3;
}
