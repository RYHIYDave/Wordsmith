// ACT 2, THE HUSH: FLOOR 15'S BOSS, THE CENSOR: what he lays on the floor, drawn (render/act1_fx/types.ts), where his rules
// (game/act1_rules/censor.ts) have it. Every picture here is the art chat's (art/censor_shots.ts), in the game's own pixels;
// his strokes themselves are his own pictures' (art/act1_figs/censor.ts).
//   ON THE FLOOR: where his slash's bristles swept, its arc of ink (drawSlashMark), laid from his right to his left as his
//     picture has it (the art lays it the other way round for one drawn turned over: it is mirrored then); Redaction's bars
//     (drawRedaction: marked out in the enemy's pink through the warning, slammed down black, lying wet, drying away), and
//     the blacking out's, laid the same way; Strike-Through's aim through its warning (drawStrikeAim, the line he will draw,
//     from him the way he faces) and its line of ink from his brush's point (drawStrikeLine); the Hush's ring rolling out
//     across the room and its veil after it (drawRoomHush).
//   THE FLOOR BLACKED OUT, for good: the floor's own tiles where it is dressed (game/act1_rules/censor.ts lays them in the
//     floor's dressing, drawn with the ground's tiles by render/act1_pieces.ts); where it is not (the practice room), the
//     art's tile ("the floor blacked out", art/floor15.ts) laid here.
//   OVER WHAT STANDS: as he dies, the book of stolen words bursting on its lectern: its words flying up out of it and away,
//     the enemy's pink going pale as they go free (as his own death's words do: art/censor_moves.ts), a flash of their light.
// Nothing cyan: the Order's black, the enemy's pink, the Hush's grey.

import { hash } from '../../art/kit';
import { FLAME } from '../../art/mkit';
import type { FloorAt } from '../../art/mob_shots';
import { drawRedaction, drawRoomHush, drawSlashMark, drawStrikeAim, drawStrikeLine } from '../../art/censor_shots';
import { BLACKED_TILE, CENSOR, CENSOR_FIGHT, barsOf, lastingOf, strikeFrom, tilesOf } from '../../game/act1_rules/censor';
import type { Peril } from '../../game/state';
import { act1Pieces } from '../act1_pieces';
import type { Act1Fx, Act1FxCtx } from './types';

const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);
const sm = (v: number): number => {
  const c = clamp01(v);
  return c * c * (3 - 2 * c);
};
/** The words going free, pale (art/censor_moves.ts FREED, his death's). */
const FREED = ['#7a7468', '#a49c8c', '#cec6b2', '#e8e2d2', '#f6f2e6'];

/** The floor seen in a mirror along the line through (px, py) the way (fx, fy): what lies to one side of it drawn on the other. */
function mirrored(at: FloorAt, px: number, py: number, fx: number, fy: number): FloorAt {
  return (x, y) => {
    const dx = x - px;
    const dy = y - py;
    const u = dx * fx + dy * fy;
    return at(px + 2 * u * fx - dx, py + 2 * u * fy - dy);
  };
}

/**
 * (CENSOR_FIGHT) HIS INK LAID TO STAY: once its slam's spatter has settled (`SETTLED` seconds on), its bars lie as the art's
 * bars lie wet; painted once, as the art draws them at that moment, and laid down from then on (a floor's tiles are 32 by 16
 * of the game's pixels, the same everywhere on a flat floor); drying away, faded out. Where there is no page to paint on
 * (the tests), drawn as the art draws them.
 */
const SETTLED = 0.45;
const LAID = new WeakMap<Peril, { cv: HTMLCanvasElement; ox: number; oy: number } | null>();
function laidInk(c: Act1FxCtx, p: Peril, dry: number): void {
  const g = c.g!;
  const was = g.globalAlpha;
  const fade = dry >= 0 ? 1 - clamp01((p.t - dry) / CENSOR_FIGHT.fill.dry) : 1;
  if (fade <= 0) return;
  let k = LAID.get(p);
  if (k === undefined) {
    k = null;
    if (typeof document !== 'undefined') {
      // (the bars' corners, measured from the peril's own point, on the screen)
      const rel = (x: number, y: number): [number, number] => [(x - p.x - (y - p.y)) * 16, (x - p.x + (y - p.y)) * 8];
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const b of barsOf(p)) {
        for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
          const du = (u * b.long) / 2;
          const dv = (v * b.wide) / 2 + v * 0.5;
          const [sx, sy] = rel(b.x + (b.along === 0 ? du : dv), b.y + (b.along === 0 ? dv : du));
          x0 = Math.min(x0, sx);
          y0 = Math.min(y0, sy);
          x1 = Math.max(x1, sx);
          y1 = Math.max(y1, sy);
        }
      }
      if (x0 < x1) {
        const ox = Math.ceil(-x0) + 4;
        const oy = Math.ceil(-y0) + 8;
        const cv = document.createElement('canvas');
        cv.width = Math.ceil(x1 - x0) + 8;
        cv.height = Math.ceil(y1 - y0) + 16;
        const cg = cv.getContext('2d');
        if (cg) {
          drawRedaction(cg, (x, y) => {
            const [sx, sy] = rel(x, y);
            return [sx + ox, sy + oy];
          }, barsOf(p), SETTLED);
          k = { cv, ox, oy };
        }
      }
    }
    LAID.set(p, k);
  }
  g.globalAlpha = was * fade;
  if (k) {
    const [bx, by] = c.at(p.x, p.y);
    g.drawImage(k.cv, Math.round(bx) - k.ox, Math.round(by) - k.oy);
  } else drawRedaction(g, c.at, barsOf(p), SETTLED);
  g.globalAlpha = was;
}

