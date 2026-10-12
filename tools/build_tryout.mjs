// THE TRY-OUT PAGE: the game as it is in the working tree, minified, as a page fragment for publishing on
// claude.ai as a page of its own (never over the game's own page), with the try-out's options: a seasoned
// hero straight to a floor of the first five (src/ui/panels.ts tryItems). Play.html and dist/artifact.html
// are left as they are.
//   node tools/build_tryout.mjs            writes dist/tryout.html (the fragment) and dist/tryout_page.html (a whole page, for the playtests)
import { bundle, fragment, page, write } from './lib.mjs';

const stamp = `TRY-OUT ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const js = await bundle('src/main.ts', { minify: true, define: { __BUILD__: JSON.stringify(stamp), __DEV__: 'false', __TRYOUT__: 'true' } });
write('dist/tryout.html', fragment(js, 'Wordsmith Try-out'));
write('dist/tryout_page.html', page(js, 'Wordsmith Try-out'));
console.log(`built dist/tryout.html (${(js.length / 1024).toFixed(0)} KB script)`);
