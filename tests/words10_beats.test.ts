// HIS THREE NEW WORDS' LOOKS AT WORK (src/render/words10.ts, behind WORDS10_LOOK, off): their beats, each look drawn from its
// cause (what the main chat's rules send or keep) and the time since. His word on the stills, 9 Nov by 16:45: “Yes, animate them
// (Recommended)”. These hold:
//   1. each look is drawn from its cause: it builds from little as its cause begins, is drawn while the rules keep it (or through
//      its beats, for an event's), and is gone, every pixel, when its time is up: what a held look leaves settles over its fade
//      after its thing is gone, and then is gone too;
//   2. with the switch off, nothing at all, whatever the rules send or keep;
//   3. nothing cyan on a monster's side; the enemy's pink there;
//   4. every look has its beats written down (W10_BEATS), and an event's look lasts its build, its hit and its fade.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { FLEETING, GUARD, LASTING, TUNE, VAST } from '../src/game/defs';
import type { Game } from '../src/game/game';
import type { Monster } from '../src/game/state';
import { Fx } from '../src/render/fx';
import type { Cam } from '../src/render/fx';
import { W10, W10_BEATS, W10_ENEMY, WORDS10_LOOK, airW10, clearW10, eventsW10, floorW10, heroW10, lightsW10, thingW10, tickW10, w10Life } from '../src/render/words10';

const cam: Cam = { ox: 300, oy: -150, lift: null } as unknown as Cam;
const everywhere = (): boolean => true;
const on = <T>(fn: () => T): T => {
  const was = WORDS10_LOOK.on;
  WORDS10_LOOK.on = true;
  try {
    return fn();
  } finally {
    WORDS10_LOOK.on = was;
  }
};
function draw(gm: Game): { n: number; colours: Set<string> } {
  let n = 0;
  const colours = new Set<string>();
  const pen = {
    fillStyle: '',
    globalAlpha: 1,
    fillRect() {
      n++;
      colours.add(String(pen.fillStyle).toLowerCase());
    },
    drawImage: () => {},
  };
  const g = pen as unknown as CanvasRenderingContext2D;
  floorW10(g, cam, W10.clock, gm, everywhere);
  airW10(g, cam, W10.clock, gm);
  return { n, colours };
}
const hsv = (c: string): [number, number, number] => {
  const n = parseInt(c.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  const mx = Math.max(r, g, b);
  const d = mx - Math.min(r, g, b);
  let h = 0;
  if (d > 0) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, mx ? d / mx : 0, mx / 255];
};
const cyanish = (c: string): boolean => /^#[0-9a-f]{6}$/.test(c) && ((h, s, v) => s > 0.3 && v > 0.45 && h > 170 && h < 200)(...hsv(c));

function monster(id: number, x: number, y: number, words: string[] = []): Monster {
  return { id, x, y, r: 0.4, kind: 'skeleton', dead: false, words, poisonT: 0, burnT: 0, chillT: 0, lastSkill: -1, fx: -1, fy: 0 } as unknown as Monster;
}
function skill(id: string, front: string[], r: Record<string, unknown>): unknown {
  return { id, front, behind: [], r: { last: 1, pace: 1, boost: 1, vast: 0, size: 1, shield: 0, might: 0, haste: 0, frenzy: false, ...r } };
}
const level = {};
function game(o: Partial<{ skills: unknown[]; monsters: Monster[]; zones: unknown[]; orbs: unknown[]; channel: unknown; hero: Record<string, unknown> }> = {}): Game {
  return {
    level,
    hero: { x: 10, y: 10, fx: 1, fy: 0, skills: o.skills ?? [], channel: o.channel ?? null, mightT: 0, hasteT: 0, frenzyT: 0, shieldT: 0, poisonT: 0, burnT: 0, chillT: 0, ...(o.hero ?? {}) },
    monsters: o.monsters ?? [],
    projectiles: [],
    zones: o.zones ?? [],
    orbs: o.orbs ?? [],
    familiars: [],
    contraptions: [],
  } as unknown as Game;
}

/**
 * Each held look, staged as the rules keep its cause: the game, how the rules run it on a step (its own clock; gone when its time is
 * up), how long that is, and its beats' key. Lasting's are the rules' half again; Fleeting's a third shorter.
 */
