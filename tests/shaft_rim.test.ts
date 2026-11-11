// THE ENDLESS TOWN'S GROUND, THE SHAFT'S RIM (src/art/shaft_rim.ts): behind its switch, off; nothing of the game imports it;
// crisp (flat tones, few of them); nothing of the enemy's colours on the rim, only down the shaft; the pit not walkable, every
// station on the rim.
// STEP 4, ITS THINGS (src/art/shaft_props.ts): the gate, the record, the trophies wall, the bench's socket, the torches: behind
// the same switch, imported by nothing of the game; crisp; nothing of the enemy's glow; each on the floor, blocking its own tile;
// the flame's frames whole.
//   run: tsx --test tests/shaft_rim.test.ts

// @ts-ignore
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync, statSync } from 'node:fs';
// @ts-ignore
import { join } from 'node:path';
import {
  BENCH_SOCKET, GATE_SOCKETS, RECORD_NOTCHES, RECORD_ROOM, TORCH_FRAMES, TROPHY_BOSSES, TROPHY_MOUNTS, paintGate, paintRecord, paintSocketSlab, paintTorchFlame,
  paintTorchPost, paintTrophies, paintTrophy, paintTrophyWall, rimPieces,
} from '../src/art/shaft_props';
import type { Piece } from '../src/art/shaft_props';
import { ENDLESS_TOWN, GROUND, RIM, TREADS, groundAt, onTongue, pitAt, pitPixel, pitXY, rimPlace, shaftLight, stairPixel } from '../src/art/shaft_rim';

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
  const bad = files('src').filter((f) => !f.startsWith(join('src', 'dev')) && !f.endsWith(join('art', 'shaft_rim.ts')) && !f.endsWith(join('art', 'shaft_props.ts')) && /shaft_rim|shaft_props/.test(readFileSync(f, 'utf8') as string));
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

test('the stair: many treads, each top lit and lower than the last, round and down', () => {
  const steps = TREADS.filter((t) => !t.landing);
  assert.ok(steps.length >= 70, `${steps.length} treads`);
  // (narrow and many: 44 to 48 to a turn)
  const perTurn = (2 * Math.PI) / (steps[1].a0 - steps[1].a1);
  assert.ok(perTurn >= 44 && perTurn <= 48, `${perTurn} to a turn`);
  assert.ok(TREADS.filter((t) => t.landing).length >= 3);
  for (let i = 1; i < TREADS.length; i++) assert.ok(TREADS[i].z > TREADS[i - 1].z - 1e-9, `tread ${i} not lower`);
  for (let i = 1; i < steps.length; i++) assert.ok(steps[i].z > steps[i - 1].z, `step ${i} not lower`);
  // (every tread on the far side above the dark is lit)
  for (const t of TREADS) {
    const mid = (t.a0 + t.a1) / 2;
    if (Math.sin(mid) > 0.12 || t.z > 2.8) continue;
    assert.ok(shaftLight(t.z, mid) * 1.4 + 0.12 > 0.25, `tread ${t.i} dark`);
  }
});

test("the stair does not cross the portal's tongue or landing: there it is under them, hidden", () => {
  let under = 0;
  for (let py = 0; py < GROUND.h * 2; py += 2)
    for (let px = 0; px < GROUND.w * 2; px += 2) {
      const [x, y] = tileAt(px, py);
      if (!onTongue(x, y)) continue;
      const gx = GROUND.gx + (px + 0.5) / 2;
      const gy = GROUND.gy + (py + 0.5) / 2;
      if (!stairPixel(gx, gy - (RIM.cx + RIM.cy) * 8)) continue;
      under++;
      assert.notEqual(groundAt(px, py), pitPixel(gx, gy, px, py));
    }
  assert.ok(under > 0);
});

test('it slopes: on the top pass each tread a step that can be seen below the last, and a pass comes down a storey', () => {
  for (let k = 0; k < 3; k++) {
    const pass = TREADS.filter((t) => !t.landing && t.z > k && t.z <= k + 1 + 1e-9);
    assert.ok(pass.length >= 15, `pass ${k}: ${pass.length} steps`);
    assert.ok(pass[pass.length - 1].z - pass[0].z > 0.9, `pass ${k} comes down ${pass[pass.length - 1].z - pass[0].z}`);
  }
  // (at the top pass, at the far wall's middle, a step is at least a game pixel and a half)
  const top = TREADS.filter((t) => !t.landing && t.z <= 1 + 1e-9);
  for (let i = 1; i < top.length; i++) {
    const y0 = pitXY(top[i - 1].z, -Math.PI / 2)[1];
    const y1 = pitXY(top[i].z, -Math.PI / 2)[1];
    assert.ok(y1 - y0 >= 1.5, `step ${i}: ${(y1 - y0).toFixed(2)} px`);
  }
});

// ---------------------------------------------------------------------------------------------------------------------------
// STEP 4: THE THINGS THAT STAND ON THE RIM

const SLAB = { stone: ['#1c161e', '#3a3038', '#6e5e64', '#ae9a88', '#c4b4a4'], lit: ['#1c161e', '#52444c', '#6e5e64', '#958474', '#ae9a88'], shade: ['#1c161e', '#3a3038', '#52444c', '#6e5e64', '#958474'] };
const pieces = (): [string, Piece][] => [
  ['gate', paintGate()],
  ['record', paintRecord(40, true)],
  ['trophies empty', paintTrophyWall()],
  ['trophies full', paintTrophies([true, true, true, true])],
  ...[0, 1, 2, 3].map((k): [string, Piece] => [`trophy ${k}`, paintTrophy(k)]),
  ['socket slab', paintSocketSlab(SLAB, 0)],
  ['torch post', paintTorchPost()],
  ...Array.from({ length: TORCH_FRAMES }, (_, f): [string, Piece] => [`flame ${f}`, paintTorchFlame(f)]),
];
const rgbOf = (d: Uint8ClampedArray, i: number): number => (d[i] << 16) | (d[i + 1] << 8) | d[i + 2];

