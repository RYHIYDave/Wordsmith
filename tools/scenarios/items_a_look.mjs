// THE NEW ITEM PICTURES IN THE GAME ITSELF (art/items_a.ts, behind ITEMS_A, asked for through art/icons.ts itemPic), with the new
// classes' weapons (NEW_WEAPONS): both switches turned on here, for the pictures. On an iPhone 16 held sideways:
//   a. a Warrior's inventory, his gear and a bag full of every kind of item at mixed rarities;
//   b. a Warlock's with his demonic tome in hand, a Tinkerer's with her wrench, the Veteran's (the Brawler, VETERAN on) with his
//      wraps: each with the other three rarities of his own weapon in the bag;
//   c. loot lying on a dungeon floor at all four rarities;
//   d. the armourer's shelf (the Tinkerer's: her plain wrench on it), and the mystic's (the Warlock's: his plain tome on it);
//   e. the stranger's throws (the Veteran's: his wraps among them).
// A line starting "!!" is something wrong.
//   node tools/build_brawler_to.mjs dist/items.html
//   node tools/playtest.mjs --file dist/items.html --touch --size 852x393 --dpr 3 --scenario tools/scenarios/items_a_look.mjs --out shots/items_a_look/items
// Every piece is one the game rolls (a Unique is a Rare made Unique: none is rolled yet), and every slot and every piece on the
// floor is drawn by the game, asking itemPic for its picture at its rarity.

const SLOT_OF = { sword: 'mainhand', greatsword: 'mainhand', bow: 'mainhand', wand: 'mainhand', staff: 'mainhand', wraps: 'mainhand', tome: 'mainhand', wrench: 'mainhand', shield: 'offhand', quiver: 'offhand', focus: 'offhand', helm: 'helm', hood: 'helm', armor: 'chest', robe: 'chest', gloves: 'gloves', belt: 'belt', boots: 'boots', ring: 'ring', amulet: 'amulet' };
const OWN_CLS = { wraps: 'brawler', tome: 'warlock', wrench: 'tinkerer' };

// a. the Warrior: what he wears, and his bag (every kind, the rarities mixed)
const W_GEAR = { mainhand: ['greatsword', 3], offhand: null, helm: ['helm', 1], chest: ['armor', 2], gloves: ['gloves', 0], belt: ['belt', 1], boots: ['boots', 3], amulet: ['amulet', 2], ring1: ['ring', 3], ring2: ['ring', 0] };
const W_BAG = [
  ['sword', 1], ['greatsword', 0], ['bow', 2], ['wand', 3], ['staff', 1], ['wraps', 3], ['tome', 2], ['wrench', 1],
  ['shield', 2], ['quiver', 0], ['focus', 3], ['helm', 2], ['hood', 1], ['armor', 0], ['robe', 3], ['gloves', 2],
  ['belt', 3], ['boots', 1], ['ring', 1], ['amulet', 0], ['tome', 0], ['wraps', 1], ['wrench', 2], ['sword', 3],
];
// b. each new class with his own weapon in hand (as he starts: Normal), its other three rarities in the bag, and a few more
const OWN_BAG = {
  warlock: [['tome', 1], ['tome', 2], ['tome', 3], ['focus', 2], ['robe', 1], ['hood', 3], ['ring', 2], ['amulet', 1]],
  tinkerer: [['wrench', 1], ['wrench', 2], ['wrench', 3], ['shield', 1], ['gloves', 3], ['belt', 2], ['boots', 0], ['ring', 1]],
  brawler: [['wraps', 1], ['wraps', 2], ['wraps', 3], ['gloves', 1], ['armor', 3], ['helm', 2], ['belt', 0], ['amulet', 3]],
};
// c. on the floor, two rows of four: each rarity twice
const FLOOR = [['greatsword', 0], ['tome', 1], ['ring', 2], ['wrench', 3], ['boots', 3], ['helm', 2], ['wraps', 1], ['shield', 0]];

