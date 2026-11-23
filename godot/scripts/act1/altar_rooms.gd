## STRONGHOLDS ON ANY ENDLESS LEVEL: THE CULT'S ALTAR ROOM (his words, 23 Nov 2026: “In endless mode I want multiple chained and
## stronghold encounters per level.  And I want these random encounters, (chained, stronghold, muffled bells, and royal cards) to
## show up in any level.  So it's more random.”; asked whether a floor with no stronghold's hall should have the cult's altar in one
## of its rooms, the room sealing and the waves rising there, his “Yes and yes”, 22 Nov 2026, 21:23 Eastern). On an endless level
## of a floor with no strongholds of its own (all but floors 6 to 10, whose own stay as they are), N of the floor's ordinary rooms
## each hold the cult's altar, as a stronghold's door has it (act1/holds.gd, whose rules these are: this script is that one, its
## door and hall made a room):
##   THE ROOM: one of the floor's ordinary rooms, big enough, off the way in, with no door of its own, no chained rare in it and away
##     from the Bells; the altar of the words in its middle (art/act1_cult.ts wordAltar), a brazier of the cult's pink fire at each
##     end of it (pinkBrazier), the cult's banners by its back walls (cultBanner): tools/godot_altar_room.ts.
##   THE ALTAR: E within HOLD_TUNE.near: the gear screen with the altar beside it (inventory.gd, THE ALTAR OF THE WORDS), up to three
##     spare words laid and taken back free; WAKE THE ALTAR burns them.
##   THE ROOM SEALS: the cult's pink fire stands up in every doorway of the room (THE WARD), wall to everything, and the room's five
##     waves (HOLD_WAVES) rise out of rifts in its floor as a hall's do: of the floor's own packs (QUEST610 hold.make: plain, two
##     plain, blue and plain, two blue, a yellow and a blue), each with the words burned, harder for each word past the first and
##     each wave on (holds.gd wave).
##   THE REWARD, the last dead: a hall's (holds.gd _won: runedust, gear, gold, a page of the muster roll), and the fire in the
##     doorways falls.
## ON: pictures first (docs/mockups/altar_room/); until his yes, no altar room is laid.
extends "res://scripts/act1/holds.gd"

const AR_DIR := "res://assets/altar_room/"
const FloorMap := preload("res://scripts/floor_map.gd")
static var ON := false
## (altar rooms on a level; a room at least this many tiles each way; its middle this far from where he comes in; two rooms' middles
## this far apart; a room with more doorway tiles than this is open ground, not a room)
const N := 2
const SIZE := 7
const FAR := 14.0
const APART := 14.0
const WAYS_MOST := 12
## (A RING OF FIRE, where the floor has too few rooms that close (the city's streets): the altar on open floor, and as it wakes the
## cult's fire springs up in a ring round it this far out, its band this wide, so none comes in or goes out but by the waves' end)
const RING := 5.0
const BAND := 1.5
## (the pieces' pictures' frames a second: the braziers' fire, the banners stirring, the ward's fire)
const FPS := {"brazier": 8.0, "banner": 6.0, "ward": 8.0}
const PINK := Color("#ff4f8a")

## (that it is an altar room, for the altar's half of the gear screen: inventory.gd)
var altar_room := true
## (the floor's monsters, their packs the waves are made of; the level's luck, or -1)
var mdata: Dictionary = {}
var seed := -1
var _rng := RandomNumberGenerator.new()
var _table := {}
var _frames := {}
## (each room's pieces: {"stand": [[Sprite2D, key]], "ward": [[Sprite2D, tile]], "ward_t": seconds since it rose, or -1}
var _pieces := {}
var _glow: Node2D


## Is there to be an altar room here: on, an endless level, a floor that has no strongholds of its own.
static func wanted(main, where: String) -> bool:
	return ON and bool(main.in_endless) and where.begins_with("floor") and not FileAccess.file_exists(file_of(int(main.map.depth)))


