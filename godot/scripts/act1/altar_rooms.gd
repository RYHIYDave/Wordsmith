## STRONGHOLDS ON ANY ENDLESS LEVEL: THE CULT'S GATE AT THE MAP'S EDGE (his words, 23 Nov 2026: “In endless mode I want multiple
## chained and stronghold encounters per level.  And I want these random encounters, (chained, stronghold, muffled bells, and royal
## cards) to show up in any level.  So it's more random.”; shown the cult's altar in one of a floor's rooms, the room sealed by fire,
## his “Why wouldn’t you just put the door on the edge of the map?  Why is it in the middle of the area?”, and asked whether to do
## it as floors 6 to 10 do, the gate in a wall at the edge and the hall behind it, his pick, 25 Nov 2026: “Gate at the edge
## (Recommended)”). On an endless level of a floor with no strongholds of its own (all but floors 6 to 10, whose own stay as they
## are), N of the cult's gates, each as a stronghold of the Wilds is (act1/holds.gd, whose rules these are):
##   THE GATE: the redoubt's gatehouse of the Wilds' strongholds (art/floor6.ts gatehouse, its sealed door's mark burning), standing
##     in a wall at the map's edge, nothing walked behind it; before it its court of flagstones, the altar of the words in the
##     court (art/act1_cult.ts wordAltar), a brazier of the cult's pink fire either side of it (pinkBrazier), its banners at the
##     court's foot (cultBanner): tools/godot_altar_room.ts.
##   THE ALTAR: E within HOLD_TUNE.near: the gear screen with the altar beside it (inventory.gd, THE ALTAR OF THE WORDS), up to three
##     spare words laid and taken back free; OPEN THE DOOR burns them: the seal breaks, the altar is gone, the door stands open.
##   THE HALL beyond it: one of the Wilds' own halls (floors 6 to 10, as the game draws them from in them: assets/looks/floor<N>_hold<n>,
##     their ground tools/godot_edge_halls.mjs), laid past the floor's south edge in rows grown for it (floor_map.gd grow_south);
##     into the doorway, the screen dark, and he is at the far end of its hallway; out by it, before the gate. Its five waves
##     (HOLD_WAVES) rise out of rifts in its floor as a hall's do: of the floor's own packs (QUEST610 hold.make: plain, two plain,
##     blue and plain, two blue, a yellow and a blue), each with the words burned, harder for each word past the first and each wave on.
##   THE REWARD, the last dead: a hall's (holds.gd _won: runedust, gear, gold, a page of the muster roll).
## ON at his yes to the pictures (docs/mockups/edge_gate/), 25 Nov 2026: “I have art chat making new stronghold entrances for all levels,
## but yes switch them on” (the art chat's entrances to take the gatehouse's place as they come in).
extends "res://scripts/act1/holds.gd"

const AR_DIR := "res://assets/altar_room/"
const FloorMap := preload("res://scripts/floor_map.gd")
const DoorWords := preload("res://scripts/door_words.gd")
static var ON := true
## (gates on a level; at most, Siege burned in; how far the altar from where he comes in; two altars this far apart)
const N := 2
const MOST := 4
const FAR := 14.0
const APART := 14.0
## (how many on this floor: gates_for)
var want := N
## (A GATE'S PLACE: before it its court, open floor this many tiles across and deep; behind it the wall at the map's edge, this
## many tiles across and deep with nothing walked on in it)
const COURT := Vector2i(4, 3)
const BACK := Vector2i(6, 4)
## (THE HALLS past the south edge: this many rows of nothing between the floor and them; each one's place, across and down)
const GAP := 8
const SLOT := Vector2i(20, 24)
## (their screen layers: the floor's own halls, floors 6 to 10, have the first two: holds.gd HALL_BIT)
const EDGE_BIT := 4
## (the gatehouse in strips this many picture pixels wide, each sorted by where along the wall it stands, so that he goes in
## front of its near end and its far end in front of the wall beyond it)
const STRIP := 16
## (the pieces' pictures' frames a second: the braziers' fire, the banners stirring, the mark on the sealed door)
const FPS := {"brazier": 8.0, "banner": 6.0, "gate": 6.0}
const PINK := Color("#ff4f8a")
## (the court's flagstones as dim as the floor round them)
const FLAG_DIM := Color(0.58, 0.56, 0.64)

