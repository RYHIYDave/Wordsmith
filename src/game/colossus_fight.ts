// THE SWAMP COLOSSUS: HIS FIGHT'S RULES (floor 10's boss redone; the main chat's, to the art chat's pictures).
//
// HIS WORDS, 7 Nov 2026: 00:07, “i think the whole sunken eye fight needs to be redone.  hes just not scary or intimidating.  the
// arena doesnt really work, and his entrance is not epic.”; 00:08, “maybe instead of a circle its a big rectangle and hes in the
// water in front of you.”; 00:10, “start with just tentacles coming up, kill both of them, then he emerges with three.  kill the
// three with extra attacks from the main body, final phase he uses the magic, maybe keep three tentacles.  kill the tentacles and
// his body.  flasks reset in between each phase for now”; 20:25, the water slams (“slam the water on the left sending a wave right
// across the platform, then on the right sending a wave to the left, then both sides simultaneously to send a big crash into the
// middle”); 20:29, the shovel (“submerge, and then pop up on a random end of the platform and try to shovel the player into its
// mouth ... If you get hit it knocks you closer to the mouth.  Get too close and it snaps shut for massive damage”); and his pick for
// all of it, “Yes, nowhere safe (Recommended)”. His look and every move are the art chat's (art/eye_colossus.ts, eye_moves.ts,
// eye_arms.ts, eye_shovel.ts; docs/mockups/eye_redo/README.md), each with his yes; every time and length here is theirs, read off
// their frames (30 a second). What hurts, how hard, how often, and when his phases change are these rules.
//
// WHERE: THE STONE, a rectangle 17 tiles across the screen by 11 deep, its far long edge open on the black water. These rules
// keep their own plan of it: `u` along the stone from its left end (0 to 17), `v` across it from its back edge by the water (0)
// to its near edge (11); the water at v < 0. A tile is the game's (C_TILE). The game lays the stone and turns this plan into
// its own tiles (the game's part, not here).
//
// THE FIGHT AS A WHOLE (`ColossusFight`): it is stepped with where the hero stands on the plan and whether he is rolling or
// leaping through (the game's dodge: nothing here hurts him then, and what he goes through has passed him); it says what
// happens as events (a line laid, a blow landed, the hero hurt with how hard and which way he is knocked, a phase changed, the
// flasks refilled). What it keeps of his tentacles is where they are and what they are doing; their life is the game's
// (monsters of their own), and the game says when one is killed (`armKilled`) and when he is (`bodyKilled`).
//
// NOTHING OF THE GAME USES THIS WHILE `COLOSSUS.on` IS OFF (his rule: pictures first).

import type { RNG } from '../engine/rng';

/** Off: the fight of floor 10 is the old Drowned Eye's. On only at his yes to its pictures in play. */
export const COLOSSUS = { on: false };

const FPS = 30;
const fr = (n: number): number => n / FPS;
const D = Math.PI / 180;

// ---------------------------------------------------------------------------------------------
// THE PLACE (the art chat's README, "For the main chat" and "The numbers")

/** The stone: tiles along it (u) and across it (v). */
export const STONE = { w: 17, d: 11 } as const;
/** His middle at his place: out in the water, at the middle of the stone's length. */
export const HIS_PLACE = { u: 8.5, v: -7.9 } as const;
/** Where his tentacles stand: their roots this far out in the water from the stone's back edge, along it at these. */
export const ROOT_OUT = 1.38;
export const ROOTS: Readonly<Record<1 | 2 | 3, readonly number[]>> = {
  1: [8.5 - 2.83, 8.5 + 2.83],
  2: [8.5 - 5.66, 8.5, 8.5 + 5.66],
  3: [8.5 - 5.66, 8.5, 8.5 + 5.66],
};
/**
 * The turns each tentacle's slam is drawn for (degrees from straight across the stone, + toward its right end), every `step`:
 * those whose line crosses the stone. Phase 1's two; phases 2 and 3's left, middle and right.
 */
export const TURNS = {
  step: 3,
  1: [[-75, 78], [-78, 75]] as const,
  2: [[-60, 78], [-78, 78], [-78, 60]] as const,
};

// ---------------------------------------------------------------------------------------------
// HIS TENTACLES' MOVES (`src/art/eye_arms.ts`)

/** A tentacle standing: a loop of `stand` seconds (two in his stand); its moves begin as it comes round. Its body `r` tiles round its root (2.1 thick at the water). */
export const ARM = { stand: fr(45), r: 1.05, burst: fr(32), death: fr(90) } as const;
/**
 * THE SLAM ON THE STONE (`armSlam`, 74 frames): its line laid at once (the warning, held through the wind-up); the hit on
 * frame 28, stretched out along the whole line to where it leaves the stone; lying there to frame 42, dragged back to 52,
 * peeled up off the stone by 60, standing again by 72. Its line is `width` tiles wide. From the hit until it is peeled up it
 * lies along its line, and the hero's blows reach it anywhere along it.
 */
export const SLAM = { long: fr(74), hit: fr(28), lying: [fr(28), fr(60)] as const, width: 1.1 } as const;
/** THE WATER SLAM (`armSmash`, 74 frames, the left and right ones of phases 2 and 3): its warning over the whole stone; it smashes into the water off the stone's end on frame 28. */
export const SMASH = { long: fr(74), hit: fr(28) } as const;
/**
 * EACH WAVE: formed `off` tiles off the stone's end as the water is smashed, it rolls across at `speed` tiles a second, its
 * front leading at the back (`slant` tiles behind for every tile toward the near edge), over the whole depth (nowhere safe:
 * dodged through), dying `die` tiles past the far end. It hurts the hero once as its face (`face` tiles behind its front) goes
 * over him, and shoves him `knock` tiles along with it.
 */
