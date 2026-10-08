// THE HEROES' MOVES AS THE GAME PLAYS THEM (see lib.ts). The game's own rules (game/game.ts) run at
// sixty steps a second in the practice room, and the game's own chooser of frames (render/figure.ts,
// `Figure`) picks the picture for each step, as the renderer asks it to (render/render.ts): only the
// pictures are stand-ins, each a note of which move, which moment of it and which view. From those:
//   FEET   (Movement 8, "A foot stays where it lands; a running figure moves its legs faster rather
//          than slide"): a foot that holds the floor, how far it moves over the floor, the game's
//          carrying of the hero counted (a run, a swing's step, a walk while attacking, a leap, a roll).
//   AIR    a foot drawn standing while the game has lifted the figure off the floor (it floats).
//   JUMPS  (Movement 5, "nothing jerky"): where the picture changes from one move to another, or skips
//          within one, how far the figure jumps in one step (the mean of its points, game px).
//   node node_modules/tsx/dist/cli.mjs tools/review_heroes/play.ts [scenario ...] [--trace]
// @ts-ignore - node typings are not part of this project
import { readFileSync } from 'node:fs';
import { useGrippingRuns, useRangerStances } from '../../src/art/moves3';
import { COMBO } from '../../src/game/defs';
import type { ClassId } from '../../src/game/types';
import * as sim from './sim';
import { play, place, scenariosOf } from './sim';
import type { Scenario, Shown } from './sim';

const TRACE = process.argv.includes('--trace');

// (the chooser mirrors a picture for a figure facing screen-left with a canvas: here a canvas that
// only remembers what was drawn on it, so that the mirrored stand-in still says what it is)
(globalThis as unknown as { document: unknown }).document = {
  createElement: () => {
    const cv: { width: number; height: number; src: string; getContext: () => unknown } = {
      width: 0, height: 0, src: '',
      getContext: () => ({ translate: () => {}, scale: () => {}, drawImage: (img: unknown) => { cv.src = String(img); } }),
    };
    return cv;
  },
};
const asked = process.argv.slice(2).filter((a) => !a.startsWith('--'));

// (the stand-in art lays its frames out as the game's does: the numbers it uses are heroes3.ts's)
{
  const src = String(readFileSync(new URL('../../src/art/heroes3.ts', import.meta.url)));
  for (const [name, v] of Object.entries({ IDLE_FPS3: sim.IDLE_FPS3, RUN_FPS3: sim.RUN_FPS3, GRIP_FPS3: sim.GRIP_FPS3, CLIP_FPS3: sim.CLIP_FPS3, GESTURE_FPS3: sim.GESTURE_FPS3, READY_HELD3: sim.READY_HELD3, READY_LEAST3: sim.READY_LEAST3, LEAP_FRAMES3: sim.LEAP_FRAMES3, ROLL_FRAMES3: sim.ROLL_FRAMES3 })) {
    const m = src.match(new RegExp(`const ${name} = ([0-9.]+);`));
    if (!m || Number(m[1]) !== v) throw new Error(`heroes3.ts's ${name} is ${m ? m[1] : 'gone'}, the review's stand-ins have ${v}: bring sim.ts in line`);
  }
}

