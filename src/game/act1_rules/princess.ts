// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16'S BOSS: THE PRINCESS: her rules (game/act1_rules/types.ts). Behind HIGH_CITY
// (game/act1.ts, off): nothing of the game brings her while it is off (game/bosses.ts bossKind, the Warden stands in).
//
// HIS DOC ("Wordsmith Act 2, Part Two: The High City (Levels 16–20)", level 16): "Her floor is the Swan Pavilion. ... She
// never makes a sound." Her moves: "a lash of nettle thread (her basic attack); the Shirt [his pick in its place, “Vine snare
// (Recommended)”], ... holds you for a moment; the Eleven, her swan brothers diving across the floor in lines you must step
// between; and the Vow, a ring of silence round her that darkens your words while you stand in it. Each phase brings more swans
// and more thread, by your rule of fights." "When she falls: the half-made shirt drops, the swans fly off over the wall, and
// she whispers her first words in weeks: “Stop the dancing.”" Her steed, his ultimate for her: “It’s her ultimate ability so it
// can slot into whatever that might have been.  I want it to last a while and you have to really dodge around a bit to not get
// hit.” Her look and every move of hers are the art chat's, with his yes (art/princess.ts, princess_moves.ts, princess_ride.ts,
// spectral_steed.ts, princess_fx.ts, garden_swans.ts; docs/mockups/swan_gardens/README.md), drawn to his sizes: “The size of
// these hits needs to be so much bigger.  Like imagine the size of the boss arena.”, the lash “Triple that at least”, and of
// her pace, “Her move speed is shit”. And his rule of 28 Oct, “And bigger AOE to compensate for the extra time the player gets
// to evade”. No mouth of hers makes a sound but her one whisper as she falls; her vines and her steed's hooves are heard.
//
//   HER GAIT: she hovers and glides (PR_PACE, four tiles a second: the hero walks 4.6), never still for long: between her moves
//     she darts about the hero, `glide.near` to `glide.far` tiles from him, round him by turns to one side and the other,
//     hovering a moment between darts; a hero far off, she glides at him. Her garden's swans circle her always (drawn:
//     render/act1_fx/princess.ts), more of them each phase.
//   THE NETTLE VINE LASH, her basic blow (the art's PR_LASH, 1.6 s): the vine grown out its whole length to her right through
//     the warning (0.4 to 0.7: the way it will come marked on the floor in the enemy's pink), then in two frames it lashes a
//     quarter turn round her front through the air, from 45 degrees to her right to 45 to her left, `lash.reach` (7.5) tiles
//     long, at knee to waist height: whoever is in that wedge at its blow (24/30) is struck; not beside or behind her, not
//     beyond its tip.
//   THE VINE SNARE (the art's PR_SNARE; SNARE_FX): her hands lifted high and held (the warning); as the warning ends the place
//     the hero stands is marked (a ring 5 tiles across in the enemy's pink), and as her hands come down (25/30) the floor there
//     heaves; a tenth of a second on the thicket bursts up, and whoever is inside its ring is struck by its thorns and HELD IN:
//     neither his walk, nor a roll, nor a leap takes him out past its vines. It holds until it withers, six seconds after her
//     blow (`snare.sink`), or until it is broken: it has `snare.life` blows of life (his: “The cage could have a HP bar and you
//     can destroy it but it stays longer if you don't destroy it”), a bar of it drawn under the cage; every blow of the hero's
//     that reaches it (game.ts breakProps: a swing, a shot through it, a blast on it) takes one, no more than one in `snare.gap`
//     seconds; it is struck down a stage at each (the art's SnareState), and at the last it bursts apart.
//   THE ELEVEN (the art's PR_ELEVEN): her arms spread like wings (the warning, from 0.5): eleven lines across her whole arena,
//     `eleven.apart` (1.5) tiles apart, along the floor's length the way she faces the hero (along x or along y, whichever is
//     nearer), the middle one through where he stands, each marked by falling white feathers; at her blow (29/30) a swan dives
//     along each from her side the length of the arena (`eleven.speed`, 24 tiles a second: twenty tiles in under a second),
//     the middle first and the others after it in a V. Whoever is on a line (his middle within `eleven.half` of it) as its swan
//     passes is struck; the gaps between are safe.
//   THE VOW (the art's PR_VOW; VOW_FX): a finger to her lips, her head bowed (the warning, from 0.55); at her blow (1.0) a ring of
//     silence bursts out round her, 10 tiles across, and holds 3 seconds, going with her: as it bursts it strikes whoever is
//     inside it (the main chat's pick: a move worth stepping out of), and while it holds, his words are dark (Game.hush, as the
//     Hush's are) for as long as he stands in it, and a moment after.
//   HER ULTIMATE, THE SPECTRAL STEED (the art's rideForm, rideLeap, rideEnd): the steed forms under her (1.4 s), then fifteen
//     leaps of a second each (RIDE_LEAP): gathered on its haunches (the warning), it springs, and the game carries her through
//     the air (`ride.air`) to where it lands, its forehooves slamming down in two frames (26/30) and the fog bursting round them:
//     whoever is within `ride.r` of where they come down is struck. HIS PATTERN (“How about the first half go around and the
//     second half go for the player”): the first eight a lap of her arena (eight points round its middle, a leap of about 4.5
//     tiles apart: RIDE_LEAP.carry), the last seven each at the hero, landing where he stood as it sprang (the ring marked
//     there from its spring: he has its half second in the air to get out). Then the steed fades (1.4 s). While she rides, her
//     life is not brought below 1; struck down to it, the steed fades first and she falls after.
//   WHEN SHE COMES: at the start of her second phase and of her third (the rules bring it as her life crosses into each), and
//     in her third again every `ride.again` seconds after the last.
//   HER PHASES (his gameplay rulebook, "Fights": each phase harder than the last; his doc, "Each phase brings more swans and
//     more thread"): three, by her life (`at`). More thread: her lash twice in a row from the second; her snare, her Eleven and
//     her Vow sooner (`cd`). More swans: more circle her (`swans`), and in her third the Eleven flies twice, the second flight
//     half a gap over and a little after the first (its gaps the first's lines), so that he must step again.
//   HER DEATH (his pick, “Steed fades, vines wither (Recommended)”): if she is on her steed it fades first (above); her snare's
//     vines wither and sink, letting him go; her ring of silence thins away; her swans fly off over the wall (drawn); she sinks
//     to her knees (her picture: PR_DIES); and as she falls she whispers her one line, “Stop the dancing.” (his doc's), over her
//     as a boss's words are shown (the 'bossSay' event: render/fx.ts). What of hers was still to come does not come.
//
// HER GROUND (her darts, her laps, the Eleven's lines): her open area where the floor's map-maker says (Land.areas' boss: the
// place helper lays her arena by the lake), else the floor round where she stood (the practice room), each as far as it is
// joined to where she stood.
//
// Every number here that is a picture's is written down here; tests/act2_princess.test.ts holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { blobDist } from '../act1_layout';
import { MSG, TUNE } from '../defs';
import { fromFigure, handOf } from '../facing';
import type { Game } from '../game';
import type { Level, Monster, Peril } from '../state';
import { T_FLOOR } from '../types';
import type { Act1Rules } from './types';

