// The helper's own look at the second round of fixes (docs/mockups/action_fixes, 2 Nov 2026): a contact sheet of one figure's move, from
// in front (top row) and from behind (bottom row), at chosen moments, twice the picture's pixels, on a plain dark ground with the canvas's
// edge drawn. Nothing of the game imports it.
//   npx tsx tools/action_fixes2_peek.ts <out.png> <who> <move> <seconds,...>
import { writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { canvasOf, paintMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

export async function mobOf(who: string): Promise<Mob> {
  if (who === 'gardener') return (await import('../src/art/action_f16_gardener')).LUNGE_GARDENER;
  if (who === 'reaper') return (await import('../src/art/action_f11_field')).BOOM_REAPER;
  if (who === 'gleaner') return (await import('../src/art/action_f11_field')).BOOM_GLEANER;
  if (who === 'crier') return (await import('../src/art/crier_action')).crierActionMob();
  if (who === 'amalgam') return (await import('../src/art/amalgam_action')).amalgamActionMob();
  const g = await import('../src/art/action_f16_guard');
  const all = g as unknown as Record<string, Mob>;
  return all[who];
}

if (process.argv[1]?.endsWith('action_fixes2_peek.ts')) {
  const [out = 'peek.png', who = 'gardener', move = 'attack', at = ''] = process.argv.slice(2);
  void (async (): Promise<void> => {
    const mob = await mobOf(who);
    const ts = at.split(',').filter(Boolean).map(Number);
    const C = canvasOf(mob);
    const k = 2;
    const W = C.w * k;
    const H = C.h * k;
    const sheet = new Px(W * ts.length, H * 2);
    for (let i = 0; i < sheet.w * sheet.h; i++) sheet.d.set([22, 20, 34, 255], i * 4);
    ts.forEach((t, c) => {
      (['front', 'back'] as const).forEach((v, r) => {
        const p = scaled(paintMob(mob, move, t, v).px, k);
        for (let y = 0; y < H; y++) {
          for (let x = 0; x < W; x++) {
            const si = (y * W + x) * 4;
            const di = ((r * H + y) * sheet.w + c * W + x) * 4;
            const edge = x === 0 || y === 0;
            if (p.d[si + 3]) sheet.d.set([p.d[si], p.d[si + 1], p.d[si + 2], 255], di);
            else if (edge) sheet.d.set([70, 60, 90, 255], di);
            else if (y === C.ay * k && x % 6 < 3) sheet.d.set([50, 46, 70, 255], di);
          }
        }
      });
    });
    writeFileSync(out, png(sheet));
    console.log('peeked', who, move, ts.join(','));
  })();
}
