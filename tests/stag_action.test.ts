// THE HOLLOW STAG DONE THE ACTION WAY (the art chat's helper, 1 Nov 2026; docs/mockups/action_f9_stag/README.md). His words, 31 Oct
// 2026, offered “The wood closes in, in place of the root lines”: “I love this.  It shrinks at 3/4, 1/2, and 1/4.  And I’d like him to
// move around the arena like the horse does in the princess fight.  Really explore the space.  Not EXACTLY like the horse but
// similar”. So:
//   1. the switch is off; nothing of the game imports the mock-up; the game's own frames of the Stag and of its roots hash the same as
//      on the branch this one came from (tools/stag_action_hash.ts); with the new art, his stand, his bellow, struck and his death the
//      game's own, frame for frame; his roots gone, the wood closing in and standing to stare in their place;
//   2. every frame of his new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off, both ways round;
//   3. HIS NEW MOVES THROUGH THE REVIEW FOR THE OLD RIGS (art/action_f1_checks.ts checkKit: he is not on the heroes' bones), both ways
//      round, each pair of his hoofs as his soles, where the game carries him and all: nothing found; Movement 9 (held wind-ups,
//      strikes of two frames, smeared, big wind-downs);
//   4. the wall and the marks: crisp, no cyan, not cut off; the wall over the knight's head;
//   5. THE NUMBERS: the clearing at 3/4, 1/2 and 1/4; whoever the wall catches thrown in; his bounds fast and long; the gore's sweep and
//      the charge bigger and faster than the game's own.
//   run: tsx --test tests/stag_action.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodeCrypto from 'node:crypto';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { BLADE, CYAN, GLINT, RIM_ALPHA, SPARK } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { Px, rgba } from '../src/engine/px';
import type { Sprite } from '../src/engine/px';
import { checkKit } from '../src/art/action_f1_checks';
import { TILE3 } from '../src/art/new_mobs3';
import { STAG_CHARGE, STAG_FEET, STAG_GORE, makeStagArt, rootSnakePainted } from '../src/art/hollow_stag';
import {
  CHARGE9, CHARGE9_CARRIED, CHARGE9_HIT, CHARGE9_STRIKE, CLOSE, CLOSE_HIT, CLOSE_STRIKE, GORE9, GORE9_HIT, GORE9_STRIKE, LONG9, MOVES9, STAG9_CANVAS, STAG_ACTION,
  STARE, STOT9, charge9Carry, makeStagActionArt, pose9, stag9Painted, stotAt,
} from '../src/art/stag_action';
import { CLEARING, WALL, clearingAt, clumpHigh, inClearing, outOf, paintEdgeMark, paintGoreMark, thrownIn, wallAt, wallClumpPainted } from '../src/art/stag_action_fx';
import { lanePainted } from '../src/art/action_f6_golem';
import { stagKit, standKit } from './stag_action_shapes';
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
function look(p: Px, lights: ReadonlyArray<{ color: string }> = []): { painted: number; odd: number; cyan: string | null; rim: number; edge: boolean } {
  let painted = 0;
  let odd = 0;
  let rim = 0;
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
      if (!cyan && (FRIEND.has(k) || cyanGlow(p.d[i], p.d[i + 1], p.d[i + 2]))) cyan = k;
      if (x === 0 || y === 0 || x === p.w - 1 || y === p.h - 1) edge = true;
    }
  }
  for (const l of lights) if (cyanGlow(...(rgba(l.color).slice(0, 3) as [number, number, number]))) cyan = `light ${l.color}`;
  return { painted, odd, cyan, rim, edge };
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
/** As tools/stag_action_hash.ts hashes the Stag's frames (every list both ways round) and a run of its roots' stretches. */
type Hasher = { update(x: unknown): Hasher; digest(e: string): string };
const sha = (): Hasher => (nodeCrypto as { createHash(a: string): Hasher }).createHash('sha256');
function stagHashes(art: ActorArt): { whole: string; roots: string } {
  const m: Record<string, string[]> = {};
  for (const [view, s] of [['front', art.front], ['back', art.back]] as const) {
    for (const [name, fr] of lists(s)) {
      m[`${view}:${name}`] = fr.map((sp) => {
        const p = sp.img as unknown as Px;
        return sha().update(`${p.w}x${p.h}@${sp.ax},${sp.ay},${sp.density ?? 1};`).update(p.d).update(JSON.stringify(sp.lights ?? [])).update(JSON.stringify(sp.aura ?? null)).digest('hex').slice(0, 12);
      });
    }
  }
  const r = sha();
  for (const view of ['front', 'back'] as const) for (const along of [-24, 0, 24]) for (let t = -0.3; t <= 0.9; t += 0.1) {
    const p = rootSnakePainted(t, view, along, 3).px;
    r.update(`${p.w}x${p.h};`).update(p.d);
  }
  return { whole: sha().update(JSON.stringify(m)).digest('hex').slice(0, 16), roots: r.digest('hex').slice(0, 16) };
}
/** The game's own frames of the Stag and its roots, on 5a3d9fc (origin/art/action-f7-queen, before this branch): tools/stag_action_hash.ts. */
const HASH = { stag: 'f060c17f773e5221', roots: 'd2069c9f30276b52' };

