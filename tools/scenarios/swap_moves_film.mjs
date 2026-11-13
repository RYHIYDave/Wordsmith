// THE MAGE'S AND THE RANGER'S MOVES TO SWAP AT WORK (game/swap_moves.ts, behind SWAP_MOVES), filmed for the owner in the practice
// room, a frame at a time, a caption over each part (THE LOOKS ARE STAND-INS: a ball of light, a streak, a ring, the trap's jaws).
//   node tools/build_to.mjs dist/swapfilm.html
//   CLS=mage node tools/playtest.mjs --file dist/swapfilm.html --touch --size 844x390 --dpr 2 --scenario tools/scenarios/swap_moves_film.mjs --out shots/swapfilm/mage/f
//   env FROM=s: no stills before then (the game runs on at its own pace).
//   then: ffmpeg -framerate 30 -i shots/swapfilm/mage/f_f%03d.png -pix_fmt yuv420p mage.mp4
const FPS = 30;

// (a pack ahead in a loose line, for the Spear's line and the Ball's burst)
const PACK = [[3.2, 0.0], [4.0, 0.7], [4.2, -0.8], [5.4, 0.1], [6.6, -0.2], [3.0, 2.6]];

//   [at, what, ...args]: take ...talents; set tap|hold move; aura kind; tapM i (tap at enemy i); tap dx dy; hold dx dy secs;
//   tapHer; free i; caption text
const PLANS = {
  mage: {
    secs: 27,
    take: ['kindling', 'ball', 'searing', 'charged', 'beam', 'forking', 'bittercold', 'spear', 'deepfreeze', 'aura'],
    plan: [
      [0.0, 'caption', 'THE MAGE\'S NEW MOVES (stand-in looks)'],
      [0.6, 'set', 0, 'ball'], [0.6, 'caption', 'BALL: stops on the first enemy and bursts there'],
      [1.0, 'tapM', 0], [2.0, 'tapM', 1], [3.0, 'tapM', 2], [4.0, 'tapM', 3],
      [5.2, 'set', 0, 'spear'], [5.2, 'caption', 'SPEAR: thin and long, through every enemy in its line'],
      [5.6, 'tap', 7, 0], [6.6, 'tap', 7, 0.3], [7.6, 'tap', 7, -0.3],
      [9.0, 'set', 1, 'beam'], [9.0, 'caption', 'BEAM: held, steered with the finger'],
      [9.4, 'hold', 5, -1.5, 0.9], [10.3, 'hold', 5, 0, 0.9], [11.2, 'hold', 5, 1.5, 0.9],
      [13.0, 'aura', 'fire'], [13.0, 'caption', 'AURA, FIRE: a tap on her; every enemy in it burns'], [13.4, 'free', 0], [13.4, 'free', 1], [13.4, 'free', 2], [13.5, 'tapHer'],
      [18.0, 'aura', 'lightning'], [18.0, 'caption', 'AURA, LIGHTNING: bolts to every enemy in it'], [18.2, 'tapHer'],
      [22.5, 'aura', 'frost'], [22.5, 'caption', 'AURA, FROST: a shield on her; every enemy in it chilled'], [22.7, 'tapHer'],
    ],
  },
  ranger: {
    secs: 21,
    take: ['fleet', 'windrunner', 'wildcompanion', 'keeneye', 'venom', 'huntcompanion', 'quickdraw', 'longshot', 'lightstep', 'huntersmark', 'widetraps', 'snare', 'splitshot', 'snipe'],
    plan: [
      [0.0, 'caption', 'THE RANGER\'S NEW MOVES (stand-in looks)'],
      [0.6, 'caption', 'SNARE (in place of Shot): thrown; what walks in is held, then it bursts'],
      [0.8, 'free', 0], [0.8, 'free', 1], [0.8, 'free', 2],
      [1.0, 'tap', 2.4, 0.4], [2.2, 'tap', 2.6, -0.8],
      [6.6, 'line'],
      [6.8, 'caption', 'SNIPE (in place of Volley): hold to draw; the longer, the harder; through its line'],
      [7.4, 'hold', 7, 0, 0.2], [9.0, 'hold', 7, 0, 1.6],
      [12.3, 'take+', 'rally'], [12.3, 'set', 1, 'rally'],
      [12.3, 'caption', 'RALLY (another in place of Volley): his companions faster and harder for a few seconds'],
      [12.5, 'free', 0], [12.5, 'free', 1], [12.5, 'free', 2], [12.5, 'free', 3],
      [13.4, 'hold', 2, 0, 0.1],
    ],
  },
};

