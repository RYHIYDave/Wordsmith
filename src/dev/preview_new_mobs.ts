// Dev page: THREE NEW MONSTERS (art/new_mobs3.ts, a mock-up: NOT IN THE GAME), on a piece of the
// dungeon's own floor with the dark of a dungeon over it, each with the pool of pink light the game
// puts behind a monster, its soft shadow and the lights it gives off (as preview_heroes3.ts and
// preview_skeleton3.ts show figures). Nearest-neighbour enlargement only.
//   node tools/preview.mjs src/dev/preview_new_mobs.ts previews/new_mobs/new_mobs_sheet.png 1000 900 "sheet"
//   hash = sheet[:<screen pixels to a picture pixel>]: all three standing, facing you, beside the knight
//            and the new skeleton for size; under them each one's warning pose
//          one:<shade | boneward | golem>[:<scale>]: one alone: facing you and away, its warning
//            pose, the moment its blow lands, two moments of its death; and the same at a phone's size
//          film[:<scale>]: frames of a moving picture for tools/page_gif.mjs: each standing, then
//            its attack (the warning held, then the blow), looping
//          walks[:<scale>]: frames of a moving picture: all three walking toward you and then away,
//            beside the new skeleton walking, the floor going by under each at its pace
//          struck[:<scale>]: each struck, a few frames of its reel, facing you
//          strip:<shade | boneward | golem>:<walk | reel | stand>:<front | back>[:<scale>]: every frame of one move in a row
import { makeGroundArt } from '../art/ground';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { makeSkeletonArt3 } from '../art/monster_bones3';
import { MOVES3 } from '../art/moves3';
import { BONEWARD, GOLEM, NEW_MOBS_LIST, SHADE, deathOfMob, makeBonewardArt3, makeGolemArt3, makeShadeArt3, paintMob } from '../art/new_mobs3';
import type { Mob, MobAct } from '../art/new_mobs3';
import type { ActorArt } from '../art/actor_types';
import { MONSTERS } from '../game/defs';
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

/**
 * A pane of the dungeon's floor (the game's own tiles), the dark of a dungeon over it (thinner
 * about the figures), and on it figures at their floor points: each with its soft shadow, its pool
 * of light, itself and its lights. `S`: screen pixels to a picture pixel.
 */
