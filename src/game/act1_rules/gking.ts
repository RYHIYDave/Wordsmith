// ACT 2, PART TWO, THE HIGH CITY: FLOOR 19: THE KING: his rules (game/act1_rules/types.ts). Built by the main chat from the art
// chat's (art/king.ts, king_moves.ts, king_fx.ts; his pick there, how he moves, “Slow and heavy, huge reach (Recommended)”, and his
// yes, “Yes, that's the King (Recommended)”; docs/mockups/king/README.md, every number). His doc, level 19: "The King. His floor
// is the Throne Hall."; the plan: "the king is dying. The Hush sits on his chest wearing his crown, holding his sword, and the
// faces of everything he ever did look out at him from the bed curtains (as Death does in "The Nightingale"). His clockwork
// songbird lies broken on the floor." A boss: four blows (his rulebook).
//
// WHAT HE DOES (the main chat's, where the art leaves it to the game):
// - HE WALKS at KG_PACE, a tile a second, slow and heavy, his sword dragged; every blow of his reaches across the hall.
// - EVERY BLOW IS LAID SQUARE TO THE WAY HIS PICTURE FACES (squareOn): his pictures and what his blows leave are painted facing
//   one of the four ways the floor runs, so as each blow begins he is turned square to it (never more than an eighth of a turn
//   from him), and what it strikes is where it is drawn.
// HIS WORD ON THE FIGHT, 31 Oct 2026 (by 07:26): “His sweep and leap are pretty lame.  There are a dozen other enemies that have
// that’s same moves with those same animations.” For the sweep, “Dragged blade works but I’d like him to charge at the player”; for
// the leap and slam, “The crown's weight”. And of the Hush at his side: “It needs at least a couple moves.  It can’t take words we
// have so many bosses that do that already”; of four offered, “Grab and drag (Recommended),Shields the King,Grey fog”. The art
// chat draws them (its pictures stand in until then: the sweep's for the charge, the Curtains' for the crown's weight); the
// timings here are the main chat's, to be fitted to the art's.
// - THE CHARGE (his basic, KING_TUNE.charge): squared on the hero (the warning: the lane he will run marked on the floor), he
//   charges along it at 12 tiles a second, as far as 1.5 tiles past where the hero stood or 9 tiles, so far as the floor lets him,
//   his sword dragged behind him; whoever he runs into is struck (his blow). The blade cuts A LINE OF SPARKS in the stones the
//   whole way, which bursts 0.6 s after he stops: whoever stands on it then is struck (a share of his blow).
// - THE DECREE (KG_DECREE, 2.8 s; the sword driven into the stones at 1.33 s): three lines of his knights rise behind him and
//   march across the hall before him at 2.4 tiles a second, a line every 3.2 tiles, a knight every 1.25 tiles across its whole
//   width, two gaps two knights wide in each line (DECREE_GAPS) to slip through; a knight who walks into him strikes him (once a
//   line). Laid to the hall: they rise at the wall behind him and fade at the wall before him; none where the floor is wall.
// - THE CROWN'S WEIGHT (KING_TUNE.weight): he sends his crown up, and it hangs over the hero, its shadow on the floor under it,
//   following him at 3.2 tiles a second (he runs at 4.6: he can get out from under it, if he keeps going) for 2.4 s; it stops
//   (0.45 s, the shadow darkening), and slams down: whoever is within 1.7 tiles of it is struck hard. Then it flies home.
// - THE CURTAINS (KG_CURTAINS, 2.5 s; his hand flung at 1.1 s): the faces of his deeds stream out of three hangings behind him at
//   where the hero stood as his hand was flung (curtainFaces: one from each every 0.09 s for 1.5 s, 11 tiles a second); a face
//   that passes through him strikes him (a small share of his blow, no more often than KING_TUNE.faces.gap).
// - HIS LAST PHASE (the plan: "his last phase, the Hush climbs off him and fights at his side"): at a third of his life the Hush
//   climbs off him (KG_CLIMB, 2.6 s; nothing hurts him while it does); from then he is KING_ALONE (Monster.form 1), and the Hush
//   stands at his side (HUSH_BESIDE: a peril, 'gking:hush', that keeps there), and it has three moves of its own (KING_TUNE.hush),
//   one at a time, a breath between them:
//     GRAB AND DRAG: its arms rear back (the warning: the line they will shoot along), and shoot out 8 tiles at where the hero
//       stood; if they catch him he is held (a small share of his blow) and dragged back to stand before the King;
//     SHIELD: it wraps itself round the King; nothing hurts him while it does (his blows land on the Hush), until the hero has hit
//       it six times and it is struck off (it reels back to his side, dazed a moment), or six seconds pass;
//     GREY FOG: it breathes three patches of grey fog onto the floor, one where the hero stands and one either side of him: while
//       he stands in one he goes at a little over half his pace; they lie seven seconds.
//   His waits are shorter each phase (KING_TUNE.cd).
// - HIS DEATH (KG_DIES): the Hush unwinds into nothing; the clockwork songbird lying broken before his throne winds itself up,
//   rights itself and sings (BIRD; a peril, 'gking:bird', in place of the floor's broken one); the way on opens (the game's ways).
// What his blows leave and send, and the Hush and the bird, drawn: render/act1_fx/gking.ts.

