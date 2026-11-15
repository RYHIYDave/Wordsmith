## The floor's monsters, as game.ts spawned them (tools/godot_export.ts saved them: floor1/monsters.json), and what they
## share: the flow field toward the hero (nav.ts flowField: out to 28 tiles, made again every 0.25 s), who sees whom (over
## open ground: floor or pit), their arrows in flight, and their pack waking with one of them (game.ts wakeUp).
extends Node

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")
const Monster := preload("res://scripts/monster.gd")
const Sfx := preload("res://scripts/sfx.gd")
const Arrow := preload("res://scripts/arrow.gd")
const MM := preload("res://scripts/monster_moves.gd")
const Perils := preload("res://scripts/perils.gd")

const FLOW_REACH := 28
const FLOW_EVERY := 0.25
const ARROW_R := 0.2
const HERO_R := 0.3

var map: FloorMap
var sfx: Sfx
var hero  # hero.gd
var stands: Node2D
var perils: Perils
var loot  # loot.gd
var list: Array[Monster] = []
## (shot mode: how many times each move was made)
var used := {}
var _defs := {}
var _info := {}
var _figures_dir := ""
var _flow := PackedInt32Array()
var _flow_in := 0.0
var _arrows: Array = []  # {pos, dir, speed, left, dmg, node}
var _figures := {}
## (the floor's boss has fallen, and where: the ways on open clear of him, ways.gd)
var boss_fell := false
var boss_at := Vector2.ZERO


func load_floor(path: String, figures_dir: String) -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var info: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(figures_dir + "/lists.json"))
	_defs = data["defs"]
	_info = info
	_figures_dir = figures_dir
	for m in data["monsters"]:
		var figure: String = m["figure"]
		if not _figures.has(figure):
			_figures[figure] = BakedFigure.new(figures_dir, figure, info)
		var mon := Monster.new()
		mon.mgr = self
		mon.setup(m, data["defs"][m["kind"]], _figures[figure])
		stands.add_child(mon)
		list.append(mon)
	_flow.resize(map.w * map.h)


func _process(dt: float) -> void:
	_flow_in -= dt
	if _flow_in <= 0.0:
		_flow_in = FLOW_EVERY
		_make_flow()
	var standing: Array[Monster] = []
	for m in list:
		if is_instance_valid(m):
			m.step(dt, hero)
			standing.append(m)
	list = standing
	_part()
	_fly(dt)


## Pack-mates within 14 tiles wake with it; a boss roars, the others call out.
func wake(m: Monster) -> void:
	var voice: String = Monster.VOICE.get(m.kind, "")
	if voice != "":
		sfx.play(voice + "_aggro", -4.0)
	elif m.boss:
		sfx.play("boss_roar")
	m.wake_up()
	if m.pack_id < 0:
		return
	for o in list:
		if is_instance_valid(o) and o != m and o.pack_id == m.pack_id and o.world.distance_to(m.world) <= Monster.WAKE_PACK:
			o.wake_up()


## The monsters a blow at (from, facing `way`) reaches: those within `reach` + their radius in front of him (dot at
## least 0.35), or within 0.9 + their radius whichever way; the one hit is the best of them, nearest and most in front
## (game.ts strike: score = dist - dot * 0.5).
func strike_target(from: Vector2, way: Vector2, reach: float) -> Monster:
	var best: Monster = null
	var best_score := INF
	for m in list:
		if not is_instance_valid(m) or m.dead or m.state == "rise" or shut_in(m):
			continue
		var to := m.world - from
		var dist := to.length()
		var dot := way.dot(to / dist) if dist > 0.001 else 1.0
		if not ((dist <= reach + m.r and dot >= 0.35) or dist <= 0.9 + m.r):
			continue
		var score := dist - dot * 0.5
		if score < best_score:
			best_score = score
			best = m
	return best


## A blow all round a point (game.ts blast): every monster standing within `rad` + its own radius is struck, each by its
## own roll (`roll` gives one hit). How many were struck.
func blast(at: Vector2, rad: float, roll: Callable, spare: Object = null) -> int:
	var n := 0
	for m in list:
		if not is_instance_valid(m) or m.dead or m.state == "rise" or m == spare or shut_in(m):
			continue
		if m.world.distance_to(at) <= rad + m.r:
			m.hurt(roll.call())
			n += 1
	return n


## The nearest monster still standing within `reach` tiles (to aim a blow made from the keys).
func nearest(from: Vector2, reach: float) -> Monster:
	var best: Monster = null
	var best_d := reach
	for m in list:
		if is_instance_valid(m) and not m.dead and m.state != "sleep" and m.state != "rise" and m.world.distance_to(from) <= best_d and not shut_in(m):
			best_d = m.world.distance_to(from)
			best = m
	return best


