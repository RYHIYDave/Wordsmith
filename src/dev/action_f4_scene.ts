// Pictures of FLOOR 4'S MOBS' NEW MOVES, put together for the owner (the sheet, the film's frames): the Ossuary Golem's skeleton
// hurl (art/action_f4_fx.ts GOLEM_HURL: the golem, the skeleton in flight, its shadow, the reach of its burst marked and the burst)
// and the dagger cultist's frenzy (art/cultists.ts DAGGER_FRENZY), on floor 1's stand-in floor (dev/action_f1_scene.ts), with the
// knight, each figure at its floor point and sorted by it, as the game sorts them. Made outside a browser (tools/action_f4_film.ts,
// tools/action_f4_sheet.ts). Nothing of the game imports it.

import { Px } from '../engine/px';
import type { ActorArt, Clip } from '../art/actor_types';
import { BURST_CANVAS, HURL, HURL_GOLEM, SHADOW_CANVAS, burstPainted, hurlAt, hurlFly, hurlShadowPainted, makeHurlGolemArt } from '../art/action_f4_fx';
import { FRENZY, FRENZY_CULTIST, frenzyCame, makeFrenzyCultistArt } from '../art/cultists';
import { MONSTERS } from '../game/defs';
import { makeHeroArt3 } from '../art/heroes3';
import { compose, laid, onFloor } from './action_f1_scene';
import type { Stood } from './action_f1_scene';
import { frameAt } from './action_f3_scene';
import { spriteLaid } from './king_scene';
import type { Laid } from './king_scene';

export type View = 'front' | 'back';

let GOLEM_ART: ActorArt | null = null;
let KNIFE_ART: ActorArt | null = null;
let HERO: ActorArt | null = null;
/** The golem with its hurl and the dagger cultist with his frenzy, as the game would hold them (at the rules' paces); the knight. */
export function figures(): { golem: ActorArt; cultist: ActorArt; knight: ActorArt } {
  GOLEM_ART ??= makeHurlGolemArt(MONSTERS.golem.speed);
  KNIFE_ART ??= makeFrenzyCultistArt(MONSTERS.dagger.speed);
  HERO ??= makeHeroArt3().of('warrior', { twoHanded: false }) as unknown as ActorArt;
  return { golem: GOLEM_ART, cultist: KNIFE_ART, knight: HERO };
}
/** The way a figure faces on the floor: from in front, down-right (+x); from behind, up-right (-y); and its side (its right). */
const ahead = (view: View): [number, number] => (view === 'front' ? [1, 0] : [0, -1]);
const rightOf = (view: View): [number, number] => (view === 'front' ? [0, 1] : [1, 0]);
const smooth = (k: number): number => {
  const v = Math.max(0, Math.min(1, k));
  return v * v * (3 - 2 * v);
};

// ---------------------------------------------------------------------------------------------
// THE SKELETON HURL: the golem hauls one up, holds it, hurls it at the knight; it flies, lands and bursts; the knight gets out

