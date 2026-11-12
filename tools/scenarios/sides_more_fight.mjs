// THE BRAWLER'S EIGHT WAYS IN A FIGHT, WITH A THUMB (art/sides_more.ts EIGHT_MORE.brawler on; the chat that brought the eight
// sides in, 11 Nov 2026; the Tinkerer chat's README, docs/mockups/eight_sides/README.md, "NOT CHECKED: a fight against enemies in
// the browser with the switch on"). Real touches, on a phone held sideways:
//   1. HIS BLOWS THE EIGHT WAYS AGAINST ENEMIES (auto aim, the practice room): a skeleton stood off each of his eight ways in
//      turn (17 degrees off it, so the blow is aimed between two ways); a tap: his jab faces the nearest of the EIGHT, lands,
//      and carries him along the way he faces. Then straight down, left, up and right of the screen (the ways the game never
//      drew): the jab, the cross and the hook, and the round kick held, each landing.
//   2. HIS DODGE: a swipe each of eight ways on the screen: the jump spent, and he is carried straight along one of his eight
//      ways, a different one for each swipe.
//   3. PROPS BROKEN BY A BLOW THROWN STRAIGHT LEFT AND STRAIGHT RIGHT of the screen (attacks the way he faces, on a floor with
//      barrels and urns): he is stood to the right of one and to the left of another, faced at it; a tap: it breaks.
//   4. Where the page has his pictures baked (BAKED=1: asked for): the bake's group come whole, and every frame of every side of
//      his in hand before he fights, so none is painted in play nor stood in for.
//   node tools/playtest.mjs --file <page> --serve --touch --size 844x390 --dpr 3 --scenario tools/scenarios/sides_more_fight.mjs --out shots/sides_fight/x
//   OFF=1: a page with his eight sides off: his blows then face the nearest of his FOUR ways (the same script, the other answer).
import { log } from './lib.mjs';

const R = Math.SQRT1_2;
/** His eight ways on the game's floor (art/sides_more.ts MORE_WAY, 45 degrees apart from down-right), and what each is on the screen. */
const WAYS = [[1, 0], [R, R], [0, 1], [-R, R], [-1, 0], [-R, -R], [0, -1], [R, -R]];
const NAMES = ['down-right', 'straight down', 'down-left', 'straight left', 'up-left', 'straight up', 'up-right', 'straight right'];

