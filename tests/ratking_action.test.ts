// THE RAT KING DONE THE ACTION WAY (the art chat's helper, 2 Nov 2026; docs/mockups/action_f12_ratking/README.md). His review, 31 Oct
// 2026, offered “The sluices open, in place of the roll: water floods across the cistern in lanes, carrying rats with it. Stand on
// the dry ledges between”: “Yes (Recommended)”. And his rulebook's Monsters 9, Action, like a movie: every attack Movement 9 with
// bigger areas. So:
//   1. the switch is off; nothing of the game imports the mock-up; the game's own frames of the Rat King and what the game draws of
//      his moves hash the same as on the branch this one came from (tools/ratking_action_hash.ts); with the new art his stand, his
//      scuttle, struck, knotting again and his death the game's own, frame for frame; his roll gone, the sluices in its place;
//   2. every frame of his new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off, both ways round;
//   3. HIS NEW MOVES THROUGH THE REVIEW FOR THE OLD RIGS (art/action_f1_checks.ts checkKit: he is not on the heroes' bones), both ways
//      round, six pairs of feet as his soles: nothing found; and the whole-figure checks the game's own test of him makes (FLOOR,
//      SLIDE on every rat's every foot, JUMP from his stand and back); Movement 9 (held wind-ups, strikes of two frames, smeared, big
//      wind-downs);
//   4. what he does to the cistern and sends across it: crisp, no cyan, the enemy's pink; the flood in the lanes and never on the
//      ledges;
//   5. THE NUMBERS: the lanes and the ledges; the flood across the cistern in a few frames, three seconds, draining; the bite's wedge,
//      the word and the swarm bigger and faster than the game's own.
//   run: tsx --test tests/ratking_action.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import type { AnimSet, Clip } from '../src/art/actor_types';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM, FLAME } from '../src/art/mkit';
import { Px, rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { RK_UNKNOT, makeRatKingArt } from '../src/art/rat_king';
import { SWARM_FOR, SWARM_RATS, WORD_BURST_FOR, WORD_SPEED, drawStolenWord, drawSwarm, drawWordAim, drawWordBurst } from '../src/art/rat_king_shots';
import type { StolenWord } from '../src/art/rat_king_shots';
import { drawChargeLane } from '../src/art/charge_lane';
import {
  BITE9, BITE9_HIT, BITE9_STRIKE, HITS9, LONG9, MOVES9, RATKING_ACTION, RK9_CANVAS, SLUICE, SLUICE_HIT, SLUICE_STRIKE, STRIKES9, UNKNOT9, UNKNOT9_HIT, WORDS9, WORDS9_HIT,
  king9Painted, makeRatKingActionArt, pose9,
} from '../src/art/ratking_action';
import {
  CISTERN, FLOOD, LANE, LANES, SWARM9, floodSpan, flooded, gateUp, isoAt, laneOf, lanesFor, paintBurstRing, paintFlood, paintGate, paintLaneMarks, paintSwarm9, paintWedge, paintWord, paintWordBurst, paintWordLine,
} from '../src/art/ratking_action_fx';
import type { Word } from '../src/art/ratking_action_fx';
import { review, whole } from './ratking_action_shapes';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };

