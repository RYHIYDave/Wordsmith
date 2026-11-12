// FRAMES KEPT IN THEIR SHEETS (engine/px.ts sheetSprite; render/baked.ts, render/townsfolk_baked.ts), in a real browser, the
// page served over the web as the published game is, its bakes beside it:
//   node tools/build.mjs; then the page as published (its folders beside it)
//   CLS=ranger node tools/playtest.mjs --serve --file <page> --touch --size 844x390 --dpr 3 --scenario tools/scenarios/sheet_frames.mjs --out shots/sheet_frames/x
// HIS PHONE, measured 12 Nov 2026 (docs/requests/phone_check.md): a picture made by the browser for every baked frame as it was
// taken in was 7.1 ms a frame on the game's own thread, 68.5 s of a 74-second load. So none is made now: the sheets are held,
// and a frame's picture is cut from its sheet when it is first asked for.
// A run begun with the hero (CLS, default the Warrior), in town. It asks:
//   1. as his group comes, the browser is asked for a picture only for each sheet (createImageBitmap counted from before the
//      game's script: none with a place on a sheet), and no frame is cut as they come;
//   2. EVERY PIXEL THE SAME: of his frames in hand, one in every EVERY (default 23, and never fewer than 300 where he has as
//      many), the picture the frame gives now against the picture made as it was made before (the browser's own, cut from the
//      sheet at the frame's place);
//   3. the cut pictures in hand are kept to the budget as all of his frames are asked for in turn, and those let go of are
//      given back;
//   4. the town's people: the same three, of theirs.
// Lines marked !! are problems.
import { log } from './lib.mjs';

