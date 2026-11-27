## THE BRUSHES THE 52 DESIGNED MELDS ARE PAINTED WITH (fx_melds8.gd's, the game's own: engine/px.ts): dots in game pixels laid as
## blocks, lines, rings on the floor, light added among them, bits thrown and cooling; and a run of beats, each begun by a telling
## of the rules (melds52_rules.gd `m52`), following what it is on, painted from the time since. Each group's painter
## (fx_m52paint.gd Twin's, fx_m52p_<group>.gd the others) extends this, and fills its hooks: `begin` (a telling taken: its beat's
## length, what it throws), `tick` (each frame of a beat), `ongoing` (what goes on without a telling), `paint_floor` and `paint_air` (a beat
## painted under and over what stands), `paint_floor_more` and `paint_air_more` (what is painted without a beat).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const M8 := preload("res://scripts/fx_melds8.gd")
const L := preload("res://scripts/fx_looks.gd")

var fx
var beats: Array = []
var bits: Array = []
var t := 0.0
var seeds := 1
var _ramps := {}
var _canvas: CanvasItem = null
var _pts := PackedVector2Array()
var _cols := PackedColorArray()
var _idx := PackedInt32Array()
var _style := Color.WHITE
var _alpha := 1.0

## (the melds' own ice and fire, darkest to brightest; with OWN on, Frost's and Flame's own, fx_looks.json's frost and fire ramps,
## his “I want consistency with my damage”: own_colours)
static var ICE := [Color("#0c1428"), Color("#1c3a86"), Color("#2e6cc8"), Color("#58a8f0"), Color("#b0e0ff"), Color("#ffffff")]
const STONE := [Color("#1a1410"), Color("#3a2e22"), Color("#6a5236"), Color("#9a7a52"), Color("#c8a878"), Color("#f0dcb4")]
const DUST := [Color("#2a2420"), Color("#4a4038"), Color("#7a6a58"), Color("#a8967c")]
static var FIRE := [Color("#3a0c04"), Color("#a82810"), Color("#e05018"), Color("#ff8a2a"), Color("#ffc24a"), Color("#fff0a0")]
const ICE_OWN := [Color("#0c1428"), Color("#1c3a86"), Color("#2e6cc8"), Color("#58a8f0"), Color("#b0e0ff"), Color("#ffffff")]
const FIRE_OWN := [Color("#3a0c04"), Color("#a82810"), Color("#e05018"), Color("#ff8a2a"), Color("#ffc24a"), Color("#fff0a0")]


## Sets OWN, and with it the melds' ice and fire to Frost's and Flame's own (or back).
static func set_own(on: bool) -> void:
	OWN = on
	ICE = (ICE_OWN if on else [Color("#0c1020"), Color("#1c2c48"), Color("#3c64a0"), Color("#8ad0fa"), Color("#d8f4ff"), Color("#ffffff")]).duplicate()
	FIRE = (FIRE_OWN if on else [Color("#3a0c04"), Color("#7a1c06"), Color("#c8400c"), Color("#ff8a1c"), Color("#ffd060"), Color("#fff4c8")]).duplicate()


## Its colours, darkest to brightest (as the game's meld ramps run): its deep, its dark, its mid, itself, its light, its glint.
func ramp(id: String) -> PackedColorArray:
	var key := id + "~foe" if _foe_now and (ICY.has(id) or SEA.has(id)) else id
	if _ramps.has(key):
		return _ramps[key]
	var c := Color(FROST_DEEP if ICY.has(id) else SEA_DEEP) if key != id else Color(str(M52.T()["color"].get(id, "#ffffff")))
	var out := PackedColorArray([c.darkened(0.82), c.darkened(0.62), c.darkened(0.35), c, c.lerp(Color.WHITE, 0.45), c.lerp(Color.WHITE, 0.82)])
	_ramps[key] = out
	return out


## (FRIEND CYAN IS THE HERO'S ALONE, his Art Rulebook's Pillar 4 and Monsters 6, and his yes of 23 Nov 2026 to drawing them so: the
## icy melds, whose own colours sit near the friend's cyan, drawn in Frost's deeper blue when they are a monster's)
## (and Cold Snap, Glacier and Permafrost, in Flash Freeze's pale blue, now that their moments on a monster are drawn: the check of
## 26 Nov 2026)
const ICY := ["glide", "flashfreeze", "doubletap", "ripple", "quicksilver", "frostlock", "constellation", "haven", "hydra", "coldsnap", "glacier", "permafrost"]
const FROST_DEEP := "#2e6cc8"
## (the same for the sea-green ones, whose own colours sit near the friend's cyan too: drawn in a deep green when a monster's; the
## check of 26 Nov 2026 against his Art Rulebook)
const SEA := ["pitchfork", "tremor", "lastrites", "revenants", "rewind", "scissors"]
const SEA_DEEP := "#2a8a5c"
## (is the beat being begun or painted now a monster's?)
var _foe_now := false


func _foe_beat(b: Dictionary) -> bool:
	return str(b["what"]) == "foe" or bool(b.get("foe", false))


func clear() -> void:
	beats.clear()
	bits.clear()


func alive() -> bool:
	return not beats.is_empty() or not bits.is_empty()


# --- the brushes (fx_melds8.gd's, the game's: engine/px.ts) ---

static func _ri(v: float) -> int:
	return int(floorf(v + 0.5))


static func _c01(u: float) -> float:
	return clampf(u, 0.0, 1.0)


static func _ease(u: float) -> float:
	var v := _c01(u)
	return 1.0 - (1.0 - v) * (1.0 - v)


func _wx(x: float, y: float) -> float:
	return fx.gx(x, y)


