## FLOOR 20'S BOSS, THE MOTH, MADE GHOSTLY: WHAT HER NEW ATTACKS LOOK LIKE (art/moth2_fx.ts, brought over line for line; where each
## strikes, art/moth2.ts, here too: her rules, act3/moth.gd, ask these). Drawn straight onto the game's own pixels each frame, given
## where a point of the floor is on the screen (`at`: [x, y] game pixels) and how high above it, so none of them is a big painting
## held in memory:
##   GHOST WING: a see-through ghost of her wings, eyes and all, sweeping out over the floor before her, spreading as it goes, its
##     leading edge bright, scales streaming off its trailing edge.
##   ECLIPSE: a pale moon rising behind her, its halo round her; her shadow thrown out across the top toward him, growing, the eyes
##     of her wings opening in it and following him, its edge the enemy's pink (the warning); then the shadow strikes: black, the
##     eyes burning, darkness rising out of it, and gone upward in motes.
##   PHANTOMS: copies of her shimmering off her as she wraps her wings round herself; then three gliding moths of pale light,
##     see-through, wings beating slow, eyes burning, after-images behind, each down its lane.
##   THE HUSH: glowing scales falling like slow snow; settled, a faint haze of light where letters glow, go dark and crumble.
##   THE UNWRITING: pages tearing loose from the chapter and circling up; then a ring of pale pages, burning at their edges,
##     wheeling out over the whole top, embers off them.
##   HER DEATH: the light she comes apart into; and every word she swallowed flying home (art/moth_fx.ts wordsPainted, drawn here
##     dot by dot as it paints them).
## Her colours only: moonlight, bone, the Hush's grey-violet, and the enemy's pink and gold where she burns. Never cyan. Her numbers,
## her wings' outlines and the rest: assets/act3/moth.json (tools/godot_moth.ts); checks/moth_check.gd holds every one of these
## against the game's own, fillRect for fillRect.
extends RefCounted

const GP := preload("res://scripts/act2/gp.gd")

static var _D := {}


## Her numbers (tools/godot_moth.ts).
static func data() -> Dictionary:
	if _D.is_empty():
		_D = JSON.parse_string(FileAccess.get_file_as_string("res://assets/act3/moth.json"))
	return _D


static func _c(name: String, i: int) -> String:
	return data()["colours"][name][i]


## THE PEN: what the painters lay their dots with, as the game's canvas does (fillStyle, globalAlpha: a value outside 0 to 1 not
## taken, fillRect). Each block of game pixels is kept as runs two picture pixels high, laid at once (`draw`); in the check
## (`rec`), each fillRect is written down as the game's check writes it.
class Pen:
	var alpha := 1.0
	var style := "#000000"
	var rec = null
	## (kept to an ellipse of the screen, [middle x, y, half width, half height] game pixels: the tower's top; empty, not kept)
	var clip: Array = []
	var pts := PackedVector2Array()
	var cols := PackedColorArray()
	static var _colour := {}

	func set_alpha(v: float) -> void:
		if v >= 0.0 and v <= 1.0:
			alpha = v

	func rect(x: float, y: float, w: float, h: float) -> void:
		if rec != null:
			rec.append("%d,%d,%d,%d,%s,%.4f" % [x, y, w, h, style.to_lower(), alpha])
			return
		if alpha <= 0.0:
			return
		var c: Color
		if _colour.has(style):
			c = _colour[style]
		else:
			c = Color(style)
			_colour[style] = c
		c.a = alpha
		for j in int(h):
			var x0 := x
			var x1 := x + w
			if not clip.is_empty():
				var dy: float = (y + j + 0.5 - float(clip[1])) / float(clip[3])
				if absf(dy) >= 1.0:
					continue
				var half: float = float(clip[2]) * sqrt(1.0 - dy * dy)
				x0 = maxf(x0, float(clip[0]) - half)
				x1 = minf(x1, float(clip[0]) + half)
				if x1 <= x0:
					continue
			pts.append(Vector2(x0 * 2.0, (y + j) * 2.0 + 1.0))
			pts.append(Vector2(x1 * 2.0, (y + j) * 2.0 + 1.0))
			cols.append(c)

	## What was laid, drawn on `c` (in the Godot version's picture pixels, two to the game's).
	func draw(c: CanvasItem) -> void:
		if not pts.is_empty():
			c.draw_multiline_colors(pts, cols, 2.0)


static func _c01(v: float) -> float:
	return 0.0 if v < 0.0 else (1.0 if v > 1.0 else v)


static func _sm(v: float) -> float:
	var c := _c01(v)
	return c * c * (3.0 - 2.0 * c)


static func _ease_out(v: float) -> float:
	return 1.0 - pow(1.0 - _c01(v), 3.0)


## (Math.hypot as the game's engine works it)
static func _hypot(a: float, b: float) -> float:
	a = absf(a)
	b = absf(b)
	var m := maxf(a, b)
	if m == 0.0:
		return 0.0
	var p := a / m
	var q := b / m
	return sqrt(p * p + q * q) * m


static func _rnd(v: float) -> float:
	return floorf(v + 0.5)


static func dot(g: Pen, x: float, y: float, color: String, w := 1.0, h := 1.0) -> void:
	g.style = color
	g.rect(_rnd(x), _rnd(y), w, h)


## A shape on the screen filled, crisp, row by row (its points in game pixels; even-odd, so a ring is a ring).
static func fill(g: Pen, rings: Array, color: String, alpha: float) -> void:
	if alpha <= 0.003:
		return
	var y0 := INF
	var y1 := -INF
	for r in rings:
		for p in r:
			y0 = minf(y0, p[1])
			y1 = maxf(y1, p[1])
	if is_inf(y0) or is_nan(y0):
		return
	var was := g.alpha
	g.set_alpha(was * minf(1.0, alpha))
	g.style = color
	var xs: Array[float] = []
	var y := ceilf(y0 - 0.5) + 0.5
	while y <= y1:
		xs.clear()
		for r in rings:
			var n: int = r.size()
			for i in n:
				var a: Array = r[i]
				var b: Array = r[(i + 1) % n]
				if (float(a[1]) > y) != (float(b[1]) > y):
					xs.append(float(a[0]) + ((y - float(a[1])) * (float(b[0]) - float(a[0]))) / (float(b[1]) - float(a[1])))
		xs.sort()
		var i := 0
		while i + 1 < xs.size():
			var xa := _rnd(xs[i])
			var xb := _rnd(xs[i + 1])
			if xb > xa:
				g.rect(xa, floorf(y), xb - xa, 1)
			i += 2
		y += 1.0
	g.set_alpha(was)


## Shapes on the screen filled as one, each place once however many of them lie over it (so no seam darker where they overlap).
static func fill_union(g: Pen, shapes: Array, color: String, alpha: float) -> void:
	if alpha <= 0.003:
		return
	var y0 := INF
	var y1 := -INF
	for r in shapes:
		for p in r:
			y0 = minf(y0, p[1])
			y1 = maxf(y1, p[1])
	if is_inf(y0) or is_nan(y0):
		return
	var was := g.alpha
	g.set_alpha(was * minf(1.0, alpha))
	g.style = color
	var xs: Array[float] = []
	var spans: Array = []
	var y := ceilf(y0 - 0.5) + 0.5
	while y <= y1:
		spans.clear()
		for r in shapes:
			xs.clear()
			var n: int = r.size()
			for i in n:
				var a: Array = r[i]
				var b: Array = r[(i + 1) % n]
				if (float(a[1]) > y) != (float(b[1]) > y):
					xs.append(float(a[0]) + ((y - float(a[1])) * (float(b[0]) - float(a[0]))) / (float(b[1]) - float(a[1])))
			xs.sort()
			var i := 0
			while i + 1 < xs.size():
				spans.append([_rnd(xs[i]), _rnd(xs[i + 1])])
				i += 2
		spans.sort_custom(func(p, q): return p[0] < q[0])
		var s0 := -INF
		var s1 := -INF
		for sp in spans:
			var a: float = sp[0]
			var b: float = sp[1]
			if a > s1:
				if s1 > s0:
					g.rect(s0, floorf(y), s1 - s0, 1)
				s0 = a
				s1 = b
			else:
				s1 = maxf(s1, b)
		if s1 > s0:
			g.rect(s0, floorf(y), s1 - s0, 1)
		y += 1.0
	g.set_alpha(was)


