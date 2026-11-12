// UNIQUE ITEMS (game/uniques.ts UNIQUES, switched on for this page only): the practice room's Warrior with uniques in his bag and on
// him: a unique's card read in the bag (its name in orange, its ordinary stats, what it does, its price, “Cannot be crafted”); his
// attacks with The Third Word worn (three slots in front of his tap attack) and The Cantor's Echo (Twin behind his hold, no slot
// used); and a fight with several at work (the Drowned Arm's tentacle, the Fleshmancer's Brand's risen elite, the Windcutter's
// blade), to see that nothing breaks. For a look, and for his pictures.
//   node tools/build_to.mjs dist/uniques.html
//   node tools/playtest.mjs --file dist/uniques.html --size 960x540 --scenario tools/scenarios/uniques_look.mjs --out shots/uniques/a
export default async function (page, snap) {
  const say = (s) => console.log(`  ${s}`);
  const bad = (s) => console.log(`  !! ${s}`);
  const cls = process.env.UNIQUE_CLASS || 'warrior';
  const set = await page.evaluate((cls) => {
    const d = window.__dbg;
    d.uniques.on = true;
    d.saving(false);
    d.loading.on = false;
    d.practice(cls, 7);
    d.autoLevel = false;
    d.autoWords = false;
    const g = d.game(); const h = g.hero;
    g.waveT = 1e9; g.monsters.length = 0;
    for (let i = 0; i < h.bag.length; i++) h.bag[i] = null;
    const ids = ['mothswing', 'thirdword', 'cantorsecho', 'drownedarm', 'fleshmancersbrand', 'brokenshackles', 'windcutter', 'pivot', 'longodds', 'censorsseal', 'twofacedmask', 'bloodprice'];
    for (const id of ids) g.giveUnique(id, 12);
    for (const it of h.bag) if (it) it.reqLevel = 1;
    d.inv();
    d.invUi.page = 'gear';
    d.invUi.sel = { kind: 'bag', i: 0 };
    return { bag: h.bag.filter(Boolean).map((it) => it.name) };
  }, cls);
  say(`set: ${JSON.stringify(set)}`);
  await page.waitForTimeout(500);
  await snap('1_card_moths_wing');
  await page.evaluate(() => { const d = window.__dbg; d.invUi.sel = { kind: 'bag', i: 5 }; });
  await page.waitForTimeout(300);
  await snap('2_card_broken_shackles');
  await page.evaluate(() => { const d = window.__dbg; d.invUi.sel = { kind: 'bag', i: 3 }; });
  await page.waitForTimeout(300);
  await snap('3_card_drowned_arm');
  // put them on: the amulet (The Third Word), a ring (The Cantor's Echo), the gloves, the boots, the greatsword
  const worn = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const on = (id) => { const i = h.bag.findIndex((it) => it && it.unique === id); return i < 0 ? 'not in the bag' : g.equipFromBag(i); };
    const why = ['thirdword', 'cantorsecho', 'fleshmancersbrand', 'brokenshackles', 'windcutter'].map((id) => [id, on(id)]);
    h.life = h.d.maxLife;
    d.invUi.sel = null;
    d.invUi.page = 'attacks';
    return { why, worn: g.worn, front: h.skills[0].front.length, holdBehind: h.skills[1].eff ? h.skills[1].eff.behind : null, cd: h.skills[2].r.cooldown };
  });
  say(`worn: ${JSON.stringify(worn)}`);
  if (worn.front !== 3) bad('The Third Word gave no third slot');
  if (!worn.holdBehind || !worn.holdBehind.includes('twin')) bad("The Cantor's Echo added no Twin behind the hold attack");
  if (worn.cd !== 0) bad('Broken Shackles left the swipe its cooldown');
  await page.waitForTimeout(400);
  await snap('4_attacks_third_word');
  // a fight: the inventory shut, a pack set by him, an elite among them
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    d.panels.open = 'none';
    d.god = true;
    const on = (id) => { const i = h.bag.findIndex((it) => it && it.unique === id); if (i >= 0) g.equipFromBag(i); };
    on('drownedarm');
    const mk = (dx, dy, elite) => { const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng); g.wakeUp(m); m.speed = 0; m.cd = 1e9; if (elite) { m.elite = true; m.name = 'An elite'; m.words = ['leech']; m.life = m.maxLife = 60; } else m.life = m.maxLife = 4000; return m; };
    mk(1.4, 0, true); mk(2.6, 1, false); mk(2.6, -1, false); mk(4.5, 0, false); mk(6, 0.5, false);
    h.fx = 1; h.fy = 0;
  });
  // his Strike, again and again, at the enemy before him (world +x is down and to the right on the screen)
  const strike = () => page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; h.swingT = 0; g.useBasic(h.x + 1, h.y); });
  for (let k = 0; k < 12; k++) {
    await strike();
    await page.waitForTimeout(420);
    if (k === 2) await snap('5_fight_blade');
    if (k === 6) await snap('6_fight_risen');
  }
  await page.waitForTimeout(300);
  await snap('7_fight_later');
  const after = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); return { risen: g.risen ? g.risen.name : null, worn: g.worn, left: g.monsters.filter((m) => !m.dead).length }; });
  say(`after the fight: ${JSON.stringify(after)}`);
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
