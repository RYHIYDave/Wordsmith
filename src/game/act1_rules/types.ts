// ACT 1, THE DESCENT: WHAT A KIND OF ITS OWN DOES (its monsters and bosses), each kind in a file of its own
// in this folder, put together by index.ts. Each is run as the bosses of floors 2 to 5 are run (game/bosses.ts,
// BossRules: a gait it goes over the floor by, and acts, each one of its pictures' moves played from start to
// end by the rules' clock), so that every blow lands where and when its picture's does.
//
// A KIND'S RULES (`Act1Rules`): its gait (the pace its walk is painted for, its loop, setting off and stopping,
// how near it comes); its acts (which clip of its pictures each is, how long, when its blow lands, how hard,
// its cooldown, from how near to how far it is used); and what each act does as its clock runs (`acting`).
// Its acts' ids are its own, by its name: 'qgolem:smash'. What it leaves on the floor or sends across it is a
// peril of kind 'act1' named by it (Peril.a1: 'qgolem:chunk'), stepped by its `peril` and drawn by its own
// pictures (render/act1_fx/). What it keeps on a monster is Monster.a1, by name.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import type { Level, Monster, Peril } from '../state';

export interface Act1Rules {
  /** How it goes over the floor (its pictures' own numbers: setting off and stopping 0 for a walk that loops from its stand). */
  gait: GaitDef;
  /** Its acts, its basic blow first and its biggest last (the biggest ready that the hero is in reach of is made). */
  acts: readonly ActDef[];
  /** From `t0` to `t1` of act `a`: what it does (BossRules.acting). */
  acting(R: BossRules, m: Monster, a: ActDef, t0: number, t1: number, dt: number): void;
  /** As an act begins (turned to the hero already): what it needs to keep for it (m.act.a, b, x, y). */
  start?(R: BossRules, m: Monster, a: ActDef): void;
  /** As an act ends. */
  end?(R: BossRules, m: Monster, a: ActDef): void;
  /** Whether it may make act `a` now (besides its cooldown and the hero's distance): false, not now. */
  can?(R: BossRules, m: Monster, a: ActDef, dist: number, los: boolean): boolean;
  /** An act the rules bring whatever else it would do (a phase's change): its index in `acts`, or -1. */
  forced?(R: BossRules, m: Monster, acts: readonly ActDef[]): number;
  /** A step of it every frame it is awake, whatever it is doing (before its gait and acts): true if this step is all it does (it is up in the air, latched on, under the water). */
  tick?(R: BossRules, m: Monster, dt: number, dist: number): boolean;
  /** As it comes into the world (spawned): rising out of the water, out of a rock pile. */
  spawned?(R: BossRules, m: Monster): void;
  /** As it dies. */
  died?(R: BossRules, m: Monster): void;
  /** A step of one of its perils (Peril.a1 names it); the peril is gone at its `dur`. */
  peril?(R: BossRules, p: Peril, dt: number): void;
  /** A boss: where he stands as the floor is made (tiles), and the way he faces; null: where the floor has him. */
  bossAt?(L: Level): { x: number; y: number; fx: number; fy: number } | null;
  /** Whether the hero's blows reach it now (false: up in the air, under the water). */
  reachable?(m: Monster): boolean;
  /** Whether it cannot be hurt now, and says so ("Invulnerable": a boss as he changes into his next phase): game.ts damageMonster. */
  invulnerable?(m: Monster): boolean;
  /** Its life gone, whether it does not die yet (a boss with another life bar to come, or one who must be where his death was drawn): game.ts damageMonster keeps it at 1. */
  held?(R: BossRules, m: Monster): boolean;
  /** How much less harm (0 to 1) monster `m` takes for this one of its kind, `by`, standing by it (a chanter's ward over the cult near it): game.ts damageMonster, by `act1Ward`. */
  ward?(R: BossRules, by: Monster, m: Monster): number;
}
