// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: YOUR REFLECTIONS: their rules (game/act1_rules/types.ts). Built by the main chat from
// the art chat's (art/reflections.ts, reflections_fx.ts; his picks there, “Glassy copy of you (Recommended)”, “Yes, that's them
// (Recommended)”, and what glows on you pink on them, “Pink, like enemies (Recommended)”; docs/mockups/reflections/README.md).
// His doc, level 18: "your own reflections, which step out of the mirrors and fight with your class's moves". Medium: two blows.
//
// WHAT THEY DO (the main chat's, where the art leaves it to the game):
// - A COPY OF YOUR CLASS (Monster.form, set as it comes into the world by the hero's class: FORM_OF): its pictures yours turned to
//   glass (art/act1_figs/reflection.ts), its two blows yours, the tap's and the hold's:
//     a blade (the knight; the Brawler, until the art has his): a cut before it (STYLE.blade), then a whirl round it;
//     a bow (the ranger; the Tinkerer, until hers): an arrow at you, then a volley of five;
//     magic (the mage; the Warlock, until his): a wave rolling at you, then an orb lobbed where you stood that bursts.
//   Each held first a moment, its warning in the enemy's pink on the floor (his rule for enemies, 28 Oct: “Start from now on,
//   but every enemy is going to need that change eventually.  And bigger AOE to compensate for the extra time the player gets to
//   evade”): your own moves are quicker than any enemy's warning should be, so its picture holds its first frame through it.
// - IT STEPS OUT OF A MIRROR: as it wakes, the nearest tall mirror not taken (within STEP.near) is its way in: it is put before
//   that glass and steps out of it (the art's clips.moves.stepOut), not to be struck until it is through.
// Where it is drawn and warned: render/act1_fx/reflection.ts.
//
// THE HEROES AS THEY LOOK NOW (behind REFLECTIONS_UP, off: the queue's wire-floor-18-new-reflections, 12 Nov 2026). The art chat's
// glass copies of the six heroes as they look now (art/reflections_up.ts; his yes, 12 Nov, “Yes, hand to main (Recommended)”),
// and with them each class's OWN two blows, in place of the three styles the Warlock, the Tinkerer and the Brawler stood in with:
// each form's tap and hold (`UP`), each landing at the moment its picture's blow does (the art's clips' `hit`) and played for as
// long as its picture is (`play`), after the same warning as before. THE WARRIOR HOLDS WHAT HE HOLDS (his weapon tree, live since
// 25.3.11): his great sword's copy (form 0), his war axe's (6), his maul's (7), by his weapon as it comes into the world.
// Off, everything is as it was, to the number.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Monster, Peril } from '../state';
import type { ClassId } from '../types';
import type { Sfx } from '../../engine/audio';
import { heavyDrawn } from '../talents';
import { MIRROR_FRAME, frameOf, mirrorsOf } from '../act2/gallery_rules';
import type { MirrorAt } from '../act2/gallery_rules';
import type { Act1Rules } from './types';

declare const __TRY__: string | undefined;
/**
 * THE SWITCH for the heroes as they look now (their pictures, art/act1_figs/reflection.ts from art/reflections_up.ts; their
 * blows, `UP`), off until his yes to them in play. (Here, where the rules read it; art/reflections_up.ts hands it on.) ON ONLY IN
 * A PAGE BUILT TO TRY THEM (tools/reflections_try_page.mjs: `__TRY__` 'reflections'), so that the game and its painter's worker,
 * the same script, have it on from the first: it says which pictures a figure is made of, and the two must agree.
 */
export const REFLECTIONS_UP = { on: typeof __TRY__ === 'string' && __TRY__ === 'reflections' };

