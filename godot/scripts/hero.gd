## The hero on the floor, as the game moves him (game/game.ts): 4.6 tiles a second (defs.ts TUNE.heroSpeed), a body 0.3
## of a tile round (TUNE.heroRadius) that slides along walls (game.ts slide: the step along x kept if the body is clear
## there, then the step along y), on the walk grid. The keys or stick give a way on the SCREEN, turned to the floor
## (iso.ts screenDirToWorld), always at full speed.
## He faces one of his eight painted sides (art/warrior_up_art.ts wuFacing) and plays his baked lists: his stand and his
## run, his swings, his slam, his leap and its landing at 30 frames a second (art/warrior_up_art.ts).
##
## THE WARRIOR'S THREE ATTACKS with the greatsword (talents.ts: strike, whirl, leap), as main.ts takes them:
##   STRIKE (left button; a controller's RT): lands 0.333 s in on the one monster before him within 1.7 tiles that is
##     nearest and most in front (game.ts strike); again every 1 / his attack rate; pressed again soon enough, the second
##     swing of the combo; a step forward each.
##   WHIRLWIND (right button, held; LT): at his pick of 14 Nov 2026, "Give him the Whirlwind spin", the greatsword's
##     Whirlwind (in the game a talent of the tree, talents.ts gswhirlwind: "Whirl becomes WHIRLWIND: you spin round and
##     round, more hits, each for less"; defs.ts SKILLS.whirlwind, game.ts updateChannel): 0.12 s's wind-up, then for as
##     long as it is held, 2.4 s at most, he spins (1.6 turns a second), cutting everything within 2 tiles every 0.3 s for
##     x0.55, walking at 90% and through enemies; let go or run out, it is ready again after 3.5 s (less after a short
##     spin, never less than 35% of it). His spinning picture (art/warrior_up.ts WU_WHIRL3) seen from the front.
##   LUNGE, his swipe (Space; A): flung up to 6 tiles toward the pointer (or the way he goes), untouchable in the air,
##     through monsters and the Lockdown's bars; landing, a blow 1.6 round a tile before him, x0.5; ready again after 4 s
##     (defs.ts SKILLS.leap, LUNGE; game.ts useEvasive, land).
## (In the game Whirl opens at level 2 and the Lunge at 5, MOVE_OPENS; here all three are open, to try them.)
##
## HIS WORDS IN THE FIGHT ("wordsmithing"; loadout.gd, words.gd): A WORD IN FRONT OF A MOVE CHANGES THE HIT, A WORD BEHIND IT
## CHANGES WHAT THE MOVE LEAVES. `loadout.r(i)` is move i (0 Strike, 1 Whirlwind, 2 Lunge) with its words, and each move is
## made through it, as the game makes it:
##   how far and how wide: Strike's reach, the Whirlwind's and the Lunge's radius, times `size`; Strike's blows a second,
##     `rate` (and its wind-up never more than two fifths of the time between them: game.ts useBasic); the Whirlwind's and the
##     Lunge's waits, `cooldown`.
##   STRIKE (game.ts release, deliver, strike; _strike here): the best one before him is hit; Power's, Flame's and Frost's
##     splash round it (`splash` x size: every other one within it for `splash_dmg` of the hit); then what it leaves, round
##     what it struck, or where the blade passed if it met nothing.
##   THE WHIRLWIND (beginChannel, updateChannel, channelBite, blast; _spin and _blast here): each turn hits all within its
##     radius; what it leaves, it leaves round him by its first turn and by the first turn after each second it has gone on.
##   THE LUNGE (useEvasive, land, blast): its landing hits all within its radius of the point a tile before him, and leaves
##     what it leaves there.
##   A HIT ON A MONSTER (hitMonster; hit_monster here): a roll of the weapon's damage x the move's share with its words
##     (`dmg_mult`, his Strength in it) x (1 + (his damage bonus, the bonus of the blow's element and his might) / 100); a
##     critical (5% + 0.1% a point of Dex) x1.5; then Flame's burning, Frost's chill (a second one freezes), Lightning's arcs,
##     Poison's dose, Heavy's stun; life on hit. In an area the fourth one struck and those after, and a splash's, are QUIET:
##     no lightning jumps from them, and they carry no weight of Power.
##   WHAT A MOVE GIVES HIM: Power behind, MIGHT, so many % more damage for each blow that lands on something, five blows' worth
##     at most, 5 s from the last (landed; _landed_on here); Swift behind, HASTE, so many % faster on his feet for 3 s after
##     each use (boons; _boons here).
##   WHAT A MOVE LEAVES (wake; _wake here; the ground itself and what it does, wakes.gd): Flame, Frost or Lightning behind,
##     burning ground, ice or a storm; Poison behind, a cloud; Heavy behind, cracked ground.
##   What the rules have done they TELL (fx.gd event, the game's own tellings): swing, cast, hit, burst, heavy, buff here;
##     ignite, freeze, shatter, poisoned, stun, stagger from the monster (monster.gd); arc from monsters.gd and the storm; zone
##     from wakes.gd.
##   FLOORS 6 TO 10'S WORDS (the same functions of game.ts): TWIN in front, two of each blow, cut and shock, each its share, the
##     second a moment after (deliver, channelBite, land); behind, "of Echoes", a phantom makes the move again a moment later
##     from where it was made (deliver, endChannel, echoOf). LEECH in front, life back for every enemy hit; behind, the struck
##     marked, and an enemy it kills drops a life orb now and then (hitMonster, kill). VOLATILE in front, what it kills explodes
##     (explodeKill); behind, a rune that goes off (addRune; wakes.gd). PRECISE in front, harder and narrower (resolve); behind,
##     the first enemy each use hits is marked, his next hit on it a certain critical. VAST in front, wider and softer; behind,
##     each hit splashes onto all near what it hit. FRENZIED in front, each use a stack, his Strike and every wait faster
##     (boons, frenzyPace); behind, each kill a stack and the frenzy held longer. GUARDING in front, a shield; behind, a ward
##     circle (leavePatches; hurt_by). LASTING and FLEETING on all that lasts and ticks (the Whirlwind's hold and turns, what it
##     leaves, burning, poison, might, haste, the frenzy, the shield). Which move last struck a monster is kept on it (monster.gd
##     last_skill): its death answers to that move's words (killed).
##   WORDMELDING (melds.gd): a melded word does the work of its two words (the fight reads a move's words with their parts:
##     loadout.gd wfronts, wbehinds) and its own twist, in front and behind (r.meld, meldHit, meldArc, MELDS8: melds.gd's head);
##     a ranked word is its word, stronger (words.gd resolve).
##   LEFT OUT, as not a new Warrior's on floors 1 to 10: the skill trees (game.ts has, was, now: Sweeping Cut, Master Stroke,
##     Fuel, Searing, Venom, Deep Freeze, Forking, Cadence and the rest), the unique items (worn, wears), the other classes, and
##     the city's and the last words: where the game's code branches on one of those, the branch is not here.
##
## WHAT THE MONSTERS' WORDS DO TO HIM (game.ts hurtHero; hurt_by here): a blow comes with its striker's element and words (a
## pack's minion's at half, monster.gd half_of). Its harm: the part of it that is plain less his armour, the parts of Flame,
## Frost and Lightning less what he withstands of each; a fifth more while he is SHOCKED; a whole number, 1 at least. HEAVY
## knocks him back a step. Then what it leaves on him: POISON, most of the blow again over 4 s (less what he withstands of
## poison); FLAME, he BURNS for 3 s; FROST, he is CHILLED for 2 s (slower on his feet by its share, Strike slower by half of
## it); LIGHTNING, he is SHOCKED for 3 s. What burns and poisons him bites twice a second, on the monsters' clock (dots); all
## of it runs down as he goes (game.ts updateHero, updateDots), and is gone once he has fallen (_back).
##   FLOORS 6 TO 10'S: Guarding burned into his gear blocks a blow outright now and then; PRECISE on a monster, its blows
##     through half his armour; inside his ward circle (Guarding behind) he takes less, and his shield (Guarding in front)
##     takes what is left first; LASTING on a monster, its poison, burning and chill on him longer, FLEETING its poison and
##     burning sooner, the same in all; LEECH on a monster, it heals what its blow took.
##   LEFT OUT, as not on a floor 1 to 10 monster's words, or not a new Warrior's: Hexing, the skill trees (Bulwark, Thick
##     Skin, Iron Chin, Slip Reflex, Thorns, Bitter Cold, Unbreakable, Resolute), the unique items, Culling, Pulling, Stilling,
##     Binding, Bleeding, Plundering, the melded and ranked words on a dungeon (FOE_WORDS), and Frostbite and Blight that ride
##     on them.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")
const Sfx := preload("res://scripts/sfx.gd")
const Words := preload("res://scripts/words.gd")

const SPEED := 4.6
const RADIUS := 0.3
const IDLE_FPS := 30.0
const RUN_FPS := 30.0
const CLIP_FPS := 30.0
## (wuFacing: k = round(angle / 45 degrees), 0 down and to the right on the screen, then round)
const FACING := ["front", "toward", "frontL", "sideL", "backL", "away", "back", "side"]
const STEP_EVERY := 0.25
const AIM_REACH := 2.4
const BACK_AFTER := 2.5
const Loadout := preload("res://scripts/loadout.gd")
## (WORDMELDING: the melded words' twists in the fight, and what their looks read: melds.gd)
const Melds := preload("res://scripts/melds.gd")
var _melds = null
var melds:
	get:
		if _melds == null:
			_melds = Melds.new(self)
		return _melds

