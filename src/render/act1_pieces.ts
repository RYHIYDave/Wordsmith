// ACT 1, THE DESCENT, DRAWN: EACH FLOOR'S OWN PIECES (where game/act1_dress.ts has laid them), AND WHAT STANDS ON
// ITS TOPS. The art chat's pictures (art/floor6.ts to floor10.ts, art/act1_camp.ts, art/redoubt.ts), by name, set
// as its mock-ups set them (src/dev/preview_quarry.ts and the rest, each with his yes):
//   a floor tile in place of the ground there, anchored at its tile's top corner;
//   what stands, at its place, in depth, with the game's soft shadow under it (`shadow`); a tall one seen through
//     while someone stands behind it (the game's SEEN_THROUGH), as the planning chat's rule has it for "tall things
//     that stand in front (pillars, trees, spires)";
//   what burns or stirs (a watchfire, the cult's braziers and banners, its ring, its obelisks) at 8 frames a second;
//   the game's barrels and urns as the floor's own two breakables (or the camp's);
//   its trap as the spike floor's beat: still, glinting as it warns, then sprung;
//   (ACT 2, THE HUSH) ITS MOMENT AROUND THE HERO, the art chat's film for the floor (art/floor11_moments.ts to
//     floor15_moments.ts), where game/act2_moments.ts laid it: played as the first five floors' are (render/pieces.ts), once,
//     as he comes near it and sees it, by the game's clock, at 30 frames a second, the screen kicked at each of its jolts;
//     what was there before (`before`) until then, what is left (`after`) once it is over; in depth at its anchor among the
//     figures, or over every one of them (the pigeons, as the art's own page draws them: they swoop out over his head).
// THE TOPS: the cliffs' (the Quarry, the Ledge Road, Echo Canyon), dressed by the planning chat's rule, with his yes
// ("If we really decorate the tops of the cliffs it will look really good"): on a grid, each spot one of the
// floor's own picks, kept only where it stands clear of the floor (art/terrain.ts, clearOfFloor), drawn `rise`
// up; the forest's and the water's (the Pinewood, the Fen: no walls) anywhere off the floor and the river,
// the tall ones seen through. Laid a piece of the ground at a time, as the ground is painted (render/outdoor.ts).

import { campPieces } from '../art/act1_camp';
import type { Piece } from '../art/floor1';
import { quarryPieces } from '../art/floor6';
import { ledgePieces } from '../art/floor7';
import { canyonPieces } from '../art/floor8';
import { pinewoodPieces } from '../art/floor9';
import { fenPieces } from '../art/floor10';
import { redoubtPieces } from '../art/redoubt';
import { hushSetPieces } from '../art/act2_set';
import { gateWardPieces } from '../art/floor11';
import { undercityPieces } from '../art/floor12';
import { WHEEL_STEPS, WHEEL_TURN, millracePieces } from '../art/floor13';
import { houseOfQuietPieces } from '../art/floor14';
import { greatLibraryPieces } from '../art/floor15';
import { herVinesPieces, swanGardensPieces } from '../art/floor16';
import { highCitySetPieces } from '../art/high_city_set';
import { masquePieces } from '../art/floor17';
import { glassGalleryPieces } from '../art/floor18';
import { keepPieces } from '../art/floor19';
import { hubPieces } from '../art/hub2';
import { CAMP_ANIM, CAMP_DRESS, CAMP_TOPS } from '../game/camp';
import { GRAIN, clearOfFloor, fbm, pictureOf, worldOf } from '../art/terrain';
import type { Terrain } from '../art/terrain';
import type { Sprite } from '../engine/px';
import type { MomentFilm } from '../art/films';
import { ACT1_SETS, CAMP } from '../game/act1_dress';
import type { Act1Dress, Act1Tile } from '../game/act1_dress';
import type { Land } from '../game/act1_layout';
import type { HushMoment } from '../game/act2_moments';
import type { Game } from '../game/game';
import type { Level, PropInst } from '../game/state';
import { SPIKE, SPIKE_BEAT, spikeAt } from '../game/traps';
import type { HazardSpot } from '../game/types';
import { PINE_PATH, laneDist } from '../game/act1_layout';
import { EXITS, ONWARD, START, turnAB } from '../game/ways';
import type { AB } from '../game/ways';
import type { Kick } from './dress';
import { wx, wy } from './fx';
import type { Cam } from './fx';
import { PIECE } from './outdoor';
// (THE RIVERS FLOWING and the livelier wheel, the art chat's, behind FLOW)
import { FLOW } from '../art/flowing';
import type { Painter } from './painter';

