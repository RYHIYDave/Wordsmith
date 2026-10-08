// Which Mages' first dungeons, entered from town through the gate, have something awake as soon
// as the hero arrives? (A pack in sight of the way in: the hero is in a fight before anything
// has been pressed.) Written after Version 14.4's regression, where tools/scenarios/touch.mjs met
// one by chance; its TOUCH_SEED plays a dungeon this names.
//   /opt/npm-tools/node_modules/.bin/tsx tools/find_pack.ts [from] [to]     (default 1 to 400)
// Seeds 1 to 700 at Version 14.4: five (161, 456, 595, 662, 699).
import { Game } from '../src/game/game';
import { emptyControls } from '../src/game/state';

declare const process: { argv: string[] };
const args: string[] = process.argv.slice(2);
const from = Number(args[0] ?? 1);
const to = Number(args[1] ?? 400);
const DT = 1 / 30;
let found = 0;
for (let seed = from; seed <= to; seed++) {
  const g = new Game('mage', seed);
  g.enterDungeon();
  const h = g.hero;
  const c = emptyControls();
  // a third of a second: whatever can see the hero has woken, and its pack with it
  for (let k = 0; k < 10; k++) g.update(DT, c);
  const awake = g.monsters.filter((m) => !m.dead && m.state !== 'sleep');
  if (!awake.length) continue;
  found++;
  const near = Math.min(...awake.map((m) => Math.hypot(m.x - h.x, m.y - h.y)));
  console.log(`seed ${seed}: ${awake.length} awake, the nearest ${near.toFixed(1)} tiles off (${awake.map((m) => m.kind).join(' ')}); ${g.monsters.length} monsters in the dungeon`);
}
console.log(`${found} of ${to - from + 1} first dungeons have something awake by the way in`);
