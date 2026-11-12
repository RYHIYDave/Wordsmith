// FLOOR 20, THE MOTH: HOW MUCH OF ITS PICTURES THE PAGE HOLDS, AND HOW SOON (the queue's keep-moths-pictures-from-filling-memory,
// 12 Nov 2026). A hero on the Tower Top, nothing can kill him, the test bot fighting the Moth at the game's own speed; the Moth kept
// alive and taken through its three phases (its last on the book) so that every move of it is shown. Every STEP seconds, a row:
// the pictures the page holds (tools/mem_probe.js: canvases, bitmaps), the renderer's memory, the painter's frames given, and,
// where the Moth's pictures are kept packed (render/painter.ts PACKED), how much of it is unpacked and how often a frame it showed
// was a stand-in (the nearest of its move unpacked) because its own was still coming.
//   node tools/playtest.mjs --file <page> --serve --touch --size 844x390 --dpr 3 --init tools/mem_probe.js --scenario tools/scenarios/moth_memory.mjs
//   SECONDS=240 STEP=10        how long, and how often a row
//   DIE=440                    when it is let die (its scream, its words flying home); none by default
//   PHASES=60,120              when its life is set to 60% (its second phase) and to 30% (its last: it comes down on the book)
//   OUT=shots/moth_memory.json every row
//   WHO=1                      the pictures handed over held, by what handed them over
import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
const env = (k, d) => (process.env[k] === undefined ? d : process.env[k]);
const SECONDS = Number(env('SECONDS', 240));
const STEP = Number(env('STEP', 10));
const [P2, P3] = env('PHASES', '60,120').split(',').map(Number);
// (DIE: the second at which it is let die, on the book: its scream, the words flying home; 0, never)
const DIE = Number(env('DIE', 0));
const OUT = path.resolve(env('OUT', 'shots/moth_memory.json'));
const rss = () => {
  const rows = execSync('ps -eo rss,args').toString().split('\n').filter((l) => /chrom|headless_shell/i.test(l));
  let r = 0;
  let g = 0;
  for (const l of rows) {
    const kb = Number(l.trim().split(/\s+/)[0]) || 0;
    if (/--type=renderer/.test(l)) r += kb;
    else if (/--type=gpu/.test(l)) g += kb;
  }
  return { rendererMB: Math.round(r / 1024), gpuMB: Math.round(g / 1024) };
};
export default async function (page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('HeapProfiler.enable');
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.run('warrior', 4);
    d.seasoned(25);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    d.high(true, 20);
    const g = d.game();
    g.level.explored.fill(1);
    for (const m of g.monsters) if (!m.boss) m.dead = true;
    g.monsters = g.monsters.filter((m) => m.boss);
    g.waveT = 1e9;
    const T = g.level.land.tower;
    const h = g.hero;
    h.x = T.top.cx + 1;
    h.y = T.top.cy + 4;
    window.__t0 = performance.now();
  });
  const rows = [];
  const t0 = Date.now();
  let phase = 0;
  for (let s = 0; s <= SECONDS; s += STEP) {
    const wait = t0 + s * 1000 - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    // (its phases, by its life; kept from dying)
    // (what nobody holds collected first, as tools/scenarios/mem_floors.mjs does: the rest is what the page holds)
    for (let i = 0; i < 3; i++) {
      await cdp.send('HeapProfiler.collectGarbage');
      await page.waitForTimeout(100);
    }
    const want = s >= P3 ? 2 : s >= P2 ? 1 : 0;
    const set = want !== phase ? want : -1;
    phase = want;
    const die = DIE > 0 && s >= DIE;
    const r = await page.evaluate(([set, die]) => {
      const d = window.__dbg;
      const g = d.game();
      const m = g.monsters.find((q) => q.kind === 'moth');
      if (m && die && !m.dead && !window.__dying) {
        window.__dying = true;
        m.life = 1;
      }
      if (m && !window.__dying) {
        if (m.maxLife < 1e5) m.life = m.maxLife = 2e5;
        if (set === 1) m.life = m.maxLife * 0.6;
        if (set === 2) m.life = m.maxLife * 0.3;
        // (never below its last phase's top, so that it lives the whole sitting)
        m.life = Math.max(m.life, m.maxLife * 0.05);
        if (m.state === 'sleep') m.state = 'idle';
      }
      d.bot(true);
      const k = window.__probe.counts();
      const p = d.painter;
      const pk = p.packedStats ? p.packedStats('moth') : null;
      return {
        moth: m ? { life: +(m.life / m.maxLife).toFixed(2), act: m.act?.id ?? null, perched: m.a1?.perched ?? 0, dead: m.dead } : null,
        canvasMB: k.canvas.mb,
        canvasN: k.canvas.n,
        bitmapMB: k.bitmap.mb,
        bitmapN: k.bitmap.n,
        given: p.stats.frames,
        late: p.stats.late,
        failed: p.stats.failed.slice(0, 3),
        packed: pk,
        bitmapBy: window.__probe.who(4).bitmap,
        canvasBy: window.__probe.who(5).canvas,
        // (the Moth's own lists: how many frames hold an open picture handed over, and of what room)
        inLists: (() => {
          const art = p.bestiary && p.bestiary().made ? p.bestiary().made('moth') : null;
          if (!art) return null;
          let n = 0;
          let b = 0;
          let canv = 0;
          for (const set of [art.front, art.back]) {
            const c = set.clips || {};
            const lists = [set.idle, set.walk, ...[c.attack, c.heavy, c.die, c.reel].filter(Boolean).map((x) => x.frames), ...Object.values(c.moves || {}).map((x) => x.frames)];
            for (const l of lists) for (let i = 0; i < l.length; i++) {
              const d = Object.getOwnPropertyDescriptor(l, i);
              const img = d && 'value' in d && d.value ? d.value.img : null;
              if (img && typeof ImageBitmap === 'function' && img instanceof ImageBitmap && img.width > 0) { n++; b += img.width * img.height * 4; }
              else if (img && img.width > 1) canv++;
            }
          }
          return { bitmaps: n, mb: +(b / 1048576).toFixed(1), canvases: canv };
        })(),
        errors: (window.__errors || []).length,
        fxMB: d.mothFx ? +(d.mothFx() / 1048576).toFixed(1) : null,
      };
    }, [set, die]);
    const frames = await page.evaluate(() => window.__probe.frames());
    await page.evaluate(() => window.__probe.framesReset());
    const row = { s, ...r, rss: rss(), work: { p50: frames.workP50, p95: frames.workP95, max: frames.workMax, over50: frames.over50, n: frames.n } };
    rows.push(row);
    const pk = row.packed;
    console.log(`[${String(s).padStart(3)} s] moth ${row.moth ? `${row.moth.life} ${row.moth.act ?? '-'}${row.moth.perched ? ' perched' : ''}` : 'none'} | bitmaps ${row.bitmapN} ${row.bitmapMB} MB | canvases ${row.canvasN} ${row.canvasMB} MB | rss r${row.rss.rendererMB} g${row.rss.gpuMB} | given ${row.given}${pk ? ` | packed ${pk.packed}/${pk.frames} (${pk.packedMB} MB) unpacked ${pk.unpacked} (${pk.unpackedMB} MB) shown ${pk.shown} stand-ins ${pk.standIns} let go ${pk.letGo}` : ''} | work p50 ${row.work.p50} p95 ${row.work.p95} max ${row.work.max} >50ms ${row.work.over50} | fx ${row.fxMB} MB | errors ${row.errors}${row.failed.length ? ` | FAILED ${row.failed.join('; ')}` : ''}`);
    if (process.env.WHO === '1') console.log('    bitmaps by who:', row.bitmapBy.join(' | '), '| in its lists:', JSON.stringify(row.inLists), '\n    canvases by who:', row.canvasBy.map((w) => w.slice(0, 110)).join(' | '));
    mkdirSync(path.dirname(OUT), { recursive: true });
    writeFileSync(OUT, JSON.stringify(rows));
  }
  console.log('errors', await page.evaluate(() => (window.__errors || []).slice(0, 5)));
}
