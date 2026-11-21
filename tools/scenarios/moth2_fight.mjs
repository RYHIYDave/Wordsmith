// FLOOR 20, THE MOTH MADE GHOSTLY (art/moth2.ts, behind MOTH2: switched on here unless OLD=1), filmed in the game for him at his
// phone's size: a hero of level 25 on the Tower Top, nothing can kill him; each of her moves called for in turn: GHOST WING, THE
// HUSH, ECLIPSE, PHANTOMS; her second phase (her Hush falling on him); her last, the chapter knocked to the stones and her coming
// down on it; THE UNWRITING; her death, coming apart into light. A picture every thirtieth of a second of the game's time
// (python3 tools/f9_bosses_cut.py <prefix> <out.mp4>); STILLS=1, every half second.
//   node tools/build_to.mjs dist/moth2.html
//   node tools/playtest.mjs --file dist/moth2.html --touch --size 852x393 --dpr 2 --scenario tools/scenarios/moth2_fight.mjs --out shots/moth2/m
//   env OLD=1 (her old moves, for the side by side), CLS (warrior), SEED (4), ONLY (one scene's name: buffet, dust, eyes, swarm, phase2, last, beat, death)
const FPS = 30;
export default async function (page, snap) {
  const stills = process.env.STILLS === '1';
  const old = process.env.OLD === '1';
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 4);
  const info = await page.evaluate(([cls, seed, old]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.moth2.use(!old);
    d.run(cls, seed);
    d.seasoned(25);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    if (d.floorNames) d.floorNames(false);
    d.high(true, 20);
    const g = d.game();
    g.talentsLeft = () => 0;
    g.hero.pending = 0;
    g.guide = null;
    g.level.explored.fill(1);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
    const T = g.level.land.tower;
    g.hero.x = T.top.cx + 1;
    g.hero.y = T.top.cy + 4;
    g.bossMet = true;
    return { sw: d.moth2.sw.on, boss: g.monsters.map((m) => m.kind).join(',') };
  }, [cls, seed, old]);
  console.log('floor 20', JSON.stringify(info));
  // (her pictures painted before the film begins: the painter's worker, beside the game)
  await page.waitForTimeout(Number(process.env.WAIT || 20000));
  const scenes = [
    [0, 'THE MOTH', 'hover'],
    [3, 'GHOST WING', 'buffet'],
    [8, 'THE HUSH', 'dust'],
    [14, 'ECLIPSE', 'eyes'],
    [20, 'PHANTOMS', 'swarm'],
    [27, 'FASTER: HER HUSH FALLS ON YOU', 'phase2'],
    [34, 'THE LAST CHAPTER', 'last'],
    [42, 'THE UNWRITING', 'beat'],
    [49, 'SHE COMES APART INTO LIGHT', 'death'],
  ];
  const only = process.env.ONLY || '';
  const list = only ? scenes.filter((s) => s[2] === only).map((s, i) => [i * 6, s[1], s[2]]) : scenes;
  const seconds = only ? 7 : 57;
  const go = (what) => page.evaluate((what) => {
    const d = window.__dbg;
    const g = d.game();
    const h = g.hero;
    const T = g.level.land.tower;
    const m = g.monsters.find((q) => q.kind === 'moth');
    if (!m) return;
    const acts = ['moth:buffet', 'moth:dust', 'moth:swarm', 'moth:eyes', 'moth:beat', 'moth:land'];
    const only = (id) => { if (!m.moveCd) return; acts.forEach((a, i) => { if (i < m.moveCd.length && a !== 'moth:land') m.moveCd[i] = a === id ? 0 : 99; }); m.cd = 0; };
    const every = () => { if (m.moveCd) m.moveCd = m.moveCd.map(() => 0); m.cd = 0; };
    const near = (r) => { const ws = [[r, 0], [0, r], [-r, 0], [0, -r], [r * 0.7, r * 0.7], [-r * 0.7, r * 0.7]]; for (const [ax, ay] of ws) { if (g.isOpen(m.x + ax, m.y + ay)) { h.x = m.x + ax; h.y = m.y + ay; return; } } };
    d.bot(false);
    if (what === 'hover') { m.life = m.maxLife = 2e5; only('none'); h.x = T.top.cx + 1; h.y = T.top.cy + 4; }
    else if (what === 'buffet') { near(4); only('moth:buffet'); }
    else if (what === 'dust') { near(4.5); only('moth:dust'); }
    else if (what === 'eyes') { near(4.2); only('moth:eyes'); }
    else if (what === 'swarm') { near(5); only('moth:swarm'); }
    else if (what === 'phase2') { m.life = m.maxLife * 0.6; every(); d.bot(true); }
    else if (what === 'last') { m.life = m.maxLife * 0.3; every(); h.x = T.top.cx + 3; h.y = T.top.cy + 4.5; }
    else if (what === 'beat') { only('moth:beat'); }
    else if (what === 'death') { m.life = 1; d.bot(true); window.__deathAt = g.time; }
  }, what);
  // (each scene its own name under the film)
  const parts = [];
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  let next = 0;
  let frame = 0;
  for (let i = 0; i < total; i++) {
    while (next < list.length && list[next][0] * FPS <= i) {
      parts.push([frame, list[next][1]]);
      await go(list[next++][2]);
    }
    await page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; if (window.__deathAt !== undefined && !g.monsters.some((q) => q.kind === 'moth' && !q.dead)) { d.bot(false); window.__stand ??= { x: h.x, y: h.y }; h.x = window.__stand.x; h.y = window.__stand.y; } });
    await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 300000 });
    if (stills && i % 15 !== 0) continue;
    await snap(`f${String(frame).padStart(4, '0')}`);
    frame++;
    if (i % 60 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`, await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.kind === 'moth'); return m ? `moth ${m.dead ? 'dead' : ''} ${(m.life / m.maxLife).toFixed(2)} ${m.act ? m.act.id + ' ' + m.act.t.toFixed(2) : m.anim} perched ${m.a1?.perched ?? 0} hero ${g.hero.life.toFixed(0)} perils ${g.perils.filter((p) => p.a1 && p.a1.startsWith('moth')).map((p) => p.a1).join(' ')}` : 'no moth'; }));
  }
  snap.note('film', { fps: FPS, parts });
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
