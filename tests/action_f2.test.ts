// FLOOR 2'S ENEMIES, MORE ACTION, AND THE HEADSMAN'S AXE MENDED (the art chat's helper, 31 Oct 2026; docs/mockups/action_f2/README.md).
// His picks of 31 Oct: the cultist's FIRE SIGIL, “Yes (Recommended)”; the Shade, “Keep the rake”, and for FROST the Shade; and of
// the Headsman, “His axe is still spinning around and kinda wonky”, asked when: “His axe wheel,Walking or standing,His flurry or lunge”.
// So:
//   1. the switches are off (CULTIST_SIGIL, SHADE_FROST), nothing of the game imports the mock-up's files, and with the switches on
//      every frame the cultist and the Shade had is the same but the cultist's attack (the sigil in place of the bolt) and the
//      Shade's rake (the cold added); the cast is a clip, its slam on its frame;
//   2. every frame of the cast and of the cold rake paints, wears the enemy's pink edge, is crisp, has nothing of the friend's
//      cyan, and nothing of it is cut off by its canvas; the frost's colours well clear of the cyan;
//   3. the cast through the bosses' review (art/action_f1_checks.ts checkKit: the old 2D rig), from in front and from behind,
//      with its handing over to and from the stand; and Movement 9 (the fire held up over half a second, the slam one frame);
//   4. the cold Shade through the bosses' review (art/boss_checks.ts checkBoss), from in front and from behind: what it finds is
//      what it finds of the game's own Shade, the frost changing nothing of how it moves;
//   5. the sigil: its numbers; the ring traced in step with the cultist's hand; the pink edge before the eruption; the eruption
//      two frames, a streak then the pillar; the pillar falls; the floor burns on, shrinking in; nothing after; nothing cut off at
//      1.5, 1.75 and 2 tiles; crisp; no cyan;
//   6. the rime: its numbers; it spreads, lies, melts from its edge, is gone; nothing cut off at 1 to 1.25 tiles; crisp; no cyan;
//      only the frost's colours and the enemy's pink;
//   7. THE HEADSMAN'S MEND: with AXE_HELD off he is every frame as he was; the moves it does not touch are the same with it on;
//      with it on his blade turns round its haft no more than 22 degrees a frame in any move (as it was: 60), not at all as he
//      sets off, walks and stops (as it was: 70 degrees each time), and turns in his grip a few degrees only from the lunge's
//      follow-through to his guard (as it was: 142); the wheel's haft stays in its wheel at every moment between its frames (as
//      it was: 17 degrees out of it, twice a turn, where the wheel of fire is drawn through those moments).
//   run: tsx --test tests/action_f2.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { clipPoses } from '../src/art/clip';
import { BLADE, CYAN, GLINT, IDLE_FPS, KAX, KAY, REST, RIM_ALPHA, SPARK, idlePoses } from '../src/art/kit';
import type { Pose, V } from '../src/art/kit';
import { ENEMY_RIM, onGrid } from '../src/art/mkit';
import { CULTIST_SEEN, CULTIST_SIGIL, SIGIL_SLAM, SIGIL_TRACE, cultistSigilTimeline, makeCultistArt, paintCultist } from '../src/art/monster_cultist';
import type { CultistSeen } from '../src/art/monster_cultist';
import { FROST, FROST_SHADE, PILLAR_TALL, RIME, RIME_CANVAS, SHADE_FROST, SIGIL, SIGIL_CANVAS, SIGIL_LONG, burnRadius, makeFrostShadeArt, rimeEdge, rimeHolds, rimePainted, sigilPainted, sigilStrikes } from '../src/art/action_f2_fx';
import { checkKit } from '../src/art/action_f1_checks';
import type { KitFrame, KitMove } from '../src/art/action_f1_checks';
import { checkBoss } from '../src/art/boss_checks';
import type { BossShape } from '../src/art/boss_checks';
import { SHADE, makeShadeArt3, mobSet, paintMob, posedOfMob } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';
import { AXE_HELD, axe2Of } from '../src/art/headsman2';
import { HEADSMAN_2, H2_LUNGE_HIT, H2_WHEEL, headsman2Mob } from '../src/art/headsman2_moves';
import { cross, dot, heading, len, lerp3, mul, norm, solve } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
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
interface Hasher {
  update(d: unknown): Hasher;
  digest(e: string): string;
}
const crypto = nodeCrypto as { createHash(a: string): Hasher };

