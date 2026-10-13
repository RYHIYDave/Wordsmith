// Dev page: THE CULT'S CAMP, the set's twenty camp pieces (art/act1_camp.ts), for the owner to look at.
// Nothing of the game imports it.
//
//   node tools/preview.mjs src/dev/preview_camp.ts shots/camp.png 1014 468
//     one phone screen: a camp of the cult dug in on a terrace of the Quarry (the Quarry's ground, his
//     yes by 10:19 on 13 Oct; the camp stands on every floor of the five, the Quarry is where it is shown)
//   node tools/preview.mjs src/dev/preview_camp.ts shots/camp_sheet.png 1014 1272 sheet
//     every piece and its frames, at the game's size, each on a patch of the Quarry's bed, named

import { campPieces } from '../art/act1_camp';
import { makeDaggerCultistArt3, makeMiniFleshmancerArt3 } from '../art/cultists';
import { quarryPieces } from '../art/floor6';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { P } from '../art/palette';
import { QUARRY_LOOK } from '../art/quarry';
import { clearOfFloor, paintTerrain, worldOf } from '../art/terrain';
import { drawText } from '../engine/font';
import type { Sprite } from '../engine/px';
import { THEME } from '../ui/ui';
import { PW, Stage, area, at, drawAt, layTiles, path, union } from './act1_stage';

const HASH = decodeURIComponent(location.hash.slice(1)) || 'camp';
/** The film's frame (hash `camp:<n>`, 0 to 15, at about 8 a second): the fires leap, the trap goes off. */
const T = Number(HASH.split(':')[1] ?? 0) | 0;

const all = (): ReturnType<typeof campPieces> => [...campPieces(), ...quarryPieces()];
const piece = (name: string, frame = 0): Sprite => {
  const pc = all().find((q) => q.name === name);
  if (!pc || !pc.frames) throw new Error(`no piece ${name}`);
  return pc.frames[frame];
};
const shadowOf = (name: string): number | undefined => all().find((q) => q.name === name)?.shadow;

// THE PLACE: a broad terrace of the Quarry, the camp on it, the way in up a cut from the lower left
const shape = union(
  area(520, 290, 7.6, 5.6, 0.2),
  area(860, 190, 3.2, 2.6, -0.2),
  path([[600, 250], [760, 210], [860, 190]], 2.4),
  path([[330, 330], [240, 390], [150, 450], [100, 490]], 1.6),
);
const FLOOR = layTiles(shape, 48, 48);
const S = new Stage(FLOOR, QUARRY_LOOK);

if (HASH === 'sheet') sheet();
else camp();

function camp(): void {
  S.ground();
  const onFloor = (px: number, py: number, name: string, frame = 0, tall = false): void => {
    const [x, y] = at(px, py);
    if (!S.T.ground(x, y)) console.warn('off the floor:', name, px, py);
    S.put({ x, y, sp: piece(name, frame), tall, shadow: shadowOf(name) });
  };
  // the trap on the way in, just ahead of the knight: its plate, its warning, then it goes off
  const plate = at(262, 382);
  const ptx = Math.floor(plate[0]);
  const pty = Math.floor(plate[1]);
  const TRAP = [0, 0, 0, 0, 1, 1, 1, 1, 2, 3, 3, 3, 4, 4, 0, 0][T % 16];
  S.tile(piece("the cult's fire trap", TRAP >= 2 ? 0 : TRAP), ptx, pty);
  if (TRAP >= 2) S.put({ x: ptx + 0.5, y: pty + 0.5, sp: piece("the cult's fire trap", TRAP) });
  // the camp
  onFloor(520, 196, "the cult's pavilion", 0, true);
  onFloor(372, 222, "the cult's tent", 0, true);
  onFloor(690, 222, "the cult's tent", 1, true);
  onFloor(782, 250, "the cult's tent", 0, true);
  onFloor(510, 300, "the cult's watchfire", T % 4);
  onFloor(452, 326, 'bedroll', 0);
  onFloor(574, 328, 'bedroll', 1);
  onFloor(406, 290, "the cult's cauldron", (T + 2) % 4);
  onFloor(515, 246, 'offering bowl');
  onFloor(588, 238, 'war drum');
  onFloor(612, 286, 'the skull standard');
  onFloor(338, 318, 'the skull standard');
  onFloor(625, 210, 'weapon rack');
  onFloor(660, 336, 'supply crates', 0);
  onFloor(694, 350, 'sacks of grain', 0);
  onFloor(628, 362, 'firepots', 0);
  onFloor(740, 318, "the captives' cage", 0);
  onFloor(300, 350, 'stakes', 0);
  onFloor(880, 214, 'lean-to');
  onFloor(452, 380, 'a cold fire');
  onFloor(892, 178, 'sacks of grain', 1);
  // its people
  const dagger = makeDaggerCultistArt3();
  const mini = makeMiniFleshmancerArt3();
  for (const [px, py] of [[470, 300], [548, 312], [360, 340]] as const) {
    const [x, y] = at(px, py);
    S.put({ x, y, sp: dagger.front.idle[0], figure: true, shadow: 0.45 });
  }
  {
    const [x, y] = at(556, 262);
    S.put({ x, y, sp: mini.front.idle[0], figure: true, shadow: 0.45 });
  }
  const HERO = at(236, 404);
  S.put({ x: HERO[0], y: HERO[1], sp: spriteOf3(MOVES3.rear, 0, 'front'), figure: true, shadow: 0.5 });
  // the tops: the lookout and the hoist over the camp (each at the first of its spots that stands clear
  // of the floor), dead trees and the mountain's pines, never over the floor
  const RISE = QUARRY_LOOK.rise;
  const onTop = (spots: [number, number][], name: string, hw: number, h: number): [number, number] | null => {
    for (const [px, py] of spots) {
      if (!clearOfFloor(S.T, S.VX + px, S.VY + py, hw, h)) continue;
      const [x, y] = worldOf(S.VX + px, S.VY + py + RISE);
      S.put({ x, y, sp: piece(name), lift: RISE, shadow: shadowOf(name) });
      return [x, y];
    }
    console.warn('no room on the tops for', name);
    return null;
  };
  const tower = onTop([[150, 200], [120, 180], [170, 150], [90, 210], [930, 300], [960, 280]], "the cult's lookout", 34, 190);
  const crane = onTop([[950, 430], [970, 400], [930, 450], [60, 300], [70, 250]], "the cult's hoist", 50, 130);
  const near = (x: number, y: number, at0: [number, number] | null, r: number): boolean => !!at0 && Math.hypot(x - at0[0], y - at0[1]) < r;
  S.dressTops((roll, grove, k) => {
    if (grove > 0.62 && roll < 0.36) {
      const sp = piece('pine', k < 0.33 ? 0 : k < 0.7 ? 1 : 2);
      return { sp, hw: 30, h: sp.h * 2 };
    }
    if (roll < 0.03) return { sp: piece('dead tree', k < 0.5 ? 0 : 1), hw: 40, h: 150 };
    if (roll < 0.06) return { sp: piece('boulder', Math.floor(k * 3)), hw: 22, h: 30 };
    if (roll < 0.064) return { sp: piece("the cult's banner", Math.floor(k * 4)), hw: 24, h: 130 };
    return null;
  }, (x, y) => near(x, y, tower, 2.2) || near(x, y, crane, 2.6));
  S.standAll();
  S.lights();
  S.nameAndMap('The Quarry', HERO);
  S.show();
}

