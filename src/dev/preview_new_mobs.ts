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
//          THEIR ATTACKS (9 Oct):
//          moves:<shade | boneward | golem>[:<scale>]: each of its attacks at its moments, facing you
//            and facing away
//          shadefilm[:<scale>]: frames of a moving picture: the Shade's rake, its claws glinting,
//            facing you and facing away
//          bwfilm[:<scale>]: the Boneward's thrust, its spear-head glinting; then its spear throw, the
//            spear flying and lying on the floor, the shield bash while it has none, and picking it up
//          golemfilm[:<scale>]: the Golem's club swing; then its skull throw, the skull flying, its
//            shadow on the floor where it will land, and its burst
import { makeGroundArt } from '../art/ground';
import { spriteOf3 } from '../art/heroes3';
import { toSprite } from '../art/kit';
import { makeSkeletonArt3 } from '../art/monster_bones3';
import { MOVES3 } from '../art/moves3';
import { BONEWARD, BW_BASH_HIT, BW_GRAB, BW_HIT, BW_THROW_HIT, GOLEM, GOLEM_HIT, GOLEM_SWING_HIT, GOLEM_THROW_HIT, NEW_MOBS_LIST, SHADE, SHADE_HIT, TILE3, deathOfMob, handAt, makeBonewardArt3, makeGolemArt3, makeShadeArt3, makeSkullShotArt, paintMob } from '../art/new_mobs3';
import type { Mob, MobAct } from '../art/new_mobs3';
import { SKULL_BURST, SPEAR_GRIP, SPEAR_TILES, drawSkullBurst, drawSkullShadow, drawSpearLying, drawSpearShot } from '../art/mob_shots';
import type { FloorAt } from '../art/mob_shots';
import type { ActorArt, AnimSet, Clip } from '../art/actor_types';
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
  const said = ['claws spread over its hood', 'spear drawn back over the shield', 'its club drawn back, the fire flaring'];
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

// =============================================================================================
// THEIR ATTACKS (9 Oct). A pane with the floor's (0, 0) where it is asked for and the figures where
// they stand on it; what is on the floor (the spear lying, the skull's shadow) is drawn under them in
// the game's own pixels, and what is in the air (the skull, the spear in flight, the burst) over them.

/** Where a point of the floor (tiles) is, in the game's pixels, from the floor's (0, 0). */
const ISO: FloorAt = (x, y) => [(x - y) * 16, (x + y) * 8];

interface Who2 {
  sp: Sprite;
  /** Where it stands on the floor (tiles). */
  x: number;
  y: number;
  shadow: number;
}

const low = document.createElement('canvas');
/**
 * Draw in the game's own pixels, as the game does (on a canvas of them, enlarged without smoothing):
 * `draw` is given that canvas with the floor's (0, 0) at its origin. The pane is (x, y, w, h) on the
 * screen, with the floor's (0, 0) at (fx0, fy0).
 */
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

/**
 * A pane of the dungeon's floor as `pane` has it, the floor's (0, 0) at (fx0, fy0) of the screen and
 * each figure where it stands (tiles), the nearer over the further; `under` is drawn on the floor in
 * the game's pixels, under the figures, and `over` in the air, over them.
 */
