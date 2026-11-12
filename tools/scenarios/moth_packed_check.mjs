// FLOOR 20, THE MOTH KEPT PACKED (render/painter.ts PACKED): ITS FRAMES UNPACKED ARE THE SAME PICTURES, EVERY PIXEL. On floor 20, the
// Moth's worker left to paint and pack until its first moves are packed; then those moves asked for as if shown (Painter.shown),
// unpacked, and every frame of it in hand held against the game's own painting of it, made afresh here (__dbg.bakedMobsCheck:
// its parts, its size, every value of every pixel). A desk's screen, so that its budget holds several moves at once.
//   node tools/playtest.mjs --file <page> --serve --size 1280x720 --scenario tools/scenarios/moth_packed_check.mjs
//   PACKED=300   how many of its frames packed before its moves are asked for (its stand, drift, buffet and struck come first)
export default async function (page) {
  const want = Number(process.env.PACKED || 300);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.run('warrior', 4);
    d.seasoned(25);
    d.god = true;
    d.high(true, 20);
    const g = d.game();
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
    d.bot(false);
  });
  const t0 = Date.now();
  let st = null;
  for (;;) {
    st = await page.evaluate(() => window.__dbg.painter.packedStats('moth'));
    if (st && st.packed >= want) break;
    if (Date.now() - t0 > 600000) throw new Error(`not packed in time: ${JSON.stringify(st)}`);
    await page.waitForTimeout(2000);
  }
  console.log(`packed ${st.packed} frames in ${Math.round((Date.now() - t0) / 1000)} s, ${st.packedMB} MB as PNGs; kept (first frames) ${st.kept}, ${st.keptMB} MB`);
  if (!st.packs) throw new Error('its worker does not pack it here');
  // (its moves asked for as if shown: its stand, its drift, its buffet, struck, from in front and behind)
  const asked = await page.evaluate(() => {
    const d = window.__dbg;
    const p = d.painter;
    const art = p.bestiary().made('moth');
    const c = (s) => s.clips;
    const lists = [art.front, art.back].map((s) => [s.idle, s.walk, c(s).attack.frames, c(s).die.frames, c(s).reel.frames]);
    const out = [];
    for (const v of [0, 1]) for (const l of [0, 1, 2, 4]) {
      p.shown('moth', lists[v][l][0], false);
      out.push(`${v},${l}`);
    }
    return out;
  });
  await page.waitForTimeout(6000);
  const held = await page.evaluate(() => {
    const p = window.__dbg.painter;
    const art = p.bestiary().made('moth');
    const c = (s) => s.clips;
    const lists = [art.front, art.back].map((s) => [s.idle, s.walk, c(s).attack.frames, c(s).die.frames, c(s).reel.frames]);
    const out = {};
    for (const v of [0, 1]) for (const l of [0, 1, 2, 4]) {
      const fr = lists[v][l];
      let n = 0;
      for (let i = 1; i < fr.length; i++) { const d = Object.getOwnPropertyDescriptor(fr, i); if (d && 'value' in d && d.value && d.value.img instanceof ImageBitmap) n++; }
      out[`${v},${l}`] = `${n}/${fr.length - 1}`;
    }
    return { out, stats: p.packedStats('moth') };
  });
  console.log('asked', asked.join(' '), '| unpacked in hand (beside each first frame):', JSON.stringify(held.out), '|', JSON.stringify(held.stats));
  // (every frame in hand held against the game's own painting of it, made afresh: some seconds a frame)
  const check = await page.evaluate(() => window.__dbg.bakedMobsCheck('moth', 5000));
  console.log('CHECK', JSON.stringify(check));
  if (check.differ > 0) throw new Error(`unlike the game's own painting: ${check.differ} of ${check.checked} (${check.worst})`);
  if (check.checked < 100) throw new Error(`too few checked: ${check.checked}`);
  console.log(`THE SAME PICTURES: ${check.checked} frames in hand, every pixel as the game paints it`);
}
