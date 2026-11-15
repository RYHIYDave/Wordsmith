## DOORS AND GATES (game/doors.ts stepDoors; game.ts updateDoors, dropGate, raiseGate, wellInside, bossWaits, bossIntro):
## the floor's doors and the boss's gate as the game has them. The owner, 7 Oct 2026 (game/doors.ts): "Doors are always unlocked
## and open as you get near them", and "Dungeon Boss always has a big gate that locks you in with him once you pass through the
## opening"; and 20:16, "I don’t want monsters to open doors".
##   A DOOR swings open (0.32 s) for the hero alone, when he comes within 2.6 tiles of the middle of its opening, and stays
##   open. Until it begins to, its tile holds monsters and stops sight and shots (FloorMap.shut), and what is in its room is
##   out of his reach while he is outside (monsters.gd shut_in).
##   THE BOSS'S GATE is up until he is 2.2 tiles inside the boss's hall with the boss alive: then it falls (0.22 s) and its
##   doorway is wall to everything, until the boss is dead, when it rises (1.1 s).
##   THE BOSS WAITS (BOSS_INTRO): standing at the back of his hall, looking at the hero, nothing harming him ("Not yet"), until
##   his gate has fallen and he has said his line (3.2 s): his line over his head for 1.9 s, his name across the screen from
##   1 s in; then he fights.
##   A SEALED DOOR (THE TRAPS, game/doors.ts 'worddoor'), a door whose leaf is a slab with the rune of a word, opens to nobody
##   who comes near: only to a hit from an attack carrying its word (game.ts unseal: the hit reaching within its reach and 0.65
##   of its middle); then it swings open as a door does, and stays open. Sealed, its tile is wall to whatever walks, flies, is
##   shot or looks. The first time it is seen from near, a line says what it wants: floor 2's POWER, floor 3's FLAME, floor
##   4's POISON (the door's `word` in the floor's layout), whichever slot of the attack the word is in, in front or behind.
##   A GATE WITH A LEVER (THE MIX, game/doors.ts 'gate'; game.ts pullLever): in the way in of one room of the main path, DOWN as
##   he comes to the floor, wall to whatever walks, flies, is shot or looks; the first time it is seen from near a line says
##   so. Its lever stands in a small room at a dead end nearby: he pulls it by walking up to it (within 1.5 tiles), and the
##   gate rises (1.1 s) and stays up.
##   THE GATES OF A ROOM THAT LOCKS ('trapgate'; game.ts updateLocks): one in every doorway of it, up, until he is inside the
##   room, 2.7 tiles and more from the middle of every doorway of it, with a living monster of the room's own packs inside;
##   then they fall, and rise when none of that pack is left alive in the room.
##   (Floor 5's temple door, 'templedoor', is temple.gd's; floor 3's fire in the boss's gateway, furnace.gd's.)
## Their pictures as they open: look.gd show_door (what the game's renderer draws at each step, tools/godot_looks.ts).
extends Node

const FloorMap := preload("res://scripts/floor_map.gd")
const Words := preload("res://scripts/words.gd")

const DOOR_NEAR := 2.6
const DOOR_SWING := 0.32
const GATE_FALL := 0.22
const GATE_RISE := 1.1
const GATE_INSIDE := 2.2
## (game/doors.ts LEVER_NEAR, LOCK_CLEAR)
const LEVER_NEAR := 1.5
const LOCK_CLEAR := 2.7
## (defs.ts BOSS_INTRO, BOSS_LINES)
const INTRO := 3.2
const SAY_FOR := 1.9
const LINES := {
	"warden": ["None leave my halls.", "Another one for the cells.", "The keys are mine. So are you."],
	"headsman": ["Kneel.", "The block is waiting.", "Your name is on my list."],
	"chained": ["HRRRNNGH!", "Mmmph... FREE...", "GRRRAAAH!"],
	"amalgam": ["Join us.", "More bones. More.", "We are many. Be one of us."],
	"fleshmancer": ["Your bones will serve.", "Fall, and rise for me.", "The cult thanks you for the flesh."],
	# (ACT 1, THE DESCENT)
	"unfinished": ["The chisel never finished me.", "Stone does not tire.", "Lie still. Be carved."],
	"queen": ["SKRAAAAA!", "KRAAA-AAK!", "SKREEEEE!"],
	"cantor": ["Hear the hymn.", "Your echo is mine now.", "Sing with me. Scream with me."],
	"stag": ["HRRAAAWWNN!", "BRRRAAAWN!", "HAAARRRNN!"],
	"eye": ["You are seen.", "Drown.", "The siege is my dream. Sleep in it."],
}
## (ACT 1, game.ts meetOutdoorBoss: out on the open ground there is no gate to fall behind the hero: the boss waits until he
## comes into his ground, well inside its area (blobDist under 0.8) or within 6 tiles of him; then he is woken and says his
## line as a boss whose gate has fallen does)
const MEET_INSIDE := 0.8
const MEET_NEAR := 6.0
const BossGround := preload("res://scripts/act1/boss_ground.gd")
## (ACT 1: out on the open ground, whether the hero has come into the boss's ground on this floor yet)
var _met := false