test('1. the switch is off; nothing of the game imports the mock-up but what brings it in; the game’s frames the same; only the new moves new', () => {
  assert.equal(STAG_ACTION.on, false, 'the switch is on');
  const OURS = /from ['"][^'"]*stag_action(_fx)?['"]/;
  // (brought in by the main chat, 2 Nov 2026, behind the switch: only through his figure, his rules and what he leaves)
  const BRINGS = /^(art\/act1_figs|game\/act1_rules|render\/act1_fx)\/stag\.ts$/;
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || BRINGS.test(f) || /^art\/stag_action/.test(f)) continue;
    assert.ok(!OURS.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
  const game: ActorArt = makeStagArt();
  const h = stagHashes(game);
  assert.equal(h.whole, HASH.stag, "the game's own frames of the Stag changed");
  assert.equal(h.roots, HASH.roots, "the game's own roots changed");
  const art = makeStagActionArt();
  for (const v of ['front', 'back'] as const) {
    const g = lists(game[v]);
    const n = lists(art[v]);
    for (const name of ['idle', 'die', 'reel', 'moves.bellow']) (g.get(name) as Sprite[]).forEach((sp, i) => assert.equal(unlike(sp, (n.get(name) as Sprite[])[i]), 0, `${v} ${name} ${i}: the game's own`));
    for (const name of ['walk', 'attack', 'attack3', 'moves.charge', 'moves.close', 'moves.stare']) assert.ok(n.has(name), `${v}: has ${name}`);
    assert.ok(!n.has('moves.roots'), `${v}: the wood closing in in place of his roots`);
    assert.equal(art[v].walkFps, STOT9.fps, `${v}: the great stot's frames a second`);
  }
});

test('2. every frame of his new moves paints, wears the pink edge, is crisp, has no cyan, nothing cut off', () => {
  const art = makeStagActionArt();
  for (const v of ['front', 'back'] as const) {
    const set = art[v];
    const clips: [string, Sprite[]][] = [['walk', set.walk], ['attack', (set.clips?.attack as Clip).frames], ...(['charge', 'close', 'stare'] as const).map((m): [string, Sprite[]] => [m, (set.clips?.moves?.[m] as Clip).frames])];
    for (const [m, frames] of clips) {
      frames.forEach((sp, i) => {
        const l = look(paintingOf(sp), sp.lights);
        assert.ok(l.painted > 1500 && l.rim > 60, `${v} ${m} ${i}: painted (${l.painted}), the pink edge (${l.rim})`);
        assert.equal(l.odd, 0, `${v} ${m} ${i}: not crisp`);
        assert.equal(l.cyan, null, `${v} ${m} ${i}: a friend's colour`);
      });
    }
    // (cut off: his own canvas, before it is trimmed)
    for (const m of MOVES9) for (let i = 0; i <= Math.round(LONG9[m] * 30); i++) assert.ok(!look(stag9Painted(m, i / 30, v).px).edge, `${v} ${m} ${i}: cut off`);
  }
  assert.ok(STAG9_CANVAS.w > 420 && STAG9_CANVAS.h > 400, 'his canvas bigger than the game’s for his lunge and his rearing');
});

