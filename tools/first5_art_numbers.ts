// THE NUMBERS THE RULES TAKE FROM THE FIRST FIVE FLOORS' PICTURES (the bosses, the cultists): printed,
// for game/bosses.ts and game/defs.ts; tests/first5_bosses.test.ts holds the rules' own equal to them.
//   npx tsx tools/first5_art_numbers.ts
import { AMALGAM, AM_BURST_AT, AM_BURST_SPOT, AM_BURST_WAY, AM_DEVOUR_HIT, AM_DIE_TIME, AM_SLAM_HIT, AM_SLAM_SPOTS, AM_SWARM_HIT, AM_SWARM_SPEED, AM_SWIPE_HIT, BB_BITE_HIT, BB_DIE_TIME, BB_EMERGE_TIME, BONE_BEAST, CHAINED, CHAINED_FREED, CO_BALL_BACK, CO_BALL_LAND, CO_BALL_LET, CO_BALL_REACH, CO_BREAK_TIME, CO_DIE_TIME, CO_HOOK_BACK, CO_HOOK_BITE, CO_HOOK_LET, CO_HOOK_REACH, CO_LASH_HIT, CO_SNAP_BALL, CO_SNAP_L, CO_WHIRL_FROM, CO_WHIRL_TO, FLOOR_ARM_SINK, FLOOR_ARM_TIME, FLOOR_ARM_UP, HEADSMAN, HS_CATCH, HS_CHOP_HIT, HS_DIE_TIME, HS_RAISE, HS_SENTENCE_HIT, HS_SWEEP_FROM, HS_SWEEP_TO, HS_THROW_HIT, amRakeAt, amSwarmSkulls, amSwipeAt, coBallPath, coHookPath, coWhirlReach, hsBite, hsSweepReach } from '../src/art/bosses3';
import { DAGGER_CULTIST, KNIFE_BLOW, KNIFE_DIES, MINI_DIES, MINI_FIRE, MINI_FIRE_SIZE, MINI_FM, MINI_HALT, MINI_RAISE, MINI_REEL, MINI_SET_OFF, miniFireTurn } from '../src/art/cultists';
import { FLESHMANCER, FM_DEATH, FM_FIRE, FM_HALT, FM_RAISE, FM_REEL, FM_RINGS, FM_SET_OFF, FM_SHARDS, fmFireTurn, fmSkullAt } from '../src/art/fleshmancer';
import { TILE3, handAt } from '../src/art/new_mobs3';
import type { Mob } from '../src/art/new_mobs3';

const r = (v: number, n = 3): number => Math.round(v * 10 ** n) / 10 ** n;
const tiles = (p: readonly number[]): number[] => [r(p[0] / TILE3), r(p[1] / TILE3), r(p[2] / 2)];
const lastKey = (mob: Mob, which: string): number => {
  const mv = which === 'attack' ? mob.attack : which === 'reel' ? mob.reel : which === 'dying' ? mob.dying : which === 'stand' ? mob.stand : mob.more?.[which];
  const keys = mv?.motion.keys ?? [];
  return keys.length ? r(keys[keys.length - 1].at) : NaN;
};
const gait = (mob: Mob): Record<string, number> => ({ pace: mob.pace, walkFrames: mob.walkFrames, walkFps: mob.walkFps, idleFrames: mob.idleFrames, idleFps: mob.idleFps, setOff: lastKey(mob, 'setOff'), halt: lastKey(mob, 'halt'), reel: lastKey(mob, 'reel'), die: mob.dieTime });
const longs = (mob: Mob): Record<string, number> => Object.fromEntries(['attack', ...Object.keys(mob.more ?? {})].map((k) => [k, lastKey(mob, k)]));

