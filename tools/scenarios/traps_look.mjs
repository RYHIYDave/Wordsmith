// THE TRAPS, FOR PICTURES (not in the regression): the hall laid by hand for them (`#hall=traps`,
// game/level.ts, `makeTrapHall`), lit for looking at.
//   1. the spike floor across the corridor: down, the warning (the holes glint), up;
//   2. the spike floor in the room, up, with three skeletons on it taking their share;
//   3. the dart wall: the plate in the corridor and the slot at its end; then the hero on the plate,
//      the darts on their way;
//   4. the sealed door with the rune of FLAME, and the line that says what it wants; then a Strike
//      that carries FLAME, and the door open.
//   node tools/playtest.mjs --file <page> --scenario tools/scenarios/traps_look.mjs --out shots/trapslook/pc
import { log } from './lib.mjs';

export default async function (page, snap) {
  let fails = 0;
  const check = (label, ok, detail = '') => { if (!ok) fails++; log(label, `${ok ? 'ok' : 'FAILED'} ${detail}`); if (!ok) console.log(`  !! ${label} ${detail}`); };

  const laid = await page.evaluate(() => {
    const d = window.__dbg; d.saving(false);
    d.practice('warrior', 11, 'traps');
    const g = d.game();
    d.god = true; d.autoLevel = false; d.autoWords = false;
    g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    clearInterval(window.__lit);
    window.__quiet = true;
    window.__lit = setInterval(() => {
      const q = window.__dbg.game(); if (!q) return;
      const L = q.level; L.explored.fill(1); L.visible.fill(1);
      // (but what is behind the sealed door stays unseen until it is opened, as in the game)
      const sd = L.doors.find((dd) => dd.spot.kind === 'worddoor');
      const vault = sd ? L.floor.rooms.find((r) => r.id === sd.spot.room) : null;
      if (sd && vault && sd.want === 0) for (let y = vault.y; y < vault.y + vault.h; y++) for (let x = vault.x; x < vault.x + vault.w; x++) { L.explored[y * L.floor.w + x] = 0; L.visible[y * L.floor.w + x] = 0; }
      if (window.__quiet) window.__dbg.fx.messages.length = 0;
    }, 3);
    const L = g.level;
    return { hazards: L.hazards.map((z) => z.spot), doors: L.doors.map((q) => ({ kind: q.spot.kind, word: q.spot.word, a: q.spot.a, plane: q.spot.plane, alongX: q.spot.alongX })) };
  });
  log('the hall', `${laid.hazards.length} traps (${laid.hazards.map((z) => z.kind).join(', ')}); doors: ${laid.doors.map((q) => `${q.kind}${q.word ? ' of ' + q.word : ''}`).join(', ')}`);
  check('two spike floors, a dart wall and a sealed door of FLAME', laid.hazards.filter((z) => z.kind === 'spikes').length === 2 && laid.hazards.some((z) => z.kind === 'darts') && laid.doors.some((q) => q.kind === 'worddoor' && q.word === 'fire'));

  /** The hero set down at a place, facing a point; then the camera is given a moment to come. */
  const stand = async (p, look, ms = 900) => {
    await page.evaluate(([p, look]) => {
      const g = window.__dbg.game(); const h = g.hero;
      h.x = p.x; h.y = p.y;
      const dx = look.x - p.x; const dy = look.y - p.y; const n = Math.hypot(dx, dy) || 1;
      h.fx = dx / n; h.fy = dy / n;
    }, [p, look]);
    await page.waitForTimeout(ms);
  };
  /** The level's clock set to `t` (where every spike floor is in its beat), a moment before a picture. */
  const at = async (t) => { await page.evaluate((t) => { window.__dbg.game().time = t; }, t); await page.waitForTimeout(40); };

  // ---- 1. the spike floor across the corridor --------------------------------------------------
  await stand({ x: 13.2, y: 18.5 }, { x: 17, y: 18.5 });
  await at(0.6);
  await snap('01_spikes_down');
  await at(1.66);
  await snap('02_spikes_warning');
  await at(2.1);
  await snap('03_spikes_up');

  // ---- 2. the room's spike floor, up, with skeletons on it -------------------------------------
  const hurt = await page.evaluate(() => {
    const g = window.__dbg.game();
    const h = g.hero; h.x = 21.6; h.y = 21.2; h.fx = 0.8; h.fy = -0.6;
    g.monsters.length = 0;
    const out = [];
    for (const [x, y] of [[24.2, 18.4], [25.6, 19.6], [24.4, 20.3]]) {
      const m = g.spawn('skeleton', x, y, 0, 0, false, g.rng);
      m.speed = 0; m.cd = 1e9;
      out.push(m.id);
    }
    return out.length;
  });
  await page.waitForTimeout(900);
  // (the room's floor is half a beat behind the corridor's: down at 0.3, up from 0.65)
  await page.evaluate(() => { window.__dbg.game().time = 0.3; });
  // (a few steps at 0.3, so that the floor is known to be down before it is set to rise)
  await page.waitForTimeout(150);
  const before = await page.evaluate(() => window.__dbg.game().monsters.map((m) => m.life));
  await at(0.95);
  await page.waitForTimeout(120);
  const after = await page.evaluate(() => window.__dbg.game().monsters.map((m) => ({ life: m.life, max: m.maxLife })));
  await snap('04_spike_room_up_with_skeletons');
  check('2. three skeletons on the room\'s spikes, each takes a sixth of its life as they rise', hurt === 3 && after.length === 3 && after.every((m, i) => Math.abs(before[i] - m.life - Math.round(m.max / 6)) <= 1), `${before.map((b, i) => `${b} -> ${after[i] ? after[i].life : '?'}`).join(', ')}`);

  // ---- 3. the dart wall ------------------------------------------------------------------------
  await page.evaluate(() => { const g = window.__dbg.game(); g.monsters.length = 0; });
  await stand({ x: 29.6, y: 32.5 }, { x: 24, y: 32.5 });
  await snap('05_dart_plate_and_slot');
  await stand({ x: 31.5, y: 32.5 }, { x: 36, y: 32.5 }, 30);
  await page.waitForTimeout(430);
  const darts = await page.evaluate(() => window.__dbg.game().projectiles.filter((p) => p.look === 'dart').length);
  await snap('06_darts_on_their_way');
  check('3. on the plate: the darts leave the slot', darts >= 1, `${darts} in the air`);
  await page.waitForTimeout(900);

  // ---- 4. the sealed door ----------------------------------------------------------------------
  await page.evaluate(() => { window.__quiet = false; window.__dbg.fx.messages.length = 0; const g = window.__dbg.game(); g.projectiles.length = 0; });
  await stand({ x: 42.5, y: 31.5 }, { x: 42.5, y: 26.5 }, 1200);
  const told = await page.evaluate(() => window.__dbg.fx.messages.map((m) => m.text || m.t || String(m)).join(' | '));
  await snap('07_sealed_door_flame');
  check('4. the sealed door says what it wants', /FLAME/.test(told), told);
  const opened = await page.evaluate(() => {
    const g = window.__dbg.game();
    for (const sd of ['front', 'behind']) { const grp = sd === 'front' ? g.hero.skills[0].front : g.hero.skills[0].behind; for (let i = 0; i < grp.length; i++) if (grp[i]) g.unsocket(0, sd, i); }
    const why = g.socket(0, 'front', 'fire');
    const h = g.hero; h.x = 42.5; h.y = 27.9; h.fx = 0; h.fy = -1;
    g.useBasic(42.5, 26.5);
    return why || '';
  });
  await page.waitForTimeout(1300);
  const door = await page.evaluate(() => { const q = window.__dbg.game().level.doors.find((d) => d.spot.kind === 'worddoor'); return { open: q.open, want: q.want }; });
  await page.evaluate(() => { const h = window.__dbg.game().hero; h.x = 42.5; h.y = 30.2; h.fx = 0; h.fy = -1; });
  await page.waitForTimeout(700);
  await snap('08_sealed_door_open');
  check('   a Strike of Flame opens it', opened === '' && door.want === 1 && door.open > 0.9, `socket: ${opened || 'ok'}; open ${door.open}`);
  await page.evaluate(() => { clearInterval(window.__lit); });
  log(fails === 0 ? 'finished clean' : `${fails} failed`);
}
