// THE SWAMP COLOSSUS'S MOVES, PART 3: HIS SHOVEL (art/eye_shovel.ts, painted by art/eye_colossus.ts; a mock-up behind EYE2, off).
// The owner, 7 Nov 2026: shown the tentacles, “Yes, on to the shovel (Recommended)”; 20:29, “I’d also like it to submerge, and then pop
// up on a random end of the platform and try to shovel the player into its mouth.  Tentacles scrape down the platform and you find the
// gap in the top and bottom or dodge over.  If you get hit it knocks you closer to the mouth.  Get too close and it snaps shut for
// massive damage.  Goes for a few seconds, I’m thinking like a tight waveform pattern gets you through the hitboxes of the incoming
// tentacles”; 20:31, with his drawing, “P is the player, weaves up and down as the tentacles come in”. His rules: Movement 9 (a big held
// wind-up, a fast smeared strike, a big wind-down), “Action, like a movie”, nothing through anything, nowhere safe (“Yes, nowhere safe
// (Recommended)”). What this holds:
//   1. the switch is off and nothing of the game imports the shovel;
//   2. HIS END VIEWS: at the right end the left end's paintings of him and his tentacles flipped about his own middle (the owner, 8 Nov,
//      shown the mirror test: “Mirror it but save the old one just in case.”), the painted right end kept behind its own switch, off;
//      his maw on its side, clear of the stone in every frame he is there (his burst, his roar, his gape, his snap's lunge), and of the
//      tentacles; the Warrior never in him;
//   3. NOTHING THROUGH ANYTHING: each tentacle clear of the stone, of each other and of itself (never folding through itself), every frame;
//   4. NOWHERE SAFE, AND THE GAPS' PATH THROUGH: each tentacle sweeps the stone's whole length to his maw, one along each edge in turn,
//      reaching across all but its gap at the other edge; the Warrior never on a tentacle but where he is struck;
//   5. nothing cyan; the sparks the enemy's;
//   6. NEVER STILL: him, and every tentacle, in every frame;
//   7. NO LEAPS: but in the strikes (his burst, the snap) and the Warrior knocked flying;
//   8. THE CUES: he sinks quicker than he rose; the tell held over a second, the water boiling, the stone's end shuddering; the burst in
//      four smeared frames, the screen jolted; the roar; each scrape throwing sparks and grit and scoring the stone; the snap's twitch
//      held, its two smeared frames, held shut, the screen jolted; the Warrior struck, the screen jolted, knocked toward the mouth; back to
//      his place and into his stand;
//   9. THE NUMBERS, in the game's tiles: his maw's reach, the snap's, the gaps, the sweep;
//  10. NOTHING RULED (fix 1, his rule “Everything drawn should not just look like shapes.  That’s the rule”): no straight run over 12
//      game pixels, exactly across or up, in his maw's inside, in the water pouring off him (its sheets and its ropes), or in the marks
//      his tentacles' tips score in the stone; and those only where a tip has been.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
import { BLADE, CYAN, GLINT, SPARK } from '../src/art/kit';
import { rgba } from '../src/engine/px';
import { C_TILE, EYE2, MAT, paintColossus, turnedAt, turnedClear } from '../src/art/eye_colossus';
import type { ArmPose, ColossusPicture, ColossusPose } from '../src/art/eye_colossus';
import { EYE_ENTRANCE, EYE_FPS } from '../src/art/eye_moves';
import type { EyeFrame, EyeLayer } from '../src/art/eye_moves';
import { STONE_BOX, armStoneGap, armsGap, tubeOf } from '../src/art/eye_arms';
import { GAPE_SIDE, HOOK_IN, ORIENT, SHOVEL_PAINTED_RIGHT, SNAP_CLENCH, paintedAt, pourRope, pourSheet, scoreMarks, scorePath, scrapeAt, SCRAPE, SCRAPERS, SCRAPE_FRAMES, SCRAPE_V, SHOVEL, SHOVEL_COLOURS, SHOVEL_SHAKE, SNAP, SNAP_REACH, START_OUT, STOP_IN, SWEEP, atEnd, dropAt, heroStruck, heroWorld, lungeAt, openAt, placeOf, scraperAt, shovelFrame, sideAnim, sideOf, sidePose } from '../src/art/eye_shovel';
import type { End } from '../src/art/eye_shovel';