/** The hero's class as a reflection's form (its pictures, art/act1_figs/reflection.ts `looks`, and its blows). */
export const FORM_OF: Readonly<Record<ClassId, number>> = { warrior: 0, ranger: 1, mage: 2, warlock: 3, tinkerer: 4, brawler: 5 } as Readonly<Record<ClassId, number>>;
/** (REFLECTIONS_UP) The Warrior's copy holding his war axe, and his maul. */
export const WEAPON_FORM = { axe: 6, hammer: 7 } as const;
/** How many forms there are (FORM_OF's six, and the Warrior's two weapons). */
export const FORMS = 8;
/** The form a reflection of this hero takes: his class's, and with REFLECTIONS_UP the Warrior's by his weapon. */
export function formOf(cls: ClassId, talents: readonly string[] = []): number {
  if (REFLECTIONS_UP.on && cls === 'warrior') {
    const w = heavyDrawn(cls, talents);
    if (w) return WEAPON_FORM[w];
  }
  return FORM_OF[cls] ?? 0;
}

/** How each form fights: a blade, a bow, magic. */
export type Style = 'blade' | 'bow' | 'magic';
export const STYLE_OF: readonly Style[] = ['blade', 'bow', 'magic', 'magic', 'bow', 'blade'];
export const styleOf = (m: Monster): Style => STYLE_OF[m.form ?? 0] ?? 'blade';

/** The reflections' numbers (tiles; seconds). `warn`: held before each blow's own picture plays; `hit`: its blow into its picture (the art's clips' `hit`). */
export const REFLECT = {
  tap: { warn: 0.45, play: 0.97 },
  hold: { warn: 0.7, play: 0.7 },
  /** When each style's blow lands in its picture (seconds into the hero's own clip). */
  hit: { blade: { tap: 0.13, hold: 0.23 }, bow: { tap: 0.17, hold: 0.2 }, magic: { tap: 0.17, hold: 0.27 } },
  blade: { reach: 1.9, half: 1.2, whirl: 2.1 },
  bow: { far: 8, speed: 12, hit: 0.45, volley: 5, spread: 0.5 },
  magic: { far: 7, wave: { speed: 7, long: 0.9, half: 0.7 }, orb: { speed: 5, burst: 1.7, after: 0.35 } },
};
/** How far it comes from a mirror to step out of it, and how long that takes (the art's STEP_OUT: 1.6 s, out of the glass by 0.72 s). */
export const STEP = { near: 9, long: 1.6, through: 0.72, out: 0.85 };

// =============================================================================================
// A BLOW, AS EACH FORM'S TAP AND HOLD IS MADE (the three styles above in these terms; and with REFLECTIONS_UP each form's own)

/**
 * What a blow does as it lands:
 *   fan    a cut before it, `reach` tiles out and `half` radians to either side (a sword's, an axe's cleave, a jab, a kick);
 *   ring   all round a spot, `r` tiles: round itself (`at` 'self'), `ahead` tiles before it (a slam brought down), or where the
 *          hero stood as it began (`at` 'mark': the Golem's pound she whistles for);
 *   shot   `n` things sent at the hero, `spread` radians either side, `speed` tiles a second, as far as `far`, striking within
 *          `hit` of him: an arrow, a volley, a hellfire bolt; an axe that comes back (`back`);
 *   wave   the Mage's wave rolling at him (REFLECT.magic.wave);
 *   lob    a thing lobbed where he stood, bursting there `burst` tiles round, `after` seconds after it lands: an orb, a vial.
 * `dmg`: of its act's own; `sfx`: its sound as it lands (and `boom` as a lob bursts); `look`: how what it sends is drawn
 * (render/act1_fx/reflection.ts); `near`, `far`: the hero's distance it is made at.
 */
export type Blow =
  | { k: 'fan'; reach: number; half: number; sfx: Sfx; near: number; far: number }
  | { k: 'ring'; r: number; at: 'self' | 'ahead' | 'mark'; ahead: number; sfx: Sfx; near: number; far: number }
  | { k: 'shot'; n: number; spread: number; speed: number; far: number; hit: number; back: boolean; look: 'arrow' | 'bolt' | 'axe'; dmg: number; sfx: Sfx; near: number }
  | { k: 'wave'; sfx: Sfx; near: number; far: number }
  | { k: 'lob'; burst: number; speed: number; after: number; look: 'orb' | 'vial'; dmg: number; sfx: Sfx; boom: Sfx; near: number; far: number };