import { CURTAINS_FX, DECREE_FX, KG_REACH, curtainFaces, decreeKnights } from '../../art/king_fx';
import { HUSH_BESIDE, KG_CLIMB, KG_CURTAINS, KG_DECREE, KG_PACE, KG_WALK } from '../../art/king_moves';
import { TILE3 } from '../../art/new_mobs3';
import type { ActDef, BossRules, GaitDef } from '../bosses';
import { backView, beside, flipped, fromFigure, handOf } from '../facing';
import type { Level, Monster, Peril } from '../state';
import type { Act1Rules } from './types';

/** His numbers (tiles; seconds; shares of his blow). */
export const KING_TUNE = {
  /** The charge: its warning (s), how long he runs (s) and how fast (tiles a second), at most how far, how far past where the hero stood; how near he must pass to strike him; the line of sparks: how long after he stops it bursts, how near it one must stand to be struck, its share of his blow; the whole act (s). */
  charge: { warn: 0.8, run: 0.75, pace: 12, most: 9, past: 1.5, hit: 1.1, burst: 0.6, line: 0.75, sparks: 0.7, long: 2.3 },
  /** The Decree: how near a knight's line (tiles before or behind it) and how near a knight across it he must be to be struck; a knight's share of his blow. */
  decree: { fwd: 0.55, side: 0.85, dmg: 0.8 },
  /** The crown's weight: when in his move it goes up (s), the whole move (s); how long it follows the hero and how fast (tiles a second), how long it hangs still, how far round it the slam strikes, how long it takes to fly home. */
  weight: { send: 1.1, long: 1.6, follow: 2.4, pace: 3.2, hold: 0.45, r: 1.7, home: 0.6 },
  /** The faces: how near one must pass him to strike him, its share of his blow, no more often than `gap`, and no more than `most` of them a cast. */
  faces: { hit: 0.6, dmg: 0.3, gap: 0.3, most: 4 },
  /** His last phase comes at this share of his life. */
  climbAt: 1 / 3,
  /** His waits (cooldowns) in each phase (above two thirds of his life, above a third, below), as a share of his first. */
  cd: [1, 0.85, 0.7] as const,
  /** The Hush at his side (HUSH_BESIDE: the art's lengths, behind and to his left), and its moves: the breath between them (s); GRAB (its warning, how far and how fast its arms shoot out, how near them it catches, how fast it drags, its share of his blow, how long the arms take to come back if they miss; its wait), SHIELD (how long it takes to wrap him, how long at most, how many blows strike it off, how long it is dazed; its wait), FOG (its warning, how far either side of the hero, how wide a patch, how long it lies, how much slower he goes in it; its wait). */
  hush: {
    fwd: HUSH_BESIDE[0] / TILE3, left: HUSH_BESIDE[1] / TILE3, breath: 1.5,
    grab: { warn: 0.6, reach: 8, pace: 16, catch: 0.9, drag: 9, dmg: 0.3, back: 0.4, cd: 7, near: 3.5 },
    shield: { wrap: 0.5, most: 6, hits: 6, dazed: 1.5, cd: 14 },
    fog: { warn: 0.8, apart: 2.5, r: 1.7, lies: 7, slow: 0.45, cd: 9 },
  },
};

