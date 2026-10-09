// How smooth the first seconds of a session are: a new character in town, then into the first
// dungeon with the test player fighting, the frame rate counted second by second while the
// pictures are painted ahead of need. For a change that adds pictures (the ranger's new stances,
// Version 19.4: 958 of his in a dungeon where there were 182). Not part of tools/regress.sh.
//   node tools/playtest.mjs --file dist/<page>.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/first_dungeon_fps.mjs --out shots/fps/off
//   env: CLS (ranger), ON=1 (the ranger's new stances on, through __dbg.rangerStances), THROTTLE=4
//        (the browser's processor that many times slower: a slower machine), SECS (20, in the dungeon),
//        TOWN (5: seconds in town first)
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'ranger';
  const secs = Number(process.env.SECS || 20);
  const throttle = Number(process.env.THROTTLE || 1);
  if (throttle > 1) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    log('processor slowed down by', throttle);
  }
  await page.evaluate(([cls, on]) => {
    const d = window.__dbg;
    d.saving(false);
    if (on && d.rangerStances) d.rangerStances(true);
    d.run(cls, 11);
    d.god = true;
  }, [cls, process.env.ON === '1']);
  /** Count frames for `ms`, in buckets of a second: frames in each, and the longest frame. */
  const count = (ms) => page.evaluate((ms) => new Promise((res) => {
    const buckets = [];
    let last = performance.now();
    const t0 = last;
    let n = 0;
    let worst = 0;
    let at = t0;
    const tick = (now) => {
      n++;
      worst = Math.max(worst, now - last);
      last = now;
      if (now - at >= 1000) {
        buckets.push({ fps: n, worst: Math.round(worst) });
        n = 0;
        worst = 0;
        at = now;
      }
      if (now - t0 < ms) requestAnimationFrame(tick);
      else res(buckets);
    };
    requestAnimationFrame(tick);
  }), ms);
  const town = await count(Number(process.env.TOWN || 5) * 1000);
  log('in town, frames each second', town.map((b) => b.fps).join(' '));
  log('  the longest frame each second (ms)', town.map((b) => b.worst).join(' '));
  await page.evaluate(() => { const d = window.__dbg; const g = d.game(); g.enterDungeon(); d.bot(true); d.speed = 1; });
  const dungeon = await count(secs * 1000);
  log('in the first dungeon, frames each second', dungeon.map((b) => b.fps).join(' '));
  log('  the longest frame each second (ms)', dungeon.map((b) => b.worst).join(' '));
  const mean = (l) => (l.length ? (l.reduce((a, b) => a + b.fps, 0) / l.length).toFixed(1) : '0');
  log('mean frames a second: town, the dungeon\'s first 5 s, the rest', `${mean(town)}  ${mean(dungeon.slice(0, 5))}  ${mean(dungeon.slice(5))}`);
  log('the slowest second in the dungeon', String(Math.min(...dungeon.map((b) => b.fps))));
  await snap('end');
}
