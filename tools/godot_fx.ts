// THE GODOT PORT: THE GAME'S OWN PICTURES OF WHAT ITS MOVES MARK ON THE FLOOR AND THROW UP, as films (the cloud chat, 15 Nov
// 2026). Each is painted here by the game's own painter (art/*_fx.ts), frame by frame, as render/act1_fx/*.ts asks for them,
// and packed into sheets for godot/scripts/perils.gd to play in place of a stand-in drawing:
//   npx tsx tools/godot_fx.ts        -> godot/assets/fx/fx.json, fx-<set>-0.png, ... (a set: the films of one kind of
//                                       monster, on sheets of their own, loaded only on a floor that has it)
// A FILM: its frames at `fps`, in layers as the game lays them: `floor` (on the floor, under the figures), `behind` and
// `before` (among the figures, just behind and just before one standing at its middle). Every picture in picture pixels (two
// to a game pixel), cut to what is painted of it, the same picture kept once; `pics`: [sheet, x, y, w, h, ox, oy], (ox, oy)
// where its top left corner lies from the film's floor point.
//   brute_ring   the green troll's slam (art/action_f3_fx.ts ringPainted; render/act1_fx/brute.ts): the dent and its cracks,
//                the ring going out over the floor; the flash, the dust and the chips flung up. 1.6 s.
//   co_ring_<r>  the Chained One's rings (art/chained_action_fx.ts ringPainted; render/act1_fx/chained.ts): the whirl's (3.5
//                tiles), the ball's (2.5), the hammer's (1.5). 1.6 s each.
//   co_crack_<w> his lash's crack, run along way w of the sixteen round (crackPainted). 1.8 s each.
//   co_hook_<v>  his hook, seen from in front or from behind (art/bosses3.ts makeHookShotArt; render/bossfx.ts): 8 pictures of
//                it tumbling in flight, and a ninth of it lying, dragged (layer `stand`; the game picks one by its clock).
//   co_ball_<v>  his ball: 8 pictures of it turning in flight, the first of it also lying (makeBallShotArt).
//   co_left_<w>_<v>  what a broken chain left lying, as he was seen then: his left chain (0), his ball and its chain (1)
//                (makeLeftBehindArt: one picture, layer `floor`).
//   am_ring_<r>  the Ossuary Amalgamation's slam rings (art/amalgam_action_fx.ts slamRingPainted; render/act1_fx/amalgam.ts):
//                the bone rain's (3.2 tiles) and the floor arms' (2.8).
//   am_drop_<s>  a skull of its rain, by its seed (0 to 7; dropPainted): its shadow and its mark from the second before it
//                lands (`k0` frames before the film's 0), its burst and its scuff after.
//   am_skull     the skull itself, tumbling (makeRainSkullArt: 8 pictures, layer `air`; the game picks one by its clock).
//   am_arm       the arms of the dead burst up out of a hole (makeBigArmArt: 13 frames at 10 a second, layer `stand`).
//   am_arm_crack the floor cracking open where they will burst up, glowing, and dark round the hole after (art/boss_shots.ts
//                drawArmCrack, the game's own painter, painted here onto a canvas of the game's pixels): from 0.5 s before
//                they burst to 0.8 s after they are gone.
//   fm_pit       the pit under the Fleshmancer as he is yanked down (art/fleshmancer_action_fx.ts paintSinkPit;
//                render/act1_fx/fm.ts). 1 s.
//   fm_rise      where he will rise: its ring of fire filling in from a second before (floor), then the burst as he erupts
//                (`before`: among the figures, before him) (paintRiseMark).
//   fm_heap_<i>  a bone heap as he raises his dead from it, the i'th of his call: lit from under and cracking as it shakes,
//                bursting as its dead comes up (paintHeap: floor, and `before`).
//   fm_hand_<k>  a hand of his dead bursting up out of a ring, of kind k (art/fleshmancer.ts makeRingHandArt: 24 frames at
//                20 a second, layer `stand`; the game stands each at its own place round the ring).
//   fm_death_floor  the Fleshmancer's death, brought up to par (art/fm2_fx.ts drawDeathFloor, the game's own painter, painted
//                here onto a canvas of the game's pixels; render/act1_fx/fm.ts): his light bursting out over the floor in a
//                ring, the floor cracking out from under him, lit, going dark. 3.4 s. fm_death_pillar: his power going up
//                out of the pit in a pillar of his fire, and gone in motes (drawDeathPillar: layer `air`, over the dark;
//                from 2.25 s into his death). `tables.fm_death_hands`: where and when each of the twelve hands of his dead
//                comes up round him ([tiles east, tiles south, seconds, which hand]: deathHands).
//   sigil_<r>    the cultist's fire sigil (art/action_f2_fx.ts sigilPainted; render/act1_fx/cultist.ts), 1.75 tiles round, and
//                the Flame keybearer's great one (2.5): the ring traced round and filling on the floor, the pillar of fire and
//                its embers, the floor burning on. Its time 0 is 1.04 s before the eruption (SIGIL.delay): what stands of it
//                only from the eruption.
//   rime         the Shade's rime (rimePainted; render/act1_fx/shade.ts): spreading, lying, melting in. 4 s.
//   rain_<v>     the bone archer's arrow rain, seen from in front or from behind (art/action_f1_fx.ts rainPainted;
//                render/act1_fx/archer.ts): the ring filling with the shadows of falling arrows, the arrows coming down and
//                standing in the stones. 2.35 s. rain_rise_<v>: what the archer loosed flying up over it (layer `stand`).
//   kb_knife     the Knife keybearer's thrown knife, an eighth of a turn over each (art/key_bearers_fx.ts knifeSprite: 8
//                pictures, layer `stand`; the game picks one by its clock: render/act1_fx/keybearers.ts). kb_ball: a ball of
//                the Flame's fire, flickering (fireBallSprite: 4). kb_key: the temple door's key, a quarter turn over each as
//                it tumbles, the first of it lying (keySprite: 4). kb_tongue_<h>: a tongue of his ring's fire, h game pixels
//                high (1 to 16), flickering (ringTongue: 4 each).
//   st_rake_<v>  the Stoker's fire, seen from in front or from behind (art/stoker_fx.ts fxPainted, as render/act1_fx/stoker.ts
//                paints it afresh fifteen times a second; its floor point his, as his act began): his rake's arc marked, the
//                sheet of fire springing up behind the blade and burning. st_ring_<v>: his furnace's ring marked, rolling out
//                with its three gaps, the floor it passed scorched. st_blast_<v>: his death's blast on the floor under him.
//   st_coal_<i>  one of his seven coals where it comes down (coalsFloor, each painted alone, its floor point its own spot):
//                its spot marked, its fire burning and dying to a scorch. Its time his act's. st_lump_<i>: the coal itself
//                in the air (coalInAir: one picture, layer `stand`, its middle the floor point).
//   st_gear      the crank's gear lying where it fell, glinting (art/stoker_room.ts gearDropped: 8 pictures at 8 a second,
//                layer `stand`).
//   lock_shadow_<w>  the Warden's Lockdown (art/action_f1_fx.ts lockShadowPainted, lockBarsPainted; render/act1_fx/warden.ts):
//                one tile of a row of bars, along the floor's x way or its y way: its shadow on the floor from a second before
//                the crash, darker and pink-edged as it comes. lock_bars_<w>_<wear>: its bars crashing down, standing as a
//                cage and rising away (four wears; layer `stand`; the game stands one on every floor tile of every row).
//   smoke        the high priest's burning smoke (art/mob_shots.ts drawBurningSmoke, the game's own painter, painted here
//                onto a canvas of the game's pixels): billowing, burning and thinning away. 3 s.
//   tg_port_<k>  the town's gate's portcullis, the k'th strip of it, at each of its heights from down to up (art/gates.ts
//                portcullis, 2 game pixels apart; layer `stand`, one picture for each height). tg_bars_<k>: the bars across it
//                (art/town_ways.ts gateBars). tg_unbar_<k>: the bars struck off (unbarFilm: 78 frames at 30 a second, the last
//                what is left of them at its foot). `tables.tg`: where each strip stands, its jolts.
//   ms_stone     the Meldstone hanging, turning to and fro (art/meld_drops.ts: 24 pictures, its round at 12 a second);
//                ms_apart, ms_whole: spinning, torn apart and fused (16 steps of its turn); ms_burst: its light as it slams
//                together; ms_crack: the crack of its light in the floor before it bursts up (6, shut to open). Stills, stood
//                as the game's riseOf and takenOf say (godot/scripts/loot.gd).
//   qg_smash     the quarry golem's boulder smashing (art/action_f6_golem.ts smashPainted; render/act1_fx/qgolem.ts): the
//                flash, the ring of dust, the floor cracked, its rock flung out and lying, crumbling. 1.6 s. qg_quake: the
//                floor its hammer's fists crack, the ring of dust and the chips (the same painter's `quake`).
//   fp_mark      the reach of the firepot thrower's burst marked where its pot will come down, filling as it comes (art/
//                action_f6_fx.ts markRing: 25 pictures, a 24th of its flight each, layer `floor`); fp_shadow: the pot's shadow
//                under it, growing (potShadowPainted, the same); fp_pot_<v>: the pot itself, tumbling (makeFlyingPotArt: 8
//                pictures, layer `stand`); fp_blaze: its burst and the floor burning after (blazePainted). 5.6 s.
//   ch_ring      the chanter's ring where its lightning will strike, crackling from its aim, scorched after (art/action_f6_cult.ts
//                ringPainted; render/act1_fx/chanter.ts); ch_static: the static round the hero it struck (staticPainted, layer
//                `air`); ch_ward: its ward at the feet of each it shields (art/act1_cultists.ts chantWard: 4 pictures, 8 a second).
//   dv_swirl     the dust devil's twister (art/action_f6_canyon.ts swirlPainted and layTwisterBolts; render/act1_fx/devil.ts):
//                the sand swirling in, its reach, where each bolt will strike and the bolts thrown out. 5.2 s.
//   sc_pool      the canyon scorpion's acid where its glob comes down (poolPainted): its reach marked from 0.8 s before, the
//                splash, the pool lying and hissing, its fumes, shrinking away. sc_shadow: the glob's shadow (globShadowPainted,
//                21 pictures, a 20th of its flight each).
// A film's `k0`: the frame its first picture is, counted from the film's own time 0 (less than 0: it begins before it).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { toSprite } from '../src/art/kit';
import { RING as F3_RING, RING_CANVAS, ringPainted as f3Ring } from '../src/art/action_f3_fx';
import { CRACK, CRACK_CANVAS, RING as CO_RING, crackPainted, ringCanvas, ringPainted as coRing } from '../src/art/chained_action_fx';
import { BIG_ARM_FPS, BIG_ARM_FRAMES, BIG_ARM_TIME, DROP_CANVAS, RAIN, RAIN_SKULL_FRAMES, SLAM_RING, dropPainted, makeBigArmArt, makeRainSkullArt, slamRingCanvas, slamRingPainted } from '../src/art/amalgam_action_fx';
import { ARM_CRACK_AFTER, ARM_CRACK_WARN, drawArmCrack } from '../src/art/boss_shots';
import { BALL_SHOT_FRAMES, HOOK_SHOT_FRAMES, makeBallShotArt, makeHookShotArt, makeLeftBehindArt } from '../src/art/bosses3';
import { drawBurningSmoke } from '../src/art/mob_shots';
import { RAIN as F1_RAIN, RAIN_CANVAS, RAIN_LONG, RISE_CANVAS, rainPainted, rainRisePainted } from '../src/art/action_f1_fx';
import { LOCKDOWN, LOCKDOWN_LONG, lockBarsPainted, lockCanvas, lockShadowPainted } from '../src/art/action_f1_fx';
import { RIME, RIME_CANVAS, SIGIL, SIGIL_CANVAS, SIGIL_LONG, rimePainted, sigilPainted } from '../src/art/action_f2_fx';
import { KF } from '../src/game/act1_rules/keybearers';
import { fireBallSprite, keySprite, knifeSprite, ringTongue } from '../src/art/key_bearers_fx';
import { COALS, COAL_SPOTS, FX_CANVAS, coalInAir, fxPainted } from '../src/art/stoker_fx';
import { GEAR_GLINT, STOKER_ROOM } from '../src/art/stoker_room';
import { LASTS as ST_LASTS } from '../src/game/act1_rules/stoker';
import { SMOKE } from '../src/game/defs';
import { FM_HAND_FPS, FM_HAND_FRAMES, FM_HAND_KINDS, makeRingHandArt } from '../src/art/fleshmancer';
import { RISE_MARK, paintHeap, paintRiseMark, paintSinkPit } from '../src/art/fleshmancer_action_fx';
import { Px } from '../src/engine/px';
import { FM_END, deathHands, drawDeathFloor, drawDeathPillar } from '../src/art/fm2_fx';
import { GATE_UP, PILLAR, STRIP, makeGateArt } from '../src/art/gates';
import type { Strip } from '../src/art/gates';
import { gateBars, unbarFilm } from '../src/art/town_ways';
import { CRACK_STEPS, STONE_FPS, STONE_FRAMES, STONE_SPIN, makeMeldDropsArt } from '../src/art/meld_drops';
import { BOULDER, HAMMER, SMASH_CANVAS, smashPainted } from '../src/art/action_f6_golem';
import { BLAZE, CAST_HIT, CHAIN, FIRE_CANVAS, RING_CANVAS as CH_RING_CANVAS, STATIC_CANVAS, blazePainted, makeFlyingPotArt, potShadowPainted, ringPainted as chRing, staticPainted } from '../src/art/action_f6_cult';
import { markRing } from '../src/art/action_f6_fx';
import { chantWard } from '../src/art/act1_cultists';
import { POOL_CANVAS, SPIT, SWIRL_CANVAS, TW, globShadowPainted, layTwisterBolts, poolPainted, swirlPainted } from '../src/art/action_f6_canyon';
// (the bosses of floors 8 and 9: floor 8's rockfall, the Stag's wall of roots)
import { act1Pieces } from '../src/render/act1_pieces';
import { CLUMP9, clump9Sprite } from '../src/art/act1_figs/stag';
import { WALL as SG_WALL, forgetClumps } from '../src/art/stag_action_fx';

