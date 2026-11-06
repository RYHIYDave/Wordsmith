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
  const G = info.gate;
  // 1. THE HALLWAY: standing in the room it comes out of, looking down it
  const hx = A.dx ? (A.dx < 0 ? A.hall.x + A.hall.w + 0.5 : A.hall.x - 0.5) : A.hall.x + 1.5;
  const hy = A.dy ? (A.dy < 0 ? A.hall.y + A.hall.h + 0.5 : A.hall.y - 0.5) : A.hall.y + 1.5;
  // (the floor's other monsters taken away: the pictures are of him and his room)
  await page.evaluate(() => { const g = window.__dbg.game(); const keep = g.monsters.filter((m) => m.kind === 'stoker'); g.monsters.length = 0; g.monsters.push(...keep); });
  await place(hx - A.dx * 2, hy - A.dy * 2, A.dx || 0.001, A.dy || 0.001, 20000);
  await snap('1_hallway');
  // (and from half way down it)
  await place(hx + A.dx * 3, hy + A.dy * 3, A.dx || 0.001, A.dy || 0.001, 600);
  await snap('1b_in_hallway');
  // 2. IN THE ARENA, in the hallway's mouth: him, the furnace, the crank
  await place(A.keeper.x - A.dx * 4.2, A.keeper.y - A.dy * 4.2, A.dx || 0.001, A.dy || 0.001, 400);
  await snap('2_arena');
  // 3. HIS FIGHT: let him act a while; pictures as he throws and rakes
  await page.evaluate(() => { window.__dbg.god = true; });
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(1300);
    await snap(`3_fight_${i}`);
  }
  // 5. THE CHAINED ONE'S GATEWAY, the fire in it
  if (G) {
    const mx = G.alongX ? G.a + 1.5 : G.plane + 2.5 * G.out;
    const my = G.alongX ? G.plane + 2.5 * G.out : G.a + 1.5;
    await place(mx, my, 0.7, 0.7, 1500);
    await snap('5_fire_gate');
    await place(info.keeper.x - A.dx * 4.2, info.keeper.y - A.dy * 4.2, A.dx || 0.001, A.dy || 0.001, 600);
  }
  // 4. HIS DEATH and the gear (the hero stood off to one side of him, clear of where it lands). First brought low, as a fight
  // brings him, and kept there while the painter paints his death ahead (render.ts DIE_SOON), as it does in a fight.
  await page.evaluate(() => { const g = window.__dbg.game(); const k = g.monsters.find((m) => m.kind === 'stoker'); k.life = Math.round(k.maxLife * 0.1); });
  for (let i = 0; i < 40; i++) {
    await page.waitForTimeout(1000);
    await page.evaluate(() => { const g = window.__dbg.game(); const k = g.monsters.find((m) => m.kind === 'stoker'); k.life = Math.round(k.maxLife * 0.1); g.hero.life = g.hero.d.maxLife; });
  }
  await snap('3_burst_low');
  await page.evaluate(() => {
    const g = window.__dbg.game();
    const k = g.monsters.find((m) => m.kind === 'stoker');
    const h = g.hero;
    h.x = k.x - k.fy * 4.5;
    h.y = k.y + k.fx * 4.5;
    g.damageMonster(k, 1e9, 'phys', false, 0);
  });
  for (const [i, ms] of [[0, 1500], [1, 300], [2, 600], [3, 1200], [4, 2500]]) {
    await page.waitForTimeout(ms);
    await snap(`4_death_${i}`);
  }
  // (walked onto the gear: taken)
  await page.evaluate(() => { const g = window.__dbg.game(); const p = g.perils.find((q) => q.a1 === 'stoker:gear'); if (p) { g.hero.x = p.x; g.hero.y = p.y; } });
  await page.waitForTimeout(800);
  await snap('4_gear_taken');
  // (the crank, turned)
  await page.evaluate(() => { const g = window.__dbg.game(); const c = g.level.furnace.crank; g.hero.x = c.x + 0.7; g.hero.y = c.y + 0.7; });
  await page.waitForTimeout(700);
  await snap('4b_crank_turning');
  await page.waitForTimeout(2200);
  await snap('4c_furnace_out');
  // 6. THE GATEWAY AGAIN: the fire gone, a bed of ash, the way open
  if (G) {
    const mx = G.alongX ? G.a + 1.5 : G.plane + 2.5 * G.out;
    const my = G.alongX ? G.plane + 2.5 * G.out : G.a + 1.5;
    await place(mx, my, 0.7, 0.7, 1500);
    await snap('6_gate_open');
  }
}
