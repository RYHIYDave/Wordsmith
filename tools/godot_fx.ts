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
//   uf_block     the Unfinished's hurled block, tumbling (art/unfinished.ts hurledBlock 0 to 3, layer `stand`) and lying as cover
//                (4); uf_boulder: a boulder of its rockslide rolling (boulderRolling: 8); uf_cracks: the terrace its stomp cracks
//                (stompCracks: 4, layer `floor`); uf_crash: where its block comes down and a boulder breaks (art/boss_shots.ts
//                drawBallCrash). 1.4 s.
//   qn_burst     the Carrion Queen's dive struck (art/carrion_queen_action_fx.ts paintDiveMarks after its blow, paintDiveBurst;
//                render/act1_fx/queen.ts 'queen:burst'): the crater and the rock bursting behind where she strikes (`floor`), and
//                before it over the figures (`air`). Its floor point where her talons strike. 2.5 s.
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
// (floors 6 to 10 besides their fights: runedust, the ward-stone's piece, the muster roll's page)
import { SPILL_FRAMES, WHIRL_FRAMES } from '../src/art/meld_drops';
import { makeIconArt } from '../src/art/icons';
import { clapperSprite, pageSprite, rollSprite } from '../src/art/quest1115';
import { shrineBellFrames } from '../src/art/floor11';
import { CLIP_CANVAS, clippingsPainted } from '../src/art/action_f16_gardener';
import { HORSE_N, MIST_N, horseSprite, mistSprite } from '../src/art/act1_figs/groom';
import { FLIGHT_CANVAS, JAV, STUCK_CANVAS, javAt, javFly, spearFlying, spearStuck } from '../src/art/action_f16_guard';
import { SWAN_FRAMES as PR_SWAN, snareFrame, snareShots, swanThing, vowFrame, vowShots } from '../src/art/act1_figs/princess';
import { FIRE_CANVAS as FT_FIRE_CANVAS, FIRE_FX as FT_FIRE, TRAY_SHOT_CANVAS, firePainted as ftFire, trayShotPainted } from '../src/art/masque_footmen_fx';
import { TRAY_FLIGHT, trayFlight } from '../src/art/masque_footmen_moves';
import { KNIFE_CANVAS as OD_KNIFE_CANVAS, PALM_WAVE, WAVE_CANVAS as OD_WAVE_CANVAS, knifeAt as odKnifeAt, knifePainted as odKnife, wavePainted as odWave } from '../src/art/silent_order_fx';
import { RUSH as OD_RUSH, rushCarry } from '../src/art/silent_order_moves';
import { DANCE_CANVAS as PC_DANCE_CANVAS, DANCE_FX as PC_DANCE_FX, MASKS_FX as PC_MASKS_FX, MASK_CANVAS as PC_MASK_CANVAS, MASK_FLIGHT as PC_MASK_FLIGHT, dancePainted as pcDance, flungMask, maskPainted as pcMask } from '../src/art/prince_fx';
import { TILE3 as T3 } from '../src/art/new_mobs3';
import { FLASH_CANVAS as LD_FLASH_CANVAS, FLASH_FX as LD_FLASH_FX, flashPainted as ldFlash } from '../src/art/gallery_ladies_fx';
import { RALLY_CANVAS as KK_RALLY_CANVAS, STANDING_CANVAS as KK_STANDING_CANVAS, bannerPainted, rallyPainted } from '../src/art/action_f16_knight';
import { GRIP_CANVAS as HS_GRIP_CANVAS, gripPainted as hsGrip } from '../src/art/hush_shapes';
import { swoopCarry as hsSwoopCarry, swoopPace as hsSwoopPace } from '../src/art/hush_shapes_moves';
import { MASKS_SHADOW_FLIGHT as RSH_FLIGHT, SHADOW_MASKS as RSH_MASKS, SHADOW_SNARE as RSH_SNARE, masksFx as rshMasks, snareFx as rshSnare, weightFx as rshWeight } from '../src/art/royal_shadows_fx';
import { FROZEN_CANVAS as RS_FROZEN_CANVAS, frozenPainted as rsFrozen } from '../src/art/rime_shade_fx';
import { BIRD as GK_BIRD, BIRD_CANVAS as GK_BIRD_CANVAS, DECREE_FX as GK_DECREE, FACE_CANVAS as GK_FACE_CANVAS, KN_CANVAS as GK_KN_CANVAS, WEIGHT_CANVAS as GK_WEIGHT_CANVAS, WEIGHT_FX as GK_WEIGHT, birdPainted as gkBird, facePainted as gkFace, knightPainted as gkKnight, weightPainted as gkWeight } from '../src/art/king_fx';
import { BANNER_N, bannerSprite } from '../src/art/act1_figs/kknight';
import { CHAPTER_CANVAS as MO_CHAPTER_CANVAS, chapterPainted as moChapter } from '../src/art/moth_fx';
import { CLOUD_CANVAS as QN_CLOUD_CANVAS, CLOUD_FX as QN_CLOUD_FX, HALL_MIRROR_CANVAS, SHATTER_FX as QN_SHATTER_FX, TALK_CANVAS as QN_TALK_CANVAS, TALK_FX as QN_TALK_FX, cloudPainted as qnCloud, hallMirrorPainted, shardsAt as qnShardsAt, talkingMirrorPainted } from '../src/art/queen_fx';
import { BOULDER, HAMMER, SMASH_CANVAS, smashPainted } from '../src/art/action_f6_golem';
import { BLAZE, CAST_HIT, CHAIN, FIRE_CANVAS, RING_CANVAS as CH_RING_CANVAS, STATIC_CANVAS, blazePainted, makeFlyingPotArt, potShadowPainted, ringPainted as chRing, staticPainted } from '../src/art/action_f6_cult';
import { markRing } from '../src/art/action_f6_fx';
import { chantWard } from '../src/art/act1_cultists';
import { POOL_CANVAS, SPIT, SWIRL_CANVAS, TW, globShadowPainted, layTwisterBolts, poolPainted, swirlPainted } from '../src/art/action_f6_canyon';
// (floors 9 and 10's, and floor 9's side bosses')
import { HEDGE_AT } from '../src/art/action_f9_pinewood';
import { CLUMP_FRAMES, clumpSprite } from '../src/art/act1_figs/deer';
import { SLICK_N, slickSprite } from '../src/art/act1_figs/drowned';
import { FROST as FR_FROST, RIME_CANVAS as FEN_RIME, SLICK_CANVAS, gushPainted, rimePainted as fenRime } from '../src/art/action_f9_fen';
import { CLOUD as CF9_CLOUD, F9_FX_AFTER, F9_FX_CANVAS, chiefFxGlow, chiefFxPaint, wolfFxGlow, wolfFxPaint } from '../src/art/f9_bosses_fx';
import { CHIEF_MOVES, WOLF_MOVES } from '../src/art/f9_bosses_moves';
import type { ChiefMove, WolfMove } from '../src/art/f9_bosses_moves';
import { f9At } from '../src/art/f9_bosses_art';
import { WK } from '../src/art/f9_bosses_sculpt';
import { flung, slash } from '../src/art/f9_bosses_paint';
import type { Pr } from '../src/art/f9_bosses_paint';
import { FLAME } from '../src/art/mkit';
// (the bosses of floors 8 and 9: floor 8's rockfall, the Stag's wall of roots)
import { act1Pieces } from '../src/render/act1_pieces';
import { CLUMP9, clump9Sprite } from '../src/art/act1_figs/stag';
import { WALL as SG_WALL, forgetClumps } from '../src/art/stag_action_fx';
// (the bosses of floors 6 and 7)
import { boulderRolling, hurledBlock, stompCracks } from '../src/art/unfinished';
import { BALL_CRASH_FOR, drawBallCrash } from '../src/art/boss_shots';
import { QA_DIVE } from '../src/art/carrion_queen_action';
import { paintDiveBurst, paintDiveMarks } from '../src/art/carrion_queen_action_fx';
import { FLY_CANVAS, OIL_CANVAS, POOL as WA_POOL, SHADOW_CANVAS, lanternFlying, lanternShadow, lobFly, oilPainted } from '../src/art/action_f11_watch';
import { OIL_FPS, oilSprite } from '../src/art/act1_figs/watch';
import { paintToll } from '../src/art/crier_action_fx';
import { TOLL as CR_TOLL } from '../src/art/crier_action';
import { paintBurstRing, paintWordBurst } from '../src/art/ratking_action_fx';
import { UNKNOT9, WORDS9 } from '../src/art/ratking_action';
import { CURVE_GONE, CURVE_LAY, SICKLE_N, curveSprite, sickleSprite } from '../src/art/act1_figs/fieldhand';
import { GURNEY_ROLL, GURNEY_WRECK, gurneySprite } from '../src/art/act1_figs/orderly';
import { CRASH_CANVAS, GURNEY as OG_GURNEY, crashPainted } from '../src/art/action_f11_orderly';
import { SLAM_CRACKS_FOR, SLAM_FOR, drawMalletSlam } from '../src/art/orderly_shots';
import { TOOL_TURNS, toolSprites } from '../src/art/act1_figs/physician';
import { TOOL_KINDS } from '../src/art/physician_action_fx';
import { DIAG as PH_DIAG, OP_LONG as PH_OP_LONG, lensAt as phLensAt } from '../src/art/physician_action';
import { GLYPH as WORD_GLYPH, WORD_COLOR as WORD_COLOUR } from '../src/art/icons';
import { HELD_WORD_IDS } from '../src/game/types';
import { TILE3 as PH_TILE3 } from '../src/art/new_mobs3';
import { BOOK_CANVAS, bookPainted } from '../src/art/action_f11_warden';
import { toSprite as wbSprite } from '../src/art/kit';

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
  // (GIVEN to the wordsmith: its two halves whirling round each other over his slab, each STONE_SPIN steps of its turn,
  // render.ts standMeldMoments `a.halves[n][spinStep(yaw)]`; and CARRIED, its small picture by INVENTORY, ui/hud.ts)
  stills('ms_half0', Array.from({ length: STONE_SPIN }, (_, i) => M.halves[0][i]));
  stills('ms_half1', Array.from({ length: STONE_SPIN }, (_, i) => M.halves[1][i]));
  stills('ms_carried', [M.carried]);
  tables.ms = { fps: STONE_FPS, frames: STONE_FRAMES, spin: STONE_SPIN };
}

