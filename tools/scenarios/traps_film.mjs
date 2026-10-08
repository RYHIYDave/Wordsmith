// THE TRAPS, AS MOVING PICTURES (not in the regression): the hall laid by hand for them
// (`#hall=traps`), in the game's own dark, the game slowed and photographed every twentieth of a
// second of game time; the hero moved by the game's own controls, set by a script each step.
//   FILM=spikes|darts|door|pack node tools/playtest.mjs --file <page> --scenario tools/scenarios/traps_film.mjs --out shots/trapsfilm/x
// The frames go to shots/trapsfilm/<film>/; tools/hero_gif.py joins them.
//   spikes  the hero walks up to the spike floor across the corridor, waits through the warning
//           and the spikes, and crosses as they go down
//   darts   the hero walks onto the plate; the darts come from the slot; the first hits, he rolls,
//           the rest go by
//   door    the hero comes up to the sealed door (the line says what it wants), strikes it with a
//           Strike carrying FLAME, and walks in to the chest
//   pack    three skeletons come at the hero across the room's spike floor as it rises
import fs from 'node:fs';
import path from 'node:path';
import { log } from './lib.mjs';

const FILMS = {
  spikes: { seconds: 4.6, at: { x: 11.0, y: 18.5 }, face: { x: 1, y: 0 } },
  darts: { seconds: 3.6, at: { x: 26.2, y: 32.5 }, face: { x: 1, y: 0 } },
  door: { seconds: 4.8, at: { x: 42.5, y: 36.0 }, face: { x: 0, y: -1 } },
  pack: { seconds: 3.4, at: { x: 21.4, y: 19.0 }, face: { x: 1, y: 0 } },
};

export default async function (page) {
  const film = process.env.FILM || 'spikes';
  const F = FILMS[film];
  const dir = path.resolve('shots/trapsfilm', film);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });

  await page.evaluate(([film, F]) => {
    const d = window.__dbg; d.saving(false);
    d.practice('warrior', 11, 'traps');
    const g = d.game();
    d.god = true; d.autoLevel = false; d.autoWords = false;
    g.waveT = 1e9; g.monsters.length = 0; g.projectiles.length = 0;
    const h = g.hero;
    h.x = F.at.x; h.y = F.at.y; h.fx = F.face.x; h.fy = F.face.y;
    if (film === 'door') {
      for (const sd of ['front', 'behind']) { const grp = sd === 'front' ? h.skills[0].front : h.skills[0].behind; for (let i = 0; i < grp.length; i++) if (grp[i]) g.unsocket(0, sd, i); }
      g.socket(0, 'front', 'fire');
    }
    if (film === 'pack') {
      for (const [x, y] of [[28.2, 17.9], [28.5, 19.4], [28.0, 20.6]]) {
        const m = g.spawn('skeleton', x, y, 0, 0, false, g.rng);
        g.wakeUp(m); m.state = 'chase'; m.cd = 1e9; m.life = m.maxLife = 60;
      }
    }
    // (the script: it sets the controls the game is given each step, by the level's clock)
    let struck = false;
    let rolled = false;
    let clickAt = -1;
    const script = (c) => {
      const t = g.time; const h = g.hero;
      // (of the lines on the screen only the sealed door's are kept: the practice room's own would be in the way)
      const said = d.fx.messages;
      for (let i = said.length - 1; i >= 0; i--) if (!/seal/i.test(said[i].text || '')) said.splice(i, 1);
      c.mx = 0; c.my = 0; c.fire = false; c.evade = false;
      if (film === 'spikes') {
        if (t < 1.4 && h.x < 14.7) c.mx = 1;
        else if (t >= 2.52 && h.x < 22) c.mx = 1;
      } else if (film === 'darts') {
        if (h.x < 31.6 && t < 2) c.mx = 1;
        // (on the plate: it clicks, and he stands; the first dart hits him, he rolls out of their line, and the other two fly through where he stood)
        const z = g.level.hazards.find((q) => q.spot.kind === 'darts');
        if (z && z.ready > 0 && clickAt < 0) clickAt = t;
        if (clickAt >= 0 && t > clickAt + 0.86 && !rolled) { rolled = true; c.evade = true; c.evadeX = h.x + 2.6; c.evadeY = h.y + 1.0; }
      } else if (film === 'door') {
        const q = g.level.doors.find((dd) => dd.spot.kind === 'worddoor');
        if (q && q.want === 0) {
          if (h.y > 27.9) c.my = -1;
          else if (!struck && t > 1.9) { struck = true; h.fx = 0; h.fy = -1; g.useBasic(42.5, 26.5); }
        } else if (t > 2.9 && h.y > 23.4) c.my = -1;
      }
    };
    if (!g.__filmUpdate) {
      g.__filmUpdate = g.update.bind(g);
      g.update = (dt, c) => { if (window.__script) window.__script(c); return g.__filmUpdate(dt, c); };
    }
    window.__script = script;
    g.time = 0;
    d.fx.messages.length = 0;
    d.slowmo = 0.05;
  }, [film, F]);

  const step = 0.05;
  const n = Math.round(F.seconds / step);
  for (let k = 0; k < n; k++) {
    await page.waitForFunction((t) => window.__dbg.game().time >= t, k * step, { timeout: 60000, polling: 5 });
    await page.screenshot({ path: path.join(dir, `f${String(k).padStart(4, '0')}.png`) });
  }
  const end = await page.evaluate(() => {
    const d = window.__dbg; const g = d.game();
    d.slowmo = 1; window.__script = null;
    const q = g.level.doors.find((dd) => dd.spot.kind === 'worddoor');
    return { x: g.hero.x, y: g.hero.y, door: q ? q.want : -1, said: d.fx.messages.map((m) => m.text).join(' | '), monsters: g.monsters.map((m) => `${Math.round(m.life)}/${m.maxLife}`).join(' ') };
  });
  log(`film ${film}`, `${n} frames; the hero ends at ${end.x.toFixed(1)}, ${end.y.toFixed(1)}; ${end.said}; ${end.monsters}`);
  log('finished clean');
}
