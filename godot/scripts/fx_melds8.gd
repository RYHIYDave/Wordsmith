## THE EIGHT MELDS ACROSS THE GROUPS AT WORK, AS THE FIGHT SHOWS THEM (render/melds8.ts M8Fx: the art chat's looks of Siphon,
## Cauterize, Forking, Shiver, Sunder, Fervor, Rime Ward and Implode, on in the game as it starts, MELDS8_LOOK, with their rules,
## his “Yes, hand them to main (Recommended)”, 12 Nov 2026). fx.gd hands on to this. THE GAME'S OWN LOOKS PORTED LINE FOR LINE:
## each one's moment begun by the rules' telling (`meld8` {id, k, on | x, y, x1, y1, n, most, secs, reach, r, wait}), its beats
## drawn from where things are and the time since (a look on a monster follows it), the bits it throws (its own, with its own
## chance: the game's own sequence, so the same moments throw the same), on the floor (drawGround) and in the air (drawAir, its
## light added in among its dots as the game's drawGlow adds it); held against the game's own painter dot for dot
## (checks/vmelds_check.gd). `k` how strongly: 1 in front, MELD8_TUNE.behind (0.5) behind. Its colours, beats and runes are the
## game's (tools/godot_vmelds.ts: assets/words/vmelds.json).
##   SIPHON     venom squeezed out of the poisoned one, beads of it drawn off in an arc, venom green turning a leech's red, and a
##              red pulse of life on him as they land.
##   CAUTERIZE  a white-hot flash where a burning one fell, its fire torn off it in a spiral and thrown at him, and the brand on him:
##              its rune stamped over him in fire, a ring of copper flame closing on him, steam.
##   FORKING    a jagged bolt jumping from the one struck to the next, forking near its end, the twins' sea-green after-image.
##   SHIVER     cross-hairs snapping shut on the one frozen, a white crack of light, a star of ice needles, shards, a shiver of cold.
##   SUNDER     the blow's dust ring, a crack across the floor under it and up its front, burning red while the stun lasts; a blow
##              on it then, its crack flaring and chips bursting out.
##   FERVOR     the kill's embers streaming to him, flames round his feet while it lasts, more and higher with each kill; at its
##              most a burst of flame.
##   RIME WARD  a pane of rime flashing up between him and the one whose blow he blocked, blown at it as shards, rime on it while
##              it is chilled.
##   IMPLODE    a vortex on the floor, everything near streaked toward its heart, a dark point swelling; then the burst.
## (fx.gd leaves Implode's burst and Forking's arc to these, as fx.ts does while MELDS8_LOOK is on.)
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
const FILE := "res://assets/words/vmelds.json"

const IDS := ["siphon", "cauterize", "forking", "shiver", "sunder", "fervor", "rimeward", "implode"]
static var RAMP := {}
static var LOOK := {}
static var GLYPH := {}
static var _glow_tex: ImageTexture

var fx
## (the check's: every fill and light laid, a line each, while it records; null when drawing)
var _rec = null
## The rules' state as read (fx_volatile3.gd `read` keeps it): where he stands; the monsters {id, x, y, dead, top, half}.
var hero_x := 0.0
var hero_y := 0.0
var mons: Array = []
var beats: Array = []
var bits: Array = []
var t := 0.0
var seeds := 1
var rng := 12345


static func ready_up() -> void:
	if not RAMP.is_empty():
		return
	L.ready_up()
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string(FILE))
	for w in d["m8ramp"]:
		RAMP[w] = L.ramp_of(d["m8ramp"][w])
	LOOK = d["m8look"]
	GLYPH = d["m8glyph"]


func _init() -> void:
	ready_up()


func clear() -> void:
	beats = []
	bits = []


func alive() -> bool:
	return not (beats.is_empty() and bits.is_empty())


func _rand() -> float:
	rng = (L.imul(rng, 1664525) + 1013904223) & 0xffffffff
	return float((rng >> 8) & 0xffffff) / 16777216.0


static func _ri(v: float) -> int:
	return int(floorf(v + 0.5))


static func _lerp(a: float, b: float, u: float) -> float:
	return a + (b - a) * u


static func _c01(u: float) -> float:
	return 0.0 if u < 0.0 else (1.0 if u > 1.0 else u)


static func _ease(u: float) -> float:
	var v := 1.0 - _c01(u)
	return 1.0 - v * v * v


## A colour of a ramp by how hot (0 its darkest, 1 its white-hot).
static func _tone(ramp: PackedColorArray, hot: float) -> Color:
	return ramp[maxi(0, mini(ramp.size() - 1, _ri(hot * (ramp.size() - 1))))]


## Math.hypot, as V8 works it out (fx_volatile3.gd's).
static func _hyp(a: float, b: float) -> float:
	var x := absf(a)
	var y := absf(b)
	var most := maxf(x, y)
	if most == 0.0:
		return 0.0
	var sum := 0.0
	var comp := 0.0
	for v in [x, y]:
		var n: float = v / most
		var summand := n * n - comp
		var pre := sum + summand
		comp = (pre - sum) - summand
		sum = pre
	return sqrt(sum) * most


## The looks' own whole-number hash of two numbers (melds8.ts hash).
static func _hash(a: int, b: int) -> int:
	var h := (L.imul(a, 374761393) + L.imul(b, 668265263)) & 0xffffffff
	h = L.imul(h ^ (h >> 13), 1274126177)
	h ^= h >> 16
	return h


func _wx(x: float, y: float) -> float:
	return fx.gx(x, y)


func _wy(x: float, y: float) -> float:
	return fx.gy(x, y)


# =====================================================================================================================
# The moment the rules send

## The rules' moment (`meld8`); anything else is not ours.
func handle(e: Dictionary) -> void:
	if e.get("t") == "meld8":
		moment(e)


func moment(e: Dictionary) -> void:
	var id: String = e["id"]
	var m = _mon(int(e["on"])) if e.has("on") else null
	var x: float = float(e["x"]) if e.has("x") else (float(m["x"]) if m != null else hero_x)
	var y: float = float(e["y"]) if e.has("y") else (float(m["y"]) if m != null else hero_y)
	var b := {
		"id": id, "what": e.get("what", ""), "t": 0.0, "k": float(e.get("k", 1.0)), "seed": seeds, "x": x, "y": y,
		"x1": float(e.get("x1", x)), "y1": float(e.get("y1", y)), "on": int(e.get("on", -1)), "n": float(e.get("n", 1.0)),
		"most": float(e.get("most", 5.0)), "secs": float(e.get("secs", 1.0)), "reach": float(e.get("reach", 3.0)),
		"r": float(e.get("r", 2.2)), "wait": float(e.get("wait", 0.4)), "lx": x, "ly": y, "done": false,
	}
	seeds += 1
	# (FERVOR: one look on him at a time, its count and time renewed by each kill; its stream from each kill its own)
	if id == "fervor":
		var was = null
		for q: Dictionary in beats:
			if q["id"] == "fervor" and q["what"] == "" and not q["done"]:
				was = q
				break
		if was != null:
			was["n"] = b["n"]
			was["most"] = b["most"]
			was["secs"] = b["secs"]
			was["t"] = minf(float(was["t"]), float(LOOK["fervor"]["stream"]))
			if float(b["n"]) >= float(b["most"]):
				was["what"] = ""
		_stream(b)
		if was != null:
			if float(b["n"]) >= float(b["most"]):
				_flare(was)
			return
	# (SUNDER and RIME WARD: one look on a monster at a time, renewed)
	if id == "sunder" and b["what"] == "hit":
		_chips(b, m, 1.0)
		for q: Dictionary in beats:
			if q["id"] == "sunder" and q["what"] == "" and q["on"] == b["on"] and not q["done"]:
				q["n"] = (float(q["n"]) if float(q["n"]) != 0.0 else 0.0) + 1.0
				break
		b["secs"] = 0.25
	elif (id == "sunder" or id == "rimeward") and int(b["on"]) >= 0:
		for q: Dictionary in beats:
			if q["id"] == id and q["on"] == b["on"] and q["what"] == "":
				q["done"] = true
	_start(b, m)
	beats.append(b)


