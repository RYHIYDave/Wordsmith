## A monster on the floor, as game.ts updateMonsters runs one:
##   SLEEP until it sees the hero within 9 tiles (TUNE.aggroRadius), and then its pack wakes with it (wakeUp: within 14).
##   CHASE: straight at him when it sees him and he is within 2.5 tiles, else down the flow field (nav.ts flowField). A
##     melee monster stops at reach * 0.8 + his radius; one that shoots stands once it sees him within keepMax.
##   ITS MOVES (THE MONSTERS' ATTACKS, game.ts pickMove / startMove / landMove; monster_moves.gd): when its wait is out, the
##     biggest of its moves that is ready and that he is in reach of (and it sees him, but for calling the dead): it winds
##     up, what it is about to do marked on the floor (a slam's circle, a charge's line, a line of aim, the Lockdown's
##     bars); it lands; it recovers; it waits `after`, the move its own cooldown. One without moves has its one blow.
##   WINDUP, then the blow if he is still within range + (r - 0.32) + 0.45 + his radius, or an arrow loosed.
##   RECOVER, its wait set (cooldown, or the move's `after`, times 0.9 to 1.2).
##   CHARGE (the red troll): down his line at 10 tiles a second; the hero met on it struck once and knocked aside; at the
##     line's end, or anything that stops him, he pulls up.
##   RISE (the dead the Warden calls): crawling out of the ground, no more than a picture, then into the fight.
##   FLOORS 3 TO 5 (ACTION_F3, ACTION_F4, THE NEW MONSTERS): the green troll's RAMPAGE (two swings and a leaping slam, he
##     carried on through it) and his BULL RUSH (his stop carrying him on); the BONEWARD's thrust, its spear thrown (then it
##     fights with its shield, goes for its spear and stoops for it: PICKUP) and its SHIELD WALL (a blow from before it
##     glances off); the high priest's fire bolt and his CENSER's burning smoke; the dagger cultist's FRENZY of four stabs.
##   Struck: it flashes (0.12 s), shows its life for 4 s, wakes. Killed: it falls (its die list) and lies 30 s, fading
##   over the last 1.5 (BODIES); its marks on the floor go with it.
##   WHAT THE HERO'S WORDS DO TO IT (game.ts hitMonster, chillMonster, poisonMonster, stunMonster, staggerMonster, damageMonster,
##     updateMonsters, updateDots; the hit itself is the hero's: hero.gd hit_monster): it BURNS (Flame: half its burning a
##     second every half second, 3 s); it is CHILLED (Frost: its steps and its charge slower by the chill's share, its wind-ups
##     by two fifths of it, 2.5 s) and a second chilling hit FREEZES it (1.1 s, an elite 0.6 s, then not again for 4 s; never
##     a boss); it is POISONED (each hit a dose, 8 at most, 4 s from the last; half its poison a second every half second); it
##     is STUNNED (Heavy: 0.8 s, an elite half that; never a boss) or STAGGERED by cracked ground (0.55 s, and not again for
##     1.5 s after; never a boss): frozen, stunned or staggered it does nothing, and what it was winding up is broken off.
##   ITS OWN WORDS (game.ts monsterElement, halfOf, wordShare, hurtHero; the harm itself is the hero's: hero.gd hurt_by): its
##     blow is of the first of Flame, Frost and Lightning among its words, else of its kind's own element; every blow, shot and
##     mark of its carries its words to him (`blow`, `harm_hero`); a pack's minion carries its leader's at half strength (and
##     half of a blow made Flame, Frost or Lightning so is of its kind's own element), whole for 5 s after the skeleton
##     champion's cry (`rally_t`; heard only by minions carrying his words: monsters.gd hears_cry). SWIFT: its waits between
##     blows 30% shorter (a minion's 15%: game.ts monsterAttack, landMove). What Power and Swift give its life, its damage and
##     its pace is in its numbers already (game.ts spawn, monsters.json).
##   OVER ITS HEAD, over the dark (render.ts drawBars): its life's bar while it is hurt, and always over an elite and each of a
##     blue pack; an elite's name, and a blue pack's once over the first of it in sight, in its colours; the rune of the word
##     it carries over an elite's or a boss's head, bobbing: what its death will leave (`_Over`).
extends Node2D

const Glow := preload("res://scripts/figure_glow.gd")
const HideClip := preload("res://scripts/hide_clip.gd")
const Iso := preload("res://scripts/iso.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")
## (a monster whose figure's pictures are held only near him is drawn from them within this many tiles of him: past what he can see
## of it, a tall one on a phone held upright among them (its screen reaches about 25 tiles from him at its corners); monsters.gd
## NEAR_FETCH asks for them well before)
const NEAR_SHOW := 30.0
const MM := preload("res://scripts/monster_moves.gd")
const Words := preload("res://scripts/words.gd")
const Headsman := preload("res://scripts/headsman.gd")
const Amalgam := preload("res://scripts/amalgam.gd")
const Chained := preload("res://scripts/chained.gd")
const Stoker := preload("res://scripts/stoker.gd")
const Fleshmancer := preload("res://scripts/fleshmancer.gd")
const MiniFm := preload("res://scripts/minifm.gd")
const Keybearers := preload("res://scripts/keybearers.gd")
## THE BOSSES THAT FIGHT BY THEIR OWN RULES (game/bosses.ts BossRules), each a script of its own with `step(m, dt, hero)`, handed
## the monster every frame it is awake in place of the common rules below (and `died(m)`, if it has one, as it falls): by kind.
const BOSS_AI := {
	"headsman": Headsman,
	"amalgam": Amalgam, "mite": Amalgam.Mite, "beast": Amalgam.Beast,
	"chained": Chained,
	"stoker": Stoker,
	"fleshmancer": Fleshmancer,
	"minifm": MiniFm,
	"keyblade": Keybearers.Knife,
	"keyflame": Keybearers.Flame,
	# (THE COMMON MONSTERS OF FLOORS 6 TO 8, each by its kind's own rules: game/act1_rules/; scripts/act1/)
	"qgolem": preload("res://scripts/act1/qgolem.gd"), "rubbling": preload("res://scripts/act1/rubbling.gd"),
	"firepot": preload("res://scripts/act1/firepot.gd"), "chanter": preload("res://scripts/act1/chanter.gd"),
	"vulture": preload("res://scripts/act1/vulture.gd"), "crawler": preload("res://scripts/act1/crawler.gd"),
	"devil": preload("res://scripts/act1/devil.gd"), "scorpion": preload("res://scripts/act1/scorpion.gd"),
	# (THE COMMON MONSTERS OF FLOORS 9 AND 10, and floor 9's two side bosses: game/act1_rules/; scripts/act1/)
	"wolf": preload("res://scripts/act1/wolf.gd"), "deer": preload("res://scripts/act1/deer.gd"),
	"leech": preload("res://scripts/act1/leech.gd"), "spawn": preload("res://scripts/act1/spawn.gd"),
	"drowned": preload("res://scripts/act1/drowned.gd"),
	"warchief": preload("res://scripts/act1/warchief.gd"), "mistwolf": preload("res://scripts/act1/mistwolf.gd"),
	# (THE BOSSES OF FLOORS 8 AND 9, each by his own rules: game/act1_rules/cantor.ts, stag.ts; scripts/act1/)
	"cantor": preload("res://scripts/act1/cantor.gd"), "stag": preload("res://scripts/act1/stag.gd"),
	# (THE BOSSES OF FLOORS 6 AND 7, each by its own rules: game/act1_rules/unfinished.ts, queen.ts)
	"unfinished": preload("res://scripts/act1/unfinished.gd"), "queen": preload("res://scripts/act1/queen.gd"),
	# (FLOOR 10'S BOSS, THE SWAMP COLOSSUS, and his tentacles, of his kind: game/act1_rules/colossus.ts; scripts/act1/colossus.gd)
	"eye": preload("res://scripts/act1/colossus.gd"),
	# (THE CITY'S COMMON MONSTERS, floors 11 to 15, each by its kind's own rules: game/act1_rules/; scripts/act2/)
	"hushed": preload("res://scripts/act2/hushed.gd"), "hound": preload("res://scripts/act2/hound.gd"),
	"scribe": preload("res://scripts/act2/scribe.gd"), "watch": preload("res://scripts/act2/watch.gd"),
	# (THE CITY'S BOSSES: floor 11's, the Crier)
	"crier": preload("res://scripts/act2/crier.gd"),
	# (floor 12's: the plague rats, the dredgers, and its boss, the Rat King)
	"rat": preload("res://scripts/act2/rat.gd"), "dredger": preload("res://scripts/act2/dredger.gd"), "ratking": preload("res://scripts/act2/ratking.gd"),
	# (floor 13's: the fieldhands, the carters, and its double boss, the Scraper and the Quill)
	"fieldhand": preload("res://scripts/act2/fieldhand.gd"), "carter": preload("res://scripts/act2/carter.gd"),
	"scraper": preload("res://scripts/act2/scraper.gd"), "quill": preload("res://scripts/act2/quill.gd"),
	# (floor 14's: the patients, the orderlies, and its boss, the Physician)
	"patient": preload("res://scripts/act2/patient.gd"), "orderly": preload("res://scripts/act2/orderly.gd"),
	"physician": preload("res://scripts/act2/physician.gd"),
	# (floor 15's: the inklings, the bookwardens, and its boss, the Censor)
	"inkling": preload("res://scripts/act2/inkling.gd"), "bookwarden": preload("res://scripts/act2/bookwarden.gd"),
	"censor": preload("res://scripts/act2/censor.gd"),
	# (THE HIGH CITY, floors 16 to 20, each by its kind's own rules: game/act1_rules/; scripts/act3/. Floor 16's: the swans, the
	# gardeners, the grooms, the palace guard)
	"swan": preload("res://scripts/act3/swan.gd"), "gardener": preload("res://scripts/act3/gardener.gd"),
	"groom": preload("res://scripts/act3/groom.gd"), "pguard": preload("res://scripts/act3/pguard.gd"),
	# (and its boss, the Princess)
	"princess": preload("res://scripts/act3/princess.gd"),
	# (floor 17's: the masked dancers, the footmen, the Silent Order (floors 19 and 20 theirs too), and the Prince)
	"dancer": preload("res://scripts/act3/dancer.gd"), "footman": preload("res://scripts/act3/footman.gd"),
	"order": preload("res://scripts/act3/order.gd"), "prince": preload("res://scripts/act3/prince.gd"),
	# (floor 18's: the ladies-in-waiting, your reflections, the queen's guard, and the Queen)
	"lady": preload("res://scripts/act3/lady.gd"), "reflection": preload("res://scripts/act3/reflection.gd"),
	"qguard": preload("res://scripts/act3/qguard.gd"), "gqueen": preload("res://scripts/act3/gqueen.gd"),
	# (floor 19's: the crossbowmen on the walls, the king's knights; the Order's armed last are the Order's)
	"xbow": preload("res://scripts/act3/xbow.gd"), "kknight": preload("res://scripts/act3/kknight.gd"),
	# (and its boss, the King)
	"gking": preload("res://scripts/act3/gking.gd"),
	# (floor 20's: the Hush in its own shapes)
	"hshape": preload("res://scripts/act3/hshape.gd"), "rshadow": preload("res://scripts/act3/rshadow.gd"),
	"rshade": preload("res://scripts/act3/rshade.gd"), "moth": preload("res://scripts/act3/moth.gd"),
	# (endless mode's final boss, at the bottom of the shaft: act3/wsboss.gd)
	"wsboss": preload("res://scripts/act3/wsboss.gd"),
}
## (floors 6 to 8's: the chanter's ward over the cult near it, the jostle of those up in the air or under the lip: act1.gd)
const Act1 := preload("res://scripts/act1/act1.gd")

const AGGRO := 9.0
const WAKE_PACK := 14.0
const HERO_R := 0.3
const RECOVER := 0.3
const BODY_LIES := 30.0
const BODY_FADES := 1.5
const BAR_FOR := 4.0
## (game.ts: the voice of each kind, sound_families.ts VOICE, and its blow's sound, ATK; each name has two takes)
const VOICE := {
	"skeleton": "bones", "archer": "bones", "champion": "bones", "marksman": "bones", "beast": "bones", "mite": "bones", "boneward": "bones",
	"brute": "troll", "bat": "bat", "shade": "spirit",
	"vulture": "vulture", "crawler": "bug", "scorpion": "bug", "rubbling": "stone", "qgolem": "stone", "devil": "devil",
	# (floors 9 and 10's, and floor 9's side bosses)
	"wolf": "wolf", "mistwolf": "wolf", "deer": "deer", "leech": "leech", "spawn": "leech", "drowned": "spirit", "warchief": "troll",
	# (the city's: sound_families.ts VOICE, its third batch the silent ones)
	"rat": "rat", "inkling": "ink", "bookwarden": "book", "hound": "hound", "hushed": "hushed", "fieldhand": "hushed", "patient": "hushed", "watch": "watch",
	# (the High City's)
	"swan": "swan", "moth": "moth", "rshadow": "spirit", "reflection": "spirit", "order": "order", "hshape": "hshape", "gardener": "hushed",
	"groom": "hushed", "rshade": "rshade",
}
const ATK := {
	"skeleton": "atkBones", "champion": "atkBones", "beast": "atkBones", "mite": "atkBones", "brute": "atkTroll", "bat": "atkBat",
	"dagger": "atkDagger", "cultist": "atkHex", "priest": "atkHex", "boneward": "atkShield", "shade": "atkSpirit",
	"chanter": "atkHex", "vulture": "atkVulture", "crawler": "atkSting", "scorpion": "atkSting", "rubbling": "atkStone", "qgolem": "atkStone", "firepot": "atkFirepot",
	"wolf": "atkBite", "mistwolf": "atkBite", "deer": "atkAntler", "leech": "atkLeech", "spawn": "atkLeech", "drowned": "atkSpirit", "warchief": "atkTroll",
	# (the city's)
	"rat": "atkRat", "ratking": "atkRat", "hushed": "atkClub", "watch": "atkClub", "inkling": "atkInk", "bookwarden": "atkBook",
	# (the High City's)
	"qguard": "atkShield", "rshadow": "atkSpirit", "reflection": "atkSpirit", "swan": "atkSwan", "moth": "atkMoth", "footman": "atkSteel",
	"kknight": "atkSteel", "pguard": "atkSpear", "xbow": "atkCrossbow", "rshade": "rshade",
}
## (sound_families.ts BOSS_VOICE: the bosses that roar: their roar as the fight begins, their hurt, their death. The Stoker's
## is in the game's table too and is never heard there: he is an elite, and these wait on a boss. The Warden, the Headsman
## and the Fleshmancer have none: the common roar.)
const BOSS_VOICE := {"chained": "chained", "amalgam": "amalgam",
	# (the Hollow Stag, floor 9's, a beast who bellows; the Cantor has none: the common roar)
	"stag": "stag",
	# (the bosses of floors 6 and 7)
	"unfinished": "unfinished", "queen": "cqueen",
	# (the Swamp Colossus: his roar as he is first come upon is the old Eye's; his hurt and his death his own: colossus.gd hurt_voice, died)
	"eye": "eye",
	# (the city's: the Rat King's roar, and the silent bosses', sound_families.ts BOSS_VOICE)
	"ratking": "ratking", "crier": "crier", "scraper": "scraper", "quill": "quill", "censor": "censor",
	# (the High City's: the Princess, silent but for her vines)
	"princess": "princess"}

