## What the monsters' moves mark on the floor, and what each does when its time comes (game.ts zones and perils; game/
## action_f1.ts). Pink and gold are the enemy's (CLAUDE.md: what glows on a friend is cyan). Drawn on the floor, under
## everyone. THE RED CIRCLE AND THE CHARGE'S LANE ARE THE GAME'S OWN, drawn as it draws them (render.ts 'warn',
## art/charge_lane.ts); the game's own pictures of the others (render/act1_fx, art/action_f1_fx.ts) are to come: stand-ins.
##   warn  a slam's red circle: when its time is out, whoever is within it (and 0.1) is struck.
##   lane  a charge's line, from the troll through where the hero stood and on: drawn while he winds up and as he runs it.
##   aim   the marksman's line of aim, run out as he draws (it follows the hero until 0.4 s before he looses).
##   rain  the arrow rain's ring, where the hero stood as the archer loosed: struck 1.5 s later, the arrows standing a while.
##   bars  the Lockdown: the bars' shadows in rows across the Warden's hall as his keys go up; at the crash a hero within 0.42
##         of a row is struck, a cell is safe; then the bars stand 1.5 s as a cage the hero cannot walk through.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const MM := preload("res://scripts/monster_moves.gd")

const ENEMY := Color(0.96, 0.27, 0.47)
## (art/palette.ts P.bl3, bl4, bl5: the reds of the game's warning circle and of a charge's lane)
const BL3 := Color("#a81c2c")
const BL4 := Color("#e03c44")
const BL5 := Color("#ff8a80")
## (art/mkit.ts FLAME[2], FLAME[3]: the enemy's pink and its gold, of the bosses' dotted marks)
const FLAME0 := Color("#7a1058")
const FLAME2 := Color("#ff4f8a")
const FLAME3 := Color("#ffb070")
var _air: Node2D
## (the screen's own clock, for marks whose dots run: seconds)
var _clock := 0.0
## (the Chained One's hook or ball in flight, a picture among what stands: by whose it is)
var _flung := {}
const GOLD := Color(1.0, 0.78, 0.35)
const SHADOW := Color(0.02, 0.02, 0.07)

var map: FloorMap
var hero  # hero.gd
var sfx  # sfx.gd
var list: Array = []
## (what stands on the floor, in the painter's order: a film's `behind` and `before` layers stand among the figures there)
var stands: Node2D

## THE GAME'S OWN FILMS OF WHAT ITS MOVES MARK AND THROW UP (assets/fx: tools/godot_fx.ts, painted by the game's own painters
## as render/act1_fx asks for them): each {fps, n, layers: {floor, behind, before}: for each frame a picture, or -1}; a
## picture [sheet, x, y, w, h, ox, oy], (ox, oy) where its top left lies from the film's floor point (picture pixels).
## THE SHEETS ARE NOT ALL HELD AT ONCE: each kind of monster's films are on sheets of their own (`sets`, and `kinds`: which
## sets a kind plays); a floor fetches those of the kinds on it as it begins, behind the game (warm), and lets the others go;
## one wanted that was not fetched is loaded there and then (_sheet).
const FX_DIR := "res://assets/fx/"
static var _fx := {}
static var _fx_sheets: Array = []
static var _fx_asked := {}


func warn(x: float, y: float, r: float, dur: float, dmg: float, src: Object) -> void:
	list.append({"kind": "warn", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "dmg": dmg, "src": src})


func lane(src: Object, a: Vector2, b: Vector2, half: float, dur: float) -> void:
	list.append({"kind": "lane", "a": a, "b": b, "half": half, "t": 0.0, "dur": dur, "gone": 0.0, "src": src})


func aim(src: Object, a: Vector2, b: Vector2, dur: float) -> Dictionary:
	var p := {"kind": "aim", "a": a, "b": b, "t": 0.0, "dur": dur, "src": src}
	list.append(p)
	return p


## `from`, `face`: where its archer stood and the way it faced as it loosed (for what it loosed, flying up over it).
func rain(x: float, y: float, dmg: float, from := Vector2.INF, face := Vector2.ZERO) -> void:
	var sticks := PackedVector2Array()
	for i in 26:
		var ang := randf() * TAU
		var d := sqrt(randf()) * MM.RAIN["radius"]
		sticks.append(Vector2(x + cos(ang) * d, y + sin(ang) * d))
	list.append({"kind": "rain", "x": x, "y": y, "t": 0.0, "dmg": dmg, "done": false, "sticks": sticks, "from": from, "face": face})


## The Lockdown, cast with the Warden at (x, y): its rows across the room he stands in (action_f1.ts barRows).
func bars(src: Object, x: float, y: float, dmg: float, windup: float) -> void:
	var room = _room_at(x, y)
	if room == null:
		return
	var cell: float = MM.LOCKDOWN["cell"]
	var reach: float = maxf(room["w"], room["h"]) + cell
	var rows_x := PackedFloat32Array()  # rows along x, at a fixed y
	var rows_y := PackedFloat32Array()  # rows along y, at a fixed x
	for k in range(-ceili(reach / cell) - 1, ceili(reach / cell) + 2):
		var d := cell / 2.0 + k * cell
		if absf(d) > reach:
			continue
		if y + d > room["y"] and y + d < room["y"] + room["h"]:
			rows_x.append(y + d)
		if x + d > room["x"] and x + d < room["x"] + room["w"]:
			rows_y.append(x + d)
	list.append({"kind": "bars", "x": x, "y": y, "t": -windup, "dmg": dmg, "done": false, "src": src, "room": room, "rx": rows_x, "ry": rows_y})


## A monster that falls takes its marks with it (game.ts: its warn, lane and aim go).
## A red circle marked on the floor for `dur` seconds, harmless of itself (the Headsman's vault: his own blow does the harm).
func mark(x: float, y: float, r: float, dur: float, src: Object) -> void:
	list.append({"kind": "warn", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "dmg": 0.0, "src": src, "mark": true})


## A ring going out over the floor where a blow came down.
func blast(x: float, y: float, r: float) -> void:
	list.append({"kind": "blast", "x": x, "y": y, "r": r, "t": 0.0})


## THE CULTIST'S FIRE SIGIL (game/action_f2.ts): its clock from -windup (the cast) to its eruption at 0, then the floor burning.
func sigil(x: float, y: float, dmg: float, windup: float, src: Object) -> void:
	list.append({"kind": "sigil", "x": x, "y": y, "t": -windup, "cast": windup, "dmg": dmg, "src": src, "done": 0})


## THE SHADE'S RIME (game/action_f2.ts): frost on the floor that slows the hero while he stands in it.
func rime(x: float, y: float, src: Object) -> void:
	list.append({"kind": "rime", "x": x, "y": y, "t": 0.0, "src": src})


## THE GREEN TROLL'S SLAM (game/action_f3.ts RING_PERIL; art/action_f3_fx.ts RING): the ring going out over the floor from
## where his club came down, and the cracks it leaves (drawn only: the blow is the slam's own).
func ring(x: float, y: float, r: float) -> void:
	list.append({"kind": "ring", "x": x, "y": y, "r": r, "t": 0.0})


## THE BONEWARD'S SPEAR, LYING WHERE IT CAME DOWN (game.ts laySpear), until its Boneward picks it up (or falls).
func spear(at: Vector2, way: Vector2, src: Object) -> void:
	list.append({"kind": "spear", "x": at.x, "y": at.y, "way": way, "t": 0.0, "src": src})


## THE HIGH PRIEST'S BURNING SMOKE (game.ts swingCenser, the 'smoke' zone; defs.ts SMOKE): settled on the floor, it burns
## whoever is in it (and half his own width more) every `tick`, from the moment it settles, `dmg` each time.
func smoke(x: float, y: float, dmg: float, src: Object) -> void:
	list.append({"kind": "smoke", "x": x, "y": y, "t": 0.0, "dmg": dmg, "tick": 0.0, "src": src})


## THE HERO FALLEN AND COME BACK: what his enemies had sent out is gone, and what of it stood among the figures with it; a
## Boneward's spear still lies where it fell (its Boneward, put back to sleep, is still bare-handed).
func clear() -> void:
	var keep: Array = []
	for p in list:
		if p["kind"] == "spear":
			keep.append(p)
		else:
			_film_free(p)
	list = keep


func drop(src: Object, kinds := ["warn", "lane", "aim"]) -> void:
	for p in list:
		if p.get("src") == src and p["kind"] in kinds:
			_film_free(p)
	list = list.filter(func(p): return not (p.get("src") == src and p["kind"] in kinds))


func _ready() -> void:
	_air = _Air.new()
	_air.perils = self
	_air.z_index = 40
	add_child(_air)
	if _fx.is_empty():
		_fx = {"films": {}, "pics": [], "sheets": []}
		if FileAccess.file_exists(FX_DIR + "fx.json"):
			_fx = JSON.parse_string(FileAccess.get_file_as_string(FX_DIR + "fx.json"))
			_fx_sheets.resize(_fx["sheets"].size())


## A sheet of the films' pictures: loaded when first wanted, if the floor did not fetch it as it began.
static func _sheet(i: int) -> Texture2D:
	if _fx_sheets[i] == null:
		var path: String = FX_DIR + str(_fx["sheets"][i])
		if _fx_asked.has(i):
			_fx_asked.erase(i)
			_fx_sheets[i] = ResourceLoader.load_threaded_get(path)
		else:
			_fx_sheets[i] = load(path)
	return _fx_sheets[i]


## THE FLOOR BEGUN, with these kinds of monster on it: the sheets of their films are fetched now, behind the game, and those
## of kinds that are not here let go.
func warm(kinds: Array) -> void:
	var want := {}
	for k in kinds:
		for s in _fx.get("kinds", {}).get(k, []):
			for i in _fx.get("sets", {}).get(s, []):
				want[int(i)] = true
	for i in _fx_sheets.size():
		var path: String = FX_DIR + str(_fx["sheets"][i])
		if want.has(i):
			if _fx_sheets[i] == null and not _fx_asked.has(i):
				_fx_asked[i] = true
				ResourceLoader.load_threaded_request(path)
		else:
			if _fx_asked.has(i):
				# (asked for and never wanted: taken, and let go)
				_fx_asked.erase(i)
				ResourceLoader.load_threaded_get(path)
			_fx_sheets[i] = null


## Whether the game's own film of that name is there.
func has_film(name: String) -> bool:
	return _fx.get("films", {}).has(name)


## The frame of a film `t` seconds of its own time in (-1: over, or before it). A film may begin before its time 0 (`k0`).
func _film_frame(name: String, t: float) -> int:
	var F: Dictionary = _fx["films"][name]
	var k := floori(t * float(F["fps"]) + 1e-6) - int(F.get("k0", 0))
	return k if k >= 0 and k < int(F["n"]) else -1


## A picture of a film's layer, by its number in it, drawn with its floor point at `at` (picture pixels) on `c`.
func _film_pic(c: CanvasItem, name: String, layer: String, i: int, at: Vector2, flip := false) -> void:
	var L: Array = _fx["films"][name]["layers"].get(layer, [])
	if i < 0 or i >= L.size() or int(L[i]) < 0:
		return
	var q: Array = _fx["pics"][int(L[i])]
	# (`flip`: mirrored about its floor point, as the game turns a picture over: a rect of less than no width draws it turned
	# over, in the same place: its left edge where the turned picture's is)
	var r := Rect2(at.x - float(q[5]) - float(q[3]), at.y + float(q[6]), -float(q[3]), float(q[4])) if flip else Rect2(at + Vector2(q[5], q[6]), Vector2(q[3], q[4]))
	c.draw_texture_rect_region(_sheet(int(q[0])), r, Rect2(q[1], q[2], q[3], q[4]))


## A film's floor layer at its frame, drawn at a place on the floor (in _draw: under the figures); `flip`: turned over about it.
func _film_floor(name: String, t: float, at: Vector2, flip := false) -> void:
	_film_pic(self, name, "floor", _film_frame(name, t), Iso.to_screen(at.x, at.y), flip)


## A film's layers that stand among the figures: `behind` and `before`, just behind and just before one standing at its
## middle (render/act1_fx: c.stand at depth -0.02 and +0.02), and `stand`, at its own depth: each a picture among what stands,
## kept with the mark and gone with it.
func _film_stands(p: Dictionary, name: String, t: float, at: Vector2) -> void:
	if stands == null:
		return
	var k := _film_frame(name, t)
	var F: Dictionary = _fx["films"][name]
	var scr := Iso.to_screen(at.x, at.y)
	for layer: String in ["behind", "before", "stand"]:
		if not F["layers"].has(layer):
			continue
		var key: String = "fx_" + layer
		var s = p.get(key)
		var i := int(F["layers"][layer][k]) if k >= 0 else -1
		if s == null or not is_instance_valid(s):
			if i < 0:
				continue
			s = Sprite2D.new()
			s.centered = false
			s.region_enabled = true
			stands.add_child(s)
			p[key] = s
		s.visible = i >= 0
		if i < 0:
			continue
		var q: Array = _fx["pics"][i]
		var d := at.x + at.y + (-0.02 if layer == "behind" else (0.02 if layer == "before" else 0.0))
		s.texture = _sheet(int(q[0]))
		s.region_rect = Rect2(q[1], q[2], q[3], q[4])
		s.position = Vector2(scr.x, d * 16.0)
		s.offset = Vector2(q[5], q[6] + scr.y - d * 16.0)


## A mark gone: what of its film stood among the figures goes with it.
func _film_free(p: Dictionary) -> void:
	for s in p.get("hands", {}).values():
		if is_instance_valid(s):
			s.queue_free()
	p.erase("hands")
	for s in p.get("fx_pool", []):
		if is_instance_valid(s):
			s.queue_free()
	p.erase("fx_pool")
	for key: String in ["fx_behind", "fx_before", "fx_stand", "fx_rise"]:
		var s = p.get(key)
		if s != null and is_instance_valid(s):
			s.queue_free()
		p.erase(key)


## A picture among what stands, set to one of the films' pictures (-1: hidden): its floor point over `at`, `high` game pixels
## up, at a depth of its own; `flip`: turned over about its floor point.
func _film_set(s: Sprite2D, pi: int, at: Vector2, depth: float, flip := false, high := 0.0) -> void:
	s.visible = pi >= 0
	if pi < 0:
		return
	var q: Array = _fx["pics"][pi]
	var scr := Iso.to_screen(at.x, at.y)
	s.texture = _sheet(int(q[0]))
	s.region_rect = Rect2(q[1], q[2], q[3], q[4])
	s.flip_h = flip
	s.position = Vector2(scr.x, depth * 16.0)
	s.offset = Vector2(-(float(q[5]) + float(q[3])) if flip else float(q[5]), float(q[6]) + scr.y - depth * 16.0 - 2.0 * high)


## A picture among what stands for a mark, made when first wanted.
func _film_sprite() -> Sprite2D:
	var s := Sprite2D.new()
	s.centered = false
	s.region_enabled = true
	stands.add_child(s)
	return s


## One picture of a film standing among the figures for a mark, kept with it under `key` (and gone with it).
func _film_one(p: Dictionary, key: String, pi: int, at: Vector2, depth: float, flip := false, high := 0.0) -> void:
	if stands == null:
		return
	var s = p.get(key)
	if s == null or not is_instance_valid(s):
		if pi < 0:
			return
		s = _film_sprite()
		p[key] = s
	_film_set(s, pi, at, depth, flip, high)


## A mark's film's floor layer drawn (in _draw), where it has a film; false where it has none (a stand-in is drawn).
func _floor_of(p: Dictionary) -> bool:
	var fm := _film_of(p)
	if fm.is_empty() or not has_film(fm[0]):
		return false
	_film_floor(fm[0], fm[1], fm[2])
	return true


## Which of the game's films a mark plays, and where its floor point is: [name, t, at], or empty: none (a stand-in is drawn).
func _film_of(p: Dictionary) -> Array:
	match p["kind"]:
		"ring":
			# (the green troll's slam: render/act1_fx/brute.ts)
			return ["brute_ring", p["t"], Vector2(p["x"], p["y"])]
		"co_ring":
			# (the Chained One's rings, by their radius: render/act1_fx/chained.ts)
			return ["co_ring_%s" % str(p["r"]), p["t"], Vector2(p["x"], p["y"])]
		"co_crack":
			# (his lash's crack, along the way he faced, by sixteen ways round; its pictures' floor point the crack's middle)
			var w: Vector2 = p["way"]
			var way := posmod(roundi(atan2(w.y, w.x) / TAU * 16.0), 16)
			return ["co_crack_%d" % way, p["t"], Vector2(p["x"], p["y"]) + w * ((Chained.CRACK["from"] + Chained.CRACK["to"]) / 2.0)]
		"am_ring":
			# (the Ossuary Amalgamation's slam rings, by their radius: render/act1_fx/amalgam.ts)
			return ["am_ring_%s" % str(p["r"]), p["t"], Vector2(p["x"], p["y"])]
		"am_drop":
			# (a skull of its rain, by its seed: its burst and its scuff stand among the figures from when it lands)
			return ["am_drop_%d" % posmod(int(p["which"]), 8), p["t"], Vector2(p["x"], p["y"])]
		"am_arm":
			# (the arms of the dead up out of their hole, from when they burst: render/bossfx.ts)
			return ["am_arm", float(p["t"]) - float(p["hit"]), Vector2(p["x"], p["y"])]
		"fm_pit":
			# (the pit under the Fleshmancer as he is yanked down: render/act1_fx/fm.ts)
			return ["fm_pit", p["t"], Vector2(p["x"], p["y"])]
		"fm_rise":
			# (where he will rise: its mark from a second before, the burst as he erupts)
			return ["fm_rise", p["t"], Vector2(p["x"], p["y"])]
		"fm_heap":
			# (a bone heap as he raises his dead from it, by which of his call it is)
			return ["fm_heap_%d" % clampi(int(p["which"]), 0, 2), p["t"], Vector2(p["x"], p["y"])]
		"sigil":
			# (the cultist's fire sigil: its film begins SIGIL.delay before its eruption: render/act1_fx/cultist.ts)
			return ["sigil_%s" % str(MM.SIGIL["radius"]), float(p["t"]) + float(MM.SIGIL["delay"]), Vector2(p["x"], p["y"])]
		"kb_sigil":
			# (the Flame keybearer's great one, the same sigil at its bigger ring: render/act1_fx/keybearers.ts)
			return ["sigil_%s" % str(KBS.SIGIL["r"]), float(p["t"]) + float(KBS.SIGIL["delay"]), Vector2(p["x"], p["y"])]
		"rime":
			# (the Shade's rime: render/act1_fx/shade.ts)
			return ["rime", p["t"], Vector2(p["x"], p["y"])]
		"rain":
			# (the bone archer's arrow rain: seen from behind where it was shot away from the eye, its ring up the screen of
			# its archer: render/act1_fx/archer.ts)
			return ["rain_back" if _rain_back(p) else "rain_front", p["t"], Vector2(p["x"], p["y"])]
	return []


func _rain_back(p: Dictionary) -> bool:
	var from: Vector2 = p["from"]
	return from.is_finite() and float(p["x"]) + float(p["y"]) < from.x + from.y - 0.2


