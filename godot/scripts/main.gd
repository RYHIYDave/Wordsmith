## WORDSMITH IN GODOT: a new Warrior's game, as the TypeScript game has it. He begins in the TOWN (town.gd), its wordsmith
## asking for the Master Rune-stone; the stairs take him down to FLOOR 1 of the Crypt (its layout, its stone and its
## monsters the game's own: tools/godot_export.ts), where the fallen wordsmith lies with the stone; floor 1's gate takes
## him back up. What he carries, wears and knows goes with him (loot.gd); a floor is laid again, its monsters fresh, each
## time it is come into (game.ts enterDungeon).
##   Keys: WASD or the arrows to walk; the left button to strike, the right to whirl, Space to lunge; E to use; Q a flask;
##   I or Tab the gear screen (main.gd _inputs). A controller: the left stick; RT, LT, A; B to use; X a flask.
## Shot mode, for checking it without anyone at the keys:  godot --path godot -- --shots=<folder> [--only=loot|town]
## ANY FLOOR: a place is "town" or "floor<N>"; a floor's files are assets/floor<N>/ (tools/godot_export.ts <seed> <N>) and
## its look assets/looks/floor<N>.* (tools/godot_record.mjs <N>). THE WAYS ON (game/ways.ts; ways.gd): the stairwell that
## opens in the boss's hall when he dies, and the other floors' own ways down. `--place=floor3` begins there (to look at a
## floor); `--only=floors` pictures every floor that is in.
extends Node2D

const FloorMap := preload("res://scripts/floor_map.gd")
const GroundArt := preload("res://scripts/ground_art.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")
const Sfx := preload("res://scripts/sfx.gd")
const Music := preload("res://scripts/music.gd")
const FloorLayer := preload("res://scripts/floor_layer.gd")
const Stands := preload("res://scripts/stands.gd")
const Hero := preload("res://scripts/hero.gd")
const Iso := preload("res://scripts/iso.gd")

const Monsters := preload("res://scripts/monsters.gd")
const Monster := preload("res://scripts/monster.gd")
const Perils := preload("res://scripts/perils.gd")
const Hud := preload("res://scripts/hud.gd")
const Loot := preload("res://scripts/loot.gd")
const Inventory := preload("res://scripts/inventory.gd")
const Minimap := preload("res://scripts/minimap.gd")
const Temple := preload("res://scripts/temple.gd")
const Furnace := preload("res://scripts/furnace.gd")
const Fx := preload("res://scripts/fx.gd")
const Town := preload("res://scripts/town.gd")
const Guide := preload("res://scripts/guide.gd")
const Look := preload("res://scripts/look.gd")
const Doors := preload("res://scripts/doors.gd")
const Props := preload("res://scripts/props.gd")
const Stairs := preload("res://scripts/stairs.gd")
const Waypoint := preload("res://scripts/waypoint.gd")
const Traps := preload("res://scripts/traps.gd")

const FLOOR_DIR := "res://assets/floor1"
const Ways := preload("res://scripts/ways.gd")
const Sight := preload("res://scripts/sight.gd")
## (the deepest floor that has its files)
const FLOORS := 5
const TOWN_DIR := "res://assets/town"
const HERO_DIR := "res://assets/heroes"
const MONSTER_DIR := "res://assets/monsters"
## (game.ts leave: the curtain drawn as he goes from one place to the next)
const CURTAIN := 0.35

## The dark round the edges of the screen (an approximation of render.ts's dark and vignette: the dungeon's deep, the
## town's lighter, VIGNETTE_TOWN), to be replaced by the game's own lighting.
const DARK := """
shader_type canvas_item;
uniform vec4 dark : source_color = vec4(0.02, 0.022, 0.03, 1.0);
uniform float deep = 0.82;
void fragment() {
	vec2 p = (UV - vec2(0.5, 0.53)) * vec2(1.7778, 1.0);
	float a = smoothstep(0.32, 0.98, length(p)) * deep;
	COLOR = vec4(dark.rgb, a);
}
"""

var place := ""
var hero: Hero
var loot: Loot
var sfx: Sfx
var music: Music
var guide: Guide
var town: Town
var map: FloorMap
var _place: Node2D
var _monsters: Monsters
var _doors: Doors
var _stairs: Stairs
var _way: Waypoint
## THE WAYS: the deepest floor whose waypoint he has reached (game.ts wayDepth): the town's waypoint takes him back down to it.
var way_depth := 1
var _hud
var _loot: Loot
var _inv
## (the small map top right, the large one and the pause panel: minimap.gd)
var _mini
var _veil: ColorRect
var _curtain: ColorRect
var _going := false
var _gate := {}
## (the place's recorded look, where it has one, and the hero's own pool of light it gave him)
var look: Look
var _hero_light: Node
## (the floor's ways on: ways.gd)
var ways: Ways
## (what he has seen of the floor: sight.gd)
var sight: Sight
## (floor 5's temple door, its chains and keys: temple.gd; null elsewhere)
var temple: Temple
## (floor 3's furnace, its crank and the fire in the Chained One's way: furnace.gd; null elsewhere)
var furnace: Furnace
## (what the fight shows of a blow and of a word: fx.gd; a place's own)
var fx: Fx


## Which floor a place is (0: the town).
static func depth_of(where: String) -> int:
	return int(where.substr(5)) if where.begins_with("floor") else 0


## The folder of a place's files.
static func dir_of(where: String) -> String:
	return TOWN_DIR if where == "town" else "res://assets/" + where


## Whether a floor's files are there.
static func has_floor(n: int) -> bool:
	return FileAccess.file_exists("res://assets/floor%d/layout.json" % n)


func _ready() -> void:
	_inputs()
	sfx = Sfx.new()
	add_child(sfx)
	music = Music.new()
	add_child(music)
	hero = Hero.new()
	hero.art = BakedHero.new(HERO_DIR, "warrior")
	hero.sfx = sfx
	# (what he carries, wears and knows, from place to place: loot.gd)
	loot = Loot.new()
	loot.hero = hero
	loot.sfx = sfx
	loot.main = self
	add_child(loot)
	_loot = loot
	guide = Guide.new()
	guide.main = self
	_gate = JSON.parse_string(FileAccess.get_file_as_string(TOWN_DIR + "/floor1_gate.json"))

	var layer := CanvasLayer.new()
	_veil = ColorRect.new()
	_veil.set_anchors_preset(Control.PRESET_FULL_RECT)
	_veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var mat := ShaderMaterial.new()
	mat.shader = Shader.new()
	mat.shader.code = DARK
	_veil.material = mat
	layer.add_child(_veil)
	var hud := Hud.new()
	hud.hero = hero
	hud.loot = loot
	hud.main = self
	layer.add_child(hud)
	_hud = hud
	var mini := Minimap.new()
	mini.main = self
	mini.hud = hud
	layer.add_child(mini)
	_mini = mini
	var inv := Inventory.new()
	inv.loot = loot
	inv.hero = hero
	inv.main = self
	layer.add_child(inv)
	_inv = inv
	mini.inv = inv
	_curtain = ColorRect.new()
	_curtain.set_anchors_preset(Control.PRESET_FULL_RECT)
	_curtain.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_curtain.color = Color(0, 0, 0, 0)
	layer.add_child(_curtain)
	add_child(layer)

	var shots := _arg("shots")
	# (a new game begins in town: game.ts constructor, enterTown; shot mode's fights begin on floor 1)
	var first := _arg("place")
	if first == "":
		first = "floor2" if _arg("only") in ["floor2", "f2moves", "f2ways"] else "floor1" if shots != "" and not _arg("only") in ["town", "music", "floors"] else "town"
	_build(first, "start")
	if shots != "":
		_shoot(hero, shots)


## Lay a place out, and set him down in it: `arrive` says where (the town's start, the foot of floor 1's gate, the top of
## the town's stairs).
func _build(where: String, arrive: String) -> void:
	if hero.get_parent() != null:
		hero.get_parent().remove_child(hero)
	if _place != null:
		_place.free()
	place = where
	_place = Node2D.new()
	add_child(_place)
	move_child(_place, 0)
	var dir := dir_of(where)
	map = FloorMap.new(dir + "/layout.json")
	var ground := GroundArt.new(dir)

	# THE PLACE'S LOOK as the game draws it (look.gd), where tools/godot_looks.ts has recorded one; else the plain ground
	var looked := Look.has_look(where)
	var back := Node2D.new()
	_place.add_child(back)
	var floor_layer: Node2D
	if looked:
		floor_layer = Node2D.new()
	else:
		var fl := FloorLayer.new()
		fl.map = map
		fl.art = ground
		floor_layer = fl
	_place.add_child(floor_layer)
	var look_flats := Node2D.new()
	_place.add_child(look_flats)
	# (what lies flat on the floor: a rug, the circle of runes, stairs; then the moves' marks; then everyone, in order)
	var flats := Node2D.new()
	_place.add_child(flats)
	var perils := Perils.new()
	perils.map = map
	_place.add_child(perils)
	var stands := Stands.new()
	perils.stands = stands
	stands.map = map
	stands.art = ground
	stands.build_walls = not looked
	# (every wall stands and fades round him on floors 1 to 5; the town's hall leaves its near walls out)
	stands.fade = where != "town"
	_place.add_child(stands)
	if _hero_light != null:
		_hero_light.queue_free()
		_hero_light = null
	look = null
	if looked:
		look = Look.new()
		look.place = where
		look.back_layer = back
		look.floor_layer = floor_layer
		look.flat_layer = look_flats
		look.stands = stands
		_place.add_child(look)

	hero.map = map
	var at := map.start
	var face := Vector2(1, 0)
	match arrive:
		"start":
			if where == "town":
				face = Vector2(-0.7071, -0.7071)
		"stairs":
			# (game.ts enterDungeon('gate'): 1.7 tiles inside floor 1's gate, facing into the room)
			at = Vector2(_gate["hero"]["x"], _gate["hero"]["y"])
			face = Vector2(_gate["hero"]["fx"], _gate["hero"]["fy"])
		"way":
			# (game.ts enterTown('way'), enterDungeon('way'): out of the waypoint's column of light)
			if where == "town" and looked and look.data.has("waypoint"):
				at = Vector2(look.data["waypoint"]["wx"], look.data["waypoint"]["wy"])
				face = Vector2(0.7071, 0.7071)
			elif map.waypoint != null:
				at = Vector2(map.waypoint["x"], map.waypoint["y"])
		"gate":
			# (game.ts enterTown('stairs'): by the top step of the town's stairs, facing away from them)
			var st: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(TOWN_DIR + "/layout.json"))["stair"]
			at = Vector2(st["x"] - 1.1, st["y"] + 1.0)
			face = Vector2(-1, 0)
		"down":
			# (game.ts enterDungeon: where the floor's way in sets him down, facing as the game has him)
			if map.start_face != Vector2.ZERO:
				face = map.start_face
		"cage":
			# (game.ts enterTown('cage'): up the shaft from floor 5, in the cage in the hall's near corner, looking out of it;
			# ways.ts TOWN_SHAFT)
			at = Vector2(20.5, 18.5)
			face = Vector2(-0.7071, -0.7071)
	hero.world = at
	hero.home = at
	hero.face = face
	stands.add_child(hero)
	stands.hero = hero
	if look != null:
		_hero_light = look.lighting(_place, hero, 170.0 if where == "town" else 165.0)

	var monsters := Monsters.new()
	monsters.map = map
	monsters.sfx = sfx
	monsters.hero = hero
	monsters.stands = stands
	monsters.perils = perils
	monsters.loot = loot
	perils.hero = hero
	perils.sfx = sfx
	perils.look = look if looked else null
	# (what the fight shows of a blow and of a word: the rules tell it, fx.gd draws it. Over the floor and its marks, under
	# what stands)
	fx = Fx.new()
	_place.add_child(fx)
	_place.move_child(fx, perils.get_index() + 1)
	hero.fx = fx
	monsters.fx = fx
	_place.add_child(monsters)
	if where != "town":
		monsters.load_floor(dir + "/monsters.json", MONSTER_DIR)
	# (the films of what this floor's kinds mark and throw up: fetched now, behind the game; the other floors' let go)
	var kinds := {}
	for m in monsters.list:
		kinds[m.kind] = true
	perils.warm(kinds.keys())
	hero.monsters = monsters
	_monsters = monsters
	# (the floor's doors and the boss's gate: doors.gd)
	_doors = null
	hero.doors = null
	if not map.doors.is_empty():
		_doors = Doors.new()
		_doors.main = self
		_doors.map = map
		_doors.look = look if looked else null
		_doors.hero = hero
		_doors.monsters = monsters
		_doors.sfx = sfx
		_place.add_child(_doors)
		hero.doors = _doors
	# (floor 5: the temple's door, barred by two chains until both keys are brought: temple.gd)
	temple = null
	if map.temple != null:
		temple = Temple.new()
		temple.main = self
		temple.map = map
		temple.look = look if looked else null
		temple.hero = hero
		temple.monsters = monsters
		temple.sfx = sfx
		_place.add_child(temple)
	# (floor 3 while its furnace burns: the fire in the Chained One's gateway, the forge crank: furnace.gd)
	furnace = null
	if map.furnace != null:
		furnace = Furnace.new()
		furnace.main = self
		furnace.map = map
		furnace.look = look if looked else null
		furnace.hero = hero
		furnace.monsters = monsters
		furnace.sfx = sfx
		_place.add_child(furnace)
	# (the floor's chests, barrels and urns: props.gd)
	hero.props = null
	if not map.props.is_empty():
		var props := Props.new()
		props.map = map
		props.look = look if looked else null
		props.hero = hero
		props.loot = loot
		props.sfx = sfx
		_place.add_child(props)
		hero.props = props
	# (the stairwell down in the boss's hall, shut until he falls: stairs.gd)
	_stairs = null
	if not map.stairs.is_empty():
		var stairs := Stairs.new()
		_stairs = stairs
		stairs.main = self
		stairs.map = map
		stairs.look = look if looked else null
		stairs.hero = hero
		stairs.monsters = monsters
		stairs.loot = loot
		stairs.sfx = sfx
		_place.add_child(stairs)
	# (the floor's traps: traps.gd)
	if looked and not map.hazards.is_empty() and look.data.has("traps"):
		var traps := Traps.new()
		traps.map = map
		traps.look = look
		traps.hero = hero
		traps.monsters = monsters
		traps.sfx = sfx
		_place.add_child(traps)
	# (THE WAYS: the waypoint, at the start of every floor but the first and in town: waypoint.gd)
	_way = null
	if looked and look.data.has("waypoint"):
		_way = Waypoint.new()
		_way.main = self
		_way.look = look
		_way.hero = hero
		_way.sfx = sfx
		_way.in_town = where == "town"
		_place.add_child(_way)
		if where != "town":
			way_depth = maxi(way_depth, map.depth)
		if arrive == "way":
			_way.awake = true
			look.wake_waypoint()
			look.play_warp(0.25)
	# (FLOOR_NAMES: the floor's own name across the screen as he comes into it, its level under it: ui/cards.ts drawFloorCard;
	# gone with the floor if he leaves it while it is still up)
	if where != "town" and _hud != null:
		_hud.floor_card_for(where)
	elif _hud != null:
		_hud.floor_card = {}
	loot.enter_place(map, stands, monsters, where == "floor1")
	# (the ways on from a floor that has no stairwell: floor 3's door, floor 4's cave, floor 5's cage: ways.gd)
	ways = null
	if where != "town" and map.stairs.is_empty():
		ways = Ways.new()
		ways.main = self
		ways.map = map
		ways.hero = hero
		ways.monsters = monsters
		ways.look = look if looked else null
		ways.sfx = sfx
		_place.add_child(ways)
	# (what he has seen: sight.gd; the town is seen whole; --seeall, a floor too)
	sight = null
	if where != "town":
		sight = Sight.new()
		sight.map = map
		sight.hero = hero
		sight.look = look if looked else null
		sight.monsters = monsters
		sight.all = _arg("seeall") != "" or not (looked and look._fogged)
		_place.add_child(sight)
		if looked:
			look.sight = sight

	town = null
	if where == "town":
		# (game.ts enterTown: life and flasks filled)
		hero.life = hero.max_life
		loot.potions = loot.POTIONS
		if loot.quest != "":
			loot.prompt_t = 6.0
		town = Town.new()
		town.main = self
		town.hero = hero
		town.loot = loot
		town.sfx = sfx
		town.stands = stands
		town.flats = flats
		town.looked = looked
		_place.add_child(town)
		sfx.background("fire_small_loop.wav", "")
		_veil.material.set_shader_parameter("deep", Look._num(look.data.get("vignette"), 0.26) if looked else 0.45)
	else:
		if not looked and where == "floor1":
			_floor_gate(flats)
		var n := depth_of(where)
		sfx.background("bed_f%d_loop.wav" % n, "amb_f%d" % n)
		_veil.material.set_shader_parameter("deep", Look._num(look.data.get("vignette"), 0.62) if looked else 0.82)


## Floor 1's stairs up to the town, seen through its gate's arch (render.ts flatWays), drawn with the floor.
func _floor_gate(flats: Node2D) -> void:
	var data: Dictionary = {}
	for p in JSON.parse_string(FileAccess.get_file_as_string(TOWN_DIR + "/pics.json")):
		if p["name"] == _gate["pic"]:
			data = p
	if data.is_empty():
		return
	var n := Sprite2D.new()
	n.texture = load(TOWN_DIR + "/pics.png")
	n.region_enabled = true
	n.region_rect = Rect2(data["x"], data["y"], data["w"], data["h"])
	n.centered = false
	n.offset = -Vector2(data["ax"], data["ay"])
	n.position = Iso.to_screen(_gate["up"]["x"], _gate["up"]["y"])
	flats.add_child(n)


func _process(dt: float) -> void:
	# FLOOR 1'S GATE: walking into its doorway takes him up to the town (game.ts leave('gateOut'), enterTown('stairs'))
	if place == "floor1" and hero.alive and not _going:
		var tx := floori(hero.world.x)
		var ty := floori(hero.world.y)
		for t in _gate["tiles"]:
			if tx == int(t[0]) and ty == int(t[1]):
				go_to("town", "gate")
				break
	if guide.use_t > 0.0:
		guide.use_t -= dt
	# (floor 2: the vignette goes by where he is, under the open sky or indoors: look.gd zones)
	if look != null and look.vignette_now >= 0.0:
		_veil.material.set_shader_parameter("deep", look.vignette_now)
	music.level_music(_music_place(), _in_fight(), dt)