func _wy(x: float, y: float) -> float:
	return fx.gy(x, y)


func _fs(c: Color) -> void:
	_style = c


func _ga(a: float) -> void:
	_alpha = clampf(a, 0.0, 1.0)


func _fill(x: float, y: float, w: float, h: float) -> void:
	if w < 0.0:
		x += w
		w = -w
	if h < 0.0:
		y += h
		h = -h
	if w == 0.0 or h == 0.0 or _alpha <= 0.0:
		return
	var n := _pts.size()
	_pts.append(Vector2(x * 2.0, y * 2.0))
	_pts.append(Vector2((x + w) * 2.0, y * 2.0))
	_pts.append(Vector2((x + w) * 2.0, (y + h) * 2.0))
	_pts.append(Vector2(x * 2.0, (y + h) * 2.0))
	var col := Color(_style.r * _alpha, _style.g * _alpha, _style.b * _alpha, _alpha)
	for k in 4:
		_cols.append(col)
	for k in [0, 1, 2, 0, 2, 3]:
		_idx.append(n + k)


func _flush() -> void:
	if _canvas != null and not _idx.is_empty():
		RenderingServer.canvas_item_add_triangle_array(_canvas.get_canvas_item(), _idx, _pts, _cols)
	_pts = PackedVector2Array()
	_cols = PackedColorArray()
	_idx = PackedInt32Array()


func _glow(x: float, y: float, r: float, color: Color, a: float) -> void:
	var aa := clampf(a, 0.0, 1.0)
	if r <= 0.0 or aa <= 0.0 or _canvas == null:
		return
	_flush()
	_canvas.draw_texture_rect(M8.glow_texture(), Rect2((x - r) * 2.0, (y - r) * 2.0, r * 4.0, r * 4.0), false, Color(color.r * aa, color.g * aa, color.b * aa, 1.0))


func _line(x0: float, y0: float, x1: float, y1: float, w := 1) -> void:
	var n := maxi(1, _ri(maxf(absf(x1 - x0), absf(y1 - y0))))
	var o := int(floorf((w - 1) / 2.0))
	for i in n + 1:
		_fill(_ri(x0 + ((x1 - x0) * i) / n) - o, _ri(y0 + ((y1 - y0) * i) / n) - o, w, w)


## A ring on the floor round (x, y), `rt` tiles (as the floor lies: half as tall as wide); `gap` leaves every so many out.
func _ring(x: float, y: float, rt: float, gap := 0, spin := 0.0, lift := 0.0) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y) - lift
	var rx := rt * 22.6
	var n := maxi(12, _ri(rx * 1.6))
	for i in n:
		if gap != 0 and i % gap == 0:
			continue
		var a := (float(i) / n) * TAU + spin
		_fill(_ri(cx + cos(a) * rx), _ri(cy + sin(a) * rx * 0.5), 1, 1)


static func _tone(r: PackedColorArray, hot: float) -> Color:
	return r[clampi(int(floorf(clampf(hot, 0.0, 0.999) * r.size())), 0, r.size() - 1)]


static func _hash(a: int, b: int) -> int:
	var h := (a * 374761393 + b * 668265263) & 0x7fffffff
	h = ((h ^ (h >> 13)) * 1274126177) & 0x7fffffff
	return h ^ (h >> 16)


func _rh(seed: int, i: int) -> float:
	return float(_hash(seed, i) % 10000) / 10000.0


## How high a monster's middle stands, game pixels (art/bestiary.ts FIGURE_SIZE).
func _mid(m) -> float:
	if m == null or not is_instance_valid(m):
		return 12.0
	return float(L.FIGURE_SIZE.get(str(m.get("kind")), {"top": 24}).get("top", 24)) * 0.5


func _half(m) -> float:
	if m == null or not is_instance_valid(m):
		return 8.0
	return float(L.FIGURE_SIZE.get(str(m.get("kind")), {"half": 8}).get("half", 8))


## Throw out a bit: from (x, y), `z` px up, `speed` tiles a second out, for `life` s, falling `fall` px/s², rising up to `up` px/s.
func _bit(x: float, y: float, z: float, kind: String, r: PackedColorArray, speed: float, life: float, fall: float, up_min: float, up: float) -> void:
	var a := randf() * TAU
	var s := speed * (0.35 + 0.65 * randf())
	bits.append({"x": x, "y": y, "z": z, "vx": cos(a) * s, "vy": sin(a) * s, "vz": up_min + (up - up_min) * randf(), "fall": fall,
		"t": 0.0, "life": life * (0.6 + 0.5 * randf()), "ramp": r, "kind": kind, "size": 2.0 + randf() * 3.0 if kind == "puff" else (2.0 if kind == "stone" else 1.0)})


# --- the moments (the hooks a group's painter fills) ---

## Which ids this painter paints.
func ids() -> Array:
	return []


func begin(b: Dictionary, e: Dictionary) -> bool:
	return false


func tick(b: Dictionary, dt: float) -> void:
	pass


func ongoing(dt: float) -> void:
	pass


func paint_floor(b: Dictionary) -> void:
	pass


func paint_air(b: Dictionary) -> void:
	pass


func paint_floor_more() -> void:
	pass


func paint_air_more() -> void:
	pass


