// THE MAGE'S UNIQUE STAVES IN HER HANDS, IN THE GAME (art/staff_skins.ts STAFF_SKINS; made while it was off, so switched on here):
// a film for the owner of her with each staff, put in her hand as a player would (the unique made and put on from her bag), on
// floor 11, the Gate Ward, and stills of her with each in town. Her own staff first, then the Shepherd's Crook, Ebb and Flow,
// Resonance and the Kindling Rod. A page built as the game is: node tools/build_to.mjs dist/staff_look.html
//   node tools/playtest.mjs --file dist/staff_look.html --size 1126x520 --dpr 2 --scenario tools/scenarios/staff_skins_film.mjs \
//     --out /dev/shm/staffs/x
//   python3 tools/staff_skins_film.py /dev/shm/staffs docs/mockups/staff_skins/pictures/staves_in_game.mp4
//   env: OUT (the frames' folder), ONLY (one staff: plain, crook, ebb, resonance, rod), TOWN=0 (no town stills), FILM=0 (no film),
//   HERO=ranger (the Ranger with his unique bows, art/bow_skins.ts: ONLY plain, rainwalker, threefold, poachers, fledgling)
// Each staff's frames, a picture every thirtieth of a second of the game's time: she stands, turns through her eight sides,
// runs, and casts the Wave twice; in its own folder, with a note of what she was holding and what the game says she holds.
import fs from 'node:fs';
import path from 'node:path';
import { log } from './lib.mjs';

const WAYS = [[1, 0], [0.71, 0.71], [0, 1], [-0.71, 0.71], [-1, 0], [-0.71, -0.71], [0, -1], [0.71, -0.71]];
const FPS = 30;
const STAVES = [
  ['plain', null, 'Her own staff'],
  ['crook', 'shepherdscrook', "The Shepherd's Crook"],
  ['ebb', 'tide', 'Ebb and Flow'],
  ['resonance', 'tuningstaff', 'Resonance'],
  ['rod', 'kindlingrod', 'The Kindling Rod'],
];
// (HERO=ranger: the Ranger's unique bows, art/bow_skins.ts, their switch art/heroes.ts BOW_SKINS put on here)
const BOWS = [
  ['plain', null, 'His own bow'],
  ['rainwalker', 'rainwalker', 'The Rainwalker'],
  ['threefold', 'fan', 'Threefold'],
  ['poachers', 'poachersbow', "The Poacher's Bow"],
  ['fledgling', 'fledgling', 'The Fledgling'],
];