/** A form's tap or hold with the heroes as they look now: its blow, and when it lands in its picture and how long that plays. */
export interface UpBlow {
  blow: Blow;
  /** Seconds into its picture (the art's clip) its blow lands, and how long its picture is (art/reflections_up.ts; tests/reflections_play.test.ts holds them to it). */
  hit: number;
  play: number;
}

const B = REFLECT.blade;
const W = REFLECT.bow;
const M = REFLECT.magic;
/** The three styles as blows (as they were: the stand-ins, and the first reflections' own). */
const OLD: Record<Style, { tap: Blow; hold: Blow }> = {
  blade: {
    tap: { k: 'fan', reach: B.reach, half: B.half, sfx: 'swing', near: 0, far: B.reach + 0.2 },
    hold: { k: 'ring', r: B.whirl, at: 'self', ahead: 0, sfx: 'whirl', near: 0, far: B.whirl },
  },
  bow: {
    tap: { k: 'shot', n: 1, spread: 0, speed: W.speed, far: W.far, hit: W.hit, back: false, look: 'arrow', dmg: 1, sfx: 'shot', near: 0 },
    hold: { k: 'shot', n: W.volley, spread: W.spread, speed: W.speed, far: W.far, hit: W.hit, back: false, look: 'arrow', dmg: 0.8, sfx: 'volley', near: 2 },
  },
  magic: {
    tap: { k: 'wave', sfx: 'wave', near: 0, far: M.far },
    hold: { k: 'lob', burst: M.orb.burst, speed: M.orb.speed, after: M.orb.after, look: 'orb', dmg: 1.5, sfx: 'orb', boom: 'explode', near: 2, far: M.far },
  },
};

/**
 * (REFLECTIONS_UP) EACH FORM'S OWN TWO BLOWS, the hero's own tap and hold (game/defs.ts CLASSES, game/talents.ts WARRIOR_KITS), as
 * this chat reads them for a copy of him; `hit` and `play` the art's (art/reflections_up.ts, the hero's own clip of each):
 *   0 THE WARRIOR, great sword: Strike, a cut before it; the Slam, brought down before it.
 *   1 THE RANGER: the Shot; the Volley (as the first reflections').
 *   2 THE MAGE: the Wave; the Orb (as the first reflections').
 *   3 THE WARLOCK: the Hellfire Bolt, at you; the Curse, chains of smoke round it (his, round him: game/defs.ts curse).
 *   4 THE TINKERER: a vial tossed where you stood; her whistle, and the Golem's pound where you stood (no Golem of glass drawn).
 *   5 THE BRAWLER: the jab, short and quick before it; the roundhouse kick, wide round its front.
 *   6 THE WARRIOR, war axe: Cleave, across before it (the art's arc and reach: AXE_CLEAVE_ARC, AXE_CLEAVE_REACH); the thrown axe,
 *     out at you and back (the art's flight: AXE_FLIGHT, 6 tiles out and back in a second).
 *   7 THE WARRIOR, maul: Smash, brought down just before it; the Earthquake, the floor heaving round it.
 * Their reach and size the first reflections' where the move is theirs, and near them where it is new (medium: two blows). The
 * new ones are made close up too (a vial at your feet, the axe thrown from beside you): a copy standing idle at your side is not
 * fighting you.
 */
