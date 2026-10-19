// ACT 2, THE HUSH: EACH FLOOR'S MOMENT AROUND THE HERO, laid (game/act2_moments.ts, asked by game/act2_dress.ts) and played
// (render/act1_pieces.ts), behind ACT2 (game/act1.ts, off: switched on here for each test and off after). His rulebook's Places 8,
// his words of 10 Oct 2026: “I’d also like a couple environmental things happening around you for immersion unique for each
// floor.  Something shifts above you and dust comes down, you spook a pack of birds and they fly off,  a root shrivels as you walk
// by.  That sort of stuff”; the art chat's five films (art/floor11_moments.ts to floor15_moments.ts). Over ten seeds a floor:
//   - every floor of the five lays its one moment, with its film's key (art/films.ts momentKeys), where the art says it may be
//     laid (a roof's ridge along x; a channel along x; open corn; a ward's open boards; a hall's open floor), past the start,
//     near the main way, out of the boss's ground and away from the bells;
//   - with the switch off, no floor lays one;
// and the playing: it waits until he comes near and sees it, plays once by the game's clock, kicks the screen at its jolts (the
// House of Quiet's not heard), and stays over.
//   run: tsx --test tests/act2_moments.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { filmRoom, makeFilm, momentKeys } from '../src/art/films';
import type { MomentFilm } from '../src/art/films';
import { gateWardMoments } from '../src/art/floor11_moments';
import { undercityMoments } from '../src/art/floor12_moments';
import { millraceMoments } from '../src/art/floor13_moments';
import { houseOfQuietMoments } from '../src/art/floor14_moments';
import { greatLibraryMoments } from '../src/art/floor15_moments';
import { GW_RISE, gateWardRidge } from '../src/art/gateward';
import { pictureOf, worldOf } from '../src/art/terrain';
import { ACT2 } from '../src/game/act1';
import { blobDist, segDist } from '../src/game/act1_layout';
import { HOUSE_ZONE } from '../src/game/act2/housequiet';
import { LB, LB_PIECES } from '../src/game/act2/library';
import { ZONE as UC_ZONE } from '../src/game/act2/undercity';
import { MOMENT_FROM_BELL, MOMENT_FROM_START, MOMENT_NEAR_WAY, bellDist, hushMomentKey, inBossGround, roofRidge, wayDist } from '../src/game/act2_moments';
import type { HushMoment } from '../src/game/act2_moments';
import type { Game } from '../src/game/game';
import { makeDungeon } from '../src/game/level';
import type { Level } from '../src/game/state';
import { T_FLOOR } from '../src/game/types';
import { Act1Pieces } from '../src/render/act1_pieces';
import type { Cam } from '../src/render/fx';
import type { Painter } from '../src/render/painter';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';
// (VERSION 23.0: THE HUSH IS ON IN THE GAME. This file was written while it was off, and turns it on itself wherever it
// needs it: so it is turned off here for the file, as it was then, once the game's own is seen to be on)
assert.equal(ACT2.on, true, 'the Hush is on in the game (Version 23.0)');
ACT2.on = false;

paintWithoutCanvas();

const SEEDS = Array.from({ length: 10 }, (_, i) => i + 1);
const FLOORS = [11, 12, 13, 14, 15];

function hush<T>(fn: () => T): T {
  const was = ACT2.on;
  ACT2.on = true;
  try {
    return fn();
  } finally {
    ACT2.on = was;
  }
}
const floors = new Map<string, Level>();
/** Floor `d` of seed `s`, with the switch on, laid once for all the tests. */
function floorOf(d: number, s: number): Level {
  const k = `${d}:${s}`;
  let L = floors.get(k);
  if (!L) {
    L = hush(() => makeDungeon(d, s));
    floors.set(k, L);
  }
  return L;
}
const momentOf = (L: Level): HushMoment => {
  const list = L.act1?.moments ?? [];
  assert.equal(list.length, 1, 'one moment a floor');
  return list[0];
};
const lineDist = (pts: readonly [number, number][] | undefined, x: number, y: number): number => {
  if (!pts || pts.length < 2) return Infinity;
  let d = Infinity;
  for (let i = 0; i + 1 < pts.length; i++) d = Math.min(d, segDist(x, y, pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1]));
  return d;
};

test('the switch is off; with it off no floor lays a moment of the Hush, nor do the descent\'s floors with it on', () => {
  assert.equal(ACT2.on, false);
  for (const d of FLOORS) for (const s of [1, 2, 3]) {
    const L = makeDungeon(d, s);
    assert.ok(!L.act1?.moments?.length, `floor ${d}, seed ${s}: laid with the switch off`);
  }
  for (const d of [6, 8, 10]) assert.ok(!hush(() => makeDungeon(d, 1)).act1?.moments?.length, `floor ${d} of the descent`);
});

