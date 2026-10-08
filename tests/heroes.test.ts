// The heroes' moving pictures, as the game will show them (Version 11): the Scarf Knight (with
// sword and shield, and with a great sword in both hands), the Feather-cap Scout, and the mage of
// the wide brim and long scarf; each facing the camera and facing away.
//
// Every frame of every one of them is painted here, about a thousand in all. A plain painting
// stands in for the canvas (tests/helpers.ts), so what is read is the very frame the game would
// show: trimmed, anchored, with the places its scarf or feather is tied.
//
// The timelines themselves (the key poses) are not exported by the art files, so what is checked
// is what came of them: how many frames, how fast, when the blow lands, and the pictures.
//   run: tsx --test tests/heroes.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';

import type { ActorArt, AnimSet, Clip } from '../src/art/actor_types';
import { MAGE_TAILS, makeMageArt } from '../src/art/hero_mage';
import { RANGER_TAILS, makeRangerArt } from '../src/art/hero_ranger';
import { WARRIOR_TAILS, makeWarriorArt } from '../src/art/hero_warrior';
import { HERO_TAILS, PLAIN, makeHeroArt, painted } from '../src/art/heroes';
import { CLIP_FPS, GESTURE_FPS, IDLE_FPS, IDLE_FRAMES, IDLE_SECONDS, WALK_FPS, WALK_FRAMES } from '../src/art/kit';
import type { Sprite } from '../src/engine/px';
import { TAIL_PATCH, Tails } from '../src/engine/tails';
import type { TailDef } from '../src/engine/tails';
import { SKILLS } from '../src/game/defs';
import type { SkillId } from '../src/game/defs';
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';
import { CLASS_IDS } from '../src/game/types';
import type { ClassId } from '../src/game/types';
import { Figure, GESTURE_FIRST, attackClip, attackFrame, heldFrame } from '../src/render/figure';
import { paintWithoutCanvas, paintingOf, unlike } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
  deepEqual(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;

paintWithoutCanvas();

/** One of the four figures a player can be shown as. */
interface Who {
  name: string;
  cls: ClassId;
  art: ActorArt;
  /** What flies from the figure: the tails every one of its frames must name. */
  tails: string[];
  /** Has a picture of its own for a leap (the warrior's evasive move; the ranger rolls and the mage vanishes). */
  leaps: boolean;
}

const FIGURES: Who[] = [
  { name: 'the warrior with sword and shield', cls: 'warrior', art: makeWarriorArt({ twoHanded: false }), tails: ['w-scarf-a', 'w-scarf-b'], leaps: true },
  { name: 'the warrior with a great sword', cls: 'warrior', art: makeWarriorArt({ twoHanded: true }), tails: ['w-scarf-a', 'w-scarf-b'], leaps: true },
  { name: 'the ranger', cls: 'ranger', art: makeRangerArt(), tails: ['r-feather'], leaps: false },
  { name: 'the mage', cls: 'mage', art: makeMageArt(), tails: ['m-feather', 'm-scarf'], leaps: false },
];
const VIEWS = ['front', 'back'] as const;
type View = (typeof VIEWS)[number];
const CLIPS = ['attack', 'heavy', 'leap', 'idleA', 'idleB'] as const;
type ClipName = (typeof CLIPS)[number];
/** What each clip is, in words. */
const CALLED: Record<ClipName, string> = { attack: 'quick attack', heavy: 'slow attack', leap: 'leap', idleA: 'first thing done when left standing', idleB: 'second thing done when left standing' };

/** How long a clip plays, first frame to last. */
const seconds = (c: Clip): number => (c.frames.length - 1) / c.fps;

/** The timelines of one facing, by name. */
function clipsOf(set: AnimSet): [ClipName, Clip][] {
  const out: [ClipName, Clip][] = [];
  for (const k of CLIPS) {
    const c = set.clips ? set.clips[k] : undefined;
    if (c) out.push([k, c]);
  }
  return out;
}

/** One clip of one facing, which must be there. */
function clip(set: AnimSet, k: ClipName): Clip {
  const c = set.clips ? set.clips[k] : undefined;
  if (!c) throw new Error(`no ${k} clip`);
  return c;
}

/** Every figure, facing each way. */
function each(fn: (who: Who, view: View, set: AnimSet, name: string) => void): void {
  for (const who of FIGURES) for (const view of VIEWS) fn(who, view, who.art[view], `${who.name}, ${view === 'front' ? 'facing the camera' : 'facing away'}`);
}

/**
 * Where the pictures do not yet do what a test here asks of every one of them. Each was reported
 * to the author on 4 Oct 2026, with its numbers; the reason is given beside it. An entry is left
 * unchecked, and said so when the tests run, until it is put right: then delete it, and the test
 * holds that picture to the rule like the rest.
 */
const REPORTED: Record<string, string> = {
  // (Empty since the faults first listed here were put right, the same day: the ranger's and the
  // mage's attacks now end with the wind once round and on a frame that reaches their last key,
  // the mage's free hand leaves the satchel and comes back to it, and the squirrel stays under the
  // cloak until it comes out and after it has gone back.)
};
const notYet: string[] = [];
const nowHolds: string[] = [];

/** A rule that every picture should keep. One that is listed above as not yet keeping it is let off, and noted. */
function rule(key: string, holds: boolean, detail: string): void {
  if (key in REPORTED) {
    (holds ? nowHolds : notYet).push(`${key} (${holds ? 'it does now: delete it from REPORTED' : `${detail}: ${REPORTED[key]}`})`);
    return;
  }
  assert.ok(holds, `${key} (${detail})`);
}

// =============================================================================================

test('every figure has every animation, facing the camera and facing away', () => {
  each((who, view, set, name) => {
    // the two loops
    assert.deepEqual([set.idle.length, set.walk.length, set.idleFps, set.walkFps], [IDLE_FRAMES, WALK_FRAMES, IDLE_FPS, WALK_FPS], `${name}: standing and walking`);
    // the two attacks: timelines with the frames between the key poses, not three poses
    assert.ok(set.clips, `${name}: its moves are timelines`);
    for (const k of ['attack', 'heavy'] as const) {
      const c = clip(set, k);
      assert.equal(c.fps, CLIP_FPS, `${name}: the ${CALLED[k]} plays at thirty frames a second`);
      assert.ok(c.frames.length >= 10, `${name}: the ${CALLED[k]} is a real swing (${c.frames.length} frames; it used to be three poses)`);
      // (the three stills older code asks for are still there, and are frames of the timeline)
      const stills = k === 'attack' ? set.attack : set.heavy;
      assert.ok(stills && stills.length === 3, `${name}: three stills of the ${CALLED[k]}`);
      for (const f of stills ?? []) assert.ok(c.frames.includes(f), `${name}: each still of the ${CALLED[k]} is one of its frames`);
    }
    // the leap: the warrior's own; the others have none (a roll is shown as the walk, a warp is not shown at all)
    const leap = set.clips ? set.clips.leap : undefined;
    if (who.leaps) {
      assert.ok(leap && set.leap && set.leap.length === 3, `${name}: a leap`);
      if (leap) assert.deepEqual([leap.frames.length, leap.fps, leap.hit], [13, 12, undefined], `${name}: laid out over the jump in twelve steps`);
    } else {
      assert.ok(leap === undefined && set.leap === undefined, `${name}: no leap`);
    }
    // what the hero does when left standing: two things, for the view that faces the camera only
    const a = set.clips ? set.clips.idleA : undefined;
    const b = set.clips ? set.clips.idleB : undefined;
    if (view === 'front') {
      assert.ok(a && b, `${name}: two things to do when left standing`);
      for (const c of [a, b]) if (c) assert.ok(c.fps === GESTURE_FPS && c.frames.length > GESTURE_FPS && c.hit === undefined, `${name}: each at twenty frames a second, and more than a second long`);
    } else {
      assert.ok(a === undefined && b === undefined, `${name}: none of that facing away`);
    }
    // and nothing else (but what a figure does while an attack is HELD, and when it is let go: see the test below)
    for (const k of Object.keys(set.clips ?? {})) assert.ok((CLIPS as readonly string[]).includes(k) || ['hold', 'release', 'whirl', 'whirlEnd', 'land', 'roll', 'fall', 'reel', 'lurch'].includes(k), `${name}: ${k} is a clip this test knows`);
  });
});

// From Version 15.1 (the owner, 6 Oct 2026: "the mage fires his beam and it blows his cloak back.
// I want things to have weight"). Up to 15.0 a held attack showed one frozen frame of the cast.
test('a held beam: the mage stands braced in a loop for as long as it burns, and lets go of it after', () => {
  each((who, _view, set, name) => {
    const hold = set.clips?.hold;
    const release = set.clips?.release;
    if (who.cls !== 'mage') {
      assert.ok(hold === undefined && release === undefined, `${name}: nothing of its own for a held attack (it shows the attack's frame, as before)`);
      return;
    }
    assert.ok(hold && release, `${name}: a loop for the beam held, and a letting go`);
    if (!hold || !release) return;
    assert.equal(hold.fps, CLIP_FPS, `${name}: the held beam plays at thirty frames a second`);
    assert.ok(hold.loop !== undefined && hold.loop > 0, `${name}: the blast arrives before the loop begins`);
    const from = Math.round((hold.loop ?? 0) * hold.fps);
    const n = hold.frames.length;
    assert.ok(n - 1 - from >= 8, `${name}: the loop is long enough not to look like a twitch (${n - 1 - from} frames)`);
    // the loop closes: its last frame is the first of the loop again, to the pixel
    assert.equal(unlike(hold.frames[n - 1], hold.frames[from]), 0, `${name}: the loop ends where it began`);
    // and it is alive: no two frames of it that follow each other are the same
    for (let i = from; i < n - 1; i++) assert.ok(unlike(hold.frames[i], hold.frames[i + 1]) > 0, `${name}: frames ${i} and ${i + 1} of the loop differ`);
    // the frame the rules ask for goes round and round, and never shows the last frame (the first again) twice
    const seen = new Set<Sprite>();
    for (let t = 0; t < 3; t += 1 / 120) seen.add(heldFrame(hold, t));
    assert.equal(seen.size, n - 1, `${name}: every frame but the last is shown`);
    assert.equal(heldFrame(hold, 0), hold.frames[0]);
    assert.equal(heldFrame(hold, (hold.loop ?? 0) + (n - 1 - from) / hold.fps), hold.frames[from], `${name}: after once round it is at the start of the loop again`);
    // braced, the mage is not standing: the coat is out behind
    assert.ok(unlike(hold.frames[from], set.idle[0]) > 300, `${name}: the mage braced is not the mage standing`);
    // let go, the mage comes back to standing
    assert.equal(unlike(release.frames[release.frames.length - 1], set.idle[0]), 0, `${name}: the letting go ends as the figure stands`);
    // the blast is in the scarf and the feather while it lasts, and not after
    assert.ok((hold.frames[from].tails ?? []).every((r) => (r.blast ?? 0) > 0), `${name}: the blast blows on what flies from the mage`);
    assert.ok((set.idle[0].tails ?? []).every((r) => (r.blast ?? 0) === 0), `${name}: standing, there is no blast`);
  });
});

/**
 * The attack each of a figure's two attack animations was drawn for, and must keep time with: the
 * warrior's swing for Strike and his blow brought down for Slam (the one-handed sword's; with the
 * two-handed sword the swing is also held and carried round for Whirlwind); the ranger's draw for
 * Shot and her draw at the sky for Volley; the mage's thrust for Wave and the staff brought down
 * for Orb.
 */
const DRAWN_FOR: Record<ClassId, readonly [SkillId, SkillId]> = { warrior: ['strike', 'slam'], ranger: ['shot', 'volley'], mage: ['wave', 'orb'] };

// From Version 15.1 (the owner, 6 Oct 2026: heroes are to be "very stylized and cool. Proud and
// daring", and "I want things to have weight"). Up to 15.0 a hero whose life ran out stood as they
// stood, behind the words YOU DIED. Now each of them FALLS first: thrown back, down to their
// knees, and the light goes out of whatever glowed on them.
test("a hero's fall: from standing, down to their knees, and the light goes out of them", () => {
  // (what glows on a hero, kit.ts: the tones of a lit blade, a crystal, an eye, a glowing hem)
  const GLOW = ['#ffffff', '#b8fff8', '#8af6f0', '#7af8f0', '#22d0e0', '#0c6a80'];
  const glowing = (f: Sprite): number => {
    const p = paintingOf(f);
    let n = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (GLOW.includes(p.get(x, y) ?? '')) n++;
    return n;
  };
  /** How high the middle of what is painted stands above the floor point, in picture pixels. */
  const middle = (f: Sprite): number => {
    const p = paintingOf(f);
    let n = 0;
    let sum = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) { n++; sum += f.ay * (f.density ?? 1) - y; }
    return sum / Math.max(1, n);
  };
  each((_who, _view, set, name) => {
    const fall = set.clips?.fall;
    assert.ok(fall, `${name}: has a fall`);
    if (!fall) return;
    assert.equal(fall.fps, CLIP_FPS, `${name}: the fall plays at thirty frames a second`);
    assert.ok(fall.hit === undefined && fall.loop === undefined, `${name}: it has no blow and no loop: it is played once`);
    // (the game shows a fallen hero for two seconds before the words come up: main.ts, FALL_SEEN)
    assert.ok(seconds(fall) >= 1.2 && seconds(fall) <= 1.8, `${name}: the fall takes ${seconds(fall).toFixed(2)} seconds`);
    const frames = Array.from(fall.frames);
    const first = frames[0];
    const last = frames[frames.length - 1];
    assert.equal(unlike(first, set.idle[0]), 0, `${name}: the fall begins as the figure stands`);
    // it keeps moving all the way down: nearly every frame is a new picture, and it never stands
    // still for longer than a held breath (a tenth of a second: holding themselves up, before the knees go)
    let same = 0;
    let run = 0;
    for (let i = 1; i < frames.length; i++) {
      if (unlike(frames[i - 1], frames[i]) > 0) run = 0;
      else {
        same++;
        run++;
        assert.ok(run <= 3, `${name}: the fall stands still for more than three frames at frame ${i}`);
      }
    }
    assert.ok(same <= frames.length * 0.15, `${name}: ${same} of the fall's ${frames.length} frames are the same picture as the one before`);
    // down: what is left of them is lower than they stood
    assert.ok(middle(last) <= middle(first) - 3, `${name}: they end lower than they stood (the middle of the picture ${middle(first).toFixed(1)} above the floor standing, ${middle(last).toFixed(1)} fallen)`);
    // and the light is out: they glowed, and at the end nothing of them does
    // (the scout carries nothing that casts light of its own: his glow is the points of his arrows and his eyes)
    assert.ok(glowing(first) > 0 && first.aura, `${name}: standing, they glow, and have their pool of light behind them`);
    assert.equal(glowing(last), 0, `${name}: ${glowing(last)} pixels of the fallen figure still glow`);
    assert.ok((last.lights ?? []).length === 0 && !last.aura, `${name}: fallen, they give off no light and have no pool of light behind them`);
    // (it goes out by degrees: each frame glows no more than the one before it did, once they are down)
    const lit = frames.map((f) => (f.lights ?? []).reduce((a, l) => a + (l.a ?? 1), 0));
    for (let i = Math.floor(frames.length * 0.6) + 1; i < frames.length; i++) assert.ok(lit[i] <= lit[i - 1] + 1e-9, `${name}: the light comes back at frame ${i} of the fall`);
    // every frame of it says where the scarf or the feather is tied
    for (const f of frames) assert.ok(f.tails && f.tails.length > 0, `${name}: a frame of the fall has nothing tied to it`);
  });
});

