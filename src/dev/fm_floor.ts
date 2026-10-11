// THE FLOOR THE FLESHMANCER'S PICTURES PUT HIM ON (src/dev/preview_fleshmancer.ts, its `floor` mode).
//
// He is the Crypt's lair boss, under its fourth floor, and his pictures want him on the Crypt's own dark
// floor: floor 4's look, `CRYPT_FLOORS[3]` in src/art/crypt.ts. That file is on the floors' branches
// (mockup/floor3-4 and those before it), not on this one (mockup/fleshmancer, from mockup/bosses). So on
// this branch the picture is on the game's own dungeon floor today (the vault); the pictures sent with
// this branch were made on a copy of it with mockup/floor3-4's src/art/ground.ts, crypt.ts and
// crypt_ways.ts laid in, and these lines made instead:
//
//   import { CRYPT_FLOORS, cryptProps } from '../art/crypt';
//   export const FM_FLOOR = { theme: CRYPT_FLOORS[3], name: 'the Crypt’s fourth floor', litter: () => cryptProps(4).rubble };
//
// (docs/mockups/fleshmancer/README.md). Once both branches are in, it is those lines here.
import { VAULT } from '../art/ground';
import type { Theme } from '../art/ground';
import { makeDungeonProps } from '../art/props';
import type { Sprite } from '../engine/px';

/** The floor's own stone, its name, and what lies about on it (rubble; on the Crypt's fourth floor, rocks and the miners' rusted gear). */
export const FM_FLOOR: { theme: Theme; name: string; litter: () => Sprite[] } = { theme: VAULT, name: 'the vault (the dungeon floor in the game today)', litter: () => makeDungeonProps(VAULT).rubble };
