// FLOOR 9'S SIDE BOSSES' ATTACKS ON FILM (docs/mockups/f9_side_bosses/pictures/f9_bosses_film.mp4), made outside a browser: the troll
// chieftain's club smash, ground slam, rage war cry and bull rush; the mist wolf's bite, claw sweep, howl, lunge through you and mist
// cloud; each beside the Brawler, on a stand-in of the Pinewood's grass; the blows also at half speed. Captioned. Frames are piped to
// ffmpeg. Nothing of the game imports it.
//   node node_modules/tsx/dist/cli.mjs tools/f9_bosses_film.ts <out.mp4> [stills <dir> <seconds,...> [parts] | count]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { hash } from '../src/art/kit';
import { FLAME } from '../src/art/mkit';
import { makeHeroArt3 } from '../src/art/heroes3';
import { WOLF_CANVAS, wolfPainted } from '../src/art/fog_wolves';
import { frameAt } from '../src/dev/action_f1_scene';
import { cut, scaled, spriteLaid } from '../src/dev/king_scene';
import type { Sprite } from '../src/engine/px';
import { CLUB_LONG, chiefAt, sculptChief9, sculptWolf9, wolfAt } from '../src/art/f9_bosses_sculpt';
import type { ChiefPose } from '../src/art/f9_bosses_sculpt';
import type { Drawn } from '../src/dev/sculpt';
import { CHIEF_MOVES, CLAW_ARC, LUNGE_LONG, RUSH_LONG, WOLF_MOVES, chiefPose, wolfPose } from '../src/art/f9_bosses_moves';
import type { Beat, ChiefMove, WolfMove } from '../src/art/f9_bosses_moves';
import type { V3 } from '../src/art/skeleton';
import { png } from './king_png';
import { DUST, MIST, ROCK, arcPath, arcs, burst, chips, crack, crackRay, dust, embers, embersMist, flamePillars, ghost, hit, invGround, line, mistBurst, mistCloud, mistRing, put, rage, shock, slash, smear, speedLines, spike, warnArc, warnLane, warnRing } from '../src/art/f9_bosses_paint';
import type { Pr } from '../src/art/f9_bosses_paint';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const W = 1200;
const H = 676;
const FPS = 30;

// THE GROUND: the Pinewood's grass (art/pinewood.ts's greens), in patches, a stand-in
const GRASS = ['#2e3c24', '#40502c', '#536638', '#677a43', '#7c8e4e', '#94a45c'];
function grass(SW: number, SH: number): Px {
  const px = new Px(SW, SH);
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      // (soft patches of a shade darker, flecks of a shade lighter: a step quieter than the figures)
      const big = Math.sin(x * 0.031 + y * 0.047) + Math.sin(x * 0.017 - y * 0.061 + 1.3);
      const g = hash(x, y, 9103);
      let k = big > 1.1 && g < 0.7 ? 2 : 3;
      if (g > 0.93) k = 4;
      else if (g < 0.05) k = 2;
      px.set(x, y, GRASS[k]);
    }
  }
  return px;
}
/** (AT YOUR PHONE'S OWN SIZE, `phone`: see `part`) */
const PHONE = process.argv[3] === 'phone';
const PW = 1278;
const PH = 590;
const PHONE_GROUND = PHONE ? grass(PW, PH) : null;
const GROUNDS = new Map<number, Px>();
/** The ground for a scene `k` times as big as the film's picture. */
const groundFor = (k: number): Px => {
  let g = GROUNDS.get(k);
  if (!g) {
    const w = Math.ceil(W / k);
    const h = Math.ceil(H / k);
    // (at the phone's size, the scene's ground the very piece of the phone's ground it is laid on, so that no seam shows)
    g = PHONE_GROUND ? cut(PHONE_GROUND, Math.round((PW - w) / 2), Math.round((PH - h) / 2), w, h) : grass(w, h);
    GROUNDS.set(k, g);
  }
  return g;
};

// THE BRAWLER, for size and for a target
const BRAWLER = makeHeroArt3().of('brawler' as never, {} as never) as never;



// =================================================================================================
// WHAT THEIR BLOWS THROW ABOUT (the enemy's pink and gold, FLAME; the mist's pale)

/** A FIGURE laid down on the picture at its anchor, every `keep`-th pixel of it (a fade in). */
function lay(px: Px, fig: Px, ax: number, ay: number, x: number, y: number, keep = 1): void {
  for (let j = 0; j < fig.h; j++) {
    for (let i = 0; i < fig.w; i++) {
      const c = fig.get(i, j);
      if (!c) continue;
      if (keep < 1 && hash(i, j, 9601) > keep) continue;
      put(px, x - ax + i, y - ay + j, c);
    }
  }
}

// =================================================================================================
// THE RULES' OWN: the freeze where a heavy blow lands, the screen's kick, the blow smeared with after-images, the one struck rocked

