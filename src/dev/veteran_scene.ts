// THE VETERAN'S FILM, ONE PICTURE AT A TIME (the art chat, 2 Nov 2026). A MOCK-UP; NOTHING OF THE GAME IMPORTS IT.
//
// A piece of the arena's floor (a stand-in: old stone flags, at the game's scale: a tile 32 pixels across), the Veteran on
// it at the game's size, a stand-in foe or several for his blows to land on (dev/veteran_foe.ts), and his action lines
// (dev/veteran_fx.ts), seen from the game's three-quarter view in front of him (turned 0) or truly from behind him (turned
// a quarter, his pick of 28 Oct: “Draw them true (Recommended)”); his combo globes over his head as they are put in.
// Made outside a browser, a picture of plain pixels (tools/veteran_film.ts).

import { Px } from '../engine/px';
import { GRID } from '../art/skeleton';
import type { V3 } from '../art/skeleton';
import { INK } from '../art/kit';
import { VET_CANVAS, paintVeteran } from './sculpt_veteran';
import { VET_STAND, carryAt, placeOf, poseAt, skel, vetAt, worldOf } from './veteran_moves';
import type { Input, Reaction, VetMotion } from './veteran_moves';
import { FOE_CANVAS, REACT_LONG, REACT_STAYS, REACT_VEER, SWING_HIT, foeHit, foeSwing, paintFoe } from './veteran_foe';
import type { FoeState } from './veteran_foe';
import { FX_KICK, FX_PUNCH, coneBlast, dust, floorRing, ghost, impact, put, rnd, shadow, smear, speedLines, stars } from './veteran_fx';
import { GLOBES_H, GLOBES_W, paintGlobes } from './veteran_globes';
import type { Globe, GlobeRow } from './veteran_globes';

/** One move in a play, how it was put in (for the globes), and what its blows do to whom (a combo's finisher hits harder). */
export interface Step {
  m: VetMotion;
  input?: Input;
  /** The foe each of its blows lands on (by the play's own foes), if not as the move has it. */
  foe?: number;
  react?: Reaction;
  /** A combo of his starts again here (his “a swipe first”: each swipe is a first input): the globes empty first. */
  first?: boolean;
}
/** A piece of the film: moves in a row, with his foes about him, a little of his stance before and after. */
export interface Play {
  steps: Step[];
  /** Where his foes stand at the start, along his forward and left. */
  foes: [number, number][];
  lead: number;
  tail: number;
  globes?: boolean;
}
export const playLong = (p: Play): number => p.lead + p.steps.reduce((t, s) => t + s.m.long, 0) + p.tail;

const turnXY = (x: number, y: number, a: number): [number, number] => {
  const r = (a * Math.PI) / 180;
  return [x * Math.cos(r) - y * Math.sin(r), x * Math.sin(r) + y * Math.cos(r)];
};

interface At {
  /** The move and the frame of it (a stance before and after). */
  m: VetMotion;
  f: number;
  k: number;
  /** Where the floor point of the move's start is (the scene's floor, his own measure turned as he is). */
  origin: [number, number];
  start: number;
}
/** Where in a play a frame falls. */
function stepAt(p: Play, G: number): At {
  let origin: [number, number] = [0, 0];
  let t = p.lead;
  if (G < p.lead) return { m: VET_STAND, f: VET_STAND.long - p.lead + G, k: -1, origin, start: 0 };
  for (let k = 0; k < p.steps.length; k++) {
    const m = p.steps[k].m;
    if (G < t + m.long || k === p.steps.length - 1) {
      if (G >= t + m.long) {
        // (after the last: his stance again, where he ended)
        const e = worldOf(m, m.long, [0, 0, 0]);
        return { m: VET_STAND, f: G - t - m.long, k: p.steps.length, origin: [origin[0] + e[0], origin[1] + e[1]], start: t + m.long };
      }
      return { m, f: G - t, k, origin, start: t };
    }
    const e = worldOf(m, m.long, [0, 0, 0]);
    origin = [origin[0] + e[0], origin[1] + e[1]];
    t += m.long;
  }
  throw new Error('unreachable');
}
/** A point of him (his own measure, as posed) on the scene's floor, in his own unturned measure (before the view's turn). */
function vetWorld(at: At, p: V3, f = at.f): V3 {
  const w = worldOf(at.m, f, p);
  return [w[0] + at.origin[0], w[1] + at.origin[1], w[2]];
}

