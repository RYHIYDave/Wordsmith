## WORDSMITH IN GODOT: a new Warrior's game, as the TypeScript game has it. He begins in the TOWN (town.gd), its wordsmith
## asking for the Master Rune-stone; the stairs take him down to FLOOR 1 of the Crypt (its layout, its stone and its
## monsters the game's own: tools/godot_export.ts), where the fallen wordsmith lies with the stone; floor 1's gate takes
## him back up. What he carries, wears and knows goes with him (loot.gd); a floor is laid again, its monsters fresh, each
## time it is come into (game.ts enterDungeon).
##   Keys: WASD or the arrows to walk; the left button to strike, the right to whirl, Space to lunge; E to use; Q a flask;
##   I or Tab the gear screen (main.gd _inputs). A controller: the left stick; RT, LT, A; B to use; X a flask.
## Shot mode, for checking it without anyone at the keys:  godot --path godot -- --shots=<folder> [--only=loot|town]
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
const Town := preload("res://scripts/town.gd")
const Guide := preload("res://scripts/guide.gd")
const Look := preload("res://scripts/look.gd")

const FLOOR_DIR := "res://assets/floor1"
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
var _hud
var _loot: Loot
var _inv
var _veil: ColorRect
var _curtain: ColorRect
var _going := false
var _gate := {}
## (the place's recorded look, where it has one, and the hero's own pool of light it gave him)
var look: Look
var _hero_light: Node


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
	var inv := Inventory.new()
	inv.loot = loot
	inv.hero = hero
	inv.main = self
	layer.add_child(inv)
	_inv = inv
	_curtain = ColorRect.new()
	_curtain.set_anchors_preset(Control.PRESET_FULL_RECT)
	_curtain.mouse_filter = Control.MOUSE_FILTER_IGNORE
	_curtain.color = Color(0, 0, 0, 0)
	layer.add_child(_curtain)
	add_child(layer)

	var shots := _arg("shots")
	# (a new game begins in town: game.ts constructor, enterTown; shot mode's fights begin on floor 1)
	_build("floor1" if shots != "" and not _arg("only") in ["town", "music"] else "town", "start")
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
	var dir := TOWN_DIR if where == "town" else FLOOR_DIR
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
		"gate":
			# (game.ts enterTown('stairs'): by the top step of the town's stairs, facing away from them)
			var st: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(TOWN_DIR + "/layout.json"))["stair"]
			at = Vector2(st["x"] - 1.1, st["y"] + 1.0)
			face = Vector2(-1, 0)
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
	if where == "floor1":
		monsters.load_floor(FLOOR_DIR + "/monsters.json", MONSTER_DIR)
	hero.monsters = monsters
	_monsters = monsters
	loot.enter_place(map, stands, monsters, where == "floor1")

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
		if not looked:
			_floor_gate(flats)
		sfx.background("bed_f1_loop.wav", "amb_f1")
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
	music.level_music(_music_place(), _in_fight(), dt)


## Which place's music (game/level_music.ts musicPlace): the town's, or floor 1's.
func _music_place() -> String:
	return "town" if place == "town" else ("f1" if place == "floor1" else "")


## Is there a fight on: something awake within reach of him (game.ts inFight; no doors here yet to shut one in)?
func _in_fight() -> bool:
	if _monsters == null:
		return false
	for m in _monsters.list:
		if not m.dead and m.state != "sleep" and m.world.distance_to(hero.world) < Music.NEAR:
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


## What E would do where he stands: [what is shown, what it does] (town.gd).
func prompt() -> Array:
	return town.prompt if town != null else ["", ""]


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


## (A TEST: a real right-button press sent through Godot's input, as a mouse would send it, and what he does with it.)
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
