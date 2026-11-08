// ACT 1: THE SWAMP COLOSSUS, the Drowned Eye redone (floor 10's boss, behind game/colossus_fight.ts COLOSSUS): his fight in the
// game. The fight itself, what hurts and when, is game/colossus_fight.ts (`ColossusFight`); here it is run on floor 10: he is the
// floor's boss (kind 'eye', as the Drowned Eye was), at his place in the water off the stone; his tentacles are monsters of their
// own (of his kind, `a1.arm` naming which), struck and killed as any is; his fight is kept on him (`a1.fight`) and stepped with
// him. Its blows land on the hero with his own blow's weight (BossRules.blow); his knocks shove the hero as a shove does (Hero.step,
// stopped by the water's edge). His life bar is his phase's: in phases 1 and 2 his tentacles' life together, he himself not
// reached; in phase 3 his own (his tentacles beside it). The flasks are refilled between phases (his “flasks reset in between each
// phase for now”). What is drawn is render/act1_fx/colossus.ts (stand-ins until the art chat's pictures are baked).

import { MONSTERS, MSG, TUNE } from '../defs';
import type { BossRules } from '../bosses';
import type { Level, Monster } from '../state';
import type { Act1Rules } from './types';
import { RULES as EYE_RULES } from './eye';
import { ARM, CHANGE3, COLOSSUS, ColossusFight, FORWARD, HIS_PLACE, LIFE, SHOVEL, STONE, eyeHome, onStone, rootAt, stoneToWorld, worldToStone } from '../colossus_fight';
import type { FightEvent, StoneAt } from '../colossus_fight';
import type { Game } from '../game';

/** What is kept on him: the fight; which of his tentacles is which monster. On a tentacle: which of the fight's it is. */
export interface ColossusOn {
  fight?: ColossusFight;
  /** The fight's tentacle id, on a tentacle; and the fight it is of. */
  arm?: number;
  armOf?: ColossusFight;
  /** His tentacles' monsters, by the fight's id. */
  arms?: Record<number, number>;
}
export function colossusOn(m: Monster): ColossusOn {
  if (!m.a1) m.a1 = {};
  return m.a1 as unknown as ColossusOn;
}

function stoneOf(L: Level): StoneAt | null {
  return L.land?.stone ?? null;
}

/** Him (the boss, who keeps the fight). */
export function colossusOf(g: Game): Monster | null {
  return g.monsters.find((q) => q.kind === 'eye' && !q.dead && (q.a1 as ColossusOn | undefined)?.fight) ?? null;
}

/** Where his body is now: at his place, or at an end as he gapes there in his shovel. */
function bodyWhere(S: StoneAt, f: ColossusFight): { x: number; y: number } {
  // (phase 3: slid forward, his eye before him, or lying where it slammed down: where blows reach him)
  if (f.ph === 3 && f.mode === 'fight') {
    const at = f.bodyStruck()?.at ?? eyeHome();
    return stoneToWorld(S, at.u, at.v);
  }
  if (f.ph === 2 && f.mode === 'change') {
    const k = Math.min(1, f.phT / CHANGE3.long);
    return stoneToWorld(S, HIS_PLACE.u, HIS_PLACE.v + (eyeHome().v - HIS_PLACE.v) * k);
  }
  const sh = f.shovel;
  if (sh && sh.t >= SHOVEL.burst && sh.t < SHOVEL.back + 0.47) return stoneToWorld(S, sh.end === 'l' ? -SHOVEL.out : STONE.w + SHOVEL.out, STONE.d / 2);
  return stoneToWorld(S, HIS_PLACE.u, HIS_PLACE.v);
}

function handle(R: BossRules, m: Monster, S: StoneAt, ev: readonly FightEvent[]): void {
  const g = R.g;
  const h = g.hero;
  const me = colossusOn(m);
  const f = me.fight!;
  for (const e of ev) {
    switch (e.t) {
      case 'hurt': {
        R.blow(m, e.mult);
        if ((e.du || e.dv) && h.life > 0) {
          const o = stoneToWorld(S, 0, 0);
          const to = stoneToWorld(S, e.du, e.dv);
          h.step = { dx: to.x - o.x, dy: to.y - o.y, t: Math.max(0.05, e.secs) };
        }
        break;
      }
      case 'armUp': {
        const a = f.arms.find((q) => q.id === e.id);
        if (!a) break;
        me.arms = me.arms ?? {};
        const old = me.arms[e.id] !== undefined ? g.monsters.find((q) => q.id === me.arms![e.id]) : undefined;
        if (old && !old.dead) break;
        const p = stoneToWorld(S, rootAt(a.u).u, rootAt(a.u).v);
        const t = g.spawn('eye', p.x, p.y, -1, 0, false, g.rng);
        // (its phase's share of a bar: raised as he changes, the next phase's)
        const ph = f.mode === 'change' ? ((f.ph + 1) as 2 | 3) : f.ph;
        t.maxLife = Math.max(1, Math.round(m.maxLife * LIFE[ph]));
        t.life = t.maxLife;
        t.r = ARM.r;
        t.fx = -Math.SQRT1_2;
        t.fy = -Math.SQRT1_2;
        colossusOn(t).arm = e.id;
        colossusOn(t).armOf = f;
        t.state = 'chase';
        me.arms[e.id] = t.id;
        break;
      }
      case 'flasks':
        h.potions = TUNE.potionMax;
        g.msg('Flasks refilled', MSG.life);
        break;
      case 'change':
        m.life = m.maxLife;
        break;
      case 'phase':
        m.life = m.maxLife;
        break;
      default:
        break;
    }
    if (e.t === 'slam' || e.t === 'smash') g.emit({ t: 'shake', amount: e.t === 'slam' ? 8 : 6 });
    if (e.t === 'burst') g.emit({ t: 'shake', amount: 9 });
    if (e.t === 'snap') g.emit({ t: 'shake', amount: 10 });
    if (e.t === 'crash') g.emit({ t: 'shake', amount: 7 });
  }
}

