// ENDLESS MODE'S KEY (game/endless_key.ts, render/rim.ts; behind ENDLESS_KEY, switched on here by the test hook __dbg.endlessKey):
// STAGE 1 FROM THE GAME, FOR HIM (pictures first: nothing of it goes live before his yes to these).
//   1. endless floor 5: the Fleshmancer falls; his quarter lies where he fell;
//   2. taken: TABLET 1 / 4;
//   3. at the Shaft's Rim, three held: on the trophies wall, and lying dark in the bench's socket;
//   4. all four;
//   then the film (--video): he goes up to the wordsmith with all four; they are set and burn; he walks out on the tongue as the
//   landing opens; walked into, it sets him back (the fight below is the next stage's).
//   node tools/build_to.mjs dist/key.html
//   node tools/playtest.mjs --file dist/key.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/endless_key_look.mjs --out shots/key/phone --video shots/key/film
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); });
  await page.waitForTimeout(300);
  const clean = () => page.evaluate(() => { const d = window.__dbg; d.fx.messages.length = 0; d.game().speakTo = null; });
  const seasonedHero = () => page.evaluate(() => {
    const d = window.__dbg;
    d.endlessKey.on = true;
    d.run('warrior', 61);
    d.seasoned(30);
    d.autoLevel = false; d.autoWords = false;
    if (d.talents) d.talents.on = false;
    const g = d.game(); const h = g.hero;
    h.ring = true; h.feather = 'given'; h.furnace = 'done'; h.meldAsk = true; h.meld = 'open'; g.questGiven = true; h.pending = 0;
    g.meta.quarters = 0;
  });

  // ---- 1, 2: endless floor 5, the boss falls, his quarter --------------------------------------------------------------
  await seasonedHero();
  const fell = await page.evaluate(() => {
    const d = window.__dbg;
    d.endlessTown(true);
    d.endless(true, 5, 5);
    const g = d.game();
    const b = g.monsters.find((m) => m.boss);
    if (!b) return { boss: null };
    // (he stands three and a half tiles off, out of the quarter's pull, and sees the ground between)
    const h = g.hero;
    const a = Math.atan2(1, 1);
    let at = null;
    for (let r = 6.4; r < 9 && !at; r += 0.4) for (let k = 0; k < 16 && !at; k++) {
      const x = b.x + Math.cos(a + (k * Math.PI) / 8) * r; const y = b.y + Math.sin(a + (k * Math.PI) / 8) * r;
      if (g.free(g.level.walk, x, y, 0.3)) at = { x, y };
    }
    if (at) { h.x = at.x; h.y = at.y; }
    for (const m of g.monsters) if (m !== b && Math.hypot(m.x - h.x, m.y - h.y) < 14) m.life = 0;
    g.monsters = g.monsters.filter((m) => m === b || m.life > 0);
    const dx = b.x - h.x; const dy = b.y - h.y; const l = Math.hypot(dx, dy) || 1;
    h.fx = dx / l; h.fy = dy / l;
    for (let y = Math.floor(b.y) - 7; y <= b.y + 7; y++) for (let x = Math.floor(b.x) - 7; x <= b.x + 7; x++) {
      if (x >= 0 && y >= 0 && x < g.level.floor.w && y < g.level.floor.h) g.level.explored[y * g.level.floor.w + x] = true;
    }
    return { boss: b.name, kind: b.kind, depth: g.depth, endless: g.inEndless, at: [b.x.toFixed(1), b.y.toFixed(1)], hero: [h.x.toFixed(1), h.y.toFixed(1)] };
  });
  log('endless floor 5', fell);
  await page.waitForTimeout(900);
  const dropped = await page.evaluate(() => {
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss);
    if (b) g.kill(b);
    const q = g.drops.filter((d) => d.kind === 'quest' && d.thing === 'quarter');
    return q.map((d) => ({ k: d.quarter, x: d.x.toFixed(1), y: d.y.toFixed(1) }));
  });
  log('the quarter dropped', dropped);
  await page.waitForTimeout(5200);
  await clean();
  await hands.settle();
  await snap('01_floor5_his_quarter_where_he_fell');
  // (walked up to: taken)
  await page.evaluate(() => { const g = window.__dbg.game(); const q = g.drops.find((d) => d.kind === 'quest' && d.thing === 'quarter'); if (q) { g.hero.x = q.x - 1.6; g.hero.y = q.y - 1.6; } });
  await page.waitForTimeout(500);
  await snap('02_taken_tablet_1_of_4');
  log('taken', await page.evaluate(() => ({ quarters: window.__dbg.game().meta.quarters, lines: window.__dbg.fx.messages.slice(-2).map((m) => m.text) })));

  // ---- 3, 4: at the Rim, three, then four ------------------------------------------------------------------------------
  const rimAt = async (bits) => page.evaluate((b) => {
    const d = window.__dbg;
    const g = d.game();
    g.meta.quarters = b;
    g.rimSeen = 23;
    d.endlessTown(true, 23);
    g.speakTo = null;
    const ws = g.level.stations.find((s) => s.kind === 'wordsmith');
    const slab = g.level.props.find((p) => p.kind === 'runeSlab');
    return { held: g.level.rim.held, ws: ws && [ws.x, ws.y], slab: slab && [slab.x, slab.y] };
  }, bits);
  const stand = async (x, y, name, fx, fy, wait = 900) => {
    await page.evaluate(([hx, hy, ax, ay]) => { const g = window.__dbg.game(); g.hero.x = hx; g.hero.y = hy; g.hero.fx = ax; g.hero.fy = ay; }, [x, y, fx, fy]);
    await clean();
    await page.waitForTimeout(wait);
    await hands.settle();
    await snap(name);
  };
  const three = await rimAt(0b0111);
  log('the Rim, three held', three);
  await page.waitForTimeout(1500);
  await stand(9.6, 9.0, '03_three_on_the_trophies_wall', -0.7071, -0.7071);
  await stand(11.6, 18.2, '04_three_dark_in_the_bench', -1, 0);
  const four = await rimAt(0b1111);
  log('the Rim, four held', four);
  await page.waitForTimeout(1200);
  await stand(11.6, 18.2, '05_four_dark_in_the_bench', -1, 0);
  log('at the wordsmith', await page.evaluate(() => ({ hint: window.__dbg.game().interactHint(), due: window.__dbg.game().handInNear() })));

  // ---- the film ---------------------------------------------------------------------------------------------------------
  const view = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  const set = async () => {
    // (a touch on the wordsmith: he walks up, and the four are set, by the rules, in place of the panel opening)
    const w = await page.evaluate(() => { const d = window.__dbg; const s = d.game().level.stations.find((q) => q.kind === 'wordsmith'); return { at: d.at(s.x, s.y), lift: s.lift ?? 30 }; });
    const low = w.at.y > view.h - 80;
    await hands.pressAt(w.at.x, low ? w.at.y - w.lift + 3 : w.at.y - 12);
    for (let i = 0; i < 80; i++) { if (await page.evaluate(() => !!window.__dbg.game().level.rim.key)) break; await page.waitForTimeout(100); }
    return page.evaluate(() => ({ key: window.__dbg.game().level.rim.key, quarters: window.__dbg.game().meta.quarters, panel: window.__dbg.panels.open }));
  };
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 13.0; g.hero.y = 16.6; g.hero.fx = -0.7071; g.hero.fy = 0.7071; });
  await clean();
  await page.waitForTimeout(900);
  await hands.settle();
  const t0 = snap.videoAt ? snap.videoAt() : 0;
  log('the film begins at', `${t0.toFixed(1)} s`);
  const didSet = await set();
  log('set', didSet);
  const shut = (await hands.mark('button:x')) ? 'button:x' : (await hands.mark('button:DONE')) ? 'button:DONE' : null;
  if (didSet.panel !== 'none' && shut) await hands.press(shut);
  await page.waitForTimeout(1300);
  await snap('06_set_burning');
  // (he walks round the pit to the tongue's foot as the landing opens, by the left thumb's stick, as a person does on a phone)
  const cdp = hands.touch ? await page.context().newCDPSession(page) : null;
  const stickAt = { x: Math.round(view.w * 0.17), y: Math.round(view.h * 0.62) };
  const finger = async (type, x, y) => {
    const c = await hands.client(x, y);
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(c.x), y: Math.round(c.y), id: 3 }] });
  };
  const walkTo = async (tx, ty, near = 0.3, ms = 7000) => {
    const t1 = Date.now();
    let down = false;
    while (Date.now() - t1 < ms) {
      const s = await page.evaluate(([x, y]) => { const d = window.__dbg; const h = d.game().hero; return { a: d.at(h.x, h.y), b: d.at(x, y), dist: Math.hypot(h.x - x, h.y - y) }; }, [tx, ty]);
      if (s.dist < near) break;
      const dx = s.b.x - s.a.x; const dy = s.b.y - s.a.y; const l = Math.hypot(dx, dy) || 1;
      if (!down) { await finger('touchStart', stickAt.x, stickAt.y); down = true; }
      await finger('touchMove', stickAt.x + (dx / l) * 26, stickAt.y + (dy / l) * 26);
      await page.waitForTimeout(70);
    }
    if (down) await finger('touchEnd', 0, 0);
    await page.waitForTimeout(60);
  };
  if (cdp) {
    await walkTo(9.4, 16.4);
    await walkTo(7.7, 14.6);
    await snap('07_the_landing_opening');
    await walkTo(7.8, 12.6);
    await page.waitForTimeout(1800);
    await snap('08_the_landing_open');
    log('open', await page.evaluate(() => window.__dbg.game().level.rim.key));
    // (out along the tongue onto it: set back off the hole, and told)
    await walkTo(10.27, 12.24, 0.3, 4000);
    await page.waitForTimeout(500);
    await snap('09_walked_into_set_back');
  }
  log('after', await page.evaluate(() => ({ hero: [window.__dbg.game().hero.x.toFixed(2), window.__dbg.game().hero.y.toFixed(2)], lines: window.__dbg.fx.messages.slice(-3).map((m) => m.text) })));
  await page.waitForTimeout(800);
  if (snap.videoAt) log('the film ends at', `${snap.videoAt().toFixed(1)} s`);
}
