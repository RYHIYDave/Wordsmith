// FLOOR 18'S MIRROR ENEMIES, YOUR REFLECTIONS (src/art/reflections.ts, their frames; src/art/reflections_fx.ts, stepping out
// of a mirror and shattering). A MOCK-UP: NOT IN THE GAME, behind REFLECTIONS_ON, off. His pick, “Glassy copy of you
// (Recommended)”, with the brief as offered: your own hero turned to silvered glass, a sheen across it, fine cracks, the
// enemy's pink in the eyes and the pink rim; your class's own moves; it shatters into shards that fall and fade; never
// cyan, so you always know which one is you.
//   1. the switch is off, and nothing of the game imports them;
//   2. A REFLECTION HAS THE HERO'S PICTURES: every class, from in front and behind, every list of frames as long as the
//      hero's, every clip at the same pace, its blow and its loop at the same moments;
//   3. EVERY FRAME OF EVERY CLASS, BOTH WAYS ROUND (idle, run, every attack and ability, struck, and the rest): NO CYAN AT
//      ALL (no pixel, no light it gives off, no pool of light, at a hue from 160 to 205 and a saturation over 0.2), and no
//      crackle handed on;
//   4. ... THE PINK EDGE all round it, and nothing else that is not whole: every pixel whole or empty but the edge (crisp);
//   5. ... THE HERO'S SHAPE: its silhouette and its edge the hero's own, pixel for pixel, in the same place;
//   6. ... the Hush's dull pink in its eyes from in front (and the cracks and the sheen there: it is glass, not a hero
//      greyed);
//   7. what flies from it (its scarf's ends, a feather, a braid) is glass: nothing cyan;
//   8. IT SHATTERS: from its own picture; cracks first, then shards; never anything cyan, every pixel whole or empty; the
//      shards fly, fall, and fade; and when it is over NOTHING IS LEFT;
//   9. IT STEPS OUT OF A MIRROR: nothing cyan in any frame; it begins inside the glass and ends out of it, standing, its
//      edge pink; and the stand-in mirror is the floor's cold blue and silver, nothing cyan.
//   run: tsx --test tests/reflections.test.ts

// @ts-ignore
import nodeTest from 'node:test';
// @ts-ignore
import nodeAssert from 'node:assert/strict';
// @ts-ignore
import nodeFs from 'node:fs';
// @ts-ignore
import nodePath from 'node:path';

import type { Sprite } from '../src/engine/px';
import { rgba } from '../src/engine/px';
import type { ClassId } from '../src/game/types';
import type { AnimSet, Clip } from '../src/art/actor_types';
import { heroLists, makeHeroArt3 } from '../src/art/heroes3';
import { RIM_ALPHA } from '../src/art/kit';
import { ENEMY_RIM } from '../src/art/mkit';
import { EYE, GLASS_COLOURS, GLASS_TAILS, REFLECTIONS_ON, REFLECTION_POOL, hueOf, makeReflectionArt, reflectionLists } from '../src/art/reflections';
import { GALLERY_MIRROR, SHATTER, STEP_CANVAS, STEP_MIRROR, STEP_OUT, inGlass, mirrorPainted, ofMirror, reflectionEffects, shatterFrom, shatterPainted, stepOutPainted } from '../src/art/reflections_fx';
import { paintWithoutCanvas, paintingOf } from './helpers';

interface Assert {
  ok(value: unknown, message?: string): void;
  equal(actual: unknown, expected: unknown, message?: string): void;
}
const test: (name: string, fn: () => void) => void = nodeTest;
const assert: Assert = nodeAssert;
const fs = nodeFs as { readdirSync(p: string, o: { recursive: boolean }): string[]; readFileSync(p: string, e: string): string };
const path = nodePath as { join(...p: string[]): string };

paintWithoutCanvas();

const CLASSES: ClassId[] = ['warrior', 'ranger', 'mage'];
const VIEWS = ['front', 'back'] as const;

