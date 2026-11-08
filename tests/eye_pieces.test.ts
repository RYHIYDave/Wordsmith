// THE SWAMP COLOSSUS'S MOVES, PART 3B: THE PIECES ON THE STONE, SMASHED BY HIS FIRST SHOVEL (art/eye_pieces.ts; a mock-up behind EYE2,
// off). The owner, 8 Nov 2026, asked what becomes of the pieces on the stone in the tentacles' way (offered as: the first shovel breaks
// them, chunks flying; rubble left after): “Smashed by the first sweep (Recommended)”. His rules: nothing passes through anything,
// “Everything drawn should not just look like shapes.  That’s the rule”, nothing ruled. What this holds:
//   1. the switch is off and nothing of the game imports the pieces' smash;
//   2. THE PIECES BACK ON THE STONE AT THE START (the two broken columns at the back corners, the mossy stones by the back edge and toward
//      the near edge, the fallen drums by the near edge), as the arena lays them; each smashed by the first shovel;
//   3. NO HOOK THROUGH A PIECE WHOLE: before its hit, no hook's tube in its body in any frame of the first shovel; at the hit, the hook
//      jolted back as it ploughs in, never through it; broken from then on;
//   4. OVER THE RUBBLE: every hook of both shovels, as laid (ridden up over it), clear of the rubble lying at rest under it;
//   5. EACH ITS OWN BREAK: a column falls (across the screen, onto the stone) and breaks across in three, its plinth burst; the drum the
//      hook meets cracks in three and flies, the others roll on and crack in two; each mossy stone splits in two; every pixel of each
//      piece's picture in one of its fragments;
//   6. THE RUBBLE LOW, ON THE STONE, AT REST by the time the hooks ride over it; the Warrior never through a column's or a drum's pieces;
//   7. NOTHING RULED in the chunks and the rubble: no straight run over 12 game pixels, exactly across or up, in any fragment's outline,
//      along any break, in any chip;
//   8. THE NUMBERS, in the game's tiles: each hit, the chunks, the rubble's spread, the shake.
// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';
import { C_TILE, EYE2 } from '../src/art/eye_colossus';
import { STONE_BOX } from '../src/art/eye_arms';
import { EYE_FPS } from '../src/art/eye_moves';
import { SCRAPERS, SHOVEL, heroWorld, shovelFrame, sideOf } from '../src/art/eye_shovel';
import { fenPieces } from '../src/art/floor10';
import { CHIP_COUNT, COLUMN_FALL, HOOK_JOLT, LIFTS, PIECES, SMASH_SHAKE, brokenOf, chipAt, chipPicture, chipsOf, fragAt, fragRest, hookPoints, intoPiece, liftOver, partition, pieceHit, pieceHits, piecesFrame, rubbleOf } from '../src/art/eye_pieces';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  equal(a: unknown, b: unknown, msg?: string): void;
  ok(v: unknown, msg?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
declare const process: { stdout: { write(s: string): void } };
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };
paintWithoutCanvas();

const tiles = (v: number): string => (v / C_TILE).toFixed(2);
/** Each piece's picture, as the arena has it (picture pixels): how big, and which of its pixels are there. */
const ART = fenPieces();
function pictureOf(name: string): { w: number; h: number; alpha: Uint8Array } {
  const s = ART.find((p) => p.name === name);
  if (!s || !s.frames) throw new Error(name);
  const im = paintingOf(s.frames[0]) as unknown as { w: number; h: number; d: Uint8ClampedArray };
  const alpha = new Uint8Array(im.w * im.h);
  for (let q = 0; q < im.w * im.h; q++) alpha[q] = im.d[q * 4 + 3] >= 128 ? 1 : 0;
  return { w: im.w, h: im.h, alpha };
}
/** How long each piece has been smashed at frame `k` of a shovel (seconds; less than 0, whole): the next shovel's, all long since. */
const sinceAt = (shot: 's1' | 's2', k: number): number[] => pieceHits().map((h) => (shot === 's2' ? 60 : h ? (k - h.k) / EYE_FPS : -1));

