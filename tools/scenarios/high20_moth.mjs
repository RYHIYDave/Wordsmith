// FLOOR 20, THE MOTH, filmed in play for the owner (behind HIGH_CITY, switched on here alone): a hero of level 25 come up through
// the trapdoor onto the Tower Top, the test bot fighting for him (nothing can kill him): the Moth hovering, its slow heavy beat; the
// trapdoor slamming shut; the buffet; Dust; the Eyes; the Swarm; its second phase, faster, its dust falling on him; its last, the
// chapter knocked from its lectern to the stones and the Moth coming down on it, the beat over the whole top; its death, screaming,
// the words flying home. A picture every thirtieth of a second of the game's time (python3 film_cut.py <dir> <out.mp4>); STILLS=1,
// every half second.
//   node tools/playtest.mjs --file dist/floor20.html --size 1280x720 --scenario tools/scenarios/high20_moth.mjs --out shots/moth/k
const FPS = 30;
export default async function (page, snap) {
  const stills = process.env.STILLS === '1';
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 4);
  await page.evaluate(([cls, seed]) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run(cls, seed); d.seasoned(25); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 20);
    const g = d.game(); g.level.explored.fill(1);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
    // (up the stair: he comes up through the trapdoor)
    const T = g.level.land.tower; const h = g.hero;
    h.x = T.stair.x + (T.stair.back.x - T.stair.x) * 0.55; h.y = T.stair.y + (T.stair.back.y - T.stair.y) * 0.55;
  }, [cls, seed]);
  await page.waitForTimeout(3500);
  const scenes = [
    [0, 'THE TOWER TOP', 'Up through the trapdoor. It slams shut behind you.', 'start'],
    [6, 'THE MOTH', 'It never touches the top. One slow, heavy wingbeat.', 'hover'],
    [10, 'THE BUFFET', 'A gust over a cone before it. It throws you back.', 'buffet'],
    [15, 'DUST', 'A cloud of its scales. In it, your words go dark.', 'dust'],
    [22, 'THE EYES', 'Four beams along the lines its eyes stare.', 'eyes'],
    [28, 'THE SWARM', 'Little grey moths pour off it.', 'swarm'],
    [35, 'FASTER', 'Its second phase: it beats and drifts faster, and its dust falls on you.', 'phase2'],
    [46, 'THE LAST CHAPTER', 'Its last phase: the chapter is knocked to the stones, and it comes down on it.', 'last'],
    [56, 'THE BEAT', 'Its wings beat the whole top. Dodge through the wind.', 'beat'],
    [66, 'IT DIES SCREAMING', 'The first sound it ever makes. Every word it swallowed flies home.', 'death'],
  ];
  const seconds = 76;
  snap.note('film', { fps: FPS, from: 0, parts: scenes.map(([t, a, b]) => [t, a, b]), size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const go = (what) => page.evaluate((what) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const T = g.level.land.tower;
    const m = g.monsters.find((q) => q.kind === 'moth');
    if (!m) return;
    const only = (id) => { const acts = ['moth:buffet', 'moth:dust', 'moth:swarm', 'moth:eyes', 'moth:beat', 'moth:land']; if (!m.moveCd) return; acts.forEach((a, i) => { if (i < m.moveCd.length && a !== 'moth:land') m.moveCd[i] = a === id ? 0 : 99; }); m.cd = 0; };
    if (what === 'start') { d.bot(false); m.life = m.maxLife = 2e5; }
    else if (what === 'hover') { d.bot(false); h.x = T.top.cx + 1; h.y = T.top.cy + 4; only('none'); }
    else if (what === 'buffet') { d.bot(false); only('moth:buffet'); }
    else if (what === 'dust') { d.bot(false); only('moth:dust'); }
    else if (what === 'eyes') { d.bot(false); h.x = m.x + 4; h.y = m.y + 4; if (!g.isOpen(h.x, h.y)) { h.x = T.top.cx + 3; h.y = T.top.cy + 4; } only('moth:eyes'); }
    else if (what === 'swarm') { d.bot(false); h.x = T.top.cx - 3; h.y = T.top.cy + 4; only('moth:swarm'); }
    else if (what === 'phase2') { m.life = m.maxLife * 0.6; d.bot(true); }
    else if (what === 'last') { m.life = m.maxLife * 0.3; d.bot(false); h.x = T.top.cx + 3; h.y = T.top.cy + 4.5; }
    else if (what === 'beat') { d.bot(true); }
    else if (what === 'death') { m.life = 1; d.bot(true); }
  }, what);
  const slow = 0.05;
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  let next = 0;
  for (let i = 0; i < total; i++) {
    while (next < scenes.length && scenes[next][0] * FPS <= i) await go(scenes[next++][3]);
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 300000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(i).padStart(4, '0')}`);
    if (i % 60 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'moth'); return m ? `moth ${m.dead ? 'dead' : ''} ${(m.life / m.maxLife).toFixed(2)} ${m.act ? m.act.id : m.anim} beat ${(m.a1?.beat ?? 0).toFixed(2)} perched ${m.a1?.perched ?? 0} at ${m.x.toFixed(1)},${m.y.toFixed(1)} hero ${g.hero.x.toFixed(1)},${g.hero.y.toFixed(1)}` : 'no moth'; }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