func _ready() -> void:
	Q = JSON.parse_string(FileAccess.get_file_as_string("res://assets/act1/quest610.json"))
	T = Q["hold"]["tune"]
	_table = JSON.parse_string(FileAccess.get_file_as_string(AR_DIR + "altar_room.json"))
	for k in ["altar", "brazier", "banner", "ward"]:
		_frames[k] = (_table[k] as Array).map(func(f): return {"tex": load(AR_DIR + str(f["file"])), "ox": float(f["ox"]), "oy": float(f["oy"])})
	data = {"holds": [], "defs": {}, "power": maxi(1, int(loot.power()))}
	if seed >= 0:
		_rng.seed = seed
	else:
		_rng.randomize()
	for r in _rooms():
		if data["holds"].size() >= N:
			break
		_keep(_plan(data["holds"].size(), r))
	# (too few rooms that close: a ring of fire on open floor for the rest)
	for k in 80:
		if data["holds"].size() >= N:
			break
		var t := Vector2i(_rng.randi_range(0, map.w - 1), _rng.randi_range(0, map.h - 1))
		_keep(_plan_ring(data["holds"].size(), Vector2(t.x + 0.5, t.y + 0.5)))
	if data["holds"].is_empty():
		return
	_rifts = _RiftLayer.new()
	_rifts.holds = self
	flats.add_child(_rifts)
	_glow = _Glow.new()
	_glow.rooms = self
	flats.add_child(_glow)
	for q in data["holds"]:
		_stand(q)


# --- where they are ---

func _keep(q: Dictionary) -> void:
	if q.is_empty():
		return
	data["holds"].append(q)
	st.append({"words": [], "open": false, "entered": false, "won": false, "wave": 0, "packs": [], "coming": false})


## Not near a chained rare, the Bells or another altar.
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
	return true


## The altar's two tiles along x, open and clear round them, at or next to `c`; null if none.
func _altar_at(c: Vector2):
	for k in 9:
		var cand := Vector2i(floori(c.x) + [0, 1, -1, 0, 0, 1, -1, 1, -1][k], floori(c.y) + [0, 0, 0, 1, -1, 1, 1, -1, -1][k])
		var ok := true
		for dx in range(-3, 3):
			for dy in range(-1, 2):
				if not map.walkable(cand.x + dx, cand.y + dy) or map.tile(cand.x + dx, cand.y + dy) != FloorMap.FLOOR:
					ok = false
		if ok:
			return cand
	return null


## A RING OF FIRE's plan, its altar at or next to `c` on open floor: the ring's tiles, its waves, its pieces; {} if it will not do.
func _plan_ring(n: int, c: Vector2) -> Dictionary:
	if c.distance_to(map.start) < FAR or not _clear_of_others(c, RING + 4.0):
		return {}
	for r in map.rooms:
		if str(r.get("kind", "")) in ["start", "boss"] and Rect2(float(r["x"]) - 2.0, float(r["y"]) - 2.0, float(r["w"]) + 4.0, float(r["h"]) + 4.0).has_point(c):
			return {}
	var at = _altar_at(c)
	if at == null:
		return {}
	var gx: int = at.x
	var gy: int = at.y
	var altar := Vector2(gx, gy + 0.5)
	# (the ring: the open floor in its band; and inside it enough open floor for the waves)
	var ways: Array = []
	var inner := 0
	var R := ceili(RING + BAND)
	for ty in range(gy - R, gy + R + 1):
		for tx in range(gx - R, gx + R + 1):
			var d := Vector2(tx + 0.5, ty + 0.5).distance_to(altar)
			if not map.walkable(tx, ty) or map.tile(tx, ty) != FloorMap.FLOOR:
				continue
			if d >= RING - BAND / 2.0 and d < RING + BAND / 2.0:
				ways.append(Vector2i(tx, ty))
			elif d < RING - BAND / 2.0:
				inner += 1
	if inner < 40:
		return {}
	var box := {"x": gx - int(RING), "y": gy - int(RING), "w": int(RING) * 2, "h": int(RING) * 2}
	var waves := _waves(n, box, altar, RING - BAND)
	if waves.is_empty():
		return {}
	return {"n": n, "ring": true, "room": box, "gx": gx, "gy": gy, "altar": {"x": altar.x, "y": altar.y},
		"fight": {"x": altar.x, "y": altar.y + 1.5}, "ways": ways, "waves": waves,
		"braziers": [{"x": gx - 2.5, "y": gy + 0.5}, {"x": gx + 2.5, "y": gy + 0.5}],
		"banners": [{"x": gx - 1.0, "y": gy - 1.5}, {"x": gx - 2.0, "y": gy - 0.5}]}

