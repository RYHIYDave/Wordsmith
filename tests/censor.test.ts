// FLOOR 15'S BOSS, THE CENSOR (src/art/censor.ts, his look; src/art/censor_moves.ts, his moves; src/art/censor_shots.ts,
// what he lays on the floor). A MOCK-UP: NOT IN THE GAME, behind CENSOR_ON, off. His brief is this chat's, on his word
// of 18 Oct (“Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least
// for 11-15”), sent him with his films. Held as floor 14's Physician is (tests/physician.test.ts):
//   1. the switch is off, and only his pictures and drawings for the game (behind ACT2) import him;
//   2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from behind,
//      and every handover: nothing through him, the brush too; feet that grip; nothing in the floor; nothing jerky; the
//      slash drawn back, held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while he lives and none as he
//      dies, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, he is inside his picture with room to spare;
//   5. NOTHING OF HIM IN THE FLOOR, beyond what the checks see: all he wears and carries;
//   6. HIS STROKES: the slash's point far out before him; Redaction's bristles down on the floor far before him; the
//      Strike-Through's point thrust farther still, low; the Hush's finger raised to the mask and its bar burning pink
//      through its warning, and neither at any other time;
//   7. the pink in his eyes while he lives, gone out once he is down; and down he lies, low on the floor;
//   8. what falls from him as he dies, the brush and the mask's two halves, lies clear of him once he is down; and the
//      words of the city go free out of him, pink going pale;
//   9. what he lays on the floor: drawn; the warnings the enemy's pink, the ink black, the Hush grey, nothing cyan.
//   run: tsx --test tests/censor.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { CE_CANVAS, CENSOR_ON, brushOf } from '../src/art/censor';
import { CENSOR, CE_DIES, CE_HUSH, CE_REDACT, CE_SHAPE, CE_SLASH, CE_STRIKE } from '../src/art/censor_moves';
import { TILE3 } from '../src/art/new_mobs3';
import { REDACT_FOR, ROOM_HUSH_FOR, SLASH_MARK_FOR, STRIKE_FOR, drawRedaction, drawRoomHush, drawSlashMark, drawStrikeAim, drawStrikeLine } from '../src/art/censor_shots';
import type { Bar } from '../src/art/censor_shots';
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
const ALL: Mob[] = [CENSOR];
for (const mob of ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (_mob: Mob, move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

// (IN THE GAME BEHIND ACT2 since the Hush is built, 19 Oct 2026: through its pictures for the game, art/act1_figs/, and what it
// lays on the floor, render/act1_fx/, alone; its switch still off, as nothing of the game draws him while ACT2 is off)
test('1. the switch is off, and only his pictures and drawings for the game (behind ACT2) import him', () => {
  assert.equal(CENSOR_ON.on, false, 'CENSOR_ON is off');
  const resolve = (from: string, spec: string): string => {
    const parts = from.split('/').slice(0, -1);
    for (const s of spec.split('/')) {
      if (s === '..') parts.pop();
      else if (s !== '.') parts.push(s);
    }
    return parts.join('/');
  };
  const art = new Set(['art/censor', 'art/censor_moves', 'art/censor_shots']);
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || art.has(f.replace(/\.ts$/, ''))) continue;
    const text = fs.readFileSync(path.join('src', f), 'utf8');
    for (const m of text.matchAll(/from ['"]([^'"]+)['"]/g)) if (art.has(resolve(f, m[1]))) users.push(f);
  }
  assert.equal([...new Set(users)].sort().join(' '), 'art/act1_figs/censor.ts render/act1_fx/censor.ts', 'game files that import them');
});

