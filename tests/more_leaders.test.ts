// MORE PACK LEADERS (9 Oct 2026): THE BONE MARKSMAN (src/art/new_mobs3.ts MARKSMAN), THE HIGH PRIEST
// (src/art/monster_cultist.ts makeHighPriestArt) AND THE TROLL CHIEFTAIN (src/art/monster_brute.ts
// makeChieftainArt), a yellow pack's leaders of bone archers, of cultists and of trolls. A mock-up:
// nothing of the game makes them. Asked in the art chat who should lead each kind of yellow pack, his
// picks by 14:32: "A bone marksman (Recommended)", "A high priest (Recommended)", "A troll chieftain
// (Recommended)" (and "Bats I dont think need a leader"). Their briefs, each asked as a pop-up: the
// marksman by 14:32, "A head taller (Recommended)", "Still and patient (Recommended)", "His bow snaps
// (Recommended)"; the high priest by 14:41, "Their size", "A slow procession (Recommended)", "His robe
// crumples empty (Recommended)"; the chieftain by 14:41, "Bigger than his trolls (Recommended)", "I
// don’t want the bellow if the Skelton leader has the same thing", "To his knees, then face-first
// (Recommended)". His yes to their pictures: the marksman's by 15:17, the high priest's by 15:34, the
// chieftain's by 15:46. So:
//   1. the switch is off, and nothing of the game makes any of them;
//   2. THE MARKSMAN paints in every pose both ways round, nothing cyan, the pink edge while he lives
//      and none as he dies; and he is a head taller than his archers;
//   3. his walk goes round, and his feet grip the floor;
//   4. he is made as the game takes a monster: both facings, every list and clip, his shot and his
//      great shot on their frames, his walk shown to match a pace;
//   5. his great shot: an arrow drawn from his quiver and raised over his head, its head smouldering;
//      its light gathering as he draws and holds (his warning, and not his plain shot's); a flash and
//      a streak of gold as it goes; and then the light is gone;
//   6. dying, his bow snaps: a flash of bone-white at the break, and none before it; its upper limb
//      flies up; and nothing lit is left of him;
//   7. THE HIGH PRIEST is his cultists' size, known by his mask and his censer, nothing cyan, the pink
//      edge while he lives and none as he dies;
//   8. he is made as the game takes a monster: his fire bolt his cultists', its blow on their frame;
//      his censer's swing with its blow on its frame, held back flaring before it (the warning), its
//      burning smoke streaming as it swings; a slow procession;
//   9. his robe crumples empty: the robe down while his mask still hangs where his face was; then the
//      mask falls onto the heap; nothing lit is left;
//  10. THE TROLL CHIEFTAIN is bigger than his trolls, his crown of antlers over his head and his banner
//      on his back, both ways round, nothing cyan, the pink edge while he lives and none as he dies;
//  11. he is made as the game takes a monster: his trolls' slam and swing, a fifth slower, each blow on
//      its frame; no bellow (his words); heavier on his feet than his trolls;
//  12. he dies to his knees, then face-first, his banner fallen over him and his crown rolled away;
//  13. on the floor: the marksman's line of aim runs out as he draws, and his great arrow flies over
//      its shadow; the priest's burning smoke billows out, burns and thins away; none of it cyan.
//   run: tsx --test tests/more_leaders.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import type { AnimSet, Clip } from '../src/art/actor_types';
import { BLADE, BONE, CYAN, GLINT, REST, RIM_ALPHA, SPARK, dim } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { DEATH_FPS, ENEMY_RIM, FLAME, FLESH, GLOOM, GORE, IRON } from '../src/art/mkit';
import { drawAimLine, drawBurningSmoke, drawGreatArrow } from '../src/art/mob_shots';
import { makeArcherArt3 } from '../src/art/monster_bones3';
import { BANNER, CHIEF_DIE_TIME, SWING_HIT, makeBruteArt, makeChieftainArt, makeGuardianArt } from '../src/art/monster_brute';
import { CENSER_HIT, MASK, PRIEST_DIE_TIME, PROCESSION_FPS, SMOKE, makeCultistArt, makeHighPriestArt, paintCultist, paintHighPriest } from '../src/art/monster_cultist';
import { MARKSMAN, MK_PIERCE_HIT, MK_SHOT_HIT, MK_SNAP, MK_WOOD, NEW_MOBS, NEW_MOBS_LIST, TILE3, deathOfMob, makeMarksmanArt3, paintMob, skeletonAt, walkFpsAt } from '../src/art/new_mobs3';
import { P } from '../src/art/palette';
import { rgba } from '../src/engine/px';
import type { Px, Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

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
/** A set of colours, to look for in a painting. */
const colours = (cs: ReadonlyArray<string>): Set<string> => new Set(cs.map((c) => rgba(c).slice(0, 3).join(',')));
const hasColour = (p: Px, i: number, cs: Set<string> | null): boolean => p.d[i + 3] > 0 && (!cs || cs.has(`${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`));
/** How many pixels of a painting are of these colours. */
function count(p: Px, cs: Set<string>): number {
  let n = 0;
  for (let i = 0; i < p.d.length; i += 4) if (hasColour(p, i, cs)) n++;
  return n;
}
/** The highest row of a painting with a pixel of these colours (any, if none are given) in it; -1 if there is none. */
function topRow(p: Px, cs: Set<string> | null = null): number {
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (hasColour(p, (y * p.w + x) * 4, cs)) return y;
  return -1;
}
/** The highest pixel of a frame of these colours (any, if none are given), as far above its floor point as it is (picture pixels). */
function topUp(sp: Sprite, cs: Set<string> | null = null): number {
  const y = topRow(paintingOf(sp), cs);
  return y < 0 ? -Infinity : Math.round(sp.ay * (sp.density ?? 1)) - y;
}
/** The furthest right a frame has a pixel of these colours, measured from its floor point (picture pixels). */
function rightOf(sp: Sprite, cs: Set<string>): number {
  const p = paintingOf(sp);
  for (let x = p.w - 1; x >= 0; x--) for (let y = 0; y < p.h; y++) if (hasColour(p, (y * p.w + x) * 4, cs)) return x - Math.round(sp.ax * (sp.density ?? 1));
  return -Infinity;
}
const frameAt = (c: Clip, t: number): Sprite => c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.round(t * c.fps)))];
/** A moment that falls on a frame of a clip played at thirty a second. */
const onFrame = (t: number): boolean => Math.abs(t * 30 - Math.round(t * 30)) < 1e-9;
const strength = (ls: ReadonlyArray<{ r: number; a?: number }>): number => ls.reduce((s, l) => s + l.r * (l.a ?? 1), 0);
const biggest = (ls: ReadonlyArray<{ r: number }>): number => Math.max(0, ...ls.map((l) => l.r));

