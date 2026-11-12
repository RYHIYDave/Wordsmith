// THE DARK FLOORS (the art review of 9 Nov 2026; the queue's look-at-the-other-dark-floors): each floor named (FLOORS=2,3,4,5,12,15)
// entered as the game lays it (SEED), nobody about, everything seen; the hero set in the middle of its biggest room (not the boss's),
// the game stepped a moment; pictured, and the share of the play area that is near-black told (the part of the screen above the
// foot's buttons: every pixel whose light is under NEAR of 255).
//   FLOORS=2,3,4,5,12,15 node tools/playtest.mjs --file dist/dark.html --touch --size 852x393 --dpr 3 --scenario tools/scenarios/dark_floors.mjs --out shots/dark/main
export default async function (page, snap) {
  const FLOORS = (process.env.FLOORS || '2,3,4,5,12,15').split(',').map(Number);
  const SEED = Number(process.env.SEED || 4242);
  const NEAR = Number(process.env.NEAR || 28);
  const say = (s) => console.log(`  ${s}`);
  await page.evaluate(([SEED]) => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', SEED); d.seasoned(4); d.autoLevel = false; d.autoWords = false; d.god = true; }, [SEED]);
  await page.waitForTimeout(600);
  for (const FLOOR of FLOORS) for (const ROOM of [0, 1]) {
    const where = await page.evaluate(([FLOOR, ROOM]) => {
      const D = window.__dbg;
      let g = D.game();
      if (g.__step) g.update = g.__step;
      g.depth = FLOOR; g.cleared = FLOOR - 1; g.enterDungeon();
      g = D.game();
      g.level.explored.fill(1);
      g.waveT = 1e9; D.bot(false);
      g.talentsLeft = () => 0;
      for (const q of g.monsters) q.dead = true;
      g.monsters = [];
      const rooms = g.level.floor.rooms;
      const r = rooms.filter((q) => q.kind !== 'boss').sort((a, b) => b.w * b.h - a.w * a.h)[ROOM] ?? rooms[0];
      const h = g.hero;
      h.x = r.x + r.w / 2; h.y = r.y + r.h / 2;
      if (!g.isOpen(h.x, h.y)) { h.x = r.x + 1.5; h.y = r.y + 1.5; }
      h.fx = 1; h.fy = 0;
      return { room: [r.x, r.y, r.w, r.h], kind: r.kind ?? null };
    }, [FLOOR, ROOM]);
    // (its title card gone)
    await page.waitForTimeout(Number(process.env.SETTLE || 4200));
    // (the share near-black, read off the canvas: the play area above the foot's buttons)
    const share = await page.evaluate(([NEAR]) => {
      const cv = document.querySelector('canvas');
      const c = document.createElement('canvas');
      c.width = cv.width; c.height = cv.height;
      const g = c.getContext('2d');
      g.drawImage(cv, 0, 0);
      const h = Math.floor(cv.height * 0.8);
      const d = g.getImageData(0, Math.floor(cv.height * 0.06), cv.width, h - Math.floor(cv.height * 0.06)).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) if (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2] < NEAR) n++;
      return n / (d.length / 4);
    }, [NEAR]);
    say(`floor ${FLOOR} (room ${ROOM}): room ${JSON.stringify(where)}, near-black ${(share * 100).toFixed(1)}%`);
    await snap(`floor${FLOOR}_${ROOM}`);
  }
}