## (each move's share of the weapon's damage and its wait are the words' to change: loadout.r(i) `dmg_mult`, `cooldown`.
## `wake`, defs.ts TUNE.channelWake: how often the Whirlwind leaves what the words behind it leave, as it goes on)
const STRIKE := {"reach": 1.7, "windup": 0.333, "follow": 0.3, "combo": 0.5, "step": 0.33}
const WHIRL := {"radius": 2.0, "windup": 0.12, "channel": 2.4, "tick": 0.3, "min_cool": 0.35, "follow": 0.25, "walk": 0.9, "spin": 1.6, "wake": 1.0}
const WHIRL_LIST := 44
const LUNGE := {"range": 6.0, "radius": 1.6, "ahead": 1.0, "invuln": 0.06}
const LEAP_LIST := 39
const LAND_LIST := 45

var map: FloorMap
var art: BakedHero
var sfx: Sfx
var monsters  # monsters.gd
## (what the fight shows of his blows and words: the rules tell it with fx.event, fx.gd draws it; null where a place has none)
var fx
## (the ground his moves leave, and what it does: wakes.gd; the place's own)
var wakes
var doors  # doors.gd, on a floor that has them (null in town)
var props  # props.gd, on a floor that has chests, barrels or urns (null in town)
## (FLOORS 6 TO 10 BESIDES THEIR FIGHTS, act1/quest610.gd: floor 10's pillars, which his blows reach (pillars.gd); A SCENE
## PLAYING, the eyrie's (game.ts sceneStep): above 0, the player's hands off him, he walks where auto_dir takes him at that share
## of his pace; the picture's lean out over the drop (render.ts sceneLean), picture pixels)
var pillars = null
var scene_pace := 0.0
var lean := Vector2.ZERO
var world := Vector2.ZERO
var home := Vector2.ZERO
var face := Vector2(1, 0)
var alive := true
## how far he has walked (the guide's first prompt goes once he has walked 3 tiles)
var walked := 0.0

## HIS STATS (game/stats.ts derive), as a new Warrior has them (defs.ts CLASSES.warrior) with the Iron Greatsword (7 to 11,
## 1.05 a second, his Dex making it 1.09); his gear, his levels and his words change them (loot.gd derive).
var stats := {"str": 14.0, "dex": 8.0, "int": 6.0, "level": 1, "dmg_min": 7.0, "dmg_max": 11.0, "aps": 1.092, "dmg_pct": 0.0,
	"phys_pct": 0.0, "fire_pct": 0.0, "frost_pct": 0.0, "light_pct": 0.0, "poison_pct": 0.0, "cdr": 0.015,
	"crit_chance": 5.8, "crit_mult": 50.0, "life_regen": 0.6, "life_on_hit": 0.0, "life_on_kill": 0.0, "armor": 0.0,
	"move_speed": 0.0, "area": 1.0, "gold_find": 0.0}
var max_life := 102.0
var life := 102.0
## THE WORDS SET IN HIS THREE MOVES (loadout.gd; game/words.ts resolveSkill): which word is in which slot, and what each
## move comes to with them (`loadout.r(i)`). The gear screen sets them; loot.gd gives it his level, the lit ring and his
## numbers.
var loadout := Loadout.new()
## (Strike's first word in front and behind, "" for none: as the screens that came before the loadout read it)
var strike_words: Dictionary:
	get:
		var f: Array = loadout.fronts(0)
		var b: Array = loadout.behinds(0)
		return {"front": f[0] if not f.is_empty() else "", "behind": b[0] if not b.is_empty() else ""}
## WHAT HIS MOVES HAVE GIVEN HIM (game.ts Hero might, mightT, haste, hasteT): MIGHT, Power behind: so many % more damage on
## every hit of his, built by blows that land, for `might_t` seconds more; HASTE, Swift behind: so many % faster on his
## feet, for `haste_t` seconds more.
var might := 0.0
var might_t := 0.0
var haste := 0.0
var haste_t := 0.0
## FLOORS 6 TO 10'S WORDS ON HIM (game.ts Hero frenzy, frenzyT, shield, shieldT; game.ts boons, kill): THE FRENZY, Frenzied: so
## many stacks (5 at most), each 8% faster, his Strike and every wait of his moves, for `frenzy_t` seconds more; HIS SHIELD,
## Guarding in front: so much life of harm it takes before he does, for `shield_t` seconds more. And how many times each of
## his moves has been used (game.ts SkillState uses), and the use of each that last marked an enemy (Precise behind:
## game.ts `marked`).
var frenzy := 0
var frenzy_t := 0.0
var shield := 0.0
var shield_t := 0.0
var uses: Array = [0, 0, 0]
var _marked: Array = [-1, -1, -1]
## (FOR LASTING'S, FLEETING'S AND VAST'S LOOKS, fx_words10.gd, as render/words10.ts reads the game's Hero) WHICH OF HIS MOVES GAVE
## EACH BOOST he has (game.ts Hero.boostBy: "might", "haste", "frenzy", "shield", the move's place among his three); and WHOSE
## POISON, BURNING OR CHILL is on him (Hero.dotBy: {id: the monster's, word: "lasting", "fleeting" or "" as it was laid}).
var boost_by := {}
var dot_by := {}
## (what is to be done a moment from now, by the game's `after`: Twin's second blow, an echo, Volatile's explosion: {t, fn})
var _later: Array = []
## WHAT THE MONSTERS' WORDS HAVE LEFT ON HIM, named as the monsters' are (game/state.ts Hero burnT, burnDps, chillT, chill,
## shockT, poisonT, poisonDps):
##   burn_t, burn_dps       FLAME: he burns so many seconds more, so much a second
##   chill_t, chill_k       FROST: slowed by `chill_k` of his pace (Strike by half of it) for so many seconds more
##   shock_t                LIGHTNING: shocked, every blow a fifth harder, for so many seconds more
##   poison_t, poison_dps   POISON: so many seconds more, so much a second
var burn_t := 0.0
var burn_dps := 0.0
var chill_t := 0.0
var chill_k := 0.0
var shock_t := 0.0
var poison_t := 0.0
var poison_dps := 0.0
## (the last blow that reached him, as hurt_by weighed it: for a check to read)
var last_blow := {}
## (defs.ts TUNE.poisonTime: how long a monster's poison works on him; PACKS.minion: a minion's share of its leader's words)
const POISON_TIME := 4.0
const PACK_MINION := 0.5

## Shot mode (main.gd): a screen direction held as if pressed, attacks asked for, and blows that flash but do not harm.
var auto_dir := Vector2.ZERO
var auto_attack := false
var auto_whirl := false
var auto_lunge := Vector2.INF
var unhurt := false

var _knock := Vector2.ZERO
var _knock_t := 0.0
var _invuln := 0.0
var _sprite: Sprite2D
var _cam: Camera2D
## (how high the ground he stands on lifts him on the screen, picture pixels: floor_map.gd lift_at)
var _lift := 0.0
var _side := 0
var _list := BakedHero.IDLE
var _t := 0.0
## the attack he is in: "", "strike", "whirl", "lunge", and how far into it
var _act := ""
var _act_t := 0.0
var _landed := false
var _last_swing := -10.0
var _combo_next := false
var _whirl_cd := 0.0
## (the Whirlwind: its wait in full, how many cuts it has made, the next one's time, how long it has spun, when let go, and
## how far into the spin it next leaves what the words behind it leave: game.ts Hero.channel `wake`)
var _whirl_full := 3.5
var _bites := 0
var _next_bite := 0.0
var _spun := -1.0
var _stopped_at := 0.0
var _whirl_wake := 0.0
var _lunge_cd := 0.0
## (the Lunge's wait in full, as its words made it when it was last used)
var _lunge_full := 4.0
var _lunge := {}
var _landing := false
var _clock := 0.0
var _step_in := 0.0
var _flash := 0.0
var _shake := 0.0
## (render/fx.ts shake: the screen kicked so many game pixels, falling off 22 a second; a film's jolts kick it: kick())
var _kick := 0.0
## (game.ts slowT, slowBy: the Shade's rime underfoot, a while and how much slower he walks)
var _slow_t := 0.0
var _slow_by := 0.0
## (game.ts held: hooked by the Chained One, for so many seconds more he cannot walk or dodge: he goes where he is dragged.
## chained.gd sets it)
var held := 0.0
var _down_for := 0.0


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.centered = false
	add_child(_sprite)
	_cam = Camera2D.new()
	# (render.ts: the hero stands 12 game pixels below the middle of the screen)
	_cam.offset = Vector2(0, -24)
	add_child(_cam)
	_cam.make_current()
	home = world
	_turn(face)
	_place()
	_show()


## His most life (loot.gd derive): what he had more of comes with it, as the game's derive does.
func set_max_life(v: float) -> void:
	var was := max_life
	max_life = v
	life = minf(life + maxf(0.0, v - was), v)


## Strike's blows a second, with its words: Swift in front faster, Heavy in front slower (game.ts useBasic: never fewer than
## 0.3 a second); chilled by a monster's Frost, slower by half the chill.
func rate() -> float:
	# (Frenzied: the frenzy makes the quick attack faster)
	var r := maxf(0.3, float(loadout.r(0)["rate"])) * frenzy_pace()
	if chill_t > 0.0:
		r *= 1.0 - chill_k * 0.5
	return r


## His pace on his feet, tiles a second (game.ts walkPace): his own and his gear's, quickened by his haste; chilled by a
## monster's Frost, slower by the chill's share; in the Shade's rime, slower by its.
func walk_pace() -> float:
	var sp: float = SPEED * (1.0 + stats["move_speed"] / 100.0) * (1.0 + haste / 100.0)
	if chill_t > 0.0:
		sp *= 1.0 - chill_k
	if _slow_t > 0.0:
		sp *= 1.0 - _slow_by
	return sp


