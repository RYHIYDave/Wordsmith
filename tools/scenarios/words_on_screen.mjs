// HOW THE WORDS LOOK ON SCREEN (the art review of 9 Nov 2026, his “Both”; the queue's review-how-words-look-on-screen): a hero in the
// practice room with one word on his attack (in front if it goes there, else behind), a skeleton before him; his attack thrown at
// it, pictured as the blow lands (the game's clock stopped a moment after the skeleton is hurt); then, the skeleton left one life, thrown again, pictured
// as it dies (for the words that act on a kill). Each picture cut to the part of the screen round him, at a phone's own size.
//   WORDS=fire,frost CLS=warrior node tools/playtest.mjs --file dist/words.html --touch --size 852x393 --dpr 3 --scenario tools/scenarios/words_on_screen.mjs --out shots/words/w
// Pictures: <out>_<word>_hit.png and <out>_<word>_kill.png. HIT=seconds after the blow lands the first is taken (0.06), KILL=seconds after it dies the second (0.12).
export default async function (page, snap) {
  const ALL = 'power,swift,twin,fire,frost,lightning,leech,volatile,poison,heavy,precise,frenzied,guarding,pulling,splitting,hexing,stilling,binding,piercing,bleeding,reaping,culling,surging,plundering,mirroring,lasting,fleeting,vast';
  const words = (process.env.WORDS || ALL).split(',').filter(Boolean);
  const cls = process.env.CLS || 'warrior';
  const skill = Number(process.env.SKILL || 0);
  const HIT = Number(process.env.HIT || 0.06);
  const KILL = Number(process.env.KILL || 0.12);
  const outAt = process.argv.indexOf('--out');
  const out = outAt >= 0 ? process.argv[outAt + 1] : 'shots/words/w';
  const say = (s) => console.log(`  ${s}`);
  const mid = await page.evaluate(() => [innerWidth / 2, innerHeight / 2]);
  const clip = { x: Math.round(mid[0] - 190), y: Math.round(mid[1] - 150), width: 420, height: 245 };
  /** The game let run (slowed) until `until` holds of the skeleton, then on `after` seconds more, then stopped. */
  const stepTo = async (until, after) => {
    await page.evaluate(() => { window.__dbg.slowmo = 0.25; });
    await page.waitForFunction((until) => {
      const d = window.__dbg; const g = d.game();
      const m = g.monsters.find((q) => q.id === window.__m);
      const ok = until === 'hurt' ? !m || m.life < m.maxLife : !m || m.dead || m.life <= 0;
      if (ok) { window.__at = d.clock(); return true; }
      return false;
    }, until, { polling: 'raf', timeout: 60000 });
    await page.waitForFunction((after) => {
      const d = window.__dbg;
      if (d.clock() < window.__at + after) return false;
      d.slowmo = 1e-6;
      return true;
    }, after, { polling: 'raf', timeout: 60000 });
  };
  for (const w of words) {
    const set = await page.evaluate(([w, cls, skill]) => {
      const d = window.__dbg;
      d.slowmo = 1;
      d.saving(false);
      d.loading.on = false;
      d.practice(cls, 7);
      d.autoLevel = false; d.autoWords = false; d.god = true;
      const g = d.game(); const h = g.hero;
      g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
      if (d.fx) d.fx.messages.length = 0;
      h.words[w] = (h.words[w] || 0) + 1;
      let side = 'front';
      let why = g.socket(skill, 'front', w);
      if (why) { side = 'behind'; why = g.socket(skill, 'behind', w); }
      const m = g.spawn('skeleton', h.x + 1.3, h.y + 0.05, 1, 0, false, g.rng);
      g.wakeUp(m); m.speed = 0; m.cd = 1e9; m.life = m.maxLife = 1e6;
      h.fx = 1; h.fy = 0;
      window.__m = m.id;
      return { side, why };
    }, [w, cls, skill]);
    if (set.why) { say(`${w}: not on it: ${set.why}`); continue; }
    await page.waitForTimeout(250);
    const strike = () => page.evaluate(([skill]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      if (d.fx) d.fx.messages.length = 0;
      h.swingT = 0;
      if (skill === 0) g.useBasic(h.x + 1, h.y); else { h.skills[skill].cd = 0; h.mana = 999; g.useSkill(skill, h.x + 1.3, h.y); }
    }, [skill]);
    await strike();
    await stepTo('hurt', HIT);
    await page.screenshot({ path: `${out}_${w}_hit.png`, clip });
    // (AFTER=n: n more pictures, a tenth of a second of the game apart, after the blow: what its look leaves)
    for (let k = 1; k <= Number(process.env.AFTER || 0); k++) {
      await page.evaluate(() => { const d = window.__dbg; window.__at = d.clock(); d.slowmo = 0.25; });
      await page.waitForFunction(() => { const d = window.__dbg; if (d.clock() < window.__at + 0.1) return false; d.slowmo = 1e-6; return true; }, null, { polling: 'raf', timeout: 60000 });
      await page.screenshot({ path: `${out}_${w}_after${k}.png`, clip });
    }
    // (the skeleton left a life, and struck again: as it dies)
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    await page.waitForTimeout(500);
    await page.evaluate(() => { const g = window.__dbg.game(); const m = g.monsters.find((q) => q.id === window.__m); if (m) m.life = 1; });
    await strike();
    await stepTo('dead', KILL);
    await page.screenshot({ path: `${out}_${w}_kill.png`, clip });
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    say(`${w}: ${set.side}`);
  }
  const errs = await page.evaluate(() => (window.__errors || []).length);
  if (errs) say(`!! ${errs} errors on the page`);
}
