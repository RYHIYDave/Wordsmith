// Dev page: THE BOSSES OF DUNGEONS 2 TO 4 (a mock-up: NOT IN THE GAME): the Headsman, the Chained One
// and the ossuary amalgamation (art/bosses3.ts), on a piece of the dungeon's own floor with the dark
// of a dungeon over it, beside the Warden and the knight for size. (docs/mockups/bosses/README.md)
//   node tools/preview.mjs src/dev/preview_bosses.ts previews/bosses/lineup.png 1600 900 "lineup"
//   hash = lineup[:<scale>]: every boss made so far standing, facing you, beside the Warden, a
//            skeleton and the knight
//          sheet:<boss>[:<scale>]: standing, facing you and away, beside the Warden and the knight;
//            under them some of his moves
//          pose:<boss>:<move>:<seconds>:<front | back>[:<scale>]: one frame, big
//          poses:<boss>:<move>:<seconds,seconds,...>[:<scale>]: a row of frames, facing you and away
//          move:<boss>:<move>[:<scale>], walk:<boss>[:<scale>], death:<boss>[:<scale>]: films (see FILMS, below)
import { makeGroundArt } from '../art/ground';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { makeSkeletonArt3 } from '../art/monster_bones3';
import { makeWardenArt } from '../art/monster_warden';
import { MOVES3 } from '../art/moves3';
import { AMALGAM, AXE_SHOT_FRAMES, BALL_SHOT_FRAMES, CHAINED, CHAINED_FREED, CO_BALL_BACK, CO_SNAP_BALL, CO_SNAP_L, makeLeftBehindArt, CO_BALL_LAND, CO_BALL_LET, CO_BALL_REACH, CO_HOOK_BACK, CO_HOOK_BITE, CO_HOOK_LET, CO_HOOK_REACH, CO_LASH_HIT, CO_WHIRL_FROM, CO_WHIRL_TO, HEADSMAN, HOOK_SHOT_FRAMES, coBallPath, coCollarAt, coCuffAt, coHookPath, coWhirlReach, makeBallShotArt, makeHookShotArt, HS_CATCH, HS_CHOP_HIT, HS_SENTENCE_HIT, HS_SWEEP_FROM, HS_SWEEP_TO, HS_THROW_HIT, axeOf, hsBite, hsSweepReach, makeAxeShotArt } from '../art/bosses3';
import { SENTENCE_FROM, drawAxeShadow, drawBallCrash, drawBallShadow, drawChainOut, drawChopCrack, drawScrape, drawSentenceLine, drawSentenceSplit, drawSweepRing, drawThrowPath, throwPathAt } from '../art/boss_shots';
import type { FloorAt } from '../art/mob_shots';
import { TILE3, canvasOf, deathOfMob, handAt, paintMob, paintViewOf, posedOfMob, skeletonAt } from '../art/new_mobs3';
import type { Mob } from '../art/new_mobs3';
import type { GameView, PaintView } from '../art/skin';
import { drawAura, drawLights } from '../engine/px';
import type { Sprite } from '../engine/px';

const parts = decodeURIComponent(location.hash.slice(1)).split(':');
const mode = parts[0] || 'lineup';

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
/** (a canvas in the game's own pixels, for what is drawn on the floor: `inGamePixels`) */
const low = document.createElement('canvas');
/** The dungeon's floor in the game's pixels, from a point of it in tiles (the figure stands at 0, 0). */
const ISO: FloorAt = (x, y) => [(x - y) * 16, (x + y) * 8];
/** A point before him and to his left (tiles) as a point of the floor, as he is seen: facing you (along the floor's x) or away (along its -y; his left to the right of the picture as the heroes are seen from behind, or to its left as the camera truly sees him: `rear`). */
const floorOf = (view: PaintView, fwd: number, left: number): [number, number] => (view === 'front' ? [fwd, -left] : view === 'rear' ? [-left, -fwd] : [left, -fwd]);
/** A point of the figure (its own lengths) as a point of the floor before him and to his left (tiles), and a height (the game's pixels). */
const tilesOf = (p: readonly number[]): [number, number, number] => [p[0] / TILE3, p[1] / TILE3, p[2] / 2];

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
 * of light, itself and its lights. `S`: screen pixels to a picture pixel. (As preview_leaders.ts.)
 */
function pane(x: number, y: number, w: number, h: number, S: number, who: ReadonlyArray<{ sp: Sprite; fx: number; fy: number; shadow: number }>, marks?: () => void): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.fillStyle = '#07061a';
  g.fillRect(x, y, w, h);
  g.imageSmoothingEnabled = false;
  const fx0 = who.length ? who[0].fx : x + w / 2;
  const fy0 = who.length ? who[0].fy : y + h / 2;
  const span = Math.ceil(w / (32 * S)) + 6;
  for (let ty = -span; ty <= span; ty++) {
    for (let tx = -span; tx <= span; tx++) {
      const px = fx0 + (tx - ty) * 32 * S;
      const py = fy0 + (tx + ty) * 16 * S - 16 * S;
      if (px < x - 70 * S || px > x + w + 70 * S || py < y - 40 * S || py > y + h + 40 * S) continue;
      const sp = ground.floor(tx + 20, ty + 20);
      g.drawImage(sp.img, px - sp.ax * 2 * S, py - sp.ay * 2 * S, sp.img.width * S, sp.img.height * S);
    }
  }
  g.fillStyle = 'rgba(6,4,14,0.55)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  for (const f of who) {
    const r = Math.max(60, (f.shadow + 50) * S);
    const lit = g.createRadialGradient(f.fx, f.fy - 24 * S, 0, f.fx, f.fy - 24 * S, r);
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

