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


## SHOT MODE: the monsters' moves, each pictured the moment it shows. The hero is set down in sight of each monster that has
## moves and stands there, unharmed (its blows flash him but take nothing, so that each move is seen to its end): the red
## troll (his charge's line, his run, his slam's circle), the archers (the rain's ring, the arrows come down), the
## marksman (his line of aim, his great arrow), the Warden (his bolts, the Lockdown's shadows and its bars, the dead he
## calls). Each picture at twice the size; then the game quits, saying which moves were made.
func _shoot(hero: Hero, dir: String) -> void:
	DirAccess.make_dir_recursive_absolute(dir)
	hero.unhurt = true
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
	h.strike_words["front"] = "power"
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
	boss.hurt(1e9)
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