## The floor's rooms that may hold an altar, in the level's luck's order.
func _rooms() -> Array:
	var doored := {}
	for d in map.doors:
		doored[int(d.get("room", -1))] = true
	var out: Array = []
	for r in map.rooms:
		if not str(r.get("kind", "")) in ["normal", "elite"] or int(r["w"]) < SIZE or int(r["h"]) < SIZE or doored.has(int(r["id"])):
			continue
		var c := Vector2(float(r["x"]) + float(r["w"]) / 2.0, float(r["y"]) + float(r["h"]) / 2.0)
		if c.distance_to(map.start) < FAR:
			continue
		var box := Rect2(float(r["x"]) - 1.0, float(r["y"]) - 1.0, float(r["w"]) + 2.0, float(r["h"]) + 2.0)
		# (no chained rare in it)
		var held := false
		for o in monsters.list:
			if is_instance_valid(o) and int(o.get("chained")) != 0 and box.has_point(o.world):
				held = true
		if held:
			continue
		# (away from the Bells: their Muffled Bell and every bell)
		var B: Dictionary = monsters.bells if monsters.bells is Dictionary else {}
		var plan: Dictionary = B.get("D", B).get("plan", {}) if not B.is_empty() else {}
		var near_bells := false
		for p in ([plan.get("muffled")] + plan.get("bells", [])):
			if p is Dictionary and p.has("x") and box.grow(3.0).has_point(Vector2(float(p["x"]), float(p["y"]))):
				near_bells = true
		if near_bells:
			continue
		out.append(r)
	for i in range(out.size() - 1, 0, -1):
		var j := _rng.randi_range(0, i)
		var x = out[i]
		out[i] = out[j]
		out[j] = x
	return out


## A room's plan: its altar in its middle, its pieces, its doorways, its five waves; {} if it will not do.
func _plan(n: int, r: Dictionary) -> Dictionary:
	var rx := int(r["x"])
	var ry := int(r["y"])
	var rw := int(r["w"])
	var rh := int(r["h"])
	var c := Vector2(rx + rw / 2.0, ry + rh / 2.0)
	if not _clear_of_others(c, 0.0):
		return {}
	# (its doorways: the floor in the ring of wall round it)
	var ways: Array = []
	for x in range(rx - 1, rx + rw + 1):
		for y in [ry - 1, ry + rh]:
			if map.tile(x, y) == FloorMap.FLOOR and map.walkable(x, y):
				ways.append(Vector2i(x, y))
	for y in range(ry, ry + rh):
		for x in [rx - 1, rx + rw]:
			if map.tile(x, y) == FloorMap.FLOOR and map.walkable(x, y):
				ways.append(Vector2i(x, y))
	if ways.is_empty() or ways.size() > WAYS_MOST:
		return {}
	# (the altar: two tiles along x, open and clear round them, as near the middle as there are)
	var at = _altar_at(c)
	if at == null:
		return {}
	var gx: int = at.x
	var gy: int = at.y
	var altar := Vector2(gx, gy + 0.5)
	var waves := _waves(n, r, altar)
	if waves.is_empty():
		return {}
	return {"n": n, "room": {"x": rx, "y": ry, "w": rw, "h": rh}, "gx": gx, "gy": gy, "altar": {"x": altar.x, "y": altar.y},
		"fight": {"x": altar.x, "y": altar.y + 1.5}, "ways": ways, "waves": waves,
		"braziers": [{"x": gx - 2.5, "y": gy + 0.5}, {"x": gx + 2.5, "y": gy + 0.5}],
		"banners": [{"x": gx - 1.0, "y": gy - 1.5}, {"x": gx - 2.0, "y": gy - 0.5}]}