paintWithoutCanvas();
gameSwitches();
const OUT = 'godot/assets/fx';
mkdirSync(OUT, { recursive: true });
const FPS = 30;

interface Film { fps: number; n: number; k0: number; layers: Record<string, number[]> }
const films: Record<string, Film> = {};
/** The pictures, each once: its pixels (picture pixels), and where its top left lies from the floor point. */
const pics: { w: number; h: number; d: Uint8ClampedArray; ox: number; oy: number }[] = [];
const seen = new Map<string, number>();

/** A sprite as a picture: in picture pixels, cut to what is painted; -1 if nothing is. */
function pic(s: Sprite | null): number {
  if (!s) return -1;
  return rawPic(paintingOf(s), 2 / (s.density ?? 1), s.ax * 2, s.ay * 2);
}

/** A painting (`k` picture pixels to each of its own), its floor point at (ax2, ay2) picture pixels from its corner, as a picture. */
function rawPic(p: { w: number; h: number; d: Uint8ClampedArray }, k: number, ax2: number, ay2: number): number {
  let x0 = p.w;
  let y0 = p.h;
  let x1 = -1;
  let y1 = -1;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
    if (p.d[(y * p.w + x) * 4 + 3] === 0) continue;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  if (x1 < 0) return -1;
  const w = (x1 - x0 + 1) * k;
  const h = (y1 - y0 + 1) * k;
  const d = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = ((y0 + Math.floor(y / k)) * p.w + x0 + Math.floor(x / k)) * 4;
    d.set(p.d.subarray(o, o + 4), (y * w + x) * 4);
  }
  const ox = x0 * k - ax2;
  const oy = y0 * k - ay2;
  let hash = 0;
  for (let i = 0; i < d.length; i++) hash = (Math.imul(hash, 31) + d[i]) | 0;
  const key = `${w}x${h}@${ox},${oy}#${hash}`;
  const had = seen.get(key);
  if (had !== undefined) return had;
  pics.push({ w, h, d, ox, oy });
  seen.set(key, pics.length - 1);
  return pics.length - 1;
}

