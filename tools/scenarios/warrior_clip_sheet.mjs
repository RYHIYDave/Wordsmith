// THE WARRIOR'S PICTURES OF ONE MOVE, BARE (no floor, no effects): each side's frames of a clip of his, as the game holds them
// (the bake on the served page), laid out a row a side. For seeing a move's own pictures apart from what the game lays over them.
//   WEAPON=hammer CLIPS=moves.chargeCrouch,leap,land OUT=shots/clip/charge.png node tools/playtest.mjs --serve --file dist/wrapped.html --size 1600x1000 --dpr 1 --scenario tools/scenarios/warrior_clip_sheet.mjs --out shots/clip/x
//   WEAPON: hammer | axe | (none: the great sword). EVERY: every how many frames (2).
import { log } from './lib.mjs';

export default async function (page) {
  const weapon = process.env.WEAPON || '';
  const clips = (process.env.CLIPS || 'leap').split(',');
  const every = Number(process.env.EVERY || 2);
  const out = process.env.OUT || 'shots/clip/sheet.png';
  const talent = weapon === 'hammer' ? 'warhammer' : weapon === 'axe' ? 'battleaxe' : 'greatsword';
  await page.evaluate((talent) => {
    const D = window.__dbg; D.saving(false); D.run('warrior', 9); D.god = true; D.seasoned(30); D.game().takeTalent(talent);
  }, talent);
  await page.waitForTimeout(9000);
  const info = await page.evaluate(({ weapon, clips, every }) => {
    const heroes = window.__dbg.renderer.art.heroes;
    const set = heroes.of('warrior', { twoHanded: true, town: false, ...(weapon ? { weapon } : {}) });
    const sides = Object.entries(set).filter(([, s]) => s && typeof s === 'object' && 'idle' in s);
    const rows = [];
    for (const [side, s] of sides) {
      const row = [];
      for (const name of clips) {
        const c = name.startsWith('moves.') ? s.clips?.moves?.[name.slice(6)] : s.clips?.[name];
        if (!c) { row.push({ missing: `${side}.${name}` }); continue; }
        for (let i = 0; i < c.frames.length; i += every) row.push({ sp: c.frames[i], name, i });
      }
      rows.push({ side, row });
    }
    const imgOf = (sp) => sp.img ?? sp.canvas ?? sp.cv;
    const W = Math.max(...rows.flatMap((r) => r.row.map((q) => (q.sp && imgOf(q.sp) ? imgOf(q.sp).width : 0))));
    const H = Math.max(...rows.flatMap((r) => r.row.map((q) => (q.sp && imgOf(q.sp) ? imgOf(q.sp).height : 0))));
    const cols = Math.max(...rows.map((r) => r.row.length));
    const cv = document.createElement('canvas');
    cv.width = 70 + cols * W; cv.height = rows.length * H;
    const g = cv.getContext('2d');
    g.fillStyle = '#1c2050'; g.fillRect(0, 0, cv.width, cv.height);
    g.fillStyle = '#e9ecff'; g.font = '12px monospace';
    const missing = [];
    rows.forEach((r, y) => {
      g.fillText(r.side, 4, y * H + H / 2);
      r.row.forEach((q, x) => {
        if (q.missing) { missing.push(q.missing); return; }
        const img = imgOf(q.sp);
        if (img) g.drawImage(img, 70 + x * W, y * H);
      });
    });
    cv.id = '__sheet';
    cv.style.cssText = 'position:fixed;left:0;top:0;z-index:99999;image-rendering:pixelated';
    document.body.appendChild(cv);
    return { w: cv.width, h: cv.height, missing, keys: Object.keys(sides[0][1]), sp: Object.keys(rows[0].row.find((q) => q.sp)?.sp ?? {}) };
  }, { weapon, clips, every });
  log('sheet', JSON.stringify(info));
  await page.setViewportSize({ width: Math.min(4000, info.w), height: Math.min(4000, info.h) });
  await page.waitForTimeout(300);
  await page.locator('#__sheet').screenshot({ path: out });
  log('saved', out);
}
