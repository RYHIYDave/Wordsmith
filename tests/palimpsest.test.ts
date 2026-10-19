// FLOOR 13'S BOSS, THE PALIMPSEST (src/art/palimpsest.ts, its look; src/art/palimpsest_moves.ts, its moves;
// src/art/palimpsest_shots.ts, what it leaves on the floor). A MOCK-UP: NOT IN THE GAME, behind PALIMPSEST_ON, off. Its
// brief is this chat's, on his word of 18 Oct (“Hey go without my say so.  If something is shit I’ll get it to it but
// you’re doing a great jobs. At least for 11-15”), sent him with its films. Held as floor 12's dredgers are
// (tests/dredgers.test.ts), and as every boss is:
//   1. the switch is off, and nothing of the game imports it;
//   2. EVERY MOVE OF ITS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from behind,
//      and every handover: nothing through it; feet that grip; nothing in the floor; nothing jerky; the slam drawn back,
//      held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while it lives and none as it dies,
//      every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, it is inside its picture with room to spare, its whirl too;
//   5. NOTHING OF IT IN THE FLOOR, beyond what the checks see: its pages, fists and feet;
//   6. ITS PAGES: worn, fewer of them and more of the old writing and the burning words; struck, pages torn off its
//      front and thrown down on the floor; its Paper Cuts, half its pages flung out to whirl round it within PA_WHIRL,
//      their edges glinting, and every one back on it by the end; its Loose Leaves, its crest torn off as birds and
//      grown back by the end; its Rewrite, its strays crawling home and gone into it by the end;
//   7. the pink in its eyes while it lives, gone out once it is down; and down it lies, a low heap;
//   8. THE STOLEN WORDS rising out of it as it dies, pink going pale; none once it lies still;
//   9. what it leaves on the floor (the shots): drawn, in the enemy's pink or an honest fire's orange, never cyan.
//   run: tsx --test tests/palimpsest.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { PALIMPSEST_ON, PA_CANVAS, PA_WHIRL, PAGE_COUNT } from '../src/art/palimpsest';
import { NAMES, PALIMPSEST, PA_CUTS, PA_DIES, PA_LEAVES, PA_REWRITE, PA_SHAPE, WEAR } from '../src/art/palimpsest_moves';
import { drawBirdMark, drawBurningPage, drawFallenPage, drawLeafBird, drawPageHome, drawSlamSplash } from '../src/art/palimpsest_shots';
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

const moveOf = (mob: Mob, move: string) => (move === 'stand' || move === 'walk' || move === 'attack' || move === 'reel' ? mob[move] : (mob.more ?? {})[move]);
const at = (mob: Mob, move: string, t: number): Moment => (move === 'dying' ? dyingMoment(mob, t) : momentOf(mob, moveOf(mob, move), t));
const stageOf = (mob: Mob): Stage => {
  const can = canvasOf(mob);
  return stage(paintViewOf(mob, 'front'), can.ax, can.ay, can);
};
const MOB = PALIMPSEST;