## Dots round a closed run of screen points, every `step` pixels, some left out (`gap`, by `seed`).
static func rim(g: Pen, pts: Array, color: String, alpha: float, step := 1.5, gap := 0.0, seed := 0, size := 1) -> void:
	if alpha <= 0.003:
		return
	var was := g.alpha
	g.set_alpha(was * minf(1.0, alpha))
	var j := 0
	var m := pts.size()
	for i in m:
		var a: Array = pts[i]
		var b: Array = pts[(i + 1) % m]
		var ax: float = a[0]
		var ay: float = a[1]
		var bx: float = b[0]
		var by: float = b[1]
		var n := maxi(1, int(_rnd(_hypot(bx - ax, by - ay) / step)))
		for s in n:
			if gap > 0.0 and GP.hash(j, seed, 7301) < gap:
				j += 1
				continue
			dot(g, ax + ((bx - ax) * s) / n, ay + ((by - ay) * s) / n, color, size, size)
			j += 1
	g.set_alpha(was)


## An ellipse of the floor (a circle of radius `r` tiles about (x, y)) on the screen, `n` points, `h` game pixels above it.
static func floor_circle(at: Callable, x: float, y: float, r: float, h := 0.0, n := 24) -> Array:
	var out: Array = []
	for i in n:
		var a := (float(i) / n) * PI * 2.0
		var s: Array = at.call(x + cos(a) * r, y + sin(a) * r)
		out.append([s[0], float(s[1]) - h])
	return out


# =====================================================================================================================
# HER WINGS (art/moth.ts inWing, wingRim, EYE_AT), AND HER SHAPES (art/moth2.ts)

## How far inside its outline a point of a wing is (shares of its length; less than nothing, outside).
static func in_wing(hind: bool, x: float, y: float) -> float:
	var O: Dictionary = data()["outlines"]["hind" if hind else "fore"]
	var bins: int = data()["bins"]
	var r: Array = O["r"]
	var dx: float = x - float(O["o"][0])
	var dy: float = y - float(O["o"][1])
	var a := atan2(dy, dx)
	if a < 0.0:
		a += PI * 2.0
	var f := (a / (PI * 2.0)) * bins
	var i := floori(f) % bins
	var R: float = float(r[i]) + (float(r[(i + 1) % bins]) - float(r[i])) * (f - floorf(f))
	return R - _hypot(dx, dy)


static var _rims := {}


## Points round a wing's outline (shares), `n` of them, the root's own side left out.
static func wing_rim(hind: bool, n: int) -> Array:
	var key := "%d:%d" % [1 if hind else 0, n]
	if _rims.has(key):
		return _rims[key]
	var O: Dictionary = data()["outlines"]["hind" if hind else "fore"]
	var R: Dictionary = data()["rims"]["hind" if hind else "fore"]
	var bins: int = data()["bins"]
	var D2R := PI / 180.0
	var out: Array = []
	for k in n:
		var a: float = float(R["from"]) * D2R + (float(k) / (n - 1)) * float(R["span"]) * D2R
		var aa := a + PI * 2.0 if a < 0.0 else a
		var f := (aa / (PI * 2.0)) * bins
		var rr: float = O["r"][floori(f) % bins]
		out.append([float(O["o"][0]) + cos(a) * rr, float(O["o"][1]) + sin(a) * rr])
	_rims[key] = out
	return out


## Her wings laid flat, as in her shadow: their roots at her thorax `T` (u), the forewings `fore` long, the hindwings `hind`; each
## {hind, side, root, along, across, len} (u before her, v to her left).
static func flat_wings(T: float, fore: float, hind: float, fore_at := -1.0, hind_at := -1.0) -> Array:
	var E: Dictionary = data()["eclipse"]
	if fore_at < 0.0:
		fore_at = E["foreAt"]
	if hind_at < 0.0:
		hind_at = E["hindAt"]
	var out: Array = []
	for side in [1, -1]:
		for h in [false, true]:
			var a := ((hind_at if h else fore_at) * PI) / 180.0
			var along := [cos(a), side * sin(a)]
			var across := [-sin(a), side * cos(a)]
			if float(across[0]) > 0.0:
				across = [-float(across[0]), -float(across[1])]
			out.append({"hind": h, "side": side, "root": [T, side * 0.32], "along": along, "across": across, "len": hind if h else fore})
	return out


## A point of a flat wing (`x`, `y`: shares of its length along it and across it), in the shadow's own (u, v).
static func on_flat(w: Dictionary, x: float, y: float) -> Array:
	var al: Array = w["along"]
	var ac: Array = w["across"]
	var L: float = w["len"]
	return [float(w["root"][0]) + (float(al[0]) * x + float(ac[0]) * y) * L, float(w["root"][1]) + (float(al[1]) * x + float(ac[1]) * y) * L]


## A flat wing's outline (u, v), its root closing it.
static func flat_rim(w: Dictionary, n := 40) -> Array:
	var out: Array = [on_flat(w, 0.02, 0.05)]
	for p in wing_rim(w["hind"], n):
		out.append(on_flat(w, p[0], p[1]))
	return out


static func _with_len(w: Dictionary, L: float) -> Dictionary:
	var c := w.duplicate()
	c["len"] = L
	return c


## Whether (u, v) lies on a flat wing, and how far in (shares; less than nothing, outside).
static func in_flat(w: Dictionary, u: float, v: float) -> float:
	var du: float = u - float(w["root"][0])
	var dv: float = v - float(w["root"][1])
	var L: float = w["len"]
	var x: float = (du * float(w["along"][0]) + dv * float(w["along"][1])) / L
	var y: float = (du * float(w["across"][0]) + dv * float(w["across"][1])) / L
	return in_wing(w["hind"], x, y)


## An eye of a flat wing: its middle (u, v), its radius (tiles).
static func flat_eye(w: Dictionary) -> Dictionary:
	var e: Dictionary = data()["eyeAt"]["hind" if w["hind"] else "fore"]
	var p := on_flat(w, e["x"], e["y"])
	return {"u": p[0], "v": p[1], "r": (float(e["r"]) / float(data()["lh"] if w["hind"] else data()["lf"])) * float(w["len"])}


## Her body in the shadow: thorax, head, abdomen (ellipses: middle u, v, half their length along her and across).
static func flat_body(T: float, k := 1.0) -> Array:
	return [
		{"u": T, "v": 0.0, "ru": 0.75 * k, "rv": 0.62 * k},
		{"u": T + 0.95 * k, "v": 0.0, "ru": 0.42 * k, "rv": 0.4 * k},
		{"u": T - 1.7 * k, "v": 0.0, "ru": 1.45 * k, "rv": 0.55 * k},
	]


## How big her shadow is `t` seconds into her Eyes' move (a share of its whole size).
static func eclipse_size(t: float) -> float:
	var E: Dictionary = data()["eclipse"]
	var g0: float = E["grow"][0]
	var g1: float = E["grow"][1]
	var k := minf(1.0, maxf(0.0, (t - g0) / (g1 - g0)))
	return float(E["from"]) + (1.0 - float(E["from"])) * (k * k * (3.0 - 2.0 * k))


## Her shadow at `size` of its whole size: its wings and its body, in its own (u, v).
static func eclipse_shape(size := 1.0) -> Dictionary:
	var E: Dictionary = data()["eclipse"]
	return {"wings": flat_wings(float(E["thorax"]) * size, float(E["fore"]) * size, float(E["hind"]) * size), "body": flat_body(float(E["thorax"]) * size, size)}


