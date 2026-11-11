// THE SWAMP COLOSSUS'S SOUNDS (game/act1_rules/colossus.ts `sounds`, `wardSounds`, `died`; game.ts for his pillars and his hurt;
// game/sound_families.ts COLOSSUS_SOUND_NAMES, bossSound). The sound chat's fifth batch (25.3.1: his entrance whole, a tentacle
// bursting up, the water pouring off him, his roar) and its SEVENTH, THE REST OF HIS FIGHT (assets/sound/README.md; his word in the
// sound chat, 9 Nov 2026, shown them on its try-out 12: “All good, hand over (Recommended)”): his six set moves each one sound from
// its frame 0, at its own pitch and length (his waking, the bile arc, the gaze, the eye slam, his slide, his death), and each sound
// on its own where no set move covers it; in place of the stand-ins of 25.3.1 (the game's own slam, `colossus_slime`,
// `colossus_rise`, the old Eye's hurt and death).
//
// One fight is played through once, every sound the game asks for kept with the moment it was asked for; each test reads from that.
// @ts-ignore - node typings are not part of this project
import { test } from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import fs from 'node:fs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import type { Monster } from '../src/game/state';
import { BODY2, CHANGE3, COLOSSUS, ColossusFight, EYE3, HOOK, RAIN, SHOVEL, SLAM, SNAP, STONE, WAKE, stoneToWorld } from '../src/game/colossus_fight';
import { COLOSSUS_SOUND_NAMES, bossSound, soundsOf } from '../src/game/sound_families';
import { PILLARS } from '../src/game/quests610';

const DT = 1 / 60;
/** (25.3.5, as tsc asked: the game's own blow is private and takes who struck: -1, nobody's skill, as the game's traps strike) */
const hurt = (g: Game, m: Monster, dmg: number, crit: boolean): void => (g as unknown as { damageMonster(m: Monster, dmg: number, el: 'phys', crit: boolean, skill: number): void }).damageMonster(m, dmg, 'phys', crit, -1);
const near = (a: number, b: number, slack = 0.05): boolean => Math.abs(a - b) <= slack;

test('his sounds fetched ahead with floor 10, and only while he is its boss; each has its two takes in the game\'s files', () => {
  assert.equal(COLOSSUS.on, true);
  const on = soundsOf(['eye']);
  for (const n of COLOSSUS_SOUND_NAMES) {
    assert.ok(on.includes(n), `${n} fetched ahead`);
    for (const k of [1, 2]) assert.ok(fs.existsSync(`assets/sound/${n}_${k}.mp3`), `${n}_${k}.mp3`);
  }
  assert.equal(new Set(COLOSSUS_SOUND_NAMES).size, COLOSSUS_SOUND_NAMES.length, 'none twice');
  // (only what the game plays: the parts that are inside a set move's own sound are not fetched, nor those these take the place of)
  for (const n of ['boil', 'glow', 'retch', 'bile_splash', 'bile_pool', 'gaze_charge', 'gaze_beam', 'eye_slam', 'lunge', 'grip', 'pillar_kindle', 'death_seize', 'death_burst', 'death_melt', 'death_sink', 'smash', 'rise', 'slime']) {
    assert.ok(!(COLOSSUS_SOUND_NAMES as readonly string[]).includes(`colossus_${n}`), `colossus_${n} not fetched: not played`);
  }
  COLOSSUS.on = false;
  try {
    const off = soundsOf(['eye']);
    for (const n of COLOSSUS_SOUND_NAMES) assert.ok(!off.includes(n), `${n} not with the old Eye`);
    assert.deepEqual([bossSound('eye', 'roar'), bossSound('eye', 'hurt'), bossSound('eye', 'death')], ['eye_roar', 'eye_hurt', 'eye_death'], 'the old Eye: his own, as before');
  } finally {
    COLOSSUS.on = true;
  }
  // (the Colossus: his eye struck is his hurt; his death is his fight's own sound; the other bosses' as before)
  assert.deepEqual([bossSound('eye', 'roar'), bossSound('eye', 'hurt'), bossSound('eye', 'death')], ['eye_roar', 'colossus_eye_hurt', 'none']);
  assert.deepEqual([bossSound('stag', 'roar'), bossSound('stag', 'hurt'), bossSound('stag', 'death'), bossSound('wolf', 'roar')], ['stag_roar', 'stag_hurt', 'stag_death', undefined]);
});

