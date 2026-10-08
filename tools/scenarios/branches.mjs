// Side branches: visits a guardian's lair and a treasure vault and photographs what is there.
//   node tools/playtest.mjs --scenario tools/scenarios/branches.mjs --out shots/br
// env CLS (warrior | ranger | mage, default warrior), SEED (default 21)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED) || 21;
  await page.evaluate(([c, s]) => { const d = window.__dbg; d.autoLevel = false; d.autoWords = false; d.run(c, s); d.game().enterDungeon(); d.god = true; }, [cls, seed]);
  await page.waitForTimeout(300);

  const info = await page.evaluate(() => {
    const g = window.__dbg.game(); const f = g.level.floor;
    const kinds = {};
    for (const r of f.rooms) kinds[r.kind] = (kinds[r.kind] || 0) + 1;
    return { size: `${f.w}x${f.h}`, rooms: f.rooms.length, path: f.rooms.filter((r) => r.path >= 0).length, kinds, monsters: g.monsters.length,
      guardians: g.monsters.filter((m) => m.champion).map((m) => ({ name: m.name, life: m.maxLife, dmg: `${m.dmgMin.toFixed(0)}-${m.dmgMax.toFixed(0)}`, words: m.words })) };
  });
  log('dungeon', info);

  // Stand the hero just inside the doorway of a room of the given kind (found by walking the flow from its centre).
  const goTo = (kind, back) => page.evaluate(([k, b]) => {
    const d = window.__dbg; const g = d.game(); const f = g.level.floor;
    const r = f.rooms.find((o) => o.kind === k);
    if (!r) return null;
    const cx = r.x + (r.w >> 1); const cy = r.y + (r.h >> 1);
    // the room's doorway: the corridor tile beside the room, then step `b` tiles into the room toward its centre
    let door = null;
    for (let y = r.y - 1; y <= r.y + r.h && !door; y++) for (let x = r.x - 1; x <= r.x + r.w && !door; x++) {
      const inside = x >= r.x && y >= r.y && x < r.x + r.w && y < r.y + r.h;
      if (!inside && f.tiles[y * f.w + x] === 1) {
        // centre of the 3-wide doorway: has floor on both sides along the wall
        const horiz = y < r.y || y >= r.y + r.h;
        const a = horiz ? f.tiles[y * f.w + x - 1] : f.tiles[(y - 1) * f.w + x];
        const c = horiz ? f.tiles[y * f.w + x + 1] : f.tiles[(y + 1) * f.w + x];
        if (a === 1 && c === 1) door = { x, y };
      }
    }
    if (!door) return null;
    const dx = Math.sign(cx - door.x); const dy = Math.sign(cy - door.y);
    const horiz = door.y < r.y || door.y >= r.y + r.h;
    const h = g.hero;
    h.x = door.x + 0.5 + (horiz ? 0 : dx * b);
    h.y = door.y + 0.5 + (horiz ? dy * b : 0);
    h.fx = horiz ? 0 : dx; h.fy = horiz ? dy : 0;
    return { room: r.id, size: `${r.w}x${r.h}`, hero: [h.x, h.y], centre: [cx, cy] };
  }, [kind, back]);

  // ---- the guardian --------------------------------------------------------------------------
  log('to the guardian', await goTo('guardian', 2));
  await page.waitForTimeout(900);
  await snap('guardian_room');
  await page.evaluate(() => window.__dbg.bot(true));
  let woke = false;
  for (let i = 0; i < 40 && !woke; i++) {
    await page.waitForTimeout(150);
    woke = await page.evaluate(() => window.__dbg.game().monsters.some((m) => m.champion && m.state !== 'sleep'));
  }
  log('guardian woke', String(woke));
  await page.waitForTimeout(1200);
  await snap('guardian_fight');
  const fight = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const m = g.monsters.find((o) => o.champion && !o.dead);
    return m ? { name: m.name, life: `${Math.round(m.life)}/${m.maxLife}`, state: m.state, msgs: d.fx.messages.map((x) => x.text) } : null;
  });
  log('in the fight', fight);
  // let the bot finish it (the hero cannot die), then look at what it left
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.potions = 0; });
  for (let i = 0; i < 300; i++) {
    await page.waitForTimeout(200);
    if (!(await page.evaluate(() => window.__dbg.game().monsters.some((m) => m.champion && !m.dead)))) break;
  }
  await page.evaluate(() => window.__dbg.bot(false));
  await page.waitForTimeout(700);
  const after = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    return { guardianDead: !g.monsters.some((m) => m.champion && !m.dead && m.state !== 'sleep'), potions: g.hero.potions,
      drops: g.drops.map((x) => x.kind === 'item' ? `item:${x.item.name}(${x.item.rarity})` : x.kind === 'word' ? `word:${x.word}` : x.kind), msgs: d.fx.messages.map((x) => x.text) };
  });
  log('after the guardian', after);
  await snap('guardian_loot');

  // ---- the vault -----------------------------------------------------------------------------
  log('to the vault', await goTo('treasure', 1));
  await page.waitForTimeout(900);
  await snap('vault_room');
  await page.evaluate(() => window.__dbg.bot(true));
  await page.waitForTimeout(6000);
  await page.evaluate(() => window.__dbg.bot(false));
  // walk onto the chests
  const opened = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const f = g.level.floor;
    const r = f.rooms.find((o) => o.kind === 'treasure');
    const chests = g.level.props.filter((p) => p.kind === 'chest' && p.tx >= r.x && p.ty >= r.y && p.tx < r.x + r.w && p.ty < r.y + r.h);
    const before = g.drops.length;
    g.hero.x = chests[0].x + 1.2; g.hero.y = chests[0].y + 0.2;
    return { chests: chests.length, before };
  });
  await page.waitForTimeout(900);
  const loot1 = await page.evaluate(() => { const g = window.__dbg.game(); return g.drops.map((x) => x.kind === 'item' ? `item:${x.item.name}(${x.item.rarity})` : x.kind === 'word' ? `word:${x.word}` : x.kind === 'gold' ? `gold:${x.gold}` : x.kind); });
  log('vault, first chest', { ...opened, drops: loot1 });
  await snap('vault_open');
  const mm = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    return { unopened: g.level.props.filter((p) => p.kind === 'chest' && p.state === 0).length, explored: g.level.explored.reduce((a, b) => a + b, 0) };
  });
  log('chests still shut, tiles explored', mm);

  // ---- the large map -------------------------------------------------------------------------
  // let the bot explore at speed, then look at the map (opened the way a player would: M, or a press on the small map)
  await page.evaluate(() => { const d = window.__dbg; d.speed = 10; d.bot(true); });
  await page.waitForTimeout(Number(process.env.EXPLORE_MS) || 9000);
  await page.evaluate(() => { const d = window.__dbg; d.speed = 1; d.bot(false); });
  const touch = await page.evaluate(() => window.__dbg.screen.touch);
  const tapMini = async () => {
    const r = await page.evaluate(() => { const d = window.__dbg; const m = d.ui.marks.get('minimap'); return m ? d.screen.toClient(m.x + m.w / 2, m.y + m.h / 2) : null; });
    if (!r) return;
    if (touch) await page.touchscreen.tap(r.x, r.y); else await page.mouse.click(r.x, r.y);
  };
  // open it by pressing the small map, the way a player would
  await tapMini();
  await page.waitForTimeout(500);
  log('map open after pressing the small map', await page.evaluate(() => window.__dbg.panels.open));
  const st = await page.evaluate(() => { const g = window.__dbg.game(); return { depth: g.depth, kills: g.kills, town: g.level.town, explored: g.level.explored.reduce((a, b) => a + b, 0) }; });
  log('explored so far', st);
  await snap('map');
  // any press closes it; the game was paused meanwhile
  const k0 = await page.evaluate(() => window.__dbg.game().time);
  await page.waitForTimeout(400);
  const k1 = await page.evaluate(() => window.__dbg.game().time);
  if (touch) await page.touchscreen.tap(200, 200); else await page.mouse.click(300, 300);
  await page.waitForTimeout(300);
  log('paused while open, closed by a press', { paused: k0 === k1, open: await page.evaluate(() => window.__dbg.panels.open) });
  if (!touch) {
    await page.keyboard.press('KeyM');
    await page.waitForTimeout(200);
    const a = await page.evaluate(() => window.__dbg.panels.open);
    await page.keyboard.press('KeyM');
    await page.waitForTimeout(200);
    log('M opens and closes', [a, await page.evaluate(() => window.__dbg.panels.open)]);
  }
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
