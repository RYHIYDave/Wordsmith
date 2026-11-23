// THE LIVING SHADOW IN THE GAME'S SHAPE (the queue's finish-mage-and-warlock-eight-sides, step 3, 12 Nov 2026;
// docs/mockups/warlock_up2/README.md, "In the game's shape"). Behind LIVING_SHADOW, OFF: off, the game's Warlock and his demon
// are exactly as they are (art/warlock_art.ts takes these lists only with it on).
//
// His demon redone (his words, 11 Nov: “I need the demon redone.  I like okay but I think it can be much better”): THE LIVING
// SHADOW, its look, every move, its eight sides and the change into it each with his yes in the art chats (the README has every
// word). This file only turns those moves into the lists the game shows, in the shape it holds its heroes in
// (art/actor_types.ts AnimSet), as art/warlock_art.ts does for the demon today, painted when first asked for (lazyFrames), ahead
// of need by the side painter. Nothing here changes how it looks.
//
// EVERY LIST AT THIRTY A SECOND (his rule of 8 Nov: everything that moves at thirty a second), its run and its setting off at
// sixty as the game shows a run, where the game's demon is at ten (its stand) and its change at thirteen or so:
//   standing        its stand up on two legs (3.2 s, 96 pictures)
//   running         the game's run on all fours (its feet gripping: `walkStride`)
//   setting off     dropping onto all fours into the run (`start`, `startAt`: the game's own way, AnimSet.start)
//   stopping        rearing up out of the run, one for each eighth of its round (`stops`: AnimSet.stops)
//   tap, combo      its really wide slashes, its left claw then its right (`attack`, `attack2`), to the game's rake's frames
//   tap, moving     its left claw's slash made walking on two legs, each of the four ways (`attackWalk`); THE GAME HAS NO
//                   WALKING CLIP FOR THE COMBO'S SECOND SWING: its right claw's four are made (dev/shadow_moves.ts) and wait
//                   for one (render/figure.ts, the line that picks `walkers`)
//   tap and hold    Damning (`heavy`)
//   swipe           the smoke step: the moments it is smoke laid over the step (`leap`), its forming out of it after (`land`)
//   struck          struck hard and from behind (`reel`, `lurch`)
//   burning out     its burning out, its crumbling, and him on one knee getting up (`change`, laid over the rules' time)
//   the change      (the man's set) the change into it, then its roar (`shadowChangeClip`), laid over the rules' time for it,
//                   the game's own length (CHANGE_ALL)
// WHAT THE GAME MUST LAY ITSELF (not on its pictures; the README's notes for the main chat): a slash's streaks of his cyan
// (dev/shadow_fx.ts slashLight, laid as render/warlock_fx.ts lays the rake's), its roar's rings, lines and spittle from its
// mouth (roarLight) and the screen's shake (ShadowMove.shake, render/fx.ts), Damning's and the smoke step's light on the
// floor (clawsLight, damningScene, stepScene); and after a slash made walking, if it is still going and no slash follows, its
// dropping onto all fours (`start`), not the run at once.
// ALL EIGHT SIDES, behind art/sides_more.ts EIGHT_MORE.demon (off until his yes; the queue's draw-the-demon-from-eight-sides,
// 22 Nov 2026, the Skins chat; docs/mockups/demon_eight/README.md): every list of it from each of the eight sides the man is
// painted from, before the game's camera 45 degrees apart (art/sides_more.ts MORE_TURN); its slashes' streaks, Damning's torn
// floor, its burning out turned with it (dev/shadow_fx.ts takes the turn). FIVE TRULY TURNED AND THREE THEIR MIRRORS, at his
// word, 22 Nov 2026, 09:01 (Eastern): “He can flip since he doesn’t have a weapon or anything in one hand so it should be
// exactly 8.” (SHADOW_MIRRORS: the three down and to the left, to the left and up and to the left are those down and to the
// right, to the right and up and to the right, mirrored.) Its two of before are the same pictures: from in front, turned 0;
// from behind, turned 90 (`back` is that, to the pixel). Off: its two.

