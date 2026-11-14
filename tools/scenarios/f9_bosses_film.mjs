// FLOOR 9'S TWO SIDE BOSSES IN PLAY (game/act1_rules/f9_bosses.ts, art/f9_bosses_art.ts, behind F9_LAIRS), filmed for him in the game
// itself at his phone's size: the troll chieftain in his camp, the mist wolf in its glade; each of their blows made at the hero, who
// stands (made unhurtable); each walking up to him; each killed. A frame every thirtieth of the game's second; tools/f9_bosses_cut.py
// makes the film of them, each part named.
//   node tools/build_to.mjs dist/f9bosses.html
//   node tools/playtest.mjs --file dist/f9bosses.html --touch --size 852x393 --dpr 2 --scenario tools/scenarios/f9_bosses_film.mjs --out shots/f9bosses/b
//   env ONLY=smash,slam,... (the parts by name), CLS, SEED
import { log } from './lib.mjs';

const FPS = 30;
// [name, kind, act ('walk', 'kill'), how far off, to his side, seconds, the part's title]
const PARTS = [
  ['smash', 'warchief', 'warchief:smash', 3.1, 0.2, 2.7, 'THE TROLL CHIEFTAIN: CLUB SMASH'],
  ['slam', 'warchief', 'warchief:slam', 3.2, 0.2, 2.8, 'THE TROLL CHIEFTAIN: GROUND SLAM'],
  ['warcry', 'warchief', 'warchief:warcry', 2.0, 0.2, 3.5, 'THE TROLL CHIEFTAIN: WAR CRY (THE RAGE)'],
  ['rush', 'warchief', 'warchief:rush', 4.0, 0.0, 2.8, 'THE TROLL CHIEFTAIN: BULL RUSH'],
  ['chiefwalk', 'warchief', 'walk', 6.5, 1.0, 3.2, 'THE TROLL CHIEFTAIN: HIS WALK'],
  ['chiefdie', 'warchief', 'kill', 2.6, 0.4, 3.4, 'THE TROLL CHIEFTAIN FALLS: TURNED TO STONE'],
  ['bite', 'mistwolf', 'mistwolf:bite', 1.6, 0.0, 1.6, 'THE MIST WOLF: BITE'],
  ['claw', 'mistwolf', 'mistwolf:claw', 1.3, 0.2, 1.8, 'THE MIST WOLF: CLAW SWEEP'],
  ['howl', 'mistwolf', 'mistwolf:howl', 2.6, 0.3, 3.2, 'THE MIST WOLF: HOWL (ITS WOLVES COME)'],
  ['lunge', 'mistwolf', 'mistwolf:lunge', 1.8, 0.0, 1.9, 'THE MIST WOLF: LUNGE (THROUGH YOU AS MIST)'],
  ['cloud', 'mistwolf', 'mistwolf:cloud', 1.4, 0.2, 3.4, 'THE MIST WOLF: MIST CLOUD'],
  ['wolfwalk', 'mistwolf', 'walk', 6.5, 1.0, 2.6, 'THE MIST WOLF: ITS WALK'],
  ['wolfdie', 'mistwolf', 'kill', 2.0, 0.4, 2.6, 'THE MIST WOLF FALLS: GONE TO MIST'],
];