paintWithoutCanvas();

// (pure white is the heart of the cultist's own fire, as the game has it: not the friend's)
const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
function hueOf(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return [0, 0, max];
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return [(h + 360) % 360, (max - min) / max, max];
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const [h, s, max] = hueOf(r, g, b);
  return max >= 150 && s >= 0.45 && h >= 165 && h <= 205;
}
const rimKey = rgba(ENEMY_RIM).slice(0, 3).join(',');
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; edge: boolean; colours: Set<string> } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let cyan: string | null = null;
  let edge = false;
  const colours = new Set<string>();
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      colours.add(k);
      if (k === rimKey) rim++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge, colours };
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
function withSigil<T>(make: () => T): T {
  const was = CULTIST_SIGIL.on;
  CULTIST_SIGIL.on = true;
  try {
    return make();
  } finally {
    CULTIST_SIGIL.on = was;
  }
}

// --- the cultist, frame by frame, as the review sees it ---
const toGame = (p: V, ax: number, ay: number): V => [(p[0] - ax) / 2, (p[1] - ay) / 2];
const CULT_REST: Partial<Pose> = { act: 1 };
function cultFrames(back: boolean, stand: boolean): { q: Pose; seen: CultistSeen; px: Px }[] {
  const base = { ...REST, ...CULT_REST };
  const poses = stand ? idlePoses().map((q) => ({ ...base, ...q })) : clipPoses(onGrid(cultistSigilTimeline(back)).keys as never, base, 30);
  return poses.map((q) => {
    let seen: CultistSeen | null = null;
    CULTIST_SEEN.see = (j) => (seen = j);
    const p = paintCultist(q, back);
    CULTIST_SEEN.see = null;
    return { q, seen: seen as unknown as CultistSeen, px: p.px };
  });
}
function cultKit(back: boolean, stand: boolean): KitMove {
  const fps = stand ? IDLE_FPS : 30;
  const frames: KitFrame[] = cultFrames(back, stand).map(({ q, seen: j }, i) => ({
    t: i / fps,
    pts: { head: toGame(j.head, KAX, KAY), hips: toGame(j.hips, KAX, KAY), hand: toGame(j.hand, KAX, KAY), elbow: toGame(j.elbow, KAX, KAY), knife: toGame(j.knife, KAX, KAY), knifeElbow: toGame(j.knifeElbow, KAX, KAY) },
    soles: [toGame(j.soles[0], KAX, KAY), toGame(j.soles[1], KAX, KAY)],
    down: [j.lifts[0] < 0.05, j.lifts[1] < 0.05],
    tip: toGame(j.hand, KAX, KAY),
    smeared: q.sweep >= 4,
  }));
  return stand ? { name: 'stand', frames, round: true } : { name: 'sigil', frames, hit: SIGIL_SLAM, strike: [SIGIL_SLAM - 1 / 30, SIGIL_SLAM] };
}

