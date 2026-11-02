// ACT 2, THE HUSH: FLOOR 14'S BOSS: THE PHYSICIAN (the House of Quiet, "The Physician's Theatre"): his rules (game/act1_rules/types.ts).
//
// His doc ("Wordsmith Act 2: The Hush", the planning chat's, with his yes as ideas): "A beaked plague doctor with a
// quill-tipped syringe." His moves: "a rap with his cane (his basic attack); the Draw, a lunge that steals one of your
// words, which glows over his head until you beat it back out of him; Tonic, vials smashed on the floor that leave clouds
// of the Hush; Rounds, where the patients rise from their beds." The planning chat's pick for the doc's open question on
// the Draw, told him 19 Oct about 11:05: "The Physician's Draw: it takes one of your words until you hit it back out of
// him." His pictures are the art chat's (art/physician.ts, physician_moves.ts, physician_shots.ts;
// docs/mockups/act2_housequiet/README.md), made on his word to it of 18 Oct, 21:24 Pacific ("Hey go without my say so.  If
// something is shit I’ll get it to it but you’re doing a great jobs. At least for 11-15"), read by the planning chat as his
// yes to go in, anything he flags mended. Every moment and reach here is theirs (tests/act2_physician.test.ts holds them to
// the art); what each move hurts, how hard and how often is this file's (his rulebook: four, a basic single-target blow,
// the bigger the hit the longer the cooldown):
//
//   THE RAP, his basic blow (PH_RAP): the cane lifted high over his right shoulder, held trembling (the warning), brought
//     down hard before him at its blow; whoever is under it, in its way down to where its ferrule strikes the boards
//     (about 1.2 tiles before him, a little to his right), is struck. Its mark there (art/physician_shots.ts drawCaneRap).
//   THE DRAW (PH_DRAW): side-on, low, the syringe levelled at you (the warning; a line of the enemy's pink along the floor
//     the way his lunge will go, drawDrawAim); the fencer's lunge, the quill at full reach (about 1.9 tiles) at its blow:
//     whoever it reaches is struck, and ONE OF THE WORDS SET IN HIS ATTACKS IS DRAWN OUT OF ITS SOCKET (one of them, by
//     the game's dice), his attack from then on as it is without it (Game.refresh); the barrel fills pink, and from as he
//     pushes the plunger home over his head the word hangs there (drawHeldWord: its own rune, burning the enemy's pink, so
//     the hero sees which). BEATEN BACK OUT OF HIM: by `draw.beat.hits` blows that land on him (not what burns or poisons
//     him) or `draw.beat.share` of his life in harm, whichever comes first, or at his death, it flies home (drawWordFreed)
//     to its socket, or to the pouch if that socket has been filled meanwhile (or it could not go back in it). He draws no
//     other while he holds one. A WORD IS NEVER LOST: the hero dying, leaving the floor, or the game saved while he holds
//     it, it is the hero's again (game.ts: die, clearLevel and save, through `giveBackAll` and `inTheSave`).
//   TONIC (PH_TONIC): three phials plucked from his belt and flung at its blow from his left hand; each flies
//     PHIAL_FLIGHT over its arc (drawPhialFlight), the first to where the hero stands then, the others `tonic.side` tiles to
//     either side of it across the way they are thrown; each smashes where it lands (whoever it lands on is struck, a
//     little) and a cloud of the Hush wells up out of the spill and lies there (drawHushCloud, HUSH_CLOUD_R,
//     HUSH_CLOUD_FOR): while the hero stands in one his words are dark (Game.hush, the act's own Hush status, HUSH_FOR).
//   ROUNDS (PH_ROUNDS): drawn up, cane and head lifted (the warning); three raps of the cane on the floor, a ring of the Hush
//     rolling out from each (drawRoundsRing); the cane swept round the room, pointing. THE PATIENTS RISE: those lying in
//     their beds near him (within `rounds.reach` tiles, the nearest first, as many as `rounds.n`; their own pack's or any),
//     one with each rap in turn; where too few lie there, patients are laid in the free ward beds near him and rise out of
//     them (worth nothing: his). Those asleep on their feet wake. All come. Never more than `rounds.most` of his called on
//     their feet; not made when there is none to raise.
//   His death (PH_DIES) as the art has it: the words he drew out of the city rising out of him. Whatever he holds of the
//     hero's flies home; his phials in the air fall no more, and his clouds thin away.
//
// HIS LINE, as the hero comes into his ground (game/defs.ts BOSS_LINES): a doctor's, shown over his head with no sound of
// a mouth (the beak; the Silent Order's way): "Say ah.", "Hold still. This won't hurt.", "Your last words, please." The
// planning chat's helper's pick, for his yes with the pictures.

