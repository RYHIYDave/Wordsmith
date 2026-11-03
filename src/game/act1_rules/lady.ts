// ACT 2, PART TWO, THE HIGH CITY: FLOOR 18: THE LADIES-IN-WAITING: their rules (game/act1_rules/types.ts). The art chat's (art/
// gallery_ladies_moves.ts; mockup/gallery-ladies, handed over 31 Oct 18:00 with his yes, docs/mockups/gallery_ladies/README.md,
// "Their rhythm"); brought in by the main chat at his word of 2 Nov 2026, “All of it in this one”.
//
// WHAT THEY DO (the art's numbers; how far they keep off, the README's starting numbers, the game's):
// - THEY KEEP THEIR DISTANCE, gliding, never a step shown: far off, they glide in at LD_PACE (3.2 tiles a second, their walk);
//   between LADY_TUNE.keep[0] and [1] tiles of him they CIRCLE round him, facing him (2.8 tiles a second), and when he comes within
//   LADY_TUNE.back they GLIDE BACK away from him, still facing him (2.4: a knight walking at one closes slowly; one who runs or
//   dashes catches her). The glide by the way she goes as her picture is turned (turned over, the same pictures go the mirror way).
// - THE FLASH FROM RANGE (her attack, LD_FLASH, 1.6 s): her mirror swept up and held, its glint building (the warning, half a second
//   and more, the spot of light skittering on the floor where it will fall), then a cone of cold light from it to the floor: a wedge
//   from FLASH_FX.near to FLASH_FX.reach (6.5 tiles) before her, wedgeHalf wide (three tiles at its end), striking whoever is in it
//   at LD_FLASH.hit (his “bigger AOE”).
import { FLASH_FX, wedgeHalf } from '../../art/gallery_ladies_fx';
import { LD_FLASH, LD_GLIDE, LD_GLIDES, LD_PACE } from '../../art/gallery_ladies_moves';
import { TILE3 } from '../../art/new_mobs3';
import type { ActDef } from '../bosses';
import type { Monster } from '../state';
import type { Act1Rules } from './types';

/** A round of her glide's pictures (8 at 30 a second), played round and round as she glides. */
const GLIDE_LONG = LD_GLIDE.frames / LD_GLIDE.fps;

/** Their numbers (tiles, seconds): the ring she keeps round him, inside which she backs away; her flash's reach (from `near` to `reach`) and wait. */
export const LADY_TUNE = {
  keep: [4.5, 6] as const,
  back: 3.5,
  flash: { near: FLASH_FX.near / TILE3, reach: FLASH_FX.reach / TILE3, cd: 3.2 },
} as const;
/** The flash's half-width `d` tiles out before her (tiles). */
export const flashHalf = (d: number): number => wedgeHalf(d * TILE3) / TILE3;

const glide = (id: string, clip: string): ActDef => ({ id: `lady:${id}`, clip, long: GLIDE_LONG * 240, hit: 1e9, dmg: 0, cooldown: 0, first: 0, after: 0, near: 0, far: 99, forced: true, loop: { at: 0, span: GLIDE_LONG, extra: GLIDE_LONG * 239 } });
const ACTS: readonly ActDef[] = [
  { id: 'lady:flash', clip: 'attack', long: LD_FLASH.long, hit: LD_FLASH.hit, dmg: 1, cooldown: LADY_TUNE.flash.cd, first: 1.2, after: 0.3, near: 0, far: LADY_TUNE.flash.reach - 0.3 },
  glide('back', 'glideBack'),
  glide('left', 'glideLeft'),
  glide('right', 'glideRight'),
];
const FLASH = 0;

/** Whether a point (dx, dy from her) is in her flash's wedge as she faces (fx, fy). */
export function inFlash(fx: number, fy: number, dx: number, dy: number): boolean {
  const along = dx * fx + dy * fy;
  const across = Math.abs(-dx * fy + dy * fx);
  return along >= LADY_TUNE.flash.near && along <= LADY_TUNE.flash.reach && across <= flashHalf(along);
}