static var _whole := {}


## Whether a point (u before her, v to her left, tiles) is in her shadow at its whole size.
static func in_eclipse_at(u: float, v: float) -> bool:
	if _whole.is_empty():
		_whole = eclipse_shape()
	for w in _whole["wings"]:
		if in_flat(w, u, v) >= 0.0:
			return true
	for b in _whole["body"]:
		var p: float = (u - float(b["u"])) / float(b["ru"])
		var q: float = (v - float(b["v"])) / float(b["rv"])
		if p * p + q * q <= 1.0:
			return true
	return false


## Whether (hx, hy) is in her shadow, cast from (x, y) toward (ax, ay) (a unit way), at the blow.
static func in_eclipse(x: float, y: float, ax: float, ay: float, hx: float, hy: float) -> bool:
	var dx := hx - x
	var dy := hy - y
	return in_eclipse_at(dx * ax + dy * ay, -dx * ay + dy * ax)


## A point of the shadow's own (u, v) on the floor, cast from (x, y) toward (ax, ay).
static func eclipse_to_world(x: float, y: float, ax: float, ay: float, u: float, v: float) -> Array:
	return [x + ax * u - ay * v, y + ay * u + ax * v]


## A phantom's lane: its way (a unit), from her aimed at (ax, ay).
static func phantom_way(ax: float, ay: float, i: int) -> Array:
	var P: Dictionary = data()["phantoms"]
	var a := atan2(ay, ax) + float(data()["lane"][i]) * float(P["fan"])
	return [cos(a), sin(a)]


## How far down its lane phantom `i` is `t` seconds after her Swarm's burst (tiles from her; less than its start, not yet set off).
static func phantom_along(i: int, t: float) -> float:
	var P: Dictionary = data()["phantoms"]
	var go := t - i * float(P["apart"])
	return -1.0 if go < 0.0 else float(P["start"]) + go * float(P["speed"])


## Whether phantom `i`, `t` seconds after the burst, from (x, y) aimed at (ax, ay), is over (hx, hy).
static func phantom_over(x: float, y: float, ax: float, ay: float, i: int, t: float, hx: float, hy: float) -> bool:
	var P: Dictionary = data()["phantoms"]
	var s := phantom_along(i, t)
	if s < float(P["start"]) or s > float(P["long"]):
		return false
	var w := phantom_way(ax, ay, i)
	var dx := hx - x
	var dy := hy - y
	var along := dx * float(w[0]) + dy * float(w[1])
	var across := -dx * float(w[1]) + dy * float(w[0])
	return absf(along - s) <= float(P["reach"]) and absf(across) <= float(P["half"])


## artToWorld (game/act1_rules/moth.ts): a point of the art's (its own lengths: forward, to its left, up) on the floor, from (x, y)
## facing (fx, fy) as her picture does (her left in it as it is drawn: handOf with her true back).
static func art_to_world(x: float, y: float, fx: float, fy: float, p: Array) -> Array:
	var T: float = data()["tile3"]
	var hand := -1.0 if fx - fy < 0.0 else 1.0
	var fwd: float = float(p[0]) / T
	var left: float = float(p[1]) / T
	return [x + fx * fwd + fy * hand * left, y + fy * fwd - fx * hand * left]


# =====================================================================================================================
# A FLAT WING OF HERS (her shadow, the ghost wing, the phantoms) on the screen

## Where a point of a flat thing of hers is on the screen: (u, v) of its own, cast from (x, y) along (ax, ay), lifted `h` (and more
## where its wing beats).
static func lay_of(at: Callable, x: float, y: float, ax: float, ay: float, h: float, beat := 0.0) -> Callable:
	return func(u: float, v: float) -> Array:
		# (a wing beating: its far parts lifted, and drawn in toward her as they rise)
		var vv := v * cos(beat) if beat != 0.0 else v
		var up := absf(v) * sin(absf(beat)) * 15.0 if beat != 0.0 else 0.0
		var wp := eclipse_to_world(x, y, ax, ay, u, vv)
		var s: Array = at.call(wp[0], wp[1])
		return [s[0], float(s[1]) - h - up]


static func _laid(lay: Callable, pts: Array) -> Array:
	var out: Array = []
	for p in pts:
		out.append(lay.call(p[0], p[1]))
	return out


## An eye of hers laid on a flat thing: its rings, its lids open `open` (0 shut to 1 wide; more, burning), looking toward (lx, ly).
static func flat_eye_drawn(g: Pen, lay: Callable, u: float, v: float, r: float, open: float, lx: float, ly: float, alpha: float, spot = null) -> void:
	if alpha <= 0.01 or open <= 0.02:
		return
	var ring := func(k: float) -> Array:
		var out: Array = []
		for i in 18:
			var a := (float(i) / 18) * PI * 2.0
			out.append(lay.call(u + cos(a) * r * k, v + sin(a) * r * k * 1.25))
		return out
	var c: Array = lay.call(u, v)
	var cx: float = c[0]
	var cy: float = c[1]
	var lid := func(k: float) -> Array:
		var out: Array = []
		for p in ring.call(k):
			out.append([p[0], cy + (float(p[1]) - cy) * minf(1.0, open)])
		return out
	var burning := open > 1.0
	fill(g, [lid.call(1.15)], _c("dark", 0), alpha * 0.9)
	fill(g, [lid.call(1.0)], _c("moon", 3) if burning else _c("moon", 2), alpha)
	# (the iris and pupil, turned toward him)
	var dx := lx - cx
	var dy := ly - cy
	var d := _hypot(dx, dy)
	if d == 0.0:
		d = 1.0
	var ex: float = lay.call(u + r, v)[0]
	var rs := maxf(2.0, absf(ex - cx))
	var ox := (dx / d) * rs * 0.3
	var oy := (dy / d) * rs * 0.3 * minf(1.0, open)
	var iris: Array = []
	for p in lid.call(0.62):
		iris.append([float(p[0]) + ox, float(p[1]) + oy])
	fill(g, [iris], _c("flame", 2) if burning else _c("flame", 1), alpha)
	var pupil: Array = []
	for p in lid.call(0.26):
		pupil.append([float(p[0]) + ox, float(p[1]) + oy])
	fill(g, [pupil], _c("flame", 4) if burning else "#0a0508", alpha)
	dot(g, cx + ox - rs * 0.25, cy + oy - rs * 0.25 * minf(1.0, open), _c("moon", 4), 1, 1)
	if spot != null:
		spot.call(cx, cy, rs * (5.0 if burning else 2.5), alpha * (0.35 if burning else 0.12))


# =====================================================================================================================
# GHOST WING (the buffet)

## How far the ghost wing has gone out (tiles) `t` seconds after the blow, and how much of it is left.
static func ghost_wing_at(t: float) -> Array:
	var G: Dictionary = data()["ghostWing"]
	return [float(G["from"]) + (float(G["to"]) - float(G["from"])) * _ease_out(t / float(G["reach"])), 1.0 - _sm((t - float(G["reach"])) / (float(G["long"]) - float(G["reach"])))]


## Its wings at `R` tiles out: a pair of hers, flat, spreading as they go, filling the gust's cone.
static func ghost_wings(R: float) -> Array:
	return flat_wings(0.72 * R, 0.72 * R, 0.5 * R, 84.0, 120.0)