/** Every piece and its frames, at the game's size, each on a patch of the Quarry's bed, named. */
function sheet(): void {
  const COLS = 6;
  const CW = Math.floor(PW / COLS);
  const CH = 212;
  const cells: { label: string; sp: Sprite; tile: boolean }[] = [];
  const label = (name: string, i: number, n: number): string => {
    const short: Record<string, string> = {
      "the cult's tent": 'tent',
      "the cult's pavilion": 'pavilion',
      "the cult's watchfire": 'watchfire',
      "the cult's cauldron": 'cauldron',
      "the captives' cage": 'cage',
      'the skull standard': 'skull standard',
      "the cult's lookout": 'lookout',
      "the cult's hoist": 'hoist',
      "the cult's fire trap": 'fire trap',
      'supply crates': 'crates',
      'sacks of grain': 'sacks',
    };
    const s = short[name] ?? name;
    if (name === "the cult's fire trap") return ['fire trap', 'its warning', 'bursting', 'at its height', 'dying down'][i];
    if (n === 2 && /crates|sacks|firepots/.test(name)) return i ? `${s}, broken` : s;
    if (n === 2 && name === "the cult's tent") return i ? 'tent, open' : 'tent';
    if (n === 2 && name === "the captives' cage") return i ? 'cage, open' : 'cage';
    if (n === 2 && name === 'bedroll') return i ? 'bedroll, rolled' : 'bedroll';
    if (n === 2 && name === 'stakes') return i ? 'stakes, along y' : 'stakes';
    return n > 1 && n !== 4 ? `${s} ${i + 1}` : s;
  };
  for (const pc of campPieces()) {
    const frames = pc.frames ?? [];
    const n = frames.length;
    frames.forEach((sp, i) => {
      if (n === 4 && i > 0) return; // (a fire's other frames are the film's)
      cells.push({ label: label(pc.name, i, n), sp, tile: pc.kind === 'floor tile' || (pc.kind === 'trap' && i < 2) });
    });
  }
  const rows = Math.ceil(cells.length / COLS);
  const cvs = document.createElement('canvas');
  cvs.width = PW;
  cvs.height = rows * CH;
  const g = cvs.getContext('2d') as CanvasRenderingContext2D;
  g.imageSmoothingEnabled = false;
  g.fillStyle = '#0d1030';
  g.fillRect(0, 0, cvs.width, cvs.height);
  const bw = CW - 6;
  const bh = CH - 22;
  const p = paintTerrain(S.T, S.VX + 420, S.VY + 190, bw, bh);
  const bed = document.createElement('canvas');
  bed.width = bw;
  bed.height = bh;
  (bed.getContext('2d') as CanvasRenderingContext2D).putImageData(new ImageData(p.rgba, bw, bh), 0, 0);
  cells.forEach((c, n) => {
    const ox = (n % COLS) * CW + 3;
    const oy = Math.floor(n / COLS) * CH + 2;
    g.drawImage(bed, ox, oy + 18);
    const ax = ox + Math.round(bw / 2);
    const ay = c.tile ? oy + 18 + Math.round(bh / 2) - 16 : oy + CH - 14;
    drawAt(g, c.sp, ax, ay);
    g.save();
    g.scale(2, 2);
    drawText(g, c.label, ox / 2 + 1, oy / 2 + 1, THEME.text, { shadow: P.ink });
    g.restore();
  });
  document.body.style.margin = '0';
  document.body.style.background = '#0d1030';
  document.body.appendChild(cvs);
  (window as unknown as { __ready: boolean }).__ready = true;
}