/** Every frame of a facing, by what it is: the living (its stand, its walk, its attacks, its other moves, struck), and the dying. */
function framesOf(set: AnimSet): { living: Sprite[]; dying: Sprite[] } {
  const c = set.clips ?? {};
  const moves = Object.values(c.moves ?? {}).flatMap((m) => m.frames);
  return { living: [...set.idle, ...set.walk, ...set.attack, ...(c.attack?.frames ?? []), ...(c.reel?.frames ?? []), ...moves], dying: [...(c.die?.frames ?? [])] };
}
/**
 * Of one frame: how many pixels it paints, how many of them are the enemy's edge, and whether any is
 * cyan (a friend's colour, or bright and of cyan's hue: white is no one's, and the fire his cultists
 * throw has a heart of it), or any of its lights is other than hot pink to gold (tests/monsters.test.ts).
 */
function looked(sp: Sprite): { n: number; rim: number; cyan: boolean } {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const d = paintingOf(sp).d;
  let n = 0;
  let rim = 0;
  let cyan = false;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    n++;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) cyan = true;
    if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
  }
  for (const l of [...(sp.lights ?? []), ...(sp.aura ? [sp.aura] : [])]) {
    const [r, g, b] = rgba(l.color);
    if (cyanColour(l.color) || r < 150 || r < g || r < b) cyan = true;
  }
  return { n, rim, cyan };
}
/** Every frame of a figure both ways round: painted, nothing cyan, the enemy's edge on every living one and on no dying one. */
function allFrames(name: string, art: { front: AnimSet; back: AnimSet }): void {
  for (const view of ['front', 'back'] as const) {
    const { living, dying } = framesOf(art[view]);
    living.forEach((sp, i) => {
      const f = looked(sp);
      assert.ok(f.n > 300 && !f.cyan && f.rim > 30, `${name}, ${view}, living frame ${i}: ${f.n} pixels, ${f.rim} of his edge${f.cyan ? ', and cyan' : ''}`);
    });
    dying.forEach((sp, i) => {
      const f = looked(sp);
      assert.ok(f.n > 100 && !f.cyan && f.rim === 0, `${name}, ${view}, dying frame ${i}: ${f.n} pixels, ${f.rim} of an edge${f.cyan ? ', and cyan' : ''}`);
    });
  }
}

