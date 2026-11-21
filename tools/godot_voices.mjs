// THE GODOT PORT: THE LINES THE GAME SAYS IN VOICES IT MAKES IN CODE, as sound files for the Godot side. The game says each line in a
// voice of its own (engine/audio.ts: a mumble, a note a syllable): a boss's call as he begins a big move (game/boss_calls.ts
// BOSS_CALL_LINES, speakBoss), the hero's word on a big kill (QUIPS), as he comes into a dungeon (ARRIVAL_LINES) and at the Eyrie
// (EYRIE_LINES), in his own voice (speak, HERO_VOICE), and what one of the town's people says as he comes up (TAGS, in TOWN_VOICE,
// at 0.55). The Godot side plays files: so here the game's own voices say every one of them in a headless browser, rendered
// offline (tools/godot_voices_page.ts), and each take is written as a sound file:
//   godot/assets/voices/<boss>_<n>_<take>.ogg      a boss's call, two takes each (24 kHz, Vorbis q4)
//   godot/assets/voices/hero/<class>_<n>.ogg       a hero's line, in his voice, one take each (Vorbis q2)
//   godot/assets/voices/town/<who>_<n>.ogg         a townsperson's line, one take each (Vorbis q2)
//   godot/assets/voices/voices.json  { calls: { boss: { move: line } }, voices: { boss: { line: [file, file] } }, tune: { sayFor, gap,
//     basicGap }, hero: { class: { line: file } }, town: { who: { line: file } }, quips: QUIPS, arrival: ARRIVAL_LINES, eyrie:
//     EYRIE_LINES, tags: TAGS }
//   node tools/godot_voices.mjs   (from the repository's root; needs the Playwright the playtests use, and ffmpeg)
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { load, ROOT } from './lib.mjs';

const OUT = join(ROOT, 'godot/assets/voices');
mkdirSync(join(OUT, 'hero'), { recursive: true });
mkdirSync(join(OUT, 'town'), { recursive: true });
const esbuild = load('esbuild');
const built = await esbuild.build({ entryPoints: [join(ROOT, 'tools/godot_voices_page.ts')], bundle: true, write: false, format: 'iife', target: 'es2020', logLevel: 'silent' });
const js = built.outputFiles[0].text;
// (the tables, from the game's own modules)
const tables = await esbuild.build({
  stdin: {
    contents: "export { BOSS_CALL_LINES, BOSS_CALLS } from './src/game/boss_calls'; export { QUIPS, ARRIVAL_LINES, TAGS } from './src/game/defs'; export { EYRIE_LINES } from './src/game/quests610'; export { BOSS_VOICES, HERO_VOICE } from './src/engine/audio';",
    resolveDir: ROOT,
    loader: 'ts',
  },
  bundle: true, write: false, format: 'cjs', platform: 'node', logLevel: 'silent',
});
const mod = { exports: {} };
new Function('module', 'exports', 'require', tables.outputFiles[0].text)(mod, mod.exports, () => ({}));
const { BOSS_CALL_LINES, BOSS_CALLS, QUIPS, ARRIVAL_LINES, TAGS, EYRIE_LINES, BOSS_VOICES, HERO_VOICE } = mod.exports;
// (main.ts TOWN_VOICE: whose voice each of the town's people speaks in)
const TOWN_VOICE = { armourer: ['warrior', 'male'], mystic: ['mage', 'male'], wordsmith: ['mage', 'male'], stranger: ['ranger', 'male'] };

// WHICH OF THE QUIPS EACH HERO CAN SAY (game.ts quip: the boss's own, a word on the attack, the attack's own, the weapon's, the top
// attribute's, the class's, any): his own moves' and weapons' lines only (every move and weapon the game has belongs to one hero)
const MOVES = {
  warrior: ['strike', 'slam', 'whirlwind', 'leap', 'whirl', 'cleave', 'axethrow', 'chop', 'smash', 'quake', 'charge'],
  ranger: ['shot', 'snare', 'snipe', 'rally', 'volley', 'trap'],
  mage: ['wave', 'ball', 'spear', 'orb', 'beam', 'familiar', 'warp'],
  warlock: ['hellbolt', 'curse', 'smokestep', 'rake', 'damning', 'demonstep'],
  tinkerer: ['vialtoss', 'contraption', 'golem', 'blastjump'],
  brawler: ['jab', 'cross', 'slip', 'vpunch', 'vkick', 'vjump'],
};
const ARMS = { warrior: ['sword', 'greatsword', 'battleaxe', 'warhammer'], ranger: ['bow'], mage: ['wand', 'staff'], warlock: ['tome'], tinkerer: ['wrench'], brawler: ['wraps'] };
for (const s of Object.keys(QUIPS.skill)) if (!Object.values(MOVES).some((l) => l.includes(s))) throw new Error(`whose move is ${s}?`);
for (const w of Object.keys(QUIPS.weapon)) if (!Object.values(ARMS).some((l) => l.includes(w))) throw new Error(`whose weapon is ${w}?`);
const heroLines = (cls) => {
  const out = new Set([...QUIPS.boss, ...QUIPS.any, ...QUIPS.cls[cls], ...(ARRIVAL_LINES[cls] ?? []), EYRIE_LINES[cls]]);
  for (const l of Object.values(QUIPS.word)) for (const t of l) out.add(t);
  for (const l of Object.values(QUIPS.attr)) for (const t of l) out.add(t);
  for (const s of MOVES[cls]) for (const t of QUIPS.skill[s] ?? []) out.add(t);
  for (const w of ARMS[cls]) for (const t of QUIPS.weapon[w] ?? []) out.add(t);
  return [...out].filter((t) => typeof t === 'string' && t.length > 0);
};