func handle(e: Dictionary) -> void:
	var id: String = e.get("id", "")
	var what: String = e.get("what", "")
	var m = e.get("m")
	if m != null and not is_instance_valid(m):
		m = null
	var b := {"id": id, "what": what, "t": 0.0, "x": float(e.get("x", 0.0)), "y": float(e.get("y", 0.0)), "m": m, "seed": seeds,
		"n": int(e.get("n", 1)), "r": float(e.get("r", 1.5)), "dx": float(e.get("dx", 0.0)), "dy": float(e.get("dy", 0.0)), "done": false,
		"foe": e.get("foe", false), "end": 1.0, "x1": float(e.get("x1", e.get("x", 0.0))), "y1": float(e.get("y1", e.get("y", 0.0))), "e": e}
	seeds += 1
	if m != null:
		b["x"] = m.world.x
		b["y"] = m.world.y
	# (one blow through a pack: its great flash on the first it struck; on the rest, a lesser one)
	for q: Dictionary in beats:
		if q["id"] == id and q["what"] == what and float(q["t"]) < 0.08 and not q.get("minor", false):
			b["minor"] = true
			break
	_foe_now = _foe_beat(b)
	_b = b
	var keep := begin(b, e)
	_b = {}
	_foe_now = false
	if keep:
		beats.append(b)


func update(dt: float) -> void:
	t += dt
	var h = fx.hero()
	for b: Dictionary in beats:
		b["t"] = float(b["t"]) + dt
		var m = b["m"]
		if m != null and is_instance_valid(m) and not m.dead:
			b["x"] = m.world.x
			b["y"] = m.world.y
		# (a monster's beat follows him, as it lies on him; but not one drawn where the monster is: `stay`)
		if b["foe"] and h != null and not b.get("stay", false):
			b["x"] = h.world.x
			b["y"] = h.world.y
		_foe_now = _foe_beat(b)
		_b = b
		tick(b, dt)
		_b = {}
		_foe_now = false
		if float(b["t"]) >= float(b["end"]):
			b["done"] = true
	beats = beats.filter(func(q): return not q["done"])
	ongoing(dt)
	_bits(dt)


func _bits(dt: float) -> void:
	for p: Dictionary in bits:
		p["t"] = float(p["t"]) + dt
		p["x"] = float(p["x"]) + float(p["vx"]) * dt
		p["y"] = float(p["y"]) + float(p["vy"]) * dt
		p["vz"] = float(p["vz"]) - float(p["fall"]) * dt
		p["z"] = maxf(0.0, float(p["z"]) + float(p["vz"]) * dt)
		if p["kind"] == "stone" and float(p["z"]) <= 0.0:
			p["vx"] = float(p["vx"]) * 0.5
			p["vy"] = float(p["vy"]) * 0.5
	bits = bits.filter(func(p): return float(p["t"]) < float(p["life"]))


func draw_floor(c: CanvasItem) -> void:
	_canvas = c
	for b: Dictionary in beats:
		_foe_now = _foe_beat(b)
		_b = b
		paint_floor(b)
	_b = {}
	_foe_now = false
	paint_floor_more()
	_ga(1.0)
	_flush()


func draw_air(c: CanvasItem) -> void:
	_canvas = c
	for b: Dictionary in beats:
		_foe_now = _foe_beat(b)
		_b = b
		paint_air(b)
	_b = {}
	_foe_now = false
	paint_air_more()
	for p: Dictionary in bits:
		_draw_bit(p)
	_ga(1.0)
	_flush()


func _draw_bit(p: Dictionary) -> void:
	var u: float = float(p["t"]) / float(p["life"])
	var sx := _ri(_wx(p["x"], p["y"]))
	var sy := _ri(_wy(p["x"], p["y"]) - float(p["z"]))
	var r: PackedColorArray = p["ramp"]
	var c := _tone(r, 1.0 - u)
	match str(p["kind"]):
		"puff":
			var s := _ri(float(p["size"]) + u * 4.0)
			_ga(0.5 * (1.0 - u))
			_fs(c)
			_fill(sx - s, sy - _ri(s * 0.7), s * 2, _ri(s * 1.4))
		"stone":
			# (a stone, its shadow under it on the floor)
			_ga(0.4 * (1.0 - u))
			_fs(Color("#0a0808"))
			_fill(sx - 1, _ri(_wy(p["x"], p["y"])), 3, 1)
			_ga(1.0 if u < 0.8 else (1.0 - u) / 0.2)
			_fs(r[2])
			_fill(sx - 1, sy - 1, 3, 3)
			_fs(r[4])
			_fill(sx - 1, sy - 1, 1, 1)
			_fs(r[1])
			_fill(sx + 1, sy + 1, 1, 1)
		"bubble":
			_ga(0.9 * (1.0 - u))
			_fs(r[0])
			_fill(sx - 1, sy, 3, 1)
			_fill(sx - 1, sy - 2, 3, 1)
			_fill(sx - 1, sy - 1, 1, 1)
			_fill(sx + 1, sy - 1, 1, 1)
			_fs(r[1])
			_fill(sx - 1, sy - 2, 1, 1)
		"streak":
			_ga(1.0 if u < 0.75 else (1.0 - u) / 0.25)
			_fs(c)
			var bx := (float(p["vx"]) - float(p["vy"])) * 16.0 * 0.035
			var by := (float(p["vx"]) + float(p["vy"])) * 8.0 * 0.035 - float(p["vz"]) * 0.035
			var n := maxi(1, mini(6, _ri(sqrt(bx * bx + by * by))))
			for i in n + 1:
				_fill(_ri(sx - (bx * i) / n), _ri(sy - (by * i) / n), 1, 1)
			_fs(_tone(r, 1.0))
			_fill(sx, sy, 1, 1)
		_:
			_ga(1.0 if u < 0.75 else (1.0 - u) / 0.25)
			_fs(c)
			_fill(sx, sy, p["size"], p["size"])
	_ga(1.0)


## The hero's place, or (x, y).
func _hero_at(b: Dictionary) -> Vector2:
	var h = fx.hero()
	return h.world if h != null else Vector2(b["x"], b["y"])


