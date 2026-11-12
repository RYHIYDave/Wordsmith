// THE NEW ITEM PICTURES IN THE GAME (art/items_a.ts, the art chat's, behind ITEMS_A, off), asked for through art/icons.ts itemPic.
// His picks, 3 Nov 2026: “A, painted”; “Finer and a rim”; and of handing them over, “Yes, hand them over (Recommended)”.
//   1. off: every place that shows an item shows today's picture, the very same one, at every rarity;
//   2. on: each place asks for itemArt(kind, rarity): the bag and the hero's gear, the piece carried under the finger, the stash
//      and the vendors' shelves and the piece carried out of them (their own rarity), the stranger's throws (Normal: a kind, not
//      yet a piece) and loot lying on the floor (its rarity);
//   3. every kind there is, the new classes' wraps, demonic tome and wrench too, has a picture at each rarity, each rarity its own;
//      with ITEMS_A on the new kinds' pictures are the art's, the stand-ins only for it off;
//   4. the empty slot's ghost is drawn at its size in game pixels (a picture painted two to a game pixel would come out twice
//      as big), and so is every slot's picture.
//   run: tsx --test tests/items_a_game.test.ts

// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
import { ITEMS_A, ITEM_A_KINDS, ITEM_A_OLD, itemAKind, itemArt } from '../src/art/items_a';
import { itemPic, makeIconArt } from '../src/art/icons';
import type { IconArt } from '../src/art/icons';
import { GAMBLE_KINDS, NEW_WEAPONS, gambleKinds } from '../src/game/defs';
import { CLASS_BASES, ITEM_BASES } from '../src/game/items';
import { ALL_CLASS_IDS, CLASS_WEAPONS, ICON_KEYS } from '../src/game/types';
import type { IconKey, Rarity } from '../src/game/types';
import { Ui } from '../src/ui/ui';
import { paintWithoutCanvas, paintingOf } from './helpers';

paintWithoutCanvas();

const fs = nodeFs as { readFileSync(p: string, e: string): string; readdirSync(p: string, o: { recursive: boolean }): string[] };
const RARS: readonly Rarity[] = [0, 1, 2, 3];
const art: IconArt = makeIconArt();

function withItemsA<T>(on: boolean, run: () => T): T {
  const was = ITEMS_A.on;
  ITEMS_A.on = on;
  try {
    return run();
  } finally {
    ITEMS_A.on = was;
  }
}

/** Every picture key the game can ask for: the record's, every base's, the stranger's (for every class, the new weapons on). */
function everyKey(): IconKey[] {
  const keys = new Set<IconKey>(ICON_KEYS);
  for (const b of [...ITEM_BASES, ...CLASS_BASES]) keys.add(b.icon);
  const was = NEW_WEAPONS.on;
  NEW_WEAPONS.on = true;
  try {
    for (const cls of ALL_CLASS_IDS) for (const k of gambleKinds(cls)) keys.add(k.icon);
  } finally {
    NEW_WEAPONS.on = was;
  }
  for (const k of GAMBLE_KINDS) keys.add(k.icon);
  return [...keys];
}

// ---------------------------------------------------------------------------------------------
// Where the game asks

/** Each place that shows an item, and how it must ask for its picture: the file, the call, what it is. */
const PLACES: readonly { file: string; call: string; what: string }[] = [
  { file: 'src/ui/inventory.ts', call: 'itemPic(art.icons, it.icon, it.rarity, it.unique)', what: 'the bag and the hero\'s gear, at the piece\'s rarity (a unique\'s own picture: tests/items_unique.test.ts)' },
  { file: 'src/ui/inventory.ts', call: 'itemPic(art.icons, carried.icon, carried.rarity, carried.unique)', what: 'the piece carried under the finger' },
  { file: 'src/ui/inventory.ts', call: 'itemPic(art.icons, GHOST[c.sel.slot], 0)', what: 'the empty slot\'s ghost, the kind\'s Normal' },
  { file: 'src/ui/town.ts', call: 'itemPic(art.icons, it.icon, it.rarity, it.unique)', what: 'the stash and the vendors\' shelves, each piece its own rarity' },
  { file: 'src/ui/town.ts', call: 'itemPic(art.icons, c.item.icon, c.item.rarity, c.item.unique)', what: 'the piece carried out of the stash or a shelf' },
  { file: 'src/ui/trades.ts', call: 'itemPic(art.icons, c.kind.icon, 0)', what: 'the stranger\'s throws: a kind, no rarity yet, so Normal' },
  { file: 'src/render/render.ts', call: 'itemPic(art.icons, dr.item.icon, dr.item.rarity, dr.item.unique)', what: 'loot lying on the floor, at its rarity' },
];

test('every place that shows an item asks itemPic for it, with the rarity it knows', () => {
  for (const p of PLACES) {
    const src = fs.readFileSync(p.file, 'utf8');
    assert.equal(src.split(p.call).length - 1, 1, `${p.file}: ${p.what}: \`${p.call}\``);
    assert.ok(/import \{[^}]*\bitemPic\b[^}]*\} from '\.\.\/art\/icons';/.test(src), `${p.file} imports itemPic`);
  }
  // and nothing asks the old record for an item's picture behind itemPic's back (the record is read in art/icons.ts alone)
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev/') || f === 'art/icons.ts') continue;
    const src = fs.readFileSync(`src/${f}`, 'utf8');
    assert.ok(!/icons\.item\b/.test(src), `src/${f} reads icons.item itself`);
    assert.equal((src.match(/itemPic\(/g) ?? []).length, PLACES.filter((p) => p.file === `src/${f}`).length, `src/${f}: an itemPic not on the list`);
  }
});