// ---------------------------------------------------------------------------------------------------------------------------------
// THE FIGHT PLAYED THROUGH, ONCE

interface Heard {
  /** Seconds since the play began (the test's own clock: the fight's stops as he dies). */
  t: number;
  /** A recorded sound by its name (`!`: asked for at its own pitch and length), or one of the game's own (`sfx:<name>`). */
  name: string;
  vol: number;
}
interface Played {
  heard: Heard[];
  /** Moments of the fight, on the test's clock. */
  at: Record<string, number>;
  /** Each shovel hook's first frame; each snap's twitch. */
  hooks: number[];
  twitches: number[];
}

let played: Played | null = null;
function fight(): Played {
  if (played) return played;
  const g = new Game('warrior', 9);
  g.depth = 10;
  g.cleared = 9;
  g.enterDungeon();
  const L = g.level;
  const S = L.land!.stone!;
  const c = emptyControls();
  g.hero.x = L.land!.landing!.x;
  g.hero.y = L.land!.landing!.y;
  for (let i = 0; i < 180; i++) g.update(DT, c);
  const boss = g.monsters.find((m) => m.boss)!;
  const heard: Heard[] = [];
  const at: Record<string, number> = {};
  const hooks: number[] = [];
  const twitches: number[] = [];
  let clock = 0;
  let f: ColossusFight | undefined;
  let where = stoneToWorld(S, STONE.w / 2, 8);
  const mark = (k: string): void => {
    if (at[k] === undefined) at[k] = clock;
  };
  const hear = (): void => {
    for (const e of g.events) {
      if (e.t === 'rec') heard.push({ t: clock, name: e.exact ? `${e.name}!` : e.name, vol: e.vol ?? 1 });
      if (e.t === 'sfx') heard.push({ t: clock, name: `sfx:${e.name}`, vol: e.vol ?? 1 });
    }
    g.events.length = 0;
  };
  /** A step: the hero held where he is to stand, not to be hurt; what was done by hand before it heard too. */
  let was = { mode: '', ph: 0, body2: '', eye: '', shovel: false, snaps: 0, hooked: 0 };
  const step = (): void => {
    g.hero.x = where.x;
    g.hero.y = where.y;
    g.hero.life = g.hero.d.maxLife;
    g.hero.invuln = 0.5;
    hear();
    g.update(DT, c);
    clock += DT;
    f = f ?? (boss.a1 as { fight?: ColossusFight } | undefined)?.fight;
    hear();
    if (!f) return;
    const now = { mode: f.mode, ph: f.ph, body2: f.body2?.kind ?? '', eye: f.eye?.kind ?? '', shovel: !!f.shovel, snaps: f.shovel?.snaps ?? 0, hooked: f.shovel ? SHOVEL.hooks.filter((h) => f!.shovel!.t >= h.at).length : 0 };
    if (now.mode !== was.mode || now.ph !== was.ph) mark(`${now.mode}${now.ph}`);
    if (now.body2 && now.body2 !== was.body2) mark(`body2:${now.body2}`);
    if (now.eye && now.eye !== was.eye) mark(`eye:${now.eye}`);
    if (now.shovel && !was.shovel) mark('shovel');
    if (now.shovel && now.snaps > was.snaps) twitches.push(clock);
    if (now.shovel && now.hooked > was.hooked) hooks.push(clock);
    was = now;
  };
  const play = (secs: number, each?: () => void): void => {
    for (let i = 0; i < Math.round(secs / DT); i++) {
      if (each) each();
      step();
    }
  };
  const until = (cond: () => boolean, most: number, each?: () => void): void => {
    for (let i = 0; i < Math.round(most / DT) && !cond(); i++) {
      if (each) each();
      step();
    }
    assert.ok(cond(), 'the fight came to where the test waits for it');
  };
  const arms = (): Monster[] => g.monsters.filter((q) => q.kind === 'eye' && !q.boss && !q.dead);

  // PHASE 1: his waking, his two tentacles' slams
  play(11);
  assert.ok(f && f.mode === 'fight' && f.ph === 1, 'his fight begun');
  mark('kill1');
  for (const m of arms()) g.kill(m);
  // HIS ENTRANCE, INTO PHASE 2 (the stone's slams, the water's and his body's own held back, each let go in turn)
  until(() => f!.ph === 2 && f!.mode === 'fight', 20);
  const hold = (): void => {
    f!.shovelIn = 1e9;
    f!.waterIn = 1e9;
    f!.body2In = 1e9;
    f!.slamRounds = -1e9;
  };
  hold();
  play(2, hold);
  // (both tentacles' water slams at once: two waves, their crash)
  f!.waterNext = 'both';
  f!.waterIn = 0;
  mark('water');
  until(() => f!.crash !== null, 12, () => {
    f!.shovelIn = 1e9;
    f!.body2In = 1e9;
    f!.slamRounds = -1e9;
  });
  mark('crash');
  play(4, hold);
  // (the bile arc, then the gaze)
  f!.body2Next = 'bile';
  f!.body2In = 0;
  until(() => f!.body2?.kind === 'bile', 8, () => {
    f!.shovelIn = 1e9;
    f!.waterIn = 1e9;
    f!.slamRounds = -1e9;
  });
  until(() => f!.body2 === null, 8, hold);
  f!.body2In = 0;
  until(() => f!.body2?.kind === 'gaze', 8, () => {
    f!.shovelIn = 1e9;
    f!.waterIn = 1e9;
    f!.slamRounds = -1e9;
  });
  until(() => f!.body2 === null, 8, hold);
  // (his shovel: the hero by his maw as he gapes, to be snapped at)
  f!.shovelIn = 0;
  until(() => !!f!.shovel, 8, () => {
    f!.waterIn = 1e9;
    f!.body2In = 1e9;
    f!.slamRounds = -1e9;
  });
  until(() => !f!.shovel, 16, () => {
    hold();
    const sh = f!.shovel;
    if (sh && sh.t >= SHOVEL.gape[0]) where = stoneToWorld(S, sh.end === 'l' ? 1.2 : STONE.w - 1.2, 5);
  });
  mark('shovelEnd');
  where = stoneToWorld(S, STONE.w / 2, 8);
  play(2, hold);
  // HIS SLIDE, INTO PHASE 3
  mark('kill2');
  for (const m of arms()) g.kill(m);
  until(() => f!.ph === 3 && f!.mode === 'fight', 14);
  // (three blows at him, shielded, one after another; then his gaze, his eye slam and the siege's bolts)
  play(0.6);
  mark('pings');
  for (let i = 0; i < 3; i++) {
    hurt(g, boss, 50, true);
    step();
  }
  until(() => at['eye:gaze'] !== undefined && at['eye:slam'] !== undefined, 16);
  until(() => f!.eye === null, 4);
  // (his pillars: the first broken by blows at its foot, the others each put out by a piece set)
  const ps = g.level.pillars ?? [];
  assert.equal(ps.length, 3, 'his three pillars, burning');
  const hand = g as unknown as { pillarsStruck(x: number, y: number, rad: number): void; setPillarPiece(p: unknown): void };
  for (let i = 0; i < PILLARS.blows; i++) {
    hand.pillarsStruck(ps[0].x, ps[0].y, 0);
    play(PILLARS.gap + 0.05);
  }
  mark('toppled');
  hand.setPillarPiece(ps[1]);
  play(1.5);
  mark('lastSet');
  hand.setPillarPiece(ps[2]);
  play(2);
  // (his eye struck, a big blow; then killed)
  mark('struck');
  hurt(g, boss, boss.maxLife * 0.06, false);
  play(1);
  mark('killed');
  g.kill(boss);
  play(5);
  played = { heard, at, hooks, twitches };
  return played;
}

