// THE FLESHMANCER'S LAIR (src/art/lair.ts, floor5.ts, floor5_moments.ts, shaft.ts; a mock-up nothing of the
// game imports), held to his art rulebook before he sees it, and to his notes on floor 1's first pictures,
// through the checks every Crypt floor goes through (tests/floor_checks.ts); then its own moments, and
// the cage that takes the hero up the mine shaft, each checked against his Animations 1 (10 Oct, 07:47:
// “as big and wild and kinetic and weighty as possible.  I’d rather it be a notch too high than a notch
// too low.”; 07:53: “And I want all animations checked against this statement before I see them.”).
//   run: tsx --test tests/floor5.test.ts

import { cryptGround } from '../src/art/crypt';
import { lairPieces } from '../src/art/floor5';
import { lairMoments } from '../src/art/floor5_moments';
import type { Moment, Track } from '../src/art/floorkit';
import { LAIR, lairGround, lairWaypoint } from '../src/art/lair';
import { cageDown, cageUp, riderDark, shaftStill } from '../src/art/shaft';
import { assert, count, each, floorChecks, test } from './floor_checks';
import { paintWithoutCanvas, unlike } from './helpers';

paintWithoutCanvas();

const pieces = lairPieces();
const moments = lairMoments();
const down = cageDown();
const up = cageUp();

floorChecks({
  label: 'floor 5',
  pieces,
  moments: [...moments, down.m, up.m],
  onePlace: ['the cave-in', 'the shrieking skull'],
  fullHeight: ['the lagged wall', 'the cave-in', 'the priest in the stone', 'the boarded adit', 'black glass', 'the hung kibble', 'the drilled face'],
  fires: ['the shrine', 'the candle ledge', "a miner's candle"],
  tileTraps: ['the grasping earth', 'the charge'],
  shadowed: ["a miner's bones", 'the cart on its side', 'the spilled kibble', 'skulls given to him', 'a dropped lantern', 'the cave-in'],
});

const named = (n: string): Moment => {
  const m = [...moments, down.m, up.m].find((q) => q.name === n);
  if (!m) throw new Error(`no moment named ${n}`);
  return m;
};
type At = NonNullable<Track['at'][number]>;
const seen = (t: Track): At[] => t.at.filter((a): a is At => a !== null);
const moved = (a: At, b: At): number => Math.hypot(b.x - a.x, b.y - a.y);

test('floor 5, its look: the fifth, its own: nine in ten of its flagstones gone and of its walls dug earth, never the same as floor 4', () => {
  assert.ok(LAIR.id === 'crypt5' && LAIR.earth!.gone >= 0.85 && LAIR.earth!.raw >= 0.85 && LAIR.earth!.dug === true, 'the lair is mostly earth');
  const g = lairGround();
  const g4 = cryptGround(4);
  let differ = 0;
  for (let i = 0; i < 6; i++) differ += unlike(g.floor(i, i * 2), g4.floor(i, i * 2)) > 200 ? 1 : 0;
  assert.ok(differ >= 5, `${differ} of 6 floor tiles unlike floor 4's`);
  assert.ok(unlike(g.faceLeft[0], g4.faceLeft[0]) > 600, 'its walls unlike floor 4');
  assert.ok(count(lairWaypoint().asleep) > 100, 'its waypoint is painted');
});

test('floor 5, moments: three, each its own, none held still', () => {
  assert.ok(moments.length === 3, `${moments.length} moments`);
  for (const m of moments) assert.ok(m.holds.length === 0, `${m.name}: held`);
});

// What each moment is FOR, followed through its tracks: that the thing happens, big, and comes to rest.

test('floor 5, the roof comes in: the prop stands until it snaps; the rocks pour down out of the dark, land and lie still', () => {
  const m = named('the roof comes in');
  const snap = m.jolts[0];
  const prop = m.tracks.find((t) => t.name === 'the prop')!;
  assert.ok(prop.at.slice(0, snap).every((a) => a !== null) && prop.at.slice(snap).every((a) => a === null), 'the prop stands until the snap, then is gone into its pieces');
  const rocks = m.tracks.filter((t) => t.name.startsWith('rock '));
  assert.ok(rocks.length >= 20, `${rocks.length} rocks`);
  for (const r of rocks) {
    const s = seen(r);
    assert.ok(s.length > 6, `${r.name}: seen`);
    assert.ok(s[s.length - 1].y - s[0].y > 20, `${r.name}: falls (${(s[s.length - 1].y - s[0].y).toFixed(1)})`);
    const end = r.at.slice(-5);
    assert.ok(end.every((a) => a !== null), `${r.name}: lies where it fell to the end`);
    for (let i = 1; i < end.length; i++) assert.ok(moved(end[i - 1]!, end[i]!) < 1, `${r.name}: still at the end`);
  }
});

