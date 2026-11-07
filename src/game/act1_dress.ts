// ACT 1, THE DESCENT: EVERY FLOOR LAID WITH ITS OWN PIECES (the art chat's, each floor's 25 and the set's cult
// camp and strongholds, every one with his yes as shown: art/floor6.ts to floor10.ts, art/act1_camp.ts,
// art/act1_cult.ts, art/redoubt.ts). Where each stands, and what the game does with it, are the main chat's.
//
// WHAT THE RULES KNOW OF A PIECE IS ITS NAME (and whether it stands in the way): the pictures are the art's
// (render/act1_pieces.ts draws them by name). The last step of making a floor of the descent
// (game/act1_level.ts), by dice of its own, lays:
//   ON THE FLOOR, its floor tiles: the Quarry's rails, a stronghold's court of flagstones, the Pinewood's
//     footbridges over its river, the Fen's boardwalks, the canyon's wheel ruts, the trail's cracks;
//   IN ITS OPEN AREAS, its things that stand (solid, kept clear of each other and of every way through, so
//     that nothing is cut off), its few big ones, and its small things that lie about (walked over);
//   AGAINST ITS FAR CLIFFS' FEET, what stands against a face (a ladder, the great face half carved);
//   A CAMP OF THE CULT in one of its areas (the set's tents, fires, crates, stakes);
//   AT EACH STRONGHOLD (game/act1_holds.ts and Game's strongholds have its rules): its gate in the yard's back wall, the altar of the
//     words before it, the cult's braziers and banners about its court;
//   IN EACH STRONGHOLD'S HALL: the cult's ring of magic on the floor and the half-cut obelisk in it, the
//     cult's braziers along its walls;
//   ITS TRAP here and there, as a spike floor's beat (game/traps.ts), in the floor's own pictures.
// The game's own things (barrels and urns) are drawn as the floor's own two breakables.
// WHAT STANDS ON THE TOPS (the cliffs', the forest's, the water's: never on the walkable floor, and never over
// it on the cliffs: his rule) is for the eye alone: render/act1_pieces.ts lays it from the painted ground.

import { F8F9_FIX } from './f8f9';
import { RNG } from '../engine/rng';
import { act1Floor, cityFloor } from './act1';
import { dressAct2 } from './act2_dress';
import { blobDist, laneDist } from './act1_layout';
import type { Land } from './act1_layout';
import type { HushMoment } from './act2_moments';
import type { Level, PropInst } from './state';
import { T_FLOOR, T_WALL } from './types';
import type { HazardSpot } from './types';
import { makeHazards } from './traps';

/** A floor tile laid with one of the floor's pieces. */
export interface Act1Tile {
  i: number;
  name: string;
  frame: number;
  /**
   * (ACT 2, THE HUSH) 1: its picture is anchored at its middle (the art chat's Hush floor tiles, art/act2_kit.ts `lying`), and
   * it is laid on its tile's middle; else at its tile's top corner, as every floor tile of the descent's is
   * (render/act1_pieces.ts floorTiles). The Censor's floor blacked out is laid so (game/act1_rules/censor.ts).
   */
  mid?: 1;
}
/**
 * (ACT 2, THE HUSH: A TRAP LAID WITH A PICTURE OF ITS OWN, drawn once where it stands rather than a tile at a time as the
 * floor's one trap is: render/act1_pieces.ts `trapOf`. Floor 12 has two, the flood and the slick: game/act2/undercity.ts.)
 * Its patch (the hazard's, game/traps.ts: the spike floor's beat), its piece's name, which of the piece's frames shows in
 * each part of the beat (down, the warning, up: run through as it is up), and the world point its picture stands at.
 */
export interface Act1Trap {
  x: number;
  y: number;
  w: number;
  h: number;
  name: string;
  down: number[];
  warn: number[];
  up: number[];
  at: { x: number; y: number };
}

/** What a floor of the descent is laid with, beyond its props (those are in Level.props, kind 'piece'). */
export interface Act1Dress {
  floor: number;
  tiles: Act1Tile[];
  /** (ACT 2, THE HUSH: its traps with pictures of their own, where its dresser lays them) */
  traps?: Act1Trap[];
  /**
   * (ACT 2, THE HUSH: ITS MOMENT AROUND THE HERO, the art chat's film for the floor, where game/act2_moments.ts laid it once the
   * floor's own dresser had laid the rest (game/act2_dress.ts); played by render/act1_pieces.ts as he comes near and sees it.)
   */
  moments?: HushMoment[];
  /** (ACT1_SCENES) The scenes laid, each at its place: for the pictures and the tests. */
  scenes?: { x: number; y: number; name: string }[];
}

/**
 * ACT1_SCENES: A FLOOR'S THINGS WHERE THEY BELONG, as the first five floors' are (game/first5.ts SCENES). His words, 1 Nov 2026,
 * 10:05: “Can you make sure the doodads go in places that seem proper as opposed to randomly?  I know we’ve talked about this a
 * little with the camp sites and the markets”; when, “With each floor (Recommended)”. On a floor laid so, an open area's things
 * stand together as one of its floor's scenes, in its outer band (his 17 Oct rule: “a little thinner in density and spread
 * towards the edges”), and what stands at the far cliffs' feet is a scene of its own; nothing stands about at random but in
 * the boss's ground. `floors`: those laid so, each shown to him first as pictures from the game.
 */
export const ACT1_SCENES: { on: boolean; floors: number[] } = { on: true, floors: [6, 7, 8, 9, 10] };

/**
 * THE SMALL THINGS WALKED THROUGH (floors 6 to 10). His words, 4 Nov 2026, 19:02: “There’s still too much shit in the walk paths
 * of these levels.  I don’t know if you want to make the player phase through all these doodads but just running around can be
 * pretty annoying.” So the things that stand about an area one tile each, and the standing parts of its scenes, no longer bar
 * the way: he (and what hunts him) walks through them. What still stands in the way: the big ones, the barrels and urns (the
 * game's breakables), carts, the cult's camp, the strongholds' pieces, walls and cliffs.
 */
export const DOODADS_THROUGH = { on: true };

/** One thing of a scene: where from its place (tiles), its name, whether it stands (solid); a barrel or urn is the game's own breakable. */
interface Part {
  dx: number;
  dy: number;
  name: string;
  solid: boolean;
  kind?: 'barrel' | 'urn';
  /** It stands against the cliff (rock behind it, up and to the left on the screen); `alt`, the other place along the cliff it may take. */
  wall?: boolean;
  alt?: [number, number];
}
/** A scene of a floor of the descent: its name, its parts (the first `need` of them must all be laid for it to be laid at all), and how many a floor has at most. */
interface Act1Scene {
  name: string;
  need: number;
  most: number;
  parts: Part[];
}
const S = (dx: number, dy: number, name: string): Part => ({ dx, dy, name, solid: true });
const Ly = (dx: number, dy: number, name: string): Part => ({ dx, dy, name, solid: false });
const Br = (dx: number, dy: number, kind: 'barrel' | 'urn'): Part => ({ dx, dy, name: kind, solid: true, kind });
/** Against the cliff, along x by `d` or else along y by `d`. */
const Wl = (d: number, name: string): Part => ({ dx: d, dy: 0, name, solid: false, wall: true, alt: [0, d] });
/**
 * THE SCENES OF EACH FLOOR OF THE DESCENT (in its open areas; turned any of four ways as they are laid). `face`: the scenes at
 * the far cliffs' feet, the face's own piece at their place (its foot, the face up and to the left of it on the screen).
 */