## A monster's place on the screen, at its middle: Vector2(screen x, screen y).
func _mid_px(b: Dictionary) -> Vector2:
	var m = b["m"]
	return Vector2(_wx(b["x"], b["y"]), _wy(b["x"], b["y"]) - (_mid(m) if m != null else 12.0))


## Tongues of flame up from (cx, cy) on the screen: `n` of them across `w` px, `hgt` px high, in `R` (brightest first).
func _flames(cx: float, cy: float, n: int, w: float, hgt: float, fade: float, R: PackedColorArray, sd: int) -> void:
	for i in n:
		var fx0 := cx - w * 0.5 + w * (float(i) / maxf(1.0, n - 1))
		var hh := hgt * (0.55 + 0.45 * _rh(sd, i + 40)) * (0.75 + 0.25 * sin(t * 18.0 + i * 1.7))
		var ww := 3 if i % 2 == 0 else 2
		var yy := 0.0
		while yy < hh:
			var v := yy / maxf(1.0, hh)
			_ga(fade)
			_fs(_tone(R, v))
			var sway := sin(t * 14.0 + i + v * 4.0) * v * 2.0
			_fill(_ri(fx0 + sway) - (1 if ww == 3 else 0), _ri(cy - yy), _ri(ww * (1.0 - v * 0.6)) + 1, 2)
			yy += 2.0
	_ga(1.0)


## A jagged bolt from a to b on the screen, made anew every other frame, with its glow (as Forking's: fx_melds8.gd).
func _bolt(ax: float, ay: float, bx: float, by: float, R: PackedColorArray, sd: int, fade: float, wide := 3) -> void:
	if _same("bolt"):
		return
	if OWN:
		_volt(ax, ay, bx, by, sd, fade)
		return
	var frame := int(floorf(t * 15.0))
	var seg := 7
	var len := sqrt((bx - ax) * (bx - ax) + (by - ay) * (by - ay))
	var dv := len if len != 0.0 else 1.0
	var nx := -(by - ay) / dv
	var ny := (bx - ax) / dv
	var px := ax
	var py := ay
	for i in range(1, seg + 1):
		var u := float(i) / seg
		var j := 0.0 if i == seg else (_rh(sd, frame * 31 + i) - 0.5) * 2.0 * (4.0 + len * 0.05)
		var qx := ax + (bx - ax) * u + nx * j
		var qy := ay + (by - ay) * u + ny * j - sin(u * PI) * 6.0
		_ga(0.35 * fade)
		_fs(R[2])
		_line(px, py, qx, qy, wide + 4)
		_ga(fade)
		_fs(R[4])
		_line(px, py, qx, qy, wide)
		_fs(Color.WHITE)
		_line(px, py, qx, qy, 1)
		px = qx
		py = qy
	_glow(ax, ay, 16.0, R[4], 0.5 * fade)
	_glow(bx, by, 20.0, R[5], 0.6 * fade)
	_ga(1.0)


## Wisps of life curving from (a) to (b) on the floor, `n` of them, `u` of the way there (0 to 1), in `R`, `thick` px.
func _wisps(ax: float, ay: float, bx: float, by: float, u: float, n: int, R: PackedColorArray, sd: int, thick := 1, za := 12.0, zb := 14.0) -> void:
	if _same("wisps"):
		return
	for k in n:
		var bend := (_rh(sd, k) - 0.5) * 2.0
		var sx := _wx(ax, ay)
		var sy := _wy(ax, ay) - za
		var ex := _wx(bx, by)
		var ey := _wy(bx, by) - zb
		var cx := (sx + ex) * 0.5 + bend * 18.0
		var cy := minf(sy, ey) - 30.0 - _rh(sd, k + 5) * 14.0
		var head := _c01(u - k * 0.08)
		# (a comet of it: a streak thick at its head, thinning to a thread behind, not a row of squares)
		var pts: Array = []
		for i in 13:
			var v := head - i * 0.035
			if v < 0.0:
				break
			pts.append(Vector2((1 - v) * (1 - v) * sx + 2 * (1 - v) * v * cx + v * v * ex, (1 - v) * (1 - v) * sy + 2 * (1 - v) * v * cy + v * v * ey))
		for i in range(pts.size() - 1):
			var w := maxi(1, _ri(float(thick) * (1.0 - float(i) / 12.0) + 0.6))
			var p0: Vector2 = pts[i]
			var p1: Vector2 = pts[i + 1]
			# (a dark edge under it, so it reads over anything: bones, ice, fire)
			_ga((1.0 - i * 0.07) * 0.7)
			_fs(R[0])
			_line(p0.x, p0.y + 1.0, p1.x, p1.y + 1.0, w + 1)
			_ga(1.0 - i * 0.07)
			_fs(R[5] if i == 0 else (R[4] if i < 4 else R[3]))
			_line(p0.x, p0.y, p1.x, p1.y, w)
		if head > 0.0 and head < 1.0:
			var x := (1 - head) * (1 - head) * sx + 2 * (1 - head) * head * cx + head * head * ex
			var y := (1 - head) * (1 - head) * sy + 2 * (1 - head) * head * cy + head * head * ey
			_glow(x, y, 10.0 + thick * 4.0, R[4], 0.75)
			_glow(x, y, 5.0 + thick * 2.0, Color.WHITE, 0.4)
	_ga(1.0)