/** A film from `t0` to `secs` seconds (of its own time): each layer's frame `k` (counted from its time 0) as the game paints it. */
function film(name: string, secs: number, layers: Record<string, (k: number) => Sprite | number | null>, t0 = 0, fps = FPS): void {
  const k0 = Math.round(t0 * fps);
  const n = Math.floor(secs * fps) - k0 + 1;
  const out: Record<string, number[]> = {};
  for (const [layer, at] of Object.entries(layers)) {
    out[layer] = Array.from({ length: n }, (_, i) => {
      const q = at(k0 + i);
      return typeof q === 'number' ? q : pic(q);
    });
  }
  films[name] = { fps, n, k0, layers: out };
}

/**
 * A CANVAS OF THE GAME'S PIXELS for one of the game's own floor painters that lays single pixels (fillRect, globalAlpha,
 * fillStyle '#rrggbb'): what it lays, one over another as a canvas would.
 */
class Dots {
  globalAlpha = 1;
  fillStyle = '#000000';
  d: Uint8ClampedArray;
  constructor(public w: number, public h: number) {
    this.d = new Uint8ClampedArray(w * h * 4);
  }
  fillRect(x: number, y: number, w: number, h: number): void {
    const c = this.fillStyle;
    const r = parseInt(c.slice(1, 3), 16);
    const g = parseInt(c.slice(3, 5), 16);
    const b = parseInt(c.slice(5, 7), 16);
    const a = Math.max(0, Math.min(1, this.globalAlpha));
    for (let j = Math.round(y); j < Math.round(y) + h; j++) for (let i = Math.round(x); i < Math.round(x) + w; i++) {
      if (i < 0 || j < 0 || i >= this.w || j >= this.h) continue;
      const o = (j * this.w + i) * 4;
      const da = this.d[o + 3] / 255;
      const oa = a + da * (1 - a);
      if (oa <= 0) continue;
      this.d[o] = (r * a + this.d[o] * da * (1 - a)) / oa;
      this.d[o + 1] = (g * a + this.d[o + 1] * da * (1 - a)) / oa;
      this.d[o + 2] = (b * a + this.d[o + 2] * da * (1 - a)) / oa;
      this.d[o + 3] = Math.round(oa * 255);
    }
  }
}