export const WAVE = { off: 1.02, speed: 6.12, slant: 0.35, face: 0.8, die: 3.57, knock: 1.0 } as const;
/**
 * THE CRASH (both at once): the two waves meet in the middle, near the back (`v` tiles onto the stone), and stop there; a plume
 * of water bursts up, hurting within `r` tiles of where they meet `hit` seconds after; then a surge of foamy water over the
 * stone `half` tiles either side of the middle, from `surge[0]` to `surge[1]` seconds after, slowing the hero to `slow` of his pace.
 */
export const CRASH = { v: 0.87, r: 2.4, hit: 0.1, surge: [0.35, 3.2] as const, half: 6.9, slow: 0.6 } as const;

// ---------------------------------------------------------------------------------------------
// HIS BODY'S MOVES (`src/art/eye_moves.ts`, `src/art/eye_shovel.ts`)

/** His stand: a loop of 3 seconds (and his lurk under the water in phase 1); his moves begin as it comes round. */
export const BODY = { stand: fr(90) } as const;
/** His entrance (phase 2's start): 9.0 s from his lurk; his three tentacles burst up from `armsUp`. */
export const ENTRANCE = { long: fr(270), armsUp: fr(222) } as const;
/** Phase 3's change (not drawn yet: the art chat's to come): HE SLIDES FORWARD to the stone's back edge, this long; no tentacles come up again. */
export const CHANGE3 = { long: 4.0, armsUp: Infinity } as const;
/**
 * THE SHOVEL, frames from his stand: he sinks (0 to 21); THE TELL, the water boiling off the end he will come up at (22 to 55);
 * he bursts up there (56 to 59); roars (60 to 83); gapes (84 to 299) as four tentacles scrape along the stone toward his maw,
 * one along each edge in turn (`hooks`: their first frames and edges, 'back' then 'near'); he goes back (300 to 351), rising at
 * his place (318 to 347), his stand from 348. His standing tentacles go down with him and come up with him.
 */
export const SHOVEL = {
  long: fr(352),
  tell: [fr(22), fr(56)] as const,
  burst: fr(56),
  gape: [fr(84), fr(300)] as const,
  back: fr(300),
  armsUp: fr(318),
  hooks: [
    { at: fr(84), edge: 'back' },
    { at: fr(128), edge: 'near' },
    { at: fr(190), edge: 'back' },
    { at: fr(234), edge: 'near' },
  ] as const,
  /** His middle this far off the stone's end as he comes up there (his front a third of a tile off it: his maw reaches nothing onto the stone gaping). */
  out: 4.72,
} as const;
/**
 * A SCRAPING TENTACLE (frames from its own first): up out of the water `start` tiles past the far end (0 to 7); scraping along
 * the stone (8 to 52) to `stop` tiles from his end at `speed` tiles a second; drawn back off the stone (56). Its hook is `thick`
 * tiles along the stone, and reaches `reach` tiles across it from its edge (the gap the rest: 4.25 at the near edge from a back
 * edge's, 4.36 at the back from a near edge's). Struck, the hero is knocked `knock` tiles toward his mouth in `knockSecs`.
 */
export const HOOK = {
  start: 1.79,
  stop: 0.64,
  scrape: [fr(8), fr(53)] as const,
  speed: (STONE.w + 1.79 - 0.64) / (45 / FPS),
  thick: 1.3,
  reach: { back: 6.75, near: 6.64 },
  knock: 6.5,
  knockSecs: 1 / 3,
} as const;
/**
 * THE SNAP: the hero too near his gaping maw, in the snap's reach (`deep` tiles in from the stone's end, across from `across[0]`
 * to `across[1]` tiles from the back edge), he twitches (held, his jaws flexing wider, his throat glowing) and slams shut `shut`
 * seconds after; the jaws are his till `long`; the next no sooner than `again` after. None begins after `last` into the shovel.
 */
export const SNAP = { deep: 2.35, across: [1.84, 9.8] as const, shut: fr(7), long: fr(31), last: fr(268), again: 0.6 } as const;

// ---------------------------------------------------------------------------------------------
// PHASE 3, HIS EYE AND HIS SPELLS (the art not drawn yet: these numbers stand until its pictures set them). HIS WORDS, 8 Nov 2026
// (asked how a close-range hero should reach his body in phase 3): “Kill the tentacles, and he slides forward to use the eye and you
// can hit him.  Let’s scratch the tentacles for the third phase, and have strictly eye attacks and spells for the final phase?”
// So: no tentacles; he slides forward to the stone's back edge (`FORWARD`), his eye in reach of every hero but while the cult's
// pillars burn (quests610.ts PILLARS: shielded); the siege's bolts rain on the stone; his eye's two attacks, by turns, the gaze
// swept across the stone and the eye slammed down on it (lying there a moment: his eye's lowest, the best time to strike it).

/** His place in phase 3, slid forward (his middle at the water); his eye `eye` tiles before his middle, struck within `r` of it. */
export const FORWARD = { u: 8.5, v: -2.8, eye: 1.2, r: 1.6 } as const;
/**
 * THE GAZE: a beam from his eye, laid toward the hero `half` degrees to one side of him (the warning, `warn` seconds: the arc it
 * will sweep, the enemy's pink), swept to the other side over `sweep` seconds; `width` tiles wide; it hurts the hero once as it
 * crosses him.
 */
export const GAZE = { warn: 0.9, sweep: 1.2, half: 32, width: 0.9, long: 2.6 } as const;
/**
 * THE EYE SLAM: his eye reared back (the warning, `warn` seconds: a circle where it will land, where the hero stands, no further
 * than `reach` tiles from his eye), slammed down on the stone at `hit`, hurting within `r`; lying there to `up` (struck there as
 * anywhere), back up by `long`.
 */
export const EYE_SLAM = { warn: fr(28), hit: fr(28), r: 1.5, reach: 9, up: 2.2, long: 2.8 } as const;
/** His eye's attacks: the next begun `rest` seconds (a range) after the last ends; the first `first` in. */
export const EYE_PACE = { rest: [0.6, 1.2] as const, first: 1.5 } as const;

