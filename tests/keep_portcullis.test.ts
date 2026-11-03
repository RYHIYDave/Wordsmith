// THE HIGH CITY, FLOOR 19: THE KEEP'S PORTCULLISES (game/act2/keep_rules.ts, behind HIGH_CITY, off). His doc: "portcullises that
// slam down to cut a hall in two." Near him, a portcullis stands up a while, shakes (its warning), falls and slams: its tiles not
// walked while it is down, the hall cut in two; whatever is under it at the slam is struck and thrown clear; wound up again, its
// tiles walked again. Far from him it stands up and waits.
//   run: tsx --test tests/keep_portcullis.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { HIGH_CITY } from '../src/game/act1';
import { Game } from '../src/game/game';
import { PORTCULLIS, PORT_FRAME, portTiles, portcullisesOf, stepPortcullises, underPort } from '../src/game/act2/keep_rules';
import { paintWithoutCanvas } from './helpers';

paintWithoutCanvas();
const STILL = { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };

test('a portcullis near him warns, slams down across its hall (its tiles not walked), strikes and throws clear what is under it, and is wound up again', () => {
  const was = HIGH_CITY.on;
  HIGH_CITY.on = true;
  try {
    const g = new Game('warrior', 4);
    g.depth = 19;
    g.cleared = 18;
    g.wayDepth = 19;
    g.enterDungeon();
    const L = g.level;
    const W = L.floor.w;
    const ps = portcullisesOf(L);
    assert.ok(ps.length >= 1, 'portcullises on the floor');
    const s = ps[0];
    assert.equal(s.pieces.length, s.at.n, 'a piece on each of its tiles');
    const base = s.at.alongX ? 0 : PORT_FRAME.perWay;
    for (const p of s.pieces) assert.equal(p.variant, base + PORT_FRAME.up);
    for (const i of portTiles(s.at, W)) assert.equal(L.walk[i], 1, 'walked while up');
    // (far from him: it waits)
    const far = { x: L.floor.start.x, y: L.floor.start.y };
    const mx = s.at.alongX ? s.at.x + s.at.n / 2 : s.at.x + 0.5;
    const my = s.at.alongX ? s.at.y + 0.5 : s.at.y + s.at.n / 2;
    if (Math.hypot(far.x - mx, far.y - my) > PORTCULLIS.near) {
      stepPortcullises(L, far, PORTCULLIS.up * 2);
      assert.equal(s.phase, 'up', 'far from him it stands up');
    }
    // (the hero under it, as it comes down; nothing else near)
    g.monsters.length = 0;
    const h = g.hero;
    h.x = mx;
    h.y = my;
    h.invuln = 0;
    const life = h.life;
    let warned = false;
    let slammed = false;
    for (let k = 0; k < 30 * (PORTCULLIS.up + PORTCULLIS.warn + 1) && !slammed; k++) {
      // (he stands under it, as one not looking up)
      h.x = mx;
      h.y = my;
      g.update(1 / 30, { ...STILL, aimX: h.x + 1, aimY: h.y } as never);
      if (s.phase === 'warn') {
        warned = true;
        for (const p of s.pieces) assert.equal(p.variant, base + PORT_FRAME.warn, 'its warning');
      }
      if (s.phase === 'slam') slammed = true;
    }
    assert.ok(warned, 'it warned before it fell');
    assert.ok(slammed, 'it slammed down');
    for (const i of portTiles(s.at, W)) assert.equal(L.walk[i], 0, 'its tiles not walked: the hall cut in two');
    assert.ok(!underPort(s.at, h.x, h.y), `he is thrown clear (${h.x.toFixed(2)}, ${h.y.toFixed(2)})`);
    assert.ok(h.life < life, `he is struck (${life} to ${h.life})`);
    // (down a while, then wound up: walked again)
    for (let k = 0; k < 30 * (PORTCULLIS.slam + PORTCULLIS.down + PORTCULLIS.rise + 0.5); k++) stepPortcullises(L, h, 1 / 30);
    assert.equal(s.phase, 'up');
    for (const p of s.pieces) assert.equal(p.variant, base + PORT_FRAME.up);
    for (const i of portTiles(s.at, W)) assert.equal(L.walk[i], 1, 'walked again');
  } finally {
    HIGH_CITY.on = was;
  }
});