## Which place's music (game/level_music.ts musicPlace): the town's, or floor 1's.
func _music_place() -> String:
	return "town" if place == "town" else "f%d" % depth_of(place)


## Is there a fight on: something awake within reach of him (game.ts inFight; no doors here yet to shut one in)?
func _in_fight() -> bool:
	if _monsters == null:
		return false
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and m.state != "sleep" and m.world.distance_to(hero.world) < Music.NEAR and not _monsters.shut_in(m):
			return true
	return false


## Go to another place: the curtain drawn (0.35 s), the place laid out, the curtain lifted.
func go_to(where: String, arrive: String) -> void:
	if _going:
		return
	_going = true
	var tw := create_tween()
	tw.tween_property(_curtain, "color:a", 1.0, CURTAIN)
	await tw.finished
	_build(where, arrive)
	var back := create_tween()
	back.tween_property(_curtain, "color:a", 0.0, CURTAIN)
	await back.finished
	_going = false


## Down the stairwell (game.ts leave('down'), takeWay): the next floor, where he comes in at its start, looking down the
## screen and to the right (enterDungeon).
func go_down() -> void:
	var next := "floor%d" % (map.depth + 1)
	if not FileAccess.file_exists("res://assets/" + next + "/layout.json"):
		loot.say("The stairs go down into the dark. (Floor %d is not in the Godot version yet.)" % (map.depth + 1))
		return
	go_to(next, "down")


## By the waypoint (waypoint.gd): no curtain, its column of light hides him; the place laid out, he comes out of its light.
func go_warp(where: String) -> void:
	if _going:
		return
	_build(where, "way")


## What E would do where he stands: [what is shown, what it does] (town.gd; the waypoint, waypoint.gd).
func prompt() -> Array:
	if _way != null and _way.here():
		return _way.prompt()
	return town.prompt if town != null else ["", ""]


## What the game says of a floor's way on (game.ts `kill`, updateWays): as it opens, and once it is open.
func say_way(kind: String, open: bool) -> void:
	var gold := Color("#ffd27a")
	if not open:
		return
	match kind:
		"exit":
			loot.say("The door behind his hall stands open. The way down.", gold)
		"cave":
			loot.say("A cave behind the wall. The way down.", gold)


## A place's name as the game writes it top left (defs.ts floorTitle: "Prison Level 2").
func place_title() -> String:
	if map != null and map.title.has("level"):
		return str(map.title["level"])
	return ""


## The boss's name across the screen for so many seconds (doors.gd, as his gate falls).
func boss_card(name: String, secs: float) -> void:
	_hud.card = {"name": name, "t": 0.0, "secs": secs}


func show_words(text: String) -> void:
	_hud.words = text
	_hud.words_frame = Engine.get_process_frames()


func open_shop(id: String) -> void:
	_inv.open_shop(id)


## (game.ts giveRingWord: `offer`, the gear screen opened on the word) and the guide's next prompt.
func offer_word(_w: String) -> void:
	if not _inv.visible:
		_inv.toggle()


## The word has been put on Strike: the guide shows what it does for a while (guide.gd USE).
func word_placed() -> void:
	guide.use_t = 10.0


func sees(a: Vector2, b: Vector2) -> bool:
	return _monsters.sees(a, b)



## The controls, as main.ts has them: WASD or the arrows to walk; STRIKE the left button (or J; a controller's RT); WHIRL
## the right button, held to go again as soon as it is ready (or K; LT); the LUNGE Space, toward the pointer (A, along the
## stick).
func _inputs() -> void:
	var keys := {
		"move_up": [KEY_W, KEY_UP], "move_down": [KEY_S, KEY_DOWN],
		"move_left": [KEY_A, KEY_LEFT], "move_right": [KEY_D, KEY_RIGHT],
		"attack": [KEY_J], "whirl": [KEY_K], "lunge": [KEY_SPACE], "potion": [KEY_Q], "interact": [KEY_E, KEY_F],
	}
	var sticks := {
		"move_up": [JOY_AXIS_LEFT_Y, -1.0], "move_down": [JOY_AXIS_LEFT_Y, 1.0],
		"move_left": [JOY_AXIS_LEFT_X, -1.0], "move_right": [JOY_AXIS_LEFT_X, 1.0],
		"attack": [JOY_AXIS_TRIGGER_RIGHT, 1.0], "whirl": [JOY_AXIS_TRIGGER_LEFT, 1.0],
	}
	for action in keys:
		if not InputMap.has_action(action):
			InputMap.add_action(action, 0.2)
		for k in keys[action]:
			var e := InputEventKey.new()
			e.physical_keycode = k
			InputMap.action_add_event(action, e)
	for action in sticks:
		var j := InputEventJoypadMotion.new()
		j.axis = sticks[action][0]
		j.axis_value = sticks[action][1]
		InputMap.action_add_event(action, j)
	for pair in [["attack", MOUSE_BUTTON_LEFT], ["whirl", MOUSE_BUTTON_RIGHT]]:
		var m := InputEventMouseButton.new()
		m.button_index = pair[1]
		InputMap.action_add_event(pair[0], m)
	var a := InputEventJoypadButton.new()
	a.button_index = JOY_BUTTON_A
	InputMap.action_add_event("lunge", a)
	var x := InputEventJoypadButton.new()
	x.button_index = JOY_BUTTON_X
	InputMap.action_add_event("potion", x)
	var b := InputEventJoypadButton.new()
	b.button_index = JOY_BUTTON_B
	InputMap.action_add_event("interact", b)


func _arg(name: String) -> String:
	for a in OS.get_cmdline_user_args():
		if a.begins_with("--%s=" % name):
			return a.split("=", true, 1)[1]
	return ""


## (the words' check: how many lines it has said, and which of them did not come out as the game has it)
var _wu_n := 0
var _wu_bad: Array = []


## One line of the words' check: what happened, and whether that is as the game has it.
func _wu(ok: bool, what: String) -> void:
	_wu_n += 1
	if not ok:
		_wu_bad.append(_wu_n)
	print("WORDS %02d %s: %s" % [_wu_n, "ok" if ok else "WRONG", what])


## (the words' check) The line among what has just been said that begins so, or "".
func _wu_said(begins: String) -> String:
	for m in loot.msgs:
		if str(m["text"]).begins_with(begins):
			return m["text"]
	return ""


## (the words' check) The words lying on the floor: [word, where].
func _wu_lying() -> Array:
	var out: Array = []
	for d in loot._drops:
		if d["kind"] == "word":
			out.append([d["word"], d["at"]])
	return out


## (the words' check) The mouse as the gear screen gets it: its left button pressed ("down") or let go ("up") at a place of
## the screen, moved there with the button held ("move"), or its right button pressed ("right").
func _wu_mouse(what: String, at: Vector2) -> void:
	if what == "move":
		var m := InputEventMouseMotion.new()
		m.position = at
		m.button_mask = MOUSE_BUTTON_MASK_LEFT
		_inv._gui_input(m)
		return
	var b := InputEventMouseButton.new()
	b.position = at
	b.button_index = MOUSE_BUTTON_RIGHT if what == "right" else MOUSE_BUTTON_LEFT
	b.pressed = what != "up"
	_inv._gui_input(b)


## (the words' check) An attack as the bottom of the screen writes it: its pieces' letters, an empty slot "[+]".
func _wu_reads(s: int) -> Array:
	var out: Array = []
	for p in _hud._phrase(s, 0):
		out.append(p["text"] if p.has("text") else "[+]")
	return out


