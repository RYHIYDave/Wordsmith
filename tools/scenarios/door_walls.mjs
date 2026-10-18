// THE WALL BESIDE A DOOR (render/walls.ts, wallsAway; render.ts): pictures of the doorways of floors 1 to 5,
// for the owner, 18 Oct 2026, 08:27: "I’d like you to look at levels 1-5 and add the wall sections that are
// missing on the sides of any door.  I feel like you leave out any wall sections that would hide the player
// but I don’t like how it looks.  Figure out how to fade them or whatever so it doesn’t hide the player, but
// I don’t like the gaps missing in the walls".
//   node tools/build_to.mjs dist/dw.html
//   DEPTHS=1,2,3,4,5 node tools/playtest.mjs --file dist/dw.html --size 844x390 --dpr 2 --scenario tools/scenarios/door_walls.mjs --out shots/dw/now
// DEPTHS: which floors. PER: doors a floor (2). BEHIND=1: the hero stood in the corridor just past the door, behind its wall.
// DOOR_WALLS=1: the switch on for the pictures (render/walls.ts, DOOR_WALLS).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const depths = (process.env.DEPTHS || '1,2,3,4,5').split(',').map(Number);
  const per = Number(process.env.PER || 2);
  const behind = process.env.BEHIND === '1';
  const on = process.env.DOOR_WALLS === '1';
  // NEAR=1: the doors on a side toward the eye instead (and, with DOOR_WALLS=1, their two stones stood again)
  const near = process.env.NEAR === '1';
  // SHIFT: the hero moved this many tiles along the door's wall, toward its stone left out (with BEHIND=1: right behind the wall that stands again)
  const shift = Number(process.env.SHIFT || 0);
  await page.evaluate((o) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    if (d.doorWalls) d.doorWalls(o[0], o[1]);
  }, [on, near]);
  await page.waitForTimeout(600);
  for (const depth of depths) {
    const spots = await page.evaluate(([n, k, back, sh, nr]) => {
      const g = window.__dbg.game();
      g.depth = n; g.cleared = n - 1; g.enterDungeon();
      const L = g.level;
      L.explored.fill(1);
      g.monsters = [];
      const W = L.floor.w;
      const walk = (x, y) => L.walk[Math.floor(y) * W + Math.floor(x)] === 1;
      const out = [];
      for (const D of L.doors) {
        const d = D.spot;
        if (d.kind !== 'door' || d.near !== nr) continue;
        const line = d.out > 0 ? d.plane : d.plane - 1;
        const mx = d.alongX ? d.a + 1.5 : line + 0.5;
        const my = d.alongX ? line + 0.5 : d.a + 1.5;
        // inside the room, two and a half tiles from the door; or (BEHIND) in the corridor a tile and a half past it
        const s = back ? d.out * 1.5 : -d.out * 2.5;
        const hx = d.alongX ? mx + sh : mx + s;
        const hy = d.alongX ? my + s : my + sh;
        if (!walk(hx, hy)) continue;
        out.push({ hx, hy, mx, my, alongX: d.alongX, out: d.out });
        if (out.length >= k) break;
      }
      return out;
    }, [depth, per, behind, shift, near]);
    log('floor', depth, 'doors in a back wall photographed', spots.length);
    // (the floor's name fades first)
    await page.waitForTimeout(Number(process.env.WAIT || 6000));
    for (let i = 0; i < spots.length; i++) {
      const p = spots[i];
      await page.evaluate((q) => {
        const g = window.__dbg.game();
        g.hero.x = q.hx; g.hero.y = q.hy;
        // facing the door
        const dx = q.mx - q.hx; const dy = q.my - q.hy; const n = Math.hypot(dx, dy) || 1;
        g.hero.fx = dx / n; g.hero.fy = dy / n;
        // (the doors stay as they are: open once he has been near)
      }, p);
      await page.waitForTimeout(900);
      if (process.env.FILM === '1' && i === 0) {
        // FILM=1: he walks from the room through the door, along the corridor behind the wall that stands again, and back
        const pts = [];
        const inside = -p.out * 2.5, past = p.out * 1.4;
        const along = (u, v) => (p.alongX ? { x: p.mx + v, y: p.my + u } : { x: p.mx + u, y: p.my + v });
        const add = (a, b, n) => { for (let k = 0; k < n; k++) { const t = k / n; pts.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }); } };
        const A = along(inside, 0), B = along(past, 0), C = along(past, 1.0);
        add(A, B, 14); add(B, C, 6); for (let k = 0; k < 6; k++) pts.push(C); add(C, B, 6); add(B, A, 14); for (let k = 0; k < 4; k++) pts.push(A);
        for (let k = 0; k < pts.length; k++) {
          await page.evaluate((q) => { const g = window.__dbg.game(); const h = g.hero; const dx = q.x - h.x, dy = q.y - h.y; if (Math.hypot(dx, dy) > 0.01) { const n = Math.hypot(dx, dy); h.fx = dx / n; h.fy = dy / n; } h.x = q.x; h.y = q.y; }, pts[k]);
          await page.waitForTimeout(90);
          await page.screenshot({ path: `${process.env.FILM_DIR}/f${String(k).padStart(3, '0')}.png` });
        }
      }
      await snap(`floor${depth}_door${i + 1}`);
      log('fades', JSON.stringify(await page.evaluate(() => [...window.__dbg.renderer.doorFade.entries()].map(([k, v]) => [k, Math.round(v.a * 100) / 100]))));
    }
  }
}