/** The glide she wants, `d` tiles from him: back, round (to her own left or right as her picture is turned), or none (her walk, or her flash). */
function wanted(m: Monster, d: number, side: number): string | null {
  if (d < LADY_TUNE.back) return 'lady:back';
  if (d <= LADY_TUNE.keep[1] + 0.3) {
    const left = (m.fx - m.fy < 0 ? -side : side) > 0;
    return left ? 'lady:left' : 'lady:right';
  }
  return null;
}
/** The way she goes round him (1 her own left): all of a floor's the same way, so that they go round him one after another and do not meet. */
const sideOf = (m: Monster): number => {
  const a = (m.a1 ??= {});
  if (a.side === undefined) a.side = 1;
  return a.side;
};

export const RULES: Act1Rules | null = {
  gait: { pace: LD_PACE, cycle: GLIDE_LONG, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: LADY_TUNE.keep[1], slack: 0.5, trueBack: true },
  acts: ACTS,
  forced(R, m, acts) {
    const g = R.g;
    const h = g.hero;
    if (g.over) return -1;
    const d = Math.hypot(h.x - m.x, h.y - m.y) || 1e-6;
    const sees = g.sees(m.x, m.y, h.x, h.y);
    // (her flash ready and he in its reach: it is made, not a glide)
    if (sees && d <= LADY_TUNE.flash.reach - 0.3 && d >= LADY_TUNE.back && m.cd <= 0 && (m.moveCd?.[FLASH] ?? 0) <= 0) return -1;
    if (!sees) return -1;
    m.fx = (h.x - m.x) / d;
    m.fy = (h.y - m.y) / d;
    const w = wanted(m, d, sideOf(m));
    return w ? acts.findIndex((a) => a.id === w) : -1;
  },
  can(_R, _m, a) {
    return !a.forced;
  },
  acting(R, m, a, t0, t1, dt) {
    const g = R.g;
    const h = g.hero;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    if (a.id === 'lady:flash') {
      if (at(LD_FLASH.warn[0])) g.sfx('shatter', 0.15);
      if (at(a.hit)) {
        g.sfx('zap', 0.5);
        if (inFlash(m.fx, m.fy, h.x - m.x, h.y - m.y) && !h.move) R.blow(m, a.dmg);
      }
      return;
    }
    // A GLIDE: back away from him, or round him, facing him
    const d = Math.hypot(h.x - m.x, h.y - m.y) || 1e-6;
    const ux = (m.x - h.x) / d;
    const uy = (m.y - h.y) / d;
    const side = sideOf(m);
    let nx = m.x;
    let ny = m.y;
    if (a.id === 'lady:back') {
      const v = LD_GLIDES.glideBack.pace * dt;
      nx += ux * v;
      ny += uy * v;
    } else {
      // (round him, her ring drawn back toward the middle of the ring she keeps)
      const v = LD_GLIDES.glideLeft.pace * dt;
      const mid = (LADY_TUNE.keep[0] + LADY_TUNE.keep[1]) / 2;
      const r1 = d + Math.max(-0.6 * dt, Math.min(0.6 * dt, mid - d));
      const ang = Math.atan2(uy, ux) + (side * v) / Math.max(1, r1);
      nx = h.x + Math.cos(ang) * r1;
      ny = h.y + Math.sin(ang) * r1;
    }
    // (not into another of them: she holds where she is this step)
    const crowded = a.id !== 'lady:back' && g.monsters.some((o) => o !== m && !o.dead && o.kind === 'lady' && Math.hypot(o.x - nx, o.y - ny) < 1 && Math.hypot(o.x - nx, o.y - ny) < Math.hypot(o.x - m.x, o.y - m.y));
    if (crowded) {
      // (stays)
    } else if (g.isOpen(nx, ny)) {
      m.x = nx;
      m.y = ny;
    } else if (a.id !== 'lady:back') (m.a1 ??= {}).side = -side;
    const d1 = Math.hypot(h.x - m.x, h.y - m.y) || 1e-6;
    m.fx = (h.x - m.x) / d1;
    m.fy = (h.y - m.y) / d1;
    // (another glide wanted, her flash ready in reach, or he out of her sight: this one ends)
    const sees = g.sees(m.x, m.y, h.x, h.y);
    const flash = sees && d1 <= LADY_TUNE.flash.reach - 0.3 && d1 >= LADY_TUNE.back && m.cd <= 0 && (m.moveCd?.[FLASH] ?? 0) <= 0;
    if ((flash || !sees || wanted(m, d1, sideOf(m)) !== a.id) && m.act) m.act.t = a.long;
  },
};