## WHAT THE ARCHER LOOSED, flying up into the dark over it from the frame after the loose (render/act1_fx/archer.ts): at the
## archer's floor point, just before it, turned as the archer faced.
func _rain_rise(p: Dictionary) -> void:
	var from: Vector2 = p["from"]
	if not from.is_finite() or not has_film("rain_rise_front"):
		return
	var t: float = p["t"]
	var film := "rain_rise_back" if _rain_back(p) else "rain_rise_front"
	var pi := -1
	if t > 1.0 / 30.0 and t < float(MM.RAIN["rise"]) + 1.0 / 30.0:
		var k := _film_frame(film, t)
		if k >= 0:
			pi = int(_fx["films"][film]["layers"]["stand"][k])
	var face: Vector2 = p["face"]
	_film_one(p, "fx_rise", pi, from, from.x + from.y + 0.1, face.x - face.y < 0.0)


## WHAT OF THE KEYBEARERS' STANDS AMONG THE FIGURES (render/act1_fx/keybearers.ts, the game's own pictures of them,
## art/key_bearers_fx.ts): the knife turning over as it flies (an eighth of a turn 24 times a second), a ball of fire
## flickering (20 times a second), each over its place at its height; the ring's tongues of fire all round its edge, each at
## its own depth, gold at the foot and pink to the tip, lower as it runs out.
func _kb_stands(p: Dictionary) -> void:
	if stands == null or not has_film("kb_knife"):
		return
	var t: float = p["t"]
	if p["kind"] != "kb_ring":
		var knife: bool = p["kind"] == "kb_knife"
		var at := Vector2(p["x"], p["y"])
		var pi := -1
		if not p["done"]:
			var L: Array = _fx["films"]["kb_knife" if knife else "kb_ball"]["layers"]["stand"]
			pi = int(L[posmod(floori(t * (24.0 if knife else 20.0)), L.size())])
		_film_one(p, "fx_stand", pi, at, at.x + at.y, false, float(p["high"]))
		return
	var n: Dictionary = KBS.RING
	var r := KBS.Kit.ring_at(t)
	var end: float = n["to"]
	var dying := 1.0 - minf(1.0, (t - (end - float(n["from"])) / float(n["speed"])) / float(n["fade"])) if r >= end else 1.0
	var pool: Array = p.get("fx_pool", [])
	p["fx_pool"] = pool
	var used := 0
	if dying > 0.0:
		var count := maxi(12, roundi(r * 9.0))
		for i in count:
			var a := TAU * i / count + t * 0.6
			var tall := (6.0 + 5.0 * sin(i * 2.7 + t * 13.0) + 3.0 * sin(i * 1.3)) * dying * (1.15 - 0.3 * (r / end))
			if tall < 1.0:
				continue
			var on := Vector2(float(p["x"]) + r * cos(a), float(p["y"]) + r * sin(a))
			var L: Array = _fx["films"]["kb_tongue_%d" % clampi(roundi(tall), 1, 16)]["layers"]["stand"]
			if used >= pool.size():
				pool.append(_film_sprite())
			_film_set(pool[used], int(L[posmod(floori(t * 20.0) + i, L.size())]), on, on.x + on.y)
			used += 1
	for j in range(used, pool.size()):
		pool[j].visible = false


## THE HANDS OF HIS DEAD, ring by ring as each bursts up, each among the figures at its own depth (render/act1_fx/fm.ts; the
## game's own hands, art/fleshmancer.ts makeRingHandArt: three kinds, 24 frames at 20 a second, each begun a hair apart).
## Each a picture among what stands while its frames run, kept with the rings' mark and gone with it.
func _fm_hands(p: Dictionary) -> void:
	if stands == null or not has_film("fm_hand_0"):
		return
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var aim: float = p["aim"]
	var radii: Array = FM.RINGS["radii"]
	var have: Dictionary = p.get("hands", {})
	p["hands"] = have
	for i in radii.size():
		var since := t - FM.ring_burst(i)
		if since < 0.0:
			continue
		var ring: Dictionary = FM.ring_hands(i)
		var r: float = radii[i]
		for a in ring["hands"]:
			var j := roundi(float(a) / float(ring["step"]))
			var key := i * 1000 + j
			var f := floori((since - ((j * 7) % 5) * 0.012) * 20.0)
			var s = have.get(key)
			if f < 0 or f >= 24:
				if s != null and is_instance_valid(s):
					s.queue_free()
					have.erase(key)
				continue
			var on := at + Vector2(cos(aim + a), sin(aim + a)) * r
			if s == null or not is_instance_valid(s):
				if not _fm_floor(on):
					continue
				s = Sprite2D.new()
				s.centered = false
				s.region_enabled = true
				stands.add_child(s)
				have[key] = s
			var L: Array = _fx["films"]["fm_hand_%d" % (j % 3)]["layers"]["stand"]
			var pi := int(L[f])
			s.visible = pi >= 0
			if pi < 0:
				continue
			var q: Array = _fx["pics"][pi]
			var scr := Iso.to_screen(on.x, on.y)
			s.texture = _sheet(int(q[0]))
			s.region_rect = Rect2(q[1], q[2], q[3], q[4])
			s.position = scr
			s.offset = Vector2(q[5], q[6])


## A dotted line of the warning along the floor from `a` to `b` (tiles), `k` (0 to 1) of the way to its full strength, as the
## bosses' marks are drawn (render/act1_fx/amalgam.ts dotLine): single game pixels, nine to a tile, every third the brighter.
func _dot_line(a: Vector2, b: Vector2, k: float) -> void:
	var n := maxi(2, roundi(a.distance_to(b) * 9.0))
	var alpha := minf(1.0, 0.25 + 0.75 * k)
	for i in n + 1:
		var w := a.lerp(b, float(i) / n)
		var q := Iso.to_screen(w.x, w.y) / 2.0
		draw_rect(Rect2(roundf(q.x) * 2.0, roundf(q.y) * 2.0, 2.0, 2.0), Color(FLAME3 if i % 3 == 0 else FLAME2, alpha))


## WHAT IS OVER EVERYTHING THAT STANDS (render/act1_fx `air`): drawn on a layer of its own over the figures, under the dark.
func _draw_air(c: CanvasItem) -> void:
	for p in list:
		if p["kind"] == "st_coals" and has_film("st_lump_0"):
			# (the Stoker's coals in the air: each one's trail of sparks behind it, the way it came, flickering: coalInAir)
			var since := float(p["t"]) - ST.COALS_HIT
			if since >= 0.0:
				var o := Vector2(p["x"], p["y"])
				for i in int(ST.COALS["n"]):
					if since > ST.coal_lands(i):
						continue
					var at := _st_coal(p["frame"], o, ST.coal_at(i, since, p["aim"]))
					var back := _st_coal(p["frame"], o, ST.coal_at(i, maxf(0.0, since - 1.0 / 30.0), p["aim"])) - at
					for j in range(1, 7):
						if _noise3(j, i, floori(since * 30.0)) < 0.75:
							c.draw_rect(Rect2(roundf(at.x + back.x * j * 0.8 + 1.5 * sin(j * 2.0 + i)), roundf(at.y + back.y * j * 0.8), 1.0, 1.0), ST_GOLD if j < 3 else ST_FLAME)
			continue
		if p["kind"] == "kb_ball" and p["done"] and has_film("kb_ball"):
			# (a ball of the Flame's fire going out where it struck: its picture swelling and fading, over what stands:
			# render/act1_fx/keybearers.ts air)
			var left := 1.0 - minf(1.0, (float(p["t"]) - float(p["hit"])) / float(KBS.BALL["burst"]))
			if left > 0.0:
				var L: Array = _fx["films"]["kb_ball"]["layers"]["stand"]
				var q: Array = _fx["pics"][int(L[posmod(floori(float(p["t"]) * 20.0), L.size())])]
				var sc := 1.0 + 0.6 * (1.0 - left)
				var mid := Iso.to_screen(p["x"], p["y"]) + Vector2(0.0, -2.0 * float(p["high"]))
				c.draw_texture_rect_region(_sheet(int(q[0])), Rect2(mid + Vector2(q[5], q[6]) * sc, Vector2(q[3], q[4]) * sc), Rect2(q[1], q[2], q[3], q[4]), Color(1, 1, 1, left))
			continue
		if p["kind"] == "co_flung" and has_film("co_hook_front"):
			# (the chain out from his hand to his hook or his ball, over what stands: render/bossfx.ts air, drawChainOut)
			var h: Vector2 = p["hand"]
			var e: Vector2 = p["at"]
			var ball: bool = p["what"] == "ball"
			var sag := (8.0 if ball else 6.0) if p["flying"] else (2.0 if ball else 1.0)
			_chain_out(c, Iso.to_screen(h.x, h.y) / 2.0 - Vector2(0, float(p["hand_high"])), Iso.to_screen(e.x, e.y) / 2.0 - Vector2(0, float(p["high"])), sag)
		if p["kind"] == "am_drop" and has_film("am_skull"):
			# (the skull in flight, out of its niche and down onto its shadow, tumbling: art/amalgam_action_fx.ts dropAt)
			var n: Dictionary = p["n"]
			var t: float = p["t"]
			if t < -n["fly"] or t >= 0.0:
				continue
			var k := clampf((t + n["fly"]) / n["fly"], 0.0, 1.0)
			var from: Vector2 = p["from"]
			var w := from.lerp(Vector2(p["x"], p["y"]), 1.0 - pow(1.0 - k, 2.2))
			var z: float = 46.0 * (1.0 - k) + n["high"] * sin(PI * minf(1.0, k * 0.62 + 0.38 * k * k)) * (1.0 - k) + 300.0 * k * (1.0 - k) * (1.0 - k)
			var frames := int(_fx["films"]["am_skull"]["n"])
			var i := posmod(floori((t + n["fly"]) * frames * 2.2) + int(p["which"]), frames)
			var at := Iso.to_screen(w.x, w.y) / 2.0
			_film_pic(c, "am_skull", "air", i, Vector2(roundf(at.x), roundf(at.y - maxf(0.0, z))) * 2.0)


## How a figure facing `f` on the floor is seen (game/facing.ts viewOf): from in front or from behind, and whether mirrored.
func _view_of(f: Vector2) -> Array:
	return ["back" if f.x + f.y < -0.2 else "front", f.x - f.y < 0.0]


## A LINE OF AIM on the floor from `a` toward `b` (tiles), `k` (0 to 1) as the light gathers (art/mob_shots.ts drawAimLine):
## it runs out from him as he draws, a dotted line of the enemy's pink whose dots run away from him along it, brighter the
## nearer the shot is; at its height, small chevrons along it, pointing the way it will go.
func _aim_line(a: Vector2, b: Vector2, k: float, t: float) -> void:
	var kk := clampf(k, 0.0, 1.0)
	if kk <= 0.01:
		return
	var A := Iso.to_screen(a.x, a.y) / 2.0
	var B := Iso.to_screen(b.x, b.y) / 2.0
	var full := A.distance_to(B)
	if full < 1.0:
		return
	var u := (B - A) / full
	var reach := full * clampf(kk * 1.4, 0.0, 1.0)
	var d := 6.0 + fmod(t * 26.0, 4.0)
	while d < reach:
		var fade := minf(1.0, (reach - d) / 18.0) * minf(1.0, (d - 4.0) / 8.0)
		draw_rect(Rect2(roundf(A.x + u.x * d) * 2.0, roundf(A.y + u.y * d) * 2.0, 4.0, 2.0), Color(FLAME3 if kk > 0.85 else FLAME2, (0.25 + 0.55 * kk) * fade))
		d += 4.0
	if kk > 0.7:
		var n := Vector2(-u.y, u.x)
		d = 14.0 + fmod(t * 30.0, 14.0)
		while d < reach - 6.0:
			var c := Color(FLAME3, (kk - 0.7) * 3.0 * 0.8 * minf(1.0, (reach - d) / 18.0))
			for side in [-1.0, 1.0]:
				for j in [1.0, 2.0, 3.0]:
					draw_rect(Rect2(roundf(A.x + u.x * (d - j) + n.x * side * j) * 2.0, roundf(A.y + u.y * (d - j) + n.y * side * j * 0.5) * 2.0, 2.0, 2.0), c)
			d += 14.0


## THE REACH OF A SWEEP marked round a point (art/boss_shots.ts drawSweepRing): a ring of the warning's dots, brighter as it
## comes (`k`), an arc of it running round the way the sweep will come.
func _sweep_ring(x: float, y: float, r: float, k: float, t: float) -> void:
	if k <= 0.0:
		return
	var n := maxi(48, roundi(r * 40.0))
	var run := fmod(t * 1.6, 1.0)
	for i in n:
		var a := float(i) / n * TAU
		var q := Iso.to_screen(x + cos(a) * r, y + sin(a) * r) / 2.0
		var lead := 1.0 - fposmod(float(i) / n - run, 1.0)
		var hot := (lead - 0.85) / 0.15 if lead > 0.85 else 0.0
		var al := minf(1.0, 0.25 + 0.6 * k + 0.4 * hot)
		draw_rect(Rect2(roundf(q.x) * 2.0, roundf(q.y) * 2.0, 2.0, 2.0), Color(FLAME3 if hot > 0.5 else FLAME2, al))
		if i % 2 == 0:
			draw_rect(Rect2(roundf(q.x) * 2.0, roundf(q.y + 1.0) * 2.0, 2.0, 2.0), Color(FLAME0, al))


## WHAT IS DRAGGED SCRAPES THE FLOOR (art/boss_shots.ts drawScrape): a pale scratch from where it is back the way it came.
func _scrape(a: Vector2, b: Vector2, k: float) -> void:
	var A := Iso.to_screen(a.x, a.y) / 2.0
	var B := Iso.to_screen(b.x, b.y) / 2.0
	var n := maxi(1, ceili(A.distance_to(B)))
	for i in n + 1:
		var f := float(i) / n
		var q := A.lerp(B, f)
		draw_rect(Rect2(roundf(q.x) * 2.0, roundf(q.y) * 2.0, 2.0, 2.0), Color(Color("#857888") if i % 4 == 0 else Color("#655868"), clampf(k, 0.0, 1.0) * (0.35 + 0.4 * (1.0 - f))))
	for o in [Vector2(-2, -2), Vector2(1, -3), Vector2(3, -1), Vector2(-1, -4)]:
		draw_rect(Rect2(roundf(A.x + o.x) * 2.0, roundf(A.y + o.y) * 2.0, 2.0, 2.0), Color(Color("#4d4252"), clampf(k, 0.0, 1.0) * 0.7))


## A CHAIN OUT ACROSS THE ROOM from one point of the screen to another (game pixels), sagging `sag` at its middle
## (art/boss_shots.ts drawChainOut): its links, each turned a quarter round from the last, in his old iron; a dark seam under it.
func _chain_out(c: CanvasItem, a: Vector2, b: Vector2, sag: float) -> void:
	var n := maxi(2, ceili(a.distance_to(b) / 1.25))
	for i in n + 1:
		var k := float(i) / n
		var x := roundf(lerpf(a.x, b.x, k))
		var y := lerpf(a.y, b.y, k) + sag * 4.0 * k * (1.0 - k)
		var w := 4.0 if i % 2 == 0 else 2.0
		c.draw_rect(Rect2(x * 2.0, roundf(y + 1.0) * 2.0, w, 2.0), Color("#120d18"))
		c.draw_rect(Rect2(x * 2.0, roundf(y) * 2.0, w, 2.0), Color("#7672b0") if i % 2 == 0 else Color("#3e3a70"))


## THE CHAINED ONE'S HOOK OR BALL, IN FLIGHT OR DRAGGED: the game's own picture of it among what stands, at its own depth and
## its height (render/bossfx.ts standing: the hook tumbling 2.5 times a second in flight, lying when dragged; the ball
## turning 1.6 times a second), seen as he is. Kept by whose it is from frame to frame, and gone when it is.
func _flung_step() -> void:
	var live := {}
	for p in list:
		if p["kind"] != "co_flung" or stands == null:
			continue
		var src = p["src"]
		if not is_instance_valid(src):
			continue
		var ball: bool = p["what"] == "ball"
		var v := _view_of(src.face)
		var film := "co_%s_%s" % ["ball" if ball else "hook", v[0]]
		if not has_film(film):
			continue
		live[src] = true
		var s = _flung.get(src)
		if s == null or not is_instance_valid(s):
			s = Sprite2D.new()
			s.centered = false
			s.region_enabled = true
			stands.add_child(s)
			_flung[src] = s
		var frames := int(_fx["films"][film]["n"])
		var i := 0
		if ball:
			i = floori(_clock * 1.6 * frames) % frames if p["flying"] else 0
		else:
			i = floori(_clock * 2.5 * (frames - 1)) % (frames - 1) if p["flying"] else frames - 1
		var pi := int(_fx["films"][film]["layers"]["stand"][i])
		s.visible = pi >= 0
		if pi < 0:
			continue
		var q: Array = _fx["pics"][pi]
		var at: Vector2 = p["at"]
		s.texture = _sheet(int(q[0]))
		s.region_rect = Rect2(q[1], q[2], q[3], q[4])
		s.flip_h = v[1]
		s.position = Iso.to_screen(at.x, at.y)
		s.offset = Vector2(-(float(q[5]) + float(q[3])) if v[1] else float(q[5]), float(q[6]) - 2.0 * float(p["high"]))
	for src in _flung.keys():
		if not live.has(src):
			if is_instance_valid(_flung[src]):
				_flung[src].queue_free()
			_flung.erase(src)


## The layer over the figures (see _draw_air).
class _Air extends Node2D:
	var perils

	func _draw() -> void:
		perils._draw_air(self)


