// A crude automatic player, used only for testing: it lets the game be played end to end without
// a person, in the headless tests and in browser screenshots. It is not part of the game.

import { FIRST_WORD, SKILLS } from '../game/defs';
import type { Game } from '../game/game';
import { placedAim } from '../game/lock';
import { flowDir, flowField, lineOfSight } from '../game/nav';
import type { Controls, Monster } from '../game/state';
import { WORD_IDS } from '../game/types';

export interface BotState {
  flow: Uint16Array | null;
  flowT: number;
  goalX: number;
  goalY: number;
  step: number;
  /** The sleeping monster currently being walked to (kept until it wakes or dies, to avoid dithering). */
  goalId: number;
  /** Slot spare words and wear spare gear as they turn up. */
  gearUp: boolean;
  /** Step out of attacks that show a warning on the ground, as any person would. */
  dodge: boolean;
}

export function newBot(gearUp = true, dodge = true): BotState {
  return { flow: null, flowT: 0, goalX: -1, goalY: -1, step: 0, goalId: -1, gearUp, dodge };
}

export function botStep(g: Game, c: Controls, st: BotState, dt: number): void {
  think(g, c, st, dt);
  if (!st.dodge) return;
  // An attack is about to land where the hero stands: walk straight out of it.
  const h = g.hero;
  for (const z of g.zones) {
    if (z.kind !== 'warn') continue;
    const dx = h.x - z.x;
    const dy = h.y - z.y;
    const d = Math.hypot(dx, dy);
    if (d > z.r + 0.5) continue;
    if (d < 0.05) {
      c.mx = 1;
      c.my = 0;
    } else {
      c.mx = dx / d;
      c.my = dy / d;
    }
    return;
  }
}

function think(g: Game, c: Controls, st: BotState, dt: number): void {
  const h = g.hero;
  const L = g.level;
  const f = L.floor;
  st.step++;
  c.mx = 0;
  c.my = 0;
  c.fire = false;
  c.cast = false;
  c.hold = false;
  c.evade = false;
  c.potion = false;
  c.interact = false;
  c.approach = false;

  if (h.pending > 0) g.chooseAttr((['str', 'dex', 'int'] as const)[(h.level + st.step) % 3]);
  if (st.gearUp && st.step % 30 === 0) {
    for (const w of WORD_IDS) {
      if (h.words[w] <= 0) continue;
      // the character's first word goes where the first dungeon suggests; any other, into the first free place
      const first = FIRST_WORD[h.cls];
      if (w === first.word && g.socket(first.skill, 'front', w) === null) continue;
      for (let s = 0; s < 2; s++) {
        if (g.socket(s, 'front', w) === null) break;
        if (g.socket(s, 'behind', w) === null) break;
      }
    }
    for (let i = 0; i < h.bag.length; i++) {
      const it = h.bag[i];
      if (!it) continue;
      const slot = g.slotFor(it);
      if (slot && !h.gear[slot]) g.equipFromBag(i);
    }
  }

  // nearest monster that is awake
  let target: Monster | null = null;
  let best = 1e9;
  for (const m of g.monsters) {
    if (m.dead || m.state === 'sleep') continue;
    const d = Math.hypot(m.x - h.x, m.y - h.y);
    if (d < best) {
      best = d;
      target = m;
    }
  }

  const walkTo = (gx: number, gy: number): void => {
    st.flowT -= dt;
    if (!st.flow || st.flowT <= 0 || Math.hypot(gx - st.goalX, gy - st.goalY) > 1.5) {
      st.flowT = 0.5;
      st.goalX = gx;
      st.goalY = gy;
      // (where the floor has ledges, the way goes round by the stairs: game/height.ts)
      st.flow = flowField(L.walk, f.w, f.h, Math.floor(gx), Math.floor(gy), Infinity, st.flow ?? undefined, L.step);
    }
    const v = flowDir(st.flow, L.walk, f.w, f.h, h.x, h.y, undefined, L.step);
    c.mx = v.x;
    c.my = v.y;
  };

  if (target && best < 14) {
    const basic = SKILLS[h.skills[0].id];
    const area = SKILLS[h.skills[1].id];
    const melee = basic.kind === 'melee';
    const sees = lineOfSight(L.open, f.w, f.h, h.x, h.y, target.x, target.y, f.cut ?? null);
    c.aimX = target.x;
    c.aimY = target.y;
    // (near enough for the quick attack to get there: a wave fades after a short way)
    const want = melee ? 1.1 + target.r : Math.min(5.5, basic.range * 0.7);
    if (best > want || !sees) walkTo(target.x, target.y);
    else if (!melee && best < 3) {
      c.mx = -(target.x - h.x) / best;
      c.my = -(target.y - h.y) / best;
    }
    if (sees && (melee ? best < 2 + target.r : true)) c.fire = true;
    // (a slam must be beside its enemies; a trap is tossed, an orb set down, a beam fired from where the hero stands)
    const areaReach = area.kind === 'burst' || area.kind === 'whirl' ? 2.6 : 7;
    if (sees && best < areaReach) {
      // (a volley is put where the enemy is going, as a player soon learns to and auto aim does)
      const at = placedAim(g, target, area.kind);
      c.cast = true;
      c.castX = at.x;
      c.castY = at.y;
      // (an attack that goes on while held is held for as long as there is something to hold it on)
      c.hold = true;
    }
    // (the ranger's roll leaves a trap where it begins: with something at their heels, they roll
    // away from it, and it walks onto the trap. Version 12.2.)
    const dodge = SKILLS[h.skills[2].id];
    if (dodge.kind === 'roll' && dodge.dmg > 0 && best < 2.4 && h.skills[2].charges > 0) {
      c.evade = true;
      c.evadeX = h.x - (target.x - h.x) * 3;
      c.evadeY = h.y - (target.y - h.y) * 3;
    }
    if (h.life < h.d.maxLife * 0.45) {
      c.potion = true;
      if (st.step % 45 === 0) {
        c.evade = true;
        c.evadeX = h.x - (target.x - h.x) * 3;
        c.evadeY = h.y - (target.y - h.y) * 3;
      }
    }
    return;
  }

  // nothing to fight: go and find something
  const portal = L.portal;
  if (L.town) {
    // (a person uses the gate's panel; the bot just steps through)
    // (the gate is in the town's back wall: it is used from the floor before it)
    const gate = L.stations.find((s) => s.kind === 'gate');
    if (gate) walkTo(gate.x, gate.y);
    if (g.stationNear() === 'gate') g.enterDungeon();
    return;
  }
  let goal: { x: number; y: number } | null = null;
  const kept = g.monsters.find((m) => m.id === st.goalId && !m.dead && !m.boss);
  // a character's first dungeon: the fallen wordsmith comes first (walking over them searches the satchel)
  const body = L.body && L.body.state === 0 ? L.body : null;
  if (body) goal = body;
  else if (kept) goal = kept;
  else {
    let gd = 1e9;
    for (const m of g.monsters) {
      if (m.dead || m.boss) continue;
      const d = Math.hypot(m.x - h.x, m.y - h.y);
      if (d < gd) {
        gd = d;
        goal = m;
        st.goalId = m.id;
      }
    }
  }
  if (!goal && g.boss) goal = g.boss;
  if (!goal && portal) {
    goal = { x: portal.x, y: portal.y + 0.8 };
    c.interact = g.interactHint() !== null;
  }
  if (goal) walkTo(goal.x, goal.y);
}
