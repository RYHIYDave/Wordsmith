// THE GROUND AT A FLOOR'S START (the art chat, 20 Oct 2026): pictures at several moments after coming onto each of
// DEPTHS (comma-separated; taken there by the test hook's act2), to see whether the ground is there.
// AT: comma-separated milliseconds after coming in. SEED, CLS.
export default async function (page, snap) {
  const depths = (process.env.DEPTHS ?? '11,12,13,14,15').split(',').map(Number);
  const at = (process.env.AT ?? '100,400,800,1500,3000').split(',').map(Number);
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
      return { depth: g.depth, kind: g.level.land?.kind };
    }, [d, seed, cls]);
    console.log('  floor', JSON.stringify(info));
    let was = 0;
    for (const t of at) {
      await page.waitForTimeout(t - was);
      was = t;
      await snap(`f${d}_${t}`);
    }
  }
}
