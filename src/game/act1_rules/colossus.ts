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
import { ARM, CHANGE3, COLOSSUS, ColossusFight, DEATH, EYE3, FORWARD, HIS_PLACE, LIFE, SHOVEL, STONE, eyeHome, onStone, rootAt, stoneToWorld, worldToStone } from '../colossus_fight';
import { QUESTS610, pillarsBurning } from '../quests610';
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
  /** (Phase 3) His life as last seen (a drop: his eye struck, and when, the fight's time); when his ward last turned a blow (game.ts),
   *  and when it broke (the fight's time: the last pillar out). */
  life0?: number;
  hitAt?: number;
  wardHit?: number;
  wardOff?: number;
  /** (His ward's sounds) The blow whose glancing off it was last heard (its `wardHit`); its breaking heard. */
  wardHeard?: number;
  wardBroke?: boolean;
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
    const k = Math.max(0, Math.min(1, (f.phT - CHANGE3.slide) / (CHANGE3.long - CHANGE3.slide)));
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
    // (HIS SOUNDS: the sound chat's fifth batch, made for his entrance, 25.3.1, and its seventh, the rest of his fight:
    // assets/sound/README.md)
    sounds(g, f, e);
    if (e.t === 'slam' || e.t === 'smash') g.emit({ t: 'shake', amount: e.t === 'slam' ? 8 : 6 });
    if (e.t === 'burst') g.emit({ t: 'shake', amount: 9 });
    if (e.t === 'snap') g.emit({ t: 'shake', amount: 10 });
    // (phase 3, the art's shakes: his grip on the stone's edge as he hauls himself up; his eye slammed down)
    if (e.t === 'grip') g.emit({ t: 'shake', amount: 7 });
    if (e.t === 'eyeSlam') g.emit({ t: 'shake', amount: 9 });
    if (e.t === 'rain') g.emit({ t: 'shake', amount: 3 });
    if (e.t === 'crash') g.emit({ t: 'shake', amount: 7 });
    // (his body's own attacks, the art's shakes: the retch, the bile's splash, the gaze's beam firing)
    if (e.t === 'retch') g.emit({ t: 'shake', amount: 4 });
    if (e.t === 'bile') g.emit({ t: 'shake', amount: 8 });
    if (e.t === 'gaze') g.emit({ t: 'shake', amount: 9 });
  }
}

/**
 * HIS SOUNDS. The sound chat's fifth batch (7 Nov 2026, “All good, hand over (Recommended)”; played from 25.3.1): his whole entrance
 * as one sound from its first frame; a tentacle bursting up; the water pouring off him; his roar. And its SEVENTH, THE REST OF HIS
 * FIGHT (9 Nov 2026, shown them on its try-out 12, his pick: “All good, hand over (Recommended)”; assets/sound/README.md, "Seventh
 * batch"), in place of the stand-ins of 25.3.1 (the game's own slam; `colossus_slime` at his snap, his retch and his eye slam;
 * `colossus_rise` at his waking; `colossus_pour` at his shovel's burst; `colossus_roar` at his death's last roar).
 *
 * HIS SET MOVES, EACH ONE SOUND FROM ITS FRAME 0, at its own pitch and length (`exact`), so that everything in it lands on the art's
 * frames, as his entrance does: his waking, from the hero's first step onto the stone (the still water, the boil, his eye's glow,
 * his two tentacles bursting up at 4.2 s: they are not heard again on their own); the bile arc (the retch at 27, the splash at
 * 49, the pool hissing); the gaze, phase 2's and phase 3's (the beam on at 27); the eye slam (the slam at 28, dragged back from
 * 66); his slide (three lunges, his grip at 103, the three pillars kindling at 122, 127 and 132; the water pouring off him, the
 * fifth batch's, still under it: his slide's own sound has none); his death, from the killing blow (`died` below: his last roar
 * is in it, at 64).
 *
 * EACH SOUND ON ITS OWN, where no set move covers it. A tentacle: coiled back as its warning is laid (a slam on the stone or on
 * the water), its slam on the stone, dragged back off it (the fight's `drag`), its slam on the water and the wave rolling from
 * it, the two waves crashing, one killed. His shovel: his burst and his roar; each hook scraping along the stone (the fight's
 * `scrape`); his jaws flexing as he twitches, and his snap. Phase 3: a siege bolt as it strikes; his ward's hum, a blow glancing
 * off it and its breaking (`tick` below); a piece set into a pillar and a pillar toppled (game.ts); his eye struck, his hurt
 * (game.ts, by a boss's rule: a big blow, now and then). Where one has not come yet, the game's own slam stands in as before.
 * (Fetched ahead as his floor is come into: game/sound_families.ts COLOSSUS_SOUND_NAMES.)
 */