const MAPS = new Map<number, Map<string, Piece>>();
/** The pieces of floor `n` of the descent (6 to 10) by name, with the set's camp and the strongholds' (made the first time they are asked for, and kept until `forgetAct1`). */
export function act1Pieces(n: number): Map<string, Piece> {
  let m = MAPS.get(n);
  if (m) return m;
  // (THE CAMP INSIDE VELLUM'S GATE, game/camp.ts: the Gate Ward's pieces, the Hush's set and the hub's own, art/hub2.ts)
  if (n === CAMP_DRESS) {
    m = new Map<string, Piece>([...hushSetPieces(), ...gateWardPieces(), ...(hubPieces() as unknown as Piece[])].map((p) => [p.name, p]));
    MAPS.set(n, m);
    return m;
  }
  // (ACT 2, PART TWO, THE HIGH CITY: each floor's own 25 and the High City's 25, the art chat's; floor 16 her vines in its gardens too)
  if (n >= 16) {
    m = new Map([...highCitySetPieces(), ...(n === 19 ? keepPieces() : n === 18 ? glassGalleryPieces() : n === 17 ? masquePieces() : [...swanGardensPieces(), ...herVinesPieces()])].map((p) => [p.name, p]));
    MAPS.set(n, m);
    return m;
  }
  // (ACT 2, THE HUSH: each floor's own 25 and the set's 25 of the Hush, the art chat's; nothing of the descent's camp or strongholds)
  if (n >= 11) {
    const own2 = n === 11 ? gateWardPieces() : n === 12 ? undercityPieces() : n === 13 ? millracePieces() : n === 14 ? houseOfQuietPieces() : greatLibraryPieces();
    m = new Map([...hushSetPieces(), ...own2].map((p) => [p.name, p]));
    MAPS.set(n, m);
    return m;
  }
  const own = n === 6 ? quarryPieces() : n === 7 ? ledgePieces() : n === 8 ? canyonPieces() : n === 9 ? pinewoodPieces() : fenPieces();
  // (the strongholds' gatehouse, court, altar, braziers and banners are the Quarry's: art/floor6.ts; the hall's, the redoubt's)
  const shared = n === 6 ? [] : quarryPieces().filter((p) => p.name.startsWith("the redoubt's") || p.name.startsWith("the court's") || p.name === 'the altar of the words' || p.name === "the cult's brazier" || p.name === "the cult's banner" || p.name === 'pine' || p.name === 'boulder');
  m = new Map([...campPieces(), ...redoubtPieces(), ...shared, ...own].map((p) => [p.name, p]));
  MAPS.set(n, m);
  return m;
}
/** Let go of every floor's pieces but this one's. */
export function forgetAct1(keep: number): void {
  for (const k of [...MAPS.keys()]) if (k !== keep) MAPS.delete(k);
}

/** The pieces that move (their frames a loop), at LOOP_FPS; every other's frames are its looks, one a place. */
const MOVING = new Set(['a brazier on its tripod', "the cult's watchfire", "the cult's cauldron", "the cult's brazier", "the cult's banner", "the cult's ring of magic", 'the half-cut obelisk', "the cult's obelisk", "the redoubt's gatehouse",
  // (THE HIGH CITY, FLOOR 19, THE KEEP: its honest fire, its frames over and over: the braziers, the pitch heating, the torches on the walls)
  'a brazier', 'a cauldron of pitch', 'a torch in its sconce']);
const LOOP_FPS = 8;
/**
 * ACT 2, THE BELLS (game/bells.ts): THE BELLS' PICTURES BY THEIR STATE. A small bell's frames are the art's: quiet, awake (ready
 * to ring), rung one way, rung back; its prop's `state` 0 quiet, 1 awake, 2 rung (swinging one way and back as long as it rings),
 * 3 rung out (BELL_STILL: hanging quiet again once the event is over). The Muffled Bell's: gagged, then swinging (straight, one
 * way, the other); `state` 0 gagged, 1 torn loose and swinging, 3 torn loose and hanging still.
 */
export const SMALL_BELLS: ReadonlySet<string> = new Set(["a wayside shrine's bell", "a shop's doorbell", "the watch's alarm bell", 'an alarm bell at a sluice', 'a farm bell on its post', "a patient's call bell", 'a hand bell']);
export function isMuffledBell(name: string): boolean {
  return name.endsWith('(the Muffled Bell)');
}
/** The frame a bell shows in its state at time `t`, or null: not a bell. */
export function bellFrame(name: string, state: number, t: number): number | null {
  if (SMALL_BELLS.has(name)) return state <= 0 || state === 3 ? 0 : state === 1 ? 1 : 2 + (Math.floor(t * 3) % 2);
  if (isMuffledBell(name)) return state <= 0 ? 0 : state === 3 ? 1 : [1, 2, 1, 3][Math.floor(t * 4) % 4];
  return null;
}

/** What is seen through while someone is behind it: anything this tall (game pixels), as the planning chat's rule has it. */
export const SEE_TALL = 44;
/**
 * (ACT 2, THE HUSH: THE MILLRACE'S TRAPS THAT STAND, game/act2/millrace.ts: their pictures stand in depth where they are, not
 * laid on the floor as the descent's are, and go by the beat of their trap, the spike floor's, game/traps.ts. The stamping
 * mill, the art's four frames: at rest while it is down, its hammers lifted high through the warning, falling as it strikes
 * and then struck (art/floor13.ts). The water wheel turns with its race, a quarter of a paddle a frame at WHEEL_FPS (a
 * paddle a half second, a turn eight seconds), and through its trap's warning and blow it thrashes round WHEEL_RUSH times
 * as fast, the paddles striking the strip beside it.)
 */
const STANDING_TRAPS = new Set(['the water wheel', 'the stamping mill']);
const WHEEL_FPS = 8;
const WHEEL_RUSH = 3;
/** (ACT 2, THE HUSH) The pieces the art drew a picture of their own for being seen through, and which of their frames it is: the Millrace's drying lines, the sheets half there (art/floor13.ts). */
const SEEN_FRAME: Readonly<Record<string, number>> = { 'drying lines': 1 };

/**
 * (ACT 2, THE HUSH: ITS MOMENT AROUND THE HERO.) It plays when he comes this near its anchor (tiles) and sees where it is, at the
 * films' own speed; the screen's kick at its first jolt and at each after (game pixels), and the blow heard with it: the first
 * five floors' own numbers (render/pieces.ts). The House of Quiet's makes no sound (the art: "In the House of Quiet it makes no
 * sound at all"): its kick is not heard. Drawn OVER every figure: this deep in the sort.
 */
