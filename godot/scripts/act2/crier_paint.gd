## THE CRIER'S PAINTERS, as the art paints his moves on the floor (art/crier_action_fx.ts paintDecree, paintCall), line for line, a
## frame at a time as the game paints them (render/act1_fx/crier.ts floorPicture: the decree's lane marked at 15 a second, his call's
## pools and rings at 8): his decree runs down a lane any way, and his call's pools are where his square has them, so they are
## painted here and not ahead; and what the game draws with the canvas's own lines (drawShout, drawDecreeBurning), drawn so here.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const Canvas := preload("res://scripts/act2/canvas.gd")
const CR := preload("res://scripts/act2/crier.gd")
const A1 := preload("res://scripts/act1/act1.gd")

## (art/mkit.ts FLAME; art/crier.ts HUSH; crier_action_fx.ts PALE, PAPER, the Hush's pale and the paper; render/act1_fx/crier.ts
## HUSHC, PINKS, LETTERS)
const FLAME: Array[Color] = [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const HUSH: Array[Color] = [Color("#14121e"), Color("#262234"), Color("#3e3852"), Color("#625a7a"), Color("#9890b4")]
const PALE := Color("#c8c2dc")
const PAPER: Array[Color] = [Color("#3e382e"), Color("#7a6e5c"), Color("#ab9f84"), Color("#c4b898"), Color("#d6cbad")]
const HUSHC: Array[Color] = [Color("#14121e"), Color("#262234"), Color("#3e3852"), Color("#625a7a"), Color("#9890b4"), Color("#d8d0f0")]
const PINKS: Array[Color] = [Color("#e0287a"), Color("#ff7aa8"), Color("#7a1058")]
const LETTERS: Array[Color] = [Color("#e0287a"), Color("#ff7aa8"), Color("#ffc040"), Color("#ffe6a0"), Color("#ffffff")]
const SCROLL := Color("#3a2a1e")


static func _c01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


static func _smooth(u: float) -> float:
	var k := _c01(u)
	return k * k * (3.0 - 2.0 * k)


## place: a floor point `fwd` tiles before him and `left` to his left, him facing `aim` (as an offset from where he stands).
static func _place(aim: float, fwd: float, left: float) -> Vector2:
	return Vector2(cos(aim) * fwd + cos(aim - PI / 2.0) * left, sin(aim) * fwd + sin(aim - PI / 2.0) * left)


## dashes: a dashed line on the floor from `a` to `b` (offsets, tiles): dashes running along it by `run`, lit by `lit` (0 to 1).
static func _dashes(px, a: Vector2, b: Vector2, lit: float, run: float, hot: bool, step := 0.04) -> void:
	var L := a.distance_to(b)
	var d := 0.0
	while d <= L:
		if fmod(fmod(d * 2.2 - run, 1.0) + 1.0, 1.0) > 0.6:
			d += step
			continue
		var u := d / maxf(1e-6, L)
		var q: Vector2 = px.tile(a.x + (b.x - a.x) * u, a.y + (b.y - a.y) * u)
		if lit < 0.5 and GP.hash(GP.rnd(q.x), GP.rnd(q.y), 5101) > lit * 2.0:
			d += step
			continue
		px.dot(q.x, q.y, FLAME[3] if hot else FLAME[2], 2, 1)
		px.dot(q.x, q.y + 1.0, FLAME[0], 2, 1)
		d += step


## THE DECREE'S CANVAS for its lane (`to` tiles long, him facing `aim`): just room for the whole of it.
static func decree_canvas(aim: float, to: float) -> Object:
	var D: Dictionary = CR.DECREE
	var lo := Vector2(INF, INF)
	var hi := Vector2(-INF, -INF)
	for f in [float(D["from"]), to]:
		for l in [-float(D["half"]), float(D["half"])]:
			var o := _place(aim, f, l)
			var q := Vector2(32.0 * (o.x - o.y), 16.0 * (o.x + o.y))
			lo = lo.min(q)
			hi = hi.max(q)
	var w := ceili(hi.x - lo.x) + 16
	var h := ceili(hi.y - lo.y) + 16
	return Canvas.new(w, h, -lo.x + 8.0, -lo.y + 8.0)


## paintDecree, layer 'floor', before it lands: THE WARNING, the lane marked out down the square, racing out to its end, a bar
## across its end, a stipple over it. `m` seconds into his move, him facing `aim`, `to` where its lane ends.
static func decree_warning(px, m: float, aim: float, to: float) -> void:
	var D: Dictionary = CR.DECREE
	var s := m - CR.PROCLAIM_HIT
	var run := m * 2.4
	var from: float = D["from"]
	var half: float = D["half"]
	if m < float(CR.PROCLAIM_HOLD[0]) - 0.25 or s >= float(D["lands"]):
		return
	var k := _smooth((m - float(CR.PROCLAIM_HOLD[0]) + 0.25) / 0.45)
	var hot := s > -0.25
	var long := from + (to - from) * k
	for side in [-1.0, 1.0]:
		_dashes(px, _place(aim, from, side * half), _place(aim, long, side * half), 1.0, run, hot)
	if k >= 1.0:
		_dashes(px, _place(aim, to, -half), _place(aim, to, half), 1.0, run, hot)
	_dashes(px, _place(aim, from, -half), _place(aim, from, half), k, run, hot)
	var fm := floori(m * 7.0)
	for j in 3000:
		if GP.hash(j, fm, 5177) > 0.4:
			continue
		var fwd := from + (long - from) * GP.hash(j, 1, 5175)
		var left := (GP.hash(j, 2, 5175) * 2.0 - 1.0) * half
		var o := _place(aim, fwd, left)
		var q: Vector2 = px.tile(o.x, o.y)
		px.dot(q.x, q.y, FLAME[2] if GP.hash(j, 3, 5177) < 0.15 else FLAME[1], 2, 1)


## paintDecree, layer 'air', `s` from 0 to its landing: IN THE AIR, the roll flung down from his hand (0.9 tiles before him, 70 picture
## pixels up) to the lane's near end, swelling to its width, a streak behind it.
static func decree_air(m: float, aim: float) -> Dictionary:
	var D: Dictionary = CR.DECREE
	var s := m - CR.PROCLAIM_HIT
	if s < 0.0 or s >= float(D["lands"]):
		return {}
	var px := Canvas.new(192, 256, 96.0, 196.0)
	var hand := Vector2(0.9, 70.0)
	var u := s / float(D["lands"])
	var d := hand.x + (float(D["from"]) - hand.x) * u
	var half := 0.4 + (float(D["half"]) - 0.4) * u
	var l := -half
	while l <= half:
		var o := _place(aim, d, l)
		var q: Vector2 = px.tile(o.x, o.y) - Vector2(0.0, hand.y * (1.0 - u))
		for j in 7:
			px.dot(q.x, q.y - j, PAPER[4] if j < 2 else (PAPER[3] if j < 5 else PAPER[1]))
		l += 0.03
	for j in range(1, 6):
		var o := _place(aim, d - j * 0.12, 0.0)
		var q: Vector2 = px.tile(o.x, o.y) - Vector2(0.0, hand.y * (1.0 - u) + j * 9)
		px.dot(q.x, q.y, FLAME[3] if j < 3 else FLAME[2], 2, 2)
	return px.cut()


## THE CALL'S CANVAS, round him (render/act1_fx/crier.ts floorPicture: `R` tiles each way, the farthest pool and 2 more).
static func call_canvas(R: float) -> Object:
	var span := Vector2(R, R).length() + 1.0
	var w := ceili(64.0 * span) + 8
	var h := ceili(32.0 * span) + 8
	return Canvas.new(w, h, w / 2.0, h / 2.0)


## paintCall: THE CROWD ON THE FLOOR, `m` seconds into his move; the pools at `spots` (offsets from him, tiles).
static func paint_call(px, m: float, spots: Array) -> void:
	var C: Dictionary = CR.CALL
	var s := m - CR.CROWD_HIT
	var at := func(o: Vector2, z := 0.0) -> Vector2:
		return px.tile(o.x, o.y) - Vector2(0.0, z)
	# THE WARNING: the pools welling up in the lanes' mouths, growing as he holds the summons; his pink in them
	for i in spots.size():
		var c: Vector2 = spots[i]
		var grow := _smooth((m - float(CR.CROWD_HOLD[0]) - i * 0.04) / 0.6)
		var last := CR.comes_out(i, int(C["each"]) - 1) + float(C["out"])
		var sink := 1.0 if s < last else 1.0 - (s - last) / float(C["sink"])
		if grow <= 0.0 or sink <= 0.0:
			continue
		var R := 1.15 * grow * (1.0 + 0.05 * sin(m * 7.0 + i))
		for j in 700:
			if GP.hash(j, i + 2, 5191) > sink:
				continue
			var a := GP.hash(j, i, 5191) * PI * 2.0
			var r := R * sqrt(GP.hash(j, i + 1, 5191))
			var q: Vector2 = at.call(c + Vector2(cos(a), sin(a)) * r)
			px.dot(q.x, q.y, HUSH[0] if r < R * 0.55 else HUSH[1], 2, 2)
		var n := maxi(10, GP.rnd(R * 70.0))
		for j in n:
			var a := (float(j) / n) * PI * 2.0
			var rr := R * (1.0 + 0.07 * sin(a * 5.0 + m * 9.0))
			if GP.hash(j, i + 3, 5191) > sink:
				continue
			var q: Vector2 = at.call(c + Vector2(cos(a), sin(a)) * rr)
			px.dot(q.x, q.y, ((FLAME[3] if s > -0.3 else FLAME[2]) if (s < 0.0 and j % 3 != 0) else HUSH[4]), 2, 1)
			px.dot(q.x, q.y + 1.0, FLAME[0] if s < 0.0 else HUSH[2], 2, 1)
		# (pinpoints of pink in it before they are out; specks rising)
		if s < float(C["first"]) + float(C["out"]):
			var q: Vector2 = at.call(c)
			for dx in [-3.0, 2.0]:
				px.dot(q.x + dx, q.y - 2.0, FLAME[3], 2, 1)
		for j in 14:
			var life := fmod(m * 1.6 + GP.hash(j, i, 5193), 1.0)
			var a := GP.hash(j, i + 4, 5193) * PI * 2.0
			if GP.hash(j, i + 5, 5193) > sink:
				continue
			var q: Vector2 = at.call(c + Vector2(cos(a), sin(a)) * R * 0.7, 2.0 + life * 30.0)
			px.dot(q.x, q.y, HUSH[4] if life < 0.4 else HUSH[3], 2, 1)
	# THE CALL'S RINGS rolling out across the square from him
	if s < 0.0:
		return
	for j in int(C["rings"]):
		var age := s - j * float(C["every"])
		if age < 0.0:
			continue
		var r := 0.8 + age * float(C["speed"])
		if r > float(C["reach"]):
			continue
		var fade := 1.0 - r / float(C["reach"])
		for band in [[0.0, PALE], [0.15, HUSH[4]], [0.32, HUSH[3]]]:
			var back: float = band[0]
			var rr := r - back
			if rr < 0.5:
				continue
			var n := GP.rnd(rr * 55.0)
			for i in n:
				if GP.hash(i, j + GP.rnd(back * 10.0), 5195) > fade * 0.95:
					continue
				var a := (float(i) / n) * PI * 2.0
				var q: Vector2 = at.call(Vector2(cos(a), sin(a)) * rr, 1.0)
				px.dot(q.x, q.y, FLAME[2] if (back == 0.0 and GP.hash(i, j, 5197) < 0.1) else band[1], 2 if back == 0.0 else 1, 1)


# --- what the game draws with the canvas's own lines (render/act1_fx/crier.ts), on the floor, its pixels the game's (two of the
# picture's each) ---

## A point of his frame (tiles before him, to his left) on the screen (picture pixels).
static func _framed(p: Dictionary, fwd: float, left: float) -> Vector2:
	var w := A1.beside(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), int(p["hand"]), fwd, left)
	return Iso.to_screen(w.x, w.y)


