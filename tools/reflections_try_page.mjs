// A PAGE OF THE GAME WITH FLOOR 18'S REFLECTIONS OF THE HEROES AS THEY LOOK NOW SWITCHED ON (game/act1_rules/reflection.ts
// REFLECTIONS_UP: on only where `__TRY__` is 'reflections', so that the game and its painter's worker, the same script, have it
// on from the first), to film them in play for his yes before anything goes live (the queue's wire-floor-18-new-reflections).
// Made as tools/build_to.mjs makes a page to look at: readable, beside it the Colossus's, the townsfolk's and (where kept) the
// monsters' bakes; the game's own files left alone.
//   node tools/reflections_try_page.mjs [dist/try_reflections.html]
// (Its monsters' bake, where one is beside it, is of the first reflections: the new ones are not as baked, and are painted as
// they are played, as any figure not as baked is: render/monsters_baked.ts.)
import { RELEASE_DEFINES, bundle, page, write } from './lib.mjs';
import { shipColossus } from './colossus_ship.mjs';
import { shipTownsfolk } from './bake_townsfolk.mjs';
import { shipMonsters } from './bake_monsters.mjs';

const [out = 'dist/try_reflections.html'] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (/(^|\/)Play\.html$/.test(out) || /artifact\.html$/.test(out)) { console.error('not over the game itself: give another name'); process.exit(1); }
const stamp = `TEST REFLECTIONS ${new Date().toISOString().slice(0, 10)}`;
const colossus = shipColossus();
const townsfolk = await shipTownsfolk({ make: false });
const monsters = await shipMonsters({ make: false });
const js = await bundle('src/main.ts', { minify: false, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'true', __COLOSSUS_BAKE__: JSON.stringify(colossus.mark), __TOWNSFOLK_BAKE__: JSON.stringify(townsfolk.mark), __MONSTER_BAKE__: JSON.stringify(monsters.mark), __TRY__: JSON.stringify('reflections') } });
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script), REFLECTIONS_UP on; the stamp “${stamp}”`);