static func draw_ghost_wing(g: Pen, at: Callable, x: float, y: float, fx: float, fy: float, t: float, spot = null) -> void:
	if t < 0.0 or t > float(data()["ghostWing"]["long"]):
		return
	var gw := ghost_wing_at(t)
	var R: float = gw[0]
	var fade: float = gw[1]
	var h := 6.0 + 4.0 * sin(t * 9.0)
	var lay := lay_of(at, x, y, fx, fy, h)
	var wings := ghost_wings(R)
	# (the wind under it: dashes running out across the cone)
	var was := g.alpha
	for i in 26:
		var a := ((-70.0 + (140.0 * (i + 0.5)) / 26.0 + (GP.hash(i, 1, 7311) - 0.5) * 4.0) * PI) / 180.0
		var s0 := fmod(t * 2.6 + GP.hash(i, 2, 7311), 1.0) * R
		if s0 < 1.0 or GP.hash(i, 3, 7311) > fade:
			continue
		var s1 := minf(R, s0 + 0.6)
		var A: Array = lay.call(cos(a) * s0, sin(a) * s0)
		var B: Array = lay.call(cos(a) * s1, sin(a) * s1)
		g.set_alpha(was * 0.35 * fade)
		for k in 7:
			dot(g, float(A[0]) + ((float(B[0]) - float(A[0])) * k) / 6.0, float(A[1]) + ((float(B[1]) - float(A[1])) * k) / 6.0, _c("ghost", 4))
	g.set_alpha(was)
	for w in wings:
		var pts := _laid(lay, flat_rim(w, 44))
		var rim40 := flat_rim(w, 40)
		# (the sheet of it, see-through; its scales' bands a shade deeper)
		fill(g, [pts], _c("ghost", 3), 0.38 * fade)
		var band := _laid(lay, flat_rim(_with_len(w, float(w["len"]) * 0.7), 30))
		fill(g, [band], _c("ghost", 4), 0.1 * fade)
		# (its veins out from its root)
		var r0: Array = lay.call(w["root"][0], w["root"][1])
		var rx: float = r0[0]
		var ry: float = r0[1]
		var rim_pts := flat_rim(w, 12)
		for i in range(2, rim_pts.size() - 1):
			var e: Array = lay.call(rim_pts[i][0], rim_pts[i][1])
			var ex: float = e[0]
			var ey: float = e[1]
			g.set_alpha(was * 0.28 * fade)
			var n := maxi(2, int(_rnd(_hypot(ex - rx, ey - ry) / 3.0)))
			for k in range(1, n):
				dot(g, rx + ((ex - rx) * k) / n, ry + ((ey - ry) * k) / n, _c("ghost", 4))
		g.set_alpha(was)
		# (its edge: bright, broken toward its trailing side)
		rim(g, pts, _c("ghost", 5), fade, 1.2, 0.1, 2 if w["hind"] else 1, 1 if w["hind"] else 2)
		# (its eye)
		var fe := flat_eye(w)
		flat_eye_drawn(g, lay, fe["u"], fe["v"], float(fe["r"]) * 1.2, 0.75, rx, ry - 40.0, 0.75 * fade, spot)
		# (scales streaming off its trailing edge, left behind as it goes)
		for i in 40:
			var q: Array = rim40[floori(GP.hash(i, 4, 7312) * 40.0)]
			var lag := GP.hash(i, 5, 7312) * 1.4
			var s: Array = lay.call(float(q[0]) * (1.0 - lag / maxf(2.0, R)), float(q[1]) * (1.0 - lag / maxf(2.0, R)))
			if GP.hash(i, 6, 7312) > fade:
				continue
			g.set_alpha(was * (0.4 + 0.5 * (1.0 - lag / 1.4)) * fade)
			dot(g, s[0], float(s[1]) - lag * 10.0, _c("flame", 1) if i % 5 == 0 else _c("ghost", 4 if i % 2 else 5))
		g.set_alpha(was)
	if spot != null:
		var s: Array = lay.call(R * 0.7, 0.0)
		spot.call(s[0], s[1], 60.0 + R * 10.0, 0.18 * fade)


# =====================================================================================================================
# ECLIPSE

## How far up the moon is (0 down behind her, 1 risen) and how much of it is left, `t` seconds into her Eyes' move (on after the
## blow too).
static func moon_at(t: float) -> float:
	var E: Dictionary = data()["eclipse"]
	var m0: float = E["moon"][0]
	var m1: float = E["moon"][1]
	return _sm((t - m0) / (m1 - m0)) * (1.0 - _sm((t - float(E["hit"]) - 0.4) / (float(E["after"]) - 0.4)))


## THE MOON behind her: (sx, sy) where its middle is when it has risen (screen game pixels), `k` how far risen.
static func draw_moon(g: Pen, sx: float, sy: float, k: float, t: float, spot = null) -> void:
	if k <= 0.01:
		return
	var r := 46.0
	var cy := sy + (1.0 - k) * 70.0
	var was := g.alpha
	# (its halo: rings of light thinning out, a slow shimmer in them)
	for ring in 7:
		var rr := r + 10.0 + ring * 15.0
		var n := int(_rnd(rr * 2.2))
		g.set_alpha(was * k * (0.32 - ring * 0.04))
		for i in n:
			if GP.hash(i, ring, 7321 + floori(t * 6.0)) < 0.35 + ring * 0.08:
				continue
			var a := (float(i) / n) * PI * 2.0
			dot(g, sx + cos(a) * rr, cy + sin(a) * rr * 0.96, _c("moon", 4) if ring < 2 else _c("ghost", 5 if ring < 4 else 4))
	# (its rays, faint, out across the sky)
	for i in 16:
		var a := (float(i) / 16) * PI * 2.0 + 0.1
		g.set_alpha(was * k * 0.12)
		var s := r + 6.0
		while s < r + 150.0:
			if GP.hash(i, int(s), 7322) > 0.3:
				dot(g, sx + cos(a) * s, cy + sin(a) * s, _c("moon", 4))
			s += 3.0
	g.set_alpha(was)
	# (its face: pale, its seas faint; a soft glow round it)
	var ring_of := func(rr: float) -> Array:
		var out: Array = []
		for i in 48:
			var a := (float(i) / 48) * PI * 2.0
			out.append([sx + cos(a) * rr, cy + sin(a) * rr])
		return out
	var disc: Array = ring_of.call(r)
	fill(g, [ring_of.call(r + 30.0), ring_of.call(r + 12.0)], _c("ghost", 5), 0.1 * k)
	fill(g, [ring_of.call(r + 12.0), disc], _c("moon", 4), 0.22 * k)
	fill(g, [disc], _c("moon", 3), k)
	for i in 6:
		var a := GP.hash(i, 1, 7323) * PI * 2.0
		var d := sqrt(GP.hash(i, 2, 7323)) * r * 0.7
		var rr := 4.0 + GP.hash(i, 3, 7323) * 9.0
		var sea: Array = []
		for j in 14:
			var b := (float(j) / 14) * PI * 2.0
			var wob := 1.0 + 0.18 * sin(b * 3.0 + i)
			sea.append([sx + cos(a) * d + cos(b) * rr * wob, cy + sin(a) * d + sin(b) * rr * wob * 0.9])
		fill(g, [sea], _c("moon", 2) if i % 3 else _c("moon", 1), k * 0.38)
	rim(g, disc, _c("moon", 4), k, 1.0)
	g.set_alpha(was)
	if spot != null:
		spot.call(sx, cy, 170.0, 0.32 * k)
		spot.call(sx, cy, 80.0, 0.3 * k)


static func _ellipse_ring(lay: Callable, b: Dictionary, n: int) -> Array:
	var out: Array = []
	for i in n:
		var a := (float(i) / n) * PI * 2.0
		out.append(lay.call(float(b["u"]) + cos(a) * float(b["ru"]), float(b["v"]) + sin(a) * float(b["rv"])))
	return out


## Her shadow's outline on the screen: its wings' and its body's, each a closed run (size `s` of its whole).
static func shadow_shapes(lay: Callable, s: float) -> Array:
	var S := eclipse_shape(s)
	var out: Array = []
	for w in S["wings"]:
		out.append(_laid(lay, flat_rim(w, 40)))
	for b in S["body"]:
		out.append(_ellipse_ring(lay, b, 20))
	return out