## FRENZIED (game.ts frenzyPace): how much faster the frenzy makes his Strike and every wait of his moves; 1, no frenzy.
func frenzy_pace() -> float:
	return 1.0 + float(Words.data()["frenzy"]["each"]) * frenzy


## (game.ts `after`) `fn` done `t` seconds from now, on the hero's clock.
func _after(t: float, fn: Callable) -> void:
	_later.append({"t": t, "fn": fn})


## What was to be done now is done (game.ts updateTimers).
func _run_later(dt: float) -> void:
	if _later.is_empty():
		return
	var due: Array = []
	for q in _later:
		q["t"] -= dt
		if q["t"] <= 0.0:
			due.append(q)
	if due.is_empty():
		return
	_later = _later.filter(func(q): return q["t"] > 0.0)
	for q in due:
		q["fn"].call()


## How long into a Strike its blow lands (useBasic): its wind-up, never more than two fifths of the time between blows.
func _strike_windup() -> float:
	return minf(STRIKE["windup"], 0.4 / rate())


# --- his words in the fight ---

## What he tells of what his rules have done (fx.gd: the game's own telling; a place may have none).
func _tell(e: Dictionary) -> void:
	if fx != null:
		fx.event(e)


## How much more his gear makes of a hit of that element, % (game.ts hitMonster `el`): a plain blow his Physical Damage, a
## word's element its own.
func _el_pct(el: String) -> float:
	match el:
		"fire":
			return stats.get("fire_pct", 0.0)
		"frost":
			return stats.get("frost_pct", 0.0)
		"lightning":
			return stats.get("light_pct", 0.0)
	return stats.get("phys_pct", 0.0)


## The least and the most of a hit of his of that element before what multiplies it (game.ts baseFor): his weapon's, and
## what his gear adds flat to that element's hits (items.ts FLAT_PAIRS: loot.gd gives none of those yet, so the weapon's).
func base_for(el: String) -> Array:
	var k := {"fire": "fire", "frost": "frost", "lightning": "light"}.get(el, "") as String
	var lo: float = stats["dmg_min"] + (stats.get(k + "_min", 0.0) if k != "" else 0.0)
	var hi: float = stats["dmg_max"] + (stats.get(k + "_max", 0.0) if k != "" else 0.0)
	return [lo, hi]


## The average of one hit of move `i`, `frac` of it, as his numbers and his might stand, before a critical (game.ts avgHit):
## what the ground a move leaves is sized by.
func avg_hit(i: int, frac: float) -> float:
	var r: Dictionary = loadout.r(i)
	var base := base_for(r["element"])
	return (base[0] + base[1]) / 2.0 * float(r["dmg_mult"]) * frac * (1.0 + (stats["dmg_pct"] + _el_pct(r["element"]) + might) / 100.0)


## ONE HIT OF MOVE `i` ON A MONSTER, `frac` of it, with everything a word in front adds (game.ts hitMonster, in its order).
## `quiet`: a splash's hit, or the fourth and later of an area's: no lightning jumps from it and it carries no weight of
## Power; all else it does as any hit.
## (Left out, with the game's switches for them: the talents' and uniques' multipliers and certain criticals, Avalanche,
## Prismheart, Thunder, the Rot Axe, the melds, the Warlock, Splitting, Giant Slayer, Kindling, Deep Freeze, Blight, Hexing,
## Stilling, the Warhammer's stuns and staggers, Rend, Widowfall, Binding, Bleeding, Culling, Forking, the shock that Overload
## works on, Charged.)
func hit_monster(m, i: int, frac: float, quiet: bool) -> void:
	# (what is shut in a room is out of reach; one still crawling up out of the ground is only a picture)
	if not is_instance_valid(m) or m.dead or m.state == "rise" or monsters.shut_in(m):
		return
	# (FLOOR 3: the Boneward behind its shield: a blow from before it glances off, and does nothing)
	if m.glances(world):
		m.glance()
		return
	var r: Dictionary = loadout.r(i)
	var el: String = r["element"]
	var base := base_for(el)
	# (FERVOR, melds.gd: its kills burning hotter a while)
	var dmg: float = randf_range(base[0], base[1]) * float(r["dmg_mult"]) * frac * (1.0 + (stats["dmg_pct"] + _el_pct(el) + melds.fervor_pct(el) + might) / 100.0)
	var crit: bool = randf() * 100.0 < stats["crit_chance"]
	# PRECISE behind: his next hit on a marked enemy is a certain critical, and spends the mark
	var spent: bool = m.mark_t > 0.0
	if spent:
		crit = true
		m.mark_t = 0.0
	if crit:
		dmg *= 1.0 + stats["crit_mult"] / 100.0
	# (WORDMELDING: Avalanche behind, a hit on a chilled enemy hits harder: melds.gd)
	dmg = melds.avalanche(m, r, dmg, quiet)
	dmg = maxf(1.0, roundf(dmg))
	var at: Vector2 = m.world
	# (WORDMELDING: what it was before this hit, for Scald's crack and Cauterize)
	var was_burning: bool = m.burn_t > 0.0
	var was_chilled: bool = m.chill_t > 0.0
	# FLAME in front: what it strikes burns for `ignite` of the hit more, over 3 s (LASTING: as hard a second, for longer;
	# FLEETING: harder a second, the same in all in its shorter time)
	if r["ignite"] > 0.0:
		m.set_alight(dmg * float(r["ignite"]) / 3.0 * float(r["pace"]), 3.0 * float(r["last"]))
	# FROST in front: it is chilled; a second chilling hit freezes it
	if r["chill"] > 0.0:
		m.chill_by(r["chill"])
	# (WORDMELDING: Thunder in front, one big bolt out of the sky in place of the arcs)
	melds.thunder_bolt(r, at, quiet)
	var front: Array = [] if quiet else loadout.wfronts(i)
	# (LEECH behind: what it strikes, still alive, is marked for the harvest)
	if r["orb_chance"] > 0.0 and not quiet:
		_tell({"t": "mark", "x": at.x, "y": at.y})
	# (lightning comes down on the one it hits before it jumps to the others)
	if r["arcs"] > 0 and not quiet:
		_tell(Melds.tag(r, {"t": "arc", "x0": at.x, "y0": at.y, "x1": at.x, "y1": at.y, "sky": true}))
	if spent:
		_tell({"t": "markSpent", "id": m.id, "x": at.x, "y": at.y, "dx": at.x - world.x, "dy": at.y - world.y})
	m.damage(dmg, el, crit, not quiet and front.has("power"), front, false, false, i)
	# VAST behind: each hit, not a splash's, splashes a share of itself onto every other enemy near what it hit
	if r["vast"] > 0.0 and not quiet:
		var reach: float = Words.data()["vast"]["splashR"]
		var ids: Array = []
		for o in monsters.list:
			if not is_instance_valid(o) or o == m or o.dead or monsters.shut_in(o) or o.world.distance_to(at) > reach + o.r:
				continue
			ids.append(o.id)
			o.damage(maxf(1.0, roundf(dmg * float(r["vast"]))), el, false, false, [], false, false, i)
		if not ids.is_empty():
			_tell({"t": "vastSplash", "x": at.x, "y": at.y, "r": reach, "ids": ids, "el": el})
	# (WORDMELDING, THE EIGHT ACROSS THE GROUPS: Shiver, a critical hit freezes; Sunder; Cauterize and Fervor, a kill: melds.gd)
	melds.struck8(m, i, crit, was_burning)
	# POISON in front: each hit adds a dose of `poison` of the hit a second (and what his gear adds to a hit that poisons, over
	# the poison's time: items.ts POISON_DMG, which loot.gd does not give yet); LASTING and FLEETING as for burning; BLIGHT in
	# front, its poison biting harder the lower the enemy's life
	var dose: float = dmg * float(r["poison"]) * Melds.blight_k(r, m) * float(r["pace"]) if r["poison"] > 0.0 else 0.0
	var p_min: float = stats.get("poison_min", 0.0)
	var p_max: float = stats.get("poison_max", 0.0)
	if dose > 0.0 and (p_min != 0.0 or p_max != 0.0):
		dose += randf_range(p_min, maxf(p_min, p_max)) / float(Words.data()["poison"]["time"])
	if dose > 0.0:
		m.dose(dose, float(Words.data()["poison"]["time"]) * float(r["last"]))
	# (WORDMELDING: the melded word's twist on this hit, in front and behind: melds.gd)
	if r["meld"] != null or r["meld_behind"] != null:
		melds.hit(m, i, dmg, at, quiet, was_burning, was_chilled)
	if not m.dead:
		# PRECISE behind marks the first enemy each use hits (not one whose mark this very hit spent)
		if r["mark"] and not spent and _marked[i] != uses[i]:
			_marked[i] = uses[i]
			m.mark_t = float(Words.data()["precise"]["markTime"])
			_tell({"t": "markOn", "id": m.id, "x": at.x, "y": at.y, "secs": m.mark_t})
		# HEAVY in front stuns what it hits; gear with Heavy burned into it may stun too (its chance, 50% at most: none yet here)
		var heavy: Dictionary = Words.data()["heavy"]
		if r["stun"] > 0.0:
			m.stun_for(r["stun"], "thunder" if r["meld"] == "thunder" else "")
		else:
			var chance: float = minf(float(heavy["stunCap"]), stats.get("stun_chance", 0.0))
			if chance > 0.0 and randf() * 100.0 < chance:
				m.stun_for(float(heavy["stun"]))
	# LEECH in front: life back for every enemy it hits (LEECH.cap: none, a second, in the game as it starts)
	if r["leech"] > 0.0:
		heal_flat(r["leech"])
		_tell({"t": "leech", "x": at.x, "y": at.y, "n": r["leech"]})
	heal_flat(stats["life_on_hit"])
	# LIGHTNING in front: it jumps to the nearest other enemies, and on from each (monsters.gd arcs)
	if r["arcs"] > 0 and not quiet:
		monsters.arcs(m, int(r["arcs"]), maxf(1.0, roundf(dmg * float(r["arc_dmg"]))), i, r["meld"] if r["meld"] != null else "")


