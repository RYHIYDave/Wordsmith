// THE RAT KING DONE THE ACTION WAY: THE FILM (docs/mockups/action_f12_ratking/pictures/ratking_action.mp4), made outside a browser: the
// sluices opening over the whole cistern from above (the game's own picture pixels), the knight getting onto a dry ledge, then caught
// in a lane; then each move close (twice as big), from in front and from behind; then each strike at half speed (three times as
// big). Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/ratking_action_film.ts <out.mp4> [stills <dir> <seconds,...> [parts]]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { BITE9, BITE9_STRIKE, ROLL9, ROLL9_STRIKE, UNKNOT9_STRIKE, WORDS9, WORDS9_STRIKE } from '../src/art/ratking_action';
import { FLOOD, SWARM9 } from '../src/art/ratking_action_fx';
import { ARENA, BITE_PASS, LEAD, ROLL_PASS, UNKNOT_PASS, WORDS_PASS, arenaScene, biteScene, rollScene, unknotScene, wordsScene } from '../src/dev/ratking_action_scene';
import type { View } from '../src/dev/ratking_action_scene';
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
type Scene = (view: View, t: number, w: number, h: number, cx: number, cy: number) => Px;
const SKIP = 0.2;
/** A part: a scene `k` times as big, his floor point at (cx, cy) of the scene; played from `from`, `slow` times slower. */
function part(scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = SKIP, slow = 1): Part {
  if (slow === 1 && from === SKIP) long -= SKIP;
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  return { long: long * slow, title, line, frame: (t) => { const p = scene(view, from + t / slow, w, h, cx, cy); return k === 1 ? p : cut(scaled(p, k), 0, 0, W, H); } };
}
const strike = (scene: Scene, view: View, k: number, cx: number, cy: number, s: readonly [number, number], title: string, line: string, after = 0.35): Part => part(scene, view, k, cx, cy, s[1] - s[0] + 0.35 + after, title, line, LEAD + s[0] - 0.35, 2);
/** A stretch of the fight over the whole cistern, from `a` to `b` seconds of it. */
const arena = (a: number, b: number, title: string, line: string): Part => ({ long: b - a, title, line, frame: (t) => arenaScene(a + t, W, H, 600, 384) });
// (his fix, 2 Nov 2026: the sluices the cistern's own, opening on their own; his roll back in their place: docs/mockups/action_fixes)
const HALF = 'THE STRIKES · HALF SPEED';
export const parts: Part[] = [
  arena(0, ARENA.open2 - 0.2, 'THE SLUICES OPEN ON THEIR OWN · THE WHOLE CISTERN FROM ABOVE', `The lanes marked first, the gates grinding open · the flood, ${FLOOD.runs} seconds, full of rats · the dry ledges between are safe`),
  arena(ARENA.open2 - 0.2, ARENA.long, 'AGAIN, WHILE HE ROLLS', 'Off the ledge out of his ball’s way · back up before the gates burst'),
  part(rollScene, 'front', 2, 100, 106, ROLL_PASS, 'HIS ROLL · FROM IN FRONT', `Curled into a ball, spinning up, HELD · off in 2 frames · ${ROLL9.pace} tiles a second`),
  part(rollScene, 'back', 2, 96, 290, ROLL_PASS, 'HIS ROLL · FROM BEHIND', `His lane ${ROLL9.half * 2} wide · he bursts open where he stops, a ring ${ROLL9.endR} round`),
  part(biteScene, 'front', 2, 230, 150, BITE_PASS, 'THE BITE · FROM IN FRONT', `The heap rears, the front three jaws wide, HELD · they leap ${BITE9.lunge} tiles on their tails in 2 frames: ${BITE9.arc}°, ${BITE9.reach} tiles`),
  part(biteScene, 'back', 2, 250, 230, BITE_PASS, 'THE BITE · FROM BEHIND', 'Out of the wedge while it is held · they bite down, shake, and are hauled back by their tails'),
  part(wordsScene, 'front', 2, 150, 100, WORDS_PASS, 'STOLEN WORDS · FROM IN FRONT', `A word of your own kind gathers · its line follows you, then LOCKS · step out · spat in 2 frames, ${WORDS9.speed} tiles a second`),
  part(wordsScene, 'back', 2, 200, 240, WORDS_PASS, 'STOLEN WORDS · FROM BEHIND', `It bursts where its line ends: ${WORDS9.burst} tiles round`),
  part(unknotScene, 'front', 2, 170, 150, UNKNOT_PASS, 'UNKNOT · FROM IN FRONT', `Swollen, tense, HELD · they BURST outward in 2 frames · ${SWARM9.rats} rats stream past you and knot again`),
  part(unknotScene, 'back', 2, 250, 260, UNKNOT_PASS, 'UNKNOT · FROM BEHIND', 'The swarm runs over you (it bites) · they knot again on your far side'),
  strike(rollScene, 'front', 2, 100, 106, ROLL9_STRIKE, HALF, 'His roll: spinning in place, then off the line in 2 frames, smeared', 0.6),
  strike(biteScene, 'front', 3, 150, 100, BITE9_STRIKE, HALF, 'The bite: held, then out to the end of their tails in 2 frames'),
  strike(wordsScene, 'front', 3, 150, 120, WORDS9_STRIKE, HALF, 'The word spat: his head thrust down in 2 frames', 0.5),
  strike(unknotScene, 'front', 3, 180, 110, UNKNOT9_STRIKE, HALF, 'The burst: every rat flung out in 2 frames', 0.45),
];

if (process.argv[1]?.endsWith('ratking_action_film.ts')) {
  const [out = 'ratking_action.mp4', mode = ''] = process.argv.slice(2);
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
    const dir = mkdtempSync(join(tmpdir(), 'ratking_captions_'));
    const filters: string[] = [];
    let at = 0;
    parts.forEach((p, i) => {
      writeFileSync(`${dir}/t${i}.txt`, p.title);
      writeFileSync(`${dir}/l${i}.txt`, p.line);
      const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
      filters.push(`drawtext=fontfile=${font}:expansion=none:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
      filters.push(`drawtext=fontfile=${font2}:expansion=none:textfile=${dir}/l${i}.txt:x=18:y=${H}-44:fontsize=18:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
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
