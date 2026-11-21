// THE WARRIOR'S SWIPES AND TWIN AXES, FILMED AS THEY ARE AND AS MENDED (15 Nov 2026, for his film: render/wild.ts WEAPON_LEAPS,
// render/figure.ts TWIN_AXES_SHOWN): the game slowed, a picture of him every 1/30 s of the game's time, each move made twice, the
// switch off ("now") and on ("mended"). Frames to OUT_DIR/<case>_<now|mended>/fNNN.png.
//   OUT_DIR=shots/swipes node tools/playtest.mjs --serve --file dist/wrapped.html --size 844x390 --dpr 2 --scenario tools/scenarios/swipes_film.mjs --out shots/swipes/x
//   CASES: charge,chop,twin
import fs from 'node:fs';
import { log } from './lib.mjs';

const CASES = {
  charge: { talents: ['warhammer'], secs: 1.5, how: 'swipe', way: [0.7071, -0.7071] },
  chop: { talents: ['battleaxe'], secs: 1.5, how: 'swipe', way: [0.7071, -0.7071] },
  twin: { talents: ['battleaxe', 'twinaxes'], secs: 2.4, how: 'throw', way: [0.7071, -0.7071] },
};

export default async function (page) {
  const out = process.env.OUT_DIR || 'shots/swipes';
  const cases = (process.env.CASES || 'charge,chop,twin').split(',');
  const ev = (fn, arg) => page.evaluate(fn, arg);
  for (const name of cases) {
    const C = CASES[name];
    for (const mode of ['now', 'mended']) {
      const dir = `${out}/${name}_${mode}`;
      fs.mkdirSync(dir, { recursive: true });
      await ev(({ C, on }) => {
        const D = window.__dbg;
        D.saving(false);
        D.weaponLeaps.on = on;
        D.twinAxesShown.on = on;
        D.run('warrior', 9);
        D.autoLevel = false; D.autoWords = false; D.god = true;
        D.seasoned(30);
        const g = D.game();
        for (const t of C.talents) g.takeTalent(t);
        g.depth = 2; g.cleared = 1; g.enterDungeon();
      }, { C, on: mode === 'mended' });
      await page.waitForTimeout(6000);
      await ev((C) => {
        const g = window.__dbg.game();
        const h = g.hero;
        const f = g.level.floor;
        let best = null;
        for (let ty = 4; ty < f.h - 4 && !best; ty++) for (let tx = 4; tx < f.w - 4 && !best; tx++) {
          let ok = true;
          for (let dy = -4; dy <= 4 && ok; dy++) for (let dx = -4; dx <= 4 && ok; dx++) if (g.level.walk[(ty + dy) * f.w + tx + dx] !== 1) ok = false;
          if (ok && Math.hypot(tx - h.x, ty - h.y) < 40) best = { x: tx + 0.5 - C.way[0] * 3, y: ty + 0.5 - C.way[1] * 3 };
        }
        if (best) { h.x = best.x; h.y = best.y; }
        h.fx = C.way[0]; h.fy = C.way[1];
        g.monsters.length = 0;
        g.projectiles.length = 0;
      }, C);
      for (let i = 0; i < 10; i++) { await ev(() => { const g = window.__dbg.game(); g.hero.life = g.hero.d.maxLife; }); await page.waitForTimeout(200); }
      await ev(() => {
        const D = window.__dbg; const g = D.game(); const h = g.hero;
        h.swingT = 0; h.mana = h.d.maxMana;
        for (const s of h.skills) { s.cd = 0; s.charges = Math.max(1, s.maxCharges ?? s.charges); }
        D.slowmo = 0.2;
      });
      const t0 = await ev(() => window.__dbg.game().time);
      await ev(({ C }) => {
        const g = window.__dbg.game(); const h = g.hero; const tx = h.x + C.way[0] * 5; const ty = h.y + C.way[1] * 5;
        if (C.how === 'swipe') g.useEvasive(tx, ty, { mx: 0, my: 0, aimX: tx, aimY: ty, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: true, evadeX: tx, evadeY: ty, potion: false, interact: false });
        else g.useSkill(1, tx, ty);
      }, { C });
      let n = 0;
      const times = [];
      for (let k = 0; k < 4000; k++) {
        const t = await ev(() => { const g = window.__dbg.game(); g.hero.life = g.hero.d.maxLife; return g.time; });
        if (t - t0 > C.secs) break;
        if (t - t0 < n / 30) { await page.waitForTimeout(8); continue; }
        const at = await ev(() => { const D = window.__dbg; const h = D.game().hero; const p = D.at(h.x, h.y); return D.screen.toClient(p.x, p.y); });
        const clip = { x: Math.max(0, Math.min(844 - 300, Math.round(at.x - 150))), y: Math.max(0, Math.min(390 - 230, Math.round(at.y - 150))), width: 300, height: 230 };
        await page.screenshot({ path: `${dir}/f${String(n).padStart(3, '0')}.png`, clip });
        times.push(t - t0);
        n++;
      }
      await ev(() => { window.__dbg.slowmo = 1; });
      log(`${name} ${mode}`, `${n} frames`);
    }
  }
}