## (the floor's monsters, their packs the waves are made of; the level's luck, or -1)
var mdata: Dictionary = {}
var seed := -1
var _rng := RandomNumberGenerator.new()
var _table := {}
var _frames := {}
## (the Wilds' halls to lay: tools/godot_edge_halls.mjs)
var _src: Array = []
## (each gate's pieces: {"gate": [Sprite2D strips], "stand": [[Sprite2D, key]], "altar": Sprite2D or null})
var _pieces := {}
var _glow: Node2D


## Is there to be a gate here: on, an endless level, a floor that has no strongholds of its own.
static func wanted(main, where: String) -> bool:
	return ON and bool(main.in_endless) and where.begins_with("floor") and not FileAccess.file_exists(file_of(int(main.map.depth)))


## How many of the cult's gates this level has: on a floor with no strongholds of its own N (Siege burned in, twice as many); on one
## of floors 6 to 10, Siege burned in, SIEGE_OWN beside its own; else none (door_words.gd).
static func gates_for(main, where: String) -> int:
	if not ON or not bool(main.in_endless) or not where.begins_with("floor") or main.map == null:
		return 0
	var siege := DoorWords.burned(main, "siege") > 0
	if FileAccess.file_exists(file_of(int(main.map.depth))):
		return DoorWords.SIEGE_OWN if siege else 0
	return mini(MOST, N * (DoorWords.MORE if siege else 1))


## The rows the floor grows past its south edge for `n` halls (floor_map.gd grow_south): GAP, then as many rows of places as they need.
static func band_rows(n: int, w: int) -> int:
	if n <= 0:
		return 0
	var across := maxi(1, (w - 2) / SLOT.x)
	return GAP + SLOT.y * ceili(float(n) / across) + 2


func _ready() -> void:
	Q = JSON.parse_string(FileAccess.get_file_as_string("res://assets/act1/quest610.json"))
	T = Q["hold"]["tune"]
	_table = JSON.parse_string(FileAccess.get_file_as_string(AR_DIR + "altar_room.json"))
	# (and each floor's own front, the art chat's (tools/godot_altar_room.ts `front_<floor>`, `front_<floor>_y`): _gate_key)
	for k in _table:
		if not (k in ["altar", "brazier", "banner", "gate", "flag", "gate_y", "altar_y"] or str(k).begins_with("front_")):
			continue
		_frames[k] = (_table[k] as Array).map(func(f): return {"tex": load(AR_DIR + str(f["file"])), "ox": float(f["ox"]), "oy": float(f["oy"]), "w": int(f["w"]), "h": int(f["h"])})
	_src = JSON.parse_string(FileAccess.get_file_as_string(AR_DIR + "halls.json"))
	data = {"holds": [], "defs": {}, "power": maxi(1, int(loot.power()))}
	if seed >= 0:
		_rng.seed = seed
	else:
		_rng.randomize()
	if map.grown_from < 0 or _src.is_empty():
		return
	for c in _spots():
		if data["holds"].size() >= want:
			break
		_keep(_plan(data["holds"].size(), c))
	if data["holds"].is_empty():
		return
	# (the floor's look on a layer of its own, put away while he is in a hall: holds.gd)
	if look != null:
		look.set_cull(FLOOR_BIT)
	_rifts = _RiftLayer.new()
	_rifts.holds = self
	flats.add_child(_rifts)
	_glow = _Glow.new()
	_glow.rooms = self
	flats.add_child(_glow)
	for q in data["holds"]:
		_stand(q)
	# (a monster standing where the altar, a brazier or a banner now stands is stood beside it: left inside it, it never moved; the bug
	# hunt's sixth round, 25 Nov 2026)
	if main != null and main._monsters != null:
		for m in main._monsters.list:
			if is_instance_valid(m) and not m.dead and not m.boss and not map.walkable(floori(m.world.x), floori(m.world.y)):
				m.world = main._free_near(m.world)


# --- where they are ---

