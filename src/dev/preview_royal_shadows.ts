// THE SHADOWS OF THE FOUR ROYALS' PICTURES, made outside a browser (Node): the sheet and the film. Nothing of the game
// imports it.
//   npx tsx src/dev/preview_royal_shadows.ts sheet <out.png>
//   npx tsx src/dev/preview_royal_shadows.ts film <out.mp4> [only: a part's number]
//   npx tsx src/dev/preview_royal_shadows.ts stills <out dir>        (the film's parts, a few frames of each, as stills)
//   npx tsx src/dev/preview_royal_shadows.ts crownsheet <out.png>   (the King's shadow's Crown's Weight: key frames)
//   npx tsx src/dev/preview_royal_shadows.ts crownfilm <out.mp4>    (the same, a short film: in front and from behind, then at half speed)
//   npx tsx src/dev/preview_royal_shadows.ts chargesheet <out.png>  (the King's shadow's charge and its line of sparks: key frames)
//   npx tsx src/dev/preview_royal_shadows.ts chargefilm <out.mp4>   (the same, a short film: in front above, from behind below, then at half speed)
// @ts-ignore
import * as childProcess from 'node:child_process';
// @ts-ignore
import * as nodeFs from 'node:fs';
import { Px } from '../engine/px';
import { hash } from '../art/kit';
import { TILE3, paintViewOf } from '../art/new_mobs3';
import { stage } from '../art/skin';
import type { GameView } from '../art/skin';
import { BLINK, FOG, ROYALS, ROYAL_IDS, loopOf, longOf, shadowFrame } from '../art/royal_shadows';
import type { Frame, Royal } from '../art/royal_shadows';
import { CARD, DEATH, MASKS_SHADOW_FLIGHT, SHADOW_CHARGE, SHADOW_MASKS, SHADOW_SNARE, SHADOW_WEIGHT, blinkFrame, cardPx, chargeCarriedTiles, deathFrame, masksFx, shadowCrownAt, snareFx, sparksFx, weightFx } from '../art/royal_shadows_fx';
import { PR_SNARE } from '../art/princess_moves';
import { PC_MASKS } from '../art/prince_moves';
import { KG_CHARGE, KG_WEIGHT } from '../art/king_moves';
import { WEIGHT_FX } from '../art/king_fx';
import { floorAt, knight, lay, shadow } from './king_scene';
import type { Laid } from './king_scene';