/** The move's own time at the film's `t`: held still through each blow's freeze (Movement 7). */
function clockOf(beats: readonly Beat[], t: number): number {
  let m = t;
  for (const b of beats) {
    if (m <= b.at) break;
    if (m < b.at + b.freeze) return b.at;
    m -= b.freeze;
  }
  return m;
}
/** The film's own time at which a beat lands (later by every freeze before it). */
function beatFilm(beats: readonly Beat[], i: number): number {
  let t = beats[i].at;
  for (let j = 0; j < i; j++) t += beats[j].freeze;
  return t;
}
/** How far the screen is kicked at the film's `t` (Animations: the screen kicks on big hits), and for the war cry's roar, a long rumble. */
function kickOf(beats: readonly Beat[], t: number, f: number): [number, number] {
  let a = 0;
  beats.forEach((b, i) => {
    const s = t - beatFilm(beats, i);
    if (s >= 0 && s < b.ring) a = Math.max(a, b.shake * (1 - s / b.ring) ** 1.5);
  });
  return [Math.round((hash(f, 1, 1401) - 0.5) * 2 * a), Math.round((hash(f, 2, 1401) - 0.5) * 2 * a)];
}
/** A frame kicked by (dx, dy): what runs off one side comes in from the ground's colour. */
function kicked(p: Px, d: [number, number]): Px {
  if (!d[0] && !d[1]) return p;
  const out = new Px(p.w, p.h);
  for (let y = 0; y < p.h; y++) {
    const sy = Math.min(p.h - 1, Math.max(0, y - d[1]));
    for (let x = 0; x < p.w; x++) {
      const sx = Math.min(p.w - 1, Math.max(0, x - d[0]));
      const i = (sy * p.w + sx) * 4;
      out.d.set(p.d.subarray(i, i + 4), (y * p.w + x) * 4);
    }
  }
  return out;
}

/** Someone struck: when (the move's own time) and which way he is thrown (picture), and how far. */
interface Struck {
  at: number;
  dx: number;
  dy: number;
  far: number;
}
/** The Brawler's own reel (his clips are kept by name, not under `moves`), `s` seconds in. */
function reelAt(look: 'front' | 'back', s: number): { px: Px; ax: number; ay: number } {
  const c = ((BRAWLER as unknown as Record<string, { clips: Record<string, { frames: Sprite[]; fps: number }> }>)[look]).clips.reel;
  return spriteLaid(c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(s * c.fps)))]);
}
/** THE BRAWLER, struck or not (Hits 3: a struck figure flashes and is knocked back; a heavy blow rocks it): his picture and where he is. */
function brawlerAt(view: 'front' | 'back', t: number, m: number, hits: readonly Struck[], x: number, y: number): { px: Px; ax: number; ay: number; x: number; y: number } {
  let h: Struck | null = null;
  for (const q of hits) if (m >= q.at) h = q;
  const look = view === 'front' ? 'back' : 'front';
  if (!h || m - h.at > 1.2) return { ...frameAt(BRAWLER, look, 'stand', t), x, y };
  const s = m - h.at;
  const thrown = h.far * (1 - (1 - Math.min(1, s / 0.3)) ** 3);
  const l = s < 0.5 ? reelAt(look, s) : frameAt(BRAWLER, look, 'stand', t);
  let px = l.px;
  if (s < 0.08) {
    // (the flash: white, then the enemy's pink)
    px = l.px.clone();
    for (let i = 0; i < px.w * px.h; i++) if (px.d[i * 4 + 3]) px.set(i % px.w, Math.floor(i / px.w), s < 0.04 ? '#ffffff' : FLAME[3]);
  }
  return { px, ax: l.ax, ay: l.ay, x: x + h.dx * thrown, y: y + h.dy * thrown };
}

/** The chieftain's club's head at a pose (his own lengths). */
const clubHead = (p: ChiefPose): V3 => {
  const a = p.fistR;
  const b = p.clubEnd;
  const d = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const n = Math.hypot(d[0], d[1], d[2]) || 1;
  const L = CLUB_LONG * 0.95;
  return [a[0] + p.hip[0] + (d[0] / n) * L, a[1] + p.hip[1] + (d[1] / n) * L, a[2] + p.hip[2] + (d[2] / n) * L];
};

// =================================================================================================
// THE SCENES

type View = 'front' | 'back';
interface Part {
  long: number;
  title: string;
  line: string;
  frame: (t: number) => Px;
}
type Scene = ((t: number) => Px) & { k: number; long: number };