// From Version 15.1: a hero struck hard is rocked back on their heels ("I want things to have
// weight"). Up to 15.0 a hero who was struck flashed red and did not move.
test('a heavy blow rocks a hero back: a quarter of a second, from standing and back to it', () => {
  each((_who, _view, set, name0) => {
   // (rocked back by a blow from in front; thrown forward by one from behind)
   for (const [reel, name] of [[set.clips?.reel, `${name0}, struck from in front`], [set.clips?.lurch, `${name0}, struck from behind`]] as const) {
    assert.ok(reel, `${name}: has a picture of it`);
    if (!reel) return;
    assert.equal(reel.fps, CLIP_FPS, `${name}: it plays at thirty frames a second`);
    assert.ok(reel.hit === undefined && reel.loop === undefined, `${name}: no blow and no loop`);
    // (the renderer shows it for as long as it lasts and no longer than REEL_TIME, 0.4 s: render.ts)
    assert.ok(seconds(reel) >= 0.15 && seconds(reel) <= 0.3, `${name}: it takes ${seconds(reel).toFixed(2)} seconds`);
    const frames = Array.from(reel.frames);
    assert.equal(unlike(frames[0], set.idle[0]), 0, `${name}: it begins as the figure stands`);
    assert.equal(unlike(frames[frames.length - 1], set.idle[0]), 0, `${name}: and ends as the figure stands`);
    // in between they are plainly somewhere else: at its furthest, a good part of the picture has moved
    const furthest = Math.max(...frames.map((f) => unlike(f, set.idle[0])));
    assert.ok(furthest > 300, `${name}: rocked back, ${furthest} pixels of the picture differ from standing`);
    for (const f of frames) assert.ok(f.tails && f.tails.length > 0, `${name}: a frame of it has nothing tied to it`);
   }
    // the two are not the same picture: one goes back, the other forward
    const a = set.clips?.reel;
    const b = set.clips?.lurch;
    if (a && b) assert.ok(unlike(a.frames[2], b.frames[2]) > 300, `${name0}: rocked back and thrown forward are different pictures`);
  });
});

