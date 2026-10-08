// TWO TESTS OF WEIGHT, MOCKED UP FOR THE OWNER TO JUDGE (the art chat, 8 Oct 2026; the research's
// "Fifth, film two tests of weight"). BOTH ARE OFF IN THE GAME: nothing here changes what anybody
// sees until a page switches them on for itself (main.ts, `__dbg.weight`; the films are made by
// tools/scenarios/film_heavy_blow.mjs and film_run_feet.mjs). His words they answer: 4 Oct 2026,
// 12:40, "I like the art style and the look but I want the animations to be really slick."; 6 Oct
// 2026, 00:32, "Like the mage fires his beam and it blows his cloak back. I want things to have
// weight. That's very important".
//
// 1. HITSTOP: A HOLD OF THE PICTURE ONLY, WHEN A HEAVY BLOW LANDS. When the warrior's Slam lands on
//    something, he and what it struck are held still in the picture for a moment, the struck one
//    white and shaken where it stands, and then both go on. THE RULES ARE NOT TOUCHED: the blow
//    lands when it did, the monster acts when it would have, the attack is over when it was. Only
//    what is shown waits, and the hero's picture makes the moment up over the rest of his
//    follow-through (`lagAt`). Today a blow with the Power word slows the WHOLE GAME, rules and
//    all, to six hundredths of its speed for 0.045 of a second (0.07 for a blow over an area:
//    render/fx.ts, `hold`; main.ts), and every other blow gets a white flash and the struck one's
//    picture pushed back 3 game pixels (render.ts, FLINCH). The research's word for this is
//    hit-stop: in a fighting game, attacker and victim freeze for a moment when a hit lands and
//    the victim is shaken; bigger hits freeze longer, missiles hardly at all, hits that come many
//    to a second shorter or not at all. So it is given here to the heaviest blow only.
//
// 2. STRIDE: A HERO'S RUN PLAYED BY THE GROUND IT COVERS, NOT BY THE CLOCK. Today the run is
//    played at thirty pictures a second, two steps to the half second, however fast the hero goes
//    (render/figure.ts). The rules move every hero 4.6 tiles a second (TUNE.heroSpeed); a planted
//    foot of the knight's run goes back under him at about 3.0 tiles a second, the ranger's at 3.6,
//    the mage's at 2.4: so a foot that is down slides forward over the floor. Played by the ground
//    covered, one turn of the run lasts as long as the hero takes to cover the ground its two steps
//    cover (AnimSet.walkGround), and the foot that is down stays where it was put (to within the
//    pictures there are of it: one turn is fifteen).

import type { Sprite } from '../engine/px';

/**
 * THE HOLD OF THE PICTURE (off in the game). `hold`: how long the hero and what he struck stand
 * still, in seconds of the game's time: 0.1, six sixtieths (of 0.06, 0.1 and 0.15 filmed on 8 Oct,
 * 0.06 was hardly more than today in a film at thirty pictures a second, and 0.15 left the
 * hero's recovery hurried, as it had to make up the time 1.75 times as fast). `shake`: how far the
 * struck one is shaken from side to side, in game pixels. `catchUp`: over how long after the hold
 * the hero's picture makes up what it waited (it plays that much faster: 1.5 times, with these).
 * `back`: how long the struck one takes to come back from where the blow knocked it (the game's
 * own knock-back, FLINCH, lasts 0.12).
 */
export const HITSTOP = { on: false, hold: 0.1, shake: 2, catchUp: 0.2, back: 0.12 };

/** THE RUN PLAYED BY THE GROUND IT COVERS (off in the game). */
export const STRIDE = { on: false };

// ---------------------------------------------------------------------------------------------
// The hold

/**
 * How far behind the rules the held hero's picture is, in seconds, `since` seconds after the blow
 * landed: as long as the hold lasts it falls behind second for second (it stands still), and over
 * `catchUp` seconds after that it makes the time up again.
 */
export function lagAt(since: number, hold: number, catchUp: number): number {
  if (since <= 0 || hold <= 0) return 0;
  if (since <= hold) return since;
  if (catchUp <= 0 || since >= hold + catchUp - 1e-9) return 0;
  return hold * (1 - (since - hold) / catchUp);
}

/**
 * How far the struck one is shaken from where it stands, in game pixels (+ to the right), `since`
 * seconds after the blow: from side to side thirty times a second, `amp` at first and a pixel at
 * the last, and not at all once the hold is over. (Thirty times a second, not sixty: the films go
 * at thirty pictures a second, and a shake that turned every sixtieth would be lost in them.)
 */
export function shakeAt(since: number, hold: number, amp: number): number {
  if (since < 0 || since >= hold || amp <= 0) return 0;
  const size = Math.max(1, Math.round(amp * (1 - since / hold)));
  return Math.floor(since * 30 + 1e-6) % 2 === 0 ? size : -size;
}

/**
 * How much of its knock-back the struck one shows, 0..1, `since` seconds after the blow: all of it
 * while the hold lasts, and back to nothing over `back` seconds after.
 */
export function pushAt(since: number, hold: number, back: number): number {
  if (since < 0) return 0;
  if (since < hold) return 1;
  if (back <= 0) return 0;
  return Math.max(0, 1 - (since - hold) / back);
}