interface Proc {
  stdin: { write(b: Uint8Array): boolean; once(e: string, f: () => void): void; end(): void };
  on(e: string, f: (code: number) => void): void;
}
const { spawn, spawnSync } = childProcess as {
  spawn(cmd: string, args: string[], o: object): Proc;
  spawnSync(cmd: string, args: string[], o?: object): { status: number | null; stderr: unknown };
};
const { mkdirSync, writeFileSync } = nodeFs as { mkdirSync(p: string, o: object): void; writeFileSync(p: string, d: string): void };
const ARGV = (globalThis as unknown as { process: { argv: string[] } }).process.argv;
/** Saves a picture as a PNG (ffmpeg makes it). */
function savePng(px: Px, out: string): void {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${px.w}x${px.h}`, '-i', '-', '-frames:v', '1', out], { input: px.d });
  if (r.status !== 0) throw new Error(String(r.stderr));
}

(Px.prototype as unknown as { toCanvas: (this: Px) => unknown }).toCanvas = function (this: Px): unknown {
  return this;
};
const FOG_RGB = FOG.map((c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]);
const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FONT2 = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';

/** THE QUIET TOWER'S FLOOR (a stand-in): grey flags of a tile each, their seams dark, fog pale over its middle; `k` times as big. */
function towerFloor(w: number, h: number, cx: number, cy: number, k: number): Px {
  const px = new Px(w, h);
  for (let Y = 0; Y < h; Y++) {
    for (let X = 0; X < w; X++) {
      const [fx, fy] = floorAt(Math.floor(X / k) + 0.5, Math.floor(Y / k) + 0.5, Math.round(cx / k), Math.round(cy / k));
      const tx = fx / TILE3;
      const ty = fy / TILE3;
      const seam = tx - Math.floor(tx) < 0.035 || ty - Math.floor(ty) < 0.035;
      const fog = Math.max(0, 1 - Math.hypot(X - cx, (Y - cy) * 1.6) / (w * 0.75));
      const t = seam ? 0 : 1 + (hash(Math.floor(tx), Math.floor(ty), 77) < 0.45 ? 1 : 0) + (fog > 0.55 ? 1 : 0);
      px.d.set(FOG_RGB[t], (Y * w + X) * 4);
      px.d[(Y * w + X) * 4 + 3] = 255;
    }
  }
  return px;
}
const laid = (f: { px: Px; ax: number; ay: number }): Laid => ({ px: f.px, ax: f.ax, ay: f.ay });
/** Where `tiles` forward of a shadow is on the screen (picture pixels), as it is seen from in front or from behind. */
function forward(r: Royal, view: GameView, tiles: number, side = 0): [number, number] {
  const st = stage(paintViewOf(r.mob, view), 0, 0, { w: 1, h: 1 });
  const [x, y] = st.at([tiles * TILE3, side * TILE3, 0]);
  return [x, y];
}
/** Draws text on a picture with ffmpeg (a band of it at `y`). */
function captioned(raw: string, out: string, lines: { text: string; x: number; y: number; size: number; bold?: boolean }[]): void {
  const dir = `${out}.captions`;
  mkdirSync(dir, { recursive: true });
  const vf = lines.map((l, i) => {
    writeFileSync(`${dir}/c${i}.txt`, l.text);
    return `drawtext=fontfile=${l.bold === false ? FONT2 : FONT}:textfile=${dir}/c${i}.txt:x=${l.x}:y=${l.y}:fontsize=${l.size}:fontcolor=0xe6e0d3`;
  });
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-i', raw, '-vf', vf.join(','), out]);
  if (r.status !== 0) throw new Error(String(r.stderr));
  spawnSync('rm', ['-rf', dir]);
}

// =============================================================================================
// THE SHEET: the four standing, from in front and from behind, beside the knight, three times as big; their four cards

function sheet(out: string): void {
  const K = 3;
  const W = 1560;
  const H = 1110;
  const px = towerFloor(W, H, W / 2, 500, K);
  const cols = [120, 420, 720, 1020, 1320];
  const rows = [380, 760];
  for (const [ri, view] of (['front', 'back'] as const).entries()) {
    const y = rows[ri];
    shadow(px, cols[0], y, 9, K);
    lay(px, knight(view), cols[0], y, K);
    ROYAL_IDS.forEach((id, i) => {
      const f = shadowFrame(ROYALS[id], 'stand', 0, view);
      shadow(px, cols[i + 1], y, 10, K);
      lay(px, laid(f), cols[i + 1], y, K);
    });
  }
  // the cards, four times as big
  const C = 4;
  ROYAL_IDS.forEach((id, i) => {
    const c = cardPx(id);
    lay(px, { px: c, ax: CARD.w / 2, ay: CARD.h }, cols[i + 1], 1080, C);
  });
  const raw = `${out}.raw.png`;
  savePng(px, raw);
  const lab = (x: number, y: number, text: string, size = 22): { text: string; x: number; y: number; size: number } => ({ text, x, y, size });
  captioned(raw, out, [
    { text: 'SHADOWS OF THE FOUR ROYALS (floor 20, the Quiet Tower)', x: 24, y: 18, size: 34 },
    { text: 'Grey fog and bone white, the dull pink eyes. From in front (top) and from behind (middle), beside the knight; three times as big.', x: 24, y: 62, size: 21, bold: false },
    lab(cols[0] - 40, rows[0] + 18, 'Knight'),
    ...ROYAL_IDS.map((id, i) => lab(cols[i + 1] - 60, rows[0] + 18, ROYALS[id].name.replace('Shadow of the ', ''))),
    ...ROYAL_IDS.map((id, i) => lab(cols[i + 1] - 60, rows[1] + 18, `drawn ${ROYALS[id].k} of the boss`, 18)),
    { text: 'THE CARDS THEY LEAVE (four times as big): the family’s swan crest in the corners, each one’s own mark head to foot', x: 24, y: 830, size: 22 },
    { text: 'Princess: crown of nettles.   Prince: the smiling mask.   Queen: crown of glass spikes.   King: crown of fleurons.', x: 24, y: 862, size: 19, bold: false },
  ]);
  spawnSync('rm', ['-f', raw]);
  console.log('wrote', out);
}

// =============================================================================================
// THE FILM: each shadow's moves, from in front (left) and from behind (right), the knight for size, captioned

const FW = 960;
const FH = 540;
const FPS = 30;
const S = 2;
const HALF = FW / 2;
const FLOOR = towerFloor(FW, FH, FW / 2, FH / 2 + 40, S);
interface Part {
  r: Royal;
  title: string;
  line: string;
  long: number;
  /** The shadow at a moment of the part: its frame, where it stands (tiles forward of its mark), whether flipped; what is drawn on the floor under it, and its knight's place (tiles forward). */
  at: (t: number, view: GameView) => { f: Frame; fwd: number; flip?: boolean; under?: { f: Frame; fwd: number }[]; over?: { f: Frame; fwd: number }[]; knight?: number | null };
}
const KNIGHT_AT = 3.5;
function partsOf(r: Royal): Part[] {
  const name = r.name.toUpperCase();
  const at0 = { fwd: 0, knight: KNIGHT_AT };
  const P: Part[] = [];
  const stand = Math.max(2.0, loopOf(r, 'stand'));
  P.push({ r, title: `${name}: STANDING`, line: `Its royal's own stand, in fog, drawn ${r.k} of the boss's size. The knight for size.`, long: Math.min(2.4, stand), at: (t, v) => ({ f: shadowFrame(r, 'stand', t, v), ...at0 }) });
  const wl = r.id === 'king' ? 2.0 : 1.3;
  P.push({ r, title: `${name}: MOVING`, line: `Its royal's own walk, at ${r.pace} tiles a second (the knight's 2.5).`, long: wl, at: (t, v) => ({ f: shadowFrame(r, 'walk', t, v), fwd: -2 + r.pace * t, knight: KNIGHT_AT + 1 }) });
  const basic: Record<string, string> = { princess: 'The nettle vine lash (her basic attack)', prince: 'The rapier thrust (his basic attack)', queen: 'The comb (her basic attack)', king: 'The charge, its blade dragged (his basic attack)' };
  P.push({ r, title: `${name}: ${basic[r.id].split(' (')[0].toUpperCase()}`, line: `${basic[r.id]}: the boss's own blow, wind-up, a two-frame strike, wind-down.`, long: r.id === 'king' ? KG_CHARGE.burst + 1.0 : longOf(r, 'attack') + 0.2, at: (t, v) => (r.id === 'king'
    ? { f: shadowFrame(r, 'attack', Math.min(t, longOf(r, 'attack')), v), fwd: chargeCarriedTiles(t) - 2, knight: KNIGHT_AT + 1, under: [{ f: sparksFx(t - KG_CHARGE.run[0], v), fwd: -2 }] }
    : { f: shadowFrame(r, 'attack', Math.min(t, longOf(r, 'attack')), v), ...at0 }) });
  // its big move
  if (r.id === 'princess') {
    const L = Math.max(longOf(r, 'snare'), PR_SNARE.hit + SHADOW_SNARE.long);
    P.push({ r, title: `${name}: THE VINE SNARE, SMALL`, line: 'A small cage of vines bursts up round you (2.75 tiles across, hers 5); it holds 1.4 s and sinks.', long: L, at: (t, v) => ({ f: shadowFrame(r, 'snare', Math.min(t, longOf(r, 'snare')), v), ...at0, under: [{ f: snareFx(t - PR_SNARE.hit, v), fwd: KNIGHT_AT }] }) });
  } else if (r.id === 'prince') {
    const L = Math.max(longOf(r, 'masks'), PC_MASKS.hit + MASKS_SHADOW_FLIGHT + SHADOW_MASKS.burst) + 0.1;
    P.push({ r, title: `${name}: MASKS, THREE AND SHORT`, line: 'Three smiling masks flung in a fan (his five), flying 6 tiles (his 12), bursting into fog.', long: L, at: (t, v) => ({ f: shadowFrame(r, 'masks', Math.min(t, longOf(r, 'masks')), v), ...at0, knight: KNIGHT_AT + 1.5, over: [{ f: masksFx(t - PC_MASKS.hit, v), fwd: 0 }] }) });
  } else if (r.id === 'queen') {
    P.push({ r, title: `${name}: LOOKING GLASS, A BLINK`, line: 'Into her own hand mirror where she stands, and out of it behind you (no wall mirrors).', long: BLINK.into + BLINK.out + 0.4, at: (t, v) => (t < BLINK.into ? { f: blinkFrame('into', t, v), fwd: 0, knight: 2.5 } : { f: blinkFrame('out', Math.min(t - BLINK.into, BLINK.out + 0.4), v), fwd: 4.0, flip: true, knight: 2.5 }) });
  } else {
    // (the crown's floor point: from it out to over the knight, held over him, and home; the knight standing)
    const L = longOf(r, 'weight') + 0.2;
    const fwdOf = (t: number): number => {
      const w = shadowCrownAt(t - KG_WEIGHT.send, 'front');
      return w.phase === 'home' ? KNIGHT_AT * (1 - w.lerp) : w.phase === 'back' ? 0 : KNIGHT_AT * w.lerp;
    };
    P.push({ r, title: `${name}: THE CROWN’S WEIGHT`, line: 'A shadow crown sent up off its head follows you, hangs, slams down in two frames, flies home.', long: L, at: (t, v) => ({ f: shadowFrame(r, 'weight', Math.min(t, longOf(r, 'weight')), v), fwd: 0, knight: KNIGHT_AT, under: [{ f: weightFx(t - KG_WEIGHT.send, v, 'floor'), fwd: fwdOf(t) }], over: [{ f: weightFx(t - KG_WEIGHT.send, v, 'crown'), fwd: fwdOf(t) }] }) });
  }
  P.push({ r, title: `${name}: STRUCK`, line: 'Its royal’s own flinch, twice.', long: 1.0, at: (t, v) => ({ f: shadowFrame(r, 'reel', Math.min(t % 0.5, longOf(r, 'reel')), v), ...at0 }) });
  P.push({ r, title: `${name}: ITS DEATH`, line: 'It blows apart like smoke; its royal’s playing card hangs in the air a moment and fades.', long: DEATH.long + 0.2, at: (t, v) => ({ f: deathFrame(r, Math.min(t, DEATH.long), v), ...at0 }) });
  return P;
}
const PARTS: Part[] = ROYAL_IDS.flatMap((id) => partsOf(ROYALS[id]));

