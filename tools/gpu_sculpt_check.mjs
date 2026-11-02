// THE GRAPHICS CHIP'S MARCH HELD AGAINST THE CPU'S, IN PLAYWRIGHT'S CHROMIUM (docs/mockups/gpu_sculpt/README.md).
// Its WebGL2 here is SwiftShader, a CPU pretending to be a graphics chip: its times say how the two compare in kind, not
// what a phone's chip does (the test page, dist/gpu_speed.html, says that, on the phone).
//
//   node tools/gpu_sculpt_check.mjs quick                     a few frames of each, both ways, compared
//   node tools/gpu_sculpt_check.mjs diff [who...] [--every N]  every frame (or every Nth) both ways: how many pixels differ,
//                                                              where, and each frame's time; to shots/gpu_sculpt/diff_<who>.json
//   node tools/gpu_sculpt_check.mjs speed                     the cost table: frames of each move timed both ways, beside the
//                                                              Warrior's; to shots/gpu_sculpt/speed.json
//   node tools/gpu_sculpt_check.mjs pics                      the frames for the pictures, both ways, to shots/gpu_sculpt/pics/
// who: warlock (a man, blazing, the demon), tinkerer, tinkerer-kit (her Golem and Contraption), brawler.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, bundle, load } from './lib.mjs';