/** The siege's bolts raining down: every `every` seconds `n` of them, the first where the hero stands, the rest `near` to `far` tiles round him; each warned `warn` seconds, hurting within `r` tiles. */
export const RAIN = { every: 2.6, n: 3, near: 1.5, far: 3.5, warn: 1.1, r: 1.0 } as const;
/** (His body as he gapes at an end of the stone in the shovel: `r` tiles round his middle, his front a third of a tile off the stone's end there.) */
export const BODY_HIT = { r: 4.4 } as const;
/** Where his eye is in phase 3, slid forward, at its place before him. */
export function eyeHome(): P2 {
  return { u: FORWARD.u, v: FORWARD.v + FORWARD.eye };
}
/** Where his front is along the stone as he gapes at the left end (less than 0: off the stone's end; the right end the same, flipped). */
export function bodyStrikeFront(): number {
  return -SHOVEL.out + BODY_HIT.r;
}

// ---------------------------------------------------------------------------------------------
// HOW HARD, HOW OFTEN

/** How hard each hurts, times his own blow (the boss's base blow, as the game reckons it on floor 10). */
export const HURTS = { slam: 1.2, wave: 1.0, crash: 1.8, scrape: 0.9, snap: 3.0, rain: 1.0, gaze: 1.1, eye: 1.4 } as const;
export type HurtBy = keyof typeof HURTS;
/**
 * EACH PHASE (index 1 to 3): a tentacle rests `rest` stand loops (a range) between its moves; the water slams come every
 * `water` seconds (a range; the first `waterFirst` in), in his order: left, right, both; the shovel every `shovel` seconds after
 * the last (the first `shovelFirst` in). Phase 1 neither. Harder each phase (his 23 Oct: “Each phase should be harder than the
 * last so by phase three there should be stuff everywhere”).
 */
export const PACE: Readonly<Record<1 | 2 | 3, { rest: readonly [number, number]; water: readonly [number, number] | null; waterFirst: number; shovel: readonly [number, number] | null; shovelFirst: number }>> = {
  1: { rest: [0, 1], water: null, waterFirst: 0, shovel: null, shovelFirst: 0 },
  2: { rest: [1, 2], water: [7, 9], waterFirst: 4, shovel: [14, 18], shovelFirst: 10 },
  3: { rest: [0, 1], water: null, waterFirst: 0, shovel: null, shovelFirst: 0 },
};
/** Each tentacle's life and his body's, as shares of a full bar (each phase a bar of its own: his 17 Oct “his HP bar refilled”). */
export const LIFE = { 1: 1 / 2, 2: 1 / 3, 3: 1 / 3, body: 1 } as const;
/** After the last of a phase's tentacles is killed: the flasks refilled at once; his change begins no sooner than this (seconds), as his stand (or lurk) comes round. */
export const BETWEEN = { least: 1.0 } as const;

// ---------------------------------------------------------------------------------------------
// LINES ON THE STONE

export interface P2 {
  u: number;
  v: number;
}
/** A line on the stone: from where it comes onto it to where it leaves it. */
export interface Seg {
  a: P2;
  b: P2;
}

/** Where a tentacle's root is (in the water off the back edge). */
export function rootAt(u: number): P2 {
  return { u, v: -ROOT_OUT };
}

/** The line a tentacle rooted at `u` slams along at turn `deg`: from where it reaches the stone to where it leaves it, and its length from the root. */
export function slamLine(u: number, deg: number): Seg & { len: number } {
  const dx = Math.sin(deg * D);
  const dy = Math.cos(deg * D);
  const s0 = ROOT_OUT / dy;
  let s1 = (STONE.d + ROOT_OUT) / dy;
  if (dx > 1e-9) s1 = Math.min(s1, (STONE.w - u) / dx);
  if (dx < -1e-9) s1 = Math.min(s1, -u / dx);
  return { a: { u: u + dx * s0, v: -ROOT_OUT + dy * s0 }, b: { u: u + dx * s1, v: -ROOT_OUT + dy * s1 }, len: s1 };
}

/** The drawn turn of a tentacle rooted at `u` (its turns `range`) nearest the line toward `to`. */
export function turnToward(u: number, range: readonly [number, number], to: P2): number {
  const deg = Math.atan2(to.u - u, to.v + ROOT_OUT) / D;
  const snapped = Math.round(deg / TURNS.step) * TURNS.step;
  return Math.max(range[0], Math.min(range[1], snapped));
}

/** How far `p` is from the line `s`. */
export function offLine(p: P2, s: Seg): number {
  const ex = s.b.u - s.a.u;
  const ey = s.b.v - s.a.v;
  const l2 = ex * ex + ey * ey || 1;
  const k = Math.max(0, Math.min(1, ((p.u - s.a.u) * ex + (p.v - s.a.v) * ey) / l2));
  return Math.hypot(p.u - (s.a.u + ex * k), p.v - (s.a.v + ey * k));
}

// ---------------------------------------------------------------------------------------------
// THE STONE IN THE WORLD (game/act1_layout.ts lays it, on floor 10 with the switch on: an island of its own beside the open
// ground, as a stronghold's hall is, water all round it but for a jetty down from the middle of its near edge; the hero is
// carried there from the boss's ground: game.ts 'stoneIn'). Its axes are the screen's: `u` across, `v` down it.

