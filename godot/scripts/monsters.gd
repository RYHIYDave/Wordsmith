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

const FLOW_REACH := 28
const FLOW_EVERY := 0.25
const ARROW_R := 0.2
const HERO_R := 0.3

var map: FloorMap
var sfx: Sfx
var hero  # hero.gd
var stands: Node2D
var list: Array[Monster] = []
var _flow := PackedInt32Array()
var _flow_in := 0.0
var _arrows: Array = []  # {pos, dir, speed, left, dmg, node}
var _figures := {}


func load_floor(path: String, figures_dir: String) -> void:
	var data: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(path))
	var info: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(figures_dir + "/lists.json"))
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
		if not is_instance_valid(m) or m.dead:
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


## The nearest monster still standing within `reach` tiles (to aim a blow made from the keys).
func nearest(from: Vector2, reach: float) -> Monster:
	var best: Monster = null
	var best_d := reach
	for m in list:
		if is_instance_valid(m) and not m.dead and m.state != "sleep" and m.world.distance_to(from) <= best_d:
			best_d = m.world.distance_to(from)
			best = m
	return best


func clear(x: float, y: float, r: float) -> bool:
	for ty in range(floori(y - r), floori(y + r) + 1):
		for tx in range(floori(x - r), floori(x + r) + 1):
			if not map.walkable(tx, ty):
				return false
	return true


## Whether `a` sees `b`: every tile on the line between them is open ground.
func sees(a: Vector2, b: Vector2) -> bool:
	var d := b - a
	var n := int(ceil(d.length() * 4.0))
	for i in range(1, n):
		var p := a + d * (float(i) / n)
		var t := map.tile(floori(p.x), floori(p.y))
		if t != FloorMap.FLOOR and t != FloorMap.PIT:
			return false
	return true


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
			if not map.walkable(nx, ny):
				continue
			if dx != 0 and dy != 0 and not (map.walkable(tx + dx, ty) and map.walkable(tx, ty + dy)):
				continue
			var v := _flow[ny * map.w + nx]
			if v >= 0 and v < best:
				best = v
				to = Vector2(nx + 0.5, ny + 0.5) - at
	return to.normalized() if to != Vector2.ZERO else Vector2.ZERO


func shoot(from: Monster, at: Vector2, speed: float, reach: float, dmg: float) -> void:
	var dir := (at - from.world).normalized()
	var node := Arrow.new()
	node.dir = dir
	stands.add_child(node)
	_arrows.append({"pos": from.world + dir * (from.r + 0.1), "dir": dir, "speed": speed, "left": reach, "dmg": dmg, "node": node})


func _fly(dt: float) -> void:
	var keep: Array = []
	for a in _arrows:
		var step: float = a["speed"] * dt
		a["pos"] += a["dir"] * step
		a["left"] -= step
		var p: Vector2 = a["pos"]
		var t := map.tile(floori(p.x), floori(p.y))
		var gone: bool = a["left"] <= 0.0 or (t != FloorMap.FLOOR and t != FloorMap.PIT)
		if not gone and hero.alive and p.distance_to(hero.world) <= ARROW_R + HERO_R:
			hero.hurt(a["dmg"])
			gone = true
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
		if a.dead or a.state == "sleep":
			continue
		if hero != null and hero.alive:
			var h: Vector2 = a.world - hero.world
			var hl := h.length()
			var hneed := a.r + HERO_R
			if hl < hneed:
				var out := (h / hl if hl > 0.0001 else Vector2(1, 0)) * (hneed - hl)
				if clear(a.world.x + out.x, a.world.y + out.y, a.r):
					a.world += out
		for j in range(i + 1, list.size()):
			var b := list[j]
			if b.dead:
				continue
			var d := b.world - a.world
			var need := a.r + b.r
			var l := d.length()
			if l >= need or l < 0.0001:
				continue
			var push := d / l * (need - l) * 0.5
			if clear(a.world.x - push.x, a.world.y - push.y, a.r):
				a.world -= push
			if b.state != "sleep" and clear(b.world.x + push.x, b.world.y + push.y, b.r):
				b.world += push


## nav.ts flowField: steps from the hero's tile over the walk grid, eight ways round (no corner cut), out to 28.
func _make_flow() -> void:
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
				if not map.walkable(nx, ny):
					continue
				if dx != 0 and dy != 0 and not (map.walkable(tx + dx, ty) and map.walkable(tx, ty + dy)):
					continue
				var j := ny * map.w + nx
				if _flow[j] < 0:
					_flow[j] = d + 1
					q.append(j)
