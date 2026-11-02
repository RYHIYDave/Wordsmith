// FLOOR 4, MORE ACTION (game/defs.ts ACTION_F4; the art chat's art/action-f4, his yes to its pictures, 1 Nov 2026): what the
// Ossuary Golem's SKELETON HURL does on the floor, in place of its skull lob. A peril of kind 'act1' by name (HURL_PERIL; its
// picture drawn by render/act1_fx/golem.ts), stepped here (game/bosses.ts stepPerils, for a peril whose kind has no rules of its
// own):
//   AIMED as the golem has the skeleton up and begins to hold it (HURL.aim into its throw): where the hero stands then, the reach
//     of its burst marked round it (HURL.r). If the golem falls, or is stopped, before it lets go, the mark goes and nothing comes.
//   LOOSED at the throw's hit, from its fist (HURL_FROM, as its picture holds it): in flight hurlFly(d) seconds, `d` the tiles
//     from the golem to the mark. The peril's 0 is its landing.
//   IT BURSTS as it lands: a hero within HURL.r of where it lands is struck by the bones (burstStrikes). The bones lie, crumble and
//     are gone by BURST_LONG.
// A Twin golem's second skeleton is aimed as the first is loosed and loosed TWIN_AFTER later.
// (And THE DAGGER CULTIST'S FRENZY, carried along the floor as its pictures carry him: frenzyAt, below; its stabs are game.ts's.)
//   The peril's own numbers: `done` 0 aimed, 1 in flight, 2 burst; `a` the golem; `b`, `c` where it leaves the fist (tiles);
//   `d` the tiles from the golem to the mark; `fx`, `fy` the way the golem faced as it let go; `hand` 1, or -1 a Twin's second.

import { BURST_LONG, HURL, HURL_FROM, burstStrikes, hurlArc, hurlFly } from '../art/action_f4_fx';
import { FRENZY, frenzyCame } from '../art/cultists';
import type { MonsterMove } from './defs';
import type { Game } from './game';
import type { Monster, Peril } from './state';

/** The peril's name, and how long it lasts after it lands (seconds). */
export const HURL_PERIL = 'golem:hurl';
export const HURL_LASTS = BURST_LONG;
/** The reach of its burst round its mark (tiles: the art's HURL.r), for what steps out of it (src/dev/bot.ts). */
export const HURL_REACH = HURL.r;
/** A Twin golem's second skeleton: loosed this long after the first (as its second skull was). */
export const TWIN_AFTER = 0.35;

/**
 * The way the golem's picture faces, and its right, on the floor (tiles), as the game shows it facing (fx, fy): seen from in front
 * (down the screen) or from behind, and turned over when it goes left (render.ts monsterSprite). Its fist is where its picture has
 * it, whichever way it truly faces.
 */
export function pictureWays(fx: number, fy: number): { ahead: [number, number]; right: [number, number] } {
  const back = fx + fy < -0.2;
  let ahead: [number, number] = back ? [0, -1] : [1, 0];
  let right: [number, number] = back ? [1, 0] : [0, 1];
  if (fx - fy < 0) {
    ahead = [ahead[1], ahead[0]];
    right = [right[1], right[0]];
  }
  return { ahead, right };
}

/** THE GOLEM TAKES ITS AIM: the mark where the hero stands, waiting for it to let go. `share`: of its blow (a Twin's second, of its Twin). */
export function aimHurl(g: Game, m: Monster, mv: MonsterMove, share: number, hand: 1 | -1, wait: number): Peril {
  const h = g.hero;
  const d = Math.hypot(h.x - m.x, h.y - m.y);
  const p: Peril = {
    kind: 'act1', a1: HURL_PERIL, x: h.x, y: h.y, fx: m.fx, fy: m.fy, t: -(wait + hurlFly(d)), hit: 0, dur: HURL_LASTS,
    dmg: g.rollMonsterDmg(m) * mv.dmg * share, el: g.monsterElement(m), words: m.words, half: g.halfOf(m), from: m.name,
    done: 0, a: m.id, b: m.x, c: m.y, d, hand,
  };
  g.perils.push(p);
  return p;
}

