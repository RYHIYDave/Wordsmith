// THE GODOT PORT: EVERY HERO'S PICTURES' OWN TIMES (art/heroes3.ts makeHeroArt3, as the game draws him in the dungeon), for
// godot/scripts/baked_hero.gd: the bake keeps only each list's frames, and the game plays a move's pictures by its clip's own pace
// and the moment its blow comes in them (render/figure.ts attackFrame: the wind-up played faster or slower to end when the rules'
// does, then at its own pace; heldFrame: a held move round and round from its `loop`).
//   npx tsx tools/godot_hero_clips.ts   -> godot/assets/heroes/clips.json: for each class, its stand's and walk's pace, and for each of
//                                          his moves' lists as the bake numbers them (art/heroes3.ts bakeLists: 14 the quick attack,
//                                          15 to 18 it made walking, 19 the second swing, 20 the slow attack, 35 to 38 it made walking,
//                                          39 the leap, 40 the roll, 41 a move held, 42 its beginning, 43 its letting go, 44 the
//                                          whirl, 45 the landing, 46 and 47 the reels, 56 the change, 57 the fall): fps, hit, loop,
//                                          tail, and how many frames.
import { writeFileSync } from 'node:fs';
import { paintWithoutCanvas } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { makeHeroArt3 } from '../src/art/heroes3';
import { HERO_TAILS, lookOfPlace } from '../src/art/heroes';
import { VETERAN } from '../src/game/veteran';
import { WARLOCK, playableClasses } from '../src/game/warlock';
import { TINKERER } from '../src/game/tinkerer';
import { BRAWLER } from '../src/game/brawler';
import { ATTR_COLOR, ENTER_OUT } from '../src/ui/panels';
import { MODE_LINE } from '../src/game/modes';
import { PHASE_APART } from '../src/render/figure';
import { RING_H, RING_HEAD, RING_LIFT, RING_LIP, RING_W } from '../src/art/title_ring';
import { heroSides } from '../src/render/baked';
import { CLASSES, RANGER_ARROW, TUNE } from '../src/game/defs';
import { SWAP_TUNE } from '../src/game/swap_moves';
import { ELEMENT_RAMP, P } from '../src/art/palette';
import { CRACKLE } from '../src/render/wild';
import { readFileSync } from 'node:fs';
import type { AnimSet, Clip } from '../src/art/actor_types';
import type { ClassId } from '../src/game/types';

paintWithoutCanvas();
gameSwitches();
// (the three heroes the release puts on with its defines, tools/lib.mjs RELEASE_DEFINES: on its class cards, all six)
WARLOCK.on = true;
TINKERER.on = true;
BRAWLER.on = true;
const art = makeHeroArt3();
const one = (c: Clip | undefined): Record<string, unknown> | null =>
  c ? { fps: c.fps, hit: c.hit ?? null, loop: c.loop ?? null, tail: c.tail ?? null, n: c.frames.length } : null;