type Stage = { name: string; key: string; gm: Game; run: (gm: Game, dt: number) => void; life: number; enemy?: boolean };
function stages(): Stage[] {
  const out: Stage[] = [];
  for (const w of ['lasting', 'fleeting'] as const) {
    const last = w === 'lasting' ? 1 + LASTING.longer : 1 - FLEETING.shorter;
    const pace = w === 'fleeting' ? 1 / (1 - FLEETING.shorter) : 1;
    const orbLife = TUNE.orbLife * last;
    out.push({
      name: `${w} on an orb`, key: `${w}:thing`, life: orbLife,
      gm: game({ skills: [skill('wave', [], {}), skill('orb', [w], { last, pace })], orbs: [{ id: 1, x: 11, y: 9, t: 0, life: orbLife, next: TUNE.orbEvery / pace, skill: 1 }] }),
      run: (gm, dt) => {
        const G = gm as unknown as { orbs: { t: number; life: number; next: number }[] };
        for (const o of G.orbs) {
          o.t += dt;
          o.next -= dt;
          if (o.next <= 0) o.next += TUNE.orbEvery / pace;
        }
        G.orbs = G.orbs.filter((o) => o.t < o.life);
      },
    });
    const spin = 2.4 * last;
    out.push({
      name: `${w} on a whirlwind`, key: `${w}:spin`, life: spin,
      gm: game({ skills: [skill('strike', [], {}), skill('whirlwind', [w], { last, pace })], channel: { skill: 1, t: 0, next: 0.1, bites: 1, tx: 11, ty: 10, wake: 0 } }),
      run: (gm, dt) => {
        const h = gm.hero as unknown as { channel: { t: number } | null };
        if (h.channel) h.channel.t += dt;
        if (h.channel && h.channel.t >= spin) h.channel = null;
      },
    });
    const dur = 4 * last;
    out.push({
      name: `${w} on burning ground`, key: `${w}:patch`, life: dur,
      gm: game({ skills: [skill('strike', [], {}), skill('whirlwind', [w], { last, pace })], zones: [{ x: 12, y: 9, r: 1.3, t: 0, dur, kind: 'burn', hostile: false, skill: 1, words: [] }] }),
      run: (gm, dt) => {
        for (const z of gm.zones) z.t += dt;
        gm.zones = gm.zones.filter((z) => z.t < z.dur);
      },
    });
    const shield = GUARD.shieldTime * last;
    out.push({
      name: `${w} on a boost`, key: `${w}:boost`, life: shield,
      gm: game({ skills: [skill('strike', [], {}), skill('whirlwind', ['guarding', w], { last, pace, shield: 0.2 })], hero: { shieldT: shield } }),
      run: (gm, dt) => {
        const h = gm.hero as unknown as { shieldT: number; x: number };
        h.shieldT = Math.max(0, h.shieldT - dt);
        h.x += dt * 2;
      },
    });
    const m = monster(2, 11.5, 9.5);
    const poison = TUNE.poisonTime * last;
    Object.assign(m, { poisonT: poison, lastSkill: 0 });
    out.push({
      name: `${w} on his poison on a monster`, key: `${w}:dot`, life: poison,
      gm: game({ skills: [skill('strike', ['poison', w], { last, pace })], monsters: [m] }),
      run: (gm, dt) => {
        for (const q of gm.monsters) q.poisonT = Math.max(0, q.poisonT - dt);
      },
    });
    const sick = TUNE.poisonTime * (w === 'lasting' ? 1 + LASTING.monster : 1 - FLEETING.monster);
    out.push({
      name: `${w} on a monster`, key: `${w}:monster`, life: sick, enemy: true,
      gm: game({ monsters: [monster(3, 11, 10, [w, 'poison'])], hero: { poisonT: sick } }),
      run: (gm, dt) => {
        const h = gm.hero as unknown as { poisonT: number };
        h.poisonT = Math.max(0, h.poisonT - dt);
      },
    });
  }
  out.push({
    name: 'vast on a monster', key: 'vast:monster', life: 1.1, enemy: true,
    gm: game({ monsters: [monster(7, 12, 9, ['vast'])], zones: [{ x: 11.5, y: 9.5, r: 1.25 * (1 + VAST.monster), t: 0, dur: 1.1, kind: 'warn', hostile: true, skill: -1, words: ['vast'] }] }),
    run: (gm, dt) => {
      for (const z of gm.zones) z.t += dt;
      gm.zones = gm.zones.filter((z) => z.t < z.dur);
    },
  });
  return out;
}

