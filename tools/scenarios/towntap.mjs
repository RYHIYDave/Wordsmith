// Touch (or click) the things in town that can be used, the way a player would, and check that the
// hero walks over and the right panel opens. Then the same for the portal home from a dungeon.
//   node tools/playtest.mjs --scenario tools/scenarios/towntap.mjs --out shots/tt
//   node tools/playtest.mjs --size 844x390 --dpr 3 --touch --scenario tools/scenarios/towntap.mjs --out shots/ttp
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => { window.__dbg.run('warrior', 31); });
  await page.waitForTimeout(400);
  const hands = await makeHands(page);
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    return { town: g.level.town, panel: d.panels.open, vendor: g.vendor, errand: d.errand(), x: +h.x.toFixed(2), y: +h.y.toFixed(2), depth: g.depth };
  });
  const view = () => page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  /** Where a station (or one of the town's props) is on screen. */
  const where = (kind, prop) => page.evaluate(([k, p]) => {
    const d = window.__dbg; const g = d.game();
    const s = p ? g.level.props.find((q) => q.kind === p) : g.level.stations.find((q) => q.kind === k);
    return s ? d.at(s.x, s.y) : null;
  }, [kind, prop ?? null]);
  const waitFor = async (test, ms = 7000) => {
    const t0 = Date.now();
    while (Date.now() - t0 < ms) {
      const s = await st();
      if (test(s)) return { s, ms: Date.now() - t0 };
      await page.waitForTimeout(100);
    }
    return { s: await st(), ms: -1 };
  };
  /** The trades are open (the wordsmith has a screen of his own, and the stranger his gamble) if the stranger has a station. */
  const trades = await page.evaluate(() => window.__dbg.game().level.stations.some((q) => q.kind === 'stranger'));
  /** The panel a station opens (until the trades are open the wordsmith simply opens the inventory; the two vendors have the one screen). */
  const panelOf = (kind) => (kind === 'wordsmith' ? (trades ? 'wordsmith' : 'inv') : kind === 'armourer' || kind === 'mystic' ? 'vendor' : kind);
  /** That panel is open, and at a vendor's it is that vendor's shelf. */
  const isOpen = (s, kind) => s.panel === panelOf(kind) && (panelOf(kind) !== 'vendor' || s.vendor === kind);
  const close = async () => {
    const s = await st();
    if (s.panel === 'none') return;
    // (the town's panels close with x; the wordsmith opens the inventory, which closes with DONE)
    const shut = (await hands.mark('button:x')) ? 'button:x' : (await hands.mark('button:DONE')) ? 'button:DONE' : null;
    if (!shut || !(await hands.press(shut))) await hands.key('Escape');
    await page.waitForTimeout(150);
    // (the wordsmith opens the inventory with the hall in the other half: when it closes the hall
    // glides back into the middle, and what is touched next is measured once it stands)
    await hands.settle();
  };
  const home = () => page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 15.5; g.hero.y = 16.5; });

  const v = await view();
  log('view (game pixels), touch', `${v.w}x${v.h}, ${hands.touch}`);
  await snap('hall');

  // ---- each service, touched on its body, from where a new arrival stands ----
  let fails = 0;
  // (Version 14.4: the two vendors, each in a place of their own; the mystic's service is used
  // from his table of wares; the gate is an arch in the back wall, used from the floor before it)
  for (const kind of ['armourer', 'wordsmith', 'lexicon', 'stash', 'gate', 'mystic', ...(trades ? ['stranger'] : [])]) {
    await home();
    // (the stranger's corner is the far one: it is not on the screen from where a new arrival stands, so he is touched from a few steps off)
    if (kind === 'stranger') await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 9.5; g.hero.y = 10.5; });
    await page.waitForTimeout(250);
    const p = await where(kind);
    const side = p.x < v.w * 0.4 ? 'stick side' : 'aim side';
    await hands.pressAt(p.x, p.y - 14);
    const first = await st();
    if (kind === 'wordsmith') { await page.waitForTimeout(500); await snap('walking'); }
    const r = await waitFor((s) => isOpen(s, kind));
    if (r.ms < 0) { fails++; console.log(`  !! touching the ${kind} did not open its panel`); }
    log(`touch the ${kind} (${side}, at ${Math.round(p.x)},${Math.round(p.y - 14)})`, `errand=${first.errand} -> panel=${r.s.panel}${r.s.panel === 'vendor' ? ' (' + r.s.vendor + ')' : ''} after ${r.ms} ms`);
    if (kind === 'armourer') await snap('vendor_open');
    if (kind === 'mystic') await snap('mystic_open');
    if (kind === 'wordsmith' && trades) await snap('wordsmith_open');
    if (kind === 'stranger') await snap('stranger_open');
    await close();
  }

  // ---- the name over a service, and the furniture beside a townsperson ----
  await home();
  await page.waitForTimeout(250);
  let p = await where('lexicon');
  await hands.pressAt(p.x, p.y - 40);
  let r = await waitFor((s) => s.panel === 'lexicon');
  if (r.ms < 0) fails++;
  log('touch the name over the Lexicon', `panel=${r.s.panel} after ${r.ms} ms`);
  await close();
  // (the things of a person's place count as that person: the anvil and the forge are the
  // armourer's, the tent and the trader in it the mystic's, the slab of runes the wordsmith's)
  // (each is touched from a few steps off, so that it is in the middle of the screen and not under the game's own buttons)
  for (const [prop, kind, up, fromX, fromY] of [['anvil', 'armourer', 10, 17.5, 11.5], ['forge', 'armourer', 24, 17.5, 11.5], ['tentBack', 'mystic', 44, 17.5, 15.5], ['mystic', 'mystic', 30, 17.5, 15.5], ['runeSlab', 'wordsmith', 12, 12.5, 17.5]]) {
    await page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [fromX, fromY]);
    await page.waitForTimeout(250);
    p = await where(null, prop);
    await hands.pressAt(p.x, p.y - up);
    r = await waitFor((s) => isOpen(s, kind));
    if (r.ms < 0) { fails++; console.log(`  !! touching the ${prop} did not open the ${kind}'s panel`); }
    log(`touch the ${prop}`, `panel=${r.s.panel}${r.s.panel === 'vendor' ? ' (' + r.s.vendor + ')' : ''} after ${r.ms} ms`);
    await close();
  }
  // the gate itself: the arch in the wall, well above the floor it is used from
  await home();
  await page.waitForTimeout(250);
  p = await where('gate');
  await hands.pressAt(p.x, p.y - 40);
  r = await waitFor((s) => s.panel === 'gate');
  if (r.ms < 0) { fails++; console.log('  !! touching the arch of the gate did not open the gate'); }
  log('touch the arch of the gate', `panel=${r.s.panel} after ${r.ms} ms`);
  await close();
  // the floor at the gate's threshold. (Version 14.5: on the screen that is where the far corner of
  // the tent's roof comes to, four tiles nearer. While the tent was touched by a box round it, a
  // touch here sent the hero to the trader: the playtest with a mouse found it.)
  await home();
  await page.waitForTimeout(250);
  p = await where('gate');
  await hands.pressAt(p.x, p.y + 4);
  r = await waitFor((s) => s.panel === 'gate');
  if (r.ms < 0) { fails++; console.log(`  !! touching the floor at the gate's threshold did not open the gate: panel=${r.s.panel}${r.s.panel === 'vendor' ? ' (' + r.s.vendor + ')' : ''}`); }
  log("touch the floor at the gate's threshold", `panel=${r.s.panel} after ${r.ms} ms`);
  await close();
  // the name over the tent is the trader's, as every name is the thing's it names
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 17.5; g.hero.y = 15.5; });
  await page.waitForTimeout(250);
  p = await where('mystic');
  // (how far over the table his name is written: render.ts, NAME_LIFT)
  const lift = 86;
  await hands.pressAt(p.x, p.y - lift + 3);
  r = await waitFor((s) => isOpen(s, 'mystic'));
  if (r.ms < 0) { fails++; console.log(`  !! touching the name over the tent did not open the mystic's panel: panel=${r.s.panel}`); }
  log('touch the name over the tent', `panel=${r.s.panel}${r.s.panel === 'vendor' ? ' (' + r.s.vendor + ')' : ''} after ${r.ms} ms`);
  await close();

  // ---- what is touched is what is drawn there ----
  // Down the screen from the gate's arch to the tent, which stands straight under it: the gate,
  // down to its threshold; then the tent, from where its roof is painted. And the open floor
  // beside the roof is floor: the tile before the fire to the right of the gate, which on the
  // screen is six game pixels above the roof's far edge (and was inside the box round the tent).
  // (To the left of the roof's corner the trader's NAME is written: that is his, and it is touched.)
  await home();
  await page.waitForTimeout(250);
  const drawn = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    const gate = g.level.stations.find((q) => q.kind === 'gate');
    const tent = g.level.props.find((q) => q.kind === 'tentBack');
    const a = d.at(gate.x, gate.y); const b = d.at(tent.x, tent.y);
    const col = [];
    for (let y = Math.round(a.y) - 40; y <= Math.round(b.y) - 30; y++) col.push(d.spot(a.x, y) ?? 'floor');
    const runs = [];
    for (const k of col) { const last = runs[runs.length - 1]; if (last && last[0] === k) last[1]++; else runs.push([k, 1]); }
    const threshold = [];
    for (let dy = -2; dy <= 5; dy++) threshold.push(d.spot(a.x, a.y + dy));
    const beside = d.at(16.25, 7);
    return { runs: runs.map(([k, n]) => `${k} ${n}`).join(', '), order: runs.map(([k]) => k), threshold, beside: d.spot(beside.x, beside.y), offset: [Math.round(b.x - a.x), Math.round(b.y - a.y)] };
  });
  log('down the screen from the arch to the tent', `${drawn.runs} (the tent is ${drawn.offset[0]},${drawn.offset[1]} game pixels from the gate's floor)`);
  log("the gate's threshold, 2 above it to 5 below", drawn.threshold.join(' '));
  log("the open floor beside the tent's roof", String(drawn.beside));
  if (drawn.threshold.some((k) => k !== 'gate')) { fails++; console.log("  !! a part of the gate's threshold is not the gate's to the touch"); }
  if (drawn.order[0] !== 'gate' || drawn.order[drawn.order.length - 1] !== 'mystic' || drawn.order.indexOf('mystic') < drawn.order.lastIndexOf('gate')) { fails++; console.log('  !! down the screen from the arch it should be the gate, and then the tent, and no going back'); }
  if (drawn.beside !== null) { fails++; console.log(`  !! the open floor beside the tent's roof is taken for the ${drawn.beside}`); }

  // ---- touching bare floor does nothing of the kind; steering calls an errand off ----
  await home();
  await page.waitForTimeout(250);
  p = await page.evaluate(() => window.__dbg.at(15.5, 14.5));
  await hands.pressAt(p.x, p.y);
  await page.waitForTimeout(300);
  let s = await st();
  log('touch bare floor', `errand=${s.errand} panel=${s.panel}`);
  if (s.errand || s.panel !== 'none') fails++;
  p = await where('stash');
  await hands.pressAt(p.x, p.y - 10);
  s = await st();
  const had = s.errand;
  await page.keyboard.down('KeyD');
  await page.waitForTimeout(300);
  await page.keyboard.up('KeyD');
  s = await st();
  log('errand to the stash, then steer away', `errand before=${had} after=${s.errand} panel=${s.panel}`);
  if (had !== 'stash' || s.errand) fails++;
  await page.waitForTimeout(1200);
  s = await st();
  if (s.panel !== 'none') { fails++; log('  !! a panel opened anyway', s.panel); }

  // ---- the portal home: put the hero in a dungeon, light the portal, stand a few steps away ----
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    g.enterDungeon();
    const L = g.level; const f = L.floor; const po = L.portal;
    po.state = 1;
    for (const m of g.monsters) m.dead = true;
    // a walkable tile 4 to 5 tiles from the portal
    let best = null;
    for (let ty = 0; ty < f.h; ty++) for (let tx = 0; tx < f.w; tx++) {
      if (L.walk[ty * f.w + tx] !== 1) continue;
      const dd = Math.hypot(tx + 0.5 - po.x, ty + 0.5 - po.y);
      if (dd > 4 && dd < 5 && (!best || ty > best.ty)) best = { tx, ty };
    }
    g.hero.x = best.tx + 0.5; g.hero.y = best.ty + 0.5;
    for (let i = 0; i < L.explored.length; i++) L.explored[i] = 1;
  });
  await page.waitForTimeout(600);
  s = await st();
  log('in the dungeon', `town=${s.town} depth=${s.depth}`);
  p = await page.evaluate(() => { const d = window.__dbg; const po = d.game().level.portal; return d.at(po.x, po.y); });
  await snap('portal');
  await hands.pressAt(p.x, p.y - 20);
  r = await waitFor((q) => q.town === true, 8000);
  if (r.ms < 0) fails++;
  log('touch the portal', `town=${r.s.town} depth=${r.s.depth} after ${r.ms} ms`);
  await snap('back_in_town');
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) { fails++; console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' ')); }
  if (fails) console.log(`  !! ${fails} check(s) failed`);
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