## SHOT MODE, THE WORDS: HOW THEY ARE COME BY, CARRIED AND SET (--only=wordsui). A new Warrior's game, taken through all of
## it, each step pictured and a line printed that says what happened and whether it is as the game has it:
##   before the ring is lit, no slots; the fallen wordsmith on floor 1 searched for the stone; the stone given, the ring lit,
##   the wordsmith's word and the gear screen opened on it (a new player's first word: it goes on an attack and nowhere else);
##   POWER set on Strike, its new name across the screen, its card; levels gained (a slot behind opens at 4, the Whirlwind's at
##   2, the Lunge's at 5) and more words set in front and behind of all three moves; a set word read; with the mouse itself,
##   a word dragged onto a slot (the word there goes back), dragged out, taken out by a second press and by the right button;
##   a slot's refusal; the moves at the bottom of the screen, a move's card under the pointer, a press on a plate and on
##   INVENTORY; a word held over a piece, burned into it (asked first), a second and a third, and what the piece then
##   refuses; a piece of the bag that has one of the things a word gives; a unique piece; the line that sends him to the
##   armourer, the armourer's task; floor 1 again (the fallen wordsmith there, searched; no word falls there) and floor 3
##   (none); a carrier struck dead on floor 3, its word lying and taken up (WORD FOUND); the boss's word; the Stoker's gear,
##   the crank, the furnace out (the quest told, the line that sends him back); floor 3's sealed door, which wants FLAME; a
##   word from an ordinary monster and from a chest (their chances made certain); the armourer's word, HEAVY, and his
##   shelves again; HEAVY set where POWER was; at level 15, a second slot in front and "One damage word per side"; the fallen
##   wordsmith's satchel for a hero whose ring was lit before he searched one, his first word laid by him, announced large
##   and offered its place at the next quiet moment; and the fallen wordsmith on floor 3 for a hero with neither the lit
##   ring nor the stone who has searched none.
## Its last line begins WORDSUI: and says how many lines were said and which, if any, were wrong.
func _wordsui_shots(h: Hero, dir: String) -> void:
	var L = h.loadout
	var names := func() -> Array: return [str(L.r(0)["name"]), str(L.r(1)["name"]), str(L.r(2)["name"])]
	var sizes := func(side: Array) -> Array: return [side[0].size(), side[1].size(), side[2].size()]
	var smith := Vector2(9.5, 14.5)
	var forge := Vector2(19.5, 7.5)
	await _wait(0.8)

	# --- a new hero, the ring dark: no slots; floor 1's fallen wordsmith, and his stone
	_wu(not loot.ring_lit and sizes.call(L.front) == [0, 0, 0] and sizes.call(L.behind) == [0, 0, 0], "a new hero, the ring dark: his moves' slots in front %s, behind %s" % [sizes.call(L.front), sizes.call(L.behind)])
	_inv.toggle()
	_inv._press("tab", "attacks")
	await _wait(0.2)
	await _snap(dir + "/w01_before_the_ring_no_slots.png")
	_wu(_inv._page == "attacks" and _inv._slots.is_empty() and _inv._plates[0] != null and _inv._plates[1] == null and _inv._plates[2] == null and _inv._pouch.is_empty(), "the gear screen's ATTACKS before the ring: %d slots, %d words; Strike shown %s, the Whirlwind %s, the Lunge %s (level %d: they open at 2 and 5)" % [_inv._slots.size(), _inv._pouch.size(), _inv._plates[0] != null, _inv._plates[1] != null, _inv._plates[2] != null, loot.level])
	_inv.toggle()
	var b = loot._body
	_wu(b != null and not b["searched"], "floor 1, a new hero: the fallen wordsmith lies there %s, searched %s" % [b != null, b["searched"] if b != null else "-"])
	if b != null:
		h.world = b["at"] + Vector2(0.5, 0.5)
	await _wait(0.4)
	_wu(loot.quest == "heart" and loot.body_searched and loot.spare() == 0 and _wu_said("You take the MASTER RUNE-STONE.") != "", "searched before the ring is lit: he carries the stone (quest '%s'), no word (%d held); it says: %s" % [loot.quest, loot.spare(), _wu_said("You take")])

	# --- the stone to the wordsmith: the ring lit, his word given, the gear screen opened on it
	await go_to("town", "gate")
	await _wait(0.6)
	h.walked = 5.0
	h.world = _spot_near(smith, 1.4, h.world)
	await _wait(0.4)
	town._do("give")
	var t := 0.0
	while not _inv.visible and t < 8.0:
		await get_tree().process_frame
		t += get_process_delta_time()
	await _wait(0.3)
	await _snap(dir + "/w02_the_first_word_waits.png")
	_wu(loot.ring_lit and _inv.visible and _inv._page == "attacks" and int(loot.words.get("power", 0)) == 1 and loot.first_word_waits() and sizes.call(L.front) == [1, 0, 0] and sizes.call(L.behind) == [0, 0, 0], "the ring lit and the wordsmith's word given after %.1f s: POWER x%d; the gear screen open %s on %s; slots in front %s, behind %s; the coach's line: %s" % [t, int(loot.words.get("power", 0)), _inv.visible, _inv._page, sizes.call(L.front), sizes.call(L.behind), _inv._coach()])
	_inv._press("tab", "gear")
	var said_tab: String = _inv._note
	_inv._press("word", "power")
	_inv._press("worn", "mainhand")
	_wu(_inv._page == "attacks" and said_tab == "Your first word goes on an attack" and _inv._note == "Your first word goes on an attack" and _inv._pending.is_empty(), "his first word waiting: GEAR pressed, the page stays %s and it says: %s; the word pressed onto his weapon, it says: %s" % [_inv._page, said_tab, _inv._note])
	_inv._note_t = 0.0
	await _wait(0.2)
	await _snap(dir + "/w03_the_word_in_hand.png")
	_wu(_inv._word == "power" and _inv._reading() == "hand", "the word pressed: in hand '%s', read on its card (%s): POWER, %s" % [_inv._word, _inv._reading(), _inv._hud["words"]["power"]["grows"]])
	_inv._press("slot", [0, "front", 0])
	await _wait(0.3)
	await _snap(dir + "/w04_power_set_its_new_name.png")
	_wu(L.front[0] == ["power"] and int(loot.words["power"]) == 0 and loot.taught and names.call()[0] == "Power Strike" and not _inv._flash.is_empty() and guide.use_t > 0.0, "POWER set in front of STRIKE: it reads '%s'; his words left %d; the lesson over %s; its name shown large %s; its lines: %s" % [names.call()[0], loot.spare(), loot.taught, not _inv._flash.is_empty(), L.r(0)["lines"]])
	await _wait(1.2)
	await _snap(dir + "/w05_strikes_card.png")
	_wu(_inv._reading() == "" and _inv._coach() == "" and _inv.hit_range(0) == [11, 17], "under the three lines, Strike read out: a hit %s (8 to 13 without the word), %s; the coach's line in town, the word set: '%s'" % [_inv.hit_range(0), _inv._pace(0)[1], _inv._coach()])

	# --- levels gained: the Whirlwind's and the Lunge's slots, a slot behind; more words (handed him here), set in all three
	var xp := 1.0
	for l in range(1, 5):
		xp += loot.xp_to_next(l)
	loot.gain_xp(xp)
	_wu(loot.level == 5 and sizes.call(L.front) == [1, 1, 1] and sizes.call(L.behind) == [1, 1, 1] and _wu_said("A word slot has opened BEHIND your attacks.") != "", "level %d: slots in front %s, behind %s; it said: %s" % [loot.level, sizes.call(L.front), sizes.call(L.behind), _wu_said("A word slot")])
	for w in ["fire", "frost", "poison", "swift", "lightning"]:
		loot.words[w] = int(loot.words.get(w, 0)) + 1
	var refused: Array = []
	for q in [["fire", 1, "front"], ["poison", 0, "behind"], ["frost", 2, "front"], ["swift", 2, "behind"]]:
		_inv._press("word", q[0])
		_inv._press("slot", [q[1], q[2], 0])
		if L.slots(q[1], q[2])[0] != q[0]:
			refused.append(q)
	_inv._press("plate", 0)
	await _wait(1.4)
	await _snap(dir + "/w06_words_in_several_slots.png")
	_wu(refused.is_empty() and names.call() == ["Power Strike of Venom", "Flame Whirlwind", "Frost Lunge of Swiftness"] and loot.held() == ["lightning"], "FLAME before the Whirlwind, POISON behind Strike, FROST before the Lunge and SWIFT behind it: they read %s; refused %s; he still holds %s" % [names.call(), refused, loot.held()])
	_inv._press("plate", 1)
	await _wait(0.2)
	await _snap(dir + "/w07_the_whirlwinds_card.png")
	_wu(_inv._focus == 1 and L.r(1)["element"] == "fire", "the Whirlwind read out: %s, %s damage, a hit %s, %s; its lines: %s" % [names.call()[1], L.r(1)["element"], _inv.hit_range(1), _inv._pace(1)[1], L.r(1)["lines"]])
	_inv._press("slot", [1, "front", 0])
	await _wait(0.2)
	await _snap(dir + "/w08_a_set_word_read.png")
	_wu(_inv._look == [1, "front", 0] and _inv._reading() == "look", "FLAME pressed where it is set: it is read (%s), its own line: %s" % [_inv._reading(), L.r(1)["lines"].filter(func(l): return str(l).begins_with("Flame:"))])
	# (with the mouse itself: LIGHTNING dragged from his words onto the Whirlwind's slot, where FLAME is)
	var tile := Rect2()
	for c in _inv._pouch:
		if c["w"] == "lightning":
			tile = c["r"]
	var slot := Rect2()
	for c in _inv._slots:
		if c["i"] == 1 and c["side"] == "front":
			slot = c["r"]
	_wu_mouse("down", tile.get_center())
	_wu_mouse("move", tile.get_center() + Vector2(16, -16))
	_wu_mouse("move", slot.get_center())
	await _wait(0.2)
	await _snap(dir + "/w08b_a_word_dragged_onto_a_slot.png")
	var carried: bool = not _inv._drag.is_empty() and _inv._drag["moving"] and _inv._reading() == "over"
	_wu_mouse("up", slot.get_center())
	_wu(carried and L.front[1] == ["lightning"] and int(loot.words["fire"]) == 1 and int(loot.words["lightning"]) == 0, "LIGHTNING dragged from his words onto the Whirlwind's slot (carried %s) and let go: it reads '%s'; FLAME, which was there, back among his words %s" % [carried, names.call()[1], loot.held()])
	await _wait(1.3)
	# (dragged out again: it is one of his words, and in hand; let go over nothing, and a press on nothing puts it down)
	_wu_mouse("down", slot.get_center())
	_wu_mouse("move", slot.get_center() + Vector2(0, 150))
	_wu_mouse("up", slot.get_center() + Vector2(0, 150))
	var in_hand: String = _inv._word
	_wu_mouse("down", slot.get_center() + Vector2(0, 150))
	_wu_mouse("up", slot.get_center() + Vector2(0, 150))
	_wu(in_hand == "lightning" and _inv._word == "" and L.front[1] == [null] and loot.held() == ["fire", "lightning"], "dragged out of the slot: in hand '%s', the slot %s, his words %s; a press on nothing puts it down ('%s')" % [in_hand, L.front[1], loot.held(), _inv._word])
	# (FLAME set again; a second press on it where it is set takes it out; set again; the right button takes it out; set again)
	var ways: Array = []
	for how in ["twice", "right"]:
		_inv._press("word", "fire")
		_inv._press("slot", [1, "front", 0])
		if how == "twice":
			for n in 2:
				_wu_mouse("down", slot.get_center())
				_wu_mouse("up", slot.get_center())
		else:
			_wu_mouse("right", slot.get_center())
		ways.append(L.front[1] == [null] and int(loot.words["fire"]) == 1)
	_inv._press("word", "fire")
	_inv._press("slot", [1, "front", 0])
	_wu(ways == [true, true] and L.front[1] == ["fire"] and loot.held() == ["lightning"], "FLAME set again and taken out by a second press on it (%s), and by the right button (%s); set again: '%s'; he holds %s" % [ways[0], ways[1], names.call()[1], loot.held()])
	# (a slot's refusal: a second POWER onto the slot that holds POWER)
	await _wait(1.3)
	loot.words["power"] = int(loot.words["power"]) + 1
	_inv._press("word", "power")
	_inv._press("slot", [0, "front", 0])
	await _wait(0.2)
	await _snap(dir + "/w09_a_slots_refusal.png")
	_wu(_inv._note == "Already there" and L.front[0] == ["power"] and int(loot.words["power"]) == 1, "a second POWER pressed onto Strike's slot in front: it says '%s'; Strike still %s, POWER still held x%d" % [_inv._note, L.front[0], int(loot.words["power"])])
	_inv._note_t = 0.0
	for c in _inv._slots:
		if c["i"] == 0 and c["side"] == "front":
			_inv._mouse = c["r"].get_center()
	await _wait(0.2)
	await _snap(dir + "/w10_the_refusal_on_its_card.png")
	_wu(_inv._reading() == "over" and _inv.place_problem(0, "front", 0, "power") == "Already there" and _inv.place_problem(1, "front", 0, "power") == "" and _inv.place_problem(0, "behind", 0, "lightning") == "", "the word held over that slot: read (%s), refused '%s'; over the Whirlwind's (FLAME there) '%s', LIGHTNING over Strike's behind (VENOM there) '%s': each would take the place of the word there" % [_inv._reading(), _inv.place_problem(0, "front", 0, "power"), _inv.place_problem(1, "front", 0, "power"), _inv.place_problem(0, "behind", 0, "lightning")])
	_inv._mouse = Vector2(-1000, -1000)
	_inv.toggle()

	# --- the moves at the bottom of the screen, and a move's card under the pointer
	guide.use_t = 0.0
	await _wait(0.5)
	await _snap(dir + "/w11_the_moves_at_the_bottom.png")
	var lunge: Array = _hud._name_parts(2).map(func(p): return p[0])
	_wu(_wu_reads(0) == ["POWER", "STRIKE", "of", "VENOM"] and _wu_reads(1) == ["FLAME", "WHIRLWIND", "[+]"] and lunge == ["FROST", "LUNGE", "of", "SWIFTNESS"] and loot.spare() == 2 and loot.first_spare() == "power", "the bottom of the screen: Strike reads %s, the Whirlwind %s (its empty slot glows %s), the Lunge over its button %s; beside INVENTORY the rune of %s and %d" % [_wu_reads(0), _wu_reads(1), _hud._phrase(1, 0)[2].get("glow"), lunge, loot.first_spare().to_upper(), loot.spare()])
	_hud.pointer = _hud._plates[0].get_center()
	await _wait(0.2)
	await _snap(dir + "/w12_a_moves_card_under_the_pointer.png")
	_wu(_hud._plates.size() == 2 and str(L.r(0)["name"]) == "Power Strike of Venom", "the pointer on Strike's plate: its card, '%s': %s" % [L.r(0)["name"], L.r(0)["lines"]])
	_hud.pointer = null
	# (a press on a plate opens the gear screen at that move; a press on INVENTORY, on GEAR)
	var click := InputEventMouseButton.new()
	click.button_index = MOUSE_BUTTON_LEFT
	click.pressed = true
	click.position = _hud._plates[1].get_center() * 2.0
	_hud._input(click)
	var by_plate: Array = [_inv.visible, _inv._page, _inv._focus]
	_inv.toggle()
	click.position = _hud._inv_button.get_center() * 2.0
	_hud._input(click)
	var by_button: Array = [_inv.visible, _inv._page]
	_inv.toggle()
	_wu(by_plate == [true, "attacks", 1] and by_button == [true, "gear"], "a press on the Whirlwind's plate: the gear screen open, its page, the move read out %s; a press on INVENTORY: open, its page %s" % [by_plate, by_button])

	# --- a word burned into a piece: held over it, asked, burned; a second and a third; and what the piece then refuses
	_inv.toggle()
	await _wait(0.2)
	var sword: Dictionary = loot.gear["mainhand"]
	var could: Array = loot.burn_options("lightning", sword).map(func(o): return o["range"])
	_inv._press("word", "lightning")
	for c in _inv._cells:
		if c["worn"] and c["where"] == "mainhand":
			_inv._mouse = c["r"].get_center()
	await _wait(0.2)
	await _snap(dir + "/w13_a_word_held_over_a_piece.png")
	_wu(_inv._page == "gear" and _inv._reading() == "over" and could.size() == 2, "the gear screen opened on %s; LIGHTNING held over the %s: it could become %s" % [_inv._page, sword["name"], could])
	_inv._mouse = Vector2(-1000, -1000)
	_inv._press("worn", "mainhand")
	await _wait(0.2)
	await _snap(dir + "/w14_burn_it_asked.png")
	_wu(_inv._pending.get("word", "") == "lightning" and int(loot.words["lightning"]) == 1 and sword.get("imbues", []).is_empty(), "pressed onto it: it asks first (waiting %s), nothing burned yet, LIGHTNING still held x%d" % [_inv._pending, int(loot.words["lightning"])])
	_inv._press("yes", null)
	await _wait(0.2)
	await _snap(dir + "/w15_what_it_became.png")
	var first_burn: String = _inv._result.get("text", "")
	_wu(int(loot.words["lightning"]) == 0 and sword.get("imbues", []).size() == 1 and first_burn != "" and int(sword["rarity"]) == 1 and loot.room(sword) == 3, "BURN IT: LIGHTNING used up (x%d); the %s became: %s; its colour now %d (magic), room for %d more; his lightning damage %+d%%, added to lightning hits %d-%d" % [int(loot.words["lightning"]), sword["name"], first_burn, int(sword["rarity"]), loot.room(sword), int(h.stats["light_pct"]), int(h.stats["light_min"]), int(h.stats["light_max"])])
	# (two more LIGHTNING handed him: the other thing it can become there, and then nothing left of it to give)
	loot.words["lightning"] = 2
	var second: String = loot.burn("lightning", "mainhand")
	var second_text: String = loot.burned.get("text", "")
	var third: String = loot.burn("lightning", "mainhand")
	_wu(second == "" and second_text != "" and second_text != first_burn and third == "It already has what this word gives" and int(loot.words["lightning"]) == 1 and sword["imbues"].size() == 2, "a second LIGHTNING into it: %s (the other of the two); a third: '%s' (still held x%d)" % [second_text, third, int(loot.words["lightning"])])
	# (POWER twice, handed him: the piece's four places full)
	loot.words["power"] = 3
	var p1: String = loot.burn("power", "mainhand")
	var p1_text: String = loot.burned.get("text", "")
	var p2: String = loot.burn("power", "mainhand")
	var p2_text: String = loot.burned.get("text", "")
	var p3: String = loot.burn("power", "mainhand")
	_wu(p1 == "" and p2 == "" and p3 == "That piece is full" and sword["imbues"].size() == 4 and int(sword["rarity"]) == 2 and loot.room(sword) == 0 and int(loot.words["power"]) == 1, "POWER into it twice: %s; %s; a third: '%s'; it holds %d words, its colour %d (rare), room %d" % [p1_text, p2_text, p3, sword["imbues"].size(), int(sword["rarity"]), loot.room(sword)])
	loot.burned = {}
	_inv._word = ""
	_inv._result = {}
	_inv._hover = {"item": sword, "at": Vector2(140, 60)}
	await _wait(0.2)
	await _snap(dir + "/w16_the_pieces_card.png")
	_inv._hover = {}
	# (a piece that was found with one of the things a word gives is not given it again; a word goes into a piece of the bag
	# as into one he wears; and a unique piece takes no word. The pieces: the first such of the game's own, put in his bag)
	var found: Dictionary = {}
	var found_w := ""
	var unique: Dictionary = {}
	for q in loot._pools:
		for it in loot._pools[q]:
			if int(it["rarity"]) == 3:
				if unique.is_empty():
					unique = it.duplicate(true)
				continue
			for w in loot._words["order"]:
				var all: Array = loot._imbue[w]["%s:%d" % [it["slot"], int(it["ilvl"])]]
				var free: Array = loot.burn_options(w, it)
				if found.is_empty() and not free.is_empty() and free.size() < all.size():
					found = it.duplicate(true)
					found_w = w
	if not found.is_empty():
		var all_stats: Array = loot._imbue[found_w]["%s:%d" % [found["slot"], int(found["ilvl"])]].map(func(o): return o["stat"])
		var free_stats: Array = loot.burn_options(found_w, found).map(func(o): return o["stat"])
		loot.bag.append(found)
		loot.words[found_w] = int(loot.words.get(found_w, 0)) + 1
		_inv._press("word", found_w)
		_inv._press("bag", loot.bag.size() - 1)
		var asked: bool = _inv._pending.get("where") == loot.bag.size() - 1
		_inv._press("yes", null)
		var gave: Array = found["imbues"][0]["stats"] if found.has("imbues") else []
		_inv._result = {}
		_inv._hover = {"item": found, "at": Vector2(140, 300)}
		await _wait(0.2)
		await _snap(dir + "/w16b_a_piece_of_the_bag.png")
		_inv._hover = {}
		_wu(asked and not gave.is_empty() and free_stats.has(gave[0]) and found["imbues"].size() == 1, "%s (found with %s, in his bag): %s could become %s there, less what it has: %s; asked %s, burned, it became %s" % [found["name"], found["has"], found_w.to_upper(), all_stats, free_stats, asked, found["imbues"][0]["lines"] if found.has("imbues") else "-"])
	else:
		_wu(false, "no piece of the game's pools was found with something a word gives")
	if not unique.is_empty():
		loot.bag.append(unique)
		_wu(loot.burn_problem("power", loot.bag.size() - 1) == "A unique piece takes no word" and loot.room(unique) == 0, "%s, a unique piece, in his bag: POWER into it: '%s'" % [unique["name"], loot.burn_problem("power", loot.bag.size() - 1)])
	_inv.toggle()

	# --- the armourer's task
	await _wait(0.4)
	var line: Dictionary = guide.banner()
	await _snap(dir + "/w17_speak_to_the_armourer.png")
	_wu(line.get("text", "") == "Speak to the ARMOURER" and line.get("sub", "") == "He works at his forge." and loot.armourer_due() == "furnace", "the ring lit and his first word set: the line at the top says '%s' / '%s' (the armourer has: %s)" % [line.get("text", ""), line.get("sub", ""), loot.armourer_due()])
	h.world = _spot_near(forge, 1.5, h.world)
	await _wait(0.4)
	var ask_prompt: Array = town.prompt.duplicate()
	town._do(town.prompt[1])
	await _wait(0.3)
	await _snap(dir + "/w18_the_armourer_asks.png")
	_wu(ask_prompt == ["E: Armourer: a task", "task"] and loot.furnace == "asked" and _wu_said("The armourer:") == loot.quest_text["furnaceAsk"] and not _inv.visible, "by the armourer the prompt %s; used: the quest '%s', his shelves open %s; he says: %s" % [ask_prompt, loot.furnace, _inv.visible, _wu_said("The armourer:")])
	_wu(town.prompt == ["E: Armourer", "armourer"] and guide.banner().is_empty(), "asked, his prompt is %s (his shelves), and the line at the top is gone %s" % [town.prompt, guide.banner().is_empty()])

	# --- floor 1 again, and floor 3: where the fallen wordsmith lies for a hero whose ring is lit
	await go_to("floor1", "stairs")
	await _wait(0.8)
	b = loot._body
	_wu(b != null and b["searched"] and not loot.words_fall(), "floor 1 again, the ring lit, its way down not yet taken: the fallen wordsmith lies there %s, searched %s; words fall here %s" % [b != null, b["searched"] if b != null else "-", loot.words_fall()])
	if b != null:
		h.world = _spot_near(b["at"], 2.0, h.world)
	await _wait(0.5)
	await _snap(dir + "/w19_floor1_the_fallen_wordsmith_searched.png")
	# (floor 1: nothing gives up a word, were its chance certain: an ordinary monster struck dead, a chest opened; and what
	# the rune over a monster's head means, said once: as the game stands nothing on floor 1 carries one, so one is made to)
	var tune: Dictionary = loot._tune
	var chances: Array = [tune["dropWord"], tune["chestWord"], tune["vaultWord"]]
	var far: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and not m.elite and not m.champion and m.world.distance_to(h.world) > 12.0 and far == null:
			far = m
	tune["dropWord"] = 1.0
	tune["chestWord"] = 1.0
	if far != null:
		far.carries = ["power"]
		_monsters.wake(far)
		await _wait(0.3)
		var told: String = _wu_said(far.title + " carries a WORD.")
		far.hurt(1e9)
		loot.from_chest(far.world, false)
		_wu(_wu_lying().is_empty() and told == far.title + " carries a WORD. Kill it and the word is yours.", "floor 1, the chances of a word made certain: a monster that carries one struck dead and a chest opened: words lying %s (none falls on floor 1); as it woke it said: %s" % [_wu_lying(), told])
	tune["dropWord"] = chances[0]
	tune["chestWord"] = chances[1]
	await go_to("floor3", "down")
	await _wait(1.2)
	_wu(loot._body == null and map.body != null and loot.words_fall() and loot.cleared == 2, "floor 3, the ring lit: no fallen wordsmith (%s; the floor's place for one %s); words fall here %s" % [loot._body, map.body, loot.words_fall()])
	if map.body != null:
		h.world = _free_near(Vector2(map.body["x"], map.body["y"]) + Vector2(1.5, 0.0))
	await _wait(0.6)
	await _snap(dir + "/w20_floor3_where_he_would_lie.png")

	# --- a carrier struck dead: its word lying, and taken up
	var carrier: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and not m.carries.is_empty() and carrier == null:
			carrier = m
	if carrier != null:
		var w: String = carrier.carries[0]
		var had := int(loot.words.get(w, 0))
		h.world = _spot_near(carrier.world, 2.5, h.world)
		await _wait(0.4)
		carrier.hurt(1e9)
		await _wait(0.5)
		var lying := _wu_lying()
		await _snap(dir + "/w21_a_carrier_struck_dead_its_word_lying.png")
		_wu(carrier.dead and lying.size() == 1 and lying[0][0] == w and int(loot.words.get(w, 0)) == had, "%s (it carries %s) struck dead at %s: lying %s; after 0.5 s not yet his (%s x%d: a word stands 1 s first)" % [carrier.title, carrier.carries, carrier.world, lying, w, int(loot.words.get(w, 0))])
		if not lying.is_empty():
			h.world = lying[0][1]
		await _wait(1.3)
		await _snap(dir + "/w22_word_found.png")
		_wu(_wu_lying().is_empty() and int(loot.words.get(w, 0)) == had + 1 and loot.toast.get("word", "") == w and not loot.toast.get("big", true) and not _inv.visible, "it comes to him and is taken: %s x%d; the top of the screen says WORD FOUND %s (large %s); the gear screen opened on it %s (his words are at work already)" % [w, int(loot.words.get(w, 0)), str(_hud._data["words"].get(loot.toast.get("word", ""), {}).get("name", "-")).to_upper(), loot.toast.get("big"), _inv.visible])
	else:
		_wu(false, "no monster of floor 3 carries a word")
	# (a boss's too)
	var boss: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and m.boss:
			boss = m
	if boss != null:
		var bw: Array = boss.carries
		var had_b := int(loot.words.get(bw[0], 0)) if not bw.is_empty() else 0
		h.world = _spot_near(boss.world, 3.0, boss.world)
		await _wait(0.5)
		boss.waits = false
		boss.hurt(1e9)
		await _wait(0.6)
		var lying_b := _wu_lying()
		await _snap(dir + "/w23_the_boss_fallen_his_word.png")
		if not lying_b.is_empty():
			h.world = lying_b[0][1]
		await _wait(1.4)
		_wu(boss.dead and not bw.is_empty() and lying_b.size() == bw.size() and lying_b[0][0] == bw[0] and int(loot.words.get(bw[0], 0)) == had_b + 1, "%s (he carries %s) struck dead: lying %s; taken, %s x%d" % [boss.title, bw, lying_b, bw[0] if not bw.is_empty() else "-", int(loot.words.get(bw[0], 0)) if not bw.is_empty() else 0])

	# --- floor 3's furnace: the Stoker's gear, the crank, the furnace out; the quest told
	if furnace != null and not furnace._crank.is_empty():
		var c := Vector2(furnace._crank["x"], furnace._crank["y"])
		var keeper = null
		for m in _monsters.list:
			if is_instance_valid(m) and m.kind == "stoker" and not m.dead:
				keeper = m
		if keeper != null:
			h.world = _spot_near(keeper.world, 3.0, h.world)
			await _wait(0.2)
			keeper.hurt(1e9)
			await _wait(4.6)
			for g in _monsters.perils.get_children():
				if g.get("at") != null:
					h.world = g.at
			await _wait(0.4)
		else:
			_monsters.quest_item.emit("gear", h.world)
			await _wait(0.4)
		_wu(furnace.step == "gear" and loot.furnace == "gear", "the Stoker dead, his gear taken: the furnace's step '%s', the quest '%s'" % [furnace.step, loot.furnace])
		h.world = _free_near(c + Vector2(0.9, 0.4))
		await _wait(3.4)
		line = guide.banner()
		await _snap(dir + "/w24_the_furnace_out_return_to_the_armourer.png")
		_wu(furnace.step == "out" and loot.furnace == "out" and loot.armourer_due() == "reward" and line.get("text", "") == "Return to the ARMOURER" and line.get("sub", "") == "Take the waypoint back to town.", "the crank turned: the furnace's step '%s', the quest '%s' (the armourer has: %s); it said: %s; the line at the top: '%s' / '%s'" % [furnace.step, loot.furnace, loot.armourer_due(), _wu_said("The gear bites"), line.get("text", ""), line.get("sub", "")])
	else:
		_wu(false, "floor 3 has no furnace")

	# --- floor 3's sealed door: it wants FLAME, in whichever slot
	var wd: Dictionary = {}
	for d in map.doors:
		if d["kind"] == "worddoor":
			wd = d
	if not wd.is_empty():
		var mid := Vector2(wd["middle"]["x"], wd["middle"]["y"])
		var away := Vector2(0, float(wd["out"])) if wd["alongX"] else Vector2(float(wd["out"]), 0)
		for m in _monsters.list:
			if is_instance_valid(m) and not m.dead and m.world.distance_to(mid) < 10.0:
				m.hurt(1e9)
		h.world = _free_near(mid + away * 2.5)
		await _wait(0.7)
		await _snap(dir + "/w25_a_sealed_door_wants_flame.png")
		_wu(wd.get("word", "") == "fire" and wd.get("told", false) and _wu_said("A sealed door.") == "A sealed door. It wants FLAME.", "floor 3's sealed door (its word '%s'): %s" % [wd.get("word", ""), _wu_said("A sealed door.")])
		_doors.unseal({"front": ["power"], "behind": ["poison", null]}, mid, 0.9)
		var still := int(wd["want"])
		_doors.unseal({"front": ["lightning", null], "behind": ["fire"]}, mid, 0.9)
		await _wait(0.6)
		await _snap(dir + "/w26_the_flame_seal_breaks.png")
		_wu(still == 0 and int(wd["want"]) == 1 and map.walk[int(wd["way"][0])] == 1 and map.shut[int(wd["way"][0])] == 0 and _wu_said("The FLAME seal") == "The FLAME seal breaks.", "a hit carrying POWER and VENOM: sealed still (want %d); one carrying LIGHTNING in front and FLAME behind: want %d walk %d shut %d; %s" % [still, int(wd["want"]), map.walk[int(wd["way"][0])], map.shut[int(wd["way"][0])], _wu_said("The FLAME seal")])
	else:
		_wu(false, "floor 3 has no sealed door")

	# --- the words an ordinary monster and a chest leave now and then (the game's chances; made certain here, far from him)
	far = null
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss and not m.elite and not m.champion and not m.summoned and m.kind in ["skeleton", "bat", "archer", "cultist", "shade"] and m.carries.is_empty() and m.world.distance_to(h.world) > 12.0 and far == null:
			far = m
	if far != null:
		var at_m: Vector2 = far.world
		var before_n := _wu_lying().size()
		tune["dropWord"] = 1.0
		far.hurt(1e9)
		tune["dropWord"] = chances[0]
		var from_monster: Array = _wu_lying().slice(before_n)
		tune["chestWord"] = 1.0
		loot.from_chest(at_m, false)
		tune["chestWord"] = chances[1]
		var from_chest: Array = _wu_lying().slice(before_n + from_monster.size())
		# (the first chest opened in a treasure vault has the vault's chance, the next an ordinary chest's: the vault's made
		# certain and the ordinary none; a vault he has not been near, its two chests marked open as props.gd marks them)
		var boxes: Array = []
		for r in map.rooms:
			if r.get("kind", "") != "treasure" or not boxes.is_empty():
				continue
			for p in map.props:
				if p["kind"] == "chest" and int(p["state"]) == 0 and FloorMap.in_room(r, Vector2(p["tx"], p["ty"])) and Vector2(p["x"], p["y"]).distance_to(h.world) > 8.0:
					boxes.append(p)
			if boxes.size() < 2:
				boxes = []
		var from_vault: Array = []
		if boxes.size() >= 2:
			tune["vaultWord"] = 1.0
			tune["chestWord"] = 0.0
			for p in boxes.slice(0, 2):
				var n0 := _wu_lying().size()
				p["state"] = 1
				loot.from_chest(Vector2(p["x"], p["y"]), true)
				from_vault.append(_wu_lying().size() - n0)
			tune["vaultWord"] = chances[2]
			tune["chestWord"] = chances[1]
		var here: Array = loot._words["at"]["3"]
		_wu(from_monster.size() == 1 and from_chest.size() == 1 and from_vault == [1, 0] and here.has(from_monster[0][0]) and here.has(from_chest[0][0]) and not here.has("heavy"), "floor 3: an ordinary monster leaves a word %s times in 1000 and a chest %s in 100 (the first of a treasure vault %s), x%s here; made certain: the %s left %s, a chest %s; a vault's first chest and its second (the vault's chance certain, a chest's none): %s; the words found on this floor: %s" % [chances[0] * 1000.0, chances[1] * 100.0, chances[2] * 100.0, loot._growth(), far.title, from_monster.map(func(d): return d[0]), from_chest.map(func(d): return d[0]), from_vault, here])
	else:
		_wu(false, "floor 3 has no ordinary monster left far from him")

	# --- back in town: the armourer's word, HEAVY; then his shelves
	await go_to("town", "way")
	await _wait(0.8)
	line = guide.banner()
	h.world = _spot_near(forge, 1.5, h.world)
	await _wait(0.4)
	var give_prompt: Array = town.prompt.duplicate()
	var held_before: int = loot.spare()
	town._do(town.prompt[1])
	await _wait(0.4)
	await _snap(dir + "/w27_heavy_given.png")
	_wu(line.get("text", "") == "Return to the ARMOURER" and line.get("sub", "") == "He works at his forge." and give_prompt == ["E: Armourer: the furnace is out", "task"] and loot.furnace == "done" and int(loot.words.get("heavy", 0)) == 1 and loot.spare() == held_before + 1 and _wu_said("The armourer: \"The forge") == loot.quest_text["reward"] and loot.toast.get("word", "") == "heavy", "in town the line at the top '%s' / '%s'; his prompt %s; used: the quest '%s', HEAVY x%d, WORD FOUND %s; he says: %s" % [line.get("text", ""), line.get("sub", ""), give_prompt, loot.furnace, int(loot.words.get("heavy", 0)), str(_hud._data["words"].get(loot.toast.get("word", ""), {}).get("name", "-")).to_upper(), _wu_said("The armourer: \"The forge")])
	await _wait(0.2)
	var after_prompt: Array = town.prompt.duplicate()
	var again: bool = loot.armourer_hand_in()
	town._do(town.prompt[1])
	await _wait(0.3)
	await _snap(dir + "/w28_his_shelves_again.png")
	_wu(after_prompt == ["E: Armourer", "armourer"] and not again and _inv.visible and _inv.shop == "armourer" and int(loot.words.get("heavy", 0)) == 1, "rewarded, his prompt is %s; asked again he has nothing (%s); used, his shelves open (%s, '%s'); HEAVY x%d" % [after_prompt, again, _inv.visible, _inv.shop, int(loot.words.get("heavy", 0))])
	_inv.toggle()
	# (HEAVY set where POWER was: POWER goes back to his words)
	_inv.open_on(0)
	_inv._press("word", "heavy")
	_inv._press("slot", [0, "front", 0])
	await _wait(1.4)
	await _snap(dir + "/w29_heavy_strike.png")
	_wu(names.call()[0] == "Heavy Strike of Venom" and int(loot.words.get("heavy", 0)) == 0 and int(loot.words["power"]) == 2, "HEAVY set in front of Strike where POWER was: '%s'; POWER back among his words x%d; its lines: %s" % [names.call()[0], int(loot.words["power"]), L.r(0)["lines"]])

	# --- at level 15 (not come to on floors 1 to 5; set here to show the rule): a second slot in front, one damage word a side
	loot.level = 15
	loot.derive()
	loot.words["frost"] = int(loot.words.get("frost", 0)) + 1
	_inv._press("word", "power")
	_inv._press("slot", [0, "front", 1])
	await _wait(1.3)
	_inv._press("word", "frost")
	_inv._press("slot", [1, "front", 1])
	await _wait(0.2)
	await _snap(dir + "/w30_one_damage_word_per_side.png")
	_wu(sizes.call(L.front) == [2, 2, 2] and sizes.call(L.behind) == [1, 1, 1] and names.call()[0] == "Heavy Power Strike of Venom" and _inv._note == "One damage word per side" and L.front[1] == ["fire", null] and int(loot.words["frost"]) == 1, "level 15: slots in front %s, behind %s; POWER beside HEAVY: '%s'; FROST into the Whirlwind's second slot beside FLAME: it says '%s', the Whirlwind still %s, FROST still held x%d" % [sizes.call(L.front), sizes.call(L.behind), names.call()[0], _inv._note, L.front[1], int(loot.words["frost"])])
	_inv.toggle()
	await _wait(0.3)
	await _snap(dir + "/w31_two_slots_in_front_at_the_bottom.png")
	_wu(_wu_reads(0) == ["HEAVY", "POWER", "STRIKE", "of", "VENOM"] and _wu_reads(1) == ["FLAME", "[+]", "WHIRLWIND", "[+]"], "the bottom of the screen: Strike reads %s, the Whirlwind %s" % [_wu_reads(0), _wu_reads(1)])

	# --- the fallen wordsmith's satchel for a hero whose ring was lit before he searched one, and who has no word yet (a hero
	# made here, by taking every word from this one: the game's is one of a player whose ring another hero of his has lit):
	# a word laid by him; taken, it is his first: announced large, and the gear screen opened on it at the next quiet moment
	for i in 3:
		for side in ["front", "behind"]:
			for k in L.slots(i, side).size():
				L.take(i, side, k)
	loot.words = {"power": 0}
	loot.taught = false
	loot.offer = ""
	loot.gear["mainhand"].erase("imbues")
	loot.bag.clear()
	loot.body_searched = false
	loot.cleared = 0
	await go_to("floor1", "stairs")
	await _wait(0.8)
	b = loot._body
	_wu(b != null and not b["searched"] and not loot.word_at_work() and loot.spare() == 0, "floor 1 for a hero whose ring is lit, who has searched none and has no word (%d held, at work %s): the fallen wordsmith lies there %s, searched %s" % [loot.spare(), loot.word_at_work(), b != null, b["searched"] if b != null else "-"])
	if b != null:
		# (nothing left awake about him, so that the moment is quiet)
		for m in _monsters.list:
			if is_instance_valid(m) and not m.dead and not m.boss and m.world.distance_to(b["at"]) < 16.0:
				m.hurt(1e9)
		h.world = b["at"] + Vector2(0.5, 0.5)
		await _wait(0.4)
		var by_him := _wu_lying()
		await _snap(dir + "/w32_the_satchels_word.png")
		_wu(by_him.size() == 1 and by_him[0][0] == "power" and by_him[0][1] == b["at"] and loot.quest == "" and _wu_said("A fallen wordsmith.") == "A fallen wordsmith. In the satchel: full flasks, and a WORD.", "searched: %s; laid by him %s; the stone not his (quest '%s')" % [_wu_said("A fallen wordsmith."), by_him, loot.quest])
		t = 0.0
		while loot.spare() == 0 and t < 4.0:
			await get_tree().process_frame
			t += get_process_delta_time()
		await _wait(0.3)
		await _snap(dir + "/w33_his_first_word_found.png")
		_wu(int(loot.words["power"]) == 1 and loot.toast.get("big", false) and loot.offer == "power" and not _inv.visible, "taken: POWER x%d; WORD FOUND, large %s (his first); to be offered a place: '%s'; the gear screen not yet open %s" % [int(loot.words["power"]), loot.toast.get("big"), loot.offer, not _inv.visible])
		t = 0.0
		while not _inv.visible and t < 6.0:
			await get_tree().process_frame
			t += get_process_delta_time()
		await _wait(0.3)
		await _snap(dir + "/w34_the_gear_screen_opens_on_it.png")
		_wu(_inv.visible and t > 1.5 and t < 3.0 and _inv._page == "attacks" and _inv._word == "" and _inv._coach() == "Drag POWER onto STRIKE, or click the word and then the slot.", "%.1f s on (2.4 s of quiet from when it was taken): the gear screen open %s on %s, the word left on its tile (in hand '%s'); the coach: %s" % [t + 0.3, _inv.visible, _inv._page, _inv._word, _inv._coach()])
		_inv._press("word", "power")
		_inv._press("slot", [0, "front", 0])
		await _wait(1.3)
		await _snap(dir + "/w35_set_on_a_floor_the_coach.png")
		_wu(loot.taught and _inv._coach() == "POWER STRIKE! Close this and try it.", "set on a floor: the coach says: %s" % _inv._coach())
		_inv.toggle()

	# --- and on a later floor for a hero with neither the lit ring nor the stone who has searched none (made here)
	loot.ring_lit = false
	loot.body_searched = false
	await go_to("floor3", "down")
	await _wait(1.2)
	b = loot._body
	_wu(b != null and not b["searched"] and map.body != null and b["at"] == Vector2(map.body["x"], map.body["y"]) and not loot.words_fall(), "floor 3 for a hero with neither the lit ring nor the stone who has searched none: the fallen wordsmith lies there %s at %s; words fall %s" % [b != null, b["at"] if b != null else "-", loot.words_fall()])
	if b != null:
		h.world = _spot_near(b["at"], 2.0, h.world)
		await _wait(0.5)
		await _snap(dir + "/w36_floor3_the_fallen_wordsmith.png")
		h.world = b["at"] + Vector2(0.5, 0.5)
		await _wait(0.4)
		_wu(loot.quest == "heart" and b["searched"] and _wu_lying().is_empty(), "searched there before the ring is lit: he carries the stone (quest '%s'), no word laid %s" % [loot.quest, _wu_lying()])
	print("WORDSUI: %d lines, %d wrong%s" % [_wu_n, _wu_bad.size(), "" if _wu_bad.is_empty() else ": " + str(_wu_bad)])