const MOMENT_NEAR = 5.5;
const MOMENT_FPS = 30;
const MOMENT_KICK = 3;
const MOMENT_VOL = 0.45;
const SILENT_MOMENTS: ReadonlySet<number> = new Set([14]);
const OVER_ALL = 1e9;
/**
 * (ACT 2) HE SEES IT when, near enough, the thing it plays at is on his screen, MOMENT_IN game pixels in from its edges at least:
 * the point MOMENT_UP game pixels over its anchor, floor by floor (the art's numbers: the pigeons on their ridge, GW_RISE + 2
 * picture pixels up, and their bodies over that; the culvert at the walkways' height; the middle of the whirl to come, standing
 * up a tile and more behind the anchor and taller than a man; the screen's middle; the chandelier's candles over its hoop, 42 game
 * pixels up). (The first floors' moments ask only that the tile be in his sight, render/pieces.ts; on a phone's screen the Gate
 * Ward's roofs are at its very top, and pigeons that burst off a roof he is not shown would be gone before he saw them.) And the
 * tile it is seen from in his sight (HushMoment.seen), as the first floors'.
 */
const MOMENT_UP: Readonly<Record<number, number>> = { 11: 84, 12: 0, 13: 64, 14: 20, 15: 60 };
const MOMENT_IN = 18;
/** (ACT 2) A moment's state on the level: waiting, playing (since `t0`, by the game's clock), over; and whether it was on his screen when last drawn. */
interface HushPlayed {
  host: HushMoment;
  state: 'wait' | 'play' | 'done';
  t0: number;
  last: number;
  shown: boolean;
}

/** A thing on the tops: where (world, at the floor's level under it), its picture, how far up it is drawn (game pixels), its shadow. */
export interface Top {
  x: number;
  y: number;
  sp: Sprite;
  lift: number;
  shadow: number;
  tall: boolean;
}

export class Act1Pieces {
  private level: Level | null = null;
  private dress: Act1Dress | null = null;
  private map: Map<string, Piece> | null = null;
  private tiles = new Map<number, Act1Tile>();
  private tops = new Map<number, Top[]>();
  private land: Land | null = null;
  /** (EXITS, floors 6 to 10) Where the way on's and the start's pieces stand (game/ways.ts ONWARD, START; the art chat's pictures): tile middles that nothing of the tops stands on, or over on the screen in front of. */
  private keepClear: { x: number; y: number }[] = [];
  /** (ACT 2) A standing trap's own trap (its hazard), found the first time it is drawn. */
  private beatOf = new Map<PropInst, HazardSpot | null>();
  /** (ACT 2, THE HUSH) The floor's moment, and the screen's kicks its jolts have asked for since they were last taken. */
  private played: HushPlayed[] = [];
  private kicked: Kick[] = [];

  /** This frame's level: its pieces looked up anew when it is another than last time's. */
  begin(L: Level): boolean {
    if (L === this.level) return this.dress !== null;
    this.level = L;
    this.dress = L.act1 ?? null;
    this.land = L.land ?? null;
    this.keepClear = keepClearOf(L);
    this.tiles.clear();
    this.tops.clear();
    this.beatOf.clear();
    this.stands.clear();
    this.played = (this.dress?.moments ?? []).map((host) => ({ host, state: 'wait', t0: 0, last: -1, shown: false }));
    if (!this.dress) {
      this.map = null;
      return false;
    }
    this.map = act1Pieces(this.dress.floor);
    for (const t of this.dress.tiles) this.tiles.set(t.i, t);
    return true;
  }

  piece(name: string): Piece | undefined {
    return this.map?.get(name);
  }

  /** The floor's own tiles laid on the ground (call after the ground, before what lies on it). */
  floorTiles(g: CanvasRenderingContext2D, wxy: (x: number, y: number) => readonly [number, number], W: number, H: number): void {
    const L = this.level;
    if (!L || !this.dress) return;
    const f = L.floor;
    for (const t of this.dress.tiles) {
      const tx = t.i % f.w;
      const ty = (t.i - tx) / f.w;
      // (ACT 2, THE HUSH: one laid by its middle, on its tile's middle: Act1Tile.mid)
      const mid = t.mid ? 0.5 : 0;
      const [sx, sy] = wxy(tx + mid, ty + mid);
      if (sx < -40 || sx > W + 40 || sy < -30 || sy > H + 30) continue;
      const p = this.piece(t.name);
      const sp = p?.frames?.[t.frame % (p.frames.length || 1)];
      if (sp) g.drawImage(sp.img, Math.round(sx) - sp.ax, Math.round(sy) - sp.ay, sp.w, sp.h);
    }
  }

