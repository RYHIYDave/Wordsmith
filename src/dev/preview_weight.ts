// Dev page: an attack of a hero as it was and as it is now, for looking at the WEIGHT of it (the
// owner, 6 Oct 2026: "I want things to have weight. That's very important").
//   hash = <hero>:<clip>:<what>[:<more>]
//     hero = warrior | warrior2 (the great sword) | ranger | mage
//     clip = attack | heavy
//     what = strip: every frame of the clip, in order, big.  more = front | back, then :was for the old one
//            node tools/preview.mjs src/dev/preview_weight.ts shots/strip.png 2200 900 "warrior:attack:strip:front"
//            film: frames of a moving picture, for tools/weight_gif.mjs. Four figures (before and
//            now, facing you and facing away), as it plays (top row) and four times slower (bottom).
//            more = the rules' wind-up and follow-through for it, in seconds: "0.12,0.3"
import type { ActorArt, Clip } from '../art/actor_types';
import { makeMageArt } from '../art/hero_mage';
import { makeRangerArt } from '../art/hero_ranger';
import { makeWarriorArt } from '../art/hero_warrior';
import { makeArcherArt, makeSkeletonArt } from '../art/monster_bones';
import { drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';
import { Figure } from '../render/figure';
import type { FigureState } from '../render/figure';

const [who = 'warrior', clipName = 'attack', what = 'strip', more = 'front', more2 = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
function artOf(name: string, was: boolean): ActorArt {
  if (name === 'warrior2') return makeWarriorArt({ twoHanded: true, was });
  if (name === 'ranger') return makeRangerArt(was);
  if (name === 'mage') return makeMageArt(was);
  // (a monster's walk can be shown the same way: hero = skeleton, clip = walk)
  if (name === 'skeleton') return makeSkeletonArt(true, was);
  if (name === 'archer') return makeArcherArt(was);
  return makeWarriorArt({ twoHanded: false, was });
}
// (hero = all, for a run: the three of them in one picture, as they play, each before and now)
// (hero = bones, for a walk: the skeleton and the bone archer in one picture, the same way)
const GROUPS: Record<string, { title: string; of: [string, string][] }> = {
  all: { title: 'HOW THE HEROES RUN: before and now', of: [['warrior2', 'Warrior'], ['ranger', 'Ranger'], ['mage', 'Mage']] },
  bones: { title: 'HOW THE DEAD WALK: before and now', of: [['skeleton', 'Skeleton'], ['archer', 'Bone archer']] },
};
const group = GROUPS[who] ?? null;
const everyone = group !== null;
const now = artOf(group ? group.of[0][0] : who, false);
const was = artOf(group ? group.of[0][0] : who, true);
const heavy = clipName === 'heavy';
const clipOf = (a: ActorArt, back: boolean): Clip => {
  const set = back ? a.back : a.front;
  // (the walk is a list of frames, not a clip: here it is shown as one)
  if (clipName === 'walk') return { frames: set.walk, fps: set.walkFps ?? 16 };
  const c = clipName === 'fall' ? set.clips?.fall : clipName === 'hold' ? set.clips?.hold : clipName === 'release' ? set.clips?.release : clipName === 'whirl' ? set.clips?.whirl : clipName === 'whirlEnd' ? set.clips?.whirlEnd : clipName === 'roll' ? set.clips?.roll : clipName === 'land' ? set.clips?.land : heavy ? set.clips?.heavy : set.clips?.attack;
  if (!c) throw new Error('no such clip');
  return c;
};

const cv = document.createElement('canvas');
cv.style.position = 'static';
cv.style.display = 'block';
document.body.style.margin = '0';
document.body.style.overflow = 'auto';
document.documentElement.style.overflow = 'auto';
document.body.style.background = '#16131c';
document.body.appendChild(cv);
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };

function floorOf(g: CanvasRenderingContext2D, x0: number, y0: number, w: number, h: number, fx: number, fy: number, S: number, ox = 0, oy = 0): void {
  // (the floor slides under a runner: its pattern comes round every 32 pixels across and 16 down)
  const mx = ((ox % 32) + 32) % 32;
  const my = ((oy % 16) + 16) % 16;
  g.fillStyle = '#0b0a1e';
  g.fillRect(x0, y0, w, h);
  g.save();
  g.beginPath();
  g.rect(x0, y0, w, h);
  g.clip();
  for (let k = -5; k <= 7; k++) {
    for (let j = -8; j <= 7; j++) {
      const cx = x0 + (fx + k * 32 + (j % 2 === 0 ? 0 : 16) - mx) * S;
      const cy = y0 + (fy + j * 8 - my) * S;
      g.fillStyle = (k + j) % 2 === 0 ? '#201e50' : '#1b1946';
      g.beginPath();
      g.moveTo(cx, cy - 8 * S);
      g.lineTo(cx + 15.4 * S, cy);
      g.lineTo(cx, cy + 8 * S);
      g.lineTo(cx - 15.4 * S, cy);
      g.closePath();
      g.fill();
    }
  }
  g.restore();
}

if (what === 'strip') {
  const back = more === 'back';
  const c = clipOf(more2 === 'was' ? was : now, back);
  const S = 5;
  const CW = 60;
  const CH = 56;
  const cols = Math.min(8, c.frames.length);
  const rows = Math.ceil(c.frames.length / cols);
  cv.width = cols * CW * S;
  cv.height = rows * CH * S;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  c.frames.forEach((sp: Sprite, i: number) => {
    const x0 = (i % cols) * CW * S;
    const y0 = Math.floor(i / cols) * CH * S;
    floorOf(g, x0, y0, CW * S, CH * S, 22, 44, S);
    g.save();
    g.translate(x0 + 22 * S, y0 + 44 * S);
    g.scale(S, S);
    g.drawImage(sp.img, -sp.ax, -sp.ay, sp.w, sp.h);
    if (sp.lights) drawLights(g, sp, 0, 0);
    g.restore();
    g.fillStyle = c.hit !== undefined && Math.abs(i / c.fps - c.hit) < 0.5 / c.fps ? '#ffd866' : '#a8a2b8';
    g.font = 'bold 16px sans-serif';
    g.fillText(`${i}  ${(i / c.fps).toFixed(3)}s`, x0 + 8, y0 + 20);
    g.strokeStyle = '#000';
    g.strokeRect(x0 + 0.5, y0 + 0.5, CW * S, CH * S);
  });
  win.__ready = true;
} else {
  const [wind, follow] = (more || '0.12,0.3').split(',').map(Number);
  const walkMode = clipName === 'walk';
  /** How fast each covers ground, in tiles a second (game/defs.ts): the floor is slid under them by it. */
  const PACE: Record<string, number> = { skeleton: 3.0, archer: 2.8 };
  const NAMES: Record<string, string> = { 'skeleton:walk': 'HOW A SKELETON WALKS', 'archer:walk': 'HOW A BONE ARCHER WALKS', 'warrior:walk': 'THE WARRIOR RUNNING', 'warrior2:walk': 'THE WARRIOR RUNNING, GREAT SWORD', 'ranger:walk': 'THE RANGER RUNNING', 'mage:walk': 'THE MAGE RUNNING', 'warrior:attack': 'STRIKE', 'warrior:heavy': 'SLAM', 'warrior2:attack': 'STRIKE, GREAT SWORD', 'ranger:attack': 'SHOT', 'ranger:heavy': 'VOLLEY', 'mage:attack': 'WAVE', 'mage:heavy': 'ORB' };
  /** A GIF counts in hundredths of a second: three to a frame is as near thirty a second as it gets. */
  // (a run: thirty-two ticks a second, so that the picture comes round exactly when the run does)
  const TICK = clipName === 'walk' ? 1 / 32 : 0.03;
  // (three figures to a picture are drawn a size smaller, to keep the picture a size a phone will load)
  const S = group && group.of.length > 2 ? 3 : 4;
  const CW = 64;
  const CH = 58;
  const FX = 24;
  const FY = 46;
  const PAD = 8;
  const HEAD = 40;
  const LABEL = 24;
  const SLOW = 0.25;
  /** One attack every so often; the slow row takes four times as long, and the picture loops when it has done one. */
  const EVERY = 1.26;
  const TICKS = clipName === 'walk' ? 128 : Math.round(EVERY / SLOW / TICK);
  const cells: { fig: Figure; art: ActorArt; back: boolean; rate: number; pace: number; label: string }[] = [];
  if (group) {
    for (const [name, called] of group.of) {
      for (const back of [false, true]) {
        for (const old of [true, false]) cells.push({ fig: new Figure(), art: artOf(name, old), back, rate: 1, pace: PACE[name] ?? 4.2, label: `${called}, ${old ? 'BEFORE' : 'NOW'}${back ? ', facing away' : ''}` });
      }
    }
  } else {
    for (const rate of [1, SLOW]) {
      for (const back of [false, true]) {
        for (const old of [true, false]) cells.push({ fig: new Figure(), art: old ? was : now, back, rate, pace: PACE[who] ?? 4.2, label: `${old ? 'BEFORE' : 'NOW'}, ${back ? 'facing away' : 'facing you'}${rate === 1 ? '' : ' (slow)'}` });
      }
    }
  }
  const COLS = 4;
  const ROWS = Math.ceil(cells.length / COLS);
  cv.width = COLS * CW * S + (COLS + 1) * PAD;
  cv.height = HEAD + ROWS * (CH * S + LABEL + PAD) + PAD;
  const g = cv.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  const FACE: [number, number][] = [[1, 0], [0, -1]];
  const state = (t: number, back: boolean): FigureState => {
    const [fx, fy] = FACE[back ? 1 : 0];
    if (walkMode) return { anim: 'walk', animT: t, fx, fy, attackSkill: 0, attackAge: 0, attackWind: 0, leapK: -1 };
    const from = 0.3;
    const age = (((t - from) % EVERY) + EVERY) % EVERY;
    const busy = t >= from && age < wind + follow;
    return { anim: busy ? 'attack' : 'idle', animT: busy ? age : t, fx, fy, attackSkill: heavy ? 1 : 0, attackAge: age, attackWind: wind, leapK: -1 };
  };
  let drawn = -1;
  const draw = (tick: number): void => {
    if (tick <= drawn) {
      for (const c of cells) c.fig.reset();
      drawn = -1;
    }
    const lead = drawn < 0 ? Math.round(2.4 / TICK) : 0;
    const first = drawn + 1 - lead;
    for (let k = first; k <= tick; k++) {
      cells.forEach((c, n) => {
        const t = Math.max(0, k) * TICK * c.rate;
        // (a runner covers ground: what flies from them streams back as it does in the game)
        const [wfx, wfy] = FACE[c.back ? 1 : 0];
        const gone = walkMode ? t * c.pace : 0;
        const sp = c.fig.frame(c.art, state(t, c.back), lead > 0 && k === first ? 0 : TICK * c.rate, (wfx - wfy) * 16 * gone, (wfx + wfy) * 8 * gone, false);
        if (k !== tick) return;
        const x0 = PAD + (n % COLS) * (CW * S + PAD);
        const y0 = HEAD + Math.floor(n / COLS) * (CH * S + LABEL + PAD);
        floorOf(g, x0, y0, CW * S, CH * S, FX, FY, S, (wfx - wfy) * 16 * gone, (wfx + wfy) * 8 * gone);
        g.save();
        g.beginPath();
        g.rect(x0, y0, CW * S, CH * S);
        g.clip();
        g.fillStyle = 'rgba(0,0,0,0.4)';
        g.beginPath();
        g.ellipse(x0 + FX * S, y0 + FY * S, 7 * S, 2.8 * S, 0, 0, Math.PI * 2);
        g.fill();
        c.fig.draw(g, sp, x0 + FX * S, y0 + FY * S, S);
        c.fig.lights(g, x0 + FX * S, y0 + FY * S, S);
        g.restore();
        g.fillStyle = '#16131c';
        g.fillRect(x0, y0 + CH * S, CW * S, LABEL);
        g.fillStyle = c.label.includes('NOW') ? '#ffd866' : '#a8a2b8';
        g.font = '14px system-ui, -apple-system, Segoe UI, sans-serif';
        g.textBaseline = 'top';
        g.textAlign = 'center';
        g.fillText(c.label, x0 + (CW * S) / 2, y0 + CH * S + 5);
        g.textAlign = 'left';
      });
    }
    drawn = tick;
  };
  g.fillStyle = '#16131c';
  g.fillRect(0, 0, cv.width, cv.height);
  g.fillStyle = '#ffd866';
  g.font = 'bold 20px system-ui, -apple-system, Segoe UI, sans-serif';
  g.textBaseline = 'top';
  g.fillText(group ? group.title : `${NAMES[`${who}:${clipName}`] ?? who}: before and now (bottom row: four times slower)`, PAD, 10);
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 30;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}
