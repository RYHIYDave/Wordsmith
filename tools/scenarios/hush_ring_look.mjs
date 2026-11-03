// FLOOR 20, THE HUSH'S SHAPES GOING ROUND HIM AND SWOOPING (game/act1_rules/hshape.ts, the art chat's new rhythm): on a page built
// with the High City on, the hero stood in a room of floor 20, three of them set four to five tiles off him; pictures every 0.3 s
// for SECS seconds, the game going at its own speed.
//   node tools/playtest.mjs --file dist/x.html --size 844x390 --dpr 2 --scenario tools/scenarios/hush_ring_look.mjs --out shots/hush
//   env: KIND (hshape; or rshadow with FORM 0 to 3, the royal: 3 the King), SECS, EVERY (seconds between pictures)
export default async function (page, snap) {
  const SECS = Number(process.env.SECS || 7);
  const KIND = process.env.KIND || 'hshape';
  const FORM = process.env.FORM === undefined ? -1 : Number(process.env.FORM);
  const EVERY = Number(process.env.EVERY || 0.3);
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 77); d.seasoned(18); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  const r = await page.evaluate(([KIND, FORM]) => {
    const D = window.__dbg;
    D.high(true, 20);
    const g = D.game();
    g.level.explored.fill(1);
    g.waveT = 1e9; D.bot(false);
    for (const q of g.monsters) q.dead = true;
    g.monsters = [];
    const f = g.level.floor;
    const room = f.rooms.filter((q) => q.kind !== 'boss').sort((a, b) => b.w * b.h - a.w * a.h)[0];
    const h = g.hero;
    h.x = room.x + room.w / 2; h.y = room.y + room.h / 2;
    const out = [];
    for (const [dx, dy] of KIND === 'hshape' ? [[4.5, 0], [-2, 4], [-3, -3.5]] : [[5, 0]]) {
      if (!g.isOpen(h.x + dx, h.y + dy)) continue;
      const m = g.spawn(KIND, h.x + dx, h.y + dy, 970, 0, false, g.rng);
      if (FORM >= 0) m.form = FORM;
      m.seen = true; out.push(m.id);
    }
    window.__hush = { log: [] };
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      const o = run(dt, c);
      for (const m of g.monsters) if (m.act && m.act.id !== m.__last) { window.__hush.log.push(`${g.time.toFixed(2)} ${m.id} ${m.act.id}`); m.__last = m.act.id; }
      return o;
    };
    return { n: out.length, room: [room.w, room.h] };
  }, [KIND, FORM]);
  console.log('shapes', JSON.stringify(r));
  for (let i = 0; i < Math.round(SECS / EVERY); i++) {
    await page.waitForTimeout(EVERY * 1000);
    await snap(`t${String(i).padStart(2, '0')}`);
  }
  console.log((await page.evaluate(() => window.__hush.log)).join('\n'));
}
