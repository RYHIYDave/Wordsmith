## A monster on the floor, as game.ts updateMonsters runs one (the melee and the plain shot; the moves of the guardian,
## the champion, the marksman's pierce, the archer's rain and the Warden's summons come later):
##   SLEEP until it sees the hero within 9 tiles (TUNE.aggroRadius), and then its pack wakes with it (wakeUp: within 14).
##   CHASE: straight at him when it sees him and he is within 2.5 tiles, else down the flow field (nav.ts flowField). A
##     melee monster stops at reach * 0.8 + his radius; one that shoots stands once it sees him within keepMax.
##   WINDUP when he is within reach (and it can see him) and its cooldown is out: the blow lands when the wind-up is
##     over, if he is still within range + (r - 0.32) + 0.45 + his radius; an arrow is loosed (range + 3, speed projSpeed).
##   RECOVER 0.3 s (TUNE.monsterRecover), its cooldown set to cooldown * 0.9 to 1.2.
##   Struck: it flashes (0.12 s), shows its life for 4 s, wakes. Killed: it falls (its die list) and lies 30 s, fading
##   over the last 1.5 (BODIES).
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")

const AGGRO := 9.0
const WAKE_PACK := 14.0
const HERO_R := 0.3
const RECOVER := 0.3
const BODY_LIES := 30.0
const BODY_FADES := 1.5
const BAR_FOR := 4.0
## (game.ts: the voice of each kind, sound_families.ts VOICE, and its blow's sound, ATK; each name has two takes)
const VOICE := {"skeleton": "bones", "archer": "bones", "champion": "bones", "marksman": "bones", "brute": "troll", "bat": "bat"}
const ATK := {"skeleton": "atkBones", "champion": "atkBones", "brute": "atkTroll", "bat": "atkBat"}

var mgr  # monsters.gd
var art: BakedFigure
var def: Dictionary
var kind := ""
var world := Vector2.ZERO
var face := Vector2(0.7071, 0.7071)
var r := 0.32
var life := 1.0
var max_life := 1.0
var dmg_min := 1.0
var dmg_max := 1.0
var speed := 1.0
var pack_id := -1
var boss := false
var state := "sleep"
var dead := false

var _t := 0.0
var _cd := 0.0
var _list := "idle"
var _anim_t := 0.0
var _flash := 0.0
var _bar := 0.0
var _dead_for := 0.0
var _weave := randf() * TAU
var _sprite: Sprite2D


func setup(m: Dictionary, kind_def: Dictionary, figure: BakedFigure) -> void:
	kind = m["kind"]
	def = kind_def
	art = figure
	world = Vector2(m["x"], m["y"])
	face = Vector2(m["fx"], m["fy"])
	r = m["r"]
	life = m["life"]
	max_life = m["maxLife"]
	dmg_min = m["dmgMin"]
	dmg_max = m["dmgMax"]
	speed = m["speed"]
	pack_id = int(m["packId"])
	boss = m["boss"]
	_anim_t = m.get("animT", 0.0)


func _ready() -> void:
	_sprite = Sprite2D.new()
	_sprite.centered = false
	add_child(_sprite)
	_place()
	_show()


func step(dt: float, hero) -> void:
	if dead:
		_dead_for += dt
		_anim_t += dt
		if _dead_for > BODY_LIES - BODY_FADES:
			modulate.a = clampf((BODY_LIES - _dead_for) / BODY_FADES, 0.0, 1.0)
		if _dead_for >= BODY_LIES:
			queue_free()
		_show()
		return
	_anim_t += dt
	_flash = maxf(0.0, _flash - dt)
	_bar = maxf(0.0, _bar - dt)
	_cd -= dt
	var to: Vector2 = hero.world - world
	var dist := to.length()
	var sees: bool = hero.alive and dist <= 11.0 and mgr.sees(world, hero.world)
	var reach := float(def["range"]) + (r - 0.32)
	var moved := false
	match state:
		"sleep":
			if sees and dist <= AGGRO:
				mgr.wake(self)
		"chase":
			if not hero.alive:
				pass
			elif def["ranged"]:
				if sees and dist > 0.01:
					face = to / dist
				if sees and dist <= float(def["range"]) and _cd <= 0.0:
					_begin_windup()
				elif not (sees and dist <= float(def["keepMax"])):
					moved = _go(dt, to, dist, sees)
			else:
				if sees and dist <= reach + HERO_R and _cd <= 0.0:
					if dist > 0.01:
						face = to / dist
					_begin_windup()
				elif dist > reach * 0.8 + HERO_R:
					moved = _go(dt, to, dist, sees)
				elif dist > 0.01:
					face = to / dist
		"windup":
			if dist > 0.01:
				face = to / dist
			_t -= dt
			if _t <= 0.0:
				_land(hero, dist, reach)
				state = "recover"
				_t = RECOVER
				_cd = float(def["cooldown"]) * randf_range(0.9, 1.2)
		"recover":
			_t -= dt
			if _t <= 0.0:
				state = "chase"
	if state == "sleep" or state == "chase":
		_set_list("walk" if moved else "idle")
	_place()
	_show()
	queue_redraw()