type Layer = 'floor' | 'behind' | 'before';
const LAYERS: Layer[] = ['floor', 'behind', 'before'];
const three = (at: (what: Layer, k: number) => Sprite): Record<string, (k: number) => Sprite | null> => Object.fromEntries(LAYERS.map((what) => [what, (k: number) => at(what, k)]));

// the green troll's slam (render/act1_fx/brute.ts)
film('brute_ring', F3_RING.long, three((what, k) => toSprite(f3Ring(k / FPS, what === 'floor' ? 'floor' : 'air', F3_RING.radius, what === 'floor' ? 'all' : what), null, RING_CANVAS.ax, RING_CANVAS.ay)));
// the Chained One's rings and his crack (render/act1_fx/chained.ts)
for (const r of [CO_RING.whirl, CO_RING.ball, CO_RING.hammer]) {
  const C = ringCanvas(r);
  film(`co_ring_${r}`, CO_RING.long, three((what, k) => toSprite(coRing(k / FPS, what === 'floor' ? 'floor' : 'air', r, what === 'floor' ? 'all' : what), null, C.ax, C.ay)));
}
const WAYS = 16;
for (let w = 0; w < WAYS; w++) {
  const a = (w / WAYS) * 2 * Math.PI;
  film(`co_crack_${w}`, CRACK.long, three((what, k) => toSprite(crackPainted(k / FPS, what === 'floor' ? 'floor' : 'air', [Math.cos(a), Math.sin(a)], what === 'floor' ? 'all' : what), null, CRACK_CANVAS.ax, CRACK_CANVAS.ay)));
}

// the Chained One's hook and ball in flight, and what his broken chains left lying (render/bossfx.ts)
for (const view of ['front', 'back'] as const) {
  const hooks = makeHookShotArt(view);
  films[`co_hook_${view}`] = { fps: 0, n: HOOK_SHOT_FRAMES + 1, k0: 0, layers: { stand: Array.from({ length: HOOK_SHOT_FRAMES + 1 }, (_, i) => pic(hooks[i])) } };
  const balls = makeBallShotArt(view);
  films[`co_ball_${view}`] = { fps: 0, n: BALL_SHOT_FRAMES, k0: 0, layers: { stand: Array.from({ length: BALL_SHOT_FRAMES }, (_, i) => pic(balls[i])) } };
  (['L', 'ball'] as const).forEach((which, w) => {
    films[`co_left_${w}_${view}`] = { fps: 0, n: 1, k0: 0, layers: { floor: [pic(makeLeftBehindArt(which, view))] } };
  });
}

// the Ossuary Amalgamation's (render/act1_fx/amalgam.ts, render/bossfx.ts)
for (const r of [SLAM_RING.rain, SLAM_RING.arms]) {
  const C = slamRingCanvas(r);
  film(`am_ring_${r}`, SLAM_RING.long, three((what, k) => toSprite(slamRingPainted(k / FPS, what === 'floor' ? 'floor' : 'air', r, what === 'floor' ? 'all' : what), null, C.ax, C.ay)));
}
for (let seed = 0; seed < 8; seed++) {
  const drop = (what: Layer, k: number): Sprite => toSprite(dropPainted(k / FPS, what === 'floor' ? 'floor' : 'air', seed, what === 'floor' ? 'all' : what), null, DROP_CANVAS.ax, DROP_CANVAS.ay);
  // (what stands of it only from when it lands, as the game has it)
  film(`am_drop_${seed}`, RAIN.mite.scuff, { floor: (k) => drop('floor', k), behind: (k) => (k < 0 ? null : drop('behind', k)), before: (k) => (k < 0 ? null : drop('before', k)) }, -RAIN.fly);
}
{
  const skulls = makeRainSkullArt('front');
  films.am_skull = { fps: 0, n: RAIN_SKULL_FRAMES, k0: 0, layers: { air: Array.from({ length: RAIN_SKULL_FRAMES }, (_, i) => pic(skulls[i])) } };
  const arms = makeBigArmArt('front');
  films.am_arm = { fps: BIG_ARM_FPS, n: BIG_ARM_FRAMES, k0: 0, layers: { stand: Array.from({ length: BIG_ARM_FRAMES }, (_, i) => pic(arms[i])) } };
  // (the crack: the game's own painter on a canvas of the game's pixels, its floor point in the canvas's middle)
  const W = 96;
  const H = 64;
  film('am_arm_crack', BIG_ARM_TIME + ARM_CRACK_AFTER, {
    floor: (k) => {
      const g = new Dots(W, H);
      drawArmCrack(g as unknown as CanvasRenderingContext2D, (x, y) => [W / 2 + (x - y) * 16, H / 2 + (x + y) * 8] as const, 0, 0, k / FPS, BIG_ARM_TIME);
      return rawPic(g, 2, W, H);
    },
  }, -ARM_CRACK_WARN);
}