export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.itemsA.on = true;
    d.newWeapons.on = true;
    d.saving(false);
  });
  // (a piece of a kind, at a rarity, rolled by the game for a hero of the class the kind belongs to)
  const MAKE = `(kind, r, ilvl, seed0) => {
    const d = window.__dbg;
    const SLOT_OF = ${JSON.stringify(SLOT_OF)}; const OWN_CLS = ${JSON.stringify(OWN_CLS)};
    for (let seed = seed0; seed < seed0 + 4000; seed++) {
      const it = d.item(SLOT_OF[kind], Math.min(r, 2), ilvl, seed, OWN_CLS[kind]);
      if (it.icon !== kind) continue;
      if (r === 3) it.rarity = 3;
      it.reqLevel = 1;
      return it;
    }
    throw new Error('no ' + kind);
  }`;
  const hero = async (cls, seed, gear, bag) => {
    await page.evaluate(({ cls, seed }) => {
      const d = window.__dbg;
      if (cls === 'brawler') d.veteran.on = true;
      d.panels.open = 'none';
      d.run(cls, seed); d.autoLevel = false; d.autoWords = false;
    }, { cls, seed });
    await page.waitForTimeout(700);
    return page.evaluate(({ gear, bag, MAKE }) => {
      const make = eval(MAKE);
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      // (level 12 and his ring lit, as by the seasoned hook: no LEVEL UP over the picture; gold to spend, so no shelf is dimmed)
      d.seasoned(12);
      h.gold = 5000;
      let seed = 101;
      if (gear) for (const [slot, v] of Object.entries(gear)) h.gear[slot] = v ? make(v[0], v[1], 4 + (seed % 9), (seed += 37)) : null;
      for (let i = 0; i < h.bag.length; i++) h.bag[i] = bag[i] ? make(bag[i][0], bag[i][1], 4 + (seed % 9), (seed += 37)) : null;
      g.refresh();
      d.inv();
      const m = h.gear.mainhand;
      return { cls: h.cls, main: m ? `${m.name} (${m.weapon}, rarity ${m.rarity}, icon ${m.icon})` : 'none', bag: h.bag.filter(Boolean).map((it) => `${it.icon}@${it.rarity}`).join(' ') };
    }, { gear, bag, MAKE });
  };

  // ---- a. the Warrior ----------------------------------------------------------------------------------
  let s = await hero('warrior', 9, W_GEAR, W_BAG);
  say(`warrior: in hand ${s.main}`);
  say(`  bag: ${s.bag}`);
  await page.waitForTimeout(600);
  await snap('a_warrior');

  // ---- c. the floor (the Warrior's, in the first dungeon) ------------------------------------------------
  await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
  await page.waitForTimeout(300);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 1; g.enterDungeon(); });
  await page.waitForTimeout(800);
  const laid = await page.evaluate(({ FLOOR, MAKE }) => {
    const make = eval(MAKE);
    const d = window.__dbg; const g = d.game(); const h = g.hero; d.god = true;
    // (a first-floor hero, level 1: no NEW TALENT prompt over the loot; every piece here needs level 1)
    h.level = 1; h.xp = 0; g.refresh();
    g.monsters.length = 0;
    g.drops.length = 0;
    // (somewhere open: the middle of the biggest room, everything seen, nothing standing near)
    const f = g.level.floor;
    const room = [...f.rooms].sort((a, b) => b.w * b.h - a.w * a.h)[0];
    if (room) { h.x = room.x + room.w * 0.36; h.y = room.y + room.h * 0.36; }
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) g.level.explored[y * f.w + x] = 1;
    g.level.props = g.level.props.filter((p) => Math.hypot(p.x - h.x, p.y - h.y) > 7);
    let seed = 400;
    // laid out before the hero in two rows of four, as a screen sees them (across: x - y; down: x + y)
    FLOOR.forEach(([kind, r], i) => {
      const it = make(kind, r, 3, (seed += 53));
      const across = [-4.2, -1.4, 1.4, 4.2][i % 4], down = i < 4 ? 3.6 : 7.0;
      g.drops.push({ x: h.x + (down + across) / 2, y: h.y + (down - across) / 2, kind: 'item', gold: 0, item: it, word: null, age: 9 });
    });
    return g.drops.map((dr) => `${dr.item.icon}@${dr.item.rarity}`).join(' ');
  }, { FLOOR, MAKE });
  say(`on the floor: ${laid}`);
  // (after the floor's name has faded)
  await page.waitForTimeout(6800);
  await snap('c_floor');

  // ---- b. the three new classes, each with his own in hand ------------------------------------------------
  const want = { warlock: 'tome', tinkerer: 'wrench', brawler: 'wraps' };
  for (const [cls, seed] of [['warlock', 21], ['tinkerer', 22], ['brawler', 23]]) {
    s = await hero(cls, seed, null, OWN_BAG[cls]);
    say(`${cls}: in hand ${s.main}`);
    say(`  bag: ${s.bag}`);
    if (!s.main.includes(`(${want[cls]},`)) bad(`${cls} does not hold his ${want[cls]}`);
    await page.waitForTimeout(600);
    await snap(`b_${cls}`);
    // ---- d. the vendor who stocks his own: the Tinkerer's armourer, the Warlock's mystic ----------------------
    if (cls === 'tinkerer' || cls === 'warlock') {
      const id = cls === 'tinkerer' ? 'armourer' : 'mystic';
      const shelf = await page.evaluate((id) => {
        const d = window.__dbg; const g = d.game();
        d.panels.open = 'none';
        g.depth = 12; g.cleared = 11;
        g.rollShop();
        d.open(id);
        return g.shops[id].map((it) => (it ? `${it.icon}@${it.rarity}` : '-')).join(' ');
      }, id);
      say(`the ${id}'s shelf: ${shelf}`);
      await page.waitForTimeout(700);
      await snap(`d_${id}_${cls}`);
    }
    // ---- and the stranger's throws, for the Veteran (his wraps among them: a kind, so Normal) -----------------
    if (cls === 'brawler') {
      const kinds = await page.evaluate(() => {
        const d = window.__dbg; const g = d.game();
        d.panels.open = 'none';
        d.open('stranger');
        return g.gambleKinds().map((k) => k.icon).join(' ');
      });
      say(`the stranger's throws: ${kinds}`);
      if (!kinds.includes('wraps')) bad('the stranger offers the Veteran no wraps');
      await page.waitForTimeout(700);
      await snap(`e_stranger_${cls}`);
    }
  }
  console.log('done');
}
