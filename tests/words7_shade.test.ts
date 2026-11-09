// REAPING'S SPIRIT, AT HIS WORD (src/render/words7.ts, behind WORDS7_LOOK, off). His words, 9 Nov 2026, 13:38: “Maybe change
// the shade from the reaping.  Just a little grey scale version of the shades we have in the early levels.  Maybe 30% smaller.
// Claw rake attacks”. These hold, painted on a real canvas (@napi-rs/canvas) as the game paints:
//   1. the spirit is always the early floors' Shade, the one the live game shows, whatever was slain: its picture in greys
//      (its light and shade kept), 0.7 its size, its edge all round the friend's cyan;
//   2. it moves as the Shade moves: its walk, its stand; its claws drawn back as the rules wind its blow up; its rake from the
//      blow on;
//   3. its blow is a claw rake: grey-white gashes with his cyan glinting at their points, gone when its time is up.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore - the node canvas the art can be painted on here
import { createCanvas } from '@napi-rs/canvas';
import { makeBestiary } from '../src/art/bestiary';
import type { Sprite } from '../src/engine/px';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import { W7, W7_FRIEND, W7_TIME, WORDS7_LOOK, airW7, clearW7, eventsW7, lookW7, shadeArt, shadeFrameOf, tickW7 } from '../src/render/words7';

(globalThis as unknown as { document: unknown }).document = { createElement: (): unknown => createCanvas(1, 1) };

const pixels = (sp: Sprite): { d: Uint8ClampedArray; w: number; h: number } => {
  const g = (sp.img as unknown as { getContext: (k: string) => CanvasRenderingContext2D }).getContext('2d');
  return { d: g.getImageData(0, 0, sp.img.width, sp.img.height).data, w: sp.img.width, h: sp.img.height };
};
const hex = (r: number, g: number, b: number): string => `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
function spirit(over: Partial<Monster> = {}): Monster {
  return { id: 41, kind: 'skeleton', x: 12, y: 10, fx: 1, fy: 0, anim: 'idle', animT: 0, state: 'recover', t: 1e9, dead: false, words: [], spirit: true, ...over } as unknown as Monster;
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

test("1. the spirit is the early floors' Shade as the game shows it, in greys, 0.7 its size, its edge his cyan", () => {
  on(() => {
    // the Shade the live game shows (its bestiary's), frame for frame
    const live = makeBestiary().of('shade').front.idle[0];
    const ours = shadeArt().front.idle[0];
    const a = pixels(live);
    const b = pixels(ours);
    assert.equal(a.w, b.w);
    assert.equal(a.h, b.h);
    assert.deepEqual([...a.d], [...b.d], "the game's own Shade");
    // whatever was slain (a skeleton here): the Shade's picture, greyed, smaller
    for (const kind of ['skeleton', 'cultist']) {
      W7.clock = 0;
      const m = spirit({ kind } as Partial<Monster>);
      const src = shadeFrameOf(m);
      const look = lookW7(m, { img: createCanvas(30, 40), w: 30, h: 40, ax: 15, ay: 39 } as unknown as Sprite);
      assert.ok(look, 'a spirit is drawn by the look');
      const sp = (look as { sp: Sprite }).sp;
      const s = pixels(src);
      const p = pixels(sp);
      // (0.7 its size, and a pixel of room all round for its cyan edge)
      assert.equal(p.w, Math.round(s.w * W7_TIME.spiritScale) + 2, `${kind}: 0.7 its width`);
      assert.equal(p.h, Math.round(s.h * W7_TIME.spiritScale) + 2, `${kind}: 0.7 its height`);
      const dn = src.density ?? 1;
      assert.ok(Math.abs(sp.ay - (src.ay * 0.7 + 1 / dn)) < 0.6, 'standing on its own floor point, 0.7 as far below it');
      const cyan = W7_FRIEND[2].toLowerCase();
      const body = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < p.w && y < p.h && p.d[(y * p.w + x) * 4 + 3] === 255;
      let greys = 0;
      let rim = 0;
      let bare = 0;
      const ours2: number[] = [];
      const theirs: number[] = [];
      for (let y = 0; y < p.h; y++) {
        for (let x = 0; x < p.w; x++) {
          const i = (y * p.w + x) * 4;
          if (p.d[i + 3] === 0) continue;
          if (body(x, y)) {
            assert.ok(p.d[i] === p.d[i + 1] && p.d[i + 1] === p.d[i + 2], `${kind}: a colour left at ${x},${y}`);
            greys++;
            // its edge: never bare to the dark (his cyan all round it)
            for (const [ox, oy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
              const qx = x + ox;
              const qy = y + oy;
              if (qx < 0 || qy < 0 || qx >= p.w || qy >= p.h || p.d[(qy * p.w + qx) * 4 + 3] === 0) bare++;
            }
            // its light and shade, as the Shade's own there
            const sx = Math.min(s.w - 1, Math.floor((x - 0.5) / W7_TIME.spiritScale));
            const sy = Math.min(s.h - 1, Math.floor((y - 0.5) / W7_TIME.spiritScale));
            const j = (sy * s.w + sx) * 4;
            if (s.d[j + 3] === 255) {
              ours2.push(p.d[i]);
              theirs.push(s.d[j] * 0.3 + s.d[j + 1] * 0.59 + s.d[j + 2] * 0.11);
            }
          } else {
            assert.equal(hex(p.d[i], p.d[i + 1], p.d[i + 2]), cyan, `${kind}: its edge not his cyan at ${x},${y}`);
            rim++;
          }
        }
      }
      assert.ok(greys > 60, `${kind}: its body (${greys})`);
      assert.ok(rim > 30, `${kind}: its cyan edge (${rim})`);
      assert.equal(bare, 0, `${kind}: its body bare to the dark in ${bare} places`);
      const mean = (v: number[]): number => v.reduce((q, r) => q + r, 0) / v.length;
      const ma = mean(ours2);
      const mb = mean(theirs);
      let num = 0;
      let da = 0;
      let db = 0;
      for (let i = 0; i < ours2.length; i++) {
        num += (ours2[i] - ma) * (theirs[i] - mb);
        da += (ours2[i] - ma) ** 2;
        db += (theirs[i] - mb) ** 2;
      }
      const r = num / Math.sqrt(da * db);
      assert.ok(r > 0.8, `${kind}: its light and shade not the Shade's (${r.toFixed(2)})`);
    }
  });
});

