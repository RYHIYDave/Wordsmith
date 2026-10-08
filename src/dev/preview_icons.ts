// Dev preview for src/art/icons.ts:
//   node tools/preview.mjs src/dev/preview_icons.ts shots/icons.png 1200 1000
// Top sheet: every sprite at 6x with a label. Bottom sheet: the same sprites at the size they
// are really seen (3x), on the dungeon floor colour, to check they read at a glance.

import { makeIconArt } from '../art/icons';
import { P } from '../art/palette';
import { ICON_KEYS, WORD_IDS } from '../game/types';
import type { AbilityId, Element } from '../game/types';
import { ready, showSheet } from './sheet';
import type { SheetItem } from './sheet';

const art = makeIconArt();
const abilities: readonly AbilityId[] = ['strike', 'slam', 'whirl', 'leap', 'shot', 'volley', 'trap', 'wave', 'orb', 'beam', 'familiar', 'warp'];
const elements: readonly Element[] = ['phys', 'fire', 'frost', 'lightning'];

const items: SheetItem[] = [];
for (const k of ICON_KEYS) items.push({ label: 'item ' + k, sprite: art.item[k] });
for (const a of abilities) items.push({ label: 'ability ' + a, sprite: art.ability[a] });
for (const w of WORD_IDS) items.push({ label: 'word ' + w, sprite: art.word[w] });
items.push({ label: 'potion', sprite: art.potion });
items.push({ label: 'gold x3', frames: art.gold });
items.push({ label: 'lifeOrb', sprite: art.lifeOrb });
for (const e of elements) items.push({ label: 'orb ' + e, frames: art.orb[e] });
for (const e of elements) items.push({ label: 'trap ' + e, frames: art.trap[e] });

showSheet(items, { scale: 6, width: 1200, title: 'Icons, pickups, orb and trap (6x)' });
showSheet(items, { scale: 3, width: 1200, background: P.st3, title: 'Same sprites at 3x on the floor colour' });
ready();