test('the blow lands in the picture when it lands in the rules', () => {
  each((who, view, set, name) => {
    // (the attack each of a figure's two animations is played for: see Renderer.clipOf. The mage's
    // thrust is also played, stretched, for a beam, until the mage is drawn with a wand: the ghost
    // line is that attack's wind-up, and the wand's own flick is still to be painted.)
    const [first, second] = DRAWN_FOR[who.cls];
    for (const [k, id] of [['attack', first], ['heavy', second]] as const) {
      const c = clip(set, k);
      const def = SKILLS[id];
      const what = `${name}: ${def.name}`;
      const hit = c.hit;
      assert.ok(hit !== undefined, `${what} has a moment of impact`);
      if (hit === undefined) return;
      assert.ok(hit > 0 && hit < seconds(c), `${what}: the blow (${hit} s) falls inside the picture (${seconds(c).toFixed(3)} s)`);
      // The picture's wind-up is played faster or slower so that it ends when the rules' does (see
      // attackFrame in render/figure.ts): the two need not be equal, but they must be close, or
      // the swing would be seen to crawl or to snap.
      assert.ok(Math.abs(hit - def.windup) <= 0.05, `${what}: the picture winds up for ${hit} s, the rules for ${def.windup}`);
      assert.ok(hit * c.fps >= 2, `${what}: the wind-up is drawn (${(hit * c.fps).toFixed(1)} frames of it)`);
      // after the blow the picture runs at its own pace for as long as the rules keep the hero busy
      const after = seconds(c) - hit;
      assert.ok(Math.abs(after - def.follow) <= 2 / c.fps + 1e-9, `${what}: ${after.toFixed(3)} s of picture after the blow, ${def.follow} s of follow-through in the rules`);
      // and it is the same attack seen from the other side: as long, and landing at the same moment
      const other = clip(who.art[view === 'front' ? 'back' : 'front'], k);
      assert.deepEqual([c.frames.length, c.hit], [other.frames.length, other.hit], `${what}: front and back agree`);
    }
  });
});

