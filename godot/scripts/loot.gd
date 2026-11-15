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
##   THE FALLEN WORDSMITH (game.ts placeBody, searchBody): walking within 1.3 tiles of him searches him: the Master
##   Rune-stone, and the flasks filled. In the game it is carried back to the wordsmith in town, who lights the ring and
##   gives the first word, POWER (giveRingWord). The town is not in the Godot version yet: here the ring is lit, and
##   the word given, as the stone is found (a stand-in, said so on the screen).
extends Node

const Iso := preload("res://scripts/iso.gd")
const Hero := preload("res://scripts/hero.gd")

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
var words := {"power": 0}
var quest := ""
var ring_lit := false
## the wordsmith has asked for the stone (guide: "Take the STAIRS down" from then on)
var quest_given := false
## seconds left of the "carry" or "ring" prompt (QUEST_ITEM.promptSecs)
var prompt_t := 0.0
var main  # main.gd
## a level-up's +5 still to be placed (inventory.gd asks which)
var points := 0
var msgs: Array = []  # {text, t, color}

var sheet: Texture2D
var pics := {}
var stat_info := {}
var _pools := {}
## (any floor: the same pools as the game rolls them on each floor, tools/godot_loot.ts; floor 1's where a floor has none)
var _by_depth := {}
## the vendors' shelves (Game.rollShop on his first day in town), and the word's plain lines (defs.ts WORDS.power)
var shops := {}
var power_text := {}
var _tune := {}
var _attr := {}
var _drops: Array = []  # {kind, at, node, age, amount?, item?}
var _body = null
## (floor 1's fallen wordsmith, where the loot's own file has him; a floor's own is where its layout says: FloorMap.body)
var _body1 := Vector2.ZERO
var _body_floor := 1
var _font: Font


func _ready() -> void:
	_font = ThemeDB.fallback_font
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + "/items.json"))
	_pools = data["pools"]
	_by_depth = data.get("byDepth", {})
	shops = data["shops"]
	power_text = data["power"]
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
		_body = {"at": Vector2(data["body"]["x"], data["body"]["y"]), "searched": false, "node": null}
		_body1 = _body["at"]
	derive()
	hero.life = hero.max_life


func setup_body() -> void:
	if _body == null:
		return
	var n := Sprite2D.new()
	n.texture = _pic_tex("body")
	n.centered = false
	n.offset = -pics["body"]["anchor"]
	n.position = Iso.to_screen(_body["at"].x, _body["at"].y)
	stands.add_child(n)
	_body["node"] = n


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
		"dmg_pct": g.call("dmgPct") + g.call("physPct"),
		"crit_chance": float(_tune["baseCrit"]) + g.call("critChance") + dex * float(_attr["dexCrit"]),
		"crit_mult": float(_tune["baseCritMult"]) + g.call("critMult"),
		"life_regen": float(_tune["baseLifeRegen"]) + g.call("lifeRegen"),
		"life_on_hit": g.call("lifeOnHit"), "life_on_kill": g.call("lifeOnKill"),
		"armor": g.call("armor"), "move_speed": g.call("moveSpeed"), "area": 1.0 + g.call("areaPct") / 100.0,
		"gold_find": g.call("goldFind"),
	}
	hero.set_max_life(maxf(1.0, life))
	# (his moves' words: the slots his level and the lit ring open, and the numbers the words read. Cooldown recovery as
	# stats.ts derive has it: his gear's, a tenth of its mana and twice its mana regeneration, a quarter of his Intelligence,
	# 60% at most)
	var cdr: float = minf(0.6, (g.call("cdr") + g.call("maxMana") * 0.1 + g.call("manaRegen") * 2.0 + int_ * float(_attr["intCdr"])) / 100.0)
	hero.loadout.set_level(level, ring_lit)
	hero.loadout.set_stats({"str": str_, "dex": dex, "int": int_, "area": hero.stats["area"], "aps": hero.stats["aps"], "cdr": cdr})


# --- what falls ---

## A monster has fallen (monster.gd _die): his experience, and what it leaves (game.ts dropLoot).
func on_kill(m) -> void:
	gain_xp(m.xp)
	hero.heal_flat(hero.stats["life_on_kill"])
	kills += 1
	if kills % KILLS_A_POTION == 0 and potions < POTIONS:
		potions += 1
		say("A flask fills", Color(0.86, 0.3, 0.36))
	if m.summoned:
		return
	var at: Vector2 = m.world
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