import type { Light, Sprite } from '../engine/px';
import type { ActorArt, AnimSet, Clip } from './actor_types';
import { HEAVY, lazyFrames, toSprite } from './kit';
import type { Px } from '../engine/px';
import { Px as PxOf } from '../engine/px';
import type { GameView } from './skin';
import { GRIP_SPEED } from './moves3';
import { RIG_CANVAS } from '../dev/sculpt_demon_rig';
import { CHANGE_SCENE } from '../dev/warlock_fx';
import { ROAR_AT } from '../dev/warlock_change';
import { SS } from '../dev/demon_moves';
import { DROP_INTO, DROP_PICTURES, REARS, SHADOW_RUN_ROUND, SHADOW_STAND_LONG, SLASH_WAYS, drawShadowAt, shadowMoves } from '../dev/shadow_moves';
import type { ShadowMove } from '../dev/shadow_moves';
import { SLASH_SCENE, burnOutAll, burnOutScene, damningScene, roarScene, slashScene } from '../dev/shadow_fx';
import { SHADOW_CHANGE_ALL, shadowChangeFrame, shadowChangeRoar } from '../dev/shadow_change';
import { EIGHT_MORE, MORE_SIDES, MORE_TURN } from './sides_more';
import type { MoreSide } from './sides_more';

/**
 * THE SWITCH: ON (25.3.14). The game's Warlock becomes the Living Shadow (art/warlock_art.ts). His yes to it in play, 12 Nov 2026 by
 * 14:10, shown the film of it on floor 11: “Yes, hand it to main (Recommended)”; to the main chat putting it in, “Yes, start it
 * now (Recommended)”.
 */
export const LIVING_SHADOW = { on: true };

/** Every list at thirty a second; its run and setting off sixty, as the game shows a run (the Warrior's and the Mage's too). */
export const SHADOW_FPS = { lists: 30, run: 60 };
/** The smoke step's pictures laid over its time as smoke (as the game's demon's, art/warlock_art.ts STEP_FRAMES). */
const STEP_FRAMES = 10;

/** The glow about it (as the game's demon's, art/warlock_art.ts AURA_DEMON), on its own canvas and on the slash's scene. */
const AURA: Light = { x: RIG_CANVAS.ax, y: RIG_CANVAS.ay - 56, r: 80, color: '#28dcf0', a: 0.18 };
const AURA_SLASH: Light = { x: SLASH_SCENE.ax, y: SLASH_SCENE.ay - 56, r: 80, color: '#28dcf0', a: 0.18 };
const AURA_CHANGE: Light = { x: CHANGE_SCENE.ax, y: CHANGE_SCENE.ay - 50, r: 70, color: '#28dcf0', a: 0.18 };

const asSprite = (px: Px, aura: Light, ax: number, ay: number): Sprite => toSprite({ px, lights: [] }, aura, ax, ay);
const itAt = (m: ShadowMove, t: number, view: GameView, turn = 0): Sprite => asSprite(drawShadowAt(view, m, t, turn).px, AURA, RIG_CANVAS.ax, RIG_CANVAS.ay);
/** (on the slash's scene, what the game lays round it painted in with it: the main chat, 12 Nov 2026, LIVING_SHADOW on) */
const onScene = (px: Px): Sprite => asSprite(px, AURA_SLASH, SLASH_SCENE.ax, SLASH_SCENE.ay);

/**
 * ITS THREE MIRRORED SIDES (EIGHT_MORE.demon): each the side it is the mirror of, its every picture mirrored left to right. His
 * word, 22 Nov 2026, 09:01: it holds nothing in one hand, so its mirror is as good as its turning (the side down the screen,
 * `toward`, and up it, `away`, are their own mirrors). A side's turn mirrored is -90 less it (art/sides_more.ts MORE_TURN).
 * All but its burning out (`clips.change`): the man getting up in it holds his demon arm on one side, so on these three it is
 * truly turned (`ownTurn`).
 */