const BOSSES: Record<string, { mob: Mob; title: string; short: string; walkSaid?: string; struckSaid?: string; deathSaid?: string }> = {
  headsman: { mob: HEADSMAN, title: 'The Headsman', short: 'The Headsman', walkSaid: 'His walk: slow and heavy, his axe across him', struckSaid: 'Struck: he barely gives', deathSaid: 'His hood falls empty' },
  chained: { mob: CHAINED, title: 'The Chained One', short: 'The Chained One', walkSaid: 'His walk: a starved giant’s lurching shamble, his chains dragging, the ball scraping behind him', struckSaid: 'Struck: he jerks back from it, his chains rattling', deathSaid: 'His chains drag him down' },
  chained1: { mob: CHAINED_FREED[1], title: 'The Chained One, his left chain off', short: 'His left chain off', walkSaid: 'His walk, his left chain off', struckSaid: 'Struck', deathSaid: 'His chains drag him down' },
  chained2: { mob: CHAINED_FREED[2], title: 'The Chained One, free of the ball', short: 'Free of the ball', walkSaid: 'His walk, free of the ball', struckSaid: 'Struck', deathSaid: 'His chains drag him down' },
  amalgam: { mob: AMALGAM, title: 'The Ossuary Amalgamation', short: 'The amalgamation' },
};
const spOf = (mob: Mob, which: string, t: number, view: GameView): Sprite =>
  which === 'die' ? toSprite(deathOfMob(mob, t / mob.dieTime, view), null, canvasOf(mob).ax, canvasOf(mob).ay) : toSprite(paintMob(mob, which, t, view), mob.aura, canvasOf(mob).ax, canvasOf(mob).ay);
const KNIGHT = (): Sprite => spriteOf3(MOVES3.rear, 0, 'front');

/** A row of figures on one pane, each with its name and a line under it. */
function row(list: { sp: Sprite; name: string; line: string; shadow: number; gold: boolean; under?: (c: CanvasRenderingContext2D) => void }[], y: number, S: number, PAD: number, W: number): number {
  const GAP = 16;
  // (a cell as wide as the figure reaches both ways, its floor point where its left reach puts it: a figure reaching far one way, as with his axe in the floor, is not cut off)
  const cellOf = (sp: Sprite): [number, number] => {
    const [l, r] = reachOf(sp);
    const cw = Math.max(l + r, 62);
    return [cw, l + (cw - l - r) / 2];
  };
  const [, , up, down] = reachAll(list.map((f) => f.sp));
  const wide = list.reduce((a, f) => a + cellOf(f.sp)[0] + GAP, GAP);
  const h = (up + down + 14) * S;
  let x = PAD + (W - PAD * 2 - wide * S) / 2 + GAP * S;
  const at = list.map((f) => {
    const [cw, l] = cellOf(f.sp);
    const fx = x + l * S;
    x += (cw + GAP) * S;
    return { sp: f.sp, fx, fy: y + (up + 7) * S, shadow: f.shadow };
  });
  pane(PAD, y, W - PAD * 2, h, S, at, () =>
    at.forEach((w, i) => {
      const under = list[i].under;
      if (under) inGamePixels(PAD, y, W - PAD * 2, h, w.fx, w.fy, S, under);
    }),
  );
  at.forEach((w, i) => {
    text(list[i].name, w.fx, y + h + 6, 17, list[i].gold ? '#ffd866' : '#cfc8ff', 700, 'center');
    text(list[i].line, w.fx, y + h + 27, 14, '#a8a2b8', 500, 'center');
  });
  return h + 50;
}
function widthOf(list: { sp: Sprite }[], S: number, PAD: number): number {
  const GAP = 16;
  return list.reduce((a, f) => {
    const [l, r] = reachOf(f.sp);
    return a + Math.max(l + r, 62) + GAP;
  }, GAP) * S + PAD * 2;
}

if (mode === 'lineup') {
  const S = Number(parts[1]) || 2;
  const PAD = 14;
  const list = [
    { sp: KNIGHT(), name: 'The knight', line: 'a hero, for size', shadow: 12, gold: false },
    { sp: makeSkeletonArt3().front.idle[0], name: 'A skeleton', line: 'for size', shadow: 10, gold: false },
    { sp: makeWardenArt().front.idle[0], name: 'The Warden', line: 'dungeon 1’s boss', shadow: 28, gold: false },
    ...Object.values(BOSSES).map((b) => ({ sp: spOf(b.mob, 'stand', 0, 'front'), name: b.short, line: 'facing you', shadow: b.mob.shadow, gold: true })),
  ];
  const W = Math.max(900, widthOf(list, S, PAD));
  const [, , up, down] = reachAll(list.map((f) => f.sp));
  cv.width = W;
  cv.height = 70 + (up + down + 14) * S + 50 + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('The bosses of dungeons 2 to 4', PAD, 12, 26, '#ffd866', 700);
  text('a mock-up: not in the game', PAD, 44, 16, '#cfc8ff', 600);
  row(list, 70, S, PAD, W);
  win.__ready = true;
}