var main  # main.gd
var map: FloorMap
var look  # look.gd, or null where the place has no recorded look
var hero
var monsters  # monsters.gd
var sfx

var intro_t := 0.0
## (MSG's colours; a word's name is the game's own, defs.ts WORDS, by words.gd: floor 2's door wants POWER, floor 3's FLAME,
## floor 4's POISON)
const OMEN := Color("#ffc24a")
const WORD := Color("#7af8f0")
const GOOD := Color("#8af078")
const AGGRO := 9.0


func _ready() -> void:
	for i in map.doors.size():
		_show(i)
		# (a sealed door's tile: wall to whatever walks, flies, is shot or looks, until its seal breaks)
		var d: Dictionary = map.doors[i]
		if d["kind"] == "worddoor" and int(d["want"]) == 0:
			for t in d["way"]:
				map.shut[int(t)] = 1
				map.walk[int(t)] = 0
		# (THE MIX: a lever's gate begins down, its doorway wall to everything: game/level.ts)
		if d["kind"] == "gate" and int(d["want"]) == 0:
			for t in d["tiles"]:
				map.shut[int(t)] = 1
				map.walk[int(t)] = 0


func _process(dt: float) -> void:
	if map == null or hero == null:
		return
	var boss = _boss()
	var alive: bool = boss != null and not boss.dead
	var gate_up := false
	for i in map.doors.size():
		var d: Dictionary = map.doors[i]
		var kind: String = d["kind"]
		# (a door opens for the hero alone, as he comes near)
		if kind == "door" and int(d["want"]) == 0 and hero.alive:
			var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
			if hero.world.distance_squared_to(mid) < DOOR_NEAR * DOOR_NEAR:
				d["want"] = 1
				for t in d["way"]:
					map.shut[int(t)] = 0
				sfx.play("door", linear_to_db(0.5))
		# (a sealed door, the first time it is seen from near: what it wants)
		if kind == "worddoor" and int(d["want"]) == 0 and not d.get("told", false) and hero.alive:
			var at := Vector2(d["middle"]["x"], d["middle"]["y"])
			if hero.world.distance_to(at) <= AGGRO and monsters.sees(hero.world, at + (hero.world - at).normalized() * 0.7):
				d["told"] = true
				if main.loot != null:
					main.loot.say("A sealed door. It wants %s." % _word_name(d.get("word", "")).to_upper(), OMEN)
		# (THE MIX: a lever's gate, down: the first time it is seen from near, a line says what it is)
		if kind == "gate" and int(d["want"]) == 0 and not d.get("told", false) and hero.alive:
			var gat := Vector2(d["middle"]["x"], d["middle"]["y"])
			if hero.world.distance_to(gat) <= AGGRO and _in_sight(d["tiles"]):
				d["told"] = true
				_say("A gate bars the way. Its lever is near.", OMEN)
		# (the boss's gate: down behind him once he is well inside with the boss alive; up once the boss is dead)
		if kind == "bossgate":
			if int(d["want"]) == 1 and alive and hero.alive and _well_inside(d, hero.world):
				_drop(d)
				_intro(boss)
			elif int(d["want"]) == 0 and not alive:
				_raise(d)
			if int(d["want"]) == 1:
				gate_up = true
		var open := float(d["open"])
		var want := float(d["want"])
		if open != want:
			var secs := DOOR_SWING if kind == "door" or kind == "worddoor" else (GATE_RISE if want == 1.0 else GATE_FALL)
			d["open"] = move_toward(open, want, dt / secs)
			_show(i)
	_levers()
	_locks()
	# (ACT 1: out on the open ground he waits, as behind a gate still up, until the hero comes into his ground: meetOutdoorBoss)
	# (floor 10, the Swamp Colossus: he lies out in the water off his stone, and his ground is met by the stone's own rule,
	# act1/stone.gd _meet; here he is not held)
	if map.stone != null:
		pass
	elif map.land != null and alive and not _met:
		var area = map.area("boss")
		if hero.alive and ((area != null and FloorMap.blob_dist(area["blob"], hero.world) < MEET_INSIDE) or boss.world.distance_to(hero.world) <= MEET_NEAR):
			_met = true
			if boss.state == "sleep":
				monsters.wake(boss)
			_intro(boss)
		else:
			gate_up = true
	# (ACT 1, OUT ON THE OPEN GROUND: there is no gate to fall behind the hero; the boss waits for him to come into his ground)
	# (a floor whose areas are not exported beside its layout: its boss's ground, tools/godot_boss_ground.ts)
	elif map.land == null and _open_ground():
		if not _met and alive and hero.alive and _into_ground(boss):
			_met = true
			_intro(boss)
		gate_up = not _met
	if intro_t > 0.0:
		intro_t = maxf(0.0, intro_t - dt)
	if boss != null:
		var waited: bool = boss.waits
		boss.waits = alive and (gate_up or intro_t > 0.0)
		# (his wait over: he fights)
		if waited and not boss.waits and boss.state == "sleep":
			monsters.wake(boss)


