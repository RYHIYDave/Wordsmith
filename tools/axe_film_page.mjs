// THE PAGE THE BATTLE AXE'S FILM IS SHOT ON (src/dev/axe_film_main.ts): the game as it is in the working tree, with the Warrior's
// moves with the axe beside it for the film's scenario to show (tools/scenarios/axe_film.mjs). Not the game: nothing ships it.
//   node tools/axe_film_page.mjs [dist/axe_film.html]
import { RELEASE_DEFINES, bundle, page, write } from './lib.mjs';

const [out = 'dist/axe_film.html'] = process.argv.slice(2);
const stamp = `AXE FILM ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const js = await bundle('src/dev/axe_film_main.ts', { minify: false, define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify(stamp), __DEV__: 'true', __COLOSSUS_BAKE__: JSON.stringify('') } });
console.log(`built ${write(out, page(js))} (${(js.length / 1024).toFixed(0)} KB script)`);
