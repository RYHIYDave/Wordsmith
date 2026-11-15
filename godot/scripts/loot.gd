## FLOOR 1'S LOOT, THE HERO'S GEAR, HIS LEVELS AND HIS WORDS, as the game has them (game.ts dropLoot, updateDrops, takeItem,
## gainXp; game/stats.ts derive; tools/godot_loot.ts saved the game's own gear and pictures: assets/loot).
##   WHAT FALLS (dropLoot, with LOOT2): an ordinary monster, gold 25% of the time (3 to 8), a piece of gear 4%, a life orb
##   6%; a pack's leader, gold 8 to 16 and a piece 75% of the time (a leader's luck); a guardian, gold 15 to 25, two
##   pieces (a hoard's luck, then an ordinary one) and an orb, and the flasks filled; a boss, gold 25 to 45, three pieces
##   (the first never plain) and an orb. The dead the Warden calls leave nothing. Each piece is one the game itself rolled
##   at that luck (items.json), so their kinds, names, rarities and properties are the game's.
##   TAKING IT (updateDrops): walking; nothing is taken till it has lain 0.4 s; gold and orbs within 3.2 tiles fly to him
##   at 9 a second and are taken at 0.75; gear lies where it fell and is taken within 1.1: worn at once in an empty slot
##   it fits, else into the bag of 24, else "Your bag is full". An orb gives back 15% of his life.
##   THE FLASKS: three, each 45% of his life (Q); one comes back for every 18 kills.
##   LEVELS (gainXp; defs.ts xpToNext = 3 x (45 + 33L + 9L^2)): each gives 12 life, all of it back, and +5 to one of Str,
##   Dex or Int, his choice (inventory.gd asks).
##   HIS STATS (stats.ts derive): every worn piece's properties added together; the weapon's own damage among them.
##   THE FALLEN WORDSMITH (game.ts enterDungeon, placeBody, searchBody): he lies on floor 1 until its way down has been
##   taken (searched already, if the hero has searched one); on a later floor ONLY for a hero who has neither the lit ring
##   nor the stone and has not searched one. Walking within 1.3 tiles of him searches him: before the ring is lit, the
##   Master Rune-stone and the flasks filled (it is carried to the wordsmith in town, who lights the ring and gives the
##   first word, POWER: town.gd); once it is lit, the flasks filled and the Warrior's first word laid beside him.
##   WORDS (game.ts wordsFall, spawn, dropLoot, updateProps, updateDrops): none falls before the ring is lit, nor on floor
##   1. From then a monster that carries a word gives it up where it falls (a boss always carries one; the rune over its
##   head says so); an ordinary monster leaves one 3 times in 1000 and a chest 5 in 100 (the first chest opened in a
##   treasure vault 25), the likelier the deeper (wordGrowth), one of the floor's own (wordsAt). A word on the floor is an
##   event: it stands in a shaft of its own light under its name (render.ts drawWordDrops), 1 s before it can be taken,
##   comes to him from 3.2 tiles and is taken at 0.75. Then it is among his words (`words`), the top of the screen says
##   WORD FOUND (hud.gd), and, while no word of his is at work yet, the gear screen opens on it at the next quiet moment
##   (main.ts `offer`, `quiet`).
##   BURNING A WORD INTO A PIECE (game.ts imbue; items.ts imbueProblem, imbueOptionsFor, imbueItem): the word is used up,
##   and becomes one of the things it can become on that kind of piece, picked evenly, its size rolled (items.json `imbue`:
##   every size the game's own imbueItem can roll). A piece has room for four properties, those it was found with and the
##   words burned in, and never two of a kind.
##   THE ARMOURER'S QUEST (game/quests15.ts; game.ts armourerDue, armourerHandIn, furnaceGearTaken, turnCrank): `furnace`,
##   where the hero stands in it; it is his, and outlasts the place (town.gd asks and rewards; furnace.gd tells it of the
##   gear and of the furnace going out).
##   THE MELDSTONE (game/quests15.ts, the wordsmith's quest; game/melds.ts STONE_RISE; game.ts dropLoot, updateDrops,
##   takeMeldstone, meldAskDue; render/meld_drops.ts riseOf, takenOf; art/meld_drops.ts, its pictures, tools/godot_fx.ts `ms_`):
##   once the armourer has rewarded him, the wordsmith asks for it (`meld_ask`); as the Fleshmancer dies (fleshmancer.gd) it
##   waits under the floor while he is dragged down (2.6 s), its light cracking the floor, then bursts up spinning where he went
##   down, its halves torn apart, slams together and comes down to hang, turning to and fro, "Meldstone" over it; it cannot be
##   taken for 1.2 s, then comes to him as gold does and is taken (`meld` "stone"): it leaps over his head, slams together and
##   dives into him. Given to the wordsmith (town.gd), `meld` "open": he gives the two words to meld (FLAME and FROST) and says
##   the lesson's lines; melding itself (the wordsmith's meld screen) is not in the Godot version yet.
extends Node