var mgr  # monsters.gd
var art: BakedFigure
## (one of a kind's other looks, game.ts Monster.form: the palace guard's four, floor 16)
var form := 0
var def: Dictionary
var kind := ""
var world := Vector2.ZERO
var face := Vector2(0.7071, 0.7071)
var r := 0.32
## (THE CITY'S WORDS: SPLITTING, on it: one of the two it split into as the one carrying it fell (splits no more), drawn `look` the
## size: game.ts splitMonster)
var split := false
var look := 1.0
## (THE CITY'S WORDS in his moves: HEXING's curse on it (it takes `hex_more` more, for `hex_t`); STILLING, its time slowed by
## `still_k` for `still_t`; BINDING, held where it stands for `bind_t`, and not held again for `bind_again`: hero.gd, city_words.gd)
var hex_t := 0.0
var hex_more := 0.0
var still_t := 0.0
var still_k := 0.0
var bind_t := 0.0
var bind_again := 0.0
## (THE HIGH CITY'S SEVEN LAST WORDS: BLEEDING in his moves, it bleeds `bleed_dps` for `bleed_t`, `bleed_move` times as much while it
## walks (where it was at the last bite, `bleed_at`); and its own words: MIRRORING's wait before harm goes back again, SURGING's
## shockwave's clock, the gold PLUNDERING stole from him, and whether REAPING has stood it up once already: last_words.gd)
var bleed_t := 0.0
var bleed_dps := 0.0
## (THE WARLOCK's tree: Terrible Roar, how long it runs from him yet)
var flee_t := 0.0
## (THE WARRIOR'S WARHAMMER: Smash's daze toward a stun, and when it was last added to, on his clock: hero.gd smashed)
var daze := 0.0
var daze_at := 0.0
var bleed_move := 0.0
var bleed_at := Vector2.INF
## (THE WARLOCK, game/warlock.ts: his HELLFIRE on it (his bolt's), `hell_dps` a second for `hell_t`; his CURSE's smoulder, `curse_dps`
## for `curse_t`: a cursed one dying spreads every burn on it to those near it, monsters.gd spread_burns)
var hell_t := 0.0
var hell_dps := 0.0
var curse_t := 0.0
var curse_dps := 0.0
## THROWN (game.ts throwMonster, flyThrown): flung away from a place, so far in so long, {vx, vy, t}; a wall stops it
var thrown := {}
## (THE BRAWLER's uppercut, game.ts popUp: how high it is thrown up now, game pixels; heroes/brawler.gd sets it)
var pop := 0.0
## (THE SKILL TREES REMADE: Giant Slayer's cracks in its guard: 3% more from everything each, ten at most: game.ts m.cracks)
var cracks := 0
## (THE SKILL TREES: shocked by a lightning hit, so long: what the Mage's Overload works on: game.ts m.shockT)
var shock_t := 0.0
var mirror_t := 0.0
var surge_t := -1.0
var stolen := 0
var risen := false
var life := 1.0
var max_life := 1.0
var dmg_min := 1.0
var dmg_max := 1.0
var speed := 1.0
var pack_id := -1
var boss := false
var champion := false
var elite := false
## (one the Warden called up: it leaves nothing)
var summoned := false
## (what its kind's rules kept about it as the game laid it: the export's `a1`)
var a1_in := {}
## THE WORDS IT HAS (game.ts spawn; the floor's monsters.json): `words`, the words it fights with (an elite's one, a guardian's,
## a boss's, its pack's); `half`, a pack's minion's, its leader's at half strength; `carries`, the word it gives up when it
## dies, shown as a rune over its head (none before the wordsmith's ring is lit).
var words: Array = []
var half: Array = []
## UNIQUE ITEMS: THE CRIER'S HUSH (uniques.gd; game.ts Monster.dark): its words and its half, darkened while he stands close.
var dark_words: Array = []
var dark_half: Array = []
## UNIQUE ITEMS, SET 1: DEATH KNELL (game.ts Monster.knellT): seconds it rings yet, struck by his hammer.
var knell_t := 0.0
## (the Burning Verse: a burn of his on it while it was cursed, which never goes out: game.ts Monster.verse)
var verse := false
var carries: Array = []
## THE ROYAL CARDS (act3/royal_cards.gd): the royal that touched its pack ("princess", "prince", "queen", "king"), or "".
var royal := ""
## (MONSTER PACKS: "blue", a blue pack's; "leader", a yellow pack's leader; "minion", one he leads; "" for any other. And how
## long a minion's leader's words are whole yet since the skeleton champion's cry: game.ts rallyT)
var rarity := ""
var rally_t := 0.0
## (its number among the floor's monsters, the game's `id`: what a telling of a stun or a stagger names it by. One made here,
## the Warden's dead or a boss's brood, has its own.)
var id := -1
## (its own moment, the game's `seed` (0 to 1, from the floor's monsters.json): when a rubbling climbs out of its pile, a crawler
## up over the lip, how a dust devil's weave begins)
var own_seed := 0.0
## WHAT THE HERO'S WORDS HAVE DONE TO IT, named as the game names them (game/state.ts Monster):
##   burn_t, burn_dps                 FLAME in front: it burns so many seconds more, so much a second
##   chill_t, chill                   FROST: slowed by `chill` of its pace for so many seconds more
##   frozen_t, freeze_immune          a second chilling hit froze it; and how long before it can be frozen again
##   poison_t, poison_dps, poison_n   POISON: so many seconds more, so much a second, of so many doses
##   stun_t                           HEAVY in front: stunned
##   stagger_t, stagger_cd            HEAVY behind's cracked ground: it reels; and how long before that ground can stagger it again
var burn_t := 0.0
var burn_dps := 0.0
var chill_t := 0.0
var chill := 0.0
var frozen_t := 0.0
var freeze_immune := 0.0
var poison_t := 0.0
var poison_dps := 0.0
var poison_n := 0
var stun_t := 0.0
var stagger_t := 0.0
var stagger_cd := 0.0
## FLOORS 6 TO 10'S WORDS (game/state.ts Monster markT, shield, lastSkill): `mark_t`, PRECISE behind: marked, his next hit on it
## a certain critical, so many seconds more; `shield`, GUARDING on it: so much harm its shield takes first (a fifth of its
## life as it comes into the world: the floor's monsters.json); `last_skill`, which of his moves last struck it (0 Strike, 1
## Whirlwind, 2 Lunge; -1 none): the move whose words its death answers to (hero.gd killed).
var mark_t := 0.0
var shield := 0.0
## EVERY WORD ON A DUNGEON (foe_words.gd): Sunder, when a blow of its last knocked him back; Fervor, the deaths it has been fed and
## how long still; Cauterize, its wounds seared shut, once; Rime Ward, when its shield last chilled him; Hailstorm's wait; Eruption's
## and Thunder's count of its blows.
var foe_sunder_at := -1e9
var fervor_n := 0
var fervor_t := 0.0
var seared := false
var rime_at := -1e9
var hail_t := -1e9
var foe_n := 0
var last_skill := -1
## WORDMELDING (melds.gd; game/state.ts Monster): `scald_cd`, `fumes_cd`, how long before Scald's crack and Fumes' cloud can come
## of it again; `blight_t`, Blight behind: while poisoned it takes more from everything, so many seconds more; `bite_dps`,
## Frostbite in front: what it loses a second while chilled (twice that frozen); `sunder`, Sunder: how much more it takes while
## stunned (set by a Sunder hit, kept), and `sunder_t` how long its crack shows (game.ts sunderTill); `demolished`, Demolition in
## front has burst it at half its life.
var scald_cd := 0.0
var fumes_cd := 0.0
var blight_t := 0.0
var bite_dps := 0.0
var sunder := 0.0
var sunder_t := 0.0
var demolished := false
## (game.ts struckT: how long since a blow last landed on it; not what burns or poisons it. One that reels reels by it:
## stoker.gd, keybearers.gd)
var struck_t := 1e9
var xp := 0.0
var state := "sleep"
var dead := false
## (its tile is in sight now: sight.gd; where there is no sight, always)
var seen := true
## (BOSS_INTRO: doors.gd) the boss waits: he stands looking at the hero and nothing harms him, until his gate has fallen and his
## line is said. `title` his name as the game gives it; what he says over his head, and for how long.
var waits := false
var title := ""
var _said := ""
var _said_t := 0.0
var _said_lift := SAY_LIFT
var _said_fallen := false
## (THE HIGH CITY, FLOOR 16: in the Swan Gardens' nettles, and a moment after, its pace times this: act3/garden.gd)
var nettle_k := 1.0
var _said_secs := 0.0
var _not_yet := 0.0
var _not_yet_t := 0.0
## (when it last said why a blow did nothing: _told_word)
var _word_told := -9.0

var _moves: Array = []
var _move_cd: Array = []
var _move := -1
var _charge := {}
var _aim := {}
## (the green troll's rampage and the dagger cultist's frenzy: where it began, the way he faced, how far he has been carried
## and which of its blows are made: game.ts m.rampage, m.frenzy)
var _carry := {}
## (the bull rush's stop: how far it has carried him on; less than 0, none)
var _rush_stop := -1.0
## (THE BONEWARD: its spear is gone; where it lies and the way to it; how long since it picked it up, since a blow glanced
## off its shield; less than 0, never)
var bare := false
var _spear := {}
var _raised_t := -1.0
var _glance_t := -1.0
var _t := 0.0
var _cd := 0.0
var _list := "idle"
var _anim_t := 0.0
var _flash := 0.0
var _bar := 0.0
var _dead_for := 0.0
var _weave := randf() * TAU
## (what its picture gives off, over the dark: _draw_lights; the frame shown, with its lights)
var _lights: Node2D
var _lit_f := {}
var _sprite: Sprite2D
## (how high the ground it stands on lifts it on the screen, picture pixels)
var _lift := 0.0
## (THE HEADSMAN MADE NEW: his prowl and his acts are his own: headsman.gd)
var h2 = null


func setup(m: Dictionary, kind_def: Dictionary, figure: BakedFigure) -> void:
	kind = m["kind"]
	id = int(m["id"]) if m.has("id") else int(get_instance_id())
	words = m.get("words", [])
	half = m.get("half", [])
	carries = m.get("carries", [])
	# (THE ROYAL CARDS, the High City's: the royal that touched its pack, its crest over its head, its card as it dies: game.ts spawn)
	royal = str(m.get("royal", "")) if m.get("royal") != null else ""
	rarity = str(m.get("rarity", ""))
	def = kind_def
	art = figure
	world = Vector2(m["x"], m["y"])
	face = Vector2(m["fx"], m["fy"])
	r = m["r"]
	life = m["life"]
	max_life = m["maxLife"]
	dmg_min = m["dmgMin"]
	dmg_max = m["dmgMax"]
	speed = m["speed"]
	pack_id = int(m["packId"])
	boss = m["boss"]
	title = str(m.get("name", kind))
	champion = m.get("champion", false)
	elite = m.get("elite", false)
	summoned = not m.has("xp")
	xp = float(m.get("xp", kind_def.get("xp", 0)))
	_anim_t = m.get("animT", 0.0)
	shield = float(m.get("shield", 0.0))
	form = int(m.get("form", 0))
	_moves = MM.moves_of(kind, champion)
	own_seed = float(m.get("seed", randf()))
	# (what its kind's rules keep about it as the game laid it: floor 14's patients lying in their beds)
	a1_in = m["a1"] if m.get("a1") is Dictionary else {}
	# (ENDLESS MODE, game.ts spawn: on an endless level as strong as its level's depth, `power`, and 10% more for each endless level
	# before it, `tough`: monsters.gd strength, main.gd endless_strength; an elite with two words, a guardian with three)
	if mgr != null and not mgr.strength.is_empty():
		var S: Dictionary = mgr.strength
		var k: float = float(S["boss"] if boss else S["life"])
		max_life = maxf(1.0, roundf(max_life * k))
		life = maxf(1.0, roundf(life * k))
		dmg_min *= float(S["dmg"])
		dmg_max *= float(S["dmg"])
		xp *= float(S["xp"])
		var want := (3 if champion else (2 if elite else 0)) if (S["life"] != 1.0 or S["dmg"] != 1.0) else 0
		# (FOE_WORDS: the words burned in at the Rim's gate, every monster's at full strength, a minion's too)
		for w in S.get("laid", []):
			if not words.has(w):
				words = words.duplicate()
				words.append(w)
			half = half.filter(func(x): return x != w)
		if not boss and rarity != "minion" and words.size() < want:
			words = words.duplicate()
			var pool: Array = (S["words"] as Array).filter(func(w): return not words.has(w))
			pool.shuffle()
			while words.size() < want and not pool.is_empty():
				words.append(pool.pop_back())
	if BOSS_AI.has(kind):
		h2 = BOSS_AI[kind].new()
		# (what one with rules of its own has about it from the first, before it wakes: the Fleshmancer's circle)
		if h2.has_method("begun"):
			h2.begun(self)


## Called up out of the ground (the Warden's dead): `secs` till it is out.
func rise(secs: float) -> void:
	state = "rise"
	_t = secs
	_set_list("crawl")


## ARRIVALS (game/arrivals.ts; game.ts arriveFrom, updateRisers; render/arrivals.ts): coming in up out of a rift in the floor, its
## rift opening `delay` seconds from now; `secs` from then till it is out and in the fight (nothing reaches it while it comes).
## ({age: from the rift's opening, rise, opened})
var _arrive := {}


func arrive(delay: float, secs: float) -> void:
	state = "rise"
	_t = delay + secs
	_arrive = {"age": -delay, "rise": secs, "opened": false}
	_set_list("idle")


## (render/arrivals.ts risenBy) How far up it is (0 to 1): nothing while its rift opens, then up, fast then slowing.
func risen_by() -> float:
	var o := 0.3
	var age: float = _arrive["age"]
	if age <= o:
		return 0.0
	var k := minf(1.0, (age - o) / maxf(0.01, float(_arrive["rise"]) - o))
	return 1.0 - (1.0 - k) * (1.0 - k)


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.centered = false
	add_child(_sprite)
	# (what its picture gives off, over the place's dark: render.ts monsterLit, drawLights)
	_lights = Node2D.new()
	_lights.z_index = 51
	_lights.material = Glow.added()
	_lights.draw.connect(_draw_lights)
	add_child(_lights)
	_over = _Over.new()
	_over.m = self
	add_child(_over)
	_place()
	_show()


