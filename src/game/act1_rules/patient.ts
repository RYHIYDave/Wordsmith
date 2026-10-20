// ACT 2, THE HUSH: FLOOR 14, THE HOUSE OF QUIET: THE HUSHED PATIENTS: their rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2: The Hush", the planning chat's, with his yes as ideas), level 14: "Enemies: Hushed patients
// who sit up in their beds as you pass, and the Physician's orderlies"; the Physician's Rounds, "where the patients rise
// from their beds". Small: one attack, by his rule (his rulebook, "Their attacks"). Their pictures are the art chat's
// (art/patients.ts, patients_moves.ts, patient_shots.ts; docs/mockups/act2_housequiet/README.md), made on his word to it of
// 18 Oct, 21:24 Pacific ("Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs.
// At least for 11-15"), read by the planning chat as his yes to go in, anything he flags mended:
//   IN BED (clips.moves.abed): on their backs on an iron ward bed, asleep, mouthing;
//   THEY RISE (clips.moves.rise, PT_RISE): the eyes snap open pink, they sit bolt upright, turn their heads to you, swing
//     their legs over the side and stand;
//   THE SHUFFLE (PT_PACE), and THE SILENT SCREAM, their blow (PT_SCREAM): both hands at the throat burning pink (the
//     warning), then the head thrown forward and the Hush blasting out of the mouth in a fan across the floor
//     (art/patient_shots.ts drawScreamBurst, SCREAM_REACH, SCREAM_HALF, SCREAM_FOR). A scream with no sound.
//
// WHAT IS THE RULES' (the art chat's "What is yours"), the planning chat's helper's picks, to be told him:
// - THEIR BEDS. The floor's map-maker lays the wards' iron beds (the piece 'an iron ward bed', its head against a far wall
//   along x or along y) and its packs. As one of a pack of patients comes into the world it looks for a bed within
//   `bed.near` tiles of where it was laid that no other patient lies in, with room beside it: there it lies, on its back,
//   where the art lays a patient in bed (PT_BED: the bed's middle 20 of its lengths behind its floor point, the bed's
//   length along its left and right), facing the way the art has it rise (facing you: down the screen to the right over a
//   bed whose head is toward -y, the bed's fourth frame; turned over, down to the left, over one whose head is toward -x,
//   its second), and the bed is shown in its risen-from frame (the art: "a patient in bed or rising is drawn over a ward
//   bed in its risen-from frame"). One that finds no bed stands where it was laid, asleep on its feet, and wakes as any
//   monster does (no bed to rise from: there is no picture of one lying on the floor).
// - THEY SIT UP AS YOU PASS: woken (the hero seen within the game's waking reach, as any pack), each still lies until the
//   hero comes within `rise.pass` tiles of it in its sight, or it is struck, or the Physician's Rounds call it; then, a
//   moment of its own later (up to `rise.most`), it rises (a forced act, its picture whole: `patient:rise`), and comes.
// - STRUCK IN BED, IT RISES FIRST: at once, and it cannot be brought down until it has stood (its life is kept at 1 while it
//   lies and rises: `lifeFloor`), so that it never dies lying in its bed (its death is drawn from standing).
// - THE SCREAM: a blow (his doc keeps the Hush status for the bosses and the Knell), landing on the hero as its burst's
//   front rolls over him (`screamFront`, as the art draws it: from the mouth, `scream.from` tiles before them at the
//   scream, out to SCREAM_REACH in SCREAM_FOR, SCREAM_HALF to either side), once. No sound with it: the House of Quiet.
//
// The rules know nothing of the pictures: each number here that is a picture's is written down, and
// tests/act2_patient.test.ts holds it to the art.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { TUNE } from '../defs';
import { beside, fromFigure, handOf } from '../facing';
import type { Monster, PropInst } from '../state';
import type { Act1Rules } from './types';

/** The figure's lengths in a tile (art/new_mobs3.ts TILE3: the heroes' bones they are painted on). */
const T3 = 32 / Math.sqrt(2 / 3);

/** THE HUSHED PATIENTS' NUMBERS (tiles, seconds of their pictures). */
export const PATIENT = {
  /**
   * THE SILENT SCREAM (PT_SCREAM): it bursts out of them at `hit` (frame 21 of 30); the burst leaves the mouth `from`
   * tiles before them (where the art's mouth is at the scream: art/patients_moves.ts mouthOf); its front rolls out from
   * `r0` to `reach` (SCREAM_REACH) in `long` (SCREAM_FOR), `half` radians to either side of the way they face
   * (SCREAM_HALF, 34 degrees).
   */
  scream: { hit: 21 / 30, from: 0.4927, r0: 0.15, reach: 1.8, half: (34 * Math.PI) / 180, long: 0.6 },
  /** THEIR BEDS: the piece; a bed's middle `back` tiles behind them as they lie in it (PT_BED.x, 20 of their lengths); a bed is theirs within `near` tiles of where they were laid. */
  bed: { piece: 'an iron ward bed', back: 20 / T3, near: 2.5 },
  /**
   * THEY RISE (PT_RISE): how long; their bare feet on the floor at `feet`; stood at `up`. They rise as the hero comes
   * within `pass` tiles of them in their sight, each up to `most` seconds after (a moment of its own). As they lean, push
   * off the bed and stand (`feet` to `up`) they are carried `step` tiles on, clear of the bed's iron (the bed is solid,
   * and the art stands them as close by it as it lays them: a body astride it could take no step).
   */
  rise: { long: 2.3, feet: 1.32, up: 1.96, pass: 3.5, most: 0.6, step: 0.36 },
};