## "of Power" behind move `i` (game.ts landed): a blow of it has landed on an enemy, and his might grows by the word's share,
## five blows' worth at most, and lasts 5 s from now. Once for each blow that lands, however many it catches: a Whirlwind's
## turn through five skeletons is one.
func _landed_on(i: int) -> void:
	var more: float = loadout.r(i)["might"]
	if more <= 0.0:
		return
	might = minf(more * 5.0, might + more)
	# (LASTING and FLEETING: as long as everything its move gives)
	might_t = maxf(might_t, 5.0 * float(loadout.r(i)["last"]))
	boost_by["might"] = i
	_tell({"t": "buff", "kind": "might", "x": world.x, "y": world.y, "stacks": maxi(1, roundi(might / more))})


## What a use of move `i` gives him from the words behind it (game.ts boons): "of Swiftness", his haste, for 3 s. Once a use.
func _boons(i: int) -> void:
	var r: Dictionary = loadout.r(i)
	var fast: float = r["haste"]
	if fast > 0.0:
		haste = fast
		haste_t = 3.0 * float(r["last"])
		boost_by["haste"] = i
		_tell({"t": "buff", "kind": "haste", "x": world.x, "y": world.y, "stacks": 1, "secs": haste_t})
	# FRENZIED in front: each use adds to the frenzy, up to its most, and holds it a while longer
	if r["frenzy"]:
		var F: Dictionary = Words.data()["frenzy"]
		frenzy = mini(int(F["max"]), frenzy + 1)
		frenzy_t = maxf(frenzy_t, float(F["hold"]) * float(r["last"]))
		boost_by["frenzy"] = i
		_tell({"t": "frenzy", "x": world.x, "y": world.y, "dx": face.x, "dy": face.y, "n": frenzy})
	# GUARDING in front: each use gives a shield (a new one never weaker than what is left of the last)
	if r["shield"] > 0.0:
		shield = maxf(shield, roundf(max_life * float(r["shield"])))
		shield_t = float(Words.data()["guard"]["shieldTime"]) * float(r["last"])
		boost_by["shield"] = i
		_tell({"t": "shield", "x": world.x, "y": world.y, "secs": shield_t})


## AN ENEMY IS KILLED (game.ts kill: what the killing move's words add, by the move that last struck it): FRENZIED behind, a
## stack more and the frenzy held longer (to three times its hold); VOLATILE in front, it explodes; LEECH behind, now and then
## a life orb. (monster.gd _die calls this as it falls.)
func killed(m) -> void:
	var i: int = m.last_skill
	if i < 0 or i > 2:
		return
	var r: Dictionary = loadout.r(i)
	if r["frenzy_feed"]:
		var F: Dictionary = Words.data()["frenzy"]
		frenzy = mini(int(F["max"]), frenzy + 1)
		frenzy_t = minf(float(F["hold"]) * 3.0 * float(r["last"]), frenzy_t + float(F["hold"]) * float(r["last"]))
		boost_by["frenzy"] = i
		_tell({"t": "frenzyFed", "x": m.world.x, "y": m.world.y})
	if r["volatile"] > 0.0:
		_explode(m, r, i)
	# (WORDMELDING: Shatter in front, a frozen one bursts into shards; Rupture, a poisoned one bursts its poison: melds.gd)
	if r["meld"] != null:
		melds.killed(m, r, i)
	if r["orb_chance"] > 0.0 and randf() < float(r["orb_chance"]):
		if monsters != null and monsters.loot != null:
			monsters.loot.orb_at(m.world)
		_tell({"t": "orb", "x": m.world.x, "y": m.world.y})
		sfx.play("leech", linear_to_db(0.7))


## VOLATILE in front (game.ts explodeKill): what move `i` killed explodes a moment after, for the word's share of the dead one's
## life, harming what is round it.
func _explode(m, r: Dictionary, i: int) -> void:
	# (VOLATILE'S MELDS: Demolition's bigger, Powderkeg's and Chain Reaction's: melds.gd explode, the game's explodeKill)
	if r["meld"] != null:
		melds.explode(m, r, i)
		return
	var at: Vector2 = m.world
	var rad := 1.8
	var hurt := maxf(1.0, roundf(float(m.max_life) * float(r["volatile"])))
	var el: String = r["element"]
	_after(0.12, func() -> void:
		_tell({"t": "burst", "x": at.x, "y": at.y, "r": rad, "el": el, "style": "blast", "words": ["volatile"]})
		sfx.play("explode", linear_to_db(0.6))
		if monsters == null:
			return
		for o in monsters.list.duplicate():
			if is_instance_valid(o) and not o.dead and o != m and o.world.distance_to(at) <= rad + o.r:
				o.damage(hurt, el, false, false, [], false, false, i))


## The words on move `i` told as it is made (game.ts deliver, beginChannel, useEvasive: `cast`), where it has any: from `at`,
## the way `way`; `kind` the game's name for what sort of move it is.
func _cast(i: int, kind: String, at: Vector2, way: Vector2, echo := false) -> void:
	var front: Array = loadout.wfronts(i)
	var behind: Array = loadout.wbehinds(i)
	if front.is_empty() and behind.is_empty() and not echo:
		return
	_tell({"t": "cast", "x": at.x, "y": at.y, "dx": way.x, "dy": way.y, "kind": kind, "el": loadout.r(i)["element"], "words": front, "behind": behind, "echo": echo})


## LASTING's shimmer and FLEETING's flick, on top of the move they change, where it makes, lays or gives something they work on
## (game.ts timeWordSound).
func _time_word_sound(i: int) -> void:
	var r: Dictionary = loadout.r(i)
	if absf(float(r["last"]) - 1.0) < 0.001:
		return
	var makes: bool = i == 1 or r["zone"] != null or r["cloud"] > 0.0 or r["cracks"] > 0.0 or r["ward"] > 0.0
	var lays: bool = r["poison"] > 0.0 or r["element"] == "fire" or r["ignite"] > 0.0
	var gives: bool = r["might"] > 0.0 or r["haste"] > 0.0 or r["frenzy"] or r["frenzy_feed"] or r["shield"] > 0.0
	if makes or lays or gives:
		sfx.play("word_lasting" if float(r["last"]) > 1.0 else "word_fleeting", -6.0)


## TWIN behind ("of Echoes") on move `i` (game.ts echoOf): it is told now, and `again` is done a moment later, its words told as
## the phantom lets go; `kind` the game's name for the move.
func _echo_of(i: int, kind: String, at: Vector2, way: Vector2, again: Callable) -> void:
	var delay: float = Words.data()["echo"]["delay"]
	_tell({"t": "echo", "x": at.x, "y": at.y, "dx": way.x, "dy": way.y, "kind": kind, "delay": delay})
	_after(delay, func() -> void:
		_cast(i, kind, at, way, true)
		again.call())


## What a blow of move `i` reaches of the things on the floor, within `rad` of `at` (game.ts breakProps): the barrels and urns
## are broken; a sealed door there opens if the move carries its word, in front or behind (unseal).
func _break_props(i: int, at: Vector2, rad: float) -> void:
	if props != null and is_instance_valid(props):
		props.strike(at, rad)
	if pillars != null and is_instance_valid(pillars):
		pillars.struck(at, rad)
	if doors != null and is_instance_valid(doors):
		doors.unseal({"front": loadout.wfronts(i), "behind": loadout.wbehinds(i)}, at, rad)


## WHAT MOVE `i` LEAVES where it struck (game.ts wake, leavePatches): the ground of an element behind it, no smaller than a
## tile round; Poison's cloud, no smaller than a tile and a half; Heavy's cracked ground, no smaller than a tile. `frac`: the
## share of the move's hit that the ground and the cloud are sized by.
func _wake(i: int, at: Vector2, rad: float, frac: float) -> void:
	if wakes == null or not is_instance_valid(wakes):
		return
	var r: Dictionary = loadout.r(i)
	# (WORDMELDING: what a melded word behind leaves is its own, its twist and all: wakes.gd)
	if r["zone"] != null:
		wakes.add_ground(r["zone"], i, at, maxf(1.0, rad), avg_hit(i, frac), r["meld_behind"])
	# (LASTING and FLEETING: what it leaves lasts longer or shorter, Fleeting's doing as much in all)
	if r["cloud"] > 0.0:
		wakes.add_cloud(i, at, maxf(1.5, rad), avg_hit(i, frac) * float(r["cloud"]) * float(r["pace"]), 5.0 * float(r["last"]), r["meld_behind"])
	# VOLATILE behind: a rune, where it struck, that goes off a moment later (game.ts addRune)
	if r["rune"] > 0.0:
		wakes.add_rune(i, at, 2.0 * float(r["size"]), avg_hit(i, frac) * float(r["rune"]), r["element"], r["meld_behind"])
	if r["cracks"] > 0.0:
		wakes.add_cracks(i, at, maxf(1.0, rad), float(r["cracks"]) * float(r["last"]))
	# GUARDING behind: a ward circle (game.ts leavePatches, addPatch 'ward')
	if r["ward"] > 0.0:
		wakes.add_ward(i, at, maxf(1.5, rad), float(Words.data()["guard"]["wardTime"]) * float(r["last"]), r["ward"])


