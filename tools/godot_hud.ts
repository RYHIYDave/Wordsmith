// THE HUD'S PICTURES AND COLOURS FOR THE GODOT VERSION (branch godot/port): what ui/hud.ts draws with, for
// godot/scripts/hud.gd to draw the screen as the game does.
//   godot/assets/hud/hud.png + hud.json:
//     pics: { key: [x, y, w, h, ax, ay] } in picture pixels, two to a game pixel: the flask (art.icons.potion), the coin
//       (art.icons.gold[0]), each word's rune (art.icons.word), and the abilities' icons (art.icons.ability, by SKILLS' icon);
//     theme: ui/ui.ts THEME; palette: art/palette.ts P; word_color: art/icons.ts WORD_COLOR; words: each word's forms as the
//       attacks' plates write them (ui/words.ts wordForm: FRONT, BEHIND without its "of"), its name, and what its card says it
//       grows with (defs.ts growsWith); element_ramp: the colours of a move whose words have made it fire, frost or
//       lightning (art/palette.ts ELEMENT_RAMP: its plate's rim, its damage on the gear screen);
//     skills: the Warrior's three (CLASSES.warrior: tap, hold, evade), each { id, name, icon, cooldown, channel };
//     sizes: ui/hud.ts SLOT_W, SLOT_H, PIECE_GAP; places: the name written top left in each place (Game.floorLevel); and the
//     Master Rune-stone's icon (art/quest3.ts), shown there while it is carried.
//   npx tsx tools/godot_hud.ts        (from the repository's root)
import { mkdirSync, writeFileSync } from 'node:fs';
import { crc32, deflateSync } from 'node:zlib';
import type { Sprite } from '../src/engine/px';
import { paintWithoutCanvas, paintingOf } from '../tests/helpers';
import { gameSwitches } from './godot_switches';
import { DEMON_KIT } from '../src/game/warlock';
import type { SkillId } from '../src/game/defs';
import { CLASSES, FLOOR_NAMES, SKILLS, WORDS, floorTitle, growsWith, skillsFor } from '../src/game/defs';
import type { ClassId } from '../src/game/types';
import { makeStoneArt } from '../src/art/quest3';
import { makeMeldDropsArt } from '../src/art/meld_drops';
import { keySprite } from '../src/art/key_bearers_fx';
import { WORD_COLOR, makeIconArt } from '../src/art/icons';
import { ELEMENT_RAMP, P } from '../src/art/palette';
import { THEME } from '../src/ui/ui';
import { wordForm } from '../src/ui/words';
import { useMeldLooks } from './godot_meld_art';

paintWithoutCanvas();
gameSwitches();
const OUT = 'godot/assets/hud';
mkdirSync(OUT, { recursive: true });

const icons = makeIconArt();
// (WORDMELDING: the melded words' own colours and runes, as the game puts them on as it starts: tools/godot_meld_art.ts)
useMeldLooks(icons);
const pics = new Map<string, Sprite>();
pics.set('potion', icons.potion);
pics.set('gold', icons.gold[0]);
// (the Master Rune-stone, while it is carried: art/quest3.ts, its icon)
pics.set('stone', makeStoneArt().icon);
// (the Meldstone, while it is carried: art/meld_drops.ts, its small picture by INVENTORY, ui/hud.ts)
pics.set('meldstone', makeMeldDropsArt().carried);
for (const [w, s] of Object.entries(icons.word)) pics.set(`word:${w}`, s as Sprite);
const W = CLASSES.warrior;
const ids = [W.tap, W.hold, W.evade] as const;
// (EVERY HERO'S: each class's three, as defs.ts skillsFor gives them with the weapon he starts with; and the key each is made with,
// ui/guide.ts: LEFT CLICK, RIGHT CLICK or HOLD RIGHT CLICK)
const classMoves: Record<string, readonly string[]> = Object.fromEntries((Object.keys(CLASSES) as ClassId[]).map((c) => [c, skillsFor(c, CLASSES[c].starts)]));
// (THE WARLOCK AS THE DEMON, game/warlock.ts DEMON_KIT: its three on his buttons while he is it)
classMoves['warlock:demon'] = DEMON_KIT;
const allIds = [...new Set([...ids, ...Object.values(classMoves).flat()])];
for (const id of allIds) {
  const icon = SKILLS[id as SkillId].icon;
  pics.set(`ability:${icon}`, (icons.ability as Record<string, Sprite>)[icon]);
}
// (floor 5: one of the temple door's keys, lying: shown top left for each he holds, and faint for each he lacks: ui/hud.ts;
// art/key_bearers_fx.ts keySprite. Last, so that the pictures before it keep their places in the sheet.)
pics.set('key', keySprite(0));

