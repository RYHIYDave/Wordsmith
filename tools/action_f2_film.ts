// THE FLOOR 2 ACTION FILM (docs/mockups/action_f2/pictures/action_f2.mp4), made outside a browser: the cultist's fire sigil and
// its pillar with the knight, from in front and from behind, then at half speed; the Shade's frost rake and its rime, from in front
// and from behind, then at half speed; the Headsman BEFORE and AFTER his axe was mended, side by side, in his walk, his lunge (and
// its wind-down at half speed), his flurry and his wheel. Captioned. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_f2_film.ts <out.mp4> [stills <dir> <seconds,...>]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { SIGIL_SLAM } from '../src/art/monster_cultist';
import { RIME, SIGIL, SIGIL_LONG } from '../src/art/action_f2_fx';
import { SHADE_HIT } from '../src/art/new_mobs3';
import { H2_HALT, H2_LUNGE_HIT, H2_PACE, H2_SET_OFF, H2_WALK_FPS, H2_WHEEL, H2_SHIFT } from '../src/art/headsman2_moves';
import { tombFloor } from '../src/dev/action_f1_scene';
import { FROST_BACK, FROST_FRONT, LEAD, SIGIL_BACK, SIGIL_FRONT, frostScene, headsmanFrame, sigilScene } from '../src/dev/action_f2_scene';
import type { Pass } from '../src/dev/action_f2_scene';
import { cut, knight, lay, scaled, shadow } from '../src/dev/king_scene';
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
/** A scene made `k` times as big to fill the film (whole pixels). */
const big = (p: Px, k: number): Px => (k === 1 ? p : cut(scaled(p, k), 0, 0, W, H));
const CAST_LONG = SIGIL_SLAM + 0.75;

// THE CULTIST: a scene of 600 by 338 picture pixels, twice as big (the pillar is twice the knight's height)
function sigilPart(p: Pass, title: string): Part {
  const w = 600;
  const h = 338;
  const cx = 300 - (p.view === 'front' ? 30 : -20);
  const cy = p.view === 'front' ? 270 : 280;
  const base = tombFloor(w, h, cx, cy);
  return { long: LEAD + SIGIL_SLAM + SIGIL_LONG - 0.6, title, line: 'Raises its fire and traces a ring: the same ring burns under you. Holds. Slams: the pillar. The floor burns on', frame: (t) => big(sigilScene(p, t, base, cx, cy), 2) };
}
// (half speed, closer: the trace, the hold and the slam, three times as big)
function sigilSlow(p: Pass): Part {
  const w = 600;
  const h = 338;
  const cx = 270;
  const cy = 270;
  const base = tombFloor(w, h, cx, cy);
  const a = LEAD + 0.1;
  const b = LEAD + SIGIL_SLAM + 0.45;
  return { long: (b - a) * 2, title: 'THE FIRE SIGIL · HALF SPEED', line: 'The ring traced round, in the air and on the floor; held; the slam in ONE frame; the pillar in two', frame: (t) => big(sigilScene(p, a + t / 2, base, cx, cy), 2) };
}
// THE SHADE: a scene of 300 by 169 picture pixels, four times as big (it is small: a mob that comes in threes)
function frostPart(p: Pass, title: string, until: number): Part {
  const w = 300;
  const h = 169;
  const cx = 150;
  const cy = 98;
  const base = tombFloor(w, h, cx, cy);
  return { long: until, title, line: `Claws raised, frost gathering, cold falling off them; the rake; rime on the floor (${RIME.lie} s): it slows`, frame: (t) => big(frostScene(p, t, base, cx, cy), 4) };
}
function frostSlow(p: Pass): Part {
  const w = 200;
  const h = 113;
  const cx = 100;
  const cy = 66;
  const base = tombFloor(w, h, cx, cy);
  const a = LEAD;
  const b = LEAD + SHADE_HIT + 0.45;
  return { long: (b - a) * 2, title: 'THE SHADE’S FROST RAKE · HALF SPEED', line: 'The rake as it was: the claws raised and held, gathering frost; the rake; the rime spreading', frame: (t) => big(frostScene(p, a + t / 2, base, cx, cy), 6) };
}