const Iso := preload("res://scripts/iso.gd")
const Hero := preload("res://scripts/hero.gd")
const Words := preload("res://scripts/words.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const Perils := preload("res://scripts/perils.gd")

const DIR := "res://assets/loot"
const EQUIP := ["mainhand", "offhand", "helm", "chest", "gloves", "belt", "boots", "amulet", "ring1", "ring2"]
const BAG := 24
const RARITY_COLOR := [Color("#cfc6bc"), Color("#6f8cff"), Color("#ffe070"), Color("#ff8a3a")]
const PULL := 3.2
const TAKE := 0.75
const GEAR_TAKE := 1.1
const FLY := 9.0
const WAIT := 0.4
const POTIONS := 3
const POTION_HEAL := 0.45
const KILLS_A_POTION := 18
const ORB_HEAL := 0.15
const SEARCH := 1.3
## (defs.ts MSG: news about words; every line of a quest; the flasks; what cannot be done)
const MSG_WORD := Color("#7af8f0")
const MSG_QUEST := Color("#7af8f0")
const MSG_LIFE := Color("#ff9aa0")
const MSG_BAD := Color(0.96, 0.27, 0.47)
## (main.ts: monsters awake this near keep a moment from being quiet; a new player's first word is seen so long in its
## light before the screen opens for it, any other so long; how long WORD FOUND stays, large and small)
const BUSY_NEAR := 10.0
const OFFER_FIRST := 2.4
const OFFER_WAIT := 0.9
const TOAST_BIG := 3.6
const TOAST := 2.8

var hero: Hero
var monsters  # monsters.gd
var stands: Node2D
var sfx  # sfx.gd
var map  # floor_map.gd

var gear := {}
var bag: Array = []
var attrs := {"str": 14.0, "dex": 8.0, "int": 6.0}
var level := 1
var xp := 0.0
var gold := 0
var potions := POTIONS
var kills := 0
## THE WORDS HE HOLDS, unset: by id, how many (game.ts hero.words). A word he has never held has no entry.
var words := {"power": 0}
var quest := ""
var ring_lit := false
## the wordsmith has asked for the stone (guide: "Take the STAIRS down" from then on)
var quest_given := false
## seconds left of the "carry" or "ring" prompt (QUEST_ITEM.promptSecs)
var prompt_t := 0.0
## (game.ts bodySearched: he has searched a fallen wordsmith)
var body_searched := false
## (game.ts cleared, how many floors' ways on he has taken: here the deepest floor he has come into, less one)
var cleared := 0
## THE ARMOURER'S QUEST, where he stands in it (quests15.ts FurnaceStep; game.ts hero.furnace): "" not asked, "asked", "gear"
## (he carries the crank's gear), "out" (the furnace put out), "done" (rewarded).
var furnace := ""
## THE MELDSTONE (game.ts hero.meld, hero.meldAsk): "" not his, "stone" carried, "open" given to the wordsmith; and whether
## the wordsmith has asked for it.
var meld := ""
var meld_ask := false
## (game.ts toldCarrier: what the rune over a monster's head means has been said)
var told_carrier := false
## A NEW PLAYER'S FIRST WORD HAS BEEN SET IN AN ATTACK (game.ts guide.set, endGuide): the lesson of the first word is over.
## Until then a word he holds is pressed on him (guide.gd), and goes on an attack and nowhere else.
var taught := false
## THE WORD JUST COME BY, for the top of the screen (main.ts toast; hud.gd WORD FOUND): {word, t, big}, empty when none.
var toast := {}
## A word waiting for a quiet moment to be offered a place (game.ts offer), and the word the gear screen is opened on
## (inventory.gd takes it in hand).
var offer := ""
var offered := ""
## What a word has just become on a piece (game.ts `burned`): {word, item, text}, for the gear screen's card.
var burned := {}
var main  # main.gd
## a level-up's +5 still to be placed (inventory.gd asks which)
var points := 0
var msgs: Array = []  # {text, t, color, life}

var sheet: Texture2D
var pics := {}
var stat_info := {}
var _pools := {}
## (any floor: the same pools as the game rolls them on each floor, tools/godot_loot.ts; floor 1's where a floor has none)
var _by_depth := {}
## the vendors' shelves (Game.rollShop on his first day in town)
var shops := {}
## (what each word becomes on each kind of piece; which words are found where; the armourer's quest's own lines:
## tools/godot_loot.ts)
var _imbue := {}
var _words := {}
var quest_text := {}
var _tune := {}
var _attr := {}
var _drops: Array = []  # {kind, at, node, age, amount?, item?, word?}
## (the fallen wordsmith where he lies in this place: {at, searched, node}; null where none lies)
var _body = null
## (floor 1's fallen wordsmith, where the loot's own file has him; a floor's own is where its layout says: FloorMap.body)
var _body1 = null
var _body_floor := 1
var _quiet := 0.0
var _font: Font
## (the clock the Meldstone bobs and turns by; the Meldstone taken, as it leaps over him and into him: {g, from, pics, slammed})
var _clock := 0.0
var _taken := {}


func _ready() -> void:
	_font = ThemeDB.fallback_font
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/items.json"))
	_pools = data["pools"]
	_by_depth = data.get("byDepth", {})
	shops = data["shops"]
	_imbue = data["imbue"]
	_words = data["words"]
	quest_text = data["quest"]
	stat_info = data["stats"]
	_tune = data["tune"]
	_attr = data["attr"]
	sheet = load(DIR + "/icons.png")
	for p in JSON.parse_string(FileAccess.get_file_as_string(DIR + "/icons.json")):
		pics[p["key"]] = {"rect": Rect2(p["x"], p["y"], p["w"], p["h"]), "anchor": Vector2(p["ax"], p["ay"])}
	for s in EQUIP:
		gear[s] = null
	gear["mainhand"] = data["starter"].duplicate(true)
	if data["body"] != null:
		_body1 = Vector2(data["body"]["x"], data["body"]["y"])
	derive()
	hero.life = hero.max_life


func setup_body() -> void:
	if _body == null:
		return
	var n := Sprite2D.new()
	n.centered = false
	n.position = Iso.to_screen(_body["at"].x, _body["at"].y)
	stands.add_child(n)
	_body["node"] = n
	_show_body()


func _show_body() -> void:
	var key := "body:searched" if _body["searched"] else "body"
	_body["node"].texture = _pic_tex(key)
	_body["node"].offset = -pics[key]["anchor"]


# --- his stats ---

## stats.ts derive: what every worn piece gives, added together, made into the numbers he fights with.
func derive() -> void:
	var s := {}
	for slot in EQUIP:
		var it = gear[slot]
		if it == null:
			continue
		for m in it["mods"]:
			s[m[0]] = s.get(m[0], 0.0) + float(m[1])
	var g := func(k: String) -> float: return s.get(k, 0.0)
	var str_: float = attrs["str"] + g.call("str")
	var dex: float = attrs["dex"] + g.call("dex")
	var int_: float = attrs["int"] + g.call("int")
	var weapon = gear["mainhand"]
	var dmin: float = g.call("dmgMin")
	var dmax: float = g.call("dmgMax")
	var aps: float = weapon["aps"] if weapon != null and weapon["aps"] > 0 else float(_tune["unarmedAps"])
	if weapon == null:
		dmin += float(_tune["unarmedMin"])
		dmax += float(_tune["unarmedMax"])
	dmax = maxf(dmax, dmin)
	var life := roundf((float(_tune["baseLife"]) + float(_tune["lifePerLevel"]) * (level - 1) + str_ * float(_attr["strLife"]) + g.call("maxLife")) * (1.0 + g.call("maxLifePct") / 100.0))
	hero.stats = {
		"str": str_, "dex": dex, "int": int_, "level": level,
		"dmg_min": dmin, "dmg_max": dmax,
		"aps": aps * (1.0 + (g.call("atkSpeed") + dex * float(_attr["dexSpeed"])) / 100.0),
		# (his damage's bonuses, %: all of it; and by the element of the blow, as game.ts hitMonster adds them: a plain blow his
		# physical, a word's element its own; his poison's)
		"dmg_pct": g.call("dmgPct"),
		"phys_pct": g.call("physPct"), "fire_pct": g.call("firePct"), "frost_pct": g.call("frostPct"), "light_pct": g.call("lightPct"),
		"poison_pct": g.call("poisonPct"),
		"crit_chance": float(_tune["baseCrit"]) + g.call("critChance") + dex * float(_attr["dexCrit"]),
		"crit_mult": float(_tune["baseCritMult"]) + g.call("critMult"),
		"life_regen": float(_tune["baseLifeRegen"]) + g.call("lifeRegen"),
		"life_on_hit": g.call("lifeOnHit"), "life_on_kill": g.call("lifeOnKill"),
		"armor": g.call("armor"), "move_speed": g.call("moveSpeed"), "area": 1.0 + g.call("areaPct") / 100.0,
		"gold_find": g.call("goldFind"),
		# (what a word burned into a piece may add besides: the damage added to his hits of one element (items.ts FLAT_PAIRS;
		# game.ts baseFor), his chance to stun, what he withstands of each element)
		"fire_min": g.call("fireMin"), "fire_max": g.call("fireMax"), "frost_min": g.call("frostMin"), "frost_max": g.call("frostMax"),
		"light_min": g.call("lightMin"), "light_max": g.call("lightMax"), "poison_min": g.call("poisonMin"), "poison_max": g.call("poisonMax"),
		"stun_chance": g.call("stunChance"),
		# (Guarding burned into a piece: a chance to block a blow outright, 50% at most: game.ts hurtHero)
		"block_chance": g.call("blockChance"),
		"res_fire": g.call("fireRes"), "res_frost": g.call("frostRes"), "res_light": g.call("lightRes"), "res_poison": g.call("poisonRes"),
	}
	hero.set_max_life(maxf(1.0, life))
	# (his moves' words: the slots his level and the lit ring open, and the numbers the words read. Cooldown recovery as
	# stats.ts derive has it: his gear's, a tenth of its mana and twice its mana regeneration, a quarter of his Intelligence,
	# 60% at most)
	var cdr: float = minf(0.6, (g.call("cdr") + g.call("maxMana") * 0.1 + g.call("manaRegen") * 2.0 + int_ * float(_attr["intCdr"])) / 100.0)
	hero.stats["cdr"] = cdr
	hero.loadout.set_level(level, ring_lit)
	hero.loadout.set_stats({"str": str_, "dex": dex, "int": int_, "area": hero.stats["area"], "aps": hero.stats["aps"], "cdr": cdr})


# --- his words ---

## How many words he holds, unset (ui/hud.ts `spare`).
func spare() -> int:
	var n := 0
	for w in words:
		n += int(words[w])
	return n


## The words he holds, in the order the game lists them (types.ts WORD_IDS: his pouch on the gear screen).
func held() -> Array:
	var out: Array = []
	for w in _words["order"]:
		if int(words.get(w, 0)) > 0:
			out.append(w)
	return out


## The first of the words he holds, or "" (ui/hud.ts: the rune beside the INVENTORY button; ui/guide.ts guideWord).
func first_spare() -> String:
	var h := held()
	return h[0] if not h.is_empty() else ""


## The Warrior's first word (defs.ts FIRST_WORD): the wordsmith's as his ring is lit, and the fallen wordsmith's satchel's.
func first_word() -> String:
	return _words["first"]


## Do words fall here and now (game.ts wordsFall): not before the ring is lit, and not on floor 1.
func words_fall() -> bool:
	return ring_lit and map != null and int(map.depth) > 1


## Has he put a word to work yet (game.ts wordAtWork): one set in a move, or burned into a piece he wears or carries?
func word_at_work() -> bool:
	if hero.loadout.any():
		return true
	for slot in EQUIP:
		if gear[slot] != null and not gear[slot].get("imbues", []).is_empty():
			return true
	for it in bag:
		if not it.get("imbues", []).is_empty():
			return true
	return false


## Is there a free slot somewhere that this word may go into (game.ts placeable)?
func placeable(w: String) -> bool:
	for i in 3:
		for side in ["front", "behind"]:
			if hero.loadout.problem(i, side, w) == "":
				return true
	return false


## Is the lesson of the first word still to come (game.ts `guide` with nothing set): no word has been set in a move yet?
func lesson() -> bool:
	return not taught and not hero.loadout.any()


## Is his first word waiting to be set (ui/guide.ts guideCoach, not done)? Until it is set it goes on an attack and nowhere
## else.
func first_word_waits() -> bool:
	return lesson() and spare() > 0


## A WORD COME BY (game.ts: hero.words[w]++, and the event wordGot): it is among his words; the top of the screen says so
## (hud.gd WORD FOUND: large for a new player's first); and, `place` asked and no word of his at work yet, it is offered a
## place at the next quiet moment (updateDrops: "A character's FIRST word is pressed on them").
func gain_word(w: String, place := true) -> void:
	words[w] = int(words.get(w, 0)) + 1
	toast = {"word": w, "t": 0.0, "big": lesson()}
	_quiet = 0.0
	if place and not word_at_work() and placeable(w):
		offer = w


## (game.ts giveRingWord) The wordsmith gives the word, and the gear screen opens on it (`offer`). (In the game the word is
## announced first, WORD FOUND, and the screen opens 2.4 s on; here at once, as the first quest has had it.)
func give_word(w: String) -> void:
	words[w] = int(words.get(w, 0)) + 1
	say("The wordsmith gives you a word: %s." % str(Words.word(w)["name"]).to_upper(), MSG_WORD)
	sfx.play("rare")
	if main != null:
		offered = w
		main.offer_word(w)


# --- what falls ---

## A monster has fallen (monster.gd _die): his experience, and what it leaves (game.ts dropLoot).
func on_kill(m) -> void:
	gain_xp(m.xp)
	hero.heal_flat(hero.stats["life_on_kill"])
	kills += 1
	if kills % KILLS_A_POTION == 0 and potions < POTIONS:
		potions += 1
		say("A flask fills", Color(0.86, 0.3, 0.36))
	var at: Vector2 = m.world
	# (whatever else it leaves, a monster that carried a word gives it up: the boss's too. None before the ring is lit)
	if words_fall():
		for w in m.carries:
			_word(at, w)
	# (FLOORS 6 TO 10: a piece of the ward-stone it carried, the Queen's feather and her eyrie's scene: act1/quest610.gd)
	if main != null and main.quest610 != null:
		main.quest610.killed(m)
	if m.summoned:
		return
	if m.boss:
		_gold(at, randi_range(25, 45))
		_item(at, 4)
		_item(at, 1)
		_item(at, 1)
		_orb(at)
	elif m.champion:
		potions = POTIONS
		_gold(at, randi_range(15, 25))
		_item(at, 2)
		_item(at, 0)
		_orb(at)
	elif m.elite:
		_gold(at, randi_range(8, 16))
		if randf() < 0.75:
			_item(at, 1)
	else:
		if randf() < 0.25:
			_gold(at, randi_range(3, 8))
		if randf() < 0.04:
			_item(at, 0)
		if randf() < 0.06:
			_orb(at)
		# (an ordinary monster holds a word very rarely: TUNE.dropWord, the likelier the deeper)
		if randf() < float(_tune["dropWord"]) * _growth() and words_fall():
			_word(at, _found())


## A barrel or an urn broken (game.ts breakProps): maybe gold (1 to 5), a life orb, a piece of gear.
func from_breakable(at: Vector2) -> void:
	if randf() < 0.4:
		_gold(at, randi_range(1, 5))
	if randf() < 0.08:
		_orb(at)
	if randf() < 0.04:
		_item(at, 0)


## A chest opened (game.ts updateProps): one piece (in a treasure vault perhaps two, the first a hoard's), and gold, laid
## before it; and now and then a word (TUNE.chestWord; the first chest opened in a treasure vault, TUNE.vaultWord: the
## likeliest place on a floor to find one).
func from_chest(at: Vector2, vault: bool) -> void:
	var before := at + Vector2(0, 0.6)
	var n := 1 + (1 if vault and randf() < 0.5 else 0)
	for i in n:
		_item(before, 2 if vault and i == 0 else 1)
	_gold(before, randi_range(10, 20) * (2 if vault else 1))
	var chance := float(_tune["vaultWord"]) if vault and _first_in_vault(at) else float(_tune["chestWord"])
	if randf() < chance * _growth() and words_fall():
		_word(before, _found())


## Is the chest at `at` the first opened in its treasure vault: no other chest of that room is open?
func _first_in_vault(at: Vector2) -> bool:
	if map == null:
		return false
	for r in map.rooms:
		if r.get("kind", "") != "treasure" or not FloorMap.in_room(r, Vector2(floorf(at.x), floorf(at.y))):
			continue
		for p in map.props:
			if p["kind"] == "chest" and int(p["state"]) == 1 and FloorMap.in_room(r, Vector2(p["tx"], p["ty"])) and Vector2(p["x"], p["y"]).distance_to(at) > 0.01:
				return false
		return true
	return false


## How many times as likely a word is on this floor (defs.ts wordGrowth), and one of the words found on it (types.ts wordsAt).
func _growth() -> float:
	return float(_words["growth"].get(str(map.depth), 1.0)) if map != null else 1.0


func _found() -> String:
	var here: Array = _words["at"].get(str(map.depth), [_words["first"]]) if map != null else [_words["first"]]
	return here.pick_random()


## Where a thing lands: about where it fell, on open floor, a little apart from the rest; on a floor with pits (the Ledge
## Road's drop, the Fen's water), what falls over one lands on the nearest floor, not in the hole (game.ts addDrop).
func _scatter(at: Vector2) -> Vector2:
	for i in 12:
		var p := at + Vector2(randf_range(-0.9, 0.9), randf_range(-0.9, 0.9))
		if map.walkable(floori(p.x), floori(p.y)):
			return p
	return _off_pits(at, at)


## (game.ts addDrop, PITS) Where a thing dropped at `p` (fallen at `at`) lies: where it is, on a floor with no pits or ledges;
## else, off floor, where it fell if that is floor, else the nearest floor.
func _off_pits(p: Vector2, at: Vector2) -> Vector2:
	if map == null or map.step.is_empty() or _on_floor(p):
		return p
	return at if _on_floor(at) else floor_near(at)


## Floor that can be stood on, not a pit, not a wall, not the wall half of a tile cut corner to corner (game.ts onFloor).
func _on_floor(p: Vector2) -> bool:
	return map.tile(floori(p.x), floori(p.y)) == FloorMap.FLOOR and not map.in_wall(p.x, p.y)


## The middle of the nearest tile within 4 a body may stand on, or `at` itself if there is none (game.ts floorNear).
func floor_near(at: Vector2) -> Vector2:
	var best := at
	var best_d := INF
	for ty in range(floori(at.y) - 4, floori(at.y) + 5):
		for tx in range(floori(at.x) - 4, floori(at.x) + 5):
			var d := Vector2(tx + 0.5, ty + 0.5).distance_squared_to(at)
			if map.walkable(tx, ty) and d < best_d:
				best_d = d
				best = Vector2(tx + 0.5, ty + 0.5)
	return best


func _gold(at: Vector2, amount: int) -> void:
	var key := "gold:2" if amount >= 30 else ("gold:1" if amount >= 8 else "gold:0")
	_drop("gold", _scatter(at), key, {"amount": amount})


func _orb(at: Vector2) -> void:
	_drop("orb", _scatter(at), "orb", {})


## (LEECH behind, game.ts kill: an enemy killed by a move carrying it drops a life orb now and then: hero.gd killed)
func orb_at(at: Vector2) -> void:
	if map != null:
		_orb(at)


func _item(at: Vector2, quality: int) -> void:
	var here: Dictionary = _by_depth.get(str(map.depth), _pools) if map != null else _pools
	var pool: Array = here[str(quality)]
	var it: Dictionary = pool[randi() % pool.size()].duplicate(true)
	_drop("gear", _scatter(at), it["icon"], {"item": it})


## A WORD FALLS (game.ts addDrop 'word'; the event wordDrop): within 0.7 of where it fell, or just there; it is heard.
func _word(at: Vector2, w: String, just_there := false) -> void:
	# (a word that is not one of floors 1 to 5's has no rune stone here yet)
	if not pics.has("word:" + w):
		return
	var p := at
	if not just_there:
		p = at + Vector2(randf_range(-0.7, 0.7), randf_range(-0.7, 0.7))
		if map == null or not map.walkable(floori(p.x), floori(p.y)):
			p = at
	p = _off_pits(p, at)
	var n := _WordDrop.new()
	n.sheet = sheet
	n.src = pics["word:" + w]["rect"]
	n.anchor = pics["word:" + w]["anchor"]
	n.color = word_color(w)
	n.title = str(Words.word(w)["name"]).to_upper()
	n.phase = p.x
	n.position = Iso.to_screen(p.x, p.y)
	stands.add_child(n)
	_drops.append({"kind": "word", "at": p, "node": n, "age": 0.0, "word": w})
	sfx.play("rare", linear_to_db(0.8))


## A word's own colour (art/icons.ts WORD_COLOR).
func word_color(w: String) -> Color:
	return Color(_words["color"].get(w, "#ffffff"))


func _drop(kind: String, at: Vector2, pic: String, extra: Dictionary) -> void:
	var n := Node2D.new()
	var s := Sprite2D.new()
	s.texture = _pic_tex(pic)
	s.centered = false
	s.offset = -pics[pic]["anchor"]
	n.add_child(s)
	if kind == "gear":
		var tag := _Tag.new()
		extra["tag"] = tag
		var it: Dictionary = extra["item"]
		tag.text = it["kind"]
		tag.color = RARITY_COLOR[int(it["rarity"])]
		tag.z_index = 60
		n.add_child(tag)
	n.position = Iso.to_screen(at.x, at.y)
	stands.add_child(n)
	var d := {"kind": kind, "at": at, "node": n, "age": 0.0}
	d.merge(extra)
	_drops.append(d)


func _pic_tex(key: String) -> AtlasTexture:
	var t := AtlasTexture.new()
	t.atlas = sheet
	t.region = pics[key]["rect"]
	return t


# --- taking it ---

func _process(dt: float) -> void:
	prompt_t = maxf(0.0, prompt_t - dt)
	for m in msgs:
		m["t"] += dt
	msgs = msgs.filter(func(m): return m["t"] < m["life"])
	if not toast.is_empty():
		toast["t"] += dt
		if toast["t"] > (TOAST_BIG if toast["big"] else TOAST):
			toast = {}
	_lay_tags()
	_clock += dt
	_show_taken(dt)
	if hero == null or not hero.alive:
		return
	if Input.is_action_just_pressed("potion"):
		drink()
	_search_body()
	_tell_carrier()
	_offer(dt)
	var keep: Array = []
	for d in _drops:
		d["age"] += dt
		var take := false
		var dist: float = d["at"].distance_to(hero.world)
		if d["kind"] == "word":
			# (a word on the floor lights the room round it: render.ts, the dark's own spot)
			if main != null and main.look != null:
				main.look.spot(Iso.to_screen(d["at"].x, d["at"].y) / 2.0 + Vector2(0, -10), 40.0, 0.85)
		if d["kind"] == "stone":
			_show_stone(d)
		# (a word stands in its light for a moment before it can be taken: it is an event, not a coin; the Meldstone, while it
		# bursts up and comes down to hang)
		if d["age"] >= (float(_tune["wordStands"]) if d["kind"] == "word" else STONE_STANDS if d["kind"] == "stone" else WAIT):
			if d["kind"] == "gear":
				take = dist <= GEAR_TAKE and _take_item(d["item"])
			else:
				if dist <= PULL:
					d["at"] = d["at"].move_toward(hero.world, FLY * dt)
					d["node"].position = Iso.to_screen(d["at"].x, d["at"].y)
				if d["at"].distance_to(hero.world) <= TAKE:
					take = true
					if d["kind"] == "stone":
						_stone_taken(d)
					elif d["kind"] == "gold":
						var n := int(round(d["amount"] * (1.0 + hero.stats["gold_find"] / 100.0)))
						gold += n
						say("+%d gold" % n, Color(1.0, 0.85, 0.4))
						sfx.play("gold", -6.0)
					elif d["kind"] == "word":
						gain_word(d["word"])
						sfx.play("word")
					else:
						hero.heal(ORB_HEAL)
						sfx.play("pickup", -6.0)
		if take:
			d["node"].queue_free()
		else:
			keep.append(d)
	_drops = keep


## (main.ts `quiet`, `offer`) A word come by that has somewhere to go is offered its place at the first quiet moment: nothing
## awake within 10 tiles for 2.4 s (a new player's first word, seen in its light first) or 0.9 s; then the gear screen
## opens on it.
func _offer(dt: float) -> void:
	if offer != "" and (int(words.get(offer, 0)) <= 0 or not placeable(offer)):
		offer = ""
	if offer == "" or main == null:
		return
	var busy := false
	if monsters != null:
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.state != "sleep" and m.world.distance_to(hero.world) < BUSY_NEAR:
				busy = true
				break
	_quiet = 0.0 if busy else _quiet + dt
	if _quiet > (OFFER_FIRST if lesson() else OFFER_WAIT):
		offered = offer
		offer = ""
		main.offer_word(offered)


## (game.ts wake: "a character's first dungeon: say what the rune over its head means, once") The first time a monster that
## carries a word, and is no boss, wakes on floor 1 before its way down has been taken. (As the game stands nothing on
## floor 1 carries a word, so this is never said: "no words on monsters for dungeon 1".)
func _tell_carrier() -> void:
	if told_carrier or map == null or int(map.depth) != 1 or cleared != 0 or monsters == null:
		return
	for m in monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and m.state != "sleep" and not m.carries.is_empty():
			told_carrier = true
			say("%s carries a WORD. Kill it and the word is yours." % m.title, MSG_WORD)
			return


## takeItem: worn at once in an empty slot it fits, else into the bag, else it stays.
func _take_item(it: Dictionary) -> bool:
	var slot := _empty_slot_for(it)
	if slot != "":
		gear[slot] = it
		derive()
		say("%s equipped" % it["name"], RARITY_COLOR[int(it["rarity"])])
		sfx.play("equip", -4.0)
		return true
	if bag.size() < BAG:
		bag.append(it)
		say(it["name"], RARITY_COLOR[int(it["rarity"])])
		sfx.play("pickup", -6.0)
		return true
	say("Your bag is full", MSG_BAD)
	return false


func _empty_slot_for(it: Dictionary) -> String:
	for s in slots_for(it):
		if gear[s] == null and not (s == "offhand" and _two_handed()):
			return s
	return ""


func slots_for(it: Dictionary) -> Array:
	match it["slot"]:
		"ring":
			return ["ring1", "ring2"]
		_:
			return [it["slot"]]


func _two_handed() -> bool:
	return gear["mainhand"] != null and int(gear["mainhand"]["hands"]) == 2


## Wear a piece from the bag (game.ts equipFromBag): what was worn there goes into the bag in its place; a two-handed
## weapon sends the off-hand to the bag too.
func equip_from_bag(i: int) -> void:
	var it: Dictionary = bag[i]
	var slots := slots_for(it)
	var slot: String = slots[0]
	for s in slots:
		if gear[s] == null:
			slot = s
			break
	if slot == "offhand" and _two_handed():
		say("Your weapon takes both hands", MSG_BAD)
		return
	bag.remove_at(i)
	if gear[slot] != null:
		bag.append(gear[slot])
	gear[slot] = it
	if slot == "mainhand" and int(it["hands"]) == 2 and gear["offhand"] != null:
		bag.append(gear["offhand"])
		gear["offhand"] = null
	derive()
	sfx.play("equip", -4.0)


func unequip(slot: String) -> void:
	if gear[slot] == null:
		return
	if bag.size() >= BAG:
		say("Your bag is full", MSG_BAD)
		return
	bag.append(gear[slot])
	gear[slot] = null
	derive()


func drink() -> void:
	if potions <= 0 or hero.life >= hero.max_life:
		return
	potions -= 1
	hero.heal(POTION_HEAL)
	sfx.play("potion", -4.0)


# --- levels ---

func xp_to_next(l: int) -> float:
	return 3.0 * (45.0 + 33.0 * l + 9.0 * l * l)


func gain_xp(n: float) -> void:
	xp += n
	while xp >= xp_to_next(level):
		xp -= xp_to_next(level)
		var had: Array = Words.socket_count(level) if ring_lit else [0, 0]
		level += 1
		points += 1
		derive()
		hero.life = hero.max_life
		say("Level %d!" % level, Color(0.35, 0.9, 1.0))
		sfx.play("levelup")
		# (a new slot has opened on his attacks: say so, and if a word he holds fits it, offer it a place: game.ts gainXp)
		var has: Array = Words.socket_count(level) if ring_lit else [0, 0]
		if int(has[0]) > int(had[0]) or int(has[1]) > int(had[1]):
			var front: bool = int(has[0]) > int(had[0])
			var nth: String = ["A", "A second", "A third"][clampi(int(has[0] if front else has[1]) - 1, 0, 2)]
			say("%s word slot has opened %s your attacks." % [nth, "IN FRONT of" if front else "BEHIND"], MSG_WORD)
			for w in held():
				if placeable(w):
					offer = w
					_quiet = 0.0
					break


func choose_attr(a: String) -> void:
	if points <= 0:
		return
	points -= 1
	attrs[a] += 5.0
	derive()


# --- the fallen wordsmith and the first word ---

func _search_body() -> void:
	if _body == null or _body["searched"] or _body["node"] == null:
		return
	if hero.world.distance_to(_body["at"]) > SEARCH:
		return
	_body["searched"] = true
	body_searched = true
	_show_body()
	sfx.play("rare")
	# (game.ts searchBody, THE FIRST LEVELS: before the ring is lit the satchel holds the Master Rune-stone, not a word, and
	# the flasks are filled; it is carried to the wordsmith in town)
	if not ring_lit:
		quest = "heart"
		potions = POTIONS
		prompt_t = 6.0
		say("You take the MASTER RUNE-STONE.", MSG_QUEST)
		return
	# (the ring lit: the satchel gives up its word, the Warrior's first, laid where he lies; and the flasks: the second half
	# of the floor is met fresh)
	_word(_body["at"], _words["first"], true)
	potions = POTIONS
	say("A fallen wordsmith. In the satchel: full flasks, and a WORD.", MSG_WORD)


## A new place: what lay on the floor of the last is gone with it. THE FALLEN WORDSMITH (game.ts enterDungeon): on floor 1
## he lies until its way down has been taken, searched already if the hero has searched one (the game lays floor 1 again
## each time it is come into, its body with it); on a later floor only for a hero who has neither the lit ring nor the
## stone and has not searched one ("A hero who left the first dungeon without searching the fallen wordsmith finds him
## again in the next ... and so on until he is found").
func enter_place(m, st: Node2D, mons, is_floor1: bool) -> void:
	map = m
	stands = st
	monsters = mons
	_drops = []
	_taken = {}
	_body = null
	_quiet = 0.0
	if m == null or int(m.depth) < 1 or stands == null or m.rooms.size() <= 1:
		return
	var first: bool = is_floor1 and cleared == 0
	cleared = maxi(cleared, int(m.depth) - 1)
	var lies: bool = first or (not ring_lit and quest == "" and not body_searched)
	var at = Vector2(m.body["x"], m.body["y"]) if m.body != null else (_body1 if is_floor1 else null)
	if not lies or at == null:
		return
	_body_floor = int(m.depth)
	_body = {"at": at, "searched": body_searched, "node": null}
	setup_body()


# --- burning a word into a piece ---

## The piece worn in a slot (`where` its name) or lying in the bag (`where` its place there), or null.
func piece(where):
	if where is String:
		return gear.get(where)
	return bag[int(where)] if int(where) >= 0 and int(where) < bag.size() else null


## How many more words a piece will take (items.ts itemRoom): four properties in all, less those it was found with and the
## words already in it; a unique piece none.
func room(it: Dictionary) -> int:
	if int(it["rarity"]) == 3:
		return 0
	return maxi(0, int(_words["room"]) - int(it.get("affixes", 0)) - it.get("imbues", []).size())


## WHAT A WORD CAN STILL BECOME ON THIS PIECE (items.ts imbueOptionsFor): what it becomes on a piece of that kind and
## level, less whatever the piece already carries, or anything of the same kind (statGroup). Empty when it has no room.
func burn_options(w: String, it: Dictionary) -> Array:
	if room(it) <= 0:
		return []
	var has: Array = it.get("has", []).duplicate()
	for im in it.get("imbues", []):
		has.append_array(im["stats"])
	var kinds: Array = has.map(_group)
	var all: Array = _imbue.get(w, {}).get("%s:%d" % [it["slot"], int(it["ilvl"])], [])
	return all.filter(func(o): return not has.has(o["stat"]) and not kinds.has(_group(o["stat"])))


func _group(stat: String) -> String:
	return _words["groups"].get(stat, stat)


## Why a word cannot be burned into that piece, or "" if it can (game.ts imbueProblem; items.ts imbueProblem).
func burn_problem(w: String, where) -> String:
	if not ring_lit:
		return _words["dark"]
	var it = piece(where)
	if it == null:
		return "Nothing there"
	if first_word_waits():
		return "Your first word goes on an attack"
	if int(words.get(w, 0)) <= 0:
		return "No spare word"
	if int(it["rarity"]) == 3:
		return "A unique piece takes no word"
	if room(it) <= 0:
		return "That piece is full"
	if burn_options(w, it).is_empty():
		return "It already has what this word gives"
	return ""


## BURN A WORD INTO A PIECE (game.ts imbue; items.ts imbueItem): the word is used up; which of the things it can become
## there is picked evenly, and its size rolled as the game rolls it (each size of the table as likely as the game makes
## it). The piece's colour follows the count of its properties. "" if it was done (`burned` says what it became), else why
## not.
func burn(w: String, where) -> String:
	var why := burn_problem(w, where)
	if why != "":
		return why
	var it: Dictionary = piece(where)
	var o: Dictionary = burn_options(w, it).pick_random()
	var total := 0.0
	for r in o["rolls"]:
		total += float(r[0])
	var at := randf() * total
	var got: Array = o["rolls"][o["rolls"].size() - 1]
	for r in o["rolls"]:
		at -= float(r[0])
		if at < 0.0:
			got = r
			break
	var stats: Array = []
	for m in got[1]:
		stats.append(m[0])
	it["mods"] = it["mods"] + got[1]
	if not it.has("imbues"):
		it["imbues"] = []
	it["imbues"].append({"word": w, "lines": got[2], "stats": stats})
	var n: int = int(it.get("affixes", 0)) + it["imbues"].size()
	it["rarity"] = maxi(int(it["rarity"]), 2 if n >= 3 else (1 if n >= 1 else 0))
	# (its price with that many words in it, as the game counts it, items.ts itemValue: a fifth more for each word, and its
	# colour's own worth where the word has changed its colour: tools/godot_loot.ts `worth`)
	var worth: Array = it.get("worth", [])
	var nth: int = it["imbues"].size() - 1
	it["value"] = int(worth[nth]) if nth < worth.size() else roundi(float(it.get("value", 0)) * 1.2)
	words[w] = int(words[w]) - 1
	if where is String:
		derive()
	sfx.play("imbue")
	burned = {"word": w, "item": it["name"], "text": ", ".join(got[2])}
	return ""


# --- the armourer's quest ---

## Floor 3's furnace still burns for this hero (game.ts furnaceBurns): one who has been down past floor 3 has it out.
func furnace_burns() -> bool:
	return furnace != "out" and furnace != "done" and cleared < 3 and (main == null or int(main.way_depth) < 4)


## What the armourer has for this hero (game.ts armourerDue): "furnace", his quest (the ring lit, the furnace burning, not
## yet asked); "reward" (the furnace out); or "".
func armourer_due() -> String:
	if not ring_lit:
		return ""
	if furnace == "out":
		return "reward"
	if furnace == "" and furnace_burns():
		return "furnace"
	return ""


## THE ARMOURER, USED WITH SOMETHING DUE (game.ts handIn, armourerHandIn): he asks the hero to put out floor 3's furnace;
## or, the furnace out, he gives his word for the Warrior, HEAVY. False if he had nothing (then his shop opens).
func armourer_hand_in() -> bool:
	var what := armourer_due()
	if what == "furnace":
		furnace = "asked"
		sfx.play("power", linear_to_db(0.6))
		say(quest_text["furnaceAsk"], MSG_QUEST)
		return true
	if what == "reward":
		furnace = "done"
		gain_word(quest_text["word"], false)
		sfx.play("rare")
		say(quest_text["reward"], MSG_QUEST)
		return true
	return false


## The crank's gear taken up where the Stoker fell (game.ts furnaceGearTaken); the crank turned with it and the furnace
## out (turnCrank). furnace.gd tells both. One whom the armourer has rewarded is not sent back.
func furnace_gear() -> void:
	if furnace == "" or furnace == "asked":
		furnace = "gear"


func furnace_out() -> void:
	if furnace != "done":
		furnace = "out"


# --- the Meldstone ---

## (game/melds.ts STONE_RISE: how long it waits under the floor as he is dragged down, and how long from its rising until it
## can be taken; MELD_DUST_COLOR, the friend's cyan it is named in)
const STONE_WAIT := 2.6
const STONE_STANDS := 1.2
const MELD_COLOR := Color("#5ce8f8")
## (game/quests15.ts QUEST_TEXT; game.ts takeMeldstone)
const MELD_ASK := "The wordsmith: \"The cult holds the prison yet. Under the ossuary lies their stronghold, and in it the MELDSTONE. Bring it to me, and I will unbar the gate down the mountain.\""
const MELD_TAKES := "The wordsmith takes the MELDSTONE. He can meld words now."
const MELD_WORDS := "He gives you two words, %s and %s, to meld."
const MELD_LESSON := [
	"MELDING: two damage words made one. Open the wordsmith, then MELD.",
	"Tap a word, then a hollow; then the other word, the other hollow. MELD makes them one word, for runedust.",
]
## (render/meld_drops.ts: how high it hangs, how far it bobs; RISE and TAKEN, the moments of its rising and of its taking)
const HOVER := 8.0
const BOB := 1.5
const RISE := {"crack_from": -0.4, "top": 0.3, "slam": 0.55, "burst": 0.32, "down": 1.2, "top_z": 38.0}
const TAKEN := {"leap": 0.22, "slam": 0.5, "burst": 0.3, "gone": 0.8, "top_z": 46.0, "chest_z": 20.0}


## Has the wordsmith his ask for the Meldstone (game.ts meldAskDue): the armourer has rewarded him, it is not asked, not his,
## and the gate down the mountain is still barred.
func meld_ask_due() -> bool:
	return furnace == "done" and not meld_ask and meld == "" and (main == null or int(main.way_depth) < 6)


## The wordsmith asks for it (game.ts handIn 'meldAsk').
func ask_meld() -> void:
	meld_ask = true
	sfx.play("power", linear_to_db(0.6))
	say(MELD_ASK, MSG_QUEST)


## THE FLESHMANCER DEAD (fleshmancer.gd died; game.ts dropLoot): until it has been brought to the wordsmith, and while none lies
## there yet, the Meldstone, under the floor just where he went down (STONE_RISE), to burst up out of it.
func meldstone_rises(at: Vector2) -> void:
	if meld != "" or stands == null or map == null:
		return
	for d in _drops:
		if d["kind"] == "stone":
			return
	var p := at if map.open_at(floori(at.x), floori(at.y)) else _scatter(at)
	var holder := Node2D.new()
	stands.add_child(holder)
	var pics: Array = []
	for i in 3:
		var q := _FilmPic.new()
		stands.add_child(q)
		pics.append(q)
	var label := _Tag.new()
	label.text = "Meldstone"
	label.color = MELD_COLOR
	label.z_index = 60
	label.visible = false
	stands.add_child(label)
	_drops.append({"kind": "stone", "at": p, "node": holder, "age": -STONE_WAIT, "pics": pics, "label": label, "slammed": false})


## THE MELDSTONE AS IT DROPS AND LIES (render.ts standMeldDrop; render/meld_drops.ts riseOf): the crack of its light in the
## floor, then it shoots up spinning, its halves torn apart, hangs, slams together in a burst of light (the screen kicked),
## and comes down to hang over the floor, turning to and fro, named; its light on the floor under it.
func _show_stone(d: Dictionary) -> void:
	var R := rise_of(d["age"], _clock)
	var at: Vector2 = d["at"]
	var scr := Iso.to_screen(at.x, at.y)
	var dd := at.x + at.y
	var pics: Array = d["pics"]
	var c = R["crack"]
	pics[0].visible = c != null and pics[0].put("ms_crack", mini(5, floori(c["k"] * 6.0)), scr, dd - 0.45, 0.0, 1.0, c["alpha"])
	var z: float = R["z"]
	if z < 0.0:
		pics[1].visible = false
		pics[2].visible = false
		d["label"].visible = false
		return
	pics[1].put(_stone_film(R), _stone_frame(R), scr, dd + 0.05, z * 2.0, R["scale"])
	var b = R["burst"]
	pics[2].visible = b != null and pics[2].put("ms_burst", 0, scr, dd + 0.06, z * 2.0, b["scale"], b["alpha"])
	if R["slammed"] and not d["slammed"]:
		d["slammed"] = true
		hero.kick(3.0)
	d["label"].visible = R["shown"] == "hang"
	d["label"].position = scr + Vector2(0, (20.0 - z - 16.0) * 2.0)
	if main != null and main.look != null:
		main.look.spot(scr / 2.0, 16.0, 0.4)
		main.look.spot(scr / 2.0 - Vector2(0, z), 14.0, 0.4)


## TAKEN (game.ts updateDrops 'stone'): his, to be brought to the wordsmith; it leaps over his head, wrenches apart, slams
## together and dives into him (render/meld_drops.ts takenOf).
func _stone_taken(d: Dictionary) -> void:
	for q in d["pics"]:
		q.queue_free()
	d["label"].queue_free()
	if meld == "":
		meld = "stone"
	sfx.play("rare")
	say("You take the MELDSTONE.", MSG_QUEST)
	var pics: Array = []
	for i in 2:
		var q := _FilmPic.new()
		stands.add_child(q)
		pics.append(q)
	_taken = {"g": 0.0, "from": d["at"], "pics": pics, "slammed": false}


func _show_taken(dt: float) -> void:
	if _taken.is_empty():
		return
	_taken["g"] += dt
	var pics: Array = _taken["pics"]
	var T := taken_of(_taken["g"], _taken["from"], hero.world)
	if T.is_empty() or not is_instance_valid(pics[0]):
		for q in pics:
			if is_instance_valid(q):
				q.queue_free()
		_taken = {}
		return
	var scr := Iso.to_screen(T["x"], T["y"])
	var hd := hero.world.x + hero.world.y
	var z: float = T["z"]
	pics[0].put(_stone_film(T), _stone_frame(T), scr, hd + 0.05, z * 2.0, T["scale"])
	var b = T["burst"]
	pics[1].visible = b != null and pics[1].put("ms_burst", 0, scr, hd + 0.06, z * 2.0, b["scale"], b["alpha"])
	if T["slammed"] and not _taken["slammed"]:
		_taken["slammed"] = true
		hero.kick(3.5)


## Its picture: spinning torn apart, spinning fused, or hanging (render.ts meldStoneSprite).
func _stone_film(R: Dictionary) -> String:
	return "ms_apart" if R["shown"] == "apart" else ("ms_whole" if R["shown"] == "whole" else "ms_stone")


func _stone_frame(R: Dictionary) -> int:
	if R["shown"] == "hang":
		return floori(_clock * 12.0) % 24
	# (art/meld_drops.ts spinStep: the step of its turn, of 16)
	return posmod(roundi(float(R["yaw"]) / 360.0 * 16.0), 16)


static func _ease(k: float) -> float:
	return k * k * (3.0 - 2.0 * k)


## render/meld_drops.ts riseOf: the Meldstone as it drops, by its age (below 0, under the floor), and the clock for its bob:
## {z (game pixels; less than 0 not shown), yaw, shown, scale, burst {scale, alpha} or null, crack {k, alpha} or null, slammed}.
static func rise_of(age: float, t: float) -> Dictionary:
	var crack = null
	if age >= RISE["crack_from"] and age < 0.25:
		crack = {"k": clampf((age - RISE["crack_from"]) / -RISE["crack_from"], 0.0, 1.0), "alpha": 1.0 if age < 0.0 else 1.0 - age / 0.25}
	var out := {"z": -1.0, "yaw": 0.0, "shown": "whole", "scale": 1.0, "burst": null, "crack": crack, "slammed": false}
	if age < 0.0:
		return out
	var top_z: float = RISE["top_z"]
	if age < RISE["top"]:
		# (shot up out of the floor, spinning, torn apart)
		var k: float = age / RISE["top"]
		out.merge({"z": top_z * (1.0 - (1.0 - k) * (1.0 - k)), "yaw": 1080.0 * k, "shown": "apart", "scale": 0.7 + 0.3 * k}, true)
		return out
	if age < RISE["slam"]:
		# (hung at the top, still spinning, straining)
		var k: float = (age - RISE["top"]) / (RISE["slam"] - RISE["top"])
		out.merge({"z": top_z + 2.0 * sin(k * PI), "yaw": 1080.0 + 400.0 * k, "shown": "apart", "scale": 1.0 + 0.15 * k}, true)
		return out
	var since: float = age - RISE["slam"]
	if since < RISE["burst"]:
		out["burst"] = {"scale": 0.5 + since / RISE["burst"] * 1.1, "alpha": 1.0 - since / RISE["burst"]}
	out["slammed"] = true
	var bob := BOB * sin(t * PI)
	if age < RISE["down"]:
		# (slammed together; down to hang, its spin running down)
		var k := _ease((age - RISE["slam"]) / (RISE["down"] - RISE["slam"]))
		out.merge({"z": top_z + (HOVER + bob - top_z) * k, "yaw": 1480.0 + 260.0 * k, "shown": "whole"}, true)
		return out
	out.merge({"z": HOVER + bob, "shown": "hang"}, true)
	return out


## render/meld_drops.ts takenOf: the Meldstone `g` seconds after it was taken, between where it hung and him: {x, y, z, yaw,
## shown, scale, burst, slammed}; empty once it is gone into him.
static func taken_of(g: float, from: Vector2, to: Vector2) -> Dictionary:
	if g < 0.0 or g >= TAKEN["gone"]:
		return {}
	var since: float = g - TAKEN["slam"]
	var burst = null
	if since >= 0.0 and since < TAKEN["burst"]:
		burst = {"scale": 0.6 + since / TAKEN["burst"] * 1.2, "alpha": 1.0 - since / TAKEN["burst"]}
	var top_z: float = TAKEN["top_z"]
	if g < TAKEN["leap"]:
		var k := _ease(g / TAKEN["leap"])
		var p := from.lerp(to, k)
		return {"x": p.x, "y": p.y, "z": HOVER + (top_z - HOVER) * k, "yaw": 720.0 * k, "shown": "apart" if k > 0.4 else "whole", "scale": 1.0, "burst": burst, "slammed": false}
	if g < TAKEN["slam"]:
		# (over his head, wrenched wider and wider apart)
		var k: float = (g - TAKEN["leap"]) / (TAKEN["slam"] - TAKEN["leap"])
		return {"x": to.x, "y": to.y, "z": top_z + 2.0 * sin(k * PI), "yaw": 720.0 + 300.0 * k, "shown": "apart", "scale": 1.0 + 0.3 * k, "burst": burst, "slammed": false}
	# (slammed; dives into his chest)
	var k := clampf((g - TAKEN["slam"] - 0.06) / (TAKEN["gone"] - TAKEN["slam"] - 0.06), 0.0, 1.0)
	return {"x": to.x, "y": to.y, "z": top_z + (TAKEN["chest_z"] - top_z) * k * k, "yaw": 1020.0 + 360.0 * k, "shown": "whole", "scale": 1.15 - 0.95 * k * k, "burst": burst, "slammed": true}


## GIVEN TO THE WORDSMITH (game.ts takeMeldstone; town.gd gives it): he can meld from now on; the two words to meld, and his
## lesson. (Melding itself, at his meld screen, is not in the Godot version yet.)
func give_meldstone() -> void:
	meld = "open"
	sfx.play("rare")
	say(MELD_TAKES, MSG_QUEST)
	var ws: Array = Words.data()["meldstone"]
	gain_word(ws[0], false)
	words[ws[1]] = int(words.get(ws[1], 0)) + 1
	say(MELD_WORDS % [str(Words.word(ws[0])["name"]).to_upper(), str(Words.word(ws[1])["name"]).to_upper()], MSG_QUEST)
	for line in MELD_LESSON:
		say(line, MSG_QUEST)


# --- what is said ---

## A line of what has just happened (game.ts msg; render/fx.ts messages): up for 5 s, a long one longer to be read.
func say(text: String, color := Color.WHITE) -> void:
	msgs.append({"text": text, "t": 0.0, "color": color, "life": maxf(5.0, 2.5 + text.length() * 0.08)})
	if msgs.size() > 5:
		msgs.pop_front()


# --- the vendors ---

## Buy a piece off a vendor's shelf (game.ts buy): its price, into the bag; gone from the shelf.
func buy(shop: String, i: int) -> void:
	var stock: Array = shops.get(shop, [])
	if i < 0 or i >= stock.size():
		return
	var it: Dictionary = stock[i]
	var price := int(it["value"])
	if gold < price:
		say("Not enough gold", MSG_BAD)
		return
	if bag.size() >= BAG:
		say("Your bag is full", MSG_BAD)
		return
	gold -= price
	stock.remove_at(i)
	bag.append(it)
	say("Bought %s" % it["name"], RARITY_COLOR[int(it["rarity"])])
	sfx.play("coin", -4.0)


## Sell a piece from the bag (game.ts sell): a quarter of its worth.
func sell(i: int) -> void:
	if i < 0 or i >= bag.size():
		return
	var it: Dictionary = bag[i]
	var n := floori(float(it.get("value", 0)) * 0.25)
	bag.remove_at(i)
	gold += n
	say("Sold %s: +%d gold" % [it["name"], n], Color(1.0, 0.85, 0.4))
	sfx.play("coin", -4.0)


## (render.ts labels) The names of the pieces lying about, the lowest on the screen first, each moved up 8 game pixels at a
## time (at most 12 times) while it would lie over one already placed.
func _lay_tags() -> void:
	var tags: Array = []
	for d in _drops:
		if d.has("tag") and is_instance_valid(d["tag"]) and is_instance_valid(d["node"]):
			tags.append(d)
	if tags.size() < 2:
		for d in tags:
			d["tag"].position.y = 0.0
		return
	tags.sort_custom(func(a, b): return a["node"].position.y > b["node"].position.y)
	var placed: Array = []
	for d in tags:
		var tag: Node2D = d["tag"]
		var at: Vector2 = d["node"].position / 2.0
		var w := _Tag.PF.width(tag.text, "small") + 4.0
		var x := roundf(at.x - w / 2.0)
		var y0 := roundf(at.y - 20.0)
		var y := y0
		for tries in 12:
			var hit := false
			for p in placed:
				if absf(p.y - y) < 8.0 and x < p.x + p.z and p.x < x + w:
					hit = true
					break
			if not hit:
				break
			y -= 8.0
		placed.append(Vector3(x, y, w))
		tag.position.y = (y - y0) * 2.0


## A piece's name over it as it lies on the floor (render.ts labels): in the small letters on a dark strip, 20 game pixels up,
## in its rarity's colour, over the dark.
class _Tag extends Node2D:
	const PF := preload("res://scripts/pixel_font.gd")
	var text := ""
	var color := Color.WHITE

	func _draw() -> void:
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		var t := text if text.length() <= 30 else text.substr(0, 29) + "."
		var w := PF.width(t, "small") + 4.0
		var x := roundf(-w / 2.0)
		var y := -20.0
		draw_rect(Rect2(x, y - 1.0, w, 7.0), Color(Color("#07050a"), 0.78))
		PF.draw(self, t, x + 2.0, y, color, {"font": "small"})


## A WORD LYING ON THE FLOOR (render.ts: the drops, and drawWordDrops): its rune stone, hopping up as it lands (9 game
## pixels over 0.4 s) and bobbing where it hangs; over everything, a shaft of its own light 50 tall that grows in 0.35 s
## and flickers, and its name on a plate above it, in its colour, that can be read from across the room.
class _WordDrop extends Node2D:
	var sheet: Texture2D
	var src := Rect2()
	var anchor := Vector2.ZERO
	var color := Color.WHITE
	var title := ""
	var phase := 0.0
	var age := 0.0
	var clock := 0.0
	var _light

	func _ready() -> void:
		_light = _WordLight.new()
		_light.drop = self
		_light.z_index = 60
		add_child(_light)

	func _process(dt: float) -> void:
		age += dt
		clock += dt
		queue_redraw()
		_light.queue_redraw()

	func _draw() -> void:
		var pop := sin(age / 0.4 * PI) * 9.0 if age < 0.4 else 0.0
		var bob := sin(clock * 4.0 + phase) * 1.5 + 3.0
		draw_texture_rect_region(sheet, Rect2(-anchor + Vector2(0, roundf(-(pop + bob) * 2.0)), src.size), src)


## (the shaft of light a word on the floor stands in, and its name on its plate: over everything, in game pixels)
class _WordLight extends Node2D:
	const PF := preload("res://scripts/pixel_font.gd")
	var drop

	func _draw() -> void:
		draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
		var grow := minf(1.0, maxf(0.0, drop.age) / 0.35)
		var t: float = drop.clock + drop.phase
		var i := 0.0
		while i < 50.0 * grow:
			var k := 1.0 - i / 50.0
			draw_rect(Rect2(-3, -8 - i, 7, 2), Color(drop.color, 0.32 * k * (0.8 + 0.2 * sin(t * 9.0 + i * 0.4))))
			draw_rect(Rect2(0, -8 - i, 1, 2), Color(1, 1, 1, 0.55 * k))
			i += 2.0
		var tw: float = PF.width(drop.title)
		var px := -floorf(tw / 2.0) - 4.0
		var py := -42.0 + roundf(sin(drop.clock * 3.0 + drop.phase) * 1.5) - roundf((1.0 - grow) * 8.0)
		draw_rect(Rect2(px, py, tw + 8.0, 13.0), drop.color)
		draw_rect(Rect2(px + 1.0, py + 1.0, tw + 6.0, 11.0), Color("#1b1622"))
		PF.draw(self, drop.title, px + 4.0, py + 3.0, drop.color)


## ONE OF THE GAME'S OWN PICTURES OF A FILM (assets/fx: tools/godot_fx.ts; perils.gd holds the sheets), stood among the figures:
## the Meldstone's (here), the town's gate's (town.gd).
class _FilmPic extends Node2D:
	const Perils := preload("res://scripts/perils.gd")
	var _s := Sprite2D.new()

	func _init() -> void:
		_s.centered = false
		_s.region_enabled = true
		add_child(_s)

	## Picture `i` of the film `name` (its `stand` layer), its floor point at `at` (picture pixels), sorted at depth `d`, drawn
	## `up` picture pixels over it, `scale` times its size about that point (render.ts stand), `alpha` as strong. False, and
	## hidden, where the film or the picture is not there.
	func put(name: String, i: int, at: Vector2, d: float, up := 0.0, scale := 1.0, alpha := 1.0) -> bool:
		var F = Perils._fx.get("films", {}).get(name)
		var L: Array = F["layers"].get("stand", []) if F != null else []
		visible = i >= 0 and i < L.size() and int(L[i]) >= 0 and alpha > 0.0
		if not visible:
			return false
		var q: Array = Perils._fx["pics"][int(L[i])]
		position = Vector2(at.x, d * 16.0)
		_s.texture = Perils._sheet(int(q[0]))
		_s.region_rect = Rect2(q[1], q[2], q[3], q[4])
		_s.offset = Vector2(q[5], q[6])
		_s.position = Vector2(0.0, at.y - up - d * 16.0)
		_s.scale = Vector2(scale, scale)
		_s.modulate.a = alpha
		return true