## A sight closing on a point of the screen and snapping shut (Precise's): `u` 0 to 1 the closing, in `R`.
func _sight(cx: float, cy: float, u: float, R: PackedColorArray, fade: float) -> void:
	if _same("sight"):
		return
	if OWN:
		_sight_own(cx, cy, u, R, fade)
		return
	var r := _ri(lerpf(26.0, 6.0, _ease(u)))
	_ga(fade)
	_fs(Color.WHITE if u < 1.0 else R[4])
	for d in [[1, 0], [-1, 0], [0, 1], [0, -1]]:
		var dx: int = d[0]
		var dy: int = d[1]
		_fill(cx + dx * r - (1 if dy != 0 else (0 if dx > 0 else 5)), cy + dy * r - (1 if dx != 0 else (0 if dy > 0 else 5)), 2 if dy != 0 else 6, 2 if dx != 0 else 6)
	_fs(R[3])
	for d in [[1, 1], [1, -1], [-1, 1], [-1, -1]]:
		var dx: int = d[0]
		var dy: int = d[1]
		_fill(cx + dx * r - (0 if dx < 0 else 2), cy + dy * r, 3, 1)
		_fill(cx + dx * r, cy + dy * r - (0 if dy < 0 else 2), 1, 3)
	_ga(1.0)


## A meld's own symbol (its stone's carving: melds52.json `glyph`) laid on the screen at (cx, cy), each of its dots `s` px.
func _glyph(id: String, cx: float, cy: float, s: int, col: Color, glow_col: Color, a: float) -> void:
	var g: Array = M52.T()["glyph"].get(id, [])
	var n := g.size()
	_ga(a)
	for j in n:
		var row: String = g[j]
		for i in row.length():
			var ch := row[i]
			if ch == ".":
				continue
			_fs(col if ch == "X" else glow_col)
			_fill(_ri(cx + (i - n * 0.5) * s), _ri(cy + (j - n * 0.5) * s), s, s)
	_ga(1.0)


# --- shapes, not boxes (his Art Rulebook, How art is made 9: "A prop, a piece of a place or an effect is shaped as the thing it
# is, never a plain ball, box or ring"): each lit from the upper left, as the game's light falls (Pixels 4) ---

## A slab of floor heaved up at (x, y) (its foot), `w` wide and `h` tall: a jagged, leaning point, its left face lit, its right in
## shadow, its broken top edge catching the light. C: deep, dark, mid, itself, light, glint.
func _shard(x: float, y: float, w: float, h: float, C: Array, sd: int, a := 1.0) -> void:
	var lean := (_rh(sd, 1) - 0.5) * w * 0.8
	var tip := 0.25 + 0.5 * _rh(sd, 2)
	var rows := maxi(2, _ri(h))
	_ga(0.6 * a)
	_fs(C[0])
	_fill(_ri(x - w * 0.6), _ri(y), _ri(w * 1.2), 2)
	_ga(a)
	for k in rows:
		var v := float(k) / float(rows)
		var half := w * 0.5 * (1.0 - v * v * 0.85) * (0.8 + 0.2 * _rh(sd, k + 10))
		var cx := x + lean * v
		var y0 := y - k
		var left := cx - half
		var mid := cx - half + half * 2.0 * tip
		_fs(C[4] if k > rows - 3 else C[3])
		_fill(_ri(left), _ri(y0), maxi(1, _ri(mid - left)), 1)
		_fs(C[2])
		_fill(_ri(mid), _ri(y0), maxi(1, _ri(cx + half - mid)), 1)
	_fs(C[5])
	_fill(_ri(x + lean - w * 0.15), _ri(y - rows), 1, 1)
	_fs(C[1])
	_fill(_ri(x + lean * 0.5 + w * 0.1), _ri(y - rows * 0.55), 1, maxi(1, _ri(rows * 0.3)))


## A standing stone, foot at (x, y), `w` wide, `h` tall: weathered, narrowing a little to a rough top, lit on its left, a crack
## down its face, a chip out of its shoulder.
func _stone(x: float, y: float, w: float, h: float, C: Array, sd: int, a := 1.0) -> void:
	var rows := maxi(3, _ri(h))
	_ga(0.6 * a)
	_fs(C[0])
	_fill(_ri(x - w * 0.7), _ri(y) - 1, _ri(w * 1.4), 2)
	_ga(a)
	for k in rows:
		var v := float(k) / float(rows)
		var top := v > 0.82
		var half := w * 0.5 * (1.0 - v * 0.22) * (0.75 if top and _rh(sd, k) < 0.5 else 1.0)
		if v > 0.94:
			half *= 0.6
		var y0 := y - k
		var lx := _ri(x - half)
		var rx := _ri(x + half)
		var split := _ri(x - half * 0.15)
		_fs(C[1])
		_fill(lx - 1, y0, 1, 1)
		_fs(C[4] if top else C[3])
		_fill(lx, y0, maxi(1, split - lx), 1)
		_fs(C[2])
		_fill(split, y0, maxi(1, rx - split), 1)
		_fs(C[1])
		_fill(rx, y0, 1, 1)
	var cxk := x + (_rh(sd, 3) - 0.5) * w * 0.4
	_fs(C[1])
	for k in _ri(rows * 0.45):
		_fill(_ri(cxk + (_rh(sd, k + 20) - 0.5) * 1.5), _ri(y - rows * 0.25 - k), 1, 1)
	_fs(C[5])
	_fill(_ri(x - w * 0.35), _ri(y - rows + 1), 2, 1)


