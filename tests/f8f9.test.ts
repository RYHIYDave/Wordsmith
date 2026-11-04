// FLOORS 8 AND 9 FROM HIS PHONE (game/f8f9.ts, F8F9_FIX, off; docs/mockups/f8f9_fixes/README.md): the Pinewood's footbridges square
// to the stream, Echo Canyon's stronghold door carved into its wall and nothing of it on the plateau, the canyon's every wall face
// drawn down to the floor below it.
// @ts-ignore
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { F8F9_FIX, BRIDGE, bridgeOffsets, streamWay } from '../src/game/f8f9';
import { generateAct1, laneDist } from '../src/game/act1_layout';
import { CUT_FAR, T_FLOOR } from '../src/game/types';
import { Game } from '../src/game/game';
import { HOLD } from '../src/game/act1_dress';
import { landTerrain } from '../src/render/outdoor';
import { CANYON_LOOK } from '../src/art/canyon';
import { RIVER_HALF } from '../src/art/pinewood';
import { TK, clearOfFloor, paintTerrain, pictureOf, terrainOf } from '../src/art/terrain';
import { bridgeArt, carvedDoor } from '../src/art/f8f9';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas } from './helpers';
import { count, each, hsv } from './floor_checks';

paintWithoutCanvas();

const on = <T>(f: () => T): T => {
  const was = F8F9_FIX.on;
  F8F9_FIX.on = true;
  try {
    return f();
  } finally {
    F8F9_FIX.on = was;
  }
};

const off = <T>(f: () => T): T => {
  const was = F8F9_FIX.on;
  F8F9_FIX.on = false;
  try {
    return f();
  } finally {
    F8F9_FIX.on = was;
  }
};

// (on since 25.0.6, his “Yes, hand them over (Recommended)” to the pictures; off, the floors as they were)
test('the switch is on, at his yes; off, nothing changes', () => {
  assert.equal(F8F9_FIX.on, true);
  const { land } = off(() => generateAct1(9, 5));
  for (const b of land.bridges ?? []) assert.equal(b.ang, undefined, 'a bridge of before, its tiles planked one by one');
});

test('THE BRIDGES: every crossing one bridge, square to the stream, as long as the stream is wide, its tiles whole and joined bank to bank', () => {
  let n = 0;
  for (const seed of [1, 2, 3, 5, 8, 13, 21, 34]) {
    const { floor, land } = on(() => generateAct1(9, seed));
    const W = floor.w;
    const river = land.river!;
    assert.ok((land.bridges ?? []).length >= 1, `seed ${seed}: a bridge`);
    for (const [k, b] of (land.bridges ?? []).entries()) {
      const what = `seed ${seed}, bridge ${k}`;
      assert.ok(b.ang !== undefined && b.x !== undefined && b.y !== undefined && b.len !== undefined && b.wide !== undefined, `${what}: laid square`);
      // square to the stream's own way where it crosses (whatever way that runs on the grid)
      const [tx, ty] = streamWay(river, b.x!, b.y!);
      const dot = Math.cos(b.ang!) * tx + Math.sin(b.ang!) * ty;
      assert.ok(Math.abs(dot) < 0.02, `${what}: square to the stream (${dot.toFixed(3)})`);
      // its middle on the stream's middle, its length the stream's width with its banks and its ends resting past them
      assert.ok(laneDist({ pts: river, w: 0 }, b.x!, b.y!) < 0.55, `${what}: over the stream's middle`);
      assert.ok(b.len! / 2 >= RIVER_HALF + 0.24 + 0.2 + 0.3, `${what}: reaches past the water and its boulders onto the banks`);
      assert.ok(b.len! / 2 <= 1.6, `${what}: no longer than the stream asks`);
      // its tiles: whole floor, under the deck, joined by their sides from bank to bank (the walk grid has cut tiles shut)
      const set = new Set(b.tiles);
      for (const i of b.tiles) {
        assert.equal(floor.tiles[i], T_FLOOR, `${what}: tile ${i % W}, ${Math.floor(i / W)} floor`);
        assert.equal(floor.cut ? floor.cut[i] : 0, 0, `${what}: tile ${i % W}, ${Math.floor(i / W)} whole`);
        const o = bridgeOffsets({ x: b.x!, y: b.y!, ang: b.ang! }, W, i);
        assert.ok(Math.abs(o.off) < BRIDGE.deck, `${what}: tile ${i % W}, ${Math.floor(i / W)}'s middle under the deck (${o.off.toFixed(2)} from its axis)`);
      }
      const ends = b.tiles.filter((i) => bridgeOffsets({ x: b.x!, y: b.y!, ang: b.ang! }, W, i).along <= -1.2);
      const seen = new Set(ends);
      const q = [...ends];
      let across = false;
      while (q.length) {
        const i = q.pop()!;
        if (bridgeOffsets({ x: b.x!, y: b.y!, ang: b.ang! }, W, i).along >= 1.2) across = true;
        for (const j of [i - 1, i + 1, i - W, i + W]) if (set.has(j) && !seen.has(j)) {
          seen.add(j);
          q.push(j);
        }
      }
      assert.ok(across, `${what}: joined from bank to bank`);
      n++;
    }
    // nothing of the water left walkable but the bridges' own tiles
    for (let i = 0; i < W * floor.h; i++) {
      if (floor.tiles[i] !== T_FLOOR) continue;
      const x = (i % W) + 0.5;
      const y = Math.floor(i / W) + 0.5;
      // (a stronghold's court is laid whole wherever it falls, over the stream too, as it was before: not the bridges')
      if (land.holds.some((q) => x > q.gx - 3 && x < q.gx + 3 && y > q.gy && y < q.gy + 3)) continue;
      if (laneDist({ pts: river, w: 0 }, x, y) < 0.6) assert.ok((land.bridges ?? []).some((b) => b.tiles.includes(i)), `seed ${seed}: tile ${x - 0.5}, ${y - 0.5} in the water is a bridge's`);
    }
  }
  assert.ok(n >= 12, `${n} bridges looked at`);
});