/** How long the golem stands before it begins (seconds). */
export const LEAD = 0.4;
/** Where the golem stands and where the knight stands when it takes its aim (tiles along the way it faces, from the scene's middle). */
const G_AT = -2.6;
const K_AT = 2.4;
/** The moments of the pass: the hurl begins; it takes its aim (the reach of the burst marked from here); it lets go; it lands. */
export function hurlTimes(): { start: number; aim: number; loose: number; land: number; end: number; d: number } {
  const start = LEAD;
  const d = K_AT - G_AT;
  const loose = start + HURL.hit;
  const land = loose + hurlFly(d);
  return { start, aim: start + HURL.aim, loose, land, end: land + HURL.long, d };
}
export const HURL_PASS = ((): number => hurlTimes().end + 0.2)();
/** The knight gets out of the burst's way, from when the reach is marked: how far to his side (tiles), and how long he takes. */
const DODGE = { from: 0.18, far: 2.9, long: 0.7 } as const;
/** The skeleton hurl's scene at `t` seconds of its pass, its middle at (cx, cy). `dodge`: whether the knight gets out of the way. */
export function hurlScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1, dodge = true): Px {
  const { golem, knight } = figures();
  const { start, aim, loose, land, d } = hurlTimes();
  const [fx, fy] = ahead(view);
  const [sx, sy] = rightOf(view);
  const at = (along: number, aside = 0): [number, number] => onFloor(fx * along + sx * aside, fy * along + sy * aside, cx, cy, k);
  const m = t - start;
  const long = (golem.front.clips?.moves?.throw as Clip).frames.length / 30;
  const gFig = m >= 0 && m < long ? frameAt(golem, view, 'throw', m) : frameAt(golem, view, 'stand', m < 0 ? t : m - long);
  // the knight: stands, then (once the reach is marked) runs out to his side
  const u = dodge ? smooth((t - aim - DODGE.from) / DODGE.long) : 0;
  const aside = -DODGE.far * u;
  const moving = dodge && t > aim + DODGE.from && t < aim + DODGE.from + DODGE.long;
  const K = at(K_AT, aside);
  const G = at(G_AT);
  const kView: View = view === 'front' ? 'back' : 'front';
  const px0 = new Px(base.w, base.h);
  px0.d.set(base.d);
  const C = BURST_CANVAS;
  const L = at(G_AT + d);
  const floor: { at: [number, number]; l: Laid }[] = [];
  const stood: Stood[] = [
    { at: G, l: gFig, shadow: 22 },
    { at: K, l: frameAt(knight, kView, moving ? 'walk' : 'stand', t), flip: K[0] > G[0], shadow: 9 },
  ];
  // the reach of the burst, marked from its aim; the burst where it lands
  const since = t - land;
  if (t >= aim && since <= HURL.long) {
    floor.push({ at: L, l: laid(burstPainted(since, 'floor', HURL.r, 'all', view, land - aim), C.ax, C.ay) });
    stood.push({ at: [L[0], L[1] - 0.5], l: laid(burstPainted(since, 'air', HURL.r, 'behind', view, land - aim), C.ax, C.ay) });
    stood.push({ at: [L[0], L[1] + 0.5], l: laid(burstPainted(since, 'air', HURL.r, 'before', view, land - aim), C.ax, C.ay) });
  }
  // the skeleton in flight, tumbling, over its shadow
  if (t >= loose && t < land) {
    const v = (t - loose) / (land - loose);
    const [along, left, up] = hurlAt(v, d);
    const P = at(G_AT + along, -left);
    floor.push({ at: P, l: laid(hurlShadowPainted(v), SHADOW_CANVAS.ax, SHADOW_CANVAS.ay) });
    const set = view === 'front' ? golem.front : golem.back;
    const frames = (set.clips?.moves?.hurled as Clip).frames;
    const sp = frames[Math.floor((t - loose) * frames.length * HURL.spin + 1e-6) % frames.length];
    // (over everything it flies over: sorted as at the floor point under it, lifted)
    stood.push({ at: [P[0], P[1] + 40 * k], l: { ...spriteLaid(sp), ay: spriteLaid(sp).ay + 40 + up } });
  }
  return compose(px0, floor, stood, k);
}

// ---------------------------------------------------------------------------------------------
// THE FRENZY: the dagger cultist runs at the knight, four stabs stepping in, winded; the knight takes his opening