export const SHADOW_MIRRORS: Readonly<Record<'frontL' | 'sideL' | 'backL', 'front' | 'side' | 'back'>> = { frontL: 'front', sideL: 'side', backL: 'back' };
/** A picture mirrored left to right. */
function mirrored(px: Px): Px {
  const out = new PxOf(px.w, px.h);
  for (let y = 0; y < px.h; y++) {
    const row = y * px.w;
    for (let x = 0; x < px.w; x++) {
      const i = (row + x) * 4;
      const j = (row + (px.w - 1 - x)) * 4;
      out.d[j] = px.d[i];
      out.d[j + 1] = px.d[i + 1];
      out.d[j + 2] = px.d[i + 2];
      out.d[j + 3] = px.d[i + 3];
    }
  }
  return out;
}
/**
 * How one side's pictures are made: turned `turn` before the camera, and, for a mirrored side, each mirrored with its anchor and
 * its glow (the anchor names a pixel, so its mirror is the pixel as far from the far edge: render's own flipSprite does the same).
 */
interface SideOf {
  view: GameView;
  turn: number;
  flip: boolean;
}
function painter(side: SideOf) {
  const lay = (px: Px, aura: Light, ax: number, ay: number): Sprite =>
    side.flip ? asSprite(mirrored(px), { ...aura, x: px.w - aura.x }, px.w - 1 - ax, ay) : asSprite(px, aura, ax, ay);
  return {
    it: (m: ShadowMove, t: number): Sprite => lay(drawShadowAt(side.view, m, t, side.turn).px, AURA, RIG_CANVAS.ax, RIG_CANVAS.ay),
    scene: (px: Px): Sprite => lay(px, AURA_SLASH, SLASH_SCENE.ax, SLASH_SCENE.ay),
  };
}

/** The side a mirrored side's pictures stand for, truly turned: a mirror turns the way it faces from `turn` to -90 - `turn` (art/sides_more.ts MORE_TURN: `front` 0 to `frontL` -90, `side` 45 to `sideL` -135, `back` 90 to `backL` 180). */
export function ownTurn(turn: number): number {
  const t = -90 - turn;
  return t <= -180 ? t + 360 : t;
}

// (the game's own ways of laying a move out as frames: as art/warlock_art.ts has them, kept apart so that this file is taken in
// only through the switch)
/** A move that goes round, as a list of frames, `fps` to a second of it. */
function round(long: number, fps: number, at: (t: number) => Sprite): Sprite[] {
  const n = Math.max(1, Math.round(long * fps));
  return lazyFrames(n, (i) => at(i / fps), true);
}
/** A move played once by the clock, from `t0` to `t1` of it. */
function clip(t0: number, t1: number, fps: number, at: (t: number) => Sprite, hit?: number, tail = false): Clip {
  const n = Math.max(1, Math.ceil((t1 - t0) * fps - 1e-6) + 1);
  const c: Clip = { frames: lazyFrames(n, (i) => at(Math.min(t1, t0 + i / fps)), true), fps };
  if (hit !== undefined) c.hit = hit - t0;
  if (tail) c.tail = true;
  return c;
}
/** A piece of a move laid out in `n` pictures, first to last, shown by how far through it it is. */
function spread(t0: number, t1: number, n: number, at: (t: number) => Sprite): Clip {
  return { frames: lazyFrames(n, (i) => at(t0 + ((t1 - t0) * i) / (n - 1)), true), fps: n / Math.max(1e-6, t1 - t0) };
}
/** Its first frame, the blow's and its last (the still list every hero has for a move). */
function three(c: Clip): Sprite[] {
  const n = c.frames.length;
  const picks = [0, Math.min(n - 1, Math.round((c.hit ?? 0) * c.fps)), n - 1];
  return lazyFrames(3, (i) => {
    const was = HEAVY.defer;
    HEAVY.defer = false;
    try {
      return c.frames[picks[i]];
    } finally {
      HEAVY.defer = was;
    }
  });
}