// THE HEADSMAN, BEFORE AND AFTER: two panels side by side, each 300 by 338 picture pixels, twice as big
type Beat = { move: string; long: number; carry?: number; shift?: readonly [number, number] };
/** Where he is, `t` seconds into a list of beats: which move, how far into it, and how far the game has carried him (tiles forward). */
function beatAt(beats: Beat[], t: number): { move: string; at: number; x: number } {
  let x = 0;
  let s = t;
  for (const b of beats) {
    if (s < b.long || b === beats[beats.length - 1]) return { move: b.move, at: Math.min(s, b.long - 1e-3), x: x + (b.carry ?? 0) * Math.min(s, b.long) };
    s -= b.long;
    x += (b.carry ?? 0) * b.long + (b.shift?.[0] ?? 0);
  }
  return { move: 'stand', at: 0, x };
}
function headsmanPart(title: string, line: string, beats: Beat[], slow = 1, from = 0, view: 'front' | 'back' = 'front'): Part {
  const pw = 300;
  const ph = 338;
  const panel = (was: boolean, t: number): Px => {
    const cx = 92;
    const cy = view === 'front' ? 250 : 300;
    const base = tombFloor(pw, ph, cx, cy);
    const { move, at, x } = beatAt(beats, t);
    const px = new Px(pw, ph);
    px.d.set(base.d);
    const f = headsmanFrame(was, move, move === 'walk' ? Math.floor(at * H2_WALK_FPS) / H2_WALK_FPS : move === 'stand' ? Math.floor(at * 10) / 10 : at, view);
    const [X, Y] = view === 'front' ? [cx + 32 * x, cy + 16 * x] : [cx + 32 * x, cy - 16 * x];
    // (the knight, for size, off to the side he faces)
    const kx = cx + 32 * (3.2 + 2.4);
    const ky = view === 'front' ? cy + 16 * (3.2 - 2.4) : cy - 16 * (3.2 - 2.4) - 40;
    shadow(px, kx, ky, 9);
    shadow(px, X, Y, 24);
    const k = knight(view === 'front' ? 'back' : 'front', Math.floor(t * 6));
    if (ky < Y) lay(px, k, kx, ky, 1, undefined, true);
    lay(px, f, X, Y);
    if (ky >= Y) lay(px, k, kx, ky, 1, undefined, true);
    // (BEFORE / AFTER, in the panel's corner: drawn by ffmpeg's captions)
    return px;
  };
  const long = beats.reduce((a, b) => a + b.long, 0) - from;
  return {
    long: long * slow,
    title,
    line,
    frame: (t) => {
      const tt = from + t / slow;
      const both = new Px(pw * 2, ph);
      both.blit(panel(true, tt), 0, 0);
      both.blit(panel(false, tt), pw, 0);
      for (let y = 0; y < ph; y++) both.set(pw, y, '#07060c').set(pw - 1, y, '#07060c');
      return big(both, 2);
    },
  };
}
const WALKING: Beat[] = [
  { move: 'stand', long: 0.5 },
  { move: 'setOff', long: H2_SET_OFF, carry: H2_PACE },
  { move: 'walk', long: 1.0, carry: H2_PACE },
  { move: 'halt', long: H2_HALT, carry: H2_PACE },
  { move: 'stand', long: 0.6 },
  { move: 'setOff', long: H2_SET_OFF, carry: H2_PACE },
  { move: 'walk', long: 0.67, carry: H2_PACE },
  { move: 'halt', long: H2_HALT, carry: H2_PACE },
  { move: 'stand', long: 0.4 },
];

