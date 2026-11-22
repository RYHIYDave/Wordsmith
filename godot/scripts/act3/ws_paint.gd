## THE WARPED WORDSMITH, DRAWN (render/act1_fx/wsboss.ts, wsboss2.ts, brought over line for line): what he does and what he lays,
## each where his rules put it (act3/wsboss.gd, ws_marks.gd), in the game's own pixels; every warning before it can hurt in the
## bosses' ground-warning pink (act3/garden_warn.gd), as the art chat drew each with his yes (art/endless_boss.ts):
##   HIS MOVES (wsboss:show, laid as each begins)  the charge's lane, the gore's sweep, the stomp's reach, the hammer's shadow and its
##     ring before each blow, the ice's five lines; the hammer over his shadow, the spores in flight; HIS RUNES (his words for them,
##     12 Nov 2026: “i want to see the runes i see in my lexicon on thiese attacks”, “not with the stone around it, just the symbol
##     carved into it.  and have him like create it not just pull it out of thin air”): written at his claw stroke by stroke and
##     thrown; on foot his and his shade's, wheeling up round each other, melded, driven down.
##   WHAT HIS WORDS LAY  the stomp's rings, each crater, each meteor's mark, fall and burning, the ice and its rime, the orb, its zaps
##     and its burst, each trap's rune and its cloud.
##   HIS MELDS  each its own: the floor split and its vents (Eruption), the storm and its stones (Hailstorm), the great bolts (Thunder),
##     the torrent (Avalanche), the sickness spreading (Contagion), the ice flashing to steam and the two beams (Scald), the rot and its
##     trees (Blight), the clouds and their sparks (Fumes), the burning web (Wildfire), the gale and its eye (Frostbite).
## The pieces painted ahead (the hammer, the meteors, the ice, the orb, the spores' flight, a trap, its cloud, the Blight's trees):
## assets/act3/wsboss_things.png, made by tools/godot_wsboss.ts with the art's own painters. Their lights given to the dark as the
## game gives them (`spots`, each frame).
extends RefCounted

const WS := preload("res://scripts/act3/wsboss.gd")
const WM := preload("res://scripts/act3/ws_marks.gd")
const GW := preload("res://scripts/act3/garden_warn.gd")
const GP := preload("res://scripts/act2/gp.gd")
const BF := preload("res://scripts/baked_figure.gd")
const Iso := preload("res://scripts/iso.gd")

const PINK := Color("#ff4f8a")
const HOT := Color("#fffbe8")
const CLEAR := "rgba(0,0,0,0)"
const N_RING := 32
const RUNE_K := 2.0
const OWN_PERILS := ["slamring", "scorch", "fallring", "deathring"]
## (the way he is painted from for each of the game's eight sides, as the art gives them: art/act1_figs/wsboss.ts makeWsArt; the
## views art/skeleton.ts project turns his own points by)
const EIGHT_VIEW := ["front", "back", "front", "frontL", "frontL", "rearL", "rearL", "back"]
## (where each meld's rune goes: into the floor this far before him, at his feet, flung up out of sight, or to the wall behind him)
const INTO := {"eruption": "ERUPT", "hailstorm": "sky", "thunder": "sky", "avalanche": "wall", "blight": "BLIGHT", "scald": 0.0,
	"frostbite": 0.0, "fumes": "FUMES", "wildfire": "WILDFIRE", "contagion": 0.0}
const MEET := Vector3(8, -4, 112)
const WORD_OF := {"power": "power", "flame": "fire", "frost": "frost", "lightning": "lightning", "poison": "poison"}

static var _tex: Texture2D = null
static var _cols := {}
static var _orders := {}
static var _cs := PackedFloat64Array()
static var _sn := PackedFloat64Array()


## Where it is drawn (null: its lights only) and where its lights go (null: drawn only).
class Cv:
	var c: CanvasItem = null
	var look = null
	var clock := 0.0


static func D() -> Dictionary:
	return WS.D()


static func A(k: String):
	return WS.A(k)


static func R() -> Dictionary:
	return WS.D()["runes"]


# --- the pen (game pixels in, the picture's two to a game pixel out) ---

static func _col(s) -> Color:
	if s is Color:
		return s
	var k := str(s)
	if _cols.has(k):
		return _cols[k]
	var c := Color(0, 0, 0, 0)
	if k.begins_with("rgba("):
		var v := k.substr(5, k.length() - 6).split(",")
		c = Color(float(v[0]) / 255.0, float(v[1]) / 255.0, float(v[2]) / 255.0, float(v[3]))
	else:
		c = Color(k)
	_cols[k] = c
	return c


static func _a(s, a: float) -> Color:
	var c := _col(s)
	return Color(c, c.a * clampf(a, 0.0, 1.0))


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _sm(v: float) -> float:
	var c := clampf(v, 0.0, 1.0)
	return c * c * (3.0 - 2.0 * c)


## (Math.round)
static func _rd(v: float) -> float:
	return floorf(v + 0.5)


static func _h(a: float, b: float, c: float) -> float:
	var v := sin(a * 127.1 + b * 311.7 + c * 74.7) * 43758.5453
	return v - floorf(v)


static func _at(x: float, y: float) -> Vector2:
	return Iso.to_screen(x, y) / 2.0


static func _trig() -> void:
	if _cs.size() == N_RING:
		return
	_cs.resize(N_RING)
	_sn.resize(N_RING)
	for i in N_RING:
		_cs[i] = cos(TAU * i / N_RING)
		_sn[i] = sin(TAU * i / N_RING)


static func _spot(g: Cv, x: float, y: float, r: float, a: float) -> void:
	if g.look != null:
		g.look.spot(Vector2(x, y), r, a)


static func _line(g: Cv, pts: PackedVector2Array, col, w: float, a: float) -> void:
	if g.c == null or a <= 0.0 or pts.size() < 2:
		return
	var q := PackedVector2Array()
	q.resize(pts.size())
	for i in pts.size():
		q[i] = pts[i] * 2.0
	g.c.draw_polyline(q, _a(col, a), maxf(1.0, w * 2.0))


static func _seg(g: Cv, a: Vector2, b: Vector2, col, w: float, al: float) -> void:
	if g.c == null or al <= 0.0:
		return
	g.c.draw_line(a * 2.0, b * 2.0, _a(col, al), maxf(1.0, w * 2.0))


## A ring on the floor about (x, y), `r` tiles, as the screen sees it.
static func _ring(x: float, y: float, r: float, n := 48) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in n + 1:
		var ang := float(i) / n * TAU
		pts.append(_at(x + cos(ang) * r, y + sin(ang) * r))
	return pts


static func _dot(g: Cv, x: float, y: float, r: float, col, a: float) -> void:
	if g.c == null or a <= 0.0:
		return
	if r <= 1.0:
		g.c.draw_rect(Rect2(_rd(x) * 2.0, _rd(y) * 2.0, 2.0, 2.0), _a(col, a))
	else:
		g.c.draw_circle(Vector2(x, y) * 2.0, r * 2.0, _a(col, a))


static func _rect(g: Cv, x: float, y: float, w: float, h: float, col, a: float) -> void:
	if g.c == null or a <= 0.0:
		return
	g.c.draw_rect(Rect2(x * 2.0, y * 2.0, w * 2.0, h * 2.0), _a(col, a))


static func _ellipse(g: Cv, x: float, y: float, rx: float, ry: float, col, a: float) -> void:
	if g.c == null or a <= 0.0:
		return
	_trig()
	var pts := PackedVector2Array()
	for i in N_RING:
		pts.append(Vector2(x + _cs[i] * rx, y + _sn[i] * ry) * 2.0)
	g.c.draw_colored_polygon(pts, _a(col, a))


static func _poly(g: Cv, pts: PackedVector2Array, col, a: float) -> void:
	if g.c == null or a <= 0.0 or pts.size() < 3:
		return
	var q := PackedVector2Array()
	for v in pts:
		q.append(v * 2.0)
	g.c.draw_colored_polygon(q, _a(col, a))


## A gradient's colour at `o` (its stops [offset, colour], in order), as a canvas has it (a stop seen through as its neighbour's
## colour, so that what fades out fades, not darkens).
static func _stop_at(stops: Array, o: float) -> Color:
	var first: Array = stops[0]
	if o <= float(first[0]):
		return _col(first[1])
	for i in range(1, stops.size()):
		var b: Array = stops[i]
		if o <= float(b[0]):
			var a: Array = stops[i - 1]
			var ca := _col(a[1])
			var cb := _col(b[1])
			if ca.a <= 0.0:
				ca = Color(cb, 0.0)
			if cb.a <= 0.0:
				cb = Color(ca, 0.0)
			return ca.lerp(cb, (o - float(a[0])) / maxf(1e-6, float(b[0]) - float(a[0])))
	var last: Array = stops[stops.size() - 1]
	return _col(last[1])


## A round of colour falling off from (x, y) out to `rx` across and `ry` down (game pixels), by its stops; kept within the ellipse
## `clip` about it where one is given (a round gradient filling an ellipse).
static func _radial(g: Cv, x: float, y: float, rx: float, ry: float, stops: Array, a: float, clip := Vector2.ZERO) -> void:
	if g.c == null or a <= 0.0 or rx <= 0.0 or ry <= 0.0:
		return
	_trig()
	var pts := PackedVector2Array()
	var cols := PackedColorArray()
	var idx := PackedInt32Array()
	var c0 := _stop_at(stops, 0.0)
	pts.append(Vector2(x, y) * 2.0)
	cols.append(Color(c0, c0.a * minf(1.0, a)))
	var prev := -1
	for s in stops:
		var o := float(s[0])
		if o <= 0.0:
			continue
		var start := pts.size()
		for i in N_RING:
			var oo := o
			if clip != Vector2.ZERO:
				oo = minf(o, 1.0 / sqrt(pow(_cs[i] * rx / clip.x, 2.0) + pow(_sn[i] * ry / clip.y, 2.0)))
			var cc := _stop_at(stops, oo)
			pts.append(Vector2(x + _cs[i] * rx * oo, y + _sn[i] * ry * oo) * 2.0)
			cols.append(Color(cc, cc.a * minf(1.0, a)))
		for i in N_RING:
			var j := (i + 1) % N_RING
			if prev < 0:
				idx.append_array([0, start + i, start + j])
			else:
				idx.append_array([prev + i, start + i, start + j, prev + i, start + j, prev + j])
		prev = start
	if not idx.is_empty():
		RenderingServer.canvas_item_add_triangle_array(g.c.get_canvas_item(), idx, pts, cols)


## A pool on the floor (an ellipse as the screen sees a round of `r` tiles), its colour falling off from its middle.
static func _pool(g: Cv, x: float, y: float, r: float, stops: Array, a := 1.0) -> void:
	var s := _at(x, y)
	var R := r * 16.0 * sqrt(2.0)
	_radial(g, s.x, s.y, R, R * 0.5, stops, a)


static func _haze(g: Cv, x: float, y: float, r: float, col, a: float) -> void:
	if a <= 0.0 or r <= 0.0:
		return
	_radial(g, x, y, r, r, [[0.0, col], [1.0, CLEAR]], a)


## A shape filled with a gradient up it: its rows ([left x, right x, y], bottom to top), each coloured by how far up it is from `y0`
## to `y0 - H`.
static func _vfill(g: Cv, rows: Array, y0: float, H: float, stops: Array, a: float) -> void:
	if g.c == null or a <= 0.0 or rows.size() < 2:
		return
	var pts := PackedVector2Array()
	var cols := PackedColorArray()
	var idx := PackedInt32Array()
	for r in rows:
		var cc := _stop_at(stops, _c01((y0 - float(r[2])) / maxf(1e-6, H)))
		var col := Color(cc, cc.a * minf(1.0, a))
		pts.append(Vector2(r[0], r[2]) * 2.0)
		cols.append(col)
		pts.append(Vector2(r[1], r[2]) * 2.0)
		cols.append(col)
	for i in rows.size() - 1:
		var b := i * 2
		idx.append_array([b, b + 1, b + 3, b, b + 3, b + 2])
	RenderingServer.canvas_item_add_triangle_array(g.c.get_canvas_item(), idx, pts, cols)