## SHOT MODE: the monsters' moves, each pictured the moment it shows. The hero is set down in sight of each monster that has
## moves and stands there, unharmed (its blows flash him but take nothing, so that each move is seen to its end): the red
## troll (his charge's line, his run, his slam's circle), the archers (the rain's ring, the arrows come down), the
## marksman (his line of aim, his great arrow), the Warden (his bolts, the Lockdown's shadows and its bars, the dead he
## calls). Each picture at twice the size; then the game quits, saying which moves were made.
func _shoot(hero: Hero, dir: String) -> void:
	DirAccess.make_dir_recursive_absolute(dir)
	hero.unhurt = true
	if _arg("only") == "wordsui":
		await _wordsui_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "rmb":
		await _rmb_test(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "town":
		await _town_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "loot":
		await _loot_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "music":
		await _music_test(hero)
		get_tree().quit()
		return
	if _arg("only") == "doors":
		await _door_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "stairs":
		await _stair_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "floor2":
		await _floor2_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "f2moves":
		await _f2_move_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "f2ways":
		await _f2_way_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "props":
		await _prop_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "floors":
		await _floor_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "ways":
		await _way_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "boss":
		await _boss_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "waypoint":
		await _waypoint_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "heights":
		await _height_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "traps":
		await _trap_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "map":
		await _map_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "kind":
		await _kind_shots(hero, dir)
		get_tree().quit()
		return
	if _arg("only") == "gates":
		await _gate_shots(hero, dir)
		get_tree().quit()
		return
	await _wait(1.0)
	await _snap(dir + "/01_start.png")
	await _hero_moves(hero, dir)
	var P := _monsters.perils
	# (the troll whose lair leaves room for a charge)
	var troll: Monster = null
	var spot := Vector2.INF
	for m in _monsters.list:
		if m.kind == "brute" and not m.dead:
			var s := _charge_spot(m, 6.0, Vector2.INF)
			if s != Vector2.INF:
				troll = m
				spot = s
				break
	if troll == null:
		# (neither lair leaves room for a run: the troll is set down in the floor's biggest hall, the hero 6 tiles off)
		troll = _nearest_kind(hero.world, "brute", 0.0)
		var big: Dictionary = {}
		for r in _monsters.map.rooms:
			if big.is_empty() or r["w"] * r["h"] > big["w"] * big["h"]:
				big = r
		troll.world = Vector2(floorf(big["x"] + big["w"] / 2.0) + 0.5, floorf(big["y"] + big["h"] / 2.0) + 0.5)
		spot = _charge_spot(troll, 6.0, _spot_near(troll.world, 6.0, hero.world))
		print("TROLL MOVED to the biggest hall ", big["w"], "x", big["h"])
	if troll != null:
		hero.world = spot
		if _arg("debug") != "":
			for i in 6:
				await _wait(0.5)
				print("TROLL state=", troll.state, " dist=", snappedf(troll.world.distance_to(hero.world), 0.01), " sees=", _monsters.sees(troll.world, hero.world), " moves=", troll._moves.size(), " cd=", snappedf(troll._cd, 0.01), " movecd=", troll._move_cd, " lane=", troll._lane(troll.world.distance_to(hero.world)))
		await _snap_when(dir + "/02_troll_charge_line.png", func(): return _has(P, "lane"), 6.0)
		await _snap_when(dir + "/03_troll_charging.png", func(): return is_instance_valid(troll) and troll.state == "charge", 3.0)
		await _snap_when(dir + "/04_troll_slam.png", func(): return _has(P, "warn"), 8.0)
	var arch := _nearest_kind(hero.world, "archer", 0.0)
	if arch != null:
		hero.world = _spot_near(arch.world, 6.0, hero.world)
		await _snap_when(dir + "/05_archer_rain_ring.png", func(): return _has(P, "rain", 0.7), 10.0)
		await _snap_when(dir + "/06_archer_rain_falls.png", func(): return _has(P, "rain", 1.6), 3.0)
	var mark := _nearest_kind(hero.world, "marksman", 0.0)
	if mark != null:
		hero.world = _spot_near(mark.world, 7.0, hero.world)
		await _snap_when(dir + "/07_marksman_aims.png", func(): return _has(P, "aim", 1.0), 10.0)
		await _snap_when(dir + "/08_marksman_great_arrow.png", func(): return _flying("great"), 3.0)
	var boss := _nearest_kind(hero.world, "warden", 0.0)
	if boss != null:
		hero.world = _spot_near(boss.world, 6.0, hero.world)
		await _snap_when(dir + "/09_warden_bolts.png", func(): return _flying("bolt"), 6.0)
		await _snap_when(dir + "/10_warden_lockdown_shadows.png", func(): return _has_bars(P, -0.5, 0.0), 10.0)
		await _snap_when(dir + "/11_warden_lockdown_bars.png", func(): return _has_bars(P, 0.3, 1.2), 3.0)
		await _snap_when(dir + "/12_warden_calls_the_dead.png", func(): return _rising() >= 2, 16.0)
		await _wait(1.8)
		await _snap(dir + "/13_the_dead_risen.png")
	print("MOVES MADE: ", _monsters.used)
	print("SHOTS DONE ", dir)
	get_tree().quit()


## A spot about `away` tiles from the troll with a clear run for his charge through it and on (open floor behind the hero).
func _charge_spot(troll: Monster, away: float, otherwise: Vector2) -> Vector2:
	var best := otherwise
	var best_err := INF
	var map: FloorMap = _monsters.map
	for ty in range(floori(troll.world.y - away - 2), floori(troll.world.y + away + 3)):
		for tx in range(floori(troll.world.x - away - 2), floori(troll.world.x + away + 3)):
			if not map.walkable(tx, ty):
				continue
			var p := Vector2(tx + 0.5, ty + 0.5)
			var d := p.distance_to(troll.world)
			var err := absf(d - away)
			# (he charges from 3.5 tiles to 9: far enough that he will, near enough that he wakes)
			if err >= best_err or d < 4.5 or d > 8.5:
				continue
			var f := (p - troll.world) / d
			var ok := true
			var a := 0.2
			while a <= d + 1.6 and ok:
				var q := troll.world + f * a
				ok = _monsters.clear(q.x, q.y, 0.42)
				a += 0.2
			if ok:
				best_err = err
				best = p
	return best


func _has(P: Perils, kind: String, after := 0.0) -> bool:
	for p in P.list:
		if p["kind"] == kind and p["t"] >= after:
			return true
	return false


func _has_bars(P: Perils, from: float, to: float) -> bool:
	for p in P.list:
		if p["kind"] == "bars" and p["t"] >= from and p["t"] <= to:
			return true
	return false


func _flying(look: String) -> bool:
	for a in _monsters._arrows:
		if is_instance_valid(a["node"]) and a["node"].look == look:
			return true
	return false


func _rising() -> int:
	var n := 0
	for m in _monsters.list:
		if is_instance_valid(m) and m.state == "rise":
			n += 1
	return n


## A picture the moment `cond` holds (looked at every frame), or after `timeout` seconds whatever holds (named so).
func _snap_when(path: String, cond: Callable, timeout: float) -> bool:
	var t := 0.0
	while t < timeout:
		if cond.call():
			await _snap(path)
			return true
		await get_tree().process_frame
		t += get_process_delta_time()
	await _snap(path.replace(".png", "_timeout.png"))
	print("TIMEOUT ", path.get_file())
	return false


func _alive() -> int:
	var n := 0
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead:
			n += 1
	return n


## The monster of that kind nearest `from`, at least `beyond` tiles off (so as not to pick the soft pack at the start).
func _nearest_kind(from: Vector2, kind: String, beyond: float) -> Monster:
	var best: Monster = null
	var best_d := INF
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == kind:
			var d := m.world.distance_to(from)
			if d >= beyond and d < best_d:
				best_d = d
				best = m
	return best


## A tile centre the hero may stand on, about `away` tiles from `at` and in sight of it.
func _spot_near(at: Vector2, away: float, otherwise: Vector2) -> Vector2:
	var best := otherwise
	var best_err := INF
	var map: FloorMap = _monsters.map
	for ty in range(floori(at.y - away - 2), floori(at.y + away + 3)):
		for tx in range(floori(at.x - away - 2), floori(at.x + away + 3)):
			if not map.walkable(tx, ty):
				continue
			var p := Vector2(tx + 0.5, ty + 0.5)
			var err := absf(p.distance_to(at) - away)
			if err < best_err and _monsters.sees(p, at):
				best_err = err
				best = p
	return best


## A key pressed and let go, as from the keyboard; a press of the left button at a place on the screen (game pixels).
func _key(k: Key) -> void:
	for down in [true, false]:
		var e := InputEventKey.new()
		e.physical_keycode = k
		e.keycode = k
		e.pressed = down
		Input.parse_input_event(e)
		await _wait(0.12)


var _acts_seen := 0


func _click(at: Vector2) -> void:
	var where: Vector2 = get_viewport().get_final_transform() * (at * 2.0)
	for down in [true, false]:
		var e := InputEventMouseButton.new()
		e.button_index = MOUSE_BUTTON_LEFT
		e.pressed = down
		e.position = where
		e.global_position = where
		Input.parse_input_event(e)
		# (whether he begins a blow on it: looked at every frame)
		var was: String = hero._act
		var t := 0.0
		while t < 0.12:
			await get_tree().process_frame
			t += get_process_delta_time()
			if hero._act != was:
				if hero._act != "":
					_acts_seen += 1
				was = hero._act


func _wait(s: float) -> void:
	await get_tree().create_timer(s).timeout


func _snap(path: String) -> void:
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	img.resize(img.get_width() * 2, img.get_height() * 2, Image.INTERPOLATE_NEAREST)
	img.save_png(path)


## SHOT MODE, THE WARRIOR'S OWN MOVES: set down 7 tiles from a pack of skeletons as they wake, he lunges into them
## (in the air; landed), whirls (the blow all round him), and strikes on; pictures of each, and how many fell.
func _hero_moves(hero: Hero, dir: String) -> void:
	var skel := _nearest_kind(hero.world, "skeleton", 12.0)
	if skel == null:
		return
	var n0 := _alive()
	hero.world = _spot_near(skel.world, 7.0, hero.world)
	await _wait(1.4)
	await _snap(dir + "/01a_pack_comes.png")
	var pack := _nearest_kind(hero.world, "skeleton", 0.0)
	hero.auto_lunge = pack.world
	await _wait(0.2)
	await _snap(dir + "/01b_lunge_in_the_air.png")
	await _wait(0.3)
	await _snap(dir + "/01c_lunge_landed.png")
	await _wait(0.3)
	hero.auto_whirl = true
	await _wait(0.33)
	await _wait(0.5)
	await _snap(dir + "/01d_whirl.png")
	hero.auto_whirl = false
	for i in 8:
		hero.auto_attack = true
		await _wait(0.5)
		if i == 3:
			hero.auto_whirl = true
	hero.auto_whirl = false
	await _snap(dir + "/01e_after.png")
	print("WARRIOR'S MOVES: ", n0 - _alive(), " monsters down")


## SHOT MODE, THE LOOT: a pack fought and what it leaves; more gear put in his way; the fallen wordsmith searched (the
## Master Rune-stone, and the Power word: a stand-in for the town); the gear screen with a piece's card; Power put in
## Strike; a level gained and its +5 offered; Power burned into his weapon.
func _loot_shots(hero: Hero, dir: String) -> void:
	await _wait(0.8)
	await _hero_moves(hero, dir)
	await _wait(0.6)
	await _snap(dir + "/20_what_fell.png")
	# (a guardian's hoard laid at his feet, to see gear on the floor and taken)
	for q in [2, 0, 1, 4]:
		_loot._item(hero.world + Vector2(1.6, 0.4), q)
	_loot._gold(hero.world + Vector2(1.2, -0.8), 30)
	_loot._orb(hero.world + Vector2(-1.0, 1.0))
	await _wait(0.2)
	await _snap(dir + "/21_gear_on_the_floor.png")
	hero.auto_dir = Vector2(1, 0)
	await _wait(0.5)
	hero.auto_dir = Vector2.ZERO
	await _wait(0.6)
	await _snap(dir + "/22_taken.png")
	if _loot._body != null:
		hero.world = _spot_near(_loot._body["at"], 2.5, hero.world)
		await _wait(0.3)
		await _snap(dir + "/23_the_fallen_wordsmith.png")
		hero.world = _loot._body["at"] + Vector2(0.6, 0.6)
		await _wait(0.4)
		await _snap(dir + "/24_searched.png")
	_inv.toggle()
	await _wait(0.2)
	_inv._hover = {"item": _loot.gear["mainhand"], "at": Vector2(140, 60)}
	_inv.queue_redraw()
	await _snap(dir + "/25_gear_screen.png")
	_inv._hover = {}
	# (the ring lit, as the wordsmith in town lights it: until it is, his moves have no slots)
	_loot.ring_lit = true
	_loot.derive()
	loot.words["power"] += 1
	_inv._press("front", null)
	_loot.gain_xp(_loot.xp_to_next(1) + 10)
	await _wait(0.2)
	await _snap(dir + "/26_power_in_strike_and_a_level.png")
	_inv._press("attr", "str")
	_loot.words["power"] += 1
	_inv._press("burn", null)
	_inv._press("worn", "mainhand")
	await _wait(0.2)
	_inv._hover = {"item": _loot.gear["mainhand"], "at": Vector2(140, 60)}
	_inv.queue_redraw()
	await _snap(dir + "/27_power_burned_into_the_sword.png")
	_inv.toggle()
	print("LOOT: level ", _loot.level, " gold ", _loot.gold, " bag ", _loot.bag.size(), " worn ", _loot.gear.values().filter(func(i): return i != null).size(), " strike ", hero.strike_words, " stats ", hero.stats)


## SHOT MODE, THE TOWN AND THE FIRST QUEST: the town as he comes into it; up to the wordsmith, and what he asks; down the
## stairs to floor 1; the fallen wordsmith searched; up through the gate; the stone given and the ring lighting; the word
## given and the gear screen opened on it; the armourer's shelf, and a piece bought.
func _town_shots(h: Hero, dir: String) -> void:
	await _wait(1.2)
	await _snap(dir + "/30_town.png")
	h.walked = 5.0
	var smith := Vector2(9.5, 14.5)
	h.world = _spot_near(smith, 1.4, h.world)
	await _wait(0.6)
	await _snap(dir + "/31_up_to_the_wordsmith.png")
	town._do("talk")
	await _wait(0.3)
	await _snap(dir + "/32_what_he_asks.png")
	_hud.words = ""
	go_to("floor1", "stairs")
	await _wait(1.4)
	await _snap(dir + "/33_floor1_by_its_gate.png")
	var b = loot._body
	if b != null:
		h.world = _spot_near(b["at"], 3.0, h.world)
		await _wait(0.4)
		await _snap(dir + "/34_someone_fell_here.png")
		h.world = b["at"] + Vector2(0.5, 0.5)
		await _wait(0.4)
		await _snap(dir + "/35_the_stone.png")
	var t0: Array = _gate["tiles"][1]
	h.world = Vector2(t0[0] + 0.5, t0[1] + 0.5)
	await _wait(1.4)
	await _snap(dir + "/36_back_in_town.png")
	h.world = _spot_near(smith, 1.4, h.world)
	await _wait(0.4)
	town._do("give")
	await _wait(1.6)
	await _snap(dir + "/37_the_stone_laid_in.png")
	await _wait(1.6)
	await _snap(dir + "/38_the_light_runs_round.png")
	await _wait(1.0)
	await _snap(dir + "/39_the_ring_flares.png")
	await _wait(1.0)
	await _snap(dir + "/40_the_word_given.png")
	_inv._press("front", null)
	_inv.toggle()
	await _wait(0.4)
	await _snap(dir + "/41_power_on_strike.png")
	loot.gold = 120
	h.world = _spot_near(Vector2(19.5, 7.5), 1.5, h.world)
	await _wait(0.4)
	await _snap(dir + "/42_by_the_armourer.png")
	town._do("armourer")
	await _wait(0.3)
	_inv._press("buy", 3)
	await _wait(0.2)
	await _snap(dir + "/43_the_armourers_shelf.png")
	_inv.toggle()
	print("TOWN: place ", place, " gold ", loot.gold, " bag ", loot.bag.size(), " ring ", loot.ring_lit, " words ", loot.words, " strike ", h.strike_words)


## THE STAIRWELL DOWN, pictured: the Warden's gate down behind him, the Warden felled, the floor of his hall breaking open
## (three moments of its film), the stairwell lying open; then onto its top step, and down to floor 2, where he comes in.
func _stair_shots(h: Hero, dir: String) -> void:
	var g: Dictionary = {}
	for q in map.doors:
		if q["kind"] == "bossgate":
			g = q
	var gm := Vector2(g["middle"]["x"], g["middle"]["y"])
	var warden: Monster = null
	for m in _monsters.list:
		if m.boss:
			warden = m
	h.world = gm + Vector2(0, -3.2 * float(g["out"]))
	h.face = Vector2(0, -float(g["out"]))
	await _wait(3.8)
	h.world = _spot_near(warden.world, 2.5, h.world)
	await _wait(0.3)
	warden.hurt(999999.0)
	await _wait(0.25)
	var st: Dictionary = map.stairs[_stairs.opened] if _stairs.opened >= 0 else {}
	print("STAIRS: opened at ", _stairs.opened, " ", st, "; the Warden fell at ", warden.world, ", walk past its top step ", [map.walk[int(st["y"]) * map.w + int(st["x"]) + 1], map.walk[int(st["y"]) * map.w + int(st["x"]) + 2]] if not st.is_empty() else [])
	await _snap(dir + "/50_the_floor_breaks.png")
	await _wait(0.8)
	await _snap(dir + "/51_breaking_open.png")
	await _wait(0.9)
	await _snap(dir + "/52_breaking_open_more.png")
	await _wait(1.7)
	print("STAIRS: after ", snappedf(_stairs.t, 0.01), " s")
	await _snap(dir + "/53_the_stairwell_open.png")
	h.world = Vector2(float(st["x"]) - 1.2, float(st["y"]) + 0.6)
	h.face = Vector2(1, 0)
	await _wait(0.3)
	await _snap(dir + "/54_at_its_top_step.png")
	h.world = Vector2(float(st["x"]) + 0.5, float(st["y"]) + 0.6)
	await _wait(1.2)
	print("DOWN: place ", place, " depth ", map.depth, " hero at ", h.world, ", ", _monsters.list.size(), " monsters")
	await _snap(dir + "/55_floor2_where_he_comes_in.png")
	h.world += Vector2(4, 0)
	await _wait(0.6)
	await _snap(dir + "/56_floor2_a_few_steps_in.png")


## FLOOR 2, THE PRISON'S GROUNDS AT NIGHT, pictured: where he comes in (the gaoler's room, indoors: the Crypt's dark), out in
## the first courtyard (the open sky's), by a courtyard's far corner (the sky over its far walls), the Headsman's yard (its own
## sky, what is beyond its walls not drawn), behind its scaffold (seen through), and the Headsman waiting at its foot.
func _floor2_shots(h: Hero, dir: String) -> void:
	await _wait(0.5)
	print("FLOOR 2: at ", h.world, " zone ", look._zone, " dark ", look._dark.material.get_shader_parameter("dark_a"), " vignette ", look.vignette_now)
	await _snap(dir + "/60_floor2_where_he_comes_in.png")
	var r: Dictionary = map.rooms[1]
	h.world = Vector2(float(r["x"]) + 7.5, float(r["y"]) + 9.5)
	await _wait(0.5)
	print("COURT: at ", h.world, " zone ", look._zone, " dark ", look._dark.material.get_shader_parameter("dark_a"), " vignette ", look.vignette_now)
	await _snap(dir + "/61_the_first_courtyard.png")
	r = map.rooms[17]
	h.world = Vector2(float(r["x"]) + 2.5, float(r["y"]) + 2.5)
	await _wait(0.5)
	print("FAR COURT: at ", h.world, " zone ", look._zone)
	await _snap(dir + "/62_by_a_far_wall_the_sky.png")
	var Y: Dictionary = look.data["zones"]["yard"]
	h.world = Vector2(float(Y["x"]) + 3.5, float(Y["y"]) + 10.5)
	h.face = Vector2(1, -1).normalized()
	await _wait(0.6)
	print("YARD: at ", h.world, " zone ", look._zone, " dark ", look._dark.material.get_shader_parameter("dark_a"))
	await _snap(dir + "/63_the_headsmans_yard.png")
	h.world = Vector2(float(Y["x"]) + 6.0, float(Y["y"]) + 4.6)
	await _wait(0.4)
	await _snap(dir + "/64_behind_the_scaffold.png")
	h.world = Vector2(float(Y["x"]) + 9.5, float(Y["y"]) + 11.0)
	await _wait(3.4)
	await _snap(dir + "/65_the_headsman.png")


## FLOOR 2'S MONSTERS' MOVES, pictured: a cultist's fire sigil (its ring under him as it casts, the pillar, the floor burning),
## a Shade's rime (and him slowed in it), the Headsman's prowl and every one of his acts (the vault's spot, the wheel, the
## flurry, the lunge, the dashes); then the game says which moves were made.
func _f2_move_shots(h: Hero, dir: String) -> void:
	var c: Monster = _nearest_kind(h.world, "cultist", 0.0)
	h.world = _spot_near(c.world, 5.0, h.world)
	h.face = (c.world - h.world).normalized()
	_monsters.wake(c)
	await _snap_when(dir + "/70_sigil_cast.png", func(): return _perils_of("sigil", -0.5, -0.2), 12.0)
	await _snap_when(dir + "/71_sigil_erupts.png", func(): return _perils_of("sigil", 0.05, 0.3), 3.0)
	await _snap_when(dir + "/72_sigil_burns.png", func(): return _perils_of("sigil", 1.2, 3.0), 3.0)
	var sh: Monster = _nearest_kind(h.world, "shade", 0.0)
	h.world = _spot_near(sh.world, 1.0, h.world)
	_monsters.wake(sh)
	await _snap_when(dir + "/73_shade_rime.png", func(): return _perils_of("rime", 0.3, 2.0), 10.0)
	print("RIME: hero slowed ", h._slow_t > 0.0, " by ", h._slow_by)
	# (the Headsman: into his yard, his gate down, his line; then his acts)
	var Y: Dictionary = look.data["zones"]["yard"]
	h.world = Vector2(float(Y["x"]) + 3.5, float(Y["y"]) + 10.5)
	await _wait(3.6)
	var hs: Monster = null
	for m in _monsters.list:
		if m.boss:
			hs = m
	print("HEADSMAN: waits ", hs.waits, " state ", hs.state, " mode ", hs.h2.mode)
	var seen := {}
	var t := 0.0
	var spots := [6.0, 3.0, 5.0, 2.0, 7.0]
	var k := 0
	while t < 60.0 and seen.size() < 6:
		if hs.h2.act == null and fmod(t, 6.0) < 0.05:
			h.world = _spot_near(hs.world, spots[k % spots.size()], h.world)
			k += 1
		if hs.h2.act != null:
			var id: String = hs.h2.ACTS[hs.h2.act["i"]]["id"]
			var at: float = hs.h2.act["t"]
			var hit: float = hs.h2.ACTS[hs.h2.act["i"]]["hit"]
			if not seen.has(id) and at >= hit * 0.8:
				seen[id] = true
				await _snap(dir + "/74_headsman_%s.png" % id)
		await get_tree().process_frame
		t += get_process_delta_time()
	print("HEADSMAN acts seen: ", seen.keys(), " after ", snappedf(t, 0.1), " s; mode now ", hs.h2.mode, "; hero life ", h.life)
	print("F2 MOVES: ", _monsters.used)


## FLOOR 2'S WAYS AND TRAPS, pictured: the floor's name as he comes in; the waypoint woken, and the warp to town and back down
## by the town's; a spike floor rising under him; a dart wall's plate and its darts; the sealed door, what it wants, and its
## seal broken by a Strike carrying POWER.
func _f2_way_shots(h: Hero, dir: String) -> void:
	await _wait(0.7)
	await _snap(dir + "/80_floor2_its_name.png")
	await _wait(3.0)
	print("WAY: awake ", _way.awake, " here ", _way.here(), " way_depth ", way_depth)
	h.world = _way.at
	await _wait(0.2)
	print("WAY: prompt ", prompt())
	await _snap(dir + "/81_on_the_waypoint.png")
	_way.warp()
	await _wait(0.12)
	await _snap(dir + "/82_the_warp.png")
	await _wait(0.4)
	print("WARP: place ", place, " hero at ", h.world, " town way awake ", _way.awake if _way != null else null, " prompt ", prompt())
	await _snap(dir + "/83_out_in_town.png")
	await _wait(0.8)
	_way.warp()
	await _wait(0.6)
	print("WARP BACK: place ", place, " hero at ", h.world)
	await _snap(dir + "/84_back_on_floor2.png")
	# (a spike floor: him on it until it rises; hurt, a sixth of his life)
	h.unhurt = false
	var sp: Dictionary = map.hazards[0]
	h.world = Vector2(float(sp["x"]) + 1.0, float(sp["y"]) + 1.5)
	var was := h.life
	await _snap_when(dir + "/85_spikes_up.png", func(): return h.life < was, 4.0)
	print("SPIKES: life ", was, " -> ", h.life, " (a sixth of ", h.max_life, ")")
	h.life = h.max_life
	# (a dart wall: on its plate, and the darts)
	var dw: Dictionary = map.hazards[2]
	h.world = Vector2(float(dw["x"]) + 0.5, float(dw["y"]) + 0.5)
	was = h.life
	await _wait(0.35)
	await _snap(dir + "/86_darts_fly.png")
	await _wait(1.6)
	print("DARTS: life ", was, " -> ", h.life)
	h.life = h.max_life
	h.unhurt = true
	# (the sealed door)
	var wd: Dictionary = {}
	for d in map.doors:
		if d["kind"] == "worddoor":
			wd = d
	var mid := Vector2(wd["middle"]["x"], wd["middle"]["y"])
	# (out of its room: `out` the way out of it, along the axis across its doorway)
	var out := Vector2(0, float(wd["out"])) if wd["alongX"] else Vector2(float(wd["out"]), 0)
	for m in _monsters.list:
		if is_instance_valid(m) and not m.dead and m.world.distance_to(mid) < 10.0:
			m.hurt(999999.0)
	h.world = mid + out * 4.0
	await _wait(0.6)
	print("SEALED: walk ", map.walk[int(wd["way"][0])], " shut ", map.shut[int(wd["way"][0])], " told ", wd.get("told", false))
	await _snap(dir + "/87_a_sealed_door.png")
	h.world = mid + out * 1.3
	h.face = -out
	h.loadout.set_level(maxi(1, h.loadout.level), true)
	h.loadout.put(0, "front", "power")
	await _wait(0.2)
	h._begin_strike()
	await _wait(0.6)
	print("SEAL: hero at ", h.world, " facing ", h.face, " door at ", mid)
	print("SEAL: want ", wd["want"], " walk ", map.walk[int(wd["way"][0])], " shut ", map.shut[int(wd["way"][0])])
	await _snap(dir + "/88_the_seal_breaks.png")


func _perils_of(kind: String, t0: float, t1: float) -> bool:
	for p in _monsters.perils.list:
		if p["kind"] == kind and p["t"] >= t0 and p["t"] <= t1:
			return true
	return false


## (A TEST: a real right-button press sent through Godot's input, as a mouse would send it, and what he does with it.)
## THE DOORS, pictured: the first room's door shut with him short of it (and what is in that room out of his reach), then swung
## open as he comes within 2.6 tiles; the Warden's gate falling behind him in the hall, the Warden waiting ("Not yet"), his
## line and his name, then fighting; the gate rising once he is dead.
func _door_shots(h: Hero, dir: String) -> void:
	var d: Dictionary = map.doors[0]
	var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
	var r: Dictionary = map.room(int(d["room"]))
	h.world = mid + Vector2(0, 3.6)
	h.face = Vector2(0, -1)
	await _wait(0.6)
	var inside := 0
	var held := 0
	for m in _monsters.list:
		if FloorMap.in_room(r, m.world):
			inside += 1
			if _monsters.shut_in(m):
				held += 1
	print("DOOR 0 shut: open ", d["open"], " shut tile ", map.shut[int(d["way"][0])], "; ", inside, " in its room, ", held, " out of reach")
	await _snap(dir + "/40_door_shut.png")
	h.world = mid + Vector2(0, 2.2)
	await _wait(0.12)
	await _snap(dir + "/41_door_swinging.png")
	await _wait(0.5)
	print("DOOR 0 near: open ", d["open"], " shut tile ", map.shut[int(d["way"][0])], ", out of reach now ", _monsters.shut_in(_nearest_in(r)) if _nearest_in(r) != null else "-")
	await _snap(dir + "/42_door_open.png")
	# (the Warden's gate)
	var g: Dictionary = {}
	for q in map.doors:
		if q["kind"] == "bossgate":
			g = q
	var gm := Vector2(g["middle"]["x"], g["middle"]["y"])
	var warden: Monster = null
	for m in _monsters.list:
		if m.boss:
			warden = m
	h.world = gm + Vector2(0, -2.0 * float(g["out"]))
	h.face = Vector2(0, -float(g["out"]))
	await _wait(0.6)
	print("GATE before: open ", g["open"], ", warden waits ", warden.waits, " state ", warden.state)
	await _snap(dir + "/43_gate_up.png")
	h.world = gm + Vector2(0, -3.2 * float(g["out"]))
	await _wait(0.08)
	await _snap(dir + "/44_gate_falling.png")
	await _wait(0.3)
	warden.hurt(50.0)
	await _wait(0.1)
	print("GATE fallen: open ", g["open"], ", walk ", map.walk[int(g["tiles"][1])], ", warden waits ", warden.waits, " life ", warden.life, "/", warden.max_life)
	await _snap(dir + "/45_gate_down_not_yet.png")
	await _wait(0.9)
	await _snap(dir + "/46_his_line_and_name.png")
	await _wait(2.0)
	print("GATE after intro: warden waits ", warden.waits, " state ", warden.state)
	await _snap(dir + "/47_he_fights.png")
	warden.hurt(999999.0)
	await _wait(1.3)
	print("GATE after his death: open ", g["open"], ", walk ", map.walk[int(g["tiles"][1])])
	h.world = gm + Vector2(0, 1.5 * float(g["out"]))
	await _wait(0.3)
	await _snap(dir + "/48_gate_risen.png")


## THE CHESTS, BARRELS AND URNS, pictured: a king's coffer shut, then open with what was in it; an urn whole, then struck and
## broken; a Whirlwind through a row of them.
func _prop_shots(h: Hero, dir: String) -> void:
	var chest: Dictionary = {}
	for p in map.props:
		if p["kind"] == "chest" and chest.is_empty():
			chest = p
	var c := Vector2(chest["x"], chest["y"])
	h.world = _spot_near(c, 2.6, h.world)
	await _wait(0.6)
	await _snap(dir + "/50_chest_shut.png")
	h.world = _spot_near(c, 1.3, h.world)
	await _wait(1.0)
	print("CHEST: state ", chest["state"], ", ", loot._drops.size(), " things lie about")
	await _snap(dir + "/51_chest_open.png")
	# (the urn with the most of its kind round it)
	var best: Dictionary = {}
	var most := -1
	for p in map.props:
		if p["kind"] == "chest":
			continue
		var n := 0
		for q in map.props:
			if q["kind"] != "chest" and Vector2(q["x"], q["y"]).distance_to(Vector2(p["x"], p["y"])) < 2.6:
				n += 1
		if n > most:
			most = n
			best = p
	var u := Vector2(best["x"], best["y"])
	h.world = _spot_near(u, 1.3, h.world)
	h.face = (u - h.world).normalized()
	await _wait(0.5)
	await _snap(dir + "/52_urn_whole.png")
	var walk_was := map.walk[int(best["ty"]) * map.w + int(best["tx"])]
	h.auto_attack = true
	await _wait(0.9)
	h.auto_attack = false
	print("URN: ", best["kind"], " state ", best["state"], ", its tile walkable ", walk_was, " -> ", map.walk[int(best["ty"]) * map.w + int(best["tx"])])
	await _snap(dir + "/53_urn_broken.png")
	h.auto_whirl = true
	await _wait(1.2)
	h.auto_whirl = false
	var broken := 0
	for p in map.props:
		if p["kind"] != "chest" and int(p["state"]) == 1:
			broken += 1
	print("WHIRL: ", broken, " broken in all")
	await _wait(0.3)
	await _snap(dir + "/54_whirled_through.png")


func _nearest_in(r: Dictionary) -> Monster:
	for m in _monsters.list:
		if FloorMap.in_room(r, m.world) and not m.dead:
			return m
	return null


## THE MUSIC, checked: the town's walk; floor 1's walk; a fight's coming in near a monster awake, from its "fight in at";
## its going 4 s after the last of them has gone to sleep or fallen, and the walk back.
func _music_test(h: Hero) -> void:
	await _wait(1.0)
	_music_said("town, 1 s in")
	go_to("floor1", "stairs")
	await _wait(1.6)
	_music_said("floor 1, come in")
	var m := _nearest_kind(h.world, "skeleton", 0.0)
	var came := h.world
	h.world = _spot_near(m.world, 3.0, h.world)
	await _wait(0.4)
	_music_said("by a skeleton, 0.4 s")
	await _wait(1.0)
	_music_said("by a skeleton, 1.4 s")
	for x in _monsters.list:
		if not x.dead and x.state != "sleep":
			x.hurt(99999.0)
	h.world = came
	await _wait(2.0)
	_music_said("all fallen, 2 s")
	await _wait(2.6)
	_music_said("all fallen, 4.6 s")
	await _wait(1.6)
	_music_said("all fallen, 6.2 s")


func _music_said(when: String) -> void:
	var said := []
	for t in music.get_children():
		said.append("%s %s gain %.2f at %.2f s" % [t.stream.resource_path.get_file(), "playing" if t.playing else "stopped", t.gain, t.get_playback_position()])
	print("MUSIC ", when, ": fight ", music.fighting(), ", in fight ", _in_fight(), " | ", ", ".join(said))


func _rmb_test(h: Hero, dir: String) -> void:
	# (set down near a pack of skeletons, so the spin has something to cut)
	var skel := _nearest_kind(h.world, "skeleton", 12.0)
	if skel != null:
		h.world = _spot_near(skel.world, 2.5, h.world)
	await _wait(1.2)
	var e := InputEventMouseButton.new()
	e.button_index = MOUSE_BUTTON_RIGHT
	e.pressed = true
	e.position = get_viewport().get_visible_rect().size / 2.0 + Vector2(60, 20)
	e.global_position = e.position
	Input.parse_input_event(e)
	var n0 := _alive()
	for i in 90:
		await get_tree().process_frame
		if i % 15 == 0:
			print("RMB held frame ", i, " act=", h._act, " cuts=", h._bites, " spun=", snappedf(h._spun, 0.01), " facing=", h.face.snapped(Vector2(0.01, 0.01)))
		if i == 20:
			await _snap(dir + "/rmb_spin_a.png")
		if i == 30:
			await _snap(dir + "/rmb_spin_b.png")
	var up := e.duplicate()
	up.pressed = false
	Input.parse_input_event(up)
	for i in 30:
		await get_tree().process_frame
	print("RMB let go: act=", h._act, " cuts=", h._bites, " wait=", snappedf(h._whirl_cd, 0.01), " of ", snappedf(h._whirl_full, 0.01), "; monsters down ", n0 - _alive())


## SHOT MODE, EVERY FLOOR THAT IS IN (--only=floors [--floor=N]): each come into as from the floor above, pictured where he
## comes in, in the middle of its biggest room, before the boss's gate and in the boss's hall; what stands and fights there
## is as the floor has it (he is not to be harmed).
func _floor_shots(h: Hero, dir: String) -> void:
	var only := int(_arg("floor")) if _arg("floor") != "" else 0
	for n in range(1, FLOORS + 1):
		if not has_floor(n) or (only != 0 and n != only):
			continue
		go_to("floor%d" % n, "down" if n > 1 else "start")
		await _wait(1.6)
		await _snap(dir + "/f%d_1_in.png" % n)
		if _arg("debug") != "":
			var st = h.get_parent()
			var faint := 0
			var near := []
			for i in st._walls.size():
				if st._walls[i].modulate.a < 0.99:
					faint += 1
				var top: Vector2 = st._tops[i]
				if absf(top.x - h.position.x) < 200 and absf(top.y - h.position.y) < 200 and near.size() < 12:
					near.append([st._depths[i], top - h.position, st._walls[i].modulate.a])
			print("DEBUG walls ", st._walls.size(), " faint ", faint, " hero depth ", h.world.x + h.world.y, " pos ", h.position, " near ", near)
		var big: Dictionary = {}
		var boss: Dictionary = {}
		for r in map.rooms:
			if r["kind"] == "boss":
				boss = r
			elif r["kind"] == "normal" and (big.is_empty() or float(r["w"]) * float(r["h"]) > float(big["w"]) * float(big["h"])):
				big = r
		if not big.is_empty():
			h.world = _free_near(Vector2(float(big["x"]) + float(big["w"]) / 2.0, float(big["y"]) + float(big["h"]) / 2.0))
			await _wait(1.2)
			await _snap(dir + "/f%d_2_room.png" % n)
		if not boss.is_empty():
			h.world = _free_near(Vector2(float(boss["x"]) + float(boss["w"]) / 2.0, float(boss["y"]) + float(boss["h"]) / 2.0))
			await _wait(1.5)
			await _snap(dir + "/f%d_3_boss.png" % n)
		print("FLOOR %d: %s, %d monsters, %d doors, way on: %s" % [n, place_title(), _monsters.list.size(), map.doors.size(), ways.way_kind() if ways != null else ("stair" if _stairs != null else "-")])


## The nearest place to `at` a body may stand.
func _free_near(at: Vector2) -> Vector2:
	for r in range(0, 12):
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var tx := floori(at.x) + dx
				var ty := floori(at.y) + dy
				if map.walkable(tx, ty):
					return Vector2(tx + 0.5, ty + 0.5)
	return at


## Can a body walk from `from` to the room `r` (four ways, over the walk grid as it is now, through doors that open of
## themselves: a door's tile is in the walk grid, shut or not)?
func _walks_to(from: Vector2, r: Dictionary) -> bool:
	var seen := PackedByteArray()
	seen.resize(map.w * map.h)
	var q := PackedInt32Array([floori(from.y) * map.w + floori(from.x)])
	seen[q[0]] = 1
	var head := 0
	while head < q.size():
		var i := q[head]
		head += 1
		var tx := i % map.w
		var ty := i / map.w
		if FloorMap.in_room(r, Vector2(tx + 0.5, ty + 0.5)):
			return true
		for dxy in [Vector2i(1, 0), Vector2i(-1, 0), Vector2i(0, 1), Vector2i(0, -1)]:
			var nx: int = tx + dxy.x
			var ny: int = ty + dxy.y
			if nx < 0 or ny < 0 or nx >= map.w or ny >= map.h:
				continue
			var j := ny * map.w + nx
			if seen[j] == 0 and map.walk[j] != 0:
				seen[j] = 1
				q.append(j)
	return false


## SHOT MODE, THE GATES OF A FLOOR (--only=gates --floor=N): whether the boss's hall can be walked to as he comes in; the
## lever's gate seen down (its line), its lever walked up to (the gate rises); a room that locks walked into (its gates
## fall), its pack struck dead (they rise); floor 5's temple door come to without its keys (its line), a key taken, and
## another, and come to again (its chains fall, its leaves swing open); and whether the boss's hall can be walked to then.
func _gate_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.4)
	var tag := dir + "/g%d_" % n
	var hall: Dictionary = {}
	for r in map.rooms:
		if r.get("kind", "") == "boss":
			hall = r
	var said: Array = ["the boss's hall walked to as he comes in: %s" % _walks_to(h.world, hall)]
	for m in _monsters.list:
		if is_instance_valid(m) and not m.boss:
			m.state = "sleep"
	# --- the lever's gate
	for d in map.doors:
		if d["kind"] != "gate":
			continue
		var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
		# (before it, outside the room it bars)
		var out := mid + (Vector2(0, d["out"]) if d["alongX"] else Vector2(d["out"], 0)) * 2.5
		h.world = _free_near(out)
		await _wait(0.6)
		await _snap(tag + "1_the_gate_down.png")
		said.append("the gate: want %d, its tiles walked %s, told %s" % [int(d["want"]), [map.walk[int(d["tiles"][0])], map.walk[int(d["tiles"][1])]], d.get("told", false)])
		for p in map.props:
			if p["kind"] == "lever" and p.get("name", "") != "crank":
				h.world = _free_near(Vector2(p["x"], p["y"]) + Vector2(2.6, 0))
				await _wait(0.5)
				await _snap(tag + "2_the_lever.png")
				var at := Vector2(p["x"], p["y"])
				var best := h.world
				for ty in range(floori(at.y) - 1, floori(at.y) + 2):
					for tx in range(floori(at.x) - 1, floori(at.x) + 2):
						if map.walkable(tx, ty) and Vector2(tx + 0.5, ty + 0.5).distance_to(at) < best.distance_to(at):
							best = Vector2(tx + 0.5, ty + 0.5)
				h.world = best
				await _wait(0.5)
				await _snap(tag + "3_the_lever_pulled.png")
				said.append("the lever %.1f off: state %d" % [h.world.distance_to(at), int(p["state"])])
		h.world = _free_near(out)
		await _wait(1.3)
		await _snap(tag + "4_the_gate_up.png")
		said.append("the gate: want %d open %.2f, its tiles walked %s" % [int(d["want"]), float(d["open"]), [map.walk[int(d["tiles"][0])], map.walk[int(d["tiles"][1])]]])
	# --- a room that locks
	for r in map.rooms:
		if not r.get("locks", false):
			continue
		var pack: Array = []
		for m in _monsters.list:
			if is_instance_valid(m) and not m.dead and m.pack_id >= 0 and m.pack_id < map.packs.size() and int(map.packs[m.pack_id]) == int(r["id"]):
				pack.append(m)
		h.world = _free_near(Vector2(r["x"] + r["w"] / 2.0, r["y"] + r["h"] / 2.0))
		await _wait(0.8)
		await _snap(tag + "5_the_room_locks.png")
		var gates: Array = []
		for d in map.doors:
			if d["kind"] == "trapgate" and int(d["room"]) == int(r["id"]):
				gates.append(int(d["want"]))
		said.append("the room that locks (%d of its pack): its gates want %s" % [pack.size(), gates])
		for m in pack:
			if is_instance_valid(m):
				m.hurt(1e9)
		await _wait(1.5)
		await _snap(tag + "6_its_pack_dead.png")
		gates = []
		for d in map.doors:
			if d["kind"] == "trapgate" and int(d["room"]) == int(r["id"]):
				gates.append(int(d["want"]))
		said.append("its pack dead: its gates want %s" % [gates])
	# --- floor 5's temple door
	if temple != null:
		var d: Dictionary = map.doors[int(map.temple["door"])]
		var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
		var out := mid + (Vector2(0, d["out"]) if d["alongX"] else Vector2(d["out"], 0)) * 2.0
		h.world = _free_near(out)
		await _wait(0.7)
		await _snap(tag + "7_the_temple_door_barred.png")
		said.append("the temple door: told %s keys %d, walked %s" % [temple.told, temple.keys, map.walk[int(d["tiles"][1])]])
		# (its two keybearers struck dead, each key walked to where it lies; were they not on the floor, the keys are given)
		var bearers: Array = []
		for m in _monsters.list:
			if is_instance_valid(m) and (m.kind == "keyblade" or m.kind == "keyflame"):
				bearers.append(m)
		for m in bearers:
			h.world = _free_near(m.world + Vector2(2.0, 0.0))
			await _wait(0.3)
			m.hurt(1e9)
			await _wait(1.3)
			for at in Monster.Keybearers.keys_lying(_monsters):
				h.world = at
				await _wait(0.4)
			await _snap(tag + "7%s_a_key_taken_%s.png" % ["b" if m.kind == "keyblade" else "c", m.kind])
		said.append("its keybearers: %d; keys held %d" % [bearers.size(), temple.keys])
		while temple.keys < temple.need:
			_monsters.quest_item.emit("key", h.world)
			await _wait(0.2)
		h.world = _free_near(out)
		for k in [[0.9, "8a_its_first_chain"], [1.2, "8b_its_second_chain"], [1.3, "8c_its_leaves_swing"], [1.4, "8d_the_temple_open"]]:
			await _wait(k[0])
			await _snap(tag + "%s.png" % k[1])
		said.append("with both keys: keys %d, open %s, walked %s" % [temple.keys, temple.open, map.walk[int(d["tiles"][1])]])
	# --- floor 3's furnace: the fire in the hall's way, the crank without its gear, the gear taken, the crank turned
	if furnace != null and not furnace._door.is_empty():
		var d: Dictionary = furnace._door
		var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
		var out := mid + (Vector2(0, d["out"]) if d["alongX"] else Vector2(d["out"], 0)) * 2.5
		h.world = _free_near(out)
		await _wait(0.7)
		await _snap(tag + "7_fire_bars_the_hall.png")
		said.append("the fire: told %s, its way walked %s, the hall walked to %s" % [furnace.told, map.walk[int(d["tiles"][1])], _walks_to(h.world, hall)])
		var c := Vector2(furnace._crank["x"], furnace._crank["y"])
		var by := _free_near(c + Vector2(0.9, 0.4))
		h.world = by
		await _wait(0.6)
		await _snap(tag + "8a_the_crank_without_its_gear.png")
		said.append("the crank %.1f off without the gear: step '%s', told %s" % [by.distance_to(c), furnace.step, furnace.told_crank])
		# (the gear: from the Stoker himself: he is struck dead, his gear lies where his death leaves it, and the hero walks to it)
		var keeper = null
		for m in _monsters.list:
			if is_instance_valid(m) and m.kind == "stoker" and not m.dead:
				keeper = m
		if keeper != null:
			h.world = _spot_near(keeper.world, 3.0, h.world)
			await _wait(0.2)
			keeper.hurt(1e9)
			await _wait(4.6)
			await _snap(tag + "8b_the_stoker_fallen_his_gear.png")
			for g in _monsters.perils.get_children():
				if g.get("at") != null:
					h.world = g.at
			await _wait(0.4)
			said.append("the Stoker dead %s; the gear taken from where he fell: step '%s'" % [keeper.dead, furnace.step])
		else:
			h.world = _free_near(c + Vector2(4.0, 0.0))
			await _wait(0.2)
			_monsters.quest_item.emit("gear", h.world)
			await _wait(0.4)
		h.world = _free_near(c + Vector2(4.0, 0.0))
		await _wait(0.3)
		await _snap(tag + "8b_the_gear_set_in.png")
		h.world = by
		for k in [[0.5, "8c_the_crank_turning"], [1.3, "8d_the_furnace_going_out"], [1.4, "8e_the_furnace_out"]]:
			await _wait(k[0])
			await _snap(tag + "%s.png" % k[1])
		said.append("the crank turned: step '%s', gone %s" % [furnace.step, furnace.gone])
		h.world = _free_near(out)
		await _wait(0.6)
		await _snap(tag + "9_the_way_open.png")
		said.append("the fire's way walked %s" % map.walk[int(d["tiles"][1])])
	said.append("the boss's hall walked to now: %s" % _walks_to(h.world, hall))
	print("GATES floor %d: %s" % [n, "; ".join(said)])


