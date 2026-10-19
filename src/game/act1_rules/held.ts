// ACT 2, THE HUSH: A MEDIUM KIND'S SECOND ATTACK, MADE FROM ITS ONE DRAWN BLOW (the main chat's, 19 Oct 2026).
//
// His rule of 9 Oct (his gameplay rulebook, "Their attacks"): "Tiny and small monsters have one attack, medium two ... and
// every one a basic single-target attack to use while its big ones cool down: the bigger the hit, the longer the cooldown."
// The art chat drew four of the Hush's medium kinds one blow each (the Hushed watch's halberd sweep, the orderlies' mallet,
// the Bookwardens' tome slam; the dredgers' hook and haul, which splits in two by itself: game/act1_rules/dredger.ts). His
// words to the main chat, 19 Oct 2026, 14:39 Pacific: "Please read the main chat and get the game updated up to level 15";
// told him (plain message, that minute) that each would get a second move made from its own drawn frames rather than hold
// the release for new art. So, for the watch, the orderlies and the Bookwardens, A HELD BLOW: the same picture, its warning
// (the weapon raised and shaking, glinting pink; the tome whirled overhead) PLAYED ROUND AGAIN AND AGAIN for `extra` seconds
// (ActDef.loop, as the Chained One's whirl is), a RED CIRCLE on the floor where it will land from the start (the warning the
// trolls' slam has always had, Zone 'warn', drawn by render.ts), and it lands harder, over all the circle, and throws him
// back further. Nothing new is painted.
//
// The circle is a picture only: what it does is done here, at the blow, to whoever is in it then (so a knock back cannot
// carry him out of his own hurt). Its fill follows the act's own clock (a chill slows both together); it is taken away as
// the blow lands, if the act is broken off (BossRules.breakOff) or the one making it dies or goes.

import type { ActDef, BossRules } from '../bosses';
import { actClock } from '../bosses';
import { TUNE } from '../defs';
import type { Monster, Zone } from '../state';

/** A circle's clock: long, so it never goes off by itself (it is only a picture); its fill set from the act's. */
const LONG = 1000;
/** How full the circle is drawn as the blow lands. */
const FULL = 0.97;

/**
 * Its held blow, from its basic one: the warning `warn` (from, to: seconds of the picture) played round `rounds` more times;
 * `dmg` times its blow, `cooldown` seconds, first ready `first` seconds after it wakes.
 */
export function heldAct(base: ActDef, id: ActDef['id'], warn: readonly [number, number], rounds: number, dmg: number, cooldown: number, first: number): ActDef {
  const span = warn[1] - warn[0];
  const extra = span * rounds;
  return { ...base, id, long: base.long + extra, hit: base.hit + extra, dmg, cooldown, first, loop: { at: warn[0], span, extra } };
}

/**
 * Where in its picture's own timings (the basic blow's) a held act `t` seconds in is, kept moving forward: at the warning's
 * end while the warning is played round, then on as the basic blow's. (actClock is where in its PICTURES it is, going round.)
 */
export function heldTime(a: ActDef, t: number): number {
  const L = a.loop;
  if (!L) return t;
  const end = L.at + L.span;
  if (t <= end) return t;
  if (t < end + L.extra) return end;
  return t - L.extra;
}

/** (for the tests and the pictures) Where in its pictures it is: actClock's. */
export function heldFrame(a: ActDef, t: number): number {
  return actClock(a, t);
}

/** The red circle it lays, if it has one on the floor now. */
function circleOf(R: BossRules, m: Monster): Zone | undefined {
  return R.g.zones.find((z) => z.kind === 'warn' && z.src === m.id);
}

/** Its red circle laid at (x, y), `r` tiles round, as the held act begins. */
export function layCircle(R: BossRules, m: Monster, x: number, y: number, r: number): void {
  const g = R.g;
  dropCircle(R, m);
  g.addWarn(x, y, r, LONG, 0, g.monsterElement(m), m.words, m.name, m.id, g.halfOf(m));
}

/** Its circle's fill kept with the act's clock, `t` seconds into act `a` (before its blow). */
export function fillCircle(R: BossRules, m: Monster, a: ActDef, t: number): void {
  const z = circleOf(R, m);
  if (!z) return;
  z.t = Math.min(FULL, Math.max(0, t / a.hit)) * FULL * LONG;
}

/** Its circle taken off the floor. */
export function dropCircle(R: BossRules, m: Monster): void {
  const zs = R.g.zones;
  for (let k = zs.length - 1; k >= 0; k--) if (zs[k].kind === 'warn' && zs[k].src === m.id) zs.splice(k, 1);
}

/**
 * THE HELD BLOW LANDS: the circle goes (in a burst, the floor shaking, as a troll's slam's does); whoever is in it is struck
 * `a.dmg` times its blow and thrown back `knock` of a Heavy blow's step from its middle. True if he was struck.
 */
export function landCircle(R: BossRules, m: Monster, a: ActDef, knock: number): boolean {
  const g = R.g;
  const h = g.hero;
  const z = circleOf(R, m);
  if (!z) return false;
  dropCircle(R, m);
  g.emit({ t: 'burst', x: z.x, y: z.y, r: z.r, el: z.element, style: 'blast' });
  g.emit({ t: 'shake', amount: 4 });
  if (Math.hypot(h.x - z.x, h.y - z.y) > z.r + TUNE.heroRadius * 0.5 || h.move || h.invuln > 0 || g.over) return false;
  const was = h.life;
  R.blow(m, a.dmg);
  if (h.life < was) g.knockHero(z.x, z.y, knock);
  return h.life < was;
}

/** (each held kind's `tick`) A circle left with no held act going (it was stopped some other way): taken away. */
export function tidyCircle(R: BossRules, m: Monster, held: ActDef['id']): void {
  if (m.state === 'act' && m.act?.id === held) return;
  if (circleOf(R, m)) dropCircle(R, m);
}