function pane2(x: number, y: number, w: number, h: number, S: number, fx0: number, fy0: number, who: ReadonlyArray<Who2>, under?: (c: CanvasRenderingContext2D) => void, over?: (c: CanvasRenderingContext2D) => void, pools: ReadonlyArray<readonly [number, number]> = []): void {
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
  const spot = (f: Who2): [number, number] => {
    const [a, b] = ISO(f.x, f.y);
    return [fx0 + a * 2 * S, fy0 + b * 2 * S];
  };
  // the dark of a dungeon, thinner where each figure stands
  g.fillStyle = 'rgba(6,4,14,0.55)';
  g.fillRect(x, y, w, h);
  g.globalCompositeOperation = 'destination-out';
  for (const f of who) {
    const [fx, fy] = spot(f);
    const r = Math.max(60, (f.shadow + 40) * S);
    const lit = g.createRadialGradient(fx, fy - 18 * S, 0, fx, fy - 18 * S, r);
    lit.addColorStop(0, 'rgba(0,0,0,0.6)');
    lit.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lit;
    g.fillRect(x, y, w, h);
  }
  // (and where you would stand, with the light you carry: what is thrown at you comes down there)
  for (const [px, py] of pools) {
    const [a, b] = ISO(px, py);
    const cx = fx0 + a * 2 * S;
    const cy = fy0 + b * 2 * S;
    const lit = g.createRadialGradient(cx, cy, 0, cx, cy, 52 * S);
    lit.addColorStop(0, 'rgba(0,0,0,0.75)');
    lit.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = lit;
    g.fillRect(x, y, w, h);
  }
  g.globalCompositeOperation = 'source-over';
  if (under) inGamePixels(x, y, w, h, fx0, fy0, S, under);
  for (const f of who) {
    const [fx, fy] = spot(f);
    const sh = g.createRadialGradient(fx, fy, 0, fx, fy, f.shadow * S);
    sh.addColorStop(0, 'rgba(0,0,0,0.62)');
    sh.addColorStop(0.65, 'rgba(0,0,0,0.42)');
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
  if (over) inGamePixels(x, y, w, h, fx0, fy0, S, over);
  g.restore();
}

/** A sprite in the air: its anchor at the floor's (x, y) and `z` of the game's pixels over it. */
function inAir(sp: Sprite, x: number, y: number, z: number, fx0: number, fy0: number, S: number): void {
  const [a, b] = ISO(x, y);
  const X = fx0 + a * 2 * S;
  const Y = fy0 + (b - z) * 2 * S;
  g.imageSmoothingEnabled = false;
  g.drawImage(sp.img, Math.round(X - sp.ax * 2 * S), Math.round(Y - sp.ay * 2 * S), sp.img.width * S, sp.img.height * S);
  drawLights(g, sp, X, Y, 2 * S);
}

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
const clipOf = (s: AnimSet, name: string): Clip => {
  const c = name === 'attack' ? s.clips?.attack : s.clips?.moves?.[name];
  if (!c) throw new Error(`no move ${name}`);
  return c;
};
/** How long a clip is shown, played once (its last frame its own frame's time). */
const longOf = (c: Clip): number => c.frames.length / c.fps;
/** A point of the figure (its own lengths: forward, to its left, up) as a point of the floor (tiles) and a height (the game's pixels), the figure standing at (x, y) and facing along the grid's x. */
const onFloorOf = (p: readonly number[], x: number, y: number): [number, number, number] => [x + p[0] / TILE3, y - p[1] / TILE3, p[2] / 2];

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

// ---------------------------------------------------------------------------------------------
// moves: each of its attacks at its moments, facing you and facing away

if (mode === 'moves') {
  const mob = parts[1] === 'boneward' ? BONEWARD : parts[1] === 'golem' ? GOLEM : SHADE;
  const S = Number(parts[2]) || (mob === GOLEM ? 2 : 3);
  type Cell = { which: string; t: number; label: string };
  const rows: { title: string; cells: Cell[] }[] = [];
  const row = (title: string, which: string, at: ReadonlyArray<readonly [number, string]>): void => {
    rows.push({ title, cells: at.map(([t, label]) => ({ which, t, label })) });
  };
  if (mob === SHADE) {
    row('The rake (its one attack)', 'attack', [[0.17, 'claws drawn back'], [0.37, 'held: they glint'], [0.47, 'the glint flares'], [SHADE_HIT, 'the blow'], [SHADE_HIT + 0.1, 'through'], [SHADE_HIT + 0.3, 'after']]);
  } else if (mob === BONEWARD) {
    row('The thrust (its basic attack)', 'attack', [[0.3, 'spear drawn back'], [0.55, 'held: its head glints'], [0.66, 'the glint flares'], [BW_HIT, 'the thrust'], [BW_HIT + 0.12, 'through'], [BW_HIT + 0.35, 'after']]);
    row('The spear throw', 'throw', [[0.35, 'raised like a javelin'], [0.6, 'held: its head glints'], [0.71, 'the glint flares'], [BW_THROW_HIT, 'hurled'], [BW_THROW_HIT + 0.1, 'its hand empty'], [1.15, 'after']]);
    row('With its spear gone: the shield bash, and picking it up', '', []);
    rows[rows.length - 1].cells = [
      { which: 'standBare', t: 0, label: 'its hand empty' },
      { which: 'bash', t: 0.3, label: 'the shield drawn in' },
      { which: 'bash', t: BW_BASH_HIT, label: 'the shove' },
      { which: 'pickUp', t: 0.35, label: 'down to its spear' },
      { which: 'pickUp', t: BW_GRAB, label: 'it takes hold' },
      { which: 'pickUp', t: 0.75, label: 'up it comes' },
    ];
  } else {
    row('The club swing (its basic attack)', 'attack', [[0.22, 'gathered'], [0.38, 'cocked back'], [0.54, 'held: the fire flares'], [GOLEM_SWING_HIT, 'the blow'], [GOLEM_SWING_HIT + 0.08, 'through'], [GOLEM_SWING_HIT + 0.3, 'after']]);
    row('The skull throw', 'throw', [[0.3, 'it takes a skull'], [0.45, 'up and back'], [0.87, 'held: the fire flares'], [GOLEM_THROW_HIT, 'hurled'], [GOLEM_THROW_HIT + 0.1, 'its fist empty'], [1.2, 'after']]);
    row('Its slam, as it was (kept, for the rules to use or not)', 'slam', [[0.22, 'dragged up'], [0.5, 'raised'], [0.78, 'held: the fire flares'], [GOLEM_HIT, 'the blow'], [GOLEM_HIT + 0.15, 'into the floor'], [GOLEM_HIT + 0.4, 'after']]);
  }
  const views: GameView[] = ['front', 'back'];
  const sps = rows.map((r) => views.map((v) => r.cells.map((c) => toSprite(paintMob(mob, c.which, c.t, v), mob.aura, CANVAS3.ax, CANVAS3.ay))));
  let [l, r, u, d] = [0, 0, 0, 0];
  for (const a of sps) for (const b of a) for (const sp of b) {
    const [p, q, e, f] = reachOf(sp);
    l = Math.max(l, p);
    r = Math.max(r, q);
    u = Math.max(u, e);
    d = Math.max(d, f);
  }
  const PAD = 10;
  const M = 6;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + Math.max(d, 10) + 2 * M) * S;
  const HEAD = 70;
  const NAME = 26;
  const LAB = 24;
  const per = Math.max(...rows.map((q) => q.cells.length));
  cv.width = PAD + per * (cw + PAD);
  cv.height = HEAD + rows.length * 2 * (NAME + ch + LAB + PAD);
  g.fillStyle = BG;
  g.fillRect(0, 0, cv.width, cv.height);
  text(`${mob.name}: its attacks`, PAD, 10, 26, '#ffd866', 700);
  text(`${mob.size.split(':')[0]}. A mock-up: not in the game. ${S} screen pixels to a picture pixel.`, PAD, 42, 15, '#cfc8ff', 600);
  let y = HEAD;
  rows.forEach((row, i) => {
    views.forEach((v, j) => {
      text(`${row.title}, ${v === 'front' ? 'facing you' : 'facing away'}`, PAD, y + 3, 17, '#ffd866', 700);
      y += NAME;
      sps[i][j].forEach((sp, k) => {
        const x = PAD + k * (cw + PAD);
        pane(x, y, cw, ch, S, [{ sp, fx: x + (M + l) * S, fy: y + (M + u) * S, shadow: mob.shadow }]);
        text(row.cells[k].label, x + cw / 2, y + ch + 4, 14, '#e8e2ff', 500, 'center');
      });
      y += ch + LAB + PAD;
    });
  });
  win.__ready = true;
}

