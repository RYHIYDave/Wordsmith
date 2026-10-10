// Dev page: THE CRYPT'S FOUR FLOORS (art/crypt.ts), each as a room, and what lies in them.
//   node tools/preview.mjs src/dev/preview_crypt.ts shots/crypt/floors.png 1600 520 "floors:2"
//   node tools/preview.mjs src/dev/preview_crypt.ts shots/crypt/sheet.png 1200 700 "sheet:4"
//   hash = <mode>:<scale>   mode: floors (the four rooms side by side, the vault first), sheet
//   (the rocks, the gear and the timber prop, on stone and on earth), room:<k> (one floor alone)
import { CRYPT_FLOORS, cryptGround, cryptPieces, cryptProps } from '../art/crypt';
import { makeStairwell, makeWaypointArt } from '../art/crypt_ways';
import { VAULT, makeGroundArt } from '../art/ground';
import type { GroundArt } from '../art/ground';
import { makeHeroArt3 } from '../art/heroes3';
import { hash } from '../art/kit';
import { makeDungeonProps } from '../art/props';
import type { DungeonProps } from '../art/props';
import type { Sprite } from '../engine/px';

const [mode = 'floors', scaleArg = '', extra = ''] = decodeURIComponent(location.hash.slice(1)).split(':');
const S = Number(scaleArg) || 2;

const cv = document.createElement('canvas');
const g = cv.getContext('2d') as CanvasRenderingContext2D;
function size(w: number, h: number): void {
  cv.width = w * S;
  cv.height = h * S;
  cv.style.display = 'block';
  document.body.style.margin = '0';
  document.body.style.background = '#000';
  document.body.appendChild(cv);
  g.imageSmoothingEnabled = false;
  g.setTransform(S, 0, 0, S, 0, 0);
  g.fillStyle = '#07050a';
  g.fillRect(0, 0, w, h);
}
const draw = (s: Sprite, x: number, y: number): void => {
  g.drawImage(s.img, Math.round(x) - s.ax, Math.round(y) - s.ay, s.w, s.h);
};
const label = (t: string, x: number, y: number): void => {
  g.fillStyle = '#a3abd8';
  g.font = '8px monospace';
  g.fillText(t, x, y);
};

/** A room of N x N tiles: walls along its two far sides (as the game shows them: faces alone), a stub of wall in it, floor elsewhere. */
function room(ground: GroundArt, props: DungeonProps, ox: number, oy: number, N: number, seed: number): void {
  const wall = (tx: number, ty: number): boolean => tx === 0 || ty === 0 || (tx === 5 && ty >= 2 && ty <= 3);
  const at = (x: number, y: number): [number, number] => [ox + (x - y) * 16, oy + (x + y) * 8];
  interface Stand { d: number; s: Sprite; x: number; y: number }
  const stands: Stand[] = [];
  for (let s = 0; s <= 2 * (N - 1); s++) {
    for (let tx = 0; tx < N; tx++) {
      const ty = s - tx;
      if (ty < 0 || ty >= N) continue;
      const [x, y] = at(tx, ty);
      const v = Math.floor(hash(tx + seed, ty, 9) * 256);
      if (wall(tx, ty)) {
        // (a face only where floor lies before it)
        if (ty + 1 < N && !wall(tx, ty + 1)) stands.push({ d: s + 1, s: ground.faceLeft[v % ground.faceLeft.length], x, y });
        if (tx + 1 < N && !wall(tx + 1, ty)) stands.push({ d: s + 1, s: ground.faceRight[v % ground.faceRight.length], x, y });
      } else {
        draw(ground.floor(tx, ty), x, y);
        const wl = wall(tx - 1, ty);
        const wr = wall(tx, ty - 1);
        if (wl) draw(ground.shadeLeft, x, y);
        if (wr) draw(ground.shadeRight, x, y);
        if (!wl && !wr && wall(tx - 1, ty - 1)) draw(ground.shadeCorner, x, y);
        if (tx === N - 1) draw(ground.edgeRight, x, y);
        if (ty === N - 1) draw(ground.edgeLeft, x, y);
      }
    }
  }
  // what lies on the floor: every one of this floor's list, in turn, and some bones
  const spots: [number, number][] = [[2.5, 4.5], [3.6, 7.2], [6.5, 6.4], [7.6, 2.4], [4.4, 1.6], [8.2, 5.2], [1.6, 2.4], [6.2, 8.3], [2.4, 8.1], [8.4, 7.8], [1.5, 6.3], [7.3, 4.0]];
  spots.forEach(([x, y], i) => {
    const list = i % 4 === 3 ? props.bones : props.rubble;
    draw(list[(i + seed) % list.length], ...at(x, y));
  });
  const hero = makeHeroArt3().of('warrior', { twoHanded: false });
  for (const [s, x, y] of [[props.pillar, 3.5, 3.5], [props.pillar, 7.5, 6.5], [props.brazier[0], 1.5, 1.5], [hero.front.idle[0], 5.5, 5.5]] as const) {
    const [px, py] = at(x, y);
    stands.push({ d: x + y, s, x: px, y: py });
  }
  stands.sort((a, b) => a.d - b.d);
  for (const st of stands) draw(st.s, st.x, st.y);
}