/** HIS RULE, AS THE BRIEF SAYS IT: cyan is a hue from 160 to 205 at a saturation over 0.2. */
const cyan = (r: number, g: number, b: number): boolean => {
  const { h, s } = hueOf(r, g, b);
  return s > 0.2 && h >= 160 && h <= 205;
};
const cyanColour = (c: string): boolean => {
  const [r, g, b] = rgba(c);
  return cyan(r, g, b);
};
const [PR, PG, PB] = rgba(ENEMY_RIM);
const [ER, EG, EB] = rgba(EYE);

const heroes = makeHeroArt3();
const reflections = makeReflectionArt(reflectionEffects);

/** Every list of frames of a side, named, and its clips: as the game holds a hero's (art/heroes3.ts heroLists), and what a hero does when left standing. */
function listsOf(set: AnimSet): { name: string; frames: Sprite[] }[] {
  const out = heroLists(set).map((frames, i) => ({ name: `list ${i}`, frames }));
  for (const k of ['idleA', 'idleB'] as const) {
    const c = set.clips?.[k];
    if (c) out.push({ name: k, frames: c.frames });
  }
  return out;
}
/** The clips of a side, by name (each list of a walking clip by its index). */
function clipsOf(set: AnimSet): Map<string, Clip> {
  const out = new Map<string, Clip>();
  for (const [k, v] of Object.entries(set.clips ?? {})) {
    if (!v) continue;
    if (Array.isArray(v)) v.forEach((c, i) => out.set(`${k}[${i}]`, c as Clip));
    else if (k === 'moves') for (const [m, c] of Object.entries(v as Record<string, Clip>)) out.set(`moves.${m}`, c);
    else out.set(k, v as Clip);
  }
  return out;
}

/** What is found looking over one frame of a reflection beside the hero's. */
interface Seen {
  cls: ClassId;
  view: string;
  list: string;
  i: number;
  cyan: boolean;
  rim: number;
  odd: number;
  notRim: number;
  shape: number;
  eyes: number;
  sheen: number;
}
const SEEN: Seen[] = [];
const BRIGHT = new Set(['#f5f7ff', '#f7f2ff'].map((c) => rgba(c).slice(0, 3).join(',')));
for (const cls of CLASSES) {
  const hero = heroes.of(cls, { twoHanded: true });
  const refl = reflections.of(cls);
  for (const view of VIEWS) {
    const hl = listsOf(hero[view]);
    const rl = listsOf(refl[view]);
    hl.forEach((h, li) => {
      const r = rl[li];
      for (let i = 0; i < r.frames.length; i++) {
        const rs = r.frames[i];
        const hs = h.frames[i];
        const rp = paintingOf(rs);
        const hp = paintingOf(hs);
        const d = rp.d;
        const seen: Seen = { cls, view, list: r.name, i, cyan: false, rim: 0, odd: 0, notRim: 0, shape: 0, eyes: 0, sheen: 0 };
        for (let k = 0; k < d.length; k += 4) {
          const a = d[k + 3];
          if (a === 0) continue;
          if (cyan(d[k], d[k + 1], d[k + 2])) seen.cyan = true;
          if (a !== 255 && a !== RIM_ALPHA) seen.odd++;
          if (a === RIM_ALPHA) {
            if (d[k] === PR && d[k + 1] === PG && d[k + 2] === PB) seen.rim++;
            else seen.notRim++;
          }
          if (a === 255 && d[k] === ER && d[k + 1] === EG && d[k + 2] === EB) seen.eyes++;
          if (a === 255 && BRIGHT.has(`${d[k]},${d[k + 1]},${d[k + 2]}`)) seen.sheen++;
        }
        for (const l of rs.lights ?? []) if (cyanColour(l.color)) seen.cyan = true;
        if (rs.aura && cyanColour(rs.aura.color)) seen.cyan = true;
        if (rs.charge) seen.cyan = true;
        // THE HERO'S SHAPE: the same box, the same anchor, and every pixel whole where his is, edge where his is
        if (rp.w !== hp.w || rp.h !== hp.h || rs.ax !== hs.ax || rs.ay !== hs.ay) seen.shape = -1;
        else for (let k = 3; k < d.length; k += 4) if ((d[k] === 255) !== (hp.d[k] === 255) || (d[k] > 0) !== (hp.d[k] > 0)) seen.shape++;
        SEEN.push(seen);
      }
    });
  }
}
const said = (s: Seen): string => `${s.cls} ${s.view} ${s.list} #${s.i}`;