export default async function (page, snap) {
  const cls = process.env.CLS || 'brawler';
  const seed = Number(process.env.SEED || 9);
  const only = process.env.ONLY ? process.env.ONLY.split(',') : null;
  const list = PARTS.filter((p) => !only || only.includes(p[0]));
  const at = await page.evaluate(([cls, seed]) => {
    const d = window.__dbg;
    d.saving(false);
    if (d.paintDefer) d.paintDefer.on = false;
    d.f9Bosses.sw.on = true;
    d.run(cls, seed);
    d.seasoned(14);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    if (d.floorNames) d.floorNames(false);
    const g = d.game();
    g.talentsLeft = () => 0;
    g.depth = 9;
    g.cleared = 8;
    g.enterDungeon();
    g.talentsLeft = () => 0;
    return { depth: g.depth, bosses: d.f9Bosses.list() };
  }, [cls, seed]);
  log('floor', JSON.stringify(at));
  if (at.bosses.length < 2) {
    log('!! not both side bosses on floor 9');
    return;
  }
  await page.waitForFunction(() => window.__dbg.game().time > 9, null, { timeout: 180000 });
  // (every other monster gone, the floor's traps too; each boss's own spot, in its own area, with floor round it)
  const spots = await page.evaluate(() => {
    const d = window.__dbg;
    const g = d.game();
    for (const m of g.monsters) if (m.kind !== 'warchief' && m.kind !== 'mistwolf') m.dead = true;
    g.monsters.splice(0, g.monsters.length, ...g.monsters.filter((m) => !m.dead));
    g.traps.length = 0;
    if (g.level.hazards) g.level.hazards.length = 0;
    g.level.explored.fill(1);
    const out = {};
    for (const m of g.monsters) {
      m.life = m.maxLife = 1e7;
      m.words = [];
      // (the open spot nearest it with the most floor before it, toward the bottom of the screen)
      let best = null;
      let most = -1;
      for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
          const x = Math.floor(m.x) + dx + 0.5;
          const y = Math.floor(m.y) + dy + 0.5;
          if (!g.isOpen(x, y)) continue;
          let n = 0;
          for (let a = 0; a < 16; a++) for (const r of [2, 4, 6.5]) if (g.isOpen(x - 0.6 * r + Math.cos(a) * 0.35 * r, y - 0.6 * r + Math.sin(a) * 0.35 * r)) n++;
          n -= Math.hypot(dx, dy) * 0.5;
          if (n > most) {
            most = n;
            best = { x, y };
          }
        }
      }
      out[m.kind] = best;
    }
    return out;
  });
  log('spots', JSON.stringify(spots));
  const parts = [];
  let frame = 0;
  for (const [name, kind, act, dist, side, secs, title] of list) {
    const stand = spots[kind];
    const place = ([stand, kind, dist, side]) => {
      const d = window.__dbg;
      const g = d.game();
      const h = g.hero;
      h.x = stand.x;
      h.y = stand.y;
      h.fx = -0.6;
      h.fy = -0.8;
      g.perils.length = 0;
      // (the wolves its howl called, gone)
      for (const m of g.monsters) if (m.kind === 'wolf') m.dead = true;
      // (the other one sent far off, still)
      const other = kind === 'warchief' ? 'mistwolf' : 'warchief';
      const o = g.monsters.find((m) => m.kind === other && !m.dead);
      if (o) {
        o.x = 2.5;
        o.y = 2.5;
        o.cd = 999;
        o.state = 'sleep';
      }
      d.f9Bosses.at(kind, dist, side);
      d.f9Bosses.hold(kind, 999);
      // (the rage of a war cry before, gone)
      const m = g.monsters.find((q) => q.kind === kind && !q.dead);
      if (m && m.a1) m.a1.rage = 0;
    };
    await page.evaluate(place, [stand, kind, dist, side]);
    await page.waitForTimeout(700);
    await page.evaluate(place, [stand, kind, dist, side]);
    await page.evaluate(([kind, act]) => {
      const d = window.__dbg;
      if (act === 'kill') d.f9Bosses.kill(kind);
      else if (act === 'walk') d.f9Bosses.hold(kind, 0);
      else d.f9Bosses.act(kind, act, 999);
    }, [kind, act]);
    parts.push([frame, title]);
    log('part', name, frame);
    const c0 = await page.evaluate(() => window.__dbg.clock());
    const n = Math.round(secs * FPS);
    for (let i = 0; i < n; i++) {
      await page.evaluate(() => { window.__dbg.slowmo = 0.05; });
      await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i / FPS, { polling: 'raf', timeout: 120000 });
      // (walking: he is kept from making a move at the hero; it only comes on)
      if (act === 'walk') await page.evaluate((k) => { const m = window.__dbg.game().monsters.find((q) => q.kind === k && !q.dead); if (m) { m.cd = 0.5; m.moveCd = (m.moveCd || []).map(() => 99); } }, kind);
      await snap(`f${String(frame).padStart(4, '0')}`);
      frame++;
    }
    log('after', JSON.stringify(await page.evaluate(() => window.__dbg.f9Bosses.list())));
  }
  snap.note('film', { fps: FPS, parts });
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
