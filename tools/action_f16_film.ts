// THE FLOORS 16 TO 19 ACTION FILM (docs/mockups/action_f16/pictures/action_f16.mp4), made outside a browser: the gardener's hedge cut, the
// groom's whistle and his horse, the palace guard's thrust and drill (the Swan Gardens), the masked dancers' partner throw (the masque's
// ballroom), the king's knight's rallying banner (the King's hall), each with the knight, from in front and from behind, each strike at half
// speed; the horse's line and the banner's reach also seen whole, from higher up. Captioned. Frames are piped to ffmpeg. Nothing of the game
// imports it.
//   npx tsx tools/action_f16_film.ts <out.mp4> [stills <dir> <seconds,...> [parts] | count]
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Px } from '../src/engine/px';
import { HEDGE, HEDGE_HITS } from '../src/art/action_f16_gardener';
import { LOOSE, WHISTLE_HIT } from '../src/art/action_f16_groom';
import { DRILL, DRILL_HITS, THRUST9_HIT } from '../src/art/action_f16_guard';
import { LANE_LONG, THROW, THROW_HIT } from '../src/art/action_f16_dancer';
import { BANNER, BANNER_HIT } from '../src/art/action_f16_knight';
import { DRILL_PASS, HEDGE_PASS, LEAD, THROW_PASS, THRUST_PASS, WHISTLE_PASS, bannerScene, drillScene, hedgeScene, standInFloor, throwScene, thrustScene, whistleScene } from '../src/dev/action_f16_scene';
import type { Ground, View } from '../src/dev/action_f16_scene';
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
/** A part: a scene of `W / k` by `H / k` picture pixels on `ground`, its middle at (cx, cy), `k` times as big; played from `from`, `slow` times slower, for `long` seconds of the scene. */
function part(ground: Ground, scene: Scene, view: View, k: number, cx: number, cy: number, long: number, title: string, line: string, from = 0, slow = 1): Part {
  const w = Math.ceil(W / k);
  const h = Math.ceil(H / k);
  let base: Px | null = null;
  return { long: long * slow, title, line, frame: (t) => {
    base ??= standInFloor(ground, w, h, cx, cy);
    const p = scene(view, from + t / slow, base, cx, cy);
    return k === 1 ? p : cut(scaled(p, k), 0, 0, W, H);
  } };
}
const struckW: Scene = (v, t, b, cx, cy) => whistleScene(v, t, b, cx, cy, true);
const dodgeW: Scene = (v, t, b, cx, cy) => whistleScene(v, t, b, cx, cy, false);
const struckT: Scene = (v, t, b, cx, cy) => throwScene(v, t, b, cx, cy, true);
const dodgeT: Scene = (v, t, b, cx, cy) => throwScene(v, t, b, cx, cy, false);
const CUT_AT = LEAD + BANNER_HIT + 2.2;
const cutB: Scene = (v, t, b, cx, cy) => bannerScene(v, t, b, cx, cy, CUT_AT);
const plantB: Scene = (v, t, b, cx, cy) => bannerScene(v, t, b, cx, cy, -1);
export const parts: Part[] = [
  part('garden', hedgeScene, 'front', 3, 180, 110, HEDGE_PASS - 0.3, 'THE HUSHED GARDENER’S HEDGE CUT · FROM IN FRONT', 'Shears up and open, HELD · a snip, stepping in · another · crouched, HELD · a scissoring leap: the blades into the lawn'),
  part('garden', hedgeScene, 'back', 3, 180, 150, HEDGE_PASS - 0.6, 'THE HEDGE CUT · FROM BEHIND', `Each snip 2 frames, smeared, ${HEDGE.snip.fwd[1]} tiles out · the leap's burst ${HEDGE.r} tiles round · on where he landed`),
  part('garden', hedgeScene, 'front', 3, 180, 110, HEDGE_HITS[2] - 0.45, 'THE HEDGE CUT · HALF SPEED', 'Three strikes, each two frames: down across, the backhand, the leap', LEAD + 0.5, 2),
  part('garden', struckW, 'front', 2, 280, 150, WHISTLE_PASS - 0.3, 'THE HUSHED GROOM LOOSES THE HORSE · FROM IN FRONT', 'Fingers to his mouth: the whistle HELD, the line marked · his arm flung out (2 frames) · the horse out of the mist behind him'),
  part('garden', dodgeW, 'back', 2, 280, 200, WHISTLE_PASS - 0.3, 'LOOSE THE HORSE · FROM BEHIND', `Get off the line (${LOOSE.half * 2} tiles wide) while he whistles · the horse gallops down it, ${LOOSE.pace} tiles a second, and is gone`),
  part('garden', struckW, 'front', 1, 600, 260, WHISTLE_PASS - 0.6, 'LOOSE THE HORSE · THE WHOLE LINE, FROM HIGHER UP', `The line ${LOOSE.lane} tiles long, from behind him through where you stood · the horse a little cousin of the Princess’s steed`, 0, 1),
  part('garden', struckW, 'front', 2, 280, 150, 0.95, 'LOOSE THE HORSE · HALF SPEED', 'The whistle held · the arm flung out in two frames, smeared · the horse bursts out', LEAD + WHISTLE_HIT - 0.45, 2),
  part('garden', thrustScene, 'front', 3, 190, 120, THRUST_PASS - 0.5, 'THE PALACE GUARD’S LONG THRUST, BY MOVEMENT 9', 'Drawn far back, HELD, its line marked · the lunge in 2 frames, smeared · carried on, drawn back'),
  part('garden', thrustScene, 'front', 3, 190, 120, 0.8, 'THE LONG THRUST · HALF SPEED', 'Held · the hips first, then thrust out its whole length in two frames', LEAD + THRUST9_HIT - 0.45, 2),
  part('garden', drillScene, 'front', 3, 190, 120, DRILL_PASS - 0.3, 'THE PALACE GUARD’S DRILL · FROM IN FRONT', 'Up over his head, HELD · the chop · wound round, HELD · the spin, a whole turn · raised, HELD · driven into the ground'),
  part('garden', drillScene, 'back', 3, 190, 150, DRILL_PASS - 0.3, 'THE DRILL · THE SWORD GUARD, FROM BEHIND', `The chop's strip ${DRILL.chop.fwd[1]} tiles · the spin ${DRILL.spin} tiles all round · the shockwave ${DRILL.wave} tiles round where it goes in`),
  part('garden', drillScene, 'front', 3, 190, 120, 1.55, 'THE DRILL · HALF SPEED', 'Each of its three strikes two frames, smeared: the spin, and the drive', LEAD + DRILL_HITS[1] - 0.25, 2),
  part('ballroom', struckT, 'front', 2, 300, 150, THROW_PASS - 0.6, 'THE MASKED DANCERS’ PARTNER THROW · FROM IN FRONT', 'He takes her hands; they whirl round, faster, HELD, the lane marked · flung (2 frames) · she spins down it like a top'),
  part('ballroom', dodgeT, 'back', 2, 300, 200, THROW_PASS - 0.8, 'THE PARTNER THROW · FROM BEHIND', `Off the lane (${THROW.half * 2} tiles wide) as they whirl · she is carried ${LANE_LONG.toFixed(1)} tiles, from ${THROW.pace} tiles a second, spinning`),
  part('ballroom', struckT, 'front', 2, 300, 150, 0.9, 'THE PARTNER THROW · HALF SPEED', 'The whirl at full speed · his arms thrown open in two frames, smeared · she is off', LEAD + THROW_HIT - 0.45, 2),
  part('hall', cutB, 'front', 2, 300, 268, CUT_AT + 1.7, 'THE KING’S KNIGHT’S RALLYING BANNER · FROM IN FRONT', 'Drawn off his back, raised high, HELD · driven into the floor (2 frames): a shockwave · it stands, its gold reach round it · cut down'),
  part('hall', plantB, 'back', 2, 300, 280, LEAD + BANNER_HIT + 1.6, 'THE RALLYING BANNER · FROM BEHIND', `The shockwave ${BANNER.wave} tiles round · while it stands, every enemy within ${BANNER.reach} tiles of it hits harder`),
  part('hall', cutB, 'front', 1, 600, 400, 3.0, 'THE RALLYING BANNER · ITS REACH, FROM HIGHER UP', 'Its gold glow on the floor where its reach is · strike it and cut it down: it splinters and falls', LEAD + BANNER_HIT - 0.2, 1),
  part('hall', plantB, 'front', 2, 300, 268, 0.8, 'THE RALLYING BANNER · HALF SPEED', 'Held aloft · driven down in two frames, smeared', LEAD + BANNER_HIT - 0.45, 2),
];

const [out = 'action_f16.mp4', mode = ''] = process.argv.slice(2);
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
    for (const k of at.length ? at : [0.2, 0.4, 0.6, 0.8]) writeFileSync(`${dir}/p${i}_${k.toFixed(2)}.png`, png(p.frame(Math.min(p.long - 1e-3, p.long * k))));
  });
} else if (mode === 'count') {
  parts.forEach((p, i) => console.log(i, p.long.toFixed(2), p.title));
} else {
  const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
  const font2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
  const dir = mkdtempSync(join(tmpdir(), 'action_f16_captions_'));
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
