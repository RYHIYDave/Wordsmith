// THE FOREST'S COST, MEASURED BY TURNS (render/tops_cache.ts): on the Pinewood with the bot playing, the frame rate in
// short turns of each MODE (no trees at all, "none"; the chunks, "chunks"; each tree drawn alone as before, "trees"),
// round and round for ROUNDS, so that each sees the same stretch of play; with the chunks, how many fell back and why.
//   ROUNDS=6 node tools/playtest.mjs --file dist/perf8.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/tops_ab.mjs --out shots/ab
import { log } from './lib.mjs';

export default async function (page) {
  const rounds = Number(process.env.ROUNDS || 6);
  const ms = Number(process.env.MS || 2000);
  const modes = (process.env.MODES || 'none,chunks,trees').split(',');
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); d.run('warrior', 9); d.seasoned(20); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { const g = window.__dbg.game(); g.depth = 9; g.cleared = 8; g.enterDungeon(); g.level.explored.fill(1); window.__dbg.bot(true); });
  await page.waitForTimeout(12000);
  const sum = Object.fromEntries(modes.map((m) => [m, { frames: 0, ms: 0, over34: 0, fell: 0, thin: 0, trees: 0, pictures: 0, k: 0, made: 0, runs: 0, buildMs: 0 }]));
  for (let r = 0; r < rounds; r++) {
    for (const mode of modes) {
      const out = await page.evaluate(([mode, ms]) => new Promise((done) => {
        const d = window.__dbg; const R = d.renderer;
        if (mode === 'none') R.skip.add('tops'); else R.skip.delete('tops');
        d.topsCache.on = mode === 'chunks';
        // (a few frames to settle into the mode, then measured)
        const st0 = { ...R.topsCache.stats };
        let n = 0; let o34 = 0; let fell = 0; let thin = 0; let trees = 0; let pics = 0; let k = 0; let last = 0; let t0 = 0; let warm = 10;
        const tick = (now) => {
          if (warm > 0) { warm--; last = now; t0 = now; requestAnimationFrame(tick); return; }
          const dt = now - last; last = now; n++; if (dt > 34) o34++;
          const s = R.topsCache.stats; fell += s.fell; thin += s.thin; trees += s.trees; pics += s.pictures; k++;
          if (now - t0 < ms) requestAnimationFrame(tick);
          else { const s1 = R.topsCache.stats; done({ frames: n, ms: now - t0, over34: o34, fell, thin, trees, pics, k, made: s1.made - st0.made, runs: s1.runs - st0.runs, buildMs: s1.ms - st0.ms }); }
        };
        requestAnimationFrame(tick);
      }), [mode, ms]);
      const S = sum[mode];
      S.made += out.made; S.runs += out.runs; S.buildMs += out.buildMs;
      S.frames += out.frames; S.ms += out.ms; S.over34 += out.over34; S.fell += out.fell; S.thin += out.thin; S.trees += out.trees; S.pictures += out.pics; S.k += out.k;
    }
  }
  for (const mode of modes) {
    const S = sum[mode];
    log(`mode ${mode}`, JSON.stringify({ fps: +(S.frames / (S.ms / 1000)).toFixed(1), over34: S.over34, ...(mode === 'chunks' ? { pictures: Math.round(S.pictures / S.k), fellHit: +(S.fell / S.k).toFixed(1), fellThin: +(S.thin / S.k).toFixed(1), trees: Math.round(S.trees / S.k), madeAFrame: +(S.made / S.k).toFixed(2), runsAFrame: +(S.runs / S.k).toFixed(2), buildMsAFrame: +(S.buildMs / S.k).toFixed(2) } : {}) }));
  }
  await page.evaluate(() => { const d = window.__dbg; d.renderer.skip.delete('tops'); d.topsCache.on = true; });
}