## What each look throws out as it begins.
func _start(b: Dictionary, m) -> void:
	var R: PackedColorArray = RAMP[b["id"]]
	var k: float = b["k"]
	var mid := _mid(m)
	var bx: float = b["x"]
	var by: float = b["y"]
	match str(b["id"]):
		"siphon":
			# (venom squeezed out of it)
			for i in _ri(8 * k):
				_bit(bx, by, mid, "dot", PackedColorArray([R[2], R[3], Color("#7ccc30")]), 1.2, 0.45, 0, 26, 30)
		"cauterize":
			for i in _ri(22 * k):
				_bit(bx, by, 12, "streak", R, 3.2, 0.5, 120, 60, 70)
			for i in _ri(6 * k):
				_bit(bx, by, 10, "puff", PackedColorArray([Color("#3a3438"), Color("#5a5458"), Color("#8a8488")]), 0.4, 0.9, -8, 12, 14)
		"forking":
			for p in [[bx, by], [float(b["x1"]), float(b["y1"])]]:
				for i in _ri(12 * k):
					_bit(p[0], p[1], 12, "streak", R, 3.6, 0.3, 160, 40, 90)
		"shiver":
			for i in _ri(34 * k):
				_bit(bx, by, mid, "streak", PackedColorArray([Color("#8c9cc8"), Color("#dce4ff"), Color("#ffffff")]), 4, 0.7, 180, 50, 130)
		"sunder":
			if b["what"] == "":
				for i in _ri(14 * k):
					_bit(bx, by, 2, "puff", PackedColorArray([Color("#2a2228"), Color("#4a4048"), Color("#6a6068")]), 1.6, 0.7, -6, 6, 10)
				_chips(b, m, 1.4)
		"fervor":
			_stream(b)
		"implode":
			# (dust lifted at its rim, to be dragged in)
			for i in _ri(18 * k):
				var a := _rand() * PI * 2.0
				var rr: float = float(b["reach"]) * (0.8 + 0.25 * _rand())
				var z := 1.0 + _rand() * 6.0
				bits.append({"x": bx + cos(a) * rr, "y": by + sin(a) * rr, "z": z, "vx": 0.0, "vy": 0.0, "vz": 0.0, "fall": 0.0, "t": 0.0, "life": b["wait"],
					"ramp": PackedColorArray([R[2], R[3], R[4]]), "kind": "dot", "size": 1.0 + (1.0 if i % 3 == 0 else 0.0)})


## Throw out a bit: from (x, y) at `z` px up, `speed` tiles a second out, `life` seconds, `fall` px/s² down, rising at up to `up`
## px/s (from `up_min`).
func _bit(x: float, y: float, z: float, kind: String, ramp: PackedColorArray, speed: float, life: float, fall: float, up_min: float, up: float) -> void:
	var a := _rand() * PI * 2.0
	var s := speed * (0.35 + 0.65 * _rand())
	var vz := up_min + (up - up_min) * _rand()
	var lf := life * (0.6 + 0.5 * _rand())
	var size := 2.0 + _rand() * 3.0 if kind == "puff" else 1.0
	bits.append({"x": x, "y": y, "z": z, "vx": cos(a) * s, "vy": sin(a) * s, "vz": vz, "fall": fall, "t": 0.0, "life": lf, "ramp": ramp, "kind": kind, "size": size})


## SUNDER's chips of it, burning at their edges, thrown off its crack.
func _chips(b: Dictionary, m, more: float) -> void:
	var R: PackedColorArray = RAMP["sunder"]
	var mid := _mid(m)
	for i in _ri(float(LOOK["sunder"]["chips"]) * more * float(b["k"])):
		_bit(float(m["x"]) if m != null else float(b["x"]), float(m["y"]) if m != null else float(b["y"]), mid, "streak",
			PackedColorArray([R[2], R[3], R[4]]) if i % 3 != 0 else PackedColorArray([R[4], R[5], Color("#ffffff")]), 2.6, 0.55, 260, 40, 120)


## FERVOR: the kill's embers streaming to him.
func _stream(b: Dictionary) -> void:
	var R: PackedColorArray = RAMP["fervor"]
	for i in 16:
		_bit(b["x"], b["y"], 10, "dot", PackedColorArray([R[2], R[3], R[4], R[5]]), 1.4, 0.3, 0, 10, 40)
	var s: Dictionary = b.duplicate()
	s["what"] = "hit"
	s["t"] = 0.0
	s["seed"] = seeds
	seeds += 1
	beats.append(s)


## FERVOR at its most: a burst of flame off him.
func _flare(b: Dictionary) -> void:
	var R: PackedColorArray = RAMP["fervor"]
	for i in 26:
		_bit(hero_x, hero_y, 8, "streak", PackedColorArray([R[2], R[3], R[4], R[5]]), 3.4, 0.5, -30, 40, 120)
	b["n"] = b["most"]


## How high a monster's middle is, game pixels.
static func _mid(m) -> int:
	if m == null:
		return 12
	return _ri(float(m["top"]) * 0.5)


func _mon(id: int) -> Variant:
	if id < 0:
		return null
	for m: Dictionary in mons:
		if m["id"] == id:
			return m
	return null


# =====================================================================================================================
# The clock (update)