// ---------------------------------------------------------------------------------------------
// shadefilm: the Shade's rake, its claws glinting, facing you and facing away

if (mode === 'shadefilm') {
  const S = Number(parts[1]) || 4;
  const FPS = 30;
  const art = makeShadeArt3();
  const START = 0.5;
  const rakes = [clipOf(art.front, 'attack'), clipOf(art.back, 'attack')];
  const LONG = longOf(rakes[0]);
  const ROUND = START + LONG + 0.6;
  const TICKS = Math.round(ROUND * FPS);
  const sets = [art.front, art.back];
  const frameOf = (j: number, t: number): Sprite => (t >= START && t < START + LONG ? frameAt(rakes[j], t - START) : standingAt(sets[j], t));
  let [l, r, u, d] = [0, 0, 0, 0];
  for (let i = 0; i < TICKS; i++) for (let j = 0; j < 2; j++) {
    const [p, q, e, f] = reachOf(frameOf(j, i / FPS));
    l = Math.max(l, p);
    r = Math.max(r, q);
    u = Math.max(u, e);
    d = Math.max(d, f);
  }
  const PAD = 10;
  const M = 8;
  const cw = (l + r + 2 * M) * S;
  const ch = (u + Math.max(d, 10) + 2 * M) * S;
  const HEAD = 58;
  cv.width = PAD + 2 * (cw + PAD);
  cv.height = HEAD + ch + 34;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    const w = t - START;
    const said = w < 0 || w >= LONG ? 'The Shade’s rake' : w < SHADE_HIT ? 'The Shade’s rake: its claws drawn back over its hood, glinting' : 'The Shade’s rake: down and through with both claws';
    text(said, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. Its warning: the pose and the glint, nothing on the floor', PAD, 32, 14, '#cfc8ff', 600);
    for (let j = 0; j < 2; j++) {
      const x = PAD + j * (cw + PAD);
      pane(x, HEAD, cw, ch, S, [{ sp: frameOf(j, t), fx: x + (M + l) * S, fy: HEAD + (M + u) * S, shadow: SHADE.shadow }]);
      text(j === 0 ? 'facing you' : 'facing away', x + cw / 2, HEAD + ch + 6, 15, '#e8e2ff', 600, 'center');
    }
  });
}