## A jagged bolt from (x0, y0) to (x1, y1) on the screen: its glow, its body, its white heart; forks off it.
static func _bolt(g: Cv, x0: float, y0: float, x1: float, y1: float, seed: float, w: float, cols: Array, a := 1.0, fork := 2) -> void:
	if g.c == null:
		return
	var n := maxi(3, int(_rd(Vector2(x1 - x0, y1 - y0).length() / 9.0)))
	var L := Vector2(x1 - x0, y1 - y0).length()
	if L == 0.0:
		L = 1.0
	var nx := -(y1 - y0) / L
	var ny := (x1 - x0) / L
	var pts := PackedVector2Array([Vector2(x0, y0)])
	for i in range(1, n):
		var u := float(i) / n
		var j := (_h(seed, i, 3) - 0.5) * 2.0 * minf(10.0, L * 0.12)
		pts.append(Vector2(x0 + (x1 - x0) * u + nx * j, y0 + (y1 - y0) * u + ny * j))
	pts.append(Vector2(x1, y1))
	_line(g, pts, cols[0], w * 3.0, a * 0.35)
	_line(g, pts, cols[1], w * 1.6, a * 0.85)
	_line(g, pts, cols[2], maxf(1.0, w * 0.6), a)
	for f in fork:
		var i := 1 + floori(_h(seed, f, 9) * (pts.size() - 2))
		var fp := pts[i]
		var ang := atan2(y1 - y0, x1 - x0) + (_h(seed, f, 11) - 0.5) * 1.8
		var fl := L * (0.12 + 0.15 * _h(seed, f, 13))
		_bolt(g, fp.x, fp.y, fp.x + cos(ang) * fl, fp.y + sin(ang) * fl, seed * 7.0 + f + 1.0, w * 0.5, cols, a * 0.8, 0)


## A round warning about (x, y), `r` tiles, `k` through it.
static func _round_warn(g: Cv, x: float, y: float, r: float, k: float) -> void:
	if g.c != null:
		GW.fan(g.c, Vector2(x, y), Vector2(1, 0), 1, -PI, PI, r, k, g.clock)


static func _strip_warn(g: Cv, at: Vector2, f: Vector2, from: float, to: float, l0: float, l1: float, k: float) -> void:
	if g.c != null:
		GW.strip(g.c, at, f, 1, from, to, l0, l1, k, g.clock)


## The whole floor darkened (a storm over the room).
static func _tint_floor(g: Cv, col, a: float) -> void:
	if a <= 0.0:
		return
	var P := WS.place()
	_pool(g, P["cx"], P["cy"], float(P["floor"]) + 0.3, [[0.0, col], [0.85, col], [1.0, CLEAR]], a)


# --- the pieces painted ahead (art/act1_figs/wsboss.ts WS_THING_MAKERS) ---

static func _sheet() -> Texture2D:
	if _tex == null:
		_tex = load("res://assets/act3/wsboss_things.png")
	return _tex


## A piece's `i`th frame (held at its first and last): [x, y, w, h, ax, ay] in the sheet, or null.
static func _pic(name: String, i: int):
	var n := int(D()["things"].get(name, 0))
	if n <= 0:
		return null
	var q: Array = D()["pics"]["%s|%d" % [name, clampi(i, 0, n - 1)]]
	return q if float(q[2]) > 0.0 else null


static func _fig(k: String):
	return D()["fig"][k]


static func _fps() -> float:
	return float(_fig("THING_FPS"))


## (meteorFrame) A meteor's frame `u` seconds from its landing: its fall, its blast and settling, then its burning going round.
static func _meteor_frame(u: float) -> int:
	var F := int(_fig("METEOR_FALL"))
	var L := int(_fig("METEOR_LAND"))
	if u < 0.0:
		return clampi(floori((u + float(A("FIRE")["fall"])) * _fps()), 0, F - 1)
	if u < 0.6:
		return F + mini(L - 1, floori(u * _fps()))
	return F + L + floori(u * _fps()) % int(_fig("METEOR_BURN"))


## (iceFrame) A cluster's frame `u` seconds since it burst (-1: none).
static func _ice_frame(u: float) -> int:
	var st := float(A("FROST")["stand"])
	if u <= 0.0 or u > st + 0.18:
		return -1
	if u < 0.05:
		return 0
	if u < 0.09:
		return 1
	if u < 0.2:
		return 2
	if u < st:
		return 3
	return mini(6, 4 + floori((u - st) / 0.06))


## (trapFrame) A trap's frame: growing in, its pulse going round, its snap.
static func _trap_frame(u: float, sw: float) -> int:
	var N: Dictionary = _fig("TRAP_N")
	var grow := int(N["grow"])
	var pulse := int(N["pulse"])
	var sprout := float(A("SPORE")["sprout"])
	if sw > 0.0:
		return grow + pulse + mini(int(N["snap"]) - 1, floori(sw * float(N["snap"])))
	if u < sprout:
		return mini(grow - 1, floori(u * _fps()))
	return grow + floori((u - sprout) * _fps()) % pulse


static func _tree_variant(n: int) -> int:
	return n if n < 3 else 3 + n % 4


## A piece drawn flat on the floor (a trap's rune), its anchor at (sx, sy).
static func _floor_pic(g: Cv, name: String, i: int, sx: float, sy: float, a: float) -> void:
	if g.c == null or a <= 0.0:
		return
	var q = _pic(name, i)
	if q == null:
		return
	g.c.draw_texture_rect_region(_sheet(), Rect2(_rd(sx) * 2.0 - float(q[4]), _rd(sy) * 2.0 - float(q[5]), q[2], q[3]),
		Rect2(q[0], q[1], q[2], q[3]), Color(1, 1, 1, clampf(a, 0.0, 1.0)))


## (c.stand) A piece standing among the figures at `depth` (its floor point's x + y), its anchor at (sx, sy): the `n`th of the mark's
## pictures this frame; the count after it.
static func _stand(P, p: Dictionary, n: int, depth: float, name: String, i: int, sx: float, sy: float, a := 1.0) -> int:
	var q = _pic(name, i)
	if q == null or a <= 0.0:
		return n
	var pool: Array = p["fx_pool"]
	var s: Sprite2D
	if n < pool.size():
		s = pool[n]
	else:
		s = Sprite2D.new()
		s.centered = false
		s.region_enabled = true
		s.texture = _sheet()
		P.stands.add_child(s)
		pool.append(s)
	s.visible = true
	s.region_rect = Rect2(q[0], q[1], q[2], q[3])
	s.position = Vector2(_rd(sx) * 2.0, depth * 16.0)
	s.offset = Vector2(-float(q[4]), _rd(sy) * 2.0 - float(q[5]) - depth * 16.0)
	s.modulate = Color(1, 1, 1, clampf(a, 0.0, 1.0))
	return n + 1


# --- where it comes from ---

static func _live(m) -> bool:
	return m != null and is_instance_valid(m) and not m.dead and m.h2 != null and m.h2.act != null


static func _act_id(m) -> String:
	return str(m.h2.acts()[m.h2.act["i"]]["id"]).substr(7)


static func _meld_id(p: Dictionary) -> String:
	var id := str(p["a1"]).substr(7)
	return id if D()["melds"].has(id) or id in OWN_PERILS else ""


# --- HIS RUNES (wsboss2.ts: where his hand is, the Lexicon's symbols, writeRune, wordRune, meldRune) ---

## The way his picture is seen from, for the way he faces.
static func _view(m) -> String:
	return EIGHT_VIEW[BF.eight_side(m.face.x, m.face.y)]


## His left hand and his pelvis (his own lengths: forward, to his left, up), `t` into `move`.
static func _bone(move: String, t: float) -> Array:
	var L: Array = D()["bones"][move]
	var r: Array = L[clampi(int(_rd(t * 30.0)), 0, L.size() - 1)]
	return [Vector3(r[0], r[1], r[2]), Vector3(r[3], r[4], r[5])]


## The shade's version of one of his points: from his pelvis's floor point, his shade's size, behind him and over him.
static func _great(b: Array, q: Vector3) -> Vector3:
	var S: Dictionary = A("SHADE")
	var p: Vector3 = b[1]
	var k := float(S["size"])
	return Vector3(p.x + (q.x - p.x) * k - float(S["behind"]), p.y + (q.y - p.y) * k + float(S["side"]), q.z * k + float(S["up"]))


## (art/skeleton.ts project) One of his own points on the screen as his picture from `view` has it (its pixels, half a game pixel).
static func _project(q: Vector3, view: String) -> Vector2:
	var G := float(R()["grid"])
	match view:
		"frontL":
			return Vector2(G * (q.y - q.x), G * 0.5 * (q.y + q.x) - q.z)
		"rearL":
			return Vector2(-G * (q.x + q.y), G * 0.5 * (q.y - q.x) - q.z)
		"front":
			return Vector2(G * (q.x + q.y), G * 0.5 * (q.x - q.y) - q.z)
	return Vector2(G * (q.y + q.x), G * 0.5 * (q.y - q.x) - q.z)


static func _own_at(m, view: String, q: Vector3) -> Vector2:
	return _at(m.world.x, m.world.y) + _project(q, view) / 2.0


static func _spot_of(h: Vector3) -> Vector3:
	return Vector3(h.x + 9.0, h.y, h.z + 15.0)


## The order his claw writes a symbol's cells in (the film tool's strokeOrder).
static func _order(key: String, rows: Array) -> Array:
	if _orders.has(key):
		return _orders[key]
	var left := {}
	for y in rows.size():
		var r: String = rows[y]
		for x in r.length():
			if r[x] != ".":
				left[Vector2i(x, y)] = true
	var dirs := [Vector2i(1, 0), Vector2i(0, 1), Vector2i(-1, 0), Vector2i(0, -1), Vector2i(1, 1), Vector2i(-1, 1), Vector2i(1, -1), Vector2i(-1, -1)]
	var out: Array = []
	var cur := Vector2i.ZERO
	var has_cur := false
	var d := Vector2i.ZERO
	while not left.is_empty():
		var nxt := Vector2i.ZERO
		var found := false
		if has_cur:
			for dd in [d] + dirs:
				if dd != Vector2i.ZERO and left.has(cur + dd):
					nxt = cur + dd
					found = true
					break
		var lift := not found
		if not found:
			for k in left:
				if not found or k.y < nxt.y or (k.y == nxt.y and k.x < nxt.x):
					nxt = k
					found = true
		d = nxt - cur if has_cur and not lift else Vector2i.ZERO
		left.erase(nxt)
		out.append({"x": nxt.x, "y": nxt.y, "lift": lift and out.size() > 0})
		cur = nxt
		has_cur = true
	_orders[key] = out
	return out


static func _box(c: Dictionary, x0: float, y0: float, K: float) -> Rect2:
	var X := _rd(x0 + float(c["x"]) * K)
	var Y := _rd(y0 + float(c["y"]) * K)
	return Rect2(X, Y, _rd(x0 + (float(c["x"]) + 1.0) * K) - X, _rd(y0 + (float(c["y"]) + 1.0) * K) - Y)


## A symbol drawn at (cx, cy), `K` game pixels to a cell, `lit` of its cells written (the freshest white-hot, cooling through its
## glow to its own colours), inked round.
static func _glyph(g: Cv, key: String, rows: Array, cols: Array, cx: float, cy: float, K: float, lit := INF, a := 1.0) -> void:
	if g.c == null or a <= 0.0:
		return
	var order := _order(key, rows)
	var n := rows.size()
	var x0 := cx - n * K / 2.0
	var y0 := cy - n * K / 2.0
	var m := order.size() if lit >= order.size() else mini(order.size(), ceili(lit))
	var ink := _a(R()["ink"], a)
	for i in m:
		var b := _box(order[i], x0, y0, K)
		g.c.draw_rect(Rect2((b.position - Vector2.ONE) * 2.0, (b.size + Vector2(2, 2)) * 2.0), ink)
	for i in m:
		var c: Dictionary = order[i]
		var age := lit - i
		var row: String = rows[int(c["y"])]
		var own = cols[1] if row[int(c["x"])] == "o" else cols[0]
		var b := _box(c, x0, y0, K)
		g.c.draw_rect(Rect2(b.position * 2.0, b.size * 2.0), _a(HOT if age < 1.6 else (cols[1] if age < 4.0 else own), a))


static func _cols_of(word: String) -> Array:
	return [R()["color"][word], R()["glow"][word]]