## ONE MELEE HIT of move `i` from `from` the way `way` (game.ts strike): the best one before him, nearest and most in front,
## is hit; a move whose words give it a splash strikes every other one round that one, quietly, for the splash's share; then
## what the move leaves, round what it struck. A swing that meets nothing still leaves its wake where the blade passed.
func _strike(i: int, from: Vector2, way: Vector2, frac: float, n := 0, echo := false) -> void:
	var r: Dictionary = loadout.r(i)
	var reach: float = STRIKE["reach"] * float(r["size"])
	var front: Array = loadout.wfronts(i)
	_tell({"t": "swing", "x": from.x, "y": from.y, "dx": way.x, "dy": way.y, "reach": reach, "el": r["element"], "words": front, "n": n, "echo": echo})
	var best = monsters.strike_target(from, way, reach) if monsters != null else null
	_break_props(i, from + way * reach * 0.6, 0.9)
	if best == null:
		var past := from + way * reach * 0.75
		if map.open_at(floori(past.x), floori(past.y)):
			_wake(i, past, 1.0, frac)
		return
	var at: Vector2 = best.world
	hit_monster(best, i, frac, false)
	_landed_on(i)
	if front.has("power"):
		sfx.play("power", -6.0)
	else:
		sfx.play("hit", -4.0)
	if front.has("heavy"):
		_tell({"t": "heavy", "x": at.x, "y": at.y, "r": 1.1, "big": false})
	if r["splash"] > 0.0:
		var rad: float = float(r["splash"]) * float(r["size"])
		# (a full-strength splash is an explosion, Flame's and Frost's; Power's is a shock through the ground)
		_tell(_vast_edge(r, rad, {"t": "burst", "x": at.x, "y": at.y, "r": rad, "el": r["element"], "style": "blast" if r["splash_dmg"] >= 1.0 else "shock", "words": front, "n": n, "echo": echo}))
		for o in monsters.list:
			if not is_instance_valid(o) or o.dead or o == best:
				continue
			if o.world.distance_to(at) <= rad + o.r:
				hit_monster(o, i, frac * float(r["splash_dmg"]), true)
	_wake(i, at, 1.0, frac)


## AN AREA HIT of move `i`: everything within `rad` of `at` (game.ts blast), `style` the game's name for it ("whirl": a turn
## of the Whirlwind; "land": the Lunge's landing). The first three struck are hit in full; the fourth and those after,
## quietly. `leaves`: whether it leaves what the words behind the move leave. `db`: how loud what it strikes sounds. How many
## it struck.
func _blast(i: int, at: Vector2, rad: float, frac: float, style: String, leaves: bool, db: float, n := 0, echo := false) -> int:
	var r: Dictionary = loadout.r(i)
	var front: Array = loadout.wfronts(i)
	_tell(_vast_edge(r, rad, {"t": "burst", "x": at.x, "y": at.y, "r": rad, "el": r["element"], "style": style, "words": front, "n": n, "echo": echo}))
	if front.has("power"):
		sfx.play("power", -4.0)
	# (Heavy lands out to the blast's edge; a whirlwind's turns are too many for that, its stuns show it)
	if front.has("heavy") and style != "whirl":
		_tell({"t": "heavy", "x": at.x, "y": at.y, "r": rad, "big": true})
	var hits := 0
	if monsters != null:
		for m in monsters.list:
			if not is_instance_valid(m) or m.dead or m.state == "rise":
				continue
			if m.world.distance_to(at) <= rad + m.r and not monsters.shut_in(m):
				hit_monster(m, i, frac, hits >= 3)
				hits += 1
	if hits > 0:
		_landed_on(i)
		# (what it struck sounds by the blow's element)
		sfx.play({"fire": "fire", "frost": "frost", "lightning": "zap"}.get(r["element"], "hit"), db)
	_break_props(i, at, rad)
	if leaves:
		_wake(i, at, rad, frac)
	return hits


## (VAST in front, game.ts vastEdge) What an area of move `r` that lands `rad` wide says of itself: `r0`, where its edge would
## have been without the word (its look cracks the floor there and rolls its dust out to the new edge). Nothing where it does
## not carry it.
func _vast_edge(r: Dictionary, rad: float, told: Dictionary) -> Dictionary:
	if float(r["wide"]) > 1.0:
		told["r0"] = rad / float(r["wide"])
	return told


func heal_flat(n: float) -> void:
	if n > 0.0 and alive:
		life = minf(max_life, life + n)


func _process(dt: float) -> void:
	_clock += dt
	_flash = maxf(0.0, _flash - dt)
	_shake = maxf(0.0, _shake - dt)
	_kick = maxf(0.0, _kick - dt * 22.0)
	_slow_t = maxf(0.0, _slow_t - dt)
	_invuln = maxf(0.0, _invuln - dt)
	# (Frenzied: the frenzy makes every wait come round faster: game.ts updateHero)
	_whirl_cd = maxf(0.0, _whirl_cd - dt * frenzy_pace())
	_lunge_cd = maxf(0.0, _lunge_cd - dt * frenzy_pace())
	_run_later(dt)
	# (WORDMELDING: Implode's bursts to come, Fervor's time: melds.gd)
	melds.step(dt)
	_cam.offset = Vector2(0, -24 - _lift) + lean + (Vector2(randf_range(-3, 3), randf_range(-3, 3)) if _shake > 0.0 else Vector2.ZERO)
	if _kick > 0.3:
		_cam.offset += Vector2(roundf(randf_range(-_kick, _kick)), roundf(randf_range(-_kick, _kick) * 0.6)) * 2.0
	if not alive:
		_down_for += dt
		_sprite.modulate.a = clampf(1.0 - _down_for, 0.0, 1.0)
		if _down_for >= BACK_AFTER:
			_back()
		return
	life = minf(max_life, life + stats["life_regen"] * dt)
	# (his might and his haste run out: game.ts updateHero)
	if might_t > 0.0:
		might_t -= dt
		if might_t <= 0.0:
			might = 0.0
	if haste_t > 0.0:
		haste_t -= dt
		if haste_t <= 0.0:
			haste = 0.0
	# (the frenzy and his shield run out)
	if frenzy_t > 0.0:
		frenzy_t -= dt
		if frenzy_t <= 0.0:
			frenzy_t = 0.0
			frenzy = 0
	if shield_t > 0.0:
		shield_t -= dt
		if shield_t <= 0.0:
			shield_t = 0.0
			shield = 0.0
	# (what the monsters' words left on him runs down: game.ts updateHero)
	if chill_t > 0.0:
		chill_t -= dt
	if shock_t > 0.0:
		shock_t -= dt
	if burn_t > 0.0:
		burn_t -= dt
	if poison_t > 0.0:
		poison_t -= dt
	_t += dt
	var d := (Vector2.ZERO if scene_pace > 0.0 else Input.get_vector("move_left", "move_right", "move_up", "move_down")) + auto_dir
	var way := Iso.screen_dir_to_world(d)
	# (HOOKED by the Chained One: he cannot walk or dodge, he goes where he is dragged; he may strike still)
	var hooked := held > 0.0
	if hooked:
		held = maxf(0.0, held - dt)
		way = Vector2.ZERO

	# THE LUNGE: whatever he is doing, it breaks off (useEvasive), and he is in the air till he lands
	var lunge_at := auto_lunge
	auto_lunge = Vector2.INF
	if Input.is_action_just_pressed("lunge") and scene_pace <= 0.0:
		lunge_at = _pointer(way, LUNGE["range"])
	if lunge_at != Vector2.INF and _lunge_cd <= 0.0 and _act != "lunge" and not hooked:
		_begin_lunge(lunge_at)
	if _act == "lunge":
		_fly(dt)
		_place()
		_show()
		queue_redraw()
		return

	# (knocked: carried the way he was struck over 0.12 s, walls stopping him: game.ts knockHero, his `step`)
	if _knock_t > 0.0:
		_slide(_knock * (minf(dt, _knock_t) / 0.12))
		_knock_t -= dt

	var strike_asked := (Input.is_action_just_pressed("attack") and scene_pace <= 0.0) or auto_attack
	var whirl_held := (Input.is_action_pressed("whirl") and scene_pace <= 0.0) or auto_whirl
	auto_attack = false
	if whirl_held and _whirl_cd <= 0.0 and (_act == "" or (_act == "strike" and _landed)):
		_begin_whirl()
	# (a Strike no sooner after the last was begun than his blows a second allow, whether he still stands in the last one or
	# has walked out of it: game.ts useBasic, `swingT`)
	elif strike_asked and ((_act == "" and _clock - _last_swing >= 1.0 / rate()) or (_act == "strike" and _act_t >= 1.0 / rate())):
		_begin_strike()

	var slow := 1.0
	var can_walk := _act == ""
	if _act != "":
		_act_t += dt
	match _act:
		"strike":
			if not _landed and _act_t >= _strike_windup():
				_land_strike()
			var done := int(_t * CLIP_FPS) >= art.count(_side, _list)
			if done or (_landed and _act_t >= _strike_windup() + STRIKE["follow"] and way != Vector2.ZERO):
				_end_act()
				can_walk = true
		"whirl":
			_spin(dt, whirl_held)
			# (he walks on while he spins, at 90%, not turning to his way: he is turning on the spot)
			can_walk = true
			slow = WHIRL["walk"]

	if can_walk and way != Vector2.ZERO:
		if _act == "":
			_turn(way)
		var was := world
		var walk_was := world
		# (his pace: his own, his gear's, his haste while it lasts, a chill and the rime: game.ts walkPace)
		_slide(way * walk_pace() * slow * dt * (scene_pace if scene_pace > 0.0 else 1.0))
		walked += world.distance_to(walk_was)
		# (the Lockdown's bars, standing, keep him on his side of them as he walks: action_f1.ts cageHero)
		if monsters != null and monsters.perils != null:
			world = monsters.perils.cage(was, world, RADIUS)
		_landing = false
		if _act == "":
			_set_list(BakedHero.WALK)
		_step_in -= dt
		if _step_in <= 0.0:
			_step_in = STEP_EVERY
			sfx.play("step_stone", -8.0)
	elif _act == "":
		_step_in = 0.0
		if _landing and int(_t * CLIP_FPS) < art.count(_side, LAND_LIST):
			pass
		else:
			_landing = false
			_set_list(BakedHero.IDLE)
	_place()
	_show()
	queue_redraw()


