// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16'S BOSS: THE PRINCESS: what she casts on the floor and sends across it, drawn
// (render/act1_fx/types.ts), where her rules (game/act1_rules/princess.ts) have it. Every picture here is the art chat's
// (art/princess_fx.ts, art/garden_swans.ts), held as the game holds them (art/act1_figs/princess.ts, her things); her moves
// themselves, her lash's whip and her steed are her own pictures' (art/act1_figs/princess.ts FIG).
//   ON THE FLOOR: through her lash's warning, the wedge it will sweep marked in the enemy's pink (the main chat's: his “The
//     size of these hits needs to be so much bigger”, so that a whip seven and a half tiles long is seen coming), the edge
//     the vine comes from the brightest; where her snare will burst, a ring marked in the enemy's pink from the end of its
//     warning (as the old bosses' rings: art/boss_shots.ts drawSweepRing); where her steed will come down, the same, from its
//     spring; her Vow's ring of silence round her (the art's vowPainted, ten tiles across); the Eleven's lines of fallen
//     feathers, scattered as their swans pass (the art's featherLine).
//   AMONG WHAT STANDS: her garden's swans circling her always (the art's `fly`; more of them each phase: PRINCESS_FIGHT.swans),
//     out over her steed while she rides; her snare's cage (the art's snarePainted: bursting up, held, shaken by each blow, worn
//     down a stage at a time, bursting apart, or withering), in two halves, the one behind whoever is inside it and the one
//     before him; the Eleven's swans diving along their lines (the art's `dive`).
//   OVER WHAT STANDS: as she falls, her swans flying off over the wall (his doc: "the swans fly off over the wall"); her snare's
//     life, a bar under the cage (his: “The cage could have a HP bar and you can destroy it but it
//     stays longer if you don't destroy it”), in the enemy's red as a monster's is.
// Nothing cyan: the enemy's pink and red, the Hush's grey, swan white, her vines' own greens.