paintWithoutCanvas();

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')).filter((k) => k !== '255,255,255'));
function hueSat(r: number, g: number, b: number): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  if (max !== min) {
    if (max === r) h = ((g - b) / (max - min)) * 60;
    else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
    else h = (4 + (r - g) / (max - min)) * 60;
  }
  return [(h + 360) % 360, max === 0 ? 0 : (max - min) / max, max];
}
const cyanGlow = (r: number, g: number, b: number): boolean => {
  const [h, s, max] = hueSat(r, g, b);
  return max >= 150 && s >= 0.45 && h >= 165 && h <= 205;
};
const rimKey = rgba(ENEMY_RIM).slice(0, 3).join(',');
const PINKS = new Set([...FLAME, '#7a1058', '#e0287a', '#ff7aa8'].map((c) => rgba(c).slice(0, 3).join(',')));
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; pink: number; edge: boolean } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
  let pink = 0;
  let cyan: string | null = null;
  let edge = false;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const i = (y * p.w + x) * 4;
      const a = p.d[i + 3];
      if (a === 0) continue;
      painted++;
      if (a !== 255 && a !== RIM_ALPHA) odd++;
      const k = `${p.d[i]},${p.d[i + 1]},${p.d[i + 2]}`;
      if (k === rimKey) rim++;
      if (PINKS.has(k)) pink++;
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, pink, edge };
}
function lists(s: AnimSet): Map<string, Sprite[]> {
  const out = new Map<string, Sprite[]>([['idle', s.idle], ['walk', s.walk], ['attack3', s.attack]]);
  const c = s.clips;
  if (c) {
    for (const k of ['attack', 'heavy', 'die', 'reel'] as const) if (c[k]) out.set(k, (c[k] as Clip).frames);
    for (const [k, v] of Object.entries(c.moves ?? {})) out.set(`moves.${k}`, v.frames);
  }
  return out;
}
/** The game's own rules' numbers for his old moves (game/act1_rules/ratking.ts RK: the bite out to 2.5 tiles, 0.94 to either side; the word's burst 1.0, its reach 10; the swarm 1.0 to either side of its line). */
const OLD = { biteReach: 2.5, biteArc: 0.94, wordBurst: 1.0, wordReach: 10, swarmHalf: 1.0 } as const;
/** As tools/ratking_action_hash.ts hashes his frames (every list both ways round) and what the game draws of his moves. */
type Hasher = { update(x: unknown): Hasher; digest(e: string): string };
const sha = (): Hasher => (nodeCrypto as { createHash(a: string): Hasher }).createHash('sha256');
function penOf(px: Px): CanvasRenderingContext2D {
  let pts: [number, number][] = [];
  const blend = (X: number, Y: number, c: readonly number[], a: number): void => {
    if (X < 0 || Y < 0 || X >= px.w || Y >= px.h) return;
    const i = (Y * px.w + X) * 4;
    const f = (Math.max(0, Math.min(1, a)) * (c[3] ?? 255)) / 255;
    px.d[i] = Math.round(px.d[i] * (1 - f) + c[0] * f);
    px.d[i + 1] = Math.round(px.d[i + 1] * (1 - f) + c[1] * f);
    px.d[i + 2] = Math.round(px.d[i + 2] * (1 - f) + c[2] * f);
    px.d[i + 3] = Math.max(px.d[i + 3], Math.round(255 * f));
  };
  const g = {
    fillStyle: '#000' as string,
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number): void {
      const c = rgba(g.fillStyle);
      for (let Y = Math.round(y); Y < Math.round(y + h); Y++) for (let X = Math.round(x); X < Math.round(x + w); X++) blend(X, Y, c, g.globalAlpha);
    },
    beginPath(): void {
      pts = [];
    },
    moveTo(x: number, y: number): void {
      pts.push([x, y]);
    },
    lineTo(x: number, y: number): void {
      pts.push([x, y]);
    },
    closePath(): void {},
    fill(): void {
      if (pts.length < 3) return;
      const c = rgba(g.fillStyle);
      const ys = pts.map((p) => p[1]);
      for (let Y = Math.floor(Math.min(...ys)); Y <= Math.ceil(Math.max(...ys)); Y++) {
        const yc = Y + 0.5;
        const xs: number[] = [];
        for (let i = 0; i < pts.length; i++) {
          const [x0, y0] = pts[i];
          const [x1, y1] = pts[(i + 1) % pts.length];
          if ((y0 <= yc && y1 > yc) || (y1 <= yc && y0 > yc)) xs.push(x0 + ((yc - y0) / (y1 - y0)) * (x1 - x0));
        }
        xs.sort((a, b) => a - b);
        for (let k = 0; k + 1 < xs.length; k += 2) for (let X = Math.round(xs[k]); X < Math.round(xs[k + 1]); X++) blend(X, Y, c, g.globalAlpha);
      }
    },
  };
  return g as unknown as CanvasRenderingContext2D;
}
function ratKingHashes(art: ReturnType<typeof makeRatKingArt>): { whole: string; shots: string } {
  const m: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
    for (const [name, fr] of lists(s)) {
      m[`${view}:${name}`] = fr.map((sp) => {
        const p = sp.img as unknown as Px;
        return sha().update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).update(JSON.stringify(sp.aura ?? null)).digest('hex').slice(0, 12);
      });
    }
  }
  const h = sha();
  const at = (x: number, y: number): [number, number] => [300 + 32 * (x - y), 200 + 16 * (x + y)];
  const kinds: StolenWord[] = ['fire', 'frost', 'lightning', 'poison'];
  for (let t = 0; t < 1.6; t += 0.1) {
    const px = new Px(600, 400);
    const g = penOf(px);
    drawWordAim(g, at, 0, 0, 4, 2, t / 1.2, t);
    kinds.forEach((k, i) => drawStolenWord(g, at, k, -3 + i, -2, 40.8, 3 + i, 4, t * 0.6));
    kinds.forEach((k, i) => drawWordBurst(g, at, k, -2 + 2 * i, 3, t * 0.4));
    drawSwarm(g, at, -4, -3, 4, 3, t * 0.6);
    drawChargeLane(g, { x0: -4, y0: 2, x1: 3, y1: -3, half: 0.74, k: Math.min(1, t), ...(t > 1 ? { gone: t - 1 } : {}) }, at);
    h.update(px.d);
  }
  return { whole: sha().update(JSON.stringify(m)).digest('hex').slice(0, 16), shots: h.digest('hex').slice(0, 16) };
}
/** The game's own frames of the Rat King and what it draws of his moves, on 8ddc04c (origin/art/action-f11-crier, before this branch): tools/ratking_action_hash.ts. */
const HASH = { ratking: 'e0df474ef6b3a1cb', shots: '45bc53ab47f551ee' };

