// THE HIGH CITY, FLOOR 18: THE GLASS GALLERY'S MIRRORS (game/act2/gallery_rules.ts, behind HIGH_CITY, off). His doc: "mirrors
// that crack and burst into shards when anything strikes near them". A tall mirror cracks at a blow near it; at the next it
// bursts a moment after, its shards hurting what stands on the floor before it, him and monsters alike, and cracking the
// mirrors beside it; burst, it stays so. A blow far from it does nothing.
//   run: tsx --test tests/gallery_mirrors.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { Game } from '../src/game/game';
import { MIRROR, MIRROR_FRAME, frameOf, inShards, mirrorsOf, stepMirrors, strikeMirrors } from '../src/game/act2/gallery_rules';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();

test('a tall mirror cracks at a blow near it, bursts at the next, its shards before it; a blow far off does nothing', () => {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    const g = new Game('warrior', 3);
    g.depth = 18;
    g.cleared = 17;
    g.wayDepth = 18;
    g.enterDungeon();
    const L = g.level;
    const ms = mirrorsOf(L);
    assert.ok(ms.length >= 8, `mirrors on the floor (${ms.length})`);
    const m = ms[Math.floor(ms.length / 2)];
    assert.equal(frameOf(m), MIRROR_FRAME.whole);
    // (far off: nothing)
    assert.equal(strikeMirrors(L, m.x + m.fx * 9, m.y + m.fy * 9, 0.5).length, 0);
    assert.equal(frameOf(m), MIRROR_FRAME.whole);
    // (near: cracked)
    const bx = m.x + m.fx * 1.2;
    const by = m.y + m.fy * 1.2;
    assert.ok(strikeMirrors(L, bx, by, 0.6).includes(m), 'cracked by a blow near it');
    assert.equal(frameOf(m), MIRROR_FRAME.cracked);
    // (again: it bursts a moment after)
    strikeMirrors(L, bx, by, 0.6);
    assert.ok(m.pending > 0 && m.pending <= MIRROR.warn, 'set to burst');
    assert.equal(stepMirrors(L, MIRROR.warn / 2).length, 0, 'not yet');
    assert.ok(stepMirrors(L, MIRROR.warn).includes(m), 'burst');
    assert.equal(frameOf(m), MIRROR_FRAME.burst);
    assert.ok(inShards(m, m.x + m.fx * 1.5, m.y + m.fy * 1.5), 'its shards on the floor before it');
    assert.ok(!inShards(m, m.x - m.fx * 1.5, m.y - m.fy * 1.5), 'none behind its wall');
    assert.ok(!inShards(m, m.x + m.fx * (MIRROR.reach + 1), m.y + m.fy * (MIRROR.reach + 1)), 'none past its reach');
    // (burst, it stays so: struck again, nothing)
    assert.equal(strikeMirrors(L, bx, by, 0.6).length, 0);
    assert.equal(m.pending, 0);
    // (in the game: the hero before a mirror struck twice is hurt by its shards)
    const n = ms.find((q) => q !== m && frameOf(q) === MIRROR_FRAME.whole && Math.hypot(q.x - m.x, q.y - m.y) > 6)!;
    const h = g.hero;
    h.x = n.x + n.fx * 1.4;
    h.y = n.y + n.fy * 1.4;
    h.invuln = 0;
    g.monsters.length = 0;
    const life = h.life;
    strikeMirrors(L, h.x, h.y, 0.5);
    strikeMirrors(L, h.x, h.y, 0.5);
    for (let i = 0; i < 30; i++) g.update(1 / 30, { mx: 0, my: 0, aimX: h.x + 1, aimY: h.y, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false } as never);
    assert.equal(frameOf(n), MIRROR_FRAME.burst, 'the second burst');
    assert.ok(h.life < life, `the hero hurt by its shards (${life} to ${h.life})`);
  } finally {
    HIGH_CITY.on = was;
  }
});
