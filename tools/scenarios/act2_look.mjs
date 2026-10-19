// ACT 2, THE HUSH (behind ACT2, off; switched on here by the test hook, __dbg.act2): each of floors 11 to 15 where the hero comes
// in, for looking at as it is built. DEPTHS (comma-separated, 11 to 15), SEED, WAIT (ms after coming in), CLS.
//   node tools/build_to.mjs dist/act2.html
//   DEPTHS=11,12 node tools/playtest.mjs --file dist/act2.html --size 844x390 --dpr 2 --touch --scenario tools/scenarios/act2_look.mjs --out shots/act2/a
export default async function (page, snap) {
  const depths = (process.env.DEPTHS ?? '11,12,13,14,15').split(',').map(Number);
  const seed = Number(process.env.SEED ?? 3);
  const cls = process.env.CLS ?? 'warrior';
  for (const d of depths) {
    const info = await page.evaluate(([d, seed, cls]) => {
      const D = window.__dbg;
      D.saving(false);
      D.run(cls, seed);
      D.seasoned(20);
      D.god = true;
      D.act2(true, d);
      const g = D.game();
      return { depth: g.depth, kind: g.level.land?.kind, w: g.level.floor.w, h: g.level.floor.h, boss: g.boss?.kind ?? null, packs: g.level.floor.packs.length };
    }, [d, seed, cls]);
    console.log('  floor', JSON.stringify(info));
    await page.waitForTimeout(Number(process.env.WAIT ?? 5000));
    await snap(`floor${d}`);
  }
}