if (mode === 'sheet') {
  const who = BOSSES[parts[1] || 'headsman'] ?? BOSSES.headsman;
  const S = Number(parts[2]) || 2;
  const PAD = 14;
  const row1 = [
    { sp: KNIGHT(), name: 'The knight', line: 'a hero, for size', shadow: 12, gold: false },
    { sp: makeWardenArt().front.idle[0], name: 'The Warden', line: 'dungeon 1’s boss', shadow: 28, gold: false },
    { sp: spOf(who.mob, 'stand', 0, 'front'), name: who.short, line: 'facing you', shadow: who.mob.shadow, gold: true },
    { sp: spOf(who.mob, 'stand', 0, 'back'), name: who.short, line: 'facing away', shadow: who.mob.shadow, gold: true },
  ];
  const W = Math.max(900, widthOf(row1, S, PAD));
  const [, , up, down] = reachAll(row1.map((f) => f.sp));
  cv.width = W;
  cv.height = 70 + (up + down + 14) * S + 50 + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(who.title, PAD, 12, 26, '#ffd866', 700);
  text('a boss of dungeons 2 to 4. A mock-up: not in the game', PAD, 44, 16, '#cfc8ff', 600);
  row(row1, 70, S, PAD, W);
  win.__ready = true;
}

if (mode === 'pose') {
  const who = BOSSES[parts[1] || 'headsman'] ?? BOSSES.headsman;
  const which = parts[2] || 'stand';
  const t = Number(parts[3]) || 0;
  const view = (parts[4] || 'front') as GameView;
  const S = Number(parts[5]) || 4;
  const sp = spOf(who.mob, which, t, view);
  const [l, r, u, d] = reachOf(sp);
  cv.width = Math.max(300, (l + r + 40) * S);
  cv.height = (u + d + 40) * S + 40;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`${who.title}: ${which} ${t} s, ${view}`, 10, 8, 16, '#ffd866', 700);
  pane(0, 30, cv.width, cv.height - 30, S, [{ sp, fx: (l + 20) * S, fy: 30 + (u + 20) * S, shadow: who.mob.shadow }]);
  win.__ready = true;
}

if (mode === 'poses') {
  const who = BOSSES[parts[1] || 'headsman'] ?? BOSSES.headsman;
  const which = parts[2] || 'stand';
  const ts = (parts[3] || '0').split(',').map(Number);
  const S = Number(parts[4]) || 2;
  const PAD = 10;
  // (his holds, by name: the stills of how he holds his axe)
  const HOLDS = ['Standing still', 'Carrying it', 'Raised to chop', 'The chop lands'];
  const named = which === 'holds';
  const rows = (['front', 'back'] as const).map((view) =>
    ts.map((t) => ({
      sp: spOf(who.mob, which, t, view),
      name: named ? HOLDS[t] ?? `${t}` : `${t} s`,
      line: named ? (view === 'front' ? 'facing you' : 'facing away') : view,
      shadow: who.mob.shadow,
      gold: false,
      // (where the chop lands, the floor cracked under the blade, a moment after)
      under:
        named && t === 3
          ? (c: CanvasRenderingContext2D) => {
              const e = tilesOf(axeOf(skeletonAt(who.mob, which, t), posedOfMob(who.mob, which, t).draw).edge);
              const [x, y] = floorOf(paintViewOf(who.mob, view), e[0], e[1]);
              const [fx, fy] = floorOf(paintViewOf(who.mob, view), 1, 0);
              drawChopCrack(c, ISO, x, y, fx, fy, 0.2);
            }
          : undefined,
    })),
  );
  const W = Math.max(...rows.map((r) => widthOf(r, S, PAD)));
  const [, , up, down] = reachAll(rows.flat().map((f) => f.sp));
  const h = (up + down + 14) * S + 50;
  cv.width = W;
  cv.height = 40 + h * 2 + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(named ? `${who.title}: how he holds his axe` : `${who.title}: ${which}`, PAD, 8, 18, '#ffd866', 700);
  row(rows[0], 40, S, PAD, W);
  row(rows[1], 40 + h, S, PAD, W);
  win.__ready = true;
}

// =============================================================================================
// FILMS (tools/page_gif.mjs): a move, facing you and facing away, on the floor with what it does to the floor
//   move:<boss>:<move>[:<scale>]: he stands, makes the move, stands; the game's freeze as a heavy blow lands
//   walk:<boss>[:<scale>]: toward you, then away, the floor going by under him at his pace
//   death:<boss>[:<scale>]: struck, then struck down

