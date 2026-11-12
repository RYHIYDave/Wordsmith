// Tests for THE TOWN'S PEOPLE SCULPTED, AT THIRTY A SECOND (art/townsfolk3.ts, dev/sculpt_townsfolk.ts,
// dev/townsfolk_moves.ts: a mock-up behind a switch that is off; the townsfolk chat, 11 Nov 2026). The owner, 8 Nov 2026,
// 06:25: “And I think the townsfolk need look update and a 30fps makeover”.
//   run: tsx --test tests/townsfolk3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { rgba } from '../src/engine/px';
import type { Px } from '../src/engine/px';
import { solve, standing } from '../src/art/skeleton';
import type { Bones, Build, Posed, Skeleton, V3 } from '../src/art/skeleton';
import { SMITH_BODY } from '../src/art/smith3';
import { FACINGS, makeTownsfolk, townFrame, actAt } from '../src/art/townsfolk';
import { FACING_TURN3, TOWNSFOLK3, makeTownsfolk3 } from '../src/art/townsfolk3';
import {
  ANVIL, ARMOURER_BUILD, MYSTIC_BUILD, STRANGER_BUILD, TOWN_CANVAS, WALL, paintFigure, sculptArmourer, sculptMystic, sculptStranger, sculptWordsmith,
} from '../src/dev/sculpt_townsfolk';
import { A_BLOW, ARMOURER_MOVES, MYSTIC_MOVES, M_FLARE, STRANGER_MOVES, S_TOSS, TFPS, WORDSMITH_MOVES, strangerWatching } from '../src/dev/townsfolk_moves';
import { paintWithoutCanvas } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  notEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

const skel = (B: Build, q: Partial<Bones>): Skeleton => solve(B, { ...standing(B), ...q } as Posed);
const JOINTS = ['pelvis', 'neck', 'head', 'handL', 'handR', 'elbowL', 'elbowR', 'kneeL', 'kneeR', 'ankleL', 'ankleR'] as const;
/** The furthest any joint is between two poses. */
const apart = (a: Skeleton, b: Skeleton): number => Math.max(...JOINTS.map((j) => Math.hypot(a[j][0] - b[j][0], a[j][1] - b[j][1], a[j][2] - b[j][2])));
const FOUR = [
  { who: 'armourer', B: ARMOURER_BUILD, moves: ARMOURER_MOVES },
  { who: 'mystic', B: MYSTIC_BUILD, moves: MYSTIC_MOVES },
  { who: 'wordsmith', B: SMITH_BODY, moves: WORDSMITH_MOVES },
  { who: 'stranger', B: STRANGER_BUILD, moves: STRANGER_MOVES },
] as const;
/** How many pixels of a picture are exactly a colour. */
const count = (px: Px, color: string): number => {
  const [r, g, b] = rgba(color);
  let n = 0;
  for (let i = 0; i < px.d.length; i += 4) if (px.d[i + 3] > 0 && px.d[i] === r && px.d[i + 1] === g && px.d[i + 2] === b) n++;
  return n;
};
/** The box of what is painted. */
const boxOf = (px: Px): { x0: number; y0: number; x1: number; y1: number } => {
  let x0 = px.w;
  let y0 = px.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < px.h; y++) for (let x = 0; x < px.w; x++) if (px.d[(y * px.w + x) * 4 + 3] > 0) {
    x0 = Math.min(x0, x);
    x1 = Math.max(x1, x);
    y0 = Math.min(y0, y);
    y1 = Math.max(y1, y);
  }
  return { x0, y0, x1, y1 };
};

test('the switch is off: the town\'s people are the ones it has always had', () => {
  assert.equal(TOWNSFOLK3.on, false);
  const folk = makeTownsfolk();
  assert.equal(folk.armourer.fps, undefined, 'the old armourer stands at the town\'s ten a second');
  assert.equal(folk.armourer.act.length, 26);
});

test('sculpted, each has a loop and an act at thirty a second, and a loop for each way they can be turned', () => {
  assert.equal(TFPS, 30);
  const folk = makeTownsfolk3();
  for (const { who, moves } of FOUR) {
    const m = folk[who];
    assert.equal(m.fps, 30, `${who}: the loop`);
    assert.equal(m.actFps, 30, `${who}: the act`);
    assert.equal(m.idle.length, moves.idleLong, who);
    assert.equal(m.act.length, moves.actLong + 1, who);
    for (const to of FACINGS) assert.ok(m.turned[to].length === moves.idleLong, `${who} turned ${to}`);
    assert.equal(m.turned[m.work] === m.idle, who !== 'stranger', `${who}: at their work they go on with what they were doing`);
  }
  // (the town's clock goes by each one's own thirty: a loop of 120 frames is four seconds)
  const a = folk.armourer;
  assert.equal(actAt(a, 0), -1);
  const rest = (a.loops * a.idle.length) / 30;
  assert.ok(Math.abs(actAt(a, rest + 0.5) - 0.5) < 1e-9, 'half a second into the blow');
  assert.ok(townFrame(a, rest + A_BLOW.lands / 30 + 0.001) === a.act[A_BLOW.lands], 'the frame the blow lands in');
});