import type { ActDef, BossRules, GaitDef } from '../bosses';
import { MSG, TUNE, WORDS } from '../defs';
import { beside, fromFigure } from '../facing';
import type { Game, RunSave } from '../game';
import type { Monster, Peril } from '../state';
import { HELD_WORD_IDS } from '../types';
import type { WordId } from '../types';
import { socketProblem } from '../words';
import { bedPlace, callUp, freeBeds, inBed } from './patient';
import type { Act1Rules } from './types';
import { DIAG, DRAW9, DRAW9_HIT, DRAW9_LONG, OP_HIT, OP_LONG, PHYSICIAN_ACTION, RAP9_HIT, RAP9_LONG, ROUNDS9_HITS, ROUNDS9_LONG, lensAt } from '../../art/physician_action';
import { BEAM, FIELD, LUNGE, RINGS, drawStrikes, fieldStrikes, inCone, rapStrikes, ringAt } from '../../art/physician_action_fx';
import { TILE3 } from '../../art/new_mobs3';

/** HIS WALK, a long stalking stride, painted for a tile a second (PH_PACE; twelve frames at eight a second); he stops at any frame of it, as his pictures hand over from any. */
export const PHYSICIAN_GAIT: GaitDef = { pace: 1.0, cycle: 1 / 8, setOff: 0, halt: 0, raise: 0, lower: 0, stopAt: 1.2, slack: 0.4, trueBack: true };

/** His four, his basic blow first and his biggest last (his rulebook: the bigger the hit, the longer the cooldown). */
export const PHYSICIAN_ACTS: readonly ActDef[] = [
  { id: 'physician:rap', clip: 'attack', long: 1.5, hit: 0.6, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 1.6 },
  { id: 'physician:draw', clip: 'draw', long: 2.9, hit: 27 / 30, dmg: 0.8, cooldown: 9, first: 3, after: 0.6, near: 0, far: 2.2 },
  { id: 'physician:tonic', clip: 'tonic', long: 2.0, hit: 25 / 30, dmg: 0.5, cooldown: 11, first: 5, after: 0.6, near: 1.6, far: 8 },
  { id: 'physician:rounds', clip: 'rounds', long: 2.4, hit: 0.62, dmg: 0, cooldown: 18, first: 7, after: 0.8, near: 0, far: 16 },
];

/** THE NUMBERS OF HIS FIGHT: his pictures' own (art/physician.ts, physician_moves.ts, physician_shots.ts: tiles before him and to the left he is drawn with, seconds, game pixels up), and what they hurt (the rules'). */
export const PHYSICIAN = {
  /** The rap: its blow at `hit`; the ferrule on the boards at `floor`, `at` (caneOf at 0.72); whoever is in its way, from `from` to `beyond` past there, `half` to either side of its line, is struck. Its mark lies `mark` (RAP_FOR). */
  rap: { hit: 0.6, floor: 0.72, at: [1.2236, -0.2874] as const, from: -0.2, beyond: 0.35, half: 0.55, mark: 0.45 },
  /**
   * The Draw: the warning from `warn[0]` to `warn[1]`; the quill at full reach at `hit`, `tip` (syringeOf at 27/30: about
   * 1.9 tiles before him, at a man's head height); whoever is in its way to `beyond` past it, `half` to either side, is
   * struck, and a word drawn out of him. The word comes up out of the quill as the plunger is pushed home (`push[0]` to
   * `push[1]`) and hangs `up` game pixels over his floor point (HELD_WORD_UP). Beaten back out of him by `beat.hits`
   * blows, or `beat.share` of his life in harm; it flies home in `beat.flight` (WORD_FREED_FOR).
   */
  draw: { hit: 27 / 30, warn: [0.3, 0.76] as const, tip: [1.8726, -0.0444] as const, beyond: 0.3, half: 0.5, push: [2.02, 2.3] as const, up: 58, beat: { hits: 5, share: 0.05, flight: 0.6 } },
  /**
   * Tonic: the phials leave his left hand at `hit` from `from` (its hand then, and game pixels up); `n` of them, the
   * first to where the hero stands, the others `side` tiles to either side of it across their way; each flies `flight`
   * (PHIAL_FLIGHT) and smashes there, striking whoever is within `smash` of it; its cloud of the Hush lies `cloud.long`
   * (HUSH_CLOUD_FOR), `cloudR` across (from HUSH_CLOUD_R).
   */
  tonic: { hit: 25 / 30, from: [0.9969, 0.2257, 31.66] as const, n: 3, side: 1.7, flight: 0.55, smash: 0.6, cloud: { r: 1.25, long: 4.0 } },
  /** Rounds: his three raps (`raps`), each a ring of the Hush rolling out from where the ferrule strikes (`at`) to `ring.reach` in `ring.long` (ROUNDS_RING_REACH, ROUNDS_RING_FOR); `n` patients raised within `reach` tiles of him, never more than `most` of his called on their feet. */
  rounds: { raps: [0.62, 0.92, 1.22] as const, at: [0.6122, -0.3877] as const, ring: { reach: 3.5, long: 0.9 }, n: 4, most: 6, reach: 16 },
};

/**
 * How far a cloud of the Hush reaches on the floor (tiles from its middle), `u` seconds after its phial smashed: as the
 * art draws it (art/physician_shots.ts drawHushCloud: an ellipse HUSH_CLOUD_R x 32 by x 16 game pixels each way, so
 * HUSH_CLOUD_R times the root of two in tiles, the floor's diamonds going 32 by 16; growing from three tenths of it over
 * its first half second, thinning away over its last 1.2), to where it is still thick (`THICK` of its edge, its thin
 * dithered rim not counted); 0 where it is too thin to hush (`dens` under `THIN`).
 */