test('1. the switch is off; nothing of the game imports the mock-up; the game’s frames the same; only the new moves new', () => {
  assert.equal(RATKING_ACTION.on, false, 'the switch is on');
  const OURS = /from ['"][^'"]*ratking_action(_fx)?['"]/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || /^art\/ratking_action/.test(f)) continue;
    assert.ok(!OURS.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  const game = makeRatKingArt();
  const h = ratKingHashes(game);
  assert.equal(h.whole, HASH.ratking, "the game's own frames of the Rat King changed");
  assert.equal(h.shots, HASH.shots, "what the game draws of his moves changed");
  const art = makeRatKingActionArt();
  for (const v of ['front', 'back'] as const) {
    const g = lists(game[v]);
    const n = lists(art[v]);
    for (const name of ['idle', 'walk', 'die', 'reel', 'moves.knot']) (g.get(name) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (n.get(name) as Sprite[])[i]), 0, `${v} ${name} ${i}: the game's own`));
    for (const name of ['attack', 'attack3', 'moves.sluice', 'moves.words', 'moves.unknot']) assert.ok(n.has(name), `${v}: has ${name}`);
    for (const name of ['moves.curl', 'moves.roll', 'moves.uncurl']) assert.ok(!n.has(name), `${v}: the sluices in place of his roll (${name})`);
    assert.equal((art[v].clips?.attack as Clip).hit, BITE9_HIT, `${v}: the bite's moment`);
    assert.equal((art[v].clips?.moves?.sluice as Clip).hit, SLUICE_HIT, `${v}: the slam's moment`);
  }
});

test('2. every frame of his new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const art = makeRatKingActionArt();
  for (const v of ['front', 'back'] as const) {
    const set = art[v];
    const clips: [string, Sprite[]][] = [['attack', (set.clips?.attack as Clip).frames], ...(['sluice', 'words', 'unknot'] as const).map((m): [string, Sprite[]] => [m, (set.clips?.moves?.[m] as Clip).frames])];
    for (const [m, frames] of clips) {
      frames.forEach((sp, i) => {
        const l = look(paintingOf(sp), sp.lights);
        // (unknotting, the last of them run off into the cracks: little left of him at its end)
        const gone = m === 'unknot' && i / 30 > UNKNOT9.land + 0.2;
        assert.ok(gone || (l.painted > 1500 && l.rim > 60), `${v} ${m} ${i}: painted (${l.painted}), the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${v} ${m} ${i}: not crisp`);
        assert.equal(l.cyan, null, `${v} ${m} ${i}: a friend's colour`);
      });
    }
    // (cut off: his own canvas, before it is trimmed)
    for (const m of MOVES9) for (let i = 0; i <= Math.round(LONG9[m] * 30); i++) assert.ok(!look(king9Painted(m, i / 30, v).px).edge, `${v} ${m} ${i}: cut off`);
  }
});