test('an act begins and ends as the loop begins, and the loop comes round without a jump', () => {
  for (const { who, B, moves } of FOUR) {
    const first = skel(B, moves.idle(0).bones);
    assert.ok(apart(skel(B, moves.act(0).bones), first) < 0.05, `${who}: the act's first frame is the loop's`);
    assert.ok(apart(skel(B, moves.act(moves.actLong).bones), first) < 0.05, `${who}: and its last`);
    assert.ok(apart(skel(B, moves.idle(moves.idleLong).bones), first) < 1e-6, `${who}: the loop comes round`);
    let most = 0;
    for (let f = 0; f < moves.idleLong; f++) most = Math.max(most, apart(skel(B, moves.idle(f).bones), skel(B, moves.idle(f + 1).bones)));
    assert.ok(most < 1.6, `${who}: no joint jumps from one frame of the loop to the next (${most.toFixed(2)})`);
  }
});

test('the armourer\'s blow: a big wind-up held, a strike of two frames onto the anvil\'s face, sparks, a bounce', () => {
  const B = ARMOURER_BUILD;
  /** The middle of the hammer's lower face in a frame of the blow. */
  const face = (f: number): V3 => {
    const s = skel(B, ARMOURER_MOVES.act(f).bones);
    const head: V3 = [s.handR[0] + s.point[0] * 13.2, s.handR[1] + s.point[1] * 13.2, s.handR[2] + s.point[2] * 13.2];
    return [head[0] - s.across[0] * 4.6, head[1] - s.across[1] * 4.6, head[2] - s.across[2] * 4.6];
  };
  const far = (a: V3, b: V3): number => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const anvil: V3 = [ANVIL.fwd, 0, ANVIL.up];
  assert.ok(far(face(A_BLOW.lands), anvil) < 1.5, `the face is on the anvil's as the blow lands (${far(face(A_BLOW.lands), anvil).toFixed(2)} off)`);
  // the wind-up: the head well above his own, held there
  const top = skel(B, ARMOURER_MOVES.act(A_BLOW.top).bones);
  assert.ok(face(A_BLOW.top)[2] > top.head[2] + 6, 'heaved up over his head');
  assert.ok(A_BLOW.held - A_BLOW.top >= 5, 'held: a pose you can read');
  assert.ok(far(face(A_BLOW.top), face(A_BLOW.held)) < 9, 'it hangs there');
  // the strike: all the way down in two frames
  assert.equal(A_BLOW.lands - A_BLOW.held, 2);
  assert.ok(far(face(A_BLOW.held), face(A_BLOW.lands)) > 30, 'lightning quick');
  // on the anvil a tenth of a second
  assert.ok(A_BLOW.off - A_BLOW.lands >= 3);
  assert.ok(far(face(A_BLOW.off), anvil) < 2.5, 'still on it');
  // it bounces
  assert.ok(face(35)[2] > ANVIL.up + 4, 'the hammer bounces off the face');
  // sparks from the blow on, never before
  for (let f = 0; f <= A_BLOW.long; f++) assert.equal((ARMOURER_MOVES.act(f).sparks ?? 0) > 0, f >= A_BLOW.lands && f <= A_BLOW.lands + 16, `sparks at frame ${f}`);
  // his feet are planted through all of it
  const feet0 = skel(B, ARMOURER_MOVES.act(0).bones);
  for (let f = 0; f <= A_BLOW.long; f += 3) {
    const s = skel(B, ARMOURER_MOVES.act(f).bones);
    assert.ok(far(s.ankleL, feet0.ankleL) < 0.05 && far(s.ankleR, feet0.ankleR) < 0.05, `feet grip the floor at frame ${f} (${far(s.ankleL, feet0.ankleL).toFixed(2)}, ${far(s.ankleR, feet0.ankleR).toFixed(2)})`);
  }
});

test('the mystic\'s crystal lifts, blazes and comes back to its place; the stranger\'s coin leaves his hand and comes back to it', () => {
  assert.equal(MYSTIC_MOVES.act(0).flare, 0);
  assert.ok((MYSTIC_MOVES.act(M_FLARE.blaze).flare ?? 0) > 0.95, 'blazing');
  assert.ok((MYSTIC_MOVES.act(M_FLARE.blaze).rise ?? 0) > 6, 'lifted off his palm');
  assert.equal(MYSTIC_MOVES.act(M_FLARE.long).flare, 0);
  assert.ok(Math.abs((MYSTIC_MOVES.act(M_FLARE.long).spin ?? 0) - 3) < 1e-9, 'whole turns: it is as the loop begins');
  assert.equal(STRANGER_MOVES.act(S_TOSS.flick).coin, null);
  assert.equal(STRANGER_MOVES.act(S_TOSS.caught).coin, null);
  const s = skel(STRANGER_BUILD, STRANGER_MOVES.act(31).bones);
  const coin = STRANGER_MOVES.act(31).coin;
  assert.ok(coin && coin.at[2] > s.head[2] + 8, 'the coin goes up over his hood');
});