function filmFrame(p: Part, t: number): Px {
  const px = new Px(FW, FH);
  px.d.set(FLOOR.d);
  for (const [i, view] of (['front', 'back'] as const).entries()) {
    const x0 = i * HALF;
    const clip = (X: number): boolean => X >= x0 + 2 && X < x0 + HALF - 2;
    const s = p.at(t, view);
    // its mark: the front's toward the left and up, the back's toward the right and down, so that what is forward of it fits
    const [ux, uy] = forward(p.r, view, 1);
    const mx = x0 + HALF / 2 - ux * S * 1.6;
    const my = FH / 2 + 50 - uy * S * 1.6;
    const on = (tiles: number): [number, number] => [mx + ux * S * tiles, my + uy * S * tiles];
    const figs: { y: number; draw: () => void }[] = [];
    for (const u of s.under ?? []) {
      const [x, y] = on(u.fwd);
      lay(px, laid(u.f), x, y, S, (X) => clip(X));
    }
    const [fx, fy] = on(s.fwd);
    figs.push({ y: fy, draw: () => { shadow(px, fx, fy, 9, S); lay(px, laid(s.f), fx, fy, S, (X) => clip(X), s.flip ?? false); } });
    if (s.knight !== null && s.knight !== undefined) {
      const [kx, ky] = on(s.knight);
      figs.push({ y: ky, draw: () => { shadow(px, kx, ky, 9, S); lay(px, knight(view === 'front' ? 'back' : 'front', Math.floor(t * 6)), kx, ky, S, (X) => clip(X), true); } });
    }
    for (const g of figs.sort((a, b) => a.y - b.y)) g.draw();
    for (const o of s.over ?? []) {
      const [x, y] = on(o.fwd);
      lay(px, laid(o.f), x, y, S, (X) => clip(X));
    }
  }
  // the line between the two views
  for (let y = 0; y < FH; y++) for (const x of [HALF - 1, HALF]) px.d.set([7, 6, 12, 255], (y * FW + x) * 4);
  return px;
}

