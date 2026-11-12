// ACT 1, THE DESCENT: WHAT A KIND OF ITS OWN DOES TO THE FLOOR AND SENDS ACROSS IT, DRAWN, where its rules
// (game/act1_rules/) have it: the warning laid on the floor before a blow, what flies, what bursts up; and its
// figure where it is not as its gait and acts give it (up in the air, latched on, under the water). Each kind in
// a file of its own here; render/bossfx.ts and render/render.ts call them, in the same layers as the bosses':
//   ground()    on the floor, under everything that stands
//   standing()  what stands among the figures, each at its depth (`c.stand`)
//   air()       over what stands
// For each of its kind awake and making an act (m, p null), and for each of its perils (p, m null). A light
// in the dark is given with `c.spot` (screen pixels), as it is drawn.

import type { ActorArt, AnimSet } from '../../art/actor_types';
import type { Bestiary } from '../../art/bestiary';
import type { FloorAt } from '../../art/mob_shots';
import type { Sprite } from '../../engine/px';
import type { Game } from '../../game/game';
import type { Monster, Peril } from '../../game/state';

export interface Act1FxCtx {
  /** The canvas (ground and air: null while standing, whose pictures go through `stand`). */
  g: CanvasRenderingContext2D | null;
  /** Where a point of the floor (tiles) is on the screen. */
  at: FloorAt;
  game: Game;
  /** The screen's clock (seconds). */
  t: number;
  bestiary: Bestiary;
  /** A picture to stand among the figures: its depth (x + y, tiles), its sprite, where its floor point is on the screen. */
  stand: (depth: number, s: Sprite, sx: number, sy: number, alpha?: number) => void;
  /** A light in the dark, on the screen: where, how wide, how strong. */
  spot: (x: number, y: number, r: number, a: number) => void;
  /** A film the painter has made for this floor (art/films.ts: its key; one of the kind's `films`), or null: not yet, or never (then the kind paints its own). */
  film?<T>(key: string): T | null;
  /**
   * Whether a figure's frames are the painter's to paint (render/painter.ts paints, or the floor's bake still coming): a frame of
   * it not painted yet may be left to it, read through render/left_to_painter.ts leftToPainter, and never painted here as it is shown.
   */
  paints?(figure: string): boolean;
}

export interface Act1Fx {
  /** The films its floor has the painter make ahead (art/films.ts keys), where it is on the floor: what it throws and leaves, so that none of it is painted in its fight. */
  films?: readonly string[];
  ground?(c: Act1FxCtx, m: Monster | null, p: Peril | null): void;
  standing?(c: Act1FxCtx, m: Monster | null, p: Peril | null): void;
  air?(c: Act1FxCtx, m: Monster | null, p: Peril | null): void;
  /** Over everything, AFTER THE DARK is laid (what shines in it, as the lights of what glows: the Physician's spotlight, his beam, his instruments). */
  glow?(c: Act1FxCtx, m: Monster | null, p: Peril | null): void;
  /** Its picture this frame in place of the one its gait and acts give (`set`: its pictures seen the way it faces); null: as they give. Turned over as every monster's is, after. */
  sprite?(m: Monster, art: ActorArt, set: AnimSet): Sprite | null;
  /** How strongly it flashes white as a blow lands (0 to 1; 1 if not said): a body that fills the screen, fainter. */
  flash?: number;
  /** How far up off the floor it is drawn (game pixels): up in the air. */
  lift?(m: Monster): number;
  /** Drawn later than its depth would have it (over the hero it has latched on to): how much is added to its depth. */
  over?(m: Monster): number;
  /** Out of sight where it lies (under the water, not yet risen): nothing of it is drawn, its shadow, its ring, its bar and its name too (render.ts). */
  hidden?(m: Monster): boolean;
  /**
   * NOTHING OF ITS FIGURE'S OWN PICTURES IS EVER DRAWN (the Swamp Colossus: he and his arms are monsters of the Drowned Eye's
   * kind, always `hidden`, drawn from his own baked pictures): they are not painted ahead for the floor, by the painter or by
   * the game (render/render.ts). Found 11 Nov 2026 as the floors' monsters were baked: on floor 10 the painter's worker was
   * painting the Drowned Eye's 1,352 places, a fifth to two thirds of a second each and 330 MB held whole, for nothing.
   */
  noFigure?: boolean;
}