test('2. EVERY MOVE OF HIS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover', () => {
  for (const mob of ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,redact,strike,hush');
    const found = checkBoss(mob, CE_SHAPE);
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
    assert.equal(`${w}x${h}`, `${CE_CANVAS.w}x${CE_CANVAS.h}`);
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
        const bits: Bit[] = mob.bits(st, at(mob, move, t)).filter((b) => !(move === 'dying' && ((b.piece === 'brush' && t >= CE_DIES.brush) || (b.piece === 'maskL' && t >= CE_DIES.halves[0]) || (b.piece === 'maskR' && t >= CE_DIES.halves[1]))));
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

test('6. HIS STROKES: the slash far out, Redaction\'s bristles down on the floor far out, the Strike-Through farther and low; the Hush\'s finger and its pink bar only in its warning', () => {
  const mob = CENSOR;
  const st = stageOf(mob);
  const tip = (move: string, t: number): V3 => brushOf(at(mob, move, t).s).tip;
  const out = (p: V3): number => Math.hypot(p[0], p[1]) / TILE3;
  const slash = tip('attack', CE_SLASH.hit);
  assert.ok(out(slash) > 1.8, `the slash's point ${out(slash).toFixed(2)} tiles out at its blow`);
  const down = tip('redact', CE_REDACT.floor);
  assert.ok(down[2] < 8 && out(down) > 2.0, `Redaction's bristles ${out(down).toFixed(2)} tiles out, ${down[2].toFixed(1)} high, in the floor`);
  for (const t of [CE_REDACT.drag[0], (CE_REDACT.drag[0] + CE_REDACT.drag[1]) / 2, CE_REDACT.drag[1]]) assert.ok(tip('redact', t)[2] < 14, `Redaction's bristles ${tip('redact', t)[2].toFixed(1)} high as they are dragged @${t.toFixed(2)}`);
  const thrust = tip('strike', CE_STRIKE.hit);
  assert.ok(out(thrust) > 2.2 && thrust[2] < 35, `the Strike-Through's point ${out(thrust).toFixed(2)} tiles out, ${thrust[2].toFixed(1)} high`);
  // (the bar on the mask, burning pink, and the raised finger: in the Hush's warning only)
  const pinkBar = (move: string, t: number): boolean => {
    const bits = mob.bits(st, at(mob, move, t)).filter((x) => x.part === 'maskL' && x.shape.k === 'ball');
    const sk = (bits[0].shape as { skin: (u: V3, tone: number, x: number, y: number) => string | null }).skin;
    return sk([0.9, 0.1, -0.42], 3, 0, 0) === FLAME[2];
  };
  const mid = (CE_HUSH.warn[0] + CE_HUSH.hit) / 2;
  assert.ok(pinkBar('hush', mid), 'the bar burning pink in the Hush\'s warning');
  for (const [move, t] of [['stand', 0.5], ['attack', CE_SLASH.hit], ['hush', CE_HUSH.long]] as const) assert.ok(!pinkBar(move, t), `the bar pink in ${move} @${t}`);
  const fingers = (move: string, t: number): number => mob.bits(st, at(mob, move, t)).filter((x) => x.piece === 'fingerL' && x.shape.k === 'rod').length;
  assert.equal(fingers('hush', mid), fingers('stand', 0), 'his left hand\'s fingers all there as he hushes');
});

test('7. the pink in his eye slits while he lives, gone out once he is down; and down he lies, low on the floor', () => {
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
    for (let t = CE_DIES.knees; t <= CE_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.name} @${t.toFixed(2)}: the pink still in the eyes`);
    // (how high the top of him is over the ground: standing, and lying on his face)
    const top = (bits: Bit[]): number => Math.max(...bits.filter((b) => b.piece !== 'brush' && b.piece !== 'maskL' && b.piece !== 'maskR').map((b) => {
      const sh = b.shape;
      if (sh.k === 'ball') return sh.c[2] + Math.hypot(sh.ax[0][2], sh.ax[1][2], sh.ax[2][2]);
      if (sh.k === 'rod') return Math.max(sh.a[2] + sh.ra, sh.b[2] + sh.rb);
      return -Infinity;
    }));
    const up = top(mob.bits(st, at(mob, 'stand', 0)));
    const down = top(mob.bits(st, dyingMoment(mob, CE_DIES.long)));
    assert.ok(down < 0.4 * up, `${mob.name}: its top ${down.toFixed(1)} over the ground lying down, ${up.toFixed(1)} standing`);
  }
});

test('8. what falls from him as he dies, the brush and the mask\'s two halves, lies clear of him once he is down; and the words of the city go free', () => {
  const fallen = new Set(['brush', 'maskL', 'maskR']);
  for (const mob of ALL) {
    // (him alone: what falls from him sent far off his picture; and what falls alone)
    const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const pieces: Mob = { ...mob, bits: (st, m) => mob.bits(st, m).filter((b) => fallen.has(b.piece)) };
    const down = (CE_DIES.down + 0.2) / mob.dieTime;
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
  const mob = CENSOR;
  const st = stageOf(mob);
  const words = (t: number): ReadonlyArray<readonly [V3, string, number]> => grainsAt(mob, st, dyingMoment(mob, t));
  const mid = words((CE_DIES.words[0] + CE_DIES.words[1]) / 2);
  assert.ok(mid.filter(([, c]) => FLAME.includes(c)).length > 5 && mid.filter(([, c]) => !FLAME.includes(c)).length > 5, 'the words rising pink and going pale');
  assert.equal(words(CE_DIES.long).length, 0, 'none once he lies still');
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

test('9. what he lays on the floor: drawn; the warnings the enemy\'s pink, the ink black, the Hush grey; never cyan', () => {
  const floorAt = (x: number, y: number): readonly [number, number] => [100 + (x - y) * 16, 60 + (x + y) * 8];
  const r = recorder();
  for (let t = 0; t < SLASH_MARK_FOR; t += 0.05) drawSlashMark(r.g, floorAt, 2, 2, 1, 0, t);
  const bars: Bar[] = [{ x: 3, y: 2, along: 0, long: 4, wide: 0.8 }, { x: 2, y: 4, along: 1, long: 3, wide: 0.8 }];
  for (let t = -0.6; t < REDACT_FOR; t += 0.1) drawRedaction(r.g, floorAt, bars, t);
  for (let k = 0.1; k < 1; k += 0.2) drawStrikeAim(r.g, floorAt, 1, 1, 1, 0.3, 8, k);
  for (let t = 0; t < STRIKE_FOR; t += 0.05) drawStrikeLine(r.g, floorAt, 1, 1, 1, 0.3, 8, t);
  for (let t = 0; t < ROOM_HUSH_FOR; t += 0.25) drawRoomHush(r.g, floorAt, 3, 3, 6, t);
  assert.ok(r.n() > 1500, `${r.n()} pixels drawn`);
  for (const c of r.colours) if (c.startsWith('#')) assert.ok(!isCyan(c), `the shots draw cyan, ${c}`);
  assert.ok([...r.colours].some((c) => FLAME.includes(c)), 'the enemy\'s pink in the warnings');
});