## HE MAKES IT (the film tool's writeRune): his pink gathers into his raised claw at (fx, fy); then a beam of it writes the symbol on
## the air at (X, Y), stroke by stroke, sparks thrown off where it writes; written, it flares, and hangs burning.
static func _write_rune(g: Cv, word: String, X: float, Y: float, fx: float, fy: float, p: float, held: float, K: float) -> void:
	var GATHER := 0.22
	var rows: Array = R()["glyph"][word]
	var cols := _cols_of(word)
	var order := _order(word, rows)
	var fr := floori(g.clock * 30.0)
	var half := rows.size() * K / 2.0
	if p < GATHER:
		var k := p / GATHER
		for i in 16:
			var ph := k * 1.7 - (i / 16.0) * 0.7
			if ph <= 0.0 or ph >= 1.0:
				continue
			var ang := i * 2.39 + ph * 3.2
			var r := 17.0 * (1.0 - ph) * (0.8 + (0.4 * ((i * 37) % 7)) / 7.0)
			_dot(g, fx + cos(ang) * r, fy + sin(ang) * r * 0.75, 1, cols[0] if i % 3 == 0 else PINK, 0.95)
		_dot(g, fx, fy, 0.5 + 1.2 * k, HOT, 0.9)
		_spot(g, fx, fy, 10.0 + 10.0 * k, 0.4)
		return
	var w := minf(1.0, (p - GATHER) / (1.0 - GATHER))
	var lit := w * order.size()
	_haze(g, X, Y, half + 5.0, PINK, 0.18 + 0.12 * minf(1.0, held * 4.0))
	_spot(g, X, Y, half + 14.0, 0.5)
	var flare := held > 0.0 and held < 0.1
	_glyph(g, word, rows, cols, X, Y, K, order.size() + 1.2 - held * 30.0 if flare else (INF if held > 0.0 else lit))
	if w >= 1.0:
		return
	# (the beam from his claw to where it writes, flickering; dimmer while his claw is lifted between strokes)
	var i := mini(order.size() - 1, floori(lit))
	var a0: Dictionary = order[maxi(0, i - 1)]
	var a1: Dictionary = order[i]
	var f := lit - i
	var lifted: bool = a1["lift"]
	var qx := X - half + ((float(a1["x"]) if lifted else float(a0["x"]) + (float(a1["x"]) - float(a0["x"])) * f) + 0.5) * K
	var qy := Y - half + ((float(a1["y"]) if lifted else float(a0["y"]) + (float(a1["y"]) - float(a0["y"])) * f) + 0.5) * K
	var steps := maxi(1, ceili(Vector2(qx - fx, qy - fy).length()))
	for k in steps + 1:
		if (k + fr) % 5 == 0:
			continue
		var u := float(k) / steps
		var wob := sin(u * 9.0 + fr * 1.7) * 0.6 * sin(PI * u)
		_dot(g, fx + (qx - fx) * u + wob, fy + (qy - fy) * u - wob, 1, HOT if (k + fr) % 3 == 0 else PINK, 0.4 if lifted else 0.9)
	_dot(g, fx, fy, 1, HOT, 0.9)
	_dot(g, qx, qy, 1.4, HOT, 1)
	for k in 6:
		var r := _h(fr, k, 7)
		var ang := r * TAU
		var d := 2.0 + 3.0 * fmod(k * 0.37 + r * 3.0, 1.0)
		_dot(g, qx + cos(ang) * d, qy + sin(ang) * d - 1.0, 1, PINK if k % 2 == 1 else cols[1], 0.9)


## Each word's rune: when it is written, let go, and where it gets to (as the art times them).
static func _throw(move: String) -> Dictionary:
	match move:
		"power":
			var P: Dictionary = A("POWER")
			return {"write": P["write"], "cast": float(P["cast"]), "at": float(P["cast"]) + 0.3}
		"flame":
			var F: Dictionary = A("FIRE")
			return {"write": F["write"], "cast": float(F["cast"]), "at": float(F["burst"])}
		"frost":
			var F: Dictionary = A("FROST")
			return {"write": F["write"], "cast": float(F["write"][1]) + 0.08, "at": float(F["hit"])}
		"lightning":
			var B: Dictionary = A("BOLT")
			return {"write": B["write"], "cast": float(B["cast"]), "at": float(B["crack"])}
		"poison":
			var S: Dictionary = A("SPORE")
			return {"write": S["write"], "cast": float(S["cast"]), "at": float(S["burst"])}
	return {}


## HIS WORDS IN THE SADDLE: each written at his hand, then thrown where it goes.
static func _word_rune(P, g: Cv, m, view: String, move: String, t: float) -> void:
	var W := _throw(move)
	if W.is_empty():
		return
	var w0 := float(W["write"][0])
	var w1 := float(W["write"][1])
	var cast := float(W["cast"])
	var at := float(W["at"])
	if t < w0 or t > at + 0.25:
		return
	var word: String = WORD_OF[move]
	var spot := _own_at(m, view, _spot_of(_bone(move, w1)[0]))
	if t <= cast:
		var hb: Vector3 = _bone(move, t)[0]
		var claw := _own_at(m, view, Vector3(hb.x + 1.5, hb.y, hb.z + 1.5))
		_write_rune(g, word, spot.x, spot.y, claw.x, claw.y, _c01((t - w0) / (w1 - w0)), maxf(0.0, t - w1), RUNE_K)
		return
	# (thrown: flame straight up out of sight; power out over the hero; frost driven into the floor before him; lightning over the
	# room, where the orb will crack out; poison over the hero, where it bursts)
	var a1: Dictionary = m.h2.a1
	var h: Vector2 = P.hero.world
	var fx := float(a1.get("fx", m.face.x))
	var fy := float(a1.get("fy", m.face.y))
	var to: Vector2
	if move == "flame":
		to = Vector2(spot.x, spot.y - 200.0)
	elif move == "frost":
		var fr := float(A("FROST")["from"])
		to = _at(m.world.x + fx * fr, m.world.y + fy * fr)
	elif move == "lightning":
		to = _at((m.world.x + h.x) / 2.0, (m.world.y + h.y) / 2.0) - Vector2(0, 35)
	else:
		to = _at(float(a1.get("cx", h.x)), float(a1.get("cy", h.y))) - Vector2(0, 30)
	var u := _c01((t - cast) / (at - cast))
	var e := u * u if move == "frost" else _sm(u)
	var rows: Array = R()["glyph"][word]
	var cols := _cols_of(word)
	var x := spot.x + (to.x - spot.x) * e
	var y := spot.y + (to.y - spot.y) * e - (0.0 if move == "frost" or move == "flame" else 30.0 * sin(PI * u))
	if t > at:
		# (where it strikes: a flash of his pink and the word's colour)
		var b := (t - at) / 0.25
		_haze(g, to.x, to.y, 8.0 + 14.0 * b, HOT, 0.8 * (1.0 - b))
		_haze(g, to.x, to.y, 12.0 + 18.0 * b, cols[0], 0.5 * (1.0 - b))
		return
	for j in range(1, 5):
		var v := maxf(0.0, e - j * 0.06)
		_glyph(g, word, rows, cols, spot.x + (to.x - spot.x) * v, spot.y + (to.y - spot.y) * v, RUNE_K, INF, 0.35 / j)
	_haze(g, x, y, 10.0, PINK, 0.3)
	_glyph(g, word, rows, cols, x, y, RUNE_K)
	_spot(g, x, y, 16.0, 0.5)


## A MELD (the film tool's meldScene): his rune and his shade's, written; up, wheeling round each other, melded; driven down.
static func _meld_rune(g: Cv, m, view: String, mi: String, t: float) -> void:
	var M: Dictionary = A("MELD")
	var S: Dictionary = A("SHADE")
	var clip: String = _fig("MELD_CLIP")
	var words: Array = D()["melds"][mi]["words"]
	var mine: String = words[0]
	var its: String = words[1]
	var b1 := _bone(clip, float(M["write"][1]))
	var my_spot := _spot_of(b1[0])
	var its_spot := _great(b1, _spot_of(b1[0]))
	var w0 := float(M["write"][0])
	var w1 := float(M["write"][1])
	var up := float(M["up"])
	var meet := float(M["meet"])
	var melded := float(M["melded"])
	var slam := float(M["slam"])
	# (his rune, at his hand; the shade's, a moment after, at its great hand, twice the size)
	if t > w0 and t <= up:
		var hb: Vector3 = _bone(clip, t)[0]
		var q := _own_at(m, view, my_spot)
		var c := _own_at(m, view, Vector3(hb.x + 1.5, hb.y, hb.z + 1.5))
		_write_rune(g, mine, q.x, q.y, c.x, c.y, _c01((t - w0) / (w1 - w0)), maxf(0.0, t - w1), RUNE_K)
	var tl := t - float(S["lag"])
	if tl > w0 and t <= up + float(S["lag"]) * 0.5:
		var bl := _bone(clip, tl)
		var q := _own_at(m, view, its_spot)
		var c := _own_at(m, view, _great(bl, bl[0]))
		_write_rune(g, its, q.x, q.y, c.x, c.y, _c01((tl - w0) / (w1 - w0)), maxf(0.0, tl - w1), RUNE_K * 2.0)
	# (up, and meeting over him: wheeling round each other faster and faster, closing)
	if t > up and t < melded:
		var u := _c01((t - up) / (meet - up))
		var e := _sm(u)
		var lift := func(a: Vector3) -> Vector3: return Vector3(a.x + (MEET.x - a.x) * e, a.y + (MEET.y - a.y) * e, a.z + (MEET.z - a.z) * e + 30.0 * sin(PI * u))
		var pa: Vector3 = lift.call(my_spot)
		var pb: Vector3 = lift.call(its_spot)
		if t > meet:
			var w := (t - meet) / (melded - meet)
			var r := 16.0 * (1.0 - w)
			var th := 18.0 * w * w + 2.0
			pa = Vector3(MEET.x + cos(th) * r, MEET.y + sin(th) * r, MEET.z + sin(th) * r * 0.4)
			pb = Vector3(MEET.x - cos(th) * r, MEET.y - sin(th) * r, MEET.z - sin(th) * r * 0.4)
			for i in 10:
				var a2 := i * 2.4 + t * 13.0
				var q := _own_at(m, view, Vector3(MEET.x + cos(a2) * (r + 6.0 + (i % 3) * 3.0), MEET.y + sin(a2) * (r + 6.0), MEET.z + sin(a2 * 1.3) * 8.0))
				_dot(g, q.x, q.y, 1, PINK if i % 2 == 1 else HOT, 0.9)
		var qa := _own_at(m, view, pa)
		var qb := _own_at(m, view, pb)
		_glyph(g, its, R()["glyph"][its], _cols_of(its), qb.x, qb.y, RUNE_K + 1.0)
		_glyph(g, mine, R()["glyph"][mine], _cols_of(mine), qa.x, qa.y, RUNE_K)
		_spot(g, (qa.x + qb.x) / 2.0, (qa.y + qb.y) / 2.0, 24.0, 0.5)
	# (MELDED: a flash, and the meld's own rune blazing where they met; driven down into the floor by the slam, or flung away)
	var rows: Array = R()["meldGlyph"][mi]
	var ramp: Array = R()["meldRamp"][mi]
	var cols := [ramp[3], ramp[4]]
	var key := "meld:" + mi
	var BIG := 2.5
	var mq := _own_at(m, view, MEET)
	if t >= melded and t < melded + 0.22:
		var b := (t - melded) / 0.22
		_haze(g, mq.x, mq.y, 7.0 + 15.0 * b, HOT, 0.85 * (1.0 - b))
		_haze(g, mq.x, mq.y, 12.0 + 20.0 * b, PINK, 0.6 * (1.0 - b))
	var a1: Dictionary = m.h2.a1
	var fx := float(a1.get("fx", m.face.x))
	var fy := float(a1.get("fy", m.face.y))
	var into = INTO[mi]
	if into is String and into != "sky" and into != "wall":
		into = float(A(into)["at"])
	var into_at := func() -> Vector2:
		if not (into is String):
			return _at(m.world.x + fx * float(into), m.world.y + fy * float(into))
		var d := WS.to_edge(m.world.x, m.world.y, -fx, -fy, 0.2)
		return _at(m.world.x - fx * d, m.world.y - fy * d) - Vector2(0, 20)
	var sky: bool = into is String and into == "sky"
	var wall: bool = into is String and into == "wall"
	if t >= melded and t <= slam - 2.0 / 30.0 + 1e-6:
		_haze(g, mq.x, mq.y, 15.0, PINK, 0.2 + 0.08 * sin(t * 30.0))
		_glyph(g, key, rows, cols, mq.x, mq.y, BIG)
		_spot(g, mq.x, mq.y, 30.0, 0.7)
	elif sky and t > slam - 2.0 / 30.0 and t < slam + 0.3:
		var u := (t - (slam - 2.0 / 30.0)) / (0.3 + 2.0 / 30.0)
		for k2 in 8:
			_glyph(g, key, rows, cols, mq.x, mq.y - 260.0 * u * u - 40.0 * u + 6.0 * k2, BIG, INF, 1.0 if k2 == 0 else 0.45 / k2)
	elif not sky and t > slam - 2.0 / 30.0 and t <= slam + 1.0 / 30.0 + (0.25 if wall else 0.0):
		var u := _c01((t - (slam - 2.0 / 30.0)) / (0.3 if wall else 2.0 / 30.0))
		var iq: Vector2 = into_at.call()
		for k2 in 6:
			var v := maxf(0.0, u - k2 * 0.12)
			_glyph(g, key, rows, cols, mq.x + (iq.x - mq.x) * v, mq.y + (iq.y - mq.y) * v, BIG, INF, 1.0 if k2 == 0 else 0.4 / k2)
	if not sky and t > slam and t < slam + 0.4:
		var b := (t - slam) / 0.4
		var iq: Vector2 = into_at.call()
		_haze(g, iq.x, iq.y, 8.0 + 10.0 * b, "#fff0b0", 0.8 * (1.0 - b))
		_haze(g, iq.x, iq.y, 14.0 + 14.0 * b, cols[0], 0.7 * (1.0 - b))
		_haze(g, iq.x, iq.y, 20.0 + 18.0 * b, PINK, 0.5 * (1.0 - b))
		_spot(g, iq.x, iq.y, 40.0, 0.9 * (1.0 - b))