test('floor 5, the winch runs wild: the kibble drops away down the winze; at its strike stones are flung high out of it, land well away and lie still', () => {
  const m = named('the winch runs wild');
  const [bottom] = m.jolts;
  const kibble = m.tracks.find((t) => t.name === 'the kibble')!;
  assert.ok(kibble.at[0] !== null && kibble.at.slice(bottom).every((a) => a === null), 'the kibble is gone down the winze before it strikes');
  const stones = m.tracks.filter((t) => t.name.startsWith('stone '));
  assert.ok(stones.length >= 10, `${stones.length} stones`);
  for (const t of stones) {
    assert.ok(t.at.slice(0, bottom).every((a) => a === null), `${t.name}: none before the strike`);
    const s = seen(t);
    const top = Math.min(...s.map((a) => a.y));
    assert.ok(s[0].y - top > 30, `${t.name}: flung high, most of the hero's height (${(s[0].y - top).toFixed(1)})`);
    const last = s[s.length - 1];
    assert.ok(Math.hypot(last.x - s[0].x, last.y - s[0].y) > 30, `${t.name}: lands well away from the winze`);
    const end = t.at.slice(-5);
    assert.ok(end.every((a) => a !== null), `${t.name}: lies there to the end`);
    for (let i = 1; i < end.length; i++) assert.ok(moved(end[i - 1]!, end[i]!) < 1, `${t.name}: still at the end`);
  }
});

test('floor 5, the rift breathes: it tears wider at the heave, and the chunks of its lips go down into it and are gone', () => {
  const m = named('the rift breathes');
  const [heave] = m.jolts;
  const lip = m.tracks.find((t) => t.name === 'the lip')!;
  const wide = Math.max(...seen(lip).slice(heave).map((a) => moved(lip.at[0]!, a)));
  assert.ok(wide >= 3, `its lip pulled back ${wide.toFixed(1)}`);
  const chunks = m.tracks.filter((t) => t.name.startsWith('chunk '));
  assert.ok(chunks.length >= 8, `${chunks.length} chunks`);
  for (const t of chunks) {
    assert.ok(t.at[0] !== null, `${t.name}: on its lip at first`);
    assert.ok(t.at[t.at.length - 1] === null, `${t.name}: gone into it by the end`);
  }
});

test('floor 5, the cage comes down out of the dark, fast and heavy, strikes the landing on its jolt and rests there', () => {
  const m = down.m;
  const [hit] = m.jolts;
  const cage = m.tracks.find((t) => t.name === 'the cage')!;
  assert.ok(cage.at[0] === null, 'not there at first: up in the dark');
  const last = cage.at[cage.at.length - 1]!;
  const low = Math.max(...seen(cage).map((a) => a.y));
  assert.ok(Math.abs(cage.at[hit]!.y - low) < 3, 'its strike is its lowest');
  assert.ok(moved(cage.at[hit - 1]!, cage.at[hit]!) > 8, `fast as it strikes (${moved(cage.at[hit - 1]!, cage.at[hit]!).toFixed(1)} a frame)`);
  assert.ok(Math.abs(last.y - low) < 3, 'at rest on the landing at the end');
});

test('floor 5, the ride up: the cage waits at the landing, lurches, is hauled up faster and faster, and is gone into the dark with the hero in it', () => {
  const m = up.m;
  const [slam, lurch] = m.jolts;
  const { lift } = up.layers;
  assert.ok(lift.length === m.frames.length && lift.slice(0, lurch).every((z) => z === 0), 'still at the landing until it lurches');
  for (let f = lurch + 9; f < lift.length; f++) assert.ok(lift[f] >= lift[f - 1], `frame ${f}: hauled up, never back`);
  assert.ok(slam < lurch, 'its gate slams before it lurches');
  const cage = m.tracks.find((t) => t.name === 'the cage')!;
  assert.ok(cage.at[cage.at.length - 1] === null, 'gone up into the dark by the end');
  assert.ok(riderDark(0, 1) === 0 && riderDark(0, 0) === 0, 'the hero standing at the landing is untouched by the dark');
  const gone = lift.findIndex((z, f) => cage.at[f] === null && z > 0);
  assert.ok(gone > 0 && riderDark(lift[gone], 0.5) >= 0.66 && riderDark(lift[gone] + 30, 0) === 1, 'the hero is taken by the dark with the cage');
});
