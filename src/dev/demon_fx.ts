// WHAT THE DEMON'S CLAWS LEAVE (the art chat, 27 Oct 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// Its claw rake (dev/demon_moves.ts rakeMove; his pick, “Alternating rakes (Recommended)”): the strike is a flash (his
// rulebook's Movement 9, big wind-up, lightning strike), so what is seen of it is what it leaves: four streaks of its cyan
// hellfire in the air, one off each talon, along the arc it raked, burning out from their tails; where it lands, a burst of
// flecks and four gashes of fire across the one it hit, which glow and die; and that one cursed from then on (his word, 25
// Oct, “So I think the tap claw rake has to apply the curse as well”): seeping black smoke and cyan embers, as the warlock's
// curse leaves them (dev/warlock_fx.ts smolder).

import { project } from '../art/skeleton';
import type { Posed, V3 } from '../art/skeleton';
import type { GameView } from '../art/skin';
import { Px } from '../engine/px';
import { Sculpt } from './sculpt';
import { DEMON_B, GROWN, RIG_CANVAS, demonInto } from './sculpt_demon_rig';
import { solve } from '../art/skeleton';
import { DAMN_HIT, DM, FR, RK, demonPose } from './demon_moves';
import type { DemonMove } from './demon_moves';
import { Light, SMOKE, TARGET_BOX, TICK, burn, burst, smolder } from './warlock_fx';
import { fireAt } from './sculpt_warlock';

/** How far ahead of it the one it rakes stands (its own measure: within a claw's reach). */
export const RAKE_REACH = 80;
/** ... and a little to its right (nearer the eye in front: clear of its head, which hangs before it). */
export const RAKE_ASIDE = -6;
/** How long a streak burns after the strike, and a gash on the one it hit. */
const STREAK_LIFE = 0.28;
const GASH_LIFE = 0.75;