// FLOORS 6 TO 10 BESIDES THEIR FIGHTS (godot/scripts/act1/quest610.gd, holds.gd): RUNEDUST lying (`rd_heap_<h>`, heapOf's three
// heaps, 16 pictures at DUST_FPS), dropping (`rd_spill_<h>`, SPILL_FRAMES at 30 a second) and taken (`rd_whirl_back`,
// `rd_whirl_front`, WHIRL_FRAMES at 30 a second, at his feet), and its small picture for the screens (`rd_icon`) (art/meld_drops.ts,
// art/icons.ts; render.ts standMeldDrop, standMeldMoments); A PIECE OF THE WARD-STONE lying (`q6_piece`: the game stands the
// Meldstone's icon in for it until the art chat draws it, render.ts drops); A PAGE OF THE MUSTER ROLL lying (`q6_roll`:
// art/quest1115.ts rollSprite).
{
  const M = makeMeldDropsArt();
  const I = makeIconArt();
  const stills = (name: string, list: Sprite[]): void => {
    films[name] = { fps: 0, n: list.length, k0: 0, layers: { stand: list.map((s) => pic(s)) } };
  };
  for (let h = 0; h < 3; h++) {
    stills(`rd_heap_${h}`, Array.from({ length: 16 }, (_, i) => M.heap[h][i]));
    stills(`rd_spill_${h}`, Array.from({ length: SPILL_FRAMES }, (_, i) => M.spill[h][i]));
  }
  stills('rd_whirl_back', Array.from({ length: WHIRL_FRAMES }, (_, i) => M.whirl[i].back));
  stills('rd_whirl_front', Array.from({ length: WHIRL_FRAMES }, (_, i) => M.whirl[i].front));
  stills('rd_icon', [I.runedust]);
  stills('q6_piece', [I.meldstone]);
  stills('q6_roll', [rollSprite()]);
  // (QUESTS1115, godot/scripts/act2/quest1115.gd: AN UNSTRUCK PAGE and THE CLAPPER lying, art/quest1115.ts pageSprite, clapperSprite;
  // THE CAMP'S BELL with the clapper hung in it, still and its two swings, floor 11's wayside shrine's bell, art/floor11.ts
  // shrineBellFrames, render.ts its campBell)
  stills('q11_page', [pageSprite()]);
  stills('q11_clapper', [clapperSprite()]);
  stills('q11_bell', shrineBellFrames());
}

// FLOOR 16, THE SWAN GARDENS (godot/scripts/act3/marks16.gd), as the game starts with its new moves on: THE SHEAR LUNGE's spray of cut
// grass where the blades snap shut, behind and before what stands (gd_clip_behind, gd_clip_before: render/act1_fx/gardener.ts,
// art/action_f16_gardener.ts clippingsPainted, as big as the game draws it, 0.75) and the turf a stuck partisan throws up (on the
// floor, pg_turf, and in the air, whole size: pg_clip_behind, pg_clip_before); LOOSE THE HORSE, galloping seen from in front and from
// behind (gr_horse_front, gr_horse_back: art/act1_figs/groom.ts horseSprite) and the mist at its line's ends (gr_mist); THE PALACE
// GUARD's partisan and javelin in flight, for each whole tile it may be thrown, its height in the picture (pg_fly_<who>_<view>_<d>:
// art/action_f16_guard.ts spearFlying; how far along its line it is each frame, the table pg_along_<who>_<d>, javAt) and stuck,
// quivering then still (pg_stuck_<who>_<view>: spearStuck).
{
  const C = CLIP_CANVAS;
  for (const side of ['behind', 'before'] as const) {
    film(`gd_clip_${side}`, 1.8, { stand: (k) => toSprite(clippingsPainted(k / FPS, 'air', side, 0.75), null, C.ax, C.ay) });
    film(`pg_clip_${side}`, 1.5, { stand: (k) => toSprite(clippingsPainted(k / FPS, 'air', side, 1), null, C.ax, C.ay) });
  }
  film('pg_turf', 1.85, { floor: (k) => toSprite(clippingsPainted(k / FPS, 'floor', 'all', 1), null, C.ax, C.ay) });
  const still = (name: string, list: Sprite[]): void => {
    films[name] = { fps: FPS, n: list.length, k0: 0, layers: { stand: list.map((sp) => pic(sp)) } };
  };
  for (const view of ['front', 'back'] as const) still(`gr_horse_${view}`, Array.from({ length: HORSE_N }, (_, i) => horseSprite(i, view)));
  still('gr_mist', Array.from({ length: MIST_N }, (_, i) => mistSprite(i)));
  for (const who of ['partisan', 'sword'] as const) {
    for (let d = 1; d <= 8; d++) {
      const long = javFly(d);
      const n = Math.max(1, Math.ceil(long * FPS));
      tables[`pg_along_${who}_${d}`] = Array.from({ length: n }, (_, k) => javAt(who, (k / n) * long, d).x);
      for (const view of ['front', 'back'] as const) {
        still(`pg_fly_${who}_${view}_${d}`, Array.from({ length: n }, (_, k) => toSprite(spearFlying(who, (k / n) * long, d, view), null, FLIGHT_CANVAS.ax, FLIGHT_CANVAS.ay)));
      }
    }
    for (const view of ['front', 'back'] as const) still(`pg_stuck_${who}_${view}`, Array.from({ length: Math.ceil((JAV.quiver + 0.05) * FPS) + 1 }, (_, k) => toSprite(spearStuck(who, k / FPS, view), null, STUCK_CANVAS.ax, STUCK_CANVAS.ay)));
  }
}