// the Fleshmancer's that sit in one place (render/act1_fx/fm.ts: each painted afresh a frame at a time by the art's own painter,
// onto plain picture pixels through an `at`: render/act1_fx/live.ts picAt, and its `room`)
{
  const room = (r: number, up: number): { w: number; h: number; ax: number; ay: number } => {
    const hw = Math.ceil(45.3 * r) + 12;
    const hh = Math.ceil(22.7 * r) + 12;
    return { w: hw * 2, h: hh * 2 + up, ax: hw, ay: hh + up };
  };
  type At = (x: number, y: number, z?: number) => readonly [number, number];
  const live = (R: { w: number; h: number; ax: number; ay: number }, paint: (px: Px, at: At) => void): number => {
    const px = new Px(R.w, R.h);
    paint(px, (x, y, z = 0) => [R.ax + 32 * (x - y), R.ay + 16 * (x + y) - z] as const);
    return rawPic(px, 1, R.ax, R.ay);
  };
  const PIT_ROOM = room(1.2, 20);
  const RISE_ROOM = room(RISE_MARK.r + 0.6, 90);
  const HEAP_ROOM = room(2.0, 120);
  film('fm_pit', 1.0, { floor: (k) => live(PIT_ROOM, (px, at) => paintSinkPit(px, at as never, k / FPS, [0, 0])) });
  film('fm_rise', 0.9, {
    floor: (k) => live(RISE_ROOM, (px, at) => paintRiseMark(px, at as never, k / FPS, [0, 0], 'floor')),
    before: (k) => (k < 0 ? -1 : live(RISE_ROOM, (px, at) => paintRiseMark(px, at as never, k / FPS, [0, 0], 'air'))),
  }, -RISE_MARK.warn);
  for (let i = 0; i < 3; i++) {
    film(`fm_heap_${i}`, 3.6, {
      floor: (k) => live(HEAP_ROOM, (px, at) => paintHeap(px, at as never, k / FPS, [0, 0], i, 'floor')),
      before: (k) => live(HEAP_ROOM, (px, at) => paintHeap(px, at as never, k / FPS, [0, 0], i, 'air')),
    });
  }
  for (let kind = 0; kind < FM_HAND_KINDS; kind++) {
    const hands = makeRingHandArt('front', kind);
    films[`fm_hand_${kind}`] = { fps: FM_HAND_FPS, n: FM_HAND_FRAMES, k0: 0, layers: { stand: Array.from({ length: FM_HAND_FRAMES }, (_, i) => pic(hands[i])) } };
  }
}

// the Fleshmancer's death, brought up to par (art/fm2_fx.ts; render/act1_fx/fm.ts ground and glow: the game's own painters on
// a canvas of the game's pixels, its floor point his)
const tables: Record<string, unknown> = {};
{
  const W = 200;
  const H = 120;
  film('fm_death_floor', FM_END.long, {
    floor: (k) => {
      const g = new Dots(W, H);
      drawDeathFloor(g as unknown as CanvasRenderingContext2D, (x, y) => [W / 2 + (x - y) * 16, H / 2 + (x + y) * 8] as const, 0, 0, k / FPS);
      return rawPic(g, 2, W, H);
    },
  });
  const PW = 160;
  const PH = 300;
  film('fm_death_pillar', FM_END.pillar[1] + 0.6, {
    air: (k) => {
      const g = new Dots(PW, PH);
      drawDeathPillar(g as unknown as CanvasRenderingContext2D, PW / 2, PH - 10, k / FPS);
      return rawPic(g, 2, PW, (PH - 10) * 2);
    },
  }, FM_END.pillar[0]);
  tables.fm_death_hands = deathHands().map((q) => [q.dx, q.dy, q.at, q.j]);
}

// the cultist's fire sigil and the Flame keybearer's great one; the Shade's rime; the bone archer's arrow rain
for (const r of [SIGIL.radius, KF.sigilR]) {
  const sig = (what: Layer, k: number): Sprite => toSprite(sigilPainted(k / FPS - SIGIL.delay, what === 'floor' ? 'floor' : 'air', r, what === 'floor' ? 'all' : what), null, SIGIL_CANVAS.ax, SIGIL_CANVAS.ay);
  // (what stands of it from the eruption: the frame the eruption falls in, as the game has it)
  const from = Math.floor(SIGIL.delay * FPS);
  film(`sigil_${r}`, SIGIL.delay + SIGIL_LONG, { floor: (k) => sig('floor', k), behind: (k) => (k < from ? null : sig('behind', k)), before: (k) => (k < from ? null : sig('before', k)) });
}
film('rime', RIME.lie, { floor: (k) => toSprite(rimePainted(k / FPS), null, RIME_CANVAS.ax, RIME_CANVAS.ay) });
for (const view of ['front', 'back'] as const) {
  film(`rain_${view}`, RAIN_LONG, three((what, k) => toSprite(rainPainted(k / FPS, view, what === 'floor' ? 'floor' : 'air', F1_RAIN.radius, what === 'floor' ? 'all' : what), null, RAIN_CANVAS.ax, RAIN_CANVAS.ay)));
  film(`rain_rise_${view}`, F1_RAIN.rise + 1 / FPS, { stand: (k) => toSprite(rainRisePainted(k / FPS, view), null, RISE_CANVAS.ax, RISE_CANVAS.ay) });
}

// floor 5's keybearers: what they throw and drop, each a picture the game picks by its clock (render/act1_fx/keybearers.ts)
{
  const stills = (name: string, n: number, at: (i: number) => Sprite): void => {
    films[name] = { fps: 0, n, k0: 0, layers: { stand: Array.from({ length: n }, (_, i) => pic(at(i))) } };
  };
  stills('kb_knife', 8, knifeSprite);
  stills('kb_ball', 4, fireBallSprite);
  stills('kb_key', 4, keySprite);
  for (let h = 1; h <= 16; h++) stills(`kb_tongue_${h}`, 4, (i) => ringTongue(h, i));
}