  /** The picture of one of the floor's props at time `t` (a piece by its name; a barrel or urn as the floor's breakables); undefined: not one of the floor's. (ACT 2: `now`, the game's clock, for a trap that stands.) */
  sprite(p: PropInst, t: number, now = t): Sprite | null | undefined {
    if (!this.dress) return undefined;
    if (p.kind === 'barrel' || p.kind === 'urn') {
      const set = ACT1_SETS[this.dress.floor];
      const name = p.variant >= 100 ? CAMP.breakables[(p.variant - 100) % CAMP.breakables.length] : set.breakables[p.kind === 'barrel' ? 0 : 1];
      const fr = this.piece(name)?.frames;
      if (!fr) return undefined;
      return p.state === 1 ? fr[1] ?? null : fr[0];
    }
    if (p.kind !== 'piece' || !p.name) return undefined;
    const pc = this.piece(p.name);
    const fr = pc?.frames;
    // (ACT 2, THE BELLS: a bell's picture is its state's: game/bells.ts sets it)
    const bell = bellFrame(p.name, p.state, t);
    if (!fr || fr.length === 0) {
      // (ACT 2, THE HUSH: A WALL PIECE, the art's 'on the wall' with its frames on each face (art/floor1.ts Piece: left, right),
      // laid by its floor's dresser at a point of the wall's foot line: `variant` & 1 the face (0 the face turned to the
      // screen's left, a wall running along x with the floor on its greater-y side; 1 the face turned to the screen's right,
      // a wall along y, the floor on its greater-x side), `variant` >> 1 its frame; a bell on the wall its state's frame)
      const side = p.variant & 1 ? pc?.right : pc?.left;
      if (!side || side.length === 0) return null;
      // (a wall piece that moves (MOVING: floor 19's torches): its frames over and over, from its own)
      if (bell === null && MOVING.has(p.name)) return side[(Math.floor(t * LOOP_FPS) + (p.variant >> 1)) % side.length] ?? null;
      return side[(bell ?? p.variant >> 1) % side.length] ?? null;
    }
    if (bell !== null) return fr[bell % fr.length] ?? fr[0];
    if (p.name === "the redoubt's gatehouse") return p.state === 1 ? fr[4] ?? fr[0] : fr[Math.floor(t * 6) % 4];
    if (p.name === "the waystation's gate") return fr[(p.state === 1 ? 1 : 0) + (p.variant & 1 ? 2 : 0)] ?? fr[0];
    // (THE HIGH CITY, FLOOR 17: THE GREAT EBONY CLOCK, its six frames for the way it stands (its variant the first): its pendulum's
    // four over and over at its slow beat, a swing each 0.6 s; at its chime (its state 1: game/act2/masque_rules.ts) the hammer
    // drawn back and the bell struck, turn about)
    if (p.name === 'the great ebony clock') return fr[p.variant + (p.state === 1 ? 4 + (Math.floor(t * 3) % 2) : Math.floor(t / 0.6) % 4)] ?? fr[0];
    if (MOVING.has(p.name)) return fr[(Math.floor(t * LOOP_FPS) + p.variant) % fr.length];
    // (THE CAMP, game/camp.ts: what moves there, at the art chat's own frames a second: the cooking fire, the field forge, the lamps)
    const fps = this.dress.floor === CAMP_DRESS ? CAMP_ANIM.get(p.name) : undefined;
    if (fps) return fr[(Math.floor(t * fps) + p.variant) % fr.length];
    if (STANDING_TRAPS.has(p.name)) return this.standingTrap(p, fr, now);
    return fr[p.variant % fr.length];
  }

  /** (ACT 2, THE HUSH) Whether a spike floor's patch is the trap of a piece that stands (STANDING_TRAPS): it strikes in that picture, and the game's own spikes do not come up out of it (render.ts standHazards). */
  standsFor(h: HazardSpot): boolean {
    let v = this.stands.get(h);
    if (v === undefined) {
      v = !!this.level?.props.some((p) => p.kind === 'piece' && !!p.name && STANDING_TRAPS.has(p.name) && trapOf(p, h));
      this.stands.set(h, v);
    }
    return v;
  }
  private stands = new Map<HazardSpot, boolean>();

  /** (ACT 2, THE HUSH) A piece's own picture for being seen through (SEEN_FRAME), or null: drawn whole in place of it while someone is behind it. */
  seenOf(p: PropInst): Sprite | null {
    if (p.kind !== 'piece' || !p.name) return null;
    // (THE HIGH CITY, FLOOR 16: a rose arbour half there while someone is under it or behind it, the art's own picture of it:
    // its frames whole and half along x, whole and half along y, art/floor16.ts)
    if (p.name === 'a rose arbour') return this.piece(p.name)?.frames?.[(p.variant & 2) + 1] ?? null;
    const k = SEEN_FRAME[p.name];
    return k === undefined ? null : this.piece(p.name)?.frames?.[k] ?? null;
  }

  /**
   * (ACT 2, THE HUSH) A trap that stands, its frame by its trap's beat (STANDING_TRAPS): its trap the hazard under it or beside
   * it. The wheel: its variant 4 looking along +x (0 along +y), and 8 more turning back (its race running toward -y).
   */
  private standingTrap(p: PropInst, fr: readonly Sprite[], now: number): Sprite {
    let s = this.beatOf.get(p);
    if (s === undefined) {
      s = this.level?.floor.hazards?.find((h) => trapOf(p, h)) ?? null;
      this.beatOf.set(p, s);
    }
    if (p.name === 'the stamping mill') {
      if (!s) return fr[0];
      const at = spikeAt(s, now);
      return at.at === 'down' ? fr[0] : at.at === 'warn' ? fr[1] ?? fr[0] : fr[at.k < 0.12 ? 2 : 3] ?? fr[0];
    }
    // (the wheel: how far round it has come, its rushes through each beat's warning and blow added on)
    let turned = now * WHEEL_FPS;
    if (s) {
      const u = now + (s.phase ?? 0);
      const beats = Math.floor(u / SPIKE_BEAT);
      const into = Math.max(0, u - beats * SPIKE_BEAT - SPIKE.down);
      turned += (WHEEL_RUSH - 1) * WHEEL_FPS * (beats * (SPIKE.warn + SPIKE.up) + into);
    }
    // (FLOW, the art chat's livelier wheel, art/floor13.ts: WHEEL_STEPS frames to a paddle, four rounds of them: along +y forward
    // and back, along +x the same; when its frames were made with FLOW on)
    if (FLOW.on && fr.length >= 4 * WHEEL_STEPS) {
      const st = Math.floor((turned * WHEEL_TURN) / WHEEL_FPS);
      const kk = ((st % WHEEL_STEPS) + WHEEL_STEPS) % WHEEL_STEPS;
      return fr[(p.variant & 4 ? 2 : 0) * WHEEL_STEPS + (p.variant & 8 ? WHEEL_STEPS : 0) + kk] ?? fr[0];
    }
    const k = ((Math.floor(turned) % 4) + 4) % 4;
    return fr[(p.variant & 4) + (p.variant & 8 ? 3 - k : k)] ?? fr[0];
  }