/** IT LETS GO: the skeleton leaves its fist for the mark. */
export function looseHurl(p: Peril, m: Monster): void {
  const { ahead, right } = pictureWays(m.fx, m.fy);
  const [along, left] = HURL_FROM;
  p.done = 1;
  p.t = -hurlFly(p.d);
  p.fx = m.fx;
  p.fy = m.fy;
  p.b = m.x + ahead[0] * along - right[0] * left;
  p.c = m.y + ahead[1] * along - right[1] * left;
}

/** The golem's skeleton waiting to be let go (`hand`'s), if it has one. */
export function aimedHurl(g: Game, m: Monster, hand: 1 | -1): Peril | null {
  return g.perils.find((p) => p.a1 === HURL_PERIL && p.a === m.id && p.done === 0 && p.hand === hand) ?? null;
}

/** Where the skeleton is in its flight: its floor point (tiles), how high (picture pixels, two to a game pixel), and how far through it (0 to 1). Null: not in flight. */
export function hurlFlight(p: Peril): { x: number; y: number; z: number; u: number } | null {
  if (p.a1 !== HURL_PERIL || p.done === 0 || p.t >= 0) return null;
  const fly = hurlFly(p.d);
  const u = Math.max(0, Math.min(1, (p.t + fly) / fly));
  const z0 = HURL_FROM[2];
  return { x: p.b + (p.x - p.b) * u, y: p.c + (p.y - p.c) * u, z: z0 + (HURL.land - z0) * u + 4 * hurlArc(p.d) * u * (1 - u), u };
}

/** A step of a floor 4 peril (game/bosses.ts stepPerils). False: it is none of these. */
export function stepActionF4(g: Game, p: Peril, hurt: (mult?: number) => void): boolean {
  if (p.a1 !== HURL_PERIL) return false;
  if (p.done === 0) {
    // (aimed, not yet let go: held there until it is; gone if its golem falls or is stopped first)
    const m = g.monsters.find((o: Monster) => o.id === p.a);
    if (!m || m.dead || (m.state !== 'windup' && m.state !== 'recover')) {
      p.dur = p.t;
      return true;
    }
    const fly = hurlFly(p.d);
    if (p.t > -fly - 1e-3) p.t = -fly - 1e-3;
    return true;
  }
  if (p.done === 1 && p.t >= 0) {
    p.done = 2;
    const h = g.hero;
    if (burstStrikes(h.x - p.x, h.y - p.y, HURL.r)) hurt();
    g.sfx('slam', 0.7);
    g.emit({ t: 'shake', amount: 2.5 });
  }
  return true;
}

// =============================================================================================
// THE DAGGER CULTIST'S FRENZY, CARRIED

const CAME: number[] = [];
/** How far the frenzy's pictures have carried him by its frame `age` seconds in (tiles; art/cultists.ts frenzyCame, a frame at a time). */
export function frenzyAt(age: number): number {
  const k = Math.max(0, Math.min(Math.round(FRENZY.long * 30), Math.floor(age * 30 + 1e-6)));
  return (CAME[k] ??= frenzyCame(k / 30));
}
/** How long his frenzy has run (seconds), as his pictures show it: its wind-up counted down (`t` left of `windup`), then its recover. */
export function moveAge(state: string, t: number, windup: number, recover: number): number {
  return state === 'windup' ? windup - Math.max(0, Math.min(windup, t)) : windup + recover - Math.max(0, Math.min(recover, t));
}
/**
 * Where his picture is to be drawn from his place (game pixels), while his frenzy runs: his pictures carry him along the way they
 * face (pictureWays), and the rules carry him the way he truly faces, so his picture is drawn back by what it carries him.
 */
export function frenzyShift(fx: number, fy: number, age: number): [number, number] {
  const { ahead } = pictureWays(fx, fy);
  const c = frenzyAt(age);
  return [-Math.round((ahead[0] - ahead[1]) * 16 * c), -Math.round((ahead[0] + ahead[1]) * 8 * c)];
}