// the Stoker's fire (render/act1_fx/stoker.ts: painted afresh fifteen times a second by the art's own painter, on a canvas the
// size of the floor round him, his floor point its anchor; over 0.05 s before its end)
{
  const ST_FPS = 15;
  const st = (which: 'coals' | 'rake' | 'ring' | 'blast', k: number, view: 'front' | 'back'): Sprite => toSprite(fxPainted(which, k / ST_FPS, view, [0, 0]), null, FX_CANVAS.ax, FX_CANVAS.ay);
  for (const view of ['front', 'back'] as const) {
    film(`st_rake_${view}`, ST_LASTS.rake - 0.05, { floor: (k) => st('rake', k, view) }, 0, ST_FPS);
    film(`st_ring_${view}`, ST_LASTS.ring - 0.05, { floor: (k) => st('ring', k, view) }, 0, ST_FPS);
    film(`st_blast_${view}`, ST_LASTS.blast - 0.05, { floor: (k) => st('blast', k, view) }, 0, ST_FPS);
  }
  // (each coal alone, where it comes down: the game paints the seven on one canvas round where they are thrown; here the
  // other six are put out of the picture, and the one at the canvas's floor point)
  const spots = COAL_SPOTS as unknown as [number, number][];
  const kept = spots.map((q) => [q[0], q[1]] as [number, number]);
  for (let i = 0; i < COALS.n; i++) {
    for (let j = 0; j < COALS.n; j++) spots[j] = j === i ? [0, 0] : [1e4, 1e4];
    film(`st_coal_${i}`, ST_LASTS.coals - 0.05, { floor: (k) => st('coals', k, 'front') }, 0, ST_FPS);
    const px = new Px(40, 40);
    coalInAir(px, 20, 20, 0, i, [0, 0]);
    films[`st_lump_${i}`] = { fps: 0, n: 1, k0: 0, layers: { stand: [rawPic(px, 1, 20, 20)] } };
  }
  kept.forEach((q, j) => (spots[j] = q));
  films.st_gear = { fps: GEAR_GLINT.fps, n: GEAR_GLINT.frames, k0: 0, layers: { stand: Array.from({ length: GEAR_GLINT.frames }, (_, i) => pic(STOKER_ROOM.gearDropped(i))) } };
}

// the Warden's Lockdown, a tile of a row at a time (render/act1_fx/warden.ts): its time 0 the crash
{
  const C = lockCanvas(1);
  for (const way of ['x', 'y'] as const) {
    film(`lock_shadow_${way}`, LOCKDOWN_LONG, { floor: (k) => toSprite(lockShadowPainted(way, k / FPS, 1), null, C.ax, C.ay) }, -LOCKDOWN.warn);
    for (let wear = 0; wear < 4; wear++) {
      film(`lock_bars_${way}_${wear}`, LOCKDOWN_LONG, { stand: (k) => (k / FPS < LOCKDOWN.strike[0] - 1e-6 ? null : toSprite(lockBarsPainted(way, k / FPS, 1, wear), null, C.ax, C.ay)) }, -LOCKDOWN.warn);
    }
  }
}

// the high priest's burning smoke (render.ts, the 'smoke' zone: its share of its life, and the clock)
{
  const W = 160;
  const H = 110;
  film('smoke', SMOKE.dur, {
    floor: (k) => {
      const g = new Dots(W, H);
      drawBurningSmoke(g as unknown as CanvasRenderingContext2D, (x, y) => [W / 2 + (x - y) * 16, H / 2 + 12 + (x + y) * 8] as const, 0, 0, SMOKE.r, k / FPS / SMOKE.dur, k / FPS);
      return rawPic(g, 2, W, H + 24);
    },
  });
}

// THE TOWN'S GATE OUT TO THE QUARRY (render.ts standDoors, the town's gate; art/gates.ts portcullis, art/town_ways.ts gateBars,
// unbarFilm; tools/godot_town.ts laid the gate: its `gate`): each strip of it (a quarter of a tile of the gate's plane, stood
// at its own depth so that he is before the part he is before) a film of its own, `tg_port_<k>`, `tg_bars_<k>`, `tg_unbar_<k>`,
// k the strip's place along the plane (STRIP picture pixels each); `tables.tg`: where each strip stands, [x, y, depth] (tiles).
{
  const G = JSON.parse(readFileSync('godot/assets/town/layout.json', 'utf8')).gate as { alongX: boolean; a: number; face: number } | null;
  if (G) {
    const A = makeGateArt();
    const wide = PILLAR / 32;
    const at = (t: number, back: number): [number, number, number] => {
      const [x, y] = G.alongX ? [G.a + t, G.face - back] : [G.face - back, G.a + t];
      return [x, y, x + y + STRIP / 64];
    };
    const slot = (q: Strip): number => Math.round((q.t * 32) / STRIP);
    const port: ([number, number, number] | null)[] = [];
    const bars: ([number, number, number] | null)[] = [];
    // (the portcullis at each of its heights, 2 game pixels apart, as A.portcullis rounds them: its strips stood at (-wide, wide))
    const heights = GATE_UP / 2 + 1;
    const portBy = new Map<number, number[]>();
    for (let r = 0; r < heights; r++) {
      for (const q of A.portcullis(G.alongX, false, r * 2)) {
        const k = slot(q);
        if (!portBy.has(k)) portBy.set(k, Array(heights).fill(-1));
        portBy.get(k)![r] = pic(q.s);
        port[k] = at(-wide + q.t, wide);
      }
    }
    for (const [k, list] of portBy) films[`tg_port_${k}`] = { fps: 0, n: heights, k0: 0, layers: { stand: list } };
    // (the bars, barred: their strips stood at (-wide, wide - 0.03), a hair in front of the portcullis; struck off, frame by frame
    // at 30 a second, the last what is left of them lying at its foot)
    const film = unbarFilm(G.alongX);
    const barBy = new Map<number, { barred: number; frames: number[] }>();
    const of = (k: number): { barred: number; frames: number[] } => {
      if (!barBy.has(k)) barBy.set(k, { barred: -1, frames: Array(film.frames.length).fill(-1) });
      return barBy.get(k)!;
    };
    for (const q of gateBars(G.alongX)) {
      of(slot(q)).barred = pic(q.s);
      bars[slot(q)] = at(-wide + q.t, wide - 0.03);
    }
    film.frames.forEach((list, f) => {
      for (const q of list) {
        of(slot(q)).frames[f] = pic(q.s);
        bars[slot(q)] = at(-wide + q.t, wide - 0.03);
      }
    });
    for (const [k, b] of barBy) {
      films[`tg_bars_${k}`] = { fps: 0, n: 1, k0: 0, layers: { stand: [b.barred] } };
      films[`tg_unbar_${k}`] = { fps: film.fps, n: b.frames.length, k0: 0, layers: { stand: b.frames } };
    }
    tables.tg = { port, bars, jolts: film.jolts, heights, up: GATE_UP };
  }
}

