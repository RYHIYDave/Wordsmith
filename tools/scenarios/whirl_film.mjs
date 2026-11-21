// THE WARRIOR'S WHIRL, FILMED (fix/whirl-spin): the game slowed, each frame a sharp screenshot round him with the game's clock, three
// Whirls. Run on a page at --size 844x390 --dpr 3 with OUT_DIR set (where the frames go, and times.json). Each Whirl should show
// him swept once round by his greatsword (WHIRL_SPIN on), never the overhead Slam. Made for his film of 14 Nov 2026.
import fs from 'node:fs';
export default async function (page) {
  const out = process.env.OUT_DIR;
  fs.mkdirSync(out, { recursive: true });
  const ev = (fn, arg) => page.evaluate(fn, arg);
  await ev(() => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', 5);
    D.seasoned(10);
    D.god = true;
    const g = D.game();
    g.depth = 2;
    g.cleared = 1;
    g.enterDungeon();
  });
  await page.waitForTimeout(800);
  await ev(() => {
    const g = window.__dbg.game();
    const h = g.hero;
    const f = g.level.floor;
    let best = null;
    for (let ty = 2; ty < f.h - 2 && !best; ty++) for (let tx = 2; tx < f.w - 2 && !best; tx++) {
      let ok = true;
      for (let dy = -2; dy <= 2 && ok; dy++) for (let dx = -2; dx <= 2 && ok; dx++) if (g.level.walk[(ty + dy) * f.w + tx + dx] !== 1) ok = false;
      if (ok && Math.hypot(tx - h.x, ty - h.y) < 30) best = { x: tx + 0.5, y: ty + 0.5 };
    }
    if (best) { h.x = best.x; h.y = best.y; }
    h.fx = 0.7071;
    h.fy = 0.7071;
    // (no one about: the move alone, clear to see)
    g.monsters = [];
  });
  // (the floor's name gone, everything settled)
  for (let i = 0; i < 28; i++) {
    await ev(() => { const g = window.__dbg.game(); g.hero.life = g.hero.d.maxLife; for (const m of g.monsters) m.stunT = 999; });
    await page.waitForTimeout(250);
  }
  const clip = { x: 322, y: 100, width: 200, height: 150 };
  const times = [];
  let n = 0;
  for (let spin = 0; spin < 3; spin++) {
    await ev(() => {
      const D = window.__dbg;
      const g = D.game();
      const h = g.hero;
      h.mana = h.d.maxMana;
      h.life = h.d.maxLife;
      for (const s of h.skills) { s.cd = 0; s.charges = Math.max(1, s.charges); }
      for (const m of g.monsters) { m.stunT = 999; m.life = m.maxLife; }
      D.slowmo = 0.12;
      g.useSkill(1, h.x + h.fx, h.y + h.fy);
    });
    const t0 = await ev(() => window.__dbg.game().time);
    for (;;) {
      const t = await ev(() => { const g = window.__dbg.game(); g.hero.life = g.hero.d.maxLife; return g.time; });
      if (t - t0 > 0.9) break;
      await page.screenshot({ path: `${out}/f${String(n).padStart(4, '0')}.png`, clip });
      times.push(t);
      n++;
    }
    await ev(() => { window.__dbg.slowmo = 1; });
    await page.waitForTimeout(300);
  }
  fs.writeFileSync(`${out}/times.json`, JSON.stringify(times));
  const skills = await ev(() => window.__dbg.game().hero.skills.map((s) => s.id).join(','));
  console.log(`  ${n} frames; skills ${skills}`);
}
