// THE PHONE CHECK, TRIED HERE (tools/phone_check/recorder.js, tools/phone_check_page.mjs; the queue's measure-lag-on-his-phone):
// the page played as he is asked to play it, with real touches: the title a few seconds, NEW GAME, the hero cards a few
// seconds, a hero picked (CLS, default the Brawler), CONFIRM, the loading screen, the town; he stands there until the recorder
// has run its trial and says it is done. Then what the recorder holds is printed and written (OUT). Here it cannot send (no
// database beside a page served from a folder): it must say so, and the game must run as it does without it.
//   node tools/playtest.mjs --file <dist/phone_check/index.html> --serve --touch --size 844x390 --dpr 3 --scenario tools/scenarios/phone_check_try.mjs --out shots/phone_check/x
import fs from 'node:fs';
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'brawler';
  let bad = 0;
  const check = (what, ok, detail = '') => {
    if (!ok) bad++;
    console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`);
  };
  const errs = [];
  page.on('pageerror', (e) => errs.push(String((e && e.stack) || e)));
  check('the recorder is in the page before the game', await page.evaluate(() => !!window.__rec && window.__rec.state === 'recording'));
  const hands = await makeHands(page);
  await page.waitForTimeout(4000);
  await hands.press('button:NEW GAME');
  await page.waitForTimeout(3000);
  await hands.press(`class:${cls}`, 0, true);
  let c = null;
  for (let k = 0; k < 150 && !c; k++) { c = await hands.mark('button:CONFIRM'); if (!c) await page.waitForTimeout(20); }
  if (c) await hands.pressAt(c.x, c.y);
  await page.waitForFunction(() => !!window.__dbg.game(), null, { timeout: 30000 });
  await page.waitForFunction(() => window.__rec.state === 'done', null, { timeout: 180000 });
  await page.waitForTimeout(1500);
  const r = await page.evaluate(() => window.__rec.snapshot());
  const mark = await page.evaluate(() => { const all = [...document.querySelectorAll('div[aria-hidden="true"]')]; return all.length ? all[all.length - 1].textContent : ''; });
  if (process.env.OUT) fs.writeFileSync(process.env.OUT, JSON.stringify(r, null, 1));
  log('the hero', r.hero);
  log('the device', JSON.stringify(r.device));
  for (const s of r.segs) {
    const fps = s.secs > 0 ? (s.frames / s.secs).toFixed(0) : '-';
    console.log(`  ${s.label.padEnd(30)} ${String(s.secs).padStart(6)} s  ${String(s.frames).padStart(5)} frames (${fps}/s)  worst ${String(Math.round(s.gapMax)).padStart(5)} ms  the game's frame ${(s.frames ? s.workSum / s.frames : 0).toFixed(1)} ms, worst ${Math.round(s.workMax)}  made ${s.madeDone}/${s.made} (cut ${s.cut}, waited ${Math.round(s.madeWait)} ms in all)  from workers ${s.fromWorkers} in ${s.msgs} messages, ${Math.round(s.msgMs)} ms  decoded ${s.dec}  canvases ${s.canv}  draws ${s.draws}  read ${s.reads} (${Math.round(s.readMs)} ms)  put ${s.puts}  clock late ${Math.round(s.late)} ms  taps ${s.taps}${s.gameT ? `  the loading screen's own clock ${s.gameT} s` : ''}`);
  }
  log('the heroes baked', JSON.stringify(r.baked));
  log('the sounds', JSON.stringify(r.sounds));
  log('the files', `${r.files.n} files, ${r.files.kb} KB; the slowest: ${JSON.stringify(r.files.slowest.slice(0, 4))}`);
  log('the trial', JSON.stringify(r.trial));
  log('frames cut from their sheets', JSON.stringify(r.cuts));
  log('long frames', `${r.long.length}; ticks ${r.ticks.length}`);
  log('the mark in the corner', mark.replace(/\n/g, ' | '));
  check('the hero picked is the one recorded', r.hero === cls, r.hero);
  check('the screens are told apart: the title, the loading screen and the town', ['title', 'loading: town', 'town'].every((w) => r.segs.some((s) => s.label.startsWith(w))), r.segs.map((s) => s.label).join(' > '));
  const cutByBrowser = r.segs.reduce((n, s) => n + s.cut, 0);
  if (r.fix) {
    // (THE BAKED FRAMES KEPT IN THEIR SHEETS, engine/px.ts sheetSprite: the browser makes a picture for a sheet, never for a frame)
    check('the hero\'s baked pictures came whole, and the browser made no picture for a frame', !!r.baked && r.baked.failed.length === 0 && r.baked.given > 0 && cutByBrowser === 0, `${JSON.stringify(r.baked)}; ${r.made} pictures made by the browser, ${cutByBrowser} of them cut from a sheet`);
    const real = r.trial && r.trial.real;
    check('the hero\'s own frames: every pixel as the old way made them', !!real && !real.failed && real.tried >= 100 && real.unlike === 0, JSON.stringify(real));
    check('frames cut from their sheets are counted', !!r.cuts && r.cuts.made > 0, JSON.stringify(r.cuts));
  } else check('the hero\'s baked pictures came whole through the recorder', !!r.baked && r.baked.failed.length === 0 && r.baked.given > 0 && r.madeDone >= r.baked.given, JSON.stringify(r.baked));
  check('the side painter\'s pictures are counted, and the game still gets them', r.fromWorkers > 0, `${r.fromWorkers}`);
  check('the trial ran to its end', !!r.trial && !r.trial.failed && !r.trial.skipped && r.trial.cutMs > 0 && Array.isArray(r.trial.drawSheet) && !!r.trial.worker && r.trial.worker.got === 240, JSON.stringify(r.trial));
  check('it says it is done, and that it could not send (no database here)', r.state === 'done' && /could not be sent/.test(mark), mark.slice(0, 60));
  check('no error on the page', errs.length === 0 && r.errors.length === 0, [...errs, ...r.errors].join(' | ').slice(0, 300));
  if (typeof snap === 'function') await snap('phone_check_done');
  if (bad) console.log(`!! ${bad} thing(s) wrong`);
}
