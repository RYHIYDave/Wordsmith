// THE NEW ITEM PICTURES IN THE GAME (style A, src/art/items_a.ts), on an iPhone 16 held sideways, drawn by the game itself (the
// build of tools/items_a_build.mjs, dist/items_a.html, whose item pictures are the new ones at the rarity after an '@' in an item's
// picture key): the gear and the bag, full, a mix of rarities; then a few lying on the floor as loot.
//   node tools/items_a_build.mjs && node tools/playtest.mjs --file dist/items_a.html --touch --size 852x393 --dpr 3 \
//     --scenario tools/scenarios/items_a_phone.mjs --out <dir>
import fs from 'node:fs';
import path from 'node:path';

// what each slot holds: [kind, rarity]. The wraps, the tome and the wrench are not kinds in the game yet: each is made as the
// nearest kind (gloves, a wand) and shown with its own picture.
const GEAR = { mainhand: ['sword', 3], offhand: ['shield', 2], helm: ['helm', 1], chest: ['armor', 2], gloves: ['gloves', 0], belt: ['belt', 1], boots: ['boots', 3], amulet: ['amulet', 2], ring1: ['ring', 3], ring2: ['ring', 0] };
const BAG = [
  ['greatsword', 2], ['bow', 1], ['wand', 3], ['staff', 0], ['wraps', 3], ['tome', 2], ['wrench', 3], ['quiver', 1],
  ['focus', 2], ['hood', 3], ['robe', 1], ['boots', 0], ['wraps', 0], ['tome', 3], ['wrench', 1], ['amulet', 0],
  ['shield', 1], ['helm', 0], ['armor', 3], ['gloves', 2], ['belt', 0], ['sword', 1], ['ring', 2], null,
];
const FLOOR = [['greatsword', 3], ['helm', 2], ['ring', 1], ['boots', 0], ['shield', 1], ['bow', 2], ['amulet', 3], ['armor', 0]];
const SLOT_OF = { sword: 'mainhand', greatsword: 'mainhand', bow: 'mainhand', wand: 'mainhand', staff: 'mainhand', wraps: 'gloves', tome: 'mainhand', wrench: 'mainhand', shield: 'offhand', quiver: 'offhand', focus: 'offhand', helm: 'helm', hood: 'helm', armor: 'chest', robe: 'chest', gloves: 'gloves', belt: 'belt', boots: 'boots', ring: 'ring', amulet: 'amulet' };

export default async function (page, snap) {
  const dir = path.resolve(process.env.ITEMS_OUT || 'shots/items_a');
  fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; });
  await page.waitForTimeout(700);
  await page.evaluate(({ GEAR, BAG, SLOT_OF }) => {
    const d = window.__dbg; const h = d.game().hero;
    let seed = 11;
    const mk = (kind, rarity) => { const it = d.item(SLOT_OF[kind], rarity, 1, seed++); it.icon = `${kind}@${rarity}`; it.rarity = rarity; if (['sword', 'greatsword', 'bow', 'wand', 'staff'].includes(kind)) it.weapon = kind; if (['shield', 'quiver', 'focus'].includes(kind)) it.offhand = kind; return it; };
    for (const [slot, [kind, r]] of Object.entries(GEAR)) h.gear[slot] = mk(kind, r);
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = BAG[i] ? mk(BAG[i][0], BAG[i][1]) : null;
    d.inv();
  }, { GEAR, BAG, SLOT_OF });
  await page.waitForTimeout(700);
  await snap('inventory');
  const marks = await page.evaluate(() => {
    const d = window.__dbg; const out = {};
    for (const [k, r] of d.ui.marks) if (/^(bag|gear):/.test(k) || k === 'inventory') out[k] = { x: r.x, y: r.y, w: r.w, h: r.h };
    return out;
  });
  fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({ marks, gear: GEAR, bag: BAG }, null, 1));

  // the floor: into the dungeon, no monsters, and the pieces laid round the hero
  await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 1; g.enterDungeon(); });
  await page.waitForTimeout(800);
  await page.evaluate(({ FLOOR, SLOT_OF }) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; d.god = true;
    g.monsters.length = 0;
    g.drops.length = 0;
    // (somewhere open: the middle of the biggest room)
    const f = g.level.floor;
    const room = [...f.rooms].sort((a, b) => b.w * b.h - a.w * a.h)[0];
    if (room) { h.x = room.x + room.w * 0.36; h.y = room.y + room.h * 0.36; }
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) g.level.explored[y * f.w + x] = 1;
    // (nothing standing near: the props round about are taken away, for the picture)
    g.level.props = g.level.props.filter((p) => Math.hypot(p.x - h.x, p.y - h.y) > 7);
    let seed = 40;
    // laid out before the hero in two rows of four, as a screen sees them (across: x - y; down: x + y)
    FLOOR.forEach(([kind, r], i) => {
      const it = d.item(SLOT_OF[kind], r, 3, seed++); it.icon = `${kind}@${r}`; it.rarity = r;
      // (named on the floor by its kind, as the game names it: the kind the picture shows)
      if (['sword', 'greatsword', 'bow', 'wand', 'staff'].includes(kind)) it.weapon = kind;
      if (['shield', 'quiver', 'focus'].includes(kind)) it.offhand = kind;
      const across = [-4.2, -1.4, 1.4, 4.2][i % 4], down = i < 4 ? 2.0 : 5.6;
      g.drops.push({ x: h.x + (down + across) / 2, y: h.y + (down - across) / 2, kind: 'item', gold: 0, item: it, word: null, age: 9 });
    });
  }, { FLOOR, SLOT_OF });
  // (after the floor's name has faded)
  await page.waitForTimeout(5200);
  await snap('floor');
  console.log('done');
}
