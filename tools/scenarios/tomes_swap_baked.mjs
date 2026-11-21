// THE WARLOCK'S UNIQUE TOMES BAKED, SWAPPED IN A REAL BROWSER (render/baked.ts: his demon a group of its own while TOME_SKINS is on,
// `warlock-demon`; a group kept in packs let go of whole; a group's packs in one file; art/tome_skins.ts): a page with his groups
// baked (tools/bake_some.mjs dist/wraps_baked.html ...,warlock,warlock-demon,warlock-hornbook, the switch on for it), served as the
// game is. He starts in a dungeon with his own book, casts, changes into his demon and back; puts on the Hornbook, casts, changes and
// back; then his own book again. Each time: the man's group comes from the bake (its packs from one file), the last one's is let go
// of whole, his demon's group is kept throughout (never fetched twice), and none of his pictures is painted where the game is played.
//   node tools/playtest.mjs --serve --file dist/wraps_baked.html --scenario tools/scenarios/tomes_swap_baked.mjs --out shots/tomes_swap/x
import { log } from './lib.mjs';

export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  const fetched = [];
  page.on('request', (r) => {
    const u = r.url();
    const at = u.indexOf('/heroes/');
    if (at >= 0) fetched.push(u.slice(at + 8).replace(/^[^/]+\//, ''));
  });
  const start = await page.evaluate(() => ({ mark: !!window.__dbg.painter.baked, on: window.__dbg.tomeSkins.on }));
  log('the page', JSON.stringify(start));
  if (!start.mark) bad('no bake on this page');
  if (!start.on) bad('the tomes are off on this page');
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warlock', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.depth = 3; g.cleared = 2; g.enterDungeon(); g.monsters.length = 0; g.guide = null;
  });
  const come = async (g) => {
    const t0 = Date.now();
    while (Date.now() - t0 < 120000) {
      await page.waitForTimeout(250);
      const st = await page.evaluate(() => window.__dbg.baked());
      if (st.failed.some((f) => f.startsWith(g))) return st;
      if (await page.evaluate((g) => window.__dbg.painter.baked.done(g), g)) return st;
    }
    bad(`${g}: not come in 120 s`);
    return page.evaluate(() => window.__dbg.baked());
  };
  /** He casts, changes into his demon, slashes as it, and changes back: what came of it. */
  const play = async (label) => {
    const p0 = await page.evaluate(() => window.__dbg.painting.frames);
    await page.evaluate(() => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const run = g.update.bind(g);
      const f = { t: 0 };
      window.__wf = f;
      g.update = (dt, c) => {
        f.t += dt;
        const t = f.t;
        // (his pact full to change; as the demon, run dry at 8 s: it burns out, and he is a man again by the end)
        if (t < 2.7) h.pact = 1e9;
        else if (t > 8 && t < 8.1) h.pact = 0;
        Object.assign(c, { fire: t < 2.5 || (t > 5.5 && t < 7.8) ? Math.floor(t * 3) % 2 === 0 : false, aimX: h.x + 2, aimY: h.y, change: t > 2.6 && t < 2.7 });
        return run(dt, c);
      };
    });
    await page.waitForTimeout(13000);
    await page.evaluate(() => { const g = window.__dbg.game(); delete g.update; });
    const st = await page.evaluate(() => window.__dbg.baked());
    const held = await page.evaluate(() => window.__dbg.packs.held());
    const painted = (await page.evaluate(() => window.__dbg.painting.frames)) - p0;
    const form = await page.evaluate(() => window.__dbg.game().hero.form);
    const now = { form, held, packs: { all: st.packs.all, held: st.packs.held, unpacked: st.packs.unpacked, letGo: st.packs.letGo, missed: st.packs.missed }, sheets: st.sheets, mpx: +(st.sheetPx / 1e6).toFixed(1), painted, failed: st.failed };
    log(label, JSON.stringify(now));
    await snap(label.replace(/\W+/g, '_'));
    return now;
  };
  const putOn = (unique) => page.evaluate((unique) => {
    const d = window.__dbg; const gm = d.game(); const h = gm.hero;
    if (h.form === 'demon') return 'still the demon';
    if (!h.own) h.own = h.gear.mainhand;
    if (!unique) {
      const i = h.bag.indexOf(h.own);
      return i >= 0 ? gm.equipFromBag(i) : 'his own book not in his bag';
    }
    if (h.bag.indexOf(null) < 0) h.bag[0] = null;
    if (!gm.giveUnique(unique, 12)) return 'not given';
    const i = h.bag.findIndex((it) => it && it.unique === unique);
    h.bag[i].reqLevel = 1;
    return gm.equipFromBag(i);
  }, unique);
  const of = (g) => fetched.filter((f) => f.startsWith(`${g}-`) || f === `${g}.json`);

  await come('warlock');
  await come('warlock-demon');
  const own = await play('his own book');
  log('his files', JSON.stringify(of('warlock')));
  if (!fetched.includes('warlock-packs.png')) bad('the man\'s packs did not come from their one file');
  if (!fetched.includes('warlock-demon-packs.png')) bad('the demon\'s packs did not come from their one file');
  if (own.form !== 'man') bad(`left as ${own.form}`);

  let why = await putOn('hornbook');
  if (why) bad(`the Hornbook: ${why}`);
  await come('warlock-hornbook');
  const hb = await play('the Hornbook');
  if (hb.held.some((n) => n.startsWith('warlock/'))) bad(`his own book's packs still held: ${hb.held.join(' ')}`);
  if (!fetched.includes('warlock-hornbook-packs.png')) bad('the Hornbook\'s packs did not come from their one file');
  if (fetched.filter((f) => f === 'warlock-demon.json').length !== 1) bad('his demon\'s group fetched again');
  if (hb.painted > own.painted + 5) bad(`${hb.painted} frames of his painted here with it (with his own ${own.painted})`);

  why = await putOn(null);
  if (why) bad(`his own again: ${why}`);
  await come('warlock');
  const back = await play('his own book again');
  if (back.held.some((n) => n.startsWith('warlock-hornbook/'))) bad(`the Hornbook's packs still held: ${back.held.join(' ')}`);
  if (fetched.filter((f) => f === 'warlock-demon.json').length !== 1) bad('his demon\'s group fetched again');
  const end = await page.evaluate(() => window.__dbg.baked());
  log('failed', JSON.stringify(end.failed));
  if (end.failed.some((f) => /^warlock/.test(f))) bad('one of his groups failed');
}
