// THE TOWN'S PEOPLE BAKED (render/townsfolk_baked.ts, art/townsfolk3.ts), in a real browser, the page served over the web as the
// published game is, its bake beside it (dist/townsfolk/<mark>/):
//   node tools/build_to.mjs dist/tf_bake.html --townsfolk      (or the release: node tools/build.mjs, then the wrapped page)
//   node tools/playtest.mjs --serve --file dist/tf_bake.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/townsfolk_baked.mjs --out shots/townsfolk_baked/t
// A new game begun as he begins one: the town's loading screen waits for the townsfolk's pictures; they come whole from the files
// and the game paints none of them; each of the four is seen at his work, doing what he does now and then, and turned to the
// hero; their sounds come at their moments (the anvil as the hammer lands, the crystal as it blazes, the coin as it is flicked);
// the pictures are let go of as he goes down to floor 1, and come again as he comes back. Lines marked !! are problems.
//   FILE=1: the page opened as a file (no --serve): the town's people are as they were, and nothing is fetched or painted heavy.
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String((e && e.stack) || e)));
  const bad = (msg) => console.log('  !!', msg);
  const asFile = process.env.FILE === '1';
  const fetched = [];
  page.on('requestfinished', (r) => { const u = r.url(); if (u.includes('/townsfolk/')) fetched.push(u.replace(/.*\/townsfolk\/[0-9a-f]+\//, '')); });
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press('class:warrior', 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  // (the game begun, its loading screen up and gone)
  await page.waitForFunction(() => { const d = window.__dbg; return !!d.game() && (!d.loadingNow || !d.loadingNow()); }, null, { timeout: 40000 }).catch(() => bad('the town did not come within 40 s'));
  const lists = () => page.evaluate(() => {
    const d = window.__dbg;
    const folk = d.renderer.art.folk;
    let places = 0;
    let unpainted = 0;
    let bitmaps = 0;
    const seen = new Set();
    for (const who of ['armourer', 'mystic', 'wordsmith', 'stranger']) {
      const m = folk[who];
      for (const list of [m.idle, m.act, m.turned.se, m.turned.sw, m.turned.ne, m.turned.nw]) {
        if (seen.has(list)) continue;
        seen.add(list);
        for (let i = 0; i < list.length; i++) {
          places++;
          const dsc = Object.getOwnPropertyDescriptor(list, i);
          if (dsc && typeof dsc.get === 'function') unpainted++;
          else if (dsc && dsc.value && typeof dsc.value.img.getContext !== 'function') bitmaps++;
        }
      }
    }
    return { fps: folk.armourer.fps ?? 10, places, unpainted, fromFiles: bitmaps, painted: d.painting.frames, paintMs: Math.round(d.painting.ms) };
  });
  const st0 = await page.evaluate(() => window.__dbg.bakedFolk());
  const l0 = await lists();
  log('the files on this page', st0 ? JSON.stringify(st0) : 'none to be had');
  log('the four in the town (without the dark ring\'s)', JSON.stringify(l0));
  await snap('town');
  if (asFile) {
    if (st0) bad('a page opened as a file has no files to take in');
    if (l0.fps !== 10) bad(`the town's people are not as they were (their loop at ${l0.fps} a second)`);
    if (fetched.length) bad(`fetched ${fetched.join(', ')}`);
    await page.waitForTimeout(6000);
    const l1 = await lists();
    log('after six seconds', JSON.stringify(l1));
    if (errs.length) bad(`errors: ${errs.slice(0, 3).join(' | ')}`);
    return;
  }
  if (!st0) { bad('no townsfolk bake on this page (build with it, and serve the page)'); return; }
  if (!st0.done || st0.failed.length) bad(`the pictures did not come whole as the loading screen lifted: ${JSON.stringify(st0)}`);
  if (!st0.shown || l0.fps !== 30) bad('the sculpted four are not the town\'s people here');
  if (l0.unpainted) bad(`${l0.unpainted} of their ${l0.places} places still unpainted as the town is first seen`);
  if (l0.fromFiles !== l0.places) bad(`${l0.places - l0.fromFiles} of their ${l0.places} places were painted here, not taken from the files`);
  log('fetched', fetched.join(', '));

  // (each at his work, then come right up to: he turns; the ring lit, so that the wordsmith works and is not cold)
  await page.evaluate(() => { const d = window.__dbg; d.god = true; if (d.quest3) d.quest3({ dark: false }); });
  const stand = (x, y) => page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [x, y]);
  const at = { armourer: [[20.5, 9.7], [19.6, 9.3]], mystic: [[19.6, 15.4], [19.5, 14.6]], wordsmith: [[11.7, 15.7], [10.6, 15.3]], stranger: [[8.7, 8.3], [7.7, 8.0]] };
  const stations = await page.evaluate(() => window.__dbg.game().level.props.filter((p) => ['armourer', 'mystic', 'wordsmith', 'stranger'].includes(p.kind)).map((p) => ({ kind: p.kind, x: p.x, y: p.y })));
  log('where they stand', JSON.stringify(stations));
  const paintedBefore = (await lists()).painted;
  for (const who of Object.keys(at)) {
    const p = stations.find((s) => s.kind === who);
    const [far, near] = p ? [[p.x + 0.9, p.y + 1.3], [p.x + 0.3, p.y + 0.7]] : at[who];
    await stand(far[0], far[1]);
    await page.waitForTimeout(700);
    await snap(`${who}_work`);
    await stand(near[0], near[1]);
    await page.waitForTimeout(700);
    await snap(`${who}_turned`);
  }
  // (what each does now and then, and its sound at its moment: watched for 20 s from the middle of the town, by the game's own clock)
  await stand(15, 12);
  const heard = await page.evaluate(async () => {
    const d = window.__dbg;
    const out = [];
    const r = d.renderer;
    const art = r.art;
    const t0 = performance.now();
    const acts = {};
    await new Promise((done) => {
      const tick = () => {
        // (the sounds begun in the frame last drawn: read once a frame, a frame read twice told by the town's clock)
        for (const s of r.townSounds) if (!out.some((o) => o.name === s.name && o.t === +d.clock().toFixed(3))) out.push({ name: s.name, t: +d.clock().toFixed(3) });
        if (performance.now() - t0 > 20000) done();
        else requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    for (const who of ['armourer', 'mystic', 'stranger']) acts[who] = art.folk[who].soundAt ?? 0;
    return { out, acts };
  });
  log('their sounds in 20 s (the town\'s clock)', JSON.stringify(heard.out));
  log('each one\'s sound, seconds into his act', JSON.stringify(heard.acts));
  if (Math.abs(heard.acts.armourer - 26 / 30) > 1e-6 || Math.abs(heard.acts.mystic - 34 / 30) > 1e-6 || Math.abs(heard.acts.stranger - 16 / 30) > 1e-6) bad('the sounds are not at their moments (the blow lands at 26/30 s, the blaze 34/30, the flick 16/30)');
  for (const name of ['anvil', 'crystal', 'coin']) if (!heard.out.some((h) => h.name === name)) bad(`no ${name} heard in 20 s`);
  await snap('acts');
  const l1 = await lists();
  const st1 = await page.evaluate(() => window.__dbg.bakedFolk());
  log('after the town is walked', JSON.stringify(l1));
  if (l1.painted !== paintedBefore) log('  frames painted in the town meanwhile (not theirs, if all theirs came from the files)', l1.painted - paintedBefore);
  if (l1.unpainted || l1.fromFiles !== l1.places) bad('some of their frames were painted in the town');
  if (st1.held !== st0.held) bad(`pictures in hand changed in the town: ${st0.held} then ${st1.held}`);

  // (down to floor 1: let go; back to the town: come again)
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon('gate'); });
  await page.waitForFunction(() => { const d = window.__dbg; return !d.game().level.town && (!d.loadingNow || !d.loadingNow()); }, null, { timeout: 40000 }).catch(() => bad('floor 1 did not come'));
  await page.waitForTimeout(1500);
  const st2 = await page.evaluate(() => window.__dbg.bakedFolk());
  const l2 = await lists();
  log('on floor 1', `${JSON.stringify(st2)} ${JSON.stringify(l2)}`);
  if (st2.held !== 0 || st2.letGo !== 1) bad('the pictures were not let go of as the town was left');
  if (l2.unpainted !== l2.places) bad(`${l2.places - l2.unpainted} places still hold a picture after they were let go`);
  await snap('floor1');
  await page.evaluate(() => window.__dbg.game().enterTown());
  await page.waitForFunction(() => { const d = window.__dbg; return d.game().level.town && (!d.loadingNow || !d.loadingNow()); }, null, { timeout: 40000 }).catch(() => bad('the town did not come again'));
  await page.waitForTimeout(800);
  const st3 = await page.evaluate(() => window.__dbg.bakedFolk());
  const l3 = await lists();
  log('back in the town', `${JSON.stringify(st3)} ${JSON.stringify(l3)}`);
  if (!st3.done || st3.loads !== 2 || st3.failed.length) bad('the pictures did not come again');
  if (l3.unpainted || l3.fromFiles !== l3.places) bad('back in the town, some of their places are unpainted or were painted here');
  await snap('town_again');
  if (errs.length) bad(`errors: ${errs.slice(0, 3).join(' | ')}`);
}
