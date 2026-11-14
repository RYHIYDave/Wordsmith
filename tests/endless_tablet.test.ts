// ENDLESS MODE'S KEY (the art chat's of 12 Nov 2026, the queue's draw-endless-tablet-portal-final-boss): the tablet, the portal and
// the final boss's look, behind ENDLESS_TABLET (off). Pictures only; nothing of the game reads them yet.
// @ts-ignore
import test from 'node:test';
// @ts-ignore
import assert from 'node:assert/strict';
// @ts-ignore
import { readFileSync, readdirSync } from 'node:fs';
import { ENDLESS_TABLET, QUARTER_N, SOCKET_LIT_FRAMES, SOCKET_PIC, paintQuarter, paintSocketTablet } from '../src/art/endless_tablet';
import { PORTAL_FLOOR, PORTAL_OPEN_FRAMES, PORTAL_RISE, paintPortalFloor, paintPortalRise, portalAt } from '../src/art/endless_portal';
import { FLAME } from '../src/art/mkit';
import { RARITY_COLOR } from '../src/art/palette';
import { SPARK } from '../src/art/kit';

const PINKISH = (c: string): boolean => {
  const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16);
  return r > 150 && r - g > 80 && b > 60 && b < r;
};

test('the switch is off, and nothing of the game imports these files', () => {
  assert.equal(ENDLESS_TABLET.on, false);
  const walk = (dir: string): string[] => readdirSync(dir, { withFileTypes: true }).flatMap((e: { isDirectory: () => boolean; name: string }) => (e.isDirectory() ? walk(`${dir}/${e.name}`) : e.name.endsWith('.ts') ? [`${dir}/${e.name}`] : []));
  for (const f of walk('src').filter((f) => !f.startsWith('src/dev/') && !/endless_(tablet|portal|boss)\.ts$/.test(f))) {
    const s = readFileSync(f, 'utf8');
    assert.ok(!/from '\.\/endless_(tablet|portal|boss)'|art\/endless_(tablet|portal|boss)'/.test(s), `${f} imports it`);
  }
});

test('each quarter is an item picture: 32 x 32, its rim the rarity colour, nothing pink, nothing cyan', () => {
  for (let k = 0; k < 4; k++) {
    const p = paintQuarter(k);
    assert.equal(p.w, QUARTER_N);
    assert.equal(p.h, QUARTER_N);
    let rim = 0;
    let painted = 0;
    for (let y = 0; y < p.h; y++) for (let x = 0; x < p.w; x++) {
      const c = p.get(x, y);
      if (!c) continue;
      painted++;
      if (c === RARITY_COLOR[3]) rim++;
      assert.ok(!SPARK.includes(c as never), `quarter ${k}: cyan at ${x},${y}`);
      assert.ok(!PINKISH(c), `quarter ${k}: pink ${c} at ${x},${y}`);
    }
    assert.ok(painted > 400, `quarter ${k} fills its frame (${painted})`);
    assert.ok(rim > 60, `quarter ${k} has its rim (${rim})`);
    // (the rim never touches the slot's frame on the left or the top)
    for (let i = 0; i < QUARTER_N; i++) assert.equal(p.get(0, i) === RARITY_COLOR[3] && p.get(i, 0) === RARITY_COLOR[3], false);
  }
});

test('the socket: dark, it holds no glow and gives no light; burning, only the friend’s cyan, and its frames go round', () => {
  const dark = paintSocketTablet([true, true, true, true], -1);
  assert.equal(dark.px.w, SOCKET_PIC.w);
  assert.equal(dark.px.h, SOCKET_PIC.h);
  assert.equal(dark.lights?.length ?? 0, 0);
  for (let y = 0; y < dark.px.h; y++) for (let x = 0; x < dark.px.w; x++) assert.ok(!SPARK.includes(dark.px.get(x, y) as never));
  // (three of four set: they lie dark, and it does not burn even if asked)
  assert.equal(paintSocketTablet([true, true, false, true], 30).lights?.length ?? 0, 0);
  for (const f of [0, 10, 30, 60, SOCKET_LIT_FRAMES + 5]) {
    const lit = paintSocketTablet([true, true, true, true], f);
    assert.ok((lit.lights ?? []).every((l) => l.color === SPARK[2]), `frame ${f}: a light not cyan`);
    for (let y = 0; y < lit.px.h; y++) for (let x = 0; x < lit.px.w; x++) {
      const c = lit.px.get(x, y);
      if (c) assert.ok(!PINKISH(c) && !FLAME.includes(c as never), `frame ${f}: enemy colour at ${x},${y}`);
    }
  }
  // (past its last frame it burns on round its burning frames)
  const a = paintSocketTablet([true, true, true, true], SOCKET_LIT_FRAMES + 3).px;
  const b = paintSocketTablet([true, true, true, true], SOCKET_LIT_FRAMES - 48 + 3).px;
  assert.deepEqual(a.d, b.d);
});

test('the portal: shut, nothing; it opens in order; open, the boss’s pink only in the well’s heart', () => {
  assert.equal(portalAt(-1).back, 0);
  let last = -1;
  for (let f = 0; f < PORTAL_OPEN_FRAMES + 40; f++) {
    const st = portalAt(f);
    assert.ok(st.back >= last - 0.05, `frame ${f}: the quarters went back the wrong way`);
    last = st.back;
  }
  const shut = paintPortalFloor(-1);
  assert.equal(shut.px.w, PORTAL_FLOOR.w);
  let any = 0;
  for (let y = 0; y < shut.px.h; y++) for (let x = 0; x < shut.px.w; x++) if (shut.px.get(x, y)) any++;
  assert.equal(any, 0);
  const open = paintPortalFloor(PORTAL_OPEN_FRAMES + 10);
  let pink = 0;
  for (let y = 0; y < open.px.h; y++) for (let x = 0; x < open.px.w; x++) {
    const c = open.px.get(x, y);
    if (c && PINKISH(c)) {
      pink++;
      // (only far down: under the middle of the opening)
      assert.ok(Math.abs(x - PORTAL_FLOOR.ox) < 16 && y > PORTAL_FLOOR.oy, `pink at ${x},${y}`);
    }
  }
  assert.ok(pink > 0, 'the boss’s pink is seen far below');
  const rise = paintPortalRise(40);
  assert.equal(rise.px.h, PORTAL_RISE.h);
  for (let y = 0; y < rise.px.h; y++) for (let x = 0; x < rise.px.w; x++) {
    const c = rise.px.get(x, y);
    if (c) assert.ok(!PINKISH(c), `the rising light holds pink at ${x},${y}`);
  }
});