test("crisp: every new thing is whole pixels (seen or not, never half) in few flat tones", () => {
  for (const [name, p] of pieces()) {
    const tones = new Set<number>();
    let seen = 0;
    for (let i = 0; i < p.px.d.length; i += 4) {
      const a = p.px.d[i + 3];
      assert.ok(a === 0 || a === 255, `${name}: a pixel half seen`);
      if (a) {
        seen++;
        tones.add(rgbOf(p.px.d, i));
      }
    }
    assert.ok(seen > 20, `${name}: empty`);
    assert.ok(tones.size <= 64, `${name}: ${tones.size} tones`);
  }
});

test("nothing of the enemy's pink or gold glows on the rim: the new things' lights are the friend's cyan or a torch's fire; no pink or gold in the stone", () => {
  for (const [name, p] of pieces()) {
    for (const l of p.lights ?? []) {
      const fire = name.startsWith('flame') && l.color === '#ff8a2a';
      assert.ok(fire || l.color === '#22d0e0', `${name}: a light of ${l.color}`);
    }
    if (name.startsWith('flame')) continue;
    for (let i = 0; i < p.px.d.length; i += 4) {
      if (!p.px.d[i + 3]) continue;
      const [h, s, v] = hsv(rgbOf(p.px.d, i));
      const pink = h >= 296 && h <= 354 && s > 0.4 && v > 0.45;
      const gold = h >= 25 && h <= 55 && s > 0.45 && v > 0.8;
      assert.ok(!pink && !gold, `${name}: pink or gold at ${(i / 4) % p.px.w}, ${Math.floor(i / 4 / p.px.w)}`);
    }
  }
  // (a dead thing's trophy gives no light; the record's notches only the newest, and only cyan)
  for (let k = 0; k < 4; k++) assert.equal(paintTrophy(k).lights, undefined);
  assert.equal(paintRecord(12, false).lights?.length ?? 0, 0);
  assert.equal(paintRecord(12, true).lights?.length, 1);
});

test('each new thing stands on the floor and blocks its own tile, and none stands on another or on a station', () => {
  const P = rimPlace();
  const taken = new Map<string, string>();
  for (const t of P.town) if (t.kind !== 'rug' && t.kind !== 'runeRing') taken.set(`${t.x},${t.y}`, t.kind);
  const mine = new Set<string>();
  for (const pc of rimPieces()) {
    const key = (q: readonly number[]): string => `${q[0]},${q[1]}`;
    assert.ok(pc.blocks.some((b) => key(b) === key(pc.tile)), `${pc.kind}: its tile not blocked`);
    assert.ok(pc.blocks.some((b) => key(b) === key([Math.floor(pc.at[0]), Math.floor(pc.at[1])])), `${pc.kind}: its anchor off its tiles`);
    for (const b of pc.blocks) {
      assert.equal(P.walk[b[1] * P.w + b[0]], 1, `${pc.kind} at ${b}: not floor`);
      assert.ok(!taken.has(key(b)), `${pc.kind} at ${b}: on the ${taken.get(key(b))}`);
      assert.ok(!mine.has(key(b)), `${pc.kind} at ${b}: on another new thing`);
      mine.add(key(b));
    }
  }
  // (the locked stations keep their tiles; four torches)
  const gate = rimPieces().find((q) => q.kind === 'gate');
  assert.deepEqual(gate?.tile, P.more.find((m) => m.kind === 'gate') && [P.more[0].x, P.more[0].y]);
  assert.equal(rimPieces().filter((q) => q.kind === 'torch').length, 4);
});

test("the flame's twelve frames are whole: each a fire, none cut off at its picture's edge, each its own", () => {
  const seen = new Set<string>();
  for (let f = 0; f < TORCH_FRAMES; f++) {
    const p = paintTorchFlame(f).px;
    let n = 0;
    for (let y = 0; y < p.h; y++)
      for (let x = 0; x < p.w; x++) {
        if (!p.has(x, y)) continue;
        n++;
        assert.ok(x > 0 && y > 0 && x < p.w - 1 && y < p.h - 1, `frame ${f} cut at ${x}, ${y}`);
      }
    assert.ok(n > 40, `frame ${f}: ${n} pixels`);
    seen.add(Array.from(p.d).join(','));
  }
  assert.ok(seen.size >= 10, `${seen.size} different frames`);
});

test('the places the game is given: three word sockets on the gate, the bench socket, four mounts, at least fifty notches', () => {
  const g = paintGate();
  assert.equal(GATE_SOCKETS.length, 3);
  for (const s of GATE_SOCKETS) {
    const c = g.px.get(Math.round(g.ox + s.x * 2), Math.round(g.oy + s.y * 2));
    assert.equal(c, '#0e0c24', `a socket's hollow at ${s.x}, ${s.y} is ${c}`);
  }
  assert.ok(BENCH_SOCKET.rx > 4 && BENCH_SOCKET.ry > 2);
  assert.equal(TROPHY_MOUNTS.length, 4);
  assert.deepEqual(TROPHY_BOSSES.map((b) => b.floor), [5, 10, 15, 20]);
  assert.ok(RECORD_ROOM >= 50 && RECORD_NOTCHES.length >= 50);
  const r = paintRecord(RECORD_ROOM);
  for (const q of RECORD_NOTCHES) assert.ok(r.px.has(Math.round(r.ox + q.x * 2), Math.round(r.oy + q.y * 2)), `notch ${q.i} off the stone`);
});
