// FLOOR 5'S TEMPLE DOOR, THE WHOLE EVENT IN PLAY (game/temple_door.ts, game/act1_rules/keybearers.ts, behind TEMPLE_DOOR), filmed
// for his yes: the door barred and what it says; the Keybearer of the Knife fought in his room, falling, his key taken; the Keybearer
// of the Flame likewise; the keys counted at the side; back at the door, the keys turning, the chains falling, the temple opening. A
// frame every thirtieth of the game's second; tools/key_bearers_cut.py makes the film, each part named. The hero made unhurtable.
//   node tools/build_to.mjs dist/keybearers.html
//   node tools/playtest.mjs --file dist/keybearers.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/temple_event_film.mjs --out shots/templeevent/e
import { log } from './lib.mjs';

const FPS = 30;

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 9);
  const ok = await page.evaluate(([cls, seed]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.templeDoor.sw.on = true;
    d.trial(cls, 5, seed);
    d.god = true;
    if (d.floorNames) d.floorNames(false);
    return d.templeDoor.bearers().length === 2 && !!d.templeDoor.state();
  }, [cls, seed]);
  if (!ok) {
    log('!! no door or not two bearers');
    return;
  }
  await page.waitForFunction(() => window.__dbg.game().time > 9, null, { timeout: 180000 });
  // (only the bearers left, and no traps: the event alone)
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.monsters.splice(0, g.monsters.length, ...g.monsters.filter((m) => m.kind === 'keyblade' || m.kind === 'keyflame'));
    g.traps.length = 0;
    g.level.hazards.length = 0;
    g.level.explored.fill(1);
    for (const m of g.monsters) {
      m.words = [];
      m.cd = 999;
    }
  });
  // ---- the hands: a finger on the left stick, a tap on the right ----
  const cdp = await page.context().newCDPSession(page);
  const client = (gx, gy) => page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [gx, gy]);
  const scr = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h }));
  let stick = null;
  const steer = async (wdx, wdy) => {
    const sdx = (wdx - wdy) * 2;
    const sdy = wdx + wdy;
    const n = Math.hypot(sdx, sdy) || 1;
    const o = await client(Math.round(scr.w * 0.17), Math.round(scr.h * 0.62));
    const to = await client(Math.round(scr.w * 0.17 + (sdx / n) * 26), Math.round(scr.h * 0.62 + (sdy / n) * 26));
    if (!stick) await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: Math.round(o.x), y: Math.round(o.y), id: 1 }] });
    stick = to;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: Math.round(to.x), y: Math.round(to.y), id: 1 }] });
  };
  const letGo = async () => {
    if (!stick) return;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    stick = null;
  };
  const tap = async () => {
    const c = await client(Math.round(scr.w * 0.78), Math.round(scr.h * 0.45));
    const pt = [{ x: Math.round(c.x), y: Math.round(c.y), id: 7 }];
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: stick ? [{ x: Math.round(stick.x), y: Math.round(stick.y), id: 1 }, ...pt] : pt });
    await page.waitForTimeout(40);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: stick ? [{ x: Math.round(stick.x), y: Math.round(stick.y), id: 1 }] : [] });
  };
  // ---- the film ----
  const parts = [];
  let frame = 0;
  /** Film `secs` of the game, `each(i)` done before each frame (i from 0). */
  const film = async (secs, each) => {
    const c0 = await page.evaluate(() => window.__dbg.clock());
    const n = Math.round(secs * FPS);
    for (let i = 0; i < n; i++) {
      if (each) await each(i);
      await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
      await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
      await snap(`f${String(frame).padStart(4, '0')}`);
      frame++;
    }
  };
  const heroAt = () => page.evaluate(() => { const h = window.__dbg.game().hero; return { x: h.x, y: h.y }; });
  /** Walk toward (x, y) until within `near`, each frame steered anew. */
  const walkTo = (x, y, near) => async () => {
    const h = await heroAt();
    if (Math.hypot(x - h.x, y - h.y) <= near) await letGo();
    else await steer(x - h.x, y - h.y);
  };

  // 1. THE DOOR, BARRED: seen from the mine, he walks up to it; it tells him what it wants
  await page.evaluate(() => window.__dbg.templeDoor.standBefore(4.4));
  await page.waitForTimeout(600);
  const door = await page.evaluate(() => {
    const d = window.__dbg;
    const s = d.templeDoor.state();
    const at = d.templeDoor.standBefore(4.4);
    return { at, s };
  });
  log('door', JSON.stringify(door));
  parts.push([frame, 'THE TEMPLE DOOR, BARRED', 900, 300]);
  const front = await page.evaluate(() => window.__dbg.templeDoor.standBefore(2.0));
  await page.evaluate(() => window.__dbg.templeDoor.standBefore(4.4));
  await film(3.2, walkTo(front.x, front.y, 0.3));
  await letGo();

  // 2. THE KEYBEARER OF THE KNIFE: in his room; he throws, he leaps with his flip; struck down; his key; taken
  const blade = await page.evaluate(() => {
    const d = window.__dbg;
    const g = d.game();
    const k = g.monsters.find((m) => m.kind === 'keyblade');
    const h = g.hero;
    // (the open spot near where he waits with the most floor up the screen from it, for him and his blows)
    let best = null;
    let most = -1;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const x = Math.floor(k.x) + dx + 0.5;
        const y = Math.floor(k.y) + dy + 0.5;
        if (!g.isOpen(x, y)) continue;
        let n = 0;
        for (let a = 0; a < 16; a++) for (const r of [2, 4, 6.5]) if (g.isOpen(x - 0.7 * r + Math.cos(a) * 0.3 * r, y - 0.7 * r + Math.sin(a) * 0.3 * r)) n++;
        if (n > most) {
          most = n;
          best = { x, y };
        }
      }
    }
    h.x = best.x;
    h.y = best.y;
    h.fx = -0.6;
    h.fy = -0.8;
    d.templeDoor.bearerAt('keyblade', 5.0, 0.6);
    d.templeDoor.hold('keyblade', 999);
    return { x: h.x, y: h.y };
  });
  await page.waitForTimeout(700);
  await page.evaluate((b) => { const h = window.__dbg.game().hero; h.x = b.x; h.y = b.y; window.__dbg.templeDoor.bearerAt('keyblade', 5.0, 0.6); window.__dbg.templeDoor.act('keyblade', 'keyblade:throw', 999); }, blade);
  parts.push([frame, 'THE KEYBEARER OF THE KNIFE', 820, 260]);
  await film(1.3);
  await page.evaluate(() => { window.__dbg.templeDoor.bearerAt('keyblade', 3.9, 0.6); window.__dbg.templeDoor.act('keyblade', 'keyblade:leap', 999); });
  await film(1.7, async (i) => { if (i % 9 === 4 && i > 50) await tap(); });
  await page.evaluate(() => window.__dbg.templeDoor.kill('keyblade'));
  let key = null;
  await film(3.0, async (i) => {
    if (i < 22) return;
    if (!key) key = (await page.evaluate(() => window.__dbg.templeDoor.keysLying()))[0] ?? null;
    if (key) await walkTo(key.x, key.y, 0.15)();
  });
  await letGo();

  // 3. THE KEYBEARER OF THE FLAME: his great sigil, his ring; struck down; his key; taken
  const flame = await page.evaluate(() => {
    const d = window.__dbg;
    const g = d.game();
    const k = g.monsters.find((m) => m.kind === 'keyflame');
    const h = g.hero;
    // (the open spot near where he waits with the most floor up the screen from it, for him and his blows)
    let best = null;
    let most = -1;
    for (let dy = -6; dy <= 6; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const x = Math.floor(k.x) + dx + 0.5;
        const y = Math.floor(k.y) + dy + 0.5;
        if (!g.isOpen(x, y)) continue;
        let n = 0;
        for (let a = 0; a < 16; a++) for (const r of [2, 4, 6.5]) if (g.isOpen(x - 0.7 * r + Math.cos(a) * 0.3 * r, y - 0.7 * r + Math.sin(a) * 0.3 * r)) n++;
        if (n > most) {
          most = n;
          best = { x, y };
        }
      }
    }
    h.x = best.x;
    h.y = best.y;
    h.fx = -0.6;
    h.fy = -0.8;
    g.perils.length = 0;
    d.templeDoor.bearerAt('keyflame', 4.5, 0.8);
    d.templeDoor.hold('keyflame', 999);
    return { x: h.x, y: h.y };
  });
  await page.waitForTimeout(700);
  await page.evaluate((b) => { const h = window.__dbg.game().hero; h.x = b.x; h.y = b.y; window.__dbg.templeDoor.bearerAt('keyflame', 4.5, 0.8); window.__dbg.templeDoor.act('keyflame', 'keyflame:sigil', 999); }, flame);
  parts.push([frame, 'THE KEYBEARER OF THE FLAME', 900, 250]);
  await film(2.2);
  await page.evaluate(() => { window.__dbg.templeDoor.bearerAt('keyflame', 2.6, 0.5); window.__dbg.templeDoor.act('keyflame', 'keyflame:ring', 999); });
  await film(2.4, async (i) => { if (i % 9 === 4 && i > 45) await tap(); });
  await page.evaluate(() => window.__dbg.templeDoor.kill('keyflame'));
  key = null;
  await film(3.0, async (i) => {
    if (i < 22) return;
    if (!key) key = (await page.evaluate(() => window.__dbg.templeDoor.keysLying()))[0] ?? null;
    if (key) await walkTo(key.x, key.y, 0.15)();
  });
  await letGo();

  // 4. THE TEMPLE OPENS: back at the door with both keys
  await page.evaluate(() => {
    const g = window.__dbg.game();
    g.perils.length = 0;
    window.__dbg.templeDoor.standBefore(4.4);
  });
  await page.waitForTimeout(600);
  parts.push([frame, 'BOTH KEYS: THE TEMPLE OPENS', 900, 300]);
  await film(1.4, walkTo(front.x, front.y, 0.3));
  await letGo();
  await film(5.2);
  snap.note('film', { fps: FPS, parts });
  log('end', JSON.stringify(await page.evaluate(() => window.__dbg.templeDoor.state())));
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
