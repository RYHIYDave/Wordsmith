// THE DROWNED EYE'S STUTTER (render/act1_fx/eye.ts; the owner, 23 Oct 2026, 15:21: “He stutters in and out of view”): floor 10
// come to and his ring walked onto at once, before the painter has painted him, and the fight let run: how long each frame of
// the page took, how many ran long (over 100 ms: the game held still), the longest, and in how many frames he was drawn. Off
// the clock of the page itself (requestAnimationFrame). Pictures every few seconds. '!!' where frames ran long.
//   node tools/playtest.mjs --file dist/next.html --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/eye_stutter.mjs --out shots/eye/x
// SECS: how long the fight is watched (30). SEED (5). FILM=1: a frame every 100 ms for a video.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const secs = Number(process.env.SECS) || 30;
  const seed = Number(process.env.SEED) || 5;
  const film = process.env.FILM === '1';
  const info = await page.evaluate((s) => {
    const d = window.__dbg;
    d.saving(false);
    d.run('warrior', s);
    d.seasoned(12);
    d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game();
    g.hero.ring = true; g.hero.pending = 0; g.guide = null;
    g.depth = 10; g.cleared = 9; g.wayDepth = 10; g.enterDungeon();
    g.hero.invuln = 1e9;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    const b = g.monsters.find((m) => m.boss);
    // (on his ring, south of his pool, in his sight)
    g.hero.x = b.x + 4.2; g.hero.y = b.y + 4.2;
    g.bossMet = true;
    g.level.explored.fill(1);
    return { boss: b.kind, at: [b.x, b.y] };
  }, seed);
  log('floor 10', JSON.stringify(info));
  // (the page's own frames, timed)
  await page.evaluate(() => {
    window.__frames = [];
    let last = performance.now();
    const tick = (now) => { window.__frames.push(now - last); last = now; if (window.__frames.length < 100000) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  });
  // (the bot fights him: the hero moves and strikes as a player would)
  await page.evaluate(() => { const d = window.__dbg; if (d.bot) d.bot(true); });
  const t0 = Date.now();
  let k = 0;
  while (Date.now() - t0 < secs * 1000) {
    if (film) { await snap(`f${String(k++).padStart(4, '0')}`); await page.waitForTimeout(60); }
    else { await page.waitForTimeout(5000); await snap(`t${String(k++).padStart(2, '0')}`); }
  }
  await page.evaluate(() => { const d = window.__dbg; if (d.bot) d.bot(false); });
  const r = await page.evaluate(() => {
    const f = window.__frames.slice(5);
    const long = f.filter((x) => x > 100);
    const g = window.__dbg.game();
    const b = g.monsters.find((m) => m.boss);
    return { frames: f.length, long: long.length, longest: Math.round(Math.max(...f)), sumLong: Math.round(long.reduce((a, x) => a + x, 0)), phase: b ? b.phase : null, life: b ? Math.round(b.life) : null, painted: window.__dbg.painting ? window.__dbg.painting.frames : null };
  });
  log('frames', JSON.stringify(r));
  if (r.long > 3) log(`!! ${r.long} frames ran over 100 ms (the longest ${r.longest} ms, ${r.sumLong} ms in all)`);
}