function judge(sc: Scenario, shown: Shown[]): string[] {
  const out: string[] = [];
  const placed = shown.map(place);
  // FEET
  let worst = 0;
  let where = '';
  for (const side of ['L', 'R']) {
    let start: [number, number] | null = null;
    let by = '';
    let from = 0;
    placed.forEach((p, i) => {
      const hold = p.holds[side];
      const kind = p.holds[`${side}by`] ? String(p.holds[`${side}by`]) : '';
      if (!hold) {
        start = null;
        return;
      }
      // (a warp moves the hero in an instant: a foot does not slide there, it is elsewhere)
      const jumped = i > 0 && Math.hypot(shown[i].x - shown[i - 1].x, shown[i].y - shown[i - 1].y) > 12;
      if (!start || kind !== by || jumped) {
        start = hold;
        by = kind;
        from = i;
        return;
      }
      const d = Math.hypot(hold[0] - start[0], hold[1] - start[1]);
      if (d > worst) {
        worst = d;
        const a = shown[from];
        const b = shown[i];
        where = `the ${side === 'L' ? 'left' : 'right'} foot, down from ${a.key} frame ${(a.mt * 30).toFixed(1)} (${a.t.toFixed(2)} s) to ${b.key} frame ${(b.mt * 30).toFixed(1)} (${b.t.toFixed(2)} s)`;
      }
    });
  }
  out.push(`FEET   ${worst < 1 ? `grip (the most a foot on the floor moves: ${worst.toFixed(1)} px)` : `A FOOT ON THE FLOOR SLIDES ${worst.toFixed(1)} px: ${where}`}`);
  const air = Math.max(0, ...placed.map((p) => p.floating));
  if (air > 0.5) {
    const i = placed.findIndex((p) => p.floating === air);
    out.push(`AIR    a foot drawn standing while the figure is lifted ${air.toFixed(1)} px off the floor (${shown[i].key} frame ${(shown[i].mt * 30).toFixed(1)}, ${shown[i].t.toFixed(2)} s)`);
  }
  // JUMPS: where the picture changes move, view or skips back, the mean step of its points (relative to its feet)
  const jumps: string[] = [];
  for (let i = 1; i < shown.length; i++) {
    const a = shown[i - 1];
    const b = shown[i];
    const changed = a.key !== b.key || a.view !== b.view || a.left !== b.left || b.mt < a.mt - 1e-6 || b.mt - a.mt > 2.5 / 30;
    if (!changed) continue;
    const pa = placed[i - 1].pts;
    const pb = placed[i].pts;
    const names = Object.keys(pa).filter((k) => k !== 'tip');
    const rel = (p: Record<string, [number, number]>, k: string, sh: Shown): [number, number] => [p[k][0] - sh.x, p[k][1] - sh.y];
    let sum = 0;
    let most = 0;
    let mostAt = '';
    for (const k of names) {
      const ra = rel(pa, k, a);
      const rb = rel(pb, k, b);
      const d = Math.hypot(rb[0] - ra[0], rb[1] - ra[1]);
      sum += d;
      if (d > most) {
        most = d;
        mostAt = k;
      }
    }
    const tip = Math.hypot(pb.tip[0] - b.x - (pa.tip[0] - a.x), pb.tip[1] - b.y - (pa.tip[1] - a.y));
    const mean = sum / names.length;
    const label = `${a.key} ${(a.mt * 30).toFixed(1)}${a.view === 'back' ? 'b' : ''}${a.left ? 'L' : ''} > ${b.key} ${(b.mt * 30).toFixed(1)}${b.view === 'back' ? 'b' : ''}${b.left ? 'L' : ''} at ${b.t.toFixed(2)} s`;
    jumps.push(`${mean >= 3 ? 'JUMP ' : 'ok   '} ${label}: the body ${mean.toFixed(1)} px (most, ${mostAt}, ${most.toFixed(1)}), the weapon's end ${tip.toFixed(1)} px`);
  }
  out.push(...jumps.map((j) => `CHANGE ${j}`));
  if (TRACE) out.push('TRACE  ' + shown.filter((_, i) => i % 2 === 0).map((s) => `${s.key}@${(s.mt * 30).toFixed(1)}${s.view === 'back' ? 'b' : ''}`).join(' '));
  return out;
}

COMBO.on = true;
// (--grip: with the gripping runs, art/moves3.ts GRIP; --ranger: with the ranger's new stances, RANGER_STANCES)
if (process.argv.includes('--grip')) useGrippingRuns(true);
if (process.argv.includes('--ranger')) useRangerStances(true);
for (const cls of ['warrior', 'ranger', 'mage'] as ClassId[]) {
  for (const sc of scenariosOf(cls)) {
    const name = `${cls}: ${sc.name}`;
    if (asked.length && !asked.some((a) => name.includes(a))) continue;
    console.log(`\n== ${name}`);
    for (const line of judge(sc, play(sc))) console.log(line);
  }
}