/** Their shuffle, painted for 0.8 tiles a second (PT_PACE; ten frames at eight a second); they stop at any frame of it, as their pictures hand over from any. */
export const PATIENT_GAIT: GaitDef = { pace: 0.8, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.1, slack: 0.3, trueBack: true };

/** Their one blow, and their rising (brought by the rules, not chosen). */
export const PATIENT_ACTS: readonly ActDef[] = [
  { id: 'patient:scream', clip: 'attack', long: 1.5, hit: PATIENT.scream.hit, dmg: 1, cooldown: 0, first: 0, after: 0.6, near: 0, far: 1.6 },
  { id: 'patient:rise', clip: 'rise', long: PATIENT.rise.long, hit: PATIENT.rise.up, dmg: 0, cooldown: 0, first: 0, after: 0.2, near: 0, far: 0, forced: true },
];

/** How far the scream's front has rolled out (tiles from where it leaves the mouth), `u` seconds after the scream; null once it is gone (art/patient_shots.ts drawScreamBurst: `0.15 + (SCREAM_REACH - 0.15) * smooth(q * 1.25)`, q = u / SCREAM_FOR). */
export function screamFront(u: number): number | null {
  const S = PATIENT.scream;
  if (u < 0 || u >= S.long) return null;
  const c = Math.max(0, Math.min(1, (u / S.long) * 1.25));
  return S.r0 + (S.reach - S.r0) * c * c * (3 - 2 * c);
}

/** Where the scream's burst leaves the mouth, from one that screams. */
export function screamFrom(m: { x: number; y: number; fx: number; fy: number }): { x: number; y: number } {
  return beside(m.x, m.y, m.fx, m.fy, 1, PATIENT.scream.from, 0);
}

/** Is it in its bed (lying, 1; rising, 2)? */
export function inBed(m: Monster): number {
  return m.a1?.bed ?? 0;
}

/** A ward bed's key (Monster.a1.bt): its tile, counted from 1. */
const keyOf = (p: PropInst, w: number): number => p.ty * w + p.tx + 1;

/** The way one lying in this bed faces (the art's: over a bed whose head is toward -y, along +x; over one whose head is toward -x, along +y), and where it lies. */
export function bedPlace(p: PropInst): { x: number; y: number; fx: number; fy: number } {
  // (its frames: made and risen from with its head toward -x, then the same with its head toward -y: art/floor14.ts)
  const headY = p.variant % 4 >= 2;
  const fx = headY ? 1 : 0;
  const fy = headY ? 0 : 1;
  return { x: p.x + fx * PATIENT.bed.back, y: p.y + fy * PATIENT.bed.back, fx, fy };
}

/** The ward beds round (x, y), within `r` tiles, that no living patient lies in, with room beside them to lie: the nearest first. */
export function freeBeds(R: BossRules, x: number, y: number, r: number, self: Monster | null = null): PropInst[] {
  const g = R.g;
  const L = g.level;
  const w = L.floor.w;
  const taken = new Set<number>();
  for (const o of g.monsters) if (o !== self && !o.dead && o.kind === 'patient' && o.a1?.bt) taken.add(o.a1.bt);
  return L.props
    .filter((p) => p.kind === 'piece' && p.name === PATIENT.bed.piece && !taken.has(keyOf(p, w)))
    .filter((p) => {
      const s = bedPlace(p);
      // (its floor point on the floor beside the bed, and room to stand up and go, a step on)
      const up = { x: s.x + s.fx * PATIENT.rise.step, y: s.y + s.fy * PATIENT.rise.step };
      if (Math.hypot(s.x - x, s.y - y) > r || !g.free(L.walk, s.x, s.y, 0) || !g.free(L.walk, up.x, up.y, self ? Math.min(self.r, 0.42) : 0.3)) return false;
      // (no one else standing there, the hero neither)
      if (Math.hypot(g.hero.x - s.x, g.hero.y - s.y) < 0.8) return false;
      return !g.monsters.some((o) => o !== self && !o.dead && Math.hypot(o.x - s.x, o.y - s.y) < 0.6);
    })
    .sort((a, b) => Math.hypot(bedPlace(a).x - x, bedPlace(a).y - y) - Math.hypot(bedPlace(b).x - x, bedPlace(b).y - y));
}

/** It lies down in this bed: there, facing as the art has it rise, the bed shown in its risen-from frame. */
export function lieIn(R: BossRules, m: Monster, p: PropInst): void {
  const s = bedPlace(p);
  m.x = s.x;
  m.y = s.y;
  m.fx = s.fx;
  m.fy = s.fy;
  m.a1 = { ...(m.a1 ?? {}), bed: 1, bt: keyOf(p, R.g.level.floor.w), bfx: s.fx, bfy: s.fy, lx: s.x, ly: s.y, go: 0, wait: 0 };
  // (made, its frame 0 or 2: risen from, 1 or 3)
  if (p.variant % 2 === 0) p.variant += 1;
}

