// PACK LEADERS (9 Oct 2026): THE SKELETON CHAMPION (src/art/new_mobs3.ts CHAMPION) and THE RINGS THAT
// TELL BLUE AND YELLOW PACKS APART (src/render/pack_marks.ts). A mock-up, behind switches that are off.
// The owner's words in the main chat (its post of 08:30): "The skeleton champion, who let’s say has an
// old rusty helmet and a two handed sword, has Flame, and the smaller minions would essentially have a
// 50% Flame." His brief, answered by 11:51 ("A head taller", "Proud and heavy", "Cleave and a rallying
// cry", "To his knees on his sword", each our pick); his yes to the pictures by 12:19. So:
//   1. the switches are off, and the champion is not in the list of the new three;
//   2. the champion paints in every pose, both ways round, with nothing cyan, the pink edge while he
//      lives and none as he dies; and he is a head taller than his skeletons;
//   3. his march goes round, and his feet grip the floor;
//   4. he is made as the game takes a monster: both facings, every list and clip, his cleave's blow
//      and his cry on their frames, his march shown to match a pace;
//   5. his warning is his own: his eyes flare in his helm's slit; and it is not his cry;
//   6. his cry: the sword raised high over him, a light at its point, embers rising round him;
//   7. he dies to his knees on his sword, and the sword is left standing in the floor;
//   8. the rings: a blue pack's is blue, with its word's colour inside it; a yellow pack's leader's is
//      gold, and further out (his word is written inside it); a minion's is gold and broken, half of
//      it there, and fills with the word as its leader cries out; nothing of them cyan.
//   run: tsx --test tests/pack_leaders.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { AnimSet, Clip } from '../src/art/actor_types';
import { WORD_COLOR } from '../src/art/icons';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { DEATH_FPS, ENEMY_RIM } from '../src/art/mkit';
import { CHAMPION, CHAMPION_HIT, NEW_MOBS, NEW_MOBS_LIST, RALLY_CRY, TILE3, deathOfMob, makeChampionArt3, paintMob, skeletonAt, walkFpsAt } from '../src/art/new_mobs3';
import { makeSkeletonArt3 } from '../src/art/monster_bones3';
import { RARITY_COLOR } from '../src/art/palette';
import { PACK_MARKS, drawPackMark } from '../src/render/pack_marks';
import type { PackMark } from '../src/render/pack_marks';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

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
const cyanColour = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
};
const differ = (a: Px, b: Px): number => {
  let n = 0;
  for (let i = 0; i < a.d.length; i += 4) if (a.d[i] !== b.d[i] || a.d[i + 1] !== b.d[i + 1] || a.d[i + 2] !== b.d[i + 2] || a.d[i + 3] !== b.d[i + 3]) n++;
  return n;
};
/** The highest painted row of a frame, as far above its floor point as it is (picture pixels). */
function top(sp: Sprite): number {
  const p = paintingOf(sp);
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3] > 0) return Math.round(sp.ay * (sp.density ?? 1)) - y;
  return 0;
}
const frameAt = (c: Clip, t: number): Sprite => c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];

const ART = makeChampionArt3();

test('the switches are off, and the champion is not one of the new three', () => {
  assert.equal(NEW_MOBS.on, false);
  assert.equal(PACK_MARKS.on, false);
  assert.ok(!NEW_MOBS_LIST.includes(CHAMPION), 'the new three stay three');
});