function sounds(g: Game, f: ColossusFight, e: FightEvent): void {
  switch (e.t) {
    case 'phase':
      if (e.ph === 1) g.rec('colossus_wake', 1, undefined, true);
      break;
    case 'armUp':
      // (phase 1's are in his waking's sound, the three of his entrance in its: only those that come back up with him after a shovel)
      if (f.ph !== 1) g.rec('colossus_tentacle', 0.9);
      break;
    case 'change':
      // (at its own pitch and length: timed by the sound chat to the art's frames, the roar on 117)
      if (e.to === 2) g.rec('colossus_entrance', 1, undefined, true);
      break;
    case 'slide':
      g.rec('colossus_pour', 1);
      g.rec('colossus_slide', 1, undefined, true);
      break;
    // ---- his tentacles and the water
    case 'warn':
    case 'smashWarn':
      g.rec('colossus_tentacle_coil', 0.8);
      break;
    case 'slam':
      g.rec('colossus_tentacle_slam', 1, 'slam');
      break;
    case 'drag':
      g.rec('colossus_tentacle_drag', 0.7);
      break;
    case 'smash':
      g.rec('colossus_water_slam', 1, 'slam');
      g.rec('colossus_wave', 0.9);
      break;
    case 'crash':
      g.rec('colossus_wave_crash', 1);
      break;
    case 'armDies':
      g.rec('colossus_tentacle_death', 0.9);
      break;
    // ---- his shovel
    case 'burst':
      g.rec('colossus_burst', 1);
      g.rec('colossus_roar', 1);
      break;
    case 'scrape':
      g.rec('colossus_tentacle_scrape', 0.8);
      break;
    case 'twitch':
      g.rec('colossus_growl', 0.9);
      break;
    case 'snap':
      g.rec('colossus_snap', 1);
      break;
    // ---- his body's and his eye's attacks, each whole from its warning
    case 'bileWarn':
      g.rec('colossus_bile', 1, undefined, true);
      break;
    case 'gazeWarn':
      g.rec('colossus_gaze', 1, undefined, true);
      break;
    case 'eyeWarn':
      g.rec('colossus_eyeslam', 1, undefined, true);
      break;
    // ---- the siege's bolts (three fall at once: heard as one)
    case 'rain':
      g.rec('colossus_bolt', 0.8);
      break;
    default:
      break;
  }
}

/**
 * HIS WARD'S SOUNDS (phase 3, the seventh batch), as it is drawn (render/act1_fx/colossus_fx.ts drawColossusWard): its hum coming on
 * `EYE3.ward` into the phase, as his last pillar kindles (frame 132 of his slide); a blow glancing off it, no more than one each
 * `ping` seconds; its breaking, from `breaks` seconds after the last pillar goes out (the art's 4 to 28 frames: the sound is that
 * long).
 */