function png(w: number, h: number, rgba: Uint8ClampedArray): Uint8Array {
  const raw = new Uint8Array((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) raw.set(rgba.subarray(y * w * 4, (y + 1) * w * 4), y * (w * 4 + 1) + 1);
  const be = (n: number): number[] => [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255];
  const chunk = (type: string, data: Uint8Array): number[] => {
    const td = new Uint8Array(4 + data.length);
    for (let i = 0; i < 4; i++) td[i] = type.charCodeAt(i);
    td.set(data, 4);
    return [...be(data.length), ...td, ...be(crc32(td) >>> 0)];
  };
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...chunk('IHDR', new Uint8Array([...be(w), ...be(h), 8, 6, 0, 0, 0])), ...chunk('IDAT', deflateSync(raw, { level: 9 })), ...chunk('IEND', new Uint8Array(0))]);
}

// (each picture at two picture pixels to a game pixel: one painted finer than the game's pixels, as the abilities' are, at its own)
const SHEET_W = 512;
const placed: Record<string, [number, number, number, number, number, number]> = {};
const at: { key: string; s: Sprite; x: number; y: number; w: number; h: number }[] = [];
let cx = 0;
let cy = 0;
let rowH = 0;
for (const [key, s] of pics) {
  const p = paintingOf(s);
  const k = 2 / (s.density ?? 1);
  const w = Math.round(p.w * k);
  const h = Math.round(p.h * k);
  if (cx + w > SHEET_W) { cx = 0; cy += rowH + 1; rowH = 0; }
  placed[key] = [cx, cy, w, h, s.ax * 2, s.ay * 2];
  at.push({ key, s, x: cx, y: cy, w, h });
  cx += w + 1;
  rowH = Math.max(rowH, h);
}
const H = cy + rowH;
const sheet = new Uint8ClampedArray(SHEET_W * H * 4);
for (const a of at) {
  const p = paintingOf(a.s);
  const k = 2 / (a.s.density ?? 1);
  for (let j = 0; j < a.h; j++) for (let i = 0; i < a.w; i++) {
    const o = (Math.floor(j / k) * p.w + Math.floor(i / k)) * 4;
    const d = ((a.y + j) * SHEET_W + a.x + i) * 4;
    for (let c = 0; c < 4; c++) sheet[d + c] = p.d[o + c];
  }
}
writeFileSync(`${OUT}/hud.png`, png(SHEET_W, H, sheet));
writeFileSync(`${OUT}/hud.json`, JSON.stringify({
  pics: placed,
  theme: THEME,
  palette: P,
  word_color: WORD_COLOR,
  words: Object.fromEntries(Object.keys(WORDS).map((w) => [w, { front: wordForm(w as keyof typeof WORDS, 'front'), behind: wordForm(w as keyof typeof WORDS, 'behind'), name: WORDS[w as keyof typeof WORDS].name, grows: growsWith(w as keyof typeof WORDS) }])),
  element_ramp: ELEMENT_RAMP,
  skills: ids.map((id) => ({ id, name: SKILLS[id].name, icon: SKILLS[id].icon, cooldown: SKILLS[id].cooldown, channel: SKILLS[id].channel ?? 0 })),
  skillsOf: Object.fromEntries(Object.entries(classMoves).map(([c, m]) => [c, m.map((id, slot) => ({ id, name: SKILLS[id as SkillId].name, icon: SKILLS[id as SkillId].icon, cooldown: SKILLS[id as SkillId].cooldown, channel: SKILLS[id as SkillId].channel ?? 0, key: slot === 0 ? 'LEFT CLICK' : SKILLS[id as SkillId].channel ? 'HOLD RIGHT CLICK' : 'RIGHT CLICK' }))])),
  sizes: { slot_w: 11, slot_h: 12, piece_gap: 3 },
  // (the place's name, top left: Game.floorLevel; in town, "Town")
  places: { town: 'Town', ...Object.fromEntries([1, 2, 3, 4, 5].map((d) => [`floor${d}`, FLOOR_NAMES.on ? floorTitle(d).level : `Dungeon ${d}`])) },
  // (FLOOR_NAMES: the name card across the screen as he comes into a floor, ui/cards.ts drawFloorCard: its name, its level under it)
  floor_cards: Object.fromEntries([1, 2, 3, 4, 5].map((d) => [`floor${d}`, floorTitle(d)])),
  floor_card_secs: FLOOR_NAMES.secs,
}));
console.log(`hud: ${pics.size} pictures in a ${SHEET_W}x${H} sheet; skills ${ids.join(', ')}`);
