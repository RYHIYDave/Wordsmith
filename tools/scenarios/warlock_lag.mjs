// THE WARLOCK'S LAG, MEASURED (his word to the art chat, 30 Oct 2026: worst "Changing into the demon,Casting spells", and
// "all the damage over time numbers flying off the enemies accounted for most of the leg"). In the practice room with a
// ring of skeletons that stand to be struck, he casts his bolt and his curse by the game's clock; then his pact is filled
// and he changes, and the demon fights. For each stretch: frames drawn, the longest, how many took over 50 ms, the time
// spent painting pictures where the game is played (art/kit.ts PAINTING), and the most numbers and sparks in the air.
// A stretch is played again with the numbers left out (NONUM), to see what they cost.
//   node tools/playtest.mjs --file dist/warlock.html --scenario tools/scenarios/warlock_lag.mjs --out shots/lag/l
const LONG = Number(process.env.LONG ?? 8);

export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false);
    d.practice('warlock', 12); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
    const h = g.hero;
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2; const r = 2.6 + (i % 3) * 1.1;
      const m = g.spawn('skeleton', h.x + Math.cos(a) * r, h.y + Math.sin(a) * r, 7, 0, false, g.rng);
      m.words = []; m.carries = []; m.shield = 0; m.life = m.maxLife = 1e7; m.cd = 1e9; m.speed = 0;
      g.wakeUp(m);
    }
    const f = { t: 0, change: false };
    window.__lag = f;
    const run = g.update.bind(g);
    g.update = (dt, c) => {
      f.t += dt;
      const ms = g.monsters.filter((q) => !q.dead);
      const m = ms[Math.floor(f.t * 1.7) % Math.max(1, ms.length)];
      if (m) {
        if (Math.floor(f.t * 2) % 2 === 0) { c.fire = true; c.aimX = m.x; c.aimY = m.y; }
        if (Math.floor(f.t / 2.5) !== Math.floor((f.t - dt) / 2.5)) { c.cast = true; c.castX = m.x; c.castY = m.y; }
      }
      if (f.change) { c.change = true; f.change = false; }
      return run(dt, c);
    };
  });
  await page.waitForTimeout(2000);
  // (what each part of the effects and the drawing takes, a frame: wrapped once here)
  await page.evaluate(() => {
    const d = window.__dbg; const T = (window.__T = {});
    const wrap = (o, k, name) => { const f = o[k].bind(o); o[k] = (...a) => { const t0 = performance.now(); try { return f(...a); } finally { T[name] = (T[name] ?? 0) + performance.now() - t0; } }; };
    for (const k of ['drawText', 'drawAir', 'drawGround', 'handle', 'update']) wrap(d.fx, k, k);
    wrap(d.renderer, 'draw', 'world');
  });
  if (process.env.TRACE === '1') await page.evaluate(() => { window.__TRACE = true; });
  const stretch = (name, long) => page.evaluate(([name, long]) => new Promise((res) => {
    const d = window.__dbg; const fx = d.fx;
    let n = 0; let worst = 0; let over = 0; let last = performance.now(); const t0 = last;
    const p0 = d.painting.ms; const f0 = d.painting.frames; let nums = 0; let sparks = 0;
    if (window.__TRACE) d.painting.trace = new Map();
    for (const k in window.__T) window.__T[k] = 0;
    const tick = (now) => {
      n++; const dt = now - last; worst = Math.max(worst, dt); if (dt > 50) over++; last = now;
      nums = Math.max(nums, fx.floaters.length); sparks = Math.max(sparks, fx.particles.length);
      if (now - t0 < long * 1000) requestAnimationFrame(tick);
      else res(`${name.padEnd(22)} fps ${(n / ((now - t0) / 1000)).toFixed(1).padStart(5)}  worst ${worst.toFixed(0).padStart(5)} ms  over50 ${String(over).padStart(3)}  painted ${String(d.painting.frames - f0).padStart(4)} frames ${(d.painting.ms - p0).toFixed(0).padStart(6)} ms  numbers ${String(nums).padStart(2)}  sparks ${sparks}  form ${d.game().hero.form ?? 'man'}\n    ms a frame: ${Object.entries(window.__T).map(([k, v]) => `${k} ${(v / n).toFixed(1)}`).join('  ')}` + (d.painting.trace ? '\n    ' + [...d.painting.trace].sort((a, b) => b[1].ms - a[1].ms).slice(0, 5).map(([k, v]) => `${v.n} ${v.ms.toFixed(0)}ms ${k.slice(0, 150)}`).join('\n    ') : ''));
    };
    requestAnimationFrame(tick);
  }), [name, long]);
  const nonum = (on) => page.evaluate((on) => {
    const fx = window.__dbg.fx;
    if (on) { fx.__float ??= fx.float; fx.float = () => {}; } else if (fx.__float) fx.float = fx.__float;
  }, on);
  console.log(await page.evaluate(() => `painter: ${JSON.stringify(window.__dbg.painter ? { up: !!window.__dbg.painter.groundLane?.worker, heroFrames: window.__dbg.painter.heroFrames } : null)}`));
  console.log(await stretch('man, first casts', LONG));
  if (process.env.WARM === '1') for (let i = 0; i < 8; i++) console.log(await stretch(`man, warming ${i}`, LONG));
  console.log(await stretch('man', LONG));
  await nonum(true);
  console.log(await stretch('man, NONUM', LONG));
  await nonum(false);
  await snap('man');
  await page.evaluate(() => { const h = window.__dbg.game().hero; h.pact = 999; window.__lag.change = true; });
  console.log(await stretch('the change, demon', LONG));
  console.log(await stretch('demon', LONG));
  await nonum(true);
  console.log(await stretch('demon, NONUM', LONG));
  await nonum(false);
  await snap('demon');
  console.log(await page.evaluate(() => `painter: ${JSON.stringify(window.__dbg.painter ? { heroFrames: window.__dbg.painter.heroFrames } : null)}`));
}