// ---------------------------------------------------------------------------------------------
// bwfilm: the Boneward's thrust; then its spear throw, the spear in flight and lying, the shield bash
// while it has none, and picking it up

if (mode === 'bwfilm') {
  const S = Number(parts[1]) || 3;
  const FPS = 30;
  const art = makeBonewardArt3();
  const s = art.front;
  const thrust = clipOf(s, 'attack');
  const thrown = clipOf(s, 'throw');
  const bash = clipOf(s, 'bash');
  const pick = clipOf(s, 'pickUp');
  const bare = clipOf(s, 'standBare');
  const plod = clipOf(s, 'walkBare');
  /** Where it stops to pick its spear up (tiles along the grid's x), and its pace. */
  const STOP = 1.8;
  const PACE = BONEWARD.pace;
  // the moments of the film
  const T_THRUST = 0.3;
  const T_THROW = T_THRUST + longOf(thrust) + 0.4;
  const T_BARE = T_THROW + longOf(thrown);
  const T_BASH = T_BARE + 0.3;
  const T_WALK = T_BASH + longOf(bash);
  const T_PICK = T_WALK + STOP / PACE;
  const T_DONE = T_PICK + longOf(pick);
  const ROUND = T_DONE + 0.7;
  const TICKS = Math.round(ROUND * FPS);
  // where the spear leaves its hand, where its hand will close on it, and so where it lands
  const [rx, ry, rz] = onFloorOf(handAt(BONEWARD, 'throw', BW_THROW_HIT), 0, 0);
  const [gx, gy] = onFloorOf(handAt(BONEWARD, 'pickUp', BW_GRAB), STOP, 0);
  const MID = (0.5 - SPEAR_GRIP) * SPEAR_TILES;
  const from = { x: rx + MID, y: ry, z: rz };
  const to = { x: gx + MID, y: gy };
  const FLY = Math.hypot(to.x - from.x, to.y - from.y) / 7;
  const T_FLY = T_THROW + BW_THROW_HIT;
  const ARC = 7;
  type State = { sp: Sprite; x: number; spear: 'held' | 'flying' | 'lying'; k: number; said: string };
  const state = (t: number): State => {
    const spearNow = (): Pick<State, 'spear' | 'k'> => (t < T_FLY ? { spear: 'held', k: 0 } : t < T_FLY + FLY ? { spear: 'flying', k: (t - T_FLY) / FLY } : t < T_PICK + BW_GRAB ? { spear: 'lying', k: 1 } : { spear: 'held', k: 0 });
    if (t < T_THRUST) return { sp: standingAt(s, t), x: 0, ...spearNow(), said: 'The Boneward: its two attacks' };
    if (t < T_THROW - 0.4) return { sp: frameAt(thrust, t - T_THRUST), x: 0, ...spearNow(), said: t - T_THRUST < BW_HIT ? 'Its thrust: the spear drawn back over the shield, its head glinting' : 'Its thrust: driven past the shield’s edge' };
    if (t < T_THROW) return { sp: standingAt(s, t), x: 0, ...spearNow(), said: 'Its thrust: driven past the shield’s edge' };
    if (t < T_BARE) return { sp: frameAt(thrown, t - T_THROW), x: 0, ...spearNow(), said: t - T_THROW < BW_THROW_HIT ? 'Its spear throw: raised like a javelin, its head glinting' : 'Its spear throw: hurled from afar' };
    if (t < T_BASH) return { sp: frameAt(bare, t - T_BARE), x: 0, ...spearNow(), said: 'Its spear gone, it fights with its shield...' };
    if (t < T_WALK) return { sp: frameAt(bash, t - T_BASH), x: 0, ...spearNow(), said: 'Its spear gone, it fights with its shield...' };
    if (t < T_PICK) return { sp: frameAt(plod, t - T_WALK), x: (t - T_WALK) * PACE, ...spearNow(), said: '...until it picks its spear up' };
    if (t < T_DONE) return { sp: frameAt(pick, t - T_PICK), x: STOP, ...spearNow(), said: '...until it picks its spear up' };
    return { sp: standingAt(s, t), x: STOP, ...spearNow(), said: '...until it picks its spear up' };
  };
  // the pane: every frame of it where it stands, and the spear's way
  let [l, r, u, d] = [0, 0, 0, 0];
  const grow = (px: number, py: number): void => {
    l = Math.max(l, -px);
    r = Math.max(r, px);
    u = Math.max(u, -py);
    d = Math.max(d, py);
  };
  for (let i = 0; i < TICKS; i++) {
    const st = state(i / FPS);
    const [a, b, e, f] = reachOf(st.sp);
    const [ox, oy] = ISO(st.x, 0);
    grow(ox * 2 - a, oy * 2 - e);
    grow(ox * 2 + b, oy * 2 + f);
  }
  const [tx, ty] = ISO(to.x + SPEAR_TILES / 2, to.y);
  grow(tx * 2 + 10, ty * 2 + 10);
  const PAD = 10;
  const M = 8;
  const W = (l + r + 2 * M) * S;
  const H = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = Math.max(W + 2 * PAD, 680);
  cv.height = HEAD + H + 34;
  const X0 = Math.round((cv.width - W) / 2);
  const fx0 = X0 + (M + l) * S;
  const fy0 = HEAD + (M + u) * S;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    const st = state(t);
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(st.said, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. Its warnings: the pose and the glint, nothing on the floor', PAD, 32, 14, '#cfc8ff', 600);
    const lying = st.spear === 'lying' ? (c: CanvasRenderingContext2D): void => drawSpearLying(c, ISO, to.x, to.y, 1, 0) : undefined;
    const flying =
      st.spear === 'flying'
        ? (c: CanvasRenderingContext2D): void => {
            const k = st.k;
            drawSpearShot(c, ISO, from.x + (to.x - from.x) * k, from.y + (to.y - from.y) * k, from.z * (1 - k) + 4 * ARC * k * (1 - k), 1, 0);
          }
        : undefined;
    pane2(X0, HEAD, W, H, S, fx0, fy0, [{ sp: st.sp, x: st.x, y: 0, shadow: BONEWARD.shadow }], lying, flying, [[to.x, to.y]]);
    text('The Boneward', X0 + W / 2, HEAD + H + 6, 15, '#ffd866', 700, 'center');
  });
}

