// THE NEW ITEM PICTURES (docs/mockups/items_look): the inventory as an iPhone 16 shows it, held sideways, with a full bag and
// every slot worn, for tools/items_look_sheet.ts to lay the new pictures over (each slot's place is written beside the shot).
//   node tools/playtest.mjs --touch --size 852x393 --dpr 3 --scenario tools/scenarios/items_look_phone.mjs --out <dir>
import fs from 'node:fs';
import path from 'node:path';

// what each slot holds: [icon, rarity]; 'wraps' (the Veteran's) is not in the game: a stand-in is put there and painted over
const GEAR = { mainhand: ['sword', 2], offhand: ['shield', 1], helm: ['helm', 3], chest: ['armor', 0], gloves: ['gloves', 1], belt: ['belt', 2], boots: ['boots', 0], amulet: ['amulet', 3], ring1: ['ring', 1], ring2: ['ring', 2] };
const BAG = [
  ['greatsword', 3], ['bow', 1], ['wand', 2], ['staff', 0], ['quiver', 1], ['focus', 2], ['hood', 0], ['robe', 1],
  ['wraps', 3], ['sword', 0], ['helm', 1], ['boots', 2], ['ring', 0], ['amulet', 1], ['gloves', 0], ['belt', 1],
  ['armor', 2], ['shield', 0], ['bow', 2], ['staff', 1], null, null, null, null,
];
const SLOT_OF = { sword: 'mainhand', greatsword: 'mainhand', bow: 'mainhand', wand: 'mainhand', staff: 'mainhand', wraps: 'gloves', shield: 'offhand', quiver: 'offhand', focus: 'offhand', helm: 'helm', hood: 'helm', armor: 'chest', robe: 'chest', gloves: 'gloves', belt: 'belt', boots: 'boots', ring: 'ring', amulet: 'amulet' };

export default async function (page, snap) {
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; });
  await page.waitForTimeout(700);
  await page.evaluate(({ GEAR, BAG, SLOT_OF }) => {
    const d = window.__dbg; const h = d.game().hero;
    let seed = 11;
    const mk = (icon, rarity) => { const it = d.item(SLOT_OF[icon], rarity, 1, seed++); it.icon = icon === 'wraps' ? 'gloves' : icon; return it; };
    for (const [slot, [icon, r]] of Object.entries(GEAR)) h.gear[slot] = mk(icon, r);
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
  const scale = await page.evaluate(() => { const c = document.querySelector('canvas'); return { dpr: window.devicePixelRatio, canvasW: c.width, cssW: c.getBoundingClientRect().width, innerW: window.innerWidth, innerH: window.innerHeight }; });
  const dir = path.resolve(process.env.ITEMS_OUT || 'shots/items_look');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'inventory.json'), JSON.stringify({ marks, screen: scale, gear: GEAR, bag: BAG }, null, 1));
  console.log('marks', Object.keys(marks).length);
}
