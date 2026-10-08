// (scratch) The strike with feet that leave the floor while the game's step carries him and land in their stance places at the blow:
// do the legs reach, and does any foot on the floor move (counting the step: a third of a tile over frames 0-4)?
import { MOVES3 } from '../../src/art/moves3';
import { bonesAt, solve } from '../../src/art/skeleton';
import type { Key3, V3 } from '../../src/art/skeleton';
const m = MOVES3.strike; const B = m.build;
const S = 0.33 * 32 / Math.sqrt(2 / 3);  // a third of a tile along the grid, in the figure's own lengths
const onToes = (deg: number): number => { const a = (deg * Math.PI) / 180; return 0.105 * 57 * Math.sin(a) + B.ankle * Math.cos(a) - B.ankle; };
const k = m.motion.keys.map((x) => ({ ...x, pose: { ...x.pose } })) as Key3[];
const variant = process.argv[2] ?? 'mend';
if (variant === 'mend') {
  // ball of the back foot where the stance has it, the foot turned -8 and on its toes 36: its ankle there
  const a36 = (36 * Math.PI) / 180, t8 = (-8 * Math.PI) / 180, bl = 0.105 * 58;
  const ballX = -5.5, ballY = -10.9;
  const ankX = ballX - bl * Math.cos(a36) * Math.cos(t8), ankY = ballY - bl * Math.cos(a36) * Math.sin(t8);
  const back = { rfx: ankX, rfy: ankY + B.stance, rfp: 36, rfz: onToes(36), rft: -8 };
  // the coil (2*FR): both feet light as the step begins
  k[1].pose = { ...k[1].pose, lfx: 11, lfz: 2.0, lfp: -10, rfx: -9, rfp: 30, rfz: onToes(30) + 1.2, rft: -30 };
  // 3*FR: front foot still in the air, back foot skimming, turned nearly forward
  k[2].pose = { ...k[2].pose, px: 0.5, lfx: 11.5, lfz: 2.4, lfp: -14, rfx: ankX, rfy: ankY + B.stance, rfp: 32, rfz: onToes(32) + 0.8, rft: -12 };
  // the blow and after: feet down in their stance places (front flat, back on its ball); the lunge is the hips over the front foot
  const struck = { px: 4, lfx: 10.5, lfy: 0.5, lfz: 0, lfp: 0, lft: 2, lk: 2, ...back, rk: -6 };
  for (const i of [3, 4, 5]) k[i].pose = { ...k[i].pose, ...struck };
}
// a foot is on the floor if its ball (toe) or heel is within half a unit of it
const step = (f: number): number => S * Math.min(1, f / 4);
console.log(`${variant}: S = ${S.toFixed(2)} figure units (a third of a tile). Per frame: front ball x (world), z | back ball x,y (world), z | ankle short of its place (L, R)`);
let pl: [number, number] | null = null, pr: [number, number] | null = null; let slideL = 0, slideR = 0;
for (let i = 0; i <= 26; i++) {
  const f = i / 2; const q = bonesAt(k, m.rest, f / 30); const s = solve(B, q);
  const wantL: V3 = [q.lfx, B.stance + q.lfy, B.ankle + q.lfz]; const wantR: V3 = [q.rfx, -B.stance + q.rfy, B.ankle + q.rfz];
  const shortL = Math.hypot(s.ankleL[0] - wantL[0], s.ankleL[1] - wantL[1], s.ankleL[2] - wantL[2]);
  const shortR = Math.hypot(s.ankleR[0] - wantR[0], s.ankleR[1] - wantR[1], s.ankleR[2] - wantR[2]);
  const Lx = s.toeL[0] + step(f), Rx = s.toeR[0] + step(f);
  const onL = Math.min(s.toeL[2], s.heelL[2]) < 0.5, onR = Math.min(s.toeR[2], s.heelR[2]) < 0.5;
  if (onL) { if (pl) slideL = Math.max(slideL, Math.hypot(Lx - pl[0], s.toeL[1] - pl[1])); else pl = [Lx, s.toeL[1]]; } else pl = null;
  if (onR) { if (pr) slideR = Math.max(slideR, Math.hypot(Rx - pr[0], s.toeR[1] - pr[1])); else pr = [Rx, s.toeR[1]]; } else pr = null;
  if (i % 2 === 0) console.log(`f${String(f).padStart(4)} | L ${Lx.toFixed(1).padStart(6)} z${Math.min(s.toeL[2], s.heelL[2]).toFixed(1).padStart(5)} ${onL ? 'down' : 'air '} | R ${Rx.toFixed(1).padStart(6)},${s.toeR[1].toFixed(1).padStart(6)} z${Math.min(s.toeR[2], s.heelR[2]).toFixed(1).padStart(5)} ${onR ? 'down' : 'air '} | short ${shortL.toFixed(2)} ${shortR.toFixed(2)}`);
}
console.log(`most a planted ball moved over the floor (figure units, step counted): front ${slideL.toFixed(1)}, back ${slideR.toFixed(1)}`);