import { drawSweepRing } from '../../art/boss_shots';
import { SWAN_FRAMES, snareFrame, snareFrameAt, swanThing, vowFrame, vowFrameAt } from '../../art/act1_figs/princess';
import { FLAME } from '../../art/mkit';
import { TILE3 } from '../../art/new_mobs3';
import { P } from '../../art/palette';
import { featherLine } from '../../art/princess_fx';
import type { GameView } from '../../art/skin';
import { flipSprite } from '../../engine/px';
import type { Sprite } from '../../engine/px';
import { PRINCESS, hoofAt, linesOf, riding, snareLook, snareOf, swanAt, swansOf } from '../../game/act1_rules/princess';
import { backView, beside, flipped } from '../../game/facing';
import type { Monster, Peril } from '../../game/state';
import type { Act1Fx, Act1FxCtx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

// (her things' pictures: the painter's, made ahead as her floor is come to (art/films.ts things:princess); where it has not
// made them yet, or there is none, painted here the first time each is wanted)
const THINGS = 'things:princess';
type Things = Record<string, Sprite[]>;
const own: Record<string, Sprite[]> = {};
const made = (c: Act1FxCtx): Things | null => (c.film ? c.film<Things>(THINGS) : null);
function thing(c: Act1FxCtx, name: string, i: number, make: (i: number) => Sprite): Sprite {
  const f = made(c)?.[name]?.[i];
  if (f) return f;
  const list = (own[name] ??= []);
  return (list[i] ??= make(i));
}
function snareHalf(c: Act1FxCtx, near: boolean, i: number): Sprite {
  const name = near ? 'snareNear' : 'snareFar';
  const f = made(c)?.[name]?.[i];
  if (f) return f;
  const far = (own.snareFar ??= []);
  const nr = (own.snareNear ??= []);
  if (!far[i]) [far[i], nr[i]] = snareFrame(i);
  return near ? nr[i] : far[i];
}
/** One of her swans' frames, `which`, the way (vx, vy) it flies: seen from behind going up the screen, turned over going left. */
function swanOf(c: Act1FxCtx, which: 'fly' | 'dive', i: number, vx: number, vy: number): Sprite {
  const view: GameView = backView(vx, vy) ? 'back' : 'front';
  const n = which === 'fly' ? SWAN_FRAMES.fly : SWAN_FRAMES.dive;
  const name = `${which}${view === 'back' ? 'Back' : 'Front'}`;
  const s = thing(c, name, ((i % n) + n) % n, (k) => swanThing(which, view, k));
  return flipped(vx, vy) ? flipSprite(s) : s;
}

// ---------------------------------------------------------------------------------------------
// HER SWANS

/**
 * Her swans' round (seconds), how far out from her (tiles; out over her steed while she rides; a little further for each swan
 * past three), how high (game pixels), how much they rise and fall. As the art chat laid them round her in her pictures he said
 * yes to (src/dev/preview_princess.ts: a ring 50 of its lengths out, 66 up).
 */
export const CIRCLE = { round: 3.4, r: 50 / TILE3, more: 0.15, rRide: 2.1, high: 33, highRide: 52, bob: 3 };
/** Where her `i`th of `n` swans is at the game's clock `time`: its angle round her. */
const angleOf = (time: number, i: number, n: number): number => (time * Math.PI * 2) / CIRCLE.round + (i * Math.PI * 2) / n;

/** HER SWANS CIRCLING HER (the art's `fly`), each among what stands at its own depth. */
function circling(c: Act1FxCtx, m: Monster): void {
  const n = swansOf(m);
  const ride = riding(m);
  const r = (ride ? CIRCLE.rRide : CIRCLE.r) + CIRCLE.more * Math.max(0, n - 3);
  const time = c.game.time;
  for (let i = 0; i < n; i++) {
    const a = angleOf(time, i, n);
    const x = m.x + Math.cos(a) * r;
    const y = m.y + Math.sin(a) * r;
    const z = (ride ? CIRCLE.highRide : CIRCLE.high) + CIRCLE.bob * Math.sin(time * 2.1 + i * 1.7);
    const [sx, sy] = c.at(x, y);
    const s = swanOf(c, 'fly', Math.floor(time * SWAN_FRAMES.fps) + i * 3, -Math.sin(a), Math.cos(a));
    c.stand(x + y, s, Math.round(sx), Math.round(sy - z));
  }
}

/** AS SHE FALLS, HER SWANS FLY OFF OVER THE WALL: up and out from their round, away up the screen, gone (over what stands: they are up and away). */
const FLY_OFF = 2.8;
function flyingOff(c: Act1FxCtx, p: Peril): void {
  const n = Math.round(p.a);
  const k = clamp01(p.t / FLY_OFF);
  if (k >= 1 || !c.g) return;
  const time = c.game.time;
  const g = c.g;
  const was = g.globalAlpha;
  g.globalAlpha = was * (1 - clamp01((k - 0.7) / 0.3));
  for (let i = 0; i < n; i++) {
    const a = angleOf(time, i, n);
    const r = CIRCLE.r + CIRCLE.more * Math.max(0, n - 3) + 5 * k * k;
    const drift = 12 * k * k;
    const x = p.x + Math.cos(a) * r - drift * Math.SQRT1_2;
    const y = p.y + Math.sin(a) * r - drift * Math.SQRT1_2;
    const z = CIRCLE.high + 150 * k * k;
    const [sx, sy] = c.at(x, y);
    // (the way it flies: round, and more and more away)
    const vx = -Math.sin(a) * (1 - k) - k;
    const vy = Math.cos(a) * (1 - k) - k;
    const s = swanOf(c, 'fly', Math.floor(time * SWAN_FRAMES.fps * 1.4) + i * 3, vx, vy);
    g.drawImage(s.img, Math.round(sx) - s.ax, Math.round(sy - z) - s.ay, s.w, s.h);
  }
  g.globalAlpha = was;
}

// ---------------------------------------------------------------------------------------------
// HER WARNINGS ON THE FLOOR

/** THE LASH'S WEDGE through its warning (`k`: how far through): its two edges and its far arc, dotted in the enemy's pink, brightening; the edge the vine comes from (her right) the brightest. */
function lashWedge(c: Act1FxCtx, m: Monster, k: number): void {
  const g = c.g!;
  const L = PRINCESS.lash;
  const hand = m.act ? m.act.hand : 1;
  const was = g.globalAlpha;
  const dot = (fwd: number, left: number, col: string, a: number): void => {
    const p = beside(m.x, m.y, m.fx, m.fy, hand, fwd, left);
    const [x, y] = c.at(p.x, p.y);
    g.globalAlpha = was * a;
    g.fillStyle = col;
    g.fillRect(Math.round(x), Math.round(y), 1, 1);
  };
  const run = (c.t * 1.4) % 1;
  for (const [deg, hot] of [[L.from, true], [L.to, false]] as const) {
    const b = (deg * Math.PI) / 180;
    for (let d = 0.6; d <= L.reach; d += 0.2) {
      const lead = ((d / L.reach - run) % 1 + 1) % 1;
      dot(Math.cos(b) * d, Math.sin(b) * d, hot ? FLAME[3] : FLAME[2], Math.min(1, (hot ? 0.45 : 0.25) + 0.55 * k + (lead > 0.9 ? 0.3 : 0)));
    }
  }
  for (let deg = L.from; deg <= L.to + 1e-6; deg += 1.5) {
    const b = (deg * Math.PI) / 180;
    dot(Math.cos(b) * L.reach, Math.sin(b) * L.reach, FLAME[2], Math.min(1, 0.3 + 0.6 * k));
    if (Math.round(deg / 1.5) % 2 === 0) dot(Math.cos(b) * (L.reach - 0.12), Math.sin(b) * (L.reach - 0.12), FLAME[0], 0.4 * k);
  }
  g.globalAlpha = was;
}

/** THE ELEVEN'S FEATHERS on the floor along each line (the art's featherLine): falling through the warning, scattered as its swan passes. */
function feathers(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const warn = p.a;
  const tw = p.t + warn;
  const ux = p.fx;
  const uy = p.fy;
  const fade = 1 - clamp01((p.t - (p.dur - 0.6)) / 0.6);
  const was = g.globalAlpha;
  g.globalAlpha = was * fade;
  for (const l of linesOf(p)) {
    const u = swanAt(l, p.t);
    const swept = p.t < l.go ? 0 : u === null ? 1 : (u - l.u0) / (l.u1 - l.u0);
    for (const [q, col, size] of featherLine([l.u0 * TILE3, l.v * TILE3], [l.u1 * TILE3, l.v * TILE3], tw, warn, swept)) {
      const fu = q[0] / TILE3;
      const fv = q[1] / TILE3;
      const [x, y] = c.at(p.x + ux * fu - uy * fv, p.y + uy * fu + ux * fv);
      g.fillStyle = col;
      g.fillRect(Math.round(x), Math.round(y - q[2] / 2), size, 1);
    }
  }
  g.globalAlpha = was;
}

/** THE ELEVEN'S SWANS diving along their lines (the art's `dive`): swooping down onto the line, low along it, up and away off its end. */
function diving(c: Act1FxCtx, p: Peril): void {
  const ux = p.fx;
  const uy = p.fy;
  linesOf(p).forEach((l, k) => {
    const u = swanAt(l, p.t);
    if (u === null) return;
    const x = p.x + ux * u - uy * l.v;
    const y = p.y + uy * u + ux * l.v;
    const z = 8 + 34 * clamp01(1 - (u - l.u0) / 2.5) + 40 * clamp01((u - (l.u1 - 1.5)) / 1.5);
    const [sx, sy] = c.at(x, y);
    c.stand(x + y, swanOf(c, 'dive', Math.floor(p.t * SWAN_FRAMES.fps) + k, ux, uy), Math.round(sx), Math.round(sy - z));
  });
}

// ---------------------------------------------------------------------------------------------
// HER SNARE

/** THE CAGE'S LIFE, a bar over it: while it holds, until it is broken or withers. */
function snareBar(c: Act1FxCtx, p: Peril): void {
  const g = c.g!;
  const S = PRINCESS.snare;
  const st = snareOf(p);
  if (!st || st.broken >= 0 || st.wither >= 0 || p.t < S.burst[1] || p.t >= S.sink[0]) return;
  // (under the cage, at its near edge: clear of the hero's own bar over his head inside it)
  const [x, y] = c.at(p.x, p.y);
  const w = 36;
  const top = Math.round(y) + Math.round(S.r * 8 * Math.SQRT2) + 6;
  const left = Math.round(x) - w / 2;
  g.fillStyle = P.ink;
  g.fillRect(left - 1, top - 1, w + 2, 4);
  g.fillStyle = P.bl1;
  g.fillRect(left, top, w, 2);
  g.fillStyle = P.bl4;
  g.fillRect(left, top, Math.max(0, Math.round((w * st.life) / S.life)), 2);
  // (its stages marked off on it)
  g.fillStyle = P.ink;
  for (let k = 1; k < S.life; k++) g.fillRect(left + Math.round((w * k) / S.life), top, 1, 2);
}

export const FX: Act1Fx | null = {
  films: [THINGS],

  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      if (m.state !== 'act' || !m.act) return;
      const t = m.act.t;
      if (m.act.id === 'princess:lash') {
        const L = PRINCESS.lash;
        if (t >= 0.25 && t < L.hit) lashWedge(c, m, clamp01((t - 0.25) / (L.warn[1] - 0.25)));
      } else if (m.act.id === 'princess:leap') {
        // (where its forehooves will come down: round her arena from the start of the leap; at the hero from its spring)
        const R = PRINCESS.ride;
        const from = m.act.a === 1 ? R.spring : 0;
        if (t >= from && t < R.hit) {
          const f = hoofAt(m, m.act.x, m.act.y);
          drawSweepRing(g, c.at, f.x, f.y, R.r, clamp01((t - from) / (R.hit - from)), c.t);
        }
      }
      return;
    }
    if (!p) return;
    switch (p.a1) {
      case 'princess:snare': {
        // (marked where it will burst, from the end of her warning to the heave)
        if (p.t < 0) {
          const lead = PRINCESS.snare.hit - PRINCESS.snare.warn[1];
          drawSweepRing(g, c.at, p.x, p.y, PRINCESS.snare.r, clamp01(1 + p.t / lead), c.t);
        }
        return;
      }
      case 'princess:vow': {
        const i = vowFrameAt(p.t);
        if (i < 0) return;
        const s = thing(c, 'vow', i, vowFrame);
        const [x, y] = c.at(p.x, p.y);
        g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
        return;
      }
      case 'princess:eleven':
        feathers(c, p);
        return;
      default:
        return;
    }
  },

  standing(c, m, p) {
    if (m) {
      circling(c, m);
      return;
    }
    if (!p) return;
    switch (p.a1) {
      case 'princess:snare': {
        const look = snareLook(p);
        const i = snareFrameAt(look.t, look.hp, look.hitAgo, look.brokenAgo);
        if (i < 0) return;
        const [x, y] = c.at(p.x, p.y);
        // (behind whoever is inside it, and before him)
        const r = PRINCESS.snare.r;
        c.stand(p.x + p.y - r, snareHalf(c, false, i), Math.round(x), Math.round(y));
        c.stand(p.x + p.y + r, snareHalf(c, true, i), Math.round(x), Math.round(y));
        return;
      }
      case 'princess:eleven':
        diving(c, p);
        return;
      default:
        return;
    }
  },

  air(c, _m, p) {
    if (!p || !c.g) return;
    if (p.a1 === 'princess:snare') snareBar(c, p);
    else if (p.a1 === 'princess:fall') flyingOff(c, p);
  },
};
