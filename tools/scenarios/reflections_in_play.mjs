// FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW, IN PLAY (the queue's wire-floor-18-new-reflections; REFLECTIONS_UP on in
// the page: tools/reflections_try_page.mjs): a hero of level 24 on the floor itself (nothing can kill him), before a mirror in a
// gallery; one of his reflections wakes, steps out of the glass and fights him with his class's own two blows while he stands
// his ground and now and then walks round it (so that it turns to him), until at `SECS` - 2 it can be broken and the test bot,
// fighting for him, shatters it. A picture every thirtieth
// of a second of the game's time, for the film (python3 tools/reflections_play_film.py).
//   CLS=warrior WEAPON=battleaxe node tools/playtest.mjs --file dist/try_reflections.html --touch --size 852x393 --dpr 2 --scenario tools/scenarios/reflections_in_play.mjs --out shots/rplay/warrior_axe/f
// env: CLS (warrior), WEAPON (the Warrior's: battleaxe, warhammer, or none: his great sword), SECS (9), DIST (how far out from the
// mirror he stands, 3.2: further for one whose hold is made from further off, a volley, an orb, a thrown axe, a vial).
const FPS = 30;
/** When he walks, and which way (seconds into the film; the keys' ways on the screen). */
const WALKS = [[2.6, 'KeyD'], [4.4, 'KeyS'], [5.6, 'KeyA'], [6.4, 'KeyW']];
export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const weapon = process.env.WEAPON || '';
  const seconds = Number(process.env.SECS || 9);
  const set = await page.evaluate(([cls, weapon]) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false;
    d.run(cls, 3); d.seasoned(24); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.high(true, 18);
    const g = d.game();
    g.level.explored.fill(1);
    if (d.fx && d.fx.messages) d.fx.messages.length = 0;
    for (const m of g.monsters) if (!m.boss) m.dead = true; g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
    const took = weapon ? g.takeTalent(weapon) ?? 'taken' : 'none';
    return { took, talents: g.hero.talents.slice(), skills: g.hero.skills.map((s) => s.id) };
  }, [cls, weapon]);
  console.log('set', JSON.stringify(set));
  // (the floor's name gone from the screen, his pictures painted)
  await page.waitForTimeout(Number(process.env.WAIT || 6000));
  // (before a mirror in a gallery past the first: the hero three tiles out, one reflection woken beside the glass)
  const placed = await page.evaluate((out) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const L = g.level; const G = L.land.gallery;
    const mirrors = L.props.filter((p) => p.name === 'a tall mirror' && (p.variant >> 1) === 0);
    const inRoom = (p, q) => p.tx >= q.r[0] && p.ty >= q.r[1] && p.tx < q.r[2] && p.ty < q.r[3];
    const galleries = G.rooms.filter((r) => r.role === 'gallery' && r.path > 1);
    const q = galleries[1 % galleries.length];
    const ms = mirrors.filter((p) => inRoom(p, q));
    const p = ms[Math.floor(ms.length / 2)] ?? mirrors[1];
    const f = p.variant & 1;
    const at = f === 0 ? { x: p.tx + 0.5, y: p.ty + out, fx: 0, fy: 1 } : { x: p.tx + out, y: p.ty + 0.5, fx: 1, fy: 0 };
    h.x = at.x; h.y = at.y;
    const m = g.spawn('reflection', at.x + at.fy * 1.4 - 1.6 * at.fx, at.y + at.fx * 1.4 - 1.6 * at.fy, 960, 0, false, g.rng);
    m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 1e6; m.state = 'chase';
    g.wakeUp(m);
    window.__refl = m;
    // (he stands his ground while it fights him, and walks round it now and then, so that it turns to him: the bot only at the end)
    d.bot(false);
    return { form: m.form, at: [m.x.toFixed(1), m.y.toFixed(1)], hero: [h.x.toFixed(1), h.y.toFixed(1)] };
  }, Number(process.env.DIST || 3.2));
  console.log('placed', JSON.stringify(placed));
  snap.note('film', { fps: FPS, cls, weapon, form: placed.form, size: await page.evaluate(() => [innerWidth, innerHeight]) });
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(seconds * FPS);
  const seen = new Set();
  for (let i = 0; i < total; i++) {
    // (at SECS - 2 it can be broken: his next blow shatters it)
    if (i === Math.round((seconds - 2) * FPS)) await page.evaluate(() => { const m = window.__refl; if (m && !m.dead) { m.life = 1; m.maxLife = 900; } window.__dbg.bot(true); });
    // (his walks round it: a key held for half a second of the game's time, each a quarter of the way round)
    for (const [at, key] of WALKS) {
      if (i === Math.round(at * FPS)) await page.keyboard.down(key);
      if (i === Math.round((at + 0.45) * FPS)) await page.keyboard.up(key);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    await snap(`f${String(i).padStart(4, '0')}`);
    const now = await page.evaluate(() => { const m = window.__refl; return m ? `${m.dead ? 'dead' : m.act ? m.act.id.split(':')[1] : m.anim}` : '-'; });
    if (!seen.has(now)) {
      seen.add(now);
      console.log(`  ${(i / FPS).toFixed(2)} s`, now);
    }
  }
  await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1; d.bot(false); });
}
