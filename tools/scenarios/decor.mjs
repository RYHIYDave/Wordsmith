// (MOCK-UP, NOT IN THE GAME) DECORATIONS (src/game/decor.ts; their pictures src/art/decor.ts; drawn by
// render.ts): stills of real dungeon rooms, each as it is in the game and with the decorations.
//
// The owner, 5 Oct 2026, 12:43: "I'd like the layout as whole to be less uniform. The floors and
// walls just need more variation. And more doodads around like molted tapestries or gargoyle heads
// or missing broken floors tiles. That kind of thing. I know it's a tomb but I'd like it to look more
// alive if that makes sense"; 12:44: "And everything looks too flat".
//
// The switch (`__dbg.decor.on`) is OFF in the game: this playtest sets it before it lays the dungeon,
// so that the map-maker lays decorations, and then photographs each room twice, with the switch off
// (the room as it is in the game: the dungeon is the same, decorations or not) and on. It puts the
// switch back as it found it.
//   ROOMS='3,7'          the rooms to photograph (none: every room is listed, with what is in it)
//   AT='3:1.5,2,0.7,0.7' where the hero stands in a room (from the room's corner, in tiles) and the way he faces
//   NEAR=1               also a figure between a fire and the eye drawn a step darker (`near`)
//   ONLY=after           only the pictures with the decorations
//   SEED=6 DEPTH=2 CLS=warrior
//   node tools/playtest.mjs --file dist/decor.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/decor.mjs --out shots/decor/a
import { log } from './lib.mjs';

export default async function (page, snap) {
  const cls = process.env.CLS || 'warrior';
  const seed = Number(process.env.SEED || 6);
  const depth = Number(process.env.DEPTH || 2);
  const near = process.env.NEAR === '1';
  const info = await page.evaluate(([cls, seed, depth, near]) => {
    const d = window.__dbg; d.saving(false);
    const was = { on: d.decor.on, near: d.decor.near };
    d.decor.on = true;
    d.decor.near = near;
    d.run(cls, seed);
    const g = d.game();
    g.depth = depth; g.cleared = depth; g.enterDungeon();
    window.__decorWas = was;
    d.autoLevel = false; d.autoWords = false; d.god = true;
    g.wakeUp = () => {};
    window.__kept = g.monsters.splice(0);
    g.projectiles.length = 0;
    clearInterval(window.__lit);
    window.__lit = setInterval(() => { const q = window.__dbg.game(); if (!q) return; q.monsters.length = window.__keepMonsters ? q.monsters.length : 0; q.level.explored.fill(1); q.level.visible.fill(1); window.__dbg.fx.messages.length = 0; }, 3);
    const L = g.level; const f = L.floor;
    return f.rooms.map((r) => {
      const n = {};
      for (const p of L.props) if (p.tx >= r.x && p.tx < r.x + r.w && p.ty >= r.y && p.ty < r.y + r.h) n[p.kind] = (n[p.kind] || 0) + 1;
      const doors = L.doors.filter((q) => q.spot.room === r.id).map((q) => q.spot.kind).join(',');
      const dec = (f.decor || []).filter((q) => q.room === r.id).map((q) => `${q.kind}${q.variant % (q.kind === 'crack' || q.kind === 'hole' ? 3 : 2)}@${q.x},${q.y}${q.kind === 'tapestry' || q.kind === 'gargoyle' ? (q.alongX ? 'x' : 'y') : ''}`).join(' ');
      return `${r.id}:${r.kind} ${r.x},${r.y} ${r.w}x${r.h} ${JSON.stringify(n)} ${doors} | ${dec}`;
    });
  }, [cls, seed, depth, near]);
  for (const line of info) log('room', line);
  const rooms = (process.env.ROOMS || '').split(',').filter(Boolean).map(Number);
  const at = new Map((process.env.AT || '').split(';').filter(Boolean).map((s) => { const [id, rest] = s.split(':'); return [Number(id), rest.split(',').map(Number)]; }));
  for (const id of rooms) {
    const where = at.get(id) || null;
    await page.evaluate(([id, where]) => {
      const g = window.__dbg.game(); const r = g.level.floor.rooms[id]; const h = g.hero;
      if (where) { h.x = r.x + where[0]; h.y = r.y + where[1]; h.fx = where[2] ?? 0.7; h.fy = where[3] ?? 0.7; }
      else { h.x = r.x + r.w / 2; h.y = r.y + r.h / 2; h.fx = 0.7; h.fy = 0.7; }
      h.move = null;
    }, [id, where]);
    for (const on of process.env.ONLY === 'after' ? [true] : [false, true]) {
      await page.evaluate((on) => { window.__dbg.decor.on = on; }, on);
      await page.waitForTimeout(900);
      await snap(`room${id}_${on ? 'after' : 'before'}`);
    }
  }
  // A FIGURE BETWEEN A FIRE AND THE EYE (`near`): the hero set down a step in front of a fire of the
  // room (the one furthest up the screen), in line with it as the eye looks; photographed with the
  // decorations on, without `near` and with it
  const fire = process.env.FIRE !== undefined ? Number(process.env.FIRE) : -1;
  if (fire >= 0) {
    const at = await page.evaluate(([id, ahead]) => {
      const d = window.__dbg; const g = d.game(); const L = g.level; const r = L.floor.rooms[id]; const h = g.hero;
      const fires = L.props.filter((p) => p.kind === 'brazier' && p.tx >= r.x && p.tx < r.x + r.w && p.ty >= r.y && p.ty < r.y + r.h);
      fires.sort((a, b) => a.x + a.y - (b.x + b.y));
      const b = fires[0];
      if (!b) return null;
      h.x = b.x + ahead / 2; h.y = b.y + ahead / 2; h.fx = 0.7; h.fy = 0.7; h.move = null;
      return { fire: [b.x, b.y], hero: [h.x, h.y] };
    }, [fire, Number(process.env.AHEAD || 1.3)]);
    log('in front of a fire', JSON.stringify(at));
    // time all but stopped between the two, so that the hero stands in the same pose and the fire
    // burns the same in both
    await page.waitForTimeout(900);
    await page.evaluate(() => { window.__dbg.slowmo = 0.0001; });
    for (const near of [false, true]) {
      await page.evaluate((near) => { window.__dbg.decor.on = true; window.__dbg.decor.near = near; }, near);
      await page.waitForTimeout(500);
      await snap(`fire${fire}_${near ? 'near' : 'plain'}`);
    }
    await page.evaluate(() => { window.__dbg.slowmo = 1; });
  }
  await page.evaluate(() => { const d = window.__dbg; Object.assign(d.decor, window.__decorWas || { on: false, near: false }); });
}