const named = (P: Played, name: string, from = -1, to = 1e9): Heard[] => P.heard.filter((h) => h.name === name && h.t >= from && h.t < to);

test('his waking is one sound from the first step onto the stone; his tentacles in it, not heard again; no rumble of its own', () => {
  const P = fight();
  const wake = named(P, 'colossus_wake!');
  assert.equal(wake.length, 1, 'his waking, once, at its own pitch and length');
  assert.ok(near(wake[0].t, P.at.fight1), `as his fight begins, the hero's first step onto the stone (${(wake[0].t - P.at.fight1).toFixed(2)} s)`);
  assert.equal(named(P, 'colossus_rise').length, 0, 'the fifth batch\'s rumble no more: his waking\'s sound in its place');
  assert.equal(named(P, 'colossus_tentacle', 0, P.at.fight1 + WAKE.rise + 1).length, 0, 'his two tentacles\' bursts are in his waking\'s sound');
});

test('a tentacle\'s slam: coiled back as its warning is laid, its slam on the stone 28 frames after, dragged back from frame 42; the game\'s own slam no more', () => {
  const P = fight();
  const slams = named(P, 'colossus_tentacle_slam', 0, P.at.kill1);
  assert.ok(slams.length >= 1, 'a slam in phase 1');
  for (const s of slams) {
    assert.ok(named(P, 'colossus_tentacle_coil').some((h) => near(s.t - h.t, SLAM.hit)), `coiled ${SLAM.hit.toFixed(2)} s before its slam at ${s.t.toFixed(2)}`);
    assert.ok(named(P, 'colossus_tentacle_drag').some((h) => near(h.t - s.t, SLAM.drag - SLAM.hit)), 'dragged back after');
  }
  assert.equal(named(P, 'sfx:slam').length, 0, 'the game\'s own slam nowhere in his fight');
  assert.equal(named(P, 'colossus_slime').length, 0, 'nor the fifth batch\'s slime');
});