/** His phase: 0 above two thirds of his life, 1 above a third, 2 below. */
export function phaseOf(m: Monster): 0 | 1 | 2 {
  const f = m.life / Math.max(1, m.maxLife);
  return f > 2 / 3 ? 0 : f > 1 / 3 ? 1 : 2;
}

/** The way the floor runs that his picture faces now (one of the four), as (fx, fy). */
export function squareOf(fx: number, fy: number): { fx: number; fy: number } {
  const back = backView(fx, fy);
  const flip = flipped(fx, fy);
  return back ? (flip ? { fx: -1, fy: 0 } : { fx: 0, fy: -1 }) : flip ? { fx: 0, fy: 1 } : { fx: 1, fy: 0 };
}
/** Turned square to the way his picture faces (squareOf). */
function squareOn(m: Monster): void {
  const s = squareOf(m.fx, m.fy);
  m.fx = s.fx;
  m.fy = s.fy;
}

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** How far out the Hush's arms are, `t` seconds into its grab (tiles from it): out as they shoot, back as they come home. */
export function armsOut(t: number): number {
  const G = KING_TUNE.hush.grab;
  if (t < G.warn) return 0;
  return Math.min(G.reach, (t - G.warn) * G.pace);
}
/** How far (x, y) is from the segment (ax, ay)-(bx, by) (tiles). */
export function offLine(ax: number, ay: number, bx: number, by: number, x: number, y: number): number {
  const dx = bx - ax;
  const dy = by - ay;
  const L2 = dx * dx + dy * dy;
  const u = L2 > 1e-9 ? clamp01(((x - ax) * dx + (y - ay) * dy) / L2) : 0;
  return Math.hypot(ax + dx * u - x, ay + dy * u - y);
}

/** How far the floor runs from (x, y) along (fx, fy) before a wall (tiles), at most `most`. */
function openFor(g: BossRules['g'], x: number, y: number, fx: number, fy: number, most: number): number {
  let d = 0.5;
  for (; d < most; d += 0.25) if (!g.isOpen(x + fx * d, y + fy * d)) break;
  return Math.min(most, d);
}

/** The Decree's lines laid to the hall from a peril (its x, y, fx, fy; `a` where they rise, `b` where they fade: tiles before him). */
export function decreeOf(p: Peril): { from: number; to: number; half: number } {
  return { from: p.a, to: p.b, half: KG_REACH.decreeHalf };
}
/** Its knights now, on the floor (world), each with how risen and how whole; none where the floor is wall. */
export function decreeNow(g: BossRules['g'], p: Peril): { x: number; y: number; up: number; whole: number; step: number }[] {
  return decreeKnights(p.t, decreeOf(p))
    .map((k) => ({ ...k, ...beside(p.x, p.y, p.fx, p.fy, p.hand, k.x, k.y) }))
    .filter((k) => g.isOpen(k.x, k.y));
}
/** How long the Decree's lines last (seconds from his blow). */
export function decreeLong(p: Peril): number {
  return (DECREE_FX.lines - 1) * (DECREE_FX.apart / DECREE_FX.pace) + (p.b - p.a) / DECREE_FX.pace + DECREE_FX.fade + 0.2;
}

/** The faces of the Curtains now, on the floor (world), each with its height (the art's lengths) and how far through its flight. */
export function facesNow(p: Peril): { x: number; y: number; z: number; kind: number; k: number }[] {
  const at: [number, number] = [p.a, p.b];
  return curtainFaces(p.t, at).map((f) => ({ ...beside(p.x, p.y, p.fx, p.fy, p.hand, f.p[0] / TILE3, f.p[1] / TILE3), z: f.p[2], kind: f.kind, k: f.k }));
}
/** How long the faces fly (seconds from his hand being flung). */
export const FACES_LONG = CURTAINS_FX.long + (KG_REACH.curtains * 1.6) / CURTAINS_FX.pace + 0.3;

