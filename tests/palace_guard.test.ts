// FLOOR 16'S PALACE GUARD (src/art/palace_guard.ts, their look; src/art/palace_guard_moves.ts, their moves): the
// partisan guard and the sword guard. A MOCK-UP: NOT IN THE GAME, behind GUARD_ON, off. His brief, 28 Oct: “1 and 2” (the
// partisan and the sword and shield, both), “A head taller, fewer (Recommended)”, “March in step (Recommended)”, “Long
// thrust, wide sweep (Recommended)”, “Grey breath through visors (Recommended)”, “To one knee, then a crash
// (Recommended)”, “Not the city watch (Recommended)”, “Clank and stamp (Recommended)”. Held as floor 16's gardeners and
// grooms are (tests/palace_hands.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), both blows: every frame, from in front and
//      from behind, and every handover;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while they live and none as they
//      die, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF;
//   5. NOTHING OF THEM IN THE FLOOR: all they wear and carry;
//   6. THE HUSH leaking out of the visor while they live; a great breath of it as it leaves them; none once they lie still;
//   7. the dull pink in the slit while they live, gone out once they are down; and down they lie, low on the floor;
//   8. what falls from them as they die (the partisan; the sword and the shield) lies clear of them once they are down;
//   9. HIS PICKS: two blows (the long thrust, the wide sweep); the thrust reaching far before them; the sweep crossing
//      before them from their right to their left; the march; to one knee (the right knee down, the left up), then down.
//   run: tsx --test tests/palace_guard.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { GUARD_CANVAS, GUARD_ON, PARTISAN, SWORD, partisanOf, swordOf } from '../src/art/palace_guard';
import { GD_DIES, GD_PACE, GD_SHAPE_PARTISAN, GD_SHAPE_SWORD, GD_SWEEP, GD_THRUST, GUARD_PARTISAN, GUARD_SWORD } from '../src/art/palace_guard_moves';
import { TILE3, skeletonAt, posedOfMob } from '../src/art/new_mobs3';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { FLAME, ENEMY_RIM } from '../src/art/mkit';
import type { Bit, Mob, Moment, Shape } from '../src/art/new_mobs3';
import { canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import type { Stage } from '../src/art/skin';
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
const LIVING = (mob: Mob): string[] => movesOf(mob).filter((m) => m !== 'dying');

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
const isCyan = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  return FRIEND.has(`${r},${g},${b}`) || cyanGlow(r, g, b);
};

/** A move of a mob, as the game holds it. */
const moveOf = (mob: Mob, move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : (mob.more ?? {})[move]);
/** The moment of a move at `t`. */
const at = (mob: Mob, move: string, t: number): Moment => (move === 'dying' ? dyingMoment(mob, t) : momentOf(mob, moveOf(mob, move), t));
const stageOf = (mob: Mob): Stage => {
  const can = canvasOf(mob);
  return stage(paintViewOf(mob, 'front'), can.ax, can.ay, can);
};