const D = Math.PI / 180;
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** HER WORDS AS SHE FALLS (his doc's): her one line, whispered. */
export const PRINCESS_WHISPER = 'Stop the dancing.';

/** THE NUMBERS OF HER FIGHT: her pictures' own (art/princess_moves.ts, princess_ride.ts, princess_fx.ts, in tiles and seconds), and the rules'. */
export const PRINCESS = {
  /** Her glide (PR_PACE, PR_GLIDE: twelve frames at twenty a second). */
  pace: 4.0,
  glideFps: 20,
  /**
   * The lash (PR_LASH, 1.6 s): its warning, its strike (two frames), its blow; the wedge it strikes, degrees round from her
   * front to her left (`from` her right, `to` her left: `area`); its reach (LASH_REACH, 7.5 tiles); where the vine is held
   * through the warning (`held`, degrees: PR_LASH.from).
   */
  lash: { long: 1.6, warn: [0.4, 0.7] as const, strike: [22 / 30, 24 / 30] as const, hit: 24 / 30, from: -45, to: 45, reach: 7.5, held: -62 },
  /**
   * The snare (PR_SNARE, 1.6 s; SNARE_FX, from her blow): the warning, the blow; the floor heaving (`heave`), the burst
   * (`burst`), withering and sinking (`sink`), how far out it is (`r`: 5 tiles across), how long a blow shakes it (`shake`:
   * SNARE_FX.hit), how long it takes to burst apart (`breaks`). The rules': its life in blows (`life`), the least time between
   * two that count (`gap`); how far in from its ring the hero is kept (`inside`).
   */
  snare: { long: 1.6, warn: [0.42, 0.72] as const, hit: 25 / 30, heave: 0.1, burst: [0.1, 0.1667] as const, sink: [6.0, 6.6] as const, r: 2.5, shake: 0.14, breaks: 0.9, life: 3, gap: 0.2, inside: 0.35 },
  /**
   * The Eleven (PR_ELEVEN, 1.8 s): the warning, the blow. The rules': `n` lines `apart` tiles apart; a hero within `half` of
   * a line as its swan passes is struck; its swans at `speed` tiles a second, each line's `stagger` seconds after the one
   * nearer the middle; a line runs as far as the floor does, to `most` tiles either side of the hero, and none shorter than
   * `least`.
   */
  eleven: { long: 1.8, warn: [0.5, 0.85] as const, hit: 29 / 30, n: 11, apart: 1.5, half: 0.45, speed: 24, stagger: 0.04, most: 13, least: 3 },
  /** The Vow (PR_VOW, 1.9 s; VOW_FX, from her blow): the warning, the blow; its ring `r` tiles out (10 across), out in `burst`, held `hold`, thinning `fade`; his words dark for `dark` seconds more than he stands in it. */
  vow: { long: 1.9, warn: [0.55, 0.9] as const, hit: 1.0, r: 5, burst: 0.0667, hold: 3.0, fade: 0.6, dark: 0.3 },
  /**
   * The steed (RIDE_FORM, RIDE_LEAP, RIDE_END): forming (`form`, its warning `formWarn`), a leap (`leap`: its warning, its
   * spring, in the air `air`, its blow `hit`), fading (`end`); fifteen leaps, the first `laps` round her arena, `carry` tiles
   * apart, the rest `atYou`. The rules': whoever is within `r` tiles of where its forehooves come down (`hoof` tiles before her
   * floor point: tests hold it to the art) is struck; a leap at the hero no further than `most` tiles.
   */
  ride: { form: 1.4, formWarn: [0.3, 0.5] as const, leap: 1.0, leapWarn: [0.17, 0.27] as const, spring: 0.27, air: [0.36, 26 / 30] as const, hit: 26 / 30, end: 1.4, carry: 4.5, laps: 8, atYou: 7, r: 1.6, hoof: 0.4, most: 14 },
  /** Struck (PR_REEL), her death (PR_DIES), as she sinks out of the air (`sink`). */
  reel: 0.4,
  dies: { long: 3.2, sink: 0.9 },
  /** Her ground where the floor does not say (tiles round where she stood), and its open area's blob (as the Censor's). */
  ground: { blob: 1.08, far: 12 },
};

/**
 * HER FIGHT: her phases and how she moves between her moves.
 *   `at`: her life's shares below which her second and third phases begin.
 *   `swans`: how many circle her in each phase.
 *   `cd`: her snare's, her Eleven's and her Vow's waits, times their own, in each phase.
 *   `lashes`: her lash, so many in a row in each phase.
 *   `twice`: from which phase the Eleven flies twice; the second flight `shift` tiles over (half a gap) and `late` seconds after.
 *   `glide`: her darts, `near` to `far` tiles from the hero, turned `turn` degrees round him from where she was; hovering
 *     `hover` seconds between them; a dart given up after `most` seconds; past `chase` tiles off, she glides at him.
 *   `again`: in her third phase, the steed again so many seconds after the last ride.
 */
export const PRINCESS_FIGHT = {
  at: [2 / 3, 1 / 3] as const,
  swans: [3, 4, 5] as const,
  cd: [1, 0.8, 0.65] as const,
  lashes: [1, 2, 2] as const,
  twice: 3,
  shift: 0.75,
  late: 0.55,
  glide: { near: 3.5, far: 6, turn: [35, 100] as const, hover: [0.08, 0.3] as const, most: 1.8, chase: 8.5 },
  again: 35,
};

/** Her glide, painted for four tiles a second (twelve frames at twenty a second): stopped at any frame of it. */
export const PRINCESS_GAIT: GaitDef = { pace: PRINCESS.pace, cycle: 1 / PRINCESS.glideFps, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 4.5, slack: 1.0, trueBack: true };

/** Her acts: her basic blow first and her biggest last (her rulebook: the bigger, the longer the cooldown); then her ultimate's three, brought by the rules. */
export const PRINCESS_ACTS: readonly ActDef[] = [
  { id: 'princess:lash', clip: 'attack', long: PRINCESS.lash.long, hit: PRINCESS.lash.hit, dmg: 1, cooldown: 0, first: 0, after: 0.9, near: 0, far: 6.5 },
  { id: 'princess:snare', clip: 'snare', long: PRINCESS.snare.long, hit: PRINCESS.snare.hit, dmg: 0.4, cooldown: 10, first: 5, after: 0.6, near: 0, far: 12 },
  { id: 'princess:eleven', clip: 'eleven', long: PRINCESS.eleven.long, hit: PRINCESS.eleven.hit, dmg: 0.7, cooldown: 13, first: 8, after: 0.6, near: 0, far: 14 },
  { id: 'princess:vow', clip: 'vow', long: PRINCESS.vow.long, hit: PRINCESS.vow.hit, dmg: 0.8, cooldown: 17, first: 11, after: 0.6, near: 0, far: 4.5 },
  { id: 'princess:ride', clip: 'rideForm', long: PRINCESS.ride.form, hit: 1.1, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'princess:leap', clip: 'rideLeap', long: PRINCESS.ride.leap, hit: PRINCESS.ride.hit, dmg: 1, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true },
  { id: 'princess:unride', clip: 'rideEnd', long: PRINCESS.ride.end, hit: 1.15, dmg: 0, cooldown: 0, first: 0, after: 0.4, near: 0, far: 99, forced: true },
];
const IDX = (id: string): number => PRINCESS_ACTS.findIndex((a) => a.id === id);
const RIDING = new Set(['princess:ride', 'princess:leap', 'princess:unride']);

// ---------------------------------------------------------------------------------------------
// HER GROUND

const GROUNDS = new WeakMap<Level, { key: number; mask: Uint8Array; cx: number; cy: number; n: number }>();

/** Her ground (see above): a tile to each, 1 for hers; and its middle (her open area's, else the middle of its tiles). */
export function princessGround(L: Level, hx: number, hy: number): { mask: Uint8Array; cx: number; cy: number; n: number } {
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const key = Math.floor(hy) * W + Math.floor(hx);
  const was = GROUNDS.get(L);
  if (was && was.key === key) return was;
  const area = L.land?.areas.find((a) => a.role === 'boss' && blobDist(a.blob, hx, hy) < 1.2);
  const inside = area ? (x: number, y: number) => blobDist(area.blob, x + 0.5, y + 0.5) < PRINCESS.ground.blob : (x: number, y: number) => Math.hypot(x + 0.5 - hx, y + 0.5 - hy) <= PRINCESS.ground.far;
  const mask = new Uint8Array(W * H);
  let start = key;
  if (L.walk[start] !== 1) {
    let bd = Infinity;
    for (let y = Math.max(0, Math.floor(hy) - 3); y <= Math.min(H - 1, Math.floor(hy) + 3); y++) {
      for (let x = Math.max(0, Math.floor(hx) - 3); x <= Math.min(W - 1, Math.floor(hx) + 3); x++) {
        const d = Math.hypot(x + 0.5 - hx, y + 0.5 - hy);
        if (L.walk[y * W + x] === 1 && d < bd) {
          bd = d;
          start = y * W + x;
        }
      }
    }
  }
  let n = 0;
  let sx = 0;
  let sy = 0;
  if (L.walk[start] === 1) {
    const q = [start];
    mask[start] = 1;
    while (q.length) {
      const i = q.pop()!;
      const x = i % W;
      const y = (i - x) / W;
      n++;
      sx += x + 0.5;
      sy += y + 0.5;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
        const j = ny * W + nx;
        if (mask[j] || L.walk[j] !== 1 || !inside(nx, ny)) continue;
        mask[j] = 1;
        q.push(j);
      }
    }
  }
  const out = { key, mask, cx: area ? area.blob.x : n ? sx / n : hx, cy: area ? area.blob.y : n ? sy / n : hy, n };
  GROUNDS.set(L, out);
  return out;
}

