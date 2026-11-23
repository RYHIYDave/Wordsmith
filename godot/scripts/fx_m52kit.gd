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

const ICE := [Color("#0c1020"), Color("#1c2c48"), Color("#3c64a0"), Color("#8ad0fa"), Color("#d8f4ff"), Color("#ffffff")]
const STONE := [Color("#1a1410"), Color("#3a2e22"), Color("#6a5236"), Color("#9a7a52"), Color("#c8a878"), Color("#f0dcb4")]
const DUST := [Color("#2a2420"), Color("#4a4038"), Color("#7a6a58"), Color("#a8967c")]
const FIRE := [Color("#3a0c04"), Color("#7a1c06"), Color("#c8400c"), Color("#ff8a1c"), Color("#ffd060"), Color("#fff4c8")]


## Its colours, darkest to brightest (as the game's meld ramps run): its deep, its dark, its mid, itself, its light, its glint.
func ramp(id: String) -> PackedColorArray:
	if _ramps.has(id):
		return _ramps[id]
	var c := Color(str(M52.T()["color"].get(id, "#ffffff")))
	var out := PackedColorArray([c.darkened(0.82), c.darkened(0.62), c.darkened(0.35), c, c.lerp(Color.WHITE, 0.45), c.lerp(Color.WHITE, 0.82)])
	_ramps[id] = out
	return out


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
	if begin(b, e):
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
		if b["foe"] and h != null:
			b["x"] = h.world.x
			b["y"] = h.world.y
		tick(b, dt)
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
		paint_floor(b)
	paint_floor_more()
	_ga(1.0)
	_flush()


func draw_air(c: CanvasItem) -> void:
	_canvas = c
	for b: Dictionary in beats:
		paint_air(b)
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
	for k in n:
		var bend := (_rh(sd, k) - 0.5) * 2.0
		var sx := _wx(ax, ay)
		var sy := _wy(ax, ay) - za
		var ex := _wx(bx, by)
		var ey := _wy(bx, by) - zb
		var cx := (sx + ex) * 0.5 + bend * 18.0
		var cy := minf(sy, ey) - 30.0 - _rh(sd, k + 5) * 14.0
		var head := _c01(u - k * 0.08)
		for i in 10:
			var v := head - i * 0.04
			if v < 0.0:
				break
			var x := (1 - v) * (1 - v) * sx + 2 * (1 - v) * v * cx + v * v * ex
			var y := (1 - v) * (1 - v) * sy + 2 * (1 - v) * v * cy + v * v * ey
			var sz := thick * 2 - 1 if i == 0 else thick
			# (a dark edge under it, so it reads over anything: bones, ice, fire)
			_ga((1.0 - i * 0.1) * 0.8)
			_fs(R[0])
			_fill(_ri(x) - (thick - 1) - 1, _ri(y) - (thick - 1) - 1, sz + 2, sz + 2)
			_ga(1.0 - i * 0.1)
			_fs(R[5] if i == 0 else (R[4] if i < 3 else R[3]))
			_fill(_ri(x) - (thick - 1), _ri(y) - (thick - 1), sz, sz)
		if head > 0.0 and head < 1.0:
			var x := (1 - head) * (1 - head) * sx + 2 * (1 - head) * head * cx + head * head * ex
			var y := (1 - head) * (1 - head) * sy + 2 * (1 - head) * head * cy + head * head * ey
			_glow(x, y, 10.0 + thick * 4.0, R[4], 0.75)
			_glow(x, y, 5.0 + thick * 2.0, Color.WHITE, 0.4)
	_ga(1.0)


## A sight closing on a point of the screen and snapping shut (Precise's): `u` 0 to 1 the closing, in `R`.
func _sight(cx: float, cy: float, u: float, R: PackedColorArray, fade: float) -> void:
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
