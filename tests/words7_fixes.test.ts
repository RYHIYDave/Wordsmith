// THE SEVEN NEW WORDS' LOOKS, STEP 2b (src/render/words7.ts, behind WORDS7_LOOK, off): what a close look at the film
// (words7_film.mp4, d3965e7c) found, made right before he sees it. These hold:
//   1. Piercing in front: never through stone (a wall or a pillar in its line, and it bursts there, nothing of it beyond); at
//      its line's end its trail runs in after it and is gone, its motes winking out;
//   2. Piercing behind: the crack before the lance and after it is jagged and forks, never a ruled line; the spear goes up whole;
//   3. Culling in front: an instant held (the one it takes stopped), then its own blade through it, a blade and not a line, whole
//      in every picture as it sweeps and fades; it lies cut in two; (step 2c) its two halves come down whole to the floor, the
//      top a beat after the legs, beside them: nothing hangs in the air, nothing goes into the floor;
//   4. Surging, the dodge: nothing left standing where he stood (its wind runs along his roll, or there is none);
//   5. Mirroring in front: his reflection beside him, ahead of him on the screen, its cut in front of it, landing there;
//   6. Mirroring behind: the mirror rises where he stood only once he has stepped off it; its repeat is a cut of glass, whole;
//   8. Mirroring on a monster: its shards a beat after his blow, flying into him.
// (7, nothing standing in anything, is the film's own check: tools/scenarios/words7_film.mjs, `crowd`, every picture.)
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { Fx, wx, wy } from '../src/render/fx';
import type { Cam, Fallen } from '../src/render/fx';
import { CUT_REST, W7, W7_RAMP, W7_TIME, WORDS7_LOOK, airW7, clearW7, cutFall, demoW7, eventsW7, fallenW7, floorW7, playW7, tickW7 } from '../src/render/words7';

function monster(id: number, x: number, y: number): Monster {
  return { id, x, y, r: 0.4, kind: 'skeleton', champion: false, boss: false, elite: false, dead: false, seen: true, anim: 'idle', flash: 0, frozenT: 0, fx: -1, fy: 0, words: [] } as unknown as Monster;
}
type Level = { open: number[]; floor: { w: number; h: number }; props: { x: number; y: number; solid: boolean }[] };
function world(ms: Monster[] = [], level?: Level): Game {
  const lv = level ?? { open: new Array(30 * 30).fill(1), floor: { w: 30, h: 30 }, props: [] };
  return { level: lv, hero: { x: 10, y: 10, fx: 1, fy: 0, life: 100, d: { maxLife: 100 }, move: null }, monsters: ms, projectiles: [], zones: [] } as unknown as Game;
}
const cam: Cam = { ox: 300, oy: -150, lift: null } as unknown as Cam;
const everywhere = (): boolean => true;

/** A canvas that keeps every pixel laid on it, and its colour. */
function canvas(): { g: CanvasRenderingContext2D; px: Map<string, string> } {
  const px = new Map<string, string>();
  const g = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect(x: number, y: number, w: number, h: number) {
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) px.set(`${x + i},${y + j}`, String(this.fillStyle).toLowerCase());
    },
    beginPath: () => {},
    rect: () => {},
    clip: () => {},
    save: () => {},
    restore: () => {},
    drawImage: () => {},
  };
  return { g: g as unknown as CanvasRenderingContext2D, px };
}
function draw(gm: Game, layer: 'floor' | 'air' | 'both' = 'both'): Map<string, string> {
  const c = canvas();
  if (layer !== 'air') floorW7(c.g, cam, 1, gm, everywhere);
  if (layer !== 'floor') airW7(c.g, cam, 1, gm);
  return c.px;
}
const pts = (px: Map<string, string>): [number, number][] => [...px.keys()].map((k) => k.split(',').map(Number) as [number, number]);
/** The pieces a picture is in (eight-connected), largest first. */
function pieces(px: Map<string, string>): number[] {
  const left = new Set(px.keys());
  const sizes: number[] = [];
  for (const k of [...left]) {
    if (!left.has(k)) continue;
    left.delete(k);
    const todo = [k];
    let n = 0;
    while (todo.length) {
      const [x, y] = (todo.pop() as string).split(',').map(Number);
      n++;
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const q = `${x + dx},${y + dy}`;
          if (left.has(q)) {
            left.delete(q);
            todo.push(q);
          }
        }
      }
    }
    sizes.push(n);
  }
  return sizes.sort((a, b) => b - a);
}
const on = <T>(fn: () => T): T => {
  const was = WORDS7_LOOK.on;
  WORDS7_LOOK.on = true;
  try {
    return fn();
  } finally {
    WORDS7_LOOK.on = was;
    clearW7();
  }
};
const S = (x: number, y: number, z = 0): [number, number] => [wx(cam, x, y), wy(cam, x, y) - z];

