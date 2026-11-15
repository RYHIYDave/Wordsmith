## THE STAIRWELL DOWN (game/ways.ts stairSpots, stairFor, stairTiles, onTopStep; game.ts openStair and updateWays; render/dress.ts
## standing; render.ts flatWays): shut in the floor of the boss's hall while he lives. As he falls it breaks open, the art chat's
## film of it (3.2 s: its flagstones dropping into the dark one after another, the dust bursting up, the screen kicked at each
## jolt and the blow heard), in the first of its places in his hall clear of where he fell and of the hero; whoever stands on its
## opening is put aside to the nearer of its long sides, and what lay there is gone down it. Once it has broken open (3.5 s),
## stepping onto its top step takes him down to the next floor. There is no way back up it.
## Its pictures are the look's (tools/godot_looks.ts, looks/<place>.json `stairs`; the film's frames in <place>_stair.png).
extends Node2D

const Iso := preload("res://scripts/iso.gd")

## The opening, in tiles: along its way down, and across (game/ways.ts STAIR_LONG, STAIR_WIDE).
const STAIR_LONG := 2.4
const STAIR_WIDE := 1.25
## How far the boss's body must lie from an opening for it to open there (STAIR_CLEAR).
const STAIR_CLEAR := 2.0
## How long it takes to break open: until then its top step takes nobody down (STAIR_OPENING).
const STAIR_OPENING := 3.5
const HH := 16.0
const DIR := "res://assets/looks/"

var main
var map
var look  # look.gd: the stairwell's pictures
var hero
var monsters
var loot
var sfx

## Which of the map's places it opened in (-1: shut), and how long since.
var opened := -1
var t := 0.0

var _film: Dictionary = {}
var _film_pics := {}
var _film_sheet: Texture2D
var _film_node: Sprite2D
var _f := -1
var _still: Sprite2D
var _down := false


func _process(dt: float) -> void:
	if opened < 0:
		var boss = _boss()
		if boss != null and boss.dead:
			_open(boss)
		return
	if t < STAIR_OPENING:
		t += dt
	_play()
	if not _down and t >= STAIR_OPENING and hero.alive and on_top_step(map.stairs[opened], hero.world):
		_down = true
		main.go_down()


## game/ways.ts stairFor: the first place clear of the boss's body by STAIR_CLEAR and of the hero by half a tile; else the first
## clear of the body; else the first.
static func stair_for(spots: Array, b: Vector2, h: Vector2) -> int:
	for k in spots.size():
		if not near_stair(spots[k], b, STAIR_CLEAR) and not near_stair(spots[k], h, 0.5):
			return k
	for k in spots.size():
		if not near_stair(spots[k], b, STAIR_CLEAR):
			return k
	return 0 if not spots.is_empty() else -1


static func _along(s: Dictionary, at: Vector2) -> float:
	return at.x - float(s["x"]) if s["way"] == "x" else at.y - float(s["y"])


static func _across(s: Dictionary, at: Vector2) -> float:
	return at.y - float(s["y"]) if s["way"] == "x" else at.x - float(s["x"])


## Is `at` on the opening, or within `by` tiles of it (nearStair)?
static func near_stair(s: Dictionary, at: Vector2, by: float) -> bool:
	var a := _along(s, at)
	var c := _across(s, at)
	return a > -by and a < STAIR_LONG + by and c > -by and c < STAIR_WIDE + by


## Is `at` on its top step, where the opening meets the floor (onTopStep)?
static func on_top_step(s: Dictionary, at: Vector2) -> bool:
	var a := _along(s, at)
	var c := _across(s, at)
	return a >= -0.1 and a < 0.95 and c >= 0.05 and c < STAIR_WIDE - 0.05


## The two tiles past its top step, that nobody walks on (stairTiles).
func _tiles(s: Dictionary) -> Array:
	var out := []
	for k in range(1, 3):
		if s["way"] == "x":
			out.append(int(s["y"]) * map.w + int(s["x"]) + k)
		else:
			out.append((int(s["y"]) + k) * map.w + int(s["x"]))
	return out