func update(dt: float) -> void:
	t += dt
	for b: Dictionary in beats:
		b["t"] = float(b["t"]) + dt
		var m = _mon(int(b["on"]))
		if m != null:
			b["lx"] = m["x"]
			b["ly"] = m["y"]
		var id: String = b["id"]
		var bt: float = b["t"]
		var what: bool = b["what"] != ""
		var end: float
		match id:
			"siphon":
				end = float(LOOK["siphon"]["fly"]) + float(LOOK["siphon"]["pulse"])
			"cauterize":
				end = float(LOOK["cauterize"]["flash"]) + float(LOOK["cauterize"]["tear"]) + float(LOOK["cauterize"]["fly"]) + float(LOOK["cauterize"]["steam"])
			"forking":
				end = float(LOOK["forking"]["bolt"]) + float(LOOK["forking"]["after"])
			"shiver":
				end = float(LOOK["shiver"]["mist"])
			"sunder":
				end = float(b["secs"]) if what else maxf(float(LOOK["sunder"]["dust"]), float(b["secs"]) + float(LOOK["sunder"]["cool"]))
			"fervor":
				end = float(LOOK["fervor"]["stream"]) if what else float(b["secs"])
			"rimeward":
				end = maxf(float(LOOK["rimeward"]["pane"]) + float(LOOK["rimeward"]["shards"]), float(b["secs"]))
			_:
				end = float(b["wait"]) + float(LOOK["implode"]["scorch"])
		if bt >= end:
			b["done"] = true
		# (a monster gone: what is on it ends)
		if (id == "sunder" or id == "rimeward") and not what and m != null and m["dead"]:
			b["done"] = true
		if b["done"]:
			continue
		# (what each gives off as it goes)
		var R: PackedColorArray = RAMP[id]
		var k: float = b["k"]
		var lx: float = b["lx"]
		var ly: float = b["ly"]
		if id == "sunder" and not what and bt < float(b["secs"]) and _rand() < dt * 14.0 * k:
			var x := lx + (_rand() - 0.5) * 0.3
			var y := ly + (_rand() - 0.5) * 0.3
			var z := 2.0 + _rand() * _mid(m) * 1.4
			var vz := 14.0 + _rand() * 16.0
			bits.append({"x": x, "y": y, "z": z, "vx": 0.0, "vy": 0.0, "vz": vz, "fall": -6.0, "t": 0.0, "life": 0.7, "ramp": PackedColorArray([R[4], R[5], R[4], R[3]]), "kind": "dot", "size": 1.0})
		if id == "rimeward" and bt > float(LOOK["rimeward"]["pane"]) and bt < float(b["secs"]) and _rand() < dt * 10.0 * k:
			var x := lx + (_rand() - 0.5) * 0.5
			var y := ly + (_rand() - 0.5) * 0.5
			var z := _rand() * _mid(m)
			var vx := (_rand() - 0.5) * 0.3
			var vy := (_rand() - 0.5) * 0.3
			bits.append({"x": x, "y": y, "z": z, "vx": vx, "vy": vy, "vz": -4.0, "fall": 0.0, "t": 0.0, "life": 1.0, "ramp": PackedColorArray([Color("#ffffff"), R[4], Color("#e8f4f0")]), "kind": "puff", "size": 2.0})
		if id == "shiver" and bt < float(LOOK["shiver"]["mist"]) * 0.8 and _rand() < dt * 16.0 * k:
			var x := lx + (_rand() - 0.5) * 0.5
			var y := ly + (_rand() - 0.5) * 0.5
			var z := _rand() * 10.0
			bits.append({"x": x, "y": y, "z": z, "vx": 0.0, "vy": 0.0, "vz": 10.0, "fall": 0.0, "t": 0.0, "life": 0.8, "ramp": PackedColorArray([Color("#ffffff"), R[4], R[3]]), "kind": "puff", "size": 2.0})
		if id == "fervor" and not what:
			var strong: float = float(b["n"]) / maxf(1.0, float(b["most"]))
			if _rand() < dt * (10.0 + 30.0 * strong):
				var x := hero_x + (_rand() - 0.5) * 0.7
				var y := hero_y + (_rand() - 0.5) * 0.7
				var z := 2.0 + _rand() * 8.0
				var vz := 30.0 + _rand() * 40.0 * (0.5 + strong)
				bits.append({"x": x, "y": y, "z": z, "vx": 0.0, "vy": 0.0, "vz": vz, "fall": -10.0, "t": 0.0, "life": 0.6 + 0.4 * strong, "ramp": PackedColorArray([R[5], R[4], R[3], R[2]]), "kind": "dot", "size": 1.0})
		if id == "cauterize":
			var C: Dictionary = LOOK["cauterize"]
			var s0: float = float(C["flash"]) + float(C["tear"]) + float(C["fly"])
			if bt > s0 and bt < s0 + float(C["steam"]) * 0.7 and _rand() < dt * 30.0 * k:
				var x := hero_x + (_rand() - 0.5) * 0.5
				var y := hero_y + (_rand() - 0.5) * 0.5
				var z := 8.0 + _rand() * 12.0
				var vx := (_rand() - 0.5) * 0.4
				var vy := (_rand() - 0.5) * 0.4
				var vz := 26.0 + _rand() * 20.0
				bits.append({"x": x, "y": y, "z": z, "vx": vx, "vy": vy, "vz": vz, "fall": 0.0, "t": 0.0, "life": 0.7, "ramp": PackedColorArray([Color("#ffffff"), Color("#f0ece8"), Color("#c8c4c8"), Color("#8a8690")]), "kind": "puff", "size": 2.0})
		if id == "implode" and bt >= float(b["wait"]) and not what:
			b["what"] = "hit"
			for i in _ri(30 * k):
				_bit(b["x"], b["y"], 6, "streak", PackedColorArray([R[3], R[4], R[5], Color("#ffffff")]), 5.0 * (float(b["r"]) / 2.2), 0.5, 140, 30, 140)
			for i in _ri(10 * k):
				_bit(b["x"], b["y"], 4, "puff", PackedColorArray([R[1], R[2], R[3]]), 1.4, 0.9, -10, 10, 20)
	beats = beats.filter(func(q): return not q["done"])
	# (IMPLODE: what it lifted is drawn to its heart)
	for p: Dictionary in bits:
		p["t"] = float(p["t"]) + dt
		var pull = null
		for b: Dictionary in beats:
			if b["id"] == "implode" and b["what"] == "" and _hyp(float(p["x"]) - float(b["x"]), float(p["y"]) - float(b["y"])) < float(b["reach"]) * 1.2 + 0.1 and float(p["vz"]) == 0.0 and float(p["fall"]) == 0.0:
				pull = b
				break
		if pull != null:
			var left := maxf(0.02, float(pull["wait"]) - float(pull["t"]))
			p["vx"] = (float(pull["x"]) - float(p["x"])) / left
			p["vy"] = (float(pull["y"]) - float(p["y"])) / left
		p["x"] = float(p["x"]) + float(p["vx"]) * dt
		p["y"] = float(p["y"]) + float(p["vy"]) * dt
		p["z"] = maxf(0.0, float(p["z"]) + float(p["vz"]) * dt)
		p["vz"] = float(p["vz"]) - float(p["fall"]) * dt
		if p["kind"] != "puff":
			p["vx"] = float(p["vx"]) * (1.0 - minf(1.0, dt * 2.2))
			p["vy"] = float(p["vy"]) * (1.0 - minf(1.0, dt * 2.2))
		if float(p["z"]) <= 0.0 and float(p["fall"]) > 0.0:
			p["vz"] = 0.0
	bits = bits.filter(func(p): return float(p["t"]) < float(p["life"]))
	if bits.size() > 900:
		bits = bits.slice(bits.size() - 900)


# =====================================================================================================================
# THE CANVAS (fillStyle, globalAlpha, fillRect, drawGlow), as the canvas lays it; its colours premultiplied, so that its light is
# added in among its dots in their order (the layer's material: fx.gd)

var _style := Color.BLACK
var _alpha := 1.0
var _pts := PackedVector2Array()
var _cols := PackedColorArray()
var _idx := PackedInt32Array()
var _canvas: CanvasItem


func _fs(c: Color) -> void:
	_style = c


func _ga(a: float) -> void:
	if a >= 0.0 and a <= 1.0:
		_alpha = a


static func _q(v: float) -> String:
	return str(int(floorf(v * 10000.0 + 0.5)))


func _fill(x: float, y: float, w: float, h: float) -> void:
	if w < 0.0:
		x += w
		w = -w
	if h < 0.0:
		y += h
		h = -h
	if w == 0.0 or h == 0.0:
		return
	if _rec != null:
		_rec.append("r,%s,%s,%s,%s,%s,%s" % [_q(x), _q(y), _q(w), _q(h), _style.to_html(false).to_lower(), _q(_alpha)])
		return
	if _alpha <= 0.0:
		return
	var n := _pts.size()
	_pts.append(Vector2(x * 2.0, y * 2.0))
	_pts.append(Vector2((x + w) * 2.0, y * 2.0))
	_pts.append(Vector2((x + w) * 2.0, (y + h) * 2.0))
	_pts.append(Vector2(x * 2.0, (y + h) * 2.0))
	var col := Color(_style.r * _alpha, _style.g * _alpha, _style.b * _alpha, _alpha)
	_cols.append(col)
	_cols.append(col)
	_cols.append(col)
	_cols.append(col)
	_idx.append(n)
	_idx.append(n + 1)
	_idx.append(n + 2)
	_idx.append(n)
	_idx.append(n + 2)
	_idx.append(n + 3)


## (engine/px.ts drawGlow: the light's soft round picture, `r` round, added over what is there at `a`; the strength 1 after)
func _glow(x: float, y: float, r: float, color: Color, a: float) -> void:
	_ga(maxf(0.0, minf(1.0, a)))
	var w := r * 2.0
	if w > 0.0:
		if _rec != null:
			_rec.append("g,%s,%s,%s,%s,%s,%s" % [_q(x - r), _q(y - r), _q(w), _q(w), color.to_html(false).to_lower(), _q(_alpha)])
		elif _alpha > 0.0 and _canvas != null:
			_flush()
			_canvas.draw_texture_rect(glow_texture(), Rect2((x - r) * 2.0, (y - r) * 2.0, w * 2.0, w * 2.0), false, Color(color.r * _alpha, color.g * _alpha, color.b * _alpha, 1.0))
	_ga(1.0)


## The light's picture (engine/px.ts glowOf: a 64 by 64 radial gradient, its strength 1 at its heart, 0.45 at 0.45 of the way out,
## none at its edge): its strength kept in its colour and none in its alpha, so that the layer's premultiplied blend adds it.
static func glow_texture() -> ImageTexture:
	if _glow_tex != null:
		return _glow_tex
	var img := Image.create(64, 64, false, Image.FORMAT_RGBA8)
	for j in 64:
		for i in 64:
			var d := sqrt((i + 0.5 - 32.0) * (i + 0.5 - 32.0) + (j + 0.5 - 32.0) * (j + 0.5 - 32.0)) / 32.0
			var a := 0.0
			if d < 0.45:
				a = 1.0 - (d / 0.45) * 0.55
			elif d < 1.0:
				a = 0.45 * (1.0 - (d - 0.45) / 0.55)
			img.set_pixel(i, j, Color(a, a, a, 0.0))
	_glow_tex = ImageTexture.create_from_image(img)
	return _glow_tex


