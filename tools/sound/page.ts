// The page the test browser runs to make a sample: it plays the music onto a clock that has no
// speaker (an OfflineAudioContext) and hands the sound back to tools/sound/render_music.mjs.
import { BAR, song, type Plan } from '../../src/engine/music';

let last: Uint8Array | null = null;

const w = window as unknown as Record<string, unknown>;

/** Renders one stretch and keeps it; says how big it is. */
w.render = async (plan: Plan, tail: number, rate: number): Promise<{ frames: number; bytes: number; ms: number }> => {
  const began = performance.now();
  const seconds = plan.bars * BAR + tail;
  const ctx = new OfflineAudioContext(2, Math.ceil(seconds * rate), rate);
  // as a player in the game would: each bar is written a bar before it sounds
  const s = song(ctx, ctx.destination, 0, plan);
  s.write(0);
  if (s.bars > 1) s.write(1);
  for (let b = 2; b < s.bars; b++) {
    void ctx.suspend((b - 1) * BAR).then(() => {
      s.write(b);
      return ctx.resume();
    });
  }
  const buf = await ctx.startRendering();
  const l = buf.getChannelData(0);
  const r = buf.getChannelData(1);
  const both = new Float32Array(l.length * 2);
  for (let i = 0; i < l.length; i++) {
    both[2 * i] = l[i];
    both[2 * i + 1] = r[i];
  }
  last = new Uint8Array(both.buffer);
  return { frames: l.length, bytes: last.length, ms: Math.round(performance.now() - began) };
};

/** Hands back a piece of the last render, as text the tool can carry out of the browser. */
w.chunk = (from: number, n: number): string => {
  if (!last) throw new Error('nothing rendered');
  const part = last.subarray(from, from + n);
  let s = '';
  for (let i = 0; i < part.length; i += 0x8000) s += String.fromCharCode(...part.subarray(i, i + 0x8000));
  return btoa(s);
};
