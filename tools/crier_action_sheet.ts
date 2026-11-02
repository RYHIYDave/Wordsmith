// THE CRIER'S MOVES DONE THE ACTION WAY: THE SHEET's panels (docs/mockups/action_f11_crier/pictures/crier_action_sheet.png, put
// together with its captions by tools/crier_action_captions.py): key moments of each move from in front and from behind, in his
// square with the knight; his old cone beside the new shout; the shout over the whole square at three moments; the scroll and the
// crowd over the whole square. Nothing of the game imports it.
//   npx tsx tools/crier_action_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { CROWD_HIT, PROCLAIM_HIT, SHOUT_HIT, SWING_HITS, f } from '../src/art/crier_action';
import { CR_SHOUT } from '../src/art/crier';
import { drawShoutBlast, drawShoutWarn } from '../src/art/crier_shots';
import { LEAD, crowdArena, crowdScene, decreeArena, decreeScene, oldFrame, shoutArena, shoutScene, squareFloor, swingScene } from '../src/dev/crier_action_scene';
import type { View } from '../src/dev/crier_action_scene';
import { cut, lay, shadow } from '../src/dev/king_scene';
import { PxCtx } from '../src/dev/action_f3_scene';
import { onFloor } from '../src/dev/action_f1_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
function row(cells: Px[]): Px {
  const w = cells.reduce((a, c) => a + c.w, 0);
  const r = new Px(w, cells[0].h);
  let x = 0;
  for (const c of cells) {
    r.blit(c, x, 0);
    if (x) for (let y = 0; y < r.h; y++) r.set(x, y, '#07060c').set(x - 1, y, '#07060c');
    x += c.w;
  }
  return r;
}
function cell(scene: Scene, view: View, m: number, w: number, h: number, cx: number, cy: number): Px {
  return scene(view, LEAD + m, squareFloor(w, h, cx, cy), cx, cy);
}
const three = (scene: Scene, view: View, ms: number[], cx: number, cy: number, w = 400, h = 270): Px => row(ms.map((m) => cell(scene, view, m, w, h, cx, cy)));
const save = (name: string, p: Px): void => writeFileSync(`${out}/${name}`, png(p));
// THE SWING: hauled back, HELD; the backswing; raised overhead, HELD; slammed
const SW = [f(16), SWING_HITS[0] + f(1), f(80), SWING_HITS[2] + f(3)];
save('swing_front.png', row(SW.map((m) => cell(swingScene, 'front', m, 300, 270, 150, 140))));
save('swing_back.png', row(SW.map((m) => cell(swingScene, 'back', m, 300, 270, 150, 175))));
// THE SHOUT, close: the breath HELD, the air rippling; thrown into it; the echoes
const SH = [f(40), SHOUT_HIT + f(3), SHOUT_HIT + 0.75];
save('shout_front.png', three(shoutScene, 'front', SH, 300, 180));
save('shout_back.png', three(shoutScene, 'back', SH, 300, 70));
// HIS OLD CONE BESIDE THE NEW SHOUT: the game's own, as he is: the breath and the blast (art/crier_shots.ts, in the game's pixels)
{
  const old = (t: number): Px => {
    const w = 600;
    const h = 330;
    const cx = 160;
    const cy = 150;
    const p = squareFloor(w, h, cx, cy);
    const g = new PxCtx(p, 1) as unknown as CanvasRenderingContext2D;
    const at = (x: number, y: number): [number, number] => onFloor(x, y, cx, cy, 1);
    if (t < CR_SHOUT.hit) drawShoutWarn(g, at, 0, 0, 1, 0, Math.min(1, (t - 0.42) / (CR_SHOUT.hit - 0.46)), t);
    else drawShoutBlast(g, at, 0, 0, 1, 0, t - CR_SHOUT.hit);
    shadow(p, cx, cy, 14);
    lay(p, oldFrame('shout', t, 'front'), cx, cy);
    return p;
  };
  save('shout_old.png', row([old(0.75), old(CR_SHOUT.hit + 0.3)]));
}
// THE SHOUT OVER THE WHOLE SQUARE at three moments: the breath held (the square marked, the one spot plain); the wave crossing; the echoes back from three sides
{
  const A = (m: number): Px => cut(shoutArena(LEAD + m, squareFloor(1200, 676, 600, 352), 600, 352), 60, 40, 1080, 600);
  save('shout_arena1.png', A(1.25));
  save('shout_arena2.png', A(SHOUT_HIT + 0.3));
  save('shout_arena3.png', A(SHOUT_HIT + 0.7));
}
// THE SCROLL: held high, the lane marked; flung, unrolling; the letters burning
const DE = [f(32), PROCLAIM_HIT + f(5), PROCLAIM_HIT + 1.4];
save('decree_front.png', three(decreeScene, 'front', DE, 250, 220));
save('decree_back.png', three(decreeScene, 'back', DE, 250, 120));
save('decree_arena.png', cut(decreeArena(LEAD + PROCLAIM_HIT + 1.2, squareFloor(1200, 676, 600, 352), 600, 352), 60, 40, 1080, 600));
// THE CROWD: sunk down, HELD; the call; they pour in
const CW = [f(36), CROWD_HIT + f(3), CROWD_HIT + 1.3];
save('crowd_front.png', three(crowdScene, 'front', CW, 200, 150));
save('crowd_back.png', three(crowdScene, 'back', CW, 200, 170));
save('crowd_arena.png', cut(crowdArena(LEAD + CROWD_HIT + 1.6, squareFloor(1200, 676, 600, 352), 600, 352), 60, 40, 1080, 600));
console.log('panels in', out);