static func _line(c: CanvasItem, pts: PackedVector2Array, col: Color, width: float, alpha: float) -> void:
	if pts.size() < 2 or alpha <= 0.0:
		return
	c.draw_polyline(pts, Color(col, alpha), width * 2.0)


## A filled shape as the canvas fills one, made of triangles from its first point (its shapes here are fans and quads round it).
static func _fill(c: CanvasItem, pts: PackedVector2Array, col: Color, alpha: float) -> void:
	if pts.size() < 3 or alpha <= 0.0:
		return
	var k := Color(col, alpha)
	for i in range(1, pts.size() - 1):
		var a := pts[0]
		var b := pts[i]
		var d := pts[i + 1]
		if absf((b - a).cross(d - a)) < 0.01:
			continue
		c.draw_colored_polygon(PackedVector2Array([a, b, d]), k)


## drawShout: THE SHOUT OFF THE WALLS, `m` seconds into it, its walls `w` (his frame): the warning (the three walls lit along their
## feet, beating faster, the one spot ringed); then the dark where a front has passed, and the fronts.
static func draw_shout(c: CanvasItem, p: Dictionary, m: float) -> void:
	var W: Dictionary = CR.WALLS
	var w := {"far": float(p["a"]), "back": float(p["b"]), "left": float(p["c"]), "right": float(p["d"])}
	var s := m - CR.SHOUT_HIT
	var pt := func(fwd: float, left: float) -> Vector2: return _framed(p, fwd, left)
	var T := CR.echo_times(w)
	var done := maxf(float(T["far"][1]), maxf(float(T["left"][1]), float(T["right"][1])))
	if m >= float(CR.SHOUT_HOLD[0]) - 0.2 and s < done:
		var k := minf(1.0, (m - float(CR.SHOUT_HOLD[0]) + 0.2) / 0.5) * (1.0 if s < 0.0 else maxf(0.0, 1.0 - s / 0.4))
		var beat := 0.55 + 0.45 * sin(m * (8.0 + 10.0 * clampf(m / CR.SHOUT_HIT, 0.0, 1.0)))
		if k > 0.0:
			var far := PackedVector2Array([pt.call(w["far"], w["left"]), pt.call(w["far"], -w["right"])])
			var left := PackedVector2Array([pt.call(-w["back"], w["left"]), pt.call(w["far"], w["left"])])
			var right := PackedVector2Array([pt.call(-w["back"], -w["right"]), pt.call(w["far"], -w["right"])])
			for ln in [far, left, right]:
				_line(c, ln, PINKS[2], 4.0, 0.5 * k)
				_line(c, ln, PINKS[0], 2.0, 0.85 * k * beat)
		# (THE ONE SPOT, none of them reach)
		var f0 := -(float(W["behind"]) + float(W["band"]))
		var f1: float = -w["back"] + 0.2
		if f1 < f0:
			var half := float(W["side"]) - float(W["band"])
			var ring := PackedVector2Array([pt.call(f0, half), pt.call(f1, half), pt.call(f1, -half), pt.call(f0, -half), pt.call(f0, half)])
			_line(c, ring, HUSHC[5], 2.0, 0.8)
			_fill(c, ring.slice(0, 4), HUSHC[4], 0.12)
	if s < 0.0:
		return
	# THE DARK where a front has passed, fading after the last echo
	var dark := 0.42 if s < done else maxf(0.0, 0.42 * (1.0 - (s - done) / float(W["dark"])))
	var F := CR.fronts_at(s, w)
	if dark > 0.0:
		var arc := PackedVector2Array([pt.call(0.0, 0.0)])
		var a := -90
		while a <= 90:
			var r := float(W["from"]) + float(W["out"]) * s
			var fx := cos(deg_to_rad(a)) * r
			var lf := sin(deg_to_rad(a)) * r
			arc.append(pt.call(clampf(fx, 0.0, w["far"]), clampf(lf, -w["right"], w["left"])))
			a += 6
		_fill(c, arc, HUSHC[0], dark)
		var fF: float = F["far"] if F["far"] != null else -float(W["behind"])
		var fL: float = F["left"] if F["left"] != null else float(W["side"])
		var fR: float = F["right"] if F["right"] != null else float(W["side"])
		if s >= float(T["far"][0]):
			_fill(c, PackedVector2Array([pt.call(w["far"], w["left"]), pt.call(w["far"], -w["right"]), pt.call(fF, -w["right"]), pt.call(fF, w["left"])]), HUSHC[0], dark * 0.8)
		if s >= float(T["left"][0]):
			_fill(c, PackedVector2Array([pt.call(-w["back"], w["left"]), pt.call(w["far"], w["left"]), pt.call(w["far"], fL), pt.call(-w["back"], fL)]), HUSHC[0], dark * 0.8)
		if s >= float(T["right"][0]):
			_fill(c, PackedVector2Array([pt.call(-w["back"], -w["right"]), pt.call(w["far"], -w["right"]), pt.call(w["far"], -fR), pt.call(-w["back"], -fR)]), HUSHC[0], dark * 0.8)
	# THE FRONTS: a low wall of dead air, pale, its leading edge the enemy's pink
	var front := func(pts: PackedVector2Array) -> void:
		_line(c, pts, HUSHC[3], 7.0, 0.55)
		_line(c, pts, HUSHC[5], 3.0, 0.9)
		_line(c, pts, PINKS[1], 1.0, 0.9)
	if F["wave"] != null:
		var pts := PackedVector2Array()
		var a := -90
		while a <= 90:
			var fx: float = cos(deg_to_rad(a)) * float(F["wave"])
			var lf: float = sin(deg_to_rad(a)) * float(F["wave"])
			if not (fx > w["far"] or lf > w["left"] or -lf > w["right"]):
				pts.append(pt.call(fx, lf))
			a += 4
		if pts.size() > 1:
			front.call(pts)
	if F["far"] != null:
		front.call(PackedVector2Array([pt.call(F["far"], w["left"]), pt.call(F["far"], -w["right"])]))
	if F["left"] != null:
		front.call(PackedVector2Array([pt.call(-w["back"], F["left"]), pt.call(w["far"], F["left"])]))
	if F["right"] != null:
		front.call(PackedVector2Array([pt.call(-w["back"], -float(F["right"])), pt.call(w["far"], -float(F["right"]))]))