## game.ts openStair: the boss is dead, and the stairwell opens in the floor of his hall.
func _open(boss) -> void:
	opened = stair_for(map.stairs, boss.world, hero.world)
	if opened < 0:
		return
	t = 0.0
	var st: Dictionary = map.stairs[opened]
	for i in _tiles(st):
		map.walk[i] = 0
	# (whoever is on its opening, its top step with it, put aside to the nearer of its long sides; the drops too)
	hero.world = _aside(st, hero.world)
	if loot != null:
		for d in loot._drops:
			var was: Vector2 = d["at"]
			d["at"] = _aside(st, was)
			if d["at"] != was and is_instance_valid(d["node"]):
				d["node"].position = Iso.to_screen(d["at"].x, d["at"].y)
	for m in monsters.list:
		if is_instance_valid(m) and not m.dead:
			m.world = _aside(st, m.world)
	if look != null:
		look.stair_opened(opened)
		_film = {}
		var all: Array = look.data.get("stairs", [])
		if opened < all.size():
			_film = all[opened]
	_make_pictures()
	loot.say("A stairwell opens in the floor. The way down.", Color("#8af078"))


func _aside(st: Dictionary, p: Vector2) -> Vector2:
	var a := _along(st, p)
	var c := _across(st, p)
	if not (a > -0.35 and a < STAIR_LONG + 0.1 and c > -0.3 and c < STAIR_WIDE + 0.3):
		return p
	var aa := clampf(a, -0.4, STAIR_LONG + 0.4)
	var cc := -0.5 if c < STAIR_WIDE / 2.0 else STAIR_WIDE + 0.5
	if st["way"] == "x":
		return Vector2(float(st["x"]) + aa, float(st["y"]) + cc)
	return Vector2(float(st["x"]) + cc, float(st["y"]) + aa)


func _make_pictures() -> void:
	if _film.is_empty():
		return
	# (the stairwell lying open, flat on the floor: shown once the film is over)
	var still: Array = _film["still"]
	_still = Sprite2D.new()
	_still.texture = look._sheet
	_still.region_enabled = true
	_still.centered = false
	look._pic_on(_still, still[0])
	_still.position = Vector2(float(still[1]), float(still[2])) * 2.0
	_still.visible = false
	look.flat_layer.add_child(_still)
	var film = _film.get("film")
	if film == null:
		_still.visible = true
		return
	if _film_sheet == null:
		_film_sheet = load(DIR + look.place + "_stair.png")
		var pics: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + look.place + "_stair_pics.json"))
		for k in pics:
			var p: Array = pics[k]
			_film_pics[k] = {"rect": Rect2(p[0], p[1], p[2], p[3]), "anchor": Vector2(p[4], p[5])}
	_film_node = Sprite2D.new()
	_film_node.texture = _film_sheet
	_film_node.region_enabled = true
	_film_node.centered = false
	look.stands.add_child(_film_node)
	_f = -1


## The film, frame by frame at its fps (drawn in depth at the opening's middle); each jolt kicks the screen and is heard.
func _play() -> void:
	if _film_node == null:
		return
	var film: Dictionary = _film["film"]
	var frames: Array = film["frames"]
	var k := int(floor(t * float(film["fps"])))
	if k >= frames.size():
		_film_node.queue_free()
		_film_node = null
		_still.visible = true
		return
	var jolts: Array = film["jolts"]
	var kicks: Array = film["kicks"]
	for f in range(_f + 1, k + 1):
		var j := jolts.find(float(f))
		if j < 0:
			j = jolts.find(f)
		if j >= 0:
			var amount: float = float(kicks[j]) if j < kicks.size() else 4.0
			hero.kick(amount)
			sfx.play("slam", linear_to_db(minf(1.0, 0.4 + amount * 0.06)))
	if k == _f:
		return
	_f = k
	var p: Dictionary = _film_pics[frames[k]]
	var at := Vector2(float(film["x"]), float(film["y"])) * 2.0
	var d := float(film["d"])
	_film_node.region_rect = p["rect"]
	_film_node.offset = -p["anchor"]
	_film_node.position = Vector2(at.x, d * HH)
	_film_node.offset.y += at.y - d * HH


func _boss():
	for m in monsters.list:
		if is_instance_valid(m) and m.boss:
			return m
	return null
