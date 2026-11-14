## WORDSMITH IN GODOT, THE FIRST SLICE: floor 1 of the Crypt, laid out by the game's own map-maker and painted in its own
## stone (tools/godot_export.ts), with the Warrior from the released game's baked pictures walking it and swinging, his
## steps and swings and the floor's background sounding from the game's own recordings.
##   Keys: WASD or the arrows to walk; Space or the left button to swing, Shift or the right button for the second swing.
##   A controller: the left stick, and A / B.
## Shot mode, for checking it without anyone at the keys:  godot --path godot -- --shots=<folder>
extends Node2D

const FloorMap := preload("res://scripts/floor_map.gd")
const GroundArt := preload("res://scripts/ground_art.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")
const Sfx := preload("res://scripts/sfx.gd")
const FloorLayer := preload("res://scripts/floor_layer.gd")
const Stands := preload("res://scripts/stands.gd")
const Hero := preload("res://scripts/hero.gd")

const Monsters := preload("res://scripts/monsters.gd")
const Monster := preload("res://scripts/monster.gd")
const Perils := preload("res://scripts/perils.gd")

const FLOOR_DIR := "res://assets/floor1"
const HERO_DIR := "res://assets/heroes"
const MONSTER_DIR := "res://assets/monsters"

var _monsters: Monsters

## The dark of the dungeon deeper with distance from the middle of the screen (an approximation of render.ts's dark and
## vignette, to be replaced by the game's own).
const DARK := """
shader_type canvas_item;
uniform vec4 dark : source_color = vec4(0.02, 0.025, 0.09, 1.0);
void fragment() {
	vec2 p = (UV - vec2(0.5, 0.53)) * vec2(1.7778, 1.0);
	float a = smoothstep(0.32, 0.98, length(p)) * 0.82;
	COLOR = vec4(dark.rgb, a);
}
"""


func _ready() -> void:
	_inputs()
	var map := FloorMap.new(FLOOR_DIR + "/layout.json")
	var ground := GroundArt.new(FLOOR_DIR)

	var floor_layer := FloorLayer.new()
	floor_layer.map = map
	floor_layer.art = ground
	add_child(floor_layer)

	# (what the monsters' moves mark on the floor: over the floor, under everyone)
	var perils := Perils.new()
	perils.map = map
	add_child(perils)

	var stands := Stands.new()
	stands.map = map
	stands.art = ground
	add_child(stands)

	var sfx := Sfx.new()
	add_child(sfx)
	sfx.background("bed_f1_loop.wav", "amb_f1")

	var hero := Hero.new()
	hero.map = map
	hero.art = BakedHero.new(HERO_DIR, "warrior")
	hero.sfx = sfx
	hero.world = map.start
	stands.add_child(hero)
	stands.hero = hero

	var monsters := Monsters.new()
	monsters.map = map
	monsters.sfx = sfx
	monsters.hero = hero
	monsters.stands = stands
	monsters.perils = perils
	perils.hero = hero
	perils.sfx = sfx
	add_child(monsters)
	monsters.load_floor(FLOOR_DIR + "/monsters.json", MONSTER_DIR)
	hero.monsters = monsters
	_monsters = monsters

	var layer := CanvasLayer.new()
	var veil := ColorRect.new()
	veil.set_anchors_preset(Control.PRESET_FULL_RECT)
	veil.mouse_filter = Control.MOUSE_FILTER_IGNORE
	var mat := ShaderMaterial.new()
	mat.shader = Shader.new()
	mat.shader.code = DARK
	veil.material = mat
	layer.add_child(veil)
	add_child(layer)

	var shots := _arg("shots")
	if shots != "":
		_shoot(hero, shots)


func _inputs() -> void:
	var keys := {
		"move_up": [KEY_W, KEY_UP], "move_down": [KEY_S, KEY_DOWN],
		"move_left": [KEY_A, KEY_LEFT], "move_right": [KEY_D, KEY_RIGHT],
		"attack": [KEY_SPACE], "attack2": [KEY_SHIFT],
	}
	var sticks := {
		"move_up": [JOY_AXIS_LEFT_Y, -1.0], "move_down": [JOY_AXIS_LEFT_Y, 1.0],
		"move_left": [JOY_AXIS_LEFT_X, -1.0], "move_right": [JOY_AXIS_LEFT_X, 1.0],
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
	for pair in [["attack", MOUSE_BUTTON_LEFT, JOY_BUTTON_A], ["attack2", MOUSE_BUTTON_RIGHT, JOY_BUTTON_B]]:
		var m := InputEventMouseButton.new()
		m.button_index = pair[1]
		InputMap.action_add_event(pair[0], m)
		var b := InputEventJoypadButton.new()
		b.button_index = pair[2]
		InputMap.action_add_event(pair[0], b)


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
	await _wait(1.0)
	await _snap(dir + "/01_start.png")
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