const WARD_SOUND = { ping: 0.45, breaks: 4 / 30 } as const;
function wardSounds(g: Game, f: ColossusFight, me: ColossusOn, dt: number): void {
  if (f.ph !== 3) return;
  if (f.mode === 'fight' && f.shielded && f.phT >= EYE3.ward && f.phT - dt < EYE3.ward) g.rec('colossus_ward_on', 1);
  if (me.wardHit !== undefined && me.wardHit !== me.wardHeard && (me.wardHeard === undefined || me.wardHit - me.wardHeard >= WARD_SOUND.ping)) {
    me.wardHeard = me.wardHit;
    g.rec('colossus_ward_ping', 0.8);
  }
  if (me.wardOff !== undefined && !me.wardBroke && f.time - me.wardOff >= WARD_SOUND.breaks) {
    me.wardBroke = true;
    g.rec('colossus_ward_break', 1);
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
    // THE CULT'S THREE OBELISKS, the pillars of his phase 3, where the art stands them (off the stone's two ends, in the water, and off
    // its near edge at the jetty's head: floor 10's own piece, render/act1_pieces.ts draws it by its name); solid in the water, the near
    // one leaving the jetty to walk
    const W = L.floor.w;
    EYE3.pillars.forEach(([u, v], i) => {
      const { x, y } = stoneToWorld(S, u, v);
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx < 0 || ty < 0 || tx >= W || ty >= L.floor.h) return;
      if (L.props.some((q) => q.kind === 'piece' && q.name === "the cult's obelisk" && q.tx === tx && q.ty === ty)) return;
      L.props.push({ kind: 'piece', name: "the cult's obelisk", tx, ty, x, y, solid: i < 2, state: 0, variant: 0 });
    });
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
    // (phase 3: the cult's pillars blaze as it begins, at the art's feet (off the stone's two ends and its near edge); while one burns
    // his ward holds (blows at him turned away: game.ts) and the siege's bolts fall; with the last out, his ward breaks)
    if (f.ph === 3 && f.mode === 'fight' && QUESTS610.on && !g.level.pillars && !g.practice) g.pillarsLightAt(EYE3.pillars.map(([u, v]) => stoneToWorld(S, u, v)));
    const burning = pillarsBurning(g.level.pillars);
    f.shielded = f.ph === 3 && burning > 0;
    f.siege = !g.level.pillars || burning > 0;
    if (f.ph === 3 && g.level.pillars && burning === 0 && me.wardOff === undefined) me.wardOff = f.time;
    // (his eye struck: his life dropped)
    if (f.ph === 3 && f.mode === 'fight' && me.life0 !== undefined && m.life < me.life0) {
      f.eyeHit();
      me.hitAt = f.time;
    }
    me.life0 = m.life;
    // (a pillar broken by blows topples into the water: its obelisk gone once it has fallen; render/act1_fx/colossus_fx.ts draws it falling)
    for (const pl of g.level.pillars ?? []) {
      if (pl.by !== 'blows' || pl.outAt === undefined || g.time - pl.outAt < 14 / 30) continue;
      const i = g.level.props.findIndex((q) => q.kind === 'piece' && q.name === "the cult's obelisk" && Math.hypot(q.x - pl.x, q.y - pl.y) < 0.01);
      if (i >= 0) g.level.props.splice(i, 1);
    }
    // (what is drawn of his fight hangs on one peril kept by the hero, so that it is drawn wherever he is: render/act1_fx/colossus.ts)
    let fp = g.perils.find((q) => q.kind === 'act1' && q.a1 === 'eye:fight');
    if (!fp) fp = R.peril(m, 'act1', h.x, h.y, { a1: 'eye:fight', dur: 1e9 });
    fp.x = h.x;
    fp.y = h.y;
    handle(R, m, S, f.step(dt, { u: p.u, v: p.v, dodging: h.invuln > 0 }));
    wardSounds(g, f, me, dt);
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
    // (HIS DEATH'S SOUND, the seventh batch: whole from the killing blow, at its own pitch and length: his eye seizing, the burst at 36,
    // his last roar at 64, the melt from 96, the sink from 176; in place of the old Eye's death, game/sound_families.ts bossSound)
    if (me.fight) R.g.rec('colossus_death', 1, undefined, true);
    // (his death plays out on the peril his fight is drawn by, its own clock from the killing blow: render/act1_fx/colossus.ts)
    const fp = R.g.perils.find((q) => q.kind === 'act1' && q.a1 === 'eye:fight');
    if (fp) {
      fp.a = 1;
      fp.c = fp.t;
    }
  },

  hittable(_R, m) {
    // (his bar comes up as his first tentacles stand, after his waking)
    const f = colossusOn(m).fight;
    return !!f && f.mode !== 'idle' && f.wakeT === null && f.arms.some((a) => a.state !== 'rise');
  },

  peril(R, p, dt) {
    // HIS DEATH: kept by the hero while it plays; the screen shaken at its beats; gone when it is done
    if (p.a1 !== 'eye:fight' || p.a !== 1) return;
    const g = R.g;
    p.x = g.hero.x;
    p.y = g.hero.y;
    const s = p.t - p.c;
    for (const [f, amount] of DEATH.shakes) if (s >= f / 30 && s - dt < f / 30 + 1e-9) g.emit({ t: 'shake', amount });
    // (his last roar is in his death's own sound, begun as he is killed: `died` above)
    if (s >= DEATH.long) p.dur = p.t;
  },
};

/** Floor 10's boss: the Drowned Eye's rules, or (COLOSSUS on) the Swamp Colossus's. */
export const EYE_OR_COLOSSUS: Act1Rules = new Proxy({} as Act1Rules, {
  get: (_t, k: string | symbol) => (COLOSSUS.on ? (COLOSSUS_RULES as unknown as Record<string | symbol, unknown>)[k] : (EYE_RULES as unknown as Record<string | symbol, unknown>)[k]),
  has: (_t, k: string | symbol) => k in (COLOSSUS.on ? COLOSSUS_RULES : EYE_RULES),
});
