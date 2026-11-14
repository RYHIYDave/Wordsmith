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


## SHOT MODE: the hero where he comes in; then set down near the nearest pack of skeletons, swinging at whatever comes,
## pictures as they wake, close in and fall; then near an archer pack, and in sight of the Warden. Each picture at twice
## the size; then the game quits, saying how the fight went.
func _shoot(hero: Hero, dir: String) -> void:
	DirAccess.make_dir_recursive_absolute(dir)
	await _wait(1.2)
	await _snap(dir + "/1_start.png")
	var n0 := _alive()
	var skel := _nearest_kind(hero.world, "skeleton", 12.0)
	if skel != null:
		hero.world = _spot_near(skel.world, 5.0, hero.world)
		await _wait(0.6)
		await _snap(dir + "/2_pack_wakes.png")
		for i in 16:
			hero.auto_attack = true
			await _wait(0.5)
			if i == 3:
				await _snap(dir + "/3_fight.png")
			if i == 8:
				await _snap(dir + "/4_fight_on.png")
		await _snap(dir + "/5_after.png")
	print("FIGHT: ", n0 - _alive(), " monsters down; hero life ", int(hero.life), " alive ", hero.alive)
	var arch := _nearest_kind(hero.world, "archer", 0.0)
	if arch != null:
		hero.world = _spot_near(arch.world, 6.0, hero.world)
		await _wait(1.6)
		await _snap(dir + "/6_archers.png")
	var boss := _nearest_kind(hero.world, "warden", 0.0)
	if boss != null:
		hero.world = _spot_near(boss.world, 7.0, hero.world)
		await _wait(0.9)
		await _snap(dir + "/7_warden.png")
	print("SHOTS DONE ", dir, " monsters standing ", _alive(), " of ", n0)
	get_tree().quit()


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