/** Where she stood as she came into the world. */
function homeOf(m: Monster): { x: number; y: number } {
  return m.a1 && m.a1.hx !== undefined ? { x: m.a1.hx, y: m.a1.hy } : { x: m.x, y: m.y };
}
function groundOf(L: Level, m: Monster): { mask: Uint8Array; cx: number; cy: number; n: number } {
  const h = homeOf(m);
  return princessGround(L, h.x, h.y);
}
function onMask(L: Level, mask: Uint8Array, x: number, y: number): boolean {
  const tx = Math.floor(x);
  const ty = Math.floor(y);
  return tx >= 0 && ty >= 0 && tx < L.floor.w && ty < L.floor.h && mask[ty * L.floor.w + tx] === 1;
}
/** Whether one `r` across may glide straight from (x0, y0) to (x1, y1) (and stand there). */
function clearWay(g: Game, x0: number, y0: number, x1: number, y1: number, r: number): boolean {
  const d = Math.hypot(x1 - x0, y1 - y0);
  for (let s = 0.25; s < d; s += 0.25) if (!g.free(g.level.walk, x0 + ((x1 - x0) * s) / d, y0 + ((y1 - y0) * s) / d, r)) return false;
  return g.free(g.level.walk, x1, y1, r);
}

// ---------------------------------------------------------------------------------------------
// HER PHASES

/** Her phase by her life (1, 2 or 3). */
export function phaseOf(m: Monster): number {
  const k = m.life / m.maxLife;
  return k > PRINCESS_FIGHT.at[0] ? 1 : k > PRINCESS_FIGHT.at[1] ? 2 : 3;
}
/** The phase she has come into (the steed brought at each: game/act1_rules/princess.ts). */
export function phaseIn(m: Monster): number {
  return Math.max(1, Math.min(3, m.a1?.ph ?? 1));
}
/** How many swans circle her now (in her phase). */
export function swansOf(m: Monster): number {
  return PRINCESS_FIGHT.swans[phaseIn(m) - 1];
}
/** Is she on her steed (forming, leaping or fading)? */
export function riding(m: Monster): boolean {
  return !!m.a1?.ri;
}

