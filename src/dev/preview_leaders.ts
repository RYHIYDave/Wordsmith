// Dev page: THE OTHER PACKS' LEADERS (a mock-up: NOT IN THE GAME): the bone marksman (art/new_mobs3.ts
// MARKSMAN), on a piece of the dungeon's own floor with the dark of a dungeon over it, as
// preview_champion.ts shows the skeleton champion.
//   node tools/preview.mjs src/dev/preview_leaders.ts previews/leaders/marksman_sheet.png 1400 1000 "sheet:marksman"
//   hash = sheet:<leader>[:<scale>]: standing, facing you and away, beside one of his pack and the
//            knight for size; under them his moves and his death
//          film:<leader>[:<scale>]: frames of a moving picture (tools/page_gif.mjs): facing you and
//            away, he stands, makes his plain attack, stands, makes his own
//          walk:<leader>[:<scale>]: frames of a moving picture: walking toward you and then away, the
//            floor going by under him at his pace
//          death:<leader>[:<scale>]: frames of a moving picture: struck, then struck down
//          strip:<leader>:<stand | walk | attack | reel | die | one of his others>:<front | back>[:<scale>]: every frame of one move
//          pose:<leader>:<move>:<seconds>:<front | back>[:<scale>]: one frame, big
import { makeGroundArt } from '../art/ground';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { makeArcherArt3 } from '../art/monster_bones3';
import { MOVES3 } from '../art/moves3';
import { MARKSMAN, MK_PIERCE_HIT, MK_SHOT_HIT, MK_SNAP, TILE3, deathOfMob, handAt, makeMarksmanArt3, paintMob } from '../art/new_mobs3';
import { drawAimLine, drawGreatArrow } from '../art/mob_shots';
import type { FloorAt } from '../art/mob_shots';
import type { Mob } from '../art/new_mobs3';
import type { ActorArt, AnimSet, Clip } from '../art/actor_types';
import { CANVAS3 } from '../art/skin';
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

/**
 * A pane of the dungeon's floor (the game's own tiles), the dark of a dungeon over it (thinner
 * about the figures), and on it figures at their floor points: each with its soft shadow, its pool
 * of light, itself and its lights. `S`: screen pixels to a picture pixel. (As preview_champion.ts.)
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
  const span = Math.ceil(w / (32 * S)) + 4;
  const mx = away ? 0 : by;
  const my = away ? -by : 0;
  for (let ty = Math.floor(my) - span; ty <= Math.floor(my) + span; ty++) {
    for (let tx = Math.floor(mx) - span; tx <= Math.floor(mx) + span; tx++) {
      const px = fx0 + (tx - mx - (ty - my)) * 32 * S;
      const py = fy0 + (tx - mx + (ty - my)) * 16 * S - 16 * S;
      if (px < x - 70 * S || px > x + w + 70 * S || py < y - 40 * S || py > y + h + 40 * S) continue;
      if (flat) {
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
  marks?.();
  for (const f of who) {
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

const sp3 = (mob: Mob, which: string, t: number, view: GameView): Sprite => toSprite(paintMob(mob, which, t, view), mob.aura, CANVAS3.ax, CANVAS3.ay);
const dead3 = (mob: Mob, k: number, view: GameView): Sprite => toSprite(deathOfMob(mob, k, view), null, CANVAS3.ax, CANVAS3.ay);
const KNIGHT = (): Sprite => spriteOf3(MOVES3.rear, 0, 'front');

/** EACH LEADER: his mob, his art as the game holds it, one of his pack, and what is said of him in the pictures. */
interface Leader {
  mob: Mob;
  art: () => ActorArt;
  pack: () => Sprite;
  packName: string;
  title: string;
  /** His name, short, for under his picture. */
  short: string;
  /** His own move (`moves.<name>`), and what the pictures call it. */
  own: string;
  sheet: { which: string; t: number; name: string; line: string }[];
  /** For the film's captions, at a moment of his plain attack, and of his own. */
  attackSaid: (t: number) => string;
  ownSaid: (t: number) => string;
  walkSaid: string;
  struckSaid: string;
  deathSaid: string;
}
const LEADERS: Record<string, Leader> = {
  marksman: {
    mob: MARKSMAN,
    art: () => makeMarksmanArt3(),
    pack: () => makeArcherArt3().front.idle[0],
    packName: 'A bone archer',
    title: 'The bone marksman',
    short: 'The marksman',
    own: 'pierce',
    sheet: [
      { which: 'attack', t: 0.55, name: 'His shot', line: 'drawn and held', },
      { which: 'pierce', t: 0.42, name: 'His great shot', line: 'an arrow from his quiver' },
      { which: 'pierce', t: 1.45, name: 'His great shot', line: 'held, its head burning' },
      { which: 'pierce', t: MK_PIERCE_HIT + 0.04, name: 'His great shot', line: 'loosed, to pierce' },
      { which: 'die', t: MK_SNAP + 0.05, name: 'Struck down', line: 'his bow snaps' },
      { which: 'die', t: 1.9, name: 'Fallen', line: 'his bow in two' },
    ],
    attackSaid: (t) => (t < MK_SHOT_HIT ? 'His shot: the great bow drawn to his jaw and held' : 'His shot: loosed'),
    ownSaid: (t) => (t < 0.52 ? 'His great shot: an arrow drawn from his quiver' : t < MK_PIERCE_HIT ? 'His great shot: drawn past his jaw and held, its head gathering light' : 'His great shot: loosed, to pierce'),
    walkSaid: 'His walk: unhurried, his great bow carried at his side',
    struckSaid: 'Struck: rocked back, his bow kept',
    deathSaid: 'Struck down: one last draw, and his bow snaps; then he comes apart',
  },
};
const who = LEADERS[parts[1] || 'marksman'] ?? LEADERS.marksman;
const L = who.mob;
const shotOf = (which: string, t: number, view: GameView): Sprite => (which === 'die' ? dead3(L, t / L.dieTime, view) : sp3(L, which, t, view));