test('the empty slot\'s ghost is drawn at its size in game pixels, as ui.slot draws every slot\'s picture', () => {
  const src = fs.readFileSync('src/ui/inventory.ts', 'utf8');
  assert.ok(src.includes('g.drawImage(ghost.img, c.r.x + Math.floor((CELL - ghost.w) / 2), c.r.y + Math.floor((CELL - ghost.h) / 2), ghost.w, ghost.h);'), 'the ghost passes its width and height');
  assert.ok(!/g\.drawImage\(ghost\.img, [^;]*\(CELL - ghost\.h\) \/ 2\)\);/.test(src), 'no ghost drawn at its picture\'s own size');
  // a slot draws a picture painted two to a game pixel at 16 by 16 game pixels, in the middle of its 20
  const draws: number[][] = [];
  const g = {
    fillStyle: '', strokeStyle: '', globalAlpha: 1, lineWidth: 1,
    fillRect: (): void => {}, strokeRect: (): void => {}, beginPath: (): void => {}, rect: (): void => {}, fill: (): void => {}, stroke: (): void => {},
    drawImage: (_img: unknown, ...a: number[]): void => void draws.push(a),
  };
  const ui = new Ui();
  ui.begin(g as unknown as CanvasRenderingContext2D, 400, 200, null, -1, -1, false);
  for (const r of RARS) {
    draws.length = 0;
    ui.slot(10, 30, 20, itemArt('tome', r));
    assert.deepEqual(draws, [[12, 32, 16, 16]], `the tome (rarity ${r}) in a slot`);
  }
});

// ---------------------------------------------------------------------------------------------
// Off

test('off: every place shows today\'s picture, the very same one, at every rarity', () => {
  assert.equal(ITEMS_A.on, true, 'ON at his yes of 3 Nov 2026; off for this test');
  ITEMS_A.on = false;
  try {
  for (const key of everyKey()) {
    for (const r of RARS) assert.ok(itemPic(art, key, r) === art.item[key], `${key} (rarity ${r}) is today's picture`);
    const s = art.item[key];
    // today's are one picture pixel to a game pixel: drawn at their size (the ghost now passes it) they are drawn as they always were
    assert.equal(s.density ?? 1, 1, key);
    assert.equal(paintingOf(s).w, s.w, `${key}: width`);
    assert.equal(paintingOf(s).h, s.h, `${key}: height`);
  }
  // the new classes' weapons: their stand-ins
  for (const kind of CLASS_WEAPONS) assert.ok(itemPic(art, kind, 2) === art.item[kind], `${kind}: the stand-in, off`);
  } finally {
    ITEMS_A.on = true;
  }
});

// ---------------------------------------------------------------------------------------------
// On

test('on: every place asks for the art\'s itemArt(kind, rarity); the old weapons show the kind each became', () => {
  withItemsA(true, () => {
    for (const key of everyKey()) {
      const kind = itemAKind(key);
      assert.ok(kind, `${key}: a picture of the art's`);
      for (const r of RARS) {
        const s = itemPic(art, key, r);
        assert.ok(s === itemArt(kind!, r), `${key} (rarity ${r}) is the art's ${kind} at that rarity`);
        assert.ok(s !== art.item[key], `${key}: not today's`);
        assert.equal(s.w, 16, key);
        assert.equal(s.h, 16, key);
        assert.equal(s.ax, 8, key);
        assert.equal(s.ay, 8, key);
        assert.equal(s.density, 2, key);
      }
    }
    for (const [old, now] of Object.entries(ITEM_A_OLD)) {
      for (const r of RARS) assert.ok(itemPic(art, old as IconKey, r) === itemArt(now, r), `${old} shows the ${now}`);
    }
  });
  // (and as it was again after: ON, at his yes of 3 Nov 2026)
  assert.ok(itemPic(art, 'sword', 3) === itemArt('sword', 3), 'and on again, as it is in the game');
});

test('every kind, the wraps, the demonic tome and the wrench too, has a picture at each rarity, each rarity its own', () => {
  for (const kind of ['wraps', 'tome', 'wrench'] as const) {
    assert.ok((ITEM_A_KINDS as readonly string[]).includes(kind), `${kind}: the art has it`);
    assert.ok((CLASS_WEAPONS as readonly string[]).includes(kind), `${kind}: a weapon of the game's`);
  }
  // every kind of the art's is a picture key of the game's (so none of them goes unseen)
  for (const kind of ITEM_A_KINDS) assert.ok((ICON_KEYS as readonly string[]).includes(kind), `${kind}: a key the game knows`);
  withItemsA(true, () => {
    for (const kind of ITEM_A_KINDS) {
      const seen: string[] = [];
      for (const r of RARS) {
        const p = paintingOf(itemPic(art, kind, r));
        assert.equal(p.w, 32, `${kind} (rarity ${r})`);
        assert.equal(p.h, 32, `${kind} (rarity ${r})`);
        let painted = 0;
        for (let k = 3; k < p.d.length; k += 4) if (p.d[k]) painted++;
        assert.ok(painted >= 150, `${kind} (rarity ${r}): ${painted} pixels`);
        seen.push(Array.from(p.d).join(','));
      }
      assert.equal(new Set(seen).size, 4, `${kind}: four rarities, four pictures`);
    }
    // the new classes' weapons: the art's, not the stand-ins
    for (const kind of CLASS_WEAPONS) {
      for (const r of RARS) {
        const s = itemPic(art, kind, r);
        assert.ok(s === itemArt(kind, r), `${kind} (rarity ${r}) is the art's`);
        assert.ok(s !== art.item[kind] && s.img !== art.item[kind].img, `${kind}: not the stand-in`);
      }
    }
  });
});
