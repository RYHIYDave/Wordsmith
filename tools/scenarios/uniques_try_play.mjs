// THE UNIQUE ITEMS' TEST PAGE: WHAT THREE OF THEM SHOW IN PLAY, ON A FLOOR OF THE GAME (render/unique_play.ts UNIQUE_PLAY, on for
// that page since 12 Nov 2026; the art's own looks, tools/scenarios/uniques_play_look.mjs, are all in the practice room). The
// page as it is published (tools/uniques_try_page.mjs), a finger to the floor as he would go (Options, the level select, a
// floor, a hero); then the unique is put on him and looked at where the floor's own monsters are. Nothing is switched on by
// the playtest: the page is built so.
//   node tools/playtest.mjs --file dist/try_uniques/index.html --serve --touch --size 852x393 --dpr 3 \
//     --scenario tools/scenarios/uniques_try_play.mjs --out shots/try_uniques_play/tome
// LOOK: tome (The Restless Tome, the Warlock), risen (The Fleshmancer's Brand, the Warrior), globe (The Fourth Globe, the
// Brawler). FLOOR: which floor (8).
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  const look = process.env.LOOK || 'tome';
  const want = Number(process.env.FLOOR || 8);
  const cls = look === 'tome' ? 'warlock' : look === 'globe' ? 'brawler' : 'warrior';
  const id = look === 'tome' ? 'restlesstome' : look === 'globe' ? 'fourthglobe' : 'fleshmancersbrand';
  const hands = await makeHands(page);
  const wait = (ms) => page.waitForTimeout(ms);
  await wait(800);
  const built = await page.evaluate(() => { const d = window.__dbg; return { uniques: d.uniques.on, play: { ...d.uniquePlay } }; });
  log('the page as built', JSON.stringify(built));
  if (!built.uniques || !built.play.tome || !built.play.risen || !built.play.fourth) bad('the page does not have the unique items and their three in-play pictures on');
  await hands.press('button:OPTIONS');
  await wait(300);
  await hands.press('button:LEVEL SELECT');
  await wait(300);
  await hands.press(`floor:${want}`);
  await wait(400);
  await hands.press(`class:${cls}`);
  await page.waitForFunction(() => { const g = window.__dbg.game(); return !!g && !g.level.town && g.trial === true; }, null, { timeout: 30000 });
  await wait(3000);
  // the unique put on him (his own from his bag where he was handed it; a boss's own is in his stash in town: given him here)
  const set = await page.evaluate((id) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    let i = h.bag.findIndex((it) => it && it.unique === id);
    const handed = i >= 0;
    if (i < 0) {
      const free = h.bag.findIndex((it) => !it);
      if (free < 0) h.bag[0] = null;
      g.giveUnique(id, g.depth);
      i = h.bag.findIndex((it) => it && it.unique === id);
      if (i >= 0) h.bag[i].reqLevel = 1;
    }
    const why = i < 0 ? 'not in his bag' : g.equipFromBag(i);
    d.panels.open = 'none';
    d.god = true;
    return { depth: g.depth, handed, why, wears: g.wears(id), monsters: g.monsters.length };
  }, id);
  log('put on', JSON.stringify(set));
  if (set.depth !== want) bad(`he is on floor ${set.depth}, not ${want}`);
  if (set.why !== null || !set.wears) bad(`${id} was not put on and counted as worn`);
  const shown = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const u = d.fx && d.fx.uniques;
    return { flames: u && u.flames ? u.flames.length : null, cracks: u && u.cracks ? u.cracks.length : null, risen: g.risen ? g.risen.kind : null, globes: g.hero.vet ? g.hero.vet.globes.slice() : null };
  });
  await wait(900);
  if (look === 'tome') {
    for (let k = 1; k <= 4; k++) { await wait(260); await snap(`${k}_turn`); }
    const s = await shown();
    log('shown', JSON.stringify(s));
    if (s.flames !== null && s.flames < 1) bad('no fire of the book is in the air: the Tome is not shown');
  } else if (look === 'risen') {
    // an elite of the floor's own set by him and struck dead by the game's own blow: it rises to fight for him
    const kind = await page.evaluate(() => {
      const g = window.__dbg.game(); const h = g.hero;
      const k = g.monsters.length ? g.monsters[0].kind : 'skeleton';
      for (const [dx, dy] of [[1.6, 0.2], [-1.6, 0.2], [0.2, 1.6], [0.2, -1.6]]) {
        if (!g.isOpen(h.x + dx, h.y + dy)) continue;
        const m = g.spawn(k, h.x + dx, h.y + dy, 1, 0, false, g.rng);
        m.elite = true; g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 60;
        g.damageMonster(m, Math.ceil(m.life), 'phys', false, -1);
        return k;
      }
      return null;
    });
    log('an elite struck dead beside him', String(kind));
    if (!kind) bad('no open floor beside him for the elite');
    await wait(250); await snap('1_rising');
    await wait(500); await snap('2_risen');
    const s = await shown();
    log('shown', JSON.stringify(s));
    if (!s.risen) bad('no elite rose');
    await wait(1500); await snap('3_fights');
    await page.evaluate(() => { const g = window.__dbg.game(); if (g.risen) g.risen.t = 0.05; });
    await wait(600); await snap('4_falls');
  } else {
    // four of his blows at a monster of the floor's own set before him: four globes, and the bar when the fourth is in
    await page.evaluate(() => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const run = g.update.bind(g);
      g.update = (dt, c) => { window.__c = c; return run(dt, c); };
      const k = g.monsters.length ? g.monsters[0].kind : 'skeleton';
      for (const [dx, dy] of [[1.3, 0], [-1.3, 0], [0, 1.3], [0, -1.3]]) {
        if (!g.isOpen(h.x + dx, h.y + dy)) continue;
        const m = g.spawn(k, h.x + dx, h.y + dy, 1, 0, false, g.rng);
        g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e7;
        window.__at = { x: m.x, y: m.y };
        break;
      }
    });
    await wait(500);
    await snap('1_empty');
    const press = (kind) => page.evaluate((kind) => {
      const g = window.__dbg.game(); const h = g.hero; const a = window.__at || { x: h.x + 1, y: h.y };
      return g.vetPress(kind, { ...window.__c, aimX: a.x, aimY: a.y }) ? null : 'not taken';
    }, kind);
    for (const [k, kind] of [['2_one', 'tap'], ['3_two', 'tap'], ['4_three', 'hold'], ['5_four', 'tap']]) {
      const r = await press(kind);
      if (r) log(`press ${kind}`, r);
      await wait(260);
      await snap(k);
    }
    const s = await shown();
    log('shown', JSON.stringify(s));
    if (!s.globes || s.globes.length !== 4) bad(`his combo holds ${s.globes ? s.globes.length : 'no'} globes, not four`);
    await wait(300); await snap('6_locked');
  }
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) bad(`${errs} errors on the page`);
}