## The runes of whatever he is doing.
static func _runes(P, g: Cv, m) -> void:
	var id := _act_id(m)
	var t := float(m.h2.act["t"])
	if id == "meld":
		var mi: String = m.h2.meld_of()
		if mi != "":
			_meld_rune(g, m, _view(m), mi, t)
	elif WORD_OF.has(id):
		_word_rune(P, g, m, _view(m), id, t)


# --- ON THE FLOOR ---

static func ground(P, p: Dictionary) -> void:
	var g := Cv.new()
	g.c = P
	g.clock = P._clock
	_ground(P, g, p)


static func _ground(P, g: Cv, p: Dictionary) -> void:
	var name := str(p["a1"]).substr(7)
	if name == "show":
		var m = p.get("src")
		if _live(m):
			_act_ground(g, m)
		return
	if _meld_id(p) != "":
		_meld_ground(g, p, name)
		return
	var t: float = p["t"]
	var x: float = p["x"]
	var y: float = p["y"]
	var TU: Dictionary = D()["tune"]
	match name:
		"rings":
			# (the stomp's three shock rings rolling out, each a bright edge, the floor darkened behind it)
			var S: Dictionary = A("STOMP")
			for j in 3:
				var r := WS.ring_at(j, t)
				if r < 0.0:
					continue
				var fade := 1.0 - _c01((t - float(S["rings"][j])) / float(S["ringLong"]))
				_line(g, _ring(x, y, maxf(0.1, r - 0.25), 40), "#2a0a18", 6.0, 0.35 * fade)
				_line(g, _ring(x, y, r, 40), "#ffd0e0" if j == 0 else "#ff6aa0", 2.0, 0.55 + 0.45 * fade)
		"crater":
			# (where the hammer fell: a crater, its cracks hot a moment, fading)
			var f := 1.0 - _c01(t / float(p["dur"]))
			var s := _at(x, y)
			_ellipse(g, s.x, s.y, 20.0, 10.0, "#0c0608", 0.7 * f)
			for i in 6:
				var ang := i / 6.0 * TAU + 0.4
				_seg(g, s + Vector2(cos(ang) * 8.0, sin(ang) * 4.0), s + Vector2(cos(ang + 0.2) * 26.0, sin(ang + 0.2) * 13.0), "#ff6aa0" if t < 0.5 else "#5a1a2a", 1.0, 0.7 * f)
		"meteor":
			var FI: Dictionary = A("FIRE")
			if t < 0.0:
				# (its mark, filling as it comes)
				if t > -float(FI["warn"]) - 0.15:
					_round_warn(g, x, y, float(TU["flame"]["reach"]), _c01(1.0 + t / float(FI["warn"])))
				return
			# (the floor scorched and burning where it fell: as far as its burning reaches)
			var fade := 1.0 - _c01((t - (float(p["dur"]) - 0.8)) / 0.8)
			var s := _at(x, y)
			var Rb := float(TU["flame"]["burn"]["r"])
			var stops := [[0.0, Color(1.0, 138.0 / 255.0, 42.0 / 255.0, 0.42 * fade)], [0.55, Color(224.0 / 255.0, 40.0 / 255.0, 122.0 / 255.0, 0.25 * fade)], [1.0, "rgba(20,8,12,0)"]]
			_radial(g, s.x, s.y, Rb * 22.0, Rb * 22.0, stops, 1.0, Vector2(Rb * 22.0, Rb * 11.0))
		"ice":
			# (behind the racing ice the floor frozen white, in the five lines; thawing at the last: rime, a frost of pale dots laid
			# along each line, thicker near its middle, glinting here and there; never a beam of light)
			var F: Dictionary = A("FROST")
			var fade := 1.0 - _c01((t - (float(p["dur"]) - 1.0)) / 1.0)
			var reached := 0.6 + maxf(0.0, (t - float(F["hit"]) - 0.04) / float(F["race"])) * float(F["step"])
			var reach := minf(reached, 0.6 + (float(F["steps"]) - 1.0) * float(F["step"]))
			var fx: float = p["fx"]
			var fy: float = p["fy"]
			var lines := int(F["lines"])
			if g.c == null:
				return
			for l in lines:
				var ang := (float(l) / (lines - 1) - 0.5) * deg_to_rad(float(F["fan"]))
				var lx := fx * cos(ang) + fy * sin(ang)
				var ly := fy * cos(ang) - fx * sin(ang)
				for i in 70:
					var u := 0.4 + (reach - 0.4) * fmod(i * 0.618, 1.0)
					var across := (fmod(i * 0.371 + l * 0.17, 1.0) - 0.5) * 0.9
					var s := _at(x + lx * u + ly * across, y + ly * u - lx * across)
					var glint := (i * 7 + l * 3 + floori(g.clock * 4.0)) % 23 == 0
					_rect(g, _rd(s.x), _rd(s.y), 2, 1, "#f2f6ff" if glint else ("#a5c6d7" if i & 1 else "#e2f0f8"), fade * (0.85 if glint else 0.3 * (1.0 - absf(across) * 1.4)))
		"orb":
			var B: Dictionary = TU["bolt"]
			if t > float(B["life"]) + 0.4:
				return
			var s := _at(x, y)
			_ellipse(g, s.x, s.y, 14.0, 7.0, "#0a0610", 0.4)
			# (swelling: its burst's reach marked)
			var sw := WS.orb_swell(t)
			if sw > 0.0 and t < float(B["life"]):
				_round_warn(g, x, y, float(B["burst"]["reach"]), sw)
		"trap":
			# (the rune burned in the floor: growing in, pulsing, snapping white-hot; gone into its cloud)
			if t < 0.0:
				return
			var sp := float(p["a"])
			var swell := float(TU["spore"]["swell"])
			var sw := _c01((t - sp) / swell) if sp != 0.0 else 0.0
			if sp != 0.0 and t - sp > swell:
				return
			var s := _at(x, y)
			var fade := 1.0 if sp != 0.0 else 1.0 - _c01((t - (float(p["dur"]) - 1.0)) / 1.0)
			_floor_pic(g, "trap", _trap_frame(t, sw), s.x, s.y, fade)


## His moves' warnings, and the hammer's shadow.
static func _act_ground(g: Cv, m) -> void:
	if g.c == null:
		return
	var id := _act_id(m)
	var t := float(m.h2.act["t"])
	var a1: Dictionary = m.h2.a1
	var f := Vector2(float(a1.get("fx", m.face.x)), float(a1.get("fy", m.face.y)))
	var TU: Dictionary = D()["tune"]
	var k := -1.0
	match id:
		"charge":
			# (its lane, from where it stands to where its run ends, as wide as it strikes)
			k = GW.warn_k(t, 0.15, float(A("CHARGE_STRIKE")[1]))
			if k >= 0.0:
				var half := float(TU["charge"]["half"])
				_strip_warn(g, Vector2(float(a1.get("x0", m.world.x)), float(a1.get("y0", m.world.y))), f, 0.0, float(a1.get("lane", 6.0)) + 1.0, -half, half, k)
		"gore":
			var G: Dictionary = A("GORE")
			k = GW.warn_k(t, float(G["lower"]) * 0.5, float(G["hit"]))
			if k >= 0.0:
				GW.fan(g.c, m.world, f, 1, -float(TU["gore"]["half"]), float(TU["gore"]["half"]), float(TU["gore"]["reach"]), k, g.clock)
		"stomp":
			var S: Dictionary = A("STOMP")
			k = GW.warn_k(t, float(S["gather"]), float(S["hit"]))
			if k >= 0.0:
				GW.fan(g.c, m.world + f * float(TU["stomp"]["foot"]), f, 1, -PI, PI, float(TU["stomp"]["reach"]), k, g.clock)
		"power":
			# (the hammer's shadow, darker as it comes down; before each blow its reach marked about it)
			if t > float(A("POWER")["cast"]) + 0.2:
				var hm: Vector2 = m.h2.hammer_at(m)
				var s := _at(hm.x, hm.y)
				_ellipse(g, s.x, s.y, 22.0, 11.0, "#0a0610", 0.45)
				for sl in D()["slams"]:
					k = GW.warn_k(t, float(sl) - 0.55, float(sl))
					if k >= 0.0:
						GW.fan(g.c, hm, f, 1, -PI, PI, float(TU["power"]["reach"]), k, g.clock)
		"frost":
			# (the five lines the ice will race out along, fanned before the place the rune strikes)
			var F: Dictionary = A("FROST")
			k = GW.warn_k(t, 0.2, float(F["hit"]))
			if k >= 0.0:
				var s: Vector2 = m.world + f * float(D()["ice"]["from"])
				var reach := 0.6 + (float(F["steps"]) - 1.0) * float(F["step"]) + 0.3
				var lines := int(F["lines"])
				for l in lines:
					var ang := (float(l) / (lines - 1) - 0.5) * deg_to_rad(float(F["fan"]))
					var lf := Vector2(f.x * cos(ang) + f.y * sin(ang), f.y * cos(ang) - f.x * sin(ang))
					_strip_warn(g, s, lf, 0.3, reach, -float(TU["frost"]["reach"]), float(TU["frost"]["reach"]), k)