test('1. the switch is off; nothing of the game imports the pieces\' smash', () => {
  assert.equal(EYE2.on, false, 'EYE2 is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f === 'art/eye_pieces.ts') continue;
    if (/from ['"][^'"]*eye_pieces['"]/.test(fs.readFileSync(path.join('src', f), 'utf8'))) users.push(f);
  }
  assert.equal(users.join(', '), '', 'nothing of the game imports art/eye_pieces.ts');
});

test('2. the pieces back on the stone at the start, each smashed by the first shovel', () => {
  const kinds = PIECES.map((P) => P.kind).sort().join(',');
  assert.equal(kinds, 'column,column,drums,stones,stones', 'two broken columns, two lots of mossy stones, the fallen drums');
  for (const P of PIECES) {
    assert.ok(P.x > STONE_BOX.x0 && P.x < STONE_BOX.x1 && P.y > STONE_BOX.y0 && P.y < STONE_BOX.y1, `${P.id} on the stone`);
    const im = pictureOf(P.name);
    assert.ok(im.w === P.pic.w && im.h === P.pic.h, `${P.id}: its picture as the arena has it (${im.w} x ${im.h})`);
    const F = piecesFrame('s1', 0);
    assert.ok(F.pieces.since.every((s) => s < 0), 'all whole at the start');
    const H = pieceHit(P);
    assert.ok(H && H.k > SCRAPERS[0].k0 && H.k < SHOVEL.frames, `${P.id} smashed by the first shovel (${H && H.k})`);
  }
  // (the columns at the back corners; the drums toward the near edge)
  const cols = PIECES.filter((P) => P.kind === 'column');
  assert.ok(cols.every((P) => Math.abs(P.x) > 0.8 * STONE_BOX.x1 && P.y - STONE_BOX.y0 < 2 * C_TILE), 'the columns at the back corners');
});

test('3. no hook through a piece whole: before its hit none in it; at its hit jolted back, ploughing in', () => {
  let least = Infinity;
  for (const P of PIECES) {
    const H = pieceHit(P);
    if (!H) continue;
    for (let k = SCRAPERS[0].k0; k < H.k; k++) for (let i = 0; i < SCRAPERS.length; i++) for (const q of hookPoints('left', i, k)) {
      const g = intoPiece(P, q);
      least = Math.min(least, g);
      assert.ok(g >= 0, `${P.id}: frame ${k}, hook ${i + 1} not in it before its hit (${g.toFixed(1)})`);
    }
    // (at its hit: the hook as laid, jolted back against the way it goes and down into it, ploughing in; never through)
    let deep = 0;
    for (const q of hookPoints('left', H.i, H.k)) {
      const j = [q[0] - H.dir * HOOK_JOLT.back[0], q[1], q[2] + HOOK_JOLT.up[0], q[3]];
      deep = Math.max(deep, -intoPiece(P, j));
    }
    const thick = Math.min(...P.body.map((b) => b.r));
    assert.ok(deep < 2 * thick, `${P.id}: ploughing in ${deep.toFixed(1)} at its hit, never through it (${(2 * thick).toFixed(0)} through)`);
    // (as laid: smashed as the hook reaches it, the hook jolted back)
    const F = piecesFrame('s1', H.k);
    const plain = shovelFrame('s1', H.k);
    assert.equal(F.pieces.since[PIECES.indexOf(P)], 0, `${P.id}: smashed as the hook reaches it`);
    // (back: against the way it goes, toward his end)
    assert.equal(H.dir, sideOf('left'), 'the hooks go toward his end');
    const jolt = -((F.arms[2 * H.i]?.dx ?? 0) - (plain.arms[2 * H.i]?.dx ?? 0)) * H.dir;
    assert.ok(jolt >= HOOK_JOLT.back[0] - 0.01, `${P.id}: the hook jolted back as it ploughs in (${jolt.toFixed(1)})`);
    process.stdout.write(`  ${P.id}: hit at frame ${H.k} by hook ${H.i + 1}, ploughing ${deep.toFixed(1)} in\n`);
  }
  process.stdout.write(`  before their hits, the hooks at the nearest ${least.toFixed(1)} from a piece\n`);
});