func _keep(q: Dictionary) -> void:
	if q.is_empty():
		return
	data["holds"].append(q)
	st.append({"words": [], "open": false, "entered": false, "won": false, "wave": 0, "packs": [], "coming": false})


## Not near a chained rare, the Bells or another gate's altar.
func _clear_of_others(p: Vector2, keep: float) -> bool:
	for o in monsters.list:
		if is_instance_valid(o) and int(o.get("chained")) != 0 and o.world.distance_to(p) < keep:
			return false
	var B: Dictionary = monsters.bells if monsters.bells is Dictionary else {}
	var plan: Dictionary = B.get("D", B).get("plan", {}) if not B.is_empty() else {}
	for b in ([plan.get("muffled")] + plan.get("bells", [])):
		if b is Dictionary and b.has("x") and Vector2(float(b["x"]), float(b["y"])).distance_to(p) < keep:
			return false
	for q in data["holds"]:
		if Vector2(q["altar"]["x"], q["altar"]["y"]).distance_to(p) < APART:
			return false
	# (on floors 6 to 10, Siege burned in: away from the floor's own strongholds, their gates and their halls: holds.gd)
	var own = main.quest610.holds if main != null and main.quest610 != null else null
	if own != null and own != self and is_instance_valid(own):
		for q in own.data["holds"]:
			if Vector2(q["altar"]["x"], q["altar"]["y"]).distance_to(p) < APART or _in_hold(q, p, 4.0):
				return false
	return true


## (open floor of one height, not cut, no stair: what a court is laid on)
func _court_tile(tx: int, ty: int, ht: int) -> bool:
	if not map.walkable(tx, ty) or map.tile(tx, ty) != FloorMap.FLOOR:
		return false
	var i: int = ty * map.w + tx
	if not map.height.is_empty() and map.height[i] != ht:
		return false
	if not map.cut.is_empty() and map.cut[i] != 0:
		return false
	return map.stair.is_empty() or map.stair[i] == 0


## A gate's place by its own measures: `a` along its wall, `b` out from it, from (gx, gy), the middle of its doorway's back edge: in a
## wall that runs along x (its door looking out down the screen to the left) (gx + a, gy + b); `turned`, in one that runs along y
## (looking out down the screen to the right), (gx + b, gy + a). Its doorway is a from -1 to 1, b from 0 to 1.
static func _gw(turned: bool, gx: float, gy: float, a: float, b: float) -> Vector2:
	return Vector2(gx + b, gy + a) if turned else Vector2(gx + a, gy + b)


static func _gt(turned: bool, gx: int, gy: int, a: int, b: int) -> Vector2i:
	return Vector2i(gx + b, gy + a) if turned else Vector2i(gx + a, gy + b)


