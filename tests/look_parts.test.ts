// THE FLOORS' LOOK BUILDERS A PART AT A TIME (the queue's make-floors-look-builders-in-parts; main.ts LOAD_SLICE): FLOOR 1'S TOMB
// and FLOOR 4'S CHAPEL each made all at once under the loading screen (1.1 to 1.5 s in Chrome, measured by the Loading-frames
// chat), now a part a step. Held here:
//   1. floor 1's and floor 4's own lists made a piece a step (art/floor1.ts wardenPieceSteps, art/floor4.ts ossuaryPieceSteps): the
//      same pieces, by name and kind, every picture the same pixel for pixel as the list made at once; nothing left put by;
//   2. THE TOMB made a part a step (art/tomb.ts tombSteps): every picture of its walls, its hall, its tiles and its pieces the same,
//      pixel for pixel, as the tomb made at once; nothing left put by; no step makes the whole tomb but the last;
//   3. THE CHAPEL the same (art/chapel.ts chapelSteps);
//   4. art/floors.ts lookPieceSteps(1) and (4) are those parts, then the look's pieces;
//   5. FLOORS 6 TO 20 (which take look 4 for their traps): the traps' art (lookHazards) does not make floor 4's pieces until a hole,
//      a plate or a slot is asked for, and then gives the floor's own, as before;
//   6. ACT 1'S AND ACT 2'S FLOORS (render/act1_pieces.ts act1PieceSteps): each of their lists a piece a step, then the list, then the
//      floor's pieces: a step for every piece, nothing left put by, the floor's pieces those of its lists made at once. (That each
//      list's makers paint what the list painted before, every picture and every field, was checked once against the code before
//      this change: docs/requests/look_builders_in_parts.md.)
//   run: tsx --test tests/look_parts.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { LoadStep } from '../src/engine/steps';
import type { Sprite } from '../src/engine/px';
import type { Piece } from '../src/art/floorkit';
import { forgetMade as forgetWarden, wardenPieceSteps, wardenPieces, wardenPiecesHeld } from '../src/art/floor1';
import { forgetMade as forgetOssuary, ossuaryPieceSteps, ossuaryPieces, ossuaryPiecesHeld } from '../src/art/floor4';
import { TOMB, forgetTomb, makeTombArt, tombPartsHeld, tombSteps } from '../src/art/tomb';
import { CHAPEL, chapelPartsHeld, chapelSteps, forgetMade as forgetChapel, makeChapelArt } from '../src/art/chapel';
import { forgetPieces, lookHazards, lookPieceSteps, lookPieces } from '../src/art/floors';
import { FLOOR_SETS } from '../src/game/first5';
import { act1PieceSteps, act1Pieces, forgetAct1 } from '../src/render/act1_pieces';
import { campPieceCount, campPieces, campPiecesHeld } from '../src/art/act1_camp';
import { redoubtPieceCount, redoubtPieces, redoubtPiecesHeld } from '../src/art/redoubt';
import { quarryPieceCount, quarryPieces, quarryPiecesHeld } from '../src/art/floor6';
import { millracePieceCount, millracePieces, millracePiecesHeld } from '../src/art/floor13';
import { hushSetPieceCount, hushSetPieces, hushSetPiecesHeld } from '../src/art/act2_set';
import { paintWithoutCanvas, paintingOf } from './helpers';

paintWithoutCanvas();
// (the tomb and the chapel are on in the game, main.ts; off by default where a test does not say)
TOMB.on = true;
CHAPEL.on = true;

