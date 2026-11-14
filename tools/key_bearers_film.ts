// THE KEY-BEARERS' MOVES (art/key_bearers.ts), frame by frame, as a picture's pixels: for a strip or a film of one move.
//   node node_modules/tsx/dist/cli.mjs tools/key_bearers_film.ts <knife|flame> <move> <front|back> <fps> [from] [to] > /tmp/f.json
// <move>: stand, walk, attack, reel, die, or one of its others by name (leap, throw; fan, ring).
import { KEY_BLADE, KEY_FLAME } from '../src/art/key_bearers';
import { deathOfMob, paintMob } from '../src/art/new_mobs3';
const [who = 'knife', move = 'attack', view = 'front', fpsS = '15', fromS, toS] = process.argv.slice(2);
const mob = who === 'flame' ? KEY_FLAME : KEY_BLADE;
const fps = Number(fpsS);
const long = move === 'die' ? mob.dieTime : move === 'stand' ? mob.idleFrames / mob.idleFps : move === 'walk' ? mob.walkFrames / mob.walkFps : move === 'reel' ? mob.reelTime : (() => {
  const mv = move === 'attack' ? mob.attack : mob.more![move];
  const ks = mv.motion.keys;
  return ks[ks.length - 1].at;
})();
const t0 = fromS ? Number(fromS) : 0;
const t1 = toS ? Number(toS) : long;
const can = mob.canvas!;
const out: { t: number; w: number; h: number; ax: number; ay: number; px: (string | null)[] }[] = [];
for (let i = 0; ; i++) {
  const t = t0 + i / fps;
  if (t > t1 + 1e-6) break;
  const p = move === 'die' ? deathOfMob(mob, t / mob.dieTime, view as 'front').px : paintMob(mob, move, t, view as 'front').px;
  const px: (string | null)[] = [];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) px.push(p.get(x, y));
  out.push({ t, w: p.w, h: p.h, ax: can.ax, ay: can.ay, px });
}
console.log(JSON.stringify(out));
