## The hero on the floor, as the game moves him (game/game.ts): 4.6 tiles a second (defs.ts TUNE.heroSpeed), a body 0.3
## of a tile round (TUNE.heroRadius) that slides along walls (game.ts slide: the step along x kept if the body is clear
## there, then the step along y), on the walk grid. The keys or stick give a way on the SCREEN, turned to the floor
## (iso.ts screenDirToWorld), always at full speed.
## He faces one of his eight painted sides (art/warrior_up_art.ts wuFacing) and plays his baked lists: his stand at
## 10 frames a second, his run and his swings at 30 (art/heroes3.ts IDLE_FPS3, RUN_FPS3, CLIP_FPS3).
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const BakedHero := preload("res://scripts/baked_hero.gd")
const Sfx := preload("res://scripts/sfx.gd")

const SPEED := 4.6
const RADIUS := 0.3
const IDLE_FPS := 10.0
const RUN_FPS := 30.0
const CLIP_FPS := 30.0
## (wuFacing: k = round(angle / 45 degrees), 0 down and to the right on the screen, then round)
const FACING := ["front", "toward", "frontL", "sideL", "backL", "away", "back", "side"]
## How far into a swing he may be turned off it by walking (here; the game's wind-up and recovery rules come later).
const SWING_FREE := 0.6
## (a step's sound every half turn of his run: 15 frames at 30 a second)
const STEP_EVERY := 0.25

var map: FloorMap
var art: BakedHero
var sfx: Sfx
var world := Vector2.ZERO
var face := Vector2(1, 0)
## Shot mode (main.gd): a screen direction held as if pressed, and a swing asked for.
var auto_dir := Vector2.ZERO
var auto_attack := false

var _sprite: Sprite2D
var _side := 0
var _list := BakedHero.IDLE
var _t := 0.0
var _swinging := false
var _swung := false
var _step_in := 0.0


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.centered = false
	add_child(_sprite)
	var cam := Camera2D.new()
	# (render.ts: the hero stands 12 game pixels below the middle of the screen)
	cam.offset = Vector2(0, -24)
	add_child(cam)
	cam.make_current()
	_turn(face)
	_place()
	_show()


func _process(dt: float) -> void:
	var d := Input.get_vector("move_left", "move_right", "move_up", "move_down") + auto_dir
	var way := Iso.screen_dir_to_world(d)
	if (Input.is_action_just_pressed("attack") or auto_attack) and not _swinging:
		auto_attack = false
		_swing(BakedHero.ATTACK)
	elif Input.is_action_just_pressed("attack2") and not _swinging:
		_swing(BakedHero.ATTACK2)
	_t += dt
	if _swinging:
		var n := art.count(_side, _list)
		var i := int(_t * CLIP_FPS)
		if not _swung and i >= n / 4:
			_swung = true
			sfx.play("swing")
		var free := float(i) / n >= SWING_FREE
		if i >= n or (free and way != Vector2.ZERO):
			_swinging = false
			_set_list(BakedHero.IDLE)
	if not _swinging:
		if way != Vector2.ZERO:
			_turn(way)
			_slide(way * SPEED * dt)
			_set_list(BakedHero.WALK)
			_step_in -= dt
			if _step_in <= 0.0:
				_step_in = STEP_EVERY
				sfx.play("step_stone", -8.0)
		else:
			_set_list(BakedHero.IDLE)
			_step_in = 0.0
	_place()
	_show()


func _swing(list: int) -> void:
	# (a swing with the mouse goes where it points; with keys or a stick, the way he faces)
	if Input.is_action_just_pressed("attack") or Input.is_action_just_pressed("attack2"):
		if Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
			var to := Iso.to_world(get_global_mouse_position()) - world
			if to.length() > 0.01:
				_turn(to.normalized())
	_swinging = true
	_swung = false
	_list = list
	_t = 0.0


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
	if _clear(world.x + step.x, world.y):
		world.x += step.x
	if _clear(world.x, world.y + step.y):
		world.y += step.y


## Every tile the body's box overlaps is one a body may stand on (game.ts free).
func _clear(x: float, y: float) -> bool:
	for ty in range(floori(y - RADIUS), floori(y + RADIUS) + 1):
		for tx in range(floori(x - RADIUS), floori(x + RADIUS) + 1):
			if not map.walkable(tx, ty):
				return false
	return true


func _place() -> void:
	position = Iso.to_screen(world.x, world.y)


func _show() -> void:
	var n := art.count(_side, _list)
	if n == 0:
		return
	var fps := IDLE_FPS if _list == BakedHero.IDLE else (RUN_FPS if _list == BakedHero.WALK else CLIP_FPS)
	var i := int(_t * fps)
	i = mini(i, n - 1) if _swinging else i % n
	var f := art.frame(_side, _list, i)
	_sprite.texture = f["tex"]
	_sprite.offset = f["offset"]
	_sprite.scale = Vector2.ONE * float(f["scale"])