/** A chieftain scene: `move` seen `view` at `yaw`, his floor point at (bx, by), the Brawler `tf` ahead of him and `tl` to his left. */
function chiefFilm(move: ChiefMove, view: View, yaw: number, bx: number, by: number, tf: number, tl: number, k = 2): Scene {
  const size = { w: Math.ceil(W / k), h: Math.ceil(H / k), ax: bx, ay: by };
  const GROUND = groundFor(k);
  const M = CHIEF_MOVES[move];
  const long = M.long + M.beats.reduce((s, b) => s + b.freeze, 0);
  const f = (t: number): Px => {
    const m = clockOf(M.beats, t);
    const fr = Math.floor(t * 30);
    const pose = chiefPose(move, m);
    const d: Drawn = sculptChief9(view, pose, yaw, size);
    const pr: Pr = (ff, l, u) => chiefAt(d, yaw, [ff, l, u]);
    const tg = pr(tf, tl, 0);
    const hip = pr(pose.hip[0], pose.hip[1], 0);
    const beat = M.beats[0];
    const since = m - beat.at;
    const sinceF = t - beatFilm(M.beats, 0);
    const impact: V3 = move === 'smash' ? clubHead(chiefPose('smash', beat.at)) : move === 'slam' ? clubHead(chiefPose('slam', beat.at)) : [0, 0, 0];
    // (who is struck, and which way he is thrown: away from the blow)
    const away = (fromF: number, fromL: number, far: number): Struck => {
      const a = pr(fromF, fromL, 0);
      const dx = tg[0] - a[0];
      const dy = tg[1] - a[1];
      const n = Math.hypot(dx, dy) || 1;
      return { at: beat.at, dx: dx / n, dy: dy / n, far };
    };
    const hits: Struck[] = move === 'smash' ? [away(impact[0], impact[1], 22)] : move === 'rush' ? [away(pose.hip[0] - 40, 0, 46)] : move === 'warcry' ? [away(0, 0, 14)] : [];
    // (the slam's crack reaches him a little after it lands)
    const crackAt = 0.3 * Math.min(1, Math.max(0, (tf - impact[0]) / 132));
    if (move === 'slam') hits.push({ ...away(impact[0], impact[1], 30), at: beat.at + crackAt });
    const p = GROUND.clone();
    // ON THE GROUND
    if (move === 'smash') {
      if (m > 0.5 && since < 0) warnRing(p, pr, impact[0], impact[1], 34, t);
      if (since >= 0) for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2 + 0.4;
        crackRay(p, pr, impact[0], impact[1], a, 26 + 26 * hash(i, 1, 77), Math.min(1, sinceF / 0.12), (since - 0.6) / 1.0, 77 + i);
      }
      shock(p, pr, impact[0], impact[1], 70, sinceF / 0.45);
      shock(p, pr, impact[0], impact[1], 44, (sinceF - 0.08) / 0.4);
    }
    if (move === 'slam') {
      if (m > 0.45 && since < 0) warnLane(p, pr, impact[0] - 8, impact[0] + 126, impact[1], 13, t);
      if (since >= 0) crack(p, pr, impact[0] - 8, impact[1], 132, Math.min(1, sinceF / 0.3), (since - 0.7) / 0.9, 81);
      shock(p, pr, impact[0], impact[1], 46, sinceF / 0.4);
    }
    if (move === 'warcry') shock(p, pr, 0, 0, 130, sinceF / 0.6);
    if (move === 'rush' && m > 0.3 && m < 1.15) warnLane(p, pr, 10, RUSH_LONG + 20, 0, 24, t);
    // (the rage's after-images, his ghosts under him while he strikes)
    const strike = M.strikes.find(([a, b]) => m >= a && m <= b + 0.1);
    if (strike) {
      const [a, b] = strike;
      const n = move === 'rush' ? 5 : 2;
      for (let i = n; i >= 1; i--) {
        const q = Math.max(a - 0.05, Math.min(m, b) - (i * (b - a)) / n);
        const gd = sculptChief9(view, chiefPose(move, q), yaw, size);
        ghost(p, gd.px, FLAME, (1 - i / (n + 1)) * (m > b ? 1 - (m - b) / 0.1 : 1), 9800 + i);
      }
    }
    // THE TWO OF THEM, the farther first
    const hero = brawlerAt(view, t, m, hits, tg[0], tg[1]);
    const heroFirst = hero.y < hip[1];
    const layHero = (): void => lay(p, hero.px, hero.ax, hero.ay, hero.x, hero.y);
    if (heroFirst) layHero();
    lay(p, d.px, 0, 0, 0, 0);
    if (!heroFirst) layHero();
    // OVER THEM
    // (the club's smear, from where the strike began to where it is)
    if (strike && (move === 'smash' || move === 'slam' || move === 'warcry')) {
      const [a, b] = strike;
      const p0 = chiefPose(move, a);
      const p1 = chiefPose(move, Math.min(m, b));
      const piv: V3 = [p1.hip[0], p1.hip[1] - 12, p1.hip[2] + 76];
      const outer = arcPath(piv, clubHead(p0), clubHead(p1), 14).map((q) => pr(q[0], q[1], q[2]));
      const mid = (q: ChiefPose): V3 => {
        const h = clubHead(q);
        const f0 = [q.fistR[0] + q.hip[0], q.fistR[1] + q.hip[1], q.fistR[2] + q.hip[2]];
        return [(h[0] + f0[0]) / 2, (h[1] + f0[1]) / 2, (h[2] + f0[2]) / 2];
      };
      const inner = arcPath(piv, mid(p0), mid(p1), 14).map((q) => pr(q[0], q[1], q[2]));
      smear(p, outer, 22, FLAME, m > b ? 1 - (m - b) / 0.1 : 1, inner);
    }
    if (move === 'smash' || move === 'slam') {
      const c = pr(impact[0], impact[1], 4);
      burst(p, c[0], c[1], sinceF / 0.22, 26, 9707);
      dust(p, pr, impact[0], impact[1], since / 1.0, 9701, 16, 60);
      chips(p, pr, impact[0], impact[1], since, 9703, 26);
      if (since >= 0 && since < 1.4) embers(p, c[0], c[1], 40, 60, since, 14, 9709);
      if (move === 'slam') {
        // (the rock thrust up along the crack as it runs, each with its own burst of stone and dust)
        for (let i = 1; i <= 5; i++) {
          const ff = impact[0] + i * 24;
          const when = (i * 24) / 132 * 0.3;
          const s2 = since - when;
          if (s2 < 0) continue;
          const b2 = pr(ff, impact[1] + (hash(i, 1, 9711) - 0.5) * 10, 0);
          spike(p, b2[0], b2[1], 18 + 14 * hash(i, 2, 9711), Math.min(1, s2 / 0.06) * (s2 > 1.1 ? Math.max(0, 1 - (s2 - 1.1) / 0.4) : 1), hash(i, 3, 9711) - 0.5);
          chips(p, pr, ff, impact[1], s2, 9713 + i, 8);
          dust(p, pr, ff, impact[1], s2 / 0.8, 9715 + i, 6, 22);
        }
      }
    }
    if (move === 'warcry') {
      // (gathering: embers drawn in to him; the roar: arcs, the burst, the fire bursting up round him, the rage on him after)
      const head = pr(pose.hip[0] + 30, 0, 118);
      const feet = pr(pose.hip[0], 0, 0);
      if (m > 0.3 && m < 0.97) for (let i = 0; i < 18; i++) {
        const ph = ((m - 0.3) * 1.6 + hash(i, 1, 9921)) % 1;
        const a = hash(i, 2, 9921) * Math.PI * 2;
        const r = 80 * (1 - ph);
        put(p, feet[0] + Math.cos(a) * r, feet[1] - 50 + Math.sin(a) * r * 0.6, ph > 0.6 ? FLAME[4] : FLAME[2]);
      }
      burst(p, head[0], head[1], sinceF / 0.25, 30, 9923);
      if (since > 0 && since < 0.95) arcs(p, head[0], head[1], since / 0.95, -Math.PI / 2, 1.5, 4, FLAME);
      if (since > 0.6 && since < 1.6) arcs(p, head[0], head[1], (since - 0.6) / 1.0, -Math.PI / 2, 1.5, 3, FLAME);
      flamePillars(p, pr, pose.hip[0], 0, 30, since / 1.1, fr);
      if (since > 0) {
        rage(p, d.px, fr, Math.min(1, since / 0.2));
        embers(p, feet[0], feet[1], 70, 150, m, 26, 9925);
      }
      dust(p, pr, 0, 0, since / 0.8, 9927, 18, 120);
      for (const [ts, s] of [[2.3, -1], [2.4, 1], [2.5, -1], [2.6, 1]] as const) dust(p, pr, pose.hip[0] + 12, s * 18, (m - ts) / 0.45, Math.round(9931 + ts * 10), 6, 16);
      if (m > 2.2 && m < 2.7) speedLines(p, hip[0], hip[1] - 60, tg[0] - hip[0], tg[1] - hip[1], 10, 40, 9933 + fr, FLAME[2]);
    }
    if (move === 'rush') {
      for (const ts of [0.52, 0.76]) {
        dust(p, pr, 0, -18, (m - ts) / 0.6, Math.round(9941 + ts * 100), 8, 18);
        chips(p, pr, 0, -18, m - ts, Math.round(9943 + ts * 100), 6);
      }
      // (breath steaming off his snout as he paws)
      if (m > 0.3 && m < 1.15) {
        const sn = pr(pose.hip[0] + 40, 0, 72);
        for (let i = 0; i < 8; i++) {
          const ph = (m * 2 + hash(i, 1, 9945)) % 1;
          put(p, sn[0] + ph * 14 + (hash(i, 2, 9945) - 0.5) * 6, sn[1] - ph * 8, ph < 0.5 ? '#d8d4e0' : '#9a96a8');
        }
      }
      if (m > 1.15 && m < 1.5) {
        speedLines(p, hip[0], hip[1] - 50, tg[0] - pr(0, 0, 0)[0], tg[1] - pr(0, 0, 0)[1], 16, 50, 9947 + fr, '#d8d0c0');
        for (let i = 0; i < 6; i++) dust(p, pr, pose.hip[0] - 20 - i * 18, (hash(i, 1, 9949) - 0.5) * 24, 0.2 + i * 0.1, 9951 + i + fr, 3, 10);
      }
      const hc = pr(RUSH_LONG - 10, 0, 50);
      burst(p, hc[0], hc[1], sinceF / 0.22, 30, 9953);
      dust(p, pr, RUSH_LONG + 24, 0, since / 0.8, 9955, 16, 40);
      chips(p, pr, RUSH_LONG + 24, 0, since, 9957, 16);
    }
    return kicked(p, kickOf(M.beats, t, fr));
  };
  return Object.assign(f, { k, long });
}