/** Where a point of it (its own space, turned `turn` on the spot) is on its picture (RIG_CANVAS). */
export function onRig(p: V3, view: GameView, turn = 0): [number, number] {
  const a = (turn * Math.PI) / 180;
  const q: V3 = [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
  const s = project(q, view === 'back' ? 'rear' : view);
  return [RIG_CANVAS.ax + s[0], RIG_CANVAS.ay + s[1]];
}
/** Where the one it rakes stands on its picture (the floor under it). */
export function rakeFoot(view: GameView, turn = 0): [number, number] {
  return onRig([RAKE_REACH, RAKE_ASIDE, 0], view, turn);
}

/** Its raking claw's talon tips at a moment (its own space, unturned). */
function talonsAt(m: DemonMove, t: number): V3[] {
  if (!m.rake) return [];
  const sc = new Sculpt();
  const s = solve(DEMON_B, demonPose(m.motion, t) as Posed);
  return demonInto(sc, s, 'front', 0, { rake: { side: m.rake.side } }, 1, GROWN, { spread: 1, beat: 0, sweep: 0, tip: 0, flex: 0, wind: 0, phase: 0 }).talons;
}
/** How finely its talons' way is followed through the swing: samples to a frame. */
const STEPS = 8;
const PATHS = new Map<DemonMove, { t: number; tips: V3[] }[]>();
/** Each moment of the swing, from where it held to where it landed, and where its talons' tips were then: the way they went. */
function pathOf(m: DemonMove): { t: number; tips: V3[] }[] {
  let p = PATHS.get(m);
  if (!p) {
    p = [];
    for (let f = RK.held * STEPS; f <= RK.hit * STEPS; f++) {
      const t = (f / STEPS) * FR;
      p.push({ t, tips: talonsAt(m, t) });
    }
    PATHS.set(m, p);
  }
  return p;
}
const hash = (i: number): number => {
  const x = Math.sin(i * 91.7 + 17.3) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * THE RAKE'S LIGHT AT A MOMENT of a rake (`m`), and of every rake before it on the same one (`hits`: when each before it
 * landed, for its curse and its gashes): the streaks off its talons, the burst and the gashes where it lands, the one it hit
 * smoldering from then on. On a picture the demon's size (RIG_CANVAS), clear but for them.
 */
export function rakeLight(m: DemonMove, t: number, view: GameView, turn = 0, before: { m: DemonMove; at: number }[] = []): Px {
  const out = new Px(RIG_CANVAS.w, RIG_CANVAS.h);
  const l = new Light();
  const sm = new Light();
  const [gx, gy] = rakeFoot(view, turn);
  const strikes = [...before, { m, at: 0 }];
  // (cursed from the first that landed: smoldering, each new rake flaring it)
  const first = strikes.map((s) => s.at + (s.m.hit ?? 0)).filter((h) => h <= t + strikes[strikes.length - 1].at);
  for (const s of strikes) {
    const r = s.m;
    if (!r.rake || r.hit === undefined) continue;
    const local = t - s.at;
    const hit = r.hit;
    const held = RK.held * FR;
    // THE STREAKS, one off each talon, along the way it truly went, its head on the talon's tip as it rakes (his word of the
    // first rakes, 27 Oct, “The cyan streaks should follow the claws”), burning out from their tails once it has landed
    if (local > held && local < hit + STREAK_LIFE) {
      const path = pathOf(r).filter((p) => p.t <= local + 1e-6);
      const gone = Math.max(0, (local - hit) / STREAK_LIFE);
      const n = path.length;
      for (let k = 0; k < (path[0]?.tips.length ?? 0); k++) {
        const pts = path.map((p) => onRig(p.tips[k], view, turn));
        for (let i = 1; i < n; i++) {
          // (how far back along it from its head: hottest at the head, cooler behind; its tail burning out first)
          const back = (n - 1 - i) / Math.max(1, n - 1);
          if (back > 1 - gone) continue;
          const heat = back < 0.2 && gone < 0.4 ? 3 : back < 0.5 ? 2 : back < 0.85 ? 1 : 0;
          const [x0, y0] = pts[i - 1];
          const [x1, y1] = pts[i];
          const len = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
          for (let j = 0; j <= len; j++) {
            const x = x0 + ((x1 - x0) * j) / len;
            const y = y0 + ((y1 - y0) * j) / len;
            l.put(x, y, heat);
            l.put(x + 1, y, Math.max(0, heat - 1));
            l.put(x, y + 1, Math.max(0, heat - 1));
          }
        }
      }
    }
    if (local >= hit) {
      const since = local - hit;
      // THE BURST where it lands, at its chest
      if (since < 0.25) burst(l, gx, gy - TARGET_BOX.h * 0.55, 4 + since * 44, since / 0.25, 7 + Math.round(s.at * 10));
      // THE GASHES: four of fire across it, the way the claw raked (from its far side down to its near), glowing and dying
      if (since < GASH_LIFE) {
        // (the way the claw swept as it landed, on the picture)
        const path = pathOf(r);
        const a = onRig(path[Math.max(0, path.length - 5)].tips[1], view, turn);
        const b = onRig(path[path.length - 1].tips[1], view, turn);
        const dl = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
        const [dx, dy] = [(b[0] - a[0]) / dl, (b[1] - a[1]) / dl];
        for (let g = 0; g < 4; g++) {
          // (four of them, side by side across the way it swept)
          const cx = gx - dy * (g - 1.5) * 3.5 + (hash(g + s.at) - 0.5) * 2;
          const cy = gy - TARGET_BOX.h * 0.55 + dx * (g - 1.5) * 3.5;
          const len = 18 - Math.abs(g - 1.5) * 2;
          for (let i = 0; i <= len; i++) {
            const u = i / len - 0.5;
            const x = cx + u * len * dx;
            const y = cy + u * len * dy;
            const k2 = since < 0.12 ? 3 : since < 0.3 ? 2 : since < 0.55 ? 1 : 0;
            l.put(x, y, k2);
            l.put(x + 1, y, Math.max(0, k2 - 1));
          }
        }
      }
    }
  }
  if (first.length) {
    const since = t - Math.min(...strikes.map((s) => s.at + (s.m.hit ?? 0)));
    if (since > 0.08) smolder(l, sm, gx, gy, TARGET_BOX.w, TARGET_BOX.h, t, Math.min(1, (since - 0.08) / 0.3), 3);
  }
  sm.lay(out, SMOKE);
  l.lay(out);
  return out;
}

// ---------------------------------------------------------------------------------------------
// DAMNING, TORN UP (dev/demon_moves.ts damningMove). His word of the first (it reared and slammed down, and chains of fire
// hauled its foes under the floor), 27 Oct: “Nope.  Uh you can’t just take the enemies away, what if it doesn’t do enough
// damage to kill them?  And that animation is bad anyway.  Gonna have to go back to the drawing board for DAMN.  What were
// the other options for possible attacks?”; then “Cash-in eruption (Recommended)”; what was worst of the first, “The
// rear-up and slam (Recommended),The effects”; its move, “Tear it up (Recommended)”; and “Again, follow the rules, this is
// a character”. So, as the rules have it:
//   ITS CLAWS BITE INTO THE FLOOR: as they drive in, chips of the flagstones kick up and jagged cracks split out round each,
//   glowing with its cyan hellfire; as it heaves against them the cracks run further and glow hotter, embers rising off them.
//   IT RIPS THEM UP: the floor torn up with them, chunks of flagstone flung up and falling back, its fire bursting out of the
//   holes they leave, which glow and cool to scorched pits.
//   AND THE GROUND BURSTS UNDER EVERY ONE CURSED OR BURNING, all their burns at once (his design, 25 Oct: the curse cashed
//   in): the floor under each breaks open in a star of cracks and a jet of its hellfire roars up out of it, flagstones flung
//   out; every burn on it flares at once; it flashes (Hits 3, every hit shows) and is thrown up and back, a scrap of its robe
//   and a little blood flying off it (Hits 4, what flies off is the monster's); it lands, rocked (Hits 3), and stands there,
//   smoldering; or, if that was enough to kill it, it dies in the blast and its robe crumples empty (Hits 5): the game's own
//   death of it. Nothing of it vanishes. All of it in real shapes (How art is made 9): flames, broken stone, torn cloth.

/** The scene: room round the demon's picture (placed at `ox`, `oy`) for the ones it damns, ahead of it. */
export const DAMN_SCENE = { w: 480, h: 470, ox: 20, oy: 56 };
/**
 * The ones it damns: where each stands (its own measure, forward and to its left), all cursed (seeping its smoke); the
 * middle one burning too, which is enough to kill it when it all goes off at once; the others live through it.
 */
export const DAMN_TARGETS: readonly { x: number; y: number; burning: boolean; dies: boolean }[] = [
  { x: 128, y: -66, burning: false, dies: false },
  { x: 150, y: 0, burning: true, dies: true },
  { x: 74, y: 118, burning: false, dies: false },
];
/**
 * HOW THEY ARE THROWN (frames at thirty a second from the blow): held in its flash through the freeze (Movement 6); then
 * up and back, through the air for `flight`; how far back (its own measure) in the air and skidding as it lands, how high
 * (pixels), how far it is rocked back (degrees).
 */
export const KNOCK = { from: 2, flight: 10, back: 13, skid: 3, skidFor: 4, high: 26, tilt: 22 };
/** How fast what is flung falls (its own measure, a frame, a frame). */
export const FALL = 1.1;
/** The colours of what is not light: the dark of a pit or a crack; the floor's stone (art/mkit.ts RIM_STONE), dark to lit; the cultist's robe; its blood, darker than the game's (art/mkit.ts BLOOD), clear of the pink that is the enemy's glow. */
export const STUFF = ['#07050a', '#2a2331', '#3a3040', '#655868', '#857888', '#1c0c34', '#3a1a5c', '#643a8c', '#4a0c24', '#8a1020', '#b8202c'];
export const PIT = 0;
export const STONE = 1;
export const ROBE = 5;
export const BLOOD = 8;
/** Where a point (its own measure, `z` up) is on a scene's picture. */
export type ToScene = (p: V3) => [number, number];
/** What it lays down: its claws' cracks and holes, and the ground broken under the ones it damned. */
export type Crack = { pts: [number, number][]; u0: number; wide: boolean };

const turned = (p: V3, turn: number): V3 => {
  const a = (turn * Math.PI) / 180;
  return [p[0] * Math.cos(a) - p[1] * Math.sin(a), p[0] * Math.sin(a) + p[1] * Math.cos(a), p[2]];
};
/** Where a point (its own measure, `z` up) is in the scene. */
export function inScene(p: V3, view: GameView, turn = 0): [number, number] {
  const [x, y] = onRig(p, view, turn);
  return [x + DAMN_SCENE.ox, y + DAMN_SCENE.oy];
}
/** How near the eye a point is (more is nearer): what is nearer is laid over what is further. */
export function nearEye(p: V3, view: GameView, turn = 0): number {
  return project(turned(p, turn), view === 'back' ? 'rear' : view)[2];
}

/** Where its claws bite into the floor (its own measure): under each, as it drives them down. */
const DIGS = new Map<DemonMove, V3[]>();
export function digSpots(m: DemonMove): V3[] {
  let d = DIGS.get(m);
  if (!d) {
    const s = solve(DEMON_B, demonPose(m.motion, DM.dig * FR) as Posed);
    d = [s.handL as V3, s.handR as V3].map((h) => [h[0] + 4, h[1], 0] as V3);
    DIGS.set(m, d);
  }
  return d;
}

/** A star of jagged cracks split out from round (`cx`, `cy`) on the floor (its own measure): `n` of them, about `len` long, from `r0` out; and forks off them. */
export function crackStar(cx: number, cy: number, n: number, len: number, r0: number, seed: number): Crack[] {
  const out: Crack[] = [];
  for (let i = 0; i < n; i++) {
    let a = ((i + 0.6 * hash(seed + i * 7)) / n) * Math.PI * 2;
    const L = len * (0.55 + 0.6 * hash(seed * 3 + i));
    let x = cx + Math.cos(a) * r0;
    let y = cy + Math.sin(a) * r0;
    const pts: [number, number][] = [[x, y]];
    for (let d = 0, k = 0; d < L; d += 2.2, k++) {
      // (each step turned a little, sharply: a crack runs jagged, not in a line or a curve)
      a += (hash(seed * 7 + i * 13 + k) - 0.5) * 1.15;
      x += Math.cos(a) * 2.2;
      y += Math.sin(a) * 2.2;
      pts.push([x, y]);
    }
    out.push({ pts, u0: 0, wide: true });
    // (a fork off it, shorter, splitting off as it runs past)
    if (hash(seed * 11 + i) < 0.7 && pts.length > 5) {
      const j = Math.floor((pts.length - 1) * (0.3 + 0.35 * hash(seed + i * 5)));
      const [px, py] = pts[j];
      const [qx, qy] = pts[j - 1];
      let b = Math.atan2(py - qy, px - qx) + (hash(seed * 13 + i) < 0.5 ? -1 : 1) * (0.6 + 0.4 * hash(seed * 17 + i));
      let fx = px;
      let fy = py;
      const fork: [number, number][] = [[fx, fy]];
      const FL = (L - (j * 2.2)) * (0.45 + 0.3 * hash(seed * 19 + i));
      for (let d = 0, k = 0; d < FL; d += 2.2, k++) {
        b += (hash(seed * 23 + i * 7 + k) - 0.5) * 1.1;
        fx += Math.cos(b) * 2.2;
        fy += Math.sin(b) * 2.2;
        fork.push([fx, fy]);
      }
      out.push({ pts: fork, u0: j / (pts.length - 1), wide: false });
    }
  }
  return out;
}

/**
 * A crack drawn on the floor (`dark`), run out as far as `g` (0 to 1) of its star's reach, glowing (`glow`) as hot as
 * `heat` (its fire's heat, 0 dim to 3 white; less out along it; none below 0): wider at its root, the dark of it under the glow.
 */
export function drawCrack(dark: Light, glow: Light, c: Crack, g: number, heat: number, S: ToScene): void {
  const v = (g - c.u0) / (1 - c.u0);
  if (v <= 0) return;
  const n = c.pts.length - 1;
  const upto = Math.min(1, v) * n;
  for (let i = 0; i < Math.ceil(upto - 1e-9); i++) {
    const f = Math.min(1, upto - i);
    const a = S([c.pts[i][0], c.pts[i][1], 0]);
    const e = S([c.pts[i + 1][0], c.pts[i + 1][1], 0]);
    const b: [number, number] = [a[0] + (e[0] - a[0]) * f, a[1] + (e[1] - a[1]) * f];
    // (how far out along it, as a share of its star's reach: hottest and widest at its root)
    const u = c.u0 + (1 - c.u0) * ((i + f * 0.5) / n);
    const wide = c.wide && u < 0.45;
    const k = Math.round(Math.min(heat, u < 0.08 ? heat : 2.4) - u * 1.7);
    const len = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1])));
    for (let j = 0; j <= len; j++) {
      const x = Math.round(a[0] + ((b[0] - a[0]) * j) / len);
      const y = Math.round(a[1] + ((b[1] - a[1]) * j) / len);
      dark.put(x, y, PIT);
      if (wide) dark.put(x, y + 1, PIT);
      if (k >= 0) {
        glow.put(x, y, Math.min(3, k));
        if (wide) glow.put(x, y + 1, Math.max(0, Math.min(3, k) - 1));
      }
    }
  }
}