test('he paints in every pose both ways round: nothing cyan, his pink edge while he lives and none as he dies; and he is a head taller than his skeletons', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const poses: { name: string; living: boolean; px: () => Px }[] = [];
  for (const view of ['front', 'back'] as const) {
    for (const [which, t] of [['stand', 0], ['stand', 1.1], ['walk', 0], ['walk', 0.35], ['attack', CHAMPION.warn], ['attack', CHAMPION_HIT], ['attack', CHAMPION_HIT + 0.2], ['rally', 0.55], ['rally', RALLY_CRY], ['rally', RALLY_CRY + 0.2], ['reel', 0.06]] as const) poses.push({ name: `${which} ${t} ${view}`, living: true, px: () => paintMob(CHAMPION, which, t, view).px });
    for (const k of [0, 0.3, 0.55, 0.8, 1]) poses.push({ name: `dying ${k} ${view}`, living: false, px: () => deathOfMob(CHAMPION, k, view).px });
  }
  for (const p of poses) {
    const d = p.px().d;
    let n = 0;
    let rim = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      n++;
      assert.ok(!FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !cyanGlow(d[i], d[i + 1], d[i + 2]), `${p.name}: cyan`);
      if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
    }
    assert.ok(n > 300, `${p.name}: only ${n} pixels`);
    if (p.living) assert.ok(rim > 30, `${p.name}: his pink edge (${rim})`);
    else assert.equal(rim, 0, `${p.name}: an edge on the dying`);
  }
  const skel = top(makeSkeletonArt3().front.idle[0]);
  const him = top(ART.front.idle[0]);
  assert.ok(him > skel + 8 && him < skel + 30, `a head taller than his skeletons (${skel} and ${him} picture pixels up)`);
});

test('his march goes round, and his feet grip the floor', () => {
  for (const view of ['front', 'back'] as const) {
    const n = CHAMPION.walkFrames;
    const a = paintMob(CHAMPION, 'walk', 0, view).px;
    const b = paintMob(CHAMPION, 'walk', n / CHAMPION.walkFps, view).px;
    assert.equal(differ(a, b), 0, `${view}: the round closes`);
  }
  const n = CHAMPION.walkFrames;
  const d = (CHAMPION.pace * TILE3) / CHAMPION.walkFps;
  const down = (z: number): boolean => Math.abs(z - CHAMPION.build.ankle) < 0.05;
  const seen = { L: 0, R: 0 };
  for (let i = 0; i < n; i++) {
    const a = skeletonAt(CHAMPION, 'walk', i / CHAMPION.walkFps);
    const b = skeletonAt(CHAMPION, 'walk', (i + 1) / CHAMPION.walkFps);
    assert.ok(down(a.ankleL[2]) || down(a.ankleR[2]), `frame ${i} has no foot on the floor`);
    for (const side of ['L', 'R'] as const) {
      const fa = side === 'L' ? a.ankleL : a.ankleR;
      const fb = side === 'L' ? b.ankleL : b.ankleR;
      if (down(fa[2])) seen[side]++;
      if (!down(fa[2]) || !down(fb[2])) continue;
      const slid = Math.hypot(fb[0] + (i + 1) * d - (fa[0] + i * d), fb[1] - fa[1]);
      assert.ok(slid < 0.25, `the ${side === 'L' ? 'left' : 'right'} foot slides ${slid.toFixed(2)} between frames ${i} and ${i + 1}`);
    }
  }
  assert.ok(seen.L >= 3 && seen.R >= 3, `each foot is down for a while (${seen.L}, ${seen.R} frames)`);
});

/** Every frame of a facing, by what it is: the living, and the dying. */
function framesOf(set: AnimSet): { living: Sprite[]; dying: Sprite[] } {
  const c = set.clips ?? {};
  return { living: [...set.idle, ...set.walk, ...set.attack, ...(c.attack?.frames ?? []), ...(c.reel?.frames ?? []), ...(c.moves?.rally?.frames ?? [])], dying: [...(c.die?.frames ?? [])] };
}