func step(dt: float, hero) -> void:
	# (a minion's leader's words whole since the champion's cry, for so long yet: game.ts updateMonsters)
	if rally_t > 0.0:
		rally_t = maxf(0.0, rally_t - dt)
	if dead:
		_dead_for += dt
		_anim_t += dt
		if _said_t > 0.0:
			_said_t = maxf(0.0, _said_t - dt)
			queue_redraw()
		if _dead_for > BODY_LIES - BODY_FADES:
			modulate.a = clampf((BODY_LIES - _dead_for) / BODY_FADES, 0.0, 1.0)
		if _dead_for >= BODY_LIES:
			queue_free()
		_show()
		return
	# (THE CITY'S WORDS: what the hero's words did to it runs out, on the clock; and STILLING, its time slowed by a hit or in a bubble:
	# it moves, attacks and is drawn slower, by `dt` from here on; what is done to it, burning, chill, stun and the rest, runs out as
	# ever: `real`)
	var real := dt
	hex_t = maxf(0.0, hex_t - dt)
	still_t = maxf(0.0, still_t - dt)
	bind_t = maxf(0.0, bind_t - dt)
	bind_again = maxf(0.0, bind_again - dt)
	dt *= time_of()
	# (EVERY WORD ON A DUNGEON: Hailstorm, Cauterize, Fervor wearing off: foe_words.gd tick)
	if mgr.main != null and mgr.main.get("_foe") != null and mgr.main._foe.on() and hero != null and is_instance_valid(hero):
		mgr.main._foe.tick(self, real, world.distance_to(hero.world))
	_anim_t += dt
	_flash = maxf(0.0, _flash - real)
	_bar = maxf(0.0, _bar - dt)
	_said_t = maxf(0.0, _said_t - dt)
	_not_yet = maxf(0.0, _not_yet - dt)
	_not_yet_t = maxf(0.0, _not_yet_t - dt)
	if _glance_t >= 0.0:
		_glance_t += dt
	if _raised_t >= 0.0:
		_raised_t += dt
	struck_t += dt
	# (thrown: it goes on its way, whatever else it is doing: game.ts updateMonsters, flyThrown)
	if not thrown.is_empty():
		_fly(real)
	# (BOSS_INTRO: until his gate has fallen and his line is said, the boss stands and looks at the hero)
	if waits:
		var d0: float = hero.world.distance_to(world)
		if state != "sleep" or (hero.alive and d0 <= 32.0 and mgr.sees(world, hero.world)):
			_turn_to(hero.world - world, d0)
		_set_list("idle")
		_place()
		_show()
		queue_redraw()
		return
	# (awake, what the hero's words have done to it runs down; frozen, stunned or staggered, it does nothing: _afflicted)
	if state != "sleep" and state != "rise" and _afflicted(real):
		_place()
		_show()
		queue_redraw()
		return
	# (the Headsman, awake: his own prowl and acts)
	if h2 != null and state != "sleep" and state != "rise":
		h2.step(self, dt, hero)
		_place()
		_show()
		queue_redraw()
		return
	# (FRENZIED, on it: the more it is hurt, the sooner it attacks again: rage)
	_cd -= dt * rage()
	for i in _move_cd.size():
		_move_cd[i] = maxf(0.0, _move_cd[i] - dt * rage())
	var to: Vector2 = hero.world - world
	var dist := to.length()
	var sees: bool = hero.alive and dist <= 15.0 and mgr.sees(world, hero.world)
	# (WORDMELDING: Scald behind's steam hides him standing in it: nothing sees him to attack, game.ts `los`; a sleeper wakes as ever)
	var los: bool = sees and not mgr.hero_hidden()
	var reach := _reach()
	var moved := false
	# (A MONSTER DRAWN BY A DECOY: within one's reach, it goes after it in place of the hero: game.ts drawnToDecoy)
	if (state == "chase" or _decoy_swing) and not mgr.decoys.is_empty() and _drawn_to_decoy(dt, reach):
		_place()
		_show()
		queue_redraw()
		return
	if _decoy_swing and mgr.decoys.is_empty():
		_decoy_swing = false
	match state:
		"rise":
			_t -= dt
			# (ARRIVALS: its rift heard opening as it begins, and closing as it is out)
			if not _arrive.is_empty():
				_arrive["age"] = float(_arrive["age"]) + dt
				if not _arrive["opened"] and float(_arrive["age"]) >= 0.0:
					_arrive["opened"] = true
					mgr.sfx.play("rift_open", linear_to_db(0.6))
			if _t <= 0.0:
				state = "chase"
				_cd = 0.8
				if not _arrive.is_empty():
					_arrive = {}
					mgr.sfx.play("rift_close", linear_to_db(0.5))
		"sleep":
			if sees and dist <= AGGRO:
				mgr.wake(self)
		"chase":
			if not hero.alive:
				pass
			elif not _moves.is_empty() and _cd <= 0.0 and _pick(dist, los) >= 0:
				_start(_pick(dist, los), hero, dist)
			elif bare and _for_spear(dt, dist):
				moved = state == "chase"
			elif _moves.is_empty() and _cd <= 0.0 and los and ((def["ranged"] and dist <= float(def["range"])) or (not def["ranged"] and dist <= reach + HERO_R)):
				_turn_to(to, dist)
				state = "windup"
				_t = float(def["windup"])
				_move = -1
				_set_list("attack", true)
			elif def["ranged"]:
				if los:
					_turn_to(to, dist)
				if not (los and dist <= float(def["keepMax"])):
					moved = _go(dt, to, dist, los)
			elif dist > reach * 0.8 + HERO_R:
				moved = _go(dt, to, dist, los)
			else:
				_turn_to(to, dist)
		"windup":
			var doing: String = _moves[_move]["id"] if _move >= 0 else ""
			if doing != "pierce" and not doing in ["charge", "lockdown", "rampage", "frenzy", "throw", "censer", "bash"]:
				_turn_to(to, dist)
			# (chilled, it winds up slower, by two fifths of the chill: game.ts updateMonsters)
			_t -= dt * (0.6 + 0.4 * slow())
			# (the line a charge will run along fills as his wind-up runs out; the marksman's line of aim runs out as he draws)
			if doing == "charge":
				for p in mgr.perils.list:
					if p["kind"] == "lane" and p.get("src") == self:
						p["t"] = maxf(0.0, float(p["dur"]) - _t)
			elif doing == "pierce":
				_hold_aim(hero)
			if doing == "rampage" or doing == "frenzy":
				_carried(hero)
			if _t <= 0.0:
				_land(hero, dist, reach)
		"charge":
			_run_charge(dt, hero)
		"pickup":
			# (it stoops for its spear: in its hand SPEAR.grab into the stoop; its shield raised again a moment after)
			_t -= dt
			if bare and MM.SPEAR["stoop"] - _t >= MM.SPEAR["grab"]:
				bare = false
				_spear = {}
			if _t <= 0.0:
				state = "chase"
				_raised_t = 0.0
		"recover":
			_t -= dt
			var rid: String = _moves[_move]["id"] if _move >= 0 and _move < _moves.size() else ""
			if rid == "frenzy" and not _carry.is_empty():
				_carried(hero)
			# (the green troll's bull rush carries him on through his stop, less and less)
			if _rush_stop >= 0.0 and rid == "charge":
				var want := MM.rush_stop_travel(_moves[_move]["recover"] - maxf(0.0, _t))
				if want > _rush_stop:
					var on := face * (want - _rush_stop)
					var rr0 := minf(r, 0.42)
					if mgr.clear(world.x + on.x, world.y, rr0):
						world.x += on.x
					if mgr.clear(world.x, world.y + on.y, rr0):
						world.y += on.y
				_rush_stop = want
			if _t <= 0.0:
				_rush_stop = -1.0
				state = "chase"
	if state == "sleep" or state == "chase":
		if _glance_t >= 0.0 and _glance_t < MM.WALL["glance"] and art.has("glance"):
			_set_list("glance")
		elif bare and art.has("walkBare"):
			_set_list("walkBare" if moved else "standBare")
		else:
			_set_list("walk" if moved else "idle")
	_place()
	_show()
	queue_redraw()


# --- the moves ---

## pickMove: the biggest of its moves that is ready and in reach; -1 for none (it comes on).
func _pick(dist: float, sees: bool) -> int:
	if _move_cd.size() != _moves.size():
		_move_cd = []
		for mv in _moves:
			_move_cd.append(mv["first"] * randf_range(0.5, 1.5))
	var reach := float(def["range"]) if def["ranged"] else _reach() + HERO_R
	for i in range(_moves.size() - 1, -1, -1):
		var mv: Dictionary = _moves[i]
		if _move_cd[i] > 0.0:
			continue
		# (the Boneward's thrust and its throw want its spear in hand; its shield, the spear gone)
		if kind == "boneward" and (mv["id"] == "bash") != bare:
			continue
		if dist < mv["near"] or dist > (mv["far"] if mv["far"] > 0.0 else reach):
			continue
		if mv["id"] == "summon":
			if mgr.called(self) >= MM.SUMMON["most"]:
				continue
		elif not sees:
			continue
		# (the champion's cry, only if one of his minions would hear it: near him, carrying his words, and not rallied but now:
		# game.ts pickMove, hearsCry. None does on floor 1, where no monster has words)
		if mv["id"] == "rally" and not mgr.hears_cry(self):
			continue
		if mv["id"] == "charge" and _lane(dist).is_empty():
			continue
		return i
	return -1


## startMove: it winds up, and what it is about to do is marked on the floor.
func _start(i: int, hero, dist: float) -> void:
	var mv: Dictionary = _moves[i]
	_move = i
	state = "windup"
	_t = mv["windup"]
	_turn_to(hero.world - world, dist)
	_set_list(MM.picture_of(art.name, mv["id"]), true)
	mgr.used[mv["id"]] = mgr.used.get(mv["id"], 0) + 1
	# (THE BOSSES CALL OUT THEIR BIG MOVES: the Warden's, the line over him in his own voice: game.ts startMove, bossCall)
	call_out(str(mv["id"]), i == 0)
	match mv["id"]:
		"slam":
			var at := minf(dist, float(def["range"]))
			mgr.perils.warn(world.x + face.x * at, world.y + face.y * at, float(def["aoe"]), mv["windup"], _roll() * mv["dmg"], self)
		"charge":
			# (the green troll's bull rush runs RUSH.past beyond the hero, and its lane is drawn on to where his stop takes him)
			var lane := _lane(dist)
			var P := _charge_of()
			_charge = {"a": lane["a"], "b": lane["b"], "hit": false, "run": minf((lane["b"] - lane["a"]).length(), dist + P["run"])}
			mgr.perils.lane(self, lane["a"], lane["b"], P["half"], mv["windup"])
			mgr.sfx.play("boss_roar", -8.0)
		"rampage":
			# (its two swings in its wind-up; its ring marked as the club goes up over his head; the slam as it lands: _carried)
			_carry = {"at": world, "f": face, "went": 0.0, "n": 0, "marked": false, "ring": Vector2.ZERO}
		"frenzy":
			# (its first three stabs in its wind-up, the fourth as it lands)
			_carry = {"at": world, "f": face, "went": 0.0, "n": 0}
		"summon":
			mgr.sfx.play("boss_roar")
		"lockdown":
			mgr.perils.bars(self, world.x, world.y, _roll() * mv["dmg"], mv["windup"])
			mgr.sfx.play("boss_roar", -6.0)
		"pierce":
			_aim = mgr.perils.aim(self, world, _aim_end(face), mv["windup"])
		"sigil":
			# (FLOOR 2: the cultist's fire sigil, its ring under where the hero stands as it begins its cast: game/action_f2.ts)
			mgr.perils.sigil(hero.world.x, hero.world.y, _roll() * mv["dmg"], mv["windup"], self)
			mgr.sfx.play("fire", -8.0)