/** Draw in the game's own pixels, the figure's floor point at (0, 0), scaled up as the pane is. */
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
/** A pane of floor with him where he stands: `under` drawn on the floor (the game's pixels), `over` in the air; `by` tiles of floor gone by under him (a walk), `away` which way. */
function filmPane(x: number, y: number, w: number, h: number, S: number, fx0: number, fy0: number, sp: Sprite, shadow: number, under?: (c: CanvasRenderingContext2D) => void, over?: (c: CanvasRenderingContext2D) => void, by = 0, away = false, props: ReadonlyArray<Sprite> = []): void {
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.fillStyle = '#07061a';
  g.fillRect(x, y, w, h);
  g.imageSmoothingEnabled = false;
  const span = Math.ceil(Math.max(w, h) / (16 * S)) + 4;
  const mx = away ? 0 : by;
  const my = away ? -by : 0;
  for (let ty = Math.floor(my) - span; ty <= Math.floor(my) + span; ty++) {
    for (let tx = Math.floor(mx) - span; tx <= Math.floor(mx) + span; tx++) {
      const px = fx0 + (tx - mx - (ty - my)) * 32 * S;
      const py = fy0 + (tx - mx + (ty - my)) * 16 * S - 16 * S;
      if (px < x - 70 * S || px > x + w + 70 * S || py < y - 40 * S || py > y + h + 40 * S) continue;
      const fl = ground.floor(tx + 40, ty + 40);
      g.drawImage(fl.img, px - fl.ax * 2 * S, py - fl.ay * 2 * S, fl.img.width * S, fl.img.height * S);
    }
  }
  g.fillStyle = 'rgba(6,4,14,0.55)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  const lit = g.createRadialGradient(fx0, fy0 - 24 * S, 0, fx0, fy0 - 24 * S, Math.max(60, (shadow + 70) * S));
  lit.addColorStop(0, 'rgba(0,0,0,0.6)');
  lit.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = lit;
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'source-over';
  if (under) inGamePixels(x, y, w, h, fx0, fy0, S, under);
  const sh = g.createRadialGradient(fx0, fy0, 0, fx0, fy0, shadow * S);
  sh.addColorStop(0, 'rgba(0,0,0,0.62)');
  sh.addColorStop(0.65, 'rgba(0,0,0,0.42)');
  sh.addColorStop(1, 'rgba(0,0,0,0)');
  g.save();
  g.translate(fx0, fy0);
  g.scale(1, 0.5);
  g.translate(-fx0, -fy0);
  g.fillStyle = sh;
  g.beginPath();
  g.arc(fx0, fy0, shadow * S, 0, Math.PI * 2);
  g.fill();
  g.restore();
  // (what lies on the floor where he stands, painted as he is: a broken chain left behind)
  g.imageSmoothingEnabled = false;
  for (const p of props) g.drawImage(p.img, Math.round(fx0 - p.ax * 2 * S), Math.round(fy0 - p.ay * 2 * S), p.img.width * S, p.img.height * S);
  drawAura(g, sp, fx0, fy0, 2 * S);
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(fx0 - sp.ax * 2 * S), Math.round(fy0 - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, fx0, fy0, 2 * S);
  if (over) inGamePixels(x, y, w, h, fx0, fy0, S, over);
  g.restore();
}
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
/** A sprite drawn at a point of the floor (the game's pixels, from his floor point) and a height, scaled as the pane is. */
function spriteAt(c: CanvasRenderingContext2D, sp: Sprite, x: number, y: number): void {
  c.imageSmoothingEnabled = false;
  c.drawImage(sp.img, Math.round(x - sp.ax), Math.round(y - sp.ay), sp.img.width / 2, sp.img.height / 2);
}

/** WHAT A MOVE OF A BOSS IS CALLED IN THE FILMS, moment by moment, and what it does to the floor. */
interface FilmOf {
  /** How long the move is (seconds), and the moments its heavy blows land (the game's freeze holds there). */
  long: number;
  heavy: number[];
  said: (t: number) => string;
  under?: (c: CanvasRenderingContext2D, t: number, view: GameView) => void;
  over?: (c: CanvasRenderingContext2D, t: number, view: GameView) => void;
  /** Who he is after it (his chains breaking: as free as he is then), and what it leaves lying on the floor where he stands (`left`: the game's pixels from his floor point). */
  then?: Mob;
  left?: Record<GameView, Sprite>;
}
const lastKey = (mob: Mob, which: string): number => {
  const mv = which === 'attack' ? mob.attack : which === 'reel' ? mob.reel : which === 'dying' ? mob.dying : mob.more?.[which];
  const keys = mv?.motion.keys ?? [];
  return keys.length ? keys[keys.length - 1].at : 1;
};