  /** Whether a prop of the floor's lies flat (drawn with what lies on the floor, before everything that stands). */
  lies(p: PropInst): boolean {
    if (p.kind !== 'piece' || !p.name) return false;
    const pc = this.piece(p.name);
    return pc?.kind === 'on the floor' && p.name !== 'rope rail' && p.name !== 'cattails';
  }

  /** Its soft shadow's reach (tiles), or 0. */
  shadowOf(p: PropInst): number {
    if (p.kind === 'barrel' || p.kind === 'urn') return p.state === 0 ? 0.24 : 0;
    if (p.kind !== 'piece' || !p.name) return 0;
    return this.piece(p.name)?.shadow ?? 0;
  }

  /** THE TRAP'S PICTURE at a moment of its beat: still, glinting (its warning), then sprung (its frames on). */
  trapFrame(at: 'down' | 'warn' | 'up', k: number): Sprite | null {
    const set = this.dress ? ACT1_SETS[this.dress.floor] : null;
    const fr = set?.trap ? this.piece(set.trap.name)?.frames : null;
    if (!fr || !fr.length) return null;
    const sp = at === 'down' ? fr[0] : at === 'warn' ? fr[1] ?? fr[0] : fr[Math.min(fr.length - 1, 2 + Math.floor(k * (fr.length - 2)))] ?? fr[fr.length - 1];
    // (the drill holes' spikes come up out of each of its holes: drawn as the game draws its spikes, by `drillSpike`; the others' sprung frames)
    // (ACT 2, THE HUSH: its traps' pictures are the art's pieces (art/act2_kit.ts), anchored at their middle, not a floor tile's
    // top corner: drawn at the tile's top corner (render.ts), each is moved down half a tile, its middle on the tile's middle)
    return this.dress && this.dress.floor >= 11 ? this.atMiddle(sp) : sp;
  }
  /** (ACT 2, THE HUSH) Whether the floor's trap is its own pictures alone when sprung (the spilled tonic's cloud): no iron spikes come up out of it (render.ts standHazards). */
  ownSprung(): boolean {
    return !!this.dress && this.dress.floor >= 11;
  }
  private middles = new Map<Sprite, Sprite>();
  /** (ACT 2) A picture anchored at its middle, as drawn at a tile's top corner: its anchor half a tile (8 game pixels) up. */
  private atMiddle(sp: Sprite): Sprite {
    let m = this.middles.get(sp);
    if (!m) {
      m = { ...sp, ay: sp.ay - 8 };
      this.middles.set(sp, m);
    }
    return m;
  }

  /**
   * (ACT 2, THE HUSH: A TRAP WITH A PICTURE OF ITS OWN, game/act1_dress.ts Act1Trap: floor 12's flood and slick.) Its
   * picture at a moment of its beat and the world point it stands at, drawn once there; null: nothing to draw; undefined:
   * not one of those (drawn as the floor's one trap, a tile at a time, `trapFrame`).
   */
  trapOf(s: HazardSpot, at: 'down' | 'warn' | 'up', k: number): { sp: Sprite; x: number; y: number } | null | undefined {
    const list = this.dress?.traps;
    if (!list) return undefined;
    const t = list.find((q) => q.x === s.x && q.y === s.y && q.w === s.w && q.h === s.h);
    if (!t) return undefined;
    const fr = this.piece(t.name)?.frames;
    const pick = at === 'down' ? t.down : at === 'warn' ? t.warn : t.up;
    const n = pick.length ? pick[Math.max(0, Math.min(pick.length - 1, Math.floor(k * pick.length)))] : -1;
    const sp = fr && n >= 0 ? fr[n] ?? null : null;
    return sp ? { sp, x: t.at.x, y: t.at.y } : null;
  }

  // ---------------------------------------------------------------------------------------------------
  // (ACT 2, THE HUSH) ITS MOMENT AROUND THE HERO

  /**
   * A step of the floor's moment: one waiting whose film the painter has made plays as he comes within MOMENT_NEAR of its anchor
   * and sees it (its `seen` tile in his sight, and it on his screen when last drawn: MOMENT_UP); one playing has its jolts kick
   * the screen; one over stays over. Without a painter (or on a device without the room for its film) it never plays, and
   * nothing of it is drawn.
   */
  stepMoments(game: Game, painter: Painter | null): void {
    if (!this.played.length) return;
    const L = game.level;
    const h = game.hero;
    const now = game.time;
    for (const pm of this.played) {
      if (pm.state === 'done') continue;
      const film = painter?.filmOf<MomentFilm>(pm.host.key) ?? null;
      if (pm.state === 'wait') {
        if (!film || !pm.shown || Math.hypot(h.x - pm.host.x, h.y - pm.host.y) > MOMENT_NEAR || L.visible[pm.host.seen] !== 1) continue;
        pm.state = 'play';
        pm.t0 = now;
        pm.last = -1;
      }
      if (!film) {
        pm.state = 'done';
        continue;
      }
      const k = Math.floor((now - pm.t0) * MOMENT_FPS);
      for (let f = pm.last + 1; f <= Math.min(k, film.frames.length - 1); f++) {
        const j = film.jolts.indexOf(f);
        if (j >= 0) this.kicked.push({ amount: j === 0 ? MOMENT_KICK : MOMENT_KICK - 1, vol: this.dress && SILENT_MOMENTS.has(this.dress.floor) ? 0 : MOMENT_VOL });
      }
      pm.last = k;
      if (k >= film.frames.length) pm.state = 'done';
    }
  }