/** Where the stone is: the world point (tiles) of its middle. */
export interface StoneAt {
  cx: number;
  cy: number;
}
export function stoneToWorld(s: StoneAt, u: number, v: number): { x: number; y: number } {
  const du = u - STONE.w / 2;
  const dv = v - STONE.d / 2;
  return { x: s.cx + (du + dv) / Math.SQRT2, y: s.cy + (dv - du) / Math.SQRT2 };
}
export function worldToStone(s: StoneAt, x: number, y: number): P2 {
  const dx = x - s.cx;
  const dy = y - s.cy;
  return { u: STONE.w / 2 + (dx - dy) / Math.SQRT2, v: STONE.d / 2 + (dx + dy) / Math.SQRT2 };
}
/** The jetty down from the middle of the near edge: `half` tiles either side of the middle, `long` past the edge; the hero set down `in` past the edge, and carried back from beyond `out`. */
export const JETTY = { half: 1.1, long: 3.6, in: 2.4, out: 3.2 } as const;
/** On the stone (its whole rectangle), or on its jetty. */
export function onStoneOrJetty(p: P2): boolean {
  if (p.u >= 0 && p.u <= STONE.w && p.v >= 0 && p.v <= STONE.d) return true;
  return Math.abs(p.u - STONE.w / 2) <= JETTY.half && p.v > STONE.d - 0.5 && p.v <= STONE.d + JETTY.long;
}
/** On the stone itself (the fight begins as the hero steps onto it). */
export function onStone(p: P2): boolean {
  return p.u >= 0 && p.u <= STONE.w && p.v >= 0 && p.v <= STONE.d;
}

/** The hero's size on the stone (tiles round him: the game's TUNE.heroRadius). */
export const HERO_R = 0.3;

/**
 * Where a wave's front is along the stone at depth `v`, `t` seconds after its smash: rolling from the stone's left end
 * (`from` 'l') toward its right, or from its right end toward its left.
 */
export function waveFront(from: 'l' | 'r', t: number, v: number): number {
  const along = -WAVE.off + WAVE.speed * t - WAVE.slant * Math.max(0, Math.min(STONE.d, v));
  return from === 'l' ? along : STONE.w - along;
}

/** Whether a scraping hook along `edge` covers depth `v` of the stone (the hero's size counted). */
export function hookCovers(edge: 'back' | 'near', v: number): boolean {
  return edge === 'back' ? v - HERO_R < HOOK.reach.back : v + HERO_R > STONE.d - HOOK.reach.near;
}

/** Where a scraping hook's front is along the stone, `t` seconds after it began (its own first frame), toward his `end`. */
export function hookFront(end: 'l' | 'r', t: number): number | null {
  if (t < HOOK.scrape[0] || t >= HOOK.scrape[1]) return null;
  const went = HOOK.speed * (t - HOOK.scrape[0]);
  return end === 'l' ? STONE.w + HOOK.start - went : -HOOK.start + went;
}

/** Whether `p` is in the snap's reach at `end`. */
export function inSnap(end: 'l' | 'r', p: P2): boolean {
  const inFrom = end === 'l' ? p.u : STONE.w - p.u;
  return inFrom - HERO_R < SNAP.deep && p.v + HERO_R > SNAP.across[0] && p.v - HERO_R < SNAP.across[1];
}

// ---------------------------------------------------------------------------------------------
// THE FIGHT

export type ArmState = 'rise' | 'stand' | 'slam' | 'smash' | 'under' | 'dying' | 'dead';
export interface Arm {
  id: number;
  /** Which of the phase's: 0 left (or phase 1's left), 1 middle (or phase 1's right), 2 right. */
  k: number;
  /** Its root along the stone. */
  u: number;
  side: 'l' | 'm' | 'r';
  range: readonly [number, number];
  state: ArmState;
  /** Seconds into its state. */
  t: number;
  /** Stand loops still to rest before its next move. */
  rest: number;
  /** Its slam's turn and line. */
  turn: number;
  line: Seg | null;
  /** Its blow has landed in this move. */
  landed: boolean;
  /** Stand loops it has stood ready (the longest ready goes first). */
  ready: number;
  /** Its water slam is one of both at once (the two waves meet in the middle). */
  pair: boolean;
}

export interface Wave {
  from: 'l' | 'r';
  /** Seconds since its smash. */
  t: number;
  /** It stops at the middle (both at once). */
  meets: boolean;
  passed: boolean;
}

export interface Shovel {
  end: 'l' | 'r';
  t: number;
  hooks: { edge: 'back' | 'near'; passed: boolean }[];
  /** A snap: seconds into it (null: none now); and how many he has made. */
  snap: number | null;
  snapped: boolean;
  snaps: number;
  /** When his last snap ended (seconds into the shovel). */
  snapEnd: number;
}

export interface EyeMove {
  kind: 'gaze' | 'slam';
  t: number;
  /** The gaze: its first and last turn (degrees from straight across, + toward the stone's right end). The slam: where it lands. */
  a0: number;
  a1: number;
  at: P2;
  landed: boolean;
}

export interface Rain {
  u: number;
  v: number;
  t: number;
}

export type FightEvent =
  | { t: 'phase'; ph: 1 | 2 | 3 }
  | { t: 'flasks' }
  | { t: 'change'; to: 2 | 3 }
  | { t: 'armUp'; id: number }
  | { t: 'armDies'; id: number }
  | { t: 'armGone'; id: number }
  | { t: 'warn'; id: number; line: Seg }
  | { t: 'slam'; id: number; line: Seg }
  | { t: 'smashWarn'; id: number; from: 'l' | 'r' }
  | { t: 'smash'; id: number; from: 'l' | 'r' }
  | { t: 'crash'; u: number; v: number }
  | { t: 'surge'; on: boolean }
  | { t: 'sink'; end: 'l' | 'r' }
  | { t: 'burst'; end: 'l' | 'r' }
  | { t: 'hook'; edge: 'back' | 'near'; end: 'l' | 'r' }
  | { t: 'twitch'; end: 'l' | 'r' }
  | { t: 'snap'; end: 'l' | 'r' }
  | { t: 'back' }
  | { t: 'gazeWarn'; a0: number; a1: number }
  | { t: 'gaze' }
  | { t: 'eyeWarn'; u: number; v: number }
  | { t: 'eyeSlam'; u: number; v: number }
  | { t: 'rainWarn'; u: number; v: number }
  | { t: 'rain'; u: number; v: number }
  | { t: 'hurt'; by: HurtBy; mult: number; du: number; dv: number; secs: number }
  | { t: 'won' };

