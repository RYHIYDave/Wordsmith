// Saving: the run survives closing the page; the Lexicon and stash survive the character's death;
// a character in the first dungeon is saved like any other (its prompts with it), and a saved
// character is only replaced by a new one on a second press.
import { makeHands, log } from './lib.mjs';

export default async function (page, snap) {
  const reload = async () => { await page.reload(); await page.waitForFunction('window.__ready === true'); await page.waitForTimeout(250); };
  const stored = () => page.evaluate(() => { const t = localStorage.getItem('arpg.save'); return t ? JSON.parse(t) : null; });
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const m = d.meta();
    const count = (o) => Object.values(o).reduce((a, b) => a + b, 0);
    const base = { lexicon: count(m.lexicon), stash: m.stash.filter(Boolean).length, deaths: m.deaths, best: m.bestDepth };
    if (!g) return { title: true, ...base };
    const h = g.hero;
    return { cls: h.cls, level: h.level, gold: h.gold, depth: g.depth, town: g.level.town, dex: h.attrs.dex, skills: h.skills.map((k) => k.r.name), carried: count(h.words), bag: h.bag.filter(Boolean).length,
      gear: Object.values(h.gear).filter(Boolean).map((i) => i.name), plan: g.plan, over: g.over, ...base };
  });

  const fail = async (msg) => { console.log('  !! ' + msg); await page.evaluate((m) => console.error(m), 'saving: ' + msg); };
  let hands = null;
  /** The starting screen, back at its menu whichever page it is on. */
  const toMenu = async () => { if (!(await hands.mark('button:NEW GAME')) && (await hands.mark('button:BACK'))) await hands.press('button:BACK'); };
  /** The PROMPTS switch in the options, put to on or off (most of this script is about characters who begin in town). Says how it was found. */
  const prompts = async (on) => {
    await toMenu();
    await hands.press('button:OPTIONS');
    const was = !!(await hands.mark('button:PROMPTS: ON'));
    if (was !== on) await hands.press('button:PROMPTS');
    await hands.press('button:BACK');
    return was;
  };
  const guiding = () => page.evaluate(() => { const g = window.__dbg.game(); return g ? { cls: g.hero.cls, guide: !!g.guide, town: !!g.level.town, depth: g.depth } : null; });
  await page.evaluate(() => { localStorage.removeItem('arpg.save'); localStorage.removeItem('arpg.run'); });
  await reload();
  hands = await makeHands(page);
  log('fresh page: Continue offered', String(!!(await hands.mark('button:CONTINUE'))));
  if (await hands.mark('button:CONTINUE')) await fail('a fresh page should have nothing to continue');

  // the first dungeon: a new character is stored at once, prompts and all; closing the page in the
  // middle of it loses nothing (CONTINUE carries on, and so do the prompts)
  log('fresh page: prompts are switched on', String(await prompts(true)));
  await hands.press('button:NEW GAME');
  await hands.press('class:mage');
  await page.waitForTimeout(400);
  let f = await stored();
  let now = await guiding();
  log('NEW GAME, Mage: where / a run stored', `${JSON.stringify(now)} / ${f && f.run ? f.run.cls : 'none'}, prompts stored: ${!!(f && f.run && f.run.guide)}, taught: ${f ? f.meta.taught : '-'}`);
  if (!now || !now.guide || now.town || now.depth !== 1) await fail('a new character should be in the first dungeon, with its prompts');
  if (!f || !f.run || f.run.cls !== 'mage' || !f.run.guide || f.meta.taught) await fail('a new character should be stored at once, its prompts with it, and not yet as taught');
  await reload();
  hands = await makeHands(page);
  log('page closed in the first dungeon: Continue offered', String(!!(await hands.mark('button:CONTINUE'))));
  if (!(await hands.mark('button:CONTINUE'))) await fail('a character in the first dungeon should survive closing the page');
  await hands.press('button:CONTINUE');
  await page.waitForTimeout(300);
  now = await guiding();
  log('continued', JSON.stringify(now));
  if (!now || now.cls !== 'mage' || !now.guide) await fail('the prompts should carry on with the character');
  // the first word set (here by script), the prompts are over: stored at once, and remembered as taught
  await page.evaluate(() => { const g = window.__dbg.game(); g.hero.words.fire = 1; g.socket(0, 'front', 'fire'); });
  await page.waitForTimeout(500);
  f = await stored();
  log('the first word set: stored at once', `run ${f && f.run ? f.run.cls : 'none'}, taught: ${f ? f.meta.taught : '-'}, log ${await page.evaluate(() => window.__dbg.guideLog.join(' '))}`);
  if (!f || !f.run || f.run.cls !== 'mage' || !f.meta.taught) await fail('the character should be stored, and the prompts remembered as seen, as soon as they are over');
  await reload();
  hands = await makeHands(page);
  const offered = !!(await hands.mark('button:CONTINUE'));
  log('after reload: Continue offered / prompts now off', `${offered} / ${!(await prompts(false))}`);
  if (!offered || (await prompts(false))) await fail('after the prompts have been seen through, Continue should be offered and PROMPTS be off');
  // someone switches the prompts back on and starts another character over the saved Mage: it takes
  // a second press, and then the new character is the stored one
  await prompts(true);
  await hands.press('button:NEW GAME');
  await hands.press('class:warrior');
  f = await stored();
  log('one press on Warrior over the saved Mage: stored is still', f && f.run ? f.run.cls : 'none');
  if (!f || !f.run || f.run.cls !== 'mage' || (await guiding())) await fail('one press on a class card must not throw the saved character away');
  await hands.press('class:warrior');
  await page.waitForTimeout(400);
  now = await guiding();
  await reload();
  hands = await makeHands(page);
  f = await stored();
  log('a second press: the Warrior, in the first dungeon; page closed: stored is', `${JSON.stringify(now)} -> ${f && f.run ? f.run.cls : 'none'}, Continue ${!!(await hands.mark('button:CONTINUE'))}`);
  if (!now || now.cls !== 'warrior' || !now.guide || !f || !f.run || f.run.cls !== 'warrior') await fail('the second press should start the Warrior in the first dungeon and store it');

  // from here on: characters who begin in town
  // (saving is switched off before the storage is emptied, or closing the page would write the Warrior back)
  await page.evaluate(() => { window.__dbg.saving(false); localStorage.removeItem('arpg.save'); localStorage.removeItem('arpg.run'); });
  await reload();
  hands = await makeHands(page);
  await prompts(false);
  await hands.press('button:NEW GAME');
  await hands.press('class:ranger');
  f = await stored();
  now = await guiding();
  log('prompts off, picked Ranger: where / stored at once', `${JSON.stringify(now)} / run ${f && f.run ? f.run.cls : 'none'}`);
  if (!now || !now.town || now.guide || !f || !f.run || f.run.cls !== 'ranger') await fail('with prompts off a new character should begin in town, stored at once');

  // earn things the quick way, bank some of them, and lay a word on the gate
  await page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero;
    h.level = 6; h.xp = 40; h.gold = 321; h.attrs.dex += 9; h.words.twin = 3; h.words.frost = 2; h.words.power = 1; g.depth = 3; g.cleared = 2; g.kills = 150; g.refresh();
    g.socket(0, 'front', 'twin'); g.socket(1, 'behind', 'frost');
    // (keeping a word costs gold, more each time: the gold for it is handed over here)
    for (const w of ['twin', 'twin', 'frost']) { h.gold += g.keepCost(); g.depositWord(w); }
    h.gold += 9999; g.buy(0); g.buy(1); h.gold -= 9999; g.stashItem(h.bag.findIndex(Boolean));
    g.planWord('power');
    d.save();
  });
  let s = await st();
  log('before closing', { level: s.level, gold: s.gold, depth: s.depth, skills: s.skills, carried: s.carried, bag: s.bag, plan: s.plan, lexicon: s.lexicon, stash: s.stash });

  await reload();
  hands = await makeHands(page);
  await snap('title_continue');
  log('after reload, pressed', String(await hands.press('button:CONTINUE')));
  s = await st();
  log('restored', { cls: s.cls, level: s.level, gold: s.gold, depth: s.depth, town: s.town, skills: s.skills, dex: s.dex, carried: s.carried, bag: s.bag, plan: s.plan, lexicon: s.lexicon, stash: s.stash });

  // starting over needs a second press
  await page.evaluate(() => window.__dbg.toTitle());
  await page.waitForTimeout(200);
  await prompts(false);
  await hands.press('button:NEW GAME');
  await hands.press('class:warrior');
  s = await st();
  log('one press on Warrior: still at title', String(!!s.title));
  if (!s.title) await fail('one press on a class card threw the saved character away');
  await snap('title_confirm');
  await page.waitForTimeout(5200);
  log('the warning goes away by itself after 5 s', String(!(await page.evaluate(() => [...window.__dbg.ui.marks.keys()].length === 0))));

  // carry on with the Ranger, then die: the run goes, the Lexicon and stash stay
  await toMenu();
  await hands.press('button:CONTINUE');
  await page.evaluate(() => { const g = window.__dbg.game(); g.enterDungeon(); g.hurtHero(99999, 'phys', [], null); });
  await page.waitForTimeout(500);
  // (from Version 15.1 a hero whose life runs out FALLS first, and the words YOU DIED wait two
  // seconds for it: main.ts, FALL_SEEN. Half a second after the blow they are not up yet.)
  await snap('falling');
  const early = await hands.mark('button:New run');
  log('half a second after the blow the hero is falling, and the words are not up', String(!early));
  if (early) await fail('YOU DIED came up at once: the hero was not shown falling');
  for (let i = 0; i < 40 && !(await hands.mark('button:New run')); i++) await page.waitForTimeout(100);
  await snap('dead');
  f = await stored();
  s = await st();
  log('died in the dungeon: stored run / Lexicon / stash / deaths', `${f.run ? f.run.cls : 'none'} / ${s.lexicon} / ${s.stash} / ${s.deaths}`);
  await hands.press('button:New run');
  await page.waitForTimeout(200);
  await snap('title_legacy');
  await prompts(false);
  await hands.press('button:NEW GAME');
  await hands.press('class:warrior');
  await page.waitForTimeout(200);
  s = await st();
  log('a new Warrior starts with', { level: s.level, carried: s.carried, bag: s.bag, lexicon: s.lexicon, stash: s.stash });
  const took = await page.evaluate(() => { const g = window.__dbg.game(); return [g.withdrawWord('twin'), g.unstashItem(g.meta.stash.findIndex(Boolean))]; });
  s = await st();
  log('and can take the old words and gear', `${JSON.stringify(took)} carried ${s.carried}, bag ${s.bag}`);

  // closing the page now keeps both
  await page.evaluate(() => window.__dbg.save());
  await reload();
  hands = await makeHands(page);
  s = await st();
  log('after another reload: Lexicon / stash kept', `${s.lexicon} / ${s.stash}, Continue ${!!(await hands.mark('button:CONTINUE'))}`);

  // a save written by Build 1 (run only, old name) still loads
  await page.evaluate(() => {
    const f = JSON.parse(localStorage.getItem('arpg.save'));
    localStorage.removeItem('arpg.save');
    localStorage.setItem('arpg.run', JSON.stringify(f.run));
  });
  await reload();
  hands = await makeHands(page);
  const name = await hands.press('button:CONTINUE');
  s = await st();
  log('a Build 1 save still continues', `${name} -> ${s.cls} level ${s.level}`);
}
