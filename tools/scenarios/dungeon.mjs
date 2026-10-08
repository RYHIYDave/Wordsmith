// The dungeon itself (Version 14.1): its floor, its walls and what stands in it, looked at in the game.
// A tour: the town, then a dungeon with everything revealed, the hero set down beside one of each
// kind of thing in turn, before and after it is opened, broken, searched or lit.
//   node tools/playtest.mjs --touch --size 844x390 --dpr 3 --scenario tools/scenarios/dungeon.mjs --out shots/dungeon
//   CLS=mage  DEPTH=3  SEED=9
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const depth = Number(process.env.DEPTH) || 2;
  const seed = Number(process.env.SEED) || 9;
  let bad = 0;
  const flag = (what) => { bad++; console.log(`  !! ${what}`); };
  await page.evaluate(([c, s]) => { const d = window.__dbg; d.saving(false); d.run(c, s); d.autoLevel = false; d.autoWords = false; d.god = true; }, [cls, seed]);
  await page.waitForTimeout(700);
  await snap('01_town');

  // every picture of the dungeon is painted at the heroes' grain, and none is missing
  const art = await page.evaluate(() => {
    const a = window.__dbg.renderer.art;
    // (run against a page from before Version 14.1, for a picture of how it was: nothing to check)
    if (!a.ground) return null;
    const out = {};
    const one = (name, s) => { out[name] = s ? `${s.w}x${s.h}@${s.density || 1}` : 'MISSING'; };
    one('floor', a.ground.floor(3, 4));
    a.ground.wallsTall.forEach((s, i) => one(`wall${i}`, s));
    a.ground.wallsLow.forEach((s, i) => one(`low${i}`, s));
    // (Version 18.4: a wall is its faces alone, and the flat wall across a cut tile its one face; a page from before has none)
    if (a.ground.faceLeft) {
      a.ground.faceLeft.forEach((s, i) => one(`faceLeft${i}`, s));
      a.ground.faceRight.forEach((s, i) => one(`faceRight${i}`, s));
      one('flatWall', a.ground.part.far.tall);
      one('flatWallOverRaisedFloor', a.ground.part.far.mid);
    }
    // (Version 18.5: doors and gates; a page from before has none)
    if (a.gates && a.gates.lintel) {
      one('doorPost', a.gates.post);
      one('doorLeaf', a.gates.leaf(32, 16));
      one('lintel', a.gates.lintel(true)[0].s);
      one('gatePillar', a.gates.pillar(true));
      one('gateArch', a.gates.arch(false, true, false)[0].s);
      one('portcullis', a.gates.portcullis(true, true, 0)[0].s);
    }
    for (const k of ['chest', 'chestOpen', 'barrel', 'urn', 'pillar', 'portalOff', 'fallen', 'fallenSearched']) one(k, a.props[k]);
    for (const k of ['brazier', 'portal', 'bones', 'rubble', 'staves', 'shards']) a.props[k].forEach((s, i) => one(`${k}${i}`, s));
    return out;
  });
  log('art', art || 'the older art');
  for (const [k, v] of Object.entries(art || {})) if (!String(v).endsWith('@2')) flag(`${k} is not painted at the heroes' grain: ${v}`);

  await page.evaluate((dep) => { const g = window.__dbg.game(); g.depth = dep; g.cleared = dep; g.enterDungeon(); }, depth);
  await page.waitForTimeout(700);
  const kinds = await page.evaluate(() => {
    const g = window.__dbg.game(); const L = g.level; const f = L.floor;
    L.explored.fill(1);
    // (nothing to fight on a tour: the monsters are taken out of the dungeon, and put back for the last picture)
    window.__kept = g.monsters.splice(0);
    // (only a new player's first dungeon has the wordsmith who fell there: lay one near the way in)
    if (!L.props.some((p) => p.kind === 'body')) {
      const s0 = f.start;
      for (const [dx, dy] of [[2, 0], [0, 2], [-2, 0], [0, -2], [2, 2], [3, 1], [1, 3]]) {
        const tx = Math.floor(s0.x) + dx; const ty = Math.floor(s0.y) + dy;
        if (L.walk[ty * f.w + tx] !== 1 || L.props.some((p) => p.tx === tx && p.ty === ty)) continue;
        L.props.push({ kind: 'body', tx, ty, x: tx + 0.5, y: ty + 0.5, solid: false, state: 0, variant: 0 });
        break;
      }
    }
    const n = {};
    for (const p of L.props) n[p.kind] = (n[p.kind] || 0) + 1;
    return { n, rooms: f.rooms.map((r) => r.kind).join(' '), size: `${f.w}x${f.h}` };
  });
  log('dungeon', kinds);
  await snap('02_way_in');

  /** Set the hero down beside the nth thing of a kind (below it on the screen, where there is floor), looking at it. */
  const stand = (kind, nth = 0, state = null) => page.evaluate(([k, n, st]) => {
    const g = window.__dbg.game(); const L = g.level; const f = L.floor; const h = g.hero;
    const list = L.props.filter((p) => p.kind === k);
    const p = list[Math.min(n, list.length - 1)];
    if (!p) return null;
    if (st !== null) p.state = st;
    const tries = [[1.3, 1.3], [1.6, 0.4], [0.4, 1.6], [2, 2], [-1.3, 1.3], [1.3, -1.3], [-1.4, -1.4], [0, 0]];
    for (const [dx, dy] of tries) {
      const x = p.x + dx; const y = p.y + dy;
      if (L.walk[Math.floor(y) * f.w + Math.floor(x)] === 1) { h.x = x; h.y = y; h.fx = -dx || 0.7; h.fy = -dy || 0.7; break; }
    }
    return { kind: p.kind, at: [p.x, p.y], state: p.state, hero: [h.x, h.y] };
  }, [kind, nth, state]);

  const tour = [
    ['brazier', 0, null, '03_brazier'],
    ['pillar', 0, null, '04_pillar'],
    ['chest', 0, 0, '05_chest'],
    ['chest', 0, 1, '06_chest_open'],
    ['barrel', 0, 0, '07_barrel'],
    ['barrel', 0, 1, '08_barrel_broken'],
    ['urn', 0, 0, '09_urn'],
    ['urn', 0, 1, '10_urn_broken'],
    ['bones', 0, null, '11_bones'],
    ['rubble', 0, null, '12_rubble'],
    ['body', 0, 0, '13_fallen'],
    ['body', 0, 1, '14_fallen_searched'],
    ['portal', 0, 0, '15_portal_shut'],
    ['portal', 0, 1, '16_portal_open'],
  ];
  for (const [kind, nth, state, name] of tour) {
    const at = await stand(kind, nth, state);
    if (!at) { console.log(`  (no ${kind} in this dungeon)`); continue; }
    await page.waitForTimeout(450);
    await snap(name);
  }

  // a room with monsters in it, awake, so that everything is seen together
  const pack = await page.evaluate(() => {
    const g = window.__dbg.game(); const L = g.level; const f = L.floor; const h = g.hero;
    g.monsters.push(...window.__kept);
    let best = null;
    for (const m of g.monsters) if (!m.boss && !m.dead && (!best || m.elite)) best = m;
    if (!best) return null;
    for (let r = 4; r <= 7; r++) for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2; const x = best.x + Math.cos(a) * r; const y = best.y + Math.sin(a) * r;
      if (L.walk[Math.floor(y) * f.w + Math.floor(x)] === 1 && g.sees(x, y, best.x, best.y)) { h.x = x; h.y = y; return { kind: best.kind, r }; }
    }
    return null;
  });
  log('pack', pack);
  await page.waitForTimeout(900);
  await snap('17_a_fight');

  // how long a frame takes, standing in the dungeon with the whole of it revealed
  const frames = await page.evaluate(() => new Promise((done) => {
    const times = []; let last = performance.now(); let n = 0;
    const tick = () => { const now = performance.now(); times.push(now - last); last = now; if (++n < 90) requestAnimationFrame(tick); else { times.sort((a, b) => a - b); done({ median: Math.round(times[45] * 10) / 10, worst: Math.round(times[89] * 10) / 10 }); } };
    requestAnimationFrame(tick);
  }));
  log('frames (ms)', frames);
  if (frames.median > 25) flag(`a frame takes ${frames.median} ms in the dungeon`);
  if (bad) console.log(`dungeon: ${bad} thing(s) wrong`);
  else console.log('dungeon: ok');
}
