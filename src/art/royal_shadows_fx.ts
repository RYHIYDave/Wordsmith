// THE SHADOWS OF THE FOUR ROYALS: their big moves made smaller, the Queen's blink through her hand mirror, their deaths
// (blown apart like smoke) and the four playing cards they leave hanging in the air. A MOCK-UP: NOT IN THE GAME. Nothing
// of the game imports this file (art/royal_shadows.ts says how they are made; `SHADOWS_ON` is off).
//
// Each big move's effect is its boss's own (the very painter), as fog, drawn smaller:
//   THE PRINCESS'S VINE SNARE (art/princess_fx.ts `snarePainted`): a small cage, 0.55 of hers (hers 5 tiles across, this
//     2.75), and short: it holds 1.4 s (hers 6 s) and sinks.
//   THE PRINCE'S MASKS (art/prince_fx.ts `maskPainted`): three masks (his five, the middle three), flown 6 tiles (his 12)
//     at his speed (15 tiles a second), each bursting into fog at its end.
//   THE KING'S CHARGE'S LINE OF SPARKS (art/king_fx.ts `chargeSparks`, `chargeSparkAt`, `chargeShardAt`, as his
//     `sparksPainted`): cut behind the shadow as the game carries it, its sparks shooting off and popping in shrapnel, at
//     0.64 of his, in fog and the dull pink (`SHADOW_CHARGE`, `sparksFx`).
//   THE KING'S CROWN'S WEIGHT (art/king_fx.ts `weightAt`, the King's crown `crownAt`): a shadow crown sent up off its head,
//     following you, slamming down and flying home, at 0.64 of his (`SHADOW_WEIGHT`, `weightFx`). (Its old big move, the
//     Crown's leap and slam, `crownFx` below, is kept in the code, out of its set.)
//   THE QUEEN'S LOOKING GLASS, as a blink through her own hand mirror (no wall mirrors): art/royal_shadows.ts `BLINK`.

import { Px, rgba } from '../engine/px';
import { hash } from './kit';
import { TILE3, canvasOf, paintViewOf } from './new_mobs3';
import { snarePainted, SNARE_CANVAS, SNARE_FX } from './princess_fx';
import { MASKS_FX, MASK_CANVAS, flungMask, maskPainted } from './prince_fx';
import { CHARGE_FX, CROWN_FX, FX_CANVAS, WEIGHT_FX, chargeShardAt, chargeSparkAt, chargeSparks, crownPainted, weightAt, weightHead } from './king_fx';
import { CROWN_HEAD, crownAt, smearParts } from './king';
import { KG_CHARGE, KG_WEIGHT } from './king_moves';
import { paintBits } from './new_mobs3';
import type { Bit, Put } from './new_mobs3';
import { stage } from './skin';
import type { GameView } from './skin';
import { add, mul } from './skeleton';
import type { V3 } from './skeleton';
import { BLINK, EYE, EYE_LIT, FOG, ROYALS, bonesAt, fogOn, foggedBit, pointOn, shadowFrame, smaller, toneOf } from './royal_shadows';
import type { Frame, Royal, RoyalId } from './royal_shadows';

const FOG_RGB = FOG.map((c) => rgba(c));
const EYE_RGB = rgba(EYE);
const EYE_LIT_RGB = rgba(EYE_LIT);
const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));
const smooth = (a: number, b: number, t: number): number => {
  const x = clamp01((t - a) / (b - a));
  return x * x * (3 - 2 * x);
};

// =============================================================================================
// AN EFFECT, AS FOG, SMALLER

/** A picture of an effect drawn `k` of its size about its floor point, as fog: each pixel the average of what lies under it (its see-through kept); the pinks kept where they are. */
export function fxSmaller(src: Px, ax: number, ay: number, k: number): Frame {
  const dax = Math.round(ax * k) + 2;
  const day = Math.round(ay * k) + 2;
  const w = Math.ceil(src.w * k) + 4;
  const h = Math.ceil(src.h * k) + 4;
  const px = new Px(w, h);
  const s = src.d;
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      let a = 0;
      let y = 0;
      let pink = 0;
      for (let j = 0; j < 3; j++) {
        const sy = Math.floor(ay + (Y + (j + 0.5) / 3 - day) / k);
        if (sy < 0 || sy >= src.h) continue;
        for (let i = 0; i < 3; i++) {
          const sx = Math.floor(ax + (X + (i + 0.5) / 3 - dax) / k);
          if (sx < 0 || sx >= src.w) continue;
          const si = (sy * src.w + sx) * 4;
          const sa = s[si + 3];
          if (!sa) continue;
          const r = s[si];
          const g = s[si + 1];
          const b = s[si + 2];
          if (r === EYE_LIT_RGB[0] && g === EYE_LIT_RGB[1] && b === EYE_LIT_RGB[2]) pink += sa;
          a += sa;
          y += sa * (0.299 * r + 0.587 * g + 0.114 * b);
        }
      }
      if (a < 9 * 12) continue;
      const di = (Y * w + X) * 4;
      px.d.set(pink * 2 > a ? EYE_LIT_RGB : FOG_RGB[toneOf(y / a)], di);
      px.d[di + 3] = Math.min(255, Math.round(a / 9));
    }
  }
  return { px, ax: dax, ay: day, lights: [] };
}

/** THE PRINCESS'S SNARE, small and short (`SHADOW_SNARE`): `t` seconds after her blow lands, round where you stand. */
export const SHADOW_SNARE = { k: 0.55, hold: 1.4, long: 2.0 } as const;
export function snareFx(t: number, view: GameView): Frame {
  const ft = t < SHADOW_SNARE.hold ? t : SNARE_FX.sink[0] + (t - SHADOW_SNARE.hold);
  if (t < 0 || t > SHADOW_SNARE.long) return { px: new Px(1, 1), ax: 0, ay: 0, lights: [] };
  return fxSmaller(snarePainted(ft, view).px, SNARE_CANVAS.ax, SNARE_CANVAS.ay, SHADOW_SNARE.k);
}

/** THE KING'S CROWN, its ring small (`SHADOW_CROWN`): `t` seconds after he lands, round the floor point under him. OUT OF THE SHADOW'S SET (its leap, as the King's, is retired: KG_RETIRED.leap); kept in the code. */
export const SHADOW_CROWN = { k: 0.4, carry: 2.5 } as const;
export function crownFx(t: number, view: GameView): Frame {
  if (t < 0 || t > CROWN_FX.long) return { px: new Px(1, 1), ax: 0, ay: 0, lights: [] };
  return fxSmaller(crownPainted(t, view).px, FX_CANVAS.ax, FX_CANVAS.ay, SHADOW_CROWN.k);
}

// =============================================================================================
// THE KING'S SHADOW'S CHARGE: the line of sparks it cuts behind it, its sparks shooting off and popping in shrapnel