## landMove: the end of its wind-up.
func _land(hero, dist: float, reach: float) -> void:
	# (SWIFT: its waits between blows shorter, 30% for the whole word, 15% for a minion's half: game.ts monsterAttack, landMove)
	var swift := 1.0 - 0.3 * word_share("swift")
	if _move < 0:
		# (its one blow, or its one shot)
		state = "recover"
		_t = RECOVER
		_cd = float(def["cooldown"]) * swift * randf_range(0.9, 1.2)
		if def["ranged"]:
			# (TWIN, on it: two shots fanned apart, the second its share: game.ts monsterAttack)
			var aim: Vector2 = (hero.world - world).normalized()
			if twin() > 0.0:
				mgr.shoot(self, aim.rotated(-0.12), float(def["projSpeed"]), float(def["range"]) + 3.0, _roll())
				mgr.shoot(self, aim.rotated(0.12), float(def["projSpeed"]), float(def["range"]) + 3.0, _roll() * twin())
			else:
				mgr.shoot(self, aim, float(def["projSpeed"]), float(def["range"]) + 3.0, _roll())
			mgr.sfx.play("shot", -6.0)
		else:
			# (VAST, on it: its blow reaches further; TWIN, a second blow a moment after, its share: game.ts monsterAttack)
			var far: float = float(def["range"]) * vast() + (r - 0.32)
			_blow(hero, dist, far, 1.0)
			_twice(hero, func() -> bool: return hero.world.distance_to(world) <= far + 0.45 + HERO_R, 1.0)
		return
	var mv: Dictionary = _moves[_move]
	state = "recover"
	_t = mv["recover"]
	_cd = mv["after"] * swift * randf_range(0.9, 1.2)
	if mv["cooldown"] > 0.0:
		_move_cd[_move] = mv["cooldown"] * swift
	match mv["id"]:
		"swing":
			_blow(hero, dist, reach, mv["dmg"])
			_twice(hero, func() -> bool: return hero.world.distance_to(world) <= _reach() + 0.45 + HERO_R, mv["dmg"])
		"bash":
			# (the Boneward's shield, while its spear is gone, shoves the hero back too)
			if _blow(hero, dist, reach, mv["dmg"]):
				hero.knock((hero.world - world).normalized() if dist > 0.01 else face, MM.SPEAR["knock"])
			_twice(hero, func() -> bool: return hero.world.distance_to(world) <= _reach() + 0.45 + HERO_R, mv["dmg"])
		"throw":
			# (its spear, from its hand, at where the hero stands; its hand is empty till it picks the spear up again)
			var hand := world + face * MM.SPEAR["hand"]
			if not mgr.map.open_at(floori(hand.x), floori(hand.y)):
				hand = world
			var th: Vector2 = hero.world - hand
			var tl := maxf(th.length(), 0.001)
			mgr.throw_spear(self, hand, th / tl, tl, _roll() * mv["dmg"])
			bare = true
			mgr.sfx.play("swing", -4.0)
		"censer":
			# (its burning smoke settles before him, as far as SMOKE.at, or where the hero stands if nearer)
			var far := maxf(MM.SMOKE["near"], minf(MM.SMOKE["at"], dist))
			var sm := world + face * far
			if not mgr.map.open_at(floori(sm.x), floori(sm.y)):
				sm = world + face * MM.SMOKE["near"]
			var ticks := maxi(1, roundi(MM.SMOKE["dur"] / MM.SMOKE["tick"]))
			mgr.perils.smoke(sm.x, sm.y, _roll() * mv["dmg"] / ticks, self)
			mgr.sfx.play("fire", -3.0)
		"rampage":
			# (the slam: the ring where it was marked, or before him if it never was, and out it goes)
			var rg: Vector2 = _carry["ring"] if _carry.get("marked", false) else world + face * MM.RING["ahead"]
			if hero.alive and hero.world.distance_to(rg) <= MM.RING["radius"]:
				harm_hero(hero, _roll() * mv["dmg"] * MM.RAMPAGE["slam"])
			mgr.perils.drop(self, ["warn"])
			mgr.perils.ring(rg.x, rg.y, MM.RING["radius"])
			hero.kick(3.0)
			mgr.sfx.play("slam", -1.0)
			if not _carry.is_empty():
				face = _carry["f"]
			# (a Twin troll follows it with a second, quicker one, where the hero stands)
			if twin() > 0.0:
				mgr.perils.warn(hero.world.x, hero.world.y, MM.RING["radius"] * 0.6, 0.6, _roll() * mv["dmg"] * MM.RAMPAGE["slam"] * twin(), self)
		"frenzy":
			# (its fourth stab, then winded where it has carried him)
			if not _carry.is_empty():
				_frenzy_stab(hero, _carry["at"] + _carry["f"] * MM.FRENZY["travel"], mv)
				face = _carry["f"]
		"shoot":
			# (a leader who shoots, as those he leads shoot: the marksman's and the archer's arrow, the high priest's fire bolt)
			var arrow := kind == "marksman" or kind == "archer"
			var aim: Vector2 = (hero.world - world).normalized()
			# (a Twin one, two at once, fanned apart)
			if twin() > 0.0:
				mgr.shoot(self, aim.rotated(-0.12), float(def["projSpeed"]), float(def["range"]) + 3.0, _roll() * mv["dmg"], "arrow" if arrow else "bolt")
				mgr.shoot(self, aim.rotated(0.12), float(def["projSpeed"]), float(def["range"]) + 3.0, _roll() * mv["dmg"] * twin(), "arrow" if arrow else "bolt")
			else:
				mgr.shoot(self, aim, float(def["projSpeed"]), float(def["range"]) + 3.0, _roll() * mv["dmg"], "arrow" if arrow else "bolt")
			mgr.sfx.play("shot" if arrow else "fire", -6.0)
		"rain":
			mgr.perils.rain(hero.world.x, hero.world.y, _roll() * mv["dmg"], world, face, self)
			mgr.sfx.play("shot", -4.0)
			# (a Twin archer's second ring where he stands a moment after)
			if twin() > 0.0:
				var share: float = mv["dmg"]
				mgr.after(0.35, func() -> void:
					if not dead:
						mgr.perils.rain(hero.world.x, hero.world.y, _roll() * share * twin(), world, face, self))
		"rally":
			# (the skeleton champion cries out: his minions near him have his words whole for a while: game.ts rally)
			mgr.rally(self)
		"pierce":
			var way := face
			if not _aim.is_empty():
				way = (_aim["b"] - _aim["a"]).normalized()
			mgr.perils.drop(self, ["aim"])
			_aim = {}
			mgr.shoot(self, way, MM.AIM["speed"], MM.AIM["range"], _roll() * mv["dmg"], "great", MM.AIM["r"], true)
			mgr.sfx.play("shot")
			hero.shake()
		"bolts":
			var base := atan2(hero.world.y - world.y, hero.world.x - world.x)
			var n: int = MM.BOLTS["n"]
			for k in range(-(n / 2), n / 2 + 1):
				var a: float = base + k * MM.BOLTS["apart"]
				mgr.shoot(self, Vector2(cos(a), sin(a)), float(def["projSpeed"]), MM.BOLTS["range"], _roll() * mv["dmg"], "bolt")
			mgr.sfx.play("fire", -4.0)
		"slam":
			# (the red circle does the harm: perils.gd; a Twin monster follows it with a second, quicker one)
			if twin() > 0.0:
				mgr.perils.warn(hero.world.x, hero.world.y, float(def["aoe"]) * 0.8, 0.6, _roll() * mv["dmg"] * twin(), self)
		"lockdown":
			pass  # (its bars crash at the peril's own clock: perils.gd)
		"sigil":
			pass  # (its sigil erupts at the peril's own clock: perils.gd)
		"summon":
			mgr.summon(self)
		"charge":
			if not _charge.is_empty():
				state = "charge"
				_t = (_charge["b"] - _charge["a"]).length() / _charge_of()["speed"] + 0.5
				_set_list("charge", true)
				mgr.sfx.play("slam", -6.0)


## TWIN, on it (game.ts wordShare 'twin'): how hard its second blow is, a share of its first; 0 for one without the word.
func twin() -> float:
	return word_share("twin")


## TWIN, on it: its blow comes again 0.28 s later, `share` of a roll and its Twin's share of that, if it lives and the hero is
## still where it reaches (`reaches`) (game.ts monsterAttack, landMove, rampageSwing).
func _twice(hero, reaches: Callable, share: float) -> void:
	if twin() <= 0.0:
		return
	mgr.after(0.28, func() -> void:
		if not dead and hero.alive and reaches.call():
			harm_hero(hero, _roll() * share * twin()))


func _blow(hero, dist: float, reach: float, share: float) -> bool:
	mgr.sfx.play(ATK.get(kind, "atkBones"), -4.0)
	mgr.sfx.play("swing", -10.0)
	var struck: bool = hero.alive and dist <= reach + 0.45 + HERO_R
	if struck:
		harm_hero(hero, _roll() * share)
	# (FLOOR 2: the Shade's rake, cold: a patch of rime before it as it lands: game/action_f2.ts)
	if kind == "shade":
		mgr.perils.rime(world.x + face.x * MM.RIME["ahead"], world.y + face.y * MM.RIME["ahead"], self)
	return struck


## How far its blow reaches beyond its body (game.ts reachOf): a Boneward whose spear is gone, its shield's.
func _reach() -> float:
	return (MM.SPEAR["bash"] if bare else float(def["range"])) + (r - 0.32)


## A charge's numbers by whose it is (action_f3.ts chargeOf): the red troll's, or the green troll's bull rush. `past`: how
## far beyond the hero his lane goes; `run`: how far beyond him his run; `stop`: how far his stop carries him on after it.
func _charge_of() -> Dictionary:
	if kind == "brute" and not champion:
		return {"speed": MM.RUSH["speed"], "half": MM.RUSH["half"], "past": MM.RUSH["past"] + MM.RUSH["stop"], "run": MM.RUSH["past"], "stop": MM.RUSH["stop"], "knock": MM.RUSH["knock"]}
	return {"speed": MM.CHARGE["speed"], "half": MM.CHARGE["half"], "past": MM.CHARGE["past"], "run": MM.CHARGE["past"], "stop": 0.0, "knock": MM.CHARGE["knock"]}


## THE GREEN TROLL THROUGH HIS RAMPAGE, THE DAGGER CULTIST THROUGH HIS FRENZY: the blows of it that come before its end, and he
## carried along the way he faced as it began, as his pictures have him go (game.ts startMove's blows, carryAlong, carryFrenzy).
func _carried(hero) -> void:
	if _carry.is_empty() or _move < 0:
		return
	var mv: Dictionary = _moves[_move]
	var age := MM.move_age(state, _t, mv["windup"], mv["recover"])
	if mv["id"] == "rampage":
		var hits: Array = MM.RAMPAGE["hits"]
		while _carry["n"] < hits.size() and age >= hits[_carry["n"]]:
			_carry["n"] += 1
			_rampage_swing(hero, mv)
		if not _carry["marked"] and age >= MM.RAMPAGE["raise"]:
			# (the club is up over his head: the ring marked where it will come down, before where he will land)
			_carry["marked"] = true
			var go := _carry_reach(hero, MM.RAMPAGE["travel"])
			var rg: Vector2 = _carry["at"] + _carry["f"] * (go + MM.RING["ahead"])
			_carry["ring"] = rg
			mgr.perils.mark(rg.x, rg.y, MM.RING["radius"], maxf(0.05, _t), self)
		_carry_along(hero, MM.rampage_travel(age))
	else:
		if state == "windup":
			var stabs: Array = MM.FRENZY["hits"]
			while _carry["n"] < stabs.size() and age >= stabs[_carry["n"]]:
				var at: float = stabs[_carry["n"]]
				_carry["n"] += 1
				_frenzy_stab(hero, _carry["at"] + _carry["f"] * MM.frenzy_travel(at), mv)
		_carry_along(hero, MM.frenzy_at(age))


## How far a move of its own may carry it toward `want` tiles from where it began: not on through the hero (as far as to him).
func _carry_to(hero, want: float) -> float:
	var f: Vector2 = _carry["f"]
	var rel: Vector2 = hero.world - _carry["at"]
	var along := rel.dot(f)
	var aside := absf(rel.x * f.y - rel.y * f.x)
	var body := r + HERO_R
	if along > 0.0 and aside < body:
		return minf(want, maxf(_carry["went"], along - sqrt(body * body - aside * aside)))
	return want


## Carried `want` tiles along the way it faced as its move began: not on through the hero, nor into a wall (carryAlong).
func _carry_along(hero, want: float) -> void:
	var go := _carry_to(hero, want)
	if absf(go - _carry["went"]) < 1e-6:
		return
	var p: Vector2 = _carry["at"] + _carry["f"] * go
	if not mgr.clear(p.x, p.y, r):
		return
	world = p
	_carry["went"] = go


## How far it could be carried on to `want`, as things stand: up to the hero, or a wall (carryReach).
func _carry_reach(hero, want: float) -> float:
	var go := _carry_to(hero, want)
	var ok: float = _carry["went"]
	var a: float = _carry["went"]
	while a <= go + 1e-6:
		var p: Vector2 = _carry["at"] + _carry["f"] * a
		if not mgr.clear(p.x, p.y, r):
			break
		ok = a
		if a >= go:
			break
		a = minf(go, a + 0.1)
	return ok


## A swing of the rampage: the hero within its reach, in the half of the floor before him, is struck (rampageSwing).
func _rampage_swing(hero, mv: Dictionary) -> void:
	var d: Vector2 = hero.world - world
	if hero.alive and d.length() <= MM.RAMPAGE["reach"] + HERO_R and d.dot(_carry["f"]) >= -HERO_R:
		harm_hero(hero, _roll() * mv["dmg"] * MM.RAMPAGE["swing"])
	var f: Vector2 = _carry["f"]
	_twice(hero, func() -> bool: return (hero.world - world).length() <= MM.RAMPAGE["reach"] + HERO_R and (hero.world - world).dot(f) >= -HERO_R, mv["dmg"] * MM.RAMPAGE["swing"])
	mgr.sfx.play("atkTroll", -4.0)
	mgr.sfx.play("swing", -4.0)
	mgr.used["rampage_swing"] = mgr.used.get("rampage_swing", 0) + 1


## A stab of the frenzy from `at`: the hero within its reach and its arc before him is struck (frenzyStab).
func _frenzy_stab(hero, at: Vector2, mv: Dictionary) -> void:
	var d: Vector2 = hero.world - at
	var l := d.length()
	var ahead: bool = l < 1e-6 or d.dot(_carry["f"]) / l >= cos(deg_to_rad(MM.FRENZY["arc"] / 2.0))
	if hero.alive and l <= MM.FRENZY["reach"] + HERO_R and ahead:
		harm_hero(hero, _roll() * mv["dmg"])
	mgr.sfx.play("swing", -9.0)
	mgr.used["frenzy_stab"] = mgr.used.get("frenzy_stab", 0) + 1


## THE BONEWARD WHOSE SPEAR IS GONE goes for it, unless the hero is near and the spear is not; within reach of it, it stoops
## for it, facing it (game.ts spearWay, beginStoop). Whether it did either.
func _for_spear(dt: float, dist: float) -> bool:
	if _spear.is_empty():
		return false
	var at: Vector2 = _spear["at"]
	var d := at.distance_to(world)
	if not (dist > MM.SPEAR["near"] or d <= MM.SPEAR["close"]):
		return false
	if d <= MM.SPEAR["pick"]:
		if d > 0.01:
			face = (at - world) / d
		state = "pickup"
		_t = MM.SPEAR["stoop"]
		_set_list("pickUp", true)
		mgr.used["pickup"] = mgr.used.get("pickup", 0) + 1
		return true
	var way: Vector2 = (at - world) / d if d < 2.5 and mgr.sees(world, at) else mgr.flow_dir(world, _spear["flow"])
	if way == Vector2.ZERO:
		return false
	face = way
	var step := way * speed * slow() * nettle_k * dt
	var rr := minf(r, 0.42)
	if mgr.clear(world.x + step.x, world.y, rr):
		world.x += step.x
	if mgr.clear(world.x, world.y + step.y, rr):
		world.y += step.y
	return true


## Its spear has come down (monsters.gd _lay_spear): where it lies, and the way to it from anywhere near.
func spear_lies(at: Vector2, way: Vector2, flow: PackedInt32Array) -> void:
	_spear = {"at": at, "way": way, "flow": flow}


## IS THE BONEWARD'S SHIELD WALL UP (game.ts wallUp)? While it stands or walks with its spear in hand, and through its
## thrust's wind-up to WALL.thrust_open; down from the start of its throw, all the while its spear is gone, and until
## WALL.raised_again after it has picked it up.
func wall_up() -> bool:
	if kind != "boneward" or bare or state == "pickup" or dead:
		return false
	if _raised_t >= 0.0 and _raised_t < MM.WALL["raised_again"]:
		return false
	if _move >= 0 and (state == "windup" or state == "recover"):
		var doing: String = _moves[_move]["id"]
		if doing == "throw":
			return false
		if doing == "swing" and (state == "recover" or _moves[_move]["windup"] - _t >= MM.WALL["thrust_open"]):
			return false
	return true


## THE RED TROLL'S CHARGE: his line, from him through where the hero stands and 1.5 on, if he has a clear run there (no wall
## between, and long enough to get past the hero); empty if not (game.ts chargeLane).
func _lane(dist: float) -> Dictionary:
	if dist < 0.01:
		return {}
	var hero = mgr.hero
	var f: Vector2 = (hero.world - world) / dist
	var rr := minf(r, 0.42)
	var len := 0.0
	var a := 0.2
	while a <= dist + _charge_of()["past"] + 1e-6:
		var p: Vector2 = world + f * a
		if not mgr.clear(p.x, p.y, rr):
			break
		len = a
		a += 0.2
	if len < dist + 0.4:
		return {}
	return {"a": world, "b": world + f * len}


