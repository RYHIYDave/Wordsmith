// ENDLESS MODE'S FINAL BOSS, STAGE 2 (game/final_arena.ts, game/act1_rules/wsboss.ts, render/final_arena.ts,
// render/act1_fx/wsboss.ts; behind ENDLESS_KEY, switched on here by the test hook __dbg.endlessKey): FROM THE GAME, FOR HIM.
//   1. down through the open landing at the Shaft's Rim, into its light;
//   2. the bottom of the shaft: he stands in the portal's light, the warped wordsmith on his boar across the floor;
//   then his first phase, played (kept alive, walking about the floor by the left thumb's stick), a picture of each of his moves
//   the first time it is made, and the film (--video).
//   node tools/build_to.mjs dist/final.html
//   node tools/playtest.mjs --file dist/final.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/final_fight_look.mjs --out shots/final/phone --video shots/final/film
import { log, makeHands } from './lib.mjs';

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); });
  await page.waitForTimeout(300);
  const clean = () => page.evaluate(() => { const d = window.__dbg; d.fx.messages.length = 0; d.game().speakTo = null; });
  const set = await page.evaluate(() => {
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
    return { rim: !!g.level.rim, open: !!h.finalOpen };
  });
  log('at the Rim, the landing open', set);
  await page.waitForTimeout(1500);
  // (onto the landing: down into its light)
  const t0 = snap.videoAt ? snap.videoAt() : 0;
  log('the film begins at', `${t0.toFixed(1)} s`);
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 9.2; g.hero.y = 12.4; g.hero.fx = 1; g.hero.fy = 0; });
  await page.waitForTimeout(400);
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.x = 10.27; g.hero.y = 12.24; });
  for (let i = 0; i < 60; i++) { if (await page.evaluate(() => !!window.__dbg.game().level.final)) break; await page.waitForTimeout(100); }
  log('down', await page.evaluate(() => { const g = window.__dbg.game(); return { final: !!g.level.final, monsters: g.monsters.map((m) => m.kind), boss: g.boss && g.boss.name }; }));
  // (kept alive: his life put back each tenth of a second, as the pictures are taken)
  await page.evaluate(() => { const d = window.__dbg; d.god = true; d.game().hero.d.maxLife = 60000; window.__keep = setInterval(() => { const h = d.game().hero; if (h.life > 0) h.life = h.d.maxLife; }, 60); });
  await page.waitForTimeout(1600);
  await clean();
  await snap('01_the_bottom_of_the_shaft');
  // ---- the fight: walking about the floor by the stick; a picture of each move the first time it is made
  const view = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  const cdp = hands.touch ? await page.context().newCDPSession(page) : null;
  const stickAt = { x: Math.round(view.w * 0.17), y: Math.round(view.h * 0.62) };
  const finger = async (type, x, y) => {
    const c = await hands.client(x, y);
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(c.x), y: Math.round(c.y), id: 3 }] });
  };
  const spots = [[14.5, 14.5], [11.5, 15.5], [15.5, 11.0], [13.0, 12.5], [10.5, 13.5], [14.0, 9.5]];
  const seen = new Set();
  const until = Date.now() + 80000;
  let si = 0;
  let next = Date.now();
  let down = false;
  while (Date.now() < until) {
    const s = await page.evaluate(() => {
      const d = window.__dbg; const g = d.game(); const b = g.monsters.find((m) => m.kind === 'wsboss');
      return { a1: b && b.a1 && b.act && b.act.id === 'wsboss:charge' ? { lane: b.a1.lane, scale: b.a1.scale, fx: b.a1.fx, fy: b.a1.fy } : null, act: b && b.act ? b.act.id.slice(7) : '', t: b && b.act ? b.act.t : 0, hero: [g.hero.x, g.hero.y], over: g.over, perils: g.perils.map((p) => p.a1).filter(Boolean) };
    });
    if (s.over) { log('fallen', s); break; }
    // (a picture of each move as it comes to its most telling moment)
    const at = { charge: 0.7, gore: 0.6, stomp: 0.85, winded: 1.2, power: 1.25, flame: 1.9, frost: 1.05, lightning: 2.2, poison: 1.7, wheel: 0.35 };
    if (s.act && !seen.has(s.act) && s.t >= (at[s.act] ?? 0.5)) {
      seen.add(s.act);
      if (down) { await finger('touchEnd', 0, 0); down = false; }
      await snap(`02_${String(seen.size).padStart(2, '0')}_${s.act}`);
      log('move', { act: s.act, t: s.t.toFixed(2), perils: s.perils.length, a1: s.a1 });
    }
    // (now and then he walks to another spot of the floor)
    if (cdp && Date.now() > next) {
      const [tx, ty] = spots[si % spots.length];
      const p = await page.evaluate(([x, y]) => { const d = window.__dbg; const h = d.game().hero; return { a: d.at(h.x, h.y), b: d.at(x, y), dist: Math.hypot(h.x - x, h.y - y) }; }, [tx, ty]);
      if (p.dist < 0.4) { si++; next = Date.now() + 2500; if (down) { await finger('touchEnd', 0, 0); down = false; } }
      else {
        const dx = p.b.x - p.a.x; const dy = p.b.y - p.a.y; const l = Math.hypot(dx, dy) || 1;
        if (!down) { await finger('touchStart', stickAt.x, stickAt.y); down = true; }
        await finger('touchMove', stickAt.x + (dx / l) * 26, stickAt.y + (dy / l) * 26);
      }
    }
    await page.waitForTimeout(70);
  }
  if (down) await finger('touchEnd', 0, 0);
  log('moves seen', [...seen]);
  log('state', await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.kind === 'wsboss'); return { life: b && Math.round(b.life), max: b && b.maxLife, hero: Math.round(g.hero.life), over: g.over }; }));
  if (snap.videoAt) log('the film ends at', `${snap.videoAt().toFixed(1)} s`);
  await page.evaluate(() => clearInterval(window.__keep));
}