export interface HeroOnStone extends P2 {
  /** Rolling or leaping through (the game's dodge): nothing hurts him, and what he goes through has passed him. */
  dodging: boolean;
}

type Mode = 'idle' | 'fight' | 'between' | 'change' | 'won';

export class ColossusFight {
  ph: 1 | 2 | 3 = 1;
  mode: Mode = 'idle';
  /** Seconds since the fight began; and in this phase (or change). */
  time = 0;
  phT = 0;
  /** His stand's clock (or his lurk's), seconds. */
  body = 0;
  arms: Arm[] = [];
  waves: Wave[] = [];
  shovel: Shovel | null = null;
  rains: Rain[] = [];
  /** (Phase 3) His eye's attack now, and seconds to the next. */
  eye: EyeMove | null = null;
  eyeIn = 0;
  private eyeNext: 'gaze' | 'slam' = 'gaze';
  /** Seconds to the next water slam, and which it is (his order: left, right, both). */
  waterIn = 0;
  waterNext: 'l' | 'r' | 'both' = 'l';
  /** Seconds to the next shovel. */
  shovelIn = 0;
  rainIn = 0;
  /** A crash: seconds since the two waves met (null: none). */
  crash: { t: number; hit: boolean; surge: boolean } | null = null;
  /** Seconds since the last of the phase's tentacles was killed (in `between`). */
  betweenT = 0;
  /** The pillars burn (phase 3): his body cannot be hurt (the game's, quests610.ts PILLARS). */
  shielded = false;
  private nextId = 1;
  /** The tentacles' clock (seconds): their stands are frames of it (render/colossus_baked.ts); set to 0 as they rise. */
  armClock = 0;

  constructor(private rng: RNG) {}

  /** The hero has come onto the stone: phase 1, its two tentacles bursting up. */
  begin(): FightEvent[] {
    const ev: FightEvent[] = [];
    if (this.mode !== 'idle') return ev;
    this.mode = 'fight';
    this.startPhase(1, ev);
    return ev;
  }

  private startPhase(ph: 1 | 2 | 3, ev: FightEvent[]): void {
    this.ph = ph;
    this.phT = 0;
    this.mode = 'fight';
    const P = PACE[ph];
    this.waterIn = P.water ? P.waterFirst : Infinity;
    this.waterNext = 'l';
    this.shovelIn = P.shovel ? P.shovelFirst : Infinity;
    this.rainIn = ph === 3 ? RAIN.every : Infinity;
    this.eyeIn = ph === 3 ? EYE_PACE.first : Infinity;
    if (ph < 3 && this.arms.every((a) => a.state === 'dead')) this.raiseArms(ph, ev);
    // (his entrance ends on his tentacles' stand's first frame: their clock begins again with the phase)
    else if (ph === 2) this.armClock = 0;
    ev.push({ t: 'phase', ph });
  }

  private raiseArms(ph: 1 | 2 | 3, ev: FightEvent[]): void {
    const turns = ph === 1 ? TURNS[1] : TURNS[2];
    this.arms = ROOTS[ph].map((u, k) => {
      const side: Arm['side'] = ph === 1 ? (k === 0 ? 'l' : 'r') : (['l', 'm', 'r'] as const)[k];
      const a: Arm = { id: this.nextId++, k, u, side, range: turns[k], state: 'rise', t: 0, rest: 0, turn: 0, line: null, landed: false, ready: 0, pair: false };
      ev.push({ t: 'armUp', id: a.id });
      return a;
    });
    this.armClock = 0;
  }

  /** Whether the hero's blows reach this tentacle now. */
  armStruck(a: Arm): boolean {
    return a.state === 'stand' || a.state === 'slam' || a.state === 'smash' || (a.state === 'rise' && a.t >= ARM.burst * 0.4);
  }

  /** Where the hero's blows reach a tentacle: round its root, and (lying after a slam) along its line. */
  armShape(a: Arm): { root: P2; r: number; lying: Seg | null } {
    const lying = a.state === 'slam' && a.line && a.t >= SLAM.lying[0] && a.t < SLAM.lying[1] ? a.line : null;
    return { root: rootAt(a.u), r: ARM.r, lying };
  }

  /** Whether the hero's blows reach his body now, and where it is (phase 3 only, the pillars out). */
  bodyStruck(): { at: P2; r: number } | null {
    if (this.ph !== 3 || this.mode !== 'fight' || this.shielded) return null;
    // (his eye lying where it slammed down; else at its place before him)
    const E = this.eye;
    if (E && E.kind === 'slam' && E.landed && E.t < EYE_SLAM.up) return { at: E.at, r: FORWARD.r };
    return { at: eyeHome(), r: FORWARD.r };
  }

  /** The game: a tentacle's life is gone. */
  armKilled(id: number): FightEvent[] {
    const ev: FightEvent[] = [];
    const a = this.arms.find((q) => q.id === id);
    if (!a || a.state === 'dying' || a.state === 'dead') return ev;
    a.state = 'dying';
    a.t = 0;
    a.line = null;
    ev.push({ t: 'armDies', id });
    if (this.ph < 3 && this.mode === 'fight' && this.arms.every((q) => q.state === 'dying' || q.state === 'dead')) {
      this.mode = 'between';
      this.betweenT = 0;
      this.waves = [];
      this.crash = null;
      this.rains = [];
      ev.push({ t: 'flasks' });
    }
    return ev;
  }

  /** The game: his body's life is gone (phase 3): the fight is won. */
  bodyKilled(): FightEvent[] {
    if (this.mode === 'won') return [];
    this.mode = 'won';
    for (const a of this.arms) if (a.state !== 'dead') a.state = 'dying';
    return [{ t: 'won' }];
  }

  /** How much of his pace the hero has here (the crash's surge slows him). */
  paceAt(p: P2): number {
    const C = this.crash;
    return C && C.t >= CRASH.surge[0] && C.t < CRASH.surge[1] && Math.abs(p.u - STONE.w / 2) < CRASH.half ? CRASH.slow : 1;
  }

