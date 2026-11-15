// THE GODOT PORT: WHAT THE FIGHT SHOWS OF A BLOW AND OF A WORD (godot/scripts/fx.gd), its colours and its tables, so that none
// of them is copied by hand:
//   npx tsx tools/godot_fxlooks.ts        -> godot/assets/fx/looks.json
// What is in it:
//   P             the game's palette, whole (art/palette.ts)
//   ELEMENT_RAMP  the elements' ramps, dark to light (art/palette.ts)
//   WORD_HUE      the colour each word shows in as a move is used with it behind (render/fx.ts)
//   WORD_COLOR    each word's own colour (art/icons.ts): a guardian smoulders in its first word's
//   ramps         the effects' own ramps, brightest first: POWER_HOT, STONE, WIND, MIRROR, FLAME, EMBER, SMOKE, ICE, SNOW, VOLT,
//                 BLOOD, VIOLET, VENOM, BUBBLE (render/fx.ts)
//   limits        how many particles may be alive, and when what only dresses the scene thins out (render/fx.ts)
//   wild          BIG AND WILD (render/wild.ts): the blade's light, the wind, the sparks off armour, what flies off each kind of
//                 monster when it is hit (MATTER), where the point of the thrust is
//   words3        Heavy's bronze, its dust, and how long and how far a stagger knocks (render/words3.ts)
//   FIGURE_SIZE   how tall each figure stands and how wide (art/bestiary.ts): a stun turns over its head
//   switches      the game's switches these looks hang on, as the game starts
// The effects' ramps and limits are not exported by the game's files: they are read out of the files' own text (`constOf`), each
// worked out with the game's own tables in hand, so that a colour changed there is changed here the next time this is run.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { gameSwitches } from './godot_switches';
import { FIGURE_SIZE } from '../src/art/bestiary';
import { THRUST } from '../src/art/heroes3';
import { WORD_COLOR } from '../src/art/icons';
import { BONE } from '../src/art/kit';
import { BLOOD as M_BLOOD, FLESH, FUR, GLOOM, IRON } from '../src/art/mkit';
import { WILD } from '../src/art/moves3';
import { OSSUARY, PALLOR, PLANK, SHROUD } from '../src/art/new_mobs3';
import { ELEMENT_RAMP, P } from '../src/art/palette';
import { WORD_HUE } from '../src/render/fx';
import { AIR, CRACKLE, LEAP_LIFT, THRUST_LIFT } from '../src/render/wild';
import { NEW_RAMP, STAGGER, WORDS3 } from '../src/render/words3';

gameSwitches();
const OUT = 'godot/assets/fx';
mkdirSync(OUT, { recursive: true });

/**
 * A constant a file of the game keeps to itself, worked out from the file's own text: `const NAME[: type] = <what it is>;` at
 * the left margin, its right-hand side read with `scope` in hand (the tables it names: P, BONE ...).
 */
function constOf(text: string, name: string, scope: Record<string, unknown> = {}): unknown {
  const head = new RegExp(`^(?:export )?const ${name}\\b[^=\\n]*= `, 'm').exec(text);
  if (!head) throw new Error(`no const ${name}`);
  const from = head.index + head[0].length;
  // (to the ';' that ends it: not one inside brackets, a string or a comment)
  let depth = 0;
  let at = from;
  for (; at < text.length; at++) {
    const c = text[at];
    if (c === "'" || c === '"' || c === '`') {
      for (at++; text[at] !== c; at++) if (text[at] === '\\') at++;
    } else if (c === '/' && text[at + 1] === '/') at = text.indexOf('\n', at);
    else if (c === '/' && text[at + 1] === '*') at = text.indexOf('*/', at) + 1;
    else if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') depth--;
    else if (c === ';' && depth === 0) break;
  }
  const what = text.slice(from, at).replace(/\s+as const\s*$/, '');
  return new Function(...Object.keys(scope), `return (${what});`)(...Object.values(scope));
}

/** The colours written straight into one of a file's functions (`'#rrggbb'`), in the order they stand there. */
function hexesIn(text: string, fn: string): string[] {
  const at = text.search(new RegExp(`^(?:export )?function ${fn}\\(`, 'm'));
  if (at < 0) throw new Error(`no function ${fn}`);
  return [...text.slice(at, text.indexOf('\n}\n', at)).matchAll(/'(#[0-9a-fA-F]{6})'/g)].map((m) => m[1]);
}

const fx = readFileSync('src/render/fx.ts', 'utf8');
const wild = readFileSync('src/render/wild.ts', 'utf8');
const words3 = readFileSync('src/render/words3.ts', 'utf8');

const RAMPS = ['POWER_HOT', 'STONE', 'WIND', 'MIRROR', 'FLAME', 'EMBER', 'SMOKE', 'ICE', 'SNOW', 'VOLT', 'BLOOD', 'VIOLET', 'VENOM', 'BUBBLE'];
const ramps = Object.fromEntries(RAMPS.map((n) => [n, constOf(fx, n, { P })]));
const limits = Object.fromEntries(['MAX_PARTICLES', 'AMBIENT_EASY', 'AMBIENT_FULL'].map((n) => [n, constOf(fx, n)]));
// (wild.ts: CRACKLE is its own, named by the others)
const wildScope = { P, CRACKLE, BONE, M_BLOOD, FLESH, FUR, GLOOM, IRON, OSSUARY, PALLOR, PLANK, SHROUD };
const matter = constOf(wild, 'MATTER', wildScope) as Record<string, { bits: string[]; sparks: boolean; blood: boolean; dust: boolean }>;

const looks = {
  P,
  ELEMENT_RAMP,
  WORD_HUE,
  WORD_COLOR,
  ramps,
  limits,
  wild: {
    CRACKLE,
    AIR,
    STRUCK_STEEL: constOf(wild, 'STRUCK_STEEL', wildScope),
    BLADE: constOf(wild, 'BLADE', wildScope),
    // (what a little blood off flesh is painted in: wild.ts debris)
    BLOOD: [M_BLOOD[2], M_BLOOD[3]],
    LEAP_LIFT,
    THRUST_LIFT,
    THRUST_POINT: constOf(wild, 'THRUST_POINT'),
    THRUST_POINT_Z: constOf(wild, 'THRUST_POINT_Z'),
    MATTER: matter,
  },
  words3: {
    HEAVY: NEW_RAMP.heavy,
    DUST: constOf(words3, 'DUST'),
    STAGGER,
    STAGGER_PX: constOf(words3, 'STAGGER_PX'),
    // (the colours its functions write straight into what they draw, each list in the order they stand in the function:
    // heavyHit, the stone thrown up; grit, its dark grain; drawCracks, the beaten middle, the chips, the dark slabs, the gap
    // (twice) and the cracks' far ends; drawStun, the dark under a spark's arms)
    heavyHit: hexesIn(words3, 'heavyHit'),
    grit: hexesIn(words3, 'grit'),
    drawCracks: hexesIn(words3, 'drawCracks'),
    drawStun: hexesIn(words3, 'drawStun'),
  },
  FIGURE_SIZE,
  switches: { WILD: WILD.on, THRUST: THRUST.on, WORDS3: WORDS3.on },
};
writeFileSync(`${OUT}/looks.json`, JSON.stringify(looks, null, 1));
console.log(`fx looks: ${Object.keys(P).length} colours, ${Object.keys(WORD_COLOR).length} words' colours, ${RAMPS.length} ramps, ${Object.keys(matter).length} kinds of matter, ${Object.keys(FIGURE_SIZE).length} figures; limits ${JSON.stringify(limits)}; switches ${JSON.stringify(looks.switches)}`);