const THICK = 0.85;
const THIN = 0.12;
export function cloudR(u: number): number {
  const C = PHYSICIAN.tonic.cloud;
  if (u < 0 || u >= C.long) return 0;
  const sm = (v: number): number => {
    const c = Math.max(0, Math.min(1, v));
    return c * c * (3 - 2 * c);
  };
  const grow = sm((u - 0.1) / 0.5);
  const fade = 1 - sm((u - (C.long - 1.2)) / 1.2);
  if (0.55 * grow * fade < THIN) return 0;
  return C.r * Math.SQRT2 * THICK * (0.3 + 0.7 * grow);
}

/** Where his cane's ferrule strikes the boards in his rap, where the quill reaches in his Draw, where his Rounds' raps fall: from where he stands, the way he faces, the hand he is drawn with. */
export const rapSpot = (m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, hand, PHYSICIAN.rap.at[0], PHYSICIAN.rap.at[1]);
export const quillSpot = (m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, hand, PHYSICIAN.draw.tip[0], PHYSICIAN.draw.tip[1]);
export const roundsSpot = (m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } => beside(m.x, m.y, m.fx, m.fy, hand, PHYSICIAN.rounds.at[0], PHYSICIAN.rounds.at[1]);

// ---------------------------------------------------------------------------------------------------------------------
// THE WORD HE HOLDS (Monster.a1: held 1; w its word, in HELD_WORD_IDS; sk the attack it was set in, sd its side (0 before,
// 1 behind), sl its socket; hits the blows landed on him since; life his life as he took it; upT when it came up over his
// head, game time; -1 until then)

/** The word he holds of the hero's, or null. */
export function heldWord(m: Monster): WordId | null {
  return m.a1 && m.a1.held ? HELD_WORD_IDS[m.a1.w] ?? null : null;
}

/** Where a word goes back to: its own socket if it is still empty and it may go in it there, else the pouch. */
function homeOf(sockets: { front: (WordId | null)[]; behind: (WordId | null)[] }[], s: Record<string, number>, w: WordId): { list: (WordId | null)[]; i: number } | null {
  const so = sockets[s.sk];
  const list = so ? (s.sd ? so.behind : so.front) : null;
  if (!list || s.sl < 0 || s.sl >= list.length || list[s.sl] !== null) return null;
  return socketProblem(list, w) === null ? { list, i: s.sl } : null;
}

/** IT IS THE HERO'S AGAIN: the word he holds goes back to its socket (or the pouch); `fly`: beaten out of him, it flies home (a picture only: it is home at once). */
export function giveBack(g: Game, m: Monster, fly: boolean): void {
  const s = m.a1;
  const w = heldWord(m);
  if (!s || !w) return;
  const h = g.hero;
  const home = homeOf(h.skills, s, w);
  if (home) home.list[home.i] = w;
  else h.words[w] = (h.words[w] ?? 0) + 1;
  s.held = 0;
  g.refresh();
  if (!fly) return;
  // (it breaks free over his head and flies home to him, taking its own colour again as it comes)
  // (`b`: it hung over the rune stones of the words he carries, while he lived and carried any: render/act1_fx/physician.ts)
  const p: Peril = { kind: 'act1', a1: 'physician:freed', x: m.x, y: m.y, fx: m.fx, fy: m.fy, t: 0, hit: 1e9, dur: PHYSICIAN.draw.beat.flight, dmg: 0, el: 'phys', words: [], from: m.name, done: 0, a: s.w, b: !m.dead && m.carries.length ? 1 : 0, c: 0, d: 0, hand: 1 };
  g.perils.push(p);
  g.emit({ t: 'text', x: h.x, y: h.y, text: WORDS[w].name.toUpperCase(), color: MSG.word });
  g.msg(`${WORDS[w].name.toUpperCase()} is yours again`, MSG.word);
}

/** (game.ts: as a level is left, and as the hero falls) every word any Physician holds is the hero's again. */
export function giveBackAll(g: Game): void {
  for (const m of g.monsters) if (!m.dead && m.kind === 'physician' && heldWord(m)) giveBack(g, m, false);
}

/** (game.ts save) THE SAVE HAS IT: a word a Physician holds is written into the save where it would go back to, as if beaten out of him (the game itself goes on as it is). */
export function inTheSave(run: RunSave, monsters: readonly Monster[]): void {
  for (const m of monsters) {
    const w = m.kind === 'physician' && !m.dead ? heldWord(m) : null;
    if (!w || !m.a1) continue;
    const home = homeOf(run.sockets, m.a1, w);
    if (home) home.list[home.i] = w;
    else run.words[w] = (run.words[w] ?? 0) + 1;
  }
}

