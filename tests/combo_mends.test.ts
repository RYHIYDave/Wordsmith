// STRIKE'S COMBO MENDED (src/art/moves3.ts, COMBO_MENDS; src/art/heroes3.ts, streakShown): the five
// mends of the art chat's review (docs/requests/strike_combo_review_answer.md), behind a switch that
// is off. The owner saw today's beside the mended (strike_combo_mended.gif) on 8 Oct 2026 at 14:02
// and said at 14:05 "Yes, the mended one (Recommended)", and of the shorter stance at the blow,
// "Yes, shorter is fine (Recommended)". These tests hold what he was shown:
//   - the switch: off, and switching it back gives today's swings exactly;
//   - A, feet that grip the floor: played by the game at 60 steps a second, its own step included,
//     no foot on the floor moves a whole game pixel, from in front or behind; the legs reach;
//   - B, clean bodies: no arm goes into the head in either swing;
//   - C, hips first: at the slash's third frame the hips turn and the chest does not;
//   - D, nothing jerky: the slash's raise is even, and its way back rises and falls without a hitch;
//   - E, the streak only through the cut.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { streakShown } from '../src/art/heroes3';
import { COMBO_MENDS, MOVES3, SLASH3, STRIKE3, useComboMends } from '../src/art/moves3';
import { bonesAt, lerp3, project, solve } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { COMBO } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a: V3, b: V3): number => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const len = (v: V3): number => Math.hypot(v[0], v[1], v[2]);
const ang = (a: V3, b: V3): number => (Math.acos(Math.max(-1, Math.min(1, dot(a, b)))) * 180) / Math.PI;
const FR = 1 / 30;
const TODAY = JSON.stringify([STRIKE3.motion, SLASH3.motion]);

/** The game plays the combo (two taps) at 60 steps a second; how far the feet move on the floor, in game pixels, and how short a leg falls. */
function feet(view: 'front' | 'back'): { slide: number; short: number; swings: number } {
  const face: [number, number] = view === 'back' ? [0, -1] : [1, 0];
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
  let swings = 0;
  const marks: Record<string, { on: boolean; start: [number, number] }> = {};
  let slide = 0;
  let short = 0;
  for (let i = 0; i < 150; i++) {
    const t = i * dt;
    const c = emptyControls();
    c.aimX = h.x + face[0] * 2;
    c.aimY = h.y + face[1] * 2;
    for (const at of [0.3, 1.25]) if (t <= at && t + dt > at) order = true;
    if (order) c.fire = true;
    game.update(dt, c);
    if (h.anim === 'attack' && h.attackAge < lastAge) {
      swings++;
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
      const tc = h.attackAge < h.attackWind ? (h.attackAge / h.attackWind) * hit : hit + (h.attackAge - h.attackWind);
      tm = Math.min(end, Math.max(0, Math.floor(tc * 30 + 1e-6)) / 30);
    }
    const m = MOVES3[move];
    const q = bonesAt(m.motion.keys, m.rest, tm);
    const s = solve(m.build, q);
    const B = m.build;
    short = Math.max(short, len(sub(s.ankleL, [q.lfx, B.stance + q.lfy, B.ankle + q.lfz])), len(sub(s.ankleR, [q.rfx, -B.stance + q.rfy, B.ankle + q.rfz])));
    const ax = (h.x - x0 - (h.y - y0)) * 16;
    const ay = (h.x - x0 + (h.y - y0)) * 8;
    for (const [nm, toe, heel] of [['L', s.toeL, s.heelL], ['R', s.toeR, s.heelR]] as const) {
      const p = project(toe as V3, view);
      const sx = ax + p[0] / 2;
      const sy = ay + p[1] / 2;
      const on = Math.min(toe[2], heel[2]) < 0.5;
      const key = `${swings}${nm}`;
      const k = marks[key] ?? (marks[key] = { on: false, start: [0, 0] });
      if (on && !k.on) k.start = [sx, sy];
      if (on) slide = Math.max(slide, Math.hypot(sx - k.start[0], sy - k.start[1]));
      k.on = on;
    }
  }
  return { slide, short, swings };
}

/** The deepest any arm goes into the head over a move (1: the skins touch; below 1, in it). */
function armInHead(key: string): number {
  const m = MOVES3[key];
  const B = m.build;
  const end = m.motion.keys[m.motion.keys.length - 1].at;
  let worst = 9;
  for (let i = 0; i <= Math.round(end * 60); i++) {
    const s = solve(B, bonesAt(m.motion.keys, m.rest, i / 60));
    const R = B.headR;
    for (const [sh, el, ha] of [[s.shoulderL, s.elbowL, s.handL], [s.shoulderR, s.elbowR, s.handR]] as [V3, V3, V3][]) {
      for (let j = 0; j <= 10; j++) {
        const up = j <= 5;
        const p = up ? lerp3(sh, el, j / 5) : lerp3(el, ha, (j - 5) / 5);
        const r = up ? B.armR[0] + (B.armR[1] - B.armR[0]) * (j / 5) : B.armR[1] + (B.armR[2] - B.armR[1]) * ((j - 5) / 5);
        const d = sub(p, s.head);
        worst = Math.min(worst, Math.hypot(dot(d, s.face[0]) / (R[0] + r), dot(d, s.face[1]) / (R[1] + r), dot(d, s.face[2]) / (R[2] + r)));
      }
    }
  }
  return worst;
}

