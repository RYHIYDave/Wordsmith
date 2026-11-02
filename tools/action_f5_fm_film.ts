// THE FLESHMANCER'S MOVES DONE THE ACTION WAY: THE FILM (docs/mockups/action_f5_fleshmancer/pictures/fleshmancer_action.mp4), made
// outside a browser: each move in his lair with the knight for size, from in front and from behind (twice the game's pixels); the
// rings and the fire sweep over the whole lair from above (the game's own pixels, the arena whole), the knight dodging; then each
// strike at half speed (three times the game's pixels); the mini fleshmancer's fire. Captioned. Frames are piped to ffmpeg. Nothing
// of the game imports it.
//   npx tsx tools/action_f5_fm_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { FIRE_STRIKE, RAISE_STRIKE, RING_STRIKES, RISE_STRIKE, SHARD_STRIKES, SINK_STRIKE } from '../src/art/fleshmancer_action';
import { FIRE, RINGS, RISE_MARK, SHARDS } from '../src/art/fleshmancer_action_fx';
import { tombFloor } from '../src/dev/action_f1_scene';
import { FIRE_ARENA_PASS, FIRE_PASS, LEAD, MINI_PASS, PAUSE, RAISE_PASS, RINGS_ARENA_PASS, RINGS_PASS, SHARDS_PASS, TELEPORT_PASS, fireArena, fireScene, miniScene, raiseScene, ringsArena, ringsScene, shardsScene, teleportScene } from '../src/dev/action_f5_fm_scene';
import type { View } from '../src/dev/action_f5_fm_scene';
import { SINK_LONG } from '../src/art/fleshmancer_action';
import { cut, scaled } from '../src/dev/king_scene';
import { png } from './king_png';

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};

