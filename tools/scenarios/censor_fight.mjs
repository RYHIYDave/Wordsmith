// THE CENSOR'S FIGHT (game/act1_rules/censor.ts): floor 15 come to and his Reading Room walked into, and the fight let run
// with the bot: how long each frame of the page took, how many ran long (over 100 ms), the longest. Off the clock of the page
// itself (requestAnimationFrame). Pictures every few seconds. '!!' where frames ran long.
//   node tools/playtest.mjs --file dist/next.html --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/censor_fight.mjs --out shots/censor/x
// SECS: how long the fight is watched (30). SEED (5). CLS: the hero's class (warrior). FILM=1: frames as fast as they come, the game slowed (SLOW, 0.5), each
// frame's game clock logged at the end ('TIMES [...]'), so that a video can be put together at the game's own speed.
// LONG_OK=1: frames over 100 ms logged, not flagged (in the regression, two playtests at a time).
// PHASES=1: his life brought down by script to just under two thirds and then one third, a third and two thirds of the way through.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const secs = Number(process.env.SECS) || 30;
  const seed = Number(process.env.SEED) || 5;
  const film = process.env.FILM === '1';
  const info = await page.evaluate((a) => {
    const d = window.__dbg;
    d.saving(false);
    d.run(a.cls, a.seed);
    d.seasoned(12);
    d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game();
    g.hero.ring = true; g.hero.pending = 0; g.guide = null;
    g.depth = 15; g.cleared = 14; g.wayDepth = 15; g.enterDungeon();
    g.hero.invuln = 1e9;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    const b = g.monsters.find((m) => m.boss);
    // (in his Reading Room, a few tiles before him, in his sight)
    const sp = g.spotsRound(b.x, b.y, 60).find((q) => Math.hypot(q.x - b.x, q.y - b.y) > 4 && g.sees(q.x, q.y, b.x, b.y));
    if (sp) { g.hero.x = sp.x; g.hero.y = sp.y; }
    g.bossMet = true;
    g.level.explored.fill(1);
    return { boss: b.kind, at: [b.x, b.y] };
  }, { seed, cls: process.env.CLS || 'warrior' });
  log('floor 15', JSON.stringify(info));
  // (the page's own frames, timed)
  await page.evaluate(() => {
    window.__frames = [];
    window.__longAt = [];
    const t0 = performance.now();
    let last = t0;
    const tick = (now) => {
      window.__frames.push(now - last);
      if (now - last > 100) window.__longAt.push([+((now - t0) / 1000).toFixed(1), Math.round(now - last), window.__dbg.painting ? window.__dbg.painting.frames : 0]);
      last = now;
      if (window.__frames.length < 100000) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
  // (the bot fights him: the hero moves and strikes as a player would)
  await page.evaluate(() => { const d = window.__dbg; if (d.bot) d.bot(true); });
  // (FILM: the game at half speed, a frame each snap; PHASES=1: his bar emptied by script a third and two thirds of the way
  // through, so that his surfacing and his pulling the siege in, and each phase's moves, are in it)
  const slow = Number(process.env.SLOW) || 0.5;
  if (film) await page.evaluate((k) => { window.__dbg.fx.messages.length = 0; window.__dbg.slowmo = k; }, slow);
  const times = [];
  const phases = process.env.PHASES === '1';
  const t0 = Date.now();
  let k = 0;
  let pushed = 0;
  while (Date.now() - t0 < secs * 1000) {
    if (phases && pushed < 2 && Date.now() - t0 > ((pushed + 1) * secs * 1000) / 3) {
      pushed++;
      await page.evaluate((n) => { const b = window.__dbg.game().monsters.find((m) => m.boss && !m.dead); if (b) b.life = Math.min(b.life, Math.floor(b.maxLife * (n === 1 ? 0.65 : 0.32))); }, pushed);
    }
    if (film) {
      times.push(await page.evaluate(() => window.__dbg.game().time));
      await snap(`f${String(k++).padStart(4, '0')}`);
    }
    else { await page.waitForTimeout(5000); await snap(`t${String(k++).padStart(2, '0')}`); }
  }
  if (film) { await page.evaluate(() => { window.__dbg.slowmo = 1; }); log('TIMES', JSON.stringify(times.map((t) => +t.toFixed(3)))); }
  await page.evaluate(() => { const d = window.__dbg; if (d.bot) d.bot(false); });
  const r = await page.evaluate(() => {
    const f = window.__frames.slice(5);
    const long = f.filter((x) => x > 100);
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss);
    return { frames: f.length, long: long.length, longest: Math.round(Math.max(...f)), sumLong: Math.round(long.reduce((a, x) => a + x, 0)), phase: b ? b.phase : null, life: b ? Math.round(b.life) : null, painted: window.__dbg.painting ? window.__dbg.painting.frames : null };
  });
  log('frames', JSON.stringify(r));
  log('long at (s, ms, painted so far)', JSON.stringify(await page.evaluate(() => window.__longAt.slice(0, 40))));
  if (r.long > 3 && !process.env.LONG_OK) log(`!! ${r.long} frames ran over 100 ms (the longest ${r.longest} ms, ${r.sumLong} ms in all)`);
  // (CENSOR_FIGHT: his ink laid to stay, lying on the floor long after the art's would have dried)
  const ink = await page.evaluate(() => window.__dbg.game().perils.filter((p) => p.a1 === 'censor:bars' && p.done && p.t > 3).length);
  log('his ink lying on the floor (bars laid over 3 s ago)', ink);
  if (!ink) log('!! none of his ink lay on the floor');
}
