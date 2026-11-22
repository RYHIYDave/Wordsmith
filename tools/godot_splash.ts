// THE GODOT PORT: ENDLESS MODE'S FANFARE, ITS SPLASH PICTURE AND ITS PIECES (godot/scripts/endless_splash.gd), from the game itself:
// the art chat's STAIR WITH NO BOTTOM as the release plays it (art/endless_splash.ts ENDLESS_SPLASH, picture 'stair'; art/
// endless_stair.ts STAIR_SCENE; ui/endless_splash_draw.ts), so that nothing is copied by hand.
//   godot/assets/endless/still.png   the picture, painted once, two picture pixels to a game pixel;
//   godot/assets/endless/stage.png   which stage of the moment each of its pixels wakes with (its red, 0 to 12): what is still asleep
//                                    is covered in the dark, and what wakes flashes;
//   godot/assets/endless/pieces.png  what lives in it, each a few times over (the torches' fire, the waypoint's light going round,
//                                    the far fire) and the lights added where light is (glowOf: the far fire's pink and gold, the
//                                    waypoint's cyan, a torch's at three sizes);
//   godot/assets/endless/splash.json its numbers: the moment, when each stage wakes and how big it is, the torches, the waypoint and
//                                    the far fire, the dust's numbers, the fanfare's times, the card's lines.
//   npx tsx tools/godot_splash.ts
import { mkdirSync, writeFileSync } from 'node:fs';
import { paintWithoutCanvas } from '../tests/helpers';
import { pngRGBA } from './mage_up_sheet';
import { Px } from '../src/engine/px';
import { gameSwitches } from './godot_switches';
import { ENDLESS_SPLASH, ES_FIRES, ES_FLAMES, ES_H, ES_W, ES_WAYS, endlessAsleep } from '../src/art/endless_splash';
import type { EndlessPatch } from '../src/art/endless_splash';
import { STAIR_SCENE, STAIR_VY_AT } from '../src/art/endless_stair';
import { ENDLESS_CARD, ENDLESS_CARD_WARN, ENDLESS_FANFARE } from '../src/ui/endless_fanfare';

paintWithoutCanvas();
gameSwitches();
if (!ENDLESS_SPLASH.on || ENDLESS_SPLASH.picture !== 'stair') throw new Error('the release plays another splash: see art/endless_splash.ts');
const S = STAIR_SCENE;
const OUT = 'godot/assets/endless';
mkdirSync(OUT, { recursive: true });

// THE PICTURE, and the stage each of its pixels wakes with
const p = S.paint();
const still = new Px(p.w, p.h);
const stage = new Px(p.w, p.h);
for (let i = 0; i < p.w * p.h; i++) {
  const v = p.c[i];
  if (v >= 0) {
    still.d[i * 4] = (v >> 16) & 255;
    still.d[i * 4 + 1] = (v >> 8) & 255;
    still.d[i * 4 + 2] = v & 255;
    still.d[i * 4 + 3] = 255;
  }
  stage.d[i * 4] = Math.max(0, Math.min(255, p.stage[i]));
  stage.d[i * 4 + 3] = 255;
}
writeFileSync(`${OUT}/still.png`, pngRGBA(still));
writeFileSync(`${OUT}/stage.png`, pngRGBA(stage));
// (the waking's own runs, to be sure the stage map covers what they cover)
const asleep = endlessAsleep(p);
let mismatch = 0;
for (let j = 0; j <= S.gates; j++) {
  let n = 0;
  for (let i = 0; i < asleep[j].length; i += 3) n += asleep[j][i + 2] - asleep[j][i + 1];
  let m = 0;
  for (let i = 0; i < p.w * p.h; i++) if (p.stage[i] >= j) m++;
  if (n !== m) mismatch++;
}
if (mismatch) throw new Error(`the stage map and the waking's runs differ on ${mismatch} stages`);