const W = 1200;
const H = 676;
const FPS = 30;
interface Part {
  long: number;
  title: string;
  line: string;
  frame: (t: number) => Px;
}
type Scene = (view: View, t: number, base: Px, cx: number, cy: number) => Px;
const BASES = new Map<string, Px>();
/** Of each whole move, the first moments of his stand left out. */
const SKIP = 0.25;
/** A part: a scene of `W / k` by `H / k` picture pixels, his floor point at (cx, cy), `k` times as big; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = SKIP, slow = 1): Part {
  if (slow === 1 && from === SKIP) long -= SKIP;
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  const key = `${w}x${h}@${cx},${cy}`;
  if (!BASES.has(key)) BASES.set(key, tombFloor(w, h, cx, cy));
  const base = BASES.get(key) as Px;
  return { long: long * slow, title, line, frame: (t) => { const p = scene(view, from + t / slow, base, cx, cy); return k === 1 ? p : cut(scaled(p, k), 0, 0, W, H); } };
}
/** A strike at half speed: from a little before its wind-up ends to a little after it lands. */
const strike = (scene: Scene, view: View, k: number, cx: number, cy: number, s: readonly [number, number], title: string, line: string, after = 0.3, lead = LEAD): Part => part(scene, view, k, cx, cy, s[1] - s[0] + 0.25 + after, title, line, lead + s[0] - 0.25, 2);
const arena = (fn: (t: number, base: Px, cx: number, cy: number) => Px, long: number, title: string, line: string): Part => {
  const base = tombFloor(W, H, 600, 350);
  return { long: long - SKIP, title, line, frame: (t) => fn(t + SKIP, base, 600, 350) };
};
const HALF = 'THE STRIKES · HALF SPEED';
export const parts: Part[] = [
  part(shardsScene, 'front', 2, 230, 150, SHARDS_PASS, 'THE BONE SHARDS · FROM IN FRONT', `Bone dragged up out of the floor: ${SHARDS.fan[0]} shards hang, aimed, HELD · hammered: they fly · a second fan in the gaps`),
  part(shardsScene, 'back', 2, 230, 200, SHARDS_PASS, 'THE BONE SHARDS · FROM BEHIND', 'Their lanes marked on the floor while they hang · stand in a gap, then step into where the first fan went'),
  part(ringsScene, 'front', 2, 300, 190, RINGS_PASS, 'THE RINGS OF HANDS · FROM IN FRONT', `Arms up, the cracks light in ${RINGS.radii.length} rings, gaps dark, HELD · SLAM: every other ring bursts · SLAM: the rest`),
  part(ringsScene, 'back', 2, 300, 190, RINGS_PASS, 'THE RINGS OF HANDS · FROM BEHIND', `Out to his lair's walls (${RINGS.radii[RINGS.radii.length - 1]} tiles) · stand between the rings, then step in`),
  arena(ringsArena, RINGS_ARENA_PASS, 'THE RINGS · THE WHOLE LAIR, FROM ABOVE', 'Safe between two rings at the first slam · across into the ring whose hands are sinking as the next bursts'),
  part(fireScene, 'front', 2, 300, 150, FIRE_PASS, 'THE FIRE SWEEP · FROM IN FRONT', 'Reared back, the fire gathering, HELD · thrown forward: the stream WHIPS ROUND in 1.2 s'),
  part(fireScene, 'back', 2, 300, 190, FIRE_PASS, 'THE FIRE SWEEP · FROM BEHIND', `Out to ${FIRE.reach} tiles · the floor left burning in lanes for ${FIRE.burn} s where it gouted`),
  arena(fireArena, FIRE_ARENA_PASS, 'THE FIRE · THE WHOLE LAIR, FROM ABOVE', 'In close under him while it whips round · then out between the burning lanes'),
  part(raiseScene, 'front', 2, 300, 170, RAISE_PASS, 'RAISE THE DEAD · FROM IN FRONT', 'Bowed · arms flung up: the heaps shake, lit from under, HELD · flung down: the dead BURST up'),
  part(raiseScene, 'back', 2, 300, 170, RAISE_PASS, 'RAISE THE DEAD · FROM BEHIND', 'Bone and grave dirt thrown · each heap one of his dead'),
  part(teleportScene, 'front', 2, 300, 160, TELEPORT_PASS, 'THE TELEPORT · FROM IN FRONT', `Seized and YANKED down into a pit of his dead · where he will rise is marked first (${RISE_MARK.warn} s)`),
  part(teleportScene, 'back', 2, 300, 190, TELEPORT_PASS, 'THE TELEPORT · FROM BEHIND', `He ERUPTS out of it: a burst that hurts all round, out to ${RISE_MARK.r} tiles · keep out of the ring`),
  strike(shardsScene, 'front', 3, 160, 110, SHARD_STRIKES[0], HALF, 'The shards: held, then hammered in 2 frames, smeared'),
  strike(shardsScene, 'front', 3, 160, 110, SHARD_STRIKES[1], HALF, 'The second fan: 2 frames'),
  strike(ringsScene, 'front', 3, 200, 140, RING_STRIKES[0], HALF, 'The rings: the staff driven down in 2 frames'),
  strike(ringsScene, 'front', 3, 200, 140, RING_STRIKES[1], HALF, 'His claw slammed down: 2 frames'),
  strike(fireScene, 'front', 3, 200, 110, FIRE_STRIKE, HALF, 'The fire: thrown forward in 2 frames, and the whip', 0.7),
  strike(raiseScene, 'front', 3, 200, 120, RAISE_STRIKE, HALF, 'The call: flung down in 2 frames, the dead burst up', 0.5),
  strike(teleportScene, 'front', 3, 190, 100, SINK_STRIKE, HALF, 'Yanked down: 2 frames'),
  strike(teleportScene, 'front', 3, 230, 130, RISE_STRIKE, HALF, 'He erupts: 2 frames, and the burst', 0.45, LEAD + SINK_LONG + PAUSE),
  part(miniScene, 'front', 3, 200, 120, MINI_PASS, 'THE MINI FLESHMANCER’S FIRE · FROM IN FRONT', 'Claws cocked, HELD · thrust in 2 frames: the fire whipped across, the floor left burning'),
  part(miniScene, 'back', 3, 200, 140, MINI_PASS, 'THE MINI FLESHMANCER’S FIRE · FROM BEHIND', 'The same way, smaller'),
];

if (process.argv[1]?.endsWith('action_f5_fm_film.ts')) {
  const [out = 'fleshmancer_action.mp4', mode = ''] = process.argv.slice(2);
  let total = 0;
  for (const p of parts) total += p.long;
  console.log(parts.length, 'parts,', total.toFixed(1), 's');
  if (mode === 'stills') {
    const dir = process.argv[4] ?? 'stills';
    mkdirSync(dir, { recursive: true });
    const at = (process.argv[5] ?? '').split(',').filter(Boolean).map(Number);
    const only = process.argv[6] ? process.argv[6].split(',').map(Number) : null;
    parts.forEach((p, i) => {
      if (only && !only.includes(i)) return;
      for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8]) writeFileSync(`${dir}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, k < 1.0001 && !at.length ? p.long * k : k))));
    });
  } else {
    const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
    const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
    const dir = mkdtempSync(join(tmpdir(), 'fm_captions_'));
    const filters: string[] = [];
    let at = 0;
    parts.forEach((p, i) => {
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
      for (const [i, p] of parts.entries()) {
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
}
