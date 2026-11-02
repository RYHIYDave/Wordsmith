// THE FLESHMANCER'S MOVES DONE THE ACTION WAY: THE SHEET (docs/mockups/action_f5_fleshmancer/pictures/fleshmancer_action_sheet.png):
// key moments of each move from in front and from behind, in his lair with the knight; his old shards beside the new; the rings and
// the fire over the whole lair; the mini fleshmancer's fire. Panels are laid out here with their captions by
// tools/action_f5_fm_captions.py. Nothing of the game imports it.
//   npx tsx tools/action_f5_fm_sheet.ts <out dir>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { FIRE_HIT, MINI_HIT, RAISE_HIT, RING_HITS, SHARD_HITS } from '../src/art/fleshmancer_action';
import { tombFloor } from '../src/dev/action_f1_scene';
import { LEAD, TELEPORT_ERUPT, fireArena, fireScene, miniScene, oldFrame, raiseScene, ringsArena, ringsScene, shardsScene, teleportScene } from '../src/dev/action_f5_fm_scene';
import type { View } from '../src/dev/action_f5_fm_scene';
import { lay, shadow } from '../src/dev/king_scene';
import { PxCtx } from '../src/dev/action_f3_scene';
import { FM_SHARDS, fmMouthAt } from '../src/art/fleshmancer';
import { drawBoneShard } from '../src/art/fm_spells';
import { FLESHMANCER as RULES } from '../src/game/bosses';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const out = process.argv[2] ?? 'sheet';
mkdirSync(out, { recursive: true });
const f = (n: number): number => n / 30;
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
/** A row of cells side by side, a dark line between them. */
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
/** A cell `w` by `h` of a scene `m` seconds into its move, his floor point at (cx, cy) of it. */
function cell(scene: Scene, view: View, m: number, w: number, h: number, cx: number, cy: number): Px {
  return scene(view, LEAD + m, tombFloor(w, h, cx, cy), cx, cy);
}
const three = (scene: Scene, view: View, ms: number[], cx: number, cy: number): Px => row(ms.map((m) => cell(scene, view, m, 400, 270, cx, cy)));
// THE SHARDS: drawn up and hanging, HELD, aimed; hammered, the fan flies; the second fan hanging in the gaps
const SH = [f(20), SHARD_HITS[0] + f(3), f(48)];
writeFileSync(`${out}/shards_front.png`, png(three(shardsScene, 'front', SH, 130, 100)));
writeFileSync(`${out}/shards_back.png`, png(three(shardsScene, 'back', SH, 130, 170)));
// HIS OLD SHARDS (the game's own, as he is) BESIDE THE NEW: wound up; spitting; and the new, held and hammered
{
  const old = (t: number): Px => {
    const p = tombFloor(300, 270, 110, 110);
    shadow(p, 110, 110, 12);
    lay(p, oldFrame('attack', t, 'front'), 110, 110);
    // (his old fan of seven, as the game draws them: art/fm_spells.ts drawBoneShard, in the game's pixels, half the picture's)
    if (t > FM_SHARDS.hit) {
      const g = new PxCtx(p, 2) as unknown as CanvasRenderingContext2D;
      const [mx, my] = fmMouthAt('attack', FM_SHARDS.hit, 'front');
      const d0 = 0.3 + RULES.shards.speed * (t - FM_SHARDS.hit);
      for (let i = 0; i < RULES.shards.fan; i++) {
        const a = ((i - (RULES.shards.fan - 1) / 2) * RULES.shards.apart * Math.PI) / 180 + 0.08;
        const [ux, uy] = [Math.cos(a), Math.sin(a)];
        const sx = (110 + mx + 32 * (ux - uy) * d0) / 2;
        const sy = (110 + my + 16 * (ux + uy) * d0) / 2;
        drawBoneShard(g, sx, sy, 0, (32 * (ux - uy)) / 2, (16 * (ux + uy)) / 2, t - FM_SHARDS.hit, i * 1.7);
      }
    }
    return p;
  };
  const neu = (m: number): Px => cell(shardsScene, 'front', m, 300, 270, 110, 110);
  writeFileSync(`${out}/shards_old.png`, png(row([old(0.55), old(0.92), neu(f(20)), neu(SHARD_HITS[0] + f(3))])));
}
// THE RINGS: the cracks lit, HELD; the first slam; the second
const RG = [f(30), RING_HITS[0] + f(4), RING_HITS[1] + f(4)];
writeFileSync(`${out}/rings_front.png`, png(three(ringsScene, 'front', RG, 200, 135)));
writeFileSync(`${out}/rings_back.png`, png(three(ringsScene, 'back', RG, 200, 145)));
// THE FIRE: HELD, gathering; the whip; the lanes burning
const FI = [f(26), FIRE_HIT + f(9), FIRE_HIT + 1.6];
writeFileSync(`${out}/fire_front.png`, png(three(fireScene, 'front', FI, 170, 110)));
writeFileSync(`${out}/fire_back.png`, png(three(fireScene, 'back', FI, 170, 160)));
// OVER THE WHOLE LAIR: the rings lit, and burst; the fire whipping, and the lanes
{
  const arena = (fn: (t: number, base: Px, cx: number, cy: number) => Px, m: number): Px => {
    const base = tombFloor(600, 330, 300, 165);
    return fn(LEAD + m, base, 300, 165);
  };
  writeFileSync(`${out}/arena_rings.png`, png(row([arena(ringsArena, f(30)), arena(ringsArena, RING_HITS[1] + f(4))])));
  writeFileSync(`${out}/arena_fire.png`, png(row([arena(fireArena, FIRE_HIT + f(10)), arena(fireArena, FIRE_HIT + 1.8)])));
}
// RAISE THE DEAD: the heaps shaking, HELD; the dead burst up; up
const RA = [f(34), RAISE_HIT + f(4), RAISE_HIT + 0.7];
writeFileSync(`${out}/raise_front.png`, png(three(raiseScene, 'front', RA, 190, 120)));
writeFileSync(`${out}/raise_back.png`, png(three(raiseScene, 'back', RA, 190, 130)));
// THE TELEPORT: yanked down; where he will rise marked; he erupts
const TE = [f(19), TELEPORT_ERUPT - LEAD - 0.35, TELEPORT_ERUPT - LEAD + f(3)];
writeFileSync(`${out}/teleport_front.png`, png(three(teleportScene, 'front', TE, 170, 110)));
writeFileSync(`${out}/teleport_back.png`, png(three(teleportScene, 'back', TE, 150, 160)));
// THE MINI FLESHMANCER: cocked, HELD; the whip; the floor burning
const MI = [f(20), MINI_HIT + f(6), MINI_HIT + 1.0];
writeFileSync(`${out}/mini_front.png`, png(three(miniScene, 'front', MI, 150, 100)));
writeFileSync(`${out}/mini_back.png`, png(three(miniScene, 'back', MI, 150, 160)));
console.log('panels in', out);
