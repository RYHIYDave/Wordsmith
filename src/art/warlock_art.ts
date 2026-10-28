// THE WARLOCK'S PICTURES IN THE GAME (the main chat, 28 Oct 2026; game/warlock.ts, behind WARLOCK).
//
// He and his demon are the art chat's, sculpted (src/dev/sculpt.ts) and moved (src/dev/warlock_moves.ts, warlock_spells.ts,
// warlock_hits.ts, warlock_change.ts; demon_moves.ts, demon_return.ts), every move of them shown to the owner and given his
// yes in the art chat (docs/mockups/classes/BRIEF.md on mockup/classes). This file only turns those moves into the frames the
// game shows, in the shape it holds its heroes in (art/actor_types.ts AnimSet), painted when first asked for (lazyFrames),
// ahead of need by the side painter (render/painter.ts) as the other heroes' are. Nothing here changes how they look.
//
// HOW EACH OF THE GAME'S MOMENTS IS SHOWN:
//   standing, running              his stand (6.6 s) and run; with his pact full, the same with his demon arm blazing
//   his tap, his tap and hold      the Hellfire Bolt and the Curse (the picture's wind-up played over the rules' own, as
//                                  every hero's is: render/figure.ts attackFrame; the rest seen out while he stands: tail)
//   his swipe                      the Smoke Step: the moments he is smoke laid over the step (as a leap's are), his forming
//                                  out of it after (`land`)
//   struck, struck from behind     warlock_hits.ts
//   changing                       the change (warlock_change.ts), laid over the rules' time for it (`change`)
//   the demon                      its stand, run, rakes (left, then right), Damning and smoke step, struck; burning out
//                                  (its burn-out, its crumbling, and him on one knee getting up) laid over the rules' time
//   his fall, and the class card   TO BE MADE AND SHOWN TO HIM: till then his struck-hard, held, and his stand.

import type { Light, Sprite } from '../engine/px';
import { Px } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { lazyFrames, toSprite } from './kit';
import { CANVAS3 } from './skin';
import type { GameView } from './skin';
import { GRIP_SPEED } from './moves3';
import { FR, RUN_ROUND, STAND_LONG, drawWarlockAt, warlockMoves } from '../dev/warlock_moves';
import type { WarlockMove } from '../dev/warlock_moves';
import { BACK_LONG, BOLT_HIT, CURSE_HIT, STEP_GONE, STEP_LONG, warlockSpells } from '../dev/warlock_spells';
import { demonLurch, demonReel, warlockLurch, warlockReel } from '../dev/warlock_hits';
import { BURN_OUT_LONG, DAMN_HIT, RAKE_HIT, RUN_ROUND as DEMON_RUN, SS, STAND_LONG as DEMON_STAND, STEP_LONG as DEMON_STEP, demonMoves, drawDemonAt } from '../dev/demon_moves';
import type { DemonMove } from '../dev/demon_moves';
import { RIG_CANVAS } from '../dev/sculpt_demon_rig';
import { CHANGE_ALL, changeFrame } from '../dev/warlock_change';
import { CHANGE_SCENE } from '../dev/warlock_fx';
import { crumble } from '../dev/demon_return';
import { warlockFall } from './warlock_fall';

/** Which of his pictures: a man or the demon, where (in a fight, in town, on his class card), and a man with his pact full (his arm blazing). */
export interface WarlockLook {
  form: 'man' | 'demon';
  place: 'dungeon' | 'town' | 'card';
  blaze?: boolean;
}

/** Frames a second: a standing loop, a run (its feet gripping, as the heroes' runs), what is played once. */
const IDLE_FPS = 10;
const RUN_FPS = 60;
const CLIP_FPS = 30;
/** How many pictures the moments laid over the rules' own time are painted in: the smoke step, the change, the burning out. */
const STEP_FRAMES = 10;
const CHANGE_FRAMES = 48;
const BURN_FRAMES = 44;

/** His pool of light: as the heroes' (art/heroes3.ts), on his canvas. */
const AURA_MAN: Light = { x: CANVAS3.ax - 4, y: CANVAS3.ay - 30, r: 46, color: '#28dcf0', a: 0.2 };
const AURA_DEMON: Light = { x: RIG_CANVAS.ax, y: RIG_CANVAS.ay - 56, r: 80, color: '#28dcf0', a: 0.18 };
const AURA_SCENE: Light = { x: CHANGE_SCENE.ax, y: CHANGE_SCENE.ay - 50, r: 70, color: '#28dcf0', a: 0.18 };

const asSprite = (px: Px, aura: Light, ax: number, ay: number): Sprite => toSprite({ px, lights: [] }, aura, ax, ay);
const manAt = (m: WarlockMove, t: number, view: GameView): Sprite => asSprite(drawWarlockAt(view, m, t).px, AURA_MAN, CANVAS3.ax, CANVAS3.ay);
const demonAt = (m: DemonMove, t: number, view: GameView): Sprite => asSprite(drawDemonAt(view, m, t).px, AURA_DEMON, RIG_CANVAS.ax, RIG_CANVAS.ay);