/** THE DRAW TAKES A WORD: one of those set in the hero's attacks (the game's dice say which), out of its socket and his. False: he has none set. */
function drawOut(R: BossRules, m: Monster): boolean {
  const g = R.g;
  const h = g.hero;
  const set: [number, number, number][] = [];
  h.skills.forEach((s, i) => {
    s.front.forEach((w, k) => void (w && set.push([i, 0, k])));
    s.behind.forEach((w, k) => void (w && set.push([i, 1, k])));
  });
  if (!set.length) return false;
  const [sk, sd, sl] = set[Math.min(set.length - 1, Math.floor(g.rng.next() * set.length))];
  const list = sd ? h.skills[sk].behind : h.skills[sk].front;
  const w = list[sl]!;
  list[sl] = null;
  m.a1 = { ...(m.a1 ?? {}), held: 1, w: HELD_WORD_IDS.indexOf(w), sk, sd, sl, hits: 0, life: m.life, upT: -1 };
  g.refresh();
  g.emit({ t: 'text', x: h.x, y: h.y, text: `${WORDS[w].name.toUpperCase()} drawn out`, color: '#ff8a80' });
  g.msg(`${m.name} draws out ${WORDS[w].name.toUpperCase()}`, MSG.foe);
  return true;
}

// ---------------------------------------------------------------------------------------------------------------------
// HIS ROUNDS

/** Those of the patients he has called still on their feet (or rising). */
function called(R: BossRules, m: Monster): number {
  let n = 0;
  for (const o of R.g.monsters) if (!o.dead && o.kind === 'patient' && o.a1?.called === m.id) n++;
  return n;
}
/** The patients near him his Rounds would raise (lying in their beds, or asleep on their feet), the nearest first; and the free beds near him. */
function toRaise(R: BossRules, m: Monster): { lying: Monster[]; beds: ReturnType<typeof freeBeds> } {
  const g = R.g;
  const Q = PHYSICIAN.rounds;
  const lying = g.monsters
    .filter((o) => !o.dead && o.kind === 'patient' && Math.hypot(o.x - m.x, o.y - m.y) <= Q.reach && ((inBed(o) === 1 && !o.a1?.go) || (inBed(o) === 0 && o.state === 'sleep')))
    .sort((a, b) => Math.hypot(a.x - m.x, a.y - m.y) - Math.hypot(b.x - m.x, b.y - m.y));
  return { lying, beds: freeBeds(R, m.x, m.y, Q.reach) };
}
/** HIS ROUNDS RAISE THE PATIENTS: as many as he may, those lying near first, then new ones laid in the free beds; each rises with one of his raps in turn (`k` from now: the first rap's turn is now). */
function makeRounds(R: BossRules, m: Monster, raps: readonly number[] = PHYSICIAN.rounds.raps): void {
  const g = R.g;
  const h = g.hero;
  const Q = PHYSICIAN.rounds;
  const room = Math.max(0, Math.min(Q.n, Q.most - called(R, m)));
  if (room <= 0) return;
  const { lying, beds } = toRaise(R, m);
  const raised: Monster[] = lying.slice(0, room);
  for (const b of beds) {
    if (raised.length >= room) break;
    // (a patient laid in the bed, where the bed has one lie: patient.ts finds it the nearest)
    const at = bedPlace(b);
    const add = g.spawn('patient', at.x, at.y, m.packId, 0, false, g.rng);
    if (inBed(add) !== 1) {
      // (it found no room there after all: it is not made)
      g.monsters.splice(g.monsters.indexOf(add), 1);
      continue;
    }
    add.xp = 0;
    raised.push(add);
  }
  raised.forEach((o, i) => {
    o.a1 = { ...(o.a1 ?? {}), called: m.id };
    if (o.state === 'sleep') {
      o.state = 'chase';
      o.cd = g.rng.range(0.4, 0.9);
    }
    // (one with each rap in turn)
    const k = i % raps.length;
    callUp(o, raps[k] - raps[0] + 0.15 * o.seed);
    if (inBed(o) === 0) {
      const d = Math.hypot(h.x - o.x, h.y - o.y) || 1;
      o.fx = (h.x - o.x) / d;
      o.fy = (h.y - o.y) / d;
    }
  });
}

// ---------------------------------------------------------------------------------------------------------------------