const jobs = [];
for (const [kind, moves] of Object.entries(BOSS_CALL_LINES)) {
  if (!(kind in BOSS_VOICES)) continue;
  const seen = new Set();
  for (const line of Object.values(moves ?? {})) {
    if (seen.has(line)) continue;
    seen.add(line);
    for (const take of [1, 2]) jobs.push({ job: { kind: 'boss', who: kind, text: line }, group: 'boss', who: kind, line, take });
  }
}
for (const cls of Object.keys(MOVES)) for (const line of heroLines(cls)) jobs.push({ job: { kind: 'hero', who: cls, voice: HERO_VOICE[cls], text: line }, group: 'hero', who: cls, line, take: 1 });
for (const [who, lines] of Object.entries(TAGS.lines)) for (const line of lines) jobs.push({ job: { kind: 'hero', who: TOWN_VOICE[who][0], voice: TOWN_VOICE[who][1], text: line, vol: 0.55 }, group: 'town', who, line, take: 1 });

const { chromium } = load('playwright');
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
await page.setContent('<!doctype html><html><body></body></html>');
await page.addScriptTag({ content: js });
const tmp = mkdtempSync(join(tmpdir(), 'voices-'));
const voices = {};
const hero = {};
const town = {};
const index = {};
const BATCH = 60;
let done = 0;
for (let b = 0; b < jobs.length; b += BATCH) {
  const part = jobs.slice(b, b + BATCH);
  const takes = await page.evaluate((js2) => window.__voices(js2), part.map((p) => p.job));
  takes.forEach((t, i) => {
    const j = part[i];
    const key = `${j.group}:${j.who}`;
    index[key] ??= {};
    if (!(j.line in index[key])) index[key][j.line] = Object.keys(index[key]).length;
    const n = index[key][j.line];
    const file = j.group === 'boss' ? `${j.who}_${n}_${j.take}.ogg` : `${j.group}/${j.who}_${n}.ogg`;
    if (j.group === 'boss') ((voices[j.who] ??= {})[j.line] ??= []).push(file);
    else (j.group === 'hero' ? (hero[j.who] ??= {}) : (town[j.who] ??= {}))[j.line] = file;
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
    const wav = join(tmp, `${b + i}.wav`);
    writeFileSync(wav, Buffer.concat([head, pcm]));
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libvorbis', '-q:a', j.group === 'boss' ? '4' : '2', join(OUT, file)]);
  });
  done += part.length;
  process.stdout.write(`\r  ${done} of ${jobs.length} takes`);
}
await browser.close();
rmSync(tmp, { recursive: true, force: true });
process.stdout.write('\n');
writeFileSync(join(OUT, 'voices.json'), JSON.stringify({
  calls: BOSS_CALL_LINES,
  voices,
  tune: { sayFor: BOSS_CALLS.sayFor, gap: BOSS_CALLS.gap, basicGap: BOSS_CALLS.basicGap },
  hero,
  town,
  quips: QUIPS,
  arrival: ARRIVAL_LINES,
  eyrie: EYRIE_LINES,
  tags: TAGS,
}, null, 1) + '\n');
const nb = Object.values(voices).reduce((s, v) => s + Object.keys(v).length, 0);
const nh = Object.values(hero).reduce((s, v) => s + Object.keys(v).length, 0);
const nt = Object.values(town).reduce((s, v) => s + Object.keys(v).length, 0);
console.log(`voices: the bosses' ${nb} lines (two takes each), the heroes' ${nh}, the town's ${nt}: ${jobs.length} takes in godot/assets/voices`);