test('an attack begins as the figure stands and comes back to standing', () => {
  each((who, _view, set, name) => {
    const rest = set.idle[0];
    for (const k of ['attack', 'heavy'] as const) {
      const c = clip(set, k);
      const n = c.frames.length;
      // to the pixel: the first frame of an attack IS the standing loop's first frame
      const first = unlike(c.frames[0], rest);
      const last = unlike(c.frames[n - 1], rest);
      rule(`${name}: the ${CALLED[k]} begins as the figure stands`, first === 0, `${first} pixels differ`);
      rule(`${name}: the ${CALLED[k]} ends as the figure stands`, last === 0, `${last} pixels differ`);
      // and in between it is an attack: a good part of the figure moves
      let most = 0;
      for (const f of c.frames) most = Math.max(most, unlike(f, rest));
      assert.ok(most > 300, `${name}: the ${CALLED[k]} moves the figure (${most} pixels at the most)`);
      // even where the end is not yet exact it is the standing figure near enough: fewer than a
      // third of its pixels differ (the most is a fifth: the mage's nova seen from behind, whose
      // staff is one pixel out all the way up)
      const whole = pixels(rest);
      assert.ok(last < whole / 3, `${name}: the ${CALLED[k]} ends close to standing (${last} of ${whole} pixels differ)`);
    }
    // (A leap is not like that. Its timeline is laid over the jump itself, from leaving the floor
    // to landing: it begins crouched to push off and ends coming down, and is never shown standing.)
    if (who.leaps) {
      const c = clip(set, 'leap');
      assert.ok(unlike(c.frames[0], rest) > 300 && unlike(c.frames[c.frames.length - 1], rest) > 300, `${name}: a leap neither begins nor ends standing`);
    }
  });
});

test("played by the rules' clock, the picture lands its blow in the step the rules land theirs, and is done when they are", () => {
  const dt = 1 / 60;
  each((who, _view, set, name) => {
    for (const skill of [0, 1] as const) {
      // a hero of that class in an empty room asks for the attack, and the game runs
      const g = Game.forPractice(who.cls, 3);
      (g as unknown as { waveT: number }).waveT = 1e9;
      g.monsters.length = 0;
      const h = g.hero;
      const def = SKILLS[h.skills[skill].id];
      // (the animation the game plays for it: the mage's orb is set with the staff brought down, the figure's second)
      const c = clip(set, attackClip(who.cls, skill, def.kind) === 0 ? 'attack' : 'heavy');
      const what = `${name}: ${def.name}`;
      const ctl = emptyControls();
      ctl.aimX = ctl.castX = h.x + 2;
      ctl.aimY = ctl.castY = h.y;
      if (skill === 0) ctl.fire = true;
      else ctl.cast = true;
      g.update(dt, ctl);
      ctl.fire = false;
      ctl.cast = false;
      // the frame the game would show at each step, by the three numbers the rules hand the picture
      const shown = (): number => c.frames.indexOf(attackFrame(c, h.attackAge, h.attackWind));
      const blow = Math.floor((c.hit ?? 0) * c.fps + 1e-6);
      assert.equal(shown(), 0, `${what}: asked for, the picture is on its first frame`);
      let before = 0;
      let landed = -1;
      let last = 0;
      for (let k = 0; k < 120 && h.attackT > 0; k++) {
        const winding = h.windup !== null;
        g.update(dt, ctl);
        const i = shown();
        assert.ok(i >= last, `${what}: the picture does not run backwards`);
        if (winding && h.windup === null) {
          landed = i;
          // (a step is half a frame of the picture: so "the frame of the blow, or the one after".
          // An attack that goes on while it is held is shown, from the step it begins, in the
          // pose it holds: the blade out, a frame further on. See CHANNEL_POSE in game.ts.)
          const late = def.channel ? 2 : 1;
          assert.ok(before <= blow && i >= blow && i <= blow + late, `${what}: the rules land the blow as the picture goes from frame ${before} to frame ${i}; the picture's own blow is on frame ${blow}`);
        }
        if (h.windup !== null) before = i;
        if (h.attackT > 0) last = i;
      }
      assert.ok(landed >= 0, `${what}: it landed`);
      assert.equal(h.anim, 'idle', `${what}: and is over`);
      // when the rules let go of the hero, the picture has run (all but) to its end: no more than two frames are lost
      assert.ok(last >= c.frames.length - 3, `${what}: the last frame shown is ${last} of ${c.frames.length - 1}`);
    }
  });
});

test('in the game itself: left standing, each hero does their thing after a few seconds, and drops it the moment they attack', () => {
  const arts = makeHeroArt();
  const dt = 1 / 60;
  for (const cls of CLASS_IDS) {
    // a new character, standing in town with nothing near
    const g = new Game(cls, 5);
    const h = g.hero;
    // (The town leaves a new arrival facing up the screen, back to the camera, and what a hero does
    // when left standing is painted for the view that faces the camera only: as they arrive they
    // would stand there for ever. So: turned round.)
    h.fx = 1;
    h.fy = 0;
    const art = arts.of(cls, PLAIN);
    const set = art.front;
    const thing = clip(set, 'idleA');
    const strike = clip(set, 'attack');
    const fig = new Figure();
    const ctl = emptyControls();
    /** One step of the game, and the picture the renderer would ask the figure for after it. */
    const show = (): Sprite => {
      g.update(dt, ctl);
      return fig.frame(art, { anim: h.anim, animT: h.animT, fx: h.fx, fy: h.fy, attackSkill: h.attackSkill, attackAge: h.attackAge, attackWind: h.attackWind, leapK: -1 }, dt, (h.x - h.y) * 16, (h.x + h.y) * 8, true);
    };
    let t = 0;
    let begun = -1;
    while (t < 12 && begun < 0) {
      t += dt;
      const f = show();
      if (fig.began) {
        begun = t;
        assert.ok(fig.began === 1 && f === thing.frames[0], `${cls}: the first thing, from its first frame`);
      } else assert.ok(set.idle.includes(f), `${cls}: until then, standing`);
    }
    assert.ok(begun >= GESTURE_FIRST && begun < GESTURE_FIRST + IDLE_SECONDS + 0.1, `${cls}: begun after ${begun.toFixed(2)} s of standing`);
    for (let k = 0; k < 30; k++) assert.ok(thing.frames.includes(show()) && fig.busy, `${cls}: half a second of it`);
    assert.deepEqual(fig.tails.shapes().map((x) => x.id).sort(), [...(FIGURES.find((w) => w.cls === cls) as Who).tails].sort(), `${cls}: with the scarf or the feather flying all the while`);
    // the hero attacks: the very next picture is the attack's first frame, and the thing is forgotten
    ctl.fire = true;
    ctl.aimX = h.x + 2;
    ctl.aimY = h.y;
    const first = show();
    ctl.fire = false;
    assert.ok(first === strike.frames[0] && !fig.busy, `${cls}: the attack is shown at once`);
    // the attack plays through, and then the hero simply stands
    let last = 0;
    for (let k = 0; k < 120 && h.attackT > 0; k++) {
      const f = show();
      if (h.attackT <= 0) break;
      const i = strike.frames.indexOf(f);
      assert.ok(i >= last, `${cls}: the attack's own frames, in order`);
      last = i;
    }
    assert.ok(last >= strike.frames.length - 3, `${cls}: to its end (frame ${last} of ${strike.frames.length - 1})`);
    assert.ok(set.idle.includes(show()) && !fig.busy, `${cls}: and stands`);
    assert.equal(h.skills[0].uses, 1);
  }
});

