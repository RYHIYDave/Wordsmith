// THE SEVEN NEW WORDS AT WORK (render/words7.ts, behind WORDS7_LOOK, off in the game): the film for the owner. In the practice
// room, the Warrior; each word in turn, in front, behind and on a monster, at full speed, then its best moment again at twice
// the size and half speed. With no rules for them yet, the page does by hand what the rules will: it sends the looks the main
// chat's events (__dbg.words7.send) and sets what its rules keep (Monster.bleedT, Hero.heroBleedT, Monster.stolen, the zones
// 'thorns', 'reaper' and 'mirror'), a picture every thirtieth of a second of the game's own clock (a sixtieth for the half speed).
//   node tools/build_to.mjs dist/words7_looks.html
//   node tools/playtest.mjs --file dist/words7_looks.html --touch --size 844x360 --dpr 1.5 --scenario tools/scenarios/words7_film.mjs --out /dev/shm/w7f/f
//   env: ONLY=piercing,bleeding (only those words); STILLS=1 (one picture a scene, at its middle: a quick look)
// Beside the pictures, <out>_plan.json lists each piece of the film: its pictures, its caption, whether it is a close one.

const W = { piercing: 'PIERCING', bleeding: 'BLEEDING', reaping: 'REAPING', culling: 'CULLING', surging: 'SURGING', plundering: 'PLUNDERING', mirroring: 'MIRRORING' };