/** Every blow that lands in a play: when (play frame), on whom, how, and from where (his pelvis then). */
interface Ev {
  G: number;
  foe: number;
  react: Reaction | 'swing';
  from: [number, number];
  heavy: boolean;
  kind: 'punch' | 'kick' | 'foe';
  at: V3;
  step: number;
  /** How big its burst (1 as a heavy or light blow has it), and how many frames after the blow it bursts. */
  big: number;
  late?: number;
}
const EVS = new WeakMap<Play, Ev[]>();
function eventsOf(p: Play): Ev[] {
  const have = EVS.get(p);
  if (have) return have;
  const out: Ev[] = [];
  // (while they are worked out, where a foe is goes by the blows found so far: a cone looks where they stand before it)
  EVS.set(p, out);
  let t = p.lead;
  p.steps.forEach((st, k) => {
    const at = stepAt(p, t);
    for (const s of st.m.strikes) {
      if (s.cone) {
        // A BLOW THAT HITS EVERYONE IN A CONE in front of him: every foe of the play standing in it (where he stands then),
        // the near ones first, a frame for each tile out
        const cone = s.cone;
        const heel = vetWorld(at, skel(poseAt(st.m, s.at))[s.joint] as V3, s.at);
        const fwd = vetWorld(at, [1, 0, 0], s.at);
        const o = vetWorld(at, [0, 0, 0], s.at);
        const way = Math.atan2(fwd[1] - o[1], fwd[0] - o[0]);
        p.foes.forEach((_, foe) => {
          const f0 = foeAt(p, foe, t + s.at - 1, [heel[0], heel[1]]);
          const dx = f0.x - heel[0];
          const dy = f0.y - heel[1];
          const r = Math.hypot(dx, dy);
          let a = Math.atan2(dy, dx) - way;
          a = Math.atan2(Math.sin(a), Math.cos(a));
          if (r > cone.reach + 6 || Math.abs(a) > ((cone.deg / 2) * Math.PI) / 180) return;
          const f = s.at + Math.floor(r / 40);
          out.push({ G: t + f, foe, react: cone.react, from: [heel[0], heel[1]], heavy: false, kind: s.kind, at: [f0.x, f0.y, 26], step: k, big: 0.9 });
        });
        continue;
      }
      for (const h of s.hits) {
        const foe = st.foe ?? h.foe;
        if (foe >= p.foes.length) continue;
        const pel = vetWorld(at, skel(poseAt(st.m, h.f)).pelvis, h.f);
        const j0 = vetWorld(at, skel(poseAt(st.m, h.f))[s.joint] as V3, h.f);
        // (the burst where it meets him: a little on from the striking limb toward him)
        const fo = p.foes[foe];
        const dd = Math.hypot(fo[0] - j0[0], fo[1] - j0[1]) || 1;
        const on = Math.min(5, dd * 0.5);
        const j: V3 = [j0[0] + ((fo[0] - j0[0]) / dd) * on, j0[1] + ((fo[1] - j0[1]) / dd) * on, j0[2]];
        out.push({ G: t + h.f, foe, react: st.react ?? h.react, from: [pel[0], pel[1]], heavy: s.heavy, kind: s.kind, at: j, step: k, big: s.burst ?? 1, late: s.under ? 1 : 0 });
      }
    }
    for (const sw of st.m.foeSwing ?? []) out.push({ G: t + sw.f, foe: sw.foe, react: 'swing', from: [0, 0], heavy: false, kind: 'foe', at: [0, 0, 0], step: k, big: 1 });
    t += st.m.long;
  });
  out.sort((a, b) => a.G - b.G);
  return out;
}

/** Every blow that lands in a play (for the checks): when (play frame), on which foe, and how. */
export const blowsOf = (p: Play): { G: number; foe: number; react: string }[] => eventsOf(p).map((e) => ({ G: e.G, foe: e.foe, react: e.react }));