test('3. his new moves through the review for the old rigs, both ways round: nothing found; Movement 9', () => {
  const said: string[] = [];
  for (const v of ['front', 'back'] as const) {
    for (const pair of [0, 1] as const) {
      const stand = standKit(v, pair);
      for (const m of MOVES9) {
        for (const f of checkKit(stagKit(v, m, pair), stand)) {
          // (standing to stare begins as a bound lands, the game stopping him there: its kit begins with his walk before it, so it
          // is handed over to from his walk, not his stand; its end into his stand is reviewed)
          if (m === 'stare' && f.move === 'stand > stare') continue;
          said.push(`${v} ${f.move} (${pair ? 'hind' : 'fore'}): ${f.kind} ${f.what}, ${f.by.toFixed(1)} at ${f.t.toFixed(2)} s`);
        }
      }
    }
  }
  assert.equal(said.length, 0, `the review found:\n${said.join('\n')}`);
  for (const [name, [a, b], hit, long, held] of [
    ['gore', GORE9_STRIKE, GORE9_HIT, GORE9.long, GORE9_STRIKE[0] - GORE9.held],
    ['charge', CHARGE9_STRIKE, CHARGE9_HIT, CHARGE9.long, CHARGE9_STRIKE[0] - CHARGE9.held],
    ['close', CLOSE_STRIKE, CLOSE_HIT, CLOSE.long, CLOSE_STRIKE[0] - CLOSE.rear],
  ] as const) {
    assert.ok(Math.round((b - a) * 30) === 2 && Math.abs(hit - b) < 1e-9, `${name}: a strike of two frames, its blow at its end`);
    assert.ok(held >= 0.15 && hit >= 0.8, `${name}: held ${held.toFixed(2)} s, its whole wind-up ${hit.toFixed(2)} s`);
    assert.ok(long - hit >= 1.0, `${name}: a big wind-down (${(long - hit).toFixed(2)} s)`);
  }
  // standing to stare begins on the very landing his walk comes down on
  const a = pose9('stare', 0);
  const w = stotAt(0);
  assert.ok(a.feet.every((f, i) => Math.hypot(f[0] - w.feet[i][0], f[1] - w.feet[i][1], f[2] - w.feet[i][2]) < 1e-6) && Math.abs(a.z - w.z) < 1e-6 && Math.abs(a.yaw - w.yaw) < 1e-6, 'the stare begins as his walk lands');
});

test('4. the wall and the marks: crisp, no cyan, not cut off; the wall over the knight’s head', () => {
  const check = (name: string, p: { px: Px; lights?: ReadonlyArray<{ color: string }> }, mustPaint = false): void => {
    const l = look(p.px, p.lights ?? []);
    assert.ok(l.odd === 0 && l.cyan === null && !l.edge, `${name}: crisp (${l.odd}), no cyan (${l.cyan}), not cut off (${l.edge})`);
    if (mustPaint) assert.ok(l.painted > 400 && l.rim > 20, `${name}: painted (${l.painted}), its pink edge (${l.rim})`);
  };
  for (let kind = 0; kind < WALL.kinds; kind++) {
    for (let s = 0; s <= 0.5; s += 1 / 30) check(`clump ${kind} rising ${s.toFixed(2)}`, wallClumpPainted(kind, s));
    check(`clump ${kind} standing`, wallClumpPainted(kind, 3), true);
    check(`clump ${kind} floor`, wallClumpPainted(kind, 3, 'floor'));
    for (let g = 0; g < WALL.sink; g += 0.1) check(`clump ${kind} sinking ${g.toFixed(1)}`, wallClumpPainted(kind, 3, 'air', g));
    for (let b = 0; b < WALL.regrow + 0.2; b += 0.2) check(`clump ${kind} splintered ${b.toFixed(1)}`, wallClumpPainted(kind, 3, 'air', -1, b));
    // (standing over the knight's head: its top at least 70 picture pixels over its foot; the knight is about 60)
    const p = wallClumpPainted(kind, 3).px;
    let top = p.h;
    for (let y = 0; y < p.h && top === p.h; y++) for (let x = 0; x < p.w; x++) if (p.d[(y * p.w + x) * 4 + 3]) {
      top = y;
      break;
    }
    assert.ok(128 - top >= 66, `clump ${kind}: ${128 - top} pixels high`);
  }
  // the marks on the floor: the enemy's pink, no cyan
  const px = new Px(1200, 680);
  const at = (x: number, y: number, z = 0): [number, number] => [600 + 32 * (x - y), 340 + 16 * (x + y) - z];
  for (const m of [0.2, 0.8, 1.3]) paintEdgeMark(px, at, 0.6, m, 0);
  for (const m of [0.3, 0.7, GORE9_HIT + 0.1, GORE9_HIT + 0.7]) paintGoreMark(px, at, m, [0, 0], 0);
  check('the marks', { px });
  for (const k of [0, 0.5, 1]) check(`lane ${k}`, lanePainted(1, 0, k, 3, CHARGE9.lane, CHARGE9.half));
});

