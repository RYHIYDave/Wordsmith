// THE TRUE-LEFT MOCK-UP IN THE GAME ITSELF (8 Oct 2026; art/heroes3.ts, TRUE_LEFT; NOT IN THE GAME:
// this playtest switches it on for itself and puts it back). The knight in the practice room, with
// nothing to fight, walking and then standing facing each of the four ways: once as the game is,
// once with true left-facing frames. Each picture is cut round him: <out>_<off|on>_<way>.png.
//   node tools/build_to.mjs dist/true_left.html
//   node tools/playtest.mjs --file dist/true_left.html --size 960x540 --scenario tools/scenarios/true_left.mjs --out shots/true_left/game
// (the keys for each way, and the way as a step in the world: render/figure.ts)
const DIRS = [
  ['down_right', ['KeyS', 'KeyD'], [1, 0]],
  ['up_right', ['KeyW', 'KeyD'], [0, -1]],
  ['down_left', ['KeyS', 'KeyA'], [0, 1]],
  ['up_left', ['KeyW', 'KeyA'], [-1, 0]],
];

export default async function (page, snap) {
  await page.evaluate(() => window.__dbg.saving(false));
  let fails = 0;
  for (const on of [false, true]) {
    await page.evaluate((v) => {
      const d = window.__dbg;
      d.trueLeft(v);
      d.practice('warrior', 11);
      d.autoLevel = false;
      d.autoWords = false;
      const g = d.game();
      g.waveT = 1e9;
      g.monsters.length = 0;
      const m = g.hero.gear.mainhand;
      if (m) { m.hands = 2; m.weapon = 'greatsword'; }
    }, on);
    await page.waitForTimeout(900);
    const where = () => page.evaluate(() => {
      const d = window.__dbg;
      const h = d.game().hero;
      const p = d.at(h.x, h.y);
      const c = d.screen.toClient(p.x, p.y);
      const art = d.renderer.art.heroes.of('warrior', { twoHanded: true, town: false });
      return { x: c.x, y: c.y, fx: h.fx, fy: h.fy, left: art.left !== undefined };
    });
    for (const [name, keys, [wx, wy]] of DIRS) {
      // running that way (the picture is taken while the keys are held)
      for (const k of keys) await page.keyboard.down(k);
      await page.waitForTimeout(420);
      let st = await where();
      await snap(`${on ? 'on' : 'off'}_${name}_run`);
      snap.note(`${on ? 'on' : 'off'}_${name}_run`, st);
      for (const k of keys) await page.keyboard.up(k);
      // and standing, facing it (the keys come up one at a time, which would leave him facing along one of them)
      await page.evaluate(([x, y]) => { const h = window.__dbg.game().hero; h.fx = x; h.fy = y; }, [wx, wy]);
      await page.waitForTimeout(700);
      st = await where();
      if (st.left !== on) { fails++; console.log(`  !! the knight's figure ${st.left ? 'has' : 'has not'} frames of its own for facing left with the switch ${on ? 'on' : 'off'}`); }
      if (Math.abs(st.fx - wx) > 1e-6 || Math.abs(st.fy - wy) > 1e-6) { fails++; console.log(`  !! standing ${name}: he faces (${st.fx}, ${st.fy})`); }
      await snap(`${on ? 'on' : 'off'}_${name}`);
      snap.note(`${on ? 'on' : 'off'}_${name}`, st);
    }
  }
  await page.evaluate(() => window.__dbg.trueLeft(false));
  console.log(fails ? `${fails} FAULT(S)` : '  ok  the switch made the figure it says, both ways');
}