test('1. Piercing in front: never through stone; at its end the trail runs in after it and is gone', () => {
  on(() => {
    // a pillar in its line: it stops there, and only those before it are pierced
    clearW7();
    const lv: Level = { open: new Array(30 * 30).fill(1), floor: { w: 30, h: 30 }, props: [{ x: 14.5, y: 10.5, solid: true }] };
    const gm = world([monster(1, 11.6, 10.5), monster(2, 13.2, 10.5), monster(3, 16, 10.5)], lv);
    (gm.hero as { y: number }).y = 10.5;
    tickW7(0, gm, new Fx());
    eventsW7([{ t: 'pierceLine', from: { x: 10.3, y: 10.5 }, to: { x: 17.5, y: 10.5 } }], gm, new Fx());
    const a = W7.acts[0];
    assert.ok(a.stone, 'its line ends on stone');
    assert.ok(a.r > 3.4 && a.r < 3.9, `it stops at the pillar's face: ${a.r.toFixed(2)} tiles`);
    assert.deepEqual(a.ids, [1, 2], 'only those before the pillar are pierced');
    // a wall across it too
    clearW7();
    for (let y = 0; y < 30; y++) for (let x = 15; x < 30; x++) lv.open[y * 30 + x] = 0;
    lv.props.length = 0;
    tickW7(0, gm, new Fx());
    eventsW7([{ t: 'pierceLine', from: { x: 10.3, y: 10.5 }, to: { x: 19, y: 10.5 } }], gm, new Fx());
    const b = W7.acts[0];
    assert.ok(b.stone && b.r < 4.75 && b.r > 4.4, `it stops at the wall: ${b.r.toFixed(2)}`);
    // nothing of it beyond the stone's face, in any picture (across the screen: what falls, falls down the face)
    const [ex, ey] = S(b.x + b.dx * b.r, b.y + b.dy * b.r, 14);
    for (let i = 0; i < Math.round(b.dur * 30); i++) {
      tickW7(1 / 30, gm, new Fx());
      for (const [x, y] of pts(draw(gm))) {
        const beyond = x - ex;
        assert.ok(!(beyond > 2.5 && Math.abs(y - ey) < 16), `a pixel of it through the wall (${beyond.toFixed(1)} beyond), ${i} pictures in`);
      }
    }
    // an open end: its body runs in after its head and is gone in a tenth of a second; its motes are gone after
    clearW7();
    // (none along it this time: only the bolt is to be seen there)
    const gm2 = world([]);
    (gm2.hero as { y: number }).y = 10.5;
    tickW7(0, gm2, new Fx());
    eventsW7([{ t: 'pierceLine', from: { x: 10.3, y: 10.5 }, to: { x: 14.3, y: 10.5 } }], gm2, new Fx());
    const c = W7.acts[0];
    assert.ok(!c.stone);
    const [sx, sy] = S(c.x, c.y, 14);
    const [fx2, fy2] = S(c.x1, c.y1, 14);
    const L = Math.hypot(fx2 - sx, fy2 - sy);
    const body = (px: Map<string, string>): number =>
      pts(px).filter(([x, y]) => {
        const along = ((x - sx) * (fx2 - sx) + (y - sy) * (fy2 - sy)) / L;
        const off = Math.abs(-(x - sx) * (fy2 - sy) + (y - sy) * (fx2 - sx)) / L;
        // (short of its end by more than its motes fly)
        return along > L * 0.35 && along < L - 12 && off < 3;
      }).length;
    const reachAt = c.r / W7_TIME.pierceSpeed;
    c.t = reachAt - 0.02;
    assert.ok(body(draw(gm2, 'air')) > 20, 'its body along the line as it flies');
    c.t = reachAt + 0.11;
    assert.equal(body(draw(gm2, 'air')), 0, 'its body run in after it a tenth of a second after its end');
    c.t = reachAt + 0.45;
    const [nx, ny] = [fx2, fy2];
    assert.equal(pts(draw(gm2, 'air')).filter(([x, y]) => Math.hypot(x - nx, y - ny) < 30).length, 0, 'its motes winked out');
  });
});

