// THE CRYPT'S FLOORS (art/crypt.ts, behind CRYPT, off): a picture of rooms of dungeons 1 to 4 as
// they would look with it on, and the same rooms of dungeon 1 as the game has them now. Nothing to
// fight (the monsters are taken out), the whole map seen. For looking at, not a test.
//   node tools/playtest.mjs --file dist/crypt.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/crypt_floors.mjs --out shots/crypt/game
//   DEPTHS=1,2,3,4  SEED=9  STOPS=2 (rooms a floor)  CLS=warrior  OFF=1 (dungeon 1 with it off, first)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED) || 9;
  const stops = Number(process.env.STOPS) || 2;
  const depths = (process.env.DEPTHS || '1,2,3,4').split(',').map(Number);
  await page.evaluate(([c, s]) => { const d = window.__dbg; d.saving(false); d.run(c, s); d.autoLevel = false; d.autoWords = false; d.god = true; }, [cls, seed]);
  await page.waitForTimeout(600);
  const visit = async (dep, on, tag) => {
    await page.evaluate(([d, o]) => {
      window.__dbg.crypt(o);
      const g = window.__dbg.game(); g.depth = d; g.cleared = d; g.enterDungeon();
      g.level.explored.fill(1);
      g.monsters.splice(0);
    }, [dep, on]);
    await page.waitForTimeout(700);
    const rooms = await page.evaluate(() => {
      const f = window.__dbg.game().level.floor;
      return f.rooms.map((r) => ({ id: r.id, kind: r.kind, x: r.x, y: r.y, w: r.w, h: r.h }));
    });
    // the biggest rooms first (the start and the boss's last)
    const order = [...rooms].filter((r) => r.kind !== 'start' && r.kind !== 'boss').sort((a, b) => b.w * b.h - a.w * a.h);
    let n = 0;
    for (const r of order.slice(0, stops)) {
      const at = await page.evaluate(([px, py]) => {
        const g = window.__dbg.game(); const L = g.level; const f = L.floor; const h = g.hero;
        let best = null; let bd = 1e9;
        for (let ty = Math.floor(py) - 4; ty <= py + 4; ty++) for (let tx = Math.floor(px) - 4; tx <= px + 4; tx++) {
          if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h || L.walk[ty * f.w + tx] !== 1) continue;
          if (L.props.some((p) => p.solid && p.tx === tx && p.ty === ty)) continue;
          const d = Math.hypot(tx + 0.5 - px, ty + 0.5 - py);
          if (d < bd) { bd = d; best = { x: tx + 0.5, y: ty + 0.5 }; }
        }
        if (!best) return null;
        h.x = best.x; h.y = best.y; h.fx = 0.7; h.fy = 0.7;
        return best;
      }, [r.x + r.w / 2, r.y + r.h / 2]);
      if (!at) continue;
      await page.waitForTimeout(500);
      n++;
      await snap(`${tag}_${n}_${r.kind}_${r.w}x${r.h}`);
    }
    log(tag, `${n} picture(s)`);
  };
  if (process.env.OFF === '1') await visit(depths[0], false, `d${depths[0]}_now`);
  for (const d of depths) await visit(d, true, `d${d}_crypt`);
  await page.evaluate(() => window.__dbg.crypt(false));
}
