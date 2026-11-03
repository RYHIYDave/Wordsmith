// THE DEMON BURNING OUT, AND HIM COMING BACK (the art chat, 27 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// His picks, 27 Oct: how it turns back into him, “Burns out (Recommended)” (offered as: its fire gutters and dies; it crumbles
// into smoke and ash from the edges in; he's left on one knee, arm smoking, then stands); what ends it, “Meter runs dry
// (Recommended)”. So, as the pact meter runs dry: the demon's fire gutters and dies as it sags (dev/demon_moves.ts
// burnOutMove); then IT CRUMBLES from its edges in, a band of its dying cyan fire eating in over it and leaving ash behind it
// (`crumble`), flakes of grey ash drifting down off it and settling on the floor, cyan embers rising, its smoke rolling up off
// it; and where it crumbles away there he is, on one knee (dev/warlock_spells.ts comeBack), his demon arm hanging and
// smoking; he gets up. Nothing of the demon's is left but its ash on the floor and its smoke thinning.

import { project } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import { Px } from '../engine/px';
import { HELL, noise2 } from './sculpt_warlock';
import { CHANGE_SCENE, Light, SMOKE, cloud } from './warlock_fx';

/** The scene: the change's own (dev/warlock_fx.ts CHANGE_SCENE), the floor point under them both at (`ax`, `ay`). */
export const RETURN_SCENE = CHANGE_SCENE;
/** Ash: dark to light. */
const ASH = ['#3e3a44', '#5a5462', '#77717e', '#948e9a'];
const hash = (i: number): number => {
  const x = Math.sin(i * 61.7 + 7.3) * 43758.5453;
  return x - Math.floor(x);
};

/** How far in from its edge each pixel of a picture is (steps), and the furthest in. */
function depthIn(px: Px): { d: Int16Array; most: number } {
  const { w, h } = px;
  const d = new Int16Array(w * h).fill(-1);
  const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && px.d[(y * w + x) * 4 + 3] > 0;
  let q: number[] = [];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!solid(x, y)) continue;
      if (!solid(x - 1, y) || !solid(x + 1, y) || !solid(x, y - 1) || !solid(x, y + 1)) {
        d[y * w + x] = 0;
        q.push(y * w + x);
      }
    }
  }
  let most = 0;
  while (q.length) {
    const next: number[] = [];
    for (const i of q) {
      const x = i % w;
      const y = (i - x) / w;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]] as const) {
        if (!solid(nx, ny) || d[ny * w + nx] >= 0) continue;
        d[ny * w + nx] = d[i] + 1;
        most = Math.max(most, d[i] + 1);
        next.push(ny * w + nx);
      }
    }
    q = next;
  }
  return { d, most };
}
/** Where a pixel of it stands in the crumbling, 0 its edge to about 1 its heart, broken up by noise so that it crumbles raggedly. */
function crumbleAt(x: number, y: number, dep: number, most: number): number {
  return (dep / Math.max(1, most)) * 0.8 + (noise2(x * 0.16 + 3.1, y * 0.16 + 1.7) - 0.5) * 0.45 + (noise2(x * 0.5, y * 0.5) - 0.5) * 0.15 + 0.12;
}
/** How far the crumbling has eaten in when it is `gone` of the way (0 none, 1 all of it). */
const front = (gone: number): number => gone * 1.35 - 0.12;
/** How deep the burning band is behind the crumbling's front: its fire foremost, ash behind it. */
const BAND = 0.09;

/**
 * IT CRUMBLING, `gone` of the way: what the crumbling has passed is gone; at its front a band of its dying fire, cyan, and
 * ash grey behind that; the rest of it as it was. None of it left a pixel alone. A new picture.
 */
export function crumble(px: Px, gone: number): Px {
  if (gone <= 0) return px;
  const { w, h } = px;
  const out = new Px(w, h);
  if (gone >= 1) return out;
  const { d, most } = depthIn(px);
  const at = front(gone);
  const keep = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (d[i] < 0) continue;
      const v = crumbleAt(x, y, d[i], most);
      if (v < at - BAND) continue;
      keep[i] = v < at - BAND * 0.55 ? 3 : v < at ? 2 : 1;
    }
  }
  // (none left alone: a solid pixel with no solid one beside it goes (its edge of light does not count), and over again
  // until none is, as each going may leave another alone)
  const solidAt = (i: number): boolean => keep[i] > 1 || (keep[i] === 1 && px.d[i * 4 + 3] === 255);
  for (let pass = 0, changed = true; changed && pass < 6; pass++) {
    changed = false;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!keep[i]) continue;
        const n = (xx: number, yy: number): boolean => xx >= 0 && yy >= 0 && xx < w && yy < h && solidAt(yy * w + xx);
        if (!n(x - 1, y) && !n(x + 1, y) && !n(x, y - 1) && !n(x, y + 1)) {
          keep[i] = 0;
          changed = true;
        }
      }
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const k = keep[i];
      if (!k) continue;
      if (k === 1) {
        for (let c = 0; c < 4; c++) out.d[i * 4 + c] = px.d[i * 4 + c];
      } else if (k === 2) {
        // (its fire at the front of it, dying as it eats in)
        out.set(x, y, HELL[noise2(x * 0.4, y * 0.4) > 0.55 ? 2 : 1]);
      } else {
        out.set(x, y, ASH[noise2(x * 0.6 + 5, y * 0.6) > 0.5 ? 1 : 2]);
      }
    }
  }
  return out;
}
/** The pixels at the crumbling's front at a moment (its burning band): where its ash, embers and smoke come off it. */
export function bandOf(px: Px, gone: number): [number, number][] {
  if (gone <= 0 || gone >= 1) return [];
  const { w, h } = px;
  const { d, most } = depthIn(px);
  const at = front(gone);
  const out: [number, number][] = [];
  for (let y = 0; y < h; y += 2) {
    for (let x = 0; x < w; x += 2) {
      const i = y * w + x;
      if (d[i] < 0) continue;
      const v = crumbleAt(x, y, d[i], most);
      if (v >= at - BAND && v < at) out.push([x, y]);
    }
  }
  return out;
}

