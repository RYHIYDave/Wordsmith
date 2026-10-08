// Draws the world: floor, cut-away walls, props, characters, effects and lighting.
// Order: floor -> things lying on the floor -> everything that stands up (sorted back to front)
// -> darkness with holes cut by lights -> glowing effects -> labels and health bars.

import type { ActorArt } from '../art/actor_types';
import { FIGURE_SIZE, figureOf } from '../art/bestiary';
import type { Bestiary, MonsterFigure } from '../art/bestiary';
import type { HeroArt } from '../art/heroes';
import { WORD_COLOR } from '../art/icons';
import type { IconArt } from '../art/icons';
import { ELEMENT_RAMP, P, RARITY_COLOR } from '../art/palette';
import { SPELL_TONES } from '../art/spells';
import type { SpellArt } from '../art/spells';
import { GATE_UP, PILLAR, POST, STRIP, SWING_STEPS } from '../art/gates';
import type { GateArt, Strip } from '../art/gates';
import { WALL_LOOK } from '../art/ground';
import { FACE_LEFT, FACE_RIGHT, wallFaces, wallsAway } from './walls';
import type { GroundArt, WallPart } from '../art/ground';
import type { DungeonProps } from '../art/props';
import type { TownProps } from '../art/town';
import { isTownFlat, isTownsperson, townSprite, turnedTo } from '../art/townscene';
import type { Facing } from '../art/townsfolk';
import type { Townsfolk } from '../art/townsfolk';
import { drawText, textWidth } from '../engine/font';
import { LEDGE_H, WALL_H } from '../engine/iso';
import { drawAura, drawLights, flipSprite, silhouette, spriteCovers } from '../engine/px';
import type { Sprite } from '../engine/px';
import { hash2 } from '../engine/rng';
import { MONSTERS, SKILLS, TUNE, WORDS } from '../game/defs';
import { kindName } from '../game/items';
import type { Game } from '../game/game';
import { TOWN } from '../game/level';
import type { Monster, Station } from '../game/state';
import { doorFace, doorTiles } from '../game/doors';
import { STAIR_N, STAIR_W, levelAt } from '../game/height';
import { CUT_FAR, CUT_FAR_LOW, CUT_LEFT, CUT_LEFT_LOW, CUT_NEAR, CUT_NEAR_LOW, T_FLOOR, T_PIT, T_WALL } from '../game/types';
import type { Floor } from '../game/types';
import type { ClassId, Element, WordId } from '../game/types';
import { Figure, attackClip, attackFrame, monsterAttackAge, PHASE_APART } from './figure';
import { LIFE_BAR, LifeBar, barPixels } from './lifebar';
import { THEME } from '../ui/ui';
import { pline, wx, wy, wyFlat } from './fx';
import type { Cam, Fallen, Fx } from './fx';

/** How solid a big thing is drawn while the hero is behind it (see `veil` in the frame). */
export const SEEN_THROUGH = 0.38;
export const STATION_NAME: Record<Station, string> = { gate: 'GATE', wordsmith: 'WORDSMITH', armourer: 'ARMOURER', mystic: 'MYSTIC', lexicon: 'LEXICON', stash: 'STASH', stranger: 'STRANGER' };
/**
 * How far over its floor point each service's name is written: over the top of whatever stands
 * there. (The mystic's is over the roof of his tent, measured from the table his service is used
 * at.) The game's own hands read this too: a name is touched like the thing it names (main.ts).
 */
export const NAME_LIFT: Record<Station, number> = { gate: 74, stash: 26, lexicon: 40, mystic: 86, wordsmith: 44, armourer: 50, stranger: 40 };