test('the films: each floor of the five its one key, the art\'s own moment, the room it takes', () => {
  const art = [gateWardMoments, undercityMoments, millraceMoments, houseOfQuietMoments, greatLibraryMoments];
  FLOORS.forEach((d, k) => {
    assert.deepEqual(momentKeys(d), [hushMomentKey(d)]);
    const film = makeFilm(hushMomentKey(d)) as MomentFilm;
    const m = art[k]()[0];
    assert.equal(film.name, m.name);
    assert.equal(film.frames, m.frames, 'the art\'s own frames');
    assert.deepEqual(film.jolts, m.jolts);
    assert.ok(film.before?.length && film.after?.length, 'what is there before, and after');
    // (the room it takes while made: what its pictures hold, and under what a phone makes: render/painter.ts SMALL_ROOM, 100)
    let b = 0;
    const seen = new Set<unknown>();
    for (const sp of [...film.frames, ...film.before!, ...film.after!]) {
      if (seen.has(sp.img)) continue;
      seen.add(sp.img);
      const q = sp.img as unknown as { w: number; h: number };
      b += q.w * q.h * 4;
    }
    assert.ok(filmRoom(hushMomentKey(d)) >= b / 1048576 && filmRoom(hushMomentKey(d)) < 100, `floor ${d}: ${filmRoom(hushMomentKey(d))} MB for ${(b / 1048576).toFixed(1)}`);
  });
  assert.throws(() => makeFilm('moment:11:1'));
});

test('the Gate Ward\'s roofs as the game holds them are the art\'s (roofRidge, art/gateward.ts gateWardRidge)', () => {
  for (let y = -3; y < 140; y += 0.37) for (let x = -3; x < 140; x += 0.41) assert.deepEqual(roofRidge(x, y), gateWardRidge(x, y), `at ${x}, ${y}`);
});

test('over ten seeds every floor of the five lays its moment: past the start, near the main way, out of the boss\'s ground, away from the bells', () => {
  for (const d of FLOORS) for (const s of SEEDS) {
    const L = floorOf(d, s);
    const m = momentOf(L);
    const f = L.floor;
    const land = L.land!;
    const at = `floor ${d}, seed ${s}, (${m.x.toFixed(2)}, ${m.y.toFixed(2)})`;
    assert.equal(m.key, hushMomentKey(d), at);
    assert.ok(Math.hypot(m.x - f.start.x, m.y - f.start.y) >= MOMENT_FROM_START, `${at}: by the start`);
    assert.ok(wayDist(land, m.x, m.y) <= MOMENT_NEAR_WAY, `${at}: ${wayDist(land, m.x, m.y).toFixed(1)} off the main way`);
    assert.ok(!inBossGround(L, m.x, m.y), `${at}: in the boss's ground`);
    assert.ok(bellDist(land, m.x, m.y) >= MOMENT_FROM_BELL, `${at}: by a bell`);
    // (the tile it is seen from: whole floor, walked on, within a few tiles of it)
    const sx = (m.seen % f.w) + 0.5;
    const sy = Math.floor(m.seen / f.w) + 0.5;
    assert.equal(f.tiles[m.seen], T_FLOOR, `${at}: seen from floor`);
    assert.equal(L.walk[m.seen], 1, `${at}: seen from where he walks`);
    assert.ok(Math.hypot(sx - m.x, sy - m.y) < 5, `${at}: seen from too far`);
    // (none of it solid: nothing of the floor changes for it)
    assert.equal(!!m.over, d === 11, `${at}: drawn over the figures only on a roof`);
  }
});

