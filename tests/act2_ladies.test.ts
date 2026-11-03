// THE HIGH CITY, FLOOR 18: THE LADIES-IN-WAITING (game/act1_rules/lady.ts, the art chat's art/gallery_ladies*.ts; brought in at his
// word of 2 Nov 2026, “All of it in this one”):
//   1. built: rules, pictures, effects; her flash's wedge from half a tile before her to six and a half, three tiles wide at its end;
//   2. she keeps her distance: one set two tiles off him glides back, one at five goes round him, facing him; she flashes from range,
//      and the flash strikes him in its wedge.
//   run: tsx --test tests/act2_ladies.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { act1Rules } from '../src/game/act1_rules/index';
import { LADY_TUNE, RULES as LADY, inFlash } from '../src/game/act1_rules/lady';
import { act1Fig } from '../src/art/act1_figs/index';
import { act1Fx } from '../src/render/act1_fx/index';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
function high<T>(fn: () => T): T {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    return fn();
  } finally {
    HIGH_CITY.on = was;
  }
}
function floor18(seed = 4): Game {
  const g = new Game('warrior', seed);
  g.depth = 18;
  g.cleared = 17;
  g.wayDepth = 18;
  g.enterDungeon();
  for (const q of g.monsters) q.dead = true;
  g.monsters = [];
  const r = g.level.floor.rooms.filter((q) => q.kind !== 'boss').sort((a, b) => b.w * b.h - a.w * a.h)[0];
  g.hero.x = r.x + r.w / 2;
  g.hero.y = r.y + r.h / 2;
  return g;
}

test('1. built: rules, pictures, effects; the flash\'s wedge', () => high(() => {
  assert.ok(act1Rules('lady') && act1Fig('lady') && act1Fx('lady'));
  assert.deepEqual(LADY!.acts.map((a) => a.id), ['lady:flash', 'lady:back', 'lady:left', 'lady:right']);
  assert.ok(inFlash(1, 0, 3, 0) && inFlash(1, 0, 6.3, 1.3), 'before her, out to its end, wide there');
  assert.ok(!inFlash(1, 0, 0.2, 0) && !inFlash(1, 0, 7, 0) && !inFlash(1, 0, 2, 1.5) && !inFlash(1, 0, -3, 0), 'not behind her, too near, too far or out of it');
}));

test('2. she keeps her distance: backs away when he is close, goes round him between, flashes from range', () => high(() => {
  for (const [start, want] of [[2.0, 'lady:back'], [5.0, 'lady:left|lady:right']] as const) {
    const g = floor18();
    const h = g.hero;
    let m: Monster | null = null;
    for (const [dx, dy] of [[start, 0], [0, start], [-start, 0], [0, -start]]) {
      if (!g.isOpen(h.x + dx, h.y + dy)) continue;
      m = g.spawn('lady', h.x + dx, h.y + dy, 970, 0, false, g.rng) as Monster;
      break;
    }
    assert.ok(m, 'room for her');
    const q = m!;
    q.seen = true;
    q.words = [];
    h.life = h.d.maxLife = 1e6;
    const hx = h.x;
    const hy = h.y;
    const seen = new Set<string>();
    let flashed = false;
    let far = 0;
    for (let k = 0; k < 30 * 8; k++) {
      h.x = hx;
      h.y = hy;
      h.invuln = 0;
      g.update(1 / 30, emptyControls());
      if (q.act) seen.add(q.act.id);
      if (q.act?.id === 'lady:flash') flashed = true;
      far = Math.hypot(q.x - h.x, q.y - h.y);
    }
    assert.ok([...seen].some((id) => want.split('|').includes(id)), `from ${start} tiles: ${[...seen].join(', ')}`);
    assert.ok(flashed, `from ${start} tiles she flashes`);
    assert.ok(far >= LADY_TUNE.back - 0.6 && far <= LADY_TUNE.keep[1] + 1, `she keeps her distance (${far.toFixed(2)})`);
  }
  // (the flash strikes him in its wedge)
  const g = floor18();
  const h = g.hero;
  const m = g.spawn('lady', h.x - 4, h.y, 970, 0, false, g.rng) as Monster;
  m.fx = 1;
  m.fy = 0;
  m.words = [];
  h.life = h.d.maxLife = 1e6;
  h.invuln = 0;
  const before = h.life;
  const a = LADY!.acts[0];
  LADY!.acting(g.bosses, m, a, a.hit - 0.01, a.hit + 0.01, 0.02);
  assert.ok(h.life < before, 'struck in its wedge');
}));