/** A jagged outline round (`cx`, `cy`) on the floor (its own measure), about `r` across: a hole torn in it. */
function holeShape(cx: number, cy: number, r: number, seed: number): [number, number][] {
  const n = 11;
  return Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + (hash(seed + i) - 0.5) * 0.4;
    const rr = r * (0.6 + 0.6 * hash(seed * 5 + i * 3));
    return [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr] as [number, number];
  });
}
const inside = (x: number, y: number, poly: [number, number][]): boolean => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
/** A hole torn in the floor: its pit, its broken lip of stone, its rim glowing as hot as `heat` (none below 0). */
export function drawHole(dark: Light, glow: Light, cx: number, cy: number, r: number, heat: number, seed: number, S: ToScene): void {
  const poly = holeShape(cx, cy, r, seed).map(([x, y]) => S([x, y, 0]));
  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) {
    for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
      if (!inside(x + 0.5, y + 0.5, poly)) continue;
      const edge = !inside(x + 1.5, y + 0.5, poly) || !inside(x - 0.5, y + 0.5, poly) || !inside(x + 0.5, y + 1.5, poly) || !inside(x + 0.5, y - 0.5, poly);
      // (its lip: the broken edge of the flagstones, lit on its far side, where the eye sees down onto it; its near side in shadow)
      const far = y < cy && inside(x + 0.5, y + 2.5, poly);
      dark.put(x, y, edge ? (far ? STONE + 2 : STONE) : PIT);
      if (heat >= 0 && edge) glow.put(x, y, Math.min(3, Math.round(heat - (hash(x * 7 + y * 13 + seed) < 0.3 ? 1 : 0))));
      // (deep in it, now and then, the fire's own glow, dimmer)
      else if (heat >= 2.5 && !edge && hash(x * 3 + y * 11 + seed) < 0.15) glow.put(x, y, Math.min(3, Math.round(heat - 2)));
    }
  }
}