/**
 * ITS NUMBERS. Its times are the King's own (`KG_CHARGE`): the warning held 0.3 to 0.7 s, the strike in two frames (0.767
 * to 0.833 s), the run 0.8 to 1.55 s, the rip 2.0 to 2.15 s, the line's sparks going 0.6 s after it stops (2.15 s), popping
 * 0.28 to 0.4 s after, the shrapnel gone 0.25 s after each pop, all of it gone 1.0 s after they go (`CHARGE_FX`). Its
 * lengths are 0.64 of his (`k`, as the shadow is drawn): the game carries it at `pace` tiles a second (his 12 times 0.64,
 * so that its feet, drawn at 0.64, grip the floor as his do), `most` tiles in the run (his 9); the line cut `tail` tiles
 * behind its floor point (his 1.75); its sparks one every `every` tiles of the line, popping up to `high` tiles up and
 * `out` off it, their shrapnel `r` round each pop; THE HIT, everything within `reach` tiles of the line (his 2.6), 0.28 to
 * 0.65 s after its sparks go.
 */
export const SHADOW_CHARGE = (() => {
  const k = 0.64;
  return { k, pace: KG_CHARGE.pace * k, most: KG_CHARGE.most * k, tail: KG_CHARGE.tail * k, every: CHARGE_FX.every * k, high: CHARGE_FX.high * k, out: CHARGE_FX.out * k, r: CHARGE_FX.r * k, reach: CHARGE_FX.reach * k } as const;
})();
/** How far the game has carried the shadow (tiles along its forward) `t` seconds into its charge. */
export const chargeCarriedTiles = (t: number): number => SHADOW_CHARGE.pace * (Math.max(KG_CHARGE.run[0], Math.min(KG_CHARGE.run[1], t)) - KG_CHARGE.run[0]);
/** Its picture (the shadow's size), laid where it set off: room for the whole line and its sparks either side. */
export const SPARKS_CANVAS = { w: 480, h: 330, ax: 200, ay: 185 } as const;
/** Its colours: the cut bone white where the point is, cooling to the dull pink along it, its scar dark; the sparks bone white, pale fog, the pinks; the shrapnel cooling from bone white to the dull pink. */
const S_CUT = [FOG_RGB[10], FOG_RGB[8], EYE_LIT_RGB, EYE_RGB, FOG_RGB[2]];
const S_SPARK = [FOG_RGB[10], FOG_RGB[8], EYE_LIT_RGB, EYE_RGB];
const S_SHARD = [FOG_RGB[10], FOG_RGB[8], EYE_LIT_RGB, EYE_LIT_RGB, EYE_RGB];
const S_GRIT = [FOG_RGB[3], FOG_RGB[4], FOG_RGB[5]];
/**
 * THE SHADOW'S LINE OF SPARKS `t` seconds after it sets off (its charge's `run[0]`), laid where it set off: the King's line
 * (art/king_fx.ts `sparksPainted`), its sparks and their flights his (`chargeSparks`, `chargeSparkAt`, `chargeShardAt`),
 * at 0.64 of his, in fog and the dull pink. `lane`: how far it ran (tiles; at most `SHADOW_CHARGE.most`).
 */