/** Where the cultist sets off from and where the knight stands (tiles along the way it faces). */
const C_FROM = -3.2;
const C_STOP = 0.5;
const KN_AT = 2.0;
/** The moments of the pass: he runs, he begins his frenzy, it ends; the knight's blow lands in his winded moment. */
export function frenzyTimes(): { run: number; go: number; end: number; blow: number } {
  const run = 0.3;
  const go = run + (C_STOP - C_FROM) / MONSTERS.dagger.speed;
  return { run, go, end: go + FRENZY.long, blow: go + FRENZY.winded[0] + 0.25 };
}
export const FRENZY_PASS = ((): number => frenzyTimes().end + 0.4)();
/** The frenzy's scene at `t` seconds of its pass. `knightHits`: whether the knight takes his opening. */
export function frenzyScene(view: View, t: number, base: Px, cx: number, cy: number, k = 1, knightHits = true): Px {
  const { cultist, knight } = figures();
  const { run, go, end, blow } = frenzyTimes();
  const [fx, fy] = ahead(view);
  const at = (along: number, aside = 0): [number, number] => {
    const [sx, sy] = rightOf(view);
    return onFloor(fx * along + sx * aside, fy * along + sy * aside, cx, cy, k);
  };
  let c = C_FROM;
  let fig: Laid;
  if (t < run) fig = frameAt(cultist, view, 'stand', t);
  else if (t < go) {
    c = C_FROM + MONSTERS.dagger.speed * (t - run);
    fig = frameAt(cultist, view, 'walk', t - run);
  } else if (t < end) {
    // (his shadow and his place in the sort carried on with him as his pictures take him: frenzyCame)
    const d = frenzyCame(t - go);
    c = C_STOP + d;
    const [fx0, fy0] = ahead(view);
    const l = frameAt(cultist, view, 'attack', t - go);
    fig = { ...l, ax: l.ax + 32 * (fx0 - fy0) * d, ay: l.ay + 16 * (fx0 + fy0) * d };
  } else {
    c = C_STOP + FRENZY.travel;
    fig = frameAt(cultist, view, 'stand', t - end);
  }
  // the knight: stands his ground (stepping back a little as the stabs come), then steps in and strikes in the winded moment
  const back = smooth((t - go - 0.45) / 0.8) * 0.6;
  const kAlong = KN_AT + back - (knightHits ? smooth((t - blow + 0.45) / 0.3) * 0.4 : 0);
  // (a little to the side of the cultist's way, so that neither hides the other)
  const K = at(kAlong, view === 'front' ? -0.55 : 0.55);
  const kView: View = view === 'front' ? 'back' : 'front';
  const set = kView === 'front' ? knight.front : knight.back;
  const atk = set.clips?.attack as Clip | undefined;
  let kFig: Laid = frameAt(knight, kView, 'stand', t);
  if (knightHits && atk) {
    const i = Math.floor((t - blow + (atk.hit ?? 0.3)) * atk.fps);
    if (i >= 0 && i < atk.frames.length) kFig = spriteLaid(atk.frames[i]);
  }
  const Cc = at(c);
  const px0 = new Px(base.w, base.h);
  px0.d.set(base.d);
  return compose(px0, [], [
    { at: Cc, l: fig, shadow: 9 },
    { at: K, l: kFig, flip: K[0] > Cc[0], shadow: 9 },
  ], k);
}

/** A PACK OF THEM at the game's size: five dagger cultists coming at the knight from all round, each at his own moment, frenzying. */
export function packScene(t: number, base: Px, cx: number, cy: number): Px {
  const { cultist, knight } = figures();
  const px0 = new Px(base.w, base.h);
  px0.d.set(base.d);
  const stood: Stood[] = [{ at: onFloor(0, 0, cx, cy), l: frameAt(knight, 'front', 'stand', t), shadow: 9 }];
  const way: Array<[number, number, number]> = [[-1, 0, 0], [0, -1, 0.45], [1, 0.3, 0.9], [-0.6, 0.8, 0.25], [0.5, -0.9, 1.3]];
  for (const [i, [ux, uy, late]] of way.entries()) {
    const n = Math.hypot(ux, uy);
    const dx = ux / n;
    const dy = uy / n;
    const from = 5.2;
    const stop = 1.9;
    const go = 0.2 + late + (from - stop) / MONSTERS.dagger.speed;
    let r = from;
    let move = 'walk';
    let mt = t - 0.2 - late;
    if (mt < 0) {
      move = 'stand';
      mt = t;
    } else if (t < go) r = from - MONSTERS.dagger.speed * mt;
    else if (t < go + FRENZY.long) {
      r = stop - frenzyCame(t - go);
      move = 'attack';
      mt = t - go;
    } else {
      r = stop - FRENZY.travel;
      move = 'stand';
      mt = t - go - FRENZY.long;
    }
    // (each faces the knight: seen from in front if he comes down the screen at him, from behind if up it; flipped if he goes left)
    const P = onFloor(dx * r, dy * r, cx, cy);
    const comingDown = -(dx + dy) > 0;
    const goingLeft = -(dx - dy) < 0;
    // (the frenzy carries him toward the knight: the pictures are drawn along his own way, which the game turns to face where he goes)
    let l = frameAt(cultist, comingDown ? 'front' : 'back', move, mt);
    if (move === 'attack') {
      // (laid where his pictures stand at the start of it: his floor point, and his shadow, carried on with him)
      const d = frenzyCame(mt);
      const sx = 32 * (-dx + dy) * d;
      const sy = 16 * (-dx - dy) * d;
      l = { ...l, ax: l.ax + (goingLeft ? -sx : sx), ay: l.ay + sy };
    }
    stood.push({ at: P, l, flip: goingLeft, shadow: 9 });
    void i;
  }
  return compose(px0, [], stood);
}
void FRENZY_CULTIST;
void HURL_GOLEM;