# --- Strike ---

func _begin_strike() -> void:
	_aim_at_foe()
	var combo := _clock - _last_swing <= 1.0 / rate() + STRIKE["combo"] and not _combo_next
	_combo_next = combo
	_last_swing = _clock
	_start(BakedHero.ATTACK2 if combo and art.count(_side, BakedHero.ATTACK2) > 0 else BakedHero.ATTACK, "strike")
	_slide(face * STRIKE["step"])


## The blow lands (game.ts release, deliver): its words told, the hit made from where he has got to, the way he faces
## (_strike), and then what a use of it gives him (Swift behind: his haste).
func _land_strike() -> void:
	_landed = true
	sfx.play("swing", -6.0)
	uses[0] += 1
	_deliver_strike(world, face, 1.0, true)


## STRIKE MADE (game.ts deliver, a melee move): from `from` the way `way`, `frac` of it. TWIN in front: two blows, each for its
## share, the second a moment after the first from wherever he has got to. Made in earnest (`primary`), what a use of it gives
## him (_boons); and TWIN behind, "of Echoes": a phantom makes it again from where it was made, a moment later, for its share
## (not primary: no boons, no echo of an echo).
func _deliver_strike(from: Vector2, way: Vector2, frac: float, primary: bool) -> void:
	var r: Dictionary = loadout.r(0)
	var each: float = frac * float(r["count_dmg"])
	var echo := not primary
	_cast(0, "melee", from, way, echo)
	if primary:
		_time_word_sound(0)
	for k in int(r["count"]):
		if k == 0:
			_strike(0, from, way, each, 0, echo)
		else:
			_after(0.13 * k, func() -> void: _strike(0, from if echo else world, way, each, k, echo))
	if primary:
		_boons(0)
		if r["echo"] > 0.0:
			var delay: float = Words.data()["echo"]["delay"]
			_tell({"t": "echo", "x": from.x, "y": from.y, "dx": way.x, "dy": way.y, "kind": "melee", "delay": delay})
			_after(delay, func() -> void: _deliver_strike(from, way, frac * float(loadout.r(0)["echo"]), false))


# --- Whirl ---

## The Whirlwind as it is held (game.ts Hero.channel, for the three's looks: fx_words10.gd): {skill: 1, t: how long it has
## spun}, or {} while none is held (its wind-up, its follow-through once let go, and any other time).
func channel() -> Dictionary:
	if _act == "whirl" and _spun >= 0.0 and not _landed:
		return {"skill": 1, "t": _spun}
	return {}


func _begin_whirl() -> void:
	_whirl_cd = float(loadout.r(1)["cooldown"])
	_whirl_full = _whirl_cd
	_bites = 0
	_next_bite = 0.0
	_spun = -1.0
	_whirl_wake = 0.0
	_start(WHIRL_LIST, "whirl")


## game.ts updateChannel: is it over (let go after its first cut, or run its length)? then its cut, if one is due; then
## time passes; he turns on the spot. Over, its wait is all of it after a whole length, less after a shorter one.
## Its cut (channelBite): all within its radius, as its words make it, struck (_blast); what the words behind it leave, it
## leaves round him by its first cut and by the first cut after each second it has gone on (TUNE.channelWake).
func _spin(dt: float, held: bool) -> void:
	# (LASTING and FLEETING: held longer or shorter; Fleeting's turns coming faster, as many in all)
	var r1: Dictionary = loadout.r(1)
	var length: float = WHIRL["channel"] * float(r1["last"])
	var tick: float = WHIRL["tick"] / float(r1["pace"])
	if _spun >= 0.0 and _spun >= length + WHIRL["follow"]:
		_end_act()
		return
	if _act_t < WHIRL["windup"]:
		return
	if _spun < 0.0:
		# (it begins: its words told, and what a use of it gives him given once, now: game.ts beginChannel)
		_spun = 0.0
		uses[1] += 1
		_time_word_sound(1)
		_cast(1, "whirl", world, face)
		_boons(1)
	if _landed:
		# (let go: the rest of its follow-through, standing out of the spin)
		_spun += dt
		if _spun >= _stopped_at + WHIRL["follow"]:
			_end_act()
		return
	if _bites > 0 and (not held or _spun >= length - 1e-6):
		_end_channel(true)
		return
	if _next_bite <= 1e-9:
		var leaves := _spun >= _whirl_wake - 1e-9
		if leaves:
			_whirl_wake += WHIRL["wake"]
		_bite(world, face, 1.0, false, leaves)
		_bites += 1
		_next_bite += tick
	_spun += dt
	_next_bite -= dt
	var a := atan2(face.y, face.x) + WHIRL["spin"] * TAU * dt
	face = Vector2(cos(a), sin(a))


## The Whirlwind is over (game.ts endChannel: let go, run its length, or broken off by his Lunge): its wait begins, all of it
## after a whole length, less after a shorter one (never less than 35% of it). `echoes`: TWIN behind, "of Echoes", a phantom
## carries it on for a moment from where it stopped, its turns for the word's share.
func _end_channel(echoes: bool) -> void:
	var r: Dictionary = loadout.r(1)
	var length: float = WHIRL["channel"] * float(r["last"])
	_landed = true
	_stopped_at = _spun
	var k := clampf(_spun / length, WHIRL["min_cool"], 1.0)
	_whirl_cd = float(r["cooldown"]) * k
	_whirl_full = _whirl_cd
	if echoes and float(r["echo"]) > 0.0 and _bites > 0:
		var at := world
		var way := face
		var E: Dictionary = Words.data()["echo"]
		_tell({"t": "echo", "x": at.x, "y": at.y, "dx": way.x, "dy": way.y, "kind": "whirl", "delay": E["delay"]})
		_after(float(E["delay"]), func() -> void: _cast(1, "whirl", at, way, true))
		for n in int(E["bites"]):
			_after(float(E["delay"]) + n * WHIRL["tick"], func() -> void: _bite(at, way, float(loadout.r(1)["echo"]), true, false))


## One turn of the Whirlwind (game.ts channelBite): all within its radius, from `at`, struck for `frac` of it (TWIN in front:
## twice, each for its share, the second a moment after the first from wherever he has got to); `leaves`: this turn leaves
## what the words behind it leave. `echo`: a phantom's.
func _bite(at: Vector2, way: Vector2, frac: float, echo: bool, leaves: bool) -> void:
	var r: Dictionary = loadout.r(1)
	var each: float = frac * float(r["count_dmg"])
	var rad: float = WHIRL["radius"] * float(r["size"])
	sfx.play("whirl", linear_to_db(0.35 / 0.6) - 6.0 if echo else -6.0)
	for k in int(r["count"]):
		if k == 0:
			_blast(1, at, rad, each, "whirl", leaves, -8.0, 0, echo)
		else:
			_after(0.12 * k, func() -> void: _blast(1, at if echo else world, rad, each, "whirl", false, -8.0, k, echo))


# --- Lunge ---

## Where the pointer means him to go, in tiles: the mouse's point on the floor; or, if the mouse is on him or there is no
## mouse, as far as `reach` the way he goes (or faces).
func _pointer(way: Vector2, reach: float) -> Vector2:
	var at := Iso.to_world(get_global_mouse_position())
	if Input.get_connected_joypads().size() > 0 and Input.get_joy_axis(0, JOY_AXIS_LEFT_X) != 0.0:
		at = world
	if at.distance_to(world) < 0.9:
		var dir := way if way != Vector2.ZERO else face
		at = world + dir * reach
	return at


## game.ts useEvasive and reachPoint: no further than 6 tiles, stepped back 0.2 at a time till the spot is open floor in
## sight of him; less than half a tile and there is no room.
func _begin_lunge(target: Vector2) -> void:
	var to := target - world
	var dist := minf(to.length(), LUNGE["range"])
	if dist < 0.01:
		return
	var dir := to / to.length()
	var land := Vector2.INF
	while dist >= 0.5:
		var p := world + dir * dist
		if _clear(p.x, p.y) and (monsters == null or monsters.sees(world, p)):
			land = p
			break
		dist -= 0.2
	if land == Vector2.INF:
		return
	# (a Strike it breaks off before its blow has landed costs nothing, not even its turn: useEvasive, `swingT = 0`)
	if _act == "strike" and not _landed:
		_last_swing = -10.0
	# (a Whirlwind it breaks off ends there, and its wait begins; and "of Echoes" carries it on: useEvasive, endChannel(true))
	if _act == "whirl" and not _landed and _spun >= 0.0:
		_end_channel(true)
	uses[2] += 1
	_end_act()
	_combo_next = false
	_turn(dir)
	_lunge_cd = float(loadout.r(2)["cooldown"])
	_lunge_full = _lunge_cd
	_lunge = {"from": world, "to": land, "dur": 0.26 + dist * 0.03}
	_act = "lunge"
	_act_t = 0.0
	_list = LEAP_LIST
	_t = 0.0
	sfx.play("dodge", -4.0)
	# (its words told, and what a use of it gives him given as the move begins: game.ts useEvasive)
	_cast(2, "leap", world, dir)
	_boons(2)
	_time_word_sound(2)
	sfx.play("lunge", -6.0)