/** A foe at a frame of a play: where (the scene's floor, unturned), which way he faces, his pose. */
function foeAt(p: Play, i: number, G: number, vet: [number, number]): { x: number; y: number; face: number; st: FoeState } {
  const home = p.foes[i];
  const evs = eventsOf(p).filter((e) => e.foe === i && e.G <= G);
  // (what has driven him back for good: a blow he does not come back from)
  let bx = 0;
  let by = 0;
  let face = Math.atan2(vet[1] - home[1], vet[0] - home[0]);
  let st: FoeState = { pose: {}, back: 0, lift: 0, stars: false, down: false };
  const last = evs[evs.length - 1];
  for (const e of evs) {
    if (e.react === 'swing' || e === last) continue;
    if (REACT_STAYS[e.react]) {
      const d = Math.atan2(home[1] + by - e.from[1], home[0] + bx - e.from[0]) + (REACT_VEER[e.react] * Math.PI) / 180;
      const b = foeHit(e.react, REACT_LONG[e.react]).back;
      bx += Math.cos(d) * b;
      by += Math.sin(d) * b;
    }
  }
  if (last && last.react === 'swing') {
    st = foeSwing(G - last.G);
  } else if (last) {
    const d = Math.atan2(home[1] + by - last.from[1], home[0] + bx - last.from[0]) + (REACT_VEER[last.react as Reaction] * Math.PI) / 180;
    face = d + Math.PI;
    st = foeHit(last.react as Reaction, Math.min(G - last.G, REACT_LONG[last.react as Reaction]));
    return { x: home[0] + bx + Math.cos(d) * st.back, y: home[1] + by + Math.sin(d) * st.back, face: (face * 180) / Math.PI, st };
  } else {
    // (on guard, shifting his weight a little)
    st = { pose: { pz: -3.5 + 0.8 * Math.sin(G * 0.21 + i), faceUp: 6 + 2 * Math.sin(G * 0.13 + i) }, back: 0, lift: 0, stars: false, down: false };
  }
  return { x: home[0] + bx, y: home[1] + by, face: (face * 180) / Math.PI, st };
}

// ---------------------------------------------------------------------------------------------
// The floor: a stand-in for the arena's, old stone flags a tile across, seams dark, worn here and there

const STONE = ['#1c1a26', '#22202e', '#292636', '#302c3e', '#373247', '#3f3a50'];
function floorPx(w: number, h: number, cx: number, cy: number): Px {
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const a = (X + 0.5 - cx) / 32;
      const b = (Y + 0.5 - cy) / 16;
      const x = a + b;
      const y = b - a;
      const fx = x - Math.floor(x);
      const fy = y - Math.floor(y);
      const seam = fx < 0.035 || fy < 0.035;
      const own = rnd(Math.floor(x) * 31 + Math.floor(y) * 977);
      let tone = 2 + Math.floor(own * 2.6);
      if (rnd(Math.floor(fx * 9) + Math.floor(fy * 9) * 13 + Math.floor(x) * 7 + Math.floor(y) * 3) < 0.07) tone = Math.max(0, tone - 1);
      if (fx > 0.9 || fy > 0.9) tone = Math.min(5, tone + 1);
      put(px, X, Y, seam ? '#0c0b14' : STONE[tone]);
    }
  }
  return px;
}

/** Lay a painting (its floor point at ax, ay of it) on a picture with its floor point at (x, y). Its faint edge is mixed in. */
function lay(dst: Px, src: Px, ax: number, ay: number, x: number, y: number, dark = 0, flash = false): void {
  const ox = Math.round(x - ax);
  const oy = Math.round(y - ay);
  for (let j = 0; j < src.h; j++) {
    const Y = oy + j;
    if (Y < 0 || Y >= dst.h) continue;
    for (let i = 0; i < src.w; i++) {
      const X = ox + i;
      if (X < 0 || X >= dst.w) continue;
      const s = (j * src.w + i) * 4;
      const a = src.d[s + 3];
      if (!a) continue;
      const d = (Y * dst.w + X) * 4;
      const k = a / 255;
      for (let c = 0; c < 3; c++) {
        let v = src.d[s + c];
        if (flash && a === 255) v = 255 - (255 - v) * 0.25;
        if (dark) v = v * (1 - dark) + [10, 8, 20][c] * dark;
        dst.d[d + c] = Math.round(dst.d[d + c] * (1 - k) + v * k);
      }
      dst.d[d + 3] = 255;
    }
  }
}

// ---------------------------------------------------------------------------------------------
// The globes