// ---------------------------------------------------------------------------------------------
// HER GLIDE: darting about the hero between her moves

/** A spot to dart to: round the hero from where she is, `near` to `far` from him, over floor she may glide across straight. */
function dartSpot(R: BossRules, m: Monster): { x: number; y: number } | null {
  const g = R.g;
  const h = g.hero;
  const L = g.level;
  const G = PRINCESS_FIGHT.glide;
  const s = m.a1!;
  const gr = groundOf(L, m);
  const heroIn = onMask(L, gr.mask, h.x, h.y);
  const d = Math.hypot(m.x - h.x, m.y - h.y);
  const a0 = Math.atan2(m.y - h.y, m.x - h.x);
  // (round him by turns, one side then the other, now and then the same side twice)
  s.sd = g.rng.chance(0.7) ? -(s.sd || 1) : s.sd || 1;
  const r0 = Math.min(m.r, 0.45);
  for (let k = 0; k < 18; k++) {
    let x: number;
    let y: number;
    if (d > G.chase && k < 6) {
      // (far off: at him, to `far` from him, a little to one side)
      const a = a0 + (g.rng.range(-25, 25) * D);
      const r = g.rng.range(G.near, G.far);
      x = h.x + Math.cos(a) * r;
      y = h.y + Math.sin(a) * r;
    } else {
      const side = k % 3 === 2 ? -s.sd : s.sd;
      const a = a0 + side * g.rng.range(G.turn[0], G.turn[1]) * D;
      const r = g.rng.range(G.near, G.far);
      x = h.x + Math.cos(a) * r;
      y = h.y + Math.sin(a) * r;
    }
    if (Math.hypot(x - m.x, y - m.y) < 1.2) continue;
    if (heroIn && !onMask(L, gr.mask, x, y)) continue;
    if (!clearWay(g, m.x, m.y, x, y, r0)) continue;
    return { x, y };
  }
  return null;
}

/**
 * HER GLIDE (PRINCESS_FIGHT.glide), between her moves: hovering a moment, then darting to a spot round the hero, straight, at
 * her pace (her glide's frames as far apart on the floor as they are painted for); her cooldowns run on. True while it is all
 * she does.
 */
function glide(R: BossRules, m: Monster, dt: number): boolean {
  const g = R.g;
  const h = g.hero;
  const G = PRINCESS_FIGHT.glide;
  const s = m.a1!;
  if (m.moveCd) for (let k = 0; k < m.moveCd.length; k++) m.moveCd[k] -= dt;
  m.state = 'chase';
  const hover = (): boolean => {
    const dx = h.x - m.x;
    const dy = h.y - m.y;
    const d = Math.hypot(dx, dy);
    if (d > 0.01) {
      m.fx = dx / d;
      m.fy = dy / d;
    }
    if (!m.gait || m.gait.mode !== 'stand') m.gait = { mode: 'stand', t: 0 };
    m.gait.t += dt;
    m.anim = 'idle';
    return true;
  };
  if (!s.gk) {
    s.hv = (s.hv ?? 0) - dt;
    if (s.hv > 0) return hover();
    const to = dartSpot(R, m);
    if (!to) {
      s.hv = 0.25;
      return hover();
    }
    s.gk = 1;
    s.gx = to.x;
    s.gy = to.y;
    s.gt = 0;
  }
  const dx = s.gx - m.x;
  const dy = s.gy - m.y;
  const d = Math.hypot(dx, dy);
  s.gt += dt;
  const stop = (): boolean => {
    s.gk = 0;
    s.hv = g.rng.range(G.hover[0], G.hover[1]);
    return hover();
  };
  if (d < 0.1 || s.gt > G.most) return stop();
  const sp = PRINCESS.pace * (m.chillT > 0 ? 1 - (m.chill ?? 0) : 1);
  m.fx = dx / d;
  m.fy = dy / d;
  const step = Math.min(d, sp * dt);
  const x0 = m.x;
  const y0 = m.y;
  g.slide(m, Math.min(m.r, 0.45), m.fx * step, m.fy * step, g.level.walk, true);
  const moved = Math.hypot(m.x - x0, m.y - y0);
  // (held up: she hovers, and darts again in a moment)
  if (moved < step * 0.2) return stop();
  if (!m.gait || m.gait.mode !== 'walk') m.gait = { mode: 'walk', t: 0 };
  m.gait.t += moved / PRINCESS_GAIT.pace;
  m.anim = 'walk';
  return true;
}

/** Her glide stopped where she is (she may stop at any frame of it): she hovers. */
function settle(m: Monster): void {
  const s = m.a1;
  if (s) s.gk = 0;
  m.gait = { mode: 'stand', t: 0 };
  m.anim = 'idle';
}

/** Which of her moves she would make now (the rules' own pick: the biggest ready that the hero is in reach of and in her sight), or -1. */
function readyAct(R: BossRules, m: Monster, dist: number): number {
  if (m.cd > 0 || !m.moveCd) return -1;
  const los = dist < 16 && R.g.sees(m.x, m.y, R.g.hero.x, R.g.hero.y);
  for (let i = PRINCESS_ACTS.length - 1; i >= 0; i--) {
    const a = PRINCESS_ACTS[i];
    if (a.forced || m.moveCd[i] > 0 || dist < a.near || dist > a.far || !los) continue;
    if (!RULES!.can!(R, m, a, dist, los)) continue;
    return i;
  }
  return -1;
}

// ---------------------------------------------------------------------------------------------
// THE LASH

/** Is the hero (or a point) in the lash's wedge from her, as it strikes: before her within its reach, 45 degrees to either side (and his size)? */
export function inLash(m: { x: number; y: number; fx: number; fy: number }, hand: number, x: number, y: number, size = TUNE.heroRadius * 0.5): boolean {
  const L = PRINCESS.lash;
  const r = fromFigure(m.x, m.y, m.fx, m.fy, hand, x, y);
  const d = Math.hypot(r.fwd, r.left);
  if (d > L.reach + size) return false;
  if (d <= 0.7) return r.fwd > -0.3;
  const bearing = Math.atan2(r.left, r.fwd) / D;
  const slack = Math.atan2(size, d) / D;
  return bearing >= L.from - slack && bearing <= L.to + slack;
}

// ---------------------------------------------------------------------------------------------
// THE SNARE

