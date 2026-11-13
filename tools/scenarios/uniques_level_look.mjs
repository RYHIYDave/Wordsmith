// HIS LEVELING UNIQUES AND POISON DAMAGE ON HIS TEST PAGE (game/uniques.ts LEVEL_DEFS, game/items.ts POISON_DMG; both on for the
// page only, main.ts `try=uniques`). The page as it is published (tools/uniques_try_page.mjs), a finger to the floor as he would
// go; then the Warrior given the Rot Axe, the Packstrap and the Lantern Cap from what he was handed, a monster of the floor's own
// set before him, and his Strike at it: its poison, the shield on him and back again, and the cards read. Nothing is switched
// on by the playtest: the page is built so.
//   node tools/playtest.mjs --file dist/try_uniques/index.html --serve --touch --size 852x393 --dpr 3 \
//     --scenario tools/scenarios/uniques_level_look.mjs --out shots/try_level/look
// FLOOR: which floor (10).
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  const want = Number(process.env.FLOOR || 10);
  const hands = await makeHands(page);
  const wait = (ms) => page.waitForTimeout(ms);
  await wait(800);
  await hands.press('button:OPTIONS');
  await wait(300);
  await hands.press('button:LEVEL SELECT');
  await wait(300);
  await hands.press(`floor:${want}`);
  await wait(400);
  await hands.press('class:warrior');
  await page.waitForFunction(() => { const g = window.__dbg.game(); return !!g && !g.level.town && g.trial === true; }, null, { timeout: 30000 });
  await page.waitForFunction(() => !window.__dbg.loadingNow(), null, { timeout: 90000, polling: 100 });
  await wait(2000);
  // the three put on from where he was handed them (his bag or the stash)
  const put = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const take = (id) => {
      let i = h.bag.findIndex((it) => it && it.unique === id);
      if (i >= 0) { const it = h.bag[i]; h.bag[i] = null; return it; }
      i = g.meta.stash.findIndex((it) => it && it.unique === id);
      if (i >= 0) { const it = g.meta.stash[i]; g.meta.stash[i] = null; return it; }
      return null;
    };
    const out = {};
    for (const [id, slot] of [['rotaxe', 'mainhand'], ['packstrap', 'belt'], ['lanterncap', 'helm']]) {
      const it = take(id);
      out[id] = it ? { rolls: it.uroll ?? null, mods: it.affixes.flatMap((a) => a.mods.map((m) => `${m.stat} ${m.value}`)) } : null;
      if (it) h.gear[slot] = it;
    }
    if (h.gear.mainhand && h.gear.mainhand.hands === 2) h.gear.offhand = null;
    g.refresh();
    d.god = true;
    return { out, worn: g.worn, life: h.d.maxLife, res: [h.d.resFire, h.d.resFrost, h.d.resLight, h.d.resPoison] };
  });
  log('put on', JSON.stringify(put));
  for (const id of ['rotaxe', 'packstrap', 'lanterncap']) if (!put.worn.includes(id)) bad(`${id} not worn`);
  // the shield comes on him
  await wait(400);
  const shield = await page.evaluate(() => window.__dbg.game().hero.shield);
  log('his shield', String(shield));
  if (!(shield > 0)) bad('no shield on him');
  await snap('1_shield');
  // a monster of the floor's own before him, and his Strike at it, a few times
  const set = await page.evaluate(() => {
    const g = window.__dbg.game(); const h = g.hero;
    const run = g.update.bind(g);
    window.__fire = 0;
    g.update = (dt, c) => { if (window.__fire > 0 && window.__at) { window.__fire--; c.fire = true; c.aimX = window.__at.x; c.aimY = window.__at.y; } return run(dt, c); };
    const k = g.monsters.length ? g.monsters[0].kind : 'skeleton';
    for (const [dx, dy] of [[1.2, 0], [-1.2, 0], [0, 1.2], [0, -1.2]]) {
      if (!g.isOpen(h.x + dx, h.y + dy)) continue;
      const m = g.spawn(k, h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
      window.__at = { x: m.x, y: m.y };
      window.__m = m;
      return k;
    }
    return null;
  });
  log('a monster set before him', String(set));
  if (!set) bad('no open floor beside him');
  await page.evaluate(() => { window.__fire = 400; });
  await wait(250);
  await snap('2_strike');
  // (by the game's own time: until it is poisoned, then a little of it working)
  await page.waitForFunction(() => window.__m && window.__m.poisonT > 0, null, { timeout: 30000, polling: 50 }).catch(() => {});
  await page.evaluate(() => { window.__t0 = window.__dbg.game().time; });
  await page.waitForFunction(() => window.__dbg.game().time - window.__t0 > 0.8, null, { timeout: 30000, polling: 50 }).catch(() => {});
  await page.evaluate(() => { window.__fire = 0; });
  await snap('3_poisoned');
  const m = await page.evaluate(() => { const m = window.__m; return { lost: m.maxLife - m.life, poisonT: m.poisonT, poisonDps: m.poisonDps, n: m.poisonN }; });
  log('the monster', JSON.stringify(m));
  if (!(m.poisonT > 0 && m.poisonDps > 0)) bad('not poisoned');
  // the shield broken by a blow, and back after its time
  // (the floor's other monsters held still and their shots taken away, so no blow but this one reaches him meanwhile: its time
  // starts again with every blow)
  await page.evaluate(() => { const g = window.__dbg.game(); for (const o of g.monsters) { o.cd = 1e9; o.speed = 0; } g.projectiles = g.projectiles.filter((p) => !p.hostile); });
  // (a blow that breaks it: a big one, his life kept whole after it)
  await page.evaluate(() => { const g = window.__dbg.game(); const h = g.hero; const life = h.life; h.life = 1e7; g.hurtHero(h.shield * 20, 'phys', [], null, 'a test'); h.life = life; });
  await wait(200);
  const broken = await page.evaluate(() => window.__dbg.game().hero.shield);
  await snap('4_broken');
  // (by the game's own time, which runs slower than the clock on a page this heavy)
  await page.waitForFunction(() => { const g = window.__dbg.game(); return g.time - g.uq.hurtAt > g.wornRoll('packstrap', 'back') + 0.3; }, null, { timeout: 60000, polling: 100 }).catch(() => {});
  const back = await page.evaluate(() => window.__dbg.game().hero.shield);
  log('since the last blow', JSON.stringify(await page.evaluate(() => { const g = window.__dbg.game(); return { since: g.time - g.uq.hurtAt, back: g.wornRoll('packstrap', 'back'), wears: g.wears('packstrap'), zones: g.zones.length, shieldT: g.hero.shieldT }; })));
  log('the shield', `broken: ${broken}, then: ${back}`);
  if (broken !== 0 || !(back > 0)) bad('the shield did not break and come back');
  await snap('5_back');
  // the cards
  await page.evaluate(() => { const d = window.__dbg; d.inv(); d.invUi.page = 'gear'; d.invUi.sel = { kind: 'gear', slot: 'mainhand' }; });
  await wait(400);
  await snap('6_axe_card');
  await page.evaluate(() => { window.__dbg.invUi.sel = { kind: 'gear', slot: 'helm' }; });
  await wait(300);
  await snap('7_cap_card');
  await page.evaluate(() => { window.__dbg.invUi.sel = { kind: 'gear', slot: 'belt' }; });
  await wait(300);
  await snap('8_strap_card');
}