/** Where the Hush stands at his side (world). */
export function hushSpot(m: Monster): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, handOf(true, m.fx, m.fy), KING_TUNE.hush.fwd, KING_TUNE.hush.left);
}

const GAIT: GaitDef = { pace: KG_PACE, cycle: KG_WALK.frames / KG_WALK.fps / 2, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 2.6, slack: 0.6, trueBack: true };

const C = KING_TUNE.charge;
const W = KING_TUNE.weight;
const ACTS: readonly ActDef[] = [
  { id: 'gking:charge', clip: 'attack', long: C.long, hit: C.warn, dmg: 1, cooldown: 0, first: 0, after: 0.9, near: 0, far: 10 },
  { id: 'gking:decree', clip: 'decree', long: KG_DECREE.long, hit: KG_DECREE.hit, dmg: KING_TUNE.decree.dmg, cooldown: 15, first: 8, after: 0.5, near: 0, far: 30 },
  { id: 'gking:weight', clip: 'curtains', long: W.long, hit: W.send, dmg: 1.4, cooldown: 11, first: 4, after: 0.5, near: 0, far: 14 },
  { id: 'gking:curtains', clip: 'curtains', long: KG_CURTAINS.long, hit: KG_CURTAINS.hit, dmg: KING_TUNE.faces.dmg, cooldown: 13, first: 11, after: 0.5, near: 3, far: 16 },
  { id: 'gking:climb', clip: 'climbOff', long: KG_CLIMB.long, hit: KG_CLIMB.down[1], dmg: 0, cooldown: 0, first: 0, after: 0.4, near: 0, far: 999, forced: true },
];

type Keep = Record<string, number>;
const keep = (m: Monster): Keep => (m.a1 ??= {}) as Keep;

/** The Hush at his side (a peril that keeps there), or null. */
export function hushPeril(g: BossRules['g']): Peril | null {
  return g.perils.find((p) => p.a1 === 'gking:hush') ?? null;
}
/** The songbird winding and singing (a peril, his death's), or null. */
export function birdPeril(g: BossRules['g']): Peril | null {
  return g.perils.find((p) => p.a1 === 'gking:bird') ?? null;
}
/** The broken songbird lying before his throne (the floor's piece), or undefined. */
export function brokenBird(L: Level): Level['props'][number] | undefined {
  return L.props.find((p) => p.kind === 'piece' && p.name === 'the clockwork songbird, broken');
}

/** The Hush's moves, as its peril has them (`b`): standing, grabbing, shielding him, breathing fog. */
export const HUSH_MOVE = { stand: 0, grab: 1, shield: 2, fog: 3 } as const;
/** Whether the Hush is wrapped round him now, shielding him (its blows land on it). */
export function shielding(g: BossRules['g']): boolean {
  const p = hushPeril(g);
  return !!p && !p.c && p.b === HUSH_MOVE.shield && p.d >= KING_TUNE.hush.shield.wrap;
}

/** Walk (x, y) toward (tx, ty) by at most `step` tiles over open floor; where it got to. */
function stepOver(g: BossRules['g'], x: number, y: number, tx: number, ty: number, step: number): { x: number; y: number; blocked: boolean } {
  const dx = tx - x;
  const dy = ty - y;
  const d = Math.hypot(dx, dy);
  if (d < 1e-6 || step <= 0) return { x, y, blocked: false };
  const go = Math.min(step, d);
  const n = Math.max(1, Math.ceil(go / 0.1));
  let cx = x;
  let cy = y;
  for (let i = 1; i <= n; i++) {
    const nx = x + (dx / d) * ((go * i) / n);
    const ny = y + (dy / d) * ((go * i) / n);
    if (!g.isOpen(nx, ny)) return { x: cx, y: cy, blocked: true };
    cx = nx;
    cy = ny;
  }
  return { x: cx, y: cy, blocked: false };
}

