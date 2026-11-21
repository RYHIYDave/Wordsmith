// THE MAGE'S STAVES BAKED, SWAPPED IN A REAL BROWSER (render/baked.ts letGoGroup, holdOnly; art/staff_skins.ts): a page with her
// groups baked (tools/bake_some.mjs dist/staff_baked.html mage,mage-crook,mage-rod), served as the game is. She starts in town
// with her own staff; then, the inventory open as a player's would be, she puts on the Shepherd's Crook, the Kindling Rod, and
// her own staff again. Each time: the staff's group comes from the bake, the last one's is let go of (the sheets held are one
// group's, never two), and no more of her pictures with the staff she holds are left to be painted than with her own staff.
// (A page with only her groups baked: the cards' group is not there, and its file's 404 is counted as an error.)
//   node tools/playtest.mjs --serve --file dist/staff_baked.html --scenario tools/scenarios/staff_swap_baked.mjs --out shots/staff_swap/x
import { log } from './lib.mjs';

export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  const start = await page.evaluate(() => ({ mark: !!window.__dbg.painter.baked, on: window.__dbg.staffSkins.on }));
  log('the page', JSON.stringify(start));
  if (!start.mark) bad('no bake on this page');
  if (!start.on) bad('the staves are off on this page');
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('mage', 9); d.autoLevel = false; d.autoWords = false; d.god = true; });
  /** The group asked for come (or failed), in up to 60 s. */
  const come = async (g, since) => {
    const t0 = Date.now();
    while (Date.now() - t0 < 60000) {
      await page.waitForTimeout(250);
      const st = await page.evaluate(() => window.__dbg.baked());
      if (st.failed.some((f) => f.startsWith(g))) return st;
      if (st.given > since && (await page.evaluate((g) => window.__dbg.painter.baked.done(g), g))) return st;
    }
    bad(`${g}: not come in 60 s`);
    return page.evaluate(() => window.__dbg.baked());
  };
  /** Her frames with what she holds: how many in hand, how many still to be painted. */
  const frames = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const heroes = d.renderer.art.heroes;
    const u = h.gear.mainhand && h.gear.mainhand.unique;
    const staff = { shepherdscrook: 'crook', kindlingrod: 'rod' }[u];
    let left = 0; let shown = 0;
    const seen = new Set();
    const walk = (o) => {
      if (!o || typeof o !== 'object' || seen.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) {
        for (let i = 0; i < o.length; i++) {
          const dsc = Object.getOwnPropertyDescriptor(o, i);
          if (dsc && typeof dsc.get === 'function') left++;
          else if (dsc && dsc.value && dsc.value.img) shown++;
          else walk(dsc && dsc.value);
        }
        return;
      }
      if (o.img && typeof o.w === 'number') return;
      // (her making ready, `ready`, is her class card's only (art/heroes3.ts readyList): never shown in town, never baked with a
      // place there; her own staff's town set shares it with her card's, given by the cards' group, a staff's does not. Not
      // counted: on the 25.3.20 page it made a staff's town look 31 frames short of her own's, 79 to 48, the main chat found)
      for (const [k, v] of Object.entries(o)) if (k !== 'ready') walk(v);
    };
    walk(heroes.of('mage', { twoHanded: true, town: true, ...(staff ? { staff } : {}) }));
    return { holds: u || 'her own', left, shown };
  });
  const held = (st) => ({ sheets: st.sheets, mpx: +(st.sheetPx / 1e6).toFixed(1), groups: Object.keys(st.ms).join(',') });
  let st = await come('mage', -1);
  const own = { ...held(st), ...(await frames()) };
  log('her own staff, come', JSON.stringify(own));
  await snap('own');
  /** A staff put on as a player does, the inventory open; closed once it has come. */
  const putOn = async (unique, g) => {
    const before = st.given;
    const why = await page.evaluate((unique) => {
      const d = window.__dbg; const gm = d.game(); const h = gm.hero;
      if (!h.own) h.own = h.gear.mainhand;
      d.panels.open = 'inv';
      if (!unique) {
        const i = h.bag.indexOf(h.own);
        return i >= 0 ? gm.equipFromBag(i) : 'her own staff not in her bag';
      }
      if (h.bag.indexOf(null) < 0) h.bag[0] = null;
      if (!gm.giveUnique(unique, 12)) return 'not given';
      const i = h.bag.findIndex((it) => it && it.unique === unique);
      h.bag[i].reqLevel = 1;
      return gm.equipFromBag(i);
    }, unique);
    if (why) bad(`${unique || 'her own'}: ${why}`);
    st = await come(g, before);
    await page.evaluate(() => { window.__dbg.panels.open = 'none'; });
    await page.waitForTimeout(800);
    const now = { ...held(st), ...(await frames()) };
    log(`${unique || 'her own staff'}, come`, JSON.stringify(now));
    // (her own staff's count is the measure: some of her town's lists are painted only as they are shown)
    if (now.left > own.left) bad(`${now.left} of her frames with it still to be painted (with her own staff ${own.left})`);
    if (now.sheets > own.sheets + 1) bad(`${now.sheets} sheets held: more than one staff's`);
    await snap(unique || 'own_again');
    return now;
  };
  await putOn('shepherdscrook', 'mage-crook');
  await putOn('kindlingrod', 'mage-rod');
  await putOn(null, 'mage');
  const end = await page.evaluate(() => window.__dbg.baked());
  log('failed', JSON.stringify(end.failed));
  if (end.failed.some((f) => /^mage/.test(f))) bad('one of her groups failed');
}
