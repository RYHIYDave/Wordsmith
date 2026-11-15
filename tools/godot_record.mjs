// THE GODOT PORT: A PLACE'S LOOK RECORDED FROM THE GAME ITSELF, for the Godot version to lay out (godot/scripts/look.gd).
//
// The game is run in a real (headless) browser, as the playtests run it, and its own renderer is asked to draw the whole
// place onto a context that writes down what it is asked to draw (tools/godot_rec/page.js). So what comes out is the place
// as the game draws it, whatever floor it is: no second copy of the renderer's rules is kept here.
//
//   node tools/godot_record.mjs <place> [--seed 1] [--samples 120] [--page dist/godot_rec.html]
//     <place>: town, or a floor's number (1 to 20).
//   The page is the game as it is in the working tree: node tools/build_to.mjs dist/godot_rec.html (made if it is not there).
//
// Written to godot/assets/looks/, for P = town or floor<N>:
//   P.png (and P_1.png, ... if one sheet is not enough) + P_pics.json: the pictures, two picture pixels to a game pixel;
//     { key: [x, y, w, h, ax, ay, sheet] } in picture pixels (ax, ay: where the picture's own anchor falls inside it).
//   P.json: { format: 2, place, depth, seed, rate, dark: { a, rgb }, clear, sheets, ground, items, holes, glows, doors, props }
//     Every (x, y) is a screen point in game pixels measured from the screen point of world (0, 0): x = (wx - wy) * 16,
//     y = (wx + wy) * 8 for a world point (wx, wy) on the flat.
//     ground: what is drawn before anything stands, IN THE RENDERER'S ORDER, as runs: { op: 0 (over) | 1 (added, 'lighter'),
//       list: [...] }, each of the list a still picture [key, x, y (its top left) (, alpha (, w, h: the size it is drawn at,
//       if not its own))] or a run of pictures { f: [keys ("" for none)], fps, x, y (, a, w, h) }.
//     items: what stands among the figures, by depth: { f: [keys], fps, x, y (where its anchor goes), d (the painter's depth),
//       (a, w, h, add: 1), (wall: [x, y, depth, tile]: a wall that fades between the eye and the hero: its tile's top corner
//       on the screen, its depth, its tile's place in the level's grid) }.
//     holes: the lights cut out of the dark: [x, y, r, ry, a, flicker] (an ellipse r by ry round (x, y), strength a; its size
//       swings by `flicker`).   glows: what is added over the dark: [key, x, y (its middle), w, h, a, flicker].
//     A run of pictures shows frame floor(t * fps) mod n at time t.
//     fog: WHAT IS SEEN WHEN: { g, s, glows, holes }: for each of the ground's things (in the ground's lists taken together),
//       each of items, each glow and each hole, the tile (its place in the level's grid) that must have been seen for it to be
//       drawn (Level.explored), or -1: always drawn. (--nofog leaves it out; the town has none.)
//     sky (the Ledge Road): the sky behind everything, held to the screen (render/outdoor.ts drawSky): P_sky.png, coming round
//       every `wrap` picture pixels and sliding at half the ground's pace, its horizon `horizon` above the screen's middle; the
//       town below in it (P_skytown.png) at (x, y) of the sky's own measure; `fill` over the screen first, `haze` under it.
//     variants: THE PLACE'S STATES, by name: door<i> (the level's doors and gates, shut to open in 21 steps), prop<i> (a
//       chest open, a barrel or an urn broken, a lever pulled: steps 0 and 1), temple (floor 5's temple door unlocked: its
//       two chains, then its leaves, over `secs`), crank_set and furnace (floor 3's forge crank with its gear set in; the
//       crank turned, the furnace and the fire in the hall's way going out, over `secs` at `fps`; a frame's `hl` and `hw`:
//       the place's holes in the dark and glows that are not there in it), stair<j> (the stairwell breaking open at each of its places),
//       exit, cave, shaft (floor 3's door, floor 4's cave, floor 5's cage, as they open), onward (floors 6 to 10: the way on
//       from shut, through its film, to open), way (the waypoint awake: its loop,
//       12 frames at `fps`), warp (the column of light of a warp on it, 12 frames at `fps`). Each
//       { kind, (secs), steps: [which frame each step shows], frames: [{ hg: [the ground's things that are gone, by their
//       place in the ground's lists taken together], hs: [what stands that is gone, by its place in items], g: [what is
//       drawn on the ground instead: [key, x, y, a, w, h, add, after (the ground's thing it is drawn after, -1 the first)]],
//       s: [what stands instead, as items are] }] }. (--still leaves them out.)
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { load, ROOT } from './lib.mjs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const place = args.find((a) => !a.startsWith('--') && args[args.indexOf(a) - 1]?.startsWith('--') !== true) ?? args[0];
if (!place) { console.error('which place? town, or a floor number'); process.exit(1); }
const depth = place === 'town' ? 0 : Number(place);
if (place !== 'town' && !(depth >= 1 && depth <= 20)) { console.error(`not a place: ${place}`); process.exit(1); }
const name = depth === 0 ? 'town' : `floor${depth}`;
const seed = Number(opt('seed', '1'));
const N = Number(opt('samples', '120'));
const pageFile = path.resolve(ROOT, opt('page', 'dist/godot_rec.html'));
const OUT = path.resolve(ROOT, opt('out', 'godot/assets/looks'));
if (!fs.existsSync(pageFile)) {
  console.log('building the page ...');
  execFileSync('node', ['tools/build_to.mjs', path.relative(ROOT, pageFile)], { cwd: ROOT, stdio: 'inherit' });
}
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = load('playwright');
// (room for the open floors' thousands of standing things: the Pinewood draws some 120,000 a frame)
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--js-flags=--max-old-space-size=8192'] });
const ctx = await browser.newContext({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
let errors = 0;
page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('[console error]', m.text().slice(0, 300)); } });
page.on('pageerror', (e) => { errors++; console.log('[page error]', e.message); });
await page.goto('file://' + pageFile);
await page.waitForFunction('window.__ready === true', null, { timeout: 30000 });
await page.addScriptTag({ content: fs.readFileSync(path.resolve(ROOT, 'tools/godot_rec/page.js'), 'utf8') });