func _process(dt: float) -> void:
	_clock += dt
	var keep: Array = []
	for p in list:
		p["t"] += dt
		var stays := true
		match p["kind"]:
			"warn":
				if p["t"] >= p["dur"]:
					if not p.get("mark", false):
						sfx.play("slam", -2.0)
						hero.shake()
						if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= p["r"] + 0.1:
							hero.hurt(p["dmg"])
						keep.append({"kind": "blast", "x": p["x"], "y": p["y"], "r": p["r"], "t": 0.0})
					stays = false
				elif p.get("mark", false) and (not is_instance_valid(p["src"]) or p["src"].dead):
					stays = false
			"sigil":
				var at := Vector2(p["x"], p["y"])
				var w = p["src"]
				if p["t"] < -0.05:
					# (its cultist still casting: if it has fallen, or been stopped in its cast, nothing erupts)
					if not is_instance_valid(w) or w.dead or w.state != "windup":
						stays = false
				elif p["done"] == 0 and p["t"] >= 0.0:
					p["done"] = 1
					if hero.alive and hero.world.distance_to(at) <= MM.SIGIL["radius"]:
						hero.hurt(p["dmg"])
					sfx.play("fire")
					hero.kick(2.5)
				elif p["done"] > 0 and p["t"] > MM.SIGIL["strike"]:
					# (the floor burning on: a tick every 0.5 s while he stands in what still burns)
					var next: float = MM.SIGIL["strike"] + MM.SIGIL["every"] * p["done"]
					if p["t"] >= next:
						p["done"] += 1
						if hero.alive and hero.world.distance_to(at) <= MM.burn_radius(p["t"]):
							hero.hurt(p["dmg"] * MM.SIGIL["share"])
				if p["t"] >= MM.SIGIL["pillar"] + MM.SIGIL["fall"] + MM.SIGIL["burn"]:
					stays = false
			"rime":
				var d: Vector2 = hero.world - Vector2(p["x"], p["y"])
				var e := MM.rime_edge(p["t"], atan2(d.y, d.x))
				if e > 0.0 and d.length() <= e:
					hero.chill(0.12, MM.RIME["slow"])
				stays = p["t"] < MM.RIME["lie"]
			"fm_shards", "fm_rings", "fm_fire", "fm_heap", "fm_pit", "fm_rise", "fm_glow":
				# (THE FLESHMANCER'S: its own block below)
				stays = _step_fm(p)
			"blast":
				stays = p["t"] < 0.3
			"ring":
				stays = p["t"] < MM.RING["long"]
			"spear":
				var o = p["src"]
				stays = is_instance_valid(o) and not o.dead and o.bare
			"smoke":
				p["tick"] -= dt
				if p["tick"] <= 0.0:
					p["tick"] += MM.SMOKE["tick"]
					if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= MM.SMOKE["r"] + 0.15:
						hero.hurt(p["dmg"])
				stays = p["t"] < MM.SMOKE["dur"]
			"rain":
				if not p["done"] and p["t"] >= MM.RAIN["delay"]:
					p["done"] = true
					sfx.play("hit", -4.0)
					if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= MM.RAIN["radius"]:
						hero.hurt(p["dmg"])
				stays = p["t"] < MM.RAIN["delay"] + MM.RAIN["stuck"] + MM.RAIN["gone"]
			"bars":
				var w = p["src"]
				if p["t"] < -0.1 and (not is_instance_valid(w) or w.dead or w.state != "windup"):
					stays = false
				elif not p["done"] and p["t"] >= 0.0:
					p["done"] = true
					sfx.play("slam")
					hero.shake()
					if hero.alive and _on_a_row(p, hero.world):
						hero.hurt(p["dmg"])
				if p["t"] >= MM.LOCKDOWN["stand"] + MM.LOCKDOWN["rise"]:
					stays = false
			"am_lines", "am_ring", "am_drop", "am_arm":
				# (the Ossuary Amalgamation's, floor 4's boss: at the foot of this file)
				stays = _am_step(p)
			"st_coals", "st_rake", "st_ring", "st_blast":
				# (THE STOKER'S, floor 3's furnace keeper: at the foot of this file)
				stays = _st_stays(p)
			"co_crack", "co_ring", "co_left", "co_aim", "co_reach", "co_flung":
				# (THE CHAINED ONE'S, at the foot of this file)
				stays = _co_stays(p)
			"kb_knife", "kb_ball", "kb_sigil", "kb_ring", "kb_reach":
				# (THE KEYBEARERS', floor 5's two: at the foot of this file)
				stays = _kb_step(p, dt)
			_:
				var s = p.get("src")
				if s != null and not is_instance_valid(s):
					stays = false
		if stays:
			keep.append(p)
			var fm := _film_of(p)
			if not fm.is_empty() and has_film(fm[0]):
				_film_stands(p, fm[0], fm[1], fm[2])
			if p["kind"] == "fm_rings":
				_fm_hands(p)
			elif p["kind"] == "rain":
				_rain_rise(p)
			elif p["kind"] in ["kb_knife", "kb_ball", "kb_ring"]:
				_kb_stands(p)
			elif p["kind"] == "st_coals":
				_st_stands(p)
		else:
			_film_free(p)
	list = keep
	_flung_step()
	queue_redraw()
	if _air != null:
		_air.queue_redraw()


func _on_a_row(p: Dictionary, at: Vector2) -> bool:
	var band: float = MM.LOCKDOWN["band"]
	for ry in p["rx"]:
		if absf(at.y - ry) <= band:
			return true
	for rx in p["ry"]:
		if absf(at.x - rx) <= band:
			return true
	return false


## THE CAGE (action_f1.ts cageHero): a hero who walked from `was` to `now` is kept on his own side of every row of standing
## bars in the room he was in; where that would put him in a wall, he stays where he was.
func cage(was: Vector2, now: Vector2, r: float) -> Vector2:
	var b := now
	for p in list:
		if p["kind"] != "bars" or p["t"] < 0.0 or p["t"] >= MM.LOCKDOWN["stand"]:
			continue
		var room: Dictionary = p["room"]
		if was.x < room["x"] or was.x >= room["x"] + room["w"] or was.y < room["y"] or was.y >= room["y"] + room["h"]:
			continue
		var b0 := b
		for line in p["rx"]:
			b.y = maxf(b.y, line + r) if was.y >= line else minf(b.y, line - r)
		for line in p["ry"]:
			b.x = maxf(b.x, line + r) if was.x >= line else minf(b.x, line - r)
		if b != b0 and not _fits(b, r):
			b = was
	return b


func _fits(at: Vector2, r: float) -> bool:
	var k := r * 0.95
	for c in [Vector2(-k, -k), Vector2(k, -k), Vector2(-k, k), Vector2(k, k)]:
		var t := map.tile(floori(at.x + c.x), floori(at.y + c.y))
		if t != FloorMap.FLOOR and t != FloorMap.PIT:
			return false
	return true


func _room_at(x: float, y: float):
	for r in map.rooms:
		if x >= r["x"] and x < r["x"] + r["w"] and y >= r["y"] and y < r["y"] + r["h"]:
			return r
	return null


# =============================================================================================================================
# THE FLESHMANCER'S, AND THE MINI FLESHMANCER'S FIRE (game/fm_action.ts stepFm; fleshmancer.gd, minifm.gd): what his moves,
# done the action way, send out. Each has its own clock from his act's beginning (0 as it begins, unless said) and its harm
# rolled once as the act begins. As in the game they go on by themselves once begun, whether he still stands or not. Their
# numbers are his pictures' own, kept in fleshmancer.gd. Drawn as stand-ins for the art chat's painters
# (art/fleshmancer_action_fx.ts, render/act1_fx/fm.ts), on the floor only: what of them would lie across a wall is left out
# (his rules take no heed of walls: what strikes is as the game has it).
#   fm_shards  his two fans of bone shards: drawn up out of the floor and hung before him, each its lane marked; flung at his
#              hammer, 15 tiles a second out to 10 tiles; a hero within 0.3 of a flying shard is struck, once by each. `aim`
#              the first fan's (taken as he begins), `aim2` the second's (taken as it is drawn up, in the first's gaps).
#   fm_rings   his five rings of hands round where he stood: the cracks lit; rings 1, 3 and 5 burst up at his first slam, 2
#              and 4 at his second; a hero within 0.5 of a hand as its ring comes up (and 0.3 s after) is struck, once a ring.
#   fm_fire    his fire, or a mini fleshmancer's (`mini`): the stream whipped round, the floor left burning in lanes where it
#              gouted; a hero in the stream, or in a lane burning, is burned every 0.22 s (in a lane, half as much).
#   fm_heap    a bone heap of his hall shaking while he summons and bursting as its dead come up (drawn only).
#   fm_pit     the pit of his dead under him as he is dragged down (drawn only).
#   fm_rise    where he will rise, marked a second before he erupts; its 0 his eruption: a hero within 2 tiles of it then is
#              struck and thrown back.
#   fm_glow    his light on the floor where one of the dead he has called comes up (drawn only).

const FM := preload("res://scripts/fleshmancer.gd")

## (art/mkit.ts FLAME, the enemy's fire, hot and white-hot; bone; his dead's flesh, dark and lit; scorched stone)
const FM_HOT := Color("#ffb070")
const FM_WHITE := Color("#fff6e0")
const FM_BONE := Color("#f2e8d4")
const FM_FLESH := Color("#1c0a1e")
const FM_FLESH_LIT := Color("#82306e")
const FM_CHAR := Color("#170b14")
## (art/fleshmancer.ts FM_HAND_FRAMES at FM_HAND_FPS: how long a ring's hands stand up out of the floor)
const FM_HAND_TIME := 24.0 / 20.0


func fm_shards(at: Vector2, aim: float, dmg: float) -> void:
	list.append({"kind": "fm_shards", "x": at.x, "y": at.y, "t": 0.0, "dur": FM.FM2["lasts"]["shards"], "dmg": dmg, "aim": aim, "aim2": NAN, "struck": 0})


func fm_rings(at: Vector2, aim: float, dmg: float) -> void:
	list.append({"kind": "fm_rings", "x": at.x, "y": at.y, "t": 0.0, "dur": FM.FM2["lasts"]["rings"], "dmg": dmg, "aim": aim, "struck": 0})


## `face`, `hand`: the way he faced as he began, and the hand he is drawn with (the stream turns to the left he is drawn with).
func fm_fire(at: Vector2, face: Vector2, hand: int, dmg: float, mini: bool) -> void:
	var dur: float = FM.FM2["lasts"]["mini" if mini else "fire"]
	list.append({"kind": "fm_fire", "x": at.x, "y": at.y, "t": 0.0, "dur": dur, "dmg": dmg, "face": face, "hand": hand, "mini": mini, "last": -1.0})


## `which`: which of the heaps he calls on it is (each bursts a little after the one before).
func fm_heap(at: Vector2, which: int) -> void:
	list.append({"kind": "fm_heap", "x": at.x, "y": at.y, "t": 0.0, "dur": FM.RAISE_LONG + 0.8, "which": which})


func fm_pit(at: Vector2) -> void:
	list.append({"kind": "fm_pit", "x": at.x, "y": at.y, "t": 0.0, "dur": FM.FM2["sink"]})


## `before`: how long until he erupts there.
func fm_rise(at: Vector2, before: float, dmg: float) -> void:
	list.append({"kind": "fm_rise", "x": at.x, "y": at.y, "t": -before, "dur": 1.0, "dmg": dmg, "done": false})


## `before`: how long until it begins; `secs`: how long it burns before the dead one stands.
func fm_glow(at: Vector2, before: float, secs: float) -> void:
	list.append({"kind": "fm_glow", "x": at.x, "y": at.y, "t": -before, "dur": secs + 0.3, "secs": secs})


## A step of one of his perils (stepFm). False: it is over.
func _step_fm(p: Dictionary) -> bool:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var h: Vector2 = hero.world
	match p["kind"]:
		"fm_shards":
			# (the second fan's aim, as it is drawn up: turned toward where the hero is then by whole steps of the first fan's,
			# so that it still hangs in the first one's gaps: who stood in a gap of the first is struck by the second)
			if is_nan(p["aim2"]) and t >= FM.SHARD_DRAW[1][0]:
				var step: float = FM.SHARDS["apart"] * PI / 180.0
				var off: float = atan2(h.y - at.y, h.x - at.x) - float(p["aim"])
				p["aim2"] = float(p["aim"]) + step * floorf(atan2(sin(off), cos(off)) / step + 0.5)
			if t >= FM.SHARD_HITS[0]:
				for s in FM.shards_now(t, p["aim"], p["aim2"]):
					var bit: int = 1 << int(s["i"])
					if s["state"] != "flying" or (int(p["struck"]) & bit) != 0:
						continue
					if h.distance_to(at + Vector2(s["x"], s["y"])) > FM.SHARDS["r"]:
						continue
					p["struck"] = int(p["struck"]) | bit
					hero.hurt(p["dmg"])
		"fm_rings":
			for i in FM.RINGS["radii"].size():
				var burst := FM.ring_burst(i)
				if t < burst or t > burst + FM.FM2["handUp"] or (int(p["struck"]) & (1 << i)) != 0:
					continue
				if not FM.ring_strikes(i, h - at, p["aim"]):
					continue
				p["struck"] = int(p["struck"]) | (1 << i)
				hero.hurt(p["dmg"])
				hero.kick(1.5)
		"fm_fire":
			if t - float(p["last"]) >= FM.FM2["tick"]:
				var rel := FM.from_figure(at, p["face"], p["hand"], h)
				if FM.fire_strikes(t, rel.x, rel.y, p["mini"]):
					p["last"] = t
					hero.hurt(float(p["dmg"]) * (1.0 if FM.in_stream(t, rel.x, rel.y, p["mini"]) else float(FM.FM2["laneShare"])))
		"fm_rise":
			if not p["done"] and t >= 0.0:
				p["done"] = true
				if hero.alive and h.distance_to(at) <= FM.RISE_MARK["r"]:
					hero.hurt(p["dmg"])
					var way := h - at
					hero.knock(way.normalized() if way.length() >= 0.01 else -hero.face, FM.HEAVY_KNOCK)
				hero.kick(4.0)
				sfx.play("slam", -2.0)
	return t < float(p["dur"])


## Is there floor at a place? (His stand-ins are drawn on the floor only, not across a wall into the dark beyond it. What
## strikes goes by his rules alone, as in the game: his shards, rings and fire take no heed of walls.)
func _fm_floor(at: Vector2) -> bool:
	return map.open_at(floori(at.x), floori(at.y))


## How far the floor runs unbroken from `at` the way `u`: from `from` tiles out, to `to` at most.
func _fm_floor_to(at: Vector2, u: Vector2, from: float, to: float) -> float:
	if not _fm_floor(at + u * from):
		return from
	var d := from
	while d < to:
		var next := minf(to, d + 0.25)
		if not _fm_floor(at + u * next):
			return d
		d = next
	return to


