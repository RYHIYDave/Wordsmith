// FLOOR 12'S MEDIUM MOB, THE ORDER'S DREDGERS (src/art/dredgers.ts, their look; src/art/dredgers_moves.ts, their
// moves). A MOCK-UP: NOT IN THE GAME, behind DREDGERS_ON, off. Their brief is this chat's, on his word of 18 Oct
// (“Hey go without my say so.  If something is shit I’ll get it to it but you’re doing a great jobs. At least for
// 11-15”), sent him with their films. Held as the Hushed watch are (tests/hushed_watch.test.ts):
//   1. in the game through art/act1_figs/dredger.ts alone (behind ACT2), their switch thrown with the acts' figures;
//   2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK (src/art/boss_checks.ts), every frame, from in front and from
//      behind, and every handover: nothing through them, the boathook too; feet that grip; nothing in the floor;
//      nothing jerky; the blow drawn back, held and carried through, hips first; alive when still;
//   3. every frame of every move paints both ways round: nothing cyan, the pink edge while they live and none as
//      they die, every pixel whole or empty but the edge;
//   4. NOTHING CUT OFF: in every frame, both ways round, they are inside their picture with room to spare;
//   5. NOTHING OF THEM IN THE FLOOR, beyond what the checks see: all they wear and carry;
//   6. THE VOICES IN THE JARS leaking up out of them now and then while they live; as the jars burst, the voices
//      pouring up out of the creel, far more than ever while they live, pink going pale; none once they lie still;
//   7. the dull pink in their eyes while they live, gone out once they are down; and down they lie, low on the floor;
//   8. what falls from them as they die, the boathook and the creel's lid, lies clear of them once they are down.
//   run: tsx --test tests/dredgers.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { checkBoss, findingsSaid, framesOf, movesOf } from '../src/art/boss_checks';
import { DREDGER_CANVAS, DREDGERS_ON } from '../src/art/dredgers';
import { DREDGER, DR_DIES, DR_HAUL, DR_NET, DR_SHAPE, NET_WHIRL, netLetGo } from '../src/art/dredgers_moves';
import { NET_FLIES, NET_LIES, NET_R, NET_REACH, drawNetFlying, drawNetLying, drawNetWarn, netFrom, netSpot } from '../src/art/dredger_shots';
import { poleOf } from '../src/art/dredgers';
import { FIG as FIG_DR } from '../src/art/act1_figs/dredger';
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
const ALL: Mob[] = [DREDGER];
for (const mob of ALL) {
  for (const view of VIEWS) {
    for (const move of [...LIVING(mob), 'dying']) {
      for (const t of framesOf(mob, move)) PAINTED.push({ mob, move, view, t, p: move === 'dying' ? deathOfMob(mob, t / mob.dieTime, view) : paintMob(mob, move, t, view) });
    }
  }
}
const said = (_mob: Mob, move: string, view: string, t: number): string => `${move} ${view} @${t.toFixed(2)}`;

