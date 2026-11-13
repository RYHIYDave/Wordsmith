// FLOOR 5'S TEMPLE DOOR'S TWO KEY-BEARERS (art/key_bearers.ts, game/act1_rules/keybearers.ts, behind TEMPLE_DOOR), filmed for him in
// the game itself: each of their blows made at the hero, who stands (made unhurtable); then each killed, his key ringing to the floor
// and taken, the keys counted at the top of the screen. A frame every thirtieth of the game's second; tools/key_bearers_cut.py makes
// the film of them, each part named.
//   node tools/build_to.mjs dist/keybearers.html
//   node tools/playtest.mjs --file dist/keybearers.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/key_bearers_film.mjs --out shots/keybearers/k
//   env ONLY=stab,throw,... (the parts by name), CLS, SEED
import { log } from './lib.mjs';

const FPS = 30;
// [name, kind, act (or 'kill'), how far off, to his side, seconds, the part's title, and its film's crop round them (its width, and
// the height of its middle, in the picture's pixels: the hero stands at about 844, 382)]
const PARTS = [
  ['stab', 'keyblade', 'keyblade:stab', 2.7, 0.9, 3.0, 'THE KNIFE: THE STAB', 720, 300],
  ['throw', 'keyblade', 'keyblade:throw', 4.8, 1.0, 1.9, 'THE KNIFE: THE THROWN DAGGER', 760, 230],
  ['leap', 'keyblade', 'keyblade:leap', 3.8, 0.8, 1.8, 'THE KNIFE: THE LEAP', 720, 260],
  ['sigil', 'keyflame', 'keyflame:sigil', 4.5, 1.0, 4.2, 'THE FLAME: THE GREAT SIGIL', 900, 230],
  ['fan', 'keyflame', 'keyflame:fan', 4.8, 0.8, 2.4, 'THE FLAME: THE FAN OF FIRE', 800, 230],
  ['ring', 'keyflame', 'keyflame:ring', 2.4, 0.4, 2.9, 'THE FLAME: THE RING OF FIRE', 1000, 300],
  ['keyblade', 'keyblade', 'kill', 2.4, 0.8, 3.4, 'THE KNIFE FALLS: HIS KEY', 900, 253],
  ['keyflame', 'keyflame', 'kill', 2.4, 0.8, 3.4, 'THE FLAME FALLS: HIS KEY', 900, 253],
];

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 9);
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const list = PARTS.filter((p) => !only || only.includes(p[0]));
  const at = await page.evaluate(([cls, seed]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.templeDoor.sw.on = true;
    d.trial(cls, 5, seed);
    d.god = true;
    if (d.floorNames) d.floorNames(false);
    return { depth: d.game().depth, bearers: d.templeDoor.bearers() };
  }, [cls, seed]);
  log('floor', JSON.stringify(at));
  if (at.bearers.length < 2) {
    log('!! not two key-bearers on floor 5');
    return;
  }
  // (the floor's coming-in played out, its name gone from the screen)
  await page.waitForFunction(() => window.__dbg.game().time > 9, null, { timeout: 180000 });
  // (the hero in the knife's room, in its open middle, facing up the screen; every other monster gone; the floor seen)
  const stand = await page.evaluate(() => {
    const d = window.__dbg;
    const g = d.game();
    const k = g.monsters.find((m) => m.kind === 'keyblade');
    for (const m of g.monsters) if (m.kind !== 'keyblade' && m.kind !== 'keyflame') m.dead = true;
    g.monsters.splice(0, g.monsters.length, ...g.monsters.filter((m) => !m.dead));
    // (and the floor's traps, that nothing but the bearers' blows is seen)
    g.traps.length = 0;
    g.level.hazards.length = 0;
    // (the open spot in his room, nearest where he waits, with the most floor round it)
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
    for (const m of g.monsters) {
      m.life = m.maxLife = 1e7;
      m.words = [];
    }
    g.level.explored.fill(1);
    return best;
  });
  log('stand', JSON.stringify(stand));
  const parts = [];
  let frame = 0;
  for (const [name, kind, act, dist, side, secs, title, cw, cy] of list) {
    await page.evaluate(([stand, kind, dist, side, act]) => {
      const d = window.__dbg;
      const g = d.game();
      const h = g.hero;
      h.x = stand.x;
      h.y = stand.y;
      h.fx = -0.6;
      h.fy = -0.8;
      g.perils.length = 0;
      if (d.fx && d.fx.messages) d.fx.messages.length = 0;
      // (the other one sent far off, still)
      const other = kind === 'keyblade' ? 'keyflame' : 'keyblade';
      const o = g.monsters.find((m) => m.kind === other && !m.dead);
      if (o) {
        o.x = 2.5;
        o.y = 2.5;
        o.cd = 999;
        o.state = 'sleep';
      }
      d.templeDoor.bearerAt(kind, dist, side);
      d.templeDoor.hold(kind, 999);
      if (act === 'kill') {
        const m = g.monsters.find((q) => q.kind === kind && !q.dead);
        if (m) m.life = 1;
      }
    }, [stand, kind, dist, side, act]);
    await page.waitForTimeout(700);
    // (begun as the part's film begins: put back where it was to stand, it may have come on while its pictures were painted)
    await page.evaluate(([stand, kind, act, dist, side]) => {
      const d = window.__dbg;
      const h = d.game().hero;
      h.x = stand.x;
      h.y = stand.y;
      h.fx = -0.6;
      h.fy = -0.8;
      d.templeDoor.bearerAt(kind, dist, side);
      if (act === 'kill') d.templeDoor.kill(kind);
      else d.templeDoor.act(kind, act, 999);
    }, [stand, kind, act, dist, side]);
    parts.push([frame, title, cw, cy]);
    log('part', name, frame);
    const c0 = await page.evaluate(() => window.__dbg.clock());
    const n = Math.round(secs * FPS);
    for (let i = 0; i < n; i++) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
      await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
      // (a key lying: he walks onto it, half way through the part)
      if (act === 'kill' && i === Math.round(n * 0.55)) {
        await page.evaluate(() => {
          const d = window.__dbg;
          const k = d.templeDoor.keysLying()[0];
          const h = d.game().hero;
          if (k) {
            h.x = k.x;
            h.y = k.y + 0.05;
          }
        });
      }
      await snap(`f${String(frame).padStart(4, '0')}`);
      frame++;
    }
    log('after', JSON.stringify(await page.evaluate(() => ({ door: window.__dbg.templeDoor.state(), bearers: window.__dbg.templeDoor.bearers(), hurt: window.__dbg.game().hero.life }))));
  }
  snap.note('film', { fps: FPS, parts });
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