/** The rules' events that call up a look of their own: Vast in front's ring, its whirlwind's, a patch laid wider, Vast behind's splash. */
const EVENTS: [string, Record<string, unknown>, string][] = [
  ['an orb wave wider', { t: 'burst', x: 11, y: 9, r: 2.8, el: 'phys', style: 'nova', words: ['vast'], n: 0, echo: false }, 'vast:front'],
  ["a whirlwind's turn wider", { t: 'burst', x: 10, y: 10, r: 2.86, el: 'phys', style: 'whirl', words: ['vast'], n: 0, echo: false }, 'vast:front'],
  // (Vast behind's splash is told by its own name since the ten new words went live, 11 Nov 2026; a 'shock' burst its reach wide is
  // no longer read as it: the Brawler's Aftershock is such a burst)
  ['the splash by its own name', { t: 'vastSplash', x: 11, y: 9, r: VAST.splashR, ids: [5, 6] }, 'vast:behind'],
];
const near = (): Monster[] => [monster(4, 11, 9), monster(5, 11.9, 9.4), monster(6, 11.4, 8.2)];

test('1. each look is drawn from its cause, through its beats, and gone, every pixel, when its time is up', () => {
  on(() => {
    for (const s of stages()) {
      clearW10();
      W10.clock = 0;
      const fx = new Fx();
      tickW10(0, s.gm, fx);
      const first = draw(s.gm).n;
      let most = 0;
      let mid = 0;
      const steps = Math.round(s.life * 30);
      for (let i = 0; i < steps; i++) {
        s.run(s.gm, 1 / 30);
        tickW10(1 / 30, s.gm, fx);
        const n = draw(s.gm).n;
        most = Math.max(most, n);
        if (i === Math.round(steps / 2)) mid = n;
      }
      assert.ok(most > 30, `${s.name}: drew only ${most} pixels at most`);
      assert.ok(mid > 30, `${s.name}: only ${mid} pixels half way through`);
      assert.ok(first < mid, `${s.name}: ${first} pixels as its cause begins, not built from little (${mid} half way)`);
      // its cause gone: what it leaves settles over its fade, and is gone
      const B = W10_BEATS[s.key];
      assert.ok(B, `${s.name}: no beats for ${s.key}`);
      for (let i = 0; i < 4; i++) {
        s.run(s.gm, 1 / 30);
        tickW10(1 / 30, s.gm, fx);
      }
      for (let i = 0; i < Math.round((B.fade + 0.15) * 30); i++) {
        s.run(s.gm, 1 / 30);
        tickW10(1 / 30, s.gm, fx);
      }
      assert.equal(W10.acts.length, 0, `${s.name}: something of it still there ${B.fade + 0.15} s after its time`);
      assert.equal(draw(s.gm).n, 0, `${s.name}: pixels left after its time`);
      let lit = 0;
      lightsW10(() => lit++, cam, s.gm, 1);
      assert.equal(lit, 0, `${s.name}: still lit after its time`);
    }
    // what Lasting leaves: its heap, its dunes, its drift, settling after its thing is gone (its fade), then gone
    for (const s of stages().filter((q) => q.key.startsWith('lasting:') && q.key !== 'lasting:boost')) {
      clearW10();
      W10.clock = 0;
      const fx = new Fx();
      tickW10(0, s.gm, fx);
      for (let i = 0; i < Math.round(s.life * 30) + 3; i++) {
        s.run(s.gm, 1 / 30);
        tickW10(1 / 30, s.gm, fx);
      }
      assert.ok(W10.acts.some((a) => a.kind === 'after'), `${s.name}: nothing left settling as it ends`);
      assert.ok(draw(s.gm).n > 0, `${s.name}: what it leaves is not drawn`);
    }
    // the events' looks: built, struck and wound down over their beats, and gone
    for (const [name, e, key] of EVENTS) {
      clearW10();
      const gm = game({ monsters: near() });
      const fx = new Fx();
      tickW10(0, gm, fx);
      eventsW10([e], gm, fx);
      assert.equal(W10.acts.length, 1, `${name}: one look`);
      const a = W10.acts[0];
      assert.equal(a.dur, w10Life(key), `${name}: its life its beats'`);
      let most = 0;
      for (let i = 0; i < Math.round(a.dur * 30) - 1; i++) {
        tickW10(1 / 30, gm, fx);
        most = Math.max(most, draw(gm).n);
      }
      assert.ok(most > 30, `${name}: drew only ${most}`);
      tickW10(0.1, gm, fx);
      assert.equal(W10.acts.length, 0, `${name}: still there after ${a.dur} s`);
      assert.equal(draw(gm).n, 0, `${name}: pixels left after its time`);
    }
    // a whirlwind's turns, three or four a second, roll out a ring at a time
    clearW10();
    const gm = game();
    const fx = new Fx();
    tickW10(0, gm, fx);
    for (let i = 0; i < 6; i++) {
      eventsW10([EVENTS[1][1]], gm, fx);
      for (let k = 0; k < 9; k++) tickW10(1 / 30, gm, fx);
    }
    assert.ok(W10.acts.length <= 2, `${W10.acts.length} rings at once`);
    clearW10();
  });
});

