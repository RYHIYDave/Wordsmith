// THE WARRIOR'S BATTLE AXE AND WARHAMMER, STEP 1: THE PICTURES (the art chat's helper, 9 Nov 2026;
// docs/mockups/warrior_weapons/README.md). Paints each of the six takes (src/art/warrior_up_weapons.ts): alone, held by him in
// his guard from his eight sides and on his back in town (his scarf's two ends hung as the game hangs them, engine/tails.ts),
// at the top of its tap's wind-up, in flight, and as an item at its four rarities, in the bag and on the floor
// (src/dev/warrior_weapons_items.ts); writes each as a PNG with its clear background, and what the checks find, for
// tools/warrior_weapons_pics.py to lay out with captions. Nothing of the game imports it.
//   npx tsx tools/warrior_weapons_pics.ts <dir>

// @ts-ignore - node typings are not part of this project
import { deflateSync } from 'node:zlib';
// @ts-ignore
import { mkdirSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { Tails } from '../src/engine/tails';
import type { TailRoot } from '../src/engine/tails';
import { WARRIOR_TAILS } from '../src/art/hero_warrior';
import { CANVAS3 } from '../src/art/skin';
import { WU_SIDES } from '../src/art/warrior_up';
import type { WuSide } from '../src/art/warrior_up';
import { wuTailsFacing } from '../src/art/warrior_up_art';
import { TAKES, TAKE_IDS, armedThrough, handsOnHaft, paintAlone, paintHold, takeSeen } from '../src/art/warrior_up_weapons';
import type { ArmedFrame, Hold, TakeId } from '../src/art/warrior_up_weapons';
import { paintWeaponItem } from '../src/dev/warrior_weapons_items';
import { paintWithoutCanvas } from '../tests/helpers';

declare const process: { argv: string[] };
paintWithoutCanvas();

// ---- a PNG with its see-through kept ----
const TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();
function crc(b: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = TABLE[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  dv.setUint32(8 + data.length, crc(out.subarray(4, 8 + data.length)));
  return out;
}
function pngRGBA(px: Px): Uint8Array {
  const raw = new Uint8Array((px.w * 4 + 1) * px.h);
  for (let y = 0; y < px.h; y++) raw.set(px.d.subarray(y * px.w * 4, (y + 1) * px.w * 4), y * (px.w * 4 + 1) + 1);
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, px.w);
  dv.setUint32(4, px.h);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const sig = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
  const parts = [sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 6 })), chunk('IEND', new Uint8Array(0))];
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

// ---- him, his scarf's ends hung as the game hangs them ----
/** The pictures' canvas: the game's hero canvas with room on either side, his feet at (PAX, PAY). */
const W = CANVAS3.w + 16;
const H = CANVAS3.h;
const PAX = CANVAS3.ax + 8;
const PAY = CANVAS3.ay;
const TAIL_PW = 192;
const TAIL_PH = 152;
const TAIL_HW = 96;
const TAIL_UP = 112;

/** A held pose of him from one side, his scarf's two ends hung from it and settled (stepped as the game steps them, 1.5 s). */
function still(f: ArmedFrame, side: WuSide): Px {
  const dx = PAX - f.ax;
  const tails = new Tails(WARRIOR_TAILS);
  const roots: TailRoot[] = (f.tails ?? []).map((r) => ({ ...r, x: (r.x + dx) / 2, y: r.y / 2 }));
  for (let i = 0; i < 90; i++) tails.step(1 / 60, roots, PAX / 2, PAY / 2, wuTailsFacing(side), 0, 0);
  const out = new Px(W, H);
  const lay = (over: boolean): void => {
    const buf = new Uint8ClampedArray(TAIL_PW * TAIL_PH * 4);
    if (!tails.paint(buf, over)) return;
    for (let y = 0; y < TAIL_PH; y++) for (let x = 0; x < TAIL_PW; x++) {
      const si = (y * TAIL_PW + x) * 4;
      if (buf[si + 3] === 0) continue;
      const X = x + PAX - TAIL_HW;
      const Y = y + PAY - TAIL_UP;
      if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
      const di = (Y * W + X) * 4;
      out.d[di] = buf[si];
      out.d[di + 1] = buf[si + 1];
      out.d[di + 2] = buf[si + 2];
      out.d[di + 3] = 255;
    }
  };
  lay(false);
  for (let y = 0; y < f.px.h; y++) for (let x = 0; x < f.px.w; x++) {
    const si = (y * f.px.w + x) * 4;
    if (f.px.d[si + 3] === 0) continue;
    const X = x + dx;
    if (X < 0 || X >= W) continue;
    const di = (y * W + X) * 4;
    for (let c = 0; c < 4; c++) out.d[di + c] = f.px.d[si + c];
  }
  lay(true);
  return out;
}