/** A move that goes round, as a list of frames, `fps` to a second of it. */
function round(long: number, fps: number, at: (t: number) => Sprite): Sprite[] {
  const n = Math.max(1, Math.round(long * fps));
  return lazyFrames(n, (i) => at(i / fps));
}
/** A move played once by the clock, from `t0` to `t1` of it. */
function clip(t0: number, t1: number, fps: number, at: (t: number) => Sprite, hit?: number, tail = false): Clip {
  const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
  const c: Clip = { frames: lazyFrames(n, (i) => at(Math.min(t1, t0 + i / fps))), fps };
  if (hit !== undefined) c.hit = hit - t0;
  if (tail) c.tail = true;
  return c;
}
/** A piece of a move laid out in `n` pictures, first to last, shown by how far through it he is. */
function spread(t0: number, t1: number, n: number, at: (t: number) => Sprite): Clip {
  return { frames: lazyFrames(n, (i) => at(t0 + ((t1 - t0) * i) / (n - 1))), fps: n / Math.max(1e-6, t1 - t0) };
}

/** Its first frame, the blow's and its last, each painted only when asked for (as every hero's: art/heroes3.ts). */
function three(c: Clip): Sprite[] {
  const n = c.frames.length;
  const picks = [0, Math.min(n - 1, Math.round((c.hit ?? 0) * c.fps)), n - 1];
  return lazyFrames(3, (i) => c.frames[picks[i]]);
}

const byName = <M extends { name: string }>(list: readonly M[], start: string): M => {
  const m = list.find((x) => x.name.startsWith(start));
  if (!m) throw new Error(`warlock_art: no move "${start}"`);
  return m;
};

/** A blazing copy of a move of his (his pact full: the demon arm blazes, as his “Arm blazes cyan (Recommended)”). */
const blazing = (m: WarlockMove): WarlockMove => ({ ...m, blaze: [[0, 1], [m.long, 1]] });

/** HIM, a man: one view. */
function manSet(view: GameView, place: WarlockLook['place'], blaze: boolean): AnimSet {
  const [stand0, run0] = warlockMoves();
  const stand = blaze ? blazing(stand0) : stand0;
  const run = blaze ? blazing(run0) : run0;
  const spells = warlockSpells();
  const bolt = byName(spells, 'Tap: hellfire bolt');
  const curse = byName(spells, 'Tap and hold: the Curse');
  const step = byName(spells, 'Swipe: the smoke step');
  const reel = warlockReel();
  const lurch = warlockLurch();
  const idle = round(STAND_LONG, IDLE_FPS, (t) => manAt(stand, t, view));
  const walk = round(RUN_ROUND, RUN_FPS, (t) => manAt(run, t, view));
  const attack = clip(0, bolt.long, CLIP_FPS, (t) => manAt(bolt, t, view), BOLT_HIT, true);
  const heavy = clip(0, curse.long, CLIP_FPS, (t) => manAt(curse, t, view), CURSE_HIT, true);
  // (the smoke step: from bursting into smoke to the first of his forming, over the step; his forming after)
  const leap = spread(STEP_GONE[0] - 1 * FR, STEP_GONE[1] + 1 * FR, STEP_FRAMES, (t) => manAt(step, t, view));
  const land = clip(STEP_GONE[1] + 1 * FR, STEP_LONG, CLIP_FPS, (t) => manAt(step, t, view));
  const struck = clip(0, reel.long, CLIP_FPS, (t) => manAt(reel, t, view));
  const struckBehind = clip(0, lurch.long, CLIP_FPS, (t) => manAt(lurch, t, view));
  // (HIS FALL: art/warlock_fall.ts, the main chat's first pass, to be shown to him)
  const down = warlockFall();
  const fall = clip(0, down.long, CLIP_FPS, (t) => manAt(down, t, view));
  const set: AnimSet = {
    idle,
    walk,
    attack: three(attack),
    heavy: three(heavy),
    idleFps: IDLE_FPS,
    walkFps: RUN_FPS,
    walkStride: GRIP_SPEED * RUN_ROUND,
    clips: { attack, heavy, leap, land, reel: struck, lurch: struckBehind, fall },
  };
  if (place !== 'dungeon') {
    // (on his class card, picked: his arm blazes up; to be made his own and shown to him)
    if (place === 'card' && view === 'front') set.clips!.ready = clip(0, 1.4, CLIP_FPS, (t) => manAt(blazing(stand0), t, view));
    return set;
  }
  // (CHANGING INTO THE DEMON: the change laid over the rules' time for it)
  set.clips!.change = spread(0, CHANGE_ALL, CHANGE_FRAMES, (t) => asSprite(changeFrame(view, t).d.px, AURA_SCENE, CHANGE_SCENE.ax, CHANGE_SCENE.ay));
  return set;
}