test('2. Piercing behind: its crack is jagged and forks, before the lance and after it; the spear goes up whole', () => {
  on(() => {
    clearW7();
    const gm = world();
    tickW7(0, gm, new Fx());
    eventsW7([{ t: 'lance', from: { x: 10.5, y: 10 }, to: { x: 14.5, y: 10 }, width: 1, delay: 0.5 }], gm, new Fx());
    const a = W7.acts[0];
    const [x0, y0] = S(a.x, a.y);
    const [x1, y1] = S(a.x1, a.y1);
    const L = Math.hypot(x1 - x0, y1 - y0);
    const offs = (px: Map<string, string>): Set<number> => {
      const o = new Set<number>();
      for (const [x, y] of pts(px)) o.add(Math.round((-(x - x0) * (y1 - y0) + (y - y0) * (x1 - x0)) / L));
      return o;
    };
    for (const t of [0.45, 0.5 + 0.06 + 0.16 + 0.3, 1.6]) {
      a.t = t;
      const o = offs(draw(gm, 'floor'));
      assert.ok(o.size >= 6, `at ${t} s its crack keeps to ${o.size} rows off its line: ruled`);
      assert.ok(Math.max(...[...o].map(Math.abs)) >= 3, `at ${t} s nothing forks off it`);
    }
    // the spear pulled up and gone: whole in every picture, dimming, never broken into pieces
    for (const out of [0.03, 0.08, 0.13]) {
      a.t = a.delay + W7_TIME.lanceFall + W7_TIME.lanceRun + out;
      const air = draw(gm, 'air');
      assert.ok(pieces(air)[0] >= 45, `${out} s after: the spear in pieces (${pieces(air).slice(0, 4).join(', ')})`);
    }
  });
});

test('3. Culling in front: an instant held, then its own blade through it, whole as it sweeps and fades; it lies cut in two', () => {
  on(() => {
    clearW7();
    const gm = world();
    const fx = new Fx();
    const body: Fallen = { figure: 'skeleton', x: 11.6, y: 10, back: false, flip: false, t: 0 } as Fallen;
    fx.fallen.push(body);
    tickW7(0, gm, fx);
    eventsW7([{ t: 'culled', x: 11.6, y: 10 }], gm, fx);
    const C = W7_RAMP.culling;
    let t = 0;
    for (let i = 0; i < 30; i++) {
      // (the game's own clock moves its fall on; the look holds it till the blade is through)
      body.t += 1 / 30;
      tickW7(1 / 30, gm, fx);
      t += 1 / 30;
      const px = draw(gm);
      const cols = new Set(px.values());
      if (t < W7_TIME.cullHold - 1e-6) {
        assert.equal(body.t, 0, 'held still');
        assert.equal(fallenW7(body, {} as never), null, 'whole while held');
        assert.ok(px.size > 4 && px.size < 90, `held: a glint only (${px.size})`);
        assert.ok(cols.has(C[3]) || cols.has(C[4]), 'a violet glint');
        continue;
      }
      const a = W7.acts[0];
      if (!a || a.t > W7_TIME.cullHold + W7_TIME.cullSweep + 0.27) break;
      const big = pieces(px)[0] ?? 0;
      assert.ok(big >= 40, `${a.t.toFixed(3)} s: its blade in pieces (${pieces(px).slice(0, 5).join(', ')})`);
      if (a.t < W7_TIME.cullHold + W7_TIME.cullSweep + 0.01) {
        assert.ok(big >= 120 && cols.has(C[5]) && cols.has(C[3]), `sweeping: a blade, bone and violet (${big})`);
      }
    }
    assert.ok(W7.cut.has(body), 'it lies cut in two');
  });
});