export const ACT1_SCENE_SETS: Readonly<Record<number, { open: readonly Act1Scene[]; face: readonly Act1Scene[] }>> = {
  6: {
    open: [
      // THE BLOCK YARD: cut blocks stacked in a row, two more set down before them, the sledge on its rollers at the row's end
      // to drag them off, chippings, a water barrel
      { name: 'the block yard', need: 3, most: 2, parts: [S(0, 0, 'stacked blocks'), S(2, 0, 'stacked blocks'), S(4, 0, 'stacked blocks'), S(1, 2, 'cut block'), S(3, 2, 'cut block'), S(6, 1, 'sledge on rollers'), Ly(2, 3, 'chippings'), Br(-2, 1, 'barrel')] },
      // THE SPLITTING: a block marked to split and one split from the bed beside it, the splitting tools between them, chippings
      // round them, a basket of chippings
      { name: 'the splitting', need: 2, most: 2, parts: [S(0, 0, 'block marked to split'), S(2, 0, 'block split from the bed'), Ly(1, 1, 'splitting tools'), Ly(0, 2, 'chippings'), Ly(3, 2, 'chippings'), Br(-2, 0, 'urn')] },
      // THE CRANE: the crane, a cut block waiting under its arm, blocks stacked by it, a cart of rubble
      { name: 'the crane', need: 2, most: 1, parts: [S(0, 0, 'the crane'), S(2, 1, 'cut block'), S(-2, 2, 'stacked blocks'), S(3, -2, 'cart of rubble'), Ly(1, 3, 'chippings')] },
      // THE OBELISK: the great obelisk being cut, its scaffolding beside it, the splitting tools and chippings at its foot
      { name: 'the obelisk', need: 2, most: 1, parts: [S(0, 0, 'the great obelisk'), S(2, 0, 'scaffolding'), Ly(0, 2, 'splitting tools'), Ly(2, 2, 'chippings'), Br(-2, 1, 'barrel')] },
      // THE CARTS: an empty cart and one of rubble left side by side, rubble tipped out by them
      { name: 'the carts', need: 2, most: 1, parts: [S(0, 0, 'empty cart'), S(2, 0, 'cart of rubble'), Ly(1, 2, 'chippings'), Ly(3, 1, 'chippings')] },
    ],
    face: [
      // THE GREAT FACE: the face half carved in the cliff, a ladder up the cliff beside it, scaffolding before it, the splitting
      // tools and chippings at its foot
      { name: 'the great face', need: 1, most: 1, parts: [Ly(0, 0, 'the great face, half carved'), Wl(3, 'ladder against the face'), S(2, 2, 'scaffolding'), Ly(1, 1, 'splitting tools'), Ly(0, 2, 'chippings')] },
      // THE GREAT HAND: the hand half carved, a ladder, a rope and bucket let down, chippings
      { name: 'the great hand', need: 1, most: 1, parts: [Ly(0, 0, 'the great hand, half carved'), Wl(3, 'ladder against the face'), Wl(-3, 'rope and bucket'), Ly(1, 1, 'chippings')] },
      // THE WORKING FACE: a ladder, a rope and bucket, a block split from the bed at its foot
      { name: 'the working face', need: 1, most: 3, parts: [Ly(0, 0, 'ladder against the face'), Wl(2, 'rope and bucket'), S(2, 2, 'block split from the bed'), Ly(1, 1, 'splitting tools')] },
    ],
  },
  7: {
    open: [
      // THE LOST CARAVAN: the cult's supply cart gone over, its pack mule picked clean beside it, the rockfall that took them,
      // bones and feathers where the flock fed
      { name: 'the lost caravan', need: 2, most: 1, parts: [S(0, 0, "the cult's supply cart, gone over"), S(2, 1, 'a pack mule, picked clean'), S(-2, -1, 'rockfall'), Ly(1, 3, 'bones and feathers'), Ly(3, -1, 'snow drift')] },
      // THE FLOCK'S CAGE: the cult's cage for the flock, its feather standard by it, a dead vulture and feathers about it
      { name: "the flock's cage", need: 2, most: 1, parts: [S(0, 0, "the cult's cage for the flock"), S(2, -1, "the cult's feather standard"), Ly(2, 1, 'a dead vulture'), Ly(-1, 2, 'bones and feathers')] },
      // THE FEEDING PERCH: the cult's perch, its feather standard, what was fed to the flock below it
      { name: 'the feeding perch', need: 2, most: 2, parts: [S(0, 0, "the cult's perch"), S(2, 0, "the cult's feather standard"), Ly(0, 2, 'bones and feathers'), Ly(1, 1, 'a dead vulture')] },
      // THE NEST ON THE ROCK: a vulture's nest on a perching rock, a dead snag, bones below
      { name: 'the nest on the rock', need: 2, most: 1, parts: [S(0, 0, "a vulture's nest"), S(2, 1, 'a perching rock'), S(-2, 1, 'a dead snag'), Ly(1, 2, 'bones and feathers')] },
      // THE WAYMARK: a cairn by the trail, a dead snag, snow drifted against them
      { name: 'the waymark', need: 1, most: 2, parts: [S(0, 0, 'cairn'), S(2, 1, 'a dead snag'), Ly(1, 1, 'snow drift')] },
      // THE FALL: rock come down across the trail's edge, a perching rock in it, snow over it
      { name: 'the fall', need: 2, most: 2, parts: [S(0, 0, 'rockfall'), S(2, 0, 'a perching rock'), Ly(1, 1, 'snow drift'), Ly(-1, 1, 'bones and feathers')] },
    ],
    face: [
      // THE NESTING CLIFF: a nest in the wall, a second along the cliff, bones and feathers below them
      { name: 'the nesting cliff', need: 1, most: 2, parts: [Ly(0, 0, 'a nest in the wall'), Wl(3, 'a nest in the wall'), Ly(1, 1, 'bones and feathers')] },
      // THE TETHERS: iron rings in the wall where the cult ties its birds, its perch before them
      { name: 'the tethers', need: 1, most: 2, parts: [Ly(0, 0, 'iron rings in the wall'), S(2, 2, "the cult's perch"), Ly(1, 1, 'a dead vulture')] },
      // THE ICE: icicles down the cliff, snow drifted at its foot
      { name: 'the ice', need: 1, most: 3, parts: [Ly(0, 0, 'icicles in the wall'), Wl(2, 'icicles in the wall'), Ly(1, 1, 'snow drift')] },
    ],
  },
  8: {
    open: [
      // THE CONVOY: the cult's wagon and behind it the obelisk on its dray, its stores and meal set down by them
      { name: 'the convoy', need: 2, most: 1, parts: [S(0, 0, "the cult's wagon"), S(3, 0, 'an obelisk on its dray'), Br(1, 2, 'barrel'), Br(-1, 2, 'urn'), Ly(2, 2, 'sagebrush')] },
      // THE BROKEN WAGON: the cult's wagon broken down against the boulder it struck, its meal spilled, driftwood
      { name: 'the broken wagon', need: 2, most: 1, parts: [S(0, 0, "the cult's wagon, broken down"), S(-2, -1, 'red boulder'), Br(2, 1, 'urn'), Ly(1, 2, 'driftwood')] },
      // THE GREAT HORN: the cult's great horn, a frame of its bells by it, singing stones about them
      { name: 'the great horn', need: 2, most: 1, parts: [S(0, 0, "the cult's great horn"), S(2, 1, "a frame of the cult's bells"), S(-2, 1, 'singing stones'), Ly(0, 2, 'sagebrush')] },
      // THE SINGING STONES: three singing stones standing in a ring, sagebrush between them
      { name: 'the singing stones', need: 3, most: 2, parts: [S(0, 0, 'singing stones'), S(2, 1, 'singing stones'), S(0, 2, 'singing stones'), Ly(1, 1, 'sagebrush')] },
      // THE DRY GROVE: a juniper, one dead beside it, a yucca and a red boulder, sagebrush and driftwood about them
      { name: 'the dry grove', need: 2, most: 3, parts: [S(0, 0, 'juniper'), S(2, 0, 'dead juniper'), S(1, 2, 'yucca'), S(-2, 1, 'red boulder'), Ly(3, 2, 'sagebrush'), Ly(-1, 3, 'driftwood')] },
    ],
    face: [
      // THE CHANT: the cult's chant carved in the canyon wall, a frame of its bells before it
      { name: 'the chant', need: 1, most: 2, parts: [Ly(0, 0, 'the chant carved in the wall'), S(2, 2, "a frame of the cult's bells"), Ly(1, 1, 'sagebrush')] },
      // THE HOIST: the cult's hoist up the cliff, its stores at its foot
      { name: 'the hoist', need: 1, most: 2, parts: [Ly(0, 0, "the cult's hoist"), Br(2, 1, 'barrel'), Br(1, 2, 'urn')] },
      // THE SEEP: water seeping from the rock, a juniper grown by it, sagebrush
      { name: 'the seep', need: 1, most: 3, parts: [Ly(0, 0, 'a seep in the wall'), S(2, 2, 'juniper'), Ly(1, 1, 'sagebrush')] },
    ],
  },
  9: {
    open: [
      // THE SIEGE WORKS: the cult's siege tent, a battering ram half built beside it, siege ladders, barrels of pitch
      { name: 'the siege works', need: 2, most: 1, parts: [S(0, 0, "the cult's siege tent"), S(3, 0, 'a battering ram, half built'), S(1, 2, 'siege ladders'), Br(-2, 1, 'barrel'), Br(3, 2, 'barrel')] },
      // THE FELLING: pines felled and stacked, the stumps they were cut from, the woodpile
      { name: 'the felling', need: 2, most: 2, parts: [S(0, 0, 'felled pines, stacked'), S(3, 1, 'stump'), S(2, -2, 'stump'), Br(-2, 1, 'urn'), Ly(1, 2, 'ferns')] },
      // THE HUNTER'S CAMP: the hunter's drying rack, a stag's skull and antlers by it, his woodpile, ferns
      { name: "the hunter's camp", need: 1, most: 2, parts: [S(0, 0, "the hunter's drying rack"), Ly(1, 1, "a stag's skull and antlers"), Br(2, 0, 'urn'), Ly(-1, 2, 'ferns'), Ly(2, 2, 'bilberries')] },
      // THE WINDFALL: a pine come down, the snag it broke from, a mossy boulder, toadstools and ferns on the dead wood
      { name: 'the windfall', need: 2, most: 2, parts: [S(0, 0, 'fallen pine'), S(-2, 1, 'pine snag'), S(3, 1, 'mossy boulder'), Ly(1, 2, 'toadstools'), Ly(-1, 3, 'ferns')] },
      // THE GLADE: young pines coming up by a mossy boulder, bilberries and ferns under them
      { name: 'the glade', need: 2, most: 3, parts: [S(0, 0, 'young pine'), S(2, 1, 'young pine'), S(-1, 2, 'mossy boulder'), Ly(1, 2, 'bilberries'), Ly(3, 3, 'ferns')] },
    ],
    face: [],
  },
  10: {
    open: [
      // THE RUIN: a broken stair going up to nothing, a broken column by it, its drums fallen, mossy stones
      { name: 'the ruin', need: 2, most: 1, parts: [S(0, 0, 'a broken stair'), S(3, 0, 'a broken column'), S(2, 2, 'fallen column drums'), Ly(-1, 2, 'mossy stones'), Ly(4, 2, 'sedge tussock')] },
      // THE STATUE: a statue's head sunk in the mud, the drums of its column fallen by it, sedge about them
      { name: 'the statue', need: 2, most: 2, parts: [S(0, 0, "a sunken statue's head"), S(2, 1, 'fallen column drums'), Ly(1, 2, 'sedge tussock'), Ly(-1, 1, 'mossy stones')] },
      // THE BEAST'S BONES: a drowned beast's ribs, pale toadstools grown on them, a dead swamp tree over them
      { name: "the beast's bones", need: 2, most: 1, parts: [S(0, 0, "a drowned beast's ribs"), S(3, -1, 'dead swamp tree'), Ly(1, 2, 'pale toadstools'), Ly(-1, 2, 'sedge tussock')] },
      // THE CULT'S MARK: a marker post where the cult leaves its offerings, the cage of offerings, its supply crates
      { name: "the cult's mark", need: 2, most: 2, parts: [S(0, 0, 'a marker post'), Br(2, 0, 'urn'), Br(1, 2, 'barrel'), Ly(-1, 1, 'pale toadstools')] },
      // THE DEAD WOOD: arching roots of a tree long drowned, a drowned stump, a dead swamp tree, sedge and toadstools
      { name: 'the dead wood', need: 2, most: 2, parts: [S(0, 0, 'arching roots'), S(3, 1, 'drowned stump'), S(-2, 1, 'dead swamp tree'), Ly(1, 2, 'sedge tussock'), Ly(2, 3, 'pale toadstools')] },
    ],
    face: [],
  },
};

