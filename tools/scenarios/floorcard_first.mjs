// THE FLOOR'S NAME BEFORE THE FIRST DUNGEON'S PROMPT (game/defs.ts FLOOR_CARD_FIRST; main.ts). The owner,
// 12 Oct 2026, 07:45: "One thing I noticed is you cant see the warden level introduction.  It gets hidden by
// the tap to attack pop up". A new player's first floor, the first pack woken a few tiles off so that the
// fight prompt is due at once (FIGHT=1, the default; FIGHT=0 the walking prompt), pictures as the floor's
// name comes and goes. With FLOOR_CARD_FIRST on (CARDFIRST=1) the prompt waits while the name is up.
//   node tools/build_to.mjs dist/card.html
//   CARDFIRST=1 node tools/playtest.mjs --file dist/card.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/floorcard_first.mjs --out shots/card/after
import { log } from './lib.mjs';

export default async function (page, snap) {
  const on = process.env.CARDFIRST === '1';
  const fight = process.env.FIGHT !== '0';
  const cls = process.env.CLS || 'warrior';
  await page.evaluate(([o, c]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.floorCardFirst) d.floorCardFirst(o);
    d.first(c, 5);
    d.god = true;
  }, [on, cls]);
  if (fight) {
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const h = g.hero;
      // the nearest pack, woken and stood a few tiles off, where the hero can see it
      const live = g.monsters.filter((m) => !m.dead && !m.boss);
      live.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y));
      const L = g.level;
      const open = (x, y) => { const tx = Math.floor(x); const ty = Math.floor(y); return tx > 0 && ty > 0 && tx < L.floor.w && ty < L.floor.h && L.walk[ty * L.floor.w + tx] === 1; };
      let n = 0;
      for (const m of live.slice(0, 3)) {
        for (let r = 4; r <= 7 && n < 3; r += 0.5) {
          let put = false;
          for (let k = 0; k < 16; k++) {
            const a = (k / 16) * Math.PI * 2 + n;
            const x = h.x + Math.cos(a) * r; const y = h.y + Math.sin(a) * r;
            if (open(x, y)) { m.x = x; m.y = y; m.state = 'chase'; put = true; break; }
          }
          if (put) { n++; break; }
        }
      }
      g.updateVision(1);
    });
  }
  const t0 = Date.now();
  for (const at of [700, 1700, 2700, 3900, 5200]) {
    const wait = at - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    const s = await page.evaluate(() => ({ step: window.__dbg.game().guideStep() }));
    log(`at ${(at / 1000).toFixed(1)} s`, `prompt due: ${s.step}`);
    await snap(`t${String(at).padStart(4, '0')}`);
  }
}