// WHAT LIVES IN IT, and the lights
const pieces: [string, Px, number, number][] = [];
const patchPx = (q: EndlessPatch): Px => {
  const o = new Px(q.w, q.h);
  for (let i = 0; i < q.w * q.h; i++) {
    const v = q.c[i];
    if (v < 0) continue;
    o.d[i * 4] = (v >> 16) & 255;
    o.d[i * 4 + 1] = (v >> 8) & 255;
    o.d[i * 4 + 2] = v & 255;
    o.d[i * 4 + 3] = 255;
  }
  return o;
};
for (let site = 0; site < S.flames; site++) for (let i = 0; i < ES_FLAMES; i++) {
  const q = S.paintFlame(site, i);
  pieces.push([`flame|${site}|${i}`, patchPx(q), q.x, q.y]);
}
for (let i = 0; i < ES_WAYS; i++) {
  const q = S.paintWay(i);
  pieces.push([`way|${i}`, patchPx(q), q.x, q.y]);
}
for (let i = 0; i < ES_FIRES; i++) {
  const q = S.paintFire(i);
  pieces.push([`fire|${i}`, patchPx(q), q.x, q.y]);
}
/** (ui/endless_splash_draw.ts glowOf) A round of light on black, in bands, rx by ry game pixels, at the picture's grain. */
const glowOf = (rx: number, ry: number, r: number, g0: number, b: number, bands: number): Px => {
  const w = rx * 4;
  const h = ry * 4;
  const o = new Px(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const d = Math.hypot((x + 0.5 - w / 2) / (w / 2), (y + 0.5 - h / 2) / (h / 2));
    const k = d >= 1 ? 0 : Math.ceil((1 - d) * bands) / bands;
    const i = (y * w + x) * 4;
    o.d[i] = Math.round(r * k * k);
    o.d[i + 1] = Math.round(g0 * k * k);
    o.d[i + 2] = Math.round(b * k * k);
    o.d[i + 3] = 255;
  }
  return o;
};
const FIRE_R = 50;
pieces.push(['glow|pink', glowOf(FIRE_R, Math.round(FIRE_R * 0.7), 255, 79, 138, 6), 0, 0]);
pieces.push(['glow|gold', glowOf(18, 13, 255, 208, 122, 4), 0, 0]);
pieces.push(['glow|cyan', glowOf(S.wayGlow[0], S.wayGlow[1], 34, 208, 224, 5), 0, 0]);
[12, 24, 46].forEach((r, k) => pieces.push([`glow|torch${k}`, glowOf(r, r, 255, 138, 42, r > 30 ? 5 : 4), 0, 0]));
const SW = 2048;
const at: Record<string, number[]> = {};
let cx = 0;
let cy = 0;
let rowH = 0;
const placed: { px: Px; x: number; y: number }[] = [];
for (const [key, px, x, y] of [...pieces].sort((a, b) => b[1].h - a[1].h)) {
  if (cx + px.w > SW) {
    cx = 0;
    cy += rowH + 1;
    rowH = 0;
  }
  placed.push({ px, x: cx, y: cy });
  at[key] = [cx, cy, px.w, px.h, x, y];
  cx += px.w + 1;
  rowH = Math.max(rowH, px.h);
}
const sheet = new Px(SW, cy + rowH);
for (const q of placed) for (let j = 0; j < q.px.h; j++) for (let i = 0; i < q.px.w; i++) {
  const o = (j * q.px.w + i) * 4;
  const d = ((q.y + j) * SW + q.x + i) * 4;
  for (let c = 0; c < 4; c++) sheet.d[d + c] = q.px.d[o + c];
}
writeFileSync(`${OUT}/pieces.png`, pngRGBA(sheet));

// ITS NUMBERS
const wake = Array.from({ length: S.gates + 1 }, (_, j) => S.wake(j));
const near = Array.from({ length: S.gates + 1 }, (_, k) => S.near(k));
// (a few of the dust's grains, to check the Godot side's reckoning of them against)
const dustSeen: number[][] = [];
for (const [k, land] of [[0, false], [3, false], [0, true]] as const) for (const a of [0.05, 0.3, 0.7]) for (let i = 0; i < 5; i++) {
  const d = S.dust(k, i, a, land);
  dustSeen.push([k, land ? 1 : 0, a, i, ...(d ? d.map((v) => Math.round(v * 1000) / 1000) : [-1])]);
}
writeFileSync(`${OUT}/splash.json`, JSON.stringify({
  w: p.w, h: p.h, esW: ES_W, esH: ES_H, vyAt: STAIR_VY_AT,
  moment: S.moment, gates: S.gates, wake, near,
  torches: S.torches, flames: S.flames, flameN: ES_FLAMES, wayN: ES_WAYS, fireN: ES_FIRES,
  wayAt: S.wayAt, wayStage: S.wayStage, wayGlow: S.wayGlow, fireAt: S.fireAt, fireR: FIRE_R,
  // (art/endless_stair.ts: the shaft's numbers its dust falls by)
  stair: { VX: p.w / 2, VY: 446, F: 600, RW: 3.2, Z0: 4, DZ: 3.6 },
  dustSeen,
  fanfare: { splash: ENDLESS_FANFARE.splash, skip: ENDLESS_FANFARE.skip, armed: ENDLESS_FANFARE.armed },
  card: ENDLESS_CARD, warn: ENDLESS_CARD_WARN,
  pieces: at,
}) + '\n');
console.log(`the endless splash: ${p.w}x${p.h} picture, ${S.gates} stages, ${pieces.length} pieces in a ${SW}x${sheet.h} sheet`);