/** Is a sprite's every pixel clear of the friend's cyan (his rule)? */
function noCyan(s: Sprite): boolean {
  let ok = true;
  each(s, (r, g, b) => {
    const [h, sat, v] = hsv(r, g, b);
    if (h > 165 && h < 205 && sat > 0.35 && v > 0.45) ok = false;
  });
  return ok;
}

test('THE BRIDGES DRAWN: a deck and six spans of rail, the rails standing either side of the deck; the door carved; no cyan', () => {
  for (const ang of [0, 0.4, Math.PI / 4, 1.2, Math.PI / 2, 2.4]) {
    const b = bridgeArt(ang, 2.84, 1.6, 3);
    assert.ok(b.deck.w > 20 && b.deck.h > 8 && count(b.deck) > 400, 'a deck');
    assert.equal(b.rails.length, 6, 'three spans a side');
    for (const r of b.rails) {
      // (each span stands at its own side: as far from the axis as the deck's edge and a little)
      const off = -r.dx * Math.sin(ang) + r.dy * Math.cos(ang);
      assert.ok(Math.abs(Math.abs(off) - (0.8 + 1.5 / 40)) < 0.01, `a span at its side (${off.toFixed(3)})`);
    }
    assert.ok(noCyan(b.deck) && b.rails.every((r) => noCyan(r.s)));
  }
  for (const open of [false, true]) assert.ok(noCyan(carvedDoor(open)));
});

test('THE STRONGHOLD ENTRANCE: its apron and everything of it on the canyon floor, none on the plateau; the door in a wall cut straight', () => {
  let holds = 0;
  for (const seed of [3, 7, 11, 19, 23]) {
    on(() => {
      const g = new Game('warrior', seed);
      g.depth = 8;
      g.cleared = 7;
      g.wayDepth = 8;
      g.enterDungeon();
      const L = g.level;
      const land = L.land!;
      const T = landTerrain(land, L.floor);
      for (const q of land.holds) {
        const what = `seed ${seed}, stronghold ${q.n}`;
        // the apron of flags: every one of its 6 by 3 tiles on the floor as painted, corners and all
        for (let ty = q.gy; ty < q.gy + 3; ty++) {
          for (let tx = q.gx - 3; tx < q.gx + 3; tx++) {
            for (const [u, v] of [[0.03, 0.03], [0.97, 0.03], [0.03, 0.97], [0.97, 0.97], [0.5, 0.5]]) assert.ok(T.ground(tx + u, ty + v), `${what}: the apron's tile ${tx}, ${ty} on the floor at ${u}, ${v}`);
          }
        }
        // the braziers, banners and altar on the canyon floor; nothing of it on a plateau tile
        const mine = L.props.filter((p) => p.kind === 'piece' && (p.name === HOLD.brazier || p.name === HOLD.banner || p.name === HOLD.altar) && Math.abs(p.x - q.gx) < 4 && p.y >= q.gy - 0.1 && p.y < q.gy + 3.2);
        assert.equal(mine.length, 5, `${what}: two braziers, two banners, the altar`);
        for (const p of mine) {
          assert.ok(T.ground(p.x, p.y), `${what}: ${p.name} at ${p.x}, ${p.y} on the floor`);
          assert.equal(L.floor.tiles[p.ty * L.floor.w + p.tx], T_FLOOR, `${what}: ${p.name}'s tile floor`);
        }
        // the door: the wall's foot straight along x on its yard's back line, rock behind it, floor before it, all the door's width
        for (let x = q.gx - 3.2; x <= q.gx + 3.2; x += 0.1) {
          assert.ok(!T.ground(x, q.gy - 0.04), `${what}: the wall behind the apron at ${x.toFixed(1)}`);
          assert.ok(T.ground(x, q.gy + 0.04), `${what}: the floor before the wall at ${x.toFixed(1)}`);
        }
        // and the door's own tiles walked into
        for (const tx of [q.gx - 1, q.gx]) assert.equal(L.walk[q.gy * L.floor.w + tx], 1, `${what}: the door's tile ${tx} walked`);
        holds++;
      }
    });
  }
  assert.ok(holds >= 5, `${holds} strongholds`);
});