/** A mist wolf scene: `move` seen `view` at `yaw`, its floor point at (bx, by), the Brawler `tf` ahead and `tl` to its left. */
function wolfFilm(move: WolfMove, view: View, yaw: number, bx: number, by: number, tf: number, tl: number, k = 3): Scene {
  const size = { w: Math.ceil(W / k), h: Math.ceil(H / k), ax: bx, ay: by };
  const GROUND = groundFor(k);
  const FOGS: [number, number][] = [[50, 80], [0, -80]];
  const M = WOLF_MOVES[move];
  const long = M.long + M.beats.reduce((s, b) => s + b.freeze, 0);
  const f = (t: number): Px => {
    const m = clockOf(M.beats, t);
    const fr = Math.floor(t * 30);
    const pose = wolfPose(move, m);
    const d: Drawn = sculptWolf9(view, pose, yaw, size);
    const pr: Pr = (ff, l, u) => wolfAt(d, yaw, [ff, l, u]);
    const tg = pr(tf, tl, 0);
    const root = pr(pose.root[0], pose.root[1], 0);
    const beat = M.beats[0];
    const since = m - beat.at;
    const sinceF = t - beatFilm(M.beats, 0);
    const away = (fromF: number, fromL: number, far: number, at = beat.at): Struck => {
      const a = pr(fromF, fromL, 0);
      const dx = tg[0] - a[0];
      const dy = tg[1] - a[1];
      const n = Math.hypot(dx, dy) || 1;
      return { at, dx: dx / n, dy: dy / n, far };
    };
    const hits: Struck[] =
      move === 'bite' ? [away(0, 0, 14)] : move === 'claw' ? [{ ...away(0, 0, 22), dx: 0.55, dy: -0.85 }] : move === 'lunge' ? [away(0, 0, 20)] : move === 'cloud' ? [0.95, 1.35, 1.75, 2.15].map((q) => away(0, 0, 6, q)) : [];
    const p = GROUND.clone();
    if (move === 'lunge' && m > 0.35 && m < 0.72) warnLane(p, pr, 20, LUNGE_LONG + 30, 0, 16, t);
    if (move === 'bite' && m > 0.25 && since < 0) warnRing(p, pr, 74, 0, 20, t);
    if (move === 'claw' && m > 0.3 && since < 0) warnArc(p, pr, 22, 0, 30, 78, -1.1, 1.2, t);
    // (the ground scored by its three claws along the sweep, glowing, fading)
    if (move === 'claw' && since >= 0) {
      for (let c = 0; c < 3; c++) {
        const pts = arcPath([CLAW_ARC.about[0], CLAW_ARC.about[1], 0], [CLAW_ARC.from[0] + 20, CLAW_ARC.from[1] + c * 6, 0], [CLAW_ARC.to[0] + 6 - c * 4, CLAW_ARC.to[1] + c * 3, 0], 16);
        for (let i = 1; i < pts.length; i++) {
          if (i / pts.length > Math.min(1, sinceF / 0.06)) break;
          const a = pr(pts[i - 1][0], pts[i - 1][1], 0);
          const b2 = pr(pts[i][0], pts[i][1], 0);
          line(p, a, b2, '#1e1820', 2);
          if (since < 1.0 && hash(i, c, 9871) > since) line(p, a, b2, FLAME[2], 1);
        }
      }
    }
    if (move === 'cloud' && m > 0.3 && since < 0) warnRing(p, pr, 20, 0, 100, t);
    // (after-images of it while it strikes)
    const strike = M.strikes.find(([a, b]) => m >= a && m <= b + 0.1);
    if (strike && move !== 'howl' && move !== 'cloud') {
      const [a, b] = strike;
      for (let i = 4; i >= 1; i--) {
        const q = Math.max(a - 0.04, Math.min(m, b) - (i * (b - a)) / 4);
        const gd = sculptWolf9(view, { ...wolfPose(move, q), ghost: 0 }, yaw, size);
        ghost(p, gd.px, MIST, (1 - i / 5) * (m > b ? 1 - (m - b) / 0.1 : 1), 9810 + i);
      }
    }
    // (the fog wolves it calls, bursting out of mist either side of it)
    const fogs: { px: Px; ax: number; ay: number; x: number; y: number; keep: number }[] = [];
    if (move === 'howl') {
      FOGS.forEach(([ff, ll], i) => {
        const when = 1.2 + i * 0.25;
        mistCloud(p, pr, ff, ll, 34, Math.min(1, Math.max(0, (m - 0.95 - i * 0.2) / 0.3)), m, Math.max(0, (m - when - 0.6) / 0.6));
        if (m > when) {
          const fp = wolfPainted('stand', m + i * 0.3, 'front');
          const at = pr(ff, ll, 0);
          fogs.push({ px: fp.px, ax: WOLF_CANVAS.ax, ay: WOLF_CANVAS.ay, x: at[0], y: at[1], keep: Math.min(1, (m - when) / 0.25) });
        }
      });
    }
    // (the mist cloud, under the Brawler: he stays in sight in it, Animations 4)
    if (move === 'cloud') {
      const g = since < 0 ? 0 : Math.min(1, sinceF / 0.18);
      const thin = m < 2.5 ? 0 : (m - 2.5) / 0.7;
      mistCloud(p, pr, pose.root[0] + 20, 0, 120, g, m, thin * 1.2);
    }
    const hero = brawlerAt(view, t, m, hits, tg[0], tg[1]);
    const items = [{ kind: 'hero', y: hero.y }, { kind: 'wolf', y: root[1] }, ...fogs.map((q, i) => ({ kind: `fog${i}`, y: q.y }))].sort((a, b) => a.y - b.y);
    for (const it of items) {
      if (it.kind === 'hero') lay(p, hero.px, hero.ax, hero.ay, hero.x, hero.y);
      else if (it.kind === 'wolf') lay(p, d.px, 0, 0, 0, 0);
      else {
        const q = fogs[Number(it.kind.slice(3))];
        lay(p, q.px, q.ax, q.ay, q.x, q.y, q.keep);
      }
    }
    // OVER THEM
    const muzzle = pr(pose.root[0] + 72, 0, 74 + pose.root[2]);
    const hitAt = pr(tf, tl, 30);
    if (move === 'bite') {
      // (the jaws' crescents closing on you, huge; mist sprayed off the bite)
      if (m > 0.58) {
        slash(p, hitAt[0] - 4, hitAt[1] + 4, 22, -2.6, -0.4, (m - 0.58) / 0.2, [MIST[2], FLAME[2], '#fffaf0'], 4);
        slash(p, hitAt[0] - 4, hitAt[1] - 2, 22, 2.6, 0.4, (m - 0.6) / 0.2, [MIST[2], FLAME[2], '#fffaf0'], 4);
      }
      burst(p, hitAt[0], hitAt[1], sinceF / 0.18, 16, 9961);
      mistBurst(p, pr, -15, 0, (m - 0.55) / 0.5, 9963);
      mistBurst(p, pr, tf, tl, since / 0.5, 9965);
      if (strike) speedLines(p, muzzle[0], muzzle[1], 1, 0.55, 12, 20, 9967 + fr, MIST[4]);
    }
    if (move === 'claw') {
      // (three great claw crescents along the whole sweep, from where the paw was cocked to where it struck, white at the heart, edged
      // with its pink, the mist sprayed off them; they hang a moment and fade)
      const [s0, s1] = M.strikes[0];
      if (m >= s0 && since < 0.25) {
        // (three long claw marks swept down across you, round from above its shoulder, past you: white at the heart, its pink at the edge)
        const sp = pr(CLAW_ARC.about[0], CLAW_ARC.about[1], CLAW_ARC.about[2]);
        const dx = hitAt[0] - sp[0];
        const dy = hitAt[1] - sp[1];
        const r = Math.hypot(dx, dy);
        const ah = Math.atan2(dy, dx);
        const k = since < 0 ? (m - s0) / (s1 - s0) * 0.5 : 0.5 + since / 0.5;
        for (let c = -1; c <= 1; c++) slash(p, sp[0], sp[1], r + c * 7, ah - 1.7, ah + 1.0, k, [MIST[2], FLAME[2], '#fffaf0'], 6);
      }
      burst(p, hitAt[0], hitAt[1], sinceF / 0.2, 22, 9971);
      mistBurst(p, pr, tf, tl, since / 0.5, 9973);
      mistBurst(p, pr, CLAW_ARC.to[0], CLAW_ARC.to[1], since / 0.6, 9977);
      // (the mist streaming up off it while it rears)
      if (m > 0.2 && m < 0.62) embersMist(p, root[0] + 10, root[1] - 40, 70, 110, m, 26, 9975);
      if (m >= s0 && m <= s1 + 0.05) speedLines(p, hitAt[0], hitAt[1], -1, 0.3, 16, 30, 9979 + fr, MIST[4]);
    }
    if (move === 'howl') {
      const head = pr(pose.root[0] + 40, 0, 112);
      if (m > 0.88 && m < 2.4) {
        arcs(p, head[0], head[1], ((m - 0.88) % 0.5) / 0.5, -Math.PI / 2 - 0.25, 1.4, 3, [MIST[2], MIST[3], MIST[4]]);
        arcs(p, head[0], head[1], ((m - 0.63) % 0.5) / 0.5, -Math.PI / 2 - 0.25, 1.4, 3, [MIST[2], MIST[3], FLAME[2]]);
      }
      burst(p, head[0], head[1], sinceF / 0.2, 14, 9981);
      FOGS.forEach(([ff, ll], i) => mistBurst(p, pr, ff, ll, (m - 1.2 - i * 0.25) / 0.6, 9983 + i));
      if (m > 0.9 && m < 2.3) embersMist(p, root[0], root[1], 120, 40, m, 20, 9985);
    }
    if (move === 'lunge') {
      // (gathering: mist drawn into it; the streak of mist where it went; you, struck as it passes through)
      if (m > 0.35 && m < 0.7) for (let i = 0; i < 20; i++) {
        const ph = ((m - 0.35) * 2.2 + hash(i, 1, 9991)) % 1;
        const a = hash(i, 2, 9991) * Math.PI * 2;
        const r = 60 * (1 - ph);
        put(p, root[0] + Math.cos(a) * r, root[1] - 26 + Math.sin(a) * r * 0.6, ph > 0.6 ? MIST[4] : MIST[3]);
      }
      if (m > 0.7) {
        const reach = Math.min(LUNGE_LONG, pose.root[0]);
        for (let i = 0; i < 14; i++) {
          const ff = reach - i * 13;
          if (ff < -16) break;
          mistCloud(p, pr, ff, (hash(i, 1, 9993) - 0.5) * 10, 12, 1, m + i, Math.min(1.4, Math.max(0, (m - 0.84) * 1.6) + i * 0.05));
        }
      }
      if (strike) speedLines(p, root[0], root[1] - 30, 1, 0.55, 18, 26, 9995 + fr, MIST[4]);
      burst(p, hitAt[0], hitAt[1], sinceF / 0.2, 18, 9997);
      mistBurst(p, pr, LUNGE_LONG, 0, (m - 0.84) / 0.6, 9999);
    }
    if (move === 'cloud') {
      // (drawing the mist in; the blast of it outward; its claws in it at you; its eyes moving in it)
      if (m > 0.2 && m < 0.66) for (let i = 0; i < 24; i++) {
        const ph = ((m - 0.2) * 2.4 + hash(i, 1, 9801)) % 1;
        const a = hash(i, 2, 9801) * Math.PI * 2;
        const r = 90 * (1 - ph);
        put(p, muzzle[0] + Math.cos(a) * r, muzzle[1] + Math.sin(a) * r * 0.6, ph > 0.6 ? MIST[4] : MIST[3]);
      }
      mistRing(p, pr, pose.root[0] + 20, 0, 150, sinceF / 0.35);
      burst(p, muzzle[0], muzzle[1], sinceF / 0.18, 14, 9803);
      for (const q of [0.95, 1.35, 1.75, 2.15]) {
        slash(p, hitAt[0] - 2, hitAt[1] - 4, 18, q * 3 % 6.28, q * 3 % 6.28 + 2.2, (m - q + 0.06) / 0.25, [MIST[2], FLAME[2], '#fffaf0'], 3);
        burst(p, hitAt[0], hitAt[1], (m - q) / 0.12, 8, 9805);
      }
      if (since > 0 && m < 2.6) {
        const a = m * 2.2;
        const c = pr(pose.root[0] + 20 + Math.cos(a) * 50, Math.sin(a) * 50, 50);
        put(p, c[0], c[1], FLAME[4]);
        put(p, c[0] + 4, c[1] - 1, FLAME[4]);
        put(p, c[0] + 1, c[1], FLAME[2]);
        put(p, c[0] + 5, c[1] - 1, FLAME[2]);
      }
    }
    return kicked(p, kickOf(M.beats, t, fr));
  };
  return Object.assign(f, { k, long });
}