test('1. the switches are off, nothing of the game imports the mock-up, and with them on only the cast and the cold rake are new', () => {
  assert.equal(CULTIST_SIGIL.on, false, 'CULTIST_SIGIL is off');
  assert.equal(SHADE_FROST.on, false, 'SHADE_FROST is off');
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (and the game's own floor 2 files, brought in by the main chat behind ACTION_F2: its rules, game/action_f2.ts and game/game.ts;
    // the bestiary's choosing of the Shade's art; its pictures on the floor, render/act1_fx/cultist.ts and shade.ts)
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/action_f2_fx.ts' || ['game/action_f2.ts', 'game/game.ts', 'art/bestiary.ts', 'render/act1_fx/cultist.ts', 'render/act1_fx/shade.ts'].includes(f)) continue;
    assert.ok(!/from ['"][^'"]*action_f2_(fx|scene)['"]/.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  // the cultist: every frame the same with the switch on, but its attack, which is the cast, its slam on its frame
  const off: ActorArt = makeCultistArt();
  const on: ActorArt = withSigil(() => makeCultistArt());
  for (const v of ['front', 'back'] as const) {
    const a = lists(off[v]);
    const b = lists(on[v]);
    assert.equal(a.map(([n]) => n).join(), b.map(([n]) => n).join(), `cultist ${v}: the same lists`);
    a.forEach(([n, fr], li) => {
      if (n === 'attack' || n === 'attack3') return;
      assert.equal(fr.length, b[li][1].length, `cultist ${v} ${n}: as many frames`);
      fr.forEach((sp, i) => assert.equal(unlike(sp, b[li][1][i]), 0, `cultist ${v} ${n} ${i} is the same with the switch on`));
    });
    const cast = on[v].clips?.attack as Clip;
    assert.ok(cast.frames.length === Math.round((SIGIL_SLAM + 0.75) * 30) + 1 && Math.abs((cast.hit ?? 0) - SIGIL_SLAM) < 1e-9, `cultist ${v}: its cast, the slam on frame ${SIGIL_SLAM * 30}`);
    const bolt = off[v].clips?.attack as Clip;
    assert.ok(Math.abs((bolt.hit ?? 0) - 0.75) < 0.02, `cultist ${v}: its bolt with the switch off`);
  }
  // the Shade: the cold one's every frame the game's own, but its rake
  const game = makeShadeArt3();
  const cold = makeFrostShadeArt();
  for (const v of ['front', 'back'] as const) {
    const a = lists(game[v]);
    const b = lists(cold[v]);
    a.forEach(([n, fr], li) => {
      const same = n !== 'attack' && n !== 'attack3';
      let differ = 0;
      fr.forEach((sp, i) => (differ += unlike(sp, b[li][1][i]) > 0 ? 1 : 0));
      if (same) assert.equal(differ, 0, `shade ${v} ${n}: the game's own`);
      else assert.ok(differ > fr.length / 2, `shade ${v} ${n}: cold (${differ} of ${fr.length} frames)`);
    });
  }
});

test('2. every frame of the cast and of the cold rake paints, wears the pink edge, is crisp, has no cyan, nothing cut off; the frost clear of the cyan', () => {
  const on = withSigil(() => makeCultistArt());
  const cold = makeFrostShadeArt();
  for (const [who, art, least, rims] of [['cultist', on, 300, 30], ['shade', cold, 150, 20]] as const) {
    for (const v of ['front', 'back'] as const) {
      (art[v].clips?.attack as Clip).frames.forEach((sp, i) => {
        const l = look(paintingOf(sp), sp.lights);
        assert.ok(l.painted > least, `${who} ${v} ${i}: only ${l.painted} pixels`);
        assert.ok(l.rim > rims, `${who} ${v} ${i}: the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${who} ${v} ${i}: pixels neither see-through nor whole`);
        assert.equal(l.cyan, null, `${who} ${v} ${i}: a friend's colour`);
      });
    }
  }
  for (const back of [false, true]) for (const { px } of cultFrames(back, false)) assert.ok(!look(px).edge, `cultist ${back ? 'back' : 'front'}: cut off by its canvas`);
  // (the cold Shade's canvas is the bones' own, and its frost is on its claws: what its frames have on their edge, none)
  for (const v of ['front', 'back'] as const) for (let f = 0; f <= 25; f++) assert.ok(!look(paintMob(FROST_SHADE, 'attack', f / 30, v).px).edge, `shade ${v} ${f}: cut off`);
  // the frost's colours: a pale grey-blue, hue 215 to 230, never cyan
  for (const c of FROST) {
    const [h, s] = hueOf(...(rgba(c).slice(0, 3) as [number, number, number]));
    assert.ok(h >= 215 && h <= 230 && s <= 0.36, `frost ${c}: hue ${h.toFixed(0)}, ${(s * 100).toFixed(0)} percent`);
    for (const f of [...CYAN, '#22d0e0', '#b8fff8']) {
      const [fh] = hueOf(...(rgba(f).slice(0, 3) as [number, number, number]));
      assert.ok(Math.abs(h - fh) >= 30, `frost ${c} too near the friend's ${f}`);
    }
  }
});

test('3. the cast through the bosses’ review, from in front and from behind, with its handing over; Movement 9: the fire held up, the slam one frame', () => {
  const said: string[] = [];
  for (const back of [false, true]) {
    const v = back ? 'back' : 'front';
    const m = cultKit(back, false);
    for (const f of checkKit(m, cultKit(back, true))) said.push(`cultist ${v} ${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
    // (held: the hand within a game pixel a frame for over half a second before the slam)
    let run = 0;
    let most = 0;
    for (let i = 1; i < m.frames.length; i++) {
      if (m.frames[i].t >= SIGIL_SLAM - 0.07) break;
      const p = m.frames[i].tip as V;
      const o = m.frames[i - 1].tip as V;
      run = Math.hypot(p[0] - o[0], p[1] - o[1]) < 1 ? run + 1 : 0;
      most = Math.max(most, run);
    }
    assert.ok(most / 30 >= 0.45, `cultist ${v}: the fire held up ${(most / 30).toFixed(2)} s`);
    // (and its hand goes round its ring in the air: up at its top, out to the side, down, and back to the top)
    const hs = m.frames.filter((f) => f.t >= SIGIL_TRACE[0] - 1e-6 && f.t <= SIGIL_TRACE[1] + 1e-6).map((f) => f.tip as V);
    const xs = hs.map((p) => p[0]);
    const ys = hs.map((p) => p[1]);
    assert.ok(Math.max(...xs) - Math.min(...xs) >= 6 && Math.max(...ys) - Math.min(...ys) >= 6, `cultist ${v}: its ring in the air ${(Math.max(...xs) - Math.min(...xs)).toFixed(1)} by ${(Math.max(...ys) - Math.min(...ys)).toFixed(1)}`);
  }
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
});

/** The Shade as the review sees it: its arms and its hood, its chest and its hips; it floats (nothing grips the floor); what it strikes with, its right claw. */
const SHADE_SHAPE: BossShape = {
  body: (s) => ({
    limbs: [
      { name: 'upperL', a: s.shoulderL, b: s.elbowL, r: 1.2 },
      { name: 'foreL', a: s.elbowL, b: s.handL, r: 1.0 },
      { name: 'upperR', a: s.shoulderR, b: s.elbowR, r: 1.2 },
      { name: 'foreR', a: s.elbowR, b: s.handR, r: 1.0 },
      { name: 'neck', a: s.neck, b: s.skull, r: 1.6 },
    ],
    lumps: [
      { name: 'hood', c: s.head, rot: s.face, h: [4.2, 3.8, 4.4] },
      { name: 'chest', c: lerp3(s.ribs, s.neck, 0.3), rot: s.chest, h: [3.0, 4.2, 4.0] },
      { name: 'hips', c: s.pelvis, rot: s.hips, h: [3.0, 3.8, 4.0] },
    ],
  }),
  grips: () => [],
  tip: (move, _t, s) => (move === 'attack' ? s.handR : null),
};
test('4. the cold Shade through the bosses’ review, from in front and from behind: what it finds, it finds of the game’s own Shade', () => {
  const said = (m: Mob): string[] => checkBoss(m, SHADE_SHAPE).map((f) => `${f.move}: ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`).sort();
  const cold = said(FROST_SHADE);
  const game = said(SHADE);
  assert.equal(cold.join('\n'), game.join('\n'), 'the frost changes nothing of how it moves');
  // (what it finds of the game's own rake, which he said to keep as it is: its claws set off at their fastest; and, standing, it floats: no weight to shift)
  for (const f of cold) assert.ok(/starts at its fastest|weight never shifts/.test(f), `the review found: ${f}`);
});

test('5. the sigil: its numbers; traced in step with the hand; pink-edged; the eruption a streak then the pillar; it falls, the floor burns on, shrinking; nothing after', () => {
  assert.ok(SIGIL.radius >= 1.5 && SIGIL.radius <= 2.0, 'a ring of 1.5 to 2 tiles');
  assert.ok(Math.abs(SIGIL.delay - (SIGIL_SLAM - SIGIL_TRACE[0])) < 1e-9 && SIGIL.delay >= 0.9 && SIGIL.delay <= 1.2, 'it erupts about a second after it appears: as the cultist begins its ring, and as it slams');
  assert.ok(Math.abs(SIGIL.trace - (SIGIL_TRACE[1] - SIGIL_TRACE[0])) < 1e-9, 'its ring is drawn round as the hand goes round');
  assert.ok(SIGIL.burn >= 2 && SIGIL.burn <= 4, 'it burns on a few seconds');
  assert.ok(sigilStrikes(1.2, 1.2) && !sigilStrikes(1.3, 1.3), 'struck inside the ring');
  let last = Infinity;
  for (let t = 0; t <= SIGIL_LONG + 0.2; t += 0.05) {
    const r = burnRadius(t);
    assert.ok(r <= last + 1e-9, `the fire shrinks in (${t.toFixed(2)} s)`);
    last = r;
  }
  assert.equal(burnRadius(SIGIL_LONG), 0, 'out by its end');
  const C = SIGIL_CANVAS;
  const count = (t: number, layer: 'floor' | 'air', r = SIGIL.radius): number => look(sigilPainted(t, layer, r).px).painted;
  // painted at every frame from its first to its last, at 1.5, 1.75 and 2 tiles: nothing cut off, crisp, no cyan
  for (const r of [1.5, 1.75, 2.0]) {
    for (let f = Math.ceil(-SIGIL.delay * 30); f <= Math.ceil(SIGIL_LONG * 30) + 1; f++) {
      for (const layer of ['floor', 'air'] as const) {
        const p = sigilPainted(f / 30, layer, r);
        const l = look(p.px, p.lights);
        assert.ok(!l.edge, `${layer} at ${(f / 30).toFixed(2)} s (${r} tiles): cut off`);
        assert.equal(l.odd, 0, `${layer} at ${(f / 30).toFixed(2)} s: not crisp`);
        assert.equal(l.cyan, null, `${layer} at ${(f / 30).toFixed(2)} s: cyan`);
      }
    }
  }
  // traced in step with the hand: about half of the ring at half way round
  const half = count(-SIGIL.delay + SIGIL.trace / 2, 'floor');
  const whole = count(-SIGIL.delay + SIGIL.trace, 'floor');
  assert.ok(half > whole * 0.3 && half < whole * 0.7, `half traced: ${half} of ${whole}`);
  // the pink edge before it erupts
  assert.ok(look(sigilPainted(-0.1, 'floor').px).rim === 0 && [...look(sigilPainted(-0.1, 'floor').px).colours].some((k) => ['224,40,122', '255,122,168'].includes(k)), 'the enemy’s pink at its edge');
  // the eruption: nothing standing up but sparks before it; a streak (thin), then the pillar (thick and tall)
  assert.ok(count(-1 / 30, 'air') < 200, 'only sparks before it');
  const streak = count(0, 'air');
  const pillar = count(1 / 30, 'air');
  assert.ok(streak > 800 && pillar > streak * 2, `a streak (${streak}), then the pillar (${pillar})`);
  // the pillar as tall as it is said to be
  const air = sigilPainted(0.1, 'air').px;
  let top = C.h;
  for (let y = 0; y < C.h && top === C.h; y++) for (let x = 0; x < C.w; x++) if (air.d[(y * C.w + x) * 4 + 3]) top = y;
  assert.ok(C.ay - top >= PILLAR_TALL * 0.9, `the pillar ${C.ay - top} pixels tall`);
  // it falls; the floor burns on, less and less; nothing after
  assert.ok(count(SIGIL.pillar + SIGIL.fall + 0.1, 'air') < pillar * 0.5, 'the pillar has fallen');
  assert.ok(count(1.0, 'air') > count(3.0, 'air') && count(3.0, 'air') > 0, 'the floor burns on, shrinking');
  assert.equal(count(SIGIL_LONG + 0.05, 'air') + count(SIGIL_LONG + 0.05, 'floor'), 0, 'nothing after');
  assert.equal(count(-SIGIL.delay - 0.05, 'floor'), 0, 'nothing before');
});

test('6. the rime: its numbers; it spreads, lies, melts from its edge, is gone; nothing cut off; crisp; frost and the enemy’s pink only', () => {
  assert.ok(RIME.radius >= 1.0 && RIME.radius <= 1.25 && RIME.lie >= 3 && RIME.lie <= 5 && RIME.slow > 0 && RIME.slow < 1, 'its numbers');
  assert.ok(rimeHolds(1, 0.5, 0.3) && !rimeHolds(1, 1.3, 0.3) && !rimeHolds(RIME.lie + 0.1, 0, 0), 'it holds who stands in it, while it lies');
  assert.ok(rimeEdge(RIME.form / 3, 0) < rimeEdge(RIME.form, 0) && rimeEdge(RIME.lie - 0.05, 0) < rimeEdge(1, 0), 'it spreads, and melts in from its edge');
  const keys = new Set([...FROST, '#7a1058'].map((c) => rgba(c).slice(0, 3).join(',')));
  for (const r of [1.0, 1.2, 1.25]) {
    for (let f = 0; f <= Math.ceil(RIME.lie * 30) + 2; f++) {
      const p = rimePainted(f / 30, r);
      const l = look(p.px, p.lights);
      assert.ok(!l.edge, `rime at ${(f / 30).toFixed(2)} s (${r} tiles): cut off`);
      assert.equal(l.odd, 0, 'crisp');
      assert.equal(l.cyan, null, 'no cyan');
      for (const k of l.colours) assert.ok(keys.has(k), `rime: a colour not its own (${k})`);
    }
  }
  const n = (t: number): number => look(rimePainted(t).px).painted;
  assert.ok(n(0.05) < n(RIME.form) && n(1) >= n(RIME.form) * 0.95 && n(RIME.lie - 0.1) < n(1) * 0.3 && n(RIME.lie + 0.05) === 0, 'spreads, lies, melts, gone');
  void RIME_CANVAS;
});

// --- THE HEADSMAN'S MEND ---
/** Every frame of a figure, as tools/action_f2_hash.ts hashes it (a hash of each frame, move by move, both ways round; a hash of them all). */
function hashOf(art: ActorArt): string {
  const m: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
    for (const [name, fr] of lists(s)) {
      m[`${view}:${name}`] = fr.map((sp) => {
        const p = paintingOf(sp);
        return crypto.createHash('sha256').update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).digest('hex').slice(0, 12);
      });
    }
  }
  return crypto.createHash('sha256').update(JSON.stringify(m)).digest('hex').slice(0, 16);
}
/** The blade's turn round its haft from frame to frame of a move (degrees), the haft's own turn carried out of it. */
function rolls(mob: Mob, move: string, fps: number, n?: number): number[] {
  const mv = move === 'stand' ? mob.stand : move === 'walk' ? mob.walk : move === 'attack' ? mob.attack : move === 'reel' ? mob.reel : mob.more![move];
  const end = mv.motion.keys[mv.motion.keys.length - 1].at;
  const count = n ?? Math.round(end * fps) + 1;
  const out: number[] = [];
  let prev: [V3, V3] | null = null;
  for (let i = 0; i < count; i++) {
    const t = Math.min(end, i / fps);
    const q = posedOfMob(mob, move, t);
    const a = axe2Of(solve(mob.build, q), q);
    const pt = norm(heading(q.wAz, q.wEl));
    if (prev) {
      const c = cross(prev[0], pt);
      const s = len(c);
      const carried = s < 1e-9 ? prev[1] : ((): V3 => {
        const k = mul(c, 1 / s);
        const ang = Math.atan2(s, dot(prev![0], pt));
        const v = prev![1];
        const kv = cross(k, v);
        return [0, 1, 2].map((j) => v[j] * Math.cos(ang) + kv[j] * Math.sin(ang) + k[j] * dot(k, v) * (1 - Math.cos(ang))) as unknown as V3;
      })();
      out.push((Math.atan2(dot(cross(carried, a.out), pt), dot(carried, a.out)) * 180) / Math.PI);
    }
    prev = [pt, a.out];
  }
  return out;
}
test('7. THE HEADSMAN’S MEND: as he was with it off; untouched moves the same; the blade held firm with it on', () => {
  assert.equal(AXE_HELD.on, true, 'the mend is on');
  AXE_HELD.on = false;
  let wasArt: ActorArt;
  let wasMob: Mob;
  try {
    wasMob = headsman2Mob();
    wasArt = { front: mobSet(wasMob, 'front', wasMob.pace), back: mobSet(wasMob, 'back', wasMob.pace) };
    // (every frame of him as he was before it: tools/action_f2_hash.ts, on 3c7ec44)
    assert.equal(hashOf(wasArt), '0793fd1d4dd562fb', 'with AXE_HELD off he is every frame as he was');
  } finally {
    AXE_HELD.on = true;
  }
  // the moves it does not touch: the same with it on (his stand, his dashes, struck, his death)
  const now: ActorArt = { front: mobSet(HEADSMAN_2, 'front', HEADSMAN_2.pace), back: mobSet(HEADSMAN_2, 'back', HEADSMAN_2.pace) };
  for (const v of ['front', 'back'] as const) {
    const a = lists(wasArt[v]);
    const b = lists(now[v]);
    a.forEach(([n, fr], li) => {
      if (!['idle', 'reel', 'die', 'moves.dashL', 'moves.dashR'].includes(n)) return;
      AXE_HELD.on = false;
      const was = fr.map((sp) => paintingOf(sp));
      AXE_HELD.on = true;
      b[li][1].forEach((sp, i) => {
        const p = paintingOf(sp);
        assert.ok(p.w === was[i].w && p.d.every((x, j) => x === was[i].d[j]), `headsman ${v} ${n} ${i}: as it was`);
      });
    });
  }
  // the blade held firm: no more than 22 degrees round its haft a frame in any move; none as he sets off, walks and stops
  const worst = (mob: Mob, move: string, fps: number, n?: number): number => Math.max(0, ...rolls(mob, move, fps, n).map(Math.abs));
  for (const [move, fps, n] of [['stand', 10, 20], ['walk', 15, 10], ['setOff', 30], ['halt', 30], ['attack', 30], ['flurry', 30], ['wheel', 30], ['vault', 30], ['dashL', 30], ['dashR', 30], ['reel', 30]] as const) {
    const w = worst(HEADSMAN_2, move, fps, n);
    assert.ok(w <= 22, `${move}: the blade turns ${w.toFixed(1)} degrees round its haft in a frame`);
    if (['stand', 'walk', 'setOff', 'halt'].includes(move)) assert.ok(w <= 1, `${move}: the blade turns ${w.toFixed(1)} degrees as he walks or stands`);
  }
  // (as it was, for the record: 60 degrees in a frame in the lunge, 11 as he set off)
  AXE_HELD.on = false;
  try {
    assert.ok(worst(wasMob!, 'attack', 30) > 50 && worst(wasMob!, 'setOff', 30) > 10, 'it was so');
  } finally {
    AXE_HELD.on = true;
  }
  // the lunge's wind-down, from its follow-through to his guard: turned in his grip a few degrees only, all told
  const all = rolls(HEADSMAN_2, 'attack', 30).slice(Math.round((H2_LUNGE_HIT + 0.14) * 30));
  assert.ok(Math.abs(all.reduce((a, b) => a + b, 0)) <= 15, `the lunge's wind-down turns the blade ${all.reduce((a, b) => a + b, 0).toFixed(0)} degrees in his grip`);
  // the wheel: its haft in its wheel (square before him) at every moment of its spin, between the frames too
  for (let t = H2_WHEEL.spin; t <= H2_WHEEL.stop; t += 1 / 240) {
    const q = posedOfMob(HEADSMAN_2, 'wheel', t);
    assert.ok(Math.abs(heading(q.wAz, q.wEl)[0]) < 0.02, `the wheel's haft out of its wheel at ${t.toFixed(3)} s`);
  }
});