  /** The kicks of the moment's jolts since this was last asked (render.ts hands them to main.ts, which kicks the screen and sounds a blow for each that is heard). */
  kicks(): Kick[] {
    const out = this.kicked;
    this.kicked = [];
    return out;
  }

  /** (for the tests and the playtests) The floor's moment and its state: waiting, playing or over. */
  momentStates(): { host: HushMoment; state: 'wait' | 'play' | 'done' }[] {
    return this.played.map((pm) => ({ host: pm.host, state: pm.state }));
  }

  /**
   * The floor's moment, stood among what stands: `stand(depth, picture, x, y, columns)`, its depth its anchor's (world x + y) or
   * OVER_ALL; `columns`, where given, the screen's columns it is shown between (the surge: its channel's straight run).
   */
  standMoments(game: Game, painter: Painter | null, cam: Cam, W: number, H: number, stand: (d: number, sp: Sprite, x: number, y: number, columns: [number, number] | null) => void): void {
    for (const pm of this.played) {
      const film = painter?.filmOf<MomentFilm>(pm.host.key) ?? null;
      if (!film) continue;
      const now = game.time;
      let sp: Sprite | null = null;
      if (pm.state === 'wait') sp = film.before && film.before.length ? film.before[Math.floor(now * LOOP_FPS) % film.before.length] : null;
      else {
        const k = Math.floor((now - pm.t0) * MOMENT_FPS);
        if (pm.state === 'play' && k < film.frames.length) sp = film.frames[Math.max(0, k)];
        else sp = film.after && film.after.length ? film.after[Math.floor(now * LOOP_FPS) % film.after.length] : film.frames[film.frames.length - 1] ?? null;
      }
      if (!sp) continue;
      const host = pm.host;
      const x = Math.round(wx(cam, host.x, host.y));
      const y = Math.round(wy(cam, host.x, host.y));
      const up = y - (MOMENT_UP[this.dress?.floor ?? 0] ?? 0);
      pm.shown = x >= MOMENT_IN && x <= W - MOMENT_IN && up >= MOMENT_IN && up <= H - MOMENT_IN;
      if (x - sp.ax > W || x - sp.ax + sp.w < 0 || y - sp.ay > H || y - sp.ay + sp.h < 0) continue;
      const columns: [number, number] | null = host.span ? [Math.round(wx(cam, host.span[0], host.y)), Math.round(wx(cam, host.span[1], host.y))] : null;
      stand(host.over ? OVER_ALL : host.x + host.y, sp, x, y, columns);
    }
  }

  // ---------------------------------------------------------------------------------------------------
  // THE TOPS

  /** What stands on the tops in the ground's piece (i, j) (picture pixels: PIECE square), laid the first time it is asked for. */
  topsOf(T: Terrain, i: number, j: number): Top[] {
    const key = (i + 4096) * 8192 + (j + 4096);
    let list = this.tops.get(key);
    if (list) return list;
    list = this.layTops(T, i, j);
    this.tops.set(key, list);
    return list;
  }

  /** Let go of the tops of pieces that are far away (as the ground's pieces are let go of). */
  forgetTops(keep: (i: number, j: number) => boolean): void {
    for (const k of [...this.tops.keys()]) {
      const i = Math.floor(k / 8192) - 4096;
      const j = (k % 8192) - 4096;
      if (!keep(i, j)) this.tops.delete(k);
    }
  }