// THE MELDSTONE (art/meld_drops.ts makeMeldDropsArt; render.ts standMeldDrop, standMeldMoments): its pictures, each anchored at
// its middle (the crack's at its floor point), for godot/scripts/loot.gd to stand as the game's riseOf and takenOf have them:
// `ms_stone` hanging (STONE_FRAMES, its round of 2 s at STONE_FPS), `ms_apart` and `ms_whole` spinning (STONE_SPIN steps of its
// turn, torn apart and fused), `ms_burst` its light as its halves slam together, `ms_crack` the crack of its light in the floor
// (CRACK_STEPS, shut to open).
{
  const M = makeMeldDropsArt();
  const stills = (name: string, list: Sprite[]): void => {
    films[name] = { fps: 0, n: list.length, k0: 0, layers: { stand: list.map((s) => pic(s)) } };
  };
  stills('ms_stone', Array.from({ length: STONE_FRAMES }, (_, i) => M.stone[i]));
  stills('ms_apart', Array.from({ length: STONE_SPIN }, (_, i) => M.spinApart[i]));
  stills('ms_whole', Array.from({ length: STONE_SPIN }, (_, i) => M.spinWhole[i]));
  stills('ms_burst', [M.burst]);
  stills('ms_crack', Array.from({ length: CRACK_STEPS }, (_, i) => M.crack[i]));
  tables.ms = { fps: STONE_FPS, frames: STONE_FRAMES, spin: STONE_SPIN };
}

// floors 6 to 8's common monsters, as the game starts with their new moves on (render/act1_fx/qgolem.ts, firepot.ts, chanter.ts,
// devil.ts, scorpion.ts: each painted afresh a frame at a time by the art's own painter, render/act1_fx/live.ts)
{
  const stills = (name: string, n: number, layer: string, at: (i: number) => Sprite | number): void => {
    films[name] = { fps: 0, n, k0: 0, layers: { [layer]: Array.from({ length: n }, (_, i) => { const q = at(i); return typeof q === 'number' ? q : pic(q); }) } };
  };
  // the quarry golem: its boulder smashing, and the floor its hammer cracks (art/action_f6_golem.ts smashPainted)
  for (const quake of [false, true]) {
    film(quake ? 'qg_quake' : 'qg_smash', BOULDER.rubble, three((what, k) => toSprite(smashPainted(k / FPS, what === 'floor' ? 'floor' : 'air', quake ? HAMMER.r : BOULDER.r, quake, what === 'floor' ? 'all' : what), null, SMASH_CANVAS.ax, SMASH_CANVAS.ay)));
  }
  // the firepot thrower: the reach of its burst marked, by how far its pot has come (a 24th at a time, as the game keeps it);
  // the pot's shadow under it; the pot itself, tumbling, from in front and from behind; its blaze where it comes down
  const F = FIRE_CANVAS;
  stills('fp_mark', 25, 'floor', (q) => {
    const px = new Px(F.w, F.h);
    markRing(px, F.ax, F.ay, BLAZE.r, q / 24);
    return rawPic(px, 1, F.ax, F.ay);
  });
  stills('fp_shadow', 25, 'floor', (q) => toSprite(potShadowPainted(q / 24), null, 30, 15));
  for (const view of ['front', 'back'] as const) {
    const pots = makeFlyingPotArt(view).frames as Sprite[];
    stills(`fp_pot_${view}`, pots.length, 'stand', (i) => pots[i]);
  }
  const blaze = (what: Layer, k: number): Sprite | null => (what !== 'floor' && k / FPS > BLAZE.burstLong ? null : toSprite(blazePainted(k / FPS, what === 'floor' ? 'floor' : 'air', what === 'floor' ? 'all' : what), null, F.ax, F.ay));
  film('fp_blaze', BLAZE.burstLong + BLAZE.burn, { floor: (k) => blaze('floor', k), behind: (k) => blaze('behind', k), before: (k) => blaze('before', k) });
  // the chanter: its ring where its lightning will strike, from its aim; the static round the hero it struck; its ward
  film('ch_ring', 0.6, { floor: (k) => toSprite(chRing(k / FPS), null, CH_RING_CANVAS.ax, CH_RING_CANVAS.ay) }, -(CAST_HIT - CHAIN.aim));
  film('ch_static', CHAIN.crackle, { air: (k) => toSprite(staticPainted(k / FPS), null, STATIC_CANVAS.ax, STATIC_CANVAS.ay) });
  stills('ch_ward', 4, 'floor', (i) => chantWard(i));
  // the dust devil's twister: the sand swirling in over the floor, its reach, and the lightning it throws out round it
  film('dv_swirl', TW.long, {
    floor: (k) => {
      const C = SWIRL_CANVAS;
      const px = new Px(C.w, C.h);
      px.d.set(swirlPainted(k / FPS).px.d);
      layTwisterBolts(px, C.ax, C.ay, k / FPS);
      return rawPic(px, 1, C.ax, C.ay);
    },
  });
  // the canyon scorpion's acid: the splash's reach marked as the glob comes, the splash and the pool lying, its fumes; the
  // glob's shadow (a 20th at a time)
  const pool = (what: Layer, k: number): Sprite | null => (what !== 'floor' && k < 0 ? null : toSprite(poolPainted(k / FPS, what === 'floor' ? 'floor' : 'air', what === 'floor' ? 'all' : what), null, POOL_CANVAS.ax, POOL_CANVAS.ay));
  film('sc_pool', SPIT.stays, { floor: (k) => pool('floor', k), behind: (k) => pool('behind', k), before: (k) => pool('before', k) }, -0.8);
  stills('sc_shadow', 21, 'floor', (q) => toSprite(globShadowPainted(q / 20), null, 25, 13));
}