test('4. over the rubble: every hook of both shovels, as laid, clear of the rubble at rest under it', () => {
  let most = 0;
  let worst = Infinity;
  for (const shot of ['s1', 's2'] as const) {
    const e = shot === 's1' ? 'left' : 'right';
    for (let k = SCRAPERS[0].k0; k < SHOVEL.frames; k++) {
      piecesFrame(shot, k);
      const since = sinceAt(shot, k);
      for (let i = 0; i < SCRAPERS.length; i++) {
        const T = hookPoints(e, i, k);
        if (!T.length) continue;
        const lift = LIFTS.get(`${shot}.${k}.${i}`) ?? 0;
        most = Math.max(most, lift);
        const left = liftOver(T.map((q) => [q[0], q[1], q[2] + lift, q[3]]), since);
        worst = Math.min(worst, -left);
        assert.ok(left <= 0.5, `${shot} ${k}: hook ${i + 1} over the rubble (${left.toFixed(1)} into it)`);
      }
    }
  }
  assert.ok(most <= 25, `riding up at the most ${most.toFixed(1)} of his lengths`);
  process.stdout.write(`  the hooks ride up over the rubble at the most ${most.toFixed(1)} of his lengths (${tiles(most)} tiles)\n`);
});

test('5. each its own break: a column falls and breaks across, the drums roll and crack, the mossy stones split', () => {
  for (const P of PIECES) {
    const B = brokenOf(P);
    const moves = B.frags.map((f) => f.move);
    if (P.kind === 'column') {
      assert.equal(moves.filter((m) => m === 'fall').length, 3, `${P.id}: its shaft breaks across in three`);
      assert.ok(moves.filter((m) => m === 'fly').length >= 3, `${P.id}: its plinth burst`);
      assert.ok(B.fall && Math.abs(B.fall[0]) >= 0.5, `${P.id}: falls across the screen (${B.fall?.map((v) => v.toFixed(2))})`);
      for (const f of B.frags) if (f.move === 'fall') {
        const a = fragAt(P, f, 3);
        assert.ok(a.gone === 0 && a.y > STONE_BOX.y0 && a.y < STONE_BOX.y1 && Math.abs(a.x) < STONE_BOX.x1, `${P.id}: its shaft lying on the stone`);
      }
      // (falling faster and faster)
      const top = B.frags.find((f) => f.move === 'fall');
      if (top) {
        const a = fragAt(P, top, COLUMN_FALL * 0.5).fall;
        const b = fragAt(P, top, COLUMN_FALL * 0.99).fall;
        assert.ok(a < b / 2, `${P.id}: toppling faster and faster (${a.toFixed(2)}, ${b.toFixed(2)})`);
      }
    } else if (P.kind === 'drums') {
      assert.equal(moves.filter((m) => m === 'fly').length, 3, `${P.id}: the one the hook meets cracks in three and flies`);
      assert.equal(moves.filter((m) => m === 'roll').length, 4, `${P.id}: the others roll on, cracking in two`);
    } else assert.equal(moves.filter((m) => m === 'fly').length, 6, `${P.id}: each of its three stones split in two`);
    const im = pictureOf(P.name);
    const part = partition(P, im.w, im.h, im.alpha);
    let lost = 0;
    for (let q = 0; q < im.w * im.h; q++) if ((im.alpha[q] ? 1 : 0) !== (part[q] >= 0 ? 1 : 0)) lost++;
    assert.equal(lost, 0, `${P.id}: every pixel of its picture in one fragment`);
    const used = new Set(part);
    // (each that moves; what is left where it stood may be nothing)
    for (const f of B.frags) if (f.move !== 'stay') assert.ok(used.has(f.n), `${P.id}: fragment ${f.n} has pixels`);
  }
});