## The outline of her whole shadow (each shape's edge where no other shape lies over it), dots on the screen, in order round each.
static func shadow_edge(S: Dictionary, lay: Callable) -> Array:
	var wings: Array = S["wings"]
	var body: Array = S["body"]
	var in_other := func(u: float, v: float, other: int) -> bool:
		for j in wings.size():
			if j != other and in_flat(wings[j], u, v) > 0.004:
				return true
		for j in body.size():
			var b: Dictionary = body[j]
			var p: float = (u - float(b["u"])) / float(b["ru"])
			var q: float = (v - float(b["v"])) / float(b["rv"])
			if j + wings.size() != other and p * p + q * q < 0.97:
				return true
		return false
	var out: Array = []
	var keep := func(run: Array, i: int) -> void:
		for k in run.size():
			var A: Array = run[k]
			var B: Array = run[(k + 1) % run.size()]
			var au: float = A[0]
			var av: float = A[1]
			var bu: float = B[0]
			var bv: float = B[1]
			var n := maxi(1, int(_rnd(_hypot(bu - au, bv - av) / 0.07)))
			for s in n:
				var u := au + ((bu - au) * s) / n
				var v := av + ((bv - av) * s) / n
				if not in_other.call(u, v, i):
					out.append(lay.call(u, v))
	for i in wings.size():
		keep.call(flat_rim(wings[i], 40), i)
	for j in body.size():
		var b: Dictionary = body[j]
		var run: Array = []
		for i in 24:
			var a := (float(i) / 24) * PI * 2.0
			run.append([float(b["u"]) + cos(a) * float(b["ru"]), float(b["v"]) + sin(a) * float(b["rv"])])
		keep.call(run, wings.size() + j)
	return out


## The enemy's pink warning on a run of dots already spaced: dashed, marching, brightening as the blow comes.
static func warn_dots(g: Pen, pts: Array, k: float, t: float) -> void:
	var was := g.alpha
	g.set_alpha(was * (0.45 + 0.55 * k))
	for j in pts.size():
		if (floori(float(j) / 4.0 - t * 9.0) & 1) == 0:
			continue
		dot(g, pts[j][0], pts[j][1], _c("flame", 3) if k > 0.75 else _c("flame", 2), 2, 1)
	g.set_alpha(was)


## HER SHADOW, cast from (x, y) along (ax, ay), `t` seconds into her Eyes' move (on after the blow too), (hx, hy) on the screen where
## he is (her eyes in it follow him), `clock` the screen's; `part` "floor" (the shadow, its edge, its eyes), "rising" (the darkness
## rising out of it) or "all".
static func draw_eclipse(g: Pen, at: Callable, x: float, y: float, ax: float, ay: float, t: float, hx: float, hy: float, clock: float, spot = null, part := "all") -> void:
	var E: Dictionary = data()["eclipse"]
	var after := t - float(E["hit"])
	if t < float(E["grow"][0]) or after > float(E["after"]):
		return
	var s := eclipse_size(t)
	var lay := lay_of(at, x, y, ax, ay, 0.0)
	var shapes := shadow_shapes(lay, s)
	# (darkening as it grows; black as it strikes; gone up out of it after)
	var gone := _sm((after - 0.45) / (float(E["after"]) - 0.45))
	var dark := 0.25 + 0.5 * _sm((t - float(E["grow"][0])) / 0.9) if after < 0.0 else 0.92 * (1.0 - gone)
	var on_floor := part != "rising"
	# (its edge soft: a penumbra a little wider, the Hush's violet in it)
	if on_floor:
		fill_union(g, shadow_shapes(lay_of(at, x, y, ax, ay, 0.0), s * 1.07), _c("dark", 2), dark * 0.4)
	if on_floor:
		fill_union(g, shapes, _c("dark", 0), dark)
	# (its edge, the outline of the whole of it: the moonlight round it, and the warning on it till the blow)
	var S := eclipse_shape(s)
	if on_floor and after < 0.0:
		var edge := shadow_edge(S, lay)
		rim(g, edge, _c("ghost", 4), 0.25, 1.0, 0.5, 9)
		if t >= float(E["warn"]):
			warn_dots(g, edge, _c01((t - float(E["warn"])) / (float(E["hit"]) - float(E["warn"]))), clock)
	# (darkness rising out of it as it waits: thin wisps; as it strikes, a whole wall of them, then motes going up)
	var rims: Array = []
	for w in S["wings"]:
		rims.append(flat_rim(w, 30))
	var was := g.alpha
	var n := 0 if part == "floor" else (int(_rnd(30.0 + 40.0 * _sm((t - 0.5) / 0.6))) if after < 0.0 else 170)
	for i in n:
		var w: Dictionary = S["wings"][i % 4]
		var q: Array = rims[i % 4][floori(GP.hash(i, 1, 7331) * 30.0)]
		var into := GP.hash(i, 2, 7331) * 0.8
		var u: float = float(w["root"][0]) + (float(q[0]) - float(w["root"][0])) * into
		var v: float = float(w["root"][1]) + (float(q[1]) - float(w["root"][1])) * into
		var sp: Array = lay.call(u, v)
		var sx: float = sp[0]
		var sy: float = sp[1]
		if after < 0.0:
			var life := fmod(clock * 0.7 + GP.hash(i, 3, 7331), 1.0)
			g.set_alpha(was * 0.5 * (1.0 - life) * dark)
			for k in 4:
				dot(g, sx, sy - life * 34.0 - k, _c("dark", 2))
		else:
			# (a wall of darkness thrown up out of it: plumes, dark at their feet, the Hush's grey-violet at their tops, curling)
			var life := _c01(after / (0.45 + 0.55 * GP.hash(i, 4, 7331)))
			var tall := (16.0 + 46.0 * GP.hash(i, 5, 7331)) * (0.35 + 0.65 * _ease_out(life / 0.4)) * (1.0 - 0.4 * life)
			var lift := _ease_out(life) * 26.0
			var curl := sin(after * 5.0 + i) * 4.0 * life
			var gone2 := 1.0 - _sm((life - 0.45) / 0.55)
			var k := 0
			while k < tall:
				var f := k / tall
				# (thinning as it rises: fewer of its grains, and curling)
				if GP.hash(i, k, 7332) < f * 0.75:
					k += 1
					continue
				g.set_alpha(was * gone2 * (0.95 - 0.55 * f))
				dot(g, sx + curl * f + sin(f * 7.0 + i + after * 3.0) * 2.5 * f, sy - lift - k, _c("dark", 0) if f < 0.4 else (_c("dark", 2) if f < 0.75 else _c("ghost", 2)), 2 if f < 0.3 else 1, 1)
				k += 1
			if i % 3 == 0 and life > 0.25:
				g.set_alpha(was * (1.0 - life))
				dot(g, sx + sin(after * 4.0 + i) * 7.0, sy - lift - tall - 6.0 - life * 30.0, _c("ghost", 5) if i % 2 else _c("moon", 4))
	g.set_alpha(was)
	# (the eyes of her wings in it: opening as it waits, following him; burning as it strikes, then shutting)
	var open := _sm((t - 0.45) / 0.55) if after < 0.0 else (1.3 if after < 0.35 else 1.3 * (1.0 - _sm((after - 0.35) / 0.35)))
	if on_floor:
		for w in S["wings"]:
			var e := flat_eye(w)
			flat_eye_drawn(g, lay, e["u"], e["v"], float(e["r"]) * 1.45, open, hx, hy, 0.95 if after < 0.0 else 1.0 - gone, spot)
	if spot != null and on_floor and after >= 0.0 and after < 0.3:
		var c: Array = lay.call(E["thorax"], 0.0)
		spot.call(c[0], c[1], 160.0, 0.4 * (1.0 - after / 0.3))


# =====================================================================================================================
# PHANTOMS

