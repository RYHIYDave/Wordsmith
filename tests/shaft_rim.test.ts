// THE ENDLESS TOWN'S GROUND, THE SHAFT'S RIM (src/art/shaft_rim.ts): behind its switch, off; nothing of the game imports it;
// crisp (flat tones, few of them); nothing of the enemy's colours on the rim, only down the shaft; the pit not walkable, every
// station on the rim.
//   run: tsx --test tests/shaft_rim.test.ts

// @ts-ignore
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import { ENDLESS_TOWN, GROUND, RIM, groundAt, onTongue, pitAt, rimPlace, shaftLight } from '../src/art/shaft_rim';

function files(dir: string): string[] {
  const out: string[] = [];
  for (const f of readdirSync(dir) as string[]) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...files(p));
    else if (/\.(ts|mjs|js)$/.test(f)) out.push(p);
  }
  return out;
}
const hsv = (c: number): [number, number, number] => {
  const r = (c >> 16) & 255;
  const g = (c >> 8) & 255;
  const b = c & 255;
  const mx = Math.max(r, g, b);
  const d = mx - Math.min(r, g, b);
  let h = 0;
  if (d > 0) h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
  return [(h + 360) % 360, mx ? d / mx : 0, mx / 255];
};
/** Where a picture pixel of the ground lies, in tiles (on the ground's plane). */
const tileAt = (px: number, py: number): [number, number] => {
  const gx = GROUND.gx + (px + 0.5) / 2;
  const gy = GROUND.gy + (py + 0.5) / 2;
  const U = gx / 16;
  const S = (gy - (RIM.cx + RIM.cy) * 8) / 8;
  return [RIM.cx + (S + U) / 2, RIM.cy + (S - U) / 2];
};

test('the switch is off, and nothing of the game imports the Shaft\'s Rim', () => {
  assert.equal(ENDLESS_TOWN.on, false);
  const bad = files('src').filter((f) => !f.startsWith(join('src', 'dev')) && !f.endsWith(join('art', 'shaft_rim.ts')) && /shaft_rim/.test(readFileSync(f, 'utf8') as string));
  assert.deepEqual(bad, []);
});

test('crisp: the ground is flat tones, few of them, never a smooth run of colour', () => {
  const seen = new Set<number>();
  for (let py = 0; py < GROUND.h * 2; py += 3) for (let px = 0; px < GROUND.w * 2; px += 3) seen.add(groundAt(px, py));
  assert.ok(seen.size < 1200, `${seen.size} colours`);
});

test("nothing of the enemy's pink or gold on the rim: only down the shaft", () => {
  let n = 0;
  for (let py = 0; py < GROUND.h * 2; py += 2)
    for (let px = 0; px < GROUND.w * 2; px += 2) {
      const [x, y] = tileAt(px, py);
      if (Math.hypot(x - RIM.cx, y - RIM.cy) < RIM.pit + 0.05 && !onTongue(x, y)) continue;
      const [h, s, v] = hsv(groundAt(px, py));
      const pink = h >= 296 && h <= 354 && s > 0.4 && v > 0.45;
      const gold = h >= 25 && h <= 55 && s > 0.45 && v > 0.8;
      if (pink || gold) n++;
    }
  assert.equal(n, 0);
});

test('the pit is not walkable; the tongue and the rim are; every station stands on the rim', () => {
  const P = rimPlace();
  for (let y = 0; y < P.h; y++)
    for (let x = 0; x < P.w; x++) {
      const r = Math.hypot(x + 0.5 - RIM.cx, y + 0.5 - RIM.cy);
      const w = P.walk[y * P.w + x];
      if (onTongue(x + 0.5, y + 0.5)) assert.equal(w, 1);
      else if (r < RIM.pit) assert.equal(w, 2, `tile ${x}, ${y}`);
    }
  for (const t of P.town) assert.equal(P.walk[t.y * P.w + t.x], 1, `${t.kind} at ${t.x}, ${t.y}`);
  for (const t of P.more) assert.equal(P.walk[Math.floor(t.y) * P.w + Math.floor(t.x)], 1, `${t.kind}`);
});

test('the pit shows more than two storeys, each its own floor\'s stone, lit, before the dark', () => {
  const seen = new Set<number>();
  for (let dy = -RIM.pit * 12; dy < RIM.pit * 12; dy += 0.5)
    for (let dx = -RIM.pit * 23; dx < RIM.pit * 23; dx += 0.5) {
      const P = pitAt(dx, dy);
      if (P && shaftLight(P.z, P.phi) > 0.2) seen.add(Math.floor(P.z));
    }
  assert.ok(seen.size >= 3, `storeys seen: ${[...seen].join(', ')}`);
});