export function sparksFx(t: number, view: GameView = 'front', lane: number = SHADOW_CHARGE.most): Frame {
  const S = SHADOW_CHARGE;
  const k = S.k;
  const can = SPARKS_CANVAS;
  const px = new Px(can.w, can.h);
  const out: Frame = { px, ax: can.ax, ay: can.ay, lights: [] };
  const ran = lane / S.pace;
  const tb = ran + KG_CHARGE.burstAfter;
  if (t < 0 || t >= tb + CHARGE_FX.long) return out;
  const st = wbStage(view, can);
  const T = TILE3;
  const x0 = -S.tail * T;
  const x1 = Math.min(t, ran) * S.pace * T - S.tail * T;
  const since = t - tb;
  // (the cut wavering as the blade bounced along: his, at its size)
  const wob = (x: number): number => k * (2.2 * Math.sin((x / k) * 0.11) + 1.2 * Math.sin((x / k) * 0.37 + 1));
  const sm = (p: V3): V3 => [p[0] * k, p[1] * k, p[2] * k];
  const his = chargeSparks(lane / k);
  const sparks = his.map((q) => ({ ...q, x: q.x * k, y: q.y * k, pop: sm(q.pop) }));
  const sparkAt = (i: number, s: number): V3 => sm(chargeSparkAt(his[i], s));
  const dot = (p: V3, c: readonly number[], size = 1): void => {
    const [X, Y] = st.at(p);
    dotOn(px, X, Y, c, 255, size);
  };
  const held = since < 0 ? smooth(-CHARGE_FX.hold, -0.04, since) : 0;
  const pulse = held * (0.6 + 0.4 * Math.sin(t * 46));
  const scar = since < 0 ? 1 : 1 - smooth(0.12, CHARGE_FX.long - 0.05, since);
  // THE CUT: a groove scored along the stones, glowing
  for (let x = x0; x <= x1; x += 0.6) {
    const age = (x1 - x) / (S.pace * T) + Math.max(0, t - ran);
    const y = wob(x);
    let c: readonly number[] | null;
    if (since >= 0) c = since < 0.08 ? S_CUT[0] : hash(Math.round(x), 3, 9501) < scar ? (since < 0.25 ? S_CUT[2] : since < 0.5 ? S_CUT[3] : S_CUT[4]) : null;
    else if (age < 0.05) c = S_CUT[0];
    else if (age < 0.15) c = S_CUT[1];
    else if (held > 0.7 && hash(Math.round(x), Math.floor(t * 20), 9502) < held - 0.25) c = S_CUT[0];
    else if (pulse > 0.4 && hash(Math.round(x), Math.floor(t * 20) + 1, 9502) < pulse) c = S_CUT[1];
    else c = age < 0.4 ? S_CUT[2] : S_CUT[3];
    if (!c) continue;
    // (a groove two pixels wide: its hot core, its glowing lips, the stone cut dark at its edge)
    dot([x, y, 0.2], c, 2);
    if (since < 0) {
      const lip = age < 0.15 ? S_CUT[1] : pulse > 0.4 ? S_CUT[2] : S_CUT[3];
      dot([x, y - 2.2, 0.2], lip);
      dot([x, y + 2.2, 0.2], hash(Math.round(x * 2), 1, 9503) < 0.5 ? FOG_RGB[0] : lip);
    }
  }
  if (since < 0) {
    // (sparks fizzing up off it all along)
    const n = Math.round((x1 - x0) / 2.5);
    for (let i = 0; i < n; i++) {
      const x = x0 + (x1 - x0) * hash(i, 1, 9504);
      const age = (x1 - x) / (S.pace * T) + Math.max(0, t - ran);
      const life = fr(t * (2.2 + hash(i, 2, 9504)) + hash(i, 3, 9504));
      if (hash(i, 4, 9504) > 0.45 + 0.4 * held + (age < 0.25 ? 0.5 : 0)) continue;
      dot([x + (hash(i, 5, 9504) - 0.5) * 4, wob(x) + (hash(i, 6, 9504) - 0.5) * 8 * life, 0.5 + 17 * life * (1 - life) * (1 - 0.6 * held)], S_SPARK[i % 4], life < 0.35 ? 2 : 1);
    }
    // (THE HELD BEAT: the sparks that will go, gathered on the line as beads of light, swelling, trembling)
    if (held > 0) {
      sparks.forEach((q, i) => {
        if (q.x > x1) return;
        const shake = held > 0.3 ? (hash(i, Math.floor(t * 30), 9505) - 0.5) * 1.6 : 0;
        const [X, Y] = st.at([q.x, q.y, 1.3 + 2.6 * held + shake]);
        const hot = (Math.floor(t * 30) + i) % 3 !== 0;
        if (held > 0.45) {
          dotOn(px, X - 2, Y, S_SPARK[1], 255);
          dotOn(px, X + 2, Y, S_SPARK[1], 255);
          dotOn(px, X, Y + 2, EYE_LIT_RGB, 255);
        }
        dotOn(px, X, Y, held > 0.5 && hot ? S_SPARK[0] : S_SPARK[1], 255, 2);
      });
    }
    return out;
  }
  // THE RELEASE: a flash along the line as they tear off it, and stone chips kicked up out of it
  if (since < 0.1) {
    const H = 0.35 * T * k;
    for (let x = x0; x <= x1; x += 1.1) {
      for (let y = -H; y <= H; y += 2.2) {
        if (hash(Math.round(x), Math.round(y * 3), 9506) > 0.6 * (1 - since / 0.1) * (1 - Math.abs(y) / H)) continue;
        dot([x, wob(x) + y, 0.6], Math.abs(y) < H * 0.4 ? S_SPARK[0] : EYE_LIT_RGB);
      }
    }
  }
  const nc = Math.round((x1 - x0) / 4);
  for (let i = 0; i < nc; i++) {
    const u = since / (0.22 + 0.12 * hash(i, 16, 9507));
    if (u >= 1) continue;
    const x = x0 + (x1 - x0) * hash(i, 17, 9507);
    const side = (hash(i, 18, 9507) - 0.5) * 2;
    dot([x, wob(x) + side * 0.45 * T * k * u, Math.max(0.5, 0.45 * T * k * (2.6 * u - 2.6 * u * u))], S_GRIT[i % 3], 1 + (i % 2));
  }
  sparks.forEach((q, i) => {
    // THE SPARK SHOT OFF: its head bone white, its streak back along the way it came
    if (since < q.at) {
      const [X, Y] = st.at(sparkAt(i, since));
      const [Xt, Yt] = st.at(sparkAt(i, Math.max(0, since - 0.07)));
      const steps = Math.max(1, Math.ceil(Math.hypot(X - Xt, Y - Yt)));
      for (let j = 0; j < steps; j++) {
        const f = j / steps;
        dotOn(px, Xt + (X - Xt) * f, Yt + (Y - Yt) * f, f < 0.4 ? S_SPARK[3] : f < 0.75 ? S_SPARK[2] : S_SPARK[1], 255);
      }
      dotOn(px, X - 2, Y, S_SPARK[1], 255);
      dotOn(px, X + 2, Y, S_SPARK[1], 255);
      dotOn(px, X, Y - 2, S_SPARK[1], 255);
      dotOn(px, X, Y, S_SPARK[0], 255, 2);
      return;
    }
    const a = since - q.at;
    const [PX, PY] = st.at(q.pop);
    // ITS POP: a star of light, for a moment
    if (a < 0.06) {
      dotOn(px, PX, PY, S_SPARK[0], 255, 2);
      const L = a < 0.03 ? 4 : 3;
      for (let r = 2; r <= L; r++) {
        const c = r < 3 ? S_SPARK[0] : EYE_LIT_RGB;
        dotOn(px, PX + r, PY, c, 255);
        dotOn(px, PX - r, PY, c, 255);
        dotOn(px, PX, PY + r, c, 255);
        dotOn(px, PX, PY - r, c, 255);
        if (r <= L - 1) for (const [dx, dy] of [[r, r], [-r, r], [r, -r], [-r, -r]]) dotOn(px, PX + dx, PY + dy, S_SPARK[1], 255);
      }
    }
    // ITS SHRAPNEL: fragments flung out every way, streaked, cooling to the dull pink, gone
    const u = a / CHARGE_FX.shards;
    if (u < 1) {
      const c = S_SHARD[Math.min(4, Math.floor(u * 5))];
      const k0 = his[i];
      for (let j = 0; j < 12; j++) {
        const [Xb, Yb] = st.at(sm(chargeShardAt(k0, i, j, Math.max(0, u - 0.16))));
        const [X, Y] = st.at(sm(chargeShardAt(k0, i, j, u)));
        const steps = Math.max(1, Math.ceil(Math.hypot(X - Xb, Y - Yb)));
        for (let m = 0; m < steps; m++) dotOn(px, Xb + ((X - Xb) * m) / steps, Yb + ((Y - Yb) * m) / steps, u < 0.5 ? S_SHARD[Math.min(4, Math.floor(u * 5) + 1)] : c, 255);
        dotOn(px, X, Y, c, 255, u < 0.3 ? 2 : 1);
      }
    }
    // (its smoke, a few puffs of fog drifting up off where it popped)
    for (let m = 0; m < 3; m++) {
      const life = clamp01((a - 0.05 - 0.05 * m) / (CHARGE_FX.long - 0.08 - q.at - 0.05 * m));
      if (life <= 0 || life >= 1) continue;
      dot([q.pop[0] + (hash(i, 20 + m, 9508) - 0.5) * 8 - 3 * life, q.pop[1] + (hash(i, 23 + m, 9508) - 0.5) * 8, q.pop[2] + 10 * life], life < 0.4 ? FOG_RGB[7] : FOG_RGB[5], life < 0.5 ? 2 : 1);
    }
  });
  return out;
}
const fr = (x: number): number => x - Math.floor(x);

// =============================================================================================
// THE KING'S SHADOW'S CROWN'S WEIGHT: a shadow crown sent up off its head, following you, slamming down, flying home

/**
 * ITS NUMBERS. Its times are the King's own (WEIGHT_FX, seconds from its sending, `KG_WEIGHT.send`, 1.1 s into the shadow's
 * `weight`, as into his): out over you 0.45 s; following you to 2.4 s; held 0.533 s (THE WARNING); its drop two frames,
 * landing at 3.0 s (the move's 4.1 s); lying 0.4 s; home 0.7 s, on the shadow's head at 4.1 s (the move's 5.2 s); the move
 * 5.6 s. Its sizes are the shadow's (`k`, 0.64 of the King's): the crown (grown 5.2 times its size on the shadow's head, as
 * his), the pink ring where it will fall (`r`, 1.09 tiles; his 1.7), the ring its slam rolls out (to `rolls`, 1.66 tiles;
 * his 2.6), its drop's height over its hang. It hangs `z` up (its band's middle, picture pixels; the knight is 57): as far
 * over your head, at its size, as his (24 clear; his 38). It follows you at his pace (`pace`, tiles a second: the game's).
 */