/** How many pixels of a frame are painted. */
function pixels(s: Sprite): number {
  const p = paintingOf(s);
  let n = 0;
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) n++;
  return n;
}

/** The colours of a frame. */
function colours(s: Sprite, into: Set<string> = new Set()): Set<string> {
  const p = paintingOf(s);
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c !== null) into.add(c);
    }
  }
  return into;
}

/** How many pixels of a frame are of colours the given palette does not have. */
function strange(s: Sprite, palette: Set<string>): number {
  const p = paintingOf(s);
  let n = 0;
  for (let y = 0; y < p.h; y++) {
    for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (c !== null && !palette.has(c)) n++;
    }
  }
  return n;
}

test('what a hero does when left standing: whole standing loops long, begun and ended as the figure stands', () => {
  for (const who of FIGURES) {
    const set = who.art.front;
    const name = `${who.name}, facing the camera`;
    const rest = set.idle[0];
    // the colours of the standing figure: anything else in a frame is something brought out (a squirrel, a book, an arrow)
    const standing = new Set<string>();
    for (const f of set.idle) colours(f, standing);
    const done: Sprite[][] = [];
    for (const k of ['idleA', 'idleB'] as const) {
      const c = clip(set, k);
      const n = c.frames.length;
      // The gesture is played in place of the standing loop, begun as the loop comes round to
      // its first frame, and the wind blows through it at the loop's own pace: so it must last a
      // whole number of loops, or the cloth would jump as the loop takes up again.
      const loops = seconds(c) / IDLE_SECONDS;
      assert.ok(loops > 0.99 && Math.abs(loops - Math.round(loops)) < 1e-9, `${name}: the ${CALLED[k]} lasts ${seconds(c).toFixed(2)} s, which is ${loops.toFixed(3)} standing loops`);
      const first = unlike(c.frames[0], rest);
      const last = unlike(c.frames[n - 1], rest);
      rule(`${name}: the ${CALLED[k]} begins as the figure stands`, first === 0, `${first} pixels differ`);
      rule(`${name}: the ${CALLED[k]} ends as the figure stands`, last === 0, `${last} pixels differ`);
      // it is something to see
      let most = 0;
      for (const f of c.frames) most = Math.max(most, unlike(f, rest));
      assert.ok(most > 100, `${name}: the ${CALLED[k]} is something to see (${most} pixels at the most)`);
      // What it brings into the picture it puts away again: nothing strange in its first frame or
      // its last, and over its last quarter of a second what is left of it only dwindles.
      const brought = c.frames.map((f) => strange(f, standing));
      const tail = brought.slice(-6);
      let dwindles = brought[0] === 0 && brought[n - 1] === 0;
      for (let i = 1; i < tail.length; i++) if (tail[i] > tail[i - 1]) dwindles = false;
      rule(`${name}: the ${CALLED[k]} puts away what it brought out, for good`, dwindles, `pixels of it in the first frame: ${brought[0]}; in the last six: ${tail.join(', ')}`);
      done.push(c.frames);
    }
    // two different things
    const [a, b] = done;
    let differ = a.length !== b.length;
    for (let i = 0; i < Math.min(a.length, b.length) && !differ; i++) differ = unlike(a[i], b[i]) > 0;
    assert.ok(differ, `${name}: the two are not the same thing twice`);
  }
});

// ---------------------------------------------------------------------------------------------
// Version 14.5: every hero is SEEN FROM A CORNER. The owner, 5 Oct 2026: "I'd like the character
// models to move and turn in those four cardinal directions as well." (And of the look as a whole:
// "any sprite or doodad or whatever should always be seen at an angle".) The pictures face
// screen-right (down-right for `front`, up-right for `back`); the game mirrors them for the other two.

/** Every pixel of some colours in a painting: [x, y] in picture pixels from the figure's feet. */
function where(s: Sprite, colours: ReadonlyArray<string>): [number, number][] {
  const p = paintingOf(s);
  const out: [number, number][] = [];
  for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) if (colours.includes(p.get(x, y) ?? '')) out.push([x - s.ax * 2, y - s.ay * 2]);
  return out;
}

/** How a set of pixels leans: rows down for each column across (the slope of the line through them). */
function leanOf(pts: [number, number][]): number {
  const n = pts.length;
  const mx = pts.reduce((a, q) => a + q[0], 0) / n;
  const my = pts.reduce((a, q) => a + q[1], 0) / n;
  let sxx = 0;
  let sxy = 0;
  for (const [x, y] of pts) {
    sxx += (x - mx) ** 2;
    sxy += (x - mx) * (y - my);
  }
  return sxy / (sxx || 1);
}

test('seen from a corner: the eyes are toward the side each hero faces, and nobody shows a face from behind', () => {
  // (the points of light in a helm's slot, under a mask, between a hat's brim and a scarf)
  const GLINT = '#7af8f0';
  for (const who of FIGURES) {
    for (const f of who.art.front.idle) {
      const eyes = where(f, [GLINT]).filter(([, y]) => y < -40);
      assert.equal(eyes.length, 2, `${who.name}: two eyes`);
      for (const [x] of eyes) assert.ok(x >= 0, `${who.name}: an eye at ${x} from the middle: both are on the side faced`);
      assert.ok(Math.max(...eyes.map((e) => e[0])) >= 3, `${who.name}: the further eye is near the edge of the face`);
    }
    for (const f of who.art.back.idle) assert.equal(where(f, [GLINT]).filter(([, y]) => y < -40).length, 0, `${who.name}, from behind: no eyes`);
  }
});

