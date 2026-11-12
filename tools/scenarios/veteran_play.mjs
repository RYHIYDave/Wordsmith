// THE VETERAN WITH A THUMB (game/veteran.ts, behind VETERAN: switched on here; on a page with the Brawler in): on a phone held
// sideways, auto aim, in the practice room against skeletons that stand and cannot die. Real touches, as a player makes them:
//   1. three taps: three green globes, locked; each of the jab, the cross and the hook lands; the globes go out after;
//   2. a hold: an orange globe, the round kick lands;
//   3. a swipe: a white globe, the jump spent (its charge gone), and a tap straight after it sets the globe in fire (the
//      flying uppercut), without spending another jump;
//   4. the frame time while he fights.
//   node tools/build_brawler_to.mjs dist/vet.html
//   node tools/playtest.mjs --file dist/vet.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/veteran_play.mjs --out shots/vetplay/x
import { log } from './lib.mjs';

export default async function (page, snap) {
  let bad = 0;
  const check = (what, ok, detail = '') => {
    if (!ok) bad++;
    console.log(`${ok ? '  ok ' : '  !! '}${what}${detail ? `   (${detail})` : ''}`);
  };
  const cdp = await page.context().newCDPSession(page);
  const pts = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...pts].map(([id, p]) => ({ x: Math.round(p.x), y: Math.round(p.y), id })) });
  const client = (gx, gy) => page.evaluate(([x, y]) => window.__dbg.screen.toClient(x, y), [gx, gy]);
  const down = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchStart'); };
  const move = async (id, gx, gy) => { pts.set(id, await client(gx, gy)); await send('touchMove'); };
  const up = async (id) => {
    const q = pts.get(id);
    pts.delete(id);
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: q ? [{ x: Math.round(q.x), y: Math.round(q.y), id }] : [] });
  };
  // (as touch.mjs: a tap's coming down not waited for before its going up)
  const tap = async (gx, gy, ms = 60) => { pts.set(9, await client(gx, gy)); const sent = send('touchStart'); await page.waitForTimeout(ms); await Promise.all([sent, up(9)]); };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const v = h.vet;
    return {
      w: d.screen.w, h: d.screen.h,
      globes: v ? [...v.globes] : [], move: v && v.move ? v.move.id : null, done: v ? [...v.done] : [],
      hurt: g.monsters.filter((m) => !m.dead).map((m) => m.maxLife - m.life),
      jump: h.skills[2].charges, skills: h.skills.map((s) => s.id),
    };
  });
  const setUp = async (n) => {
    await page.evaluate((n) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      g.monsters.length = 0;
      h.vet = { globes: [], queue: [], move: null, done: [], idle: 0 };
      h.skills[2].charges = h.skills[2].maxCharges; h.skills[2].cd = 0;
      for (let k = 0; k < n; k++) {
        const m = g.spawn('skeleton', h.x + 2.2, h.y + (k - (n - 1) / 2) * 0.9, 1, 0, false, g.rng);
        g.wakeUp(m); m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9;
      }
    }, n);
    await page.waitForTimeout(300);
  };
  const waitFor = async (pred, ms) => {
    const end = Date.now() + ms;
    let s = await st();
    while (Date.now() < end && !pred(s)) {
      await page.waitForTimeout(100);
      s = await st();
    }
    return s;
  };

  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.veteran.on = true;
    d.practice('brawler', 7);
    d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
  });
  // (AUTO AIM, as its head says: until 11 Nov 2026 it was played with the playtests' own "where the thumb taps", the thumb down
  // straight to the right of him and the skeletons down and to the right, and his blows found them only because his picture
  // then faced the nearest of FOUR ways and carried him at them; from all eight sides, art/sides_more.ts, he faces and is
  // carried where the thumb aimed, straight to the right, as he should. And the loading screen waited out: his pictures from
  // eight sides are four times as many to take in, and taps made under it went nowhere.)
  await page.evaluate(() => window.__dbg.setAim('auto'));
  for (let i = 0; i < 600; i++) { if (!(await page.evaluate(() => window.__dbg.loadingNow()))) break; await page.waitForTimeout(50); }
  await page.waitForTimeout(1500);
  let s = await st();
  check('the Brawler is the Veteran: Punch, Kick, Jump', JSON.stringify(s.skills) === JSON.stringify(['vpunch', 'vkick', 'vjump']), JSON.stringify(s.skills));
  const rx = s.w * 0.78;
  const ry = s.h * 0.5;

  // 1. three taps
  await setUp(2);
  for (let i = 0; i < 3; i++) await tap(rx, ry);
  s = await waitFor((q) => q.globes.length === 3, 2500);
  check('three taps: three green globes, locked', JSON.stringify(s.globes) === JSON.stringify(['punch', 'punch', 'punch']), JSON.stringify(s.globes));
  await snap('1_three_globes');
  s = await waitFor((q) => q.globes.length === 0, 9000);
  check('played out: the jab, the cross, the hook; the globes gone out', s.globes.length === 0, JSON.stringify(s.done));
  check('they landed', s.hurt.some((x) => x > 0), JSON.stringify(s.hurt));

  // 2. a hold
  await setUp(1);
  await down(2, rx, ry);
  s = await waitFor((q) => q.globes.length >= 1, 1500);
  await up(2);
  check('a hold: an orange globe, the round kick', s.globes[0] === 'kick', JSON.stringify(s.globes));
  await snap('2_kick');
  s = await waitFor((q) => q.globes.length === 0, 6000);
  check('the round kick landed', s.hurt.some((x) => x > 0), JSON.stringify(s.hurt));

  // 3. a swipe, then a tap straight after: the flying uppercut
  await setUp(1);
  s = await st();
  const j0 = s.jump;
  await down(3, rx, ry);
  await move(3, rx - 20, ry);
  await move(3, rx - 44, ry);
  await up(3);
  await tap(rx, ry);
  s = await waitFor((q) => q.globes.length >= 1 && q.globes[0] !== 'jump', 1500);
  check('a swipe spends the jump', s.jump === j0 - 1, `${j0} to ${s.jump}`);
  check('a tap straight after: its globe in green fire, the flying uppercut', s.globes[0] === 'punchFire', JSON.stringify(s.globes));
  await snap('3_fire');
  s = await waitFor((q) => q.globes.length === 0, 7000);
  check('the flying uppercut landed', s.hurt.some((x) => x > 0), JSON.stringify(s.hurt));

  // 4. the frame time while he fights
  await setUp(3);
  for (let i = 0; i < 3; i++) await tap(rx, ry);
  const frames = await page.evaluate(() => new Promise((done) => {
    const times = []; let last = performance.now(); let n = 0;
    const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 90) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ median: Math.round(times[45] * 10) / 10, worst: Math.round(times[89] * 10) / 10 }); } };
    requestAnimationFrame(tick);
  }));
  log('frames while he fights (ms)', JSON.stringify(frames));
  check('a frame in good time while he fights', frames.median <= 40, `${frames.median} ms`);
  log('veteran_play', bad ? `${bad} thing(s) wrong` : 'all as they should be');
}