## A phantom of her: a gliding moth of pale light, (x, y) where its thorax is over the floor, along (ax, ay), `h` up, its wings at
## `beat`.
static func draw_phantom(g: Pen, at: Callable, x: float, y: float, ax: float, ay: float, h: float, beat: float, alpha: float, seed: int, solid: bool, spot = null) -> void:
	if alpha <= 0.01:
		return
	var P: Dictionary = data()["phantoms"]
	var lay := lay_of(at, x, y, ax, ay, h, beat)
	var wings := flat_wings(0.0, P["fore"], P["hind"], 82.0, 124.0)
	for w in wings:
		var pts := _laid(lay, flat_rim(w, 36))
		if solid:
			fill(g, [pts], _c("ghost", 3), 0.45 * alpha)
			var band := _laid(lay, flat_rim(_with_len(w, float(w["len"]) * 0.62), 24))
			fill(g, [band], _c("ghost", 4), 0.22 * alpha)
		rim(g, pts, _c("ghost", 5), (1.0 if solid else 0.55) * alpha, 1.2, 0.05 if solid else 0.4, seed + (2 if w["hind"] else 1), 2 if solid and not w["hind"] else 1)
		if solid:
			var e := flat_eye(w)
			var c: Array = lay.call(e["u"], e["v"])
			var ex: float = c[0]
			var ey: float = c[1]
			dot(g, ex - 1.0, ey - 1.0, _c("flame", 2), 2, 2)
			dot(g, ex, ey, _c("flame", 4), 1, 1)
			if spot != null:
				spot.call(ex, ey, 14.0, 0.25 * alpha)
	if solid:
		for b in flat_body(0.0, 0.45):
			fill(g, [_ellipse_ring(lay, b, 14)], _c("ghost", 4), 0.5 * alpha)
		if spot != null:
			var c: Array = lay.call(0.0, 0.0)
			spot.call(c[0], c[1], 50.0, 0.22 * alpha)


## Copies of her shimmering off her as she wraps her wings round herself (`k`: how far they have come).
static func draw_phantoms_gather(g: Pen, at: Callable, x: float, y: float, ax: float, ay: float, k: float, high: float, clock: float) -> void:
	if k <= 0.01:
		return
	for i in int(data()["phantoms"]["n"]):
		var w := phantom_way(ax, ay, i)
		var wx: float = w[0]
		var wy: float = w[1]
		# (each drawn a little out of her toward its own lane, flickering)
		var out := 0.3 + 0.6 * k + 0.15 * sin(clock * 7.0 + i * 2)
		var flick := 0.4 if GP.hash(i, floori(clock * 14.0), 7341) < 0.2 else 1.0
		draw_phantom(g, at, x + wx * out, y + wy * out, wx, wy, high + 10.0 * sin(clock * 3.0 + i), 0.5 * sin(clock * 5.0 + i), 0.85 * k * flick, 40 + i, k > 0.55)


## THE PHANTOMS `t` seconds after her Swarm's burst, from (x, y) aimed at (ax, ay).
static func draw_phantoms(g: Pen, at: Callable, x: float, y: float, ax: float, ay: float, t: float, spot = null) -> void:
	var P: Dictionary = data()["phantoms"]
	var start: float = P["start"]
	for i in int(P["n"]):
		var s := phantom_along(i, t)
		var w := phantom_way(ax, ay, i)
		var wx: float = w[0]
		var wy: float = w[1]
		var end := (s - float(P["long"])) / (0.3 * float(P["speed"]))
		if s < 0.0 or end > 1.0:
			continue
		var alpha := (1.0 - _c01(end)) * _sm((s - start + 0.3) / 1.2 + 0.4)
		var beat := 0.55 * sin(t * 8.0 + i * 1.7)
		var h := float(P["high"]) + 8.0 * sin(t * 4.0 + i) - 6.0 * cos(t * 8.0 + i * 1.7)
		# (its after-images, behind it, thinning)
		for j in [3, 2, 1]:
			var sj: float = s - j * 0.75
			if sj < start:
				continue
			draw_phantom(g, at, x + wx * sj, y + wy * sj, wx, wy, h, 0.55 * sin((t - j * 0.07) * 8.0 + i * 1.7), alpha * (0.4 - j * 0.11), 60 + i * 5 + j, false)
		# (scales falling off it as it goes, settling)
		var was := g.alpha
		for k in 24:
			var back := GP.hash(k, i, 7342) * 3.5
			var sk := s - back
			if sk < start:
				continue
			var fall := back / 3.5
			var side := (GP.hash(k, i + 9, 7342) - 0.5) * 2.4
			var p: Array = at.call(x + wx * sk - wy * side, y + wy * sk + wx * side)
			g.set_alpha(was * alpha * (1.0 - fall) * 0.8)
			dot(g, p[0], float(p[1]) - h * (1.0 - fall), _c("flame", 1) if k % 6 == 0 else _c("ghost", 4 if k % 2 else 5))
		g.set_alpha(was)
		draw_phantom(g, at, x + wx * s, y + wy * s, wx, wy, h, beat, alpha, 50 + i, true, spot)


# =====================================================================================================================
# THE HUSH (her Dust; and what she sheds over him)

## Its haze and its letters, on the floor about (x, y), `R` tiles across its middle, `t` seconds after it was shaken off.
static func draw_hush_ground(g: Pen, at: Callable, x: float, y: float, R: float, t: float, clock: float, spot = null) -> void:
	var H: Dictionary = data()["hushFx"]
	var end: float = float(H["fall"]) + float(H["hold"]) + float(H["fade"])
	if t < 0.0 or t > end:
		return
	var thin := _sm((t - float(H["fall"]) - float(H["hold"])) / float(H["fade"]))
	var haze := _sm((t - 0.35) / (float(H["fall"]) - 0.2)) * (1.0 - thin)
	if haze <= 0.01:
		return
	var ragged: Array = []
	for i in 40:
		var a := (float(i) / 40) * PI * 2.0
		var rr := R * (1.0 + 0.07 * sin(a * 5.0 + 1.0) + 0.05 * sin(a * 11.0 + clock * 0.4))
		ragged.append(at.call(x + cos(a) * rr, y + sin(a) * rr))
	fill(g, [ragged], _c("ghost", 2), 0.36 * haze)
	fill(g, [floor_circle(at, x, y, R * 0.62, 0.0, 28)], _c("ghost", 3), 0.18 * haze)
	# (its edge: a slow ring of light going round)
	var was := g.alpha
	for i in ragged.size():
		var A: Array = ragged[i]
		var B: Array = ragged[(i + 1) % ragged.size()]
		for k in 4:
			if GP.hash(i * 4 + k, floori(clock * 3.0 + i * 0.2), 7351) < 0.45:
				continue
			g.set_alpha(was * 0.5 * haze)
			dot(g, float(A[0]) + ((float(B[0]) - float(A[0])) * k) / 4.0, float(A[1]) + ((float(B[1]) - float(A[1])) * k) / 4.0, _c("ghost", 5))
	# (letters in it, his words: glowing, going dark, crumbling away)
	var letters: Array = data()["letters"]
	for i in 16:
		var period := 1.7 + 0.6 * GP.hash(i, 1, 7352)
		var life := fmod((clock + GP.hash(i, 2, 7352) * period) / period, 1.0)
		var cycle := floori((clock + GP.hash(i, 2, 7352) * period) / period)
		var a := GP.hash(i, cycle, 7353) * PI * 2.0
		var d := sqrt(GP.hash(i, cycle, 7354)) * R * 0.8
		var L: Array = at.call(x + cos(a) * d, y + sin(a) * d)
		var lx: float = L[0]
		var ly: float = L[1]
		var glyph: String = letters[floori(GP.hash(i, cycle, 7355) * letters.size())]
		var col := _c("ghost", 5) if life < 0.35 else (_c("ghost", 3) if life < 0.6 else _c("dark", 1))
		for j in 15:
			if glyph[j] != "1":
				continue
			# (crumbling: its pieces gone one by one, falling)
			if life > 0.7 and GP.hash(i * 15 + j, cycle, 7356) < (life - 0.7) / 0.3:
				continue
			g.set_alpha(was * haze * (life / 0.1 if life < 0.1 else 1.0) * 0.9)
			dot(g, lx - 3.0 + (j % 3) * 2, ly - 5.0 + floori(j / 3.0) * 2 + ((life - 0.7) * 6.0 if life > 0.7 else 0.0), col, 2, 2)
		if spot != null and life < 0.35:
			spot.call(lx, ly, 12.0, 0.1 * haze)
	# (light lifting off it)
	for i in 36:
		var a := GP.hash(i, 1, 7357) * PI * 2.0
		var d := sqrt(GP.hash(i, 2, 7357)) * R * 0.95
		var M: Array = at.call(x + cos(a) * d, y + sin(a) * d)
		var life := fmod(clock * (0.35 + 0.3 * GP.hash(i, 3, 7357)) + GP.hash(i, 4, 7357), 1.0)
		g.set_alpha(was * haze * (1.0 - life) * 0.8)
		dot(g, float(M[0]) + sin(life * 6.0 + i) * 2.0, float(M[1]) - life * 40.0, _c("flame", 1) if i % 7 == 0 else _c("ghost", 5))
	g.set_alpha(was)
	if spot != null:
		var c: Array = at.call(x, y)
		spot.call(c[0], c[1], R * 22.0, 0.14 * haze)