test('a tentacle killed: its own death, each; his entrance one sound, its tentacles not heard again', () => {
  const P = fight();
  assert.equal(named(P, 'colossus_tentacle_death', P.at.kill1 - 0.01, P.at.kill1 + 0.1).length, 2, 'phase 1\'s two');
  assert.equal(named(P, 'colossus_tentacle_death', P.at.kill2 - 0.01, P.at.kill2 + 0.1).length, 3, 'phase 2\'s three');
  const ent = named(P, 'colossus_entrance!');
  assert.equal(ent.length, 1, 'his entrance, one sound, at its own pitch and length (timed to the frames)');
  assert.ok(near(ent[0].t, P.at.change1), 'as his change begins');
  assert.equal(named(P, 'colossus_tentacle', P.at.change1, P.at.fight2 + 1).length, 0, 'its tentacles in its own sound, not again');
});

test('the water slams: coiled, the slam on the water and its wave together, the two waves\' crash', () => {
  const P = fight();
  const sl = named(P, 'colossus_water_slam', P.at.water, P.at.crash + 0.1);
  assert.equal(sl.length, 2, 'both at once (heard as one: the same sound within a moment is played once)');
  assert.ok(near(sl[0].t, sl[1].t, 1e-6));
  assert.ok(named(P, 'colossus_tentacle_coil').some((h) => near(sl[0].t - h.t, SLAM.hit)), 'coiled back before it');
  assert.equal(named(P, 'colossus_wave', P.at.water, P.at.crash + 0.1).filter((h) => near(h.t, sl[0].t, 1e-6)).length, 2, 'a wave rolling from each');
  const cr = named(P, 'colossus_wave_crash');
  assert.equal(cr.length, 1, 'their crash, once');
  assert.ok(near(cr[0].t, P.at.crash), 'as they meet');
});

