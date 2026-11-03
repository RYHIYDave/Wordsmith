// THE VETERAN IN THE GAME, FOR THE PICTURES (art/veteran_art.ts, render/veteran_fx.ts; behind game/veteran.ts VETERAN, off):
// the art chat's Veteran drawn by the game, each of his moves at its key frames (the held wind-up, the blow, the force out at
// its reach, the wind-down), from in front and from behind (and a few mirrored, facing screen-left), with his globes over him
// and a skeleton at his reach that his blow is said to strike (for its burst). Not a test, and not his rules: the rules are
// not in yet, so here the move and its frame are SET, frame by frame (g.hero.vet), and he is put where the rules will carry
// him (src/game/veteran_baked.ts `place`, read here as text; CARRY=0 leaves him where he stood). A page built with the
// Brawler in:
//   node tools/build_brawler_to.mjs dist/vet.html
//   node tools/playtest.mjs --file dist/vet.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/veteran_look.mjs --out shots/vet/x
//   env: ONLY=jab,hook (some moves only); VIEWS=front,back,frontL,backL
import fs from 'node:fs';
import { log } from './lib.mjs';

// (where the floor point under him is at each frame of each move, tiles along his forward and his left: the baked steps)
const BAKED = (() => {
  const src = fs.readFileSync(new URL('../../src/game/veteran_baked.ts', import.meta.url), 'utf8');
  const out = {};
  for (const m of src.matchAll(/^  (\w+): \{\n    long: (\d+),\n    carry: (.*),\n    place: (.*),\n    spin: (.*),\n  \},/gm)) out[m[1]] = JSON.parse(m[4]);
  return out;
})();

// (each move: its frames to show, and the globes over him as it plays, as his combos fill them)
const MOVES = [
  ['jab', [11, 12, 14, 17], ['punch']],
  ['cross', [12, 14, 16, 19], ['punch', 'punch']],
  ['hook', [13, 15, 17, 20], ['punch', 'punch', 'punch']],
  ['roundkick', [14, 16, 18, 21], ['kick']],
  ['push', [15, 17, 20, 24], ['kick', 'kick']],
  ['elbow', [18, 20, 24, 30], ['kick', 'punch']],
  ['uppercut', [13, 15, 18, 24], ['punch', 'punch', 'punchFire']],
  ['knee', [19, 21, 24, 35], ['punch', 'punch', 'kickFire']],
  ['spinkick', [14, 18, 21, 26], ['kick', 'kick', 'kickFire']],
  ['spinkickClose', [14, 20, 24, 30], ['kickFire']],
  ['dodge', [8, 17, 26], ['jump']],
];
// (the strike each move's blow lands at, for the skeleton it strikes: the art's)
const AT = { jab: 12, cross: 14, hook: 15, roundkick: 16, push: 17, elbow: 20, uppercut: 15, knee: 21, spinkick: 20, spinkickClose: 24, dodge: 999 };
// (the four ways a hero is drawn: in front, behind, and each mirrored to face screen-left)
const VIEWS = { front: [1, 0], back: [0, -1], frontL: [0, 1], backL: [-1, 0] };