// Each scene: who stands where (tiles across and down the screen from the hero), what happens on which picture (30 a second),
// how many pictures, its caption; `best` the word's best moment (pictures of the scene, replayed at half speed, twice the size,
// about `focus`). NOTHING THROUGH ANYTHING: whatever he strikes stands 1.85 across from him (his swing steps him a third of a
// tile on), and every picture is checked: no monster standing in him, in his reflection, in the mirror or in a pillar, nor he
// in the mirror or a pillar (`crowd`, below).
const SCENES = [
  // PIERCING
  {
    word: 'piercing', side: 'front', frames: 44, cap: 'In front: his blow goes on through the first, a bolt of light through all behind it',
    // (as the rules make it: through the first, and on 3 tiles behind it; clear of the room's pillar)
    mobs: [['skeleton', 1.85, 0, 'a'], ['skeleton', 3.05, 0, 'b'], ['skeleton', 4.25, 0, 'c']],
    at: { 4: [['swing', 'a']], 14: [['send', { t: 'pierceLine' }, 'line', 0.35, 0, 4.85, 0]] },
    focus: [2.2, -0.4],
  },
  {
    word: 'piercing', side: 'behind', frames: 74, cap: 'Behind: half a second after, a spear of light slams down the line',
    mobs: [['skeleton', 2.0, 0.35, 'a'], ['cultist', 3.6, 0.35, 'b']],
    // (the line from a step in front of him: the spear comes down at a slant from over its start, clear of him)
    at: { 3: [['swing', 'a']], 13: [['send', { t: 'lance', width: 1, delay: 0.5 }, 'fromto', 1.5, 0.35, 4.7, 0.35]] },
    focus: [2.6, -0.6], best: [24, 54],
  },
  {
    word: 'piercing', side: 'monster', frames: 40, cap: 'On a monster: its shots come through the walls at him', wall: true,
    mobs: [],
    at: { 2: [['ghost']] },
    focus: [0.8, -1.6],
  },
  // BLEEDING
  {
    word: 'bleeding', side: 'front', frames: 72, cap: 'In front: what he strikes bleeds, more as it walks',
    mobs: [['cultist', 1.85, 0.1, 'a']],
    at: { 3: [['swing', 'a']], 13: [['send', { t: 'bleedOn' }, 'id', 'a'], ['set', 'a', 'bleedT', 3]], 22: [['walk', 'a', 3.6, 0.6]] },
    focus: [1.8, -0.2],
  },
  {
    word: 'bleeding', side: 'behind', frames: 72, cap: 'Behind: briars burst up out of the floor and cut what walks in them',
    mobs: [['skeleton', 3.8, 0.9, 'a']],
    at: { 4: [['lay', 'thorns', 2.2, 0.3, 1.35, 2.2]], 14: [['walk', 'a', 1.6, -0.1]], 40: [['set', 'a', 'bleedT', 2]] },
    focus: [2.0, -0.2], best: [2, 34],
  },
  {
    word: 'bleeding', side: 'monster', frames: 50, cap: 'On a monster: its blows make him bleed',
    mobs: [['cultist', 1.85, -0.15, 'a']],
    at: { 2: [['strike', 'a']], 8: [['send', { t: 'heroBleed' }, 'id', 'a'], ['hero', 'heroBleedT', 2]] },
    focus: [0.6, -0.4],
  },
  // REAPING
  {
    word: 'reaping', side: 'front', frames: 54, cap: 'In front: a kill\'s soul flies to him (a second off his cooldowns)',
    mobs: [['skeleton', 1.85, 0.2, 'a']],
    at: { 3: [['swing', 'a']], 13: [['kill', 'a'], ['send', { t: 'reapSoul' }, 'pos', 'a']] },
    focus: [0.6, -0.6],
  },
  {
    word: 'reaping', side: 'behind', frames: 102, cap: 'Behind: a kill rises as a spirit and fights for him (6 s in the game)',
    mobs: [['skeleton', 1.85, 0.2, 'a'], ['cultist', 4.6, 0.3, 'foe']],
    at: {
      3: [['swing', 'a']], 13: [['kill', 'a'], ['spirit', 'a', 'sp', 2.6]],
      36: [['strike', 'sp'], ['send', { t: 'spiritHit' }, 'hit', 'sp', 'foe']], 62: [['strike', 'sp'], ['send', { t: 'spiritHit' }, 'hit', 'sp', 'foe']],
      96: [['gone', 'sp']],
    },
    focus: [2.2, -0.4], best: [12, 46],
  },
  {
    word: 'reaping', side: 'monster', frames: 70, cap: 'On a monster: it rises once after it dies',
    mobs: [['skeleton', 1.85, 0.1, 'a']],
    at: { 3: [['swing', 'a']], 13: [['kill', 'a']], 32: [['send', { t: 'rise' }, 'pos', 'a']], 62: [['respawn', 'a']] },
    focus: [0.9, -0.4],
  },
  // CULLING
  {
    word: 'culling', side: 'front', frames: 48, cap: 'In front: one his hit leaves under 15% of its life dies at once',
    mobs: [['skeleton', 1.85, 0, 'a']], weak: 'a',
    at: { 3: [['swing', 'a']], 13: [['kill', 'a'], ['send', { t: 'culled' }, 'pos', 'a']] },
    focus: [1.0, -0.4], best: [10, 36],
  },
  {
    word: 'culling', side: 'behind', frames: 72, cap: 'Behind: the reaper\'s mark takes the first weak one to cross it',
    mobs: [['skeleton', 4.6, 1.1, 'a']], weak: 'a',
    at: { 2: [['lay', 'reaper', 2.5, 0.4, 1.2, 99]], 12: [['walk', 'a', 2.6, 0.45]], 42: [['take', 'a']] },
    focus: [2.2, -0.2],
  },
  {
    word: 'culling', side: 'monster', frames: 54, cap: 'On a monster: while he is low, its blows hit much harder', low: true,
    mobs: [['skeleton', 1.85, -0.2, 'a', ['culling']]],
    at: { 18: [['strike', 'a']], 24: [['send', { t: 'cullBlow' }, 'id', 'a']] },
    focus: [0.7, -0.5],
  },
  // SURGING
  {
    word: 'surging', side: 'front', frames: 42, cap: 'In front: every third use, a shockwave round him',
    mobs: [['skeleton', 2.1, 0.7, 'a'], ['cultist', -1.9, -0.6, 'b']],
    at: { 3: [['swing', 'a']], 13: [['send', { t: 'surge' }, 'none']] },
    focus: [0, -0.3], best: [11, 31],
  },
  {
    word: 'surging', side: 'behind', frames: 36, cap: 'Behind: his dodge lets out a surge',
    mobs: [['skeleton', 2.7, 0.2, 'a']],
    at: { 3: [['roll', -1.0, 0.1, 0.9, -0.05], ['send', { t: 'surge', dodge: true }, 'none']] },
    focus: [0, -0.3],
  },
  {
    word: 'surging', side: 'monster', frames: 60, cap: 'On a monster: a shockwave after its warning ring',
    mobs: [['cultist', 2.0, 0.3, 'a']],
    at: { 2: [['send', { t: 'surgeWarn', secs: 1.0, r: 2.3 }, 'id', 'a']], 32: [['strike', 'a'], ['send', { t: 'surge', r: 2.3 }, 'id', 'a']] },
    focus: [1.2, -0.2],
  },
  // PLUNDERING
  {
    word: 'plundering', side: 'front', frames: 60, cap: 'In front: kills drop more gold, and sometimes an extra piece',
    mobs: [['skeleton', 1.85, 0.2, 'a']],
    at: { 3: [['swing', 'a']], 13: [['kill', 'a'], ['send', { t: 'goldSpray', item: true }, 'pos', 'a']] },
    focus: [0.9, -0.5], best: [11, 39],
  },
  {
    word: 'plundering', side: 'behind', frames: 54, cap: 'Behind: gold bursts from a kill into his purse',
    mobs: [['skeleton', 2.2, 0.6, 'a']],
    at: { 3: [['swing', 'a']], 13: [['kill', 'a'], ['send', { t: 'goldBurst' }, 'pos', 'a']] },
    focus: [1.1, -0.6],
  },
  {
    word: 'plundering', side: 'monster', frames: 90, cap: 'On a monster: its blows steal his gold, dropped when it dies',
    mobs: [['skeleton', 1.85, -0.2, 'a']],
    at: { 2: [['strike', 'a']], 7: [['send', { t: 'goldStolen' }, 'id', 'a'], ['set', 'a', 'stolen', 12]], 44: [['swing', 'a']], 54: [['kill', 'a']] },
    focus: [0.7, -0.6],
  },
  // MIRRORING
  {
    // (he faces down the screen to the right; his reflection stands beside him, ahead of him on the screen, a long step off;
    // one in front of each)
    word: 'mirroring', side: 'front', frames: 40, cap: 'In front: his reflection beside him makes the same attack', face: [1, 0],
    mobs: [['skeleton', 1.5, 2.214, 'a'], ['skeleton', 3.393, 0.679, 'b']],
    at: { 3: [['swing', 'a']], 11: [['send', { t: 'reflection' }, 'none']] },
    focus: [1.4, 0.2],
  },
  {
    // (the mirror laid where he stands; he rolls off it, down the screen, and it rises there; he strikes the one before him,
    // and it makes his blow again at the one before it)
    // (all of it up and to the right of the room's middle, between two of its pillars, clear of them)
    word: 'mirroring', side: 'behind', frames: 80, cap: 'Behind: a mirror where he stood makes his next attack again', shift: [3.036, -3.3],
    mobs: [['skeleton', 1.071, 3.75, 'near'], ['skeleton', 1.518, 0, 'far']],
    at: { 2: [['lay', 'mirror', 0, 0, 0.6, 99]], 8: [['roll', 0, 0, -1.071, 3.75]], 28: [['swing', 'near']], 38: [['cast', 0, 0]] },
    focus: [0.2, 0.3], best: [34, 72],
  },
  {
    word: 'mirroring', side: 'monster', frames: 44, cap: 'On a monster: harm he does it flies back at him in shards',
    mobs: [['skeleton', 1.85, 0, 'a']],
    at: { 3: [['swing', 'a']], 13: [['send', { t: 'mirrorBack' }, 'id', 'a']] },
    focus: [0.6, -0.5],
  },
];