function headsmanFilms(): Record<string, FilmOf> {
  const bite = tilesOf(hsBite('attack'));
  const sent = tilesOf(hsBite('sentence'));
  const reach = hsSweepReach() / TILE3;
  const from = tilesOf(handAt(HEADSMAN, 'throw', HS_THROW_HIT - 0.02, 'R'));
  const to = tilesOf(handAt(HEADSMAN, 'throw', HS_CATCH, 'R'));
  const axes = { front: makeAxeShotArt('front'), back: makeAxeShotArt('back') };
  const at = (view: GameView, fwd: number, left: number): [number, number] => floorOf(paintViewOf(HEADSMAN, view), fwd, left);
  return {
    attack: {
      long: lastKey(HEADSMAN, 'attack'),
      heavy: [HS_CHOP_HIT],
      said: (t) => (t < 0.4 ? 'His chop: up over his right shoulder' : t < HS_CHOP_HIT - 0.07 ? 'His chop: held there, the edge glinting (the bell tolls)' : t < HS_CHOP_HIT + 0.5 ? 'His chop: down, his right hand sliding to his left; the blade bites the floor' : 'His chop: wrenched out, and back across him'),
      under: (c, t, view) => {
        const [x, y] = at(view, bite[0], bite[1]);
        const [fx, fy] = at(view, 1, 0);
        drawChopCrack(c, ISO, x, y, fx, fy, t - HS_CHOP_HIT);
      },
    },
    sentence: {
      long: lastKey(HEADSMAN, 'sentence'),
      heavy: [HS_SENTENCE_HIT],
      said: (t) => (t < 0.5 ? 'The sentence: the axe raised high over him' : t < HS_SENTENCE_HIT - 0.07 ? 'The sentence: held high, the floor cracking where it will fall (the bell tolls)' : t < HS_SENTENCE_HIT + 1.0 ? 'The sentence: down, his front foot stamping forward; the floor splits open along the line, and burns' : 'The sentence: wrenched out, and back across him'),
      under: (c, t, view) => {
        const [x, y] = at(view, sent[0] - SENTENCE_FROM, sent[1]);
        const [fx, fy] = at(view, 1, 0);
        if (t < HS_SENTENCE_HIT) drawSentenceLine(c, ISO, x, y, fx, fy, Math.max(0, Math.min(1, (t - 0.5) / (HS_SENTENCE_HIT - 0.6))), t);
      },
      over: (c, t, view) => {
        const [x, y] = at(view, sent[0] - SENTENCE_FROM, sent[1]);
        const [fx, fy] = at(view, 1, 0);
        drawSentenceSplit(c, ISO, x, y, fx, fy, t - HS_SENTENCE_HIT);
      },
    },
    sweep: {
      long: lastKey(HEADSMAN, 'sweep'),
      heavy: [],
      said: (t) => (t < 0.4 ? 'The wide sweep: hauled back to his right, low' : t < HS_SWEEP_FROM ? 'The wide sweep: held, a ring burning round him as far as it reaches (the bell tolls)' : t < HS_SWEEP_TO + 0.1 ? 'The wide sweep: all the way round him, low' : 'The wide sweep: carried on round, the blade skidding; hauled back across him'),
      under: (c, t) => drawSweepRing(c, ISO, 0, 0, reach, t < HS_SWEEP_FROM ? Math.max(0, Math.min(1, (t - 0.35) / (HS_SWEEP_FROM - 0.4))) : 0, t),
    },
    throw: {
      long: lastKey(HEADSMAN, 'throw'),
      heavy: [],
      said: (t) => (t < 0.4 ? 'The whirling throw: swung back to his right, flat' : t < HS_THROW_HIT ? 'The whirling throw: held, its way traced on the floor (the bell tolls)' : t < HS_CATCH - 0.4 ? 'The whirling throw: out across the room, whirling, and round' : t < HS_CATCH + 0.15 ? 'The whirling throw: back into his hand' : 'The whirling throw: back across him'),
      under: (c, t, view) => {
        const [fx, fy] = at(view, 1, 0);
        if (t < HS_THROW_HIT) drawThrowPath(c, ISO, 0, 0, fx, fy, from, to, Math.max(0, Math.min(1, (t - 0.4) / (HS_THROW_HIT - 0.5))), t);
        const u = (t - HS_THROW_HIT) / (HS_CATCH - HS_THROW_HIT);
        if (u >= 0 && u < 1) {
          const [a, b] = throwPathAt(u, from, to);
          const [x, y] = at(view, a, b);
          drawAxeShadow(c, ISO, x, y);
        }
      },
      over: (c, t, view) => {
        const u = (t - HS_THROW_HIT) / (HS_CATCH - HS_THROW_HIT);
        if (u < 0 || u >= 1) return;
        const [a, b, hgt] = throwPathAt(u, from, to);
        const [x, y] = at(view, a, b);
        const [sx, sy] = ISO(x, y);
        const set = axes[view];
        spriteAt(c, set[Math.floor((t * 3.2 * AXE_SHOT_FRAMES) % AXE_SHOT_FRAMES)], sx, sy - hgt);
      },
    },
  };
}
function chainedFilms(): Record<string, FilmOf> {
  const leftL = { front: makeLeftBehindArt('L', 'front'), back: makeLeftBehindArt('L', 'back') };
  const leftBall = { front: makeLeftBehindArt('ball', 'front'), back: makeLeftBehindArt('ball', 'back') };
  const hooks = { front: makeHookShotArt('front'), back: makeHookShotArt('back') };
  const balls = { front: makeBallShotArt('front'), back: makeBallShotArt('back') };
  const at = (view: GameView, fwd: number, left: number): [number, number] => floorOf(paintViewOf(CHAINED, view), fwd, left);
  /** A point of the figure's own space on the screen (the game's pixels, from his floor point). */
  const onScreen = (view: GameView, p: readonly number[]): [number, number] => {
    const [f, l, h] = tilesOf(p);
    const [x, y] = ISO(...at(view, f, l));
    return [x, y - h];
  };
  return {
    attack: {
      long: lastKey(CHAINED, 'attack'),
      heavy: [CO_LASH_HIT],
      said: (t) => (t < 0.46 ? 'His lash: his fist up over his shoulder, the chain swinging over after it' : t < CO_LASH_HIT - 0.12 ? 'His lash: held there, the chain hanging down his back, his eyes flaring' : t < CO_LASH_HIT + 0.3 ? 'His lash: over the top and down, the chain slammed down before him' : 'His lash: dragged back to him'),
    },
    hook: {
      long: lastKey(CHAINED, 'hook'),
      heavy: [],
      said: (t) => (t < 0.3 ? 'Hook and drag: the hook swung out at his side' : t < CO_HOOK_LET - 0.05 ? 'Hook and drag: swung round and round at his side, faster and faster; he points' : t < CO_HOOK_BITE + 0.05 ? 'Hook and drag: flung out across the room' : t < CO_HOOK_BACK ? 'Hook and drag: hauled in, hand over hand, dragging what it caught' : 'Hook and drag: it falls at his feet'),
      under: (c, t, view) => {
        const h = coHookPath(t);
        if (!h || h.flying) return;
        const [x, y] = at(view, h.at[0], h.at[1]);
        const [x0, y0] = at(view, CO_HOOK_REACH, h.at[1]);
        drawScrape(c, ISO, x, y, x0, y0, 1);
      },
      over: (c, t, view) => {
        const h = coHookPath(t);
        if (!h) return;
        const [hx, hy] = at(view, h.at[0], h.at[1]);
        const [sx, sy] = ISO(hx, hy);
        const [cx, cy] = onScreen(view, coCuffAt('hook', t));
        drawChainOut(c, cx, cy, sx, sy - h.at[2], h.flying ? 6 : 1);
        const set = hooks[view];
        spriteAt(c, h.flying ? set[Math.floor((t * 2.5 * HOOK_SHOT_FRAMES) % HOOK_SHOT_FRAMES)] : set[HOOK_SHOT_FRAMES], sx, sy - h.at[2]);
      },
    },
    whirl: {
      long: lastKey(CHAINED, 'whirl'),
      heavy: [],
      said: (t) => (t < 0.55 ? 'The chain whirl: crouched, his chains swinging up' : t < CO_WHIRL_FROM ? 'The chain whirl: wound round to his right, held' : t < CO_WHIRL_TO ? 'The chain whirl: three times round, his chains flying out round him' : 'The chain whirl: staggering out of it'),
      under: (c, t) => drawSweepRing(c, ISO, 0, 0, coWhirlReach() / TILE3, t < CO_WHIRL_FROM ? Math.max(0, Math.min(1, (t - 0.3) / (CO_WHIRL_FROM - 0.35))) : 0, t),
    },
    breakL: {
      long: lastKey(CHAINED, 'breakL'),
      heavy: [],
      said: (t) => (t < 0.44 ? 'His left chain: he stamps on it' : t < CO_SNAP_L ? 'His left chain: he wrenches his arm up against it, roaring' : t < CO_SNAP_L + 0.4 ? 'His left chain: it snaps at the cuff' : 'He roars, wilder'),
      then: CHAINED_FREED[1],
      left: leftL,
    },
    breakBall: {
      long: lastKey(CHAINED_FREED[1], 'breakBall'),
      heavy: [],
      said: (t) => (t < 0.42 ? 'The ball’s chain: he takes it behind his neck' : t < CO_SNAP_BALL ? 'The ball’s chain: hauled over his head, straining, roaring' : t < CO_SNAP_BALL + 0.4 ? 'The ball’s chain: torn from his collar' : 'He roars, free of the ball'),
      then: CHAINED_FREED[2],
      left: leftBall,
    },
    ball: {
      long: lastKey(CHAINED, 'ball'),
      heavy: [],
      said: (t) => (t < 0.6 ? 'The ball throw: down to the iron ball behind him' : t < 1.12 ? 'The ball throw: heaved up over his head' : t < CO_BALL_LET - 0.05 ? 'The ball throw: held up there, trembling' : t < CO_BALL_LAND + 0.05 ? 'The ball throw: hurled across the room' : t < CO_BALL_BACK ? 'The ball throw: hauled back on its chain' : 'The ball throw: dragged round behind him'),
      under: (c, t, view) => {
        const [lx, ly] = at(view, CO_BALL_REACH, 0);
        if (t >= 0.9 && t < CO_BALL_LAND) drawBallShadow(c, ISO, lx, ly, t < CO_BALL_LET ? 0.15 * Math.min(1, (t - 0.9) / 0.4) : 0.15 + 0.85 * ((t - CO_BALL_LET) / (CO_BALL_LAND - CO_BALL_LET)));
        drawBallCrash(c, ISO, lx, ly, t - CO_BALL_LAND);
        const b = coBallPath(t);
        if (b && !b.flying) {
          const [x, y] = at(view, b.at[0], b.at[1]);
          drawScrape(c, ISO, x, y, lx, ly, 1);
        }
      },
      over: (c, t, view) => {
        const b = coBallPath(t);
        if (!b) return;
        const [bx, by] = at(view, b.at[0], b.at[1]);
        const [sx, sy] = ISO(bx, by);
        const [cx, cy] = onScreen(view, coCollarAt('ball', t));
        drawChainOut(c, cx, cy, sx, sy - b.at[2], b.flying ? 8 : 2);
        spriteAt(c, balls[view][b.flying ? Math.floor((t * 1.6 * BALL_SHOT_FRAMES) % BALL_SHOT_FRAMES) : 0], sx, sy - b.at[2]);
      },
    },
  };
}
const FILMS: Record<string, () => Record<string, FilmOf>> = { headsman: headsmanFilms, chained: chainedFilms, chained1: chainedFilms, chained2: chainedFilms };