test('seen from a corner: the knight\'s shield is held out the way he faces and leans along the grid; his sword is in the hand nearer us', () => {
  const knight = FIGURES[0].art;
  // the painted field of the shield (three tones of indigo), and the chevron on its face (the scarf's dark red)
  const FIELD = ['#2a2466', '#4640a0', '#6e68cc'];
  const CHEVRON = ['#8e1428', '#c83040'];
  const BLADE = ['#8af6f0', '#ffffff'];
  for (const f of knight.front.idle) {
    const shield = where(f, FIELD).filter(([x]) => x > 2);
    assert.ok(shield.length > 60, `the shield's face is seen (${shield.length} pixels)`);
    const mx = shield.reduce((a, q) => a + q[0], 0) / shield.length;
    assert.ok(mx > 6, `it leads: on the side he faces (${mx.toFixed(1)} from his middle)`);
    assert.ok(where(f, CHEVRON).filter(([x, y]) => x > 6 && y > -42).length >= 6, 'with his chevron on it');
    // its top edge: the highest pixel of each column runs UP to the right, about a row for every two columns
    const tops = new Map<number, number>();
    for (const [x, y] of shield) tops.set(x, Math.min(tops.get(x) ?? 1e9, y));
    const edge = [...tops].filter(([x]) => Math.abs(x - mx) <= 3) as [number, number][];
    const lean = leanOf(edge);
    assert.ok(lean < -0.3 && lean > -0.8, `its top edge leans up to the right (${lean.toFixed(2)} rows a column)`);
    // the blade: in the hand nearer us, which facing down-right is on the left of the picture
    const blade = where(f, BLADE);
    assert.ok(blade.length > 20 && blade.every(([x]) => x < -4), 'the sword is on the nearer side');
  }
  for (const f of knight.back.idle) {
    // from behind the shield is beyond him: what shows is a strip of its inside past the further shoulder, on the left
    const inside = where(f, FIELD).filter(([x]) => x < -6);
    assert.ok(inside.length > 12, `a strip of the shield's inside shows (${inside.length} pixels)`);
    assert.equal(where(f, CHEVRON).filter(([x, y]) => x < -7 && y > -42).length, 0, 'and none of its face: no chevron');
    assert.equal(where(f, FIELD).filter(([x]) => x > 2).length, 0, 'nothing of it on the side he faces');
    const blade = where(f, BLADE);
    assert.ok(blade.length > 20 && blade.every(([x]) => x > 4), 'the sword is on the nearer side, which is now the right');
  }
});

test('seen from a corner: a hero steps along the grid, and the picture of a walk is not a mirror of itself', () => {
  for (const who of FIGURES) {
    for (const view of VIEWS) {
      const set = who.art[view];
      // the figure's feet are furthest apart ACROSS the screen at the two ends of a stride
      const reach = (f: Sprite): number => {
        const p = paintingOf(f);
        let lo = p.w;
        let hi = -1;
        for (let y = p.h - 6; y < p.h; y++) for (let x = 0; x < p.w; x++) if (p.has(x, y)) {
          lo = Math.min(lo, x);
          hi = Math.max(hi, x);
        }
        return hi - lo;
      };
      const widths = set.walk.map(reach);
      assert.ok(Math.max(...widths) - Math.min(...widths) >= 3, `${who.name}, ${view}: the feet part across the screen as they walk (${widths.join(' ')})`);
    }
  }
});

/** Where a frame ties each of its tails, in game pixels from the figure's feet. */
function knots(s: Sprite): Map<string, { x: number; y: number; over: boolean }> {
  const out = new Map<string, { x: number; y: number; over: boolean }>();
  for (const r of s.tails ?? []) out.set(r.id, { x: r.x - s.ax, y: r.y - s.ay, over: r.over });
  return out;
}

test('every frame says where the things that fly from the figure are tied', () => {
  let frames = 0;
  each((who, view, set, name) => {
    const want = [...who.tails].sort();
    const rest = knots(set.idle[0]);
    const lists: [string, Sprite[], boolean][] = [['standing', set.idle, true], ['walking', set.walk, true]];
    for (const [k, c] of clipsOf(set)) lists.push([k, c.frames, false]);
    for (const [k, list, loops] of lists) {
      list.forEach((f, i) => {
        frames++;
        const roots = f.tails ?? [];
        // the warrior's scarf has two ends, the ranger has the feather in the cap, the mage a feather and a scarf
        assert.deepEqual(roots.map((r) => r.id).sort(), want, `${name}, ${k} frame ${i}: it carries ${want.join(' and ')}`);
        const here = knots(f);
        for (const r of roots) {
          assert.ok(r.id in HERO_TAILS, `${name}, ${k} frame ${i}: ${r.id} is a tail the game knows how to move and draw`);
          // on the figure: inside the picture, and never far from where it is when the figure stands
          assert.ok(r.x >= 0 && r.y >= 0 && r.x <= f.w && r.y <= f.h, `${name}, ${k} frame ${i}: ${r.id} is tied inside the picture (${r.x}, ${r.y} of ${f.w} x ${f.h})`);
          const at = here.get(r.id);
          const home = rest.get(r.id);
          assert.ok(at && home);
          if (!at || !home) return;
          // (measured: 2.5 game pixels at the most, in the warrior's slam. A blow that LUNGES carries
          // all of him a pace along the grid and low, knot and all (Pose.step, from Version 15.1):
          // measured 8.9 at the most, in the Strike with sword and shield)
          const blow = k === 'attack' || k === 'heavy';
          assert.ok(Math.hypot(at.x - home.x, at.y - home.y) <= (blow ? 10 : 4), `${name}, ${k} frame ${i}: ${r.id} is tied near where it is at rest (${Math.hypot(at.x - home.x, at.y - home.y).toFixed(2)})`);
          // in front of the figure or behind it: the same all through one facing, or it would flick from one to the other
          assert.equal(at.over, home.over, `${name}, ${k} frame ${i}: ${r.id} stays on its side of the figure`);
          // and the knot does not jump from one frame to the next: a jump of the knot is a whip of the tail
          // (measured: 1.8 game pixels at the most; and in the one frame in which a lunge lands, where
          // the scarf is MEANT to whip, 4.95)
          const next = list[i + 1] ?? (loops ? list[0] : undefined);
          const then = next ? knots(next).get(r.id) : undefined;
          if (then) assert.ok(Math.hypot(then.x - at.x, then.y - at.y) <= (blow ? 5.5 : 3), `${name}, ${k} frames ${i} to ${i + 1}: ${r.id}'s knot moves ${Math.hypot(then.x - at.x, then.y - at.y).toFixed(2)} pixels`);
        }
      });
    }
    // the knight's scarf flies behind him when he faces us and over his back when he does not
    if (who.cls === 'warrior') for (const id of who.tails) assert.equal(rest.get(id)?.over, view === 'back', `${name}: ${id}`);
  });
  assert.ok(frames > 900, `every frame was looked at (${frames})`);
});

