// THE TOWN'S GATE AS ONE OF THE LEVELS' GATES (a mock-up behind CRYPT, off). The owner's outline,
// 9 Oct 2026, 22:47: "The gate on the wall with be turned to a gate from the levels.  It will open
// automatically as you approach it and go through." This puts one of the levels' gates (art/gates.ts,
// a plain arch and its portcullis, as a lever's gate has) in the doorway of three tiles where the
// field of light is, opens the doorway behind it to the dark, and raises it, at the game's own
// pace, as the hero comes within RISE tiles of it; he walks up and under it. Nothing of the game
// knows of it: where the gate goes and what it does are the main chat's. Not a test.
// A frame every 30th of a second of the game's time (<out>_f000.png ...).
//   node tools/playtest.mjs --file dist/crypt.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/crypt_gate.mjs --out shots/crypt/gate
import { log } from './lib.mjs';

export default async function (page, snap) {
  // (it must begin to rise when he is RISE tiles off or more: at his pace, 4.6 tiles a second, TUNE.heroSpeed, and its,
  // 1.1 s to rise, GATE_RISE, he is at the bars a little over a second after it begins: 5.4 tiles or more, or he walks into them)
  const rise = Number(process.env.RISE) || 6;
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.crypt(true);
    const g = d.game(); const L = g.level; const f = L.floor;
    // the doorway: three tiles of the gate's wall opened to the dark beyond, the gate in its face
    for (const x of [13, 14, 15]) { const i = 5 * f.w + x; f.tiles[i] = 1; L.walk[i] = 1; L.explored[i] = 1; }
    L.doors.push({ spot: { kind: 'gate', room: 0, alongX: true, near: false, a: 13, plane: 6, out: -1 }, open: 0, want: 0, told: true });
    const h = g.hero; h.x = 14.5; h.y = 13.6; h.fx = 0; h.fy = -1;
  });
  await page.waitForTimeout(900);
  await page.evaluate(() => { window.__dbg.fx.messages.length = 0; window.__dbg.slowmo = 0.1; });
  const FPS = 30;
  const step = 1000 / FPS / 0.1;
  const t0 = Date.now();
  const from = 13.6;
  const to = 5.45;
  const start = 10;
  const pace = 4.6 / FPS; // tiles a frame: the hero's own pace (TUNE.heroSpeed, 4.6 tiles a second) at 30 frames a second
  let walking = false;
  let opened = false;
  let end = -1;
  for (let i = 0; i < 160; i++) {
    const wait = t0 + i * step - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    if (i === start) { await page.keyboard.down('KeyW'); await page.keyboard.down('KeyD'); walking = true; }
    if (walking) {
      const y = Math.max(to, from - (i - start) * pace);
      await page.evaluate((y) => { const h = window.__dbg.game().hero; h.x = 14.5; h.y = y; }, y);
      // (and how far up the portcullis is as he comes to it)
      if (y <= 6.7 && y > 6.7 - pace) log('gate', `at the bars at frame ${i}: up ${(await page.evaluate(() => window.__dbg.game().level.doors[0].open)).toFixed(2)}`);
      if (!opened && y - 6 < rise) {
        opened = true;
        await page.evaluate(() => { const L = window.__dbg.game().level; L.doors[0].want = 1; });
        log('gate', `opening at frame ${i}`);
      }
      if (y <= to) { await page.keyboard.up('KeyW'); await page.keyboard.up('KeyD'); walking = false; end = i + 8; }
    }
    await snap(`f${String(i).padStart(3, '0')}`);
    if (end >= 0 && i >= end) break;
  }
  if (walking) { await page.keyboard.up('KeyW'); await page.keyboard.up('KeyD'); }
  const open = await page.evaluate(() => window.__dbg.game().level.doors[0].open);
  log('gate', `open ${open.toFixed(2)} at the end`);
  await page.evaluate(() => { window.__dbg.slowmo = 1; window.__dbg.crypt(false); });
}