const settled = async () => {
  await page.waitForTimeout(400);
  for (let i = 0; i < 600 && (await page.evaluate(() => window.__rec.loading())); i++) await page.waitForTimeout(100);
  await page.waitForTimeout(1200);
};
await page.evaluate((s) => window.__rec.begin('warrior', s), seed);
// (THE PINEWOOD'S TREES drawn one by one, as the game draws them where something comes between them: the game lays the
// trees of a slab into one picture to draw them faster (render/tops_cache.ts), made a few a frame as the camera comes to
// them, which here would come and go between the frames; the Godot side groups them its own way, below)
await page.evaluate(() => { if (window.__dbg.topsCache) window.__dbg.topsCache.on = false; });
await settled();
const where = await page.evaluate((dp) => window.__rec.enter(dp), depth);
await settled();
// (the films the side painter makes: waited for, so that the place is recorded with them and not with what stands in for them)
const painted = async (what) => {
  let p = await page.evaluate(() => window.__rec.painter());
  const t = Date.now();
  while (p.state === 'on' && p.made < p.asked && Date.now() - t < 60000) {
    await page.waitForTimeout(500);
    p = await page.evaluate(() => window.__rec.painter());
  }
  if (p.state !== 'on') console.log(`  (${what}: no side painter on this page (${p.state}): the films it makes are not in the recording)`);
  else if (p.made < p.asked) console.log(`  !! ${what}: ${p.asked - p.made} of the side painter's ${p.asked} films not made after a minute`);
  else if (p.asked) console.log(`  (${what}: the side painter's ${p.made} films made: ${p.films.join(', ')})`);
  for (const f of p.failed ?? []) console.log('  !! the side painter: ' + f);
};
await painted('coming in');
const ready = await page.evaluate(() => window.__rec.ready());
console.log(`${name}: ${where.w}x${where.h}, ${ready.props} props, ${ready.doors} doors and gates, ${ready.monsters} monsters set aside; the hero parked at ${ready.park[0].x},${ready.park[0].y} (${ready.park[0].clear} tiles of empty stone round him)`);

