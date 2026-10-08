// Locking on (touch).
//
// The owner, 4 Oct 2026: "I'd like to try combat controls differently ... attacking the direction
// the character is facing, not where you tap. The issue I'm running into is that if enemies or
// interactables are on the left side of the screen, it's hard to tap on them. So let's have the
// attacks go in the direction you're facing. Let's also try to lock onto enemies so you can run
// backwards and attack. Out of combat, still attack in the direction you're facing. I'll see how
// that feels and change the lock targeting if need be."
//
// So, with attacks aimed this way (`Meta.aim === 'face'`):
//   - IN A FIGHT the hero is locked onto one enemy: the nearest one that is awake and in sight.
//     The hero stays turned toward it whichever way they walk, and every attack goes at it.
//   - The lock is sticky: it moves to another enemy only when that one is clearly nearer, so two
//     monsters at about the same distance do not make the hero twitch from one to the other.
//   - Where the thumb lands does not matter. (A touch right on a monster COULD pick that one out,
//     "pinned" until it is dead or gone, for the archer at the back: `LOCK.touchPicks`. It is
//     built and tested and switched off, because he asked for attacks that do not depend on where
//     he taps, and a thumb tapping in a crowd would pick monsters by accident. One line to try.)
//   - OUT OF A FIGHT there is no lock, and attacks go the way the hero faces. A thumb on a stick
//     is not a ruler, so a monster standing roughly that way is aimed at (`aimAhead`).
//
// Everything here only LOOKS at the game; main.ts turns what it says into controls.

import { MONSTERS, SKILLS, TUNE } from './defs';
import type { SkillKind } from './defs';
import type { Game } from './game';
import type { Monster } from './state';

export const LOCK = {
  /** An awake enemy is locked onto from this far away (tiles) ... */
  take: 10,
  /** ... and kept until it is this far away. */
  keep: 12.5,
  /** Seconds a locked enemy may be out of sight (behind a pillar, round a corner) before the lock lets go. */
  lostFor: 0.8,
  /** The lock moves to another enemy only when that one is this many tiles nearer. */
  switchBy: 1.5,
  /** With nothing locked: an enemy within this cone of the way the hero faces (the cosine of half its width) is aimed at ... */
  cone: 0.85,
  /** ... if it is no farther than this. */
  ahead: 10,
  /** A touch right on a monster picks it out as the one locked onto (see the top of this file). */
  touchPicks: false,
};

function gap(g: Game, m: Monster): number {
  return Math.hypot(m.x - g.hero.x, m.y - g.hero.y);
}

export class LockOn {
  /** The enemy locked onto (its id), or null. */
  id: number | null = null;
  /** The player picked it out by touching it: it is not given up for a nearer one. */
  pinned = false;
  /** How long it has been out of sight. */
  private lost = 0;

  clear(): void {
    this.id = null;
    this.pinned = false;
    this.lost = 0;
  }

  /** The player touched this monster: it is the one, until it is dead or gone. */
  pin(m: Monster): void {
    this.id = m.id;
    this.pinned = true;
    this.lost = 0;
  }

  /** Bring the lock up to date and say which enemy it is on now (null: none). Call it once a frame. */
  update(g: Game, dt: number): Monster | null {
    const h = g.hero;
    let cur: Monster | null = this.id === null ? null : g.monsters.find((m) => m.id === this.id && !m.dead) ?? null;
    if (cur) {
      const inSight = cur.seen && g.sees(h.x, h.y, cur.x, cur.y);
      this.lost = inSight ? 0 : this.lost + dt;
      // (a lock the game made is only ever on something awake; one the player made may be on a sleeper)
      if (gap(g, cur) > LOCK.keep || this.lost > LOCK.lostFor || (!this.pinned && cur.state === 'sleep')) cur = null;
    }
    if (!cur) this.clear();
    if (!this.pinned) {
      let best: Monster | null = null;
      let bd = Infinity;
      for (const m of g.monsters) {
        if (m.dead || !m.seen || m.state === 'sleep') continue;
        const d = gap(g, m);
        if (d > LOCK.take || d >= bd || !g.sees(h.x, h.y, m.x, m.y)) continue;
        bd = d;
        best = m;
      }
      if (best && best !== cur && (!cur || bd < gap(g, cur) - LOCK.switchBy)) {
        cur = best;
        this.id = best.id;
        this.lost = 0;
      }
    }
    return cur;
  }
}