test('3. his new moves through the review for the old rigs, both ways round, and the whole-figure checks: nothing found; Movement 9', () => {
  const said = [...review(), ...whole()];
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
  for (const m of MOVES9) {
    const [a, b] = STRIKES9[m];
    const hit = HITS9[m];
    assert.ok(Math.round((b - a) * 30) === 2 && Math.abs(hit - b) < 1e-9, `${m}: a strike of two frames, its blow at its end`);
    const held = m === 'attack' ? a - BITE9.held : m === 'sluice' ? a - SLUICE.held : m === 'words' ? a - WORDS9.held : a - UNKNOT9.held;
    assert.ok(held >= 0.4 && hit >= 0.9, `${m}: held ${held.toFixed(2)} s, its whole wind-up ${hit.toFixed(2)} s`);
    // (unknotting's wind-down is its running off, the swarm and the knot: the game's own, after it)
    const down = m === 'unknot' ? LONG9[m] - hit + SWARM9.for + RK_UNKNOT.in : LONG9[m] - hit;
    assert.ok(down >= 1.2, `${m}: a big wind-down (${down.toFixed(2)} s)`);
  }
  // THE SLUICES: he rears up as a heap (the King hoisted higher than the knight's head) and slams down
  const king = (t: number): number => pose9('sluice', t).rats[10].c[2];
  assert.ok(king(SLUICE.held + 0.2) > king(0) + 18 && king(SLUICE_HIT) < king(0), `reared ${(king(SLUICE.held + 0.2) - king(0)).toFixed(1)} up, slammed down`);
  // THE BITE: the front three leap out to the end of their tails
  const front = (t: number): number => Math.hypot(pose9('attack', t).rats[0].c[0], pose9('attack', t).rats[0].c[1]);
  assert.ok(front(BITE9_HIT) - front(BITE9_STRIKE[0]) >= BITE9.lunge * 39 * 0.95, 'the front rat leaps out its lunge');
  assert.ok(front(BITE9.long) - front(0) < 1, 'and is hauled back home');
  // UNKNOT: they burst out in two frames, a ring out to its reach
  const out = pose9('unknot', UNKNOT9_HIT).rats.map((r) => Math.hypot(r.c[0], r.c[1]) / 39.19);
  assert.ok(Math.min(...out.slice(0, 7)) > 1.8, `burst out (${Math.min(...out).toFixed(2)} tiles at least)`);
});

test('4. what he does to the cistern and sends across it: crisp, no cyan, the enemy’s pink; the flood in the lanes, never on the ledges', () => {
  const I = { cx: 600, cy: 360 };
  const at = isoAt(I);
  const check = (name: string, px: Px, pink = true): void => {
    const l = look(px);
    assert.ok(l.odd === 0 && l.cyan === null, `${name}: crisp (${l.odd}), no cyan (${l.cyan})`);
    if (pink) assert.ok(l.pink > 30, `${name}: the enemy's pink (${l.pink})`);
  };
  for (const m of [SLUICE.mark + 0.2, 1.0, SLUICE_HIT - 0.1]) {
    const px = new Px(1200, 720);
    paintLaneMarks(px, at, m);
    check(`lanes marked at ${m.toFixed(2)}`, px);
  }
  for (const m of [0.5, SLUICE_HIT - 0.05, SLUICE_HIT + 0.05, SLUICE_HIT + 1, SLUICE_HIT + FLOOD.runs + 0.4]) {
    const px = new Px(1200, 720);
    paintFlood(px, I, m, [0.3, 0]);
    LANES.forEach((L, i) => paintGate(px, I, L, i, m));
    check(`the flood at ${m.toFixed(2)}`, px, false);
    // (never on a dry ledge: its middle between two lanes left as it was)
    if (m > SLUICE_HIT + 0.3 && m < SLUICE_HIT + FLOOD.runs) {
      for (let k = 0; k + 1 < LANES.length; k++) {
        const y = (LANES[k].y + LANES[k].half + LANES[k + 1].y - LANES[k + 1].half) / 2;
        for (let x = -7; x <= 7; x += 0.5) {
          const [X, Y] = at(x, y);
          assert.equal(px.d[(Math.round(Y) * px.w + Math.round(X)) * 4 + 3], 0, `the flood on the ledge at ${x}, ${y.toFixed(2)}`);
        }
      }
      let wet = 0;
      for (const L of LANES) for (let x = -6; x <= 6; x += 1) {
        const [X, Y] = at(x, L.y + 0.3);
        if (px.d[(Math.round(Y) * px.w + Math.round(X)) * 4 + 3]) wet++;
      }
      assert.ok(wet >= LANES.length * 11, `the lanes flooded (${wet})`);
    }
  }
  const words: Word[] = ['fire', 'frost', 'lightning', 'poison'];
  for (const kind of words) {
    const px = new Px(1200, 720);
    paintWordLine(px, at, 0, 0, 8, 2, 0.6);
    paintWordLine(px, at, 0, 3, 8, 5, WORDS9.lock + 0.1);
    paintWord(px, at, kind, -4, 0, 52, 6, 3, 0.2);
    for (const q of [0.05, 0.3, 0.6]) paintWordBurst(px, at, kind, -3 + q * 8, -3, q);
    check(`the word ${kind}`, px);
  }
  const px = new Px(1200, 720);
  for (const m of [BITE9.mark + 0.3, BITE9_HIT + 0.05, BITE9_HIT + 0.4]) paintWedge(px, at, m, [0, 0], 0.3);
  paintBurstRing(px, at, [-4, 3], 0.05);
  paintSwarm9(px, at, -6, -4, 4, -3, 0.5);
  check('the wedge, the burst and the swarm', px);
});

