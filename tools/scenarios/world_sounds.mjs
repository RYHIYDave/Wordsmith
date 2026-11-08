// THE SOUND CHAT'S THIRD TO FIFTH BATCHES IN PLAY (game/world_sounds.ts, engine/audio.ts): a new game begun as he begins one; his
// steps in town, the loops round him, the armourer at his anvil; floor 1's barrels and urns broken, a chest opened; what came, what
// failed, what was fetched (the packs and their index), and no errors. Served with its sounds: --serve.
import { makeHands, log } from './lib.mjs';
export default async function (page, snap) {
  const errs = [];
  page.on('pageerror', (e) => errs.push(String(e && e.stack || e)));
  const got = [];
  page.on('request', (r) => { const u = r.url(); if (u.includes('/sounds/')) got.push(u.replace(/.*\/sounds\/[0-9a-f]+\//, '')); });
  const hands = await makeHands(page);
  await page.waitForTimeout(300);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(500);
  await hands.press('class:warrior', 0, true);
  const c = await hands.mark('button:CONFIRM');
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForTimeout(9000);
  const walk = async (k, ms) => { await page.keyboard.down(k); await page.waitForTimeout(ms); await page.keyboard.up(k); };
  await walk('KeyD', 2500); await walk('KeyW', 2500); await walk('KeyA', 2500);
  const d1 = await page.evaluate(() => window.__dbg.soundsDetail());
  log('town: steps come', d1.come.filter((n) => n.startsWith('step_')).length);
  log('town: loops going', d1.loops);
  log('town: takes played', d1.played);
  // by the armourer, for his anvil
  await page.evaluate(() => { const g = window.__dbg.game(); const st = g.level.stations.find((s) => s.kind === 'armourer'); if (st) { g.hero.x = st.x - 0.5; g.hero.y = st.y + 1.6; } });
  await page.waitForTimeout(16000);
  const d2 = await page.evaluate(() => window.__dbg.soundsDetail());
  log('town: the anvil come', d2.come.filter((n) => n.startsWith('anvil')));
  log('town: loops going', d2.loops);
  // floor 1: break what will break, open a chest
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon('gate'); g.level.explored.fill(1); });
  await page.waitForTimeout(4000);
  const broke = await page.evaluate(() => {
    const g = window.__dbg.game();
    const ps = g.level.props.filter((p) => (p.kind === 'barrel' || p.kind === 'urn') && p.state === 0).slice(0, 4);
    for (const p of ps) g.breakProps(p.x, p.y, 0.5);
    const ch = g.level.props.find((p) => p.kind === 'chest' && p.state === 0);
    if (ch) { g.hero.x = ch.x; g.hero.y = ch.y + 1; }
    return { broke: ps.map((p) => p.kind), chest: !!ch };
  });
  log('floor 1: broken, a chest', broke);
  await page.waitForTimeout(4000);
  const d3 = await page.evaluate(() => window.__dbg.soundsDetail());
  log('floor 1: break and chest sounds come', d3.come.filter((n) => /^(break_|chest)/.test(n)));
  log('all: come, failed', [d3.come.length, d3.failed]);
  const kinds = {};
  for (const u of got) { const k = u.endsWith('.pak') ? 'pak' : u.endsWith('.wav') ? 'wav' : u.endsWith('.json') ? 'index' : 'other'; kinds[k] = (kinds[k] || 0) + 1; }
  log('fetched', kinds);
  log('packs fetched', [...new Set(got.filter((u) => u.endsWith('.pak')))]);
  log('errors', errs.length);
  for (const e of errs.slice(0, 5)) console.log('ERR', e.slice(0, 600));
}