## A gate's place at (gx, gy) (`turned`: in a wall along y): its court open floor before it, the wall behind it the map's edge
## (nothing walked on in it), and nothing of the floor's own in the way.
func _fits(gx: int, gy: int, turned: bool) -> bool:
	# (quick: the doorway on floor, the wall straight behind it)
	for a in [-1, 0]:
		var d := _gt(turned, gx, gy, a, 0)
		var k := _gt(turned, gx, gy, a, -1)
		if not map.walkable(d.x, d.y) or map.walkable(k.x, k.y):
			return false
	var ht: int = map.height[gy * map.w + gx] if not map.height.is_empty() else 0
	for a in range(-COURT.x / 2, COURT.x / 2):
		for b in range(0, COURT.y):
			var t := _gt(turned, gx, gy, a, b)
			if not _court_tile(t.x, t.y, ht):
				return false
	for a in range(-BACK.x / 2, BACK.x / 2):
		for b in range(-BACK.y, 0):
			var t := _gt(turned, gx, gy, a, b)
			if map.walkable(t.x, t.y):
				return false
	var c := _gw(turned, gx, gy, 0.0, 1.5)
	if c.distance_to(map.start) < FAR:
		return false
	for r in map.rooms:
		if str(r.get("kind", "")) in ["start", "boss"] and Rect2(float(r["x"]) - 3.0, float(r["y"]) - 3.0, float(r["w"]) + 6.0, float(r["h"]) + 6.0).has_point(c):
			return false
	# (the floor's own: its ways on, its doors, its chests and barrels, its levers, its traps, its waypoint, where the fallen wordsmith lies)
	var near: Array = []
	for p in map.props:
		near.append([Vector2(float(p["x"]), float(p["y"])), 3.0])
	for l in map.levers:
		near.append([Vector2(float(l["x"]), float(l["y"])), 4.0])
	for d in map.doors:
		if d.has("middle"):
			near.append([Vector2(float(d["middle"]["x"]), float(d["middle"]["y"])), 5.0])
	for st0 in map.stairs:
		near.append([Vector2(float(st0["x"]), float(st0["y"])), 6.0])
	if map.waypoint is Dictionary:
		near.append([Vector2(float(map.waypoint["x"]), float(map.waypoint["y"])), 6.0])
	if map.body is Dictionary:
		near.append([Vector2(float(map.body["x"]), float(map.body["y"])), 4.0])
	if map.ways is Dictionary:
		for k in ["way", "stair", "shaft"]:
			var w = map.ways.get(k)
			if w is Dictionary and w.has("x"):
				near.append([Vector2(float(w["x"]), float(w["y"])), 6.0])
		var ex = map.ways.get("exit")
		if ex is Dictionary:
			for t in ex.get("tiles", []):
				near.append([Vector2(int(t) % map.w + 0.5, int(t) / map.w + 0.5), 6.0])
	for e in near:
		if (e[0] as Vector2).distance_to(c) < float(e[1]):
			return false
	var c0 := _gw(turned, gx, gy, -COURT.x / 2 - 1, -1)
	var c1 := _gw(turned, gx, gy, COURT.x / 2 + 1, COURT.y + 1)
	var court := Rect2(minf(c0.x, c1.x), minf(c0.y, c1.y), absf(c1.x - c0.x), absf(c1.y - c0.y))
	for hz in map.hazards:
		if court.intersects(Rect2(float(hz["x"]), float(hz["y"]), float(hz["w"]), float(hz["h"]))):
			return false
	return true


## Every place on the floor a gate fits, in either way a wall runs (Vector3i: gx, gy, 1 turned), in the level's luck's order.
func _spots() -> Array:
	var out: Array = []
	var top: int = map.grown_from if map.grown_from >= 0 else map.h
	for gy in range(BACK.x / 2, top - COURT.y):
		for gx in range(BACK.x / 2, map.w - COURT.y):
			for turned in [false, true]:
				if _fits(gx, gy, turned):
					out.append(Vector3i(gx, gy, 1 if turned else 0))
	for i in range(out.size() - 1, 0, -1):
		var j := _rng.randi_range(0, i)
		var x = out[i]
		out[i] = out[j]
		out[j] = x
	return out


## Gate `n`'s plan at `c`: its altar, its pieces, its hall laid past the south edge and that hall's five waves; {} if it will not do.
func _plan(n: int, c: Vector3i) -> Dictionary:
	var gx := c.x
	var gy := c.y
	var turned := c.z == 1
	var altar := _gw(turned, gx, gy, 0.0, 1.55)
	if not _clear_of_others(altar, 6.0):
		return {}
	# (its hall: one of the Wilds' by the level's luck, in its place past the south edge)
	var H: Dictionary = _src[_rng.randi_range(0, _src.size() - 1)]
	var B: Dictionary = H["box"]
	var across := maxi(1, (map.w - 2) / SLOT.x)
	var ox: int = 2 + (n % across) * SLOT.x
	var oy: int = map.grown_from + GAP + (n / across) * SLOT.y
	if ox + int(B["w"]) > map.w or oy + int(B["h"]) > map.h:
		return {}
	var sh := Vector2i(ox - int(B["x"]), oy - int(B["y"]))
	_carve(H, sh, true)
	var mv := func(r: Dictionary) -> Dictionary:
		var o := r.duplicate()
		o["x"] = float(r["x"]) + sh.x
		o["y"] = float(r["y"]) + sh.y
		return o
	var inside: Dictionary = mv.call(H["inside"])
	var fight: Dictionary = mv.call(H["fight"])
	var waves := _waves(n, inside, Vector2(fight["x"], fight["y"]))
	if waves.is_empty():
		_carve(H, sh, false)
		return {}
	var at := func(a: float, b: float) -> Dictionary:
		var p := _gw(turned, gx, gy, a, b)
		return {"x": p.x, "y": p.y}
	return {"n": n, "gx": gx, "gy": gy, "turned": turned, "altar": {"x": altar.x, "y": altar.y}, "inside": inside, "way": mv.call(H["way"]),
		"entry": mv.call(H["entry"]), "fight": fight, "waves": waves, "look": str(H["place"]), "shift": [sh.x, sh.y],
		"braziers": [at.call(-2.3, 1.1), at.call(2.3, 1.1)],
		# (its banners at the court's front corners, as the Quarry's stand; but not one that would stand before the door on the
		# screen, a front corner straight below it: the sealed door's mark is what is to be seen)
		"banners": [at.call(-2.6, 2.7), at.call(2.6, 2.7)].filter(func(b): return absf(Iso.to_screen(float(b["x"]) - gx, float(b["y"]) - gy).x) > 70.0)}