func _flush() -> void:
	if _rec == null and _canvas != null and not _idx.is_empty():
		RenderingServer.canvas_item_add_triangle_array(_canvas.get_canvas_item(), _idx, _pts, _cols)
	_pts = PackedVector2Array()
	_cols = PackedColorArray()
	_idx = PackedInt32Array()


## A pixel line from (x0, y0) to (x1, y1) on the screen.
func _line(x0: float, y0: float, x1: float, y1: float, w := 1) -> void:
	var n := maxi(1, _ri(maxf(absf(x1 - x0), absf(y1 - y0))))
	var o := int(floorf((w - 1) / 2.0))
	for i in n + 1:
		_fill(_ri(x0 + ((x1 - x0) * i) / n) - o, _ri(y0 + ((y1 - y0) * i) / n) - o, w, w)


## A ring on the floor round (x, y), `rt` tiles, drawn in pixels; `gap` leaves every so many out.
func _ring(x: float, y: float, rt: float, gap := 0, spin := 0.0, lift := 0.0) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y) - lift
	var rx := rt * 22.6
	var n := maxi(12, _ri(rx * 1.6))
	for i in n:
		if gap != 0 and i % gap == 0:
			continue
		var a := (float(i) / n) * PI * 2.0 + spin
		_fill(_ri(cx + cos(a) * rx), _ri(cy + sin(a) * rx * 0.5), 1, 1)


# =====================================================================================================================
# drawing

## On the floor, under the characters (drawGround).
func draw_ground(c: CanvasItem) -> void:
	_canvas = c
	for b: Dictionary in beats:
		match str(b["id"]):
			"sunder":
				if b["what"] == "":
					_sunder_floor(b)
			"shiver":
				_shiver_floor(b)
			"implode":
				_implode_floor(b)
			"fervor":
				if b["what"] == "":
					_fervor_floor(b)
			"cauterize":
				_cauterize_floor(b)
	_ga(1.0)
	_flush()


## In the air, over the characters and the dark (drawAir): everything else, and every bit thrown.
func draw_air(c: CanvasItem) -> void:
	_canvas = c
	for b: Dictionary in beats:
		match str(b["id"]):
			"siphon":
				_siphon_air(b)
			"cauterize":
				_cauterize_air(b)
			"forking":
				_forking_air(b)
			"shiver":
				_shiver_air(b)
			"sunder":
				_sunder_air(b)
			"fervor":
				_fervor_air(b)
			"rimeward":
				_rime_air(b)
			"implode":
				_implode_air(b)
	for p: Dictionary in bits:
		_draw_bit(p)
	_ga(1.0)
	_flush()


func _draw_bit(p: Dictionary) -> void:
	var u: float = float(p["t"]) / float(p["life"])
	var px: float = p["x"]
	var py: float = p["y"]
	var sx := _ri(_wx(px, py))
	var sy := _ri(_wy(px, py) - float(p["z"]))
	var ramp: PackedColorArray = p["ramp"]
	# (hottest as it is thrown, cooling as it goes)
	var c := _tone(ramp, 1.0 - u)
	if p["kind"] == "puff":
		var s := _ri(float(p["size"]) + u * 4.0)
		_ga(0.5 * (1.0 - u))
		_fs(c)
		_fill(sx - s, sy - _ri(s * 0.7), s * 2, _ri(s * 1.4))
		_ga(1.0)
		return
	_ga(1.0 if u < 0.75 else (1.0 - u) / 0.25)
	_fs(c)
	if p["kind"] == "streak":
		var vx: float = p["vx"]
		var vy: float = p["vy"]
		var bx := (vx - vy) * 16.0 * 0.035
		var by := (vx + vy) * 8.0 * 0.035 - float(p["vz"]) * 0.035
		var n := maxi(1, mini(6, _ri(_hyp(bx, by))))
		for i in n + 1:
			_fill(_ri(sx - (bx * i) / n), _ri(sy - (by * i) / n), 1, 1)
		_fs(_tone(ramp, 1.0))
		_fill(sx, sy, 1, 1)
	else:
		_fill(sx, sy, p["size"], p["size"])
	_ga(1.0)


# ---- SIPHON
func _siphon_air(b: Dictionary) -> void:
	var R: PackedColorArray = RAMP["siphon"]
	var Lk: Dictionary = LOOK["siphon"]
	var fly: float = Lk["fly"]
	var m = _mon(int(b["on"]))
	var z0 := _mid(m)
	var bt: float = b["t"]
	var k: float = b["k"]
	var ax := _wx(b["lx"], b["ly"])
	var ay := _wy(b["lx"], b["ly"]) - z0
	var hx := _wx(hero_x, hero_y)
	var hy := _wy(hero_x, hero_y) - 14.0
	# (the arc: up out of it and over to him)
	var lift := 14.0 + _hyp(hx - ax, hy - ay) * 0.25
	var at := func(u: float) -> PackedFloat64Array: return PackedFloat64Array([_lerp(ax, hx, u), _lerp(ay, hy, u) - sin(u * PI) * lift])
	var n := maxi(2, _ri(float(Lk["beads"]) * k))
	if bt < fly:
		var f := 1.0 - bt / fly
		for strand in 2:
			for i in 48:
				var u := i / 48.0
				var p: PackedFloat64Array = at.call(u)
				var tw := sin(u * 14.0 - t * 18.0 + strand * PI) * 3.0 * sin(u * PI)
				_ga(0.75 * f)
				_fs(R[3] if u < 0.45 else (Color("#b8ff70") if u < 0.6 else R[4]))
				_fill(_ri(p[0]), _ri(p[1] + tw), 1, 2)
		# (it, squeezed: venom welling on it, dripping)
		_glow(ax, ay, 24.0 * k, R[3], 0.55 * f)
		_ga(f)
		_fs(R[3])
		_ring(b["lx"], b["ly"], 0.35 + 0.25 * _ease(bt / fly), 2, t * 4.0)
	for i in n:
		var u := (bt - i * 0.05) / (fly - (n - 1) * 0.05)
		if u <= 0.0 or u >= 1.0:
			continue
		var e := u * u * (3.0 - 2.0 * u)
		# (venom's green turning to a leech's red as it flies)
		var red := _c01((e - 0.35) / 0.3)
		for j in range(6, -1, -1):
			var p: PackedFloat64Array = at.call(maxf(0.0, e - j * 0.025))
			_ga(1.0 - j * 0.13)
			_fs((R[4] if j < 2 else R[3]) if red > 0.5 else (Color("#b8ff70") if j < 2 else R[3]))
			var s := 4 if j == 0 else (3 if j < 3 else 2)
			_fill(_ri(p[0] - s / 2.0), _ri(p[1] - s / 2.0), s, s)
		var p: PackedFloat64Array = at.call(e)
		_ga(1.0)
		_fs(R[5] if red > 0.5 else Color("#eaffd0"))
		_fill(_ri(p[0]) - 1, _ri(p[1]) - 1, 2, 2)
		_glow(p[0], p[1], 14.0, R[4] if red > 0.5 else R[3], 0.6)
	# (life on him, as they land)
	var q := (bt - fly * 0.8) / float(Lk["pulse"])
	if q > 0.0 and q < 1.0:
		_ga(1.0 - q)
		_fs(R[5] if q < 0.3 else R[4])
		_ring(hero_x, hero_y, (0.3 + 0.8 * _ease(q)) * (0.6 + 0.4 * k), 0, 0.0, 14.0 - 10.0 * q)
		_ring(hero_x, hero_y, (0.3 + 0.8 * _ease(q)) * (0.6 + 0.4 * k) - 0.06, 2, 0.0, 14.0 - 10.0 * q)
		_glow(hx, hy, 34.0 * k, R[4], 0.7 * (1.0 - q))
		# (a plus of life over him)
		if q < 0.6:
			_ga(1.0 - q / 0.6)
			_fs(R[5])
			var top := _ri(hy - 14.0 - q * 10.0)
			_fill(_ri(hx) - 2, top - 5, 5, 11)
			_fill(_ri(hx) - 5, top - 2, 11, 5)
			_fs(R[4])
			_fill(_ri(hx) - 1, top - 4, 3, 9)
			_fill(_ri(hx) - 4, top - 1, 9, 3)
	_ga(1.0)


