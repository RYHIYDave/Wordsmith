// THE BRAWLER'S UNIQUE WRAPS BAKED, SWAPPED IN A REAL BROWSER (render/baked.ts letGoGroup for a group kept in packs, wantOf; a group's
// packs in one file, tools/bake_heroes.mjs; art/wrap_skins.ts): a page with his groups baked (tools/bake_some.mjs
// dist/wraps_baked.html brawler,brawler-lastround, the switch WRAP_SKINS on for it), served as the game is. He starts in a dungeon
// with his own wraps, throws his combo; then puts on the Last Round, throws it again; then his own again. Each time: the group comes
// from the bake (its packs from ONE file, fetched once), the last one's is let go of whole (no pack of it held, its sheets closed),
// his moves come out of their packs as he throws them (none painted where the game is played), and what he holds is one set.
//   node tools/playtest.mjs --serve --file dist/wraps_baked.html --scenario tools/scenarios/wraps_swap_baked.mjs --out shots/wraps_swap/x
import { log } from './lib.mjs';

export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  const fetched = [];
  page.on('request', (r) => {
    const u = r.url();
    const at = u.indexOf('/heroes/');
    if (at >= 0) fetched.push(u.slice(at + 8).replace(/^[^/]+\//, ''));
  });
  const start = await page.evaluate(() => ({ mark: !!window.__dbg.painter.baked, on: window.__dbg.wrapSkins.on }));
  log('the page', JSON.stringify(start));
  if (!start.mark) bad('no bake on this page');
  if (!start.on) bad('the wraps are off on this page');
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('brawler', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.depth = 3; g.cleared = 2; g.enterDungeon(); g.monsters.length = 0; g.guide = null;
  });
  /** The group asked for come (or failed), in up to 90 s. */
  const come = async (g) => {
    const t0 = Date.now();
    while (Date.now() - t0 < 90000) {
      await page.waitForTimeout(250);
      const st = await page.evaluate(() => window.__dbg.baked());
      if (st.failed.some((f) => f.startsWith(g))) return st;
      if (await page.evaluate((g) => window.__dbg.painter.baked.done(g), g)) return st;
    }
    bad(`${g}: not come in 90 s`);
    return page.evaluate(() => window.__dbg.baked());
  };
  /** His combo thrown a few times, and what came of it: the packs in hand, how many were missed, how many painted here. */
  const fight = async (label) => {
    const p0 = await page.evaluate(() => window.__dbg.painting.frames);
    await page.evaluate(() => {
      const d = window.__dbg; const g = d.game();
      const run = g.update.bind(g);
      const f = { t: 0 };
      window.__wf = f;
      g.update = (dt, c) => {
        f.t += dt;
        Object.assign(c, { fire: Math.floor(f.t * 3) % 2 === 0, aimX: g.hero.x + 2, aimY: g.hero.y });
        return run(dt, c);
      };
    });
    await page.waitForTimeout(6000);
    await page.evaluate(() => { const g = window.__dbg.game(); delete g.update; });
    const st = await page.evaluate(() => window.__dbg.baked());
    const held = await page.evaluate(() => window.__dbg.packs.held());
    const painted = (await page.evaluate(() => window.__dbg.painting.frames)) - p0;
    const now = { held, packs: { all: st.packs.all, held: st.packs.held, unpacked: st.packs.unpacked, letGo: st.packs.letGo, missed: st.packs.missed }, sheets: st.sheets, mpx: +(st.sheetPx / 1e6).toFixed(1), painted, failed: st.failed };
    log(label, JSON.stringify(now));
    await snap(label.replace(/\W+/g, '_'));
    return now;
  };
  const putOn = (unique) => page.evaluate((unique) => {
    const d = window.__dbg; const gm = d.game(); const h = gm.hero;
    if (!h.own) h.own = h.gear.mainhand;
    if (!unique) {
      const i = h.bag.indexOf(h.own);
      return i >= 0 ? gm.equipFromBag(i) : 'his own wraps not in his bag';
    }
    if (h.bag.indexOf(null) < 0) h.bag[0] = null;
    if (!gm.giveUnique(unique, 12)) return 'not given';
    const i = h.bag.findIndex((it) => it && it.unique === unique);
    h.bag[i].reqLevel = 1;
    return gm.equipFromBag(i);
  }, unique);

  await come('brawler');
  const own = await fight('his own wraps');
  const of = (g) => fetched.filter((f) => f.startsWith(`${g}-`) || f === `${g}.json`);
  log('his files', JSON.stringify(of('brawler')));
  if (!of('brawler').includes('brawler-packs.png')) bad('his packs did not come from their one file');
  if (of('brawler').filter((f) => f === 'brawler-packs.png').length !== 1) bad('his packs\' file fetched more than once');
  if (own.held.some((n) => !n.startsWith('brawler/'))) bad('packs of another group held');
  if (!own.packs.unpacked) bad('no move of his unpacked');

  let why = await putOn('lastround');
  if (why) bad(`the Last Round: ${why}`);
  await come('brawler-lastround');
  const lr = await fight('the Last Round');
  log('the Last Round\'s files', JSON.stringify(of('brawler-lastround')));
  if (!of('brawler-lastround').includes('brawler-lastround-packs.png')) bad('the Last Round\'s packs did not come from their one file');
  if (lr.held.some((n) => !n.startsWith('brawler-lastround/'))) bad(`his own set's packs still held: ${lr.held.join(' ')}`);
  if (!lr.held.length) bad('no move of his with the Last Round unpacked');
  if (lr.sheets > own.sheets) bad(`${lr.sheets} sheets held: more than one set's (his own ${own.sheets})`);
  if (lr.painted > own.painted + 5) bad(`${lr.painted} frames of his painted here with it (with his own ${own.painted})`);

  why = await putOn(null);
  if (why) bad(`his own again: ${why}`);
  await come('brawler');
  const back = await fight('his own wraps again');
  if (back.held.some((n) => !n.startsWith('brawler/'))) bad(`the Last Round's packs still held: ${back.held.join(' ')}`);
  const end = await page.evaluate(() => window.__dbg.baked());
  log('failed', JSON.stringify(end.failed));
  if (end.failed.some((f) => /^brawler/.test(f))) bad('one of his groups failed');
}
