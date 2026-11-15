// THE LEVEL MUSIC FOR THE GODOT VERSION (branch godot/port): the town's and floors 1 to 5's walks and fights, from
// assets/sound/music_*.mp4 (AAC, which Godot does not play) made into Ogg Vorbis in godot/assets/music, each cut at its loop's
// end (engine/audio.ts MUSIC_PLACES: the game loops each from 0 to `loop` seconds, the rest of the file unheard), so that
// Godot's own looping (back to the start at the file's end) is the game's. And music.json: each place's two, the fight's
// "fight in at", and the fades (MUSIC), read from engine/audio.ts as it stands.
//   node tools/godot_music.mjs            (from the repository's root; needs ffmpeg: winget install Gyan.FFmpeg)
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
    entry[m[1]] = { file: file.replace(/\.mp4$/, '.ogg'), loop, ...(fightIn ? { fightIn: Number(fightIn[1]) } : {}) };
    // (made into Ogg Vorbis, cut at the loop's end to the sample)
    execFileSync(ffmpeg(), ['-y', '-v', 'error', '-i', join(SRC, file), '-af', `atrim=end_sample=${Math.round(loop * RATE)}`,
      '-ar', String(RATE), '-c:a', 'libvorbis', '-q:a', '6', join(OUT, entry[m[1]].file)], { stdio: 'inherit' });
    console.log(`${place[1]} ${m[1]}: ${file} -> ${entry[m[1]].file} (${loop} s)`);
  }
  places[place[1]] = entry;
}

writeFileSync(join(OUT, 'music.json'), JSON.stringify({ music: MUSIC, places }, null, 1) + '\n');
console.log('music.json:', JSON.stringify(MUSIC));