function pane(x: number, y: number, w: number, h: number, S: number, who: ReadonlyArray<{ sp: Sprite; fx: number; fy: number; shadow: number }>, by = 0, away = false, flat = false): void {
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

const sp3 = (mob: Mob, which: MobAct, t: number, view: GameView): Sprite => toSprite(paintMob(mob, which, t, view), mob.aura, CANVAS3.ax, CANVAS3.ay);
const dead3 = (mob: Mob, k: number, view: GameView): Sprite => toSprite(deathOfMob(mob, k, view), null, CANVAS3.ax, CANVAS3.ay);
const KNIGHT = (): Sprite => spriteOf3(MOVES3.rear, 0, 'front');
const SKELETON = (): Sprite => makeSkeletonArt3().front.idle[0];

// =============================================================================================
// sheet: all three, beside the knight and the new skeleton; under them, each one's warning pose

if (mode === 'sheet') {
  const S = Number(parts[1]) || 3;
  const PAD = 14;
  const row1: { sp: Sprite; name: string; line: string; shadow: number; them: boolean }[] = [
    { sp: KNIGHT(), name: 'The knight', line: 'a hero, for size', shadow: 12, them: false },
    { sp: SKELETON(), name: 'The skeleton', line: 'the new one, for size', shadow: 10, them: false },
    ...NEW_MOBS_LIST.map((m) => ({ sp: sp3(m, 'stand', 0, 'front'), name: m.name, line: m.size, shadow: m.shadow, them: true })),
  ];
  const GAP = 16;
  let wide = 0;
  let up = 0;
  let down = 0;
  const xs: number[] = [];
  for (const f of row1) {
    const [l, r, u, d] = reachOf(f.sp);
    const cell = Math.max(l + r, 44);
    xs.push(wide + Math.max(l, cell / 2 - (r - l) / 2));
    wide += cell + GAP;
    up = Math.max(up, u);
    down = Math.max(down, d);
  }
  wide += GAP;
  const warns = NEW_MOBS_LIST.map((m) => sp3(m, 'attack', m.warn, 'front'));
  let wUp = 0;
  let wDown = 0;
  const wCells: number[] = [];
  for (const sp of warns) {
    const [l, r, u, d] = reachOf(sp);
    wCells.push(l + r + 2 * GAP);
    wUp = Math.max(wUp, u);
    wDown = Math.max(wDown, d);
  }
  const W = Math.max(wide * S, wCells.reduce((a, b) => a + b, 0) * S + PAD * (wCells.length - 1)) + PAD * 2;
  const HEAD = 78;
  const h1 = (up + Math.max(down, 10) + 14) * S;
  const LAB = 50;
  const h2 = (wUp + Math.max(wDown, 10) + 12) * S;
  cv.width = W;
  cv.height = HEAD + h1 + LAB + 40 + h2 + LAB + PAD;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('New monsters', PAD, 12, 28, '#ffd866', 700);
  text('a mock-up: not in the game', PAD, 46, 17, '#cfc8ff', 600);
  const y1 = HEAD;
  const floorY = y1 + (up + 7) * S;
  const ox = PAD + (W - PAD * 2 - wide * S) / 2;
  pane(PAD, y1, W - PAD * 2, h1, S, row1.map((f, i) => ({ sp: f.sp, fx: ox + (GAP + xs[i]) * S, fy: floorY, shadow: f.shadow })));
  row1.forEach((f, i) => {
    const cx = ox + (GAP + xs[i]) * S;
    text(f.name, cx, y1 + h1 + 6, 17, f.them ? '#ffd866' : '#cfc8ff', 700, 'center');
    text(f.line, cx, y1 + h1 + 27, 14, '#a8a2b8', 500, 'center');
  });
  const y2 = y1 + h1 + LAB + 8;
  text('Each one’s warning pose: held a moment before it strikes', PAD, y2, 18, '#ffd866', 700);
  const y3 = y2 + 32;
  let x = PAD + (W - PAD * 2 - (wCells.reduce((a, b) => a + b, 0) * S + PAD * (wCells.length - 1))) / 2;
  const said = ['claws spread over its hood', 'spear drawn back over the shield', 'the club high, the fire flaring'];
  warns.forEach((sp, i) => {
    const [l] = reachOf(sp);
    const w = wCells[i] * S;
    pane(x, y3, w, h2, S, [{ sp, fx: x + (GAP + l) * S, fy: y3 + (wUp + 6) * S, shadow: NEW_MOBS_LIST[i].shadow }]);
    text(NEW_MOBS_LIST[i].name, x + w / 2, y3 + h2 + 6, 16, '#ffd866', 700, 'center');
    text(said[i], x + w / 2, y3 + h2 + 26, 14, '#a8a2b8', 500, 'center');
    x += w + PAD;
  });
  win.__ready = true;
}

// =============================================================================================
// one: one monster alone

if (mode === 'one') {
  const mob = parts[1] === 'boneward' ? BONEWARD : parts[1] === 'golem' ? GOLEM : SHADE;
  const S = Number(parts[2]) || (mob === GOLEM ? 3 : 4);
  const dieAt: Record<Mob['id'], [number, number]> = { shade: [0.3, 0.62], boneward: [0.3, 1], golem: [0.3, 1] };
  const [d1, d2] = dieAt[mob.id];
  const cells: { sp: Sprite; label: string }[] = [
    { sp: sp3(mob, 'stand', 0, 'front'), label: 'facing you' },
    { sp: sp3(mob, 'stand', 0, 'back'), label: 'facing away' },
    { sp: sp3(mob, 'attack', mob.warn, 'front'), label: 'the warning pose (held)' },
    { sp: sp3(mob, 'attack', mob.hit, 'front'), label: 'the blow lands' },
    { sp: dead3(mob, d1, 'front'), label: 'it dies...' },
    { sp: dead3(mob, d2, 'front'), label: mob.id === 'shade' ? '...and comes apart' : '...and lies in pieces' },
  ];
  let l = 0;
  let r = 0;
  let u = 0;
  let d = 0;
  for (const c of cells) {
    const [a, b, e, f] = reachOf(c.sp);
    l = Math.max(l, a);
    r = Math.max(r, b);
    u = Math.max(u, e);
    d = Math.max(d, f);
  }
  const PAD = 12;
  const M = 8;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + Math.max(d, 10) + 2 * M) * S;
  const LAB = 30;
  const HEAD = 74;
  const PH = 2.5;
  const pl = (l + r + 6) * PH;
  const phoneH = (u + Math.max(d, 10) + 10) * PH;
  cv.width = PAD + 3 * (cw + PAD);
  cv.height = HEAD + 2 * (ch + LAB + PAD) + 40 + 2 * (phoneH + 8) + 16;
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(mob.name, PAD, 12, 26, '#ffd866', 700);
  text(`${mob.size}. A mock-up: not in the game. ${S} screen pixels to a picture pixel.`, PAD, 44, 15, '#cfc8ff', 600);
  cells.forEach((c, i) => {
    const x = PAD + (i % 3) * (cw + PAD);
    const y = HEAD + Math.floor(i / 3) * (ch + LAB + PAD);
    pane(x, y, cw, ch, S, [{ sp: c.sp, fx: x + (M + l) * S, fy: y + (M + u) * S, shadow: i >= 4 ? mob.shadow * 0.8 : mob.shadow }]);
    text(c.label, x + cw / 2, y + ch + 6, 16, i === 2 ? '#ffd866' : '#e8e2ff', i === 2 ? 700 : 500, 'center');
  });
  const yP = HEAD + 2 * (ch + LAB + PAD) + 6;
  text('The same, at the size a phone shows it (5 screen pixels to a game pixel: 844 x 390 points at 3x)', PAD, yP, 15, '#cfc8ff', 600);
  // (in two rows of three, as above)
  for (let row = 0; row < 2; row++) {
    const y = yP + 28 + row * (phoneH + 8);
    const these = cells.slice(row * 3, row * 3 + 3);
    pane(PAD, y, Math.min(cv.width - 2 * PAD, 3 * pl + 10 * PH), phoneH, PH, these.map((c, i) => ({ sp: c.sp, fx: PAD + (5 + l + i * (l + r + 6)) * PH, fy: y + (5 + u) * PH, shadow: row === 1 && i > 0 ? mob.shadow * 0.8 : mob.shadow })));
  }
  win.__ready = true;
}