console.log('TILE3', TILE3);
console.log('HEADSMAN gait', gait(HEADSMAN), 'raise', HS_RAISE, 'longs', longs(HEADSMAN));
console.log('  chop hit', HS_CHOP_HIT, 'bite', tiles(hsBite('attack')));
console.log('  sentence hit', HS_SENTENCE_HIT, 'bite', tiles(hsBite('sentence')));
console.log('  sweep', HS_SWEEP_FROM, HS_SWEEP_TO, 'reach', r(hsSweepReach() / TILE3));
console.log('  throw', HS_THROW_HIT, HS_CATCH, 'from', tiles(handAt(HEADSMAN, 'throw', HS_THROW_HIT - 0.02, 'R')), 'to', tiles(handAt(HEADSMAN, 'throw', HS_CATCH, 'R')));
console.log('  die', HS_DIE_TIME);
console.log('CHAINED gait', gait(CHAINED), 'longs', longs(CHAINED), 'freed1', longs(CHAINED_FREED[1]), 'freed2', longs(CHAINED_FREED[2]));
console.log('  lash hit', CO_LASH_HIT, 'hand at hit', tiles(handAt(CHAINED, 'attack', CO_LASH_HIT, 'R')));
console.log('  hook', CO_HOOK_LET, CO_HOOK_BITE, CO_HOOK_BACK, 'reach', CO_HOOK_REACH);
for (const t of [1.2, 1.3, 1.4, 1.52, 1.8, 2.2, 2.59]) console.log('    hook at', t, coHookPath(t)?.at.map((v) => r(v)), coHookPath(t)?.flying);
console.log('  whirl', CO_WHIRL_FROM, CO_WHIRL_TO, 'reach', r(coWhirlReach() / TILE3));
console.log('  ball', CO_BALL_LET, CO_BALL_LAND, CO_BALL_BACK, 'reach', CO_BALL_REACH);
for (const t of [1.78, 2.0, 2.22, 2.6, 3.0, 3.25]) console.log('    ball at', t, coBallPath(t)?.at.map((v) => r(v)), coBallPath(t)?.flying);
console.log('  break', CO_SNAP_L, CO_SNAP_BALL, CO_BREAK_TIME, 'die', CO_DIE_TIME);
console.log('AMALGAM gait', gait(AMALGAM), 'longs', longs(AMALGAM));
console.log('  swipe hit', AM_SWIPE_HIT);
for (const t of [0.6, 0.7, 0.76, 0.82, 0.88, 0.95, 1.05]) console.log('    swipe hand at', t, tiles(amSwipeAt(t)));
console.log('  slam', AM_SLAM_HIT, AM_SLAM_SPOTS.map((p) => tiles(p)), 'arm', FLOOR_ARM_UP, FLOOR_ARM_SINK, FLOOR_ARM_TIME);
console.log('  swarm', AM_SWARM_HIT, 'speed', AM_SWARM_SPEED);
for (const k of amSwarmSkulls()) console.log('    skull from', tiles(k.at), 'way', k.way.map((v) => r(v)), 'after', r(k.after));
console.log('  devour', AM_DEVOUR_HIT);
for (const t of [0.92, 1.1, 1.3, 1.56]) console.log('    rake at', t, tiles(amRakeAt(t).R1), tiles(amRakeAt(t).L1));
console.log('  burst', AM_BURST_AT, 'spot', tiles(AM_BURST_SPOT), 'way', AM_BURST_WAY.map((v) => r(v)), 'die', AM_DIE_TIME);
console.log('BEAST gait', gait(BONE_BEAST), 'longs', longs(BONE_BEAST), 'bite', BB_BITE_HIT, 'emerge', BB_EMERGE_TIME, 'die', BB_DIE_TIME);
console.log('FLESHMANCER gait', gait(FLESHMANCER), 'longs', longs(FLESHMANCER), FM_SET_OFF, FM_HALT, FM_REEL, FM_DEATH);
console.log('  shards', FM_SHARDS, 'skull at spit', tiles(fmSkullAt('attack', FM_SHARDS.hit)));
console.log('  rings', FM_RINGS, 'raise', FM_RAISE, 'fire', FM_FIRE);
for (const t of [0.56, 0.62, 1, 1.5, 2, 2.5, 3, 3.5, 3.9]) console.log('    fire turn at', t, r(fmFireTurn(t)));
console.log('DAGGER gait', gait(DAGGER_CULTIST), 'longs', longs(DAGGER_CULTIST), KNIFE_BLOW, KNIFE_DIES);
console.log('MINI gait', gait(MINI_FM), 'longs', longs(MINI_FM), MINI_SET_OFF, MINI_HALT, MINI_REEL, MINI_DIES);
console.log('  fire', MINI_FIRE, MINI_FIRE_SIZE, 'raise', MINI_RAISE);
for (const t of [0.57, 0.6, 1, 1.35, 1.7, 2.1]) console.log('    mini fire turn at', t, r(miniFireTurn(t)));
