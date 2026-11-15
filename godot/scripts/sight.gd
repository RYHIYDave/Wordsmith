## WHAT THE HERO HAS SEEN (game.ts updateVision): ten times a second, 180 rays out from him to 11 tiles (TUNE.sightRadius), a
## step of 0.3 at a time; every tile a ray touches is in sight now and has been seen; a ray stops at a tile that is not open
## ground (a wall, a shut door: FloorMap.open_at). What has been seen stays seen while he is on the floor.
##   - The place's look shows each of its things once the tile it waits on has been seen (look.gd `reveal`: the tile is the
##     renderer's own, read off it by tools/godot_record.mjs).
##   - A monster is drawn while its tile is in sight now (game.ts Monster.seen).
## The town is seen whole. `see_all()`: the whole floor seen (shot modes that picture a floor).
extends Node

const FloorMap := preload("res://scripts/floor_map.gd")

const RADIUS := 11.0
const RAYS := 180
const STEP := 0.3
const EVERY := 0.1

var map: FloorMap
var hero
var look
var monsters
## (the tiles in sight now, and those seen since he came in)
var visible_now := PackedByteArray()
var explored := PackedByteArray()
var all := false
var _list := PackedInt32Array()
var _in := 0.0


func _ready() -> void:
	visible_now.resize(map.w * map.h)
	explored.resize(map.w * map.h)
	if all:
		see_all()
	else:
		_look()


func see_all() -> void:
	all = true
	visible_now.fill(1)
	explored.fill(1)
	if look != null:
		look.reveal_all()


func _process(dt: float) -> void:
	if all or hero == null:
		_show_monsters()
		return
	_in -= dt
	if _in <= 0.0:
		_in = EVERY
		_look()
	_show_monsters()


func _look() -> void:
	for i in _list:
		visible_now[i] = 0
	_list.clear()
	var fresh := PackedInt32Array()
	var h: Vector2 = hero.world
	for k in RAYS:
		var a := float(k) / RAYS * TAU
		var dx := cos(a)
		var dy := sin(a)
		var s := 0.0
		while s <= RADIUS:
			var tx := floori(h.x + dx * s)
			var ty := floori(h.y + dy * s)
			if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h:
				break
			var idx := ty * map.w + tx
			if visible_now[idx] == 0:
				visible_now[idx] = 1
				_list.append(idx)
				if explored[idx] == 0:
					explored[idx] = 1
					fresh.append(idx)
			if not map.open_at(tx, ty):
				break
			s += STEP
	if look != null and not fresh.is_empty():
		look.reveal(fresh)


## A monster is drawn while the tile it stands on is in sight (a body that has fallen where he has been stays).
func _show_monsters() -> void:
	if monsters == null:
		return
	for m in monsters.list:
		if not is_instance_valid(m):
			continue
		var tx := floori(m.world.x)
		var ty := floori(m.world.y)
		var seen: bool = all or (tx >= 0 and ty >= 0 and tx < map.w and ty < map.h and (visible_now[ty * map.w + tx] == 1 or (m.dead and explored[ty * map.w + tx] == 1)))
		m.visible = seen
		m.seen = seen


## Whether a place on the floor has been seen (what lies there is drawn).
func seen_at(p: Vector2) -> bool:
	var tx := floori(p.x)
	var ty := floori(p.y)
	return all or (tx >= 0 and ty >= 0 and tx < map.w and ty < map.h and explored[ty * map.w + tx] == 1)
