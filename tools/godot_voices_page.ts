// THE GODOT PORT: the page tools/godot_voices.mjs runs in a headless browser. The game's own voices (engine/audio.ts speakBoss, its
// BOSS_VOICES and speechPlan) saying every line a boss calls out (game/boss_calls.ts BOSS_CALL_LINES), into an offline audio
// context in place of the speakers: each line twice (its two takes differ as the game's plays do, in tune and in breath), each
// at a moment of its own on the offline clock, then rendered and cut apart. Nothing of the game is changed: the page hands its
// audio a context that renders where a live one would play.
import { initAudio, speakBoss, BOSS_VOICES } from '../src/engine/audio';
import { BOSS_CALL_LINES } from '../src/game/boss_calls';

/** Seconds of the offline clock each take is given: the longest line is under 5. */
const SLOT = 6;
const RATE = 24000;

declare global {
  interface Window {
    __voices: () => Promise<{ kind: string; line: string; take: number; pcm: string; rate: number }[]>;
  }
}

window.__voices = async () => {
  // the lines, each boss's in its order, each once
  const jobs: { kind: string; line: string; take: number }[] = [];
  for (const [kind, moves] of Object.entries(BOSS_CALL_LINES)) {
    if (!Object.prototype.hasOwnProperty.call(BOSS_VOICES, kind)) continue;
    const seen = new Set<string>();
    for (const line of Object.values(moves ?? {})) {
      if (seen.has(line)) continue;
      seen.add(line);
      for (const take of [1, 2]) jobs.push({ kind, line, take });
    }
  }
  const off = new OfflineAudioContext(1, Math.ceil(RATE * SLOT * jobs.length), RATE);
  let now = 0;
  // (the game's audio asks its context whether it is running and what time it is: this one is always running, at the moment of
  // the take being laid down)
  const proxy = new Proxy(off, {
    get(t, p) {
      if (p === 'state') return 'running';
      if (p === 'currentTime') return now;
      const v = Reflect.get(t, p, t);
      return typeof v === 'function' ? v.bind(t) : v;
    },
  });
  (window as unknown as { AudioContext: unknown }).AudioContext = function () {
    return proxy;
  };
  initAudio();
  for (let i = 0; i < jobs.length; i++) {
    now = i * SLOT;
    speakBoss(jobs[i].kind, jobs[i].line);
    // (the game will not start the same voice again within 40 ms of the last)
    await new Promise((r) => setTimeout(r, 45));
  }
  const buf = await off.startRendering();
  const all = buf.getChannelData(0);
  return jobs.map((j, i) => {
    const s = all.subarray(i * SLOT * RATE, (i + 1) * SLOT * RATE);
    // (cut where it falls silent for good)
    let end = s.length;
    while (end > 0 && Math.abs(s[end - 1]) < 1e-4) end--;
    end = Math.min(s.length, end + Math.round(RATE * 0.05));
    const pcm = new Int16Array(end);
    for (let k = 0; k < end; k++) pcm[k] = Math.max(-32767, Math.min(32767, Math.round(s[k] * GAIN * 32767)));
    let bin = '';
    const bytes = new Uint8Array(pcm.buffer);
    for (let k = 0; k < bytes.length; k++) bin += String.fromCharCode(bytes[k]);
    return { ...j, pcm: btoa(bin), rate: RATE };
  });
};

/**
 * The game plays a line through its voice's gain (VOICE_GAIN 0.5) and its master (DEFAULT_VOLUME 0.35 x HEADROOM 0.85); its
 * recorded sounds go through the same master at RECORDED_GAIN 0.5, from files that peak near 1. The Godot side plays those files
 * as they are: so a line is written as the game's recorded sounds are, the master taken back out (1 / (0.35 x 0.85)).
 */
const GAIN = 1 / (0.35 * 0.85);
