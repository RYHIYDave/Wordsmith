// FLOOR 2'S CLIFFS, IN THE LEDGE ROAD'S OWN ROCK (his words, 28 Nov 2026, of the first cliffs under the prison's walls: “No
// those cliffs look like shit.” … “And please fix the cliffs.  I mean no one would think that looks good.”). The Ledge Road's
// cliff face under the trail, which he called perfect (art/ledge.ts: “You got it that’s perfect”), is painted here for the
// prison's rock: the same strata lying a little aslant, broad patches of tone, ledges lit along their lip with their shadow
// under them, fissures wandering down (ledge.ts `rock`), turned to the light as each face is (the face to the left lit, the
// one to the right in shadow: terrain.ts hangShade), lost a little in the night's haze the further down (ledge.ts `hangRock`),
// and hanging further down than a screen, so that no sky is ever seen under a wall (ledge.ts HANG_TALL); in the night's
// colours, as dark as the prison's own stone under its dark. Two pictures the width of the whole floor, in picture pixels:
// godot/assets/looks/floor2_cliff_l.raw and _r.raw (RGB), made PNG by tools/godot_f2_night.py.
// npx tsx tools/godot_f2_cliff.ts
import { writeFileSync, readFileSync } from 'node:fs';
import { hash } from '../src/art/kit';
import { fbm, vnoise } from '../src/art/terrain';
import { L_ROCK } from '../src/art/ledge';

type RGB = [number, number, number];
const mixc = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const DEEP: RGB = [0x16, 0x10, 0x1f];

/** ledge.ts `rock`, as it is. */
function rock(shade: number, v: number, px: number): RGB {
  const sh = shade + (hash(px >> 1, Math.floor(v) >> 1, 921) - 0.5) * 0.35;
  const row = sh > 0.35 ? 0 : sh < -0.35 ? 2 : 1;
  const r = L_ROCK[row] as unknown as RGB[];
  const lv = v + px * 0.1 + 5 * Math.sin(px / 53) + 8 * (vnoise(px / 45, v / 35, 914) - 0.5);
  const b = lv / 15 + 0.8 * vnoise(px / 70, lv / 60, 915);
  const layer = Math.floor(b);
  const f = b - layer;
  let i = fbm(px / 45, lv / 38, 916) > 0.52 ? 2 : 1;
  if (hash(layer, Math.floor((px + 37 * layer) / 70), 917) > 0.5) {
    if (f > 0.9) i = 0;
    else if (f < 0.07) i = 3;
  }
  const c = vnoise(px / 6 + 2.5 * vnoise(v / 22, px / 70, 918), v / 50, 919);
  if (Math.abs(c - 0.5) < 0.03 && vnoise(px / 20, v / 30, 920) > 0.5) i = 3;
  let col = r[i];
  if (v < 3 && v >= 0) col = mixc(col, DEEP, 0.25);
  return col;
}

// (the night: the Ledge Road's daylight rock taken down to the prison's own stone under its dark, bluer, its tones kept apart
// so its layers, ledges and fissures still read; the haze it is lost in is the night sky's lowest colour, godot_f2_night.py)
const night = (c: RGB): RGB => [Math.max(0, c[0] - 45) * 0.4, Math.max(0, c[1] - 45) * 0.4, Math.max(0, c[2] - 35) * 0.62];
const HAZE: RGB = [14, 18, 43];
const cover = JSON.parse(readFileSync('godot/assets/looks/floor2_cover.json', 'utf8'));
// (as wide as the whole floor and a margin, in picture pixels; as tall as the hang)
const X0 = cover.x * 2 - 256;
const W = cover.w * cover.grain * 2 + 512;
const H = 640;
for (const [name, shade] of [['l', 1], ['r', -1]] as const) {
  const out = Buffer.alloc(W * H * 3);
  for (let v = 0; v < H; v++) {
    for (let x = 0; x < W; x++) {
      const px = X0 + x;
      let c = rock(shade, -v, px);
      c = night(c);
      c = mixc(c, HAZE, Math.min(0.42, (Math.floor((v / 500) * 6) / 6) * 0.5));
      const o = (v * W + x) * 3;
      out[o] = Math.round(c[0]);
      out[o + 1] = Math.round(c[1]);
      out[o + 2] = Math.round(c[2]);
    }
  }
  writeFileSync(`godot/assets/looks/floor2_cliff_${name}.raw`, out);
}
writeFileSync('godot/assets/looks/floor2_cliff.json', JSON.stringify({ x0: X0, w: W, h: H }));
console.log('cliffs', W, H, 'from', X0);