## Its scales falling like slow snow over (x, y), `R` tiles about it, `t` seconds after it was shaken off.
static func draw_hush_snow(g: Pen, at: Callable, x: float, y: float, R: float, t: float, spot = null) -> void:
	var H: Dictionary = data()["hushFx"]
	var end: float = float(H["fall"]) + float(H["hold"]) + float(H["fade"])
	if t < -0.2 or t > end:
		return
	var thin := _sm((t - float(H["fall"]) - float(H["hold"])) / float(H["fade"]))
	var was := g.alpha
	for i in 320:
		var a := GP.hash(i, 1, 7361) * PI * 2.0
		var d := sqrt(GP.hash(i, 2, 7361)) * R * 0.97
		var delay := 0.5 * GP.hash(i, 3, 7361)
		var fall := 0.9 + 0.6 * GP.hash(i, 4, 7361)
		var k := (t - delay) / fall
		if k < 0.0 or k > 1.2:
			continue
		var z0 := 110.0 + 130.0 * GP.hash(i, 5, 7361)
		var z := z0 * pow(1.0 - _c01(k), 1.6)
		var sway := 7.0 * sin(t * (3.0 + 2.0 * GP.hash(i, 6, 7361)) + i) * (1.0 - _c01(k))
		var p: Array = at.call(x + cos(a) * d, y + sin(a) * d)
		# (twinkling as it turns; settled, a last glint)
		if GP.hash(i, floori(t * 12.0), 7362) < 0.18:
			continue
		var c := GP.hash(i, 7, 7361)
		var col := _c("flame", 1) if c < 0.05 else (_c("moon", 4) if c < 0.15 else (_c("ghost", 4) if c < 0.45 else _c("ghost", 5)))
		g.set_alpha(was * ((1.2 - k) / 0.2 if k > 1.0 else 0.95))
		dot(g, float(p[0]) + sway, float(p[1]) - z, col, 1, 2 if k < 0.6 and GP.hash(i, 8, 7361) < 0.3 else 1)
	# (and lingering, a few still drifting down through the haze)
	for i in 40:
		if t < float(H["fall"]):
			break
		var a := GP.hash(i, 9, 7361) * PI * 2.0
		var d := sqrt(GP.hash(i, 10, 7361)) * R * 0.9
		var life := fmod(t * 0.28 + GP.hash(i, 11, 7361), 1.0)
		var p: Array = at.call(x + cos(a) * d, y + sin(a) * d)
		g.set_alpha(was * (1.0 - thin) * 0.75 * sin(PI * life))
		dot(g, float(p[0]) + 5.0 * sin(t * 2.0 + i), float(p[1]) - 70.0 * (1.0 - life), _c("ghost", 5) if i % 3 else _c("ghost", 4))
	g.set_alpha(was)
	if spot != null and t < float(H["fall"]) + 0.5:
		var c: Array = at.call(x, y)
		spot.call(c[0], float(c[1]) - 60.0, R * 20.0, 0.12)


# =====================================================================================================================
# THE UNWRITING (on the book)

## Pages tearing loose from the chapter as she rears (`k`: 0 to 1 through her wind-up), about (bx, by), the book on the floor.
static func draw_pages_loosing(g: Pen, at: Callable, bx: float, by: float, k: float, clock: float, spot = null) -> void:
	if k <= 0.01:
		return
	for i in 12:
		var own := _c01(k * 1.4 - GP.hash(i, 1, 7371) * 0.4)
		if own <= 0.0:
			continue
		var a := GP.hash(i, 2, 7371) * PI * 2.0 + clock * (1.6 + GP.hash(i, 3, 7371))
		var r := 0.3 + 1.6 * own
		var h := 4.0 + 46.0 * own + 6.0 * sin(clock * 5.0 + i)
		page(g, at, bx + cos(a) * r, by + sin(a) * r, h, a + clock * 3.0, clock * (4.0 + 3.0 * GP.hash(i, 4, 7371)) + i, own, (own - 0.6) / 0.4 if own > 0.6 else 0.0, i, spot)


## A page of the chapter at (x, y), `h` up, turned to `turn` about the floor and flipping (`flip`), `burn` its edge alight (0 to 1).
static func page(g: Pen, at: Callable, x: float, y: float, h: float, turn: float, flip: float, alpha: float, burn: float, seed: int, spot = null) -> void:
	var w := 0.27 * maxf(0.15, absf(cos(flip)))
	var l := 0.36
	var ca := cos(turn)
	var sa := sin(turn)
	var P := func(a: float, b: float) -> Array:
		var s: Array = at.call(x + ca * a - sa * b, y + sa * a + ca * b)
		# (a page flipping stands up off the floor as it turns)
		return [s[0], float(s[1]) - h - sin(flip) * b * 30.0]
	var q: Array = [P.call(-l, -w), P.call(l, -w), P.call(l, w), P.call(-l, w)]
	fill(g, [q], _c("page", 3) if cos(flip) > 0.0 else _c("page", 2), 0.85 * alpha)
	# (its lines of writing, faded)
	var was := g.alpha
	for r in 3:
		var A: Array = P.call(-l * 0.7, -w * 0.6 + r * w * 0.6)
		var B: Array = P.call(l * (0.3 + 0.4 * GP.hash(seed, r, 7372)), -w * 0.6 + r * w * 0.6)
		var ax: float = A[0]
		var ay: float = A[1]
		var bx: float = B[0]
		var by: float = B[1]
		g.set_alpha(was * 0.6 * alpha)
		var n := maxi(1, int(_rnd(_hypot(bx - ax, by - ay))))
		for s in n:
			if GP.hash(s, r + seed, 7373) > 0.3:
				dot(g, ax + ((bx - ax) * s) / n, ay + ((by - ay) * s) / n, _c("page", 1))
	g.set_alpha(was)
	rim(g, q, _c("ghost", 5), 0.7 * alpha, 1.0, 0.2, seed)
	if burn > 0.0:
		# (its far edge burning: the enemy's pink and gold, embers off it)
		var ax: float = q[1][0]
		var ay: float = q[1][1]
		var bx: float = q[2][0]
		var by: float = q[2][1]
		g.set_alpha(was * alpha)
		for s in 7:
			dot(g, ax + ((bx - ax) * s) / 6.0, ay + ((by - ay) * s) / 6.0, _c("flame", 2) if s % 2 else _c("flame", 3))
		for e in 4:
			var life := fmod(flip * 0.3 + GP.hash(seed, e, 7374), 1.0)
			g.set_alpha(was * alpha * burn * (1.0 - life))
			dot(g, bx + sin(life * 9.0 + e) * 3.0, by - life * 16.0, _c("flame", 3) if e % 2 else _c("flame", 2))
		g.set_alpha(was)
		if spot != null:
			spot.call(bx, by, 16.0, 0.2 * alpha * burn)