test('floor 11: the pigeons on a roof whose ridge runs along x, three tiles long and more, its plot houses, a street at its foot', () => {
  for (const s of SEEDS) {
    const L = floorOf(11, s);
    const m = momentOf(L);
    const f = L.floor;
    const r = gateWardRidge(m.x, m.y);
    assert.equal(r.along, 'x', `seed ${s}`);
    assert.ok(Math.abs(r.at - m.y) < 1e-9 && Math.abs((r.from + r.to) / 2 - m.x) < 1e-9, `seed ${s}: on the ridge's middle`);
    assert.ok(r.to - r.from >= 3, `seed ${s}: a ridge ${r.to - r.from} long`);
    const j = Math.floor(m.y / 2.5);
    for (let ty = Math.floor(j * 2.5); ty < Math.ceil((j + 1) * 2.5); ty++) for (let tx = Math.floor(r.from); tx < Math.ceil(r.to); tx++) {
      assert.notEqual(f.tiles[ty * f.w + tx], T_FLOOR, `seed ${s}: floor in the roof's plot at ${tx}, ${ty}`);
      for (const h of L.land!.houses ?? []) assert.ok(!(tx >= h.room[0] && tx < h.room[2] && ty >= h.room[1] && ty < h.room[3]), `seed ${s}: a house walked into`);
    }
    // (the roof painted whole under them, as the art's ground paints it, art/terrain.ts: nothing over walkable floor; so no floor
    // under any bird's picture, at its height over the ridge, GW_RISE + 2 picture pixels, as far up as a bird and its wings, and
    // as wide; and the ridge itself a house's)
    for (let k = -2; k <= 2; k++) {
      const [px, py] = pictureOf(m.x + k * 0.75, m.y);
      for (let yy = py - GW_RISE - 2 + 4; yy >= py - GW_RISE - 2 - 34; yy -= 3) for (let xx = px - 14; xx <= px + 14; xx += 3) {
        const [wx, wy] = worldOf(xx, yy);
        assert.notEqual(f.tiles[Math.floor(wy) * f.w + Math.floor(wx)], T_FLOOR, `seed ${s}: floor under the birds' picture at ${wx.toFixed(1)}, ${wy.toFixed(1)}`);
      }
    }
    assert.notEqual(f.tiles[Math.floor(m.y) * f.w + Math.floor(m.x)], T_FLOOR, `seed ${s}: the ridge over floor`);
    const sy = Math.floor(m.seen / f.w);
    assert.ok(sy >= (j + 1) * 2.5 && sy <= (j + 1) * 2.5 + 1.5, `seed ${s}: the street before it at row ${sy}`);
  }
});

test('floor 12: the surge on a straight channel along x, two across, walkways either side, the wave\'s run below it, no sluice gate on the culvert', () => {
  for (const s of SEEDS) {
    const L = floorOf(12, s);
    const m = momentOf(L);
    const f = L.floor;
    const land = L.land!;
    assert.ok(m.span && m.span[0] <= m.x - 1 && m.span[1] >= m.x + 5, `seed ${s}: its run ${m.span}`);
    for (let x = m.span![0]; x < m.span![1]; x++) {
      assert.equal(land.water![(m.y - 1) * f.w + x], 1, `seed ${s}: water at ${x}`);
      assert.equal(land.water![m.y * f.w + x], 1, `seed ${s}: water at ${x}`);
      for (const y of [m.y - 2, m.y + 1]) {
        assert.equal(f.tiles[y * f.w + x], T_FLOOR, `seed ${s}: a walkway at ${x}, ${y}`);
        assert.equal(land.zones![y * f.w + x], UC_ZONE.Walk);
      }
    }
    assert.ok(!L.props.some((p) => p.name === 'a sluice gate' && p.tx === m.x - 1 && p.ty >= m.y - 3 && p.ty <= m.y + 2), `seed ${s}: a sluice gate on the culvert`);
    assert.ok(!L.props.some((p) => p.solid && Math.abs(p.tx - (m.x - 1)) <= 1 && p.ty >= m.y - 3 && p.ty <= m.y + 2), `seed ${s}: something solid by the culvert`);
    assert.equal(m.seen, (m.y + 1) * f.w + m.x, `seed ${s}: seen from the near walkway`);
  }
});

test('floor 13: the whirl on open corn in a field of the main way, clear of the water, the tracks and the yard, nothing standing near', () => {
  for (const s of SEEDS) {
    const L = floorOf(13, s);
    const m = momentOf(L);
    const f = L.floor;
    const land = L.land!;
    assert.ok(land.areas.some((a) => a.role === 'path' && blobDist(a.blob, m.x, m.y) <= 0.7), `seed ${s}: in a field of the main way`);
    assert.ok(lineDist(land.river, m.x, m.y) >= 3 && lineDist(land.race, m.x, m.y) >= 3, `seed ${s}: by the water`);
    for (const t of land.tracks ?? []) assert.ok(lineDist(t, m.x, m.y) >= 3, `seed ${s}: on a track`);
    for (const [x0, y0, x1, y1] of land.yards ?? []) assert.ok(!(m.x > x0 - 3 && m.x < x1 + 3 && m.y > y0 - 3 && m.y < y1 + 3), `seed ${s}: by the mill yard`);
    for (let ty = Math.floor(m.y - 3); ty <= m.y + 3; ty++) for (let tx = Math.floor(m.x - 3); tx <= m.x + 3; tx++) {
      if (Math.hypot(tx + 0.5 - m.x, ty + 0.5 - m.y) > 2.6) continue;
      assert.equal(f.tiles[ty * f.w + tx], T_FLOOR, `seed ${s}: corn all round`);
    }
    for (const p of L.props) if (p.solid) assert.ok(Math.hypot(p.x - m.x, p.y - m.y) >= 3.2, `seed ${s}: ${p.name ?? p.kind} where the whirl goes`);
  }
});