const FILL: Record<Input, number> = { tap: 4, hold: 9, swipe: 3, swipeTap: 7, swipeHold: 7 };
export function globesAt(p: Play, G: number): GlobeRow | null {
  if (!p.globes) return null;
  const row: Globe[] = [{ kind: 'empty' }, { kind: 'empty' }, { kind: 'empty' }];
  let t = p.lead;
  let slot = 0;
  let locked = false;
  let lastEnd = 0;
  let drain = 1;
  for (let k = 0; k < p.steps.length; k++) {
    const st = p.steps[k];
    const t0 = t - 3;
    if (st.first && k > 0) {
      // (a new combo: the old one drains away first)
      if (G >= t0) {
        for (let i = 0; i < 3; i++) row[i] = { kind: 'empty' };
        slot = 0;
        locked = false;
      }
    }
    if (G >= t0 && st.input) {
      const u = Math.min(1, (G - t0 + 1) / FILL[st.input]);
      if (st.input === 'tap') row[slot] = { kind: 'punch', level: u };
      else if (st.input === 'hold') row[slot] = { kind: 'kick', level: u };
      else if (st.input === 'swipe') row[slot] = { kind: 'jump', level: u };
      else row[slot] = G - t0 < 3 ? { kind: 'jump', level: Math.min(1, (G - t0 + 1) / 3) } : { kind: 'fire', of: st.input === 'swipeTap' ? 'punch' : 'kick' };
      if (slot === 2 && u >= 1) locked = true;
      slot = Math.min(2, slot + 1);
    }
    t += st.m.long;
    lastEnd = t;
  }
  // (spent: drained away after the last move)
  if (G > lastEnd - 4) drain = Math.max(0, 1 - (G - (lastEnd - 4)) / 8);
  if (drain < 1) {
    for (let i = 0; i < 3; i++) {
      const g = row[i];
      if (g.kind === 'empty') continue;
      if (drain <= 0) row[i] = { kind: 'empty' };
      else if (g.kind === 'fire') row[i] = drain > 0.5 ? g : { kind: g.of, level: drain * 2 };
      else row[i] = { kind: g.kind, level: Math.min(g.level, drain) };
    }
    if (drain < 0.6) locked = false;
  }
  return { globes: [row[0], row[1], row[2]], locked, flick: G };
}

// ---------------------------------------------------------------------------------------------
// One picture

export interface Shot {
  /** The picture's size (the game's pixels) and how the view is turned (0 in front of him, 90 from behind). */
  w: number;
  h: number;
  view: number;
  /** Where his floor point sits in the picture (shares of its width and height), and how far ahead of him the camera looks. */
  sx?: number;
  sy?: number;
  ahead?: number;
}

