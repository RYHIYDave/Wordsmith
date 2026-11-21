// THE GODOT PORT: the page tools/godot_voices.mjs runs in a headless browser. The game's own voices (engine/audio.ts: speakBoss, its
// BOSS_VOICES; speak, its heroes' VOICES; speechPlan) saying the lines it is handed, into an offline audio context in place of the
// speakers: each at a moment of its own on the offline clock, then rendered and cut apart. Nothing of the game is changed: the page
// hands its audio a context that renders where a live one would play.
import { initAudio, speak, speakBoss } from '../src/engine/audio';
import type { Speaker, SpeakerVoice } from '../src/engine/audio';

/** Seconds of the offline clock each take is given: the longest line is under 5. */
const SLOT = 6;
const RATE = 24000;
/**
 * The game plays a line through its voice's gain (VOICE_GAIN 0.5) and its master (DEFAULT_VOLUME 0.35 x HEADROOM 0.85); its
 * recorded sounds go through the same master at RECORDED_GAIN 0.5, from files that peak near 1. The Godot side plays those files
 * as they are: so a line is written as the game's recorded sounds are, the master taken back out (1 / (0.35 x 0.85)).
 */
const GAIN = 1 / (0.35 * 0.85);

export interface Job {
  /** 'boss': speakBoss(who, text); 'hero': speak(who, voice, text, vol). */
  kind: 'boss' | 'hero';
  who: string;
  voice?: string;
  text: string;
  vol?: number;
}

declare global {
  interface Window {
    __voices: (jobs: Job[]) => Promise<{ pcm: string; rate: number }[]>;
  }
}

let ready = false;
let now = 0;
let off: OfflineAudioContext | null = null;

window.__voices = async (jobs: Job[]) => {
  off = new OfflineAudioContext(1, Math.ceil(RATE * SLOT * jobs.length), RATE);
  if (!ready) {
    // (the game's audio asks its context whether it is running and what time it is: this one is always running, at the moment of
    // the take being laid down; and it is the batch's own offline context, whichever batch it is)
    const proxy = new Proxy({} as OfflineAudioContext, {
      get(_t, p) {
        const t = off as OfflineAudioContext;
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
    ready = true;
  }
  for (let i = 0; i < jobs.length; i++) {
    now = i * SLOT;
    const j = jobs[i];
    if (j.kind === 'boss') speakBoss(j.who, j.text, j.vol ?? 1);
    else speak(j.who as Speaker, (j.voice ?? 'male') as SpeakerVoice, j.text, j.vol ?? 1);
    // (the game will not start the same voice again within 40 ms of the last)
    await new Promise((r) => setTimeout(r, 42));
  }
  const buf = await off.startRendering();
  const all = buf.getChannelData(0);
  return jobs.map((_j, i) => {
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
    return { pcm: btoa(bin), rate: RATE };
  });
};