/** Every step done, as main.ts runSteps does them (one that gives back more has them done next); how many there were. */
function runAll(steps: LoadStep[]): number {
  const q = [...steps];
  let n = 0;
  while (q.length) {
    const more = q.shift()!();
    n++;
    if (more && more.length) q.unshift(...more);
  }
  return n;
}
/** The same picture, made again: the same size, anchor and every pixel. */
function same(a: Sprite, b: Sprite, what: string): void {
  assert.ok(a !== b, `${what}: made again, not the same object`);
  assert.equal(a.w, b.w, `${what}: width`);
  assert.equal(a.h, b.h, `${what}: height`);
  assert.equal(a.ax, b.ax, `${what}: anchor x`);
  assert.equal(a.ay, b.ay, `${what}: anchor y`);
  const pa = paintingOf(a).d;
  const pb = paintingOf(b).d;
  assert.equal(pa.length, pb.length, `${what}: its painting's size`);
  let differ = 0;
  for (let i = 0; i < pa.length; i++) if (pa[i] !== pb[i]) differ++;
  assert.equal(differ, 0, `${what}: pixels unlike`);
}
function sameList(a: readonly Sprite[] | undefined, b: readonly Sprite[] | undefined, what: string): number {
  assert.equal(a?.length ?? 0, b?.length ?? 0, `${what}: frames`);
  for (let i = 0; i < (a?.length ?? 0); i++) same(a![i], b![i], `${what} ${i}`);
  return a?.length ?? 0;
}
/** Two lists of pieces the same: names, kinds, shadows, every picture. How many pictures. */
function samePieces(a: readonly Piece[], b: readonly Piece[], what: string): number {
  assert.deepEqual(b.map((p) => `${p.name}|${p.kind}|${p.shadow ?? ''}`), a.map((p) => `${p.name}|${p.kind}|${p.shadow ?? ''}`), `${what}: the same pieces`);
  let n = 0;
  a.forEach((p, i) => {
    const q = b[i];
    n += sameList(p.frames, q.frames, `${what} ${p.name} frames`);
    n += sameList(p.left, q.left, `${what} ${p.name} left`);
    n += sameList(p.right, q.right, `${what} ${p.name} right`);
    assert.equal(p.spots?.length ?? 0, q.spots?.length ?? 0, `${what} ${p.name}: spots`);
    p.spots?.forEach((s, j) => {
      assert.deepEqual([q.spots![j].du, q.spots![j].dv], [s.du, s.dv], `${what} ${p.name} spot ${j}`);
      n += sameList(s.left, q.spots![j].left, `${what} ${p.name} spot ${j} left`) + sameList(s.right, q.spots![j].right, `${what} ${p.name} spot ${j} right`);
    });
  });
  return n;
}
function sameFaces(a: Sprite[][], b: Sprite[][], what: string): number {
  assert.equal(a.length, b.length, `${what}: tiles`);
  return a.reduce((n, l, i) => n + sameList(l, b[i], `${what} ${i}`), 0);
}

test('1. floor 1\'s and floor 4\'s own lists made a piece a step are the lists made at once; nothing left put by', () => {
  forgetWarden();
  const w0 = wardenPieces();
  forgetWarden();
  const nw = runAll(wardenPieceSteps());
  assert.equal(nw, w0.length + 1, 'a step a piece, then the list');
  assert.ok(samePieces(w0, wardenPieces(), 'floor 1') > 50);
  assert.equal(wardenPiecesHeld(), 0);
  assert.equal(wardenPieceSteps().length, 0, 'none once made');
  forgetOssuary();
  const o0 = ossuaryPieces();
  forgetOssuary();
  runAll(ossuaryPieceSteps());
  assert.ok(samePieces(o0, ossuaryPieces(), 'floor 4') > 50);
  assert.equal(ossuaryPiecesHeld(), 0);
});

test('2. the tomb made a part a step is the tomb made at once, every picture; nothing left put by', () => {
  assert.equal(TOMB.on, true);
  forgetWarden();
  forgetTomb();
  const A = makeTombArt();
  forgetWarden();
  forgetTomb();
  const steps = tombSteps();
  assert.ok(steps.length > 60, `in parts (${steps.length} steps)`);
  // (no step but the last makes the whole tomb)
  for (const s of steps.slice(0, -1)) {
    s();
  }
  assert.ok(tombPartsHeld() > 0, 'its parts put by');
  steps[steps.length - 1]();
  const B = makeTombArt();
  assert.ok(A !== B);
  let n = sameFaces(A.faceLeft, B.faceLeft, 'the tomb faceLeft') + sameFaces(A.faceRight, B.faceRight, 'the tomb faceRight');
  n += sameFaces(A.hall.faceLeft, B.hall.faceLeft, 'the hall faceLeft') + sameFaces(A.hall.faceRight, B.hall.faceRight, 'the hall faceRight');
  n += samePieces(A.tiles, B.tiles, 'the tomb tiles') + samePieces(A.pieces, B.pieces, 'the tomb pieces');
  assert.ok(n > 400, `${n} pictures`);
  assert.equal(tombPartsHeld(), 0, 'nothing left put by');
  assert.equal(wardenPiecesHeld(), 0);
  assert.equal(tombSteps().length, 0, 'none once made');
});