export default async function (page, snap) {
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const stills = process.env.STILLS === '1';
  const bad = (s) => console.log(`  !! ${s}`);
  await page.evaluate(() => {
    const d = window.__dbg; d.saving(false);
    d.practice('warrior', 12); d.autoLevel = false; d.autoWords = false; d.god = true;
    const g = d.game(); g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0;
    for (const side of ['front', 'behind']) for (let k = 0; k < 3; k++) g.unsocket(0, side, k);
    d.words7.switch.on = true; d.words7.clear();
    // the page's hands for the film
    window.__w7 = {
      home: [g.hero.x, g.hero.y],
      ids: {},
      at(ax, dn) { const [hx, hy] = window.__w7.base; return [hx + (ax + dn) / 2 * 1.4, hy + (dn - ax) / 2 * 1.4]; },
      mon(role) { const g = window.__dbg.game(); return g.monsters.find((m) => m.id === window.__w7.ids[role]); },
      spawn(kind, ax, dn, role, words) {
        const g = window.__dbg.game(); const h = g.hero;
        const [x, y] = window.__w7.at(ax, dn);
        const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
        g.wakeUp(m);
        m.life = m.maxLife = 1e7; m.words = words || [];
        m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.animT = 0; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
        const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
        window.__w7.ids[role] = m.id;
        return m;
      },
      step(k = 1) {
        // what walks, walks (as the rules one day will move it): 1.35 tiles a second
        const g = window.__dbg.game();
        for (const m of g.monsters) {
          if (!m.walkTo || m.dead) continue;
          const dx = m.walkTo.x - m.x; const dy = m.walkTo.y - m.y; const dd = Math.hypot(dx, dy);
          if (dd < 0.05) { m.walkTo = null; m.anim = 'idle'; continue; }
          const s = Math.min(dd, 0.045 * k); m.x += (dx / dd) * s; m.y += (dy / dd) * s; m.fx = dx / dd; m.fy = dy / dd; m.anim = 'walk'; m.animT = (m.animT || 0) + k / 30;
        }
        // (no numbers of the game's own over the looks)
        window.__dbg.fx.floaters.length = 0;
      },
      /** NOTHING THROUGH ANYTHING: who stands in him, in his reflection or in the mirror this picture (screen boxes, game pixels). */
      crowd() {
        const d = window.__dbg; const g = d.game(); const h = g.hero; const w7 = d.words7;
        const box = (x, y, hw, ht) => { const p = d.at(x, y); return [p.x - hw, p.x + hw, p.y - ht, p.y]; };
        const meet = (A, B) => A[0] < B[1] && B[0] < A[1] && A[2] < B[3] && B[2] < A[3];
        const him = box(h.x, h.y, 13, 36);
        const glass = [];
        for (const z of g.zones) if (z.look === 'mirror' && (w7.state.panes.get(z) ?? -1) >= 0) glass.push(['the mirror', box(z.x, z.y, 10, 40)]);
        if (w7.state.acts.some((a) => a.word === 'mirroring' && a.side === 'front')) { const [ox, oy] = w7.beside(); glass.push(['his reflection', box(h.x + ox, h.y + oy, 13, 36)]); }
        const stone = (g.level.props || []).filter((p) => p.solid).map((p) => box(p.x, p.y, 10, p.kind === 'pillar' ? 66 : 34));
        const out = [];
        for (const m of g.monsters) {
          if (m.dead) continue;
          // (a monster and what it holds)
          const mb = box(m.x, m.y, 11, m.kind === 'cultist' ? 33 : 30);
          if (meet(him, mb)) out.push(`${m.kind} ${m.id} in him`);
          for (const [what, b] of glass) if (meet(b, mb)) out.push(`${m.kind} ${m.id} in ${what}`);
          if (stone.some((b) => meet(b, mb))) out.push(`${m.kind} ${m.id} in a pillar`);
        }
        for (const [what, b] of glass) if (what === 'the mirror' && meet(b, him)) out.push('he is in the mirror');
        if (stone.some((b) => meet(b, him))) out.push('he is in a pillar');
        for (const [what, b] of glass) if (stone.some((q) => meet(q, b))) out.push(`${what} in a pillar`);
        return out;
      },
    };
  });
  await page.waitForTimeout(1500);
  const plan = [];
  const runes = await page.evaluate(() => Object.fromEntries(window.__dbg.words7.words.map((w) => [w, window.__dbg.words7.runePng(w)])));
  snap.note('runes', runes);
  const ramps = await page.evaluate(() => window.__dbg.words7.ramp);

  const setup = async (sc) => page.evaluate((sc) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const fx = d.fx; const W7 = window.__w7;
    d.slowmo = 1;
    g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0; g.drops.length = 0;
    for (const k of Object.keys(fx)) if (Array.isArray(fx[k])) fx[k].length = 0;
    d.words7.clear();
    W7.ids = {};
    h.move = null; h.swingT = 0; h.life = h.d.maxLife; h.heroBleedT = 0;
    W7.base = W7.home;
    let base = sc.wall ? [15.4, 9.2] : W7.home;
    if (sc.shift) base = W7.at(sc.shift[0], sc.shift[1]);
    W7.base = base;
    h.x = base[0]; h.y = base[1];
    const face = sc.face || [1, -1];
    const fl = Math.hypot(face[0], face[1]); h.fx = face[0] / fl; h.fy = face[1] / fl;
    if (sc.wall) { h.fx = 0; h.fy = -1; }
    for (const [kind, ax, dn, role, words] of sc.mobs) W7.spawn(kind, ax, dn, role, words);
    if (sc.weak) { const m = W7.mon(sc.weak); if (m) m.life = m.maxLife * 0.1; }
    // (low: kept low, so not kept alive by the playtest's god mode; nothing here strikes him for real)
    d.god = !sc.low;
    if (sc.low) h.life = Math.max(1, Math.round(h.d.maxLife * 0.2));
    return Object.keys(W7.ids).length;
  }, sc);

  const act = async (a) => page.evaluate((a) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const W7 = window.__w7; const w7 = d.words7;
    const [what, ...args] = a;
    const mon = (r) => W7.mon(r);
    if (what === 'swing' || what === 'strike') {
      const m = mon(args[0]); if (!m) return `${what}: no ${args[0]}`;
      if (what === 'swing') {
        h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
        const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
        g.useBasic(m.x, m.y);
      } else {
        // a monster's blow: its attack, as its picture plays it
        const far = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / far; m.fy = (h.y - m.y) / far;
        m.anim = 'attack'; m.animT = 0;
      }
      return 'ok';
    }
    if (what === 'send') {
      const [e, how, ...rest] = args;
      const ev = { ...e };
      if (how === 'id') ev.id = mon(rest[0])?.id;
      else if (how === 'pos') { const m = mon(rest[0]) || (W7.dead && W7.dead[rest[0]]); if (!m) return `send: no ${rest[0]}`; ev.x = m.x; ev.y = m.y; }
      else if (how === 'hit') { ev.id = mon(rest[0])?.id; ev.target = mon(rest[1])?.id; }
      else if (how === 'line') { const [x, y] = W7.at(rest[0], rest[1]); const [x1, y1] = W7.at(rest[2], rest[3]); ev.from = { x, y }; ev.to = { x: x1, y: y1 }; }
      else if (how === 'fromto') { const [x, y] = W7.at(rest[0], rest[1]); const [x1, y1] = W7.at(rest[2], rest[3]); ev.from = { x, y }; ev.to = { x: x1, y: y1 }; }
      w7.send(ev);
      return 'ok';
    }
    if (what === 'set') { const m = mon(args[0]); if (!m) return `set: no ${args[0]}`; m[args[1]] = args[2]; return 'ok'; }
    if (what === 'hero') { h[args[0]] = args[1]; return 'ok'; }
    if (what === 'walk') { const m = mon(args[0]); if (!m) return `walk: no ${args[0]}`; const [x, y] = W7.at(args[1], args[2]); m.walkTo = { x, y }; m.anim = 'walk'; return 'ok'; }
    if (what === 'lay') { const [x, y] = W7.at(args[1], args[2]); w7.lay(args[0], x, y, args[3], args[4]); return 'ok'; }
    if (what === 'kill') {
      const m = mon(args[0]); if (!m) return `kill: no ${args[0]}`;
      W7.dead = W7.dead || {}; W7.dead[args[0]] = { x: m.x, y: m.y, kind: m.kind };
      g.kill(m); return 'ok';
    }
    if (what === 'respawn') {
      const was = W7.dead && W7.dead[args[0]]; if (!was) return 'respawn: none';
      const m = g.spawn(was.kind, was.x, was.y, 1, 0, false, g.rng); g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.words = []; m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const far = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / far; m.fy = (h.y - m.y) / far;
      W7.ids[args[0]] = m.id;
      return 'ok';
    }
    if (what === 'spirit') {
      // the kill rises as a spirit: a copy of it, fighting for him (the rules' spirits; drawn here by its own picture through the look)
      const was = W7.dead && W7.dead[args[0]]; if (!was) return 'spirit: none';
      // (risen a step on from the body toward its foe, out of his own reach: he does not strike his own)
      const m = g.spawn(was.kind, was.x + 0.75, was.y - 0.75, 1, 0, false, g.rng); g.wakeUp(m);
      m.life = m.maxLife = 1e7; m.words = []; m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
      const foe = mon('foe');
      if (foe) { const far = Math.hypot(foe.x - m.x, foe.y - m.y) || 1; m.fx = (foe.x - m.x) / far; m.fy = (foe.y - m.y) / far; }
      W7.ids[args[1]] = m.id;
      w7.send({ t: 'spirit', id: m.id, x: was.x, y: was.y, secs: args[2] });
      return 'ok';
    }
    if (what === 'gone') { const m = mon(args[0]); if (m) g.monsters.splice(g.monsters.indexOf(m), 1); return 'ok'; }
    if (what === 'take') {
      // the reaper's mark takes it: it dies, and the mark is used up
      const m = mon(args[0]); if (!m) return 'take: none';
      const z = g.zones.find((q) => q.look === 'reaper');
      const mark = z ? { x: z.x, y: z.y } : true;
      if (z) g.zones.splice(g.zones.indexOf(z), 1);
      g.kill(m);
      w7.send({ t: 'culled', id: m.id, x: m.x, y: m.y, mark });
      return 'ok';
    }
    if (what === 'roll') {
      const [x0, y0] = W7.at(args[0], args[1]); const [x1, y1] = W7.at(args[2], args[3]);
      h.x = x0; h.y = y0;
      h.move = { kind: 'roll', t: 0, dur: 0.24, x0, y0, x1, y1, over: false };
      const l = Math.hypot(x1 - x0, y1 - y0) || 1; h.fx = (x1 - x0) / l; h.fy = (y1 - y0) / l;
      return 'ok';
    }
    if (what === 'cast') {
      const [x, y] = W7.at(args[0], args[1]);
      const z = g.zones.find((q) => q.look === 'mirror');
      if (z) g.zones.splice(g.zones.indexOf(z), 1);
      w7.send({ t: 'mirrorCast', x, y });
      return 'ok';
    }
    if (what === 'ghost') {
      // (no rules yet let a monster's shot through a wall: the look draws its bolt, from beyond the back wall to him)
      const x = h.x + 0.9; const y = 3.2; const L = Math.hypot(h.x - x, h.y - y); const sWall = ((6 - y) / (h.y - y)) * L;
      w7.play('piercing', 'monster', { x, y, x1: h.x, y1: h.y, r: sWall, dur: 1.2 });
      return 'ok';
    }
    return `what? ${what}`;
  }, a);

  const frameAt = async (c0, i, step) => {
    await page.evaluate(() => { window.__dbg.slowmo = 0.5; });
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i * step, { polling: 'raf', timeout: 20000 });
  };
  const where = async (focus) => page.evaluate((f) => { const [x, y] = window.__w7.at(f[0], f[1]); const p = window.__dbg.at(x, y); return { x: p.x, y: p.y, w: window.__dbg.screen.w, h: window.__dbg.screen.h }; }, focus);

  let last = '';
  for (const sc of SCENES) {
    if (only.length && !only.includes(sc.word)) continue;
    const name = `${sc.word}_${sc.side}`;
    for (const pass of sc.best && !stills ? ['full', 'best'] : ['full']) {
      const n = await setup(sc);
      if (n !== sc.mobs.length) bad(`${name}: ${n} of ${sc.mobs.length} stood`);
      await page.waitForTimeout(sc.wall ? 2500 : last === sc.word ? 500 : 800);
      last = sc.word;
      const c0 = await page.evaluate(() => window.__dbg.clock());
      const step = pass === 'best' ? 1 / 60 : 1 / 30;
      const [b0, b1] = sc.best || [0, sc.frames];
      const count = pass === 'best' ? (b1 - b0) * 2 : sc.frames;
      const piece = { word: sc.word, side: sc.side, name: `${name}_${pass}`, frames: 0, cap: sc.cap, title: W[sc.word], best: pass === 'best', ramp: ramps[sc.word], focus: null };
      let did = -1;
      const crowded = new Map();
      for (let i = 0; i < (pass === 'best' ? b1 * 2 : sc.frames); i++) {
        await frameAt(c0, i, step);
        // the scene's moments, on its own pictures (at half speed, every other picture)
        const f = pass === 'best' ? Math.floor(i / 2) : i;
        if (f !== did) {
          for (let k = did + 1; k <= f; k++) for (const a of sc.at[k] || []) { const r = await act(a); if (r !== 'ok') bad(`${name} f${k} ${a[0]}: ${r}`); }
          did = f;
        }
        await page.evaluate((k) => window.__w7.step(k), pass === 'best' ? 0.5 : 1);
        for (const c of await page.evaluate(() => window.__w7.crowd())) if (!crowded.has(c)) crowded.set(c, i);
        const keep = pass === 'best' ? i >= b0 * 2 : !stills || i === Math.floor(sc.frames / 2);
        if (!keep) continue;
        if (!piece.focus) piece.focus = await where(sc.focus);
        await snap(`${piece.name}_${String(piece.frames).padStart(3, '0')}`);
        piece.frames++;
      }
      if (piece.frames !== (stills && pass === 'full' ? 1 : count)) bad(`${piece.name}: ${piece.frames} pictures of ${count}`);
      for (const [c, i] of crowded) bad(`${piece.name}: ${c} (from picture ${i} of the pass)`);
      plan.push(piece);
      console.log(`  ${piece.name}: ${piece.frames} pictures`);
    }
  }
  snap.note('plan', plan);
  await page.evaluate(() => { window.__dbg.slowmo = 1; });
}
