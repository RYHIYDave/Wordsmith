// FLOOR 13'S MEDIUM MOB, THE SILENT ORDER'S CARTERS (src/art/carters.ts, their look; src/art/carters_moves.ts, their
// moves). A MOCK-UP: NOT IN THE GAME, behind CARTERS_ON, off. Their brief is this chat's, on his word of 18 Oct (“Hey go
// without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”), sent
// him with their films. Held as floor 12's dredgers are (tests/dredgers.test.ts):
//   1. the switch is off by itself, and of the game only their figure imports them (in the game with the Hush, ACT2);
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from
//      behind, and every handover: nothing through them, the whip too; feet that grip; nothing in the floor; nothing
//      jerky; the crack drawn back, held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while they live and none as they
//      die, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare, the lash too;
//   5. NOTHING OF THEM IN THE FLOOR, beyond what the checks see: all they wear and carry, the lash on the ground too;
//   6. THE CRACK: pink sparks at the lash's end as it cracks, the lash then at full reach before them; none else;
//   7. the dull pink in their eyes while they live, gone out once they are down; and down they lie, low on the floor;
//   8. what falls from them as they die, the hat and the whip, lies clear of them once they are down;
//   9. THE DRIVER'S LASH, their second blow (his rule of 9 Oct, a medium monster two attacks): the lash whirled round
//      over their head through its warning; three cracks, each on the floor further out before them in a line, pink
//      sparks at each and nowhere else; its warning rings and its cracks' marks (carter_shots.ts) drawn only in their
//      time, where the cracks fall, nothing cyan.
//   run: tsx --test tests/carters.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { CARTER_CANVAS, CARTERS_ON, WHIP } from '../src/art/carters';
import { CARTER, CT_DIES, CT_LASHES, CT_SHAPE, CT_WHIP } from '../src/art/carters_moves';
import { LASH_CRACK_FOR, LASH_MARK_R, drawLashCrack, drawLashesWarn, lashSpots } from '../src/art/carter_shots';
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
const ALL: Mob[] = [CARTER];
for (const mob of ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (_mob: Mob, move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

// (IN THE GAME WITH THE HUSH, ACT 2 (game/act1.ts ACT2, off until his yes), since the planning chat's helper built floor 13's
// kinds, 19 Oct 2026: through art/act1_figs/carter.ts alone, their pictures as the game holds a monster; its switch goes on
// with the descent's figures there, art/bestiary.ts useAct1Figs; until then a mock-up nothing of the game imported, its
// switch off. Off by itself here, where nothing of the game is loaded.)
test('1. the switch is off by itself, and of the game only their figure imports them', () => {
  assert.equal(CARTERS_ON.on, false, 'CARTERS_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(carters(_moves)?|carter_shots)\.ts$/.test(f)) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (/^art\/carters(_moves)?$/.test(parts.join('/'))) users.push(f);
    }
  }
  assert.equal([...new Set(users)].join(' '), 'art/act1_figs/carter.ts', 'game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover, both of them', () => {
  for (const mob of ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,lashes');
    const found = checkBoss(mob, CT_SHAPE);
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
    assert.equal(`${w}x${h}`, `${CARTER_CANVAS.w}x${CARTER_CANVAS.h}`);
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
        const bits: Bit[] = mob.bits(st, at(mob, move, t)).filter((b) => !(move === 'dying' && ((b.piece === 'whip' && t >= CT_DIES.drop) || (b.piece === 'hat' && t >= CT_DIES.hat))));
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

test('6. THE CRACK: pink sparks at the lash\'s end as it cracks, the lash then at full reach before them; none else', () => {
  const mob = CARTER;
  const st = stageOf(mob);
  const sparks = (move: string, t: number): number => grainsAt(mob, st, at(mob, move, t)).filter(([, c]) => FLAME.includes(c)).length;
  assert.ok(sparks('attack', CT_WHIP.hit) > 8, `sparks at the crack: ${sparks('attack', CT_WHIP.hit)}`);
  const cracking = (move: string, t: number): boolean => (move === 'attack' ? [CT_WHIP.hit] : move === 'lashes' ? [...CT_LASHES.cracks] : []).some((c) => t >= c - 0.05 && t <= c + 0.25);
  for (const move of LIVING(mob)) for (const t of framesOf(mob, move)) if (!cracking(move, t)) assert.equal(sparks(move, t), 0, `${move} @${t.toFixed(2)}: sparks`);
  // (at the crack, its lash before them at near its whole reach: the cracker this far out from where they stand)
  const tip = CT_SHAPE.tip?.('attack', CT_WHIP.hit, (st && at(mob, 'attack', CT_WHIP.hit)).s, at(mob, 'attack', CT_WHIP.hit).q) as V3;
  assert.ok(tip[0] > 0.8 * WHIP.lash, `the cracker ${tip[0].toFixed(1)} before them at the crack`);
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
    for (let t = CT_DIES.sit; t <= CT_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.name} @${t.toFixed(2)}: the pink still in the eyes`);
    // (how high the top of them is over the ground: standing, and lying on their back)
    const top = (bits: Bit[]): number => Math.max(...bits.filter((b) => b.piece !== 'hat' && b.piece !== 'whip').map((b) => {
      const sh = b.shape;
      if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
      if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
      return -Infinity;
    }));
    const up = top(mob.bits(st, at(mob, 'stand', 0)));
    const down = top(mob.bits(st, dyingMoment(mob, CT_DIES.long)));
    assert.ok(down < 0.4 * up, `${mob.name}: its top ${down.toFixed(1)} over the ground lying down, ${up.toFixed(1)} standing`);
  }
});

test('8. what falls from them as they die, the hat and the whip, lies clear of them once they are down, from in front and from behind', () => {
  const fallen = new Set(['hat', 'whip']);
  for (const mob of ALL) {
    // (them alone: what falls from them sent far off their picture; and what falls alone)
    const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const pieces: Mob = { ...mob, bits: (st, m) => mob.bits(st, m).filter((b) => fallen.has(b.piece)) };
    const down = (CT_DIES.down + 0.2) / mob.dieTime;
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
        assert.ok(mine > 800 && theirs > 150, `${mob.name} ${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of what fell`);
        assert.equal(both, 0, `${mob.name} ${view} @${k.toFixed(2)}: what fell from him lies over him or under him by ${both} pixels`);
      }
    }
  }
});

test('9. THE DRIVER\'S LASH: whirled round over their head through its warning; three cracks on the floor, each further out before them in a line, pink sparks at each; its warning rings and its cracks\' marks drawn only in their time, where the cracks fall, nothing cyan', () => {
  const mob = CARTER;
  const st = stageOf(mob);
  const TILE = 32 / Math.sqrt(2 / 3);
  const tipAt = (t: number): V3 => CT_SHAPE.tip?.('lashes', t, at(mob, 'lashes', t).s, at(mob, 'lashes', t).q) as V3;
  // (through the warning, the cracker high over their heads and going round)
  let turned = 0;
  let was: number | null = null;
  for (let t = CT_LASHES.warn[0]; t <= CT_LASHES.warn[1] + 1e-9; t += 1 / 30) {
    const p = tipAt(t);
    const s = at(mob, 'lashes', t).s;
    assert.ok(p[2] > s.head[2], `@${t.toFixed(2)}: the cracker below their head as it whirls`);
    const a = Math.atan2(p[1] - s.handR[1], p[0] - s.handR[0]);
    if (was !== null) turned += Math.abs(((a - was + 3 * Math.PI) % (2 * Math.PI)) - Math.PI);
    was = a;
  }
  assert.ok(turned > 1.3 * Math.PI, `whirled ${((turned * 180) / Math.PI).toFixed(0)} degrees round through the warning`);
  // (each crack on the floor, further out than the last, about where its reach says, in a line before them)
  let last = 0;
  CT_LASHES.cracks.forEach((c, i) => {
    const p = tipAt(c + 1 / 30);
    assert.ok(p[2] < 4, `crack ${i + 1}: the cracker ${p[2].toFixed(1)} off the floor`);
    assert.ok(Math.abs(p[0] / TILE - CT_LASHES.reach[i]) < 0.15, `crack ${i + 1}: ${(p[0] / TILE).toFixed(2)} tiles out, its reach ${CT_LASHES.reach[i]}`);
    assert.ok(Math.abs(p[1]) < 0.25 * TILE, `crack ${i + 1}: ${(p[1] / TILE).toFixed(2)} tiles to the side`);
    assert.ok(p[0] > last, `crack ${i + 1} no further out than the last`);
    last = p[0];
  });
  const sparks = (t: number): number => grainsAt(mob, st, at(mob, 'lashes', t)).filter(([, c]) => FLAME.includes(c)).length;
  for (const c of CT_LASHES.cracks) assert.ok(sparks(c) > 8, `sparks at the crack at ${c.toFixed(2)}: ${sparks(c)}`);
  // its marks on the floor (carter_shots.ts)
  const dots: { x: number; y: number; c: string }[] = [];
  const pen = { globalAlpha: 1, fillStyle: '' };
  const g = { ...pen, fillRect(x: number, y: number) { dots.push({ x, y, c: (g as unknown as typeof pen).fillStyle }); } } as unknown as CanvasRenderingContext2D;
  const atF = (x: number, y: number): [number, number] => [200 + (x - y) * 16, 120 + (x + y) * 8];
  const spots = lashSpots(0, 0, 1, 0).map(([x, y]) => atF(x, y));
  const near = (d: { x: number; y: number }, r: number): boolean => spots.some(([x, y]) => Math.abs(d.x - x) <= r * 32 + 2 && Math.abs(d.y - y) <= r * 16 + 2);
  for (let i = 1; i <= 20; i++) {
    dots.length = 0;
    drawLashesWarn(g, atF, 0, 0, 1, 0, i / 20);
    if (i >= 4) assert.ok(dots.length > 0, `warning @${(i / 20).toFixed(2)}: nothing drawn`);
    for (const d of dots) {
      assert.ok(!isCyan(d.c), `the warning in cyan, ${d.c}`);
      assert.ok(near(d, LASH_MARK_R + 0.05), `warning @${(i / 20).toFixed(2)}: drawn at (${d.x - 200}, ${d.y - 120}), off its rings`);
    }
  }
  for (let t = 0; t < LASH_CRACK_FOR; t += 1 / 30) {
    dots.length = 0;
    drawLashCrack(g, atF, CT_LASHES.reach[0], 0, t);
    assert.ok(dots.length > 0, `@${t.toFixed(2)}: nothing drawn`);
    for (const d of dots) {
      assert.ok(!isCyan(d.c), `the crack in cyan, ${d.c}`);
      assert.ok(Math.abs(d.x - spots[0][0]) <= LASH_MARK_R * 32 + 2 && d.y <= spots[0][1] + LASH_MARK_R * 16 + 2 && d.y >= spots[0][1] - LASH_MARK_R * 16 - 28, `@${t.toFixed(2)}: drawn at (${d.x - spots[0][0]}, ${d.y - spots[0][1]}) from where it cracked`);
    }
  }
  dots.length = 0;
  drawLashCrack(g, atF, 0, 0, LASH_CRACK_FOR + 0.01);
  drawLashCrack(g, atF, 0, 0, -0.01);
  drawLashesWarn(g, atF, 0, 0, 1, 0, 0);
  assert.equal(dots.length, 0, 'drawn outside its time');
});