test('6. the rubble low, on the stone, at rest by the time the hooks ride over it', () => {
  for (const P of PIECES) {
    for (const R of rubbleOf(P)) {
      assert.ok(R.h <= 24, `${P.id}: its rubble low (${R.h.toFixed(0)} high)`);
      assert.ok(R.x > STONE_BOX.x0 && R.x < STONE_BOX.x1 && R.y > STONE_BOX.y0 && R.y < STONE_BOX.y1, `${P.id}: its rubble on the stone (${R.x.toFixed(0)}, ${R.y.toFixed(0)})`);
    }
    for (const f of brokenOf(P).frags) assert.ok(fragRest(P, f) < 1.6, `${P.id}: fragment ${f.n} at rest by ${fragRest(P, f).toFixed(2)} s`);
    for (const c of chipsOf(P)) assert.ok(chipAt(P, c, 1.6).rest, `${P.id}: chip ${c.n} at rest by 1.6 s`);
  }
  // (the Warrior never runs through a big piece of it, a column's or a drum's (he steps over the small stones and the chips): his
  // middle never nearer one than his own half-width, at either end, once it lies)
  let least = Infinity;
  const H = pieceHits();
  for (const e of ['left', 'right'] as const) for (let k = 0; k < SHOVEL.frames; k++) {
    const h = heroWorld(e, k);
    PIECES.forEach((P, p) => {
      const hp = H[p];
      if (e === 'left' && (!hp || k < hp.k + 40)) return;
      for (const R of rubbleOf(P)) {
        if (R.h < 14) continue;
        let d: number;
        if (R.a && R.b) {
          const vx = R.b[0] - R.a[0];
          const vy = R.b[1] - R.a[1];
          const u = Math.max(0, Math.min(1, ((h.x - R.a[0]) * vx + (h.y - R.a[1]) * vy) / (vx * vx + vy * vy)));
          d = Math.hypot(h.x - R.a[0] - vx * u, h.y - R.a[1] - vy * u) - R.r;
        } else d = Math.hypot(h.x - R.x, h.y - R.y) - R.r;
        least = Math.min(least, d);
        assert.ok(d > 12, `${e} ${k}: the Warrior not through ${P.id}'s rubble (${d.toFixed(1)})`);
      }
    });
  }
  process.stdout.write(`  the Warrior at the nearest ${least.toFixed(1)} of his lengths from a column's or a drum's pieces lying\n`);
});

/** The longest straight runs in a mask of edges, across and up. */
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

