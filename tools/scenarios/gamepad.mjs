// A GAME CONTROLLER (engine/gamepad.ts, `GAMEPAD.on`, OFF in the game until the owner has seen the
// layout and said yes): this playtest switches it on for itself and plays the game with a pad of
// its own making (navigator.getGamepads answered by the page: no real pad is needed).
//   1. in play: the left stick walks the hero; the right stick aims at a monster and RT strikes it;
//      LT is the slow attack; A the evasive move; X a flask;
//   2. Y opens the inventory; there the left stick moves a pointer and A presses DONE;
//   3. START pauses; B goes back; BACK opens the map in a dungeon;
//   4. the D-pad's UP presses the prompt over the attacks: LEVEL UP, or NEW TALENT (the skill trees
//      switched on for it); the prompts, the flask, the moves, the ATTACKS page and the pause
//      panel's list name the pad's buttons while it is played with.
//   node tools/playtest.mjs --file <page> [--touch --size 844x390 --dpr 3] --scenario tools/scenarios/gamepad.mjs --out shots/gamepad/pc
import { log } from './lib.mjs';

const DT = 1000 / 60;

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };
  // the pad: its sticks and the buttons down, read by the game through navigator.getGamepads
  await page.evaluate(() => {
    window.__padState = { axes: [0, 0, 0, 0], down: [] };
    const read = () => {
      const s = window.__padState;
      return [{ connected: true, mapping: 'standard', id: 'playtest pad', index: 0, timestamp: performance.now(), axes: s.axes.slice(), buttons: Array.from({ length: 17 }, (_, i) => ({ pressed: s.down.includes(i), value: s.down.includes(i) ? 1 : 0 })) }];
    };
    Object.defineProperty(navigator, 'getGamepads', { value: read, configurable: true });
    const d = window.__dbg;
    d.saving(false);
    d.gamepad.on = true;
  });
  const set = (axes, down = []) => page.evaluate(([a, b]) => { window.__padState.axes = a; window.__padState.down = b; }, [axes, down]);
  /** A button pressed and let go. */
  const tap = async (b, hold = 120) => { await set([0, 0, 0, 0], [b]); await page.waitForTimeout(hold); await set([0, 0, 0, 0], []); await page.waitForTimeout(120); };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g ? g.hero : null;
    return { pad: d.pad(), panel: d.panels.open, x: h ? h.x : 0, y: h ? h.y : 0, uses: h ? h.skills.map((k) => k.uses) : [], potions: h ? h.potions : 0, life: h ? h.life : 0, max: h ? h.d.maxLife : 0, town: g ? g.level.town : true };
  });

  // a warrior in the practice room, far enough along to have every move, a skeleton to his right
  await page.evaluate(() => {
    const d = window.__dbg;
    d.practice('warrior', 7);
    const g = d.game();
    d.god = true; d.autoLevel = false; d.autoWords = false;
    g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero;
    h.fx = 1; h.fy = 0;
    const m = g.spawn('skeleton', h.x + 3, h.y - 3, 1, 0, false, g.rng);
    g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
    window.__mon = m.id;
  });
  await page.waitForTimeout(400);
  let s = await st();
  // 1. the left stick: he walks (the screen's right is the world's +x and -y)
  const x0 = s.x;
  const y0 = s.y;
  await set([1, 0, 0, 0]);
  await page.waitForTimeout(600);
  await snap('01_walking');
  await set([0, 0, 0, 0]);
  await page.waitForTimeout(200);
  s = await st();
  check('1. the left stick walks him (screen right)', s.x - x0 > 0.5 && y0 - s.y > 0.5, `moved ${(s.x - x0).toFixed(2)}, ${(s.y - y0).toFixed(2)}`);
  check('   and the pad is live, no pointer in play', s.pad.live && !s.pad.pointer);
  // the right stick at the skeleton (up on the screen from where he stands now), and RT
  const aim = await page.evaluate(() => { const d = window.__dbg; const g = d.game(); const h = g.hero; const m = g.monsters.find((q) => q.id === window.__mon); const c = d.cam(); const sx = (m.x - m.y) - (h.x - h.y); const sy = ((m.x + m.y) - (h.x + h.y)) / 2; const l = Math.hypot(sx, sy) || 1; return [sx / l, sy / l]; });
  const life0 = await page.evaluate(() => window.__dbg.game().monsters.find((q) => q.id === window.__mon).life);
  const u0 = s.uses[0];
  await set([0, 0, aim[0], aim[1]], [7]);
  await page.waitForTimeout(900);
  await snap('02_aim_and_rt');
  await set([0, 0, 0, 0], []);
  await page.waitForTimeout(300);
  s = await st();
  const life1 = await page.evaluate(() => window.__dbg.game().monsters.find((q) => q.id === window.__mon).life);
  check('   the right stick aims and RT attacks: the quick attack used', s.uses[0] > u0, `${u0} -> ${s.uses[0]}`);
  check('   and the skeleton it was aimed at is hurt', life1 < life0, `${life0} -> ${life1}`);
  // LT: the slow attack
  const u1 = s.uses[1];
  await set([0, 0, 0, 0], [6]);
  await page.waitForTimeout(500);
  await set([0, 0, 0, 0], []);
  await page.waitForTimeout(1400);
  s = await st();
  check('   LT: the slow attack', s.uses[1] > u1, `${u1} -> ${s.uses[1]}`);
  // A: the evasive move
  const u2 = s.uses[2];
  await set([1, 0, 0, 0], [0]);
  await page.waitForTimeout(150);
  await set([0, 0, 0, 0], []);
  await page.waitForTimeout(600);
  s = await st();
  check('   A: the evasive move', s.uses[2] > u2, `${u2} -> ${s.uses[2]}`);
  // X: a flask (hurt him first; out of god mode for it)
  await page.evaluate(() => { const d = window.__dbg; d.god = false; const h = d.game().hero; h.life = Math.floor(h.d.maxLife / 3); h.potions = 3; });
  await tap(2);
  s = await st();
  check('   X: a flask', s.potions === 2 && s.life > s.max / 3 + 1, `${s.potions} left, life ${Math.round(s.life)} of ${s.max}`);
  await page.evaluate(() => { window.__dbg.god = true; });
  // 2. Y: the inventory; the pointer; A on DONE
  await tap(3);
  s = await st();
  check('2. Y opens the inventory', s.panel === 'inv', s.panel);
  await set([0.6, 0.3, 0, 0]);
  await page.waitForTimeout(250);
  await set([0, 0, 0, 0]);
  await page.waitForTimeout(150);
  s = await st();
  check('   the pointer is out, and moved by the left stick', s.pad.pointer, `at ${Math.round(s.pad.px)}, ${Math.round(s.pad.py)}`);
  await snap('03_inventory_pointer');
  const done = await page.evaluate(() => { const m = window.__dbg.ui.marks.get('button:DONE'); return m ? { x: m.x + m.w / 2, y: m.y + m.h / 2 } : null; });
  check('   DONE is on the screen', !!done);
  if (done) {
    await page.evaluate(([x, y]) => window.__dbg.padAt(x, y), [done.x, done.y]);
    await page.waitForTimeout(100);
    await snap('04_pointer_on_done');
    await tap(0);
    s = await st();
    check('   A presses DONE: the inventory closes', s.panel === 'none', s.panel);
  }
  // 3. START pauses; B goes back
  await tap(9);
  s = await st();
  check('3. START pauses', s.panel === 'pause', s.panel);
  await snap('05_pause');
  await tap(1);
  s = await st();
  check('   B goes back to the game', s.panel === 'none', s.panel);
  // BACK: the map, in a dungeon
  await page.evaluate(() => { const d = window.__dbg; d.run('warrior', 21); d.seasoned(10); const g = d.game(); g.depth = 2; g.cleared = 1; g.enterDungeon(); d.autoLevel = false; });
  await page.waitForTimeout(500);
  await tap(8);
  s = await st();
  check('   BACK opens the map in a dungeon', s.panel === 'map', s.panel);
  await snap('06_map');
  await tap(8);
  s = await st();
  check('   and BACK closes it again', s.panel === 'none', s.panel);
  // 4. the D-pad's UP: LEVEL UP, named so
  const buttons = () => page.evaluate(() => [...window.__dbg.ui.marks.keys()].filter((m) => m.startsWith('button:')));
  await page.evaluate(() => { window.__dbg.game().hero.pending = 1; });
  await page.waitForTimeout(300);
  let named = await buttons();
  check('4. LEVEL UP names the D-pad\'s UP', named.includes('button:LEVEL UP (UP)'), named.join(' | '));
  await snap('07_named');
  await tap(12);
  s = await st();
  check('   UP opens LEVEL UP', s.panel === 'level', s.panel);
  await snap('08_level_up');
  await tap(1);
  s = await st();
  check('   and B closes it', s.panel === 'none', s.panel);
  // a talent point waiting (the skill trees switched on for this): NEW TALENT, and UP opens it
  await page.evaluate(() => { const d = window.__dbg; window.__talentsWere = d.talents.on; d.talents.on = true; const g = d.game(); g.hero.pending = 0; g.hero.talents = []; g.refresh(); });
  await page.waitForTimeout(300);
  named = await buttons();
  check('   NEW TALENT names it too', named.includes('button:NEW TALENT (UP)'), named.join(' | '));
  await tap(12);
  s = await st();
  const pg = await page.evaluate(() => window.__dbg.invUi.page);
  check('   UP opens the inventory on TALENTS', s.panel === 'inv' && pg === 'talents', `${s.panel}, ${pg}`);
  await snap('09_talents');
  // (the ATTACKS page names RT, LT and A)
  await page.evaluate(() => { window.__dbg.invUi.page = 'attacks'; });
  await page.waitForTimeout(200);
  await snap('10_attacks_named');
  await tap(1);
  s = await st();
  check('   B closes the inventory', s.panel === 'none', s.panel);
  await page.evaluate(() => { window.__dbg.talents.on = window.__talentsWere; });
  // (the pause panel's list of controls is the pad's)
  await tap(9);
  await page.waitForTimeout(200);
  await snap('11_pause_named');
  await tap(1);
  await page.evaluate(() => { window.__dbg.gamepad.on = false; });
  log('gamepad', fails ? `${fails} thing(s) wrong` : 'all as they should be');
}