## SHOT MODE, ONE KIND OF MONSTER'S OWN MOVES (--only=kind --floor=N --kind=brute|boneward|priest|dagger|stoker|keyblade|...
## [--away=4] [--secs=14]): the one of that kind nearest the way in (a brute that is no champion: the green troll) is left
## alone on the floor, the hero set down in sight of it, unharmed, far and then near as its moves want; each move pictured at
## its moments (a kind with rules of its own: each of its moves pictured twice, 0.5 s in, as mgr.used counts it); then, for
## the Boneward, a blow from before its shield (it glances off) and one from behind (it lands); for a kind with rules of its
## own, it is struck dead, pictured fallen, and the hero walked to where it fell (what it leaves is taken up). Says which
## moves were made.
func _kind_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	var kind := _arg("kind") if _arg("kind") != "" else "brute"
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.4)
	if sight != null:
		sight.see_all()
	var m: Monster = null
	for o in _monsters.list:
		if is_instance_valid(o) and not o.dead and o.kind == kind and not o.champion and not o.boss and (m == null or o.world.distance_to(h.world) < m.world.distance_to(h.world)):
			m = o
	if m == null:
		print("KIND: floor %d has no %s" % [n, kind])
		return
	for o in _monsters.list:
		if is_instance_valid(o) and o != m:
			o.queue_free()
	# (in the middle of the biggest room near it, so that there is room for a run and a throw; one with rules of its own stays
	# where the floor has it: the Stoker in his arena, a keybearer in its room)
	var own: bool = Monster.BOSS_AI.has(kind)
	var room: Dictionary = {}
	for r in map.rooms:
		if FloorMap.in_room(r, m.world):
			room = r
	var big: Dictionary = room
	for r in map.rooms:
		if r.get("kind", "") != "boss" and (big.is_empty() or r["w"] * r["h"] > big["w"] * big["h"]):
			big = r
	if not own:
		m.world = _free_near(Vector2(big["x"] + big["w"] / 2.0, big["y"] + big["h"] / 2.0))
	var P := _monsters.perils
	var tag := dir + "/k%d_%s_" % [n, kind]
	var plans := {
		"brute": [[7.5, 3.2], [7.0, 6.0], [1.8, 9.0]],
		"boneward": [[5.5, 6.0], [1.5, 5.0], [6.5, 8.0], [1.5, 4.0]],
		"priest": [[6.0, 6.0], [2.4, 9.0]],
		"dagger": [[2.0, 9.0]],
		# (the Knife: set down again 4.2 off every 4 s, so that he throws and leaps as well as stabs; the Flame: within his
		# ring's reach)
		"keyblade": [[4.0, 6.0], [4.2, 4.0], [4.2, 4.0], [4.2, 4.0], [4.2, 4.0], [4.2, 4.0]],
		"keyflame": [[3.0, 25.0]],
		# (the Stoker: far for his coals, near for his rake; then put to under a third of his life, so that his furnace bursts:
		# a third number in a plan is the share of its life it is put to as that part begins)
		"stoker": [[5.0, 8.0], [3.0, 8.0], [4.0, 12.0, 0.3]],
	}
	var marks := {
		"brute": {
			"rush_lane": func(): return _has(P, "lane", 0.6), "rush_run": func(): return m.state == "charge", "rush_stop": func(): return m._rush_stop > 0.4,
			"rampage_swing_1": func(): return _monsters.used.get("rampage_swing", 0) >= 1, "rampage_swing_2": func(): return _monsters.used.get("rampage_swing", 0) >= 2,
			"rampage_ring_marked": func(): return _has(P, "warn", 0.5), "rampage_slam": func(): return _has(P, "ring", 0.04),
		},
		"boneward": {
			"thrust": func(): return not m.bare and m.state == "recover" and m._move >= 0 and m._moves[m._move]["id"] == "swing",
			"spear_thrown": func(): return _flying("spear"), "spear_lies": func(): return _has(P, "spear", 0.3),
			"shield_bash": func(): return m.bare and m.state == "recover", "stoops": func(): return m.state == "pickup" and m._t < 0.55,
		},
		"priest": {
			"fire_bolt": func(): return _flying("bolt"), "censer_swung": func(): return _has(P, "smoke", 0.05), "smoke_burns": func(): return _has(P, "smoke", 1.2),
		},
		"dagger": {
			"frenzy_coiled": func(): return m.state == "windup" and m._t < 0.8, "frenzy_stab_2": func(): return _monsters.used.get("frenzy_stab", 0) >= 2,
			"frenzy_stab_4": func(): return _monsters.used.get("frenzy_stab", 0) >= 4, "winded": func(): return m.state == "recover" and m._t < 0.9,
		},
		# (the keybearers': what they throw and leave, seen in flight and burning, beside each of their moves)
		"keyflame": {
			"ring_of_fire": func(): return _has(P, "kb_ring", 0.3), "fire_balls": func(): return _has(P, "kb_ball", 0.3), "sigil_burns": func(): return _has(P, "kb_sigil", 0.7),
		},
		"keyblade": {
			"knife_flies": func(): return _has(P, "kb_knife", 0.1),
		},
		# (the Stoker's fire: his coals marked, in the air and burning; the sheet behind his rake; his furnace's ring rolling out)
		"stoker": {
			"coals_marked": func(): return _has(P, "st_coals", 1.5), "coals_in_the_air": func(): return _has(P, "st_coals", 2.25), "coals_burn": func(): return _has(P, "st_coals", 3.0),
			"rake_marked": func(): return _has(P, "st_rake", 0.8), "rake_fire": func(): return _has(P, "st_rake", 1.3), "rake_burns": func(): return _has(P, "st_rake", 2.0),
			"ring_marked": func(): return _has(P, "st_ring", 1.2), "ring_rolls": func(): return _has(P, "st_ring", 1.75),
		},
	}
	var todo: Dictionary = marks.get(kind, {})
	var done := {}
	var life0: float = h.life
	var hits := 0
	var k := 0
	h.unhurt = false
	var away := float(_arg("away")) if _arg("away") != "" else 4.0
	var secs := float(_arg("secs")) if _arg("secs") != "" else 14.0
	var seen := {}
	var due: Array = []
	for ph in plans.get(kind, [[away, secs]]):
		if not is_instance_valid(m) or m.dead:
			break
		h.world = _charge_spot(m, ph[0], _spot_near(m.world, ph[0], h.world)) if kind == "brute" and ph[0] > 3.0 else _spot_near(m.world, ph[0], h.world)
		if ph.size() > 2:
			m.life = m.max_life * float(ph[2])
		var t := 0.0
		while t < ph[1]:
			await get_tree().process_frame
			t += get_process_delta_time()
			if h.life < life0:
				hits += 1
			h.life = h.max_life
			life0 = h.life
			for name in todo:
				if not done.has(name) and todo[name].call():
					done[name] = true
					k += 1
					await _snap(tag + "%02d_%s.png" % [k, name])
			if todo.is_empty() or own:
				# (a kind with rules of its own: each of its moves pictured the first two times, half a second in)
				for id in _monsters.used:
					var c: int = _monsters.used[id]
					if c > seen.get(id, 0):
						seen[id] = c
						if c <= 2:
							due.append([t + 0.5, "%s_%d" % [id, c]])
				for q in due.duplicate():
					if t >= q[0]:
						due.erase(q)
						k += 1
						done[q[1]] = true
						await _snap(tag + "%02d_%s.png" % [k, q[1]])
	var said := ""
	if kind == "boneward" and is_instance_valid(m) and not m.dead:
		# (its shield: wait till the wall is up; a blow from before it glances off, one from behind lands)
		var w := 0.0
		h.world = _spot_near(m.world, 1.6, h.world)
		while w < 6.0 and not (m.wall_up() and m.state == "chase"):
			await get_tree().process_frame
			w += get_process_delta_time()
		var up: bool = m.wall_up()
		h.world = m.world + m.face * 1.2
		var l0: float = m.life
		m.hurt(3.0)
		var l1: float = m.life
		await _wait(0.12)
		await _snap(tag + "%02d_glance.png" % (k + 1))
		h.world = m.world - m.face * 1.2
		m.hurt(3.0)
		said = "; its wall up %s; a blow from before it took %.1f, from behind %.1f; glances %d" % [up, l0 - l1, l1 - m.life, _monsters.used.get("glance", 0)]
	if own and is_instance_valid(m) and not m.dead:
		# (struck dead; what it leaves pictured where it fell; then the hero walked there, and it is taken up)
		var fell: Vector2 = m.world
		var got: Array = []
		_monsters.quest_item.connect(func(what: String, at: Vector2): got.append("%s at %s" % [what, at]))
		h.world = _spot_near(m.world, 3.0, h.world)
		m.hurt(1e9)
		if not m.dead:
			# (one that nothing reaches just now: tried again for a while)
			var w2 := 0.0
			while w2 < 8.0 and not m.dead:
				await get_tree().process_frame
				w2 += get_process_delta_time()
				m.hurt(1e9)
		await _wait(1.6)
		await _snap(tag + "%02d_fallen.png" % (k + 1))
		if kind == "stoker":
			# (his death's blast, and his gear lying once his death is done: pictured; then walked to where it lies)
			await _wait(0.5)
			await _snap(tag + "%02d_blast.png" % (k + 2))
			await _wait(3.0)
			await _snap(tag + "%02d_gear_lies.png" % (k + 3))
			k += 2
			for c in P.get_children():
				if c.get("at") != null:
					fell = c.at
		h.world = fell
		await _wait(0.6)
		# (a keybearer's key lies a little to his side: walked to)
		if kind == "keyblade" or kind == "keyflame":
			for at in Monster.Keybearers.keys_lying(_monsters):
				h.world = at
				await _wait(0.4)
		await _snap(tag + "%02d_where_it_fell.png" % (k + 2))
		said += "; dead %s; taken up: %s" % [m.dead, got]
	print("KIND floor %d %s: moves made %s; pictured %s; the hero struck in %d frames%s" % [n, kind, _monsters.used, done.keys(), hits, said])


