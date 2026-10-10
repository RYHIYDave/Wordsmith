// Build the game into one self-contained file: Play.html (double-click to run).
//   node tools/build.mjs          minified build
//   node tools/build.mjs --dev    readable build
// Also writes dist/artifact.html, the same game as a page fragment for publishing on claude.ai.
import { bundle, fragment, page, write } from './lib.mjs';

const dev = process.argv.includes('--dev');
// (shown small in a corner of the starting screen, so the owner can tell which version a page is showing)
const VERSION = 'V20.0';
const stamp = `${VERSION} ${new Date().toISOString().slice(0, 16).replace('T', ' ')}`;
const js = await bundle('src/main.ts', { minify: !dev, define: { __BUILD__: JSON.stringify(stamp), __DEV__: String(dev) } });
const out = write('Play.html', page(js));
write('dist/artifact.html', fragment(js));
console.log(`built ${out} (${(js.length / 1024).toFixed(0)} KB script, ${dev ? 'dev' : 'minified'})`);
