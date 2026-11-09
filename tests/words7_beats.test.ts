// THE SEVEN NEW WORDS' LOOKS AT WORK (src/render/words7.ts, behind WORDS7_LOOK, off): their beats, each called up by the main
// chat's events (its board post of 8 Nov 07:55) and what its rules keep on those they touch. His word on the stills, 9 Nov by 07:20:
// “Yes, animate them (Recommended)”. These hold:
//   1. each event calls up its look: drawn through its beats, and gone, every pixel of it, when its time is up;
//   2. what the rules keep (bleeding, stolen gold, a monster with Culling while he is low, the three zones) is drawn while it is
//      kept and gone after;
//   3. with the switch off, nothing at all, whatever the rules say;
//   4. nothing cyan on a monster's side; the enemy's pink there;
//   5. every look made by an event has its beats written down, and lasts at least its build and its hit.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import { W7, W7_BEATS, WORDS7_LOOK, airW7, clearW7, eventsW7, floorW7, lightsW7, tickW7 } from '../src/render/words7';

function monster(id: number, x: number, y: number): Monster {
  return { id, x, y, r: 0.4, kind: 'skeleton', champion: false, boss: false, elite: false, dead: false, seen: true, anim: 'idle', flash: 0, frozenT: 0, fx: -1, fy: 0, words: [] } as unknown as Monster;
}
const level = { open: new Array(30 * 30).fill(1), floor: { w: 30, h: 30 } };
function world(): Game {
  const ms = [monster(1, 11.3, 10), monster(2, 12.6, 10), monster(3, 13.9, 10)];
  return { level, hero: { x: 10, y: 10, fx: 1, fy: 0, life: 100, d: { maxLife: 100 }, move: null }, monsters: ms, projectiles: [], zones: [] } as unknown as Game;
}
function canvas(): { g: CanvasRenderingContext2D; drawn: () => number; colours: Set<string> } {
  let n = 0;
  const colours = new Set<string>();
  const g = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect() {
      n++;
      colours.add(String(this.fillStyle).toLowerCase());
    },
    beginPath: () => {},
    rect: () => {},
    clip: () => {},
    save: () => {},
    restore: () => {},
    drawImage: () => {},
  };
  return { g: g as unknown as CanvasRenderingContext2D, drawn: () => n, colours };
}
const cam: Cam = { ox: 300, oy: -150, lift: null } as unknown as Cam;
const everywhere = (): boolean => true;
function draw(gm: Game): { n: number; colours: Set<string> } {
  const c = canvas();
  floorW7(c.g, cam, 1, gm, everywhere);
  airW7(c.g, cam, 1, gm);
  return { n: c.drawn(), colours: c.colours };
}
function lit(gm: Game): number {
  let n = 0;
  lightsW7(() => n++, cam, gm, 1);
  return n;
}
const on = <T>(fn: () => T): T => {
  const was = WORDS7_LOOK.on;
  WORDS7_LOOK.on = true;
  try {
    return fn();
  } finally {
    WORDS7_LOOK.on = was;
  }
};
/** Run the looks' clock `secs` on, at 30 pictures a second; the most pixels drawn in any picture. */
function run(gm: Game, fx: Fx, secs: number): number {
  let most = 0;
  for (let i = 0; i < Math.round(secs * 30); i++) {
    tickW7(1 / 30, gm, fx);
    most = Math.max(most, draw(gm).n);
  }
  return most;
}
const cyanish = (c: string): boolean => {
  if (!/^#[0-9a-f]{6}$/.test(c)) return false;
  const n = parseInt(c.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mx = Math.max(r, g, b);
  const d = mx - Math.min(r, g, b);
  if (d === 0 || mx / 255 < 0.45 || d / mx < 0.3) return false;
  const h = (mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4) * 60;
  const hh = (h + 360) % 360;
  return hh > 170 && hh < 200;
};

/** Every event of the rules', as the looks read them (the README lists their fields). */
const EVENTS: [string, Record<string, unknown>, boolean][] = [
  ['pierceLine', { from: { x: 10, y: 10 }, to: { x: 16, y: 10 } }, false],
  ['lance', { from: { x: 10.5, y: 10 }, to: { x: 14.5, y: 10 }, width: 1, delay: 0.5 }, false],
  ['bleedOn', { id: 1 }, false],
  ['heroBleed', { id: 1 }, true],
  ['reapSoul', { x: 12.6, y: 10 }, false],
  ['spirit', { id: 2, x: 12, y: 10.5, secs: 1.5 }, false],
  ['spiritHit', { id: 2, target: 3 }, false],
  ['rise', { x: 12.6, y: 10 }, true],
  ['culled', { id: 1 }, false],
  ['culled', { id: 1, mark: { x: 11.5, y: 10 } }, false],
  ['cullBlow', { id: 1 }, true],
  ['surge', {}, false],
  ['surge', { dodge: true, x0: 8, y0: 10 }, false],
  ['surge', { id: 1 }, true],
  ['surgeWarn', { id: 1, secs: 1 }, true],
  ['goldSpray', { x: 12.6, y: 10, item: true }, false],
  ['goldBurst', { x: 12.6, y: 10 }, false],
  ['goldStolen', { id: 1 }, true],
  ['reflection', {}, false],
  ['mirrorCast', { x: 9, y: 10 }, false],
  ['mirrorBack', { id: 1 }, true],
];

test('1. each event calls up its look, drawn through its beats, and gone when its time is up', () => {
  on(() => {
    for (const [t, e] of EVENTS) {
      clearW7();
      const gm = world();
      const fx = new Fx();
      fx.fallen.push({ figure: 'skeleton', x: 12.6, y: 10, back: false, flip: false, t: 5 });
      tickW7(0, gm, fx);
      eventsW7([{ t, ...e }], gm, fx);
      assert.equal(W7.acts.length, 1, `${t}: one look`);
      const life = W7.acts[0].dur;
      assert.ok(life > 0.2 && life < 6.1, `${t}: ${life} s`);
      const most = run(gm, fx, life * 0.9);
      assert.ok(most > 30, `${t}: drew only ${most} pixels at most`);
      assert.ok(lit(gm) > 0, `${t} gives no light`);
      run(gm, fx, 0.15 + life * 0.1);
      assert.equal(W7.acts.length, 0, `${t}: still there after ${life} s`);
      assert.equal(draw(gm).n, 0, `${t}: pixels left after its time`);
    }
    clearW7();
  });
});

test('2. what the rules keep is drawn while it is kept, and gone after', () => {
  on(() => {
    clearW7();
    const gm = world();
    const fx = new Fx();
    tickW7(0, gm, fx);
    const [a, b] = gm.monsters as unknown as { x: number; bleedT: number; stolen: number; words: string[]; dead: boolean }[];
    // bleeding, walking: drops on it and splashes where it walks; stopped, they dry and are gone
    a.bleedT = 2;
    for (let i = 0; i < 30; i++) {
      a.x += 0.03;
      tickW7(1 / 30, gm, fx);
    }
    assert.ok(W7.splashes.length >= 3, `only ${W7.splashes.length} splashes walking a tile`);
    assert.ok(draw(gm).n > 30);
    a.bleedT = 0;
    run(gm, fx, 3.1);
    assert.equal(W7.splashes.length, 0);
    assert.equal(draw(gm).n, 0, 'the blood gone');
    // his gold carried off: at its belt; it dies, and the coins burst out of it, and are gone
    b.stolen = 5;
    tickW7(1 / 30, gm, fx);
    assert.ok(draw(gm).n > 0, 'his coins at its belt');
    b.dead = true;
    tickW7(1 / 30, gm, fx);
    assert.equal(W7.acts.length, 1, 'they burst out of it');
    run(gm, fx, 2.2);
    assert.equal(W7.acts.length, 0);
    assert.equal(draw(gm).n, 0);
    // Culling on a monster: it burns while he is low, and dies down when he is not
    a.words = ['culling'];
    (gm.hero as unknown as { life: number }).life = 20;
    run(gm, fx, 0.4);
    assert.ok(draw(gm).n > 30, 'it burns while he is low');
    (gm.hero as unknown as { life: number }).life = 90;
    run(gm, fx, 0.4);
    assert.equal(draw(gm).n, 0, 'and not when he is not');
    // the three zones, laid as the rules lay them, and taken away
    for (const kind of ['thorns', 'reaper', 'mirror']) {
      gm.zones.push({ x: 12, y: 11, r: 1.2, t: 0, dur: 4, kind } as unknown as Game['zones'][number]);
      for (let i = 0; i < 20; i++) (gm.zones[0] as unknown as { t: number }).t += 1 / 30;
      assert.ok(draw(gm).n > 30, `${kind}: drawn while it lies`);
      assert.ok(lit(gm) > 0, `${kind}: lit`);
      gm.zones.length = 0;
      assert.equal(draw(gm).n, 0, `${kind}: gone with it`);
    }
    clearW7();
  });
});

test('3. with the switch off, nothing at all, whatever the rules say', () => {
  assert.equal(WORDS7_LOOK.on, false);
  clearW7();
  const gm = world();
  const fx = new Fx();
  (gm.monsters[0] as unknown as { bleedT: number }).bleedT = 3;
  (gm.monsters[1] as unknown as { stolen: number }).stolen = 3;
  gm.zones.push({ x: 12, y: 11, r: 1.2, t: 1, dur: 4, kind: 'thorns' } as unknown as Game['zones'][number]);
  for (const [t, e] of EVENTS) eventsW7([{ t, ...e }], gm, fx);
  tickW7(0.5, gm, fx);
  assert.equal(W7.acts.length, 0);
  assert.equal(draw(gm).n, 0);
  assert.equal(lit(gm), 0);
});

test("4. nothing cyan on a monster's side; the enemy's pink there", () => {
  on(() => {
    for (const [t, e, monsterSide] of EVENTS) {
      if (!monsterSide) continue;
      clearW7();
      const gm = world();
      const fx = new Fx();
      fx.fallen.push({ figure: 'skeleton', x: 12.6, y: 10, back: false, flip: false, t: 5 });
      tickW7(0, gm, fx);
      eventsW7([{ t, ...e }], gm, fx);
      const life = W7.acts[0].dur;
      const seen = new Set<string>();
      for (let i = 0; i < Math.round(life * 30); i++) {
        tickW7(1 / 30, gm, fx);
        for (const c of draw(gm).colours) seen.add(c);
      }
      assert.ok(![...seen].some(cyanish), `${t} shows cyan: ${[...seen].filter(cyanish)}`);
      assert.ok(seen.has('#ff4f8a') || seen.has('#c02860'), `${t}: no pink`);
    }
    clearW7();
  });
});

test('5. every look an event makes has its beats written down, and lasts at least its build and its hit', () => {
  on(() => {
    for (const [t, e] of EVENTS) {
      clearW7();
      const gm = world();
      const fx = new Fx();
      fx.fallen.push({ figure: 'skeleton', x: 12.6, y: 10, back: false, flip: false, t: 5 });
      tickW7(0, gm, fx);
      eventsW7([{ t, ...e }], gm, fx);
      const a = W7.acts[0];
      const key = [a.word, a.side, a.part].filter(Boolean).join(':');
      const b = W7_BEATS[key];
      assert.ok(b, `${t}: no beats for ${key}`);
      assert.ok(a.dur + 1e-6 >= b.build + b.hit, `${t}: ${a.dur} s is shorter than its build and hit (${b.build + b.hit})`);
    }
    clearW7();
  });
});