const out: Record<string, unknown> = {};
// (a set of pictures' times: its stand's and walk's pace, and each of its lists the bake numbers; attack2Walk, 125 to 128, after the
// rest, as art/heroes3.ts bakeLists has them)
const timesOf = (s: AnimSet & { idleFps?: number; walkFps?: number }): Record<string, unknown> => {
  const c = s.clips;
  const lists: Record<string, unknown> = {
    14: one(c?.attack),
    19: one(c?.attack2),
    20: one(c?.heavy),
    39: one(c?.leap),
    40: one(c?.roll),
    41: one(c?.hold),
    42: one(c?.holdStart),
    43: one(c?.release),
    44: one(c?.whirl),
    45: one(c?.land),
    46: one(c?.reel),
    47: one(c?.lurch),
    56: one(c?.change),
    57: one(c?.fall),
  };
  (c?.attackWalk ?? []).forEach((w, k) => (lists[15 + k] = one(w)));
  (c?.heavyWalk ?? []).forEach((w, k) => (lists[35 + k] = one(w)));
  (c?.reelWalk ?? []).forEach((w, k) => (lists[48 + k] = one(w)));
  (c?.lurchWalk ?? []).forEach((w, k) => (lists[52 + k] = one(w)));
  (c?.attack2Walk ?? []).forEach((w, k) => (lists[125 + k] = one(w)));
  return { idleFps: s.idleFps ?? 2, walkFps: s.walkFps ?? 8, walkStride: s.walkStride ?? null, startAt: s.startAt ?? 0, start: one(s.start), stops: (s.stops ?? []).map((x) => one(x)), lists };
};
for (const cls of Object.keys(CLASSES) as ClassId[]) {
  const a = art.of(cls, { ...lookOfPlace('dungeon'), vet: cls === 'brawler' });
  const s = heroSides(a)[0] as AnimSet & { idleFps?: number; walkFps?: number };
  // (ON HIS CLASS CARD, ui/panels.ts drawTitle: his front, in town dress, the weapon on his back (art/heroes.ts lookOfPlace('card'));
  // standing, running on the spot by the clock, coming to a stand, what he does left standing (idleA, idleB), making ready: the
  // cards bake's lists 0, 2, 6 to 13, 113, 114 and 115)
  const card = heroSides(art.of(cls, { ...lookOfPlace('card'), vet: cls === 'brawler' && VETERAN.on }))[0] as AnimSet & { idleFps?: number; walkFps?: number };
  const cc = card.clips;
  const cardOut = { idleFps: card.idleFps ?? 2, walkFps: card.walkFps ?? 8, idle: card.idle.length, walk: card.walk.length, stops: (card.stops ?? []).map((x) => one(x)), idleA: one(cc?.idleA), idleB: one(cc?.idleB), ready: one(cc?.ready) };
  out[cls] = { ...timesOf(s), card: cardOut };
}
// (THE WARLOCK AS THE DEMON, art/heroes.ts lookOfPlace('demon'): its own pictures, two sides, its rakes, Damning, its burning out)
out['warlock:demon'] = timesOf(heroSides(art.of('warlock', { ...lookOfPlace('demon') }))[0] as AnimSet & { idleFps?: number; walkFps?: number });
// (THE SCARF, THE FEATHER, THE BRAIDS: engine/tails.ts, each kind as art/heroes.ts HERO_TAILS has it)
out.tails = HERO_TAILS;
// (THE CLASS CARDS, ui/panels.ts drawTitle with CARDS3: the classes in their order, each card's name, words and numbers, the
// colour of its attribute; what the two modes say; the title; how the picked one warps away (ENTER_OUT, render/figure.ts
// PHASE_APART); the start screen's picture, art/title_ring.ts, where it lies)
out.cards = {
  title: 'WORDSMITH',
  order: playableClasses(),
  classes: Object.fromEntries(playableClasses().map((c) => [c, { name: CLASSES[c].name, blurb: CLASSES[c].blurb, primary: CLASSES[c].primary, attrs: CLASSES[c].attrs, starts: CLASSES[c].starts }])),
  attrColor: ATTR_COLOR,
  modeLine: MODE_LINE,
  enterOut: ENTER_OUT,
  phaseApart: PHASE_APART,
  smithNight: '#05040f',
  ring: { w: RING_W, h: RING_H, lip: RING_LIP, lift: RING_LIFT, headTop: RING_HEAD, least: 26, under: 24, most: 7 },
};
// (THE HEROES' MOVES' OWN NUMBERS, defs.ts TUNE: an attack's slowing of his walk, how long, and the follow-through a quick attack may
// cut into; the Ranger's arrow (RANGER_ARROW), his volley's and his traps'; the Mage's wave's fan and her orb's; a held move's walk;
// and game.ts's VOLLEY_SEEN and TRACK_AIM, read out of it as it is written)
const GAME_TS = readFileSync('src/game/game.ts', 'utf8');
const numIn = (re: RegExp): number => Number((re.exec(GAME_TS) ?? ['', 'NaN'])[1]);
const T = TUNE as unknown as Record<string, number>;
out.tune = Object.fromEntries(['heroSpeed', 'heroRadius', 'attackSlow', 'attackSlowTime', 'attackCut', 'comboWindow', 'swingStep', 'swingStepTime', 'beamWalk', 'whirlWalk',
  'volleyDelay', 'volleyLife', 'volleyEvery', 'volleyHit', 'volleyLead', 'trapArm', 'trapTrigger', 'trapLife', 'trapMax', 'waveFan', 'orbLife', 'orbEvery', 'orbMax', 'familiarLife', 'familiarMax'].map((k) => [k, T[k] ?? null]));
out.rangerArrow = RANGER_ARROW;
out.swap = SWAP_TUNE;
out.volleySeen = numIn(/const VOLLEY_SEEN = ([\d.]+);/);
out.trackAim = { near: numIn(/TRACK_AIM = \{ on: true, near: ([\d.]+) \}/) };
// (the colours what the heroes send is drawn in: art/palette.ts P, ELEMENT_RAMP; render/wild.ts CRACKLE)
out.palette = P;
out.ramps = ELEMENT_RAMP;
out.crackle = CRACKLE;
writeFileSync('godot/assets/heroes/clips.json', JSON.stringify(out, null, 1));
for (const [cls, v] of Object.entries(out).filter(([k]) => k in CLASSES || k === 'warlock:demon')) {
  const L = (v as { lists: Record<string, { fps: number; hit: number | null; n: number } | null> }).lists;
  console.log(cls, Object.entries(L).filter(([, x]) => x).map(([k, x]) => `${k}:${x!.n}@${x!.fps}${x!.hit !== null ? 'h' + x!.hit.toFixed(2) : ''}`).join(' '));
}