/** THE FLOOR BLACKED OUT where the floor is not dressed (the practice room): the art's tile on each, at its tile's middle (the Hush's floor tiles are anchored there: art/act2_kit.ts lying). */
function blackTiles(c: Act1FxCtx, p: Peril): void {
  const g = c.g;
  const L = c.game.level;
  if (!g || L.act1 || p.t < CENSOR.redact.lay) return;
  const sp = act1Pieces(15).get(BLACKED_TILE)?.frames?.[0];
  if (!sp) return;
  const W = L.floor.w;
  for (const i of tilesOf(p)) {
    const tx = i % W;
    const [sx, sy] = c.at(tx + 0.5, (i - tx) / W + 0.5);
    g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
  }
}

/** THE BOOK OF STOLEN WORDS BURSTING, `p.t` seconds on: its words flying up out of it and away, pink going pale; a flash of their light. */
function bookBurst(c: Act1FxCtx, p: Peril): void {
  const g = c.g;
  if (!g) return;
  const T = CENSOR.book.fly;
  const t = p.t;
  const [bx, by] = c.at(p.x, p.y);
  // (the open pages: about 22 of the game's pixels up, on the lectern's top)
  const oy = by - 22;
  if (t < 0.6) c.spot(bx, oy, 40 + 60 * t, 0.9 * (1 - t / 0.6));
  const was = g.globalAlpha;
  for (let i = 0; i < 64; i++) {
    const life = (t - 0.012 * i) / (T - 0.8);
    if (life <= 0 || life >= 1) continue;
    const a = i * 2.39996;
    const out = (6 + 30 * hash(i, 1, 9151)) * sm(life * 1.6);
    const up = (20 + 70 * hash(i, 2, 9151)) * life + 10 * Math.sin(Math.PI * Math.min(1, life * 2));
    const x = bx + Math.cos(a + life * 1.5) * out;
    const y = oy - up + Math.sin(a + life * 1.5) * out * 0.5;
    const pale = life > 0.3 + 0.3 * hash(i, 3, 9151);
    g.globalAlpha = was * (1 - sm((life - 0.75) / 0.25));
    g.fillStyle = pale ? FREED[life > 0.8 ? 4 : life > 0.6 ? 3 : 2] : life < 0.15 ? FLAME[3] : FLAME[2];
    const w = life < 0.4 ? 2 : 1;
    g.fillRect(Math.round(x), Math.round(y), w, 1);
  }
  g.globalAlpha = was;
}

export const FX: Act1Fx | null = {
  ground(c, m, p) {
    const g = c.g;
    if (!g) return;
    if (m) {
      // STRIKE-THROUGH'S AIM, through its warning: the line he will draw, from him the way he faces
      const S = CENSOR.strike;
      if (m.state !== 'act' || !m.act || m.act.id !== 'censor:strike') return;
      const k = (m.act.t - S.warn[0]) / (S.hit - S.warn[0]);
      if (k <= 0 || k >= 1) return;
      const o = strikeFrom(m, m.act.hand);
      drawStrikeAim(g, c.at, o.x, o.y, m.fx, m.fy, m.act.a, k);
      return;
    }
    if (!p) return;
    switch (p.a1) {
      case 'censor:slash':
        // (his right to his left as his picture has it: the art's way round is his left in a picture turned over)
        drawSlashMark(g, p.hand === 1 ? mirrored(c.at, p.x, p.y, p.fx, p.fy) : c.at, p.x, p.y, p.fx, p.fy, p.t);
        return;
      case 'censor:bars': {
        // (CENSOR_FIGHT: laid to stay, once settled)
        const last = lastingOf(p);
        if (last && (p.t >= SETTLED || last.dry >= 0)) {
          laidInk(c, p, last.dry);
          return;
        }
        // (CENSOR_FIGHT: the page's lines all marked out from the first, each as a third of the way into its warning until
        // its own warning has come that far)
        drawRedaction(g, c.at, barsOf(p), p.c === 2 ? Math.max(p.t, -CENSOR.redact.warn * 0.7) : p.t);
        return;
      }
      case 'censor:black':
        blackTiles(c, p);
        drawRedaction(g, c.at, barsOf(p), p.t);
        return;
      case 'censor:margin':
        // (CENSOR_FIGHT: a line of ink across the room from its wall: marked out as Strike-Through's aim, then run out)
        if (p.t < 0) drawStrikeAim(g, c.at, p.x, p.y, p.fx, p.fy, p.a, 1 + p.t / CENSOR_FIGHT.ink.warn);
        else drawStrikeLine(g, c.at, p.x, p.y, p.fx, p.fy, p.a, p.t);
        return;
      case 'censor:line':
        drawStrikeLine(g, c.at, p.x + p.fx * p.b, p.y + p.fy * p.b, p.fx, p.fy, Math.max(0, p.a - p.b), p.t);
        return;
      case 'censor:hush':
        drawRoomHush(g, c.at, p.x, p.y, p.a, p.t);
        return;
      default:
        return;
    }
  },
  air(c, _m, p) {
    if (p && p.a1 === 'censor:book') bookBurst(c, p);
  },
};