## SHOT MODE, THE MAPS (--only=map --floor=N): the small map as he comes in; after he has been set down in the rooms along
## the way, so that he has seen more of the floor; the large map open; the pause panel; and the town's small map. Says how
## much of the floor he had seen, and whether the game was held while each was open.
func _map_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.4)
	var tag := dir + "/m%d_" % n
	await _snap(tag + "1_coming_in.png")
	var seen0 := 0
	for i in map.w * map.h:
		seen0 += sight.explored[i]
	for m in _monsters.list:
		if is_instance_valid(m) and not m.boss:
			m.queue_free()
	var back := h.world
	var rooms: Array = map.rooms.duplicate()
	rooms.sort_custom(func(a, b): return int(a.get("path", 0)) < int(b.get("path", 0)))
	for k in mini(rooms.size(), 7):
		var r: Dictionary = rooms[k]
		h.world = _free_near(Vector2(r["x"] + r["w"] / 2.0, r["y"] + r["h"] / 2.0))
		await _wait(0.3)
	await _snap(tag + "2_seven_rooms_on.png")
	var seen1 := 0
	for i in map.w * map.h:
		seen1 += sight.explored[i]
	_mini.show_panel("map")
	await _wait(0.3)
	var held_map := get_tree().paused
	await _snap(tag + "3_the_large_map.png")
	_mini.show_panel("")
	await _wait(0.2)
	var went_on := not get_tree().paused
	_mini.show_panel("pause")
	await _wait(0.3)
	var held_pause := get_tree().paused
	await _snap(tag + "4_paused.png")
	_mini.show_panel("")
	await _wait(0.2)
	print("MAP floor %d (%d by %d): seen %d tiles coming in, %d seven rooms on; held under the large map %s, went on after %s, held under pause %s, goes on now %s" % [n, map.w, map.h, seen0, seen1, held_map, went_on, held_pause, not get_tree().paused])
	# (and by the keys and the pointer, as he would: M and M; a press on the small map and a press anywhere, which must not be
	# a blow as well; Esc and RESUME; the pause button and Esc)
	var W := 480.0
	var said: Array = []
	_acts_seen = 0
	await _key(KEY_M)
	said.append("M opens %s held %s" % [_mini.open, get_tree().paused])
	await _key(KEY_M)
	said.append("M closes '%s' held %s" % [_mini.open, get_tree().paused])
	await _click(Vector2(W - 37, 27))
	said.append("a press on the small map opens %s held %s" % [_mini.open, get_tree().paused])
	await _click(Vector2(240, 135))
	said.append("a press closes '%s' held %s, blows begun %d" % [_mini.open, get_tree().paused, _acts_seen])
	await _key(KEY_ESCAPE)
	said.append("Esc opens %s held %s" % [_mini.open, get_tree().paused])
	var resume: Rect2 = _mini._hits[0][0] if not _mini._hits.is_empty() else Rect2()
	await _click(resume.get_center())
	said.append("RESUME closes '%s' held %s, blows begun %d" % [_mini.open, get_tree().paused, _acts_seen])
	# (and a press on the floor, with nothing open, is a blow: the count is not blind)
	await _click(Vector2(240, 100))
	said.append("a press on the floor: blows begun %d" % _acts_seen)
	await _click(Vector2(W - 11, 59))
	said.append("the pause button opens %s held %s" % [_mini.open, get_tree().paused])
	var sound: Rect2 = _mini._hits[1][0] if _mini._hits.size() > 1 else Rect2()
	await _click(sound.get_center())
	said.append("SOUND: off %s" % AudioServer.is_bus_mute(0))
	await _click(sound.get_center())
	said.append("again: off %s" % AudioServer.is_bus_mute(0))
	await _key(KEY_ESCAPE)
	said.append("Esc closes '%s' held %s" % [_mini.open, get_tree().paused])
	_inv.toggle()
	await _wait(0.2)
	await _key(KEY_ESCAPE)
	said.append("Esc closes the gear screen: shown %s held %s" % [_inv.visible, get_tree().paused])
	print("MAP by hand: ", "; ".join(said))
	h.world = back
	go_to("town", "start")
	await _wait(1.4)
	await _snap(tag + "5_in_town.png")