test('the tails themselves: every hero\'s own, each of a different name, each fit to be moved and drawn', () => {
  const all = [WARRIOR_TAILS, RANGER_TAILS, MAGE_TAILS];
  const names = all.flatMap((t) => Object.keys(t));
  assert.equal(new Set(names).size, names.length, 'no two heroes use one name (merged, one would take the other\'s place)');
  assert.deepEqual(Object.keys(HERO_TAILS).sort(), [...names].sort(), 'the game has all of them, and no others');
  for (const who of FIGURES) for (const id of who.tails) assert.ok(id in HERO_TAILS, `${who.name}: ${id}`);
  for (const [id, d] of Object.entries(HERO_TAILS)) {
    assert.ok(Number.isInteger(d.n) && d.n >= 3 && d.seg > 0 && d.w0 > 0 && d.w1 > 0, `${id}: a chain of points, a length, a width`);
    // (the tails' painter reads colours as six digits)
    for (const c of [d.dark, d.mid, d.light, d.tip, d.glow ? d.glow.color : undefined]) if (c !== undefined) assert.ok(/^#[0-9a-f]{6}$/.test(c), `${id}: ${c} is a colour of six digits`);
    assert.ok(new Set([d.dark, d.mid, d.light]).size === 3, `${id}: three tones`);
    assert.ok(d.gravity >= 0 && d.wind > 0 && d.flutter >= 0 && d.rate > 0 && d.drag > 0, `${id}: it hangs, blows and comes to rest`);
    // a quill has a shape it grew in (a step for each point); cloth has none
    if ((d.stiff ?? 0) > 0) assert.ok(d.rest && d.rest.length === d.n, `${id}: a quill, with a shape`);
    else assert.ok(d.rest === undefined, `${id}: cloth, which only hangs`);
    if (d.glow) assert.ok(d.glow.r > 0 && d.glow.a > 0 && d.glow.a <= 1 && (d.glow.at ?? 0.6) > 0 && (d.glow.at ?? 0.6) < 1, `${id}: its light is on it`);
  }
});

/** Every point of every tail, and how long each chain is against its proper length. */
function reach(t: Tails): { x0: number; x1: number; y0: number; y1: number; long: number } {
  const out = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, long: 0 };
  for (const s of t.shapes()) {
    const d: TailDef = HERO_TAILS[s.id];
    let sum = 0;
    for (let i = 0; i <= d.n; i++) {
      out.x0 = Math.min(out.x0, s.points[i * 2]);
      out.x1 = Math.max(out.x1, s.points[i * 2]);
      out.y0 = Math.min(out.y0, s.points[i * 2 + 1]);
      out.y1 = Math.max(out.y1, s.points[i * 2 + 1]);
      if (i > 0) sum += Math.hypot(s.points[i * 2] - s.points[i * 2 - 2], s.points[i * 2 + 1] - s.points[i * 2 - 1]);
    }
    out.long = Math.max(out.long, sum / (d.n * d.seg));
  }
  return out;
}