test('2. it moves as the Shade moves: its walk, its stand; its claws drawn back as the rules wind up; its rake from the blow', () => {
  on(() => {
    const art = shadeArt();
    const clip0 = art.front.clips?.attack;
    assert.ok(clip0 && clip0.hit !== undefined, "the Shade's own attack");
    const clip = clip0 as NonNullable<typeof clip0>;
    W7.clock = 0.35;
    assert.equal(shadeFrameOf(spirit()), art.front.idle[Math.floor(0.35 * (art.front.idleFps ?? 2)) % art.front.idle.length], 'its stand');
    assert.equal(shadeFrameOf(spirit({ anim: 'walk', animT: 0.4 } as Partial<Monster>)), art.front.walk[Math.floor(0.4 * (art.front.walkFps ?? 8)) % art.front.walk.length], 'its walk');
    assert.equal(shadeFrameOf(spirit({ fx: -1, fy: -0.2 } as Partial<Monster>)), art.back.idle[Math.floor(0.35 * (art.back.idleFps ?? 2)) % art.back.idle.length], 'from behind');
    // the rules winding its blow up: its claws drawn back, further as they wind (skeleton: 0.4 s)
    const at = (s: Sprite): number => clip.frames.indexOf(s);
    const early = at(shadeFrameOf(spirit({ anim: 'attack', state: 'windup', t: 0.35 } as Partial<Monster>)));
    const late = at(shadeFrameOf(spirit({ anim: 'attack', state: 'windup', t: 0.02 } as Partial<Monster>)));
    const hitAt = Math.floor((clip.hit ?? 0) * clip.fps);
    assert.ok(early >= 0 && late > early && late <= hitAt, `winding up: ${early} then ${late}, the blow at ${hitAt}`);
    // the blow (spiritHit): from the blow on, its rake and follow-through
    clearW7();
    const gm = { level: { open: new Array(900).fill(1), floor: { w: 30, h: 30 } }, hero: { x: 9, y: 10, fx: 1, fy: 0 }, monsters: [spirit(), { ...spirit(), id: 42, spirit: false, x: 13.4 }], projectiles: [], zones: [] } as unknown as Game;
    tickW7(0, gm, new Fx());
    eventsW7([{ t: 'spiritHit', id: 41, target: 42 }], gm, new Fx());
    tickW7(0.1, gm, new Fx());
    assert.equal(at(shadeFrameOf(gm.monsters[0])), Math.floor(((clip.hit ?? 0) + 0.1) * clip.fps + 1e-6), 'raking, a tenth of a second past the blow');
  });
});

test('3. its blow is a claw rake: grey-white gashes, his cyan at their points; gone when its time is up', () => {
  on(() => {
    clearW7();
    const foe = { ...spirit(), id: 42, spirit: false, x: 13.4 } as unknown as Monster;
    const gm = { level: { open: new Array(900).fill(1), floor: { w: 30, h: 30 } }, hero: { x: 9, y: 10, fx: 1, fy: 0 }, monsters: [spirit(), foe], projectiles: [], zones: [] } as unknown as Game;
    tickW7(0, gm, new Fx());
    eventsW7([{ t: 'spiritHit', id: 41, target: 42 }], gm, new Fx());
    const cam: Cam = { ox: 300, oy: -150, lift: null } as unknown as Cam;
    const draw = (): Map<string, string> => {
      const px = new Map<string, string>();
      const g = {
        fillStyle: '',
        globalAlpha: 1,
        fillRect(x: number, y: number) {
          px.set(`${x},${y}`, String(this.fillStyle).toLowerCase());
        },
        beginPath: () => {},
        rect: () => {},
        clip: () => {},
        save: () => {},
        restore: () => {},
        drawImage: () => {},
      };
      airW7(g as unknown as CanvasRenderingContext2D, cam, 1, gm);
      return px;
    };
    W7.acts[0].t = W7_TIME.rakeStrike * 0.99;
    const at = draw();
    const cols = new Set(at.values());
    assert.ok(at.size > 60, `the gashes (${at.size})`);
    assert.ok(cols.has(W7_FRIEND[3].toLowerCase()), 'his cyan at their points');
    const greyish = (c: string): boolean => {
      const n = parseInt(c.slice(1), 16);
      const v = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
      return Math.max(...v) - Math.min(...v) <= 12;
    };
    assert.ok([...cols].every((c) => c === W7_FRIEND[3].toLowerCase() || greyish(c)), `grey-white: ${[...cols].join(' ')}`);
    W7.acts[0].t = W7_TIME.rakeStrike + W7_TIME.rakeFade + 0.001;
    assert.equal(draw().size, 0, 'gone');
  });
});
