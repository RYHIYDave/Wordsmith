// THE SKELETON ON THE HEROES' BONES (art/monster_bones3.ts, a mock-up: not in the game), in the
// game: skeletons stood round the hero in the practice room, one in each of the four ways a figure
// faces, photographed as the game draws them. BONES=1 throws the mock-up's switch for this page
// only (window.__dbg.skeleton3); without it they are today's skeletons.
//   node tools/build_to.mjs dist/sk3.html
//   node tools/playtest.mjs --file dist/sk3.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/skeleton3.mjs --out shots/sk3/game_now
//   BONES=1 node tools/playtest.mjs ... --out shots/sk3/game_bones
//   env: WHO = figure@across,down;... in game pixels from the hero (default: four round him)
//        DO  = stand | walk | strike | die: what they are doing when photographed
//        FILM=n: n pictures, a thirtieth of a second of the game's time apart (the game slowed so that the camera keeps up)
//        WAIT = milliseconds to let the room settle and the frames be painted first
// A note beside the pictures (<out>_where.json) says where on the screen each one's feet are.
export default async function (page, snap) {
  const bones = process.env.BONES === '1';
  await page.evaluate((bones) => {
    const d = window.__dbg; d.saving(false); d.skeleton3.on = bones; d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  }, bones);
  await page.waitForTimeout(400);
  const who = (process.env.WHO || 'a@-58,-34;b@58,-34;c@-58,34;d@58,34').split(';');
  const doing = process.env.DO || 'stand';
  const ids = [];
  for (const one of who) {
    const [, at] = one.split('@');
    const [dx, dy] = at.split(',').map(Number);
    const id = await page.evaluate(([dx, dy]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      const x = h.x + (dx / 16 + dy / 8) / 2; const y = h.y + (dy / 8 - dx / 16) / 2;
      if (g.level.open[Math.floor(y) * g.level.floor.w + Math.floor(x)] !== 1) return null;
      const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7;
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.speed = 0;
      const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
      return m.id;
    }, [dx, dy]);
    ids.push(id);
  }
  console.log('stood', JSON.stringify(ids), bones ? 'ON THE BONES' : "today's");
  // (the words that come up when the room is entered have gone, and the frames are painted)
  await page.waitForTimeout(Number(process.env.WAIT || 6000));
  const where = await page.evaluate((ids) => {
    const d = window.__dbg; const g = d.game();
    return ids.map((id) => { const m = g.monsters.find((k) => k.id === id); if (!m) return null; const p = d.at(m.x, m.y); return { id, x: p.x, y: p.y }; });
  }, ids);
  snap.note('where', { where, scale: await page.evaluate(() => window.__dbg.screen.scale ?? null) });
  const film = Number(process.env.FILM || 0);
  if (!film) {
    if (doing === 'walk') await page.evaluate((ids) => { const g = window.__dbg.game(); for (const m of g.monsters) if (ids.includes(m.id)) { m.anim = 'walk'; m.animT = 0.25; } }, ids);
    await page.waitForTimeout(300);
    await snap('still');
    return;
  }
  const slow = 0.08;
  const step = 1000 / 30 / slow;
  await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
  const t0 = Date.now();
  for (let i = 0; i < film; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (i === 3) {
      await page.evaluate(([ids, doing]) => {
        const d = window.__dbg; const g = d.game();
        for (const m of g.monsters) {
          if (!ids.includes(m.id)) continue;
          if (doing === 'die') g.kill(m);
          else if (doing === 'strike') { m.cd = 0; m.state = 'idle'; m.t = 0; }
          else if (doing === 'walk') { m.anim = 'walk'; }
        }
      }, [ids, doing]);
    }
    await snap(`f${String(i).padStart(3, '0')}`);
  }
}
