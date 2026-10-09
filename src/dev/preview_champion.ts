// Dev page: THE SKELETON CHAMPION, a yellow pack's leader (art/new_mobs3.ts CHAMPION, a mock-up: NOT
// IN THE GAME), and how a blue pack and a yellow pack are told apart (to come), on a piece of the
// dungeon's own floor with the dark of a dungeon over it, as preview_new_mobs.ts shows the new monsters.
//   node tools/preview.mjs src/dev/preview_champion.ts previews/packs/champion_sheet.png 1400 1000 "sheet"
//   hash = sheet[:<scale>]: the champion standing, facing you and away, beside the new skeleton (his
//            pack) and the knight for size; under them his cleave held and landing, his cry, and him
//            on his knees and fallen
//          film[:<scale>]: frames of a moving picture (tools/page_gif.mjs): facing you and away, he
//            stands, cleaves, stands, cries out to his pack
//          march[:<scale>]: frames of a moving picture: marching toward you and then away, dragging
//            his sword, the floor going by under him at his pace
//          death[:<scale>]: frames of a moving picture: struck, then struck down: to his knees on his
//            sword, then crumbling, his helm rolling away
//          strip:<stand | walk | attack | rally | reel | die>:<front | back>[:<scale>]: every frame of one move in a row
//          THE PACKS' MARKERS (render/pack_marks.ts):
//          packs[:<scale>]: a blue pack and a yellow pack (the champion leading), as Version 19.7 shows
//            them today, and with the new markers
//          cry[:<scale>]: frames of a moving picture: the yellow pack, the champion crying out to his
//            minions, their broken rings filling with his word
import { makeGroundArt } from '../art/ground';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { makeSkeletonArt3 } from '../art/monster_bones3';
import { MOVES3 } from '../art/moves3';
import { CHAMPION, CHAMPION_HIT, RALLY_CRY, deathOfMob, makeChampionArt3, paintMob } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import type { AnimSet, Clip } from '../art/actor_types';
import { CANVAS3 } from '../art/skin';
import { WORD_COLOR, makeIconArt } from '../art/icons';
import { P, RARITY_COLOR } from '../art/palette';
import { drawText } from '../engine/font';
import { drawPackMark } from '../render/pack_marks';
import type { PackMark } from '../render/pack_marks';
import type { GameView } from '../art/skin';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'sheet';

const cv = document.createElement('canvas');
cv.style.position = 'static';
cv.style.display = 'block';
for (const el of [document.documentElement, document.body]) {
  el.style.height = 'auto';
  el.style.overflow = 'visible';
}
const BG = '#17142e';
document.body.style.margin = '0';
document.body.style.background = BG;
document.body.appendChild(cv);
const g = cv.getContext('2d') as CanvasRenderingContext2D;
const win = window as unknown as { __ready: boolean; __frames: number; __tickMs: number; __frame: (i: number) => string };
const ground = makeGroundArt();

function text(s: string, x: number, y: number, size: number, color: string, weight = 400, align: CanvasTextAlign = 'left'): void {
  g.fillStyle = color;
  g.font = `${weight} ${size}px system-ui, -apple-system, Segoe UI, sans-serif`;
  g.textBaseline = 'top';
  g.textAlign = align;
  g.fillText(s, x, y);
  g.textAlign = 'left';
}

/** A sprite's reach from its floor point, in picture pixels: left, right, up, down. */
function reachOf(sp: Sprite): [number, number, number, number] {
  return [sp.ax * 2, (sp.w - sp.ax) * 2, sp.ay * 2, (sp.h - sp.ay) * 2];
}

/**
 * A pane of the dungeon's floor (the game's own tiles), the dark of a dungeon over it (thinner
 * about the figures), and on it figures at their floor points: each with its soft shadow, its pool
 * of light, itself and its lights. `S`: screen pixels to a picture pixel.
 */
