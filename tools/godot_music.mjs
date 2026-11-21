// THE LEVEL MUSIC FOR THE GODOT VERSION (branch godot/port): the town's and floors 1 to 10's walks and fights, from
// assets/sound/music_*.mp3 (.mp4 before; Godot plays neither as the game loops them) made into Ogg Vorbis in
// godot/assets/music, each cut at its loop's end (engine/audio.ts MUSIC_PLACES: the game loops each from 0 to `loop` seconds,
// the rest of the file unheard), so that Godot's own looping (back to the start at the file's end) is the game's. And
// music.json: each place's two, the fight's "fight in at", and the fades (MUSIC), read from engine/audio.ts as it stands. And THE
// TITLE THEME (engine/audio.ts TITLE, titleMusic: from its start once, then round between its two loop points for ever), cut at
// its loop's end, its loop's start kept in music.json `title` (Godot loops it from there).
// A track already made is kept as it is (`--all` makes every one again).
//   node tools/godot_music.mjs [--all]    (from the repository's root; needs ffmpeg: winget install Gyan.FFmpeg)
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'assets/sound');
const OUT = join(ROOT, 'godot/assets/music');
const RATE = 48000;
mkdirSync(OUT, { recursive: true });

// (ffmpeg: on the PATH, or where winget puts it)
function ffmpeg() {
  try {
    execFileSync('ffmpeg', ['-version'], { stdio: 'ignore' });
    return 'ffmpeg';
  } catch {
    const base = join(process.env.LOCALAPPDATA ?? '', 'Microsoft/WinGet/Packages');
    for (const p of existsSync(base) ? readdirSync(base) : []) {
      if (!p.startsWith('Gyan.FFmpeg')) continue;
      for (const v of readdirSync(join(base, p))) {
        const exe = join(base, p, v, 'bin/ffmpeg.exe');
        if (existsSync(exe)) return exe;
      }
    }
    throw new Error('ffmpeg not found (winget install Gyan.FFmpeg)');
  }
}

// (the game's table, read from its source)
const audio = readFileSync(join(ROOT, 'src/engine/audio.ts'), 'utf8');
const fades = /export const MUSIC = \{([^}]*)\}/.exec(audio)[1];
const MUSIC = Object.fromEntries([...fades.matchAll(/(\w+):\s*([\d.]+)/g)].map((m) => [m[1], Number(m[2])]));
const table = /export const MUSIC_PLACES[^=]*=\s*\{([\s\S]*?)\n\};/.exec(audio)[1];
const places = {};
for (const line of table.split('\n')) {
  const place = /^\s*(\w+):\s*\{/.exec(line);
  if (!place) continue;
  const entry = {};
  for (const m of line.matchAll(/(walk|fight):\s*\{([^}]*)\}/g)) {
    const file = /file:\s*'([^']+)'/.exec(m[2])[1];
    const loop = Number(/loop:\s*([\d.]+)/.exec(m[2])[1]);
    const fightIn = /fightIn:\s*([\d.]+)/.exec(m[2]);
    entry[m[1]] = { file: file.replace(/\.(mp4|mp3)$/, '.ogg'), loop, ...(fightIn ? { fightIn: Number(fightIn[1]) } : {}) };
    // (made into Ogg Vorbis, cut at the loop's end to the sample)
    if (existsSync(join(OUT, entry[m[1]].file)) && !process.argv.includes('--all')) {
      console.log(`${place[1]} ${m[1]}: ${entry[m[1]].file} kept`);
      continue;
    }
    execFileSync(ffmpeg(), ['-y', '-v', 'error', '-i', join(SRC, file), '-af', `atrim=end_sample=${Math.round(loop * RATE)}`,
      '-ar', String(RATE), '-c:a', 'libvorbis', '-q:a', '6', join(OUT, entry[m[1]].file)], { stdio: 'inherit' });
    console.log(`${place[1]} ${m[1]}: ${file} -> ${entry[m[1]].file} (${loop} s)`);
  }
  places[place[1]] = entry;
}

// THE TITLE THEME
const tm = /export const TITLE = \{ file: '([^']+)', loop: \[([\d.]+), ([\d.]+)\][^}]*vol: ([\d.]+)/.exec(audio);
const title = { file: tm[1].replace(/\.(mp4|mp3)$/, '.ogg').replace(/^/, 'music_'), loopStart: Number(tm[2]), loopEnd: Number(tm[3]), vol: Number(tm[4]) };
if (existsSync(join(OUT, title.file)) && !process.argv.includes('--all')) console.log(`title: ${title.file} kept`);
else {
  execFileSync(ffmpeg(), ['-y', '-v', 'error', '-i', join(SRC, tm[1]), '-af', `atrim=end_sample=${Math.round(title.loopEnd * RATE)}`,
    '-ar', String(RATE), '-c:a', 'libvorbis', '-q:a', '6', join(OUT, title.file)], { stdio: 'inherit' });
  console.log(`title: ${tm[1]} -> ${title.file} (loops ${title.loopStart} to ${title.loopEnd} s)`);
}

writeFileSync(join(OUT, 'music.json'), JSON.stringify({ music: MUSIC, places, title }, null, 1) + '\n');
console.log('music.json:', JSON.stringify(MUSIC));