const OLD: Act1Rules = {
  gait: PHYSICIAN_GAIT,
  acts: PHYSICIAN_ACTS,

  spawned(_R, m) {
    m.a1 = { held: 0, upT: -1 };
  },

  can(R, m, a) {
    // (the Draw: not while he holds a word already; Rounds: only with someone to raise, and room for them)
    if (a.id === 'physician:draw') return !heldWord(m);
    if (a.id === 'physician:rounds') {
      // (looked for again every half second, not every step: the floor's beds are many)
      const s = m.a1 ?? (m.a1 = {});
      const g = R.g;
      if (g.time < (s.rNext ?? 0)) return s.rOk === 1;
      const { lying, beds } = toRaise(R, m);
      s.rOk = called(R, m) < PHYSICIAN.rounds.most && lying.length + beds.length > 0 ? 1 : 0;
      s.rNext = g.time + 0.5;
      return s.rOk === 1;
    }
    return true;
  },

  start(R, m, a) {
    if (a.id === 'physician:rounds') R.g.msg(`${m.name} makes his rounds`, MSG.foe);
  },

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const free = !h.move && h.invuln <= 0 && !g.over;
    switch (a.id) {
      case 'physician:rap': {
        const P = PHYSICIAN.rap;
        if (at(P.hit)) {
          // (brought down hard before him: whoever is in its way to where the ferrule strikes)
          const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
          if (r.fwd >= P.from && r.fwd <= P.at[0] + P.beyond && Math.abs(r.left - P.at[1]) <= P.half && free) R.blow(m, a.dmg);
          g.sfx('swing', 0.6);
        }
        if (at(P.floor)) {
          const s = rapSpot(m, act.hand);
          R.peril(m, 'act1', s.x, s.y, { a1: 'physician:rap', dur: P.mark });
          g.emit({ t: 'shake', amount: 2 });
          g.sfx('slam', 0.5);
        }
        break;
      }
      case 'physician:draw': {
        const D = PHYSICIAN.draw;
        if (at(D.hit)) {
          // THE LUNGE: the quill at full reach; whoever it reaches is struck, and a word drawn out of him
          const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
          if (r.fwd >= -0.2 && r.fwd <= D.tip[0] + D.beyond && Math.abs(r.left - D.tip[1]) <= D.half && free) {
            R.blow(m, a.dmg);
            if (!heldWord(m)) drawOut(R, m);
          }
          g.sfx('swing', 0.9);
        }
        // (the word he drew comes up out of the quill as he pushes the plunger home, and hangs over his head)
        if (at(D.push[0]) && heldWord(m) && m.a1) m.a1.upT = g.time;
        break;
      }
      case 'physician:tonic': {
        const T = PHYSICIAN.tonic;
        if (!at(T.hit)) break;
        // FLUNG: three phials from his left hand, the first at the hero, the others to either side of him across their way
        const o = beside(m.x, m.y, m.fx, m.fy, act.hand, T.from[0], T.from[1]);
        const dx = h.x - o.x;
        const dy = h.y - o.y;
        const d = Math.hypot(dx, dy) || 1;
        const ux = dx / d;
        const uy = dy / d;
        const dmg = g.rollMonsterDmg(m) * a.dmg;
        for (let i = 0; i < T.n; i++) {
          const side = i === 0 ? 0 : (i % 2 ? 1 : -1) * T.side * Math.ceil(i / 2);
          // (where it lands, drawn in toward the hero where the floor there is not open)
          let x = h.x - uy * side;
          let y = h.y + ux * side;
          for (let k = 0; k < 4 && !g.isOpen(x, y); k++) {
            x = (x + h.x) / 2;
            y = (y + h.y) / 2;
          }
          R.peril(m, 'act1', x, y, { a1: 'physician:phial', hit: T.flight, dur: T.flight + T.cloud.long, dmg, a: o.x, b: o.y, c: i * 1.7 + m.seed * 5, d: 0, fx: ux, fy: uy });
        }
        g.sfx('swing', 0.7);
        break;
      }
      case 'physician:rounds': {
        const Q = PHYSICIAN.rounds;
        Q.raps.forEach((T, k) => {
          if (!at(T)) return;
          // (a rap of the cane on the floor, a ring of the Hush rolling out from it; with the first, he calls them)
          const s = roundsSpot(m, act.hand);
          R.peril(m, 'act1', s.x, s.y, { a1: 'physician:ring', dur: Q.ring.long });
          g.emit({ t: 'shake', amount: 1 });
          g.sfx('slam', 0.35);
          if (k === 0) makeRounds(R, m);
        });
        break;
      }
      default:
        break;
    }
  },

  lifeFloor(R, m) {
    // (the rules' word after every harm that lands on him, game.ts damageMonster: so the place a word is beaten back out
    // of him. A blow that lands (not what burns or poisons him: those do not jolt him, struckT) counts one; the harm since
    // he took it counts too)
    const s = m.a1;
    if (!s || !s.held) return 0;
    if (m.struckT === 0) {
      s.hits = (s.hits ?? 0) + 1;
      // (counted: marked a hair past the blow, which his reel does not see, so that what burns him in the same moment is not
      // taken for another blow; the next blow sets it back to the blow's own moment)
      m.struckT = 1e-9;
    }
    const B = PHYSICIAN.draw.beat;
    if (m.life > 0 && (s.hits >= B.hits || s.life - m.life >= B.share * m.maxLife)) giveBack(R.g, m, true);
    return 0;
  },

  peril(R, p) {
    const g = R.g;
    const h = g.hero;
    if (p.a1 !== 'physician:phial' || p.t < p.hit) return;
    const u = p.t - p.hit;
    if (!p.done) {
      // (it smashes: whoever it lands on is struck, a little)
      p.done = 1;
      if (Math.hypot(h.x - p.x, h.y - p.y) <= PHYSICIAN.tonic.smash + TUNE.heroRadius * 0.5) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
      g.emit({ t: 'shake', amount: 1 });
      g.sfx('shatter', 0.4);
    }
    // (THE HUSH: his words dark while he stands in its cloud; none once its maker is dead and it thins away, `d`)
    if (p.d > 0 || g.over) return;
    const r = cloudR(u);
    if (r > 0 && Math.hypot(h.x - p.x, h.y - p.y) <= r) g.hush();
  },

  died(R, m) {
    const g = R.g;
    // (what he holds of the hero's flies home)
    giveBack(g, m, true);
    // (his phials in the air fall no more; his clouds thin away, hushing no one)
    const list = g.perils;
    for (let k = list.length - 1; k >= 0; k--) {
      const p = list[k];
      if (p.kind !== 'act1' || p.from !== m.name || !p.a1 || !p.a1.startsWith('physician:')) continue;
      if (p.a1 === 'physician:phial') {
        if (p.t < p.hit) list.splice(k, 1);
        else {
          p.d = p.t;
          p.dur = Math.min(p.dur, p.t + 1.2);
        }
      }
    }
  },
};