function pane(x: number, y: number, w: number, h: number, S: number, who: ReadonlyArray<{ sp: Sprite; fx: number; fy: number; shadow: number }>, by = 0, away = false, flat = false, marks?: () => void): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.fillStyle = '#07061a';
  g.fillRect(x, y, w, h);
  g.imageSmoothingEnabled = false;
  const fx0 = who.length ? who[0].fx : x + w / 2;
  const fy0 = who.length ? who[0].fy : y + h / 2;
  // (a tile is a diamond 64 picture pixels across and 32 down; its picture is anchored at its top corner)
  const span = Math.ceil(w / (32 * S)) + 4;
  // (walking toward you is down the screen and to the right, along the grid's x; away is up and to the right, along -y)
  const mx = away ? 0 : by;
  const my = away ? -by : 0;
  for (let ty = Math.floor(my) - span; ty <= Math.floor(my) + span; ty++) {
    for (let tx = Math.floor(mx) - span; tx <= Math.floor(mx) + span; tx++) {
      const px = fx0 + (tx - mx - (ty - my)) * 32 * S;
      const py = fy0 + (tx - mx + (ty - my)) * 16 * S - 16 * S;
      if (px < x - 70 * S || px > x + w + 70 * S || py < y - 40 * S || py > y + h + 40 * S) continue;
      if (flat) {
        // (the flagstones in the dungeon's two shades, flat, as the skeleton's film has them: a moving
        // picture of the game's own textured floor going by is too big to send)
        g.fillStyle = ((tx + ty) % 2 + 2) % 2 === 0 ? '#201e50' : '#1b1946';
        g.beginPath();
        g.moveTo(px, py + 1 * S);
        g.lineTo(px + 31 * S, py + 16 * S);
        g.lineTo(px, py + 31 * S);
        g.lineTo(px - 31 * S, py + 16 * S);
        g.closePath();
        g.fill();
        continue;
      }
      const sp = ground.floor(tx + 20, ty + 20);
      g.drawImage(sp.img, px - sp.ax * 2 * S, py - sp.ay * 2 * S, sp.img.width * S, sp.img.height * S);
    }
  }
  // the dark of a dungeon, thinner where each figure stands
  g.fillStyle = 'rgba(6,4,14,0.55)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  for (const f of who) {
    const r = Math.max(60, (f.shadow + 40) * S);
    const lit = g.createRadialGradient(f.fx, f.fy - 18 * S, 0, f.fx, f.fy - 18 * S, r);
    lit.addColorStop(0, 'rgba(0,0,0,0.6)');
    lit.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lit;
    g.fillRect(x, y, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  // what is drawn on the floor itself (a warning), under the figures and their shadows
  marks?.();
  for (const f of who) {
    // the soft shadow under it (the game's: a dark oval, soft at its edge)
    const sh = g.createRadialGradient(f.fx, f.fy, 0, f.fx, f.fy, f.shadow * S);
    sh.addColorStop(0, 'rgba(0,0,0,0.62)');
    sh.addColorStop(0.65, 'rgba(0,0,0,0.42)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.save();
    g.translate(f.fx, f.fy);
    g.scale(1, 0.5);
    g.translate(-f.fx, -f.fy);
    g.fillStyle = sh;
    g.beginPath();
    g.arc(f.fx, f.fy, f.shadow * S, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  for (const f of who) {
    drawAura(g, f.sp, f.fx, f.fy, 2 * S);
    g.imageSmoothingEnabled = false;
    g.drawImage(f.sp.img, Math.round(f.fx - f.sp.ax * 2 * S), Math.round(f.fy - f.sp.ay * 2 * S), f.sp.img.width * S, f.sp.img.height * S);
    drawLights(g, f.sp, f.fx, f.fy, 2 * S);
  }
  g.restore();
}


const sp3 = (mob: Mob, which: string, t: number, view: GameView): Sprite => toSprite(paintMob(mob, which, t, view), mob.aura, CANVAS3.ax, CANVAS3.ay);
const dead3 = (mob: Mob, k: number, view: GameView): Sprite => toSprite(deathOfMob(mob, k, view), null, CANVAS3.ax, CANVAS3.ay);
const KNIGHT = (): Sprite => spriteOf3(MOVES3.rear, 0, 'front');
const SKELETON = (): Sprite => makeSkeletonArt3().front.idle[0];
const C = CHAMPION;

/** A frame of a clip `t` seconds in (one that goes round, round from its loop). */
function frameAt(c: Clip, t: number): Sprite {
  const n = c.frames.length;
  let i = Math.floor(t * c.fps + 1e-6);
  if (c.loop !== undefined && i >= n) {
    const from = Math.round(c.loop * c.fps);
    i = from + ((i - from) % Math.max(1, n - from));
  }
  return c.frames[Math.max(0, Math.min(n - 1, i))];
}
const standingAt = (s: AnimSet, t: number): Sprite => s.idle[Math.floor(t * (s.idleFps ?? 10) + 1e-6) % s.idle.length];
const longOf = (c: Clip): number => c.frames.length / c.fps;

function filmPage(ticks: number, fps: number, draw: (tick: number) => void): void {
  draw(0);
  win.__frames = ticks;
  win.__tickMs = 1000 / fps;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}
/** The reach of a list of sprites together: left, right, up, down (picture pixels). */
function reachAll(sps: ReadonlyArray<Sprite>): [number, number, number, number] {
  let [l, r, u, d] = [0, 0, 0, 0];
  for (const sp of sps) {
    const [a, b, e, f] = reachOf(sp);
    l = Math.max(l, a);
    r = Math.max(r, b);
    u = Math.max(u, e);
    d = Math.max(d, f);
  }
  return [l, r, u, Math.max(d, 10)];
}

// =============================================================================================
// sheet: standing, beside his pack and a hero; under that, his moves and his death

if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  const PAD = 14;
  const row1: { sp: Sprite; name: string; line: string; shadow: number; them: boolean }[] = [
    { sp: KNIGHT(), name: 'The knight', line: 'a hero, for size', shadow: 12, them: false },
    { sp: SKELETON(), name: 'A skeleton', line: 'his pack', shadow: 10, them: false },
    { sp: sp3(C, 'stand', 0, 'front'), name: 'The champion', line: 'facing you', shadow: C.shadow, them: true },
    { sp: sp3(C, 'stand', 0, 'back'), name: 'The champion', line: 'facing away', shadow: C.shadow, them: true },
  ];
  const row2: { sp: Sprite; name: string; line: string; shadow: number }[] = [
    { sp: sp3(C, 'attack', C.warn, 'front'), name: 'His cleave', line: 'held: his eyes flare', shadow: C.shadow },
    { sp: sp3(C, 'attack', CHAMPION_HIT, 'front'), name: 'His cleave', line: 'the blow', shadow: C.shadow },
    { sp: sp3(C, 'rally', RALLY_CRY + 0.1, 'front'), name: 'His rallying cry', line: 'his pack’s words flare', shadow: C.shadow },
    { sp: dead3(C, 0.42, 'front'), name: 'Struck down', line: 'to his knees on his sword', shadow: C.shadow * 0.9 },
    { sp: dead3(C, 1, 'front'), name: 'Fallen', line: 'his sword left standing', shadow: C.shadow * 0.8 },
  ];
  const GAP = 14;
  const cellOf = (sp: Sprite): [number, number] => {
    const [l, r] = reachOf(sp);
    return [Math.max(l + r, 44), l];
  };
  const [, , up1, down1] = reachAll(row1.map((f) => f.sp));
  const [, , up2, down2] = reachAll(row2.map((f) => f.sp));
  const w1 = row1.reduce((a, f) => a + cellOf(f.sp)[0] + GAP, GAP);
  const w2 = row2.reduce((a, f) => a + cellOf(f.sp)[0] + GAP, GAP);
  const W = Math.max(w1, w2) * S + PAD * 2;
  const HEAD = 78;
  const h1 = (up1 + down1 + 14) * S;
  const h2 = (up2 + down2 + 14) * S;
  const LAB = 50;
  cv.width = W;
  cv.height = HEAD + h1 + LAB + 20 + h2 + LAB + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('The skeleton champion', PAD, 12, 28, '#ffd866', 700);
  text('a yellow pack’s leader. A mock-up: not in the game', PAD, 46, 17, '#cfc8ff', 600);
  const rowOf = (list: { sp: Sprite; name: string; line: string; shadow: number }[], y: number, h: number, up: number, wide: number, gold: (i: number) => boolean): void => {
    let x = PAD + (W - PAD * 2 - wide * S) / 2 + GAP * S;
    const who = list.map((f) => {
      const [cw, l] = cellOf(f.sp);
      const fx = x + Math.max(l, cw / 2) * S;
      x += (cw + GAP) * S;
      return { sp: f.sp, fx, fy: y + (up + 7) * S, shadow: f.shadow };
    });
    pane(PAD, y, W - PAD * 2, h, S, who);
    who.forEach((w, i) => {
      text(list[i].name, w.fx, y + h + 6, 17, gold(i) ? '#ffd866' : '#cfc8ff', 700, 'center');
      text(list[i].line, w.fx, y + h + 27, 14, '#a8a2b8', 500, 'center');
    });
  };
  rowOf(row1, HEAD, h1, up1, w1, (i) => row1[i].them);
  rowOf(row2, HEAD + h1 + LAB + 20, h2, up2, w2, () => true);
  win.__ready = true;
}

// =============================================================================================
// film: facing you and away, he stands, cleaves, stands, cries out to his pack

if (mode === 'film') {
  const S = Number(parts[1]) || 3;
  const FPS = 30;
  const art = makeChampionArt3();
  const sets = [art.front, art.back];
  const cleaves = sets.map((s) => s.clips?.attack as Clip);
  const cries = sets.map((s) => s.clips?.moves?.rally as Clip);
  const T1 = 0.6;
  const T2 = T1 + longOf(cleaves[0]) + 0.6;
  const ROUND = T2 + longOf(cries[0]) + 0.6;
  const TICKS = Math.round(ROUND * FPS);
  const frameOf = (j: number, t: number): Sprite => (t >= T1 && t < T1 + longOf(cleaves[j]) ? frameAt(cleaves[j], t - T1) : t >= T2 && t < T2 + longOf(cries[j]) ? frameAt(cries[j], t - T2) : standingAt(sets[j], t));
  const all: Sprite[] = [];
  for (let i = 0; i < TICKS; i++) for (let j = 0; j < 2; j++) all.push(frameOf(j, i / FPS));
  const [l, r, u, d] = reachAll(all);
  const PAD = 10;
  const M = 8;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = Math.max(PAD + 2 * (cw + PAD), 640);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    const said = t >= T1 && t < T1 + CHAMPION_HIT ? 'His cleave: the sword swung up over his shoulder, his eyes flaring' : t >= T1 && t < T2 ? 'His cleave: a step, and his whole weight behind the blade' : t >= T2 && t < T2 + longOf(cries[0]) ? 'His rallying cry: his sword raised high, he roars to his pack' : 'The skeleton champion';
    text(said, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. A yellow pack’s leader', PAD, 32, 14, '#cfc8ff', 600);
    const x0 = (cv.width - 2 * cw - PAD) / 2;
    for (let j = 0; j < 2; j++) {
      const x = x0 + j * (cw + PAD);
      pane(x, HEAD, cw, ch, S, [{ sp: frameOf(j, t), fx: x + (M + l) * S, fy: HEAD + (M + u) * S, shadow: C.shadow }]);
      text(j === 0 ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}

// =============================================================================================
// march: toward you, then away, the floor going by under him at his pace

if (mode === 'march') {
  const S = Number(parts[1]) || 3;
  const FPS = 30;
  const LEG = 2.4;
  const TICKS = Math.round(2 * LEG * FPS);
  const art = makeChampionArt3();
  const [l, r, u, d] = reachAll([...art.front.walk, ...art.back.walk]);
  const PAD = 10;
  const M = 10;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = Math.max(cw + 2 * PAD, 560);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    const away = t >= LEG;
    const tt = away ? t - LEG : t;
    const set = away ? art.back : art.front;
    const sp = set.walk[Math.floor(tt * (set.walkFps ?? 10) + 1e-6) % set.walk.length];
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(`His march, ${away ? 'going away from you' : 'coming toward you'}: his sword dragged behind him`, PAD, 8, 17, '#ffd866', 700);
    text(`a mock-up: not in the game. ${C.pace} tiles a second; the floor goes by under him`, PAD, 32, 14, '#cfc8ff', 600);
    const x = (cv.width - cw) / 2;
    pane(x, HEAD, cw, ch, S, [{ sp, fx: x + (M + l) * S, fy: HEAD + (M + u) * S, shadow: C.shadow }], tt * C.pace, away, true);
  });
}

// =============================================================================================
// death: struck, then struck down

if (mode === 'death') {
  const S = Number(parts[1]) || 3;
  const FPS = 30;
  const art = makeChampionArt3();
  const sets = [art.front, art.back];
  const reel = sets.map((s) => s.clips?.reel as Clip);
  const die = sets.map((s) => s.clips?.die as Clip);
  const T1 = 0.5;
  const T2 = T1 + longOf(reel[0]) + 0.4;
  const ROUND = T2 + longOf(die[0]) + 1.0;
  const TICKS = Math.round(ROUND * FPS);
  const frameOf = (j: number, t: number): Sprite => (t >= T2 ? frameAt(die[j], t - T2) : t >= T1 && t < T1 + longOf(reel[j]) ? frameAt(reel[j], t - T1) : standingAt(sets[j], t));
  const all: Sprite[] = [];
  for (let i = 0; i < TICKS; i++) for (let j = 0; j < 2; j++) all.push(frameOf(j, i / FPS));
  const [l, r, u, d] = reachAll(all);
  const PAD = 10;
  const M = 8;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = Math.max(PAD + 2 * (cw + PAD), 640);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(t < T2 ? 'Struck: rocked back, his hands keeping hold of his sword' : 'Struck down: to his knees on his sword; then he crumbles', PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. His sword is left standing in the floor', PAD, 32, 14, '#cfc8ff', 600);
    const x0 = (cv.width - 2 * cw - PAD) / 2;
    for (let j = 0; j < 2; j++) {
      const x = x0 + j * (cw + PAD);
      pane(x, HEAD, cw, ch, S, [{ sp: frameOf(j, t), fx: x + (M + l) * S, fy: HEAD + (M + u) * S, shadow: C.shadow }]);
      text(j === 0 ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}

// =============================================================================================
// strip: every frame of one move in a row

if (mode === 'strip') {
  const which = parts[1] || 'stand';
  const view: GameView = parts[2] === 'back' ? 'back' : 'front';
  const S = Number(parts[3]) || 3;
  const art = makeChampionArt3();
  const set = view === 'back' ? art.back : art.front;
  const sps: Sprite[] = which === 'stand' ? set.idle : which === 'walk' ? set.walk : which === 'attack' ? (set.clips?.attack as Clip).frames : which === 'reel' ? (set.clips?.reel as Clip).frames : which === 'die' ? (set.clips?.die as Clip).frames : (set.clips?.moves?.[which] as Clip).frames;
  const [l, r, u, d] = reachAll(sps);
  const M = 6;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const per = Math.max(1, Math.min(sps.length, Math.floor(2400 / (cw + 6))));
  cv.width = per * (cw + 6) + 6;
  cv.height = 30 + Math.ceil(sps.length / per) * (ch + 22);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`The champion: ${which}, ${view === 'front' ? 'facing you' : 'facing away'}, ${sps.length} frames`, 6, 6, 16, '#ffd866', 700);
  sps.forEach((sp, i) => {
    const x = 6 + (i % per) * (cw + 6);
    const y = 30 + Math.floor(i / per) * (ch + 22);
    pane(x, y, cw, ch, S, [{ sp, fx: x + (M + l) * S, fy: y + (M + u) * S, shadow: C.shadow }]);
    text(`${i}`, x + 3, y + ch + 3, 12, '#a8a2b8');
  });
  win.__ready = true;
}

// =============================================================================================
// pose:<stand | walk | attack | rally | reel | die>:<seconds>:<front | back>[:<scale>]: one frame, big (for looking closely)

if (mode === 'pose') {
  const which = parts[1] || 'stand';
  const t = Number(parts[2]) || 0;
  const view: GameView = parts[3] === 'back' ? 'back' : 'front';
  const S = Number(parts[4]) || 6;
  const sp = which === 'die' ? dead3(C, t / C.dieTime, view) : sp3(C, which, t, view);
  const [l, r, u, d] = reachAll([sp]);
  const M = 8;
  cv.width = (l + r + 2 * M) * S;
  cv.height = (u + d + 2 * M) * S + 30;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`${which} at ${t} s, ${view}`, 6, 6, 16, '#ffd866', 700);
  pane(0, 30, cv.width, cv.height - 30, S, [{ sp, fx: (M + l) * S, fy: 30 + (M + u) * S, shadow: C.shadow }]);
  win.__ready = true;
}


// =============================================================================================
// THE PACKS' MARKERS: a pane of floor with the figures where they stand on it (tiles); what is on
// the floor (the rings) drawn under them in the game's own pixels, and what is over them (the bars,
// the names, the rune stone) over them, as the game draws them.

/** Where a point of the floor (tiles) is, in the game's pixels, from the floor's (0, 0). */
const ISO = (x: number, y: number): readonly [number, number] => [(x - y) * 16, (x + y) * 8];
const low = document.createElement('canvas');
function inGamePixels(x: number, y: number, w: number, h: number, fx0: number, fy0: number, S: number, draw: (c: CanvasRenderingContext2D) => void): void {
  const k = 2 * S;
  const ox = Math.ceil((fx0 - x) / k) + 1;
  const oy = Math.ceil((fy0 - y) / k) + 1;
  const x0 = fx0 - ox * k;
  const y0 = fy0 - oy * k;
  low.width = Math.ceil((x + w - x0) / k) + 1;
  low.height = Math.ceil((y + h - y0) / k) + 1;
  const c = low.getContext('2d') as CanvasRenderingContext2D;
  c.clearRect(0, 0, low.width, low.height);
  c.save();
  c.translate(ox, oy);
  draw(c);
  c.restore();
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.imageSmoothingEnabled = false;
  g.drawImage(low, x0, y0, low.width * k, low.height * k);
  g.restore();
}
interface Who3 {
  sp: Sprite;
  x: number;
  y: number;
  shadow: number;
}
function pane3(x: number, y: number, w: number, h: number, S: number, fx0: number, fy0: number, who: ReadonlyArray<Who3>, under?: (c: CanvasRenderingContext2D) => void, over?: (c: CanvasRenderingContext2D) => void): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.fillStyle = '#07061a';
  g.fillRect(x, y, w, h);
  g.imageSmoothingEnabled = false;
  const span = Math.ceil(Math.max(w, h) / (16 * S)) + 4;
  for (let ty = -span; ty <= span; ty++) {
    for (let tx = -span; tx <= span; tx++) {
      const px = fx0 + (tx - ty) * 32 * S;
      const py = fy0 + (tx + ty) * 16 * S - 16 * S;
      if (px < x - 70 * S || px > x + w + 70 * S || py < y - 40 * S || py > y + h + 40 * S) continue;
      const sp = ground.floor(tx + 40, ty + 40);
      g.drawImage(sp.img, px - sp.ax * 2 * S, py - sp.ay * 2 * S, sp.img.width * S, sp.img.height * S);
    }
  }
  const spot = (f: Who3): [number, number] => {
    const [a, b] = ISO(f.x, f.y);
    return [fx0 + a * 2 * S, fy0 + b * 2 * S];
  };
  g.fillStyle = 'rgba(6,4,14,0.5)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  for (const f of who) {
    const [fx, fy] = spot(f);
    const r = Math.max(60, (f.shadow + 36) * S);
    const lit = g.createRadialGradient(fx, fy - 16 * S, 0, fx, fy - 16 * S, r);
    lit.addColorStop(0, 'rgba(0,0,0,0.5)');
    lit.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lit;
    g.fillRect(x, y, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  g.restore();
  if (under) inGamePixels(x, y, w, h, fx0, fy0, S, under);
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  for (const f of who) {
    const [fx, fy] = spot(f);
    const sh = g.createRadialGradient(fx, fy, 0, fx, fy, f.shadow * S);
    sh.addColorStop(0, 'rgba(0,0,0,0.6)');
    sh.addColorStop(0.65, 'rgba(0,0,0,0.4)');
    sh.addColorStop(1, 'rgba(0,0,0,0)');
    g.save();
    g.translate(fx, fy);
    g.scale(1, 0.5);
    g.translate(-fx, -fy);
    g.fillStyle = sh;
    g.beginPath();
    g.arc(fx, fy, f.shadow * S, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }
  for (const f of [...who].sort((a, b) => a.x + a.y - (b.x + b.y))) {
    const [fx, fy] = spot(f);
    drawAura(g, f.sp, fx, fy, 2 * S);
    g.imageSmoothingEnabled = false;
    g.drawImage(f.sp.img, Math.round(fx - f.sp.ax * 2 * S), Math.round(fy - f.sp.ay * 2 * S), f.sp.img.width * S, f.sp.img.height * S);
    drawLights(g, f.sp, fx, fy, 2 * S);
  }
  g.restore();
  if (over) inGamePixels(x, y, w, h, fx0, fy0, S, over);
}

/** A monster of a pack, for the pictures: where it stands, what it is, its frame. */
interface PackOne {
  x: number;
  y: number;
  sp: Sprite;
  shadow: number;
  /** Its half-width (tiles), as the game's rules have it (the ring is 1.5 times it out). */
  r: number;
  mark: PackMark;
  name?: string;
  bar: number;
  life: number;
}

/** Version 19.7's look (render.ts, with PACK_LOOK): a dotted ring in its word's colour under a named one; a bar; the name. */
function todayUnder(c: CanvasRenderingContext2D, list: ReadonlyArray<PackOne>, t: number): void {
  for (const m of list) {
    if (m.mark.rarity === 'minion') continue;
    const [cx, cy] = ISO(m.x, m.y);
    const col = WORD_COLOR[m.mark.words[0]];
    const r = m.r * (1.5 + 0.12 * Math.sin(t * 5));
    c.fillStyle = col;
    const n = Math.max(16, Math.round(r * 44));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      c.fillRect(Math.round(cx + (Math.cos(a) - Math.sin(a)) * 16 * r), Math.round(cy + (Math.cos(a) + Math.sin(a)) * 8 * r), 1, 1);
    }
  }
}
const ICONS = makeIconArt();
/** The bars and names over them, as render.ts draws them (drawBars), and a leader's rune stone of its word. */
function barsOver(c: CanvasRenderingContext2D, list: ReadonlyArray<PackOne>, t: number, newLook: boolean): void {
  for (const m of list) {
    const [sx0, sy0] = ISO(m.x, m.y);
    const sx = Math.round(sx0);
    const top = Math.round(m.sp.ay);
    const sy = Math.round(sy0) - top - 5;
    if (m.bar > 0) {
      const w = m.bar;
      c.fillStyle = P.ink;
      c.fillRect(sx - w / 2 - 1, sy - 1, w + 2, 4);
      c.fillStyle = P.bl1;
      c.fillRect(sx - w / 2, sy, w, 2);
      c.fillStyle = m.mark.rarity === 'minion' ? P.bl4 : P.fr4;
      c.fillRect(sx - w / 2, sy, Math.max(0, Math.round(w * m.life)), 2);
    }
    if (m.name) drawText(c, m.name, sx, sy - 8, m.mark.rarity === 'blue' ? RARITY_COLOR[1] : RARITY_COLOR[2], { align: 'center', font: 'small', shadow: P.ink });
    if (m.mark.rarity === 'leader') {
      const w = m.mark.words[0];
      const icon = ICONS.word[w];
      const bob = Math.round(Math.sin(t * 3) * 1.5);
      const x = sx - 6;
      const y = sy - (m.name ? 15 : 8) - 13 + bob;
      c.fillStyle = P.ink;
      c.fillRect(x - 1, y - 1, 14, 14);
      c.fillStyle = WORD_COLOR[w];
      c.fillRect(x - 1, y + 13, 14, 1);
      c.drawImage(icon.img, x, y);
    }
  }
  void newLook;
}

/** The two packs: a blue one of five skeletons with Flame; a yellow one, the champion with Flame leading four minions. */
function packsAt(t: number, cry = 0): { blue: PackOne[]; yellow: PackOne[] } {
  const skel = makeSkeletonArt3();
  const sk = (i: number): Sprite => skel.front.idle[Math.floor(t * (skel.front.idleFps ?? 10) + i * 3) % skel.front.idle.length];
  const champ = makeChampionArt3();
  const ch = cry > 0 ? frameAt(champ.front.clips?.moves?.rally as Clip, cry) : standingAt(champ.front, t);
  const R = 0.3;
  const blueAt: [number, number][] = [[0, 0], [1.3, -0.5], [0.6, 1.1], [1.9, 0.8], [-0.4, 1.6]];
  const yellowAt: [number, number][] = [[2.2, -1.3], [-1.0, -0.3], [2.6, 1.5], [0.2, 2.6]];
  const fire = 'fire' as const;
  const blue: PackOne[] = blueAt.map(([x, y], i) => ({ x, y, sp: sk(i), shadow: 10, r: R, mark: { rarity: 'blue', words: [fire] }, name: i === 0 ? 'Flame Skeleton' : undefined, bar: 24, life: [1, 0.8, 1, 0.55, 1][i] }));
  const rallyOn = cry > 0 ? Math.max(0, Math.min(1, (cry - 0.45) / 0.4)) * (cry < RALLY_CRY + 0.45 ? 1 : Math.max(0, 1 - (cry - RALLY_CRY - 0.45) * 3)) : 0;
  const yellow: PackOne[] = [
    { x: 0.8, y: 0.4, sp: ch, shadow: C.shadow, r: 0.36, mark: { rarity: 'leader', words: [fire] }, name: 'Flame Skeleton Champion', bar: 34, life: 1 },
    ...yellowAt.map(([x, y], i) => ({ x, y, sp: sk(i + 7), shadow: 10, r: R, mark: { rarity: 'minion' as const, words: [fire], cry: rallyOn }, bar: i === 2 ? 16 : 0, life: 0.6 })),
  ];
  return { blue, yellow };
}

if (mode === 'packs') {
  const S = Number(parts[1]) || 2;
  const PAD = 14;
  const HEAD = 86;
  const LAB = 34;
  const PW = 330 * S;
  const PH = 185 * S;
  cv.width = PAD * 3 + PW * 2;
  cv.height = HEAD + 2 * (LAB + PH + PAD) + 10;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('Telling a blue pack from a yellow pack at a glance', PAD, 12, 26, '#ffd866', 700);
  text('a mock-up: not in the game. Here the word is Flame. Above, the look of Version 19.7; below, the new rings.', PAD, 46, 16, '#cfc8ff', 600);
  const t = 0.4;
  const { blue, yellow } = packsAt(t);
  const rows: { title: string; newLook: boolean }[] = [
    { title: 'Today (Version 19.7)', newLook: false },
    { title: 'The new rings', newLook: true },
  ];
  rows.forEach((row, ri) => {
    const y = HEAD + ri * (LAB + PH + PAD);
    text(row.title, PAD, y + 4, 19, '#ffd866', 700);
    [blue, yellow].forEach((list, ci) => {
      const x = PAD + ci * (PW + PAD);
      const fx0 = x + PW * (ci === 0 ? 0.42 : 0.4);
      const fy0 = y + LAB + PH * (ci === 0 ? 0.5 : 0.52);
      const under = (c: CanvasRenderingContext2D): void => {
        if (!row.newLook) todayUnder(c, list, t);
        else for (const m of list) drawPackMark(c, ISO, m.x, m.y, m.r, m.mark, t);
      };
      const over = (c: CanvasRenderingContext2D): void => barsOver(c, row.newLook ? list : list.map((m) => (m.mark.rarity === 'minion' ? { ...m, bar: 0 } : m)), t, row.newLook);
      pane3(x, y + LAB, PW, PH, S, fx0, fy0, list.map((m) => ({ sp: m.sp, x: m.x, y: m.y, shadow: m.shadow })), under, over);
      text(ci === 0 ? 'A blue pack: one word on every one' : 'A yellow pack: its leader, and his minions with half his word', x + 8, y + LAB + PH - 26, 15, '#e8e2ff', 600);
    });
  });
  win.__ready = true;
}

// =============================================================================================
// cry: the yellow pack, the champion crying out to his minions

if (mode === 'cry') {
  const S = Number(parts[1]) || 3;
  const FPS = 30;
  const art = makeChampionArt3();
  const rally = art.front.clips?.moves?.rally as Clip;
  const T1 = 0.6;
  const ROUND = T1 + longOf(rally) + 0.6;
  const TICKS = Math.round(ROUND * FPS);
  const PAD = 10;
  const HEAD = 58;
  const PW = 240 * S;
  const PH = 190 * S;
  cv.width = PW + 2 * PAD;
  cv.height = HEAD + PH + 12;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    const w = t - T1;
    const crying = w >= 0 && w < longOf(rally);
    const { yellow } = packsAt(t, crying ? Math.max(0.0001, w) : 0);
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(crying && w > RALLY_CRY - 0.4 ? 'His rallying cry: his minions’ half of his word made whole for a moment' : 'A yellow pack: the champion and his minions', PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. Their broken gold rings fill with his word as he cries out', PAD, 32, 14, '#cfc8ff', 600);
    const fx0 = PAD + PW * 0.4;
    const fy0 = HEAD + PH * 0.56;
    pane3(PAD, HEAD, PW, PH, S, fx0, fy0, yellow.map((m) => ({ sp: m.sp, x: m.x, y: m.y, shadow: m.shadow })), (c) => {
      for (const m of yellow) drawPackMark(c, ISO, m.x, m.y, m.r, m.mark, t);
    }, (c) => barsOver(c, yellow, t, true));
  });
}
