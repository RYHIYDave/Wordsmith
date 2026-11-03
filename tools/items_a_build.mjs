// THE NEW ITEM PICTURES IN THE GAME, FOR PICTURES ONLY: the game as it is in the working tree, built into dist/items_a.html with
// its item pictures the new ones (src/dev/items_a_icons.ts stands in for art/icons.ts where main.ts asks for it). Play.html is
// left as it is. tools/scenarios/items_a_phone.mjs photographs it.
//   node tools/items_a_build.mjs [dist/items_a.html]
import path from 'node:path';
import { RELEASE_DEFINES, ROOT, load, page, write } from './lib.mjs';

const out = process.argv[2] ?? 'dist/items_a.html';
const esbuild = load('esbuild');
const icons = path.resolve(ROOT, 'src/art/icons.ts');
const stand = path.resolve(ROOT, 'src/dev/items_a_icons.ts');
const r = await esbuild.build({
  entryPoints: [path.resolve(ROOT, 'src/main.ts')],
  bundle: true, format: 'iife', target: 'es2020', write: false, legalComments: 'none', logLevel: 'warning',
  define: { ...RELEASE_DEFINES, __BUILD__: JSON.stringify('NEW ITEM PICTURES (mock-up)'), __DEV__: 'true' },
  plugins: [{
    name: 'items-a',
    setup(b) {
      b.onResolve({ filter: /art\/icons$/ }, (a) => {
        const p = path.resolve(a.resolveDir, a.path) + '.ts';
        return p === icons && path.resolve(a.importer) !== stand ? { path: stand } : undefined;
      });
    },
  }],
});
console.log(`built ${write(out, page(r.outputFiles[0].text))}`);