## He runs his line: the hero met on it is struck once and knocked aside, out of the line; at its end, or at anything that
## stops him, he pulls up, skidding, and stands a moment (game.ts runCharge, endCharge).
func _run_charge(dt: float, hero) -> void:
	var a: Vector2 = _charge["a"]
	var b: Vector2 = _charge["b"]
	var len := maxf((b - a).length(), 0.01)
	var f := (b - a) / len
	var P := _charge_of()
	# (chilled, he runs slower by the chill's share)
	var step: float = P["speed"] * slow() * nettle_k * dt
	var was := world
	var rr := minf(r, 0.42)
	if mgr.clear(world.x + f.x * step, world.y, rr):
		world.x += f.x * step
	if mgr.clear(world.x, world.y + f.y * step, rr):
		world.y += f.y * step
	face = f
	_t -= dt
	var along := (world - a).dot(f)
	for p in mgr.perils.list:
		if p["kind"] == "lane" and p.get("src") == self:
			p["gone"] = clampf(along / len, 0.0, 1.0)
	if not _charge["hit"] and hero.alive and hero.world.distance_to(world) <= r + HERO_R + 0.15:
		_charge["hit"] = true
		harm_hero(hero, _roll() * _moves[_move]["dmg"])
		var o := a + f * along
		var side := 1.0 if (hero.world - o).dot(Vector2(-f.y, f.x)) >= 0.0 else -1.0
		hero.knock(Vector2(-f.y, f.x) * side, P["knock"])
		hero.shake()
		mgr.sfx.play("slam")
	# (the green troll's run ends at its own end, as its round comes to a frame his stop can take him from; then his stop
	# carries him on: action_f3.ts rushMayEnd, game.ts endCharge)
	var run: float = _charge.get("run", len)
	var may_end: bool = P["stop"] <= 0.0 or (int(_anim_t * 30.0 + 1e-6) % 6) in MM.RUSH["end_on"]
	if (along >= run - 0.05 and may_end) or world.distance_to(was) < step * 0.3 or _t <= 0.0:
		_end_charge()


## The charge is over: he pulls up, skidding, and stands a moment; the green troll's stop carries him on (game.ts endCharge).
## So too one frozen as he runs it: he is stopped in it (chillMonster).
func _end_charge() -> void:
	state = "recover"
	_t = _moves[_move]["recover"] if _move >= 0 and _move < _moves.size() else RECOVER
	if _charge_of()["stop"] > 0.0:
		_rush_stop = 0.0
	_charge = {}
	mgr.perils.drop(self, ["lane"])
	_set_list("chargeStop", true)


## THE MARKSMAN DRAWS: his line of aim follows the hero until 0.4 s before he looses, then holds still (game.ts holdAim).
func _hold_aim(hero) -> void:
	if _aim.is_empty():
		return
	# (his line has no clock of its own: his draw moves it on, so a chill that slows the draw slows the line)
	_aim["t"] = maxf(0.0, float(_aim["dur"]) - _t)
	if _t <= MM.AIM["lock"]:
		return
	var to: Vector2 = hero.world - world
	if to.length() < 0.01:
		return
	face = to.normalized()
	_aim["a"] = world
	_aim["b"] = _aim_end(face)


## Where a line of aim the way `f` ends: 14 tiles on, or at the first wall.
func _aim_end(f: Vector2) -> Vector2:
	var len := 0.0
	var a := 0.25
	while a <= MM.AIM["range"] + 1e-6:
		var p := world + f * a
		var t: int = mgr.map.tile(floori(p.x), floori(p.y))
		if t != 1 and t != 3:
			break
		len = a
		a += 0.25
	return world + f * len


# --- moving ---

## A step toward him: straight when it sees him close, else down the flow field; a bat weaves as it flies.
func _go(dt: float, to: Vector2, dist: float, sees: bool) -> bool:
	var way: Vector2 = to / dist if sees and dist < 2.5 else mgr.flow_dir(world)
	if way == Vector2.ZERO:
		return false
	if kind == "bat":
		_weave += dt * 7.0
		way = (way + Vector2(-way.y, way.x) * sin(_weave) * 0.6).normalized()
	face = way
	# (chilled, it walks slower by the chill's share: game.ts updateMonsters, `slow`; FRENZIED, faster the more it is hurt)
	# (THE TINKERER's tree: Tar, what walks in her tar is slowed to a crawl: heroes/tinkerer.gd tar_k)
	var tar := 1.0
	if mgr != null and mgr.hero != null and mgr.hero.kit != null and mgr.hero.kit.has_method("tar_k"):
		tar = mgr.hero.kit.tar_k(self)
	var step := way * speed * slow() * rage() * nettle_k * tar * dt
	# (game.ts: a monster walks with a body no bigger than 0.42 round, so that a big one gets through a doorway)
	var rr := minf(r, 0.42)
	var fly := kind == "bat"
	if mgr.clear(world.x + step.x, world.y, rr, fly):
		world.x += step.x
	if mgr.clear(world.x, world.y + step.y, rr, fly):
		world.y += step.y
	return true


func _turn_to(to: Vector2, dist: float) -> void:
	if dist > 0.01:
		face = to / dist


func _roll() -> float:
	# (THE HIGH CITY, FLOOR 19: within the reach of a king's knight's standing banner, a third harder: act3/kknight.gd rally_of)
	return randf_range(dmg_min, dmg_max) * KK.rally_of(self)


# --- its own words ---

## (defs.ts PACKS.minion: the share a minion has of each of its leader's words)
const PACK_MINION := 0.5


## What its blows are of (game.ts monsterElement): the first of Flame, Frost and Lightning among its words, else its kind's own.
func element() -> String:
	for w in words:
		if w == "fire" or w == "frost" or w == "lightning":
			return w
	return str(def.get("element", "phys"))


## MONSTER PACKS (game.ts halfOf): what a minion's blow carries of its leader's words at half strength, and its kind's own
## element (the rest of a blow that one of those makes Flame, Frost or Lightning is of it). None for any other, nor for a
## minion the champion's cry has rallied: his words are whole in it for a while.
func half_of() -> Dictionary:
	if rally_t > 0.0 or half.is_empty():
		return {}
	return {"words": half, "base": str(def.get("element", "phys"))}


## How much of word `w`'s power it has (defs.ts wordShare): none, if it has not the word; half, a minion's of its leader's
## (whole while it is rallied); else whole.
func word_share(w: String) -> float:
	if not words.has(w):
		return 0.0
	# (EVERY WORD ON A DUNGEON: a ranked word laid with its word gives it half as strong again: defs.ts wordShare, FOE_RANK)
	var rank := 1.0
	var FW: Dictionary = Words.data().get("foe", {})
	if bool(FW.get("on", false)) and FW["rankBy"].has(w) and words.has(FW["rankBy"][w]):
		rank = float(FW["rank"])
	return rank * (PACK_MINION if half.has(w) and rally_t <= 0.0 else 1.0)


## FRENZIED, on it (game.ts updateMonsters `rage`): the more it is hurt, the faster it moves and the sooner it attacks again, up
## to half again as fast near death (a minion's, of its leader's Frenzied, at half); 1 for one without the word.
func rage() -> float:
	# (THE WARLOCK's tree: Withering, cursed it moves and strikes at half speed: game.ts updateMonsters `wither`)
	var wither := 1.0
	if curse_t > 0.0 and mgr != null and mgr.hero != null and mgr.hero.cls == "warlock" and mgr.hero.has("withering"):
		wither = float(preload("res://scripts/talents.gd").D["warlockTalents"]["withering"]["pace"])
	# (EVERY WORD ON A DUNGEON: and Fervor, fed by the deaths round it: foe_words.gd rage)
	# (THE WARLOCK'S DEMON MADE TERRIBLE: Dread, slower near the demon: heroes/warlock.gd)
	if mgr != null and mgr.hero != null and mgr.hero.kit != null and mgr.hero.kit.has_method("dread_pace"):
		wither *= mgr.hero.kit.dread_pace(self)
	var foe = mgr.main.get("_foe") if mgr != null and mgr.main != null else null
	return wither * frenzy() * (foe.rage(self) if foe != null else 1.0)


## FRENZIED, on it, alone (game.ts updateMonsters `rage`: 1, or more the more it is hurt), without Withering's slowing: what hurries
## a boss's acts' own waits (game/bosses.ts step: `m.moveCd[k] -= dt * hurry`, hurry its rage).
func frenzy() -> float:
	var share := word_share("frenzied")
	if share <= 0.0:
		return 1.0
	return 1.0 + float(Words.data()["frenzy"]["monster"]) * share * (1.0 - maxf(0.0, life) / max_life)


## VAST, on it (game.ts addWarn, monsterAttack): how many times as wide its warned blows and as far its own blow's reach are.
func vast() -> float:
	return 1.0 + float(Words.data()["vast"]["monster"]) * word_share("vast")


## What a blow of its carries to him, as a shot or a mark of its keeps it from when it was made (game.ts: a projectile's, a
## zone's, a peril's `element`, `words`, `half`): {el, words, half}.
func blow() -> Dictionary:
	return {"el": element(), "words": words, "half": half_of()}


## A blow of its own lands on the hero, `dmg` before what he withstands (game.ts hurtHero(roll, monsterElement(m), m.words, m)).
func harm_hero(hero, dmg: float) -> void:
	hero.hurt_by(dmg, element(), words, half_of(), self)


func wake_up() -> void:
	if state == "sleep":
		state = "chase"
		_cd = randf_range(0.2, 0.9)


## A blow on it that is no move of the hero's (a trap's spikes, a check's own blow): from before a Boneward's shield it glances
## off; else it is harmed. A hit of one of his moves, with its words, is hero.gd hit_monster.
func hurt(dmg: float) -> void:
	if dead or state == "rise":
		return
	if mgr.hero != null and glances(mgr.hero.world):
		glance()
		return
	_take(dmg, "phys", false, false, [], false, false)


## (FLOOR 3: the Boneward behind its shield) Whether a blow from where `from` stands comes from before its shield, and so
## glances off (game.ts hitMonster; action_f3.ts glances).
func glances(from: Vector2) -> bool:
	if not wall_up():
		return false
	var hd: Vector2 = from - world
	var ang := rad_to_deg(acos(clampf(hd.normalized().dot(face), -1.0, 1.0))) if hd.length() > 0.0001 else 0.0
	return absf(ang) <= MM.WALL["arc"] / 2.0


## The blow glances off its shield, and does nothing (game.ts hitMonster).
func glance() -> void:
	_glance_t = 0.0
	if state == "sleep":
		mgr.wake(self)
	mgr.sfx.play("hit", -9.0)
	mgr.used["glance"] = mgr.used.get("glance", 0) + 1
	_tell({"t": "hit", "x": world.x, "y": world.y, "amount": 0, "crit": false, "el": "phys", "onHero": false, "heavy": false})


## HARM DONE TO IT (game.ts damageMonster) by a hit of the hero's, an arc of his lightning, the ground he left, or what burns
## or poisons it. `el`: its element; `crit`: a critical hit; `heavy`: Power's weight in it (a longer flash); `front`: the words
## in front of the move that did it (what the telling shows); `poison`: the poison working; `dot`: harm over time (burning,
## burning or iced ground). Those two do not flash it, nor make it cry out. What is shut in a room is out of reach.
## `skill`: which of his moves did it (0 to 2; -1: none of them, or none that changes which last struck it).
func damage(dmg: float, el := "phys", crit := false, heavy := false, front: Array = [], poison := false, dot := false, skill := -1) -> void:
	if dead or state == "rise" or mgr.shut_in(self):
		return
	_take(dmg, el, crit, heavy, front, poison, dot, skill)


## A word rising from it that says why a blow did nothing ("Invulnerable", "Shielded"), no oftener than every `gap` seconds.
func _told_word(text: String, gap: float) -> void:
	var now := Time.get_ticks_msec() / 1000.0
	if now - _word_told < gap:
		return
	_word_told = now
	_tell({"t": "text", "x": world.x, "y": world.y, "text": text, "color": "#ffd27a"})