## A round body at (cx, cy), `r` across: iron, a gem, a boss, lit from the upper left, a hard glint at the top left and a dark
## rim at the bottom right. C: rim, dark, mid, light, glint.
func _disc(cx: float, cy: float, r: float, C: Array, a := 1.0) -> void:
	var ir := maxi(1, _ri(r))
	_ga(a)
	for dy in range(-ir, ir + 1):
		var half := sqrt(maxf(0.0, r * r - dy * dy))
		var hx := _ri(half)
		if hx <= 0:
			continue
		for dx in range(-hx, hx):
			var lit := -(float(dx) + 0.5 + float(dy)) / (r * 1.4)
			var edge := sqrt(float(dx * dx + dy * dy)) / r
			var c: Color = C[1]
			if edge > 0.86 and dx + dy > 0:
				c = C[0]
			elif lit > 0.45:
				c = C[3]
			elif lit > -0.1:
				c = C[2]
			_fs(c)
			_fill(_ri(cx) + dx, _ri(cy) + dy, 1, 1)
	_fs(C[4])
	_fill(_ri(cx - r * 0.45), _ri(cy - r * 0.5), maxi(1, _ri(r * 0.3)), 1)


## A curl of smoke or dust at (x, y), `s` across: a rolling billow of three lumps, its lit top catching the light, its belly
## darker, wisping as it goes. C: dark, mid, light.
func _curl(x: float, y: float, s: float, C: Array, sd: int, a := 1.0) -> void:
	for k in 3:
		var kx := x + (float(k) - 1.0) * s * 0.42 + (_rh(sd, k) - 0.5) * s * 0.2
		var ky := y - (s * 0.25 if k == 1 else 0.0) - _rh(sd, k + 5) * s * 0.15
		var kr := s * (0.38 if k == 1 else 0.3) * (0.85 + 0.3 * _rh(sd, k + 9))
		var ir := maxi(1, _ri(kr))
		for dy in range(-ir, ir + 1):
			var hx := _ri(sqrt(maxf(0.0, kr * kr - dy * dy)))
			if hx <= 0:
				continue
			_ga(a * (0.85 if dy < 0 else 0.7))
			_fs(C[2] if dy < -kr * 0.35 else (C[1] if dy < kr * 0.3 else C[0]))
			_fill(_ri(kx) - hx, _ri(ky) + dy, hx * 2, 1)
	_ga(a)


## A wave going out over the floor from (x, y), `rt` tiles: never a plain ring. "sound": broken arcs, each swelling in its middle
## and thinning to its ends, wavering; "water": a crest and its trough, wobbling, flecked with foam; "shock": the floor's grit
## kicked out in short spikes along its front. C: dark, mid, itself, light, glint.
func _front(x: float, y: float, rt: float, C: Array, sd: int, a: float, kind: String) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y)
	var rx := rt * 22.6
	if rx < 1.0:
		return
	var n := maxi(18, _ri(rx * 1.4))
	match kind:
		"sound":
			var arcs := 5
			for k in arcs:
				var a0 := (float(k) + 0.12 + _rh(sd, k) * 0.1) / arcs * TAU
				var span := TAU / arcs * 0.7
				var m := maxi(4, _ri(n / arcs))
				for i in m:
					var v := float(i) / m
					var ang := a0 + span * v
					var wob := 1.0 + 0.04 * sin(ang * 7.0 + t * 9.0)
					var w := 1 + int(sin(v * PI) * 1.8)
					var px := cx + cos(ang) * rx * wob
					var py := cy + sin(ang) * rx * 0.5 * wob
					_ga(a * (0.5 + 0.5 * sin(v * PI)))
					_fs(C[0])
					_fill(_ri(px) - w / 2, _ri(py) - w / 2 + 1, w, w)
					_fs(C[3] if w > 1 else C[2])
					_fill(_ri(px) - w / 2, _ri(py) - w / 2, w, w)
		"water":
			for i in n:
				var ang := float(i) / n * TAU
				var wob := 1.0 + 0.035 * sin(ang * 6.0 + t * 5.0 + float(sd % 7))
				var px := cx + cos(ang) * rx * wob
				var py := cy + sin(ang) * rx * 0.5 * wob
				_ga(a * 0.8)
				_fs(C[1])
				_fill(_ri(cx + cos(ang) * (rx - 2.0) * wob), _ri(cy + sin(ang) * (rx - 2.0) * 0.5 * wob), 2, 1)
				_ga(a)
				_fs(C[3] if sin(ang * 3.0 + t * 4.0) > -0.3 else C[2])
				_fill(_ri(px), _ri(py), 2, 1)
				if _rh(sd, i) < 0.22:
					_fs(C[4])
					_fill(_ri(px + cos(ang) * 2.0), _ri(py + sin(ang) - 1.0), 1, 1)
		"shock":
			for i in n:
				var ang := float(i) / n * TAU + _rh(sd, i) * 0.1
				var l := 2.0 + 4.0 * _rh(sd, i + 31)
				var px := cx + cos(ang) * rx
				var py := cy + sin(ang) * rx * 0.5
				_ga(a)
				_fs(C[1])
				_line(px, py + 1.0, px + cos(ang) * l, py + sin(ang) * l * 0.5 + 1.0, 2)
				_fs(C[3] if i % 3 else C[4])
				_line(px, py, px + cos(ang) * l, py + sin(ang) * l * 0.5, 1)
				if _rh(sd, i + 60) < 0.25:
					_fs(C[2])
					_fill(_ri(px + cos(ang) * (l + 3.0)), _ri(py + sin(ang) * (l + 3.0) * 0.5) - 2, 1, 1)
	_ga(1.0)