// =====================================================================================================================
// HIS FIGHT DONE THE ACTION WAY (PHYSICIAN_ACTION: art/physician_action.ts and physician_action_fx.ts, the art chat's, his yes
// there: his review of 31 Oct, "Diagnosis (Recommended)"; 2 Nov, "It needs a little more excitement, and the meter needs to fill
// faster", and his pick "Bigger operation"; brought in by the main chat, 2 Nov 2026, behind the same switch, off until his yes here).
// Every moment and reach is the art's (docs/mockups/action_f14_physician/README.md); what each hurts and how often, the rules':
//   THE RAP: the cane hauled up and HELD; brought down in two frames far before him: whoever is in its line to where the ferrule
//     cracks the boards, or in the star of cracks round it (`rapStrikes`), struck.
//   THE DRAW: en garde, HELD; the long lunge, a needle of pink light down its lane (`drawStrikes`): struck, and a word drawn out of
//     him as before; it hangs over his head from as he pushes the plunger home (DRAW9.push[0]).
//   DIAGNOSIS (in place of the tonic): the great brass lens raised before his beak; its beam follows the hero a breath behind
//     (BEAM.lag); the mark fills while he stands in its light (BEAM.fill), drains while he is hid from it (BEAM.drain). THE COVER:
//     whatever of the floor cannot be walked (the beds, the operating table, the gallery, the walls: the walk grid, tile by tile:
//     `lensSees`). He looks as long as LOOK_FOR, the look looping (DIAG.loop); then lowers it.
//   HE OPERATES: the mark full, from that very frame of his look (the act handed over in place): the field locked where the hero
//     stood; the theatre plunged dark, one hard spotlight on the field (render.ts light; opDark); his instruments flung out round it,
//     HELD; then closed in, ONE HUGE STRIKE at OP_HIT on whoever is within FIELD.r of its middle (`fieldStrikes`).
//   ROUNDS: three raps of the cane (ROUNDS9_HITS), a great ring of the Hush rolling out from each (RINGS): whoever it passes is
//     hushed (`ringAt`); the patients rise with the raps, as before.
// THE PILLARS the art's Diagnosis has are the scene's only: the game's theatre has none yet (a piece of the floor's, on his yes to its
// picture); its beds and table are the cover until then.

/** The Diagnosis's floor peril: the operation's field (x, y; `a` his id; `c` a seed for its cuts; struck at `hit`). */
export const OP_PERIL = 'physician:op';
/** How long he looks before he lowers the lens, if the mark is never full (the art's suggestion: 8 s). */
export const LOOK_FOR = 8;

/** His five, his basic blow first; his operation the Diagnosis's own end (forced: never picked). */
export const PHYSICIAN9_ACTS: readonly ActDef[] = [
  { id: 'physician:rap', clip: 'attack', long: RAP9_LONG, hit: RAP9_HIT, dmg: 1, cooldown: 0, first: 0, after: 0.5, near: 0, far: 3.0 },
  { id: 'physician:draw', clip: 'draw', long: DRAW9_LONG, hit: DRAW9_HIT, dmg: 0.8, cooldown: 9, first: 3, after: 0.6, near: 0, far: LUNGE.to - 0.4 },
  { id: 'physician:diagnose', clip: 'diagnose', long: DIAG.long, hit: DIAG.up, dmg: 0, cooldown: 11, first: 5, after: 0.6, near: 1.6, far: BEAM.reach - 3 },
  { id: 'physician:operate', clip: 'operate', long: OP_LONG, hit: OP_HIT, dmg: 2.0, cooldown: 0, first: 0, after: 1.0, near: 0, far: 0, forced: true },
  { id: 'physician:rounds', clip: 'rounds', long: ROUNDS9_LONG, hit: ROUNDS9_HITS[0], dmg: 0, cooldown: 18, first: 7, after: 0.8, near: 0, far: 16 },
];

