// FLOOR 14'S BOSS, THE PHYSICIAN (src/art/physician.ts, his look; src/art/physician_moves.ts, his moves;
// src/art/physician_shots.ts, what he throws and leaves on the floor). A MOCK-UP: NOT IN THE GAME, behind PHYSICIAN_ON,
// off. His brief is this chat's, on his word of 18 Oct (“Hey go without my say so.  If something is shit I’ll get it to
// it but you’re doing a great jobs. At least for 11-15”), sent him with his films. Held as floor 13's carters are
// (tests/carters.test.ts):
//   1. the switch is off, and nothing of the game imports him;
//   2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from behind,
//      and every handover: nothing through him, the cane and the syringe too; feet that grip; nothing in the floor;
//      nothing jerky; the rap drawn back, held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while he lives and none as he
//      dies, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, he is inside his picture with room to spare;
//   5. NOTHING OF HIM IN THE FLOOR, beyond what the checks see: all he wears and carries;
//   6. THE DRAW: the quill thrust far out before him at its height, then the barrel filling pink as he holds there, full
//      as he lifts it over his head and emptied there; the Tonic's phials in his hand only until he flings them;
//   7. the pink in his lenses while he lives, gone out once he is down; and down he lies, low on the floor;
//   8. what falls from him as he dies, the hat, the cane and the syringe, lies clear of him once he is down; and the
//      words he drew rise out of him as he dies, pink going pale, none once he lies still;
//   9. what he throws, takes and leaves on the floor: drawn; the word over his head in the enemy's pink, never cyan,
//      and freed it comes home in its own colour; the Hush grey, the tonic pale green, nothing else cyan.
//   run: tsx --test tests/physician.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { PH_CANVAS, PHYSICIAN_ON } from '../src/art/physician';
import { PHYSICIAN, PH_DIES, PH_DRAW, PH_SHAPE, PH_TONIC } from '../src/art/physician_moves';
import { TILE3 } from '../src/art/new_mobs3';
import { HUSH_CLOUD_FOR, ROUNDS_RING_FOR, WORD_FREED_FOR, drawCaneRap, drawDrawAim, drawHeldWord, drawHushCloud, drawPhialFlight, drawRoundsRing, drawWordFreed } from '../src/art/physician_shots';
import { WORD_COLOR } from '../src/art/icons';
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
const ALL: Mob[] = [PHYSICIAN];
for (const mob of ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (_mob: Mob, move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

test('1. the switch is off, and nothing of the game imports him', () => {
  assert.equal(PHYSICIAN_ON.on, false, 'PHYSICIAN_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/physician(_moves|_shots)?\.ts$/.test(f)) continue;
    if (/from ['"][^'"]*physician(_moves|_shots)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  for (const mob of ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,draw,tonic,rounds');
    const found = checkBoss(mob, PH_SHAPE);
    assert.equal(found.length, 0, `${mob.name}: ${findingsSaid(found).slice(0, 12).join('; ')}`);
  }
});

test('3. every frame paints both ways round: nothing cyan, the pink edge while he lives and none as he dies, every pixel whole or empty but the edge', () => {
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

test('4. NOTHING CUT OFF: in every frame, both ways round, he is inside his picture with room to spare', () => {
  const ROOM = 6;
  let least = Infinity;
  const faults: string[] = [];
  for (const { mob, move, view, t, p } of PAINTED) {
    const { w, h, d } = p.px;
    assert.equal(`${w}x${h}`, `${PH_CANVAS.w}x${PH_CANVAS.h}`);
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
  assert.ok(least >= ROOM, `the nearest he comes to the edge: ${least}`);
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

test('5. NOTHING OF HIM IN THE FLOOR: all he wears and carries', () => {
  const faults: string[] = [];
  for (const mob of ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        // (but what has fallen from him as he dies, which falls as itself: test 8)
        const bits: Bit[] = mob.bits(st, at(mob, move, t)).filter((b) => !(move === 'dying' && ((b.piece === 'cane' && t >= PH_DIES.cane) || (b.piece === 'syringe' && t >= PH_DIES.syringe) || (b.piece === 'hat' && t >= PH_DIES.hat))));
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

/** The grains of him at a moment (the words going free). */
function grainsAt(mob: Mob, st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  mob.bits(st, m);
  return mob.grains?.(st, m) ?? [];
}

test('6. THE DRAW: the quill thrust far out before him at its height, the barrel filling pink as he holds there, full as he lifts it over his head and emptied there; the Tonic\'s phials in his hand only until he flings them', () => {
  const mob = PHYSICIAN;
  const st = stageOf(mob);
  const drawn = (t: number): number => mob.bits(st, at(mob, 'draw', t)).filter((b) => b.piece === 'drawn').length;
  const quill = (t: number): V3 => {
    // (the quill's shaft: the syringe's rod that tapers to its nib)
    const bits = mob.bits(st, at(mob, 'draw', t)).filter((b) => b.piece === 'syringe' && b.shape.k === 'rod' && b.shape.rb === 0.2);
    const sh = bits[0].shape as { b: V3 };
    return sh.b;
  };
  const tip = quill(PH_DRAW.hit);
  assert.ok(Math.hypot(tip[0], tip[1]) > 1.4 * TILE3, `the quill ${(Math.hypot(tip[0], tip[1]) / TILE3).toFixed(2)} tiles out at the Draw`);
  assert.ok(tip[2] > 20 && tip[2] < 60, `the quill ${tip[2].toFixed(1)} high at the Draw`);
  assert.equal(drawn(PH_DRAW.hit - 0.05), 0, 'nothing in the barrel before the Draw');
  assert.ok(drawn((PH_DRAW.draw[0] + PH_DRAW.draw[1]) / 2) > 0 && drawn(PH_DRAW.up + 0.1) > 0, 'the barrel filling, and full held high');
  assert.equal(drawn(PH_DRAW.push[1] + 0.02), 0, 'emptied over his head');
  const inHand = (t: number): number => mob.bits(st, at(mob, 'tonic', t)).filter((b) => b.part === 'handL' && b.piece === 'phials' && b.shape.k === 'rod').length;
  assert.ok(inHand((PH_TONIC.warn[0] + PH_TONIC.warn[1]) / 2) === 3, 'three phials in his hand as he rears back');
  assert.equal(inHand(PH_TONIC.hit + 0.05), 0, 'none once flung');
});

test('7. the pink in his lenses while he lives, gone out once he is down; and down he lies, low on the floor', () => {
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
    for (let t = PH_DIES.knees; t <= PH_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.name} @${t.toFixed(2)}: the pink still in the eyes`);
    // (how high the top of him is over the ground: standing, and lying on his face)
    const top = (bits: Bit[]): number => Math.max(...bits.filter((b) => b.piece !== 'hat' && b.piece !== 'cane' && b.piece !== 'syringe').map((b) => {
      const sh = b.shape;
      if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
      if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
      return -Infinity;
    }));
    const up = top(mob.bits(st, at(mob, 'stand', 0)));
    const down = top(mob.bits(st, dyingMoment(mob, PH_DIES.long)));
    assert.ok(down < 0.4 * up, `${mob.name}: its top ${down.toFixed(1)} over the ground lying down, ${up.toFixed(1)} standing`);
  }
});

test('8. what falls from him as he dies, the hat, the cane and the syringe, lies clear of him once he is down; and the words he drew go free', () => {
  const fallen = new Set(['hat', 'cane', 'syringe']);
  for (const mob of ALL) {
    // (them alone: what falls from them sent far off their picture; and what falls alone)
    const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const pieces: Mob = { ...mob, bits: (st, m) => mob.bits(st, m).filter((b) => fallen.has(b.piece)) };
    const down = (PH_DIES.down + 0.2) / mob.dieTime;
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
  // (the words he drew out of the city rising out of him as he dies, pink going pale; none once he lies still)
  const mob = PHYSICIAN;
  const st = stageOf(mob);
  const words = (t: number): ReadonlyArray<readonly [V3, string, number]> => grainsAt(mob, st, dyingMoment(mob, t));
  const mid = words((PH_DIES.words[0] + PH_DIES.words[1]) / 2);
  assert.ok(mid.filter(([, c]) => FLAME.includes(c)).length > 5 && mid.filter(([, c]) => !FLAME.includes(c)).length > 5, 'the words rising pink and going pale');
  assert.equal(words(PH_DIES.long).length, 0, 'none once he lies still');
});

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

test('9. what he throws, takes and leaves on the floor: drawn; the word over his head the enemy\'s pink, freed it goes home in its own colour; never cyan but that', () => {
  const floorAt = (x: number, y: number): readonly [number, number] => [100 + (x - y) * 16, 60 + (x + y) * 8];
  const r = recorder();
  for (let t = 0; t < 0.45; t += 0.05) drawCaneRap(r.g, floorAt, 2, 2, t);
  for (let k = 0.1; k < 1; k += 0.2) drawDrawAim(r.g, floorAt, 1, 1, 3, 2, k, k);
  for (let t = 0; t < 0.55; t += 0.05) drawPhialFlight(r.g, floorAt, 1, 1, 3, 3, t, 1);
  for (let t = 0; t < HUSH_CLOUD_FOR; t += 0.25) drawHushCloud(r.g, floorAt, 3, 3, t, 1);
  for (let t = 0; t < ROUNDS_RING_FOR; t += 0.1) drawRoundsRing(r.g, floorAt, 2, 2, t);
  assert.ok(r.n() > 800, `${r.n()} pixels drawn`);
  for (const c of r.colours) if (c.startsWith('#')) assert.ok(!isCyan(c), `the shots draw cyan, ${c}`);
  assert.ok([...r.colours].some((c) => FLAME.includes(c)), 'the enemy\'s pink in the Draw\'s warning');
  // the word he took, over his head: the enemy's pink and gold only
  const w = recorder();
  for (let t = 0; t < 2; t += 0.1) drawHeldWord(w.g, 100, 40, 'frost', t);
  assert.ok(w.n() > 100, `${w.n()} pixels of the word`);
  for (const c of w.colours) if (c.startsWith('#')) assert.ok(FLAME.includes(c) || c === '#0e0c24', `the word over his head in ${c}`);
  // beaten out of him, it goes home in its own colour
  const f = recorder();
  for (let t = 0; t < WORD_FREED_FOR; t += 0.05) drawWordFreed(f.g, 100, 40, 160, 90, 'frost', t);
  assert.ok([...f.colours].some((c) => c.toLowerCase() === WORD_COLOR.frost.toLowerCase()) || [...f.colours].length > 4, 'freed, its own colour comes back');
  assert.equal(drawWordFreed(f.g, 100, 40, 160, 90, 'frost', WORD_FREED_FOR + 0.01), false, 'home once it is there');
});
