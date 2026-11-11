// THE TOWN'S PEOPLE SCULPTED (art/townsfolk3.ts, behind TOWNSFOLK3): pictures and film frames of each at their place in the
// game's own town, a hero standing by for size, made a frame at a time with the town's clock held (dbg.slowmo 0, dbg.clockBy),
// so every frame is the true thirtieth of a second however long it takes to paint.
//   node tools/playtest.mjs --file dist/tf_look.html --touch --size 844x390 --dpr 4 --scenario tools/scenarios/townsfolk3_film.mjs --out shots/townsfolk3/f
//   OLD=1          the town's people as they are (for the before pictures)
//   WHO=armourer,mystic,wordsmith,stranger   which of them
//   MODE=still     one picture of each at their work (the loop's first frame); MODE=film (default): frames from LEAD seconds
//                  before what each does now and then to TAIL seconds after it
//   NEAR=1         the hero right up to them, so that they are turned to him (stills)
//   N=190          so many frames of each, whatever the length of what they do
//   DARK=1         the wordsmith's ring dark, as a new hero finds it (his runes cold, no work)
// Each picture is CLIP game pixels (150x84) round the two of them, eight screen pixels to a game pixel at --dpr 4.
import fs from 'node:fs';
import path from 'node:path';
import { log } from './lib.mjs';

const PHASE = { armourer: 0, mystic: 3.1, wordsmith: 6.4, stranger: 4.7 };
// where each stands (the middle of their tile), and where the hero stands to look on (two tiles off and more: at their work)
const AT = {
  armourer: { who: [19.5, 7.5], hero: [21.4, 9.2], near: [20.6, 8.6], up: 30 },
  mystic: { who: [19.5, 12.5], hero: [19.7, 15.5], near: [19.5, 14.7], up: 34 },
  wordsmith: { who: [9.5, 14.5], hero: [11.7, 15.8], near: [10.7, 15.2], up: 26 },
  stranger: { who: [6.5, 7.5], hero: [8.8, 8.4], near: [7.7, 8.0], up: 30 },
};

export default async function (page, snap) {
  const cls = process.env.CLS || 'brawler';
  const old = process.env.OLD === '1';
  const mode = process.env.MODE || 'film';
  const near = process.env.NEAR === '1';
  const lead = Number(process.env.LEAD || 1.2);
  const tail = Number(process.env.TAIL || 1.6);
  const [cw, ch] = (process.env.CLIP || '150x84').split('x').map(Number);
  const dir = process.env.FRAMES || '';
  await page.evaluate((c) => { const d = window.__dbg; d.saving(false); d.run(c, 31); }, cls);
  await page.waitForTimeout(500);
  if (!old) await page.evaluate(() => window.__dbg.townsfolk3(true, false));
  // (a new hero's town has the wordsmith's ring dark, his runes cold and his work waiting, until the master rune-stone is
  // given him: art/quest3.ts. The pictures show him at his work, the ring burning, unless DARK=1.)
  if (process.env.DARK !== '1') await page.evaluate(() => window.__dbg.quest3({ dark: false }));
  const scr = await page.evaluate(() => ({ w: window.__dbg.screen.w, h: window.__dbg.screen.h, cw: window.innerWidth, chh: window.innerHeight }));
  const k = scr.cw / scr.w;
  log('the screen', `${scr.w}x${scr.h} game pixels, ${k} css pixels each`);
  const stand = (x, y) => page.evaluate(([x, y]) => { const g = window.__dbg.game(); g.hero.x = x; g.hero.y = y; }, [x, y]);
  const raf = () => page.evaluate(() => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))));
  for (const who of (process.env.WHO || 'armourer,mystic,wordsmith,stranger').split(',')) {
    const a = AT[who];
    const h = near ? a.near : a.hero;
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
    await stand(h[0], h[1]);
    // (long enough for whatever they say as the hero comes up to be said and gone: a line of theirs cut off by the
    // picture's edge is no part of it)
    await page.waitForTimeout(Number(process.env.WAIT || 6000));
    // (the two of them on the screen: the hero is at its middle; a tile is 32 game pixels across and 16 down)
    const dx = a.who[0] - h[0];
    const dy = a.who[1] - h[1];
    const px = 16 * (dx - dy);
    const py = 8 * (dx + dy);
    const mx = scr.w / 2 + px / 2;
    const my = scr.h / 2 + py / 2 - a.up / 2;
    const clip = { x: Math.round(mx - cw / 2) * k, y: Math.round(my - ch / 2) * k, width: cw * k, height: ch * k };
    const m = await page.evaluate((w) => { const f = window.__dbg.renderer.art.folk[w]; return { idle: f.idle.length, act: f.act.length, loops: f.loops, fps: f.fps || 10, actFps: f.actFps || 20 }; }, who);
    const rest = (m.loops * m.idle) / m.fps;
    const every = rest + m.act / m.actFps;
    const now = await page.evaluate(() => window.__dbg.clock());
    // (the next time what they do now and then begins, `lead` before it; or, for a still, the loop's first frame)
    const want = mode === 'still' ? 0.001 : rest - lead;
    let t0 = Math.ceil((now + PHASE[who] - want) / every) * every + want - PHASE[who];
    await page.evaluate(() => { window.__dbg.slowmo = 0; });
    await page.evaluate((dt) => window.__dbg.clockBy(dt), t0 - (await page.evaluate(() => window.__dbg.clock())));
    await raf();
    if (mode === 'still') {
      const file = `${process.env.OUT || 'shots/townsfolk3/still'}_${who}${old ? '_old' : ''}${near ? '_near' : ''}.png`;
      fs.mkdirSync(path.dirname(file), { recursive: true });
      await raf();
      await page.screenshot({ path: file, clip });
      log(who, file);
      continue;
    }
    // (N: so many frames whatever the act's length, for two films laid side by side)
    const n = Number(process.env.N || 0) || Math.round((lead + m.act / m.actFps + tail) * 30);
    const out = path.join(dir || 'shots/townsfolk3/frames', who + (old ? '_old' : ''));
    fs.rmSync(out, { recursive: true, force: true });
    fs.mkdirSync(out, { recursive: true });
    for (let i = 0; i < n; i++) {
      await raf();
      await page.screenshot({ path: path.join(out, `f${String(i).padStart(4, '0')}.png`), clip });
      await page.evaluate(() => window.__dbg.clockBy(1 / 30));
    }
    log(who, `${n} frames in ${out} (the act begins at frame ${Math.round(lead * 30)})`);
  }
  void snap;
}
