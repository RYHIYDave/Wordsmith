// THE SHADOWS OF THE FOUR ROYALS' PICTURES, made outside a browser (Node): the sheet and the film. Nothing of the game
// imports it.
//   npx tsx src/dev/preview_royal_shadows.ts sheet <out.png>
//   npx tsx src/dev/preview_royal_shadows.ts film <out.mp4> [only: a part's number]
//   npx tsx src/dev/preview_royal_shadows.ts stills <out dir>        (the film's parts, a few frames of each, as stills)
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
import { CARD, DEATH, MASKS_SHADOW_FLIGHT, SHADOW_CROWN, SHADOW_MASKS, SHADOW_SNARE, blinkFrame, cardPx, crownFx, deathFrame, masksFx, snareFx } from '../art/royal_shadows_fx';
import { PR_SNARE } from '../art/princess_moves';
import { PC_MASKS } from '../art/prince_moves';
import { KG_CROWN } from '../art/king_moves';
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
  const basic: Record<string, string> = { princess: 'The nettle vine lash (her basic attack)', prince: 'The rapier thrust (his basic attack)', queen: 'The comb (her basic attack)', king: 'The great sword’s sweep (his basic attack)' };
  P.push({ r, title: `${name}: ${basic[r.id].split(' (')[0].toUpperCase()}`, line: `${basic[r.id]}: the boss's own blow, wind-up, a two-frame strike, wind-down.`, long: longOf(r, 'attack') + 0.2, at: (t, v) => ({ f: shadowFrame(r, 'attack', Math.min(t, longOf(r, 'attack')), v), ...at0 }) });
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
    const L = KG_CROWN.hit + 1.7;
    const carry = (t: number): number => SHADOW_CROWN.carry * Math.max(0, Math.min(1, (t - KG_CROWN.air[0]) / (KG_CROWN.air[1] - KG_CROWN.air[0])));
    P.push({ r, title: `${name}: THE CROWN, SMALL`, line: 'A leap of 2.5 tiles (his 5) and a slam; its ring rolls out 4 tiles (his 10).', long: L, at: (t, v) => ({ f: shadowFrame(r, 'crown', Math.min(t, longOf(r, 'crown')), v), fwd: carry(t) - 1, knight: KNIGHT_AT, under: [{ f: crownFx(t - KG_CROWN.hit, v), fwd: carry(t) - 1 }] }) });
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

const [mode = 'sheet', a1 = 'royal_shadows_sheet.png', a2 = ''] = ARGV.slice(2);
if (mode === 'sheet') sheet(a1);
if (mode === 'film') film(a1, a2);
if (mode === 'stills') stills(a1, a2);
if (mode === 'parts') PARTS.forEach((p, i) => console.log(i, p.title, p.long.toFixed(2)));