test('his body\'s attacks in phase 2: the bile arc and the gaze each one sound from its warning; no parts on top', () => {
  const P = fight();
  const bile = named(P, 'colossus_bile!');
  assert.equal(bile.length, 1);
  assert.ok(near(bile[0].t, P.at['body2:bile']), 'from frame 0 of the bile arc');
  const gaze = named(P, 'colossus_gaze!', 0, P.at.kill2);
  assert.equal(gaze.length, 1);
  assert.ok(near(gaze[0].t, P.at['body2:gaze']), 'from frame 0 of the gaze');
  for (const n of ['colossus_retch', 'colossus_bile_splash', 'colossus_bile_pool', 'colossus_gaze_charge', 'colossus_gaze_beam']) assert.equal(named(P, n).length, 0, `${n} is in the whole`);
  // (the bile's splash still lands when the sound says: frame 49 of the arc)
  assert.ok(near(BODY2.bile.land, 49 / 30, 1e-9));
});

test('his shovel: his burst and his roar; a scrape as each hook reaches the stone; his jaws flexing, then his snap; his tentacles back up', () => {
  const P = fight();
  const s0 = P.at.shovel;
  const burst = named(P, 'colossus_burst');
  assert.equal(burst.length, 1);
  assert.ok(near(burst[0].t - s0, SHOVEL.burst), 'as he bursts up at the stone\'s end');
  assert.ok(named(P, 'colossus_roar').some((h) => near(h.t, burst[0].t, 1e-6)), 'his roar with it');
  assert.equal(named(P, 'colossus_pour', s0, P.at.shovelEnd).length, 0, 'the water pouring off him no more there: his burst in its place');
  const scr = named(P, 'colossus_tentacle_scrape');
  assert.equal(scr.length, 4, 'four hooks');
  assert.equal(P.hooks.length, 4);
  scr.forEach((h, i) => assert.ok(near(h.t - P.hooks[i], HOOK.scrape[0]), `hook ${i + 1}: as it begins to scrape`));
  const growls = named(P, 'colossus_growl');
  const snaps = named(P, 'colossus_snap');
  assert.ok(P.twitches.length >= 1 && growls.length === P.twitches.length && snaps.length === P.twitches.length, `a growl and a snap for each of his ${P.twitches.length} snaps`);
  growls.forEach((h, i) => {
    assert.ok(near(h.t, P.twitches[i]), 'his jaws flexing as he twitches');
    assert.ok(near(snaps[i].t - h.t, SNAP.shut), 'slammed shut 7 frames after');
  });
  const up = named(P, 'colossus_tentacle', s0, P.at.shovelEnd + 0.1);
  assert.equal(up.length, 3, 'his three tentacles bursting up again with him');
  assert.ok(near(up[0].t - s0, SHOVEL.armsUp));
});

test('his slide: one sound from its frame 0, the water pouring off him under it; his grip and his pillars\' kindling in it', () => {
  const P = fight();
  const slide = named(P, 'colossus_slide!');
  assert.equal(slide.length, 1);
  assert.ok(near(slide[0].t - P.at.change2, CHANGE3.slide), `as his slide begins (${(slide[0].t - P.at.change2).toFixed(2)} s into the change)`);
  const pour = named(P, 'colossus_pour');
  assert.equal(pour.length, 1, 'the water pouring off him once');
  assert.ok(near(pour[0].t, slide[0].t, 1e-6));
  assert.equal(named(P, 'sfx:thunder').length, 0, 'no thunder as his pillars blaze: their kindling is in his slide\'s sound');
  // (the frames the sound was made to: his grip at 103, his pillars at 122, 127 and 132 of the slide, his ward on at 132)
  assert.ok(near(CHANGE3.grip - CHANGE3.slide, 103 / 30, 1e-9));
  assert.deepEqual(EYE3.kindle.map((k) => Math.round((CHANGE3.long - CHANGE3.slide + k) * 30)), [122, 127, 132]);
  assert.equal(Math.round((CHANGE3.long - CHANGE3.slide + EYE3.ward) * 30), 132);
});