/** THE SCENE AT A FRAME OF A PLAY (fractional frames for the slow parts). */
export function scene(p: Play, G: number, shot: Shot): Px {
  const at = stepAt(p, G);
  const V = shot.view;
  const toScene = (q: V3): V3 => {
    const [x, y] = turnXY(q[0], q[1], V);
    return [x, y, q[2]];
  };
  // HIM
  const pose = vetAt(at.m, at.f);
  const place = placeOf(at.m, at.f);
  const floorW = toScene([place.at[0] + at.origin[0], place.at[1] + at.origin[1], 0]);
  // THE CAMERA: on him, a little toward where he faces (it follows him as the game's does)
  const cr = carryAt(at.m, at.f);
  const camW = toScene([at.origin[0] + cr[0] * 0.8 + (shot.ahead ?? 12), at.origin[1] + cr[1] * 0.8, 0]);
  // (shaken on a heavy blow)
  const shakeOn = at.m.shake?.some(([a, b]) => at.f >= a && at.f <= b);
  const jx = shakeOn ? (Math.floor(at.f) % 2 === 0 ? 2 : -2) : 0;
  const jy = shakeOn ? (Math.floor(at.f) % 2 === 0 ? -1 : 1) : 0;
  const cx = shot.w * (shot.sx ?? 0.5) - GRID * (camW[0] + camW[1]) + jx;
  const cy = shot.h * (shot.sy ?? 0.66) - GRID * 0.5 * (camW[0] - camW[1]) + jy;
  const scr = (q: V3): [number, number] => [cx + GRID * (q[0] + q[1]), cy + GRID * 0.5 * (q[0] - q[1]) - q[2]];
  const px = floorPx(shot.w, shot.h, cx, cy);

  // where he is, to his foes
  const pelW = vetWorld(at, pose.s.pelvis);
  const foes = p.foes.map((_, i) => foeAt(p, i, G, [pelW[0], pelW[1]]));
  const evs = eventsOf(p);

  // SHADOWS
  const fs = scr(floorW);
  const vetLift = Math.max(0, Math.min(pose.s.toeL[2], pose.s.toeR[2], pose.s.heelL[2], pose.s.heelR[2]));
  const fsh = scr(toScene([pelW[0], pelW[1], 0]));
  shadow(px, fsh[0], fsh[1], 13, vetLift);
  for (const fo of foes) {
    const q = scr(toScene([fo.x, fo.y, 0]));
    shadow(px, q[0], q[1], 12, fo.st.lift);
  }
  // SHOCKWAVE RINGS along the floor, under the heavy blows
  for (const e of evs) {
    if (e.react === 'swing' || !e.heavy || e.react === 'shove') continue;
    const age = G - e.G;
    if (age < 0 || age > 9) continue;
    const fo = p.foes[e.foe];
    const q = scr(toScene([fo[0], fo[1], 0]));
    floorRing(px, q[0], q[1], Math.floor(age), e.kind === 'kick' ? FX_KICK : FX_PUNCH, e.react === 'fly' || e.react === 'launch' ? 1.4 : 1);
  }
  // DUST off the floor (his take-offs and landings; his foes crashing down)
  const dusts: [number, number, number, boolean, number][] = [];
  {
    let t = p.lead;
    p.steps.forEach((st, k) => {
      for (const d of st.m.dust ?? []) {
        const age = G - (t + d.f);
        if (age < 0 || age > 14) continue;
        const a0 = stepAt(p, t + d.f);
        const sk = skel(poseAt(st.m, d.f));
        for (const side of d.at === 'both' ? (['L', 'R'] as const) : [d.at]) {
          const q = vetWorld(a0, side === 'L' ? sk.toeL : sk.toeR, d.f);
          dusts.push([...scr(toScene([q[0], q[1], 0])), Math.floor(age), !!d.big, k * 100 + d.f + (side === 'L' ? 0 : 50)] as [number, number, number, boolean, number]);
        }
      }
      t += st.m.long;
    });
    for (const e of evs) {
      if (e.react !== 'fly' && e.react !== 'launch' && e.react !== 'knock' && e.react !== 'kneed' && e.react !== 'aside' && e.react !== 'shove') continue;
      const land = e.G + (e.react === 'fly' || e.react === 'kneed' ? 15 : e.react === 'launch' ? 28 : e.react === 'shove' ? 4 : 3);
      const age = G - land;
      if (age < 0 || age > 14) continue;
      const fo = foeAt(p, e.foe, land, [0, 0]);
      dusts.push([...scr(toScene([fo.x, fo.y, 0])), Math.floor(age), e.react !== 'knock' && e.react !== 'aside', e.foe * 7 + 3]);
    }
  }
  for (const d of dusts) if (d[1] < fs[1]) dust(px, d[0], d[1], d[2], d[3], d[4]);
  // HIS HEAVY LANDINGS: a ring of force along the floor round his feet
  {
    let t = p.lead;
    for (const st of p.steps) {
      for (const qf of st.m.quake ?? []) {
        const age = G - (t + qf);
        if (age < 0 || age > 9) continue;
        const a0 = stepAt(p, t + qf);
        const c = vetWorld(a0, skel(poseAt(st.m, qf)).pelvis, qf);
        const q = scr(toScene([c[0], c[1], 0]));
        floorRing(px, q[0], q[1], Math.floor(age), ['#2a2438', '#6e6886', '#958fab', '#bcb6cc', '#f0eeff'], 1.7);
      }
      t += st.m.long;
    }
  }
  // THE PUSH KICK'S BLAST OF FORCE: a cone along the floor from his heel
  {
    let t = p.lead;
    for (const st of p.steps) {
      for (const sk of st.m.strikes) {
        if (!sk.cone) continue;
        const age = G - (t + sk.at);
        if (age < 0 || age > 14) continue;
        const a0 = stepAt(p, t + sk.at);
        const heel = vetWorld(a0, skel(poseAt(st.m, sk.at))[sk.joint] as V3, sk.at);
        const o = vetWorld(a0, [0, 0, 0], sk.at);
        const fw = vetWorld(a0, [1, 0, 0], sk.at);
        const way = Math.atan2(fw[1] - o[1], fw[0] - o[0]);
        const cone = sk.cone;
        coneBlast(px, (r, a) => {
          const w = way + (a * Math.PI) / 180;
          return scr(toScene([heel[0] + Math.cos(w) * r, heel[1] + Math.sin(w) * r, 0]));
        }, cone.deg, cone.reach, Math.floor(age), FX_KICK, t + sk.at);
      }
      t += st.m.long;
    }
  }
  // A WHOLE TURN DRAWN IN LIGHT round him (the spinning elbow): its stretches behind him painted now, before him
  const arcOf = (): { path: [number, number][]; behind: boolean[]; w: number; cols: readonly string[]; show: number } | null => {
    const a = at.m.arc;
    if (!a || at.f < a.from) return null;
    const show = at.f <= a.to ? 1 : Math.max(0, 1 - (at.f - a.to) / 5);
    if (show <= 0) return null;
    const until = Math.min(at.f, a.to);
    const path: [number, number][] = [];
    const behind: boolean[] = [];
    if (until <= a.from) return null;
    for (let g = a.from; g <= until + 1e-6; g += 0.2) {
      // (out round him a little beyond the elbow: a great ring at head height, its head just past the point of the elbow)
      const sk = skel(poseAt(at.m, g));
      const j = vetWorld(at, sk[a.joint] as V3, g);
      const c = vetWorld(at, sk.neck, g);
      const dx = j[0] - c[0];
      const dy = j[1] - c[1];
      const dn = Math.hypot(dx, dy) || 1;
      const w: V3 = [j[0] + (dx / dn) * (a.out ?? 0), j[1] + (dy / dn) * (a.out ?? 0), j[2]];
      path.push(scr(toScene(w)));
      behind.push(scr(toScene([w[0], w[1], 0]))[1] < fs[1]);
    }
    return { path, behind, w: a.w, cols: a.kind === 'kick' ? FX_KICK : FX_PUNCH, show };
  };
  const arc = arcOf();
  if (arc) smear(px, arc.path, arc.w, arc.cols, arc.show, arc.behind);
  const strikesNow = at.m.strikes.filter((s) => {
    const lastHit = Math.max(s.at, ...s.hits.map((h) => h.f));
    return at.f > s.from && at.f <= lastHit + 4;
  });
  const kindCols = (k: 'punch' | 'kick'): readonly string[] => (k === 'kick' ? FX_KICK : FX_PUNCH);
  const smearOf = (s: (typeof strikesNow)[number]): void => {
    const lastHit = Math.max(s.at, ...s.hits.map((h) => h.f));
    const until = Math.min(at.f, lastHit);
    const path: [number, number][] = [];
    for (let g = s.from - 0.5; g <= until + 1e-6; g += 0.1) path.push(scr(toScene(vetWorld(at, skel(poseAt(at.m, g))[s.joint] as V3, g))));
    const show = at.f <= lastHit ? 1 : Math.max(0, 1 - (at.f - lastHit) / 4);
    smear(px, path, s.w ?? (s.heavy ? 13 : 9), kindCols(s.kind), show);
  };
  for (const s of strikesNow) if (s.under) smearOf(s);

  // THE FIGURES, far to near
  type Fig = { y: number; draw: () => void };
  const figs: Fig[] = [];
  figs.push({
    y: fs[1],
    draw: () => {
      // AFTER-IMAGES of him along the strike: where he was a half and a whole frame ago
      for (const s of strikesNow) {
        const lastHit = Math.max(s.at, ...s.hits.map((h) => h.f));
        if (at.f > lastHit + 1) continue;
        for (const [back, fill, edge] of [[1.0, 1, 2], [0.5, 2, 3]] as const) {
          const g = Math.max(s.from, at.f - back);
          if (g >= at.f) continue;
          const gp = vetAt(at.m, g);
          const gpl = placeOf(at.m, g);
          const gd = paintVeteran(gp, V + gpl.turn);
          const gf = scr(toScene([gpl.at[0] + at.origin[0], gpl.at[1] + at.origin[1], 0]));
          ghost(px, gd.px, gf[0] - VET_CANVAS.ax, gf[1] - VET_CANVAS.ay, kindCols(s.kind)[fill], kindCols(s.kind)[edge]);
        }
      }
      const d = paintVeteran(pose, V + place.turn);
      const struck = (at.m.struck ?? []).some((s) => Math.floor(at.f) === s);
      lay(px, d.px, VET_CANVAS.ax, VET_CANVAS.ay, fs[0], fs[1], at.m.out ? 0.5 * at.m.out(at.f) : 0, struck);
    },
  });
  foes.forEach((fo) => {
    const q = scr(toScene([fo.x, fo.y, 0]));
    figs.push({
      y: q[1],
      draw: () => {
        const d = paintFoe(fo.st.pose, fo.face + V, fo.st.lift);
        lay(px, d.px, FOE_CANVAS.ax, FOE_CANVAS.ay, q[0], q[1], fo.st.down ? 0.12 : 0);
      },
    });
  });
  figs.sort((a, b) => a.y - b.y);
  for (const fg of figs) fg.draw();
  for (const d of dusts) if (d[1] >= fs[1]) dust(px, d[0], d[1], d[2], d[3], d[4]);
  // (the turn in light: its stretches in front of him)
  if (arc) smear(px, arc.path, arc.w, arc.cols, arc.show, arc.behind.map((b) => !b));

  // SPEED LINES behind him as he flies
  {
    const prev = vetWorld(at, skel(poseAt(at.m, at.f - 1)).pelvis, at.f - 1);
    const a = scr(toScene(pelW));
    const b = scr(toScene(prev));
    const air = vetLift > 3;
    if (air || at.m.id === 'run') speedLines(px, a[0], a[1] - 4, (a[0] - b[0]) * 1.4, (a[1] - b[1]) * 1.4, 14, Math.floor(G / 2) * 13, ['', '', '#6a64b0', '#b4b0e6', '#f0eeff']);
  }
  // THE SMEARS along his blows (those that go under him were painted before him)
  for (const s of strikesNow) {
    if (s.under) continue;
    smearOf(s);
  }
  // THE IMPACTS where blows land (his, and a foe's on him)
  for (const e of evs) {
    const age = Math.floor(G - e.G);
    if (age < 0 || age > 6) continue;
    if (e.react === 'swing') {
      const hitAge = Math.floor(G - (e.G + SWING_HIT));
      if (hitAge < 0 || hitAge > 6) continue;
      const head = scr(toScene(vetWorld(at, pose.s.head)));
      impact(px, head[0], head[1], hitAge, [INK, '#7a1e34', '#d23c5a', '#ffc4cc', '#ffffff'], true, e.G);
      continue;
    }
    // (a blow whose limb must be seen landing bursts the frame after it lands)
    const q = scr(toScene(e.at));
    impact(px, q[0], q[1], age - (e.late ?? 0), kindCols(e.kind as 'punch' | 'kick'), e.heavy, e.G * 3 + e.foe, e.big);
  }
  // (a cone's blow: its burst at the heel as it lands)
  for (const s of at.m.strikes) {
    if (!s.cone) continue;
    const age = Math.floor(at.f - s.at);
    if (age < 0 || age > 6) continue;
    const q = scr(toScene(vetWorld(at, skel(poseAt(at.m, s.at))[s.joint] as V3, s.at)));
    impact(px, q[0], q[1], age, kindCols(s.kind), s.heavy, s.at * 7, s.burst ?? 1);
  }
  // STARS round a stunned foe's head
  for (const fo of foes) {
    if (!fo.st.stars) continue;
    const q = scr(toScene([fo.x, fo.y, 0]));
    stars(px, q[0], q[1] - 58 - fo.st.lift + (fo.st.lift > 0 ? 0 : 14), G);
  }
  // HIS GLOBES over his head
  const row = globesAt(p, G);
  if (row) {
    const gl = paintGlobes(row);
    const top = scr(toScene(vetWorld(at, [pose.s.head[0], pose.s.head[1], pose.s.head[2] + 10])));
    const ox = Math.round(top[0] - GLOBES_W / 2);
    const oy = Math.round(top[1] - GLOBES_H - 2);
    for (let j = 0; j < gl.h; j++) for (let i = 0; i < gl.w; i++) {
      const s = (j * gl.w + i) * 4;
      if (!gl.d[s + 3]) continue;
      const X = ox + i;
      const Y = oy + j;
      if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) continue;
      const d = (Y * px.w + X) * 4;
      px.d[d] = gl.d[s];
      px.d[d + 1] = gl.d[s + 1];
      px.d[d + 2] = gl.d[s + 2];
      px.d[d + 3] = 255;
    }
  }
  return px;
}