func _begin_windup() -> void:
	state = "windup"
	_t = float(def["windup"])
	_set_list("attack")


func _land(hero, dist: float, reach: float) -> void:
	if def["ranged"]:
		mgr.shoot(self, hero.world, float(def["projSpeed"]), float(def["range"]) + 3.0, randf_range(dmg_min, dmg_max))
		mgr.sfx.play("shot", -6.0)
		return
	mgr.sfx.play(ATK.get(kind, "atkBones"), -4.0)
	mgr.sfx.play("swing", -10.0)
	if hero.alive and dist <= reach + 0.45 + HERO_R:
		hero.hurt(randf_range(dmg_min, dmg_max))


## A step toward him: straight when it sees him close, else down the flow field; a bat weaves as it flies.
func _go(dt: float, to: Vector2, dist: float, sees: bool) -> bool:
	var way: Vector2 = to / dist if sees and dist < 2.5 else mgr.flow_dir(world)
	if way == Vector2.ZERO:
		return false
	if kind == "bat":
		_weave += dt * 7.0
		way = (way + Vector2(-way.y, way.x) * sin(_weave) * 0.6).normalized()
	face = way
	var step := way * speed * dt
	if mgr.clear(world.x + step.x, world.y, r):
		world.x += step.x
	if mgr.clear(world.x, world.y + step.y, r):
		world.y += step.y
	return true


func wake_up() -> void:
	if state == "sleep":
		state = "chase"
		_cd = randf_range(0.2, 0.9)


func hurt(dmg: float) -> void:
	if dead:
		return
	life -= dmg
	_flash = 0.12
	_bar = BAR_FOR
	if state == "sleep":
		mgr.wake(self)
	if life <= 0.0:
		_die()


func _die() -> void:
	dead = true
	state = "dead"
	_bar = 0.0
	_set_list("die")
	if VOICE.has(kind):
		mgr.sfx.play(VOICE[kind] + "_death", -4.0)
	elif boss:
		mgr.sfx.play("boss_roar")
	queue_redraw()


func _set_list(list: String) -> void:
	if _list != list and art.has(list):
		_list = list
		_anim_t = 0.0


func _place() -> void:
	position = Iso.to_screen(world.x, world.y)


func _show() -> void:
	var n := art.count(0, _list)
	if n == 0:
		return
	var i := int(_anim_t * art.fps(_list))
	# (a blow and a fall play once and hold their last frame; standing and walking go round)
	i = mini(i, n - 1) if _list != "idle" and _list != "walk" else i % n
	var f := art.frame(face.x, face.y, _list, i)
	_sprite.texture = f["tex"]
	_sprite.offset = f["offset"]
	_sprite.flip_h = f["flip"]
	_sprite.scale = Vector2.ONE * float(f["scale"])
	_sprite.self_modulate = Color(2.4, 2.4, 2.4) if _flash > 0.0 else Color.WHITE


## Its life over its head for a while after it is struck (game.ts barT).
func _draw() -> void:
	if _bar <= 0.0 or dead:
		return
	var w := 36.0 if not boss else 80.0
	var top := _sprite.offset.y * _sprite.scale.y - 10.0
	draw_rect(Rect2(-w / 2 - 1, top - 1, w + 2, 6), Color(0.04, 0.04, 0.1, 0.85))
	draw_rect(Rect2(-w / 2, top, w * clampf(life / max_life, 0.0, 1.0), 4), Color(0.86, 0.18, 0.28))