/** A snare's cage as the fight has it: blows of life left, when it was last struck (its clock), when it was broken (its clock; -1 not), whether it holds the hero. */
export interface Snare {
  life: number;
  struck: number;
  broken: number;
  held: boolean;
  /** (as she died: it withers from then) */
  wither: number;
}
const SNARES = new WeakMap<Peril, Snare>();
export function snareOf(p: Peril): Snare | undefined {
  return SNARES.get(p);
}
/** Whether a snare of hers holds the hero now. */
export function snared(g: Game): boolean {
  for (const p of g.perils) if (p.a1 === 'princess:snare' && SNARES.get(p)?.held) return true;
  return false;
}
/** A snare's state for its picture (art/princess_fx.ts SnareState): how much of it is left, since when it was struck, since when broken. */
export function snareLook(p: Peril): { hp: number; hitAgo?: number; brokenAgo?: number; t: number } {
  const S = PRINCESS.snare;
  const s = SNARES.get(p);
  if (!s) return { hp: 1, t: p.t };
  const t = s.wither >= 0 ? S.sink[0] + (p.t - s.wither) : p.t;
  if (s.broken >= 0) return { hp: (s.life + 1) / S.life, brokenAgo: p.t - s.broken, t };
  const out: { hp: number; hitAgo?: number; brokenAgo?: number; t: number } = { hp: s.life / S.life, t };
  if (s.struck >= 0 && p.t - s.struck < S.shake) out.hitAgo = p.t - s.struck;
  return out;
}

/** Keep the hero inside a cage that holds him (his walk, a roll's or a leap's end, all kept within its ring). */
function holdIn(g: Game, p: Peril): void {
  const h = g.hero;
  const most = PRINCESS.snare.r - PRINCESS.snare.inside;
  const inside = (x: number, y: number): { x: number; y: number } => {
    const d = Math.hypot(x - p.x, y - p.y);
    if (d <= most) return { x, y };
    return { x: p.x + ((x - p.x) * most) / d, y: p.y + ((y - p.y) * most) / d };
  };
  const at = inside(h.x, h.y);
  if (at.x !== h.x || at.y !== h.y) {
    // (back inside, onto floor he may stand on)
    if (g.free(g.level.walk, at.x, at.y, TUNE.heroRadius)) {
      h.x = at.x;
      h.y = at.y;
    } else {
      h.x = p.x + (at.x - p.x) * 0.9;
      h.y = p.y + (at.y - p.y) * 0.9;
    }
  }
  if (h.move) {
    const e = inside(h.move.x1, h.move.y1);
    h.move.x1 = e.x;
    h.move.y1 = e.y;
    const b = inside(h.move.x0, h.move.y0);
    h.move.x0 = b.x;
    h.move.y0 = b.y;
  }
}

// ---------------------------------------------------------------------------------------------
// THE ELEVEN

/** One of the Eleven's lines: across from the middle (`v`, tiles), from `u0` to `u1` along it; when its swan sets off (the peril's clock); whether it has struck. */
export interface SwanLine {
  v: number;
  u0: number;
  u1: number;
  go: number;
  done: boolean;
}
const LINES = new WeakMap<Peril, SwanLine[]>();
export function linesOf(p: Peril): readonly SwanLine[] {
  return LINES.get(p) ?? [];
}
/** Where the Eleven's swan of line `l` is along it at the peril's clock `t` (null: not yet set off, or gone). */
export function swanAt(l: SwanLine, t: number): number | null {
  if (t < l.go) return null;
  const u = l.u0 + PRINCESS.eleven.speed * (t - l.go);
  return u > l.u1 ? null : u;
}

/**
 * THE ELEVEN'S LINES through (ox, oy), along (ux, uy) (a way of the floor's, from her side), `shift` tiles across from the
 * middle: each as far along as the floor goes to `most` tiles either side, the run that is through the hero's own crossing
 * (or the longest), none shorter than `least`.
 */
