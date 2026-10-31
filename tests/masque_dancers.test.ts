// FLOOR 17'S MASKED DANCERS (src/art/masque_dancers.ts, their look; src/art/masque_dancers_moves.ts, their moves): a lady
// and a gentleman in the seven rooms' colours. A MOCK-UP: NOT IN THE GAME, behind DANCERS_ON, off. His pick for how they
// move, “Gliding fast, whirling (Recommended)”, with the brief as offered (art/masque_dancers.ts has it); his rulebook's
// Movement 9 for every new enemy (“Start from now on, but every enemy is going to need that change eventually.  And bigger
// AOE to compensate for the extra time the player gets to evade”); and his “It’s all too slow and too narrow and too small”:
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF BOTH THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from behind, and
//      every handover (the waltz into the chime, the chime into the whirl, the whirl out as it comes round to you);
//   3. HIS LIGHTNING STRIKE: the whirling spin strikes in two frames and lands on the second; the strike and the frame
//      after it carry its smear; no other frame does;
//   4. every frame paints both ways round, in every room's colours: nothing cyan, the pink edge while they live and none as
//      they die, every pixel whole or empty but the edge;
//   5. NOTHING CUT OFF, they or a pair of them;
//   6. NOTHING OF THEM IN THE FLOOR;
//   7. THE HUSH leaking from the mask while they live; leaving them in a grey breath as they lie; gone once they are still;
//   8. THE MASKS: on the face, the dull pink in their eyes while they live (hot through the warning); flung off as they die,
//      empty (no pink in it), to lie face up on the floor clear of them; no pink left in their eyes once the Hush has gone;
//   9. THEIR COLOURS: the seven rooms', every one clear of the enemy's pink and the friend's cyan; two kinds in each;
//  10. HIS SIZES AND SPEEDS: the knight's size; the whirl at its pace, three turns a second; the spin carrying them a tile
//      and a quarter in its two frames, striking a tile and a half round; the waltz a turn a second;
//  11. THE PAIR in hold: their hands where they hold each other, and nothing of one through the other;
//  12. THE CHIME: stopped dead, the masks turned to you and held still; and the whirl's mask kept on you;
//  13. THEIR DEATH (made new on his pick of 30 Oct, “Yes, these (Recommended)”): a last pirouette, on the ball of one foot,
//      round at least three times more and faster than they whirl; two lurches out of control, a foot flung out to catch them;
//      down on the floor, lying, the skirt (or the coat-tails) spread flat round them in a swirl; the mask flung off, down on
//      its rim, rolling away on it, still at last, face up, never in the floor, well clear of them; still, alive; and the game's
//      ways into the death (from their pose, from struck, from the whirl as it comes round) without a jump.
//   run: tsx --test tests/masque_dancers.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { SINK_MAX, checkBoss, findingsSaid, framesOf, inLimb, inLump, movesOf } from '../src/art/boss_checks';
import { DANCERS_ON, DANCER_CANVAS, GENT_BODY, LADY_BODY, ROOMS, ROOM_ORDER, smearColours } from '../src/art/masque_dancers';
import type { RoomName } from '../src/art/masque_dancers';
import { DANCERS, DANCER_GENT, DANCER_LADY, DN_CHIME, DN_DIES, DN_PACE, DN_SHAPE_GENT, DN_SHAPE_LADY, DN_SPIN, DN_STRIKES, DN_WHIRL, SPIN, WALTZ_PACE, WHIRL_ROUND, dancerSolids, maskLooseAt, maskSize, pairPainted, smearedAt, spinOf } from '../src/art/masque_dancers_moves';
import type { Handover } from '../src/art/boss_checks';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { TILE3, canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
import { project } from '../src/art/skeleton';
import type { V3 } from '../src/art/skeleton';
import { rgba } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

const VIEWS = ['front', 'back'] as const;
const BOTH: Mob[] = [DANCER_LADY, DANCER_GENT];
const SHAPE = (mob: Mob) => (mob.id.includes('lady') ? DN_SHAPE_LADY : DN_SHAPE_GENT);
const LIVING = (mob: Mob): string[] => movesOf(mob).filter((m) => m !== 'dying');

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function hueOf(r: number, g: number, b: number): { h: number; s: number; v: number } {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return { h: 0, s: 0, v: max / 255 };
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return { h: (h + 360) % 360, s: (max - min) / max, v: max / 255 };
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 150 || max - min < 0.45 * max) return false;
  const { h } = hueOf(r, g, b);
  return h >= 165 && h <= 205;
}
const isCyan = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
};