interface Assert {
  equal(a: unknown, b: unknown, msg?: string): void;
  ok(v: unknown, msg?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
declare const process: { stdout: { write(s: string): void } };
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

const SHOTS: Array<['s1' | 's2', End, boolean]> = [['s1', 'left', true], ['s2', 'right', false]];
const tiles = (v: number): string => (v / C_TILE).toFixed(2);
/** The tentacles of a frame, laid where they are (the world's: slid along, down as far as they are; a layer flipped about his middle,
 *  the right end's, flipped), each with its layer's key. */
function tentaclesIn(F: EyeFrame): Array<{ key: string; a: ArmPose }> {
  return F.arms.filter((L): L is EyeLayer => !!L && (L.key.startsWith('AH') || L.key.startsWith('AB'))).map((L) => {
    const a = (L.pose as ColossusPose).arms[0];
    const fx = (x: number): number => (L.mirror ? -x : x) + (L.dx ?? 0);
    return { key: L.key, a: { ...a, path: a.path.map((q) => [fx(q[0]), q[1], q[2] - L.drop, q[3]]) } };
  });
}
/** A pose but where his eye looks (at the Warrior, who weaves his own way at each end). */
const unGazed = (p: unknown): unknown => JSON.parse(JSON.stringify(p), (k, v) => (k === 'gaze' ? undefined : v));
/** Him at an end at frame `k`, all of him (his jaws, his drool, his tongue), as the painter takes him; and where his middle is. At the
 *  right end, the left end's painting (`flip`: what is there is seen in it flipped). */
function himAt(e: End, k: number, snap: boolean): { pose: ColossusPose; at: [number, number]; flip: (p: readonly number[]) => number[] } {
  const pe = paintedAt(e);
  const L = lungeAt(k, snap);
  const P = sidePose(pe, sideAnim(e, k, snap, pe), 'all', L);
  const at = placeOf(pe);
  const flip = (p: readonly number[]): number[] => (pe === e ? [...p] : [-p[0], ...p.slice(1)]);
  return { pose: { ...P, drop: P.drop + dropAt(k) }, at: [at[0] - sideOf(pe) * L[0], at[1]], flip };
}
/** How far his solid comes in over the stone from his end (his lengths; less than 0 none of him), at heights up to `top` over it. */
function reachOver(e: End, k: number, snap: boolean, top = 320): { x: number; low: number; y0: number; y1: number } {
  const s = sideOf(e);
  const pts: number[][] = [];
  for (let x = 0; x <= 240; x += 4) for (let y = STONE_BOX.y0; y <= STONE_BOX.y1; y += 12) for (let z = 2; z <= top; z += 8) pts.push([s * STONE_BOX.x1 - s * x, y, z]);
  const H = himAt(e, k, snap);
  const v = turnedAt(H.pose, H.at, pts.map(H.flip));
  const r = { x: -1, low: -1, y0: Infinity, y1: -Infinity };
  pts.forEach((p, i) => {
    if (v[i] >= 0) return;
    const x = s * (s * STONE_BOX.x1 - p[0]);
    r.x = Math.max(r.x, x);
    if (p[2] <= 80) r.low = Math.max(r.low, x);
    r.y0 = Math.min(r.y0, p[1]);
    r.y1 = Math.max(r.y1, p[1]);
  });
  return r;
}

const FRIEND = new Set<string>([...CYAN, ...BLADE, ...SPARK, GLINT, '#22d0e0', '#28dcf0'].map((c) => rgba(c).slice(0, 3).join(',')));
function hue(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return -1;
  let h: number;
  if (max === r) h = ((g - b) / (max - min)) * 60;
  else if (max === g) h = (2 + (b - r) / (max - min)) * 60;
  else h = (4 + (r - g) / (max - min)) * 60;
  return (h + 360) % 360;
}
function cyanGlow(r: number, g: number, b: number): boolean {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max < 120 || max - min < 0.4 * max) return false;
  const h = hue(r, g, b);
  return h >= 160 && h <= 205;
}
function cyanIn(p: ColossusPicture): number {
  const d = p.px.d;
  let n = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const grey = d[i] === d[i + 1] && d[i + 1] === d[i + 2];
    if ((FRIEND.has(`${d[i]},${d[i + 1]},${d[i + 2]}`) && !grey) || cyanGlow(d[i], d[i + 1], d[i + 2])) n++;
  }
  return n;
}

