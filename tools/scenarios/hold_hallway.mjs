// A LITTLE HALLWAY INTO EACH STRONGHOLD'S HALL (game/act1_layout.ts HOLD_HALLWAY, off): his words, 7 Nov 2026, 00:05 (Eastern),
// “add a little halway to strongholds”. Switched on for this page, floor DEPTH made, its first stronghold's door opened, and he
// walks in: pictures of where he comes in (the hallway's far end), half way up it, in the hall's mouth, the hall's first wave, and
// back out by the hallway's end. ON=0: the hall as it is in the game now, for the side by side.
//   node tools/build_to.mjs dist/hold.html
//   DEPTH=6 node tools/playtest.mjs --file dist/hold.html --size 844x390 --dpr 2 --scenario tools/scenarios/hold_hallway.mjs --out shots/hall/h6
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depth = Number(process.env.DEPTH || 6);
  const on = process.env.ON !== '0';
  const info = await page.evaluate(([n, on]) => {
    const d = window.__dbg;
    d.saving(false); d.run('brawler', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.seasoned(14);
    d.holdHallway.on = on;
    const g = d.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    const L = g.level;
    const q = L.land.holds[0];
    const st = L.holds[0];
    st.open = true;
    for (const m of g.monsters) if (m.packId >= 9100) m.dead = true;
    g.hero.x = q.gx - 0.5; g.hero.y = q.gy + 0.4;
    return { way: q.way ?? null, inside: q.inside, entry: q.entry };
  }, [depth, on]);
  log('hold', JSON.stringify(info));
  for (let k = 0; k < 16; k++) {
    await page.waitForTimeout(200);
    if (await page.evaluate(() => window.__dbg.game().level.holds[0].entered)) break;
  }
  const hush = () => page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters) if (!m.dead && !m.boss) { m.state = 'sleep'; } });
  await hush();
  await page.waitForTimeout(1600);
  await hush();
  const at = () => page.evaluate(() => { const g = window.__dbg.game(); const st = g.level.holds[0]; return { x: +g.hero.x.toFixed(2), y: +g.hero.y.toFixed(2), entered: st.entered, wave: st.wave ?? 0 }; });
  log('came in', JSON.stringify(await at()));
  // (the wave held back a moment: what is seen is the way in)
  await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters) if (!m.dead && !m.boss) m.state = 'sleep'; });
  await snap('1_in_at_the_door');
  // walk up the hallway toward the hall
  const walk = async (secs) => {
    // (up the screen and to the right: along -y, up the hallway)
    await page.keyboard.down('KeyW'); await page.keyboard.down('KeyD');
    await page.waitForTimeout(secs * 1000);
    await page.keyboard.up('KeyW'); await page.keyboard.up('KeyD');
  };
  await walk(0.45);
  await hush();
  await page.waitForTimeout(300);
  log('half way', JSON.stringify(await at()));
  await snap('2_up_the_hallway');
  await walk(0.5);
  await hush();
  await page.waitForTimeout(300);
  log('in the mouth', JSON.stringify(await at()));
  await snap('3_into_the_hall');
  await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters) if (!m.dead && m.state === 'sleep') m.state = 'chase'; });
  await page.waitForTimeout(1200);
  await snap('4_the_first_wave');
  // back out: to the hallway's end
  await page.evaluate(() => { const g = window.__dbg.game(); for (const m of g.monsters) if (!m.dead && !m.boss) m.dead = true; const q = g.level.land.holds[0]; const r = q.way ?? q.inside; g.hero.x = r.x + r.w / 2; g.hero.y = r.y + r.h - 1.2; g.hero.fx = 0; g.hero.fy = 1; });
  await page.keyboard.down('KeyS'); await page.keyboard.down('KeyA');
  await page.waitForTimeout(500);
  await page.keyboard.up('KeyS'); await page.keyboard.up('KeyA');
  await page.waitForTimeout(1500);
  const out = await page.evaluate(() => { const g = window.__dbg.game(); const q = g.level.land.holds[0]; return { x: +g.hero.x.toFixed(2), y: +g.hero.y.toFixed(2), beforeDoor: Math.abs(g.hero.x - (q.gx - 1.5)) < 1.5 && Math.abs(g.hero.y - (q.gy + 1.5)) < 1.5 }; });
  log('out', JSON.stringify(out));
  if (!out.beforeDoor) log('!! not back before the door');
  await snap('5_back_out');
}