# ---- CAUTERIZE
func _cauterize_floor(b: Dictionary) -> void:
	var C: Dictionary = LOOK["cauterize"]
	var R: PackedColorArray = RAMP["cauterize"]
	var bt: float = b["t"]
	var k: float = b["k"]
	# (where it burned: a scorch on the floor, cooling)
	var u := bt / (float(C["flash"]) + float(C["tear"]) + float(C["fly"]) + float(C["steam"]))
	_ga(0.7 * (1.0 - u))
	_fs(R[3] if u < 0.3 else R[1])
	_ring(b["x"], b["y"], 0.35 + 0.2 * _ease(bt / 0.3), 3)
	_fs(R[0])
	_ga(0.5 * (1.0 - u))
	_ring(b["x"], b["y"], 0.22)
	# (the brand's ring closing on him)
	var s0: float = float(C["flash"]) + float(C["tear"]) + float(C["fly"])
	var p := (bt - s0) / float(C["brand"])
	if p > 0.0 and p < 1.0:
		_ga(1.0 - p * 0.6)
		_fs(R[4] if p < 0.5 else R[3])
		for dr in [0.0, 0.05, 0.1]:
			_ring(hero_x, hero_y, _lerp(1.5, 0.3, _ease(p)) * (0.6 + 0.4 * k) - dr)
		_fs(R[5])
		_ring(hero_x, hero_y, _lerp(1.5, 0.3, _ease(p)) * (0.6 + 0.4 * k), 4, t * 3.0)
	_ga(1.0)


func _cauterize_air(b: Dictionary) -> void:
	var C: Dictionary = LOOK["cauterize"]
	var R: PackedColorArray = RAMP["cauterize"]
	var bt: float = b["t"]
	var k: float = b["k"]
	var flash: float = C["flash"]
	var tear: float = C["tear"]
	var fly: float = C["fly"]
	var ax := _wx(b["x"], b["y"])
	var ay := _wy(b["x"], b["y"]) - 12.0
	var hx := _wx(hero_x, hero_y)
	var hy := _wy(hero_x, hero_y) - 14.0
	# (1: the white-hot flash where it fell)
	if bt < flash + 0.1:
		var u := bt / (flash + 0.1)
		_glow(ax, ay, 44.0 * k, Color("#fff6e4"), 0.9 * (1.0 - u))
		_glow(ax, ay, 28.0 * k, R[4], 0.8 * (1.0 - u))
		# (a pillar of fire up off it)
		var tall := _ri(46.0 * k * (1.0 - u * 0.5))
		for k2 in tall:
			var v := float(k2) / tall
			var w := maxi(1, _ri((1.0 - v) * 9.0 * (1.0 - u)))
			_ga((1.0 - v) * (1.0 - u))
			_fs(Color("#ffffff") if v < 0.2 else (R[5] if v < 0.5 else (R[4] if v < 0.8 else R[3])))
			_fill(_ri(ax - w / 2.0 + sin(v * 9.0 + t * 20.0) * 2.0 * v), _ri(ay + 10.0 - k2), w, 1)
		_ga(1.0)
	# (2: its fire torn off it, turning round it and drawn in)
	var t2 := bt - flash
	var tongues := _ri(16.0 * k)
	if t2 > -0.06 and t2 < tear + fly:
		for i in tongues:
			var a0 := (float(i) / tongues) * PI * 2.0
			var tr := _c01(t2 / tear)
			var fl := _c01((t2 - tear - (i % 4) * 0.02) / (fly - 0.06))
			# (spiralling in round it, then thrown along an arc at him)
			var a := a0 + tr * 4.0
			var rr := (1.0 - tr) * 16.0 + 3.0
			var sx0 := ax + cos(a) * rr
			var sy0 := ay + sin(a) * rr * 0.6 - tr * 6.0
			var e := fl * fl
			var px := _lerp(sx0, hx, e)
			var py := _lerp(sy0, hy, e) - sin(e * PI) * 36.0
			if fl >= 1.0:
				continue
			for j in range(6, -1, -1):
				_ga((1.0 - j * 0.12) * ((1.0 - fl) / 0.15 if fl > 0.85 else 1.0))
				_fs(_tone(R, 1.0 - j * 0.1 - (0.0 if fl > 0.0 else 0.15)))
				var e2 := maxf(0.0, e - j * 0.035)
				var qx := _lerp(sx0, hx, e2) if fl > 0.0 else px - cos(a) * j * 2.0
				var qy := _lerp(sy0, hy, e2) - sin(e2 * PI) * 36.0 if fl > 0.0 else py - sin(a) * j
				var s := 3 if j == 0 else (2 if j < 3 else 1)
				_fill(_ri(qx - s / 2.0), _ri(qy - s / 2.0), s, s)
			_glow(px, py, 10.0, R[4], 0.35)
		_ga(1.0)
	# (3: the brand on him: its rune stamped over him in fire, flaring and fading)
	var s0 := flash + tear + fly
	var p := (bt - s0) / float(C["brand"])
	if p > -0.02 and p < 1.0:
		var q := _c01(p)
		_glow(hx, hy, 44.0 * k, R[4], 0.9 * (1.0 - q))
		if q < 0.2:
			_glow(hx, hy, 30.0, Color("#ffffff"), 0.8 * (1.0 - q / 0.2))
		var glyph: Array = GLYPH["cauterize"]
		var sc := 4 if q < 0.1 else 3
		var ox := _ri(hx - (7.0 * sc) / 2.0)
		var oy := _ri(hy - 6.0 - (7.0 * sc) / 2.0 - q * 6.0)
		_ga(1.0 if q < 0.6 else (1.0 - q) / 0.4)
		for gy in 7:
			var row: String = glyph[gy]
			for gx in 7:
				var ch := row[gx]
				if ch == ".":
					continue
				_fs(Color("#ffffff") if q < 0.15 else (R[5] if ch == "o" else R[4]))
				_fill(ox + gx * sc, oy + gy * sc, sc, sc)
		if p > 0.0 and p < 0.05 and b["what"] == "":
			b["what"] = "hit"
			for i in _ri(24.0 * k):
				_bit(hero_x, hero_y, 14, "streak", R, 3, 0.45, 100, 30, 90)
	_ga(1.0)


# ---- FORKING
func _forking_air(b: Dictionary) -> void:
	var Lk: Dictionary = LOOK["forking"]
	var R: PackedColorArray = RAMP["forking"]
	var bolt: float = Lk["bolt"]
	var bt: float = b["t"]
	var k: float = b["k"]
	var sd: int = b["seed"]
	var ax := _wx(b["x"], b["y"])
	var ay := _wy(b["x"], b["y"]) - 12.0
	var bx := _wx(b["x1"], b["y1"])
	var by := _wy(b["x1"], b["y1"]) - 12.0
	var live := bt < bolt
	var after := not live and bt < bolt + float(Lk["after"])
	if not live and not after:
		return
	# (the path: jagged, made anew every other frame while it lives, its last kept for the after-image)
	var frame := int(floorf(bt * 15.0)) if live else int(floorf(bolt * 15.0)) - 1
	var seg := 9
	var path: Array = []
	var len := _hyp(bx - ax, by - ay)
	var dv := len if len != 0.0 else 1.0
	var nx := -(by - ay) / dv
	var ny := (bx - ax) / dv
	for i in seg + 1:
		var u := float(i) / seg
		var j := 0.0 if i == 0 or i == seg else ((_hash(sd, frame * 31 + i) % 2001) / 1000.0 - 1.0) * (6.0 + len * 0.05)
		path.append(PackedFloat64Array([ax + (bx - ax) * u + nx * j, ay + (by - ay) * u + ny * j - sin(u * PI) * 10.0]))
	# (its fork: off two-thirds of the way, down to the floor short of the other)
	var fi := _ri(seg * 0.62)
	var fx0: float = path[fi][0]
	var fy0: float = path[fi][1]
	var fx1 := _lerp(ax, bx, 0.86) + nx * 14.0
	var fy1 := _lerp(ay, by, 0.86) + ny * 14.0 + 14.0
	var prong: Array = [PackedFloat64Array([fx0, fy0])]
	for i in range(1, 5):
		var u := i / 4.0
		var j := 0.0 if i == 4 else ((_hash(sd + 7, frame * 17 + i) % 2001) / 1000.0 - 1.0) * 5.0
		prong.append(PackedFloat64Array([_lerp(fx0, fx1, u) + j, _lerp(fy0, fy1, u) - j * 0.4]))
	if live:
		# (it reaches across in the first two frames, then holds, flickering)
		var reach := _c01(bt / 0.06)
		var shown: Array = path.slice(0, maxi(2, _ri(reach * path.size())))
		_ga(0.3)
		_draw_path(shown, 9, R[2], null)
		_ga(0.55)
		_draw_path(shown, 5, R[3], null)
		_ga(0.7 if int(floorf(bt * 30.0)) % 3 == 2 else 1.0)
		_draw_path(shown, 3, R[4], Color("#ffffff"))
		if reach >= 1.0:
			_ga(0.9)
			_draw_path(prong, 3, R[3], R[5])
			_glow(fx1, fy1, 20.0, R[4], 0.7)
		for p: PackedFloat64Array in shown:
			_glow(p[0], p[1], 16.0 * k, R[3], 0.25)
		_glow(ax, ay, 26.0 * k, R[4], 0.55)
		if reach >= 1.0:
			_glow(bx, by, 30.0 * k, Color("#ffffff"), 0.6 * (1.0 - bt / bolt))
	else:
		# (the twins' sea-green after-image, fading)
		var u := (bt - bolt) / float(Lk["after"])
		_ga(0.6 * (1.0 - u))
		_draw_path(path, 1, R[2], null)
		_ga(0.35 * (1.0 - u))
		_draw_path(prong, 1, R[1], null)
	_ga(1.0)