/** A JET of its hellfire, out of a hole at (`gx`, `gy`) on the picture: its own fire's shape, nothing of it below the hole's near lip (`lip`). */
export function jet(l: Light, gx: number, gy: number, size: number, t: number, lean: number, lip: number): void {
  if (size < 0.8) return;
  const H = Math.round(size * 3.3);
  const reach = Math.ceil(size * 1.5 * 1.6 + Math.abs(lean) * H * 1.3);
  for (let yy = -Math.round(H * 1.25); yy <= Math.ceil(size * 1.5); yy++) {
    if (gy + yy > lip) break;
    for (let x = -reach; x <= reach; x++) {
      const k = fireAt(x, yy, size, t, lean);
      if (k >= 0) l.put(gx + x, gy + yy, k);
    }
  }
}

/** A thing flung: from `p` (its own measure) going `v` a frame; where it is `s` frames on, falling (FALL), and lying where it lands. */
export function flung(p: V3, v: V3, s: number): { at: V3; landed: boolean } {
  // (when it lands: when it comes down to the floor)
  const tl = (v[2] + Math.sqrt(v[2] * v[2] + 2 * FALL * p[2])) / FALL;
  const u = Math.min(s, tl);
  return { at: [p[0] + v[0] * u, p[1] + v[1] * u, Math.max(0, p[2] + v[2] * u - (FALL * u * u) / 2)], landed: s >= tl };
}
/**
 * A CHUNK OF FLAGSTONE at (`cx`, `cy`) on the picture, about `r` across, turned `a`: broken, its faces lit from above and
 * shadowed below, its dark edge; its underside lit cyan by the fire under it as hot as `lit` (none below 1).
 */
export function chunk(st: Light, l: Light, cx: number, cy: number, r: number, a: number, seed: number, lit: number): void {
  const n = 6;
  const poly: [number, number][] = Array.from({ length: n }, (_, i) => {
    const b = a + (i / n) * Math.PI * 2 + (hash(seed + i) - 0.5) * 0.5;
    const rr = r * (0.7 + 0.5 * hash(seed * 3 + i));
    return [cx + Math.cos(b) * rr, cy + Math.sin(b) * rr * 0.85];
  });
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r + 1); y++) {
    for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r + 1); x++) {
      if (!inside(x + 0.5, y + 0.5, poly)) continue;
      const dx = (x + 0.5 - cx) / r;
      const dy = (y + 0.5 - cy) / r;
      const edge = r >= 2 && (!inside(x + 1.5, y + 0.5, poly) || !inside(x - 0.5, y + 0.5, poly) || !inside(x + 0.5, y + 1.5, poly) || !inside(x + 0.5, y - 0.5, poly));
      const sun = -0.6 * dx - 0.8 * dy;
      st.put(x, y, edge ? (sun > 0.5 ? STONE + 2 : STONE) : sun > 0.3 ? STONE + 3 : sun < -0.3 ? STONE + 1 : STONE + 2);
      if (lit >= 1 && dy > 0.25 && (edge || r < 2)) l.put(x, y, Math.min(2, Math.round(lit - 1)));
    }
  }
  // (never less than two pixels: a chip, not a speck)
  st.put(Math.round(cx), Math.round(cy), STONE + 2);
  st.put(Math.round(cx) + 1, Math.round(cy), STONE + 1);
}

