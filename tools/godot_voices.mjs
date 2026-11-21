// THE GODOT PORT: THE BOSSES' CALLED LINES IN THEIR OWN VOICES, for godot/scripts/monster.gd call_out. The game says each line a
// boss calls out as he begins one of his big moves (game/boss_calls.ts BOSS_CALL_LINES) in a voice of his own made in code
// (engine/audio.ts BOSS_VOICES, speakBoss: a mumble, a note a syllable, as the heroes speak); the Godot side plays files, so here
// the game's own voices say every line, twice, in a headless browser, rendered offline (tools/godot_voices_page.ts), and each
// take is written as a sound file:
//   godot/assets/voices/<boss>_<n>_<take>.ogg   (mono, 24 kHz, Vorbis)
//   godot/assets/voices/voices.json  { calls: { boss: { move: line } }, voices: { boss: { line: [file, file] } }, tune: { sayFor,
//     gap, basicGap } }: which line each move calls out, the takes of each, and how often (game/boss_calls.ts BOSS_CALLS)
//   node tools/godot_voices.mjs   (from the repository's root; needs the Playwright the playtests use, and ffmpeg)
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { load, ROOT } from './lib.mjs';

const OUT = join(ROOT, 'godot/assets/voices');
mkdirSync(OUT, { recursive: true });
const esbuild = load('esbuild');
const built = await esbuild.build({ entryPoints: [join(ROOT, 'tools/godot_voices_page.ts')], bundle: true, write: false, format: 'iife', target: 'es2020', logLevel: 'silent' });
const js = built.outputFiles[0].text;
// (the tables, read by the page's own bundle of the game's modules)
const tables = await esbuild.build({ stdin: { contents: "export { BOSS_CALL_LINES, BOSS_CALLS } from './src/game/boss_calls';", resolveDir: ROOT, loader: 'ts' }, bundle: true, write: false, format: 'cjs', platform: 'node', logLevel: 'silent' });
const mod = { exports: {} };
new Function('module', 'exports', 'require', tables.outputFiles[0].text)(mod, mod.exports, () => ({}));
const { BOSS_CALL_LINES, BOSS_CALLS } = mod.exports;

const { chromium } = load('playwright');
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: js });
const takes = await page.evaluate(() => window.__voices());
await browser.close();

const tmp = mkdtempSync(join(tmpdir(), 'voices-'));
const voices = {};
const index = {};
for (const t of takes) {
  voices[t.kind] ??= {};
  index[t.kind] ??= {};
  if (!(t.line in index[t.kind])) index[t.kind][t.line] = Object.keys(index[t.kind]).length;
  const file = `${t.kind}_${index[t.kind][t.line]}_${t.take}.ogg`;
  (voices[t.kind][t.line] ??= []).push(file);
  // a WAV of it, then Vorbis
  const pcm = Buffer.from(t.pcm, 'base64');
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + pcm.length, 4);
  head.write('WAVE', 8);
  head.write('fmt ', 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(t.rate, 24);
  head.writeUInt32LE(t.rate * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write('data', 36);
  head.writeUInt32LE(pcm.length, 40);
  const wav = join(tmp, file.replace('.ogg', '.wav'));
  writeFileSync(wav, Buffer.concat([head, pcm]));
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libvorbis', '-q:a', '4', join(OUT, file)]);
}
rmSync(tmp, { recursive: true, force: true });
writeFileSync(join(OUT, 'voices.json'), JSON.stringify({ calls: BOSS_CALL_LINES, voices, tune: { sayFor: BOSS_CALLS.sayFor, gap: BOSS_CALLS.gap, basicGap: BOSS_CALLS.basicGap } }, null, 1) + '\n');
const n = Object.values(voices).reduce((s, v) => s + Object.keys(v).length, 0);
console.log(`the bosses' voices: ${Object.keys(voices).length} bosses, ${n} lines, ${takes.length} takes in godot/assets/voices`);