## The five waves of room `n` (QUEST610 hold.make, by the floor's own packs): each pack one of the floor's of that colour, at most
## HOLD_TUNE.pack of it and its leader, coming up out of the room's floor about the altar one after another.
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
	# (where they come up: the room's open floor, not by the altar, not in a doorway)
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
			var want: String = str(make[k][j]["rarity"])
			var pool: Array = of[want] if not (of[want] as Array).is_empty() else of["plain"]
			var tpl: Array = pool[_rng.randi_range(0, pool.size() - 1)]
			var pid := 960000 + n * 1000 + (k + 1) * 10 + j
			W["packs"].append(pid)
			var most := int(T["pack"]) + (1 if want == "yellow" else 0)
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


# --- its pieces ---

func _sprite(key: String, at: Vector2, k := 0) -> Sprite2D:
	var s := Sprite2D.new()
	s.centered = false
	s.texture_filter = CanvasItem.TEXTURE_FILTER_NEAREST
	s.position = Iso.to_screen(at.x, at.y)
	stands.add_child(s)
	_show(s, key, k)
	return s


func _show(s: Sprite2D, key: String, k: int) -> void:
	var F: Array = _frames[key]
	var f: Dictionary = F[k % F.size()]
	s.texture = f["tex"]
	s.offset = -Vector2(f["ox"], f["oy"])


func _block(x: int, y: int) -> void:
	map.walk[y * map.w + x] = 0


## Room `q`'s altar, its braziers and its banners stood up, their tiles not walked through.
func _stand(q: Dictionary) -> void:
	var P := {"stand": [], "ward": [], "ward_t": -1.0}
	var a := Vector2(q["altar"]["x"], q["altar"]["y"])
	P["stand"].append([_sprite("altar", a), "altar"])
	_block(int(q["gx"]), int(q["gy"]))
	_block(int(q["gx"]) - 1, int(q["gy"]))
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
	_pieces[int(q["n"])] = P


# --- the altar woken: the room sealed (holds.gd open_door, a room's) ---

## WAKE THE ALTAR of room `n`: the words on it burned, the cult's fire up in every doorway, its first wave coming. False: none given.
func open_door(n: int) -> bool:
	var s: Dictionary = st[n]
	var q := hold(n)
	if s["open"] or s["words"].is_empty():
		return false
	s["open"] = true
	s["entered"] = true
	var a := Vector2(q["altar"]["x"], q["altar"]["y"])
	_tell({"t": "burst", "x": a.x, "y": a.y, "r": 1.4, "el": "fire", "style": "shock", "words": [], "n": 0, "echo": false})
	var P: Dictionary = _pieces[n]
	var r: Dictionary = q["room"]
	for t in q["ways"]:
		var tile: Vector2i = t
		_block(tile.x, tile.y)
		# (a doorway's tile: two tongues of it along the wall's line; a ring's: one)
		var at: Array = [Vector2(0.5, 0.5)]
		if not q.get("ring", false):
			var along_x: bool = tile.y < int(r["y"]) or tile.y >= int(r["y"]) + int(r["h"])
			at = [Vector2(0.25, 0.5), Vector2(0.75, 0.5)] if along_x else [Vector2(0.5, 0.25), Vector2(0.5, 0.75)]
		for o in at:
			var ws := _sprite("ward", Vector2(tile.x, tile.y) + o, _rng.randi_range(0, 3))
			ws.scale = Vector2(1, 0.05)
			P["ward"].append([ws, tile])
	P["ward_t"] = 0.0
	hero.kick(4.0)
	sfx.play("seal_burn", linear_to_db(0.9))
	var k: int = s["words"].size()
	loot.say("The altar takes %s. %s" % ["the word" if k == 1 else "%d words" % k, "A ring of fire springs up." if q.get("ring", false) else "Fire bars the way out."], MSG_WORD)
	if bool(Q["hold"]["waves"]["on"]):
		_after(0.6, func(): wave(n, 1))
	return true