test('his ward: its hum as it comes on; a blow glancing off it, not each of a flurry; its breaking as the last pillar goes out', () => {
  const P = fight();
  const on = named(P, 'colossus_ward_on');
  assert.equal(on.length, 1);
  assert.ok(near(on[0].t - P.at.fight3, EYE3.ward), `${EYE3.ward.toFixed(2)} s into phase 3`);
  assert.equal(named(P, 'colossus_ward_ping', P.at.pings, P.at.pings + 0.3).length, 1, 'three blows in three frames: one ping');
  const br = named(P, 'colossus_ward_break');
  assert.equal(br.length, 1);
  assert.ok(br[0].t - P.at.lastSet > 3 / 30 && br[0].t - P.at.lastSet < 6 / 30, `from 4 frames after the last pillar goes out (${((br[0].t - P.at.lastSet) * 30).toFixed(1)})`);
  assert.equal(named(P, 'colossus_ward_ping', P.at.lastSet).length, 0, 'no ward to glance off after');
});

test('his pillars: one toppled on its last blow, the others each a piece set; the game\'s stand-ins no more', () => {
  const P = fight();
  const top = named(P, 'colossus_pillar_topple');
  assert.equal(top.length, 1);
  assert.ok(top[0].t < P.at.toppled && P.at.toppled - top[0].t < PILLARS.gap + 0.1, 'on the twelfth blow');
  assert.equal(named(P, 'colossus_pillar_set').length, 2);
  assert.equal(named(P, 'sfx:power', P.at.fight3).length + named(P, 'sfx:hit', top[0].t - 0.01, top[0].t + 0.1).length, 0);
});

test('phase 3: his gaze and his eye slam each one sound from its warning; a siege bolt as it strikes; his eye struck, his own hurt', () => {
  const P = fight();
  const gaze = named(P, 'colossus_gaze!', P.at.fight3);
  assert.ok(gaze.length >= 1 && near(gaze[0].t, P.at['eye:gaze']), 'the gaze, the same sound as phase 2\'s');
  const slam = named(P, 'colossus_eyeslam!');
  assert.ok(slam.length >= 1 && near(slam[0].t, P.at['eye:slam']), 'the eye slam from its frame 0');
  assert.equal(named(P, 'colossus_eye_slam').length, 0, 'its slam alone is in the whole');
  const bolts = named(P, 'colossus_bolt');
  assert.ok(bolts.length >= 3, 'the siege\'s bolts');
  assert.ok(near(bolts[0].t - P.at.fight3, RAIN.every + RAIN.warn, 0.1), 'as the first strike, frame 33 of their fall');
  assert.equal(named(P, 'colossus_bolt', P.at.lastSet + RAIN.warn + 0.5).length, 0, 'none once the siege is broken');
  assert.equal(named(P, 'colossus_eye_hurt', P.at.struck, P.at.killed).length, 1, 'his eye struck');
  assert.equal(named(P, 'eye_hurt').length, 0, 'not the old Eye\'s hurt');
});

test('his death: one sound from the killing blow, his last roar in it; not the old Eye\'s death, no burst of the game\'s own', () => {
  const P = fight();
  const death = named(P, 'colossus_death!');
  assert.equal(death.length, 1);
  assert.ok(near(death[0].t, P.at.killed), 'as the killing blow lands');
  assert.equal(named(P, 'eye_death').length + named(P, 'sfx:explode', P.at.killed).length, 0);
  assert.equal(named(P, 'colossus_roar', P.at.killed).length, 0, 'no roar apart: it is in his death\'s sound, at frame 64');
});
