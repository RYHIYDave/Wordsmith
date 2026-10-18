// THE HEADSMAN, MADE NEW (src/art/headsman2.ts, his look; src/art/headsman2_moves.ts, his moves). A MOCK-UP:
// NOT IN THE GAME, behind HEADSMAN2, off. His words to the main chat, 17 Oct 2026, 11:37 (Eastern), sent to
// the art chat at his word: "I’d like the headsman completely redesigned to be sleeker and more agile."
// His picks in the art chat (Eastern): by 15:55, "Lean, with a long axe (Recommended)", "Darting dashes",
// "All new attacks"; by 17:51, of the first look of him, "The crescent head of the axe is weird, and I like
// the full coat look with the wiry frame underneath", and his four attacks, "Yes, these four
// (Recommended)"; by 17:57, "Yes, animate him (Recommended)"; and at 17:57, "Make sure he passes the
// clipping checks". Of the vault in the films of his moves, by 16:45 Pacific (19:45 Eastern), "Bigger for sure,
// much bigger aoe on the hit with more force": so the vault goes up the haft into a handstand on it, over, and
// down in a slam (art/headsman2_shots.ts), all of it through the same checks. So:
//   1. the switch is off, and nothing of the game imports him;
//   2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and
//      from behind: nothing through him or his coat, feet that grip, nothing in the floor, nothing jerky,
//      nothing that jumps from one move to the next (each move that carries him ending where the game
//      puts him: H2_SHIFT), blows drawn back, held and carried through, hips first, alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, his pink edge while he lives and
//      none as he dies, every pixel whole or empty but the edge, no pixel alone;
//   4. NOTHING CUT OFF: in every frame of every move, both ways round, he is inside his picture with room
//      to spare;
//   5. NOTHING OF HIM IN THE FLOOR, beyond what the checks see (all he wears and carries: his coat, his
//      sash, his hood, his axe): but his blade's edge where it bites the floor, a little way in, in the
//      vault and the flurry's third cut, and the spike of his axe while it is driven in for the vault;
//   6. where his blade bites the floor it stops dead, and stays where it bit while he is bent over it;
//   7. what falls from him as he dies, his axe and his hood, lies clear of him once he is down, from in
//      front and from behind.
//   run: tsx --test tests/headsman2.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { HEADSMAN2, H2_AXE_GOES, H2_CANVAS, H2_HOOD_GOES, axe2Of } from '../src/art/headsman2';
import { HEADSMAN2_FIGHT } from '../src/game/bosses';
import { HEADSMAN_2, H2_FLURRY_HITS, H2_SHAPE, H2_VAULT } from '../src/art/headsman2_moves';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import type { Painted } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import type { Bit, Mob, Shape } from '../src/art/new_mobs3';
import { canvasOf, deathOfMob, dyingMoment, momentOf, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../src/art/new_mobs3';
import { stage } from '../src/art/skin';
import { len, sub } from '../src/art/skeleton';
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

const MOB = HEADSMAN_2;
/** Every move of his, but his death. */
const LIVING = movesOf(MOB).filter((m) => m !== 'dying');
const VIEWS = ['front', 'back'] as const;

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

/** Every frame of every move of his (the game's frames of each: framesOf), painted on his whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING, 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}

test('1. his switch goes with his fight\'s (game/bosses.ts HEADSMAN2_FIGHT); the game makes him only through the bestiary, behind it', () => {
  // (the main chat brought him in, 17 Oct: art/bestiary.ts makes him in place of the first Headsman while HEADSMAN2 is on)
  assert.equal(HEADSMAN2.on, HEADSMAN2_FIGHT.on, 'his look and his fight switched together');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || f === 'art/headsman2.ts' || f === 'art/headsman2_moves.ts') continue;
    if (/from ['"][^'"]*headsman2(_moves)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), 'art/bestiary.ts', 'game files that import him');
});

test('2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,setOff,halt,flurry,wheel,vault,dashL,dashR');
  const found = checkBoss(MOB, H2_SHAPE);
  assert.equal(found.length, 0, `the Headsman: ${findingsSaid(found).slice(0, 12).join('; ')}`);
});

test('3. every frame paints both ways round: nothing cyan, his pink edge while he lives and none as he dies, every pixel whole or empty but the edge, no pixel alone', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
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
    for (const l of p.lights) {
      const [r, g, b] = rgba(l.color);
      if (cyanGlow(r, g, b) || FRIEND.has(`${r},${g},${b}`) || r < 150 || r < g || r < b) cyan = true;
    }
    const alive = move !== 'dying';
    if (n < 600 || cyan || odd || (alive ? rim < 60 : rim !== 0)) faults.push(`${move} ${view} @${t.toFixed(2)}: ${n} pixels, ${rim} of his edge, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
    const solid = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] === 255;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (!solid(x, y)) continue;
        let m = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && solid(x + dx, y + dy)) m++;
        if (m === 0) faults.push(`${move} ${view} @${t.toFixed(2)}: a pixel alone at ${x},${y}`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. NOTHING CUT OFF: in every frame, both ways round, he is inside his picture with room to spare', () => {
  const ROOM = 8;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${H2_CANVAS.w}x${H2_CANVAS.h}`);
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
    if (room < ROOM) faults.push(`${move} ${view} @${t.toFixed(2)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= ROOM, `the nearest he comes to the edge: ${least}`);
});

/** How far below the floor a solid goes (0: not at all). */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  return Math.max(0, -z);
}
/** How far below the floor his blade's edge goes, from horn to horn (0: not at all). */
function edgeUnder(move: string, t: number): number {
  const s = skeletonAt(MOB, move, t);
  const a = axe2Of(s, posedOfMob(MOB, move, t));
  return Math.max(0, -Math.min(a.edge[2], a.horns[0][2], a.horns[1][2]));
}
/** Where his blade bites the floor, in the moves where it does (from the blow until he has it up again, seconds). */
const BITES: Record<string, [number, number]> = { vault: [H2_VAULT.hit - 0.04, H2_VAULT.hit + 0.42], flurry: [H2_FLURRY_HITS[2], H2_FLURRY_HITS[2] + 0.3] };
/** As far as the blade's edge goes into the floor where it bites, and the spike of the axe where he drives it in to vault (his own lengths). */
const BITE_MOST = 4;
const SPIKE_MOST = 7;

