// A hero's fall when their life runs out, filmed in the game: the hero in a room with one
// monster stood by them, killed outright, a picture every thirtieth of a second of the screen's
// time (the page is slowed so that the camera can keep up). Frames go to <out>_f000.png ...
//   CLS=warrior|ranger|mage  WEAPON=sword|greatsword|bow|staff|wand (left out: what they start with)
//   DX=34 DY=17   where the monster stands, in pixels of the game from the hero (down the screen
//                 from them, the hero faces us; up it, away)
//   BY=brute      what it is         SECONDS=1.9   how long to film after the blow
//   KILL=0        the blow does not kill: it takes HURT (default 120, before armour) of their life,
//                 enough to rock them back (the art's `reel`). WALK=1: they are walking when it lands.
//   node tools/playtest.mjs --scenario tools/scenarios/film_fall.mjs --file dist/film_now.html --out shots/film/fall_w
export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const weapon = process.env.WEAPON || '';
  await page.evaluate(([cls]) => {
    const d = window.__dbg; d.saving(false); d.practice(cls, 7); d.autoLevel = false; d.autoWords = false;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, [cls]);
  await page.waitForTimeout(400);
  const dx = Number(process.env.DX || 34), dy = Number(process.env.DY || 17);
  const id = await page.evaluate(([dx, dy, weapon, by]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    if (weapon && (!h.gear.mainhand || h.gear.mainhand.weapon !== weapon)) {
      const i = h.bag.findIndex((it) => it && it.weapon === weapon);
      if (i < 0) throw new Error('no ' + weapon + ' in the bag');
      const said = g.equipFromBag(i);
      if (said) throw new Error(said);
    }
    const x = h.x + (dx / 16 + dy / 8) / 2; const y = h.y + (dy / 8 - dx / 16) / 2;
    const m = g.spawn(by, x, y, 1, 0, false, g.rng);
    g.wakeUp(m);
    m.life = m.maxLife = 1e7;
    m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9;
    const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
    h.fx = -m.fx; h.fy = -m.fy;
    return m.id;
  }, [dx, dy, weapon, process.env.BY || 'brute']);
  console.log('stood', id);
  // (the words that come up when the room is entered have gone by the time the film starts)
  await page.waitForTimeout(Number(process.env.WAIT || 6500));
  const slow = 0.1;
  const FPS = 30;
  const step = 1000 / FPS / slow;
  const seconds = Number(process.env.SECONDS || 1.9);
  const before = 10;
  const total = before + Math.ceil(seconds * FPS);
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  if (process.env.WALK === '1') await page.keyboard.down('KeyD');
  const t0 = Date.now();
  for (let i = 0; i < total; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    // (the practice room only knocks the wind out of a hero: for the film it is a dungeon like any other)
    if (i === before && process.env.KILL === '0') await page.evaluate(([id, hurt]) => { const g = window.__dbg.game(); g.hurtHero(hurt, 'phys', [], g.monsters.find((m) => m.id === id) || null); }, [id, Number(process.env.HURT || 120)]);
    else if (i === before) await page.evaluate((id) => { const g = window.__dbg.game(); g.practice = false; g.hero.life = 1; g.hurtHero(60, 'phys', [], g.monsters.find((m) => m.id === id) || null); }, id);
    await snap(`f${String(i).padStart(3, '0')}`);
  }
  if (process.env.WALK === '1') await page.keyboard.up('KeyD');
  console.log('late by', Date.now() - (t0 + (total - 1) * step), 'ms at the end', 'over:', await page.evaluate(() => window.__dbg.game().over));
}