## (the damage check, WS_DMG_TRACE: every harm taken, by the move it came of, its element, and whether it burned or poisoned)
static var trace := {}
static var tracing := false
func _take(dmg: float, el: String, crit: bool, heavy: bool, front: Array, poison: bool, dot: bool, skill := -1) -> void:
	var key0 := "move %d %s%s" % [skill, el, " (over time)" if dot or poison else ""]
	var dmg0 := dmg
	# (nor is a boss who waits: game.ts damageMonster, "Not yet")
	if waits:
		if _not_yet_t <= 0.0:
			_not_yet_t = 0.7
			_not_yet = 0.9
		queue_redraw()
		return
	# (nor one whose own rules say nothing reaches it now: the Fleshmancer gone under the floor, game.ts damage, blinkedAway)
	if h2 != null and h2.has_method("reachable") and not h2.reachable(self):
		return
	# (nor one that cannot be hurt now, and says so: a boss as he changes into his next phase, the King as the Hush climbs off him;
	# nor one with another wrapped round it, which takes the blow instead: the King's Hush, struck off by enough of them. game.ts
	# damageMonster, invulnerable, absorbs)
	if h2 != null and h2.has_method("invulnerable") and h2.invulnerable(self):
		_told_word("Invulnerable", 0.7)
		return
	if h2 != null and h2.has_method("absorbs") and h2.absorbs(self):
		_told_word("Shielded", 0.4)
		return
	# (WORDMELDING, SUNDER: stunned since a Sunder hit, it takes more from everything while the stun lasts; a blow on it while its
	# crack shows is its look's "hit", not what burns or poisons it: melds.gd)
	if sunder > 0.0 and stun_t > 0.0:
		dmg *= 1.0 + sunder
		if not dot and not poison and sunder_t > 0.0:
			_tell({"t": "meld8", "id": "sunder", "what": "hit", "on": id})
	# (THE CITY'S WORDS: HEXING, cursed, it takes more from everything)
	if hex_t > 0.0 and hex_more > 0.0:
		dmg = maxf(1.0, roundf(dmg * (1.0 + hex_more)))
	# (BURNING'S OWN, words.gd BURN_MORE: a burning enemy takes more from every fire hit; not from the burning itself. The Mage's
	# alone, with Hearth: words.gd BURN_HEARTH)
	var bm: float = Words.burn_more(mgr.hero if mgr != null else null)
	if bm > 0.0 and el == "fire" and burn_t > 0.0 and not dot:
		dmg = maxf(1.0, roundf(dmg * (1.0 + bm)))
	# (THE SKILL TREES REMADE: Giant Slayer's cracks in its guard: more from everything)
	if cracks > 0:
		dmg = maxf(1.0, roundf(dmg * (1.0 + 0.03 * cracks)))
	# (one of the cult near a chanter that lives and is awake takes less: its ward, act1.gd warded)
	dmg = Act1.warded(mgr, self, dmg)
	# (WORDMELDING, BLIGHT behind: a poisoned enemy it has touched takes more from everything)
	if blight_t > 0.0 and poison_t > 0.0:
		dmg = maxf(1.0, roundf(dmg * (1.0 + float(Words.data()["melds"]["tune"]["blight"]["more"]))))
	# (THE LAST WORDS: MIRRORING, on it, a share of the harm he does it comes back at him; not what burns or bleeds, nor often)
	if skill >= 0 and not dot and not poison and mirror_t <= 0.0:
		var mk := word_share("mirroring")
		if mk > 0.0 and mgr.hero != null and is_instance_valid(mgr.hero):
			var MI: Dictionary = Words.data()["last"]["mirroring"]
			mirror_t = MI["backEvery"]
			var back := maxf(1.0, roundf(dmg * float(MI["back"]) * mk))
			_tell({"t": "mirrorBack", "x0": world.x, "y0": world.y, "x1": mgr.hero.world.x, "y1": mgr.hero.world.y, "n": back})
			mgr.hero.last.rec("mirror_back")
			mgr.hero.hurt_by(back, "phys", [], {}, null, world)
	# (the trace: the harm as it lands, and how much of it came of what made it more)
	if tracing:
		trace[key0] = float(trace.get(key0, 0.0)) + dmg
		trace["(of it, made more)"] = float(trace.get("(of it, made more)", 0.0)) + dmg - dmg0
		if hex_t > 0.0 and hex_more > 0.0:
			trace["(hit while cursed)"] = float(trace.get("(hit while cursed)", 0.0)) + dmg
		if bm > 0.0 and el == "fire" and burn_t > 0.0 and not dot:
			trace["(fire hit while burning)"] = float(trace.get("(fire hit while burning)", 0.0)) + dmg
	# (GUARDING, on it: its shield takes the harm first)
	if shield > 0.0:
		var soak := minf(shield, dmg)
		shield -= soak
		life -= dmg - soak
		# (EVERY WORD ON A DUNGEON: Rime Ward, a blow of his on its shield chills him: foe_words.gd shield)
		if skill >= 0 and not dot and not poison and mgr.main != null and mgr.main.get("_foe") != null and mgr.main._foe.on():
			mgr.main._foe.shield(self, soak)
	else:
		life -= dmg
	# (WORDMELDING, DEMOLITION in front: an elite or a boss bursts once at half its life: melds.gd)
	if skill >= 0 and (elite or boss) and not demolished and mgr.hero != null and is_instance_valid(mgr.hero):
		mgr.hero.melds.half_life(self, skill)
	if skill >= 0:
		last_skill = skill
	if not poison and not dot:
		_flash = 0.2 if heavy else 0.12
		struck_t = 0.0
	_bar = BAR_FOR
	if state == "sleep":
		mgr.wake(self)
	var told := {"t": "hit", "x": world.x, "y": world.y, "amount": dmg, "crit": crit, "el": el, "onHero": false, "heavy": heavy}
	if not front.is_empty():
		told["words"] = front
	if poison:
		told["poison"] = true
	_tell(told)
	# (ACT 1: one whose rules hold its life up is kept there: the Carrion Queen, who must first be where her death was drawn:
	# game.ts damageMonster, lifeFloor)
	if h2 != null and h2.has_method("life_floor"):
		var least: float = h2.life_floor(self)
		if least > 0.0 and life < least:
			life = least
	if life <= 0.0:
		_die()
	elif poison or dot:
		pass
	elif boss and h2 != null and h2.has_method("hurt_voice"):
		# (a boss with a hurt of his own: the Swamp Colossus's eye struck)
		h2.hurt_voice(self, dmg, crit)
	elif boss and BOSS_VOICE.has(kind):
		# (ITS VOICE AS IT IS HURT, game.ts damageMonster: a boss who roars, on a critical hit or a blow of a twenty-fifth of his
		# life or more, no oftener than every 2.5 s; another, on a big blow only, a critical hit, a quarter of its life or more,
		# or every sixth blow, no oftener than every 0.7 s: sound_families.ts ENEMY_GAPS, HURT_BIG.)
		if crit or dmg >= max_life * 0.04:
			mgr.voice(BOSS_VOICE[kind] + "_hurt", 2.5, -1.0)
	elif not boss and VOICE.has(kind):
		mgr.hurt_tick = (mgr.hurt_tick + 1) % 6
		if crit or dmg >= max_life * 0.25 or mgr.hurt_tick == 0:
			mgr.voice(VOICE[kind] + "_hurt", 0.7, -4.4, 1 if champion else mgr.ENEMY_KEEP["hurt"])


## STILLING (game.ts timeOf): how fast its time runs now: slowed by a Stilling hit, and in a bubble (a boss half as much).
func time_of() -> float:
	var S: Dictionary = Words.data().get("city", {}).get("still", {"boss": 0.5})
	var b: float = float(S["boss"]) if boss else 1.0
	var k := 1.0
	if still_t > 0.0:
		k *= 1.0 - still_k * b
	var hero = mgr.hero if mgr != null else null
	if hero != null and is_instance_valid(hero) and hero.wakes != null and is_instance_valid(hero.wakes) and not hero.wakes.list.is_empty():
		var z = hero.wakes.patch_at("bubble", world)
		if z != null:
			k *= 1.0 - float(z["dmg"]) * b
	return k


## SPLITTING (game.ts splitMonster): two of its kind where it fell, each at half its life, of no words, drawn smaller; awake and
## coming on.
func _split() -> void:
	var S: Dictionary = Words.data().get("city", {}).get("split", {"life": 0.5, "look": 0.75})
	for k in 2:
		var at := world
		for tries in 12:
			var q := world + Vector2(randf_range(-1.0, 1.0), randf_range(-1.0, 1.0))
			if mgr.clear(q.x, q.y, 0.3):
				at = q
				break
		var o = mgr.call_up(kind, at, pack_id, face)
		if o == null:
			continue
		o.max_life = maxf(1.0, roundf(max_life * float(S["life"])))
		o.life = o.max_life
		o.words = []
		o.half = []
		o.carries = []
		o.split = true
		o.r *= float(S["look"])
		o.look = float(S["look"])
	_tell({"t": "split", "x": world.x, "y": world.y, "dx": face.x, "dy": face.y, "to": []})


## What it tells of itself (fx.gd: the game's own telling; the place may have none).
func _tell(e: Dictionary) -> void:
	if mgr != null and mgr.fx != null:
		mgr.fx.event(e)


# --- what the hero's words do to it ---

## How much of its pace a chill leaves it (game.ts updateMonsters `slow`): all of it, or less by the chill's share. Its steps
## and its charge go by it; its wind-ups by two fifths of what it takes (0.6 + 0.4 of it).
func slow() -> float:
	return 1.0 - chill if chill_t > 0.0 else 1.0


## What has been done to it runs down (game.ts updateMonsters, for one awake). True if it does nothing this step: frozen,
## or stunned or staggered (what it was winding up was broken off as that began).
func _afflicted(dt: float) -> bool:
	if shock_t > 0.0:
		shock_t = maxf(0.0, shock_t - dt)
	# (WORDMELDING: game.ts updateMonsters)
	if scald_cd > 0.0:
		scald_cd = maxf(0.0, scald_cd - dt)
	if fumes_cd > 0.0:
		fumes_cd = maxf(0.0, fumes_cd - dt)
	if blight_t > 0.0:
		blight_t = maxf(0.0, blight_t - dt)
	if bite_dps > 0.0 and chill_t <= 0.0 and frozen_t <= 0.0:
		bite_dps = 0.0
	if sunder_t > 0.0:
		sunder_t = maxf(0.0, sunder_t - dt)
	# (THE LAST WORDS: its bleeding runs out; Mirroring's wait; SURGING's shockwave every few seconds while he is near, after a
	# warning: game.ts updateMonsters)
	if bleed_t > 0.0:
		bleed_t = maxf(0.0, bleed_t - dt)
		if bleed_t <= 0.0:
			bleed_move = 0.0
	if mirror_t > 0.0:
		mirror_t = maxf(0.0, mirror_t - dt)
	# (UNIQUE ITEMS: the Burning Verse, a burn of his on a cursed enemy never goes out: it lasts until it dies)
	var lasts := false
	var hu = mgr.hero.get("uniques") if mgr.hero != null and is_instance_valid(mgr.hero) else null
	if hu != null and hu.wears("burningverse"):
		if not verse and curse_t > 0.0 and (burn_t > 0.0 or hell_t > 0.0):
			verse = true
		lasts = verse
	# (THE WARLOCK: his hellfire and the curse run out)
	if hell_t > 0.0 and not lasts:
		hell_t = maxf(0.0, hell_t - dt)
	if curse_t > 0.0:
		curse_t = maxf(0.0, curse_t - dt)
	if frozen_t <= 0.0 and stun_t <= 0.0:
		_surge(dt)
	if burn_t > 0.0 and not lasts:
		burn_t -= dt
	if chill_t > 0.0:
		chill_t -= dt
	if freeze_immune > 0.0:
		freeze_immune -= dt
	if mark_t > 0.0:
		mark_t = maxf(0.0, mark_t - dt)
	if stagger_cd > 0.0:
		stagger_cd -= dt
	if poison_t > 0.0:
		poison_t -= dt
		if poison_t <= 0.0:
			poison_dps = 0.0
			poison_n = 0
	if frozen_t > 0.0:
		frozen_t -= dt
		if frozen_t <= 0.0:
			# (it thaws: the ice breaks off it)
			_tell({"t": "shatter", "x": world.x, "y": world.y})
			mgr.sfx.play("shatter", linear_to_db(0.5))
		return true
	# (THE WARLOCK's tree: Terrible Roar, it runs from him, and does nothing else: game.ts runFrom)
	if flee_t > 0.0:
		flee_t = maxf(0.0, flee_t - dt)
		_run_from(dt)
		return true
	if stun_t > 0.0 or stagger_t > 0.0:
		stun_t = maxf(0.0, stun_t - dt)
		stagger_t = maxf(0.0, stagger_t - dt)
		_set_list("idle")
		return true
	return false


## (THE WARLOCK's tree: Terrible Roar, game.ts runFrom) Straight away from him at its own pace, as far as the floor lets it; what it
## was winding up broken off.
func _run_from(dt: float) -> void:
	break_off()
	var h = mgr.hero if mgr != null else null
	if h == null:
		return
	var d: Vector2 = world - h.world
	var way: Vector2 = d / d.length() if d.length() > 0.0 else Vector2(1, 0)
	var step: Vector2 = way * speed * dt
	var rr := minf(r, 0.42)
	var fly := kind == "bat"
	if mgr.clear(world.x + step.x, world.y, rr, fly):
		world.x += step.x
	if mgr.clear(world.x, world.y + step.y, rr, fly):
		world.y += step.y
	face = way
	_set_list("walk" if step.length() > 0.0 else "idle")


## (game.ts throwMonster) Flung away from `from`, `far` tiles in `secs`: never a boss, nor one shut in a room he is not in.
func throw_from(from: Vector2, far: float, secs := 0.2, ice := false) -> void:
	if dead or boss or mgr.shut_in(self):
		return
	var d := world - from
	var dir := d / d.length() if d.length() >= 0.01 else (-face if face.length() > 0.01 else Vector2(1, 0))
	thrown = {"vx": dir.x * far / secs, "vy": dir.y * far / secs, "t": secs}
	# (THE MAGE'S TREE REMADE: Deep Freeze, a frozen one sliding freezes what it touches)
	if ice:
		thrown["ice"] = true


## (game.ts freezeMonster) Frozen where it stands (never a boss), as a second chilling hit freezes it.
func freeze_now() -> void:
	if dead or boss:
		return
	frozen_t = maxf(frozen_t, 0.6 if elite else 1.1)
	freeze_immune = 4.0
	chill = maxf(chill if chill_t > 0.0 else 0.0, 0.3)
	chill_t = 2.5
	if state == "charge":
		_end_charge()
	_tell({"t": "freeze", "x": world.x, "y": world.y})


## (game.ts flyThrown) A thrown one goes on its way; stopped by a wall, it stops.
func _fly(dt: float) -> void:
	var k := minf(dt, maxf(0.0, float(thrown["t"])))
	var x0 := world
	var rr := minf(r, 0.42)
	var fly := kind == "bat"
	var sx := float(thrown["vx"]) * k
	var sy := float(thrown["vy"]) * k
	if mgr.clear(world.x + sx, world.y, rr, fly):
		world.x += sx
	if mgr.clear(world.x, world.y + sy, rr, fly):
		world.y += sy
	thrown["t"] = float(thrown["t"]) - dt
	if thrown.get("ice", false):
		for o in mgr.list:
			if is_instance_valid(o) and o != self and not o.dead and not o.boss and o.frozen_t <= 0.0 and not mgr.shut_in(o) and o.world.distance_to(world) <= o.r + r:
				o.freeze_now()
	var meant := Vector2(thrown["vx"], thrown["vy"]).length() * k
	if float(thrown["t"]) <= 0.0 or (meant > 0.01 and world.distance_to(x0) < meant * 0.3):
		thrown = {}
	_place()


## FLAME in front (game.ts hitMonster, `r.ignite`): it burns `dps` a second for 3 s (`secs`: LASTING longer, FLEETING shorter);
## burning already, it burns as hard as the harder of the two, and its time begins again.
func set_alight(dps: float, secs := 3.0) -> void:
	if burn_t <= 0.0:
		_tell({"t": "ignite", "x": world.x, "y": world.y})
	if burn_t <= 0.0 or dps > burn_dps:
		burn_dps = dps
	burn_t = secs


## FROST in front, a chilling hit that slows it by `by` (game.ts chillMonster): a second one on a chilled one freezes it,
## 1.1 s (an elite 0.6 s), and then it cannot be frozen again for 4 s; never a boss. A troll frozen as he runs his charge is
## stopped in it. The chill is the greater of what it has and this, 2.5 s from now.
func chill_by(by: float) -> void:
	if chill_t > 0.0 and freeze_immune <= 0.0 and not boss:
		frozen_t = 0.6 if elite else 1.1
		freeze_immune = 4.0
		if state == "charge":
			_end_charge()
		_tell({"t": "freeze", "x": world.x, "y": world.y})
		mgr.sfx.play("frost", linear_to_db(0.7))
	chill = maxf(chill if chill_t > 0.0 else 0.0, by)
	chill_t = 2.5


## POISON in front, a dose of `dps` a second (game.ts poisonMonster): doses add up, 8 at most (after that the poison is no
## weaker than 8 of this one), and each new one starts its 4 s again. The hero's Poison Damage makes it more.
func dose(dps: float, secs := -1.0) -> void:
	if dead:
		return
	var tune: Dictionary = Words.data()["poison"]
	var more: float = mgr.hero.stats.get("poison_pct", 0.0) if mgr.hero != null else 0.0
	if more != 0.0:
		dps *= maxf(0.0, 1.0 + more / 100.0)
	if poison_t <= 0.0:
		poison_dps = 0.0
		poison_n = 0
		_tell({"t": "poisoned", "x": world.x, "y": world.y})
		mgr.sfx.play("poison", linear_to_db(0.5))
	var most := int(tune["stacks"])
	if poison_n < most:
		poison_dps += dps
		poison_n += 1
	else:
		poison_dps = maxf(poison_dps, dps * most)
	poison_t = secs if secs >= 0.0 else float(tune["time"])


## HEAVY in front (game.ts stunMonster): stunned `secs` (an elite half that; never a boss), unless it is stunned for longer
## already; what it was winding up is broken off. (`meld`: the melded word whose stun it is, Thunder's, told with it.)
func stun_for(secs: float, meld := "") -> void:
	if dead or boss:
		return
	var t := secs / 2.0 if elite else secs
	if t <= stun_t:
		return
	stun_t = t
	break_off()
	var e := {"t": "stun", "id": id, "x": world.x, "y": world.y, "secs": t}
	if meld != "":
		e["meld"] = meld
	_tell(e)