test('floor 14: the screen in a ward of the main way, on open boards, the floor it falls on clear', () => {
  for (const s of SEEDS) {
    const L = floorOf(14, s);
    const m = momentOf(L);
    const f = L.floor;
    assert.equal(m.x, Math.round(m.x), `seed ${s}: its foot's middle on the line between two tiles`);
    assert.equal(L.land!.zones![Math.floor(m.y) * f.w + m.x - 1], HOUSE_ZONE.Ward, `seed ${s}: in a ward`);
    const r = f.rooms.find((q) => m.x - 0.5 >= q.x && m.y >= q.y && m.x - 0.5 < q.x + q.w && m.y < q.y + q.h);
    assert.ok(r && r.path >= 0, `seed ${s}: a ward of the main way`);
    for (let ty = Math.floor(m.y); ty <= Math.floor(m.y) + 2; ty++) for (const tx of [m.x - 1, m.x]) {
      assert.equal(L.walk[ty * f.w + tx], 1, `seed ${s}: where it stands and falls, clear`);
      assert.ok(!L.props.some((p) => p.tx === tx && p.ty === ty), `seed ${s}: something where it stands and falls`);
      assert.ok(!(f.hazards ?? []).some((z) => tx >= z.x && tx < z.x + z.w && ty >= z.y && ty < z.y + z.h), `seed ${s}: a trap where it falls`);
    }
  }
});

test('floor 15: the chandelier over the open floor of a room of the main way, 2.2 tiles clear round it, no chandelier hung near', () => {
  let halls = 0;
  for (const s of SEEDS) {
    const L = floorOf(15, s);
    const m = momentOf(L);
    const f = L.floor;
    const z = L.land!.zones![Math.floor(m.y) * f.w + Math.floor(m.x)];
    assert.ok(z === LB.Hall || z === LB.Reading || z === LB.Scriptorium, `seed ${s}: zone ${z}`);
    if (z === LB.Hall) halls++;
    const r = f.rooms.find((q) => m.x >= q.x && m.y >= q.y && m.x < q.x + q.w && m.y < q.y + q.h);
    assert.ok(r && r.path >= 0 && r.kind !== 'boss', `seed ${s}: a room of the main way`);
    for (const p of L.props) {
      if (p.solid) assert.ok(Math.hypot(p.x - m.x, p.y - m.y) >= 2.2, `seed ${s}: ${p.name ?? p.kind} where it falls`);
      if (p.name === LB_PIECES.chandelier) assert.ok(Math.hypot(p.x - m.x, p.y - m.y) >= 3, `seed ${s}: a chandelier hung over it`);
    }
  }
  assert.ok(halls >= 8, `in a great hall on ${halls} of ten`);
});

// ---------------------------------------------------------------------------------------------------
// THE PLAYING (render/act1_pieces.ts)

/** A film of `n` frames for the tests: the same small picture in every frame, its jolts where asked. */
function filmOf(n: number, jolts: number[]): MomentFilm {
  const sp = { img: null, w: 10, h: 10, ax: 5, ay: 5 } as unknown as Sprite;
  return { name: 'a test', fps: 30, jolts, frames: Array.from({ length: n }, () => sp), before: [sp], after: [sp] };
}
interface Run {
  game: Game;
  hero: { x: number; y: number };
  step(dt: number): void;
  pieces: Act1Pieces;
}
/** A hero on floor `d` of seed `s`, its pieces drawn on a phone's screen round him (422 by 195 game pixels), the painter holding `film`. */
function runOn(d: number, s: number, film: MomentFilm | null): Run {
  const L = floorOf(d, s);
  L.visible.fill(0);
  const hero = { x: L.floor.start.x, y: L.floor.start.y };
  const g = { level: L, hero, time: 0 } as unknown as Game & { time: number };
  const painter = { filmOf: () => film } as unknown as Painter;
  const pieces = new Act1Pieces();
  assert.ok(pieces.begin(L));
  const W = 422;
  const H = 195;
  return {
    game: g,
    hero,
    pieces,
    step(dt: number) {
      g.time += dt;
      pieces.stepMoments(g, painter);
      const cam: Cam = { ox: W / 2 - (hero.x - hero.y) * 16, oy: H / 2 + 12 - (hero.x + hero.y) * 8, lift: null } as unknown as Cam;
      pieces.standMoments(g, painter, cam, W, H, () => undefined);
    },
  };
}

