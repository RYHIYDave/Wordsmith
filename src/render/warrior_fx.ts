// THE WARRIOR'S WEAPONS' EFFECTS (game/talents.ts WARRIOR_TREE2; docs/warrior_tree_build.md), the art chat's pictures, his yes of
// 11 Nov 2026 by 10:51, “Yes, hand both to main (Recommended)”:
// - THE GLINT (art/warrior_up_axe_moves.ts axeGlint): his thrown axe come back to hands that hold one is gone into it, a cyan glint
//   at his hands, a fifth of a second, drawn over him on his own spot (the game's 'axeGlint').
// - THE QUAKING GROUND (art/warrior_up_quake_ground.ts quakeGround): the Earthquake's ground heaving in the floor's own stone, in
//   place of the slam ring; Tremors' second and third each its own (the game's 'quake'). What is under everyone (`under`, and the
//   cracks for the way he struck, kept 2.4 s and faded over the last four tenths) on the ground; what stands up (`over`) in the air.
//   Painted, not baked: for the floor's stone, the first time a quake is wanted on that floor.
import type { Sprite } from '../engine/px';
import { drawSprite } from '../engine/px';
import type { GameEvent } from '../game/state';
import type { Theme } from '../art/ground';
import { VAULT } from '../art/ground';
import { WU_SIDES } from '../art/warrior_up';
import type { WuSide } from '../art/warrior_up';
import { AXE_GLINT_FRAMES, axeGlint, wuFacing } from '../art/warrior_up_axe_moves';
import { QUAKE_CRACKS_LAST, QUAKE_FRAMES, quakeGround } from '../art/warrior_up_quake_ground';
import type { QuakeGround } from '../art/warrior_up_quake_ground';
import type { Cam } from './fx';
import { wx, wy } from './fx';

/** The glint's length (its pictures at 30 a second). */
const GLINT_SECS = AXE_GLINT_FRAMES / 30;
/** A quake's heave, under and over (its pictures at 30 a second). */
const HEAVE_SECS = QUAKE_FRAMES / 30;

export class WarriorFx {
  /** The stone of the floor shown now (the renderer's ground: art/ground.ts GroundArt.theme); the vault's where it is not known. */
  theme: () => Theme | undefined = () => undefined;
  private glints: { x: number; y: number; t: number }[] = [];
  private quakes: { x: number; y: number; q: number; side: WuSide; t: number; g: QuakeGround }[] = [];
  private glintArt: Sprite[] | null = null;
  /** Each stone's quakes, made the first time one is wanted on it (the last few kept). */
  private grounds = new Map<Theme, QuakeGround[]>();

  handle(e: GameEvent): void {
    if (e.t === 'axeGlint') this.glints.push({ x: e.x, y: e.y, t: 0 });
    else if (e.t === 'quake') {
      const side = WU_SIDES.includes(wuFacing(e.fx, e.fy)) ? wuFacing(e.fx, e.fy) : 'front';
      this.quakes.push({ x: e.x, y: e.y, q: e.q, side, t: 0, g: this.ground(e.q) });
    }
  }

  /** A slam ring at (x, y) that is a quake of his just begun: its ground is drawn here in its place. */
  claims(x: number, y: number): boolean {
    return this.quakes.some((p) => p.t === 0 && Math.abs(p.x - x) < 1e-6 && Math.abs(p.y - y) < 1e-6);
  }

  private ground(q: number): QuakeGround {
    const theme = this.theme() ?? VAULT;
    let list = this.grounds.get(theme);
    if (!list) {
      if (this.grounds.size >= 3) this.grounds.delete(this.grounds.keys().next().value as Theme);
      list = [];
      this.grounds.set(theme, list);
    }
    return (list[q] ??= quakeGround(q, theme));
  }

  update(dt: number): void {
    for (const p of this.glints) p.t += dt;
    for (const p of this.quakes) p.t += dt;
    this.glints = this.glints.filter((p) => p.t < GLINT_SECS);
    this.quakes = this.quakes.filter((p) => p.t < QUAKE_CRACKS_LAST.seconds);
  }

  clear(): void {
    this.glints = [];
    this.quakes = [];
  }

  /** Under everyone: the heave's floor and its cracks. */
  drawGround(g: CanvasRenderingContext2D, c: Cam): void {
    for (const p of this.quakes) {
      const x = Math.round(wx(c, p.x, p.y));
      const y = Math.round(wy(c, p.x, p.y));
      const L = QUAKE_CRACKS_LAST;
      const cracks = p.g.cracks[p.side];
      const grown = Math.min(cracks.length - 1, Math.floor((p.t / 0.15) * cracks.length));
      g.globalAlpha = Math.max(0, Math.min(1, (L.seconds - p.t) / L.fade));
      drawSprite(g, cracks[grown], x, y);
      g.globalAlpha = 1;
      if (p.t < HEAVE_SECS) drawSprite(g, p.g.under[Math.min(p.g.under.length - 1, Math.floor(p.t * 30))], x, y);
    }
  }

  /** Over the floor: what the heave throws up, and the glint over him. */
  drawAir(g: CanvasRenderingContext2D, c: Cam): void {
    for (const p of this.quakes) {
      if (p.t >= HEAVE_SECS) continue;
      drawSprite(g, p.g.over[Math.min(p.g.over.length - 1, Math.floor(p.t * 30))], Math.round(wx(c, p.x, p.y)), Math.round(wy(c, p.x, p.y)));
    }
    if (this.glints.length) {
      const art = (this.glintArt ??= axeGlint());
      for (const p of this.glints) drawSprite(g, art[Math.min(art.length - 1, Math.floor((p.t / GLINT_SECS) * art.length))], Math.round(wx(c, p.x, p.y)), Math.round(wy(c, p.x, p.y)));
    }
  }
}