/** A FLOOR'S PIECES BY WHAT THE GAME DOES WITH THEM (their names the art's; tests/act1_floors.test.ts holds each to the art's own list). */
export interface Act1Set {
  /** Things that stand, solid, a tile each, about its open areas. */
  things: readonly string[];
  /** Big ones (the eight tiles round each kept clear too): one or two a floor. */
  big: readonly string[];
  /** Small things that lie or stand about, walked past. */
  lying: readonly string[];
  /** What stands against a far cliff's foot (none on a floor with no walls). */
  wallFoot: readonly string[];
  /** The game's barrel and urn, as this floor has them. */
  breakables: readonly [string, string];
  /** Its trap, laid as a spike floor's beat, and how its frames go (the holes, glinting; then the spikes, `rise` of them), or null. */
  trap: { name: string; tiles: number } | null;
  /** A floor tile laid here and there on the way (or null), and how many frames of it there are. */
  tile: { name: string; frames: number; every: number } | null;
  /** Things that stand by the water's or the drop's edge (the ledge's rope rail; the fen's cattails), laid along it. */
  edge: readonly string[];
}

export const ACT1_SETS: Readonly<Record<number, Act1Set>> = {
  6: {
    things: ['cut block', 'block split from the bed', 'block marked to split', 'stacked blocks', 'sledge on rollers', 'scaffolding', 'empty cart', 'cart of rubble'],
    big: ['the great obelisk', 'the crane'],
    lying: ['splitting tools', 'chippings'],
    wallFoot: ['ladder against the face', 'rope and bucket', 'the great hand, half carved', 'the great face, half carved'],
    breakables: ['water barrel', 'basket of chippings'],
    trap: { name: 'the drill holes', tiles: 2 },
    tile: null,
    edge: [],
  },
  7: {
    things: ['a dead snag', 'a pack mule, picked clean', 'a perching rock', 'cairn', 'rockfall', "the cult's feather standard", "the cult's perch"],
    big: ["the cult's cage for the flock", "the cult's supply cart, gone over", "a vulture's nest"],
    lying: ['a dead vulture', 'bones and feathers', 'snow drift'],
    wallFoot: ['a nest in the wall', 'icicles in the wall', 'iron rings in the wall'],
    breakables: ['basket of the flock\'s feathers', 'water jar'],
    trap: { name: 'the crumbling ledge', tiles: 2 },
    tile: { name: 'cracks across the trail', frames: 2, every: 70 },
    edge: ['rope rail', 'rope rail, broken'],
  },
  8: {
    things: ['juniper', 'dead juniper', 'red boulder', 'singing stones', "the cult's great horn", 'a frame of the cult\'s bells', 'yucca'],
    big: ["the cult's wagon", "the cult's wagon, broken down", 'an obelisk on its dray'],
    lying: ['driftwood', 'sagebrush'],
    wallFoot: ['a seep in the wall', 'the chant carved in the wall', "the cult's hoist"],
    breakables: ['crate of stores', 'sacks of meal'],
    trap: { name: 'rockfall from the rim', tiles: 1 },
    tile: { name: 'wheel ruts', frames: 2, every: 60 },
    edge: [],
  },
  9: {
    things: ['stump', 'mossy boulder', 'young pine', 'pine snag', "the hunter's drying rack", 'siege ladders'],
    big: ['fallen pine', 'felled pines, stacked', "the cult's siege tent", 'a battering ram, half built'],
    lying: ['ferns', 'bilberries', 'toadstools', "a stag's skull and antlers", 'river stones'],
    wallFoot: [],
    breakables: ['barrels of pitch', "the hunter's woodpile"],
    trap: { name: "the hunter's snare", tiles: 1 },
    tile: null,
    edge: ['cattails'],
  },
  10: {
    things: ['a broken column', 'a marker post', 'drowned stump', 'a sunken statue\'s head', 'fallen column drums', 'dead swamp tree'],
    big: ["a drowned beast's ribs", 'arching roots', 'a broken stair'],
    lying: ['mossy stones', 'pale toadstools', 'sedge tussock'],
    wallFoot: [],
    breakables: ["the cult's supply crates", 'a cage of offerings'],
    trap: { name: 'the sucking bog', tiles: 1 },
    tile: null,
    edge: ['cattails'],
  },
  // ACT 2, THE HUSH (game/act1.ts ACT2): the art chat's pieces (art/floor11.ts to floor15.ts, art/act2_set.ts), for the
  // descent's own dressing while a floor of the Hush has no dresser of its own yet (game/act2/<its ground>.ts, `dress`)
  11: {
    things: ['market stall', 'market stall, smashed', 'handcart', 'the notice board', 'the horse trough', 'street lamp', 'rubble of the siege'],
    big: ['the cart barricade', 'the town well', 'the festival maypole'],
    lying: ['a shard of the dome', 'an ink spill'],
    wallFoot: [],
    breakables: ['barrel', 'crates'],
    trap: null,
    tile: null,
    edge: [],
  },
  12: {
    things: ['a chain hoist', 'rubble of the siege'],
    big: [],
    lying: ['gnawed bones and rags', 'pale toadstools'],
    wallFoot: [],
    breakables: ['smashed voice jars', 'a crate of jars, gnawed open'],
    trap: null,
    tile: null,
    edge: [],
  },
  13: {
    things: ['a scarecrow, gagged', 'a pollard willow', 'a cracked millstone', 'drying lines'],
    big: ['a hay wain, abandoned'],
    lying: ['sheets blown into the corn', 'spilled pulp'],
    wallFoot: [],
    breakables: ['stooks of corn', 'bales of rags'],
    trap: null,
    tile: null,
    edge: [],
  },
  14: {
    things: ['an iron ward bed', 'a ward screen', 'a coal stove', 'a bath chair', 'a stretcher, left'],
    big: ['the operating table'],
    lying: [],
    wallFoot: [],
    breakables: ['a bedside locker', 'a hamper of soiled linen'],
    // (ACT 2, THE HUSH: floor 14's trap, his doc's "spilled tonics that leave clouds of the Hush on the floor": laid by its own
    // dresser, game/act2/housequiet.ts; named here so that render/act1_pieces.ts trapFrame draws its frames by the beat)
    trap: { name: 'spilled tonic', tiles: 1 },
    tile: null,
    edge: [],
  },
  15: {
    things: ['a reading desk', 'a lectern', 'library steps', 'chained books', 'a candelabrum'],
    big: ['a book press'],
    lying: [],
    wallFoot: [],
    breakables: ['a stack of books', 'a book cart'],
    // (ACT 2, THE HUSH: floor 15's trap, the Order's spilled ink, laid by its own dresser, game/act2/library.ts; named here for
    // its pictures by its beat, render/act1_pieces.ts trapFrame)
    trap: { name: 'spilled ink', tiles: 1 },
    tile: null,
    edge: [],
  },
  // (THE HIGH CITY, FLOOR 16: THE SWAN GARDENS, dressed by its own dresser, game/act2/swangardens.ts; named here for the game's
  // barrels and urns, drawn as its two breakables, the art's: a gardener's barrow, an urn of roses, each whole and broken)
  16: {
    things: ['a yew cone', 'a topiary swan', 'a stone swan on its plinth', 'a sundial', 'a bay tree in its tub', 'a lantern on a post'],
    big: ['the still fountain'],
    lying: ['swan feathers', 'clippings and shears'],
    wallFoot: [],
    breakables: ["a gardener's barrow", 'an urn of roses'],
    trap: null,
    tile: null,
    edge: [],
  },
  // (THE HIGH CITY, FLOOR 17: THE MASQUE, until its own dresser lays it room by room: game/act2/masque.ts; the game's barrels
  // and urns drawn as its two breakables, the art's: a gilt chair, a footman's tray)
  17: {
    things: ['a gilt candelabrum', 'a fainting couch', 'a harpsichord', 'a viol and its stand', 'a folding screen of arabesques'],
    big: ['a buffet of a feast gone cold'],
    lying: ['masks dropped on the floor', 'gilt ornaments, scattered', 'royal cards, scattered', 'wine spilled'],
    wallFoot: [],
    breakables: ['a gilt chair', "a footman's tray"],
    trap: null,
    tile: null,
    edge: [],
  },
  // (THE HIGH CITY, FLOOR 18: THE GLASS GALLERY, until its own dresser lays it room by room: game/act2/glassgallery.ts; its
  // trap the art's skylight (his doc's "skylights to fall through"): whole, cracking under a step, broken through)
  18: {
    things: ['a silver candelabrum', 'a velvet banquette', 'a dressing screen', 'a bust on a plinth'],
    big: ['a wardrobe of gowns'],
    lying: ["a mirror's shards", 'a jewel box, spilled', 'a hand mirror, dropped', 'a pane fallen from the roof'],
    wallFoot: [],
    breakables: ['a console table', 'an orchid in its pot, dead'],
    trap: { name: 'a skylight', tiles: 1 },
    tile: null,
    edge: [],
  },
  // (THE HIGH CITY, FLOOR 19: THE KEEP, until its own dresser lays it room by room: game/act2/keep.ts; its trap the art's murder
  // hole (his doc's "murder holes that drop pitch"): still, the warning, pouring, its pool)
  19: {
    things: ['a brazier', 'a weapon rack', 'a crossbow rack', 'a long table'],
    big: ['barracks bunks'],
    lying: [],
    wallFoot: [],
    breakables: ['barrels', 'a suit of armour on its stand'],
    trap: { name: 'a murder hole', tiles: 1 },
    tile: null,
    edge: [],
  },
  // (THE HIGH CITY, FLOOR 20: THE QUIET TOWER, until its own dresser lays it room by room: game/act2/quiettower.ts; its trap the
  // art's Hush's dust (the Moth's wing-dust, the Hush itself): lying, stirring, sprung in a grey cloud to a man's waist)
  20: {
    things: ["a copyist's desk", 'a press of blank books', 'guttering candles', 'moth silk, strung from a fallen beam'],
    big: ['the empty bell frame'],
    lying: ['a shed wing', 'grey dust, drifted', 'a fallen mask of the Order', 'a heap of torn pages'],
    wallFoot: [],
    breakables: ['a chest of blank quires', "a copyist's stool"],
    trap: { name: "the Hush's dust", tiles: 1 },
    tile: null,
    edge: [],
  },
};