## SHOT MODE, A FLOOR'S STATES AND ITS WAY ON (--only=ways --floor=N): a door come up to (it swings open), a chest come up to
## (it opens), a barrel or an urn struck (it breaks); then the boss struck dead in his hall, the way on pictured as it opens
## and once it is open, and taken: where he comes out is pictured too.
func _way_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 2
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.5)
	var tag := dir + "/w%d_" % n
	for d in map.doors:
		if d["kind"] == "door" and int(d["want"]) == 0:
			var mid := Vector2(d["middle"]["x"], d["middle"]["y"])
			var out := Vector2(0, float(d["out"])) if d["alongX"] else Vector2(float(d["out"]), 0)
			h.world = _free_near(mid + out * 4.0)
			await _wait(0.4)
			await _snap(tag + "1_door_shut.png")
			h.world = _free_near(mid + out * 2.0)
			await _wait(0.25)
			await _snap(tag + "2_door_swinging.png")
			await _wait(1.0)
			await _snap(tag + "3_door_open.png")
			break
	for p in map.props:
		if p["kind"] == "chest" and int(p["state"]) == 0:
			h.world = _free_near(Vector2(p["x"], p["y"]) + Vector2(1.6, 1.6))
			await _wait(0.3)
			await _snap(tag + "4_chest.png")
			h.world = _free_near(Vector2(p["x"], p["y"]) + Vector2(0.9, 0.9))
			await _wait(0.8)
			await _snap(tag + "5_chest_open.png")
			break
	for p in map.props:
		if (p["kind"] == "barrel" or p["kind"] == "urn") and int(p["state"]) == 0:
			var at := Vector2(p["x"], p["y"])
			h.world = _free_near(at + Vector2(1.2, 1.2))
			await _wait(0.4)
			await _snap(tag + "6_%s.png" % p["kind"])
			h.props.strike(at, 1.2)
			await _wait(0.5)
			await _snap(tag + "7_%s_broken.png" % p["kind"])
			break
	var boss: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and m.boss:
			boss = m
	if boss == null:
		print("WAYS: floor %d has no boss" % n)
		return
	var room: Dictionary = {}
	for r in map.rooms:
		if r["kind"] == "boss":
			room = r
	h.world = _free_near(boss.world + Vector2(2.5, 2.5))
	await _wait(1.0)
	await _snap(tag + "8_boss.png")
	boss.waits = false
	boss.hurt(1e9)
	await _wait(0.3)
	var kind: String = ways.way_kind()
	if _arg("debug") != "":
		var bosses := []
		for m in _monsters.list:
			if is_instance_valid(m) and m.boss:
				bosses.append([m.kind, m.dead, m.life])
		print("DEBUG boss ", boss.kind, " dead ", boss.dead, " life ", boss.life, " fell ", _monsters.boss_fell, " ways dead ", ways._boss_dead, " state '", ways.state, "' bosses ", bosses)
	var k := 0
	while ways.state == "opening" and k < 12:
		await _snap(tag + "9_%s_opening_%02d.png" % [kind, k])
		await _wait(0.45)
		k += 1
	await _wait(0.3)
	await _snap(tag + "9_%s_open.png" % kind)
	# (and seen from beside it)
	var by := h.world
	match kind:
		"stair":
			by = Vector2(float(ways._stair["x"]) - 1.5, float(ways._stair["y"]) + 2.4) if ways._stair["way"] == "x" else Vector2(float(ways._stair["x"]) + 2.4, float(ways._stair["y"]) - 1.5)
		"exit", "cave":
			var wt: Array = ways._way_tiles()
			if not wt.is_empty() and not room.is_empty():
				# (three tiles into the hall from its doorway)
				var mid := Vector2(int(wt[wt.size() / 2]) % map.w + 0.5, int(wt[wt.size() / 2]) / map.w + 0.5)
				var centre := Vector2(float(room["x"]) + float(room["w"]) / 2.0, float(room["y"]) + float(room["h"]) / 2.0)
				by = mid + (centre - mid).normalized() * 3.0
		"shaft":
			by = Vector2(float(map.ways["shaft"]["x"]) + 0.5, float(map.ways["shaft"]["y"]) + 2.5)
	h.world = _free_near(by)
	await _wait(0.6)
	await _snap(tag + "9_%s_open_beside.png" % kind)
	print("WAYS: floor %d: the boss dead, its %s %s after %.1f s" % [n, kind, ways.state, ways._t])
	# take it
	var to := h.world
	match kind:
		"stair":
			var st: Dictionary = ways._stair
			to = Vector2(float(st["x"]) + 0.5, float(st["y"]) + 0.6) if st["way"] == "x" else Vector2(float(st["x"]) + 0.6, float(st["y"]) + 0.5)
		"exit", "cave":
			var tiles: Array = ways._way_tiles()
			if not tiles.is_empty():
				var i: int = tiles[tiles.size() / 2]
				to = Vector2(i % map.w + 0.5, i / map.w + 0.5)
		"shaft":
			to = Vector2(float(map.ways["shaft"]["x"]) + 0.5, float(map.ways["shaft"]["y"]) + 0.5)
	h.world = to
	await _wait(2.0)
	await _snap(tag + "10_after.png")
	print("WAYS: now in %s (%s)" % [place, place_title()])