const MK = makeMarksmanArt3();
const HP = makeHighPriestArt();
const CU = makeCultistArt();
const CH = makeChieftainArt();
const BR = makeBruteArt();
const GU = makeGuardianArt();

test('the switch is off, and nothing of the game makes any of them', () => {
  assert.equal(NEW_MOBS.on, false);
  assert.ok(!NEW_MOBS_LIST.includes(MARKSMAN), 'the new three stay three');
  // (the high priest and the chieftain are made in the files of their cultists and trolls, which the
  // game uses: only those files name them, and the mock-up's own, which nothing of the game imports:
  // tests/new_mobs3.test.ts)
  const makers: Record<string, string> = {
    makeMarksmanArt3: 'art/new_mobs3.ts',
    makeHighPriestArt: 'art/monster_cultist.ts',
    paintHighPriest: 'art/monster_cultist.ts',
    makeChieftainArt: 'art/monster_brute.ts',
    paintChieftain: 'art/monster_brute.ts',
  };
  const mockUp = ['art/new_mobs3.ts', 'art/mob_shots.ts', 'render/pack_marks.ts'];
  const files = fs.readdirSync('src', { recursive: true }).map((f) => f.replace(/\\/g, '/')).filter((f) => f.endsWith('.ts') && !f.startsWith('dev') && !mockUp.includes(f));
  assert.ok(files.includes('art/bestiary.ts') && files.includes('art/monster_cultist.ts'), 'the game’s files are looked through');
  for (const f of files) {
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    for (const [name, home] of Object.entries(makers)) if (f !== home) assert.ok(!text.includes(name), `${f} names ${name}`);
  }
});

// ---------------------------------------------------------------------------------------------
// THE BONE MARKSMAN

test('the marksman paints in every pose both ways round: nothing cyan, his pink edge while he lives and none as he dies; and he is a head taller than his archers', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const poses: { name: string; living: boolean; px: () => Px }[] = [];
  for (const view of ['front', 'back'] as const) {
    const moments: ReadonlyArray<readonly [string, number]> = [
      ['stand', 0], ['stand', 1.0], ['walk', 0], ['walk', 0.35], ['attack', MARKSMAN.warn], ['attack', MK_SHOT_HIT], ['attack', MK_SHOT_HIT + 0.1],
      ['pierce', 0.3], ['pierce', 0.42], ['pierce', 1.4], ['pierce', MK_PIERCE_HIT], ['pierce', MK_PIERCE_HIT + 0.1], ['reel', 0.06],
    ];
    for (const [which, t] of moments) poses.push({ name: `${which} ${t} ${view}`, living: true, px: () => paintMob(MARKSMAN, which, t, view).px });
    for (const k of [0, 0.2, 0.28, 0.4, 0.6, 1]) poses.push({ name: `dying ${k} ${view}`, living: false, px: () => deathOfMob(MARKSMAN, k, view).px });
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
  const archers = topUp(makeArcherArt3().front.idle[0]);
  const him = topUp(MK.front.idle[0]);
  assert.ok(him > archers + 8 && him < archers + 30, `a head taller than his archers (${archers} and ${him} picture pixels up)`);
});