// THE BOSSES OF FLOORS 8 AND 9 (render/act1_fx/cantor.ts, stag.ts), as the game starts (the Hollow Stag's fight done the action
// way, STAG_ACTION on):
//   cn_rock      floor 8's own rockfall (art/floor8.ts 'rockfall from the rim': its sign, its warning shadow, the rock come down,
//                the rubble; 4 stills, layer `floor`, anchored at its tile's top corner), drawn where the Cantor's voice shakes
//                rocks loose over the hero, and his copies' rocks.
//   sg_clump_<k> the Stag's wall of roots, clump kind k of ten (art/act1_figs/stag.ts clump9Sprite: CLUMP9.n stills, layer `stand`,
//                picked by clump9Frame); sg_earth_<k>: the torn earth at its foot (layer `floor`).
{
  const rocks = act1Pieces(8).get('rockfall from the rim')?.frames ?? [];
  if (rocks.length >= 4) films.cn_rock = { fps: 0, n: 4, k0: 0, layers: { floor: rocks.slice(0, 4).map((s) => pic(s)) } };
  for (let kind = 0; kind < SG_WALL.kinds; kind++) {
    films[`sg_clump_${kind}`] = { fps: 0, n: CLUMP9.n, k0: 0, layers: { stand: Array.from({ length: CLUMP9.n }, (_, i) => pic(clump9Sprite(kind, i, 'air'))) } };
    films[`sg_earth_${kind}`] = { fps: 0, n: 1, k0: 0, layers: { floor: [pic(clump9Sprite(kind, 0, 'floor'))] } };
    forgetClumps();
  }
}

// --- the sheets: each SET of films on sheets of its own (the films of one kind of monster: the game loads a set only on a
// floor that has its kind), the tallest pictures first, shelf by shelf, 2048 wide and at most 4096 tall each ---
/** The set a film is packed with: the first word of its name; the cultist's sigil and the Flame keybearer's apart. */
const setOf = (name: string): string => (name.startsWith('sigil_') ? (name === `sigil_${SIGIL.radius}` ? 'sigil' : 'kb') : name.split('_')[0]);
/** Which sets each kind of monster plays (godot/scripts/perils.gd warm: fetched as a floor with that kind on it begins). */
const KIND_SETS: Record<string, string[]> = {
  archer: ['rain'], warden: ['lock'], cultist: ['sigil'], shade: ['rime'], brute: ['brute'], priest: ['smoke'], stoker: ['st'], chained: ['co'],
  amalgam: ['am'], mite: ['am'], beast: ['am'], fleshmancer: ['fm'], minifm: ['fm'], keyblade: ['kb'], keyflame: ['kb'],
  qgolem: ['qg'], firepot: ['fp'], chanter: ['ch'], devil: ['dv'], scorpion: ['sc'],
  // (the bosses of floors 8 and 9)
  cantor: ['cn'], stag: ['sg'],
};
function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): Uint8Array => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    const out = new Uint8Array(12 + data.length);
    out.set(be(data.length), 0);
    out.set(td, 4);
    out.set(be(crc32(td) >>> 0), 8 + data.length);
    return out;
  };
  const parts = [new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', new Uint8Array(0))];
  const all = new Uint8Array(parts.reduce((n, q) => n + q.length, 0));
  let o = 0;
  for (const q of parts) { all.set(q, o); o += q.length; }
  return all;
}
const SHEET_W = 2048;
const SHEET_MAX = 4096;
// (a picture is its first film's set's)
const picSet: string[] = pics.map(() => '');
const setNames: string[] = [];
for (const [name, f] of Object.entries(films)) {
  const set = setOf(name);
  if (!setNames.includes(set)) setNames.push(set);
  for (const L of Object.values(f.layers)) for (const i of L) if (i >= 0 && !picSet[i]) picSet[i] = set;
}
const placed: [number, number, number, number, number, number, number][] = pics.map(() => [0, 0, 0, 0, 0, 0, 0]);
const sheets: { h: number; set: string; at: { i: number; x: number; y: number }[] }[] = [];
const sets: Record<string, number[]> = {};
for (const set of setNames) {
  const order = pics.map((_, i) => i).filter((i) => picSet[i] === set).sort((a, b) => pics[b].h - pics[a].h || pics[b].w - pics[a].w);
  let cur = { h: 0, set, at: [] as { i: number; x: number; y: number }[] };
  let cx = 0;
  let cy = 0;
  let rowH = 0;
  sets[set] = [];
  for (const i of order) {
    const p = pics[i];
    if (cx + p.w > SHEET_W) { cx = 0; cy += rowH + 1; rowH = 0; }
    if (cy + p.h > SHEET_MAX) { cur.h = cy; sets[set].push(sheets.length); sheets.push(cur); cur = { h: 0, set, at: [] }; cx = 0; cy = 0; rowH = 0; }
    cur.at.push({ i, x: cx, y: cy });
    placed[i] = [sheets.length, cx, cy, p.w, p.h, p.ox, p.oy];
    cx += p.w + 1;
    rowH = Math.max(rowH, p.h);
  }
  cur.h = cy + rowH;
  sets[set].push(sheets.length);
  sheets.push(cur);
}
const names: string[] = [];
sheets.forEach((S, n) => {
  const img = new Uint8ClampedArray(SHEET_W * S.h * 4);
  for (const q of S.at) {
    const p = pics[q.i];
    for (let y = 0; y < p.h; y++) img.set(p.d.subarray(y * p.w * 4, (y + 1) * p.w * 4), ((q.y + y) * SHEET_W + q.x) * 4);
  }
  const name = `fx-${S.set}-${n - sets[S.set][0]}.png`;
  names.push(name);
  writeFileSync(`${OUT}/${name}`, png(SHEET_W, S.h, img));
});
writeFileSync(`${OUT}/fx.json`, JSON.stringify({ sheets: names, sets, kinds: KIND_SETS, tables, pics: placed, films }));
const frames = Object.values(films).reduce((n, f) => n + f.n * Object.keys(f.layers).length, 0);
console.log(`fx: ${Object.keys(films).length} films, ${frames} frames, ${pics.length} pictures in ${sheets.length} sheet(s): ${sheets.map((S, n) => `${names[n]} ${SHEET_W}x${S.h}`).join(', ')}`);