test('5. NOTHING OF HIM IN THE FLOOR, all he wears and carries, but his blade where it bites and the spike he vaults on', () => {
  const can = canvasOf(MOB);
  const st = stage(paintViewOf(MOB, 'front'), can.ax, can.ay, can);
  const faults: string[] = [];
  let bit = 0;
  for (const move of [...LIVING, 'dying']) {
    const mv = move === 'dying' ? MOB.dying : move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? MOB[move] : (MOB.more ?? {})[move];
    for (const t of framesOf(MOB, move)) {
      const m = move === 'dying' ? dyingMoment(MOB, t) : momentOf(MOB, mv, t);
      const bits: Bit[] = MOB.bits(st, m).filter((b) => b.part !== 'blade' && !(move === 'dying' && ((b.piece === 'axe' && t >= H2_AXE_GOES) || (b.piece === 'hood' && t >= H2_HOOD_GOES))));
      for (const b of bits) {
        const by = under(b.shape);
        const spike = move === 'vault' && b.part === 'haft' && t < H2_VAULT.free;
        if (by > (spike ? SPIKE_MOST : 0.5)) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${by.toFixed(1)} into the floor`);
      }
      if (move === 'dying' && t >= H2_AXE_GOES) continue;
      const e = edgeUnder(move, t);
      const bites = BITES[move];
      const biting = bites !== undefined && t >= bites[0] && t <= bites[1];
      if (biting) bit = Math.max(bit, e);
      if (e > (biting ? BITE_MOST : 0.5)) faults.push(`${move} @${t.toFixed(2)}: the blade's edge ${e.toFixed(1)} into the floor`);
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(bit >= 1.5, `where it bites, the blade goes into the floor ${bit.toFixed(1)}`);
});

test('6. where his blade bites the floor it stops dead, and stays where it bit while he is bent over it', () => {
  const eye = (move: string, t: number): V3 => axe2Of(skeletonAt(MOB, move, t), posedOfMob(MOB, move, t)).eye;
  for (const [move, from, to] of [['vault', H2_VAULT.hit + 0.12, H2_VAULT.hit + 0.3], ['flurry', H2_FLURRY_HITS[2] + 0.08, H2_FLURRY_HITS[2] + 0.2]] as const) {
    const at = eye(move, from);
    for (let t = from; t <= to + 1e-6; t += 1 / 30) {
      const moved = len(sub(eye(move, t), at));
      assert.ok(moved < 0.6, `${move} @${t.toFixed(2)}: the blade has moved ${moved.toFixed(1)} since it bit`);
      const e = edgeUnder(move, t);
      assert.ok(e >= 1.5 && e <= BITE_MOST, `${move} @${t.toFixed(2)}: its edge ${e.toFixed(1)} into the floor`);
    }
  }
});

test('7. what falls from him as he dies, his axe and his hood, lies clear of him once he is down, from in front and from behind', () => {
  const fallen = new Set(['axe', 'hood']);
  // (him alone: what falls from him sent far off his picture; and what falls alone)
  const him: Mob = { ...MOB, fall: (piece) => { const f = MOB.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
  const pieces: Mob = { ...MOB, bits: (st, m) => MOB.bits(st, m).filter((b) => fallen.has(b.piece)) };
  const down = 2.1 / MOB.dieTime;
  for (const view of VIEWS) {
    for (let k = down; k <= 1 + 1e-9; k += 0.05) {
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
      assert.ok(mine > 1500 && theirs > 1000, `${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of what fell`);
      assert.equal(both, 0, `${view} @${k.toFixed(2)}: what fell from him lies over him or under him by ${both} pixels`);
    }
  }
});
