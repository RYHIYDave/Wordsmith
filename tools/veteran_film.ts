// THE VETERAN'S MOVES, A FILM FOR THE OWNER (docs/mockups/brawler_looks/pictures/veteran_moves.mp4), made outside a browser
// (dev/veteran_scene.ts): every move of his from in front and from behind side by side, at the arena's scale with a
// stand-in foe; then his six combos, each in a row with the globes filling over him; then the biggest blows at half speed.
// Captioned. 30 frames a second, H.264. Nothing of the game imports it.
//   npx tsx tools/veteran_film.ts <out.mp4>
//   npx tsx tools/veteran_film.ts <dir> stills <part>:<frame>,...   (single pictures to look at)
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { scene } from '../src/dev/veteran_scene';
import { VET_FILM } from '../src/dev/veteran_plays';
import type { FilmPart } from '../src/dev/veteran_plays';
import { png } from './king_png';

const W = 1200;
const H = 676;
const FPS = 30;

/** A part's picture at a frame: one view or two side by side, each made `k` times as big (whole pixels). */
function frameOf(p: FilmPart, i: number): Px {
  const out = new Px(W, H);
  const G = p.from + i * p.speed;
  const views = p.views;
  const pw = Math.floor(W / views.length);
  const gw = Math.floor(pw / p.k);
  const gh = Math.ceil(H / p.k);
  views.forEach((v, n) => {
    const s = scene(p.play, G, { w: gw, h: gh, view: v, sy: p.sy, ahead: p.ahead });
    for (let y = 0; y < H; y++) {
      const sy = Math.min(gh - 1, Math.floor(y / p.k));
      for (let x = 0; x < pw; x++) {
        const sx = Math.min(gw - 1, Math.floor(x / p.k));
        const si = (sy * gw + sx) * 4;
        const di = (y * W + n * pw + x) * 4;
        out.d[di] = s.d[si];
        out.d[di + 1] = s.d[si + 1];
        out.d[di + 2] = s.d[si + 2];
        out.d[di + 3] = 255;
      }
    }
    // (a dark line between two views)
    if (n > 0) for (let y = 0; y < H; y++) for (let t = -1; t <= 1; t++) {
      const di = (y * W + n * pw + t) * 4;
      out.d[di] = 8;
      out.d[di + 1] = 6;
      out.d[di + 2] = 16;
    }
  });
  return out;
}
const framesOf = (p: FilmPart): number => Math.round(p.long / p.speed);

const [out = 'veteran_moves.mp4', mode = '', which = ''] = process.argv.slice(2);
const parts = VET_FILM;
let total = 0;
for (const p of parts) total += framesOf(p);
console.log(parts.length, 'parts,', total, 'frames,', (total / FPS).toFixed(1), 's');
if (mode === 'stills') {
  mkdirSync(out, { recursive: true });
  for (const w of which.split(',').filter(Boolean)) {
    const [a, b] = w.split(':').map(Number);
    writeFileSync(`${out}/p${a}_${b}.png`, png(frameOf(parts[a], b)));
  }
} else if (mode === 'list') {
  parts.forEach((p, i) => console.log(i, framesOf(p), p.title, '|', p.line));
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'veteran_captions_'));
  const filters: string[] = [];
  let at = 0;
  parts.forEach((p, i) => {
    const long = framesOf(p) / FPS;
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=28:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.7:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${H}-46:fontsize=21:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.7:boxborderw=8${en}`);
    if (p.views.length === 2) {
      writeFileSync(`${dir}/a.txt`, 'from in front');
      writeFileSync(`${dir}/b.txt`, 'from behind');
      filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/a.txt:x=18:y=60:fontsize=20:fontcolor=0xa8a2d8:box=1:boxcolor=0x07060c@0.6:boxborderw=5${en}`);
      filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/b.txt:x=${W / 2 + 18}:y=60:fontsize=20:fontcolor=0xa8a2d8:box=1:boxcolor=0x07060c@0.6:boxborderw=5${en}`);
    }
    at += long;
  });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = Buffer.alloc(W * H * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of parts.entries()) {
      const N = framesOf(p);
      for (let f = 0; f < N; f++) {
        const px = frameOf(p, f);
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