  private layTops(T: Terrain, pi: number, pj: number): Top[] {
    const out: Top[] = [];
    const land = this.land;
    if (!land || !this.dress) return out;
    const n = this.dress.floor;
    const rise = T.look.rise;
    const P = (name: string, frame?: number): Sprite | null => {
      const fr = this.piece(name)?.frames;
      if (!fr || !fr.length) return null;
      return fr[(frame ?? 0) % fr.length];
    };
    const sh = (name: string): number => this.piece(name)?.shadow ?? 0;
    const x0 = pi * PIECE;
    const y0 = pj * PIECE;
    // (THE CAMP, game/camp.ts: its chimneys where the art chat stood them, and nothing else on its roofs)
    if (n === CAMP_DRESS) {
      for (const l of CAMP_TOPS) {
        const [px, py] = pictureOf(l.x, l.y);
        if (Math.floor(px / PIECE) !== pi || Math.floor((py - rise) / PIECE) !== pj) continue;
        const sp = P(l.name, l.frame);
        if (sp) out.push({ x: l.x, y: l.y, sp, lift: rise / GRAIN, shadow: sh(l.name), tall: false });
      }
      return out;
    }
    const river = land.river;
    for (let gy = y0 + 4; gy < y0 + PIECE; gy += 18) {
      for (let gx = x0 + 4; gx < x0 + PIECE; gx += 24) {
        const px = Math.round(gx + (hashOf(gx, gy, 1) - 0.5) * 18);
        const py = Math.round(gy + (hashOf(gx, gy, 2) - 0.5) * 12);
        const roll = hashOf(gx, gy, 3);
        const k = hashOf(gx, gy, 4);
        if (rise > 0) {
          // THE CLIFFS' TOPS: drawn `rise` up, clear of the floor (his rule)
          const [wx, wy] = worldOf(px, py + rise);
          const grove = fbm(wx * 0.35, wy * 0.35, 814);
          let pick: { name: string; frame: number; hw: number; tall?: boolean } | null = null;
          if (n === 6) {
            if (grove > 0.6 && roll < 0.4) pick = { name: 'pine', frame: k < 0.33 ? 0 : k < 0.7 ? 1 : 2, hw: 30, tall: true };
            else if (roll < 0.045) pick = { name: 'boulder', frame: Math.floor(k * 3), hw: 22 };
            else if (roll < 0.05) pick = { name: 'stacked blocks', frame: 0, hw: 34 };
          } else if (n === 7) {
            // (firs low on the mountainside, the set's; boulders)
            if (grove > 0.58 && roll < 0.32) pick = { name: 'pine', frame: k < 0.5 ? 0 : 1, hw: 30, tall: true };
            else if (roll < 0.03) pick = { name: 'boulder', frame: Math.floor(k * 3), hw: 22 };
          } else if (n === 8) {
            if (grove > 0.58 && roll < 0.36) pick = { name: 'juniper', frame: Math.floor(k * 3), hw: 26 };
            else if (roll < 0.06) pick = { name: 'sagebrush', frame: 0, hw: 14 };
            else if (roll < 0.09) pick = { name: 'yucca', frame: Math.floor(k * 3), hw: 12 };
            else if (roll < 0.105) pick = { name: 'red boulder', frame: Math.floor(k * 3), hw: 20 };
            else if (roll < 0.112) pick = { name: 'dead juniper', frame: 0, hw: 20 };
            else if (roll < 0.118) pick = { name: 'hoodoo', frame: Math.floor(k * 3), hw: 16, tall: true };
          } else if (n === 11) {
            // (ACT 2, THE GATE WARD: chimneys on the roofs, as the art chat's dev page stands them, src/dev/preview_gateward.ts; clear
            // of the floor, so never on the roof of a house walked into, which the ground has open)
            if (roll < 0.022) pick = { name: 'chimney', frame: k < 0.5 ? 0 : 1, hw: 12 };
          }
          if (!pick) continue;
          const sp = P(pick.name, pick.frame);
          if (!sp || !clearOfFloor(T, px, py, pick.hw, sp.h * GRAIN)) continue;
          if (this.overWays(wx, wy, sp, rise / GRAIN)) continue;
          out.push({ x: wx, y: wy, sp, lift: rise / GRAIN, shadow: sh(pick.name), tall: !!pick.tall });
        } else {
          // THE FOREST'S AND THE WATER'S: anywhere off the floor (and off the river), the tall ones seen through
          const [wx, wy] = worldOf(px, py);
          if (T.ground(wx, wy)) continue;
          if (river && laneDist({ pts: river, w: 0 }, wx, wy) < 1.5) continue;
          if (this.nearHold(wx, wy)) continue;
          let pick: { name: string; frame: number; tall?: boolean } | null = null;
          if (n === 9) {
            const sick = this.sickAt(wx, wy);
            if (sick > 0.35 && roll < 0.5) pick = { name: 'twisted pine', frame: roll < 0.25 ? 0 : 1, tall: true };
            else if (roll < 0.62) pick = { name: 'old pine', frame: Math.floor(k * 3), tall: true };
            else if (roll < 0.8) pick = { name: 'young pine', frame: k < 0.5 ? 0 : 1, tall: true };
            else if (roll < 0.86) pick = { name: 'ferns', frame: k < 0.5 ? 0 : 1 };
            else if (roll < 0.9) pick = { name: 'pine snag', frame: 0, tall: true };
            // (PINE_PATH, his "The thin paths through the forest are hard to see past the trees": no tall tree whose picture
            // would stand over one of the paths between the areas; ferns in its place, now and then)
            if (PINE_PATH.on && pick?.tall && land.lanes.some((l) => laneDist(l, wx, wy) < PINE_PATH.clear)) {
              const sp = P(pick.name, pick.frame);
              if (sp && !clearOfFloor(T, px, py, 14, sp.h * GRAIN * 0.85)) pick = roll < 0.75 ? { name: 'ferns', frame: k < 0.5 ? 0 : 1 } : null;
            }
          } else {
            // THE FEN'S OPEN WATER, as its mock-up has it (src/dev/preview_fen.ts, with his yes): on a sparser grid of
            // its own; reeds in the shallows by the ground, nothing a little further out, then its dead trees standing
            // in the water, lily pads, stumps, stones, roots; nothing on the ruin's ring or in the Eye's pool
            if (!fenSpot(gx, gy)) continue;
            if (this.onRing(wx, wy)) continue;
            const shore = this.shoreOf(T, wx, wy);
            if (shore < 0.8) {
              if (roll < 0.3) pick = { name: 'cattails', frame: roll < 0.15 ? 0 : 1 };
            } else if (shore >= 1.5) {
              if (roll < 0.045) pick = { name: 'dead swamp tree', frame: roll < 0.02 ? 0 : 1, tall: true };
              else if (roll < 0.17) pick = { name: 'lily pads', frame: 0 };
              else if (roll < 0.19) pick = { name: 'drowned stump', frame: Math.floor(k * 2) };
              else if (roll < 0.21) pick = { name: 'mossy stones', frame: 0 };
              else if (roll < 0.225) pick = { name: 'arching roots', frame: 0 };
              else if (roll < 0.229) pick = { name: 'sunken log', frame: 0 };
              else if (roll < 0.231) pick = { name: 'a sunken rowboat', frame: 0 };
            }
          }
          if (!pick) continue;
          const sp = P(pick.name, pick.frame);
          if (!sp) continue;
          if (this.overWays(wx, wy, sp, 0)) continue;
          out.push({ x: wx, y: wy, sp, lift: 0, shadow: sh(pick.name), tall: !!pick.tall && sp.h >= SEE_TALL });
        }
      }
    }
    return out;
  }

  /** Is world (x, y) on the fen's ruin's ring (or in the Eye's pool in it), or just by it? */
  private onRing(x: number, y: number): boolean {
    const r = this.land?.ring;
    if (!r) return false;
    const u = (x - r.x - (y - r.y)) / Math.SQRT2;
    const v = (x - r.x + (y - r.y)) / Math.SQRT2;
    return Math.hypot(u / (r.rx + 0.8), v / (r.ry + 0.8)) < 1;
  }