// =============================================================================================
// film: each standing, then its attack (the warning held, then the blow), looping

if (mode === 'film') {
  const S = Number(parts[1]) || 3;
  const FPS = 30;
  /** The round, and when in it each one attacks (one after another, so that each is seen): it stands, attacks, and stands again till the loop comes round. */
  const ROUND = 4.8;
  const STARTS: Record<Mob['id'], number> = { shade: 0.7, boneward: 1.9, golem: 3.1 };
  const at = (mob: Mob, t: number): Sprite => {
    const standFor = STARTS[mob.id];
    const attackEnd = mob.attack.motion.keys[mob.attack.motion.keys.length - 1].at;
    if (t < standFor || t >= standFor + attackEnd) return sp3(mob, 'stand', t, 'front');
    return sp3(mob, 'attack', t - standFor, 'front');
  };
  const TICKS = Math.round(ROUND * FPS);
  const frames: Sprite[][] = NEW_MOBS_LIST.map((m) => {
    const out: Sprite[] = [];
    for (let i = 0; i < TICKS; i++) out.push(at(m, i / FPS));
    return out;
  });
  let l = 0;
  let r = 0;
  let u = 0;
  let d = 0;
  const reach = NEW_MOBS_LIST.map(() => [0, 0] as [number, number]);
  frames.forEach((list, j) => {
    for (const sp of list) {
      const [a, b, e, f] = reachOf(sp);
      reach[j][0] = Math.max(reach[j][0], a);
      reach[j][1] = Math.max(reach[j][1], b);
      u = Math.max(u, e);
      d = Math.max(d, f);
    }
  });
  l = reach.reduce((s, q) => s + q[0] + q[1] + 16, 0);
  void r;
  const PAD = 10;
  const W = l * S + PAD * 2;
  const H = (u + Math.max(d, 10) + 14) * S;
  cv.width = W;
  cv.height = H + 86;
  const draw = (tick: number): void => {
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text('New monsters: each stands, then holds its warning pose, then strikes', PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game', PAD, 32, 14, '#cfc8ff', 600);
    let x = 0;
    const who = frames.map((list, j) => {
      const fx = PAD + (x + 8 + reach[j][0]) * S;
      x += reach[j][0] + reach[j][1] + 16;
      return { sp: list[tick % list.length], fx, fy: 56 + (u + 7) * S, shadow: NEW_MOBS_LIST[j].shadow };
    });
    pane(PAD, 56, W - PAD * 2, H, S, who);
    who.forEach((w, j) => text(NEW_MOBS_LIST[j].name, w.fx, 56 + H + 6, 14, '#e8e2ff', 600, 'center'));
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}

// =============================================================================================
// walks: all three walking toward you, then away, beside the new skeleton walking (for pace)

const ARTS = (): { name: string; art: ActorArt; pace: number; shadow: number; said: string }[] => [
  { name: 'The skeleton', art: makeSkeletonArt3(), pace: MONSTERS.skeleton.speed, shadow: 10, said: `${MONSTERS.skeleton.speed} tiles a second (its rules)` },
  { name: SHADE.name, art: makeShadeArt3(), pace: SHADE.pace, shadow: SHADE.shadow, said: `glides, ${SHADE.pace} tiles a second` },
  { name: BONEWARD.name, art: makeBonewardArt3(), pace: BONEWARD.pace, shadow: BONEWARD.shadow, said: `plods, ${BONEWARD.pace} tile a second` },
  { name: GOLEM.name, art: makeGolemArt3(), pace: GOLEM.pace, shadow: GOLEM.shadow, said: `strides, ${GOLEM.pace} tiles a second` },
];

if (mode === 'walks') {
  const S = Number(parts[1]) || 3;
  const FPS = 25;
  /** Each way round, seconds. */
  const LEG = 2.4;
  const TICKS = Math.round(2 * LEG * FPS);
  const cells = ARTS();
  // (one box for each, that holds every frame of its walk both ways)
  const reach = cells.map((c) => {
    let l = 0;
    let r = 0;
    let u = 0;
    let d = 0;
    for (const set of [c.art.front, c.art.back]) {
      for (const sp of set.walk) {
        const [a, b, e, f] = reachOf(sp);
        l = Math.max(l, a);
        r = Math.max(r, b);
        u = Math.max(u, e);
        d = Math.max(d, f);
      }
    }
    return [l, r, u, d];
  });
  const PAD = 8;
  const M = 10;
  const up = Math.max(...reach.map((q) => q[2]));
  const down = Math.max(10, ...reach.map((q) => q[3]));
  const widths = reach.map((q) => (q[0] + q[1] + 2 * M) * S);
  const H = (up + down + 2 * M) * S;
  const HEAD = 56;
  cv.width = PAD + widths.reduce((a, b) => a + b + PAD, 0);
  cv.height = HEAD + H + 52;
  const draw = (tick: number): void => {
    const t = tick / FPS;
    const away = t >= LEG;
    const tt = away ? t - LEG : t;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(`Their walks, ${away ? 'going away from you' : 'coming toward you'}: the floor goes by under each at its own pace`, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. The skeleton, for pace, walks as the rules have it', PAD, 32, 14, '#cfc8ff', 600);
    let x = PAD;
    cells.forEach((c, j) => {
      const set = away ? c.art.back : c.art.front;
      const sp = set.walk[Math.floor(tt * (set.walkFps ?? 8) + 1e-6) % set.walk.length];
      const w = widths[j];
      pane(x, HEAD, w, H, S, [{ sp, fx: x + (M + reach[j][0]) * S, fy: HEAD + (M + up) * S, shadow: c.shadow }], tt * c.pace, away, true);
      text(c.name, x + w / 2, HEAD + H + 6, 15, j === 0 ? '#cfc8ff' : '#ffd866', 700, 'center');
      text(c.said, x + w / 2, HEAD + H + 26, 13, '#a8a2b8', 500, 'center');
      x += w + PAD;
    });
  };
  draw(0);
  win.__frames = TICKS;
  win.__tickMs = 1000 / FPS;
  win.__frame = (i: number): string => {
    draw(i);
    return cv.toDataURL('image/png');
  };
  win.__ready = true;
}

// =============================================================================================
// struck: each struck, a few frames of its reel, facing you

if (mode === 'struck') {
  const S = Number(parts[1]) || 3;
  const MOMENTS: Record<Mob['id'], number[]> = { shade: [0, 0.05, 0.1, 0.17, 0.33], boneward: [0, 0.06, 0.11, 0.18, 0.3], golem: [0, 0.04, 0.09, 0.14, 0.25] };
  const PAD = 10;
  const M = 6;
  const rows = NEW_MOBS_LIST.map((mob) => {
    const sps = MOMENTS[mob.id].map((t) => sp3(mob, 'reel', t, 'front'));
    let l = 0;
    let r = 0;
    let u = 0;
    let d = 0;
    for (const sp of sps) {
      const [a, b, e, f] = reachOf(sp);
      l = Math.max(l, a);
      r = Math.max(r, b);
      u = Math.max(u, e);
      d = Math.max(d, f);
    }
    return { mob, sps, l, r, u, d: Math.max(d, 8) };
  });
  const HEAD = 70;
  const NAME = 28;
  const LAB = 24;
  cv.width = PAD + Math.max(...rows.map((q) => q.sps.length * ((q.l + q.r + 2 * M) * S + PAD)));
  cv.height = HEAD + rows.reduce((a, q) => a + NAME + (q.u + q.d + 2 * M) * S + LAB + PAD, 0);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text('Struck: each one when a blow lands on it', PAD, 12, 24, '#ffd866', 700);
  text(`a mock-up: not in the game. Left to right, from the blow on (seconds). ${S} screen pixels to a picture pixel.`, PAD, 44, 15, '#cfc8ff', 600);
  let y = HEAD;
  const said: Record<Mob['id'], string> = { shade: 'jolted back, its robe flaring', boneward: 'rocked behind its shield', golem: 'barely: a shudder, its fire flickering' };
  for (const q of rows) {
    text(`${q.mob.name}: ${said[q.mob.id]}`, PAD, y + 4, 17, '#ffd866', 700);
    y += NAME;
    const cw = (q.l + q.r + 2 * M) * S;
    const ch = (q.u + q.d + 2 * M) * S;
    q.sps.forEach((sp, i) => {
      const x = PAD + i * (cw + PAD);
      pane(x, y, cw, ch, S, [{ sp, fx: x + (M + q.l) * S, fy: y + (M + q.u) * S, shadow: q.mob.shadow }]);
      text(`${MOMENTS[q.mob.id][i].toFixed(2)} s`, x + cw / 2, y + ch + 4, 14, '#e8e2ff', 500, 'center');
    });
    y += ch + LAB + PAD;
  }
  win.__ready = true;
}

// =============================================================================================
// strip: every frame of one move in a row, big

if (mode === 'strip') {
  const mob = parts[1] === 'boneward' ? BONEWARD : parts[1] === 'golem' ? GOLEM : SHADE;
  const which = (parts[2] === 'reel' || parts[2] === 'stand' ? parts[2] : 'walk') as MobAct;
  const view: GameView = parts[3] === 'back' ? 'back' : 'front';
  const S = Number(parts[4]) || 3;
  const fps = which === 'walk' ? mob.walkFps : which === 'stand' ? mob.idleFps : 30;
  const n = which === 'walk' ? mob.walkFrames : which === 'stand' ? mob.idleFrames : Math.round(mob.reelTime * 30) + 1;
  const sps: Sprite[] = [];
  for (let i = 0; i < n; i++) sps.push(sp3(mob, which, i / fps, view));
  let l = 0;
  let r = 0;
  let u = 0;
  let d = 0;
  for (const sp of sps) {
    const [a, b, e, f] = reachOf(sp);
    l = Math.max(l, a);
    r = Math.max(r, b);
    u = Math.max(u, e);
    d = Math.max(d, f);
  }
  const M = 6;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + Math.max(d, 8) + 2 * M) * S;
  const per = Math.max(1, Math.min(n, Math.floor(2400 / (cw + 6))));
  cv.width = per * (cw + 6) + 6;
  cv.height = 30 + Math.ceil(n / per) * (ch + 22);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`${mob.name}: ${which}, ${view === 'front' ? 'facing you' : 'facing away'}, ${n} frames at ${fps} a second`, 6, 6, 16, '#ffd866', 700);
  // (the floor going by under it at its pace, as it walks: a foot that is down stays on one spot of it)
  sps.forEach((sp, i) => {
    const x = 6 + (i % per) * (cw + 6);
    const y = 30 + Math.floor(i / per) * (ch + 22);
    pane(x, y, cw, ch, S, [{ sp, fx: x + (M + l) * S, fy: y + (M + u) * S, shadow: mob.shadow }], which === 'walk' ? (i / fps) * mob.pace : 0, view === 'back');
    text(`${i}`, x + 3, y + ch + 3, 12, '#a8a2b8');
  });
  win.__ready = true;
}