// FLOOR 16'S BOSS, THE PRINCESS (godot/scripts/act3/pr_marks.gd): her things as the game paints them ahead (art/films.ts
// things:princess; art/act1_figs/princess.ts): her snare's cage, every frame of it that is painted (snareShots), in its two halves,
// behind whoever is inside it and before him (pr_snare_far, pr_snare_near: snareFrameAt picks the frame); her Vow's ring of silence,
// every frame painted (pr_vow, on the floor: vowFrameAt); her swans in the air and diving, from in front and from behind
// (pr_fly_<view>, pr_dive_<view>: swanThing).
{
  const n = snareShots().length;
  const halves = Array.from({ length: n }, (_, i) => snareFrame(i));
  films.pr_snare_far = { fps: 0, n, k0: 0, layers: { stand: halves.map((h) => pic(h[0])) } };
  films.pr_snare_near = { fps: 0, n, k0: 0, layers: { stand: halves.map((h) => pic(h[1])) } };
  const nv = vowShots().length;
  films.pr_vow = { fps: 0, n: nv, k0: 0, layers: { floor: Array.from({ length: nv }, (_, i) => pic(vowFrame(i))) } };
  for (const view of ['front', 'back'] as const) {
    films[`pr_fly_${view}`] = { fps: PR_SWAN.fps, n: PR_SWAN.fly, k0: 0, layers: { stand: Array.from({ length: PR_SWAN.fly }, (_, i) => pic(swanThing('fly', view, i))) } };
    films[`pr_dive_${view}`] = { fps: PR_SWAN.fps, n: PR_SWAN.dive, k0: 0, layers: { stand: Array.from({ length: PR_SWAN.dive }, (_, i) => pic(swanThing('dive', view, i))) } };
  }
}

// FLOOR 17, THE MASQUE (godot/scripts/act3/marks17.gd), as the game starts with its new moves on (render/act1_fx/footman.ts,
// order.ts, prince.ts):
//   ft_tray_<view>   the footman's tray in flight, a frame each thirtieth of a second of its loop (trayShotPainted, its last three
//                    places trailing); the table ft_tray, where it is each frame (tiles before him, tiles to his left: trayFlight)
//   ft_fire_<view>   his candelabrum's fire fan from its blow (firePainted)
//   od_wave_<view>   the Order's grey wave from the palm's blow (wavePainted); od_knife_<view>, the knife flying and lying
//                    (knifePainted); the tables od_rush (how far the rush has carried them, each frame) and od_knife (how far along
//                    its way the knife is, and whether it still flies)
//   pc_dance         the Prince's ring of masked partners round where the hero stood, fifteen frames a second (dancePainted)
//   pc_mask          a smiling mask, twelve ways round its spin (maskPainted); the table pc_masks, each of the five's place each
//                    thirtieth of a second of its flight ([tiles before him, to his left, game pixels up, its spin])
{
  const FT = 30;
  for (const view of ['front', 'back'] as const) {
    const nt = Math.round(TRAY_FLIGHT.long * FT) + 1;
    films[`ft_tray_${view}`] = { fps: FT, n: nt, k0: 0, layers: { stand: Array.from({ length: nt }, (_, k) => { const t = k / FT; const was = [1, 2, 3].map((j) => trayFlight(Math.max(0, t - j / FT)).c); return pic(toSprite(trayShotPainted(trayFlight(t), view, was), null, TRAY_SHOT_CANVAS.ax, TRAY_SHOT_CANVAS.ay)); }) } };
    const nf = Math.ceil(FT_FIRE.long * FT);
    films[`ft_fire_${view}`] = { fps: FT, n: nf, k0: 0, layers: { stand: Array.from({ length: nf }, (_, k) => pic(toSprite(ftFire(k / FT, view), null, FT_FIRE_CANVAS.ax, FT_FIRE_CANVAS.ay))) } };
    const nw = Math.ceil(PALM_WAVE.long * FT) + 1;
    films[`od_wave_${view}`] = { fps: FT, n: nw, k0: 0, layers: { stand: Array.from({ length: nw }, (_, k) => pic(toSprite(odWave(k / FT, view), null, OD_WAVE_CANVAS.ax, OD_WAVE_CANVAS.ay))) } };
    films[`od_knife_${view}`] = { fps: FT, n: 31, k0: 0, layers: { stand: Array.from({ length: 31 }, (_, k) => pic(toSprite(odKnife(k / FT, view), null, OD_KNIFE_CANVAS.ax, OD_KNIFE_CANVAS.ay))) } };
  }
  tables.ft_tray = Array.from({ length: Math.round(TRAY_FLIGHT.long * FT) + 1 }, (_, k) => { const c = trayFlight(k / FT).c; return [c[0] / T3, c[1] / T3]; });
  tables.od_rush = Array.from({ length: Math.round(OD_RUSH.long * FT) + 1 }, (_, k) => rushCarry(k / FT) / T3);
  tables.od_knife = Array.from({ length: 41 }, (_, k) => { const a = odKnifeAt(k / FT); return [a.x, a.flying ? 1 : 0]; });
  const nd = Math.ceil(PC_DANCE_FX.long * 15);
  films.pc_dance = { fps: 15, n: nd, k0: 0, layers: { stand: Array.from({ length: nd }, (_, k) => pic(toSprite(pcDance(k / 15, 'front'), null, PC_DANCE_CANVAS.ax, PC_DANCE_CANVAS.ay))) } };
  films.pc_mask = { fps: 0, n: 12, k0: 0, layers: { stand: Array.from({ length: 12 }, (_, k) => pic(toSprite(pcMask((k / 12) * Math.PI * 2, 'front'), null, PC_MASK_CANVAS.ax, PC_MASK_CANVAS.ay))) } };
  tables.pc_masks = Array.from({ length: PC_MASKS_FX.n }, (_, i) => Array.from({ length: Math.round(PC_MASK_FLIGHT * FT) + 1 }, (_, k) => { const f = flungMask(i, k / FT); return [f.at[0] / T3, f.at[1] / T3, f.at[2] / 2, f.spin]; }));
  tables.pc_ways = Array.from({ length: PC_MASKS_FX.n }, (_, i) => flungMask(i, 0).way.slice(0, 2));
}