test('the scarves and feathers on the figures: they fly from the frames as shown, keep their length, and stay inside the patch they are painted on', () => {
  const dt = 1 / 60;
  // (the patch reaches 48 game pixels to each side of the feet, 56 above and 20 below)
  const side = TAIL_PATCH.hw / 2;
  const above = TAIL_PATCH.up / 2;
  const below = (TAIL_PATCH.h - TAIL_PATCH.up) / 2;
  each((who, view, set, name) => {
    const t = new Tails(HERO_TAILS);
    // a figure that faces screen-right: running toward the camera goes down the screen, away from it up
    const step: [number, number] = view === 'front' ? [16, 8] : [16, -8];
    let time = 0;
    let ox = 0;
    let oy = 0;
    const far = { x0: Infinity, x1: -Infinity, y0: Infinity, y1: -Infinity, long: 0 };
    const show = (s: Sprite): { long: number } => {
      t.step(dt, s.tails, s.ax, s.ay, 1, ox, oy);
      const r = reach(t);
      far.x0 = Math.min(far.x0, r.x0);
      far.x1 = Math.max(far.x1, r.x1);
      far.y0 = Math.min(far.y0, r.y0);
      far.y1 = Math.max(far.y1, r.y1);
      far.long = Math.max(far.long, r.long);
      return r;
    };
    // standing: the tails the frames name are there, and no longer than they are (3% at the most)
    let long = 0;
    for (let k = 0; k < 300; k++) {
      time += dt;
      long = Math.max(long, show(set.idle[Math.floor(time * IDLE_FPS) % IDLE_FRAMES]).long);
    }
    assert.deepEqual(t.shapes().map((s) => s.id).sort(), [...who.tails].sort(), `${name}: its tails fly`);
    assert.ok(long < 1.08, `${name}: standing, they keep their length (${long.toFixed(3)} of it)`);
    assert.equal(t.lights().length, who.cls === 'ranger' ? 1 : 0, `${name}: only the scout's feather glows`);
    for (const s of t.shapes()) {
      const d = HERO_TAILS[s.id];
      const tipX = s.points[d.n * 2] - s.points[0];
      // cloth hangs back from the knot (a figure facing right: to the left of it); a quill stands as it grew
      if (!d.rest) assert.ok(tipX < -0.5 * d.n * d.seg, `${name}: ${s.id} streams out behind (${tipX.toFixed(1)} px)`);
      assert.equal(s.over, set.idle[0].tails?.find((r) => r.id === s.id)?.over, `${name}: ${s.id} is drawn on the side of the figure the frame says`);
    }
    // a run at the hero's own speed, and a stop (7% at the most on the run)
    long = 0;
    for (let k = 0; k < 120; k++) {
      time += dt;
      ox += step[0] * 4.6 * dt;
      oy += step[1] * 4.6 * dt;
      long = Math.max(long, show(set.walk[Math.floor(time * WALK_FPS) % WALK_FRAMES]).long);
    }
    assert.ok(long < 1.15, `${name}: running, they are not pulled out long (${long.toFixed(3)})`);
    for (let k = 0; k < 90; k++) show(set.idle[0]);
    // both attacks, each frame shown for a thirtieth of a second
    long = 0;
    for (const k of ['attack', 'heavy'] as const) {
      for (const f of clip(set, k).frames) for (let j = 0; j < 2; j++) long = Math.max(long, show(f).long);
      for (let j = 0; j < 40; j++) show(set.idle[0]);
    }
    assert.ok(long < 1.15, `${name}: nor by an attack (${long.toFixed(3)})`);
    // the fast moves: a leap of six tiles with its arc (the warrior), and a roll of 3.4 tiles in a quarter of a second
    if (who.leaps) {
      const c = clip(set, 'leap');
      const [bx, by] = [ox, oy];
      for (let k = 1; k <= 26; k++) {
        const u = k / 26;
        ox = bx + step[0] * 6 * u;
        oy = by + step[1] * 6 * u - Math.sin(u * Math.PI) * 24;
        show(c.frames[Math.min(c.frames.length - 1, Math.floor(u * c.frames.length))]);
      }
      for (let j = 0; j < 60; j++) show(set.idle[0]);
    }
    const [bx, by] = [ox, oy];
    for (let k = 1; k <= 14; k++) {
      ox = bx + (step[0] * 3.4 * k) / 14;
      oy = by + (step[1] * 3.4 * k) / 14;
      show(set.walk[k % WALK_FRAMES]);
    }
    for (let j = 0; j < 60; j++) show(set.idle[0]);
    // Through all of it nothing flies off the patch (a figure facing left is this one in a mirror,
    // so the same room is needed on both sides). Measured: 21 pixels to the side at the most, 39
    // above the feet, never below them.
    assert.ok(Math.max(-far.x0, far.x1) < side - 8, `${name}: within ${side} pixels of the feet to either side (${far.x0.toFixed(1)} to ${far.x1.toFixed(1)})`);
    assert.ok(-far.y0 < above - 6 && far.y1 < below - 6, `${name}: within ${above} above the feet and ${below} below (${far.y0.toFixed(1)} to ${far.y1.toFixed(1)})`);
    // (A leap or a roll does pull the cloth out: by a third of its length at the worst, for a
    // moment. Reported to the author; here only that it does not come apart.)
    assert.ok(far.long < 1.6, `${name}: and even in a leap or a roll the cloth holds together (${far.long.toFixed(2)} of its length)`);
  });
});

test('the game\'s hero art: one figure for each class, another for a warrior with both hands on the sword, painted a frame at a time', () => {
  const art = makeHeroArt();
  for (const cls of CLASS_IDS) {
    const one = art.of(cls, PLAIN);
    assert.ok(one === art.of(cls, { twoHanded: false }), `${cls}: the same figure every time it is asked for`);
    const two = art.of(cls, { twoHanded: true });
    // only the warrior's figure changes with the weapon so far
    if (cls === 'warrior') assert.ok(two !== one && two === art.of(cls, { twoHanded: true }), 'the warrior with a great sword is another figure');
    else assert.ok(two === one, `${cls}: the same figure whatever is carried`);
    assert.ok(one.front.clips && one.back.clips && one.front.clips.idleA && !one.back.clips.idleA);
  }
  // Painting ahead of need: one frame for each call, standing and walking first (facing the
  // camera, then facing away), then the attacks; what a hero does when left standing is left to
  // be painted as it is shown.
  const fresh = makeHeroArt();
  const knight = fresh.of('warrior', PLAIN);
  const order: Sprite[][] = [knight.front.idle, knight.back.idle, knight.front.walk, knight.back.walk];
  for (const k of ['attack', 'heavy', 'leap'] as const) for (const view of VIEWS) order.push(clip(knight[view], k).frames);
  // (from Version 15.1: then what is shown while an attack is held and when it is let go, and a leap's landing, where the figure has them)
  for (const k of ['hold', 'release', 'whirl', 'whirlEnd', 'land', 'roll'] as const) for (const view of VIEWS) order.push(knight[view].clips?.[k]?.frames ?? []);
  const seen = new Set<Sprite>();
  for (const list of order) {
    for (let i = 0; i < list.length; i++) {
      fresh.warm('warrior', PLAIN);
      assert.ok(painted !== undefined && !seen.has(painted), 'each call paints a frame that was not painted before');
      if (painted) seen.add(painted);
      assert.ok(painted === list[i], 'in order: standing, walking, the quick attack, the slow one, the leap, and what follows them');
    }
  }
  const total = seen.size;
  const landed = (knight.front.clips?.land?.frames.length ?? 0) + (knight.back.clips?.land?.frames.length ?? 0);
  assert.ok(landed > 0, 'the knight has a landing, facing us and facing away');
  assert.equal(total, 2 * (IDLE_FRAMES + WALK_FRAMES) + 2 * (clip(knight.front, 'attack').frames.length + clip(knight.front, 'heavy').frames.length + 13) + landed);
  // and when all are done, asking for more does nothing
  const last = painted;
  for (let i = 0; i < 5; i++) fresh.warm('warrior', PLAIN);
  assert.ok(painted === last);
  for (const f of clip(knight.front, 'idleA').frames.slice(0, 3)) assert.ok(!seen.has(f), 'the gestures were not painted ahead');
});

test('(what is not yet as these tests would have it)', () => {
  // Not a check: a note of the entries of REPORTED that were let off above, printed so that they
  // are seen every time the tests run. (A name in REPORTED that matches no rule lets nothing off:
  // the rule it was meant for is then simply applied.)
  if (notYet.length) console.log(`${notYet.length} pictures are let off a rule for now (reported to the author, 4 Oct 2026):\n  ${notYet.join('\n  ')}`);
  if (nowHolds.length) console.log(`${nowHolds.length} entries of REPORTED are no longer needed:\n  ${nowHolds.join('\n  ')}`);
  const stale = Object.keys(REPORTED).filter((key) => !notYet.some((n) => n.startsWith(key)) && !nowHolds.some((n) => n.startsWith(key)));
  if (stale.length && notYet.length + nowHolds.length > 0) console.log(`entries of REPORTED that name no rule applied in this run:\n  ${stale.join('\n  ')}`);
});