/** Paint a window of a floor's ground round world (x, y), w by h picture pixels. */
function windowAt(T: ReturnType<typeof terrainOf>, x: number, y: number, w = 520, h = 420) {
  const [px, py] = pictureOf(x, y);
  return paintTerrain(T, Math.round(px - w / 2), Math.round(py - h / 2), w, h);
}

/** Over a painted window: of every edge of a top that looks down the screen (a floor pixel with rock over it), how many have their face drawn down to it, the whole of the rock's height or as far as the rock goes. */
function facesDown(piece: ReturnType<typeof paintTerrain>, H: number): { edges: number; whole: number } {
  const { w, h, kind } = piece;
  let edges = 0;
  let whole = 0;
  for (let c = 0; c < w; c++) {
    for (let r = H + 2; r < h; r++) {
      if (kind[r * w + c] !== TK.Floor || kind[(r - 1) * w + c] === TK.Floor) continue;
      // (the rock's own run up the column, as painted floor tells it: up to H)
      let run = 0;
      while (run < H && r - 1 - run >= 0 && kind[(r - 1 - run) * w + c] !== TK.Floor) run++;
      edges++;
      let face = 0;
      while (face < run && kind[(r - 1 - face) * w + c] === TK.Face) face++;
      if (face >= run - 1) whole++;
    }
  }
  return { edges, whole };
}

test('THE CANYON WALLS: a cliff face drawn down to the floor under every edge of a top that looks down the screen (none lost under a point of the plateau)', () => {
  let edges = 0;
  let lostBefore = 0;
  for (const seed of [925158, 4, 9]) {
    const { floor, land } = generateAct1(8, seed);
    const T = terrainOf(floor, CANYON_LOOK);
    for (let k = 0; k < land.way.length; k++) {
      const [x, y] = land.way[k];
      const before = off(() => facesDown(windowAt(T, x, y), CANYON_LOOK.rise));
      lostBefore += before.edges - before.whole;
      const after = on(() => facesDown(windowAt(T, x, y), CANYON_LOOK.rise));
      assert.equal(after.whole, after.edges, `seed ${seed}, at ${x.toFixed(1)}, ${y.toFixed(1)}: ${after.edges - after.whole} of ${after.edges} edges without their face`);
      edges += after.edges;
    }
  }
  assert.ok(edges > 2000, `${edges} edges looked at`);
  // (and before, some were lost: the test sees what he saw)
  assert.ok(lostBefore > 100, `${lostBefore} lost before`);
});

test('THE CANYON WALLS: nothing of the tops stands on a face (a jutting point\'s tree drawn up over the far wall), and the walls stand only on rock', () => {
  const { floor, land } = generateAct1(8, 925158);
  const T = terrainOf(floor, CANYON_LOOK);
  on(() => {
    let looked = 0;
    for (const [x, y] of land.way) {
      const p = windowAt(T, x, y, 400, 300);
      for (let r = 0; r < p.h; r += 5) {
        for (let c = 0; c < p.w; c += 5) {
          const k = p.kind[r * p.w + c];
          if (k === TK.Face) {
            assert.equal(clearOfFloor(T, p.x0 + c, p.y0 + r, 6, 20), false, 'no top piece set on a face');
            looked++;
          }
        }
      }
    }
    assert.ok(looked > 200, `${looked} face pixels looked at`);
  });
  // (the floor's own pixels are floor, before and after: what is walked on is never painted over)
  for (const [x, y] of land.way.slice(0, 4)) {
    const a = windowAt(T, x, y);
    const b = on(() => windowAt(T, x, y));
    for (let i = 0; i < a.kind.length; i++) assert.equal(a.kind[i] === TK.Floor, b.kind[i] === TK.Floor);
  }
});

test('the rest of the descent is not touched: the switch asks only the canyon\'s look and floors 8 and 9', () => {
  assert.equal(CANYON_LOOK.downFaces, true);
  void CUT_FAR;
});