func clear(x: float, y: float, r: float, fly := false) -> bool:
	# (game.ts free: a monster that walks goes by the walk grid, the rules of height and the slanting walls, and a shut door
	# holds it; one that flies, a bat, by the open grid alone: floor_map.gd free)
	if not fly:
		return map.fits(x, y, r, false, true)
	for ty in range(floori(y - r), floori(y + r) + 1):
		for tx in range(floori(x - r), floori(x + r) + 1):
			if not map.open_at(tx, ty):
				return false
	return true


## May a body step from tile (tx, ty) to the one (dx, dy) from it by the rules of height (height.ts: never over a ledge, a
## flight of stairs only at its ends; a corner only if both ways round are open)? Always, on a floor of one height.
func may_step(tx: int, ty: int, dx: int, dy: int) -> bool:
	return map.step.is_empty() or map.may_overlap(tx, ty, tx + dx, ty + dy)


## Whether `a` sees `b`: every tile on the line between them is open ground (not a shut door: game/doors.ts).
func sees(a: Vector2, b: Vector2) -> bool:
	var d := b - a
	var n := int(ceil(d.length() * 4.0))
	for i in range(1, n):
		var p := a + d * (float(i) / n)
		if not map.open_at(floori(p.x), floori(p.y)):
			return false
	return true


## (game.ts shutIn) What is in a room whose door is shut is out of the hero's reach altogether, awake or not, for as long as he
## is outside it: no blow, blast or shot of his reaches it, and it is no fight.
func shut_in(m) -> bool:
	if map == null or map.doors.is_empty() or hero == null:
		return false
	for d in map.doors:
		if d["kind"] != "door" or int(d["want"]) != 0:
			continue
		var r: Dictionary = map.room(int(d["room"]))
		if FloorMap.in_room(r, m.world) and not FloorMap.in_room(r, hero.world):
			return true
	return false


## The way down the flow field from where a body stands: toward the neighbouring tile nearest the hero.
func flow_dir(at: Vector2) -> Vector2:
	var tx := floori(at.x)
	var ty := floori(at.y)
	if tx < 0 or ty < 0 or tx >= map.w or ty >= map.h:
		return Vector2.ZERO
	var here := _flow[ty * map.w + tx]
	if here < 0:
		return Vector2.ZERO
	var best := here
	var to := Vector2.ZERO
	for dy in [-1, 0, 1]:
		for dx in [-1, 0, 1]:
			if dx == 0 and dy == 0:
				continue
			var nx: int = tx + dx
			var ny: int = ty + dy
			if not map.passable(nx, ny):
				continue
			if dx != 0 and dy != 0 and not (map.passable(tx + dx, ty) and map.passable(tx, ty + dy)):
				continue
			if not may_step(tx, ty, dx, dy):
				continue
			var v := _flow[ny * map.w + nx]
			if v >= 0 and v < best:
				best = v
				to = Vector2(nx + 0.5, ny + 0.5) - at
	return to.normalized() if to != Vector2.ZERO else Vector2.ZERO


## Something loosed at the hero from monster `from`, the way `dir` on the floor: an arrow (0.2 round), one of the Warden's
## bolts, or the marksman's great arrow (`pierce`: it goes through whoever it meets, and on to its end).
func shoot(from: Monster, dir: Vector2, speed: float, reach: float, dmg: float, look := "arrow", r := ARROW_R, pierce := false) -> void:
	var node := Arrow.new()
	node.dir = dir
	node.look = look
	stands.add_child(node)
	_arrows.append({"pos": from.world + dir * (from.r + 0.1), "dir": dir, "speed": speed, "left": reach, "dmg": dmg, "node": node, "r": r, "pierce": pierce, "hit": false})