## (game.ts unseal) A hit of his reaches everything within `rad` of `at`: a sealed door in its reach opens if the attack
## carries its word, in front or behind. `words`: {front, behind}, the words in the attack's slots on each side, as arrays
## (loadout.gd fronts, behinds); a side may also be the one word the screens before the loadout passed, "" for none.
func unseal(words: Dictionary, at: Vector2, rad: float) -> void:
	var carried: Array = _side(words.get("front")) + _side(words.get("behind"))
	for d in map.doors:
		var w: String = d.get("word", "")
		if d["kind"] != "worddoor" or int(d["want"]) != 0 or w == "":
			continue
		var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
		if mid.distance_to(at) > rad + 0.65:
			continue
		if not carried.has(w):
			continue
		d["want"] = 1
		d["told"] = true
		for t in d["way"]:
			map.shut[int(t)] = 0
			map.walk[int(t)] = 1
		sfx.play("sealed_door", linear_to_db(0.9))
		sfx.play("word", linear_to_db(0.6))
		if main.loot != null:
			main.loot.say("The %s seal breaks." % _word_name(w).to_upper(), WORD)


## The words of one side of an attack, as a list: an array's own (its empty slots left out), or the one word of a string.
static func _side(side) -> Array:
	if side is Array:
		return side.filter(func(w): return w != null and str(w) != "")
	return [side] if side is String and side != "" else []


## A word's name as the game calls it (defs.ts WORDS: Power, Flame, Poison, ...).
static func _word_name(w: String) -> String:
	return str(Words.data()["words"].get(w, {}).get("name", w.capitalize()))


## The hero fallen and set back where he came in: the boss's gate up again behind him, the boss waiting again; and the gates
## of a room that locks, up again (he is outside it now).
func reset() -> void:
	intro_t = 0.0
	_met = false
	for d in map.doors:
		if (d["kind"] == "bossgate" or d["kind"] == "trapgate") and int(d["want"]) == 0:
			_raise(d)


func _show(i: int) -> void:
	# (floor 5's temple door is shown by its own film: temple.gd)
	if look != null and map.doors[i]["kind"] != "templedoor":
		look.show_door(i, float(map.doors[i]["open"]))


func _say(text: String, color: Color) -> void:
	if main != null and main.loot != null:
		main.loot.say(text, color)


## Is any of these tiles in his sight now (sight.gd; where the floor has no sight, always)?
func _in_sight(tiles: Array) -> bool:
	if main == null or main.sight == null:
		return true
	for t in tiles:
		if main.sight.visible_now[int(t)] == 1:
			return true
	return false


## (THE MIX) THE HERO PULLS A LEVER by walking up to it: its gate rises, and stays up (game.ts pullLever: the lever knows its
## gate by the room the gate bars; one that knows none raises every lever's gate of the level). Not floor 3's forge crank, a
## lever by kind: that one is turned (furnace.gd).
func _levers() -> void:
	if not hero.alive:
		return
	for p in map.props:
		if p["kind"] != "lever" or int(p["state"]) != 0 or p.get("name", "") == "crank":
			continue
		if hero.world.distance_to(Vector2(p["x"], p["y"])) >= LEVER_NEAR:
			continue
		p["state"] = 1
		if look != null:
			look.prop_opened(int(p["i"]))
		var room := -1
		for l in map.levers:
			if int(l["x"]) == int(p["tx"]) and int(l["y"]) == int(p["ty"]):
				room = int(l["room"])
		var raised := 0
		for d in map.doors:
			if d["kind"] != "gate" or int(d["want"]) != 0 or (room >= 0 and int(d["room"]) != room):
				continue
			_raise(d)
			raised += 1
		sfx.play("door", linear_to_db(0.8))
		if raised > 0:
			_say("A gate rises.", GOOD)


