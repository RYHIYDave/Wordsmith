## The hero on the floor, as the game moves him (game/game.ts): 4.6 tiles a second (defs.ts TUNE.heroSpeed), a body 0.3
## of a tile round (TUNE.heroRadius) that slides along walls (game.ts slide: the step along x kept if the body is clear
## there, then the step along y), on the walk grid. The keys or stick give a way on the SCREEN, turned to the floor
## (iso.ts screenDirToWorld), always at full speed.
## He faces one of his eight painted sides (art/warrior_up_art.ts wuFacing) and plays his baked lists: his stand at
## 10 frames a second, his run and his swings at 30 (art/heroes3.ts IDLE_FPS3, RUN_FPS3, CLIP_FPS3).
##
## THE WARRIOR AS HE STARTS (the greatsword, his Strike: defs.ts SKILLS.strike, game.ts strike): a blow lands a third of
## a second after it is begun, on the one monster in front of him within 1.7 tiles that is nearest and most in front;
## 7 to 11 (the greatsword at item level 1) times 1.14 (his strength). He swings again 0.92 s after (1 / his attack
## rate); pressed again within that and half a second more, the second swing of the combo. Each swing steps him 0.33
## tiles forward. His life: 102 at level 1 (60 + 3 a point of his 14 strength), 0.6 back a second.
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
const STEP_EVERY := 0.25

const REACH := 1.7
const WINDUP := 0.333
const FOLLOW := 0.3
const INTERVAL := 0.92
const COMBO := 0.5
const LUNGE := 0.33
const DMG_MIN := 7.0 * 1.14
const DMG_MAX := 11.0 * 1.14
const MAX_LIFE := 102.0
const REGEN := 0.6
const AIM_REACH := 2.4
const BACK_AFTER := 2.5

var map: FloorMap
var art: BakedHero
var sfx: Sfx
var monsters  # monsters.gd
var world := Vector2.ZERO
var home := Vector2.ZERO
var face := Vector2(1, 0)
var life := MAX_LIFE
var alive := true
## Shot mode (main.gd): a screen direction held as if pressed, and a swing asked for.
var auto_dir := Vector2.ZERO
var auto_attack := false

var _sprite: Sprite2D
var _cam: Camera2D
var _side := 0
var _list := BakedHero.IDLE
var _t := 0.0
var _swinging := false
var _swing_t := 0.0
var _landed := false
var _last_swing := -10.0
var _combo_next := false
var _clock := 0.0
var _step_in := 0.0
var _flash := 0.0
var _shake := 0.0
var _down_for := 0.0


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.centered = false
	add_child(_sprite)
	_cam = Camera2D.new()
	# (render.ts: the hero stands 12 game pixels below the middle of the screen)
	_cam.offset = Vector2(0, -24)
	add_child(_cam)
	_cam.make_current()
	home = world
	_turn(face)
	_place()
	_show()


func _process(dt: float) -> void:
	_clock += dt
	_flash = maxf(0.0, _flash - dt)
	_shake = maxf(0.0, _shake - dt)
	_cam.offset = Vector2(0, -24) + (Vector2(randf_range(-3, 3), randf_range(-3, 3)) if _shake > 0.0 else Vector2.ZERO)
	if not alive:
		_down_for += dt
		_sprite.modulate.a = clampf(1.0 - _down_for, 0.0, 1.0)
		if _down_for >= BACK_AFTER:
			_back()
		return
	life = minf(MAX_LIFE, life + REGEN * dt)
	var d := Input.get_vector("move_left", "move_right", "move_up", "move_down") + auto_dir
	var way := Iso.screen_dir_to_world(d)
	var asked := Input.is_action_just_pressed("attack") or Input.is_action_just_pressed("attack2") or auto_attack
	auto_attack = false
	if asked and (not _swinging or _swing_t >= INTERVAL):
		_swing()
	_t += dt
	if _swinging:
		_swing_t += dt
		if not _landed and _swing_t >= WINDUP:
			_land()
		var n := art.count(_side, _list)
		var done := int(_t * CLIP_FPS) >= n
		if done or (_landed and _swing_t >= WINDUP + FOLLOW and way != Vector2.ZERO):
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
	queue_redraw()


func _swing() -> void:
	# (with the mouse, the way it points; from the keys or a stick, at the nearest monster awake close by, else ahead)
	var mouse := Input.is_mouse_button_pressed(MOUSE_BUTTON_LEFT) or Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT)
	if mouse:
		var to := Iso.to_world(get_global_mouse_position()) - world
		if to.length() > 0.01:
			_turn(to.normalized())
	elif monsters != null:
		var m = monsters.nearest(world, AIM_REACH)
		if m != null:
			_turn((m.world - world).normalized())
	var combo := _clock - _last_swing <= INTERVAL + COMBO and not _combo_next
	_combo_next = combo
	_last_swing = _clock
	_swinging = true
	_swing_t = 0.0
	_landed = false
	_list = BakedHero.ATTACK2 if combo and art.count(_side, BakedHero.ATTACK2) > 0 else BakedHero.ATTACK
	_t = 0.0
	_slide(face * LUNGE)


func _land() -> void:
	_landed = true
	sfx.play("swing", -6.0)
	if monsters == null:
		return
	var m = monsters.strike_target(world, face, REACH)
	if m != null:
		m.hurt(randf_range(DMG_MIN, DMG_MAX))
		sfx.play("hit", -4.0)


func hurt(dmg: float) -> void:
	if not alive:
		return
	life -= dmg
	_flash = 0.15
	_shake = 0.15
	sfx.play("hurt", -6.0)
	if life <= 0.0:
		life = 0.0
		alive = false
		_down_for = 0.0
		_swinging = false


## Fallen: back where he came in, whole again, and the monsters that were after him gone back to sleep.
func _back() -> void:
	world = home
	life = MAX_LIFE
	alive = true
	_sprite.modulate.a = 1.0
	_set_list(BakedHero.IDLE)
	if monsters != null:
		for m in monsters.list:
			if is_instance_valid(m) and not m.dead and m.state != "sleep":
				m.state = "sleep"
	_place()
	_show()


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
	_sprite.self_modulate = Color(2.0, 0.7, 0.7) if _flash > 0.0 else Color.WHITE


## His life over his head in a fight or when he is hurt (Version 11.2).
func _draw() -> void:
	if not alive:
		return
	var fighting: bool = monsters != null and monsters.nearest(world, 9.0) != null
	if not fighting and life >= MAX_LIFE - 0.01:
		return
	var w := 44.0
	var top := -104.0
	draw_rect(Rect2(-w / 2 - 1, top - 1, w + 2, 7), Color(0.04, 0.04, 0.1, 0.85))
	draw_rect(Rect2(-w / 2, top, w * clampf(life / MAX_LIFE, 0.0, 1.0), 5), Color(0.86, 0.16, 0.24))