## A target's sight on the floor round (x, y), `rt` tiles, closing in: two broken rings and four notches pointing at its heart.
func _reticle(x: float, y: float, rt: float, C: Array, a: float) -> void:
	var cx := _wx(x, y)
	var cy := _wy(x, y)
	var rx := rt * 22.6
	for k in 2:
		var rr := rx * (1.0 - k * 0.45)
		var n := maxi(12, _ri(rr * 1.4))
		for i in n:
			var ang := float(i) / n * TAU
			if fmod(ang + PI * 0.25, PI * 0.5) < 0.35:
				continue
			_ga(a)
			_fs(C[0])
			_fill(_ri(cx + cos(ang) * rr), _ri(cy + sin(ang) * rr * 0.5) + 1, 2, 1)
			_fs(C[3] if k == 0 else C[4])
			_fill(_ri(cx + cos(ang) * rr), _ri(cy + sin(ang) * rr * 0.5), 2, 1)
	for q in 4:
		var ang := float(q) * PI * 0.5
		var ox := cos(ang)
		var oy := sin(ang) * 0.5
		_ga(a)
		_fs(C[0])
		_line(cx + ox * (rx + 6.0), cy + oy * (rx + 6.0) + 1.0, cx + ox * (rx - 3.0), cy + oy * (rx - 3.0) + 1.0, 3)
		_fs(C[4])
		_line(cx + ox * (rx + 6.0), cy + oy * (rx + 6.0), cx + ox * (rx - 3.0), cy + oy * (rx - 3.0), 1)
	_ga(1.0)



# --- LEECH'S OWN DRAIN (his question, 23 Nov 2026: “Leech already had a nice animation for HP going from the enemy to the
# player.  Why are the new melds different?”). A Leech meld's life drawn out of something is the game's own Leech drain: red
# beads of light with red tails curving into him, his pulse as it lands (fx_words610.gd siphon); a monster drinking from him, the
# same wisps flowing into it (drain_to). Each meld's own twist stays on top (Lamprey's teeth, Bloodtide's wave). ON at his yes to
# its pictures, 23 Nov 2026: “All good”; `--leechsame=0` films it off. ---
static var LEECH_SAME := true


## THE WORDS' OWN LOOKS (his "Yes go through them", 23 Nov 2026, to "Want me to go through all 98 and make each one use its words'
## own looks where they exist?", after his "Leech already had a nice animation for HP going from the enemy to the player.  Why
## are the new melds different?"). A meld counts as both its words (words.gd `has`), so each word's own look already plays for
## it: Precise's sight closing on what it marks, Frenzied's spark leaping to him from a kill, Lightning's arcs, Heavy's stun,
## Volatile's blast where a kill goes up, Frost's ice where one freezes. Here a meld no longer draws its own copy of those on top
## (SAME), and what it draws of a word's own thing (a bolt, a sight, a blast, life drawn) is drawn as that word draws it, in its
## colours; its own twist stays on top. And the same look whatever the source (fx_looks.gd same). ON at his yes to their pictures,
## 23 Nov 2026: “All good”; `--wordsown=0` films it off (set_own).
static var OWN := true
const W610 := preload("res://scripts/fx_words610.gd")
## (the beat being begun, ticked or painted now)
var _b: Dictionary = {}
## The moments whose word's own look already plays as they happen, so the meld draws no copy of it with these brushes:
const SAME := {
	# PRECISE behind marks what it hits and its sight closes on it (hero.gd markOn); Doubletap and Bullseye mark more, Riposte the
	# one who struck him, Seeker's arc finds the marked one: each with that sight
	"sight": ["duelist:mark", "needle:mark", "brand:mark", "seeker:mark", "quickdraw:mark", "doubletap:mark", "bullseye:mark",
		"rapier:mark", "riposte:mark", "lancet:mark", "detonator:mark", "ambush:mark", "doubletap:marks", "bullseye:marks",
		"seeker:seek", "riposte:riposte"],
	# FRENZIED behind: a kill's spark leaps from it to him (hero.gd frenzyFed)
	"wisps": ["berserk:kill", "fever:kill"],
	# LIGHTNING's own arcs and bolts from the sky strike each one (arc told with them)
	"bolt": ["jolt:all", "fulgurite:bolt", "fulgurite:stun"],
	# HEAVY's own stun turning over what is stunned (monster.gd stun_for tells it)
	"stars": ["charge:ram", "fulgurite:stun"],
	# VOLATILE in front: what it kills goes up in Volatile's own blast (hero.gd _explode)
	"blast": ["quickfuse:pop", "concussion:boom"],
}
## And the blasts that are a Volatile meld's own (more of them, later, bigger), drawn as Volatile's own blast goes off.
const BLASTS := ["cluster:pop", "detonator:burst", "detonator:boom", "mayhem:burst", "minefield:mine", "timebomb:boom", "hairtrigger:trigger"]


## Is the beat now one whose `kind` of look is its word's own, already played?
func _same(kind: String) -> bool:
	return OWN and not _b.is_empty() and SAME[kind].has("%s:%s" % [_b["id"], _b["what"]])


## A Volatile meld's own blast, under OWN, as Volatile's own goes off (fx.gd _burst, its "blast": what hero.gd _explode tells).
func _own_blast(x: float, y: float, r: float) -> void:
	if fx != null:
		fx._burst({"t": "burst", "x": x, "y": y, "r": r, "el": "phys", "style": "blast", "words": ["volatile"]})


## (is the shell being drawn now his, under OWN? Then Guarding's own shell is its ring, and the meld only dresses it)
var _on_his := false


## His shell's middle and size on the screen, as Guarding's own is drawn round him (fx_words610.gd _shell): [cx, cy, rx, ry].
func _his_shell() -> Array:
	var hp: Vector2 = fx.hero_at()
	var top: float = fx.figures.headroom() if fx.figures != null else 0.0
	if top <= 0.0:
		top = 32.0
	return [fx.gx(hp.x, hp.y), fx.gy(hp.x, hp.y) - top * 0.52, 13.0, floorf(top * 0.62 + 0.5)]