## HEAVY behind (game.ts staggerMonster): it has walked onto cracked ground lying at `from`, and reels (0.55 s), its attack
## broken off; that ground cannot stagger it again for 1.5 s after. Never a boss.
func stagger_from(from: Vector2) -> void:
	if dead or boss or stagger_cd > 0.0:
		return
	var heavy: Dictionary = Words.data()["heavy"]
	stagger_t = float(heavy["stagger"])
	stagger_cd = float(heavy["stagger"]) + float(heavy["staggerAgain"])
	break_off()
	_tell({"t": "stagger", "id": id, "x": world.x, "y": world.y, "fromX": from.x, "fromY": from.y})


## An attack it was winding up is broken off, with the warning of a blow it was about to bring down (game.ts breakOff): its
## wind-up, its charge, a Boneward's stoop for its spear. One with rules of its own, in the middle of an act: it stands again
## (game/bosses.ts breakOff), and its own script ends the act as it finds it is no longer in it; a bone mite's bite, wound
## up by its own script as any monster's one blow is, is broken off as theirs is.
func break_off() -> void:
	if h2 != null:
		if state == "act" or state == "windup":
			state = "chase"
			_set_list("idle", true)
		return
	if state != "windup" and state != "charge" and state != "pickup":
		return
	state = "chase"
	_set_list("idle")
	_charge = {}
	_aim = {}
	mgr.perils.drop(self, ["warn", "lane", "aim"])


## All that the hero's words had done to it is gone (the hero fallen and come back: hero.gd _back; its body carries none).
## SURGING, on it (game.ts updateMonsters): every SURGE.monsterEvery seconds that he is within SURGE.monsterNear of it, a shockwave
## SURGE.monsterRadius round it after a warning (a minion's, of its leader's Surging, for less).
func _surge(dt: float) -> void:
	var sk := word_share("surging")
	if sk <= 0.0:
		return
	var S: Dictionary = Words.data()["last"]["surge"]
	if surge_t < 0.0:
		surge_t = S["monsterEvery"]
	surge_t -= dt
	if surge_t > 0.0:
		return
	surge_t = S["monsterEvery"]
	var h = mgr.hero
	if h == null or not is_instance_valid(h) or h.world.distance_to(world) > float(S["monsterNear"]) or mgr.shut_in(self):
		return
	var by := blow()
	by["sound"] = "surge_foe"
	# (whose surge it is: its wave is drawn from it, render/words7.ts tickW7's `src`)
	by["src"] = id
	mgr.perils.warn(world.x, world.y, S["monsterRadius"], S["monsterWarn"], (dmg_min + dmg_max) / 2.0 * float(S["monsterDmg"]) * sk, null, by)
	h.last.rec("surge_warn")


## REAPING, on it (game.ts riseAgain): it rises once, REAP.riseAfter seconds after it died, where it fell, with REAP.riseLife of its
## life and no words (a boss never).
func _rise_again() -> void:
	var R: Dictionary = Words.data()["last"]["reap"]
	var at := world
	var whole := max_life
	var pack := pack_id
	var k := kind
	var f := face
	_tell({"t": "rise", "id": id, "x": at.x, "y": at.y})
	var M = mgr
	M.after(maxf(0.0, float(R["riseAfter"]) - 1.0), func() -> void:
		if M.hero != null and is_instance_valid(M.hero) and M.hero.alive:
			M.hero.last.rec("reap_rise"))
	M.after(float(R["riseAfter"]), func() -> void:
		if M.hero == null or not is_instance_valid(M.hero) or not M.hero.alive:
			return
		var o = M.call_up(k, at, pack, f)
		if o == null:
			return
		o.max_life = maxf(1.0, roundf(whole * float(R["riseLife"])))
		o.life = o.max_life
		o.words = []
		o.risen = true)


func clear_afflictions() -> void:
	hell_t = 0.0
	hell_dps = 0.0
	curse_t = 0.0
	curse_dps = 0.0
	thrown = {}
	bleed_t = 0.0
	bleed_dps = 0.0
	bleed_move = 0.0
	burn_t = 0.0
	burn_dps = 0.0
	chill_t = 0.0
	chill = 0.0
	frozen_t = 0.0
	freeze_immune = 0.0
	poison_t = 0.0
	poison_dps = 0.0
	poison_n = 0
	stun_t = 0.0
	stagger_t = 0.0
	stagger_cd = 0.0
	mark_t = 0.0
	# (WORDMELDING)
	scald_cd = 0.0
	fumes_cd = 0.0
	blight_t = 0.0
	bite_dps = 0.0
	sunder = 0.0
	sunder_t = 0.0


const PF := preload("res://scripts/pixel_font.gd")
const KK := preload("res://scripts/act3/kknight.gd")
const SAY_GOLD := Color("#ffd27a")
const SAY_INK := Color("#120d18")
## (render/fx.ts BOSS_SAY_LIFT: game pixels over where he stands)
const SAY_LIFT := 84.0


## His line on a dark slip over his head, a little tail pointing down at him (render/fx.ts, bossSay), in game pixels.
func _say_slip() -> void:
	var t := _said_secs - _said_t
	var a := minf(1.0, t / 0.15) if t < _said_secs - 0.4 else maxf(0.0, (_said_secs - t) / 0.4)
	var w := PF.width(_said) + 10.0
	var y := -_said_lift - roundf(minf(1.0, t / 0.12) * 4.0)
	var foot := y + 1.0 + 10.0
	var ink := Color(SAY_INK, 0.8 * a)
	draw_rect(Rect2(-floorf(w / 2.0), y - 3.0, w, 14.0), ink)
	draw_rect(Rect2(-2, foot, 5, 1), ink)
	draw_rect(Rect2(-1, foot + 1, 3, 1), ink)
	draw_rect(Rect2(0, foot + 2, 1, 1), ink)
	PF.draw(self, _said, 0, y, Color(SAY_GOLD, a), {"align": "center", "shadow": Color(SAY_INK, a)})


## Say a line over his head for so many seconds (game.ts bossIntro, render/fx.ts bossSay); `lift` game pixels over where he stands;
## `fallen`: said as he falls, and shown over him fallen (the Princess's whisper).
## (THE BOSSES CALL OUT THEIR BIG MOVES, game/boss_calls.ts; main.ts bossSay with his voice) A line called out: over him, and
## heard in his own voice (monsters.gd speak).
func call_line(text: String, secs: float) -> void:
	say(text, secs)
	mgr.speak(kind, text)


## bossCall: the line a boss calls out as he begins `move` (by its name in his rules; `basic`: it is his basic blow), if his kind has
## one and he has not called out within BOSS_CALLS.gap (his basic blow's, within BOSS_CALLS.basicGap); called out, over him and
## aloud. For the bosses whose own scripts do not keep their calls: the Warden's moves (startMove), and those of every boss of the
## act scripts that has none of its own (act1.gd start_act: the Rat King, the Physician, the Prince, the Queen, the King).
var _called_at := -1e9
var _basic_at := -1e9


func call_out(move: String, basic := false) -> void:
	if not boss:
		return
	var V: Dictionary = mgr.voices()
	var line = V["calls"].get(kind, {}).get(move)
	if line == null:
		return
	var now := Time.get_ticks_msec() / 1000.0
	var T: Dictionary = V["tune"]
	if now - _called_at < float(T["gap"]) or (basic and now - _basic_at < float(T["basicGap"])):
		return
	_called_at = now
	if basic:
		_basic_at = now
	call_line(str(line), float(T["sayFor"]))


func say(text: String, secs: float, lift := SAY_LIFT, fallen := false) -> void:
	_said = text
	_said_t = secs
	_said_secs = secs
	_said_lift = lift
	_said_fallen = fallen
	queue_redraw()


func _die() -> void:
	dead = true
	state = "dead"
	_bar = 0.0
	# (a body is not flashed: the game draws the fallen apart from the living, and its flash runs down only while it lives; here
	# it would stay white all the while it lay)
	_flash = 0.0
	# (killed frozen, it shatters: game.ts kill; what had been done to it is over with it)
	if frozen_t > 0.0:
		_tell({"t": "shatter", "x": world.x, "y": world.y})
		mgr.sfx.play("shatter", linear_to_db(0.8))
	# (WORDMELDING: what had been done to it is cleared once the move that killed it has answered for it, below: Shatter reads its
	# frost, Rupture its poison, Powderkeg its burning, as game.ts kill does)
	_set_list("die", true)
	mgr.perils.drop(self)
	if h2 != null and h2.has_method("died"):
		h2.died(self)
	if boss:
		mgr.boss_fell = true
		mgr.boss_at = world
	# (FLOORS 6 TO 10'S WORDS, game.ts kill: what the words of the move that killed it add, the hero's; and VOLATILE, on it, it
	# goes off after a short warning, of its element and none of its words (a minion, of its leader's Volatile, at half))
	if mgr.hero != null and is_instance_valid(mgr.hero) and mgr.hero.has_method("killed"):
		mgr.hero.killed(self)
		# (and his word on a big kill: game.ts quip, speech.gd)
		if mgr.main != null and mgr.main._speech != null:
			mgr.main._speech.killed(self)
	# (THE WARLOCK: a cursed one dying spreads every burn on it to those near it: game.ts kill, spreadBurns)
	if curse_t > 0.0:
		mgr.spread_burns(self)
	clear_afflictions()
	var blast := word_share("volatile")
	var foe = mgr.main.get("_foe") if mgr.main != null else null
	if blast > 0.0:
		# (EVERY WORD ON A DUNGEON: Demolition's blast wider, slower and harder; Implode's: foe_words.gd blast)
		var big: Dictionary = foe.blast(self) if foe != null else {}
		var B := {"r": 1.8, "wait": 0.7, "k": 1.5} if big.is_empty() else big
		mgr.perils.warn(world.x, world.y, float(B["r"]), float(B["wait"]), (dmg_min + dmg_max) / 2.0 * float(B["k"]) * blast, null, {"el": element(), "words": [], "half": half_of()})
	if foe != null and foe.on():
		foe.death(self)
	# (THE CITY'S WORDS, Version 23.8: one carrying Splitting splits in two at half its life, a minion, of its leader's, too)
	if word_share("splitting") > 0.0 and not split and not boss:
		_split()
	# THE LAST WORDS, on it: one carrying Reaping rises once; one carrying Plundering drops all it stole
	if word_share("reaping") > 0.0 and not risen and not boss:
		_rise_again()
	if stolen > 0 and mgr.loot != null:
		mgr.loot._gold(world, stolen)
		stolen = 0
		if mgr.hero != null and is_instance_valid(mgr.hero):
			mgr.hero.last.rec("plunder_spray")
	if mgr.loot != null:
		mgr.loot.on_kill(self)
	if boss and h2 != null and h2.has_method("hurt_voice"):
		# (a boss whose death is his fight's own sound, begun as he is killed: the Swamp Colossus's, colossus.gd died)
		pass
	elif boss and BOSS_VOICE.has(kind):
		# (a boss who roars: his own death)
		mgr.sfx.play(BOSS_VOICE[kind] + "_death")
	elif VOICE.has(kind) and (champion or mgr.kept_cry(VOICE[kind] + "_death", mgr.ENEMY_KEEP["death"])):
		mgr.sfx.play(VOICE[kind] + "_death", -1.0 if champion else -4.0)
	elif VOICE.has(kind):
		# (THE FOURTEENTH BATCH: the others of a family die with the plain sound of one with no voice, ENEMY_KEEP)
		mgr.sfx.play("monster_die", -3.1)
	elif boss:
		mgr.sfx.play("boss_roar")
	else:
		mgr.sfx.play("explode" if champion else "monster_die", -3.1)
	queue_redraw()


# --- its picture ---

func _set_list(list: String, again := false) -> void:
	if (_list != list or again) and art.has(list):
		_list = list
		_anim_t = 0.0


## Where it is on the screen; on raised or sunken ground and on stairs it is drawn as high as the ground is there
## (floor_map.gd lift_at).
var _relief_of = null
var _relief := false


func _place() -> void:
	position = Iso.to_screen(world.x, world.y)
	_lift = mgr.map.lift_at(world.x, world.y) if mgr != null and mgr.map != null else 0.0
	# (WHAT STANDS BEHIND RAISED GROUND, CUT OFF BY IT: render.ts hide, at its place and its ground's lift: hide_clip.gd)
	if mgr != null and mgr.map != null and _sprite != null:
		if mgr.map != _relief_of:
			_relief_of = mgr.map
			_relief = HideClip.has_relief(mgr.map)
		if _relief:
			HideClip.apply(_sprite, HideClip.blocks(mgr.map, world.x, world.y, mgr.map.lift_at(world.x, world.y)))
	# (one with rules of its own drawn up off the floor, or let down under its edge: a vulture overhead, a crawler under the lip)
	if h2 != null and h2.has_method("lift"):
		_lift += 2.0 * h2.lift(self)
	# (thrown up by the Brawler's uppercut: render.ts, `sy -= fx.brawler.liftOf(m)`)
	_lift += 2.0 * pop
	# (one with rules of its own drawn later than its depth would have it, over the hero it has latched on to: render/act1_fx
	# leech.ts `over`, so much added to its depth; where it is on the screen is kept, only its place among what stands moves)
	if h2 != null and h2.has_method("over"):
		var later := 16.0 * float(h2.over(self))
		position.y += later
		_lift += later
	if _sprite != null:
		# (the dagger cultist's frenzy: his pictures carry him along the way they face, and the rules the way he truly faces, so
		# his picture is drawn back by what it carries him: action_f4.ts frenzyShift)
		var shift := Vector2.ZERO
		if _move >= 0 and _move < _moves.size() and (state == "windup" or state == "recover") and _moves[_move]["id"] == "frenzy":
			var c := MM.frenzy_at(MM.move_age(state, _t, _moves[_move]["windup"], _moves[_move]["recover"]))
			var ahead := MM.picture_ahead(face)
			shift = Vector2(-roundf((ahead.x - ahead.y) * 16.0 * c), -roundf((ahead.x + ahead.y) * 8.0 * c)) * 2.0
		_sprite.position = Vector2(shift.x, shift.y - _lift)