/** Every frame of every move, painted on its whole picture both ways round. */
const PAINTED: { move: string; view: (typeof VIEWS)[number]; t: number; p: Painted }[] = [];
for (const view of VIEWS) {
  for (const move of [...LIVING(MOB), 'dying']) {
    for (const t of framesOf(MOB, move)) PAINTED.push({ move, view, t, p: move === 'dying' ? deathOfMob(MOB, t / MOB.dieTime, view) : paintMob(MOB, move, t, view) });
  }
}
const said = (move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

test('1. the switch is off, and nothing of the game imports it', () => {
  assert.equal(PALIMPSEST_ON.on, false, 'PALIMPSEST_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/palimpsest(_moves|_shots)?\.ts$/.test(f)) continue;
    if (/from ['"][^'"]*palimpsest(_moves|_shots)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'game files that import it');
});

test('2. EVERY MOVE OF ITS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  assert.equal(movesOf(MOB).join(','), 'stand,walk,attack,reel,dying,cuts,leaves,rewrite');
  const found = checkBoss(MOB, PA_SHAPE);
  assert.equal(found.length, 0, findingsSaid(found).slice(0, 12).join('; '));
});

test('3. every frame paints both ways round: nothing cyan, the pink edge while it lives and none as it dies, every pixel whole or empty but the edge', () => {
  const [pr, pg, pb] = rgba(ENEMY_RIM);
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
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
    if (n < 2000 || cyan || odd || (alive ? rim < 100 : rim !== 0)) faults.push(`${said(move, view, t)}: ${n} pixels, ${rim} of the edge, ${odd} neither whole nor empty${cyan ? ', and cyan' : ''}`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
});

test('4. NOTHING CUT OFF: in every frame, both ways round, it is inside its picture with room to spare, its whirl too', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${PA_CANVAS.w}x${PA_CANVAS.h}`);
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
    if (room < ROOM) faults.push(`${said(move, view, t)}: ${room} pixels from the edge`);
  }
  assert.equal(faults.length, 0, faults.slice(0, 10).join('; '));
  assert.ok(least >= ROOM, `the nearest it comes to the edge: ${least}`);
});

/** How far below the floor a solid goes (0: not at all). */
function under(sh: Shape): number {
  let z = Infinity;
  if (sh.k === 'rod') z = Math.min(sh.a[2] - sh.ra, sh.b[2] - sh.rb);
  else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'panel') z = sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]);
  return Math.max(0, -z);
}

test('5. NOTHING OF IT IN THE FLOOR: its pages, fists and feet', () => {
  const faults: string[] = [];
  const st = stageOf(MOB);
  for (const move of [...LIVING(MOB), 'dying']) {
    for (const t of framesOf(MOB, move)) {
      for (const b of MOB.bits(st, at(MOB, move, t))) {
        if (b.shape.k === 'mote' || b.shape.k === 'glow' || b.shape.k === 'dot') continue;
        const by = under(b.shape);
        if (by > 0.6) faults.push(`${move} @${t.toFixed(2)}: ${b.part} ${b.piece} ${by.toFixed(1)} into the floor`);
      }
    }
  }
  assert.equal(faults.length, 0, faults.slice(0, 12).join('; '));
});

/** Its pages at a moment: those on it, where each is; by the bits it paints. */
const pagesOf = (bits: Bit[]): { c: V3 }[] => bits.filter((b) => b.piece === 'page' && b.shape.k === 'panel').map((b) => ({ c: (b.shape as { c: V3 }).c }));
/** How many pixels of the burning words (the enemy's pink to gold) are painted on it. */
function burning(p: Painted): number {
  const set = new Set(FLAME.map((c) => rgba(c).slice(0, 3).join(',')));
  let n = 0;
  for (let i = 0; i < p.px.d.length; i += 4) if (p.px.d[i + 3] === 255 && set.has(`${p.px.d[i]},${p.px.d[i + 1]},${p.px.d[i + 2]}`)) n++;
  return n;
}

test('6. ITS PAGES: worn, fewer and more burning words; struck, torn off and thrown down; the whirl within its bounds and home again; the crest and the strays', () => {
  const st = stageOf(MOB);
  // worn
  const whole = pagesOf(MOB.bits(st, at(MOB, 'stand', 0))).length;
  WEAR.now = 1;
  const worn = pagesOf(MOB.bits(st, at(MOB, 'stand', 0))).length;
  const wornBurn = burning(paintMob(MOB, 'stand', 0, 'front'));
  WEAR.now = 0;
  const wholeBurn = burning(paintMob(MOB, 'stand', 0, 'front'));
  assert.ok(whole > 0.9 * PAGE_COUNT && worn < 0.7 * whole, `pages on it: ${whole} whole, ${worn} worn (of ${PAGE_COUNT})`);
  assert.ok(wornBurn > 2 * wholeBurn + 20, `burning words showing: ${wholeBurn} whole, ${wornBurn} worn`);
  // struck: some pages land on the floor before it stands again
  const landed = pagesOf(MOB.bits(st, at(MOB, 'reel', 0.42))).filter((p) => p.c[2] < 1.5).length;
  assert.ok(landed >= 3, `pages torn off and lying on the floor as it recovers: ${landed}`);
  // the whirl: at its height, many pages out at its distance, none beyond it; all home by the end
  const mid = (PA_CUTS.hit + PA_CUTS.home) / 2;
  const out = pagesOf(MOB.bits(st, at(MOB, 'cuts', mid))).map((p) => Math.hypot(p.c[0], p.c[1]));
  const flying = out.filter((r) => r > PA_WHIRL.inner - 2).length;
  assert.ok(flying > 0.3 * whole, `pages out in the whirl: ${flying}`);
  assert.ok(Math.max(...out) <= PA_WHIRL.outer + 1, `the whirl's furthest page ${Math.max(...out).toFixed(1)}, its bound ${PA_WHIRL.outer}`);
  const end = pagesOf(MOB.bits(st, at(MOB, 'cuts', PA_CUTS.long))).map((p) => Math.hypot(p.c[0], p.c[1]));
  assert.ok(Math.max(...end) < 40, `a page still out at the whirl's end, ${Math.max(...end).toFixed(1)} from its middle`);
  // the crest: torn off as birds, grown back
  const leaves = (t: number): number => MOB.bits(st, at(MOB, 'leaves', t)).filter((b) => b.piece === 'leaf').length;
  const birds = (t: number): number => MOB.bits(st, at(MOB, 'leaves', t)).filter((b) => b.piece === 'bird').length;
  assert.ok(leaves(0) >= 7 && leaves(PA_LEAVES.hit + 0.1) === 0 && birds(PA_LEAVES.hit + 0.1) >= 21 && birds(PA_LEAVES.launch + 0.05) === 0 && leaves(PA_LEAVES.long) >= 7, `the crest: ${leaves(0)}, then ${leaves(PA_LEAVES.hit + 0.1)} with ${birds(PA_LEAVES.hit + 0.1)} pieces of birds, then ${leaves(PA_LEAVES.long)}`);
  // the strays: lying about it as it crouches, gone into it by the end
  const strays = (t: number): number => MOB.bits(st, at(MOB, 'rewrite', t)).filter((b) => b.piece === 'stray').length;
  assert.ok(strays(PA_REWRITE.crawl[0]) >= 10 && strays(PA_REWRITE.long) === 0, `strays: ${strays(PA_REWRITE.crawl[0])}, then ${strays(PA_REWRITE.long)}`);
});

test('7. the pink in its eyes while it lives, gone out once it is down; and down it lies, a low heap', () => {
  const st = stageOf(MOB);
  const lit = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eye' && b.shape.k === 'ball' && typeof b.shape.skin === 'function' && b.shape.skin([1, 0, 0], 3, 0, 0) !== '#14101a');
  for (const move of LIVING(MOB)) for (const t of framesOf(MOB, move)) assert.ok(lit(MOB.bits(st, at(MOB, move, t))), `${move} @${t.toFixed(2)}: no pink in the eyes`);
  for (let t = PA_DIES.knees; t <= PA_DIES.long + 1e-9; t += 0.1) assert.ok(!lit(MOB.bits(st, dyingMoment(MOB, t))), `@${t.toFixed(2)}: the pink still in the eyes`);
  // (how high the top of it is over the floor: standing, and as the heap it ends as)
  const top = (bits: Bit[]): number => Math.max(...bits.map((b) => {
    const sh = b.shape;
    if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
    if (sh.k === 'panel') return sh.c[2] + Math.abs(sh.u[2]) + Math.abs(sh.v[2]);
    return -Infinity;
  }));
  const up = top(MOB.bits(st, at(MOB, 'stand', 0)));
  const down = top(MOB.bits(st, dyingMoment(MOB, PA_DIES.long)));
  assert.ok(down < 0.35 * up, `its top ${down.toFixed(1)} over the floor as a heap, ${up.toFixed(1)} standing`);
});

test('8. THE STOLEN WORDS rising out of it as it dies, pink going pale; none once it lies still', () => {
  const st = stageOf(MOB);
  const words = (t: number): ReadonlyArray<readonly [V3, string, number]> => {
    const m = dyingMoment(MOB, t);
    MOB.bits(st, m);
    return MOB.grains?.(st, m) ?? [];
  };
  let most = 0;
  let pink = 0;
  let pale = 0;
  for (let t = PA_DIES.words[0]; t <= PA_DIES.words[1]; t += 0.05) {
    const w = words(t);
    most = Math.max(most, w.length);
    for (const [, c] of w) {
      assert.ok(!isCyan(c), `a word in cyan, ${c}`);
      if (FLAME.includes(c)) pink++;
      else {
        const [r, g, b] = rgba(c);
        if (Math.max(r, g, b) - Math.min(r, g, b) < 40 && r > 150) pale++;
      }
    }
  }
  assert.ok(most > 60, `the words pouring out, ${most} at most`);
  assert.ok(pink > 100 && pale > 100, `pink (${pink}) going pale (${pale})`);
  for (let t = PA_DIES.words[1] + 0.05; t <= PA_DIES.long + 1e-9; t += 0.05) assert.equal(words(t).length, 0, `@${t.toFixed(2)}: words still coming out`);
});

/** A canvas that only keeps the colours it is given (the shots draw with fillRect). */
function recorder(): { g: CanvasRenderingContext2D; colours: Set<string>; n: () => number } {
  const colours = new Set<string>();
  let n = 0;
  const g = {
    globalAlpha: 1,
    fillStyle: '#000000',
    fillRect(): void {
      n++;
      colours.add(String(g.fillStyle));
    },
  } as unknown as CanvasRenderingContext2D;
  return { g, colours, n: () => n };
}

test('9. what it leaves on the floor: drawn, in its paper and pulp, the enemy\'s pink or an honest fire\'s orange, never cyan', () => {
  const floorAt = (x: number, y: number): readonly [number, number] => [100 + (x - y) * 16, 60 + (x + y) * 8];
  const r = recorder();
  for (let t = 0; t < 0.7; t += 0.1) drawSlamSplash(r.g, floorAt, 2, 2, t);
  drawFallenPage(r.g, floorAt, 3, 3, 0.4, 1);
  for (let t = 0; t < 0.8; t += 0.1) drawBurningPage(r.g, floorAt, 3, 3, 0.4, 1, t);
  for (let t = 0; t < 1; t += 0.1) drawPageHome(r.g, floorAt, 1, 1, 3, 3, 0.2, 2, t);
  for (let t = 0; t < 0.5; t += 0.1) drawLeafBird(r.g, floorAt, 2, 2, 20, 0.5, t, 3);
  for (let k = 0.1; k < 1; k += 0.2) drawBirdMark(r.g, floorAt, 2, 2, k);
  assert.ok(r.n() > 500, `${r.n()} pixels drawn`);
  for (const c of r.colours) if (c.startsWith('#')) assert.ok(!isCyan(c), `the shots draw cyan, ${c}`);
  assert.ok([...r.colours].some((c) => FLAME.includes(c)), 'the enemy\'s pink in its birds and marks');
  assert.ok([...r.colours].some((c) => c === '#ffc860' || c === '#ff8a2a'), 'an honest fire\'s orange as a page burns');
  void NAMES;
});