export const SHADOW_WEIGHT = { k: 0.64, r: 1.7 * 0.64, rolls: 2.6 * 0.64, z: 84, pace: KG_WEIGHT.pace } as const;
/** The crown's picture at the King's size, before it is drawn at the shadow's (room for it high over you and coming home). */
const WB = { w: 250, h: 330, ax: 125, ay: 300 } as const;
/** Its floor's picture (the shadow's size). */
export const WEIGHT_FLOOR = { w: 260, h: 150, ax: 130, ay: 75 } as const;
const wbStage = (view: GameView, can: { w: number; h: number; ax: number; ay: number }) => stage(view === 'back' ? 'rear' : view, can.ax, can.ay, can);
/**
 * Where the shadow crown is, `t` seconds after it is sent: as the King's (`weightAt`: its phase, how far the game has moved
 * the floor point under it, `lerp`, its ways, how much it has grown, `k`), its middle `c` from that floor point at the
 * shadow's size (picture pixels): off the shadow's head, up over you, held, dropped, lying, home onto its head.
 */
export function shadowCrownAt(t: number, view: GameView = 'front'): ReturnType<typeof weightAt> {
  const w = weightAt(t, view);
  const F = WEIGHT_FX;
  const S = SHADOW_WEIGHT;
  const k = S.k;
  const from = mul(weightHead(KG_WEIGHT.send, view).c, k);
  const to = mul(weightHead(KG_WEIGHT.back, view).c, k);
  const low = F.low * k;
  const bob = 3 * k * Math.sin(t * 2.2);
  let c: V3;
  if (w.phase === 'fly') {
    const e = w.lerp;
    c = [from[0] * (1 - e), from[1] * (1 - e), from[2] + (S.z - from[2]) * e + 26 * k * Math.sin(Math.PI * e) + bob * e];
  } else if (w.phase === 'follow') c = [0, 0, S.z + bob];
  else if (w.phase === 'hold') {
    // (stopped: it rises a little, and hangs trembling over you)
    const u = smooth(F.hold[0], F.hold[0] + 0.25, t);
    const shake = 1.2 * Math.sin(t * 60) * u;
    c = [shake, -shake * 0.6, S.z + bob + 14 * k * u];
  } else if (w.phase === 'drop') {
    const top = S.z + 3 * k * Math.sin(F.drop[0] * 2.2) + 14 * k;
    const u = (t - F.drop[0]) / (F.drop[1] - F.drop[0]);
    c = [0, 0, top + (low - top) * u * u];
  } else if (w.phase === 'lie') c = [0, 0, low];
  else if (w.phase === 'home') {
    const e = w.lerp;
    c = [to[0] * e, to[1] * e, low + (to[2] - low) * e + 110 * k * Math.sin(Math.PI * e)];
  } else c = to;
  return { ...w, c };
}
const W_CACHE = new Map<string, Frame>();
/**
 * THE SHADOW CROWN `t` seconds after it is sent, laid at the floor point the game has under it (`shadowCrownAt`'s
 * `lerp`, as the King's): `'crown'`, the crown itself in the air (laid over the figures), and `'floor'`, what it lays on the
 * floor beneath it (laid under them). The crown is the King's (art/king.ts `crownAt`), painted at his size as fog and drawn
 * at the shadow's, as the shadow is: no gold, its dark seam and the enemy's pink edge, fog wisping off it. Under it: its
 * shadow, and THE WARNING, the shadows' dull pink ring round where it will fall, its dashes going round, solid and lit as
 * it hangs, a second ring closing in; then the slam: a flash, the stones cracked, a ring rolling out, dust.
 */