/** Where his lens is through the look (tiles before him, to his left; game pixels up), as his pictures hold it. */
let LENS: readonly [number, number, number] | null = null;
export function lensOfHim(): readonly [number, number, number] {
  if (!LENS) {
    const p = lensAt('diagnose', DIAG.loop[0]);
    LENS = [p[0] / TILE3, p[1] / TILE3, p[2] / 2];
  }
  return LENS;
}
/** His lens's floor point, him at (x, y) facing (fx, fy), drawn with `hand`. */
export function lensSpot(m: { x: number; y: number; fx: number; fy: number }, hand: number): { x: number; y: number } {
  const L = lensOfHim();
  return beside(m.x, m.y, m.fx, m.fy, hand, L[0], L[1]);
}
/** WHETHER THE LENS SEES a floor point from its own: no tile on the way between that cannot be walked (a bed, the table, a wall). */
export function lensSees(g: Game, x0: number, y0: number, x1: number, y1: number): boolean {
  const L = g.level;
  const W = L.floor.w;
  const H = L.floor.h;
  const d = Math.hypot(x1 - x0, y1 - y0);
  const n = Math.ceil(d / 0.12);
  for (let k = 1; k < n; k++) {
    const along = (k / n) * d;
    if (along < 0.3 || d - along < 0.35) continue;
    const x = x0 + ((x1 - x0) * k) / n;
    const y = y0 + ((y1 - y0) * k) / n;
    const tx = Math.floor(x);
    const ty = Math.floor(y);
    if (tx < 0 || ty < 0 || tx >= W || ty >= H || L.walk[ty * W + tx] !== 1) return false;
  }
  return true;
}
/** How far the beam's light goes from the lens (x, y) along the way `a` (radians), to the first tile it cannot cross, or its reach. */
export function beamRun(g: Game, x: number, y: number, a: number): number {
  const L = g.level;
  const W = L.floor.w;
  const H = L.floor.h;
  const cx = Math.cos(a);
  const cy = Math.sin(a);
  for (let d = 0.3; d < BEAM.reach; d += 0.1) {
    const tx = Math.floor(x + cx * d);
    const ty = Math.floor(y + cy * d);
    if (tx < 0 || ty < 0 || tx >= W || ty >= H || L.walk[ty * W + tx] !== 1) return d;
  }
  return BEAM.reach;
}
const wrap = (a: number): number => a - Math.PI * 2 * Math.round(a / (Math.PI * 2));
const clamp01 = (v: number): number => (v < 0 ? 0 : v > 1 ? 1 : v);

/** THE MARK FULL: he operates, from the frame of his look he is at; the field locked where the hero stands. */
function operate(R: BossRules, m: Monster): void {
  const g = R.g;
  const h = g.hero;
  const act = m.act!;
  const i = PHYSICIAN9_ACTS.findIndex((a) => a.id === 'physician:operate');
  const di = PHYSICIAN9_ACTS.findIndex((a) => a.id === 'physician:diagnose');
  if (m.moveCd && di >= 0) m.moveCd[di] = PHYSICIAN9_ACTS[di].cooldown;
  m.act = { id: 'physician:operate', t: 0, n: act.n, hand: act.hand, a: 0, b: 0, x: h.x, y: h.y };
  m.move = i;
  m.animT = 0;
  if (m.a1) m.a1.dOn = 0;
  R.peril(m, 'act1', h.x, h.y, { a1: OP_PERIL, hit: OP_HIT, dur: OP_HIT + FIELD.lie, dmg: g.rollMonsterDmg(m) * PHYSICIAN9_ACTS[i].dmg, a: m.id, c: Math.floor(m.seed * 97) });
  g.sfx('bossRoar', 0.6);
}