/** Embers off a crack or a hole: cyan sparks rising, each two pixels long, `heat` 0 none to 1. */
export function embers(l: Light, pts: [number, number][], t: number, heat: number, seed: number): void {
  if (heat <= 0) return;
  pts.forEach(([x0, y0], i) => {
    const k = seed * 31 + i * 7;
    const ph = (((t * (1.1 + 0.6 * hash(k)) + hash(k + 1)) % 1) + 1) % 1;
    if (ph > 0.9 || hash(k + 2) > heat) return;
    const x = x0 + Math.sin(ph * 7 + i) * 2.2;
    const y = y0 - ph * (18 + 10 * hash(k + 3));
    const e = ph < 0.35 ? 2 : 1;
    l.put(x, y, e);
    l.put(x, y - 1, e);
  });
}

/** A dust of the floor kicked up along it, from (`cx`, `cy`) on the picture, `s` frames on: puffs rolling out to either side and thinning. */
export function dust(sm: Light, cx: number, cy: number, s: number, seed: number): void {
  if (s < 0 || s > 9) return;
  for (let i = 0; i < 6; i++) {
    const side = i % 2 ? 1 : -1;
    const go = (1 - Math.pow(1 - s / 9, 2)) * (8 + 7 * hash(seed + i));
    const x = cx + side * (3 + go);
    const y = cy - 1 - s * 0.5 * hash(seed * 3 + i);
    const r = 1.6 + s * 0.22;
    for (let yy = Math.floor(y - r); yy <= Math.ceil(y + r); yy++) {
      for (let xx = Math.floor(x - r * 1.3); xx <= Math.ceil(x + r * 1.3); xx++) {
        const d = Math.hypot((xx - x) / 1.3, yy - y) / r + (hash(xx * 7 + yy * 3 + i) - 0.5) * 0.5;
        if (d > 1 || s / 9 > 1 - 0.5 * d) continue;
        sm.put(xx, yy, d < 0.5 ? 2 : 3);
      }
    }
  }
}

/** Frames from the blow (its claws ripped up; the ground bursting), at a moment `t` of the move. */
const fromBlow = (t: number): number => Math.round(((t - DAMN_HIT) / FR) * 1000) / 1000;

/**
 * WHERE ONE IT DAMNS IS AT A MOMENT, and how: its floor point in the scene, how far it is lifted off it (pixels), how far
 * it is rocked back (radians: its head away from the demon), whether it is in its flash, and, for the one it kills, how
 * long (seconds) it has been dying (its own death: the robe crumpling empty).
 */
export interface Damned {
  gx: number;
  gy: number;
  lift: number;
  tilt: number;
  flash: boolean;
  dying?: number;
  near: number;
}
export function damnedAt(i: number, t: number, view: GameView, turn = 0): Damned {
  const p = DAMN_TARGETS[i];
  const f = fromBlow(t);
  // (thrown straight away from where its claws tore the floor)
  const ax = p.x - 30;
  const ay = p.y;
  const al = Math.hypot(ax, ay);
  const s = f - KNOCK.from;
  const air = Math.max(0, Math.min(KNOCK.flight, s));
  const skid = Math.max(0, Math.min(KNOCK.skidFor, s - KNOCK.flight)) / KNOCK.skidFor;
  const back = s <= 0 ? 0 : (KNOCK.back * air) / KNOCK.flight + KNOCK.skid * (1 - (1 - skid) * (1 - skid));
  const at: V3 = [p.x + (ax / al) * back, p.y + (ay / al) * back, 0];
  const [gx, gy] = inScene(at, view, turn);
  // (up and down again as a thing thrown falls)
  const u = air / KNOCK.flight;
  const lift = s > 0 && s < KNOCK.flight ? 4 * KNOCK.high * u * (1 - u) : 0;
  // (rocked back as it is thrown; rocking forward and back as it lands, and still)
  const away = Math.sign(inScene([p.x + ax / al, p.y + ay / al, 0], view, turn)[0] - inScene([p.x, p.y, 0], view, turn)[0]) || 1;
  const T = (KNOCK.tilt * Math.PI) / 180;
  let tilt = 0;
  if (s > 0 && s <= KNOCK.flight) tilt = T * (1 - Math.exp(-s / 2));
  else if (s > KNOCK.flight) {
    const w = s - KNOCK.flight;
    tilt = T * (1 - Math.exp(-KNOCK.flight / 2)) * Math.exp(-w / 2) * Math.cos(w * 0.9);
  }
  // (the one it kills: lifeless as it is thrown, its robe already giving way, and crumpling as it lands)
  const dying = p.dies && s > 0 ? s * FR : undefined;
  return { gx, gy, lift, tilt: tilt * away, flash: f >= 0 && f < KNOCK.from, dying, near: nearEye(at, view, turn) };
}