## THE MELDS ON THE FLOOR (wsboss2.ts meldGround).
static func _meld_ground(g: Cv, p: Dictionary, id: String) -> void:
	var t: float = p["t"]
	var x: float = p["x"]
	var y: float = p["y"]
	var fx: float = p["fx"]
	var fy: float = p["fy"]
	var lay: Dictionary = p.get("lay", {})
	var spots: Array = lay.get("spots", [])
	var T2: Dictionary = D()["tune2"]
	var PL := WS.place()
	var CX := float(PL["cx"])
	var CY := float(PL["cy"])
	var FL := float(PL["floor"])
	var T := WS.tile()
	match id:
		"slamring":
			# (the slam's ring rolling out over the whole floor: a bright edge, the floor darkened behind it)
			var r := WM.slam_ring_at(t)
			if r > FL + 1.0:
				return
			var fade := 1.0 - _c01((r - 2.0) / (FL + 1.0))
			_line(g, _ring(x, y, maxf(0.1, r - 0.3)), "#2a0a18", 6.0, 0.35 * fade)
			_line(g, _ring(x, y, r), PINK, 2.0, 0.5 + 0.5 * fade)
			_line(g, _ring(x, y, r + 0.08), "#ffd0e0", 1.0, 0.8 * fade)
		"deathring":
			# (his death: the burst, a ring of his light thrown out over the floor from where he was, as his runes fly)
			var u := t / 0.7
			if u >= 1.0:
				return
			var r := (6.0 + 120.0 * (1.0 - (1.0 - u) * (1.0 - u))) / T
			_line(g, _ring(x, y, r), PINK, 4.0, 0.8 * (1.0 - u))
			_line(g, _ring(x, y, r + 0.05), "#ffd8e6", 1.5, 0.9 * (1.0 - u))
			var s := _at(x, y)
			_spot(g, s.x, s.y, 90.0, 1.0 - u)
		"fallring":
			# (the boar's death: his slam's ring, harming nothing, rolling out over the floor)
			var FR: Dictionary = A("FALL")["ring"]
			var u := t / float(FR["long"])
			if u > 1.15:
				return
			var r := 0.6 + float(FR["reach"]) * (1.0 - pow(1.0 - minf(1.0, u), 2.0))
			var a := 1.0 - 0.6 * u if u < 1.0 else ((1.15 - u) / 0.15) * 0.4
			_line(g, _ring(x, y, maxf(0.1, r - 0.3)), "#2a0a18", 8.0, 0.35 * a)
			_line(g, _ring(x, y, r), PINK, 3.0, 0.85 * a)
			_line(g, _ring(x, y, r + 0.06), "#ffd0e0", 1.0, 0.85 * a)
		"scorch":
			# (where the boar lay: a scorch on the floor, its ash blown away; cracks out from where he struck, cooling)
			var dur: float = p["dur"]
			var fade := _c01((t - 0.25) / 0.4) * (1.0 - _c01((t - (dur - 2.0)) / 2.0))
			_pool(g, x, y, 1.5, [[0.0, "#141014"], [0.7, "rgba(20,16,20,0.6)"], [1.0, "rgba(20,16,20,0)"]], 0.55 * fade)
			var cool := _c01(t / 1.2)
			for k in 9:
				var ang := (k / 9.0) * TAU + 0.4 * sin(k * 3.1)
				var cx := float(p["b"])
				var cy := float(p["c"])
				var long := (0.7 + 0.6 * fmod(k * 0.618, 1.0)) * _c01(t / 0.12)
				var pts := PackedVector2Array([_at(cx, cy)])
				var d := 0.0
				while d < long:
					ang += 0.35 * sin(d * 15.0 + k)
					cx += cos(ang) * 0.08
					cy += sin(ang) * 0.08
					pts.append(_at(cx, cy))
					d += 0.08
				_line(g, pts, "#0e0b10", 1.5, 0.8 * (1.0 - _c01((t - (dur - 2.0)) / 2.0)))
				if cool < 1.0:
					_line(g, pts, PINK, 1.0, 0.6 * (1.0 - cool))
		"eruption":
			# (where the rune went in: the floor split, a fissure racing out along each way, molten in its depths, his pink at its
			# heart; each vent marked as it swells, then blown, its pool cooling)
			var E: Dictionary = A("ERUPT")
			var race := _sm((t - float(E["race"][0])) / (float(E["race"][1]) - float(E["race"][0])))
			var last := 0.0
			for v in spots:
				last = maxf(last, float(v["t"]))
			var cool := _c01((t - last - 0.6) / 1.6)
			var gone := _c01((t - (float(E["end"]) - 0.8)) / 0.8)
			var ox := x + fx * float(E["at"])
			var oy := y + fy * float(E["at"])
			var fans: Array = E["fans"]
			for fi in fans.size():
				var ang := deg_to_rad(float(fans[fi]))
				var ax := fx * cos(ang) + fy * sin(ang)
				var ay := fy * cos(ang) - fx * sin(ang)
				var L := race * float(E["long"])
				if L <= 0.0:
					continue
				var pts := PackedVector2Array()
				var d := 0.0
				while d <= L:
					var wob := (sin(d * T * 0.31 + fi * 2) * 3.0 + sin(d * T * 0.9 + fi) * 1.2) / T
					pts.append(_at(ox + ax * d + ay * wob, oy + ay * d - ax * wob))
					d += 0.1
				_line(g, pts, "#140808", 5.0, 0.75 * (1.0 - gone))
				_line(g, pts, "#c25a12" if cool < 0.6 else "#2a0e0a", 3.0, (0.95 - 0.5 * cool) * (1.0 - gone))
				_line(g, pts, "#ffb43a" if cool < 0.5 else "#4a1208", 1.6, (0.9 - 0.5 * cool) * (1.0 - gone))
				_line(g, pts, PINK, 0.8, 0.7 * (1.0 - cool) * (1.0 - gone))
			for v in spots:
				var vt := float(v["t"])
				var k := GW.warn_k(t, vt - 0.75, vt)
				if k >= 0.0:
					_round_warn(g, v["x"], v["y"], float(T2["eruption"]["reach"]), k)
					_pool(g, v["x"], v["y"], 0.45, [[0.0, "#ffb43a"], [0.5, "#c25a12"], [1.0, "rgba(74,18,8,0)"]], 0.3 + 0.6 * k)
				var u := t - vt
				if u >= 0.0:
					_pool(g, v["x"], v["y"], 0.75, [[0.0, "#fff0b0"], [0.35, "#ffb43a"], [0.7, "#8a2c0c"], [1.0, "rgba(28,8,6,0)"]], (1.0 - _c01((u - float(E["hold"])) / float(E["cool"]))) * 0.9)
		"hailstorm":
			# (the storm's shadow over the room; each stone's shadow on the floor where it will strike, marked; the bolts' marks)
			var H: Dictionary = A("HAIL")
			var cl := _sm((t - float(H["cloud"][0])) / (float(H["cloud"][1]) - float(H["cloud"][0]))) * (1.0 - _sm((t - float(H["gone"][0])) / (float(H["gone"][1]) - float(H["gone"][0]))))
			_tint_floor(g, "#141a34", 0.35 * cl)
			for s in spots:
				var st := float(s["t"])
				var bolt0 := int(s.get("r", 0)) == 2
				var k := GW.warn_k(t, st - float(H["boltWarn"]), st) if bolt0 else GW.warn_k(t, st - float(H["fall"]) - float(H["warn"]), st)
				if k >= 0.0:
					_round_warn(g, s["x"], s["y"], float(T2["hail"]["bolt"]["reach"]) if bolt0 else float(T2["hail"]["reach"]), k)
				var u := t - st
				if u >= 0.0 and u < 1.4:
					# (shattered: a frost of ice splinters left where it struck, melting)
					var a := 1.0 - u / 1.4
					var sk := float(s["k"])
					for i in (10 if bolt0 else 7):
						var ang := _h(sk, i, 21) * TAU
						var d := (0.9 if bolt0 else 0.5) * sqrt(_h(sk, i, 22))
						var q := _at(float(s["x"]) + cos(ang) * d, float(s["y"]) + sin(ang) * d)
						_dot(g, q.x, q.y, 1, "#bc84ff" if bolt0 else ("#e2eefa" if i % 2 == 1 else "#b4cce8"), 0.8 * a)
					if bolt0:
						_pool(g, s["x"], s["y"], 0.7, [[0.0, "#0a0a14"], [1.0, "rgba(10,10,20,0)"]], 0.6 * a)
		"thunder":
			# (storm clouds over the room; each strike's ring locking on where the hero stands, tightening as it charges; the crater
			# it leaves; its thunderclap rolling out)
			var TH: Dictionary = A("THUNDER")
			var cl := _sm((t - float(TH["clouds"][0])) / (float(TH["clouds"][1]) - float(TH["clouds"][0]))) * (1.0 - _sm((t - (float(TH["end"]) - 0.8)) / 0.8))
			_tint_floor(g, "#1c1038", 0.3 * cl)
			var reach := float(T2["thunder"]["reach"])
			for s in spots:
				var sx := float(s["x"])
				var sy := float(s["y"])
				var sk := float(s["k"])
				var bt := float(s["t"]) + float(s.get("r", 0.6))
				var k := GW.warn_k(t, float(s["t"]), bt)
				if k >= 0.0:
					_round_warn(g, sx, sy, reach, k)
					var rr := reach * (1.9 - 0.9 * k)
					_line(g, _ring(sx, sy, rr), "#bc84ff", 1.5, 0.4 + 0.5 * k)
					for i in 5:
						var fr := floorf(g.clock * 20.0)
						var a0 := _h(fr, i, sk) * TAU
						var q0 := _at(sx + cos(a0) * rr, sy + sin(a0) * rr)
						var q1 := _at(sx + cos(a0 + 0.4) * rr, sy + sin(a0 + 0.4) * rr)
						_bolt(g, q0.x, q0.y, q1.x, q1.y, fr + i, 0.6, ["#3a2070", "#bc84ff", "#f0e4ff"], 0.8, 0)
				var u := t - bt
				if u >= 0.0 and u < 2.4:
					var a := 1.0 - _c01((u - 1.4) / 1.0)
					_pool(g, sx, sy, 0.95, [[0.0, "#08060e"], [0.6, "rgba(12,8,20,0.8)"], [1.0, "rgba(12,8,20,0)"]], 0.75 * a)
					for i in 7:
						var ang := (i / 7.0) * TAU + sk
						_seg(g, _at(sx + cos(ang) * 0.3, sy + sin(ang) * 0.3), _at(sx + cos(ang + 0.15) * 1.3, sy + sin(ang + 0.15) * 1.3), "#bc84ff" if u < 0.6 else "#2a1a40", 1.0, 0.8 * a)
					var cu := u - float(TH["clapAfter"])
					if cu > 0.0 and cu < float(TH["clapLong"]):
						var v := cu / float(TH["clapLong"])
						var r := 0.3 + float(TH["clap"]) * (1.0 - pow(1.0 - v, 2.0))
						var ring := _ring(sx, sy, r)
						_line(g, ring, "#6c48c0", 5.0, 0.35 * (1.0 - v))
						_line(g, ring, "#f0e4ff", 1.5, 0.9 * (1.0 - v))
		"avalanche":
			# (red over the whole floor but its strip along the edge; the snow it leaves, thawing)
			var AV: Dictionary = A("AVAL")
			var side := float(lay.get("side", 1))
			var lx := -fy * side
			var ly := fx * side
			var cut := FL - float(T2["avalanche"]["safe"])
			var out := float(AV["rumble"][1])
			var k := GW.warn_k(t, float(AV["red"][0]), out)
			if k >= 0.0 and g.c != null:
				# (the floor's round, cut short by the strip's edge)
				var half := acos(cut / FL)
				var base := atan2(ly, lx)
				var pts: Array = []
				for i in 41:
					var ang := base + half + ((TAU - 2.0 * half) * i) / 40.0
					pts.append(Vector2(CX + cos(ang) * FL, CY + sin(ang) * FL))
				var inside := func(i: int):
					var ang := _h(i, 1, 31) * TAU
					var r := FL * sqrt(_h(i, 2, 32))
					var qx := cos(ang) * r
					var qy := sin(ang) * r
					return null if qx * lx + qy * ly >= cut else Vector2(CX + qx, CY + qy)
				var shown := GW._sm(k / 0.25)
				GW._shade(g.c, roundi(170.0 * 14.0), inside, k, shown)
				GW._edge(g.c, pts, k, g.clock, shown)
			var AA := WM.avalanche_at(t)
			if float(AA["front"]) > 0.0:
				# (the bed of snow it has laid, thawing after it is gone)
				var thaw := _c01((t - (out + float(AV["cross"]) + float(AV["stream"]) + float(AV["tail"]))) / 1.4)
				for i in 90:
					var along := _h(i, 1, 41) * float(AA["span"])
					if along > float(AA["front"]):
						continue
					var across := (_h(i, 2, 42) * 2.0 - 1.0) * FL
					if across >= cut:
						continue
					var qx := CX + fx * (along - FL) + lx * across
					var qy := CY + fy * (along - FL) + ly * across
					if Vector2(qx - CX, qy - CY).length() > FL:
						continue
					_pool(g, qx, qy, 0.7 + 0.5 * _h(i, 3, 43), [[0.0, "#e2f0f8"], [0.6, "rgba(165,198,215,0.7)"], [1.0, "rgba(106,138,162,0)"]], 0.55 * (1.0 - thaw))
		"contagion":
			# (the sickness spreading patch by patch out of each place a spark landed: marked as it comes, sickened a moment, then
			# burned out and dark: safe)
			var G: Dictionary = lay.get("grid", {})
			if G.is_empty() or g.c == null:
				return
			var CO: Dictionary = A("CONTAGION")
			var fade := 1.0 - _c01((t - (float(CO["end"]) - float(CO["fade"]))) / float(CO["fade"]))
			var n := int(G["n"])
			var size := float(G["size"])
			var gat: PackedFloat64Array = G["at"]
			var pts := PackedVector2Array()
			var cols := PackedColorArray()
			var idx := PackedInt32Array()
			var mark := float(CO["mark"])
			var sick := float(CO["sick"])
			for k in gat.size():
				var at := gat[k]
				if is_inf(at) or t < at - mark:
					continue
				var u := t - at
				var col: String
				var a: float
				if u < 0.0:
					col = str(R()["flame"][2])
					a = 0.12 + 0.3 * (1.0 + u / mark)
				elif u < sick:
					var f := u / sick
					col = "#c4ffb0" if f < 0.25 else ("#62ff5a" if f < 0.6 else "#22a02c")
					a = 0.75
				else:
					col = "#12140e"
					a = 0.45 * fade * (1.0 - _c01((u - sick) / 2.5))
					if a <= 0.01:
						continue
				var qx := float(G["x0"]) + (k % n) * size
				var qy := float(G["y0"]) + (k / n) * size
				var b := pts.size()
				var c := _a(col, a)
				for q in [_at(qx, qy), _at(qx + size, qy), _at(qx + size, qy + size), _at(qx, qy + size)]:
					pts.append(q * 2.0)
					cols.append(c)
				idx.append_array([b, b + 1, b + 2, b, b + 2, b + 3])
			if not idx.is_empty():
				RenderingServer.canvas_item_add_triangle_array(g.c.get_canvas_item(), idx, pts, cols)
		"scald":
			# (the ice racing out round him, heating, flashing to steam: its reach marked till it flashes; the beams' lines marked
			# before they fire)
			var SC: Dictionary = A("SCALD")
			var r := float(SC["r"])
			var fz := _c01((t - float(SC["freeze"][0])) / (float(SC["freeze"][1]) - float(SC["freeze"][0])))
			var ht := _c01((t - float(SC["heat"][0])) / (float(SC["heat"][1]) - float(SC["heat"][0])))
			var flash := float(SC["flash"])
			if t < flash and fz > 0.0:
				var ri := r * (1.0 - pow(1.0 - fz, 2.0))
				_pool(g, x, y, ri, [[0.0, "#ffb070" if ht > 0.5 else "#e2f0f8"], [0.75, "#c0206a" if ht > 0.5 else "#a5c6d7"], [1.0, "rgba(52,72,92,0)"]], 0.55 + 0.25 * ht)
			var k := GW.warn_k(t, float(SC["heat"][0]), flash)
			if k >= 0.0:
				_round_warn(g, x, y, float(T2["scald"]["outer"]), k)
			if t > flash and t < flash + float(SC["hang"]) + float(SC["thin"]):
				var a := 1.0 - _c01((t - flash - float(SC["hang"])) / float(SC["thin"]))
				_pool(g, x, y, r + 0.2, [[0.0, "rgba(242,220,204,0)"], [0.35, "rgba(242,220,204,0.35)"], [0.8, "#a08884"], [1.0, "rgba(90,68,70,0)"]], 0.5 * a)
			for kind in ["fire", "frost"]:
				var B := WM.scald_beam_at(t, kind)
				if B.is_empty():
					continue
				var ca := cos(float(B["ang"]))
				var sa := sin(float(B["ang"]))
				var bx := fx * ca + fy * sa
				var by := fy * ca - fx * sa
				var L := WS.to_edge(x, y, bx, by, 0.0)
				if float(B["on"]) <= 0.0:
					var kk := _c01((t - float(SC["tele"][0])) / (float(SC["beams"][0]) - float(SC["tele"][0])))
					var hb := float(T2["scald"]["beam"]["half"])
					_strip_warn(g, Vector2(x, y), Vector2(bx, by), 0.4, L, -hb, hb, kk)
				else:
					# (what it has swept: scorched black or rimed white behind it)
					_seg(g, _at(x + bx * 0.5, y + by * 0.5), _at(x + bx * L, y + by * L), "#2a0e0a" if kind == "fire" else "#a5c6d7", 6.0, 0.5)
		"blight":
			# (the rot creeping out from where the rune went in, along its fingers to the walls: the trees will burst up where it lies)
			var BL: Dictionary = A("BLIGHT")
			var fingers: Array = A("BLIGHT_FINGERS")
			var reach := _c01((t - float(BL["spread"][0])) / (float(BL["spread"][1]) - float(BL["spread"][0])))
			var far := 0.0
			for fg in fingers:
				var dd: Array = fg["d"]
				far = maxf(far, float(dd[dd.size() - 1]))
			var D2 := reach * far
			var dry := 1.0 - _c01((t - (float(BL["end"]) - float(BL["dry"]))) / float(BL["dry"]))
			var pre := t < float(BL["heave"])
			var BA: Array = A("BLIGHT_AT")
			# (its heart, where the rune went in)
			var ci := WS.own(x, y, fx, fy, float(BA[0]), float(BA[1]))
			_pool(g, ci.x, ci.y, float(BL["core"]) * _c01(t / 0.3), [[0.0, "#161c0a"], [0.7, "#2e3a12"], [1.0, "rgba(46,58,18,0)"]], 0.85 * dry)
			if g.c == null:
				return
			for pass_i in 3:
				for fg in fingers:
					var fd: Array = fg["d"]
					var fp: Array = fg["pts"]
					var fw: Array = fg["w"]
					if float(fd[0]) > D2:
						continue
					for i in range(1, fp.size()):
						if float(fd[i - 1]) > D2:
							break
						var u := _c01((D2 - float(fd[i - 1])) / maxf(1e-6, float(fd[i]) - float(fd[i - 1])))
						var a: Array = fp[i - 1]
						var b: Array = fp[i]
						var w0 := WS.own(x, y, fx, fy, float(a[0]), float(a[1]))
						var w1 := WS.own(x, y, fx, fy, float(a[0]) + (float(b[0]) - float(a[0])) * u, float(a[1]) + (float(b[1]) - float(a[1])) * u)
						var q0 := _at(w0.x, w0.y)
						var q1 := _at(w1.x, w1.y)
						var w := float(fw[i]) * 0.42 * 2.0
						if pass_i == 0:
							_seg(g, q0, q1, str(R()["flame"][2]) if pre else "#3a1a2a", w + 3.0, 0.35 if pre else 0.2 * dry)
						elif pass_i == 1:
							_seg(g, q0, q1, "#1e260c", w, 0.9 * dry)
						else:
							_seg(g, q0, q1, "#52661e" if i % 2 == 1 else "#7e9a3a", maxf(1.0, w * 0.25), 0.7 * dry)
		"fumes":
			# (each vent cracked in the floor, venting its cloud: the poison lies over the floor in a round, its edge marked; as its
			# spark comes for it, marked again, hot; gone up, its smoke)
			var FU: Dictionary = A("FUMES")
			for cl in spots:
				var u := t - float(cl["t"])
				if u < -0.4:
					continue
				var sp := _c01(u / float(FU["spread"]))
				var R0 := float(cl.get("r", 1.5))
				var Rr := R0 * (sp * sp * (3.0 - 2.0 * sp))
				var boom := float(cl.get("done", 99.0))
				if t < boom:
					_pool(g, cl["x"], cl["y"], 0.35, [[0.0, "#e0d07a"], [1.0, "rgba(118,104,28,0)"]], 0.6)
					if Rr > 0.05:
						_pool(g, cl["x"], cl["y"], Rr, [[0.0, "rgba(196,214,70,0.8)"], [0.6, "rgba(150,150,40,0.65)"], [0.9, "rgba(98,86,24,0.4)"], [1.0, "rgba(62,54,16,0)"]], 0.95)
						_line(g, _ring(cl["x"], cl["y"], Rr * 0.92), "#b4a02c", 1.0, 0.45)
					var k := GW.warn_k(t, boom - 0.9, boom)
					if k >= 0.0:
						_round_warn(g, cl["x"], cl["y"], Rr, k)
				else:
					var v := (t - boom) / float(FU["smoke"])
					if v < 1.0:
						_pool(g, cl["x"], cl["y"], R0 * 0.9, [[0.0, "#1c1806"], [1.0, "rgba(28,24,6,0)"]], 0.7 * (1.0 - v))
		"wildfire":
			# (each spot marked as it comes, then burning; marked all at once before it detonates; scorched after)
			var WF: Dictionary = A("WILDFIRE")
			var boom := WM.wild_boom()
			for s in spots:
				var st := float(s["t"])
				var k := GW.warn_k(t, st - float(WF["warn"]), st)
				if k >= 0.0:
					_round_warn(g, s["x"], s["y"], float(T2["wildfire"]["reach"]), k)
				var kb := GW.warn_k(t, float(WF["link"]), boom)
				if kb >= 0.0 and t >= st:
					_round_warn(g, s["x"], s["y"], float(T2["wildfire"]["boom"]["reach"]), kb)
				if t >= st:
					var u := t - boom
					var a := 1.0 if u < 0.0 else 1.0 - _c01(u / float(WF["die"]))
					_pool(g, s["x"], s["y"], 0.6 if u < 0.0 else 1.0, [[0.0, "#fff4c0" if u < 0.0 else "#3a1004"], [0.4, "#ffb81c" if u < 0.0 else "#1a0804"], [1.0, "rgba(58,16,4,0)"]], 0.7 * a)
		"frostbite":
			# (the eye round him marked before the gale; the gale's rime over the floor, outside it, melting at the last; the eye's
			# edge hot gold)
			var FB: Dictionary = A("FROSTBITE")
			var E := float(T2["frostbite"]["eye"])
			var on := _sm((t - float(FB["gale"][0])) / 0.4)
			var off := _c01((t - float(FB["gale"][1])) / float(FB["melt"]))
			if t < float(FB["gale"][0]) + 0.3:
				_line(g, _ring(x, y, E), "#ffc040", 1.5, 0.4 + 0.5 * absf(sin(g.clock * 12.0)))
			_tint_floor(g, "#142a50", 0.3 * on * (1.0 - off))
			if g.c == null:
				return
			# (rime: frost dots laid thick over the floor outside the eye, growing as the gale blows)
			var grow := _c01((t - float(FB["gale"][0])) / float(FB["rime"]))
			var n := roundi(900.0 * grow)
			for i in n:
				var ang := _h(i, 1, 51) * TAU
				var r := E + (FL + 1.0) * sqrt(_h(i, 2, 52))
				var qx := x + cos(ang) * r
				var qy := y + sin(ang) * r
				if Vector2(qx - CX, qy - CY).length() > FL:
					continue
				var s := _at(qx, qy)
				var glint := (i * 7 + floori(g.clock * 4.0)) % 29 == 0
				_rect(g, _rd(s.x), _rd(s.y), 2, 1, "#e4f4ff" if glint else (PINK if i % 5 == 0 else ("#8cc0ec" if i & 1 else "#3a78b8")), (1.0 - off) * (0.9 if glint else 0.35))
			if on > 0.0 and off < 1.0:
				# (the eye: bare floor, calm, its edge hot gold, the gale's wall swirling at it)
				_pool(g, x, y, E, [[0.0, "rgba(10,20,40,0)"], [0.85, "rgba(10,20,40,0)"], [1.0, "rgba(255,192,64,0.25)"]], on * (1.0 - off))
				_line(g, _ring(x, y, E), "#ffc040", 2.0, 0.85 * on * (1.0 - off))


