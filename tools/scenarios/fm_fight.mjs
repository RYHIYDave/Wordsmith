// THE FLESHMANCER, IN A REAL FIGHT, filmed for him in the game itself at his phone's size: floor 5 come to, his hall, the hero played
// by the game's own automatic player and made unhurtable; the fight as it is; then he falls. A frame every thirtieth of the game's
// second (STILLS=1: every half second); tools/f9_bosses_cut.py makes the film.
//   node tools/build_to.mjs dist/fm.html
//   node tools/playtest.mjs --file dist/fm.html --touch --size 852x393 --dpr 2 --scenario tools/scenarios/fm_fight.mjs --out shots/fm/f
//   env SECS (the fight's, 30), CLS (warrior), SEED (5), OLD=1 (his pictures as they were, where a switch of his is new)
import { log } from './lib.mjs';

const FPS = 30;

export default async function (page, snap) {
  const secs = Number(process.env.SECS || 30);
  const info = await page.evaluate(([cls, seed, old]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    const asIs = d.fm2 ? d.fm2.sw.on : null;
    if (d.fm2) d.fm2.use(!old);
    d.run(cls, seed);
    d.seasoned(5);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    if (d.floorNames) d.floorNames(false);
    const g = d.game();
    g.talentsLeft = () => 0;
    g.hero.ring = true;
    g.hero.pending = 0;
    g.guide = null;
    g.depth = 5;
    g.cleared = 4;
    g.wayDepth = 5;
    g.enterDungeon();
    g.talentsLeft = () => 0;
    g.hero.invuln = 1e9;
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    g.monsters.splice(0, g.monsters.length, ...g.monsters.filter((m) => !m.dead));
    const b = g.monsters.find((m) => m.boss);
    const sp = g.spotsRound(b.x, b.y, 60).find((q) => Math.hypot(q.x - b.x, q.y - b.y) > 3.5 && Math.hypot(q.x - b.x, q.y - b.y) < 6 && g.sees(q.x, q.y, b.x, b.y));
    if (sp) { g.hero.x = sp.x; g.hero.y = sp.y; }
    g.bossMet = true;
    g.level.explored.fill(1);
    b.life = b.maxLife = 1e7;
    return { boss: b.kind, at: [b.x, b.y], sw: d.fm2 ? d.fm2.sw.on : null, asIs };
  }, [process.env.CLS || 'warrior', Number(process.env.SEED || 5), process.env.OLD === '1']);
  log('floor 5', JSON.stringify(info));
  const stills = process.env.STILLS === '1';
  await page.waitForFunction(() => window.__dbg.game().time > 3, null, { timeout: 180000 });
  await page.evaluate(() => { const d = window.__dbg; d.bot(true); });
  await page.waitForTimeout(300);
  const parts = [[0, 'THE FLESHMANCER: A FIGHT']];
  let frame = 0;
  const film = async (n) => {
    const c0 = await page.evaluate(() => window.__dbg.clock());
    for (let i = 0; i < n; i++) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
      await page.waitForFunction((t) => { const d = window.__dbg; if (d.clock() < t) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
      if (!stills || i % 15 === 0) await snap(`f${String(frame).padStart(4, '0')}`);
      frame++;
      if (i % 30 === 0) log('at', frame, JSON.stringify(await page.evaluate(() => { const b = window.__dbg.game().monsters.find((m) => m.boss); return b ? [b.state, b.act && b.act.id] : null; })));
    }
  };
  await film(Math.round(secs * FPS));
  parts.push([frame, 'THE FLESHMANCER FALLS']);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.bot(false);
    const g = d.game();
    const b = g.monsters.find((m) => m.boss && !m.dead);
    if (b) g.kill(b);
  });
  await film(Math.round(5 * FPS));
  snap.note('film', { fps: FPS, parts });
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