// (is this the level the Godot side has laid out? tools/godot_export.ts, the same seed: its tiles, doors and props held to it)
{
  const layoutFile = path.resolve(ROOT, `godot/assets/${name}/layout.json`);
  if (fs.existsSync(layoutFile)) {
    const lay = JSON.parse(fs.readFileSync(layoutFile, 'utf8'));
    let hash = 0;
    for (const t of lay.tiles) hash = (Math.imul(hash, 31) + t) | 0;
    const doors = (lay.doors ?? []).map((q) => `${q.kind}:${q.alongX ? 'x' : 'y'}:${q.a}:${q.plane}`);
    const props = (lay.props ?? []).map((p) => `${p.i}:${p.kind}:${p.tx}:${p.ty}`);
    const same = hash === ready.sig.tiles && JSON.stringify(doors) === JSON.stringify(ready.sig.doors) && JSON.stringify(props) === JSON.stringify(ready.sig.props);
    console.log(same ? '  the same level as godot/assets/' + name + '/layout.json (tiles, doors, chests, barrels, urns and levers)' : `  !! NOT the level in godot/assets/${name}/layout.json: tiles ${hash === ready.sig.tiles ? 'the same' : 'differ'}, doors ${JSON.stringify(doors) === JSON.stringify(ready.sig.doors) ? 'the same' : 'differ'}, props ${JSON.stringify(props) === JSON.stringify(ready.sig.props) ? 'the same' : `differ (${props.length} against ${ready.sig.props.length})`}`);
  } else console.log(`  (no godot/assets/${name}/layout.json to hold it against)`);
}
// (under the open sky, floors 6 and down: where a view from where he can stand reaches; the open ground's pieces no view
// reaches are not painted, and what else is out of every view is let go of once the frames are taken: tools/godot_rec/page.js
// REC.reach, REC.cut. The game's screen is 270 game pixels tall and as wide as the screen it is on makes it (engine/screen.ts
// TARGET_H): 480 on a screen of 16 by 9, the Godot version's; about 590 on the widest phones, 690 on a wide desktop screen.
// A view reaches 400 to each side, room for a screen 800 wide, and 240 up and down, room for the camera's lift and shake.)
// (and the screen it is drawn on only as big as that, the hero parked at a corner of the map out of every view and the
// renderer told where on the screen he stands so that the screen is just what can be seen: REC.fit. The whole map drawn
// at once, as for the dungeon's floors, is a screen of up to 15000 by 8000 game pixels, and Echo Canyon's 180,000 standing
// things on it were more than the browser could hold)
let fit = null;
if (depth >= 6) {
  const r = await page.evaluate(({ mx, my }) => window.__rec.reach(mx, my), { mx: 400, my: 240 });
  if (r.err) console.log('  !! where a view reaches: ' + r.err);
  else {
    fit = await page.evaluate((box) => window.__rec.fit(box), r.box);
    console.log(fit ? `  drawn on a screen ${fit.W}x${fit.H}, just what can be seen, the hero parked at ${fit.park.x},${fit.park.y} out of sight` : '  (no corner of the map out of every view: drawn on a screen the whole map wide)');
  }
}
// the frames: three thrown away (what fades by the clock settles), then N a thirtieth of a second apart
const T0 = 100;
const size = fit ? { W: fit.W, H: fit.H } : await page.evaluate(() => {
  const f = window.__dbg.game().level.floor;
  return { W: 2 * (f.w + f.h) * 16 + 800, H: 2 * (f.w + f.h) * 8 + 800 };
});
const t0 = Date.now();
const first = await page.evaluate(({ T0, W, H, N }) => {
  const R = window.__rec;
  const g = window.__dbg.game();
  R.parkAt(0);
  R.time0 = g.time;
  for (const dt of [-0.6, -0.4, -0.2]) {
    g.time = R.time0 + dt;
    const fr = R.take(T0 + dt, W, H);
    if (fr.err) return { err: fr.err };
  }
  return {};
}, { T0, ...size, N });
if (first.err) { console.error('the renderer threw:\n' + first.err); await browser.close(); process.exit(1); }
// (the whole floor drawn once has asked for every film it shows: wait for them, then begin)
await page.waitForTimeout(1500);
await painted('the whole floor seen');
await page.evaluate(({ T0, W, H, N }) => {
  const R = window.__rec;
  const g = window.__dbg.game();
  for (const dt of [-0.4, -0.2]) { g.time = R.time0 + dt; R.take(T0 + dt, W, H); }
  R.accBegin(N);
}, { T0, ...size, N });
for (let k = 0; k < N; k += 10) {
  const r = await page.evaluate(({ T0, W, H, k, n }) => {
    const R = window.__rec;
    const g = window.__dbg.game();
    let last = null;
    for (let i = k; i < k + n; i++) {
      g.time = R.time0 + i / 30;
      const fr = R.take(T0 + i / 30, W, H);
      if (fr.err) return { err: fr.err };
      last = R.accAdd(fr);
    }
    g.time = R.time0;
    return last;
  }, { T0, ...size, k, n: Math.min(10, N - k) });
  if (r.err) { console.error('the renderer threw:\n' + r.err); await browser.close(); process.exit(1); }
}
const sum = await page.evaluate(() => window.__rec.accEnd());
console.log(`  ${N} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s: ${sum.ground} on the ground (${sum.groundMoving} moving), ${sum.stands} standing (${sum.standsMoving} moving, ${sum.walls} walls that fade), ${sum.holes} lights, ${sum.glows} glows, ${sum.used} pictures`);
if (sum.whole) console.log(`  (${sum.whole} runs of pictures did not come round within the frames taken: kept as the frames taken)`);
if (Object.keys(sum.odd).length) console.log('  not brought over: ' + Object.entries(sum.odd).map(([k, v]) => `${k} (${v / N === Math.floor(v / N) ? v / N : (v / N).toFixed(1)} a frame)`).join('; '));