export function elevenLines(L: Level, ox: number, oy: number, ux: number, uy: number, shift = 0): SwanLine[] {
  const E = PRINCESS.eleven;
  const f = L.floor;
  const vx = -uy;
  const vy = ux;
  const floorAt = (x: number, y: number): boolean => {
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    return tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && f.tiles[ty * f.w + tx] === T_FLOOR;
  };
  const out: SwanLine[] = [];
  const K = (E.n - 1) / 2;
  for (let k = 0; k < E.n; k++) {
    const v = (k - K) * E.apart + shift;
    const runs: [number, number][] = [];
    let a = NaN;
    for (let u = -E.most; u <= E.most + 1e-6; u += 0.25) {
      const on = floorAt(ox + ux * u + vx * v, oy + uy * u + vy * v);
      if (on && isNaN(a)) a = u;
      if (!on && !isNaN(a)) {
        runs.push([a, u - 0.25]);
        a = NaN;
      }
    }
    if (!isNaN(a)) runs.push([a, E.most]);
    const mine = runs.find(([p, q]) => p <= 0 && q >= 0) ?? runs.sort((p, q) => q[1] - q[0] - (p[1] - p[0]))[0];
    if (!mine || mine[1] - mine[0] < E.least) continue;
    out.push({ v, u0: mine[0], u1: mine[1] + 0.25, go: E.stagger * Math.abs(k - K), done: false });
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// THE STEED

/** Where the ride's lap goes round (her arena's middle) and how far out, for leaps `carry` apart. */
function lapOf(R: BossRules, m: Monster): void {
  const g = R.g;
  const s = m.a1!;
  const gr = groundOf(g.level, m);
  const P = PRINCESS.ride;
  s.cx = gr.cx;
  s.cy = gr.cy;
  s.lr = P.carry / (2 * Math.sin(Math.PI / P.laps));
  s.la = Math.atan2(m.y - s.cy, m.x - s.cx);
  s.ld = g.rng.chance(0.5) ? 1 : -1;
}
/** The `k`th point of her lap (1 to `laps`): round her arena's middle, pulled in toward it where the floor is not open there. */
export function lapPoint(g: Game, m: Monster, k: number): { x: number; y: number } {
  const s = m.a1!;
  const a = s.la + s.ld * k * ((2 * Math.PI) / PRINCESS.ride.laps);
  const gr = groundOf(g.level, m);
  for (let r = s.lr; r >= 1.5; r -= 0.25) {
    const x = s.cx + Math.cos(a) * r;
    const y = s.cy + Math.sin(a) * r;
    if (g.free(g.level.walk, x, y, 0.5) && (gr.n === 0 || onMask(g.level, gr.mask, x, y))) return { x, y };
  }
  return { x: s.cx, y: s.cy };
}
/** Where a leap at the hero comes down: where he stands, no further than `most`; back along the way to floor she may stand on. */
function leapAt(g: Game, m: Monster, x: number, y: number): { x: number; y: number } {
  const P = PRINCESS.ride;
  let dx = x - m.x;
  let dy = y - m.y;
  const d = Math.hypot(dx, dy);
  if (d > P.most) {
    dx *= P.most / d;
    dy *= P.most / d;
  }
  for (let k = 1; k >= 0; k -= 0.05) {
    const tx = m.x + dx * k;
    const ty = m.y + dy * k;
    if (g.free(g.level.walk, tx, ty, 0.45)) return { x: tx, y: ty };
  }
  return { x: m.x, y: m.y };
}
/** Turn her to (x, y). */
function faceTo(m: Monster, x: number, y: number): void {
  const d = Math.hypot(x - m.x, y - m.y);
  if (d < 0.05) return;
  m.fx = (x - m.x) / d;
  m.fy = (y - m.y) / d;
  if (m.act) m.act.hand = handOf(PRINCESS_GAIT.trueBack, m.fx, m.fy);
}
/** Where a leap's forehooves come down: before her landing point. */
export function hoofAt(m: { fx: number; fy: number }, x: number, y: number): { x: number; y: number } {
  return { x: x + m.fx * PRINCESS.ride.hoof, y: y + m.fy * PRINCESS.ride.hoof };
}

// ---------------------------------------------------------------------------------------------
// WHAT OF HERS GOES WITH HER

/** The monster whose peril it is (by name), alive. */
function herOf(g: Game, p: Peril): Monster | undefined {
  return g.monsters.find((o) => !o.dead && o.kind === 'princess' && o.name === p.from);
}

/** The peril of her act now (a snare's, the Eleven's), kept while the act is made: its clock is her act's until her blow. */
const LAYING = new WeakMap<Monster, Peril[]>();

// ---------------------------------------------------------------------------------------------
// HER RULES

export const RULES: Act1Rules | null = {
  gait: PRINCESS_GAIT,
  acts: PRINCESS_ACTS,

  spawned(_R, m) {
    m.a1 = { hx: m.x, hy: m.y, ph: 1, sd: 1, hv: 0, re: 0 };
  },

  tick(R, m, dt, dist) {
    const s = (m.a1 ??= { hx: m.x, hy: m.y, ph: 1, sd: 1, hv: 0, re: 0 });
    const acts = PRINCESS_ACTS;
    if (!m.moveCd || m.moveCd.length !== acts.length) m.moveCd = acts.map((a) => a.first * R.g.rng.range(0.7, 1.2));
    // STRUCK DOWN ON HER STEED: it fades first (and she falls after: `end`)
    if (s.ri && m.life <= 1 && !s.fall) {
      s.fall = 1;
      if (!m.act || m.act.id !== 'princess:unride') {
        R.breakOff(m);
        LAYING.delete(m);
        R.startAct(m, acts, IDX('princess:unride'));
        // (the steed fades where it stands: she faces as she was)
        return true;
      }
    }
    if (m.state === 'act') return false;
    if (s.ri) return false;
    if (phaseIn(m) >= 3) s.re = (s.re ?? 0) + dt;
    // (a move the rules bring, or one she is ready to make: she stops gliding at once, and the rules begin it)
    if (forcedIdx(R, m) >= 0 || readyAct(R, m, dist) >= 0) {
      if (s.gk || (m.gait && m.gait.mode !== 'stand')) settle(m);
      return false;
    }
    return glide(R, m, dt);
  },

  can(R, m, a, dist) {
    const g = R.g;
    if (riding(m)) return false;
    if (a.id === 'princess:snare') return !g.perils.some((p) => p.a1 === 'princess:snare' && p.from === m.name);
    if (a.id === 'princess:eleven') return !g.perils.some((p) => p.a1 === 'princess:eleven' && p.from === m.name);
    if (a.id === 'princess:vow') return dist <= a.far && !g.perils.some((p) => p.a1 === 'princess:vow' && p.from === m.name);
    return true;
  },

  forced(R, m) {
    return forcedIdx(R, m);
  },

  start(R, m, a) {
    const g = R.g;
    const act = m.act!;
    const s = (m.a1 ??= {});
    const ph = phaseIn(m);
    switch (a.id) {
      case 'princess:lash':
        // (a row of them begun, or the next of it)
        if (s.lq) s.lq = 0;
        else s.ln = PRINCESS_FIGHT.lashes[ph - 1] - 1;
        g.sfx('swing', 0.25);
        break;
      case 'princess:ride': {
        // HER ULTIMATE: her phase come into (it is what brings it), or her third's again
        const now = phaseOf(m);
        if (now > (s.ph ?? 1)) s.ph = now;
        s.ri = 1;
        s.rn = 0;
        s.re = 0;
        s.fall = 0;
        lapOf(R, m);
        g.msg(`${m.name} calls up the spectral steed`, MSG.foe);
        break;
      }
      case 'princess:leap': {
        const P = PRINCESS.ride;
        s.sx = m.x;
        s.sy = m.y;
        const k = s.rn ?? 0;
        // (the first eight round her arena; the last seven at the hero: where he stands is taken as it springs)
        const to = k < P.laps ? lapPoint(g, m, k + 1) : leapAt(g, m, g.hero.x, g.hero.y);
        s.tx = to.x;
        s.ty = to.y;
        act.x = to.x;
        act.y = to.y;
        act.a = k < P.laps ? 0 : 1;
        faceTo(m, to.x, to.y);
        break;
      }
      default:
        break;
    }
    void act;
  },

  acting(R, m, a, t0, t1, dt) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const s = m.a1!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    // (what she lays keeps time with her picture until her blow; the perils' step adds this step after)
    for (const p of LAYING.get(m) ?? []) if (!p.done && t1 < a.hit + 1e-6) p.t = t1 - a.hit - dt;
    switch (a.id) {
      case 'princess:lash': {
        const L = PRINCESS.lash;
        if (at(L.strike[0])) g.sfx('swing', 1);
        if (!at(L.hit)) break;
        // THE WHIP: the quarter turn round her front, its whole length
        if (inLash(m, act.hand, h.x, h.y)) R.blow(m, a.dmg);
        g.emit({ t: 'shake', amount: 2 });
        break;
      }
      case 'princess:snare': {
        const S = PRINCESS.snare;
        // (as her held hands' warning ends: where the hero stands is where it will burst)
        if (at(S.warn[1])) {
          const p = R.peril(m, 'act1', h.x, h.y, { a1: 'princess:snare', t: -(a.hit - S.warn[1]), hit: S.burst[0], dur: S.sink[1], dmg: g.rollMonsterDmg(m) * a.dmg });
          SNARES.set(p, { life: S.life, struck: -1, broken: -1, held: false, wither: -1 });
          LAYING.set(m, [p]);
        }
        if (at(a.hit)) {
          for (const p of LAYING.get(m) ?? []) p.done = 1;
          g.emit({ t: 'shake', amount: 2 });
          g.sfx('slam', 0.5);
        }
        break;
      }
      case 'princess:eleven': {
        const E = PRINCESS.eleven;
        // (her arms spread: the lines marked, across her arena along the floor's way nearest the hero's from her, the middle one through him)
        if (at(E.warn[0])) {
          const dx = h.x - m.x;
          const dy = h.y - m.y;
          const ux = Math.abs(dx) >= Math.abs(dy) ? Math.sign(dx) || 1 : 0;
          const uy = ux === 0 ? Math.sign(dy) || 1 : 0;
          const lay = (shift: number, late: number): Peril | null => {
            const lines = elevenLines(g.level, h.x, h.y, ux, uy, shift);
            if (!lines.length) return null;
            const end = Math.max(...lines.map((l) => l.go + (l.u1 - l.u0) / E.speed));
            const p = R.peril(m, 'act1', h.x, h.y, { a1: 'princess:eleven', fx: ux, fy: uy, t: -(a.hit - E.warn[0]) - late, hit: 0, dur: end + 0.6, dmg: g.rollMonsterDmg(m) * a.dmg, a: a.hit - E.warn[0] + late });
            LINES.set(p, lines);
            return p;
          };
          const first = lay(0, 0);
          if (first) LAYING.set(m, [first]);
          // (MORE SWANS: in her third phase a second flight, half a gap over, a little after; its clock runs by itself, behind)
          if (phaseIn(m) >= PRINCESS_FIGHT.twice) lay(PRINCESS_FIGHT.shift, PRINCESS_FIGHT.late);
        }
        if (at(a.hit)) {
          for (const p of LAYING.get(m) ?? []) p.done = 1;
          g.sfx('gust', 0.8);
        }
        break;
      }
      case 'princess:vow': {
        const V = PRINCESS.vow;
        if (!at(a.hit)) break;
        // THE RING OF SILENCE bursts out round her: whoever is inside struck as it bursts; it holds, going with her
        R.peril(m, 'act1', m.x, m.y, { a1: 'princess:vow', hit: 0, dur: V.hold + V.fade, dmg: 0 });
        if (Math.hypot(h.x - m.x, h.y - m.y) <= V.r) R.blow(m, a.dmg);
        g.emit({ t: 'shake', amount: 2 });
        break;
      }
      case 'princess:leap': {
        const P = PRINCESS.ride;
        // (at the hero: where he stands as it springs is where it comes down)
        if (act.a === 1 && at(P.spring)) {
          const to = leapAt(g, m, h.x, h.y);
          s.tx = to.x;
          s.ty = to.y;
          act.x = to.x;
          act.y = to.y;
          faceTo(m, to.x, to.y);
        }
        // CARRIED THROUGH THE AIR from where it sprang to where it comes down
        if (t1 > P.air[0]) {
          const u = clamp01((t1 - P.air[0]) / (P.air[1] - P.air[0]));
          m.x = s.sx + (s.tx - s.sx) * u;
          m.y = s.sy + (s.ty - s.sy) * u;
        }
        if (!at(a.hit)) break;
        // ITS FOREHOOVES COME DOWN, the fog bursting round them
        const f = hoofAt(m, m.x, m.y);
        if (Math.hypot(h.x - f.x, h.y - f.y) <= P.r + TUNE.heroRadius * 0.5) R.blow(m, a.dmg);
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('slam', 0.55);
        break;
      }
      default:
        break;
    }
  },

  end(R, m, a) {
    const g = R.g;
    const s = m.a1!;
    LAYING.delete(m);
    switch (a.id) {
      case 'princess:lash':
        // (MORE THREAD: her lash again at once, while the row lasts)
        if ((s.ln ?? 0) > 0) {
          s.ln--;
          s.lq = 1;
          m.cd = 0;
        }
        break;
      case 'princess:ride':
        m.cd = 0;
        break;
      case 'princess:leap':
        s.rn = (s.rn ?? 0) + 1;
        m.cd = 0;
        break;
      case 'princess:unride':
        s.ri = 0;
        s.re = 0;
        // (struck down on her steed: it has faded; now she falls)
        if (s.fall) {
          s.fall = 0;
          m.life = 0;
          g.kill(m);
          return;
        }
        break;
      default:
        break;
    }
    // (her waits, by her phase: sooner as it goes)
    const i = PRINCESS_ACTS.findIndex((x) => x.id === a.id);
    if (m.moveCd && i >= 0 && a.cooldown > 0) m.moveCd[i] *= PRINCESS_FIGHT.cd[phaseIn(m) - 1];
    // (she hovers a moment, then darts off)
    s.gk = 0;
    s.hv = 0;
  },

  lifeFloor(_R, m) {
    // (on her steed she is not brought below 1: struck down to it, the steed fades first)
    return riding(m) ? 1 : 0;
  },

  invulnerable(m) {
    // (as her steed fades under her, falling)
    return !!m.a1?.fall;
  },

  aloft(m) {
    // (carried through the air on her steed's leap: over what stands under it)
    if (!m.act || m.act.id !== 'princess:leap') return false;
    return m.act.t > PRINCESS.ride.air[0] && m.act.t < PRINCESS.ride.air[1];
  },

  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    switch (p.a1) {
      case 'princess:snare': {
        const S = PRINCESS.snare;
        const st = SNARES.get(p);
        if (!st) return;
        // (withering as she died: let go)
        if (st.wither >= 0) {
          st.held = false;
          return;
        }
        // THE BURST: whoever is inside its ring is struck by its thorns, and held in
        if (p.t - dt < S.burst[0] && p.t >= S.burst[0] && st.broken < 0) {
          if (!g.over && h.life > 0 && Math.hypot(h.x - p.x, h.y - p.y) <= S.r) {
            st.held = true;
            g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
          }
          g.emit({ t: 'shake', amount: 2 });
          g.sfx('slam', 0.35);
        }
        // (left alone, it withers and lets him go)
        if (p.t >= S.sink[0]) st.held = false;
        if (st.held && !g.over) holdIn(g, p);
        return;
      }
      case 'princess:eleven': {
        if (p.t < 0) return;
        const E = PRINCESS.eleven;
        if (p.done & 2) return;
        // (where the hero is from the lines: along them, and across)
        const dx = h.x - p.x;
        const dy = h.y - p.y;
        const uh = dx * p.fx + dy * p.fy;
        const vh = dx * -p.fy + dy * p.fx;
        for (const l of linesOf(p)) {
          if (l.done || p.t < l.go) continue;
          const a = l.u0 + E.speed * Math.max(0, p.t - dt - l.go);
          const b = l.u0 + E.speed * (p.t - l.go);
          if (a > l.u1) {
            l.done = true;
            continue;
          }
          if (Math.abs(vh - l.v) > E.half || uh < l.u0 - 0.3 || uh > l.u1 + 0.3) continue;
          if (uh < a - 0.35 || uh > b + 0.35) continue;
          const was = h.life;
          g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
          if (h.life < was) l.done = true;
        }
        return;
      }
      case 'princess:vow': {
        const V = PRINCESS.vow;
        // (it goes with her)
        const m = herOf(g, p);
        if (m) {
          p.x = m.x;
          p.y = m.y;
        }
        if (p.done || p.t >= V.hold || g.over) return;
        // HIS WORDS DARK while he stands in it
        if (Math.hypot(h.x - p.x, h.y - p.y) <= V.r) {
          const was = g.hushT;
          g.hush(V.dark);
          if (was <= 0) g.emit({ t: 'text', x: h.x, y: h.y, text: 'Hushed', color: '#9890b4' });
        }
        return;
      }
      case 'princess:fall': {
        // AS SHE FALLS: her one whisper
        if (!(p.done & 1) && p.t >= PRINCESS.dies.sink) {
          p.done |= 1;
          g.emit({ t: 'bossSay', text: PRINCESS_WHISPER, x: p.x, y: p.y, secs: 3.2 });
        }
        return;
      }
      default:
        return;
    }
  },

  floorBlow(R, p, x, y, rad) {
    // THE CAGE STRUCK: every blow of the hero's that reaches it takes a blow of its life (one in `gap` seconds at most)
    if (p.a1 !== 'princess:snare') return;
    const S = PRINCESS.snare;
    const st = SNARES.get(p);
    if (!st || st.broken >= 0 || st.wither >= 0 || p.t < S.burst[1] || p.t >= S.sink[0]) return;
    if (Math.hypot(x - p.x, y - p.y) > S.r + rad) return;
    if (st.struck >= 0 && p.t - st.struck < S.gap) return;
    const g = R.g;
    st.struck = p.t;
    st.life--;
    g.emit({ t: 'spark', x: x + (p.x - x) * 0.3, y: y + (p.y - y) * 0.3, el: 'phys', n: 6 });
    g.sfx('hit', 0.4);
    if (st.life <= 0) {
      // DESTROYED: it bursts apart, and lets him go
      st.life = 0;
      st.broken = p.t;
      st.held = false;
      p.dur = p.t + S.breaks;
      g.emit({ t: 'shake', amount: 2 });
    }
  },

  died(R, m) {
    const g = R.g;
    // (what of hers was still to come does not come; her snare withers and sinks, letting him go; her ring thins away)
    for (const p of g.perils) {
      if (p.kind !== 'act1' || !p.a1 || !p.a1.startsWith('princess:') || p.from !== m.name) continue;
      if (p.a1 === 'princess:snare') {
        const st = SNARES.get(p);
        if (p.t < PRINCESS.snare.burst[0] || !st) p.dur = Math.min(p.dur, Math.max(0, p.t));
        else if (st.broken < 0 && st.wither < 0 && p.t < PRINCESS.snare.sink[0]) {
          st.wither = p.t;
          st.held = false;
          p.dur = p.t + (PRINCESS.snare.sink[1] - PRINCESS.snare.sink[0]);
        }
      } else if (p.a1 === 'princess:eleven') {
        // (swans not yet set off do not come; those flying harm no more)
        if (p.t < 0) p.dur = p.t;
        else {
          p.done |= 2;
          for (const l of linesOf(p)) {
            l.done = true;
            if (l.go > p.t) l.go = Infinity;
          }
        }
      } else if (p.a1 === 'princess:vow') {
        p.done = 1;
        p.t = Math.max(p.t, PRINCESS.vow.hold);
      }
    }
    LAYING.delete(m);
    // HER SWANS FLY OFF OVER THE WALL, AND SHE WHISPERS AS SHE FALLS
    R.peril(m, 'act1', m.x, m.y, { a1: 'princess:fall', hit: 0, dur: PRINCESS.dies.long + 0.6, a: swansOf(m), b: g.time, done: 0 });
    void g;
  },
};