## THE RING OF PAGES' ground, `R` tiles out from (x, y) (its band, where it strikes, `wide` either side of R).
static func draw_unwriting_ground(g: Pen, at: Callable, x: float, y: float, R: float, wide: float, fade: float) -> void:
	if fade <= 0.01:
		return
	var outer := floor_circle(at, x, y, R + wide * 0.4, 0.0, 48)
	var inner := floor_circle(at, x, y, maxf(0.2, R - wide), 0.0, 48)
	fill(g, [outer, inner], _c("ghost", 2), 0.2 * fade)
	rim(g, outer, _c("ghost", 5), 0.6 * fade, 1.5, 0.3, 11)


## THE RING OF PAGES `t` seconds after she beats down, `R` tiles out from (x, y).
static func draw_unwriting_pages(g: Pen, at: Callable, x: float, y: float, R: float, t: float, fade: float, spot = null) -> void:
	if fade <= 0.01:
		return
	var N := 56
	for i in N:
		var a := ((i + GP.hash(i, 1, 7381) * 0.6) / N) * PI * 2.0 + t * 0.9
		var r := R + (GP.hash(i, 2, 7381) - 0.65) * 1.1
		var h := 8.0 + 28.0 * GP.hash(i, 3, 7381) + 10.0 * sin(t * 7.0 + i)
		var burn := _c01(t / 0.9 + GP.hash(i, 4, 7381) * 0.4)
		page(g, at, x + cos(a) * r, y + sin(a) * r, h, a + PI / 2.0, t * (6.0 + 4.0 * GP.hash(i, 5, 7381)) + i, fade * (1.0 - 0.5 * burn * _sm((t - 0.6) / 0.6)), burn, i, spot if i % 4 == 0 else null)
	# (embers and ash off the ring, rising)
	var was := g.alpha
	for i in 70:
		var a := GP.hash(i, 6, 7381) * PI * 2.0
		var back := GP.hash(i, 7, 7381) * 1.4
		var E: Array = at.call(x + cos(a) * maxf(0.0, R - back), y + sin(a) * maxf(0.0, R - back))
		g.set_alpha(was * fade * (1.0 - back / 1.4))
		dot(g, E[0], float(E[1]) - 10.0 - back * 22.0, _c("flame", 2) if i % 3 == 0 else (_c("flame", 3) if i % 3 == 1 else _c("ghost", 5)))
	g.set_alpha(was)


# =====================================================================================================================
# HER DEATH

## THE LIGHT SHE COMES APART INTO, over the dark: motes rising off her wings and body as they crumble (`t` seconds into her death,
## `from(i)` where on the screen mote `i` leaves her: her own lengths, `motes` of moth.json, laid on the floor).
static func draw_death_motes(g: Pen, t: float, from: Callable) -> void:
	var c0: float = data()["dies"]["crumble"][0]
	var c1: float = data()["dies"]["crumble"][1]
	if t < c0 or t > c1 + 2.2:
		return
	var motes: Array = data()["motes"]
	var was := g.alpha
	for i in 220:
		var born: float = motes[i]["born"]
		var life := 1.2 + 1.0 * GP.hash(i, 2, 7395)
		var age := t - born
		if age < 0.0 or age > life:
			continue
		var src = from.call(i)
		if src == null:
			continue
		var u := age / life
		var x: float = float(src[0]) + sin(age * 2.2 + i) * 9.0 * u + (GP.hash(i, 3, 7395) - 0.5) * 18.0 * u
		var y: float = float(src[1]) - age * 38.0 - age * age * 16.0
		if GP.hash(i, floori(t * 14.0), 7396) < 0.15:
			continue
		var c := GP.hash(i, 4, 7395)
		g.set_alpha(was * (1.0 - u * u) * 0.95)
		var big := u < 0.5 and GP.hash(i, 5, 7395) < 0.45
		dot(g, x, y, _c("flame", 2) if c < 0.08 else (_c("moon", 4) if c < 0.4 else (_c("ghost", 5) if c < 0.75 else _c("ghost", 4))), 2 if big else 1, 2 if big else 1)
	g.set_alpha(was)


## Lights as she comes apart (`k`: how far she has crumbled), about (sx, sy) on the screen, her middle.
static func death_lights(sx: float, sy: float, k: float, clock: float, spot: Callable) -> void:
	if k <= 0.0 or k >= 1.0:
		return
	for i in 5:
		var a := GP.hash(i, 1, 7391) * PI * 2.0 + clock * 0.3
		var d := 30.0 + 90.0 * GP.hash(i, 2, 7391)
		spot.call(sx + cos(a) * d, sy - 60.0 - k * 80.0 * GP.hash(i, 3, 7391) + sin(a) * d * 0.5, 70.0, 0.22 * sin(PI * k))


## THE WORDS SHE SWALLOWED FLYING HOME, `t` seconds into her death (art/moth_fx.ts wordsPainted: out of her mouth, up and away over
## the top in every way, thinning out far off), seen from in front or from behind (`back`): each game pixel of them, from her floor
## point, [x, y, colour], the later laid over the earlier.
static func words_at(t: float, back: bool) -> Array:
	var D := data()
	var R: Array = D["rows"]["back" if back else "front"]
	var ax: float = D["fxCanvas"]["ax"]
	var ay: float = D["fxCanvas"]["ay"]
	var out: Array = []
	var words: Array = D["words"]
	for i in words.size():
		var w: Dictionary = words[i]
		var age: float = t - float(w["born"])
		if age < 0.0 or age > 2.2:
			continue
		var rune: Dictionary = D["runes"][w["word"]]
		var rows: Array = rune["rows"]
		if rows.is_empty():
			continue
		var o: Array = w["mouth"]
		var a: float = w["a"]
		var far: float = w["far"]
		var k := _ease_out(age / 2.2)
		# (up out of it, then out and away, home)
		var p := [float(o[0]) + cos(a) * far * k, float(o[1]) + sin(a) * far * k, float(o[2]) + 110.0 * sin(PI * minf(1.0, age / 1.4)) + 40.0 * age]
		if age > 1.8 and (i + floori(age * 30.0)) % 2:
			continue
		var sx: float = ax + float(R[0][0]) * p[0] + float(R[0][1]) * p[1] + float(R[0][2]) * p[2]
		var sy: float = ay + float(R[1][0]) * p[0] + float(R[1][1]) * p[1] + float(R[1][2]) * p[2]
		var x0 := _rnd(sx / 2.0) * 2.0 - 6.0
		var y0 := _rnd(sy / 2.0) * 2.0 - 6.0
		for gy in rows.size():
			var row: String = rows[gy]
			for gx in row.length():
				var ch := row[gx]
				if ch == ".":
					continue
				out.append([int((x0 + gx * 2 - ax) / 2.0), int((y0 + gy * 2 - ay) / 2.0), rune["glow"] if ch == "o" else rune["color"]])
	return out


## The words flying home drawn at (sx, sy), her floor point on the screen (game pixels), mirrored where her picture is (`flip`).
static func draw_words(g: Pen, sx: float, sy: float, t: float, back: bool, flip: bool) -> void:
	var was := g.alpha
	g.set_alpha(1.0)
	for c in words_at(t, back):
		var dx: int = c[0]
		dot(g, sx + (-dx - 1 if flip else dx), sy + int(c[1]), c[2])
	g.set_alpha(was)
