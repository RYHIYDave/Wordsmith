// THE WARRIOR'S WEAPONS BAKED (render/baked.ts bakeGroups: `warrior-axe`, `warrior-hammer`, while game/talents.ts WARRIOR_TREE2 is
// on; docs/warrior_tree_build.md), in a real browser, the page served as the published game is, its bake beside it:
//   WEAPON=battleaxe node tools/playtest.mjs --serve --file dist/wrapped.html --touch --size 390x844 --dpr 3 --scenario tools/scenarios/warrior_baked.mjs --out shots/wb
// A Warrior run begun, his weapon picked with his tree's first point: his weapon's group comes from the bake, whole; the worker
// paints none of him with it; then on floor 1 his three moves made, his hands empty while the axe flies, and the page clean.
// WEAPON: battleaxe (default) or warhammer. SECS: how long to wait for the group (40).
import { log } from './lib.mjs';

export default async function (page, snap) {
  const weapon = process.env.WEAPON || 'battleaxe';
  const arms = weapon === 'warhammer' ? 'hammer' : 'axe';
  const group = `warrior-${arms}`;
  const secs = Number(process.env.SECS || 40);
  let fails = 0;
  const check = (what, ok, detail = '') => { if (!ok) fails++; log(what, `${ok ? 'ok' : '!! FAILED'} ${detail}`); };
  const start = await page.evaluate(() => ({ mark: !!window.__dbg.painter.baked, tree: !!(window.__dbg.warriorTree2 && window.__dbg.warriorTree2.on) }));
  check('a bake on this page, and his tree on', start.mark && start.tree, JSON.stringify(start));
  const took = await page.evaluate((w) => {
    const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.autoLevel = false; d.autoWords = false; d.god = true;
    d.seasoned(12);
    return d.game().takeTalent(w);
  }, weapon);
  check(`his tree's first point: ${weapon}`, took === null, String(took));
  const t0 = Date.now();
  let st = null;
  while (Date.now() - t0 < secs * 1000) {
    await page.waitForTimeout(250);
    st = await page.evaluate(() => window.__dbg.baked());
    if (!st || st.failed.length || (st.ms && st.ms[group] !== undefined)) break;
  }
  check(`his ${arms}'s group from the bake`, !!st && !st.failed.length && st.ms && st.ms[group] !== undefined, JSON.stringify(st && { ms: st.ms, failed: st.failed }));
  await snap('town');
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 1; g.cleared = 0; g.enterDungeon(); });
  await page.waitForTimeout(3500);
  // his three moves, at a skeleton before him
  const moves = await page.evaluate(async (a) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    g.monsters.length = 0;
    const m = g.spawn('skeleton', h.x + 1.3, h.y, 1, 0, false, g.rng); g.wakeUp(m); m.life = m.maxLife = 1e6; m.speed = 0; m.cd = 1e9;
    const out = { skills: h.skills.map((s) => s.id), empty: false };
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const ready = () => { h.swingT = 0; for (const s of h.skills) { s.cd = 0; s.charges = s.maxCharges; } };
    ready(); g.useBasic(m.x, m.y); await wait(1500);
    ready(); g.useSkill(1, h.x + 4, h.y); await wait(a === 'axe' ? 700 : 1800);
    out.empty = !!h.handsEmpty;
    await wait(2500);
    ready(); g.useEvasive(h.x + 3, h.y, { mx: 0, my: 0, aimX: h.x + 3, aimY: h.y, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: true, evadeX: h.x + 3, evadeY: h.y, potion: false, interact: false });
    await wait(1500);
    out.hurt = Math.round(m.maxLife - m.life);
    return out;
  }, arms);
  await snap('floor1');
  check('his moves are his weapon\'s', JSON.stringify(moves.skills) === JSON.stringify(arms === 'axe' ? ['cleave', 'axethrow', 'chop'] : ['smash', 'quake', 'charge']), JSON.stringify(moves.skills));
  if (arms === 'axe') check('his hands empty while the axe flies', moves.empty);
  check('his moves struck', moves.hurt > 0, `${moves.hurt}`);
  const end = await page.evaluate((a) => {
    const d = window.__dbg;
    const heroes = d.renderer.art.heroes;
    let left = 0;
    let shown = 0;
    const seen = new Set();
    // (not walked: a side's short attack, heavy and leap, three pictures each, drawn only where a set has no clips of its own,
    // render/figure.ts; and his making ready, clips.ready, his card's only: the greatsword's are never baked for a place either)
    const skip = new Set();
    for (const town of [true, false]) {
      const set = heroes.of('warrior', { twoHanded: true, town, weapon: a });
      for (const side of Object.values(set)) {
        if (!side || typeof side !== 'object' || !('idle' in side)) continue;
        if (side.clips) for (const k of ['attack', 'heavy', 'leap']) if (side[k]) skip.add(side[k]);
        if (side.clips && side.clips.ready) skip.add(side.clips.ready.frames);
      }
    }
    const walk = (o) => {
      if (!o || typeof o !== 'object' || seen.has(o) || skip.has(o)) return;
      seen.add(o);
      if (Array.isArray(o)) {
        for (let i = 0; i < o.length; i++) {
          const dsc = Object.getOwnPropertyDescriptor(o, i);
          if (dsc && typeof dsc.get === 'function') left++;
          else if (dsc && dsc.value && dsc.value.img) shown++;
          else walk(dsc && dsc.value);
        }
        return;
      }
      if (o.img && typeof o.w === 'number') return;
      for (const v of Object.values(o)) walk(v);
    };
    for (const town of [true, false]) walk(heroes.of('warrior', { twoHanded: true, town, weapon: a }));
    return { workerFrames: d.painter.heroFrames, left, shown };
  }, arms);
  check(`his ${arms}'s frames all in hand, none left to paint`, end.left === 0 && end.shown > 0, `${end.shown} in hand, ${end.left} unpainted, the worker painted ${end.workerFrames}`);
  if (fails) console.log(`  !! ${fails} check(s) failed`);
  log('RESULT', fails ? `${fails} FAILED` : 'all passed');
}