func _draw_path(pts: Array, w: int, col: Color, core) -> void:
	for i in pts.size() - 1:
		_fs(col)
		_line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w)
		if core != null:
			_fs(core)
			_line(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 1)


# ---- SHIVER
func _shiver_floor(b: Dictionary) -> void:
	var Lk: Dictionary = LOOK["shiver"]
	var R: PackedColorArray = RAMP["shiver"]
	var bt: float = b["t"]
	var k: float = b["k"]
	var cx := _wx(b["lx"], b["ly"])
	var cy := _wy(b["lx"], b["ly"])
	var tt := bt - float(Lk["close"])
	if tt < 0.0:
		return
	var grow := _ease(tt / 0.18)
	var fade := _c01((float(Lk["mist"]) - bt) / 0.4)
	# (a star of ice needles shot out over the floor from its feet, crystals standing along them)
	var n := 8
	for i in n:
		var a := (float(i) / n) * PI * 2.0 + (int(b["seed"]) % 7) * 0.2
		var len := float(Lk["reach"]) * (0.65 if i % 2 != 0 else 1.0) * (0.6 + 0.4 * k) * grow
		var ex := cx + cos(a) * len
		var ey := cy + sin(a) * len * 0.5
		_ga(0.9 * fade)
		_fs(R[2])
		_line(cx, cy + 1.0, ex, ey + 1.0, 3)
		_fs(R[4])
		_line(cx, cy, ex, ey, 2)
		_fs(R[5])
		_line(cx, cy, ex, ey, 1)
		# (crystals up off it)
		for s in range(1, 4):
			var u := s / 4.0
			var px := _ri(_lerp(cx, ex, u))
			var py := _ri(_lerp(cy, ey, u))
			var h := _ri((4 - s) * 4 * grow)
			_fs(R[3])
			_fill(px - 1, py - h + 2, 3, h - 2)
			_fs(R[4])
			_fill(px, py - h, 1, h)
			_fs(Color("#ffffff"))
			_fill(px, py - h, 1, 1)
	_ga(0.5 * fade)
	_fs(R[2])
	_ring(b["lx"], b["ly"], 0.5 * grow, 2)
	_ga(1.0)


func _shiver_air(b: Dictionary) -> void:
	var Lk: Dictionary = LOOK["shiver"]
	var R: PackedColorArray = RAMP["shiver"]
	var close: float = Lk["close"]
	var bt: float = b["t"]
	var k: float = b["k"]
	var m = _mon(int(b["on"]))
	var z := _mid(m)
	var cx := _ri(_wx(b["lx"], b["ly"]))
	var cy := _ri(_wy(b["lx"], b["ly"]) - z)
	# (1: the cross-hairs closing on it, then snapping)
	if bt < close + 0.1:
		var u := _c01(bt / close)
		var r := _ri(_lerp(30, 7, _ease(u)) * (0.6 + 0.4 * k))
		_ga(1.0)
		_fs(Color("#ffffff") if u < 1.0 else R[4])
		for d in [[1, 0], [-1, 0], [0, 1], [0, -1]]:
			var dx: int = d[0]
			var dy: int = d[1]
			var px := cx + dx * r
			var py := cy + dy * r
			_fill(px - (1 if dy != 0 else (0 if dx > 0 else 6)), py - (1 if dx != 0 else (0 if dy > 0 else 6)), 2 if dy != 0 else 7, 2 if dx != 0 else 7)
		# (the corners of its frame)
		_fs(R[3])
		for d in [[1, 1], [1, -1], [-1, 1], [-1, -1]]:
			var dx: int = d[0]
			var dy: int = d[1]
			_fill(cx + dx * r - (0 if dx < 0 else 2), cy + dy * r, 3, 1)
			_fill(cx + dx * r, cy + dy * r - (0 if dy < 0 else 2), 1, 3)
	# (2: the white crack of light as it freezes)
	var f := bt - close
	if f > 0.0 and f < 0.3:
		var u := f / 0.3
		_glow(cx, cy, 48.0 * k, Color("#ffffff"), 0.9 * (1.0 - u))
		_glow(cx, cy, 32.0 * k, R[4], 0.7 * (1.0 - u))
		# (a cross of light, its long arms flat)
		_ga(1.0 - u)
		_fs(Color("#ffffff"))
		var w := _ri(_lerp(40, 10, u) * k)
		_fill(cx - w, cy - 1, w * 2 + 1, 3)
		_fill(cx - 1, cy - _ri(w * 0.6), 3, _ri(w * 1.2) + 1)
	# (3: a shiver: short cold lines either side of it, trembling)
	if f > 0.05 and f < 0.7:
		var u := (f - 0.05) / 0.65
		_ga(0.9 * (1.0 - u))
		_fs(R[4])
		var j := int(floorf(t * 30.0)) % 2
		for i in 3:
			var yy := cy - 6 + i * 6 + j
			_fill(cx - 12 - i * 2 - j, yy, 3, 1)
			_fill(cx + 10 + i * 2 + j, yy, 3, 1)
	_ga(1.0)


# ---- SUNDER
## (a crack's path in the floor: across the tile it stands on, with a turn or two; tiles from its feet)
func _crack(b: Dictionary) -> Array:
	var pts: Array = []
	var sd: int = b["seed"]
	var a := ((sd * 37) % 100) / 100.0 * PI
	for i in range(-4, 5):
		var u := i / 4.0
		var j := 0.0 if i == 0 else ((_hash(sd, i + 9) % 1001) / 1000.0 - 0.5) * 0.18
		pts.append(PackedFloat64Array([cos(a) * u * 1.4 - sin(a) * j, sin(a) * u * 1.4 + cos(a) * j]))
	return pts


func _sunder_floor(b: Dictionary) -> void:
	var Lk: Dictionary = LOOK["sunder"]
	var R: PackedColorArray = RAMP["sunder"]
	var bt: float = b["t"]
	var k: float = b["k"]
	var lx: float = b["lx"]
	var ly: float = b["ly"]
	var secs: float = b["secs"]
	# (the blow's dust ring)
	if bt < float(Lk["dust"]):
		var u := bt / float(Lk["dust"])
		_ga(0.8 * (1.0 - u))
		_fs(Color("#6a6068"))
		for dr in [0.0, 0.06]:
			_ring(lx, ly, 0.3 + 1.4 * _ease(u) * (0.6 + 0.4 * k) - dr, 3)
	# (the crack: cut open, burning, cooling once the stun is over)
	var open := _ease(bt / 0.12)
	var cool := 1.0 if bt < secs else _c01(1.0 - (bt - secs) / float(Lk["cool"]))
	var pts := _crack(b)
	var beat := 0.75 + 0.25 * sin(t * 9.0 + int(b["seed"]))
	var shown := maxi(2, _ri(open * pts.size()))
	var mid := int(floorf(pts.size() / 2.0))
	var from := maxi(0, mid - int(ceilf(shown / 2.0)))
	var to := mini(pts.size() - 1, mid + int(ceilf(shown / 2.0)))
	for i in range(from, to):
		var x0 := _wx(lx + pts[i][0], ly + pts[i][1])
		var y0 := _wy(lx + pts[i][0], ly + pts[i][1])
		var x1 := _wx(lx + pts[i + 1][0], ly + pts[i + 1][1])
		var y1 := _wy(lx + pts[i + 1][0], ly + pts[i + 1][1])
		_ga(cool)
		_fs(R[0])
		_line(x0, y0 + 1.0, x1, y1 + 1.0, 5)
		_ga(cool * beat)
		_fs(R[4])
		_line(x0, y0, x1, y1, 3)
		_fs(Color("#ffffff") if bt < 0.15 else R[5])
		_line(x0, y0, x1, y1, 1)
	_ga(1.0)