/** Its moves by name (dev/shadow_moves.ts shadowMoves: stand, run, its two slashes, dropping down, eight rear-ups, eight slashes made walking, then its other moves). */
function movesOf(): {
  stand: ShadowMove; run: ShadowMove; slashL: ShadowMove; slashR: ShadowMove; drop: ShadowMove; rears: ShadowMove[]; walkL: ShadowMove[]; walkR: ShadowMove[];
  damning: ShadowMove; step: ShadowMove; burn: ShadowMove; reel: ShadowMove; lurch: ShadowMove;
} {
  const all = shadowMoves();
  const [stand, run, slashL, slashR, drop] = all;
  const rears = all.slice(5, 5 + REARS);
  const walkL = all.slice(5 + REARS, 5 + REARS + SLASH_WAYS.length);
  const walkR = all.slice(5 + REARS + SLASH_WAYS.length, 5 + REARS + 2 * SLASH_WAYS.length);
  const others = all.slice(5 + REARS + 2 * SLASH_WAYS.length);
  const [damning, step, , burn, reel, lurch] = others;
  return { stand, run, slashL, slashR, drop, rears, walkL, walkR, damning, step, burn, reel, lurch };
}

/**
 * THE LIVING SHADOW: one view, in the game's shape; turned `turn` degrees to its left before the camera (its eight sides), and
 * `flip`, every picture mirrored but its burning out's, which has the man in it (its three mirrored sides, SHADOW_MIRRORS).
 */
export function shadowDemonSet(view: GameView, turn = 0, flip = false): AnimSet {
  const m = movesOf();
  const F = SHADOW_FPS.lists;
  const P = painter({ view, turn, flip });
  const idle = round(SHADOW_STAND_LONG, F, (t) => P.it(m.stand, t));
  const walk = round(SHADOW_RUN_ROUND, SHADOW_FPS.run, (t) => P.it(m.run, t));
  // (setting off: its pictures sixty to a second of the run, chosen by how far it has gone, into the run's own picture)
  const start: Clip = { frames: lazyFrames(DROP_PICTURES + 1, (i) => P.it(m.drop, Math.min(m.drop.long, i / SHADOW_FPS.run)), true), fps: SHADOW_FPS.run };
  const stops = m.rears.map((r) => clip(0, r.long, F, (t) => P.it(r, t)));
  // (ITS SLASHES WITH THEIR STREAKS, and DAMNING WITH THE FLOOR TORN UNDER ITS CLAWS: what the game lays round it, painted in with
  // it on the slash's scene, as the films he said yes to have them: the main chat, 12 Nov 2026, at his “Yes, start it now
  // (Recommended)”, the README's (1) and (3); the combo's second swing made walking too, the README's (4): clips.attack2Walk)
  const slash = (s: ShadowMove): Clip => clip(0, s.long, F, (t) => P.scene(slashScene(s, t, view, turn)), s.hit, true);
  const attack = slash(m.slashL);
  const attack2 = slash(m.slashR);
  // (made walking, the four ways as the figure counts them from the way it faces: ahead, to its left, back, to its right. Mirrored,
  // its walking to its left is the picture's walking to its right: the two swap)
  const ways = (l: Clip[]): Clip[] => (flip ? [l[0], l[3], l[2], l[1]] : l);
  const attackWalk = ways(m.walkL.map(slash));
  const attack2Walk = ways(m.walkR.map(slash));
  const heavy = clip(0, m.damning.long, F, (t) => P.scene(damningScene(m.damning, t, view, turn)), m.damning.hit, true);
  const leap = spread(SS.burst / 30, SS.out / 30, STEP_FRAMES, (t) => P.it(m.step, t));
  const land = clip(SS.out / 30, m.step.long, F, (t) => P.it(m.step, t));
  const reel = clip(0, m.reel.long, F, (t) => P.it(m.reel, t));
  const lurch = clip(0, m.lurch.long, F, (t) => P.it(m.lurch, t));
  // (BURNING OUT: its sagging, its crumbling, him on one knee getting up, on the slash's scene, dev/shadow_fx.ts burnOutScene.
  // NEVER MIRRORED: the man in it has his demon arm on one side, and the game goes straight on from it to his own truly turned
  // pictures, so on a mirrored side it is painted truly turned the way that side faces, `ownTurn`)
  const own = flip ? painter({ view, turn: ownTurn(turn), flip: false }) : P;
  const total = burnOutAll(m.burn);
  const burnOut = spread(0, total, Math.round(total * F) + 1, (t) => own.scene(burnOutScene(m.burn, t, view, flip ? ownTurn(turn) : turn)));
  return {
    idle,
    walk,
    attack: three(attack),
    heavy: three(heavy),
    idleFps: F,
    walkFps: SHADOW_FPS.run,
    walkStride: GRIP_SPEED * SHADOW_RUN_ROUND,
    start,
    startAt: DROP_INTO,
    dropAfterSwing: true,
    stops,
    clips: { attack, attack2, attackWalk, attack2Walk, heavy, leap, land, reel, lurch, change: burnOut },
  };
}

