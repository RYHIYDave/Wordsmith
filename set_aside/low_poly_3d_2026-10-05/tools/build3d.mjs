// Build the page that moves in 3D (src/dev/walk3d.ts): the hall of the still renders, in real
// time, with the knight to walk about in it. It is a test of the look and of the speed, not the game.
//   node tools/build3d.mjs [--dev]
// Writes dist/walk3d.html (double-click to run) and dist/walk3d_artifact.html (a page fragment to publish).
import { bundle, fragment, page, write } from './lib.mjs';

const dev = process.argv.includes('--dev');
const stamp = `3D test ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const js = await bundle('src/dev/walk3d.ts', { minify: !dev, define: { __BUILD__: JSON.stringify(stamp), __DEV__: String(dev) } });
const out = write('dist/walk3d.html', page(js, 'Wordsmith 3D Test'));
write('dist/walk3d_artifact.html', fragment(js, 'Wordsmith 3D Test'));
console.log(`built ${out} (${(js.length / 1024).toFixed(0)} KB script, ${dev ? 'dev' : 'minified'})`);