## A barrel or an urn broken (game.ts breakProps): maybe gold (1 to 5), a life orb, a piece of gear.
func from_breakable(at: Vector2) -> void:
	if randf() < 0.4:
		_gold(at, randi_range(1, 5))
	if randf() < 0.08:
		_orb(at)
	if randf() < 0.04:
		_item(at, 0)


## A chest opened (game.ts updateProps): one piece (in a treasure vault perhaps two, the first a hoard's), and gold, laid
## before it.
func from_chest(at: Vector2, vault: bool) -> void:
	var before := at + Vector2(0, 0.6)
	var n := 1 + (1 if vault and randf() < 0.5 else 0)
	for i in n:
		_item(before, 2 if vault and i == 0 else 1)
	_gold(before, randi_range(10, 20) * (2 if vault else 1))


## Where a thing lands: about where it fell, on open floor, a little apart from the rest.
func _scatter(at: Vector2) -> Vector2:
	for i in 12:
		var p := at + Vector2(randf_range(-0.9, 0.9), randf_range(-0.9, 0.9))
		if map.walkable(floori(p.x), floori(p.y)):
			return p
	return at


func _gold(at: Vector2, amount: int) -> void:
	var key := "gold:2" if amount >= 30 else ("gold:1" if amount >= 8 else "gold:0")
	_drop("gold", _scatter(at), key, {"amount": amount})


func _orb(at: Vector2) -> void:
	_drop("orb", _scatter(at), "orb", {})


func _item(at: Vector2, quality: int) -> void:
	var here: Dictionary = _by_depth.get(str(map.depth), _pools) if map != null else _pools
	var pool: Array = here[str(quality)]
	var it: Dictionary = pool[randi() % pool.size()].duplicate(true)
	_drop("gear", _scatter(at), it["icon"], {"item": it})


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
	msgs = msgs.filter(func(m): return m["t"] < 3.5)
	_lay_tags()
	if hero == null or not hero.alive:
		return
	if Input.is_action_just_pressed("potion"):
		drink()
	_search_body()
	var keep: Array = []
	for d in _drops:
		d["age"] += dt
		var take := false
		var dist: float = d["at"].distance_to(hero.world)
		if d["age"] >= WAIT:
			if d["kind"] == "gear":
				take = dist <= GEAR_TAKE and _take_item(d["item"])
			else:
				if dist <= PULL:
					d["at"] = d["at"].move_toward(hero.world, FLY * dt)
					d["node"].position = Iso.to_screen(d["at"].x, d["at"].y)
				if d["at"].distance_to(hero.world) <= TAKE:
					take = true
					if d["kind"] == "gold":
						var n := int(round(d["amount"] * (1.0 + hero.stats["gold_find"] / 100.0)))
						gold += n
						say("+%d gold" % n, Color(1.0, 0.85, 0.4))
						sfx.play("gold", -6.0)
					else:
						hero.heal(ORB_HEAL)
						sfx.play("pickup", -6.0)
		if take:
			d["node"].queue_free()
		else:
			keep.append(d)
	_drops = keep


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
	say("Your bag is full", Color(0.96, 0.27, 0.47))
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
		say("Your weapon takes both hands", Color(0.96, 0.27, 0.47))
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
		say("Your bag is full", Color(0.96, 0.27, 0.47))
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
		level += 1
		points += 1
		derive()
		hero.life = hero.max_life
		say("Level %d!" % level, Color(0.35, 0.9, 1.0))
		sfx.play("levelup")


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
	_body["node"].texture = _pic_tex("body:searched")
	_body["node"].offset = -pics["body:searched"]["anchor"]
	# (game.ts searchBody: once the ring is lit, a fallen wordsmith's satchel holds full flasks and a word, his class's first)
	if ring_lit:
		potions = POTIONS
		words["power"] = int(words.get("power", 0)) + 1
		say("A fallen wordsmith. In the satchel: full flasks, and a WORD.", Color(0.35, 0.9, 1.0))
		sfx.play("word")
		return
	# (game.ts searchBody, FIRST_LEVELS: the Master Rune-stone, and the flasks filled; it is carried to the wordsmith in town)
	quest = "heart"
	potions = POTIONS
	prompt_t = 6.0
	say("You carry the MASTER RUNE-STONE", Color(0.35, 0.9, 1.0))
	sfx.play("pickup")


## (game.ts giveRingWord) The wordsmith gives the word, and the gear screen opens on it (`offer`).
func give_word(w: String) -> void:
	words[w] = words.get(w, 0) + 1
	say("The wordsmith gives you a word: %s." % w.to_upper(), Color(0.35, 0.9, 1.0))
	sfx.play("word")
	if main != null:
		main.offer_word(w)


