// ENDLESS MODE'S FINAL BOSS, STAGE 4 (game/act1_rules/wsboss.ts, game/game.ts finalLoot and updateArena; behind ENDLESS_KEY, switched on
// here by the test hook __dbg.endlessKey): FROM THE GAME, FOR HIM.
//   down into the arena; the fight brought on to his second phase (the boar's death), a meld of his under way; then his last blow
//   struck: HIS DEATH (overwhelmed, imploding, his runes blinking out until nothing is left), his drops where he was, the light above
//   opening: the hero walks over his drops and into the light, and is back at the Rim.
//   node tools/build_to.mjs dist/final.html
//   node tools/playtest.mjs --file dist/final.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/final_death_look.mjs --out shots/death/phone --video shots/death/film
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); });
  await page.waitForTimeout(300);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.endlessKey.on = true;
    d.run('warrior', 61);
    d.seasoned(30);
    d.autoLevel = false; d.autoWords = false;
    d.endless(true);
    if (d.talents) d.talents.on = false;
    const g = d.game(); const h = g.hero;
    h.ring = true; h.feather = 'given'; h.furnace = 'done'; h.meldAsk = true; h.meld = 'open'; g.questGiven = true; h.pending = 0;
    g.rimSeen = 3;
    h.finalOpen = true;
    d.endlessTown(true, 3);
    g.speakTo = null;
  });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 9.2; g.hero.y = 12.4; g.hero.fx = 1; g.hero.fy = 0; });
  await page.waitForTimeout(400);
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 10.27; g.hero.y = 12.24; });
  for (let i = 0; i < 60; i++) { if (await page.evaluate(() => !!window.__dbg.game().level.final)) break; await page.waitForTimeout(100); }
  await page.evaluate(() => { const d = window.__dbg; d.god = true; d.game().hero.d.maxLife = 60000; window.__keep = setInterval(() => { const h = d.game().hero; if (h.life > 0) h.life = h.d.maxLife; }, 60); });
  await page.waitForTimeout(2200);
  // (half his life: the boar's death; then on foot, a quarter left)
  await page.evaluate(() => { const b = window.__dbg.game().monsters.find((m) => m.kind === 'wsboss'); b.life = Math.ceil(b.maxLife * 0.5); });
  for (let i = 0; i < 300; i++) { if (await page.evaluate(() => { const b = window.__dbg.game().monsters.find((m) => m.kind === 'wsboss'); return !!(b && b.a1 && b.a1.foot); })) break; await page.waitForTimeout(100); }
  await page.evaluate(() => { const b = window.__dbg.game().monsters.find((m) => m.kind === 'wsboss'); b.life = Math.ceil(b.maxLife * 0.2); b.a1.want = 1; });
  const view = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  const cdp = hands.touch ? await page.context().newCDPSession(page) : null;
  const stickAt = { x: Math.round(view.w * 0.17), y: Math.round(view.h * 0.62) };
  const finger = async (type, x, y) => {
    const c = await hands.client(x, y);
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(c.x), y: Math.round(c.y), id: 3 }] });
  };
  let down = false;
  /** A step of walking toward (x, y) by the stick; true once there. */
  const walkTo = async (x, y) => {
    const p = await page.evaluate(([x, y]) => { const d = window.__dbg; const h = d.game().hero; return { a: d.at(h.x, h.y), b: d.at(x, y), dist: Math.hypot(h.x - x, h.y - y) }; }, [x, y]);
    if (p.dist < 0.3) { if (down) { await finger('touchEnd', 0, 0); down = false; } return true; }
    const dx = p.b.x - p.a.x; const dy = p.b.y - p.a.y; const l = Math.hypot(dx, dy) || 1;
    if (!down) { await finger('touchStart', stickAt.x, stickAt.y); down = true; }
    await finger('touchMove', stickAt.x + (dx / l) * 26, stickAt.y + (dy / l) * 26);
    return false;
  };
  // (the eruption under way: the film begins; then his last blow)
  for (let i = 0; i < 200; i++) { if (await page.evaluate(() => window.__dbg.game().perils.some((p) => p.a1 === 'wsboss:eruption'))) break; await page.waitForTimeout(50); }
  // (the hero stood a little before him, so that the camera has him whole)
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.kind === 'wsboss'); const cx = 12, cy = 12; let x = b.x + 1.9, y = b.y - 1.9; const d = Math.hypot(x - cx, y - cy); if (d > 7) { x = cx + ((x - cx) / d) * 7; y = cy + ((y - cy) / d) * 7; } g.hero.x = x; g.hero.y = y; });
  const t0 = snap.videoAt ? snap.videoAt() : 0;
  log('the film begins at', `${t0.toFixed(1)} s`);
  await page.waitForTimeout(1600);
  await page.evaluate(() => { window.__dbg.fx.messages.length = 0; });
  await snap('01_his_meld');
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.kind === 'wsboss'); g.damageMonster(b, b.maxLife, 'phys', true, 0); });
  const shots = [[0.6, '02_overwhelmed'], [1.3, '03_implodes'], [1.9, '04_his_runes'], [3.0, '05_blinking_out']];
  const t1 = Date.now();
  for (const [at, name] of shots) {
    while ((Date.now() - t1) / 1000 < at) await page.waitForTimeout(20);
    await snap(name);
  }
  for (let i = 0; i < 100; i++) { if (await page.evaluate(() => window.__dbg.game().monsters.every((m) => m.kind !== 'wsboss' || m.dead))) break; await page.waitForTimeout(50); }
  await page.waitForTimeout(700);
  await snap('06_what_he_left');
  const at = await page.evaluate(() => { const g = window.__dbg.game(); const d = g.drops.filter((q) => q.kind === 'item' || q.kind === 'gold' || q.kind === 'word'); return { loot: d.length ? [d[0].x, d[0].y] : null, kinds: d.map((q) => q.kind + (q.item ? `:${q.item.rarity}` : '')), arrive: [g.level.final.arrive.x, g.level.final.arrive.y] }; });
  log('his drops', at);
  // (over his drops, gathering them; then into the light)
  for (let i = 0; i < 160 && at.loot; i++) { if (await walkTo(at.loot[0], at.loot[1])) break; await page.waitForTimeout(60); }
  await page.waitForTimeout(1500);
  await snap('07_gathered');
  for (let i = 0; i < 260; i++) {
    if (await page.evaluate(() => !!window.__dbg.game().level.rim)) break;
    await walkTo(at.arrive[0], at.arrive[1]);
    await page.waitForTimeout(60);
  }
  if (down) await finger('touchEnd', 0, 0);
  await page.waitForTimeout(1800);
  await snap('08_back_at_the_rim');
  log('at the end', await page.evaluate(() => { const g = window.__dbg.game(); return { rim: !!g.level.rim, finalOpen: !!g.hero.finalOpen, bag: g.hero.bag.filter(Boolean).length }; }));
  if (snap.videoAt) log('the film ends at', `${snap.videoAt().toFixed(1)} s`);
  await page.evaluate(() => clearInterval(window.__keep));
}