// the place's states: its doors and gates opening, its chests open and its barrels and urns broken, its ways on opening
let variants = {};
let waypoint = null;
if (!args.includes('--still')) {
  const layoutFile = path.resolve(ROOT, `godot/assets/${name}/layout.json`);
  const layout = fs.existsSync(layoutFile) ? JSON.parse(fs.readFileSync(layoutFile, 'utf8')) : null;
  // (the lengths of the films, as the game has them: game/ways.ts; game/temple_door.ts TEMPLE_TIMES; game/quests15.ts CRANK_TIMES)
  // (and the descent's way on, floors 6 to 10: game/ways.ts ONWARD secs)
  const onward = { 6: 112 / 30, 7: 120 / 30, 8: 124 / 30, 9: 126 / 30, 10: 130 / 30 }[depth] ?? 0;
  const consts = { stair: 3.5, exit: layout?.ways?.exit?.secs ?? 3, cave: 126 / 30, shaft: 129 / 30, onward, temple: { chain: 1.5, second: 1.1, swingAt: 2.9, swing: 1.6 }, crank: { turn: 1.2, furnaceOut: 1.6, fireOut: 1.5 } };
  const ts = Date.now();
  const base = await page.evaluate(({ T0, W, H }) => window.__rec.statesBegin(T0, W, H), { T0, ...size });
  if (base.err) { console.error('the renderer threw:\n' + base.err); await browser.close(); process.exit(1); }
  // (the films of the ways opening are painted off to the side as they are first asked for (render/painter.ts): asked for once,
  // waited for, and then taken)
  await page.evaluate(({ T0, W, H, consts }) => window.__rec.states(T0, W, H, consts), { T0, ...size, consts });
  await page.waitForTimeout(1500);
  await painted('the states');
  await page.evaluate(({ T0, W, H }) => window.__rec.statesBegin(T0, W, H), { T0, ...size });
  const st = await page.evaluate(({ T0, W, H, consts }) => window.__rec.states(T0, W, H, consts), { T0, ...size, consts });
  variants = await page.evaluate(() => window.__rec.variants);
  waypoint = await page.evaluate(() => window.__rec.waypoint ?? null);
  console.log(`  its states in ${((Date.now() - ts) / 1000).toFixed(1)} s: ${Object.entries(st.sum).map(([k, v]) => `${v.n} ${k} (${v.changed} of ${v.frames} frames differ)`).join(', ')}; ${st.extra} pictures more${base.hg + base.hs + base.g + base.s ? `; (${base.hg + base.hs} gone and ${base.g + base.s} new with nothing changed: left out of every state)` : ''}`);
  for (const [k, v] of Object.entries(st.note)) console.log(`  !! ${k}: ${String(v).split('\n')[0]}`);
}
// what is seen when: the tile each thing waits on to have been seen
let fog = null;
if (depth > 0 && !args.includes('--nofog')) {
  const tf = Date.now();
  const r = await page.evaluate(({ T0, W, H }) => window.__rec.fog(T0, W, H), { T0, ...size });
  if (r.err) console.log('  !! what is seen when: ' + String(r.err).split('\n')[0]);
  else {
    fog = await page.evaluate(() => window.__rec.fogOut);
    console.log(`  what is seen when, in ${((Date.now() - tf) / 1000).toFixed(1)} s: of the ground's things and what stands, ${r.things.one} wait on one tile, ${r.things.many} on more than one (put on the tile they stand on), ${r.things.always} are always drawn${r.things.never ? `, ${r.things.never} never came` : ''}`);
  }
}
// the traps' pictures, where the floor has traps (the Godot side lays and works them: godot/scripts/traps.gd)
let traps = null;
if (depth > 0) {
  traps = await page.evaluate(() => { if (!window.__rec.extra) window.__rec.extra = new Set(); return window.__rec.trapPics(); });
  if (traps) console.log(`  its traps' pictures: the holes (and glinting), ${traps.spikes.length} steps of the spikes, the plate (and pressed), the slot`);
}
// (under the open sky: only what a view from where he can stand reaches)
if (depth >= 6) {
  const c = await page.evaluate(() => window.__rec.cut());
  if (c.err) console.log('  !! what can be seen: ' + c.err);
  else console.log(`  what can be seen from the ${c.at} tiles he can stand on: ${c.ground[1]} of the ${c.ground[0]} things on the ground, ${c.stands[1]} of the ${c.stands[0]} that stand`);
}
// the sky, where the place has one (the Ledge Road): its own layer behind everything (look.gd `sky`)
const skyRec = await page.evaluate(() => window.__rec.sky());
if (skyRec) console.log(`  its sky: ${skyRec.wrap}x${skyRec.h} (${skyRec.done} painted)${skyRec.town ? `, the town below ${skyRec.town.w}x${skyRec.town.h} at ${skyRec.town.x},${skyRec.town.y}` : ''}`);
const res = await page.evaluate(() => window.__rec.result);
const sheets = await page.evaluate(() => window.__rec.sheets(4096));
const pageErrors = await page.evaluate(() => window.__rec.errors);
for (const e of pageErrors) console.log('  !! ' + e);
await browser.close();