  /** A step of the fight. */
  step(dt: number, hero: HeroOnStone): FightEvent[] {
    const ev: FightEvent[] = [];
    if (this.mode === 'idle') return ev;
    this.time += dt;
    this.phT += dt;
    const bodyWas = this.body;
    this.body += dt;
    const bodyRound = Math.floor(this.body / BODY.stand) > Math.floor(bodyWas / BODY.stand);
    const clockWas = this.armClock;
    this.armClock += dt;
    const armRound = Math.floor(this.armClock / ARM.stand) > Math.floor(clockWas / ARM.stand);

    this.stepArms(dt, hero, armRound, ev);
    this.stepWaves(dt, hero, ev);
    this.stepShovel(dt, hero, ev);
    this.stepRain(dt, hero, ev);

    if (this.mode === 'between') {
      this.betweenT += dt;
      if (this.betweenT >= BETWEEN.least && bodyRound) {
        this.mode = 'change';
        this.phT = 0;
        this.body = 0;
        this.shovel = null;
        this.waves = [];
        ev.push({ t: 'change', to: (this.ph + 1) as 2 | 3 });
      }
    } else if (this.mode === 'change') {
      const C = this.ph === 1 ? ENTRANCE : CHANGE3;
      if (C.armsUp < C.long && this.phT >= C.armsUp && this.phT - dt < C.armsUp) this.raiseArms((this.ph + 1) as 2 | 3, ev);
      if (this.phT >= C.long) {
        this.body = 0;
        this.startPhase((this.ph + 1) as 2 | 3, ev);
      }
    } else if (this.mode === 'fight') {
      if (this.ph === 3) this.stepEye(dt, hero, ev);
      else this.direct(dt, hero, armRound, bodyRound, ev);
    }
    return ev;
  }

  // ---- his tentacles
  private stepArms(dt: number, hero: HeroOnStone, armRound: boolean, ev: FightEvent[]): void {
    for (const a of this.arms) {
      const was = a.t;
      a.t += dt;
      if (a.state === 'rise' && a.t >= ARM.burst) {
        a.state = 'stand';
        a.t = 0;
        a.rest = this.restFor();
      } else if (a.state === 'dying' && a.t >= ARM.death) {
        a.state = 'dead';
        ev.push({ t: 'armGone', id: a.id });
      } else if (a.state === 'slam' && a.line) {
        if (!a.landed && a.t >= SLAM.hit) {
          a.landed = true;
          ev.push({ t: 'slam', id: a.id, line: a.line });
          if (!hero.dodging && offLine(hero, a.line) < SLAM.width / 2 + HERO_R) ev.push({ t: 'hurt', by: 'slam', mult: HURTS.slam, du: 0, dv: 0, secs: 0 });
        }
        if (a.t >= SLAM.long) this.backToStand(a);
      } else if (a.state === 'smash') {
        if (!a.landed && a.t >= SMASH.hit) {
          a.landed = true;
          const from = a.side === 'l' ? 'l' : 'r';
          ev.push({ t: 'smash', id: a.id, from });
          this.waves.push({ from, t: a.t - SMASH.hit, meets: a.pair, passed: false });
        }
        if (a.t >= SMASH.long) this.backToStand(a);
      }
    }
    if (armRound) for (const a of this.arms) if (a.state === 'stand') a.ready += 1;
  }

  private backToStand(a: Arm): void {
    a.state = 'stand';
    a.t = 0;
    a.line = null;
    a.landed = false;
    a.ready = 0;
    a.rest = this.restFor();
  }

  private restFor(): number {
    const r = PACE[this.ph].rest;
    return this.rng.int(r[0], r[1]);
  }

  // ---- the director: who moves next
  private direct(dt: number, hero: HeroOnStone, armRound: boolean, bodyRound: boolean, ev: FightEvent[]): void {
    this.waterIn -= dt;
    this.shovelIn -= dt;
    if (this.shovel) return;
    const moving = this.arms.some((a) => a.state === 'slam' || a.state === 'smash' || a.state === 'rise');
    // THE SHOVEL: due, his tentacles still, no wave rolling, as his stand comes round
    if (this.shovelIn <= 0) {
      if (!moving && this.waves.length === 0 && bodyRound) this.beginShovel(ev);
      return;
    }
    if (!armRound) return;
    const stand = this.arms.filter((a) => a.state === 'stand');
    for (const a of stand) if (a.rest > 0) a.rest -= 1;
    const ready = stand.filter((a) => a.rest <= 0).sort((x, y) => y.ready - x.ready);
    if (ready.length === 0) return;
    // THE WATER SLAMS, in his order, one wave at a time
    if (this.waterIn <= 0 && this.waves.length === 0) {
      const L = this.arms.find((a) => a.side === 'l' && a.state !== 'dying' && a.state !== 'dead');
      const R = this.arms.find((a) => a.side === 'r' && a.state !== 'dying' && a.state !== 'dead');
      let want = this.waterNext;
      if (want === 'both' && !(L && R)) want = L ? 'l' : 'r';
      if (want === 'l' && !L) want = R ? 'r' : 'l';
      if (want === 'r' && !R) want = L ? 'l' : 'r';
      const who = want === 'both' ? [L, R] : [want === 'l' ? L : R];
      if (who.every((a) => a && a.state === 'stand' && a.rest <= 0)) {
        for (const a of who) this.beginSmash(a as Arm, who.length === 2, ev);
        this.waterNext = this.waterNext === 'l' ? 'r' : this.waterNext === 'r' ? 'both' : 'l';
        const w = PACE[this.ph].water;
        this.waterIn = w ? this.rng.range(w[0], w[1]) : Infinity;
        return;
      }
      if (!L && !R) this.waterIn = Infinity;
    }
    // A SLAM ON THE STONE: one warning laid at a time
    if (this.arms.some((a) => (a.state === 'slam' || a.state === 'smash') && a.t < SLAM.hit)) return;
    this.beginSlam(ready[0], hero, ev);
  }

