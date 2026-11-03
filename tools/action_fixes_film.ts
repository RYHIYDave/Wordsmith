// THE THREE FIXES' FILM (docs/mockups/action_fixes/pictures/action_fixes.mp4), made outside a browser, captioned: THE CARRION QUEEN'S
// DIVE (the area twice as wide; the rock bursting) with the knight, from in front and from behind, and its impact at half speed; THE
// RAT KING'S CISTERN FROM ABOVE, the sluices opening on their own while he fights and rolls, the knight on a ledge; HIS ROLL close,
// from in front and from behind, and at half speed; THE TWISTED DEER'S BRAMBLE CHARGE (its full gallop, its hedge of living bramble)
// with the knight, from in front and from behind, its gallop at half speed. Frames are piped to ffmpeg. Nothing of the game imports it.
//   npx tsx tools/action_fixes_film.ts <out.mp4>
import { spawn } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { QA_DIVE } from '../src/art/carrion_queen_action';
import { DIVE_PASS, LEAD as Q_LEAD, closeFloor, diveScene } from '../src/dev/action_f7_queen_scene';
import { ROLL9, ROLL9_FAR, ROLL9_HIT } from '../src/art/ratking_action';
import { FLOOD, SLUICES } from '../src/art/ratking_action_fx';
import { ARENA, LEAD as R_LEAD, ROLL_PASS, arenaScene, rollScene } from '../src/dev/ratking_action_scene';
import { CHARGE, CHARGE_HIT, HEDGE } from '../src/art/action_f9_pinewood';
import { CHARGE_PASS, WITHER_FROM, chargeScene, chargeTimes, standInFloor } from '../src/dev/action_f9_scene';
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
type View = 'front' | 'back';
const big = (p: Px, k: number): Px => (k === 1 ? p : cut(scaled(p, k), 0, 0, W, H));
const HALF = ' · HALF SPEED';

// THE CARRION QUEEN'S DIVE (her eyrie, twice the picture's pixels)
const QB = new Map<string, Px>();
function queen(view: View, cx: number, cy: number, from: number, long: number, title: string, line: string, slow = 1): Part {
  const k = 2;
  const key = `${view}${cx},${cy}`;
  if (!QB.has(key)) QB.set(key, closeFloor(view, W / k, Math.round(H / k), cx, cy));
  const base = QB.get(key) as Px;
  return { long: long * slow, title, line, frame: (t) => big(diveScene(view, from + t / slow, base, cx, cy), k) };
}
// THE RAT KING (his cistern: from above at the game's own pixels; his roll close)
function ratking(view: View, k: number, cx: number, cy: number, from: number, long: number, title: string, line: string, slow = 1): Part {
  const w = Math.round(W / k);
  const h = Math.round(H / k);
  return { long: long * slow, title, line, frame: (t) => big(rollScene(view, from + t / slow, w, h, cx, cy), k) };
}
const above = (a: number, b: number, title: string, line: string): Part => ({ long: b - a, title, line, frame: (t) => arenaScene(a + t, W, H, 600, 384) });
// THE TWISTED DEER (floor 9's pinewood, three times the picture's pixels)
function deer(view: View, cx: number, cy: number, from: number, long: number, title: string, line: string, slow = 1): Part {
  const k = 3;
  const base = standInFloor('pinewood', W / k, Math.round(H / k), cx, cy);
  return { long: long * slow, title, line, frame: (t) => big(chargeScene(view, from + t / slow, base, cx, cy), k) };
}
const cht = chargeTimes();

export const parts: Part[] = [
  queen('front', 170, 172, 0.2, DIVE_PASS - 0.2, 'THE CARRION QUEEN’S DIVE · FROM IN FRONT', `Up out of sight, HELD · the ground she strikes marked: ${QA_DIVE.r * 2} tiles across (was 3.2) · run clear of it`),
  queen('back', 170, 300, 0.2, DIVE_PASS - 0.2, 'HER DIVE · FROM BEHIND', 'Down in 2 frames · the rock bursts: dirt, grit and broken rock flung up, dust rolling out to the edge'),
  queen('front', 170, 172, Q_LEAD + QA_DIVE.hit - 0.2, 1.75, 'HER DIVE · THE IMPACT' + HALF, 'A fountain of rock · a ring of dust out to the edge · chunks falling back and bouncing · the dust hangs and drifts off', 2),
  above(0, ARENA.open2 - 0.2, 'THE RAT KING’S CISTERN · THE SLUICES OPEN ON THEIR OWN', `Not his move now: the lanes marked first · the gates grind open · ${FLOOD.runs} s of flood · the ledges stay dry`),
  above(ARENA.open2 - 0.2, ARENA.long, 'AGAIN, WHILE HE ROLLS', `Every ${SLUICES.every} s or so in a fight (here sooner) · off the ledge out of his ball's way · back up before the gates burst`),
  ratking('front', 2, 100, 106, 0.2, ROLL_PASS - 0.2, 'HIS ROLL, BACK AND BIGGER · FROM IN FRONT', `Curled into a ball, spinning up, HELD · off in 2 frames · ${ROLL9.pace} tiles a second (was 6.45) · his lane ${ROLL9.half * 2} wide (was 1.5)`),
  ratking('back', 2, 96, 290, 0.2, ROLL_PASS - 0.2, 'HIS ROLL · FROM BEHIND', `${ROLL9_FAR.toFixed(1)} tiles down the lane · he bursts open where he stops: a ring ${ROLL9.endR} tiles round`),
  ratking('front', 2, 100, 106, R_LEAD + ROLL9_HIT - 0.55, 1.15, 'HIS ROLL' + HALF, 'Spinning in place, HELD · off the line in 2 frames, smeared · barrelling down the lane', 2),
  deer('front', 200, 150, 0, CHARGE_PASS, 'THE TWISTED DEER’S BRAMBLE CHARGE · FROM IN FRONT', `Antlers down, HELD · off in 2 frames · a full gallop, ${CHARGE.pace} tiles a second · living bramble writhes up behind it`),
  deer('back', 200, 150, 0, CHARGE_PASS, 'THE BRAMBLE CHARGE · FROM BEHIND', `Its hedge a wall ${HEDGE.half * 2} tiles thick: dark stems, leaves, hooked thorns · it stands ${HEDGE.stays} s`),
  deer('front', 200, 150, cht.off - 0.25, CHARGE.until + 0.25 - (CHARGE_HIT - 0.25), 'ITS GALLOP' + HALF, 'Low and long · legs reaching far out in front and far back · gathering and stretching · mud kicked up', 2),
  deer('back', 200, 150, WITHER_FROM, 1.4, 'THE BRAMBLE WITHERS', `After ${HEDGE.stays} s it dies back into the ground`),
];

if (process.argv[1]?.endsWith('action_fixes_film.ts')) {
  const [out = 'action_fixes.mp4'] = process.argv.slice(2);
  let total = 0;
  for (const p of parts) total += p.long;
  console.log(parts.length, 'parts,', total.toFixed(1), 's');
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'fixes_captions_'));
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