func _fly(dt: float) -> void:
	_act_t += dt
	_invuln = maxf(_invuln, LUNGE["invuln"])
	var k := clampf(_act_t / _lunge["dur"], 0.0, 1.0)
	world = _lunge["from"].lerp(_lunge["to"], k)
	if k >= 1.0:
		# (landing, game.ts land: a blow all round the point a tile before him, as its words make it, which leaves there what
		# the words behind it leave; then his landing, if he stands)
		sfx.play("slam", -4.0)
		_shake = 0.15
		# (TWIN in front: a second shock a moment later, a little wider; "of Echoes": a weaker one a moment after that)
		var r2: Dictionary = loadout.r(2)
		var at: Vector2 = world + face * LUNGE["ahead"]
		var rad: float = LUNGE["radius"] * float(r2["size"])
		var each: float = r2["count_dmg"]
		for n in int(r2["count"]):
			if n == 0:
				_blast(2, at, rad, each, "land", true, -4.0)
			else:
				_after(0.28 * n, func() -> void: _blast(2, at, rad * 1.15, each, "land", false, -4.0, n))
		if float(r2["echo"]) > 0.0:
			_echo_of(2, "leap", at, face, func() -> void: _blast(2, at, rad, float(loadout.r(2)["count_dmg"]) * float(loadout.r(2)["echo"]), "land", false, -4.0, 0, true))
		_act = ""
		_landing = true
		_list = LAND_LIST
		_t = 0.0


# --- the rest ---

## A blow made from the keys goes at the nearest monster awake close by; with the mouse, where it points.
func _aim_at_foe() -> void:
	if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
		var to := Iso.to_world(get_global_mouse_position()) - world
		if to.length() > 0.01:
			_turn(to.normalized())
	elif monsters != null:
		var m = monsters.nearest(world, AIM_REACH)
		if m != null:
			_turn((m.world - world).normalized())


func _start(list: int, act: String) -> void:
	_act = act
	_act_t = 0.0
	_landed = false
	_list = list
	_t = 0.0
	_landing = false


func _end_act() -> void:
	_act = ""
	_landed = false


## Knocked `dist` tiles the way `way` (a unit vector on the floor).
func knock(way: Vector2, dist: float) -> void:
	if _act == "lunge":
		return
	_knock = way * dist
	_knock_t = 0.12


func shake() -> void:
	_shake = 0.18


## Slowed for `secs` by `by` (a share of his pace): the Shade's rime while he stands in it (game/action_f2.ts).
func chill(secs: float, by: float) -> void:
	_slow_by = maxf(_slow_by if _slow_t > 0.0 else 0.0, by)
	_slow_t = maxf(_slow_t, secs)


## The screen kicked `amount` game pixels (render/fx.ts: fx.shake = max(fx.shake, amount)).
func kick(amount: float) -> void:
	_kick = maxf(_kick, amount)


## A plain blow, with no words: less his armour, or `raw`, before it (a trap's share of his life: game.ts stepSpikes, a dart).
func hurt(dmg: float, raw := false) -> void:
	hurt_by(dmg, "phys", [], {}, null, Vector2.INF, raw)


## How much his armour takes of the plain part of a blow (stats.ts armorReduction: armour / (armour + 40 + 20 a floor), at
## most 75%; the floor is never less than the first: game.ts `Math.max(1, this.power)`).
func armour_cut(ignored := 0.0) -> float:
	# (PRECISE, on a monster: its blows find the gaps in his armour, so much of it as if it were not there)
	var a: float = stats.get("armor", 0.0) * (1.0 - ignored)
	if a <= 0.0:
		return 0.0
	return minf(0.75, a / (a + 40.0 + 20.0 * maxf(1.0, float(map.depth) if map != null else 1.0)))


## What he withstands of an element, % (his gear's, capped: loot.gd derive): Flame, Frost; anything else not plain, Lightning's.
func resist(el: String) -> float:
	match el:
		"fire":
			return stats.get("res_fire", 0.0)
		"frost":
			return stats.get("res_frost", 0.0)
	return stats.get("res_light", 0.0)


## A BLOW ON HIM (game.ts hurtHero, step by step): `raw` before what he withstands, of element `el`, carrying `words`; `half`,
## a pack's minion's {words: its leader's it has at half, base: its kind's own element} (none given: read off `src`, the
## monster whose own blow it is); `from`, where a blow that has no monster behind it came from (a shot, a mark): the way
## Heavy knocks him. `bare`: before his armour (a trap's).
##   Nothing, in the air of his Lunge or while nothing harms him.
##   How much of each word's power it has: a minion's of its leader's words half; and where the word that made it Flame, Frost
##     or Lightning is one of those, only half the blow is of that element, the rest of the minion's own.
##   Its harm: its plain part less his armour, the others less what he withstands of each; a fifth more while he is shocked;
##     a whole number, 1 at least. HEAVY knocks him back a step (a minion's, half a step).
##   Then what it leaves: POISON, most of the blow again over 4 s, less what he withstands of poison, as hard as the harder of
##     what he has and this; each element of it: FLAME burns (three tenths of it over 3 s, a minion's half of Flame half as
##     hard), FROST chills (three tenths, for 2 s), LIGHTNING shocks (3 s).
## (Left out, with the game's switches for them: see the head of this file.)
func hurt_by(raw: float, el := "phys", words: Array = [], half := {}, src = null, from := Vector2.INF, bare := false) -> void:
	if not alive or _invuln > 0.0:
		return
	var by: Vector2 = world + face
	if src != null and is_instance_valid(src):
		by = src.world
	elif from != Vector2.INF:
		by = from
	var hv: Dictionary = half
	if hv.is_empty() and src != null and is_instance_valid(src) and src.has_method("half_of"):
		hv = src.half_of()
	# GUARDING burned into his gear: a chance to block the blow, which then does nothing at all (50% at most)
	var block: float = minf(float(Words.data()["guard"]["blockCap"]), stats.get("block_chance", 0.0))
	if block > 0.0 and randf() * 100.0 < block:
		# (RIME WARD: what he blocks, chilled: melds.gd)
		melds.blocked(src)
		_tell({"t": "blocked", "x": world.x, "y": world.y, "fromX": by.x, "fromY": by.y})
		_tell({"t": "text", "x": world.x, "y": world.y, "text": "Blocked", "color": "#9fe8c0"})
		sfx.play("hit", linear_to_db(0.5))
		last_blow = {"raw": raw, "el": el, "words": words, "blocked": true, "dmg": 0.0}
		return
	var hw: Array = hv.get("words", [])
	var k := func(w: String) -> float: return 0.0 if not words.has(w) else (PACK_MINION if hw.has(w) else 1.0)
	var base: String = hv.get("base", "phys")
	var el_k := PACK_MINION if not hv.is_empty() and el != base and hw.has(el) else 1.0
	var parts: Array = [[el, el_k], [base, 1.0 - el_k]] if el_k < 1.0 else [[el, 1.0]]
	var dmg := 0.0
	var each: Array = []
	var gaps: float = float(Words.data()["precise"]["armourIgnored"]) * float(k.call("precise"))
	for p in parts:
		var part: float = raw * float(p[1]) * (1.0 - ((0.0 if bare else armour_cut(gaps)) if p[0] == "phys" else resist(p[0]) / 100.0))
		each.append([p[0], p[1], part])
		dmg += part
	var shocked := shock_t > 0.0
	if shocked:
		dmg *= 1.2
	# GUARDING behind: inside a ward he takes less (the strongest ward he stands in)
	var ward := 0.0
	if wakes != null and is_instance_valid(wakes):
		for z in wakes.list:
			if z["kind"] == "ward" and world.distance_to(Vector2(z["x"], z["y"])) <= float(z["r"]):
				ward = maxf(ward, float(z["dmg"]))
	if ward > 0.0:
		dmg *= 1.0 - ward
	dmg = maxf(1.0, roundf(dmg))
	# HEAVY, on a monster: its blow knocks him back a step (game.ts knockHero)
	var knocked := 0.0
	if k.call("heavy") > 0.0:
		var d := world - by
		var way := d / d.length() if d.length() >= 0.01 else -face
		knocked = float(Words.data()["heavy"]["knock"]) * float(k.call("heavy"))
		knock(way, knocked)
	# GUARDING in front: his shield takes the blow first; all of it taken, nothing reaches him
	var soaked := 0.0
	if shield > 0.0:
		soaked = minf(shield, dmg)
		shield -= soaked
		dmg -= soaked
		if shield <= 0.0:
			shield = 0.0
			shield_t = 0.0
	if soaked > 0.0 or ward > 0.0:
		_tell({"t": "guarded", "x": world.x, "y": world.y, "fromX": by.x, "fromY": by.y})
	if dmg <= 0.0:
		last_blow = {"raw": raw, "el": el, "words": words, "half": hw, "parts": each, "shocked": shocked, "dmg": 0.0, "knock": knocked, "soaked": soaked, "ward": ward}
		return
	if not unhurt:
		life -= dmg
	_flash = 0.15
	_tell({"t": "hit", "x": world.x, "y": world.y, "amount": dmg, "crit": false, "el": el, "onHero": true})
	kick(minf(5.0, 1.0 + dmg / 8.0))
	sfx.play("hurt", -6.0)
	# LASTING and FLEETING, on a monster: its poison, burning and chill on him last longer, as hard a second; its poison and
	# burning hurt him sooner, the same in all (a minion's, of its leader's words, at half)
	var LA: Dictionary = Words.data()["lasting"]
	var FL: Dictionary = Words.data()["fleeting"]
	var longer: float = 1.0 + float(LA["monster"]) * float(k.call("lasting"))
	var lasts: float = longer * (1.0 - float(FL["monster"]) * float(k.call("fleeting")))
	# (for the three's looks: whose poison, burning or chill is on him, and the word of time it was laid with: game.ts dotBy)
	if k.call("poison") > 0.0 or parts.any(func(p): return p[0] == "fire" or p[0] == "frost"):
		var kl: float = k.call("lasting")
		var kf: float = k.call("fleeting")
		dot_by = {"id": src.id if src != null and is_instance_valid(src) else null, "word": "lasting" if kl > 0.0 and kl >= kf else ("fleeting" if kf > 0.0 else "")}
	# POISON, on a monster: most of the blow again, over the next few seconds, less what he withstands of poison
	if k.call("poison") > 0.0:
		var kept: float = 1.0 - stats.get("res_poison", 0.0) / 100.0
		poison_dps = maxf(poison_dps if poison_t > 0.0 else 0.0, dmg * 0.6 * float(k.call("poison")) * kept / POISON_TIME * (longer / lasts))
		poison_t = POISON_TIME * lasts
	# (what each element of the blow leaves: a minion's half of Flame burns half as hard)
	for p in parts:
		var share: float = p[1]
		match p[0]:
			"fire":
				burn_dps = maxf(burn_dps if burn_t > 0.0 else 0.0, dmg * 0.3 * share / 3.0 * (longer / lasts))
				burn_t = 3.0 * lasts
			"frost":
				chill_k = maxf(chill_k if chill_t > 0.0 else 0.0, 0.3 * share)
				chill_t = 2.0 * longer
			"lightning":
				shock_t = maxf(shock_t, 3.0 * share)
	# LEECH, on a monster: it heals what its blow takes
	var healed := 0.0
	if src != null and is_instance_valid(src) and not src.dead and k.call("leech") > 0.0:
		healed = minf(float(src.max_life), float(src.life) + dmg * float(k.call("leech"))) - float(src.life)
		src.life += healed
		_tell({"t": "text", "x": src.world.x, "y": src.world.y, "text": "heals", "color": "#ff8a80"})
	last_blow = {"raw": raw, "el": el, "words": words, "half": hw, "parts": each, "shocked": shocked, "dmg": dmg, "knock": knocked, "soaked": soaked, "ward": ward, "longer": longer, "lasts": lasts, "healed": healed}
	if life <= 0.0:
		_fall()


