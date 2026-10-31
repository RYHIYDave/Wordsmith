// FLOOR 1'S ENEMIES, MORE ACTION (the art chat's helper, 31 Oct 2026; docs/mockups/action_f1/README.md). The owner's review of every
// enemy: “I want buried battles when you’re fighting enemies and then once you fight them enough, I want you to be able to
// recognize what’s going to happen and which enemies to be aware of and what they do”. His picks: the bone archer “Both shots”
// (its ARROW RAIN beside its straight shot), the Warden “Yes (Recommended)” (the LOCKDOWN in place of the slam). Behind switches
// that are off (art/monster_bones.ts ARCHER_RAIN, art/monster_warden.ts WARDEN_LOCKDOWN); what they leave on the floor is
// art/action_f1_fx.ts, which nothing of the game imports. So:
//   1. the switches are off, nothing of the game imports the mock-up's files, and every frame the game shows of the archer and
//      the Warden is the same with the switches on (they only add);
//   2. with them on, each has its new move as a clip, its blow on its frame;
//   3. every frame of the new moves paints, wears the enemy's pink edge, is crisp, has nothing of the friend's cyan, and nothing
//      of it is cut off by its canvas;
//   4. every frame of them through the bosses' review, from in front and from behind, with its handing over to and from the
//      stand (art/action_f1_checks.ts: checkBoss's checks for these two older rigs);
//   5. what stands for ARM and THROUGH for these moves: the archer's arrow passes its face, not through it; the keys never in the
//      Warden's head;
//   6. Movement 9: a big held wind-up (the draw held, the keys held up), a strike of one frame;
//   7. the rain: its numbers; nothing cut off, crisp, no cyan; the ring pink and filling, denser as it comes; the strike two
//      frames; the arrows stuck, then gone; nothing left after;
//   8. the Lockdown's bars: their numbers (rows 2.5 to 3 tiles apart, cells to stand in); nothing cut off at any length either
//      way; the shadow first, pink-edged; the crash two frames; standing; rising away; nothing left after.
//   run: tsx --test tests/action_f1.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { clipPoses } from '../src/art/clip';
import { BLADE, CYAN, GLINT, IDLE_FPS, KAX, KAY, REST, RIM_ALPHA, SPARK, idlePoses } from '../src/art/kit';
import type { Painted, Pose, V } from '../src/art/kit';
import { ENEMY_RIM, onGrid } from '../src/art/mkit';
import { ARCHER_RAIN, ARCHER_REST, BONES_SEEN, RAIN_LOOSE, archerRainTimeline, makeArcherArt, paintArcher } from '../src/art/monster_bones';
import type { BonesSeen } from '../src/art/monster_bones';
import { LOCKDOWN_HIT, WARDEN_CANVAS, WARDEN_LOCKDOWN, WARDEN_MOVES, WARDEN_REST, WARDEN_SEEN, makeWardenArt, paintWarden, wardenLockdownTimeline } from '../src/art/monster_warden';
import type { WardenSeen } from '../src/art/monster_warden';
import { LOCKDOWN, LOCKDOWN_LONG, LOOSE_HEAD, RAIN, RAIN_LONG, lockBarsPainted, lockCanvas, lockRows, lockShadowPainted, lockStrikes, rainPainted, rainRisePainted, riseHeadAt } from '../src/art/action_f1_fx';
import type { View, Way } from '../src/art/action_f1_fx';
import { checkKit } from '../src/art/action_f1_checks';
import type { KitFrame, KitMove } from '../src/art/action_f1_checks';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

const VIEWS: readonly View[] = ['front', 'back'];
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  h = (h + 360) % 360;
  return h >= 165 && h <= 205;
}
const rimKey = rgba(ENEMY_RIM).slice(0, 3).join(',');

/** What a picture is painted in: how many pixels, how many not whole (neither see-through nor solid, nor the rim's own), any of the friend's cyan, how many of the enemy's pink rim, and whether anything touches its edge. */
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; edge: boolean } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let cyan: string | null = null;
  let edge = false;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      if (k === rimKey) rim++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge };
}