export function weightFx(t: number, view: GameView = 'front', part: 'crown' | 'floor' = 'crown'): Frame {
  const F = WEIGHT_FX;
  if (t < 0 || t >= F.long) return { px: new Px(1, 1), ax: 0, ay: 0, lights: [] };
  return part === 'crown' ? weightCrown(t, view) : weightFloor(t, view);
}
function weightCrown(t: number, view: GameView): Frame {
  const key = `${Math.round(t * 1000)}:${view}`;
  const have = W_CACHE.get(key);
  if (have) return have;
  const F = WEIGHT_FX;
  const k = SHADOW_WEIGHT.k;
  const w = shadowCrownAt(t, view);
  const st = wbStage(view, WB);
  const bits: Bit[] = [];
  const put: Put = (pt, piece, shape) => bits.push({ part: pt, piece, shape });
  // (painted at the King's size: its middle and its height over the floor point the shadow's, over its size)
  const cB = mul(w.c, 1 / k);
  crownAt(put, cB, w.ff, w.fl, w.fu, CROWN_HEAD, t, w.k);
  if (t > F.drop[0] + 1e-6 && t <= F.drop[1] + 1 / 30 + 1e-6) {
    // its drop: streaks down from where its band and its points were to where they are, the oldest third dull, the newest bright
    const a = shadowCrownAt(F.drop[0] - 1e-3, view).c[2] / k;
    const b = Math.min(cB[2], shadowCrownAt(Math.min(t, F.drop[1] - 1e-4), view).c[2] / k);
    const from = t > F.drop[1] + 1e-6 ? a + (b - a) * 0.5 : a;
    const lines: V3[][] = [];
    for (let s = 0; s < 3; s++) {
      for (let j = 0; j < 12; j++) {
        const q = (j / 12) * Math.PI * 2;
        const rim = add(mul(w.ff, Math.cos(q) * CROWN_HEAD[0] * 0.8 * w.k), mul(w.fl, Math.sin(q) * CROWN_HEAD[1] * 0.86 * w.k));
        const up = j % 2 === 0 ? 8.4 * w.k : 0;
        lines.push([add(rim, [0, 0, from + ((b - from) * s) / 3 + up]), add(rim, [0, 0, from + ((b - from) * (s + 1)) / 3 + up])]);
      }
    }
    smearParts(put, st, lines);
  }
  paintBits(st, bits.map(foggedBit), cB);
  const big = st.whole(null);
  const d = big.d;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3]) continue;
    d.set(FOG_RGB[toneOf(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2])], i);
    d[i + 3] = 255;
  }
  const s = smaller(big, WB.ax, WB.ay, k);
  const px = fogOn(s, t, 2015);
  // as it lies ringing, rings of sound going out off it, pale
  if (w.phase === 'lie') {
    const st2 = wbStage(view, { w: px.w, h: px.h, ax: s.ax, ay: s.ay });
    const s2 = t - F.drop[1];
    for (let r = 0; r < 3; r++) {
      if (s2 > 0.3 + 0.08 * r) continue;
      const R = CROWN_HEAD[1] * w.k * k * (1.1 + 0.5 * r + 2.4 * s2);
      for (let j = 0; j < 56; j++) {
        const q = (j / 56) * Math.PI * 2;
        if (hash(j, r, 9411) > 0.7 - s2) continue;
        const [X, Y] = st2.at([Math.cos(q) * R, Math.sin(q) * R, w.c[2] + (8 + 6 * r + 20 * s2) * k]);
        dotOn(px, X, Y, FOG_RGB[r === 0 ? 10 : 8], 255);
      }
    }
  }
  const out: Frame = { px, ax: s.ax, ay: s.ay, lights: [] };
  W_CACHE.set(key, out);
  return out;
}
const dotOn = (px: Px, x: number, y: number, c: readonly number[], a: number, size = 1): void => {
  const xi = Math.round(x - size / 2);
  const yi = Math.round(y - size / 2);
  for (let j = 0; j < size; j++) {
    for (let i = 0; i < size; i++) {
      const X = xi + i;
      const Y = yi + j;
      if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
      const di = (Y * px.w + X) * 4;
      px.d.set(c.slice(0, 3), di);
      px.d[di + 3] = a;
    }
  }
};
function weightFloor(t: number, view: GameView): Frame {
  const F = WEIGHT_FX;
  const S = SHADOW_WEIGHT;
  const k = S.k;
  const can = WEIGHT_FLOOR;
  const px = new Px(can.w, can.h);
  const out: Frame = { px, ax: can.ax, ay: can.ay, lights: [] };
  const w = shadowCrownAt(t, view);
  const st = wbStage(view, can);
  const T = TILE3;
  const R = S.r * T;
  const at = (x: number, y: number, z: number): readonly [number, number] => st.at([x, y, z]);
  const there = w.phase === 'fly' ? smooth(0.15, F.fly, t) : w.phase === 'home' ? 1 - smooth(F.home[0], F.home[0] + 0.3, t) : w.phase === 'back' ? 0 : 1;
  const holding = w.phase === 'hold' ? smooth(F.hold[0], F.drop[0], t) : w.phase === 'drop' ? 1 : 0;
  const landed = t >= F.drop[1] - 1e-6 ? t - F.drop[1] : -1;
  const crownR = CROWN_HEAD[1] * w.k * k;
  if (landed < 0 && there > 0) {
    // its shadow: as broad as it is, darker and tighter as it hangs and drops
    const sr = crownR * (1.25 - 0.25 * holding) * (w.phase === 'drop' ? 0.95 : 1);
    for (let y = -sr; y <= sr; y += 1) {
      for (let x = -sr; x <= sr; x += 1) {
        const q = (x * x + y * y) / (sr * sr);
        if (q > 1 || hash(Math.round(x), Math.round(y), 9412) > there * (0.35 + 0.5 * holding) * (1 - q * 0.7)) continue;
        const [X, Y] = at(x, y, 0.1);
        dotOn(px, X, Y, FOG_RGB[0], 255);
      }
    }
    // THE WARNING: the dull pink ring round where it will fall, its dashes going round; as it hangs, solid and lit, and a second ring closing in
    const n = Math.ceil(Math.PI * 2 * R);
    for (let i = 0; i < n; i++) {
      const q = (i / n) * Math.PI * 2;
      const fq = q * 3 - t * 0.9;
      const dash = fq - Math.floor(fq) < 0.6;
      if (!dash && holding < 0.3) continue;
      if (hash(i, 1, 9413) > there) continue;
      const [X, Y] = at(Math.cos(q) * R, Math.sin(q) * R, 0.3);
      dotOn(px, X, Y, holding > 0.4 ? EYE_LIT_RGB : EYE_RGB, 255);
      if (holding > 0.2) {
        const [X2, Y2] = at(Math.cos(q) * (R - 1.5), Math.sin(q) * (R - 1.5), 0.3);
        dotOn(px, X2, Y2, EYE_RGB, 255);
      }
    }
    if (holding > 0) {
      const Rc = R * (1 + 0.7 * (1 - holding));
      const m = Math.ceil((Math.PI * 2 * Rc) / 1.4);
      for (let i = 0; i < m; i += 2) {
        const q = (i / m) * Math.PI * 2;
        const [X, Y] = at(Math.cos(q) * Rc, Math.sin(q) * Rc, 0.3);
        dotOn(px, X, Y, EYE_LIT_RGB, 255);
      }
    }
  }
  if (landed >= 0) {
    // THE SLAM: a flash over all it strikes; the stones cracked out from under it; a ring rolling out off it; dust
    const fade = 1 - smooth(0.3, F.home[1] - F.drop[1], landed);
    if (landed < 0.12) {
      for (let y = -R; y <= R; y += 1.6) {
        for (let x = -R; x <= R; x += 1.6) {
          const q = (x * x + y * y) / (R * R);
          if (q > 1 || hash(Math.round(x), Math.round(y), 9414) > 0.5 * (1 - landed / 0.12)) continue;
          const [X, Y] = at(x, y, 0.3);
          dotOn(px, X, Y, q < 0.5 ? FOG_RGB[10] : EYE_LIT_RGB, 255);
        }
      }
    }
    for (let j = 0; j < 12; j++) {
      let a = (j / 12) * Math.PI * 2 + hash(j, 1, 9415);
      let r = crownR * 0.8;
      const long = R * (0.9 + 0.35 * hash(j, 2, 9415)) * smooth(0, 0.08, landed);
      while (r < long) {
        if (hash(j, Math.round(r), 9416) < fade) {
          const [X, Y] = at(Math.cos(a) * r, Math.sin(a) * r, 0.2);
          dotOn(px, X, Y, FOG_RGB[0], 255, r < long * 0.5 ? 2 : 1);
        }
        a += (hash(j, Math.round(r), 9417) - 0.5) * 0.12;
        r += 1;
      }
    }
    const ringR = R * (0.6 + (S.rolls / S.r - 0.6) * smooth(0, 0.45, landed));
    const rf = 1 - smooth(0.2, 0.55, landed);
    if (rf > 0) {
      const n = Math.ceil(Math.PI * 2 * ringR);
      for (let i = 0; i < n; i++) {
        const q = (i / n) * Math.PI * 2;
        for (const [dr, c, keep] of [[0, FOG_RGB[10], 1], [2, EYE_LIT_RGB, 0.8], [4, FOG_RGB[6], 0.5]] as const) {
          if (hash(i, dr, 9418) > rf * keep) continue;
          const [X, Y] = at(Math.cos(q) * (ringR + dr), Math.sin(q) * (ringR + dr), 0.4);
          dotOn(px, X, Y, c, 255);
        }
      }
      for (let i = 0; i < 60; i++) {
        if (hash(i, 4, 9419) > rf) continue;
        const q = hash(i, 1, 9419) * Math.PI * 2;
        const r = ringR * (0.55 + 0.45 * hash(i, 2, 9419));
        const z = 2 + 18 * k * smooth(0, 0.4, landed) * hash(i, 3, 9419);
        const [X, Y] = at(Math.cos(q) * r, Math.sin(q) * r, z);
        dotOn(px, X, Y, FOG_RGB[i % 4 === 0 ? 4 : 5], 255, i % 5 === 0 ? 2 : 1);
      }
    }
  }
  return out;
}

