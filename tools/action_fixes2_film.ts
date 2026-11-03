// THE SECOND ROUND OF FIXES' FILM (docs/mockups/action_fixes/pictures/action_fixes2.mp4), made outside a browser, captioned: the five
// that lost their hit-hit-slam combo, each new move on its own floor's ground with the knight, from in front and from behind, then at half
// speed; the Crier's tolls and the sickle's curve also from higher up (the game's own pixels). Frames are piped to ffmpeg. Nothing of
// the game imports it.
//   npx tsx tools/action_fixes2_film.ts <out.mp4>
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { FAN, FAN_HIT } from '../src/art/amalgam_action';
import { TOLL, TOLL_HITS } from '../src/art/crier_action';
import { BOOM, BOOM_CATCH, BOOM_HIT } from '../src/art/action_f11_field';
import { LUNGE, LUNGE_HIT } from '../src/art/action_f16_gardener';
import { JAV, PULL } from '../src/art/action_f16_guard';
import { BOOM_PASS, FAN_PASS, JAV_D, LEAD, LUNGE_PASS, PULL_PASS, TOLL_PASS, boomScene, fanScene, javLands, javPass, javScene, lungeScene, pullScene, tollScene } from '../src/dev/action_fixes2_scene';
import type { View } from '../src/dev/action_fixes2_scene';
import { tombFloor } from '../src/dev/action_f1_scene';
import { squareFloor } from '../src/dev/crier_action_scene';
import { standInFloor as fieldFloor } from '../src/dev/action_f11_scene';
import { standInFloor as gardenFloor } from '../src/dev/action_f16_scene';
import { cut, scaled } from '../src/dev/king_scene';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const W = 1200;
const H = 676;
const FPS = 30;
export interface Part {
  long: number;
  title: string;
  line: string;
  frame: (t: number) => Px;
}
const big = (p: Px, k: number): Px => (k === 1 ? p : cut(scaled(p, k), 0, 0, W, H));
const HALF = ' · HALF SPEED';
type Floor = 'tomb' | 'square' | 'fields' | 'garden';
const BASES = new Map<string, Px>();
function baseOf(f: Floor, k: number, A: [number, number]): Px {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const key = `${f}${k}${A}`;
  let b = BASES.get(key);
  if (!b) {
    b = f === 'tomb' ? tombFloor(w, h, A[0], A[1]) : f === 'square' ? squareFloor(w, h, A[0], A[1]) : f === 'fields' ? fieldFloor('fields', w, h, A[0], A[1]) : gardenFloor('garden', w, h, A[0], A[1]);
    BASES.set(key, b);
  }
  return b;
}
type Scene = (view: View, t: number, base: Px, A: [number, number]) => Px;
function part(f: Floor, scene: Scene, view: View, k: number, A: [number, number], from: number, long: number, title: string, line: string, slow = 1): Part {
  return { long: long * slow, title, line, frame: (t) => big(scene(view, from + t / slow, baseOf(f, k, A), A), k) };
}
const fan = (caught: boolean): Scene => (v, t, b, A) => fanScene(v, t, b, A, caught);
const toll = (still: boolean): Scene => (v, t, b, A) => tollScene(v, t, b, A, still);
const lunge = (caught: boolean): Scene => (v, t, b, A) => lungeScene(v, t, b, A, caught);
const jav = (who: 'partisan' | 'sword'): Scene => (v, t, b, A) => javScene(v, t, b, A, who);

