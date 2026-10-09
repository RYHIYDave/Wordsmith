// Makes sound files from the music's own code (src/engine/music.ts): the samples the owner listens to.
// It runs the code in the test browser on a clock with no speaker, so nothing has to be heard to be made.
//   node tools/sound/render_music.mjs tools/sound/clips_tryout.mjs dist/sound/tryout [name ...]
// The clips file exports RATE (samples a second) and CLIPS: [{ name, plan, tail }], where `plan` is
// what playSong takes and `tail` is how many seconds to let the last notes ring.
// Each clip is written as <name>.wav (32-bit float, two channels), exactly as the code made it.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, bundle, load } from '../lib.mjs';

const [clipsFile, outDir, ...only] = process.argv.slice(2);
if (!clipsFile || !outDir) { console.error('usage: node tools/sound/render_music.mjs <clips.mjs> <out dir> [name ...]'); process.exit(1); }
const { RATE, CLIPS } = await import(pathToFileURL(path.resolve(clipsFile)).href);
const clips = only.length ? CLIPS.filter((c) => only.includes(c.name)) : CLIPS;
const out = path.resolve(ROOT, outDir);
fs.mkdirSync(out, { recursive: true });

/** A WAV file of 32-bit floats: what the code made, with nothing rounded off. */
function wav(bytes, rate, channels) {
  const head = Buffer.alloc(44);
  head.write('RIFF', 0);
  head.writeUInt32LE(36 + bytes.length, 4);
  head.write('WAVE', 8);
  head.write('fmt ', 12);
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(3, 20);
  head.writeUInt16LE(channels, 22);
  head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * channels * 4, 28);
  head.writeUInt16LE(channels * 4, 32);
  head.writeUInt16LE(32, 34);
  head.write('data', 36);
  head.writeUInt32LE(bytes.length, 40);
  return Buffer.concat([head, bytes]);
}

const js = await bundle('tools/sound/page.ts');
const { chromium } = load('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
page.on('pageerror', (e) => { console.error('page error:', e.message); process.exitCode = 1; });
await page.setContent('<!doctype html><title>render</title>');
await page.addScriptTag({ content: js });

for (const clip of clips) {
  const info = await page.evaluate(([plan, tail, rate]) => window.render(plan, tail, rate), [clip.plan, clip.tail ?? 3, RATE]);
  const parts = [];
  const STEP = 3 * 1024 * 1024;
  for (let from = 0; from < info.bytes; from += STEP) {
    const b64 = await page.evaluate(([a, n]) => window.chunk(a, n), [from, STEP]);
    parts.push(Buffer.from(b64, 'base64'));
  }
  const file = path.join(out, clip.name + '.wav');
  fs.writeFileSync(file, wav(Buffer.concat(parts), RATE, 2));
  console.log(`${clip.name.padEnd(22)} ${(info.frames / RATE).toFixed(2).padStart(6)} s  made in ${String(info.ms).padStart(5)} ms  ${path.relative(ROOT, file)}`);
}
await browser.close();