func _sunder_air(b: Dictionary) -> void:
	var R: PackedColorArray = RAMP["sunder"]
	var m = _mon(int(b["on"]))
	var top: float = float(m["top"]) if m != null else 24.0
	var bt: float = b["t"]
	var k: float = b["k"]
	var sd: int = b["seed"]
	var cx := _ri(_wx(b["lx"], b["ly"]))
	var cy := _ri(_wy(b["lx"], b["ly"]))
	if b["what"] != "":
		# (a blow on one sundered: its crack flaring white)
		var u := bt / float(b["secs"])
		_glow(cx, cy - top * 0.5, 30.0 * k, R[5], 0.8 * (1.0 - u))
		_glow(cx, cy - top * 0.5, 18.0 * k, R[4], 0.7 * (1.0 - u))
		return
	# (the crack up its front, as long as it is stunned: a zigzag of burning red from its feet to its head, flaring at the first)
	var secs: float = b["secs"]
	var cool := 1.0 if bt < secs else _c01(1.0 - (bt - secs) / float(LOOK["sunder"]["cool"]))
	var open := _ease(bt / 0.16)
	var hot := 0.75 + 0.25 * sin(t * 9.0 + sd)
	var steps := maxi(2, _ri((top * 0.85 * open) / 3.0))
	var px := cx
	var py := cy - 1
	_ga(cool * hot)
	for i in steps:
		var nx := cx + (((_hash(sd, i) % 5) - 2) * (1 if i % 2 != 0 else -1))
		var ny := py - 3
		_fs(R[4])
		_line(px, py, nx, ny, 3)
		_fs(Color("#ffffff") if bt < 0.15 else R[5])
		_line(px, py, nx, ny, 1)
		if i % 3 == 1:
			_fs(R[3])
			_fill(nx + (1 if i % 2 != 0 else -2), ny, 2, 1)
		px = nx
		py = ny
	_glow(cx, cy - top * 0.45, 30.0 * k, R[4], 0.5 * cool * hot)
	if bt < 0.2:
		_glow(cx, cy - top * 0.5, 50.0 * k, R[5], 0.9 * (1.0 - bt / 0.2))
	_ga(1.0)


# ---- FERVOR
func _fervor_floor(b: Dictionary) -> void:
	var R: PackedColorArray = RAMP["fervor"]
	var strong: float = float(b["n"]) / maxf(1.0, float(b["most"]))
	var fade := _c01((float(b["secs"]) - float(b["t"])) / float(LOOK["fervor"]["fade"]))
	# (a ring of heat on the floor round him, brighter with each kill)
	_ga((0.35 + 0.45 * strong) * fade)
	_fs(R[2])
	_ring(hero_x, hero_y, 0.55 + 0.15 * strong)
	_fs(R[3])
	_ring(hero_x, hero_y, 0.55 + 0.15 * strong, 3, t * 2.0)
	_ga(1.0)


func _fervor_air(b: Dictionary) -> void:
	var R: PackedColorArray = RAMP["fervor"]
	var hx := _wx(hero_x, hero_y)
	var hy := _wy(hero_x, hero_y)
	var bt: float = b["t"]
	if b["what"] != "":
		# (a kill's embers, streaming to him along an arc)
		var Ls: float = LOOK["fervor"]["stream"]
		var ax := _wx(b["x"], b["y"])
		var ay := _wy(b["x"], b["y"]) - 10.0
		for i in 10:
			var u := _c01((bt - i * 0.018) / (Ls - 0.18))
			if u <= 0.0 or u >= 1.0:
				continue
			var e := u * u
			var sway := sin(i * 1.7 + int(b["seed"])) * 8.0 * (1.0 - e)
			var px := _lerp(ax, hx, e) + sway
			var py := _lerp(ay, hy - 12.0, e) - sin(e * PI) * 18.0
			_ga(1.0)
			_fs(R[4] if i % 3 != 0 else R[5])
			_fill(_ri(px), _ri(py), 2, 2)
			_fs(R[3])
			_fill(_ri(px - (hx - ax) * 0.02), _ri(py + 1.0), 1, 1)
		return
	# (flames round his feet: more and higher with each kill, licking up, fading as it runs out)
	var strong: float = float(b["n"]) / maxf(1.0, float(b["most"]))
	var fade := _c01((float(b["secs"]) - bt) / float(LOOK["fervor"]["fade"])) * _c01(bt / 0.15)
	var n := 3 + 2 * _ri(b["n"])
	for i in n:
		var a := (float(i) / n) * PI * 2.0 + t * 1.3
		var rx := 0.42 * 22.6
		var fx := hx + cos(a) * rx
		var fy := hy + sin(a) * rx * 0.5
		# (behind him drawn lower, so he stands in it)
		var tall := (6.0 + 4.0 * strong * 2.5) * (0.75 + 0.25 * sin(t * 13.0 + i * 2.1)) * fade
		var lean := sin(t * 7.0 + i) * 1.5
		var k := 0
		while k < tall:
			var u := k / tall
			var w := maxi(1, _ri((1.0 - u) * 3.0))
			_ga(1.0)
			_fs(R[5] if u < 0.25 else (R[4] if u < 0.5 else (R[3] if u < 0.8 else R[2])))
			_fill(_ri(fx - w / 2.0 + lean * u), _ri(fy - k), w, 1)
			k += 1
	_glow(hx, hy - 8.0, (20.0 + 18.0 * strong) * fade, R[3], (0.25 + 0.35 * strong) * fade)
	_ga(1.0)