func _draw_fm(p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match p["kind"]:
		"fm_shards":
			_draw_fm_shards(p, t, at)
		"fm_rings":
			_draw_fm_rings(p, t, at)
		"fm_fire":
			_draw_fm_fire(p, t, at)
		"fm_heap", "fm_pit", "fm_rise":
			# (THE GAME'S OWN, where its film is there: what of it is on the floor here, the rest among the figures)
			var fm := _film_of(p)
			if has_film(fm[0]):
				_film_floor(fm[0], t, at)
			elif p["kind"] == "fm_heap":
				_draw_fm_heap(int(p["which"]), t, at)
			elif p["kind"] == "fm_pit":
				var open: float = FM.smooth((t - FM.PIT["open"]) / 0.12) * (1.0 - FM.smooth((t - FM.PIT["shut"]) / 0.06))
				_draw_fm_pit(at, FM.PIT["r"] * open)
			else:
				_draw_fm_rise(t, at)
		"fm_glow":
			_draw_fm_glow(float(p["secs"]), t, at)


## His shards: each one's lane on the floor while it hangs; the sliver of bone itself, lifted over its floor point and
## pointing its way (drawn up point first, turning to it); a streak of his fire behind one that flies; a flash where it ends.
func _draw_fm_shards(p: Dictionary, t: float, at: Vector2) -> void:
	var hang: float = FM.SHARDS["hang_r"]
	var lane: float = FM.SHARDS["lane"]
	for s in FM.shards_now(t, p["aim"], p["aim2"]):
		var state: String = s["state"]
		var k: float = s["k"]
		var way := Vector2(cos(s["a"]), sin(s["a"]))
		var on := at + Vector2(s["x"], s["y"])
		var foot := Iso.to_screen(on.x, on.y)
		if not _fm_floor(on):
			continue
		if state == "burst":
			draw_polyline(_ring(on.x, on.y, 0.15 + 0.5 * k, 16), Color(FM_HOT, 1.0 - k), 3.0)
			continue
		if state != "flying":
			var a := at + way * (hang + 0.2)
			var b := at + way * _fm_floor_to(at, way, hang + 0.2, lane)
			draw_dashed_line(Iso.to_screen(a.x, a.y), Iso.to_screen(b.x, b.y), Color(ENEMY, 0.2 + 0.6 * k), 2.0, 8.0)
		var tip := foot + Vector2(0.0, -float(s["z"]))
		var dir := Iso.to_screen(way.x, way.y).normalized()
		if state == "rising":
			dir = dir.lerp(Vector2(0, -1), 1.0 - k).normalized()
		draw_line(foot + Vector2(-6, 0), foot + Vector2(6, 0), Color(SHADOW, 0.55), 3.0)
		if state == "flying":
			draw_line(tip - dir * 58.0, tip - dir * 10.0, Color(ENEMY, 0.75), 5.0)
			draw_line(tip - dir * 36.0, tip - dir * 10.0, Color(FM_HOT, 0.9), 3.0)
		draw_line(tip - dir * 30.0, tip, FM_BONE, 4.0)
		draw_line(tip - dir * 30.0, tip - dir * 25.0, ENEMY, 4.0)


## His rings: each one's crack in the floor, its two gaps left dark, lit in his pink from when he rises (the first slam's
## rings hot, the others dim until it), flashing as its hands come up, then dark, and gone; and the hands of his dead standing
## up out of it for 1.2 s (they strike only as they come up: hot then).
func _draw_fm_rings(p: Dictionary, t: float, at: Vector2) -> void:
	var lit: float = FM.RINGS["lit"]
	if t < lit:
		return
	var aim: float = p["aim"]
	var radii: Array = FM.RINGS["radii"]
	for i in radii.size():
		var r: float = radii[i]
		var since := t - FM.ring_burst(i)
		var ring: Dictionary = FM.ring_hands(i)
		if since <= 1.6:
			var up := FM.smooth((t - lit - i * 0.05) / 0.3)
			var heat := 0.38 * up
			if since >= 0.0:
				heat = clampf(1.0 - since / 0.25, 0.0, 1.0)
			elif i in FM.RINGS["first"] or t > FM.RING_HITS[0]:
				heat = up * (0.75 + 0.25 * sin(t * 16.0 + i))
			var fade := 1.0 - (since - 0.9) / 0.7 if since > 0.9 else up
			var col := Color(SHADOW, 0.85 * fade).lerp(Color(ENEMY, fade), heat)
			if since >= 0.0 and since < 0.2:
				col = FM_WHITE
			var arc := PackedVector2Array()
			for k in 97:
				var a := TAU * k / 96.0
				var on := at + Vector2(cos(aim + a), sin(aim + a)) * r
				if FM.in_gap(a, ring["gaps"], ring["step"], 0.02) or not _fm_floor(on):
					if arc.size() > 1:
						draw_polyline(arc, col, 3.0)
					arc = PackedVector2Array()
					continue
				arc.append(Iso.to_screen(on.x, on.y))
			if arc.size() > 1:
				draw_polyline(arc, col, 3.0)
		if since >= 0.0 and since < FM_HAND_TIME and not has_film("fm_hand_0"):
			var tall := 38.0 * clampf(since / 0.1, 0.0, 1.0) * clampf((FM_HAND_TIME - since) / 0.35, 0.0, 1.0)
			var hot: bool = since <= FM.FM2["handUp"]
			for a in ring["hands"]:
				var on := at + Vector2(cos(aim + a), sin(aim + a)) * r
				if not _fm_floor(on):
					continue
				var foot := Iso.to_screen(on.x, on.y)
				draw_line(foot, foot + Vector2(0, -tall), FM_HOT if hot else FM_FLESH_LIT, 3.0)
				draw_line(foot + Vector2(-4, -tall), foot + Vector2(4, -tall), FM_BONE, 3.0)


## His fire: the lanes left burning where the stream gouted (each dying back from its end toward him over its last moments,
## then scorched stone a while), and the stream itself, out of him to its reach, white-hot at its heart.
func _draw_fm_fire(p: Dictionary, t: float, at: Vector2) -> void:
	var mini: bool = p["mini"]
	var size: Dictionary = FM.MINI_FIRE if mini else FM.FIRE
	var face: Vector2 = p["face"]
	var hand: int = p["hand"]
	var land: float = size["land"]
	var reach: float = size["reach"]
	var burn: float = size["burn"]
	var die: float = size["die"]
	var scorch: float = size["scorch"]
	var lane_half: float = size["laneHalf"]
	for l in FM.fire_lanes(mini):
		var since: float = t - float(l["at"])
		if since < 0.0 or since > burn + scorch:
			continue
		var u := FM.beside(Vector2.ZERO, face, hand, cos(l["a"]), sin(l["a"]))
		var far := _fm_floor_to(at, u, land, reach)
		if far <= land + 0.05:
			continue
		var cool := clampf((since - burn) / scorch, 0.0, 1.0)
		draw_colored_polygon(_band(at + u * land, at + u * far, lane_half), Color(FM_CHAR, 0.6 * (1.0 - cool)))
		if since > burn:
			continue
		var out := minf(far, reach if since < burn - die else land + (reach - land) * clampf(1.0 - (since - (burn - die)) / die, 0.0, 1.0))
		if out > land + 0.05:
			var flick := 0.75 + 0.25 * sin(t * 19.0 + float(l["a"]) * 7.0)
			draw_colored_polygon(_band(at + u * land, at + u * out, lane_half), Color(ENEMY, 0.55 * flick))
			draw_colored_polygon(_band(at + u * land, at + u * out, lane_half * 0.45), Color(FM_HOT, 0.75 * flick))
	var now := FM.fire_way(t, mini)
	if is_nan(now):
		return
	var w := FM.beside(Vector2.ZERO, face, hand, cos(now), sin(now))
	var half: float = size["half"]
	var run := _fm_floor_to(at, w, land, reach)
	if run <= land + 0.05:
		return
	draw_colored_polygon(_band(at + w * land, at + w * run, half), Color(ENEMY, 0.7))
	draw_colored_polygon(_band(at + w * land, at + w * run, half * 0.6), Color(FM_HOT, 0.9))
	draw_colored_polygon(_band(at + w * land, at + w * run, half * 0.25), FM_WHITE)
	# (out of the skull's jaws, or from between a mini's claws, down onto the floor where it lands)
	var mouth := Iso.to_screen(at.x, at.y) + Vector2(0.0, -40.0 if mini else -70.0)
	draw_line(mouth, Iso.to_screen(at.x + w.x * land, at.y + w.y * land), FM_HOT, 5.0)


## A bone heap: the floor round it lit from under in his pink, beating faster, while he summons; a ring of bone and grave
## dirt thrown out as its dead come up.
func _draw_fm_heap(which: int, t: float, at: Vector2) -> void:
	var shake := FM.heap_shake(t)
	var since: float = t - (FM.RAISE_HIT + which * float(FM.HEAP["apart"]))
	var glow := shake * (0.7 + 0.3 * sin(t * (20.0 + 20.0 * shake) + which)) if since < 0.0 else clampf(1.0 - since / 0.5, 0.0, 1.0)
	if glow > 0.02:
		draw_colored_polygon(_ring(at.x, at.y, 0.62), Color(ENEMY, 0.3 * glow))
		draw_polyline(_ring(at.x, at.y, 0.62), Color(ENEMY, 0.95 * glow), 3.0)
	var long: float = FM.HEAP["long"]
	if since >= 0.0 and since <= long:
		var k := since / long
		var far: float = float(FM.HEAP["throw"]) * (1.0 - (1.0 - k) * (1.0 - k))
		draw_polyline(_ring(at.x, at.y, far), Color(FM_BONE, 1.0 - k), 3.0)
		draw_polyline(_ring(at.x, at.y, far * 0.6), Color(FM_HOT, 0.8 * (1.0 - k)), 2.0)


## The pit of his dead, `r` tiles round: a churning dark mass, his pink fire at its lip.
func _draw_fm_pit(at: Vector2, r: float) -> void:
	if r <= 0.02:
		return
	draw_colored_polygon(_ring(at.x, at.y, r), Color(FM_FLESH, 0.92))
	draw_polyline(_ring(at.x, at.y, r * 0.6), Color(FM_FLESH_LIT, 0.8), 2.0)
	draw_polyline(_ring(at.x, at.y, r), Color(ENEMY, 0.9), 2.0)


## Where he will rise, `t` seconds from his eruption (negative before): the ring of his fire filling in round it, the pit of
## his dead opening in its middle; then the burst, thrown out to the ring.
func _draw_fm_rise(t: float, at: Vector2) -> void:
	var warn: float = FM.RISE_MARK["warn"]
	var r: float = FM.RISE_MARK["r"]
	var out: float = FM.RISE_MARK["out"]
	var pit: float = FM.PIT["r"]
	if t < -warn or t > 0.9:
		return
	if t < 0.0:
		var k := 1.0 - (-t) / warn
		var ring := _ring(at.x, at.y, r, 60)
		var n := maxi(2, int(ring.size() * (0.25 + 0.75 * FM.smooth(k * 1.6))))
		var beat := 0.65 + 0.35 * sin(t * (18.0 + 30.0 * k))
		draw_colored_polygon(_ring(at.x, at.y, r), Color(ENEMY, 0.05 + 0.15 * k))
		draw_polyline(ring.slice(0, n), Color(ENEMY, 0.55 + 0.45 * beat), 3.0)
		draw_polyline(_ring(at.x, at.y, r * k * 0.9), Color(ENEMY, 0.45), 2.0)
		_draw_fm_pit(at, pit * 1.15 * minf(1.0, 0.45 + 0.75 * k))
		return
	_draw_fm_pit(at, pit * (1.0 - FM.smooth(t / 0.5)))
	if t < out + 0.12:
		var k := clampf(t / out, 0.0, 1.0)
		draw_polyline(_ring(at.x, at.y, r * FM.smooth(k)), FM_WHITE if k < 0.5 else FM_HOT, 6.0)
		draw_polyline(_ring(at.x, at.y, r * FM.smooth(k) * 0.9), Color(ENEMY, 0.9), 3.0)


## His light where one of the dead comes up: swelling as it stirs, a flash as it stands, and gone.
func _draw_fm_glow(secs: float, t: float, at: Vector2) -> void:
	if t < 0.0:
		return
	var k := FM.smooth(t / 0.3) * (1.0 - FM.smooth((t - secs) / 0.3))
	var slam := 1.0 - FM.smooth(absf(t - secs) / 0.08)
	if k <= 0.02 and slam <= 0.02:
		return
	draw_colored_polygon(_ring(at.x, at.y, 0.45 + 0.25 * slam, 24), Color(ENEMY, 0.3 * k + 0.4 * slam))
	draw_polyline(_ring(at.x, at.y, 0.45 + 0.25 * slam, 24), Color(FM_HOT, 0.6 * k + 0.4 * slam), 2.0)


# --- drawing: a circle on the floor is an ellipse on the screen ---

func _ring(x: float, y: float, r: float, n := 40) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in n + 1:
		var a := TAU * i / n
		pts.append(Iso.to_screen(x + cos(a) * r, y + sin(a) * r))
	return pts


func _band(a: Vector2, b: Vector2, half: float) -> PackedVector2Array:
	var d := (b - a).normalized()
	var s := Vector2(-d.y, d.x) * half
	return PackedVector2Array([Iso.to_screen((a + s).x, (a + s).y), Iso.to_screen((b + s).x, (b + s).y), Iso.to_screen((b - s).x, (b - s).y), Iso.to_screen((a - s).x, (a - s).y)])


func _draw() -> void:
	for p in list:
		match p["kind"]:
			"warn":
				# (THE GAME'S RED CIRCLE, as render.ts draws a 'warn' zone: its faint ground darkening as the moment comes, the
				# fill growing from its middle, and its ring of single pixels)
				var k: float = clampf(p["t"] / p["dur"], 0.0, 1.0)
				draw_colored_polygon(_ring(p["x"], p["y"], p["r"]), Color(BL3, 0.16 + 0.3 * k))
				if p["r"] * k > 0.03:
					draw_colored_polygon(_ring(p["x"], p["y"], p["r"] * k), Color(BL4, 0.3))
				_ring_dots(p["x"], p["y"], p["r"], BL5)
			"blast":
				var k: float = p["t"] / 0.3
				draw_polyline(_ring(p["x"], p["y"], p["r"] * (0.6 + 0.5 * k)), Color(1, 0.75, 0.8, 1.0 - k), 4.0)
			"fm_shards", "fm_rings", "fm_fire", "fm_heap", "fm_pit", "fm_rise", "fm_glow":
				# (THE FLESHMANCER'S: its own block below)
				_draw_fm(p)
			"lane":
				_lane_at(p["a"], p["b"], p["half"], clampf(p["t"] / p["dur"], 0.0, 1.0), clampf(p["gone"], 0.0, 1.0))
			"aim":
				# (THE GAME'S OWN line of aim, art/mob_shots.ts drawAimLine: it runs out from him as he draws, from 0.52 s into his
				# draw (defs.ts AIM.from), a dotted line of the enemy's pink whose dots run away from him, chevrons at its height)
				_aim_line(p["a"], p["b"], (float(p["t"]) - 0.52) / maxf(0.01, float(p["dur"]) - 0.52), _clock)
			"rain":
				# (THE GAME'S OWN, art/action_f1_fx.ts rainPainted: the ring filling with the shadows of falling arrows)
				if _floor_of(p):
					continue
				var t: float = p["t"]
				var R: float = MM.RAIN["radius"]
				var delay: float = MM.RAIN["delay"]
				if t < delay:
					var k := t / delay
					draw_colored_polygon(_ring(p["x"], p["y"], R), Color(GOLD, 0.06 + 0.2 * k))
					draw_polyline(_ring(p["x"], p["y"], R), Color(GOLD, 0.9), 2.0)
					draw_polyline(_ring(p["x"], p["y"], R * (1.0 - k)), Color(GOLD, 0.6), 2.0)
				else:
					var fade := clampf(1.0 - (t - delay - MM.RAIN["stuck"]) / MM.RAIN["gone"], 0.0, 1.0)
					for s in p["sticks"]:
						var at := Iso.to_screen(s.x, s.y)
						draw_line(at, at + Vector2(3, -14), Color(0.8, 0.72, 0.58, fade), 2.0)
			"bars":
				_draw_bars(p)
			"ring":
				if has_film("brute_ring"):
					_film_floor("brute_ring", p["t"], Vector2(p["x"], p["y"]))
				else:
					_draw_slam_ring(p)
			"spear":
				# (THE GAME'S OWN, art/mob_shots.ts drawSpearLying: lying on the floor where it fell, pointing the way it flew:
				# its shadow, its shaft two pixels thick with its upper side in the light, its iron head)
				var w: Vector2 = p["way"]
				var c := Vector2(p["x"], p["y"])
				var b := Iso.to_screen(c.x - w.x * 0.435, c.y - w.y * 0.435) / 2.0
				var tp := Iso.to_screen(c.x + w.x * 0.435, c.y + w.y * 0.435) / 2.0
				_px_line(b + Vector2(0, 2), tp + Vector2(0, 2), Color(Color("#07050a"), 0.5))
				_px_line(b + Vector2(0, 1), tp + Vector2(0, 1), Color("#2a2466"))
				_px_line(b, tp, Color("#6e68cc"))
				var hd := b.lerp(tp, 0.78)
				_px_line(hd + Vector2(0, 1), tp + Vector2(0, 1), Color("#1c1a3a"))
				_px_line(hd, tp, Color("#7672b0"))
			"smoke":
				if has_film("smoke"):
					# (THE GAME'S OWN, art/mob_shots.ts drawBurningSmoke: billowing, burning and thinning away)
					_film_floor("smoke", p["t"], Vector2(p["x"], p["y"]))
				else:
					_draw_smoke(p)
			"sigil":
				# (THE GAME'S OWN, art/action_f2_fx.ts sigilPainted: the ring traced round and filling, the floor burning on)
				if not _floor_of(p):
					_draw_sigil(p)
			"rime":
				# (THE GAME'S OWN, rimePainted: spreading, lying, melting in)
				if not _floor_of(p):
					_draw_rime(p)
			"am_lines", "am_ring", "am_drop", "am_arm":
				# (the Ossuary Amalgamation's, floor 4's boss: at the foot of this file)
				_am_draw(p)
			"st_coals", "st_rake", "st_ring", "st_blast":
				# (THE STOKER'S, floor 3's furnace keeper: at the foot of this file)
				_draw_st(p)
			"co_crack", "co_ring", "co_left", "co_aim", "co_reach", "co_flung":
				_draw_co(p)
			"kb_knife", "kb_ball", "kb_sigil", "kb_ring", "kb_reach":
				_draw_kb(p)


## The slam's ring (a stand-in for art/action_f3_fx.ts): out to its edge over RING.wave, easing; breaking up over RING.fade;
## the cracks it leaves fading to RING.long.
func _draw_slam_ring(p: Dictionary) -> void:
	var t: float = p["t"]
	var k := clampf(t / MM.RING["wave"], 0.0, 1.0)
	var out: float = p["r"] * (1.0 - pow(1.0 - k, 3.0))
	var fade := clampf(1.0 - (t - MM.RING["wave"]) / MM.RING["fade"], 0.0, 1.0)
	if fade > 0.0:
		draw_polyline(_ring(p["x"], p["y"], out, 48), Color(1.0, 0.8, 0.84, fade), 5.0)
		draw_polyline(_ring(p["x"], p["y"], out * 0.86, 48), Color(ENEMY, 0.7 * fade), 3.0)
	# (the cracks: short dark strokes out from the middle, fading)
	var left := clampf(1.0 - t / MM.RING["long"], 0.0, 1.0)
	for i in 9:
		var a := TAU * i / 9.0 + 0.3
		var from := Iso.to_screen(p["x"] + cos(a) * 0.35, p["y"] + sin(a) * 0.35)
		var to := Iso.to_screen(p["x"] + cos(a + 0.12) * p["r"] * (0.55 + 0.3 * sin(i * 2.7)), p["y"] + sin(a + 0.12) * p["r"] * (0.55 + 0.3 * sin(i * 2.7)))
		draw_line(from, to, Color(SHADOW, 0.55 * left), 2.0)


## The burning smoke (a stand-in for the game's): a low cloud of dull red-grey over its round of floor, coming in over the
## first 0.3 s and thinning over the last 0.6, its edge the enemy's pink, embers in it.
func _draw_smoke(p: Dictionary) -> void:
	var t: float = p["t"]
	var a := clampf(t / 0.3, 0.0, 1.0) * clampf((MM.SMOKE["dur"] - t) / 0.6, 0.0, 1.0)
	var R: float = MM.SMOKE["r"]
	draw_colored_polygon(_ring(p["x"], p["y"], R), Color(0.42, 0.2, 0.2, 0.42 * a))
	draw_colored_polygon(_ring(p["x"], p["y"], R * 0.6), Color(0.62, 0.3, 0.22, 0.3 * a))
	draw_polyline(_ring(p["x"], p["y"], R), Color(ENEMY, 0.75 * a), 2.0)
	for i in 7:
		var ang := i * 2.4 + t * 0.7
		var d := R * (0.25 + 0.6 * fmod(i * 0.37 + t * 0.21, 1.0))
		var at := Iso.to_screen(p["x"] + cos(ang) * d, p["y"] + sin(ang) * d) + Vector2(0, -6.0 - 22.0 * fmod(t * 0.9 + i * 0.31, 1.0))
		draw_rect(Rect2(at, Vector2(2, 2)), Color(1.0, 0.72, 0.3, 0.8 * a))


## (render.ts ringDots) A ring of single game pixels round a circle of `r` tiles on the floor, every `gap`th of them.
func _ring_dots(x: float, y: float, r: float, c: Color, gap := 1) -> void:
	var o := Iso.to_screen(x, y) / 2.0
	var n := maxi(16, roundi(r * 44.0))
	for i in range(0, n, gap):
		var a := float(i) / n * TAU
		draw_rect(Rect2(roundf(o.x + (cos(a) - sin(a)) * 16.0 * r) * 2.0, roundf(o.y + (cos(a) + sin(a)) * 8.0 * r) * 2.0, 2.0, 2.0), c)


## A line of the game's pixels from one point of the screen to another (game pixels), every `every`th one of it
## (art/charge_lane.ts line).
func _px_line(from: Vector2, to: Vector2, c: Color, every := 1) -> void:
	var x0 := roundi(from.x)
	var y0 := roundi(from.y)
	var x1 := roundi(to.x)
	var y1 := roundi(to.y)
	var dx := absi(x1 - x0)
	var dy := -absi(y1 - y0)
	var sx := 1 if x0 < x1 else -1
	var sy := 1 if y0 < y1 else -1
	var err := dx + dy
	for n in 600:
		if n % every == 0:
			draw_rect(Rect2(x0 * 2.0, y0 * 2.0, 2.0, 2.0), c)
		if x0 == x1 and y0 == y1:
			break
		var e2 := 2 * err
		if e2 >= dy:
			err += dy
			x0 += sx
		if e2 <= dx:
			err += dx
			y0 += sy


## THE LINE OF A CHARGE on the floor, at its moment (art/charge_lane.ts drawChargeLane): the circle's own kind: the same reds,
## the same faint ground that darkens as the moment comes, the same fill that runs to the far end as the wind-up runs out,
## its two edges dotted and its far end, and chevrons along it pointing the way he will come, bright where the fill has
## reached. While he runs it, what he has left behind is gone and the rest fades a little.
func _lane_at(a: Vector2, b: Vector2, h: float, k: float, gone: float) -> void:
	var len := a.distance_to(b)
	if len < 0.05:
		return
	var f := (b - a) / len
	var c := Vector2(-f.y, f.x)
	var from := gone * len
	var fade := 1.0 - 0.35 * gone
	# (a point `along` tiles along it and `across` across it: on the screen, picture pixels; and in game pixels)
	var pt := func(along: float, across: float) -> Vector2:
		var w: Vector2 = a + f * along + c * across
		return Iso.to_screen(w.x, w.y)
	draw_colored_polygon(PackedVector2Array([pt.call(from, h), pt.call(len, h), pt.call(len, -h), pt.call(from, -h)]), Color(BL3, (0.16 + 0.3 * k) * fade))
	var run := maxf(from, len * k)
	if run > from + 0.01:
		draw_colored_polygon(PackedVector2Array([pt.call(from, h), pt.call(run, h), pt.call(run, -h), pt.call(from, -h)]), Color(BL4, 0.3 * fade))
	for side in [-1.0, 1.0]:
		_px_line(pt.call(from, h * side) / 2.0, pt.call(len, h * side) / 2.0, Color(BL5, fade), 2)
	_px_line(pt.call(len, h) / 2.0, pt.call(len, -h) / 2.0, Color(BL5, fade))
	var at := 0.55 * 0.75
	while at < len - 0.15:
		if at >= from:
			var lit := at <= run
			var tip: Vector2 = pt.call(at + 0.12, 0.0) / 2.0
			for side in [-1.0, 1.0]:
				_px_line(pt.call(at - 0.12, h * 0.62 * side) / 2.0, tip, Color(BL5 if lit else BL4, fade * (1.0 if lit else 0.55)))
		at += 0.55


## The fire sigil (a stand-in for the art chat's pictures, art/action_f2_fx.ts sigilPainted): its ring traced round under the hero as
## the cultist casts, its inner ring and marks brightening; the pillar of fire as it erupts; the floor burning on, shrinking in.
func _draw_sigil(p: Dictionary) -> void:
	var t: float = p["t"]
	var R: float = MM.SIGIL["radius"]
	var fire := Color(1.0, 0.62, 0.22)
	var hot := Color(1.0, 0.98, 0.9)
	if t < 0.0:
		var k := clampf(1.0 - (-t) / maxf(0.01, float(p["cast"])), 0.0, 1.0)
		var traced := clampf(k / 0.4, 0.0, 1.0)
		var ring := _ring(p["x"], p["y"], R, 48)
		var n := maxi(2, int(ring.size() * traced))
		draw_polyline(ring.slice(0, n), Color(ENEMY, 0.85), 3.0)
		draw_colored_polygon(_ring(p["x"], p["y"], R), Color(fire, 0.08 + 0.22 * k))
		if k > 0.4:
			draw_polyline(_ring(p["x"], p["y"], R * 0.62), Color(fire, 0.4 + 0.5 * k), 2.0)
		return
	var pillar: float = MM.SIGIL["pillar"] + MM.SIGIL["fall"]
	if t < pillar:
		var up := 1.0 - clampf((t - MM.SIGIL["pillar"]) / MM.SIGIL["fall"], 0.0, 1.0)
		var base := Iso.to_screen(p["x"], p["y"])
		var half := R * 32.0 * 0.8
		var tall := 200.0 * up
		draw_colored_polygon(PackedVector2Array([base + Vector2(-half, 0), base + Vector2(-half * 0.7, -tall), base + Vector2(half * 0.7, -tall), base + Vector2(half, 0)]), Color(fire, 0.55 * up))
		draw_colored_polygon(PackedVector2Array([base + Vector2(-half * 0.4, 0), base + Vector2(-half * 0.25, -tall * 0.9), base + Vector2(half * 0.25, -tall * 0.9), base + Vector2(half * 0.4, 0)]), Color(hot, 0.7 * up))
	var rr := MM.burn_radius(t)
	if rr > 0.02:
		draw_colored_polygon(_ring(p["x"], p["y"], rr), Color(fire, 0.32))
		draw_polyline(_ring(p["x"], p["y"], rr), Color(ENEMY, 0.7), 2.0)


## The rime (a stand-in for art/action_f2_fx.ts rimePainted): a ragged crust of pale grey-blue frost, spreading, then melting in.
func _draw_rime(p: Dictionary) -> void:
	var t: float = p["t"]
	var pts := PackedVector2Array()
	for k in 40:
		var a := TAU * k / 40.0
		var e := MM.rime_edge(t, a)
		pts.append(Iso.to_screen(p["x"] + cos(a) * e, p["y"] + sin(a) * e))
	if MM.rime_edge(t, 0.0) <= 0.01:
		return
	var frost := Color(0.78, 0.8, 0.9)
	draw_colored_polygon(pts, Color(frost, 0.35))
	pts.append(pts[0])
	draw_polyline(pts, Color(0.62, 0.65, 0.8, 0.8), 2.0)


func _draw_bars(p: Dictionary) -> void:
	var room: Dictionary = p["room"]
	var x0: float = room["x"]
	var x1: float = room["x"] + room["w"]
	var y0: float = room["y"]
	var y1: float = room["y"] + room["h"]
	var t: float = p["t"]
	if t < 0.0:
		# (the bars' shadows across the floor as his keys go up, darker as the crash comes)
		var k := clampf(1.0 + t, 0.0, 1.0)
		var c := Color(SHADOW, 0.25 + 0.5 * k)
		for ry in p["rx"]:
			draw_line(Iso.to_screen(x0, ry), Iso.to_screen(x1, ry), c, 6.0)
		for rx in p["ry"]:
			draw_line(Iso.to_screen(rx, y0), Iso.to_screen(rx, y1), c, 6.0)
		return
	# (standing: iron bars along every row, 52 game pixels tall, sinking away at the end)
	var stand: float = MM.LOCKDOWN["stand"]
	var sink := clampf((t - stand) / MM.LOCKDOWN["rise"], 0.0, 1.0)
	var tall := 104.0 * (1.0 - sink)
	var iron := Color(0.55, 0.52, 0.66)
	var hot := Color(ENEMY, 0.6 * (1.0 - sink))
	for ry in p["rx"]:
		var x := x0 + 0.25
		while x < x1:
			var at := Iso.to_screen(x, ry)
			draw_line(at, at + Vector2(0, -tall), iron, 3.0)
			x += 0.5
		draw_line(Iso.to_screen(x0, ry) + Vector2(0, -tall), Iso.to_screen(x1, ry) + Vector2(0, -tall), hot, 3.0)
	for rx in p["ry"]:
		var y := y0 + 0.25
		while y < y1:
			var at := Iso.to_screen(rx, y)
			draw_line(at, at + Vector2(0, -tall), iron, 3.0)
			y += 0.5
		draw_line(Iso.to_screen(rx, y0) + Vector2(0, -tall), Iso.to_screen(rx, y1) + Vector2(0, -tall), hot, 3.0)


# =============================================================================================
# THE OSSUARY AMALGAMATION'S (floor 4's boss: amalgam.gd): what its moves mark on the floor and leave there (game/bosses.ts
# amActing, stepAmPeril, and stepPerils' 'arm'). Stand-ins for the game's own pictures of them (render/act1_fx/amalgam.ts and
# render/bossfx.ts, from art/amalgam_action_fx.ts). Each carries its own numbers, `n`, as amalgam.gd gives them.
#   am_lines  lines marked on the floor before it while it winds up: its grasping fan's dozen arms, its devour's cone. Drawn
#             from where it stands (they go with it), running out and brightening. Harmless: the blow is its own.
#   am_ring   its weight landing: a ring going out over the floor round where its hands come down, the floor cracked a
#             while. Harmless: what strikes is the skulls and the arms.
#   am_drop   a skull of its bone rain. Its clock runs up to its landing (its 0) and on to its scuff's end: for the last `fly`
#             seconds before it lands its shadow is on the floor, growing, the reach of its burst ringed round it, and the
#             skull comes down out of its niche in the wall; at 0 it bursts, a hero within `r` struck; `mite_at` on, a bone
#             mite pulls itself together there (`form`, amalgam.gd's, is called with the place).
#   am_arm    a hole of arms of the dead. Its crack glows `warn` before; at `hit` the arms burst up, and `up` after a hero
#             within `r` is struck; they claw at the air `time`, sinking back at the last, and the crack fades over `after`.

const AM_BONE := Color(0.94, 0.91, 1.0)
const AM_BONE_DEEP := Color(0.69, 0.64, 0.88)
## (how ragged a crack's six ways are: a share each, the same every time)
const AM_RAG := [0.12, 0.83, 0.41, 0.66, 0.27, 0.95]

var _am_heard := 0.0


## Lines marked on the floor before monster `src`, each [from, to] as (tiles before it, tiles to the left it is drawn with,
## `hand`), for `dur` seconds: run out to their full length over `grow` seconds (0: whole at once, brightening over `dur`);
## `claws`: a claw's three slashes at each line's end once it is out.
func am_lines(src: Object, hand: int, segs: Array, dur: float, grow: float, claws: bool) -> void:
	list.append({"kind": "am_lines", "src": src, "hand": hand, "segs": segs, "t": 0.0, "dur": dur, "grow": grow, "claws": claws})


## The ring of its slam, `r` tiles round (x, y); `n`: {wave, fade, long}.
func am_ring(x: float, y: float, r: float, n: Dictionary) -> void:
	list.append({"kind": "am_ring", "x": x, "y": y, "r": r, "t": 0.0, "n": n})


## A skull of the bone rain that will land at (x, y) `land` seconds from now, falling from its niche at `from`; `which`: its
## own number among the rain's (for its picture, when it has one); `n`: {fly, r, mite_at, scuff, high}; `form`: called with
## where it burst, to make its mite.
func am_drop(x: float, y: float, land: float, dmg: float, from: Vector2, which: int, n: Dictionary, form: Callable) -> void:
	list.append({"kind": "am_drop", "x": x, "y": y, "t": -land, "dmg": dmg, "from": from, "which": which, "n": n, "form": form, "done": 0})


## A hole of arms of the dead at (x, y), bursting up `hit` seconds from now; `n`: {warn, up, r, time, after}.
func am_arm(x: float, y: float, hit: float, dmg: float, n: Dictionary) -> void:
	list.append({"kind": "am_arm", "x": x, "y": y, "t": 0.0, "hit": hit, "dmg": dmg, "n": n, "done": 0})


## A step of one of them (its clock has run on already); false: it is over.
func _am_step(p: Dictionary) -> bool:
	var at := Vector2(p.get("x", 0.0), p.get("y", 0.0))
	match p["kind"]:
		"am_lines":
			# (they are its own: gone with it)
			var s = p["src"]
			return p["t"] < p["dur"] and is_instance_valid(s) and not s.dead
		"am_ring":
			return p["t"] < p["n"]["long"]
		"am_drop":
			var n: Dictionary = p["n"]
			if p["done"] == 0 and p["t"] >= 0.0:
				# (it bursts where it lands)
				p["done"] = 1
				if hero.alive and hero.world.distance_to(at) <= n["r"]:
					hero.hurt(p["dmg"])
				hero.kick(0.6)
				# (heard, but not every skull of a wave at once: they would take every voice there is)
				var now := Time.get_ticks_msec() / 1000.0
				if now - _am_heard >= 0.04:
					_am_heard = now
					sfx.play("hit", -12.0)
			if p["done"] == 1 and p["t"] >= n["mite_at"]:
				p["done"] = 2
				var form: Callable = p["form"]
				if form.is_valid():
					form.call(at)
			return p["t"] < n["scuff"]
		"am_arm":
			var n: Dictionary = p["n"]
			if p["done"] == 0 and p["t"] >= p["hit"] + n["up"]:
				# (the arms are up: whoever stands over them is struck)
				p["done"] = 1
				if hero.alive and hero.world.distance_to(at) <= n["r"]:
					hero.hurt(p["dmg"])
				hero.kick(1.0)
			return p["t"] < p["hit"] + n["time"] + n["after"]
	return false


## A point (tiles before it, tiles to the left it is drawn with) of a figure at `world` facing `f`, on the screen.
func _am_at(world: Vector2, f: Vector2, hand: float, v: Vector2) -> Vector2:
	return Iso.to_screen(world.x + f.x * v.x + f.y * hand * v.y, world.y + f.y * v.x - f.x * hand * v.y)


## The same place, on the floor (tiles).
func _am_world(world: Vector2, f: Vector2, hand: float, v: Vector2) -> Vector2:
	return Vector2(world.x + f.x * v.x + f.y * hand * v.y, world.y + f.y * v.x - f.x * hand * v.y)


## An oval on the screen round `c` (picture pixels), closed.
func _am_oval(c: Vector2, rx: float, ry: float, n := 20) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in n + 1:
		var a := TAU * i / n
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
	return pts


func _am_draw(p: Dictionary) -> void:
	var t: float = p["t"]
	match p["kind"]:
		"am_lines":
			var src = p["src"]
			if not is_instance_valid(src):
				return
			var grow: float = p["grow"]
			var k := clampf(t / (grow if grow > 0.0 else float(p["dur"])), 0.0, 1.0)
			# (THE GAME'S OWN: each line in the warning's dots, drawn out from it; a claw's three slashes where it will close:
			# render/act1_fx/amalgam.ts)
			for s in p["segs"]:
				var a: Vector2 = s[0]
				var b: Vector2 = a.lerp(s[1], k) if grow > 0.0 else s[1]
				var wa := _am_world(src.world, src.face, p["hand"], a)
				var wb := _am_world(src.world, src.face, p["hand"], b)
				_dot_line(wa, wb, k)
				if p["claws"] and k > 0.95:
					var e := Iso.to_screen(wb.x, wb.y) / 2.0
					for j in [-1, 0, 1]:
						for i in range(-3, 4):
							draw_rect(Rect2(roundf(e.x + i + j * 3) * 2.0, roundf(e.y + i * 0.5 - j) * 2.0, 2.0, 2.0), FLAME3)
		"am_ring":
			var n: Dictionary = p["n"]
			var r: float = p["r"]
			var fm := _film_of(p)
			if has_film(fm[0]):
				_film_floor(fm[0], t, fm[2])
				return
			var reach := r * (1.0 - pow(1.0 - clampf(t / n["wave"], 0.0, 1.0), 3.0))
			var a := 1.0 - clampf((t - n["wave"]) / n["fade"], 0.0, 1.0)
			if a > 0.0:
				draw_polyline(_ring(p["x"], p["y"], reach), Color(1, 0.75, 0.8, a), 4.0)
				draw_polyline(_ring(p["x"], p["y"], reach * 0.9), Color(AM_BONE, a * 0.6), 2.0)
			# (the floor cracked round where it landed, fading)
			var left := 1.0 - clampf(t / n["long"], 0.0, 1.0)
			for i in 12:
				var ang := TAU * i / 12.0 + 0.4 * sin(i * 5.3)
				var d := Vector2(cos(ang), sin(ang))
				var from := 0.35 * r
				var to := minf(reach, r * (0.7 + 0.25 * sin(i * 3.1)))
				if to > from:
					draw_line(Iso.to_screen(p["x"] + d.x * from, p["y"] + d.y * from), Iso.to_screen(p["x"] + d.x * to, p["y"] + d.y * to), Color(SHADOW, 0.55 * left), 2.0)
		"am_drop":
			var n: Dictionary = p["n"]
			if t < -n["fly"]:
				return
			var fm := _film_of(p)
			if has_film(fm[0]):
				# (THE GAME'S OWN: its shadow and its mark the second before it lands, its burst and its scuff after; the skull
				# itself over everything: _draw_air)
				_film_floor(fm[0], t, fm[2])
				return
			var at := Iso.to_screen(p["x"], p["y"])
			if t < 0.0:
				# (its shadow, growing and darkening as it comes down; the reach of its burst ringed round it, filling in)
				var k := clampf(1.0 + t / n["fly"], 0.0, 1.0)
				var rx := 7.0 + 20.0 * k * k
				draw_colored_polygon(_am_oval(at, rx, rx * 0.5), Color(SHADOW, 0.25 + 0.6 * k))
				draw_polyline(_ring(p["x"], p["y"], n["r"]), Color(ENEMY, 0.3 + 0.6 * k), 2.0)
				# (the skull: thrown out of its niche in the wall and in over the floor high, down steep at the last onto its
				# shadow: art/amalgam_action_fx.ts dropAt, its height in game pixels)
				var from: Vector2 = p["from"]
				var w := from.lerp(Vector2(p["x"], p["y"]), 1.0 - pow(1.0 - k, 2.2))
				var z: float = 46.0 * (1.0 - k) + n["high"] * sin(PI * minf(1.0, k * 0.62 + 0.38 * k * k)) * (1.0 - k) + 300.0 * k * (1.0 - k) * (1.0 - k)
				var s := Iso.to_screen(w.x, w.y) - Vector2(0, maxf(0.0, z) * 2.0)
				draw_line(s + Vector2(0, -8), s + Vector2(0, -30), Color(ENEMY, 0.5), 3.0)
				draw_circle(s, 9.0, AM_BONE)
				draw_circle(s + Vector2(-3, 0), 2.0, ENEMY)
				draw_circle(s + Vector2(3, 0), 2.0, ENEMY)
				return
			# (it bursts where it lands: a flash; a band of bone dust out to its reach in 0.12 s, fading; the scuff where it struck)
			var scuff: float = 1.0 - clampf((t - 0.6) / (n["scuff"] - 0.6), 0.0, 1.0)
			draw_colored_polygon(_am_oval(at, 18.0, 8.0), Color(SHADOW, 0.5 * scuff))
			var reach: float = n["r"] * (1.0 - pow(1.0 - clampf(t / 0.12, 0.0, 1.0), 3.0))
			var left := 1.0 - clampf((t - 0.12) / 0.25, 0.0, 1.0)
			if left > 0.0:
				draw_polyline(_ring(p["x"], p["y"], reach), Color(AM_BONE, left), 3.0)
			if t < 0.08:
				draw_circle(at + Vector2(0, -12), 4.0 + 8.0 * (1.0 - t / 0.08), Color(1, 0.97, 0.92, 0.8))
		"am_arm":
			var n: Dictionary = p["n"]
			var u: float = t - float(p["hit"])
			if u < -n["warn"]:
				return
			if has_film("am_arm_crack"):
				# (THE GAME'S OWN: the floor cracking open and glowing, art/boss_shots.ts drawArmCrack; the arms stand among the
				# figures: _film_of)
				_film_floor("am_arm_crack", u, Vector2(p["x"], p["y"]))
				return
			var at := Iso.to_screen(p["x"], p["y"])
			var stay: float = n["time"]
			# (the floor cracking open there, out every way, its cracks glowing brighter and longer as the arms come; dark round
			# the hole while they are up; fading after: art/boss_shots.ts drawArmCrack)
			var coming: float = 1.0 + u / n["warn"] if u < 0.0 else 1.0
			var fade: float = 1.0 if u < stay else clampf(1.0 - (u - stay) / n["after"], 0.0, 1.0)
			var hot: float = 0.35 + 0.65 * coming if u < 0.0 else clampf(1.0 - u / 0.25, 0.0, 1.0)
			for i in 6:
				var ang: float = TAU * i / 6.0 + 0.7 * AM_RAG[i]
				var long: float = (0.28 + 0.2 * AM_RAG[5 - i]) * (0.35 + 0.65 * coming)
				var tip := Iso.to_screen(p["x"] + cos(ang) * long, p["y"] + sin(ang) * long)
				draw_line(at, tip, Color(GOLD if hot > 0.6 else ENEMY, fade) if hot > 0.1 else Color(SHADOW, 0.8 * fade), 2.0)
			if u < 0.0:
				draw_circle(at, 3.0 + 4.0 * coming, Color(GOLD, 0.25 + 0.35 * coming))
				return
			if u >= stay:
				return
			# (the hole, and four arms of the dead thrust up out of it in 0.15 s, clawing, swaying; sunk back by the end:
			# art/amalgam_action_fx.ts bigArmsPainted)
			var out: float = 1.0 - pow(1.0 - u / 0.15, 2.0) if u < 0.15 else 1.0 - smoothstep(0.0, 1.0, (u - 1.0) / (stay - 0.12 - 1.0))
			draw_colored_polygon(_ring(p["x"], p["y"], 0.35), Color(SHADOW, 0.9))
			draw_polyline(_ring(p["x"], p["y"], 0.35), Color(ENEMY, 0.8), 2.0)
			for k in 4:
				var base := at + Vector2(-12.0 + 8.0 * k, 3.0 * sin(k * 2.0))
				var sway := sin(u * 7.0 + k * 2.1) * 6.0
				var elbow := base + Vector2(sway * 0.5, -34.0 * out)
				var hand := elbow + Vector2(sway + (k - 1.5) * 5.0, -30.0 * out)
				draw_line(base, elbow, AM_BONE_DEEP, 5.0)
				draw_line(elbow, hand, AM_BONE, 4.0)
				draw_circle(hand, 4.0, AM_BONE)


# =====================================================================================================================
# THE CHAINED ONE'S (floor 3's boss: chained.gd, whose numbers these read). What his moves mark on the floor and leave on
# it, ALL DRAWN ONLY: his blows are his own, and his red circles are `mark`, above. (game/bosses.ts CO_CRACK, CO_RING_PERIL
# and the 'left' peril; the game draws them from the art chat's pictures, render/act1_fx/chained.ts and render/bossfx.ts:
# these are stand-ins.)
#   co_crack  his lash's finisher: its lane marked as his fists go up, from half a tile before him to the crack's end, as
#             wide as it strikes; from the blow, the crack running out along it, red-hot, then dark, then closing.
#   co_ring   a ring going out over the floor from a slam (his whirl's, the blow waiting's, the ball's), and the cracks
#             it opens.
#   co_left   what a chain he has broken leaves lying where he stood: his left chain (0), or the ball and its chain (1).
#   co_aim    the line his hook will fly along, run out as he aims it.
#   co_reach  how far his chains will reach, a ring round him as he gathers them for his whirl.
#   co_flung  his hook or his ball out across the room, and the chain to it; the ball's shadow where it will land; the
#             scratch of what he hauls back. chained.gd says where it is at every step of his.

const Chained := preload("res://scripts/chained.gd")
const CO_IRON := Color(0.5, 0.48, 0.6)
const CO_INK := Color(0.05, 0.05, 0.09)
const CO_DUST := Color(0.78, 0.76, 0.86)


## His lash's finisher, from where he stands (`at`) the way he faces (`way`): its lane for `warn` seconds, then the crack.
func co_crack(src: Object, at: Vector2, way: Vector2, warn: float) -> void:
	list.append({"kind": "co_crack", "x": at.x, "y": at.y, "way": way, "t": -warn, "warn": warn, "src": src})


## A ring going out from a slam at (x, y), `r` tiles round.
func co_ring(x: float, y: float, r: float) -> void:
	list.append({"kind": "co_ring", "x": x, "y": y, "r": r, "t": 0.0})


## What a broken chain leaves lying where he stood (`at`, facing `way`, drawn with `hand`): `which` 0 his left chain, 1
## the ball.
func co_left(at: Vector2, way: Vector2, hand: int, which: int) -> void:
	list.append({"kind": "co_left", "x": at.x, "y": at.y, "way": way, "hand": hand, "which": which, "t": 0.0})


## The line his hook will fly along, from `a` to `b`, run out over `dur` seconds.
func co_aim(src: Object, a: Vector2, b: Vector2, dur: float) -> void:
	list.append({"kind": "co_aim", "a": a, "b": b, "t": 0.0, "dur": dur, "src": src})


## How far his chains will reach, `r` round (x, y), for `dur` seconds.
func co_reach(src: Object, x: float, y: float, r: float, dur: float) -> void:
	list.append({"kind": "co_reach", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "src": src})


## His hook or his ball (`what`) out across the room now: over the floor at `at`, `high` game pixels up, flying or hauled
## along the floor; its chain from over `hand` (`hand_high` up); `far`, where it bit or will land; `k`, how near to landing
## the ball is (0 to 1).
func co_flung(src: Object, what: String, at: Vector2, high: float, flying: bool, hand: Vector2, hand_high: float, far: Vector2, k: float) -> void:
	var p := {}
	for q in list:
		if q["kind"] == "co_flung" and q.get("src") == src:
			p = q
	if p.is_empty():
		p = {"kind": "co_flung", "t": 0.0, "src": src}
		list.append(p)
	p["what"] = what
	p["at"] = at
	p["high"] = high
	p["flying"] = flying
	p["hand"] = hand
	p["hand_high"] = hand_high
	p["far"] = far
	p["k"] = k


## Whether one of them stays on: each for its own length; what warns of a blow, or is in his hands, goes with him if he falls.
func _co_stays(p: Dictionary) -> bool:
	var s = p.get("src")
	var fell: bool = s != null and (not is_instance_valid(s) or s.dead)
	match p["kind"]:
		"co_crack":
			# (he fell with his fists still up: the blow never came, and its lane goes)
			return p["t"] < Chained.CRACK["long"] and not (fell and p["t"] < 0.0)
		"co_ring":
			return p["t"] < Chained.RING["long"]
		"co_left":
			return true
		"co_aim", "co_reach":
			return p["t"] < p["dur"] and not fell
	return not fell


func _draw_co(p: Dictionary) -> void:
	var t: float = p["t"]
	match p["kind"]:
		"co_crack":
			_draw_co_crack(p, t)
		"co_ring":
			_draw_co_ring(p, t)
		"co_left":
			_draw_co_left(p)
		"co_aim":
			# (THE GAME'S OWN: the line his hook will fly along, as the marksman's line of aim is drawn: art/mob_shots.ts drawAimLine)
			_aim_line(p["a"], p["b"], clampf(t / maxf(0.01, float(p["dur"])), 0.0, 1.0), _clock)
		"co_reach":
			# (THE GAME'S OWN: his chains' reach marked round him as he gathers them: art/boss_shots.ts drawSweepRing)
			_sweep_ring(p["x"], p["y"], p["r"], clampf(t / maxf(0.01, float(p["dur"]) - 0.05), 0.0, 1.0), _clock)
		"co_flung":
			_draw_co_flung(p)


func _draw_co_crack(p: Dictionary, t: float) -> void:
	var c: Dictionary = Chained.CRACK
	var from: float = c["from"]
	var to: float = c["to"]
	var half: float = c["half"]
	var o := Vector2(p["x"], p["y"])
	var way: Vector2 = p["way"]
	var side := Vector2(-way.y, way.x)
	var fm := _film_of(p)
	if has_film(fm[0]):
		# (THE GAME'S OWN: its lane as his fists go up, the game's charge lane, drawChargeLane; from the blow, the crack's film)
		if t < 0.0:
			_lane_at(o + way * 0.5, o + way * to, half, clampf(1.0 + t / maxf(0.01, float(p["warn"])), 0.0, 1.0), 0.0)
		else:
			_film_floor(fm[0], t, fm[2])
		return
	if t < 0.0:
		# (its lane, filling from his end as his fists stay up)
		var k := clampf(1.0 + t / maxf(0.01, float(p["warn"])), 0.0, 1.0)
		var lane := _band(o + way * 0.5, o + way * to, half)
		draw_colored_polygon(lane, Color(ENEMY, 0.12))
		if k > 0.02:
			draw_colored_polygon(_band(o + way * 0.5, o + way * lerpf(0.5, to, k), half), Color(ENEMY, 0.22))
		lane.append(lane[0])
		draw_polyline(lane, Color(ENEMY, 0.85), 2.0)
		return
	var reach := Chained.crack_reach(t)
	# (the floor heaved along it as it runs: the enemy's pink at its edges, as wide as it strikes)
	var heave := 1.0 - clampf((t - float(c["run"])) / 0.35, 0.0, 1.0)
	if heave > 0.0:
		for sg in [-1.0, 1.0]:
			var e0: Vector2 = o + way * 0.5 + side * (half * sg)
			var e1: Vector2 = o + way * reach + side * (half * sg)
			draw_line(Iso.to_screen(e0.x, e0.y), Iso.to_screen(e1.x, e1.y), Color(ENEMY, 0.75 * heave), 2.0)
	# (the crack: a jagged split from where his fists came down, as far as it has run; red-hot at first, closing at the last)
	var hot := 1.0 - clampf(t / 0.6, 0.0, 1.0)
	var left := 1.0 - clampf((t - 1.1) / (float(c["long"]) - 1.1), 0.0, 1.0)
	var pts := PackedVector2Array()
	var n := maxi(2, ceili((reach - from) / 0.25))
	for i in n + 1:
		var a := from + (reach - from) * i / n
		var q: Vector2 = o + way * a + side * (0.1 * sin(i * 2.4 + 1.3) if i > 0 and i < n else 0.0)
		pts.append(Iso.to_screen(q.x, q.y))
	draw_polyline(pts, Color(CO_INK, 0.95 * left), 5.0)
	if hot > 0.0:
		draw_polyline(pts, Color(1.0, 0.55, 0.4, hot), 2.0)


func _draw_co_ring(p: Dictionary, t: float) -> void:
	var g: Dictionary = Chained.RING
	var rad: float = p["r"]
	var o := Vector2(p["x"], p["y"])
	var fm := _film_of(p)
	if has_film(fm[0]):
		# (THE GAME'S OWN ring of that radius: art/chained_action_fx.ts ringPainted)
		_film_floor(fm[0], t, o)
		return
	var reach := Chained.ring_reach(t, rad)
	# (the cracks it opens, out from its middle: red-hot at first, then dark, gone by its end)
	var hot := 1.0 - clampf(t / 0.45, 0.0, 1.0)
	var left := 1.0 - clampf((t - 1.0) / (float(g["long"]) - 1.0), 0.0, 1.0)
	var n := maxi(7, roundi(5.0 + rad * 2.5))
	for i in n:
		var a := TAU * i / n + 0.4 * sin(i * 12.9898)
		var far := minf(reach, rad * (0.38 + 0.34 * absf(sin(i * 78.233 + 2.0))))
		if far <= 0.25:
			continue
		var way := Vector2(cos(a), sin(a))
		var e0 := Iso.to_screen(o.x + way.x * 0.22, o.y + way.y * 0.22)
		var e1 := Iso.to_screen(o.x + way.x * far, o.y + way.y * far)
		draw_line(e0, e1, Color(CO_INK, 0.85 * left), 3.0)
		if hot > 0.0:
			draw_line(e0, e1, Color(1.0, 0.55, 0.4, 0.9 * hot), 1.0)
	# (the ring going out over the floor, the enemy's pink at its leading edge, breaking up)
	var wave: float = g["wave"]
	var band := 1.0 - clampf((t - wave) / float(g["fade"]), 0.0, 1.0)
	if band > 0.0 and reach > 0.15:
		var ring := _ring(o.x, o.y, reach, 56)
		draw_polyline(ring, Color(CO_DUST, 0.75 * band), 5.0)
		if t <= wave + 0.06:
			draw_polyline(ring, Color(ENEMY, 0.9), 2.0)


func _draw_co_left(p: Dictionary) -> void:
	var o := Vector2(p["x"], p["y"])
	var way: Vector2 = p["way"]
	var hand: int = p["hand"]
	var v := _view_of(way)
	var film := "co_left_%d_%s" % [int(p["which"]), v[0]]
	if has_film(film):
		# (THE GAME'S OWN picture of what his breaking chain left lying, as he was seen then: art/bosses3.ts makeLeftBehindArt)
		_film_pic(self, film, "floor", 0, Iso.to_screen(o.x, o.y), v[1])
		return
	if int(p["which"]) == 0:
		# (his left chain, lying where it fell beside him)
		_co_chain(_co_lying(o, way, hand, Vector2(0.25, 0.7), Vector2(1.05, 1.25)))
		return
	# (the ball where it lay behind him, and its chain run out from where he stood)
	var b := Chained.beside(o, way, hand, -0.87, 0.46)
	_co_chain(_co_lying(o, way, hand, Vector2(-0.15, 0.05), Vector2(-0.75, 0.42)))
	_co_ball(Iso.to_screen(b.x, b.y) + Vector2(0.0, -8.0))


func _draw_co_flung(p: Dictionary) -> void:
	var at: Vector2 = p["at"]
	var far: Vector2 = p["far"]
	var flying: bool = p["flying"]
	var ball: bool = p["what"] == "ball"
	var s := Iso.to_screen(at.x, at.y)
	var end := s + Vector2(0.0, -2.0 * float(p["high"]))
	if ball and flying:
		# (the ball's shadow where it will come down, darker and wider as it nears)
		var k: float = p["k"]
		draw_colored_polygon(_ring(far.x, far.y, 0.13 + 0.27 * k, 20), Color(0.0, 0.0, 0.0, 0.2 + 0.55 * k))
	if not flying and at.distance_to(far) > 0.05:
		# (THE GAME'S OWN: what he hauls in scrapes the floor, a pale scratch back the way it has come: drawScrape)
		_scrape(at, far, 1.0)
	if has_film("co_%s_front" % ("ball" if ball else "hook")):
		# (THE GAME'S OWN pictures of his hook and his ball stand among the figures (_flung_step), their chain over them (_draw_air))
		return
	# (its chain, out from his hand)
	var h: Vector2 = p["hand"]
	var from := Iso.to_screen(h.x, h.y) + Vector2(0.0, -2.0 * float(p["hand_high"]))
	draw_line(from, end, Color(CO_INK, 0.9), 5.0)
	draw_dashed_line(from, end, CO_IRON, 2.0, 4.0)
	if ball:
		_co_ball(end)
		return
	# (the hook: a barbed iron claw)
	var way := (end - from).normalized()
	var across := Vector2(-way.y, way.x)
	draw_line(end - way * 6.0, end + way * 6.0, CO_INK, 5.0)
	draw_line(end + way * 6.0, end + way * 1.0 + across * 6.0, CO_IRON, 3.0)
	draw_line(end + way * 6.0, end + way * 1.0 - across * 6.0, CO_IRON, 3.0)
	draw_line(end - way * 5.0, end + way * 6.0, CO_IRON, 2.0)


## A chain lying on the floor from `a` to `b` (tiles before him, to his left), a little crooked: its points on the screen.
func _co_lying(o: Vector2, way: Vector2, hand: int, a: Vector2, b: Vector2) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in 9:
		var u := i / 8.0
		var q := a.lerp(b, u) + Vector2(0.07 * sin(u * 9.0), 0.07 * cos(u * 7.0))
		var w := Chained.beside(o, way, hand, q.x, q.y)
		pts.append(Iso.to_screen(w.x, w.y))
	return pts


## A chain along `pts` (on the screen), in his old iron over a dark seam.
func _co_chain(pts: PackedVector2Array) -> void:
	draw_polyline(pts, Color(CO_INK, 0.9), 5.0)
	for i in pts.size() - 1:
		draw_dashed_line(pts[i], pts[i + 1], CO_IRON, 2.0, 4.0)


## His iron ball, its middle at `at` on the screen.
func _co_ball(at: Vector2) -> void:
	draw_circle(at, 10.0, CO_INK)
	draw_circle(at, 8.5, Color(0.3, 0.29, 0.38))
	draw_circle(at + Vector2(-2.5, -3.0), 2.5, CO_IRON)


# =====================================================================================================================
# THE KEYBEARERS' (floor 5's two, who carry the temple door's keys: keybearers.gd, whose numbers these read). What their
# moves send out and leave on the floor, and what each does to the hero (game/act1_rules/keybearers.ts `peril`, fly; the
# game draws them from the art chat's pictures, render/act1_fx/keybearers.ts and art/key_bearers_fx.ts: these are
# stand-ins, in the enemy's pink and gold). Once sent out they go on by themselves, whether their bearer still stands or
# not, but for a sigil that has not yet erupted and the ring's warning. (A key they drop is not one of these: it is
# keybearers.gd TempleKey, which a fallen hero's coming back does not clear away.)
#   kb_knife  the Knife's thrown dagger: from his hand, `high` game pixels up, straight the way the hero was as it left
#             it, 12 tiles a second, turning over and over; a hero within 0.42 of it is struck (not one in the air of his
#             lunge: it goes on), and it is gone in a glint; so too at a wall, or 10 tiles out.
#   kb_ball   a ball of the Flame's fan (three of them, 22 degrees apart): 7.5 tiles a second, as far as 9, striking
#             within 0.45; where it ends it bursts and goes out.
#   kb_sigil  his great sigil, 2.5 tiles round, under where the hero stood as his hand began to trace it. Its clock runs
#             up to its eruption (its 0, his slam): a hero inside it then is struck; the pillar stands 0.3 s and falls in
#             0.2; the floor burns on 3 s, its fire shrinking in to the middle, burning a hero in it 18% of the blow every
#             half second. If its caster falls, or is stopped in his cast, before the slam, nothing erupts.
#   kb_ring   his ring of fire, burst out from where he struck the floor: its edge runs out to 5 tiles at 7 a second (from
#             0.8 out; in its first step, from the middle); a hero its edge passes over (within 0.45 of it) is struck,
#             once, unless he is in the air of his lunge as it passes; at its end it stands dying 0.35 s.
#   kb_reach  the ring's warning: its reach, 5 tiles, marked round him while he gathers it, beating faster (drawn only;
#             gone if he falls or is stopped).

const KBS := preload("res://scripts/keybearers.gd")
## (render/act1_fx/keybearers.ts: the ring's pink, its gold edge, the floor scorched behind it; art/mkit.ts FLAME, the
## enemy's fire from its edge to its heart; art/key_bearers_fx.ts: the thrown knife's bone, its grip, the line round it)
const KB_PINK := Color("#ff3a78")
const KB_GOLD := Color("#ffd890")
const KB_SCORCH := Color("#2a0e10")
const KB_FIRE: Array[Color] = [Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff4c8")]
const KB_BONE := Color("#dccfb6")
const KB_GRIP := Color("#3a2418")
const KB_LINE := Color("#1a0c10")


## The Knife's dagger ("kb_knife") or a ball of the Flame's fan ("kb_ball"), sent from over `at`, `high` game pixels up,
## the way `way` (a unit on the floor).
func kb_fly(kind: String, at: Vector2, way: Vector2, dmg: float, high: float) -> void:
	list.append({"kind": kind, "x": at.x, "y": at.y, "way": way, "t": 0.0, "dmg": dmg, "high": high, "went": 0.0, "done": false, "hit": 0.0, "dur": 1e9})


## The Flame's great sigil under `at`, its clock at `t` (less than 0: so long before its eruption), cast by `src`.
func kb_sigil(at: Vector2, t: float, dmg: float, src: Object) -> void:
	list.append({"kind": "kb_sigil", "x": at.x, "y": at.y, "t": t, "dmg": dmg, "src": src, "done": 0})


## His ring of fire, burst out from `at`.
func kb_ring(at: Vector2, dmg: float) -> void:
	list.append({"kind": "kb_ring", "x": at.x, "y": at.y, "t": 0.0, "dmg": dmg, "done": false})


## The ring's reach marked round `src` for `dur` seconds, while he gathers it.
func kb_reach(src: Object, dur: float) -> void:
	list.append({"kind": "kb_reach", "t": 0.0, "dur": dur, "src": src})


## A step of one of them (its clock has run on already); false: it is over.
func _kb_step(p: Dictionary, dt: float) -> bool:
	var t: float = p["t"]
	var h: Vector2 = hero.world
	match p["kind"]:
		"kb_knife", "kb_ball":
			if p["done"]:
				return t < float(p["dur"])
			# (fly: flown along its way a fifth of a tile at a time; it strikes him within its reach, or ends at a wall or at
			# its flight's end; then its glint, or its burst)
			var n: Dictionary = KBS.KNIFE if p["kind"] == "kb_knife" else KBS.BALL
			var at := Vector2(p["x"], p["y"])
			var way: Vector2 = p["way"]
			var go: float = minf(dt, t) * float(n["speed"])
			var steps := maxi(1, ceili(go / 0.2))
			var ended := false
			for s in steps:
				at += way * (go / steps)
				p["went"] = float(p["went"]) + go / steps
				if h.distance_to(at) <= float(n["r"]) and KBS.Kit.can_strike(hero):
					hero.hurt(p["dmg"])
					ended = true
				elif float(p["went"]) >= float(n["reach"]) or not _kb_open(at):
					ended = true
				if ended:
					break
			p["x"] = at.x
			p["y"] = at.y
			if ended:
				p["done"] = true
				p["hit"] = t
				p["dur"] = t + float(n["burst"])
			return true
		"kb_sigil":
			var n: Dictionary = KBS.SIGIL
			var at := Vector2(p["x"], p["y"])
			if t < -0.05:
				# (its caster still casting: if he has fallen, or been stopped in his cast, nothing erupts)
				var w = p["src"]
				return is_instance_valid(w) and not w.dead and w.state == "act"
			if int(p["done"]) == 0:
				if t >= 0.0:
					p["done"] = 1
					if h.distance_to(at) <= float(n["r"]) and KBS.Kit.can_strike(hero):
						hero.hurt(p["dmg"])
					sfx.play("fire")
					hero.kick(3.0)
			elif t > float(n["strike"]) and t >= float(n["strike"]) + float(n["every"]) * int(p["done"]):
				# (the floor burning on: a tick every half second he stands in what still burns)
				p["done"] = int(p["done"]) + 1
				if h.distance_to(at) <= KBS.Kit.burn_radius(t) and KBS.Kit.can_strike(hero):
					hero.hurt(float(p["dmg"]) * float(n["share"]))
			return t < KBS.SIGIL_LONG
		"kb_ring":
			if not p["done"]:
				# (struck once, as its edge passes over him: its edge's way over the floor this step, from where it was to
				# where it is)
				var half: float = KBS.RING["half"]
				var r0 := 0.0 if t - dt <= 0.0 else KBS.Kit.ring_at(t - dt)
				var d := h.distance_to(Vector2(p["x"], p["y"]))
				if d >= r0 - half and d <= KBS.Kit.ring_at(t) + half and KBS.Kit.can_strike(hero):
					p["done"] = true
					hero.hurt(p["dmg"])
			return t < KBS.RING_LASTS
		"kb_reach":
			var s = p["src"]
			return t < float(p["dur"]) and is_instance_valid(s) and not s.dead and s.state == "act"
	return false


## game.ts isOpen: whether what flies passes a place: open ground, and not the wall half of a tile cut corner to corner.
func _kb_open(at: Vector2) -> bool:
	return map.open_at(floori(at.x), floori(at.y)) and not map.in_wall(at.x, at.y)


func _draw_kb(p: Dictionary) -> void:
	var t: float = p["t"]
	match p["kind"]:
		"kb_knife", "kb_ball":
			_draw_kb_flown(p, t)
		"kb_sigil":
			if not _floor_of(p):
				_draw_kb_sigil(p, t)
		"kb_ring":
			_draw_kb_ring(p, t)
		"kb_reach":
			var s = p["src"]
			if not is_instance_valid(s):
				return
			# (a broken line in the enemy's pink round him, come in over half a second, beating faster as he holds it)
			var k := minf(1.0, t / 0.5)
			var fast := 3.0 + 9.0 * minf(1.0, t / maxf(0.01, float(p["dur"])))
			var beat := 0.5 + 0.5 * sin(t * fast * PI)
			var ring := _ring(s.world.x, s.world.y, KBS.RING["to"], 240)
			for i in range(0, ring.size() - 1, 2):
				draw_line(ring[i], ring[i + 1], Color(KB_PINK, (0.35 + 0.45 * beat) * k), 2.0)


## The knife or a ball of fire in flight, over its shadow; where it ended, the knife's glint, the ball going out.
func _draw_kb_flown(p: Dictionary, t: float) -> void:
	var knife: bool = p["kind"] == "kb_knife"
	var foot := Iso.to_screen(p["x"], p["y"])
	var c := foot + Vector2(0.0, -2.0 * float(p["high"]))
	if has_film("kb_knife"):
		# (THE GAME'S OWN: on the floor only its shadow under it as it flies, thrownShadow, 3 game pixels across its half
		# for the knife and 4 for a ball; itself a picture among what stands, _kb_stands; a ball going out, _draw_air)
		if not p["done"]:
			draw_colored_polygon(_kb_oval(foot, 6.0 if knife else 8.0), Color(0, 0, 0, 0.25))
		return
	if p["done"]:
		var n: Dictionary = KBS.KNIFE if knife else KBS.BALL
		var k := 1.0 - minf(1.0, (t - float(p["hit"])) / float(n["burst"]))
		if k <= 0.0:
			return
		if knife:
			draw_circle(c, 8.0 + 14.0 * (1.0 - k), Color(1.0, 0.96, 0.92, 0.45 * k))
			draw_line(c - Vector2(12, 0) * k, c + Vector2(12, 0) * k, Color(KB_PINK, k), 2.0)
			draw_line(c - Vector2(0, 12) * k, c + Vector2(0, 12) * k, Color(KB_PINK, k), 2.0)
		else:
			_kb_ball(c, 1.0 + 0.6 * (1.0 - k), k, t)
		return
	draw_colored_polygon(_kb_oval(foot, 6.0 if knife else 8.0), Color(0, 0, 0, 0.25))
	if knife:
		# (turning over and over, an eighth of a turn 24 times a second: its grip, its blade of bone, the enemy's pink
		# where the light runs along its edge)
		var a := floorf(t * 24.0) * PI / 4.0
		var w := Vector2(cos(a), sin(a))
		draw_line(c - w * 11.0, c + w * 11.0, KB_LINE, 6.0)
		draw_line(c - w * 10.0, c - w * 3.0, KB_GRIP, 2.0)
		draw_line(c - w * 2.0, c + w * 10.0, KB_BONE, 3.0)
		draw_circle(c + w * 8.0, 2.0, KB_PINK)
	else:
		_kb_ball(c, 1.0, 1.0, t)


## A ball of his fire, its middle at `c` on the screen, `grow` times its size, as faint as `a`: white at its heart, the
## enemy's pink at its edge, flickering, its top drawn out as it licks up, its light round it.
func _kb_ball(c: Vector2, grow: float, a: float, t: float) -> void:
	var f := floorf(t * 20.0)
	var r := 9.0 * grow * (1.0 + 0.1 * sin(f * 1.7))
	draw_circle(c, 30.0 * grow, Color(KB_FIRE[2], 0.06 * a))
	draw_circle(c, 18.0 * grow, Color(KB_FIRE[2], 0.1 * a))
	var shares := [1.0, 0.8, 0.55, 0.3]
	for i in 4:
		var q: float = r * float(shares[i])
		draw_circle(c, q, Color(KB_FIRE[i], a))
		draw_colored_polygon(PackedVector2Array([c + Vector2(-q * 0.8, -q * 0.5), c + Vector2(q * 0.8, -q * 0.5), c + Vector2(q * 0.3 * sin(f * 2.3 + i), -q * 1.6)]), Color(KB_FIRE[i], a))


## His great sigil: its ring drawn round under the hero as his hand goes once round its ring in the air, its inner ring and
## its six marks of flame brightening as he gathers the fire; the pillar of fire as it erupts; the floor burning on,
## shrinking in to the middle.
func _draw_kb_sigil(p: Dictionary, t: float) -> void:
	var n: Dictionary = KBS.SIGIL
	var rad: float = n["r"]
	var x: float = p["x"]
	var y: float = p["y"]
	if t < 0.0:
		var k := clampf(1.0 + t / float(n["delay"]), 0.0, 1.0)
		var traced := clampf((t + float(n["delay"])) / float(n["trace"]), 0.0, 1.0)
		var ring := _ring(x, y, rad, 64)
		draw_colored_polygon(_ring(x, y, rad), Color(KB_FIRE[2], 0.06 + 0.22 * k))
		draw_polyline(ring.slice(0, maxi(2, int(ring.size() * traced))), Color(KB_PINK, 0.9), 3.0)
		if traced >= 1.0:
			draw_polyline(_ring(x, y, rad * 0.66, 48), Color(KB_FIRE[2], 0.35 + 0.55 * k), 2.0)
			for j in 6:
				var a := TAU * j / 6.0 + 0.5
				draw_line(Iso.to_screen(x + cos(a) * rad * 0.72, y + sin(a) * rad * 0.72), Iso.to_screen(x + cos(a) * rad * 0.94, y + sin(a) * rad * 0.94), Color(KB_GOLD, 0.3 + 0.6 * k), 2.0)
		return
	var stand: float = n["pillar"]
	var fall: float = n["fall"]
	if t < stand + fall:
		var up := 1.0 - clampf((t - stand) / fall, 0.0, 1.0)
		var base := Iso.to_screen(x, y)
		var half := rad * 32.0 * 0.8
		var tall := 196.0 * up
		var shares := [1.0, 0.6, 0.3]
		for i in 3:
			var q: float = half * float(shares[i])
			draw_colored_polygon(PackedVector2Array([base + Vector2(-q, 0), base + Vector2(-q * 0.7, -tall), base + Vector2(q * 0.7, -tall), base + Vector2(q, 0)]), Color(KB_FIRE[i + 1], (0.5 + 0.12 * i) * up))
	var burns := KBS.Kit.burn_radius(t)
	if burns > 0.02:
		draw_colored_polygon(_ring(x, y, burns), Color(KB_FIRE[2], 0.3))
		draw_polyline(_ring(x, y, burns), Color(KB_PINK, 0.75), 2.0)
		# (flames standing in what still burns)
		for i in 9:
			var a := i * 2.4 + 0.7
			var d := burns * (0.2 + 0.7 * fmod(i * 0.37, 1.0))
			var foot := Iso.to_screen(x + cos(a) * d, y + sin(a) * d)
			var tall := 10.0 + 8.0 * sin(t * 11.0 + i * 1.9)
			draw_colored_polygon(PackedVector2Array([foot + Vector2(-4, 0), foot + Vector2(4, 0), foot + Vector2(2.0 * sin(t * 7.0 + i), -tall)]), Color(KB_FIRE[1], 0.85))


## His ring of fire: the floor scorched behind its edge; its edge burning, pink and gold; tongues of fire all round it,
## gold at the foot and pink to the tip, lower as it runs out; dying as it stands at its end.
func _draw_kb_ring(p: Dictionary, t: float) -> void:
	var n: Dictionary = KBS.RING
	var x: float = p["x"]
	var y: float = p["y"]
	var r := KBS.Kit.ring_at(t)
	var end: float = n["to"]
	var dying := 1.0 - minf(1.0, (t - (end - float(n["from"])) / float(n["speed"])) / float(n["fade"])) if r >= end else 1.0
	if dying <= 0.0:
		return
	draw_polyline(_ring(x, y, r * 0.92, 72), Color(KB_SCORCH, 0.5 * dying), 6.0)
	var edge := _ring(x, y, r, 72)
	draw_polyline(edge, Color(KB_PINK, 0.8 * dying), 4.0)
	draw_polyline(edge, Color(KB_GOLD, 0.9 * dying), 2.0)
	if has_film("kb_tongue_1"):
		# (its tongues of fire the game's own pictures, each among what stands: _kb_stands)
		return
	var count := maxi(12, roundi(r * 9.0))
	for i in count:
		var a := TAU * i / count + t * 0.6
		var tall := (6.0 + 5.0 * sin(i * 2.7 + t * 13.0) + 3.0 * sin(i * 1.3)) * dying * (1.15 - 0.3 * (r / end))
		if tall < 1.0:
			continue
		var foot := Iso.to_screen(x + r * cos(a), y + r * sin(a))
		var sway := 3.0 * sin(i * 1.6 + floorf(t * 20.0))
		draw_colored_polygon(PackedVector2Array([foot + Vector2(-4, 0), foot + Vector2(4, 0), foot + Vector2(sway, -2.0 * tall)]), Color(KB_FIRE[1], dying))
		draw_colored_polygon(PackedVector2Array([foot + Vector2(-2.5, 0), foot + Vector2(2.5, 0), foot + Vector2(sway * 0.5, -1.1 * tall)]), Color(KB_FIRE[2], dying))


## A shadow's oval on the floor round `c` on the screen, `rx` picture pixels across its half, half as deep.
func _kb_oval(c: Vector2, rx: float, n := 16) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in n:
		var a := TAU * i / n
		pts.append(c + Vector2(cos(a) * rx, sin(a) * rx * 0.5))
	return pts


# =====================================================================================================================
# THE STOKER'S (floor 3's furnace keeper: stoker.gd, whose numbers and sums these read; game/act1_rules/stoker.ts `peril`).
# What his acts lay on the floor, AND WHAT STRIKES. Each is begun as his act begins, its clock his act's, laid in the frame
# his picture is seen in (`frame`: stoker.gd FRAMES) from where he stood then, its harm rolled once. Stopped before its blow
# lands (he is killed, or his act broken off), it is gone with him; landed, it goes on by itself, whether he still stands
# or not. Drawn as stand-ins for the art chat's painters (art/stoker_fx.ts; render/act1_fx/stoker.ts):
# what is marked before it comes in the enemy's pink, his fire in its own orange and gold; on the floor only (what would
# lie across a wall is left out: what strikes goes by his rules alone, as in the game).
#   st_coals  his shovel of coals; `aim`, where they are thrown (tiles along his forward, to his left: stoker.gd takes it
#             again 1.0 s in). Each coal's spot is ringed from then until it lands; from the hit the seven are in the air;
#             as each lands a hero within its fire (and 0.15) is struck (by those landing in the same step, once); its fire
#             burns 3 s, whoever stands in one burnt every 0.5 s until it dies down; then a scorch, fading.
#   st_rake   his fire rake. Its band is marked while he holds the shovel up; from the hit a hero in the band as the blade
#             passes his way is struck, once; the sheet of fire springs up behind the blade and burns 3.6 s, whoever stands
#             in it burnt every 0.5 s until it dies down.
#   st_ring   his furnace's burst. The ring is marked round him and its three gaps marked out while he roars; from the hit it
#             rolls out, a hero within its depth as it passes, and not in a gap, struck once; the floor behind it scorched.
#   st_blast  his death's blast on the floor under him (drawn only): from when he bursts the shockwave rolls out, and the
#             floor where he stood lies scorched.
# (His gear, left lying when he falls, is a thing of its own, not swept away with these when the hero falls: stoker.gd Gear.)

const ST := preload("res://scripts/stoker.gd")
## (art/stoker_fx.ts FX_PINK's deeper pink, for a mark's beat; FIRE, the embers' own colours; soot and smoke)
const ST_PINK := Color("#c0206a")
const ST_EMBER := Color("#d0501a")
const ST_FLAME := Color("#ff8a2a")
const ST_GOLD := Color("#ffc860")
const ST_WHITE := Color("#fff3b0")
const ST_SOOT := Color("#141012")
const ST_SMOKE := Color("#6a625e")
## (a circle one tile round on the floor is this many picture pixels across, from its middle: 32 times the root of 2)
const ST_ACROSS := 45.254833995939045


## One of his acts begun by `src` (his monster.gd): what it lays on the floor (`kind`: "st_coals", "st_rake" or "st_ring"), in
## `frame`, from where he stands; `aim`, where the hero stands (tiles along his forward, to his left); `dmg`, his blow,
## rolled once; `hit`, when its blow lands. Handed back, for his act to keep.
func st_act(src, kind: String, frame: int, aim: Vector2, dmg: float, hit: float) -> Dictionary:
	var p := {"kind": kind, "x": src.world.x, "y": src.world.y, "t": 0.0, "dur": ST.lasts(kind), "dmg": dmg, "hit": hit, "frame": frame, "aim": aim, "landed": 0, "done": 0, "struck": false, "src": src}
	list.append(p)
	return p


## His death's blast on the floor where he fell (`at`), in the frame he was seen in.
func st_blast(at: Vector2, frame: int) -> void:
	list.append({"kind": "st_blast", "x": at.x, "y": at.y, "t": 0.0, "dur": ST.lasts("st_blast"), "frame": frame})


## A step of one of them (its clock has run on already); false: it is over.
func _st_stays(p: Dictionary) -> bool:
	var t: float = p["t"]
	var o := Vector2(p["x"], p["y"])
	if p["kind"] == "st_blast":
		return t < float(p["dur"])
	# (stopped before its blow lands, it is gone with him: killed, or his act broken off)
	if t < float(p["hit"]):
		var s = p["src"]
		return is_instance_valid(s) and not s.dead and s.state == "act" and s.h2 != null and s.h2.act != null and is_same(s.h2.act["peril"], p)
	if hero.alive:
		match p["kind"]:
			"st_coals":
				_st_coals(p, t, o)
			"st_rake":
				_st_rake(p, t, o)
			"st_ring":
				_st_ring(p, t, o)
	return t < float(p["dur"])


## Whether a blow of his may land on the hero now: not in the air of his lunge, nor while nothing harms him.
func _st_free() -> bool:
	return hero._invuln <= 0.0 and hero._act != "lunge"


## THE COALS: each, as it lands, strikes a hero within its fire (those landing in the same step, once between them); then the
## fires burn whoever stands in one, tick by tick from the first one's landing.
func _st_coals(p: Dictionary, t: float, o: Vector2) -> void:
	var k: int = p["frame"]
	var aim: Vector2 = p["aim"]
	var reach: float = ST.COAL_FIRE["r"] + ST.HERO_R * 0.5
	var struck := false
	for i in int(ST.COALS["n"]):
		if (int(p["landed"]) & (1 << i)) != 0 or t < ST.COALS_HIT + ST.coal_lands(i):
			continue
		p["landed"] = int(p["landed"]) | (1 << i)
		if not struck and _st_free() and hero.world.distance_to(ST.coal_spot(k, o, aim, i)) <= reach:
			struck = true
			hero.hurt(float(p["dmg"]) * ST.TUNE["coal"])
		if i == 0:
			hero.kick(1.0)
	if int(p["landed"]) == 0:
		return
	var tick := floori((t - (ST.COALS_HIT + ST.coal_lands(0))) / ST.TUNE["tick"])
	if tick < 1 or tick <= int(p["done"]):
		return
	p["done"] = tick
	for i in int(ST.COALS["n"]):
		if ST.coal_burning(i, t) and hero.world.distance_to(ST.coal_spot(k, o, aim, i)) <= reach:
			hero.hurt(float(p["dmg"]) * ST.TUNE["burn"])
			break


## THE RAKE: a hero in its band as the blade passes his way is struck, once; the sheet of fire behind the blade burns whoever
## stands in it, tick by tick from the hit.
func _st_rake(p: Dictionary, t: float, o: Vector2) -> void:
	var since := t - float(p["hit"])
	var rel := ST.in_frame(p["frame"], o, hero.world)
	var d := rel.length()
	var deg := ST.way_of(rel)
	var edge: float = ST.HERO_R * 0.5
	var in_band: bool = d >= ST.RAKE_FIRE["r0"] - edge and d <= ST.RAKE_FIRE["r1"] + edge
	var in_arc: bool = deg >= ST.RAKE_ARC[0] - 6.0 and deg <= ST.RAKE_ARC[1] + 6.0
	var way := clampf(deg, ST.RAKE_ARC[0], ST.RAKE_ARC[1])
	if not p["struck"] and in_band and in_arc and _st_free() and absf(ST.rake_way(since) - way) < 10.0:
		p["struck"] = true
		hero.hurt(float(p["dmg"]) * ST.TUNE["rake"])
	var tick := floori(since / ST.TUNE["tick"])
	if tick < 1 or tick <= int(p["done"]):
		return
	p["done"] = tick
	if not in_band or not in_arc:
		return
	var age := since - ST.rake_passes(way)
	if age >= 0.0 and age < ST.RAKE_FIRE["burns"] - ST.RAKE_FIRE["dies"] * 0.5:
		hero.hurt(float(p["dmg"]) * ST.TUNE["burn"])


## THE RING: a hero within its depth as it passes him, and not in one of its gaps, is struck once.
func _st_ring(p: Dictionary, t: float, o: Vector2) -> void:
	if p["struck"]:
		return
	var front := ST.ring_at(t - float(p["hit"]))
	if is_nan(front):
		return
	var rel := ST.in_frame(p["frame"], o, hero.world)
	if absf(rel.length() - front) <= ST.RING["deep"] / 2.0 + ST.HERO_R * 0.5 and not ST.in_gap(ST.way_of(rel)) and _st_free():
		p["struck"] = true
		hero.hurt(float(p["dmg"]) * ST.TUNE["ring"])


## The way `deg` (degrees off his forward, to his left) in frame `k`, on the floor; and the place `r` tiles from `o` that way.
func _st_dir(k: int, deg: float) -> Vector2:
	return ST.spot_of(k, Vector2.ZERO, cos(deg_to_rad(deg)), sin(deg_to_rad(deg)))


func _st_way(k: int, o: Vector2, r: float, deg: float) -> Vector2:
	return o + _st_dir(k, deg) * r


## A stretch of a ring `r` tiles round `o`, from the way `a0` round to `a1`, as far as it lies on the floor.
func _st_arc(k: int, o: Vector2, r: float, a0: float, a1: float, col: Color, wide: float) -> void:
	var n := maxi(2, ceili(deg_to_rad(a1 - a0) * r / 0.3))
	var pts := PackedVector2Array()
	for i in n + 1:
		var w := _st_way(k, o, r, lerpf(a0, a1, float(i) / n))
		if _fm_floor(w):
			pts.append(Iso.to_screen(w.x, w.y))
			continue
		if pts.size() > 1:
			draw_polyline(pts, col, wide)
		pts = PackedVector2Array()
	if pts.size() > 1:
		draw_polyline(pts, col, wide)


## A MARK: a ring of the enemy's pink drawn round a spot, `r` round, drawing itself closed and its dashes filling in as the
## moment comes (`u` 0 to 1), beating faster; a cross in its middle once it is nearly come (art/stoker_fx.ts markRing).
func _st_mark(w: Vector2, r: float, u: float, t: float) -> void:
	if u <= 0.0 or not _fm_floor(w):
		return
	var col := ENEMY if sin(t * (8.0 + 22.0 * u)) > 0.0 else ST_PINK
	draw_colored_polygon(_ring(w.x, w.y, r, 20), Color(ENEMY, 0.04 + 0.1 * u))
	for j in 12:
		if j / 12.0 > minf(1.0, 0.25 + u):
			break
		var dash := PackedVector2Array()
		for s in 4:
			var a := TAU * (j + (0.5 + 0.5 * u) * s / 3.0) / 12.0
			dash.append(Iso.to_screen(w.x + cos(a) * r, w.y + sin(a) * r))
		draw_polyline(dash, col, 2.0)
	if u > 0.5:
		var c := Iso.to_screen(w.x, w.y)
		draw_line(c + Vector2(-5, 0), c + Vector2(5, 0), ST_PINK, 2.0)
		draw_line(c + Vector2(0, -3), c + Vector2(0, 3), ST_PINK, 2.0)


## A patch of his fire on the floor at `w`, `r` tiles round: a bed of embers and `tongues` of flame stood up on it, flickering;
## `live` how big it is (0 none, 1 full), `age` its seconds, `own` its own number (art/stoker_fx.ts flames).
func _st_fire(w: Vector2, r: float, live: float, age: float, own: int, tongues: int) -> void:
	var bed := r * (0.5 + 0.5 * minf(live, 1.0))
	if live <= 0.02 or bed < 0.05 or not _fm_floor(w):
		return
	draw_colored_polygon(_ring(w.x, w.y, bed, 14), Color(ST_EMBER, 0.85))
	draw_colored_polygon(_ring(w.x, w.y, bed * 0.6, 12), ST_FLAME)
	var c := Iso.to_screen(w.x, w.y)
	for i in tongues:
		var a := own * 1.7 + i * TAU / tongues
		var foot := c + Vector2(cos(a) * bed * 20.0, sin(a) * bed * 10.0)
		var tall := (r * 52.0 + 4.0) * live * (0.55 + 0.45 * sin(age * 9.0 + i * 2.3 + own))
		if tall < 2.0:
			continue
		var wide := 2.0 + r * 9.0 * live
		var lean := 3.0 * sin(age * 5.0 + i + own)
		draw_colored_polygon(PackedVector2Array([foot + Vector2(-wide, 0), foot + Vector2(lean, -tall), foot + Vector2(wide, 0)]), ST_FLAME)
		draw_colored_polygon(PackedVector2Array([foot + Vector2(-wide * 0.5, 0), foot + Vector2(lean * 0.6, -tall * 0.6), foot + Vector2(wide * 0.5, 0)]), ST_GOLD)


## Patches of his fire, each [where, how far round, how live, its age, its own number], the farthest from the eye first.
func _st_fires(patches: Array, tongues: int) -> void:
	patches.sort_custom(func(a, b): return a[0].x + a[0].y < b[0].x + b[0].y)
	for q in patches:
		_st_fire(q[0], q[1], q[2], q[3], q[4], tongues)


## A scorch on the floor where his fire has burnt out, `r` round: soot; `left` how much of it is left (1 all).
func _st_scorch(w: Vector2, r: float, left: float) -> void:
	if left > 0.02 and r >= 0.05 and _fm_floor(w):
		draw_colored_polygon(_ring(w.x, w.y, r, 14), Color(ST_SOOT, 0.75 * left))


func _draw_st(p: Dictionary) -> void:
	var t: float = p["t"]
	var k: int = p["frame"]
	var o := Vector2(p["x"], p["y"])
	if has_film("st_rake_front"):
		# (THE GAME'S OWN, art/stoker_fx.ts fxPainted as render/act1_fx/stoker.ts lays it: painted as his picture was seen,
		# from in front or from behind (frames 0 and 1, 2 and 3), turned over or not (the odd frames), its floor point his
		# as his act began. His coals each a film of its own, its floor point where that coal comes down.)
		var flip := k % 2 == 1
		if p["kind"] == "st_coals":
			for i in int(ST.COALS["n"]):
				_film_floor("st_coal_%d" % i, t, ST.coal_spot(k, o, p["aim"], i), flip)
		else:
			_film_floor("%s_%s" % [p["kind"], "front" if k < 2 else "back"], t, o, flip)
		return
	match p["kind"]:
		"st_coals":
			_draw_st_coals(t, k, o, p["aim"])
		"st_rake":
			_draw_st_rake(t, k, o)
		"st_ring":
			_draw_st_ring(t, k, o)
		"st_blast":
			_draw_st_blast(t, k, o)


## His coals: where each will come down, marked from when the hero's place is taken until it lands; its fire, flaring up as it
## lands and dying over its last moments to a scorch that fades; and the seven in the air, each a burning lump, its trail
## of sparks behind it (art/stoker_fx.ts coalsFloor, coalInAir).
func _draw_st_coals(t: float, k: int, o: Vector2, aim: Vector2) -> void:
	var r: float = ST.COAL_FIRE["r"]
	var burns: float = ST.COAL_FIRE["burns"]
	var dies: float = ST.COAL_FIRE["dies"]
	var fires: Array = []
	for i in int(ST.COALS["n"]):
		var w := ST.coal_spot(k, o, aim, i)
		var lands := ST.COALS_HIT + ST.coal_lands(i)
		if t >= ST.COALS_MARK and t < lands:
			_st_mark(w, r, (t - ST.COALS_MARK) / (lands - ST.COALS_MARK), t)
		var age := t - lands
		if age < 0.0 or age >= burns + 1.2:
			continue
		if age > burns - dies:
			_st_scorch(w, r, 1.0 - ST.smooth(burns, burns + 1.2, age))
		var live := 0.6 + 3.0 * age if age < 0.12 else 1.0 - ST.smooth(burns - dies, burns, age)
		fires.append([w, r, live, age, i + 3])
		# (the splash as it lands: sparks thrown out round it)
		if age < 0.3 and _fm_floor(w):
			draw_polyline(_ring(w.x, w.y, (4.0 + 70.0 * age) / ST_ACROSS, 16), Color(ST_GOLD, 1.0 - age / 0.3), 2.0)
	_st_fires(fires, 3)
	var since := t - ST.COALS_HIT
	if since < 0.0:
		return
	for i in int(ST.COALS["n"]):
		if since > ST.coal_lands(i):
			continue
		var at := _st_coal(k, o, ST.coal_at(i, since, aim))
		var was := _st_coal(k, o, ST.coal_at(i, maxf(0.0, since - 1.0 / 30.0), aim))
		draw_line(at, at + (was - at) * 4.8, ST_FLAME, 2.0)
		draw_circle(at, 4.0, ST_EMBER)
		draw_circle(at, 2.5, ST_WHITE)


## HIS COALS IN THE AIR (render/act1_fx/stoker.ts air; art/stoker_fx.ts coalInAir): each a burning lump among the figures
## at its own depth, over where it is on the floor (its trail of sparks: _draw_air).
func _st_stands(p: Dictionary) -> void:
	if stands == null or not has_film("st_lump_0"):
		return
	var since := float(p["t"]) - ST.COALS_HIT
	var n := int(ST.COALS["n"])
	var pool: Array = p.get("fx_pool", [])
	p["fx_pool"] = pool
	if since < 0.0 or since > ST.coal_lands(n - 1):
		for s in pool:
			s.visible = false
		return
	while pool.size() < n:
		pool.append(_film_sprite())
	var k: int = p["frame"]
	var o := Vector2(p["x"], p["y"])
	for i in n:
		if since > ST.coal_lands(i):
			pool[i].visible = false
			continue
		var q: Vector3 = ST.coal_at(i, since, p["aim"])
		var w := ST.spot_of(k, o, q.x, q.y)
		_film_set(pool[i], int(_fx["films"]["st_lump_%d" % i]["layers"]["stand"][0]), w, w.x + w.y, false, q.z * ST.TILE3 * 0.82 / 2.0)


## A number from 0 to 1 out of three whole ones, the same each time (for what flickers).
static func _noise3(a: int, b: int, c: int) -> float:
	var h := (a * 73856093) ^ (b * 19349663) ^ (c * 83492791)
	h = ((h ^ (h >> 13)) * 1274126177) & 0x7fffffff
	return float((h ^ (h >> 16)) & 0xffff) / 65536.0


## Where a coal in the air is on the screen: `q` its place (tiles along his forward, to his left, up), as the game lifts it.
func _st_coal(k: int, o: Vector2, q: Vector3) -> Vector2:
	var w := ST.spot_of(k, o, q.x, q.y)
	return Iso.to_screen(w.x, w.y) + Vector2(0.0, -q.z * ST.TILE3 * 0.82)


## His rake: its band's edges and its ends dashed in his pink while he holds the shovel up, filling in, beating faster; then
## the sheet of fire, a patch of it springing up where the blade has passed, burning, dying to a scorch (art/stoker_fx.ts
## rakeFloor, RAKE_PATCHES).
func _draw_st_rake(t: float, k: int, o: Vector2) -> void:
	var r0: float = ST.RAKE_FIRE["r0"]
	var r1: float = ST.RAKE_FIRE["r1"]
	var a0: float = ST.RAKE_ARC[0]
	var a1: float = ST.RAKE_ARC[1]
	if t >= ST.RAKE_MARK and t < ST.RAKE_HIT + 0.15:
		var u := clampf((t - ST.RAKE_MARK) / (ST.RAKE_HIT - ST.RAKE_MARK), 0.0, 1.0)
		var col := ENEMY if sin(t * (8.0 + 20.0 * u)) > 0.0 else ST_PINK
		var a := a0
		while a < a1:
			var b := minf(a1, a + 6.0 * (0.35 + 0.5 * u))
			_st_arc(k, o, r0, a, b, col, 2.0)
			_st_arc(k, o, r1, a, b, col, 2.0)
			a += 6.0
		for e in [a0, a1]:
			_st_spoke(k, o, e, r0, r1, col, 4.0 + 6.0 * u)
	var since := t - ST.RAKE_HIT
	if since < 0.0:
		return
	var burns: float = ST.RAKE_FIRE["burns"]
	var dies: float = ST.RAKE_FIRE["dies"]
	var fires: Array = []
	var nth := 0
	var r := r0 + 0.35
	while r < r1:
		var step := rad_to_deg(0.62 / r)
		var way := a0 + step / 2.0
		while way < a1:
			var age := since - ST.rake_passes(way)
			if age >= 0.0 and age <= burns + 1.2:
				var w := _st_way(k, o, r, way)
				if age > burns - dies:
					_st_scorch(w, 0.45, 1.0 - ST.smooth(burns, burns + 1.2, age))
				var live := 0.5 + 5.0 * age if age < 0.1 else 1.0 - ST.smooth(burns - dies, burns, age)
				fires.append([w, 0.45, live, age, nth + 11])
			nth += 1
			way += step
		r += 0.62
	_st_fires(fires, 2)


## A dashed line out along the way `deg` from `from` tiles to `to`, as far as the floor runs.
func _st_spoke(k: int, o: Vector2, deg: float, from: float, to: float, col: Color, dash: float) -> void:
	var way := _st_dir(k, deg)
	var far := _fm_floor_to(o, way, from, to)
	if far > from + 0.05:
		draw_dashed_line(Iso.to_screen(o.x + way.x * from, o.y + way.y * from), Iso.to_screen(o.x + way.x * far, o.y + way.y * far), col, 2.0, dash)


## His furnace's ring: marked round him at its start while he roars, its dashes filling in, each gap marked out along the floor,
## further as the moment comes; then rolling out, its flames stood up along its front, its gaps the way through; the floor
## it has rolled over scorched a while (art/stoker_fx.ts ringFloor).
func _draw_st_ring(t: float, k: int, o: Vector2) -> void:
	var r0: float = ST.RING["r0"]
	var r1: float = ST.RING["r1"]
	var deep: float = ST.RING["deep"]
	var half: float = ST.RING["gap"] / 2.0
	var gaps: Array = ST.RING["gaps"]
	# (the stretches of it between its gaps: from each gap's far edge round to the next one's near edge)
	var arcs: Array = []
	for j in gaps.size():
		arcs.append([float(gaps[j]) + half, float(gaps[(j + 1) % gaps.size()]) - half + (360.0 if j == gaps.size() - 1 else 0.0)])
	if t >= ST.BURST_MARK and t < ST.BURST_HIT:
		var u := clampf((t - ST.BURST_MARK) / (ST.BURST_HIT - ST.BURST_MARK), 0.0, 1.0)
		var col := ENEMY if sin(t * (8.0 + 22.0 * u)) > 0.0 else ST_PINK
		for arc in arcs:
			var a: float = arc[0]
			while a < arc[1]:
				_st_arc(k, o, r0, a, minf(arc[1], a + 10.0 * (0.4 + 0.6 * u)), col, 2.0)
				a += 10.0
		for g in gaps:
			for e in [-half, half]:
				_st_spoke(k, o, float(g) + e, r0, r0 + (r1 - r0) * u, col, 6.0)
	var since := t - ST.BURST_HIT
	if since < 0.0:
		return
	var front: float = r0 + ST.RING["pace"] * since
	var r := r0
	while r < minf(front - deep, r1):
		var left := 1.0 - ST.smooth(ST.RING["scorch"], ST.RING["scorch"] + 0.8, since - (r - r0) / ST.RING["pace"])
		if left > 0.02:
			for arc in arcs:
				_st_arc(k, o, r, arc[0], arc[1], Color(ST_SOOT, 0.7 * left), 12.0)
		r += 0.55
	if front > r1 + deep:
		return
	var live := 1.0 - 0.35 * ST.smooth(r1 - 1.5, r1 + deep, front)
	var fires: Array = []
	var nth := 0
	var way := 0.0
	while way < 360.0:
		if not ST.in_gap(way):
			fires.append([_st_way(k, o, front - deep / 2.0, way), 0.33, live, since, nth + 51])
		nth += 1
		way += rad_to_deg(0.5 / front)
	_st_fires(fires, 1)


## His death's blast: from when he bursts, the floor where he stood scorched (to the end of his death and after), a burst of
## fire on it, and the shockwave, a ring of fire and dust rolling out, thinning as it goes (art/stoker_fx.ts blastFloor).
func _draw_st_blast(t: float, k: int, o: Vector2) -> void:
	var since := t - ST.DIES_HIT
	if since < 0.0:
		return
	_st_scorch(o, ST.BLAST["scorch"] * clampf(since / 0.15, 0.0, 1.0), 1.0)
	if since < 0.8:
		_st_fire(o, (26.0 * (1.0 - since / 0.8) + 6.0) / ST_ACROSS, 1.0 - since / 0.8, since, 61, 4)
	var front := ST.blast_at(since)
	if is_nan(front):
		return
	var thin := 1.0 - 0.7 * clampf((front - ST.BLAST["r0"]) / (ST.BLAST["r1"] - ST.BLAST["r0"]), 0.0, 1.0)
	_st_arc(k, o, maxf(ST.BLAST["r0"], front - ST.BLAST["deep"] * 0.8), 0.0, 360.0, Color(ST_SMOKE, 0.6 * thin), 4.0)
	_st_arc(k, o, front, 0.0, 360.0, Color(ST_FLAME, thin), 6.0)
	_st_arc(k, o, front, 0.0, 360.0, Color(ST_WHITE, thin), 2.0)
