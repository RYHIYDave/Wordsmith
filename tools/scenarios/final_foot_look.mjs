// ENDLESS MODE'S FINAL BOSS, STAGE 3 (game/act1_rules/wsboss.ts and wsboss2.ts, render/act1_fx/wsboss.ts and wsboss2.ts; behind
// ENDLESS_KEY, switched on here by the test hook __dbg.endlessKey): FROM THE GAME, FOR HIM.
//   down into the arena; the fight brought to half his life: THE BOAR'S DEATH on its next charge; then ON FOOT, his ten melds, each
//   written, melded and slammed (made in turn here by the films' own hook, `want`, so that all ten are seen: in the game each is
//   drawn at random), two of them with the spent stand after, the rest below a quarter of his life, no rest between.
//   The hero kept alive, walking about the floor by the left thumb's stick; a picture of each meld, and the film (--video).
//   node tools/build_to.mjs dist/final.html
//   node tools/playtest.mjs --file dist/final.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/final_foot_look.mjs --out shots/foot/phone --video shots/foot/film
import { log, makeHands } from './lib.mjs';

const ORDER = ['eruption', 'scald', 'hailstorm', 'blight', 'thunder', 'fumes', 'avalanche', 'wildfire', 'contagion', 'frostbite'];
const IDS = ['eruption', 'hailstorm', 'thunder', 'avalanche', 'contagion', 'scald', 'blight', 'fumes', 'wildfire', 'frostbite'];
/** When each meld is at its most telling (seconds into the meld's act). */
const AT = { eruption: 3.2, scald: 4.4, hailstorm: 3.4, blight: 3.5, thunder: 3.6, fumes: 4.4, avalanche: 3.8, wildfire: 4.6, contagion: 3.0, frostbite: 3.4 };

export default async function (page, snap) {
  const hands = await makeHands(page);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); });
  await page.waitForTimeout(300);
  const clean = () => page.evaluate(() => { const d = window.__dbg; d.fx.messages.length = 0; d.game().speakTo = null; });
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
  await clean();
  // ---- half his life: the boar's death on its next charge (the film begins here)
  const t0 = snap.videoAt ? snap.videoAt() : 0;
  log('the film begins at', `${t0.toFixed(1)} s`);
  await page.evaluate(() => { const g = window.__dbg.game(); const b = g.monsters.find((m) => m.kind === 'wsboss'); b.life = Math.ceil(b.maxLife * 0.5); });
  const view = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  const cdp = hands.touch ? await page.context().newCDPSession(page) : null;
  const stickAt = { x: Math.round(view.w * 0.17), y: Math.round(view.h * 0.62) };
  const finger = async (type, x, y) => {
    const c = await hands.client(x, y);
    await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: Math.round(c.x), y: Math.round(c.y), id: 3 }] });
  };
  const spots = [[14.5, 14.5], [11.5, 15.5], [15.5, 11.0], [13.0, 12.5], [10.5, 13.5], [14.0, 9.5]];
  const shot = new Set();
  let made = 0;
  let lastAct = '';
  let si = 0;
  let next = Date.now();
  let down = false;
  let doneAt = 0;
  const until = Date.now() + 160000;
  while (Date.now() < until) {
    const s = await page.evaluate(() => {
      const g = window.__dbg.game(); const b = g.monsters.find((m) => m.kind === 'wsboss');
      return { act: b && b.act ? b.act.id.slice(7) : '', t: b && b.act ? b.act.t : 0, foot: !!(b && b.a1 && b.a1.foot), meld: b && b.a1 ? b.a1.meld : -1, life: b ? b.life / b.maxLife : 0, over: g.over, perils: g.perils.map((p) => p.a1).filter(Boolean) };
    });
    if (s.over) { log('fallen', s); break; }
    if (s.act === 'fall' && !shot.has('fall') && s.t > 1.9) { shot.add('fall'); await snap('01_the_boar_dies'); log('the fall', s); }
    if (s.act === 'fall' && !shot.has('rise') && s.t > 3.5) { shot.add('rise'); await snap('02_he_rises'); }
    // (on foot: the first meld wished for; then each next one as each is begun)
    if (s.foot && made === 0) {
      await page.evaluate((w) => { const b = window.__dbg.game().monsters.find((m) => m.kind === 'wsboss'); b.a1.want = w; }, IDS.indexOf(ORDER[0]) + 1);
      made = 1;
    }
    if (s.act === 'meld' && lastAct !== 'meld') {
      const name = IDS[s.meld];
      log('meld', { name, n: made });
      if (made < ORDER.length) await page.evaluate((w) => { const b = window.__dbg.game().monsters.find((m) => m.kind === 'wsboss'); b.a1.want = w; }, IDS.indexOf(ORDER[made]) + 1);
      made++;
      // (two with the spent stand after them; then below a quarter, no rest)
      if (made === 3) await page.evaluate(() => { const b = window.__dbg.game().monsters.find((m) => m.kind === 'wsboss'); b.life = Math.ceil(b.maxLife * 0.2); });
    }
    if (s.act === 'meld' && s.t > 0.55 && !shot.has(`w${made}`)) { shot.add(`w${made}`); if (made <= 2) await snap(`03_${String(made).padStart(2, '0')}_writing`); }
    lastAct = s.act;
    // (each meld at its most telling: by its peril's clock)
    const live = s.perils.find((a) => IDS.includes(a.slice(7)));
    if (live) {
      const nm = live.slice(7);
      const pt = await page.evaluate((a1) => { const p = window.__dbg.game().perils.find((q) => q.a1 === a1); return p ? p.t : 0; }, live);
      if (!shot.has(nm) && pt >= AT[nm] - 1.27) { shot.add(nm); if (down) { await finger('touchEnd', 0, 0); down = false; } await snap(`04_${String(ORDER.indexOf(nm) + 1).padStart(2, '0')}_${nm}`); log('shot', nm); }
    }
    if (s.act === 'spent' && !shot.has('spent')) { shot.add('spent'); await snap('05_spent'); }
    // (the last of the ten done with: the film ends a moment after)
    if (shot.has('frostbite') && live !== 'wsboss:frostbite' && !doneAt) doneAt = Date.now() + 800;
    if (doneAt && Date.now() > doneAt) break;
    if (cdp && Date.now() > next) {
      const [tx, ty] = spots[si % spots.length];
      const p = await page.evaluate(([x, y]) => { const d = window.__dbg; const h = d.game().hero; return { a: d.at(h.x, h.y), b: d.at(x, y), dist: Math.hypot(h.x - x, h.y - y) }; }, [tx, ty]);
      if (p.dist < 0.4) { si++; next = Date.now() + 1800; if (down) { await finger('touchEnd', 0, 0); down = false; } }
      else {
        const dx = p.b.x - p.a.x; const dy = p.b.y - p.a.y; const l = Math.hypot(dx, dy) || 1;
        if (!down) { await finger('touchStart', stickAt.x, stickAt.y); down = true; }
        await finger('touchMove', stickAt.x + (dx / l) * 26, stickAt.y + (dy / l) * 26);
      }
    }
    await page.waitForTimeout(60);
  }
  if (down) await finger('touchEnd', 0, 0);
  log('shots', [...shot]);
  if (snap.videoAt) log('the film ends at', `${snap.videoAt().toFixed(1)} s`);
  await page.evaluate(() => clearInterval(window.__keep));
}