function film(out: string, only: string): void {
  let total = 0;
  for (const p of PARTS) total += p.long;
  console.log(PARTS.length, 'parts,', total.toFixed(1), 's');
  const dir = `${out}.captions`;
  mkdirSync(dir, { recursive: true });
  const filters: string[] = ['scale=1920:1080:flags=neighbor'];
  let at = 0;
  PARTS.forEach((p, i) => {
    if (only && String(i) !== only) return;
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = only ? '' : `:enable='between(t,${at.toFixed(3)},${(at + p.long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${FONT}:textfile=${dir}/t${i}.txt:x=28:y=24:fontsize=40:fontcolor=0xe6e0d3:box=1:boxcolor=0x0e0e10@0.6:boxborderw=10${en}`);
    filters.push(`drawtext=fontfile=${FONT2}:textfile=${dir}/l${i}.txt:x=28:y=1080-64:fontsize=28:fontcolor=0xc6c1b8:box=1:boxcolor=0x0e0e10@0.6:boxborderw=10${en}`);
    at += p.long;
  });
  filters.push(`drawtext=fontfile=${FONT2}:text='in front':x=28:y=96:fontsize=26:fontcolor=0x858483`);
  filters.push(`drawtext=fontfile=${FONT2}:text='from behind':x=988:y=96:fontsize=26:fontcolor=0x858483`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${FW}x${FH}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = new Uint8Array(FW * FH * 3);
  let n = 0;
  const t0 = Date.now();
  const write = async (): Promise<void> => {
    for (const [i, p] of PARTS.entries()) {
      if (only && String(i) !== only) continue;
      const frames = Math.round(p.long * FPS);
      for (let f = 0; f < frames; f++) {
        const px = filmFrame(p, f / FPS);
        for (let k = 0, j = 0; k < FW * FH * 4; k += 4, j += 3) {
          rgb[j] = px.d[k];
          rgb[j + 1] = px.d[k + 1];
          rgb[j + 2] = px.d[k + 2];
        }
        if (!ff.stdin.write(rgb)) await new Promise<void>((res) => ff.stdin.once('drain', () => res()));
        n++;
      }
      console.log(`part ${i} done (${n} frames, ${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code: number) => {
    spawnSync('rm', ['-rf', dir]);
    console.log('ffmpeg done', code, out, n, 'frames');
  });
}

function stills(out: string, which: string): void {
  mkdirSync(out, { recursive: true });
  PARTS.forEach((p, i) => {
    if (which && !which.split(',').includes(String(i))) return;
    for (const k of [0.3, 0.5, 0.75]) savePng(filmFrame(p, p.long * k), `${out}/p${String(i).padStart(2, '0')}_${k}.png`);
  });
}

// =============================================================================================
// THE KING'S SHADOW'S CROWN'S WEIGHT: its sheet of key frames and its short film (the knight walking under it, the crown following him)

const CK = ROYALS.king;
/** Where the knight is (tiles forward of the shadow's mark, and to its left), `t` seconds into its move: standing; stepping to one side and back as the crown follows him; standing under it as it hangs. */
function knightAt(t: number, dist: number): [number, number] {
  const seg = (a: number, b: number, x: number, y: number): number => x + (y - x) * Math.max(0, Math.min(1, (t - a) / (b - a)));
  const sway = dist < 3 ? 0.5 : 1;
  const side = sway * (t < 2.5 ? seg(1.6, 2.2, 0, 1.5) : seg(2.5, 3.4, 1.5, -0.75));
  return [dist, side];
}
const CROWN_PATH = new Map<number, [number, number][]>();
/** Where the crown's floor point is (as the knight's), `t` seconds into the move: out from the shadow to over the knight; after him at its pace; held; home. */
function crownFloorAt(t: number, dist: number): [number, number] | null {
  const s = t - KG_WEIGHT.send;
  if (s < 0 || s >= WEIGHT_FX.long) return null;
  let path = CROWN_PATH.get(dist);
  if (!path) {
    path = [];
    const dt = 1 / 240;
    let P: [number, number] = [0, 0];
    let slam: [number, number] = [0, 0];
    for (let i = 0; i * dt <= WEIGHT_FX.long + 0.01; i++) {
      const u = i * dt;
      const w = shadowCrownAt(u, 'front');
      const K = knightAt(u + KG_WEIGHT.send, dist);
      if (w.phase === 'fly') P = [K[0] * w.lerp, K[1] * w.lerp];
      else if (w.phase === 'follow') {
        const d = Math.hypot(K[0] - P[0], K[1] - P[1]);
        const step = Math.min(d, SHADOW_WEIGHT.pace * dt);
        if (d > 1e-9) P = [P[0] + ((K[0] - P[0]) * step) / d, P[1] + ((K[1] - P[1]) * step) / d];
        slam = P;
      } else if (w.phase === 'home') P = [slam[0] * (1 - w.lerp), slam[1] * (1 - w.lerp)];
      else if (w.phase !== 'back') slam = P;
      path.push(P);
    }
    CROWN_PATH.set(dist, path);
  }
  return path[Math.min(path.length - 1, Math.round(s * 240))];
}
/** The scene at a moment of the move, in a box of the picture: the floor, the crown's floor, the shadow, the knight, the crown. `mark`: where the shadow's mark is on the picture. */
function crownScene(px: Px, box: { x: number; y: number; w: number; h: number }, t: number, view: GameView, mark: [number, number], dist: number, S2: number): void {
  const clip = (X: number, Y: number): boolean => X >= box.x + 1 && X < box.x + box.w - 1 && Y >= box.y + 1 && Y < box.y + box.h - 1;
  const on = (fwd: number, side: number): [number, number] => {
    const [x, y] = forward(CK, view, fwd, side);
    return [mark[0] + x * S2, mark[1] + y * S2];
  };
  const T = Math.min(t, longOf(CK, 'weight'));
  const s = T - KG_WEIGHT.send;
  const cp = crownFloorAt(T, dist);
  if (cp) {
    // (what it lays on the floor goes with it until it lands, and stays where it fell)
    const fp = s >= WEIGHT_FX.drop[1] - 1e-6 ? crownFloorAt(KG_WEIGHT.hit, dist) ?? cp : cp;
    const [x, y] = on(fp[0], fp[1]);
    lay(px, laid(weightFx(s, view, 'floor')), x, y, S2, clip);
  }
  const [k0, k1] = knightAt(T, dist);
  const figs: { y: number; draw: () => void }[] = [];
  const [fx, fy] = on(0, 0);
  figs.push({ y: fy, draw: () => { shadow(px, fx, fy, 10, S2); lay(px, laid(shadowFrame(CK, 'weight', T, view)), fx, fy, S2, clip); } });
  const [kx, ky] = on(k0, k1);
  figs.push({ y: ky, draw: () => { shadow(px, kx, ky, 9, S2); lay(px, knight(view === 'front' ? 'back' : 'front', Math.floor(t * 6)), kx, ky, S2, clip, true); } });
  for (const g of figs.sort((a, b) => a.y - b.y)) g.draw();
  if (cp) {
    const [x, y] = on(cp[0], cp[1]);
    lay(px, laid(weightFx(s, view, 'crown')), x, y, S2, clip);
  }
}
/** Where to put the shadow's mark in a box so that it, the knight wherever he goes, the ring round him and the crown over him all fit, in its middle. */
function markIn(box: { x: number; y: number; w: number; h: number }, view: GameView, dist: number, S2: number): [number, number] {
  const pts: [number, number][] = [];
  const add = (fwd: number, side: number, up: number, wide: number): void => {
    const [x, y] = forward(CK, view, fwd, side);
    pts.push([x - wide, y - up], [x + wide, y + 6]);
  };
  add(0, 0, 80, 45);
  const r = SHADOW_WEIGHT.rolls;
  for (const side of [-0.75, 1.5]) {
    for (const [df, ds] of [[r, 0], [-r, 0], [0, r], [0, -r]]) add(dist + df, side + ds, 0, 0);
    add(dist, side, 135, 40);
  }
  const x0 = Math.min(...pts.map((p) => p[0]));
  const x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1]));
  const y1 = Math.max(...pts.map((p) => p[1]));
  return [Math.round(box.x + box.w / 2 - ((x0 + x1) / 2) * S2), Math.round(box.y + box.h / 2 - ((y0 + y1) / 2) * S2)];
}

/** The same, for one moment: the shadow, the knight where he is then, the ring round him, the crown over where it is. */
function markAt(box: { x: number; y: number; w: number; h: number }, view: GameView, t: number, dist: number, S2: number): [number, number] {
  const pts: [number, number][] = [];
  const add = (fwd: number, side: number, up: number, wide: number): void => {
    const [x, y] = forward(CK, view, fwd, side);
    pts.push([x - wide, y - up], [x + wide, y + 6]);
  };
  add(0, 0, 80, 48);
  const r = SHADOW_WEIGHT.r * 1.5;
  const [k0, k1] = knightAt(t, dist);
  for (let q = 0; q < 8; q++) add(k0 + r * Math.cos((q * Math.PI) / 4), k1 + r * Math.sin((q * Math.PI) / 4), 0, 0);
  add(k0, k1, 62, 24);
  const cp = crownFloorAt(t, dist);
  if (cp) add(cp[0], cp[1], shadowCrownAt(t - KG_WEIGHT.send, view).c[2] + 40, 40);
  const x0 = Math.min(...pts.map((p) => p[0]));
  const x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1]));
  const y1 = Math.max(...pts.map((p) => p[1]));
  return [Math.round(box.x + box.w / 2 - ((x0 + x1) / 2) * S2), Math.round(box.y + 14 + box.h / 2 - ((y0 + y1) / 2) * S2)];
}

function crownSheet(out: string): void {
  const S2 = 2;
  const W = 1200;
  const top = 96;
  const rows: { view: GameView; h: number; keys: [number, string][] }[] = [
    { view: 'front', h: 360, keys: [[0.8, 'Gathered: trembling up off its head'], [1.27, 'Sent up: grown, flying out over you'], [2.4, 'Following you, the pink ring under it']] },
    { view: 'front', h: 360, keys: [[3.85, 'Held: the ring lit, a ring closing in'], [122 / 30, 'The drop (two frames), smeared'], [4.12, 'Slammed: flash, stones cracked']] },
    { view: 'back', h: 480, keys: [[2.6, 'From behind: following you'], [3.85, 'From behind: held over you'], [4.85, 'From behind: flying home']] },
  ];
  const H = top + rows.reduce((a, r) => a + r.h, 0);
  const px = towerFloor(W, H, W / 2, H / 2, S2);
  const labels: { text: string; x: number; y: number; size: number; bold?: boolean }[] = [];
  let y = top;
  for (const row of rows) {
    row.keys.forEach(([t, label], i) => {
      const box = { x: i * 400, y, w: 400, h: row.h };
      crownScene(px, box, t, row.view, markAt(box, row.view, t, 2.5, S2), 2.5, S2);
      for (let Y = box.y; Y < box.y + box.h; Y++) for (const X of [box.x, box.x + box.w - 1]) if (X > 0 && X < W - 1) px.d.set([7, 6, 12, 255], (Y * W + X) * 4);
      for (let X = 0; X < W; X++) px.d.set([7, 6, 12, 255], (box.y * W + X) * 4);
      labels.push({ text: `${t.toFixed(2)} s  ${label}`, x: box.x + 12, y: box.y + 10, size: 17, bold: false });
    });
    y += row.h;
  }
  const raw = `${out}.raw.png`;
  savePng(px, raw);
  captioned(raw, out, [
    { text: 'THE KING’S SHADOW: THE CROWN’S WEIGHT', x: 18, y: 14, size: 32 },
    { text: `A shadow crown, 0.64 of the King’s: follows you at ${SHADOW_WEIGHT.pace} tiles a second, ring ${SHADOW_WEIGHT.r.toFixed(2)} tiles (his 1.7). Twice as big.`, x: 18, y: 58, size: 19, bold: false },
    ...labels,
  ]);
  spawnSync('rm', ['-f', raw]);
  console.log('wrote', out);
}

const CW = 1200;
const CH = 600;
const CPARTS: { title: string; line: string; from: number; to: number; speed: number }[] = [
  { title: 'THE KING’S SHADOW: THE CROWN’S WEIGHT', line: 'Sent up off its head, the shadow crown follows you, hangs, slams down, and flies home.', from: 0, to: 5.9, speed: 1 },
  { title: 'AT HALF SPEED: SENT UP', line: 'Gathered, flung up: it grows to 5.2 times its size and flies out over you.', from: 0.75, to: 1.9, speed: 0.5 },
  { title: 'AT HALF SPEED: HELD, THE SLAM, HOME', line: 'The pink ring lit: it stops, rises, trembles; it drops in two frames; it lies ringing; it flies home.', from: 3.4, to: 5.45, speed: 0.5 },
];
function crownFilm(out: string): void {
  const S2 = 2;
  const half = CW / 2;
  const FLOOR2 = towerFloor(CW, CH, CW / 2, CH / 2 + 40, S2);
  const dir = `${out}.captions`;
  mkdirSync(dir, { recursive: true });
  const filters: string[] = [];
  let at = 0;
  CPARTS.forEach((p, i) => {
    const long = (p.to - p.from) / p.speed;
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${FONT}:textfile=${dir}/t${i}.txt:x=18:y=14:fontsize=28:fontcolor=0xe6e0d3:box=1:boxcolor=0x0e0e10@0.6:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${FONT2}:textfile=${dir}/l${i}.txt:x=18:y=${CH - 40}:fontsize=19:fontcolor=0xc6c1b8:box=1:boxcolor=0x0e0e10@0.6:boxborderw=8${en}`);
    at += long;
  });
  filters.push(`drawtext=fontfile=${FONT2}:text='in front':x=18:y=60:fontsize=19:fontcolor=0x858483`);
  filters.push(`drawtext=fontfile=${FONT2}:text='from behind':x=${half + 18}:y=60:fontsize=19:fontcolor=0x858483`);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${CW}x${CH}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = new Uint8Array(CW * CH * 3);
  let n = 0;
  const write = async (): Promise<void> => {
    for (const p of CPARTS) {
      const frames = Math.round(((p.to - p.from) / p.speed) * FPS);
      for (let f = 0; f < frames; f++) {
        const t = p.from + (f / FPS) * p.speed;
        const px = new Px(CW, CH);
        px.d.set(FLOOR2.d);
        for (const [i, view] of (['front', 'back'] as const).entries()) {
          const box = { x: i * half, y: 90, w: half, h: CH - 140 };
          crownScene(px, { x: i * half, y: 0, w: half, h: CH }, t, view, markIn(box, view, 3.5, S2), 3.5, S2);
        }
        for (let y = 0; y < CH; y++) for (const x of [half - 1, half]) px.d.set([7, 6, 12, 255], (y * CW + x) * 4);
        for (let k = 0, j = 0; k < CW * CH * 4; k += 4, j += 3) {
          rgb[j] = px.d[k];
          rgb[j + 1] = px.d[k + 1];
          rgb[j + 2] = px.d[k + 2];
        }
        if (!ff.stdin.write(rgb)) await new Promise<void>((res) => ff.stdin.once('drain', () => res()));
        n++;
      }
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code: number) => {
    spawnSync('rm', ['-rf', dir]);
    console.log('ffmpeg done', code, out, n, 'frames');
  });
}
function crownStills(out: string, ts: string): void {
  mkdirSync(out, { recursive: true });
  for (const t of ts.split(',').map(Number)) {
    const px = towerFloor(CW, CH, CW / 2, CH / 2 + 40, 2);
    for (const [i, view] of (['front', 'back'] as const).entries()) {
      const box = { x: i * (CW / 2), y: 90, w: CW / 2, h: CH - 140 };
      crownScene(px, { x: i * (CW / 2), y: 0, w: CW / 2, h: CH }, t, view, markIn(box, view, 3.5, 2), 3.5, 2);
    }
    savePng(px, `${out}/c_${t.toFixed(3)}.png`);
  }
}