function withSwitches<T>(make: () => T): T {
  const a = ARCHER_RAIN.on;
  const w = WARDEN_LOCKDOWN.on;
  ARCHER_RAIN.on = true;
  WARDEN_LOCKDOWN.on = true;
  try {
    return make();
  } finally {
    ARCHER_RAIN.on = a;
    WARDEN_LOCKDOWN.on = w;
  }
}
function lists(s: AnimSet): [string, Sprite[]][] {
  const out: [string, Sprite[]][] = [['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]];
  if (s.heavy) out.push(['heavy3', s.heavy]);
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.push([k, (c[k] as Clip).frames]);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.push([`moves.${k}`, v.frames]);
  }
  return out;
}

// --- the rigs, frame by frame, as the review sees them ---
const toGame = (p: V, ax: number, ay: number): V => [(p[0] - ax) / 2, (p[1] - ay) / 2];
function archerFrames(back: boolean, keys: readonly { at: number; pose: Partial<Pose> }[], fps: number, rest: Partial<Pose>): { q: Pose; seen: BonesSeen; p: Painted }[] {
  const poses = fps === IDLE_FPS ? idlePoses().map((q) => ({ ...REST, ...rest, ...q })) : clipPoses(keys as never, { ...REST, ...rest }, fps);
  return poses.map((q) => {
    let seen: BonesSeen | null = null;
    BONES_SEEN.see = (j) => (seen = j);
    const p = paintArcher(q, back);
    BONES_SEEN.see = null;
    return { q, seen: seen as unknown as BonesSeen, p };
  });
}
function archerKit(back: boolean, name: string, stand: boolean): KitMove {
  const tl = onGrid(archerRainTimeline(back));
  const fps = stand ? IDLE_FPS : 30;
  const fr = archerFrames(back, tl.keys, fps, ARCHER_REST);
  const frames: KitFrame[] = fr.map(({ q, seen: j }, i) => ({
    t: i / fps,
    pts: { head: toGame(j.head, KAX, KAY), hips: toGame(j.hips, KAX, KAY), hand: toGame(j.hand, KAX, KAY), free: toGame(j.free, KAX, KAY), elbowR: toGame(j.elbowR, KAX, KAY), elbowL: toGame(j.elbowL, KAX, KAY) },
    soles: [toGame(j.soles[0], KAX, KAY), toGame(j.soles[1], KAX, KAY)],
    down: [j.lifts[0] < 0.05, j.lifts[1] < 0.05],
    tip: j.tip ? toGame(j.tip, KAX, KAY) : null,
    smeared: q.sweep >= 4,
  }));
  const view: View = back ? 'back' : 'front';
  return stand
    ? { name: 'stand', frames, round: true }
    : { name, frames, hit: tl.hit, strike: [RAIN_LOOSE - 1 / 30, RAIN_LOOSE], after: (t) => toGame(riseHeadAt(t, view), 0, 0) };
}
function wardenKit(back: boolean, stand: boolean): KitMove {
  const tl = onGrid(wardenLockdownTimeline(back));
  const fps = stand ? 8 : 30;
  const base = { ...REST, ...WARDEN_REST };
  const poses = stand ? idlePoses().map((q) => ({ ...base, ...q })) : clipPoses(tl.keys, base, fps);
  const { ax, ay } = WARDEN_CANVAS;
  const frames: KitFrame[] = poses.map((q, i) => {
    let j: WardenSeen | null = null;
    WARDEN_SEEN.see = (x) => (j = x);
    paintWarden(q, back);
    WARDEN_SEEN.see = null;
    const s = j as unknown as WardenSeen;
    return {
      t: i / fps,
      pts: { head: toGame(s.head, ax, ay), hips: toGame(s.hips, ax, ay), butt: toGame(s.butt, ax, ay), lead: toGame(s.lead, ax, ay), elbowL: toGame(s.elbowL, ax, ay), elbowR: toGame(s.elbowR, ax, ay), maulHead: toGame(s.maulHead, ax, ay) },
      soles: [toGame(s.soles[0], ax, ay), toGame(s.soles[1], ax, ay)],
      down: [true, true],
      tip: s.keys ? toGame(s.keys, ax, ay) : null,
      smeared: q.sweep >= 4,
    };
  });
  return stand ? { name: 'stand', frames, round: true } : { name: 'lockdown', frames, hit: tl.hit, strike: [LOCKDOWN_HIT - 1 / 30, LOCKDOWN_HIT] };
}

test('1. the switches are off, nothing of the game imports the mock-up, and every frame they had is the same with the switches on', () => {
  assert.equal(ARCHER_RAIN.on, false, 'ARCHER_RAIN is off');
  assert.equal(WARDEN_LOCKDOWN.on, false, 'WARDEN_LOCKDOWN is off');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || /^art\/action_f1_(fx|checks)\.ts$/.test(f)) continue;
    assert.ok(!/from ['"][^'"]*action_f1_(fx|checks)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  const was = WARDEN_MOVES.on;
  for (const moves of [false, true]) {
    WARDEN_MOVES.on = moves;
    try {
      for (const [who, make] of [['archer', () => makeArcherArt()], ['warden', () => makeWardenArt()]] as const) {
        const off: ActorArt = make();
        assert.ok(!off.front.clips?.moves?.rain && !off.front.clips?.moves?.lockdown && !off.back.clips?.moves?.rain && !off.back.clips?.moves?.lockdown, `${who}: no new move with its switch off`);
        const on: ActorArt = withSwitches(make);
        for (const v of ['front', 'back'] as const) {
          const a = lists(off[v]);
          const b = lists(on[v]).filter(([n]) => n !== 'moves.rain' && n !== 'moves.lockdown');
          assert.equal(a.map(([n]) => n).join(), b.map(([n]) => n).join(), `${who} ${v}: the same lists`);
          a.forEach(([n, fr], li) => {
            assert.equal(fr.length, b[li][1].length, `${who} ${v} ${n}: as many frames`);
            fr.forEach((sp, i) => assert.equal(unlike(sp, b[li][1][i]), 0, `${who} ${v} ${n} ${i} is the same with the switch on`));
          });
        }
      }
    } finally {
      WARDEN_MOVES.on = was;
    }
  }
});

test('2. with the switches on, the archer has its rain and the Warden his Lockdown, each a clip, the blow on its frame', () => {
  const archer = withSwitches(() => makeArcherArt());
  const warden = withSwitches(() => makeWardenArt());
  for (const v of ['front', 'back'] as const) {
    const rain = archer[v].clips?.moves?.rain as Clip;
    assert.ok(rain && rain.frames.length === Math.round((RAIN_LOOSE + 0.82) * 30) + 1 && Math.abs((rain.hit ?? 0) - RAIN_LOOSE) < 1e-9, `archer ${v}: its rain, loosed on frame ${RAIN_LOOSE * 30}`);
    const ld = warden[v].clips?.moves?.lockdown as Clip;
    assert.ok(ld && ld.frames.length === Math.round((LOCKDOWN_HIT + 0.95) * 30) + 1 && Math.abs((ld.hit ?? 0) - LOCKDOWN_HIT) < 1e-9, `warden ${v}: his Lockdown, the keys down on frame ${LOCKDOWN_HIT * 30}`);
  }
});

test('3. every frame of the new moves paints, wears the pink edge, is crisp, has no cyan, and nothing of it is cut off', () => {
  const archer = withSwitches(() => makeArcherArt());
  const warden = withSwitches(() => makeWardenArt());
  for (const [who, art, move, least, rims] of [['archer', archer, 'rain', 400, 40], ['warden', warden, 'lockdown', 1500, 80]] as const) {
    for (const v of ['front', 'back'] as const) {
      (art[v].clips?.moves?.[move] as Clip).frames.forEach((sp, i) => {
        const l = look(paintingOf(sp), sp.lights);
        assert.ok(l.painted > least, `${who} ${v} ${i}: only ${l.painted} pixels`);
        assert.ok(l.rim > rims, `${who} ${v} ${i}: the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${who} ${v} ${i}: pixels neither see-through nor whole`);
        assert.equal(l.cyan, null, `${who} ${v} ${i}: a friend's colour`);
      });
    }
  }
  // (cut off: the rigs' own canvases, before they are trimmed: nothing on their edge)
  for (const back of [false, true]) {
    for (const { p } of archerFrames(back, onGrid(archerRainTimeline(back)).keys, 30, ARCHER_REST)) assert.ok(!look(p.px).edge, `archer ${back ? 'back' : 'front'}: cut off by its canvas`);
    for (const q of clipPoses(onGrid(wardenLockdownTimeline(back)).keys, { ...REST, ...WARDEN_REST }, 30)) assert.ok(!look(paintWarden(q, back).px).edge, `warden ${back ? 'back' : 'front'}: cut off by his canvas`);
  }
});

test('4. every frame through the bosses’ review, from in front and from behind, with its handing over to and from the stand', () => {
  const said: string[] = [];
  for (const back of [false, true]) {
    const v = back ? 'back' : 'front';
    for (const f of checkKit(archerKit(back, 'rain', false), archerKit(back, 'stand', true))) said.push(`archer ${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
    for (const f of checkKit(wardenKit(back, false), wardenKit(back, true))) said.push(`warden ${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
  }
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
});

test('5. the arrow passes the archer’s face and never through it; the keys are never in the Warden’s head', () => {
  for (const back of [false, true]) {
    for (const { seen: j, q } of archerFrames(back, onGrid(archerRainTimeline(back)).keys, 30, ARCHER_REST)) {
      if (back || !j.tip || q.sweep >= 4 || q.off > 0.5) continue;
      // (from in front: the line of the arrow on the string, from the string hand to its head, keeps off the middle of the face)
      const [a, b, c] = [j.free, j.tip, j.head];
      const ab: V = [b[0] - a[0], b[1] - a[1]];
      const k = Math.max(0, Math.min(1, ((c[0] - a[0]) * ab[0] + (c[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2)));
      const d = Math.hypot(a[0] + ab[0] * k - c[0], a[1] + ab[1] * k - c[1]);
      if (q.act > 0.9) assert.ok(d >= 5, `the drawn arrow crosses the face (${d.toFixed(1)} px from its middle)`);
    }
    for (const q of clipPoses(onGrid(wardenLockdownTimeline(back)).keys, { ...REST, ...WARDEN_REST }, 30)) {
      let j: WardenSeen | null = null;
      WARDEN_SEEN.see = (x) => (j = x);
      paintWarden(q, back);
      WARDEN_SEEN.see = null;
      const s = j as unknown as WardenSeen;
      if (s.keys) assert.ok(Math.hypot(s.keys[0] - s.head[0], s.keys[1] - s.head[1]) > 16, `the keys in his head (${back ? 'back' : 'front'})`);
    }
  }
});

test('6. Movement 9: a big held wind-up, a strike of one frame', () => {
  for (const back of [false, true]) {
    const a = archerKit(back, 'rain', false);
    const w = wardenKit(back, false);
    for (const [who, m, hold] of [['archer', a, 0.38], ['warden', w, 0.5]] as const) {
      // (the end it strikes with held within a game pixel a frame, before the blow)
      let run = 0;
      let most = 0;
      for (let i = 1; i < m.frames.length; i++) {
        const p = m.frames[i].tip;
        const o = m.frames[i - 1].tip;
        if (m.frames[i].t >= (m.hit ?? 0) - 1e-6) break;
        run = p && o && Math.hypot(p[0] - o[0], p[1] - o[1]) < 1 ? run + 1 : 0;
        most = Math.max(most, run);
      }
      assert.ok(most / 30 >= hold, `${who} ${back ? 'back' : 'front'}: held ${(most / 30).toFixed(2)} s`);
      const s = m.strike as readonly [number, number];
      assert.ok(Math.round((s[1] - s[0]) * 30) === 1, `${who}: a strike of one frame`);
    }
  }
});

test('7. the rain: its numbers; nothing cut off, crisp, no cyan; the ring filling, denser as it comes; a two-frame strike; then gone', () => {
  assert.ok(RAIN.radius >= 1.8 && RAIN.radius <= 2.2, 'the ring 1.8 to 2.2 tiles');
  assert.ok(Math.abs(RAIN.delay - 1.5) < 1e-9 && Math.abs(RAIN.strike[1] - RAIN.delay) < 1e-9 && Math.round((RAIN.strike[1] - RAIN.strike[0]) * 30) === 1, 'the strike 1.5 s after the loose, two frames');
  for (const view of VIEWS) {
    // (where the loosed arrow leaves the frame of the loose is where the rise picks it up)
    const back = view === 'back';
    const loose = archerFrames(back, onGrid(archerRainTimeline(back)).keys, 30, ARCHER_REST)[Math.round(RAIN_LOOSE * 30)];
    assert.ok(loose.seen.tip && Math.abs(loose.seen.tip[0] - KAX - LOOSE_HEAD[view][0]) < 1 && Math.abs(loose.seen.tip[1] - KAY - LOOSE_HEAD[view][1]) < 1, `${view}: LOOSE_HEAD is where the frame of the loose has the arrowhead`);
    for (const radius of [1.8, 2.0, 2.2]) {
      for (let i = 0; i <= Math.round((RAIN_LONG + 0.1) * 30); i++) {
        const t = i / 30;
        for (const layer of ['floor', 'air'] as const) {
          const p = rainPainted(t, view, layer, radius);
          const l = look(p.px, p.lights);
          assert.ok(!l.edge, `${view} ${layer} r${radius} @${t.toFixed(2)}: cut off`);
          assert.equal(l.odd, 0, `${view} ${layer} @${t.toFixed(2)}: not crisp`);
          assert.equal(l.cyan, null, `${view} ${layer} @${t.toFixed(2)}: cyan`);
          if (t > RAIN_LONG + 1e-6) assert.equal(l.painted, 0, `${view} ${layer} @${t.toFixed(2)}: something left after`);
          if (layer === 'air' && t < RAIN.strike[0] - 1e-6) assert.equal(l.painted, 0, `${view} @${t.toFixed(2)}: arrows in the air before the strike`);
        }
      }
    }
    const pink = (t: number): number => look(rainPainted(t, view, 'floor').px).rim;
    assert.ok(pink(0.1) > 150 && pink(1.2) > 150, `${view}: the ring of the enemy's pink (${pink(0.1)}, ${pink(1.2)})`);
    const dark = (t: number): number => {
      const p = rainPainted(t, view, 'floor').px;
      let n = 0;
      for (let k = 0; k < p.d.length; k += 4) if (p.d[k + 3] && p.d[k] < 40 && p.d[k + 1] < 40 && p.d[k + 2] < 50) n++;
      return n;
    };
    assert.ok(dark(1.35) > dark(0.95) && dark(0.95) > dark(0.7) && dark(0.7) > 0, `${view}: the shadows denser as it comes (${dark(0.7)}, ${dark(0.95)}, ${dark(1.35)})`);
    const air = (t: number): number => look(rainPainted(t, view, 'air').px).painted;
    assert.ok(air(RAIN.strike[0]) > 400 && air(RAIN.delay) > 300 && air(RAIN.delay + RAIN.stuck - 0.05) > 200 && air(RAIN_LONG - 1e-3) < air(RAIN.delay + 0.3) / 3, `${view}: streaks, stuck, then crumbling (${air(RAIN.strike[0])}, ${air(RAIN.delay)}, ${air(RAIN_LONG - 1e-3)})`);
    for (let i = 0; i <= 12; i++) {
      const p = rainRisePainted(i / 30, view);
      const l = look(p.px, p.lights);
      assert.ok(!l.edge && l.odd === 0 && l.cyan === null, `${view}: the rising arrow at frame ${i}`);
      if (i === 0 || i / 30 > RAIN.rise + 1e-6) assert.equal(l.painted, 0, `${view}: the rising arrow only after the loose and until it is gone (${i})`);
      else assert.ok(l.painted > 10, `${view}: the rising arrow at frame ${i}`);
    }
  }
});

test('8. the Lockdown’s bars: rows 2.5 to 3 tiles apart, cells to stand in; nothing cut off; shadows first; a two-frame crash; then gone', () => {
  assert.ok(LOCKDOWN.cell >= 2.5 && LOCKDOWN.cell <= 3, 'rows 2.5 to 3 tiles apart');
  assert.ok(LOCKDOWN.cell - 2 * LOCKDOWN.band >= 1.5, 'a cell leaves a square of 1.5 tiles or more to stand in');
  assert.ok(Math.round((LOCKDOWN.strike[1] - LOCKDOWN.strike[0]) * 30) === 1 && LOCKDOWN.warn >= 0.9, 'the shadows a second ahead; the crash two frames');
  const rows = lockRows([-1, -1.5], 9);
  assert.ok(!lockStrikes(rows, -1, -1.5), 'the Warden is in the middle of a cell');
  assert.ok(!lockStrikes(rows, -1 + LOCKDOWN.cell, -1.5) && lockStrikes(rows, -1 + LOCKDOWN.cell / 2, -1.5), 'the next cell is safe; the row between is not');
  for (const way of ['x', 'y'] as Way[]) {
    for (const tiles of [1, 3, 7]) {
      const C = lockCanvas(tiles);
      for (let i = -Math.round(LOCKDOWN.warn * 30) - 2; i <= Math.round((LOCKDOWN_LONG + 0.1) * 30); i++) {
        const t = i / 30;
        for (const p of [lockShadowPainted(way, t, tiles), lockBarsPainted(way, t, tiles, tiles)]) {
          assert.equal(p.px.w, C.w);
          const l = look(p.px, p.lights);
          assert.ok(!l.edge, `${way} ${tiles} @${t.toFixed(2)}: cut off`);
          assert.equal(l.odd, 0, `${way} ${tiles} @${t.toFixed(2)}: not crisp`);
          assert.equal(l.cyan, null, `${way} ${tiles} @${t.toFixed(2)}: cyan`);
          if (t < -LOCKDOWN.warn - 1e-6 || t > LOCKDOWN_LONG + 1e-6) assert.equal(l.painted, 0, `${way} ${tiles} @${t.toFixed(2)}: something there before or after`);
        }
        const bars = look(lockBarsPainted(way, t, tiles).px).painted;
        if (t < LOCKDOWN.strike[0] - 1e-6) assert.equal(bars, 0, `${way} ${tiles} @${t.toFixed(2)}: bars before the crash`);
      }
      const sh = (t: number): ReturnType<typeof look> => look(lockShadowPainted(way, t, tiles).px);
      // (a soft dark band first, its pink edges coming as it sharpens)
      assert.ok(sh(-0.9).painted > 100 * tiles && sh(-0.9).rim === 0 && sh(-0.3).rim > 10 * tiles && sh(-0.1).rim > 10 * tiles, `${way} ${tiles}: the shadow soft, then pink-edged`);
      // (planted, the bars stand their full height over their feet)
      const p = lockBarsPainted(way, 0, tiles).px;
      let top = p.h;
      for (let y = 0; y < p.h && top === p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3]) top = y;
      const highestFoot = C.ay - 8 * tiles + 2;
      assert.ok(highestFoot - top >= LOCKDOWN.tall - 2, `${way} ${tiles}: the bars stand ${highestFoot - top} high`);
      assert.ok(look(lockBarsPainted(way, LOCKDOWN.strike[0], tiles).px).painted > 200 * tiles, `${way} ${tiles}: the crash's first frame, a streak`);
      const whole = (p: Px): number => look(p).painted - look(p).rim;
      assert.ok(whole(lockBarsPainted(way, LOCKDOWN_LONG - 0.02, tiles).px) < whole(lockBarsPainted(way, 1, tiles).px) / 4, `${way} ${tiles}: risen away`);
    }
  }
});