// FLOOR 18, THE GLASS GALLERY (godot/scripts/act3/marks18.gd, gqueen_hall.gd), as the game starts with its new moves on
// (render/act1_fx/lady.ts, gqueen.ts):
//   ld_flash_<view>  the lady's flash on the floor before her, from its spot of light skittering through her warning to the cone
//                    of cold light held and gone (flashPainted), a frame each thirtieth of a second from FLASH_FX.warn before her
//                    blow (k0); layer `floor`
//   gq_glass_<i>     the Queen's hall's pier glass `i` (hallMirrorPainted): still (0), awake (1), and through her Shatter at each
//                    of its painted moments (2 to 10: SHATTER_KEYS); layer `stand`
//   gq_mask_<i>      where the glass of pier glass `i` is in its still picture (its cold blue: render/act1_fx/gqueen.ts glassOf),
//                    white, for her picture laid in it in the ring of mirrors
//   gq_talk_<mode>   her talking mirror at the hall's end, eight frames a second: still (its fog drifting, round in 4 s),
//                    speaking (3.8 s), the truth as she dies (TALK_FX.long)
//   gq_cloud         her poison where the comb struck, eight frames a second (cloudPainted); layer `floor`
// and the table gq_shards: Shatter's glass in flight across the hall, fifteen frames a second from its burst, each piece where it
// is (her own lengths along the hall, across it, up), [] once lying.
{
  const nf = Math.ceil((LD_FLASH_FX.warn + LD_FLASH_FX.hold + LD_FLASH_FX.fade) * FPS) + 1;
  const k0 = Math.round(LD_FLASH_FX.warn * FPS);
  for (const view of ['front', 'back'] as const) films[`ld_flash_${view}`] = { fps: FPS, n: nf, k0: -k0, layers: { floor: Array.from({ length: nf }, (_, k) => pic(toSprite(ldFlash((k - k0) / FPS, view), null, LD_FLASH_CANVAS.ax, LD_FLASH_CANVAS.ay))) } };
  const KEYS = [0.45, 0.8, 1.1, 1.3, 1.4, 1.9, 2.7, 3.0, 3.3];
  for (let i = 0; i < 12; i++) {
    const glass = (t: number | null, awake: boolean): Sprite => toSprite(hallMirrorPainted(i, t, awake), null, HALL_MIRROR_CANVAS.ax, HALL_MIRROR_CANVAS.ay);
    films[`gq_glass_${i}`] = { fps: 0, n: 2 + KEYS.length, k0: 0, layers: { stand: [pic(glass(null, false)), pic(glass(null, true)), ...KEYS.map((k) => pic(glass(k, false)))] } };
    // (where its glass is: every pixel of the cold blue of its glass, white)
    const still = glass(null, false);
    const pp = paintingOf(still);
    const md = new Uint8ClampedArray(pp.d.length);
    for (let q = 0; q < pp.w * pp.h; q++) {
      const r = pp.d[q * 4];
      const gg = pp.d[q * 4 + 1];
      const b = pp.d[q * 4 + 2];
      if (pp.d[q * 4 + 3] < 200 || !(b > r + 12 && b > gg + 6)) continue;
      md[q * 4] = 255;
      md[q * 4 + 1] = 255;
      md[q * 4 + 2] = 255;
      md[q * 4 + 3] = 255;
    }
    films[`gq_mask_${i}`] = { fps: 0, n: 1, k0: 0, layers: { stand: [rawPic({ w: pp.w, h: pp.h, d: md }, 2 / (still.density ?? 1), still.ax * 2, still.ay * 2)] } };
    // (where her picture's floor point goes in it: the glass's middle across, its foot, and two of the game's pixels down; picture
    // pixels from the glass's own floor point)
    let sx = 0;
    let n = 0;
    let low = 0;
    for (let q = 0; q < pp.w * pp.h; q++) {
      if (md[q * 4 + 3] === 0) continue;
      sx += q % pp.w;
      n++;
      low = Math.max(low, Math.floor(q / pp.w));
    }
    const dens = pp.w / Math.max(1, still.w);
    ((tables.gq_spots ??= []) as number[][])[i] = n > 20 ? [2 * (sx / n / dens - still.ax), 2 * (low / dens - still.ay + 2)] : [0, 0];
  }
  const talk = (mode: 'still' | 'speaking' | 'truth', n: number): number[] => Array.from({ length: n }, (_, j) => pic(toSprite(talkingMirrorPainted(mode, j / 8), null, QN_TALK_CANVAS.ax, QN_TALK_CANVAS.ay)));
  films.gq_talk_still = { fps: 8, n: 32, k0: 0, layers: { stand: talk('still', 32) } };
  films.gq_talk_speaking = { fps: 8, n: Math.round(3.8 * 8), k0: 0, layers: { stand: talk('speaking', Math.round(3.8 * 8)) } };
  const nt = Math.floor(QN_TALK_FX.long * 8) + 1;
  films.gq_talk_truth = { fps: 8, n: nt, k0: 0, layers: { stand: talk('truth', nt) } };
  const nc = Math.round(QN_CLOUD_FX.long * 8);
  films.gq_cloud = { fps: 8, n: nc, k0: 0, layers: { floor: Array.from({ length: nc }, (_, j) => pic(toSprite(qnCloud(j / 8), null, QN_CLOUD_CANVAS.ax, QN_CLOUD_CANVAS.ay))) } };
  const b0 = QN_SHATTER_FX.burst[0];
  tables.gq_shards = Array.from({ length: Math.ceil((QN_SHATTER_FX.lie[1] - b0) * 15) + 1 }, (_, k) => qnShardsAt(b0 + k / 15).map((q) => [+q.p[0].toFixed(1), +q.p[1].toFixed(1), +(q.p[2] ?? 0).toFixed(1)]));
}

// FLOOR 19, THE KEEP (godot/scripts/act3/marks19.gd), as the game starts with its new moves on (render/act1_fx/kknight.ts, the
// rallying banner: KNIGHT_BANNER):
//   kk_banner_<view>  the banner standing, its cloth stirring, round and round (art/films.ts things:kknight, bannerSprite)
//   kk_plant_<view>   driven in, its first 0.2 s; kk_struck_<view>, shuddering as a blow lands (0.4 s); kk_cut_<view>, cut down
//                     (1.6 s): bannerPainted, as it comes; thirty frames a second
//   kk_splinters      its splinters as it is cut (rallyPainted 'air', 1 s)
{
  for (const view of ['front', 'back'] as const) {
    const sp = (t: number, struck: number, cut: number): number => pic(toSprite(bannerPainted(t, view, struck, cut), null, KK_STANDING_CANVAS.ax, KK_STANDING_CANVAS.ay));
    films[`kk_banner_${view}`] = { fps: 0, n: BANNER_N, k0: 0, layers: { stand: Array.from({ length: BANNER_N }, (_, i) => pic(bannerSprite(i, view))) } };
    films[`kk_plant_${view}`] = { fps: FPS, n: 6, k0: 0, layers: { stand: Array.from({ length: 6 }, (_, k) => sp(k / FPS, -1, -1)) } };
    films[`kk_struck_${view}`] = { fps: FPS, n: 12, k0: 0, layers: { stand: Array.from({ length: 12 }, (_, k) => sp(1.0, k / FPS, -1)) } };
    films[`kk_cut_${view}`] = { fps: FPS, n: 48, k0: 0, layers: { stand: Array.from({ length: 48 }, (_, k) => sp(2.0 + k / FPS, -1, k / FPS)) } };
  }
  films.kk_splinters = { fps: FPS, n: 30, k0: 0, layers: { stand: Array.from({ length: 30 }, (_, k) => pic(toSprite(rallyPainted(2.0 + k / FPS, 'air', k / FPS), null, KK_RALLY_CANVAS.ax, KK_RALLY_CANVAS.ay))) } };
}