/** Every frame of every move of theirs (the game's frames of each: framesOf), painted on their whole picture both ways round. */
const PAINTED: { mob: Mob; move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
const ALL: Mob[] = [GUARD_PARTISAN, GUARD_SWORD];
const SHAPE = (mob: Mob) => (mob === GUARD_PARTISAN ? GD_SHAPE_PARTISAN : GD_SHAPE_SWORD);
for (const mob of ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (_mob: Mob, move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(GUARD_ON.on, false, 'GUARD_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/palace_guard(_moves)?\.ts$/.test(f)) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (/^art\/palace_guard(_moves)?$/.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover, both of them', () => {
  for (const mob of ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,sweep');
    const found = checkBoss(mob, SHAPE(mob));
    assert.equal(found.length, 0, `${mob.name}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
});

test('3. every frame paints both ways round: nothing cyan, the pink edge while they live and none as they die, every pixel whole or empty but the edge', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of PAINTED) {
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
    if (n < 300 || cyan || odd || (alive ? rim < 40 : rim !== 0)) faults.push(`${said(mob, move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${GUARD_CANVAS.w}x${GUARD_CANVAS.h}`);
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
    const room = Math.min(x0, y0, w - 1 - x1, h - 1 - y1);
    least = Math.min(least, room);
    if (room < ROOM) faults.push(`${said(mob, move, view, t)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= ROOM, `the nearest they come to the edge: ${least}`);
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

test('5. NOTHING OF THEM IN THE FLOOR: all they wear and carry, both of them', () => {
  const faults: string[] = [];
  for (const mob of ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        // (but what has fallen from them as they die, which falls as itself: test 8)
        const bits: Bit[] = mob.bits(st, at(mob, move, t)).filter((b) => !(move === 'dying' && (b.piece === 'partisan' || b.piece === 'sword' || b.piece === 'shield') && t >= GD_DIES.drop));
        for (const b of bits) {
          if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
          const by = under(b.shape);
          if (by > 0.6) faults.push(`${mob.name} ${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
        }
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

/** The Hush coming out of them at a moment (laid after their edge: the grains). */
function breathAt(mob: Mob, st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  mob.bits(st, m);
  return mob.grains?.(st, m) ?? [];
}

test('6. THE HUSH leaking out of them while they live; a great breath of it as it leaves them; none once they lie still', () => {
  for (const mob of ALL) {
    const st = stageOf(mob);
    let most = 0;
    let frames = 0;
    let some = 0;
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const n = breathAt(mob, st, at(mob, move, t)).length;
        frames++;
        if (n > 0) some++;
        most = Math.max(most, n);
      }
    }
    assert.ok(some > 0.9 * frames, `the Hush leaking in ${some} of ${frames} living frames`);
    let great = 0;
    for (let t = 0.3; t <= 1.2; t += 0.05) {
      const v = breathAt(mob, st, dyingMoment(mob, t));
      great = Math.max(great, v.length);
      for (const [, c] of v) assert.ok(!isCyan(c), `the Hush in cyan, ${c}`);
    }
    assert.ok(great >= 1.5 * most, `the Hush leaving them, ${great} at most; the most while they live, ${most}`);
    for (let t = 2.0; t <= GD_DIES.long + 1e-9; t += 0.05) assert.equal(breathAt(mob, st, dyingMoment(mob, t)).length, 0, `@${t.toFixed(2)}: the Hush still coming out`);
  }
});

test('7. the dull pink in their eyes while they live, gone out once they are down; and down they lie, low on the floor', () => {
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  const height = (p: Painted): number => {
    const { w, h, d } = p.px;
    let y0 = h;
    let y1 = -1;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3]) {
          y0 = Math.min(y0, y);
          y1 = Math.max(y1, y);
        }
      }
    }
    return y1 - y0;
  };
  for (const mob of ALL) {
    const st = stageOf(mob);
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const m = at(mob, move, t);
        assert.ok(pinkEyes(mob.bits(st, m)), `${mob.name} ${move} @${t.toFixed(2)}: no pink in the eyes`);
      }
    }
    for (let t = GD_DIES.knee; t <= GD_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.name} @${t.toFixed(2)}: the pink still in the eyes`);
    // (seen from above at the game's slant a body lying along the floor still stands some way up the picture)
    for (const view of VIEWS) {
      const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
      const up = height(paintMob(mob, 'stand', 0, view));
      const down = height(deathOfMob(him, 1, view));
      assert.ok(down < 0.65 * up, `${mob.name} ${view}: ${down} pixels tall lying down, ${up} standing`);
    }
  }
});

test('8. what falls from them as they die lies clear of them once they are down, from in front and from behind', () => {
  const fallen = new Set(['partisan', 'sword', 'shield']);
  for (const mob of ALL) {
    // (them alone: what falls from them sent far off their picture; and what falls alone)
    const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const pieces: Mob = { ...mob, bits: (st, m) => mob.bits(st, m).filter((b) => fallen.has(b.piece)) };
    const down = (GD_DIES.down + 0.2) / mob.dieTime;
    for (const view of VIEWS) {
      for (let k = down; k <= 1 + 1e-9; k += 0.04) {
        const a = deathOfMob(him, Math.min(1, k), view).px.d;
        const b = deathOfMob(pieces, Math.min(1, k), view).px.d;
        let mine = 0;
        let theirs = 0;
        let both = 0;
        for (let i = 3; i < a.length; i += 4) {
          if (a[i]) mine++;
          if (b[i]) theirs++;
          if (a[i] && b[i]) both++;
        }
        assert.ok(mine > 500 && theirs > 15, `${mob.name} ${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of what fell`);
        assert.equal(both, 0, `${mob.name} ${view} @${k.toFixed(2)}: what fell from him lies over him or under him by ${both} pixels`);
      }
    }
  }
});

test('9. HIS PICKS: two blows, the long thrust reaching far before them and the wide sweep crossing before them from their right to their left; the march; to one knee, then down', () => {
  for (const mob of ALL) {
    assert.ok(mob.more?.sweep, `${mob.name}: the wide sweep, his second blow`);
    assert.equal(mob.walk.ground, GD_PACE * TILE3, `${mob.name}: marched at their pace`);
    const isP = mob === GUARD_PARTISAN;
    const tipAt = (move: string, t: number): readonly number[] => {
      const s = skeletonAt(mob, move, t);
      return isP ? (move === 'sweep' ? partisanOf(s, posedOfMob(mob, move, t) as unknown as { draw: number }).blade : partisanOf(s, posedOfMob(mob, move, t) as unknown as { draw: number }).tip) : move === 'sweep' ? swordOf(s).mid : swordOf(s).tip;
    };
    const reach = tipAt('attack', GD_THRUST.hit)[0];
    const want = isP ? PARTISAN.long * 0.9 : SWORD.blade + 12;
    assert.ok(reach > want, `${mob.name}: the thrust reaches ${reach.toFixed(1)} before them (at least ${want.toFixed(1)})`);
    const before = tipAt('sweep', GD_SWEEP.hit - 0.1);
    const after = tipAt('sweep', GD_SWEEP.hit + 0.12);
    assert.ok(before[1] < -4 && after[1] > before[1] + 10, `${mob.name}: the sweep from ${before[1].toFixed(1)} to ${after[1].toFixed(1)} across them`);
    // (to one knee: the right knee on the floor, the left up, the left foot flat before them; then both down)
    const k = skeletonAt(mob, 'dying', (GD_DIES.hold[0] + GD_DIES.hold[1]) / 2);
    assert.ok(k.kneeR[2] < 4.5, `${mob.name}: the right knee down, ${k.kneeR[2].toFixed(1)} up`);
    assert.ok(k.kneeL[2] > 12, `${mob.name}: the left knee up, ${k.kneeL[2].toFixed(1)} up`);
    const d = skeletonAt(mob, 'dying', GD_DIES.long);
    assert.ok(d.kneeL[2] < 8 && d.kneeR[2] < 8 && d.head[2] < 20, `${mob.name}: down at the end (knees ${d.kneeL[2].toFixed(1)}, ${d.kneeR[2].toFixed(1)}, head ${d.head[2].toFixed(1)})`);
  }
});