/** THE DEMON: one view. */
function demonSet(view: GameView): AnimSet {
  const moves = demonMoves();
  const stand = byName(moves, 'The demon standing');
  const run = byName(moves, 'The demon running');
  const rakes = moves.filter((m) => !!m.rake);
  const damning = moves.find((m) => m.name.toLowerCase().includes('damn')) ?? byName(moves, 'Tap and hold');
  const step = moves.find((m) => !!m.gone) ?? byName(moves, 'Swipe');
  const burn = moves.find((m) => m.name.startsWith('Meter dry')) as DemonMove;
  const reel = demonReel();
  const lurch = demonLurch();
  const idle = round(DEMON_STAND, IDLE_FPS, (t) => demonAt(stand, t, view));
  const walk = round(DEMON_RUN, RUN_FPS, (t) => demonAt(run, t, view));
  const rakeL = clip(0, rakes[0].long, CLIP_FPS, (t) => demonAt(rakes[0], t, view), RAKE_HIT, true);
  const rakeR = clip(0, rakes[1].long, CLIP_FPS, (t) => demonAt(rakes[1], t, view), RAKE_HIT, true);
  const heavy = clip(0, damning.long, CLIP_FPS, (t) => demonAt(damning, t, view), DAMN_HIT, true);
  const leap = spread(SS.burst * FR, SS.out * FR, STEP_FRAMES, (t) => demonAt(step, t, view));
  const land = clip(SS.out * FR, DEMON_STEP, CLIP_FPS, (t) => demonAt(step, t, view));
  const struck = clip(0, reel.long, CLIP_FPS, (t) => demonAt(reel, t, view));
  const struckBehind = clip(0, lurch.long, CLIP_FPS, (t) => demonAt(lurch, t, view));
  // BURNING OUT (demon_return.ts): it sags as its fire gutters; it crumbles from its edges in, him on one knee where it was
  // seen as it goes; and he gets up. On the change's scene, both drawn at its floor point.
  const back = byName(warlockSpells(), 'Meter dry: he comes back');
  const SAG = BURN_OUT_LONG;
  const CRUMBLE = 0.9;
  const total = SAG + CRUMBLE + BACK_LONG;
  const burnOut = spread(0, total, BURN_FRAMES, (t) => {
    const scene = new Px(CHANGE_SCENE.w, CHANGE_SCENE.h);
    const put = (px: Px, ax: number, ay: number): void => {
      const dx = CHANGE_SCENE.ax - ax;
      const dy = CHANGE_SCENE.ay - ay;
      for (let y = 0; y < px.h; y++) {
        for (let x = 0; x < px.w; x++) {
          const i = (y * px.w + x) * 4;
          if (px.d[i + 3] === 0) continue;
          const sx = x + dx;
          const sy = y + dy;
          if (sx < 0 || sy < 0 || sx >= scene.w || sy >= scene.h) continue;
          const j = (sy * scene.w + sx) * 4;
          scene.d[j] = px.d[i];
          scene.d[j + 1] = px.d[i + 1];
          scene.d[j + 2] = px.d[i + 2];
          scene.d[j + 3] = px.d[i + 3];
        }
      }
    };
    if (t < SAG + CRUMBLE) {
      // (him on one knee, under it, seen as it crumbles away)
      if (t > SAG) put(drawWarlockAt(view, back, 0).px, CANVAS3.ax, CANVAS3.ay);
      const d = drawDemonAt(view, burn, Math.min(t, SAG - 1e-3)).px;
      put(t > SAG ? crumble(d, (t - SAG) / CRUMBLE) : d, RIG_CANVAS.ax, RIG_CANVAS.ay);
    } else put(drawWarlockAt(view, back, t - SAG - CRUMBLE).px, CANVAS3.ax, CANVAS3.ay);
    return asSprite(scene, AURA_SCENE, CHANGE_SCENE.ax, CHANGE_SCENE.ay);
  });
  return {
    idle,
    walk,
    attack: three(rakeL),
    heavy: three(heavy),
    idleFps: IDLE_FPS,
    walkFps: RUN_FPS,
    walkStride: GRIP_SPEED * DEMON_RUN,
    // (its rakes left, then right: the rules' two swings of a combo, attack and attack2)
    clips: { attack: rakeL, attack2: rakeR, heavy, leap, land, reel: struck, lurch: struckBehind, change: burnOut },
  };
}

/** The warlock's pictures, both views. */
export function makeWarlockArt(look: WarlockLook): ActorArt {
  if (look.form === 'demon') return { front: demonSet('front'), back: demonSet('back') };
  return { front: manSet('front', look.place, !!look.blaze), back: manSet('back', look.place, !!look.blaze) };
}