/** THE PRINCE'S MASKS, three and short (`SHADOW_MASKS`): `t` seconds after they leave his hand, round the floor point under him. */
export const SHADOW_MASKS = { which: [1, 2, 3] as const, reach: 6, burst: 0.3 } as const;
export const MASKS_SHADOW_FLIGHT = SHADOW_MASKS.reach / MASKS_FX.speed;
export const MASKS_CANVAS = { w: 420, h: 300, ax: 210, ay: 190 } as const;
const MASK_CACHE = new Map<string, Frame>();
export function masksFx(t: number, view: GameView): Frame {
  const r = ROYALS.prince;
  const can = MASKS_CANVAS;
  const px = new Px(can.w, can.h);
  const out: Frame = { px, ax: can.ax, ay: can.ay, lights: [] };
  if (t < 0 || t > MASKS_SHADOW_FLIGHT + SHADOW_MASKS.burst) return out;
  const st = stage(paintViewOf(r.mob, view), can.ax, can.ay, can);
  const at = (p: V3): readonly [number, number] => st.at([p[0] * r.k, p[1] * r.k, p[2] * r.k]);
  const dot = (x: number, y: number, tone: number, a: number): void => {
    const X = Math.round(x);
    const Y = Math.round(y);
    if (X < 0 || Y < 0 || X >= can.w || Y >= can.h) return;
    const di = (Y * can.w + X) * 4;
    px.d.set(FOG_RGB[tone], di);
    px.d[di + 3] = Math.max(px.d[di + 3], Math.round(255 * a));
  };
  const ft = Math.min(t, MASKS_SHADOW_FLIGHT);
  for (const i of SHADOW_MASKS.which) {
    // (his flight's way and height, flown half as far)
    const m = flungMask(i, ft);
    const d = MASKS_FX.speed * TILE3 * ft;
    const p: V3 = [10 + m.way[0] * d, m.way[1] * d, m.at[2]];
    if (t <= MASKS_SHADOW_FLIGHT) {
      // its smear: fog dots where it has just been
      for (let s = 1; s <= 10; s++) {
        const q: V3 = [p[0] - m.way[0] * s * 3, p[1] - m.way[1] * s * 3, p[2] + (s % 3) * 2 - 2];
        if (q[0] < 10) break;
        const [x, y] = at(q);
        dot(x, y, s < 4 ? 9 : s < 7 ? 7 : 5, 0.8 - s * 0.06);
      }
      const key = `${view}:${Math.round(m.spin * 12) % 75}`;
      let f = MASK_CACHE.get(key);
      if (!f) {
        f = fxSmaller(maskPainted(m.spin, view, 14).px, MASK_CANVAS.ax, MASK_CANVAS.ay, r.k);
        MASK_CACHE.set(key, f);
      }
      const [x, y] = at([p[0], p[1], p[2] - 14]);
      layOn(px, f, x, y);
    } else {
      // its end: a puff of fog, spreading and thinning
      const u = (t - MASKS_SHADOW_FLIGHT) / SHADOW_MASKS.burst;
      for (let j = 0; j < 26; j++) {
        if (hash(i, j, 9101) < u * 0.8) continue;
        const a = hash(i, j, 9102) * Math.PI * 2;
        const rr = 3 + 20 * u * (0.4 + hash(i, j, 9103));
        const [x, y] = at([p[0] + Math.cos(a) * rr, p[1] + Math.sin(a) * rr, Math.max(1, p[2] + 10 * u * (hash(i, j, 9104) - 0.2))]);
        dot(x, y, j % 3 === 0 ? 9 : 7, 0.85 * (1 - u));
      }
    }
  }
  return out;
}

/** Lays one picture on another, its floor point at (x, y), through its see-through (no colours mixed). */
export function layOn(dst: Px, f: { px: Px; ax: number; ay: number }, x: number, y: number, alpha = 1): void {
  const x0 = Math.round(x - f.ax);
  const y0 = Math.round(y - f.ay);
  const s = f.px.d;
  const d = dst.d;
  for (let j = 0; j < f.px.h; j++) {
    const Y = y0 + j;
    if (Y < 0 || Y >= dst.h) continue;
    for (let i = 0; i < f.px.w; i++) {
      const X = x0 + i;
      if (X < 0 || X >= dst.w) continue;
      const si = (j * f.px.w + i) * 4;
      const a = (s[si + 3] / 255) * alpha;
      if (a <= 0) continue;
      const di = (Y * dst.w + X) * 4;
      // (no colours mixed: the stronger one's, as the style's whole pixels are; the see-through added)
      const da = d[di + 3] / 255;
      if (a >= da) d.set(s.subarray(si, si + 3), di);
      d[di + 3] = Math.round((a + da * (1 - a)) * 255);
    }
  }
}

// =============================================================================================
// THE QUEEN'S BLINK