export default async function (page, snap) {
  const cls = process.env.CLS || 'mage';
  const P = PLANS[cls];
  await page.evaluate((cls) => {
    const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.swapMoves.on = true; d.practice(cls, 7); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const cap = document.createElement('div');
    cap.id = '__cap';
    cap.style.cssText = 'position:fixed;left:0;right:0;top:0;padding:6px 10px;background:rgba(10,8,24,.82);color:#e8f6ff;font:600 15px system-ui,sans-serif;text-align:center;z-index:99999;pointer-events:none';
    document.body.appendChild(cap);
  }, cls);
  await page.waitForTimeout(500);
  const ids = await page.evaluate(([pack, take]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    h.fx = 1; h.fy = 0;
    h.talents = take.slice(); g.refresh();
    return pack.map(([dx, dy]) => {
      const m = g.spawn('skeleton', h.x + dx, h.y + dy, 1, 0, false, g.rng);
      g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9;
      m.state = 'recover'; m.t = 1e9; m.anim = 'idle';
      const far = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / far; m.fy = (h.y - m.y) / far;
      return m.id;
    });
  }, [PACK, P.take]);
  await page.evaluate(([plan, ids]) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    const x0 = h.x; const y0 = h.y;
    const f = { t: 0, plan: plan.slice(), ids, log: [], holding: null };
    window.__sfilm = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      while (f.plan.length && f.plan[0][0] <= f.t) {
        const step = f.plan.shift();
        const [, what, a, b, secs] = step;
        h.mana = h.d.maxMana;
        for (const s of h.skills) if (s) s.cd = 0;
        h.swingT = 0;
        const mon = (i) => g.monsters.find((q) => q.id === ids[i] && !q.dead) || g.monsters.find((q) => !q.dead);
        if (what === 'caption') document.getElementById('__cap').textContent = a;
        else if (what === 'set') { (h.picks ??= {})[a === 0 ? '@tap' : '@hold'] = b; g.refresh(); }
        else if (what === 'take+') { h.talents = [...h.talents, a]; g.refresh(); }
        else if (what === 'aura') { (h.picks ??= {}).aura = a; g.aura.on = 0; g.aura.wait = 0; }
        else if (what === 'tapM') { const m = mon(a); if (m) { c.fire = true; c.aimX = m.x; c.aimY = m.y; } }
        else if (what === 'tap') { c.fire = true; c.aimX = x0 + a; c.aimY = y0 + b; }
        else if (what === 'hold') { c.cast = true; c.castX = x0 + a; c.castY = y0 + b; c.hold = true; f.holding = { until: f.t + secs, x: x0 + a, y: y0 + b }; }
        else if (what === 'tapHer') c.change = true;
        else if (what === 'line') {
          // (the pack stood back in a line ahead of him, still, for the Snipe)
          g.monsters.filter((m) => !m.dead).forEach((m, k) => { m.x = x0 + 3 + k * 1.1; m.y = y0 + (k % 2 ? 0.25 : -0.25); m.speed = 0; m.cd = 1e9; m.state = 'recover'; m.t = 1e9; m.stunT = 0; });
        }
        else if (what === 'free') { const m = mon(a); if (m) { m.speed = 1.2; m.cd = 1.2; m.state = 'chase'; m.t = 0; } }
        f.log.push(`${f.t.toFixed(2)} ${what} ${a ?? ''}`);
      }
      if (f.holding) {
        if (f.t < f.holding.until) { c.hold = true; c.castX = f.holding.x; c.castY = f.holding.y; } else f.holding = null;
      }
      return run(dt, c);
    };
  }, [P.plan, ids]);
  const c0 = await page.evaluate(() => window.__dbg.clock());
  const total = Math.round(P.secs * FPS);
  const from = Number(process.env.FROM || 0);
  for (let i = 0; i < total; i++) {
    const skip = i / FPS < from;
    await page.evaluate((s) => { window.__dbg.slowmo = s; }, skip ? 1 : 0.25);
    await page.waitForFunction((at) => {
      const d = window.__dbg;
      if (d.clock() < at) return false;
      d.slowmo = 1e-6;
      return true;
    }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
    if (skip) continue;
    await snap(`f${String(i).padStart(3, '0')}`);
    if (i % 90 === 0) console.log(`  ${(i / FPS).toFixed(1)} s`);
  }
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
  console.log((await page.evaluate(() => window.__sfilm.log)).join('\n'));
}