## A hall's ground laid `sh` tiles from where it lies on its own floor (or taken up again, `lay` false): each tile's kind and whether
## it is walked on, as there; and, on a floor whose steps are counted (height.ts), every step its walked tiles may take.
func _carve(H: Dictionary, sh: Vector2i, lay: bool) -> void:
	var B: Dictionary = H["box"]
	var bw := int(B["w"])
	var bh := int(B["h"])
	var x0 := int(B["x"]) + sh.x
	var y0 := int(B["y"]) + sh.y
	for j in bh:
		for i in bw:
			var t: int = (y0 + j) * map.w + x0 + i
			map.tiles[t] = int(H["tiles"][j * bw + i]) if lay else FloorMap.VOID
			map.walk[t] = int(H["walk"][j * bw + i]) if lay else 0
			if not map.height.is_empty():
				map.height[t] = 0
	if map.step.is_empty():
		return
	for j in bh:
		for i in bw:
			var tx := x0 + i
			var ty := y0 + j
			var bits := 0
			if lay and map.walkable(tx, ty):
				bits = (1 if map.walkable(tx + 1, ty) else 0) | (2 if map.walkable(tx - 1, ty) else 0) | (4 if map.walkable(tx, ty + 1) else 0) | (8 if map.walkable(tx, ty - 1) else 0)
			map.step[ty * map.w + tx] = bits


## The five waves of gate `n`'s hall (QUEST610 hold.make, by the floor's own packs): each pack one of the floor's of that colour, at
## most HOLD_TUNE.pack of it and its leader, coming up out of the hall's floor about the middle of the fight one after another.
func _waves(n: int, r: Dictionary, altar: Vector2, within := INF) -> Array:
	var packs := {}
	for o in mdata.get("monsters", []):
		if bool(o.get("boss", false)) or int(o.get("chained", 0)) != 0 or not monsters._defs.has(str(o["kind"])):
			continue
		var pid := int(o["packId"])
		if not packs.has(pid):
			packs[pid] = []
		packs[pid].append(o)
	var of := {"plain": [], "blue": [], "yellow": []}
	for pid in packs:
		var ms: Array = packs[pid]
		var rs: Array = ms.map(func(o): return str(o.get("rarity", "")))
		if rs.has("leader"):
			of["yellow"].append(ms)
		elif rs.has("blue"):
			of["blue"].append(ms)
		elif not bool(ms[0].get("elite", false)) and not bool(ms[0].get("champion", false)):
			of["plain"].append(ms)
	if of["plain"].is_empty():
		return []
	# (where they come up: the hall's open floor, not by the middle of the fight)
	var spots: Array = []
	for x in range(int(r["x"]) + 1, int(r["x"]) + int(r["w"]) - 1):
		for y in range(int(r["y"]) + 1, int(r["y"]) + int(r["h"]) - 1):
			var p := Vector2(x + 0.5, y + 0.5)
			if map.walkable(x, y) and map.tile(x, y) == FloorMap.FLOOR and p.distance_to(altar) > 2.4 and p.distance_to(altar) < within and map.fits(p.x, p.y, 0.45):
				spots.append(p)
	if spots.size() < 8:
		return []
	var A: Dictionary = Q["arrivals"]
	var out: Array = []
	var make: Array = Q["hold"]["make"]
	for k in make.size():
		var W := {"k": k + 1, "packs": [], "monsters": []}
		var t := 0.0
		for j in (make[k] as Array).size():
			var want_r: String = str(make[k][j]["rarity"])
			var pool: Array = of[want_r] if not (of[want_r] as Array).is_empty() else of["plain"]
			var tpl: Array = pool[_rng.randi_range(0, pool.size() - 1)]
			var pid := 960000 + n * 1000 + (k + 1) * 10 + j
			W["packs"].append(pid)
			var most := int(T["pack"]) + (1 if want_r == "yellow" else 0)
			var take: Array = tpl.duplicate()
			take.sort_custom(func(a, b): return str(a.get("rarity", "")) == "leader" and str(b.get("rarity", "")) != "leader")
			for o in take.slice(0, mini(most, take.size())):
				var d: Dictionary = (o as Dictionary).duplicate(true)
				var p: Vector2 = spots[_rng.randi_range(0, spots.size() - 1)]
				d["x"] = p.x
				d["y"] = p.y
				d["packId"] = pid
				d["state"] = "chase"
				d["cd"] = 0.5
				d["life"] = d["maxLife"]
				d["after"] = t
				d["rise"] = float(A["rise"])
				var size := float(d.get("r", 0.4))
				d["rift"] = float(A["size"]["large"]) if size > 0.6 else (float(A["size"]["medium"]) if size > 0.42 else float(A["size"]["small"]))
				for key in ["royal", "chained", "carries", "id"]:
					d.erase(key)
				W["monsters"].append(d)
				t += float(A["apart"])
		out.append(W)
	return out