// =============================================================================================
// THE KING'S SHADOW'S CHARGE: its sheet of key frames and its short film (the knight stepping out of its way, and out of reach of its sparks)

/** Where the knight is (tiles forward of the shadow's mark, and to its left), `t` seconds into its charge: before it; stepping aside in its warning; out of reach of its line as its sparks gather. */
function knightC(t: number): [number, number] {
  const seg = (a: number, b: number, x: number, y: number): number => x + (y - x) * Math.max(0, Math.min(1, (t - a) / (b - a)));
  return [3.5, t < 1.8 ? seg(0.35, 0.85, 0, 1.2) : seg(1.8, 2.15, 1.2, 2.1)];
}
/** The scene at a moment of its charge, in a box of the picture: the floor, its line of sparks, the shadow carried along, the knight. */
function chargeScene(px: Px, box: { x: number; y: number; w: number; h: number }, t: number, view: GameView, mark: [number, number], S2: number): void {
  const clip = (X: number, Y: number): boolean => X >= box.x + 1 && X < box.x + box.w - 1 && Y >= box.y + 1 && Y < box.y + box.h - 1;
  const on = (fwd: number, side: number): [number, number] => {
    const [x, y] = forward(CK, view, fwd, side);
    return [mark[0] + x * S2, mark[1] + y * S2];
  };
  const [lx, ly] = on(0, 0);
  lay(px, laid(sparksFx(t - KG_CHARGE.run[0], view)), lx, ly, S2, clip);
  const figs: { y: number; draw: () => void }[] = [];
  const [fx, fy] = on(chargeCarriedTiles(t), 0);
  figs.push({ y: fy, draw: () => { shadow(px, fx, fy, 10, S2); lay(px, laid(shadowFrame(CK, 'attack', Math.min(t, KG_CHARGE.long), view)), fx, fy, S2, clip); } });
  const [k0, k1] = knightC(t);
  const [kx, ky] = on(k0, k1);
  figs.push({ y: ky, draw: () => { shadow(px, kx, ky, 9, S2); lay(px, knight(view === 'front' ? 'back' : 'front', Math.floor(t * 6)), kx, ky, S2, clip, true); } });
  for (const g of figs.sort((a, b) => a.y - b.y)) g.draw();
}
/** How far a picture reaches round its floor point (picture pixels): left, right, up, down. */
function reachOf(f: { px: Px; ax: number; ay: number }): [number, number, number, number] {
  const { w, h, d } = f.px;
  let x0 = w;
  let x1 = 0;
  let y0 = h;
  let y1 = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  return x1 < x0 ? [0, 0, 0, 0] : [f.ax - x0, x1 - f.ax, f.ay - y0, y1 - f.ay];
}
/** Where to put the shadow's mark in a box so that what is listed fits in its middle: points on the floor (tiles forward, to its left) and how far round them it reaches (left, right, up, down; picture pixels). */
function fitMark(box: { x: number; y: number; w: number; h: number }, view: GameView, S2: number, items: [number, number, [number, number, number, number]][]): [number, number] {
  const pts: [number, number][] = [];
  for (const [fwd, side, [l, r, u, d]] of items) {
    const [x, y] = forward(CK, view, fwd, side);
    pts.push([x - l, y - u], [x + r, y + d]);
  }
  const x0 = Math.min(...pts.map((p) => p[0]));
  const x1 = Math.max(...pts.map((p) => p[0]));
  const y0 = Math.min(...pts.map((p) => p[1]));
  const y1 = Math.max(...pts.map((p) => p[1]));
  return [Math.round(box.x + box.w / 2 - ((x0 + x1) / 2) * S2), Math.round(box.y + box.h / 2 - ((y0 + y1) / 2) * S2)];
}
/** What a moment of the charge shows: the shadow where it is (as far as its picture reaches), the knight, and (from when it is cut) the line and the reach of its sparks. */
function chargeItems(t: number, view: GameView, whole: boolean): [number, number, [number, number, number, number]][] {
  const S = SHADOW_CHARGE;
  const at = chargeCarriedTiles(t);
  const items: [number, number, [number, number, number, number]][] = [];
  for (const [tt, f] of whole ? [[0.5, 0], [2.1, S.most]] : [[t, at]]) items.push([f, 0, reachOf(shadowFrame(CK, 'attack', Math.min(tt, KG_CHARGE.long), view))]);
  const kn = reachOf(knight(view === 'front' ? 'back' : 'front'));
  const kr: [number, number, number, number] = [Math.max(kn[0], kn[1]), Math.max(kn[0], kn[1]), kn[2], kn[3]];
  if (whole) for (const tt of [0, 1.0, 2.2]) items.push([...knightC(tt), kr]);
  else items.push([...knightC(t), kr]);
  const end = whole ? S.most : at;
  if (whole || t > KG_CHARGE.run[0]) {
    for (const f of [-S.tail - 0.2, end - S.tail]) for (const side of [-S.reach, S.reach]) items.push([f, side, [0, 0, 0, 0]]);
    if (whole || t > KG_CHARGE.burst) for (const f of [-S.tail, end - S.tail]) items.push([f, 0, [0, 0, (S.high + S.r) * TILE3, 0]]);
  }
  return items;
}

