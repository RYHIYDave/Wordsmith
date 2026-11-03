// Build the page for the Veteran's icons picture: the game with the Brawler on (BRAWLER), his three buttons showing the
// Veteran's three icons and names (tools/veteran_icons_page.ts), the Veteran's own code not being in this branch. For the
// picture only: it leaves the game alone.
//   node tools/veteran_icons_page.mjs dist/vet_icons_picture.html
//   node tools/playtest.mjs --file dist/vet_icons_picture.html --size 844x390 --dpr 3 --touch --scenario tools/scenarios/veteran_icons_hud.mjs --out shots/vet/land
//   node tools/preview.mjs src/dev/preview_veteran_icons.ts shots/vet/page.png 1200 400
//   python3 tools/veteran_icons_picture.py shots/vet/page.png shots/vet/land_hud.png docs/mockups/veteran_icons/pictures/veteran_icons.png
import { RELEASE_DEFINES, bundle, page, write } from './lib.mjs';
const [out = 'dist/vet_icons_picture.html'] = process.argv.slice(2);
const js = await bundle('tools/veteran_icons_page.ts', { minify: false, define: { ...RELEASE_DEFINES, __BRAWLER__: 'true', __BUILD__: '"UNRELEASED picture"', __DEV__: 'true' } });
console.log('built', write(out, page(js)));
