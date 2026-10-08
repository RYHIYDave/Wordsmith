// STRIKE'S COMBO, TODAY'S AND MENDED (art/moves3.ts, `useComboMends`): the five things the art chat's
// review measured (docs/requests/strike_combo_review_answer.md), measured again on both.
//   node node_modules/tsx/dist/cli.mjs tools/combo_mends_check.ts            (today's)
//   node node_modules/tsx/dist/cli.mjs tools/combo_mends_check.ts mend       (mended)
// A. How far each foot's ball moves over the floor while it is on it, in game pixels, as the game
//    plays the combo at 60 steps a second (its own step included), from in front and from behind;
//    and whether the legs reach where the pose sends the feet.
// B. The deepest any arm goes into the head in each swing (1 = the skins touch; below 1, in it).
// C. The slash, frame to frame: how far the hips, the chest and the blade turn.
// D. The same table shows the raise and the recovery: no frame should leap.
// (E, the streak drawn only through the cut, is in the pictures.)
import { MOVES3, useComboMends } from '../src/art/moves3';
import { bonesAt, lerp3, project, solve } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { COMBO } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';

const mend = process.argv.includes('mend');
useComboMends(mend);
COMBO.on = true;
const D = 180 / Math.PI;
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const ang = (a: V3, b: V3): number => Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * D;
console.log(mend ? 'MENDED' : "TODAY'S");

// A. the feet, in the game, at 60 steps a second
for (const which of ['front', 'back'] as const) {
  const face: [number, number] = which === 'back' ? [0, -1] : [1, 0];
  const game = Game.forPractice('warrior', 3);
  (game as unknown as { waveT: number }).waveT = 1e9;
  game.monsters.length = 0;
  const h = game.hero;
  h.x = 14.5;
  h.y = 15.5;
  h.fx = face[0];
  h.fy = face[1];
  const x0 = h.x;
  const y0 = h.y;
  const dt = 1 / 60;
  let order = false;
  let lastAge = 1e9;
  let swing = -1;
  const taps = [0.3, 1.25];
  const tr: Record<string, { on: boolean; start: [number, number]; most: number }> = {};
  let worst = 0;
  let short = 0;
  for (let i = 0; i < 150; i++) {
    const t = i * dt;
    const ctl = emptyControls();
    ctl.aimX = h.x + face[0] * 2;
    ctl.aimY = h.y + face[1] * 2;
    for (const at of taps) if (t <= at && t + dt > at) order = true;
    if (order) ctl.fire = true;
    game.update(dt, ctl);
    if (h.anim === 'attack' && h.attackAge < lastAge) {
      swing++;
      order = false;
    }
    lastAge = h.anim === 'attack' ? h.attackAge : 1e9;
    let move = 'rear';
    let tm = 0;
    if (h.anim === 'attack') {
      move = h.combo === 1 ? 'kslash' : 'strike';
      const m = MOVES3[move];
      const hit = m.motion.hit ?? 0;
      const end = m.motion.keys[m.motion.keys.length - 1].at;
      const n = Math.ceil(end * 30 - 1e-6) + 1;
      const tc = h.attackAge < h.attackWind ? (h.attackAge / h.attackWind) * hit : hit + (h.attackAge - h.attackWind);
      const fr = Math.max(0, Math.min(n - 1, Math.floor(tc * 30 + 1e-6)));
      tm = Math.min(end, fr / 30);
    }
    const m = MOVES3[move];
    const q = bonesAt(m.motion.keys, m.rest, tm);
    const s = solve(m.build, q);
    const B = m.build;
    short = Math.max(short, len(sub(s.ankleL, [q.lfx, B.stance + q.lfy, B.ankle + q.lfz])), len(sub(s.ankleR, [q.rfx, -B.stance + q.rfy, B.ankle + q.rfz])));
    const dx = h.x - x0;
    const dy = h.y - y0;
    const ax = (dx - dy) * 16;
    const ay = (dx + dy) * 8;
    for (const [nm, toe, heel] of [['front', s.toeL, s.heelL], ['back', s.toeR, s.heelR]] as const) {
      const p = project(toe as V3, which);
      const sx = ax + p[0] / 2;
      const sy = ay + p[1] / 2;
      const on = Math.min(toe[2], heel[2]) < 0.5;
      const key = `${swing}:${nm}`;
      const k = tr[key] ?? (tr[key] = { on: false, start: [0, 0], most: 0 });
      if (on && !k.on) k.start = [sx, sy];
      if (on) {
        const d = Math.hypot(sx - k.start[0], sy - k.start[1]);
        if (d > k.most && process.argv.includes('detail') && d > 0.5) console.log(`   ${which} swing ${swing} ${nm} foot: ${d.toFixed(1)} px at ${move} t=${(tm * 30).toFixed(0)}`);
        k.most = Math.max(k.most, d);
      }
      k.on = on;
      worst = Math.max(worst, k.most);
    }
  }
  console.log(`A  ${which}: the most a foot on the floor moved, ${worst.toFixed(1)} game px (two swings); a leg short of its foot by at most ${short.toFixed(2)} figure units`);
}

// B. arms in the head
for (const key of ['strike', 'kslash']) {
  const m = MOVES3[key];
  const B = m.build;
  const end = m.motion.keys[m.motion.keys.length - 1].at;
  let worst = 9;
  let at = 0;
  for (let i = 0; i <= Math.round(end * 60); i++) {
    const t = i / 60;
    const s = solve(B, bonesAt(m.motion.keys, m.rest, t));
    const R = B.headR;
    for (const [sh, el, ha] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as [V3, V3, V3][]) {
      for (let j = 0; j <= 10; j++) {
        const up = j <= 5;
        const p = up ? lerp3(sh, el, j / 5) : lerp3(el, ha, (j - 5) / 5);
        const r = up ? B.armR[0] + (B.armR[1] - B.armR[0]) * (j / 5) : B.armR[1] + (B.armR[2] - B.armR[1]) * ((j - 5) / 5);
        const d = sub(p, s.head);
        const k = Math.hypot(dot(d, s.face[0]) / (R[0] + r), dot(d, s.face[1]) / (R[1] + r), dot(d, s.face[2]) / (R[2] + r));
        if (k < worst) {
          worst = k;
          at = t * 30;
        }
      }
    }
  }
  console.log(`B  ${key}: an arm comes nearest the head at frame ${at.toFixed(1)}: ${worst.toFixed(2)} ${worst < 1 ? '(IN IT)' : '(clear)'}`);
}

// C and D. the slash, frame to frame
{
  const m = MOVES3.kslash;
  const B = m.build;
  let pq = bonesAt(m.motion.keys, m.rest, 0);
  let prev = solve(B, pq);
  const rows: string[] = [];
  for (let f = 1; f <= 13; f++) {
    const q = bonesAt(m.motion.keys, m.rest, f / 30);
    const s = solve(B, q);
    rows.push(`   ${String(f - 1).padStart(2)}>${String(f).padEnd(3)}| hips ${(q.yaw - pq.yaw).toFixed(0).padStart(4)} | chest ${(q.yaw + q.twist - pq.yaw - pq.twist).toFixed(0).padStart(4)} | blade ${ang(prev.point, s.point).toFixed(0).padStart(4)}`);
    prev = s;
    pq = q;
  }
  console.log('C, D  the slash, degrees a frame:\n' + rows.join('\n'));
}