# --- its hall (holds.gd): its own look, laid where its ground was, on a layer of its own ---

func _hall_place(n: int) -> String:
	return str(hold(n)["look"])


func _hall_bit(n: int) -> int:
	return EDGE_BIT + n


func _hall_shift(n: int) -> Vector2i:
	var s: Array = hold(n)["shift"]
	return Vector2i(int(s[0]), int(s[1]))


func _hall_n() -> int:
	return data["holds"].size()


# --- its pieces ---

func _sprite(key: String, at: Vector2, k := 0, parent: Node = null) -> Sprite2D:
	var s := Sprite2D.new()
	s.centered = false
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	s.position = Iso.to_screen(at.x, at.y)
	(parent if parent != null else stands).add_child(s)
	_show(s, key, k)
	return s


func _show(s: Sprite2D, key: String, k: int) -> void:
	var F: Array = _frames[key]
	var f: Dictionary = F[k % F.size()]
	s.texture = f["tex"]
	s.offset = -Vector2(f["ox"], f["oy"])


func _block(x: int, y: int) -> void:
	map.walk[y * map.w + x] = 0


## Gate `q` stood up: the gatehouse, its court's flagstones, the altar, its braziers and its banners, their tiles not walked through.
func _stand(q: Dictionary) -> void:
	var n := int(q["n"])
	var P := {"gate": [], "stand": [], "altar": null, "flags": []}
	var gx := int(q["gx"])
	var gy := int(q["gy"])
	var turned := bool(q.get("turned", false))
	var ht: int = map.height[gy * map.w + gx] if not map.height.is_empty() else 0
	# (the court's flagstones, worn down the middle to the door, where the floor is open)
	for b in range(0, 3):
		for a in range(-3, 3):
			var t := _gt(turned, gx, gy, a, b)
			if _court_tile(t.x, t.y, ht):
				var fl := _sprite("flag", Vector2(t.x, t.y), 2 if a == -1 or a == 0 else (t.x + t.y) % 2, flats)
				flats.move_child(fl, 0)
				# (the Quarry's stone in the day, here in a floor's dark: as dim as the floor round it)
				fl.modulate = FLAG_DIM
				P["flags"].append(fl)
	var strips := []
	var f: Dictionary = _frames[_gate_key(turned)][0]
	var at := Iso.to_screen(float(gx), float(gy))
	var x := 0
	while x < int(f["w"]):
		var wide := mini(STRIP, int(f["w"]) - x)
		var s := Sprite2D.new()
		s.centered = false
		s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
		s.region_enabled = true
		# (where along the wall this strip's middle is: a screen x of sx picture pixels from the doorway's middle is sx / HW tiles
		# along the wall (along x, or back along y where it runs that way), so its depth is the doorway's and that much more: sorted
		# sx * HH / HW lower (or higher), and a little more, in front of the wall it stands against; whatever stands on the floor
		# before it is lower still)
		var sx := float(x + wide / 2) - float(f["ox"])
		var lift := (-sx if turned else sx) * Iso.HH / Iso.HW + 4.0
		s.position = at + Vector2(0, lift)
		s.set_meta("x", x)
		s.set_meta("wide", wide)
		s.set_meta("lift", lift)
		stands.add_child(s)
		strips.append(s)
		x += wide
	P["gate"] = strips
	_pieces[n] = P
	_gate_show(n, 0)
	var a := Vector2(q["altar"]["x"], q["altar"]["y"])
	P["altar"] = _sprite("altar_y" if turned else "altar", a)
	for t in _altar_tiles(q):
		_block(t.x, t.y)
	for b in q["braziers"]:
		var p := Vector2(b["x"], b["y"])
		if map.walkable(floori(p.x), floori(p.y)):
			P["stand"].append([_sprite("brazier", p, _rng.randi_range(0, 3)), "brazier"])
			_block(floori(p.x), floori(p.y))
	for b in q["banners"]:
		var p := Vector2(b["x"], b["y"])
		if map.walkable(floori(p.x), floori(p.y)):
			P["stand"].append([_sprite("banner", p, _rng.randi_range(0, 3)), "banner"])
			_block(floori(p.x), floori(p.y))