function chargeSheet(out: string): void {
  const S2 = 2;
  const W = 1200;
  const top = 96;
  const rows: { h: number; cells: [number, GameView, string][] }[] = [
    { h: 400, cells: [[0.55, 'front', 'The warning: crouched, blade dragged'], [0.8, 'back', 'From behind: the strike, bursting off, smeared']] },
    { h: 430, cells: [[1.2, 'front', 'The run: carried 7.68 tiles a second, cutting the line, sparks off its point']] },
    { h: 470, cells: [[2.05, 'back', 'From behind: stopped, the blade ripped up; the held beat, the line white, its sparks beaded']] },
    { h: 450, cells: [[2.45, 'front', 'Its sparks shot off the line, popping in shrapnel: they hit within 1.66 tiles of it']] },
  ];
  const H = top + rows.reduce((a, r) => a + r.h, 0);
  const px = towerFloor(W, H, W / 2, H / 2, S2);
  const labels: { text: string; x: number; y: number; size: number; bold?: boolean }[] = [];
  let y = top;
  for (const row of rows) {
    const cw = W / row.cells.length;
    row.cells.forEach(([t, view, label], i) => {
      const box = { x: i * cw, y, w: cw, h: row.h };
      const inner = { x: box.x, y: box.y + 30, w: box.w, h: box.h - 30 };
      chargeScene(px, box, t, view, fitMark(inner, view, S2, chargeItems(t, view, false)), S2);
      for (let Y = box.y; Y < box.y + box.h; Y++) for (const X of [box.x, box.x + box.w - 1]) if (X > 0 && X < W - 1) px.d.set([7, 6, 12, 255], (Y * W + X) * 4);
      for (let X = 0; X < W; X++) px.d.set([7, 6, 12, 255], (box.y * W + X) * 4);
      labels.push({ text: `${t.toFixed(2)} s  ${label}`, x: box.x + 12, y: box.y + 10, size: 17, bold: false });
    });
    y += row.h;
  }
  const raw = `${out}.raw.png`;
  savePng(px, raw);
  captioned(raw, out, [
    { text: 'THE KING’S SHADOW: THE CHARGE', x: 18, y: 14, size: 32 },
    { text: `0.64 of the King’s: carried ${SHADOW_CHARGE.pace.toFixed(2)} tiles a second, ${SHADOW_CHARGE.most.toFixed(2)} tiles (his 12 and 9); its sparks reach ${SHADOW_CHARGE.reach.toFixed(2)} (his 2.6). Twice as big.`, x: 18, y: 58, size: 19, bold: false },
    ...labels,
  ]);
  spawnSync('rm', ['-f', raw]);
  console.log('wrote', out);
}