export const UP: readonly { tap: UpBlow; hold: UpBlow }[] = [
  {
    tap: { blow: OLD.blade.tap, hit: 0.333, play: 1.2 },
    hold: { blow: { k: 'ring', r: 1.5, at: 'ahead', ahead: 1.3, sfx: 'slam', near: 0, far: 2.4 }, hit: 0.5, play: 1.133 },
  },
  { tap: { blow: OLD.bow.tap, hit: 0.333, play: 0.867 }, hold: { blow: OLD.bow.hold, hit: 0.4, play: 1.067 } },
  { tap: { blow: OLD.magic.tap, hit: 0.167, play: 0.467 }, hold: { blow: OLD.magic.hold, hit: 0.267, play: 0.667 } },
  {
    tap: { blow: { k: 'shot', n: 1, spread: 0, speed: 11, far: 8, hit: 0.5, back: false, look: 'bolt', dmg: 1.1, sfx: 'fire', near: 0 }, hit: 0.533, play: 1.467 },
    hold: { blow: { k: 'ring', r: 2.6, at: 'self', ahead: 0, sfx: 'curse', near: 0, far: 2.6 }, hit: 0.8, play: 2.2 },
  },
  {
    tap: { blow: { k: 'lob', burst: 1.2, speed: 7, after: 0.15, look: 'vial', dmg: 1, sfx: 'vial', boom: 'explode', near: 0, far: 7 }, hit: 0.5, play: 1.2 },
    hold: { blow: { k: 'ring', r: 1.8, at: 'mark', ahead: 0, sfx: 'whistle', near: 0, far: 7 }, hit: 0.667, play: 1.933 },
  },
  {
    tap: { blow: { k: 'fan', reach: 1.5, half: 0.6, sfx: 'punchWhoosh', near: 0, far: 1.6 }, hit: 0.4, play: 0.933 },
    hold: { blow: { k: 'fan', reach: 1.9, half: 1.9, sfx: 'swing', near: 0, far: 2.0 }, hit: 0.533, play: 1.2 },
  },
  {
    tap: { blow: { k: 'fan', reach: 1.7, half: (75 * Math.PI) / 180, sfx: 'swing', near: 0, far: 1.9 }, hit: 0.333, play: 1.2 },
    hold: { blow: { k: 'shot', n: 1, spread: 0, speed: 12, far: 6, hit: 0.55, back: true, look: 'axe', dmg: 1, sfx: 'whirl', near: 0 }, hit: 0.367, play: 1.967 },
  },
  {
    tap: { blow: { k: 'ring', r: 1.1, at: 'ahead', ahead: 1.1, sfx: 'slam', near: 0, far: 1.9 }, hit: 0.433, play: 1.267 },
    hold: { blow: { k: 'ring', r: 2.3, at: 'self', ahead: 0, sfx: 'slam', near: 0, far: 2.3 }, hit: 0.633, play: 1.633 },
  },
];

/** A tap or a hold, by its act's id ('reflection:tap', and with REFLECTIONS_UP each form's own, 'reflection:tap3'). */
export const isTap = (id: string): boolean => id.startsWith('reflection:tap');
export const isHold = (id: string): boolean => id.startsWith('reflection:hold');

/** The blow act `a` makes for this one: its form's own (REFLECTIONS_UP), or its style's. */
export function blowOf(m: Monster, a: { id: string }): Blow {
  const hold = isHold(a.id);
  if (REFLECTIONS_UP.on) {
    const u = UP[m.form ?? 0] ?? UP[0];
    return (hold ? u.hold : u.tap).blow;
  }
  const o = OLD[styleOf(m)];
  return hold ? o.hold : o.tap;
}
/** How long its picture's warning is held, before the blow's own picture plays. */
export const warnOf = (a: { id: string }): number => (isHold(a.id) ? REFLECT.hold.warn : REFLECT.tap.warn);

/** The hero's run: his pace, his stride's round. */
const GAIT: GaitDef = { pace: 4.0, cycle: 0.45, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.6, slack: 0.5, trueBack: true };