// (ACT 2, THE HUSH, IN THE GAME behind ACT2 (game/act1.ts, off): no longer a mock-up nothing imports. The game holds their
// pictures through art/act1_figs/dredger.ts alone, and their switch is one the bestiary throws with the acts' figures, as the
// descent's are, art/bestiary.ts useAct1Figs.)
test('1. in the game through art/act1_figs/dredger.ts alone, their switch thrown with the acts\' figures', () => {
  assert.ok(FIG_DR !== null && (FIG_DR.switches ?? []).includes(DREDGERS_ON), 'their switch is one the bestiary throws');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (and floor 16's gardeners and grooms, mock-ups that take the dredgers' pole from them: tests/palace_hands.test.ts)
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/(dredgers(_moves)?|palace_hands(_moves)?)\.ts$/.test(f) || f === 'art/act1_figs/dredger.ts') continue;
    if (/from ['"][^'"]*dredgers(_moves)?['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(' '), '', 'other game files that import them');
});

test('2. EVERY MOVE OF THEIRS THROUGH EVERY BOSS CHECK: every frame, from in front and from behind, and every handover, both of them', () => {
  for (const mob of ALL) {
    assert.equal(movesOf(mob).join(','), 'stand,walk,attack,reel,dying,net');
    const found = checkBoss(mob, DR_SHAPE);
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
    assert.equal(`${w}x${h}`, `${DREDGER_CANVAS.w}x${DREDGER_CANVAS.h}`);
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
        const bits: Bit[] = mob.bits(st, at(mob, move, t)).filter((b) => !(move === 'dying' && ((b.piece === 'boathook' && t >= DR_DIES.drop) || (b.piece === 'lid' && t >= DR_DIES.lid))));
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

/** The voices coming out of them at a moment (laid after their edge: the grains). */
function voicesAt(mob: Mob, st: Stage, m: Moment): ReadonlyArray<readonly [V3, string, number]> {
  mob.bits(st, m);
  return mob.grains?.(st, m) ?? [];
}

test('6. THE VOICES IN THE JARS: leaking up out of them now and then while they live; as the jars burst, pouring up out of the creel, pink going pale; none once they lie still', () => {
  for (const mob of ALL) {
    const st = stageOf(mob);
    let most = 0;
    let frames = 0;
    let some = 0;
    for (const move of LIVING(mob)) {
      for (const t of framesOf(mob, move)) {
        const n = voicesAt(mob, st, at(mob, move, t)).length;
        frames++;
        if (n > 0) some++;
        most = Math.max(most, n);
      }
    }
    assert.ok(some > 0.7 * frames, `voices leaking in ${some} of ${frames} living frames`);
    let great = 0;
    let pink = 0;
    let pale = 0;
    for (let t = DR_DIES.pour[0]; t <= DR_DIES.pour[1]; t += 0.05) {
      const v = voicesAt(mob, st, dyingMoment(mob, t));
      great = Math.max(great, v.length);
      for (const [, c] of v) {
        if (FLAME.includes(c)) pink++;
        else {
          const [r, g, b] = rgba(c);
          if (Math.max(r, g, b) - Math.min(r, g, b) < 40 && r > 150) pale++;
        }
        assert.ok(!isCyan(c), `a voice in cyan, ${c}`);
      }
    }
    assert.ok(great >= 4 * most, `the voices pouring out as the jars burst, ${great} at most; the most while they live, ${most}`);
    assert.ok(pink > 50 && pale > 50, `pink (${pink}) going pale (${pale})`);
    for (let t = DR_DIES.pour[1] + 0.05; t <= DR_DIES.long + 1e-9; t += 0.05) assert.equal(voicesAt(mob, st, dyingMoment(mob, t)).length, 0, `@${t.toFixed(2)}: voices still coming out`);
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
    for (let t = DR_DIES.knees; t <= DR_DIES.long + 1e-9; t += 0.05) assert.ok(!pinkEyes(mob.bits(st, dyingMoment(mob, t))), `${mob.name} @${t.toFixed(2)}: the pink still in the eyes`);
    // (seen from above at the game's slant a body lying along the floor still stands some way up the picture)
    for (const view of VIEWS) {
      const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
      const up = height(paintMob(mob, 'stand', 0, view));
      const down = height(deathOfMob(him, 1, view));
      assert.ok(down < 0.65 * up, `${mob.name} ${view}: ${down} pixels tall lying down, ${up} standing`);
    }
  }
});

test('8. what falls from them as they die, the boathook and the creel\'s lid, lies clear of them once they are down, from in front and from behind', () => {
  const fallen = new Set(['boathook', 'lid']);
  for (const mob of ALL) {
    // (them alone: what falls from them sent far off their picture; and what falls alone)
    const him: Mob = { ...mob, fall: (piece) => { const f = mob.fall?.(piece) ?? null; return f && { ...f, to: [900, 900] }; } };
    const pieces: Mob = { ...mob, bits: (st, m) => mob.bits(st, m).filter((b) => fallen.has(b.piece)) };
    const down = (DR_DIES.down + 0.2) / mob.dieTime;
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

test('9. THE CAST NET (their second blow): the net in the left hand from the creel until it is let go, its weights glinting pink; whirled round at their side through the warning; heaved out forward and up; the boathook leaned on, its butt on the floor where it stood; the net\'s marks on the floor only in their time, where it falls, nothing cyan', () => {
  const mob = DREDGER;
  const st = stageOf(mob);
  const nets = (t: number): Bit[] => mob.bits(st, at(mob, 'net', t)).filter((b) => b.part === 'net');
  // (in the hand from the creel until it is let go, and only then; its weights pink through the warning)
  for (const t of framesOf(mob, 'net')) {
    const n = nets(t);
    const held = t >= DR_NET.grip && t < DR_NET.hit;
    assert.equal(n.length > 0, held, `@${t.toFixed(2)}: ${n.length} bits of the net`);
    if (t >= DR_NET.warn[0] && held) assert.ok(n.some((b) => b.shape.k === 'ball' && typeof b.shape.skin === 'function' && FLAME.includes(b.shape.skin([0, 0, 1], 2, 0, 0) ?? '')), `@${t.toFixed(2)}: its weights not pink in the warning`);
  }
  // (whirled round at their side, the hand going forward at the bottom of it: more than a turn and a half)
  let turned = 0;
  let was: number | null = null;
  for (let t = DR_NET.whirl[0]; t <= DR_NET.whirl[1] + 1e-9; t += 1 / 30) {
    const s = at(mob, 'net', t).s;
    // (round the middle of its circle, at their side: from the shoulder, along the figure's own forward and up)
    const a = Math.atan2(s.handL[2] - s.shoulderL[2] - NET_WHIRL.c[2], s.handL[0] - s.shoulderL[0] - NET_WHIRL.c[0]);
    if (was !== null) turned += ((a - was + 3 * Math.PI) % (2 * Math.PI)) - Math.PI;
    was = a;
    assert.ok(s.handL[1] > s.shoulderL[1] + 2, `@${t.toFixed(2)}: the hand not out at their side as it whirls`);
  }
  assert.ok(turned > 1.5 * Math.PI, `whirled ${((turned * 180) / Math.PI).toFixed(0)} degrees round (forward at the bottom) through the warning`);
  // (let go of going forward and up, fast)
  const h0 = at(mob, 'net', DR_NET.hit - 1 / 30).s.handL;
  const h1 = at(mob, 'net', DR_NET.hit + 1 / 30).s.handL;
  assert.ok(h1[0] - h0[0] > 12 && h1[2] - h0[2] > 4, `let go of going (${(h1[0] - h0[0]).toFixed(1)}, ${(h1[2] - h0[2]).toFixed(1)}) forward and up over two frames`);
  const from = netLetGo();
  assert.ok(from[0] > 10 && from[2] > 12, `let go of at (${from.map((v) => v.toFixed(1)).join(', ')})`);
  // (the boathook leaned on all through it: its butt on the floor where it stood)
  const b0 = poleOf(at(mob, 'stand', 0).s, at(mob, 'stand', 0).q).butt;
  for (const t of framesOf(mob, 'net')) {
    const { s, q } = at(mob, 'net', t);
    const b = poleOf(s, q).butt;
    assert.ok(Math.hypot(b[0] - b0[0], b[1] - b0[1]) < 0.6 && b[2] > -0.2 && b[2] < 1.2, `@${t.toFixed(2)}: the boathook's butt at (${b.map((v) => v.toFixed(1)).join(', ')}), from (${b0.map((v) => v.toFixed(1)).join(', ')})`);
  }
  // its marks on the floor (dredger_shots.ts): where it falls, in their time, nothing cyan
  const dots: { x: number; y: number; c: string }[] = [];
  const pen = { globalAlpha: 1, fillStyle: '' };
  const g = { ...pen, fillRect(x: number, y: number) { dots.push({ x, y, c: (g as unknown as typeof pen).fillStyle }); } } as unknown as CanvasRenderingContext2D;
  const atF = (x: number, y: number): [number, number] => [200 + (x - y) * 16, 120 + (x + y) * 8];
  const [nx, ny] = netSpot(0, 0, 1, 0);
  assert.equal(`${nx},${ny}`, `${NET_REACH},0`);
  const [sx, sy] = atF(nx, ny);
  const onIt = (d: { x: number; y: number }, r: number, up = 0): boolean => Math.abs(d.x - sx) <= r * 32 + 2 && d.y <= sy + r * 16 + 2 && d.y >= sy - r * 16 - 2 - up;
  for (let i = 1; i <= 20; i++) {
    dots.length = 0;
    drawNetWarn(g, atF, nx, ny, i / 20, i / 20);
    if (i >= 4) assert.ok(dots.length > 0, `warning @${(i / 20).toFixed(2)}: nothing drawn`);
    for (const d of dots) {
      assert.ok(!isCyan(d.c), `the warning in cyan, ${d.c}`);
      assert.ok(onIt(d, NET_R + 0.05), `warning @${(i / 20).toFixed(2)}: drawn at (${d.x - sx}, ${d.y - sy}), off where it falls`);
    }
  }
  dots.length = 0;
  drawNetWarn(g, atF, nx, ny, 0, 0);
  drawNetWarn(g, atF, nx, ny, 1.01, 0);
  drawNetFlying(g, atF, netFrom(0, 0, 1, 0, from), nx, ny, -0.01);
  drawNetFlying(g, atF, netFrom(0, 0, 1, 0, from), nx, ny, NET_FLIES);
  drawNetLying(g, atF, nx, ny, -0.01);
  drawNetLying(g, atF, nx, ny, NET_LIES + 0.3);
  assert.equal(dots.length, 0, 'drawn outside its time');
  const f = netFrom(0, 0, 1, 0, from);
  const [fx, fy] = atF(f[0], f[1]);
  for (let t = 0; t < NET_FLIES; t += 1 / 30) {
    dots.length = 0;
    drawNetFlying(g, atF, f, nx, ny, t);
    assert.ok(dots.length > 0, `flying @${t.toFixed(2)}: nothing drawn`);
    for (const d of dots) {
      assert.ok(!isCyan(d.c), `the net in flight in cyan, ${d.c}`);
      // (between where it is let go of and where it falls, and over them, no higher than its arc)
      assert.ok(d.x >= Math.min(fx, sx - NET_R * 32) - 7 && d.x <= Math.max(fx, sx + NET_R * 32) + 7 && d.y >= Math.min(fy, sy - NET_R * 16) - f[2] - 30 && d.y <= Math.max(fy, sy + NET_R * 16) + 6, `flying @${t.toFixed(2)}: drawn at (${d.x - sx}, ${d.y - sy})`);
    }
  }
  for (let t = 0; t < NET_LIES + 0.3; t += 1 / 30) {
    dots.length = 0;
    drawNetLying(g, atF, nx, ny, t);
    assert.ok(dots.length > 0, `lying @${t.toFixed(2)}: nothing drawn`);
    for (const d of dots) {
      assert.ok(!isCyan(d.c), `the net lying in cyan, ${d.c}`);
      assert.ok(onIt(d, NET_R * 1.4, 10), `lying @${t.toFixed(2)}: drawn at (${d.x - sx}, ${d.y - sy}), off where it fell`);
    }
  }
});
