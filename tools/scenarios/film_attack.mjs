// A hero's attack, filmed in the game: the hero in the practice room with one monster that cannot
// die stood in front of them, a picture every thirtieth of a second of the GAME's time (the game
// is slowed so that the camera can keep up). Frames go to <out>_f000.png ...
//   CLS=warrior|ranger|mage  SKILL=0|1  DX=40 DY=20 (where the monster stands, in game pixels from
//   the hero)  SECONDS=0.9  WEAPON=sword|greatsword|bow|staff|wand  HOLD=seconds a held attack is held
export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const weapon = process.env.WEAPON || '';
  await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, [cls]);
  await page.waitForTimeout(400);
  const dx = Number(process.env.DX || 40), dy = Number(process.env.DY || 20);
  const id = await page.evaluate(([dx, dy, weapon, behind, front, skill]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    if (weapon && (!h.gear.mainhand || h.gear.mainhand.weapon !== weapon)) {
      const i = h.bag.findIndex((it) => it && it.weapon === weapon);
      if (i < 0) throw new Error('no ' + weapon + ' in the bag');
      const said = g.equipFromBag(i);
      if (said) throw new Error(said);
    }
    // (BEHIND=word, FRONT=word: a word set behind or in front of the attack that is filmed)
    for (const [side, w] of [['behind', behind], ['front', front]]) {
      if (!w) continue;
      h.words[w] = (h.words[w] || 0) + 1;
      const why = g.socket(skill === 9 ? 2 : skill, side, w);
      if (why) throw new Error(side + ' ' + w + ': ' + why);
    }
    const x = h.x + (dx / 16 + dy / 8) / 2; const y = h.y + (dy / 8 - dx / 16) / 2;
    const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
    g.wakeUp(m);
    m.life = m.maxLife = 1e7;
    m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9;
    const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
    h.fx = -m.fx; h.fy = -m.fy;
    return m.id;
  }, [dx, dy, weapon, process.env.BEHIND || '', process.env.FRONT || '', Number(process.env.SKILL || 0)]);
  console.log('stood', id, await page.evaluate(() => { const h = window.__dbg.game().hero; return JSON.stringify(h.skills.map((s) => s && s.id)); }));
  await page.waitForTimeout(Number(process.env.WAIT || 6500));
  const slow = 0.1;
  const FPS = 30;
  const step = 1000 / FPS / slow;
  const seconds = Number(process.env.SECONDS || 0.9);
  const before = 6;
  const total = before + Math.ceil(seconds * FPS);
  const skill = Number(process.env.SKILL || 0);
  const hold = Number(process.env.HOLD || 0);
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (i === before) await page.evaluate(([id, skill, hold]) => {
      const g = window.__dbg.game(); const m = g.monsters.find((m) => m.id === id); const h = g.hero;
      h.mana = h.d.maxMana; for (const s of h.skills) if (s) s.cd = 0;
      window.__film = { id, skill, left: hold, x: m.x, y: m.y };
      if (hold > 0) {
        // (a held attack goes on for as long as the button is down: hold it down for them)
        const run = g.update.bind(g);
        g.update = (dt, c) => { const f = window.__film; if (f.left > 0) { f.left -= dt; c.hold = true; c.castX = f.x; c.castY = f.y; } return run(dt, c); };
      }
      // (SKILL=9: the evasive move, toward a spot just short of the monster)
      if (skill === 9) { const c = window.__dbg.input ? {} : {}; g.useEvasive(h.x + (m.x - h.x) * 0.75, h.y + (m.y - h.y) * 0.75, { evade: true, hold: false, mx: 0, my: 0 }); }
      else if (skill === 0) g.useBasic(m.x, m.y); else g.useSkill(skill, m.x, m.y);
    }, [id, skill, hold]);
    // (MIGHT=n: the hero holds n stacks of the Power word's might all through, to film what goes round them)
    if (process.env.MIGHT) await page.evaluate((n) => { const f = window.__dbg.fx; f.might.stacks = n; f.might.t = 5; }, Number(process.env.MIGHT));
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  console.log('late by', Date.now() - (t0 + (total - 1) * step), 'ms at the end');
}
