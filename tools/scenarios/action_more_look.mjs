// THE NEW ENEMY MOVES OF FLOORS 6 AND ON in the game (each switch on in the page built for it): each monster on its own floor, set by
// the hero where it sees him, only that move ready, the game stepped on until it begins it and then to each moment of it, pictured
// (as tools/scenarios/fm_action_look.mjs). WHO=<list of case names> for some; all by default.
//   node tools/playtest.mjs --file dist/action_more.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/action_more_look.mjs --out shots/more
const CASES = [
  { name: 'firepot', depth: 6, kind: 'firepot', n: 1, ready: 0, d: 5, snaps: [[0.7, 'held'], [0.45, 'flying_marked'], [0.4, 'whoosh'], [1.2, 'burning']] },
  { name: 'chanter', depth: 6, kind: 'chanter', n: 1, ready: 0, d: 4.5, snaps: [[0.6, 'ring'], [0.38, 'strike'], [0.3, 'static']] },
  { name: 'qgolem_hammer', depth: 6, kind: 'qgolem', n: 2, ready: 0, d: 1.6, snaps: [[0.7, 'held_marked'], [0.3, 'quake']] },
  { name: 'qgolem_boulder', depth: 6, kind: 'qgolem', n: 2, ready: 1, d: 5, snaps: [[1.2, 'held_lane'], [0.55, 'rolling'], [0.5, 'smash']] },
  { name: 'scorpion', depth: 8, kind: 'scorpion', n: 2, ready: 1, d: 3.5, snaps: [[0.7, 'cocked'], [0.45, 'glob_marked'], [0.4, 'splash'], [1.0, 'pool']] },
  { name: 'devil', depth: 8, kind: 'devil', n: 1, ready: 0, d: 2.0, snaps: [[0.7, 'spun'], [0.6, 'twister'], [0.9, 'bolts'], [1.0, 'dragging']] },
  { name: 'queen_rake', depth: 7, kind: 'queen', boss: true, n: 6, ready: 0, d: 2.2, snaps: [[0.8, 'hung_marked'], [0.3, 'raked']] },
  { name: 'queen_gust', depth: 7, kind: 'queen', boss: true, n: 6, ready: 1, d: 3.0, snaps: [[0.8, 'reared_marked'], [0.4, 'blast']] },
  { name: 'queen_dive', depth: 7, kind: 'queen', boss: true, n: 6, ready: 2, d: 4.0, snaps: [[1.2, 'up_marked'], [0.45, 'burst'], [0.7, 'dust']] },
  { name: 'queen_eclipse', depth: 7, kind: 'queen', boss: true, n: 6, ready: 4, d: 3.0, snaps: [[1.2, 'screaming'], [1.0, 'dark_pools'], [1.5, 'dive_marked'], [0.8, 'dark_later']] },
  // (floors 9 and 10)
  { name: 'deer', depth: 9, kind: 'deer', n: 2, ready: 1, d: 5, snaps: [[0.7, 'lane'], [0.32, 'gallop'], [0.45, 'hedge_up'], [1.6, 'hedge_standing'], [2.6, 'hedge_withering']] },
  { name: 'wolves', depth: 9, kind: 'wolf', n: 1, ready: 0, d: 2.6, pack: 4, snaps: [[0.45, 'crouched'], [0.2, 'leapt'], [0.35, 'second'], [0.5, 'round']] },
  { name: 'drowned_retch', depth: 10, kind: 'drowned', up: true, n: 3, ready: 1, d: 2.2, snaps: [[0.55, 'marked'], [0.4, 'gush'], [0.6, 'slick'], [2.0, 'slick_later']] },
  { name: 'drowned_grab', depth: 10, kind: 'drowned', up: true, n: 3, ready: 0, d: 1.15, snaps: [[0.72, 'clutched'], [0.25, 'frozen'], [0.6, 'shattered']] },
  { name: 'stag_close', depth: 9, kind: 'stag', boss: true, life: 0.74, n: 5, ready: 99, d: 3.0, snaps: [[0.9, 'bellow_marked'], [0.62, 'wall_bursting'], [1.5, 'wall_standing']] },
  { name: 'stag_gore', depth: 9, kind: 'stag', boss: true, n: 5, ready: 0, d: 2.0, snaps: [[0.7, 'held_marked'], [0.25, 'swept']] },
  { name: 'stag_charge', depth: 9, kind: 'stag', boss: true, n: 5, ready: 2, d: 5.5, snaps: [[0.7, 'lane'], [0.45, 'running'], [0.5, 'crash']] },
  // (floors 11 to 15: the city's own)
  { name: 'watch_chop', depth: 11, kind: 'watch', n: 2, ready: 0, d: 2.0, snaps: [[0.6, 'held_marked'], [0.3, 'chopped'], [0.5, 'split']] },
  { name: 'watch_lantern', depth: 11, kind: 'watch', n: 2, ready: 1, d: 5, snaps: [[0.8, 'thrown'], [0.6, 'smash'], [1.5, 'burning']] },
  { name: 'crier_toll', depth: 11, kind: 'crier', boss: true, n: 4, ready: 0, d: 3, snaps: [[0.9, 'marked'], [0.3, 'first_toll'], [1.3, 'tolls']] },
  { name: 'crier_shout', depth: 11, kind: 'crier', boss: true, n: 4, ready: 1, d: 4, snaps: [[1.2, 'breath_walls'], [0.6, 'wave'], [0.5, 'echoes']] },
  { name: 'crier_proclaim', depth: 11, kind: 'crier', boss: true, n: 4, ready: 2, d: 5, snaps: [[1.2, 'lane'], [0.4, 'unrolling'], [1.2, 'burning']] },
  { name: 'crier_crowd', depth: 11, kind: 'crier', boss: true, n: 4, ready: 3, d: 4, snaps: [[1.4, 'pools'], [0.8, 'rising']] },
  { name: 'rk_bite', depth: 12, kind: 'ratking', boss: true, n: 4, ready: 0, d: 2.4, snaps: [[0.8, 'held_marked'], [0.25, 'bite']] },
  { name: 'rk_words', depth: 12, kind: 'ratking', boss: true, n: 4, ready: 1, d: 5, snaps: [[1.2, 'aimed'], [0.4, 'flying'], [0.3, 'burst']] },
  { name: 'rk_roll', depth: 12, kind: 'ratking', boss: true, n: 4, ready: 2, d: 6, snaps: [[1.2, 'lane'], [0.5, 'rolling'], [0.8, 'burst']] },
  { name: 'rk_unknot', depth: 12, kind: 'ratking', boss: true, n: 4, ready: 3, d: 3, snaps: [[0.9, 'swelling'], [0.5, 'scattered'], [0.8, 'swarm']] },
  { name: 'rk_sluice', depth: 12, kind: 'ratking', boss: true, n: 4, ready: 99, noact: true, fight: 8.7, d: 4, snaps: [[0.6, 'gates_marked'], [1.6, 'burst'], [0.8, 'flood']] },
  { name: 'fieldhand', depth: 13, kind: 'fieldhand', n: 1, ready: 0, d: 4, snaps: [[0.6, 'drawn_marked'], [0.5, 'flying_out'], [0.8, 'coming_back']] },
  { name: 'orderly', depth: 14, kind: 'orderly', n: 2, ready: 1, d: 5, snaps: [[0.6, 'lane'], [0.5, 'careering'], [0.6, 'crashed']] },
  { name: 'ph_rap', depth: 14, kind: 'physician', boss: true, n: 5, ready: 0, d: 2.5, snaps: [[0.75, 'held_marked'], [0.22, 'cracked']] },
  { name: 'ph_draw', depth: 14, kind: 'physician', boss: true, n: 5, ready: 1, d: 3, snaps: [[0.9, 'lane'], [0.2, 'needle'], [1.3, 'word_up']] },
  { name: 'ph_diag', depth: 14, kind: 'physician', boss: true, n: 5, ready: 2, d: 5, clear: true, snaps: [[1.0, 'beam'], [0.9, 'filling'], [0.55, 'dark'], [0.6, 'held'], [0.5, 'strike'], [0.55, 'scorched']] },
  { name: 'ph_rounds', depth: 14, kind: 'physician', boss: true, n: 5, ready: 4, d: 3, snaps: [[0.8, 'raised_marked'], [0.35, 'first_ring'], [1.2, 'third_ring']] },
  { name: 'warden', depth: 15, kind: 'bookwarden', n: 2, ready: 1, d: 5, snaps: [[0.9, 'raised'], [0.4, 'flying'], [0.8, 'landing']] },
  // (floors 16 to 19: the High City's)
  { name: 'gardener', depth: 16, kind: 'gardener', n: 1, ready: 0, d: 2.5, snaps: [[0.75, 'crouched_lane'], [0.45, 'snapped'], [0.8, 'stumbled']] },
  { name: 'groom', depth: 16, kind: 'groom', n: 1, ready: 0, d: 4, snaps: [[0.6, 'whistle_line'], [0.5, 'horse'], [0.35, 'horse_by']] },
  { name: 'pguard_partisan', depth: 16, kind: 'pguard', form: 0, n: 4, ready: 1, d: 5, snaps: [[0.85, 'held_marked'], [0.25, 'flying'], [0.6, 'stuck'], [1.2, 'sword_drawn']] },
  { name: 'pguard_sword', depth: 16, kind: 'pguard', form: 1, n: 4, ready: 2, d: 5, snaps: [[1.1, 'held_marked'], [0.5, 'stuck']] },
  { name: 'dancers', depth: 17, kind: 'dancer', pair: true, n: 5, ready: 0, d: 5, snaps: [[0.9, 'whirl_lane'], [0.35, 'flung'], [0.5, 'down_lane']] },
  { name: 'kknight', depth: 19, kind: 'kknight', n: 2, ready: 1, d: 3, snaps: [[1.2, 'held_marked'], [0.25, 'planted'], [1.6, 'standing_rally']] },
];
export default async function (page, snap) {
  const want = (process.env.WHO ?? '').split(',').filter(Boolean);
  const idle = { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };
  await page.evaluate(() => { const d = window.__dbg; d.saving(false); if (d.paintDefer) d.paintDefer.on = false; d.run('warrior', 4242); d.seasoned(8); d.autoLevel = false; d.autoWords = false; d.god = true; });
  await page.waitForTimeout(600);
  let depth = '';
  for (const C of CASES) {
    if (want.length && !want.includes(C.name)) continue;
    if (`${C.depth}${C.boss ? 'b' : ''}` !== depth) {
      depth = `${C.depth}${C.boss ? 'b' : ''}`;
      const bossy = !!C.boss;
      await page.evaluate(([depth, bossy]) => {
        const D = window.__dbg;
        let g = D.game();
        if (window.__step) g.update = window.__step;
        g.depth = depth; g.cleared = depth - 1; g.enterDungeon();
        g.waveT = 1e9;
        g = D.game();
        g.level.explored.fill(1);
        g.waveT = 1e9; D.bot(false);
        const boss = g.boss;
        for (const q of g.monsters) if (q !== boss) q.dead = true;
        g.monsters = boss ? [boss] : [];
        // (the hero in the open: by the boss for hers, else the biggest room but hers, she asleep in it; no talent waiting)
        g.talentsLeft = () => 0;
        const r = g.level.floor.rooms.filter((q) => q.kind !== 'boss').sort((a, b) => b.w * b.h - a.w * a.h)[0];
        g.hero.x = r.x + r.w / 2 + 0.5; g.hero.y = r.y + r.h / 2 + 0.5;
        // (the openest spot of it: the most open floor within three tiles round)
        let best = -1;
        for (let y = r.y + 1; y < r.y + r.h - 1; y += 1) for (let x = r.x + 1; x < r.x + r.w - 1; x += 1) {
          if (!g.isOpen(x + 0.5, y + 0.5)) continue;
          let n = 0;
          for (let a = 0; a < 16; a++) for (const d of [1, 2, 3]) if (g.free(g.level.walk, x + 0.5 + Math.cos(a / 16 * Math.PI * 2) * d, y + 0.5 + Math.sin(a / 16 * Math.PI * 2) * d, 0.4)) n++;
          if (n > best) { best = n; g.hero.x = x + 0.5; g.hero.y = y + 0.5; }
        }
        if (boss && bossy) { g.hero.x = boss.x + 2.5; g.hero.y = boss.y + 2.5; }
        window.__step = g.update.bind(g); g.update = () => undefined;
        // (some seconds on, the floor's name gone)
        const idle = { mx: 0, my: 0, aimX: 0, aimY: 0, fire: false, approach: false, face: false, cast: false, castX: 0, castY: 0, hold: false, evade: false, evadeX: 0, evadeY: 0, potion: false, interact: false };
        const hx = g.hero.x, hy = g.hero.y;
        for (let k = 0; k < 240; k++) { g.hero.invuln = 1; g.hero.life = g.hero.d.maxLife; window.__step(1 / 30, idle); g.hero.x = hx; g.hero.y = hy; }
        for (let i = g.events.length - 1; i >= 0; i--) if (g.events[i].t === 'bossIntro') g.events.splice(i, 1);
      }, [C.depth, bossy]);
      await page.waitForTimeout(Number(process.env.SETTLE || 5000));
    }
    const got = await page.evaluate(([C, idle]) => {
      const g = window.__dbg.game();
      g.perils = []; g.zones = [];
      const h = g.hero;
      let m = C.boss ? g.boss : null;
      let lady = null;
      if (!m && C.pair) {
        // (a waltzing pair: the lady first, the gentleman with her; he leads)
        lady = g.spawn(C.kind, h.x + C.d, h.y, 77, 0, false, g.rng, null, null);
        m = g.spawn(C.kind, h.x + C.d, h.y, 77, 1, false, g.rng, null, null);
        g.monsters = [...g.monsters.filter((q) => q.boss), lady, m];
      } else if (!m) {
        m = g.spawn(C.kind, h.x + C.d, h.y, -2, 0, false, g.rng, null, null);
        g.monsters = [...g.monsters.filter((q) => q.boss), m];
      }
      if (C.form !== undefined) m.form = C.form;
      // (where it can stand and see him, C.d off)
      const tries = [];
      for (let k = 0; k < 16; k++) tries.push([Math.cos((k / 16) * Math.PI * 2) * C.d, Math.sin((k / 16) * Math.PI * 2) * C.d]);
      if (C.kind === 'stag') {
        // (the Stag in the middle of his clearing, not bounding off to stare)
        const area = g.level.land?.areas.find((q) => q.role === 'boss');
        if (area) { m.x = area.blob.x; m.y = area.blob.y; }
        if (m.a1) { m.a1.stareAt = 999; m.a1.bounds = 0; }
      }
      if (m.boss) {
        // (the boss where she is: the hero C.d off her, on firm ground (a tile round him every way, none the eyrie's rounded edge
        // cuts), she seeing him; the one most in front of her as the picture is drawn, so she does not hide him)
        const L = g.level, f = L.floor;
        const firm = (x, y) => [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1], [0.7, 0.7], [-0.7, 0.7], [0.7, -0.7], [-0.7, -0.7]].every(([ox, oy]) => {
          const tx = Math.floor(x + ox), ty = Math.floor(y + oy);
          if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return false;
          const i = ty * f.w + tx;
          return L.walk[i] === 1 && !(f.cut && f.cut[i]);
        });
        // (the Stag in his clearing: the hero beside him as the picture is drawn, the wood behind them both)
        const side = C.kind === 'stag' ? [[-C.d / Math.SQRT2, C.d / Math.SQRT2], [C.d / Math.SQRT2, -C.d / Math.SQRT2]] : [];
        // (`clear`: nothing on the floor between them that cannot be walked: a bed, a table)
        const clear = (x, y) => {
          if (!C.clear) return true;
          const n = Math.ceil(Math.hypot(x - m.x, y - m.y) / 0.12);
          for (let k = 1; k < n; k++) {
            const tx = Math.floor(m.x + (x - m.x) * k / n), ty = Math.floor(m.y + (y - m.y) * k / n);
            if (L.walk[ty * f.w + tx] !== 1) return false;
          }
          return true;
        };
        const ok = [...side.filter(([ox, oy]) => firm(m.x - ox, m.y - oy) && g.sees(m.x, m.y, m.x - ox, m.y - oy)), ...tries.filter(([ox, oy]) => firm(m.x - ox, m.y - oy) && g.sees(m.x, m.y, m.x - ox, m.y - oy) && clear(m.x - ox, m.y - oy)).sort((p, q) => (p[0] + p[1]) - (q[0] + q[1]))][0];
        if (ok) { h.x = m.x - ok[0]; h.y = m.y - ok[1]; }
      } else {
        const ok = tries.find(([ox, oy]) => g.isOpen(h.x + ox, h.y + oy) && g.sees(h.x + ox, h.y + oy, h.x, h.y));
        if (ok) { m.x = h.x + ok[0]; m.y = h.y + ok[1]; }
        if (lady) {
          lady.x = m.x; lady.y = m.y;
          g.wakeUp(lady);
          lady.life = lady.maxLife = 1e9; lady.speed = 0; lady.state = 'chase';
          if (lady.a1) { lady.a1.noticed = 1; lady.a1.want = 0; }
          lady.moveCd = Array.from({ length: C.n }, () => 99);
        }
      }
      m.state = 'chase'; m.act = undefined;
      g.wakeUp(m);
      if (C.pair && m.a1) { m.a1.noticed = 1; m.a1.want = 0; }
      if (m.boss && g.bossReady) g.bossReady();
      m.life = m.maxLife = 1e9; m.cd = 0;
      if (!C.pack) m.speed = 0;
      if (C.life) m.life = m.maxLife * C.life;
      if (C.up && m.a1) m.a1.under = 0;
      // (a pack: more of its kind round him, evenly)
      for (let i = 1; i < (C.pack ?? 1); i++) {
        const a = Math.atan2(m.y - h.y, m.x - h.x) + (i / C.pack) * Math.PI * 2;
        const o = g.spawn(C.kind, h.x + Math.cos(a) * C.d, h.y + Math.sin(a) * C.d, -2, 0, false, g.rng, null, null);
        if (!g.monsters.includes(o)) g.monsters.push(o);
        g.wakeUp(o);
        o.life = o.maxLife = 1e9; o.cd = 0; o.state = 'chase';
      }
      m.moveCd = Array.from({ length: C.n }, (_, i) => (i === C.ready ? 0 : 99));
      // (`fight`: the Rat King's sluices, on the cistern's own clock: that far into his fight)
      if (C.fight !== undefined && m.a1) m.a1.fight = C.fight;
      for (let k = 0; k < 300 && !C.noact && m.state !== 'act' && m.state !== 'windup'; k++) {
        h.invuln = 1; h.life = h.d.maxLife;
        window.__step(1 / 30, idle);
        if (m.moveCd) for (let i = 0; i < m.moveCd.length; i++) if (i !== C.ready) m.moveCd[i] = 99;
        if (lady && lady.moveCd) for (let i = 0; i < lady.moveCd.length; i++) lady.moveCd[i] = 99;
      }
      // (her name's banner, woken again for each, not over the picture)
      for (let i = g.events.length - 1; i >= 0; i--) if (g.events[i].t === 'bossIntro') g.events.splice(i, 1);
      return m.state === 'act' ? m.act.id : m.state === 'windup' ? `windup ${m.move}` : `none (${m.state}, d ${Math.hypot(h.x - m.x, h.y - m.y).toFixed(1)}, sees ${g.sees(m.x, m.y, h.x, h.y)})`;
    }, [C, idle]);
    console.log(`${C.name}: ${got}`);
    for (const [secs, name] of C.snaps) {
      const at = await page.evaluate(([secs, idle]) => {
        const g = window.__dbg.game();
        for (let k = 0; k < Math.round(secs * 30); k++) { g.hero.invuln = 0; g.hero.life = 1e6; window.__step(1 / 30, idle); g.hero.life = g.hero.d.maxLife; }
        const m = g.monsters.find((q) => q.act) ?? null;
        return `${m && m.act ? `${m.act.id} ${m.act.t.toFixed(2)}` : '-'}; ${g.perils.filter((p) => p.a1).map((p) => `${p.a1} ${p.t.toFixed(2)}`).slice(0, 3).join(', ')}`;
      }, [secs, idle]);
      await page.waitForTimeout(30);
      console.log(`  ${name}: ${at}`);
      await snap(`${C.name}_${name}`);
    }
  }
}
