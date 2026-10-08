// The town as it stands (Version 14.4: each of its people has a place, the gate is in the back
// wall): photographs of the whole hall and of each place, for looking at. Nothing is pressed.
// Checked on the way: every picture of the town's own is there at the heroes' grain, and standing
// at each place offers that place's service.
//   node tools/playtest.mjs --size 1280x720 --scenario tools/scenarios/townlook.mjs --out shots/town/look
//   (1280x720 shows the game at two screen pixels to one: the whole hall is in the picture)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 31); }, cls);
  await page.waitForTimeout(600);
  const view = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  log('view (game pixels)', `${view.w}x${view.h}`);
  const stand = (x, y) => page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [x, y]);
  let bad = 0;
  const flag = (what) => { bad++; console.log(`  !! ${what}`); };
  // the whole hall, from the middle of it; then from where a new arrival stands
  await stand(13.5, 13.5);
  await page.waitForTimeout(300);
  await snap('00_hall');
  const start = await page.evaluate(() => window.__dbg.game().level.floor.start);
  await stand(start.x, start.y);
  await page.waitForTimeout(300);
  await snap('01_arrival');
  const first = await page.evaluate(() => window.__dbg.game().stationNear());
  if (first !== null) flag(`a new arrival should have nothing in reach: the ${first} is`);
  // every picture of the town's own is there, painted at the heroes' grain
  const art = await page.evaluate(() => {
    const a = window.__dbg.renderer.art;
    const out = {};
    const one = (name, s) => { out[name] = s ? `${s.w}x${s.h}@${s.density || 1}` : 'MISSING'; };
    for (const k of ['anvil', 'rack', 'trough', 'tentBack', 'tentTable', 'rug', 'stash']) one(k, a.town[k]);
    for (const k of ['forge', 'runeSlab', 'runeRing', 'lexicon']) a.town[k].forEach((s, i) => one(`${k}${i}`, s));
    a.town.runeStone.forEach((s, i) => { one(`stone${i}`, s.dim); one(`stone${i}lit`, s.alight); });
    a.ground.gate.forEach((parts, f) => parts.forEach((s, i) => one(`gate${f}.${i}`, s)));
    for (const who of ['armourer', 'mystic', 'wordsmith', 'stranger']) { one(who, a.folk[who].idle[0]); one(who + ' acting', a.folk[who].act[Math.floor(a.folk[who].act.length / 2)]); }
    return out;
  });
  log('pictures of the town', `${Object.keys(art).length}`);
  for (const [k, v] of Object.entries(art)) if (!String(v).endsWith('@2')) flag(`${k} is not painted at the heroes' grain: ${v}`);

  // each place, with the hero before it; three pictures a third of a second apart, to catch what
  // moves. Where a place has a service, standing there offers it (the stranger has none yet).
  const places = [['gate', 14.7, 7.2, 'gate'], ['smithy', 18.5, 8.6, 'armourer'], ['bazaar', 19.5, 14.8, 'mystic'], ['ring', 10.5, 15.5, 'wordsmith'], ['stranger', 8.6, 9.6, null], ['lexicon', 13.5, 13.6, 'lexicon'], ['stash', 13.6, 18.5, 'stash']];
  for (const [name, x, y, service] of places) {
    await stand(x, y);
    await page.waitForTimeout(350);
    for (let k = 0; k < 3; k++) {
      await snap(`${name}_${k}`);
      await page.waitForTimeout(330);
    }
    const s = await page.evaluate(() => ({ near: window.__dbg.game().stationNear(), hint: window.__dbg.game().interactHint() }));
    log(`at the ${name}`, `${s.near} / ${s.hint}`);
    if (s.near !== service) flag(`standing at the ${name} should offer ${service ?? 'nothing'}: it offers ${s.near ?? 'nothing'}`);
  }
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) flag('text asked for characters the fonts cannot draw: ' + missing.join(' '));
  log('RESULT', bad ? `${bad} FAILED` : 'all passed');
}