  /** How far world (x, y) is from the floor's ground, roughly (tiles): under 0.8, under 1.5, or further (3). */
  private shoreOf(T: Terrain, x: number, y: number): number {
    for (const r of [0.8, 1.5]) {
      for (let a = 0; a < 8; a++) {
        const t = (a / 8) * Math.PI * 2;
        if (T.ground(x + Math.cos(t) * r, y + Math.sin(t) * r)) return r === 0.8 ? 0.5 : 1;
      }
    }
    return 3;
  }

  /** Is world (x, y) near a stronghold's gate (its towers stand there: nothing on the tops round it)? */
  /**
   * (EXITS, floors 6 to 10) Would a thing of the tops at (x, y), `lift` up, stand on the way on's or the start's pieces, or
   * over them on the screen in front of them? (Their pictures stand up to WAY_TALL game pixels; the forest's trees are
   * taller than a man and many deep: in front of the way, they would hide it.)
   */
  private overWays(x: number, y: number, sp: Sprite, lift: number): boolean {
    if (!this.keepClear.length) return false;
    const sx = (x - y) * 16;
    const sy = (x + y) * 8 - lift;
    const left = sx - sp.ax;
    const top = sy - sp.ay;
    for (const p of this.keepClear) {
      if (Math.abs(p.x - x) < 1.2 && Math.abs(p.y - y) < 1.2) return true;
      if (x + y <= p.x + p.y - 0.5) continue;
      const px = (p.x - p.y) * 16;
      const py = (p.x + p.y) * 8;
      if (px + 10 > left && px - 10 < left + sp.w && py > top && py - WAY_TALL < top + sp.h) return true;
    }
    return false;
  }

  private nearHold(x: number, y: number): boolean {
    return !!this.land && this.land.holds.some((q) => Math.abs(x - q.gx) < 5 && y < q.gy + 4 && y > q.gy - 6);
  }

  private sickCache: ((x: number, y: number) => number) | null = null;
  private sickAt(x: number, y: number): number {
    const land = this.land;
    if (!land) return 0;
    if (!this.sickCache) {
      const way = land.way;
      const lens: number[] = [0];
      for (let i = 1; i < way.length; i++) lens.push(lens[i - 1] + Math.hypot(way[i][0] - way[i - 1][0], way[i][1] - way[i - 1][1]));
      const total = lens[lens.length - 1] || 1;
      const from = land.sickFrom ?? 0.62;
      this.sickCache = (px, py) => {
        let best = Infinity;
        let at = 0;
        for (let i = 0; i + 1 < way.length; i++) {
          const [ax, ay] = way[i];
          const [bx, by] = way[i + 1];
          const dx = bx - ax;
          const dy = by - ay;
          const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy || 1)));
          const d = Math.hypot(px - ax - t * dx, py - ay - t * dy);
          if (d < best) {
            best = d;
            at = (lens[i] + t * (lens[i + 1] - lens[i])) / total;
          }
        }
        return Math.max(0, Math.min(1, (at - from) / (1 - from)));
      };
    }
    return this.sickCache(x, y);
  }
}

/** The fen's open water is dressed on its mock-up's grid, 30 by 26 picture pixels, sparser than the 24 by 18 the tops are laid on: one spot in this many kept. */
function fenSpot(gx: number, gy: number): boolean {
  return hashOf(gx, gy, 7) < (24 * 18) / (30 * 26);
}

/** (ACT 2) Is a spike floor's patch the trap of a piece that stands: under it, or beside it (the wheel's, on the strip by it)? */
function trapOf(p: PropInst, h: HazardSpot): boolean {
  return p.tx >= h.x - 1 && p.tx <= h.x + h.w && p.ty >= h.y - 1 && p.ty <= h.y + h.h;
}

function hashOf(x: number, y: number, k: number): number {
  let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(k | 0, 2147483647)) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

/** (EXITS) How high the art chat's ways' and starts' pictures stand over their tiles, at most, in game pixels (the hoist, the fins, the sick trees). */
const WAY_TALL = 56;
/** (EXITS, floors 6 to 10) The middles of the tiles the way on's and the start's pieces stand on (their whole shape, in their own frame: game/ways.ts). */
function keepClearOf(L: Level): { x: number; y: number }[] {
  const W = L.ways;
  const a1 = W?.a1;
  if (!EXITS.on || !a1 || !W?.onward) return [];
  const out: { x: number; y: number }[] = [];
  const box = (list: readonly AB[], tx: number, ty: number, d: Parameters<typeof turnAB>[0], back = 0): void => {
    if (!list.length) return;
    const aFrom = Math.min(...list.map((t) => t[0])) - Math.ceil(back);
    const aTo = Math.max(...list.map((t) => t[0]));
    const bFrom = Math.min(...list.map((t) => t[1]));
    const bTo = Math.max(...list.map((t) => t[1]));
    for (let a = aFrom; a <= aTo; a++) for (let b = bFrom; b <= bTo; b++) {
      const [dx, dy] = turnAB(d, a, b);
      out.push({ x: tx + dx + 0.5, y: ty + dy + 0.5 });
    }
  };
  const way = ONWARD[a1.floor];
  if (way) box([...way.takes, ...way.solid, ...way.thrown], a1.way.ref.x, a1.way.ref.y, a1.way.dir, way.back);
  const st = START[a1.floor];
  if (st && !a1.start.none) box(st.solid, a1.start.ref.x, a1.start.ref.y, a1.start.dir);
  return out;
}