# --- AMONG THE FIGURES ---

static func standing(P, p: Dictionary) -> void:
	if P.stands == null:
		return
	if not p.has("fx_pool"):
		p["fx_pool"] = []
	var n := 0
	var name := str(p["a1"]).substr(7)
	var t: float = p["t"]
	var x: float = p["x"]
	var y: float = p["y"]
	var s := _at(x, y)
	var TU: Dictionary = D()["tune"]
	var FPS := _fps()
	if name == "show":
		var m = p.get("src")
		if _live(m):
			var id := _act_id(m)
			var at := float(m.h2.act["t"])
			if id == "power" and at >= float(A("POWER")["cast"]):
				# (the hammer over his shadow, crushed straight down at each blow)
				var hm: Vector2 = m.h2.hammer_at(m)
				var q := _at(hm.x, hm.y)
				n = _stand(P, p, n, hm.x + hm.y + 0.6, "hammer", floori((at - float(A("POWER")["cast"])) * FPS), q.x, q.y)
			elif id == "poison" and at > float(A("SPORE")["burst"]) and at < float(A("SPORE")["land"][1]):
				# (the spores flung out of the burst over him, each sinking where it lands)
				var a1: Dictionary = m.h2.a1
				var cx := float(a1.get("cx", m.world.x))
				var cy := float(a1.get("cy", m.world.y))
				var q := _at(cx, cy)
				n = _stand(P, p, n, cx + cy + 0.5, "flight", floori((at - float(A("SPORE")["burst"])) * FPS), q.x, q.y)
	elif _meld_id(p) != "":
		var spots: Array = p.get("lay", {}).get("spots", [])
		match name:
			"eruption":
				# (each vent blowing: a blast of molten fire out of the floor, settling to a burning pool)
				var E: Dictionary = A("ERUPT")
				for v in spots:
					var u := t - float(v["t"])
					if u < 0.0 or u > float(E["hold"]) + float(E["cool"]):
						continue
					var q := _at(v["x"], v["y"])
					n = _stand(P, p, n, float(v["x"]) + float(v["y"]), "meteor%d" % (int(v["k"]) % 4), _meteor_frame(maxf(0.0, u)), q.x, q.y, 1.0 - _c01((u - float(E["hold"]) - 0.6) / (float(E["cool"]) - 0.6)))
			"blight":
				# (the trees punching up through the rot, standing as walls, crumbling)
				var life := float(_fig("TREE_LIFE"))
				for tr in spots:
					var u := t - float(tr["t"])
					if u < 0.0 or u > life:
						continue
					var q := _at(tr["x"], tr["y"])
					n = _stand(P, p, n, float(tr["x"]) + float(tr["y"]), "tree%d" % _tree_variant(int(tr["k"])), floori(u * FPS), q.x, q.y)
			"fumes":
				# (each cloud going up as its spark reaches it)
				for cl in spots:
					var u := t - float(cl.get("done", 99.0))
					if u < 0.0 or u > 0.6:
						continue
					var q := _at(cl["x"], cl["y"])
					n = _stand(P, p, n, float(cl["x"]) + float(cl["y"]), "meteor%d" % (int(cl["k"]) % 4), _meteor_frame(u), q.x, q.y)
			"wildfire":
				# (each spot burning, then all of it going up at once)
				var boom := WM.wild_boom()
				for s0 in spots:
					var u := t - float(s0["t"])
					if u < 0.0:
						continue
					var ub := t - boom
					if ub > 0.6:
						continue
					var q := _at(s0["x"], s0["y"])
					n = _stand(P, p, n, float(s0["x"]) + float(s0["y"]), "meteor%d" % (int(s0["k"]) % 4), _meteor_frame(ub) if ub >= 0.0 else _meteor_frame(0.6 + u), q.x, q.y)
	else:
		match name:
			"meteor":
				var FI: Dictionary = A("FIRE")
				if t >= -float(FI["fall"]):
					var fade := 1.0 - _c01((t - (float(p["dur"]) - 0.8)) / 0.8)
					n = _stand(P, p, n, x + y, "meteor%d" % (int(p["a"]) % 4), _meteor_frame(t), s.x, s.y, fade)
			"ice":
				# (each cluster of spikes bursting up where it is along its line, the way he aimed it, each in depth where it stands)
				for st in D()["ice"]["steps"]:
					var i := _ice_frame(t - float(st["t"]))
					if i < 0:
						continue
					var w := WS.art_at(x, y, p["fx"], p["fy"], st["a"], st["b"])
					var q := _at(w.x, w.y)
					n = _stand(P, p, n, w.x + w.y, "ice%d%d" % [int(st["v"]), int(st["big"])], i, q.x, q.y)
			"orb":
				if t <= float(TU["bolt"]["life"]):
					var sw := WS.orb_swell(t)
					n = _stand(P, p, n, x + y + 0.4, "orb%d" % (0 if sw <= 0.0 else (1 if sw < 0.6 else 2)), floori(t * FPS) % int(_fig("ORB_N")), s.x, s.y)
			"trap":
				var sp := float(p["a"])
				if sp != 0.0:
					var u := t - sp - float(TU["spore"]["swell"])
					if u >= 0.0:
						n = _stand(P, p, n, x + y + 0.3, "cloud", floori(u * FPS), s.x, s.y)
	var pool: Array = p["fx_pool"]
	for i in range(n, pool.size()):
		if is_instance_valid(pool[i]):
			pool[i].visible = false