test('3b. Culling, the split: both halves come down whole to the floor, the top a beat after the legs, beside them; nothing hangs in the air', () => {
  const low = (p: { y: number; ang: number }, b: { x0: number; y0: number; x1: number; y1: number }): number => p.y + Math.abs(Math.sin(p.ang)) * (b.x1 - b.x0) / 2 + Math.abs(Math.cos(p.ang)) * (b.y1 - b.y0) / 2;
  const across = (p: { x: number; ang: number }, b: { x0: number; y0: number; x1: number; y1: number }): [number, number] => {
    const hw = Math.abs(Math.cos(p.ang)) * (b.x1 - b.x0) / 2 + Math.abs(Math.sin(p.ang)) * (b.y1 - b.y0) / 2;
    return [p.x - hw, p.x + hw];
  };
  // (a skeleton's halves as it stands, and a broader one's; struck from either side)
  const bodies = [
    { top: { x0: -7, y0: -30, x1: 7, y1: -12 }, bot: { x0: -5, y0: -12, x1: 5, y1: 0 } },
    { top: { x0: -10, y0: -36, x1: 9, y1: -14 }, bot: { x0: -8, y0: -15, x1: 8, y1: 0.5 } },
  ];
  for (const { top, bot } of bodies) {
    for (const way of [1, -1]) {
      let was: { x: number; y: number } | null = null;
      let still = 0;
      const end = cutFall(CUT_REST, way, top, bot);
      for (let t = 0; t <= 1.2; t += 1 / 60) {
        const r = cutFall(t, way, top, bot);
        assert.ok(Math.abs(low(r.bot, bot)) < 0.02, `${t.toFixed(2)} s: the legs off the floor or into it (${low(r.bot, bot).toFixed(2)})`);
        assert.ok(low(r.top, top) < 0.02, `${t.toFixed(2)} s: the top into the floor`);
        if (t >= r.topDown) assert.ok(Math.abs(low(r.top, top)) < 0.02, `${t.toFixed(2)} s: the top down, but off the floor`);
        else if (was) {
          // in the air it is always on the move: never hanging there
          if (Math.hypot(r.top.x - was.x, r.top.y - was.y) < 0.05) still++;
          assert.ok(still <= 1, `${t.toFixed(2)} s: the top hangs in the air`);
        }
        was = { x: r.top.x, y: r.top.y };
      }
      assert.ok(end.topDown > end.botDown + 0.05 && end.topDown < CUT_REST, `the top lands a beat after the legs (${end.botDown}, ${end.topDown.toFixed(3)})`);
      assert.ok(Math.abs(Math.abs(end.top.ang) - Math.PI / 2) < 1e-6 && Math.abs(Math.abs(end.bot.ang) - Math.PI / 2) < 1e-6, 'both lie on their sides');
      const [a0, a1] = across(end.top, top);
      const [b0, b1] = across(end.bot, bot);
      assert.ok(a1 <= b0 || b1 <= a0, `they lie beside each other, not one on the other (${a0.toFixed(1)}..${a1.toFixed(1)}, ${b0.toFixed(1)}..${b1.toFixed(1)})`);
      assert.ok(Math.sign(end.top.x - end.bot.x) === way, 'the top goes the way the blow went, the legs back');
    }
  }
});

test('4. Surging, the dodge: nothing left standing where he stood', () => {
  on(() => {
    for (const rolled of [true, false]) {
      clearW7();
      const gm = world();
      const h = gm.hero as unknown as { x: number; y: number; move: unknown };
      h.move = rolled ? { kind: 'roll', t: 0, dur: 0.24, x0: 8, y0: 10, x1: 11, y1: 10 } : null;
      if (!rolled) h.x = 8;
      tickW7(0, gm, new Fx());
      eventsW7([{ t: 'surge', dodge: true, x0: 8, y0: 10 }], gm, new Fx());
      const a = W7.acts[0];
      if (rolled) assert.deepEqual([a.x1, a.y1], [11, 10], 'its wind along his roll, to where it ends');
      const [X0, Y0] = S(8, 10);
      for (const t of [0.2, 0.3, 0.45]) {
        a.t = t;
        const above = pts(draw(gm, 'air')).filter(([x, y]) => Math.abs(x - X0) <= 1 && y >= Y0 - 20 && y <= Y0 - 2);
        assert.equal(above.length, 0, `${rolled ? 'rolled' : 'standing'}, ${t} s: a tick left where he stood (${above.length})`);
      }
    }
  });
});

