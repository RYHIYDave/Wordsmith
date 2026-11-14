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

const FLOOR_DIR := "res://assets/floor1"
const HERO_DIR := "res://assets/heroes"

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


## SHOT MODE: the hero stands, walks each of four ways, swings; a picture of each, at twice the size, then the game quits.
func _shoot(hero: Hero, dir: String) -> void:
	DirAccess.make_dir_recursive_absolute(dir)
	await _wait(1.2)
	await _snap(dir + "/1_standing.png")
	var ways := [["2_walk_right", Vector2(1, 0)], ["3_walk_down", Vector2(0, 1)], ["4_walk_left", Vector2(-1, 0)], ["5_walk_up", Vector2(0, -1)]]
	for w in ways:
		hero.auto_dir = w[1]
		await _wait(0.8)
		await _snap("%s/%s.png" % [dir, w[0]])
	hero.auto_dir = Vector2.ZERO
	await _wait(0.4)
	hero.auto_attack = true
	await _wait(0.4)
	await _snap(dir + "/6_swing.png")
	print("SHOTS DONE ", dir, " hero at ", hero.world)
	get_tree().quit()


func _wait(s: float) -> void:
	await get_tree().create_timer(s).timeout


func _snap(path: String) -> void:
	await RenderingServer.frame_post_draw
	var img := get_viewport().get_texture().get_image()
	img.resize(img.get_width() * 2, img.get_height() * 2, Image.INTERPOLATE_NEAREST)
	img.save_png(path)
