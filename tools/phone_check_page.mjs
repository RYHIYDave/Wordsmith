// THE PHONE CHECK'S PAGE (the Eight-sides merge chat, 11 Nov 2026; the queue's measure-lag-on-his-phone): a test page of the
// game with a recorder put in before the game's own script (tools/phone_check/recorder.js says what it counts). Nothing of
// the game is changed: the page is a test page already made (tools/eight_sides_try_page.mjs: dist/try_eight/, index.html and
// the folders beside it), copied, with the recorder's script put in, the page's name changed and the stamp in the corner of
// the starting screen changed, so that he can tell it from the other test page and from the game.
//   node tools/phone_check_page.mjs <the test page's folder> <the folder to make>
// Published as a page of its own, with a database of its own (capabilities db and user), never over the game's page.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const [from, to] = process.argv.slice(2);
if (!from || !to) { console.error('node tools/phone_check_page.mjs <the test page\'s folder> <the folder to make>'); process.exit(1); }
const recorder = fs.readFileSync(path.join(here, 'phone_check', 'recorder.js'), 'utf8');
// (the side painter's workers are made from the script that holds these words: the recorder must not, or it would be taken for the game)
const PAINTER_MARK = ['wordsmith', 'painter', 'worker', '1'].join('-');
if (recorder.includes(PAINTER_MARK)) throw new Error('the recorder holds the painter\'s mark');
if (/<\/script/i.test(recorder)) throw new Error('the recorder would close its own script');

fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(from, to, { recursive: true });
const file = path.join(to, 'index.html');
let html = fs.readFileSync(file, 'utf8');
const once = (what, find, put) => {
  const n = html.split(find).length - 1;
  if (n !== 1) throw new Error(`${what}: found ${n} times, wanted once`);
  html = html.replace(find, () => put);
};
const day = new Date().toLocaleDateString('en-CA');
once('the page\'s name', '<title>Wordsmith test page: eight sides</title>', '<title>Wordsmith phone check</title>');
const stamp = html.match(/TEST EIGHT SIDES \d{4}-\d{2}-\d{2}/);
if (!stamp) throw new Error('no stamp of the test page');
once('the stamp', stamp[0], `PHONE CHECK ${day}`);
const scripts = html.split('<script>').length - 1;
if (scripts !== 1) throw new Error(`${scripts} scripts in the page, wanted the game's one`);
once('the game\'s script', '<script>', `<script>\n${recorder}\n</script>\n<script>`);
if (html.split(PAINTER_MARK).length - 1 < 1) throw new Error('the game\'s script has lost the painter\'s mark');
fs.writeFileSync(file, html);
let files = 0;
let bytes = 0;
const walk = (dir) => { for (const f of fs.readdirSync(dir)) { const p = path.join(dir, f); if (fs.statSync(p).isDirectory()) walk(p); else { files++; bytes += fs.statSync(p).size; } } };
walk(to);
console.log(`${to}: ${files} files, ${(bytes / 1e6).toFixed(1)} MB; the stamp “PHONE CHECK ${day}”; the recorder ${(recorder.length / 1024).toFixed(1)} KB`);
