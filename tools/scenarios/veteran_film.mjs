// THE VETERAN IN PLAY (game/veteran.ts, behind VETERAN: switched on here with __dbg.veteran), filmed for the owner before he goes
// live (his words, 3 Nov 2026: “Got time to put in the new brawler and the rocket jump?”, and 25.0 held for him). In the practice
// room, against skeletons that stand and cannot die: his combos played by the game's own rules, each press put in as a tap, a
// hold or a swipe would put it (Game.vetPress), his globes filling over him: jab, cross, hook; jab, cross, the flying knee; the
// round kick, the push kick, the spinning jump kick among four; the round kick, the spinning elbow, the round kick; the dodge
// jump, then a tap in fire. A picture every thirtieth of a second of the GAME's time (as golem_rocket_film.mjs).
//   node tools/build_brawler_to.mjs dist/vet.html
//   node tools/playtest.mjs --touch --size 844x390 --dpr 1.5 --scenario tools/scenarios/veteran_film.mjs --file dist/vet.html --out shots/vetfilm/x
//   env: FILM_SECONDS (how long), PARTS_ONLY (the parts' names to film, between bars: |)

const FPS = 30;
/** (seconds into the film) the part, where the skeletons stand (from him, along +x, and to the side), and the presses: [seconds into the part, press]. */
const PLAN = [
  { at: 0.3, name: 'JAB, CROSS, HOOK', line: 'Tap, tap, tap: three green globes, locked.', foes: [[2.3, 0], [2.4, 0.9]], presses: [[0, 't'], [0.25, 't'], [0.5, 't']] },
  { at: 4.0, name: 'JAB, CROSS, FLYING KNEE', line: 'Tap, tap, swipe and hold: the third globe in orange fire.', foes: [[2.3, 0]], presses: [[0, 't'], [0.25, 't'], [0.5, 's'], [0.55, 'h']] },
  { at: 8.6, name: 'ROUND KICK, PUSH KICK, SPINNING JUMP KICK', line: 'Hold, hold, swipe and hold: the push kick shoves a cone; the spin kick hits all round.', foes: [[2.3, 0], [2.8, 1.2], [-2.5, 0.3], [0.2, -2.6]], presses: [[0, 'h'], [0.3, 'h'], [0.6, 's'], [0.65, 'h']] },
  { at: 13.6, name: 'ROUND KICK, SPINNING ELBOW, ROUND KICK', line: 'Hold, tap, hold: knocks them back to make room.', foes: [[2.3, 0], [2.4, -0.8]], presses: [[0, 'h'], [0.3, 't'], [0.6, 'h']] },
  { at: 18.0, name: 'THE DODGE JUMP, THEN THE FLYING UPPERCUT', line: 'A swipe: the dodge. Then swipe and tap: the uppercut throws them up.', foes: [[2.3, 0]], presses: [[0, 'sb'], [2.2, 's'], [2.25, 't']] },
];

export default async function (page, snap) {
  const only = process.env.PARTS_ONLY ? process.env.PARTS_ONLY.split('|') : null;
  const plan = only ? PLAN.filter((p) => only.includes(p.name)) : PLAN;
  const seconds = Number(process.env.FILM_SECONDS || (plan.length ? plan[plan.length - 1].at - plan[0].at + 4.6 : 4));
  const t0 = plan.length ? plan[0].at : 0;
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.veteran.on = true;
    d.practice('brawler', 5);
    d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
  });
  await page.waitForTimeout(800);
  await page.evaluate(([plan, t0]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const f = { t: 0, film: -1, parts: plan.map((p) => ({ ...p, at: p.at - t0, done: false, presses: p.presses.map((q) => [...q]) })), ids: [], home: [h.x, h.y], log: [] };
    window.__vf = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      if (d.fx) d.fx.messages.length = 0;
      h.mana = h.d.maxMana;
      if (f.film >= 0) {
        const ft = f.t - f.film;
        for (const p of f.parts) {
          if (!p.done && p.at <= ft) {
            p.done = true;
            // (the last ones gone; him back where he stood, facing down the room; his globes out; his jump ready)
            for (const id of f.ids) { const k = g.monsters.findIndex((m) => m.id === id); if (k >= 0) g.monsters.splice(k, 1); }
            f.ids = [];
            h.x = f.home[0]; h.y = f.home[1]; h.fx = 1; h.fy = 0;
            h.vet = { globes: [], queue: [], move: null, done: [], idle: 0 };
            h.skills[2].charges = h.skills[2].maxCharges; h.skills[2].cd = 0;
            for (const [a, b] of p.foes) {
              const m = g.spawn('skeleton', h.x + a, h.y + b, 1, 0, false, g.rng);
              g.wakeUp(m);
              m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9;
              const q = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / q; m.fy = (h.y - m.y) / q;
              f.ids.push(m.id);
            }
            p.start = ft;
          }
          if (p.done) {
            while (p.presses.length && p.start + p.presses[0][0] <= ft) {
              const [, k] = p.presses.shift();
              const target = g.monsters.find((m) => f.ids.includes(m.id));
              const cc = { ...c, aimX: target ? target.x : h.x + 1, aimY: target ? target.y : h.y };
              // (a swipe away from them, 'sb': back up the room)
              if (k === 'sb') { h.skills[2].charges = h.skills[2].maxCharges; g.vetPress('swipe', cc, h.x - 3, h.y); }
              else if (k === 's') { h.skills[2].charges = h.skills[2].maxCharges; h.skills[2].cd = 0; g.vetPress('swipe', cc, h.x - 3, h.y); }
              else g.vetPress(k === 't' ? 'tap' : 'hold', cc);
              f.log.push(`${ft.toFixed(2)} ${p.name}: ${k} -> ${JSON.stringify(h.vet.globes)}`);
            }
          }
        }
      }
      // (what he aims at: the nearest of them)
      const near = g.monsters.filter((m) => f.ids.includes(m.id)).sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
      if (near) { c.aimX = near.x; c.aimY = near.y; }
      return run(dt, c);
    };
  }, [plan, t0]);
  // (his pictures painted meanwhile: the first frames of his moves)
  await page.waitForTimeout(3000);
  const c0 = await page.evaluate(() => { const d = window.__dbg; d.slowmo = 1e-6; window.__vf.film = window.__vf.t; return d.clock(); });
  const slow = 0.05;
  const total = Math.round(seconds * FPS);
  for (let i = 0; i < total; i++) {
    await page.evaluate((slow) => { window.__dbg.slowmo = slow; }, slow);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 300000 });
    await snap(`f${String(i).padStart(4, '0')}`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__vf.log)).join('\n'));
  const parts = plan.map((p) => [p.at - t0, p.name, p.line]);
  console.log('PARTS ' + JSON.stringify(parts));
}
