// THE SEVEN NEW WORDS' LOOKS READ BY THE RULES' REAL NAMES (src/render/words7.ts, behind WORDS7_LOOK, off). They were drawn to the names
// of the main chat's board post of 8 Nov (its branch was not to be seen); its rules are on words10 now (game/state.ts GameEvent, game/
// game.ts), and where a name or a field differs the looks read the real one, the old as a fallback, no look changed. These hold, with
// each event shaped as the rules send it:
//   1. pierceLine and lance from x0, y0 (and the lance's width `w`); mirrorCast its way dx, dy;
//   2. heroBleed (where HE stands, no id): the slash from the monster nearest him;
//   3. the rules' spirits are game.spirits, not monsters: spirit (its `life`) and spiritHit (its id the spirit's, x0, y0 it, x1, y1
//      what it strikes) play on them, and a monster that happens to share a spirit's id is not drawn as one;
//   4. goldStolen (his place, no id): on the one carrying his gold; mirrorBack (x0, y0 its place): on the one there;
//   5. rise (sent as it dies, raised REAP.riseAfter later): its look waits for the body to have lain, standing as the rules raise it;
//   6. a monster's surge (the rules' own 'warn', from "...'s surge"): its wave as its warning runs out, none if it was broken off;
//   7. with the switch off, none of it.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { REAP } from '../src/game/defs';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { Fx } from '../src/render/fx';
import { W7, W7_TIME, WORDS7_LOOK, clearW7, eventsW7, lookW7, tickW7 } from '../src/render/words7';