/** The set's cult camp, for every floor of the descent (art/act1_camp.ts). */
export const CAMP = {
  things: ["the cult's tent", "the cult's watchfire", "the cult's cauldron", 'weapon rack', 'stakes', 'the skull standard', 'war drum', 'offering bowl', "the captives' cage", 'lean-to'],
  big: ["the cult's pavilion", "the cult's lookout"],
  lying: ['bedroll', 'a cold fire'],
  breakables: ['supply crates', 'sacks of grain', 'firepots'],
};

/** A stronghold's own (art/act1_cult.ts, the set's; art/floor6.ts the Quarry's gatehouse and court; art/redoubt.ts the hall's). */
export const HOLD = {
  gate: (floor: number): string => (floor === 8 ? "the waystation's gate" : "the redoubt's gatehouse"),
  court: "the court's flagstones",
  altar: 'the altar of the words',
  brazier: "the cult's brazier",
  banner: "the cult's banner",
  ring: "the cult's ring of magic",
  obelisk: 'the half-cut obelisk',
  hanging: "the cult's hanging",
};

/** How many of a floor's things stand in an open area: one for this many of its tiles, at most `most`. */
const THING_EVERY = 26;
const THINGS_MOST = 7;
const LYING_EVERY = 30;
/**
 * FEWER THINGS, TOWARD THE EDGES; THE CAMP IN A RING. The owner, 17 Oct 2026, 11:37: "I’d like the doodads placed in the
 * level to be a little thinner in density and spread towards the edges.  Except for camps, maybe a few tents or whatever in a
 * circle." So, `on`: an open area's things that stand and lie about, `fewer` times as many tiles to each, in its outer band
 * (`from` to `to` of the way to its edge) and not its middle; the cult's camp its watchfire in the middle of its area and
 * `ring` of its things in a circle round it, `r` tiles out. On: his yes to the game's pictures of it, 17 Oct, 19:42 (16:42 his time): “Everything looks good”.
 */