test('5. the numbers: the clearing closing in, his bounds, his gore and his charge bigger and faster', () => {
  // THE WOOD CLOSES IN at 3/4, 1/2 and 1/4 of his life, and stays: 17 by 20 tiles, then 80, 60 and 40 hundredths of it
  assert.ok(CLEARING.rx * 2 === 17 && CLEARING.ry * 2 === 20, 'the arena 17 by 20');
  assert.equal([1, 0.8, 0.76, 0.75, 0.6, 0.5, 0.3, 0.25, 0.1].map(clearingAt).join(), '1,1,1,0.8,0.8,0.6,0.6,0.4,0.4', 'the clearing by his life');
  assert.ok(inClearing(0, 0, 0.4) && inClearing(2.5, 0, 0.4) && !inClearing(3.2, 0, 0.4) && !inClearing(6, 0, 0.6) && inClearing(6, 0, 0.8), 'inside the clearing, clear of its wall');
  const thrown = thrownIn(0, 4.2, 0.4) as [number, number];
  assert.ok(thrown && inClearing(thrown[0], thrown[1], 0.4) && Math.abs(Math.hypot(...thrown) - (4.0 - CLOSE.throwIn - WALL.band)) < 1e-6 && thrownIn(0, 1, 0.4) === null, 'caught by the wall: thrown in');
  for (const k of [0.8, 0.6, 0.4]) {
    const w = wallAt(k);
    assert.ok(w.every((c) => Math.abs(outOf(c.x, c.y, k) - 1) < 1e-6), `the wall at ${k}: on its edge`);
    for (let i = 0; i < w.length; i++) {
      const j = (i + 1) % w.length;
      assert.ok(Math.hypot(w[i].x - w[j].x, w[i].y - w[j].y) <= WALL.step * 1.1, `the wall at ${k}: no gap`);
    }
  }
  assert.ok(WALL.high >= 70 && CLOSE_HIT - CLOSE.mark >= 1.2 && clumpHigh(WALL.rise + 0.01) === 1 && clumpHigh(WALL.rise + WALL.ripple + 0.01) === 1, 'the wall over his head, its edge marked well before');
  // HIS BOUNDS: fast and long (the old stot 3 tiles a second, 1.1 tiles a bound, 16 high)
  assert.ok(STOT9.pace >= 5 && STOT9.pace * STOT9.bound >= 3.2 && STOT9.high >= 40, 'great bounds');
  let low = Infinity;
  let high = -Infinity;
  for (let t = 0; t < STOT9.period; t += 1 / 30) {
    const P = pose9('walk', t);
    low = Math.min(low, ...P.feet.map((f) => f[2]));
    high = Math.max(high, ...P.feet.map((f) => f[2]));
  }
  assert.ok(low === 0 && high >= 40, 'all four hoofs down, and high in the air');
  assert.ok(STARE.knock >= 1 && STARE.long >= 1.5, 'standing to stare, a heavy landing first');
  // HIS GORE: a sweep before him, further and wider than the game's own strip
  // (the game's rules: game/act1_rules/stag.ts STAG.gore.reach, its antlers' sweep before its forefeet: 66 + 19 of its lengths)
  const oldReach = (STAG_GORE.reach + STAG_FEET[0][0]) / TILE3;
  assert.ok(GORE9.reach >= oldReach * 1.35 && GORE9.arc >= 140 && STAG_GORE.reach === 66, `the gore's sweep out to ${GORE9.reach} (old ${oldReach.toFixed(2)})`);
  assert.ok(Math.abs(GORE9.lunge * TILE3 + STAG_FEET[0][0] - 36.6) < 0.5, 'his forefeet thrown a stride forward');
  // HIS CHARGE: twice as fast, further, its lane marked well before
  assert.ok(CHARGE9.pace >= 2 * STAG_CHARGE.pace && CHARGE9_CARRIED >= 7.5 && CHARGE9.lane >= CHARGE9_CARRIED + 1 && CHARGE9.half > 0.8 && CHARGE9_HIT - CHARGE9.aim >= 0.8, 'the charge fast and long, its lane marked well before');
  assert.ok(charge9Carry(CHARGE9_STRIKE[0]) === 0 && Math.abs(charge9Carry(CHARGE9.long) - CHARGE9_CARRIED) < 1e-9, 'carried only from its strike to its crash');
});
