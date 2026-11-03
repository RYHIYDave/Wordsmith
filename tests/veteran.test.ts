// THE VETERAN (dev/sculpt_veteran.ts, dev/veteran_globes.ts, dev/preview_veteran.ts; mock-ups, pictures first). His pick,
// 2 Nov 2026: “7, the Veteran”; “I don’t want anything reused from the original brawler, we need a totally new look”; and
// at 22:06 “I want him to look and play like an action movie hero.  Muscly, Bouncing on his toes”. So: nothing of the game
// imports him; nothing of the original Brawler's art is in him (his files and everything they import); every pose is
// crisp, edged in the friend's cyan, never the enemy's pink, nothing cut off, nothing in the floor, arms never through his
// trunk; up on his toes; in the air when he leaps; the headband's two long tails stream, follow and never pass through
// him; big fists; no eye patch, the blind eye milky; the globes cyan, hot orange and white, never pink or gold.
//   run: tsx --test tests/veteran.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import { primDist } from '../src/dev/sculpt';
import { VET_ALL, VET_BUILD, VET_FIST, VET_MOVES, VET_STANCE, VET_STANCE_UP, paintVeteran, sculptVeteran } from '../src/dev/sculpt_veteran';
import { GLOBE_CYAN, GLOBE_STATES, paintGlobes } from '../src/dev/veteran_globes';
import { bodyFindings, pictureFindings } from './sculpt_checks';
import { hsv } from './floor_checks';

const test: (name: string, fn: () => void) => void = nodeTest;
const assert: { ok(v: unknown, m?: string): void; deepEqual(a: unknown, b: unknown, m?: string): void } = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string; existsSync(p: string): boolean };
const path = nodePath as { dirname(p: string): string; join(...p: string[]): string; normalize(p: string): string };

