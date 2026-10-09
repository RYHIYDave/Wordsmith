// The clips of the Dream Thrash try-out (9 Oct 2026). Beats are counted from the start of a clip:
// a bar is four beats, so bar 8 begins on beat 32.
export const RATE = 48000;

const DREAM = ['pad', 'lead', 'sparkle', 'low'];
const THRASH = ['drums', 'bass', 'chug', 'riff'];
const ALL_FIGHT = [[0, 128]];

export const CLIPS = [
  // what he listens to
  { name: 'dream', plan: { bars: 32 }, tail: 4 },
  { name: 'fight_breaks_out', plan: { bars: 32, fights: [[32, 96]] }, tail: 4 },
  { name: 'fight_full', plan: { bars: 32, fights: ALL_FIGHT }, tail: 4 },
  // the same three with no limiter on the end, for measuring
  { name: 'raw_dream', plan: { bars: 32, raw: true }, tail: 4 },
  { name: 'raw_fight_full', plan: { bars: 32, fights: ALL_FIGHT, raw: true }, tail: 4 },
  // each part alone, over the whole tune, in a fight (so the lead and the wash are as they are in one)
  ...[...DREAM, ...THRASH].map((part) => ({ name: 'part_' + part, plan: { bars: 32, fights: ALL_FIGHT, only: [part], raw: true }, tail: 4 })),
  { name: 'half_dream', plan: { bars: 32, fights: ALL_FIGHT, only: DREAM, raw: true }, tail: 4 },
  { name: 'half_thrash', plan: { bars: 32, fights: ALL_FIGHT, only: THRASH, raw: true }, tail: 4 },
];

// the dream half's parts as they are outside a fight (the lead soft, the wash not stepped back)
export const DREAM_PARTS = DREAM.map((part) => ({ name: 'dreampart_' + part, plan: { bars: 32, only: [part], raw: true }, tail: 4 }));
CLIPS.push(...DREAM_PARTS);

// the same fight with the wall played the plain-synth way (held saw waves), to set beside the strings
CLIPS.push({ name: 'fight_full_saws', plan: { bars: 32, fights: ALL_FIGHT, wall: 'saws' }, tail: 4 });
CLIPS.push(...['bass', 'chug', 'riff'].map((part) => ({ name: 'sawpart_' + part, plan: { bars: 32, fights: ALL_FIGHT, only: [part], raw: true, wall: 'saws' }, tail: 4 })));

// the parts on their own, for the page: eight bars each
const MID_FIGHT = { bars: 8, from: 12, fights: [[0, 32]], raw: true };
CLIPS.push(
  { name: 'only_lead', plan: { bars: 8, fights: [[16, 32]], only: ['lead'], raw: true }, tail: 3 },
  { name: 'only_wash', plan: { bars: 8, only: ['pad', 'low'], raw: true }, tail: 3 },
  { name: 'only_sparkle', plan: { bars: 8, only: ['sparkle'], raw: true }, tail: 3 },
  { name: 'only_drums', plan: { ...MID_FIGHT, only: ['drums'] }, tail: 3 },
  { name: 'only_wall', plan: { ...MID_FIGHT, only: ['chug', 'bass'] }, tail: 3 },
  { name: 'only_riff', plan: { ...MID_FIGHT, only: ['riff'] }, tail: 3 },
);
