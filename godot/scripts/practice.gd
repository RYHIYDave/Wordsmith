## THE PRACTICE ROOM (game.ts forPractice, beginPractice, updatePractice, spawnWave; defs.ts PRACTICE; the start screen's OPTIONS,
## PRACTICE ROOM): a seasoned throwaway hero of the class picked (level 10, the ring lit, a full set of magic gear, one of every
## other weapon in the bag, six of every word: assets/loot/trials.json `practice`, made by the game) in the arena (assets/practice,
## its look recorded from the game), every word slot open. Nothing here can kill him: struck down, he is UP AGAIN at once, his life
## full, a moment untouchable (game.ts die). Nothing drops but the odd life orb; no experience; nothing saved.
##   THE PACKS keep coming: when three or fewer are left (those still coming up counted) and the wait is over (1.2 s at first, then
## 2.5 s after each), a pack of six walks in from across the hall, 6.5 to 11 tiles from him, in its own place in the arena: each
## pack the game's own spawnWave makes (assets/practice/monsters.json `packs`: a brute leading every third, an elite with a word
## every other), in turn; each one up out of a rift a little after the one before (ARRIVALS: the strongholds' rifts, act1/holds.gd).
extends Node2D

const Holds := preload("res://scripts/act1/holds.gd")
const Monster := preload("res://scripts/monster.gd")
const BakedFigure := preload("res://scripts/baked_figure.gd")
const Iso := preload("res://scripts/iso.gd")

var main
var hero
var monsters
var map
var stands: Node2D
var flats: Node2D
## (what the rift pictures read: the arrivals' numbers and switches, as the strongholds have them)
var Q := {}
var data := {}
var _risers: Array = []
var _rifts: Node2D
var _wave_t := 1.2
var _wave_n := 0


func _ready() -> void:
	data = JSON.parse_string(FileAccess.get_file_as_string("res://assets/practice/monsters.json"))
	Q = JSON.parse_string(FileAccess.get_file_as_string("res://assets/act1/quest610.json"))
	for k in data["defs"]:
		if not monsters._defs.has(k):
			monsters._defs[k] = data["defs"][k]
	_rifts = Holds._RiftLayer.new()
	_rifts.holds = self
	flats.add_child(_rifts)


func _process(dt: float) -> void:
	if get_tree().paused:
		return
	_step_risers(dt)
	_wave_t -= dt
	var alive := 0
	for m in monsters.list:
		if is_instance_valid(m) and not m.dead:
			alive += 1
	alive += _risers.size()
	var T: Dictionary = data["tune"]
	if alive <= int(T["refillAt"]) and _wave_t <= 0.0:
		_spawn_wave()
		_wave_t = 2.5


## (game.ts spawnWave) A pack walks in: its middle a tile of the arena 6.5 to 11 from him; each of it where the game's pack had it
## from its first, or the nearest open tile; each up out of its rift a little after the one before.
func _spawn_wave() -> void:
	var A: Dictionary = map.practice
	var h: Vector2 = hero.world
	var c := Vector2(A["start"]["x"], A["start"]["y"])
	for k in 40:
		var x := float(randi_range(int(A["x0"]) + 2, int(A["x1"]) - 1))
		var y := float(randi_range(int(A["y0"]) + 2, int(A["y1"]) - 1))
		var d := Vector2(x, y).distance_to(h)
		c = Vector2(x, y)
		if d > 6.5 and d < 11.0 and map.walkable(floori(x), floori(y)):
			break
	var packs: Array = data["packs"]
	var pack: Array = packs[_wave_n % packs.size()]
	_wave_n += 1
	var taken := {}
	var base := _risers.size()
	for k in pack.size():
		var d: Dictionary = (pack[k] as Dictionary).duplicate(true)
		var at := _open_near(c + Vector2(float(d["dx"]), float(d["dy"])), taken)
		taken[Vector2i(floori(at.x), floori(at.y))] = true
		d["x"] = at.x
		d["y"] = at.y
		d["life"] = d["maxLife"]
		var fig: String = d["figure"]
		if not monsters._figures.has(fig):
			monsters._figures[fig] = BakedFigure.new(monsters._figures_dir, fig, monsters._info)
		var to: Vector2 = (h - at).normalized()
		d["fx"] = to.x
		d["fy"] = to.y
		var r := {"d": d, "fig": monsters._figures[fig], "at": at, "t": -(base + k) * float(data["arrivals"]["apart"]), "rise": float(data["arrivals"]["rise"]), "r": float(d.get("rift", 0.45)), "seed": randi() % 1000000}
		if not bool(Q["switches"]["arrivals"]):
			_come(r)
			continue
		var pic := Holds._RiserPic.new()
		pic.r = r
		pic.holds = self
		pic.position = Iso.to_screen(at.x, at.y)
		stands.add_child(pic)
		r["node"] = pic
		_risers.append(r)
	_rifts.queue_redraw()


## The middle of the walkable tile nearest `p` (side steps out from it), none of `taken`.
func _open_near(p: Vector2, taken: Dictionary) -> Vector2:
	var best := Vector2(floorf(p.x) + 0.5, floorf(p.y) + 0.5)
	var best_d := INF
	for dy in range(-3, 4):
		for dx in range(-3, 4):
			var tx := floori(p.x) + dx
			var ty := floori(p.y) + dy
			if not map.walkable(tx, ty) or taken.has(Vector2i(tx, ty)):
				continue
			var q := Vector2(tx + 0.5, ty + 0.5)
			var dd := q.distance_squared_to(p)
			if dd < best_d:
				best_d = dd
				best = q
	return best


## One come up out of its rift: one of the monsters, in the fight, awake.
func _come(r: Dictionary) -> void:
	var d: Dictionary = r["d"]
	var m := Monster.new()
	m.mgr = monsters
	m.setup(d, monsters._defs[d["kind"]], r["fig"])
	stands.add_child(m)
	monsters.list.append(m)
	m.state = "chase"
	m.seen = true
	if m.h2 != null and m.h2.has_method("spawned"):
		m.h2.spawned(m)


func _step_risers(dt: float) -> void:
	if _risers.is_empty():
		return
	var keep: Array = []
	for r in _risers:
		r["t"] += dt
		if r["t"] >= r["rise"]:
			r["node"].queue_free()
			_come(r)
			_rifts.closing.append({"at": r["at"], "t": 0.0, "r": r["r"], "seed": r["seed"]})
		else:
			if r["t"] >= 0.0:
				r["node"].queue_redraw()
			keep.append(r)
	_risers = keep
	_rifts.queue_redraw()