/** The slash, frame by frame: how far the hips, the chest and the blade turn, in degrees. */
function slashTurns(): { hips: number; chest: number; blade: number }[] {
  const m = MOVES3.kslash;
  const out: { hips: number; chest: number; blade: number }[] = [];
  let pq = bonesAt(m.motion.keys, m.rest, 0);
  let prev = solve(m.build, pq);
  for (let f = 1; f <= 13; f++) {
    const q = bonesAt(m.motion.keys, m.rest, f * FR);
    const s = solve(m.build, q);
    out.push({ hips: Math.abs(q.yaw - pq.yaw), chest: Math.abs(q.yaw + q.twist - pq.yaw - pq.twist), blade: ang(prev.point, s.point) });
    prev = s;
    pq = q;
  }
  return out;
}

test('the switch is off, and switching it back gives today\'s swings exactly', () => {
  assert.equal(COMBO_MENDS.on, false);
  useComboMends(true);
  assert.notEqual(JSON.stringify([STRIKE3.motion, SLASH3.motion]), TODAY);
  useComboMends(false);
  assert.equal(JSON.stringify([STRIKE3.motion, SLASH3.motion]), TODAY);
  assert.equal(COMBO_MENDS.on, false);
});

test('A: mended, no foot on the floor moves a whole game pixel as the game plays the combo, and the legs reach', () => {
  COMBO.on = true;
  useComboMends(true);
  try {
    for (const view of ['front', 'back'] as const) {
      const r = feet(view);
      assert.equal(r.swings, 2, `${view}: the combo's two swings`);
      assert.ok(r.slide < 1, `${view}: a foot on the floor moved ${r.slide.toFixed(1)} game px`);
      assert.ok(r.short < 0.05, `${view}: a leg falls short of its foot by ${r.short.toFixed(2)}`);
    }
    // (and today's slide, as the review found it: these numbers are what was mended)
    useComboMends(false);
    assert.ok(feet('front').slide > 5);
  } finally {
    useComboMends(false);
  }
});

test('B: mended, no arm goes into his head in either swing', () => {
  useComboMends(true);
  try {
    for (const key of ['strike', 'kslash']) assert.ok(armInHead(key) >= 1, `${key}: ${armInHead(key).toFixed(2)}`);
  } finally {
    useComboMends(false);
  }
  assert.ok(armInHead('kslash') < 1, "(today's slash: the arm the review found in his head)");
});

test('C and D: mended, the slash turns hips first, its raise is even, and its way back has no hitch', () => {
  useComboMends(true);
  try {
    const t = slashTurns();
    // C: frames 2 to 3, the hips go round and the chest stays back; then the chest and the blade follow, faster
    assert.ok(t[2].hips >= 10 && t[2].chest <= 1, `frame 2>3: hips ${t[2].hips}, chest ${t[2].chest}`);
    assert.ok(t[3].chest > t[2].chest && t[3].blade > t[2].blade, 'then the chest and the blade, faster');
    // D: the raise, two even frames; the way back (frames 8 to 13) rises to one top and falls, never leaping
    assert.ok(Math.abs(t[0].blade - t[1].blade) < 5, `the raise: ${t[0].blade.toFixed(0)}, ${t[1].blade.toFixed(0)}`);
    const back = t.slice(8).map((r) => r.blade);
    const top = back.indexOf(Math.max(...back));
    for (let i = 1; i <= top; i++) assert.ok(back[i] >= back[i - 1], `the way back rises: ${back.map((b) => b.toFixed(0))}`);
    for (let i = top + 1; i < back.length; i++) assert.ok(back[i] <= back[i - 1], `and falls: ${back.map((b) => b.toFixed(0))}`);
  } finally {
    useComboMends(false);
  }
});

test('E: mended, the swings show their streak only through the cut (frames 3 to 5); other moves, and today\'s, as before', () => {
  useComboMends(true);
  try {
    for (const move of [STRIKE3, SLASH3]) {
      for (let f = 0; f <= 13; f++) assert.equal(streakShown(move, f * FR), f >= 3 && f <= 5, `${move.name}, frame ${f}`);
    }
    assert.equal(streakShown(MOVES3.slam, 2 * FR), true);
  } finally {
    useComboMends(false);
  }
  for (let f = 0; f <= 13; f++) assert.equal(streakShown(STRIKE3, f * FR), true);
});
