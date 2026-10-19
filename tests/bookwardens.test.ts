// FLOOR 15'S MEDIUM MOB, THE BOOKWARDENS (src/art/bookwardens.ts, their look; src/art/bookwardens_moves.ts, their moves;
// src/art/bookwarden_shots.ts, their tome's mark on the floor). A MOCK-UP: NOT IN THE GAME, behind BOOKWARDENS_ON, off.
// Their brief is this chat's, on his word of 18 Oct (“Hey go without my say so.  If something is shit I’ll get it to it
// but you’re doing a great jobs. At least for 11-15”), sent him with their films. Held as floor 14's orderlies are
// (tests/orderlies.test.ts):
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from
//      behind, and every handover: nothing through them, the haft, the chain and the tome too; feet that grip; nothing
//      in the floor; nothing jerky; the blow drawn back, held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while they live and none as they
//      die, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare, the tome
//      whirled over their head and crashed down far before them too, and they lying full length;
//   5. NOTHING OF THEM IN THE FLOOR, beyond what the checks see: all they wear and carry, the tome lying on the floor too;
//   6. THE BLOW: the tome whirled right round over their head through the warning, then crashed down flat on the floor
//      more than a tile and a half before them and held there; no grains in it; and its mark on the floor
//      (bookwarden_shots.ts) drawn only in its time, near where it struck, nothing cyan;
//   7. the dull pink in their eyes while they live, gone out once they are down; and down they lie, low on the floor,
//      full length before where they stood;
//   8. the haft that falls from them as they die lies clear of them once they are down;
//   9. THE TOME BURSTS: whole until the chain snaps, gone after; its pages fly up from where it burst, the enemy's pink
//      going pale, rising, and gone before they are down; nothing cyan.
//   run: tsx --test tests/bookwardens.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { BOOKWARDENS_ON, WB_CANVAS, bookCorners, tomeAt } from '../src/art/bookwardens';
import { BOOKWARDEN, WB_DIES, WB_SHAPE, WB_SLAM, tomeWayOf } from '../src/art/bookwardens_moves';
import { TOME_DUST_FOR, TOME_MARK_FOR, drawTomeSlam } from '../src/art/bookwarden_shots';
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
const ALL: Mob[] = [BOOKWARDEN];
for (const mob of ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (_mob: Mob, move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(BOOKWARDENS_ON.on, false, 'BOOKWARDENS_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(bookwardens(_moves)?|bookwarden_shots)\.ts$/.test(f)) continue;
    if (/from ['"][^'"]*(bookwardens(_moves)?|bookwarden_shots)['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  for (const mob of ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying');
    const found = checkBoss(mob, WB_SHAPE);
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
    assert.equal(`${w}x${h}`, `${WB_CANVAS.w}x${WB_CANVAS.h}`);
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
  if (sh.k === 'rod') {
    // (a rod is round about its own line: the lowest of it, at either end, is as far below that end as its line is from upright)
    const d = [sh.b[0] - sh.a[0], sh.b[1] - sh.a[1], sh.b[2] - sh.a[2]];
    const l = Math.hypot(d[0], d[1], d[2]) || 1;
    const flat = Math.sqrt(Math.max(0, 1 - (d[2] / l) ** 2));
    z = Math.min(sh.a[2] - sh.ra * flat, sh.b[2] - sh.rb * flat);
  } else if (sh.k === 'ball') z = sh.c[2] - Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
  else if (sh.k === 'band') z = sh.ring.c[2] - Math.hypot(sh.ring.u[2], sh.ring.v[2]);
  else if (sh.k === 'cloth') for (const r of sh.rings) z = Math.min(z, r.c[2] - Math.hypot(r.u[2], r.v[2]), ...(r.pts ?? []).map((p: V3) => p[2]));
  else if (sh.k === 'panel') z = sh.c[2] - Math.abs(sh.u[2]) - Math.abs(sh.v[2]);
  return Math.max(0, -z);
}

test('5. NOTHING OF THEM IN THE FLOOR: all they wear and carry, the tome lying on the floor too', () => {
  const faults: string[] = [];
  for (const mob of ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        // (but what has fallen from them as they die, which falls as itself: test 8)
        const bits: Bit[] = mob.bits(st, at(mob, move, t)).filter((b) => !(move === 'dying' && b.piece === 'flail' && t >= WB_DIES.drop));
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

/** The grains of them at a moment (sparks, dust). */
function grainsAt(mob: Mob, st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  mob.bits(st, m);
  return mob.grains?.(st, m) ?? [];
}

test('6. THE BLOW: the tome whirled round over their head, then crashed down flat on the floor well out before them; no grains; its mark on the floor only in its time, nothing cyan', () => {
  const mob = BOOKWARDEN;
  const st = stageOf(mob);
  const TILE = 32 / Math.sqrt(2 / 3);
  const tomeOf = (t: number) => tomeAt(at(mob, 'attack', t).s, tomeWayOf('attack', t));
  // (through the warning: over their head, and right round)
  let turned = 0;
  let was: number | null = null;
  for (let t = WB_SLAM.warn[0]; t <= WB_SLAM.warn[1] + 1e-9; t += 1 / 30) {
    const k = tomeOf(t);
    const s = at(mob, 'attack', t).s;
    assert.ok(Math.min(...bookCorners(k).map((p) => p[2])) > s.head[2], `@${t.toFixed(2)}: the tome below their head`);
    const a = Math.atan2(k.mid[1] - k.end[1], k.mid[0] - k.end[0]);
    if (was !== null) turned += Math.abs(((a - was + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
    was = a;
  }
  assert.ok(turned > 1.6 * Math.PI, `whirled ${((turned * 180) / Math.PI).toFixed(0)} degrees round through the warning`);
  // (on the floor: flat on its cover, more than a tile and a half out before them, and held there a while)
  for (const t of [WB_SLAM.floor, (WB_SLAM.floor + WB_SLAM.held) / 2]) {
    const k = tomeOf(t);
    const zs = bookCorners(k).map((p) => p[2]);
    assert.ok(Math.min(...zs) > -0.6 && Math.min(...zs) < 1.6, `@${t.toFixed(2)}: the tome's lowest corner ${Math.min(...zs).toFixed(2)} off the floor`);
    assert.ok(Math.abs(k.frame[2][2]) > 0.97, `@${t.toFixed(2)}: the tome not lying flat (${k.frame[2][2].toFixed(2)})`);
    assert.ok(k.mid[0] > 1.5 * TILE, `@${t.toFixed(2)}: the tome ${(k.mid[0] / TILE).toFixed(2)} tiles before them`);
  }
  // (no grains of theirs while they live: the dust is the floor's mark)
  for (const move of LIVING(mob)) for (const t of framesOf(mob, move)) assert.equal(grainsAt(mob, st, at(mob, move, t)).length, 0, `${move} @${t.toFixed(2)}: grains`);
  // its mark on the floor (bookwarden_shots.ts): drawn only in its time, nothing cyan, within a tile and a half of where it struck
  const dots: { x: number; y: number; c: string }[] = [];
  const pen = { globalAlpha: 1, fillStyle: '' };
  const g = { ...pen, fillRect(x: number, y: number) { dots.push({ x, y, c: (g as unknown as typeof pen).fillStyle }); } } as unknown as CanvasRenderingContext2D;
  const atF = (x: number, y: number): [number, number] => [200 + (x - y) * 16, 120 + (x + y) * 8];
  for (const [fx, fy] of [[1, 0], [0, 1], [-1, 0.5]]) {
    for (let t = 0; t < TOME_MARK_FOR; t += 1 / 30) {
      dots.length = 0;
      drawTomeSlam(g, atF, 0, 0, fx, fy, t);
      assert.ok(dots.length > 0, `@${t.toFixed(2)}: nothing drawn`);
      for (const d of dots) {
        assert.ok(!isCyan(d.c), `the mark in cyan, ${d.c}`);
        // (within a tile and a half of where it struck across the picture, and no lower; what is thrown up, up the picture)
        assert.ok(Math.abs(d.x - 200) <= 1.5 * 32 && d.y <= 120 + 1.5 * 16 && d.y >= 120 - 1.5 * 16 - 28, `@${t.toFixed(2)}: drawn at (${d.x - 200}, ${d.y - 120}) from where it struck`);
      }
    }
  }
  dots.length = 0;
  drawTomeSlam(g, atF, 0, 0, 1, 0, Math.max(TOME_DUST_FOR, TOME_MARK_FOR) + 0.01);
  drawTomeSlam(g, atF, 0, 0, 1, 0, -0.01);
  assert.equal(dots.length, 0, 'the mark drawn outside its time');
});

test('7. the dull pink in their eyes while they live, gone out once they are down; and down they lie, low on the floor, full length', () => {
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
    for (let t = WB_DIES.down; t <= WB_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.name} @${t.toFixed(2)}: the pink still in the eyes`);
    // (how high the top of them is over the ground: standing, and lying on their face)
    const top = (bits: Bit[]): number => Math.max(...bits.filter((b) => b.piece !== 'flail').map((b) => {
      const sh = b.shape;
      if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
      if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
      return -Infinity;
    }));
    const up = top(mob.bits(st, at(mob, 'stand', 0)));
    const down = top(mob.bits(st, dyingMoment(mob, WB_DIES.long)));
    assert.ok(down < 0.4 * up, `${mob.name}: its top ${down.toFixed(1)} over the ground lying down, ${up.toFixed(1)} standing`);
    // (full length before where they stood: the head well out before the feet)
    const s = dyingMoment(mob, WB_DIES.long).s;
    assert.ok(s.head[0] - Math.max(s.toeL[0], s.toeR[0]) > 0.8 * mob.build.tall, `${mob.name}: lying ${(s.head[0] - Math.max(s.toeL[0], s.toeR[0])).toFixed(1)} long before the feet`);
  }
});

test('8. the haft that falls from them as they die lies clear of them once they are down, from in front and from behind', () => {
  const fallen = new Set(['flail']);
  for (const mob of ALL) {
    // (them alone: what falls from them sent far off their picture; and what falls alone)
    const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const pieces: Mob = { ...mob, bits: (st, m) => mob.bits(st, m).filter((b) => fallen.has(b.piece)) };
    const down = (WB_DIES.down + 0.2) / mob.dieTime;
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
        assert.ok(mine > 800 && theirs > 30, `${mob.name} ${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of what fell`);
        assert.equal(both, 0, `${mob.name} ${view} @${k.toFixed(2)}: what fell from him lies over him or under him by ${both} pixels`);
      }
    }
  }
});

test('9. THE TOME BURSTS: whole until the chain snaps, gone after; its pages fly up from where it burst, pink going pale, gone before they are down; nothing cyan', () => {
  const mob = BOOKWARDEN;
  const st = stageOf(mob);
  const book = (t: number): number => mob.bits(st, dyingMoment(mob, t)).filter((b) => b.piece === 'tome').length;
  for (let t = 0; t < WB_DIES.burst - 1e-6; t += 1 / 30) assert.ok(book(t) > 0, `@${t.toFixed(2)}: the tome gone before the chain snaps`);
  for (let t = WB_DIES.burst; t <= WB_DIES.long + 1e-9; t += 1 / 30) assert.equal(book(t), 0, `@${t.toFixed(2)}: the tome still whole`);
  const from = tomeAt(dyingMoment(mob, WB_DIES.burst - 1 / 60).s, tomeWayOf('dying', WB_DIES.burst - 1 / 60)).mid;
  let pinkEarly = 0;
  let paleLate = 0;
  for (let t = 0; t <= WB_DIES.long + 1e-9; t += 1 / 30) {
    const gr = grainsAt(mob, st, dyingMoment(mob, t));
    const live = t >= WB_DIES.pages[0] && t <= WB_DIES.pages[1];
    if (!live) assert.equal(gr.length, 0, `@${t.toFixed(2)}: pages outside their time`);
    if (live && t < WB_DIES.pages[1] - 0.2) assert.ok(gr.length > 0, `@${t.toFixed(2)}: no pages flying`);
    for (const [p, c] of gr) {
      assert.ok(!isCyan(c), `a page in cyan, ${c}`);
      assert.ok(p[2] > from[2] - 12 && Math.hypot(p[0] - from[0], p[1] - from[1]) < 30, `@${t.toFixed(2)}: a page at ${p.map((v) => v.toFixed(0)).join(',')} from where it burst`);
      if (t < WB_DIES.burst + 0.2 && FLAME.includes(c)) pinkEarly++;
      if (t > WB_DIES.pages[1] - 0.4 && !FLAME.includes(c)) paleLate++;
    }
  }
  assert.ok(pinkEarly > 5 && paleLate > 20, `pink early ${pinkEarly}, pale late ${paleLate}`);
  // (gone before they are down and still: so nothing of them lies over what fell)
  assert.ok(WB_DIES.pages[1] < WB_DIES.down + 0.2, 'the pages still flying once they are down');
});