export default async function (page, snap) {
  const only = (process.env.ONLY || '').split(',').filter(Boolean);
  const views = (process.env.VIEWS || 'front,back').split(',').filter(Boolean);
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.veteran.on = true;
    // (every frame painted as it is shown: the stills are his frames, not the nearest painted)
    if (d.paintDefer) d.paintDefer.on = false;
    d.practice('brawler', 7);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    const g = d.game();
    g.waveT = 1e9;
    g.monsters.length = 0;
    g.projectiles.length = 0;
  });
  await page.waitForTimeout(800);
  const home = await page.evaluate(() => {
    const h = window.__dbg.game().hero;
    return [h.x, h.y];
  });
  const carry = process.env.CARRY !== '0';
  const set = (id, f, fx, fy, globes, hit) =>
    page.evaluate(([id, f, fx, fy, globes, hit, home, at]) => {
      const g = window.__dbg.game();
      const h = g.hero;
      h.fx = fx;
      h.fy = fy;
      h.anim = 'idle';
      // (carried as the rules will carry him: his forward (fx, fy), his left (fy, -fx), the world's right when he is drawn mirrored)
      const s = fx - fy < 0 ? -1 : 1;
      h.x = home[0] + at[0] * fx + at[1] * s * fy;
      h.y = home[1] + at[0] * fy - at[1] * s * fx;
      h.vet = { globes, queue: [], done: [], idle: 0, move: id ? { id, f, x0: home[0], y0: home[1], fx, fy, carried: [0, 0], hit: hit ? [hit] : [], globe: 0 } : null };
    }, [id, f, fx, fy, globes, hit, home, id && carry ? BAKED[id][Math.floor(f)] : [0, 0]]);
  // HIM STANDING, each way, his globes empty
  for (const v of views) {
    const [fx, fy] = VIEWS[v];
    await set(null, 0, fx, fy, [], 0);
    await page.waitForTimeout(700);
    await snap(`stand_${v}`);
  }
  for (const [id, frames, globes] of MOVES) {
    if (only.length && !only.includes(id)) continue;
    for (const v of views) {
      const [fx, fy] = VIEWS[v];
      // (a skeleton at his reach, two tiles and a quarter out along the way he faces, that cannot move or strike)
      const mid = await page.evaluate(([fx, fy, home]) => {
        const g = window.__dbg.game();
        const h = g.hero;
        g.monsters.length = 0;
        const m = g.spawn('skeleton', home[0] + fx * 2.25, home[1] + fy * 2.25, 1, 0, false, g.rng);
        g.wakeUp(m);
        m.life = m.maxLife = 1e7;
        m.speed = 0;
        m.cd = 1e9;
        m.state = 'recover';
        m.t = 1e9;
        m.anim = 'idle';
        m.fx = -fx;
        m.fy = -fy;
        return m.id;
      }, [fx, fy, home]);
      // (what the move before left playing out is gone first)
      await set(null, 0, fx, fy, [], 0);
      await page.waitForTimeout(900);
      for (const f of frames) {
        await set(id, f, fx, fy, globes, f >= AT[id] ? mid : 0);
        await page.waitForTimeout(350);
        await snap(`${id}_${v}_${String(f).padStart(2, '0')}`);
      }
    }
  }
  // HIM RUNNING (the game's own walk, by its controls: his run shown by the floor it covers), down the screen and up it
  if (!only.length || only.includes('run')) {
    await page.evaluate(() => {
      const g = window.__dbg.game();
      g.monsters.length = 0;
      g.hero.vet = { globes: [], queue: [], done: [], idle: 0, move: null };
      const run = g.update.bind(g);
      window.__vrun = { mx: 0.7071, my: 0.7071 };
      g.update = (dt, c) => {
        c.mx = window.__vrun.mx;
        c.my = window.__vrun.my;
        return run(dt, c);
      };
    });
    for (const [name, mx, my] of [['front', 1, 0], ['back', 0, -1]]) {
      await page.evaluate(([mx, my]) => (window.__vrun = { mx, my }), [mx, my]);
      for (let k = 0; k < 3; k++) {
        await page.waitForTimeout(260);
        await snap(`run_${name}_${k}`);
      }
    }
    await page.evaluate(() => (window.__vrun = { mx: 0, my: 0 }));
    await page.waitForTimeout(500);
  }
  // HIS GLOBES LOCKED, standing
  await set(null, 0, 1, 0, ['punch', 'punch', 'kick'], 0);
  await page.waitForTimeout(600);
  await snap('globes_locked');
  const errs = await page.evaluate(() => (window.__dbg.errors ? window.__dbg.errors() : null));
  log('errors', JSON.stringify(errs));
}