/**
 * AT YOUR PHONE'S OWN SIZE (`phone`): his question, 13 Nov 2026, 23:50: “Most of the guardian stuff is bad but from the phone screen it’s
 * probably okay??”. The game shows 639 game pixels across a phone 852 points wide (his: tools/scenarios/f9_lairs.mjs's canvas, 1662
 * picture pixels across at 1.3 times as wide), so 1278 picture pixels; a film that many pixels across, played across his phone held
 * sideways, shows them as big as the game does: each scene laid in its middle a pixel to a pixel, the grass round it.
 */
/** A part: `long` seconds of a scene, played from `from`, `slow` times slower. */
function part(scene: Scene, title: string, line2: string, from = 0, long = scene.long, slow = 1): Part {
  if (PHONE) {
    return { long: long * slow, title, line: line2, frame: (t) => {
      const sc = scene(from + t / slow);
      const out = PHONE_GROUND!.clone();
      out.blit(sc, Math.round((PW - sc.w) / 2), Math.round((PH - sc.h) / 2));
      return out;
    } };
  }
  return { long: long * slow, title, line: line2, frame: (t) => cut(scaled(scene(from + t / slow), scene.k), 0, 0, W, H) };
}

const smashF = chiefFilm('smash', 'front', 25, 250, 228, 104, -10);
const smashB = chiefFilm('smash', 'back', 25, 330, 300, 104, 40);
const slamF = chiefFilm('slam', 'front', 55, 135, 246, 118, 0);
const cryF = chiefFilm('warcry', 'front', 25, 230, 215, 140, 0);
const rushF = chiefFilm('rush', 'front', 40, 110, 195, RUSH_LONG + 40, 0);
const biteF = wolfFilm('bite', 'front', 42, 130, 150, 104, 0);
const clawF = wolfFilm('claw', 'front', 42, 140, 150, 90, 0);
const howlF = wolfFilm('howl', 'front', 42, 150, 150, 110, -40);
const lungeF = wolfFilm('lunge', 'front', 42, 110, 125, 84, 0);
const cloudF = wolfFilm('cloud', 'front', 42, 130, 150, 92, 0);

