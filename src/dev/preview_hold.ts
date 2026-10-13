// Dev page: THE QUARRY'S CULT STRONGHOLD, THE OVERSEERS' REDOUBT, AT ITS DOOR, as one phone screen of the
// game, in the real art (art/floor6.ts, art/act1_cult.ts, the ground art/terrain.ts with art/quarry.ts's
// look). Nothing of the game imports it. The shape of the place is the planning chat's mock-up he said yes
// to by 09:52 on 13 Oct ("Yes, this is it (Recommended)"; src/dev/preview_act1.ts, hash `hold`): the
// redoubt cut into an old terrace, its paved court before the door, the open ground and the road below.
//   node tools/preview.mjs src/dev/preview_hold.ts shots/hold_door.png 1014 468
//   (hash `open`: the door opened, the words given)

import { makeDaggerCultistArt3, makeMiniFleshmancerArt3 } from '../art/cultists';
import { quarryPieces } from '../art/floor6';
import { spriteOf3 } from '../art/heroes3';
import { MOVES3 } from '../art/moves3';
import { QUARRY_LOOK } from '../art/quarry';
import type { Sprite } from '../engine/px';
import { Stage, area, at, layTiles, path, rect, union } from './act1_stage';

const OPEN = decodeURIComponent(location.hash.slice(1)) === 'open';

const piece = (name: string, frame = 0): Sprite => {
  const pc = quarryPieces().find((q) => q.name === name);
  if (!pc || !pc.frames) throw new Error(`no piece ${name}`);
  return pc.frames[frame];
};
const shadowOf = (name: string): number | undefined => quarryPieces().find((q) => q.name === name)?.shadow;

// THE PLACE, as the mock-up laid it: the door's foot, the court before it, the ground below
const [hx, hy] = at(660, 238);
const CX = Math.round(hx);
const CY = Math.round(hy);
const court = rect(CX - 3, CY, CX + 3, CY + 3);
const natural = union(
  area(480, 336, 6.2, 4.0, 0.25),
  path([[-20, 350], [200, 410], [470, 362], [780, 394], [1040, 342]], 3.2),
  area(890, 326, 3.0, 2.4, -0.2),
  area(690, 336, 3.0, 2.0, -0.2),
  area(780, 318, 2.4, 1.8, -0.2),
);
const shape = (x: number, y: number): boolean => court(x, y) || (natural(x, y) && !(y < CY + 0.7 && Math.abs(x - CX) < 4.1));
const FLOOR = layTiles(shape, 48, 48, court);
const S = new Stage(FLOOR, QUARRY_LOOK);

S.ground();
// the court's flagstones, worn down the middle to the door
for (let ty = CY; ty < CY + 3; ty++) for (let tx = CX - 3; tx < CX + 3; tx++) S.tile(piece("the court's flagstones", tx === CX - 1 || tx === CX ? 2 : (tx + ty) % 2), tx, ty);

// THE REDOUBT, its altar, its fires, its banners
S.put({ x: CX, y: CY, sp: piece("the redoubt's gatehouse", OPEN ? 4 : 1), shadow: 0 });
S.put({ x: CX, y: CY + 1.55, sp: piece('the altar of the words'), shadow: shadowOf('the altar of the words') });
S.put({ x: CX - 2.3, y: CY + 1.1, sp: piece("the cult's brazier", 1), shadow: 0.3 });
S.put({ x: CX + 2.3, y: CY + 1.1, sp: piece("the cult's brazier", 3), shadow: 0.3 });
S.put({ x: CX - 2.6, y: CY + 2.7, sp: piece("the cult's banner", 0), shadow: 0.2 });
S.put({ x: CX + 2.6, y: CY + 2.7, sp: piece("the cult's banner", 2), shadow: 0.2 });
// the quarry's own, about the open ground
const onFloor = (px: number, py: number, name: string, frame = 0, tall = false): void => {
  const [x, y] = at(px, py);
  if (!S.T.ground(x, y)) console.warn('off the floor:', name, px, py);
  S.put({ x, y, sp: piece(name, frame), tall, shadow: shadowOf(name) });
};
onFloor(300, 300, 'stacked blocks');
onFloor(338, 318, 'cut block');
onFloor(870, 322, 'empty cart', 0);
onFloor(420, 372, 'chippings', 1);
onFloor(930, 300, 'block marked to split');
onFloor(240, 380, 'boulder', 1);
// the guards: two of the cult, rare (the game rings them in letters and names them in yellow)
const dagger = makeDaggerCultistArt3();
const mini = makeMiniFleshmancerArt3();
const [gx1, gy1] = at(560, 262);
const [gx2, gy2] = at(716, 330);
S.put({ x: gx1, y: gy1, sp: mini.front.idle[0], figure: true, shadow: 0.45 });
S.put({ x: gx2, y: gy2, sp: dagger.front.idle[0], figure: true, shadow: 0.45 });
const HERO = at(482, 292);
S.put({ x: HERO[0], y: HERO[1], sp: spriteOf3(MOVES3.rear, 0, 'front'), figure: true, shadow: 0.5 });
// the tops dressed, but where the redoubt stands on the terrace
S.dressTops((roll, grove, k) => {
  if (grove > 0.6 && roll < 0.4) {
    const sp = piece('pine', k < 0.33 ? 0 : k < 0.7 ? 1 : 2);
    return { sp, hw: 30, h: sp.h * 2 };
  }
  if (roll < 0.045) return { sp: piece('boulder', Math.floor(k * 3)), hw: 22, h: 30 };
  if (roll < 0.05) return { sp: piece('stacked blocks'), hw: 34, h: 70 };
  return null;
}, (x, y) => Math.abs(x - CX) < 4.8 && y < CY + 0.4 && y > CY - 4.5);
S.standAll();
S.lights();
S.nameAndMap('The Quarry', HERO);
S.show();