const parts: Part[] = [
  sigilPart(SIGIL_FRONT, 'THE CULTIST’S FIRE SIGIL · FROM IN FRONT'),
  sigilPart(SIGIL_BACK, 'THE CULTIST’S FIRE SIGIL · FROM BEHIND'),
  sigilSlow(SIGIL_FRONT),
  frostPart(FROST_FRONT, 'THE SHADE’S RAKE, COLD · FROM IN FRONT', LEAD + SHADE_HIT + RIME.lie + 0.3),
  frostPart(FROST_BACK, 'THE SHADE’S RAKE, COLD · FROM BEHIND', LEAD + SHADE_HIT + 1.6),
  frostSlow(FROST_FRONT),
  headsmanPart('THE HEADSMAN · WALKING AND STANDING · BEFORE | AFTER', 'Before: the blade turns over in his hand each time he sets off or stops. After: held as his guard holds it', WALKING),
  headsmanPart('THE HEADSMAN · HIS LUNGE · BEFORE | AFTER', 'Before: whipped up over his head, the blade flipping round the haft. After: brought back round low, held firm', [{ move: 'stand', long: 0.3 }, { move: 'attack', long: 1.5 }, { move: 'stand', long: 0.4 }]),
  headsmanPart('THE HEADSMAN · HIS LUNGE FROM BEHIND · BEFORE | AFTER', 'From behind: the same mend', [{ move: 'stand', long: 0.2 }, { move: 'attack', long: 1.5 }, { move: 'stand', long: 0.3 }], 1, 0, 'back'),
  headsmanPart('THE LUNGE’S WIND-DOWN · HALF SPEED · BEFORE | AFTER', 'Before: the blade turns 60 degrees round the haft in one frame. After: it turns with the haft', [{ move: 'attack', long: 1.5 }], 2, H2_LUNGE_HIT + 0.1),
  headsmanPart('THE HEADSMAN · HIS FLURRY · BEFORE | AFTER', 'The edge leading each cut, turned in his hands smoothly between them, never flipped', [{ move: 'stand', long: 0.3 }, { move: 'flurry', long: 2.38 }, { move: 'stand', long: 0.3, shift: H2_SHIFT.flurry }]),
  headsmanPart('THE HEADSMAN · HIS AXE WHEEL · BEFORE | AFTER', 'The same frames; between them, where the wheel of fire is drawn, the haft no longer swings out of the wheel', [{ move: 'stand', long: 0.3 }, { move: 'wheel', long: H2_WHEEL.long }, { move: 'stand', long: 0.3 }]),
];
void SIGIL;

const [out = 'action_f2.mp4', mode = ''] = process.argv.slice(2);
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
  const dir = mkdtempSync(join(tmpdir(), 'action_f2_captions_'));
  const filters: string[] = [];
  let at = 0;
  parts.forEach((p, i) => {
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${font}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=26:fontcolor=0xf0e8d0:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${font2}:textfile=${dir}/l${i}.txt:x=18:y=${H}-44:fontsize=21:fontcolor=0xd8d2e6:box=1:boxcolor=0x07060c@0.65:boxborderw=8${en}`);
    if (p.title.includes('BEFORE | AFTER')) {
      writeFileSync(`${dir}/b.txt`, 'BEFORE');
      writeFileSync(`${dir}/a.txt`, 'AFTER (MENDED)');
      filters.push(`drawtext=fontfile=${font}:textfile=${dir}/b.txt:x=18:y=60:fontsize=24:fontcolor=0xff9a9a:box=1:boxcolor=0x07060c@0.65:boxborderw=6${en}`);
      filters.push(`drawtext=fontfile=${font}:textfile=${dir}/a.txt:x=618:y=60:fontsize=24:fontcolor=0xb8f0b0:box=1:boxcolor=0x07060c@0.65:boxborderw=6${en}`);
    }
    at += p.long;
  });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = Buffer.alloc(W * H * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of parts.entries()) {
      const frames = Math.round(p.long * FPS);
      for (let f = 0; f < frames; f++) {
        const px = p.frame(f / FPS);
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
