// Draws the world: floor, cut-away walls, props, characters, effects and lighting.
// Order: floor -> things lying on the floor -> everything that stands up (sorted back to front)
// -> darkness with holes cut by lights -> glowing effects -> labels and health bars.

import { drawAura as drawSwapAura, drawBall, drawRally, drawRallyAir, drawSnare, drawSnipeDraw, drawSnipeStreak, drawSpear, drawSplashes } from './swap_fx';
import { SWAP_MOVES } from '../game/talents';
import { LIVING_SHADOW } from '../art/shadow_art';
import { warlockAskAhead } from './warlock_packs';
import type { AskPack } from './warlock_packs';
import { COLOSSUS, HIS_PLACE, onStoneOrJetty, stoneToWorld, worldToStone } from '../game/colossus_fight';
import { colossusOf, colossusOn } from '../game/act1_rules/colossus';
/** (COLOSSUS) How far the picture leans up toward him on his stone (game pixels). */
const COLOSSUS_LEAN = 55;
/** (COLOSSUS) As he changes, how far down the screen his middle at the water is put (the art chat's stills: 131 of 234). */
const COLOSSUS_SHOW = 0.6;
import { CRANK_TURN, FIRE_WALL, FURNACE_OUT, FURNACE_ROAR, STOKER_ROOM } from '../art/stoker_room';
import { STOKER_ON } from '../art/stoker';
import { CRANK_TIMES } from '../game/quests15';
import { forgetMade as forget_floor1 } from '../art/floor1';
import { forgetMade as forget_floor2 } from '../art/floor2';
import { forgetMade as forget_floor3 } from '../art/floor3';
import { forgetMade as forget_floor4 } from '../art/floor4';
import { forgetMade as forget_floor5 } from '../art/floor5';
import { forgetMade as forget_lair } from '../art/lair';
import { forgetMade as forget_tomb } from '../art/tomb';
import { forgetMade as forget_tomb_gate } from '../art/tomb_gate';
import { forgetMade as forget_grounds } from '../art/grounds';
import { forgetMade as forget_prison } from '../art/prison';
import { forgetMade as forget_prison_gate } from '../art/prison_gate';
import { forgetMade as forget_stoker_room } from '../art/stoker_room';
import { forgetMade as forget_chapel } from '../art/chapel';
import { forgetMade as forget_chapel_gate } from '../art/chapel_gate';
import { forgetMade as forget_lair_temple } from '../art/lair_temple';
import { forgetMade as forget_lair_gate } from '../art/lair_gate';
import { HEAVY, LEFT_TO_PAINTER } from '../art/kit';
import { deathOf, isPainted } from './left_to_painter';
/** HEAVY FRAMES (art/kit.ts HEAVY) left to the side painter while the world is drawn: on in the game; off, every frame painted when first shown. */
export const PAINT_DEFER = { on: true };
import type { ActorArt } from '../art/actor_types';
import { FIGURE_SIZE, HEAVY_FIGURES, figureOf } from '../art/bestiary';
import type { Bestiary, MonsterFigure } from '../art/bestiary';
import type { HeroArt } from '../art/heroes';
import { HEAVY_PLACES } from '../art/heroes';
import { heavyDrawn } from '../game/talents';
import { AXE_FLIGHT, axeFlying } from '../art/warrior_up_axe_moves';
import { WARRIOR_UP, WU_SIDES } from '../art/warrior_up';
import { WORD_COLOR, itemPic } from '../art/icons';
import type { IconArt } from '../art/icons';
import { ELEMENT_RAMP, P, RARITY_COLOR } from '../art/palette';
import { SPELL_TONES } from '../art/spells';
import type { SpellArt } from '../art/spells';
import { GATE_UP, PILLAR, POST, STRIP, SWING_STEPS } from '../art/gates';
import type { GateArt, Strip } from '../art/gates';
import { SPIKE_SPOTS, SPIKE_STEPS } from '../art/hazards';
import type { HazardArt } from '../art/hazards';
import { WALL_LOOK } from '../art/ground';
import { BACK_STAND, DOOR_WALLS, WHOLE_WALLS, wholeFaces, FACE_LEFT, FACE_RIGHT, doorWallsBack, wallFaces, wallsAway } from './walls';
import type { GroundArt, WallPart } from '../art/ground';
import type { DungeonProps } from '../art/props';
import type { TownProps } from '../art/town';
import { POWER, QUEST3, STONE_LAYING_STEPS, STONE_LYING_FRAMES, STONE_STANDING_FRAMES, floatingOf } from '../art/quest3';
import type { StoneArt } from '../art/quest3';
import { DUST_FPS, MELD_DROPS, SPILL_FRAMES, SPILL_SECS, STONE_FPS, STONE_FRAMES, WHIRL_FRAMES, heapOf, spinStep } from '../art/meld_drops';
import type { MeldDropsArt } from '../art/meld_drops';
import { GIVEN, KEPT_SCALE, KEPT_Z, MeldDrops, givenOf, orbitAt, riseOf, takenOf } from './meld_drops';
import type { StoneAt } from './meld_drops';
import { SMITH3 } from '../art/smith3';
import { CRYPT, cryptFloor, cryptWays } from '../art/crypt';
import { WARP_FRAMES, WAY_FRAMES, makeWaypointArt } from '../art/crypt_ways';
import { CITY } from '../art/hub2';
import { TALK_FPS, TALK_FRAMES, campFolkFrame } from '../art/hub2_folk';
import { CAMP_DUSK, campFolk, isCamp } from '../game/camp';
import { RimView } from './rim';
import { columnSprite, folkActAt, folkActLong, folkSoundAt, isTownFlat, isTownsperson, ringPower, swirlNow, townSprite, turnedTo } from '../art/townscene';
import { FOLK_SOUND, WORLD_SOUNDS } from '../game/world_sounds';
import type { TownArt } from '../art/townscene';
import type { Facing } from '../art/townsfolk';
import type { Townsfolk } from '../art/townsfolk';
import { drawText, textWidth } from '../engine/font';
import { LEDGE_H, WALL_H } from '../engine/iso';
import { drawAura, drawGlow, drawLights, flipSprite, reapRetired, silhouette, spriteCovers } from '../engine/px';
import { StillGlows } from './still_glows';
import { StillFloor } from './still_floor';
import { StillDark } from './still_dark';
import type { DarkSpot } from './still_dark';
import type { Sprite } from '../engine/px';
import { hash2 } from '../engine/rng';
import { WARLOCK_TUNE } from '../game/warlock';
import { AIM, BODIES, MONSTERS, OWN_MOVES, PACK_LOOK, RANGER_ARROW, SKILLS, SKULL, SPEAR, SPLIT, TUNE, WORDS, movesOf } from '../game/defs';
import { moveAge, frenzyShift } from '../game/action_f4';
import { kindName } from '../game/items';
import type { Game } from '../game/game';
import { MELD_DUST_COLOR, MELD_TUNE, withParts } from '../game/melds';
import { TOWN } from '../game/level';
import type { Monster, Station } from '../game/state';
import { doorFace, doorTiles, isLeaf } from '../game/doors';
import { spikeAt, spikeHeight } from '../game/traps';
import { STAIR_N, STAIR_W, levelAt } from '../game/height';
import { CUT_FAR, CUT_FAR_LOW, CUT_LEFT, CUT_LEFT_LOW, CUT_NEAR, CUT_NEAR_LOW, T_FLOOR, T_PIT, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import type { ClassId, Element, WordId } from '../game/types';
import { EIGHT_STICK, Figure, attackClip, attackFrame, clipFrame, gaitFrame, monsterAttackAge, moveFrame, paintedNear, PHASE_APART } from './figure';
import { heroSides, isEight } from '../art/sides';
import type { WuSide } from '../art/warrior_up';
import { wuFacing } from '../art/warrior_up_art';
import { drawChargeLane } from '../art/charge_lane';
import { drawAimLine, drawBurningSmoke, drawGreatArrow, drawSkullBurst, drawSkullShadow, drawSpearLying, drawSpearShot } from '../art/mob_shots';
import { skullAt, spearHeight } from './mob_world';
import { PACK_MARKS, drawPackMark } from './pack_marks';
import { LIFE_BAR, LifeBar, barPixels } from './lifebar';
import { THEME } from '../ui/ui';
import { pline, wx, wy, wyFlat } from './fx';
import { VeteranFx } from './veteran_fx';
import { WORDS3, air3, echoes3, floor3, heroCopies3, lights3, shift3, tick3, tint3 } from './words3';
import { MELD3, airM3, floorM3, heroAlphaM3, lightsM3, overM3, ownsZone, rotting, shiftM3, tickM3, tintM3 } from './melds3';
import { BINDING3, airB3, floorB3, lightsB3, ownsZoneB3, tickB3, tintB3 } from './binding3';
import { VOLATILE3, airV3, floorV3, lightsV3, overV3, ownsZoneV3, shiftV3, tickV3, tintV3 } from './volatile3';
// (THE SEVEN NEW WORDS' LOOKS, a mock-up of the art chat's behind a switch that is off: render/words7.ts)
import { WORDS7_LOOK, airW7, fallenW7, floorW7, heroW7, lightsW7, lookW7, lyingW7, ownsZoneW7, spiritsW7, tickW7 } from './words7';
// (HIS THREE NEW WORDS' LOOKS, Lasting, Fleeting and Vast, a mock-up of the art chat's behind a switch that is off: render/words10.ts)
import { WORDS10_LOOK, airW10, floorW10, heroW10, lightsW10, thingW10, tickW10 } from './words10';
import { BossFx } from './bossfx';
import { FloorDress } from './dress';
import type { Kick } from './dress';
import { FloorPieces } from './pieces';
import { YARD_DARK, YARD_SKY_LIFT, YARD_VIGNETTE, YardView } from './yard';
import { PrisonView } from './prison';
import { ChapelView } from './chapel';
import { LairView } from './lair';
import { TombView } from './tomb';
import { CastleView } from './castle';
import { GroundsView } from './grounds';
import type { TinkererFx } from './tinkerer_fx';
import { TOMB_GATE, tombGateDropAt, tombGateSlam } from '../art/tomb_gate';
import type { LookView } from './looks';
import { prisonDoorAnchor, prisonDoorTiles } from '../game/prison_way';
import { YARD_GATE, yardGateDropAt, yardGateSlam } from '../art/yard_gate';
import { PRISON_GATE, prisonGateDropAt, prisonGateSlam } from '../art/prison_gate';
import { CHAPEL_GATE, chapelGateDropAt, chapelGateSlam } from '../art/chapel_gate';
import { LAIR_GATE, lairGateDropAt, lairGateSlam } from '../art/lair_gate';
import { EXIT_LABELS, exitLabels } from '../game/exit_labels';
import type { Stage } from './dress';
import { floorLook, lookStairSteps, lookStairs, lookWaySteps, lookWays } from '../art/floors';
import { QUEST_MARKS } from '../game/quest_marks';
import { drawQuestMark } from './quest_mark';
import { OutdoorGround, PIECE as GROUND_PIECE, gateWardLand } from './outdoor';
// (ACT 2: the walls toward the eye standing whole, seen through round whoever is behind them; behind ACT2_WALLS, on at his word)
import { HERO_WINDOW, WINDOW_FAINT, WallWindows, drawHoled, wallsThick } from './act2_walls';
import type { Hole, Window as WallWindow } from './act2_walls';
// (ACT 2, THE GATE WARD: its houses walked into, whole until he is in one, and its traps by their beat)
import { HouseShells, trapSprite } from './act2_houses';
import { Act1Pieces, SEE_TALL, act1PieceSteps } from './act1_pieces';
import { TOPS_CACHE, TopsCache } from './tops_cache';
import type { CachedTree, Chunk } from './tops_cache';
import { RES } from '../engine/screen';
import type { Terrain } from '../art/terrain';
import { act1Fx } from './act1_fx/index';
import { act1Stages } from '../art/act1_figs/index';
import { spikeAt as trapAt } from '../game/traps';
import { act1Def } from '../game/act1';
import { holdShows, inHold } from '../game/act1_layout';
import { risenBy, risingSprite } from './arrivals';
import { drawPillars } from './pillars';
import { EYRIE_SCENE, QUEST610_TEXT } from '../game/quests610';
import { onTop } from '../game/act2/quiettower';
/** (FLOOR 20) The picture's lean toward the Moth: the share of the way to it, at most this much of the screen, how high its body is over its floor point (game pixels, in the air and on the book), how fast it glides. */
const MOTH_LEAN = { share: 0.5, most: 0.3, up: 120, perched: 60, glide: 3 } as const;
import { BellsLook } from './bells';
import { redoubtGround } from '../art/redoubt';
import type { Painter } from './painter';
import type { BakedMonsters } from './monsters_baked';
import { QUEEN_ACTION } from '../art/carrion_queen_action';
import { eclipseDark } from '../art/carrion_queen_action_fx';
import { eclipseNow, eclipsePools } from '../game/act1_rules/queen';
import { operationNow } from '../game/act1_rules/physician';
import { FIELD, opDark } from '../art/physician_action_fx';
import { blinkNowhere, gaitOf } from '../game/bosses';
import type { Cam, Fallen, Fx } from './fx';
import { WILD } from '../art/moves3';
import { THRUST } from '../art/heroes3';
import { HUSH } from '../art/crier';
import { UNIQUE_PLAY } from './unique_play';
import { LEAP_LIFT, THRUST_LIFT, drawWildArrow, drawWildWave } from './wild';
import { golemCharge, makeContraptionArt, makeGolemArt } from '../art/tinkerer_art';
// (THE GOLEM'S ROCKET JUMP AND ITS RUN, the art chat's, behind GOLEM_ROCKET: off until he has seen them in the game and said yes)
import { GOLEM_ROCKET, ROCKET, RUN_STRIDE, golemRocketFrames, golemRocketFx, golemRunFrames, rocketShadow, rocketUp } from '../art/golem_rocket_fx';
import { chargeFrame } from '../dev/golem_moves';
import type { ContraptionArt } from '../art/tinkerer_art';
// (THE RANGER'S COMPANIONS: their pictures, the art chat's, behind COMPANIONS_ART_ON)
import { COMP_SHADOW, makeCompanionArt } from '../art/companions_art';
import { strideOf } from '../art/companions_art_moves';
import type { CompanionKind } from '../game/companions';
import type { Clip } from '../art/actor_types';
import { TINKER_TUNE } from '../game/tinkerer';
// (THE HIGH CITY, THE ROYAL CARDS: the crests over touched enemies, and the cards they drop)
import { drawRoyalCrest, royalCardSprite, royalLabelColor } from './royal_cards';
import { ROYAL_NAMES } from '../game/royal_cards';
import { ART_TWEAKS } from '../art/tweaks';
import type { LoadStep } from '../engine/steps';
import { tinkererFxSteps } from './tinkerer_fx';
import { warlockFxSteps } from './warlock_fx';
import { shaftStill } from '../art/shaft';

/** How solid a big thing is drawn while the hero is behind it (see `veil` in the frame). */
export const SEEN_THROUGH = 0.38;
export const STATION_NAME: Record<Station, string> = { gate: 'GATE', wordsmith: 'WORDSMITH', armourer: 'ARMOURER', mystic: 'MYSTIC', lexicon: 'LEXICON', stash: 'STASH', stranger: 'STRANGER' };
/**
 * How far over its floor point each service's name is written: over the top of whatever stands
 * there. (The mystic's is over the roof of his tent, measured from the table his service is used
 * at.) The game's own hands read this too: a name is touched like the thing it names (main.ts).
 */
/** QUEST MARKERS: how far over a floor's waypoint its marker floats (screen pixels, over its dais). */
const WAY_MARK_LIFT = 40;
export const NAME_LIFT: Record<Station, number> = { gate: 74, stash: 26, lexicon: 40, mystic: 86, wordsmith: 44, armourer: 50, stranger: 40 };

/** Where the master rune-stone lies beside the fallen wordsmith, from where he lies (tiles): by his reaching hand. */
const STONE_BY: readonly [number, number] = [0.55, -0.3];

export interface Art {
  /** The dungeon's floor and walls (art/ground.ts). */
  ground: GroundArt;
  /** What stands and lies in a dungeon (art/props.ts). */
  props: DungeonProps;
  /** Its doors and gates (art/gates.ts): drawn only where a level has any (game/doors.ts). */
  gates: GateArt;
  /** (THE TRAPS) Its spike floors and dart walls (art/hazards.ts): drawn only where a level has any (game/traps.ts). */
  hazards: HazardArt;
  /** The town's own things (art/town.ts) and its people (art/townsfolk.ts): Version 14.4. */
  town: TownProps;
  folk: Townsfolk;
  heroes: HeroArt;
  /** Every monster, the guardian and the boss (art/bestiary.ts). */
  bestiary: Bestiary;
  icons: IconArt;
  /** The orb the staff sets down, the familiar, and its bolt. */
  spells: SpellArt;
  /** THE MASTER RUNE-STONE (art/quest3.ts): a mock-up behind QUEST3, off. */
  quest?: StoneArt;
  /** RUNEDUST AND THE MELDSTONE (art/meld_drops.ts): a mock-up behind MELD_DROPS, off. */
  meldDrops?: MeldDropsArt;
  /** The fallen wordsmith of a character's first dungeon. */
}

/**
 * Milliseconds one drawing of the world may go on painting frames ahead of need (it paints one
 * whatever that costs), and how long the first drawing of a new place may.
 */
/**
 * THE LOOK OF THE DARK (the owner's "visual overhaul", 6 Oct 2026; Version 17). How strong the
 * soft shadow under a figure is at its middle. How dark unlit floor is far from the hero (it was
 * 0.8 everywhere up to Version 16), and the wide gentle pool round the hero that lifts it: its
 * reach in game pixels and how much of the dark it takes away at its middle. The vignette: where
 * it begins, as a share of the way from the middle of the screen to the middle of an edge, and how
 * dark it is in the corners (in a dungeon, in town).
 */
const SHADOW = 0.7;
/**
 * HER CONTRAPTIONS MADE EASIER TO SEE. His word, 2 Nov 2026, 21:13: “And it’s really hard to see the contraptions once you get the
 * passive skill” (her tree's Contraption: each a little tripod mortar 15 game pixels high, dark brass on the dark floor). Shown
 * three ways in play (con_options.png: a cyan ring, twice as big, both), his pick: “A: cyan ring only”. `ring`: the friend's cyan
 * ring on the floor round each set up; `scale`: drawn so many times as big (1: as painted).
 */
export const CON_SEEN = { on: true, ring: true, scale: 1 };
/** How wide the Tinkerer's Golem's shadow is (tiles round, as a monster's `r`): its broad feet and its fist planted. */
const GOLEM_SHADOW = 0.6;
/** (HER GOLEM'S ROCKET JUMP, behind GOLEM_ROCKET) The frame of its rocket jump (30 a second from deciding to jump, art/golem_rocket_fx.ts) `actT` seconds into it. */
const rocketFrame = (actT: number): number => Math.max(0, Math.min(ROCKET.end, Math.floor(actT * 30 + 1e-6)));
const FAR_DARK = 0.88;
const NEAR_POOL = 380;
const NEAR_LIFT = 0.36;
const VIGNETTE_FROM = 0.5;
const VIGNETTE = 0.62;
const VIGNETTE_TOWN = 0.4;
const WARM_MS = 2;
/** Where there is no painter (render/painter.ts): one frame of a heavy figure is painted every this many times the world is drawn. */
const HEAVY_EVERY = 4;
/** A boss below this share of its life has its death painted next by the painter (Painter.dieFirst). */
const DIE_SOON = 0.6;
const WARM_ENTER_MS = 90;

/** A light on a monster's picture lights the floor too if it is at least this big, in game pixels. */
const MONSTER_LIGHT_MIN = 7;

/** How far above the floor a familiar hangs, in game pixels (about the height of a hero's shoulder). */
const FAMILIAR_HOVER = 19;

/** One upright thing to draw, with its depth for back-to-front sorting. */
interface Stand {
  d: number;
  /** The order it was come to in (what is as deep as another is drawn in that order). */
  q: number;
  s: Sprite;
  /** Screen position of the sprite's anchor. */
  x: number;
  y: number;
  /** A flat-colour overlay drawn on top (hit flash, frost) and its strength. */
  over: Sprite | null;
  overA: number;
  scale: number;
  /** 1 = solid; less for phantoms and afterimages. */
  alpha: number;
  /** Drawn added to what is under it ('lighter'), as light is (floor 1's daylight: render/tomb.ts). */
  add?: boolean;
  /** The hero: the scarf and the feather that fly from the figure are drawn with it, behind and in front. */
  figure: Figure | null;
  /**
   * How far the figure is OUT OF PHASE, 0 (whole) to 1 (gone): it is drawn in thin slices that are
   * pulled apart sideways, each the other way from the last (a warp: see PHASE_OUT).
   */
  phase: number;
  /**
   * LEDGES AND STAIRS: the tiles of raised ground that stand in front of it and higher than the
   * ground it stands on (see `hide`): what of it lies behind them is not drawn. `hideBase`: how
   * far the ground it stands on is lifted (below nothing: sunken floor is lifted less than 0).
   */
  hide?: number[];
  hideBase?: number;
  /** (ACT 1, THE FOREST AS A FEW PICTURES: render/tops_cache.ts) a tree on the tops; a chunk's picture; drawn only between these screen columns; not drawn after all (its chunk is drawn as its trees). */
  top?: boolean;
  chunk?: Chunk;
  clip0?: number;
  clip1?: number;
  skip?: boolean;
  /** (ACT 2, behind ACT2_WALLS: render/act2_walls.ts) a bit of a wall standing whole, seen through round whoever is behind it: where, and how far. */
  holes?: Hole[];
}

/** (render/tops_cache.ts) How long a frame may spend making the forest's pictures (ms); one is made a frame at least. */
const TOPS_BUILD_MS = 3;

/** How much darker sunken floor is drawn than the room's own (0 to 1). */
const SUNK_DARK = 0.16;

/**
 * HEIGHT, as the renderer keeps it for a level that has any (game/height.ts has the rules): for
 * every tile the highest its ground stands, in pixels (a raised tile's floor, the head of a flight
 * of stairs; 0 for the room's own floor, a pit, a wall; LESS THAN 0 for sunken floor), how far the
 * ground is lifted at a place, and `low`: the lowest any floor of the level is lifted (0, or less
 * where there is sunken floor).
 */
interface Relief {
  floor: Floor;
  top: Int16Array;
  lift: (x: number, y: number) => number;
  low: number;
}

/** A phantom of the hero: a flat-colour copy of one of their pictures that fades away. */
interface Ghost {
  sp: Sprite;
  x: number;
  y: number;
  /** When it appears (the renderer's clock), how long it lasts, how solid it starts. */
  t0: number;
  dur: number;
  alpha: number;
}

/** Something small drawn over a character: ice round the frozen. */
interface Mark {
  x: number;
  y: number;
  kind: 'ice';
  seed: number;
}

interface Label {
  x: number;
  y: number;
  text: string;
  color: string;
}

/** TRIANGLES: which half of a cut tile its wall stands over, as the painter names the halves (game/types.ts, CUT_*; art/ground.ts, WallPart). */
function cutPart(c: number): WallPart {
  return c === CUT_FAR || c === CUT_FAR_LOW ? 'far' : c === CUT_NEAR || c === CUT_NEAR_LOW ? 'near' : c === CUT_LEFT || c === CUT_LEFT_LOW ? 'left' : 'right';
}

/** A whole number of things from a rate that need not be whole: 1.3 is one, and a second one 3 times in 10. */
function some(rate: number): number {
  return Math.floor(rate) + (Math.random() < rate % 1 ? 1 : 0);
}

/** (THE WARRIOR'S BATTLE AXE) A thrown axe at (x, y) on the screen, `age` seconds in the air: its haft and its blade, turning. */
function drawThrownAxe(g: CanvasRenderingContext2D, x: number, y: number, age: number): void {
  const a = age * 18;
  const c = Math.cos(a);
  const s = Math.sin(a);
  const at = (u: number, v: number): [number, number] => [Math.round(x + u * c - v * s), Math.round(y + (u * s + v * c) * 0.6)];
  g.fillStyle = '#5a3a22';
  for (let k = -5; k <= 5; k++) {
    const [px, py] = at(k, 0);
    g.fillRect(px, py, 1, 1);
  }
  g.fillStyle = '#c8ccd8';
  for (let u = 2; u <= 5; u++) for (let v = 1; v <= 4 - (5 - u); v++) {
    const [px, py] = at(u, -v);
    g.fillRect(px, py, 1, 1);
  }
  const [ex, ey] = at(5, -1);
  g.fillStyle = '#f2f4fa';
  g.fillRect(ex, ey, 1, 1);
}

function ellipse(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number): void {
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(cx, cy, r * 22.6, r * 11.3, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
}

/**
 * MONSTER PACKS: drawn as an elite is, its name over it, its bar always, its ring: an elite (a yellow
 * pack's leader is one), and, with PACK_LOOK, every one of a blue pack.
 */
function named(m: Monster): boolean {
  return m.elite || (PACK_LOOK.on && m.rarity === 'blue');
}

/** (ACT 1, THE DESCENT: one of its own kinds out of sight where it lies, as its kind has it: the Drowned under the water until it rises. Nothing of it is drawn, its shadow, ring, bar and name too: render/act1_fx, `hidden`.) */
function unseen(m: Monster): boolean {
  // (the Fleshmancer between his two pits, FLESH_BLINK: nowhere)
  if (m.kind === 'fleshmancer' && blinkNowhere(m)) return true;
  const f = act1Fx(m.kind);
  return !!(f && f.hidden && f.hidden(m));
}

/** The colour of a named monster's name: its word's; with PACK_LOOK, a blue pack's blue and a yellow pack's leader's yellow (the colours of magic and rare things). */
function nameColor(m: Monster): string {
  // (UNIQUE ITEMS, behind a switch that is off: The Crier's Hush, its words darkened: written in the Hush's dead grey)
  if (UNIQUE_PLAY.hush && m.dark) return HUSH[4];
  if (PACK_LOOK.on && m.rarity === 'blue') return RARITY_COLOR[1];
  if (PACK_LOOK.on && m.rarity === 'leader') return RARITY_COLOR[2];
  return m.words.length ? WORD_COLOR[m.words[0]] : P.fr4;
}

function ringDots(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, gap = 1): void {
  g.fillStyle = color;
  const n = Math.max(16, Math.round(r * 44));
  for (let i = 0; i < n; i += gap) {
    const a = (i / n) * Math.PI * 2;
    g.fillRect(Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * r), Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * r), 1, 1);
  }
}

/** How much of a body's own brightness is left once it has lain a while (it is drawn that much over the floor), and how long it takes to settle, in seconds. */
const BODY_DIM = 0.72;
const BODY_SETTLES = 1.5;

/**
 * The ring round the feet of the enemy the hero is locked onto (touch): four bright arcs, two
 * pixels thick, that turn slowly, so that it cannot be taken for the dotted ring of a named
 * monster. It has to be seen at a glance in the middle of a fight, on a phone.
 */
function lockRing(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, t: number): void {
  const n = Math.max(8, Math.round(r * 16)) * 4;
  const quarter = n / 4;
  const lit = Math.round(quarter * 0.62);
  const turn = Math.floor(t * 10);
  for (let i = 0; i < n; i++) {
    const k = (((i - turn) % quarter) + quarter) % quarter;
    if (k >= lit) continue;
    const a = (i / n) * Math.PI * 2;
    const ux = Math.cos(a) - Math.sin(a);
    const uy = Math.cos(a) + Math.sin(a);
    // (dark underneath, so that it shows on a lit floor as well as on a dark one)
    g.fillStyle = P.ink;
    g.fillRect(Math.round(cx + ux * 16 * (r + 0.09)), Math.round(cy + uy * 8 * (r + 0.09)), 1, 1);
    g.fillStyle = k === 0 || k === lit - 1 ? P.gd3 : P.gd4;
    g.fillRect(Math.round(cx + ux * 16 * r), Math.round(cy + uy * 8 * r), 1, 1);
    g.fillStyle = k === 0 || k === lit - 1 ? P.gd4 : P.gd5;
    g.fillRect(Math.round(cx + ux * 16 * (r - 0.06)), Math.round(cy + uy * 8 * (r - 0.06)), 1, 1);
  }
}

function elementColors(el: Element, arcane: boolean): readonly string[] {
  return el === 'phys' ? (arcane ? ELEMENT_RAMP.arcane : ELEMENT_RAMP.phys) : ELEMENT_RAMP[el];
}

/**
 * A warp, as it is seen (from Version 15.1; the owner, on his page of notes: "phase out and phase
 * back in"). Where the mage went from, the figure as it stood is drawn for PHASE_OUT seconds,
 * coming apart in slices and fading; where they come out, the figure comes together out of slices
 * over PHASE_IN seconds. (The rules move the mage in an instant, as before: only the picture.)
 */
const PHASE_OUT = 0.2;
const PHASE_IN = 0.22;
/** How long a hero who arrives by a warp at the start of a run takes to come together (longer than a warp in a fight: it is an entrance). */
export const ARRIVE_IN = 0.4;

/** How far a struck monster is knocked back, in game pixels (the Warden: FLINCH_BOSS), and the length of the flash it lasts for. */
const FLINCH = 3;
const FLINCH_BOSS = 1;
const FLINCH_TIME = 0.12;
/**
 * ... and a HERO who is struck hard is rocked back on their heels (their art's `reel`: "I want
 * things to have weight"): by a blow that takes this share of their whole life or more. Lesser
 * blows (a bat's bite) flash and shake the screen as before, and do not stop them in their
 * stride. REEL_TIME: how long the renderer goes on saying so, in seconds (the picture is shorter).
 */
const REEL_AT = 0.1;
const REEL_TIME = 0.4;

/**
 * ONE KILLED UP IN THE AIR (a vulture overhead, since Version 23.5: his words, 20 Oct 2026, 21:31 Pacific, “Oh the vultures
 * being unhittable in the air has to go.  It’s infuriating to fight them”): how far up its falling picture is drawn
 * (game pixels), and how much of it shows. Its death is painted from its flight to lying on its back (art/ledge_vultures.ts
 * VULTURE_DEATH: the blow held a tenth, the fall to the floor by 0.62 s); the height it was flying at comes down with that
 * fall, faster and faster. Over the drop (`away`) it falls on past the floor into it, fading out by FALL.gone.
 */
export const FALL = { from: 0.1, to: 0.62, fade: 0.35, gone: 0.8 } as const;
/** THE STOKER's scattered pieces fade over this long once his death is done (the art chat's: “fade the scattered pieces after the last frame”). */
export const STOKER_PIECES_FADE = 2.0;
export function fallenLift(f: { lift?: number; away?: boolean; t: number }): { up: number; alpha: number } {
  const L = f.lift ?? 0;
  const k = Math.max(0, (f.t - FALL.from) / (FALL.to - FALL.from));
  if (!f.away) return { up: L * (1 - Math.min(1, k) * Math.min(1, k)), alpha: 1 };
  return { up: L * (1 - k * k), alpha: Math.max(0, Math.min(1, 1 - (f.t - FALL.fade) / (FALL.gone - FALL.fade))) };
}

export class Renderer {
  /** ACT 2, THE BELLS: the Hush's fog and the bells' arrows (render/bells.ts). */
  private bellsLook = new BellsLook();
  private dark: HTMLCanvasElement;
  private dg: CanvasRenderingContext2D;
  private stands: Stand[] = [];
  /** The hero's picture as it was last shown where they stood (what phases out when they warp away). */
  private heroWas: Sprite | null = null;
  /**
   * How long ago the hero's life ran out, in seconds (-1 while they live), and the screen's clock
   * when it was last looked at. The game's own clock stops when the hero falls (the world stands
   * still round them), so the fall is timed by the screen's.
   */
  private fallT = -1;
  private fallClock = 0;
  /**
   * How long ago a heavy blow rocked the hero back, in seconds of the game's time (-1: none
   * lately); and the hero's flash and life as they were when last looked at, to know a new blow
   * and how much it took.
   */
  private reelT = -1;
  /** How far the hero has walked, in tiles, all told, and where they were a frame ago (a walk whose feet grip the floor is shown by it: art/moves3.ts, GRIP). */
  private walked = 0;
  private walkedFrom: [number, number] | null = null;
  private reelBehind = false;
  private flashWas = 0;
  private lifeWas = 0;
  /** Pictures painted once and stamped many times: ground patches, clouds, the pool of light. */
  private kept = new Map<string, HTMLCanvasElement>();
  private labels: Label[] = [];
  private ghosts: Ghost[] = [];
  private marks: Mark[] = [];
  /** The way each of the town's people was turned when last drawn (to the hero, who had come right up to them), or null: facing their work. */
  private folkTurn = new Map<string, Facing | null>();
  /** Where the hero's anchor is this frame, for the lights the figure gives off (null while it blinks out in a roll). */
  private heroLit: { x: number; y: number } | null = null;
  /**
   * The monsters drawn this frame whose pictures give off light (eyes, a flame in a hand, a hot
   * maul), each with where its anchor is: their lights are added after the darkness is laid down,
   * as the hero's are, and the bigger ones light the floor about them.
   */
  private monsterLit: { s: Sprite; x: number; y: number }[] = [];
  /** A brazier's fire, an open portal: what glows on a thing that stands in the dungeon. */
  private propLit: { s: Sprite; x: number; y: number }[] = [];
  /** (RUNEDUST AND THE MELDSTONE) What is drawn again over the lights, so that a place's bright light does not wash it out: unless the hero stands in front of it. */
  private overLit: { d: number; s: Sprite; x: number; y: number; scale: number }[] = [];
  /** The figures in this dungeon, for painting their frames ahead of need (see Bestiary.warm). */
  private figures: MonsterFigure[] = [];
  /** Those of them that are heavy (art/bestiary.ts HEAVY_FIGURES) and the game's own to paint, there being no painter. */
  private heavy: MonsterFigure[] = [];
  /** THE FIRST FIVE FLOORS: the painter of what is too heavy to paint here (render/painter.ts), if the game has one. */
  painter: Painter | null = null;
  /**
   * THE FLOORS' MONSTERS BAKED (render/monsters_baked.ts; main.ts): their pictures painted when the game was built, taken in
   * under the loading screen as a floor is come into, and here as a figure is first seen (null: none to be had). A figure
   * whose pictures are the bake's is not painted ahead by the painter, nor by the game.
   */
  bakedMobs: BakedMonsters | null = null;
  /** The bosses whose death has been asked to be painted next (Painter.dieFirst, Bestiary.dieFirst); begun again with each floor. */
  private dieSoon = new Set<MonsterFigure>();
  private dieSoonFor: unknown = null;
  /**
   * (A BOSS NEARING ITS END) The rest of what its death shows that the game itself paints, as it is first shown, where it is played
   * (dieAheadOf): each frame still to be painted, painted ahead here with the monsters' frames, a frame at a time; `dieAheadAt`, the
   * next. Begun again with each floor.
   */
  private dieAhead: (() => unknown)[] = [];
  private dieAheadAt = 0;
  /** THE FIRST FIVE FLOORS, drawn: the mine shaft and its cage, the stairwell's opening (render/dress.ts). */
  readonly dress: FloorDress;
  /** What the renderer lends it. */
  private readonly stage: Stage;
  /** THE FIRST FIVE FLOORS, drawn: each floor's own pieces and its moments (render/pieces.ts). */
  readonly pieces: FloorPieces;
  /** THE HEADSMAN'S YARD, floor 2's boss hall outdoors (render/yard.ts). */
  readonly yard: YardView;
  /** FLOOR 3, THE BLACK IRON PRISON (render/prison.ts, behind PRISON). */
  readonly prison = new PrisonView();
  /** FLOOR 1, THE KING'S TOMB (render/tomb.ts, behind TOMB). */
  readonly tomb = new TombView();
  /** THE FIRST TOWN AS THE CASTLE'S HALL (render/castle.ts, behind CASTLE_HALL). */
  readonly castle = new CastleView();
  /** THE ENDLESS TOWN, THE SHAFT'S RIM (render/rim.ts, behind ENDLESS_TOWN). */
  readonly rim = new RimView();
  /** FLOOR 4, THE BURIED CHAPEL OF BONES (render/chapel.ts, behind CHAPEL). */
  readonly chapel = new ChapelView();
  /** FLOOR 5, THE MINE THAT BECOMES HIS TEMPLE (render/lair.ts, behind LAIR_TEMPLE). */
  readonly lair = new LairView();
  /** FLOOR 2, THE PRISON'S GROUNDS AT NIGHT (render/grounds.ts, behind GROUNDS). */
  readonly grounds = new GroundsView();
  /** (FLOOR 2, THE PRISON'S GROUNDS: this frame's level while the sky is over one of its courtyards: only what is not behind its far walls is drawn) */
  private groundsOnly: Game['level'] | null = null;
  /** THE FIRST FIVE FLOORS' NEW LOOKS (render/looks.ts): the one of the floor being drawn, if any (set as each frame's floor is drawn). */
  private lookNow: LookView | null = null;
  /** The new look of this level's floor, if it has one on. */
  lookOf(L: Game['level']): LookView | null {
    for (const v of [this.rim, this.castle, this.tomb, this.grounds, this.prison, this.chapel, this.lair] as LookView[]) if (v.on(L)) return v;
    return null;
  }
  /** (forgetLooks) The level the looks were last sorted for. */
  private lookedFor: Game['level'] | null = null;
  /**
   * EACH FLOOR'S PICTURES LET GO AS ANOTHER IS COME INTO. Every look made its pictures the first time its floor was drawn and kept
   * them for good, about twenty megabytes of canvases a floor, floors 1 to 5 together near three times what the game begins with;
   * a phone's browser closes the page past its own limit for them. His words, 4 Nov 2026, 08:12: “I don’t know if my phone is
   * getting to hot or whatever but it’s crashing every couple of levels”. So every look but this floor's lets its pictures go (and
   * the game's own ground in its colours), made again if its floor is come back to.
   */
  private forgetLooks(L: Game['level'], keep: LookView | null): void {
    this.lookedFor = L;
    // (the last place's steady glows as one picture, and its floor: render/still_glows.ts, render/still_floor.ts)
    this.stillGlows.forget();
    this.stillFloor.forget();
    this.stillDark.forget();
    for (const v of [this.rim, this.castle, this.tomb, this.grounds, this.prison, this.chapel, this.lair] as LookView[]) {
      if (v === keep) continue;
      v.forget?.();
      this.lookGrounds.delete(v);
    }
    if (!L.floor.yard) this.yard.forget();
    // (and the art's own made copies: each floor's look and its gate; the town's hall and the yard's, by their own views' forget)
    const groups: [LookView, (() => void)[]][] = [
      // (and, since 11 Nov 2026, the pieces and gates each look is made from: art/floor1.ts to floor5.ts)
      [this.tomb, [forget_tomb, forget_tomb_gate, forget_floor1]],
      [this.grounds, [forget_grounds, forget_floor2]],
      [this.prison, [forget_prison, forget_prison_gate, forget_stoker_room, forget_floor3]],
      [this.chapel, [forget_chapel, forget_chapel_gate, forget_floor4]],
      [this.lair, [forget_lair_temple, forget_lair_gate, forget_floor5, forget_lair]],
    ];
    for (const [v, fns] of groups) if (v !== keep) for (const fn of fns) fn();
  }
  /** A picture of the game's own walls (a slanting wall) in the look of the floor being drawn: the prison's colours on floor 3. */
  private lookGrade(sp: Sprite): Sprite {
    return this.lookNow ? this.lookNow.graded(sp) : sp;
  }
  /** (the game's own ground in each look's colours, made the first time each is wanted) */
  private lookGrounds = new Map<LookView, { of: GroundArt; g: GroundArt }>();
  /**
   * THE GAME'S OWN GROUND in the look of the floor being drawn (its ledges, lips and rims, its stairs between heights, its pits):
   * the looks' art has none of these, so the Crypt's are drawn in the look's colours, and its floor is the look's own flags.
   */
  private lookGround(): GroundArt {
    const G = this.art.ground;
    const look = this.lookNow;
    if (!look) return G;
    const had = this.lookGrounds.get(look);
    if (had && had.of === G) return had.g;
    const k = (sp: Sprite): Sprite => look.graded(sp);
    const ks = (list: Sprite[]): Sprite[] => list.map(k);
    const g: GroundArt = {
      ...G,
      floor: (tx: number, ty: number) => look.flags(tx, ty),
      ledgeLeft: ks(G.ledgeLeft),
      ledgeRight: ks(G.ledgeRight),
      lipLeft: k(G.lipLeft),
      lipRight: k(G.lipRight),
      rimLeft: k(G.rimLeft),
      rimRight: k(G.rimRight),
      stairsN: k(G.stairsN),
      stairsNSide: k(G.stairsNSide),
      stairsW: k(G.stairsW),
      stairsWSide: k(G.stairsWSide),
      pit: k(G.pit),
      pitLeft: ks(G.pitLeft),
      pitRight: ks(G.pitRight),
    };
    this.lookGrounds.set(look, { of: G, g });
    return g;
  }
  /** (the yard's floor, this frame, while the hero is in it: only it, its walls and its way in are drawn) */
  private yardOnly: Game['level']['floor'] | null = null;
  /** Whether this frame's level is laid with them. */
  private dressed = false;
  /** ACT 1, THE DESCENT: the outdoor ground of a floor of it, painted in pieces (render/outdoor.ts). */
  readonly outdoor = new OutdoorGround();
  /** (and each floor's own pieces, and what stands on its tops: render/act1_pieces.ts) */
  readonly act1 = new Act1Pieces();
  private act1Dressed = false;
  /** (ACT 2, THE GATE WARD: the shells of its houses walked into, faded while the hero is in one: render/act2_houses.ts) */
  readonly houses = new HouseShells(() => this.painter);
  /** (and whether this frame shows the open ground, or the hall inside a stronghold, which is drawn as a dungeon's room) */
  private openGround = false;

  /** The kicks of the screen this frame's films ask for (main.ts kicks it, and sounds a blow for each). */
  kicks(): Kick[] {
    // (ACT 2, THE HUSH: and its floor's moment's: render/act1_pieces.ts)
    return [...this.dress.kicks(), ...this.pieces.kicks(), ...this.act1.kicks()];
  }
  /** (THE FLOORS' SCENE SOUNDS) The sounds of the floor's moments begun this frame (game/scene_sounds.ts; main.ts plays them). */
  momentSounds(): string[] {
    return [...this.pieces.sounds(), ...this.act1.sounds()];
  }
  /** The place whose first drawing has been used to paint frames ahead (see heroArt). */
  private warmedFor: unknown = null;
  /** Frames drawn, for the hero's and the monsters' turns at painting ahead (see heroArt). */
  private warmFrame = 0;
  /** The level whose fallen monsters the effects are keeping (their bodies lie until the hero leaves it). */
  private fallenFor: unknown = null;
  /** The hero as a moving figure: which frame, the scarf and the feather, what they do when left standing. */
  readonly figure = new Figure();
  /** THE VETERAN (game/veteran.ts, behind VETERAN): his frame while a move plays, and what his blows throw off (render/veteran_fx.ts). */
  readonly vetFx = new VeteranFx();
  /** THE WARLOCK'S PACKS asked for ahead (render/warlock_packs.ts; main.ts sets it where he is baked in packs): none, nothing asked. */
  warlockPacks: AskPack | null = null;
  /** Which hero the figure was last asked for (a new character starts over). */
  private figureOf = '';
  /** The hero's life as a bar over their head: when it is there and what it shows (lifebar.ts). */
  readonly lifeBar = new LifeBar();
  /** Where the hero stands on screen this frame, and how far above that point over-head things begin. */
  private heroAt = { x: 0, y: 0, top: 32 };
  /** Where the last afterimage of a hasted hero was left. */
  private blurAt = { x: 0, y: 0 };
  cam: Cam = { ox: 0, oy: 0 };
  /** A point of the floor (tiles) on the screen, by this frame's camera: for what is drawn in the game's own pixels on the floor (art/mob_shots.ts, render/pack_marks.ts). */
  private readonly floorAt = (x: number, y: number): readonly [number, number] => [wx(this.cam, x, y), wy(this.cam, x, y)];
  /** The height of the level being drawn (null: it is all of one height), and the level it was made for. */
  private relief: Relief | null = null;
  /** (THE WALLS' LOOK) The walls that are left out, for the level and the look they were worked out for. */
  private awayGrid: Uint8Array | null = null;
  private awayFor: Game['level'] | null = null;
  private awayKey = 0;

  /**
   * THE WALLS' LOOK. Which walls are toward the eye: the game's own (a wall with floor right
   * behind it: level.ts, `lowWalls`), or, if the look says so (`away`), every wall that would hide
   * floor if it stood whole (render/walls.ts, `wallsAway`). Worked out once for a level and a look.
   */
  private lowWalls(L: Game['level']): Uint8Array {
    if (!WALL_LOOK.away) return L.low;
    // (WHOLE_WALLS: on floors 1 to 5 every wall stands, and none stands again beside a door: render/walls.ts)
    if (this.wholeHere(L)) {
      if (!this.noneAway || this.noneAway.length !== L.floor.w * L.floor.h) this.noneAway = new Uint8Array(L.floor.w * L.floor.h);
      this.doorBack = null;
      this.awayFor = null;
      return this.noneAway;
    }
    const key = WALL_LOOK.tall * 1000 + WALL_LOOK.fade * 2 + (WALL_LOOK.faces ? 1 : 0) + (DOOR_WALLS.on ? 100000 : 0);
    if (this.awayGrid && this.awayFor === L && this.awayKey === key) return this.awayGrid;
    this.awayGrid = wallsAway(L.floor, WALL_LOOK);
    // (THE WALL BESIDE A DOOR, a mock-up behind DOOR_WALLS: the walls beside a door in a back wall stand again)
    this.doorBack = null;
    if (DOOR_WALLS.on && WALL_LOOK.faces) {
      const back = doorWallsBack(L.floor, this.awayGrid);
      for (let i = 0; i < back.length; i++) if (back[i]) this.awayGrid[i] = 0;
      this.doorBack = back;
    }
    this.awayFor = L;
    this.awayKey = key;
    return this.awayGrid;
  }

  /** (WHOLE_WALLS) Does every wall stand on the floor being drawn; the game and the clock of this frame (for the slanting walls). */
  private wholeNow = false;
  private gameNow: Game | null = null;
  private clockNow = 0;
  /** (WHOLE_WALLS) An empty grid: no wall left out. */
  private noneAway: Uint8Array | null = null;
  /** (WHOLE_WALLS) Does every wall stand on this level: floors 1 to 5 of the dungeon, the switch on? */
  wholeHere(L: Game['level']): boolean {
    return WHOLE_WALLS.on && WALL_LOOK.faces && !L.town && L.floor.depth >= 1 && floorLook(L.floor.depth) >= 1 && floorLook(L.floor.depth) <= 5;
  }
  /** (WHOLE_WALLS) How solid each wall tile is drawn now (1 solid, WHOLE_WALLS.faint seen through), and when it was last drawn. */
  private wallFade = new Map<number, { a: number; t: number }>();
  /**
   * (WHOLE_WALLS) How solid a wall tile is drawn: faint where it stands in front of the hero within a wide stretch either side of
   * him (wholly faint near him, less so toward its edge), or in front of a monster in sight (a man's width); fading over
   * WHOLE_WALLS.secs. (px, py): the wall tile's top corner on the screen; `depth` its depth.
   */
  private wallVeil(game: Game, idx: number, px: number, py: number, depth: number, t: number): number {
    const W = WHOLE_WALLS;
    const tall = WALL_LOOK.tall;
    // (BACK_STAND: the wall's painted faces, and its tile, to tell a wall he looks at from one between him and the eye)
    const f = game.level.floor;
    const back = BACK_STAND.on ? wallFaces(f, idx) : 0;
    const tx = idx % f.w;
    const ty = (idx - tx) / f.w;
    // (how much of the wall is wanted, for a figure at (fx, fy) at depth d (at (ox, oy) on the floor), `half` pixels either side of it)
    const want = (fx: number, fy: number, d: number, half: number, full: number, ox: number, oy: number): number => {
      if (d >= depth - 0.5) return 1;
      // (BACK_STAND: a face of it looks out over the ground the figure stands on: a back wall to it, never seen through)
      if ((back & FACE_LEFT && oy >= ty + 1) || (back & FACE_RIGHT && ox >= tx + 1)) return 1;
      if (py - tall > fy + 30 || py + 16 < fy - 72) return 1;
      const off = Math.max(0, Math.abs(px - fx) - 16);
      if (off >= half) return 1;
      if (off <= half * full) return W.faint;
      return W.faint + ((1 - W.faint) * (off - half * full)) / (half * (1 - full));
    };
    let a = 1;
    const at = this.wallHero;
    if (at) a = Math.min(a, want(at.x, at.y, at.d, W.across, 0.6, at.hx, at.hy));
    if (a > W.faint) {
      for (const m of game.monsters) {
        if (m.dead || !m.seen) continue;
        a = Math.min(a, want(wx(this.cam, m.x, m.y), wy(this.cam, m.x, m.y), m.x + m.y, 30, 0.5, m.x, m.y));
        if (a <= W.faint) break;
      }
    }
    const was = this.wallFade.get(idx);
    let now = a;
    if (was) {
      const dt = Math.max(0, Math.min(0.1, t - was.t));
      const rate = (1 - W.faint) / W.secs;
      now = was.a < a ? Math.min(a, was.a + rate * dt) : Math.max(a, was.a - rate * dt);
    }
    this.wallFade.set(idx, { a: now, t });
    return now;
  }

  /** (THE WALL BESIDE A DOOR) The walls that stand again beside the doors of this level (render/walls.ts, `doorWallsBack`), or null. */
  private doorBack: Uint8Array | null = null;
  /** (THE WALL BESIDE A DOOR) How seen through each of them is now (1 solid, SEEN_THROUGH clear), and the time it was last drawn: it fades over a fifth of a second. */
  private doorFade = new Map<number, { a: number; t: number }>();

  /**
   * (THE WALL BESIDE A DOOR) How solid a wall that stands again beside a door is drawn: SEEN THROUGH
   * while the hero, or a monster in sight, is behind it (further up the screen, and under its faces:
   * 32 pixels wide from its top to their foot), solid otherwise; it fades between the two over a
   * fifth of a second rather than all at once.
   */
  private doorVeil(game: Game, idx: number, px: number, py: number, depth: number, t: number): number {
    const tall = WALL_LOOK.tall;
    const under = (fx: number, fy: number, d: number): boolean => d < depth - 0.5 && px + 16 > fx - 8 && px - 16 < fx + 8 && py - tall < fy - 2 && py + 16 > fy - 32;
    let want = 1;
    const at = this.wallHero;
    if (at && under(at.x, at.y, at.d)) want = SEEN_THROUGH;
    else {
      for (const m of game.monsters) {
        if (m.dead || !m.seen) continue;
        if (under(wx(this.cam, m.x, m.y), wy(this.cam, m.x, m.y), m.x + m.y)) {
          want = SEEN_THROUGH;
          break;
        }
      }
    }
    const was = this.doorFade.get(idx);
    let a = want;
    if (was) {
      const dt = Math.max(0, Math.min(0.1, t - was.t));
      const rate = (1 - SEEN_THROUGH) / 0.2;
      a = was.a < want ? Math.min(want, was.a + rate * dt) : Math.max(want, was.a - rate * dt);
    }
    this.doorFade.set(idx, { a, t });
    return a;
  }

  /**
   * (THE CRYPT, art/crypt_ways.ts; a mock-up behind CRYPT) What of the stairwell and the waypoint
   * lies on the floor: the opening and its steps, and the dais, asleep or awake. Only where a
   * picture puts them (CRYPT.marks): nothing of the game knows of them.
   */
  private flatCrypt(g: CanvasRenderingContext2D, L: Game['level'], t: number): void {
    const m = CRYPT.marks;
    const art = lookWays(Math.max(1, floorLook(L.floor.depth)));
    const cam = this.cam;
    if (m.stair) {
      const sp = art.stair[m.stair.way];
      g.drawImage(sp.img, Math.round(wx(cam, m.stair.x, m.stair.y)) - sp.ax, Math.round(wy(cam, m.stair.x, m.stair.y)) - sp.ay, sp.w, sp.h);
    }
    if (m.way) {
      const sp = m.way.state === 'asleep' ? art.way.asleep : art.way.awake[Math.floor(t * 10) % WAY_FRAMES];
      const x = Math.round(wx(cam, m.way.x, m.way.y));
      const y = Math.round(wy(cam, m.way.x, m.way.y));
      g.drawImage(sp.img, x - sp.ax, y - sp.ay, sp.w, sp.h);
      if (sp.lights) this.propLit.push({ s: sp, x, y });
    }
  }

  /**
   * THE WAYS (game/ways.ts, behind WAYS; their pictures art/crypt_ways.ts): what of the level's
   * stairwell (once its boss is dead and it has opened) and its waypoint lies on the floor, in that
   * floor's stone (the town's in the first floor's).
   */
  private flatWays(g: CanvasRenderingContext2D, L: Game['level'], t: number, game: Game): void {
    const W = L.ways;
    if (!W) return;
    const art = this.waysOf(L);
    const cam = this.cam;
    const st = W.stair;
    // (THE FIRST FIVE FLOORS: while its opening is played from its film, the film is the stairwell: render/dress.ts)
    if (st && st.open && L.explored[st.y * L.floor.w + st.x] && !this.dress.stairPlaying(game)) {
      // (EXITS: the town's stairs down, the art chat's, three tiles by two, once made)
      // (THE FIRST TOWN AS THE CASTLE'S HALL: its own stairs down, the hall's stone turning to floor 1's: art/castle_hall.ts)
      const sp = (L.town ? (this.castle.on(L) ? this.castle.A().stairs(st.way) : this.dress.townWays(game)?.stairs) : null) ?? art.stair[st.way];
      g.drawImage(sp.img, Math.round(wx(cam, st.x, st.y)) - sp.ax, Math.round(wy(cam, st.x, st.y)) - sp.ay, sp.w, sp.h);
    }
    // (EXITS: floor 1's stairs up to the town, seen through its gate's arch, with the floor: anchored as the arch's strips are)
    // (THE FIRST TOWN AS THE CASTLE'S HALL: through its gate the passage through the castle's wall and the day beyond, the road out
    // to the Quarry, anchored so too: art/castle_hall.ts)
    const hall = this.castle.on(L) ? this.castle.A().gate : null;
    for (const d of L.doors) {
      const s = d.spot;
      const sp = s.kind === 'waygate' ? (hall && L.doors[W.gate] === d ? hall.beyond(s.alongX) : this.dress.stairsUp(game, s)) : null;
      if (!sp || !doorTiles(L.floor, s).some((i) => L.explored[i] === 1)) continue;
      const face = doorFace(s);
      const wide = PILLAR / 32;
      const [x, y] = s.alongX ? [s.a - wide, face] : [face, s.a - wide];
      g.drawImage(sp.img, Math.round(wx(cam, x, y)) - sp.ax, Math.round(wy(cam, x, y)) - sp.ay, sp.w, sp.h);
    }
    // (ACT 1: and the way on, once it has woken: a waypoint's own picture, awake: nothing is there before)
    // (EXITS, floors 6 to 10: where the art chat's way on is drawn, not the column: render/dress.ts)
    const drawn = this.dress.onwardDrawn(game);
    for (const w of [W.way, W.onward && W.onward.awake && !drawn ? W.onward : null]) {
      if (!w || !L.explored[Math.floor(w.y) * L.floor.w + Math.floor(w.x)]) continue;
      const sp = w.awake ? art.way.awake[Math.floor(t * 10) % WAY_FRAMES] : art.way.asleep;
      const x = Math.round(wx(cam, w.x, w.y));
      const y = Math.round(wy(cam, w.x, w.y));
      g.drawImage(sp.img, x - sp.ax, y - sp.ay, sp.w, sp.h);
      if (sp.lights) this.propLit.push({ s: sp, x, y });
    }
  }

  /** THE WAYS' PICTURES for this level: its floor's; the town's the first floor's (THE CAMP, game/camp.ts: its waypoint in the city's grey stone, art/hub2.ts CITY). */
  private waysOf(L: Game['level']): ReturnType<typeof lookWays> {
    if (isCamp(L)) return (this.cityWays ??= { stair: lookStairs(1), way: makeWaypointArt(CITY) });
    // (THE SHAFT'S RIM: its waypoint's dais in the rim's stone, as the art chat's pictures have it: render/rim.ts)
    if (this.rim.on(L)) return this.rim.ways();
    // (THE FIRST TOWN AS THE CASTLE'S HALL: its waypoint's dais in the castle's stone: art/castle_hall.ts)
    if (this.castle.on(L)) return (this.hallWays ??= { stair: lookStairs(1), way: this.castle.A().way });
    return lookWays(L.town ? 1 : Math.max(1, floorLook(L.floor.depth)));
  }
  private cityWays: ReturnType<typeof lookWays> | null = null;
  private hallWays: ReturnType<typeof lookWays> | null = null;
  /** (THE CAMP) Its three people's pictures, painted once each as they are first wanted. */
  private folkFrames = new Map<string, Sprite>();

  /** THE WAYS: what stands over the level's waypoint: the motes of light while it is awake; the column of a warp, by the level's own time (`now`). */
  private standWays(L: Game['level'], t: number, now: number, game: Game): void {
    // (ACT 1: the way on too, once awake: its column flares as it wakes, as a warp's)
    const drawn = this.dress.onwardDrawn(game);
    for (const w of [L.ways?.way, L.ways?.onward && L.ways.onward.awake && !drawn ? L.ways.onward : null]) {
      if (!w || !L.explored[Math.floor(w.y) * L.floor.w + Math.floor(w.x)]) continue;
      const art = this.waysOf(L);
      const f = w.warpAt === null ? -1 : Math.floor((now - w.warpAt) * 20);
      const warp = f >= 0 && f < WARP_FRAMES;
      if (!warp && !w.awake) continue;
      const sp = warp ? art.way.warp[f] : art.way.motes[Math.floor(t * 10) % WAY_FRAMES];
      const x = Math.round(wx(this.cam, w.x, w.y));
      const y = Math.round(wy(this.cam, w.x, w.y));
      // (a warp's column stands in front of the hero on the dais: it is what he goes into, and comes out of)
      this.stand(w.x + w.y + (warp ? 0.05 : 0), sp, x, y);
      if (sp.lights) this.propLit.push({ s: sp, x, y });
    }
  }

  /** (THE CRYPT) What stands over the waypoint: motes of light rising while it is awake; the column of a warp. */
  private standCrypt(L: Game['level'], t: number): void {
    const m = CRYPT.marks;
    if (!m.way || m.way.state === 'asleep') return;
    const art = lookWays(Math.max(1, floorLook(L.floor.depth)));
    // (a warp is over when its last frame has been shown: nothing stands over the dais then)
    const f = Math.max(0, Math.floor((t - m.way.t0) * 20));
    if (m.way.state === 'warp' && f >= WARP_FRAMES) return;
    const sp = m.way.state === 'warp' ? art.way.warp[f] : art.way.motes[Math.floor(t * 10) % WAY_FRAMES];
    const x = Math.round(wx(this.cam, m.way.x, m.way.y));
    const y = Math.round(wy(this.cam, m.way.x, m.way.y));
    // (a warp's column stands in front of the hero on the dais: it is what he goes into)
    this.stand(m.way.x + m.way.y + (m.way.state === 'warp' ? 0.05 : 0), sp, x, y);
    if (sp.lights) this.propLit.push({ s: sp, x, y });
  }

  /**
   * DOORS AND GATES (game/doors.ts; their pictures: art/gates.ts): whatever stands in the level's
   * doorways, among everything else that stands. EVERYTHING OF ONE STANDS IN THE PLANE OF ITS
   * WALL'S FACE THAT IS TURNED TO THE EYE (`doorFace`), counted along it from where its doorway
   * begins; what is flat in that plane (a lintel, an arch, a portcullis) comes as STRIPS a quarter
   * of a tile wide, each stood at its own depth, so that a figure is in front of the part it is in
   * front of and behind the rest.
   *   A DOOR: a post just before the opening (the middle tile of the three) and one just after it,
   *   the lintel across their heads, and its one leaf, hung on the first post: shut it lies across
   *   the opening; open it is swung back a quarter turn into the thickness of the wall.
   *   THE BOSS'S GATE: a pillar just outside each end of the doorway, the arch from the one to the
   *   other, and the portcullis at the back of the arch, raised as far as the gate is open. Once it
   *   has fallen the mark carved in the arch is alight.
   *   (THE MIX) A LEVER'S GATE, AND A LOCKING ROOM'S: the same, lower and lighter, under a plain
   *   arch with no mark.
   * (The stone on either side of a door is wall, and the walls' own rules draw it or leave it out:
   * render/walls.ts.)
   */
  /**
   * QUESTS15: THE FURNACE in a back wall of the Stoker's arena (game/furnace_arena.ts), as a gate's strips are laid (art/stoker_room.ts
   * FURNACE: four tiles of its wall): roaring while it burns; once the crank is turned (and has turned), going out; then cold.
   */
  private standFurnace(L: Game['level'], cam: Cam, game: Game, t: number): void {
    const F = L.furnace;
    const s = F?.spot;
    if (!F || !s || !STOKER_ON.on) return;
    const f = L.floor;
    let seen = false;
    for (let k = 0; k < 4 && !seen; k++) {
      const i = s.alongX ? s.plane * f.w + s.a + k : (s.a + k) * f.w + s.plane;
      if (L.explored[i] === 1) seen = true;
    }
    if (!seen) return;
    const since = F.out && F.turnedAt !== undefined && F.turnedAt >= 0 ? game.time - F.turnedAt - CRANK_TIMES.turn : -1;
    const list = F.out && (since >= CRANK_TIMES.furnaceOut || F.turnedAt === undefined || F.turnedAt < 0)
      ? STOKER_ROOM.furnace(s.alongX, 'out')
      : since >= 0 ? STOKER_ROOM.furnace(s.alongX, 'going', Math.min(FURNACE_OUT.frames - 1, Math.floor((since / CRANK_TIMES.furnaceOut) * FURNACE_OUT.frames)))
      : STOKER_ROOM.furnace(s.alongX, 'lit', Math.floor(t * FURNACE_ROAR.fps) % FURNACE_ROAR.frames);
    const R = this.relief;
    for (const q of list) {
      const x = s.alongX ? s.a + q.t : s.plane;
      const y = s.alongX ? s.plane : s.a + q.t;
      const sx = wx(cam, x, y);
      const sy = wy(cam, x, y);
      this.stand(x + y + 0.01, q.s, sx, sy);
      if (R) this.hide(x, y, R.lift(x, y));
      if (q.s.lights) this.propLit.push({ s: q.s, x: Math.round(sx), y: Math.round(sy) });
    }
  }

  /** QUESTS15: the forge crank as it stands: its gear missing; set in (the hero carrying it, its handle glowing his cyan); turning; turned. */
  private crankSprite(game: Game): Sprite | null {
    const F = game.level.furnace;
    if (!F || !STOKER_ON.on) return null;
    const h = game.hero;
    if (F.out && F.turnedAt !== undefined && F.turnedAt >= 0) {
      const since = game.time - F.turnedAt;
      if (since < CRANK_TIMES.turn) return STOKER_ROOM.crank('turning', Math.min(CRANK_TURN.frames - 1, Math.floor((since / CRANK_TIMES.turn) * CRANK_TURN.frames)));
      return STOKER_ROOM.crank('turned');
    }
    if (F.out) return STOKER_ROOM.crank('turned');
    return STOKER_ROOM.crank(h.furnace === 'gear' ? 'set' : 'missing');
  }

  private standDoors(L: Game['level'], cam: Cam, game: Game, fx: Fx, t = game.time): void {
    this.standFurnace(L, cam, game, t);
    if (L.doors.length === 0) return;
    const A = this.art.gates;
    const f = L.floor;
    const R = this.relief;
    const put = (depth: number, sp: Sprite, x: number, y: number): void => {
      const sx = wx(cam, x, y);
      const sy = wy(cam, x, y);
      this.stand(depth, sp, sx, sy);
      // (on a level with ledges: raised ground in front of it hides the foot of it, as of any thing)
      if (R) this.hide(x, y, R.lift(x, y));
      if (sp.lights) this.propLit.push({ s: sp, x: Math.round(sx), y: Math.round(sy) });
    };
    for (const d of L.doors) {
      const s = d.spot;
      // (seen once any tile of its doorway has been)
      if (!doorTiles(f, s).some((i) => L.explored[i] === 1)) continue;
      const face = doorFace(s);
      // (a place t tiles along the plane from where the doorway begins, `back` tiles behind it)
      const at = (t: number, back = 0): [number, number] => (s.alongX ? [s.a + t, face - back] : [face - back, s.a + t]);
      const strips = (list: Strip[], t0: number, back: number): void => {
        for (const q of list) {
          const [x, y] = at(t0 + q.t, back);
          put(x + y + STRIP / 64, q.s, x, y);
        }
      };
      if (!isLeaf(s.kind)) {
        // (the boss's, heavy and carved; or a plain one: a lever's, a locking room's)
        const boss = s.kind === 'bossgate';
        const wide = PILLAR / 32;
        // (THE FIRST TOWN AS THE CASTLE'S HALL: the town's gate in the castle's stone, its quoins and its ring of voussoirs; the
        // portcullis and the bars the game's own: art/castle_hall.ts)
        const hallGate = this.castle.on(L) && L.ways && L.doors[L.ways.gate] === d ? this.castle.A().gate : null;
        const pillar = hallGate ? hallGate.pillar : A.pillar(boss);
        for (const [x, y] of [at(0), at(3 + wide)]) put(x + y - wide, pillar, x, y);
        // (EXITS: floor 1's gate is the stairs up to the town, the art chat's, drawn with the floor: its portcullis is gone)
        // (THE HEADSMAN'S YARD's own gate, YARD_GATE: it falls by its own beat, held juddering, dropped, a bounce; the mark on its
        // keystone lit as it lands, its dust and sparks, a little shake: art/yard_gate.ts)
        // (FLOOR 3, THE BLACK IRON PRISON's own gate, PRISON_GATE: the same beat, its own pictures: art/prison_gate.ts)
        // (FLOOR 4, THE BURIED CHAPEL's bone grille, CHAPEL_GATE: the same beat, its own pictures, the maw alight: art/chapel_gate.ts)
        const prisonGate = boss && d.want === 0 && d.fell !== undefined && PRISON_GATE.on && this.prison.on(L);
        const chapelGate = boss && d.want === 0 && d.fell !== undefined && CHAPEL_GATE.on && this.chapel.on(L);
        // (FLOOR 5, THE TEMPLE's hooked bars, LAIR_GATE: the same beat, the skull alight: art/lair_gate.ts)
        const lairGate = boss && d.want === 0 && d.fell !== undefined && LAIR_GATE.on && this.lair.on(L);
        // (FLOOR 1, THE KING'S TOMB's gate, TOMB_GATE: the same beat, the lock alight: art/tomb_gate.ts)
        const tombGate = boss && d.want === 0 && d.fell !== undefined && TOMB_GATE.on && this.tomb.on(L);
        const drop = boss && d.want === 0 && d.fell !== undefined && YARD_GATE.on && this.yard.on(f) ? yardGateDropAt((game.time - d.fell) * 30) : prisonGate ? prisonGateDropAt((game.time - d.fell!) * 30) : chapelGate ? chapelGateDropAt((game.time - d.fell!) * 30) : lairGate ? lairGateDropAt((game.time - d.fell!) * 30) : tombGate ? tombGateDropAt((game.time - d.fell!) * 30) : null;
        if (!this.dress.stairsUp(game, s)) strips(A.portcullis(s.alongX, boss, drop ? drop.raise : d.open * GATE_UP), -wide, wide);
        // (QUESTS15: THE FIRE IN THE CHAINED ONE'S WAY while floor 3's furnace burns, at the back of the arch as his portcullis is, the
        // portcullis drawn up: burning, going out once the crank is turned, a bed of ash: art/stoker_room.ts)
        const F = L.furnace;
        if (boss && F && STOKER_ON.on && L.doors[F.gate] === d) {
          const since = F.out && F.turnedAt !== undefined && F.turnedAt >= 0 ? game.time - F.turnedAt - CRANK_TIMES.turn : -1;
          const fire = F.gone ? STOKER_ROOM.fireWall(s.alongX, 'gone') : since < 0 ? STOKER_ROOM.fireWall(s.alongX, 'burning', Math.floor(t * FIRE_WALL.fps) % FIRE_WALL.frames) : STOKER_ROOM.fireWall(s.alongX, 'going', Math.min(FIRE_WALL.out - 1, Math.floor((since / CRANK_TIMES.fireOut) * FIRE_WALL.out)));
          strips(fire, -wide, wide - 0.01);
        }
        strips(hallGate ? hallGate.arch(s.alongX) : A.arch(s.alongX, boss, boss && d.want === 0 && (!drop || drop.lit)), -wide, 0);
        if (drop && drop.slam >= 0) {
          const [x, y] = at(1.5, wide);
          put(x + y + 0.3, prisonGate ? prisonGateSlam(s.alongX, drop.slam) : chapelGate ? chapelGateSlam(s.alongX, drop.slam) : lairGate ? lairGateSlam(s.alongX, drop.slam) : tombGate ? tombGateSlam(s.alongX, drop.slam) : yardGateSlam(s.alongX, drop.slam), x, y);
          if (drop.slam < 4) fx.shake = Math.max(fx.shake, 2);
        }
        // (EXITS, the town's gate: barred until the Fleshmancer is beaten, its bars struck off the first time he comes in
        // sight of it after, and what is left of them lying at its foot from then on: the art chat's, art/town_ways.ts)
        const tw = L.town && L.ways && L.doors[L.ways.gate] === d ? this.dress.townWays(game) : null;
        if (tw && L.ways) {
          const u = L.ways.unbar;
          let bars = tw.left;
          if (u !== undefined && u !== null && u >= 0) {
            const f = Math.min(tw.unbar.length - 1, Math.floor(u * 30));
            this.dress.unbarAt(tw, f);
            bars = tw.unbar[f];
          } else if (L.ways.barred) bars = tw.bars;
          strips(bars, -wide, wide - 0.03);
        }
        continue;
      }
      const wide = POST / 32;
      for (const [x, y] of [at(1), at(2 + wide)]) put(x + y - wide, A.post, x, y);
      strips(A.lintel(s.alongX), 1, 0);
      // (the leaf, from its hinge at the foot of the first post: along the plane when shut, straight back from it when open)
      const turn = ((Math.round(d.open * SWING_STEPS) / SWING_STEPS) * Math.PI) / 2;
      const along = Math.cos(turn);
      const back = Math.sin(turn);
      const dx = s.alongX ? along : -back;
      const dy = s.alongX ? -back : along;
      const [hx, hy] = at(1);
      const ex = Math.round(32 * (dx - dy));
      const ey = Math.round(16 * (dx + dy));
      // (THE TRAPS: a sealed door's leaf is a slab with the rune of its word, alight until the door is opened)
      put(hx + hy + 0.5 * along - 0.2 * back, s.kind === 'worddoor' && s.word ? A.seal(ex, ey, s.word, d.want === 0) : A.leaf(ex, ey), hx, hy);
    }
  }

  /**
   * (THE TRAPS, game/traps.ts; their pictures: art/hazards.ts) What of a level's traps stands up:
   * a spike floor's spikes, while they are up, one in each of its holes, each at its own depth; and
   * a dart wall's slot, in the face of its wall. (The holes and a plate lie flat on the floor: they
   * are drawn with the ground.)
   */
  /** THE WORDSMITH'S RING MADE NEW (art/ring3.ts): the letters of light that swirl round him, and the column of light over his slab, stood among everything else by how near they are. */
  private standRing3(game: Game, cam: Cam, t: number): void {
    const art = this.art;
    const r3 = art.town.ring3;
    const L = game.level;
    const ring = L.props.find((p) => p.kind === 'runeRing');
    if (!r3 || !ring) return;
    for (const l of swirlNow(art, t)) {
      const x = ring.x + l.x;
      const y = ring.y + l.y;
      const sp = (l.big ? r3.big : r3.letters)[l.heat][l.k];
      const sx = wx(cam, x, y);
      const sy = wy(cam, x, y) - l.z;
      this.stand(x + y, sp, sx, sy);
      if (sp.lights) this.propLit.push({ s: sp, x: Math.round(sx), y: Math.round(sy) });
    }
    const slab = L.props.find((p) => p.kind === 'runeSlab');
    // (THE SHAFT'S RIM: no column of light over its slab: the master rune-stone's place is the tablet's socket there, and it is empty)
    const col = slab && !L.rim ? columnSprite(art, t) : null;
    if (slab && col) {
      // (on the slab's top: 11 game pixels up)
      const sx = wx(cam, slab.x, slab.y);
      const sy = wy(cam, slab.x, slab.y) - 11;
      this.stand(slab.x + slab.y + 0.05, col.s, sx, sy, null, 0, 1, col.alpha);
      if (col.s.lights) this.propLit.push({ s: col.s, x: Math.round(sx), y: Math.round(sy) });
    }
    // (THE MASTER RUNE-STONE, art/quest3.ts: given, it rises out of the hero, floats over the slab,
    // lies down and is laid into the hollow in its top, with a burst of its light)
    const pw = ringPower(t);
    const q = art.quest;
    if (slab && q && pw && pw.g >= 0) {
      const h = game.hero;
      const fl = floatingOf(pw.g, [h.x, h.y], [slab.x, slab.y], 11);
      if (fl) {
        const sp = fl.lie <= 0.5 ? q.standing[Math.floor(t * 10) % STONE_STANDING_FRAMES] : q.laying[Math.min(STONE_LAYING_STEPS - 1, Math.round((fl.lie / 90) * (STONE_LAYING_STEPS - 1)))];
        const sx = wx(cam, fl.x, fl.y);
        const sy = wy(cam, fl.x, fl.y) - fl.z;
        this.stand(fl.x + fl.y + 0.06, sp, sx, sy);
        if (sp.lights) this.propLit.push({ s: sp, x: Math.round(sx), y: Math.round(sy) });
      }
      if (pw.g >= POWER.set && pw.g < POWER.set + 0.3) {
        const sx = wx(cam, slab.x, slab.y);
        const sy = wy(cam, slab.x, slab.y) - 11;
        this.stand(slab.x + slab.y + 0.07, q.flash, sx, sy, null, 0, 0.6 + (pw.g - POWER.set) * 2.4, 1 - (pw.g - POWER.set) / 0.3);
        this.propLit.push({ s: q.flash, x: Math.round(sx), y: Math.round(sy) });
      }
    }
  }

  /** The Meldstone's picture for how it is now (render/meld_drops.ts): torn apart and spinning, fused and spinning, or hanging. */
  private meldStoneSprite(a: MeldDropsArt, at: StoneAt, t: number): Sprite {
    if (at.shown === 'apart') return a.spinApart[spinStep(at.yaw)];
    if (at.shown === 'whole') return a.spinWhole[spinStep(at.yaw)];
    return a.stone[Math.floor(t * STONE_FPS) % STONE_FRAMES];
  }

  /** Stand a picture with its lights (`lit` false: without them, where the place is lit enough already). */
  private standLit(d: number, sp: Sprite, x: number, y: number, scale = 1, alpha = 1, lit = true): void {
    this.stand(d, sp, x, y, null, 0, scale, alpha);
    if (lit && sp.lights && alpha > 0.05) this.propLit.push({ s: sp, x: Math.round(x), y: Math.round(y) });
  }

  /**
   * RUNEDUST AND THE MELDSTONE LYING, and as they drop (art/meld_drops.ts, behind MELD_DROPS): a heap of
   * runedust, bursting up out of the floor first; the Meldstone hanging over the floor, bursting up first
   * out of the Fleshmancer's pit (riseOf: the rules hold it under the floor while he is dragged down).
   */
  private standMeldDrop(dr: { x: number; y: number; kind: string; gold: number; age: number }, sx: number, sy: number, t: number, fx: Fx): void {
    const a = this.art.meldDrops as MeldDropsArt;
    const d = dr.x + dr.y;
    if (dr.kind === 'dust') {
      if (dr.age < 0) return;
      const heap = heapOf(dr.gold);
      const sp = dr.age < SPILL_SECS ? a.spill[heap][Math.min(SPILL_FRAMES - 1, Math.floor(dr.age * 30))] : a.heap[heap][Math.floor(t * DUST_FPS) % 16];
      this.standLit(d - 0.2, sp, sx, sy);
      return;
    }
    const at = riseOf(dr.age, t);
    if (at.crack) this.standLit(d - 0.45, a.crack[Math.min(a.crack.length - 1, Math.floor(at.crack.k * a.crack.length))], sx, sy, 1, at.crack.alpha);
    if (at.z === null) return;
    const sp = this.meldStoneSprite(a, at, t);
    this.standLit(d + 0.05, sp, sx, sy - at.z, at.scale);
    // (its light on the floor under it)
    this.propLit.push({ s: a.pool, x: Math.round(sx), y: Math.round(sy) });
    if (at.burst) this.standLit(d + 0.06, a.burst, sx, sy - at.z, at.burst.scale, at.burst.alpha);
    if (at.slammed && !this.meldDrops.slammedDrops.has(dr)) {
      this.meldDrops.slammedDrops.add(dr);
      fx.shake = Math.max(fx.shake, 3);
    }
    if (at.shown === 'hang') this.labels.push({ x: sx, y: sy - at.z - 16, text: 'Meldstone', color: MELD_DUST_COLOR });
  }

  /**
   * THEIR MOMENTS (render/meld_drops.ts): runedust taken, whirling up round the hero into him; the
   * Meldstone taken, over his head, slammed together and into him; given, over the wordsmith's slab, its
   * halves whirling round each other and slammed together; and kept there after, hanging over his slab.
   */
  private standMeldMoments(game: Game, cam: Cam, t: number, fx: Fx): void {
    const a = this.art.meldDrops as MeldDropsArt;
    const M = this.meldDrops;
    M.tidy(t);
    const h = game.hero;
    const hd = h.x + h.y;
    const hx = wx(cam, h.x, h.y);
    const hy = wy(cam, h.x, h.y);
    for (const w of M.whirls) {
      const k = Math.floor((t - w.at) * 30);
      if (k < 0 || k >= WHIRL_FRAMES) continue;
      const scale = w.n <= 2 ? 0.85 : w.n <= 4 ? 1 : 1.15;
      this.standLit(hd - 0.02, a.whirl[k].back, hx, hy, scale);
      this.standLit(hd + 0.02, a.whirl[k].front, hx, hy, scale);
    }
    if (M.taken) {
      const tk = M.taken;
      const at = takenOf(t - tk.at, [tk.x, tk.y], [h.x, h.y]);
      if (at && at.z !== null) {
        const sx = wx(cam, at.x, at.y);
        const sy = wy(cam, at.x, at.y) - at.z;
        this.standLit(hd + 0.05, this.meldStoneSprite(a, at, t), sx, sy, at.scale);
        if (at.burst) this.standLit(hd + 0.06, a.burst, sx, sy, at.burst.scale, at.burst.alpha);
        if (at.slammed && !tk.slammed) {
          tk.slammed = true;
          fx.shake = Math.max(fx.shake, 3.5);
          fx.freeze = Math.max(fx.freeze, 0.1);
        }
      }
    }
    const L = game.level;
    if (!L.town) return;
    const slab = L.props.find((p) => p.kind === 'runeSlab');
    if (!slab) return;
    const sd = slab.x + slab.y + 0.08;
    const g = M.given ? t - M.given.at : -1;
    if (M.given && g >= 0 && g < GIVEN.settled) {
      const gv = givenOf(g, t, [M.given.hx, M.given.hy], [slab.x, slab.y]);
      if (!gv) return;
      const st = gv.stone;
      if (st && st.z !== null) {
        const sx = wx(cam, st.x, st.y);
        const sy = wy(cam, st.x, st.y) - st.z;
        // (in the wordsmith's ring, lit enough by its own light, the stone gives none: it would wash it out)
        const sp = this.meldStoneSprite(a, st, t);
        this.standLit(st.x + st.y + 0.08, sp, sx, sy, st.scale * KEPT_SCALE, 1, false);
        this.overLit.push({ d: st.x + st.y + 0.08, s: sp, x: sx, y: sy, scale: st.scale * KEPT_SCALE });
      }
      if (gv.halves) {
        gv.halves.forEach((hf, n) => {
          const sp = a.halves[n][spinStep(hf.yaw)];
          this.standLit(hf.x + hf.y + 0.08, sp, wx(cam, hf.x, hf.y), wy(cam, hf.x, hf.y) - hf.z, KEPT_SCALE, 1, false);
          this.overLit.push({ d: hf.x + hf.y + 0.08, s: sp, x: wx(cam, hf.x, hf.y), y: wy(cam, hf.x, hf.y) - hf.z, scale: KEPT_SCALE });
        });
      }
      if (gv.burst) this.standLit(sd + 0.01, a.burst, wx(cam, slab.x, slab.y), wy(cam, slab.x, slab.y) - KEPT_Z - 2, gv.burst.scale, gv.burst.alpha);
      if (gv.slammed && !M.given.slammed) {
        M.given.slammed = true;
        fx.shake = Math.max(fx.shake, 4);
        fx.freeze = Math.max(fx.freeze, 0.1);
      }
      return;
    }
    // KEPT: once the wordsmith has it, it goes round the column of light over his slab, turning
    if (game.hero.meld === 'open' || game.meta.meld) {
      const o = orbitAt(t, [slab.x, slab.y]);
      const sp = a.stone[Math.floor(t * STONE_FPS) % STONE_FRAMES];
      this.standLit(o.x + o.y + 0.08, sp, wx(cam, o.x, o.y), wy(cam, o.x, o.y) - o.z, KEPT_SCALE, 1, false);
      this.overLit.push({ d: o.x + o.y + 0.08, s: sp, x: wx(cam, o.x, o.y), y: wy(cam, o.x, o.y) - o.z, scale: KEPT_SCALE });
    }
  }

  /**
   * THE MASTER RUNE-STONE IN THE FIRST DUNGEON (art/quest3.ts, behind QUEST3): taken up, it rises
   * from beside the fallen wordsmith, stands up, bursts with light and flies into the hero.
   */
  private standQuestStone(game: Game, cam: Cam, t: number): void {
    const q = this.art.quest;
    const b = game.level.body;
    if (!q || !b || QUEST3.takenAt < 0) return;
    const age = t - QUEST3.takenAt;
    if (age < 0 || age >= 1) return;
    const from: [number, number] = [b.x + STONE_BY[0], b.y + STONE_BY[1]];
    const h = game.hero;
    let x = from[0];
    let y = from[1];
    let z = 0;
    let lie = 90;
    let scale = 1;
    if (age < 0.35) {
      const k = age / 0.35;
      z = 18 * k * (2 - k);
      lie = 90 * (1 - k);
    } else if (age < 0.55) {
      z = 18;
      lie = 0;
    } else {
      const k = (age - 0.55) / 0.45;
      x = from[0] + (h.x - from[0]) * k * k;
      y = from[1] + (h.y - from[1]) * k * k;
      z = 18 - 4 * k;
      lie = 0;
      scale = 1 - 0.7 * k * k;
    }
    const sp = lie <= 0.5 ? q.standing[Math.floor(t * 10) % STONE_STANDING_FRAMES] : q.laying[Math.min(STONE_LAYING_STEPS - 1, Math.round((lie / 90) * (STONE_LAYING_STEPS - 1)))];
    const sx = wx(cam, x, y);
    const sy = wy(cam, x, y) - z;
    this.stand(x + y + 0.05, sp, sx, sy, null, 0, scale, 1);
    if (sp.lights) this.propLit.push({ s: sp, x: Math.round(sx), y: Math.round(sy) });
    if (age >= 0.35 && age < 0.65) {
      this.stand(x + y + 0.06, q.flash, sx, sy, null, 0, 0.5 + (age - 0.35) * 3, 1 - (age - 0.35) / 0.3);
      this.propLit.push({ s: q.flash, x: Math.round(sx), y: Math.round(sy) });
    }
  }

  private standHazards(game: Game, cam: Cam): void {
    const L = game.level;
    if (L.hazards.length === 0) return;
    const f = L.floor;
    const A = this.art.hazards;
    for (const z of L.hazards) {
      const s = z.spot;
      if (s.kind === 'spikes') {
        // (ACT 2, THE HUSH: its traps' own sprung pictures are the whole of them, no iron spikes: render/act1_pieces.ts ownSprung;
        // a trap with a picture of its own, the flood or the slick: trapOf; a trap whose own picture stands, the Millrace's wheel
        // and stamping mill, strikes in that picture: standsFor)
        if (this.act1Dressed && (this.act1.ownSprung() || this.act1.trapOf(s, 'down', 0) !== undefined || this.act1.standsFor(s))) continue;
        const k = Math.round(spikeHeight(s, game.time) * SPIKE_STEPS);
        if (k <= 0) continue;
        const sp = A.spike(k);
        for (let ty = s.y; ty < s.y + s.h; ty++) {
          for (let tx = s.x; tx < s.x + s.w; tx++) {
            if (!L.explored[ty * f.w + tx]) continue;
            for (const [u, v] of SPIKE_SPOTS) {
              const x = tx + 0.5 + u;
              const y = ty + 0.5 + v;
              this.stand(x + y, sp, wx(cam, x, y), wy(cam, x, y));
            }
          }
        }
      } else if (s.slot) {
        const q = s.slot;
        // (seen once the floor in front of it has been)
        if (!L.explored[(q.y + q.dy) * f.w + q.x + q.dx]) continue;
        const x = q.x + 0.5 + q.dx * 0.5;
        const y = q.y + 0.5 + q.dy * 0.5;
        this.stand(x + y + STRIP / 64, A.slot(q.dy !== 0), wx(cam, x, y), wy(cam, x, y));
      }
    }
  }

  /** (THE WALLS' LOOK) This frame's walls toward the eye (`lowWalls`), for the painters of single tiles. */
  private lowNow: Uint8Array | null = null;
  /** (THE WALLS' LOOK) Where the hero's feet are on the screen this frame, and their depth. */
  private wallHero: { x: number; y: number; d: number; hx: number; hy: number } | null = null;

  /**
   * (THE WALLS' LOOK) Is a wall block whose tile's top corner is at (px, py) on the
   * screen, `tall` pixels high and at this depth, in front of the hero and over them? A wall
   * taller than the game's is seen through while it is: a hero in a corridor behind a room is not lost.
   */
  private overHero(px: number, py: number, depth: number, tall: number): boolean {
    const at = this.wallHero;
    if (!at || tall <= WALL_H || at.d >= depth - 0.5) return false;
    // (the block: 32 wide, from its top to the foot of its faces; the hero: 14 wide and 30 tall, their feet at `at`)
    return px + 16 > at.x - 7 && px - 16 < at.x + 7 && py - tall < at.y - 3 && py + 16 > at.y - 30;
  }
  private reliefFor: unknown = null;
  /** This frame's pits and its raised tiles and stairs, in the order they are drawn: tile, screen x, screen y of each. */
  private pitTiles: number[] = [];
  private raisedTiles: number[] = [];
  /**
   * The point of the screen the hero stands on: the middle of it (null), unless part of the screen
   * is covered and the world is seen in the rest. The owner, 5 Oct 2026, of the inventory on half
   * the screen: "recenter the camera on the player in the left side of the screen". main.ts sets
   * it; `viewAt` is where the picture has got to on its way there.
   */
  view: { x: number; y: number } | null = null;
  private viewAt: { x: number; y: number; w: number; h: number; t: number } | null = null;
  /**
   * Whether the picture is still on its way to where `view` wants it. (The playtests wait for
   * it to stand before they measure where a thing of the world is on the screen: measured
   * half way, it is not where it will be a moment later.)
   */
  get gliding(): boolean {
    const va = this.viewAt;
    if (!va) return false;
    return va.x !== (this.view ? this.view.x : va.w / 2) || va.y !== (this.view ? this.view.y : va.h / 2);
  }
  /** The town service the hero is on the way to (its name is drawn in gold), if any. */
  goal: Station | null = null;
  /** QUEST MARKERS (game/quest_marks.ts): where each floats this frame (its point; screen pixels). */
  private questMarks: { x: number; y: number }[] = [];
  /** THE WORLD'S SOUNDS (game/world_sounds.ts): the town's people's sounds begun this frame (main.ts plays them, by nearness). */
  townSounds: { name: string; x: number; y: number }[] = [];
  private folkActWas = new Map<string, number>();
  private folkSound(art: TownArt, kind: string, x: number, y: number, t: number): void {
    const name = FOLK_SOUND[kind];
    if (!name) return;
    const a = folkActAt(art, kind, t);
    const was = this.folkActWas.get(kind) ?? -1;
    this.folkActWas.set(kind, a);
    // (heard as what they do now and then begins; or, where they say so, at its moment: the sculpted armourer's as his hammer
    // lands, the mystic's as the crystal blazes, the stranger's as he flicks the coin: art/townsfolk3.ts)
    const at = folkSoundAt(art, kind);
    if (a >= at && was < at) this.townSounds.push({ name, x, y });
    // (the wordsmith drives the rune he wrote into his ring, half way through)
    if (kind === 'wordsmith' && a >= 0) {
      const half = folkActLong(art, kind) / 2;
      if (was < half && a >= half) this.townSounds.push({ name: 'rune_drive', x, y });
    }
  }
  /** (the same) the top of each of the town's people's heads as last drawn (screen pixels), by their kind. */
  private folkHeads = new Map<string, { x: number; y: number }>();
  /** Touch: the monster the hero is locked onto (its id): a ring is drawn round its feet. Set every frame by the controls. */
  lockId: number | null = null;
  /** THE WARLOCK: what his full pact bar says to do, by what is played with (main.ts sets it each frame). */
  pactHint = 'TAP HIM';
  /**
   * For measuring only (`__dbg.renderer.skip.add('ground')` in a playtest): parts of the picture to
   * leave out, to find what a slow frame is spending its time on. 'ground' = the hero's ground
   * patches, 'zlight' = their light, 'cloud' = thunderclouds, 'fx' = everything in fx.ts.
   */
  skip = new Set<string>();

  /** THE FIRST FIVE FLOORS: what the bosses of floors 2 to 5 do to the floor and send across it (render/bossfx.ts). */
  private readonly bossFx: BossFx;
  /** RUNEDUST AND THE MELDSTONE's moments playing (render/meld_drops.ts, behind MELD_DROPS, off): main.ts tells it what the rules say happened. */
  readonly meldDrops = new MeldDrops();

  constructor(private art: Art) {
    this.dark = document.createElement('canvas');
    this.dg = this.dark.getContext('2d') as CanvasRenderingContext2D;
    this.bossFx = new BossFx(
      art.bestiary,
      <T>(key: string): T | null => this.painter?.filmOf<T>(key) ?? null,
      // (a figure the painter paints, or whose baked pictures are coming: its frames not here yet left to it, as a fallen one's: fallenSprite)
      (f) => !!this.painter?.paints(f as MonsterFigure) || !!this.bakedMobs?.coming(f as MonsterFigure),
    );
    this.dress = new FloorDress(() => this.painter);
    // (ACT 1: the outdoor ground's pieces painted by the painter's ground worker, where there is one)
    this.outdoor.painterOf = () => this.painter;
    this.pieces = new FloorPieces(() => this.painter);
    this.yard = new YardView();
    this.stage = {
      cam: this.cam,
      stand: (d, sp, x, y, alpha = 1) => this.stand(d, sp, x, y, null, 0, 1, alpha),
      veil: (sp, x, y, d) => this.seeThrough(sp, x, y, d, this.heroFeet.x, this.heroFeet.y, this.heroD),
      lit: (sp, x, y) => this.propLit.push({ s: sp, x: Math.round(x), y: Math.round(y) }),
      shadow: (g, x, y, r) => this.shadow(g, x, y, r, SHADOW),
    };
  }

  /**
   * A picture painted once and kept under `key`. `paint` draws round (0, 0); the picture reaches
   * `hw` to either side of that point, `hh` below it and `hh + up` above it, so it is stamped down
   * with its top left corner at (x - hw, y - hh - up).
   */
  private patch(key: string, hw: number, hh: number, up: number, paint: (c: CanvasRenderingContext2D) => void): HTMLCanvasElement {
    let cv = this.kept.get(key);
    if (cv) return cv;
    if (this.kept.size > 120) this.kept.clear();
    cv = document.createElement('canvas');
    cv.width = hw * 2;
    cv.height = hh * 2 + up;
    const c = cv.getContext('2d') as CanvasRenderingContext2D;
    c.translate(hw, hh + up);
    paint(c);
    this.kept.set(key, cv);
    return cv;
  }

  /**
   * THE SHADOW UNDER A FIGURE (the owner, 6 Oct 2026: "Draw a soft, semi-transparent black
   * oval/circle on the floor directly beneath the Player and the Monsters to anchor them into the
   * 3D space"). One soft oval, painted once and stretched to each figure: darkest under the feet
   * and gone at its rim. `r` is in tiles, as the hard oval it replaces was (up to Version 16); the
   * soft one reaches half as far again, since its outer half is nearly nothing.
   */
  private shadow(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, alpha: number): void {
    const blot = this.patch('shadow', 32, 32, 0, (c) => {
      const grd = c.createRadialGradient(0, 0, 0, 0, 0, 32);
      grd.addColorStop(0, 'rgba(0,0,0,1)');
      grd.addColorStop(0.4, 'rgba(0,0,0,0.85)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = grd;
      c.fillRect(-32, -32, 64, 64);
    });
    const w = r * 22.6 * 1.5;
    const hh = r * 11.3 * 1.5;
    const was = g.imageSmoothingEnabled;
    g.imageSmoothingEnabled = true;
    g.globalAlpha = Math.max(0, Math.min(1, alpha));
    g.drawImage(blot, cx - w, cy - hh, w * 2, hh * 2);
    g.globalAlpha = 1;
    g.imageSmoothingEnabled = was;
  }

  /** The vignette, painted for one size of screen and one strength (see `light`). */
  private vig: { cv: HTMLCanvasElement; w: number; h: number; a: number } | null = null;

  /**
   * A DARK VIGNETTE ROUND THE EDGES OF THE SCREEN (the owner, 6 Oct 2026: "Add a dark vignette
   * overlay around the edges of the screen so the corners look shadowy, making the center of the
   * screen feel like a lit-up dungeon corridor"). An oval as wide and as high as the screen:
   * nothing in its middle, `strength` in the corners, about half of that half way along an edge.
   * Painted once for a size of screen.
   */
  private vignette(W: number, H: number, strength: number): HTMLCanvasElement {
    let v = this.vig;
    if (!v || v.w !== W || v.h !== H || v.a !== strength) {
      const cv = v ? v.cv : document.createElement('canvas');
      cv.width = W;
      cv.height = H;
      const c = cv.getContext('2d') as CanvasRenderingContext2D;
      c.clearRect(0, 0, W, H);
      c.save();
      c.translate(W / 2, H / 2);
      c.scale(W / 2, H / 2);
      const grd = c.createRadialGradient(0, 0, VIGNETTE_FROM, 0, 0, Math.SQRT2);
      grd.addColorStop(0, 'rgba(4,3,10,0)');
      grd.addColorStop(1, `rgba(4,3,10,${strength})`);
      c.fillStyle = grd;
      c.fillRect(-1, -1, 2, 2);
      c.restore();
      v = this.vig = { cv, w: W, h: H, a: strength };
    }
    return v.cv;
  }

  /** THE BRAWLER's slip: his after-images where he has weaved (the picture, where, and how long ago), in the friend's cyan, fading. */
  private slipGhosts: { s: Sprite; x: number; y: number; t: number }[] = [];

  /** THE TINKERER's minions' pictures, made the first time one is seen. */
  private tinkerArt: { golem: ActorArt; con: { front: ContraptionArt; back: ContraptionArt } } | null = null;
  /** (her tree's GUN ARM) Her Golem's pictures with the tesla coil for its arm, and its charged shots' frames, made as they are wanted. */
  private teslaArt: ActorArt | null = null;
  private chargeArt = new Map<string, Sprite[]>();
  /** (her tree's CONTRAPTION) its pictures loaded with what it fires, made as they are wanted. */
  private conArt = new Map<string, { front: ContraptionArt; back: ContraptionArt }>();

  /** Her Contraptions (in the air, springing open, set up, kicked by a shot, broken) and her Golem, stood among the rest. */
  private drawTinkerers(game: Game, cam: Cam, t: number, W: number, H: number, tfx: TinkererFx): void {
    /** Her brew's cyan (dev/contraption_fx.ts BREW): what glows on a friend. */
    const BREW_CYAN = '#22d0e0';
    const art = (this.tinkerArt ??= { golem: makeGolemArt(), con: makeContraptionArt() });
    const C = TINKER_TUNE.contraption;
    const at = (c: Clip, k: number): Sprite => c.frames[Math.max(0, Math.min(c.frames.length - 1, Math.floor(k * c.fps + 1e-6)))];
    const turned = (fx: number, fy: number, s: Sprite): Sprite => (fx - fy < 0 ? flipSprite(s) : s);
    // (the art's moments, from her letting go: it comes down, bounces, springs open: dev/contraption_fx.ts CT)
    const LAND = 12 / 30;
    const SETTLE = 22 / 30;
    const OPEN0 = 24 / 30;
    for (const c of game.contraptions) {
      let x = c.x;
      let y = c.y;
      let lift = 0;
      // (her tree's CONTRAPTION: loaded with what it fires, her pick, bombs or energy)
      const ammo = game.contraptionAmmo();
      const con = ammo ? (this.conArt.get(ammo) ?? this.conArt.set(ammo, makeContraptionArt(ammo)).get(ammo)!) : art.con;
      const set = c.fx + c.fy < -0.2 ? con.back : con.front;
      let sp: Sprite;
      if (c.broke >= 0) sp = at(set.broke, c.broke);
      else if (c.t < LAND) {
        const u = c.t / LAND;
        x = c.x0 + (c.x - c.x0) * u;
        y = c.y0 + (c.y - c.y0) * u;
        lift = 14 + 26 * 4 * u * (1 - u) - 14 * u;
        sp = set.tumble[Math.floor(c.t * 24) % set.tumble.length];
      } else if (c.t < SETTLE) {
        const u = (c.t - LAND) / (SETTLE - LAND);
        lift = 9 * 4 * u * (1 - u);
        sp = set.tumble[(Math.floor(c.t * 18) % 2) * 4];
      } else if (c.t < OPEN0) sp = set.tumble[0];
      else if (c.t < C.set) sp = at(set.open, c.t - OPEN0);
      else if (c.shotAge < set.shot.frames.length / set.shot.fps) sp = at(set.shot, c.shotAge);
      else sp = set.stand[0];
      const sx = wx(cam, x, y);
      const sy = wy(cam, x, y);
      if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 60) continue;
      this.stand(x + y + 0.01, turned(c.fx, c.fy, sp), sx, sy - lift, null, 0, CON_SEEN.on ? CON_SEEN.scale : 1);
    }
    // (her Golems: one; two with her tree's Mark II)
    const GS = TINKER_TUNE.talents.growth;
    for (const g of game.golems) {
      const sx = wx(cam, g.x, g.y);
      const sy = wy(cam, g.x, g.y);
      if (sx > -80 && sx < W + 80 && sy > -40 && sy < H + 200) {
        // (her tree's GUN ARM: the arm she picked, the cannon or the tesla coil)
        const arm = game.armOf();
        const golemArt = arm === 'tesla' ? (this.teslaArt ??= makeGolemArt('tesla')) : art.golem;
        const back = g.fx + g.fy < -0.2;
        const set = back ? golemArt.back : golemArt.front;
        const clips = set.clips ?? {};
        // (THE ART CHAT'S ROCKET JUMP, behind GOLEM_ROCKET: its own frames through it, by its frame from deciding to jump)
        const view = back ? 'back' : 'front';
        const gun = arm === 'tesla' ? 'tesla' : 'cannon';
        const rocket = GOLEM_ROCKET.on && g.act === 'jump';
        const rf = rocketFrame(g.actT);
        let sp: Sprite;
        if (g.act === 'walk' && GOLEM_ROCKET.on) {
          // (ITS RUN, the art chat's gallop, by the floor it covers: RUN_STRIDE tiles a round, so that its fist and feet grip)
          const run = golemRunFrames(view, gun);
          sp = run[Math.floor((g.walked / RUN_STRIDE) * run.length) % run.length];
        } else if (g.act === 'walk') {
          const stride = set.walkStride ?? 1;
          sp = set.walk[Math.floor((g.walked / stride) * set.walk.length) % set.walk.length];
        } else if (rocket) sp = golemRocketFrames(view, gun)[rf];
        else if (g.act === 'punch' && clips.attack) sp = at(clips.attack, g.actT);
        else if (g.act === 'cannon' && clips.attack2) sp = at(clips.attack2, g.actT);
        else if (g.act === 'pound' && clips.heavy && g.actT >= 0) sp = at(clips.heavy, g.actT);
        else if (g.act === 'charge') {
          // (its charged shot: the wind-up, the loop round and round while she holds, then on from the shot: chargeFrame)
          const key = `${arm === 'tesla' ? 'tesla' : 'cannon'}:${back ? 'back' : 'front'}`;
          let frames = this.chargeArt.get(key);
          if (!frames) this.chargeArt.set(key, (frames = golemCharge(back ? 'back' : 'front', arm === 'tesla' ? 'tesla' : 'cannon')));
          sp = frames[Math.max(0, Math.min(frames.length - 1, this.chargeAt(g)))];
        }
        else if (g.act === 'down' && clips.fall) sp = at(clips.fall, g.actT);
        else sp = set.idle[0];
        // (whistled out: it drops in, landing heavy; ITS ROCKET JUMP, up over the floor in its arc, its stand lifted (the art chat's
        // pictures of it to come))
        // (behind GOLEM_ROCKET, the art chat's: up fast, down like a stone, 92 game pixels at the top, in place of the stand-in's arc)
        const J = TINKER_TUNE.golem.jump;
        const drop = g.act === 'arrive' ? Math.max(0, 1 - g.actT / 0.25) * 40 : rocket ? rocketUp(rf - ROCKET.blast) : g.act === 'jump' ? Math.sin(Math.PI * Math.min(1, g.actT / J.long)) * J.high : 0;
        // (her tree: GROWTH SERUM, twice as big, growing and shrinking back over a quarter of a second; OVERDRIVE, her cyan
        // pulsing over it; LIGHTNING ROD, her cyan flickering over it while the enemies go after it)
        const grow = g.growT > 0 ? 1 + (GS.big - 1) * Math.max(0, Math.min(1, (GS.secs - g.growT) / 0.25, g.growT / 0.25)) : 1;
        let glow = g.overT > 0 && g.act !== 'down' ? 0.22 + 0.14 * Math.sin(t * 12) : 0;
        if (game.decoys.some((d) => d.golem === g) && Math.floor(t * 15) % 4 === 0) glow = Math.max(glow, 0.55);
        const pic = turned(g.fx, g.fy, sp);
        // (behind GOLEM_ROCKET: everything at it, its stacks' fire and steam, laid just before its picture and just after it, lifted
        // and turned over with it: from in front its stacks' fire is behind it, from behind over it)
        const atIt = rocket ? golemRocketFx(view) : null;
        if (atIt) this.stand(g.x + g.y + 0.02, turned(g.fx, g.fy, atIt.behind[rf]), sx, sy - drop, null, 0, grow);
        this.stand(g.x + g.y + 0.02, pic, sx, sy - drop, glow > 0 ? silhouette(pic, BREW_CYAN) : null, glow, grow);
        if (atIt) this.stand(g.x + g.y + 0.02, turned(g.fx, g.fy, atIt.over[rf]), sx, sy - drop, null, 0, grow);
      }
    }
    // (behind GOLEM_ROCKET: what of its take-offs and landings stands among what stands, its flash, fire, dust and stone)
    for (const q of tfx.rocketStands()) {
      const sx = wx(cam, q.x, q.y);
      const sy = wy(cam, q.x, q.y);
      if (sx < -200 || sx > W + 200 || sy < -200 || sy > H + 200) continue;
      this.stand(q.d, q.s, sx, sy);
    }
  }

  /** (HER GOLEM'S ROCKET JUMP, behind GOLEM_ROCKET) Each Golem in its rocket jump: where, which way its picture is drawn, its frame, its size. */
  private golemsRocketing(game: Game): TinkererFx['rocketing'] {
    const GS = TINKER_TUNE.talents.growth;
    return game.golems.filter((g) => g.act === 'jump').map((g) => ({
      x: g.x,
      y: g.y,
      view: g.fx + g.fy < -0.2 ? ('back' as const) : ('front' as const),
      flip: g.fx - g.fy < 0,
      f: rocketFrame(g.actT),
      grow: g.growT > 0 ? 1 + (GS.big - 1) * Math.max(0, Math.min(1, (GS.secs - g.growT) / 0.25, g.growT / 0.25)) : 1,
    }));
  }

  /** (HER TREE'S GUN ARM) The frame of its charged shot a Golem shows: the wind-up, the loop round and round while she holds, then on from the shot (dev/golem_moves.ts chargeFrame). */
  private chargeAt(g: Game['golems'][number]): number {
    const held = (g.held ?? -1) < 0 ? 1e9 : Math.max(TINKER_TUNE.golem.charge.build, g.held ?? 0) * 30;
    return Math.floor(chargeFrame(Math.floor(g.actT * 30), Math.round(held)));
  }
  /** (HER TREE'S GUN ARM) Each Golem charging: where, which way its picture is drawn, its gun, its frame. */
  private golemsCharging(game: Game): TinkererFx['charging'] {
    const arm = game.armOf();
    const gun = arm === 'tesla' ? 'tesla' : 'cannon';
    return game.golems.filter((g) => g.act === 'charge').map((g) => ({ x: g.x, y: g.y, view: g.fx + g.fy < -0.2 ? ('back' as const) : ('front' as const), flip: g.fx - g.fy < 0, gun, f: this.chargeAt(g) }));
  }

  /** THE RANGER'S COMPANIONS: each kind's pictures, made the first time one is seen. */
  private readonly petArt: Partial<Record<CompanionKind, ActorArt>> = {};

  /**
   * THE RANGER'S COMPANIONS (game/companions.ts, behind COMPANIONS; their pictures the art chat's, art/companions_art.ts, his yes
   * to all six by 30 Oct 2026): each as a figure, from in front or behind as it faces, mirrored for
   * the screen's left; standing, going (its frames by the ground it covers, so its feet grip), its bite (the art's clip, its
   * blow at the game's own: COMPANION_TUNE.bite), its gift painted in it; a soft shadow under it (the fliers' on the floor).
   * Called for, it comes in over a third of a second.
   */
  private drawPets(g: CanvasRenderingContext2D, game: Game, cam: Cam, t: number, W: number, H: number): void {
    for (const p of game.pets) {
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y);
      if (sx < -80 || sx > W + 80 || sy < -60 || sy > H + 120) continue;
      const art = (this.petArt[p.kind] ??= makeCompanionArt(p.kind));
      const set = p.fx + p.fy < -0.2 ? art.back : art.front;
      const clip = set.clips?.attack;
      let sp: Sprite;
      if (p.act === 'bite' && clip) sp = clip.frames[Math.max(0, Math.min(clip.frames.length - 1, Math.floor(p.actT * clip.fps + 1e-6)))];
      else if (p.act === 'walk') {
        const n = set.walk.length;
        sp = set.walk[Math.floor((p.walked / strideOf(p.kind)) * n) % n];
      } else sp = set.idle[Math.floor(t * (set.idleFps ?? 15)) % set.idle.length];
      const come = p.act === 'arrive' ? Math.max(0, Math.min(1, p.actT / 0.3)) : 1;
      ellipse(g, sx, sy, COMP_SHADOW[p.kind] / 45, '#000000', 0.26 * come);
      this.stand(p.x + p.y + 0.015, p.fx - p.fy < 0 ? flipSprite(sp) : sp, sx, sy, null, 0, 1, come);
    }
  }

  /** The hero as he was last drawn, before this frame (his shadow, Phantom Step). */
  private heroBefore: Sprite | null = null;
  /** (THE WARLOCK's tree: Phantom Step) each shadow's picture: him as he was the moment he stepped away. */
  private readonly shadows = new WeakMap<object, Sprite>();
  /**
   * THE WARLOCK'S SHADOWS (his tree, game/talents.ts: Phantom Step): where he stepped from, him as he stood, gone dark as his
   * smoke, an edge of the friend's cyan either side; flickering, and fading as its time runs out. A FIRST PASS, TO BE SHOWN TO
   * THE OWNER.
   */
  private drawShadows(game: Game, cam: Cam, t: number): void {
    for (const d of game.decoys) {
      if (d.golem) continue;
      let s = this.shadows.get(d);
      if (!s) {
        if (!this.heroBefore) continue;
        s = this.heroBefore;
        this.shadows.set(d, s);
      }
      const fade = Math.min(1, d.t / 0.4) * (0.85 + 0.15 * Math.sin(t * 23 + d.x));
      const sx = wx(cam, d.x, d.y);
      const sy = wy(cam, d.x, d.y);
      const edge = silhouette(s, '#22d0e0');
      this.stand(d.x + d.y - 0.002, edge, sx - 1, sy, null, 0, 1, 0.45 * fade);
      this.stand(d.x + d.y - 0.001, edge, sx + 1, sy, null, 0, 1, 0.45 * fade);
      this.stand(d.x + d.y, silhouette(s, '#0c0e22'), sx, sy, null, 0, 1, 0.9 * fade);
    }
  }

  /** (THE WARLOCK's tree) The Bound Demon's figure: the demon's own pictures, played as a figure of its own. */
  private readonly boundFig = new Figure();
  /**
   * THE WARLOCK'S BOUND DEMON (his tree, game/talents.ts: Bound Demon), at his side: the demon's own pictures (art/warlock_art.ts,
   * the same as his when he changes), standing, walking, raking; torn out of him, it comes together out of nothing; burning
   * out, it fades. A FIRST PASS, TO BE SHOWN TO THE OWNER.
   */
  private drawBound(game: Game, cam: Cam, W: number, H: number, dt: number): void {
    const b = game.bound;
    if (!b) return;
    const sx = wx(cam, b.x, b.y);
    const sy = wy(cam, b.x, b.y);
    if (sx < -100 || sx > W + 100 || sy < -40 || sy > H + 160) return;
    const art = this.art.heroes.of('warlock', { twoHanded: false, town: false, demon: true });
    const B = WARLOCK_TUNE.talents.bound;
    const anim = b.act === 'rake' ? 'attack' : b.act === 'walk' ? 'walk' : 'idle';
    const sp = this.boundFig.frame(art, { anim, animT: b.actT, fx: b.fx, fy: b.fy, attackSkill: 0, attackAge: b.act === 'rake' ? b.actT : 0, attackWind: B.hit, leapK: -1, walked: b.walked }, dt, (b.x - b.y) * 16, (b.x + b.y) * 8);
    const alpha = b.act === 'arrive' ? Math.min(1, b.actT / B.arrive) : b.act === 'out' ? Math.max(0, 1 - b.actT / B.out) : 1;
    this.stand(b.x + b.y + 0.02, sp, sx, sy, null, 0, 1, alpha);
  }

  private stand(d: number, s: Sprite, x: number, y: number, over: Sprite | null = null, overA = 0, scale = 1, alpha = 1, figure: Figure | null = null, phase = 0, add = false): void {
    this.stands.push({ d, q: this.stands.length, s, x: Math.round(x), y: Math.round(y), over, overA, scale, alpha, figure, phase, ...(add ? { add } : {}) });
  }

  // =============================================================================================
  // HEIGHT: ledges, stairs and pits (the owner, 7 Oct 2026: "Then work on ledges and stairs";
  // "Gaps and pits to use the swipe ability over"). A level that has none of them has no `relief`
  // and is drawn exactly as it always was.
  //
  // The order of the picture: the low floor; what lies on it; the pits (dark, their two far sides
  // going down); raised floor with the faces of its ledges, and the stairs, from the back of the
  // screen to the front; what lies on those; then everything that stands, each thing lifted with
  // the ground under it (`wy` knows the lift: fx.ts). A thing that stands on low ground BEHIND
  // raised ground is hidden by it as far as it should be (`hide`).

  private reliefOf(L: Game['level']): Relief | null {
    if (this.reliefFor === L) return this.relief;
    this.reliefFor = L;
    this.relief = null;
    if (!L.step) return null;
    const f = L.floor;
    const top = new Int16Array(f.w * f.h);
    let low = 0;
    for (let i = 0; i < top.length; i++) {
      if (f.tiles[i] !== T_FLOOR) continue;
      const base = f.height ? f.height[i] : 0;
      top[i] = (base + (f.stair && f.stair[i] !== 0 ? 1 : 0)) * LEDGE_H;
      if (base * LEDGE_H < low) low = base * LEDGE_H;
    }
    this.relief = { floor: f, top, lift: (x, y) => levelAt(f, x, y) * LEDGE_H, low };
    return this.relief;
  }

  /** How far the HERO is lifted this frame: with the ground under them, or, in a swipe move, from the height they left to the height they will land on. */
  private heroLift(game: Game): number {
    const R = this.relief;
    if (!R) return 0;
    const h = game.hero;
    const mv = h.move;
    if (!mv) return R.lift(h.x, h.y);
    const k = Math.min(1, mv.t / mv.dur);
    return R.lift(mv.x0, mv.y0) * (1 - k) + R.lift(mv.x1, mv.y1) * k;
  }

  /**
   * The stand just made is at this place in the world, on ground lifted `lift` pixels: the raised
   * tiles in front of it that stand higher are marked on it, and what of it lies behind them is
   * not drawn. (Three tiles toward the eye each way: nothing further off reaches it on the screen.)
   */
  private hide(x: number, y: number, lift: number): void {
    const R = this.relief;
    if (!R) return;
    const f = R.floor;
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) return;
    const own = f.stair ? f.stair[ty * f.w + tx] : 0;
    let out: number[] | null = null;
    for (let b = 0; b <= 2; b++) {
      for (let a = 0; a <= 2; a++) {
        if (a + b === 0 || tx + a >= f.w || ty + b >= f.h) continue;
        const i = (ty + b) * f.w + tx + a;
        if (R.top[i] <= lift + 1) continue;
        // (the same flight of stairs, beside the tile it stands on, hides nothing of it)
        if (own !== 0 && f.stair && f.stair[i] === own) continue;
        (out ??= []).push(i);
      }
    }
    if (out) {
      const st = this.stands[this.stands.length - 1];
      st.hide = out;
      st.hideBase = lift;
    }
  }

  /**
   * The outline on the screen of a tile of higher ground as a solid block (a flight of stairs: as
   * a wedge), added to the path: from its top down to `floor`, the lift of the ground that the
   * thing it hides stands on (0 for the room's own floor; less for sunken floor).
   */
  private blockPath(g: CanvasRenderingContext2D, R: Relief, i: number, floor = 0): void {
    const f = R.floor;
    const tx = i % f.w;
    const ty = (i - tx) / f.w;
    const px = this.cam.ox + (tx - ty) * 16;
    const py = this.cam.oy + (tx + ty) * 8;
    const up = R.top[i];
    const st = f.stair ? f.stair[i] : 0;
    // (a flight's low end: the height of the floor at its foot, never below the ground the hidden thing stands on)
    const foot = st !== 0 ? Math.max(floor, (f.height ? f.height[i] : 0) * LEDGE_H) : up;
    g.moveTo(px, py - up);
    if (st === STAIR_W) g.lineTo(px + 16, py + 8 - foot);
    else g.lineTo(px + 16, py + 8 - up);
    g.lineTo(px + 16, py + 8 - floor);
    g.lineTo(px, py + 16 - floor);
    g.lineTo(px - 16, py + 8 - floor);
    if (st === STAIR_N) g.lineTo(px - 16, py + 8 - foot);
    else g.lineTo(px - 16, py + 8 - up);
    g.closePath();
  }

  /** Does the ground drop away from a raised tile toward its neighbour at (dx, dy), so that the face of a ledge is seen there? */
  private drops(f: Floor, idx: number, tx: number, ty: number, dx: number, dy: number): boolean {
    const nx = tx + dx;
    const ny = ty + dy;
    if (nx < 0 || ny < 0 || nx >= f.w || ny >= f.h) return false;
    const j = ny * f.w + nx;
    if (f.tiles[j] === T_PIT) return true;
    if (f.tiles[j] !== T_FLOOR) return false;
    const mine = f.height ? f.height[idx] : 0;
    const its = f.height ? f.height[j] : 0;
    const sn = f.stair ? f.stair[j] : 0;
    // (a flight of stairs that comes up to this floor is level with it at its head; one that runs alongside is lower)
    if ((sn === STAIR_N && dx === 0 && dy === 1) || (sn === STAIR_W && dx === 1 && dy === 0)) return its + 1 < mine;
    return its < mine;
  }

  /**
   * A tile of plain floor on a level with ledges (the room's own floor, or sunken floor): the
   * shadow of higher ground that stands over it, and its edges against a pit. (px, py): where its
   * diamond is drawn, lifted as it is.
   */
  /**
   * A TILE OF FLOOR, as the floor's loop draws it (drawWorld) and as a place's floor as one picture is laid (layFloor): its
   * picture with its top corner at (px, py), and over it the shade of the walls that stand at its far sides and the lit edge
   * where a wall toward the eye is left out. `ground`: the game's ground art (the redoubt's in a stronghold's hall).
   */
  private floorTile(g: CanvasRenderingContext2D, L: Game['level'], idx: number, tx: number, ty: number, px: number, py: number, t: number, look: LookView | null, ground: GroundArt, lowGrid: Uint8Array, yardOn: boolean): void {
    const f = L.floor;
    // (the flagstones are laid on the world, not on the tiles: a tile's picture goes by where it is)
    // (THE FIRST FIVE FLOORS: or one of the floor's own tiles laid there: render/pieces.ts)
    // (THE HEADSMAN'S YARD: its cobbles and its own tiles: render/yard.ts)
    // (FLOOR 3, THE BLACK IRON PRISON: his hall's floor and its own tiles, then the floor's own, on its dark flags: render/prison.ts)
    const sp = (yardOn && this.yard.floor(f, tx, ty)) || (look && look.laid(L, tx, ty, t)) || (this.dressed && this.pieces.tile(idx)) || (look ? look.flags(tx, ty) : ground.floor(tx, ty));
    g.drawImage(sp.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    // the shadow of a wall that stands over it (the light is from the upper left)
    // (THE WALLS' LOOK: a wall that is cut away throws no shadow)
    const gone = WALL_LOOK.away && WALL_LOOK.front === 'none';
    const wl = tx > 0 && f.tiles[idx - 1] === T_WALL && !(gone && lowGrid[idx - 1]);
    const wr = ty > 0 && f.tiles[idx - f.w] === T_WALL && !(gone && lowGrid[idx - f.w]);
    if (wl) g.drawImage(ground.shadeLeft.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    if (wr) g.drawImage(ground.shadeRight.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    if (!wl && !wr && tx > 0 && ty > 0 && f.tiles[idx - f.w - 1] === T_WALL) g.drawImage(ground.shadeCorner.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    if (WALL_LOOK.front === 'none') {
      // (THE WALLS' LOOK: no wall is drawn toward the eye, and the floor's edge there is a line of light against the dark)
      if (tx + 1 < f.w && f.tiles[idx + 1] === T_WALL && lowGrid[idx + 1]) g.drawImage(ground.edgeRight.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
      if (ty + 1 < f.h && f.tiles[idx + f.w] === T_WALL && lowGrid[idx + f.w]) g.drawImage(ground.edgeLeft.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    }
  }

  /** A PLACE'S FLOOR AS ONE PICTURE (render/still_floor.ts): the picture, and a number that is another when a tile of the place is seen that was not, or becomes floor or wall that was not (the picture is made again then). */
  readonly stillFloor = new StillFloor();
  private floorSig(L: Game['level']): number {
    let n = 0;
    const e = L.explored;
    const tiles = L.floor.tiles;
    for (let i = 0; i < e.length; i++) n = (Math.imul(n, 31) + (e[i] ? tiles[i] + 1 : 0)) | 0;
    return n;
  }
  /**
   * THE WHOLE OF A PLACE'S FLOOR LAID ON `g`, with the camera `cam` (render/still_floor.ts): what its look draws behind
   * everything, then every tile of floor that has been seen, in the order drawWorld's loop comes to them (row by row down the
   * screen, each row left to right), each as that loop draws it. Only called where drawWorld would draw no more than this for
   * the floor (flat ground, the look's own floor: its `asOneFloor`).
   */
  private layFloor(g: CanvasRenderingContext2D, cam: Cam, L: Game['level'], t: number, look: LookView, ground: GroundArt, lowGrid: Uint8Array): void {
    const f = L.floor;
    if (look.back) {
      for (const q of look.back(L, t)) {
        const sx = Math.round(wx(cam, q.x, q.y));
        const sy = Math.round(wy(cam, q.x, q.y));
        g.drawImage(q.s.img, sx - q.s.ax, sy - q.s.ay, q.s.w, q.s.h);
      }
    }
    for (let s = 0; s <= f.w + f.h - 2; s++) {
      for (let df = -(f.h - 1); df <= f.w - 1; df++) {
        if ((s + df) & 1) continue;
        const tx = (s + df) >> 1;
        const ty = (s - df) >> 1;
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
        const idx = ty * f.w + tx;
        if (!L.explored[idx] || f.tiles[idx] !== T_FLOOR) continue;
        this.floorTile(g, L, idx, tx, ty, cam.ox + df * 16, cam.oy + s * 8, t, look, ground, lowGrid, false);
      }
    }
  }

  private lowEdges(g: CanvasRenderingContext2D, R: Relief, idx: number, tx: number, ty: number, px: number, py: number): void {
    const G = this.lookGround();
    const f = R.floor;
    const e = G.shadeLeft;
    const X = px - e.ax;
    const Y = py - e.ay;
    const st = f.stair;
    const own = R.top[idx];
    // (higher ground up and to the left throws a broad shadow, as a wall does; up and to the right, a thin one. Not the foot of a flight of stairs.)
    if (tx > 0 && R.top[idx - 1] > own && !(st && st[idx - 1] === STAIR_W)) g.drawImage(G.shadeLeft.img, X, Y, e.w, e.h);
    if (ty > 0 && R.top[idx - f.w] > own && !(st && st[idx - f.w] === STAIR_N)) g.drawImage(G.shadeRight.img, X, Y, e.w, e.h);
    this.pitEdges(g, f, idx, tx, ty, X, Y);
  }

  /**
   * SUNKEN FLOOR (the owner, 7 Oct 2026: "Stairs should go down as well"): the floor of this frame
   * that lies below the room's own, and the flights of stairs down into it, from the back of the
   * screen to the front. Drawn BEFORE the room's own floor: the floor on the near side of sunken
   * floor is in front of it, and hides a strip of it. (The faces of its far sides are the room's
   * floor's to draw: `rimFaces`.)
   */
  private drawSunken(g: CanvasRenderingContext2D, R: Relief, L: Game['level'], dmin: number, dmax: number, smin: number, smax: number): void {
    const G = this.lookGround();
    const f = R.floor;
    const cam = this.cam;
    const hs = f.height;
    if (!hs) return;
    for (let s = smin; s <= smax; s++) {
      for (let df = dmin; df <= dmax; df++) {
        if ((s + df) & 1) continue;
        const tx = (s + df) >> 1;
        const ty = (s - df) >> 1;
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
        const idx = ty * f.w + tx;
        if (hs[idx] >= 0 || f.tiles[idx] !== T_FLOOR || !L.explored[idx]) continue;
        if (this.yardOnly && !this.yard.shows(this.yardOnly, tx, ty)) continue;
        const px = cam.ox + df * 16;
        const base = hs[idx] * LEDGE_H;
        const py = cam.oy + s * 8 - base;
        const st = f.stair ? f.stair[idx] : 0;
        if (st !== 0) {
          // (as a flight up to raised floor: its open side is seen where the floor beside it, toward the eye, is lower than its head)
          const j = st === STAIR_N ? idx + 1 : idx + f.w;
          const sameFlight = f.tiles[j] === T_FLOOR && f.stair !== undefined && f.stair[j] === st && hs[j] === hs[idx];
          const open = f.tiles[j] === T_FLOOR && !sameFlight && R.top[j] <= base;
          const sp = st === STAIR_N ? (open ? G.stairsNSide : G.stairsN) : open ? G.stairsWSide : G.stairsW;
          g.drawImage(sp.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
          continue;
        }
        const sp = G.floor(tx, ty);
        g.drawImage(sp.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
        // (a little darker than the room's own floor: lower ground reads as lower)
        g.globalAlpha = SUNK_DARK;
        g.drawImage(G.pit.img, px - G.pit.ax, py - G.pit.ay, G.pit.w, G.pit.h);
        g.globalAlpha = 1;
        this.lowEdges(g, R, idx, tx, ty, px, py);
      }
    }
  }

  /** A tile of the room's own floor beside sunken floor: the faces of the drop, where the ground toward the eye is lower, and the lip of light on the floor's edge above each. */
  private rimFaces(g: CanvasRenderingContext2D, R: Relief, idx: number, tx: number, ty: number, px: number, py: number): void {
    const G = this.lookGround();
    const f = R.floor;
    const v = f.variant[idx];
    const lip = G.lipLeft;
    // (toward a pit the floor ends as it always has: `pitEdges`. This is the drop to sunken FLOOR.)
    if (ty < f.h - 1 && f.tiles[idx + f.w] === T_FLOOR && this.drops(f, idx, tx, ty, 0, 1)) {
      const e = G.ledgeLeft[v % G.ledgeLeft.length];
      g.drawImage(e.img, px - e.ax, py - e.ay, e.w, e.h);
      g.drawImage(G.lipLeft.img, px - lip.ax, py - lip.ay, lip.w, lip.h);
    }
    if (tx < f.w - 1 && f.tiles[idx + 1] === T_FLOOR && this.drops(f, idx, tx, ty, 1, 0)) {
      const e = G.ledgeRight[v % G.ledgeRight.length];
      g.drawImage(e.img, px - e.ax, py - e.ay, e.w, e.h);
      g.drawImage(G.lipRight.img, px - lip.ax, py - lip.ay, lip.w, lip.h);
    }
    // and where the sunken floor lies BEHIND it (this tile is in front of it and hides a strip of
    // it): the floor's edge, as against a pit, along its upper-left side and its upper-right one
    const own = R.top[idx];
    if (tx > 0 && f.tiles[idx - 1] === T_FLOOR && R.top[idx - 1] < own) g.drawImage(G.rimLeft.img, px - lip.ax, py - lip.ay, lip.w, lip.h);
    if (ty > 0 && f.tiles[idx - f.w] === T_FLOOR && R.top[idx - f.w] < own) g.drawImage(G.rimRight.img, px - lip.ax, py - lip.ay, lip.w, lip.h);
  }

  /** A floor tile's edges against a pit: a rim where the pit lies behind it, a lip of light where the floor ends over one. */
  private pitEdges(g: CanvasRenderingContext2D, f: Floor, idx: number, tx: number, ty: number, X: number, Y: number): void {
    const G = this.lookGround();
    const e = G.rimLeft;
    if (tx > 0 && f.tiles[idx - 1] === T_PIT) g.drawImage(G.rimLeft.img, X, Y, e.w, e.h);
    if (ty > 0 && f.tiles[idx - f.w] === T_PIT) g.drawImage(G.rimRight.img, X, Y, e.w, e.h);
    if (tx < f.w - 1 && f.tiles[idx + 1] === T_PIT) g.drawImage(G.lipRight.img, X, Y, e.w, e.h);
    if (ty < f.h - 1 && f.tiles[idx + f.w] === T_PIT) g.drawImage(G.lipLeft.img, X, Y, e.w, e.h);
  }

  /** The pits, and then the raised floor and the stairs, of this frame (the floor pass has listed them, from the back of the screen to the front). */
  private drawRelief(g: CanvasRenderingContext2D, R: Relief): void {
    const G = this.lookGround();
    const f = R.floor;
    const pits = this.pitTiles;
    if (pits.length) {
      const d = G.pit;
      for (let k = 0; k < pits.length; k += 3) g.drawImage(d.img, pits[k + 1] - d.ax, pits[k + 2] - d.ay, d.w, d.h);
      // the two far sides of the hole go down into it: over the pit tiles in front of them, and no further
      g.save();
      g.beginPath();
      for (let k = 0; k < pits.length; k += 3) {
        const px = pits[k + 1];
        const py = pits[k + 2];
        g.moveTo(px, py);
        g.lineTo(px + 16, py + 8);
        g.lineTo(px, py + 16);
        g.lineTo(px - 16, py + 8);
        g.closePath();
      }
      g.clip();
      for (let k = 0; k < pits.length; k += 3) {
        const idx = pits[k];
        const tx = idx % f.w;
        const v = f.variant[idx];
        const solid = (j: number): boolean => f.tiles[j] === T_FLOOR || f.tiles[j] === T_WALL;
        if (tx > 0 && solid(idx - 1)) {
          const sp = G.pitLeft[v % G.pitLeft.length];
          g.drawImage(sp.img, pits[k + 1] - sp.ax, pits[k + 2] - sp.ay, sp.w, sp.h);
        }
        if (idx >= f.w && solid(idx - f.w)) {
          const sp = G.pitRight[v % G.pitRight.length];
          g.drawImage(sp.img, pits[k + 1] - sp.ax, pits[k + 2] - sp.ay, sp.w, sp.h);
        }
      }
      g.restore();
    }
    const raised = this.raisedTiles;
    for (let k = 0; k < raised.length; k += 3) {
      const idx = raised[k];
      const px = raised[k + 1];
      const py = raised[k + 2];
      const tx = idx % f.w;
      const ty = (idx - tx) / f.w;
      const base = (f.height ? f.height[idx] : 0) * LEDGE_H;
      // (TRIANGLES: a half tile of raised floor, where a terrace runs up to a slanting wall)
      const c = f.cut ? f.cut[idx] : 0;
      if (c !== 0) {
        this.raisedHalf(g, f, idx, tx, ty, px, py, base, c);
        continue;
      }
      const st = f.stair ? f.stair[idx] : 0;
      if (st !== 0) {
        // a flight of stairs: its open side is seen where the ground beside it, toward the eye, is lower than its head
        const j = st === STAIR_N ? idx + 1 : idx + f.w;
        const beside = f.tiles[j];
        const sameFlight = beside === T_FLOOR && f.stair !== undefined && f.stair[j] === st && (f.height ? f.height[j] : 0) * LEDGE_H === base;
        const open = beside === T_PIT || (beside === T_FLOOR && !sameFlight && R.top[j] <= base);
        const sp = st === STAIR_N ? (open ? G.stairsNSide : G.stairsN) : open ? G.stairsWSide : G.stairsW;
        g.drawImage(sp.img, px - sp.ax, py - base - sp.ay, sp.w, sp.h);
        continue;
      }
      const sp = G.floor(tx, ty);
      const X = px - sp.ax;
      const Y = py - base - sp.ay;
      g.drawImage(sp.img, X, Y, sp.w, sp.h);
      // (the shadow of a wall that stands over it, as on any floor)
      const wl = tx > 0 && f.tiles[idx - 1] === T_WALL;
      const wr = ty > 0 && f.tiles[idx - f.w] === T_WALL;
      if (wl) g.drawImage(G.shadeLeft.img, X, Y, sp.w, sp.h);
      if (wr) g.drawImage(G.shadeRight.img, X, Y, sp.w, sp.h);
      if (!wl && !wr && tx > 0 && ty > 0 && f.tiles[idx - f.w - 1] === T_WALL) g.drawImage(G.shadeCorner.img, X, Y, sp.w, sp.h);
      // the faces of the ledge, where the ground toward the eye is lower, and the lip of light on the floor's edge above each
      const v = f.variant[idx];
      if (this.drops(f, idx, tx, ty, 0, 1)) {
        const e = G.ledgeLeft[v % G.ledgeLeft.length];
        g.drawImage(e.img, px - e.ax, py - base - e.ay, e.w, e.h);
        g.drawImage(G.lipLeft.img, X, Y, sp.w, sp.h);
      }
      if (this.drops(f, idx, tx, ty, 1, 0)) {
        const e = G.ledgeRight[v % G.ledgeRight.length];
        g.drawImage(e.img, px - e.ax, py - base - e.ay, e.w, e.h);
        g.drawImage(G.lipRight.img, X, Y, sp.w, sp.h);
      }
      if (tx > 0 && f.tiles[idx - 1] === T_PIT) g.drawImage(G.rimLeft.img, X, Y, sp.w, sp.h);
      if (ty > 0 && f.tiles[idx - f.w] === T_PIT) g.drawImage(G.rimRight.img, X, Y, sp.w, sp.h);
    }
  }

  /**
   * TRIANGLES (game/cut.ts): a tile cut corner to corner. The half that is floor
   * (if it has one) is the flagstones, cut along the line; the half that is wall stands among
   * everything else that stands.
   */
  private cutTile(g: CanvasRenderingContext2D, f: Floor, idx: number, tx: number, ty: number, px: number, py: number, s: number, c: number, floor: boolean, up = 0): void {
    const G = this.lookGround();
    const part = cutPart(c);
    // (cut down low by its kind; or, THE WALLS' LOOK, cut away because standing whole it would hide floor behind it)
    const low = c >= CUT_FAR_LOW || (WALL_LOOK.away && this.lowNow !== null && this.lowNow[idx] === 1);
    // (a half tile of RAISED floor is drawn with the raised floor, after what lies on the low floor: `raisedHalf`)
    if (floor && up <= 0) this.halfFloor(g, f, idx, tx, ty, px, py, part);
    if (WALL_LOOK.faces) {
      // (THE WALLS' LOOK, `faces`: the block behind a slanting wall is not painted. Nor is a wall
      // that runs up and down the screen, or one toward the eye: seen end-on the first is a line,
      // and the second is cut away. The floor's edge along the cut is a line of light.)
      if (!floor) return;
      // (WHOLE_WALLS: the slanting wall across a corner stands, the one toward the eye too, seen through as any wall)
      if (this.wholeNow && (part === 'far' || part === 'near')) {
        const sp = this.lookGrade(G.part[part].tall);
        const depth = s + (part === 'far' ? 0.66 : 1.34);
        if (part === 'near' && up <= 0) {
          const fl = G.floor(tx, ty);
          g.drawImage(G.edgeAcross.img, px - fl.ax, py - fl.ay, fl.w, fl.h);
        }
        this.stand(depth, sp, px, py - Math.max(0, up), null, 0, 1, this.wallVeil(this.gameNow!, idx, px, py, depth, this.clockNow));
        return;
      }
      if (part !== 'far') {
        if (up <= 0) {
          const fl = G.floor(tx, ty);
          const e = part === 'near' ? G.edgeAcross : part === 'left' ? G.edgeUpRight : G.edgeUpLeft;
          g.drawImage(e.img, px - fl.ax, py - fl.ay, fl.w, fl.h);
        }
        return;
      }
      if (low) return;
    }
    // (THE WALLS' LOOK: with no walls toward the eye, a wall cut down low is not drawn;
    // the half tile of floor behind it ends in a line of light)
    if (low && WALL_LOOK.front === 'none') {
      if (floor && part === 'near') {
        const fl = G.floor(tx, ty);
        g.drawImage(G.edgeAcross.img, px - fl.ax, py - fl.ay, fl.w, fl.h);
      }
      return;
    }
    // (FLOOR 3, THE BLACK IRON PRISON: its slanting walls, the Crypt's in look B's colours: render/prison.ts)
    const sp = this.lookGrade(G.part[part][low ? 'low' : 'tall']);
    const depth = s + (part === 'far' ? 0.66 : part === 'near' ? 1.34 : 1);
    if (floor && up > 0) {
      // the wall over a half tile of raised floor stands ON that floor: as tall over the terrace as over the room's floor
      // (with one top line: the top of a whole wall, as much of it as stands over the terrace)
      this.stand(depth, WALL_LOOK.level && !low ? this.lookGrade(G.part[part].mid) : sp, px, py - up);
      return;
    }
    // (a block taller than the game's old walls is seen through while it stands over the hero. A wall
    // that is its faces alone never does: it stands over no floor, and so over nobody: render/walls.ts)
    this.stand(depth, sp, px, py, null, 0, 1, !low && !WALL_LOOK.faces && this.overHero(px, py, depth, WALL_LOOK.tall) ? SEEN_THROUGH : 1);
    if (up > 0) {
      // (the back of a slanting wall behind raised floor: as any wall there, its foot is hidden by
      // the raised floor in front of it, and it is built up that much higher)
      this.hide(tx + 0.5, ty + 0.5, 0);
      if (!WALL_LOOK.level) this.stand(depth + 0.001, sp, px, py - up);
    }
  }

  /** The half of a cut tile that is floor: the flagstones, cut along the line, and the shadows of the walls over it. (px, py): where its diamond is drawn, lifted as it is. */
  private halfFloor(g: CanvasRenderingContext2D, f: Floor, idx: number, tx: number, ty: number, px: number, py: number, part: WallPart): void {
    const G = this.lookGround();
    // (FLOOR 3, THE BLACK IRON PRISON: its own dark flags)
    const sp = this.lookNow ? this.lookNow.flags(tx, ty) : G.floor(tx, ty);
    g.save();
    g.beginPath();
    // (the floor is the half the wall is not over)
    if (part === 'far') g.rect(px - 16, py + 8, 32, 9);
    else if (part === 'near') g.rect(px - 16, py - 1, 32, 9);
    else if (part === 'left') g.rect(px, py - 1, 17, 18);
    else g.rect(px - 17, py - 1, 17, 18);
    g.clip();
    g.drawImage(sp.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    // (the shadow of the flat wall over its far half: none, if that wall is cut away and not drawn)
    const gone = WALL_LOOK.away && WALL_LOOK.front === 'none' && this.lowNow !== null && this.lowNow[idx] === 1;
    if (part === 'far' && !gone) g.drawImage(G.shadeAcross.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    const wl = tx > 0 && f.tiles[idx - 1] === T_WALL && !(f.cut && f.cut[idx - 1] !== 0);
    const wr = ty > 0 && f.tiles[idx - f.w] === T_WALL && !(f.cut && f.cut[idx - f.w] !== 0);
    if (wl) g.drawImage(G.shadeLeft.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    if (wr) g.drawImage(G.shadeRight.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
    g.restore();
  }

  /**
   * TRIANGLES ON A TERRACE: a half tile of RAISED floor, where a terrace runs up to a slanting
   * wall. The flagstones cut along the line and lifted; and under the edges it has that face the
   * eye, where the ground beyond is lower, the face of the ledge and its lip of light. (Which
   * edges a half has: the half in front of a wall across the screen, both; the half to the right
   * of a wall up and down the screen, the lower-right one; the half to the left of one, the
   * lower-left one. The half BEHIND a wall across the screen has neither, and no terrace is laid
   * there: relief.ts.)
   */
  private raisedHalf(g: CanvasRenderingContext2D, f: Floor, idx: number, tx: number, ty: number, px: number, py: number, base: number, c: number): void {
    const G = this.lookGround();
    const part = cutPart(c);
    this.halfFloor(g, f, idx, tx, ty, px, py - base, part);
    const sp = G.floor(tx, ty);
    const X = px - sp.ax;
    const Y = py - base - sp.ay;
    const v = f.variant[idx];
    if ((part === 'far' || part === 'right') && this.drops(f, idx, tx, ty, 0, 1)) {
      const e = G.ledgeLeft[v % G.ledgeLeft.length];
      g.drawImage(e.img, px - e.ax, py - base - e.ay, e.w, e.h);
      g.drawImage(G.lipLeft.img, X, Y, sp.w, sp.h);
    }
    if ((part === 'far' || part === 'left') && this.drops(f, idx, tx, ty, 1, 0)) {
      const e = G.ledgeRight[v % G.ledgeRight.length];
      g.drawImage(e.img, px - e.ax, py - base - e.ay, e.w, e.h);
      g.drawImage(G.lipRight.img, X, Y, sp.w, sp.h);
    }
  }

  /** How far a wall is built up over its own height: as far as the raised floor (not a stair) that lies at its foot, toward the eye. */
  private wallLift(R: Relief, tx: number, ty: number): number {
    const f = R.floor;
    let up = 0;
    for (let k = 0; k < 3; k++) {
      const nx = tx + (k === 1 ? 0 : 1);
      const ny = ty + (k === 0 ? 0 : 1);
      if (nx >= f.w || ny >= f.h) continue;
      const j = ny * f.w + nx;
      if (f.tiles[j] === T_FLOOR && !(f.stair && f.stair[j] !== 0) && R.top[j] > up) up = R.top[j];
    }
    return up;
  }

  /**
   * WHAT LIES ON THE FLOOR: the litter and what is left of a barrel, the town's rugs, the hero's
   * patches of fire and frost, traps, the mark of a volley, the bodies of the fallen, the effects
   * that lie flat, and every shadow. `pass`: -1 on a level that is all of one height (all of it);
   * on a level with ledges, 2 for what lies on sunken floor (and the flights down into it), 0 for
   * what lies on the room's own floor, and 1 for what lies on raised floor and the flights up to
   * it (each is drawn after its own floor: see `draw`).
   */
  private flat(g: CanvasRenderingContext2D, W: number, H: number, game: Game, fx: Fx, t: number, amb: number, pass: number): void {
    const art = this.art;
    const L = game.level;
    const f = L.floor;
    const cam = this.cam;
    const h = game.hero;
    const top = this.relief ? this.relief.top : null;
    const fw = f.w;
    const fh = f.h;
    /** Is the ground at this place the kind this pass draws on? */
    const hs = f.height;
    const yo = this.yardOnly;
    const go = this.groundsOnly;
    const here = (x: number, y: number): boolean => {
      // (THE HEADSMAN'S YARD: from in it, nothing of what lies behind its far walls)
      if (yo && !this.yard.shows(yo, Math.floor(x), Math.floor(y))) return false;
      if (go && !this.grounds.shows(go, Math.floor(x), Math.floor(y))) return false;
      if (pass < 0 || !top) return true;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx < 0 || ty < 0 || tx >= fw || ty >= fh) return pass === 0;
      const i = ty * fw + tx;
      // (sunken floor and the flights down into it; raised floor and the flights up to it; the room's own floor)
      return (hs && hs[i] < 0 ? 2 : top[i] > 0 ? 1 : 0) === pass;
    };
    // (THE CRYPT, art/crypt.ts, behind CRYPT: the stairwell down and the waypoint, where a picture puts them)
    if (CRYPT.on && CRYPT.marks.level === L && pass <= 0) this.flatCrypt(g, L, t);
    // (THE WAYS, game/ways.ts: the level's own stairwell and waypoint)
    if (L.ways && pass <= 0) this.flatWays(g, L, t, game);
    if (L.ways && pass <= 0) this.dress.flat(g, game, this.stage);
    if (this.dressed) this.pieces.shadows(g, game, this.stage, here);
    for (const p of L.props) {
      if ((!L.explored[p.ty * f.w + p.tx] && !this.openGround) || !here(p.x, p.y)) continue;
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y);
      if (sx < -60 || sx > W + 60 || sy < -30 || sy > H + 60) continue;
      // (ACT 1, THE DESCENT: the floor's own pieces that lie on the floor, and what is left of its breakables; the soft shadows of what stands)
      if (this.act1Dressed) {
        const a = this.act1;
        const r = a.shadowOf(p);
        if (r > 0) this.shadow(g, Math.round(sx), Math.round(sy), r, SHADOW);
        // (ART_TWEAKS.cast, a mock-up: and one falling away from the light, seen past a bulky piece's foot)
        if (r > 0 && ART_TWEAKS.cast) this.shadow(g, Math.round(sx + r * 22), Math.round(sy + r * 6), r * 1.3, SHADOW * 0.85);
        if (a.lies(p) || ((p.kind === 'barrel' || p.kind === 'urn') && p.state === 1)) {
          const sp = a.sprite(p, t);
          if (sp) g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
          continue;
        }
        if (p.kind === 'piece' || p.kind === 'barrel' || p.kind === 'urn') continue;
      }
      // (THE FIRST FIVE FLOORS: the floor's own bones, and what its breakables leave: render/pieces.ts)
      const own = this.dressed ? this.pieces.flat(p) : undefined;
      if (own !== undefined) {
        if (own) g.drawImage(own.img, Math.round(sx) - own.ax, Math.round(sy) - own.ay, own.w, own.h);
      } else if (p.kind === 'bones' || p.kind === 'rubble' || ((p.kind === 'barrel' || p.kind === 'urn') && p.state === 1)) {
        // (what is left of a barrel is staves and a hoop; of an urn, shards)
        const list = p.kind === 'bones' ? art.props.bones : p.kind === 'barrel' ? art.props.staves : p.kind === 'urn' ? art.props.shards : art.props.rubble;
        const sp = list[p.variant % list.length];
        g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
      } else if (isTownFlat(p.kind)) {
        // the town's: the rug the bazaar stands on, and the circle cut in the floor round the wordsmith (a brighter arc goes round it)
        const sp = townSprite(art, p.kind, p.variant, t);
        if (sp) g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
      } else if (p.kind === 'body') {
        // the fallen wordsmith: until it has been searched, the book glints and the air round it stirs
        const sp = p.state === 1 ? art.props.fallenSearched : art.props.fallen;
        g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
        if (p.state === 0 && Math.random() < 0.2 * amb) fx.mote(p.x, p.y, [P.tl5, P.tl4, P.white]);
        // (THE MASTER RUNE-STONE, art/quest3.ts, behind QUEST3: lying beside him, its rune throbbing)
        if (QUEST3.on && QUEST3.stone === 'lying' && art.quest) {
          const st = art.quest.lying[Math.floor(t * 8) % STONE_LYING_FRAMES];
          const x = wx(cam, p.x + STONE_BY[0], p.y + STONE_BY[1]);
          const y = wy(cam, p.x + STONE_BY[0], p.y + STONE_BY[1]);
          g.drawImage(st.img, Math.round(x - st.ax), Math.round(y - st.ay), st.w, st.h);
          if (st.lights) this.propLit.push({ s: st, x: Math.round(x), y: Math.round(y) });
          if (Math.random() < 0.15 * amb) fx.mote(p.x + STONE_BY[0], p.y + STONE_BY[1], [P.white, '#b8fff8', '#22d0e0']);
        }
      }
    }
    // (THE FIRST FIVE FLOORS' NEW LOOKS: what each lays flat, added where it is light, over what lies on the floor: floor 1's pools
    // of daylight, the castle hall's slats of sun: render/looks.ts)
    if (this.lookNow?.flats && pass <= 0) {
      for (const q of this.lookNow.flats(L, this.clockNow)) {
        if (!L.explored[Math.floor(q.y) * L.floor.w + Math.floor(q.x)]) continue;
        const sx = Math.round(wx(this.cam, q.x, q.y));
        const sy = Math.round(wy(this.cam, q.x, q.y));
        if (sx - q.s.ax > W || sx - q.s.ax + q.s.w < 0 || sy - q.s.ay > H || sy - q.s.ay + q.s.h < 0) continue;
        if (q.add) g.globalCompositeOperation = 'lighter';
        // (how strongly, where the look says: the Shaft's Rim's far fire, breathing)
        const was = g.globalAlpha;
        if (q.alpha !== undefined) g.globalAlpha = Math.max(0, Math.min(1, q.alpha)) * was;
        g.drawImage(q.s.img, sx - q.s.ax, sy - q.s.ay, q.s.w, q.s.h);
        if (q.alpha !== undefined) g.globalAlpha = was;
        g.globalCompositeOperation = 'source-over';
      }
    }
    // (THE TRAPS) a spike floor's holes, glinting in the moment before its spikes come up; a dart wall's plate
    for (const z of L.hazards) {
      const s = z.spot;
      // (ACT 1: the floor's own trap, its frames by its beat: render/act1_pieces.ts)
      if (this.act1Dressed && s.kind === 'spikes') {
        const at = trapAt(s, game.time);
        // (ACT 2, THE HUSH: a trap its floor's dresser laid with a picture of its own, drawn once where it stands: render/act1_pieces.ts trapOf)
        const own = this.act1.trapOf(s, at.at, at.k ?? 0);
        if (own !== undefined) {
          if (own) g.drawImage(own.sp.img, Math.round(wx(cam, own.x, own.y)) - own.sp.ax, Math.round(wy(cam, own.x, own.y)) - own.sp.ay, own.sp.w, own.sp.h);
          continue;
        }
        const sp = this.act1.trapFrame(at.at === 'warn' ? 'warn' : at.at === 'down' ? 'down' : 'up', at.at === 'up' ? Math.min(1, at.k ?? 1) : 0);
        if (sp) for (let ty = s.y; ty < s.y + s.h; ty++) for (let tx = s.x; tx < s.x + s.w; tx++) g.drawImage(sp.img, Math.round(wx(cam, tx, ty)) - sp.ax, Math.round(wy(cam, tx, ty)) - sp.ay, sp.w, sp.h);
        continue;
      }
      const sp = s.kind === 'spikes' ? art.hazards.holes(spikeAt(s, game.time).at === 'warn') : art.hazards.plate(z.pressed > 0);
      for (let ty = s.y; ty < s.y + s.h; ty++) {
        for (let tx = s.x; tx < s.x + s.w; tx++) {
          if (!L.explored[ty * f.w + tx] || !here(tx + 0.5, ty + 0.5)) continue;
          g.drawImage(sp.img, Math.round(wx(cam, tx + 0.5, ty + 0.5)) - sp.ax, Math.round(wy(cam, tx + 0.5, ty + 0.5)) - sp.ay, sp.w, sp.h);
        }
      }
    }
    // (THE FIRST FIVE FLOORS: what the bosses of floors 2 to 5 warn of, leave and cast shadows of on the floor: render/bossfx.ts)
    if (game.perils.length || game.boss || game.level.act1 || game.monsters.some((m) => m.state === 'act')) this.bossFx.ground(g, this.floorAt, game, t, here);
    // (THE LAST WORDS: Reaping's spirits, a plain stand-in in the word's colour until the art chat's look; with its look on, the
    // little grey Shade stands among the figures instead: render/words7.ts spiritsW7)
    for (const sp of game.spirits) {
      if (WORDS7_LOOK.on || !here(sp.x, sp.y)) continue;
      const fade = Math.min(1, (sp.life - sp.t) * 2, sp.t * 4);
      ellipse(g, wx(cam, sp.x, sp.y), wy(cam, sp.x, sp.y) - 8, 0.35, WORD_COLOR.reaping, 0.6 * fade);
      ringDots(g, wx(cam, sp.x, sp.y), wy(cam, sp.x, sp.y) - 8, 0.35, WORD_COLOR.reaping);
    }
    for (const z of game.zones) {
      // (THE MONSTERS' ATTACKS: the line a red troll will charge along, in the red circle's own reds: art/charge_lane.ts)
      if (z.kind === 'lane') {
        const x1 = z.x1 ?? z.x;
        const y1 = z.y1 ?? z.y;
        if (here(z.x, z.y) || here(x1, y1) || here((z.x + x1) / 2, (z.y + y1) / 2)) drawChargeLane(g, { x0: z.x, y0: z.y, x1, y1, half: z.r, k: z.dur > 0 ? z.t / z.dur : 1, gone: z.gone }, (x, y) => [wx(cam, x, y), wy(cam, x, y)]);
        continue;
      }
      // (THE NEW MONSTERS: a Golem's skull: its own shadow on the floor as it comes down, no circle; its
      // burst where it lands. The skull itself is drawn with what flies, over the figures: art/mob_shots.ts)
      if (z.kind === 'skull') {
        if (z.t < z.dur) {
          const s = skullAt(z);
          // (as wide, when it lands, as what it will hurt: a tile on the floor is 16 pixels to its middle across, and a circle on it as wide as its radius times that times the square root of two)
          if (here(s.x, s.y)) drawSkullShadow(g, this.floorAt, s.x, s.y, s.z, SKULL.top, Math.round(z.r * 16 * Math.SQRT2));
        } else if (here(z.x, z.y)) drawSkullBurst(g, this.floorAt, z.x, z.y, z.t - z.dur);
        continue;
      }
      // (THE NEW MONSTERS: the bone marksman's line of aim, running out as he draws: art/mob_shots.ts)
      if (z.kind === 'aim') {
        const x1 = z.x1 ?? z.x;
        const y1 = z.y1 ?? z.y;
        if (here(z.x, z.y) || here(x1, y1) || here((z.x + x1) / 2, (z.y + y1) / 2)) drawAimLine(g, this.floorAt, z.x, z.y, x1, y1, (z.t - AIM.from) / Math.max(0.01, z.dur - AIM.from), t);
        continue;
      }
      // (THE NEW MONSTERS: the high priest's burning smoke, billowing, burning and thinning away)
      if (z.kind === 'smoke') {
        if (here(z.x, z.y)) drawBurningSmoke(g, this.floorAt, z.x, z.y, z.r, z.t / z.dur, t);
        continue;
      }
      if (!here(z.x, z.y)) continue;
      const cx = wx(cam, z.x, z.y);
      const cy = wy(cam, z.x, z.y);
      const k = z.t / z.dur;
      if (z.kind !== 'warn' && this.skip.has('ground')) continue;
      // (Heavy's cracked ground and Guarding's ward are drawn with the new words' looks: words3.ts, floor3; and since Version 23.8
      // Pulling's vortex, Hexing's circle and Stilling's bubble)
      if (z.kind === 'cracks' || z.kind === 'ward' || z.kind === 'vortex' || z.kind === 'hex' || z.kind === 'bubble' || z.kind === 'snare') continue;
      // (THE LAST WORDS, 8 Nov 2026: Bleeding's thorns, Culling's reaper's mark, Mirroring's mirror: plain stand-ins in the word's colour
      // until the art chat's looks)
      if (z.kind === 'thorns' || z.kind === 'reaper' || z.kind === 'mirror') {
        const col = WORD_COLOR[z.kind === 'thorns' ? 'bleeding' : z.kind === 'reaper' ? 'culling' : 'mirroring'];
        ellipse(g, cx, cy, z.r, col, 0.22 * Math.min(1, (z.dur - z.t) * 2));
        ringDots(g, cx, cy, z.r, col);
        continue;
      }
      // (a melded word's patch has a look of its own, behind MELD3, off: render/melds3.ts, floorM3)
      if (ownsZone(z)) continue;
      // (Binding's snare has a look of its own, behind BINDING3, off: render/binding3.ts, floorB3)
      if (ownsZoneB3(z)) continue;
      // (and the seven new words' zones, thorns, the reaper's mark and the mirror, behind WORDS7_LOOK, off: render/words7.ts)
      if (ownsZoneW7(z)) continue;
      // (and the five Volatile melds' runes and patches, behind VOLATILE3, off: render/volatile3.ts, floorV3)
      if (ownsZoneV3(z)) continue;
      if (z.kind === 'warn') {
        ellipse(g, cx, cy, z.r, P.bl3, 0.16 + 0.3 * k);
        ellipse(g, cx, cy, z.r * k, P.bl4, 0.3);
        ringDots(g, cx, cy, z.r, P.bl5);
      } else if (z.kind === 'rune') {
        // Volatile behind: a sigil written on the floor. It beats faster and whiter as its time
        // runs out, and a ring closes in from the edge of the blast to come.
        const beat = Math.sin(z.t * (10 + k * 34)) > 0;
        const col = k > 0.72 ? (beat ? P.white : P.pu5) : beat ? P.pu5 : P.pu4;
        ringDots(g, cx, cy, z.r, P.pu2, 3);
        ellipse(g, cx, cy, 0.95, P.pu3, 0.3 + 0.3 * k);
        ringDots(g, cx, cy, 0.95, col);
        ringDots(g, cx, cy, 0.5, col, 2);
        const turn = t * 1.4;
        for (let i = 0; i < 3; i++) {
          const a0 = turn + (i / 3) * Math.PI * 2;
          const a1 = turn + ((i + 1) / 3) * Math.PI * 2;
          pline(g, wx(cam, z.x + Math.cos(a0) * 0.9, z.y + Math.sin(a0) * 0.9), wy(cam, z.x + Math.cos(a0) * 0.9, z.y + Math.sin(a0) * 0.9), wx(cam, z.x + Math.cos(a1) * 0.9, z.y + Math.sin(a1) * 0.9), wy(cam, z.x + Math.cos(a1) * 0.9, z.y + Math.sin(a1) * 0.9), col);
        }
        ringDots(g, cx, cy, Math.max(0.95, z.r * (1 - 0.75 * k)), k > 0.72 ? P.white : P.pu5, 1);
        g.fillStyle = elementColors(z.element, true)[3];
        g.fillRect(Math.round(cx) - 1, Math.round(cy) - 1, 3, 2);
        if (Math.random() < (0.3 + k * 0.6) * amb) fx.mote(z.x, z.y, [P.pu5, P.pu4, P.white]);
      } else {
        // The hero's ground patches. There can be dozens (a shot leaves one every step of its
        // way), so each is painted once into a picture of its own and then stamped down.
        const fade = Math.min(1, (z.dur - z.t) * 2);
        const seed = Math.floor(z.x * 7 + z.y * 13);
        const big = z.r >= 1.2;
        const rk = Math.round(z.r * 8);
        const r = rk / 8;
        const hw = Math.ceil(r * 22.6) + 2;
        const hh = Math.ceil(r * 11.3) + 2;
        const px = Math.round(cx);
        const py = Math.round(cy);
        if (z.kind === 'venom') {
          // Poison behind: the floor is slick with it, and a cloud of it hangs low (the cloud is drawn in the air)
          const sp = this.patch(`venom:${rk}`, hw, hh, 0, (c) => {
            ellipse(c, 0, 0, r, P.vn2, 0.34);
            ellipse(c, 0, 0, r * 0.7, P.vn3, 0.22);
            ringDots(c, 0, 0, r, P.vn3, 2);
          });
          g.globalAlpha = fade * Math.min(1, 0.3 + z.t / 0.15);
          g.drawImage(sp, px - hw, py - hh);
          g.globalAlpha = 1;
          if (Math.random() < 0.3 * z.r * amb) fx.bubbles(z.x, z.y, z.r * 0.85, 1);
        } else if (z.kind === 'burn') {
          // Flame behind: the floor burns. A glowing bed, a brighter heart that breathes, and
          // flames that keep rising from all over it.
          const sp = this.patch(`burn:${rk}`, hw, hh, 0, (c) => {
            ellipse(c, 0, 0, r, P.fr2, 0.3);
            ellipse(c, 0, 0, r * 0.62, P.fr4, 0.3);
            ellipse(c, 0, 0, r * 0.3, P.fr5, 0.25);
          });
          g.globalAlpha = fade;
          g.drawImage(sp, px - hw, py - hh);
          g.globalAlpha = 1;
          if (big) ellipse(g, cx, cy, z.r * (0.66 + 0.07 * Math.sin(t * 9 + seed)), P.fr4, 0.12 * fade);
          for (let n = some(Math.min(2.4, 0.5 + z.r * 0.9) * fade * amb); n > 0; n--) fx.flames(z.x, z.y, z.r * 0.85, 1);
        } else if (z.kind === 'ice') {
          // Frost behind: the floor is frozen over. Pale ice with cracks, crystals standing round
          // its edge, glints, and snow in the air above it.
          const v = seed % 5;
          const up = 10;
          const sp = this.patch(`ice:${rk}:${v}`, hw, hh, up, (c) => {
            ellipse(c, 0, 0, r, P.bu4, 0.28);
            ellipse(c, 0, 0, r * 0.72, P.bu5, 0.2);
            for (let i = 0; i < 3; i++) {
              const a = hash2(i, v, 1) * Math.PI * 2;
              const b = a + 2.2 + hash2(i, v, 2);
              pline(c, (Math.cos(a) - Math.sin(a)) * 16 * r * 0.8, (Math.cos(a) + Math.sin(a)) * 8 * r * 0.8, (Math.cos(b) - Math.sin(b)) * 16 * r * 0.6, (Math.cos(b) + Math.sin(b)) * 8 * r * 0.6, P.bu5);
            }
            // (fewer crystals round the small patches a shot leaves along its path: there are many of those)
            const n = big ? Math.round(7 + r * 5) : Math.round(3 + r * 4);
            for (let i = 0; i < n; i++) {
              const a = (i / n) * Math.PI * 2 + hash2(i, v, 3) * 0.5;
              const d = r * (0.86 + hash2(i, v, 4) * 0.12);
              const qx = Math.round((Math.cos(a) - Math.sin(a)) * 16 * d);
              const qy = Math.round((Math.cos(a) + Math.sin(a)) * 8 * d);
              const tall = Math.round(3 + hash2(i, v, 5) * 6);
              c.fillStyle = P.bu4;
              c.fillRect(qx + 1, qy - tall + 1, 1, tall);
              c.fillStyle = P.white;
              c.fillRect(qx, qy - tall, 1, tall);
              c.fillStyle = P.bu5;
              c.fillRect(qx - 1, qy - Math.round(tall * 0.55), 1, Math.round(tall * 0.55));
            }
          });
          // it spreads over the floor in its first moment
          g.globalAlpha = fade * Math.min(1, 0.25 + z.t / 0.12);
          g.drawImage(sp, px - hw, py - hh - up);
          // glints that come and go
          g.globalAlpha = fade;
          g.fillStyle = P.white;
          for (let i = 0; i < (big ? 4 : 2); i++) {
            if (hash2(i, seed, Math.floor(t * 5)) > 0.3) continue;
            const a = hash2(i, seed, 6) * Math.PI * 2;
            const d = hash2(i, seed, 7) * z.r * 0.8;
            g.fillRect(Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)), Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)), 2, 1);
          }
          g.globalAlpha = 1;
          if (Math.random() < 0.25 * z.r * amb) fx.mote(z.x + (Math.random() - 0.5) * z.r * 1.4, z.y + (Math.random() - 0.5) * z.r * 1.4, [P.white, P.bu5]);
        } else if (z.kind === 'steam') {
          // (WORDMELDING, behind MELD) Scald behind: the floor wet and hot, steam pouring up off it
          // (the steam itself is drawn in the air)
          const sp = this.patch(`steam:${rk}`, hw, hh, 0, (c) => {
            ellipse(c, 0, 0, r, P.st5, 0.34);
            ellipse(c, 0, 0, r * 0.66, P.st7, 0.26);
            ringDots(c, 0, 0, r, P.st7, 2);
          });
          g.globalAlpha = fade * Math.min(1, 0.3 + z.t / 0.15);
          g.drawImage(sp, px - hw, py - hh);
          g.globalAlpha = 1;
          if (Math.random() < 0.3 * z.r * amb) fx.mote(z.x + (Math.random() - 0.5) * z.r * 1.4, z.y + (Math.random() - 0.5) * z.r * 1.4, [P.white, P.st7]);
        } else {
          // Lightning behind: the ground under a thundercloud (the cloud itself is drawn in the
          // air): its shadow, a rim that flickers, and arcs that jump about inside it.
          const lit = Math.floor(t * 14) % 2 === 0;
          const sp = this.patch(`storm:${rk}:${lit ? 1 : 0}`, hw, hh, 0, (c) => {
            ellipse(c, 0, 0, r, P.black, 0.2);
            ringDots(c, 0, 0, r, lit ? P.lt4 : P.lt3, 2);
          });
          g.globalAlpha = fade;
          g.drawImage(sp, px - hw, py - hh);
          g.globalAlpha = 1;
          if (big) ellipse(g, cx, cy, z.r * 0.55, P.lt4, (0.05 + 0.05 * Math.abs(Math.sin(t * 11 + seed))) * fade);
          if (Math.random() < 0.09 * amb) {
            const a = Math.random() * Math.PI * 2;
            const b = a + 1.2 + Math.random() * 2.4;
            fx.groundBolt(z.x + Math.cos(a) * z.r * 0.8, z.y + Math.sin(a) * z.r * 0.8, z.x + Math.cos(b) * z.r * 0.8, z.y + Math.sin(b) * z.r * 0.8);
          }
          if (Math.random() < 0.45 * amb) fx.spray(z.x + (Math.random() - 0.5) * z.r * 1.5, z.y + (Math.random() - 0.5) * z.r * 1.5, 1, ELEMENT_RAMP.lightning, 1.6, 40, 2);
        }
      }
    }
    // (THE NEW WORDS, a mock-up behind a switch that is off: what they leave on the floor)
    if (WORDS3.on && !this.skip.has('ground')) floor3(g, cam, t, game, here);
    if (MELD3.on && !this.skip.has('ground')) floorM3(g, cam, t, game, here);
    if (BINDING3.on && !this.skip.has('ground')) floorB3(g, cam, t, game, here);
    if (VOLATILE3.on && !this.skip.has('ground')) floorV3(g, cam, t, game, here);
    if (WORDS7_LOOK.on && !this.skip.has('ground')) floorW7(g, cam, t, game, here);
    if (WORDS10_LOOK.on && !this.skip.has('ground')) floorW10(g, cam, t, game, here);
    for (const tr of game.traps) {
      if (!here(tr.x, tr.y)) continue;
      const frames = art.icons.trap[tr.element];
      const sp = frames[tr.arm <= 0 && Math.floor(t * 3) % 2 === 0 ? 1 : 0];
      const cx = wx(cam, tr.x, tr.y);
      const cy = wy(cam, tr.x, tr.y);
      // The words it was laid with show while it waits: each word in front is a ring that beats
      // round it, each word behind a spark that circles it.
      const sk = game.hero.skills[tr.skill];
      if (sk) {
        let k = 0;
        for (const w of sk.front) {
          if (!w) continue;
          const beat = Math.sin(t * 6 - k * 1.3);
          ringDots(g, cx, cy, 0.4 + k * 0.17 + beat * 0.04, WORD_COLOR[w], beat > 0 ? 1 : 2);
          k++;
        }
        const n = sk.behind.filter((w) => w !== null).length;
        let j = 0;
        for (const w of sk.behind) {
          if (!w) continue;
          const a = t * 2.4 + (j / n) * Math.PI * 2;
          const r = 0.55 + k * 0.17;
          const px = Math.round(wx(cam, tr.x + Math.cos(a) * r, tr.y + Math.sin(a) * r));
          const py = Math.round(wy(cam, tr.x + Math.cos(a) * r, tr.y + Math.sin(a) * r));
          g.fillStyle = WORD_COLOR[w];
          g.fillRect(px - 1, py - 2, 2, 2);
          g.fillStyle = P.white;
          g.fillRect(px, py - 2, 1, 1);
          j++;
        }
      }
      // (THE RANGER'S SNARE, game/swap_moves.ts: its rope, render/swap_fx.ts)
      if (tr.snare) drawSnare(g, cam, tr.x, tr.y, tr.arm <= 0, t, tr, game.hero.x, game.hero.y);
      else g.drawImage(sp.img, Math.round(cx) - sp.ax, Math.round(cy) - sp.ay);
    }
    // A volley's patch of ground (Version 12.2): marked from the moment the arrows leave the bow,
    // so that the player sees where they will come down. While they are still in the air a second
    // ring closes in on the middle; once they fall, the ring beats.
    for (const v of game.volleys) {
      if (!here(v.x, v.y)) continue;
      const cx = wx(cam, v.x, v.y);
      const cy = wy(cam, v.x, v.y);
      const ramp = ELEMENT_RAMP[v.element];
      const air = v.t < 0;
      ellipse(g, cx, cy, v.r, ramp[2], air ? 0.05 : 0.08);
      ringDots(g, cx, cy, v.r, air ? ramp[1] : Math.floor(t * 8) % 2 === 0 ? ramp[3] : ramp[2], air ? 3 : 2);
      if (air) ringDots(g, cx, cy, Math.max(0.2, v.r * (-v.t / TUNE.volleyDelay)), ramp[3], 2);
    }
    // THE BODIES of the monsters killed in this dungeon: each lies where it fell, flat on the floor
    // (under whatever burns or freezes there, and under everything that stands). The effects keep
    // the list; it is emptied when the level is another.
    if (this.fallenFor !== game.level) {
      this.fallenFor = game.level;
      fx.fallen.length = 0;
    }
    for (const f of fx.fallen) {
      if (!here(f.x, f.y)) continue;
      const sx = wx(cam, f.x, f.y);
      const sy = wy(cam, f.x, f.y);
      if (sx < -90 || sx > W + 90 || sy < -60 || sy > H + 90) continue;
      const shown = this.fallenSprite(f);
      if (!shown || !shown.lying || f.away) continue;
      // (a body settles into the floor's dark over a second and a half: with forty of them lying
      // about, what still stands, and what was dropped, must be the brighter things on the screen)
      // (BODIES: and fades out over the last of its while)
      const going = BODIES.on ? Math.min(1, Math.max(0, (BODIES.life - f.t) / BODIES.fade)) : 1;
      // (THE STOKER: what is left of him, his scattered iron, fades once his death is done, the gear left lying: render/act1_fx/stoker.ts)
      const pieces = f.figure === 'stoker' ? Math.min(1, Math.max(0, 1 - shown.since / STOKER_PIECES_FADE)) : 1;
      if (pieces <= 0) continue;
      g.globalAlpha = (1 - (1 - BODY_DIM) * Math.min(1, Math.max(0, shown.since) / BODY_SETTLES)) * going * pieces;
      // (THE SEVEN NEW WORDS' LOOKS, behind a switch that is off: one Culling cut down lies in its two halves: render/words7.ts)
      const lie = (WORDS7_LOOK.on ? lyingW7(f) : null) ?? shown.sp;
      g.drawImage(lie.img, Math.round(sx) - lie.ax, Math.round(sy) - lie.ay, lie.w, lie.h);
    }
    g.globalAlpha = 1;
    // (the effects that lie flat are drawn once, over the last floor to be drawn)
    if ((pass < 0 || pass === 1) && !this.skip.has('fx')) fx.drawGround(g, cam);
    // (THE VETERAN's that lie on the floor: the push kick's cone, the crescents' traces, rings, dust behind him: render/veteran_fx.ts)
    if ((pass < 0 || pass === 1) && !this.skip.has('fx')) this.vetFx.drawGround(g, cam, game);
    // (QUESTS610, PILLARS: the cult's obelisks round the Drowned Eye's ring, burning or put out: render/pillars.ts)
    if ((pass < 0 || pass === 1) && L.pillars) drawPillars(g, cam, L.pillars, game.time);

    // (THE NEW MONSTERS: a Boneward's spear lying where it came down, till it is picked up)
    for (const sp of game.spears) if (L.explored[Math.floor(sp.y) * f.w + Math.floor(sp.x)] && here(sp.x, sp.y)) drawSpearLying(g, this.floorAt, sp.x, sp.y, sp.fx, sp.fy);
    // shadows, and the rings that mark elites
    for (const m of game.monsters) {
      if (m.dead || !m.seen || !here(m.x, m.y) || unseen(m)) continue;
      const cx = wx(cam, m.x, m.y);
      const cy = wy(cam, m.x, m.y);
      // (THE NEW MONSTERS' RINGS, with them: a blue pack's blue, with its word inside; a yellow pack's
      // leader's written in his words and ringed in gold; his minions' gold and half there, filled with
      // his word while his cry holds: render/pack_marks.ts. A leader with no word, as the first
      // dungeon's, keeps the ring an elite has always had.)
      const marks = PACK_MARKS.on && m.rarity !== undefined;
      const words = m.rarity === 'minion' ? (m.half ?? []) : m.words;
      if (marks && m.rarity && words.length) drawPackMark(g, this.floorAt, m.x, m.y, m.r, { rarity: m.rarity, words, cry: m.rallyT ? Math.min(1, m.rallyT / 0.5) : 0 }, t);
      else if ((named(m) || m.boss) && !(marks && m.rarity === 'minion')) {
        // (UNIQUE ITEMS, behind a switch that is off: The Crier's Hush, its words darkened: its ring the Hush's dead grey)
        const col = UNIQUE_PLAY.hush && m.dark ? HUSH[3] : m.words.length ? WORD_COLOR[m.words[0]] : P.fr4;
        ringDots(g, cx, cy, m.r * (1.5 + 0.12 * Math.sin(t * 5)), col);
      }
      if (m.id === this.lockId) lockRing(g, cx, cy, Math.max(0.62, m.r * 1.9), t);
      this.shadow(g, cx, cy, m.r * 0.75, SHADOW);
    }
    if (here(h.x, h.y)) {
      // (a hero in the air is further from their shadow: it is smaller and fainter at the top of a leap)
      // (THE VETERAN off the floor in a move: as high as the art has him, render/veteran_fx.ts)
      const vetUp = this.vetFx.liftOf(game);
      const up = vetUp > 0 ? Math.min(1, vetUp / 40) : h.move && h.move.kind === 'leap' ? Math.sin(Math.PI * Math.min(1, h.move.t / h.move.dur)) * (THRUST.on && h.cls === 'warrior' ? THRUST_LIFT / LEAP_LIFT : 1) : 0;
      this.shadow(g, wx(cam, h.x, h.y), wy(cam, h.x, h.y), 0.36 * (1 - 0.3 * up), SHADOW * (1 - 0.35 * up));
    }
    for (const o of game.orbs) if (here(o.x, o.y)) this.shadow(g, wx(cam, o.x, o.y), wy(cam, o.x, o.y), 0.42, SHADOW * 0.85);
    // (THE TINKERER'S GOLEMS: a soft shadow under each, as under everyone, growing with it under her Growth Serum, coming in as it
    // drops in. His word, 2 Nov 2026, 21:05: “And the golem needs a shadow”)
    for (const gm of game.golems) {
      if (!here(gm.x, gm.y)) continue;
      const GS = TINKER_TUNE.talents.growth;
      const grow = gm.growT > 0 ? 1 + (GS.big - 1) * Math.max(0, Math.min(1, (GS.secs - gm.growT) / 0.25, gm.growT / 0.25)) : 1;
      const come = gm.act === 'arrive' ? Math.min(1, gm.actT / 0.25) : gm.act === 'jump' ? 1 - 0.45 * Math.sin(Math.PI * Math.min(1, gm.actT / TINKER_TUNE.golem.jump.long)) : 1;
      // (behind GOLEM_ROCKET, the art chat's: shrinking and fading further as it flies twice as high)
      const rk = GOLEM_ROCKET.on && gm.act === 'jump' ? rocketShadow(rocketFrame(gm.actT) - ROCKET.blast) : { r: 0.6 + 0.4 * come, a: come };
      this.shadow(g, wx(cam, gm.x, gm.y), wy(cam, gm.x, gm.y), GOLEM_SHADOW * grow * rk.r, Math.min(1, SHADOW * 1.2) * rk.a);
    }
    // (CON_SEEN, a mock-up: the friend's cyan ring round each of her Contraptions set up)
    if (CON_SEEN.on && CON_SEEN.ring) {
      for (const c of game.contraptions) {
        if (!here(c.x, c.y) || c.broke >= 0 || c.t < 22 / 30) continue;
        const cx = Math.round(wx(cam, c.x, c.y));
        const cy = Math.round(wy(cam, c.x, c.y));
        const k = Math.min(1, (c.t - 22 / 30) / 0.2);
        ellipse(g, cx, cy, 0.5 * CON_SEEN.scale, '#22d0e0', 0.14 * k);
        g.globalAlpha = k;
        ringDots(g, cx, cy, 0.46 * CON_SEEN.scale, '#7af4ff');
        g.globalAlpha = 1;
      }
    }
    // (the Meldstone hanging over the floor has a shadow too, smaller and fainter the higher it is: art/meld_drops.ts)
    if (MELD_DROPS.on) {
      for (const dr of game.drops) {
        if (dr.kind !== 'stone' || dr.age < 0 || !here(dr.x, dr.y)) continue;
        const z = riseOf(dr.age, t).z ?? 0;
        const up = Math.min(1, z / 40);
        this.shadow(g, wx(cam, dr.x, dr.y), wy(cam, dr.x, dr.y), 0.22 * (1 - 0.4 * up), SHADOW * 0.55 * (1 - 0.5 * up));
      }
    }
    for (const q of game.familiars) if (here(q.x, q.y)) this.shadow(g, wx(cam, q.x, q.y), wy(cam, q.x, q.y), 0.14, SHADOW * 0.7);

  }

  /**
   * The picture of a character this frame. `heavy` asks for the slow attack's frames, and `leapK`
   * (0..1, how far through a leap) for the leap's, where the art has them.
   */
  private actorSprite(art: ActorArt, anim: string, animT: number, attackFrame: number, fx: number, fy: number, heavy = false, leapK = -1): Sprite {
    const left = fx - fy < 0;
    const set = fx + fy < -0.2 ? art.back : art.front;
    let s: Sprite;
    if (leapK >= 0 && set.leap) s = set.leap[leapK < 0.18 ? 0 : leapK < 0.7 ? 1 : 2];
    else if (anim === 'attack') s = (heavy && set.heavy ? set.heavy : set.attack)[Math.max(0, Math.min(2, attackFrame))];
    else if (anim === 'walk') s = set.walk[Math.floor(animT * (set.walkFps ?? 8)) % set.walk.length];
    else s = set.idle[Math.floor(animT * (set.idleFps ?? 2)) % set.idle.length];
    return left ? flipSprite(s, true) : s;
  }

  /** Which of the figure's two attack animations goes with the attack the hero is making (see attackClip). */
  private clipOf(game: Game): number {
    const h = game.hero;
    const s = h.skills[h.attackSkill];
    return s ? attackClip(h.cls, h.attackSkill, SKILLS[s.id].kind, h.combo) : h.attackSkill;
  }

  /** How long the hero has been holding an attack (a beam, a whirlwind), in seconds, or -1 when they are not; and which. */
  private heldFor(game: Game): number {
    const ch = game.hero.channel;
    return ch ? ch.t : -1;
  }
  /** The attack being wound up now is one that will be held (a beam, a whirlwind): it has a `channel`. */
  private holdSoon(game: Game): boolean {
    const w = game.hero.windup;
    const s = w ? game.hero.skills[w.skill] : null;
    return !!s && SKILLS[s.id].channel !== undefined;
  }
  private heldAs(game: Game): 'beam' | 'whirl' {
    const ch = game.hero.channel;
    const s = ch ? game.hero.skills[ch.skill] : null;
    return s && SKILLS[s.id].kind === 'whirl' ? 'whirl' : 'beam';
  }

  /** (THE WARRIOR'S BATTLE AXE) His thrown axe's pictures in the air, made the first time one is thrown. */
  private axeFly: Sprite[] | null = null;

  /** The hero's pictures: the class decides the figure, and what is in the hands shows on it. */
  private heroArt(game: Game): ActorArt {
    const h = game.hero;
    // (Until each hero is drawn with each weapon, a hero carrying another class's weapon is drawn
    // holding their own. The warrior has two figures: with the great sword in both hands when that
    // is what he carries, with sword and shield otherwise.)
    // (and whether they are in town: the heroes painted over the bones have their weapons on their backs there, art/heroes3.ts)
    // (EVERYONE FIGHTS WITH THEIR OWN MOVES, defs.ts OWN_MOVES: each always drawn with his own weapon, the warrior's the great sword)
    const arms = heavyDrawn(h.cls, h.talents);
    const look = {
      twoHanded: OWN_MOVES.on ? h.cls === 'warrior' : h.gear.mainhand !== null && h.gear.mainhand.weapon === 'greatsword',
      town: !!game.level.town,
      // (THE WARLOCK: the demon's pictures while he is it; his arm blazing while his pact is full)
      ...(h.cls === 'warlock' ? { demon: h.form === 'demon', blaze: h.form !== 'demon' && (h.pact ?? 0) >= WARLOCK_TUNE.pact.full } : {}),
      // (THE WARRIOR'S WEAPON, game/talents.ts WARRIOR_TREE2: the war axe or the maul in his hands, once his tree has picked it)
      ...(arms ? { weapon: arms } : {}),
    };
    // (THE WARLOCK KEPT IN PACKS: what he shows and may show next, from his side, asked for a moment ahead: render/warlock_packs.ts)
    if (h.cls === 'warlock' && this.warlockPacks) warlockAskAhead(this.warlockPacks, h, !!look.blaze, !!game.level.town, !!game.over);
    // Frames are painted ahead of need each time the world is drawn: the hero's, and those of the
    // monsters in this dungeon, turn and turn about. At least one each time, and more for as long
    // as it has cost less than WARM_MS (a fast machine has them all in a second or two; a slow
    // one paints one a frame). When a new place is drawn for the first time the whole picture
    // changes in that instant and a pause is not seen: then up to WARM_ENTER_MS is spent on it.
    const figs = this.figures;
    figs.length = 0;
    if (this.dieSoonFor !== game.level) {
      this.dieSoon.clear();
      this.dieAhead = [];
      this.dieAheadAt = 0;
      this.dieSoonFor = game.level;
    }
    for (const m of game.monsters) {
      if (m.dead) continue;
      // (one whose figure's own pictures are never drawn, the Swamp Colossus and his arms: none of them is painted ahead)
      if (act1Fx(m.kind)?.noFigure) continue;
      const f = figureOf(m);
      if (!figs.includes(f)) figs.push(f);
      // (A BOSS NEARING ITS END: its death painted next by the painter, so that its fall is not painted here as it is shown)
      if ((m.boss || m.kind === 'stoker') && m.life < m.maxLife * DIE_SOON && !this.dieSoon.has(f)) {
        this.dieSoon.add(f);
        this.painter?.dieFirst(f);
        this.art.bestiary.dieFirst(f);
        this.dieAheadOf(m);
      }
      // (THE MONSTERS' ATTACKS: the Warden calls up skeletons: their crawling out of the ground is painted ahead)
      if (m.boss && movesOf(m) && !figs.includes('skeleton')) figs.push('skeleton');
    }
    // THE FIRST FIVE FLOORS: a heavy figure (a boss of floors 2 to 5: a thousand frames, each ten times
    // an ordinary monster's to paint) is the painter's (render/painter.ts), beside the game. Where there
    // is no painter the game paints it too, but only one frame every HEAVY_EVERY times the world is drawn.
    const heavy = this.heavy;
    heavy.length = 0;
    // (THE FLOORS' MONSTERS BAKED, render/monsters_baked.ts: a figure whose pictures are the bake's, coming or come, is nobody's
    // to paint; where they are not to be had, as before)
    const baked = this.bakedMobs;
    for (let i = figs.length - 1; i >= 0; i--) {
      const f = figs[i];
      if (!HEAVY_FIGURES.includes(f)) continue;
      figs.splice(i, 1);
      // (the Chained One as he will be with his next chain broken, too; and as he was, never again: let go of)
      const wanted: MonsterFigure[] = f === 'chained' ? ['chained', 'chained1'] : f === 'chained1' ? ['chained1', 'chained2'] : [f];
      if (f === 'chained' && this.painter && !this.painter.small) wanted.push('chained2');
      for (const w of wanted) if (!baked?.take(w) && (!this.painter || !this.painter.mob(w))) heavy.push(w);
      const past: MonsterFigure[] = f === 'chained1' ? ['chained'] : f === 'chained2' ? ['chained', 'chained1'] : [];
      // (ACT 2, THE HUSH: one whose looks are stages it goes through, the Palimpsest more torn as its life runs down,
      // art/act1_figs/types.ts `staged`: its next painted ahead too; those it has gone past, never shown again, let go of)
      const stages = act1Stages(f);
      if (stages) {
        for (const w of stages.next as MonsterFigure[]) if (!baked?.take(w) && (!this.painter || !this.painter.mob(w))) heavy.push(w);
        past.push(...(stages.past as MonsterFigure[]));
      }
      for (const w of past) {
        this.painter?.done(w);
        this.art.bestiary.forget(w);
      }
    }
    // (THE OTHER MONSTERS' PICTURES BY THE PAINTER too: where its side worker is up, it paints them ahead, beside the game,
    // as it does the hero's; until it is, or where there is none, the game paints them ahead as before)
    if (baked) for (let i = figs.length - 1; i >= 0; i--) if (baked.take(figs[i])) figs.splice(i, 1);
    const side = this.painter;
    if (side) for (let i = figs.length - 1; i >= 0; i--) if (side.side(figs[i])) figs.splice(i, 1);
    const budget = this.warmedFor === game.level ? WARM_MS : WARM_ENTER_MS;
    this.warmedFor = game.level;
    if (heavy.length > 0 && this.warmFrame % HEAVY_EVERY === 0) this.art.bestiary.warm(heavy);
    const began = performance.now();
    // (THE HERO'S PICTURES BY THE PAINTER: where its worker is up, it paints them ahead, beside the game: a frame of a hero
    // is a frame's whole time and more to paint here, so the game painting one a frame ran late every frame until all
    // were done. Until the worker is up, or where there is none, the game paints them ahead as before.)
    const pw = this.painter && this.art.heroes.give ? this.painter : null;
    // (THE WARLOCK: the one he is now first, then his others: the demon's, his arm blazing, as a man in a dungeon)
    // (THE WARRIOR'S WEAPON: his places with the war axe or the maul, art/heroes.ts HEAVY_PLACES)
    const places = arms ? HEAVY_PLACES[arms] : { dungeon: 'dungeon' as const, town: 'town' as const };
    const now = h.cls === 'warlock' && !look.town ? (h.form === 'demon' ? 'demon' : look.blaze ? 'blaze' : 'dungeon') : look.town ? places.town : places.dungeon;
    const byWorker = !!pw && pw.hero(h.cls, now) && (!look.town || pw.hero(h.cls, places.dungeon)) && (h.cls !== 'warlock' || look.town || (pw.hero(h.cls, 'dungeon') && pw.hero(h.cls, 'blaze') && pw.hero(h.cls, 'demon')));
    const hero = (): boolean => !byWorker && this.art.heroes.warm(h.cls, look);
    const beast = (): boolean => figs.length > 0 && this.art.bestiary.warm(figs);
    // (Version 19.4: in town, once all of the town's are painted, the hero's pictures for the
    // dungeon are painted ahead too, so that fewer are left for the dungeon's first seconds; and
    // the hero and the monsters take turns by the frame as well as within one, so that when a
    // picture costs more than the budget, one a frame, the monsters' do not all wait behind his)
    const ahead = (): boolean => !byWorker && !!game.level.town && this.art.heroes.warm(h.cls, { ...look, town: false });
    // (and what else a boss's death shows that is painted here, as it nears its end: dieAheadOf)
    const death = (): boolean => {
      if (this.dieAheadAt >= this.dieAhead.length) return false;
      this.dieAhead[this.dieAheadAt++]();
      return true;
    };
    const heroFirst = (this.warmFrame++ & 1) === 0;
    for (let n = 0; n < 600; n++) {
      // (a boss's death's own, once he nears his end, before the rest of the monsters' frames, as his death is: Bestiary.dieFirst)
      const did = (n % 2 === 0) === heroFirst ? hero() || death() || beast() || ahead() : death() || beast() || hero() || ahead();
      if (!did || performance.now() - began >= budget) break;
    }
    return this.art.heroes.of(h.cls, look);
  }

  /**
   * The colour a word in front of ability `i` lays over a ball of light that the ability made, and
   * how strongly: the mirror's shot of a Twin pair teal, Leeching blood red, Volatile flickering,
   * Swift pale green. (An element is not a tint: the ball is painted in its colours.)
   */
  private wordTint(game: Game, i: number, n: number, t: number): [string | null, number] {
    const s = game.hero.skills[i];
    const words = s ? withParts(s.front) : [];
    if (n > 0) return [P.tl5, 0.6];
    if (words.includes('leech')) return [P.bl4, 0.55];
    if (words.includes('volatile')) return [Math.floor(t * 20) % 2 === 0 ? P.white : P.pu5, 0.5];
    if (words.includes('swift')) return [P.gn5, 0.3];
    if (words.includes('poison')) return [P.vn4, 0.4];
    if (words.includes('power')) return [P.fr6, 0.35];
    return [null, 0];
  }

  private monsterArt(m: Monster): ActorArt {
    return this.art.bestiary.of(figureOf(m));
  }

  /**
   * A BOSS NEARING ITS END: what else its death shows that the game paints where it is played, the first time it is shown, put to
   * be painted ahead (dieAhead), as its own death is by the painter (render/painter.ts dieFirst). Found 12 Nov 2026 (the queue's
   * fix-boss-death-stall-and-rime-shade, tools/scenarios/boss_death_stall.mjs): the Fleshmancer's runedust and Meldstone, about a
   * quarter of a second of painting in the second after he died; the Hush at the King's side unwinding into nothing, as much.
   */
  private dieAheadOf(m: Monster): void {
    const lists: (readonly Sprite[])[] = [];
    // (the Fleshmancer: the runedust he leaves and the Meldstone bursting up out of his pit, art/meld_drops.ts: game.ts, his drops)
    const md = this.art.meldDrops;
    if (m.kind === 'fleshmancer' && MELD_DROPS.on && md) {
      const heap = heapOf(MELD_TUNE.fleshmancerDust);
      lists.push(md.spill[heap], md.heap[heap], md.crack, md.stone, md.spinApart, md.spinWhole);
    }
    // (one whose death its art keeps among its moves, the Carrion Queen's fall: where the painter does not paint her, here, as the
    // bestiary's painting ahead knows only a `die`: render/left_to_painter.ts deathOf)
    const f = figureOf(m);
    if (!this.painter?.paints(f) && !this.bakedMobs?.coming(f)) {
      const art = this.art.bestiary.of(f);
      for (const set of heroSides(art)) {
        const death = deathOf(set);
        if (death && death !== set.clips?.die?.frames) lists.push(death);
      }
    }
    // (the King: the Hush at his side, its end as he dies: render/act1_fx/gking.ts)
    if (m.kind === 'gking') {
      const hush = this.art.bestiary.of('gking:2' as MonsterFigure);
      for (const set of [hush.front, hush.back]) lists.push(set.clips?.die?.frames ?? []);
    }
    // (reading a frame is what paints it: art/kit.ts lazyFrames)
    for (const list of lists) for (let i = 0; i < list.length; i++) if (!isPainted(list, i)) this.dieAhead.push(() => list[i]);
  }

  /** (FLOOR 20) How far the picture leans toward the Moth now (screen pixels), gliding there and back. */
  private lean = { x: 0, y: 0 };
  /**
   * (FLOOR 20, THE QUIET TOWER) THE PICTURE LEANS TOWARD THE MOTH while it lives and he is on the top with it: it hovers four
   * knights' height over its floor point, so with the hero in the middle of a phone's screen its body would be off its top. The
   * picture glides toward the middle of the two (MOTH_LEAN.share of the way), never further than MOTH_LEAN.most of the screen.
   */
  private mothLean(game: Game, W: number, H: number, dt: number): { x: number; y: number } {
    const L = game.level;
    const h = game.hero;
    let tx = 0;
    let ty = 0;
    const m = L.land?.tower && onTop(L.land.tower, h.x, h.y) ? game.monsters.find((q) => q.kind === 'moth' && !q.dead && q.state !== 'sleep') : undefined;
    if (m) {
      const up = m.a1?.perched ? MOTH_LEAN.perched : MOTH_LEAN.up;
      tx = Math.max(-W * MOTH_LEAN.most, Math.min(W * MOTH_LEAN.most, ((m.x - m.y - (h.x - h.y)) * 16) * MOTH_LEAN.share));
      ty = Math.max(-H * MOTH_LEAN.most, Math.min(H * MOTH_LEAN.most, ((m.x + m.y - (h.x + h.y)) * 8 - up) * MOTH_LEAN.share));
    }
    // (THE SWAMP COLOSSUS, COLOSSUS on: on his stone the picture leans up toward him in the water, the hero low on the screen but
    // clear of the buttons at its foot: the art chat's camera leans 97 game pixels, on a screen with nothing over its foot)
    const stone = L.land?.stone;
    if (stone && COLOSSUS.on && onStoneOrJetty(worldToStone(stone, h.x, h.y))) {
      ty = -Math.min(COLOSSUS_LEAN, H * 0.24);
      // (as his phase ends and he changes, nothing hurting the hero: the picture turned on him, all of him on the screen, his middle at
      // the water `COLOSSUS_SHOW` of the way down it, as the art chat's stills have him)
      const b = colossusOf(game);
      const f = b ? colossusOn(b).fight : undefined;
      if (f && (f.mode === 'between' || f.mode === 'change')) {
        const at = stoneToWorld(stone, HIS_PLACE.u, HIS_PLACE.v);
        tx = (at.x - at.y - (h.x - h.y)) * 16;
        ty = (at.x + at.y - (h.x + h.y)) * 8 + (0.5 - COLOSSUS_SHOW) * H;
      }
    }
    // (QUESTS610, THE EYRIE'S SCENE: the picture panned out over the drop toward the town far below, and back: game/quests610.ts)
    if (game.scene) {
      const pan = game.scenePan();
      this.lean.x = game.scene.side * Math.min(W * EYRIE_SCENE.share, EYRIE_SCENE.most) * pan;
      this.lean.y = -H * 0.1 * pan;
      return this.lean;
    }
    const k = 1 - Math.exp(-dt * MOTH_LEAN.glide);
    this.lean.x += (tx - this.lean.x) * k;
    this.lean.y += (ty - this.lean.y) * k;
    return this.lean;
  }

  /**
   * The picture of a monster this frame.
   *
   * Its attack is a timeline (art/clip.ts) whose blow lands `hit` seconds in; in the rules the
   * blow lands when the wind-up has run down. The picture is played by the rules' clock
   * (monsterAttackAge in figure.ts), so its blow is the rules' blow, whatever slowed the monster.
   * The Warden's second attack (the volley of bolts) is his `heavy`, with a wind-up of its own.
   */
  private monsterSprite(m: Monster): Sprite {
    // (THE FLOORS' MONSTERS BAKED: one whose baked pictures are still coming (called up in a fight, its files asked for as it
    // was first seen) is shown, for a frame of its not here yet, as the nearest that is, never painted here as it is shown:
    // art/kit.ts LEFT_TO_PAINTER. A list with none here yet paints the one asked for, as ever.)
    // (A FIGURE KEPT PACKED, THE MOTH: likewise, its moves unpacked as they are shown; each picture of it shown told to the
    // painter, render/painter.ts PACKED, which unpacks its move and keeps what is unpacked within its budget)
    const f = figureOf(m);
    const packed = !!this.painter && this.painter.packs(f);
    if (!packed && (!this.bakedMobs || !this.bakedMobs.coming(f))) return this.monsterSpriteNow(m);
    const left = LEFT_TO_PAINTER.on;
    LEFT_TO_PAINTER.on = true;
    const stood = HEAVY.deferred;
    try {
      const s = this.monsterSpriteNow(m);
      if (packed) this.painter!.shown(f, s, HEAVY.deferred !== stood);
      return s;
    } finally {
      LEFT_TO_PAINTER.on = left;
    }
  }
  /**
   * ONE SEEN FROM EIGHT SIDES (floor 18's reflections of the heroes as they look now: art/act1_figs/reflection.ts, art/sides.ts):
   * the side for the way it faces, kept until it has clearly turned out of it (as the hero's figure keeps his: figure.ts
   * eightSide), drawn as painted, never mirrored.
   */
  private sides8 = new WeakMap<Monster, WuSide>();
  private side8Of(m: Monster): WuSide {
    const want = wuFacing(m.fx, m.fy);
    const was = this.sides8.get(m);
    let side = want;
    if (was && was !== want) {
      const a = (Math.atan2(m.fy, m.fx) * 180) / Math.PI;
      const c = WU_SIDES.indexOf(was) * 45;
      const d = Math.abs(((((a - c) % 360) + 540) % 360) - 180);
      if (d <= 22.5 + EIGHT_STICK) side = was;
    }
    this.sides8.set(m, side);
    return side;
  }
  private monsterSpriteNow(m: Monster): Sprite {
    const art = this.monsterArt(m);
    // (one seen from eight sides: the side for the way it faces, never mirrored; every other as ever, its front or back, mirrored to the left)
    const eight = isEight(art) ? art[this.side8Of(m)] : null;
    const faced = eight ?? (m.fx + m.fy < -0.2 ? art.back : art.front);
    const more = faced.clips?.moves;
    const flip = (s: Sprite): Sprite => (!eight && m.fx - m.fy < 0 ? flipSprite(s, true) : s);
    // (ACT 1: one of the descent's own whose picture is its kind's to say now: up in the air, latched on, rising out of the water)
    const a1 = act1Fx(m.kind);
    if (a1 && a1.sprite) {
      const own = a1.sprite(m, art, faced);
      if (own) return flip(own);
    }
    // (THE FIRST FIVE FLOORS: one with a gait and acts of its own is shown by them: figure.ts, gaitFrame)
    if (gaitOf(m.kind)) return flip(gaitFrame(faced, m));
    // (THE NEW MONSTERS: a Boneward whose spear is gone stands and plods with its hand empty, and
    // stoops for its spear when it comes to it)
    const bare = m.bare && more?.standBare && more.walkBare ? more : null;
    // (frozen solid: as it stands)
    if (m.frozenT > 0) return bare ? flip(bare.standBare.frames[0]) : this.actorSprite(art, 'idle', 0, 0, m.fx, m.fy);
    if (m.state === 'pickup' && more?.pickUp) return flip(clipFrame(more.pickUp, SPEAR.stoop - m.t));
    // (FLOOR 3, MORE ACTION: the Boneward behind its shield, a blow glancing off it: its `glance`, art/action_f3_fx.ts)
    if (more?.glance && m.glanceT !== undefined && m.glanceT < more.glance.frames.length / more.glance.fps) return flip(clipFrame(more.glance, m.glanceT));
    // (THE MONSTERS' ATTACKS: a move of its own, with its own picture)
    const moves = movesOf(m);
    if (moves && m.move !== undefined && m.move >= 0 && m.move < moves.length && (m.anim === 'attack' || m.state === 'charge')) {
      const s = moveFrame(m.fx + m.fy < -0.2 ? art.back : art.front, m, moves[m.move]);
      if (s) return m.fx - m.fy < 0 ? flipSprite(s, true) : s;
    }
    if (m.anim === 'attack') {
      const set = m.fx + m.fy < -0.2 ? art.back : art.front;
      const volley = m.boss && m.atk === 1;
      const clip = (volley ? set.clips?.heavy : undefined) ?? set.clips?.attack;
      if (clip && clip.hit !== undefined) {
        const whole = volley ? TUNE.wardenVolleyWindup : MONSTERS[m.kind].windup;
        const s = attackFrame(clip, monsterAttackAge(m.state === 'windup', m.t, whole), whole);
        return m.fx - m.fy < 0 ? flipSprite(s, true) : s;
      }
    }
    if (bare && m.anim !== 'attack') return flip(clipFrame(m.anim === 'walk' ? bare.walkBare : bare.standBare, m.animT));
    return this.actorSprite(art, m.anim, m.animT, m.state === 'windup' ? 0 : m.t > 0.15 ? 1 : 2, m.fx, m.fy);
  }

  /**
   * The picture of a fallen monster at this moment, and whether it has finished falling (it is
   * then its body: the last frame of its death). Null if its figure has no death painted: such a
   * one only bursts into its colours, as they all did until deaths were painted.
   */
  private fallenSprite(f: Fallen): { sp: Sprite; lying: boolean; since: number } | null {
    const art = this.art.bestiary.of(f.figure);
    // (one seen from eight sides: its fall from the side for the way it faced, never mirrored)
    const eight = isEight(art) && f.fx !== undefined && f.fy !== undefined ? art[wuFacing(f.fx, f.fy)] : null;
    const clip = (eight ?? (f.back ? art.back : art.front)).clips?.die;
    if (!clip || clip.frames.length === 0) return null;
    const last = clip.frames.length - 1;
    const i = Math.floor(f.t * clip.fps);
    // (a frame of its fall not painted yet, the painter painting it: the nearest of the fall that is shown meanwhile, never
    // painted here as it is shown: art/kit.ts LEFT_TO_PAINTER. Where the painter is not painting it, as before.)
    const left = LEFT_TO_PAINTER.on;
    if (this.painter?.paints(f.figure) || this.bakedMobs?.coming(f.figure)) LEFT_TO_PAINTER.on = true;
    let sp: Sprite;
    const stood = HEAVY.deferred;
    try {
      sp = clip.frames[Math.min(last, i)];
    } finally {
      LEFT_TO_PAINTER.on = left;
    }
    // (A FIGURE KEPT PACKED, THE MOTH: its fall unpacked as it is shown, as its moves are: render/painter.ts PACKED)
    if (this.painter?.packs(f.figure)) this.painter.shown(f.figure, sp, HEAVY.deferred !== stood);
    // (`since`: how long it has lain, in seconds)
    return { sp: f.flip && !eight ? flipSprite(sp, true) : sp, lying: i >= last, since: f.t - last / clip.fps };
  }

  /**
   * `pace` is how much game time this frame stands for, in sixtieths of a second: 1 on an ordinary
   * frame, 0 while paused, less in slow motion, 2 on a slow machine. Whatever is thrown into the
   * air every frame (flames off burning ground, snow, sparks) is thrown at that rate, so the game
   * looks the same on a fast screen and a slow one. It also thins out when the air is full.
   */
  /**
   * (THE LOADING SCREEN, main.ts LOADING) the level's own pictures made ahead, nothing drawn: its look's (the castle hall's, the
   * Headsman's yard's, a floor's), and its ways' (the stairwell, the waypoint), while the hero's baked pictures come in.
   */
  prepare(game: Game): void {
    const L = game.level;
    if (this.yard.on(L.floor)) this.yard.warm();
    this.lookOf(L)?.warm();
    if (L.ways) this.waysOf(L);
  }

  /**
   * (THE LOADING SCREEN'S WORK IN SLICES, main.ts LOAD_SLICE) What `prepare` makes, as steps; and, ahead, what the world's first
   * drawing would make the first time it is drawn: the effects' lists its draws ask for every frame, whoever the hero
   * (render/fx_lists.ts), a frame a step; Act 1's and the Hush's and the High City's pieces of the floor, a list a step
   * (render/act1_pieces.ts); the shaft's head standing still; the castle hall's stairs, gate, tiles and faces (render/castle.ts).
   * Each is made by the same code and kept, so the drawing finds it made. What is left is made as the world is first drawn under
   * the loading screen, the open ground's pieces asked of the ground's worker meanwhile (`asking`, groundComing).
   */
  prepareSteps(game: Game): LoadStep[] {
    const L = game.level;
    const out: LoadStep[] = [];
    if (this.yard.on(L.floor)) out.push(() => this.yard.warm());
    const look = this.lookOf(L);
    if (look) out.push(() => look.warm());
    // (and what its first drawing makes the first time, where it has steps of its own: render/looks.ts `steps`)
    if (look?.steps) out.push(() => look.steps!(L));
    if (L.ways) {
      // (the floors' own ways, a part a step: art/floors.ts lookWaySteps; the camp's, the rim's and the hall's are their own)
      if (!isCamp(L) && !this.rim.on(L) && !this.castle.on(L)) {
        const k = L.town ? 1 : Math.max(1, floorLook(L.floor.depth));
        out.push(() => lookWaySteps(k));
      }
      // (the hall's and the camp's stairs are floor 1's, a way a step; the hall's waypoint is the hall's own: render/castle.ts steps)
      if (isCamp(L) || this.castle.on(L)) out.push(() => lookStairSteps(1));
      out.push(() => void this.waysOf(L));
      if (L.ways.shaft) out.push(() => void shaftStill());
    }
    out.push(...tinkererFxSteps(), ...warlockFxSteps());
    // (the open ground's terrain ahead of the first drawing, its grids a few rows a stage: render/outdoor.ts aheadSteps; floor 13's
    // took 1.3 s in that drawing)
    if (L.land) {
      const land = L.land;
      out.push(() => this.outdoor.aheadSteps(land, L.floor));
    }
    if (L.act1) {
      const n = L.act1.floor;
      out.push(() => act1PieceSteps(n));
    }
    if (this.castle.on(L)) out.push(() => this.castle.drawSteps(L));
    return out;
  }
  /** (main.ts LOAD_SLICE) Whether the open ground's pieces the screen shows are still to come from the ground's worker, as the world was last drawn. */
  groundComing(): boolean {
    return this.openGround && this.outdoor.missing > 0;
  }
  /** (main.ts LOAD_SLICE) While on, the world is drawn under the loading screen: the open ground's pieces asked of its worker, not painted at once (render/outdoor.ts `asking`). */
  set underLoading(on: boolean) {
    this.outdoor.asking = on;
  }

  draw(g: CanvasRenderingContext2D, W: number, H: number, game: Game, fx: Fx, t: number, pace = 1): Cam {
    // (heavy frames not yet painted are shown as their nearest painted ones, for the side painter to paint: art/kit.ts HEAVY)
    HEAVY.defer = PAINT_DEFER.on;
    // (the silhouettes and big mirror images pushed out of their budgets a moment ago, given back: engine/px.ts RETIRE_MS)
    reapRetired();
    try {
      return this.drawWorld(g, W, H, game, fx, t, pace);
    } finally {
      HEAVY.defer = false;
    }
  }

  private drawWorld(g: CanvasRenderingContext2D, W: number, H: number, game: Game, fx: Fx, t: number, pace = 1): Cam {
    this.townSounds.length = 0;
    // (the hero as he was last drawn, before this frame: THE WARLOCK's Phantom Step leaves him so as his shadow)
    this.heroBefore = this.heroWas;
    this.bossFx.begin();
    // (THE FIRST FIVE FLOORS: this level's own pieces, and a step of its moments)
    this.dressed = this.pieces.begin(game);
    // (THE HEADSMAN'S YARD: its pictures made as the floor is come into)
    if (this.yard.on(game.level.floor)) this.yard.warm();
    // (FLOOR 3, THE BLACK IRON PRISON: likewise)
    this.lookOf(game.level)?.warm();
    if (this.dressed) this.pieces.step(game);
    const live = pace > 0;
    const amb = pace * fx.room();
    const L = game.level;
    const f = L.floor;
    const h = game.hero;
    // (ACT 1: inside a stronghold's hall the floor and walls are the redoubt's stone: art/redoubt.ts)
    const inHall = !!L.land && L.land.holds.some((q) => inHold(q, h.x, h.y));
    const art = inHall ? { ...this.art, ground: redoubtGround() } : this.art;
    // (magic with no element word on it is violet, where a blade's blow is steel: a mage's, and
    // anyone's who carries a staff or a wand)
    const held = game.weapon();
    const arcane = h.cls === 'mage' || (!OWN_MOVES.on && (held === 'staff' || held === 'wand'));
    fx.arcane = arcane;
    // (THE WARLOCK's effects read the burning and the cursed off the monsters: render/warlock_fx.ts)
    fx.warlock.game = game;
    fx.brawler.game = game;
    // (WHAT THE UNIQUE ITEMS SHOW IN PLAY, the art chat's, each behind a switch that is off: render/unique_fx.ts)
    fx.uniques.game = game;
    fx.melds8.game = game;
    fx.uniques.bestiary = this.art.bestiary;
    // (THE VETERAN, behind a switch that is off: his moves' effects and his globes, render/veteran_fx.ts)
    this.vetFx.step(game, fx, pace / 60);
    // (THE NEW WORDS, a mock-up behind a switch that is off: render/words3.ts)
    if (WORDS3.on) tick3(pace / 60, game, fx);
    // (WORDMELDING's looks, behind a switch that is off: render/melds3.ts)
    if (MELD3.on) tickM3(pace / 60, game, fx);
    // (BINDING's looks, behind a switch that is off: render/binding3.ts)
    if (BINDING3.on) tickB3(pace / 60, game, fx);
    // (THE FIVE VOLATILE MELDS' looks, behind a switch that is off: render/volatile3.ts)
    if (VOLATILE3.on) tickV3(pace / 60, game, fx);
    // (THE SEVEN NEW WORDS' LOOKS, behind a switch that is off: render/words7.ts)
    if (WORDS7_LOOK.on) tickW7(pace / 60, game, fx);
    // (HIS THREE NEW WORDS' LOOKS, behind a switch that is off: render/words10.ts)
    if (WORDS10_LOOK.on) tickW10(pace / 60, game, fx);
    const cam = this.cam;
    // Where on the screen the hero stands: the middle, or the middle of the part left to the world.
    // The picture glides from the one to the other, by the wall clock (the world may be standing
    // still under a panel), and sits exactly on the middle whenever nothing covers the screen.
    const wantX = this.view ? this.view.x : W / 2;
    const wantY = this.view ? this.view.y : H / 2;
    let va = this.viewAt;
    if (!va || va.w !== W || va.h !== H) va = this.viewAt = { x: wantX, y: wantY, w: W, h: H, t };
    const vdt = Math.max(0, Math.min(0.05, t - va.t));
    va.t = t;
    const glide = 1 - Math.exp(-vdt * 18);
    va.x = Math.abs(wantX - va.x) < 0.5 ? wantX : va.x + (wantX - va.x) * glide;
    va.y = Math.abs(wantY - va.y) < 0.5 ? wantY : va.y + (wantY - va.y) * glide;
    // (LEDGES AND STAIRS: on a level that has them the ground lifts what stands on it, and the
    // picture follows the hero up: `relief` is null on every other level, and nothing changes)
    const relief = this.reliefOf(L);
    cam.lift = relief ? relief.lift : null;
    const heroLift = this.heroLift(game);
    // (FLOOR 20, THE MOTH: the picture leans toward it, so that its body, high over the top, is in sight with him: mothLean)
    const lean = this.mothLean(game, W, H, vdt);
    cam.ox = Math.round(va.x - (h.x - h.y) * 16 - lean.x) + fx.shakeX;
    cam.oy = Math.round(va.y + 12 - (h.x + h.y) * 8 + heroLift - lean.y) + fx.shakeY;
    const stands = this.stands;
    stands.length = 0;
    this.labels.length = 0;
    this.marks.length = 0;
    this.monsterLit.length = 0;
    this.propLit.length = 0;
    this.overLit.length = 0;
    const lowGrid = this.lowWalls(L);
    this.lowNow = lowGrid;
    // (THE WALLS' LOOK: where the hero is on the screen, for the walls that are seen through while they stand over them)
    this.wallHero = { x: wx(cam, h.x, h.y), y: wy(cam, h.x, h.y), d: h.x + h.y, hx: h.x, hy: h.y };

    g.fillStyle = P.black;
    g.fillRect(0, 0, W, H);

    // ---- ACT 1, THE DESCENT: the open ground, painted in pieces, under everything (render/outdoor.ts) ----
    // (inside a stronghold's hall the screen is a dungeon's room in the dark: its tiles and walls as any dungeon's, in the redoubt's stone)
    const land = L.land;
    const hallNow = land ? land.holds.find((q) => inHold(q, h.x, h.y)) ?? null : null;
    this.openGround = !!land && !hallNow;
    this.act1Dressed = this.act1.begin(L);
    // (ACT 2, THE HUSH: a step of its floor's moment around the hero: render/act1_pieces.ts)
    if (this.act1Dressed) this.act1.stepMoments(game, this.painter);
    if (land && !hallNow) {
      const fresh = this.outdoor.begin(land, f);
      // (FLOW: the rivers' water moves with the game's own time, paused and slowed with it)
      this.outdoor.flowT = game.time;
      this.outdoor.draw(g, cam, W, H, fresh);
      if (this.act1Dressed) this.act1.floorTiles(g, this.floorAt, W, H);
    }
    // (ACT 2, THE GATE WARD: its houses' shells asked for once a floor, or painted here where there is no worker)
    this.houses.begin(land && !hallNow ? land : null, f, land ? () => gateWardLand(land, f, wallsThick(land) > 0) : null, this.outdoor.terrain(), t, [h.x, h.y]);
    // (ACT2_WALLS on: the houses on the screen whole at once, their shells painted here when the worker has not sent them)
    if (land && !hallNow) this.houses.ensure(() => gateWardLand(land, f, true), this.outdoor.terrain(), cam.ox, cam.oy, W, H, t);

    // ---- THE HEADSMAN'S YARD (render/yard.ts): the sky and the tower over its far walls, while the hero is in it ----
    const yardOn = this.yard.on(f);
    const yardOut = yardOn && this.yard.heroIn(f, h.x, h.y);
    // ---- FLOOR 3, THE BLACK IRON PRISON (render/prison.ts): its flags, its own tiles and his hall's floor; its walls ----
    const look = this.lookOf(L);
    this.lookNow = look;
    if (this.lookedFor !== L) this.forgetLooks(L, look);
    this.wholeNow = this.wholeHere(L);
    this.gameNow = game;
    this.clockNow = t;
    // (HER TREE'S GUN ARM: each Golem charging, as its picture will be drawn, for the art chat's steam and light round it: render/tinkerer_fx.ts)
    fx.tinkerer.charging = game.golems.length ? this.golemsCharging(game) : [];
    // (HER GOLEM'S ROCKET JUMP, behind GOLEM_ROCKET: each Golem in it, for what is laid on the floor under it; and, her Golem out, its
    // frames painted ahead a little each frame, so that none is painted as it is shown)
    fx.tinkerer.rocketing = GOLEM_ROCKET.on && game.golems.length ? this.golemsRocketing(game) : [];
    fx.tinkerer.rocketGun = GOLEM_ROCKET.on && game.golems.length ? (game.armOf() === 'tesla' ? 'tesla' : 'cannon') : null;
    const prisonOn = look === this.prison;
    this.yardOnly = yardOut ? f : null;
    if (yardOut) this.yard.back(g, cam, f, W, H);
    // (FLOOR 2, THE PRISON'S GROUNDS: under the sky in a courtyard, the night sky and the tower over its far walls: render/grounds.ts)
    const groundsSky = look === this.grounds ? this.grounds.skyOver(L, h.x, h.y, yardOut) : null;
    this.groundsOnly = groundsSky ? L : null;
    if (groundsSky) this.grounds.drawSky(g, cam, W, H);
    // (A PLACE'S FLOOR AS ONE PICTURE, render/still_floor.ts: where the look says the place is steady, the ground is flat and none
    // of the game's other floors is laid here, what is behind everything and every tile of the floor with the walls' shade on it
    // are one picture, laid as below and as the floor's own loop lays them; it is made again if any of what it hangs on is another)
    const lowAll = lowGrid;
    const asOneFloor =
      !!look && look.steady === true && !relief && !f.cut && !this.openGround && !land && !inHall && !yardOn && !groundsSky && !this.dressed &&
      this.stillFloor.draw(g, cam, W, H, P.black, [L, look, this.art.ground, lowAll, WALL_LOOK.away, WALL_LOOK.front, this.floorSig(L)], (c, at) => this.layFloor(c, at, L, t, look, this.art.ground, lowAll));
    // (THE FIRST TOWN AS THE CASTLE'S HALL: the castle's stone above its walls and its roof, behind everything: render/castle.ts)
    // (THE SHAFT'S RIM: its dark rock going on past the edges of its ground's picture: render/rim.ts)
    if (look?.behind && !asOneFloor) look.behind(g, cam.ox, cam.oy, W, H);
    if (look?.back && !asOneFloor) {
      for (const q of look.back(L, t)) {
        const sx = Math.round(wx(cam, q.x, q.y));
        const sy = Math.round(wy(cam, q.x, q.y));
        if (sx - q.s.ax > W || sx - q.s.ax + q.s.w < 0 || sy - q.s.ay > H || sy - q.s.ay + q.s.h < 0) continue;
        g.drawImage(q.s.img, sx - q.s.ax, sy - q.s.ay, q.s.w, q.s.h);
      }
    }

    // ---- floor, and collect walls -------------------------------------------------------------
    this.pitTiles.length = 0;
    this.raisedTiles.length = 0;
    const dmin = Math.floor(-cam.ox / 16) - 2;
    const dmax = Math.ceil((W - cam.ox) / 16) + 2;
    const smin = Math.floor(-cam.oy / 8) - 3;
    const smax = Math.ceil((H - cam.oy + Math.max(WALL_H, WALL_LOOK.tall)) / 8) + 2;
    // (sunken floor first, and what lies on it: the room's own floor is drawn over its near edge)
    const sunk = relief !== null && relief.low < 0 ? f.height : undefined;
    if (relief && sunk) {
      this.drawSunken(g, relief, L, dmin, dmax, smin - 2, smax);
      this.flat(g, W, H, game, fx, t, amb, 2);
    }
    for (let s = smin; s <= smax && !this.openGround; s++) {
      for (let df = dmin; df <= dmax; df++) {
        if ((s + df) & 1) continue;
        const tx = (s + df) >> 1;
        const ty = (s - df) >> 1;
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
        // (ACT 1: in a stronghold's hall, only the hall's own tiles and its walls)
        if (hallNow && !holdShows(hallNow, tx, ty)) continue;
        // (THE HEADSMAN'S YARD: from in it, only it, its walls and its way in: behind its far walls, the sky)
        if (yardOut && !this.yard.shows(f, tx, ty)) continue;
        if (groundsSky && !this.grounds.shows(L, tx, ty)) continue;
        const idx = ty * f.w + tx;
        if (!L.explored[idx]) continue;
        const kind = f.tiles[idx];
        const v = f.variant[idx];
        const px = cam.ox + df * 16;
        const py = cam.oy + s * 8;
        // (TRIANGLES: a tile cut corner to corner)
        if (f.cut && f.cut[idx] !== 0 && (kind === T_FLOOR || kind === T_WALL)) {
          // (how far it is lifted: a half tile of floor on a terrace, with the terrace; the back of
          // a slanting wall, as far as the raised floor at its foot: as any wall)
          const up = !relief ? 0 : kind === T_FLOOR ? Math.max(0, relief.top[idx]) : this.wallLift(relief, tx, ty);
          if (kind === T_FLOOR && up > 0) this.raisedTiles.push(idx, px, py);
          this.cutTile(g, f, idx, tx, ty, px, py, s, f.cut[idx], kind === T_FLOOR, up);
          continue;
        }
        if (kind === T_FLOOR) {
          // (raised floor and stairs are drawn after what lies on the low floor: see drawRelief)
          if (relief && relief.top[idx] > 0) {
            this.raisedTiles.push(idx, px, py);
            continue;
          }
          if (sunk && sunk[idx] < 0) continue;
          // (the flagstones are laid on the world, not on the tiles: a tile's picture goes by where it is)
          // (THE FIRST FIVE FLOORS: or one of the floor's own tiles laid there: render/pieces.ts)
          // (THE HEADSMAN'S YARD: its cobbles and its own tiles: render/yard.ts)
          // (FLOOR 3, THE BLACK IRON PRISON: his hall's floor and its own tiles, then the floor's own, on its dark flags: render/prison.ts)
          // (A PLACE'S FLOOR AS ONE PICTURE, render/still_floor.ts: its tiles are in that picture, drawn before this)
          if (!asOneFloor) this.floorTile(g, L, idx, tx, ty, px, py, t, look, art.ground, lowGrid, yardOn);
          if (relief) this.lowEdges(g, relief, idx, tx, ty, px, py);
          if (relief && sunk) this.rimFaces(g, relief, idx, tx, ty, px, py);
        } else if (relief && kind === T_PIT) {
          this.pitTiles.push(idx, px, py);
        } else if (kind === T_WALL) {
          // (in town three tiles of the back wall are the gate: each carries its part of the arch, and the light in it moves)
          const part = L.town && ty === TOWN.gateWall.y ? tx - TOWN.gateWall.x : -1;
          // (THE CRYPT, a mock-up behind CRYPT: a town with a gate of the levels' in its wall has no field of light there)
          // (THE WAYS, game/ways.ts: nor one whose gate is the way to the first floor)
          if (part >= 0 && part < TOWN.gateWall.n && !(CRYPT.on && L.doors.length > 0) && !L.ways) {
            const sp = art.ground.gate[Math.floor(t * 6) % art.ground.gate.length][part];
            this.stand(s + 1, sp, px, py);
            if (sp.lights) this.propLit.push({ s: sp, x: Math.round(px), y: Math.round(py) });
          } else if (WALL_LOOK.faces && !lowGrid[idx]) {
            // (THE WALLS' LOOK, `faces`: a wall is the upright planes behind the far edges of floor.
            // Which of a block's two faces have floor before them: render/walls.ts, `wallFaces`.)
            // (FLOOR 3, PRISON_EXIT: none on the door out the back of his hall once its pictures are made, or once it is open: render/dress.ts stands it there)
            // (THE FIRST FIVE FLOORS' NEW LOOKS: none where a picture of the look's own stands in the wall: render/looks.ts)
            // (WHOLE_WALLS: every wall stands, its faces turned to the eye drawn whatever is before them: render/walls.ts)
            const whole = this.wholeHere(L);
            const faces0 = whole ? wholeFaces(f, idx) : wallFaces(f, idx);
            let which = look ? look.unfaced(L, idx, faces0) : faces0;
            if (prisonOn && L.ways?.exit && this.dress.exitShown(game)) which = this.prison.doorUnfaced(L, idx, which);
            const n = art.ground.faceLeft.length;
            // (THE WALL BESIDE A DOOR: one that stands again there is seen through while someone is behind it, and nothing is set in it)
            const again = this.doorBack !== null && this.doorBack[idx] === 1;
            const veil = whole && which ? this.wallVeil(game, idx, px, py, s + 1, t) : again && which ? this.doorVeil(game, idx, px, py, s + 1, t) : 1;
            // (`hide` marks the stand just made: raised floor at a face's foot hides the foot of it)
            // (THE HEADSMAN'S YARD: the ring of wall round it is the prison's wall: render/yard.ts)
            const prison = yardOn && this.yard.ring(f, tx, ty);
            if (which & FACE_LEFT) {
              this.stand(s + 1, prison ? this.yard.face(true, v) : look ? look.face(L, true, tx, ty, t) : art.ground.faceLeft[v % n], px, py, null, 0, 1, veil);
              if (relief) this.hide(tx + 0.5, ty + 0.5, 0);
            }
            if (which & FACE_RIGHT) {
              this.stand(s + 1, prison ? this.yard.face(false, v) : look ? look.face(L, false, tx, ty, t) : art.ground.faceRight[v % n], px, py, null, 0, 1, veil);
              if (relief) this.hide(tx + 0.5, ty + 0.5, 0);
            }
            // (THE FIRST FIVE FLOORS: what is set in its faces: render/pieces.ts)
            if (which && this.dressed && !again) this.pieces.wall(game, idx, which, s, px, py, t, this.stage, veil);
            // (FLOOR 3, THE BLACK IRON PRISON: the fire baskets it adds, stood in the faces as the floor's own are)
            if (which && look?.walls && !again) {
              look.walls(L, idx, which, t, (sp, side) => {
                const bx = side === 0 ? px - 8 : px + 8;
                this.stage.stand(s + 1.01, sp, bx, py + 12, veil);
                if (sp.lights) this.stage.lit(sp, bx, py + 12);
              });
            }
          } else if (!(lowGrid[idx] && WALL_LOOK.front === 'none')) {
            const sp = lowGrid[idx] ? art.ground.wallsLow[v % art.ground.wallsLow.length] : art.ground.wallsTall[v % art.ground.wallsTall.length];
            const thin = !lowGrid[idx] && this.overHero(px, py, s + 1, WALL_LOOK.tall) ? SEEN_THROUGH : 1;
            this.stand(s + 1, sp, px, py, null, 0, 1, thin);
            if (relief) {
              // (raised floor at its foot hides the foot of it; and it is built up that much higher,
              // so that a wall behind a terrace stands as tall over the terrace as over the floor.
              // THE WALLS' LOOK: with one top line it is not built up, and the floor rises against it.)
              this.hide(tx + 0.5, ty + 0.5, 0);
              const up = this.wallLift(relief, tx, ty);
              if (up > 0 && !WALL_LOOK.level) this.stand(s + 1.001, sp, px, py - up);
            }
          }
        }
      }
    }

    // ---- what lies on the floor ----------------------------------------------------------------
    // (THE HEADSMAN'S YARD: its wide puddles, flat on its cobbles)
    if (yardOn) {
      for (const q of this.yard.puddles(f, cam)) {
        if (q.x < -80 || q.x > W + 80 || q.y < -40 || q.y > H + 40) continue;
        g.drawImage(q.s.img, q.x - q.s.ax, q.y - q.s.ay, q.s.w, q.s.h);
      }
    }
    // (on a level with ledges: what lies on the low floor, then the pits and the raised floor
    // over whatever of that reaches under them, then what lies on the raised floor)
    if (!relief) this.flat(g, W, H, game, fx, t, amb, -1);
    else {
      this.flat(g, W, H, game, fx, t, amb, 0);
      this.drawRelief(g, relief);
      this.flat(g, W, H, game, fx, t, amb, 1);
    }

    // ---- everything that stands up ------------------------------------------------------------
    // A thing big enough to hide the hero is SEEN THROUGH while they are behind it. (Version 14.5:
    // the bazaar's tent stands on the grid, and its roof, high and wide, lies on the screen over
    // two tiles and more of the floor behind it. A hero who walked there was lost.) Only what is
    // both wide and tall: a pillar or a standing stone hides a part of the hero for a step, and
    // is the more solid for it.
    const heroX = wx(cam, h.x, h.y);
    const heroY = wy(cam, h.x, h.y);
    // (ACT 1: who may be behind a tall thing this frame: the hero, and the monsters he sees)
    this.heroD = h.x + h.y;
    this.heroFeet.x = heroX;
    this.heroFeet.y = heroY;
    this.seenFoes.length = 0;
    if (this.openGround) for (const m of game.monsters) if (m.seen && !m.dead) this.seenFoes.push({ x: wx(cam, m.x, m.y), y: wy(cam, m.x, m.y), d: m.x + m.y });
    // (on a level with ledges: the thing just stood up is hidden by raised ground in front of it)
    const hid = relief ? (x: number, y: number): void => this.hide(x, y, relief.lift(x, y)) : null;
    const veil = (sp: Sprite, sx: number, sy: number, depth: number): number => {
      if (sp.w < 60 || sp.h < 70 || h.x + h.y >= depth) return 1;
      const lx = heroX - (sx - sp.ax);
      const ly = heroY - (sy - sp.ay);
      // (the hero's middle, their head, and their feet)
      return spriteCovers(sp, lx, ly - 14) || spriteCovers(sp, lx, ly - 28) || spriteCovers(sp, lx, ly - 3) ? SEEN_THROUGH : 1;
    };
    // (ACT 1, THE DESCENT: what stands on the tops of the cliffs, in the forest and in the water: render/act1_pieces.ts)
    if (this.act1Dressed && this.openGround) this.standTops(W, H, heroX, heroY, L);
    else {
      // (the forest's pictures let go of once it is left)
      this.frameChunks.length = 0;
      this.topsCache.leave(L);
    }
    // (THE HEADSMAN'S YARD: the torches on its far walls, burning: render/yard.ts)
    if (yardOn) {
      for (const q of this.yard.torches(f)) {
        if (!L.explored[Math.floor(q.y) * f.w + Math.floor(q.x)]) continue;
        const ts = this.yard.torch(q.alongX, t);
        const tx = wx(cam, q.x, q.y);
        const ty = wyFlat(cam, q.x, q.y);
        this.stand(q.x + q.y - 0.49, ts, tx, ty);
        if (ts.lights) this.propLit.push({ s: ts, x: Math.round(tx), y: Math.round(ty) });
      }
    }
    this.folkHeads.clear();
    for (const p of L.props) {
      if (!L.explored[p.ty * f.w + p.tx] && !this.openGround) continue;
      // (THE HEADSMAN'S YARD: its scaffold and its gallows, in strips each in its place; what stands on their other tiles is nothing to see)
      if (yardOut && !this.yard.shows(f, p.tx, p.ty)) continue;
      if (groundsSky && !this.grounds.shows(L, p.tx, p.ty)) continue;
      const big = yardOn && p.kind === 'piece' ? this.yard.owns(p.name) : null;
      if (big === 'foot') continue;
      if (big === 'piece') {
        // (seen through only where the hero is behind it and it covers him: his middle, his head or his feet)
        const whole = this.yard.bigSprite(p.name!);
        const ax = wx(cam, p.x, p.y);
        const ay = wyFlat(cam, p.x, p.y);
        const covers = !!whole && this.yard.behind(p.name!, p.x, p.y, h.x, h.y) && [14, 28, 3].some((up) => spriteCovers(whole, heroX - (ax - whole.ax), heroY - up - (ay - whole.ay)));
        for (const st of this.yard.bigStands(p.name!, p.x, p.y, cam, covers ? SEEN_THROUGH : 1)) this.stand(st.d, st.s, st.x, st.y, null, 0, 1, st.alpha);
        continue;
      }
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y);
      if (sx < -140 || sx > W + 140 || sy < -30 || sy > H + 200) continue;
      let sp: Sprite | null = null;
      // (ACT 1, THE DESCENT: the floor's own pieces that stand, and its breakables whole; the tall seen through while someone is behind them)
      if (this.act1Dressed && (p.kind === 'piece' || p.kind === 'barrel' || p.kind === 'urn')) {
        if (this.act1.lies(p) || p.state === 1 && p.kind !== 'piece') continue;
        // (ACT 2, THE GATE WARD: a trap of its own by its beat; nothing in a house standing whole gives light out of it)
        // (ACT 2, THE HUSH: a trap that stands goes by the game's clock, its trap's; a piece the art drew its own picture for
        // being seen through, the Millrace's drying lines, shows that picture whole while someone is behind it: render/act1_pieces.ts)
        const a = trapSprite(L, p, game.time, (n) => this.act1.piece(n)) ?? this.act1.sprite(p, t, game.time);
        if (a) {
          const thin = a.h >= SEE_TALL ? this.seeThrough(a, sx, sy, p.x + p.y, heroX, heroY, h.x + h.y) : veil(a, sx, sy, p.x + p.y);
          const seen = thin < 1 ? this.act1.seenOf(p) : null;
          this.stand(p.x + p.y, seen ?? a, sx, sy, null, 0, 1, seen ? 1 : thin);
          if (a.lights && !this.houses.hides(p.x, p.y)) this.propLit.push({ s: a, x: Math.round(sx), y: Math.round(sy) });
        }
        continue;
      }
      // (THE FIRST FIVE FLOORS: the floor's own pieces, and its own of the game's things: render/pieces.ts)
      // (QUESTS15: the forge crank in the Stoker's arena, his art's)
      const crank = L.furnace && p === L.furnace.crank ? this.crankSprite(game) : null;
      // (THE SHAFT'S RIM: the wordsmith's slab with the tablet's socket, the look's own picture of it: render/rim.ts)
      const ownHere = crank ?? (this.dressed ? this.pieces.standing(game, p, t) : undefined);
      const own = ownHere !== undefined ? ownHere : this.lookNow?.own ? this.lookNow.own(L, p, t) : undefined;
      if (own !== undefined) sp = own;
      else switch (p.kind) {
        case 'brazier': sp = art.props.brazier[(Math.floor(t * 8) + p.variant) % 4]; break;
        case 'chest': sp = p.state === 1 ? art.props.chestOpen : art.props.chest; break;
        case 'barrel': sp = p.state === 0 ? art.props.barrel : null; break;
        case 'urn': sp = p.state === 0 ? art.props.urn : null; break;
        case 'pillar': sp = art.props.pillar; break;
        // (THE MIX: a lever, as it stands or pulled)
        case 'lever': sp = art.gates.lever(p.state === 1); break;
        case 'portal': sp = p.state === 1 ? art.props.portal[Math.floor(t * 7) % 4] : art.props.portalOff; break;
        // (the town's own things and its people: art/townscene.ts says which picture each shows)
        default:
          if (L.town && isTownsperson(p.kind)) {
            // (one of the town's people: turned to the hero if the hero has come right up to them)
            const to = turnedTo(p.x, p.y, game.hero.x, game.hero.y, this.folkTurn.get(p.kind) ?? null);
            this.folkTurn.set(p.kind, to);
            sp = townSprite(art, p.kind, p.variant, t, to);
            // (THE WORLD'S SOUNDS: what each does now and then heard as it begins: the anvil, the crystal, the rune, the coin)
            if (WORLD_SOUNDS.on) this.folkSound(art, p.kind, p.x, p.y, t);
            // (QUEST MARKERS: where the top of their head is, this frame)
            if (sp) this.folkHeads.set(p.kind, { x: sx, y: sy - sp.ay });
          } else sp = L.town && !isTownFlat(p.kind) ? townSprite(art, p.kind, p.variant, t) : null;
          break;
      }
      if (sp) {
        this.stand(p.x + p.y, sp, sx, sy, null, 0, 1, veil(sp, sx, sy, p.x + p.y));
        hid?.(p.x, p.y);
        if (sp.lights) this.propLit.push({ s: sp, x: Math.round(sx), y: Math.round(sy) });
      }
    }
    // (THE CAMP, game/camp.ts: its three people by the fire, talking in turn, as the art chat painted them: art/hub2_folk.ts)
    if (isCamp(L)) {
      for (const f of campFolk()) {
        const k = Math.floor((t + (f.who === 'goodwife' ? 0.4 : f.who === 'baker' ? 0.8 : 0)) * TALK_FPS) % TALK_FRAMES;
        const key = `${f.who}:${f.view}:${f.flip ? 1 : 0}:${k}`;
        let sp = this.folkFrames.get(key);
        if (!sp) {
          const base = campFolkFrame(f.who, k / TALK_FPS, f.view);
          sp = f.flip ? flipSprite(base) : base;
          this.folkFrames.set(key, sp);
        }
        const sx = wx(cam, f.x, f.y);
        const sy = wy(cam, f.x, f.y);
        this.stand(f.x + f.y + 0.02, sp, sx, sy, null, 0, 1, veil(sp, sx, sy, f.x + f.y));
      }
    } else if (this.folkFrames.size) this.folkFrames.clear();
    // (THE WORDSMITH'S RING MADE NEW, art/ring3.ts, behind art/smith3.ts SMITH3: the letters of light
    // that swirl round, each stood among everything else, and the column of light over the slab)
    if (L.town && SMITH3.on && art.town.ring3) this.standRing3(game, cam, t);
    if (!L.town && QUEST3.on) this.standQuestStone(game, cam, t);
    this.standHazards(game, cam);
    this.standDoors(L, cam, game, fx);
    if (CRYPT.on && CRYPT.marks.level === L) this.standCrypt(L, t);
    if (L.ways) this.standWays(L, t, game.time, game);
    if (L.ways) this.dress.standing(game, this.stage);
    // (THE FIRST FIVE FLOORS' NEW LOOKS: what each stands of its own: the prison's railings along its fire channels and the great
    // chains in his hall; the chapel's way in and break-ins: render/looks.ts)
    if (this.lookNow) {
      for (const q of this.lookNow.stands(L, t)) {
        if (!L.explored[Math.floor(q.y) * L.floor.w + Math.floor(q.x)]) continue;
        const sx = Math.round(wx(cam, q.x, q.y));
        const sy = Math.round(wy(cam, q.x, q.y));
        if (sx < -160 || sx > W + 160 || sy < -40 || sy > H + 260) continue;
        const d = q.d ?? q.x + q.y;
        if (q.add) this.stand(d, q.s, sx, sy, null, 0, 1, q.alpha ?? 1, null, 0, true);
        else this.stage.stand(d, q.s, sx, sy, (q.alpha ?? 1) * this.stage.veil(q.s, sx, sy, d));
        if (q.s.lights) this.stage.lit(q.s, sx, sy);
      }
    }
    if (this.dressed) this.pieces.standMoments(game, this.stage);
    // (ACT 2, THE HUSH: its floor's moment around the hero, in depth at its anchor or over every figure, the surge shown over its
    // channel's run alone; its candles' light, and the chandelier drawn again over that light while it hangs and falls, as the
    // Meldstone is, so that its own eighteen flames do not wash it out (the wreck's two left burning do not): render/act1_pieces.ts)
    // (F8F9_FIX, off: the Pinewood's footbridges' rails, in depth: render/act1_pieces.ts)
    if (this.act1Dressed && this.openGround) this.act1.standBridges(cam, W, H, (d, s, x, y) => this.stand(d, s, x, y));
    if (this.act1Dressed) {
      this.act1.standMoments(game, this.painter, cam, W, H, (d, s, x, y, columns) => {
        if (columns) this.stands.push({ d, q: this.stands.length, s, x, y, over: null, overA: 0, scale: 1, alpha: 1, figure: null, phase: 0, clip0: columns[0], clip1: columns[1] });
        else this.stand(d, s, x, y);
        if (s.lights) {
          this.propLit.push({ s, x, y });
          if (s.lights.length > 4) this.overLit.push({ d, s, x, y, scale: 1 });
        }
      });
    }
    // the town's services carry their names, so a newcomer can see what is where
    for (const st of L.stations) {
      const lift = st.lift ?? NAME_LIFT[st.kind];
      const near = game.stationNear() === st.kind;
      const goal = this.goal === st.kind;
      const hop = goal ? Math.round(Math.abs(Math.sin(t * 9)) * 2) : 0;
      this.labels.push({ x: wx(cam, st.x, st.y), y: wy(cam, st.x, st.y) - lift - hop, text: STATION_NAME[st.kind], color: goal ? P.gd4 : near ? P.white : P.tl5 });
    }
    // (THE SHAFT'S RIM: what it stands that is no service is named as they are: its record stone, its trophies wall: render/rim.ts)
    if (this.lookNow?.names) for (const n of this.lookNow.names(L)) this.labels.push({ x: wx(cam, n.x, n.y), y: wy(cam, n.x, n.y) - n.lift, text: n.text, color: P.tl5 });
    // (QUEST MARKERS, game/quest_marks.ts: over whoever in town has a quest for him now, over his name; over the floor's waypoint
    // home while he brings something back)
    this.questMarks.length = 0;
    if (QUEST_MARKS.on) {
      if (L.town) {
        const who = game.questGivers();
        // (over the person's head where they are drawn standing; else over their name)
        for (const st of L.stations) {
          if (!who.includes(st.kind)) continue;
          const head = this.folkHeads.get(st.kind);
          const name = { x: wx(cam, st.x, st.y), y: wy(cam, st.x, st.y) - (st.lift ?? NAME_LIFT[st.kind]) };
          // (over the name instead where the name is written at the head, so that the two do not lie one on the other)
          this.questMarks.push(head && Math.abs(head.y - name.y) > 14 ? { x: head.x, y: head.y - 4 } : { x: name.x, y: name.y - 4 });
        }
      } else {
        const w = L.ways?.way;
        if (w && game.turnInFor() && L.explored[Math.floor(w.y) * f.w + Math.floor(w.x)]) this.questMarks.push({ x: wx(cam, w.x, w.y), y: wy(cam, w.x, w.y) - WAY_MARK_LIFT });
      }
    }
    // (EXIT_LABELS: a floor's way out, once its boss has fallen and it has opened, carries its name as they do: game/exit_labels.ts)
    if (EXIT_LABELS.on) {
      for (const e of exitLabels(L)) {
        if (!L.explored[Math.floor(e.y) * f.w + Math.floor(e.x)]) continue;
        const near = Math.hypot(e.x - h.x, e.y - h.y) < 3;
        this.labels.push({ x: wx(cam, e.x, e.y), y: wy(cam, e.x, e.y) - e.lift, text: e.text, color: near ? P.white : P.tl5 });
      }
    }

    for (const dr of game.drops) {
      if (!L.explored[Math.floor(dr.y) * f.w + Math.floor(dr.x)]) continue;
      const sx = wx(cam, dr.x, dr.y);
      const sy = wy(cam, dr.x, dr.y);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      const pop = dr.age >= 0 && dr.age < 0.4 ? Math.sin((dr.age / 0.4) * Math.PI) * 9 : 0;
      const bob = dr.kind === 'word' || dr.kind === 'orb' ? Math.sin(t * 4 + dr.x) * 1.5 + 3 : 0;
      // (RUNEDUST AND THE MELDSTONE DRAWN, art/meld_drops.ts, behind MELD_DROPS: lying, and as they drop)
      if (MELD_DROPS.on && art.meldDrops && (dr.kind === 'dust' || dr.kind === 'stone')) {
        this.standMeldDrop(dr, sx, sy, t, fx);
        hid?.(dr.x, dr.y);
        continue;
      }
      // (THE HIGH CITY, THE ROYAL CARDS: a royal's card lying face up, named in its royal's colour: render/royal_cards.ts)
      if (dr.kind === 'card' && dr.royal) {
        this.stand(dr.x + dr.y - 0.2, royalCardSprite(dr.royal), sx, sy - pop);
        hid?.(dr.x, dr.y);
        this.labels.push({ x: sx, y: sy - 14, text: `The ${ROYAL_NAMES[dr.royal].one}'s card`, color: royalLabelColor(dr.royal) });
        continue;
      }
      let sp: Sprite;
      if (dr.kind === 'gold') sp = art.icons.gold[dr.gold >= 30 ? 2 : dr.gold >= 8 ? 1 : 0];
      else if (dr.kind === 'orb') sp = art.icons.lifeOrb;
      else if (dr.kind === 'word' && dr.word) sp = art.icons.word[dr.word];
      // (WORDMELDING, behind MELD: runedust and the Meldstone)
      else if (dr.kind === 'dust') sp = art.icons.runedust;
      else if (dr.kind === 'stone') sp = art.icons.meldstone;
      // (QUESTS610: a piece of the ward-stone: the Meldstone's picture stands in for it until the art chat draws it)
      else if (dr.kind === 'piece') sp = art.icons.meldstone;
      // (the same picture as in the bag, at its rarity: with ITEMS_A on the art chat's, painted finer than a game pixel; stand draws it at its size)
      else if (dr.item) sp = itemPic(art.icons, dr.item.icon, dr.item.rarity, dr.item.unique);
      else continue;
      if (dr.kind === 'orb') {
        // a life orb beats like a heart
        ringDots(g, sx, sy, 0.3 + 0.07 * Math.sin(t * 7 + dr.x), P.bl4);
        if (Math.random() < 0.12 * amb) fx.mote(dr.x, dr.y, [P.bl5, P.bl4, P.white]);
      }
      // item icons are centred; set them down on the floor
      const lift = dr.kind === 'item' ? 4 : 0;
      this.stand(dr.x + dr.y - 0.2, sp, sx, sy - pop - bob - lift);
      hid?.(dr.x, dr.y);
      // (only what kind of thing it is, in the colour of how rare it is: the rest is in the inventory)
      if (dr.kind === 'item' && dr.item) this.labels.push({ x: sx, y: sy - 20, text: kindName(dr.item), color: RARITY_COLOR[dr.item.rarity] });
      // (a word gets more than a label: see drawWordDrops)
      if (dr.kind === 'word' && dr.word && Math.random() < 0.3 * amb) fx.mote(dr.x, dr.y, [WORD_COLOR[dr.word], P.white]);
      // (WORDMELDING: runedust glitters; the Meldstone is named, and glitters too)
      if (dr.kind === 'dust' && Math.random() < 0.25 * amb) fx.mote(dr.x, dr.y, [MELD_DUST_COLOR, P.white]);
      if (dr.kind === 'piece') {
        this.labels.push({ x: sx, y: sy - 20, text: QUEST610_TEXT.pieceLabel, color: '#e8dcc0' });
        if (Math.random() < 0.3 * amb) fx.mote(dr.x, dr.y, ['#e8dcc0', P.white]);
      }
      if (dr.kind === 'stone') {
        this.labels.push({ x: sx, y: sy - 20, text: 'Meldstone', color: MELD_DUST_COLOR });
        if (Math.random() < 0.3 * amb) fx.mote(dr.x, dr.y, [MELD_DUST_COLOR, P.white]);
      }
    }

    // (and their moments: runedust taken, the Meldstone taken and given, and kept over the wordsmith's slab)
    if (MELD_DROPS.on && art.meldDrops) this.standMeldMoments(game, cam, t, fx);

    // a monster that is falling: it stands among the others until it lies (then it is drawn with the floor, above)
    for (const f of fx.fallen) {
      const sx = wx(cam, f.x, f.y);
      const sy = wy(cam, f.x, f.y);
      if (sx < -90 || sx > W + 90 || sy < -60 || sy > H + 130) continue;
      const shown = this.fallenSprite(f);
      if (!shown || shown.lying) continue;
      // (killed up in the air: it falls from there; over the drop, on into it, fading as it goes: fallenLift)
      const fall = f.lift ? fallenLift(f) : null;
      if (fall && fall.alpha <= 0) continue;
      const fy = fall ? sy - fall.up : sy;
      if (shown.sp.lights && (!fall || fall.alpha >= 1)) this.monsterLit.push({ s: shown.sp, x: Math.round(sx), y: Math.round(fy) });
      // (THE SEVEN NEW WORDS' LOOKS, behind a switch that is off: one Culling cut down falls split along the cut: render/words7.ts)
      const sp7 = WORDS7_LOOK.on ? fallenW7(f, shown.sp) : null;
      this.stand(f.x + f.y, sp7 ?? shown.sp, sx, fy, null, 0, 1, fall ? fall.alpha : 1);
      hid?.(f.x, f.y);
    }
    // (THE MONSTERS' ATTACKS: the dead the Warden has called, crawling out of the ground: the skeleton's own picture of it, art/mkit.ts crawlOut)
    for (const r of game.risers) {
      const m = r.m;
      const f = game.level.floor;
      if (r.age < 0 || game.level.visible[Math.floor(m.y) * f.w + Math.floor(m.x)] !== 1) continue;
      const art = this.monsterArt(m);
      // (ARRIVALS: one coming in up out of a rift: its own picture rising out of the floor, dark till it is out: render/arrivals.ts)
      if (r.way === 'rift') {
        const up = risenBy(r.age, r.rise ?? 1);
        const cut = up > 0 ? risingSprite(this.monsterSprite(m), up) : null;
        if (!cut) continue;
        const dark = silhouette(cut.sp, '#160a1c');
        this.stand(m.x + m.y, cut.sp, wx(cam, m.x, m.y), wy(cam, m.x, m.y) + cut.down, dark, 0.85 * (1 - up), 1, Math.min(1, 0.35 + up));
        continue;
      }
      // (THE FIRST FIVE FLOORS: one the Fleshmancer raises: its bones snatched up off a heap and slammed together: render/bossfx.ts)
      if (r.way === 'gather') {
        const gs = this.bossFx.gathering(art, m.fx + m.fy < -0.2, r.age);
        if (gs) this.stand(m.x + m.y, m.fx - m.fy < 0 ? flipSprite(gs, true) : gs, wx(cam, m.x, m.y), wy(cam, m.x, m.y));
        continue;
      }
      // (AM_ACTION: a bone mite pulling itself together where its skull burst: its own pictures of it, art/amalgam_mites.ts)
      const c = (m.fx + m.fy < -0.2 ? art.back : art.front).clips?.moves?.[r.way === 'form' ? 'form' : 'crawl'];
      if (!c) continue;
      const sp = clipFrame(c, r.age);
      this.stand(m.x + m.y, m.fx - m.fy < 0 ? flipSprite(sp, true) : sp, wx(cam, m.x, m.y), wy(cam, m.x, m.y));
    }
    // (THE FIRST FIVE FLOORS: what the bosses send out that stands among the figures: an axe, a hook, a ball in flight, arms and hands out of the floor, skulls on the wing)
    this.bossFx.standing(this.floorAt, game, (d, sp, x, y, alpha = 1) => {
      if (sp.lights) this.monsterLit.push({ s: sp, x: Math.round(x), y: Math.round(y) });
      this.stand(d, sp, x, y, null, 0, 1, alpha);
    }, (x, y) => game.level.visible[Math.floor(y) * game.level.floor.w + Math.floor(x)] === 1);
    for (const m of game.monsters) {
      if (m.dead || !m.seen || unseen(m)) continue;
      let sx = wx(cam, m.x, m.y);
      let sy = wy(cam, m.x, m.y);
      // (the Warden is twice the height of anything else: he is in the picture from further off)
      if (sx < -60 || sx > W + 60 || sy < -30 || sy > H + (m.boss ? 130 : 80)) continue;
      // A monster that has just been struck is knocked back from the hero for as long as it
      // flashes, and comes back: a blow that moves nothing has no weight. (Only the picture: it
      // stands where the rules have it. Not one that is frozen solid; the Warden, hardly.) From
      // Version 15.1; the owner, 6 Oct 2026: "I want things to have weight. That's very important".
      if (m.flash > 0 && m.frozenT <= 0) {
        const fdx = (m.x - h.x - (m.y - h.y)) * 16;
        const fdy = (m.x - h.x + (m.y - h.y)) * 8;
        const far = Math.hypot(fdx, fdy) || 1;
        const push = Math.min(1, m.flash / FLINCH_TIME) * (m.boss ? FLINCH_BOSS : FLINCH);
        sx += Math.round((fdx / far) * push);
        sy += Math.round((fdy / far) * push);
        // (the dead are brittle, his word for them: a struck skeleton RATTLES, a pixel each way and back, while it flashes)
        const fig = figureOf(m);
        if (fig === 'skeleton' || fig === 'archer') sx += Math.floor(t * 40 + m.id) % 2 === 0 ? 1 : -1;
      }
      // (THE NEW WORDS, a mock-up behind a switch that is off: knocked back a step by a stagger, swaying while stunned)
      if (WORDS3.on) {
        const [ox, oy] = shift3(m, t);
        sx += ox;
        sy += oy;
      }
      // (WORDMELDING's looks, behind a switch that is off: Avalanche's shove, slid)
      if (MELD3.on) {
        const [ox, oy] = shiftM3(m);
        sx += ox;
        sy += oy;
      }
      // (the five Volatile melds' looks, behind a switch that is off: a blast beside it jolts it)
      if (VOLATILE3.on) {
        const [ox, oy] = shiftV3(m);
        sx += ox;
        sy += oy;
      }
      let sp = this.monsterSprite(m);
      // (THE SEVEN NEW WORDS' LOOKS, behind a switch that is off: a spirit Reaping raised, one Culling cut down: render/words7.ts)
      const w7 = WORDS7_LOOK.on ? lookW7(m, sp) : null;
      if (w7) {
        sp = w7.sp;
        sy -= w7.lift;
      }
      // (FLOOR 4, MORE ACTION: the dagger cultist's frenzy carries him in its own pictures, the rules the way he truly faces: his
      // picture drawn back by what it carries him, so that it is where the rules have him: game/action_f4.ts frenzyShift)
      if (m.frenzy && (m.state === 'windup' || m.state === 'recover')) {
        const mv = movesOf(m)?.[m.move ?? -1];
        if (mv && mv.id === 'frenzy') {
          const [ox, oy] = frenzyShift(m.fx, m.fy, moveAge(m.state, m.t, mv.windup, mv.recover));
          sx += ox;
          sy += oy;
        }
      }
      // (ACT 1: up in the air, as its kind has it; and drawn over what it is latched on to)
      const a1 = act1Fx(m.kind);
      if (a1 && a1.lift) sy -= Math.round(a1.lift(m));
      // (THE BRAWLER'S TREE: Big Uppercut, one he has thrown up is up in the air: render/brawler_fx.ts)
      if (game.brawl.up.length) sy -= fx.brawler.liftOf(m);
      const depthBy = a1 && a1.over ? a1.over(m) : 0;
      // (ice gives off no light)
      if (sp.lights && m.frozenT <= 0) this.monsterLit.push({ s: sp, x: Math.round(sx), y: Math.round(sy) });
      let over: Sprite | null = null;
      let overA = 0;
      if (m.flash > 0) {
        over = silhouette(sp, P.white);
        // (a body as big as the Moth's flashes fainter: the whole screen would go white: its kind's own, Act1Fx.flash)
        overA = a1?.flash ?? 1;
      } else if (m.frozenT > 0) {
        // frozen solid: a block of pale ice
        over = silhouette(sp, P.bu5);
        overA = 0.78;
        this.marks.push({ x: sx, y: sy, kind: 'ice', seed: m.id });
      } else if (m.chillT > 0) {
        over = silhouette(sp, P.bu4);
        overA = 0.34;
      } else if (m.burnT > 0) {
        // on fire: it flickers orange under the flames
        over = silhouette(sp, P.fr4);
        overA = 0.16 + 0.14 * Math.abs(Math.sin(t * 17 + m.id));
      } else if (m.poisonT > 0) {
        // poisoned: it goes a sick green, the sicker the more doses it carries
        over = silhouette(sp, P.vn4);
        overA = Math.min(0.5, 0.2 + m.poisonN * 0.04) + 0.06 * Math.sin(t * 6 + m.id);
      }
      // (THE NEW WORDS, a mock-up behind a switch that is off: the cursed, and what stands in a hex circle, drained grey)
      if (WORDS3.on && (!over || m.flash <= 0)) {
        const tn = tint3(m, t);
        if (tn && (!over || tn[1] > overA)) {
          over = silhouette(sp, tn[0]);
          overA = tn[1];
        }
      }
      // (WORDMELDING's looks, behind a switch that is off: Blight's rot, Frostbite's bite, Thunder's stun)
      if (MELD3.on && (!over || m.flash <= 0)) {
        const tn = tintM3(m, t);
        if (tn && (!over || tn[1] > overA)) {
          over = silhouette(sp, tn[0]);
          overA = tn[1];
        }
      }
      // (Binding's look, behind a switch that is off: lit as its bands snap tight)
      if (BINDING3.on) {
        const tn = tintB3(m);
        if (tn && (!over || tn[1] > overA)) {
          over = silhouette(sp, tn[0]);
          overA = tn[1];
        }
      }
      // (the five Volatile melds' looks, behind a switch that is off: lit white as a blast, shard or arc strikes it)
      if (VOLATILE3.on) {
        const tn = tintV3(m, t);
        if (tn && (!over || tn[1] > overA)) {
          over = silhouette(sp, tn[0]);
          overA = tn[1];
        }
      }
      // (the seven new words' looks, behind a switch that is off: lit as one is pierced, cut down, or flashes like a mirror)
      if (WORDS7_LOOK.on && w7 && w7.tint && (!over || w7.tint[1] > overA)) {
        over = silhouette(sp, w7.tint[0]);
        overA = w7.tint[1];
      }
      // (THE CITY'S WORDS, Version 23.8: one of the two a Splitting monster split into is smaller)
      this.stand(m.x + m.y + depthBy, sp, sx, sy, over, overA, m.split ? SPLIT.look : 1, WORDS7_LOOK.on && w7 ? w7.alpha : 1);
      // (THE NEW WORDS, a mock-up behind a switch that is off: a slowed monster's echoes linger after it)
      if (WORDS3.on) for (const e of echoes3(m)) this.stand(e.x + e.y - 0.02, silhouette(sp, e.color), wx(cam, e.x, e.y), wy(cam, e.x, e.y), null, 0, 1, e.alpha);
      hid?.(m.x, m.y);
      if (m.burnT > 0 && Math.random() < 0.55 * amb) fx.flames(m.x, m.y, 0.22, 1, 0.9);
      if (m.chillT > 0 && m.frozenT <= 0 && Math.random() < 0.12 * amb) fx.mote(m.x + (Math.random() - 0.5) * 0.5, m.y + (Math.random() - 0.5) * 0.5, [P.white, P.bu5]);
      if (m.poisonT > 0 && !rotting(m) && Math.random() < Math.min(0.5, 0.12 + m.poisonN * 0.05) * amb) fx.bubbles(m.x, m.y, 0.25, 1);
      // a guardian smoulders in the colour of its first word
      if (m.champion && m.words.length && Math.random() < 0.25 * amb) fx.mote(m.x + (Math.random() - 0.5) * 0.8, m.y + (Math.random() - 0.5) * 0.8, [WORD_COLOR[m.words[0]], P.white]);
    }
    // (THE SEVEN NEW WORDS' LOOKS, behind a switch that is off: the rules' spirits (game.spirits), each the little grey Shade: render/words7.ts)
    if (WORDS7_LOOK.on) for (const c of spiritsW7(game, cam)) this.stand(c.depth, c.sp, c.x, c.y, null, 0, 1, c.alpha);

    {
      const sx = wx(cam, h.x, h.y);
      // (in a swipe move the hero is lifted by the move, from the height they left to the height
      // they land on, not by the ground they pass over: a leap up a ledge rises to it)
      let sy = relief ? wyFlat(cam, h.x, h.y) - heroLift : wy(cam, h.x, h.y);
      // (big and wild, art/moves3.ts WILD: higher: render/wild.ts, LEAP_LIFT)
      // (the warrior's diving thrust, in place of his leap: low over the floor, art/heroes3.ts THRUST)
      if (h.move && h.move.kind === 'leap') sy -= Math.sin(Math.min(1, h.move.t / h.move.dur) * Math.PI) * (THRUST.on && h.cls === 'warrior' ? THRUST_LIFT : WILD.on ? LEAP_LIFT : 24);
      // (a roll that goes over a ledge or a pit is a dive: it leaves the floor, a little)
      else if (h.move && h.move.over) sy -= Math.sin(Math.min(1, h.move.t / h.move.dur) * Math.PI) * 10;
      const heroArt = this.heroArt(game);
      // (THE WARLOCK's smoke step is laid out over the step as a leap is: art/warlock_art.ts)
      // (THE WARRIOR'S WEAPONS: a leap's crouch before he leaves the floor is its own: `crouchT`, and no leap yet)
      const crouchT = h.move && h.move.kind === 'leap' && h.move.crouch && h.move.t < h.move.crouch ? h.move.t : -1;
      const leapK = crouchT >= 0 ? -1 : h.move && (h.move.kind === 'leap' || h.move.kind === 'smoke' || h.move.kind === 'blast' || h.move.kind === 'slip') ? Math.min(1, (h.move.t - (h.move.crouch ?? 0)) / h.move.dur) : -1;
      const changeK = h.change ? Math.min(1, h.change.t / Math.max(1e-6, h.change.dur)) : -1;
      const rollK = h.move && h.move.kind === 'roll' ? Math.min(1, h.move.t / h.move.dur) : -1;
      // (a figure with a tumble of its own is seen making it; one without is drawn faint, to read as a blur)
      const tumbles = heroArt.front.clips?.roll !== undefined;
      // The figure: the frame for what the hero is doing, with the scarf and the feather moved on.
      // (They live in the world as the screen lays it out, so they trail when the hero runs.)
      const fig = this.figure;
      const who = `${h.cls}:${game.seed}`;
      if (who !== this.figureOf) {
        this.figureOf = who;
        fig.reset();
        this.vetFx.clear();
        this.lifeBar.reset();
        this.reelT = -1;
        this.lifeWas = h.life;
      }
      // (left standing, a hero does a little something of their own: not with monsters awake nearby)
      const fight = game.monsters.some((m) => !m.dead && m.state !== 'sleep' && Math.abs(m.x - h.x) + Math.abs(m.y - h.y) < 14);
      const calm = !game.over && !fight;
      // The bar of life over the hero's head (and the line they speak, in fx.ts) stands clear of the
      // figure at rest, whatever it is doing now: a raised sword passes in front of the bar and does
      // not push it about. With mana to show as well the bar is two pixels taller.
      // (read from a frame painted already, or as it last was: reading one not painted paints it, and the demon's first standing
      // frame painted here, to be read, was the half of a second's stop as the Warlock changed: his lag, 30 Oct 2026)
      // (THE LIVING SHADOW: while he changes into it, its own height, not the man's: up on two legs it is taller, and its bars
      // would cross its face as it rises; art/shadow_art.ts)
      const into = h.cls === 'warlock' && h.change?.to === 'demon' && LIVING_SHADOW.on ? this.art.heroes.of('warlock', { twoHanded: false, town: !!game.level.town, demon: true }) : null;
      const stand = paintedNear((into ?? heroArt).front.idle, 0, true);
      const top = stand ? stand.ay + (game.meta.limit === 'mana' ? 2 : 0) : this.heroAt.top;
      this.heroAt = { x: Math.round(sx), y: Math.round(sy), top };
      fx.headroom = top;
      // A hero whose life has run out FALLS (their art's `fall`): the world has stopped, and they go
      // down in the stillness, their cloth still moving, the light going out of them.
      const sinceLook = Math.max(0, Math.min(0.05, t - this.fallClock));
      this.fallClock = t;
      this.fallT = game.over ? (this.fallT < 0 ? 0 : this.fallT + sinceLook) : -1;
      // (there is nothing to be hurt by in town) (the bar of a fallen hero empties and goes by the screen's clock, like the fall)
      this.lifeBar.update(h.life / Math.max(1, h.d.maxLife), fight, game.over || !!game.level.town, game.over ? sinceLook : pace / 60);
      // A HEAVY BLOW ROCKS THE HERO BACK (their art's `reel`): one that takes a tenth of their life
      // or more (REEL_AT). Only the picture, and only while they stand or walk: they are where the
      // rules have them, and whatever they are doing goes on. (A new blow is known by the flash the
      // rules give it; what burns or poisons them takes life without one.)
      if (h.flash > this.flashWas + 0.01 && this.lifeWas - h.life >= h.d.maxLife * REEL_AT) {
        this.reelT = 0;
        // (from in front they are rocked back; from behind, thrown forward. Whoever is nearest is taken for whoever struck.)
        let near = Infinity;
        this.reelBehind = false;
        for (const m of game.monsters) {
          if (m.dead || m.state === 'sleep') continue;
          const d = Math.hypot(m.x - h.x, m.y - h.y);
          if (d >= near) continue;
          near = d;
          this.reelBehind = (m.x - h.x) * h.fx + (m.y - h.y) * h.fy < 0;
        }
      } else if (this.reelT >= 0) this.reelT = this.reelT + pace / 60 > REEL_TIME ? -1 : this.reelT + pace / 60;
      this.flashWas = h.flash;
      this.lifeWas = h.life;
      // (how far the hero has walked: a leap, a roll or a warp carries them, and is not walking)
      let moved: [number, number] = [0, 0];
      if (this.walkedFrom && !h.move) {
        const d = Math.hypot(h.x - this.walkedFrom[0], h.y - this.walkedFrom[1]);
        if (d < 1) {
          this.walked += d;
          moved = [h.x - this.walkedFrom[0], h.y - this.walkedFrom[1]];
        }
      }
      this.walkedFrom = [h.x, h.y];
      let sp = fig.frame(heroArt, { anim: h.anim, animT: h.animT, fx: h.fx, fy: h.fy, attackSkill: this.clipOf(game), attackMove: SWAP_MOVES.on ? h.skills[h.attackSkill]?.id : undefined, attackAge: h.attackAge, attackWind: h.attackWind, leapK, holdT: this.heldFor(game), holdAs: this.heldAs(game), holdSoon: this.holdSoon(game), rollK, changeK, punch: h.punch && h.anim === 'attack' ? h.punch.run : undefined, tapAs: h.skills[0]?.id, fallT: this.fallT, reelT: this.reelT, reelBehind: this.reelBehind, walked: this.walked, moved, poised: h.combo === 0 && h.comboT > 0, ...(crouchT >= 0 ? { crouchT } : {}), ...(heavyDrawn(h.cls, h.talents) === 'axe' ? { axe: { empty: !!h.handsEmpty, caughtT: h.caughtAt !== undefined ? game.time - h.caughtAt : -1, appear: !!h.appear } } : {}) }, game.over ? sinceLook : pace / 60, (h.x - h.y) * 16, (h.x + h.y) * 8 - (wy(cam, h.x, h.y) - sy), calm);
      // (THE VETERAN in a move: its frame, turned as he faced as it began: render/veteran_fx.ts. Not narrowed in a turn.)
      const vetSp = this.vetFx.shown(game, heroArt);
      if (vetSp) sp = vetSp;
      let over: Sprite | null = null;
      let overA = 0;
      // (the game's clock stops with the blow that fells a hero, and its flash would stand on them
      // for good: it is shown for as long as a flash lasts, and then nothing tints the fallen)
      if (h.flash > 0 && this.fallT < 0.15) {
        over = silhouette(sp, P.bl4);
        overA = 0.8;
      } else if (this.fallT >= 0) {
        over = null;
      } else if (h.chillT > 0) {
        over = silhouette(sp, P.bu4);
        overA = 0.3;
      } else if (h.poisonT > 0) {
        over = silhouette(sp, P.vn4);
        overA = 0.3;
      }
      // A warp: the figure the mage was phases out where they stood, and the mage phases in here.
      const wp = fx.warp;
      const warped = wp !== null && Math.hypot(wp.x1 - wp.x0, wp.y1 - wp.y0) > 0.5 && Math.hypot(h.x - wp.x1, h.y - wp.y1) < 1.5 ? wp : null;
      if (warped && warped.t < PHASE_OUT && this.heroWas) {
        const k = warped.t / PHASE_OUT;
        this.stand(warped.x0 + warped.y0, this.heroWas, wx(cam, warped.x0, warped.y0), wy(cam, warped.x0, warped.y0), null, 0, 1, 1 - k * k, null, 0.15 + k * 0.85);
      } else if (!warped || warped.t >= PHASE_OUT) this.heroWas = sp;
      // (and a hero who has only just come into the world by a warp, picked on a class card, comes together the same way: fx.arrival)
      const arrived = fx.arrival && fx.arrival.t < ARRIVE_IN ? 1 - fx.arrival.t / ARRIVE_IN : 0;
      const coming = Math.max(warped && warped.t < PHASE_IN ? 1 - warped.t / PHASE_IN : 0, arrived);
      // a rolling hero is drawn faint, to read as a blur
      this.heroLit = null;
      // (THE FIRST FIVE FLOORS: riding up the mine shaft in its cage, lifted with it and taken into the dark: render/dress.ts)
      const ride = this.dress.rider(game, sp);
      // (THE BRAWLER weaving: after-images of him left along the way, fading: render/brawler_fx.ts has the rest)
      for (const gh of this.slipGhosts) gh.t += pace / 60;
      this.slipGhosts = this.slipGhosts.filter((gh) => gh.t < 0.3);
      if (h.move && h.move.kind === 'slip' && (this.slipGhosts.length === 0 || this.slipGhosts[this.slipGhosts.length - 1].t > 0.03)) this.slipGhosts.push({ s: sp, x: h.x, y: h.y, t: 0 });
      for (const gh of this.slipGhosts) this.stand(gh.x + gh.y - 0.02, silhouette(gh.s, '#22d0e0'), wx(cam, gh.x, gh.y), wy(cam, gh.x, gh.y), null, 0, 1, 0.55 * (1 - gh.t / 0.3));
      if (ride) this.stand(ride.d, ride.sp, sx, sy - ride.up);
      else if (!(h.move && h.move.kind === 'roll' && !tumbles && Math.floor(t * 30) % 2 === 0)) {
        // (THE VETERAN: what is behind him at height, and his after-images along a strike, just behind him: render/veteran_fx.ts)
        for (const b of this.vetFx.behind(game, heroArt, Math.round(sx), Math.round(sy), cam, top)) this.stand(h.x + h.y + b.dd, b.s, b.x, b.y);
        // (WORDMELDING's looks, behind a switch that is off: standing in Scald's steam, the hero is hidden, seen faint through it)
        this.stand(h.x + h.y, sp, sx, sy, over, overA, 1, (coming > 0 ? 1 - coming * coming * 0.85 : 1) * (MELD3.on ? heroAlphaM3(t) : 1), vetSp ? null : fig, coming);
        // (THE NEW WORDS, a mock-up behind a switch that is off: a frenzy of three or more shivers the hero in its colour)
        const copies = WORDS3.on ? heroCopies3(t) : null;
        if (copies) for (const dx of copies.dx) this.stand(h.x + h.y - 0.01, silhouette(sp, copies.color), sx + dx, sy, null, 0, 1, copies.alpha);
        // (THE SEVEN NEW WORDS' LOOKS, behind a switch that is off: Mirroring's reflection of him, in glass, beside him: render/words7.ts)
        if (WORDS7_LOOK.on) for (const c of heroW7(sp, h, cam)) this.stand(c.depth, c.sp, c.x, c.y, null, 0, 1, c.alpha);
        // (HIS THREE NEW WORDS' LOOKS, behind a switch that is off: a boost Fleeting gave him, a stutter of after-images: render/words10.ts)
        if (WORDS10_LOOK.on) for (const c of heroW10(sp, h, cam, game)) this.stand(c.depth, c.sp, c.x, c.y, null, 0, 1, c.alpha);
        if (relief && !h.move) this.hide(h.x, h.y, heroLift);
        this.heroLit = { x: Math.round(sx), y: Math.round(sy) };
        // BIG AND WILD (art/moves3.ts, WILD): where the power she holds burns, and how hot, for the
        // effects to make it crackle and throw bolts (a place in the world, and its height there)
        const held = WILD.on && coming <= 0 ? fig.charge() : null;
        if (held) {
          const cx = h.x + held.dx / 32;
          const cy = h.y - held.dx / 32;
          fx.charge(cx, cy, wy(cam, cx, cy) - (sy + held.dy), held.heat, h.fx, h.fy);
        }
      }
      if (h.burnT > 0 && Math.random() < 0.4 * amb) fx.mote(h.x, h.y, ELEMENT_RAMP.fire);
      // "of Swiftness": while the haste lasts the hero leaves green afterimages and a wake of wind
      if (h.hasteT > 0 && live && Math.hypot(h.x - this.blurAt.x, h.y - this.blurAt.y) > 0.32) {
        this.blurAt.x = h.x;
        this.blurAt.y = h.y;
        this.ghosts.push({ sp: silhouette(sp, P.gn4), x: h.x, y: h.y, t0: t, dur: 0.32, alpha: 0.45 });
        fx.hasteWake(h.x, h.y, h.fx, h.fy);
      }
      // phantoms the effects have asked for (the twin, the echo, the blur of a swift cut)
      for (const a of fx.ghostAsks) {
        const pose = this.actorSprite(heroArt, 'attack', 0, 1, a.dx, a.dy);
        this.ghosts.push({ sp: silhouette(pose, a.color), x: a.x, y: a.y, t0: t + a.delay, dur: a.dur, alpha: a.alpha });
      }
      fx.ghostAsks.length = 0;
      if (this.ghosts.length > 24) this.ghosts.splice(0, this.ghosts.length - 24);
      for (let i = this.ghosts.length - 1; i >= 0; i--) {
        const gh = this.ghosts[i];
        const k = (t - gh.t0) / gh.dur;
        if (k >= 1) {
          this.ghosts.splice(i, 1);
          continue;
        }
        if (k < 0) continue;
        // it holds, then fades over the last part of its time
        const a = gh.alpha * (k < 0.5 ? 1 : 1 - (k - 0.5) / 0.5);
        this.stand(gh.x + gh.y - 0.02, gh.sp, wx(cam, gh.x, gh.y), wy(cam, gh.x, gh.y), null, 0, 1, a);
      }
    }

    // (THE MAGE'S AURA, THE RANGER'S SNIPE DRAWN AND HIS RALLY, game/swap_moves.ts, behind SWAP_MOVES: render/swap_fx.ts)
    if (SWAP_MOVES.on) {
      drawSwapAura(g, cam, game, t);
      drawSnipeDraw(g, cam, game, t);
      drawRally(g, cam, game, t);
      drawSplashes(g, cam, t);
    }

    // The orb the staff has set down: a large ball hanging over the floor. It comes in at a pop,
    // swells as its next wave gathers, and gutters in its last half second.
    for (const o of game.orbs) {
      const sx = wx(cam, o.x, o.y);
      const sy = wy(cam, o.x, o.y);
      if (sx < -30 || sx > W + 30 || sy < -30 || sy > H + 40) continue;
      const frames = art.spells.orb[o.element];
      const sp = frames[Math.floor(t * 11 + o.id * 3) % frames.length];
      const born = Math.min(1, o.t / 0.12);
      const gather = 1 - Math.max(0, Math.min(1, o.next / TUNE.orbEvery));
      const left = o.life - o.t;
      const dying = left < 0.5 ? Math.max(0, left / 0.5) : 1;
      const scale = (0.5 + 0.5 * born) * (0.9 + 0.18 * gather * gather) * (0.65 + 0.35 * dying);
      const bob = Math.sin(t * 2.6 + o.id) * 1.5;
      const [tint, tintA] = this.wordTint(game, o.skill, 0, t);
      // (it does not flicker out of sight as it goes: it shrinks, and blinks in its last moments)
      if (dying < 0.5 && Math.floor(t * 24) % 2 === 0) continue;
      this.stand(o.x + o.y + 0.01, sp, sx, sy - 13 + bob, tint ? silhouette(sp, tint) : null, tintA, scale);
      // (HIS THREE NEW WORDS' LOOKS, behind a switch that is off: Fleeting on its ability, a stutter of after-images of it: render/words10.ts)
      if (WORDS10_LOOK.on) for (const c of thingW10(game, o.skill, o.id, sp, sx, sy - 13 + bob)) this.stand(o.x + o.y + 0.005, c.sp, c.x, c.y, null, 0, scale, c.alpha);
      if (live && Math.random() < 0.35 * amb) fx.mote(o.x + (Math.random() - 0.5) * 0.7, o.y + (Math.random() - 0.5) * 0.7, SPELL_TONES[o.element].slice(1));
    }
    // Familiars: small sprites of energy that keep to the hero's shoulder, bobbing. One that has
    // just shot flares; the weaker copy that "of Echoes" calls is the mirror's teal.
    for (const q of game.familiars) {
      const sx = wx(cam, q.x, q.y);
      const sy = wy(cam, q.x, q.y);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 40) continue;
      const frames = art.spells.familiar[q.element];
      let sp = frames[Math.floor(t * 9 + q.id * 2) % frames.length];
      // (it looks the way it last shot)
      if (q.fx - q.fy < 0) sp = flipSprite(sp);
      const born = Math.min(1, q.t / 0.15);
      const left = q.life - q.t;
      if (left < 0.6 && Math.floor(t * 16) % 2 === 0) continue;
      const bob = Math.sin(t * 5 + q.id * 1.7) * 1.5;
      const flare = q.shotAge < 0.1;
      let [tint, tintA] = this.wordTint(game, q.skill, 0, t);
      if (q.echo) {
        tint = P.tl5;
        tintA = 0.6;
      }
      if (flare) {
        tint = P.white;
        tintA = 0.8;
      }
      this.stand(q.x + q.y + 0.02, sp, sx, sy - FAMILIAR_HOVER + bob, tint ? silhouette(sp, tint) : null, tintA, (0.4 + 0.6 * born) * (flare ? 1.25 : 1));
    }

    // THE TINKERER'S CONTRAPTIONS AND HER GOLEM (game/tinkerer.ts; their pictures art/tinkerer_art.ts)
    if (game.golems.length || game.contraptions.length || fx.tinkerer.rocketLeft()) this.drawTinkerers(game, cam, t, W, H, fx.tinkerer);
    // THE RANGER'S COMPANIONS (game/companions.ts), at his side; their pictures the art chat's (art/companions_art.ts): only with
    // COMPANIONS on (game/talents.ts) are there any, so the pictures go on with them, as the art chat's README asks
    if (game.pets.length) this.drawPets(g, game, cam, t, W, H);
    // THE WARLOCK'S BOUND DEMON (his tree: game/talents.ts), at his side; his shadows where he stepped from (Phantom Step)
    if (game.bound) this.drawBound(game, cam, W, H, pace / 60);
    if (game.decoys.length) this.drawShadows(game, cam, t);
    // (UNIQUE ITEMS, what they show in play, each behind a switch that is off: The Restless Tome's book and its fire, The
    // Fleshmancer's Brand's risen elite: render/unique_fx.ts)
    for (const u of fx.uniques.stands(cam)) this.stand(u.d, u.s, u.x, u.y, null, 0, 1, u.alpha);

    for (const p of game.projectiles) {
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      // (THE WARLOCK'S BOLT is his fire alone, drawn with the effects: render/warlock_fx.ts drawBolt. Till 12 Nov 2026 a ball of
      // light, the purple of its element, was drawn at its nose here as well, under the fire: his words of the bolt in play that day,
      // “fix the hellfire projectile so it’s tail doesn’t only face one way as well”; and a purple glow is the enemy's)
      if (p.look !== 'arrow' && p.look !== 'wave' && p.look !== 'dart' && p.look !== 'spear' && p.look !== 'great' && p.look !== 'hellbolt' && p.look !== 'mspear' && p.look !== 'ball') {
        // (a familiar's bolt is a small bright mote; anything else that is not an arrow (nor a wave, nor a dart) is a ball of light)
        const mote = p.look === 'mote';
        const frames = mote ? [art.spells.mote[p.element]] : art.icons.orb[p.element];
        // a shot carrying Power is drawn large, whatever its size in the rules
        const mine = !p.hostile;
        const power = mine && p.words.includes('power');
        const volatile = mine && p.words.includes('volatile');
        const scale = mote ? (power ? 1.8 : 1) : p.r > 0.4 || power ? 2 : 1;
        const sp = frames[Math.floor(p.age * 12) % frames.length];
        // Volatile will not hold still
        const jx = volatile ? Math.round((Math.random() - 0.5) * 3) : 0;
        const jy = volatile ? Math.round((Math.random() - 0.5) * 3) : 0;
        if (mine && p.words.includes('swift')) {
          // Swift: the shot smears out behind itself
          for (let k = 1; k <= 3; k++) {
            const bx = p.x - p.vx * 0.022 * k;
            const by = p.y - p.vy * 0.022 * k;
            this.stand(p.x + p.y - 0.01 * k, sp, wx(cam, bx, by), wy(cam, bx, by) - 10, null, 0, scale, 0.5 - k * 0.13);
          }
        }
        // the word's own colour is laid over the orb, so it can be told apart in the air:
        // the mirror's shot of a Twin pair teal, Leeching blood red, Volatile flickering, Swift pale green
        let tint: string | null = null;
        let tintA = 0;
        if (mine && p.n > 0) {
          tint = P.tl5;
          tintA = 0.6;
        } else if (mine && p.words.includes('leech')) {
          tint = P.bl4;
          tintA = 0.6;
        } else if (volatile) {
          tint = Math.floor(t * 20) % 2 === 0 ? P.white : P.pu5;
          tintA = 0.55;
        } else if (mine && p.words.includes('swift')) {
          tint = P.gn5;
          tintA = 0.3;
        }
        // (a familiar's bolt leaves from where the familiar hangs, and sinks to the height shots fly at)
        const lift = mote ? 10 + (FAMILIAR_HOVER - 10) * Math.max(0, 1 - p.age / 0.18) : 10;
        this.stand(p.x + p.y, sp, sx + jx, sy - lift + jy, tint ? silhouette(sp, tint) : null, tintA, scale);
      }
    }

    // (THE FOREST AS A FEW PICTURES: a chunk that something comes between, or that is seen through, drawn as its trees after all)
    this.resolveTops();
    // (ACT 2, behind ACT2_WALLS: who is seen through the walls standing whole, where: the hero, and the monsters in sight)
    const wins = this.openGround ? this.wallWins(game) : [];
    this.wallWindows.begin();
    // (ACT 2, THE GATE WARD: each house walked into whole over what stands in it, under what stands outside, faded while he is in it)
    this.houses.lay(
      stands,
      cam.ox,
      cam.oy,
      h.x,
      h.y,
      t,
      (d, s, x, y, a, holes) => {
        this.stand(d, s, x, y, null, 0, 1, a);
        if (holes) this.stands[this.stands.length - 1].holes = holes;
      },
      (key, d, x, y, w, hh) => this.wallWindows.holesOf(key, d, x, y, w, hh, wins, t),
    );
    // (ACT 2, behind ACT2_WALLS: the walls toward the eye standing whole among what stands, seen through round whoever is behind them)
    if (this.openGround) this.layWalls(wins, W, H, t);
    stands.sort((a, b) => a.d - b.d || a.q - b.q);
    fx.heroShape = null;
    let cut = false;
    for (const st of stands) {
      if (st.skip) continue;
      const s = st.s;
      // (a thing that stands behind raised ground: the screen is shut to it where that ground is)
      if (cut) {
        g.restore();
        cut = false;
      }
      if (st.hide && relief) {
        g.save();
        for (const i of st.hide) {
          g.beginPath();
          g.rect(0, 0, W, H);
          this.blockPath(g, relief, i, Math.min(0, st.hideBase ?? 0));
          g.clip('evenodd');
        }
        cut = true;
      }
      if (st.alpha !== 1) g.globalAlpha = Math.max(0, st.alpha);
      // (light, drawn added to what is under it: floor 1's daylight in the air)
      if (st.add) {
        g.globalCompositeOperation = 'lighter';
        g.drawImage(s.img, st.x - s.ax, st.y - s.ay, s.w, s.h);
        g.globalCompositeOperation = 'source-over';
        g.globalAlpha = 1;
        continue;
      }
      // (ACT 2: a bit of a wall standing whole, seen through round whoever is behind it)
      if (st.holes) {
        drawHoled(g, s.img as HTMLCanvasElement, st.x - s.ax, st.y - s.ay, s.w, s.h, st.holes, WINDOW_FAINT);
        g.globalAlpha = 1;
        continue;
      }
      // (a tree of a chunk drawn as its trees: only what of it is in the chunk's column, the rest being in its neighbours' pictures)
      if (st.clip0 !== undefined && st.clip1 !== undefined) {
        const left = st.x - s.ax;
        const a = Math.max(left, st.clip0);
        const b = Math.min(left + s.w, st.clip1);
        const dn = s.density ?? 1;
        if (b > a) g.drawImage(s.img, (a - left) * dn, 0, (b - a) * dn, s.h * dn, a, st.y - s.ay, b - a, s.h);
        g.globalAlpha = 1;
        continue;
      }
      if (st.scale !== 1) {
        const x = Math.round(st.x - s.ax * st.scale);
        const y = Math.round(st.y - s.ay * st.scale);
        const w = Math.round(s.w * st.scale);
        const h = Math.round(s.h * st.scale);
        g.drawImage(s.img, x, y, w, h);
        if (st.over) {
          g.globalAlpha = st.overA;
          g.drawImage(st.over.img, x, y, w, h);
        }
        g.globalAlpha = 1;
        continue;
      }
      // (the size is given so that art at the finer grain is laid down at its size in game pixels)
      if (s.aura && st.alpha === 1) drawAura(g, s, st.x, st.y);
      if (st.figure) st.figure.tails.draw(g, st.x, st.y, false);
      // (the hero in the middle of a turn is drawn narrower: see Figure)
      const [left, wide] = st.figure ? st.figure.span(s, st.x) : [st.x - s.ax, s.w];
      if (st.phase > 0) {
        // out of phase: in slices two pixels tall, each pulled the other way from the one above it
        const d = s.density ?? 1;
        const top = st.y - s.ay;
        for (let j = 0; j * 2 < s.h; j++) {
          const tall = Math.min(2, s.h - j * 2);
          const off = Math.round((j % 2 === 0 ? 1 : -1) * st.phase * (PHASE_APART - (j % 3) * 2));
          g.drawImage(s.img, 0, j * 2 * d, s.w * d, tall * d, left + off, top + j * 2, wide, tall);
        }
        if (st.figure) st.figure.tails.draw(g, st.x, st.y, true);
        g.globalAlpha = 1;
        continue;
      }
      g.drawImage(s.img, left, st.y - s.ay, wide, s.h);
      // (where the hero stands in the picture: a beam held away up the screen passes behind them)
      if (st.figure && st.alpha === 1) fx.heroShape = { img: s.img, x: left, y: st.y - s.ay, w: wide, h: s.h, W, H };
      if (st.over) {
        g.globalAlpha = st.overA;
        g.drawImage(st.over.img, left, st.y - s.ay, wide, s.h);
        g.globalAlpha = 1;
      }
      if (st.figure) st.figure.tails.draw(g, st.x, st.y, true);
      g.globalAlpha = 1;
    }
    if (cut) g.restore();
    for (const m of this.marks) {
      // ice round the frozen: icicles at the feet and glints on the block
      for (let i = 0; i < 5; i++) {
        const px = Math.round(m.x - 7 + i * 3.5 + hash2(i, m.seed, 1) * 2);
        const tall = 3 + Math.round(hash2(i, m.seed, 2) * 4);
        g.fillStyle = P.bu4;
        g.fillRect(px + 1, m.y - tall + 2, 1, tall);
        g.fillStyle = P.white;
        g.fillRect(px, m.y - tall + 1, 1, tall);
      }
      g.fillStyle = P.white;
      for (let i = 0; i < 3; i++) {
        if (hash2(i, m.seed, Math.floor(t * 6)) > 0.5) continue;
        g.fillRect(Math.round(m.x - 5 + hash2(i, m.seed, 3) * 10), Math.round(m.y - 6 - hash2(i, m.seed, 4) * 18), 2, 1);
      }
    }

    // (THE NEW MONSTERS: what is on the screen, or near enough to it to be seen in the air over it)
    const onScreen = (x: number, y: number, up = 0): boolean => {
      const px = wx(cam, x, y);
      const py = wy(cam, x, y) - up;
      return px > -40 && px < W + 40 && py > -40 && py < H + 40;
    };
    // (THE NEW MONSTERS: a Golem's skull in the air, tumbling, over everything it flies over)
    for (const z of game.zones) {
      if (z.kind !== 'skull' || z.t >= z.dur) continue;
      const s = skullAt(z);
      if (!onScreen(s.x, s.y, s.z)) continue;
      const frames = art.bestiary.of('golem').front.clips?.moves?.skull?.frames;
      if (!frames || frames.length === 0) continue;
      const sp = frames[Math.floor(z.t * 16) % frames.length];
      g.drawImage(sp.img, Math.round(wx(cam, s.x, s.y)) - sp.ax, Math.round(wy(cam, s.x, s.y) - s.z) - sp.ay, sp.w, sp.h);
    }
    // arrows are drawn as short lines so they can point any way; a Swift orb gets its tail here too
    for (const p of game.projectiles) {
      // (THE WARLOCK's bolt: his fire on its side, render/warlock_fx.ts)
      if (p.look === 'hellbolt') {
        if (onScreen(p.x, p.y)) fx.warlock.drawBolt(g, cam, p);
        continue;
      }
      // (UNIQUE ITEMS, behind a switch that is off: the Windcutter's blade, a blade of wind and not the Mage's Wave: render/unique_fx.ts)
      if (p.blade && UNIQUE_PLAY.wind) {
        if (onScreen(p.x, p.y)) fx.uniques.drawBlade(g, cam, p, t);
        continue;
      }
      // (THE MAGE'S BALL and SPEAR, game/swap_moves.ts: render/swap_fx.ts)
      if (p.look === 'ball' || p.look === 'mspear') {
        if (onScreen(p.x, p.y)) (p.look === 'ball' ? drawBall : drawSpear)(g, cam, p.x, p.y, p.vx, p.vy, p.element, t, p.flown);
        continue;
      }
      // (THE RANGER'S SNIPE: the streak behind the arrow it loosed, under the arrow)
      if (!p.hostile && p.look === 'arrow' && game.hero.skills[p.skill]?.id === 'snipe' && onScreen(p.x, p.y)) drawSnipeStreak(g, cam, p.x, p.y, p.vx, p.vy);
      // (THE NEW MONSTERS: a Boneward's spear, flying low from its hand to where it comes down)
      if (p.look === 'spear') {
        const v = Math.hypot(p.vx, p.vy) || 1;
        if (onScreen(p.x, p.y)) drawSpearShot(g, this.floorAt, p.x, p.y, spearHeight(p), p.vx / v, p.vy / v);
        continue;
      }
      // (THE NEW MONSTERS: the bone marksman's great arrow, burning, a streak of light behind it)
      if (p.look === 'great') {
        const v = Math.hypot(p.vx, p.vy) || 1;
        if (onScreen(p.x, p.y)) drawGreatArrow(g, this.floorAt, p.x, p.y, AIM.z, p.vx / v, p.vy / v, t);
        continue;
      }
      // (THE WARRIOR'S BATTLE AXE: his thrown axe spinning flat, the art chat's pictures of it, art/warrior_up_axe_moves.ts axeFlying,
      // a turn in AXE_FLIGHT.turn seconds; its anchor the floor under it. Where his pictures are not his own, the stand-in)
      if (p.look === 'axe') {
        if (onScreen(p.x, p.y)) {
          if (WARRIOR_UP.on) {
            const fly = (this.axeFly ??= axeFlying());
            const sp = fly[Math.floor((p.age / AXE_FLIGHT.turn) * fly.length) % fly.length];
            g.drawImage(sp.img, Math.round(wx(cam, p.x, p.y) - sp.ax), Math.round(wy(cam, p.x, p.y) - sp.ay), sp.w, sp.h);
          } else drawThrownAxe(g, wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 12, p.age);
        }
        continue;
      }
      // (a hero's arrow, with the ranger's new pictures: from where the arrow on his string was, at its height: game/defs.ts, RANGER_ARROW)
      const lifted = RANGER_ARROW.on && p.look === 'arrow' && !p.hostile;
      if (lifted && 0.4 + p.age * Math.hypot(p.vx, p.vy) < RANGER_ARROW.from) continue;
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y) - (lifted ? Math.round(RANGER_ARROW.height) : 10);
      const dx = (p.vx - p.vy) * 16;
      const dy = (p.vx + p.vy) * 8;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      const mine = !p.hostile;
      const swift = mine && p.words.includes('swift');
      // Twin: the second shot of the pair is the mirror's, teal from end to end
      const twin = mine && p.n > 0;
      if (p.look === 'wave') {
        // A wave of force: a crescent of light bowed the way it travels, thinner toward its tips.
        // It swells out of the staff in its first moments and thins away over the end of its flight.
        // Drawn point by point along its front, in the world, so it lies right whichever way it goes.
        const sp = Math.hypot(p.vx, p.vy) || 1;
        const fwx = p.vx / sp;
        const fwy = p.vy / sp;
        const power = mine && p.words.includes('power');
        const volatile = mine && p.words.includes('volatile');
        const leech = mine && p.words.includes('leech');
        const tones = twin ? [P.tl2, P.tl4, P.tl5, P.white] : leech ? [P.bl2, P.bl4, P.bl5, P.white] : SPELL_TONES[p.element];
        const span = 0.95;
        const R = p.r / Math.sin(span);
        const born = Math.min(1, p.age / 0.09);
        const fade = Math.max(0, Math.min(1, p.dist / 1.8));
        const layers = power ? 8 : 7;
        const jx = volatile ? Math.round((Math.random() - 0.5) * 2) : 0;
        const jy = volatile ? Math.round((Math.random() - 0.5) * 2) : 0;
        // IT FLOWS ALONG THE GROUND (from Version 15.1; the owner, of the Wave, on his page of
        // notes: "flow on the ground"). Up to 15.0 it was a crescent hanging ten pixels over the
        // floor with its shadow under it. Now it is on the floor: a crest that stands up from it
        // in front, highest in the middle, and behind the crest the body of the wave lying flat
        // and streaming back, darker and thinner the further back, with gaps that run along it
        // so that it is seen to flow; and two ripples that it leaves on the floor behind it.
        const run = Math.floor(t * 24);
        // (BIG AND WILD, art/moves3.ts WILD: it stands up tall and boils: render/wild.ts)
        if (WILD.on) drawWildWave(g, cam, p, tones, t, jx, jy);
        else for (let j = layers + 2; j >= 0; j--) {
          // (the last two are the ripples left behind: thin, faint, and a way back)
          const ripple = j > layers;
          const back = ripple ? layers + (j - layers) * 4 : j;
          const rj = R - back * 0.085;
          const sj = span * Math.max(0.2, 1 - back * (ripple ? 0.045 : 0.08)) * (0.45 + 0.55 * born);
          g.fillStyle = back === 0 ? tones[3] : back <= 2 ? tones[2] : back <= 4 ? tones[1] : tones[0];
          g.globalAlpha = ripple ? 0.28 * fade * born : fade * (back < 3 ? 1 : back < 5 ? 0.8 : 0.5);
          const steps = Math.max(6, Math.ceil(sj * rj * 2 * 20));
          for (let k = 0; k <= steps; k++) {
            // (the gaps that run along the body of it, and the breaks in a ripple)
            if (back >= 3 && (k + run * (j % 2 === 0 ? 1 : -1) + j * 3) % (ripple ? 3 : 5) === 0) continue;
            const a = -sj + (2 * sj * k) / steps;
            const ca = Math.cos(a) * rj - R;
            const sa = Math.sin(a) * rj;
            const qx = p.x + fwx * ca - fwy * sa;
            const qy = p.y + fwy * ca + fwx * sa;
            // the crest stands up from the floor, most in the middle of the wave; the rest lies on it
            const mid = 1 - Math.abs(a) / sj;
            const up = back === 0 ? 2 + Math.round(4 * mid * born) : back === 1 ? 1 + Math.round(2.5 * mid * born) : back === 2 ? 1 : 0;
            g.fillRect(Math.round(wx(cam, qx, qy)) + jx, Math.round(wy(cam, qx, qy)) - up + jy, 2, back <= 1 ? 2 + (back === 0 ? Math.round(2 * mid) : 0) : 1);
          }
        }
        g.globalAlpha = 1;
        if (swift) {
          // Swift: it leaves a pale streak from each tip
          for (const side of [-1, 1]) {
            const tx0 = p.x - fwy * p.r * 0.7 * side;
            const ty0 = p.y + fwx * p.r * 0.7 * side;
            pline(g, wx(cam, tx0 - fwx * 1.1, ty0 - fwy * 1.1), wy(cam, tx0 - fwx * 1.1, ty0 - fwy * 1.1) - 2, wx(cam, tx0 - fwx * 0.3, ty0 - fwy * 0.3), wy(cam, tx0 - fwx * 0.3, ty0 - fwy * 0.3) - 2, twin ? P.tl3 : P.gn4);
          }
        }
        continue;
      }
      if (p.look === 'dart') {
        // (THE TRAPS) a dart of a dart wall: a short iron shaft with a pale point, at the height of the
        // slot it left; no light of its own, and no colour of a friend's or an enemy's
        const hy = sy - 3;
        // (a faint streak where it has just been, the shaft, and its point)
        g.globalAlpha = 0.35;
        pline(g, sx - ux * 16, hy - uy * 16, sx - ux * 9, hy - uy * 9, P.sl4);
        g.globalAlpha = 1;
        pline(g, sx - ux * 9, hy - uy * 9, sx, hy, P.sl4);
        pline(g, sx - ux * 9, hy - uy * 9 + 1, sx - ux * 2, hy - uy * 2 + 1, P.sl2);
        g.fillStyle = P.white;
        g.fillRect(Math.round(sx), Math.round(hy) - 1, 2, 2);
        g.fillStyle = P.black;
        g.globalAlpha = 0.3;
        g.fillRect(Math.round(sx - 3), Math.round(sy + 10), 5, 1);
        g.globalAlpha = 1;
        continue;
      }
      if (p.look !== 'arrow') {
        if (swift) {
          pline(g, sx - ux * 30, sy - uy * 30, sx - ux * 7, sy - uy * 7, twin ? P.tl3 : P.gn4);
          pline(g, sx - ux * 17, sy - uy * 17, sx - ux * 7, sy - uy * 7, P.white);
        }
        continue;
      }
      const cols = elementColors(p.element, false);
      const power = mine && p.words.includes('power');
      const leech = mine && p.words.includes('leech');
      const volatile = mine && p.words.includes('volatile');
      const flick = Math.floor(t * 20) % 2 === 0;
      // (BIG AND WILD, art/moves3.ts WILD: a hero's arrow streaks light behind it: render/wild.ts)
      if (WILD.on && mine) drawWildArrow(g, sx, sy, ux, uy);
      // Swift: a long pale streak behind the arrow
      if (swift) pline(g, sx - ux * 24, sy - uy * 24, sx - ux * 6, sy - uy * 6, twin ? P.tl3 : P.gn4);
      const body = (power ? 10 : swift ? 9 : leech || volatile || twin ? 8 : 6) + (lifted ? RANGER_ARROW.long - 6 : 0);
      // the shaft takes the colour of the word it carries
      const shaft = p.hostile ? P.bn3 : twin ? P.tl4 : power ? P.fr5 : swift ? P.gn5 : leech ? P.bl4 : volatile ? (flick ? P.pu5 : P.pu4) : P.wd5;
      const jx = volatile ? Math.round((Math.random() - 0.5) * 2) : 0;
      const jy = volatile ? Math.round((Math.random() - 0.5) * 2) : 0;
      pline(g, sx - ux * body + jx, sy - uy * body + jy, sx + jx, sy + jy, shaft);
      g.fillStyle = p.hostile ? P.bl4 : twin ? P.tl5 : power ? P.white : p.element !== 'phys' ? cols[cols.length - 2] : leech ? P.bl5 : volatile ? P.white : P.sl5;
      if (power) g.fillRect(Math.round(sx) - 1, Math.round(sy) - 1, 3, 3);
      else g.fillRect(Math.round(sx) + jx, Math.round(sy) + jy, 2, 2);
      g.fillStyle = P.black;
      g.globalAlpha = 0.35;
      g.fillRect(Math.round(sx - 2), Math.round(sy + (lifted ? Math.round(RANGER_ARROW.height) : 10)), 4, 1);
      g.globalAlpha = 1;
    }

    // (THE FIRST FIVE FLOORS: what the bosses send over what stands: chains, shards, fire)
    this.bossFx.air(g, this.floorAt, game, (x, y) => onScreen(x, y) && game.level.visible[Math.floor(y) * game.level.floor.w + Math.floor(x)] === 1);

    // (ACT 2, THE BELLS: the Hush over its ground, under the dark: render/bells.ts)
    if (game.level.bells) this.bellsLook.fog(g, this.cam, game.level, t);

    // (THE CAMP, game/camp.ts: dusk's warm light over everything, as the art chat's pictures have it: src/dev/preview_hub2.ts dusk)
    if (isCamp(game.level)) {
      g.save();
      g.globalCompositeOperation = 'soft-light';
      g.fillStyle = 'rgba(255, 160, 90, 0.38)';
      g.fillRect(0, 0, W, H);
      g.restore();
    }
    // ---- darkness, with holes cut by every light ----------------------------------------------
    this.light(W, H, game, t, fx);
    g.drawImage(this.dark, 0, 0);
    // (FLOOR 3, THE BLACK IRON PRISON: the warm glow of its fires over the dark: render/prison.ts)
    if (this.lookNow) {
      const L3 = game.level;
      const lights3 = this.lookNow.lights(L3);
      // (THE STEADY GLOWS, the day's, AS ONE PICTURE where the look says the place is steady: render/still_glows.ts; those that flicker one by one, as ever)
      const asOne = this.lookNow.steady === true && this.stillGlows.draw(g, this.cam, W, H, L3, lights3);
      for (const q of lights3) {
        if (!q.glow || !L3.explored[Math.floor(q.y) * L3.floor.w + Math.floor(q.x)]) continue;
        if (asOne && q.still === true) continue;
        const gx = wx(this.cam, q.x, q.y) + (q.dx ?? 0);
        const gy = wy(this.cam, q.x, q.y) - q.up;
        if (gx < -q.glow.r || gx > W + q.glow.r || gy < -q.glow.r || gy > H + q.glow.r) continue;
        drawGlow(g, gx, gy, q.still ? q.glow.r : q.glow.r + Math.sin(t * 9 + q.y * 5) * 1.5, q.glow.color, q.glow.a);
      }
      const ex = L3.ways?.exit;
      const ef = ex ? this.dress.exitFilm(game) : null;
      if (ex && ef && prisonDoorTiles(L3.floor, ex).some((i) => L3.explored[i] === 1 || L3.explored[ex.alongX ? i + L3.floor.w : i + 1] === 1)) {
        const A = prisonDoorAnchor(ex);
        const ax = wx(this.cam, A.x, A.y);
        const ay = wy(this.cam, A.x, A.y);
        for (const q of this.prison.exitLights(ex.alongX, FloorDress.exitFrame(ex, ef.frames.length))) if (q.glow) drawGlow(g, ax + q.dx, ay + q.dy, q.glow.r + Math.sin(t * 9 + q.dy) * 1.5, q.glow.color, q.glow.a);
      }
    }
    // (what of the act's kinds shines in the dark: the Physician's spotlight and his instruments in it, his lens's beam)
    this.bossFx.glow(g, this.floorAt, game, (x, y) => onScreen(x, y) && game.level.visible[Math.floor(y) * game.level.floor.w + Math.floor(x)] === 1);
    // (ACT 2, THE BELLS: the bells still to ring, off the screen, marked at its edge)
    if (game.level.bells) this.bellsLook.arrows(g, this.cam, game.level, W, H, t);

    // ---- things that glow, then text ----------------------------------------------------------
    // what shines on the hero (a lit blade, a crystal, a feather)
    if (this.heroLit) this.figure.lights(g, this.heroLit.x, this.heroLit.y);
    // and on the monsters: eyes in the dark, a cultist's fire, the Warden's maul going hot
    for (const q of this.monsterLit) drawLights(g, q.s, q.x, q.y);
    // and on what stands in the dungeon: a brazier's fire, an open portal
    for (const q of this.propLit) drawLights(g, q.s, q.x, q.y);
    // (the Meldstone in the wordsmith's ring, drawn again over the light, so that it is seen in it; not where the hero stands before it)
    // (part way: the light still falls on it, but no longer washes it out)
    for (const q of this.overLit) {
      const s = q.s;
      const hx = wx(cam, h.x, h.y);
      const hy = wy(cam, h.x, h.y);
      // (the stone itself is about 14 game pixels across and 18 high, round its middle; its picture is wider, for its bolts)
      const near = Math.abs(hx - q.x) < 7 * q.scale + 10 && hy > q.y - 9 * q.scale && hy - 34 < q.y + 9 * q.scale;
      if (h.x + h.y > q.d && near) continue;
      g.globalAlpha = 0.6;
      g.drawImage(s.img, Math.round(q.x - s.ax * q.scale), Math.round(q.y - s.ay * q.scale), Math.round(s.w * q.scale), Math.round(s.h * q.scale));
      g.globalAlpha = 1;
    }
    // A beam that is being held (the owner: "Fires towards your finger ... You can move the beam
    // around in different directions as long as you hold down"). The rules bite along it five
    // times a second; the picture of it is told where it runs every frame, so it turns with the
    // finger. From the hero, the way they face, to the first wall. A Twin pair shows both.
    const ch = h.channel;
    const beaming = ch ? h.skills[ch.skill] : null;
    if (ch && beaming && SKILLS[beaming.id].kind === 'beam') {
      const def = SKILLS[beaming.id];
      const half = def.radius * beaming.r.size;
      const words = withParts(beaming.front);
      for (let n = 0; n < beaming.r.count; n++) {
        const off = beaming.r.count === 1 ? 0 : (n - (beaming.r.count - 1) / 2) * (half * 2 + 0.3);
        let ox = h.x - h.fy * off;
        let oy = h.y + h.fx * off;
        if (off !== 0 && game.level.open[Math.floor(oy) * game.level.floor.w + Math.floor(ox)] !== 1) {
          ox = h.x;
          oy = h.y;
        }
        const end = game.beamEnd(ox, oy, h.fx, h.fy, def.range);
        // (it leaves the wand a little way out from the hero's middle)
        fx.holdBeam(n, ox + h.fx * 0.45, oy + h.fy * 0.45, end.x, end.y, beaming.r.element, words);
      }
    }
    const wisps: number[] = [];
    for (const z of game.zones) {
      if (z.kind !== 'storm' || this.skip.has('cloud') || ownsZone(z)) continue;
      // Lightning behind: a thundercloud hangs over its patch of ground and flickers
      // (the small patches a shot leaves along its path get a wisp of cloud each, lower down, so a
      // trail of them does not roof the whole room over)
      const small = z.r < 1.2;
      if (small) {
        // one wisp serves the small patches near it
        let near = false;
        for (let i = 0; i < wisps.length && !near; i += 2) near = Math.abs(wisps[i] - z.x) < 1.5 && Math.abs(wisps[i + 1] - z.y) < 1.5;
        if (near) continue;
        wisps.push(z.x, z.y);
      }
      const fade = Math.min(1, z.t / 0.2, (z.dur - z.t) * 2);
      const seed = Math.floor(z.x * 7 + z.y * 13);
      const v = seed % 5;
      const wk = Math.round(Math.min(1.4, z.r) * 8);
      const wide = (wk / 8) * (small ? 12 : 17);
      // THE CLOUD ROILS (from Version 15.1; the owner listed "Storm cloud" among the animations to
      // better on his page of notes). Up to 15.0 it was one picture of a cloud, painted once and
      // slid two pixels from side to side, with a line of light along its underside now and
      // then. Now every puff of it is drawn where it is this instant: it billows out from the
      // middle as the cloud forms, each puff turns slowly about its own place and swells and
      // shrinks, the lightning is INSIDE it (one puff and its neighbours lit from within, a
      // different one each flicker), and at the end it thins and lifts away.
      const born = Math.min(1, z.t / 0.35);
      const going = Math.max(0, Math.min(1, (z.dur - z.t) / 0.5));
      const cx = Math.round(wx(cam, z.x, z.y) + Math.sin(t * 0.8 + seed) * 2);
      const cy = Math.round(wy(cam, z.x, z.y)) - (small ? 40 : 50) - Math.round((1 - going) * 6);
      const puffs = small ? 3 : 9;
      const beat = Math.floor(t * 12);
      const struck = hash2(seed, beat, 4) < 0.4 ? Math.floor(hash2(seed, beat, 5) * puffs) : -1;
      g.globalAlpha = (small ? 0.75 : 0.92) * fade;
      for (let i = 0; i < puffs; i++) {
        const churn = t * (0.7 + hash2(i, v, 6) * 0.6) + i * 2.1;
        const ox = ((hash2(i, v, 1) - 0.5) * wide * 2 + Math.sin(churn) * 2.5) * (0.35 + 0.65 * born);
        const oy = (hash2(i, v, 2) - 0.5) * (small ? 4 : 7) + Math.cos(churn * 0.8) * 1.4;
        const r = Math.max(1, ((small ? 5 : 7) + hash2(i, v, 3) * (small ? 3 : 6) + Math.sin(churn * 1.3) * 0.9) * (0.4 + 0.6 * born) * (0.5 + 0.5 * going));
        const px = Math.round(cx + ox);
        const py = Math.round(cy + oy);
        // pale tops, dark bellies; a belly with the lightning in it glows, and its neighbours a little
        g.fillStyle = P.st5;
        g.beginPath();
        g.ellipse(px, py - 2, r, r * 0.55, 0, 0, Math.PI * 2);
        g.fill();
        const near = struck >= 0 ? Math.abs(i - struck) : 9;
        g.fillStyle = near === 0 ? P.lt4 : near === 1 ? P.lt3 : i % 2 === 0 ? P.st2 : P.st3;
        g.beginPath();
        g.ellipse(px, py, r, r * 0.55, 0, 0, Math.PI * 2);
        g.fill();
        if (near === 0) {
          g.fillStyle = P.white;
          g.beginPath();
          g.ellipse(px, py + 1, r * 0.5, r * 0.22, 0, 0, Math.PI * 2);
          g.fill();
        }
      }
      // ... and when it is, the underside of the whole cloud catches the light
      if (struck >= 0) {
        g.fillStyle = P.lt3;
        g.fillRect(Math.round(cx - wide * 0.7), Math.round(cy + 5), Math.round(wide * 1.4), 1);
      }
      g.globalAlpha = 1;
    }
    for (const z of game.zones) {
      if (z.kind !== 'venom' || this.skip.has('cloud') || ownsZone(z) || ownsZoneV3(z)) continue;
      // Poison behind: puffs of it turn slowly over the slick, low enough to stand in
      const fade = Math.min(1, z.t / 0.25, (z.dur - z.t) * 2);
      const seed = Math.floor(z.x * 7 + z.y * 13);
      const n = Math.round(4 + z.r * 2);
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + t * (0.25 + hash2(i, seed, 1) * 0.3) * (i % 2 === 0 ? 1 : -1);
        const d = z.r * (0.25 + hash2(i, seed, 2) * 0.55);
        const px = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d));
        const py = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - 6 - Math.round(hash2(i, seed, 3) * 8 + Math.sin(t * 1.3 + i) * 2);
        const rr = 5 + hash2(i, seed, 4) * 5;
        g.globalAlpha = (0.2 + hash2(i, seed, 5) * 0.14) * fade;
        g.fillStyle = i % 3 === 0 ? P.vn4 : P.vn3;
        g.beginPath();
        g.ellipse(px, py, rr * 1.5, rr * 0.8, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }
    for (const z of game.zones) {
      if (z.kind !== 'steam' || this.skip.has('cloud') || ownsZone(z)) continue;
      // (WORDMELDING, behind MELD) Scald behind: steam billows up off the wet floor, thick enough
      // that what stands in it can't see out
      const fade = Math.min(1, z.t / 0.25, (z.dur - z.t) * 2);
      const seed = Math.floor(z.x * 7 + z.y * 13);
      const n = Math.round(8 + z.r * 5);
      for (let i = 0; i < n; i++) {
        const life = (t * (0.35 + hash2(i, seed, 1) * 0.25) + hash2(i, seed, 6)) % 1;
        const a = hash2(i, seed, 7) * Math.PI * 2;
        const d = z.r * (0.1 + hash2(i, seed, 2) * 0.8);
        const px = Math.round(wx(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d) + Math.sin(t * 1.1 + i) * 3);
        const py = Math.round(wy(cam, z.x + Math.cos(a) * d, z.y + Math.sin(a) * d)) - 3 - Math.round(life * 30);
        const rr = 5 + hash2(i, seed, 4) * 5 + life * 8;
        g.globalAlpha = (0.3 + hash2(i, seed, 5) * 0.16) * fade * Math.min(1, (1 - life) * 2.5, life * 6);
        g.fillStyle = i % 3 === 0 ? P.white : P.st7;
        g.beginPath();
        g.ellipse(px, py, rr * 1.3, rr, 0, 0, Math.PI * 2);
        g.fill();
      }
      g.globalAlpha = 1;
    }
    // (THE NEW WORDS, a mock-up behind a switch that is off: what glows over the dark)
    if (WORDS3.on && !this.skip.has('fx')) air3(g, cam, t, game, fx);
    if (MELD3.on && !this.skip.has('fx')) airM3(g, cam, t, game);
    if (BINDING3.on && !this.skip.has('fx')) airB3(g, cam, t, game);
    if (VOLATILE3.on && !this.skip.has('fx')) airV3(g, cam, t, game);
    if (WORDS7_LOOK.on && !this.skip.has('fx')) airW7(g, cam, t, game);
    if (WORDS10_LOOK.on && !this.skip.has('fx')) airW10(g, cam, t, game);
    if (!this.skip.has('fx')) fx.drawAir(g, cam);
    // (THE VETERAN's over everything: his smears, his force, the bursts of his blows; his globes: render/veteran_fx.ts)
    if (!this.skip.has('fx')) this.vetFx.drawAir(g, cam, game);
    // (THE RANGER'S RALLY, over the figures: render/swap_fx.ts)
    if (SWAP_MOVES.on && !this.skip.has('fx')) drawRallyAir(g, cam, game, t);
    if (MELD3.on && !this.skip.has('fx')) overM3(g, cam, t);
    if (VOLATILE3.on && !this.skip.has('fx')) overV3(g, cam, t);
    if (!game.scene) this.drawWordDrops(g, W, H, game, t);
    this.drawBeacon(g, game, t);
    this.drawBars(g, game, t);
    // (QUESTS610: not while a short scene plays: the picture is the town's)
    if (!game.scene) this.drawLabels(g, W);
    if (!game.scene) for (const m of this.questMarks) drawQuestMark(g, Math.round(m.x), Math.round(m.y), t);
    fx.drawText(g, cam);
    return cam;
  }

  /** A shaft of light standing on a point of the floor: bright at its foot, thinning as it climbs. */
  private shaft(g: CanvasRenderingContext2D, sx: number, sy: number, tall: number, color: string, t: number, grow: number): void {
    for (let i = 0; i < tall * grow; i += 2) {
      const k = 1 - i / tall;
      g.globalAlpha = 0.32 * k * (0.8 + 0.2 * Math.sin(t * 9 + i * 0.4));
      g.fillStyle = color;
      g.fillRect(sx - 3, sy - 8 - i, 7, 2);
      g.globalAlpha = 0.55 * k;
      g.fillStyle = P.white;
      g.fillRect(sx, sy - 8 - i, 1, 2);
    }
    g.globalAlpha = 1;
  }

  /**
   * The fallen wordsmith, while it has not been searched: a ring that breathes round it, and (for a
   * new player being shown the game) a shaft of light standing on it and the word SEARCH.
   */
  private drawBeacon(g: CanvasRenderingContext2D, game: Game, t: number): void {
    const b = game.level.body;
    if (!b || b.state !== 0) return;
    const f = game.level.floor;
    if (!game.level.explored[b.ty * f.w + b.tx]) return;
    const cam = this.cam;
    const sx = Math.round(wx(cam, b.x, b.y));
    const sy = Math.round(wy(cam, b.x, b.y));
    const beat = 0.5 + 0.5 * Math.sin(t * 4);
    g.strokeStyle = P.tl4;
    for (let k = 0; k < 2; k++) {
      g.globalAlpha = k === 0 ? 0.7 : 0.35 * (1 - beat);
      g.beginPath();
      g.ellipse(sx + 0.5, sy + 0.5, 17 + k * (4 + beat * 8), (17 + k * (4 + beat * 8)) * 0.5, 0, 0, Math.PI * 2);
      g.stroke();
    }
    g.globalAlpha = 1;
    if (game.guideStep() !== 'body') return;
    this.shaft(g, sx, sy + 4, 52, P.tl5, t, 1);
    const tw = textWidth('SEARCH');
    const py = sy - 46 + Math.round(Math.sin(t * 3) * 1.5);
    g.fillStyle = P.tl4;
    g.fillRect(sx - Math.floor(tw / 2) - 4, py, tw + 8, 13);
    g.fillStyle = '#1b1622';
    g.fillRect(sx - Math.floor(tw / 2) - 3, py + 1, tw + 6, 11);
    drawText(g, 'SEARCH', sx - Math.floor(tw / 2), py + 3, P.tl5);
  }

  /**
   * A word lying on the floor is an event, not a piece of loot among others: it stands in a shaft
   * of its own light, with its name on a plate above it that can be read from across the room.
   */
  private drawWordDrops(g: CanvasRenderingContext2D, W: number, H: number, game: Game, t: number): void {
    const cam = this.cam;
    const L = game.level;
    const f = L.floor;
    for (const dr of game.drops) {
      if (dr.kind !== 'word' || !dr.word) continue;
      if (!L.explored[Math.floor(dr.y) * f.w + Math.floor(dr.x)]) continue;
      const sx = Math.round(wx(cam, dr.x, dr.y));
      const sy = Math.round(wy(cam, dr.x, dr.y));
      if (sx < -40 || sx > W + 40 || sy < -10 || sy > H + 70) continue;
      const col = WORD_COLOR[dr.word];
      const grow = Math.min(1, Math.max(0, dr.age) / 0.35);
      this.shaft(g, sx, sy, 50, col, t + dr.x, grow);
      const name = WORDS[dr.word].name.toUpperCase();
      const tw = textWidth(name);
      const bob = Math.round(Math.sin(t * 3 + dr.x) * 1.5);
      const px = Math.max(1, Math.min(W - tw - 9, sx - Math.floor(tw / 2) - 4));
      const py = sy - 42 + bob - Math.round((1 - grow) * 8);
      g.fillStyle = col;
      g.fillRect(px, py, tw + 8, 13);
      g.fillStyle = '#1b1622';
      g.fillRect(px + 1, py + 1, tw + 6, 11);
      drawText(g, name, px + 4, py + 3, col);
    }
  }

  /** (ACT 1) Seen through while someone stands behind it: the hero (or a monster in sight) whose picture it covers, and whose feet are further up the screen. */
  private seeThrough(sp: Sprite, sx: number, sy: number, depth: number, heroX: number, heroY: number, heroD: number): number {
    const covers = (fx: number, fy: number): boolean => {
      const lx = fx - (sx - sp.ax);
      const ly = fy - (sy - sp.ay);
      return spriteCovers(sp, lx, ly - 14) || spriteCovers(sp, lx, ly - 28) || spriteCovers(sp, lx, ly - 3);
    };
    if (heroD < depth && covers(heroX, heroY)) return SEEN_THROUGH;
    for (const m of this.seenFoes) if (m.d < depth && covers(m.x, m.y)) return SEEN_THROUGH;
    return 1;
  }
  /** (ACT 1) The monsters in sight this frame, where their feet are on the screen (for what is seen through). */
  private seenFoes: { x: number; y: number; d: number }[] = [];

  /** (ACT 2, behind ACT2_WALLS) Which bits of the walls standing whole are seen through, and how far. */
  private readonly wallWindows = new WallWindows();
  /**
   * (ACT 2, behind ACT2_WALLS) THE WALLS TOWARD THE EYE STANDING WHOLE (render/act2_walls.ts): each bit over the screen stood at
   * its tiles' depth, as a wall tile is; where the hero or a monster in sight is behind one, a window cut in it round them.
   */
  private wallWins(game: Game): WallWindow[] {
    const cam = this.cam;
    const wins: WallWindow[] = [];
    const h = game.hero;
    wins.push({ x: wx(cam, h.x, h.y), y: wy(cam, h.x, h.y) - HERO_WINDOW.up, rx: HERO_WINDOW.rx, ry: HERO_WINDOW.ry, d: h.x + h.y });
    for (const m of game.monsters) {
      if (m.dead || !m.seen) continue;
      // (a window as big as the monster: a man's for most, more for the great ones)
      const rx = Math.min(70, 22 + 26 * m.r);
      const ry = rx * 1.3;
      wins.push({ x: wx(cam, m.x, m.y), y: wy(cam, m.x, m.y) - ry * 0.45, rx, ry, d: m.x + m.y });
    }
    return wins;
  }
  private layWalls(wins: readonly WallWindow[], W: number, H: number, t: number): void {
    const cam = this.cam;
    this.outdoor.wallBits(cam, W, H, (b, x, y, key) => {
      const w = b.w / 2;
      const hh = b.h / 2;
      if (x > W || y > H || x + w < 0 || y + hh < 0) return;
      const holes = this.wallWindows.holesOf(key, b.d, x, y, w, hh, wins, t);
      this.stand(b.d, { img: b.img as HTMLCanvasElement, w, h: hh, ax: 0, ay: 0 }, x, y);
      if (holes) this.stands[this.stands.length - 1].holes = holes;
    });
  }

  /** (ACT 1) What stands on the tops, for the ground's pieces on and round the screen. */
  private standTops(W: number, H: number, heroX: number, heroY: number, L: Game['level']): void {
    this.frameChunks.length = 0;
    this.seenChunks.length = 0;
    // (for measuring: the tops left out)
    if (this.skip.has('tops')) return;
    const T = this.outdoor.terrain();
    if (!T) return;
    const cam = this.cam;
    // (THE FOREST AS A FEW PICTURES: render/tops_cache.ts)
    if (TOPS_CACHE.on && !cam.lift && T.look.rise === 0 && L.act1 && TOPS_CACHE.floors.has(L.act1.floor)) {
      this.standTopsCached(T, L, W, H, heroX, heroY);
      return;
    }
    this.topsCache.leave(L);
    const x0 = -cam.ox * 2;
    const y0 = -cam.oy * 2;
    const i0 = Math.floor(x0 / GROUND_PIECE) - 1;
    const i1 = Math.floor((x0 + W * 2) / GROUND_PIECE) + 1;
    const j0 = Math.floor(y0 / GROUND_PIECE) - 1;
    // (a tall thing below the screen's foot reaches up into it)
    const j1 = Math.floor((y0 + H * 2) / GROUND_PIECE) + 3;
    const h = { d: 0 };
    void h;
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        for (const top of this.act1.topsOf(T, i, j)) {
          const sx = Math.round(wx(cam, top.x, top.y));
          const sy = Math.round(wy(cam, top.x, top.y) - top.lift);
          if (sx < -top.sp.w || sx > W + top.sp.w || sy < -10 || sy > H + top.sp.h) continue;
          this.stand(top.x + top.y, top.sp, sx, sy, null, 0, 1, top.tall ? this.seeThrough(top.sp, sx, sy, top.x + top.y, heroX, heroY, this.heroD) : 1);
        }
      }
    }
    if (this.outdoorFrame++ % 30 === 0) this.act1.forgetTops((i, j) => i >= i0 - 6 && i <= i1 + 6 && j >= j0 - 6 && j <= j1 + 6);
  }
  private outdoorFrame = 0;
  private heroD = 0;
  /** (EXITS) Where the hero's feet are on the screen this frame (for what the floors' dressing stands: `stage.veil`). */
  private heroFeet = { x: 0, y: 0 };

  /** (ACT 1) THE FOREST AS A FEW PICTURES (render/tops_cache.ts): its chunks; those drawn as pictures this frame; where the hero stood. */
  readonly topsCache = new TopsCache();
  /** A PLACE'S STEADY GLOWS AS ONE PICTURE (render/still_glows.ts): the town's day, 65 glows a frame. */
  readonly stillGlows = new StillGlows();
  /** A PLACE'S DARK WITH ITS STEADY LIGHTS' HOLES AS ONE PICTURE (render/still_dark.ts): the town's day, 54 holes a frame. */
  readonly stillDark = new StillDark();
  private frameChunks: Chunk[] = [];
  /** Every chunk on the screen this frame, with a picture or without. */
  private seenChunks: Chunk[] = [];
  private topsFrame = 0;
  private topsHeroX = 0;
  private topsHeroY = 0;

  /** (ACT 1) What stands on the tops, as chunks: each a picture, or its trees (where it has no picture yet, or one of its trees is seen through). */
  private standTopsCached(T: Terrain, L: Game['level'], W: number, H: number, heroX: number, heroY: number): void {
    const cam = this.cam;
    const tc = this.topsCache;
    tc.begin(L);
    const SLAB = TOPS_CACHE.slab;
    const COLUMN = TOPS_CACHE.column;
    const frame = ++this.topsFrame;
    this.topsHeroX = heroX;
    this.topsHeroY = heroY;
    // (the trees are come to here, before everything else that stands this frame: those drawn one by one later still take their place)
    this.topsQ = this.stands.length;
    tc.stats.pictures = 0;
    tc.stats.fell = 0;
    tc.stats.trees = 0;
    const relX = -cam.ox;
    const relY = -cam.oy;
    const slabPx = SLAB * 8;
    const c0 = Math.floor(relX / COLUMN);
    const c1 = Math.floor((relX + W - 1) / COLUMN);
    // (a tree whose foot is below the screen's foot reaches up into it)
    const s0 = Math.floor((relY - 16) / slabPx);
    const s1 = Math.floor((relY + H + 160) / slabPx);
    const gather = (s: number, c: number): CachedTree[] => this.gatherTops(T, s, c);
    const began = performance.now();
    this.topsBegan = began;
    let made = 0;
    const seen = this.seenChunks;
    for (let s = s0; s <= s1; s++) {
      for (let c = c0; c <= c1; c++) {
        const ch = tc.chunk(s, c, frame, gather);
        if (ch.trees.length === 0 || ch.y0 + ch.h <= relY || ch.y0 >= relY + H) continue;
        seen.push(ch);
        if (!ch.sp && (made === 0 || performance.now() - began < TOPS_BUILD_MS)) {
          tc.paint(ch, RES);
          made++;
        }
      }
    }
    // SEEN THROUGH: a tall tree the hero, or a monster in sight, is behind (as seeThrough has it: three points of them, so
    // the tree is in the chunk of the column one of the points is in): every chunk with a part of it is drawn as its trees
    // (looked for in the chunks of each one's column, on the screen or not; one further off the screen than any tree is
    // wide or tall can be behind none that is seen)
    const thin = this.thinTops;
    thin.clear();
    const who: { x: number; y: number; d: number }[] = [{ x: heroX, y: heroY, d: this.heroD }, ...this.seenFoes];
    const looked = new Set<Chunk>();
    for (const f of who) {
      if (f.x < -140 || f.x > W + 140 || f.y < -20 || f.y > H + 160) continue;
      const c = Math.floor((f.x - cam.ox) / COLUMN);
      const fs0 = Math.floor((f.y - 28 - cam.oy - 10) / slabPx);
      const fs1 = Math.floor((f.y - 3 - cam.oy + 160) / slabPx);
      for (let s = fs0; s <= fs1; s++) {
        const ch = tc.chunk(s, c, frame, gather);
        if (looked.has(ch)) continue;
        looked.add(ch);
        for (const t of ch.trees) {
          if (!t.top.tall || thin.has(t.top)) continue;
          const a = this.seeThrough(t.top.sp, cam.ox + t.sx, cam.oy + t.sy, t.d, heroX, heroY, this.heroD);
          if (a < 1) thin.set(t.top, a);
        }
      }
    }
    this.thinDrawn.clear();
    tc.stats.thin = 0;
    // COLUMN BY COLUMN: the chunks of slabs one after another that have pictures, none seen through and none with the hero
    // or a monster in sight in its slab and column, as one picture (a run); the rest each as itself
    const byCol = new Map<number, Chunk[]>();
    for (const ch of seen) {
      const list = byCol.get(ch.c);
      if (list) list.push(ch);
      else byCol.set(ch.c, [ch]);
    }
    for (const [c, list] of byCol) {
      list.sort((a, b) => a.s - b.s);
      // (the slabs the hero or a monster in sight stands in, in this column or near enough to it to reach into it)
      const busy = new Set<number>();
      const x0 = cam.ox + c * COLUMN;
      for (const f of who) if (f.x > x0 - 64 && f.x < x0 + COLUMN + 64) busy.add(Math.floor(f.d / SLAB));
      let run: Chunk[] = [];
      const close = (): void => {
        if (run.length >= 2) {
          const r = tc.run(run, frame, RES, performance.now() - began < TOPS_BUILD_MS);
          if (r) this.standChunk(r, false);
          else for (const ch of run) this.standChunk(ch, false);
        } else for (const ch of run) this.standChunk(ch, false);
        run = [];
      };
      for (const ch of list) {
        const seenThrough = thin.size > 0 && ch.trees.some((t) => thin.has(t.top));
        if (ch.sp && !seenThrough && !busy.has(ch.s)) {
          if (run.length > 0 && run[run.length - 1].s !== ch.s - 1) close();
          run.push(ch);
          continue;
        }
        close();
        if (ch.sp && !seenThrough) this.standChunk(ch, false);
        else if (ch.sp) {
          // (one of its trees seen through: drawn as its four layers, the one that holds that tree tree by tree)
          tc.stats.thin++;
          this.standLayers(ch, false);
        } else this.standChunkTrees(ch);
      }
      close();
    }
    // (while there is time, the chunks round the screen, for where the camera goes next)
    for (let s = s0 - 2; s <= s1 + 2 && performance.now() - began < TOPS_BUILD_MS; s++) {
      for (let c = c0 - 1; c <= c1 + 1 && performance.now() - began < TOPS_BUILD_MS; c++) {
        const ch = tc.chunk(s, c, frame, gather);
        if (!ch.sp && ch.trees.length > 0) tc.paint(ch, RES);
      }
    }
    if (frame % 60 === 0) tc.forget(frame);
    // (and past the most its pictures may hold, those longest unseen: TOPS_BUDGET)
    tc.trim(frame);
    // (the tops of pieces far away let go of, as the ground's pieces are)
    const pi0 = Math.floor((relX * 2) / GROUND_PIECE) - 1;
    const pi1 = Math.floor(((relX + W) * 2) / GROUND_PIECE) + 1;
    const pj0 = Math.floor((relY * 2) / GROUND_PIECE) - 1;
    const pj1 = Math.floor(((relY + H) * 2) / GROUND_PIECE) + 3;
    if (this.outdoorFrame++ % 30 === 0) this.act1.forgetTops((i, j) => i >= pi0 - 6 && i <= pi1 + 6 && j >= pj0 - 6 && j <= pj1 + 6);
  }
  /** When this frame's making of the forest's pictures began (it may go on for TOPS_BUILD_MS). */
  private topsBegan = 0;

  /** (ACT 1) A chunk's picture, to be drawn in its place (`late`: after everything else that stands was come to: in the trees' place in the order still). */
  private standChunk(ch: Chunk, late: boolean): void {
    const cam = this.cam;
    this.stands.push({ d: ch.s * ch.depth, q: late ? this.topsQ - 0.5 : this.stands.length, s: ch.sp as Sprite, x: cam.ox + ch.x0, y: cam.oy + ch.y0, over: null, overA: 0, scale: 1, alpha: 1, figure: null, phase: 0, chunk: ch });
    this.frameChunks.push(ch);
    this.topsCache.stats.pictures++;
  }

  /** (ACT 1) A chunk drawn as its four layers (render/tops_cache.ts `layers`): each its picture, or its trees where one is seen through or it has no picture yet. The layers drawn as pictures, returned. */
  private standLayers(ch: Chunk, late: boolean): Chunk[] {
    const tc = this.topsCache;
    const thin = this.thinTops;
    const out: Chunk[] = [];
    for (const sub of tc.layers(ch, this.topsFrame)) {
      if (thin.size > 0 && sub.trees.some((t) => thin.has(t.top))) {
        this.standChunkTrees(sub);
        continue;
      }
      if (!sub.sp && performance.now() - this.topsBegan < TOPS_BUILD_MS) tc.paint(sub, RES);
      if (sub.sp) {
        this.standChunk(sub, late);
        out.push(sub);
      } else this.standChunkTrees(sub);
    }
    return out;
  }

  /** The trees seen through this frame, and how much; those of them drawn so far this frame (each is drawn whole, once). */
  private thinTops = new Map<unknown, number>();
  private thinDrawn = new Set<unknown>();
  /** How many things stood before the trees this frame. */
  private topsQ = 0;

  /** (ACT 1) The trees of slab `s` that are in column `c` (render/tops_cache.ts): where the game would draw each, relative to the camera. */
  private gatherTops(T: Terrain, s: number, c: number): CachedTree[] {
    const out: CachedTree[] = [];
    const SLAB = TOPS_CACHE.slab;
    const COLUMN = TOPS_CACHE.column;
    const xa = c * COLUMN - 72;
    const xb = (c + 1) * COLUMN + 72;
    const ya = s * SLAB * 8 - 16;
    const yb = (s + 1) * SLAB * 8 + 16;
    const i0 = Math.floor((xa * 2) / GROUND_PIECE);
    const i1 = Math.floor((xb * 2) / GROUND_PIECE);
    const j0 = Math.floor((ya * 2) / GROUND_PIECE);
    const j1 = Math.floor((yb * 2) / GROUND_PIECE);
    for (let j = j0; j <= j1; j++) {
      for (let i = i0; i <= i1; i++) {
        const list = this.act1.topsOf(T, i, j);
        for (let k = 0; k < list.length; k++) {
          const top = list[k];
          const d = top.x + top.y;
          if (Math.floor(d / SLAB) !== s) continue;
          const sp = top.sp;
          // (as the game places it: wx and wy, rounded, less the camera's own whole pixels)
          const sx = Math.round((top.x - top.y) * 16);
          const sy = Math.round((top.x + top.y) * 8 - top.lift);
          const x0 = sx - sp.ax;
          const x1 = x0 + sp.w;
          if (x1 <= c * COLUMN || x0 >= (c + 1) * COLUMN) continue;
          out.push({ top, d, sx, sy, x0, y0: sy - sp.ay, x1, y1: sy - sp.ay + sp.h, order: ((j + 4096) * 8192 + (i + 4096)) * 64 + k });
        }
      }
    }
    return out;
  }

  /**
   * (ACT 1) A chunk drawn as its trees, one by one, exactly as the game draws them otherwise: each cut to the chunk's
   * column (its neighbours' pictures have the rest), but one seen through drawn whole, once (all its chunks are drawn as
   * their trees then). In the order the game came to them, before everything else that stands.
   */
  private standChunkTrees(ch: Chunk): void {
    const cam = this.cam;
    const clip0 = cam.ox + ch.x0;
    const clip1 = clip0 + ch.w;
    for (const t of ch.trees) {
      const sx = cam.ox + t.sx;
      const sy = cam.oy + t.sy;
      const q = this.topsQ - 1 + t.order * 1e-11;
      const a = this.thinTops.get(t.top);
      if (a !== undefined) {
        if (this.thinDrawn.has(t.top)) continue;
        this.thinDrawn.add(t.top);
        this.stands.push({ d: t.d, q, s: t.top.sp, x: sx, y: sy, over: null, overA: 0, scale: 1, alpha: a, figure: null, phase: 0, top: true });
      } else this.stands.push({ d: t.d, q, s: t.top.sp, x: sx, y: sy, over: null, overA: 0, scale: 1, alpha: 1, figure: null, phase: 0, top: true, clip0, clip1 });
    }
    this.topsCache.stats.trees += ch.trees.length;
  }

  /**
   * (ACT 1) Before the depth order is drawn: a chunk drawn as a picture where something else that stands comes between
   * its trees (in its slab, overlapping a tree deeper than itself) is drawn as its trees after all.
   */
  private resolveTops(): void {
    if (this.frameChunks.length === 0) return;
    // (a chunk that falls is drawn as its four layers, and they are looked at in turn; a layer that falls, as its trees)
    let pending = this.frameChunks.slice();
    let fell = 0;
    for (let pass = 0; pass < 3 && pending.length > 0; pass++) {
      const bad = this.topsBetween(pending);
      if (bad.size === 0) break;
      fell += bad.size;
      for (const st of this.stands) if (st.chunk && bad.has(st.chunk)) st.skip = true;
      const next: Chunk[] = [];
      for (const ch of bad) {
        // (a run as its chunks; a chunk as its four layers; a layer as its trees)
        if (ch.members) {
          for (const m of ch.members) {
            this.standChunk(m, true);
            next.push(m);
          }
        } else if (ch.depth === TOPS_CACHE.slab) next.push(...this.standLayers(ch, true));
        else this.standChunkTrees(ch);
      }
      pending = next;
    }
    this.topsCache.stats.fell = fell;
  }

  /** (ACT 1) Of these chunks, those that something else that stands this frame comes between: in the chunk's slab, overlapping one of its trees that is deeper than itself. */
  private topsBetween(chunks: Chunk[]): Set<Chunk> {
    const cam = this.cam;
    const bad = new Set<Chunk>();
    // (by how deep their slab is, then by which slab)
    const byDepth = new Map<number, Map<number, Chunk[]>>();
    for (const ch of chunks) {
      let m = byDepth.get(ch.depth);
      if (!m) byDepth.set(ch.depth, (m = new Map()));
      // (a run, under each of its slabs)
      for (let s = ch.s; s <= (ch.last ?? ch.s); s++) {
        const list = m.get(s);
        if (list) list.push(ch);
        else m.set(s, [ch]);
      }
    }
    for (const st of this.stands) {
      if (st.top || st.chunk || st.skip) continue;
      const s = st.s;
      const sc = st.scale;
      // (its picture's box, with what is drawn with it: a figure out of phase pulled apart sideways, a glow round it, a
      // figure's scarf and feather: engine/tails.ts paints them on a patch 48 game pixels each side of its feet, 56 up, 20 down)
      const m = (st.phase > 0 ? PHASE_APART + 2 : 0) + (s.aura ? s.aura.r + 2 : 0) + 2;
      let x0 = st.x - s.ax * sc - m;
      let x1 = st.x - s.ax * sc + s.w * sc + m;
      let y0 = st.y - s.ay * sc - m;
      let y1 = st.y - s.ay * sc + s.h * sc + m;
      if (st.figure) {
        x0 = Math.min(x0, st.x - 50);
        x1 = Math.max(x1, st.x + 50);
        y0 = Math.min(y0, st.y - 58);
        y1 = Math.max(y1, st.y + 22);
      }
      for (const [depth, m2] of byDepth) {
        const list = m2.get(Math.floor(st.d / depth));
        if (!list) continue;
        for (const ch of list) {
          if (bad.has(ch)) continue;
          const bx0 = cam.ox + ch.x0;
          const by0 = cam.oy + ch.y0;
          if (x1 <= bx0 || x0 >= bx0 + ch.w || y1 <= by0 || y0 >= by0 + ch.h) continue;
          for (const t of ch.trees) {
            if (t.d <= st.d) continue;
            if (x1 <= cam.ox + t.x0 || x0 >= cam.ox + t.x1 || y1 <= cam.oy + t.y0 || y0 >= cam.oy + t.y1) continue;
            bad.add(ch);
            break;
          }
        }
      }
    }
    return bad;
  }

  private light(W: number, H: number, game: Game, t: number, fx: Fx): void {
    if (this.dark.width !== W || this.dark.height !== H) {
      this.dark.width = W;
      this.dark.height = H;
    }
    const dg = this.dg;
    const cam = this.cam;
    const L = game.level;
    const f = L.floor;
    dg.globalCompositeOperation = 'source-over';
    dg.clearRect(0, 0, W, H);
    // (the dungeon's own stone is a deep blue, far darker than the grey it was until Version 14.1:
    // the dark is a little thinner than it was, so that a room's far walls are still seen)
    // (THE FLOOR GETS DARKER FURTHER FROM THE HERO: the dark far off is deeper than it was up to
    // Version 16, 0.8, and a wide gentle pool round the hero, below, takes it back to what it was near them)
    // (ACT 1, THE DESCENT: out on the open ground the day, thin or none, and the dusk deepening toward the Fen: game/act1.ts, `light`)
    // (THE CAMP, game/camp.ts: dusk, warm, the fires lit: his “Dusk, warm and alive (Recommended)” to the art chat)
    // (FLOOR 20, THE QUIET TOWER: on its top, under the grey sky, its own light: game/act2/quiettower.ts onTop)
    const def = this.openGround ? act1Def(f.depth) : null;
    const up = !!(def?.top && L.land?.tower && onTop(L.land.tower, game.hero.x, game.hero.y));
    const day = isCamp(L) ? CAMP_DUSK : def ? (up ? def.top! : def.light) : null;
    // (THE HEADSMAN'S YARD: under the open sky, the moon's dark: render/yard.ts)
    const yardSky = this.yard.on(f) && this.yard.heroIn(f, game.hero.x, game.hero.y);
    // (FLOOR 3, THE BLACK IRON PRISON: look B's deep shadow between its fires, 0.65 (0.8 until 9 Nov 2026): art/prison.ts PRISON_LIGHTS)
    const look = this.lookNow;
    const prisonOn = look === this.prison;
    const veil = day ? `rgba(${day.tint[0]},${day.tint[1]},${day.tint[2]},${day.dark})` : L.town && !look ? 'rgba(8,5,14,0.45)' : `rgba(${look?.tint && !yardSky ? look.tint.join(',') : '6,4,14'},${yardSky ? YARD_DARK : look ? look.dark : FAR_DARK})`;
    // (FLOOR 7, THE CARRION QUEEN'S ECLIPSE, QUEEN_ACTION: her flock over the ledge, dark but for its pools of light: the rock at a
    // third of its light, art/carrion_queen_action_fx.ts DARK_FLOOR; the hero's own light taken in with it)
    const eclipse = QUEEN_ACTION.on ? eclipseNow(game.perils) : null;
    const eDark = eclipse ? eclipseDark(eclipse.t) : 0;
    // (FLOOR 14, THE PHYSICIAN'S OPERATION: its darkness, laid below)
    const op = operationNow(game.perils);
    const oDark = op ? opDark(op.t) : 0;
    // One soft pool of light, painted once; every light in the scene is that picture, stretched
    // to its size and faded to its strength. (A fresh gradient for each light each frame was the
    // costliest thing in a busy fight.)
    const pool = this.patch('light', 64, 64, 0, (c) => {
      const grd = c.createRadialGradient(0, 0, 0, 0, 0, 64);
      grd.addColorStop(0, 'rgba(0,0,0,1)');
      grd.addColorStop(0.5, 'rgba(0,0,0,0.7)');
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = grd;
      c.fillRect(-64, -64, 128, 128);
    });
    // (A PLACE'S DARK WITH ITS STEADY LIGHTS' HOLES AS ONE PICTURE, render/still_dark.ts: where the look says the place is steady,
    // the veil and the day's holes laid down together, no boss's darkness being over the place; the holes that move or flicker
    // are cut after, as ever)
    const lights = look && look.steady === true ? look.lights(L) : null;
    let steadyLit = 0;
    let steadySig = 0;
    if (lights && eDark <= 0 && oDark <= 0) {
      for (let i = 0; i < lights.length; i++) {
        const q = lights[i];
        if (q.still !== true || q.strength <= 0 || !L.explored[Math.floor(q.y) * f.w + Math.floor(q.x)]) continue;
        steadySig = (Math.imul(steadySig, 31) + i + 1) | 0;
        steadyLit++;
      }
    }
    const asOneDark =
      !!lights && steadyLit >= 2 &&
      this.stillDark.draw(dg, cam, W, H, veil, pool, [L, lights, steadySig, cam.lift ?? null], () => {
        const home: Cam = { ox: 0, oy: 0, lift: cam.lift };
        const out: DarkSpot[] = [];
        for (const q of lights) {
          if (q.still !== true || q.strength <= 0 || !L.explored[Math.floor(q.y) * f.w + Math.floor(q.x)]) continue;
          out.push({ x: wx(home, q.x, q.y) + (q.dx ?? 0), y: wy(home, q.x, q.y) - q.up, r: q.r, strength: q.strength });
        }
        return out;
      });
    if (!asOneDark) {
      dg.fillStyle = veil;
      dg.fillRect(0, 0, W, H);
    }
    if (eDark > 0) {
      dg.fillStyle = `rgba(10,6,22,${(0.72 * eDark).toFixed(3)})`;
      dg.fillRect(0, 0, W, H);
    }
    // (FLOOR 14, THE PHYSICIAN'S OPERATION, PHYSICIAN_ACTION: the theatre plunged dark, to a fifth of its light, art/physician_action_fx.ts
    // OPERATION.low; one hard spotlight on the field, cut below)
    if (oDark > 0) {
      dg.fillStyle = `rgba(10,8,18,${(0.8 * oDark).toFixed(3)})`;
      dg.fillRect(0, 0, W, H);
    }
    const heroLit = 1 - 0.8 * Math.max(eDark, oDark);
    dg.globalCompositeOperation = 'destination-out';
    dg.imageSmoothingEnabled = true;
    const spot = (x: number, y: number, r: number, strength: number): void => {
      if (strength <= 0 || x < -r || x > W + r || y < -r || y > H + r) return;
      dg.globalAlpha = Math.min(1, strength);
      dg.drawImage(pool, Math.round(x - r), Math.round(y - r * 0.62), Math.round(r * 2), Math.round(r * 1.24));
    };
    const h = game.hero;
    // (the owner, 6 Oct 2026: "Add a soft gradient so the floor gets darker further away from the
    // player": under the bright pool round the hero a wide and gentle one, which thins the dark
    // near them and is gone a screen's height away)
    if (!L.town && !day) spot(wx(cam, h.x, h.y), wy(cam, h.x, h.y) - 8, NEAR_POOL, NEAR_LIFT * heroLit);
    if (!day || day.pool > 0) spot(wx(cam, h.x, h.y), wy(cam, h.x, h.y) - 8, L.town ? 170 : 165, (day ? day.pool * 3 : 1) * heroLit);
    if (eDark > 0) {
      // (a little of his own, that he is seen; and the pools, fully lit)
      spot(wx(cam, h.x, h.y), wy(cam, h.x, h.y) - 10, 40, 0.5 * eDark);
      for (const q of eclipsePools(eclipse!)) spot(wx(cam, q.x, q.y), wy(cam, q.x, q.y), q.r * 22.6 * 1.15, q.k);
    }
    if (oDark > 0 && op) {
      // (THE SPOTLIGHT: the field lit hard, the dark gone from it, its edge a thin band a step down)
      const sx = wx(cam, op.x, op.y);
      const sy = wy(cam, op.x, op.y);
      const R = FIELD.r * 16 * Math.SQRT2;
      const R2 = (FIELD.r + 0.08) * 16 * Math.SQRT2;
      dg.fillStyle = '#000';
      dg.globalAlpha = 0.5 * oDark;
      dg.beginPath();
      dg.ellipse(sx, sy, R2, R2 / 2, 0, 0, Math.PI * 2);
      dg.fill();
      dg.globalAlpha = oDark;
      dg.beginPath();
      dg.ellipse(sx, sy, R, R / 2, 0, 0, Math.PI * 2);
      dg.fill();
      dg.globalAlpha = 1;
    }
    // (FLOOR 3, THE BLACK IRON PRISON: its fire baskets, its glowing grates and his great grate cut the dark: render/prison.ts)
    if (look) {
      for (const q of look.lights(L)) {
        if (!L.explored[Math.floor(q.y) * f.w + Math.floor(q.x)]) continue;
        // (the steady ones are in the veil already: render/still_dark.ts)
        if (asOneDark && q.still === true) continue;
        const lx = wx(cam, q.x, q.y) + (q.dx ?? 0);
        const ly = wy(cam, q.x, q.y) - q.up;
        if (lx < -q.r || lx > W + q.r || ly < -q.r || ly > H + q.r) continue;
        spot(lx, ly, q.still ? q.r : q.r + Math.sin(t * 7 + q.x * 3) * 2, q.strength);
      }
    }
    if (prisonOn) {
      // (PRISON_EXIT: the passage's baskets and floor beyond the door out the back of his hall, and its doorway's light as it opens)
      const ex = L.ways?.exit;
      const ef = ex ? this.dress.exitFilm(game) : null;
      if (ex && ef && prisonDoorTiles(f, ex).some((i) => L.explored[i] === 1 || L.explored[ex.alongX ? i + f.w : i + 1] === 1)) {
        const A = prisonDoorAnchor(ex);
        const ax = wx(cam, A.x, A.y);
        const ay = wy(cam, A.x, A.y);
        for (const q of this.prison.exitLights(ex.alongX, FloorDress.exitFrame(ex, ef.frames.length))) spot(ax + q.dx, ay + q.dy, q.r + Math.sin(t * 7 + q.dy) * 2, q.strength);
      }
    }
    // (THE HEADSMAN'S YARD: its torches light the wall and the floor below them)
    if (this.yard.on(f)) {
      for (const q of this.yard.torches(f)) {
        if (!L.explored[Math.floor(q.y) * f.w + Math.floor(q.x)]) continue;
        const at = this.yard.torchLight(cam, q.x, q.y);
        spot(at.x, at.y, 48 + Math.sin(t * 9 + q.x) * 2, 0.85);
      }
    }
    // (the town's gate lights the floor before it)
    if (L.town && !isCamp(L) && !L.rim) spot(wx(cam, TOWN.gate.x, TOWN.gate.y), wy(cam, TOWN.gate.x, TOWN.gate.y) - 14, 84 + Math.sin(t * 3) * 3, 0.9);
    for (const p of L.props) {
      if (!L.explored[p.ty * f.w + p.tx]) continue;
      if (p.kind === 'brazier') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 14, 62 + Math.sin(t * 9 + p.variant) * 3, 0.9);
      else if (p.kind === 'portal' && p.state === 1) spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 16, 70, 0.9);
      else if (p.kind === 'lexicon') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 14, 46 + Math.sin(t * 3) * 3, 0.8);
      else if (p.kind === 'forge') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 6, 60 + Math.sin(t * 9) * 3, 0.9);
      else if (p.kind === 'tentTable') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 18, 56, 0.8);
      else if (p.kind === 'runeSlab') spot(wx(cam, p.x, p.y) + 8, wy(cam, p.x, p.y) - 12, 64 + Math.sin(t * 2) * 3, 0.75);
    }
    for (const p of game.projectiles) if (p.look !== 'dart') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 10, p.hostile ? 16 : p.look === 'mote' ? 14 : p.look === 'wave' ? (WILD.on ? 52 : 34) : WILD.on && p.look === 'arrow' ? 40 : 26, 0.8);
    // What a monster's own fire lights: the floor round a cultist's flame (and far more of it as
    // the flame swells before it is thrown), the Warden's maul going hot. Eyes glow, and light
    // nothing.
    for (const q of this.monsterLit) {
      for (const l of q.s.lights ?? []) {
        if (l.r >= MONSTER_LIGHT_MIN) spot(q.x + l.x - q.s.ax, q.y + l.y - q.s.ay + 6, l.r * 2.6, (l.a ?? 0.5) * 1.1);
      }
    }
    for (const o of game.orbs) spot(wx(cam, o.x, o.y), wy(cam, o.x, o.y) - 12, 44, 0.85);
    // (a beam that is being held lights the floor along it; a whirlwind, the floor round the hero)
    const lit0 = game.hero.channel;
    if (lit0) {
      const hh = game.hero;
      const sk = hh.skills[lit0.skill];
      const def = SKILLS[sk.id];
      if (def.kind === 'beam') {
        const end = game.beamEnd(hh.x, hh.y, hh.fx, hh.fy, def.range);
        for (let d = 1; d < end.len; d += 2.2) spot(wx(cam, hh.x + hh.fx * d, hh.y + hh.fy * d), wy(cam, hh.x + hh.fx * d, hh.y + hh.fy * d) - 12, 30, 0.75);
      } else if (sk.r.element !== 'phys') spot(wx(cam, hh.x, hh.y), wy(cam, hh.x, hh.y) - 10, 52, 0.8);
    }
    for (const q of game.familiars) spot(wx(cam, q.x, q.y), wy(cam, q.x, q.y) - FAMILIAR_HOVER, 20, 0.7);
    // (the patch a volley is raining on stands in a light of its own, so that the rain is seen
    // wherever it was sent: it comes up as the arrows leave and goes down as the last ones land)
    for (const v of game.volleys) {
      const left = v.total * TUNE.volleyEvery - v.t;
      spot(wx(cam, v.x, v.y), wy(cam, v.x, v.y) - 4, 24 + v.r * 18, 0.7 * Math.min(1, (v.t + TUNE.volleyDelay) * 5, Math.max(0, left * 3 + 0.3)));
    }
    // (the small patches along a shot's path share their light: one pool for those within a step of it)
    const lit: number[] = [];
    for (const z of game.zones) {
      if (this.skip.has('zlight')) break;
      if (z.kind !== 'burn' && z.kind !== 'storm' && z.kind !== 'rune' && z.kind !== 'ice' && z.kind !== 'venom') continue;
      if (ownsZone(z) || ownsZoneB3(z) || ownsZoneV3(z) || ownsZoneW7(z)) continue;
      const small = z.r < 1.2;
      if (small) {
        let near = false;
        for (let i = 0; i < lit.length && !near; i += 2) near = Math.abs(lit[i] - z.x) < 1.0 && Math.abs(lit[i + 1] - z.y) < 1.0;
        if (near) continue;
        lit.push(z.x, z.y);
      }
      // it dims as the patch gives out, instead of going out like a lamp
      spot(wx(cam, z.x, z.y), wy(cam, z.x, z.y), (small ? 30 : 18) + z.r * 16, 0.7 * Math.min(1, (z.dur - z.t) * 2));
    }
    const body = L.body;
    if (body && body.state === 0 && L.explored[body.ty * f.w + body.tx]) spot(wx(cam, body.x, body.y), wy(cam, body.x, body.y) - 6, 44 + Math.sin(t * 4) * 3, 0.85);
    for (const d of game.drops) {
      // a word on the floor lights the room round it
      if (d.kind === 'word') spot(wx(cam, d.x, d.y), wy(cam, d.x, d.y) - 10, 40, 0.85);
      else if (d.kind === 'orb' || d.kind === 'dust' || d.kind === 'stone' || (d.kind === 'item' && d.item && d.item.rarity >= 2)) spot(wx(cam, d.x, d.y), wy(cam, d.x, d.y) - 4, 18, 0.7);
    }

    // (THE NEW WORDS, a mock-up behind a switch that is off)
    if (WORDS3.on) lights3(spot, cam, game, t);
    if (MELD3.on) lightsM3(spot, cam, game, t);
    if (BINDING3.on) lightsB3(spot, cam, game, t);
    if (VOLATILE3.on) lightsV3(spot, cam, game, t);
    if (WORDS7_LOOK.on) lightsW7(spot, cam, game, t);
    if (WORDS10_LOOK.on) lightsW10(spot, cam, game, t);
    // (THE FIRST FIVE FLOORS: what of the bosses' doings lights the dark)
    this.bossFx.lights(spot);
    // a burst of fire or a bolt of lightning lights up the room for a moment
    for (const l of fx.glows) spot(wx(cam, l.x, l.y), wy(cam, l.x, l.y) - 8, l.r, 0.9 * (1 - l.t / l.dur));
    for (const m of game.monsters) {
      if (m.seen && !m.dead && (m.boss || m.champion || m.burnT > 0)) spot(wx(cam, m.x, m.y), wy(cam, m.x, m.y) - 12, m.boss ? 56 : m.champion ? 44 : 26, 0.7);
      // (the enemy locked onto stands in a little light of its own: it, and the ring at its feet, must be seen wherever it is)
      else if (m.seen && !m.dead && m.id === this.lockId) spot(wx(cam, m.x, m.y), wy(cam, m.x, m.y) - 8, 30, 0.75);
    }
    dg.globalAlpha = 1;
    dg.globalCompositeOperation = 'source-over';
    // the vignette, laid on the dark after the lights have cut their holes in it: the corners of
    // the screen are shadowy whatever is lit there (what GLOWS is drawn after the dark, and still shines)
    // (THE HEADSMAN'S YARD: the sky over its far walls lit by its moon, and the edges of the screen less dark under the open sky)
    if (yardSky) this.yard.skyLift(dg, cam, f, YARD_SKY_LIFT);
    // (FLOOR 2, THE PRISON'S GROUNDS: the sky's own light over a courtyard's far walls; under the sky, his yard's vignette)
    const groundsOut = look === this.grounds && this.grounds.outdoors();
    if (look === this.grounds) this.grounds.skyLift(dg, cam);
    if (!this.skip.has('vignette')) dg.drawImage(this.vignette(W, H, day ? day.vignette : L.town ? (this.lookNow?.vignette ?? VIGNETTE_TOWN) : yardSky ? YARD_VIGNETTE : groundsOut ? (this.grounds.vignette ?? VIGNETTE) : VIGNETTE), 0, 0);
  }

  private drawBars(g: CanvasRenderingContext2D, game: Game, t: number): void {
    const cam = this.cam;
    // (MONSTER PACKS, with PACK_LOOK: a blue pack's name is written once, over the first of it still
    // standing in sight; every one of it has its ring and its bar. A name over each was a pile of
    // letters: six bats, six names, one on another.)
    const speaks = new Map<number, number>();
    if (PACK_LOOK.on) for (const m of game.monsters) if (!m.dead && m.seen && !unseen(m) && m.rarity === 'blue' && !speaks.has(m.packId)) speaks.set(m.packId, m.id);
    // (the names over all the bars, so that no bar of a pack's lies across its name)
    const names: { m: Monster; x: number; y: number }[] = [];
    for (const m of game.monsters) {
      if (m.dead || !m.seen || m.boss || unseen(m)) continue;
      // (the enemy locked onto always shows its life: it is the one being fought)
      if (m.barT <= 0 && !named(m) && m.id !== this.lockId) continue;
      // (over its head as it stands: a club or a sword raised above it passes in front of the bar)
      const sx = Math.round(wx(cam, m.x, m.y));
      const sy = Math.round(wy(cam, m.x, m.y)) - FIGURE_SIZE[figureOf(m)].top - 5;
      const w = m.champion ? 34 : named(m) ? 24 : 16;
      // (ART_TWEAKS.bars, a mock-up: one of a pack shows its bar only once it is hurt, hit or locked onto; its name as before)
      const quiet = ART_TWEAKS.bars && named(m) && !m.elite && m.life >= m.maxLife && m.barT <= 0 && m.id !== this.lockId;
      if (!quiet) {
        g.fillStyle = P.ink;
        g.fillRect(sx - w / 2 - 1, sy - 1, w + 2, 4);
        g.fillStyle = P.bl1;
        g.fillRect(sx - w / 2, sy, w, 2);
        g.fillStyle = named(m) ? P.fr4 : P.bl4;
        g.fillRect(sx - w / 2, sy, Math.max(0, Math.round((w * m.life) / m.maxLife)), 2);
      }
      if (named(m) && (m.rarity !== 'blue' || speaks.get(m.packId) === m.id)) names.push({ m, x: sx, y: sy - 8 });
    }
    for (const n of names) drawText(g, n.m.name, n.x, n.y, nameColor(n.m), { align: 'center', font: 'small', shadow: P.ink });
    // The hero's own life, over their head, where the eyes are in a fight (lifebar.ts says when it
    // is there). The part just lost stays lit for a moment; low, it flashes; its edge takes the
    // colour of what ails the hero, as the globe's rim does.
    const lb = this.lifeBar;
    if (lb.alpha > 0.01) {
      const h = game.hero;
      const w = LIFE_BAR.w;
      const hgt = LIFE_BAR.h;
      const mana = game.meta.limit === 'mana';
      const x = this.heroAt.x - Math.floor(w / 2);
      const y = this.heroAt.y - this.heroAt.top - LIFE_BAR.lift;
      g.globalAlpha = lb.alpha;
      g.fillStyle = h.burnT > 0 ? P.fr4 : h.poisonT > 0 ? P.vn4 : h.chillT > 0 ? P.bu4 : h.shockT > 0 ? P.lt3 : P.ink;
      g.fillRect(x - 1, y - 1, w + 2, hgt + 2 + (mana ? 2 : 0));
      // (in the colours of the life globe: ui/ui.ts, THEME)
      g.fillStyle = THEME.lifeLo;
      g.fillRect(x, y, w, hgt);
      const full = barPixels(lb.shown, w);
      const was = barPixels(lb.trail, w);
      if (was > full) {
        g.fillStyle = THEME.text;
        g.fillRect(x + full, y, was - full, hgt);
      }
      const flash = lb.low && Math.floor(t * LIFE_BAR.lowRate * 2) % 2 === 0;
      g.fillStyle = flash ? THEME.lifeHi : THEME.life;
      g.fillRect(x, y, full, hgt);
      g.fillStyle = flash ? P.white : THEME.lifeHi;
      g.fillRect(x, y, full, 1);
      if (mana) {
        // (mana, when mana is what limits the slow attack: a thin line under the life)
        g.fillStyle = P.ink;
        g.fillRect(x - 1, y + hgt, w + 2, 1);
        g.fillStyle = THEME.ink;
        g.fillRect(x, y + hgt + 1, w, 1);
        g.fillStyle = THEME.mana;
        g.fillRect(x, y + hgt + 1, barPixels(h.mana / Math.max(1, h.d.maxMana), w), 1);
      }
      g.globalAlpha = 1;
    }
    // THE WARLOCK'S PACT (game/warlock.ts), his pick of 28 Oct: “Bar over his head” (offered as: a thin cyan bar just under
    // the red life bar over his head; when it's full it blazes). Filling with his hellfire as he hits; full, it blazes and
    // says how he changes; as the demon, it runs down. There while the life bar is, and always while it is full or he is
    // the demon.
    {
      const h = game.hero;
      if (h.cls === 'warlock' && !game.over) {
        const full = WARLOCK_TUNE.pact.full;
        const k = Math.max(0, Math.min(1, (h.pact ?? 0) / full));
        const demon = h.form === 'demon';
        // (not while he changes: the demon is tearing out of him)
        const blaze = !demon && k >= 1 && !h.change;
        const a = Math.max(lb.alpha, blaze || demon || h.change ? 1 : 0);
        if (a > 0.01) {
          const w = LIFE_BAR.w;
          const mana = game.meta.limit === 'mana';
          const x = this.heroAt.x - Math.floor(w / 2);
          const y = this.heroAt.y - this.heroAt.top - LIFE_BAR.lift + LIFE_BAR.h + 2 + (mana ? 2 : 0);
          const hot = blaze && Math.floor(t * 6) % 2 === 0;
          g.globalAlpha = a;
          g.fillStyle = blaze ? (hot ? P.white : '#22d0e0') : P.ink;
          g.fillRect(x - 1, y - 1, w + 2, 4);
          g.fillStyle = '#0a2630';
          g.fillRect(x, y, w, 2);
          g.fillStyle = blaze ? (hot ? '#e8ffff' : '#b8fff8') : '#22d0e0';
          g.fillRect(x, y, barPixels(k, w), 2);
          g.fillStyle = '#b8fff8';
          g.fillRect(x, y, barPixels(k, w), 1);
          if (blaze) {
            // (its fire licking up off it, and what to do)
            for (let i = 0; i < 4; i++) {
              const fx0 = x + 2 + ((i * 7 + Math.floor(t * 11)) % (w - 3));
              const up = 1 + ((i + Math.floor(t * 9)) % 3);
              g.fillStyle = up > 2 ? '#e8ffff' : '#22d0e0';
              g.fillRect(fx0, y - 1 - up, 1, up);
            }
            // (over the life bar, clear of his head)
            drawText(g, this.pactHint, this.heroAt.x, y - LIFE_BAR.h - 2 - (mana ? 2 : 0) - 9, hot ? '#e8ffff' : '#22d0e0', { align: 'center', font: 'small', shadow: P.ink });
          }
          g.globalAlpha = 1;
        }
      }
    }
    // The word a monster carries hangs over its head as its rune stone: what you see is what its
    // death will leave on the floor.
    for (const m of game.monsters) {
      if (m.dead || !m.seen || !(m.elite || m.boss) || unseen(m)) continue;
      const carried = game.wordsCarried(m);
      if (!carried.length) continue;
      const sx = Math.round(wx(cam, m.x, m.y));
      const top = Math.round(wy(cam, m.x, m.y)) - FIGURE_SIZE[figureOf(m)].top - (m.boss ? 6 : 15);
      const bob = Math.round(Math.sin(t * 3 + m.id) * 1.5);
      carried.forEach((w, i) => {
        const icon = this.art.icons.word[w];
        const x = sx - Math.floor((carried.length * 14 - 2) / 2) + i * 14;
        const y = top - 13 + bob;
        g.fillStyle = P.ink;
        g.fillRect(x - 1, y - 1, 14, 14);
        g.fillStyle = WORD_COLOR[w];
        g.fillRect(x - 1, y + 13, 14, 1);
        g.drawImage(icon.img, x, y);
      });
    }
    // (THE HIGH CITY, THE ROYAL CARDS: one a royal touched wears that royal's crest over its head, above the word it carries)
    for (const m of game.monsters) {
      if (m.dead || !m.seen || !m.royal || unseen(m)) continue;
      const sx = Math.round(wx(cam, m.x, m.y));
      const top = Math.round(wy(cam, m.x, m.y)) - FIGURE_SIZE[figureOf(m)].top;
      const words = (m.elite || m.boss) && game.wordsCarried(m).length > 0;
      drawRoyalCrest(g, m.royal, sx, top - (words ? (m.boss ? 6 : 15) + 16 : 5), t, m.id);
    }
  }

  /** Names of loot on the floor, nudged upward so they never overlap. */
  private drawLabels(g: CanvasRenderingContext2D, W: number): void {
    const placed: { x: number; y: number; w: number }[] = [];
    this.labels.sort((a, b) => b.y - a.y);
    for (const l of this.labels.slice(0, 40)) {
      const text = l.text.length > 30 ? l.text.slice(0, 29) + '.' : l.text;
      const w = textWidth(text, 'small') + 4;
      const x = Math.round(Math.max(1, Math.min(W - w - 1, l.x - w / 2)));
      let y = Math.round(l.y);
      for (let tries = 0; tries < 12; tries++) {
        if (!placed.some((p) => Math.abs(p.y - y) < 8 && x < p.x + p.w && p.x < x + w)) break;
        y -= 8;
      }
      placed.push({ x, y, w });
      g.globalAlpha = 0.78;
      g.fillStyle = P.black;
      g.fillRect(x, y - 1, w, 7);
      g.globalAlpha = 1;
      drawText(g, text, x + 2, y, l.color, { font: 'small' });
    }
  }
}