/** A step of the Hush at his side: where it stands, and its three moves (KING_TUNE.hush). */
function hushStep(R: BossRules, m: Monster, p: Peril, dt: number): void {
  const g = R.g;
  const h = g.hero;
  const H = KING_TUNE.hush;
  const k = keep(m);
  // (its waits)
  for (const w of ['cdGrab', 'cdShield', 'cdFog', 'hNext', 'dazed'] as const) k[w] = Math.max(0, (k[w] ?? 0) - dt);
  const home = hushSpot(m);
  p.fx = m.fx;
  p.fy = m.fy;
  if (p.b === HUSH_MOVE.stand) {
    p.x = home.x;
    p.y = home.y;
    if ((k.hNext ?? 0) > 0 || (k.dazed ?? 0) > 0 || (m.act && m.act.id === 'gking:climb')) return;
    const d = Math.hypot(h.x - m.x, h.y - m.y);
    const pick = (k.cdShield ?? 0) <= 0 && m.life < m.maxLife ? HUSH_MOVE.shield : (k.cdGrab ?? 0) <= 0 && d >= H.grab.near && d <= H.grab.reach + 1 ? HUSH_MOVE.grab : (k.cdFog ?? 0) <= 0 ? HUSH_MOVE.fog : HUSH_MOVE.stand;
    if (pick === HUSH_MOVE.stand) return;
    p.b = pick;
    p.d = 0;
    p.done = 0;
    k.hits = 0;
    if (pick === HUSH_MOVE.grab) {
      // (its arms rear back at where the hero stands now: that is the line they shoot along)
      p.a = Math.atan2(h.y - p.y, h.x - p.x);
      g.sfx('gust', 0.4);
    } else if (pick === HUSH_MOVE.fog) {
      // (where its three patches will fall, marked as it breathes in: on the hero, and either side of him; each lies from the
      // moment it breathes out, its clock below 0 until then)
      const F = H.fog;
      p.a = Math.atan2(h.y - p.y, h.x - p.x);
      const ax = p.a + Math.PI / 2;
      for (const s of [0, -1, 1]) {
        const x = h.x + Math.cos(ax) * F.apart * s;
        const y = h.y + Math.sin(ax) * F.apart * s;
        if (!g.isOpen(x, y)) continue;
        const f = R.peril(m, 'act1', x, y, { a1: 'gking:fog', dur: F.lies, hit: 0 });
        f.t = -F.warn;
      }
      g.sfx('gust', 0.3);
    }
    return;
  }
  const was = p.d;
  p.d += dt;
  const at = (T: number): boolean => was < T && p.d >= T;
  const done = (cd: 'cdGrab' | 'cdShield' | 'cdFog', wait: number): void => {
    p.b = HUSH_MOVE.stand;
    p.d = 0;
    p.done = 0;
    k[cd] = wait;
    k.hNext = H.breath;
  };
  if (p.b === HUSH_MOVE.grab) {
    const G = H.grab;
    p.x = home.x;
    p.y = home.y;
    const ca = Math.cos(p.a);
    const sa = Math.sin(p.a);
    if (!p.done) {
      const out = armsOut(p.d);
      if (p.d >= G.warn && offLine(p.x, p.y, p.x + ca * out, p.y + sa * out, h.x, h.y) <= G.catch && !h.move) {
        // (caught: held, and dragged back to stand before him)
        p.done = 1;
        k.caughtAt = p.d;
        R.blow(m, G.dmg);
        g.sfx('hit', 0.6);
      } else if (out >= G.reach && p.d >= G.warn + G.reach / G.pace + G.back) done('cdGrab', G.cd);
      return;
    }
    // (dragging him: before the King, a tile and a half out)
    const to = { x: m.x + m.fx * 1.6, y: m.y + m.fy * 1.6 };
    const q = stepOver(g, h.x, h.y, to.x, to.y, G.drag * dt);
    h.x = q.x;
    h.y = q.y;
    h.held = Math.max(h.held ?? 0, 0.1);
    if (Math.hypot(to.x - h.x, to.y - h.y) < 0.15 || q.blocked || p.d - (k.caughtAt ?? 0) > 2) {
      h.held = 0;
      done('cdGrab', G.cd);
    }
    return;
  }
  if (p.b === HUSH_MOVE.shield) {
    const S = H.shield;
    // (it goes to him, and wraps itself round him)
    const u = clamp01(p.d / S.wrap);
    p.x = home.x + (m.x - home.x) * u;
    p.y = home.y + (m.y - home.y) * u;
    if (at(S.wrap)) g.sfx('gust', 0.5);
    if ((k.hits ?? 0) >= S.hits) {
      // (struck off: back to his side, dazed)
      g.emit({ t: 'text', x: m.x, y: m.y, text: 'Struck off', color: '#ffd27a' });
      g.sfx('hit', 0.8);
      k.dazed = S.dazed;
      done('cdShield', S.cd);
      return;
    }
    if (p.d >= S.wrap + S.most) done('cdShield', S.cd);
    return;
  }
  if (p.b === HUSH_MOVE.fog) {
    const F = H.fog;
    p.x = home.x;
    p.y = home.y;
    if (at(F.warn)) {
      // (it breathes out: its three patches lie)
      g.sfx('gust', 0.6);
      done('cdFog', F.cd);
    }
  }
}