// --- the files ---
const veil = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/.exec(res.veil ?? '');
const dark = veil ? { a: veil[4] === undefined ? 1 : Number(veil[4]), rgb: [Number(veil[1]), Number(veil[2]), Number(veil[3])] } : { a: 0, rgb: [0, 0, 0] };
const key = (k) => (k < 0 ? '' : String(k));
const still = (q) => {
  const out = [key(q.f[0]), q.x, q.y];
  if (q.w || q.h) out.push(q.a, q.w, q.h);
  else if (q.a !== 1) out.push(q.a);
  return out;
};
const moving = (q) => ({ f: q.f.map(key), fps: q.fps, x: q.x, y: q.y, ...(q.a !== 1 ? { a: q.a } : {}), ...(q.w || q.h ? { w: q.w, h: q.h } : {}) });
const ground = [];
for (const q of res.ground) {
  let run = ground[ground.length - 1];
  if (!run || run.op !== q.add) ground.push((run = { op: q.add, list: [] }));
  run.list.push(q.f.length === 1 ? still(q) : moving(q));
}
const items0 = res.stands.map((q) => ({ f: q.f.map(key), ...(q.f.length > 1 ? { fps: q.fps } : {}), x: q.x, y: q.y, d: q.d, ...(q.a !== 1 ? { a: q.a } : {}), ...(q.w || q.h ? { w: q.w, h: q.h } : {}), ...(q.add ? { add: 1 } : {}), ...(q.wall ? { wall: q.wall } : {}) }));
// THE FOREST AS FEWER THINGS: a run of still things that stand at one depth one after another in the renderer's order, within
// one column of the screen GROUP game pixels wide (the Pinewood's trees, a row of them at a time), is one thing, `g`: its
// pictures [key, x, y] drawn in that order (look.gd _Group). What is drawn is the same, and a figure sorts against them by
// the same depth; only what a state hides, what waits on a tile to be seen, what moves, fades or is added stays on its own.
const GROUP = 256;
const { items, sMap } = (() => {
  const own = new Set();
  for (const v of Object.values(variants)) for (const f of v.frames) for (const i of f.hs) own.add(i);
  const fogS = fog ? fog.s : null;
  const out = [];
  const sMap = new Int32Array(items0.length);
  let run = null;
  items0.forEach((it, i) => {
    const plain = it.f.length === 1 && it.f[0] !== '' && it.a === undefined && it.w === undefined && !it.add && !it.wall && !own.has(i) && (!fogS || fogS[i] < 0);
    const col = Math.floor(it.x / GROUP);
    if (plain && run && run.d === it.d && run.col === col) {
      out[run.at].g.push([it.f[0], it.x, it.y]);
      sMap[i] = run.at;
      return;
    }
    sMap[i] = out.length;
    if (plain) {
      run = { d: it.d, col, at: out.length };
      out.push({ f: it.f, x: it.x, y: it.y, d: it.d, g: [[it.f[0], it.x, it.y]] });
    } else {
      run = null;
      out.push(it);
    }
  });
  // (one of a kind is left as it was)
  for (let i = 0; i < out.length; i++) if (out[i].g && out[i].g.length === 1) delete out[i].g;
  return { items: out, sMap };
})();
if (items.length < items0.length) {
  console.log(`  what stands, ${items0.length} things, as ${items.length}: runs at one depth within ${GROUP} game pixels across taken together (${items.filter((q) => q.g).length} of them)`);
  // (what is seen when, by the new places in the list: a group waits on nothing, as each of its things did)
  if (fog) {
    const s2 = new Array(items.length).fill(-1);
    items0.forEach((_, i) => { if (!items[sMap[i]].g) s2[sMap[i]] = fog.s[i]; });
    fog.s = s2;
  }
  for (const v of Object.values(variants)) for (const f of v.frames) f.hs = f.hs.map((i) => sMap[i]);
}
const sheetNames = sheets.pages.map((_, i) => (i === 0 ? `${name}.png` : `${name}_${i}.png`));
sheets.pages.forEach((p, i) => fs.writeFileSync(path.join(OUT, sheetNames[i]), Buffer.from(p.png, 'base64')));
fs.writeFileSync(path.join(OUT, `${name}_pics.json`), JSON.stringify(sheets.pics));
// (the sky: render/outdoor.ts drawSky's own colours and its horizon, HORIZON, held here as the game has them)
let sky = null;
if (skyRec) {
  fs.writeFileSync(path.join(OUT, `${name}_sky.png`), Buffer.from(skyRec.png, 'base64'));
  if (skyRec.town) fs.writeFileSync(path.join(OUT, `${name}_skytown.png`), Buffer.from(skyRec.town.png, 'base64'));
  sky = { pic: `${name}_sky.png`, wrap: skyRec.wrap, h: skyRec.h, horizon: 232, fill: '#7a90bc', haze: '#8a98b4', ...(skyRec.town ? { town: { pic: `${name}_skytown.png`, x: skyRec.town.x, y: skyRec.town.y } } : {}) };
}
const doc = {
  format: 2, place: name, depth, seed, rate: 30, samples: N, w: where.w, h: where.h,
  dark, vignette: ready.vignette, clear: res.clear, sheets: sheetNames,
  ground, items,
  holes: res.holes.map((h) => [h.x, h.y, h.r, h.ry, h.a, h.flicker]),
  glows: res.glows.map((g) => [key(g.f), g.x, g.y, g.w, g.h, g.a, g.flicker]),
  ...(fog ? { fog } : {}),
  // (the sky behind it all, held to the screen: { pic, wrap, h, horizon, fill, haze, town: { pic, x, y } } in picture pixels;
  // render/outdoor.ts drawSky)
  ...(sky ? { sky } : {}),
  // (the traps' pictures by their keys, and where in a tile each spike stands, game/traps.ts SPIKE_SPOTS: three by three, a
  // third of a tile apart: as godot/scripts/traps.gd reads them)
  ...(traps ? { traps: { holes: traps.holes.map(key), spikes: traps.spikes.map(key), plate: traps.plate.map(key), slot: { x: key(traps.slot.x), y: key(traps.slot.y) }, spots: [-1 / 3, 0, 1 / 3].flatMap((u) => [-1 / 3, 0, 1 / 3].map((v) => [u, v])), steps: traps.steps } } : {}),
  // (the floor's waypoint, where it has one: its middle on the floor, in tiles; its pictures are the states `way` and `warp`)
  ...(waypoint ? { waypoint } : {}),
  variants: Object.fromEntries(Object.entries(variants).map(([k, v]) => {
    // (each state: its frames, the same ones kept once: `steps` says which frame each step along it shows)
    const uniq = [];
    const seen = new Map();
    const steps = v.frames.map((f) => {
      const out = {
        hg: f.hg, hs: f.hs,
        // (the lights that are not there in it: the holes in the dark and the glows, by their place in the look's lists)
        ...(f.hl && f.hl.length ? { hl: f.hl } : {}), ...(f.hw && f.hw.length ? { hw: f.hw } : {}),
        g: f.g.map((e) => [key(e.f), e.x, e.y, e.a, e.w, e.h, e.add, e.after]),
        s: f.s.map((e) => ({ f: [key(e.f)], x: e.x, y: e.y, d: e.d, ...(e.a !== 1 ? { a: e.a } : {}), ...(e.w || e.h ? { w: e.w, h: e.h } : {}), ...(e.add ? { add: 1 } : {}), ...(e.wall ? { wall: e.wall } : {}) })),
      };
      const sig = JSON.stringify(out);
      if (!seen.has(sig)) { seen.set(sig, uniq.length); uniq.push(out); }
      return seen.get(sig);
    });
    return [k, { kind: v.kind, ...(v.secs ? { secs: v.secs } : {}), ...(v.fps ? { fps: v.fps } : {}), ...(v.at !== undefined ? { at: v.at } : {}), steps, frames: uniq }];
  })),
};
fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(doc));
console.log(`  written: ${sheetNames.map((n, i) => `${n} (${sheets.pages[i].w}x${sheets.pages[i].h})`).join(', ')}, ${name}_pics.json (${Object.keys(sheets.pics).length}), ${name}.json (${(fs.statSync(path.join(OUT, `${name}.json`)).size / 1024).toFixed(0)} KB); the dark ${JSON.stringify(dark)}${errors ? `; ${errors} errors on the page` : ''}`);