test('2. with the switch off, nothing at all, whatever the rules send or keep', () => {
  // (the switch is on since the ten new words went live, 11 Nov 2026: put off for this)
  const was = WORDS10_LOOK.on;
  WORDS10_LOOK.on = false;
  try {
  assert.equal(WORDS10_LOOK.on, false);
  for (const s of stages()) {
    clearW10();
    const fx = new Fx();
    const t0 = W10.clock;
    for (let i = 0; i < 20; i++) {
      s.run(s.gm, 0.1);
      tickW10(0.1, s.gm, fx);
    }
    eventsW10(EVENTS.map((q) => q[1]), s.gm, fx);
    assert.equal(W10.clock, t0, `${s.name}: its clock ran`);
    assert.equal(W10.acts.length, 0, `${s.name}: a look begun`);
    assert.equal(W10.held.size + W10.since.size, 0, `${s.name}: something kept`);
    assert.equal(draw(s.gm).n, 0, `${s.name}: drew`);
    let lit = 0;
    lightsW10(() => lit++, cam, s.gm, 1);
    assert.equal(lit, 0);
    assert.deepEqual(heroW10({} as never, s.gm.hero, cam, s.gm), []);
    assert.deepEqual(thingW10(s.gm, 1, 1, {} as never, 0, 0), []);
  }
  assert.equal(W10.seen.length, 0, 'not even the hero is looked at');
  } finally {
    WORDS10_LOOK.on = was;
  }
});

test("3. nothing cyan on a monster's side; the enemy's pink there", () => {
  on(() => {
    for (const s of stages().filter((q) => q.enemy)) {
      clearW10();
      W10.clock = 0;
      const fx = new Fx();
      tickW10(0, s.gm, fx);
      const seen = new Set<string>();
      for (let i = 0; i < Math.round((s.life + 0.8) * 30); i++) {
        s.run(s.gm, 1 / 30);
        tickW10(1 / 30, s.gm, fx);
        for (const c of draw(s.gm).colours) seen.add(c);
      }
      assert.ok(![...seen].some(cyanish), `${s.name} shows cyan: ${[...seen].filter(cyanish)}`);
      assert.ok(seen.has(W10_ENEMY[4]) || seen.has(W10_ENEMY[3]), `${s.name}: no pink`);
    }
    clearW10();
  });
});

test('4. every look has its beats written down; an event\'s look lasts its build, its hit and its fade', () => {
  const keys = ['lasting:thing', 'lasting:spin', 'lasting:patch', 'lasting:boost', 'lasting:dot', 'lasting:monster', 'fleeting:thing', 'fleeting:spin', 'fleeting:patch', 'fleeting:boost', 'fleeting:dot', 'fleeting:monster', 'vast:front', 'vast:behind', 'vast:monster'];
  assert.deepEqual(Object.keys(W10_BEATS).sort(), [...keys].sort());
  for (const [k, b] of Object.entries(W10_BEATS)) {
    assert.ok(b.build > 0 && b.fade > 0 && b.hit >= 0, `${k}: ${JSON.stringify(b)}`);
    assert.ok(b.is.length > 40, `${k}: what happens, written down`);
  }
  // Movement 9 where there is a strike: its strike quick, its wind-down big
  for (const k of ['vast:front', 'vast:behind']) {
    const b = W10_BEATS[k];
    assert.ok(b.hit <= 0.2 && b.fade >= 2.5 * b.hit, `${k}: a fast strike (${b.hit}) and a big wind-down (${b.fade})`);
  }
  // Fleeting's quicker than Lasting's, each beat
  for (const k of ['thing', 'spin', 'patch', 'boost']) assert.ok(w10Life(`fleeting:${k}`) < w10Life(`lasting:${k}`), `${k}: Fleeting's beats quicker`);
});