export default async function (page, snap) {
  const hero = process.env.HERO || 'mage';
  const WEAPONS = hero === 'ranger' ? BOWS : STAVES;
  const out = process.env.OUT || '/dev/shm/staffs';
  const only = process.env.ONLY || '';
  const [cw, ch] = [150, 110];
  const up = 22;
  fs.mkdirSync(out, { recursive: true });
  const bad = (s) => console.log(`  !! ${s}`);
  await page.evaluate((hero) => {
    const d = window.__dbg; d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.staffSkins.on = true;
    d.bowSkins.on = true;
    d.run(hero, 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, hero);
  await page.waitForTimeout(600);
  const raf = () => page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
  const scr = await page.evaluate(() => ({ w: window.__dbg.screen.w, cw: window.innerWidth }));
  const k = scr.cw / scr.w;
  const clipNow = async () => {
    const s = await page.evaluate(() => { const d = window.__dbg; const h = d.game().hero; return d.at(h.x, h.y); });
    return { x: Math.round(s.x - cw / 2) * k, y: Math.round(s.y - up - ch / 2) * k, width: cw * k, height: ch * k };
  };
  const calm = () => page.evaluate(() => { const f = window.__dbg.renderer && window.__dbg.renderer.figure; if (f) f.wait = 1e9; });
  /** The staff put in her hand as a player puts it on: made, put in her bag, put on from it. What the game says she holds. */
  const hold = (unique) => page.evaluate((unique) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    if (!h.own) h.own = h.gear.mainhand;
    if (!unique) {
      h.gear.mainhand = h.own;
    } else {
      if (h.bag.indexOf(null) < 0) h.bag[0] = null;
      if (!g.giveUnique(unique, 12)) return { why: 'not given' };
      const i = h.bag.findIndex((it) => it && it.unique === unique);
      h.bag[i].reqLevel = 1;
      const why = g.equipFromBag(i);
      if (why) return { why };
    }
    d.panels.open = 'none';
    const it = h.gear.mainhand;
    return { why: null, holds: it ? { name: it.name, unique: it.unique || null, rarity: it.rarity } : null };
  }, unique);

  // ---- in town: a still of her with each staff, facing down and to the right ----
  if (process.env.TOWN !== '0') {
    for (const [id, unique, name] of WEAPONS) {
      if (only && only !== id) continue;
      const said = await hold(unique);
      if (said.why) bad(`${name}: ${said.why}`);
      await page.evaluate(() => { const h = window.__dbg.game().hero; h.fx = 0.71; h.fy = 0.71; });
      await calm();
      await page.waitForTimeout(4000);
      await raf();
      const file = path.join(out, `town_${id}.png`);
      await page.screenshot({ path: file, clip: await clipNow() });
      log('town', `${name}: ${JSON.stringify(said.holds)} → ${file}`);
    }
  }

  // ---- on floor 11: the film ----
  if (process.env.FILM === '0') return;
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.depth = 11; g.cleared = 10; g.enterDungeon();
    g.level.explored.fill(1);
    g.monsters.length = 0;
    g.guide = null;
    g.hero.invuln = 1e9;
    g.hero.fx = 1; g.hero.fy = 0;
  });
  await calm();
  await page.waitForTimeout(6000);
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const f = { t: 0, plan: [] };
    window.__mf = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      h.mana = h.d.maxMana;
      for (const sk of h.skills) if (sk) sk.cd = 0;
      g.monsters.length = 0;
      Object.assign(c, { mx: 0, my: 0, fire: false, cast: false, hold: false, evade: false, face: false, approach: false });
      for (const p of f.plan) {
        if (f.t < p.from || f.t >= p.to) continue;
        if (p.face) { h.fx = p.face[0]; h.fy = p.face[1]; }
        if (p.run) { c.mx = p.run[0]; c.my = p.run[1]; }
        if (p.fire) { c.fire = true; c.aimX = h.x + p.fire[0] * 4; c.aimY = h.y + p.fire[1] * 4; }
      }
      return run(dt, c);
    };
  });
  const home = await page.evaluate(() => { const h = window.__dbg.game().hero; return [h.x, h.y]; });
  const PLAN = [];
  let t = 0;
  const add = (long, what) => { PLAN.push({ from: t, to: t + long, ...what }); t += long; };
  add(1.2, { face: WAYS[1] });
  for (const i of [2, 3, 4, 5, 6, 7, 0, 1]) add(0.4, { face: WAYS[i] });
  add(0.8, { run: [0.71, 0.71] });
  add(0.4, {});
  add(0.8, { run: [-0.71, -0.71] });
  add(0.5, { face: WAYS[1] });
  add(0.12, { fire: [0.71, 0.71] });
  add(1.0, {});
  add(0.12, { fire: [1, 0] });
  add(1.0, { face: WAYS[1] });
  const total = Math.round(t * FPS);
  const notes = [];
  for (const [id, unique, name] of WEAPONS) {
    if (only && only !== id) continue;
    await page.evaluate(([x, y]) => { const d = window.__dbg; d.slowmo = 1; const h = d.game().hero; h.x = x; h.y = y; h.fx = 0.71; h.fy = 0.71; }, home);
    const said = await hold(unique);
    if (said.why) bad(`${name}: ${said.why}`);
    await calm();
    // (her pictures with it painted ahead, as the game does when she puts it on)
    await page.waitForTimeout(8000);
    const dir = path.join(out, id);
    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });
    const c0 = await page.evaluate((plan) => { const d = window.__dbg; d.slowmo = 1e-6; const f = window.__mf; f.plan = plan.map((p) => ({ ...p, from: p.from + f.t, to: p.to + f.t })); return d.clock(); }, PLAN);
    for (let i = 0; i < total; i++) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
      await page.waitForFunction((at) => {
        const d = window.__dbg;
        if (d.clock() < at) return false;
        d.slowmo = 1e-6;
        return true;
      }, c0 + i / FPS, { polling: 'raf', timeout: 600000 });
      await raf();
      await page.screenshot({ path: path.join(dir, `f${String(i).padStart(4, '0')}.png`), clip: await clipNow() });
    }
    const worn = await page.evaluate(() => { const it = window.__dbg.game().hero.gear.mainhand; return it ? { name: it.name, unique: it.unique || null } : null; });
    notes.push({ id, name, holds: worn, frames: total });
    log('film', `${name}: ${total} frames in ${dir} (holds ${JSON.stringify(worn)})`);
  }
  fs.writeFileSync(path.join(out, 'notes.json'), JSON.stringify(notes, null, 2));
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  void snap;
}