## drawDecreeBurning: THE DECREE lying on its lane, `s` seconds after it was flung: the parchment, its letters burning along it,
## then crumbling. Its light: the middle of what is unrolled (returned, with its strength).
static func draw_decree(c: CanvasItem, p: Dictionary, s: float) -> Array:
	var D: Dictionary = CR.DECREE
	var q := {"x": p["x"], "y": p["y"], "fx": p["fx"], "fy": p["fy"], "hand": 1}
	var pt := func(fwd: float, left: float) -> Vector2: return _framed(q, fwd, left)
	var to: float = p["d"]
	var from: float = D["from"]
	var half: float = D["half"]
	var unrolled := minf(to, from + (to - from) * minf(1.0, (s - float(D["lands"])) / (float(D["unrolled"]) - float(D["lands"]))))
	var crumble := 0.0 if s < float(D["out"]) else minf(1.0, (s - float(D["out"])) / (float(D["gone"]) - float(D["out"])))
	var alpha := 1.0 - crumble
	# (the parchment, scorched dark)
	var quad := PackedVector2Array([pt.call(from, half * 0.85), pt.call(unrolled, half * 0.85), pt.call(unrolled, -half * 0.85), pt.call(from, -half * 0.85)])
	_fill(c, quad, SCROLL, alpha)
	var loop := quad.duplicate()
	loop.append(quad[0])
	_line(c, loop, PINKS[2], 1.0, alpha)
	# (the decree's letters, burning along it, lit as fast as DECREE.burn tiles a second, flickering)
	var lit := from + float(D["burn"]) * maxf(0.0, s - float(D["lands"]))
	for row in range(-2, 3):
		var d := from + 0.3
		while d < unrolled - 0.2:
			if d > lit:
				break
			var n := sin(d * 12.9898 + row * 78.233) * 43758.5453
			var hsh := n - floorf(n)
			if hsh >= 0.25:
				var fresh := lit - d < 1.5
				var flick := sin(s * 23.0 + d * 7.0 + row) > -0.3
				var col: Color = LETTERS[4] if fresh else (LETTERS[floori(hsh * 4.0)] if flick else HUSHC[3])
				var at: Vector2 = pt.call(d, row * half * 0.3) / 2.0
				c.draw_rect(Rect2((GP.rnd(at.x) - 2) * 2.0, (GP.rnd(at.y) - 1) * 2.0, (3 + floori(hsh * 3.0)) * 2.0, 4.0), Color(col, alpha))
			d += 0.32
	return [pt.call((from + unrolled) / 2.0, 0.0), 0.35 * (1.0 - crumble)]