# ---- RIME WARD
func _rime_air(b: Dictionary) -> void:
	var Lk: Dictionary = LOOK["rimeward"]
	var R: PackedColorArray = RAMP["rimeward"]
	var pane: float = Lk["pane"]
	var bt: float = b["t"]
	var k: float = b["k"]
	var sd: int = b["seed"]
	var m = _mon(int(b["on"]))
	var z := _mid(m)
	var hx := _wx(hero_x, hero_y)
	var hy := _wy(hero_x, hero_y) - 14.0
	var mx := _wx(b["lx"], b["ly"])
	var my := _wy(b["lx"], b["ly"]) - z
	var dx := mx - hx
	var dy := my - hy
	var d := _hyp(dx, dy)
	if d == 0.0:
		d = 1.0
	# (1: the pane of rime between them, a little out from him toward it: a six-sided pane, cracking)
	if bt < pane:
		var u := bt / pane
		var cx := hx + (dx / d) * 12.0
		var cy := hy + (dy / d) * 12.0
		var s := _ri(_lerp(5, 16, _ease(u * 3.0)) * (0.6 + 0.4 * k))
		_ga(0.35 * (1.0 - u))
		_fs(R[4])
		_fill(_ri(cx - s * 0.45), _ri(cy - s), _ri(s * 0.9), s * 2)
		_ga(1.0 - u * 0.5)
		_fs(Color("#ffffff") if u < 0.2 else R[4])
		for i in 6:
			var a0 := (float(i) / 6.0) * PI * 2.0 + PI / 6.0
			var a1 := (float(i + 1) / 6.0) * PI * 2.0 + PI / 6.0
			_line(cx + cos(a0) * s * 0.45, cy + sin(a0) * s, cx + cos(a1) * s * 0.45, cy + sin(a1) * s, 1)
		# (its cracks, spreading from where the blow struck)
		if u > 0.3:
			_fs(Color("#ffffff"))
			var c := _ease((u - 0.3) / 0.5)
			for i in 4:
				var a := i * 1.6 + sd
				_line(cx, cy, cx + cos(a) * s * 0.45 * c, cy + sin(a) * s * c, 1)
		_glow(cx, cy, 22.0 * k, R[4], 0.5 * (1.0 - u))
	# (2: blown at it as shards)
	var t2 := bt - pane * 0.7
	if t2 > 0.0 and t2 < float(Lk["shards"]):
		var u := t2 / float(Lk["shards"])
		for i in _ri(14.0 * k):
			var spread := ((_hash(sd, i) % 1001) / 1000.0 - 0.5) * 16.0
			var e := _c01(u * (0.8 + (i % 3) * 0.15))
			var px := _lerp(hx + (dx / d) * 12.0, mx, e) + (-dy / d) * spread * (1.0 - e * 0.6)
			var py := _lerp(hy + (dy / d) * 12.0, my, e) + (dx / d) * spread * (1.0 - e * 0.6)
			_ga(1.0)
			_fs(Color("#ffffff") if i % 2 != 0 else R[4])
			_line(px, py, px - (dx / d) * 8.0, py - (dy / d) * 8.0, 2)
		if u > 0.8:
			_glow(mx, my, 28.0 * k, R[4], 0.7)
	# (3: rime crusted on it while it is chilled: specks of frost round it, glinting)
	if bt > pane and bt < float(b["secs"]) and m != null and not m["dead"]:
		var top: int = int(m["top"])
		var half: int = int(m["half"])
		var fade := _c01((float(b["secs"]) - bt) / 0.4)
		var bx := _ri(_wx(b["lx"], b["ly"]))
		var by := _ri(_wy(b["lx"], b["ly"]))
		for i in 34:
			var sx := bx + ((_hash(sd, i * 3) % (half * 2 + 1)) - half)
			var sy := by - 1 - (_hash(sd, i * 3 + 1) % maxi(1, top - 2))
			var glint := (int(floorf(t * 8.0)) + i) % 9 == 0
			_ga(fade * (1.0 if glint else 0.75))
			_fs(Color("#ffffff") if glint else (R[4] if i % 2 != 0 else Color("#e8f4f0")))
			_fill(sx, sy, 1, 1)
		_glow(bx, by - top * 0.5, 20.0, R[4], 0.18 * fade)
	_ga(1.0)


# ---- IMPLODE
func _implode_floor(b: Dictionary) -> void:
	var R: PackedColorArray = RAMP["implode"]
	var Lk: Dictionary = LOOK["implode"]
	var bx: float = b["x"]
	var by: float = b["y"]
	var bt: float = b["t"]
	var k: float = b["k"]
	var wait: float = b["wait"]
	var cx := _wx(bx, by)
	var cy := _wy(bx, by)
	if bt < wait:
		# (the vortex: its ring closing, three arms turning in, the floor's dust dragged in along them)
		var u := bt / wait
		var rr: float = float(b["reach"]) * (1.0 - _ease(u) * 0.85)
		_ga(0.9)
		_fs(R[3])
		_ring(bx, by, rr, 0, -t * 6.0)
		_ring(bx, by, rr - 0.05, 0, -t * 6.0)
		_fs(R[4])
		_ring(bx, by, rr, 3, -t * 6.0)
		for arm in 3:
			for i in 26:
				var v := i / 26.0
				var a := arm * ((PI * 2.0) / 3.0) + v * 3.2 - t * 7.0
				var r2 := rr * (1.0 - v) * 22.6
				_ga(0.85 * (1.0 - v * 0.5))
				_fs(R[4] if v > 0.7 else (R[3] if v > 0.35 else R[2]))
				_fill(_ri(cx + cos(a) * r2), _ri(cy + sin(a) * r2 * 0.5), 2, 2)
		# (the dark point at its heart, swelling)
		var core := 2.0 + 7.0 * u * k
		_ga(1.0)
		_fs(R[0])
		for yy in range(-int(floorf(core / 2.0)), int(floorf(core / 2.0)) + 1):
			var q := yy / (core / 2.0 + 0.5)
			var half := _ri(core * sqrt(maxf(0.0, 1.0 - q * q)))
			_fill(_ri(cx) - half, _ri(cy) + yy, half * 2 + 1, 1)
		_fs(R[4])
		_ring(bx, by, (core + 1.0) / 22.6, 0, t * 9.0)
	else:
		# (the burst's ring out to its reach; then the star scorched on the floor, fading)
		var br: float = b["r"]
		var u := (bt - wait) / float(Lk["burst"])
		if u < 1.0:
			_ga(1.0 - u)
			_fs(Color("#ffffff") if u < 0.2 else R[4])
			_ring(bx, by, br * _ease(u))
			_ring(bx, by, br * _ease(u) - 0.05)
			_fs(R[3])
			_ring(bx, by, br * _ease(u) * 0.85, 2)
		var s := (bt - wait) / float(Lk["scorch"])
		_ga(0.85 * (1.0 - s))
		for i in 8:
			var a := (float(i) / 8.0) * PI * 2.0 + int(b["seed"])
			var len := br * 22.6 * (0.45 if i % 2 != 0 else 0.75)
			_fs(R[1])
			_line(cx, cy, cx + cos(a) * len, cy + sin(a) * len * 0.5, 2)
			_fs(R[4] if s < 0.3 else R[2])
			_line(cx, cy, cx + cos(a) * len * 0.6, cy + sin(a) * len * 0.3, 1)
	_ga(1.0)


func _implode_air(b: Dictionary) -> void:
	var R: PackedColorArray = RAMP["implode"]
	var Lk: Dictionary = LOOK["implode"]
	var bx: float = b["x"]
	var by: float = b["y"]
	var bt: float = b["t"]
	var k: float = b["k"]
	var wait: float = b["wait"]
	var cx := _wx(bx, by)
	var cy := _wy(bx, by)
	if bt < wait:
		# (everyone in its reach streaked toward its heart: violet lines trailing behind them)
		for m: Dictionary in mons:
			if m["dead"]:
				continue
			var d := _hyp(float(m["x"]) - bx, float(m["y"]) - by)
			if d > float(b["reach"]) or d < 0.15:
				continue
			var mx := _wx(m["x"], m["y"])
			var my := _wy(m["x"], m["y"]) - 8.0
			var far := _hyp(mx - cx, my + 8.0 - cy)
			if far == 0.0:
				far = 1.0
			var ux := (mx - cx) / far
			var uy := (my + 8.0 - cy) / far
			for i in 3:
				_ga(0.8)
				_fs(R[4] if i == 1 else R[3])
				var off := (i - 1) * 4.0
				_line(mx - uy * off, my + ux * off, mx - uy * off + ux * 14.0, my + ux * off + uy * 14.0, 1)
		_glow(cx, cy - 4.0, 30.0 * k, R[3], 0.3 + 0.3 * (bt / wait))
	else:
		# (the burst: a white point, rays, a column of light)
		var br: float = b["r"]
		var u := (bt - wait) / float(Lk["burst"])
		if u < 1.0:
			_glow(cx, cy - 6.0, 50.0 * k * (br / 2.2), Color("#ffffff"), 0.9 * (1.0 - u))
			_glow(cx, cy - 6.0, 36.0 * k * (br / 2.2), R[3], 0.8 * (1.0 - u))
			_ga(1.0 - u)
			var rays: int = int(Lk["rays"])
			for i in rays:
				var a := (float(i) / rays) * PI * 2.0 + int(b["seed"]) * 0.3
				var len := br * 22.6 * _ease(u * 2.0) * (0.45 if i % 2 != 0 else 0.75)
				_fs(R[4] if i % 2 != 0 else Color("#ffffff"))
				_line(cx, cy - 6.0, cx + cos(a) * len, cy - 6.0 + sin(a) * len * 0.55, 2)
			if u < 0.4:
				_ga(1.0 - u / 0.4)
				_fs(Color("#ffffff"))
				_fill(_ri(cx) - 1, _ri(cy - 6.0 - 40.0 * (1.0 - u)), 3, _ri(40.0 * (1.0 - u)))
				_fs(R[4])
				_fill(_ri(cx) - 3, _ri(cy - 6.0 - 30.0 * (1.0 - u)), 1, _ri(30.0 * (1.0 - u)))
				_fill(_ri(cx) + 3, _ri(cy - 6.0 - 30.0 * (1.0 - u)), 1, _ri(30.0 * (1.0 - u)))
	_ga(1.0)
