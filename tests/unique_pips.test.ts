// A UNIQUE'S PIPS (ui/panels.ts UNIQUE_PIPS, uniquePips, drawItemPips). His picks, 12 Nov 2026: “Every line, price too”, “All orange”:
// every one of the 62 shows a pip for each of its ordinary stats, each special modifier and its price, all orange, never more
// than the four places; and no free place is drawn under a unique (it takes no word), while an ordinary piece is as it was.
//   run: tsx --test tests/unique_pips.test.ts
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
import { RARITY_COLOR } from '../src/art/palette';
import { RNG } from '../src/engine/rng';
import { ITEM_ROOM, rollItem } from '../src/game/items';
import { UNIQUES, UNIQUE_DEFS, makeUnique, uniquePowers } from '../src/game/uniques';
import { UNIQUE_PIPS, drawItemPips, uniquePips } from '../src/ui/panels';
import { THEME } from '../src/ui/ui';

function made(id: string) {
  const was = UNIQUES.on;
  UNIQUES.on = true;
  try {
    return makeUnique(id, 20, new RNG(7))!;
  } finally {
    UNIQUES.on = was;
  }
}

/** The pips drawItemPips lays: the colour of each rectangle filled, left to right. */
function drawn(it: Parameters<typeof drawItemPips>[1]): string[] {
  const out: string[] = [];
  const pen = { fillStyle: '', fillRect(): void { out.push(pen.fillStyle); } };
  const g = pen as unknown as CanvasRenderingContext2D;
  drawItemPips(g, it, 0, 0);
  return out;
}

test('his picks are the ones set: every line, all orange, no free places under a unique', () => {
  assert.equal(UNIQUE_PIPS.count, 'lines');
  assert.equal(UNIQUE_PIPS.colour, 'orange');
  assert.equal(UNIQUE_PIPS.free, false);
});

test('every unique: a pip for each stat, each modifier and its price, all orange, at most four', () => {
  for (const d of UNIQUE_DEFS) {
    const it = made(d.id);
    assert.ok(it, `${d.id} is made`);
    assert.equal(it.affixes.length, d.stats.length, `${d.id}: its stats`);
    const want = d.stats.length + uniquePowers(d) + (d.price ? 1 : 0);
    assert.ok(want <= ITEM_ROOM, `${d.id}: ${want} lines fit the ${ITEM_ROOM} places`);
    const pips = uniquePips(it);
    assert.equal(pips.length, want, `${d.id}: ${want} pips`);
    assert.ok(pips.every((c) => c === RARITY_COLOR[3]), `${d.id}: all orange`);
    assert.deepEqual(drawn(it), pips, `${d.id}: only its own pips drawn, no free place`);
  }
});

test('some uniques it counts as he was shown them', () => {
  const n = (id: string) => uniquePips(made(id)).length;
  assert.equal(n('twofacedmask'), 1, 'the Two-Faced Mask: what it does');
  assert.equal(n('brokenshackles'), 3, 'Broken Shackles: a stat, what it does, its price');
  assert.equal(n('censorsseal'), 4, "the Censor's Seal: two stats, what it does, its price");
  assert.equal(n('wardenskeys'), 4, "the Warden's Keys: two stats, its two powers");
  assert.equal(n('bloodprice'), 4, 'Bloodprice: two stats, one power (its second line only says how it works), its price');
});

test('an ordinary piece is as it was: its affixes pale blue, the rest of the four places dim', () => {
  const it = rollItem(10, new RNG(3), { slot: 'helm', rarity: 1 });
  const pips = drawn(it);
  assert.equal(pips.length, ITEM_ROOM);
  const lit = it.affixes.length;
  assert.deepEqual(pips.slice(0, lit), Array(lit).fill(THEME.magic));
  assert.deepEqual(pips.slice(lit), Array(ITEM_ROOM - lit).fill(THEME.edge));
});