test('5. Mirroring in front: his reflection beside him, ahead of him on the screen; its cut in front of it, landing there', () => {
  on(() => {
    for (const [fx, fy] of [[1, 0], [0, 1], [0.707, -0.707], [-1, 0], [0.6, 0.8]]) {
      clearW7();
      const gm = world();
      const h = gm.hero as unknown as { fx: number; fy: number; x: number; y: number };
      h.fx = fx;
      h.fy = fy;
      const [ox, oy] = demoW7(new Fx(), () => gm).beside();
      assert.ok(Math.abs(Math.hypot(ox, oy) - W7_TIME.mirrorStep) < 1e-6 && Math.abs(ox * fx + oy * fy) < 1e-6, 'beside him, square to his facing');
      const ahead = ((ox - oy) * 16) * ((fx - fy) * 16) + ((ox + oy) * 8) * ((fx + fy) * 8);
      assert.ok(ahead >= 0, `facing ${fx},${fy}: it stands behind him on the screen`);
      // one in front of it: its cut comes out in front of it and lands on it
      const rx = h.x + ox;
      const ry = h.y + oy;
      gm.monsters.push(monster(7, rx + fx * 1.4, ry + fy * 1.4));
      tickW7(0, gm, new Fx());
      eventsW7([{ t: 'reflection' }], gm, new Fx());
      const a = W7.acts[0];
      let sum = 0;
      let n = 0;
      let landed = false;
      const [RX, RY] = S(rx, ry);
      const [MX, MY] = S(rx + fx * 1.4, ry + fy * 1.4, 13);
      for (let i = 0; i < 9; i++) {
        a.t = i / 30;
        for (const [x, y] of pts(draw(gm, 'air'))) {
          sum += (x - RX) * ((fx - fy) * 16) + (y - RY + 10) * ((fx + fy) * 8);
          n++;
          if (Math.hypot(x - MX, y - MY) < 4) landed = true;
        }
      }
      assert.ok(n > 100 && sum / n > 0, `facing ${fx},${fy}: its cut is not in front of it`);
      assert.ok(landed, `facing ${fx},${fy}: its cut does not land on the one in front of it`);
    }
  });
});

test('6. Mirroring behind: it rises where he stood only once he has stepped off it; its repeat is a cut of glass, whole', () => {
  on(() => {
    clearW7();
    const gm = world();
    const z = { x: 10, y: 10, r: 0.6, t: 0, dur: 9, kind: 'mirror', look: 'mirror' };
    gm.zones.push(z as unknown as Game['zones'][number]);
    for (let i = 0; i < 15; i++) {
      z.t += 1 / 30;
      assert.equal(draw(gm).size, 0, 'nothing rises while he stands there');
    }
    (gm.hero as { x: number }).x = 12;
    z.t += 1 / 30;
    const first = draw(gm).size;
    for (let i = 0; i < 10; i++) z.t += 1 / 30;
    const risen = draw(gm).size;
    assert.ok(first < risen && risen > 150, `it grows up once he is off it (${first} then ${risen})`);
    // its repeat: his cut again, in glass, out of it: one piece, well clear of the pane
    clearW7();
    gm.zones.length = 0;
    playW7('mirroring', 'behind', { part: 'cast', x: 10, y: 10, dx: 1, dy: 0, dur: 2, t: 0.07 });
    const [PX] = S(10, 10);
    const cut = new Map([...draw(gm, 'air')].filter(([k]) => Math.abs(Number(k.split(',')[0]) - PX) > 13));
    assert.ok(pieces(cut)[0] >= 80, `its cut in glass in pieces (${pieces(cut).slice(0, 5).join(', ')})`);
  });
});

test('8. Mirroring on a monster: its shards a beat after his blow, flying into him', () => {
  on(() => {
    clearW7();
    const m = monster(1, 11.65, 10);
    const gm = world([m]);
    tickW7(0, gm, new Fx());
    eventsW7([{ t: 'mirrorBack', id: 1 }], gm, new Fx());
    const a = W7.acts[0];
    const [MX, MY] = S(m.x, m.y, 13);
    const [HX, HY] = S(10, 10, 16);
    let reached = false;
    // (a beat: a tenth of a second at the least)
    assert.ok(W7_TIME.mirrorBeat >= 0.1);
    for (let i = 0; i * (1 / 30) < a.dur; i++) {
      a.t = i / 30;
      const p = pts(draw(gm));
      if (a.t < 0.1) assert.ok(p.every(([x, y]) => Math.hypot(x - MX, y - MY) < 12), `${a.t.toFixed(2)} s: shards before the beat`);
      if (p.some(([x, y]) => Math.hypot(x - HX, y - HY) < 8)) reached = true;
    }
    assert.ok(reached, 'they fly into him');
  });
});