## A new place: what lay on the floor of the last is gone with it; the fallen wordsmith is on floor 1, searched once his
## stone has been taken (the game lays floor 1 again each time it is come into, its body with it).
func enter_place(m, st: Node2D, mons, is_floor1: bool) -> void:
	map = m
	stands = st
	monsters = mons
	_drops = []
	if _body != null:
		_body["node"] = null
		# (a fallen wordsmith lies on every floor: game/level.ts; where, the floor's layout says)
		var on_floor: bool = m != null and m.depth >= 1 and (is_floor1 or m.body != null) and stands != null and m.rooms.size() > 1
		if on_floor:
			_body_floor = m.depth
			_body["at"] = Vector2(m.body["x"], m.body["y"]) if m.body != null else _body1
			_body["searched"] = false
			setup_body()
			if is_floor1 and (quest != "" or ring_lit):
				_body["searched"] = true
				_body["node"].texture = _pic_tex("body:searched")
				_body["node"].offset = -pics["body:searched"]["anchor"]


## Burn a word into a worn piece (game.ts imbue): one of the outcomes the game itself rolled for that piece.
func burn(word: String, slot: String) -> String:
	var it = gear[slot]
	if it == null or words.get(word, 0) <= 0:
		return "Nothing to burn it into"
	if it["burn"] != null:
		return it["burn"]
	if it["power"].is_empty():
		return "It already has what this word gives"
	var o: Dictionary = it["power"].pick_random()
	it["mods"] = it["mods"] + o["mods"]
	it["lines"] = it["lines"] + o["lines"]
	it["rarity"] = maxi(int(it["rarity"]), int(o["rarity"]))
	it["burn"] = "That piece is full" if it["lines"].size() >= 4 else "It already has what this word gives"
	it["power"] = []
	it["value"] = roundi(float(it.get("value", 0)) * 1.2)
	words[word] -= 1
	derive()
	sfx.play("imbue")
	say("POWER burned into %s" % it["name"], Color(0.35, 0.9, 1.0))
	return ""


# --- what is said, and the HUD's corner ---

func say(text: String, color := Color.WHITE) -> void:
	msgs.append({"text": text, "t": 0.0, "color": color})
	if msgs.size() > 6:
		msgs.pop_front()


func draw_hud(c: Control, font: Font) -> void:
	# his level, his experience toward the next, his gold, his flasks: top left
	var x := 10.0
	var y := 10.0
	c.draw_rect(Rect2(x, y, 180, 44), Color(0.06, 0.08, 0.24, 0.85))
	c.draw_string(font, Vector2(x + 8, y + 15), "LEVEL %d" % level, HORIZONTAL_ALIGNMENT_LEFT, -1, 13, Color(0.35, 0.9, 1.0))
	c.draw_string(font, Vector2(x + 80, y + 15), "%d GOLD" % gold, HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(1.0, 0.85, 0.4))
	var k := clampf(xp / xp_to_next(level), 0.0, 1.0)
	c.draw_rect(Rect2(x + 8, y + 22, 164, 5), Color(0.12, 0.16, 0.4))
	c.draw_rect(Rect2(x + 8, y + 22, 164 * k, 5), Color(0.35, 0.9, 1.0))
	c.draw_string(font, Vector2(x + 8, y + 40), "FLASKS %d (Q)" % potions, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.9, 0.45, 0.5))
	var hint := "I: GEAR" + ("  +5 TO PLACE" if points > 0 else "") + ("  POWER x%d" % words["power"] if words["power"] > 0 else "")
	c.draw_string(font, Vector2(x + 80, y + 40), hint, HORIZONTAL_ALIGNMENT_LEFT, -1, 11, Color(0.35, 0.9, 1.0) if points > 0 or words["power"] > 0 else Color(0.55, 0.6, 0.8))
	# what was just taken or said, under it
	var my := y + 62.0
	for m in msgs:
		var a := clampf(3.5 - m["t"], 0.0, 1.0)
		c.draw_string(font, Vector2(x + 2, my), m["text"], HORIZONTAL_ALIGNMENT_LEFT, -1, 12, Color(m["color"], a))
		my += 15.0


# --- the vendors ---

## Buy a piece off a vendor's shelf (game.ts buy): its price, into the bag; gone from the shelf.
func buy(shop: String, i: int) -> void:
	var stock: Array = shops.get(shop, [])
	if i < 0 or i >= stock.size():
		return
	var it: Dictionary = stock[i]
	var price := int(it["value"])
	if gold < price:
		say("Not enough gold", Color(0.96, 0.27, 0.47))
		return
	if bag.size() >= BAG:
		say("Your bag is full", Color(0.96, 0.27, 0.47))
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