/** Something come off it: where on the scene, when (frames), which. */
export interface Shed {
  x: number;
  y: number;
  f: number;
  k: number;
}
/**
 * WHAT COMES OFF IT AS IT CRUMBLES, at frame `f` (each shed piece where and when it came off its burning front): flakes of
 * grey ash drifting down and settling on the floor round it; cyan embers rising and dying; its smoke rolling up and
 * thinning. And the smoke off his demon arm (`arm`: where its claws and forearm are on the scene, how hot it smokes).
 */
export function returnLight(shed: Shed[], f: number, t: number, arm: { claw: [number, number]; fore: [number, number]; heat: number } | null): Px {
  const out = new Px(RETURN_SCENE.w, RETURN_SCENE.h);
  const l = new Light();
  const sm = new Light();
  const ash = new Light();
  const floor = RETURN_SCENE.ay;
  for (const s of shed) {
    const a = f - s.f;
    if (a < 0) continue;
    const kind = hash(s.k * 3 + 1);
    if (kind < 0.25) {
      // (its smoke, rolling up off it and thinning)
      if (a > 30) continue;
      const r = 6 + a * 0.7;
      cloud(sm, s.x + Math.sin(a * 0.2 + s.k) * 3, s.y - a * 1.1 + r * 0.4, 2 * r, 1.7 * r, t + s.k, Math.min(1, 0.15 + a / 30), 300 + s.k);
    } else if (kind < 0.42) {
      // (an ember, rising and dying)
      if (a > 14) continue;
      const x = s.x + Math.sin(a * 0.5 + s.k) * 2.5;
      const y = s.y - a * (1.2 + hash(s.k) * 0.8);
      const e = a < 5 ? 2 : 1;
      l.put(x, y, e);
      l.put(x, y - 1, e);
    } else {
      // (a flake of ash, drifting down and settling where it lands, flat on the floor: a speck of it left there)
      const land = floor - 18 + hash(s.k * 7) * 34;
      const fall = 0.35 * a + 0.035 * a * a;
      const y = Math.min(land, s.y + fall);
      const x = s.x + (y < land ? Math.sin(a * 0.35 + s.k) * 2.2 : Math.sin(((land - s.y) / 0.6) * 0.35 + s.k) * 2.2) + (hash(s.k * 5) - 0.5) * a * 0.3;
      const c = hash(s.k * 11) < 0.5 ? 1 : 2;
      ash.put(x, y, c);
      ash.put(x + 1, y, y < land ? c : c - 1);
    }
  }
  // (HIS DEMON ARM SMOKING: thin wisps of its black smoke curling up off its claws and forearm, up off it, not over it)
  if (arm && arm.heat > 0) {
    wisps(sm, l, arm.claw[0], arm.claw[1] - 3, t, arm.heat, 91);
    wisps(sm, l, arm.fore[0], arm.fore[1] - 3, t + 0.4, arm.heat * 0.7, 92);
  }
  sm.lay(out, SMOKE);
  ash.lay(out, ASH);
  l.lay(out);
  return out;
}
/** Wisps of smoke curling up from (`x`, `y`): thin at their roots, wider and fainter as they rise, torn by the air; an ember now and then. */
function wisps(sm: Light, l: Light, x: number, y: number, t: number, heat: number, seed: number): void {
  for (let k = 0; k < 3; k++) {
    const tall = (16 + 10 * hash(seed + k)) * heat;
    const x0 = x + (k - 1) * 3;
    for (let h = 0; h < tall; h++) {
      // (curling: a lazy wave up it, travelling up, growing as it rises; torn into gaps)
      const cx = x0 + Math.sin(h * 0.22 - t * 4.5 + k * 2.1) * (1 + h * 0.18);
      if (noise2(h * 0.25 - t * 3 + k * 5, seed + k) < 0.32 + (h / tall) * 0.3) continue;
      const wide = h < tall * 0.35 ? 1 : 2;
      const c = h < tall * 0.3 ? 0 : h < tall * 0.6 ? 1 : 2;
      for (let w = 0; w < wide; w++) {
        sm.put(cx + w, y - h, c);
        sm.put(cx + w, y - h - 1, c);
      }
    }
    if (hash(seed * 3 + k + Math.floor(t * 4)) < 0.3 * heat) {
      const ey = y - ((t * 30 + k * 7) % tall);
      l.put(x0 + 1, ey, 1);
      l.put(x0 + 1, ey - 1, 1);
    }
  }
}
/** Where a point of his (his own space) is on the scene. */
export function onReturn(p: V3, view: GameView): [number, number] {
  const s = project(p, view === 'back' ? 'rear' : view);
  return [RETURN_SCENE.ax + s[0], RETURN_SCENE.ay + s[1]];
}