test('1. the switch is off, and of the game only floor 18\'s own figure imports them', () => {
  assert.equal(REFLECTIONS_ON.on, false, 'REFLECTIONS_ON is off');
  const users: string[] = [];
  for (const f of fs.readdirSync('src', { recursive: true }).map((x) => x.replace(/\\/g, '/'))) {
    if (!f.endsWith('.ts') || f.startsWith('dev') || /^art\/reflections(_fx)?\.ts$/.test(f)) continue;
    const dir = f.split('/').slice(0, -1);
    for (const m of fs.readFileSync(path.join('src', f), 'utf8').matchAll(/from ['"](\.[^'"]*)['"]/g)) {
      const parts = [...dir];
      for (const q of m[1].split('/')) if (q === '..') parts.pop(); else if (q !== '.') parts.push(q);
      if (/^art\/reflections(_fx)?$/.test(parts.join('/'))) users.push(f);
    }
  }
  // (Brought into the game by the main chat, 30 Oct 2026, on floor 18 behind HIGH_CITY (off): the reflections' figure imports them,
  // and nothing else of the game)
  assert.equal([...new Set(users)].sort().join(' '), 'art/act1_figs/reflection.ts', 'game files that import them');
});

test("2. A REFLECTION HAS THE HERO'S PICTURES: every list as long, every clip at the same pace, its blow and its loop at the same moments", () => {
  for (const cls of CLASSES) {
    const hero = heroes.of(cls, { twoHanded: true });
    const refl = reflections.of(cls);
    for (const view of VIEWS) {
      // (a hero's fall, the side painter's since 28 Oct, is not a reflection's: it shatters instead, `clips.die`)
      const h = heroLists({ ...hero[view], clips: hero[view].clips ? { ...hero[view].clips, fall: undefined } : hero[view].clips });
      const r = reflectionLists(refl[view]);
      assert.equal(r.map((l) => l.length).join(','), h.map((l) => l.length).join(','), `${cls} ${view}: its lists`);
      const hc = clipsOf(hero[view]);
      const rc = clipsOf(refl[view]);
      for (const [k, c] of hc) {
        if (k === 'fall' || k === 'ready') continue;
        const o = rc.get(k);
        assert.ok(o, `${cls} ${view}: it has ${k}`);
        if (!o) continue;
        assert.equal(`${o.frames.length} ${o.fps} ${o.hit} ${o.loop} ${o.tail} ${o.poise} ${o.turns}`, `${c.frames.length} ${c.fps} ${c.hit} ${c.loop} ${c.tail} ${c.poise} ${c.turns}`, `${cls} ${view} ${k}`);
      }
      assert.equal(`${refl[view].idleFps} ${refl[view].walkFps} ${refl[view].walkStride} ${refl[view].startAt}`, `${hero[view].idleFps} ${hero[view].walkFps} ${hero[view].walkStride} ${hero[view].startAt}`, `${cls} ${view}: its pace`);
      // (and what only a reflection has: its shattering, and from in front its stepping out of a mirror)
      assert.ok(rc.has('die'), `${cls} ${view}: it shatters`);
      assert.equal(rc.has('moves.stepOut'), view === 'front', `${cls} ${view}: it steps out of a mirror from in front`);
      assert.ok(!rc.has('fall'), `${cls} ${view}: no hero's fall`);
    }
  }
  assert.ok(SEEN.length > 1500, `every frame looked at (${SEEN.length})`);
});

test('3. EVERY FRAME OF EVERY CLASS, BOTH WAYS ROUND: NO CYAN AT ALL (no pixel, no light, no pool of light, no crackle)', () => {
  const bad = SEEN.filter((s) => s.cyan);
  assert.equal(bad.length, 0, `frames with cyan: ${bad.slice(0, 8).map(said).join('; ')}`);
  assert.ok(!cyanColour(REFLECTION_POOL.color), 'its pool of light');
});