const KW = 1200;
const KPH = 520;
const KH = 50 + 2 * KPH + 44;
const KPARTS: { title: string; line: string; from: number; to: number; speed: number }[] = [
  { title: 'THE KING’S SHADOW: THE CHARGE', line: 'Blade dragged, it bursts off its mark and runs, cutting a line in the stones; its sparks shoot off and pop.', from: 0, to: 3.3, speed: 1 },
  { title: 'AT HALF SPEED: THE STRIKE AND THE RUN', line: 'The warning held; it bursts off its mark in two frames, smeared; carried 7.68 tiles a second, its feet gripping.', from: 0.55, to: 1.75, speed: 0.5 },
  { title: 'AT HALF SPEED: THE SPARKS', line: 'The line white, its sparks beaded; they shoot off the line and pop in shrapnel; smoke, the scar.', from: 1.95, to: 2.95, speed: 0.5 },
];
function chargeFilm(out: string): void {
  const S2 = 2;
  const FLOOR3 = towerFloor(KW, KH, KW / 2, KH / 2, S2);
  const dir = `${out}.captions`;
  mkdirSync(dir, { recursive: true });
  const filters: string[] = [];
  let at = 0;
  KPARTS.forEach((p, i) => {
    const long = (p.to - p.from) / p.speed;
    writeFileSync(`${dir}/t${i}.txt`, p.title);
    writeFileSync(`${dir}/l${i}.txt`, p.line);
    const en = `:enable='between(t,${at.toFixed(3)},${(at + long - 0.001).toFixed(3)})'`;
    filters.push(`drawtext=fontfile=${FONT}:textfile=${dir}/t${i}.txt:x=18:y=10:fontsize=28:fontcolor=0xe6e0d3:box=1:boxcolor=0x0e0e10@0.6:boxborderw=8${en}`);
    filters.push(`drawtext=fontfile=${FONT2}:textfile=${dir}/l${i}.txt:x=18:y=${KH - 34}:fontsize=19:fontcolor=0xc6c1b8:box=1:boxcolor=0x0e0e10@0.6:boxborderw=8${en}`);
    at += long;
  });
  filters.push(`drawtext=fontfile=${FONT2}:text='in front':x=18:y=58:fontsize=19:fontcolor=0x858483`);
  filters.push(`drawtext=fontfile=${FONT2}:text='from behind':x=18:y=${50 + KPH + 8}:fontsize=19:fontcolor=0x858483`);
  const boxes = (['front', 'back'] as const).map((view, i) => {
    const box = { x: 0, y: 50 + i * KPH, w: KW, h: KPH };
    return { view, box, mark: fitMark({ ...box, y: box.y + 20, h: box.h - 20 }, view, S2, chargeItems(0, view, true)) };
  });
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${KW}x${KH}`, '-r', String(FPS), '-i', '-', '-vf', filters.join(','), '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-tune', 'animation', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  const rgb = new Uint8Array(KW * KH * 3);
  let n = 0;
  const write = async (): Promise<void> => {
    for (const p of KPARTS) {
      const frames = Math.round(((p.to - p.from) / p.speed) * FPS);
      for (let f = 0; f < frames; f++) {
        const t = p.from + (f / FPS) * p.speed;
        const px = new Px(KW, KH);
        px.d.set(FLOOR3.d);
        for (const b of boxes) chargeScene(px, b.box, t, b.view, b.mark, S2);
        for (let x = 0; x < KW; x++) for (const y of [50 + KPH - 1, 50 + KPH]) px.d.set([7, 6, 12, 255], (y * KW + x) * 4);
        for (let k = 0, j = 0; k < KW * KH * 4; k += 4, j += 3) {
          rgb[j] = px.d[k];
          rgb[j + 1] = px.d[k + 1];
          rgb[j + 2] = px.d[k + 2];
        }
        if (!ff.stdin.write(rgb)) await new Promise<void>((res) => ff.stdin.once('drain', () => res()));
        n++;
      }
    }
    ff.stdin.end();
  };
  void write();
  ff.on('close', (code: number) => {
    spawnSync('rm', ['-rf', dir]);
    console.log('ffmpeg done', code, out, n, 'frames');
  });
}

const [mode = 'sheet', a1 = 'royal_shadows_sheet.png', a2 = ''] = ARGV.slice(2);
if (mode === 'chargesheet') chargeSheet(a1);
if (mode === 'chargefilm') chargeFilm(a1);
if (mode === 'crownsheet') crownSheet(a1);
if (mode === 'crownfilm') crownFilm(a1);
if (mode === 'crownstills') crownStills(a1, a2);
if (mode === 'sheet') sheet(a1);
if (mode === 'film') film(a1, a2);
if (mode === 'stills') stills(a1, a2);
if (mode === 'parts') PARTS.forEach((p, i) => console.log(i, p.title, p.long.toFixed(2)));
