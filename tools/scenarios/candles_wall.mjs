// FLOOR 1'S GUTTERING CANDLES AGAINST A WALL (game/first5.ts CANDLES_BY_WALL, off): floor 1 laid with the switch off and on, for
// two runs; the hero a little before where the candles stand; a picture of each. '!!' where the candles are not against a wall.
//   node tools/build_to.mjs dist/heroes.html
//   node tools/playtest.mjs --file dist/heroes.html --size 844x390 --dpr 2 --scenario tools/scenarios/candles_wall.mjs --out shots/candles/a
import { log } from './lib.mjs';

export default async function (page, snap) {
  for (const seed of [3, 11]) {
    for (const on of [false, true]) {
      await page.evaluate(([seed, on]) => { const d = window.__dbg; d.saving(false); d.candlesByWall.on = on; d.run('warrior', seed); d.autoLevel = false; d.autoWords = false; d.god = true; }, [seed, on]);
      await page.waitForTimeout(600);
      const at = await page.evaluate(() => {
        const g = window.__dbg.game();
        g.guide = null;
        g.depth = 1; g.cleared = 0; g.enterDungeon();
        g.hero.invuln = 1e9;
        for (const m of g.monsters) m.dead = true;
        g.level.explored.fill(1);
        const host = (g.level.dress?.moments ?? []).find((m) => m.n === 2);
        if (!host) return null;
        const f = g.level.floor;
        const tx = Math.floor(host.x), ty = Math.floor(host.y);
        const wallBack = f.tiles[(ty - 1) * f.w + tx] === 2 || f.tiles[ty * f.w + tx - 1] === 2;
        g.hero.x = host.x + 2.6; g.hero.y = host.y + 2.6;
        const near = [];
        for (let dy = -2; dy <= 2; dy++) { let row = ''; for (let dx = -2; dx <= 2; dx++) row += f.tiles[(ty + dy) * f.w + tx + dx]; near.push(row); }
        return { x: host.x, y: host.y, wallBack, near: near.join('/'), cut: g.level.cut ? [g.level.cut[(ty - 1) * f.w + tx], g.level.cut[ty * f.w + tx - 1]] : null };
      });
      log(`seed ${seed} ${on ? 'on' : 'off'}`, JSON.stringify(at));
      if (!at) { log('!! no candles on this floor'); continue; }
      if (on && !at.wallBack) log('!! the candles are not against a wall');
      // (the floor's name gone from the screen first)
      await page.waitForTimeout(6000);
      await snap(`s${seed}_${on ? 'on' : 'off'}`);
    }
  }
}