  private beginSlam(a: Arm, hero: P2, ev: FightEvent[]): void {
    a.state = 'slam';
    a.t = 0;
    a.landed = false;
    a.turn = turnToward(a.u, a.range, hero);
    const L = slamLine(a.u, a.turn);
    a.line = { a: L.a, b: L.b };
    ev.push({ t: 'warn', id: a.id, line: a.line });
  }

  private beginSmash(a: Arm, pair: boolean, ev: FightEvent[]): void {
    a.state = 'smash';
    a.pair = pair;
    a.t = 0;
    a.landed = false;
    a.line = null;
    ev.push({ t: 'smashWarn', id: a.id, from: a.side === 'l' ? 'l' : 'r' });
  }

  // ---- the waves and the crash
  private stepWaves(dt: number, hero: HeroOnStone, ev: FightEvent[]): void {
    for (const w of this.waves) {
      w.t += dt;
      if (w.passed) continue;
      let front = waveFront(w.from, w.t, hero.v);
      if (w.meets) front = w.from === 'l' ? Math.min(front, STONE.w / 2) : Math.max(front, STONE.w / 2);
      const ahead = w.from === 'l' ? front - (hero.u - HERO_R) : hero.u + HERO_R - front;
      if (ahead >= 0 && ahead < WAVE.face + 2 * HERO_R) {
        w.passed = true;
        if (!hero.dodging) ev.push({ t: 'hurt', by: 'wave', mult: HURTS.wave, du: w.from === 'l' ? WAVE.knock : -WAVE.knock, dv: 0, secs: 0.25 });
      } else if (ahead >= WAVE.face + 2 * HERO_R) w.passed = true;
    }
    // both at once: they meet in the middle
    const meet = this.waves.filter((w) => w.meets);
    if (meet.length === 2 && !this.crash && meet[0].t >= (STONE.w / 2 + WAVE.off) / WAVE.speed) {
      this.crash = { t: 0, hit: false, surge: false };
      ev.push({ t: 'crash', u: STONE.w / 2, v: CRASH.v });
      this.waves = this.waves.filter((w) => !w.meets);
    }
    this.waves = this.waves.filter((w) => w.t < (STONE.w + WAVE.off + WAVE.die) / WAVE.speed + (WAVE.slant * STONE.d) / WAVE.speed);
    const C = this.crash;
    if (C) {
      C.t += dt;
      if (!C.hit && C.t >= CRASH.hit) {
        C.hit = true;
        if (!hero.dodging && Math.hypot(hero.u - STONE.w / 2, hero.v - CRASH.v) < CRASH.r + HERO_R) ev.push({ t: 'hurt', by: 'crash', mult: HURTS.crash, du: 0, dv: 1.2, secs: 0.3 });
      }
      if (!C.surge && C.t >= CRASH.surge[0]) {
        C.surge = true;
        ev.push({ t: 'surge', on: true });
      }
      if (C.t >= CRASH.surge[1]) {
        this.crash = null;
        ev.push({ t: 'surge', on: false });
      }
    }
  }

  // ---- the shovel and the snap
  private beginShovel(ev: FightEvent[]): void {
    const end: 'l' | 'r' = this.rng.chance(0.5) ? 'l' : 'r';
    this.shovel = { end, t: 0, hooks: SHOVEL.hooks.map((h) => ({ edge: h.edge, passed: false })), snap: null, snapped: false, snaps: 0, snapEnd: -9 };
    for (const a of this.arms) if (a.state === 'stand') {
      a.state = 'under';
      a.t = 0;
    }
    ev.push({ t: 'sink', end });
  }

  private stepShovel(dt: number, hero: HeroOnStone, ev: FightEvent[]): void {
    const S = this.shovel;
    if (!S) return;
    const was = S.t;
    S.t += dt;
    const passes = (at: number): boolean => was < at && S.t >= at;
    if (passes(SHOVEL.burst)) ev.push({ t: 'burst', end: S.end });
    SHOVEL.hooks.forEach((h, i) => {
      if (passes(h.at)) ev.push({ t: 'hook', edge: h.edge, end: S.end });
      const H = S.hooks[i];
      if (H.passed) return;
      const front = hookFront(S.end, S.t - h.at);
      if (front === null) return;
      if (!hookCovers(h.edge, hero.v)) return;
      // the hook goes toward his end: it is over the hero from its front reaching him until its back has gone by
      const over = S.end === 'l' ? hero.u + HERO_R >= front && hero.u - HERO_R <= front + HOOK.thick : hero.u - HERO_R <= front && hero.u + HERO_R >= front - HOOK.thick;
      const gone = S.end === 'l' ? front + HOOK.thick < hero.u - HERO_R : front - HOOK.thick > hero.u + HERO_R;
      if (gone) H.passed = true;
      else if (over) {
        H.passed = true;
        if (!hero.dodging) {
          const toEnd = S.end === 'l' ? hero.u - HERO_R : STONE.w - hero.u - HERO_R;
          const k = Math.max(0, Math.min(HOOK.knock, toEnd));
          ev.push({ t: 'hurt', by: 'scrape', mult: HURTS.scrape, du: S.end === 'l' ? -k : k, dv: 0, secs: HOOK.knockSecs });
        }
      }
    });
    // THE SNAP: the hero too near his gaping maw
    if (S.snap !== null) {
      S.snap += dt;
      if (!S.snapped && S.snap >= SNAP.shut) {
        S.snapped = true;
        ev.push({ t: 'snap', end: S.end });
        if (!hero.dodging && inSnap(S.end, hero)) ev.push({ t: 'hurt', by: 'snap', mult: HURTS.snap, du: S.end === 'l' ? 1.0 : -1.0, dv: 0, secs: 0.3 });
      }
      if (S.snap >= SNAP.long) {
        S.snap = null;
        S.snapEnd = S.t;
      }
    } else if (S.t >= SHOVEL.gape[0] && S.t < SNAP.last && S.t - S.snapEnd >= SNAP.again && inSnap(S.end, hero)) {
      S.snap = 0;
      S.snapped = false;
      S.snaps += 1;
      ev.push({ t: 'twitch', end: S.end });
    }
    if (passes(SHOVEL.back)) ev.push({ t: 'back' });
    if (passes(SHOVEL.armsUp)) {
      for (const a of this.arms) if (a.state === 'under') {
        a.state = 'rise';
        a.t = 0;
        ev.push({ t: 'armUp', id: a.id });
      }
      // (their bursts begin on their stand's first frame, as they are baked)
      this.armClock = 0;
    }
    if (S.t >= SHOVEL.long && S.snap === null) {
      this.shovel = null;
      this.body = 0;
      const sh = PACE[this.ph].shovel;
      this.shovelIn = sh ? this.rng.range(sh[0], sh[1]) : Infinity;
    }
  }

