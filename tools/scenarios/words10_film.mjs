// HIS THREE NEW WORDS AT WORK (render/words10.ts, behind WORDS10_LOOK, off in the game): the film for the owner. In the practice
// room as the player sees it, the Warrior (and the Mage for her orb); each word in turn, on two or three of his abilities and on a
// monster, at full speed, then its best moment again at twice the size and half speed. The rules are the main chat's (this branch:
// game/defs.ts LASTING, FLEETING, VAST): each scene sets the words in the hero's own abilities (`socket`), and the rules do the rest
// (his orb, his spin, his swing, burning ground laid, a shield given, his poison, a monster's blow, a monster's warning), the looks
// called up by what they send and keep. Where a scene skips ahead in a thing's own time (to show how a long one ends), its caption
// says so. A picture every thirtieth of a second of the game's own clock (a sixtieth for the half speed).
//   node tools/build_to.mjs dist/words10_looks.html
//   node tools/playtest.mjs --file dist/words10_looks.html --touch --size 844x360 --dpr 1.5 --scenario tools/scenarios/words10_film.mjs --out /dev/shm/w10f/f
//   python3 tools/words10_film.py /dev/shm/w10f/f docs/mockups/words10/pictures/words3_film.mp4
//   (or a word at a time, ONLY=lasting --out /dev/shm/w10f/lasting/f, and so on; then the three prefixes, comma between, in order)
//   env: ONLY=lasting,vast (only those words); STILLS=1 (one picture a piece, at its middle: a quick look)
// Beside the pictures, <out>_plan.json lists each piece of the film: its pictures, its caption, whether it is a close one.
// NOTHING THROUGH ANYTHING: every picture is checked (`crowd`): no monster standing in him, in another or in a pillar; he not in a
// pillar.

const W = { lasting: 'LASTING', fleeting: 'FLEETING', vast: 'VAST' };