// =============================================================================================
// sheet: standing, beside his pack and a hero; under that, his moves and his death

if (mode === 'sheet') {
  const S = Number(parts[2]) || 3;
  const PAD = 14;
  const row1: { sp: Sprite; name: string; line: string; shadow: number; them: boolean }[] = [
    { sp: KNIGHT(), name: 'The knight', line: 'a hero, for size', shadow: 12, them: false },
    { sp: who.pack(), name: who.packName, line: 'his pack', shadow: 10, them: false },
    { sp: sp3(L, 'stand', 0, 'front'), name: who.short, line: 'facing you', shadow: L.shadow, them: true },
    { sp: sp3(L, 'stand', 0, 'back'), name: who.short, line: 'facing away', shadow: L.shadow, them: true },
  ];
  const row2 = who.sheet.map((c) => ({ sp: shotOf(c.which, c.t, 'front'), name: c.name, line: c.line, shadow: L.shadow }));
  const GAP = 14;
  const cellOf = (sp: Sprite): [number, number] => {
    const [l, r] = reachOf(sp);
    return [Math.max(l + r, 62), l];
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
  text(who.title, PAD, 12, 28, '#ffd866', 700);
  text('a yellow pack’s leader. A mock-up: not in the game', PAD, 46, 17, '#cfc8ff', 600);
  const rowOf = (list: { sp: Sprite; name: string; line: string; shadow: number }[], y: number, h: number, up: number, wide: number, gold: (i: number) => boolean): void => {
    let x = PAD + (W - PAD * 2 - wide * S) / 2 + GAP * S;
    const at = list.map((f) => {
      const [cw, l] = cellOf(f.sp);
      const fx = x + Math.max(l, cw / 2) * S;
      x += (cw + GAP) * S;
      return { sp: f.sp, fx, fy: y + (up + 7) * S, shadow: f.shadow };
    });
    pane(PAD, y, W - PAD * 2, h, S, at);
    at.forEach((w, i) => {
      text(list[i].name, w.fx, y + h + 6, 17, gold(i) ? '#ffd866' : '#cfc8ff', 700, 'center');
      text(list[i].line, w.fx, y + h + 27, 14, '#a8a2b8', 500, 'center');
    });
  };
  rowOf(row1, HEAD, h1, up1, w1, (i) => row1[i].them);
  rowOf(row2, HEAD + h1 + LAB + 20, h2, up2, w2, () => true);
  win.__ready = true;
}

// =============================================================================================
// film: facing you and away, he stands, makes his plain attack, stands, makes his own

if (mode === 'film') {
  const S = Number(parts[2]) || 3;
  const FPS = 30;
  const art = who.art();
  const sets = [art.front, art.back];
  const plain = sets.map((s) => s.clips?.attack as Clip);
  const own = sets.map((s) => s.clips?.moves?.[who.own] as Clip);
  const T1 = 0.8;
  const T2 = T1 + longOf(plain[0]) + 0.8;
  const ROUND = T2 + longOf(own[0]) + 0.8;
  const TICKS = Math.round(ROUND * FPS);
  const frameOf = (j: number, t: number): Sprite => (t >= T1 && t < T1 + longOf(plain[j]) ? frameAt(plain[j], t - T1) : t >= T2 && t < T2 + longOf(own[j]) ? frameAt(own[j], t - T2) : standingAt(sets[j], t));
  const all: Sprite[] = [];
  for (let i = 0; i < TICKS; i++) for (let j = 0; j < 2; j++) all.push(frameOf(j, i / FPS));
  const [l, r, u, d] = reachAll(all);
  const PAD = 10;
  const M = 8;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = Math.max(PAD + 2 * (cw + PAD), 680);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    const said = t >= T1 && t < T2 - 0.4 ? who.attackSaid(t - T1) : t >= T2 && t < T2 + longOf(own[0]) ? who.ownSaid(t - T2) : `${who.title}: standing, still and patient`;
    text(said, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. A yellow pack’s leader', PAD, 32, 14, '#cfc8ff', 600);
    const x0 = (cv.width - 2 * cw - PAD) / 2;
    for (let j = 0; j < 2; j++) {
      const x = x0 + j * (cw + PAD);
      pane(x, HEAD, cw, ch, S, [{ sp: frameOf(j, t), fx: x + (M + l) * S, fy: HEAD + (M + u) * S, shadow: L.shadow }]);
      text(j === 0 ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}

// =============================================================================================
// walk: toward you, then away, the floor going by under him at his pace

if (mode === 'walk') {
  const S = Number(parts[2]) || 3;
  const FPS = 30;
  const LEG = 2.4;
  const TICKS = Math.round(2 * LEG * FPS);
  const art = who.art();
  const [l, r, u, d] = reachAll([...art.front.walk, ...art.back.walk]);
  const PAD = 10;
  const M = 10;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = Math.max(cw + 2 * PAD, 600);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    const away = t >= LEG;
    const tt = away ? t - LEG : t;
    const set = away ? art.back : art.front;
    const sp = set.walk[Math.floor(tt * (set.walkFps ?? 10) + 1e-6) % set.walk.length];
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(`${who.walkSaid}, ${away ? 'going away from you' : 'coming toward you'}`, PAD, 8, 17, '#ffd866', 700);
    text(`a mock-up: not in the game. ${L.pace} tiles a second; the floor goes by under him`, PAD, 32, 14, '#cfc8ff', 600);
    const x = (cv.width - cw) / 2;
    pane(x, HEAD, cw, ch, S, [{ sp, fx: x + (M + l) * S, fy: HEAD + (M + u) * S, shadow: L.shadow }], tt * L.pace, away, true);
  });
}

// =============================================================================================
// death: struck, then struck down

if (mode === 'death') {
  const S = Number(parts[2]) || 3;
  const FPS = 30;
  const art = who.art();
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
  cv.width = Math.max(PAD + 2 * (cw + PAD), 680);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(t < T2 ? who.struckSaid : who.deathSaid, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. A yellow pack’s leader', PAD, 32, 14, '#cfc8ff', 600);
    const x0 = (cv.width - 2 * cw - PAD) / 2;
    for (let j = 0; j < 2; j++) {
      const x = x0 + j * (cw + PAD);
      pane(x, HEAD, cw, ch, S, [{ sp: frameOf(j, t), fx: x + (M + l) * S, fy: HEAD + (M + u) * S, shadow: L.shadow }]);
      text(j === 0 ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}

// =============================================================================================
// strip: every frame of one move, in rows

if (mode === 'strip') {
  const which = parts[2] || 'stand';
  const view: GameView = parts[3] === 'back' ? 'back' : 'front';
  const S = Number(parts[4]) || 3;
  const every = Number(parts[5]) || 1;
  const art = who.art();
  const set = view === 'back' ? art.back : art.front;
  const all: Sprite[] = which === 'stand' ? set.idle : which === 'walk' ? set.walk : which === 'attack' ? (set.clips?.attack as Clip).frames : which === 'reel' ? (set.clips?.reel as Clip).frames : which === 'die' ? (set.clips?.die as Clip).frames : (set.clips?.moves?.[which] as Clip).frames;
  const idx = all.map((_, i) => i).filter((i) => i % every === 0);
  const sps = idx.map((i) => all[i]);
  const [l, r, u, d] = reachAll(sps);
  const M = 6;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const per = Math.max(1, Math.min(sps.length, Math.floor(2400 / (cw + 6))));
  cv.width = per * (cw + 6) + 6;
  cv.height = 30 + Math.ceil(sps.length / per) * (ch + 22);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`${who.title}: ${which}, ${view === 'front' ? 'facing you' : 'facing away'}, ${all.length} frames${every > 1 ? `, every ${every}` : ''}`, 6, 6, 16, '#ffd866', 700);
  sps.forEach((sp, k) => {
    const x = 6 + (k % per) * (cw + 6);
    const y = 30 + Math.floor(k / per) * (ch + 22);
    pane(x, y, cw, ch, S, [{ sp, fx: x + (M + l) * S, fy: y + (M + u) * S, shadow: L.shadow }]);
    text(`${idx[k]}`, x + 3, y + ch + 3, 12, '#a8a2b8');
  });
  win.__ready = true;
}

// =============================================================================================
// pose: one frame, big

if (mode === 'pose') {
  const which = parts[2] || 'stand';
  const t = Number(parts[3]) || 0;
  const view: GameView = parts[4] === 'back' ? 'back' : 'front';
  const S = Number(parts[5]) || 6;
  const sp = shotOf(which, t, view);
  const [l, r, u, d] = reachAll([sp]);
  const M = 8;
  cv.width = (l + r + 2 * M) * S;
  cv.height = (u + d + 2 * M) * S + 30;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`${which} at ${t} s, ${view}`, 6, 6, 16, '#ffd866', 700);
  pane(0, 30, cv.width, cv.height - 30, S, [{ sp, fx: (M + l) * S, fy: 30 + (M + u) * S, shadow: L.shadow }]);
  win.__ready = true;
}

// =============================================================================================
// poses:<leader>:<move>:<seconds,seconds,...>[:<scale>]: a row of frames of one move facing you, and under it the same facing away

if (mode === 'poses') {
  const which = parts[2] || 'stand';
  const ts = (parts[3] || '0').split(',').map(Number);
  const S = Number(parts[4]) || 4;
  const rows = (['front', 'back'] as const).map((view) => ts.map((t) => shotOf(which, t, view)));
  const [l, r, u, d] = reachAll(rows.flat());
  const M = 6;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  cv.width = ts.length * (cw + 6) + 6;
  cv.height = 30 + 2 * (ch + 22);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`${who.title}: ${which}`, 6, 6, 16, '#ffd866', 700);
  rows.forEach((row, j) => {
    row.forEach((sp, k) => {
      const x = 6 + k * (cw + 6);
      const y = 30 + j * (ch + 22);
      pane(x, y, cw, ch, S, [{ sp, fx: x + (M + l) * S, fy: y + (M + u) * S, shadow: L.shadow }]);
      text(`${ts[k]} s`, x + 3, y + ch + 3, 12, '#a8a2b8');
    });
  });
  win.__ready = true;
}

// =============================================================================================
// SHOTS ACROSS THE FLOOR: the floor's (0, 0) where he stands, he faces along the grid's x; what flies
// is drawn in the game's own pixels, as the game draws it (as preview_new_mobs.ts does the
// Boneward's spear)

const ISO: FloorAt = (x, y) => [(x - y) * 16, (x + y) * 8];
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
  g.imageSmoothingEnabled = false;
  g.drawImage(low, x0, y0, low.width * k, low.height * k);
}
/** A pane of floor with the figure where he stands, `under` drawn on the floor (in the game's pixels) and `over` in the air; `pools`: where you would stand, lit by the light you carry. */
function pane2(x: number, y: number, w: number, h: number, S: number, fx0: number, fy0: number, sp: Sprite, under?: (c: CanvasRenderingContext2D) => void, over?: (c: CanvasRenderingContext2D) => void, pools: ReadonlyArray<readonly [number, number]> = []): void {
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
      const fl = ground.floor(tx + 40, ty + 40);
      g.drawImage(fl.img, px - fl.ax * 2 * S, py - fl.ay * 2 * S, fl.img.width * S, fl.img.height * S);
    }
  }
  g.fillStyle = 'rgba(6,4,14,0.55)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  const lit = g.createRadialGradient(fx0, fy0 - 18 * S, 0, fx0, fy0 - 18 * S, Math.max(60, (L.shadow + 40) * S));
  lit.addColorStop(0, 'rgba(0,0,0,0.6)');
  lit.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = lit;
  g.fillRect(x, y, w, h);
  for (const [px, py] of pools) {
    const [a, b] = ISO(px, py);
    const cx = fx0 + a * 2 * S;
    const cy = fy0 + b * 2 * S;
    const pool = g.createRadialGradient(cx, cy, 0, cx, cy, 52 * S);
    pool.addColorStop(0, 'rgba(0,0,0,0.75)');
    pool.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = pool;
    g.fillRect(x, y, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  if (under) inGamePixels(x, y, w, h, fx0, fy0, S, under);
  const sh = g.createRadialGradient(fx0, fy0, 0, fx0, fy0, L.shadow * S);
  sh.addColorStop(0, 'rgba(0,0,0,0.62)');
  sh.addColorStop(0.65, 'rgba(0,0,0,0.42)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.save();
  g.translate(fx0, fy0);
  g.scale(1, 0.5);
  g.translate(-fx0, -fy0);
  g.fillStyle = sh;
  g.beginPath();
  g.arc(fx0, fy0, L.shadow * S, 0, Math.PI * 2);
  g.fill();
  g.restore();
  drawAura(g, sp, fx0, fy0, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx0 - sp.ax * 2 * S), Math.round(fy0 - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx0, fy0, 2 * S);
  if (over) inGamePixels(x, y, w, h, fx0, fy0, S, over);
  g.restore();
}
/** A point of the figure (its own lengths: forward, to its left, up) as a point of the floor (tiles) and a height (the game's pixels), the figure standing at (0, 0) facing along the grid's x. */
const onFloorOf = (p: readonly number[]): [number, number, number] => [p[0] / TILE3, -p[1] / TILE3, p[2] / 2];

// =============================================================================================
// shotfilm:marksman[:<scale>]: his plain shot, then his great shot: its line of aim on the floor as he
// holds it, the great arrow flying along it

if (mode === 'shotfilm') {
  const S = Number(parts[2]) || 3;
  const FPS = 30;
  const art = who.art();
  const set = art.front;
  const plain = set.clips?.attack as Clip;
  const great = set.clips?.moves?.pierce as Clip;
  const T1 = 0.5;
  const T2 = T1 + longOf(plain) + 0.6;
  const ROUND = T2 + longOf(great) + 0.7;
  const TICKS = Math.round(ROUND * FPS);
  /** Where you stand (tiles), and how far his shots are shown going. */
  const YOU: readonly [number, number] = [5.0, 0];
  const FAR = 7.6;
  /** You: the knight, turned to face him (his back view, turned about). */
  const YOU_SP = spriteOf3(MOVES3.rear, 0, 'back');
  const [px, py, pz] = onFloorOf(handAt(L, 'attack', MK_SHOT_HIT, 'L'));
  const [gx, gy, gz] = onFloorOf(handAt(L, 'pierce', MK_PIERCE_HIT, 'L'));
  const PLAIN_PACE = 10;
  const GREAT_PACE = 16;
  const frameOf = (t: number): Sprite => (t >= T1 && t < T1 + longOf(plain) ? frameAt(plain, t - T1) : t >= T2 && t < T2 + longOf(great) ? frameAt(great, t - T2) : standingAt(set, t));
  const PAD = 10;
  const [l, , u] = reachAll([...plain.frames, ...great.frames, set.idle[0]]);
  const [ex, ey] = ISO(FAR, 0);
  const W = (l + ex * 2 + 24) * S;
  const H = (u + ey * 2 + 26) * S;
  const HEAD = 58;
  cv.width = Math.max(W + 2 * PAD, 680);
  cv.height = HEAD + H + 34;
  const X0 = Math.round((cv.width - W) / 2);
  const fx0 = X0 + (l + 10) * S;
  const fy0 = HEAD + (u + 8) * S;
  /** The knight where you stand, facing him. */
  const knight = (): void => {
    const [a, b] = ISO(YOU[0], YOU[1]);
    const X = fx0 + a * 2 * S;
    const Y = fy0 + b * 2 * S;
    g.save();
    g.translate(X, Y);
    g.scale(-1, 1);
    drawAura(g, YOU_SP, 0, 0, 2 * S);
    g.imageSmoothingEnabled = false;
    g.drawImage(YOU_SP.img, Math.round(-YOU_SP.ax * 2 * S), Math.round(-YOU_SP.ay * 2 * S), YOU_SP.img.width * S, YOU_SP.img.height * S);
    drawLights(g, YOU_SP, 0, 0, 2 * S);
    g.restore();
  };
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    const inGreat = t >= T2 && t < T2 + longOf(great);
    const said = t >= T1 && t < T2 - 0.3 ? who.attackSaid(t - T1) : inGreat ? who.ownSaid(t - T2) : `${who.title}: his two shots`;
    text(said, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. The line on the floor, while he holds his great shot, is where it will fly', PAD, 32, 14, '#cfc8ff', 600);
    // the plain arrow in flight (as the game draws a monster's arrow: a short line), and the great arrow
    const tp = t - (T1 + MK_SHOT_HIT);
    const tg = t - (T2 + MK_PIERCE_HIT);
    const aimK = inGreat ? Math.max(0, Math.min(1, (t - T2 - 0.52) / (MK_PIERCE_HIT - 0.52))) : 0;
    const under = (c: CanvasRenderingContext2D): void => {
      if (aimK > 0 && tg < 0) drawAimLine(c, ISO, 0.6, 0, FAR + 2, 0, aimK, t);
    };
    const over = (c: CanvasRenderingContext2D): void => {
      if (tp >= 0 && px + tp * PLAIN_PACE < YOU[0]) {
        // (a plain arrow, as the game draws a monster's: a short shaft, its head a pink spark)
        const hx = px + tp * PLAIN_PACE;
        const [ax, ay] = ISO(hx, py);
        for (let d = 1; d <= 8; d++) {
          c.fillStyle = d >= 7 ? '#ff7aa8' : '#a8607a';
          c.fillRect(Math.round(ax - d * 0.894), Math.round(ay - pz - d * 0.447), 1, 1);
        }
        c.fillStyle = '#ff4f8a';
        c.fillRect(Math.round(ax), Math.round(ay - pz), 2, 1);
      }
      if (tg >= 0 && gx + tg * GREAT_PACE < FAR + 3) drawGreatArrow(c, ISO, gx + tg * GREAT_PACE, gy, gz, 1, 0, t);
    };
    pane2(X0, HEAD, W, H, S, fx0, fy0, frameOf(t), under, (c) => {
      // (you, the knight, under what flies at you)
      void c;
    }, [YOU]);
    g.save();
    g.beginPath();
    g.rect(X0, HEAD, W, H);
    g.clip();
    knight();
    inGamePixels(X0, HEAD, W, H, fx0, fy0, S, over);
    g.restore();
    text('facing you; the knight for the one he shoots at', X0 + W / 2, HEAD + H + 6, 15, '#e8e2ff', 600, 'center');
  });
}