/** Her hand mirror: an oval glass in a fog frame on a short handle, `s` of its size (0 to 1), its glass flashing by `flash` (0 to 1), her eyes in it if `eyes`. */
function handMirror(px: Px, x: number, y: number, s: number, flash: number, eyes: boolean, alpha = 1): void {
  if (s <= 0.05) return;
  const rx = 4 * s;
  const ry = 5.4 * s;
  const set = (X: number, Y: number, c: readonly number[], a = 1): void => {
    if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) return;
    const di = (Y * px.w + X) * 4;
    px.d.set(c.slice(0, 3), di);
    px.d[di + 3] = Math.round(255 * a * alpha);
  };
  // the handle, down into her hand
  for (let j = 1; j <= Math.round(4 * s); j++) set(Math.round(x), Math.round(y + ry + j), FOG_RGB[3]);
  for (let Y = Math.floor(y - ry - 1); Y <= Math.ceil(y + ry + 1); Y++) {
    for (let X = Math.floor(x - rx - 1); X <= Math.ceil(x + rx + 1); X++) {
      const q = ((X + 0.5 - x) / (rx + 1)) ** 2 + ((Y + 0.5 - y) / (ry + 1)) ** 2;
      if (q > 1) continue;
      const g = ((X + 0.5 - x) / rx) ** 2 + ((Y + 0.5 - y) / ry) ** 2;
      if (g > 1) set(X, Y, FOG_RGB[3]);
      else {
        // the glass: pale, a glint across it on the slant, brighter as it flashes
        const glint = Math.abs((X - x) + (Y - y) * 0.7 + 2 - 4 * flash) < 1.0;
        set(X, Y, FOG_RGB[glint || flash > 0.6 ? 10 : flash > 0.2 ? 9 : 8]);
      }
    }
  }
  if (eyes) {
    set(Math.round(x - 1), Math.round(y - 0.5), EYE_LIT_RGB);
    set(Math.round(x + 1), Math.round(y - 0.5), EYE_RGB);
  }
}
/** A figure squeezed toward a point (x, y) of its frame, `s` of its size (its smear: what it was a moment ago, faint). */
function squeezed(f: Frame, x: number, y: number, s: number, ghost: number | null): Px {
  const out = new Px(f.px.w, f.px.h);
  const put = (k: number, a: number): void => {
    for (let Y = 0; Y < out.h; Y++) {
      for (let X = 0; X < out.w; X++) {
        const sx = Math.floor(x + (X + 0.5 - x) / k);
        const sy = Math.floor(y + (Y + 0.5 - y) / k);
        if (sx < 0 || sy < 0 || sx >= f.px.w || sy >= f.px.h) continue;
        const si = (sy * f.px.w + sx) * 4;
        if (!f.px.d[si + 3]) continue;
        const di = (Y * out.w + X) * 4;
        if (a < 1 && out.d[di + 3]) continue;
        out.d.set(f.px.d.subarray(si, si + 3), di);
        out.d[di + 3] = Math.round(f.px.d[si + 3] * a);
      }
    }
  };
  if (ghost !== null) put(ghost, 0.35);
  // (the figure over its ghost)
  const g = new Px(out.w, out.h);
  g.d.set(out.d);
  out.d.fill(0);
  put(s, 1);
  for (let i = 0; i < out.d.length; i += 4) if (!out.d[i + 3] && g.d[i + 3]) out.d.set(g.d.subarray(i, i + 4), i);
  return out;
}
/** ONE FRAME OF THE QUEEN'S BLINK: `into` her hand mirror where she is, or `out` of it where the game puts her. */
export function blinkFrame(phase: 'into' | 'out', t: number, view: GameView): Frame {
  const r = ROYALS.queen;
  const B = BLINK;
  if (phase === 'into') {
    const rt = Math.min(B.lift, t * 1.7);
    const body = shadowFrame(r, 'reflect', rt, view);
    const h = bonesAt(r, 'reflect', rt).handL;
    const [mx, my] = pointOn(r, view, [h[0], h[1], h[2] + 5], body);
    const flash = t >= B.warnIn[0] && t < B.strikeIn[0] ? 0.5 + 0.5 * Math.sin((t - B.warnIn[0]) * 40) : 0;
    const grow = smooth(B.form[0], B.form[1], t);
    let px: Px;
    if (t <= B.strikeIn[0] + 1e-6) px = body.px;
    else if (t <= B.strikeIn[1] + 1e-6 + 1 / 30) {
      // the fold, in two frames, its smear the frame before
      const first = t <= (B.strikeIn[0] + B.strikeIn[1]) / 2 + 1e-6;
      px = t > B.strikeIn[1] + 1e-6 ? squeezed(body, mx, my, 0.04, 0.12) : squeezed(body, mx, my, first ? 0.45 : 0.12, first ? 1 : 0.45);
    } else px = new Px(body.px.w, body.px.h);
    const shrink = 1 - smooth(B.gone[0], B.gone[1], t);
    handMirror(px, mx, my, grow * shrink, flash || (t > B.strikeIn[0] && t < B.gone[0] ? 1 : 0), false);
    if (t > B.gone[0]) puff(px, mx, my, (t - B.gone[0]) / (B.gone[1] - B.gone[0]), 9201);
    return { px, ax: body.ax, ay: body.ay, lights: [] };
  }
  const body = shadowFrame(r, 'stand', Math.max(0, t - B.strikeOut[1]), view);
  const h = bonesAt(r, 'stand', 0).handL;
  const [mx, my] = pointOn(r, view, [h[0] + 4, h[1], h[2] + 12], body);
  const grow = smooth(B.formOut[0], B.formOut[1], t);
  let px: Px;
  if (t <= B.strikeOut[0] + 1e-6) px = new Px(body.px.w, body.px.h);
  else if (t <= B.strikeOut[1] + 1e-6) px = squeezed(body, mx, my, t <= (B.strikeOut[0] + B.strikeOut[1]) / 2 + 1e-6 ? 0.3 : 0.75, t <= (B.strikeOut[0] + B.strikeOut[1]) / 2 + 1e-6 ? null : 0.3);
  else if (t <= B.strikeOut[1] + 1 / 30 + 1e-6) px = squeezed(body, mx, my, 1, 0.75);
  else px = body.px;
  const fade = 1 - smooth(B.fadeOut[0], B.fadeOut[1], t);
  handMirror(px, mx, my, grow, t < B.strikeOut[0] ? 0.3 : 0, t >= B.eyesOut && t <= B.strikeOut[1], fade);
  return { px, ax: body.ax, ay: body.ay, lights: [] };
}
/** A puff of fog motes from a point, `u` of the way through (0 to 1). */
function puff(px: Px, x: number, y: number, u: number, seed: number): void {
  for (let j = 0; j < 18; j++) {
    if (hash(j, 1, seed) < u * 0.7) continue;
    const a = hash(j, 2, seed) * Math.PI * 2;
    const rr = 2 + 12 * u * (0.4 + hash(j, 3, seed));
    const X = Math.round(x + Math.cos(a) * rr);
    const Y = Math.round(y + Math.sin(a) * rr * 0.7 - 6 * u);
    if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
    const di = (Y * px.w + X) * 4;
    px.d.set(FOG_RGB[j % 2 ? 9 : 7], di);
    px.d[di + 3] = Math.round(220 * (1 - u));
  }
}

// =============================================================================================
// THE CARDS

/** A PLAYING CARD (picture pixels): bone white, a fog border, the family's swan crest in two corners, the royal's own mark twice, head to foot as a court card's is. */
export const CARD = { w: 27, h: 41 } as const;
const INK: Readonly<Record<string, number>> = { k: 2, d: 4, m: 6, l: 8, w: 10 };
/** Each royal's mark, 13 by 9, its own: the Princess's crown of nettles, the Prince's smiling mask, the Queen's crown of glass spikes, the King's crown of fleurons over his great sword. */
export const MARKS: Readonly<Record<RoyalId, readonly string[]>> = {
  princess: [
    '..k...k...k..',
    '.kmk.kmk.kmk.',
    'kmlmkmlmkmlmk',
    '.kmmkmlmkmmk.',
    '..kmmmmmmmk..',
    '...kmmmmmk...',
    '..kkkkkkkkk..',
    '..klklklklk..',
    '..kkkkkkkkk..',
  ],
  prince: [
    '...kkkkkkk...',
    '.kklllllllkk.',
    'klkkklllkkklk',
    'klllllmlllllk',
    'klllllmlllllk',
    'klklllllllklk',
    '.kllkkkkkllk.',
    '..klllllllk..',
    '...kkkkkkk...',
  ],
  queen: [
    '......k......',
    '......k......',
    '..k..klk..k..',
    '.klk.klk.klk.',
    '.klkkklkkklk.',
    'kklllllllllkk',
    'kmdmdmdmdmdmk',
    'kkkkkkkkkkkkk',
    '.............',
  ],
  king: [
    '..k...k...k..',
    '.klk.klk.klk.',
    '..k..kmk..k..',
    '.kmk.kmk.kmk.',
    '.kmmkmmmkmmk.',
    '.kmmmmmmmmmk.',
    '.kdkdkdkdkdk.',
    '.kmmmmmmmmmk.',
    '.kkkkkkkkkkk.',
  ],
};
/** The family's crest, the royal swan (its wings raised, its neck curved), drawn small: its corners' mark. (The guard's and the King's `royalSwan` is too fine to hold at this size.) */
export const SWAN: readonly string[] = [
  '.##..#.',
  '#.#.##.',
  '..#.###',
  '..#####',
  '.######',
  '..####.',
];
const CARDS = new Map<RoyalId, Px>();
export function cardPx(id: RoyalId): Px {
  let px = CARDS.get(id);
  if (px) return px;
  px = new Px(CARD.w, CARD.h);
  const { w, h } = CARD;
  const set = (x: number, y: number, tone: number): void => {
    px!.d.set(FOG_RGB[tone], (y * w + x) * 4);
    px!.d[(y * w + x) * 4 + 3] = 255;
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const corner = (x === 0 || x === w - 1) && (y === 0 || y === h - 1);
      if (corner) continue;
      const rim = x === 0 || y === 0 || x === w - 1 || y === h - 1;
      set(x, y, rim ? 3 : 10);
    }
  }
  // a fine line across its middle
  for (let x = 4; x <= w - 5; x++) set(x, Math.floor(h / 2), 8);
  // the mark, head to foot
  const mark = MARKS[id];
  const mx = Math.floor((w - 13) / 2);
  const my = Math.floor(h / 2) - 2 - mark.length;
  mark.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === '.') return;
    set(mx + i, my + j, INK[c]);
    set(w - 1 - (mx + i), h - 1 - (my + j), INK[c]);
  }));
  // the swan crest, top left and bottom right
  SWAN.forEach((row, j) => [...row].forEach((c, i) => {
    if (c === '.') return;
    set(2 + i, 2 + j, 4);
    set(w - 3 - i, h - 3 - j, 4);
  }));
  CARDS.set(id, px);
  return px;
}

