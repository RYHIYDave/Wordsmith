// WHERE THE LOADING SCREEN'S OWN WORK GOES, AS A TREE (the queue's smooth-the-loading-screens-long-frames). A page served, a
// phone's screen; a new hero into town as he does it (the title, NEW GAME, the hero picked: CLS, default the Brawler; CONFIRM),
// or, FLOOR=<n>, a floor gone down to from town; the browser's own profiler over that loading screen; then the time spent under the loading
// screen's own work (main.ts loadingWork), as a tree of who called whom, DEEP levels (default 5), each line at least MIN ms
// (default 15).
//   node tools/playtest.mjs --file dist/<page>.html --serve --touch --size 844x390 --dpr 3 --scenario tools/scenarios/loading_tree.mjs --out shots/loading_tree/x
import { makeHands, log } from './lib.mjs';

export default async function (page) {
  const cls = process.env.CLS || 'brawler';
  const DEEP = Number(process.env.DEEP || 5);
  const MIN = Number(process.env.MIN || 15);
  const floor = Number(process.env.FLOOR || 0);
  const ROOT_FN = process.env.ROOT || 'loadingWork';
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Profiler.enable');
  await cdp.send('Profiler.setSamplingInterval', { interval: 200 });
  const go = async (fn, arg) => {
    await cdp.send('Profiler.start');
    await page.evaluate(fn, arg);
    await page.waitForFunction(() => !!window.__dbg.loadingNow(), null, { timeout: 20000, polling: 10 }).catch(() => {});
    await page.waitForFunction(() => !window.__dbg.loadingNow(), null, { timeout: 180000, polling: 50 });
    await page.waitForTimeout(200);
    return (await cdp.send('Profiler.stop')).profile;
  };
  let p;
  if (!floor) {
    const hands = await makeHands(page);
    await page.waitForTimeout(4000);
    await hands.press('button:NEW GAME');
    await page.waitForTimeout(3000);
    await hands.press(`class:${cls}`, 0, true);
    let c = null;
    for (let k = 0; k < 150 && !c; k++) { c = await hands.mark('button:CONFIRM'); if (!c) await page.waitForTimeout(20); }
    await cdp.send('Profiler.start');
    await hands.pressAt(c.x, c.y);
    await page.waitForFunction(() => !!window.__dbg.game() && !!window.__dbg.loadingNow(), null, { timeout: 60000, polling: 10 });
    await page.waitForFunction(() => !window.__dbg.loadingNow(), null, { timeout: 180000, polling: 50 });
    await page.waitForTimeout(200);
    p = (await cdp.send('Profiler.stop')).profile;
  } else {
    await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 7); d.autoLevel = false; d.autoWords = false; }, cls);
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.__dbg.loadedHere());
    p = await go((depth) => { const g = window.__dbg.game(); g.depth = depth; g.enterDungeon(); }, floor);
  }
  const byId = new Map(p.nodes.map((n) => [n.id, n]));
  const parent = new Map();
  for (const n of p.nodes) for (const ch of n.children || []) parent.set(ch, n.id);
  const tree = { ms: 0, kids: new Map() };
  let total = 0;
  for (let i = 0; i < p.samples.length; i++) {
    const path = [];
    for (let x = p.samples[i]; x !== undefined; x = parent.get(x)) { const f = byId.get(x).callFrame; path.push(f.functionName || '(anon)'); }
    path.reverse();
    const at = path.indexOf(ROOT_FN);
    if (at < 0) continue;
    const dt = (p.timeDeltas[i + 1] || p.timeDeltas[i] || 0) / 1000;
    total += dt;
    let node = tree;
    node.ms += dt;
    for (const fn of path.slice(at + 1, at + 1 + DEEP)) {
      let k = node.kids.get(fn);
      if (!k) node.kids.set(fn, (k = { ms: 0, kids: new Map() }));
      k.ms += dt;
      node = k;
    }
  }
  log(floor ? `floor ${floor}` : `into town (${cls})`, `${Math.round(total)} ms sampled under ${ROOT_FN}`);
  const show = (node, depth) => {
    for (const [fn, k] of [...node.kids].sort((a, b) => b[1].ms - a[1].ms)) {
      if (k.ms < MIN) continue;
      console.log(`${'  '.repeat(depth + 1)}${String(Math.round(k.ms)).padStart(5)} ms  ${fn}`);
      show(k, depth + 1);
    }
  };
  show(tree, 0);
}