/**
 * AUTO AIM (`Meta.aim === 'auto'`, Version 12.1.1). The owner: "option which will auto aim
 * everything. So any ability that goes where you tap or hold will auto target an enemy".
 * What a tap and a hold go for, whatever the thumb lands on:
 *   - the enemy the lock is on: the nearest one awake and in sight, kept until another is clearly
 *     nearer (LockOn above; nothing else of the 'face' way is used: the hero is not turned);
 *   - but a blow struck beside the hero comes first for an enemy it can reach, as it does where
 *     the thumb aims (Version 11.1): the sword for one within its reach, the one being fought
 *     already (`fought`) before any other; the slam for one it would catch.
 * null: nothing to aim at, and the attack goes the way the hero faces.
 */
export function autoTargets(g: Game, locked: Monster | null, fought: number | null): { quick: Monster | null; slow: Monster | null } {
  const h = g.hero;
  const q = h.skills[0];
  const s = h.skills[1];
  const qd = SKILLS[q.id];
  const sd = SKILLS[s.id];
  const blade = qd.kind === 'melee' ? g.nearAssist(qd.range * q.r.size * 0.9, fought) : null;
  const slam = sd.kind === 'burst' ? g.nearAssist(sd.range + sd.radius * s.r.size * 0.8, fought) : null;
  return { quick: blade ?? locked, slow: slam ?? locked };
}

/**
 * With nothing locked: where an attack made "the way the hero faces" goes. At the nearest monster
 * that stands roughly that way and can be seen (`m`), else at the point `reach` tiles straight
 * ahead.
 */
export function aimAhead(g: Game, reach: number): { x: number; y: number; m: Monster | null } {
  const h = g.hero;
  let best: Monster | null = null;
  let bd = Infinity;
  for (const m of g.monsters) {
    if (m.dead || !m.seen) continue;
    const dx = m.x - h.x;
    const dy = m.y - h.y;
    const d = Math.hypot(dx, dy);
    if (d > LOCK.ahead || d >= bd) continue;
    // (one standing on the hero's toes is "ahead" whichever way the hero happens to be turned)
    const cos = d > 0.6 ? (dx * h.fx + dy * h.fy) / d : 1;
    if (cos < LOCK.cone || !g.sees(h.x, h.y, m.x, m.y)) continue;
    bd = d;
    best = m;
  }
  if (best) return { x: best.x, y: best.y, m: best };
  return { x: h.x + h.fx * reach, y: h.y + h.fy * reach, m: null };
}

/**
 * Where a monster that is coming for the hero will be in `seconds`: that much further along its
 * way to them, and no nearer than where it stops to strike. One that keeps its distance (an
 * archer), one asleep, one that cannot move: where it stands.
 */
export function leadPoint(g: Game, m: Monster, seconds: number): { x: number; y: number } {
  const h = g.hero;
  const def = MONSTERS[m.kind];
  const d = Math.hypot(h.x - m.x, h.y - m.y);
  if (def.ranged || m.state === 'sleep' || m.speed <= 0 || d < 0.01) return { x: m.x, y: m.y };
  const go = Math.max(0, Math.min(d - def.range * 0.8, m.speed * seconds));
  return { x: m.x + ((h.x - m.x) / d) * go, y: m.y + ((h.y - m.y) / d) * go };
}

/**
 * Where an attack of this kind is put when it is aimed AT A MONSTER for the player (auto aim, the
 * lock, the test bot): on it, but for a volley, whose arrows are a moment in the air and then
 * rain for a while: that is put where the monster is going, so that it walks into the rain and
 * not out of it. (Version 12.2. A player aiming by hand learns the same thing in two volleys.)
 */
export function placedAim(g: Game, m: Monster, kind: SkillKind): { x: number; y: number } {
  if (kind !== 'volley') return { x: m.x, y: m.y };
  return leadPoint(g, m, SKILLS.volley.windup + TUNE.volleyDelay + TUNE.volleyLead);
}