# --- OVER ALL ---

static func air(P, c: CanvasItem, p: Dictionary) -> void:
	var g := Cv.new()
	g.c = c
	g.clock = P._clock
	_air(P, g, p)


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


## This frame's lights (called each frame as the marks' lights are: perils.gd _spots_of).
static func spots(P, p: Dictionary) -> void:
	if P.look == null:
		return
	var g := Cv.new()
	g.look = P.look
	g.clock = P._clock
	if str(p["a1"]) == "wsboss:deathring":
		_ground(P, g, p)
	_air(P, g, p)


static func _air(P, g: Cv, p: Dictionary) -> void:
	var name := str(p["a1"]).substr(7)
	if name == "show":
		var m = p.get("src")
		if _live(m):
			_runes(P, g, m)
		return
	if _meld_id(p) != "":
		_meld_air(g, p, name)
		return
	if name != "orb":
		return
	var t: float = p["t"]
	var B: Dictionary = D()["tune"]["bolt"]
	var o := _at(p["x"], p["y"])
	var oy := o.y - float(_fig("ORB_HIGH")) / 2.0
	# (a zap: jagged, white-hot, from the orb down to where it struck, a few frames)
	if t - float(p["d"]) < 0.18 and t < float(B["life"]):
		var to := _at(p["b"], p["c"])
		var pts := PackedVector2Array([Vector2(o.x, oy)])
		for i in range(1, 8):
			var u := i / 7.0
			var j := sin(t * 97.0 + i * 13.0) * 7.0 if i < 7 else 0.0
			pts.append(Vector2(o.x + (to.x - o.x) * u + j, oy + (to.y - oy) * u + j * 0.4))
		_line(g, pts, "#fffbe0", 2.0, 1.0)
		_line(g, pts, "#ff4f8a", 1.0, 1.0)
	# (its burst: a flash of light and bolts out all round)
	var u := t - float(B["life"])
	if u >= 0.0 and u < 0.35:
		var k := 1.0 - u / 0.35
		var reach := float(B["burst"]["reach"])
		for i in 9:
			var ang := (i / 9.0) * TAU + float(p["x"])
			var e := _at(float(p["x"]) + cos(ang) * reach * (0.4 + 0.6 * (1.0 - k)), float(p["y"]) + sin(ang) * reach * (0.4 + 0.6 * (1.0 - k)))
			var mid := Vector2((o.x + e.x) / 2.0 + sin(i * 7.0 + t * 50.0) * 6.0, (oy + e.y) / 2.0)
			_line(g, PackedVector2Array([Vector2(o.x, oy), mid, e]), "#fff060", 2.0, k)