/**
 * THE LIVING SHADOW, both views (the game's demon's shape: art/warlock_art.ts makeWarlockArt, `form` 'demon'); with
 * art/sides_more.ts EIGHT_MORE.demon on, ALL EIGHT SIDES (art/sides.ts EIGHT_ORDER): five truly turned, three their mirrors
 * (SHADOW_MIRRORS), and the game shows the side for the way it faces as it does the man's (render/figure.ts).
 */
export function makeShadowArt(): ActorArt {
  if (!EIGHT_MORE.demon) return { front: shadowDemonSet('front'), back: shadowDemonSet('back') };
  const all = {} as Record<string, AnimSet>;
  for (const side of MORE_SIDES) {
    const of = (SHADOW_MIRRORS as Record<string, MoreSide | undefined>)[side];
    all[side] = of ? shadowDemonSet('front', MORE_TURN[of], true) : shadowDemonSet('front', MORE_TURN[side]);
  }
  return all as unknown as ActorArt;
}

/**
 * THE CHANGE INTO IT, for the man's set (art/warlock_art.ts, `clips.change`), laid over the rules' time for it as the game's
 * change is: him becoming it on the change's scene (dev/shadow_change.ts), then its roar on its own canvas. Thirty a second.
 */
export function shadowChangeClip(view: GameView, turn = 0, around: (paint: () => Sprite) => Sprite = (paint) => paint()): Clip {
  const roar = shadowChangeRoar();
  const n = Math.round(SHADOW_CHANGE_ALL * SHADOW_FPS.lists) + 1;
  return spread(0, SHADOW_CHANGE_ALL, n, (t) =>
    // (its roar with what leaves its mouth and the ring on the floor painted in: the README's (2); the game's own ring at the change's
    // end is not laid over it while LIVING_SHADOW is on: render/warlock_fx.ts)
    t < ROAR_AT ? around(() => asSprite(shadowChangeFrame(view, t, turn).d.px, AURA_CHANGE, CHANGE_SCENE.ax, CHANGE_SCENE.ay)) : onScene(roarScene(roar, t - ROAR_AT, view, turn)),
  );
}
/**
 * The same from a side of the man brought up (art/warlock_up_art.ts): from in front, truly turned `turn` (art/warrior_up.ts WU_SPIN).
 * `around`: each frame of him painted inside it (THE UNIQUE TOME AT HIS HIP, art/tome_skins.ts: painted with it as he changes).
 */
export function shadowChangeClipOf(turn: number, around?: (paint: () => Sprite) => Sprite): Clip {
  return shadowChangeClip('front', turn, around);
}