// FLOOR 20'S HUSH IN ITS OWN SHAPES (godot/scripts/act3/marks20.gd; render/act1_fx/hshape.ts):
//   hs_grip_<half>  THE GRIP'S COILS round whoever it caught, thirty frames a second for 0.8 s (gripPainted): `far`, its half
//                   behind him, `near`, its half before him; layer `stand`
//   tables.hs       its swoop as the game carries it (art/hush_shapes_moves.ts swoopCarry, swoopPace): `carry`, [round, inward]
//                   tiles every 1/200 s through its last turn; `pace`, tiles a second along its ring every 1/100 s of the swoop
{
  for (const half of ['far', 'near'] as const) {
    films[`hs_grip_${half}`] = { fps: FPS, n: 24, k0: 0, layers: { stand: Array.from({ length: 24 }, (_, k) => pic(toSprite(hsGrip(k / FPS, 'front', half), null, HS_GRIP_CANVAS.ax, HS_GRIP_CANVAS.ay))) } };
  }
  tables.hs = {
    carry: Array.from({ length: 73 }, (_, i) => { const c = hsSwoopCarry(i / 200); return [+c.round.toFixed(5), +c.inward.toFixed(5)]; }),
    pace: Array.from({ length: 171 }, (_, i) => +hsSwoopPace(i / 100).toFixed(4)),
  };
}

// FLOOR 20'S SHADOWS OF THE FOUR ROYALS (godot/scripts/act3/marks20.gd; render/act1_fx/rshadow.ts), thirty frames a second:
//   rsh_snare               THE PRINCESS'S SNARE, its vines bursting up round where he stood, holding, sinking (snareFx)
//   rsh_masks_<view>        THE PRINCE'S MASKS, three flung in a fan along the way its picture faces and bursting (masksFx)
//   rsh_w<part>_<view>      THE KING'S CROWN'S WEIGHT from its sending (weightFx): `floor`, its shadow, ring and slam (layer
//                           `floor`); `crown`, the shadow crown in the air (layer `stand`)
{
  const fr = (f: { px: Px; ax: number; ay: number }): number => pic(toSprite({ px: f.px, lights: [] }, null, f.ax, f.ay));
  const ns = Math.floor(RSH_SNARE.long * FPS) + 1;
  films.rsh_snare = { fps: FPS, n: ns, k0: 0, layers: { stand: Array.from({ length: ns }, (_, k) => fr(rshSnare(k / FPS, 'front'))) } };
  const nm = Math.floor((RSH_FLIGHT + RSH_MASKS.burst) * FPS) + 1;
  const nw = Math.ceil(GK_WEIGHT.long * FPS);
  for (const view of ['front', 'back'] as const) {
    films[`rsh_masks_${view}`] = { fps: FPS, n: nm, k0: 0, layers: { stand: Array.from({ length: nm }, (_, k) => fr(rshMasks(k / FPS, view))) } };
    films[`rsh_wfloor_${view}`] = { fps: FPS, n: nw, k0: 0, layers: { floor: Array.from({ length: nw }, (_, k) => fr(rshWeight(k / FPS, view, 'floor'))) } };
    films[`rsh_wcrown_${view}`] = { fps: FPS, n: nw, k0: 0, layers: { stand: Array.from({ length: nw }, (_, k) => fr(rshWeight(k / FPS, view, 'crown'))) } };
  }
}

// FLOOR 20'S RIME SHADE (godot/scripts/act3/marks20.gd; render/act1_fx/rshade.ts): its line is painted live there (rime_paint.gd)
//   rs_ice_<view>_<half>  FROZEN IN PLACE, the frost closing over his legs and shattering, thirty frames a second (frozenPainted):
//                         `far`, behind him, `near`, before him; seen from in front or behind as he is
{
  const n = Math.floor((0.8 + 0.32) * FPS) + 1;
  for (const view of ['front', 'back'] as const) {
    for (const half of ['far', 'near'] as const) {
      films[`rs_ice_${view}_${half}`] = { fps: FPS, n, k0: 0, layers: { stand: Array.from({ length: n }, (_, k) => pic(toSprite(rsFrozen(k / FPS, view, half), null, RS_FROZEN_CANVAS.ax, RS_FROZEN_CANVAS.ay))) } };
    }
  }
}

// FLOOR 19'S BOSS, THE KING (godot/scripts/act3/gk_marks.gd; render/act1_fx/gking.ts, as the game paints them, each the first time it
// is wanted):
//   gk_kn_<view>          a knight of his Decree, each of the twelve frames of his march (knightPainted); layer `stand`
//   gk_face               a face of his deeds, each of its four kinds, seen from in front (facePainted); layer `stand`
//   gk_weight_<part>_<view>  THE CROWN'S WEIGHT, thirty frames a second from his sending it up (weightPainted): `floor`, its shadow,
//                         its warning ring, the slam's crack and dust (under the figures); `crown`, the crown itself (among them)
//   gk_bird_<state>       THE CLOCKWORK SONGBIRD as he dies, fifteen frames a second (birdPainted): `winding` itself up, `singing`
{
  for (const view of ['front', 'back'] as const) {
    films[`gk_kn_${view}`] = { fps: 0, n: GK_DECREE.march.frames, k0: 0, layers: { stand: Array.from({ length: GK_DECREE.march.frames }, (_, j) => pic(toSprite({ px: gkKnight(j, view), lights: [] }, null, GK_KN_CANVAS.ax, GK_KN_CANVAS.ay))) } };
    const n = Math.ceil(GK_WEIGHT.long * FPS);
    for (const part of ['floor', 'crown'] as const) {
      films[`gk_weight_${part}_${view}`] = { fps: FPS, n, k0: 0, layers: { [part === 'floor' ? 'floor' : 'stand']: Array.from({ length: n }, (_, k) => pic(toSprite(gkWeight(k / FPS, view, part), null, GK_WEIGHT_CANVAS.ax, GK_WEIGHT_CANVAS.ay))) } };
    }
  }
  films.gk_face = { fps: 0, n: 4, k0: 0, layers: { stand: Array.from({ length: 4 }, (_, kind) => pic(toSprite({ px: gkFace(kind, 'front'), lights: [] }, null, GK_FACE_CANVAS.ax, GK_FACE_CANVAS.ay))) } };
  const BF = 15;
  const nw = Math.floor(GK_BIRD.wind * BF);
  const ns = Math.floor(GK_BIRD.song * BF);
  films.gk_bird_winding = { fps: BF, n: nw, k0: 0, layers: { stand: Array.from({ length: nw }, (_, k) => pic(toSprite(gkBird('winding', k / BF, 'front'), null, GK_BIRD_CANVAS.ax, GK_BIRD_CANVAS.ay))) } };
  films.gk_bird_singing = { fps: BF, n: ns, k0: 0, layers: { stand: Array.from({ length: ns }, (_, k) => pic(toSprite(gkBird('singing', k / BF, 'front'), null, GK_BIRD_CANVAS.ax, GK_BIRD_CANVAS.ay))) } };
}