## (THE MIX) THE ROOMS THAT LOCK (game.ts updateLocks): their gates fall when the hero is inside the room, LOCK_CLEAR and more
## from the middle of every one of its doorways, and a living monster of the room's own packs is inside it with him; they rise
## when no living monster of the room's own packs is inside the room.
func _locks() -> void:
	for r in map.rooms:
		if not r.get("locks", false):
			continue
		var gates: Array = []
		for d in map.doors:
			if d["kind"] == "trapgate" and int(d["room"]) == int(r["id"]):
				gates.append(d)
		if gates.is_empty():
			continue
		var pack := false
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.pack_id >= 0 and m.pack_id < map.packs.size() and int(map.packs[m.pack_id]) == int(r["id"]) and FloorMap.in_room(r, m.world):
				pack = true
				break
		var down := false
		for d in gates:
			if int(d["want"]) == 0:
				down = true
		if not down:
			if not pack or not hero.alive or not FloorMap.in_room(r, hero.world):
				continue
			var clear := true
			for d in gates:
				if hero.world.distance_to(Vector2(d["middle"]["x"], d["middle"]["y"])) < LOCK_CLEAR:
					clear = false
			if not clear:
				continue
			for d in gates:
				_drop(d)
			_say("The gates fall.", OMEN)
		elif not pack:
			for d in gates:
				if int(d["want"]) == 0:
					_raise(d)
			_say("The gates rise.", GOOD)


func _boss():
	if monsters == null:
		return null
	for m in monsters.list:
		if is_instance_valid(m) and m.boss:
			return m
	return null


## Is this place in the gate's room, and far enough past its line that it may fall behind whoever stands there?
func _well_inside(d: Dictionary, at: Vector2) -> bool:
	var r: Dictionary = map.room(int(d["room"]))
	if not FloorMap.in_room(r, at):
		return false
	var inside := ((at.y if d["alongX"] else at.x) - float(d["plane"])) * -float(d["out"])
	return inside >= GATE_INSIDE


## The gate falls: its doorway wall to whatever walks, flies, is shot or looks; anything standing in it put inside the hall.
func _drop(d: Dictionary) -> void:
	d["want"] = 0
	var tiles: Array = d["tiles"]
	for t in tiles:
		map.walk[int(t)] = 0
		map.shut[int(t)] = 1
	for m in monsters.list:
		if not is_instance_valid(m) or m.dead or not tiles.has(floori(m.world.y) * map.w + floori(m.world.x)):
			continue
		var back: float = float(d["plane"]) - float(d["out"]) * (0.5 + m.r)
		var to := Vector2(m.world.x, back) if d["alongX"] else Vector2(back, m.world.y)
		if monsters.clear(to.x, to.y, minf(m.r, 0.42)):
			m.world = to
	hero.shake()
	sfx.play("gate_fall")


func _raise(d: Dictionary) -> void:
	d["want"] = 1
	for t in d["tiles"]:
		map.walk[int(t)] = 1
		map.shut[int(t)] = 0
	sfx.play("gate_rise", linear_to_db(0.8))


## (BOSS_INTRO, ACT 1: game.ts bossWaits, meetOutdoorBoss) A floor of the descent: its boss is out on the open ground, with no gate
## of his own.
func _open_ground() -> bool:
	if not (map.ways is Dictionary) or map.ways.get("a1") == null:
		return false
	for d in map.doors:
		if d["kind"] == "bossgate":
			return false
	return true


## Whether the hero has come into the boss's ground: well inside his area (assets/floor<N>/boss.json), or within 6 tiles of him.
func _into_ground(boss) -> bool:
	return BossGround.inside(BossGround.of(map.depth), hero.world) or hero.world.distance_to(boss.world) <= MEET_NEAR


## His gate down behind the hero, the boss says his line, and his name comes up across the screen.
func _intro(boss) -> void:
	intro_t = INTRO
	var lines: Array = LINES.get(boss.kind, [])
	if not lines.is_empty():
		boss.say(lines.pick_random(), SAY_FOR)
	if main != null:
		main.boss_card(boss.title, INTRO)
