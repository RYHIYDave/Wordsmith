// Stacked word combinations in a live fight, in a real browser. Random four-word loadouts go on
// both abilities at once, and both buttons are held down on the nearest monster in the practice
// room. For each loadout it reports the frame rate, the longest single frame, and how full the
// air and the floor got; the run fails if the page reports any error.
//   CLS=mage node tools/playtest.mjs --scenario tools/scenarios/combos.mjs --out shots/combo_mage
// Environment:
//   CLS    warrior | ranger | mage   (default warrior)
//   COUNT  how many loadouts (default 12)      SECS  seconds of fighting for each (default 6)
//   SEED   which random loadouts (default 1)
//   THROTTLE  slow the browser's processor down this many times (default 1 = not at all)
//   SETS   instead of random ones: "front|behind/front|behind" (quick/slow), separated by ';',
//          words joined by '+', e.g. "power+fire|twin+volatile/twin+frost|leech+lightning"
import { makeHands, log } from './lib.mjs';

const WORDS = ['power', 'swift', 'twin', 'fire', 'frost', 'lightning', 'leech', 'volatile'];
const ELEMENTS = ['fire', 'frost', 'lightning'];

function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const count = Number(process.env.COUNT || 12);
  const secs = Number(process.env.SECS || 6);
  const rand = rng(Number(process.env.SEED || 1) * 7919 + cls.length);
  const side = () => {
    for (;;) {
      const a = WORDS[Math.floor(rand() * 8)]; const b = WORDS[Math.floor(rand() * 8)];
      if (a !== b && !(ELEMENTS.includes(a) && ELEMENTS.includes(b))) return [a, b];
    }
  };
  const parse = (s) => { const [f, b] = s.split('|'); return { front: (f || '').split('+').filter(Boolean), behind: (b || '').split('+').filter(Boolean) }; };
  const sets = process.env.SETS
    ? process.env.SETS.split(';').map((s) => s.trim()).filter(Boolean).map((s) => s.split('/').map(parse))
    : Array.from({ length: count }, () => [{ front: side(), behind: side() }, { front: side(), behind: side() }]);

  // THROTTLE=4 makes the browser's processor four times slower, to stand in for a slower machine
  const throttle = Number(process.env.THROTTLE || 1);
  if (throttle > 1) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    log('processor slowed down by', throttle);
  }
  // SKIP=ground,zlight leaves parts of the picture out (see Renderer.skip), to find what costs the time
  if (process.env.SKIP) await page.evaluate((list) => { for (const k of list.split(',')) window.__dbg.renderer.skip.add(k); }, process.env.SKIP);
  await page.evaluate((c) => { const d = window.__dbg; d.practice(c, 7); d.autoLevel = false; }, cls);
  await page.waitForTimeout(400);
  const hands = await makeHands(page);
  const nearest = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; let best = null; let bd = 1e9;
    for (const m of g.monsters) { if (m.dead) continue; const k = Math.hypot(m.x - h.x, m.y - h.y); if (k < bd) { bd = k; best = m; } }
    return best ? d.at(best.x, best.y) : null;
  });
  let slowest = 999; let longest = 0; let fullest = 0; let n = 0;
  for (const set of sets) {
    const problems = await page.evaluate((set) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      for (let k = 0; k < 2; k++) for (const sd of ['front', 'behind']) { const grp = sd === 'front' ? h.skills[k].front : h.skills[k].behind; for (let i = 0; i < grp.length; i++) if (grp[i]) g.unsocket(k, sd, i); }
      for (const w of Object.keys(h.words)) h.words[w] = 4;
      const bad = [];
      for (let k = 0; k < 2; k++) {
        for (const w of set[k].front) { const why = g.socket(k, 'front', w); if (why) bad.push(`${w} in front: ${why}`); }
        for (const w of set[k].behind) { const why = g.socket(k, 'behind', w); if (why) bad.push(`${w} behind: ${why}`); }
      }
      return bad;
    }, set);
    // the meter: every frame the browser draws is counted and timed
    await page.evaluate(() => {
      const m = window.__meter = { n: 0, worst: 0, last: performance.now(), t0: performance.now(), parts: 0, zones: 0, shots: 0, kills0: window.__dbg.game().kills, on: true };
      const tick = (now) => {
        if (!m.on) return;
        m.n++; m.worst = Math.max(m.worst, now - m.last); m.last = now;
        const d = window.__dbg; const g = d.game();
        m.parts = Math.max(m.parts, d.fx.particles.length); m.zones = Math.max(m.zones, g.zones.length); m.shots = Math.max(m.shots, g.projectiles.length);
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    await page.mouse.down({ button: 'left' });
    await page.mouse.down({ button: 'right' });
    const t0 = Date.now();
    while (Date.now() - t0 < secs * 1000) {
      const at = await nearest();
      if (at) { const c = await hands.client(at.x, at.y - 10); await page.mouse.move(c.x, c.y); }
      await page.waitForTimeout(110);
    }
    const r = await page.evaluate(() => { const m = window.__meter; m.on = false; const g = window.__dbg.game(); return { fps: m.n / ((m.last - m.t0) / 1000), worst: m.worst, parts: m.parts, zones: m.zones, shots: m.shots, kills: g.kills - m.kills0, names: g.hero.skills.slice(0, 2).map((k) => k.r.name), over: g.over }; });
    await snap(String(n).padStart(2, '0'));
    await page.mouse.up({ button: 'left' });
    await page.mouse.up({ button: 'right' });
    slowest = Math.min(slowest, r.fps); longest = Math.max(longest, r.worst); fullest = Math.max(fullest, r.parts);
    log(`${n}  ${r.names.join(' + ')}`, `${r.fps.toFixed(1)} frames a second, longest frame ${r.worst.toFixed(0)} ms, ${r.parts} particles, ${r.zones} ground patches, ${r.shots} shots, ${r.kills} kills${r.over ? '  !! the run ended' : ''}${problems.length ? '  !! ' + problems.join('; ') : ''}`);
    // (said through the page, so the playtest counts it as an error and fails)
    if (r.over || problems.length) await page.evaluate((m) => console.error(m), `combination problem: ${r.names.join(' + ')}`);
    n++;
    await page.waitForTimeout(300);
  }
  log('slowest frame rate over a fight', +slowest.toFixed(1));
  log('longest single frame (ms)', +longest.toFixed(0));
  log('most particles in the air at once', fullest);
  // (every character the game asked for must be one the fonts can draw)
  const missing = await page.evaluate(() => window.__dbg.missing());
  if (missing.length) console.log('  !! text asked for characters the fonts cannot draw: ' + missing.join(' '));
}
