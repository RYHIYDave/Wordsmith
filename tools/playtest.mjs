// Run the built game in a real (headless) browser and save screenshots.
//   node tools/playtest.mjs [--hash "bot=warrior&seed=5"] [--size 960x540] [--dpr 1] [--touch]
//                           [--shots 2,8,20] [--out shots/play] [--eval "js to run before the first shot"]
//   AIM=tap|auto|face|default  (with --touch) the way attacks are aimed as the playtest begins.
//     'tap' if not given: every touch playtest was written for a thumb that aims, and many test
//     exactly that. 'default' leaves it as a new player on a phone finds it (auto aim, since
//     Version 12.2.1): the first dungeon is played through that way on every layout.
//                           [--scenario tools/scenarios/look.mjs]     (a script that drives the page itself)
//                           [--file dist/artifact_test.html]          (a page other than Play.html)
// --hash bot=<class> lets the built-in test bot play. Screenshot times are seconds after load.
import { load, ROOT } from './lib.mjs';
import path from 'node:path';
import fs from 'node:fs';

const args = process.argv.slice(2);
const opt = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const flag = (name) => args.includes('--' + name);
const [w, h] = opt('size', '960x540').split('x').map(Number);
const shots = opt('shots', '2').split(',').map(Number);
const out = opt('out', 'shots/play');
const hash = opt('hash', '');
const evalJs = opt('eval', '');

const { chromium } = load('playwright');
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: Number(opt('dpr', '1')), hasTouch: flag('touch'), isMobile: flag('touch') });
const page = await ctx.newPage();
let errors = 0;
page.on('console', (m) => { if (m.type() === 'error') { errors++; console.log('[console error]', m.text()); } });
page.on('pageerror', (e) => { errors++; console.log('[page error]', e.message, (e.stack || '').split('\n').slice(0, 4).join(' | ')); });
const file = path.resolve(ROOT, opt('file', 'Play.html'));
if (!fs.existsSync(file)) { console.error('Play.html not found: run node tools/build.mjs first'); process.exit(1); }
await page.goto('file://' + file + (hash ? '#' + hash : ''));
await page.waitForFunction('window.__ready === true', null, { timeout: 15000 });
const aim = process.env.AIM ?? 'tap';
if (flag('touch') && aim !== 'default') await page.evaluate((a) => window.__dbg.setAim(a), aim);
if (evalJs) await page.evaluate(evalJs);
const scenario = opt('scenario', '');
if (scenario) {
  const mod = await import(path.resolve(ROOT, scenario));
  const snap = async (name) => {
    const p = path.resolve(ROOT, `${out}_${name}.png`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    await page.screenshot({ path: p });
    console.log('shot', path.relative(ROOT, p));
  };
  // a scenario can leave a note beside its pictures (where on screen the thing photographed was)
  snap.note = (name, obj) => {
    const p = path.resolve(ROOT, `${out}_${name}.json`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, JSON.stringify(obj));
  };
  await mod.default(page, snap);
  await browser.close();
  console.log(errors ? `FINISHED WITH ${errors} ERROR(S)` : 'finished clean');
  process.exit(errors ? 1 : 0);
}
const t0 = Date.now();
for (const s of shots) {
  const wait = s * 1000 - (Date.now() - t0);
  if (wait > 0) await page.waitForTimeout(wait);
  const p = path.resolve(ROOT, `${out}_${String(s).padStart(3, '0')}.png`);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  await page.screenshot({ path: p });
  const info = await page.evaluate(() => {
    const g = window.__dbg.game();
    if (!g) return 'title';
    const h = g.hero;
    return `town=${g.level.town} depth=${g.depth} lvl=${h.level} life=${Math.round(h.life)}/${h.d.maxLife} kills=${g.kills} monsters=${g.monsters.length} over=${g.over} skills=${h.skills.map((s) => s.r.name).join('|')}`;
  });
  console.log(`shot ${path.relative(ROOT, p)}  ${info}`);
}
await browser.close();
console.log(errors ? `FINISHED WITH ${errors} ERROR(S)` : 'finished clean');
process.exit(errors ? 1 : 0);