export const parts: Part[] = [
  part('tomb', fan(false), 'front', 2, [150, 112], 0, FAN_PASS, 'THE AMALGAMATION · THE GRASPING FAN · FROM IN FRONT', `It swells, a dozen arms bunched and straining · each arm's line marked first · HELD · then out ${FAN.reach} tiles in 2 frames`),
  part('tomb', fan(true), 'back', 2, [170, 236], 0, FAN_PASS, 'THE GRASPING FAN · FROM BEHIND', `A fan of ${FAN.to - FAN.from} degrees · the hands snatch shut · then hauled back in along the floor`),
  part('tomb', fan(true), 'front', 2, [150, 112], LEAD + FAN_HIT - 0.3, 0.75, 'THE GRASPING FAN' + HALF, 'Held · out across the floor in 2 frames, smeared · snatched shut', 2),
  part('square', toll(false), 'front', 2, [300, 176], 0, TOLL_PASS, 'THE CRIER · THE TOLL FOLLOWS YOU · FROM IN FRONT', `His handbell off his belt and up, HELD · rung in 2 frames · five tolls, each marks where you are · a beat later it bursts`),
  part('square', toll(true), 'back', 1, [600, 330], 0, TOLL_PASS, 'THE TOLLS · FROM HIGHER UP (the game’s own pixels)', `Stand still and they burst on you · keep moving and they burst behind you · each ${TOLL.r * 2} tiles across`),
  part('square', toll(false), 'back', 2, [300, 200], LEAD + TOLL_HITS[0] - 0.4, 1.15, 'A TOLL' + HALF, `Held up · rung in 2 frames · the mark · it bursts ${TOLL.burst} s later`, 2),
  part('fields', (v, t, b, A) => boomScene(v, t, b, A), 'front', 2, [140, 104], 0, BOOM_PASS, 'THE HUSHED REAPER · THE SICKLE BOOMERANG · FROM IN FRONT', `Drawn back, HELD · its curve marked · flung in 2 frames · out ${BOOM.out} tiles and back · caught, a stagger`),
  part('fields', (v, t, b, A) => boomScene(v, t, b, A), 'back', 1, [470, 470], 0, BOOM_PASS, 'THE SICKLE’S CURVE · FROM HIGHER UP (the game’s own pixels)', 'Dodge it going out · and again coming back'),
  part('fields', (v, t, b, A) => boomScene(v, t, b, A), 'front', 2, [140, 104], LEAD + BOOM_HIT - 0.4, 0.75, 'THE THROW' + HALF, 'Held · flung in 2 frames, smeared · spinning, glinting pink', 2),
  part('fields', (v, t, b, A) => boomScene(v, t, b, A), 'back', 2, [160, 230], LEAD + BOOM_CATCH - 0.3, 0.7, 'THE CATCH' + HALF, 'Back to the hand · it knocks him back a step', 2),
  part('garden', lunge(false), 'front', 3, [96, 84], 0, LUNGE_PASS, 'THE HUSHED GARDENER · THE SHEAR LUNGE · FROM IN FRONT', `A long crouch, the shears wide open, the lane marked · HELD · ${LUNGE.lunge} tiles in 2 frames · snapped shut`),
  part('garden', lunge(true), 'back', 3, [100, 164], 0, LUNGE_PASS, 'THE SHEAR LUNGE · FROM BEHIND', 'Caught at the end of the lane · then stumbling on, the shears dragged on the turf'),
  part('garden', lunge(true), 'front', 3, [96, 84], LEAD + LUNGE_HIT - 0.35, 0.7, 'THE LUNGE' + HALF, 'Coiled · flung low and long in 2 frames, smeared · the blades shut', 2),
  part('garden', jav('partisan'), 'front', 2, [150, 110], 0, LEAD + javLands('partisan') + 1.9, 'THE PALACE GUARD · THE JAVELIN · FROM IN FRONT', `Hauled back, where you stand marked · HELD · hurled in 2 frames · it sticks quivering, turf bursting ${JAV.r * 2} tiles across`),
  part('garden', jav('partisan'), 'front', 2, [150, 110], LEAD + JAV.partisan.strike[0] - 0.3, javLands('partisan') - JAV.partisan.strike[0] + 0.6, 'THE JAVELIN' + HALF, 'Held · hurled in 2 frames, smeared · it flies and sticks', 2),
  part('garden', (v, t, b, A) => pullScene(v, t, b, A), 'back', 2, [130, 250], 0, PULL_PASS, 'HE DRAWS HIS SWORD TILL HE GETS IT BACK · FROM BEHIND', 'He fights with the sword · walks to it · sword away, both hands on it · wrenched out'),
  part('garden', jav('sword'), 'front', 2, [150, 110], 0.1, LEAD + javLands('sword') + 1.2, 'THE SWORD GUARD · A JAVELIN ON HIS BACK', 'Sword put up · the javelin off his back · hurled the same way · sword out again'),
];
void [javPass, JAV_D, PULL];

if (process.argv[1]?.endsWith('action_fixes2_film.ts')) {
  const [out = 'action_fixes2.mp4', only] = process.argv.slice(2);
  const ps = only ? only.split(',').map((i) => parts[Number(i)]) : parts;
  let total = 0;
  for (const p of ps) total += p.long;
  console.log(ps.length, 'parts,', total.toFixed(1), 's');
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'fixes2_captions_'));
  const filters: string[] = [];
  let at = 0;
  ps.forEach((p, i) => {
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${H}-44:fontsize=18:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    at += p.long;
  });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = Buffer.alloc(W * H * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of ps.entries()) {
      const frames = Math.round(p.long * FPS);
      for (let fr = 0; fr < frames; fr++) {
        const px = p.frame(fr / FPS);
        for (let k = 0, j = 0; k < W * H * 4; k += 4, j += 3) {
          rgb[j] = px.d[k];
          rgb[j + 1] = px.d[k + 1];
          rgb[j + 2] = px.d[k + 2];
        }
        if (!ff.stdin.write(rgb)) await new Promise((r) => ff.stdin.once('drain', r));
        n++;
      }
      console.log(`part ${i} done (${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code) => console.log('ffmpeg done', code, out, n, 'frames'));
}