const args = process.argv.slice(2);
const mode = args[0] ?? 'quick';
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const OUT = path.join(ROOT, 'shots/gpu_sculpt');
const med = (xs) => { const a = [...xs].sort((x, y) => x - y); return a.length ? (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : NaN; };
fs.mkdirSync(OUT, { recursive: true });

// THE TABLES (no browser): from the diff runs' files, how many pixels differ by class and by group, and the painting times
if (mode === 'report') {
  const group = (name) => {
    if (name.startsWith('warlock:demon')) return /clips\.change/.test(name) ? 'the demon burning out' : 'the demon';
    if (name.startsWith('warlock:') && /clips\.change/.test(name)) return 'the change';
    if (name.startsWith('warlock:blaze')) return 'blazing (his own standing and running)';
    if (name.startsWith('warlock:')) return /clips\.change/.test(name) ? 'the change' : 'the man';
    if (name.startsWith('golem:')) return 'her Golem';
    if (name.startsWith('contraption:')) return 'her Contraption';
    if (name.startsWith('tinkerer:')) return 'the Tinkerer';
    return 'the Brawler';
  };
  const rows = [];
  for (const who of ['warlock', 'tinkerer', 'tinkerer-kit', 'brawler']) {
    for (const tag of ['', '_sample']) {
      const f = path.join(OUT, `diff_${who}${tag}.json`);
      if (!fs.existsSync(f)) continue;
      for (const r of JSON.parse(fs.readFileSync(f, 'utf8'))) rows.push({ ...r, who, group: group(r.name), sample: !!tag });
    }
  }
  // the demon's mean painting time a frame, both ways (for the estimate of all its frames)
  const dem = rows.filter((r) => !r.same && r.name.startsWith('warlock:demon'));
  if (dem.length) console.log(`demon frames compared: ${dem.length}; mean a frame: CPU ${(dem.reduce((a, r) => a + r.ms[0], 0) / dem.length).toFixed(0)} ms, chip ${(dem.reduce((a, r) => a + r.ms[1], 0) / dem.length).toFixed(0)} ms`);
  // the pictures' own frames
  const pd = path.join(OUT, 'pics');
  if (fs.existsSync(pd)) {
    const pics = [];
    for (const f of fs.readdirSync(pd).filter((x) => x.startsWith('row'))) pics.push(JSON.parse(fs.readFileSync(path.join(pd, f), 'utf8')));
    for (const k of [0, 1]) {
      const d = path.join(pd, `film${k}`);
      if (!fs.existsSync(d)) continue;
      const fr = fs.readdirSync(d).map((f) => JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')));
      const sh = fr.map((r) => r.diff.diff / Math.max(1, r.diff.fig)).sort((a, b) => a - b);
      const w = fr.reduce((a, r) => (r.diff.diff / Math.max(1, r.diff.fig) > a.diff.diff / Math.max(1, a.diff.fig) ? r : a));
      console.log(`film: ${fr[0].label}: ${fr.length} frames; differing pixels median ${(100 * med(sh)).toFixed(3)}%, worst ${(100 * sh[sh.length - 1]).toFixed(3)}% (frame ${w.i}, ${w.diff.diff} of ${w.diff.fig}; edge ${w.diff.edge} ink ${w.diff.ink} tone ${w.diff.tone})`);
    }
    for (const r of pics.sort((a, b) => a.label.localeCompare(b.label))) console.log(`picture: ${r.label}: ${r.diff.diff} of ${r.diff.fig}`);
  }
  const table = (key) => {
    const by = new Map();
    for (const r of rows) {
      const k = r[key];
      if (!by.has(k)) by.set(k, []);
      by.get(k).push(r);
    }
    console.log(`\n| ${key === 'who' ? 'class' : 'group'} | frames read | pictures compared | differing pixels: median | mean | worst (frame) | frames over 1% | edge / ink / tone pixels | painting, CPU | painting, chip |`);
    console.log('|---|---|---|---|---|---|---|---|---|---|');
    for (const [k, rs] of by) {
      const own = rs.filter((r) => !r.same);
      const sh = own.map((r) => (r.fig ? r.diff / r.fig : 0));
      const sorted = [...sh].sort((a, b) => a - b);
      const worst = own.reduce((w, r) => (!w || r.diff / Math.max(1, r.fig) > w.diff / Math.max(1, w.fig) ? r : w), null);
      const sum = (f) => own.reduce((a, r) => a + f(r), 0);
      const pc = (x) => (100 * x).toFixed(3) + '%';
      console.log(`| ${k} | ${rs.length} | ${own.length} | ${pc(med(sorted))} | ${pc(sum((r) => (r.fig ? r.diff / r.fig : 0)) / Math.max(1, own.length))} | ${pc(sorted[sorted.length - 1] ?? 0)} (${worst ? `${worst.name}[${worst.i}], ${worst.diff} of ${worst.fig}` : '-'}) | ${sh.filter((x) => x > 0.01).length} | ${sum((r) => r.edge)} / ${sum((r) => r.ink)} / ${sum((r) => r.tone)} | ${(sum((r) => r.ms[0]) / 1000).toFixed(0)} s | ${(sum((r) => r.ms[1]) / 1000).toFixed(0)} s |`);
    }
  };
  table('who');
  table('group');
  const fell = rows.reduce((a, r) => a + (r.fell || 0), 0);
  const notChip = rows.filter((r) => !r.same && r.marched === 0).length;
  console.log(`\nframes that fell back to the CPU: ${fell}; pictures painted without the chip: ${notChip}; size or anchor different: ${rows.filter((r) => r.diff === -1).length}`);
  process.exit(0);
}

const js = await bundle('src/dev/gpu_check_main.ts');
const html = `<!doctype html><html><head><meta charset="utf-8"><title>gpu check</title></head><body><script>${js.replace(/<\/script/gi, '<\\/script')}</script></body></html>`;
const { chromium } = load('playwright');
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
page.on('console', (m) => { if (m.type() === 'error') console.log('page:', m.text()); });
page.on('pageerror', (e) => console.log('page error:', e.message));
await page.setContent(html);
const started = await page.evaluate((p) => window.GPUCHECK.start(p), mode === 'quick');
console.log('workers:', JSON.stringify(started));
if (!started.gpu.chip) { console.log('NO CHIP:', started.gpu.why); await browser.close(); process.exit(1); }

const lists = async (who) => page.evaluate((w) => window.GPUCHECK.lists(w), who);
const frame = async (who, li, i, pixels = false) => page.evaluate(([w, l, f, p]) => window.GPUCHECK.frame(w, l, f, p), [who, li, i, pixels]);
const pct = (a, b) => (b ? ((100 * a) / b).toFixed(2) : '0.00') + '%';

// (--only <regex>: only the lists it matches; --tag <name>: the file the rows go to, diff_<who>_<name>.json)
const ONLY = opt('only') ? new RegExp(opt('only')) : null;
const TAG = opt('tag') ? `_${opt('tag')}` : '';
async function eachFrame(who, every, fn) {
  const L = await lists(who);
  if (!L.same) throw new Error(`${who}: the two workers' lists differ`);
  for (let li = 0; li < L.names.length; li++) {
    const n = L.lengths[li];
    const picks = new Set();
    for (let i = 0; i < n; i += every) picks.add(i);
    if (!opt('nolast')) picks.add(n - 1);
    if (ONLY && !ONLY.test(L.names[li])) continue;
    for (const i of [...picks].sort((a, b) => a - b)) await fn(L.names[li], li, i, n);
  }
}

if (mode === 'quick') {
  const want = { warlock: ['warlock:dungeon/front.idle', 'warlock:demon/front.idle', 'warlock:dungeon/front.clips.change.frames'], tinkerer: ['tinkerer:dungeon/front.idle'], brawler: ['brawler:dungeon/front.idle'], 'tinkerer-kit': ['golem:cannon/front.clips.attack.frames', 'contraption:vials/front.shot.frames'] };
  for (const [who, names] of Object.entries(want)) {
    const L = await lists(who);
    for (const name of names) {
      const li = L.names.indexOf(name);
      if (li < 0) { console.log('no list', name, L.names.slice(0, 8).join(' ')); continue; }
      for (const i of [1, Math.floor(L.lengths[li] / 2)]) {
        const r = await frame(who, li, i);
        if (r.t === 'error' || !r.diff) { console.log(name, i, JSON.stringify(r).slice(0, 300)); continue; }
        console.log(`${name}[${i}] cpu ${r.ms[0].toFixed(0)} ms, chip ${r.ms[1].toFixed(0)} ms (${Object.entries(r.parts).map(([k, v]) => k + ' ' + v.toFixed(0)).join(', ')}), on chip ${r.marched}, fell back ${r.fell} ${r.why || ''}; figure ${r.diff.fig} px, differ ${r.diff.diff} (${pct(r.diff.diff, r.diff.fig)}): edge ${r.diff.edge}, ink ${r.diff.ink}, tone ${r.diff.tone}`);
      }
    }
  }
}

if (mode === 'diff') {
  const every = Number(opt('every', 1));
  const whos = args.slice(1).filter((a, k, all) => !a.startsWith('--') && !/^\d+$/.test(a) && !(k > 0 && all[k - 1].startsWith('--')));
  for (const who of whos.length ? whos : ['warlock', 'tinkerer', 'tinkerer-kit', 'brawler']) {
    const rows = [];
    const t0 = Date.now();
    let fell = 0;
    await eachFrame(who, every, async (name, li, i, n) => {
      const r = await frame(who, li, i);
      if (r.t === 'error') throw new Error(`${name}[${i}]: ${r.why}`);
      if (r.same) { rows.push({ name, i, same: r.same, ms: r.ms }); return; }
      fell += r.fell;
      rows.push({ name, i, n, ms: r.ms, marched: r.marched, fell: r.fell, ...r.diff, pw: r.pw, ph: r.ph });
      if (rows.length % 50 === 0) {
        fs.writeFileSync(path.join(OUT, `diff_${who}${TAG}.json`), JSON.stringify(rows));
        console.log(`${who}: ${rows.length} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
      }
    });
    fs.writeFileSync(path.join(OUT, `diff_${who}${TAG}.json`), JSON.stringify(rows));
    const own = rows.filter((r) => !r.same);
    const shares = own.map((r) => (r.fig ? r.diff / r.fig : 0)).sort((a, b) => a - b);
    const worst = own.reduce((w, r) => (!w || r.diff / Math.max(1, r.fig) > w.diff / Math.max(1, w.fig) ? r : w), null);
    const cpu = own.reduce((s, r) => s + r.ms[0], 0);
    const gpu = own.reduce((s, r) => s + r.ms[1], 0);
    console.log(`${who}: ${rows.length} frames read, ${own.length} pictures compared, fell back ${fell}; differing pixels median ${(100 * shares[Math.floor(shares.length / 2)]).toFixed(3)}%, worst ${(100 * shares[shares.length - 1]).toFixed(3)}% (${worst.name}[${worst.i}]: ${worst.diff} of ${worst.fig}; edge ${worst.edge} ink ${worst.ink} tone ${worst.tone}); over 1%: ${shares.filter((s) => s > 0.01).length}; painting ${(cpu / 1000).toFixed(1)} s on the CPU, ${(gpu / 1000).toFixed(1)} s on the chip`);
  }
}

// THE COST TABLE: frames of each move painted both ways (each alone), their median, the Warrior's beside them
const SPEED = [
  ['warrior', 'warrior:dungeon/front.idle', [4, 10, 16], 'The Warrior standing (painted his own way)'],
  ['warrior', 'warrior:dungeon/front.clips.attack.frames', [8, 14, 20], "The Warrior's attack"],
  ['warlock', 'warlock:dungeon/front.idle', [8, 24, 40], 'The Warlock standing'],
  ['warlock', 'warlock:dungeon/front.clips.attack.frames', [10, 20, 30], 'His bolt'],
  ['warlock', 'warlock:blaze/front.idle', [8, 24, 40], 'Blazing, standing'],
  ['warlock', 'warlock:dungeon/front.clips.change.frames', [12, 24, 36], 'The change'],
  ['warlock', 'warlock:demon/front.idle', [8, 24, 40], 'The demon standing'],
  ['warlock', 'warlock:demon/front.clips.attack.frames', [8, 14, 20], 'Its rake'],
  ['warlock', 'warlock:demon/front.clips.heavy.frames', [12, 24, 36], 'Its Damning'],
  ['tinkerer', 'tinkerer:dungeon/front.idle', [8, 24, 40], 'The Tinkerer standing'],
  ['brawler', 'brawler:dungeon/front.idle', [8, 24, 40], 'The Brawler standing'],
];
if (mode === 'speed') {
  const L = {};
  const out = [];
  for (const [who, name, is, label] of SPEED) {
    L[who] ??= await lists(who);
    const li = L[who].names.indexOf(name);
    if (li < 0) throw new Error(`no list ${name}`);
    await frame(who, li, 0);
    const cpu = [];
    const gpu = [];
    const parts = [];
    for (const i of is) {
      const r = await frame(who, li, i);
      if (r.t === 'error' || !r.ms) throw new Error(`${name}[${i}]: ${JSON.stringify(r).slice(0, 300)}`);
      if (r.same) continue;
      cpu.push(r.ms[0]);
      gpu.push(r.ms[1]);
      parts.push(r.parts);
    }
    const row = { label, name, frames: is, cpu: med(cpu), gpu: med(gpu), cpuAll: cpu, gpuAll: gpu, parts };
    out.push(row);
    console.log(`${label.padEnd(44)} CPU ${row.cpu.toFixed(0).padStart(5)} ms   chip ${row.gpu.toFixed(0).padStart(6)} ms`);
    fs.writeFileSync(path.join(OUT, 'speed.json'), JSON.stringify(out, null, 1));
  }
}

// THE PICTURES' FRAMES: each both ways, its pixels and where they differ (tools/gpu_sculpt_pictures.py lays them out)
const ROWS = [
  ['warlock', 'warlock:dungeon/front.idle', 8, 'The Warlock standing'],
  ['warlock', 'warlock:dungeon/front.clips.attack.frames', 20, 'His bolt'],
  ['warlock', 'warlock:blaze/front.idle', 8, 'Blazing'],
  ['warlock', 'warlock:dungeon/front.clips.change.frames', 26, 'Mid-change'],
  ['warlock', 'warlock:demon/front.idle', 8, 'The demon standing'],
  ['warlock', 'warlock:demon/front.clips.attack.frames', 14, 'Its rake, at the strike'],
  ['warlock', 'warlock:demon/front.clips.heavy.frames', 24, 'Its Damning'],
  ['tinkerer', 'tinkerer:dungeon/front.idle', 8, 'The Tinkerer'],
  ['tinkerer-kit', 'golem:cannon/front.walk', 10, 'Her Golem'],
  ['brawler', 'brawler:dungeon/front.idle', 8, 'The Brawler'],
];
const FILM = [
  ['warlock', 'warlock:demon/front.clips.attack.frames', "The demon's rake"],
  ['warlock', 'warlock:dungeon/front.clips.change.frames', 'The change'],
];
async function save(dir, key, r) {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${key}.json`), JSON.stringify(r));
}
if (mode === 'pics') {
  const dir = path.join(OUT, 'pics');
  const L = {};
  for (const [k, [who, name, i, label]] of ROWS.entries()) {
    L[who] ??= await lists(who);
    const li = L[who].names.indexOf(name);
    if (li < 0) throw new Error(`no list ${name}`);
    const r = await frame(who, li, i, true);
    if (r.t === 'error' || !r.diff) throw new Error(`${name}[${i}]: ${JSON.stringify(r).slice(0, 300)}`);
    await save(dir, `row${k}`, { label, name, i, ...r });
    console.log(`${label}: ${name}[${i}] ${r.diff.diff} of ${r.diff.fig} differ (edge ${r.diff.edge}, ink ${r.diff.ink}, tone ${r.diff.tone})`);
  }
  for (const [k, [who, name, label]] of FILM.entries()) {
    L[who] ??= await lists(who);
    const li = L[who].names.indexOf(name);
    for (let i = 0; i < L[who].lengths[li]; i++) {
      const r = await frame(who, li, i, true);
      await save(path.join(dir, `film${k}`), String(i).padStart(3, '0'), { label, name, i, ...r });
    }
    console.log(`${label}: ${L[who].lengths[li]} frames`);
  }
}

await browser.close();