## THE MELDS OVER ALL (wsboss2.ts meldAir).
static func _meld_air(g: Cv, p: Dictionary, id: String) -> void:
	var t: float = p["t"]
	var x: float = p["x"]
	var y: float = p["y"]
	var fx: float = p["fx"]
	var fy: float = p["fy"]
	var lay: Dictionary = p.get("lay", {})
	var spots: Array = lay.get("spots", [])
	var T2: Dictionary = D()["tune2"]
	var PL := WS.place()
	var CX := float(PL["cx"])
	var CY := float(PL["cy"])
	var FL := float(PL["floor"])
	match id:
		"eruption":
			# (each vent's column of fire at its blowing, its rocks thrown up and falling back)
			var E: Dictionary = A("ERUPT")
			var burst := float(E["burst"])
			var hold := float(E["hold"])
			for v in spots:
				var u := t - float(v["t"])
				if u < 0.0 or u > 1.0:
					continue
				var s := _at(v["x"], v["y"])
				var vk := float(v["k"])
				if u < burst + hold:
					var k := 1.0 - u / (burst + hold)
					var H := 70.0 * minf(1.0, u / burst + 0.3)
					var wob := sin(g.clock * 40.0 + vk) * 1.5
					var rows: Array = []
					for i in 13:
						var q := i / 12.0
						var lx := _quad(s.x - 6.0, s.x - 9.0 + wob, s.x - 2.0 + wob, q)
						var rx := _quad(s.x + 6.0, s.x + 9.0 + wob, s.x + 2.0 + wob, q)
						rows.append([lx, rx, s.y - H * q])
					_vfill(g, rows, s.y, H, [[0.0, "#fff0b0"], [0.3, "#ffb43a"], [0.7, "#c25a12"], [1.0, "rgba(255,79,138,0)"]], 0.6 + 0.4 * k)
					_spot(g, s.x, s.y - H * 0.3, 40.0, 0.8 * k)
				for i in int(E["rocks"]):
					var ang := _h(vk, i, 61) * TAU
					var sp := 18.0 + 22.0 * _h(vk, i, 62)
					var vz := 90.0 + 60.0 * _h(vk, i, 63)
					var z := vz * u - 0.5 * 360.0 * u * u
					if z < 0.0 and u > 0.1:
						continue
					_dot(g, s.x + cos(ang) * sp * u, s.y + sin(ang) * sp * u * 0.5 - maxf(0.0, z) * 0.5, 1.4, "#ffb43a" if i % 2 == 1 else "#4a1208", 0.9)
		"hailstorm":
			var H: Dictionary = A("HAIL")
			for s in spots:
				var u := t - float(s["t"])
				var q := _at(s["x"], s["y"])
				var sk := float(s["k"])
				if int(s.get("r", 0)) == 2:
					# (a bolt out of the storm, a few frames)
					if u >= 0.0 and u < 0.18:
						_bolt(g, q.x + 6.0 * (_h(sk, 1, 3) - 0.5), q.y - 230.0, q.x, q.y, sk * 13.0 + 5.0, 1.6, ["#6878b8", "#cad6ff", "#ffffff"], 1.0 - u / 0.18, 2)
						_spot(g, q.x, q.y, 60.0, 1.0 - u / 0.18)
					continue
				if g.c == null:
					continue
				# (a stone falling onto its shadow, a streak above it; shattering)
				var fall := float(H["fall"])
				if u >= -fall and u < 0.0:
					var h := (-u / fall) * (float(H["high"]) / 2.0)
					var r := 2.0 + (int(sk) % 3) * 0.7
					_seg(g, Vector2(q.x, q.y - h - 12.0), Vector2(q.x, q.y - h), "#cad6ff", 1.0, 0.35)
					_poly(g, PackedVector2Array([Vector2(q.x, q.y - h - r - 1.0), Vector2(q.x + r + 1.0, q.y - h), Vector2(q.x, q.y - h + r + 1.0), Vector2(q.x - r - 1.0, q.y - h)]), "#4a6a9a", 1.0)
					_poly(g, PackedVector2Array([Vector2(q.x, q.y - h - r), Vector2(q.x + r, q.y - h), Vector2(q.x, q.y - h + r * 0.5), Vector2(q.x - r * 0.7, q.y - h)]), "#e2eefa", 1.0)
				elif u >= 0.0 and u < 0.25:
					var k := u / 0.25
					for i in 6:
						var ang := (i / 6.0) * TAU + sk
						var d := 3.0 + 9.0 * k
						_dot(g, q.x + cos(ang) * d, q.y + sin(ang) * d * 0.5 - 6.0 * sin(PI * k), 1, "#ffffff" if i % 2 == 1 else "#b4cce8", 1.0 - k)
		"thunder":
			# (ONE GREAT BOLT, a pillar of violet-white lightning, hammering down on each ring)
			var TH: Dictionary = A("THUNDER")
			for s in spots:
				var u := t - (float(s["t"]) + float(s.get("r", 0.6)))
				if u < 0.0 or u > float(TH["bolt"]):
					continue
				var k := 1.0 - u / float(TH["bolt"])
				var q := _at(s["x"], s["y"])
				var sk := float(s["k"])
				_bolt(g, q.x + 10.0 * (_h(sk, 2, 5) - 0.5), q.y - 260.0, q.x, q.y, sk * 17.0 + floorf(u * 30.0), 3.2, ["#6c48c0", "#bc84ff", "#ffffff"], k, 3)
				_haze(g, q.x, q.y, 22.0, "#f0e4ff", 0.8 * k)
				_spot(g, q.x, q.y, 80.0, k)
		"avalanche":
			# (THE TORRENT: snow tearing across the room from the far side behind him, its front billowing, its boulders tumbling)
			if g.c == null:
				return
			var AV: Dictionary = A("AVAL")
			var AA := WM.avalanche_at(t)
			var front := float(AA["front"])
			var tail := float(AA["tail"])
			var span := float(AA["span"])
			if front <= 0.0 or tail >= span:
				return
			var side := float(lay.get("side", 1))
			var lx := -fy * side
			var ly := fx * side
			var cut := FL - float(T2["avalanche"]["safe"])
			var at := func(along: float, across: float) -> Vector2: return _at(CX + fx * (along - FL) + lx * across, CY + fy * (along - FL) + ly * across)
			var in_floor := func(along: float, across: float) -> bool: return Vector2(along - FL, across).length() <= FL + 0.3
			# (its body: powder, thick and churning, thrown up higher toward its front)
			for i in 150:
				var across := -FL + (cut + FL) * _h(i, 1, 71)
				var along := tail + (front - tail) * fmod(_h(i, 2, 72) + t * 1.7, 1.0)
				if not in_floor.call(along, across):
					continue
				var near := 1.0 - _c01((front - along) / 2.2)
				var q: Vector2 = at.call(along, across)
				var r := 8.0 + 8.0 * _h(i, 3, 73) + 8.0 * near
				_haze(g, q.x, q.y - 4.0 - 12.0 * near * _h(i, 4, 74), r, "#a5c6d7" if i % 3 == 0 else "#f2f8fc", 0.5 + 0.35 * near)
			# (clods of packed snow tumbling in it, each lit on top, in shadow under)
			for i in 110:
				var across := -FL + (cut + FL) * _h(i, 11, 81)
				var along := tail + (front - tail) * fmod(_h(i, 12, 82) + t * 1.9, 1.0)
				if not in_floor.call(along, across):
					continue
				var q: Vector2 = at.call(along, across)
				var r := 1.5 + 2.0 * _h(i, 13, 83)
				var lift := 3.0 + 8.0 * absf(sin(t * 7.0 + i))
				_rect(g, _rd(q.x - r), _rd(q.y - lift - r + 1.0), _rd(2.0 * r), _rd(2.0 * r), "#6a8aa2", 1.0)
				_rect(g, _rd(q.x - r), _rd(q.y - lift - r), _rd(2.0 * r), _rd(r + 0.5), "#e2f0f8" if i % 2 == 1 else "#ffffff", 1.0)
			for i in int(AV["boulders"]):
				var across := -FL + (cut + FL) * _h(i, 5, 75)
				var along := tail + (front - tail) * fmod(_h(i, 6, 76) + t * 1.3, 1.0)
				if not in_floor.call(along, across):
					continue
				var q: Vector2 = at.call(along, across)
				var r := 3.0 + 3.0 * _h(i, 7, 77)
				var sp := t * 9.0 + i
				var pts := PackedVector2Array()
				for k in 6:
					var ang := sp + (k / 6.0) * TAU
					var rr := r * (0.75 + 0.35 * _h(i, k, 78))
					pts.append(Vector2(q.x + cos(ang) * rr, q.y - 6.0 + sin(ang) * rr))
				_poly(g, pts, "#34485c", 1.0)
				_rect(g, _rd(q.x - 1.0), _rd(q.y - 7.0 - r * 0.4), 2, 1, "#6a8aa2", 1.0)
			# (the front: a wall of powder thrown up, bright)
			if front < span:
				for i in 40:
					var across := -FL + (cut + FL) * (i / 39.0)
					var along := front - 0.2 * _h(i, 8, 79)
					if not in_floor.call(along, across):
						continue
					var q: Vector2 = at.call(along, across)
					_haze(g, q.x, q.y - 10.0, 12.0 + 6.0 * _h(i, 9, 80), "#ffffff", 0.55)
		"contagion":
			# (the sparks the rune splits into, leaping out to where the sickness starts; each patch's arc as it is passed on)
			var G: Dictionary = lay.get("grid", {})
			if G.is_empty() or g.c == null:
				return
			var hq := _at(x, y)
			for s in spots:
				var u := t - (float(s["t"]) - 0.25)
				if u < 0.0 or u > 0.35:
					continue
				var tq := _at(s["x"], s["y"])
				var k := minf(1.0, u / 0.25)
				_bolt(g, hq.x, hq.y - 20.0, hq.x + (tq.x - hq.x) * k, hq.y - 20.0 + (tq.y - hq.y + 20.0) * k, float(s["k"]) * 7.0 + floorf(u * 30.0), 1.2, ["#105a1a", "#62ff5a", "#f4fff0"], 1.0, 1)
			var n := int(G["n"])
			var size := float(G["size"])
			var gat: PackedFloat64Array = G["at"]
			var gfrom: PackedInt32Array = G["from"]
			for k in gat.size():
				var u := t - gat[k]
				if u < 0.0 or u > 0.12 or gfrom[k] < 0:
					continue
				if (k * 7) % 3 != 0:
					continue
				var f := gfrom[k]
				var aq := _at(float(G["x0"]) + ((f % n) + 0.5) * size, float(G["y0"]) + ((f / n) + 0.5) * size)
				var bq := _at(float(G["x0"]) + ((k % n) + 0.5) * size, float(G["y0"]) + ((k / n) + 0.5) * size)
				_bolt(g, aq.x, aq.y - 3.0, bq.x, bq.y - 3.0, k, 0.7, ["#105a1a", "#62ff5a", "#f4fff0"], 1.0 - u / 0.12, 0)
		"scald":
			# (the steam boiling up round him once it flashes; the two beams, fire and cold, from him to the wall, sweeping round)
			var SC: Dictionary = A("SCALD")
			var flash := float(SC["flash"])
			if t > flash and t < flash + float(SC["hang"]) + float(SC["thin"]) and g.c != null:
				var a := (1.0 - _c01((t - flash - float(SC["hang"])) / float(SC["thin"]))) * _c01((t - flash) / 0.2)
				var inner := float(T2["scald"]["inner"])
				for i in 40:
					var ang := _h(i, 1, 81) * TAU + t * 0.4
					var r := inner + (float(SC["r"]) - inner) * _h(i, 2, 82)
					var up := fmod(t * 0.6 + _h(i, 3, 83), 1.0)
					var q := _at(x + cos(ang) * r, y + sin(ang) * r)
					_haze(g, q.x, q.y - 6.0 - up * 34.0, 10.0 + 10.0 * up, "#f2dccc" if i % 4 == 0 else "#fff4ec", 0.7 * a * (1.0 - up))
				if t - flash < 0.35:
					var b := (t - flash) / 0.35
					var q := _at(x, y)
					_haze(g, q.x, q.y - 10.0, 30.0 + 40.0 * b, "#ffffff", 0.7 * (1.0 - b))
			for kind in ["fire", "frost"]:
				var B := WM.scald_beam_at(t, kind)
				if B.is_empty() or float(B["on"]) <= 0.0:
					continue
				var ca := cos(float(B["ang"]))
				var sa := sin(float(B["ang"]))
				var bx := fx * ca + fy * sa
				var by := fy * ca - fx * sa
				var L := WS.to_edge(x, y, bx, by, 0.0)
				var q0 := _at(x + bx * 0.4, y + by * 0.4)
				var q1 := _at(x + bx * L, y + by * L)
				var z0 := 22.0
				var flick := 0.85 + 0.15 * sin(g.clock * 50.0 + (0.0 if kind == "fire" else 2.0))
				var cols := ["#e06a10", "#ffb43a", "#fff0b0"] if kind == "fire" else ["#3a78b8", "#a5c6d7", "#ffffff"]
				var on := float(B["on"])
				var pts := PackedVector2Array([Vector2(q0.x, q0.y - z0), Vector2(q1.x, q1.y - 4.0)])
				_line(g, pts, cols[0], 12.0 * on, 0.35 * flick)
				_line(g, pts, cols[1], 6.0 * on, 0.85 * flick)
				_line(g, pts, cols[2], 2.5 * on, 1.0 * flick)
				_haze(g, q1.x, q1.y - 4.0, 14.0, cols[1], 0.7)
				var fr := floorf(g.clock * 20.0)
				for i in 8:
					var u := fmod(i / 8.0 + g.clock * 2.0, 1.0)
					_dot(g, q0.x + (q1.x - q0.x) * u + (_h(i, fr, 84) - 0.5) * 6.0, q0.y - z0 + (q1.y - 4.0 - q0.y + z0) * u + (_h(i, fr, 85) - 0.5) * 6.0, 1, "#fff0b0" if kind == "fire" else "#ffffff", 0.9)
				_spot(g, (q0.x + q1.x) / 2.0, (q0.y + q1.y) / 2.0, 60.0, 0.6)
		"fumes":
			# (the clouds billowing over the floor; the sparks he flings into them in the order they came; each going up)
			var FU: Dictionary = A("FUMES")
			var hq := _at(x, y)
			for cl in spots:
				var u := t - float(cl["t"])
				var boom := float(cl.get("done", 99.0))
				var ck := float(cl["k"])
				var cq := _at(cl["x"], cl["y"])
				if u > 0.0 and t < boom and g.c != null:
					var sp := _c01(u / float(FU["spread"]))
					var Rr := float(cl.get("r", 1.5)) * sp
					for i in 9:
						var ang := _h(ck, i, 91) * TAU + t * 0.3
						var r := Rr * 0.7 * sqrt(_h(ck, i, 92))
						var q := _at(float(cl["x"]) + cos(ang) * r, float(cl["y"]) + sin(ang) * r)
						var up := fmod(t * 0.4 + _h(ck, i, 93), 1.0)
						_haze(g, q.x, q.y - 6.0 - up * 16.0, 12.0 + 10.0 * sp, "#e0d07a" if i % 3 == 0 else ("#b8cc4a" if i % 3 == 1 else "#8a7e22"), 0.55 * sp * (1.0 - up * 0.6))
				var fl := t - (boom - float(FU["fly"]))
				if fl >= 0.0 and fl < float(FU["fly"]):
					var k := fl / float(FU["fly"])
					var qx := hq.x + (cq.x - hq.x) * k
					var qy := hq.y - 30.0 + (cq.y - hq.y + 30.0) * k - 25.0 * sin(PI * k)
					_dot(g, qx, qy, 2, "#fff0b0", 1)
					_haze(g, qx, qy, 8.0, "#ffb43a", 0.8)
					for j in range(1, 5):
						_dot(g, qx - (cq.x - hq.x) * 0.03 * j, qy + 2.0 * j, 1, "#ffb43a", 0.6 / j)
					_spot(g, qx, qy, 20.0, 0.6)
				var ub := t - boom
				if ub >= 0.0 and ub < 0.4:
					_haze(g, cq.x, cq.y - 12.0, 20.0 + 40.0 * (ub / 0.4), "#ffb43a", 0.8 * (1.0 - ub / 0.4))
					_spot(g, cq.x, cq.y, 70.0, 1.0 - ub / 0.4)
		"wildfire":
			# (each spot's pillar of fire with lightning in it; the web of arcs between the burning; all of it going up at once)
			var ub := t - WM.wild_boom()
			for s in spots:
				if t < float(s["t"]) or ub > 0.4:
					continue
				var q := _at(s["x"], s["y"])
				var u := t - float(s["t"])
				var sk := float(s["k"])
				var H := (90.0 if ub >= 0.0 else 40.0 + 8.0 * sin(g.clock * 9.0 + sk)) * minf(1.0, u / 0.15 + 0.2)
				var rx := 5.0 + (6.0 if ub >= 0.0 else 0.0)
				var rows: Array = []
				for i in 13:
					var yy := q.y - H * i / 12.0
					var dy := (yy - (q.y - H / 2.0)) / (H / 2.0)
					var hw := rx * sqrt(maxf(0.0, 1.0 - dy * dy))
					rows.append([q.x - hw, q.x + hw, yy])
				_vfill(g, rows, q.y, H, [[0.0, "#fff4c0"], [0.35, "#ffb81c"], [0.75, "#e06a10"], [1.0, "rgba(138,42,6,0)"]], 1.0 - ub / 0.4 if ub >= 0.0 else 0.85)
				if (floori(g.clock * 12.0) + int(sk)) % 3 == 0:
					_bolt(g, q.x, q.y - H * 0.8, q.x + 3.0, q.y - 4.0, sk * 3.0 + floorf(g.clock * 12.0), 0.6, ["#8a2a06", "#ffb81c", "#ffffff"], 0.9, 0)
				_spot(g, q.x, q.y - 10.0, 30.0, 0.6)
			if ub < 0.0:
				for l in lay.get("links", []):
					var A0: Dictionary = spots[int(l[0])]
					var B0: Dictionary = spots[int(l[1])]
					if t < maxf(float(A0["t"]), float(B0["t"])):
						continue
					var aq := _at(A0["x"], A0["y"])
					var bq := _at(B0["x"], B0["y"])
					_bolt(g, aq.x, aq.y - 14.0, bq.x, bq.y - 14.0, int(l[0]) * 31 + int(l[1]) + floorf(g.clock * 15.0), 0.9, ["#8a2a06", "#ffb81c", "#fff4c0"], 0.85, 1)
			if ub >= 0.0 and ub < 0.5:
				var q := _at(x, y)
				_haze(g, q.x, q.y, 200.0, "#fff4c0", 0.35 * (1.0 - ub / 0.5))
		"frostbite":
			# (THE GALE: a freezing venom wind streaming out from him to the walls, frost and his pink venom in it)
			if g.c == null:
				return
			var FB: Dictionary = A("FROSTBITE")
			var on := _sm((t - float(FB["gale"][0])) / 0.4) * (1.0 - _sm((t - float(FB["gale"][1])) / 0.4))
			if on <= 0.0:
				return
			var E := float(T2["frostbite"]["eye"])
			for i in 150:
				var ang := _h(i, 1, 101) * TAU + sin(t * 2.0 + i) * 0.05
				var v := fmod(_h(i, 2, 102) + t * (0.9 + 0.5 * _h(i, 3, 103)), 1.0)
				var r := E + (FL + 1.0 - E) * v
				var qx := x + cos(ang) * r
				var qy := y + sin(ang) * r
				if Vector2(qx - CX, qy - CY).length() > FL + 0.5:
					continue
				var s := _at(qx, qy)
				var e := _at(qx + cos(ang) * 0.6, qy + sin(ang) * 0.6)
				var z := 6.0 + 16.0 * _h(i, 4, 104)
				_seg(g, Vector2(s.x, s.y - z), Vector2(e.x, e.y - z), PINK if i % 7 == 0 else ("#e4f4ff" if i % 3 == 0 else "#8cc0ec"), 2.0 if i % 7 == 0 else 1.0, on * (0.35 + 0.4 * (1.0 - v)))
			# (the gale's wall swirling at the eye's edge)
			for i in 24:
				var ang := (i / 24.0) * TAU + t * 3.0
				var q := _at(x + cos(ang) * E, y + sin(ang) * E)
				_haze(g, q.x, q.y - 10.0, 7.0, "#e4f4ff", 0.3 * on)


## A point of a quadratic curve from a through b to c (one coordinate), `q` along it.
static func _quad(a: float, b: float, c: float, q: float) -> float:
	return (1.0 - q) * (1.0 - q) * a + 2.0 * (1.0 - q) * q * b + q * q * c