test('his walk goes round, and his feet grip the floor', () => {
  for (const view of ['front', 'back'] as const) {
    const a = paintMob(MARKSMAN, 'walk', 0, view).px;
    const b = paintMob(MARKSMAN, 'walk', MARKSMAN.walkFrames / MARKSMAN.walkFps, view).px;
    assert.equal(differ(a, b), 0, `${view}: the round closes`);
  }
  const n = MARKSMAN.walkFrames;
  const d = (MARKSMAN.pace * TILE3) / MARKSMAN.walkFps;
  const ankle = MARKSMAN.build.ankle;
  const down = (z: number): boolean => Math.abs(z - ankle) < 0.05;
  const seen = { L: 0, R: 0 };
  for (let i = 0; i < n; i++) {
    const a = skeletonAt(MARKSMAN, 'walk', i / MARKSMAN.walkFps);
    const b = skeletonAt(MARKSMAN, 'walk', (i + 1) / MARKSMAN.walkFps);
    // (his steps are long: in the two frames where both feet reach for the floor, front and back, his
    // legs are at full stretch and his feet within a picture pixel and a half of it, as he was shown)
    assert.ok(Math.min(a.ankleL[2], a.ankleR[2]) - ankle < 1.5, `frame ${i} has no foot on or near the floor`);
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

test('he is made as the game takes a monster: both facings, every list and clip, his shot and his great shot on their frames, his walk matched to a pace', () => {
  for (const view of ['front', 'back'] as const) {
    const set = MK[view];
    const c = set.clips ?? {};
    assert.equal(set.idle.length, MARKSMAN.idleFrames);
    assert.equal(set.walk.length, MARKSMAN.walkFrames);
    assert.ok(c.attack && c.attack.hit === MK_SHOT_HIT && onFrame(MK_SHOT_HIT), `${view}: his shot, the string let go on a frame`);
    const pierce = c.moves?.pierce;
    assert.ok(pierce && pierce.hit === MK_PIERCE_HIT && onFrame(MK_PIERCE_HIT) && pierce.loop === undefined && pierce.frames.length > 60, `${view}: his great shot, a clip played once, the string let go on a frame`);
    assert.deepEqual(Object.keys(c.moves ?? {}), ['pierce'], `${view}: his one move of his own`);
    assert.ok(c.die && c.die.fps === DEATH_FPS && c.die.frames.length === Math.round(MARKSMAN.dieTime * DEATH_FPS) + 1, `${view}: his death`);
    assert.ok(c.reel && c.reel.frames.length >= 6, `${view}: struck`);
    const { living, dying } = framesOf(set);
    for (const sp of [...living, ...dying]) assert.ok(sp.w > 0 && sp.h > 0, `${view}: an empty frame`);
    for (const sp of living) for (const l of [...(sp.lights ?? []), ...(sp.aura ? [sp.aura] : [])]) assert.ok(!cyanColour(l.color), `${view}: a cyan light`);
    if (c.die) assert.ok(!c.die.frames[c.die.frames.length - 1].lights?.length, `${view}: light in what is left`);
  }
  assert.ok(Math.abs((makeMarksmanArt3(MARKSMAN.pace * 2).front.walkFps ?? 0) - walkFpsAt(MARKSMAN, MARKSMAN.pace * 2)) < 1e-9 && walkFpsAt(MARKSMAN, MARKSMAN.pace * 2) === MARKSMAN.walkFps * 2, 'his walk is matched to the pace');
});

test('his great shot: an arrow from his quiver raised over his head, its light gathering as he draws and holds (his warning, not his plain shot’s); a flash and a streak as it goes; then the light is gone', () => {
  const gold = colours([FLAME[3], FLAME[4]]);
  for (const view of ['front', 'back'] as const) {
    // the arrow drawn from his quiver, its head already smouldering, brought up over his hood
    const hood = topRow(paintMob(MARKSMAN, 'stand', 0, view).px);
    const reaching = paintMob(MARKSMAN, 'pierce', 0.2, view);
    const raised = paintMob(MARKSMAN, 'pierce', 0.42, view);
    const highest = (p: Painted): number => Math.min(Infinity, ...p.lights.map((l) => l.y));
    assert.ok(highest(reaching) > hood && highest(raised) < hood - 4, `${view}: the arrow's smouldering head over his hood (its top on row ${hood}; the light on ${highest(reaching).toFixed(0)}, then ${highest(raised).toFixed(0)})`);
    // its light gathering as he draws and holds
    const held = [0.6, 0.9, 1.1, 1.3, 1.5].map((t) => strength(paintMob(MARKSMAN, 'pierce', t, view).lights));
    for (let i = 1; i < held.length; i++) assert.ok(held[i] > held[i - 1], `${view}: the light gathers (${held.map((s) => s.toFixed(1)).join(', ')})`);
    assert.ok(held[held.length - 1] > held[0] * 2, `${view}: and gathers a great deal`);
    // the warning: not his plain shot's
    const warn = paintMob(MARKSMAN, 'pierce', 1.45, view);
    const plain = paintMob(MARKSMAN, 'attack', MARKSMAN.warn, view);
    assert.ok(differ(warn.px, plain.px) > 500 && strength(warn.lights) > strength(plain.lights) * 1.4, `${view}: his great shot's warning is not his plain shot's`);
    // as it goes: a flash at the bow, brighter than all he gathered, and a streak of gold out along its way
    const before = paintMob(MARKSMAN, 'pierce', MK_PIERCE_HIT - 1 / 30, view);
    const goes = paintMob(MARKSMAN, 'pierce', MK_PIERCE_HIT, view);
    const after = paintMob(MARKSMAN, 'pierce', MK_PIERCE_HIT + 1 / 30, view);
    assert.ok(biggest(goes.lights) > biggest(before.lights) + 2, `${view}: a flash as the string goes (${biggest(before.lights).toFixed(1)}, then ${biggest(goes.lights).toFixed(1)})`);
    assert.ok(count(after.px, gold) >= 25 && count(after.px, gold) > count(before.px, gold) * 3, `${view}: a streak of gold along its way (${count(before.px, gold)}, then ${count(after.px, gold)} pixels)`);
    assert.equal(count(paintMob(MARKSMAN, 'attack', MK_SHOT_HIT + 1 / 30, view).px, gold), 0, `${view}: his plain shot leaves no gold`);
    // and a quarter of a second on, its light is gone
    assert.ok(biggest(paintMob(MARKSMAN, 'pierce', MK_PIERCE_HIT + 0.25, view).lights) < 6, `${view}: the light gone`);
  }
});

test('dying, his bow snaps: a flash of bone-white at the break and none before; its upper limb flies up; nothing lit is left', () => {
  const wood = colours(MK_WOOD);
  const at = (t: number, view: 'front' | 'back'): Painted => deathOfMob(MARKSMAN, t / MARKSMAN.dieTime, view);
  const white = (p: Painted): boolean => p.lights.some((l) => l.color === BONE[3]);
  for (const view of ['front', 'back'] as const) {
    const drawn = at(MK_SNAP - 0.03, view);
    const snapped = at(MK_SNAP + 0.02, view);
    const flying = at(MK_SNAP + 0.1, view);
    assert.ok(!white(drawn) && white(snapped), `${view}: a flash of bone-white as it snaps, and none before`);
    assert.ok(topRow(flying.px, wood) < topRow(drawn.px, wood) - 3, `${view}: its upper limb flies up (the bow's top on row ${topRow(drawn.px, wood)}, then ${topRow(flying.px, wood)})`);
    assert.equal(at(MARKSMAN.dieTime, view).lights.length, 0, `${view}: nothing lit left`);
  }
});

// ---------------------------------------------------------------------------------------------
// THE HIGH PRIEST

test('the high priest is his cultists’ size, known by his mask and his censer; nothing cyan; his pink edge while he lives and none as he dies', () => {
  const robe = colours([...GLOOM, ...dim(GLOOM)]);
  const iron = colours([...IRON, ...dim(IRON)]);
  const mask = colours(MASK);
  for (const back of [false, true]) {
    const view = back ? 'back' : 'front';
    const him = paintHighPriest({ ...REST, act: 1 }, back).px;
    const them = paintCultist({ ...REST, act: 1 }, back).px;
    assert.equal(topRow(him, robe), topRow(them, robe), `${view}: as tall as his cultists (the point of his cowl where theirs is)`);
    assert.ok(count(him, iron) > 30 && count(them, iron) === 0, `${view}: his censer, of iron, on its chain from his staff (${count(him, iron)} pixels)`);
    // (his mask is seen from the front)
    if (!back) assert.ok(count(him, mask) > 20 && count(them, mask) === 0, `${view}: his mask (${count(him, mask)} pixels)`);
  }
  allFrames('the high priest', HP);
});

test('the high priest is made as the game takes a monster: his fire bolt his cultists’; his censer’s swing, its blow on its frame, held back flaring before it, its burning smoke streaming; a slow procession', () => {
  const smoke = colours(SMOKE);
  for (const view of ['front', 'back'] as const) {
    const set = HP[view];
    const c = set.clips ?? {};
    assert.equal(set.idle.length, CU[view].idle.length);
    assert.equal(set.walk.length, CU[view].walk.length);
    assert.ok(c.attack && c.attack.hit !== undefined && c.attack.hit === CU[view].clips?.attack?.hit, `${view}: his fire bolt, its blow on his cultists' frame`);
    const censer = c.moves?.censer;
    assert.ok(censer && censer.hit === CENSER_HIT && onFrame(CENSER_HIT) && censer.loop === undefined, `${view}: his censer's swing, a clip played once, its blow on a frame`);
    if (!censer) continue;
    assert.deepEqual(Object.keys(c.moves ?? {}), ['censer'], `${view}: his one move of his own`);
    // the warning: swung back on its chain, flaring and pouring smoke, held
    const calm = set.idle[0];
    const held = frameAt(censer, 0.55);
    const blow = frameAt(censer, CENSER_HIT);
    assert.ok(strength(held.lights ?? []) > strength(calm.lights ?? []) * 1.25, `${view}: it flares as he holds it back (${strength(calm.lights ?? []).toFixed(1)}, then ${strength(held.lights ?? []).toFixed(1)})`);
    assert.ok(unlike(held, blow) > 800, `${view}: the swing is not the warning (${unlike(held, blow)} pixels differ)`);
    // its burning smoke, streaming along the arc as it swings
    const puffs = (sp: Sprite): number => count(paintingOf(sp), smoke);
    assert.ok(puffs(blow) > puffs(calm) + 40, `${view}: smoke streaming as it swings (${puffs(calm)}, then ${puffs(blow)} pixels)`);
    assert.ok(c.die && c.die.fps === DEATH_FPS && c.die.frames.length === Math.round(PRIEST_DIE_TIME * DEATH_FPS) + 1, `${view}: his death`);
  }
  assert.ok(HP.front.walkFps === PROCESSION_FPS && PROCESSION_FPS < (CU.front.walkFps ?? 16), `a slow procession (${PROCESSION_FPS} steps' frames a second; his cultists' ${CU.front.walkFps})`);
});

test('his robe crumples empty: the robe down while his mask still hangs where his face was; then the mask falls onto the heap; nothing lit is left', () => {
  const robe = colours([...GLOOM, ...dim(GLOOM)]);
  const mask = colours(MASK);
  for (const view of ['front', 'back'] as const) {
    const die = HP[view].clips?.die as Clip;
    const n = die.frames.length - 1;
    const stood = HP[view].idle[0];
    const mid = die.frames[Math.round(0.6 * n)];
    const end = die.frames[n];
    assert.ok(topUp(mid, robe) < topUp(stood, robe) * 0.5 && topUp(end, robe) < topUp(stood, robe) * 0.5, `${view}: the robe is down (${topUp(stood, robe)}, then ${topUp(mid, robe)} picture pixels up)`);
    if (view === 'front') {
      const face = topUp(stood, mask);
      assert.ok(topUp(mid, mask) >= face - 3, `his mask still hangs where his face was (${face}, then ${topUp(mid, mask)} up)`);
      assert.ok(topUp(end, mask) <= topUp(end, robe) && topUp(end, mask) < face * 0.5, `and falls onto the heap (${topUp(end, mask)} up; the heap ${topUp(end, robe)})`);
    }
    assert.ok(!end.lights?.length, `${view}: nothing lit left`);
  }
});

// ---------------------------------------------------------------------------------------------
// THE TROLL CHIEFTAIN

test('the troll chieftain is bigger than his trolls, his crown of antlers over his head and his banner on his back; nothing cyan; his pink edge while he lives and none as he dies', () => {
  const hide = colours([...FLESH, ...dim(FLESH)]);
  const red = colours([...GORE, ...dim(GORE)]);
  const bone = colours([...BONE, ...dim(BONE)]);
  const banner = colours([...BANNER, ...dim(BANNER)]);
  for (const view of ['front', 'back'] as const) {
    const him = CH[view].idle[0];
    const head = topUp(him, hide);
    const green = topUp(BR[view].idle[0], hide);
    const redTop = topUp(GU[view].idle[0], red);
    assert.ok(head > redTop + 5 && head > green + 15, `${view}: bigger than his trolls (his head ${head} picture pixels up; the red troll's ${redTop}, the green's ${green})`);
    assert.ok(count(paintingOf(him), banner) > 150, `${view}: his banner`);
    // his crown: the antlers standing up over his head
    const p = paintingOf(him);
    const ay = Math.round(him.ay * (him.density ?? 1));
    let antlers = 0;
    for (let y = 0; y < p.h; y++) {
      const up = ay - y;
      if (up <= head || up > head + 16) continue;
      for (let x = 0; x < p.w; x++) if (hasColour(p, (y * p.w + x) * 4, bone)) antlers++;
    }
    assert.ok(antlers > 30, `${view}: his crown of antlers over his head (${antlers} pixels of bone)`);
  }
  allFrames('the troll chieftain', CH);
});

test('the chieftain is made as the game takes a monster: his trolls’ slam and swing, a fifth slower, each blow on its frame; no bellow; heavier on his feet than his trolls', () => {
  for (const view of ['front', 'back'] as const) {
    const set = CH[view];
    const c = set.clips ?? {};
    const theirs = BR[view].clips?.attack?.hit ?? NaN;
    assert.ok(c.attack && c.attack.hit !== undefined && Math.abs(c.attack.hit - theirs * 1.2) <= 1 / 30 + 1e-9 && onFrame(c.attack.hit), `${view}: his slam, a fifth slower than his trolls' (${c.attack?.hit}; theirs ${theirs})`);
    const swing = c.moves?.swing;
    assert.ok(swing && swing.hit !== undefined && Math.abs(swing.hit - SWING_HIT * 1.2) <= 1 / 30 + 1e-9 && onFrame(swing.hit) && swing.loop === undefined, `${view}: his swing, a fifth slower than his trolls' (${swing?.hit}; theirs ${SWING_HIT})`);
    // (his words: "I don’t want the bellow if the Skelton leader has the same thing")
    assert.deepEqual(Object.keys(c.moves ?? {}), ['swing'], `${view}: no bellow, nor anything else of his own`);
    assert.ok(c.die && c.die.fps === DEATH_FPS && c.die.frames.length === Math.round(CHIEF_DIE_TIME * DEATH_FPS) + 1, `${view}: his death`);
    assert.equal(set.idle.length, BR[view].idle.length);
    assert.equal(set.walk.length, BR[view].walk.length);
    assert.ok((set.walkFps ?? 0) < (GU[view].walkFps ?? 0) && (set.idleFps ?? 0) < (GU[view].idleFps ?? 0), `${view}: heavier on his feet than his trolls`);
  }
});

test('he dies to his knees, then face-first: his banner falls over him, and his crown rolls away', () => {
  const hide = colours([...FLESH, ...dim(FLESH)]);
  const bone = colours([...BONE, ...dim(BONE)]);
  const banner = colours([...BANNER, ...dim(BANNER)]);
  for (const view of ['front', 'back'] as const) {
    const die = CH[view].clips?.die as Clip;
    const n = die.frames.length - 1;
    const stood = topUp(CH[view].idle[0], hide);
    const knelt = topUp(die.frames[Math.round(0.45 * n)], hide);
    const lay = topUp(die.frames[n], hide);
    assert.ok(knelt < stood - 15 && knelt > lay + 15 && lay < 40, `${view}: to his knees, then on his face (${stood}, ${knelt}, ${lay} picture pixels up)`);
    assert.ok(topUp(die.frames[0], banner) > 100 && topUp(die.frames[n], banner) < 45, `${view}: his banner fallen over him (its top ${topUp(die.frames[0], banner)}, then ${topUp(die.frames[n], banner)} up)`);
    assert.ok(rightOf(die.frames[0], bone) < 30 && rightOf(die.frames[n], bone) > 60, `${view}: his crown rolled away before him (${rightOf(die.frames[n], bone)} picture pixels on)`);
    assert.ok(!die.frames[n].lights?.length, `${view}: nothing lit left`);
  }
});

// ---------------------------------------------------------------------------------------------
// ON THE FLOOR (src/art/mob_shots.ts)

/** A pen that keeps what it is asked to draw. */
function pen(): { g: CanvasRenderingContext2D; rects: { x: number; y: number; w: number; h: number; c: string; a: number }[] } {
  const rects: { x: number; y: number; w: number; h: number; c: string; a: number }[] = [];
  const p = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number): void {
      rects.push({ x, y, w, h, c: this.fillStyle, a: this.globalAlpha });
    },
  };
  return { g: p as unknown as CanvasRenderingContext2D, rects };
}
const ISO = (x: number, y: number): readonly [number, number] => [(x - y) * 16, (x + y) * 8];

test('on the floor: his line of aim runs out as he draws; his great arrow flies over its shadow; the burning smoke billows, burns and thins away; none of it cyan', () => {
  // the line of aim, out from under him toward his mark, six tiles off
  const aim = (k: number): { x: number; y: number; w: number; h: number; c: string; a: number }[] => {
    const p = pen();
    drawAimLine(p.g, ISO, 0, 0, 6, 0, k, 0.2);
    return p.rects;
  };
  const far = (rs: { x: number; y: number }[]): number => Math.max(0, ...rs.map((r) => Math.hypot(r.x, r.y)));
  assert.equal(aim(0).length, 0, 'no line before he draws');
  assert.ok(far(aim(0.3)) < far(aim(0.6)) && far(aim(0.6)) <= far(aim(1)) && aim(1).length > 15, `it runs out from him as he draws (${far(aim(0.3)).toFixed(0)}, ${far(aim(0.6)).toFixed(0)}, ${far(aim(1)).toFixed(0)})`);
  assert.ok(aim(1).some((r) => r.w === 1) && !aim(0.5).some((r) => r.w === 1), 'its chevrons only at its height');
  // the great arrow in flight, twenty pixels over the floor
  const arrow = pen();
  drawGreatArrow(arrow.g, ISO, 3, 0, 20, 1, 0, 0.1);
  const head = arrow.rects.filter((r) => r.c === FLAME[4]);
  const shadow = arrow.rects.filter((r) => r.c === P.black);
  assert.ok(arrow.rects.length > 40 && head.length > 0 && shadow.length > 5, 'the arrow, its burning head and its shadow');
  assert.ok(Math.min(...shadow.map((r) => r.y)) > Math.max(...head.map((r) => r.y)), 'its head up over its shadow on the floor');
  // the burning smoke, a tile and a fifth across
  const smoke = (k: number): { x: number; y: number; w: number; h: number; c: string; a: number }[] => {
    const p = pen();
    drawBurningSmoke(p.g, ISO, 2, 2, 1.2, k, 0.5);
    return p.rects;
  };
  const spread = (rs: { x: number }[]): number => Math.max(...rs.map((r) => r.x)) - Math.min(...rs.map((r) => r.x));
  const alpha = (rs: { a: number }[]): number => rs.reduce((s, r) => s + r.a, 0) / rs.length;
  assert.ok(smoke(0).length === 0 && smoke(1).length === 0, 'nothing before it comes down, nothing once it is gone');
  assert.ok(spread(smoke(0.02)) < spread(smoke(0.4)), `it billows out (${spread(smoke(0.02))}, then ${spread(smoke(0.4))} pixels across)`);
  assert.ok(smoke(0.4).some((r) => r.c === FLAME[3] || r.c === FLAME[4]), 'embers burning in it');
  assert.ok(alpha(smoke(0.95)) < alpha(smoke(0.4)) * 0.5, 'and it thins away');
  for (const r of [...aim(1), ...arrow.rects, ...smoke(0.4)]) assert.ok(!cyanColour(r.c), `nothing cyan (${r.c})`);
});
