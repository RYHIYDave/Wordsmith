// FLOOR 11'S RANGED MOB, THE SILENT ORDER'S SCRIBES (src/art/scribes.ts, their look; src/art/scribes_moves.ts, their
// moves; src/art/scribe_shots.ts, what their ink does to the floor). A MOCK-UP: NOT IN THE GAME, behind SCRIBES_ON,
// off. The owner's pick in the art chat, 18 Oct 2026: of floor 11's monsters, “Silent Order scribes”; and then, “Hey
// go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15”: so
// their brief is this chat's, sent him with their films. So:
//   1. the switch is off, and nothing of the game imports them;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from
//      behind, and every handover: nothing through them, the quill too; feet that grip; nothing in the floor;
//      nothing jerky; the blow drawn back, held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while they live and none as
//      they die, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare;
//   5. NOTHING OF THEM IN THE FLOOR, beyond what the checks see: all they wear and carry, and the pages that fly;
//   6. THE WARNING: the nib glows the enemy's pink as the quill is drawn back, and only then;
//   7. the blank mask, the dull pink in its slits, while they live; split and fallen once they die, the pink with
//      it; the pages flying from the ledger; and down they lie, low on the floor;
//   8. what falls from them as they die, the mask's two halves and the quill, lies clear of them once they are down;
//   9. what their ink does to the floor is black and the enemy's pink, never cyan, and only while it lasts.
//   run: tsx --test tests/scribes.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { SCRIBE_CANVAS, SCRIBES_ON } from '../src/art/scribes';
import { SCRIBES_ALL, SC_DIES, SC_FLICK, SC_SHAPE } from '../src/art/scribes_moves';
import { INK_FLIGHT, INK_POOL_FOR, drawInkFlight, drawInkMark, drawInkSplat } from '../src/art/scribe_shots';
import type { FloorAt } from '../src/art/mob_shots';
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
for (const mob of SCRIBES_ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (mob: Mob, move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

test('1. the switch is off, and nothing of the game imports them', () => {
  assert.equal(SCRIBES_ON.on, false, 'SCRIBES_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(scribes(_moves)?|scribe_shots)\.ts$/.test(f)) continue;
    if (/from ['"][^'"]*(scribes(_moves)?|scribe_shots)['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  for (const mob of SCRIBES_ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying');
    const found = checkBoss(mob, SC_SHAPE);
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
    assert.equal(`${w}x${h}`, `${SCRIBE_CANVAS.w}x${SCRIBE_CANVAS.h}`);
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

test('5. NOTHING OF THEM IN THE FLOOR: all they wear and carry, and the pages that fly', () => {
  const faults: string[] = [];
  for (const mob of SCRIBES_ALL) {
    const st = stageOf(mob);
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) {
        // (but what has fallen from them as they die, which falls as itself: test 8)
        const bits: Bit[] = mob.bits(st, at(mob, move, t)).filter((b) => !(move === 'dying' && (((b.piece === 'maskL' || b.piece === 'maskR') && t >= SC_DIES.mask) || (b.piece === 'quill' && t >= SC_DIES.quill))));
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

test('6. THE WARNING: the nib glows the enemy\'s pink as the quill is drawn back, and only then', () => {
  for (const mob of SCRIBES_ALL) {
    const st = stageOf(mob);
    const glows = (move: string, t: number): { c: string }[] => mob.bits(st, at(mob, move, t)).filter((b) => b.shape.k === 'glow').map((b) => b.shape as { c: string });
    for (let t = SC_FLICK.warn[0]; t <= SC_FLICK.warn[1]; t += 0.02) {
      const g = glows('attack', t);
      assert.ok(g.length > 0, `@${t.toFixed(2)}: the nib does not glow`);
      for (const { c } of g) assert.ok(c === FLAME[1] || c === FLAME[2], `@${t.toFixed(2)}: the nib glows ${c}`);
    }
    for (const move of ['stand', 'walk', 'reel']) for (const t of framesOf(mob, move)) assert.equal(glows(move, t).length, 0, `${move} @${t.toFixed(2)}: something glows`);
    for (const t of framesOf(mob, 'attack')) if (t > SC_FLICK.hit + 0.1) assert.equal(glows('attack', t).length, 0, `attack @${t.toFixed(2)}: the nib still glows`);
  }
});

test('7. the blank mask and the pink in its slits while they live; split and fallen as they die; the pages flying; and down they lie', () => {
  const pinkEyes = (bits: Bit[]): boolean => bits.some((b) => b.piece === 'eyes' && b.shape.k === 'dot' && b.shape.c === FLAME[1]);
  const masks = (bits: Bit[]): number => bits.filter((b) => b.piece === 'maskL' || b.piece === 'maskR').length;
  const pages = (bits: Bit[]): number => bits.filter((b) => b.piece === 'pages').length;
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
  for (const mob of SCRIBES_ALL) {
    const st = stageOf(mob);
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const bits = mob.bits(st, at(mob, move, t));
        assert.ok(pinkEyes(bits), `${move} @${t.toFixed(2)}: no pink in the eyes`);
        assert.equal(masks(bits), 2, `${move} @${t.toFixed(2)}: the mask is not whole`);
        assert.equal(pages(bits), 0, `${move} @${t.toFixed(2)}: pages flying`);
      }
    }
    for (let t = SC_DIES.crack[1]; t <= SC_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `@${t.toFixed(2)}: the pink still in the eyes`);
    let most = 0;
    for (let t = 0.35; t <= 1.4; t += 0.05) most = Math.max(most, pages(mob.bits(st, dyingMoment(mob, t))));
    assert.ok(most >= 10, `the pages that fly as they die: ${most}`);
    // (them alone, what falls from them sent far off their picture)
    const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    for (const view of VIEWS) {
      const up = height(paintMob(mob, 'stand', 0, view));
      const down = height(deathOfMob(him, 1, view));
      assert.ok(down < 0.75 * up, `${view}: ${down} pixels tall lying down, ${up} standing`);
    }
  }
});

test('8. what falls from them as they die, the mask\'s two halves and the quill, lies clear of them once they are down, from in front and from behind', () => {
  const fallen = new Set(['maskL', 'maskR', 'quill']);
  for (const mob of SCRIBES_ALL) {
    // (him alone, without the loose pages flying over and round him)
    const him: Mob = { ...mob, bits: (st, m) => mob.bits(st, m).filter((b) => b.piece !== 'pages'), fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const pieces: Mob = { ...mob, bits: (st, m) => mob.bits(st, m).filter((b) => fallen.has(b.piece)) };
    const down = (SC_DIES.down + 0.2) / mob.dieTime;
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
        assert.ok(mine > 600 && theirs > 40, `${view} @${k.toFixed(2)}: ${mine} pixels of him, ${theirs} of what fell`);
        assert.equal(both, 0, `${view} @${k.toFixed(2)}: what fell from him lies over him or under him by ${both} pixels`);
      }
    }
  }
});

test('9. what their ink does to the floor is black and the enemy\'s pink, never cyan, and only while it lasts', () => {
  const drawn: string[] = [];
  const c: { fillStyle: string; globalAlpha: number; fillRect(): void } = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect(): void {
      drawn.push(c.fillStyle);
    },
  };
  const g = c as unknown as CanvasRenderingContext2D;
  const ISO: FloorAt = (x, y) => [(x - y) * 16, (x + y) * 8];
  const count = (draw: () => void): number => {
    const was = drawn.length;
    draw();
    return drawn.length - was;
  };
  const all: [string, (t: number) => void, number][] = [
    ['the ink flies', (t) => drawInkFlight(g, ISO, 0, 0, 20, 4, 0, t), INK_FLIGHT],
    ['the ink lands', (t) => drawInkSplat(g, ISO, 4, 0, t), INK_POOL_FOR],
  ];
  for (const [name, draw, long] of all) {
    for (let t = 0.02; t < long; t += 0.05) assert.ok(count(() => draw(t)) > 2, `${name} @${t.toFixed(2)}: drawn`);
    assert.equal(count(() => draw(long + 0.02)), 0, `${name}: gone after ${long.toFixed(2)} s`);
    assert.equal(count(() => draw(-0.05)), 0, `${name}: nothing before it`);
  }
  assert.equal(count(() => drawInkMark(g, ISO, 4, 0, 0, 0.3)), 0, 'the mark: nothing before the warning');
  for (let k = 0.1; k <= 1; k += 0.1) assert.ok(count(() => drawInkMark(g, ISO, 4, 0, k, k)) > 10, `the mark at ${k.toFixed(1)}: drawn`);
  const cyan = [...new Set(drawn)].filter(isCyan);
  assert.equal(cyan.join(' '), '', 'cyan drawn on the floor');
});