/** The act the rules bring now (her ultimate's next part; her phase come; her lash's row), or -1. */
function forcedIdx(R: BossRules, m: Monster): number {
  const s = m.a1;
  if (!s) return -1;
  const P = PRINCESS.ride;
  // (riding: the next leap, or the steed fades)
  if (s.ri) return (s.rn ?? 0) < P.laps + P.atYou ? IDX('princess:leap') : IDX('princess:unride');
  // (her phase come: her steed)
  if (phaseOf(m) > (s.ph ?? 1)) return IDX('princess:ride');
  // (her third: again, a while after the last)
  if (phaseIn(m) >= 3 && (s.re ?? 0) >= PRINCESS_FIGHT.again) return IDX('princess:ride');
  // (a row of lashes: the next straight after, while he is in its reach and her sight)
  if (s.lq) {
    const h = R.g.hero;
    const L = PRINCESS_ACTS[0];
    if (Math.hypot(h.x - m.x, h.y - m.y) <= L.far && R.g.sees(m.x, m.y, h.x, h.y)) return 0;
    s.lq = 0;
    s.ln = 0;
  }
  return -1;
}

/** (for the tests and the pictures) Whether an act of hers is one of her ultimate's. */
export function rideAct(id: string): boolean {
  return RIDING.has(id);
}
