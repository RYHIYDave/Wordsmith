// THE STOKER IN THE GAME (game/act1_rules/stoker.ts, game/furnace_arena.ts; the quest line behind QUESTS15, switched on here):
// pictures for him of floor 3 with the furnace burning: the hallway into his arena, the arena with him and the furnace and the
// crank, him throwing his coals and raking, his death and the gear, the fire in the Chained One's gateway.
//   node tools/build_to.mjs dist/stoker.html
//   node tools/playtest.mjs --file dist/stoker.html --touch --size 844x390 --dpr 3 --scenario tools/scenarios/stoker_look.mjs --out shots/stoker/s
import { log } from './lib.mjs';

export default async function (page, snap) {
  await page.evaluate(() => {
    const d = window.__dbg;
    d.saving(false);
    d.quests15.on = true;
    d.run('warrior', 7);
    d.autoLevel = false;
    d.autoWords = false;
    d.god = true;
    const g = d.game();
    g.hero.ring = true;
    g.hero.furnace = 'asked';
    g.depth = 3;
    g.cleared = 2;
    g.wayDepth = 3;
    g.enterDungeon();
  });
  const info = await page.evaluate(() => {
    const g = window.__dbg.game();
    const L = g.level;
    const A = L.arena;
    const k = g.monsters.find((m) => m.id === L.furnace.keeper);
    return { A, gate: L.doors[L.furnace.gate] ? L.doors[L.furnace.gate].spot : null, keeper: { x: k.x, y: k.y, kind: k.kind } };
  });
  log(`arena ${JSON.stringify(info.A.room)} hall ${JSON.stringify(info.A.hall)} dir ${info.A.dx},${info.A.dy} keeper ${JSON.stringify(info.keeper)}`);
  // (the painter paints him meanwhile: wait for his frames)
  const place = async (x, y, fx, fy, wait = 1500) => {
    await page.evaluate(([x, y, fx, fy]) => { const h = window.__dbg.game().hero; h.x = x; h.y = y; h.fx = fx; h.fy = fy; window.__dbg.game().updateVision?.(1); }, [x, y, fx, fy]);
    await page.waitForTimeout(wait);
  };
  const A = info.A;
  // 1. THE HALLWAY: standing in the room it comes out of, looking down it
  const hx = A.dx ? (A.dx < 0 ? A.hall.x + A.hall.w + 0.5 : A.hall.x - 0.5) : A.hall.x + 1.5;
  const hy = A.dy ? (A.dy < 0 ? A.hall.y + A.hall.h + 0.5 : A.hall.y - 0.5) : A.hall.y + 1.5;
  await page.evaluate(() => { window.__dbg.game().monsters.forEach((m) => { if (m.kind !== 'stoker') m.life = 0; }); });
  await place(hx - A.dx * 1.5, hy - A.dy * 1.5, A.dx || 0.001, A.dy || 0.001, 20000);
  await snap('1_hallway');
  // 2. IN THE ARENA, in the hallway's mouth: him, the furnace, the crank
  await place(A.keeper.x - A.dx * 4.2, A.keeper.y - A.dy * 4.2, A.dx || 0.001, A.dy || 0.001, 400);
  await snap('2_arena');
  // 3. HIS FIGHT: let him act a while; pictures as he throws and rakes
  await page.evaluate(() => { window.__dbg.god = true; });
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(1300);
    await snap(`3_fight_${i}`);
  }
  // 4. HIS DEATH and the gear
  await page.evaluate(() => { const g = window.__dbg.game(); const k = g.monsters.find((m) => m.kind === 'stoker'); g.damageMonster(k, 1e9, 'phys', false, 0); });
  for (const [i, ms] of [[0, 900], [1, 900], [2, 1500], [3, 2500]]) {
    await page.waitForTimeout(ms);
    await snap(`4_death_${i}`);
  }
  // 5. THE CHAINED ONE'S GATEWAY, the fire in it
  const G = info.gate;
  if (G) {
    const mx = G.alongX ? G.a + 1.5 : G.plane + 2.5 * G.out * -1;
    const my = G.alongX ? G.plane + 2.5 * G.out * -1 : G.a + 1.5;
    await place(mx, my, 0.7, 0.7, 1500);
    await snap('5_fire_gate');
  }
}
