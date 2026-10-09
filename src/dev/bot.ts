// A crude automatic player, used only for testing: it lets the game be played end to end without
// a person, in the headless tests and in browser screenshots. It is not part of the game.

import { FIRST_WORD, SKILLS, TUNE, firstWordSkill } from '../game/defs';
import type { Game } from '../game/game';
import { placedAim } from '../game/lock';
import { UNREACHABLE, flowDir, flowField, lineOfSight } from '../game/nav';
import type { Controls, Monster } from '../game/state';
import { SPIKE, onHazard, slotMouth, spikeAt } from '../game/traps';
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
  /** (THE MIX) With a gate down: how far every tile is from the hero by the way one walks, and when it was last worked out. */
  reach?: Uint16Array | null;
  reachT?: number;
}

export function newBot(gearUp = true, dodge = true): BotState {
  return { flow: null, flowT: 0, goalX: -1, goalY: -1, step: 0, goalId: -1, gearUp, dodge };
}

export function botStep(g: Game, c: Controls, st: BotState, dt: number): void {
  think(g, c, st, dt);
  // (THE TRAPS, as a person soon learns them: it does that whether or not it steps out of attacks)
  minded(g, c);
  if (!st.dodge) return;
  // An attack is about to land where the hero stands: walk straight out of it.
  const h = g.hero;
  for (const z of g.zones) {
    // (THE MONSTERS' ATTACKS: the line a red troll will charge along: out of it, sideways)
    if (z.kind === 'lane') {
      const x1 = z.x1 ?? z.x;
      const y1 = z.y1 ?? z.y;
      const len = Math.hypot(x1 - z.x, y1 - z.y) || 1;
      const ux = (x1 - z.x) / len;
      const uy = (y1 - z.y) / len;
      const along = (h.x - z.x) * ux + (h.y - z.y) * uy;
      const across = (h.x - z.x) * -uy + (h.y - z.y) * ux;
      if (along < -0.5 || along > len + 0.5 || Math.abs(across) > z.r + 0.6) continue;
      const side = across >= 0 ? 1 : -1;
      c.mx = -uy * side;
      c.my = ux * side;
      return;
    }
    // (THE NEW MONSTERS: a Golem's skull, coming down where its shadow is, is stepped out of as a warning is)
    if (z.kind === 'skull' && z.t >= z.dur) continue;
    if (z.kind !== 'warn' && z.kind !== 'skull') continue;
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
      if (w === first.word && g.socket(firstWordSkill(h.cls), 'front', w) === null) continue;
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

  // (THE MIX) A GATE THAT IS DOWN SHUTS OFF WHAT IS BEHIND IT: the nearest monster by the straight
  // line may be one there is no way to, and a player who walked at it would stand at a wall for
  // good. So while any gate is down, only what can be come to is gone for: a field of distances
  // from where the hero stands says what that is. (And when nothing that can be come to is left,
  // the lever: below.)
  let reach: Uint16Array | null = null;
  if (L.doors.some((d) => d.spot.kind !== 'door' && d.want === 0)) {
    st.reachT = (st.reachT ?? 0) - dt;
    if (!st.reach || st.reachT <= 0) {
      st.reachT = 0.5;
      st.reach = flowField(L.walk, f.w, f.h, Math.floor(h.x), Math.floor(h.y), Infinity, st.reach ?? undefined, L.step);
    }
    reach = st.reach;
  } else st.reach = null;
  const canReach = (o: { x: number; y: number }): boolean => !reach || reach[Math.floor(o.y) * f.w + Math.floor(o.x)] !== UNREACHABLE;

  // nearest monster that is awake
  let target: Monster | null = null;
  let best = 1e9;
  for (const m of g.monsters) {
    if (m.dead || m.state === 'sleep' || !canReach(m)) continue;
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
  const kept = g.monsters.find((m) => m.id === st.goalId && !m.dead && !m.boss && canReach(m));
  // a character's first dungeon: the fallen wordsmith comes first (walking over them searches the satchel)
  const body = L.body && L.body.state === 0 ? L.body : null;
  if (body) goal = body;
  else if (kept) goal = kept;
  else {
    let gd = 1e9;
    for (const m of g.monsters) {
      if (m.dead || m.boss || !canReach(m)) continue;
      const d = Math.hypot(m.x - h.x, m.y - h.y);
      if (d < gd) {
        gd = d;
        goal = m;
        st.goalId = m.id;
      }
    }
  }
  // (THE MIX) nothing left that can be come to, and a lever not yet pulled: go and pull it (walking up to it does)
  if (!goal && reach) {
    for (const p of L.props) {
      if (p.kind !== 'lever' || p.state !== 0) continue;
      for (const [dx, dy] of [[0, 1], [1, 0], [0, -1], [-1, 0]]) {
        const tx = p.tx + dx;
        const ty = p.ty + dy;
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h || L.walk[ty * f.w + tx] !== 1 || reach[ty * f.w + tx] === UNREACHABLE) continue;
        goal = { x: tx + 0.5, y: ty + 0.5 };
        break;
      }
      if (goal) break;
    }
  }
  if (!goal && g.boss && canReach(g.boss)) goal = g.boss;
  if (!goal && portal) {
    goal = { x: portal.x, y: portal.y + 0.8 };
    c.interact = g.interactHint() !== null;
  }
  if (goal) walkTo(goal.x, goal.y);
}

/**
 * (THE TRAPS, game/traps.ts) WHAT A PLAYER SOON LEARNS OF THEM. A SPIKE FLOOR: it is not stepped
 * onto while its spikes are up, or will be before it is crossed (the bot waits at its edge); one
 * stood on as its spikes are about to rise is got off. A DART WALL: once its plate has clicked,
 * the hero steps across the darts' line, out of the way of where they are going. (A sealed vault
 * needs nothing: what is shut in it cannot be come to, and is not gone for.)
 */
function minded(g: Game, c: Controls): void {
  const L = g.level;
  if (L.hazards.length === 0) return;
  const h = g.hero;
  const f = L.floor;
  for (const z of L.hazards) {
    const s = z.spot;
    if (s.kind === 'darts') {
      const flying = g.projectiles.some((p) => p.trap);
      if ((z.left <= 0 && !flying) || Math.hypot(h.x - z.aimX, h.y - z.aimY) > 1.3) continue;
      const o = slotMouth(s);
      let dx = z.aimX - o.x;
      let dy = z.aimY - o.y;
      const n = Math.hypot(dx, dy) || 1;
      dx /= n;
      dy /= n;
      // (across the line, to the side with the more floor beside the place they fly at: chosen from that place, which does not move, so it is not changed its mind about)
      const room = (side: number): number => {
        let n = 0;
        for (const r of [0.8, 1.6]) {
          const tx = Math.floor(z.aimX - dy * side * r);
          const ty = Math.floor(z.aimY + dx * side * r);
          if (tx >= 0 && ty >= 0 && tx < f.w && ty < f.h && L.walk[ty * f.w + tx] === 1) n++;
          else break;
        }
        return n;
      };
      const side = room(1) >= room(-1) ? 1 : -1;
      if (room(side) === 0) continue;
      c.mx = -dy * side;
      c.my = dx * side;
      return;
    }
    const { at, k } = spikeAt(s, g.time);
    // (how long it takes to cross, and how long until its spikes rise)
    const cross = (Math.max(s.w, s.h) + 1) / TUNE.heroSpeed + 0.15;
    const toRise = at === 'down' ? (1 - k) * SPIKE.down + SPIKE.warn : 0;
    if (at === 'down' && toRise >= cross) continue;
    if (onHazard(s, h.x, h.y)) {
      // (on it as they are about to rise: off, the way it was going, or else straight away from its middle)
      if (c.mx === 0 && c.my === 0) {
        const mx = h.x - (s.x + s.w / 2);
        const my = h.y - (s.y + s.h / 2);
        const m = Math.hypot(mx, my) || 1;
        c.mx = mx / m;
        c.my = my / m;
      }
      continue;
    }
    if (onHazard(s, h.x + c.mx * 0.75, h.y + c.my * 0.75)) {
      c.mx = 0;
      c.my = 0;
    }
  }
}