const OUT_ACT: ActDef = { id: 'reflection:out', clip: 'stepOut', long: STEP.long, hit: STEP.through, dmg: 0, cooldown: 0, first: 0, after: 0.2, near: 0, far: 99, forced: true };
const ACTS: readonly ActDef[] = [
  { id: 'reflection:tap', clip: 'attack', long: REFLECT.tap.warn + REFLECT.tap.play, hit: REFLECT.tap.warn + 0.15, dmg: 1, cooldown: 0, first: 0.3, after: 0.4, near: 0, far: REFLECT.bow.far },
  { id: 'reflection:hold', clip: 'heavy', long: REFLECT.hold.warn + REFLECT.hold.play, hit: REFLECT.hold.warn + 0.25, dmg: 1.4, cooldown: 6, first: 2.5, after: 0.5, near: 0, far: REFLECT.bow.far },
  OUT_ACT,
];
/**
 * (REFLECTIONS_UP) Each form's own tap and hold, as long as its picture plays after the warning, its blow where its picture's
 * lands; a form makes only its own (`can`). The same blows, waits and harm as the two above.
 */
const ACTS_UP: readonly ActDef[] = [
  ...UP.flatMap((u, f): ActDef[] => [
    { ...ACTS[0], id: `reflection:tap${f}`, long: REFLECT.tap.warn + u.tap.play, hit: REFLECT.tap.warn + u.tap.hit },
    { ...ACTS[1], id: `reflection:hold${f}`, long: REFLECT.hold.warn + u.hold.play, hit: REFLECT.hold.warn + u.hold.hit },
  ]),
  OUT_ACT,
];
/** (REFLECTIONS_UP) The form whose act this is ('reflection:tap3': 3), or -1. */
function actForm(id: string): number {
  const m = /^reflection:(?:tap|hold)(\d+)$/.exec(id);
  return m ? Number(m[1]) : -1;
}

/** When a blow lands in act `a` for this one (seconds into the act). */
export function hitOf(m: Monster, a: { id: string }): number {
  if (REFLECTIONS_UP.on) {
    const u = UP[m.form ?? 0] ?? UP[0];
    return isHold(a.id) ? REFLECT.hold.warn + u.hold.hit : REFLECT.tap.warn + u.tap.hit;
  }
  const s = styleOf(m);
  return isHold(a.id) ? REFLECT.hold.warn + REFLECT.hit[s].hold : REFLECT.tap.warn + REFLECT.hit[s].tap;
}

/** Where a ring blow is round: itself, a spot before it, or where the hero stood as it began. */
export function ringAt(m: Monster, b: Extract<Blow, { k: 'ring' }>): { x: number; y: number } {
  if (b.at === 'ahead') return { x: m.x + m.fx * b.ahead, y: m.y + m.fy * b.ahead };
  if (b.at === 'mark') return { x: m.a1?.tx ?? m.x, y: m.a1?.ty ?? m.y };
  return { x: m.x, y: m.y };
}
/** How far out a shot is `t` seconds after it was sent (one that comes back, back toward where it was sent from after `far`). */
export function shotOut(b: Extract<Blow, { k: 'shot' }>, t: number): number {
  const d = b.speed * t;
  return b.back && d > b.far ? Math.max(0, 2 * b.far - d) : d;
}

/** The mirrors taken already, each by one reflection stepping out of it. */
const taken = new WeakSet<MirrorAt>();

/** Have `m` step out of a glass at (x, y) on a wall facing (fx, fy) (the Queen's Reflections out of her hall's pier glasses). */
export function stepOutAt(m: Monster, x: number, y: number, fx: number, fy: number): void {
  const k = (m.a1 ??= {});
  k.outDone = 1;
  k.out = 1;
  k.ox = x;
  k.oy = y;
  k.ofx = fx;
  k.ofy = fy;
}

/** Is the hero in a cut before it, `reach` tiles out and `half` radians either side? */
function inCut(R: BossRules, m: Monster, reach: number, half: number): boolean {
  const r = R.rel(m);
  const d = Math.hypot(r.fwd, r.left);
  return d <= reach && Math.abs(Math.atan2(r.left, r.fwd)) <= half;
}