  // ---- phase 3: his eye's attacks, by turns
  private stepEye(dt: number, hero: HeroOnStone, ev: FightEvent[]): void {
    const E = this.eye;
    if (!E) {
      this.eyeIn -= dt;
      if (this.eyeIn > 0) return;
      const home = eyeHome();
      if (this.eyeNext === 'gaze') {
        const toward = Math.atan2(hero.u - home.u, hero.v - home.v) / D;
        const way = this.rng.chance(0.5) ? 1 : -1;
        this.eye = { kind: 'gaze', t: 0, a0: toward - way * GAZE.half, a1: toward + way * GAZE.half, at: home, landed: false };
        ev.push({ t: 'gazeWarn', a0: this.eye.a0, a1: this.eye.a1 });
      } else {
        const d = Math.hypot(hero.u - home.u, hero.v - home.v);
        const k = d > EYE_SLAM.reach ? EYE_SLAM.reach / d : 1;
        const at = { u: home.u + (hero.u - home.u) * k, v: home.v + (hero.v - home.v) * k };
        this.eye = { kind: 'slam', t: 0, a0: 0, a1: 0, at, landed: false };
        ev.push({ t: 'eyeWarn', u: at.u, v: at.v });
      }
      this.eyeNext = this.eyeNext === 'gaze' ? 'slam' : 'gaze';
      return;
    }
    const was = E.t;
    E.t += dt;
    if (E.kind === 'gaze') {
      if (was < GAZE.warn && E.t >= GAZE.warn) ev.push({ t: 'gaze' });
      if (!E.landed && E.t >= GAZE.warn && E.t < GAZE.warn + GAZE.sweep) {
        const k0 = (was - GAZE.warn) / GAZE.sweep;
        const k1 = (E.t - GAZE.warn) / GAZE.sweep;
        const deg = Math.atan2(hero.u - E.at.u, hero.v - E.at.v) / D;
        const lo = E.a0 + (E.a1 - E.a0) * Math.max(0, k0);
        const hi = E.a0 + (E.a1 - E.a0) * k1;
        // (the beam crosses him this step: his turn between where it was and where it is, his size counted)
        const far = Math.hypot(hero.u - E.at.u, hero.v - E.at.v) || 1;
        const slack = (Math.atan((GAZE.width / 2 + HERO_R) / far) / D);
        if (deg >= Math.min(lo, hi) - slack && deg <= Math.max(lo, hi) + slack) {
          E.landed = true;
          if (!hero.dodging) ev.push({ t: 'hurt', by: 'gaze', mult: HURTS.gaze, du: 0, dv: 0, secs: 0 });
        }
      }
      if (E.t >= GAZE.long) this.endEye();
    } else {
      if (!E.landed && E.t >= EYE_SLAM.hit) {
        E.landed = true;
        ev.push({ t: 'eyeSlam', u: E.at.u, v: E.at.v });
        if (!hero.dodging && Math.hypot(hero.u - E.at.u, hero.v - E.at.v) < EYE_SLAM.r + HERO_R) ev.push({ t: 'hurt', by: 'eye', mult: HURTS.eye, du: 0, dv: 0, secs: 0 });
      }
      if (E.t >= EYE_SLAM.long) this.endEye();
    }
  }

  private endEye(): void {
    this.eye = null;
    this.eyeIn = this.rng.range(EYE_PACE.rest[0], EYE_PACE.rest[1]);
  }

  // ---- phase 3: the siege's bolts
  private stepRain(dt: number, hero: HeroOnStone, ev: FightEvent[]): void {
    for (const r of this.rains) {
      const was = r.t;
      r.t += dt;
      if (was < RAIN.warn && r.t >= RAIN.warn) {
        ev.push({ t: 'rain', u: r.u, v: r.v });
        if (!hero.dodging && Math.hypot(hero.u - r.u, hero.v - r.v) < RAIN.r + HERO_R) ev.push({ t: 'hurt', by: 'rain', mult: HURTS.rain, du: 0, dv: 0, secs: 0 });
      }
    }
    this.rains = this.rains.filter((r) => r.t < RAIN.warn + 0.4);
    if (this.ph !== 3 || this.mode !== 'fight') return;
    this.rainIn -= dt;
    if (this.rainIn > 0) return;
    this.rainIn = RAIN.every;
    for (let i = 0; i < RAIN.n; i++) {
      let u = hero.u;
      let v = hero.v;
      if (i > 0) {
        const ang = this.rng.range(0, Math.PI * 2);
        const far = this.rng.range(RAIN.near, RAIN.far);
        u = Math.max(0.5, Math.min(STONE.w - 0.5, u + Math.cos(ang) * far));
        v = Math.max(0.5, Math.min(STONE.d - 0.5, v + Math.sin(ang) * far));
      }
      this.rains.push({ u, v, t: 0 });
      ev.push({ t: 'rainWarn', u, v });
    }
  }
}
