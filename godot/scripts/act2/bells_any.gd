## THE BELLS ON AN ENDLESS LEVEL OF ANY FLOOR (his words, 23 Nov 2026: “I want these random encounters, (chained, stronghold, muffled
## bells, and royal cards) to show up in any level.  So it's more random.”). On floors 11 to 15 the Bells are the floor's own, laid by
## the game's map-maker and drawn in its look (bells.gd). On an endless level of any other floor, one time in LEVEL, a plan of the
## same shape is made here, and the bells stand as pieces of their own (assets/bells: the market bell, gagged, as the Muffled Bell; a
## wayside shrine's bell for each of the others, tools/godot_bells.ts):
##   THE MUFFLED BELL in one of the floor's ordinary rooms, well away from where he comes in and from the boss.
##   THE BELLS, N of them, round it within the Hush's reach, on open floor, well apart.
##   THE HUSH, HUSH_R tiles round the Muffled Bell; the clock, 15 s a bell; its numbers floor 11's (assets/floor11/monsters.json).
##   THE TOUGH ONES, one a bell but the last: a yellow pack's leader of one of the floor's own leaders' kinds, tougher by the tune's
##     `tough` (0.35) for each bell before it, as floor 11's are.
##   WHAT THE HUSH RAISES: the floor's own kinds, by how many of each the floor has.
extends RefCounted

const FloorMap := preload("res://scripts/floor_map.gd")
const DIR := "res://assets/bells/"
static var ON := true
## (one endless level in LEVEL outside floors 11 to 15 has them; the bells, at least and at most; the Hush's reach; how far apart)
const LEVEL := 3
const N := [4, 6]
const HUSH_R := 24.0
const APART := 7.0


## The plan for this floor (bells.gd's `D`), or {} if none fits. `rng` the level's luck.
static func make(main, mdata: Dictionary, rng: RandomNumberGenerator) -> Dictionary:
	var M = main.map
	var base: Dictionary = (JSON.parse_string(FileAccess.get_file_as_string("res://assets/floor11/monsters.json")) as Dictionary)["bells"]
	var boss := Vector2(-999, -999)
	for o in mdata.get("monsters", []):
		if bool(o.get("boss", false)):
			boss = Vector2(float(o["x"]), float(o["y"]))
	var rooms: Array = M.rooms.filter(func(q): return str(q.get("kind", "")) == "normal" and int(q["w"]) >= 6 and int(q["h"]) >= 6)
	_shuffle(rooms, rng)
	var muff = null
	for q in rooms:
		var c := Vector2(float(q["x"]) + float(q["w"]) / 2.0, float(q["y"]) + float(q["h"]) / 2.0)
		if c.distance_to(M.start) < 24.0 or c.distance_to(boss) < 14.0:
			continue
		muff = _open_near(M, c, 2.5, 0.9)
		if muff != null:
			break
	if muff == null:
		return {}
	var want := rng.randi_range(int(N[0]), int(N[1]))
	var bells: Array = []
	for k in 600:
		if bells.size() >= want:
			break
		var a := rng.randf() * TAU
		var d := rng.randf_range(APART, HUSH_R * 0.85)
		var p: Vector2 = muff + Vector2(cos(a), sin(a)) * d
		var s = _open_near(M, Vector2(floorf(p.x) + 0.5, floorf(p.y) + 0.5), 0.0, 0.7)
		if s == null or s.distance_to(M.start) < 6.0:
			continue
		var ok := true
		for b in bells:
			if Vector2(b["x"], b["y"]).distance_to(s) < APART:
				ok = false
		if ok:
			bells.append({"x": s.x, "y": s.y})
	if bells.size() < int(N[0]):
		return {}
	var U: Dictionary = base["tune"]
	# (the tough ones: a leader's kind of the floor's own, tougher for each bell before it)
	var leads: Array = (mdata.get("monsters", []) as Array).filter(func(o): return str(o.get("rarity", "")) == "leader" and not bool(o.get("boss", false)))
	var tough: Array = []
	if not leads.is_empty():
		var lead: Dictionary = leads[rng.randi_range(0, leads.size() - 1)]
		for k in bells.size() - 1:
			var t: Dictionary = lead.duplicate(true)
			t["maxLife"] = roundf(float(lead["maxLife"]) * (1.0 + float(U["tough"]) * k))
			t["life"] = t["maxLife"]
			tough.append([t])
	# (what the Hush raises: the floor's own kinds, by how many of each it has)
	var rise := {}
	var counts := {}
	for o in mdata.get("monsters", []):
		if bool(o.get("boss", false)) or str(o.get("rarity", "")) == "leader" or bool(o.get("elite", false)):
			continue
		var kind := str(o["kind"])
		counts[kind] = int(counts.get(kind, 0)) + 1
		if not rise.has(kind):
			rise[kind] = (o as Dictionary).duplicate(true)
	var own: Array = []
	for kind in counts:
		own.append({"kind": kind, "weight": counts[kind]})
	if own.is_empty():
		return {}
	return {"plan": {"muffled": {"x": muff.x, "y": muff.y}, "bells": bells, "hush": {"x": muff.x, "y": muff.y, "r": HUSH_R}},
		"limit": float(U["perBell"]) * bells.size(), "props": [], "muffled": {}, "tune": U, "still": base["still"], "tough": tough,
		"own": own, "rise": rise, "made": true}


