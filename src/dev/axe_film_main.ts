// THE WARRIOR'S BATTLE AXE, FILMED IN THE GAME (the art chat's helper, 9 Nov 2026; docs/mockups/warrior_weapons/README.md, step 2).
// A PAGE FOR THE FILM ONLY: the game itself (main.ts), and beside it the Warrior's moves with the axe (art/warrior_up_axe_moves.ts, a
// mock-up behind a switch that is off), shown IN PLACE OF HIS PICTURE as the game's own renderer draws its hero: its own depth,
// its light, its scarf, its effects. Nothing of the game imports this file, and the game's own pages do not hold it
// (tests/warrior_weapons.test.ts). The film's scenario (tools/scenarios/axe_film.mjs) says, frame by frame, which picture he is
// and where the thrown axes are (window.__axe); the game does the rest.
//   node tools/axe_film_page.mjs            (builds dist/axe_film.html)
import '../main';
import type { Sprite } from '../engine/px';
import { Figure } from '../render/figure';
import { Renderer } from '../render/render';
import { wx, wy } from '../render/fx';
import type { Cam } from '../render/fx';
import { AXE_FRAME, AXE_MOVES, AXE_RUN_MOVES, axeFlying, axeSprite, wuFacing, wuTailsFacing } from '../art/warrior_up_axe_moves';
import type { WuSide } from '../art/warrior_up_axe_moves';
import { HAMMER_MOVES } from '../art/warrior_up_hammer_moves';

/** (his moves with the war axe and, since step 3, with the maul: one page films both) */
const MOVES = { ...AXE_MOVES, ...AXE_RUN_MOVES, ...HAMMER_MOVES };

/** What the film shows now: a move of his and its frame, how high the game has lifted him (game pixels), and the axes in the air. */
interface FilmState {
  on: boolean;
  move: string;
  frame: number;
  lift: number;
  /** The thrown axes: where each is on the floor (the game's tiles) and how far round it has turned (pictures of its turn). */
  axes: { x: number; y: number; turn: number }[];
  /** The side he was last drawn from (for the film's notes). */
  side: string;
  painted: number;
}

if (typeof window !== 'undefined' && !(globalThis as { __PAINT_WORKER__?: boolean }).__PAINT_WORKER__) {
  const film: FilmState = { on: false, move: 'stand', frame: 0, lift: 0, axes: [], side: '', painted: 0 };
  const kept = new Map<string, Sprite>();
  const pictureOf = (move: string, frame: number, side: WuSide): Sprite => {
    const k = `${move}:${frame}:${side}`;
    let s = kept.get(k);
    if (!s) {
      kept.set(k, (s = axeSprite(MOVES[move], frame * AXE_FRAME, side)));
      film.painted++;
    }
    return s;
  };
  let flying: Sprite[] | null = null;
  let renderer: { cam: Cam; stand(d: number, s: Sprite, x: number, y: number): void } | null = null;
  // (the renderer, caught as it draws its hero: its own `stand` lays the thrown axes among everything else that stands)
  const proto = Renderer.prototype as unknown as { heroArt(game: unknown): unknown };
  const heroArt = proto.heroArt;
  proto.heroArt = function (this: unknown, game: unknown): unknown {
    renderer = this as typeof renderer;
    return heroArt.call(this, game);
  };
  const figure = Figure.prototype as unknown as { frame(...a: unknown[]): Sprite; tails: { step(dt: number, roots: unknown, ax: number, ay: number, facing: number, ox: number, oy: number): void }; began: number; squash: number; last: Sprite | null };
  const frame = figure.frame;
  figure.frame = function (this: typeof figure, ...a: unknown[]): Sprite {
    if (!film.on) return frame.apply(this, a);
    const st = a[1] as { fx: number; fy: number };
    const dt = a[2] as number;
    const side = wuFacing(st.fx, st.fy);
    film.side = side;
    let s = pictureOf(film.move, film.frame, side);
    // (lifted through the air as the game lifts a leaping hero: his picture higher over the same spot)
    if (film.lift) s = { ...s, ay: s.ay + film.lift };
    this.began = 0;
    this.squash = 1;
    this.tails.step(dt, s.tails, s.ax, s.ay, wuTailsFacing(side), a[3] as number, a[4] as number);
    this.last = s;
    if (renderer && film.axes.length) {
      flying = flying ?? axeFlying();
      for (const ax of film.axes) {
        const n = flying.length;
        renderer.stand(ax.x + ax.y, flying[((Math.round(ax.turn) % n) + n) % n], wx(renderer.cam, ax.x, ax.y), wy(renderer.cam, ax.x, ax.y));
      }
    }
    return s;
  };
  (window as unknown as { __axe: FilmState }).__axe = film;
}
