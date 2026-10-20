// FLOOR 11, THE GATE WARD: ITS DOORWAYS (the art chat, 20 Oct 2026): the hero stood in the street before the door of each of
// the first N houses that can be walked into (game/act2 gateward: land.houses), a picture of each; WHOLE=1, the walls standing
// whole (render/act2_walls.ts). SEED, N, INSIDE=1 (the hero in its room instead).
export default async function (page, snap) {
  const seed = Number(process.env.SEED ?? 3);
  const n = Number(process.env.N ?? 3);
  const info = await page.evaluate(([seed, whole]) => {
    const D = window.__dbg;
    D.saving(false);
    D.run('warrior', seed);
    D.seasoned(20);
    D.god = true;
    if (D.act2Walls) D.act2Walls.on = whole;
    D.act2(true, 11);
    const g = D.game();
    g.monsters.length = 0;
    return (g.level.land.houses ?? []).map((h) => ({ room: h.room, front: h.front }));
  }, [seed, process.env.WHOLE === '1']);
  console.log('  houses', info.length);
  for (let k = 0; k < Math.min(n, info.length); k++) {
    const h = info[k];
    const F = h.front;
    const mid = (F.door[0] + F.door[1]) / 2;
    // (the street before the door: two tiles out from the front, toward the eye if it looks that way)
    const out = F.along === 'x' ? (F.at >= h.room[3] - 1 ? 2.5 : -1.5) : (F.at >= h.room[2] - 1 ? 2.5 : -1.5);
    const inside = process.env.INSIDE === '1';
    const x = F.along === 'x' ? mid : inside ? (h.room[0] + h.room[2]) / 2 : F.at + out;
    const y = F.along === 'x' ? (inside ? (h.room[1] + h.room[3]) / 2 : F.at + out) : mid;
    await page.evaluate(([x, y]) => {
      const g = window.__dbg.game();
      g.hero.x = x;
      g.hero.y = y;
    }, [x, y]);
    console.log('  house', k, JSON.stringify(h), 'hero at', x, y);
    await page.waitForTimeout(Number(process.env.WAIT ?? 2500));
    await snap(`h${k}`);
  }
}