static func _shuffle(a: Array, rng: RandomNumberGenerator) -> void:
	for i in range(a.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var x = a[i]
		a[i] = a[j]
		a[j] = x


## Open floor at or near `c` (within `within` tiles) with room `r` round it, a tile's middle; null if none.
static func _open_near(M, c: Vector2, within: float, r: float):
	var best = null
	var bd := INF
	var n := ceili(within)
	for dy in range(-n, n + 1):
		for dx in range(-n, n + 1):
			var p := Vector2(floorf(c.x) + dx + 0.5, floorf(c.y) + dy + 0.5)
			if p.distance_to(c) > within + 0.01:
				continue
			var tx := floori(p.x)
			var ty := floori(p.y)
			if not M.walkable(tx, ty) or M.tile(tx, ty) != FloorMap.FLOOR or not M.fits(p.x, p.y, r):
				continue
			if p.distance_to(c) < bd:
				bd = p.distance_to(c)
				best = p
	return best


## THE PIECES (bells.json): each bell's pictures by its state, laid where the plan has it among the figures, its foot's tile not
## walked through. Returns {name: [Sprite2D, frames]}.
static func stand(main, D: Dictionary) -> Dictionary:
	var table: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + "bells.json"))
	var out := {}
	var Iso := preload("res://scripts/iso.gd")
	var put := func(name: String, key: String, at: Vector2) -> void:
		var frames: Array = []
		for f in table[key]:
			frames.append({"tex": load(DIR + str(f["file"])), "ox": float(f["ox"]), "oy": float(f["oy"])})
		var s := Sprite2D.new()
		s.centered = false
		s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		s.scale = Vector2(0.5, 0.5)
		s.position = Iso.to_screen(at.x, at.y)
		main._monsters.stands.add_child(s)
		out[name] = [s, frames]
		_frame(out[name], 0)
		var M = main.map
		var i: int = floori(at.y) * M.w + floori(at.x)
		M.walk[i] = 0
	put.call("muffled", "muffled", Vector2(D["plan"]["muffled"]["x"], D["plan"]["muffled"]["y"]))
	for i in D["plan"]["bells"].size():
		var b: Dictionary = D["plan"]["bells"][i]
		put.call("bell%d" % i, "shrine", Vector2(b["x"], b["y"]))
	return out


## A piece shown in its picture `k`.
static func _frame(piece: Array, k: int) -> void:
	var s: Sprite2D = piece[0]
	if not is_instance_valid(s):
		return
	var f: Dictionary = piece[1][clampi(k, 0, piece[1].size() - 1)]
	s.texture = f["tex"]
	s.offset = -Vector2(f["ox"], f["oy"])


## How high the Muffled Bell's picture stands over its foot, game pixels (its label hangs over it).
static func lift() -> float:
	var table: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(DIR + "bells.json"))
	return float(table["muffled"][0]["oy"]) / 2.0