if (mode === 'floors' || mode === 'room') {
  const N = 10;
  const RW = N * 32 + 24;
  const RH = N * 16 + 60;
  const which = mode === 'room' ? [Number(extra) || 1] : [0, 1, 2, 3, 4];
  size(RW * which.length, RH + 14);
  which.forEach((k, i) => {
    const ground = k === 0 ? makeGroundArt(VAULT) : cryptGround(k);
    const props = k === 0 ? makeDungeonProps(VAULT) : cryptProps(k);
    room(ground, props, i * RW + RW / 2, 44, N, k * 3);
    label(k === 0 ? 'the vault (the game now)' : `${CRYPT_FLOORS[k - 1].id}`, i * RW + 8, RH + 10);
  });
} else if (mode === 'sheet') {
  // the pieces at their size in the game, on a patch of floor 4 (stone and earth)
  const W = 560;
  const H = 300;
  size(W, H);
  const ground = cryptGround(4);
  const ox = W / 2;
  const oy = 10;
  for (let tx = 0; tx < 16; tx++) for (let ty = 0; ty < 16; ty++) {
    const x = ox + (tx - ty) * 16;
    const y = oy + (tx + ty) * 8;
    if (x < -40 || x > W + 40 || y > H + 20) continue;
    draw(ground.floor(tx, ty), x, y);
  }
  const p4 = cryptPieces(4);
  const pieces: Sprite[] = [...p4.rocks, p4.gear.pick, p4.gear.shovel, p4.gear.bucket, p4.gear.rail, p4.gear.sledge];
  pieces.forEach((s, i) => draw(s, 50 + (i % 5) * 70, 120 + Math.floor(i / 5) * 60));
  draw(p4.prop, 420, 200);
  draw(makeDungeonProps(VAULT).pillar, 480, 200);
  const hero = makeHeroArt3().of('warrior', { twoHanded: false });
  draw(hero.front.idle[0], 520, 200);
}
else if (mode === 'pieces') {
  // every piece by itself, big, on a tile of earth and a tile of stone of floor 4: [rocks x3, the gear, the prop]
  const p4 = cryptPieces(Number(extra) || 4);
  const ground = cryptGround(Number(extra) || 4);
  const list: Sprite[] = [...p4.rocks, p4.gear.pick, p4.gear.shovel, p4.gear.bucket, p4.gear.rail, p4.gear.sledge];
  const CW = 70;
  size(CW * 5 + 70, 2 * 46 + 10);
  list.forEach((s, i) => {
    const x = 35 + (i % 5) * CW;
    const y = 26 + Math.floor(i / 5) * 46;
    // (a patch of floor under it: four tiles round the spot)
    for (const [dx, dy] of [[0, -1], [-1, 0], [0, 0], [-1, -1]] as const) draw(ground.floor(3 + i * 2 + dx, 7 + dy), x + (dx - dy) * 16, y - 8 + (dx + dy) * 8);
    draw(s, x, y);
  });
  draw(p4.prop, CW * 5 + 30, 92);
}
else if (mode === 'stairs') {
  // the stairwell going down each way, on each floor, in a patch of that floor
  const ks = [1, 2, 3, 4];
  const CW = 200;
  size(CW * ks.length, 260);
  ks.forEach((k, i) => {
    const ground = cryptGround(k);
    const theme = CRYPT_FLOORS[k - 1];
    const ox = i * CW + CW / 2;
    for (const [way, oy, ax, ay] of [['x', 20, 4, 2], ['y', 140, 2, 4]] as const) {
      for (let tx = 0; tx < 8; tx++) for (let ty = 0; ty < 8; ty++) {
        const x = ox + (tx - ty) * 16;
        const y = oy + (tx + ty) * 8;
        draw(ground.floor(tx, ty), x, y);
      }
      const sp = makeStairwell(theme, way);
      draw(sp, ox + (ax - ay) * 16, oy + (ax + ay) * 8);
    }
    label(theme.id, i * CW + 6, 250);
  });
}
else if (mode === 'way') {
  // the waypoint: asleep; awake (four frames of its loop); a warp (four frames): on a patch of floor k
  const k = Number(extra) || 2;
  const ground = cryptGround(k);
  const art = makeWaypointArt(CRYPT_FLOORS[k - 1]);
  const shots: [Sprite, Sprite | null][] = [[art.asleep, null], ...[0, 3, 6, 9].map((f) => [art.awake[f], art.motes[f]] as [Sprite, Sprite]), ...[1, 3, 5, 8].map((f) => [art.awake[f], art.warp[f]] as [Sprite, Sprite])];
  const CW = 80;
  size(CW * shots.length, 170);
  shots.forEach((_, i) => {
    const ox = i * CW + CW / 2;
    for (let tx = -2; tx <= 2; tx++) for (let ty = -2; ty <= 2; ty++) draw(ground.floor(tx + 5, ty + 5), ox + (tx - ty) * 16, 112 + (tx + ty) * 8);
  });
  shots.forEach(([base, over], i) => {
    const ox = i * CW + CW / 2;
    draw(base, ox, 120);
    if (over) draw(over, ox, 120);
  });
}
else if (mode === 'warp') {
  // a warp, every one of its frames, on a patch of floor k
  const k = Number(extra) || 2;
  const ground = cryptGround(k);
  const art = makeWaypointArt(CRYPT_FLOORS[k - 1]);
  const CW = 60;
  size(CW * art.warp.length, 170);
  art.warp.forEach((_, i) => {
    const ox = i * CW + CW / 2;
    for (let tx = -2; tx <= 2; tx++) for (let ty = -2; ty <= 2; ty++) draw(ground.floor(tx + 5, ty + 5), ox + (tx - ty) * 16, 132 + (tx + ty) * 8);
  });
  art.warp.forEach((w, i) => {
    const ox = i * CW + CW / 2;
    draw(art.awake[i % art.awake.length], ox, 140);
    draw(w, ox, 140);
    label(String(i), ox - 3, 166);
  });
}
(window as unknown as { __ready: boolean }).__ready = true;