## GUARDING's own shell round him, as fx_words610.gd draws it: emerald points, lit at the upper left, a light running round it,
## faintly filled; for while a meld's shell holds and the game's is not drawn already.
func _guard_shell(cx: float, cy: float, rx: float, ry: float) -> void:
	var C: PackedColorArray = W610.RAMP.get("guarding", PackedColorArray())
	if C.size() < 6:
		return
	_ga(0.14)
	_fs(C[3])
	for j in range(-int(ry), int(ry) + 1):
		var hw := rx * sqrt(maxf(0.0, 1.0 - float(j * j) / (ry * ry)))
		if hw >= 1.0:
			_fill(_ri(cx - hw), _ri(cy) + j, _ri(hw * 2.0), 1)
	var n := 52
	var run := int(floorf(t * 30.0)) % n
	for i in n:
		var a := float(i) / n * TAU
		var ex := cos(a)
		var ey := sin(a)
		var lit := ex < -0.15 and ey < -0.15
		_ga(1.0 if lit or i == run or i == (run + n / 2) % n else 0.8)
		_fs(C[5] if i == run or i == (run + n / 2) % n else (C[4] if lit else C[3]))
		_fill(floorf(cx + ex * rx + 0.5), floorf(cy + ey * ry + 0.5), 2 if lit else 1, 1)
	_ga(1.0)


## Under OWN, his shell from a Guarding meld in front: Guarding's own, dressed as meld `id` dresses it (`dress`, its painter's).
func _own_shell(dress: Callable) -> void:
	var S := _his_shell()
	if fx.w610 == null or float(fx.w610.guard["t"]) <= 0.0:
		_guard_shell(S[0], S[1], S[2], S[3])
	_on_his = true
	dress.call(S[0], S[1], S[2], S[3])
	_on_his = false


## LIGHTNING's own bolt, as fx.gd draws its ground bolts: a thin jagged line, white as it strikes, then its yellow, with its glow
## a pixel under it while fresh; struck anew every 0.16 s for as long as it lasts (fx.gd ground_bolt, its draw).
func _volt(ax: float, ay: float, bx: float, by: float, sd: int, fade: float) -> void:
	var cs: PackedColorArray = L.VOLT
	if cs.size() < 4:
		return
	var at := t + float(sd % 97) * 0.037
	var k := fmod(at, 0.16)
	var shot := int(floorf(at / 0.16))
	var len := Vector2(bx - ax, by - ay).length()
	var segs := clampi(_ri(len / 18.0 * 1.6), 3, 7)
	var col: Color = cs[0] if k < 0.06 else (cs[2] if k < 0.11 else cs[3])
	var px := ax
	var py := ay
	for i in range(1, segs + 1):
		var u := float(i) / segs
		var qx := bx if i == segs else ax + (bx - ax) * u + (_rh(sd, shot * 31 + i) - 0.5) * 2.0 * 5.0
		var qy := by if i == segs else ay + (by - ay) * u + (_rh(sd + 7, shot * 31 + i) - 0.5) * 2.0 * 2.6
		if k < 0.08:
			_ga(fade)
			_fs(cs[3])
			_line(px, py + 1.0, qx, qy + 1.0, 1)
		_ga(fade)
		_fs(col)
		_line(px, py, qx, qy, 1)
		px = qx
		py = qy
	_ga(1.0)


## PRECISE's own sight, as fx_words610.gd draws "of the Mark"'s: four corners round the one it is on, each with a dark edge
## outside it, closing in as `u` runs to 1 and snapping tight; in Precise's colours (a monster's, in its own).
func _sight_own(cx: float, cy: float, u: float, R: PackedColorArray, fade: float) -> void:
	var CP: PackedColorArray = W610.RAMP.get("precise", R)
	var shut := u >= 1.0
	var close := -2.0 if shut else float(_ri(9.0 * (1.0 - _ease(u))))
	var col: Color = (R[4] if shut else R[3]) if _foe_now else (CP[5] if shut else CP[3])
	var x0 := float(_ri(cx)) - 12.0 - close
	var x1 := float(_ri(cx)) + 12.0 + close
	var y0 := float(_ri(cy)) - 17.0 - close
	var y1 := float(_ri(cy)) + 15.0 + close
	var n := 4.0
	for q in [[x0, y0, 1.0, 1.0], [x1, y0, -1.0, 1.0], [x0, y1, 1.0, -1.0], [x1, y1, -1.0, -1.0]]:
		var qx: float = q[0]
		var qy: float = q[1]
		var sx: float = q[2]
		var sy: float = q[3]
		_ga(fade)
		_fs(W610.SIGHT_DARK)
		_fill(minf(qx - sx, qx - sx + sx * n), qy - sy, n + 1.0, 1)
		_fill(qx - sx, minf(qy - sy, qy - sy + sy * n), 1, n + 1.0)
		_fs(col)
		_fill(minf(qx, qx + sx * (n - 1.0)), qy, n, 1)
		_fill(qx, minf(qy, qy + sy * (n - 1.0)), 1, n)
	_ga(1.0)


## Life drawn from the beat's place (x, y) to (x1, y1), as the game's Leech draws it.
func _drain(b: Dictionary, n: int) -> void:
	if fx == null or fx.w610 == null:
		return
	var hp: Vector2 = fx.hero_at()
	var to := Vector2(float(b["x1"]), float(b["y1"]))
	if to.distance_to(hp) < 0.8:
		fx.w610.siphon(float(b["x"]), float(b["y"]), n)
	else:
		fx.w610.drain_to(float(b["x"]), float(b["y"]), to.x, to.y, n)