test('painted: on the floor, inside the canvas, no edge of light; the wordsmith burns, and is cold while his ring is dark', () => {
  const paints: [string, Px][] = [
    ['armourer', paintFigure(sculptArmourer(ARMOURER_MOVES.idle(0), -90)).px],
    ['armourer at the blow', paintFigure(sculptArmourer(ARMOURER_MOVES.act(A_BLOW.lands), -90)).px],
    ['armourer heaving', paintFigure(sculptArmourer(ARMOURER_MOVES.act(A_BLOW.held), -90)).px],
    ['mystic', paintFigure(sculptMystic(MYSTIC_MOVES.idle(0), -90)).px],
    ['mystic blazing', paintFigure(sculptMystic(MYSTIC_MOVES.act(M_FLARE.blaze), -90)).px],
    ['wordsmith', paintFigure(sculptWordsmith(WORDSMITH_MOVES.idle(0), -90)).px],
    ['wordsmith gathering', paintFigure(sculptWordsmith(WORDSMITH_MOVES.act(58), -90)).px],
    ['stranger', paintFigure(sculptStranger(STRANGER_MOVES.idle(0), 0)).px],
    ['stranger tossing', paintFigure(sculptStranger(STRANGER_MOVES.act(31), 0)).px],
  ];
  for (const [name, px] of paints) {
    const b = boxOf(px);
    assert.ok(b.x0 > 2 && b.y0 > 2 && b.x1 < px.w - 3 && b.y1 < px.h - 3, `${name} is inside the canvas (${b.x0},${b.y0} to ${b.x1},${b.y1})`);
    assert.ok(b.y1 >= TOWN_CANVAS.ay - 8, `${name} stands on the floor`);
  }
  // (townsfolk have no edge of light: his rulebook, Pixels 5. The friend's rim is #22d0e0: the smith and the stranger have none of it anywhere)
  assert.equal(count(paints[0][1], '#22d0e0'), 0, 'the armourer has no cyan on him');
  assert.equal(count(paints[7][1], '#22d0e0'), 0, 'nor the stranger');
  // the wordsmith's runes: alight; cold and teal while his ring is dark
  const lit = paints[5][1];
  const dark = paintFigure(sculptWordsmith({ ...WORDSMITH_MOVES.idle(0), dark: true }, -90)).px;
  assert.ok(count(lit, '#22d0e0') + count(lit, '#b8fff8') > 40, 'runes burning on him');
  assert.equal(count(dark, '#22d0e0') + count(dark, '#b8fff8'), 0, 'cold');
});

test('truly turned, never flipped; and the stranger never leaves his wall: only his eyes go to you', () => {
  assert.equal(FACING_TURN3.se, 0);
  assert.equal(FACING_TURN3.sw, -90);
  // (the hammer is in his right hand whichever way he is turned: toward the eye's left when he faces down to the left,
  // which a flipped picture of him facing right would not have)
  const se = paintFigure(sculptArmourer(ARMOURER_MOVES.idle(0), 0)).px;
  const sw = paintFigure(sculptArmourer(ARMOURER_MOVES.idle(0), -90)).px;
  let same = 0;
  let all = 0;
  for (let y = 0; y < se.h; y++) for (let x = 0; x < se.w; x++) {
    const a = (y * se.w + x) * 4;
    const b = (y * se.w + (2 * TOWN_CANVAS.ax - 1 - x)) * 4;
    if (se.d[a + 3] === 0 && sw.d[b + 3] === 0) continue;
    all++;
    if (se.d[a] === sw.d[b] && se.d[a + 1] === sw.d[b + 1] && se.d[a + 2] === sw.d[b + 2] && se.d[a + 3] === sw.d[b + 3]) same++;
  }
  assert.ok(same / all < 0.7, `facing left is not facing right turned over (${(same / all).toFixed(2)} the same)`);
  // the stranger: nothing of him is in the wall; watching, all that changes is his eyes and the turn of his head
  const fig = sculptStranger(STRANGER_MOVES.idle(0), 0);
  for (const j of JOINTS) assert.ok(fig.s[j][0] > -WALL, `his ${j} is before the wall`);
  const ahead = paintFigure(fig).px;
  const watch = paintFigure(sculptStranger(strangerWatching(0, 1), 0)).px;
  let differ = 0;
  for (let i = 0; i < ahead.d.length; i += 4) if (ahead.d[i] !== watch.d[i] || ahead.d[i + 3] !== watch.d[i + 3]) differ++;
  assert.ok(differ > 0 && differ < 260, `only his eyes and his hood turn (${differ} pixels)`);
});
