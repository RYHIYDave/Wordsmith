// One of the opening's boxes baked (art/opening.ts bakeBox) and kept in a file, for the film (tools/opening_film.ts) to
// play from: tsx tools/opening_bake.ts <box, e.g. p3b2> <w> <h> <drift> <file>. Also reads such a file back (readBake).
// @ts-ignore
import { readFileSync, writeFileSync } from 'node:fs';
import { Px } from '../src/engine/px';
import { bakeBox, boxNamed } from '../src/art/opening';
import type { BakeState, Pin } from '../src/art/opening';

interface Head {
  w: number;
  h: number;
  pins: Pin[];
  fronts: { k: string; n: number }[];
  poses: { k: string; count: number; w: number; h: number }[];
}

export function writeBake(file: string, img: Px, pins: Pin[], state: BakeState): void {
  const head: Head = {
    w: img.w,
    h: img.h,
    pins,
    fronts: state.fronts.map(([k, m]) => ({ k, n: m.length })),
    poses: state.poses.map(([k, s]) => ({ k, count: s.length, w: s[0]?.w ?? 0, h: s[0]?.h ?? 0 })),
  };
  const hj = new TextEncoder().encode(JSON.stringify(head));
  const parts: Uint8Array[] = [new Uint8Array(new Uint32Array([hj.length]).buffer), hj, new Uint8Array(img.d.buffer, img.d.byteOffset, img.d.byteLength)];
  for (const [, m] of state.fronts) parts.push(m);
  for (const [, s] of state.poses) for (const q of s) parts.push(new Uint8Array(q.d.buffer, q.d.byteOffset, q.d.byteLength));
  let n = 0;
  for (const q of parts) n += q.length;
  const all = new Uint8Array(n);
  let o = 0;
  for (const q of parts) {
    all.set(q, o);
    o += q.length;
  }
  writeFileSync(file, all);
}

export function readBake(file: string): { img: Px; pins: Pin[]; state: BakeState } {
  const buf: Uint8Array = readFileSync(file);
  const dv = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const hl = dv.getUint32(0, true);
  const head: Head = JSON.parse(new TextDecoder().decode(buf.subarray(4, 4 + hl)));
  let o = 4 + hl;
  const px = (w: number, h: number): Px => {
    const p = new Px(w, h);
    p.d.set(buf.subarray(o, o + w * h * 4));
    o += w * h * 4;
    return p;
  };
  const img = px(head.w, head.h);
  const fronts: [string, Uint8Array][] = head.fronts.map(({ k, n }) => {
    const m = buf.slice(o, o + n);
    o += n;
    return [k, m];
  });
  const poses: [string, Px[]][] = head.poses.map(({ k, count, w, h }) => {
    const s: Px[] = [];
    for (let i = 0; i < count; i++) s.push(px(w, h));
    return [k, s];
  });
  return { img, pins: head.pins, state: { fronts, poses } };
}

// @ts-ignore
const argv: string[] = process.argv;
if (argv[1]?.includes('opening_bake') && argv.length >= 7) {
  const [id, w, h, drift, file] = argv.slice(2);
  const t0 = Date.now();
  const { img, pins, state } = bakeBox(boxNamed(id).b, Number(w), Number(h), Number(drift));
  writeBake(file, img, pins, state);
  console.log(`baked ${id} ${img.w}x${img.h} in ${Date.now() - t0} ms`);
}
