// THE MONSTER PACKS (Version 19.7; game/defs.ts, MONSTER_PACKS and PACKS): how a blue pack and a
// yellow pack are told apart, photographed for the owner (pictures first: the look, PACK_LOOK, had
// his yes by 9 Oct, 09:46). In the practice room, a blue pack of Flame skeletons and a yellow pack
// of skeletons whose leader has Frost, with the look off and on; then in a real dungeon, a blue pack
// and a yellow pack where the map-maker put them. It puts the switch back as it found it. Not part
// of tools/regress.sh.
//   node tools/build_to.mjs dist/packs.html
//   node tools/playtest.mjs --file dist/packs.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/packs_look.mjs --out shots/packs/ph
//   node tools/playtest.mjs --file dist/packs.html --scenario tools/scenarios/packs_look.mjs --out shots/packs/pc
import { log } from './lib.mjs';

export default async function (page, snap) {
  const bad = (s) => console.log(`  !! ${s}`);
  const check = (what, cond, more = '') => { if (cond) console.log(`  ok ${what}${more !== '' ? `   (${more})` : ''}`); else bad(`${what}${more !== '' ? `   (${more})` : ''}`); return !!cond; };
  await page.evaluate(() => { window.__dbg.saving(false); });
  await page.waitForTimeout(400);
  const lookWas = await page.evaluate(() => window.__dbg.packLook.on);
  check('the look of the packs is on in the game', lookWas === true);
  await page.evaluate(() => { window.__dbg.packLook.on = false; });

  // ---- 1. the practice room: a blue pack (left) and a yellow pack (right), standing still ----------
  await page.evaluate(() => {
    const d = window.__dbg; d.practice('warrior', 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(400);
  const placed = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    g.monsters.length = 0;
    const at = (dx, dy) => ({ x: h.x + (dx / 16 + dy / 8) / 2, y: h.y + (dy / 8 - dx / 16) / 2 });
    const stand = (m) => { g.wakeUp(m); m.life = m.maxLife; m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; const f = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / f; m.fy = (h.y - m.y) / f; };
    // (the first of each is the one that bears the name: up and clear of the room's words on the left)
    const blue = [[-80, -84], [-120, -100], [-128, -62], [-48, -58], [-160, -86]];
    const yellow = [[110, -70], [150, -88], [146, -42], [80, -44], [176, -64]];
    let n = 0;
    for (const [dx, dy] of blue) { const p = at(dx, dy); stand(g.spawn('skeleton', p.x, p.y, 1, 0, false, g.rng, null, { rarity: 'blue', words: ['fire'] })); n++; }
    yellow.forEach(([dx, dy], i) => { const p = at(dx, dy); stand(g.spawn('skeleton', p.x, p.y, 2, i === 0 ? 1 : 0, false, g.rng, null, { rarity: i === 0 ? 'leader' : 'minion', words: ['frost'] })); n++; });
    return n;
  });
  check('ten skeletons stand in the room', placed === 10, placed);
  await page.waitForTimeout(500);
  await snap('01_room_look_off');
  await page.evaluate(() => { window.__dbg.packLook.on = true; });
  await page.waitForTimeout(400);
  await snap('02_room_look_on_blue_left_yellow_right');
  const names = await page.evaluate(() => window.__dbg.game().monsters.map((m) => `${m.name} (${m.rarity})`));
  log('in the room', names.join(', '));

  // ---- 2. a real dungeon: a blue pack and a yellow pack where the map-maker put them ----------------
  for (const [want, file] of [['blue', '03_dungeon_blue_pack'], ['leader', '04_dungeon_yellow_pack']]) {
    const found = await page.evaluate((want) => {
      const d = window.__dbg; d.run('warrior', 21); d.seasoned(10); d.autoLevel = false; d.autoWords = false; d.god = true;
      const g = d.game(); g.depth = 4; g.cleared = 4; g.enterDungeon();
      const h = g.hero; const f = g.level.floor;
      // the first pack of this kind with open floor four tiles from it, toward the camera
      const ms = g.monsters.filter((m) => m.rarity === want);
      for (const m of ms) {
        const pack = g.monsters.filter((o) => o.packId === m.packId);
        const cx = pack.reduce((a, o) => a + o.x, 0) / pack.length; const cy = pack.reduce((a, o) => a + o.y, 0) / pack.length;
        for (const [ox, oy] of [[3, 3], [3, 2], [2, 3], [4, 4], [2, 2]]) {
          const x = cx + ox; const y = cy + oy;
          if (g.level.walk[Math.floor(y) * f.w + Math.floor(x)] !== 1) continue;
          h.x = x; h.y = y;
          for (const o of pack) { g.wakeUp(o); o.state = 'recover'; o.t = 1e9; o.anim = 'idle'; o.cd = 1e9; const q = Math.hypot(h.x - o.x, h.y - o.y) || 1; o.fx = (h.x - o.x) / q; o.fy = (h.y - o.y) / q; }
          // (everyone else asleep where they are, so that nothing comes into the picture)
          for (const o of g.monsters) if (o.packId !== m.packId) { o.state = 'sleep'; }
          return { n: pack.length, names: pack.map((o) => o.name), kind: m.kind };
        }
      }
      return null;
    }, want);
    if (!check(`a ${want === 'blue' ? 'blue' : 'yellow'} pack in dungeon 4`, found !== null, found ? `${found.n} ${found.kind}: ${found.names.join(', ')}` : '')) continue;
    // (long enough for the town's last words on the screen to have faded)
    await page.waitForTimeout(8000);
    await snap(file);
  }
  await page.evaluate((on) => { window.__dbg.packLook.on = on; }, lookWas);
}
