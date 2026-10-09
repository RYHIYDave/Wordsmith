// Tests for THE WORDSMITH ON BONES AND HIS RING (art/smith3.ts, art/ring3.ts: a mock-up behind a
// switch that is off; the art chat, 8 Oct 2026). The owner, 22:41: "we probably need new art for the
// wordsmith and the runes around him with the new design rules"; 22:46: "id like him on the wire
// skeleton and all that"; his brief by 22:45, "Ancient and mighty", "Runes burning on him", "Big and
// wild", "A head taller" (each "(Recommended)"); and by 23:09, to smith.gif and smith_close.png,
// "Yes, this is him (Recommended)" and of the ring "Just right (Recommended)".
//   run: tsx --test tests/smith3.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import { CYAN } from '../src/art/kit';
import { KNIGHT_BODY, MAGE_BODY, RANGER_BODY } from '../src/art/moves3';
import { LANDS, flareOf, makeRing3, stoneBlaze, swirlAt } from '../src/art/ring3';
import { bonesAt, solve } from '../src/art/skeleton';
import { SMITH3, SMITH_ACT_LONG, SMITH_BODY, SMITH_IDLE_LONG, SMITH_MOVES, SMITH_STANCE, makeSmith3 } from '../src/art/smith3';
import { VAULT } from '../src/art/ground';
import { makeTownProps } from '../src/art/town';
import { smithAct, townSprite } from '../src/art/townscene';
import { ACT_FPS, FACINGS, TOWN_POSES, actAt, makeTownsfolk, townFrame } from '../src/art/townsfolk';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  notEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

/** With the switch on (as the game has it since Version 19.6), and on again after whatever happens. */
const on = <T>(fn: () => T): T => {
  SMITH3.on = true;
  try {
    return fn();
  } finally {
    SMITH3.on = true;
  }
};

test('the switch is on, since Version 19.6: the wordsmith on bones and his ring made new', () => {
  assert.equal(SMITH3.on, true);
  assert.ok(makeTownProps().ring3 !== undefined, 'the new ring painted');
});

test('switched off: the town has the wordsmith and the ring it had', () => {
  SMITH3.on = false;
  try {
    const folk = makeTownsfolk();
    assert.equal(folk.wordsmith.act.length, TOWN_POSES.wordsmith.act.length, 'his act as it was');
    assert.equal(makeTownProps().ring3, undefined, 'no new ring painted');
  } finally {
    SMITH3.on = true;
  }
});

test('with it on: the wordsmith on bones, standing, at his work and turned to each side; the new ring painted', () => {
  on(() => {
    const m = makeTownsfolk().wordsmith;
    assert.equal(m.idle.length, Math.round(SMITH_IDLE_LONG * 10), 'his loop, at the town\'s ten frames a second');
    assert.equal(m.act.length, Math.round(SMITH_ACT_LONG * ACT_FPS) + 1);
    assert.equal(m.work, 'sw', 'he faces his slab');
    assert.equal(m.turned.sw, m.idle);
    for (const to of FACINGS) if (to !== 'sw') assert.ok(m.turned[to] !== m.idle && m.turned[to].length === m.idle.length, `turned ${to}`);
    // (turned for real: each side is its own picture, not one turned over)
    const a = paintingOf(m.turned.se[0]);
    const b = paintingOf(m.idle[0]);
    assert.ok(a.w !== b.w || a.d.some((v, i) => v !== b.d[i]), 'facing the other way is another picture');
    assert.ok(makeTownProps().ring3 !== undefined);
  });
});

test('a head taller than the heroes, and his feet stay where they are whatever he does', () => {
  const tallest = Math.max(KNIGHT_BODY.tall, RANGER_BODY.tall, MAGE_BODY.tall);
  const head = KNIGHT_BODY.headR[2] * 2;
  assert.ok(SMITH_BODY.tall - tallest >= head * 0.6 && SMITH_BODY.tall - tallest <= head * 1.4, `${SMITH_BODY.tall} beside ${tallest} (a head is ${head.toFixed(1)})`);
  const s0 = solve(SMITH_BODY, bonesAt(SMITH_MOVES.idle, SMITH_STANCE, 0));
  for (const [keys, long] of [[SMITH_MOVES.idle, SMITH_IDLE_LONG], [SMITH_MOVES.act, SMITH_ACT_LONG]] as const) {
    for (let i = 0; i <= 60; i++) {
      const s = solve(SMITH_BODY, bonesAt(keys, SMITH_STANCE, (long * i) / 60));
      for (const k of ['toeL', 'toeR', 'heelL', 'heelR'] as const) {
        const d = Math.hypot(s[k][0] - s0[k][0], s[k][1] - s0[k][1], s[k][2] - s0[k][2]);
        // (less than half a game pixel: as he gathers the rune up over his head he rises a little, on the balls of his feet)
        assert.ok(d < 1, `${k} moves ${d.toFixed(2)} picture px at ${((long * i) / 60).toFixed(2)} s`);
      }
    }
  }
});

