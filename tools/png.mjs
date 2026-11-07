// A PNG writer for the baked pictures (tools/bake_heroes.mjs): exact, every pixel as given. A picture of 256 colours or
// fewer is written with a palette (a byte a pixel), the rest as red, green, blue and alpha with each row's best filter.
import zlib from 'node:zlib';

const CRC = new Int32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC[n] = c;
}
function crc32(buf) {
  let c = -1;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

/** The palette of a picture's pixels (RGBA, a Uint32 each), or null if it has more than 256 colours. */
function paletteOf(u32) {
  const map = new Map();
  for (let i = 0; i < u32.length; i++) {
    const c = u32[i];
    if (!map.has(c)) {
      if (map.size >= 256) return null;
      map.set(c, map.size);
    }
  }
  return map;
}

function paeth(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}

/** RGBA rows, each with the filter that leaves the smallest sum (the usual guess at what packs best). */
function filtered(rgba, w, h) {
  const stride = w * 4;
  const out = Buffer.alloc((stride + 1) * h);
  const tries = [0, 1, 2, 3, 4].map(() => Buffer.alloc(stride));
  for (let y = 0; y < h; y++) {
    const row = rgba.subarray(y * stride, (y + 1) * stride);
    const up = y > 0 ? rgba.subarray((y - 1) * stride, y * stride) : null;
    let best = 0, bestSum = Infinity;
    for (let f = 0; f < 5; f++) {
      const t = tries[f];
      let sum = 0;
      for (let i = 0; i < stride; i++) {
        const a = i >= 4 ? row[i - 4] : 0;
        const b = up ? up[i] : 0;
        const c = up && i >= 4 ? up[i - 4] : 0;
        const x = row[i];
        const v = f === 0 ? x : f === 1 ? x - a : f === 2 ? x - b : f === 3 ? x - ((a + b) >> 1) : x - paeth(a, b, c);
        const byte = v & 0xff;
        t[i] = byte;
        sum += byte < 128 ? byte : 256 - byte;
      }
      if (sum < bestSum) { bestSum = sum; best = f; }
    }
    out[y * (stride + 1)] = best;
    tries[best].copy(out, y * (stride + 1) + 1);
  }
  return out;
}

/** A PNG of `rgba` (Buffer or Uint8Array, w*h*4 bytes, not premultiplied). */
export function encodePng(w, h, rgba) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const bytes = Buffer.from(rgba.buffer, rgba.byteOffset, rgba.byteLength);
  const u32 = new Uint32Array(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  const pal = paletteOf(u32);
  const parts = [sig];
  if (pal) {
    ihdr[9] = 3;
    parts.push(chunk('IHDR', ihdr));
    const plte = Buffer.alloc(pal.size * 3);
    const trns = Buffer.alloc(pal.size);
    for (const [c, i] of pal) {
      plte[i * 3] = c & 0xff;
      plte[i * 3 + 1] = (c >>> 8) & 0xff;
      plte[i * 3 + 2] = (c >>> 16) & 0xff;
      trns[i] = (c >>> 24) & 0xff;
    }
    parts.push(chunk('PLTE', plte), chunk('tRNS', trns));
    const raw = Buffer.alloc((w + 1) * h);
    for (let y = 0; y < h; y++) {
      raw[y * (w + 1)] = 0;
      for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = pal.get(u32[y * w + x]);
    }
    parts.push(chunk('IDAT', zlib.deflateSync(raw, { level: 9, memLevel: 9 })));
  } else {
    ihdr[9] = 6;
    parts.push(chunk('IHDR', ihdr));
    parts.push(chunk('IDAT', zlib.deflateSync(filtered(bytes, w, h), { level: 9, memLevel: 9 })));
  }
  parts.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}