export default async function (page, snap) {
  const off = process.env.OFF === '1';
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
  const tap = async (gx, gy, ms = 60) => { pts.set(9, await client(gx, gy)); const sent = send('touchStart'); await page.waitForTimeout(ms); await Promise.all([sent, up(9)]); };
  const st = () => page.evaluate(() => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const v = h.vet;
    return {
      w: d.screen.w, h: d.screen.h, x: h.x, y: h.y,
      globes: v ? [...v.globes] : [], done: v ? [...v.done] : [],
      move: v && v.move ? { id: v.move.id, f: v.move.f, fx: v.move.fx, fy: v.move.fy, ax: v.move.ax, ay: v.move.ay } : null,
      hurt: g.monsters.filter((m) => !m.dead).map((m) => m.maxLife - m.life),
      jump: h.skills[2].charges, skills: h.skills.map((s) => s.id),
      painted: d.painting.frames,
    };
  });
  const waitFor = async (pred, ms, each = 40) => {
    const end = Date.now() + ms;
    let s = await st();
    while (Date.now() < end && !pred(s)) {
      await page.waitForTimeout(each);
      s = await st();
    }
    return s;
  };
  /** The nearest of his ways to a direction on the floor: of eight, or (his eight sides off) of four. */
  const nearest = (dx, dy) => {
    if (off) return Math.abs(dx) >= Math.abs(dy) ? [dx >= 0 ? 1 : -1, 0] : [0, dy >= 0 ? 1 : -1];
    const k = ((Math.round((Math.atan2(dy, dx) * 180) / Math.PI / 45) % 8) + 8) % 8;
    return WAYS[k];
  };
  const same = (a, b) => Math.abs(a[0] - b[0]) < 1e-6 && Math.abs(a[1] - b[1]) < 1e-6;
  /**
   * Is `f` the nearest of his ways to a direction? His eight sides off, a swipe straight along the screen falls exactly between
   * two of his four ways: either is the nearest (the merge chat, 11 Nov 2026: OFF=1 flagged the swipe at 180 degrees, where
   * the game took one of the two and `nearest`, on the last bit of a sum, the other).
   */
  const isNearest = (f, dx, dy) => {
    if (!off) return same(f, nearest(dx, dy));
    const n = Math.hypot(dx, dy) || 1;
    const one = Math.abs(Math.abs(f[0]) + Math.abs(f[1]) - 1) < 1e-6 && Math.abs(f[0] * f[1]) < 1e-6;
    return one && (f[0] * dx + f[1] * dy) / n > Math.max(Math.abs(dx), Math.abs(dy)) / n - 1e-6;
  };
  const fmt = (v) => `${v[0].toFixed(2)}, ${v[1].toFixed(2)}`;

  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.veteran.on = true;
    d.practice('brawler', 7);
    d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0;
  });
  await page.evaluate(() => window.__dbg.setAim('auto'));
  // (his pictures come: the bake's, the loading screen up until they have, or the side painter's; his first ones at least)
  for (let i = 0; i < 600; i++) { if (!(await page.evaluate(() => window.__dbg.loadingNow()))) break; await page.waitForTimeout(50); }
  await page.waitForTimeout(Number(process.env.WAIT || 6000));
  let s = await st();
  check('the Brawler is the Veteran: Punch, Kick, Jump', JSON.stringify(s.skills) === JSON.stringify(['vpunch', 'vkick', 'vjump']), JSON.stringify(s.skills));
  const home = { x: s.x, y: s.y };
  const rx = s.w * 0.78;
  const ry = s.h * 0.5;
  const baked = await page.evaluate(() => { const p = window.__dbg.painter; const b = p && p.baked; return b ? { given: b.stats.given, failed: [...b.stats.failed], ms: { ...b.stats.ms }, done: b.done('brawler') } : null; });
  log('his pictures', baked ? `baked: ${baked.given} frames taken in, the Brawler's group ${baked.done ? 'come whole' : 'not come yet'}${baked.ms.brawler ? ` in ${baked.ms.brawler} ms` : ''}${baked.failed.length ? `, FAILED ${baked.failed.join('; ')}` : ''}` : 'not baked on this page: painted as the game is played');
  /** His lists' frames, every side: how many are in hand, and how many still to paint (not read: reading one would paint it). */
  const inHand = () => page.evaluate(() => {
    const d = window.__dbg; const art = d.renderer.heroArt(d.game());
    let have = 0; let none = 0; let sides = 0;
    const count = (list) => { if (!Array.isArray(list)) return; for (let i = 0; i < list.length; i++) { const ds = Object.getOwnPropertyDescriptor(list, i); if (ds && 'value' in ds && ds.value) have++; else none++; } };
    for (const side of Object.keys(art)) {
      const set = art[side]; const c = set.clips || {};
      sides++;
      count(set.idle); count(set.walk);
      for (const k of ['reel', 'fall']) if (c[k]) count(c[k].frames);
      for (const id of Object.keys(c.vet || {})) count(c.vet[id].frames);
      for (const id of Object.keys(c.vetHalves || {})) count(c.vetHalves[id].frames);
      for (const id of Object.keys(c.vetFx || {})) for (const layer of ['ground', 'behind', 'front']) count(c.vetFx[id][layer]);
    }
    return { sides, have, none };
  });
  if (process.env.BAKED === '1') {
    check('his pictures are the bake\'s, come whole, none failed', !!baked && baked.done && !baked.failed.length, JSON.stringify(baked));
    const got = await inHand();
    check(`every frame of his ${off ? 'two' : 'eight'} sides is in hand before he fights: none left to paint, none to stand in for`, got.sides === (off ? 2 : 8) && got.have > 0 && got.none === 0, `${got.sides} sides, ${got.have} places with their picture, ${got.none} without`);
  }
  const painted0 = s.painted;

  /** Him back where he began, his combo and his jump as new, and one skeleton that stands and cannot die at (dx, dy) from him. */
  const setUp = async (dx, dy) => {
    const ok = await page.evaluate(([hx, hy, dx, dy]) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero;
      g.monsters.length = 0;
      d.lock.clear();
      h.x = hx; h.y = hy; h.fx = 1; h.fy = 0;
      h.vet = { globes: [], queue: [], move: null, done: [], idle: 0 };
      h.skills[2].charges = h.skills[2].maxCharges; h.skills[2].cd = 0;
      if (dx === null) return -1;
      const L = g.level; const W = L.floor.w;
      const x = hx + dx; const y = hy + dy;
      if (L.walk[Math.floor(y) * W + Math.floor(x)] !== 1) return null;
      const m = g.spawn('skeleton', x, y, 1, 0, false, g.rng);
      g.wakeUp(m); m.life = m.maxLife = 1e7; m.speed = 0; m.cd = 1e9;
      return m.id;
    }, [home.x, home.y, dx, dy]);
    // (auto aim locked onto it, as it is onto an enemy come upon: the one before it let go of at once, game/lock.ts)
    if (ok !== null && ok >= 0) {
      for (let i = 0; i < 60; i++) {
        if ((await page.evaluate(() => window.__dbg.lock.id)) === ok) break;
        await page.waitForTimeout(25);
      }
    }
    await page.waitForTimeout(200);
    return ok !== null;
  };

  // 1. HIS BLOWS THE EIGHT WAYS AGAINST ENEMIES
  console.log(`1. his jab at an enemy off each of his eight ways${off ? ' (HIS EIGHT SIDES OFF: the nearest of his four)' : ''}`);
  const faced = new Set();
  for (let k = 0; k < 8; k++) {
    const a = ((k * 45 + 17) * Math.PI) / 180;
    const [dx, dy] = [1.5 * Math.cos(a), 1.5 * Math.sin(a)];
    const want = nearest(dx, dy);
    check(`${NAMES[k]}: floor to stand an enemy on`, await setUp(dx, dy));
    const before = await st();
    await tap(rx, ry);
    const begun = await waitFor((q) => !!q.move, 2000, 20);
    check(`${NAMES[k]}: a tap, his jab begins`, !!begun.move && begun.move.id === 'jab', JSON.stringify(begun.move));
    if (begun.move) {
      const f = [begun.move.fx, begun.move.fy];
      faced.add(fmt(f));
      check(`${NAMES[k]}: his picture faces the nearest of his ${off ? 'four' : 'eight'} ways to it`, same(f, want), `faces ${fmt(f)}, the nearest ${fmt(want)}, aimed ${fmt([dx / 1.5, dy / 1.5])}`);
      const cos = (begun.move.ax * dx + begun.move.ay * dy) / 1.5;
      check(`${NAMES[k]}: its force goes straight at the enemy`, cos > 0.999, `cos ${cos.toFixed(4)}`);
    }
    // (the blow as it lands, photographed)
    await waitFor((q) => !q.move || q.move.f >= 14, 2500, 15);
    await snap(`1_jab_${k}_${NAMES[k].replace(/ /g, '_')}`);
    const after = await waitFor((q) => q.globes.length === 0 && !q.move, 4000);
    check(`${NAMES[k]}: the jab lands`, after.hurt.some((x) => x > 0), JSON.stringify(after.hurt));
    // (carried along the way his picture faces: nothing across it)
    const mv = [after.x - before.x, after.y - before.y];
    const along = mv[0] * want[0] + mv[1] * want[1];
    const across = mv[0] * want[1] - mv[1] * want[0];
    check(`${NAMES[k]}: carried along the way he faces`, along > 0.05 && Math.abs(across) < 0.02, `${along.toFixed(3)} tiles along, ${across.toFixed(3)} across`);
  }
  check(off ? 'his jabs faced his four ways' : 'his jabs faced eight different ways', faced.size === (off ? 4 : 8), `${faced.size}: ${[...faced].join(' | ')}`);

  // (the ways the game never drew: straight down, left, up and right of the screen: his three punches, and his round kick held)
  if (!off) {
    console.log('1b. straight down, left, up and right of the screen: the jab, the cross and the hook; the round kick held');
    for (const k of [1, 3, 5, 7]) {
      const [dx, dy] = [1.5 * WAYS[k][0], 1.5 * WAYS[k][1]];
      await setUp(dx, dy);
      for (let i = 0; i < 3; i++) await tap(rx, ry);
      const locked = await waitFor((q) => q.globes.length === 3, 2500, 20);
      check(`${NAMES[k]}: three taps, three globes`, locked.globes.length === 3, JSON.stringify(locked.globes));
      const seen = [];
      const hurts = [];
      const end = Date.now() + 9000;
      let q = await st();
      while (Date.now() < end && (q.globes.length || q.move)) {
        if (q.move && !seen.some((m) => m.id === q.move.id)) seen.push(q.move);
        hurts.push(q.hurt[0] ?? 0);
        await page.waitForTimeout(30);
        q = await st();
      }
      check(`${NAMES[k]}: the jab, the cross and the hook`, seen.map((m) => m.id).join(',') === 'jab,cross,hook', seen.map((m) => m.id).join(','));
      check(`${NAMES[k]}: each faces ${NAMES[k]}`, seen.length > 0 && seen.every((m) => same([m.fx, m.fy], WAYS[k])), seen.map((m) => fmt([m.fx, m.fy])).join(' | '));
      const steps = new Set(hurts.filter((x) => x > 0)).size;
      check(`${NAMES[k]}: all three land`, steps >= 3, `${steps} blows marked on it`);
      // (the round kick, held: he faces the enemy, as his punches have left him. A HELD ATTACK UNDER AUTO AIM GOES THE WAY HE
      // FACES, not at the enemy auto aim has picked: main.ts gives the hold's place as castX, castY and game.ts vetAimOf reads
      // aimX, aimY, which under auto aim is a tile ahead of him. So it is on main, with his four ways too: reported, not mended here.)
      await setUp(dx, dy);
      await page.evaluate(([wx, wy]) => { const h = window.__dbg.game().hero; h.fx = wx; h.fy = wy; }, WAYS[k]);
      await page.waitForTimeout(80);
      await down(2, rx, ry);
      let h2 = await waitFor((x) => x.globes.length >= 1, 1500, 20);
      await up(2);
      check(`${NAMES[k]}: a hold, the round kick`, h2.globes[0] === 'kick', JSON.stringify(h2.globes));
      h2 = await waitFor((x) => !!x.move, 1500, 15);
      check(`${NAMES[k]}: it faces ${NAMES[k]}`, !!h2.move && same([h2.move.fx, h2.move.fy], WAYS[k]), h2.move ? fmt([h2.move.fx, h2.move.fy]) : 'no move');
      await waitFor((x) => !x.move || x.move.f >= 19, 3000, 15);
      await snap(`1b_kick_${k}_${NAMES[k].replace(/ /g, '_')}`);
      h2 = await waitFor((x) => x.globes.length === 0 && !x.move, 6000);
      check(`${NAMES[k]}: the round kick lands`, h2.hurt.some((x) => x > 0), JSON.stringify(h2.hurt));
    }
  }

  // 2. HIS DODGE
  console.log('2. his dodge: a swipe each of eight ways on the screen');
  const jumped = new Set();
  const carries = [];
  for (let k = 0; k < 8; k++) {
    await setUp(null, null);
    const a = (k * 45 * Math.PI) / 180;
    const [ux, uy] = [Math.cos(a), Math.sin(a)];
    const before = await st();
    await down(3, rx, ry);
    await move(3, rx + ux * 20, ry + uy * 20);
    await move(3, rx + ux * 44, ry + uy * 44);
    await up(3);
    const begun = await waitFor((q) => !!q.move, 1500, 15);
    check(`swipe ${k * 45} degrees: his jump`, !!begun.move && begun.move.id === 'dodge', JSON.stringify(begun.move));
    const after = await waitFor((q) => q.globes.length === 0 && !q.move, 5000);
    check(`swipe ${k * 45} degrees: the jump spent`, after.jump === before.jump - 1, `${before.jump} to ${after.jump}`);
    if (!begun.move) continue;
    // (he faces from where he is going, one of his ways; and is carried as the art carries his jump, back and a little to
    // one side of the way he faces: the same whichever way he jumps)
    const f = [begun.move.fx, begun.move.fy];
    check(`swipe ${k * 45} degrees: he faces one of his ${off ? 'four' : 'eight'} ways`, same(f, nearest(f[0], f[1])), fmt(f));
    const mv = [after.x - before.x, after.y - before.y];
    const back = -(mv[0] * f[0] + mv[1] * f[1]);
    const side = Math.abs(mv[0] * f[1] - mv[1] * f[0]);
    // (the way he was swiped, on the floor: a screen pixel right is half a tile-step down-right and up-right, the game's own
    // screenDirToWorld; he faces the nearest of his ways to straight back along it, and springs back from the way he faces)
    const sw = [ux / 2 + uy, uy - ux / 2];
    check(`swipe ${k * 45} degrees: he faces back along the swipe, the nearest of his ways to it, and springs away`, isNearest(f, -sw[0], -sw[1]) && back > 0.5, `faces ${fmt(f)}, swiped ${fmt([sw[0] / Math.hypot(sw[0], sw[1]), sw[1] / Math.hypot(sw[0], sw[1])])} on the floor; ${back.toFixed(2)} tiles back, ${side.toFixed(2)} to the side`);
    jumped.add(fmt(f));
    carries.push([back, side]);
  }
  check(off ? 'his jumps went his four ways' : 'his jumps went eight different ways', jumped.size === (off ? 4 : 8), `${jumped.size}: ${[...jumped].join(' | ')}`);
  check('carried as far whichever way he jumps', carries.length > 0 && carries.every(([b, sd]) => Math.abs(b - carries[0][0]) < 0.03 && Math.abs(sd - carries[0][1]) < 0.03), carries.map(([b, sd]) => `${b.toFixed(2)}/${sd.toFixed(2)}`).join(' '));

  // 4. (before the floor of props is laid)
  s = await st();
  // (the game's own count of frames painted as they were first shown: the skeletons' and the sparks' are among them)
  log('painted in play', `${s.painted - painted0} frames by the game itself, of anything`);
  const frames = await (async () => {
    await setUp(1.5, 0.3);
    for (let i = 0; i < 3; i++) await tap(rx, ry);
    return page.evaluate(() => new Promise((done) => {
      const times = []; let last = performance.now(); let n = 0;
      const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 90) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ median: Math.round(times[45] * 10) / 10, worst: Math.round(times[89] * 10) / 10 }); } };
      requestAnimationFrame(tick);
    }));
  })();
  log('a frame while he fights', `${frames.median} ms in the middle, ${frames.worst} ms at worst`);
  await waitFor((q) => q.globes.length === 0 && !q.move, 9000);

  // 3. PROPS BROKEN BY A BLOW THROWN STRAIGHT LEFT AND STRAIGHT RIGHT
  console.log('3. props broken by a blow thrown straight left and straight right of the screen');
  await page.evaluate((seed) => {
    const d = window.__dbg;
    d.veteran.on = true;
    d.run('brawler', seed); d.seasoned(10); d.autoLevel = false; d.autoWords = false; d.god = true;
  }, Number(process.env.SEED || 5));
  await page.waitForTimeout(800);
  await page.evaluate((n) => {
    const g = window.__dbg.game();
    g.depth = n; g.cleared = n - 1; g.enterDungeon();
    g.monsters.length = 0; g.guide = null; g.hero.invuln = 1e9;
  }, Number(process.env.DEPTH || 2));
  for (let i = 0; i < 200; i++) { if (!(await page.evaluate(() => window.__dbg.loadingNow()))) break; await page.waitForTimeout(50); }
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.__dbg.setAim('face'));
  for (const [name, k] of [['straight left', 3], ['straight right', 7]]) {
    if (off) break;
    // (a barrel or an urn with floor to stand on a little more than a tile from it, on the other side of it from the way of the blow)
    const put = await page.evaluate(([wx, wy]) => {
      const g = window.__dbg.game(); const L = g.level; const W = L.floor.w; const h = g.hero;
      g.monsters.length = 0;
      for (const p of L.props) {
        if (p.state !== 0 || (p.kind !== 'barrel' && p.kind !== 'urn')) continue;
        const x = p.x - wx * 1.3; const y = p.y - wy * 1.3;
        if (L.walk[Math.floor(y) * W + Math.floor(x)] !== 1) continue;
        // (nothing else of the floor's between them)
        const mx = p.x - wx * 0.65; const my = p.y - wy * 0.65;
        if (L.walk[Math.floor(my) * W + Math.floor(mx)] !== 1 && !(Math.floor(mx) === p.tx && Math.floor(my) === p.ty)) continue;
        h.x = x; h.y = y; h.fx = wx; h.fy = wy;
        h.vet = { globes: [], queue: [], move: null, done: [], idle: 0 };
        return { kind: p.kind, tx: p.tx, ty: p.ty };
      }
      return null;
    }, WAYS[k]);
    check(`${name}: a barrel or an urn to stand beside`, !!put, JSON.stringify(put));
    if (!put) continue;
    await page.waitForTimeout(700);
    await page.evaluate(([wx, wy]) => { const h = window.__dbg.game().hero; h.fx = wx; h.fy = wy; }, WAYS[k]);
    await tap(rx, ry);
    const begun = await waitFor((q) => !!q.move, 2000, 15);
    check(`${name}: his jab faces ${name}`, !!begun.move && same([begun.move.fx, begun.move.fy], WAYS[k]), begun.move ? fmt([begun.move.fx, begun.move.fy]) : 'no move');
    await waitFor((q) => !q.move || q.move.f >= 15, 2500, 15);
    await snap(`3_prop_${name.replace(/ /g, '_')}`);
    await waitFor((q) => q.globes.length === 0 && !q.move, 4000);
    const broken = await page.evaluate(([tx, ty]) => { const p = window.__dbg.game().level.props.find((q) => q.tx === tx && q.ty === ty); return p ? p.state : -1; }, [put.tx, put.ty]);
    check(`${name}: the ${put.kind} is broken`, broken === 1, `its state ${broken}`);
  }
  if (bad) console.log(`!! ${bad} thing(s) wrong`);
}