/** What the hold needs to know of the hero. */
export interface HoldHero {
  anim: string;
  attackAge: number;
  attackWind: number;
}
/** ... and of a monster. */
export interface HoldMonster {
  id: number;
  flash: number;
  dead: boolean;
}

/**
 * One blow held (the renderer keeps one of these). Each frame, before anything is drawn, `look`
 * is told how the hero and the monsters stand: when the hero's heavy blow lands on something (its
 * wind-up has just run out, and a monster has just been struck: its flash has just begun) the hold
 * begins. Then `heroAge` is the attack clock to draw the hero by, `heroStill` whether his cloth
 * stands still too, and `victim` what to draw a struck monster with.
 */
export class PictureHold {
  /** Seconds of the game's time since the blow being held landed; -1 when none is. */
  since = -1;
  /** The hero's attack clock when the blow landed (a smaller one after it is another attack). */
  private age0 = 0;
  private wind = 0;
  /** Who it struck (monster ids), and the picture each was showing when the blow landed (null until first drawn). */
  private struck = new Map<number, Sprite | null>();
  /** What was seen last frame: the hero's attack clock, each monster's flash. */
  private ageWas = -1;
  private flashWas = new Map<number, number>();

  /** Is a blow being held, or the hero's picture still making up what it waited? */
  get active(): boolean {
    return this.since >= 0;
  }

  /** Forget everything (a new hero, a new level). */
  reset(): void {
    this.since = -1;
    this.struck.clear();
    this.flashWas.clear();
    this.ageWas = -1;
  }

  /**
   * Each frame, before anything is drawn. `heavy`: the attack the hero is making is a heavy blow
   * (the renderer says which: the Slam). `dt`: seconds of the game's time this frame stands for.
   */
  look(hero: HoldHero, heavy: boolean, monsters: readonly HoldMonster[], dt: number, s = HITSTOP): void {
    if (this.since >= 0) {
      this.since += Math.max(0, dt);
      // (over: or the hero has begun another attack, or stopped attacking, before it was)
      const over = this.since > s.hold + Math.max(s.catchUp, s.back) + 1e-6;
      if (over) {
        this.since = -1;
        this.struck.clear();
      }
    }
    const attacking = hero.anim === 'attack';
    const landed = heavy && attacking && this.ageWas >= 0 && this.ageWas <= hero.attackAge && this.ageWas < hero.attackWind && hero.attackAge >= hero.attackWind;
    if (landed) {
      const hit: number[] = [];
      for (const m of monsters) if (!m.dead && m.flash > (this.flashWas.get(m.id) ?? 0) + 1e-6) hit.push(m.id);
      if (hit.length) {
        this.since = Math.max(0, hero.attackAge - hero.attackWind);
        this.age0 = hero.attackAge;
        this.wind = hero.attackWind;
        this.struck.clear();
        for (const id of hit) this.struck.set(id, null);
      }
    }
    this.ageWas = attacking ? hero.attackAge : -1;
    this.flashWas.clear();
    for (const m of monsters) if (!m.dead) this.flashWas.set(m.id, m.flash);
  }

  /** Is the hero still making the attack whose blow is held? */
  private sameAttack(hero: HoldHero): boolean {
    return this.since >= 0 && hero.anim === 'attack' && hero.attackAge >= this.age0 - 1e-9 && Math.abs(hero.attackWind - this.wind) < 1e-9;
  }

  /** The attack clock to draw the hero by: the rules' own, less what the picture is behind. */
  heroAge(hero: HoldHero, s = HITSTOP): number {
    if (!this.sameAttack(hero)) return hero.attackAge;
    return hero.attackAge - lagAt(this.since, s.hold, s.catchUp);
  }

  /** Is the hero held still just now (his cloth and all)? */
  heroStill(hero: HoldHero, s = HITSTOP): boolean {
    return this.sameAttack(hero) && this.since < s.hold;
  }

  /**
   * How to draw a monster that the held blow struck, or null for one it did not (or once it is
   * over): the picture it was showing when the blow landed while the hold lasts (null: draw its
   * own, and give it here with `keep`), how far it is shaken, how much of its knock-back it shows,
   * and whether it is held white.
   */
  victim(id: number, s = HITSTOP): { still: Sprite | null; held: boolean; shake: number; push: number } | null {
    if (this.since < 0 || !this.struck.has(id)) return null;
    const held = this.since < s.hold;
    return { still: held ? (this.struck.get(id) ?? null) : null, held, shake: shakeAt(this.since, s.hold, s.shake), push: pushAt(this.since, s.hold, s.back) };
  }

  /** The picture a struck monster was showing at the blow (the first one drawn in the hold). */
  keep(id: number, sp: Sprite): void {
    if (this.struck.has(id) && this.struck.get(id) === null) this.struck.set(id, sp);
  }
}

// ---------------------------------------------------------------------------------------------
// The run

/**
 * Which picture of a run (`n` of them to a turn of it) to show when the hero has covered `ground`
 * tiles since the run began, a turn of it covering `perTurn` tiles: the nearest. (The nearest, not
 * the last one passed: so the foot that is down is never more than half a picture's worth of
 * ground from where it was put.)
 */
export function strideFrame(ground: number, perTurn: number, n: number): number {
  if (n <= 0 || perTurn <= 0) return 0;
  const i = Math.round((Math.max(0, ground) / perTurn) * n) % n;
  return i < 0 ? i + n : i;
}