## THE WARDEN CALLS THE DEAD (game.ts callDead): four skeletons crawl up out of the ground on open floor round him, a little
## after one another; till each is out it is only a picture (not to be hit, doing nothing); then it joins the fight.
func summon(w: Monster) -> void:
	var spots: Array[Vector2] = []
	var tries := 0
	while spots.size() < MM.SUMMON["count"] and tries < 200:
		tries += 1
		var p := w.world + Vector2(randf_range(-4.0, 4.0), randf_range(-4.0, 4.0))
		p = Vector2(floorf(p.x) + 0.5, floorf(p.y) + 0.5)
		if p.distance_to(w.world) < 1.5 or not map.walkable(floori(p.x), floori(p.y)) or not sees(w.world, p):
			continue
		var apart := true
		for s in spots:
			if s.distance_to(p) < 1.0:
				apart = false
		if apart:
			spots.append(p)
	for k in spots.size():
		var m := Monster.new()
		m.mgr = self
		var to: Vector2 = hero.world - spots[k]
		var d := {"kind": "skeleton", "x": spots[k].x, "y": spots[k].y, "fx": to.normalized().x, "fy": to.normalized().y, "r": float(_defs["skeleton"]["radius"]),
			"life": float(_defs["skeleton"]["life"]), "maxLife": float(_defs["skeleton"]["life"]), "dmgMin": float(_defs["skeleton"]["dmgMin"]),
			"dmgMax": float(_defs["skeleton"]["dmgMax"]), "speed": float(_defs["skeleton"]["speed"]), "packId": w.pack_id, "boss": false, "champion": false}
		if not _figures.has("skeleton"):
			_figures["skeleton"] = BakedFigure.new(_figures_dir, "skeleton", _info)
		m.setup(d, _defs["skeleton"], _figures["skeleton"])
		m.rise(MM.SUMMON["rise"] + k * MM.SUMMON["apart"])
		stands.add_child(m)
		list.append(m)
	sfx.play("boss_roar")


## How many of the dead the Warden has called still stand, or are coming up out of the ground.
func called(w: Monster) -> int:
	var n := 0
	for o in list:
		if is_instance_valid(o) and o != w and not o.dead and o.pack_id == w.pack_id and o.kind == "skeleton":
			n += 1
	return n


func _fly(dt: float) -> void:
	var keep: Array = []
	for a in _arrows:
		var step: float = a["speed"] * dt
		a["pos"] += a["dir"] * step
		a["left"] -= step
		var p: Vector2 = a["pos"]
		var gone: bool = a["left"] <= 0.0 or not map.open_at(floori(p.x), floori(p.y))
		if not gone and not a["hit"] and hero.alive and p.distance_to(hero.world) <= a["r"] + HERO_R:
			hero.hurt(a["dmg"])
			a["hit"] = true
			gone = not a["pierce"]
		if gone:
			a["node"].queue_free()
		else:
			a["node"].position = Iso.to_screen(p.x, p.y)
			keep.append(a)
	_arrows = keep


## Bodies that are awake keep apart: two that overlap are pushed apart, each half the way, where the floor lets them; and
## none stands in the hero: one that overlaps him is put back out of him (his own step into a swing included).
func _part() -> void:
	for i in list.size():
		var a := list[i]
		if a.dead or a.state == "sleep" or a.state == "rise":
			continue
		if hero != null and hero.alive:
			var h: Vector2 = a.world - hero.world
			var hl := h.length()
			var hneed := a.r + HERO_R
			if hl < hneed:
				var out := (h / hl if hl > 0.0001 else Vector2(1, 0)) * (hneed - hl)
				if clear(a.world.x + out.x, a.world.y + out.y, minf(a.r, 0.42)):
					a.world += out
		for j in range(i + 1, list.size()):
			var b := list[j]
			if b.dead or b.state == "rise":
				continue
			var d := b.world - a.world
			var need := a.r + b.r
			var l := d.length()
			if l >= need or l < 0.0001:
				continue
			var push := d / l * (need - l) * 0.5
			if clear(a.world.x - push.x, a.world.y - push.y, minf(a.r, 0.42)):
				a.world -= push
			if b.state != "sleep" and clear(b.world.x + push.x, b.world.y + push.y, minf(b.r, 0.42)):
				b.world += push


## nav.ts flowField: steps from the hero's tile over the walk grid, eight ways round (no corner cut), out to 28.
func _make_flow() -> void:
	if _flow.size() != map.w * map.h:
		_flow.resize(map.w * map.h)
	_flow.fill(-1)
	if hero == null or not hero.alive:
		return
	var sx := floori(hero.world.x)
	var sy := floori(hero.world.y)
	if not map.walkable(sx, sy):
		return
	var q := PackedInt32Array([sy * map.w + sx])
	_flow[sy * map.w + sx] = 0
	var head := 0
	while head < q.size():
		var i := q[head]
		head += 1
		var d := _flow[i]
		if d >= FLOW_REACH:
			continue
		var tx := i % map.w
		var ty := i / map.w
		for dy in [-1, 0, 1]:
			for dx in [-1, 0, 1]:
				if dx == 0 and dy == 0:
					continue
				var nx: int = tx + dx
				var ny: int = ty + dy
				if not map.passable(nx, ny):
					continue
				if dx != 0 and dy != 0 and not (map.passable(tx + dx, ty) and map.passable(tx, ty + dy)):
					continue
				if not may_step(tx, ty, dx, dy):
					continue
				var j := ny * map.w + nx
				if _flow[j] < 0:
					_flow[j] = d + 1
					q.append(j)
