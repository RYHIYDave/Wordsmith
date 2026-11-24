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


## The plan for this floor (bells.gd's `D`), or {} if none fits. `rng` the level's luck. `sure` (THE DOOR WORDS: Toll burned in,
## door_words.gd): where the usual plan finds no room, a looser one (any ordinary or elite room, nearer where he comes in and the
## boss, three bells at the least, more tries) before none.
static func make(main, mdata: Dictionary, rng: RandomNumberGenerator, sure := false) -> Dictionary:
	var D := _make(main, mdata, rng, false)
	if D.is_empty() and sure:
		D = _make(main, mdata, rng, true)
	return D


static func _make(main, mdata: Dictionary, rng: RandomNumberGenerator, loose: bool) -> Dictionary:
	var M = main.map
	var base: Dictionary = (JSON.parse_string(FileAccess.get_file_as_string("res://assets/floor11/monsters.json")) as Dictionary)["bells"]
	var boss := Vector2(-999, -999)
	# (where the floor's monsters stand: no bell on one, as a bell's tile is walked through by none and one stood there could not move)
	var stood: Array = []
	for o in mdata.get("monsters", []):
		if bool(o.get("boss", false)):
			boss = Vector2(float(o["x"]), float(o["y"]))
		stood.append(Vector2(float(o["x"]), float(o["y"])))
	var clear := func(s: Vector2) -> bool:
		for v in stood:
			if v.distance_to(s) < 1.3:
				return false
		return true
	var size := 5 if loose else 6
	var kinds: Array = ["normal", "elite"] if loose else ["normal"]
	var rooms: Array = M.rooms.filter(func(q): return kinds.has(str(q.get("kind", ""))) and int(q["w"]) >= size and int(q["h"]) >= size)
	_shuffle(rooms, rng)
	# (the Muffled Bell in the first room that has room for it and its bells round it: the next room tried where they do not fit)
	var muff = null
	var bells: Array = []
	for q in rooms:
		var c := Vector2(float(q["x"]) + float(q["w"]) / 2.0, float(q["y"]) + float(q["h"]) / 2.0)
		if c.distance_to(M.start) < (12.0 if loose else 24.0) or c.distance_to(boss) < (8.0 if loose else 14.0):
			continue
		muff = _open_near(M, c, 2.5, 0.9, clear)
		if muff == null:
			continue
		bells = _ring(M, muff, rng, loose, clear)
		if bells.size() >= (3 if loose else int(N[0])):
			break
		muff = null
	if muff == null:
		return {}
	var U: Dictionary = base["tune"]
	# (the tough ones: a leader's kind of the floor's own, tougher for each bell before it)
	var leads: Array = (mdata.get("monsters", []) as Array).filter(func(o): return str(o.get("rarity", "")) == "leader" and not bool(o.get("boss", false)))
	var tough: Array = []
	if not leads.is_empty():
		var lead: Dictionary = _plain(leads[rng.randi_range(0, leads.size() - 1)])
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
			rise[kind] = _plain(o)
	var own: Array = []
	for kind in counts:
		own.append({"kind": kind, "weight": counts[kind]})
	if own.is_empty():
		return {}
	return {"plan": {"muffled": {"x": muff.x, "y": muff.y}, "bells": bells, "hush": {"x": muff.x, "y": muff.y, "r": HUSH_R}},
		"limit": float(U["perBell"]) * bells.size(), "props": [], "muffled": {}, "tune": U, "still": base["still"], "tough": tough,
		"own": own, "rise": rise, "made": true}


## The bells round the Muffled Bell at `muff`, as many as fit of the number wanted.
static func _ring(M, muff: Vector2, rng: RandomNumberGenerator, loose: bool, clear: Callable) -> Array:
	var want := rng.randi_range(int(N[0]), int(N[1]))
	var bells: Array = []
	for k in (1500 if loose else 600):
		if bells.size() >= want:
			break
		var a := rng.randf() * TAU
		var d := rng.randf_range(APART * (0.8 if loose else 1.0), HUSH_R * 0.85)
		var p: Vector2 = muff + Vector2(cos(a), sin(a)) * d
		var s = _open_near(M, Vector2(floorf(p.x) + 0.5, floorf(p.y) + 0.5), 0.0, 0.7, clear)
		if s == null or s.distance_to(M.start) < (4.0 if loose else 6.0):
			continue
		var ok := true
		for b in bells:
			if Vector2(b["x"], b["y"]).distance_to(s) < APART * (0.8 if loose else 1.0):
				ok = false
		if ok:
			bells.append({"x": s.x, "y": s.y})
	return bells


## One of the floor's own as the Bells call it up: no royal's crest (its card), no rune carried, no prize it fights with: what it was
## laid as on the floor (main.gd royal_packs, the carriers) is not handed on to every copy the Hush raises.
static func _plain(o: Dictionary) -> Dictionary:
	var t: Dictionary = o.duplicate(true)
	t.erase("royal")
	t["carries"] = []
	t["words"] = (t.get("words", []) as Array).filter(func(w): return not ["plundering", "greed"].has(str(w)))
	t["half"] = (t.get("half", []) as Array).filter(func(w): return not ["plundering", "greed"].has(str(w)))
	return t


static func _shuffle(a: Array, rng: RandomNumberGenerator) -> void:
	for i in range(a.size() - 1, 0, -1):
		var j := rng.randi_range(0, i)
		var x = a[i]
		a[i] = a[j]
		a[j] = x


## Open floor at or near `c` (within `within` tiles) with room `r` round it, a tile's middle; null if none.
static func _open_near(M, c: Vector2, within: float, r: float, ok = null):
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
			if ok != null and not (ok as Callable).call(p):
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