// ---------------------------------------------------------------------------------------------
// golemfilm: the Golem's club swing; then its skull throw: the skull thrown up high, coming down on
// where it was aimed, its shadow there on the floor growing as it falls, and bursting

if (mode === 'golemfilm') {
  const S = Number(parts[1]) || 2;
  const FPS = 30;
  const art = makeGolemArt3();
  const s = art.front;
  const swing = clipOf(s, 'attack');
  const thrown = clipOf(s, 'throw');
  const skulls = makeSkullShotArt();
  const T_SWING = 0.4;
  const T_THROW = T_SWING + longOf(swing) + 0.5;
  const T_FLY = T_THROW + GOLEM_THROW_HIT;
  /** How long the skull is in the air, how high it goes (the game's pixels), and where it comes down (tiles along the grid's x). */
  const FLY = 1.1;
  const TOP = 100;
  const LAND = 3.6;
  const T_LAND = T_FLY + FLY;
  const ROUND = Math.max(T_THROW + longOf(thrown), T_LAND + SKULL_BURST) + 0.6;
  const TICKS = Math.round(ROUND * FPS);
  const [hx, hy, hz] = onFloorOf(handAt(GOLEM, 'throw', GOLEM_THROW_HIT), 0, 0);
  /** The skull `k` of the way through its flight: thrown up and forward, over where it was aimed by half way, and falling onto it. */
  const skullAt = (k: number): [number, number, number] => {
    const over = Math.min(1, k / 0.6);
    const x = hx + (LAND - hx) * (1 - (1 - over) ** 2);
    const UP = 0.45;
    const z = k < UP ? hz + (TOP - hz) * (1 - (1 - k / UP) ** 2) : TOP * (1 - ((k - UP) / (1 - UP)) ** 2);
    return [x, hy, Math.max(0, z)];
  };
  const golemAt = (t: number): { sp: Sprite; said: string } => {
    if (t >= T_SWING && t < T_SWING + longOf(swing)) return { sp: frameAt(swing, t - T_SWING), said: t - T_SWING < GOLEM_SWING_HIT ? 'Its club swing: the club dragged up and back, the fire flaring' : 'Its club swing: round in front of it, and through' };
    if (t >= T_THROW && t < T_THROW + longOf(thrown)) return { sp: frameAt(thrown, t - T_THROW), said: t - T_THROW < GOLEM_THROW_HIT ? 'Its skull throw: it pulls a skull off its shoulders and rears back' : 'Its skull throw: hurled high, it comes down where its shadow is' };
    if (t >= T_THROW) return { sp: standingAt(s, t), said: t < T_LAND + SKULL_BURST ? 'Its skull throw: hurled high, it comes down where its shadow is' : 'The Ossuary Golem: its two attacks' };
    return { sp: standingAt(s, t), said: t < T_SWING ? 'The Ossuary Golem: its two attacks' : 'Its club swing: round in front of it, and through' };
  };
  let [l, r, u, d] = [0, 0, 0, 0];
  const grow = (px: number, py: number): void => {
    l = Math.max(l, -px);
    r = Math.max(r, px);
    u = Math.max(u, -py);
    d = Math.max(d, py);
  };
  for (let i = 0; i < TICKS; i++) {
    const [a, b, e, f] = reachOf(golemAt(i / FPS).sp);
    grow(-a, -e);
    grow(b, f);
  }
  for (let k = 0; k <= 1; k += 0.05) {
    const [x, y, z] = skullAt(k);
    const [px, py] = ISO(x, y);
    grow(px * 2 + 14, (py - z) * 2 - 14);
  }
  const [lx, ly] = ISO(LAND, hy);
  grow(lx * 2 + 40, ly * 2 + 24);
  const PAD = 10;
  const M = 8;
  const W = (l + r + 2 * M) * S;
  const H = (u + d + 2 * M) * S;
  const HEAD = 58;
  cv.width = Math.max(W + 2 * PAD, 680);
  cv.height = HEAD + H + 34;
  const X0 = Math.round((cv.width - W) / 2);
  const fx0 = X0 + (M + l) * S;
  const fy0 = HEAD + (M + u) * S;
  filmPage(TICKS, FPS, (tick) => {
    const t = tick / FPS;
    const st = golemAt(t);
    g.fillStyle = BG;
    g.fillRect(0, 0, cv.width, cv.height);
    text(st.said, PAD, 8, 17, '#ffd866', 700);
    text('a mock-up: not in the game. No circle on the floor: the skull’s own shadow shows where it will land', PAD, 32, 14, '#cfc8ff', 600);
    const flying = t >= T_FLY && t < T_LAND;
    const k = (t - T_FLY) / FLY;
    const [x, y, z] = flying ? skullAt(k) : [0, 0, 0];
    const shadow = flying ? (c: CanvasRenderingContext2D): void => drawSkullShadow(c, ISO, x, y, z, TOP) : undefined;
    const burst = t >= T_LAND && t < T_LAND + SKULL_BURST ? (c: CanvasRenderingContext2D): void => drawSkullBurst(c, ISO, LAND, hy, t - T_LAND) : undefined;
    pane2(X0, HEAD, W, H, S, fx0, fy0, [{ sp: st.sp, x: 0, y: 0, shadow: GOLEM.shadow }], shadow, burst, [[LAND, hy]]);
    if (flying) {
      g.save();
      g.beginPath();
      g.rect(X0, HEAD, W, H);
      g.clip();
      inAir(skulls[Math.floor((t - T_FLY) * 16) % skulls.length], x, y, z, fx0, fy0, S);
      g.restore();
    }
    text('The Ossuary Golem', fx0, HEAD + H + 6, 15, '#ffd866', 700, 'center');
  });
}