// ---- the floor, as a dungeon's: its stone diamonds (32 by 16 game pixels, two picture pixels to one) ----
const STONE = ['#1b1838', '#221f46', '#2a2652', '#1e1b40'];
const SEAM = '#121028';
function floor(w: number, h: number): Px {
  const p = new Px(w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    // (which tile a pixel is on: the floor's own two ways, each tile 64 by 32 picture pixels on the screen)
    const u = x / 64 + y / 32;
    const v = y / 32 - x / 64;
    const fu = u - Math.floor(u);
    const fv = v - Math.floor(v);
    const seam = fu < 0.03 || fv < 0.03;
    const t = (Math.floor(u) * 7 + Math.floor(v) * 13) & 3;
    p.set(x, y, seam ? SEAM : STONE[t]);
  }
  return p;
}

// ---------------------------------------------------------------------------------------------

const dir = process.argv[2];
mkdirSync(dir, { recursive: true });
const save = (name: string, px: Px): void => writeFileSync(`${dir}/${name}.png`, pngRGBA(px));
const said: Record<string, unknown> = { canvas: { w: W, h: H, ax: PAX, ay: PAY }, takes: {} };

for (const id of TAKE_IDS) {
  const take = TAKES[id];
  const key: Hold = take.kind === 'axe' ? 'cleave' : 'smash';
  const checks: Record<string, unknown> = {};
  const look = (hold: Hold, side: WuSide): void => {
    const f = paintHold(take, hold, side);
    save(`${id}_${hold}_${side}`, still(f, side));
    const seen = takeSeen(f);
    (checks[`${hold}:${side}`] = { head: seen.head, all: seen.all, through: armedThrough(f), hands: hold === 'town' ? [] : handsOnHaft(f) });
  };
  for (const side of WU_SIDES) look('guard', side);
  for (const side of WU_SIDES) look('town', side);
  for (const side of ['front', 'side', 'toward'] as WuSide[]) look(key, side);
  // alone: upright, its flat to the eye, and turned; in flight (an axe thrown, spinning flat)
  for (const turn of [0, 50]) save(`${id}_alone_${turn}`, paintAlone(take, 'stand', turn, { w: 120, h: 120 }, 60, 104).px);
  const flight = take.kind === 'axe' ? [0, 45, 90, 135, 180, 225, 270, 315] : [0, 45, 90, 135];
  for (const turn of flight) save(`${id}_${take.kind === 'axe' ? 'fly' : 'turn'}_${turn}`, paintAlone(take, take.kind === 'axe' ? 'fly' : 'stand', turn, { w: 120, h: 120 }, 60, 104).px);
  // as an item: its picture at each rarity, and lying on the floor as the game lays loot (lifted 4 game pixels)
  const ground = floor(320, 72);
  for (let r = 0; r < 4; r++) {
    const pic = paintWeaponItem(id, r as 0);
    save(`${id}_item_${r}`, pic);
    // (its middle, where the game anchors it, 4 game pixels above the floor point under it, 52 down the patch)
    ground.blit(pic, 24 + r * 76, 52 - 8 - 16);
  }
  save(`${id}_floor`, ground);
  (said.takes as Record<string, unknown>)[id] = { name: take.name, kind: take.kind, letter: take.letter, key, checks, flight };
}
writeFileSync(`${dir}/said.json`, JSON.stringify(said, null, 1));
console.log(`written to ${dir}`);