// Each scene: the hero's class; the words set in his abilities ([ability, side, word]); who stands where (tiles across and down
// the screen from him); what happens on which picture (30 a second); how many pictures; from which picture it is kept (`from`:
// the pictures before it run, unseen); its caption; `best`: the word's best moment (pictures of the scene, kept again at half
// speed, twice the size, about `focus`).
const SCENES = [
  // LASTING
  {
    word: 'lasting', key: 'orb', cls: 'mage', frames: 30, from: 4, words: [[1, 'front', 'lasting']],
    cap: 'On her orb: sand-light crawls over it, a ring of its sand turning round it',
    mobs: [['skeleton', 4.0, 0.4, 'a']],
    at: { 2: [['use', 1, 2.2, 0.1]] },
    focus: [1.6, -0.5],
  },
  {
    word: 'lasting', key: 'orb_end', cls: 'mage', frames: 136, from: 22, words: [[1, 'front', 'lasting']],
    cap: 'The same orb 4.6 s on: past its own 5 s it lasts half again, its sand pouring out into a heap',
    mobs: [['skeleton', 4.0, 0.4, 'a']],
    at: { 2: [['use', 1, 2.2, 0.1]], 20: [['skip', 'orb', 4.6]] },
    focus: [1.6, -0.5],
  },
  {
    word: 'lasting', key: 'whirl', cls: 'warrior', frames: 135, from: 45, words: [[1, 'front', 'lasting']],
    cap: 'His whirlwind: each blade trails sand that sifts down; in its half again, sand settles round its edge',
    mobs: [['skeleton', 3.4, 0.9, 'a']],
    at: { 2: [['spin', 1, 3.8]] },
    focus: [0, -0.4], best: [80, 112],
  },
  {
    word: 'lasting', key: 'ground', cls: 'warrior', frames: 96, from: 5, words: [[1, 'behind', 'fire'], [1, 'front', 'lasting']],
    cap: 'Burning ground, 3.8 s on: in the half again it lasts, dunes of sand drift in and bury it as it ends',
    mobs: [['cultist', 4.4, 0.6, 'a']],
    at: { 2: [['ground', 1, 2.4, 0.2, 1.3]], 3: [['skip', 'zone', 3.8]] },
    focus: [1.8, -0.3],
  },
  {
    word: 'lasting', key: 'boost', cls: 'warrior', frames: 84, from: 3, words: [[1, 'front', 'guarding'], [1, 'front', 'lasting']], shift: [-2.4, 0.2],
    cap: "A boost it gives (here Guarding's shield): a ribbon of sand-light behind him, fraying to grains as it ends",
    mobs: [],
    at: { 2: [['boon', 1]], 6: [['walk', 4.6, -0.2, 1.05]], 52: [['skip', 'shield', 0.5]] },
    focus: [0.4, -0.4],
  },
  {
    word: 'lasting', key: 'poison', cls: 'warrior', frames: 84, from: 2, words: [[0, 'front', 'poison'], [0, 'front', 'lasting']],
    cap: 'His poison on a monster, as hard for longer: its sand pours into a heap at its feet (skipped to its end)',
    mobs: [['skeleton', 1.85, 0, 'a']],
    at: { 3: [['swing', 'a']], 52: [['skip', 'poison', 'a', 0.45]] },
    focus: [1.0, -0.4],
  },
  {
    word: 'lasting', key: 'monster', cls: 'warrior', frames: 84, from: 2, words: [],
    cap: 'On a monster: its poison on him lingers: the same sand, in its pink and gold (skipped to its end)',
    mobs: [['cultist', 1.85, -0.1, 'a', ['lasting', 'poison']]],
    at: { 2: [['strike', 'a']], 8: [['hurt', 'a']], 52: [['skip', 'sick', 0.45]] },
    focus: [0.8, -0.4],
  },
  // FLEETING
  {
    word: 'fleeting', key: 'orb', cls: 'mage', frames: 116, from: 20, words: [[1, 'front', 'fleeting']],
    cap: 'On her orb, a third shorter: after-images stutter, streaks whip round it, and it pulses a third sooner',
    mobs: [['skeleton', 4.0, 0.4, 'a']],
    at: { 2: [['use', 1, 2.2, 0.1]] },
    focus: [1.6, -0.5],
  },
  {
    word: 'fleeting', key: 'whirl', cls: 'warrior', frames: 66, from: 2, words: [[1, 'front', 'fleeting']],
    cap: "His whirlwind, a third shorter: a stutter of him in lilac, each blade's edge traced twice",
    mobs: [['skeleton', 3.4, 0.9, 'a']],
    at: { 2: [['spin', 1, 1.7]] },
    focus: [0, -0.4], best: [12, 40],
  },
  {
    word: 'fleeting', key: 'ground', cls: 'warrior', frames: 60, from: 4, words: [[1, 'behind', 'fire'], [1, 'front', 'fleeting']],
    cap: 'Burning ground, a third shorter (from 1.2 s): thin tongues lick up quick, and burn out',
    mobs: [['cultist', 4.4, 0.6, 'a']],
    at: { 2: [['ground', 1, 2.4, 0.2, 1.3]], 3: [['skip', 'zone', 1.2]] },
    focus: [1.8, -0.3],
  },
  {
    word: 'fleeting', key: 'boost', cls: 'warrior', frames: 72, from: 3, words: [[1, 'front', 'guarding'], [1, 'front', 'fleeting']], shift: [-2.4, 0.2],
    cap: 'A boost it gives, a third shorter and a third stronger: lilac after-images a step behind him',
    mobs: [],
    at: { 2: [['boon', 1]], 6: [['walk', 4.6, -0.2, 1.05]], 46: [['skip', 'shield', 0.4]] },
    focus: [0.4, -0.4],
  },
  {
    word: 'fleeting', key: 'poison', cls: 'warrior', frames: 56, from: 2, words: [[0, 'front', 'poison'], [0, 'front', 'fleeting']],
    cap: 'His poison on a monster, the same in less time: little stars pop on it one after another',
    mobs: [['skeleton', 1.85, 0, 'a']],
    at: { 3: [['swing', 'a']] },
    focus: [1.0, -0.4],
  },
  {
    word: 'fleeting', key: 'monster', cls: 'warrior', frames: 56, from: 2, words: [],
    cap: 'On a monster: its poison on him ticks fast, in its pink and gold',
    mobs: [['cultist', 1.85, -0.1, 'a', ['fleeting', 'poison']]],
    at: { 2: [['strike', 'a']], 8: [['hurt', 'a']] },
    focus: [0.8, -0.4],
  },
  // VAST
  {
    word: 'vast', key: 'orb', cls: 'mage', frames: 56, from: 2, words: [[1, 'front', 'vast']],
    cap: 'In front, on her orb: its waves reach wider: the floor cracks at the old edge, dust rolls out past it',
    mobs: [['skeleton', 4.8, 0.5, 'a']],
    at: { 2: [['use', 1, 2.4, 0.1]] },
    focus: [1.8, -0.4],
  },
  {
    word: 'vast', key: 'whirl', cls: 'warrior', frames: 56, from: 2, words: [[1, 'front', 'vast']],
    cap: 'In front, on his whirlwind: its reach wider, a bank of dust shoved out to the new edge',
    mobs: [['skeleton', 3.6, 0.9, 'a']],
    at: { 2: [['spin', 1, 1.25]] },
    focus: [0.4, -0.3],
  },
  {
    word: 'vast', key: 'ground', cls: 'warrior', frames: 32, from: 2, words: [[1, 'behind', 'fire'], [1, 'front', 'vast']],
    cap: 'In front, on burning ground: laid wider, its dust rolled out from the old edge to the new',
    mobs: [['cultist', 4.6, 0.6, 'a']],
    at: { 2: [['ground', 1, 2.4, 0.2, 1.82]] },
    focus: [1.8, -0.3],
  },
  {
    word: 'vast', key: 'strike', cls: 'warrior', frames: 40, from: 2, words: [[0, 'behind', 'vast']],
    cap: 'Behind, on his Strike: a quarter of each hit splashes on: a ring of earth, a rock thrown to each one near',
    mobs: [['skeleton', 1.85, 0, 'a'], ['skeleton', 3.0, -1.15, 'b'], ['skeleton', 3.0, 1.15, 'c']],
    at: { 3: [['swing', 'a']] },
    focus: [2.2, -0.5], best: [5, 33],
  },
  {
    word: 'vast', key: 'monster', cls: 'warrior', frames: 46, from: 2, words: [],
    cap: 'On a monster: its warned blows reach wider: its old reach broken, pink dust shoved out to the new',
    mobs: [['skeleton', 2.0, 0.1, 'a', ['vast']]],
    at: { 2: [['warn', 'a', 1.25, 1.1]], 30: [['strike', 'a']] },
    focus: [1.0, -0.3],
  },
];