/** HIS RULES, the fight on: his and his tentacles'. */
export const COLOSSUS_RULES: Act1Rules = {
  gait: EYE_RULES.gait,
  acts: [],
  acting: () => {},

  bossAt(L: Level) {
    const S = stoneOf(L);
    if (!S) return null;
    const p = stoneToWorld(S, HIS_PLACE.u, HIS_PLACE.v);
    return { x: p.x, y: p.y, fx: Math.SQRT1_2, fy: Math.SQRT1_2 };
  },

  seenBy: () => true,

  // (a tentacle as the fight says it can be struck now: standing, slamming; not under the water, nor dying; his body in phase 3
  // only, the pillars out, where he is)
  reachable(m) {
    const me = m.a1 as ColossusOn | undefined;
    if (!me) return false;
    if (me.arm !== undefined) {
      const a = me.armOf?.arms.find((q) => q.id === me.arm);
      return !!(me.armOf && a && me.armOf.armStruck(a));
    }
    return !!me.fight?.bodyStruck();
  },

  tick(R, m, dt) {
    const g = R.g;
    const S = stoneOf(g.level);
    const me = colossusOn(m);
    // (a tentacle: its fight's arm, kept where its root is; nothing of its own)
    if (me.arm !== undefined) return true;
    if (!S) return true;
    if (!me.fight) me.fight = new ColossusFight(g.rng);
    const f = me.fight;
    const h = g.hero;
    const p = worldToStone(S, h.x, h.y);
    if (f.mode === 'idle') {
      if (!onStone(p)) return true;
      handle(R, m, S, f.begin());
    }
    f.shielded = false;
    // (what is drawn of his fight hangs on one peril kept by the hero, so that it is drawn wherever he is: render/act1_fx/colossus.ts)
    let fp = g.perils.find((q) => q.kind === 'act1' && q.a1 === 'eye:fight');
    if (!fp) fp = R.peril(m, 'act1', h.x, h.y, { a1: 'eye:fight', dur: 1e9 });
    fp.x = h.x;
    fp.y = h.y;
    handle(R, m, S, f.step(dt, { u: p.u, v: p.v, dodging: h.invuln > 0 }));
    // (his tentacles' life together, his bar in phases 1 and 2)
    if (f.ph < 3 || f.mode !== 'fight') {
      let left = 0;
      let all = 0;
      for (const a of f.arms) {
        const t = me.arms?.[a.id] !== undefined ? g.monsters.find((q) => q.id === me.arms![a.id]) : undefined;
        if (!t) continue;
        all += t.maxLife;
        left += t.dead ? 0 : t.life;
      }
      if (all > 0 && f.mode === 'fight') m.life = Math.max(1, (m.maxLife * left) / all);
    }
    const at = bodyWhere(S, f);
    m.x = at.x;
    m.y = at.y;
    m.r = f.ph === 3 ? FORWARD.r : MONSTERS.eye.radius;
    return true;
  },

  lifeFloor(R, m) {
    const f = (m.a1 as ColossusOn | undefined)?.fight;
    if ((m.a1 as ColossusOn | undefined)?.arm !== undefined) return 0;
    return f && f.ph === 3 && f.mode === 'fight' ? 0 : 1;
  },

  died(R, m) {
    const me = m.a1 as ColossusOn | undefined;
    if (!me) return;
    const boss = colossusOf(R.g);
    const f = boss ? colossusOn(boss).fight : undefined;
    if (me.arm !== undefined) {
      if (f && boss) {
        const S = stoneOf(R.g.level);
        if (S) handle(R, boss, S, f.armKilled(me.arm));
      }
      return;
    }
    if (me.fight) me.fight.bodyKilled();
  },
};

/** Floor 10's boss: the Drowned Eye's rules, or (COLOSSUS on) the Swamp Colossus's. */
export const EYE_OR_COLOSSUS: Act1Rules = new Proxy({} as Act1Rules, {
  get: (_t, k: string | symbol) => (COLOSSUS.on ? (COLOSSUS_RULES as unknown as Record<string | symbol, unknown>)[k] : (EYE_RULES as unknown as Record<string | symbol, unknown>)[k]),
  has: (_t, k: string | symbol) => k in (COLOSSUS.on ? COLOSSUS_RULES : EYE_RULES),
});
