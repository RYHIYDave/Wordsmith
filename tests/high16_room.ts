// ACT 2, PART TWO, THE HIGH CITY: WHAT THE TESTS OF FLOOR 16'S KINDS SHARE (tests/act2_swan.test.ts, act2_palace_hands.test.ts,
// act2_pguard.test.ts). Not a test file. Until floor 16's own map-maker is in (game/act2/swangardens.ts), its floor is not laid
// by the stand-in; so their long fight is in the practice room (tests/act1_kinds_room_c.ts `room`'s), as a pack of them would
// come at the hero: laid round him as one pack (a pack's number, so that a crowd of the gardeners and grooms comes mixed).

import { RNG } from '../src/engine/rng';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import type { ClassId, MonsterKind } from '../src/game/types';

interface Hooks {
  waveT: number;
  wakeUp(m: Monster): void;
}

/**
 * A LONG FIGHT in the practice room: `n` of a kind laid round the hero as one pack, 3 to 6 tiles off, awake; he walks round,
 * swings at the nearest and dodges now and then for `secs`, his life put back. Returns what they did (every act begun, by
 * kind), how many fell, and the pack as laid. Throws if anything in the game does.
 */
export function roomFight(kind: MonsterKind, n: number, secs: number, seed = 3, cls: ClassId = 'warrior'): { g: Game; them: Monster[]; acts: Set<string>; fell: number } {
  const g = Game.forPractice(cls, 5);
  const hooks = g as unknown as Hooks;
  hooks.waveT = 1e9;
  g.monsters.length = 0;
  const h = g.hero;
  const spots = g.spotsRound(h.x, h.y, 30).filter((s) => {
    const d = Math.hypot(s.x - h.x, s.y - h.y);
    return d > 3 && d < 6;
  });
  const rng = new RNG(seed);
  const them: Monster[] = [];
  for (let i = 0; i < n && i < spots.length; i++) {
    const s = spots[Math.floor((i * spots.length) / n)];
    const m = g.spawn(kind, s.x, s.y, 77, 0, false, rng);
    hooks.wakeUp(m);
    m.words = [];
    them.push(m);
  }
  g.events.length = 0;
  const acts = new Set<string>();
  const c = emptyControls();
  for (let k = 0; k < Math.round(secs * 60); k++) {
    const t = k / 60;
    Object.assign(c, emptyControls());
    const live = g.monsters.filter((m) => !m.dead);
    const near = live.sort((a, b) => Math.hypot(a.x - h.x, a.y - h.y) - Math.hypot(b.x - h.x, b.y - h.y))[0];
    // (he walks round a while, then stands and swings at the nearest; now and then he dodges)
    if (Math.floor(t / 3) % 2 === 0) {
      c.mx = Math.cos(t * 0.8);
      c.my = Math.sin(t * 0.8);
    } else if (near) {
      c.fire = true;
      c.aimX = near.x;
      c.aimY = near.y;
    }
    if (k % 233 === 100) {
      c.evade = true;
      c.evadeX = h.x - h.fx * 3;
      c.evadeY = h.y - h.fy * 3;
    }
    g.update(1 / 60, c);
    h.life = h.d.maxLife;
    for (const m of g.monsters) if (m.act) acts.add(m.act.id);
    g.events.length = 0;
    if (g.over) break;
  }
  return { g, them, acts, fell: them.filter((m) => m.dead).length };
}