## Its last wave dead: a hall's reward (holds.gd _won), and the fire in the doorways falls.
func _won(n: int) -> void:
	super._won(n)
	var q := hold(n)
	var P: Dictionary = _pieces[n]
	for w in P["ward"]:
		var tile: Vector2i = w[1]
		map.walk[tile.y * map.w + tile.x] = 1
		_tell({"t": "burst", "x": tile.x + 0.5, "y": tile.y + 0.5, "r": 0.8, "el": "fire", "style": "shock", "words": [], "n": 0, "echo": false})
		w[0].queue_free()
	P["ward"] = []
	P["ward_t"] = -1.0
	loot.say("The ring of fire falls." if q.get("ring", false) else "The fire in the doorways falls.", MSG_GOOD)


func _exit_tree() -> void:
	super._exit_tree()
	for l in [_rifts, _glow]:
		if l != null and is_instance_valid(l):
			l.queue_free()


## (the room's own step, in place of a hall's: the altar's prompt, the waves one after another; no door, no hall)
func _process(dt: float) -> void:
	_t += dt
	_step_later(dt)
	_step_risers(dt)
	_animate(dt)
	prompt = ["", -1]
	if hero == null or main._going or not hero.alive:
		return
	var an := altar_near()
	if an >= 0:
		prompt = ["E: Altar: give words to wake it", an]
		if Input.is_action_just_pressed("interact") and not main._inv.visible:
			main._inv.open_altar(an, self)
	var waves: Dictionary = Q["hold"]["waves"]
	for q in data["holds"]:
		var n := int(q["n"])
		var s: Dictionary = st[n]
		if not s["entered"] or s["won"] or int(s["wave"]) == 0 or s["coming"] or _alive(s["packs"]) or _rising(s["packs"]):
			continue
		if bool(waves["on"]) and int(s["wave"]) < int(waves["n"]):
			s["coming"] = true
			var next := int(s["wave"]) + 1
			_after(float(waves["gap"]), func(): wave(n, next))
			continue
		_won(n)


func _animate(dt: float) -> void:
	if _glow == null:
		return
	for n in _pieces:
		var P: Dictionary = _pieces[n]
		for e in P["stand"]:
			if e[1] != "altar" and is_instance_valid(e[0]):
				_show(e[0], e[1], int(_t * FPS[e[1]] + e[0].get_instance_id() % 4))
		if float(P["ward_t"]) >= 0.0:
			P["ward_t"] = float(P["ward_t"]) + dt
			var up := minf(1.0, float(P["ward_t"]) / 0.45)
			for w in P["ward"]:
				if is_instance_valid(w[0]):
					w[0].scale = Vector2(1, 0.05 + 0.95 * (1.0 - (1.0 - up) * (1.0 - up)))
					_show(w[0], "ward", int(_t * FPS["ward"]) + int(w[1].x + w[1].y))
	_glow.queue_redraw()
	# (their light in the dark: render.ts spot, as a cult brazier's own: look.gd spot, game pixels)
	if look != null and is_instance_valid(look):
		for n in _pieces:
			var q := hold(n)
			for b in q["braziers"]:
				var p := Iso.to_screen(float(b["x"]), float(b["y"])) / 2.0
				look.spot(p - Vector2(0, 24), 40.0, 0.55)
			var wards: Array = _pieces[n]["ward"]
			var step := maxi(1, ceili(wards.size() / 8.0))
			for i in range(0, wards.size(), step):
				var tile: Vector2i = wards[i][1]
				look.spot(Iso.to_screen(tile.x + 0.5, tile.y + 0.5) / 2.0 - Vector2(0, 10), 24.0 + 8.0 * (step - 1), 0.45)


## THEIR GLOW ON THE FLOOR: the cult's pink, round each brazier and each doorway's fire (the enemy's glow, his rule), soft, on the
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
			for w in R._pieces[n]["ward"]:
				var tile: Vector2i = w[1]
				_pool(Iso.to_screen(tile.x + 0.5, tile.y + 0.5), 44.0, 0.2)

	func _pool(c: Vector2, r: float, a: float) -> void:
		for i in 5:
			var k := 1.0 - i / 5.0
			var pts := PackedVector2Array()
			for j in 24:
				var t := float(j) / 24.0 * TAU
				pts.append(c + Vector2(cos(t) * r * k, sin(t) * r * k * 0.5))
			draw_colored_polygon(pts, Color(PINK, a / 5.0))