test('5. the numbers: the lanes and ledges, the flood, the bite, the word and the swarm', () => {
  // THE LANES: three lanes 3 tiles wide in the pictures' 16, ledges 1.75 between and along the walls; in the game's own cistern (22 or 26 across) four or five
  const p16 = lanesFor(16);
  assert.ok(p16.lanes.length === 3 && Math.abs(p16.ledge - 1.75) < 1e-9 && LANE.w === 3, 'three lanes in the pictures');
  assert.ok(lanesFor(22).lanes.length === 4 && Math.abs(lanesFor(22).ledge - 2) < 1e-9 && lanesFor(26).lanes.length === 5 && lanesFor(26).ledge >= LANE.ledge, 'the game’s own cistern');
  assert.ok(laneOf(0) === 1 && laneOf(2.4) === -1 && laneOf(-7.5) === -1 && laneOf(4.75) === 2, 'lanes and ledges');
  // THE FLOOD: across the cistern in a few frames, three seconds, draining; the gates grinding open while he holds, bursting in two frames
  const len = 2 * CISTERN.half;
  assert.ok(len / FLOOD.front <= 0.25 && FLOOD.runs >= 3 && FLOOD.drain <= 1, 'fast, long, then gone');
  assert.equal(floodSpan(SLUICE_HIT - 0.01, 0, len).join(), '0,0', 'no water before the burst');
  assert.ok(floodSpan(SLUICE_HIT + 0.25, 0, len)[1] === len && floodSpan(SLUICE_HIT + 0.25 + FLOOD.runs + FLOOD.drain, 2, len)[0] === len, 'across, then drained');
  assert.ok(flooded(0, 4.75, SLUICE_HIT + 1) && !flooded(0, 2.4, SLUICE_HIT + 1) && !flooded(0, 4.75, SLUICE_HIT + FLOOD.runs + FLOOD.drain + 0.2), 'flooded in a lane; dry on a ledge; drained');
  assert.ok(gateUp(SLUICE.gates - 0.01, 0) === 0 && gateUp(1.2, 0) > 0.05 && gateUp(1.2, 0) <= FLOOD.gateLift + 0.03 && gateUp(SLUICE_HIT + 0.1, 0) === 1, 'the gates grinding open, bursting');
  assert.ok(SLUICE_HIT - SLUICE.mark >= 1.2, 'the lanes marked well before');
  // THE BITE: a wedge further and wider than the game's own (2.5 tiles, 0.94 to either side)
  assert.ok(BITE9.reach >= OLD.biteReach * 1.3 && (BITE9.arc / 2) * (Math.PI / 180) > OLD.biteArc, `the wedge out to ${BITE9.reach}, ${BITE9.arc} degrees`);
  // STOLEN WORDS: twice as fast, twice as wide, its line locked a third of a second before it flies
  assert.ok(WORDS9.speed >= 2 * WORD_SPEED && WORDS9.burst >= 2 * OLD.wordBurst && WORDS9.burstFor > WORD_BURST_FOR && WORDS9.reach > OLD.wordReach, 'the word bigger and faster');
  assert.ok(WORDS9_HIT - WORDS9.lock >= 0.3 && WORDS9.lock - WORDS9.aim >= 0.6, 'its line follows, then locks');
  // UNKNOT: twice the swarm, twice as wide; its burst a ring out to 2.6 tiles
  assert.ok(SWARM9.rats >= 2 * SWARM_RATS && SWARM9.half >= 1.5 * OLD.swarmHalf && SWARM9.for >= SWARM_FOR && UNKNOT9.ring >= 2.5, 'the swarm bigger');
});
