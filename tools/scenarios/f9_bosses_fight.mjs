// FLOOR 9'S SIDE BOSSES IN A REAL FIGHT (game/act1_rules/f9_bosses.ts, behind F9_LAIRS), filmed for him in the game itself at his phone's
// size: the hero played by the game's own automatic player (dev/bot.ts: he goes at it and fights), made unhurtable; the boss fighting as
// it does, its moves as they come; then it falls. A frame every thirtieth of the game's second; tools/f9_bosses_cut.py makes the film.
//   node tools/build_to.mjs dist/f9bosses.html
//   BOSS=warchief node tools/playtest.mjs --file dist/f9bosses.html --touch --size 852x393 --dpr 2 --scenario tools/scenarios/f9_bosses_fight.mjs --out shots/f9fight/c
//   env BOSS (warchief, mistwolf), SECS (the fight's, 24), CLS, SEED
import { log } from './lib.mjs';

const FPS = 30;

export default async function (page, snap) {
  const cls = process.env.CLS || 'brawler';
  const seed = Number(process.env.SEED || 9);
  const kind = process.env.BOSS || 'warchief';
  const secs = Number(process.env.SECS || 24);
  const title = kind === 'warchief' ? 'THE TROLL CHIEFTAIN' : 'THE MIST WOLF';
  const at = await page.evaluate(([cls, seed]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.f9Bosses.sw.on = true;
    d.run(cls, seed);
    d.seasoned(14);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    if (d.floorNames) d.floorNames(false);
    const g = d.game();
    g.talentsLeft = () => 0;
    g.depth = 9;
    g.cleared = 8;
    g.enterDungeon();
    g.talentsLeft = () => 0;
    return { depth: g.depth, bosses: d.f9Bosses.list() };
  }, [cls, seed]);
  log('floor', JSON.stringify(at));
  await page.waitForFunction(() => window.__dbg.game().time > 9, null, { timeout: 180000 });
  // (every other monster gone, the floor's traps too; the hero brought in front of it, in its area; the other far off and still)
  const where = await page.evaluate((kind) => {
    const d = window.__dbg;
    const g = d.game();
    for (const m of g.monsters) if (m.kind !== 'warchief' && m.kind !== 'mistwolf') m.dead = true;
    g.monsters.splice(0, g.monsters.length, ...g.monsters.filter((m) => !m.dead));
    g.traps.length = 0;
    if (g.level.hazards) g.level.hazards.length = 0;
    g.level.explored.fill(1);
    const m = g.monsters.find((q) => q.kind === kind);
    const o = g.monsters.find((q) => q.kind !== kind);
    if (o) {
      o.x = 2.5;
      o.y = 2.5;
      o.cd = 1e9;
      o.state = 'sleep';
    }
    m.life = m.maxLife = 1e7;
    m.words = [];
    // (the fight in the open middle of its area: the hero there, it a few steps off toward where it waited, facing him)
    const h = g.hero;
    const area = g.level.land.areas.find((a) => a.role === (kind === 'warchief' ? 'lair' : 'side'));
    const near = (x, y) => {
      for (let r = 0; r <= 4; r += 0.5) for (let a = 0; a < 16; a++) {
        const xx = x + Math.cos(a) * r;
        const yy = y + Math.sin(a) * r;
        if (g.isOpen(xx, yy)) return { x: xx, y: yy };
      }
      return { x, y };
    };
    const mid = near(area.blob.x, area.blob.y);
    const dx = m.x - mid.x;
    const dy = m.y - mid.y;
    const dd = Math.hypot(dx, dy) || 1;
    const back = Math.min(4, dd);
    const at = near(mid.x + (dx / dd) * back, mid.y + (dy / dd) * back);
    h.x = mid.x;
    h.y = mid.y;
    m.x = at.x;
    m.y = at.y;
    m.fx = (h.x - m.x) / (Math.hypot(h.x - m.x, h.y - m.y) || 1);
    m.fy = (h.y - m.y) / (Math.hypot(h.x - m.x, h.y - m.y) || 1);
    d.bot(true);
    return { m: [m.x, m.y], h: [h.x, h.y] };
  }, kind);
  log('where', JSON.stringify(where));
  await page.waitForTimeout(400);
  const parts = [[0, `${title}: A FIGHT`]];
  let frame = 0;
  const film = async (n) => {
    const c0 = await page.evaluate(() => window.__dbg.clock());
    for (let i = 0; i < n; i++) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
      await page.waitForFunction((t) => { const d = window.__dbg; if (d.clock() < t) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
      await snap(`f${String(frame).padStart(4, '0')}`);
      frame++;
      if (i % 30 === 0) log('at', frame, JSON.stringify(await page.evaluate(() => window.__dbg.f9Bosses.list().map((b) => [b.kind, b.state, b.act && b.act.id, Math.round(b.rage * 10) / 10]))));
    }
  };
  await film(Math.round(secs * FPS));
  // (and it falls)
  parts.push([frame, `${title} FALLS`]);
  await page.evaluate((kind) => {
    const d = window.__dbg;
    d.bot(false);
    d.f9Bosses.kill(kind);
  }, kind);
  await film(Math.round(3.4 * FPS));
  snap.note('film', { fps: FPS, parts });
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