if (mode === 'move') {
  const who = BOSSES[parts[1] || 'headsman'] ?? BOSSES.headsman;
  const which = parts[2] || 'attack';
  const S = Number(parts[3]) || 2;
  const FPS = 30;
  const film = (FILMS[parts[1] || 'headsman'] ?? headsmanFilms)()[which];
  const mob = who.mob;
  const HOLD = 0.1;
  // (a boss that sets his weapon down when he stands, as the Headsman does, takes it up first and sets it down after: his `raise` and `lower`)
  const ups = mob.more?.raise && mob.more?.lower;
  const UP = ups ? lastKey(mob, 'raise') : 0;
  const T0 = 0.4;
  const T1 = T0 + UP;
  const ROUND = T1 + film.long + film.heavy.length * HOLD + UP + 0.6;
  const TICKS = Math.round(ROUND * FPS);
  /** The moment of the move at a moment of the film (held a tenth of a second at each heavy blow: the game's freeze). */
  const moveT = (t: number): number => {
    let m = t - T1;
    for (const h of film.heavy) if (m > h) m = m < h + HOLD ? h : m - HOLD;
    return m;
  };
  const after = T1 + film.long + film.heavy.length * HOLD;
  // (his stand at its own frames a second, as the game shows it; after the move it begins again from its first frame, where the move hands over to it)
  const standFrom = after + (ups ? UP : 0);
  const standAt = (t: number, from: number): number => Math.floor(Math.max(0, t - from) * mob.idleFps + 1e-6) / mob.idleFps;
  const frameOf = (view: GameView, t: number): Sprite => {
    const m = moveT(t);
    if (ups && t >= T0 && t < T1) return spOf(mob, 'raise', t - T0, view);
    if (ups && t >= after && t < after + UP) return spOf(mob, 'lower', t - after, view);
    return m < 0 ? spOf(mob, 'stand', standAt(t, 0), view) : m > film.long ? spOf(film.then ?? mob, 'stand', standAt(t, standFrom), view) : spOf(mob, which, m, view);
  };
  // (how big a pane must be: every frame of it, both ways, and what it does to the floor)
  const all: Sprite[] = [];
  for (let i = 0; i < TICKS; i += 3) for (const v of ['front', 'back'] as const) all.push(frameOf(v, i / FPS));
  const [l, r, u, d] = reachAll(all);
  const PAD = 10;
  const M = 30;
  // (room on the floor for what the move does to it: before him, which is down the picture facing you and up it facing away)
  const FLOOR = which === 'sentence' ? 150 : which === 'throw' || which === 'hook' || which === 'ball' ? 150 : 40;
  const cw = (l + r + 2 * M + FLOOR) * S;
  const ch = (u + d + 2 * M + FLOOR * 0.5) * S;
  const HEAD = 58;
  cv.width = PAD + 2 * (cw + PAD);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    const m = moveT(t);
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    const said = m >= 0 && m <= film.long ? film.said(m) : ups && t >= T0 && t < T1 ? `${who.title} takes up his axe in both hands, across him` : ups && t >= after && t < after + UP ? `${who.title} sets his axe down again` : `${who.title}`;
    text(m > film.long && film.then ? `${film.then.name}` : said, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. What each blow hurts, and how far, are the main chat’s rules', PAD, 32, 14, '#cfc8ff', 600);
    for (const [j, view] of (['front', 'back'] as const).entries()) {
      const x = PAD + j * (cw + PAD);
      const fx0 = x + (M + l + (which === 'sweep' ? FLOOR * 0.5 : 0)) * S;
      const fy0 = view === 'front' || which === 'sweep' ? HEAD + (M + u + (which === 'sweep' ? FLOOR * 0.25 : 0)) * S : HEAD + ch - (M + d) * S;
      const mm = m >= 0 && m <= film.long ? m : -1;
      filmPane(x, HEAD, cw, ch, S, fx0, fy0, frameOf(view, t), mob.shadow, film.under && mm >= 0 ? (c) => film.under?.(c, mm, view) : undefined, film.over && mm >= 0 ? (c) => film.over?.(c, mm, view) : undefined, 0, false, film.left && m > film.long ? [film.left[view]] : []);
      text(view === 'front' ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}

if (mode === 'stand') {
  // HIS STAND, twice round, at its own frames a second, as the game shows it: his breath and the shift of his weight, and his habits
  const who = BOSSES[parts[1] || 'headsman'] ?? BOSSES.headsman;
  const S = Number(parts[2]) || 2;
  const FPS = 30;
  const mob = who.mob;
  const LOOP = mob.idleFrames / mob.idleFps;
  const TICKS = Math.round(2 * LOOP * FPS);
  const at = (t: number): number => (Math.floor(t * mob.idleFps + 1e-6) % mob.idleFrames) / mob.idleFps;
  const all: Sprite[] = [];
  for (let i = 0; i < mob.idleFrames; i++) for (const v of ['front', 'back'] as const) all.push(spOf(mob, 'stand', i / mob.idleFps, v));
  const [l, r, u, d] = reachAll(all);
  const PAD = 10;
  const M = 16;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = PAD + 2 * (cw + PAD);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(`${mob.stand.name}`, PAD, 8, 17, '#ffd866', 700);
    text(`a mock-up: not in the game. His stand, ${mob.idleFrames} frames at ${mob.idleFps} a second, twice round`, PAD, 32, 14, '#cfc8ff', 600);
    for (const [j, view] of (['front', 'back'] as const).entries()) {
      const x = PAD + j * (cw + PAD);
      filmPane(x, HEAD, cw, ch, S, x + (M + l) * S, HEAD + (M + u) * S, spOf(mob, 'stand', at(t), view), mob.shadow);
      text(view === 'front' ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}

if (mode === 'walk') {
  const who = BOSSES[parts[1] || 'headsman'] ?? BOSSES.headsman;
  const S = Number(parts[2]) || 2;
  const FPS = 30;
  const mob = who.mob;
  const period = mob.walkFrames / mob.walkFps;
  // (as the game would play it, each way: he stands; takes up his axe, if he sets it down to stand, as the
  // Headsman does; sets off; walks; stops as his walk comes round to its first frame; sets his axe down;
  // stands. His stand at its own frames a second, his walk at its own, the rest at the game's 30)
  const has = (which: string): boolean => mob.more?.[which] !== undefined;
  const ups = has('raise') && has('lower');
  const steps = has('setOff') && has('halt');
  const seq: { which: string; long: number }[] = [
    { which: 'stand', long: 0.6 },
    ...(ups ? [{ which: 'raise', long: lastKey(mob, 'raise') }] : []),
    ...(steps ? [{ which: 'setOff', long: lastKey(mob, 'setOff') }] : []),
    { which: 'walk', long: Math.ceil(2.4 / period) * period },
    ...(steps ? [{ which: 'halt', long: lastKey(mob, 'halt') }] : []),
    ...(ups ? [{ which: 'lower', long: lastKey(mob, 'lower') }] : []),
    { which: 'stand', long: 1.0 },
  ];
  const LEG = seq.reduce((a, p) => a + p.long, 0);
  const TICKS = Math.round(2 * LEG * FPS);
  const moving = (w: string): boolean => w === 'setOff' || w === 'walk' || w === 'halt';
  /** What he is doing at a moment of one way: which move, the moment of it the game would show, and how far the floor has gone by under him (tiles). */
  const doing = (t: number): { which: string; m: number; by: number; i: number } => {
    let t0 = 0;
    let by = 0;
    for (let i = 0; i < seq.length; i++) {
      const p = seq[i];
      if (t < t0 + p.long || i === seq.length - 1) {
        const m = Math.max(0, Math.min(p.long, t - t0));
        const shown = p.which === 'stand' ? Math.floor(m * mob.idleFps + 1e-6) / mob.idleFps : p.which === 'walk' ? ((Math.floor(m * mob.walkFps + 1e-6) % mob.walkFrames) / mob.walkFrames) * period : m;
        return { which: p.which, m: shown, by: by + (moving(p.which) ? m * mob.pace : 0), i };
      }
      t0 += p.long;
      if (moving(p.which)) by += p.long * mob.pace;
    }
    return { which: 'stand', m: 0, by, i: 0 };
  };
  const frameOf = (view: GameView, t: number): Sprite => {
    const d = doing(t);
    return spOf(mob, d.which, d.m, view);
  };
  const all: Sprite[] = [];
  for (let i = 0; i < Math.round(LEG * FPS); i += 2) for (const v of ['front', 'back'] as const) all.push(frameOf(v, i / FPS));
  const [l, r, u, d] = reachAll(all);
  const PAD = 10;
  const M = 16;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = Math.max(cw + 2 * PAD, 640);
  cv.height = HEAD + ch + 34;
  const named = (which: string): string =>
    which === 'walk' ? (who.walkSaid ?? who.title) : which === 'stand' ? mob.stand.name : (mob.more?.[which]?.name ?? who.title);
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    const away = t >= LEG;
    const tt = away ? t - LEG : t;
    const view: GameView = away ? 'back' : 'front';
    const dd = doing(tt);
    const sp = spOf(mob, dd.which, dd.m, view);
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(`${named(dd.which)}, ${away ? 'going away' : 'coming toward you'}`, PAD, 8, 17, '#ffd866', 700);
    text(`a mock-up: not in the game. ${mob.pace} tiles a second; the floor goes by under him`, PAD, 32, 14, '#cfc8ff', 600);
    const x = (cv.width - cw) / 2;
    filmPane(x, HEAD, cw, ch, S, x + (M + l) * S, HEAD + (M + u) * S, sp, mob.shadow, undefined, undefined, dd.by, away);
  });
}

if (mode === 'death') {
  const who = BOSSES[parts[1] || 'headsman'] ?? BOSSES.headsman;
  const S = Number(parts[2]) || 2;
  const FPS = 30;
  const mob = who.mob;
  // (a boss who fights with his weapon taken up, as the Headsman does: he takes it up first, and is struck and dies with it in his hands)
  const ups = mob.more?.raise !== undefined;
  const UP = ups ? lastKey(mob, 'raise') : 0;
  const T1 = 0.5 + UP;
  const reelLong = lastKey(mob, 'reel');
  const T2 = T1 + reelLong + 0.5;
  const ROUND = T2 + mob.dieTime + 1.0;
  const TICKS = Math.round(ROUND * FPS);
  // (his stand at its own frames a second; after he is struck, from its first frame again)
  const standAt = (t: number, from: number): number => Math.floor(Math.max(0, t - from) * mob.idleFps + 1e-6) / mob.idleFps;
  const frameOf = (view: GameView, t: number): Sprite =>
    t >= T2 ? spOf(mob, 'die', Math.min(mob.dieTime, t - T2), view) : t >= T1 && t < T1 + reelLong ? spOf(mob, 'reel', t - T1, view) : ups && t >= 0.3 && t < T1 ? spOf(mob, 'raise', Math.min(UP, t - 0.3), view) : ups && t >= T1 ? spOf(mob, 'reel', reelLong, view) : spOf(mob, 'stand', t >= T1 ? standAt(t, T1 + reelLong) : standAt(t, 0), view);
  const all: Sprite[] = [];
  for (let i = 0; i < TICKS; i += 3) for (const v of ['front', 'back'] as const) all.push(frameOf(v, i / FPS));
  const [l, r, u, d] = reachAll(all);
  const PAD = 10;
  const M = 16;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = PAD + 2 * (cw + PAD);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(t < T2 ? (who.struckSaid ?? 'Struck') : (who.deathSaid ?? 'Struck down'), PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game', PAD, 32, 14, '#cfc8ff', 600);
    for (const [j, view] of (['front', 'back'] as const).entries()) {
      const x = PAD + j * (cw + PAD);
      filmPane(x, HEAD, cw, ch, S, x + (M + l) * S, HEAD + (M + u) * S, frameOf(view, t), mob.shadow);
      text(view === 'front' ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}