/** Each one it damns' own light: what is behind it (the jet out of the ground under it) and over it (its burns, its smoke, what flies off it). */
export interface DamnedLight {
  under: Px;
  over: Px;
}
/** All of Damning's light at a moment: what is on the floor (under everything), what is at its claws (with them), each one it damns'. */
export interface DamningLight {
  floor: Px;
  claws: Px;
  clawsNear: number;
  damned: DamnedLight[];
}

/** THE LIGHT OF DAMNING at a moment `t` of its move (`m`): see above. On a scene round its picture (DAMN_SCENE). */
export function damningLight(m: DemonMove, t: number, view: GameView, turn = 0): DamningLight {
  const W = DAMN_SCENE.w;
  const H = DAMN_SCENE.h;
  const f = fromBlow(t);
  const fm = t / FR;
  const S = (p: V3): [number, number] => inScene(p, view, turn);

  // ---- ON THE FLOOR: the cracks round its claws, the holes it tore, the ground broken under each one damned; and what
  // has fallen and lies there
  const fd = new Light();
  const fl = new Light();
  const fsm = new Light();
  const digs = digSpots(m);
  // (its claws' cracks: run out as they bite, further as it heaves, as hot as its fire is built up; a flash as it rips them
  // up; cooling to dark)
  const dug = fm - DM.dig;
  const strain = Math.max(0, Math.min(1, (fm - DM.strain) / (DM.held - DM.strain)));
  const runOut = dug < 0 ? 0 : 0.35 * (1 - Math.pow(1 - Math.min(1, dug / 2), 2)) + 0.65 * (1 - Math.pow(1 - strain, 2));
  const clawHeat =
    dug < 0 ? -1
    : dug < 1 ? 3
    : f < 0 ? 1.5 + 1.3 * strain + 0.35 * Math.sin(fm * 1.7) * strain
    : f < 2 ? 3.4
    : 3 - (f - 2) / 6;
  digs.forEach((d, c) => {
    const stars = crackStar(d[0], d[1], 7, 40, 3, 40 + c * 17);
    for (const k of stars) drawCrack(fd, fl, k, runOut, clawHeat, S);
    // (the holes it tears as it rips its claws up)
    if (f >= 0) drawHole(fd, fl, d[0] + 1, d[1], 7, f < 3 ? 3.4 : 3 - (f - 3) / 7, 70 + c, S);
    // (embers rising off the cracks as it strains)
    if (f < 0 && dug > 2) embers(fl, stars.slice(0, 6).map((k) => S([...k.pts[Math.floor(k.pts.length * 0.5)], 0] as V3)), t, 0.3 + 0.7 * strain, 90 + c);
  });
  // (the ground broken open under each it damned: a star of cracks and a hole)
  DAMN_TARGETS.forEach((p, i) => {
    if (f < 0) return;
    const g = Math.min(1, 0.5 + f * 0.25);
    const heat = f < KNOCK.from ? 3.4 : 3 - (f - KNOCK.from) / 9;
    for (const k of crackStar(p.x, p.y, 8, 30, 9, 300 + i * 23)) drawCrack(fd, fl, k, g, heat, S);
    drawHole(fd, fl, p.x, p.y, 12, f < 3 ? 3.4 : 3 - (f - 3) / 8, 200 + i, S);
  });

  // ---- AT ITS CLAWS: chips kicked up as they bite; as it rips them up, stone flung up and its fire bursting out of the holes
  const cl = new Light();
  const cs = new Light();
  const csm = new Light();
  digs.forEach((d, c) => {
    // (chips of flagstone kicked up as its claws drive in)
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2 + hash(c * 9 + j);
      const v: V3 = [Math.cos(a) * (0.5 + 0.5 * hash(j + c)), Math.sin(a) * (0.5 + 0.5 * hash(j * 3 + c)), 2.6 + 1.6 * hash(j * 5 + c)];
      if (dug < 0) break;
      const fly = flung([d[0], d[1], 1], v, dug);
      const [x, y] = S(fly.at);
      chunk(fly.landed ? fd : cs, cl, x, y, 1.2, j + c, 500 + c * 10 + j, 0);
    }
    if (f < 0) return;
    const [hx, hy] = S([d[0] + 1, d[1], 0]);
    // (its fire bursting up out of the hole after its claws, tongue after tongue of it flung up, and dying down in it)
    const size = f < 1 ? 4 : f < 4 ? 6 : Math.max(0, 6 - (f - 4) * 0.36);
    jet(cl, hx, hy - 1, size, t * 1.5 + c, 0, hy + 3);
    for (let k = 0; k < 9; k++) {
      const age = f - k * 0.6;
      const life = 7 + 4 * hash(c * 41 + k);
      if (age < 0 || age > life) continue;
      const rise = (7 + 3 * hash(c * 43 + k)) * age - 0.3 * age * age;
      const sz = (4 + 1.5 * hash(c * 47 + k)) * Math.min(1, (1 - age / life) * 1.6);
      jet(cl, hx + (k % 2 ? 1 : -1) * (2 + 6 * hash(c * 53 + k)), hy - 4 - rise, sz, t * 2 + k * 0.41 + c, 0, H);
    }
    if (f < 4) burst(cl, hx, hy - 8, 5 + f * 6, f / 4, 60 + c);
    if (f > 10) embers(cl, [[hx - 2, hy - 2], [hx + 2, hy - 1], [hx, hy - 3]], t, Math.max(0, 1 - (f - 10) / 30), 120 + c);
    // (stone torn up with its claws, flung up and falling back, lying where it lands)
    for (let j = 0; j < 7; j++) {
      const a = (hash(c * 31 + j) - 0.5) * 3.6;
      const sp = 0.6 + 1.3 * hash(c * 7 + j * 3);
      const v: V3 = [Math.cos(a) * sp, Math.sin(a) * sp + (c ? -0.3 : 0.3), 5.5 + 4.5 * hash(c * 5 + j * 11)];
      const fly = flung([d[0] + 1, d[1], 2], v, f);
      const [x, y] = S(fly.at);
      const r = 2 + 2 * hash(c * 13 + j);
      chunk(fly.landed ? fd : cs, cl, x, y, r, fly.landed ? j : j + f * (0.25 + 0.3 * hash(j)), 600 + c * 10 + j, fly.landed ? 0 : 3 - f / 7);
    }
    // (smoke rising out of the hole as it cools)
    if (f > 8) smolder(cl, csm, hx, hy + 2, 10, 4, t, Math.max(0, Math.min(1, (f - 8) / 6) * Math.min(1, 1 - (f - 30) / 40)), 7 + c);
  });

  // ---- EACH ONE DAMNED
  const damned: DamnedLight[] = DAMN_TARGETS.map((p, i) => {
    const ul = new Light();
    const ol = new Light();
    const os = new Light();
    const osm = new Light();
    const me = damnedAt(i, t, view, turn);
    const [hx, hy] = S([p.x, p.y, 0]);
    // (its body on the picture, as it is thrown: the middle of it; its feet)
    const fy = me.gy - me.lift;
    const h = TARGET_BOX.h * (me.dying !== undefined ? Math.max(0.25, 1 - me.dying * 0.9) : 1);
    // BEFORE: cursed, smoldering; the middle one burning too, each bite of its burn flaring it
    const cursed = f < 0 ? 1 : me.dying !== undefined ? Math.max(0, 1 - me.dying / 0.6) : 1;
    smolder(ol, osm, me.gx, fy, TARGET_BOX.w, h, t, cursed, i + 1);
    if (p.burning && f < 0) {
      const bite = ((t + i * 0.17) % TICK) / TICK;
      burn(ol, me.gx, fy, TARGET_BOX.w, h, t, 1 + 0.55 * Math.max(0, 1 - bite * 5));
    }
    if (f < 0) return { under: laid(W, H, new Light(), new Light(), ul), over: laid(W, H, osm, os, ol) };
    // THE GROUND ERUPTS under it: its hellfire roaring up out of the hole, tongue after tongue of it flung up, each its fire's
    // own shape, shrinking as it rises; the fire in the hole dying down after
    const lean = 0.1 * Math.sign(me.gx - hx || 1);
    const base = f < 1 ? 6 : f < 5 ? 10 : f < 17 ? 10 - (f - 5) * 0.58 : Math.max(0, 3 - (f - 17) * 0.15);
    jet(ul, hx, hy - 2, base, t * 1.7 + i, lean, hy + 4);
    for (let k = 0; k < 16; k++) {
      const born = k * 0.6;
      const age = f - born;
      const life = 10 + 5 * hash(i * 41 + k);
      if (age < 0 || age > life) continue;
      const v0 = 10 + 4 * hash(i * 43 + k);
      const rise = v0 * age - 0.3 * age * age;
      const size = (6 + 2.5 * hash(i * 47 + k)) * Math.min(1, (1 - age / life) * 1.6);
      jet(ul, hx + (k % 2 ? 1 : -1) * (5 + 13 * hash(i * 53 + k)) + lean * rise, hy - 6 - rise, size, t * 2 + k * 0.37 + i, lean, H);
    }
    // (the ground bursting: flecks flung out round it)
    if (f < 5) burst(ol, hx, hy - 30, 7 + f * 7, f / 5, 80 + i);
    // EVERY BURN ON IT GOES OFF AT ONCE: its fire flaring up all over it, and dying
    const flare = f < KNOCK.from ? 0 : Math.max(0, 1.3 - (f - KNOCK.from) * 0.2);
    if (flare > 0) burn(ol, me.gx, fy, TARGET_BOX.w, h, t * 1.3, flare * (p.burning ? 1.3 : 1));
    // AND AFTER: still cursed, smoldering the more for it (the one it killed, its smoke thinning away: what is dead does not glow)
    if (me.dying === undefined && f > KNOCK.from) smolder(ol, osm, me.gx, fy, TARGET_BOX.w, h, t + 0.37, Math.min(0.8, (f - KNOCK.from) / 10), i + 7);
    // (smoke out of the broken ground as it cools)
    if (f > 12) smolder(ul, osm, hx, hy + 2, 18, 4, t, Math.max(0, Math.min(1, (f - 12) / 8) * Math.min(1, 1 - (f - 40) / 40)), 20 + i);
    // (stone flung out of the broken ground)
    for (let j = 0; j < 6; j++) {
      const a = (j / 6) * Math.PI * 2 + hash(i * 17 + j);
      const sp = 0.8 + 1.4 * hash(i * 7 + j * 5);
      const fly = flung([p.x, p.y, 3], [Math.cos(a) * sp, Math.sin(a) * sp, 6.5 + 4 * hash(i * 3 + j * 13)], f);
      const [x, y] = S(fly.at);
      const r = 2 + 2.2 * hash(i * 11 + j);
      chunk(fly.landed ? fd : os, ol, x, y, r, fly.landed ? j : j + f * 0.35, 700 + i * 10 + j, fly.landed ? 0 : 3 - f / 7);
    }
    // WHAT FLIES OFF IT AS IT IS THROWN (Hits 4): a scrap of its robe, fluttering down; a little blood, falling, a small stain
    // where it lands that fades (Hits 1)
    const s = f - KNOCK.from;
    if (s >= 0) {
      const ax = p.x - 30;
      const al = Math.hypot(ax, p.y);
      const ux = ax / al;
      const uy = p.y / al;
      for (let j = 0; j < 2; j++) {
        const side = j ? 1 : -1;
        const sc = scrap([p.x, p.y, 34 + 6 * j], [ux * (1 + 0.4 * j) - uy * side * 0.5, uy * (1 + 0.4 * j) + ux * side * 0.5, 4.2 + j], s, i * 3 + j);
        const [x, y] = S(sc.at);
        rag(sc.landed ? fd : os, x, y, sc.a, sc.landed);
      }
      for (let j = 0; j < (p.dies ? 5 : 4); j++) {
        const side = (j % 2 ? 1 : -1) * (0.3 + 0.5 * hash(i * 5 + j));
        const b0: V3 = [p.x, p.y, 30 + 8 * hash(i + j * 3)];
        const bv: V3 = [ux * (1.2 + hash(j + i)) - uy * side, uy * (1.2 + hash(j * 2 + i)) + ux * side, 2.5 + 3 * hash(i * 9 + j)];
        const fly = flung(b0, bv, s);
        const [x, y] = S(fly.at);
        if (!fly.landed) {
          os.put(x, y, BLOOD + 1);
          os.put(x + 1, y, BLOOD + 1);
          os.put(x, y - 1, BLOOD + 2);
        } else {
          // (its stain: small, and drying away to nothing)
          const since = s - landedAt(b0, bv[2]);
          const w = since < 14 ? 3 : since < 26 ? 2 : since < 36 ? 1 : 0;
          for (let k = 0; k <= w && w > 0; k++) fd.put(x + k - 1, y, BLOOD);
          if (w >= 2) fd.put(x, y + 1, BLOOD);
        }
      }
      // (the dust of the floor kicked up as it lands)
      dust(osm, me.gx, me.gy, s - KNOCK.flight, 900 + i);
    }
    return { under: laid(W, H, new Light(), new Light(), ul), over: laid(W, H, osm, os, ol) };
  });
  const near = digs.map((d) => nearEye(d, view, turn));
  return {
    floor: laid(W, H, fsm, fd, fl),
    claws: laid(W, H, csm, cs, cl),
    clawsNear: near.reduce((a, b) => a + b, 0) / near.length,
    damned,
  };
}

