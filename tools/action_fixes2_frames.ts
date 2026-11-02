// The second round of fixes' sheet (docs/mockups/action_fixes/pictures/action_fixes2_sheet.png): the figures' own frames, each the
// game's picture pixels (the sheet scales them), of each one's OLD combo (run on the branch before these changes: 523e891) or its NEW move
// (run here), at the same moments of its warning, its strike and after. Nothing of the game imports it.
//   npx tsx tools/action_fixes2_frames.ts <out dir> <old|new>
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { paintMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

type Row = [string, () => Promise<Mob>, string, number[]];
const OLD: Row[] = [
  ['amalgam', async () => (await import('../src/art/amalgam_action')).amalgamActionMob(), 'attack', [0.55, 0.733, 1.85, 2.0, 3.35, 3.533]],
  ['crier', async () => (await import('../src/art/crier_action')).crierActionMob(), 'attack', [0.55, 0.667, 1.55, 1.667, 2.75, 2.867]],
  ['reaper', async () => (await import('../src/art/action_f11_field')).HARVEST_REAPER, 'attack', [0.55, 0.667, 1.1, 1.167, 1.75, 1.833]],
  ['gardener', async () => (await import('../src/art/action_f16_gardener')).HEDGE_GARDENER, 'attack', [0.55, 0.667, 1.05, 1.133, 1.75, 1.867]],
  ['guard', async () => (await import('../src/art/action_f16_guard')).DRILL_PARTISAN, 'drill', [0.55, 0.667, 1.1, 1.2, 2.3, 2.4]],
];
const NEW: Row[] = [
  ['amalgam', async () => (await import('../src/art/amalgam_action')).amalgamActionMob(), 'attack', [0.75, 1.0, 1.033, 1.067, 1.2, 1.55]],
  ['crier', async () => (await import('../src/art/crier_action')).crierActionMob(), 'attack', [0.3, 0.75, 0.933, 0.967, 1.3, 1.5]],
  ['reaper', async () => (await import('../src/art/action_f11_field') as unknown as Record<string, Mob>).BOOM_REAPER, 'attack', [0.6, 0.733, 0.767, 1.3, 2.267, 2.45]],
  ['gardener', async () => (await import('../src/art/action_f16_gardener') as unknown as Record<string, Mob>).LUNGE_GARDENER, 'attack', [0.7, 1.1, 1.133, 1.167, 1.45, 1.75]],
  ['guard', async () => (await import('../src/art/action_f16_guard') as unknown as Record<string, Mob>).JAV_PARTISAN, 'javelin', [0.7, 0.9, 0.933, 0.967, 1.3, 1.9]],
];

if (process.argv[1]?.endsWith('action_fixes2_frames.ts')) {
  const [out = 'frames', which = 'new'] = process.argv.slice(2);
  mkdirSync(out, { recursive: true });
  void (async (): Promise<void> => {
    for (const [name, get, move, ts] of which === 'old' ? OLD : NEW) {
      const mob = await get();
      ts.forEach((t, i) => {
        for (const v of ['front'] as const) writeFileSync(`${out}/${which}_${name}_${i}_${v}.png`, png(paintMob(mob, move, t, v).px));
      });
      console.log(which, name);
    }
  })();
}