/** Where his crown's weight is going to (its peril), the hero's way: following him at its pace until it stops. */
function weightStep(R: BossRules, p: Peril, dt: number): void {
  const g = R.g;
  const h = g.hero;
  if (p.t < W.follow) {
    const dx = h.x - p.x;
    const dy = h.y - p.y;
    const d = Math.hypot(dx, dy);
    const go = Math.min(d, W.pace * dt);
    if (d > 1e-6) {
      p.x += (dx / d) * go;
      p.y += (dy / d) * go;
    }
    return;
  }
  if (!p.c && p.t >= W.follow + W.hold) {
    // (it slams down)
    p.c = 1;
    g.sfx('explode', 0.8);
    g.emit({ t: 'shake', amount: 6 });
    if (Math.hypot(h.x - p.x, h.y - p.y) <= W.r) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
  }
}

export const RULES: Act1Rules | null = {
  gait: GAIT,
  acts: ACTS,
  bossAt(L) {
    // (he waits before his throne, facing down the hall at the way in)
    const b = L.floor.boss;
    return { x: b.x, y: b.y, fx: 0, fy: 1 };
  },
  invulnerable(m) {
    return !!m.act && m.act.id === 'gking:climb';
  },
  absorbs(R, m) {
    // (the Hush wrapped round him takes the blow: struck off at the sixth)
    if (!shielding(R.g)) return false;
    const k = keep(m);
    k.hits = (k.hits ?? 0) + 1;
    return true;
  },
  forced(_R, m, acts) {
    // (his last phase: the Hush climbs off him)
    if ((m.form ?? 0) === 0 && m.life <= m.maxLife * KING_TUNE.climbAt) return acts.findIndex((a) => a.id === 'gking:climb');
    return -1;
  },
  tick(R, m, dt) {
    // (the Hush at his side: where it stands, and its moves)
    const p = hushPeril(R.g);
    if (p && !p.c) hushStep(R, m, p, dt);
    return false;
  },
  start(R, m, a) {
    const g = R.g;
    // (his blows square to the way his picture faces; his charge goes straight at the hero)
    if (a.id !== 'gking:climb' && a.id !== 'gking:charge') squareOn(m);
    if (!m.act) return;
    if (a.id === 'gking:charge') {
      // (the lane he will run: from him through where the hero stands, on past him; so far as the floor lets him)
      const d = Math.hypot(g.hero.x - m.x, g.hero.y - m.y);
      const want = Math.min(C.most, d + C.past);
      m.act.a = Math.min(want, openFor(g, m.x, m.y, m.fx, m.fy, want + 0.5) - 0.4);
      m.act.b = 0;
      keep(m).struck = 0;
      keep(m).stopped = 0;
      g.sfx('slam', 0.25);
    }
    if (a.id === 'gking:decree') g.sfx('slam', 0.25);
  },
  end(R, m, a) {
    const g = R.g;
    if (a.id === 'gking:climb') {
      // (his last phase: the King alone, the Hush standing at his side)
      m.form = 1;
      const s = hushSpot(m);
      R.peril(m, 'act1', s.x, s.y, { a1: 'gking:hush', dur: 1e9, hit: 0, b: HUSH_MOVE.stand });
      keep(m).hNext = 2;
      return;
    }
    if (a.id === 'gking:charge') {
      // (cut short: the line of sparks still bursts)
      const sp = g.perils.find((q) => q.a1 === 'gking:sparks' && !q.d && q.from === m.name);
      if (sp) {
        sp.d = sp.t;
        sp.dur = sp.t + C.burst + 0.5;
      }
    }
    // (his waits shorter each phase)
    const i = ACTS.findIndex((q) => q.id === a.id);
    if (a.cooldown > 0 && m.moveCd && i >= 0) m.moveCd[i] *= KING_TUNE.cd[phaseOf(m)];
  },
  died(R, m) {
    const g = R.g;
    // (the Hush unwinds into nothing; nothing of it holds him now)
    const h = hushPeril(g);
    if (h) {
      h.c = 1;
      h.t = 0;
      h.dur = 3.2;
      h.b = HUSH_MOVE.stand;
      if (h.done) g.hero.held = 0;
    }
    // (his crown, if it hangs over the hero still, falls away harmless; the Hush's fog lifts)
    g.perils = g.perils.filter((q) => q.a1 !== 'gking:weight' && q.a1 !== 'gking:fog');
    g.hero.slowT = 0;
    // (the clockwork songbird before his throne winds itself up and sings)
    const L = g.level;
    const piece = brokenBird(L);
    if (piece) {
      L.props.splice(L.props.indexOf(piece), 1);
      R.peril(m, 'act1', piece.x, piece.y, { a1: 'gking:bird', dur: 1e9, hit: 0, fx: 1, fy: 0 });
    }
  },
  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const act = m.act;
    if (!act) return;
    if (a.id === 'gking:charge') {
      const r0 = C.warn;
      const r1 = C.warn + C.run;
      if (at(r0)) {
        // (he sets off: the line of sparks begins under him)
        g.sfx('swing', 0.9);
        R.peril(m, 'act1', m.x, m.y, { a1: 'gking:sparks', dur: 99, hit: 0, a: m.x, b: m.y, c: 0, d: 0, dmg: g.rollMonsterDmg(m) * C.sparks });
      }
      if (t1 > r0 && t0 < r1 && act.b < act.a) {
        // (running: as far as his lane, at his pace; whoever he runs into is struck, once)
        const step = Math.min(act.a - act.b, C.pace * (Math.min(t1, r1) - Math.max(t0, r0)));
        const q = stepOver(g, m.x, m.y, m.x + m.fx * step, m.y + m.fy * step, step);
        act.b += q.blocked ? act.a : Math.hypot(q.x - m.x, q.y - m.y);
        m.x = q.x;
        m.y = q.y;
        const sp = g.perils.find((p) => p.a1 === 'gking:sparks' && !p.d && p.from === m.name);
        if (sp) {
          sp.a = m.x;
          sp.b = m.y;
        }
        if (!keep(m).struck && Math.hypot(h.x - m.x, h.y - m.y) <= C.hit && !h.move) {
          keep(m).struck = 1;
          R.blow(m, a.dmg);
        }
      }
      if (!keep(m).stopped && (at(r1) || (t1 > r0 && act.b >= act.a))) {
        // (he stops: the line bursts a moment after)
        keep(m).stopped = 1;
        const sp = g.perils.find((p) => p.a1 === 'gking:sparks' && !p.d && p.from === m.name);
        if (sp) {
          sp.d = Math.max(1e-3, sp.t);
          sp.dur = sp.d + C.burst + 0.5;
        }
      }
      return;
    }
    if (a.id === 'gking:decree') {
      if (!at(a.hit)) return;
      g.sfx('slam', 0.9);
      g.emit({ t: 'shake', amount: 4 });
      // (laid to the hall: they rise at the wall behind him and fade at the wall before him)
      const from = -Math.max(2, openFor(g, m.x, m.y, -m.fx, -m.fy, -DECREE_FX.from) - 0.5);
      const to = Math.max(3, openFor(g, m.x, m.y, m.fx, m.fy, DECREE_FX.to) - 0.5);
      const p = R.peril(m, 'act1', m.x, m.y, { a1: 'gking:decree', hit: 0, a: from, b: to, dmg: g.rollMonsterDmg(m) * a.dmg });
      p.dur = decreeLong(p);
      return;
    }
    if (a.id === 'gking:weight') {
      if (!at(a.hit)) return;
      // (his crown goes up, and hangs over the hero)
      g.sfx('echo', 0.6);
      R.peril(m, 'act1', h.x, h.y, { a1: 'gking:weight', dur: W.follow + W.hold + W.home, hit: 0, c: 0, dmg: g.rollMonsterDmg(m) * a.dmg });
      return;
    }
    if (a.id === 'gking:curtains') {
      if (!at(a.hit)) return;
      g.sfx('echo', 0.7);
      // (at where the hero stands as the hand is flung: in his own lengths, before him and to his left)
      const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
      R.peril(m, 'act1', m.x, m.y, { a1: 'gking:faces', dur: FACES_LONG, hit: 0, a: r.fwd, b: r.left, c: -9, d: 0, dmg: g.rollMonsterDmg(m) * a.dmg });
      return;
    }
    if (a.id === 'gking:climb' && at(KG_CLIMB.rise[0])) g.sfx('echo', 0.5);
  },
  peril(R, p, dt) {
    const g = R.g;
    const h = g.hero;
    if (p.a1 === 'gking:sparks') {
      // (the line of sparks bursts a moment after he stops: whoever stands on it is struck, once)
      if (!p.d || p.c || p.t < p.d + C.burst) return;
      p.c = 1;
      g.sfx('fire', 0.6);
      if (offLine(p.x, p.y, p.a, p.b, h.x, h.y) <= C.line) g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
      return;
    }
    if (p.a1 === 'gking:weight') {
      weightStep(R, p, dt);
      return;
    }
    if (p.a1 === 'gking:fog') {
      // (standing in it, he goes slower, and for a moment after)
      if (Math.hypot(h.x - p.x, h.y - p.y) <= KING_TUNE.hush.fog.r && p.t > 0.25) {
        h.slowT = Math.max(h.slowT ?? 0, 0.2);
        h.slowBy = Math.max((h.slowT ?? 0) > 0 ? (h.slowBy ?? 0) : 0, KING_TUNE.hush.fog.slow);
      }
      return;
    }
    if (p.a1 === 'gking:decree') {
      // (a knight walks into him: struck, once a line)
      if (g.time - (p.c || -9) < 1.0) return;
      const r = fromFigure(p.x, p.y, p.fx, p.fy, p.hand, h.x, h.y);
      const T = KING_TUNE.decree;
      for (const k of decreeKnights(p.t, decreeOf(p))) {
        if (k.up < 0.6 || k.whole < 0.4) continue;
        if (Math.abs(r.fwd - k.x) > T.fwd || Math.abs(r.left - k.y) > T.side) continue;
        p.c = g.time;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, h.x, h.y, p.half);
        return;
      }
      return;
    }
    if (p.a1 === 'gking:faces') {
      // (a face passes through him: struck, no more often than the gap, no more than `most` a cast)
      const F = KING_TUNE.faces;
      if (p.d >= F.most || g.time - p.c < F.gap) return;
      for (const f of facesNow(p)) {
        if (f.k > 0.95) continue;
        if (Math.hypot(f.x - h.x, f.y - h.y) > F.hit) continue;
        p.c = g.time;
        p.d++;
        g.hurtHero(p.dmg, p.el, p.words, null, p.from, f.x, f.y, p.half);
        return;
      }
    }
  },
};