func _show() -> void:
	# (FLOOR 9'S SIDE BOSSES: none of their pictures taken in, nor any shown, until they are fetched as their lairs are entered,
	# far beyond what he can see of them: monsters.gd FETCH_AT)
	if art.deferred and not art.fetched:
		if _sprite.texture != null:
			_sprite.texture = null
			_lit_f = {}
		return
	# (EVERY FLOOR'S OWN MONSTERS' PICTURES HELD ONLY NEAR HIM: monsters.gd NEAR_FETCH. One far off whose pictures are let go of shows
	# none, and holds none; within NEAR_SHOW, one whose pictures have not come in yet (come up beside him) waits unseen the few
	# frames till they have: taken in at once, the game would stand still that long, and its blows skip their moments)
	# (and one taken in a move at a time, the Moth, far off: none of hers drawn, so that they are let go of: monsters.gd NEAR_DROP)
	if (art.near and not art.whole()) or art.lazy:
		var far: bool = mgr.hero == null or world.distance_to(mgr.hero.world) > NEAR_SHOW
		if not far:
			art.fetch()
		if far or (art.near and not art.whole()):
			if _sprite.texture != null:
				_sprite.texture = null
				_lit_f = {}
				_lights.queue_redraw()
			return
	var list := _list
	# (FROZEN, it is its first standing picture, held: render.ts `m.frozenT > 0`; a Boneward whose spear is gone, its bare one)
	var held := frozen_t > 0.0 and not dead
	if held:
		list = "standBare" if bare and art.has("standBare") else "idle"
	var n := art.count(0, list)
	if n == 0:
		return
	var i := int(_anim_t * art.fps(list))
	# (standing, walking and running go round; a blow, a fall, a call play once and hold their last frame)
	i = i % n if list in ["idle", "walk", "charge", "standBare", "walkBare"] else mini(i, n - 1)
	if held:
		i = 0
	# (one with rules of its own may be shown otherwise: a rubbling still a pile, a crawler under the lip, a vulture frozen aloft)
	var own: Dictionary = h2.shown(self) if h2 != null and h2.has_method("shown") else {}
	_sprite.visible = not own.has("hide")
	if own.has("list") and art.has(own["list"]):
		list = own["list"]
		i = clampi(int(own["i"]), 0, art.count(0, list) - 1)
	var f := art.frame(face.x, face.y, list, i, kind == "wsboss")
	var had: bool = not (_lit_f.get("lights", []) as Array).is_empty()
	_lit_f = f
	if had or not (f.get("lights", []) as Array).is_empty():
		_lights.queue_redraw()
	_sprite.texture = f["tex"]
	_sprite.offset = f["offset"]
	_sprite.flip_h = f["flip"]
	_sprite.scale = Vector2.ONE * float(f["scale"]) * look
	# (a body as big as the Moth's flashes fainter: render.ts, its kind's own Act1Fx.flash)
	var fk: float = h2.flash_k(self) if h2 != null and h2.has_method("flash_k") else 1.0
	_sprite.self_modulate = Color.WHITE.lerp(Color(2.4, 2.4, 2.4), fk) if _flash > 0.0 else Color.WHITE
	_sprite.region_enabled = false
	# (ARRIVALS, render/arrivals.ts risingSprite: coming up out of its rift, what is still below the floor not drawn, dark as it comes,
	# lit as it steps out: its picture's top `above` rows, let down by what is still under the floor)
	if not _arrive.is_empty() and state == "rise":
		var up := risen_by()
		var size: Vector2 = f["tex"].region.size
		var ay: float = -float(f["offset"].y)
		var above := roundf(ay * up)
		if above <= 0.0:
			_sprite.visible = false
			return
		_sprite.region_enabled = true
		_sprite.region_rect = Rect2(0, 0, size.x, minf(size.y, above))
		_sprite.offset = Vector2(f["offset"].x, -above)
		_sprite.self_modulate = Color.WHITE.lerp(Color("#160a1c"), 0.85 * (1.0 - up))
		_sprite.self_modulate.a = minf(1.0, 0.35 + up)
	# (THE LAST WORDS' LOOKS, render/words7.ts lookW7: its own picture changed by a word: tinted, held, cut in two)
	if mgr.fx != null and mgr.fx.get("w7") != null:
		mgr.fx.w7.look_on(self, _sprite)


## WHAT ITS PICTURE GIVES OFF (render.ts monsterLit; engine/px.ts drawLights): eyes in the dark, a cultist's fire, the Warden's maul
## going hot, the Stoker's furnace: each light of its frame (the bake's `lights`) laid on, ADDED, over the place's dark, a soft pool
## its reach across in its colour and strength. Not while it is frozen (ice gives off no light), nor dead, nor unseen.
func _draw_lights() -> void:
	var ls: Array = _lit_f.get("lights", [])
	if ls.is_empty() or dead or frozen_t > 0.0 or not _sprite.visible or not _arrive.is_empty() and state == "rise":
		return
	var k: float = 2.0 * look
	for l in ls:
		var r: float = float(l["r"]) * k
		var at: Vector2 = _sprite.position + Vector2(float(l["dx"]), float(l["dy"])) * k
		_lights.draw_texture_rect(Glow.tex(), Rect2(at.x - r, at.y - r, r * 2.0, r * 2.0), false, Glow.tint(l))


## What of it lights the floor round it (render.ts light, MONSTER_LIGHT_MIN): a light of its picture 7 or more across cuts a pool in
## the dark, 2.6 times its reach, a little stronger, a little below it: the floor round a cultist's flame, the Warden's maul.
func cut_lights(dark) -> void:
	var ls: Array = _lit_f.get("lights", [])
	if ls.is_empty() or dark == null or dead or frozen_t > 0.0 or not visible or not _sprite.visible:
		return
	var at: Vector2 = (position + _sprite.position) / 2.0
	for l in ls:
		if float(l["r"]) >= 7.0:
			dark.spot(at + Vector2(float(l["dx"]), float(l["dy"]) * 1.0 + 6.0 / look) * look, float(l["r"]) * 2.6 * look, float(l.get("a", 0.5)) * 1.1)


## Its life over its head for a while after it is struck (game.ts barT).
func _draw() -> void:
	var top := _sprite.offset.y * _sprite.scale.y - 10.0 - _lift
	if (_said_t > 0.0 or _not_yet > 0.0) and (not dead or _said_fallen):
		# (in the game's letters, in game pixels: render/fx.ts)
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		if _said_t > 0.0:
			_say_slip()
		if _not_yet > 0.0:
			var rise := roundf((0.9 - _not_yet) * 12.0)
			PF.draw(self, "Not yet", 0, top / 2.0 - 4 - rise, Color(SAY_GOLD, clampf(_not_yet / 0.3, 0.0, 1.0)), {"align": "center", "shadow": Color(SAY_INK, clampf(_not_yet / 0.3, 0.0, 1.0))})
		draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	# (a boss's life over him for a while after he is struck; any other's is drawn over the dark as the game draws it: _Over)
	if _bar <= 0.0 or dead or not boss:
		return
	var w := 80.0
	draw_rect(Rect2(-w / 2 - 1, top - 1, w + 2, 6), Color(0.04, 0.04, 0.1, 0.85))
	draw_rect(Rect2(-w / 2, top, w * clampf(life / max_life, 0.0, 1.0), 4), Color(0.86, 0.18, 0.28))


# --- over its head (render.ts drawBars) ---

## (art/palette.ts: P.ink, P.bl1, P.bl4, P.fr4; RARITY_COLOR's blue and yellow, a blue pack's name and a yellow pack's leader's)
const INK := Color("#120d18")
const BL1 := Color("#3a0a12")
const BL4 := Color("#e03c44")
const FR4 := Color("#ff8a2a")
const BLUE_NAME := Color("#6f8cff")
const YELLOW_NAME := Color("#ffe070")
## (the game's looks: art/bestiary.ts FIGURE_SIZE, art/icons.ts WORD_COLOR: fx_looks.gd)
const Looks := preload("res://scripts/fx_looks.gd")
var _over: _Over


## How far up its head is from the floor point under it, game pixels (FIGURE_SIZE[figureOf(m)].top).
func _head() -> float:
	Looks.ready_up()
	var size = Looks.FIGURE_SIZE.get(art.name if art != null else kind, Looks.FIGURE_SIZE.get(kind))
	return float(size["top"]) if size != null else 30.0


## Drawn as an elite is, its name over it and its bar always (render.ts named): an elite (a yellow pack's leader is one), and
## every one of a blue pack.
func named() -> bool:
	return elite or rarity == "blue"


## Whether anything is over its head now: its bar, its name, the rune of what it carries.
func _shows_over() -> bool:
	# (nothing of one hidden, as an inkling going about as a pool of ink is, not its bar nor its name: render.ts `hidden`)
	if dead or not seen or not _sprite.visible or boss and carries.is_empty() or state == "rise":
		return false
	return _bar > 0.0 or named() or ((elite or boss) and not carries.is_empty()) or _crest()


## (THE ROYAL CARDS: one a royal touched wears that royal's crest over its head, on the High City's floors: render.ts)
func _crest() -> bool:
	return royal != "" and mgr.loot != null and mgr.loot.royal_floor() and mgr.loot.pics.has("crest:" + royal)


## What is over its head, in game pixels from the floor point under it (render.ts drawBars):
##   ITS BAR, for any but a boss (his is the screen's): while it shows its life after a blow (BAR_FOR), and always for one
##     drawn as an elite is; 34 wide for a guardian, 24 for one named, 16 for any other, five over its head; red on dark,
##     orange for one named. One of a blue pack that is whole and has not been struck shows none (ART_TWEAKS.bars), its name only.
##   ITS NAME, for one named: over its bar, in the small letters, a blue pack's blue (once, over the first of it in sight:
##     monsters.gd speaks), a yellow pack's leader's yellow, else its first word's colour (nameColor).
##   THE RUNE OF THE WORD IT CARRIES, over an elite's or a boss's head: each word's stone on a dark square, a line of its
##     colour under it, bobbing; what you see is what its death will leave on the floor.
func _draw_over(c: CanvasItem) -> void:
	if not _shows_over():
		return
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	var lift := _lift / 2.0
	var y := roundf(-_head() - 5.0 - lift)
	if not boss and (_bar > 0.0 or named()):
		var w := 34.0 if champion else (24.0 if named() else 16.0)
		var quiet := named() and not elite and life >= max_life and _bar <= 0.0
		if not quiet:
			c.draw_rect(Rect2(-w / 2.0 - 1.0, y - 1.0, w + 2.0, 4.0), INK)
			c.draw_rect(Rect2(-w / 2.0, y, w, 2.0), BL1)
			c.draw_rect(Rect2(-w / 2.0, y, maxf(0.0, roundf(w * life / max_life)), 2.0), FR4 if named() else BL4)
		if named() and (rarity != "blue" or mgr.speaks.get(pack_id) == self):
			var hue := FR4
			if rarity == "blue":
				hue = BLUE_NAME
			elif rarity == "leader":
				hue = YELLOW_NAME
			elif not words.is_empty():
				hue = Looks.WORD.get(str(words[0]), FR4)
			PF.draw(c, title, 0.0, y - 8.0, hue, {"align": "center", "font": "small", "shadow": INK})
	if (elite or boss) and not carries.is_empty() and mgr.loot != null and mgr.loot.sheet != null:
		var top := roundf(-_head() - (6.0 if boss else 15.0) - lift)
		var bob := roundf(sin(Time.get_ticks_msec() / 1000.0 * 3.0 + id) * 1.5)
		# (only the words that have their rune stones here, which are all that its death leaves here (loot.gd _word): a word of the
		# floors past the fifth has none yet, and was drawn as an empty dark square, two of them a dark bar over the Carrion Queen)
		var shown: Array = carries.filter(func(w): return mgr.loot.pics.has("word:" + str(w)))
		var n := shown.size()
		for i in n:
			var w: String = shown[i]
			var x := -floorf((n * 14.0 - 2.0) / 2.0) + i * 14.0
			var iy := top - 13.0 + bob
			c.draw_rect(Rect2(x - 1.0, iy - 1.0, 14.0, 14.0), INK)
			c.draw_rect(Rect2(x - 1.0, iy + 13.0, 14.0, 1.0), Looks.WORD.get(w, FR4))
			var pic: Dictionary = mgr.loot.pics.get("word:" + w, {})
			if not pic.is_empty():
				c.draw_texture_rect_region(mgr.loot.sheet, Rect2(x, iy, 12.0, 12.0), pic["rect"])
	# (THE HIGH CITY, THE ROYAL CARDS: the crest of the royal that touched it over its head, above the word it carries, a slow bob of
	# one pixel: render.ts, render/royal_cards.ts drawRoyalCrest)
	if _crest():
		var words: bool = (elite or boss) and not carries.is_empty()
		var top := roundf(-_head() - lift) - ((6.0 if boss else 15.0) + 16.0 if words else 5.0)
		var bob := roundf(sin(Time.get_ticks_msec() / 1000.0 * 2.4 + id * 1.7))
		var cp: Dictionary = mgr.loot.pics["crest:" + royal]
		# (its picture in our pixels, two to a game pixel; its anchor its foot)
		var a: Vector2 = cp["anchor"] / 2.0
		c.draw_texture_rect_region(mgr.loot.sheet, Rect2(roundf(-a.x), roundf(top - a.y + bob), cp["rect"].size.x / 2.0, cp["rect"].size.y / 2.0), cp["rect"])
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## What is over its head, drawn over the dark (the game draws its bars, names and runes after its lighting: render.ts), and
## drawn again each frame while there is something to show, and once as it goes.
class _Over extends Node2D:
	var m
	var _was := false

	func _ready() -> void:
		z_index = 60

	func _process(_dt: float) -> void:
		var now: bool = m._shows_over()
		if now or _was:
			queue_redraw()
		_was = now

	func _draw() -> void:
		m._draw_over(self)


## (game.ts drawnToDecoy) Within a live decoy's reach, it takes the decoy's spot in place of the hero's: it walks to it, and when its
## blow is ready it swings at it (a ranged one goes up to it and bashes it), the blow doing nothing. Whether it did (its step is
## then over). One already winding up a blow at the hero goes on with it.
var _decoy_swing := false


func _drawn_to_decoy(dt: float, reach: float) -> bool:
	if _decoy_swing and state != "windup":
		_decoy_swing = false
	var swinging := _decoy_swing
	if not swinging and state != "chase":
		return false
	var d = mgr.decoy_for(self)
	if d == null:
		if swinging:
			_decoy_swing = false
			state = "chase"
			_set_list("idle")
		return false
	var to: Vector2 = Vector2(d["x"], d["y"]) - world
	var dist := to.length()
	if dist > 0.01:
		face = to / dist
	if swinging:
		_t -= dt * (0.6 + 0.4 * slow())
		if _t <= 0.0:
			_decoy_swing = false
			state = "recover"
			_t = RECOVER
			_cd = float(def["cooldown"]) * randf_range(0.9, 1.2)
			var e := {"t": "decoyStruck", "x": d["x"], "y": d["y"], "golem": d.get("golem") != null}
			if mgr.hero.kit != null:
				mgr.hero.kit._say(e)
			else:
				_tell(e)
			mgr.sfx.play("swing", linear_to_db(0.4))
		return true
	var r2: float = (minf(1.2, reach) if def["ranged"] else reach) + float(d["size"])
	if dist <= r2 + 0.2 and _cd <= 0.0:
		state = "windup"
		_t = float(def["windup"])
		_move = -1
		_set_list("attack", true)
		_decoy_swing = true
		return true
	if dist > r2 * 0.8:
		_go(dt, to, dist, true)
	else:
		_set_list("idle")
	return true