## WHAT BURNS AND POISONS HIM BITES (game.ts updateDots, twice a second, on the monsters' clock: monsters.gd _dots): his
## burning half its burning a second, his poison half its poison a second, 1 at least; neither is less for his armour.
func dots() -> void:
	if not alive:
		return
	if burn_t > 0.0:
		var b := maxf(1.0, roundf(burn_dps * 0.5))
		if not unhurt:
			life -= b
		_tell({"t": "hit", "x": world.x, "y": world.y, "amount": b, "crit": false, "el": "fire", "onHero": true})
		if life <= 0.0:
			_fall()
			return
	if poison_t > 0.0:
		var p := maxf(1.0, roundf(poison_dps * 0.5))
		if not unhurt:
			life -= p
		_tell({"t": "hit", "x": world.x, "y": world.y, "amount": p, "crit": false, "el": "phys", "onHero": true, "poison": true})
		if life <= 0.0:
			_fall()


## He falls.
func _fall() -> void:
	life = 0.0
	alive = false
	_down_for = 0.0
	_end_act()


func heal(share: float) -> void:
	life = minf(max_life, life + max_life * share)


## A NEW PLACE, or fallen and back (game.ts enterLevel: what was on him is over as he comes into a level): his might and
## his haste are gone, and what the monsters' words had left on him, burning, chill, shock and poison.
func fresh_place() -> void:
	might = 0.0
	might_t = 0.0
	haste = 0.0
	haste_t = 0.0
	frenzy = 0
	frenzy_t = 0.0
	shield = 0.0
	shield_t = 0.0
	_later = []
	burn_t = 0.0
	burn_dps = 0.0
	chill_t = 0.0
	chill_k = 0.0
	shock_t = 0.0
	poison_t = 0.0
	poison_dps = 0.0


## Fallen: back where he came in, whole again, and the monsters that were after him gone back to sleep.
func _back() -> void:
	world = home
	life = max_life
	alive = true
	held = 0.0
	fresh_place()
	if wakes != null and is_instance_valid(wakes):
		wakes.list.clear()
		wakes.queue_redraw()
	_sprite.modulate.a = 1.0
	_set_list(BakedHero.IDLE)
	if monsters != null:
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.state != "sleep":
				m.state = "sleep"
		monsters.forget()
		monsters.perils.clear()
	if doors != null and is_instance_valid(doors):
		doors.reset()
	_place()
	_show()


func _set_list(list: int) -> void:
	if _list != list:
		_list = list
		_t = 0.0


func _turn(way: Vector2) -> void:
	face = way
	var k := posmod(roundi(rad_to_deg(atan2(way.y, way.x)) / 45.0), 8)
	_side = BakedHero.SIDES.find(FACING[k])


## The game's slide: the step along x kept if the body is clear there, then the step along y.
func _slide(step: Vector2) -> void:
	var was := world
	# (game.ts slide: along walls and slanting walls; a ledge is as solid as a wall, stairs are entered at their ends)
	world = map.slide(world, RADIUS, step)
	_into_door(step, was)


## DOORS (game.ts intoDoor): a door is one tile wide in a hallway of three, and no direction he walks in runs along a hallway:
## so where his step along x (or y) was refused by the stone beside a door, he is moved sideways, at the pace of that step,
## toward the nearest place within DOOR_HELP from which the step can be taken: into line with the opening.
const DOOR_HELP := 1.05


func _into_door(step: Vector2, was: Vector2) -> void:
	if map == null or map.doors.is_empty():
		return
	for along_x in [true, false]:
		var want: float = step.x if along_x else step.y
		if want == 0.0 or (world.x != was.x if along_x else world.y != was.y):
			continue
		var ax: float = world.x + want if along_x else world.x
		var ay: float = world.y if along_x else world.y + want
		var stone := false
		for ty in range(floori(ay - RADIUS), floori(ay + RADIUS) + 1):
			for tx in range(floori(ax - RADIUS), floori(ax + RADIUS) + 1):
				stone = stone or map.pier_at(tx, ty)
		if not stone:
			continue
		var best := 0.0
		var best_s := INF
		for side in [1.0, -1.0]:
			var k := 1
			while k * 0.05 <= DOOR_HELP + 1e-9:
				var s := k * 0.05
				if _clear(ax + (0.0 if along_x else side * s), ay + (side * s if along_x else 0.0)):
					if s < best_s:
						best_s = s
						best = side * minf(absf(want), s)
					break
				k += 1
		if best == 0.0:
			continue
		var to := world + (Vector2(0.0, best) if along_x else Vector2(best, 0.0))
		if _clear(to.x, to.y):
			world = to


## Every tile the body's box overlaps is one a body may stand on (game.ts free).
func _clear(x: float, y: float) -> bool:
	return map.fits(x, y, RADIUS)


## Where he is on the screen; on raised or sunken ground and on stairs he is drawn as high as the ground is there, and the
## picture follows him up (render.ts heroLift; floor_map.gd lift_at).
func _place() -> void:
	position = Iso.to_screen(world.x, world.y)
	_lift = map.lift_at(world.x, world.y) if map != null else 0.0
	if _sprite != null:
		_sprite.position.y = -_lift


func _show() -> void:
	# (a whirlwind is seen from the front for as long as it goes round: the picture turns him itself, figure.ts `spins`)
	var side := BakedHero.SIDES.find("front") if _act == "whirl" else _side
	var n := art.count(side, _list)
	if n == 0:
		return
	var i := 0
	if _act == "lunge":
		# (the leap's pictures go by how far through the flight he is)
		i = mini(int(_act_t / _lunge["dur"] * n), n - 1)
	elif _act == "whirl":
		# (his spin goes round at 30 frames a second, from its first frame as the wind-up begins)
		i = int(_act_t * CLIP_FPS) % n
	elif _act == "strike" or _landing:
		i = mini(int(_t * CLIP_FPS), n - 1)
	else:
		i = int(_t * (IDLE_FPS if _list == BakedHero.IDLE else RUN_FPS)) % n
	var f := art.frame(side, _list, i)
	_sprite.texture = f["tex"]
	_sprite.offset = f["offset"]
	_sprite.scale = Vector2.ONE * float(f["scale"])
	_sprite.self_modulate = Color(2.0, 0.7, 0.7) if _flash > 0.0 else Color.WHITE


## His life over his head in a fight or when he is hurt (Version 11.2). Its edge takes the colour of what ails him (render.ts,
## the hero's life bar): burning P.fr4, poisoned P.vn4, chilled P.bu4, shocked P.lt3.
func _draw() -> void:
	if not alive:
		return
	var fighting: bool = monsters != null and monsters.nearest(world, 9.0) != null
	if not fighting and life >= max_life - 0.01:
		return
	var w := 44.0
	var top := -104.0 - _lift
	var edge := Color(0.04, 0.04, 0.1, 0.85)
	if burn_t > 0.0:
		edge = Color("#ff8a2a")
	elif poison_t > 0.0:
		edge = Color("#b4cc24")
	elif chill_t > 0.0:
		edge = Color("#58a8f0")
	elif shock_t > 0.0:
		edge = Color("#fff060")
	draw_rect(Rect2(-w / 2 - 1, top - 1, w + 2, 7), edge)
	draw_rect(Rect2(-w / 2, top, w * clampf(life / max_life, 0.0, 1.0), 5), Color(0.86, 0.16, 0.24))


## How soon each attack is ready again, 0 to 1 (the HUD).
func readiness() -> Dictionary:
	return {"whirl": 1.0 - _whirl_cd / maxf(0.01, _whirl_full), "lunge": 1.0 - _lunge_cd / maxf(0.01, _lunge_full)}
