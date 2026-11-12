// THE PICTURES OF FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW (art/reflections_up.ts): each frame the sheet and the film
// are made of, as a PNG, with where its feet are; tools/reflections_up_sheet.py lays them out with their words.
//   npx tsx tools/reflections_up_pics.ts <dir> [stills|film]
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import type { Px } from '../src/engine/px';
import { RIM_ALPHA, edge } from '../src/art/kit';
import { WU_RIM } from '../src/art/warrior_up';
import type { ClassId } from '../src/game/types';
import { GALLERY_MIRROR, SHATTER, SHATTER_CANVAS, STEP_CANVAS, STEP_MIRROR, STEP_OUT, mirrorPainted, shatterPainted, stepOutPainted } from '../src/art/reflections_fx';
import { glassAt, heroGlass, onHeroCanvas } from '../src/art/reflections_up';
import type { HeroGlass, Track } from '../src/art/reflections_up';

const CRC = (() => {
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
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 0xff] ^ (c >>> 8);
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
export function pngRGBA(px: Px): Uint8Array {
  const raw = new Uint8Array((px.w * 4 + 1) * px.h);
  for (let y = 0; y < px.h; y++) {
    raw[y * (px.w * 4 + 1)] = 0;
    raw.set(px.d.subarray(y * px.w * 4, (y + 1) * px.w * 4), y * (px.w * 4 + 1) + 1);
  }
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

const dir = process.argv[2] ?? 'tmpx/refl_up';
const what = process.argv[3] ?? 'stills';
mkdirSync(dir, { recursive: true });
const CLASSES: ClassId[] = ['warrior', 'ranger', 'mage', 'warlock', 'tinkerer', 'brawler'];
const index: Record<string, { file: string; ax: number; ay: number }> = {};
function save(key: string, px: Px, ax: number, ay: number): void {
  const file = `${key}.png`;
  writeFileSync(`${dir}/${file}`, pngRGBA(px));
  index[key] = { file, ax, ay };
}
/** The hero himself, as the game shows him: his painter's frame, with the friend's cyan edge (laid on where his painter left it off). */
function hero(h: HeroGlass, tr: Track, t: number, side: string): void {
  const f = tr.paint(t, side);
  let rim = false;
  for (let i = 3; i < f.px.d.length; i += 4) if (f.px.d[i] > 0 && f.px.d[i] < 255) rim = true;
  if (!rim) edge(f.px, WU_RIM, RIM_ALPHA);
  save(`${h.cls}_you_${tr.name.replace(/[^a-z0-9]+/gi, '_').slice(0, 24)}_${side}_${Math.round(t * 1000)}`, f.px, f.ax, f.ay);
}
function glass(h: HeroGlass, tr: Track, t: number, side: string, key: string): void {
  const g = glassAt(h, tr, t, side);
  save(key, g.px, g.ax, g.ay);
  console.log(`${key}: cracks ${g.cracks}, eyes ${g.eyes.length}`);
}

if (what === 'stills') {
  for (const cls of CLASSES) {
    const h = heroGlass(cls);
    const back = h.sides.includes('back') ? 'back' : h.sides[1];
    const three = h.sides.includes('toward') ? 'toward' : back;
    const t0 = 0.4 % Math.max(0.01, h.stand.long);
    hero(h, h.stand, t0, 'front');
    index[`${cls}_you`] = index[Object.keys(index).pop() as string];
    glass(h, h.stand, t0, 'front', `${cls}_stand_front`);
    glass(h, h.run, h.run.from + (h.run.long - h.run.from) * 0.3, 'front', `${cls}_run`);
    void three;
    glass(h, h.stand, t0, back, `${cls}_stand_back`);
    glass(h, h.tap, h.tap.hit ?? h.tap.long / 2, 'front', `${cls}_tap`);
    glass(h, h.hold, h.hold.hit ?? h.hold.long / 2, 'front', `${cls}_hold`);
    // (its stepping out, and its shattering, at a few moments)
    const src = { lurchLong: h.lurch.long, fig: (which: 'stand' | 'lurch', t: number) => onHeroCanvas(glassAt(h, which === 'lurch' ? h.lurch : h.stand, which === 'lurch' ? Math.min(t, h.lurch.long) : t, 'front')) };
    for (const t of [0.3, 0.8, 1.0, 1.25]) {
      const p = stepOutPainted(cls, t, GALLERY_MIRROR, src);
      save(`${cls}_step_${Math.round(t * 100)}`, p.px, STEP_CANVAS.ax, STEP_CANVAS.ay);
    }
    const from = onHeroCanvas(glassAt(h, h.reel, Math.min(0.1, h.reel.long), 'front'));
    for (const k of [0.05, 0.2, 0.45]) {
      const p = shatterPainted(from, k);
      save(`${cls}_shatter_${Math.round(k * 100)}`, p.px, SHATTER_CANVAS.ax, SHATTER_CANVAS.ay);
    }
  }
  const m = mirrorPainted(STEP_CANVAS.w, STEP_CANVAS.h, STEP_MIRROR[0], STEP_MIRROR[1]);
  save('mirror', m, STEP_CANVAS.ax, STEP_CANVAS.ay);
}
if (what === 'film') {
  // EACH HERO'S PART OF THE FILM, in order: stepping out of a mirror, standing (and, with eight sides, turning round), running,
  // his tap, his hold, struck and shattering; every frame a PNG, its feet where index.json says.
  for (const cls of CLASSES) {
    const h = heroGlass(cls);
    const src = { lurchLong: h.lurch.long, fig: (which: 'stand' | 'lurch', t: number) => onHeroCanvas(glassAt(h, which === 'lurch' ? h.lurch : h.stand, which === 'lurch' ? Math.min(t, h.lurch.long) : t, 'front')) };
    const n = Math.round(STEP_OUT.time * STEP_OUT.fps) + 1;
    for (let i = 0; i < n; i++) {
      const p = stepOutPainted(cls, i / STEP_OUT.fps, GALLERY_MIRROR, src);
      save(`${cls}_film_step_${i}`, p.px, STEP_CANVAS.ax, STEP_CANVAS.ay);
    }
    let k = 0;
    const seq = (name: string, tr: Track, side: string, t0: number, t1: number): void => {
      for (let t = t0, i = 0; t <= t1 + 1e-6; t += 1 / 30, i++) {
        const tt = tr.loops ? tr.from + ((t - tr.from) % (tr.long - tr.from)) : Math.min(t, tr.long);
        const g = glassAt(h, tr, tt, side);
        save(`${cls}_film_${name}_${i}`, g.px, g.ax, g.ay);
        k++;
      }
    };
    hero(h, h.stand, 0.4 % h.stand.long, 'front');
    index[`${cls}_film_you`] = index[Object.keys(index).pop() as string];
    seq('stand', h.stand, 'front', 0, 1.2);
    // (turning round: each side he has, a third of a second each)
    h.sides.forEach((side, j) => {
      const g = glassAt(h, h.stand, 0.4 % h.stand.long, side);
      save(`${cls}_film_turn_${j}`, g.px, g.ax, g.ay);
    });
    seq('run', h.run, 'front', h.run.from, h.run.from + 1.0);
    seq('tap', h.tap, 'front', 0, h.tap.long + 0.2);
    seq('hold', h.hold, 'front', 0, h.hold.long + 0.2);
    const from = onHeroCanvas(glassAt(h, h.reel, Math.min(0.1, h.reel.long), 'front'));
    const nd = Math.round(SHATTER.time * SHATTER.fps) + 1;
    for (let i = 0; i < nd; i++) {
      const p = shatterPainted(from, i / (nd - 1));
      save(`${cls}_film_shatter_${i}`, p.px, SHATTER_CANVAS.ax, SHATTER_CANVAS.ay);
    }
    console.log(cls, 'film frames', k + n + nd + h.sides.length);
  }
  const m = mirrorPainted(STEP_CANVAS.w, STEP_CANVAS.h, STEP_MIRROR[0], STEP_MIRROR[1]);
  save('mirror', m, STEP_CANVAS.ax, STEP_CANVAS.ay);
}
writeFileSync(`${dir}/index.json`, JSON.stringify(index, null, 1));