test('it waits until he comes near and sees it; plays once by the game\'s clock; kicks the screen at its jolts; stays over', () => {
  const r = runOn(15, 2, filmOf(40, [5, 20]));
  const m = momentOf(r.game.level);
  const state = (): string => r.pieces.momentStates()[0].state;
  for (let k = 0; k < 10; k++) r.step(0.05);
  assert.equal(state(), 'wait', 'far off');
  // (near, but its tile not in his sight)
  r.hero.x = m.x + 1.5;
  r.hero.y = m.y + 1.5;
  for (let k = 0; k < 10; k++) r.step(0.05);
  assert.equal(state(), 'wait', 'not seen');
  r.game.level.visible[m.seen] = 1;
  r.step(0.02);
  r.step(0.02);
  assert.equal(state(), 'play', 'near, and seen');
  assert.equal(r.pieces.kicks().length, 0);
  // (its first jolt at frame 5, its second at 20: kicked once each, the first harder, both heard)
  for (let k = 0; k < 12; k++) r.step(1 / 30);
  const k1 = r.pieces.kicks();
  assert.equal(k1.length, 1);
  assert.ok(k1[0].amount === 3 && k1[0].vol > 0, JSON.stringify(k1));
  for (let k = 0; k < 20; k++) r.step(1 / 30);
  const k2 = r.pieces.kicks();
  assert.ok(k2.length === 1 && k2[0].amount === 2, JSON.stringify(k2));
  for (let k = 0; k < 30; k++) r.step(1 / 30);
  assert.equal(state(), 'done', 'over by the end of its frames');
  // (he goes off and comes back: it stays over)
  r.hero.x = r.game.level.floor.start.x;
  r.hero.y = r.game.level.floor.start.y;
  for (let k = 0; k < 10; k++) r.step(0.1);
  r.hero.x = m.x + 1;
  r.hero.y = m.y + 1;
  for (let k = 0; k < 40; k++) r.step(0.1);
  assert.equal(state(), 'done', 'plays once');
  assert.equal(r.pieces.kicks().length, 0, 'no more kicks');
});

test('the House of Quiet\'s screen falls without a sound: its kick is not heard', () => {
  const r = runOn(14, 3, filmOf(20, [8]));
  const m = momentOf(r.game.level);
  r.hero.x = m.x + 1;
  r.hero.y = m.y + 2;
  r.game.level.visible[m.seen] = 1;
  for (let k = 0; k < 15; k++) r.step(1 / 30);
  const ks = r.pieces.kicks();
  assert.ok(ks.length === 1 && ks[0].amount === 3 && ks[0].vol === 0, JSON.stringify(ks));
});

test('without its film (no painter, or no room for it) it never plays', () => {
  const r = runOn(13, 4, null);
  const m = momentOf(r.game.level);
  r.hero.x = m.x + 1;
  r.hero.y = m.y + 1;
  r.game.level.visible[m.seen] = 1;
  for (let k = 0; k < 30; k++) r.step(0.1);
  assert.equal(r.pieces.momentStates()[0].state, 'wait');
});

test('on the Gate Ward the pigeons wait until their roof is on his screen: not from right under it, at the screen\'s top edge', () => {
  const r = runOn(11, 5, filmOf(20, []));
  const m = momentOf(r.game.level);
  const f = r.game.level.floor;
  r.game.level.visible[m.seen] = 1;
  // (in the street straight before it: the roof is above the top of a phone's screen)
  r.hero.x = (m.seen % f.w) + 0.5;
  r.hero.y = Math.floor(m.seen / f.w) + 0.5 + 1;
  for (let k = 0; k < 6; k++) r.step(0.05);
  assert.equal(r.pieces.momentStates()[0].state, 'wait', 'not on his screen');
  // (along the street to the -x side of it: the roof comes down onto his screen)
  r.hero.x = m.x - 3;
  r.hero.y = Math.floor(m.seen / f.w) + 0.5;
  for (let k = 0; k < 6; k++) r.step(0.05);
  assert.equal(r.pieces.momentStates()[0].state, 'play', 'on his screen, near');
});