/** Bring it up out of its bed now, or `wait` seconds from now (the Physician's Rounds, a blow, the hero passing). */
export function callUp(m: Monster, wait: number): void {
  const s = m.a1;
  if (!s || s.bed !== 1 || s.go) return;
  s.go = 1;
  s.wait = wait;
}

export const RULES: Act1Rules | null = {
  gait: PATIENT_GAIT,
  acts: PATIENT_ACTS,

  spawned(R, m) {
    m.a1 = { bed: 0 };
    // (ACT 2, THE BELLS: one the Hush raises comes up awake and at him: none lies down, Game.risingInHush)
    if (R.g.risingInHush) return;
    // (a bed near where it was laid, if there is one free: it lies in it)
    const bed = freeBeds(R, m.x, m.y, PATIENT.bed.near, m)[0];
    if (bed) lieIn(R, m, bed);
  },

  tick(R, m, dt, dist) {
    const s = m.a1;
    if (s && s.bed === 2 && (!m.act || m.act.id !== 'patient:rise')) {
      // (its rising broken off, by a blow that stuns or staggers it: it is up at once, where its rising would have left it, clear of the bed)
      m.x = s.lx + s.bfx * PATIENT.rise.step;
      m.y = s.ly + s.bfy * PATIENT.rise.step;
      s.bed = 0;
    }
    if (!s || s.bed !== 1) return false;
    const g = R.g;
    const h = g.hero;
    // (in its bed it lies as the bed has it, whatever else)
    m.fx = s.bfx;
    m.fy = s.bfy;
    m.anim = 'idle';
    if (!s.go) {
      // (struck: at once; the hero passing near, in its sight: at a moment of its own; its own moment, not the game's dice)
      if (m.struckT !== undefined && m.struckT < 0.5) callUp(m, 0);
      else if (dist <= PATIENT.rise.pass && g.sees(m.x, m.y, h.x, h.y)) callUp(m, m.seed * PATIENT.rise.most);
      else return true;
    }
    s.wait -= dt;
    // (its moment come: its rise, brought by the rules)
    return s.wait > 0;
  },

  forced(_R, m, acts) {
    const s = m.a1;
    return s && s.bed === 1 && s.go && s.wait <= 0 ? acts.findIndex((a) => a.id === 'patient:rise') : -1;
  },

  start(_R, m, a) {
    const s = m.a1;
    if (a.id !== 'patient:rise' || !s || !m.act) return;
    // (it rises facing as it lay, the way its picture of rising is drawn: it turns its head to you in it)
    m.fx = s.bfx;
    m.fy = s.bfy;
    m.act.hand = handOf(PATIENT_GAIT.trueBack, m.fx, m.fy);
    s.bed = 2;
  },

  end(_R, m, a) {
    if (a.id === 'patient:rise' && m.a1) m.a1.bed = 0;
  },

  lifeFloor(_R, m) {
    // (struck in bed it rises first: it is not brought down until it has stood)
    const s = m.a1;
    if (!s || !s.bed) return 0;
    return s.bed === 1 || (m.act?.id === 'patient:rise' && m.act.t < PATIENT.rise.up) ? 1 : 0;
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    if (a.id === 'patient:rise') {
      // (leaning out, pushing off the bed and up: carried on clear of its iron as they stand)
      const P = PATIENT.rise;
      const k = (t: number): number => Math.max(0, Math.min(1, (t - P.feet) / (P.up - P.feet)));
      const by = (k(t1) - k(t0)) * P.step;
      m.x += m.fx * by;
      m.y += m.fy * by;
      return;
    }
    if (a.id !== 'patient:scream') return;
    // THE SILENT SCREAM: its front rolls out across the floor before them; whoever it passes is struck, once (one who is
    // rolling out of it, or out of harm's way, as it passes is not: it has passed him)
    const S = PATIENT.scream;
    const end = S.hit + S.long;
    if (act.b || t1 < S.hit || t0 >= end) return;
    const f1 = screamFront(Math.min(S.long - 1e-6, t1 - S.hit));
    const f0 = t0 < S.hit ? -Infinity : screamFront(t0 - S.hit) ?? S.reach;
    if (f1 === null) return;
    const o = screamFrom(m);
    const r = fromFigure(o.x, o.y, m.fx, m.fy, 1, h.x, h.y);
    const d = Math.hypot(r.fwd, r.left);
    const R0 = TUNE.heroRadius;
    // (within the fan, the hero's own size given; or right at the mouth)
    const inFan = d <= R0 || Math.abs(Math.atan2(r.left, r.fwd)) <= S.half + Math.atan2(R0, Math.max(d, 1e-6));
    const near = d - R0;
    if (!inFan || near > f1 || near <= f0) return;
    act.b = 1;
    if (h.invuln > 0 || h.move || g.over) return;
    R.blow(m, a.dmg);
  },
};