test('4. EVERY FRAME: THE PINK EDGE all round it, and every pixel whole or empty but the edge (crisp)', () => {
  const noRim = SEEN.filter((s) => s.rim < 40);
  assert.equal(noRim.length, 0, `frames without the pink edge: ${noRim.slice(0, 8).map(said).join('; ')}`);
  const odd = SEEN.filter((s) => s.odd > 0 || s.notRim > 0);
  assert.equal(odd.length, 0, `frames with pixels neither whole, empty nor the pink edge: ${odd.slice(0, 8).map(said).join('; ')}`);
});

test("5. EVERY FRAME: THE HERO'S SHAPE, pixel for pixel, in the same place", () => {
  const off = SEEN.filter((s) => s.shape !== 0);
  assert.equal(off.length, 0, `frames not the hero's shape: ${off.slice(0, 8).map((s) => `${said(s)} (${s.shape})`).join('; ')}`);
});

test("6. the Hush's dull pink in its eyes from in front; cracks and a sheen on it", () => {
  for (const cls of CLASSES) {
    const front = SEEN.filter((s) => s.cls === cls && s.view === 'front' && s.list === 'list 0');
    const withEyes = front.filter((s) => s.eyes >= 1).length;
    assert.ok(withEyes / front.length > 0.9, `${cls}: its standing frames from in front with pink eyes: ${withEyes} of ${front.length}`);
    const all = SEEN.filter((s) => s.cls === cls);
    const shining = all.filter((s) => s.sheen >= 3).length;
    assert.ok(shining / all.length > 0.6, `${cls}: frames with the glass's white (its cracks, its sheen): ${shining} of ${all.length}`);
    // (not from behind: no eyes in the back of its head)
    const back = SEEN.filter((s) => s.cls === cls && s.view === 'back' && s.list === 'list 0');
    assert.equal(back.filter((s) => s.eyes > 0 && cls !== 'warrior').length, 0, `${cls}: no eyes from behind`);
  }
  // its glass: only the floor's silver and violet
  for (const c of GLASS_COLOURS) assert.ok(!cyanColour(c), `its glass ${c}`);
});

test('7. what flies from it (a scarf, a feather, a braid) is glass: nothing cyan', () => {
  for (const [id, t] of Object.entries(GLASS_TAILS)) {
    for (const c of [t.dark, t.mid, t.light, t.tip, t.glow?.color]) if (c) assert.ok(!cyanColour(c), `${id}: ${c}`);
  }
  // (and every frame's tails are its own)
  for (const cls of CLASSES) {
    const refl = reflections.of(cls);
    for (const view of VIEWS) for (const s of refl[view].idle) for (const r of s.tails ?? []) assert.ok(r.id in GLASS_TAILS, `${cls} ${view}: tail ${r.id}`);
  }
});

