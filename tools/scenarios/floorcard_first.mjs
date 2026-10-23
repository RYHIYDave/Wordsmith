// THE FLOOR'S NAME BEFORE THE FIRST DUNGEON'S PROMPT (game/defs.ts FLOOR_CARD_FIRST; main.ts). The owner,
// 12 Oct 2026, 07:45: "One thing I noticed is you cant see the warden level introduction.  It gets hidden by
// the tap to attack pop up". A new player's first floor, the first pack woken a few tiles off so that the
// fight prompt is due at once (FIGHT=1, the default; FIGHT=0 the walking prompt), pictures as the floor's
// name comes and goes. With FLOOR_CARD_FIRST as the game has it (on since 21.1, his "Looks good" of 07:51)
// the prompt waits while the name is up, and comes once it has gone: both are checked. CARDFIRST=0 shows
// the game as it was (the prompt over the name), for pictures.
//   node tools/build_to.mjs dist/card.html
//   node tools/playtest.mjs --file dist/card.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/floorcard_first.mjs --out shots/card/after
import { log, downTheStairs } from './lib.mjs';

export default async function (page, snap) {
  const fail = async (msg) => { console.log('  !! ' + msg); await page.evaluate((m) => console.error(m), 'floorcard: ' + msg); };
  const on = process.env.CARDFIRST !== '0';
  const fight = process.env.FIGHT !== '0';
  const cls = process.env.CLS || 'warrior';
  await page.evaluate(([o, c]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.floorCardFirst) d.floorCardFirst(o);
    d.first(c, 5);
    d.god = true;
  }, [on, cls]);
  // (THE WAYS BETWEEN THE FLOORS, Version 24.1, game/ways.ts EXITS: a new game begins in town, where no floor's name is shown:
  // there the walking prompt comes at once. With FIGHT, down the town's stairs (by script) to the first floor, its name, and the
  // fight prompt waiting through it, timed from his coming in)
  const inTown = await page.evaluate(() => window.__dbg.game().level.town);
  if (inTown && !fight) {
    await page.waitForTimeout(700);
    const s = await page.evaluate(() => ({ step: window.__dbg.game().guideStep(), banner: window.__dbg.ui.marks.has('banner') }));
    log('in town at 0.7 s', `prompt due: ${s.step}; shown: ${s.banner}`);
    await snap('town_t0700');
    if (s.step !== 'move' || !s.banner) await fail('a new game in town: the walking prompt should be shown at once (there is no floor\'s name there)');
    return;
  }
  let since = 0;
  if (inTown) {
    if (!(await downTheStairs(page))) { await fail('the town\'s stairs did not take him down to the first floor'); return; }
    // (downTheStairs comes back 0.7 s after he came in)
    since = 750;
  }
  if (fight) {
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const h = g.hero;
      // the nearest pack, woken and stood a few tiles off, where the hero can see it
      const live = g.monsters.filter((m) => !m.dead && !m.boss);
      live.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y));
      const L = g.level;
      const open = (x, y) => { const tx = Math.floor(x); const ty = Math.floor(y); return tx > 0 && ty > 0 && tx < L.floor.w && ty < L.floor.h && L.walk[ty * L.floor.w + tx] === 1; };
      let n = 0;
      for (const m of live.slice(0, 3)) {
        for (let r = 4; r <= 7 && n < 3; r += 0.5) {
          let put = false;
          for (let k = 0; k < 16; k++) {
            const a = (k / 16) * Math.PI * 2 + n;
            const x = h.x + Math.cos(a) * r; const y = h.y + Math.sin(a) * r;
            if (open(x, y)) { m.x = x; m.y = y; m.state = 'chase'; put = true; break; }
          }
          if (put) { n++; break; }
        }
      }
      g.updateVision(1);
    });
  }
  const t0 = Date.now() - since;
  for (const at of [700, 1700, 2700, 3900, 5200]) {
    const wait = at - (Date.now() - t0);
    if (wait > 0) await page.waitForTimeout(wait);
    const s = await page.evaluate(() => ({ step: window.__dbg.game().guideStep(), banner: window.__dbg.ui.marks.has('banner') }));
    log(`at ${(at / 1000).toFixed(1)} s`, `prompt due: ${s.step}; shown: ${s.banner}`);
    await snap(`t${String(at).padStart(4, '0')}`);
    if (!on) continue;
    // the name is up for FLOOR_NAMES.secs (3.4 s): the prompt waits through it, and is shown after
    if (at <= 2700 && s.banner) await fail(`at ${at / 1000} s the prompt is shown over the floor's name`);
    if (at >= 5200 && s.step && !s.banner) await fail(`at ${at / 1000} s the floor's name has gone, a prompt is due (${s.step}), and none is shown`);
  }
}