test('his work and the ring keep time: the act begins when the town shows it, and every stone flares as the rune goes into the slab', () => {
  on(() => {
    const art = { town: makeTownProps(VAULT), folk: makeTownsfolk() };
    const m = art.folk.wordsmith;
    for (let t = 0; t < 30; t += 0.07) {
      const a = actAt(m, t, 6.4);
      const f = townFrame(m, t, 6.4);
      if (a < 0) assert.ok(m.idle.includes(f), `${t.toFixed(2)}: standing`);
      else assert.equal(f, m.act[Math.min(m.act.length - 1, Math.floor(a * ACT_FPS))], `${t.toFixed(2)}: ${a.toFixed(2)} s into his work`);
    }
    // (the rune goes in when his hands come down on it: the key of the act that drives it)
    assert.ok(SMITH_MOVES.act.some((k) => Math.abs(k.at - LANDS) < 1e-9 && (k.pose.pt ?? 0) >= 0.95), 'driven into the slab at LANDS');
    assert.equal(flareOf(LANDS), 1);
    assert.equal(flareOf(LANDS + 0.9), 0);
    for (let v = 0; v < 6; v++) {
      assert.equal(stoneBlaze(v, 1.3, LANDS + 0.1), 3, `stone ${v} flares`);
      assert.ok(stoneBlaze(v, 1.3, -1) >= 1, `stone ${v} burns`);
    }
    // (turned to someone, he leaves his work, and the ring does not flare for it)
    townSprite(art, 'wordsmith', 0, 0, 'se');
    assert.equal(smithAct(art, 10), -1);
    townSprite(art, 'wordsmith', 0, 0, null);
  });
});

test('the ring: six stones that burn, pulse and flare (and can stand dark), a circle in the floor, a column, and fourteen letters that draw in as he writes and burst out as the rune goes in', () => {
  const r = makeRing3(VAULT);
  assert.equal(r.stones.length, 6);
  for (const stone of r.stones) {
    assert.equal(stone.length, 4);
    assert.equal(stone[0].length, 1, 'dark: one picture');
    assert.equal(stone[0][0].lights, undefined, 'dark: no light');
    for (const b of [1, 2, 3]) assert.ok((stone[b][0].lights?.[0].a ?? 0) > (b > 1 ? (stone[b - 1][0].lights?.[0].a ?? 0) : 0), `burning ${b}: brighter than the one before`);
  }
  assert.ok(r.floor.length >= 8 && r.floor[0].lights !== undefined && r.floorDark.lights === undefined);
  assert.ok(r.column.length >= 4);
  const mean = (act: number): number => {
    const ls = swirlAt(1.7, act);
    assert.equal(ls.length, 14);
    return ls.reduce((n, l) => n + Math.hypot(l.x, l.y), 0) / ls.length;
  };
  assert.ok(mean(1.0) < mean(-1) * 0.75, 'they draw in as he writes');
  assert.ok(mean(LANDS + 0.05) > mean(-1) * 1.4, 'and burst out as the rune goes in');
  // (what glows is the friend's cyan, white at its heart: the rulebook)
  const glow = new Set([CYAN[2], CYAN[3], '#ffffff'].map((c) => c.toLowerCase()));
  for (const heat of r.letters) for (const s of heat) {
    const p = paintingOf(s);
    for (let i = 0; i < p.d.length; i += 4) {
      if (p.d[i + 3] === 0) continue;
      const hex = '#' + [p.d[i], p.d[i + 1], p.d[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('');
      assert.ok(glow.has(hex), `a letter of light in ${hex}`);
    }
  }
});
