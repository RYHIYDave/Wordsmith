// THE RAT KING DONE THE ACTION WAY (docs/mockups/action_f12_ratking): a hash of every frame the game shows of the Rat King
// (art/rat_king.ts makeRatKingArt, as art/act1_figs/ratking.ts hands it over) and of what the game draws of his moves on the floor
// and in the air (art/rat_king_shots.ts: his word's warning line, the word in flight, its burst, his swarm; and his roll's lane,
// art/charge_lane.ts), move by move, both ways round, so that what is added behind RATKING_ACTION is shown to change nothing,
// pixel for pixel. It imports only the game's own files, so that it runs the same on the branch this one came from. Nothing of
// the game imports it.
//   npx tsx tools/ratking_action_hash.ts [moves]
import { createHash } from 'node:crypto';
import { Px, rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import type { ActorArt, AnimSet } from '../src/art/actor_types';
import { makeRatKingArt } from '../src/art/rat_king';
import { drawStolenWord, drawSwarm, drawWordAim, drawWordBurst } from '../src/art/rat_king_shots';
import type { StolenWord } from '../src/art/rat_king_shots';
import { drawChargeLane } from '../src/art/charge_lane';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, c[k]!.frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}
function frameHash(sp: Sprite): string {
  const p = sp.img as unknown as Px;
  return createHash('sha256').update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).update(JSON.stringify(sp.aura ?? null)).digest('hex').slice(0, 12);
}
/** A canvas's 2-D pen over plain pixels: what the game's drawing of his shots asks of one (fills of rectangles and of straight-edged shapes, a colour, how much shows). */
export function penOf(px: Px): CanvasRenderingContext2D {
  let pts: [number, number][] = [];
  const g = {
    fillStyle: '#000' as string,
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number): void {
      const c = rgba(g.fillStyle);
      for (let Y = Math.round(y); Y < Math.round(y + h); Y++) for (let X = Math.round(x); X < Math.round(x + w); X++) blend(X, Y, c);
    },
    beginPath(): void {
      pts = [];
    },
    moveTo(x: number, y: number): void {
      pts.push([x, y]);
    },
    lineTo(x: number, y: number): void {
      pts.push([x, y]);
    },
    closePath(): void {},
    fill(): void {
      if (pts.length < 3) return;
      const c = rgba(g.fillStyle);
      const ys = pts.map((p) => p[1]);
      for (let Y = Math.floor(Math.min(...ys)); Y <= Math.ceil(Math.max(...ys)); Y++) {
        const yc = Y + 0.5;
        const xs: number[] = [];
        for (let i = 0; i < pts.length; i++) {
          const [x0, y0] = pts[i];
          const [x1, y1] = pts[(i + 1) % pts.length];
          if ((y0 <= yc && y1 > yc) || (y1 <= yc && y0 > yc)) xs.push(x0 + ((yc - y0) / (y1 - y0)) * (x1 - x0));
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) for (let X = Math.round(xs[k]); X < Math.round(xs[k + 1]); X++) blend(X, Y, c);
      }
    },
  };
  const blend = (X: number, Y: number, c: readonly number[]): void => {
    if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) return;
    const i = (Y * px.w + X) * 4;
    const f = (Math.max(0, Math.min(1, g.globalAlpha)) * (c[3] ?? 255)) / 255;
    px.d[i] = Math.round(px.d[i] * (1 - f) + c[0] * f);
    px.d[i + 1] = Math.round(px.d[i + 1] * (1 - f) + c[1] * f);
    px.d[i + 2] = Math.round(px.d[i + 2] * (1 - f) + c[2] * f);
    px.d[i + 3] = Math.max(px.d[i + 3], Math.round(255 * f));
  };
  return g as unknown as CanvasRenderingContext2D;
}
/** What the game draws of his moves, a run of moments of each, on a plain picture (the floor's tiles at 32 by 16 picture pixels). */
export function shotsHash(): string {
  const h = createHash('sha256');
  const at = (x: number, y: number): [number, number] => [300 + 32 * (x - y), 200 + 16 * (x + y)];
  const kinds: StolenWord[] = ['fire', 'frost', 'lightning', 'poison'];
  for (let t = 0; t < 1.6; t += 0.1) {
    const px = new Px(600, 400);
    const g = penOf(px);
    drawWordAim(g, at, 0, 0, 4, 2, t / 1.2, t);
    kinds.forEach((k, i) => drawStolenWord(g, at, k, -3 + i, -2, 40.8, 3 + i, 4, t * 0.6));
    kinds.forEach((k, i) => drawWordBurst(g, at, k, -2 + 2 * i, 3, t * 0.4));
    drawSwarm(g, at, -4, -3, 4, 3, t * 0.6);
    drawChargeLane(g, { x0: -4, y0: 2, x1: 3, y1: -3, half: 0.74, k: Math.min(1, t), ...(t > 1 ? { gone: t - 1 } : {}) }, at);
    h.update(px.d);
  }
  return h.digest('hex').slice(0, 16);
}
/** Every frame of him, both ways round, by move; and what the game draws of his moves. */
export function ratKingHashes(art: ActorArt = makeRatKingArt()): { whole: string; shots: string; byMove: Record<string, string> } {
  const m: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) for (const [name, fr] of lists(s)) m[`${view}:${name}`] = fr.map(frameHash);
  const byMove = Object.fromEntries(Object.entries(m).map(([k, v]) => [k, `${v.length} ${createHash('sha256').update(v.join()).digest('hex').slice(0, 10)}`]));
  return { whole: createHash('sha256').update(JSON.stringify(m)).digest('hex').slice(0, 16), shots: shotsHash(), byMove };
}
if (process.argv[1]?.endsWith('ratking_action_hash.ts')) {
  const h = ratKingHashes();
  console.log(JSON.stringify(process.argv[2] === 'moves' ? h : { ratking: h.whole, shots: h.shots }, null, 1));
}