export const DRESS_EDGES = { on: true, fewer: 1.6, from: 0.5, to: 0.86, ring: 5, r: 3.2 };

export function dressAct1(L: Level, depth: number, seed: number): Act1Dress | null {
  const n = act1Floor(depth);
  const land = L.land;
  if (!n || !land) return null;
  // (ACT 2, THE HUSH: a floor with a dresser of its own is dressed by it: game/act2_dress.ts)
  if (cityFloor(depth)) {
    const own = dressAct2(L, depth, seed);
    if (own) return own;
  }
  const set = ACT1_SETS[n];
  const f = L.floor;
  const W = f.w;
  const H = f.h;
  const rng = new RNG((seed ^ 0x3c6ef372) >>> 0);
  const out: Act1Dress = { floor: n, tiles: [] };
  const tileAt = new Map<number, Act1Tile>();
  const layTile = (i: number, name: string, frame: number): void => {
    const t = { i, name, frame };
    tileAt.set(i, t);
    out.tiles.push(t);
  };

  // WHAT IS KEPT CLEAR: where he comes in, the waypoint, the way on, every pack's middle, the strongholds' courts, the ways between areas
  const keep = new Uint8Array(W * H);
  const clearRound = (x: number, y: number, r: number): void => {
    for (let ty = Math.floor(y - r); ty <= Math.floor(y + r); ty++) for (let tx = Math.floor(x - r); tx <= Math.floor(x + r); tx++) {
      if (tx < 0 || ty < 0 || tx >= W || ty >= H) continue;
      if (Math.hypot(tx + 0.5 - x, ty + 0.5 - y) <= r) keep[ty * W + tx] = 1;
    }
  };
  clearRound(f.start.x, f.start.y, 3.2);
  if (L.ways?.way) clearRound(L.ways.way.x, L.ways.way.y, 2);
  clearRound(land.exit.x, land.exit.y, 3);
  for (const p of f.packs) clearRound(p.x, p.y, 1.5);
  for (const q of land.holds) {
    for (let ty = q.gy - 1; ty < q.gy + 5; ty++) for (let tx = q.gx - 4; tx < q.gx + 4; tx++) if (tx >= 0 && ty >= 0 && tx < W && ty < H) keep[ty * W + tx] = 1;
    // (and the hall inside, but for what is laid in it below)
    for (let ty = q.inside.y; ty < q.inside.y + q.inside.h; ty++) for (let tx = q.inside.x; tx < q.inside.x + q.inside.w; tx++) keep[ty * W + tx] = 1;
    if (q.way) for (let ty = q.way.y; ty < q.way.y + q.way.h; ty++) for (let tx = q.way.x; tx < q.way.x + q.way.w; tx++) keep[ty * W + tx] = 1;
  }
  for (const l of land.lanes) for (let k = 0; k < l.pts.length; k++) {
    // (a lane's middle line, and its width but a tile: the ways through stay open)
    const [x, y] = l.pts[k];
    clearRound(x, y, Math.max(1.2, l.w / 2 - 0.5));
    if (k + 1 < l.pts.length) {
      const [bx, by] = l.pts[k + 1];
      const steps = Math.ceil(Math.hypot(bx - x, by - y) / 0.7);
      for (let s = 1; s < steps; s++) clearRound(x + ((bx - x) * s) / steps, y + ((by - y) * s) / steps, Math.max(1.2, l.w / 2 - 0.5));
    }
  }
  const boardSet = new Set(land.boards ?? []);
  const bridgeSet = new Set<number>();
  for (const b of land.bridges ?? []) for (const i of b.tiles) bridgeSet.add(i);

  const taken = new Uint8Array(W * H);
  for (const p of L.props) taken[p.ty * W + p.tx] = 1;
  const whole = (x: number, y: number): boolean => x >= 0 && y >= 0 && x < W && y < H && f.tiles[y * W + x] === T_FLOOR && !(f.cut && f.cut[y * W + x] !== 0);
  /** A free tile: whole floor, nothing there, not kept clear, not a board or bridge; `ring`: its eight neighbours whole floor and none of them solid. */
  const free = (x: number, y: number, ring: boolean): boolean => {
    if (!whole(x, y)) return false;
    const i = y * W + x;
    if (keep[i] || taken[i] || boardSet.has(i) || bridgeSet.has(i) || L.walk[i] !== 1) return false;
    if (!ring) return true;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const j = (y + dy) * W + x + dx;
      if (!whole(x + dx, y + dy) || L.walk[j] !== 1 || boardSet.has(j)) return false;
    }
    return true;
  };
  const props: PropInst[] = [];
  const put = (name: string, x: number, y: number, solid: boolean, variant = 0, at?: { x: number; y: number }): PropInst => {
    const p: PropInst = { kind: 'piece', name, tx: x, ty: y, x: at ? at.x : x + 0.5, y: at ? at.y : y + 0.5, solid, state: 0, variant };
    props.push(p);
    taken[y * W + x] = 1;
    if (solid) L.walk[y * W + x] = 0;
    return p;
  };
  const tilesOf = (blob: { x: number; y: number }, inside: (x: number, y: number) => boolean): [number, number][] => {
    const list: [number, number][] = [];
    for (let ty = Math.floor(blob.y - 16); ty <= Math.floor(blob.y + 16); ty++) for (let tx = Math.floor(blob.x - 16); tx <= Math.floor(blob.x + 16); tx++) if (inside(tx + 0.5, ty + 0.5)) list.push([tx, ty]);
    return rng.shuffle(list);
  };

  // ---- THE STRONGHOLDS: the gate, its court, the altar, the braziers and banners; inside, the ring and the obelisk
  for (const q of land.holds) {
    for (let ty = q.gy; ty < q.gy + 3; ty++) for (let tx = q.gx - 3; tx < q.gx + 3; tx++) if (whole(tx, ty)) layTile(ty * W + tx, HOLD.court, tx === q.gx - 1 || tx === q.gx ? 2 : (tx + ty) % 2);
    // (the gate stands on the court's back line, over the two tiles of its door: what the rules know of it is game/act1_holds.ts)
    put(HOLD.gate(n), q.gx, q.gy, false, 0, { x: q.gx, y: q.gy });
    put(HOLD.altar, q.gx, q.gy + 1, true, 0, { x: q.altar.x, y: q.altar.y });
    // (the altar stands over the corner of two tiles: both are its)
    taken[(q.gy + 1) * W + q.gx - 1] = 1;
    L.walk[(q.gy + 1) * W + q.gx - 1] = 0;
    if (F8F9_FIX.on && n === 8) {
      // (F8F9_FIX: Echo Canyon's door is carved into the wall (art/f8f9.ts): its braziers and banners stand against the wall either
      // side of it, on the canyon floor, so that none stands before the door on the screen)
      put(HOLD.brazier, q.gx - 2, q.gy, true, 1, { x: q.gx - 1.75, y: q.gy + 0.6 });
      put(HOLD.brazier, q.gx + 1, q.gy, true, 3, { x: q.gx + 1.75, y: q.gy + 0.6 });
      put(HOLD.banner, q.gx - 3, q.gy, true, 0, { x: q.gx - 2.8, y: q.gy + 0.45 });
      put(HOLD.banner, q.gx + 2, q.gy, true, 2, { x: q.gx + 2.8, y: q.gy + 0.45 });
    } else {
      put(HOLD.brazier, q.gx - 3, q.gy + 1, true, 1, { x: q.gx - 2.3, y: q.gy + 1.1 });
      put(HOLD.brazier, q.gx + 2, q.gy + 1, true, 3, { x: q.gx + 2.3, y: q.gy + 1.1 });
      put(HOLD.banner, q.gx - 3, q.gy + 2, true, 0, { x: q.gx - 2.6, y: q.gy + 2.7 });
      put(HOLD.banner, q.gx + 2, q.gy + 2, true, 2, { x: q.gx + 2.6, y: q.gy + 2.7 });
    }
    // the hall: the ring of magic and the obelisk in it, at its middle; braziers in its far corners; hangings on its back walls are drawn with the walls
    const r = q.inside;
    const cx = Math.floor(r.x + r.w / 2);
    const cy = Math.floor(r.y + r.h / 2 - 1);
    put(HOLD.ring, cx, cy + 1, false, 0, { x: r.x + r.w / 2, y: r.y + r.h / 2 - 0.5 });
    put(HOLD.obelisk, cx, cy, true, 0, { x: cx + 0.5, y: cy + 0.5 });
    put(HOLD.brazier, r.x + 1, r.y + 1, true, 0);
    put(HOLD.brazier, r.x + r.w - 2, r.y + 1, true, 2);
    put(HOLD.brazier, r.x + 1, r.y + r.h - 3, true, 1);
    put(HOLD.brazier, r.x + r.w - 2, r.y + r.h - 3, true, 3);
    // (the way out: the threshold at the middle of its near side, the court's worn flagstones: Game's strongholds)
    const mid = Math.floor(r.x + r.w / 2);
    // (HOLD_HALLWAY: at the far end of its hallway, across it)
    if (q.way) for (let tx = q.way.x; tx < q.way.x + q.way.w; tx++) layTile((q.way.y + q.way.h - 1) * W + tx, HOLD.court, 2);
    else for (const tx of [mid - 1, mid]) layTile((r.y + r.h - 1) * W + tx, HOLD.court, 2);
  }

  // ---- FLOOR TILES: the Quarry's rails, the Pinewood's footbridges, the Fen's boardwalks, the floor's own here and there
  // (F8F9_FIX: a bridge laid square to the stream is drawn whole, not planked tile by tile: render/act1_pieces.ts, art/f8f9.ts)
  if (n === 9) for (const b of land.bridges ?? []) if (b.ang === undefined) for (const i of b.tiles) if (f.tiles[i] === T_FLOOR) layTile(i, 'footbridge', b.alongX ? 0 : 1);
  if (n === 10) {
    for (const i of land.boards ?? []) {
      const c = f.cut ? f.cut[i] : 0;
      // (whole along x or along y, by which way the walk runs there; a half where the walk runs across the screen or up and down it)
      const x = i % W;
      const y = (i - x) / W;
      const alongX = whole(x - 1, y) || whole(x + 1, y);
      const frame = c === 0 ? (alongX && !(whole(x, y - 1) && whole(x, y + 1)) ? 0 : 1) : c === 2 ? 2 : c === 1 ? 3 : c === 4 ? 4 : 5;
      layTile(i, 'the boardwalk', frame);
    }
  }
  if (n === 6) {
    // the rails: down the middle of a pit or two, along x or along y, end to end over its whole floor; a cart on them
    const pits = land.areas.filter((a) => a.role === 'path');
    rng.shuffle(pits);
    for (const a of pits.slice(0, 2)) {
      const alongX = rng.chance(0.5);
      const cx = Math.floor(a.blob.x);
      const cy = Math.floor(a.blob.y);
      let lo = alongX ? cx : cy;
      let hi = lo;
      const ok = (k: number): boolean => (alongX ? whole(k, cy) && !keep[cy * W + k] : whole(cx, k) && !keep[k * W + cx]);
      if (!ok(lo)) continue;
      while (ok(lo - 1) && hi - lo < 30) lo--;
      while (ok(hi + 1) && hi - lo < 30) hi++;
      if (hi - lo < 5) continue;
      for (let k = lo; k <= hi; k++) {
        const i = alongX ? cy * W + k : k * W + cx;
        if (tileAt.has(i)) continue;
        layTile(i, 'rails', (alongX ? 0 : 1) + (k === lo || k === hi ? 2 : 0));
        taken[i] = 1;
      }
      const ck = Math.floor((lo + hi) / 2) + rng.int(-2, 2);
      const tx = alongX ? ck : cx;
      const ty = alongX ? cy : ck;
      put(rng.chance(0.6) ? 'cart of rubble' : 'empty cart', tx, ty, true, alongX ? 0 : 1);
    }
  }
  if (set.tile) {
    for (const a of land.areas) {
      if (a.role === 'boss') continue;
      const list = tilesOf(a.blob, (x, y) => blobDist(a.blob, x, y) < 0.85);
      const want = Math.floor(list.length / set.tile.every);
      let laid = 0;
      for (const [tx, ty] of list) {
        if (laid >= want) break;
        if (!whole(tx, ty) || tileAt.has(ty * W + tx) || keep[ty * W + tx]) continue;
        layTile(ty * W + tx, set.tile.name, rng.int(0, set.tile.frames - 1));
        laid++;
      }
    }
  }

  // ---- THE TRAP: a few, as the spike floor's beat (game/traps.ts), on the main way's areas, never where a pack stands or before the start
  const hazards: HazardSpot[] = [];
  if (set.trap) {
    const spots = land.areas.filter((a) => a.role === 'path');
    rng.shuffle(spots);
    for (const a of spots.slice(0, 3)) {
      const list = tilesOf(a.blob, (x, y) => blobDist(a.blob, x, y) < 0.6);
      for (const [tx, ty] of list) {
        const wide = set.trap.tiles;
        let ok = true;
        for (let k = 0; k < wide && ok; k++) ok = free(tx + k, ty, true) && !tileAt.has(ty * W + tx + k);
        if (!ok || hazards.some((h) => Math.hypot(h.x - tx, h.y - ty) < 6)) continue;
        hazards.push({ kind: 'spikes', x: tx, y: ty, w: wide, h: 1, phase: rng.range(0, 2.5) });
        for (let k = 0; k < wide; k++) taken[ty * W + tx + k] = 1;
        break;
      }
    }
  }

  // ---- THE CULT'S CAMP: in one of the main way's areas (not the first two), its tents, fire and crates
  // (ACT 2: no camp of the cult in the Hush: the descent's cult is not there)
  const campArea = cityFloor(depth) ? [] : land.areas.filter((a) => a.role === 'path' && Math.hypot(a.blob.x - f.start.x, a.blob.y - f.start.y) > 18);
  const camp = campArea.length ? rng.pick(campArea) : null;
  // (DRESS_EDGES: a camp round its watchfire: the fire near the middle of one of those areas that has the room for it, its
  // tents and things in a ring round it, its crates and bedrolls just inside the ring; where none has, as before)
  let ringed = false;
  if (camp && DRESS_EDGES.on) {
    const E = DRESS_EDGES;
    const apart = (list: [number, number][], x: number, y: number): boolean => list.every(([a, b]) => Math.abs(a - x) > 1 || Math.abs(b - y) > 1);
    let plan: { fire: [number, number]; ring: [number, number][]; turn: number } | null = null;
    for (const a of [camp, ...rng.shuffle(campArea.filter((q) => q !== camp))]) {
      const mid = (t: [number, number]): number => Math.hypot(t[0] + 0.5 - a.blob.x, t[1] + 0.5 - a.blob.y);
      const centres = tilesOf(a.blob, (x, y) => blobDist(a.blob, x, y) < 0.35).filter(([x, y]) => free(x, y, true)).sort((p, q) => mid(p) - mid(q));
      for (const [fx, fy] of centres.slice(0, 8)) {
        const turn = rng.range(0, Math.PI * 2);
        const ring: [number, number][] = [];
        for (let k = 0; k < E.ring; k++) {
          let got: [number, number] | null = null;
          for (const r of [E.r, E.r - 0.6, E.r + 0.6, E.r + 1.2]) {
            for (const jig of [0, 0.2, -0.2, 0.4, -0.4]) {
              const ang = turn + ((k + jig) / E.ring) * Math.PI * 2;
              const tx = Math.floor(fx + 0.5 + Math.cos(ang) * r);
              const ty = Math.floor(fy + 0.5 + Math.sin(ang) * r);
              if (free(tx, ty, true) && apart(ring, tx, ty) && apart([[fx, fy]], tx, ty)) {
                got = [tx, ty];
                break;
              }
            }
            if (got) break;
          }
          if (got) ring.push(got);
        }
        if (ring.length >= E.ring - 1) {
          plan = { fire: [fx, fy], ring, turn };
          break;
        }
      }
      if (plan) break;
    }
    if (plan) {
      ringed = true;
      const [cx, cy] = plan.fire;
      put("the cult's watchfire", cx, cy, true, rng.int(0, 3));
      const kinds = rng.shuffle(CAMP.things.filter((k) => k !== "the cult's watchfire"));
      // (the tents the most of them, as he asked)
      plan.ring.forEach(([tx, ty], k) => put(k % 2 === 0 ? "the cult's tent" : kinds[k % kinds.length], tx, ty, true, rng.int(0, 3)));
      let crates = 0;
      let beds = 0;
      for (let k = 0; k < 12 && (crates < 2 || beds < 2); k++) {
        const ang = plan.turn + ((k + 0.5) / 12) * Math.PI * 2;
        const tx = Math.floor(cx + 0.5 + Math.cos(ang) * (E.r - 1.4));
        const ty = Math.floor(cy + 0.5 + Math.sin(ang) * (E.r - 1.4));
        if (crates < 2 && free(tx, ty, true)) {
          L.props.push({ kind: rng.chance(0.5) ? 'barrel' : 'urn', tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant: 100 + rng.int(0, 2) });
          taken[ty * W + tx] = 1;
          L.walk[ty * W + tx] = 0;
          crates++;
        } else if (beds < 2 && free(tx, ty, false)) {
          put(rng.pick(CAMP.lying), tx, ty, false);
          beds++;
        }
      }
    }
  }
  if (camp && !ringed) {
    const list = tilesOf(camp.blob, (x, y) => blobDist(camp.blob, x, y) < 0.7);
    let fire = false;
    let things = 0;
    let crates = 0;
    for (const [tx, ty] of list) {
      if (!free(tx, ty, true)) continue;
      if (!fire) {
        put("the cult's watchfire", tx, ty, true, rng.int(0, 3));
        fire = true;
      } else if (things < 4) {
        put(rng.pick(CAMP.things.filter((k) => k !== "the cult's watchfire")), tx, ty, true, rng.int(0, 3));
        things++;
      } else if (crates < 3) {
        L.props.push({ kind: rng.chance(0.5) ? 'barrel' : 'urn', tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant: 100 + rng.int(0, 2) });
        taken[ty * W + tx] = 1;
        L.walk[ty * W + tx] = 0;
        crates++;
      } else break;
    }
    // one of its big things, at the area's edge, and a bedroll or two
    const edgeList = tilesOf(camp.blob, (x, y) => { const d = blobDist(camp.blob, x, y); return d > 0.6 && d < 0.85; });
    for (const [tx, ty] of edgeList) if (free(tx, ty, true)) { put(rng.pick(CAMP.big), tx, ty, true); break; }
    let beds = 0;
    for (const [tx, ty] of list) if (beds < 2 && free(tx, ty, false)) { put(rng.pick(CAMP.lying), tx, ty, false); beds++; }
  }

  // ---- ACT1_SCENES: each open area's things together as one of the floor's scenes, in its outer band
  const scened = ACT1_SCENES.on && ACT1_SCENES.floors.includes(n) && !!ACT1_SCENE_SETS[n];
  const used = new Map<string, number>();
  const usedScene = (name: string): number => used.get(name) ?? 0;
  const turnOf = (k: number, dx: number, dy: number): [number, number] => (k === 0 ? [dx, dy] : k === 1 ? [-dy, dx] : k === 2 ? [-dx, -dy] : [dy, -dx]);
  /** Lay scene `sc` with its place at (x, y), turned `k`: false (and nothing laid) if its first `need` parts cannot all be. */
  const layScene = (sc: Act1Scene, x: number, y: number, k: number, foot: boolean): boolean => {
    const rock = (tx: number, ty: number): boolean => f.tiles[(ty - 1) * W + tx] === T_WALL || f.tiles[ty * W + tx - 1] === T_WALL;
    const at = sc.parts.map((p) => {
      const [dx, dy] = foot ? [p.dx, p.dy] : turnOf(k, p.dx, p.dy);
      // (what stands against the cliff: where there is rock behind it, along x or else along y)
      if (p.wall && p.alt && !rock(x + dx, y + dy)) return [x + p.alt[0], y + p.alt[1]] as [number, number];
      return [x + dx, y + dy] as [number, number];
    });
    const fits = (i: number): boolean => {
      const p = sc.parts[i];
      const [tx, ty] = at[i];
      // (the face's own piece at the foot of the cliff: the tile is free, nothing more asked)
      if (foot && i === 0) return whole(tx, ty) && !keep[ty * W + tx] && !taken[ty * W + tx];
      if (p.wall && !rock(tx, ty)) return false;
      return free(tx, ty, p.solid) && !at.some((q, j) => j < i && q[0] === tx && q[1] === ty);
    };
    for (let i = 0; i < sc.need; i++) if (!fits(i)) return false;
    sc.parts.forEach((p, i) => {
      if (i >= sc.need && !fits(i)) return;
      const [tx, ty] = at[i];
      if (p.kind) {
        L.props.push({ kind: p.kind, tx, ty, x: tx + 0.5, y: ty + 0.5, solid: true, state: 0, variant: rng.int(0, 2) });
        taken[ty * W + tx] = 1;
        L.walk[ty * W + tx] = 0;
      } else if ((foot && i === 0) || p.wall) put(p.name, tx, ty, false, 0, { x: tx + 0.12, y: ty + 0.12 });
      else put(p.name, tx, ty, p.solid && !DOODADS_THROUGH.on, rng.int(0, 3));
      if (p.solid && !p.kind) for (const [ex, ey] of [[1, 0], [0, 1]]) keep[(ty + ey) * W + tx + ex] = 1;
    });
    (out.scenes ??= []).push({ x: x + 0.5, y: y + 0.5, name: sc.name });
    used.set(sc.name, (used.get(sc.name) ?? 0) + 1);
    return true;
  };
  if (scened) {
    const set6 = ACT1_SCENE_SETS[n];
    for (const a of rng.shuffle([...land.areas])) {
      if (a.role === 'yard' || a.role === 'start' || a.role === 'boss') continue;
      const band = tilesOf(a.blob, (x, y) => blobDist(a.blob, x, y) > DRESS_EDGES.from && blobDist(a.blob, x, y) < DRESS_EDGES.to - 0.1);
      // (the big scenes first, while there is room; then the others in an order of the dice's; a big area takes two)
      const order = [...set6.open.filter((q) => q.most === 1), ...rng.shuffle(set6.open.filter((q) => q.most > 1))];
      const want = band.length > 90 ? 2 : 1;
      let laid = 0;
      for (const sc of order) {
        if (laid >= want) break;
        if ((used.get(sc.name) ?? 0) >= sc.most) continue;
        let done = false;
        for (const [tx, ty] of band.slice(0, 60)) {
          for (let k = 0; k < 4 && !done; k++) done = layScene(sc, tx, ty, (k + rng.int(0, 3)) % 4, false);
          if (done) break;
        }
        if (done) laid++;
      }
    }
  }

  // ---- THE OPEN AREAS: a big thing or two on the floor, its things that stand, its small things that lie about
  let bigs = 0;
  for (const a of rng.shuffle([...land.areas])) {
    if (a.role === 'yard' || a.role === 'start') continue;
    const boss = a.role === 'boss';
    // (ACT1_SCENES: a floor laid so has no things standing about at random but in the boss's ground)
    if (scened && !boss) continue;
    const edgy = DRESS_EDGES.on && !boss;
    const inner = tilesOf(a.blob, (x, y) => blobDist(a.blob, x, y) < (boss ? 0.86 : edgy ? DRESS_EDGES.to : 0.78) && blobDist(a.blob, x, y) > (boss ? 0.62 : edgy ? DRESS_EDGES.from : 0.15));
    // (DRESS_EDGES: as many things as before for the area as a whole, fewer, in its outer band)
    const area = edgy ? Math.round(tilesOf(a.blob, (x, y) => blobDist(a.blob, x, y) < 0.78 && blobDist(a.blob, x, y) > 0.15).length / DRESS_EDGES.fewer) : inner.length;
    if (!boss && bigs < 2 && set.big.length && area > 40) {
      for (const [tx, ty] of inner) {
        if (!free(tx, ty, true) || !free(tx + 1, ty, true) || !free(tx, ty + 1, true)) continue;
        put(set.big[bigs % set.big.length], tx, ty, true);
        // (a big one takes the tiles round it too)
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) keep[(ty + dy) * W + tx + dx] = 1;
        bigs++;
        break;
      }
    }
    const things = Math.min(boss ? 3 : THINGS_MOST, Math.round(area / THING_EVERY));
    let placed = 0;
    for (const [tx, ty] of inner) {
      if (placed >= things) break;
      if (!free(tx, ty, true)) continue;
      put(rng.pick(set.things), tx, ty, !DOODADS_THROUGH.on, rng.int(0, 3));
      // (a little room round each)
      keep[ty * W + tx + 1] = 1;
      keep[(ty + 1) * W + tx] = 1;
      placed++;
    }
    const lying = Math.round(area / LYING_EVERY);
    let laid = 0;
    for (const [tx, ty] of inner) {
      if (laid >= lying) break;
      if (!free(tx, ty, false)) continue;
      put(rng.pick(set.lying), tx, ty, false, rng.int(0, 3));
      laid++;
    }
  }

  // ---- AGAINST THE FAR CLIFFS' FEET (a far face behind the tile: rock up the screen of it), now and then
  if (set.wallFoot.length) {
    const feet: [number, number][] = [];
    for (let ty = 1; ty < H - 1; ty++) for (let tx = 1; tx < W - 1; tx++) {
      if (!whole(tx, ty) || keep[ty * W + tx] || taken[ty * W + tx]) continue;
      const rock = (x: number, y: number): boolean => f.tiles[y * W + x] === T_WALL;
      if (rock(tx - 1, ty - 1) && rock(tx - 1, ty) && rock(tx, ty - 1) && whole(tx + 1, ty) && whole(tx, ty + 1)) feet.push([tx, ty]);
    }
    rng.shuffle(feet);
    const used: [number, number][] = [];
    let face = 0;
    // (ACT1_SCENES: at the far cliffs' feet, the floor's scenes of the face, each a way along the cliff from the next)
    if (scened) {
      const faces = ACT1_SCENE_SETS[n].face;
      for (const [tx, ty] of feet) {
        if (used.length >= Math.ceil(feet.length / 9)) break;
        if (used.some(([x, y]) => Math.hypot(x - tx, y - ty) < 9)) continue;
        for (const sc of faces) {
          if (usedScene(sc.name) >= sc.most) continue;
          if (layScene(sc, tx, ty, 0, true)) {
            used.push([tx, ty]);
            break;
          }
        }
      }
    }
    for (const [tx, ty] of scened ? [] : feet) {
      if (used.length >= Math.ceil(feet.length / 9)) break;
      if (used.some(([x, y]) => Math.hypot(x - tx, y - ty) < 7)) continue;
      // (the great face once a floor; the rest as they come)
      const pick = set.wallFoot.length > 3 && face === 0 ? set.wallFoot[3] : set.wallFoot[rng.int(0, Math.min(2, set.wallFoot.length - 1))];
      if (pick === set.wallFoot[3]) face++;
      // (it stands at the face's foot: the tile's back corner)
      put(pick, tx, ty, false, 0, { x: tx + 0.12, y: ty + 0.12 });
      used.push([tx, ty]);
    }
  }

  // ---- BY THE EDGE: the ledge's rope rail along the drop; the cattails by the water
  if (set.edge.length) {
    const along: [number, number][] = [];
    for (let ty = 1; ty < H - 1; ty++) for (let tx = 1; tx < W - 1; tx++) {
      if (!whole(tx, ty) || keep[ty * W + tx] || taken[ty * W + tx] || boardSet.has(ty * W + tx)) continue;
      // (the drop's edge: a pit tile below it, toward the eye)
      const i = ty * W + tx;
      if (f.tiles[i + 1] === 3 || f.tiles[i + W] === 3) along.push([tx, ty]);
    }
    rng.shuffle(along);
    const used: [number, number][] = [];
    for (const [tx, ty] of along) {
      if (used.length >= Math.ceil(along.length / 10)) break;
      if (used.some(([x, y]) => Math.hypot(x - tx, y - ty) < 4)) continue;
      put(set.edge[rng.chance(0.8) ? 0 : set.edge.length - 1], tx, ty, false, f.tiles[ty * W + tx + 1] === 3 ? 0 : 1);
      used.push([tx, ty]);
    }
  }

  // THE GAME'S OWN THINGS AS THE FLOOR'S: its barrels and urns are its two breakables (render/act1_pieces.ts)
  L.props.push(...props);
  if (hazards.length) {
    f.hazards = [...(f.hazards ?? []), ...hazards];
    L.hazards = makeHazards(f);
  }
  void laneDist;
  void ((land: Land) => land);
  return out;
}