export interface Art {
  /** The dungeon's floor and walls (art/ground.ts). */
  ground: GroundArt;
  /** What stands and lies in a dungeon (art/props.ts). */
  props: DungeonProps;
  /** Its doors and gates (art/gates.ts): drawn only where a level has any (game/doors.ts). */
  gates: GateArt;
  /** The town's own things (art/town.ts) and its people (art/townsfolk.ts): Version 14.4. */
  town: TownProps;
  folk: Townsfolk;
  heroes: HeroArt;
  /** Every monster, the guardian and the boss (art/bestiary.ts). */
  bestiary: Bestiary;
  icons: IconArt;
  /** The orb the staff sets down, the familiar, and its bolt. */
  spells: SpellArt;
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
const FAR_DARK = 0.88;
const NEAR_POOL = 380;
const NEAR_LIFT = 0.36;
const VIGNETTE_FROM = 0.5;
const VIGNETTE = 0.62;
const VIGNETTE_TOWN = 0.4;
const WARM_MS = 2;
const WARM_ENTER_MS = 90;

/** A light on a monster's picture lights the floor too if it is at least this big, in game pixels. */
const MONSTER_LIGHT_MIN = 7;

/** How far above the floor a familiar hangs, in game pixels (about the height of a hero's shoulder). */
const FAMILIAR_HOVER = 19;

/** One upright thing to draw, with its depth for back-to-front sorting. */
interface Stand {
  d: number;
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
}

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

function ellipse(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, alpha: number): void {
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.beginPath();
  g.ellipse(cx, cy, r * 22.6, r * 11.3, 0, 0, Math.PI * 2);
  g.fill();
  g.globalAlpha = 1;
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

export class Renderer {
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
  /** The figures in this dungeon, for painting their frames ahead of need (see Bestiary.warm). */
  private figures: MonsterFigure[] = [];
  /** The place whose first drawing has been used to paint frames ahead (see heroArt). */
  private warmedFor: unknown = null;
  /** The level whose fallen monsters the effects are keeping (their bodies lie until the hero leaves it). */
  private fallenFor: unknown = null;
  /** The hero as a moving figure: which frame, the scarf and the feather, what they do when left standing. */
  readonly figure = new Figure();
  /** Which hero the figure was last asked for (a new character starts over). */
  private figureOf = '';
  /** The hero's life as a bar over their head: when it is there and what it shows (lifebar.ts). */
  readonly lifeBar = new LifeBar();
  /** Where the hero stands on screen this frame, and how far above that point over-head things begin. */
  private heroAt = { x: 0, y: 0, top: 32 };
  /** Where the last afterimage of a hasted hero was left. */
  private blurAt = { x: 0, y: 0 };
  cam: Cam = { ox: 0, oy: 0 };
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
    const key = WALL_LOOK.tall * 1000 + WALL_LOOK.fade * 2 + (WALL_LOOK.faces ? 1 : 0);
    if (this.awayGrid && this.awayFor === L && this.awayKey === key) return this.awayGrid;
    this.awayGrid = wallsAway(L.floor, WALL_LOOK);
    this.awayFor = L;
    this.awayKey = key;
    return this.awayGrid;
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
   * (The stone on either side of a door is wall, and the walls' own rules draw it or leave it out:
   * render/walls.ts.)
   */
  private standDoors(L: Game['level'], cam: Cam): void {
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
      if (s.kind === 'bossgate') {
        const wide = PILLAR / 32;
        const pillar = A.pillar(true);
        for (const [x, y] of [at(0), at(3 + wide)]) put(x + y - wide, pillar, x, y);
        strips(A.portcullis(s.alongX, true, d.open * GATE_UP), -wide, wide);
        strips(A.arch(s.alongX, true, d.want === 0), -wide, 0);
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
      put(hx + hy + 0.5 * along - 0.2 * back, A.leaf(Math.round(32 * (dx - dy)), Math.round(16 * (dx + dy))), hx, hy);
    }
  }

  /** (THE WALLS' LOOK) This frame's walls toward the eye (`lowWalls`), for the painters of single tiles. */
  private lowNow: Uint8Array | null = null;
  /** (THE WALLS' LOOK) Where the hero's feet are on the screen this frame, and their depth. */
  private wallHero: { x: number; y: number; d: number } | null = null;

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
  /** Touch: the monster the hero is locked onto (its id): a ring is drawn round its feet. Set every frame by the controls. */
  lockId: number | null = null;
  /**
   * For measuring only (`__dbg.renderer.skip.add('ground')` in a playtest): parts of the picture to
   * leave out, to find what a slow frame is spending its time on. 'ground' = the hero's ground
   * patches, 'zlight' = their light, 'cloud' = thunderclouds, 'fx' = everything in fx.ts.
   */
  skip = new Set<string>();

  constructor(private art: Art) {
    this.dark = document.createElement('canvas');
    this.dg = this.dark.getContext('2d') as CanvasRenderingContext2D;
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

  private stand(d: number, s: Sprite, x: number, y: number, over: Sprite | null = null, overA = 0, scale = 1, alpha = 1, figure: Figure | null = null, phase = 0): void {
    this.stands.push({ d, s, x: Math.round(x), y: Math.round(y), over, overA, scale, alpha, figure, phase });
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
  private lowEdges(g: CanvasRenderingContext2D, R: Relief, idx: number, tx: number, ty: number, px: number, py: number): void {
    const G = this.art.ground;
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
    const G = this.art.ground;
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
    const G = this.art.ground;
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
    const G = this.art.ground;
    const e = G.rimLeft;
    if (tx > 0 && f.tiles[idx - 1] === T_PIT) g.drawImage(G.rimLeft.img, X, Y, e.w, e.h);
    if (ty > 0 && f.tiles[idx - f.w] === T_PIT) g.drawImage(G.rimRight.img, X, Y, e.w, e.h);
    if (tx < f.w - 1 && f.tiles[idx + 1] === T_PIT) g.drawImage(G.lipRight.img, X, Y, e.w, e.h);
    if (ty < f.h - 1 && f.tiles[idx + f.w] === T_PIT) g.drawImage(G.lipLeft.img, X, Y, e.w, e.h);
  }

  /** The pits, and then the raised floor and the stairs, of this frame (the floor pass has listed them, from the back of the screen to the front). */
  private drawRelief(g: CanvasRenderingContext2D, R: Relief): void {
    const G = this.art.ground;
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
    const G = this.art.ground;
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
    const sp = G.part[part][low ? 'low' : 'tall'];
    const depth = s + (part === 'far' ? 0.66 : part === 'near' ? 1.34 : 1);
    if (floor && up > 0) {
      // the wall over a half tile of raised floor stands ON that floor: as tall over the terrace as over the room's floor
      // (with one top line: the top of a whole wall, as much of it as stands over the terrace)
      this.stand(depth, WALL_LOOK.level && !low ? G.part[part].mid : sp, px, py - up);
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
    const G = this.art.ground;
    const sp = G.floor(tx, ty);
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
    const G = this.art.ground;
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
    const here = (x: number, y: number): boolean => {
      if (pass < 0 || !top) return true;
      const tx = Math.floor(x);
      const ty = Math.floor(y);
      if (tx < 0 || ty < 0 || tx >= fw || ty >= fh) return pass === 0;
      const i = ty * fw + tx;
      // (sunken floor and the flights down into it; raised floor and the flights up to it; the room's own floor)
      return (hs && hs[i] < 0 ? 2 : top[i] > 0 ? 1 : 0) === pass;
    };
    for (const p of L.props) {
      if (!L.explored[p.ty * f.w + p.tx] || !here(p.x, p.y)) continue;
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y);
      if (sx < -60 || sx > W + 60 || sy < -30 || sy > H + 60) continue;
      if (p.kind === 'bones' || p.kind === 'rubble' || ((p.kind === 'barrel' || p.kind === 'urn') && p.state === 1)) {
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
      }
    }
    for (const z of game.zones) {
      if (!here(z.x, z.y)) continue;
      const cx = wx(cam, z.x, z.y);
      const cy = wy(cam, z.x, z.y);
      const k = z.t / z.dur;
      if (z.kind !== 'warn' && this.skip.has('ground')) continue;
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
      g.drawImage(sp.img, Math.round(cx) - sp.ax, Math.round(cy) - sp.ay);
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
      if (!shown || !shown.lying) continue;
      // (a body settles into the floor's dark over a second and a half: with forty of them lying
      // about, what still stands, and what was dropped, must be the brighter things on the screen)
      g.globalAlpha = 1 - (1 - BODY_DIM) * Math.min(1, Math.max(0, shown.since) / BODY_SETTLES);
      g.drawImage(shown.sp.img, Math.round(sx) - shown.sp.ax, Math.round(sy) - shown.sp.ay, shown.sp.w, shown.sp.h);
    }
    g.globalAlpha = 1;
    // (the effects that lie flat are drawn once, over the last floor to be drawn)
    if ((pass < 0 || pass === 1) && !this.skip.has('fx')) fx.drawGround(g, cam);

    // shadows, and the rings that mark elites
    for (const m of game.monsters) {
      if (m.dead || !m.seen || !here(m.x, m.y)) continue;
      const cx = wx(cam, m.x, m.y);
      const cy = wy(cam, m.x, m.y);
      if (m.elite || m.boss) {
        const col = m.words.length ? WORD_COLOR[m.words[0]] : P.fr4;
        ringDots(g, cx, cy, m.r * (1.5 + 0.12 * Math.sin(t * 5)), col);
      }
      if (m.id === this.lockId) lockRing(g, cx, cy, Math.max(0.62, m.r * 1.9), t);
      this.shadow(g, cx, cy, m.r * 0.75, SHADOW);
    }
    if (here(h.x, h.y)) {
      // (a hero in the air is further from their shadow: it is smaller and fainter at the top of a leap)
      const up = h.move && h.move.kind === 'leap' ? Math.sin(Math.PI * Math.min(1, h.move.t / h.move.dur)) : 0;
      this.shadow(g, wx(cam, h.x, h.y), wy(cam, h.x, h.y), 0.36 * (1 - 0.3 * up), SHADOW * (1 - 0.35 * up));
    }
    for (const o of game.orbs) if (here(o.x, o.y)) this.shadow(g, wx(cam, o.x, o.y), wy(cam, o.x, o.y), 0.42, SHADOW * 0.85);
    for (const q of game.familiars) if (here(q.x, q.y)) this.shadow(g, wx(cam, q.x, q.y), wy(cam, q.x, q.y), 0.14, SHADOW * 0.7);

  }

  /**
   * The picture of a character this frame. `heavy` asks for the slow attack's frames, and `leapK`
   * (0..1, how far through a leap) for the leap's, where the art has them.
   */
  private actorSprite(art: ActorArt, anim: string, animT: number, attackFrame: number, fx: number, fy: number, heavy = false, leapK = -1): Sprite {
    const left = fx - fy < 0;
    // (frames of its own for facing screen-left, where the art has them: a mock-up that no figure in the game has, ActorArt.left)
    const own = left && art.left ? art.left : art;
    const set = fx + fy < -0.2 ? own.back : own.front;
    let s: Sprite;
    if (leapK >= 0 && set.leap) s = set.leap[leapK < 0.18 ? 0 : leapK < 0.7 ? 1 : 2];
    else if (anim === 'attack') s = (heavy && set.heavy ? set.heavy : set.attack)[Math.max(0, Math.min(2, attackFrame))];
    else if (anim === 'walk') s = set.walk[Math.floor(animT * (set.walkFps ?? 8)) % set.walk.length];
    else s = set.idle[Math.floor(animT * (set.idleFps ?? 2)) % set.idle.length];
    return left && !art.left ? flipSprite(s) : s;
  }

  /** Which of the figure's two attack animations goes with the attack the hero is making (see attackClip). */
  private clipOf(game: Game): number {
    const h = game.hero;
    const s = h.skills[h.attackSkill];
    return s ? attackClip(h.cls, h.attackSkill, SKILLS[s.id].kind) : h.attackSkill;
  }

  /** How long the hero has been holding an attack (a beam, a whirlwind), in seconds, or -1 when they are not; and which. */
  private heldFor(game: Game): number {
    const ch = game.hero.channel;
    return ch ? ch.t : -1;
  }
  private heldAs(game: Game): 'beam' | 'whirl' {
    const ch = game.hero.channel;
    const s = ch ? game.hero.skills[ch.skill] : null;
    return s && SKILLS[s.id].kind === 'whirl' ? 'whirl' : 'beam';
  }

  /** The hero's pictures: the class decides the figure, and what is in the hands shows on it. */
  private heroArt(game: Game): ActorArt {
    const h = game.hero;
    // (Until each hero is drawn with each weapon, a hero carrying another class's weapon is drawn
    // holding their own. The warrior has two figures: with the great sword in both hands when that
    // is what he carries, with sword and shield otherwise.)
    // (and whether they are in town: the heroes painted over the bones have their weapons on their backs there, art/heroes3.ts)
    const look = { twoHanded: h.gear.mainhand !== null && h.gear.mainhand.weapon === 'greatsword', town: !!game.level.town };
    // Frames are painted ahead of need each time the world is drawn: the hero's, and those of the
    // monsters in this dungeon, turn and turn about. At least one each time, and more for as long
    // as it has cost less than WARM_MS (a fast machine has them all in a second or two; a slow
    // one paints one a frame). When a new place is drawn for the first time the whole picture
    // changes in that instant and a pause is not seen: then up to WARM_ENTER_MS is spent on it.
    const figs = this.figures;
    figs.length = 0;
    for (const m of game.monsters) {
      if (m.dead) continue;
      const f = figureOf(m);
      if (!figs.includes(f)) figs.push(f);
    }
    const budget = this.warmedFor === game.level ? WARM_MS : WARM_ENTER_MS;
    this.warmedFor = game.level;
    const began = performance.now();
    const hero = (): boolean => this.art.heroes.warm(h.cls, look);
    const beast = (): boolean => figs.length > 0 && this.art.bestiary.warm(figs);
    for (let n = 0; n < 600; n++) {
      const did = n % 2 === 0 ? hero() || beast() : beast() || hero();
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
    const words = s ? s.front : [];
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
   * The picture of a monster this frame.
   *
   * Its attack is a timeline (art/clip.ts) whose blow lands `hit` seconds in; in the rules the
   * blow lands when the wind-up has run down. The picture is played by the rules' clock
   * (monsterAttackAge in figure.ts), so its blow is the rules' blow, whatever slowed the monster.
   * The Warden's second attack (the volley of bolts) is his `heavy`, with a wind-up of its own.
   */
  private monsterSprite(m: Monster): Sprite {
    const art = this.monsterArt(m);
    // (frozen solid: as it stands)
    if (m.frozenT > 0) return this.actorSprite(art, 'idle', 0, 0, m.fx, m.fy);
    if (m.anim === 'attack') {
      const set = m.fx + m.fy < -0.2 ? art.back : art.front;
      const volley = m.boss && m.atk === 1;
      const clip = (volley ? set.clips?.heavy : undefined) ?? set.clips?.attack;
      if (clip && clip.hit !== undefined) {
        const whole = volley ? TUNE.wardenVolleyWindup : MONSTERS[m.kind].windup;
        const s = attackFrame(clip, monsterAttackAge(m.state === 'windup', m.t, whole), whole);
        return m.fx - m.fy < 0 ? flipSprite(s) : s;
      }
    }
    return this.actorSprite(art, m.anim, m.animT, m.state === 'windup' ? 0 : m.t > 0.15 ? 1 : 2, m.fx, m.fy);
  }

  /**
   * The picture of a fallen monster at this moment, and whether it has finished falling (it is
   * then its body: the last frame of its death). Null if its figure has no death painted: such a
   * one only bursts into its colours, as they all did until deaths were painted.
   */
  private fallenSprite(f: Fallen): { sp: Sprite; lying: boolean; since: number } | null {
    const art = this.art.bestiary.of(f.figure);
    const clip = (f.back ? art.back : art.front).clips?.die;
    if (!clip || clip.frames.length === 0) return null;
    const last = clip.frames.length - 1;
    const i = Math.floor(f.t * clip.fps);
    const sp = clip.frames[Math.min(last, i)];
    // (`since`: how long it has lain, in seconds)
    return { sp: f.flip ? flipSprite(sp) : sp, lying: i >= last, since: f.t - last / clip.fps };
  }

  /**
   * `pace` is how much game time this frame stands for, in sixtieths of a second: 1 on an ordinary
   * frame, 0 while paused, less in slow motion, 2 on a slow machine. Whatever is thrown into the
   * air every frame (flames off burning ground, snow, sparks) is thrown at that rate, so the game
   * looks the same on a fast screen and a slow one. It also thins out when the air is full.
   */
  draw(g: CanvasRenderingContext2D, W: number, H: number, game: Game, fx: Fx, t: number, pace = 1): Cam {
    const live = pace > 0;
    const amb = pace * fx.room();
    const art = this.art;
    const L = game.level;
    const f = L.floor;
    const h = game.hero;
    // (magic with no element word on it is violet, where a blade's blow is steel: a mage's, and
    // anyone's who carries a staff or a wand)
    const held = game.weapon();
    const arcane = h.cls === 'mage' || held === 'staff' || held === 'wand';
    fx.arcane = arcane;
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
    cam.ox = Math.round(va.x - (h.x - h.y) * 16) + fx.shakeX;
    cam.oy = Math.round(va.y + 12 - (h.x + h.y) * 8 + heroLift) + fx.shakeY;
    const stands = this.stands;
    stands.length = 0;
    this.labels.length = 0;
    this.marks.length = 0;
    this.monsterLit.length = 0;
    this.propLit.length = 0;
    const lowGrid = this.lowWalls(L);
    this.lowNow = lowGrid;
    // (THE WALLS' LOOK: where the hero is on the screen, for the walls that are seen through while they stand over them)
    this.wallHero = { x: wx(cam, h.x, h.y), y: wy(cam, h.x, h.y), d: h.x + h.y };

    g.fillStyle = P.black;
    g.fillRect(0, 0, W, H);

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
    for (let s = smin; s <= smax; s++) {
      for (let df = dmin; df <= dmax; df++) {
        if ((s + df) & 1) continue;
        const tx = (s + df) >> 1;
        const ty = (s - df) >> 1;
        if (tx < 0 || ty < 0 || tx >= f.w || ty >= f.h) continue;
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
          const sp = art.ground.floor(tx, ty);
          g.drawImage(sp.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
          // the shadow of a wall that stands over it (the light is from the upper left)
          // (THE WALLS' LOOK: a wall that is cut away throws no shadow)
          const gone = WALL_LOOK.away && WALL_LOOK.front === 'none';
          const wl = tx > 0 && f.tiles[idx - 1] === T_WALL && !(gone && lowGrid[idx - 1]);
          const wr = ty > 0 && f.tiles[idx - f.w] === T_WALL && !(gone && lowGrid[idx - f.w]);
          if (wl) g.drawImage(art.ground.shadeLeft.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
          if (wr) g.drawImage(art.ground.shadeRight.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
          if (!wl && !wr && tx > 0 && ty > 0 && f.tiles[idx - f.w - 1] === T_WALL) g.drawImage(art.ground.shadeCorner.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
          if (WALL_LOOK.front === 'none') {
            // (THE WALLS' LOOK: no wall is drawn toward the eye, and the floor's edge there is a line of light against the dark)
            if (tx + 1 < f.w && f.tiles[idx + 1] === T_WALL && lowGrid[idx + 1]) g.drawImage(art.ground.edgeRight.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
            if (ty + 1 < f.h && f.tiles[idx + f.w] === T_WALL && lowGrid[idx + f.w]) g.drawImage(art.ground.edgeLeft.img, px - sp.ax, py - sp.ay, sp.w, sp.h);
          }
          if (relief) this.lowEdges(g, relief, idx, tx, ty, px, py);
          if (relief && sunk) this.rimFaces(g, relief, idx, tx, ty, px, py);
        } else if (relief && kind === T_PIT) {
          this.pitTiles.push(idx, px, py);
        } else if (kind === T_WALL) {
          // (in town three tiles of the back wall are the gate: each carries its part of the arch, and the light in it moves)
          const part = L.town && ty === TOWN.gateWall.y ? tx - TOWN.gateWall.x : -1;
          if (part >= 0 && part < TOWN.gateWall.n) {
            const sp = art.ground.gate[Math.floor(t * 6) % art.ground.gate.length][part];
            this.stand(s + 1, sp, px, py);
            if (sp.lights) this.propLit.push({ s: sp, x: Math.round(px), y: Math.round(py) });
          } else if (WALL_LOOK.faces && !lowGrid[idx]) {
            // (THE WALLS' LOOK, `faces`: a wall is the upright planes behind the far edges of floor.
            // Which of a block's two faces have floor before them: render/walls.ts, `wallFaces`.)
            const which = wallFaces(f, idx);
            const n = art.ground.faceLeft.length;
            // (`hide` marks the stand just made: raised floor at a face's foot hides the foot of it)
            if (which & FACE_LEFT) {
              this.stand(s + 1, art.ground.faceLeft[v % n], px, py);
              if (relief) this.hide(tx + 0.5, ty + 0.5, 0);
            }
            if (which & FACE_RIGHT) {
              this.stand(s + 1, art.ground.faceRight[v % n], px, py);
              if (relief) this.hide(tx + 0.5, ty + 0.5, 0);
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
    // (on a level with ledges: the thing just stood up is hidden by raised ground in front of it)
    const hid = relief ? (x: number, y: number): void => this.hide(x, y, relief.lift(x, y)) : null;
    const veil = (sp: Sprite, sx: number, sy: number, depth: number): number => {
      if (sp.w < 60 || sp.h < 70 || h.x + h.y >= depth) return 1;
      const lx = heroX - (sx - sp.ax);
      const ly = heroY - (sy - sp.ay);
      // (the hero's middle, their head, and their feet)
      return spriteCovers(sp, lx, ly - 14) || spriteCovers(sp, lx, ly - 28) || spriteCovers(sp, lx, ly - 3) ? SEEN_THROUGH : 1;
    };
    for (const p of L.props) {
      if (!L.explored[p.ty * f.w + p.tx]) continue;
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y);
      if (sx < -40 || sx > W + 40 || sy < -30 || sy > H + 70) continue;
      let sp: Sprite | null = null;
      switch (p.kind) {
        case 'brazier': sp = art.props.brazier[(Math.floor(t * 8) + p.variant) % 4]; break;
        case 'chest': sp = p.state === 1 ? art.props.chestOpen : art.props.chest; break;
        case 'barrel': sp = p.state === 0 ? art.props.barrel : null; break;
        case 'urn': sp = p.state === 0 ? art.props.urn : null; break;
        case 'pillar': sp = art.props.pillar; break;
        case 'portal': sp = p.state === 1 ? art.props.portal[Math.floor(t * 7) % 4] : art.props.portalOff; break;
        // (the town's own things and its people: art/townscene.ts says which picture each shows)
        default:
          if (L.town && isTownsperson(p.kind)) {
            // (one of the town's people: turned to the hero if the hero has come right up to them)
            const to = turnedTo(p.x, p.y, game.hero.x, game.hero.y, this.folkTurn.get(p.kind) ?? null);
            this.folkTurn.set(p.kind, to);
            sp = townSprite(art, p.kind, p.variant, t, to);
          } else sp = L.town && !isTownFlat(p.kind) ? townSprite(art, p.kind, p.variant, t) : null;
          break;
      }
      if (sp) {
        this.stand(p.x + p.y, sp, sx, sy, null, 0, 1, veil(sp, sx, sy, p.x + p.y));
        hid?.(p.x, p.y);
        if (sp.lights) this.propLit.push({ s: sp, x: Math.round(sx), y: Math.round(sy) });
      }
    }
    this.standDoors(L, cam);
    // the town's services carry their names, so a newcomer can see what is where
    for (const st of L.stations) {
      const lift = NAME_LIFT[st.kind];
      const near = game.stationNear() === st.kind;
      const goal = this.goal === st.kind;
      const hop = goal ? Math.round(Math.abs(Math.sin(t * 9)) * 2) : 0;
      this.labels.push({ x: wx(cam, st.x, st.y), y: wy(cam, st.x, st.y) - lift - hop, text: STATION_NAME[st.kind], color: goal ? P.gd4 : near ? P.white : P.tl5 });
    }

    for (const dr of game.drops) {
      if (!L.explored[Math.floor(dr.y) * f.w + Math.floor(dr.x)]) continue;
      const sx = wx(cam, dr.x, dr.y);
      const sy = wy(cam, dr.x, dr.y);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      const pop = dr.age >= 0 && dr.age < 0.4 ? Math.sin((dr.age / 0.4) * Math.PI) * 9 : 0;
      const bob = dr.kind === 'word' || dr.kind === 'orb' ? Math.sin(t * 4 + dr.x) * 1.5 + 3 : 0;
      let sp: Sprite;
      if (dr.kind === 'gold') sp = art.icons.gold[dr.gold >= 30 ? 2 : dr.gold >= 8 ? 1 : 0];
      else if (dr.kind === 'orb') sp = art.icons.lifeOrb;
      else if (dr.kind === 'word' && dr.word) sp = art.icons.word[dr.word];
      else if (dr.item) sp = art.icons.item[dr.item.icon];
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
    }

    // a monster that is falling: it stands among the others until it lies (then it is drawn with the floor, above)
    for (const f of fx.fallen) {
      const sx = wx(cam, f.x, f.y);
      const sy = wy(cam, f.x, f.y);
      if (sx < -90 || sx > W + 90 || sy < -60 || sy > H + 130) continue;
      const shown = this.fallenSprite(f);
      if (!shown || shown.lying) continue;
      if (shown.sp.lights) this.monsterLit.push({ s: shown.sp, x: Math.round(sx), y: Math.round(sy) });
      this.stand(f.x + f.y, shown.sp, sx, sy, null, 0);
      hid?.(f.x, f.y);
    }
    for (const m of game.monsters) {
      if (m.dead || !m.seen) continue;
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
      const sp = this.monsterSprite(m);
      // (ice gives off no light)
      if (sp.lights && m.frozenT <= 0) this.monsterLit.push({ s: sp, x: Math.round(sx), y: Math.round(sy) });
      let over: Sprite | null = null;
      let overA = 0;
      if (m.flash > 0) {
        over = silhouette(sp, P.white);
        overA = 1;
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
      this.stand(m.x + m.y, sp, sx, sy, over, overA);
      hid?.(m.x, m.y);
      if (m.burnT > 0 && Math.random() < 0.55 * amb) fx.flames(m.x, m.y, 0.22, 1, 0.9);
      if (m.chillT > 0 && m.frozenT <= 0 && Math.random() < 0.12 * amb) fx.mote(m.x + (Math.random() - 0.5) * 0.5, m.y + (Math.random() - 0.5) * 0.5, [P.white, P.bu5]);
      if (m.poisonT > 0 && Math.random() < Math.min(0.5, 0.12 + m.poisonN * 0.05) * amb) fx.bubbles(m.x, m.y, 0.25, 1);
      // a guardian smoulders in the colour of its first word
      if (m.champion && m.words.length && Math.random() < 0.25 * amb) fx.mote(m.x + (Math.random() - 0.5) * 0.8, m.y + (Math.random() - 0.5) * 0.8, [WORD_COLOR[m.words[0]], P.white]);
    }

    {
      const sx = wx(cam, h.x, h.y);
      // (in a swipe move the hero is lifted by the move, from the height they left to the height
      // they land on, not by the ground they pass over: a leap up a ledge rises to it)
      let sy = relief ? wyFlat(cam, h.x, h.y) - heroLift : wy(cam, h.x, h.y);
      if (h.move && h.move.kind === 'leap') sy -= Math.sin(Math.min(1, h.move.t / h.move.dur) * Math.PI) * 24;
      // (a roll that goes over a ledge or a pit is a dive: it leaves the floor, a little)
      else if (h.move && h.move.over) sy -= Math.sin(Math.min(1, h.move.t / h.move.dur) * Math.PI) * 10;
      const heroArt = this.heroArt(game);
      const leapK = h.move && h.move.kind === 'leap' ? Math.min(1, h.move.t / h.move.dur) : -1;
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
      const top = heroArt.front.idle[0].ay + (game.meta.limit === 'mana' ? 2 : 0);
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
      const sp = fig.frame(heroArt, { anim: h.anim, animT: h.animT, fx: h.fx, fy: h.fy, attackSkill: this.clipOf(game), attackAge: h.attackAge, attackWind: h.attackWind, leapK, holdT: this.heldFor(game), holdAs: this.heldAs(game), rollK, fallT: this.fallT, reelT: this.reelT, reelBehind: this.reelBehind }, game.over ? sinceLook : pace / 60, (h.x - h.y) * 16, (h.x + h.y) * 8 - (wy(cam, h.x, h.y) - sy), calm);
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
      if (!(h.move && h.move.kind === 'roll' && !tumbles && Math.floor(t * 30) % 2 === 0)) {
        this.stand(h.x + h.y, sp, sx, sy, over, overA, 1, coming > 0 ? 1 - coming * coming * 0.85 : 1, fig, coming);
        if (relief && !h.move) this.hide(h.x, h.y, heroLift);
        this.heroLit = { x: Math.round(sx), y: Math.round(sy) };
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

    for (const p of game.projectiles) {
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y);
      if (sx < -20 || sx > W + 20 || sy < -20 || sy > H + 20) continue;
      if (p.look !== 'arrow' && p.look !== 'wave') {
        // (a familiar's bolt is a small bright mote; anything else that is not an arrow is a ball of light)
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

    stands.sort((a, b) => a.d - b.d);
    fx.heroShape = null;
    let cut = false;
    for (const st of stands) {
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

    // arrows are drawn as short lines so they can point any way; a Swift orb gets its tail here too
    for (const p of game.projectiles) {
      const sx = wx(cam, p.x, p.y);
      const sy = wy(cam, p.x, p.y) - 10;
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
        for (let j = layers + 2; j >= 0; j--) {
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
      // Swift: a long pale streak behind the arrow
      if (swift) pline(g, sx - ux * 24, sy - uy * 24, sx - ux * 6, sy - uy * 6, twin ? P.tl3 : P.gn4);
      const body = power ? 10 : swift ? 9 : leech || volatile || twin ? 8 : 6;
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
      g.fillRect(Math.round(sx - 2), Math.round(sy + 10), 4, 1);
      g.globalAlpha = 1;
    }

    // ---- darkness, with holes cut by every light ----------------------------------------------
    this.light(W, H, game, t, fx);
    g.drawImage(this.dark, 0, 0);

    // ---- things that glow, then text ----------------------------------------------------------
    // what shines on the hero (a lit blade, a crystal, a feather)
    if (this.heroLit) this.figure.lights(g, this.heroLit.x, this.heroLit.y);
    // and on the monsters: eyes in the dark, a cultist's fire, the Warden's maul going hot
    for (const q of this.monsterLit) drawLights(g, q.s, q.x, q.y);
    // and on what stands in the dungeon: a brazier's fire, an open portal
    for (const q of this.propLit) drawLights(g, q.s, q.x, q.y);
    // A beam that is being held (the owner: "Fires towards your finger ... You can move the beam
    // around in different directions as long as you hold down"). The rules bite along it five
    // times a second; the picture of it is told where it runs every frame, so it turns with the
    // finger. From the hero, the way they face, to the first wall. A Twin pair shows both.
    const ch = h.channel;
    const beaming = ch ? h.skills[ch.skill] : null;
    if (ch && beaming && SKILLS[beaming.id].kind === 'beam') {
      const def = SKILLS[beaming.id];
      const half = def.radius * beaming.r.size;
      const words = beaming.front.filter((w) => w !== null) as WordId[];
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
      if (z.kind !== 'storm' || this.skip.has('cloud')) continue;
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
      if (z.kind !== 'venom' || this.skip.has('cloud')) continue;
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
    if (!this.skip.has('fx')) fx.drawAir(g, cam);
    this.drawWordDrops(g, W, H, game, t);
    this.drawBeacon(g, game, t);
    this.drawBars(g, game, t);
    this.drawLabels(g, W);
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
    dg.fillStyle = L.town ? 'rgba(8,5,14,0.45)' : `rgba(6,4,14,${FAR_DARK})`;
    dg.fillRect(0, 0, W, H);
    dg.globalCompositeOperation = 'destination-out';
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
    if (!L.town) spot(wx(cam, h.x, h.y), wy(cam, h.x, h.y) - 8, NEAR_POOL, NEAR_LIFT);
    spot(wx(cam, h.x, h.y), wy(cam, h.x, h.y) - 8, L.town ? 170 : 165, 1);
    // (the town's gate lights the floor before it)
    if (L.town) spot(wx(cam, TOWN.gate.x, TOWN.gate.y), wy(cam, TOWN.gate.x, TOWN.gate.y) - 14, 84 + Math.sin(t * 3) * 3, 0.9);
    for (const p of L.props) {
      if (!L.explored[p.ty * f.w + p.tx]) continue;
      if (p.kind === 'brazier') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 14, 62 + Math.sin(t * 9 + p.variant) * 3, 0.9);
      else if (p.kind === 'portal' && p.state === 1) spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 16, 70, 0.9);
      else if (p.kind === 'lexicon') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 14, 46 + Math.sin(t * 3) * 3, 0.8);
      else if (p.kind === 'forge') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 6, 60 + Math.sin(t * 9) * 3, 0.9);
      else if (p.kind === 'tentTable') spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 18, 56, 0.8);
      else if (p.kind === 'runeSlab') spot(wx(cam, p.x, p.y) + 8, wy(cam, p.x, p.y) - 12, 64 + Math.sin(t * 2) * 3, 0.75);
    }
    for (const p of game.projectiles) spot(wx(cam, p.x, p.y), wy(cam, p.x, p.y) - 10, p.hostile ? 16 : p.look === 'mote' ? 14 : p.look === 'wave' ? 34 : 26, 0.8);
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
      else if (d.kind === 'orb' || (d.kind === 'item' && d.item && d.item.rarity >= 2)) spot(wx(cam, d.x, d.y), wy(cam, d.x, d.y) - 4, 18, 0.7);
    }

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
    if (!this.skip.has('vignette')) dg.drawImage(this.vignette(W, H, L.town ? VIGNETTE_TOWN : VIGNETTE), 0, 0);
  }

  private drawBars(g: CanvasRenderingContext2D, game: Game, t: number): void {
    const cam = this.cam;
    for (const m of game.monsters) {
      if (m.dead || !m.seen || m.boss) continue;
      // (the enemy locked onto always shows its life: it is the one being fought)
      if (m.barT <= 0 && !m.elite && m.id !== this.lockId) continue;
      // (over its head as it stands: a club or a sword raised above it passes in front of the bar)
      const sx = Math.round(wx(cam, m.x, m.y));
      const sy = Math.round(wy(cam, m.x, m.y)) - FIGURE_SIZE[figureOf(m)].top - 5;
      const w = m.champion ? 34 : m.elite ? 24 : 16;
      g.fillStyle = P.ink;
      g.fillRect(sx - w / 2 - 1, sy - 1, w + 2, 4);
      g.fillStyle = P.bl1;
      g.fillRect(sx - w / 2, sy, w, 2);
      g.fillStyle = m.elite ? P.fr4 : P.bl4;
      g.fillRect(sx - w / 2, sy, Math.max(0, Math.round((w * m.life) / m.maxLife)), 2);
      if (m.elite) drawText(g, m.name, sx, sy - 8, m.words.length ? WORD_COLOR[m.words[0]] : P.fr4, { align: 'center', font: 'small', shadow: P.ink });
    }
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
    // The word a monster carries hangs over its head as its rune stone: what you see is what its
    // death will leave on the floor.
    for (const m of game.monsters) {
      if (m.dead || !m.seen || !(m.elite || m.boss)) continue;
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