const CS = CHIEF_MOVES.smash.beats[0].at;
export const parts: Part[] = [
  part(smashF, 'THE TROLL CHIEFTAIN’S CLUB SMASH', 'Rears right back, the club over his head, HELD, its ring marked · down in two frames · the freeze, the ground broken'),
  part(smashF, 'THE CLUB SMASH · HALF SPEED', 'Over and down in a flash, after-images and all · the burst · thrown back', CS - 0.12, 0.6, 2),
  part(smashB, 'THE CLUB SMASH · FROM BEHIND', 'Get out of the ring while he holds it up'),
  part(slamF, 'HIS GROUND SLAM', 'Squats, LEAPS, hangs there, the line marked · crashes down: the ground split open, rock thrust up along it'),
  part(cryF, 'HIS WAR CRY: HIS RAGE', 'Gathers it in, shaking · thrown open: the roar, the fire bursting up round him · the rage on him: quicker blows, quicker feet'),
  part(rushF, 'HIS BULL RUSH', 'Head down, the club a ram, pawing the ground, coiled, his line marked · down it in a blur · into you'),
  part(biteF, 'THE MIST WOLF’S BITE', 'Coiled back on its haunches, HELD · flung at you, jaws wide, in two frames · snapped shut, worried, let go'),
  part(biteF, 'THE BITE · HALF SPEED', 'Flung, snapped', WOLF_MOVES.bite.beats[0].at - 0.13, 0.45, 2),
  part(clawF, 'ITS CLAW SWEEP', 'Rears right up, a forepaw cocked high, HELD, its sweep marked · crashes down across you in two frames: three claw marks'),
  part(howlF, 'ITS HOWL', 'Head down, then thrown back: the howl · the floor’s wolves burst out of the mist to it'),
  part(lungeF, 'ITS LUNGE', 'Crouched flat, the mist drawn into it, its line marked · gone to mist, through you in a blink · lands beyond, turned back'),
  part(lungeF, 'THE LUNGE · HALF SPEED', 'Through you', 0.66, 0.4, 2),
  part(cloudF, 'ITS MIST CLOUD', 'Draws the mist in · blasts it out and is gone into it · its claws come at you out of it · it thins'),
];