test('he is made as the game takes a monster: both facings, every list and clip, his blow and his cry on their frames, his march matched to a pace', () => {
  for (const view of ['front', 'back'] as const) {
    const set = ART[view];
    const c = set.clips ?? {};
    assert.equal(set.idle.length, CHAMPION.idleFrames);
    assert.equal(set.walk.length, CHAMPION.walkFrames);
    assert.ok(c.attack && c.attack.hit === CHAMPION_HIT && Math.abs(CHAMPION_HIT * 30 - Math.round(CHAMPION_HIT * 30)) < 1e-9, `${view}: his cleave, its blow on a frame`);
    const rally = c.moves?.rally;
    assert.ok(rally && rally.hit === RALLY_CRY && rally.frames.length > 40 && rally.loop === undefined, `${view}: his cry, a clip played once, the cry on its frame`);
    assert.ok(c.die && c.die.fps === DEATH_FPS && c.die.frames.length === Math.round(CHAMPION.dieTime * DEATH_FPS) + 1, `${view}: his death`);
    assert.ok(c.reel && c.reel.frames.length >= 6, `${view}: struck`);
    const { living, dying } = framesOf(set);
    for (const sp of [...living, ...dying]) assert.ok(sp.w > 0 && sp.h > 0, `${view}: an empty frame`);
    for (const sp of living) for (const l of [...(sp.lights ?? []), ...(sp.aura ? [sp.aura] : [])]) assert.ok(!cyanColour(l.color), `${view}: a cyan light`);
    if (c.die) assert.ok(!c.die.frames[c.die.frames.length - 1].lights?.length, `${view}: light in what is left`);
  }
  assert.ok(Math.abs((makeChampionArt3(CHAMPION.pace * 2).front.walkFps ?? 0) - walkFpsAt(CHAMPION, CHAMPION.pace * 2)) < 1e-9 && walkFpsAt(CHAMPION, CHAMPION.pace * 2) === CHAMPION.walkFps * 2, 'his march is matched to the pace');
});

test('his warning is his own: his eyes flare in his helm’s slit as he winds up; and it is not his cry', () => {
  for (const view of ['front'] as const) {
    const calm = paintMob(CHAMPION, 'stand', 0, view);
    const held = paintMob(CHAMPION, 'attack', CHAMPION.warn, view);
    const strength = (ls: ReadonlyArray<{ r: number; a?: number }>): number => ls.reduce((s, l) => s + l.r * (l.a ?? 1), 0);
    assert.ok(strength(held.lights) > strength(calm.lights) * 1.2, `${view}: his eyes flare (${strength(calm.lights).toFixed(1)} then ${strength(held.lights).toFixed(1)})`);
    const cry = paintMob(CHAMPION, 'rally', RALLY_CRY, view);
    assert.ok(differ(held.px, cry.px) > 600, `${view}: the warning is not the cry`);
  }
});

test('his cry: the sword raised high over him, a light at its point, embers rising round him', () => {
  for (const [view, set] of [['front', ART.front], ['back', ART.back]] as const) {
    const rally = set.clips?.moves?.rally as Clip;
    const standing = top(set.idle[0]);
    const cry = frameAt(rally, RALLY_CRY);
    // (in both hands, over his helm and its crest)
    assert.ok(top(cry) > standing + 7, `${view}: the sword raised high (${standing} then ${top(cry)} up)`);
    const big = (sp: Sprite): number => Math.max(0, ...(sp.lights ?? []).map((l) => l.r));
    // (lights in the game's own pixels: a picture pixel is half of one)
    assert.ok(big(cry) >= 8, `${view}: a light at its point (${big(cry)})`);
    assert.ok(big(frameAt(rally, 0.1)) < 4, `${view}: not before he raises it (${big(frameAt(rally, 0.1))})`);
  }
});