const ACTION: Act1Rules = {
  gait: PHYSICIAN_GAIT,
  acts: PHYSICIAN9_ACTS,
  spawned: OLD.spawned,
  lifeFloor: OLD.lifeFloor,

  can(R, m, a, dist, los) {
    if (a.id === 'physician:diagnose') {
      // (only with the hero in his lens's sight)
      const L = lensSpot({ x: m.x, y: m.y, fx: (R.g.hero.x - m.x) / (dist || 1), fy: (R.g.hero.y - m.y) / (dist || 1) }, 1);
      return los && lensSees(R.g, L.x, L.y, R.g.hero.x, R.g.hero.y);
    }
    return OLD.can!(R, m, a, dist, los);
  },

  start: OLD.start,

  acting(R, m, a, t0, t1) {
    const g = R.g;
    const h = g.hero;
    const act = m.act!;
    const at = (T: number): boolean => t0 < T && t1 >= T;
    const free = !h.move && h.invuln <= 0 && !g.over;
    switch (a.id) {
      case 'physician:rap': {
        if (!at(RAP9_HIT)) break;
        // (brought down hard far before him: in its line, or in the star of cracks round where the ferrule strikes)
        const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
        if (rapStrikes(r.fwd, r.left) && free) R.blow(m, a.dmg);
        g.emit({ t: 'shake', amount: 3 });
        g.sfx('slam', 0.6);
        break;
      }
      case 'physician:draw': {
        if (at(DRAW9_HIT)) {
          const r = fromFigure(m.x, m.y, m.fx, m.fy, act.hand, h.x, h.y);
          if (drawStrikes(r.fwd, r.left) && free) {
            R.blow(m, a.dmg);
            if (!heldWord(m)) drawOut(R, m);
          }
          g.sfx('swing', 0.9);
        }
        if (at(DRAW9.push[0]) && heldWord(m) && m.a1) m.a1.upT = g.time;
        break;
      }
      case 'physician:diagnose': {
        const s = m.a1 ?? (m.a1 = {});
        const L = lensSpot(m, act.hand);
        if (at(DIAG.up)) {
          // (the lens up: its beam comes on, pointing at the hero)
          s.dAim = Math.atan2(h.y - L.y, h.x - L.x);
          s.dFill = 0;
          s.dLook = 0;
          s.dLit = 0;
          s.dOn = 1;
          g.sfx('gust', 0.4);
        }
        if (t1 < DIAG.up || !s.dOn) break;
        const dt = Math.max(0, t1 - t0);
        // THE BEAM follows him a breath behind; the mark fills while he stands in its light, drains while he is hid
        s.dAim += wrap(Math.atan2(h.y - L.y, h.x - L.x) - s.dAim) * (1 - Math.exp(-dt / BEAM.lag));
        const lit = !g.over && inCone([L.x, L.y], s.dAim, [h.x, h.y]) && lensSees(g, L.x, L.y, h.x, h.y);
        s.dLit = lit ? 1 : 0;
        s.dFill = clamp01(s.dFill + (lit ? dt / BEAM.fill : -dt / BEAM.drain));
        s.dLook += dt;
        if (s.dFill >= 1) {
          operate(R, m);
          return;
        }
        if (s.dLook >= LOOK_FOR || g.over) {
          // (never full: he lowers it, the rest of his clip from the look's end)
          s.dOn = 0;
          break;
        }
        // (THE LOOK, round and round while he looks)
        if (act.t >= DIAG.loop[1]) act.t = DIAG.loop[0] + (act.t - DIAG.loop[1]);
        break;
      }
      case 'physician:operate':
        // (the strike is the field's: its peril)
        break;
      case 'physician:rounds': {
        const d = (() => {
          const S = beside(m.x, m.y, m.fx, m.fy, act.hand, RINGS.ahead, RINGS.left);
          return Math.hypot(h.x - S.x, h.y - S.y);
        })();
        ROUNDS9_HITS.forEach((T, k) => {
          if (at(T)) {
            g.emit({ t: 'shake', amount: k === 2 ? 3 : 2 });
            g.sfx('slam', 0.4 + 0.1 * k);
            if (k === 0) makeRounds(R, m, ROUNDS9_HITS);
          }
          // (A GREAT RING OF THE HUSH rolls out from it: whoever it passes is hushed, once a ring)
          const bit = 1 << k;
          if (act.b & bit) return;
          const r = ringAt(k, t1);
          if (r !== null && Math.abs(d - r) <= RINGS.band / 2 + 0.15 && !g.over) {
            act.b |= bit;
            g.hush();
          }
        });
        break;
      }
      default:
        break;
    }
  },

  peril(R, p, dt) {
    if (p.a1 !== OP_PERIL) return OLD.peril!(R, p, dt);
    const g = R.g;
    const h = g.hero;
    if (p.done || p.t < p.hit) return;
    // THE ONE HUGE STRIKE: his instruments close in on the field from all round
    p.done = 1;
    if (fieldStrikes(h.x - p.x, h.y - p.y) && !h.move && h.invuln <= 0 && !g.over) g.hurtHero(p.dmg, p.el, p.words, null, p.from, p.x, p.y, p.half);
    g.emit({ t: 'shake', amount: 8 });
    g.sfx('slam', 1);
  },

  died(R, m) {
    OLD.died!(R, m);
    // (his operation, not yet struck, is no more: the light comes back)
    const list = R.g.perils;
    for (let k = list.length - 1; k >= 0; k--) if (list[k].a1 === OP_PERIL && list[k].a === m.id && list[k].t < list[k].hit) list.splice(k, 1);
  },
};

/** The operation under way now (the field's peril), or null: for the dark it throws over the room (render.ts). */
export function operationNow(perils: readonly Peril[]): Peril | null {
  if (!PHYSICIAN_ACTION.on) return null;
  for (const p of perils) if (p.kind === 'act1' && p.a1 === OP_PERIL) return p;
  return null;
}

const pick = (): Act1Rules => (PHYSICIAN_ACTION.on ? ACTION : OLD);
export const RULES: Act1Rules | null = {
  get gait() {
    return pick().gait;
  },
  get acts() {
    return pick().acts;
  },
  spawned: (R, m) => pick().spawned?.(R, m),
  can: (R, m, a, dist, los) => pick().can?.(R, m, a, dist, los) ?? true,
  start: (R, m, a) => pick().start?.(R, m, a),
  acting: (R, m, a, t0, t1, dt) => pick().acting(R, m, a, t0, t1, dt),
  lifeFloor: (R, m) => pick().lifeFloor?.(R, m) ?? 0,
  peril: (R, p, dt) => pick().peril?.(R, p, dt),
  died: (R, m) => pick().died?.(R, m),
};