// =============================================================================================
// THE DEATH: BLOWN APART LIKE SMOKE; ITS CARD HANGS IN THE AIR A MOMENT AND FADES

/** Its death (seconds): struck (to `struck`), blown apart (`smoke`), its card turning to face you (`card`), hanging, and fading (`fade`). */
export const DEATH = { long: 2.4, struck: 0.12, smoke: [0.12, 1.25] as const, card: [0.3, 0.45] as const, fade: [1.7, 2.4] as const } as const;
const MARGIN = { x: 60, top: 70, bottom: 10 } as const;
const STRUCK = new Map<string, Frame>();
/** ONE FRAME OF ITS DEATH, `t` seconds in. */
export function deathFrame(r: Royal, t: number, view: GameView): Frame {
  const key = `${r.id}:${view}`;
  let base = STRUCK.get(key);
  if (!base) STRUCK.set(key, (base = shadowFrame(r, 'reel', DEATH.struck, view, false)));
  const W = base.px.w + 2 * MARGIN.x;
  const H = base.px.h + MARGIN.top + MARGIN.bottom;
  const px = new Px(W, H);
  const ax = base.ax + MARGIN.x;
  const ay = base.ay + MARGIN.top;
  const out: Frame = { px, ax, ay, lights: [] };
  if (t < DEATH.struck) {
    layOn(px, shadowFrame(r, 'reel', t, view), ax, ay);
    return out;
  }
  // its height (for where its middle and its chest are)
  const b = base.px;
  let top = b.h;
  for (let i = 3; i < b.d.length; i += 4) if (b.d[i] === 255) { top = Math.floor(i / 4 / b.w); break; }
  const cx = base.ax;
  const cy = (top + base.ay) / 2;
  const u = clamp01((t - DEATH.smoke[0]) / (DEATH.smoke[1] - DEATH.smoke[0]));
  if (u < 1) {
    for (let y = 0; y < b.h; y++) {
      for (let x = 0; x < b.w; x++) {
        const si = (y * b.w + x) * 4;
        if (b.d[si + 3] < 255) continue;
        // each speck goes in its own time, the outside first, rising, spreading and curling, paling, thinning
        const out = Math.hypot(x - cx, (y - cy) * 0.7) / (b.h * 0.5);
        const late = 0.35 * hash(x, y, 9301) + 0.2 * (1 - Math.min(1, out));
        const v = clamp01((u - late) / (1 - late) * 1.25);
        if (v >= 1) continue;
        const ease = v * (2 - v);
        const sw = Math.sin(y * 0.3 + v * 6 + hash(x, y, 9302) * 6) * 5 * ease;
        const X = Math.round(x + MARGIN.x + (x - cx) * 0.9 * ease + sw);
        const Y = Math.round(y + MARGIN.top + (y - cy) * 0.35 * ease - 40 * ease * (0.6 + hash(x, y, 9303)));
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const pink = b.d[si] === EYE_RGB[0] && b.d[si + 1] === EYE_RGB[1] || b.d[si] === EYE_LIT_RGB[0] && b.d[si + 1] === EYE_LIT_RGB[1];
        const t0 = toneOf(0.299 * b.d[si] + 0.587 * b.d[si + 1] + 0.114 * b.d[si + 2]);
        const di = (Y * W + X) * 4;
        px.d.set(pink && v < 0.15 ? b.d.subarray(si, si + 3) : FOG_RGB[Math.round(t0 + (7 - t0) * Math.min(1, v * 2))], di);
        px.d[di + 3] = Math.max(px.d[di + 3], Math.round(255 * (1 - v) ** 1.2));
      }
    }
  }
  // its card, at its chest, turning to face you, hanging, rising a little, fading
  if (t >= DEATH.card[0]) {
    const turn = smooth(DEATH.card[0], DEATH.card[1], t);
    const fade = 1 - smooth(DEATH.fade[0], DEATH.fade[1], t);
    const card = cardPx(r.id);
    const sx = Math.max(0.08, turn);
    const ccx = ax;
    const ccy = MARGIN.top + top + (base.ay - top) * 0.38 - 6 * clamp01((t - DEATH.card[0]) / (DEATH.long - DEATH.card[0]));
    const half = (CARD.w * sx) / 2;
    for (let j = 0; j < CARD.h; j++) {
      for (let i = 0; i < Math.round(CARD.w * sx); i++) {
        const si = (j * CARD.w + Math.min(CARD.w - 1, Math.floor(i / sx))) * 4;
        if (!card.d[si + 3]) continue;
        const X = Math.round(ccx - half + i);
        const Y = Math.round(ccy - CARD.h / 2 + j);
        if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
        const di = (Y * W + X) * 4;
        // (dithered as it fades: whole pixels going, as the style's are)
        if (hash(i, j, 9304) > fade) continue;
        px.d.set(card.d.subarray(si, si + 3), di);
        px.d[di + 3] = 255;
      }
    }
  }
  return out;
}
/** The canvas a shadow's death is painted on (its floor point on it): its struck frame's, with room round it for the smoke and its card. */
export function deathCanvasOf(r: Royal): { w: number; h: number } {
  const c = canvasOf(r.mob);
  return { w: Math.ceil(c.w * r.k) + 4 + 2 * MARGIN.x, h: Math.ceil(c.h * r.k) + 4 + MARGIN.top + MARGIN.bottom };
}