test('1. the switch is off; nothing of the game imports the shovel', () => {
  assert.equal(EYE2.on, false, 'EYE2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    // (the pieces it smashes, art/eye_pieces.ts, its own mock-up's: tests/eye_pieces.test.ts holds that nothing of the game imports it)
    if (!f.endsWith('.ts') || f === 'art/eye_shovel.ts' || f === 'art/eye_pieces.ts') continue;
    if (/from ['"][^'"]*eye_shovel['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(', '), '', 'nothing of the game imports art/eye_shovel.ts');
});

test('2. his end views: the right end the left flipped (the painted one kept); clear of the stone and of the tentacles; the Warrior never in him', () => {
  // (THE MIRROR: at the right end, each layer of him and his tentacles the left end's own painting, flipped about his middle, slid the
  // other way: in every frame but the snap's, which is the first shovel's, at the left end, only; at his place, as there)
  assert.equal(SHOVEL_PAINTED_RIGHT.on, false, 'the painted right end behind its switch, off');
  let flipped = 0;
  for (let k = 0; k < SHOVEL.frames; k++) {
    if (k >= SNAP.at - 2 && k < SNAP.at + SNAP.frames + 2) continue;
    const l = shovelFrame('s1', k);
    const r = shovelFrame('s2', k);
    const L0 = [l.jaws, l.spit, l.tongue, ...l.arms, ...l.smear];
    const R0 = [r.jaws, r.spit, r.tongue, ...r.arms, ...r.smear];
    assert.equal(R0.length, L0.length, `${k}: as many layers at each end`);
    R0.forEach((R, i) => {
      const A = L0[i];
      assert.equal(!!R, !!A, `${k}: layer ${i} at both ends or neither`);
      if (!R || !A) return;
      // (at his place, between the ends, him and his tentacles as they are there: the same)
      if (!/^(V|AH|AB)/.test(A.key)) {
        assert.equal(JSON.stringify({ ...R, pose: unGazed(R.pose) }), JSON.stringify({ ...A, pose: unGazed(A.pose) }), `${k}: ${A.key} at his place the same`);
        return;
      }
      assert.ok(R.mirror === true && !A.mirror, `${k}: ${R.key} flipped at the right end`);
      assert.equal(R.key, A.key, `${k}: the left end's painting`);
      assert.equal(JSON.stringify(unGazed(R.pose)), JSON.stringify(unGazed(A.pose)), `${k}: ${R.key} as painted`);
      assert.ok(Math.abs((R.dx ?? 0) + (A.dx ?? 0)) < 1e-6 && R.drop === A.drop && R.back === A.back, `${k}: ${R.key} slid the other way (${R.dx}, ${A.dx})`);
      flipped++;
    });
  }
  // (THE PAINTED RIGHT END, KEPT: its own paintings, turned its own way, behind its switch)
  assert.ok(JSON.stringify(ORIENT.left) !== JSON.stringify(ORIENT.right), 'the painted right end turned its own way');
  SHOVEL_PAINTED_RIGHT.on = true;
  const pr = shovelFrame('s2', 120);
  SHOVEL_PAINTED_RIGHT.on = false;
  const l = shovelFrame('s1', 120);
  assert.ok(pr.jaws.key.startsWith('VJ.r') && !pr.jaws.mirror && pr.arms.every((L) => !L || !/^A[HB]/.test(L.key) || (!L.mirror && L.key.includes('.r.'))), `the painted right end still there (${pr.jaws.key})`);
  assert.ok(JSON.stringify((l.jaws.pose as ColossusPose).orient) !== JSON.stringify((pr.jaws.pose as ColossusPose).orient), 'from each end, his own way round');
  process.stdout.write(`  the right end: ${flipped} layers, each the left end's flipped; the painted right end kept (${pr.jaws.key})\n`);
  let worstStone = Infinity;
  let worstTube = Infinity;
  let worstHero = Infinity;
  for (const [shot, e, snap] of SHOTS) {
    for (let k = 0; k < SHOVEL.frames; k++) {
      if (!atEnd(k)) continue;
      const inSnap = snap && k >= SNAP.at - 2 && k < SNAP.at + SNAP.frames;
      if (!(k % 2 === 0 || inSnap || (k >= SHOVEL.burst[0] && k < SHOVEL.burst[1] + 2))) continue;
      const H = himAt(e, k, snap);
      const tubes = tentaclesIn(shovelFrame(shot, k)).map((t) => t.a.path.map(H.flip));
      const c = turnedClear(H.pose, H.at, STONE_BOX, tubes);
      worstStone = Math.min(worstStone, c.stone);
      assert.ok(c.stone > 0, `${shot} ${k}: clear of the stone (${c.stone.toFixed(1)} at ${c.where.map((v) => v.toFixed(0)).join(',')})`);
      c.tubes.forEach((g, i) => {
        worstTube = Math.min(worstTube, g);
        assert.ok(g > 0, `${shot} ${k}: tentacle ${i} clear of him (${g.toFixed(1)})`);
      });
      // (the Warrior: his column, where he stands or flies, never in him)
      if (inSnap || k % 6 === 0) {
        const h = heroWorld(e, k);
        const pts: number[][] = [];
        for (const dx of [-14, 0, 14]) for (const dy of [-10, 0, 10]) for (let z = 2; z <= 46; z += 11) pts.push([h.x + dx, h.y + dy, z + h.lift]);
        const m = Math.min(...turnedAt(H.pose, H.at, pts.map(H.flip)));
        worstHero = Math.min(worstHero, m);
        assert.ok(m > 0, `${shot} ${k}: the Warrior not in him (${m.toFixed(1)})`);
      }
    }
  }
  process.stdout.write(`  the least gaps: him and the stone ${worstStone.toFixed(1)}, him and the tentacles ${worstTube.toFixed(1)}, him and the Warrior ${worstHero.toFixed(1)}\n`);
});

test('3. nothing through anything: the tentacles clear of the stone, of each other and of themselves', () => {
  let stone = Infinity;
  let each = Infinity;
  let self = Infinity;
  const seen = new Set<string>();
  for (const [shot] of SHOTS) for (let k = 0; k < SHOVEL.frames; k++) {
    const T = tentaclesIn(shovelFrame(shot, k));
    T.forEach((t) => {
      const g = armStoneGap(t.a);
      stone = Math.min(stone, g.gap);
      assert.ok(g.gap > 0, `${shot} ${k}: ${t.key} clear of the stone (${g.gap.toFixed(1)} at ${g.at.map((v) => v.toFixed(0)).join(',')})`);
    });
    for (let i = 0; i < T.length; i++) for (let j = i + 1; j < T.length; j++) {
      // (a head and its own body are one tentacle, joined in the water)
      if (T[i].key.slice(3, 6) === T[j].key.slice(3, 6) && T[i].key[1] !== T[j].key[1]) continue;
      const g = armsGap(T[i].a, T[j].a);
      each = Math.min(each, g);
      assert.ok(g > 0, `${shot} ${k}: ${T[i].key} and ${T[j].key} clear of each other (${g.toFixed(1)})`);
    }
    // (each painting never folding through itself: what is far apart along it, apart in space)
    for (const t of T) {
      if (seen.has(t.key)) continue;
      seen.add(t.key);
      const A = tubeOf(t.a);
      for (let i = 0; i < A.n; i += 2) for (let j = i + 2; j < A.n; j += 2) {
        const ri = A.p[i * 4 + 3];
        const rj = A.p[j * 4 + 3];
        if (A.s[j] - A.s[i] < 1.6 * (ri + rj) + 8) continue;
        const g = Math.hypot(A.p[i * 4] - A.p[j * 4], A.p[i * 4 + 1] - A.p[j * 4 + 1], A.p[i * 4 + 2] - A.p[j * 4 + 2]) - ri - rj;
        self = Math.min(self, g);
        assert.ok(g > 0, `${t.key}: clear of itself (${g.toFixed(1)})`);
      }
    }
  }
  process.stdout.write(`  the least gaps: the stone ${stone.toFixed(1)}, each other ${each.toFixed(1)}, itself ${self.toFixed(1)} (${seen.size} paintings)\n`);
});

test('4. nowhere safe, and the gaps\' path through: the sweeps, the gaps, the Warrior never on a tentacle', () => {
  const depth = STONE_BOX.y1 - STONE_BOX.y0;
  // (one along each edge in turn)
  SCRAPERS.forEach((S, i) => {
    if (i) assert.ok(S.edge !== SCRAPERS[i - 1].edge, `tentacle ${i + 1} along the other edge from the one before`);
  });
  for (const [shot, e] of SHOTS) {
    const s = sideOf(e);
    const reachOf: number[] = [];
    SCRAPERS.forEach((Sc, i) => {
      // (its sweep: from past the far end to his maw, the whole length of the stone)
      const a = scraperAt(e, i, Sc.k0 + SCRAPE.up);
      const b = scraperAt(e, i, Sc.k0 + SCRAPE.up + SWEEP - 1);
      assert.ok(a && b, `${shot}: tentacle ${i + 1} sweeps`);
      if (!a || !b) return;
      assert.ok(Math.abs(a.X - -s * (STONE_BOX.x1 + START_OUT)) < 1, `${shot}: tentacle ${i + 1} starts past the far end (${a.X.toFixed(0)})`);
      assert.ok(Math.abs(b.X - s * (STONE_BOX.x1 - STOP_IN)) < SCRAPE_V + 1, `${shot}: it sweeps to his maw (${b.X.toFixed(0)})`);
      // (how far across it reaches, low enough to meet the Warrior (70 of his lengths high), in its sweep, and so its gap)
      let reach = 0;
      for (let k = Sc.k0 + SCRAPE.up; k < Sc.k0 + SCRAPE.up + SWEEP; k++) for (const t of tentaclesIn(shovelFrame(shot, k))) {
        if (!t.key.startsWith('AH') || t.key[5] !== Sc.edge[0]) continue;
        const A = tubeOf(t.a);
        for (let q = 0; q < A.n; q++) {
          const x = A.p[q * 4];
          const y = A.p[q * 4 + 1];
          const z = A.p[q * 4 + 2];
          const r = A.p[q * 4 + 3];
          if (Math.abs(x) > STONE_BOX.x1 || z - r > 70) continue;
          reach = Math.max(reach, Sc.edge === 'back' ? y + r - STONE_BOX.y0 : STONE_BOX.y1 - (y - r));
        }
      }
      reachOf.push(reach);
      const gap = depth - reach;
      assert.ok(reach > HOOK_IN - 10 && gap > 1.5 * C_TILE && gap < 6 * C_TILE, `${shot}: tentacle ${i + 1} reaches ${tiles(reach)} tiles across from its edge, its gap ${tiles(gap)} tiles`);
    });
    // (the Warrior: never on a tentacle low enough to meet him, but in the frames he is struck)
    let worst = Infinity;
    let at = '';
    for (let k = 0; k < SHOVEL.frames; k++) {
      if (heroStruck(e, k)) continue;
      const h = heroWorld(e, k);
      for (const t of tentaclesIn(shovelFrame(shot, k))) {
        const A = tubeOf(t.a);
        for (let q = 0; q < A.n; q++) {
          const z = A.p[q * 4 + 2];
          const r = A.p[q * 4 + 3];
          if (z - r > 70 + h.lift || z + r < -2) continue;
          const d = Math.hypot(A.p[q * 4] - h.x, A.p[q * 4 + 1] - h.y) - r;
          if (d < worst) {
            worst = d;
            at = `${k} ${t.key}`;
          }
        }
      }
    }
    assert.ok(worst > 20, `${shot}: the Warrior never on a tentacle (${worst.toFixed(0)} at ${at})`);
    process.stdout.write(`  ${shot}: each reaches across ${reachOf.map(tiles).join(', ')} tiles (gaps ${reachOf.map((v) => tiles(depth - v)).join(', ')}); the Warrior at the least ${worst.toFixed(0)} from one\n`);
  }
  // (struck: once, in the left one's film, by the near edge's tentacle, and knocked toward the mouth)
  const before = heroWorld('left', 158);
  const after = heroWorld('left', 172);
  assert.ok(Math.abs(after.x - STONE_BOX.x0) < Math.abs(before.x - STONE_BOX.x0) - 150, `knocked toward the mouth (${(Math.abs(before.x - STONE_BOX.x0)).toFixed(0)} to ${(Math.abs(after.x - STONE_BOX.x0)).toFixed(0)} from his end)`);
});

test('5. nothing cyan; the sparks the enemy\'s', () => {
  const Z = 1 / 3;
  const side = { w: Math.round(760 * Z), h: Math.round(800 * Z), ax: Math.round(360 * Z), ay: Math.round(460 * Z), zoom: Z, raw: true };
  const arm = { w: Math.round(1100 * Z), h: Math.round(540 * Z), ax: Math.round(550 * Z), ay: Math.round(-60 * Z), zoom: Z, raw: true };
  const body = { w: Math.round(1300 * Z), h: Math.round(560 * Z), ax: Math.round(-230 * Z), ay: Math.round(-60 * Z), zoom: Z, raw: true };
  const F = shovelFrame('s1', 80);
  const G = shovelFrame('s1', SNAP.at + SNAP.twitch + 1);
  const T = shovelFrame('s1', 110);
  for (const [name, L, fr] of [['his roar', F.jaws, side], ['his drool', F.spit, side], ['his tongue-eye', F.tongue, side], ['his snap', G.jaws, side]] as const) {
    if (!L) continue;
    assert.equal(cyanIn(paintColossus(L.pose as ColossusPose, fr)), 0, `${name}: nothing cyan`);
  }
  const head = T.arms.find((L) => L && L.key.startsWith('AH'));
  const bod = T.arms.find((L) => L && L.key.startsWith('AB'));
  assert.ok(head && bod, 'a tentacle sweeping');
  if (head) assert.equal(cyanIn(paintColossus(head.pose as ColossusPose, arm)), 0, 'a tentacle\'s hook: nothing cyan');
  if (bod) assert.equal(cyanIn(paintColossus(bod.pose as ColossusPose, body)), 0, 'its body: nothing cyan');
  for (const c of SHOVEL_COLOURS.spark) {
    const [r, g, b] = rgba(c);
    assert.ok(!FRIEND.has(`${r},${g},${b}`) && !cyanGlow(r, g, b), `${c}: not cyan`);
    const h = hue(r, g, b);
    assert.ok(h >= 15 && h <= 60, `${c}: a spark white-hot to gold (its hue ${h.toFixed(0)})`);
  }
});

test('6. never still: him and every tentacle, in every frame', () => {
  for (const [shot] of SHOTS) {
    let prev = shovelFrame(shot, 0);
    for (let k = 1; k < SHOVEL.frames; k++) {
      const F = shovelFrame(shot, k);
      // (him: his layers' paintings or where they lie change; but while he is under the water, out of sight, the water over him moves)
      const his = (G: EyeFrame): string => JSON.stringify([G.jaws, G.spit, G.tongue].map((L) => L && [L.key, L.drop, L.dx ?? 0]));
      const hidden = F.water.boil > 0.05 || F.water.sunk > 0.98;
      assert.ok(his(F) !== his(prev) || hidden, `${shot} ${k}: he moves`);
      // (each tentacle there before and now: its hook writhes every frame)
      const heads = (G: EyeFrame): Map<string, string> => new Map(G.arms.filter((L): L is EyeLayer => !!L && L.key.startsWith('AH')).map((L) => [L.key.slice(3, 6), `${L.key} ${L.dx} ${L.drop}`]));
      const a = heads(prev);
      for (const [w, v] of heads(F)) if (a.has(w)) assert.ok(a.get(w) !== v, `${shot} ${k}: tentacle ${w} moves`);
      prev = F;
    }
  }
});

test('7. no leaps: but in the strikes and the Warrior knocked flying', () => {
  for (const [shot, e, snap] of SHOTS) {
    let worstHero = 0;
    let worstDrop = 0;
    let burst = 0;
    let cam = 0;
    let lunge = 0;
    let strike = 0;
    for (let k = 1; k < SHOVEL.frames; k++) {
      const a = heroWorld(e, k - 1);
      const b = heroWorld(e, k);
      if (b.act !== 'knock' && a.act !== 'knock') worstHero = Math.max(worstHero, Math.hypot(b.x - a.x, b.y - a.y));
      // (his rise and fall; his burst up through the water, four smeared frames, by rule fast)
      const d = Math.abs(dropAt(k) - dropAt(k - 1));
      const fast = k >= SHOVEL.burst[0] && k <= SHOVEL.burst[1];
      if (fast) burst = Math.max(burst, d);
      else worstDrop = Math.max(worstDrop, d);
      cam = Math.max(cam, Math.abs((shovelFrame(shot, k).camX ?? 0) - (shovelFrame(shot, k - 1).camX ?? 0)));
      // (his snap: but in its two frames of strike, his lunge and his jaws ease)
      if (snap) {
        const la = lungeAt(k - 1, true);
        const lb = lungeAt(k, true);
        const st = Math.hypot(lb[0] - la[0], lb[1] - la[1]) + 100 * Math.abs(lb[2] - la[2]) + 100 * Math.abs(lb[3] - la[3]) + 100 * Math.abs(openAt(k, true) - openAt(k - 1, true));
        const f = k - SNAP.at;
        if (f === SNAP.twitch || f === SNAP.twitch + 1) strike = Math.max(strike, st);
        else lunge = Math.max(lunge, st);
      }
    }
    assert.ok(worstHero <= 8.5, `${shot}: the Warrior no faster than a run or a roll (${worstHero.toFixed(1)} of his lengths a frame)`);
    assert.ok(worstDrop < 0.5 * burst, `${shot}: his sinking and rising without a leap (${worstDrop.toFixed(1)} a frame; his burst ${burst.toFixed(1)})`);
    assert.ok(cam <= 26, `${shot}: the camera without a jump (${cam} picture pixels a frame)`);
    if (snap) assert.ok(lunge < 0.5 * strike, `${shot}: his snap eased but in its strike (${lunge.toFixed(1)}; the strike ${strike.toFixed(1)})`);
    // (the tentacles: as fast as they sweep, drawn back faster, never a jump)
    for (let i = 0; i < SCRAPERS.length; i++) {
      let m = 0;
      for (let k = SCRAPERS[i].k0 + 1; k < SCRAPERS[i].k0 + SCRAPE_FRAMES; k++) {
        const a = scraperAt(e, i, k - 1);
        const b = scraperAt(e, i, k);
        if (a && b) m = Math.max(m, Math.abs(b.X - a.X));
      }
      assert.ok(m <= 3.2 * SCRAPE_V, `${shot}: tentacle ${i + 1} no faster than drawn back (${m.toFixed(1)} a frame; its sweep ${SCRAPE_V.toFixed(1)})`);
    }
    process.stdout.write(`  ${shot}: the Warrior ${worstHero.toFixed(1)} a frame at the most, his sinking ${worstDrop.toFixed(1)} (burst ${burst.toFixed(1)}), the camera ${cam} px${snap ? `, his snap ${lunge.toFixed(1)} (strike ${strike.toFixed(1)})` : ''}\n`);
  }
});

test('8. the cues: the sink, the tell held, the burst, the roar, the scrapes, the snap, the hit, back to his place', () => {
  const S = SHOVEL;
  const rise = EYE_ENTRANCE.rise[1] - EYE_ENTRANCE.rise[0];
  assert.ok(S.sink[1] - S.sink[0] < rise / 2, `he sinks quicker than he rose (${S.sink[1] - S.sink[0]} frames; his rise ${rise})`);
  assert.ok((S.tell[1] - S.tell[0]) / EYE_FPS >= 1, `the tell held over a second (${((S.tell[1] - S.tell[0]) / EYE_FPS).toFixed(2)} s)`);
  assert.equal(S.burst[1] - S.burst[0], 4, 'the burst four frames');
  for (const [shot, e, snap] of SHOTS) {
    const s = sideOf(e);
    let shook = 0;
    for (let k = S.tell[0]; k < S.tell[1]; k++) {
      const F = shovelFrame(shot, k);
      assert.ok((F.water.boil > 0 || k === S.tell[0]) && F.sfx && F.sfx.tell !== null, `${shot} ${k}: the water boiling off the end through the tell`);
      assert.ok(Math.sign(F.water.at?.[0] ?? 0) === s, `${shot} ${k}: off the ${e} end`);
      if (Math.max(...F.shake.map(Math.abs)) > 0) shook++;
    }
    assert.ok(shook >= 0.6 * (S.tell[1] - S.tell[0]), `${shot}: the screen rumbling through the tell (${shook} of its ${S.tell[1] - S.tell[0]} frames)`);
    for (let k = S.burst[0] + 1; k < S.burst[1]; k++) assert.ok(shovelFrame(shot, k).smear.some((L) => L && L.key.startsWith('VJ')), `${shot} ${k}: the burst smeared`);
    const jolt = Math.max(...[S.burst[1] - 1, S.burst[1], S.burst[1] + 1].map((k) => Math.max(...shovelFrame(shot, k).shake.map(Math.abs))));
    assert.ok(jolt >= SHOVEL_SHAKE.burst - 1, `${shot}: the screen jolted as he bursts up (${jolt})`);
    assert.ok(openAt(70, snap) > openAt(S.roar[1] + 5, snap), `${shot}: the roar wider than his gape`);
    // (each scrape: sparks and grit off its tip while it is on the stone, the line it scores)
    SCRAPERS.forEach((Sc, i) => {
      const mid = Sc.k0 + SCRAPE.up + Math.floor(SWEEP / 2);
      const F = shovelFrame(shot, mid);
      assert.ok(F.sfx && F.sfx.scrapes.some((x) => Math.abs(x.y - (Sc.edge === 'back' ? STONE_BOX.y0 : STONE_BOX.y1)) < 300), `${shot} ${mid}: tentacle ${i + 1} scraping`);
      assert.ok(F.sfx && F.sfx.scores.length > 0, `${shot} ${mid}: the stone scored`);
    });
    // (his place again, in his stand)
    const last = shovelFrame(shot, S.frames - 1);
    assert.ok(last.jaws.key.startsWith('J') && last.jaws.drop === 0 && (last.camX ?? 0) === 0, `${shot}: back at his place, in his stand`);
  }
  // (the snap: the twitch held, wider; two frames of strike, smeared; held shut; the clash)
  for (let f = 0; f < SNAP.twitch; f++) assert.ok(openAt(SNAP.at + f, true) > GAPE_SIDE.gape - 0.05, `the twitch, frame ${f}: his jaws flexing wider`);
  assert.ok(openAt(SNAP.at + SNAP.twitch - 1, true) > GAPE_SIDE.gape + 0.1, 'held wide at its end');
  assert.equal(SNAP.strike, 2, 'the strike two frames');
  for (let f = SNAP.twitch; f < SNAP.twitch + SNAP.strike; f++) assert.ok(shovelFrame('s1', SNAP.at + f).smear.some((L) => L && L.key.startsWith('VJ')), `the strike, frame ${f}: smeared`);
  assert.equal(openAt(SNAP.at + SNAP.twitch + 1, true), 0, 'slammed shut on the strike\'s last frame');
  for (let f = SNAP.twitch + 2; f < SNAP.twitch + SNAP.strike + SNAP.held; f++) assert.equal(openAt(SNAP.at + f, true), SNAP_CLENCH, `frame ${f}: held clenched, his teeth clashed`);
  const clash = Math.max(...shovelFrame('s1', SNAP.at + SNAP.twitch + 1).shake.map(Math.abs));
  assert.ok(clash >= SHOVEL_SHAKE.snap - 1, `the clash jolts the screen (${clash})`);
  // (the Warrior struck: the screen jolted)
  const hit = Math.max(...[159, 160].map((k) => Math.max(...shovelFrame('s1', k).shake.map(Math.abs))));
  assert.ok(hit >= SHOVEL_SHAKE.hit - 1, `the Warrior struck, the screen jolted (${hit})`);
});

test('9. the numbers, in the game\'s tiles: his maw\'s reach, the snap\'s, the gaps, the sweep', () => {
  // (his maw gaping at the end: as near as he comes, over the water, not the stone)
  const gape = reachOver('left', 120, true);
  assert.ok(gape.x < 0, `gaping, his maw at the stone's end, not over it (${gape.x})`);
  // (the snap shut: how far in over the stone, and how low)
  const shut = reachOver('left', SNAP.at + SNAP.twitch + 1, true);
  assert.ok(Math.abs(shut.x - SNAP_REACH) <= 8, `the snap reaches ${shut.x} of his lengths over the stone (SNAP_REACH ${SNAP_REACH})`);
  assert.ok(shut.low > 0, `down to the Warrior's height (${shut.low} in at 80 high and under)`);
  // (the Warrior, rolled clear, beyond its reach as it strikes)
  const h = heroWorld('left', SNAP.at + SNAP.twitch + 1);
  assert.ok(Math.abs(h.x - STONE_BOX.x0) > SNAP_REACH + 20, `the Warrior just escaping (${Math.abs(h.x - STONE_BOX.x0).toFixed(0)} from his end)`);
  const sweep = SCRAPE_V * EYE_FPS;
  assert.ok(Math.abs(sweep / C_TILE - 12) < 0.01, `the sweep 12 tiles a second (${(sweep / C_TILE).toFixed(2)})`);
  process.stdout.write(`  his place ${tiles(Math.abs(placeOf('left')[0]) - STONE_BOX.x1)} tiles off the end; the snap ${tiles(shut.x)} tiles in over the stone (${tiles(shut.low)} at the Warrior's height), across ${tiles(shut.y0 - STONE_BOX.y0)} to ${tiles(shut.y1 - STONE_BOX.y0)} tiles of its ${tiles(STONE_BOX.y1 - STONE_BOX.y0)}; the sweep ${(sweep / C_TILE).toFixed(1)} tiles a second over ${tiles(STONE_BOX.x1 - STONE_BOX.x0 + START_OUT - STOP_IN)} tiles (${(SWEEP / EYE_FPS).toFixed(2)} s)\n`);
});

/** The longest straight run (picture pixels) of marked pixels, exactly across (`d` 1) or up (`d` the width), in a mask `w` wide. */
function longestRun(E: Uint8Array, w: number, h: number): { across: number; up: number } {
  let across = 0;
  let up = 0;
  for (let j = 0; j < h; j++) {
    let r = 0;
    for (let i = 0; i < w; i++) {
      r = E[j * w + i] ? r + 1 : 0;
      across = Math.max(across, r);
    }
  }
  for (let i = 0; i < w; i++) {
    let r = 0;
    for (let j = 0; j < h; j++) {
      r = E[j * w + i] ? r + 1 : 0;
      up = Math.max(up, r);
    }
  }
  return { across, up };
}
/** The edges of a mask (picture pixels): where it meets what is not it, across (for runs up) and up (for runs across). */
function edgesOf(M: Uint8Array, w: number, h: number): { V: Uint8Array; H: Uint8Array } {
  const V = new Uint8Array(w * h);
  const H = new Uint8Array(w * h);
  for (let j = 0; j < h - 1; j++) for (let i = 0; i < w - 1; i++) {
    const q = j * w + i;
    if (M[q] !== M[q + 1]) V[q] = 1;
    if (M[q] !== M[q + w]) H[q] = 1;
  }
  return { V, H };
}
// (12 game pixels: two picture pixels to a game pixel)
const RULED = 24;

test('10. nothing ruled: in his maw\'s inside, the water pouring off him, the marks scored in the stone', () => {
  // HIS MAW'S INSIDE (his throat, the hollows of his jaws, their gum), at the game's size: as he roars at the left end, gaping at the
  // right, twitching before the snap. Its edges with his flesh, and between its own parts or across a line, never a straight run
  // (teeth, his tongue and what hangs off him are their own shapes)
  const IN = new Set<number>([MAT.throat, MAT.maw, MAT.gum]);
  const OWN = new Set<number>([MAT.tooth, MAT.tongue, MAT.strand, MAT.goo, MAT.gob]);
  for (const [shot, k] of [['s1', 82], ['s2', 120], ['s1', SNAP.at + 3]] as const) {
    const w = 760;
    const h = 800;
    const P = paintColossus(shovelFrame(shot, k).jaws.pose as ColossusPose, { w, h, ax: 360, ay: 460, zoom: 1, raw: true });
    const V = new Uint8Array(w * h);
    const H = new Uint8Array(w * h);
    // (a tooth's own outline, its line drawn round it where it stands in front of the inside, is the tooth's)
    const near2 = (q: number): boolean => {
      for (let dj = -2; dj <= 2; dj++) for (let di = -2; di <= 2; di++) if (OWN.has(P.mat[q + dj * w + di])) return true;
      return false;
    };
    const own = (q: number): boolean => OWN.has(P.mat[q]) || (!!P.seam && P.seam[q] === 1 && near2(q));
    for (let j = 2; j < h - 3; j++) for (let i = 2; i < w - 3; i++) {
      const q = j * w + i;
      if (!P.kind[q]) continue;
      for (const [d, E] of [[1, V], [w, H]] as const) {
        const r = q + d;
        if (!P.kind[r] || own(q) || own(r)) continue;
        const a = P.kind[q] === 1 && IN.has(P.mat[q]);
        const b = P.kind[r] === 1 && IN.has(P.mat[r]);
        if (!a && !b) continue;
        const inkA = P.seam ? P.seam[q] : 0;
        const inkB = P.seam ? P.seam[r] : 0;
        if (a !== b || P.mat[q] !== P.mat[r] || inkA !== inkB) E[q] = 1;
      }
    }
    const up = longestRun(V, w, h).up;
    const across = longestRun(H, w, h).across;
    assert.ok(up <= RULED && across <= RULED, `${shot} ${k}: his maw's inside, no ruled edge (the longest straight runs ${up / 2} game px up, ${across / 2} across)`);
    process.stdout.write(`  ${shot} ${k}: his maw's inside, the longest straight runs ${up / 2} game px up, ${across / 2} across\n`);
  }
  // THE WATER POURING OFF HIM: its sheets over him (a stretch of him 300 picture pixels square, every third frame of it), and its ropes
  // (each as the tool draws it, its blobs)
  let sheet = { across: 0, up: 0 };
  for (let k = SHOVEL.burst[0]; k < SHOVEL.burst[0] + 50; k += 3) {
    const w = 300;
    const M = new Uint8Array(w * w);
    for (let j = 0; j < w; j++) for (let i = 0; i < w; i++) M[j * w + i] = pourSheet(400 + i, 100 + j, k);
    const E = edgesOf(M, w, w);
    const r = { across: longestRun(E.H, w, w).across, up: longestRun(E.V, w, w).up };
    sheet = { across: Math.max(sheet.across, r.across), up: Math.max(sheet.up, r.up) };
  }
  assert.ok(sheet.across <= RULED && sheet.up <= RULED, `the sheets of water off him, no ruled edge (${sheet.up / 2} game px up, ${sheet.across / 2} across)`);
  let rope = { across: 0, up: 0 };
  for (let seed = 0; seed < 40; seed++) for (const age of [0, 0.2, 0.5, 0.9]) {
    const w = 40;
    const h = 200;
    const M = new Uint8Array(w * h);
    for (const B of pourRope(seed * 31 + 7, 180, age, 1 - age / 1.4)) {
      const rr = Math.max(0.5, B.r);
      for (let dj = -Math.ceil(rr); dj <= Math.ceil(rr); dj++) for (let di = -Math.ceil(rr); di <= Math.ceil(rr); di++) {
        if (di * di + dj * dj * 0.6 > rr * rr + 0.3) continue;
        const x = Math.round(20 + B.di + di);
        const y = Math.round(4 + B.dj + dj);
        if (x >= 0 && y >= 0 && x < w && y < h) M[y * w + x] = 1;
      }
    }
    const E = edgesOf(M, w, h);
    rope = { across: Math.max(rope.across, longestRun(E.H, w, h).across), up: Math.max(rope.up, longestRun(E.V, w, h).up) };
  }
  assert.ok(rope.across <= RULED && rope.up <= RULED, `the ropes of water off him, no ruled edge (${rope.up / 2} game px up, ${rope.across / 2} across)`);
  // THE MARKS SCORED IN THE STONE: each tip's gouges, every few frames of both films, as the tool draws them; only where its tip has been
  let marks = { across: 0, up: 0 };
  const SEEN = 2 / Math.sqrt(3);
  for (const [shot, e] of SHOTS) for (let i = 0; i < SCRAPERS.length; i++) for (let k = SCRAPERS[i].k0; k < SCRAPERS[i].k0 + SCRAPE_FRAMES + 120; k += 7) {
    const pts = scorePath(e, i, k);
    if (!pts.length) continue;
    // (never ahead of its tip, nor where it has not been)
    const A = scraperAt(e, i, Math.min(k, SCRAPERS[i].k0 + SCRAPE.up + SWEEP - 1));
    if (A) {
      const tip = scrapeAt(e, SCRAPERS[i].edge, 0, A.X);
      for (const [x] of pts) assert.ok(sideOf(e) * (x - tip[0]) <= 30, `${shot} ${k}: tentacle ${i + 1}'s marks only where its tip has been (${x.toFixed(0)}, its tip at ${tip[0].toFixed(0)})`);
    }
    const w = 900;
    const h = 120;
    const M = new Uint8Array(w * h);
    const y0 = pts[0][1];
    for (const G of scoreMarks(i, pts)) {
      if (G.kind === 'grit' || G.a <= 0) continue;
      const i0 = 450 + G.x0 * SEEN;
      const j0 = 60 + (G.y0 - y0) / Math.sqrt(3);
      const i1 = 450 + G.x1 * SEEN;
      const j1 = 60 + (G.y1 - y0) / Math.sqrt(3);
      const m = Math.max(1, Math.round(Math.hypot(i1 - i0, j1 - j0)));
      for (let q = 0; q <= m; q++) {
        const x = Math.round(i0 + ((i1 - i0) * q) / m);
        const y = Math.round(j0 + ((j1 - j0) * q) / m);
        // (a smear as wide as it is)
        for (let d = 0; d < (G.kind === 'slime' ? Math.round(G.w / Math.sqrt(3)) : 1); d++) if (x >= 0 && y + d >= 0 && x < w && y + d < h) M[(y + d) * w + x] = 1;
      }
    }
    marks = { across: Math.max(marks.across, longestRun(M, w, h).across), up: Math.max(marks.up, longestRun(M, w, h).up) };
  }
  assert.ok(marks.across <= RULED && marks.up <= RULED, `the marks scored in the stone, no ruled line (${marks.across / 2} game px across, ${marks.up / 2} up)`);
  process.stdout.write(`  the water off him: sheets ${sheet.up / 2} up, ${sheet.across / 2} across; ropes ${rope.up / 2} up, ${rope.across / 2} across; the marks in the stone ${marks.across / 2} across (game px)\n`);
});