test('3. the chapel made a part a step is the chapel made at once, every picture; nothing left put by', () => {
  assert.equal(CHAPEL.on, true);
  forgetOssuary();
  forgetChapel();
  const A = makeChapelArt();
  forgetOssuary();
  forgetChapel();
  const steps = chapelSteps();
  assert.ok(steps.length > 100, `in parts (${steps.length} steps)`);
  for (const s of steps.slice(0, -1)) s();
  assert.ok(chapelPartsHeld() > 0, 'its parts put by');
  steps[steps.length - 1]();
  const B = makeChapelArt();
  assert.ok(A !== B);
  let n = sameFaces(A.faceLeft, B.faceLeft, 'the chapel faceLeft') + sameFaces(A.faceRight, B.faceRight, 'the chapel faceRight');
  n += sameFaces(A.hall.faceLeft, B.hall.faceLeft, 'its hall faceLeft') + sameFaces(A.hall.faceRight, B.hall.faceRight, 'its hall faceRight');
  n += samePieces(A.tiles, B.tiles, 'the chapel tiles') + samePieces(A.pieces, B.pieces, 'the chapel pieces');
  assert.ok(n > 300, `${n} pictures`);
  assert.equal(chapelPartsHeld(), 0, 'nothing left put by');
  assert.equal(ossuaryPiecesHeld(), 0);
});

test('4. the loading screen\'s steps for looks 1 and 4 are those parts, then the look\'s pieces', () => {
  for (const k of [1, 4]) {
    forgetPieces(-1);
    forgetWarden();
    forgetOssuary();
    forgetTomb();
    forgetChapel();
    const steps = lookPieceSteps(k);
    assert.ok(steps.length > 60, `look ${k}: ${steps.length} steps`);
    runAll(steps);
    assert.ok(lookPieces(k).size > 50, `look ${k}: its pieces made`);
    assert.equal(lookPieceSteps(k).length, 0, `look ${k}: none once made`);
  }
});

test('5. floors 6 to 20: the traps\' art takes floor 4\'s pieces only when a hole, a plate or a slot is drawn, and the same ones', () => {
  forgetPieces(-1);
  forgetOssuary();
  forgetChapel();
  const traps = FLOOR_SETS[3].traps;
  const H = lookHazards(4, traps);
  H.spike(3);
  assert.equal(ossuaryPiecesHeld(), 0);
  assert.equal(chapelPartsHeld(), 0);
  assert.equal(lookPieceSteps(4).length > 1, true, 'floor 4\'s pieces not made by the traps\' art, nor by its spikes');
  const holes = H.holes(true);
  const P = lookPieces(4);
  assert.equal(holes, P.get(traps.holes)!.frames![1], 'a hole: the floor\'s own');
  assert.equal(H.plate(false), P.get(traps.plate)!.frames![0], 'a plate: the floor\'s own');
  assert.equal(H.slot(true), P.get(traps.slot)!.left![0], 'a slot: the floor\'s own');
});

test('6. Act 1\'s and Act 2\'s floors: each list a piece a step, then the list; nothing left put by; the floor\'s pieces those lists\'', () => {
  forgetAct1(-1);
  // (floor 6: the camp's, the redoubt's, nothing shared, the Quarry's own: each list's pieces a step each, then the list; then the floor)
  const six = act1PieceSteps(6);
  // (each list: a step a piece, the list's own step that takes them, the floor's step for the list; then the floor's pieces)
  assert.equal(six.length, campPieceCount() + 2 + redoubtPieceCount() + 2 + 1 + quarryPieceCount() + 2 + 1, 'floor 6: a step a piece');
  runAll(six);
  assert.deepEqual([campPiecesHeld(), redoubtPiecesHeld(), quarryPiecesHeld()], [0, 0, 0], 'nothing left put by');
  const names6 = [...act1Pieces(6).keys()];
  for (const p of [...campPieces(), ...redoubtPieces(), ...quarryPieces()]) assert.ok(names6.includes(p.name), `floor 6 has ${p.name}`);
  // (floor 13: the Hush's set and the Millrace's own)
  const thirteen = act1PieceSteps(13);
  assert.equal(thirteen.length, hushSetPieceCount() + 2 + millracePieceCount() + 2 + 1, 'floor 13: a step a piece');
  runAll(thirteen);
  assert.deepEqual([hushSetPiecesHeld(), millracePiecesHeld()], [0, 0]);
  const names13 = [...act1Pieces(13).keys()];
  for (const p of [...hushSetPieces(), ...millracePieces()]) assert.ok(names13.includes(p.name), `floor 13 has ${p.name}`);
  // (a list made already is not stepped again: floor 7 shares the Quarry's, made above)
  forgetAct1(-1);
  assert.ok(act1PieceSteps(7).length < quarryPieceCount(), 'the Quarry\'s made: not stepped again for floor 7');
  forgetAct1(-1);
});
