// THE GOLEM THAT ONLY SHOOTS, ITS NEW LOOK, A MOCK-UP FOR HIM (the Godot chat; his pick of 21 Nov 2026: “fist to a big gun, but id
// like him to have 1 wheel instead of legs”): dev/sculpt_golem.ts GOLEM_RANGED, painted as the game paints the Golem, beside the
// Golem as it is now. NOT IN THE GAME until he says yes.
//   npx tsx tools/golem_ranged_mock.ts <out.png>
import { writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import { paintWithoutCanvas } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { GOLEM_POSE, GOLEM_RANGED, sculptGolemBuild } from '../src/dev/sculpt_golem';
import type { GolemGun } from '../src/dev/sculpt_golem';
import { GCANNON, golemCannon } from '../src/dev/golem_moves';

paintWithoutCanvas();
gameSwitches();
const out = process.argv[2] ?? 'golem_ranged.png';
const REST = { swing: 0, fold: 0, lean: 0, bob: 0, feet: [0, 0, 0, 0] as [number, number, number, number], level: 0, dim: 0, crumple: 0 };
type Pose = Partial<typeof GOLEM_POSE> & { aim?: number; kick?: number };
interface Pane { title: string; ranged: boolean; turn: number; pose: Pose; gun?: GolemGun; carry?: 'low' | 'shoulder' | 'side' }
// (the big gun brought level: its arm swung up so)
const LEVEL = Number(process.env.LEVEL ?? 58);
// (MODE=carry: the two other ways to carry its big gun, his pick of 21 Nov 2026 “Gun held differently”)
const carryPanes = (c: 'shoulder' | 'side', name: string): Pane[] => [
  { title: `${name}`, ranged: true, turn: 45, pose: {}, carry: c },
  { title: 'FROM BEHIND', ranged: true, turn: 135, pose: {}, carry: c },
  { title: 'BIG SHOT FULL', ranged: true, turn: 45, pose: { swing: 4, bigCharge: 1, lean: -4 }, carry: c },
  { title: 'BIG SHOT FIRED', ranged: true, turn: 45, pose: { swing: 10, bigCharge: 0.5, bigKick: 1, lean: -9 }, carry: c },
];
const panes: Pane[] = process.env.MODE === 'carry' ? [...carryPanes('shoulder', 'ON ITS SHOULDER'), ...carryPanes('side', 'AT ITS SIDE')] : [
  { title: 'NOW', ranged: false, turn: 45, pose: {} },
  { title: 'NEW: STANDING', ranged: true, turn: 45, pose: {} },
  { title: 'NEW: FROM BEHIND', ranged: true, turn: 135, pose: {} },
  { title: 'ROLLING', ranged: true, turn: 45, pose: { roll: 30, lean: 8, bob: 0.6 } },
  { title: 'SMALL SHOT', ranged: true, turn: 45, pose: golemCannon(GCANNON.fire + 1) },
  { title: 'BIG SHOT CHARGING', ranged: true, turn: 45, pose: { swing: LEVEL, bigCharge: 0.6, lean: -4 } },
  { title: 'BIG SHOT FULL', ranged: true, turn: 45, pose: { swing: LEVEL, bigCharge: 1, lean: -4 } },
  { title: 'BIG SHOT FIRED', ranged: true, turn: 45, pose: { swing: LEVEL + 8, bigCharge: 0.5, bigKick: 1, lean: -9 } },
];
const S = 3;
const W = 176;
const H = 150;
const cols = 4;
const rows = Math.ceil(panes.length / cols);
const PW = W * S;
const PH = H * S;
const img = new Uint8Array(cols * PW * rows * (PH + 30) * 4);
const IW = cols * PW;
const IH = rows * (PH + 30);
const set = (x: number, y: number, r: number, g: number, b: number): void => {
  if (x < 0 || y < 0 || x >= IW || y >= IH) return;
  const o = (y * IW + x) * 4;
  img[o] = r;
  img[o + 1] = g;
  img[o + 2] = b;
  img[o + 3] = 255;
};
// (a tiny pixel font for the titles: each letter 3 by 5)
const FONT: Record<string, string> = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100',
  G: '011100101101011', H: '101101111101101', I: '111010010010111', K: '101110100110101', L: '100100100100111', M: '101111111101101',
  N: '110101101101101', O: '010101101101010', P: '110101110100100', R: '110101110110101', S: '011100010001110', T: '111010010010010',
  U: '101101101101111', V: '101101101101010', W: '101101111111101', Y: '101101010010010', ':': '000010000010000', ' ': '000000000000000',
};
const text = (x: number, y: number, s: string): void => {
  for (const ch of s) {
    const f = FONT[ch] ?? FONT[' '];
    for (let j = 0; j < 5; j++) for (let i = 0; i < 3; i++) if (f[j * 3 + i] === '1') for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) set(x + i * 3 + a, y + j * 3 + b, 216, 212, 255);
    x += 12;
  }
};
for (let y = 0; y < IH; y++) for (let x = 0; x < IW; x++) set(x, y, 20, 18, 42);
panes.forEach((p, k) => {
  const ox = (k % cols) * PW;
  const oy = Math.floor(k / cols) * (PH + 30);
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) set(ox + x, oy + 30 + y, (k % 2) ? 34 : 27, (k % 2) ? 31 : 25, (k % 2) ? 68 : 56);
  text(ox + 8, oy + 8, p.title);
  // (its soft shadow on the floor)
  const fx = 84;
  const fy = 132;
  for (let y = -14; y <= 14; y++) for (let x = -30; x <= 30; x++) {
    if ((x / 30) ** 2 + (y / 14) ** 2 > 1) continue;
    for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) set(ox + (fx + x) * S + a, oy + 30 + (fy - 12 + y) * S + b, 16, 14, 30);
  }
  GOLEM_RANGED.on = p.ranged;
  GOLEM_RANGED.carry = p.carry ?? 'low';
  Object.assign(GOLEM_POSE, REST, p.pose);
  const d = sculptGolemBuild('front', 'ape', p.turn, -14, true, p.gun ?? 'cannon', p.pose.aim ?? 0, p.pose.kick ?? 0, 0, 0);
  Object.assign(GOLEM_POSE, REST);
  GOLEM_RANGED.on = false;
  GOLEM_RANGED.carry = 'low';
  const px = d.px;
  for (let y = 0; y < Math.min(px.h, H + 12); y++) for (let x = 0; x < px.w; x++) {
    const o = (y * px.w + x) * 4;
    if (px.d[o + 3] === 0) continue;
    const yy = y - 12;
    if (yy < 0) continue;
    for (let a = 0; a < S; a++) for (let b = 0; b < S; b++) set(ox + x * S + a, oy + 30 + yy * S + b, px.d[o], px.d[o + 1], px.d[o + 2]);
  }
});
function png(w: number, h: number, rgba: Uint8Array): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): number[] => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    return [...be(data.length), ...td, ...be(crc32(td) >>> 0)];
  };
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}
writeFileSync(out, png(IW, IH, img));
console.log(`${out}: ${IW}x${IH}`);