// FLOOR 20'S BOSS, THE MOTH (godot/scripts/act3/moth_marks.gd; render/act1_fx/moth.ts standing, `moth:book`): THE LAST CHAPTER on the
// stones, from the moment it fell from its lectern, under her as she comes down on it, its pages lifting in the wind of her wings
// (art/moth_fx.ts chapterPainted, seen from in front, its floor point hers):
//   mo_book_0             still (she is gone): one picture
//   mo_book_35, mo_book_100  in the wind of her wings as she hovers over it (0.35) and as she beats (1): twenty pictures each, a
//                         tenth of a second apart, the game picking one by its clock (layer `stand`)
{
  for (const [name, wind] of [['mo_book_0', 0], ['mo_book_35', 0.35], ['mo_book_100', 1]] as const) {
    const n = wind > 0 ? 20 : 1;
    films[name] = { fps: 0, n, k0: 0, layers: { stand: Array.from({ length: n }, (_, k) => pic(toSprite(moChapter('front', wind, k / 10), null, MO_CHAPTER_CANVAS.ax, MO_CHAPTER_CANVAS.ay))) } };
  }
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

// FLOORS 9 AND 10'S COMMON MONSTERS AND FLOOR 9'S TWO SIDE BOSSES, as the game starts with their new moves on (render/act1_fx/deer.ts,
// drowned.ts, f9_bosses.ts): each painted by the art's own painter, as the game paints it ahead (art/films.ts things:deer,
// things:drowned) or live (render/act1_fx/live.ts)
//   de_clump_<v>_<j>  the twisted deer's hedge, clump j of it (art/act1_figs/deer.ts clumpSprite: CLUMP_FRAMES' rise, writhe and
//                     wither, layer `stand`; the game picks one by clumpFrame); de_earth_<v>_<j>: the torn earth at its foot (`floor`)
//   dr_slick_<v>      the Drowned's retch: its cone marked, the slick spreading, lying and shrinking (slickSprite: SLICK_N stills,
//                     SLICK_FPS a second from its mark, layer `floor`; the game picks one by slickFrame); dr_gush_<v>: the gush over
//                     the cone (gushPainted, `behind` and `before`, 30 a second)
//   dr_rime, dr_ice   its frost grab: the rime racing out over the floor where its hands close (rimePainted `floor`), and the ice
//                     round the feet of a hero it froze (`air`, `behind` and `before`), 30 a second
//   wc_<move>_<v>     the Troll Chieftain's moves (art/f9_bosses_fx.ts chiefFxPaint: `floor` its ground, `air` over what stands, at
//                     the game's PAINT_FPS, from where the move began, in the frame its picture is shown in: front or rear, turned
//                     over by the frame); mw_<move>_<v>: the Mist Wolf's (wolfFxPaint, the hero away); mw_claws_<v>_<i>: its
//                     claws flashing out of its cloud where the hero is, its i'th blow (wolfFxPaint's own slash and flung, painted
//                     round the hero's own spot: stood where he is)
//   `tables.f9glow`   each of their moves' light, flash and darkening, 30 a second (chiefFxGlow, wolfFxGlow: [x, y, r, a, flash,
//                     dark], or 0 for none)
{
  const stills = (name: string, n: number, layer: string, at: (i: number) => Sprite | number): void => {
    films[name] = { fps: 0, n, k0: 0, layers: { [layer]: Array.from({ length: n }, (_, i) => { const q = at(i); return typeof q === 'number' ? q : pic(q); }) } };
  };
  for (const view of ['front', 'back'] as const) {
    for (let j = 0; j < HEDGE_AT.length; j++) {
      stills(`de_clump_${view}_${j}`, CLUMP_FRAMES.rise + CLUMP_FRAMES.stand + CLUMP_FRAMES.wither, 'stand', (i) => clumpSprite(j, i, view, 'air'));
      stills(`de_earth_${view}_${j}`, 1, 'floor', () => clumpSprite(j, 0, view, 'floor'));
    }
    stills(`dr_slick_${view}`, SLICK_N, 'floor', (i) => slickSprite(i, view));
    const gush = (side: 'behind' | 'before', k: number): Sprite => toSprite(gushPainted(k / FPS, view, side), null, SLICK_CANVAS.ax, SLICK_CANVAS.ay);
    film(`dr_gush_${view}`, 0.6, { behind: (k) => gush('behind', k), before: (k) => gush('before', k) });
  }
  film('dr_rime', FR_FROST.seen, { floor: (k) => toSprite(fenRime(k / FPS, 'floor'), null, FEN_RIME.ax, FEN_RIME.ay) });
  film('dr_ice', FR_FROST.seen, { behind: (k) => toSprite(fenRime(k / FPS, 'air', 'behind'), null, FEN_RIME.ax, FEN_RIME.ay), before: (k) => toSprite(fenRime(k / FPS, 'air', 'before'), null, FEN_RIME.ax, FEN_RIME.ay) });
  // the side bosses' (render/act1_fx/f9_bosses.ts layerOf, painted afresh PAINT_FPS a second on F9_FX_CANVAS)
  const B9 = 15;
  const C = F9_FX_CANVAS;
  const glow: Record<string, (number[] | 0)[]> = {};
  const cut = (paint: (px: Px) => void): number => {
    const px = new Px(C.w, C.h);
    paint(px);
    return rawPic(px, 1, C.ax, C.ay);
  };
  for (const view of ['front', 'rear'] as const) {
    for (const move of Object.keys(CHIEF_MOVES) as ChiefMove[]) {
      const long = CHIEF_MOVES[move].long + F9_FX_AFTER;
      film(`wc_${move}_${view}`, long, { floor: (k) => cut((px) => chiefFxPaint(px, 'ground', move, k / B9, view)), air: (k) => cut((px) => chiefFxPaint(px, 'air', move, k / B9, view)) }, 0, B9);
      glow[`wc_${move}_${view}`] = Array.from({ length: Math.floor(long * FPS) + 1 }, (_, i) => { const g = chiefFxGlow(move, i / FPS, view); return g ? [g.x, g.y, g.r, g.a, g.flash, 0] : 0; });
    }
    for (const move of Object.keys(WOLF_MOVES) as WolfMove[]) {
      const long = WOLF_MOVES[move].long + F9_FX_AFTER;
      film(`mw_${move}_${view}`, long, { floor: (k) => cut((px) => wolfFxPaint(px, 'ground', move, k / B9, view)), air: (k) => cut((px) => wolfFxPaint(px, 'air', move, k / B9, view)) }, 0, B9);
      glow[`mw_${move}_${view}`] = Array.from({ length: Math.floor(long * FPS) + 1 }, (_, i) => { const g = wolfFxGlow(move, i / FPS, view); return g ? [g.x, g.y, g.r, g.a, g.flash, g.dark] : 0; });
    }
    // (its claws in its cloud, each of its blows (CLOUD.hurts) as wolfFxPaint lays them where the hero is, here round (0, 0): from a
    // moment before it to when what it flings has gone, or the cloud's pictures end)
    const pr: Pr = f9At(view, WK, C.ax, C.ay);
    const CRESCENT = ['#9692b2', FLAME[2], '#fffaf0'];
    CF9_CLOUD.hurts.forEach((q, i) => {
      film(`mw_claws_${view}_${i}`, Math.min(q + 1.3, WOLF_MOVES.cloud.long + F9_FX_AFTER), {
        air: (k) => cut((px) => {
          const t = k / B9;
          const at = pr(0, 0, 30);
          for (let c = -1; c <= 1; c++) slash(px, at[0] - 2, at[1] - 4, 30 + c * 7, (q * 3) % 6.28, ((q * 3) % 6.28) + 2.4, (t - q + 0.06) / 0.25, CRESCENT, 5);
          flung(px, pr, 0, 0, (q * 3) % 6.28, 0.6, t - q, 5, 70, 9805 + i, 'mist');
        }),
      }, Math.max(0, q - 0.07), B9);
    });
  }
  tables.f9glow = glow;
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

// THE BOSSES OF FLOORS 6 AND 7 (render/act1_fx/unfinished.ts, queen.ts): the Unfinished's things and the floor it breaks; the
// Carrion Queen's crater and the rock bursting where her dive strikes (what of hers aims any way is painted in Godot itself:
// godot/scripts/act1/queen_marks.gd)
{
  const stills = (name: string, n: number, layer: string, at: (i: number) => Sprite): void => {
    films[name] = { fps: 0, n, k0: 0, layers: { [layer]: Array.from({ length: n }, (_, i) => pic(at(i))) } };
  };
  // the hurled block tumbling end over end (0 to 3), and lying where it fell (4); a boulder of the rockslide rolling, an eighth of
  // a turn each; the stomp's cracks growing (0 to 3, the last as they stay) (art/unfinished.ts hurledBlock, boulderRolling,
  // stompCracks)
  stills('uf_block', 5, 'stand', (i) => hurledBlock(i));
  stills('uf_boulder', 8, 'stand', (i) => boulderRolling(i));
  stills('uf_cracks', 4, 'floor', (i) => stompCracks(i));
  // where the block comes down and a boulder breaks (art/boss_shots.ts drawBallCrash, the game's own painter on a canvas of the
  // game's pixels, its floor point the canvas's middle)
  const W = 120;
  const H = 72;
  film('uf_crash', BALL_CRASH_FOR - 1 / FPS, {
    floor: (k) => {
      const g = new Dots(W, H);
      drawBallCrash(g as unknown as CanvasRenderingContext2D, (x, y) => [W / 2 + (x - y) * 16, H / 2 + (x + y) * 8] as const, 0, 0, k / FPS);
      return rawPic(g, 2, W, H);
    },
  });
  // her dive struck (render/act1_fx/queen.ts ACTION_FX, 'queen:burst'): the crater and the half of the burst behind where she
  // struck on the floor (paintDiveMarks after its blow, paintDiveBurst 'back'), and its half before it over the figures
  // ('front'); its floor point where her talons strike, its time 0 her blow
  const ROOM = { w: 2 * 360 + 24, h: 2 * 180 + 24 + 220, ax: 372, ay: 192 + 220 };
  const B: [number, number] = [-QA_DIVE.at, 0];
  const live = (paint: (px: Px, at: (x: number, y: number, z?: number) => readonly [number, number]) => void): number => {
    const px = new Px(ROOM.w, ROOM.h);
    paint(px, (x, y, z = 0) => [ROOM.ax + 32 * (x - y), ROOM.ay + 16 * (x + y) - z] as const);
    return rawPic(px, 1, ROOM.ax, ROOM.ay);
  };
  film('qn_burst', Math.max(QA_DIVE.dust, QA_DIVE.crater) + 0.2, {
    floor: (k) => live((px, at) => {
      paintDiveMarks(px, at, B, 0, QA_DIVE.hit + k / FPS);
      paintDiveBurst(px, at, B, 0, QA_DIVE.hit + k / FPS, 'back');
    }),
    air: (k) => live((px, at) => paintDiveBurst(px, at, B, 0, QA_DIVE.hit + k / FPS, 'front')),
  });
}

// FLOOR 11'S AND THE CITY'S (render/act1_fx/watch.ts, the chop and the lantern: WATCH_LANTERN on, as the game starts): the Hushed
// Watchman's lantern (what of his aims any way, the floor his chop splits, is painted in Godot itself: godot/scripts/act2/marks11.gd)
//   wa_mark     where the lantern will smash marked, filling as it comes (markRing round POOL.burst: 25 stills, a 24th of its flight
//               each, layer `floor`); wa_shadow: its shadow under it in flight (lanternShadow: 21 stills, a 20th each)
//   wa_fly      the lantern in flight, tumbling, its flame streaming (lanternFlying, 30 a second, layer `stand`, as long as its
//               longest flight)
//   wa_oil      the burning oil on the floor from its smash to its end (oilSprite: OIL_FPS a second, as the game paints it ahead,
//               layer `floor`); wa_smash: the smash itself (oilPainted 'air', by halves: `behind` and `before`, 30 a second)
{
  const stills = (name: string, n: number, layer: string, at: (i: number) => Sprite | number): void => {
    films[name] = { fps: 0, n, k0: 0, layers: { [layer]: Array.from({ length: n }, (_, i) => { const q = at(i); return typeof q === 'number' ? q : pic(q); }) } };
  };
  const O = OIL_CANVAS;
  stills('wa_mark', 25, 'floor', (q) => {
    const px = new Px(O.w, O.h);
    markRing(px, O.ax, O.ay, WA_POOL.burst, q / 24);
    return rawPic(px, 1, O.ax, O.ay);
  });
  stills('wa_shadow', 21, 'floor', (q) => toSprite({ px: lanternShadow(q / 20), lights: [] }, null, SHADOW_CANVAS.ax, SHADOW_CANVAS.ay));
  film('wa_fly', Math.ceil(lobFly(8) * FPS) / FPS, { stand: (k) => toSprite(lanternFlying(k / FPS), null, FLY_CANVAS.ax, FLY_CANVAS.ay) });
  film('wa_oil', WA_POOL.burn, { floor: (k) => oilSprite(k) }, 0, OIL_FPS);
  film('wa_smash', WA_POOL.smash, {
    behind: (k) => toSprite(oilPainted(k / FPS, 'air', 'behind'), null, O.ax, O.ay),
    before: (k) => toSprite(oilPainted(k / FPS, 'air', 'before'), null, O.ax, O.ay),
  });
}

// FLOOR 11'S BOSS, THE CRIER (render/act1_fx/crier.ts ACTION_FX, his fight the action way: CRIER_ACTION on, as the game starts):
//   cr_toll     a toll's mark where the hero stood as it was rung, counting down, and its burst (art/crier_action_fx.ts paintToll:
//               30 a second from its toll, layer `floor`, on the game's own canvas for it). What of his aims any way (the shout
//               off the walls, the decree down its lane, his call's pools) is painted in Godot itself (godot/scripts/act2/
//               crier_paint.gd).
{
  // (floorPicture round it, TOLL.r and 0.6 more each way, its floor point the canvas's middle)
  const span = Math.hypot(CR_TOLL.r + 0.6, CR_TOLL.r + 0.6) + 1;
  const W = Math.ceil(64 * span) + 8;
  const H = Math.ceil(32 * span) + 8;
  film('cr_toll', CR_TOLL.burst + 0.5, {
    floor: (k) => {
      const px = new Px(W, H);
      paintToll(px, [W / 2, H / 2], k / FPS);
      return rawPic(px, 1, W / 2, H / 2);
    },
  });
}

// FLOOR 12'S BOSS, THE RAT KING (render/act1_fx/ratking.ts ACTION_FX: RATKING_ACTION on, as the game starts), what of his aims no
// way, each on the game's own canvas for it (floorPicture), its floor point where it is:
//   rk_ring     the ring of rats bursting out round him as he comes apart, and where his roll bursts open (art/ratking_action_fx.ts
//               paintBurstRing: 30 a second from its burst, layer `floor`)
//   rk_wb_<w>   where his stolen word bursts, each of the four its own way (paintWordBurst: fire, frost, lightning, poison; 30 a
//               second from its burst, layer `air`, over the figures as the game draws it)
// What of his aims any way (the bite's wedge, the word's line and its flight, the swarm, the roll's lane) is painted in Godot itself
// (godot/scripts/act2/rk_paint.gd); his cistern's sluices are drawn there with the canvas's own lines, as the game draws them.
{
  const pictureOf = (R: number, up: number, paint: (px: Px, at: (x: number, y: number, z?: number) => [number, number]) => void): number => {
    const w = Math.ceil(64 * (R + 1)) + 8;
    const h = Math.ceil(32 * (R + 1)) + 8 + up;
    const px = new Px(w, h);
    paint(px, (u, v, z = 0) => [w / 2 + 32 * (u - v), h / 2 + up + 16 * (u + v) - z]);
    return rawPic(px, 1, w / 2, h / 2 + up);
  };
  film('rk_ring', 0.6, { floor: (k) => pictureOf(UNKNOT9.ring + 1, 0, (px, at) => paintBurstRing(px, at, [0, 0], k / FPS)) });
  for (const w of ['fire', 'frost', 'lightning', 'poison'] as const) {
    film(`rk_wb_${w}`, WORDS9.burstFor - 1 / FPS, { air: (k) => pictureOf(WORDS9.burst + 1, 40, (px, at) => paintWordBurst(px, at, w, 0, 0, k / FPS)) });
  }
}

// FLOOR 13'S FIELDHANDS (render/act1_fx/fieldhand.ts BOOM_FX: FIELD_HARVEST on, as the game starts), their sickle boomerang, as the
// game paints it ahead (art/films.ts things:fieldhand), as they are seen from in front or from behind (turned over as the game turns
// them):
//   fh_sickle_<v>  the sickle in flight, spinning (sickleSprite: SICKLE_N stills, a 30th of a second each from the throw, layer
//                  `stand`); fh_curve_<v>: the way it will fly marked on the ground, laid out and gone behind it (curveSprite:
//                  CURVE_LAY + CURVE_GONE stills, picked by curveFrame, layer `floor`)
{
  for (const view of ['front', 'back'] as const) {
    films[`fh_sickle_${view}`] = { fps: 0, n: SICKLE_N, k0: 0, layers: { stand: Array.from({ length: SICKLE_N }, (_, i) => pic(sickleSprite(i, view))) } };
    films[`fh_curve_${view}`] = { fps: 0, n: CURVE_LAY + CURVE_GONE, k0: 0, layers: { floor: Array.from({ length: CURVE_LAY + CURVE_GONE }, (_, i) => pic(curveSprite(i, view))) } };
  }
}

// FLOOR 14'S ORDERLIES (render/act1_fx/orderly.ts GURNEY_FX: ORDERLY_GURNEY on, as the game starts):
//   og_gurney_<v>  the gurney, from in front or behind (turned over as the game turns it), as the game paints it ahead (art/films.ts
//                  things:orderly, gurneySprite): standing, careering on (GURNEY_ROLL, 30 a second from the slam), crashed (GURNEY_WRECK,
//                  15 a second); picked by gurneyFrame, layer `stand`
//   og_crash       where it crashes (crashPainted: `floor` 30 a second as long as it lies; `behind` and `before` its first second)
//   og_slam        where the mallet goes into the floor (art/orderly_shots.ts drawMalletSlam, on the game's own canvas of its pixels)
{
  for (const view of ['front', 'back'] as const) {
    const n = 1 + GURNEY_ROLL + GURNEY_WRECK;
    films[`og_gurney_${view}`] = { fps: 0, n, k0: 0, layers: { stand: Array.from({ length: n }, (_, i) => pic(gurneySprite(i, view))) } };
  }
  const crash = (what: Layer, k: number): Sprite | null => (what !== 'floor' && k / FPS > 1.0 ? null : toSprite(crashPainted(k / FPS, what === 'floor' ? 'floor' : 'air', what === 'floor' ? 'all' : what), null, CRASH_CANVAS.ax, CRASH_CANVAS.ay));
  film('og_crash', OG_GURNEY.lies, { floor: (k) => crash('floor', k), behind: (k) => crash('behind', k), before: (k) => crash('before', k) });
  const W = 120;
  const H = 72;
  film('og_slam', Math.max(SLAM_FOR, SLAM_CRACKS_FOR) - 1 / FPS, {
    floor: (k) => {
      const g = new Dots(W, H);
      drawMalletSlam(g as unknown as CanvasRenderingContext2D, (x, y) => [W / 2 + (x - y) * 16, H / 2 + (x + y) * 8] as const, 0, 0, k / FPS);
      return rawPic(g, 2, W, H);
    },
  });
}

// FLOOR 14'S BOSS, THE PHYSICIAN (render/act1_fx/physician.ts ACTION: PHYSICIAN_ACTION on, as the game starts):
//   ph_tool_<k>   his instrument `k` (TOOL_KINDS: scalpel, bone saw, forceps, needle, knife), each of TOOL_TURNS ways round, as the game
//                 paints it ahead (art/films.ts things:physician, toolSprites): its middle the floor point; layer `stand`
//   ph_glint_<k>  the same, its blade alone in his gold (the glint running along it is a band of this)
// and in the tables (`ph`): where his lens is through his look and his operation, a frame at a time (lensAt: tiles before him, tiles
// to his left, picture pixels up), and the rune of every word he may hold over his head (art/icons.ts GLYPH) with its own colour.
{
  for (let kind = 0; kind < TOOL_KINDS.length; kind++) {
    const all = Array.from({ length: TOOL_TURNS }, (_, k) => toolSprites(kind, k));
    films[`ph_tool_${kind}`] = { fps: 0, n: TOOL_TURNS, k0: 0, layers: { stand: all.map((s) => pic(s.tool)) } };
    films[`ph_glint_${kind}`] = { fps: 0, n: TOOL_TURNS, k0: 0, layers: { stand: all.map((s) => pic(s.glint)) } };
  }
  const lens = (move: 'diagnose' | 'operate', long: number): number[][] =>
    Array.from({ length: Math.round(long * 30) + 1 }, (_, i) => {
      const p = phLensAt(move, i / 30);
      return [p[0] / PH_TILE3, p[1] / PH_TILE3, p[2]];
    });
  const glyph: Record<string, readonly string[]> = {};
  const colour: Record<string, string> = {};
  for (const w of HELD_WORD_IDS) {
    if (WORD_GLYPH[w]) glyph[w] = WORD_GLYPH[w];
    if (WORD_COLOUR[w]) colour[w] = WORD_COLOUR[w];
  }
  tables.ph = { turns: TOOL_TURNS, diagnose: lens('diagnose', PH_DIAG.long), operate: lens('operate', PH_OP_LONG), glyph, colour };
}

// FLOOR 15'S BOOKWARDENS (render/act1_fx/bookwarden.ts BARRAGE_FX: WARDEN_BARRAGE on, as the game starts):
//   wb_book_<c>_<l>_<g>  a book of the barrage, cover `c` (0 to 2), lying (`l` 1) or not, its brass corners glinting pink (`g` 1) or
//                        not, turned each of 24 ways (the game's BOOK_TURNS a turn: bookPainted), as the game paints it ahead; its
//                        middle the floor point; layer `stand`
{
  for (let c = 0; c < 3; c++) {
    for (const lying of [0, 1]) {
      for (const g of [0, 1]) {
        films[`wb_book_${c}_${lying}_${g}`] = { fps: 0, n: 24, k0: 0, layers: { stand: Array.from({ length: 24 }, (_, q) => pic(wbSprite({ px: bookPainted((q / 24) * Math.PI * 2, c, lying === 1, g), lights: [] }, null, BOOK_CANVAS.ax, BOOK_CANVAS.ay))) } };
      }
    }
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
  // (floors 9 and 10's, and floor 9's two side bosses: the mist wolf's wolves are its own kind's, with none)
  deer: ['de'], drowned: ['dr'], warchief: ['wc'], mistwolf: ['mw'],
  // (the bosses of floors 8 and 9)
  cantor: ['cn'], stag: ['sg'],
  // (the bosses of floors 6 and 7)
  unfinished: ['uf'], queen: ['qn'],
  // (the city's)
  watch: ['wa'], crier: ['cr'], ratking: ['rk'], fieldhand: ['fh'], orderly: ['og'], physician: ['ph'], bookwarden: ['wb'],
  // (the High City's)
  gardener: ['gd'], groom: ['gr'], pguard: ['pg', 'gd'], princess: ['pr'], footman: ['ft'], order: ['od'], prince: ['pc'], lady: ['ld'], gqueen: ['gq'], kknight: ['kk'], gking: ['gk'], hshape: ['hs'], rshadow: ['rsh'], rshade: ['rs'], moth: ['mo'],
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