## The altar's two tiles (b 1, a -1 and 0): not walked through while it stands.
func _altar_tiles(q: Dictionary) -> Array:
	var turned := bool(q.get("turned", false))
	return [_gt(turned, int(q["gx"]), int(q["gy"]), -1, 1), _gt(turned, int(q["gx"]), int(q["gy"]), 0, 1)]


## The pictures a gate is drawn with: THE LEVEL'S OWN FRONT, the art chat's (his words, 25 Nov 2026: “I need the facades of the
## strongholds that you go into to match each of the levels”; “Yes, switch them all on (Recommended)”): the cult's take on its floor's
## own building, the floor whose look the level has (`map.depth`); the Wilds' gatehouse where a floor has none of its own.
func _gate_key(turned: bool) -> String:
	var k := "front_%d%s" % [int(main.map.depth) if main != null and main.map != null else 0, "_y" if turned else ""]
	if _frames.has(k):
		return k
	return "gate_y" if turned else "gate"


## Gate `n`'s gatehouse at frame `k` (0 to 3 the sealed door's mark flickering; 4 the door open).
func _gate_show(n: int, k: int) -> void:
	var F: Array = _frames[_gate_key(bool(hold(n).get("turned", false)))]
	var f: Dictionary = F[clampi(k, 0, F.size() - 1)]
	for s in _pieces[n]["gate"]:
		if not is_instance_valid(s):
			continue
		var x: int = s.get_meta("x")
		var wide: int = s.get_meta("wide")
		s.texture = f["tex"]
		s.region_rect = Rect2(x, 0, wide, int(f["h"]))
		s.offset = Vector2(x - float(f["ox"]), -float(f["oy"]) - float(s.get_meta("lift")))


# --- the altar given its words: the door opened (holds.gd open_door) ---