export const init = () => {
  // (before the game's script: every picture the browser is asked for, and whether it was to be cut from another at a place)
  const made = (window.__made = { all: 0, cut: 0 });
  const own = window.createImageBitmap.bind(window);
  window.__ownBitmap = own;
  window.createImageBitmap = function (...a) {
    made.all++;
    if (a.length >= 5) made.cut++;
    return own(...a);
  };
};

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const every = Number(process.env.EVERY || 23);
  let bad = 0;
  const check = (what, ok, detail = '') => {
    if (!ok) bad++;
    console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`);
  };
  const errs = [];
  page.on('pageerror', (e) => errs.push(String((e && e.stack) || e)));
  await page.addInitScript(init);
  await page.reload();
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  const start = await page.evaluate(() => ({ bake: !!window.__dbg.painter.baked, cuts: window.__dbg.sheetCuts() }));
  check('the page has the heroes\' bake', start.bake);
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 9); d.autoLevel = false; d.autoWords = false; d.god = true; }, cls);
  const t0 = Date.now();
  let st = null;
  while (Date.now() - t0 < 60000) {
    await page.waitForTimeout(200);
    st = await page.evaluate(() => window.__dbg.baked());
    if (!st || st.failed.length || st.ms[cls] !== undefined) break;
  }
  check(`${cls}: his group came whole`, !!st && st.failed.length === 0 && st.ms[cls] !== undefined, JSON.stringify(st));
  // (the townsfolk's come a moment after the town is shown)
  await page.waitForFunction(() => { const t = window.__dbg.bakedFolk && window.__dbg.bakedFolk(); return !t || t.settled; }, null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(500);
  const came = await page.evaluate(() => ({ made: { ...window.__made }, cuts: window.__dbg.sheetCuts(), baked: window.__dbg.baked(), folk: window.__dbg.bakedFolk ? window.__dbg.bakedFolk() : null }));
  log('as they came', JSON.stringify(came));
  check('1. the browser made a picture only for each sheet: none cut from a sheet for a frame', came.made.cut === 0 && came.made.all > 0 && came.made.all <= came.baked.sheets + 8, `${came.made.all} pictures asked of the browser, ${came.made.cut} of them a place on a sheet; ${came.baked.sheets} of the heroes' sheets held`);

  // 2 and 3, for the hero and then for the town's people
  const same = async (who) => page.evaluate(async ({ who, cls, every }) => {
    const d = window.__dbg;
    const list = [];
    const seen = new Set();
    const walk = (o, depth) => {
      if (!o || typeof o !== 'object' || seen.has(o) || depth > 8) return;
      seen.add(o);
      if (Array.isArray(o)) {
        for (let i = 0; i < o.length; i++) {
          const dsc = Object.getOwnPropertyDescriptor(o, i);
          if (!dsc || typeof dsc.get === 'function') continue;
          const v = dsc.value;
          if (v && typeof v === 'object' && typeof v.w === 'number' && typeof v.ax === 'number') { if (d.sheetWhere(v) && !seen.has(v)) { seen.add(v); list.push(v); } } else walk(v, depth + 1);
        }
        return;
      }
      if (typeof o.w === 'number' && typeof o.ax === 'number' && 'img' in o) return;
      for (const k of Object.keys(o)) { const dsc = Object.getOwnPropertyDescriptor(o, k); if (dsc && !dsc.get) walk(dsc.value, depth + 1); }
    };
    if (who === 'hero') {
      const heroes = d.renderer.art.heroes;
      const places = cls === 'warlock' ? [{ town: true }, {}, { demon: true }, { blaze: true }] : [{ town: true }, {}];
      for (const p of places) walk(heroes.of(cls, { twoHanded: true, town: !!p.town, ...p, vet: cls === 'brawler' }), 0);
    } else {
      for (const l of d.folkLists ? d.folkLists() : []) walk(l.list, 0);
    }
    const n = list.length;
    const step = Math.max(1, Math.min(every, Math.floor(n / 300) || 1));
    const scratch = document.createElement('canvas');
    const sg = scratch.getContext('2d', { willReadFrequently: true });
    const pixels = (img, w, h) => {
      scratch.width = w;
      scratch.height = h;
      sg.clearRect(0, 0, w, h);
      sg.drawImage(img, 0, 0);
      return sg.getImageData(0, 0, w, h).data;
    };
    let tried = 0;
    let unlike = 0;
    let wrongSize = 0;
    let first = '';
    const before = d.sheetCuts();
    for (let i = 0; i < n; i += step) {
      const s = list[i];
      const at = d.sheetWhere(s);
      if (!at || !at.sheet.img) continue;
      const now = s.img;
      if (now.width !== at.w || now.height !== at.h) { wrongSize++; continue; }
      const a = pixels(now, at.w, at.h).slice();
      const old = await window.__ownBitmap(at.sheet.img, at.x, at.y, at.w, at.h, { premultiplyAlpha: 'default', colorSpaceConversion: 'none' });
      const b = pixels(old, at.w, at.h);
      old.close();
      let diff = 0;
      for (let k = 0; k < a.length; k++) if (a[k] !== b[k]) diff++;
      tried++;
      if (diff) { unlike++; if (!first) first = `frame ${i}: ${diff} bytes of ${a.length}`; }
    }
    // 3. every one of them asked for in turn: what is in hand stays within the budget
    let most = 0;
    for (let i = 0; i < n; i++) { void list[i].img; const c = d.sheetCuts(); if (c.px > most) most = c.px; }
    const after = d.sheetCuts();
    return { frames: n, step, tried, unlike, wrongSize, first, before, after, most };
  }, { who, cls, every });

  const hero = await same('hero');
  log(`${cls}`, JSON.stringify(hero));
  check(`2. ${cls}: every pixel the same as the picture made the old way, ${hero.tried} of his ${hero.frames} frames`, hero.frames > 100 && hero.tried >= Math.min(300, hero.frames) && hero.unlike === 0 && hero.wrongSize === 0, hero.first || `${hero.unlike} unlike, ${hero.wrongSize} of another size`);
  const budget = 6_000_000;
  check(`3. ${cls}: all ${hero.frames} asked for in turn, the cut pictures in hand never over the budget`, hero.most <= budget + 2048 * 2048 && hero.after.px <= budget, `the most ${(hero.most * 4 / 1e6).toFixed(1)} MB, at the end ${(hero.after.px * 4 / 1e6).toFixed(1)} MB in ${hero.after.inHand}; cut ${hero.after.made - hero.before.made}, let go ${hero.after.letGo - hero.before.letGo}`);
  const folk = await same('folk');
  log('the town\'s people', JSON.stringify(folk));
  if (folk.frames) {
    check(`4. the town's people: every pixel the same, ${folk.tried} of their ${folk.frames} frames`, folk.tried >= Math.min(300, folk.frames) && folk.unlike === 0 && folk.wrongSize === 0, folk.first || `${folk.unlike} unlike`);
    check('4. the town\'s people: in hand never over the budget', folk.after.px <= budget, `${(folk.after.px * 4 / 1e6).toFixed(1)} MB`);
  } else log('the town\'s people', 'none in their sheets on this page (no bake of theirs, or no hook): not asked');
  // (those let go of are given back a moment on, as the world is drawn: only the ones let go of since can still be waiting.
  // The town goes on being drawn meanwhile, and its frames, pushed out by the asking above, are cut again as they are shown.)
  const letGoThen = (folk.frames ? folk : hero).after.letGo;
  await page.waitForTimeout(4500);
  const end = await page.evaluate(() => ({ cuts: window.__dbg.sheetCuts(), made: { ...window.__made } }));
  check('3. the pictures let go of are given back a moment on', end.cuts.waiting <= end.cuts.letGo - letGoThen, `${end.cuts.waiting} waiting, ${end.cuts.letGo - letGoThen} let go of since; ${JSON.stringify(end.cuts)}`);
  check('the browser was never asked to cut a picture from a sheet by the game', end.made.cut === 0, JSON.stringify(end.made));
  check('no error on the page', errs.length === 0, errs.join(' | ').slice(0, 300));
  if (typeof snap === 'function') await snap('sheet_frames');
  if (bad) console.log(`!! ${bad} thing(s) wrong`);
}