/** When a thing flung up from `z` at `vz` lands (frames). */
export const landedAt = (p: V3, vz: number): number => (vz + Math.sqrt(vz * vz + 2 * FALL * p[2])) / FALL;

/** A scrap of robe torn off: thrown, then fluttering down slowly, swaying and turning over as it falls; lying where it lands. */
export function scrap(p: V3, v: V3, s: number, seed: number): { at: V3; a: number; landed: boolean } {
  let x = p[0];
  let y = p[1];
  let z = p[2];
  let vx = v[0];
  let vy = v[1];
  let vz = v[2];
  const steps = Math.ceil(s * 4);
  for (let k = 0; k < steps; k++) {
    const dt = Math.min(0.25, s - k * 0.25);
    // (the air takes it: it slows, and falls no faster than cloth falls)
    vx *= Math.pow(0.9, dt);
    vy *= Math.pow(0.9, dt);
    vz = Math.max(-0.9, vz - FALL * 0.7 * dt);
    x += vx * dt + Math.sin(k * 0.25 * 0.5 + seed) * 0.12 * dt;
    y += vy * dt;
    z += vz * dt;
    if (z <= 0) return { at: [x, y, 0], a: 0, landed: true };
  }
  return { at: [x, y, z], a: s * 0.45 + seed, landed: false };
}
/** A scrap of the cultist's robe on the picture at (`cx`, `cy`), turned `a`: a torn rag of its cloth, its folds; flat where it lies. */
export function rag(st: Light, cx: number, cy: number, a: number, lying: boolean): void {
  const c = Math.cos(a);
  const sn = Math.sin(a);
  // (a ragged strip of cloth: longer than it is wide, its torn end jagged)
  const pts: [number, number, number][] = lying
    ? [[-2, 0, 1], [-1, 0, 1], [0, 0, 1], [1, 0, 2], [-1, 1, 0], [0, 1, 0], [1, 1, 1], [2, 1, 0]]
    : [[-2, -1, 1], [-1, -1, 2], [0, -1, 1], [1, -1, 2], [-2, 0, 0], [-1, 0, 1], [0, 0, 1], [1, 0, 1], [2, 0, 0], [-1, 1, 0], [1, 1, 0]];
  for (const [u, v, k] of pts) {
    const x = lying ? u : u * c - v * sn;
    const y = lying ? v : u * sn + v * c * Math.max(0.5, Math.abs(Math.cos(a * 1.7)));
    st.put(Math.round(cx + x), Math.round(cy + y), ROBE + k);
  }
}

/** Lights laid on a picture of their own: the smoke, then what is solid, then the light. */
export function laid(w: number, h: number, sm: Light, st: Light, l: Light): Px {
  const out = new Px(w, h);
  sm.lay(out, SMOKE);
  st.lay(out, STUFF);
  l.lay(out);
  return out;
}