/** The kinds of what it sends, as the floor's perils carry them ('reflection:arrow': the arrow's kind, as before). */
const SENT: Record<'arrow' | 'bolt' | 'axe' | 'orb' | 'vial', string> = { arrow: 'reflection:arrow', bolt: 'reflection:bolt', axe: 'reflection:axe', orb: 'reflection:orb', vial: 'reflection:vial' };

export const RULES: Act1Rules | null = {
  gait: GAIT,
  get acts(): readonly ActDef[] {
    return REFLECTIONS_UP.on ? ACTS_UP : ACTS;
  },
  spawned(R, m) {
    m.form = formOf(R.g.hero.cls, R.g.hero.talents ?? []);
  },
  tick(R, m) {
    // (as it wakes: the nearest mirror not taken, its way in)
    const k = (m.a1 ??= {});
    if (k.outDone) return false;
    k.outDone = 1;
    const L = R.g.level;
    if (!L.land?.gallery) return false;
    let best: MirrorAt | null = null;
    let bd = STEP.near;
    for (const q of mirrorsOf(L)) {
      if (taken.has(q) || frameOf(q) === MIRROR_FRAME.burst) continue;
      const d = Math.hypot(q.x - m.x, q.y - m.y);
      if (d < bd) {
        bd = d;
        best = q;
      }
    }
    if (best) {
      taken.add(best);
      stepOutAt(m, best.x, best.y, best.fx, best.fy);
    }
    return false;
  },
  forced(_R, m, acts) {
    return m.a1?.out === 1 ? acts.findIndex((a) => a.id === 'reflection:out') : -1;
  },
  can(_R, m, a, dist) {
    if (a.id === 'reflection:out') return true;
    // (REFLECTIONS_UP: a form makes only its own)
    const f = actForm(a.id);
    if (f >= 0 && f !== (m.form ?? 0)) return false;
    const b = blowOf(m, a);
    return dist >= b.near && dist <= b.far;
  },
  start(R, m, a) {
    const k = (m.a1 ??= {});
    if (a.id === 'reflection:out') {
      // (put before the glass, facing out of it, where the art's step-out ends)
      k.out = 2;
      m.x = (k.ox ?? m.x) + (k.ofx ?? 0) * STEP.out;
      m.y = (k.oy ?? m.y) + (k.ofy ?? 1) * STEP.out;
      m.fx = k.ofx ?? 0;
      m.fy = k.ofy ?? 1;
      return;
    }
    // (where it aims: the hero as the blow is begun)
    k.tx = R.g.hero.x;
    k.ty = R.g.hero.y;
  },
  end(_R, m, a) {
    if (a.id === 'reflection:out' && m.a1) m.a1.out = 0;
  },
  reachable(m) {
    return !(m.act && m.act.id === 'reflection:out' && m.act.t < STEP.through);
  },
  acting(R, m, a, t0, t1) {
    if (a.id === 'reflection:out') return;
    const g = R.g;
    const T = hitOf(m, a);
    if (!(t0 < T && t1 >= T)) return;
    const b = blowOf(m, a);
    const h = g.hero;
    g.sfx(b.sfx, 0.5);
    if (b.k === 'fan') {
      if (inCut(R, m, b.reach, b.half)) R.blow(m, a.dmg);
      return;
    }
    if (b.k === 'ring') {
      const at = ringAt(m, b);
      // (a blow brought down, or the floor heaving: the ring it leaves, as the game's slams leave theirs; a whirl as before, none)
      if (REFLECTIONS_UP.on) g.emit({ t: 'burst', x: at.x, y: at.y, r: b.r, el: 'phys', style: b.at === 'self' && b.sfx === 'curse' ? 'nova' : 'slam' });
      if (Math.hypot(h.x - at.x, h.y - at.y) <= b.r) R.blow(m, a.dmg);
      return;
    }
    const dmg = g.rollMonsterDmg(m);
    if (b.k === 'shot') {
      for (let i = 0; i < b.n; i++) {
        const turn = b.n === 1 ? 0 : -b.spread + (2 * b.spread * i) / (b.n - 1);
        const c = Math.cos(turn);
        const sn = Math.sin(turn);
        const dur = b.back ? (2 * b.far) / b.speed : b.far / b.speed;
        const p = R.peril(m, 'act1', m.x + m.fx * 0.5, m.y + m.fy * 0.5, { a1: SENT[b.look], dur, dmg: dmg * b.dmg });
        p.fx = m.fx * c - m.fy * sn;
        p.fy = m.fy * c + m.fx * sn;
      }
      return;
    }
    if (b.k === 'wave') {
      R.peril(m, 'act1', m.x + m.fx * 0.5, m.y + m.fy * 0.5, { a1: 'reflection:wave', dur: M.wave.long, dmg });
      return;
    }
    const k = m.a1 ?? {};
    const tx = k.tx ?? h.x;
    const ty = k.ty ?? h.y;
    const d = Math.max(0.5, Math.hypot(tx - m.x, ty - m.y));
    const p = R.peril(m, 'act1', m.x, m.y, { a1: SENT[b.look], dur: d / b.speed + b.after + 0.3, dmg: dmg * b.dmg });
    p.a = tx;
    p.b = ty;
    p.c = d / b.speed;
  },
  peril(R, p) {
    if (p.done) return;
    const h = R.g.hero;
    const shot = shotOfPeril(p);
    if (shot) {
      const d = shotOut(shot, p.t);
      const x = p.x + p.fx * d;
      const y = p.y + p.fy * d;
      const L = R.g.level;
      if (L.open[Math.floor(y) * L.floor.w + Math.floor(x)] !== 1) {
        p.done = 1;
        return;
      }
      if (Math.hypot(h.x - x, h.y - y) <= shot.hit) {
        p.done = 1;
        R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, x, y, p.half);
      }
      return;
    }
    if (p.a1 === 'reflection:wave') {
      const Wv = M.wave;
      const along = Wv.speed * p.t;
      const ax = h.x - p.x;
      const ay = h.y - p.y;
      const f = ax * p.fx + ay * p.fy;
      const side = Math.abs(ax * p.fy - ay * p.fx);
      if (Math.abs(f - along) <= 0.5 && side <= Wv.half + along * 0.25) {
        p.done = 1;
        R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x + p.fx * along, p.y + p.fy * along, p.half);
      }
      return;
    }
    const lob = lobOfPeril(p);
    if (lob && p.t >= p.c + lob.after) {
      p.done = 1;
      R.g.sfx(lob.boom, 0.5);
      R.g.emit({ t: 'burst', x: p.a, y: p.b, r: lob.burst, el: 'phys', style: 'blast' });
      if (Math.hypot(h.x - p.a, h.y - p.b) <= lob.burst) R.g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.a, p.b, p.half);
    }
  },
};

/** The shot a peril of a reflection's is, by its kind (the arrow's numbers as the first reflections'; with REFLECTIONS_UP the bolt's and the axe's). */
export function shotOfPeril(p: Pick<Peril, 'a1'>): Extract<Blow, { k: 'shot' }> | null {
  if (p.a1 === 'reflection:arrow') return OLD.bow.tap as Extract<Blow, { k: 'shot' }>;
  if (p.a1 === 'reflection:bolt') return UP[3].tap.blow as Extract<Blow, { k: 'shot' }>;
  if (p.a1 === 'reflection:axe') return UP[WEAPON_FORM.axe].hold.blow as Extract<Blow, { k: 'shot' }>;
  return null;
}
/** The lob a peril of a reflection's is, by its kind: the orb, or the Tinkerer's vial. */
export function lobOfPeril(p: Pick<Peril, 'a1'>): Extract<Blow, { k: 'lob' }> | null {
  if (p.a1 === 'reflection:orb') return OLD.magic.hold as Extract<Blow, { k: 'lob' }>;
  if (p.a1 === 'reflection:vial') return UP[4].tap.blow as Extract<Blow, { k: 'lob' }>;
  return null;
}