export default async function (page, snap) {
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const stills = process.env.STILLS === '1';
  const bad = (s) => console.log(`  !! ${s}`);
  let cls = '';
  const toClass = async (c) => {
    if (c === cls) return;
    await page.evaluate((c) => {
      const d = window.__dbg; d.slowmo = 1; d.saving(false);
      d.practice(c, 12); d.autoLevel = false; d.autoWords = false; d.god = true;
      d.words10.switch.on = true; d.words10.clear();
    }, c);
    cls = c;
    await page.waitForTimeout(1600);
  };
  await toClass('warrior');
  await page.evaluate(() => {
    // the page's hands for the film
    window.__w10 = {
      ids: {},
      ctl: { hold: null, move: null },
      at(ax, dn) { const [hx, hy] = window.__w10.base; return [hx + (ax + dn) / 2 * 1.4, hy + (dn - ax) / 2 * 1.4]; },
      mon(role) { const g = window.__dbg.game(); return g.monsters.find((m) => m.id === window.__w10.ids[role]); },
      spawn(kind, ax, dn, role, words) {
        const g = window.__dbg.game(); const h = g.hero;
        const [x, y] = window.__w10.at(ax, dn);
        const m = g.spawn(kind, x, y, 1, 0, false, g.rng);
        g.wakeUp(m);
        m.life = m.maxLife = 1e7; m.words = words || [];
        m.state = 'recover'; m.t = 1e9; m.anim = 'idle'; m.animT = 0; m.cd = 1e9; m.moveCd = 1e9; m.heldSpeed = m.speed; m.speed = 0;
        const far = Math.hypot(h.x - x, h.y - y) || 1; m.fx = (h.x - x) / far; m.fy = (h.y - y) / far;
        window.__w10.ids[role] = m.id;
        return m;
      },
      /** The rules' own update, with his hands on it: the spin held, a walk. */
      wrap() {
        const g = window.__dbg.game();
        if (g.__w10wrap) return;
        const run = g.update.bind(g);
        g.update = (dt, c) => {
          const C = window.__w10.ctl;
          if (C.hold && C.hold.left > 0) { C.hold.left -= dt; c.hold = true; c.castX = C.hold.x; c.castY = C.hold.y; }
          if (C.move && C.move.left > 0) { C.move.left -= dt; c.mx = C.move.mx; c.my = C.move.my; }
          return run(dt, c);
        };
        g.__w10wrap = true;
      },
      step() {
        // (no numbers or words of the game's own over the looks)
        window.__dbg.fx.floaters.length = 0;
        window.__dbg.fx.messages.length = 0;
        // (what stands, stands: the monsters here are held where they were put, his blows not knocking them about)
        const g = window.__dbg.game();
        for (const m of g.monsters) if (m.__at) { m.x = m.__at[0]; m.y = m.__at[1]; }
      },
      /** NOTHING THROUGH ANYTHING: who stands in him, in another or in a pillar this picture (screen boxes, game pixels). */
      crowd() {
        const d = window.__dbg; const g = d.game(); const h = g.hero;
        const box = (x, y, hw, ht) => { const p = d.at(x, y); return [p.x - hw, p.x + hw, p.y - ht, p.y]; };
        const meet = (A, B) => A[0] < B[1] && B[0] < A[1] && A[2] < B[3] && B[2] < A[3];
        const him = box(h.x, h.y, 11, 34);
        const stone = (g.level.props || []).filter((p) => p.solid).map((p) => box(p.x, p.y, 10, p.kind === 'pillar' ? 66 : 34));
        const out = [];
        const ms = g.monsters.filter((m) => !m.dead);
        ms.forEach((m, i) => {
          const mb = box(m.x, m.y, 9, m.kind === 'cultist' ? 31 : 28);
          if (meet(him, mb)) out.push(`${m.kind} ${m.id} in him`);
          // (one in another: their feet within a body's width, one before the other)
          for (const o of ms.slice(i + 1)) {
            const a = d.at(m.x, m.y); const b = d.at(o.x, o.y);
            if (Math.abs(a.x - b.x) < 14 && Math.abs(a.y - b.y) < 8) out.push(`${m.kind} ${m.id} in ${o.kind} ${o.id}`);
          }
          if (stone.some((b) => meet(b, mb))) out.push(`${m.kind} ${m.id} in a pillar`);
        });
        if (stone.some((b) => meet(b, him))) out.push('he is in a pillar');
        return out;
      },
    };
  });
  const plan = [];
  const runes = await page.evaluate(() => Object.fromEntries(window.__dbg.words10.words.map((w) => [w, window.__dbg.words10.runePng(w)])));
  snap.note('runes', runes);
  const ramps = await page.evaluate(() => window.__dbg.words10.ramp);

  const setup = async (sc) => {
    await toClass(sc.cls);
    return page.evaluate((sc) => {
      const d = window.__dbg; const g = d.game(); const h = g.hero; const fx = d.fx; const W10 = window.__w10; const w10 = d.words10;
      d.slowmo = 1; d.god = true;
      W10.wrap();
      W10.ctl.hold = null; W10.ctl.move = null;
      if (h.channel) g.endChannel(true);
      g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0; g.zones.length = 0; g.drops.length = 0; g.orbs.length = 0;
      if (g.familiars) g.familiars.length = 0;
      for (const k of Object.keys(fx)) if (Array.isArray(fx[k])) fx[k].length = 0;
      for (const k of Object.keys(fx.wild || {})) if (Array.isArray(fx.wild[k])) fx.wild[k].length = 0;
      h.move = null; h.swingT = 0; h.life = h.d.maxLife; h.channel = null; h.windup = null;
      h.poisonT = 0; h.burnT = 0; h.chillT = 0; h.shieldT = 0; h.shield = 0; h.mightT = 0; h.hasteT = 0; h.frenzyT = 0;
      for (let i = 0; i < 3; i++) for (const side of ['front', 'behind']) for (let k = 0; k < 3; k++) g.unsocket(i, side, k);
      const put = [];
      for (const [i, side, w] of sc.words) { h.words[w] = (h.words[w] || 0) + 1; put.push(`${w}:${g.socket(i, side, w) ?? 'ok'}`); }
      g.refresh();
      W10.ids = {};
      W10.base = [15, 15];
      if (sc.shift) W10.base = W10.at(sc.shift[0], sc.shift[1]);
      h.x = W10.base[0]; h.y = W10.base[1];
      h.fx = 0.7071; h.fy = -0.7071;
      for (const [kind, ax, dn, role, words] of sc.mobs) { const m = W10.spawn(kind, ax, dn, role, words); m.__at = [m.x, m.y]; }
      // (the rings the game throws up as a word is set in an ability, and what it says, gone before the scene: the film is of the looks)
      g.events.length = 0;
      for (const k of Object.keys(fx)) if (Array.isArray(fx[k])) fx[k].length = 0;
      for (const k of Object.keys(fx.wild || {})) if (Array.isArray(fx.wild[k])) fx.wild[k].length = 0;
      w10.clear(); w10.trail(null);
      for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; }
      h.mana = h.d.maxMana;
      const r = h.skills.map((s) => s && { id: s.id, last: +s.r.last.toFixed(3), pace: +s.r.pace.toFixed(3), vast: s.r.vast, size: +s.r.size.toFixed(3), front: s.front.join(','), behind: s.behind.join(',') });
      return { n: Object.keys(W10.ids).length, put, r };
    }, sc);
  };

  const act = async (a) => page.evaluate((a) => {
    const d = window.__dbg; const g = d.game(); const h = g.hero; const W10 = window.__w10;
    const [what, ...args] = a;
    const mon = (r) => W10.mon(r);
    const ready = () => { h.mana = h.d.maxMana; h.swingT = 0; for (const s of h.skills) if (s) { s.cd = 0; s.charges = s.maxCharges; } };
    if (what === 'use') {
      // an ability used at a place, as his finger would: by the rules
      ready();
      const [x, y] = W10.at(args[1], args[2]);
      const far = Math.hypot(x - h.x, y - h.y) || 1; h.fx = (x - h.x) / far; h.fy = (y - h.y) / far;
      g.useSkill(args[0], x, y);
      return 'ok';
    }
    if (what === 'spin') {
      // his whirlwind, held for `secs`
      ready();
      W10.ctl.hold = { left: args[1], x: h.x + 1, y: h.y };
      g.useSkill(args[0], h.x + 1, h.y);
      return h.channel || h.windup ? 'ok' : 'spin: it did not begin';
    }
    if (what === 'swing') {
      const m = mon(args[0]); if (!m) return `swing: no ${args[0]}`;
      ready();
      const far = Math.hypot(m.x - h.x, m.y - h.y) || 1; h.fx = (m.x - h.x) / far; h.fy = (m.y - h.y) / far;
      g.useBasic(m.x, m.y);
      return 'ok';
    }
    if (what === 'strike') {
      // a monster's blow: its attack, as its picture plays it
      const m = mon(args[0]); if (!m) return `strike: no ${args[0]}`;
      const far = Math.hypot(h.x - m.x, h.y - m.y) || 1; m.fx = (h.x - m.x) / far; m.fy = (h.y - m.y) / far;
      m.anim = 'attack'; m.animT = 0;
      return 'ok';
    }
    if (what === 'hurt') {
      // its blow lands on him, by the rules (its words: its poison, lingering or quick)
      const m = mon(args[0]); if (!m) return `hurt: no ${args[0]}`;
      g.hurtHero(4, 'phys', m.words, m);
      return h.poisonT > 0 ? 'ok' : 'hurt: no poison on him';
    }
    if (what === 'ground') {
      // burning ground laid, as the rules lay it (`addGround`: its time Lasting's or Fleeting's, its event sent)
      const [x, y] = W10.at(args[1], args[2]);
      g.addGround(args[0], x, y, args[3], 1);
      return g.zones.length ? 'ok' : 'ground: none laid';
    }
    if (what === 'boon') {
      // what a use of the ability gives him, by the rules (`boons`: Guarding's shield, its time Lasting's or Fleeting's)
      g.boons(args[0]);
      return h.shieldT > 0 ? 'ok' : 'boon: no shield';
    }
    if (what === 'walk') {
      // he walks toward a place for `secs`, by the rules' own walking (his controls)
      const [x, y] = W10.at(args[0], args[1]);
      const far = Math.hypot(x - h.x, y - h.y) || 1;
      W10.ctl.move = { left: args[2], mx: (x - h.x) / far, my: (y - h.y) / far };
      return 'ok';
    }
    if (what === 'warn') {
      // a monster winds up a warned blow, by the rules (`addWarn`: Vast on it makes it wider)
      const m = mon(args[0]); if (!m) return 'warn: none';
      const x = m.x + (h.x - m.x) * 0.45; const y = m.y + (h.y - m.y) * 0.45;
      g.addWarn(x, y, args[1], args[2], 5, 'phys', m.words, m.name, m.id);
      m.anim = 'attack'; m.animT = 0.05;
      return 'ok';
    }
    if (what === 'skip') {
      // on in a thing's own time (the caption says so)
      const [thing, ...rest] = args;
      if (thing === 'orb') { for (const o of g.orbs) o.t = rest[0]; return g.orbs.length ? 'ok' : 'skip: no orb'; }
      if (thing === 'zone') { for (const z of g.zones) if (!z.hostile) z.t = rest[0]; return 'ok'; }
      if (thing === 'shield') { h.shieldT = Math.min(h.shieldT, rest[0]); return 'ok'; }
      if (thing === 'poison') { const m = mon(rest[0]); if (!m) return 'skip: none'; m.poisonT = Math.min(m.poisonT, rest[1]); return 'ok'; }
      if (thing === 'sick') { h.poisonT = Math.min(h.poisonT, rest[0]); return 'ok'; }
      return `skip what? ${thing}`;
    }
    return `what? ${what}`;
  }, a);

  const frameAt = async (c0, i, step) => {
    await page.evaluate(() => { window.__dbg.slowmo = 0.5; });
    await page.waitForFunction((at) => { const d = window.__dbg; if (d.clock() < at) return false; d.slowmo = 1e-6; return true; }, c0 + i * step, { polling: 'raf', timeout: 20000 });
  };
  const where = async (focus) => page.evaluate((f) => { const [x, y] = window.__w10.at(f[0], f[1]); const p = window.__dbg.at(x, y); return { x: p.x, y: p.y, w: window.__dbg.screen.w, h: window.__dbg.screen.h }; }, focus);

  for (const sc of SCENES) {
    if (only.length && !only.includes(sc.word)) continue;
    const name = `${sc.word}_${sc.key}`;
    for (const pass of sc.best && !stills ? ['full', 'best'] : ['full']) {
      const res = await setup(sc);
      if (res.n !== sc.mobs.length) bad(`${name}: ${res.n} of ${sc.mobs.length} stood`);
      if (res.put.some((p) => !p.endsWith(':ok'))) bad(`${name}: socketing ${res.put.join(' ')}`);
      if (pass === 'full') console.log(`  ${name}: ${JSON.stringify(res.r.filter(Boolean).map((s) => [s.id, s.last, s.pace, s.size, s.vast, s.front, s.behind]))}`);
      await page.waitForTimeout(500);
      const c0 = await page.evaluate(() => window.__dbg.clock());
      const step = pass === 'best' ? 1 / 60 : 1 / 30;
      const [b0, b1] = sc.best || [0, sc.frames];
      const keepFrom = pass === 'best' ? b0 : sc.from;
      const count = pass === 'best' ? (b1 - b0) * 2 : sc.frames - sc.from;
      const piece = { word: sc.word, key: sc.key, name: `${name}_${pass}`, frames: 0, cap: sc.cap, title: W[sc.word], best: pass === 'best', ramp: ramps[sc.word], focus: null };
      let did = -1;
      const crowded = new Map();
      const last = pass === 'best' ? b1 * 2 : sc.frames;
      for (let i = 0; i < last; i++) {
        await frameAt(c0, i, step);
        // the scene's moments, on its own pictures (at half speed, every other picture)
        const f = pass === 'best' ? Math.floor(i / 2) : i;
        if (f !== did) {
          for (let k = did + 1; k <= f; k++) for (const a of sc.at[k] || []) { const r = await act(a); if (r !== 'ok') bad(`${name} f${k} ${a[0]}: ${r}`); }
          did = f;
        }
        await page.evaluate(() => window.__w10.step());
        const keep = pass === 'best' ? i >= b0 * 2 : i >= sc.from && (!stills || i === Math.floor((sc.from + sc.frames) / 2));
        if (!keep) continue;
        for (const c of await page.evaluate(() => window.__w10.crowd())) if (!crowded.has(c)) crowded.set(c, i);
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
  await page.evaluate(() => { window.__dbg.slowmo = 1; window.__w10.ctl.hold = null; window.__w10.ctl.move = null; });
}