## SHOT MODE, A FLOOR'S BOSS (--only=boss --floor=N [--secs=40]): the hero set down in the boss's hall, in his sight, not to be
## harmed; the boss wakes (his gate, his line) and fights; every move he makes (monsters.gd `used`) is pictured as it begins
## and twice more as it goes on; then he is struck dead and pictured fallen. Says which moves were made, and how often.
func _boss_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	var secs := float(_arg("secs")) if _arg("secs") != "" else 40.0
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.5)
	var boss: Monster = null
	for m in _monsters.list:
		if is_instance_valid(m) and m.boss:
			boss = m
	if boss == null:
		print("BOSS: floor %d has none" % n)
		return
	var tag := dir + "/b%d_" % n
	h.world = _spot_near(boss.world, 5.0, boss.world)
	await _wait(0.5)
	await _snap(tag + "00_his_hall.png")
	var t := 0.0
	while boss.waits and t < 8.0:
		await get_tree().process_frame
		t += get_process_delta_time()
	_monsters.used = {}
	var seen := {}
	var pending: Array = []  # [id, at, k]
	t = 0.0
	while t < secs and not boss.dead:
		await get_tree().process_frame
		t += get_process_delta_time()
		for id in _monsters.used:
			if not seen.has(id):
				seen[id] = true
				await _snap(tag + "%02d_%s_0.png" % [seen.size(), id])
				pending.append([id, t + 0.45, 1, seen.size()])
				pending.append([id, t + 1.1, 2, seen.size()])
		var keep: Array = []
		for p in pending:
			if t >= p[1]:
				await _snap(tag + "%02d_%s_%d.png" % [p[3], p[0], p[2]])
			else:
				keep.append(p)
		pending = keep
		# (he is kept where the boss can come at him: back near the boss if he has been thrown or has wandered far)
		if h.world.distance_to(boss.world) > 9.0:
			h.world = _spot_near(boss.world, 5.0, boss.world)
	print("BOSS floor %d (%s, %s): moves made in %.0f s: %s; his life %.0f of %.0f; the hero's %.0f" % [n, boss.kind, boss.title, t, _monsters.used, boss.life, boss.max_life, h.life])
	boss.waits = false
	# (floor 5: he is struck dead in the middle of what he has sent out, the hero standing in it: nothing of his may harm
	# him after; and his death is pictured: his light bursting out, the hands of his dead, the pillar of his fire)
	var marks_left := 0
	if boss.kind == "fleshmancer":
		for p in _monsters.perils.list:
			if str(p["kind"]).begins_with("fm_") and not p.get("mini", false):
				marks_left += 1
	h.unhurt = false
	h.life = h.max_life
	boss.hurt(1e9)
	if boss.kind == "fleshmancer":
		var harmed := 0
		var shown := 0.0
		for q in [[0.35, "96_death_burst"], [0.6, "97_death_hands"], [1.75, "98_death_pillar"]]:
			var w := 0.0
			while w < float(q[0]):
				await get_tree().process_frame
				w += get_process_delta_time()
				if h.life < h.max_life:
					harmed += 1
					h.life = h.max_life
			shown += float(q[0])
			await _snap(tag + "%s.png" % q[1])
		print("BOSS floor 5: struck dead with %d of his marks out; the hero harmed in %d frames after; his death pictured to %.2f s" % [marks_left, harmed, shown])
		await _wait(1.0)
	else:
		await _wait(1.6)
	await _snap(tag + "99_fallen.png")
	print("BOSS floor %d: dead %s" % [n, boss.dead])


## SHOT MODE, A FLOOR'S WAYPOINT (--only=waypoint --floor=N): come into the floor, its waypoint pictured awake beside him; he
## steps onto it and warps to town (the column of light pictured as it flares), and from the town's waypoint back down to
## that floor.
func _waypoint_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.6)
	var tag := dir + "/p%d_" % n
	if _way == null:
		print("WAYPOINT: floor %d has none" % n)
		return
	await _snap(tag + "1_awake.png")
	print("WAYPOINT floor %d: at %s awake %s way_depth %d" % [n, _way.at, _way.awake, way_depth])
	h.world = _way.at
	await _wait(0.3)
	print("WAYPOINT: here %s prompt %s" % [_way.here(), prompt()])
	_way.warp()
	await _wait(0.12)
	await _snap(tag + "2_warp.png")
	await _wait(1.2)
	await _snap(tag + "3_in_town.png")
	print("WAYPOINT: now in %s at %s; the town's awake %s prompt %s" % [place, h.world, _way.awake if _way != null else null, prompt()])
	if _way != null and place == "town":
		h.world = _way.at
		await _wait(0.3)
		_way.warp()
		await _wait(1.4)
		await _snap(tag + "4_back.png")
	print("WAYPOINT: back in %s (%s) at %s" % [place, place_title(), h.world])


## SHOT MODE, LEDGES AND STAIRS (--only=heights --floor=N): he is walked up the floor's first flight of stairs (pictured at its
## foot, half way and at its head: lifted as the ground is), then at each ledge round where he stands (he is held by it), and
## along a slanting wall. Says how high he stood at each and what held him.
func _height_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 1
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.5)
	var tag := dir + "/h%d_" % n
	var st := -1
	for i in map.stair.size():
		if map.stair[i] != 0:
			st = i
			break
	if st < 0:
		print("HEIGHTS: floor %d has no stairs (%d raised or sunken tiles)" % [n, _count_raised()])
	else:
		var tx := st % map.w
		var ty := st / map.w
		var up := Vector2(0, -1) if map.stair[st] == 1 else Vector2(-1, 0)
		# (a flight may be several tiles long: its foot is the first plain tile down it, its head the first up it)
		var foot := Vector2(tx + 0.5, ty + 0.5) - up
		var head := Vector2(tx + 0.5, ty + 0.5) + up
		while map.stair[floori(head.y) * map.w + floori(head.x)] != 0:
			head += up
		h.world = foot
		await _wait(0.4)
		await _snap(tag + "1_at_the_foot.png")
		var l0: float = map.level_at(h.world.x, h.world.y)
		var steps := 0
		var mid := false
		while h.world.distance_to(head) > 0.08 and steps < 400:
			h._slide((head - h.world).normalized() * 4.6 / 60.0)
			h.face = up
			steps += 1
			if not mid and h.world.distance_to(foot) >= foot.distance_to(head) * 0.5:
				mid = true
				await get_tree().process_frame
				await _snap(tag + "2_half_way.png")
		await _wait(0.3)
		await _snap(tag + "3_at_the_head.png")
		print("HEIGHTS floor %d: stairs at (%d, %d) going %s: from level %.2f at the foot to %.2f at the head in %d steps (%.2f from it)" % [n, tx, ty, "up -y" if map.stair[st] == 1 else "up -x", l0, map.level_at(h.world.x, h.world.y), steps, h.world.distance_to(head)])
	# the ledges: every place two plain tiles side by side stand at different heights, walked at from the higher: he is held
	var held := 0
	var tried := 0
	var shown := false
	for ty2 in range(1, map.h - 1):
		for tx2 in range(1, map.w - 1):
			if tried >= 40:
				break
			var i2 := ty2 * map.w + tx2
			if not map.walkable(tx2, ty2) or map.stair[i2] != 0:
				continue
			for q: Vector2i in [Vector2i(1, 0), Vector2i(0, 1)]:
				var j2: int = (ty2 + q.y) * map.w + tx2 + q.x
				if not map.walkable(tx2 + q.x, ty2 + q.y) or map.stair[j2] != 0 or map.height[i2] == map.height[j2]:
					continue
				tried += 1
				var hi := Vector2(tx2 + 0.5, ty2 + 0.5) if map.height[i2] > map.height[j2] else Vector2(tx2 + q.x + 0.5, ty2 + q.y + 0.5)
				var lo := Vector2(tx2 + q.x + 0.5, ty2 + q.y + 0.5) if map.height[i2] > map.height[j2] else Vector2(tx2 + 0.5, ty2 + 0.5)
				h.world = hi
				for k in 60:
					h._slide((lo - hi) * 4.6 / 60.0)
				if floori(h.world.x) == floori(hi.x) and floori(h.world.y) == floori(hi.y):
					held += 1
				if not shown:
					shown = true
					await _wait(0.3)
					await _snap(tag + "5_at_a_ledge.png")
	print("HEIGHTS: %d ledges walked at from the higher side, held at %d" % [tried, held])
	# a slanting wall: walked into, he slides along it
	var c := -1
	for i in map.cut.size():
		if map.cut[i] != 0 and map.tiles[i] == FloorMap.FLOOR:
			c = i
			break
	if c >= 0:
		var cx := c % map.w
		var cy := c / map.w
		var half := FloorMap.cut_half(int(map.cut[c]))
		# (stood on its floor half, walked straight at its wall half)
		var into := Vector2(-1, -1) if half == 1 else Vector2(1, 1) if half == 2 else Vector2(-1, 1) if half == 3 else Vector2(1, -1)
		h.world = Vector2(cx + 0.5, cy + 0.5) - into * 0.28
		var from := h.world
		var ok: bool = map.fits(h.world.x, h.world.y, 0.3)
		for k in 40:
			h._slide(Vector2(into.x, 0.0) * 4.6 / 60.0)
		await _wait(0.3)
		await _snap(tag + "4_slanting_wall.png")
		print("HEIGHTS: a tile cut %d at (%d, %d): he stood on its floor half %s, walked at the wall along x and went from %s to %s (in the wall half: %s)" % [half, cx, cy, ok, from, h.world, map.in_wall(h.world.x, h.world.y)])


func _count_raised() -> int:
	var k := 0
	for v in map.height:
		if v != 0:
			k += 1
	return k


## SHOT MODE, A FLOOR'S TRAPS (--only=traps --floor=N): he is stood on the floor's first spike floor through one beat of it
## (pictured as its holes glint and as the spikes are up; what it took of his life) and on its first dart wall's plate
## (pictured as the darts fly; what they took).
func _trap_shots(h: Hero, dir: String) -> void:
	var n := int(_arg("floor")) if _arg("floor") != "" else 3
	go_to("floor%d" % n, "down" if n > 1 else "start")
	await _wait(1.5)
	var tag := dir + "/t%d_" % n
	if map.hazards.is_empty():
		print("TRAPS: floor %d has none" % n)
		return
	# (nobody else about: what the traps take is theirs alone)
	for m in _monsters.list:
		if is_instance_valid(m):
			m.queue_free()
	_monsters.list.clear()
	await _wait(0.2)
	h.unhurt = false
	var done := {}
	for s in map.hazards:
		var kind: String = s["kind"]
		if done.has(kind):
			continue
		done[kind] = true
		h.life = h.max_life
		var at := Vector2(float(s["x"]) + float(s["w"]) / 2.0, float(s["y"]) + float(s["h"]) / 2.0)
		if kind == "spikes":
			h.world = at
			await _wait(0.2)
			await _snap(tag + "1_spikes_down.png")
			var l0 := h.life
			var t := 0.0
			var shot := false
			while t < 3.2:
				await get_tree().process_frame
				t += get_process_delta_time()
				h.world = at
				if not shot and h.life < l0:
					shot = true
					await _snap(tag + "2_spikes_up.png")
			print("TRAPS floor %d: spikes at %s (%dx%d, phase %.1f): his life %.1f -> %.1f in one beat (a sixth of %.0f is %.1f)" % [n, at, int(s["w"]), int(s["h"]), float(s.get("phase", 0.0)), l0, h.life, h.max_life, h.max_life / 6.0])
		elif s.has("slot"):
			h.world = _free_near(at + Vector2(float(s["slot"]["dx"]), float(s["slot"]["dy"])) * 3.0)
			await _wait(0.5)
			h.world = at
			var l1 := h.life
			await _wait(0.45)
			await _snap(tag + "3_darts.png")
			await _wait(1.2)
			await _snap(tag + "4_darts_after.png")
			print("TRAPS floor %d: darts, plate at %s, slot %s: his life %.1f -> %.1f (12%% of %.0f a dart is %.1f)" % [n, at, s["slot"], l1, h.life, h.max_life, h.max_life * 0.12])
	h.unhurt = true