function monster(id: number, x: number, y: number, more: Record<string, unknown> = {}): Monster {
  return { id, x, y, r: 0.4, kind: 'skeleton', champion: false, boss: false, elite: false, dead: false, seen: true, anim: 'idle', flash: 0, frozenT: 0, fx: -1, fy: 0, words: [], ...more } as unknown as Monster;
}
const level = { open: new Array(40 * 40).fill(1), floor: { w: 40, h: 40 }, props: [] };
function game(monsters: Monster[] = [], more: Record<string, unknown> = {}): Game {
  return { level, hero: { x: 10, y: 10, fx: 1, fy: 0, move: null, life: 100, d: { maxLife: 100 } }, monsters, projectiles: [], zones: [], spirits: [], ...more } as unknown as Game;
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
/** A fresh start: the looks joined to this game's level, nothing playing. */
function fresh(gm: Game, fx = new Fx()): Fx {
  clearW7();
  tickW7(0, gm, fx);
  clearW7();
  return fx;
}

test('1. pierceLine and lance from x0, y0 (the lance its width `w`); mirrorCast its way', () => {
  on(() => {
    const gm = game([monster(1, 13, 10)]);
    const fx = fresh(gm);
    eventsW7([{ t: 'pierceLine', x0: 12, y0: 10, x1: 15, y1: 10 }], gm, fx);
    const p = W7.acts[0];
    assert.equal(p.word, 'piercing');
    assert.deepEqual([p.x, p.y], [12, 10], 'from where the blow went on through, not from him');
    assert.ok(Math.abs(p.x1 - 15) < 1e-9);
    assert.deepEqual(p.ids, [1]);
    eventsW7([{ t: 'lance', x0: 10, y0: 10, x1: 14, y1: 10, w: 0.55, delay: 0.5 }], gm, fx);
    const l = W7.acts[1];
    assert.equal(l.width, 0.55, "its width, the rules' w");
    assert.deepEqual([l.x, l.y, l.x1], [10, 10, 14]);
    gm.zones.push({ x: 8, y: 9, r: 0.5, t: 1, dur: 8, kind: 'mirror' } as never);
    eventsW7([{ t: 'mirrorCast', x: 8, y: 9, dx: 0, dy: 1, kind: 'melee' }], gm, fx);
    const m = W7.acts[2];
    assert.deepEqual([m.part, m.x, m.y, m.dx, m.dy], ['cast', 8, 9, 0, 1], 'its own way, not his');
    clearW7();
  });
});

test('2. heroBleed, sent where he stands with no id: the slash comes from the monster nearest him', () => {
  on(() => {
    const gm = game([monster(1, 11, 10), monster(2, 16, 10)]);
    const fx = fresh(gm);
    eventsW7([{ t: 'heroBleed', x: 10, y: 10, secs: 3 }], gm, fx);
    const a = W7.acts[0];
    assert.equal(a.side, 'monster');
    assert.ok(a.dx < -0.5 && Math.abs(a.dy) < 1e-9, `from the one at his right: way ${a.dx}, ${a.dy}`);
    clearW7();
  });
});

test("3. the rules' spirits (game.spirits): spirit and spiritHit play on them; a monster of the same id is not drawn as one", () => {
  on(() => {
    // (a spirit's id and a monster's are counted apart in the rules: here they meet)
    const foe = monster(7, 12, 10);
    const gm = game([foe], { spirits: [{ id: 7, x: 11, y: 10, t: 0, life: 6, next: 0.3 }] });
    const fx = fresh(gm);
    eventsW7([{ t: 'spirit', id: 7, x: 11, y: 10, life: 6 }], gm, fx);
    const s = W7.acts[0];
    assert.equal(s.rules, true, "the rules' own spirit");
    assert.equal(s.dur, 6, "its time, the rules' life");
    assert.equal(lookW7(foe, {} as never), null, 'the monster that shares its id is drawn as itself');
    eventsW7([{ t: 'spiritHit', id: 7, x0: 11, y0: 10, x1: 12, y1: 10 }], gm, fx);
    const h = W7.acts[1];
    assert.equal(h.part, 'hit');
    assert.deepEqual([h.x, h.y], [12, 10], 'the rake on what it strikes');
    assert.deepEqual([h.x1, h.y1], [11, 10], 'from the spirit');
    assert.deepEqual(h.ids, [7, 7], 'what it struck, and the spirit striking');
    // it is followed: the way it glides
    tickW7(0.05, gm, fx);
    (gm as unknown as { spirits: { x: number }[] }).spirits[0].x = 11.3;
    tickW7(0.05, gm, fx);
    const was = W7.spiritWas.get(7);
    assert.ok(was && was.moving && was.fx > 0.9, 'gliding toward what it fights');
    clearW7();
  });
});

test('4. goldStolen on the one carrying his gold; mirrorBack on the one at x0, y0', () => {
  on(() => {
    const thief = monster(3, 11, 10, { stolen: 4 });
    const other = monster(4, 10.5, 10.5);
    const gm = game([thief, other]);
    const fx = fresh(gm);
    eventsW7([{ t: 'goldStolen', x: 10, y: 10, n: 4 }], gm, fx);
    assert.deepEqual(W7.acts[0].ids, [3], 'the one carrying it, not the nearest');
    eventsW7([{ t: 'mirrorBack', x0: 10.5, y0: 10.5, x1: 10, y1: 10, n: 2 }], gm, fx);
    assert.deepEqual(W7.acts[1].ids, [4]);
    assert.equal(W7.acts[1].side, 'monster');
    clearW7();
  });
});

test('5. rise, sent as it dies: its look waits, and the body stands as the rules raise it', () => {
  on(() => {
    const gm = game();
    const fx = fresh(gm);
    fx.fallen.push({ figure: 'skeleton', x: 12, y: 10, back: false, flip: false, t: 0 } as never);
    eventsW7([{ t: 'rise', id: 9, x: 12, y: 10 }], gm, fx);
    assert.equal(W7.acts.length, 0, 'not yet: it has only just fallen');
    const wait = REAP.riseAfter - (0.2 + W7_TIME.rise);
    let t = 0;
    while (t < wait - 0.05) {
      tickW7(0.05, gm, fx);
      fx.fallen[0].t += 0.05;
      t += 0.05;
    }
    assert.equal(W7.acts.length, 0);
    tickW7(0.1, gm, fx);
    assert.equal(W7.acts.length, 1, 'begun');
    const a = W7.acts[0];
    assert.equal(a.word, 'reaping');
    assert.ok(Math.abs(t + 0.1 + 0.2 + W7_TIME.rise - REAP.riseAfter) < 0.12, `it stands ${(t + 0.1 + 0.2 + W7_TIME.rise).toFixed(2)} s after it died, the rules' ${REAP.riseAfter}`);
    // (sent as the old names meant it, its body long lain, it begins at once)
    clearW7();
    fx.fallen[0].t = 3;
    eventsW7([{ t: 'rise', x: 12, y: 10 }], gm, fx);
    assert.equal(W7.acts.length, 1);
    clearW7();
  });
});

test("6. a monster's surge: the rules' own warning; its wave as the warning runs out, none if it was broken off", () => {
  on(() => {
    const m = monster(5, 12, 10);
    const gm = game([m]);
    const fx = fresh(gm);
    const z = { x: 12, y: 10, r: 2.4, t: 0, dur: 0.8, kind: 'warn', from: "Skeleton's surge", src: 5, hostile: true };
    gm.zones.push(z as never);
    for (let i = 0; i < 16; i++) {
      z.t += 0.05;
      tickW7(0.05, gm, fx);
    }
    gm.zones.length = 0;
    tickW7(0.016, gm, fx);
    const w = W7.acts.find((a) => a.word === 'surging');
    assert.ok(w && w.part === 'wave' && w.r === 2.4, 'its wave, as wide as its warning');
    // broken off early (a stun): no wave
    clearW7();
    const z2 = { ...z, t: 0 };
    gm.zones.push(z2 as never);
    tickW7(0.05, gm, fx);
    z2.t = 0.3;
    tickW7(0.05, gm, fx);
    gm.zones.length = 0;
    tickW7(0.05, gm, fx);
    assert.equal(W7.acts.filter((a) => a.word === 'surging').length, 0);
    clearW7();
  });
});

test('7. with the switch off, none of it', () => {
  // (the switch is on since the ten new words went live, 11 Nov 2026: put off for this)
  const was = WORDS7_LOOK.on;
  WORDS7_LOOK.on = false;
  try {
  assert.equal(WORDS7_LOOK.on, false);
  const gm = game([monster(1, 11, 10, { stolen: 2 })], { spirits: [{ id: 1, x: 11, y: 10, t: 0, life: 6, next: 0.3 }] });
  const fx = new Fx();
  clearW7();
  eventsW7([{ t: 'pierceLine', x0: 12, y0: 10, x1: 15, y1: 10 }, { t: 'spirit', id: 1, x: 11, y: 10, life: 6 }, { t: 'goldStolen', x: 10, y: 10, n: 2 }, { t: 'rise', id: 9, x: 12, y: 10 }], gm, fx);
  gm.zones.push({ x: 12, y: 10, r: 2.4, t: 0.79, dur: 0.8, kind: 'warn', from: "Skeleton's surge", src: 1 } as never);
  tickW7(0.1, gm, fx);
  gm.zones.length = 0;
  tickW7(0.1, gm, fx);
  assert.equal(W7.acts.length, 0);
  assert.equal(W7.rising.length, 0);
  assert.equal(W7.spiritWas.size, 0);
  } finally {
    WORDS7_LOOK.on = was;
  }
});
