// THE SOUND CHAT'S SECOND BATCH (assets/sound/README.md, "Second batch"): his word on them, 7 Nov 2026, 09:34 (Eastern), “all
// good”, and of the bosses' that morning, “the sounds are good for now”. Here, which of them each enemy has: its attack (atk<Kind>),
// its voice (<family>_aggro as it first notices him, _hurt on a big hit only, _death as it dies, in place of monsterDie), a boss's
// (<boss>_roar as his fight begins, in place of bossRoar, _hurt, _death), and the sounds of what the silent bosses do (by the act).
// Each sound is two takes (<name>_1, _2), played by engine/audio.ts sfxNamed; fetched as a floor is come into (soundsOf).
// Silent by design till the third batch (7 Nov 2026, his “I get that they’re supposed to be silent per the Hush but they should
// probably have SOMETHING anyway”, “Just a boss that makes no sound isn’t the best game design”; “Yes, hand them over
// (Recommended)”): the Mute Hound, the Silent Order, the Hush shapes, the Hushed (every Hushed kind), the Hushed Watchman and the
// Rime Shade now have voices with no voice in them (breath, cloth, armour, ink, paper, fog, frost), and the silent bosses roars,
// hurts and deaths of the same (the Crier, the Palimpsest, the Scraper, the Quill, the Censor, the Princess). The human enemies'
// voices come later.

import type { MonsterKind } from './types';

/** The switch: off, the enemies sound as before (monsterDie, bossRoar). */
export const ENEMY_SOUNDS = { on: true };

/** Each enemy's attack, by its family. */
export const ATK: Partial<Record<MonsterKind, string>> = {
  skeleton: 'atkBones', champion: 'atkBones', beast: 'atkBones', mite: 'atkBones',
  brute: 'atkTroll', chieftain: 'atkTroll',
  bat: 'atkBat',
  dagger: 'atkDagger',
  cultist: 'atkHex', priest: 'atkHex', chanter: 'atkHex',
  boneward: 'atkShield', qguard: 'atkShield',
  shade: 'atkSpirit', rshadow: 'atkSpirit', reflection: 'atkSpirit', drowned: 'atkSpirit',
  wolf: 'atkBite',
  rat: 'atkRat', ratking: 'atkRat',
  deer: 'atkAntler', stag: 'atkAntler',
  vulture: 'atkVulture', queen: 'atkVulture',
  swan: 'atkSwan',
  moth: 'atkMoth',
  crawler: 'atkSting', scorpion: 'atkSting',
  leech: 'atkLeech', spawn: 'atkLeech',
  rubbling: 'atkStone', qgolem: 'atkStone',
  footman: 'atkSteel', kknight: 'atkSteel',
  pguard: 'atkSpear',
  xbow: 'atkCrossbow',
  firepot: 'atkFirepot',
  hushed: 'atkClub', watch: 'atkClub',
  inkling: 'atkInk',
  bookwarden: 'atkBook',
};

/** Each enemy's voice, by its family (aggro, hurt, death). */
export const VOICE: Partial<Record<MonsterKind, string>> = {
  skeleton: 'bones', archer: 'bones', marksman: 'bones', champion: 'bones', beast: 'bones', mite: 'bones', boneward: 'bones',
  brute: 'troll', chieftain: 'troll',
  bat: 'bat',
  shade: 'spirit', rshadow: 'spirit', drowned: 'spirit', reflection: 'spirit',
  golem: 'flesh',
  wolf: 'wolf',
  rat: 'rat',
  deer: 'deer',
  vulture: 'vulture',
  swan: 'swan',
  moth: 'moth',
  crawler: 'bug', scorpion: 'bug',
  leech: 'leech', spawn: 'leech',
  rubbling: 'stone', qgolem: 'stone',
  devil: 'devil',
  inkling: 'ink',
  bookwarden: 'book',
  // (THE THIRD BATCH, the silent ones)
  hound: 'hound',
  order: 'order',
  hshape: 'hshape',
  hushed: 'hushed', fieldhand: 'hushed', patient: 'hushed', gardener: 'hushed', groom: 'hushed',
  watch: 'watch',
  rshade: 'rshade',
};

/** The bosses that roar: their roar as the fight begins, their hurt, their death. */
export const BOSS_VOICE: Partial<Record<MonsterKind, string>> = {
  chained: 'chained', stoker: 'stoker', amalgam: 'amalgam', unfinished: 'unfinished', queen: 'cqueen', stag: 'stag', eye: 'eye', ratking: 'ratking',
  // (THE THIRD BATCH, the silent bosses)
  crier: 'crier', palimpsest: 'palimpsest', scraper: 'scraper', quill: 'quill', censor: 'censor', princess: 'princess',
};

/** The silent bosses: the sound of what they do, as each act begins (by the act's id). */
export const ACT_SOUND: Record<string, string> = {
  'crier:swing': 'crier_slam', 'crier:shout': 'crier_shout', 'crier:toll': 'crier_toll',
  'palimpsest:slam': 'palimpsest_slam', 'palimpsest:leaves': 'palimpsest_whirl', 'palimpsest:cuts': 'palimpsest_whirl',
  'scraper:snap': 'scraper_claw', 'scraper:strip': 'scraper_claw', 'scraper:scour': 'scraper_claw',
  'quill:stab': 'quill_nib', 'quill:write': 'quill_nib', 'quill:lines': 'quill_nib', 'quill:swoop': 'quill_swoop',
  'censor:redact': 'censor_stamp', 'censor:blackout': 'censor_stamp', 'censor:strike': 'censor_line', 'censor:slash': 'censor_line',
  'princess:lash': 'princess_vine', 'princess:snare': 'princess_vine',
};

/** How often each is heard (seconds): an aggro of a family, a hurt of a family, an attack of a family, a boss's hurt. */
export const ENEMY_GAPS = { aggro: 1.2, hurt: 0.7, atk: 0.25, bossHurt: 2.5 } as const;
/** A hurt is heard on a big hit only: a critical, a blow of this share of its life or more, or one in `one` of the others. */
export const HURT_BIG = { share: 0.25, one: 6 } as const;

/** The sounds a floor's enemies will want (to fetch as it is come into): their attacks, voices and the bosses' sounds. */
export function soundsOf(kinds: Iterable<MonsterKind>): string[] {
  const out = new Set<string>();
  for (const k of kinds) {
    const a = ATK[k];
    if (a) out.add(a);
    const v = VOICE[k];
    if (v) for (const s of ['aggro', 'hurt', 'death']) out.add(`${v}_${s}`);
    const b = BOSS_VOICE[k];
    if (b) for (const s of ['roar', 'hurt', 'death']) out.add(`${b}_${s}`);
    for (const [act, name] of Object.entries(ACT_SOUND)) if (act.startsWith(`${k}:`)) out.add(name);
  }
  return [...out];
}
