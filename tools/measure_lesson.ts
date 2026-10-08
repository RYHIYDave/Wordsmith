// How the tutorial's "before and after" comes out, per class: attacks and seconds on the crowd
// before the word and after it, the lowest life seen, and how long each step takes.
//   tsx tools/measure_lesson.ts [lazy=0]
// `lazy` is the share of the time a player spends not attacking (0 = a perfect scripted player,
// 0.7 = a slow newcomer). Use it before and after touching LESSON in src/game/defs.ts.
import { SKILLS } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Controls, Monster } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';
import type { ClassId } from '../src/game/types';

const DT = 1 / 30;
function play(cls: ClassId, seed: number, big: boolean, lazy = 0) {
  const g = Game.forLesson(cls, seed);
  const h = g.hero;
  const c: Controls = emptyControls();
  const stageT: Record<string, number> = {};
  const lowest: Record<string, number> = {};
  let ups = 0;
  let t = 0;
  let before = { time: 0, hits: 0 };
  let after = { time: 0, hits: 0 };
  for (; t < 400 && g.lesson; t += DT) {
    const L = g.lesson;
    Object.assign(c, emptyControls());
    let m: Monster | null = null;
    let bd = Infinity;
    for (const o of g.monsters) { if (o.dead) continue; const d = Math.hypot(o.x - h.x, o.y - h.y); if (d < bd) { bd = d; m = o; } }
    const steer = (x: number, y: number) => { const d = Math.hypot(x - h.x, y - h.y); c.mx = d > 0.05 ? (x - h.x) / d : 0; c.my = d > 0.05 ? (y - h.y) / d : 0; };
    if (L.stage === 'walk') steer(L.goal.x, L.goal.y);
    else if (L.stage === 'evade') { c.evade = true; c.evadeX = h.x + 3; c.evadeY = h.y - 3; }
    else if (L.stage === 'word') { const dr = g.drops.find((d) => d.kind === 'word'); if (dr) steer(dr.x, dr.y); }
    else if (L.stage === 'front') g.placeWord({ skill: 0, side: 'front', idx: 0 }, { kind: 'pouch', word: L.word });
    else if (L.stage === 'behind') g.placeWord({ skill: 0, side: 'behind', idx: 0 }, { kind: 'slot', skill: 0, side: 'front', idx: 0 });
    else if (L.stage === 'exit') { const p = g.level.portal!; steer(p.x, p.y + 1); if (g.interactHint()) c.interact = true; }
    else if (m) {
      // (a newcomer: attacks in fits and starts; `lazy` is the share of the time spent not attacking)
      const idle = lazy > 0 && (t % 2) < 2 * lazy;
      const bigOnly = L.stage === 'big' && h.skills[1].uses <= L.uses0;
      c.aimX = c.castX = m.x; c.aimY = c.castY = m.y; c.fire = !idle && !bigOnly; c.approach = true;
      if (bigOnly) steer(m.x, m.y);
      const useBig = big || L.stage === 'big' || L.stage === 'tryBehind';
      if (useBig) {
        const kind = SKILLS[h.skills[1].id].kind;
        const reach = kind === 'nova' ? 2.4 : kind === 'burst' ? 2.4 : 6;
        if (Math.hypot(m.x - h.x, m.y - h.y) < reach) c.cast = true;
      }
    }
    const st = L.stage;
    g.update(DT, c);
    stageT[st] = (stageT[st] ?? 0) + DT;
    lowest[st] = Math.min(lowest[st] ?? Infinity, h.life / h.d.maxLife);
    for (const e of g.events) if (e.t === 'text' && e.text === 'UP AGAIN') ups++;
    g.events.length = 0;
    if (g.lesson) { before = g.lesson.before; after = g.lesson.after; }
  }
  return { t, stageT, lowest, ups, before, after, life: (g as any).lesson?.life };
}
const LAZY = Number(process.argv[2] ?? 0);
for (const cls of CLASS_IDS) {
  const rows = [];
  for (let seed = 1; seed <= 12; seed++) rows.push(play(cls, seed, false, LAZY));
  const avg = (f: (r: (typeof rows)[0]) => number) => rows.reduce((a, r) => a + f(r), 0) / rows.length;
  const g0 = Game.forLesson(cls, 1);
  console.log(`${cls}: monster life ${g0.lesson!.life} (carrier ${Math.round(g0.lesson!.life * 3)}), hero life ${g0.hero.d.maxLife}`);
  console.log(`  whole tutorial ${avg((r) => r.t).toFixed(0)} s;  before: ${avg((r) => r.before.time).toFixed(1)} s, ${avg((r) => r.before.hits).toFixed(1)} attacks;  after: ${avg((r) => r.after.time).toFixed(1)} s, ${avg((r) => r.after.hits).toFixed(1)} attacks;  after<before in ${rows.filter((r) => r.after.hits < r.before.hits).length}/12`);
  console.log(`  lowest life: attack ${(avg((r) => r.lowest.attack) * 100).toFixed(0)}%, need ${(avg((r) => r.lowest.need) * 100).toFixed(0)}%, after ${(avg((r) => r.lowest.after) * 100).toFixed(0)}%; knocked down ${avg((r) => r.ups).toFixed(1)} times`);
  console.log('  seconds per step: ' + Object.entries(rows[0].stageT).map(([k, v]) => `${k} ${v.toFixed(1)}`).join(', '));
}