## OPEN THE DOOR of gate `n`: the words on its altar burned, its seal broken, its door open, the altar gone and its two tiles floor
## again. False: none was given.
func open_door(n: int) -> bool:
	var s: Dictionary = st[n]
	var q := hold(n)
	if s["open"] or s["words"].is_empty():
		return false
	s["open"] = true
	var gx := int(q["gx"])
	var gy := int(q["gy"])
	_gate_show(n, 4)
	var P: Dictionary = _pieces[n]
	if P["altar"] != null and is_instance_valid(P["altar"]):
		P["altar"].queue_free()
	P["altar"] = null
	for t in _altar_tiles(q):
		map.walk[t.y * map.w + t.x] = 1
	var door := _gw(bool(q.get("turned", false)), gx, gy, 0.0, 0.2)
	_tell({"t": "burst", "x": float(q["altar"]["x"]), "y": float(q["altar"]["y"]), "r": 1.2, "el": "fire", "style": "shock", "words": [], "n": 0, "echo": false})
	_tell({"t": "burst", "x": door.x, "y": door.y, "r": 1.6, "el": "fire", "style": "shock", "words": [], "n": 0, "echo": false})
	hero.kick(4.0)
	sfx.play("seal_burn", linear_to_db(0.9))
	var k: int = s["words"].size()
	loot.say("The altar takes %s. The door's seal breaks." % ("the word" if k == 1 else "%d words" % k), MSG_WORD)
	return true


## (its doorway and where he comes out, by its own measures: in a wall along y, the two tiles (gx, gy - 1) and (gx, gy))
func _at_door(q: Dictionary, h: Vector2) -> bool:
	if not bool(q.get("turned", false)):
		return super._at_door(q, h)
	var gx := int(q["gx"])
	var gy := int(q["gy"])
	return floori(h.x) == gx and (floori(h.y) == gy - 1 or floori(h.y) == gy) and h.x < gx + 0.6


func _out_at(q: Dictionary) -> Vector2:
	return _gw(bool(q.get("turned", false)), float(q["gx"]), float(q["gy"]), -1.5, 1.5)


func _exit_tree() -> void:
	super._exit_tree()
	for l in [_rifts, _glow]:
		if l != null and is_instance_valid(l):
			l.queue_free()


## (a stronghold's own step, holds.gd: the altar's prompt, the door, the hall, its waves; and its pieces stirring)
func _process(dt: float) -> void:
	super._process(dt)
	_animate(dt)


func _animate(_dt: float) -> void:
	if _glow == null:
		return
	for n in _pieces:
		var P: Dictionary = _pieces[n]
		for e in P["stand"]:
			if is_instance_valid(e[0]):
				_show(e[0], e[1], int(_t * FPS[e[1]] + e[0].get_instance_id() % 4))
		if not st[n]["open"]:
			_gate_show(n, int(_t * FPS["gate"]) % 4)
	_glow.queue_redraw()
	# (their light in the dark: render.ts spot, as a cult brazier's own, and the mark burning on the sealed door: look.gd spot, game
	# pixels)
	if look != null and is_instance_valid(look) and inside < 0:
		for n in _pieces:
			var q := hold(n)
			for b in q["braziers"]:
				var p := Iso.to_screen(float(b["x"]), float(b["y"])) / 2.0
				look.spot(p - Vector2(0, 24), 40.0, 0.55)
			look.spot(Iso.to_screen(float(q["gx"]), float(q["gy"])) / 2.0 - Vector2(-4 if bool(q.get("turned", false)) else 4, 40), 46.0 if not st[n]["open"] else 30.0, 0.5)


## THEIR GLOW ON THE FLOOR: the cult's pink, round each brazier and before the sealed door (the enemy's glow, his rule), soft, on the
## floor under everything that stands.
class _Glow extends Node2D:
	const PINK := Color("#ff4f8a")
	var rooms

	func _draw() -> void:
		var R = rooms
		for n in R._pieces:
			var q: Dictionary = R.hold(n)
			for b in q["braziers"]:
				_pool(Iso.to_screen(float(b["x"]), float(b["y"])), 70.0, 0.16)
			if not R.st[n]["open"]:
				var d: Vector2 = R._gw(bool(q.get("turned", false)), float(q["gx"]), float(q["gy"]), -0.2, 0.4)
				_pool(Iso.to_screen(d.x, d.y), 60.0, 0.14)

	func _pool(c: Vector2, r: float, a: float) -> void:
		for i in 5:
			var k := 1.0 - i / 5.0
			var pts := PackedVector2Array()
			for j in 24:
				var t := float(j) / 24.0 * TAU
				pts.append(c + Vector2(cos(t) * r * k, sin(t) * r * k * 0.5))
			draw_colored_polygon(pts, Color(PINK, a / 5.0))
