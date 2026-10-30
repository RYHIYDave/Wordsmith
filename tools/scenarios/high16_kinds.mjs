// ACT 2, PART TWO, THE HIGH CITY: FLOOR 16'S FOUR KINDS IN THE GAME (game/act1_rules/swan.ts, gardener.ts, groom.ts, pguard.ts),
// for the main chat to see them move: in the practice room (floor 16's own ground is another helper's, not yet in), each lot
// coming at the warrior and fighting him (he cannot be killed: the god switch; he stands his ground and does not strike back,
// so that nothing of his words hides them: BOT=1 has the test bot fight them); then half of them struck down one after
// another, so that their deaths are seen. Nothing here needs HIGH_CITY: the kinds are spawned by hand.
//   node tools/build_to.mjs dist/high16.html
//   node tools/playtest.mjs --file dist/high16.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/high16_kinds.mjs --out shots/high16/k
// WHO: swans (a flock of seven: the waddle, the charge, the hissing bite and its warning, the burst of feathers), crowd (six
// Hushed, gardeners and grooms in turn: the rush, the shears and the fork and their warnings, the Hush leaving them), guards (a
// squad of four, partisans and swords in turn: the march in step, the long thrust, the wide sweep and their warnings, to one
// knee then a crash), or all (the three in turn: the default). SECONDS: how long each is filmed (4), then DEATHS seconds of
// their deaths (3). A picture every 15th of a second of the game's time (the game slowed to a quarter), named
// <who>_f_NNNN.png; a line of who is doing what at each change.
import { log } from './lib.mjs';

export default async function (page, snap) {
  const which = process.env.WHO || 'all';
  const seconds = Number(process.env.SECONDS || 4);
  const deaths = Number(process.env.DEATHS || 3);
  const FPS = 15;
  const SLOW = 0.25;
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.practice('warrior', 7);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    const g = d.game();
    g.waveT = 1e9;
    g.monsters.length = 0;
    g.projectiles.length = 0;
  });
  // (the practice room's words of welcome fade first)
  await page.waitForTimeout(Number(process.env.SETTLE || 6000));
  const state = () => page.evaluate(() => {
    const g = window.__dbg.game();
    return g.monsters.filter((m) => !m.dead).map((m) => `${m.kind}${m.form ? ':' + m.form : ''}:${m.state === 'act' && m.act ? m.act.id.split(':')[1] + '@' + m.act.t.toFixed(2) : m.gait ? m.gait.mode : m.state}${m.a1 && m.a1.ch > 0 ? '(charging)' : ''}`).join(' ');
  });
  const scenes = which === 'all' ? ['swans', 'crowd', 'guards'] : [which];
  for (const who of scenes) {
    const made = await page.evaluate((w) => {
      const d = window.__dbg;
      const g = d.game();
      const h = g.hero;
      g.monsters.length = 0;
      // (the last lot's bodies swept away too)
      d.fx.messages = [];
      if (Array.isArray(d.fx.fallen)) d.fx.fallen.length = 0;
      // (round him, spread over the screen's right half: `far` tiles off, `deg` degrees round from the screen's right)
      const at = (far, deg) => {
        const a = (deg * Math.PI) / 180;
        // the screen's right is (1, -1) in the floor's tiles; its down is (1, 1)
        const rx = Math.SQRT1_2; const ry = -Math.SQRT1_2; const dx = Math.SQRT1_2; const dy = Math.SQRT1_2;
        return { x: h.x + far * (Math.cos(a) * rx + Math.sin(a) * dx), y: h.y + far * (Math.cos(a) * ry + Math.sin(a) * dy) };
      };
      const plan = w === 'swans'
        ? [['swan', 4.2, -50], ['swan', 4.6, -25], ['swan', 4.0, 0], ['swan', 4.8, 20], ['swan', 4.3, 45], ['swan', 5.4, -10], ['swan', 5.6, 30]]
        : w === 'crowd'
          ? [['gardener', 3.6, -40], ['gardener', 4.0, -15], ['gardener', 3.8, 10], ['gardener', 4.2, 35], ['gardener', 5.0, -25], ['gardener', 5.2, 20]]
          : [['pguard', 4.4, -35], ['pguard', 4.6, -10], ['pguard', 4.6, 15], ['pguard', 4.4, 40]];
      const out = [];
      for (const [kind, far, deg] of plan) {
        const p = at(far, deg);
        if (!g.isOpen(p.x, p.y)) continue;
        // (laid as one pack: a crowd comes mixed, a squad mixed)
        const m = g.spawn(kind, p.x, p.y, 5, 0, false, g.rng);
        m.words = []; m.shield = 0; m.carries = [];
        g.wakeUp(m);
        m.life = m.maxLife = 1e7;
        out.push(`${m.kind}${m.form ? ':' + m.form : ''}`);
      }
      h.fx = Math.SQRT1_2; h.fy = -Math.SQRT1_2;
      return out;
    }, who);
    log(who, JSON.stringify(made));
    await page.evaluate(([s, b]) => { window.__dbg.slowmo = s; if (b) window.__dbg.bot(true); }, [SLOW, process.env.BOT === '1']);
    const step = 1000 / FPS / SLOW;
    const t0 = Date.now();
    let i = 0;
    let told = '';
    const frame = async () => {
      const wait = t0 + i * step - Date.now();
      if (wait > 0) await page.waitForTimeout(wait);
      await snap(`${who}_f_${String(i).padStart(4, '0')}`);
      const now = await state();
      if (now !== told) {
        told = now;
        log(`${who} ${(i / FPS).toFixed(2)}s`, now);
      }
      i++;
    };
    for (let k = 0; k < Math.round(seconds * FPS); k++) await frame();
    // (their deaths: half of them struck down, one after another)
    await page.evaluate(() => {
      const g = window.__dbg.game();
      const live = g.monsters.filter((m) => !m.dead);
      live.slice(0, Math.ceil(live.length / 2)).forEach((m, k) => setTimeout(() => { if (!m.dead) { m.life = 1; g.damageMonster(m, 5, 'phys', false, -1); } }, k * 900));
    });
    for (let k = 0; k < Math.round(deaths * FPS); k++) await frame();
    await page.evaluate(() => { window.__dbg.bot(false); window.__dbg.slowmo = 1; });
  }
  log('end', await state());
}