test('8. IT SHATTERS: cracks, then shards that fly, fall and fade; nothing cyan; crisp; and NOTHING IS LEFT', () => {
  for (const cls of CLASSES) {
    for (const view of VIEWS) {
      const from = shatterFrom(cls, view);
      const n = Math.round(SHATTER.time * SHATTER.fps) + 1;
      const counts: number[] = [];
      for (let i = 0; i < n; i++) {
        const k = i / (n - 1);
        const p = shatterPainted(from, k);
        const d = p.px.d;
        let count = 0;
        for (let j = 0; j < d.length; j += 4) {
          if (d[j + 3] === 0) continue;
          count++;
          assert.ok(d[j + 3] === 255, `${cls} ${view} @${k.toFixed(2)}: a pixel neither whole nor empty`);
          assert.ok(!cyan(d[j], d[j + 1], d[j + 2]), `${cls} ${view} @${k.toFixed(2)}: cyan`);
        }
        for (const l of p.lights) assert.ok(!cyanColour(l.color), `${cls} ${view} @${k.toFixed(2)}: a cyan light`);
        counts.push(count);
      }
      assert.ok(counts[0] > 800, `${cls} ${view}: it is whole as it begins to break (${counts[0]})`);
      // (it is in pieces by a fifth of the way: the box round what is left is far wider than it was)
      const wide = (k: number): number => {
        const b = shatterPainted(from, k).px.bounds();
        return b ? b.w : 0;
      };
      assert.ok(wide(0.35) > wide(0) * 1.6, `${cls} ${view}: the shards fly out (${wide(0)} -> ${wide(0.35)})`);
      // (it fades: fewer and fewer pixels over the last half)
      for (let i = Math.ceil((n - 1) * 0.6); i < n; i++) assert.ok(counts[i] <= counts[i - 1] + 2, `${cls} ${view}: fading at frame ${i}`);
      assert.equal(counts[n - 1], 0, `${cls} ${view}: nothing left when it is over`);
      // (and as the game holds it: the last frame of its death is empty)
      const die = reflections.of(cls)[view].clips?.die;
      assert.ok(die, `${cls} ${view}: clips.die`);
      if (die) {
        const last = paintingOf(die.frames[die.frames.length - 1]);
        let left = 0;
        for (let j = 3; j < last.d.length; j += 4) if (last.d[j] > 0) left++;
        assert.equal(left, 0, `${cls} ${view}: the last frame of clips.die is empty`);
        assert.ok(!die.frames[die.frames.length - 1].aura, `${cls} ${view}: no pool of light left`);
      }
    }
  }
});

test('9. IT STEPS OUT OF A MIRROR: inside the glass, then out, standing, its edge pink; nothing cyan; the mirror cold blue and silver', () => {
  const [mx, my] = STEP_MIRROR;
  for (const cls of CLASSES) {
    const n = Math.round(STEP_OUT.time * STEP_OUT.fps) + 1;
    for (let i = 0; i < n; i++) {
      const t = i / STEP_OUT.fps;
      const p = stepOutPainted(cls, t);
      const d = p.px.d;
      let outside = 0;
      let rim = 0;
      for (let j = 0; j < d.length; j += 4) {
        if (d[j + 3] === 0) continue;
        assert.ok(!cyan(d[j], d[j + 1], d[j + 2]), `${cls} @${t.toFixed(2)}: cyan`);
        assert.ok(d[j + 3] === 255 || d[j + 3] === RIM_ALPHA, `${cls} @${t.toFixed(2)}: a pixel neither whole, empty nor the edge`);
        const x = (j / 4) % STEP_CANVAS.w;
        const y = Math.floor(j / 4 / STEP_CANVAS.w);
        const [u, v] = ofMirror(mx, my, x, y);
        if (!inGlass(GALLERY_MIRROR, u, v)) outside++;
        if (d[j + 3] === RIM_ALPHA && d[j] === PR && d[j + 1] === PG && d[j + 2] === PB) rim++;
      }
      for (const l of p.lights) assert.ok(!cyanColour(l.color), `${cls} @${t.toFixed(2)}: a cyan light`);
      // (before it is thrown out nothing of it is outside the glass, and it has no edge; once it is out, it has)
      if (t < STEP_OUT.from) assert.equal(outside, 0, `${cls} @${t.toFixed(2)}: all of it in the glass`);
      if (t >= STEP_OUT.until) assert.ok(rim > 40, `${cls} @${t.toFixed(2)}: out, its pink edge`);
      if (t < STEP_OUT.from) assert.equal(rim, 0, `${cls} @${t.toFixed(2)}: no edge in the glass`);
    }
    // (it ends standing where it ends: its feet at the step's anchor, most of it out of the glass)
    const last = stepOutPainted(cls, STEP_OUT.time);
    const b = last.px.bounds();
    assert.ok(b && b.y + b.h >= STEP_CANVAS.ay - 2, `${cls}: standing on the floor at the end`);
  }
  const m = mirrorPainted(STEP_CANVAS.w, STEP_CANVAS.h, mx, my);
  for (let j = 0; j < m.d.length; j += 4) if (m.d[j + 3]) assert.ok(!cyan(m.d[j], m.d[j + 1], m.d[j + 2]), 'the mirror: cyan');
});