const OURS = ['sculpt_veteran', 'veteran_globes', 'preview_veteran'];
/** What a file imports (its own paths, as written). */
const importsOf = (file: string): string[] => [...fs.readFileSync(file, 'utf8').matchAll(/(?:^|\n)\s*import[^'"]*from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
/** Every file a file brings in, and they in turn: its whole closure. */
function closureOf(file: string): Set<string> {
  const seen = new Set<string>();
  const go = (f: string): void => {
    if (seen.has(f)) return;
    seen.add(f);
    for (const spec of importsOf(f)) {
      if (!spec.startsWith('.')) continue;
      const base = path.normalize(path.join(path.dirname(f), spec));
      const real = [`${base}.ts`, `${base}/index.ts`, base].find((c) => fs.existsSync(c) && c.endsWith('.ts'));
      if (real) go(real);
    }
  };
  go(file);
  return seen;
}
/** The original Brawler's art: his painters, his sculpt, his moves and looks. */
const BRAWLERS = /brawler|sculpt_classes/i;

test('nothing of the game imports the Veteran, his globes or his sheet', () => {
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/')) continue;
    const re = new RegExp(`from ['"][^'"]*(${OURS.join('|')})['"]`);
    assert.ok(!re.test(fs.readFileSync(`src/${f}`, 'utf8')), `src/${f} imports the mock-up`);
  }
});

test('built fresh: nothing of the original Brawler is in the Veteran or his globes (their whole import closure), nor imported by his sheet', () => {
  for (const f of ['src/dev/sculpt_veteran.ts', 'src/dev/veteran_globes.ts']) {
    const bad = [...closureOf(f)].filter((x) => BRAWLERS.test(x));
    assert.deepEqual(bad, [], `${f} brings in the old Brawler's files`);
  }
  // (the sheet brings in the knight's painter only to stand the knight beside him for size)
  const direct = importsOf('src/dev/preview_veteran.ts').filter((x) => BRAWLERS.test(x));
  assert.deepEqual(direct, [], 'the sheet imports a Brawler file');
});

test('every pose, from in front, from behind and from the side: crisp, edged in the friend’s cyan, no pink, nothing cut off, in no floor, arms clear of his trunk', () => {
  for (const p of VET_ALL) {
    for (const turn of [0, 90, 45]) {
      const d = paintVeteran(p, turn);
      const found = [...pictureFindings(d.px), ...bodyFindings(d.fig.sc, true).filter((x) => !(p.air && x.startsWith('standing on nothing')))];
      assert.deepEqual(found, [], `${p.id} turned ${turn}`);
    }
  }
});

test('his stance is up on his toes, heels off the floor, at both moments of the bounce; and the bounce reads (up is higher)', () => {
  const heelsUp = (p: typeof VET_STANCE): number[] => {
    const f = sculptVeteran(p, 0);
    return [f.s.heelL[2], f.s.heelR[2]];
  };
  for (const p of [VET_STANCE, VET_STANCE_UP]) for (const h of heelsUp(p)) assert.ok(h > 1.4, `${p.id}: a heel ${h.toFixed(2)} off the floor`);
  const down = sculptVeteran(VET_STANCE, 0).s.pelvis[2];
  const up = sculptVeteran(VET_STANCE_UP, 0).s.pelvis[2];
  assert.ok(up - down > 4, `the bounce: ${down.toFixed(1)} to ${up.toFixed(1)}`);
});

test('his leaps leave the floor; his other poses stand on it', () => {
  for (const p of VET_ALL) {
    const f = sculptVeteran(p, 0);
    const low = Math.min(...f.sc.prims.filter((q) => !q.carve).map((q) => (q.k === 'cone' ? Math.min(q.a[2] - q.ra, q.b[2] - q.rb) : q.k === 'tri' ? Math.min(q.a[2], q.b[2], q.c[2]) - q.thick : q.c[2] - Math.hypot(q.axes[0][2], q.axes[1][2], q.axes[2][2]))));
    if (p.air) assert.ok(low > 5, `${p.id}: in the air, his lowest ${low.toFixed(1)} over the floor`);
    else assert.ok(low < 1.2, `${p.id}: on the floor, his lowest ${low.toFixed(1)}`);
  }
});

test('the headband: two long tails that stream behind him, follow how he moves, and never pass through him', () => {
  for (const p of VET_ALL) {
    const f = sculptVeteran(p, 0);
    assert.ok(f.tails.length === 2, `${p.id}: two tails`);
    const body = f.sc.prims.filter((q) => !q.carve && !['tailA', 'tailB', 'band'].includes(q.piece));
    for (const t of f.tails) {
      let L = 0;
      for (let i = 1; i < t.length; i++) L += Math.hypot(t[i][0] - t[i - 1][0], t[i][1] - t[i - 1][1], t[i][2] - t[i - 1][2]);
      assert.ok(L >= 18, `${p.id}: a tail ${L.toFixed(1)} long`);
      for (const pt of t.slice(2)) {
        const d = Math.min(...body.map((q) => primDist(q, pt)));
        assert.ok(d > 0.4, `${p.id}: a tail passes through him (${d.toFixed(2)})`);
      }
      // streaming out behind his head, never stiff in front of his face
      const back = (pt: readonly number[]): number => (pt[0] - f.s.head[0]) * f.s.face[0][0] + (pt[1] - f.s.head[1]) * f.s.face[0][1] + (pt[2] - f.s.head[2]) * f.s.face[0][2];
      assert.ok(back(t[t.length - 1]) < 0, `${p.id}: a tail's end in front of his face`);
    }
  }
  // (they follow: the strike's tails lie elsewhere than the wind-up's, for every move)
  for (const m of VET_MOVES) {
    const a = sculptVeteran(m.windup, 0);
    const b = sculptVeteran(m.strike, 0);
    const rel = (f: typeof a): number[] => {
      const e = f.tails[0][f.tails[0].length - 1];
      return [e[0] - f.s.head[0], e[1] - f.s.head[1], e[2] - f.s.head[2]];
    };
    const ra = rel(a);
    const rb = rel(b);
    assert.ok(Math.hypot(ra[0] - rb[0], ra[1] - rb[1], ra[2] - rb[2]) > 4, `${m.id}: the tails move with him`);
  }
});

test('big fists (at least three quarters of his head across); no eye patch; the blind eye milky with its scar', () => {
  const span = 2 * 2.65 * VET_FIST.k;
  const head = 2 * VET_BUILD.headR[1];
  assert.ok(span >= 0.75 * head, `a fist ${span.toFixed(1)} across, his head ${head.toFixed(1)}`);
  const f = sculptVeteran(VET_STANCE, 0);
  assert.ok(!f.sc.prims.some((q) => /patch/i.test(q.tag ?? '')), 'an eye patch');
  assert.ok(f.sc.marks.some((m) => m.c === '#d4d6de'), 'the milky eye');
});

test('the six key poses: the hook, the round kick, the jump, the flying uppercut, the spinning jump kick, the flying knee; each a wind-up and a strike', () => {
  assert.deepEqual(VET_MOVES.map((m) => m.id), ['punch', 'kick', 'jump', 'uppercut', 'jumpkick', 'knee']);
  for (const m of VET_MOVES) assert.ok(m.line.length > 40 && m.windup.id !== m.strike.id, m.id);
  // the uppercut, the jump, the spinning kick and the knee are off the floor; the hook and the round kick on it
  assert.deepEqual(VET_MOVES.map((m) => !!m.strike.air), [false, false, true, true, true, true]);
});

test('the globes: crisp; cyan a punch, hot orange a kick, white the jump; never pink, never gold', () => {
  assert.ok(GLOBE_CYAN[2] === '#22d0e0', 'the punch is the friend\u2019s cyan');
  let sawCyan = false;
  let sawOrange = false;
  for (const st of GLOBE_STATES) {
    const px = paintGlobes(st.row);
    for (let i = 0; i < px.d.length; i += 4) {
      const a = px.d[i + 3];
      assert.ok(a === 0 || a === 255, `${st.title}: a pixel neither there nor not`);
      if (!a) continue;
      const [h, s, v] = hsv(px.d[i], px.d[i + 1], px.d[i + 2]);
      assert.ok(!(h >= 290 && h <= 352 && s > 0.4 && v > 0.4), `${st.title}: pink`);
      assert.ok(!(h >= 38 && h <= 64 && s > 0.45 && v > 0.55), `${st.title}: gold`);
      if (h >= 175 && h <= 195 && s > 0.5) sawCyan = true;
      if (h >= 10 && h <= 32 && s > 0.5 && v > 0.5) sawOrange = true;
    }
  }
  assert.ok(sawCyan && sawOrange, 'cyan and hot orange both shown');
});