test('he dies to his knees on his sword, and the sword is left standing in the floor', () => {
  // (on his knees: his pelvis low, his hands on the hilt where they were, the sword planted as it was)
  const stood = skeletonAt(CHAMPION, 'stand', 0);
  const knelt = skeletonAt(CHAMPION, 'dying', 0.8);
  assert.ok(knelt.pelvis[2] < stood.pelvis[2] - 12, `on his knees (his pelvis ${stood.pelvis[2].toFixed(1)} then ${knelt.pelvis[2].toFixed(1)} up)`);
  assert.ok(Math.hypot(knelt.handR[0] - stood.handR[0], knelt.handR[1] - stood.handR[1], knelt.handR[2] - stood.handR[2]) < 0.6 && knelt.point[2] < -0.98, 'his hands on the hilt of the sword planted as it was');
  for (const view of ['front', 'back'] as const) {
    // (when all else of him is down, the sword still stands: rows of the picture right up to its pommel)
    const last = deathOfMob(CHAMPION, 1, view).px;
    let rows = 0;
    for (let y = 0; y < last.h; y++) {
      let has = false;
      for (let x = 0; x < last.w && !has; x++) if (last.d[(y * last.w + x) * 4 + 3] > 0) has = true;
      if (has) rows++;
    }
    assert.ok(rows > 34, `${view}: his sword still standing (${rows} rows)`);
  }
});

/** A pen that keeps what it is asked to draw. */
function pen(): { g: CanvasRenderingContext2D; dots: { x: number; y: number; c: string; a: number }[] } {
  const dots: { x: number; y: number; c: string; a: number }[] = [];
  const p = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect(x: number, y: number): void {
      dots.push({ x, y, c: this.fillStyle, a: this.globalAlpha });
    },
  };
  return { g: p as unknown as CanvasRenderingContext2D, dots };
}
const ISO = (x: number, y: number): readonly [number, number] => [(x - y) * 16, (x + y) * 8];
function ringOf(mark: PackMark, t = 0): { dots: { x: number; y: number; c: string; a: number }[]; far: (c: string) => number; count: (c: string) => number } {
  const { g, dots } = pen();
  drawPackMark(g, ISO, 0, 0, 0.3, mark, t);
  return {
    dots,
    far: (c) => Math.max(0, ...dots.filter((d) => d.c === c).map((d) => Math.abs(d.x))),
    count: (c) => dots.filter((d) => d.c === c && d.a > 0.05).length,
  };
}

test('the rings: blue for a blue pack, its word inside; gold for a yellow pack, the leader’s further out, a minion’s broken and filling as he cries; nothing cyan', () => {
  const fire = WORD_COLOR.fire;
  const blue = ringOf({ rarity: 'blue', words: ['fire'] });
  assert.ok(blue.count(RARITY_COLOR[1]) > 30 && blue.count(fire) > 6 && blue.count(RARITY_COLOR[2]) === 0, 'a blue pack: blue, with its word inside, and no gold');
  assert.ok(blue.far(fire) < blue.far(RARITY_COLOR[1]), 'its word inside the blue');
  const leader = ringOf({ rarity: 'leader', words: ['fire'] });
  const minion = ringOf({ rarity: 'minion', words: ['fire'] });
  assert.ok(leader.count(RARITY_COLOR[2]) > 60 && leader.count(RARITY_COLOR[1]) === 0, 'a leader: gold, and no blue');
  assert.ok(leader.far(RARITY_COLOR[2]) > minion.far(RARITY_COLOR[2]) + 10, 'the leader’s ring further out than a minion’s (his word is written inside it)');
  const whole = ringOf({ rarity: 'blue', words: ['fire'] }).count(RARITY_COLOR[1]);
  assert.ok(minion.count(RARITY_COLOR[2]) > whole * 0.35 && minion.count(RARITY_COLOR[2]) < whole * 0.65 && minion.count(fire) === 0, `a minion: half a gold ring (${minion.count(RARITY_COLOR[2])} of ${whole})`);
  const crying = ringOf({ rarity: 'minion', words: ['fire'], cry: 1 });
  assert.ok(crying.count(fire) > whole * 0.35, 'as its leader cries out, its gaps fill with his word');
  for (const r of [blue, leader, minion, crying]) for (const d of r.dots) assert.ok(!cyanColour(d.c), `nothing cyan (${d.c})`);
});