test('7. nothing ruled: in the fragments\' outlines, along their breaks, in the chips', () => {
  let frag = { across: 0, up: 0 };
  let brk = { across: 0, up: 0 };
  let chip = { across: 0, up: 0 };
  for (const P of PIECES) {
    const im = pictureOf(P.name);
    const part = partition(P, im.w, im.h, im.alpha);
    for (const f of brokenOf(P).frags) {
      const M = new Uint8Array(im.w * im.h);
      for (let q = 0; q < M.length; q++) M[q] = part[q] === f.n ? 1 : 0;
      const E = edgesOf(M, im.w, im.h);
      const r = { across: longestRun(E.H, im.w, im.h).across, up: longestRun(E.V, im.w, im.h).up };
      assert.ok(r.across <= RULED && r.up <= RULED, `${P.id}: fragment ${f.n}'s outline, no ruled edge (${r.up / 2} game px up, ${r.across / 2} across)`);
      frag = { across: Math.max(frag.across, r.across), up: Math.max(frag.up, r.up) };
    }
    // (the breaks: where one fragment meets another)
    const V = new Uint8Array(im.w * im.h);
    const H = new Uint8Array(im.w * im.h);
    for (let j = 0; j < im.h - 1; j++) for (let i = 0; i < im.w - 1; i++) {
      const q = j * im.w + i;
      if (part[q] >= 0 && part[q + 1] >= 0 && part[q] !== part[q + 1]) V[q] = 1;
      if (part[q] >= 0 && part[q + im.w] >= 0 && part[q] !== part[q + im.w]) H[q] = 1;
    }
    const b = { across: longestRun(H, im.w, im.h).across, up: longestRun(V, im.w, im.h).up };
    assert.ok(b.across <= RULED && b.up <= RULED, `${P.id}: its breaks, none ruled (${b.up / 2} game px up, ${b.across / 2} across)`);
    brk = { across: Math.max(brk.across, b.across), up: Math.max(brk.up, b.up) };
    for (const c of chipsOf(P)) {
      const w = 40;
      const M = new Uint8Array(w * w);
      for (const [di, dj] of chipPicture(c)) M[(20 + dj) * w + 20 + di] = 1;
      const E = edgesOf(M, w, w);
      chip = { across: Math.max(chip.across, longestRun(E.H, w, w).across), up: Math.max(chip.up, longestRun(E.V, w, w).up) };
    }
  }
  assert.ok(chip.across <= RULED && chip.up <= RULED, `the chips, none ruled (${chip.up / 2} game px up, ${chip.across / 2} across)`);
  process.stdout.write(`  the longest straight runs (game px): fragments' outlines ${frag.up / 2} up, ${frag.across / 2} across; breaks ${brk.up / 2} up, ${brk.across / 2} across; chips ${chip.up / 2} up, ${chip.across / 2} across\n`);
});

test('8. the numbers, in the game\'s tiles: each hit, the chunks, the rubble, the shake', () => {
  for (const P of PIECES) {
    const H = pieceHit(P);
    if (!H) continue;
    const B = brokenOf(P);
    const moved = B.frags.filter((f) => f.move !== 'stay');
    const far = Math.max(...moved.map((f) => fragAt(P, f, 6)).map((a) => Math.hypot(a.x - P.x, a.y - P.y)), ...chipsOf(P).map((c) => chipAt(P, c, 6)).map((a) => Math.hypot(a.x - P.x, a.y - P.y)));
    const settled = Math.max(...moved.map((f) => fragRest(P, f)), ...chipsOf(P).map((c) => {
      for (let s = 1 / EYE_FPS; s < 4; s += 1 / EYE_FPS) if (chipAt(P, c, s).rest) return s;
      return 4;
    }));
    const R = rubbleOf(P);
    const spread = Math.max(...R.map((r) => Math.hypot(r.x - P.x, r.y - P.y) + r.r));
    assert.ok(spread < 5 * C_TILE, `${P.id}: its rubble within 5 tiles of where it stood (${tiles(spread)})`);
    assert.equal(chipsOf(P).length, CHIP_COUNT[P.kind], `${P.id}: its chips`);
    process.stdout.write(`  ${P.id}: hit at frame ${H.k} (${(H.k / EYE_FPS).toFixed(2)} s), ${tiles(H.at[0] - STONE_BOX.x0)} tiles from the stone's left end, ${tiles(H.at[1] - STONE_BOX.y0)} from its back edge; ${moved.length} pieces and ${chipsOf(P).length} chips, the furthest ${tiles(far)} tiles, all settled by ${settled.toFixed(2)} s; its rubble spread ${tiles(spread)} tiles from where it stood\n`);
  }
  process.stdout.write(`  the shake: ${SMASH_SHAKE.smash} game px at each smash, dying away over ${SMASH_SHAKE.long} frames; a column's shaft landing ${SMASH_SHAKE.land} over ${SMASH_SHAKE.landLong} (${Math.round(COLUMN_FALL * EYE_FPS)} frames after its hit)\n`);
});