const moveOf = (mob: Mob, move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : (mob.more ?? {})[move]);
const at = (mob: Mob, move: string, t: number): Moment => (move === 'dying' ? dyingMoment(mob, t) : momentOf(mob, moveOf(mob, move), t));
const stageOf = (mob: Mob): Stage => {
  const can = canvasOf(mob);
  return stage(paintViewOf(mob, 'front'), can.ax, can.ay, can);
};
const paint = (mob: Mob, move: string, t: number, view: (typeof VIEWS)[number]): Painted => (move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view));

/** Every frame of every move of the two the checks run on, both ways round; and of the other twelve, every eighth frame, one way round by turns. */
const PAINTED: { mob: Mob; move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const mob of BOTH) for (const view of VIEWS) for (const move of movesOf(mob)) for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: paint(mob, move, t, view) });
const OTHERS: Mob[] = (['lady', 'gent'] as const).flatMap((who) => ROOM_ORDER.map((r) => DANCERS[who][r])).filter((m) => !BOTH.includes(m));
const SAMPLED: { mob: Mob; move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
OTHERS.forEach((mob, k) => {
  for (const move of movesOf(mob)) framesOf(mob, move).forEach((t, i) => {
    if ((i + k) % 8) return;
    const view = VIEWS[(i + k) % 2];
    SAMPLED.push({ mob, move, view, t, p: paint(mob, move, t, view) });
  });
});
const said = (mob: Mob, move: string, view: string, t: number): string => `${mob.id} ${move} ${view} @${t.toFixed(3)}`;

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(DANCERS_ON.on, false, 'DANCERS_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/masque_dancers(_moves)?\.ts$/.test(f)) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (/^art\/masque_dancers(_moves)?$/.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE OF BOTH THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  for (const mob of BOTH) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,waltz,chime');
    const found = checkBoss(mob, SHAPE(mob));
    assert.equal(found.length, 0, `${mob.name}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
});

test('3. HIS LIGHTNING STRIKE: the spin strikes in two frames and lands on the second; the strike and the frame after it smeared, no other frame', () => {
  assert.equal(Object.keys(DN_STRIKES).join(','), 'attack');
  const [s0, s1] = DN_SPIN.strike;
  assert.equal(Math.round((s1 - s0) * 30), 2, 'its strike is two frames');
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of [...PAINTED, ...SAMPLED]) {
    assert.equal(moveOf(mob, 'attack').motion.hit, s1, 'it lands on the strike\'s last frame');
    const room = ROOMS[mob.id.split('-')[2]];
    const mine = new Set(smearColours(room).map((c) => rgba(c).slice(0, 3).join(',')));
    const { d } = p.px;
    let n = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] === 255 && mine.has(`${d[i]},${d[i + 1]},${d[i + 2]}`)) n++;
    const want = move === 'attack' && smearedAt(move, t);
    if (want && n < 40) faults.push(`${said(mob, move, view, t)}: its smear only ${n} pixels`);
    if (!want && n > 0) faults.push(`${said(mob, move, view, t)}: smeared out of its strike (${n})`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. every frame paints both ways round, in every room\'s colours: nothing cyan, the pink edge while they live and none as they die, every pixel whole or empty but the edge', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of [...PAINTED, ...SAMPLED]) {
    const { d } = p.px;
    let n = 0;
    let rim = 0;
    let odd = 0;
    let cyan = false;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] === 0) continue;
      n++;
      if (d[i + 3] !== 255 && d[i + 3] !== RIM_ALPHA) odd++;
      const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
      if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) cyan = true;
      if (d[i + 3] === RIM_ALPHA && d[i] === pr && d[i + 1] === pg && d[i + 2] === pb) rim++;
    }
    for (const l of p.lights) if (isCyan(l.color)) cyan = true;
    const alive = move !== 'dying';
    if (n < 500 || cyan || odd || (alive ? rim < 60 : rim !== 0)) faults.push(`${said(mob, move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

function room(p: Painted): number {
  const { w, h, d } = p.px;
  let x0 = w;
  let y0 = h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (!d[(y * w + x) * 4 + 3]) continue;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  return Math.min(x0, y0, w - 1 - x1, h - 1 - y1);
}
test('5. NOTHING CUT OFF: in every frame, both ways round, they (and a pair of them, waltzing and at the chime) are inside their picture with room to spare', () => {
  const ROOM = 6;
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of PAINTED) {
    assert.equal(`${p.px.w}x${p.px.h}`, `${DANCER_CANVAS.w}x${DANCER_CANVAS.h}`);
    const r = room(p);
    if (r < ROOM) faults.push(`${said(mob, move, view, t)}: ${r} pixels from the edge`);
  }
  for (const view of VIEWS) for (const move of ['waltz', 'chime'] as const) for (const t of framesOf(DANCER_GENT, move)) {
    const r = room(pairPainted(DANCER_LADY, DANCER_GENT, move, t, view));
    if (r < ROOM) faults.push(`the pair ${move} ${view} @${t.toFixed(2)}: ${r} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

/** How far below the floor a solid goes (0: not at all). */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  else if (sh.k === 'panel') z = sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]);
  return Math.max(0, -z);
}
test('6. NOTHING OF THEM IN THE FLOOR: all they wear, both of them, every frame', () => {
  const faults: string[] = [];
  for (const mob of BOTH) {
    const st = stageOf(mob);
    for (const move of movesOf(mob)) {
      for (const t of framesOf(mob, move)) {
        for (const b of mob.bits(st, at(mob, move, t))) {
          if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
          // (the mask loose of them as they die is half a shell, not a whole ball: test 13 holds it out of the floor exactly)
          if (move === 'dying' && t >= DN_DIES.mask && b.part === 'mask' && b.piece === 'mask') continue;
          const by = under(b.shape);
          if (by > 0.6) faults.push(`${mob.name} ${move} @${t.toFixed(2)}: ${b.part} ${b.piece} ${by.toFixed(1)} into the floor`);
        }
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

/** What is laid after their edge at a moment (the Hush, the smear, the glints). */
function grainsAt(mob: Mob, st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  mob.bits(st, m);
  return mob.grains?.(st, m) ?? [];
}
const HUSHY = new Set(['#b6b0cc', '#9890b4', '#625a7a', '#3e3852'].map((c) => rgba(c).slice(0, 3).join(',')));
const hushIn = (g: ReadonlyArray<readonly [V3, string, number]>): number => g.filter(([, c]) => HUSHY.has(rgba(c).slice(0, 3).join(','))).length;
test('7. THE HUSH leaking from the mask while they live; leaving them in a grey breath as they lie; none once they are still', () => {
  for (const mob of BOTH) {
    const st = stageOf(mob);
    let most = 0;
    let frames = 0;
    let some = 0;
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const n = hushIn(grainsAt(mob, st, at(mob, move, t)));
        frames++;
        if (n > 0) some++;
        if (move !== 'attack') most = Math.max(most, n);
      }
    }
    assert.ok(some > 0.9 * frames, `${mob.name}: the Hush leaking in ${some} of ${frames} living frames`);
    let great = 0;
    for (let t = DN_DIES.breath[0]; t <= DN_DIES.breath[1]; t += 0.05) {
      const g = grainsAt(mob, st, dyingMoment(mob, t));
      great = Math.max(great, hushIn(g));
      for (const [, c] of g) assert.ok(!isCyan(c), `the Hush in cyan, ${c}`);
    }
    assert.ok(great >= 1.5 * most, `${mob.name}: the Hush leaving them, ${great} at most; the most while they live, ${most}`);
    for (let t = DN_DIES.breath[1] + 0.02; t <= DN_DIES.long + 1e-9; t += 0.05) assert.equal(hushIn(grainsAt(mob, st, dyingMoment(mob, t))), 0, `${mob.name} @${t.toFixed(2)}: the Hush still coming out`);
  }
});

test('8. THE MASKS: on the face with the dull pink in its eyes while they live, hot through the warning; flung off as they die, empty, to lie face up clear of them; no pink in their eyes once the Hush has gone', () => {
  const pinkEyes = (bits: Bit[]): string[] => bits.filter((b) => b.shape.k === 'dot' && (b.shape.c === FLAME[1] || b.shape.c === FLAME[2])).map((b) => b.shape.k === 'dot' ? b.shape.c : '');
  for (const mob of BOTH) {
    const st = stageOf(mob);
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const bits = mob.bits(st, at(mob, move, t));
        assert.ok(bits.some((b) => b.piece === 'mask' && b.part === 'mask' && b.shape.k === 'ball'), `${mob.name} ${move} @${t.toFixed(2)}: no mask`);
        assert.equal(pinkEyes(bits.filter((b) => b.piece === 'mask')).length, 2, `${mob.name} ${move} @${t.toFixed(2)}: the pink in its eyes`);
      }
    }
    // (hot through the warning: the eyes' light)
    const w = (DN_SPIN.warn[0] + DN_SPIN.warn[1]) / 2;
    assert.ok(mob.bits(st, at(mob, 'attack', w)).some((b) => b.shape.k === 'glow' && b.shape.c === FLAME[2]), `${mob.name}: the eyes not burning in the warning`);
    // AS THEY DIE: the mask on the face until it is flung off; empty once it is off (its eyes dark holes); no pink in their own
    // eyes once the Hush has left them
    for (const t of framesOf(mob, 'dying')) {
      const bits = mob.bits(st, dyingMoment(mob, t));
      const masks = bits.filter((b) => b.part === 'mask');
      assert.ok(masks.some((b) => b.piece === 'mask' && b.shape.k === 'ball'), `${mob.name} @${t.toFixed(2)}: the mask gone`);
      if (t >= DN_DIES.mask) assert.equal(pinkEyes(masks).length, 0, `${mob.name} @${t.toFixed(2)}: pink in the loose mask`);
      if (t >= DN_DIES.freed) assert.equal(pinkEyes(bits).length, 0, `${mob.name} @${t.toFixed(2)}: pink left in their eyes`);
    }
    // nothing of them falls apart: the mask is the only thing that leaves them, flung off and rolling (maskLooseAt)
    for (const piece of ['mask', 'face', 'plume', 'hair', 'skirt', 'coatskirt']) assert.equal(mob.fall?.(piece) ?? null, null, `${mob.name}: ${piece} falls by itself`);
    // once it lies still it lies clear of them, from in front and from behind
    const them: Mob = { ...mob, bits: (s2, m) => mob.bits(s2, m).filter((b) => b.part !== 'mask') };
    // (the mask alone: without the Hush rising out of them, which is laid with their own frame)
    const mask: Mob = { ...mob, bits: (s2, m) => mob.bits(s2, m).filter((b) => b.part === 'mask'), grains: () => [] };
    for (const view of VIEWS) {
      for (let t = DN_DIES.maskStill; t <= DN_DIES.long + 1e-9; t += 0.1) {
        const a = deathOfMob(them, Math.min(1, t / mob.dieTime), view).px.d;
        const b = deathOfMob(mask, Math.min(1, t / mob.dieTime), view).px.d;
        let mine = 0;
        let its = 0;
        let both = 0;
        for (let i = 3; i < a.length; i += 4) {
          if (a[i]) mine++;
          if (b[i]) its++;
          if (a[i] && b[i]) both++;
        }
        assert.ok(mine > 500 && its > 20, `${mob.name} ${view} @${t.toFixed(2)}: ${mine} pixels of them, ${its} of the mask`);
        assert.equal(both, 0, `${mob.name} ${view} @${t.toFixed(2)}: the mask lies over them or under them by ${both} pixels`);
      }
    }
  }
});

test('9. THEIR COLOURS: the seven rooms\', every one clear of the enemy\'s pink and the friend\'s cyan; a lady and a gentleman in each', () => {
  assert.equal(Object.keys(ROOMS).join(','), 'blue,purple,green,orange,white,violet,black');
  assert.equal(ROOM_ORDER.join(','), 'blue,purple,green,orange,white,violet,black');
  const ids = new Set<string>();
  for (const r of ROOM_ORDER) {
    for (const ramp of [ROOMS[r].cloth, ROOMS[r].trim, ROOMS[r].ribbon, smearColours(ROOMS[r])]) {
      for (const c of ramp) {
        const [R, G, B] = rgba(c);
        const { h, s, v } = hueOf(R, G, B);
        const loud = s > 0.25 && v > 0.25;
        assert.ok(!(loud && h >= 300 && h <= 350), `${r}: ${c} is the enemy's pink (hue ${h.toFixed(0)})`);
        assert.ok(!(loud && h >= 160 && h <= 205) && !isCyan(c), `${r}: ${c} is the friend's cyan (hue ${h.toFixed(0)})`);
      }
    }
    for (const who of ['lady', 'gent'] as const) ids.add(DANCERS[who][r as RoomName].id);
  }
  assert.equal(ids.size, 14, 'fourteen dancers, each its own');
});

test('10. HIS SIZES AND SPEEDS: the knight\'s size; the whirl at its pace, three turns a second; the spin a tile and a quarter in two frames, a tile and a half round; the waltz a turn a second', () => {
  for (const B of [LADY_BODY, GENT_BODY]) assert.ok(Math.abs(B.tall - 58) <= 3, `as tall as the knight (58): ${B.tall}`);
  assert.ok(DN_PACE >= 3, `they whirl at you at ${DN_PACE} tiles a second`);
  for (const mob of BOTH) {
    assert.equal(mob.walk.ground, DN_PACE * TILE3, `${mob.name}: the whirl painted for its pace`);
    assert.equal(mob.pace, DN_PACE);
    // (three whole turns in the whirl's second: the hips round 1080 degrees)
    const q0 = posedOfMob(mob, 'walk', 0);
    const q1 = posedOfMob(mob, 'walk', DN_WHIRL.frames / DN_WHIRL.fps - 1e-6);
    assert.ok(Math.abs(Math.abs(q1.yaw - q0.yaw) - 1080) < 50, `${mob.name}: the whirl turns ${(q1.yaw - q0.yaw).toFixed(0)} degrees in its second`);
    assert.equal(DN_WHIRL.frames / DN_WHIRL.fps, 1);
    // (the spin: carried in a tile and a quarter between the last frame of its wind-up and the frame it lands on)
    const [s0, s1] = DN_SPIN.strike;
    const p0 = skeletonAt(mob, 'attack', s0).pelvis;
    const p1 = skeletonAt(mob, 'attack', s1).pelvis;
    assert.ok(p1[0] - p0[0] >= 1.25 * TILE3 - 1e-6, `${mob.name}: the spin carries them ${((p1[0] - p0[0]) / TILE3).toFixed(2)} tiles`);
    // (its smear reaches the edge of what it strikes: a tile and a half round where they land)
    const m = at(mob, 'attack', s1);
    const sm = mob.bits(stageOf(mob), m).filter((b) => b.part === 'smear' && b.shape.k === 'mote').map((b) => (b.shape.k === 'mote' ? b.shape.p : ([0, 0, 0] as V3)));
    const far = Math.max(...sm.map((p) => Math.hypot(p[0] - SPIN.lunge * TILE3, p[1])));
    assert.ok(far >= 1.4 * TILE3, `${mob.name}: the smear reaches ${(far / TILE3).toFixed(2)} tiles round`);
    assert.ok(SPIN.area >= 1.5 && SPIN.lunge >= 1.25);
    // (the waltz: a turn a second, drifting round the room)
    assert.equal(moveOf(mob, 'waltz').ground, WALTZ_PACE * TILE3);
    const w0 = posedOfMob(mob, 'waltz', 0).yaw;
    const w1 = posedOfMob(mob, 'waltz', 1 - 1e-6).yaw;
    assert.ok(Math.abs(Math.abs(w1 - w0) - 360) < 25, `${mob.name}: the waltz turns ${(w1 - w0).toFixed(0)} degrees in its second`);
  }
});

test('11. THE PAIR IN HOLD: hands where they hold each other, and nothing of one through the other, waltzing and at the chime', () => {
  const faults: string[] = [];
  const lumpsL = dancerSolids('lady');
  const lumpsG = dancerSolids('gent');
  const frames = [...framesOf(DANCER_GENT, 'waltz').map((t) => ['waltz', t] as const), ...framesOf(DANCER_GENT, 'chime').filter((t) => t <= DN_CHIME.go).map((t) => ['chime', t] as const)];
  for (const [move, t] of frames) {
    const L = skeletonAt(DANCER_LADY, move, t);
    const G = skeletonAt(DANCER_GENT, move, t);
    const w = `${move} @${t.toFixed(2)}`;
    // (his left hand and her right joined; his right on her back; her left on his right shoulder)
    if (Math.hypot(G.handL[0] - L.handR[0], G.handL[1] - L.handR[1], G.handL[2] - L.handR[2]) > 2.5) faults.push(`${w}: their joined hands apart`);
    const back = lumpsL(L).lumps.find((o) => o.name === 'chest');
    if (back) {
      const d = inLump(G.handR, back);
      if (d < -2.0 || d > SINK_MAX) faults.push(`${w}: his right hand not on her back (${d.toFixed(1)})`);
    }
    if (Math.hypot(L.handL[0] - G.shoulderR[0], L.handL[1] - G.shoulderR[1], L.handL[2] - G.shoulderR[2]) > 5) faults.push(`${w}: her left hand not on his shoulder`);
    // (each one's arms out of the other)
    for (const [me, other, solids, name] of [[G, L, lumpsL, 'his'], [L, G, lumpsG, 'her']] as const) {
      const { limbs, lumps } = solids(other);
      for (const side of ['L', 'R'] as const) {
        const sh = side === 'L' ? me.shoulderL : me.shoulderR;
        const el = side === 'L' ? me.elbowL : me.elbowR;
        const ha = side === 'L' ? me.handL : me.handR;
        for (let k = 1; k <= 11; k++) {
          const p: V3 = k <= 6 ? [sh[0] + (el[0] - sh[0]) * (k / 6), sh[1] + (el[1] - sh[1]) * (k / 6), sh[2] + (el[2] - sh[2]) * (k / 6)] : [el[0] + (ha[0] - el[0]) * ((k - 6) / 6), el[1] + (ha[1] - el[1]) * ((k - 6) / 6), el[2] + (ha[2] - el[2]) * ((k - 6) / 6)];
          for (const o of lumps) if (inLump(p, o) > SINK_MAX + 0.5) faults.push(`${w}: ${name} ${side} arm in the other's ${o.name} (${inLump(p, o).toFixed(1)})`);
          for (const l of limbs) if ((l.name === 'neck' || /^(upper|fore)/.test(l.name)) && inLimb(p, l) > 1.2) faults.push(`${w}: ${name} ${side} arm in the other's ${l.name}`);
        }
      }
      // (and the two bodies apart: neither's chest into the other's)
      const c1 = solids(other).lumps.find((o) => o.name === 'chest');
      if (c1 && inLump(me.ribs, c1) > 0) faults.push(`${w}: the two bodies through each other`);
    }
  }
  assert.equal(faults.length, 0, [...new Set(faults)].slice(0, 10).join('; '));
});

test('12. THE CHIME: stopped dead, the masks turned to you and held still until the music starts again; and whirling, the mask kept on you', () => {
  const seenAt = (p: V3): [number, number] => {
    const r = project(p, 'front');
    return [r[0] / 2, r[1] / 2];
  };
  for (const mob of BOTH) {
    let prev: Record<string, [number, number]> | null = null;
    for (const t of framesOf(mob, 'chime')) {
      const s = skeletonAt(mob, 'chime', t);
      if (t >= DN_CHIME.look && t <= DN_CHIME.go) {
        const f = s.face[0];
        const deg = Math.abs((Math.atan2(f[1], f[0]) * 180) / Math.PI);
        assert.ok(deg < 35, `${mob.name} @${t.toFixed(2)}: the mask turned ${deg.toFixed(0)} degrees from you`);
      }
      const pts: Record<string, [number, number]> = { head: seenAt(s.head), pelvis: seenAt(s.pelvis), handL: seenAt(s.handL), handR: seenAt(s.handR), toeL: seenAt(s.toeL), toeR: seenAt(s.toeR) };
      if (prev && t > DN_CHIME.look + 1e-6 && t <= DN_CHIME.go + 1e-6) {
        for (const k of Object.keys(pts)) {
          const d = Math.hypot(pts[k][0] - prev[k][0], pts[k][1] - prev[k][1]);
          assert.ok(d < 0.6, `${mob.name} @${t.toFixed(2)}: its ${k} moved ${d.toFixed(2)} in the held stillness`);
        }
      }
      prev = pts;
    }
    // (whirling, the face is toward you most of the turn: spotted)
    let on = 0;
    const ts = framesOf(mob, 'walk').slice(0, -1);
    for (const t of ts) if (skeletonAt(mob, 'walk', t).face[0][0] > 0.2) on++;
    assert.ok(on >= ts.length * 0.5, `${mob.name}: the mask on you in ${on} of ${ts.length} frames of the whirl`);
  }
});

test('13. THEIR DEATH: a last pirouette, round and round, too fast; two lurches; down in a swirl of skirts or coat-tails; the mask rolling away on its rim to lie still, face up, clear of them', () => {
  const D = DN_DIES;
  const len2 = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1]);
  for (const mob of BOTH) {
    const who = mob.id.includes('lady') ? 'lady' : 'gent';
    const sk = (t: number) => skeletonAt(mob, 'dying', t);
    // THE LAST PIROUETTE: up on the ball of the left foot, its heel well up, the right foot drawn up off the floor
    for (let t = D.rise[1]; t <= D.lurch[0][0]; t += 0.02) {
      const s = sk(t);
      assert.ok(s.toeL[2] < 0.6 && s.heelL[2] > 3, `${mob.name} @${t.toFixed(2)}: not up on the ball of the left foot (toe ${s.toeL[2].toFixed(1)}, heel ${s.heelL[2].toFixed(1)})`);
      assert.ok(Math.min(s.toeR[2], s.heelR[2]) > 6, `${mob.name} @${t.toFixed(2)}: the right foot not drawn up`);
    }
    // round and round, to their right, three times and more, and at its fastest faster than they whirl
    const turned = posedOfMob(mob, 'dying', D.sit).yaw - posedOfMob(mob, 'dying', D.jolt).yaw;
    assert.ok(turned <= -3 * 360, `${mob.name}: it turns ${(turned / 360).toFixed(2)} times`);
    let most = 0;
    for (let t = 0; t <= D.sit; t += 0.01) most = Math.max(most, -spinOf(who, 'dying', t));
    assert.ok(most > DN_WHIRL.turns * (DN_WHIRL.fps / DN_WHIRL.frames) * 1.1, `${mob.name}: at its fastest ${most.toFixed(2)} turns a second`);
    // TWO LURCHES OUT OF CONTROL: carried across each time, onto a foot flung out to catch them
    const s0 = sk(D.lurch[0][0]);
    const s1 = sk(D.lurch[0][1]);
    const s2 = sk(D.lurch[1][1]);
    assert.ok(len2(s1.pelvis, s0.pelvis) > 6 && len2(s2.pelvis, s1.pelvis) > 6, `${mob.name}: the lurches carry them ${len2(s1.pelvis, s0.pelvis).toFixed(1)} and ${len2(s2.pelvis, s1.pelvis).toFixed(1)}`);
    assert.ok(s1.toeR[2] < 0.6 && len2(s1.toeR, s0.toeL) > 8, `${mob.name}: the right foot not down to catch the first lurch`);
    assert.ok(s2.toeL[2] < 0.6 && len2(s2.toeL, s1.toeR) > 6, `${mob.name}: the left foot not down to catch the second`);
    // DOWN ON THE FLOOR, LYING BACK, STILL
    const e = sk(D.long);
    assert.ok(e.pelvis[2] < 7 && e.ribs[2] < 8 && e.head[2] < 9 && e.chest[0][2] > 0.9, `${mob.name}: not lying on their back (hips ${e.pelvis[2].toFixed(1)}, chest ${e.ribs[2].toFixed(1)}, head ${e.head[2].toFixed(1)} up)`);
    const still = posedOfMob(mob, 'dying', D.still + 0.01);
    const last = posedOfMob(mob, 'dying', D.long);
    for (const k of ['px', 'py', 'pz', 'yaw', 'pitch', 'faceTurn', 'lhx', 'rhx', 'lfx', 'rfx'] as const) assert.ok(Math.abs(still[k] - last[k]) < 1e-6, `${mob.name}: not still (${k})`);
    // THE SWIRL: the skirt (or the coat-tails) laid flat on the floor round them, wide, its hem carried round after them
    const piece = who === 'lady' ? 'skirt' : 'coatskirt';
    const cloth = mob.bits(stageOf(mob), dyingMoment(mob, D.long)).filter((b) => b.piece === piece && b.shape.k === 'cloth');
    assert.ok(cloth.length > 0, `${mob.name}: no ${piece}`);
    for (const b of cloth) {
      if (b.shape.k !== 'cloth') continue;
      const hem = b.shape.rings[0];
      const r = Math.min(Math.hypot(hem.u[0], hem.u[1]), Math.hypot(hem.v[0], hem.v[1]));
      assert.ok(hem.c[2] < 1.5 && Math.abs(hem.u[2]) < 0.1 && Math.abs(hem.v[2]) < 0.1, `${mob.name}: the ${piece}'s hem not flat on the floor`);
      assert.ok(r >= (who === 'lady' ? 18 : 12) && len2(hem.c, e.pelvis) < r, `${mob.name}: the ${piece} spread ${r.toFixed(1)} round, its middle ${len2(hem.c, e.pelvis).toFixed(1)} from their hips`);
      const way = Math.abs((Math.atan2(hem.u[1], hem.u[0]) * 180) / Math.PI - (Math.atan2(e.hips[0][1], e.hips[0][0]) * 180) / Math.PI);
      assert.ok(Math.min(way, 360 - way) > 60, `${mob.name}: the ${piece}'s hem carried round only ${Math.min(way, 360 - way).toFixed(0)} degrees`);
    }
    // THE MASK: on the face until it is flung off; down on its rim; rolling away on it; still at last, face up; never in the floor
    assert.equal(maskLooseAt(who, D.mask - 0.01), null, `${mob.name}: the mask loose too soon`);
    const off = maskLooseAt(who, D.mask) as NonNullable<ReturnType<typeof maskLooseAt>>;
    assert.ok(len2(off.c, sk(D.mask).head) < 2, `${mob.name}: the mask not off the face as it leaves it`);
    const down = maskLooseAt(who, D.maskDown + 0.02) as NonNullable<ReturnType<typeof maskLooseAt>>;
    assert.ok(down.n[2] < 0.5, `${mob.name}: it comes down tipped ${((Math.asin(down.n[2]) * 180) / Math.PI).toFixed(0)} degrees from its rim: not on its rim`);
    const Z = maskSize(who);
    let rolled = 0;
    let lowest = Infinity;
    let prev = down.c;
    for (let t = D.mask; t <= D.long + 1e-9; t += 1 / 120) {
      const m = maskLooseAt(who, t) as NonNullable<ReturnType<typeof maskLooseAt>>;
      if (t > D.maskDown) {
        rolled += len2(m.c, prev);
        prev = m.c;
      }
      // (the lowest of its porcelain face and of its hollow back)
      const l: V3 = [m.u[1] * m.n[2] - m.u[2] * m.n[1], m.u[2] * m.n[0] - m.u[0] * m.n[2], m.u[0] * m.n[1] - m.u[1] * m.n[0]];
      for (let i = 0; i < 24; i++) {
        for (let j = 0; j <= 12; j++) {
          const a = (i / 24) * Math.PI * 2;
          const b = (j / 12) * Math.PI - Math.PI / 2;
          const x = Math.sin(b);
          const front = x >= 0.05;
          const depth = front ? Z.n : x <= 0 ? Z.back : 0;
          const z = m.c[2] + x * depth * m.n[2] + Math.cos(b) * (Math.cos(a) * Z.l * l[2] + Math.sin(a) * Z.u * m.u[2]);
          lowest = Math.min(lowest, z);
        }
      }
    }
    assert.ok(lowest > -0.1, `${mob.name}: the mask ${(-lowest).toFixed(2)} into the floor`);
    assert.ok(rolled > 15, `${mob.name}: it rolls ${rolled.toFixed(1)} on the floor`);
    const lies = maskLooseAt(who, D.maskStill + 0.01) as NonNullable<ReturnType<typeof maskLooseAt>>;
    const end = maskLooseAt(who, D.long) as NonNullable<ReturnType<typeof maskLooseAt>>;
    assert.ok(lies.n[2] > 0.9999, `${mob.name}: the mask not lying face up`);
    assert.ok(len2(lies.c, end.c) < 1e-9 && Math.hypot(lies.u[0] - end.u[0], lies.u[1] - end.u[1], lies.u[2] - end.u[2]) < 1e-9, `${mob.name}: the mask not still`);
    assert.ok(len2(end.c, e.pelvis) > TILE3, `${mob.name}: the mask lies ${(len2(end.c, e.pelvis) / TILE3).toFixed(2)} tiles from them`);
    // INTO THE DEATH, as the game may go into it: from their pose (every frame of it: test 2), from struck, from the whirl as
    // it comes round to face you
    const handovers: Handover[] = [
      { from: 'stand', at: 0, to: 'dying', toAt: 0 },
      { from: 'reel', at: 0, to: 'dying', toAt: 0 },
      { from: 'reel', at: 'end', to: 'dying', toAt: 0 },
      ...WHIRL_ROUND.map((t): Handover => ({ from: 'walk', at: t, to: 'dying', toAt: 0 })),
    ];
    const jumps = checkBoss(mob, { ...SHAPE(mob), handovers }, ['dying']);
    assert.equal(jumps.length, 0, `${mob.name}: ${findingsSaid(jumps).slice(0, 8).join('; ')}`);
  }
});