const [out = 'f9_bosses_film.mp4', mode = ''] = process.argv.slice(2);
let total = 0;
for (const p of parts) total += p.long;
console.log(parts.length, 'parts,', total.toFixed(1), 's');
if (mode === 'stills') {
  const dir = process.argv[4] ?? 'stills';
  mkdirSync(dir, { recursive: true });
  const at = (process.argv[5] ?? '').split(',').filter(Boolean).map(Number);
  const only = process.argv[6] ? process.argv[6].split(',').map(Number) : null;
  parts.forEach((p, i) => {
    if (only && !only.includes(i)) return;
    for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8]) writeFileSync(`${dir}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, p.long * k))));
  });
} else if (mode === 'count') {
  parts.forEach((p, i) => console.log(i, p.long.toFixed(2), p.title));
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'f9_bosses_captions_'));
  const filters: string[] = [];
  let at = 0;
  parts.forEach((p, i) => {
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${PHONE ? PH : H}-44:fontsize=18:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    at += p.long;
  });
  const OW = PHONE ? PW : W;
  const OH = PHONE ? PH : H;
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${OW}x${OH}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = Buffer.alloc(OW * OH * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of parts.entries()) {
      const frames = Math.round(p.long * FPS);
      for (let f = 0; f < frames; f++) {
        const px = p.frame(f / FPS);
        for (let k = 0, j = 0; k < OW * OH * 4; k += 4, j += 3) {
          rgb[j] = px.d[k];
          rgb[j + 1] = px.d[k + 1];
          rgb[j + 2] = px.d[k + 2];
        }
        if (!ff.stdin.write(rgb)) await new Promise((r) => ff.stdin.once('drain', r));
        n++;
      }
      console.log(`part ${i} done (${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code) => console.log('ffmpeg done', code, out, n, 'frames'));
}
