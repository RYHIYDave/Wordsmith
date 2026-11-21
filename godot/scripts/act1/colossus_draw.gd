## THE SWAMP COLOSSUS'S FIGHT DRAWN (render/act1_fx/colossus.ts, render/act1_fx/colossus_fx.ts; COLOSSUS on): him and his tentacles in
## the art chat's own baked pictures (colossus_art.gd: his lurk, stand, entrance, shovel, bile, gaze, slide, phase 3, death; each
## tentacle's stand, burst, slams, water slam, duck, flinches, sinking and coming up, death), and round them what the game itself paints
## a frame at a time (the art chat's README: “The waves, the crash, the warnings, cracks, chunks, goo and ichor are yours to draw”), its
## painters brought over line for line: on the stone, where a slam lands the stone split and slabs tipped up, the slime dragged back
## along it, the stone wet where a wave has passed, his bile's pools, his gaze's scorch, the rings on the water round him and his
## tentacles, a water slam's rings, his waking's bubbles; over it, each wave's wall of black water and its white crest, the crash's
## plume and its foam, the slams' chunks and goo, the water slams' crowns, his glob of bile and its splash, his gaze's beam; the
## warnings (the enemy's pink flaring to its gold): each slam's line, a water slam's over the whole stone, the bile's ring, the gaze's
## arc, the eye slam's circle, his snap's reach, the siege's bolts' circles. In phase 3 his grip's cracks, his eye's, the bolts'
## scorches; the bolts falling and bursting, what his eye's slam and his grip fling up, his eye's ichor. His death's water, bones,
## sludge and gore; its burst, spray, ropes and teeth. Where a picture is not here yet, the game's plain stand-ins. Nothing cyan.
## All of it drawn from one mark kept by the hero ("eye:fight", colossus.gd), in game pixels on a canvas scaled two to one: `ground`
## under the figures (perils.gd draw), `air` over them (perils.gd's air layer).
## (Left out: the cult's pillars' fire and lines, a pillar toppling, a piece set, and his ward round him, which come with the descent's
## quest's pillars; with none standing, as here, the game draws none of them.)
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const F := preload("res://scripts/act1/colossus_fight.gd")
const Art := preload("res://scripts/act1/colossus_art.gd")

const PINK := Color("#ff3d8b")
const GOLD := Color("#ffc23d")
const FLESH := Color("#2e3a2b")
const FLESH_LIT := Color("#4b5a3e")
const FOAM := Color(214 / 255.0, 226 / 255.0, 214 / 255.0, 0.85)
## (colossus_fx.ts: game pixels up for each tile of height; its colours)
const UP := 19.6
const C_WATER := Color8(14, 22, 18)
const C_DEEP := Color8(8, 14, 11)
const C_WAVE := Color8(22, 36, 30)
const C_LIT := Color8(58, 82, 70)
const C_FOAM := [Color("#5a6a60"), Color("#8e9c92"), Color("#c4cec4"), Color("#e8eee6")]
const C_STONE := [Color("#2a2830"), Color("#3c3944"), Color("#57525e"), Color("#77717e")]
const C_CRACK := Color("#141218")
const C_GOO := [Color("#1c2412"), Color("#2e3a1c"), Color("#4a5a2a"), Color("#6e7c3a")]
const C_SLIME := Color8(70, 92, 44)
const C_BILE := [Color("#0c0c06"), Color("#25270c"), Color("#4a4e14"), Color("#7a7c1e"), Color("#b4ac34")]
const C_BURN := [Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0")]
const C_BEAM := [Color("#7a1058"), Color("#c0206a"), Color("#ff4f8a"), Color("#ffb070"), Color("#fff0a0"), Color("#fffbe8")]
const C_SCORCH := Color8(24, 12, 16)
const FIRE := [Color("#7a1058"), Color("#c0206a"), Color("#ff3d8b"), Color("#ffb070"), Color("#fff0a0")]
const ICHOR := [Color("#0a0408"), Color("#1e0a14"), Color("#3a1020"), Color("#5a1a2c")]


# --- the painters' own noise (colossus_fx.ts h, n1) ---

static func _imul(a: int, b: int) -> int:
	# (32-bit multiply, as Math.imul)
	var r := (a * b) & 0xffffffff
	return r - 0x100000000 if r >= 0x80000000 else r


static func _i32(x: float) -> int:
	# (x | 0)
	var v := int(x) & 0xffffffff
	return v - 0x100000000 if v >= 0x80000000 else v


## A hash of numbers, 0 to 1.
static func h(a: float, b: float = 0.0, c: float = 0.0) -> float:
	var x := (_imul(_i32(a), 374761393) + _imul(_i32(b), 668265263) + _imul(_i32(c), 2147483647)) & 0xffffffff
	x = x - 0x100000000 if x >= 0x80000000 else x
	x = _imul(x ^ ((x & 0xffffffff) >> 13), 1274126177)
	x = x ^ ((x & 0xffffffff) >> 16)
	return float(x & 0xffffffff) / 4294967296.0


## Smooth noise along `x`, 0 to 1.
static func n1(x: float, s: float) -> float:
	var i := floorf(x)
	var fr := x - i
	var u := fr * fr * (3.0 - 2.0 * fr)
	return h(i, s) * (1.0 - u) + h(i + 1.0, s) * u


static func sm(a: float, b: float, x: float) -> float:
	var u := clampf((x - a) / (b - a), 0.0, 1.0)
	return u * u * (3.0 - 2.0 * u)


# --- a canvas of the game's, on Godot's (the calls the painters make: fillRect, paths filled and stroked, ellipses, arcs, alpha) ---

class Cx:
	var c: CanvasItem
	var alpha := 1.0
	var fill := Color.WHITE
	var stroke := Color.WHITE
	var lw := 1.0
	var paths: Array = []
	var cur := PackedVector2Array()
	var _saved: Array = []

	func _init(on: CanvasItem) -> void:
		c = on

	func a(col: Color) -> Color:
		return Color(col.r, col.g, col.b, col.a * clampf(alpha, 0.0, 1.0))

	func save() -> void:
		_saved.append([alpha, fill, stroke, lw])

	func restore() -> void:
		var s: Array = _saved.pop_back()
		alpha = s[0]
		fill = s[1]
		stroke = s[2]
		lw = s[3]

	func rect(x: float, y: float, w: float, hh: float) -> void:
		if w > 0.0 and hh > 0.0 and alpha > 0.0:
			c.draw_rect(Rect2(x, y, w, hh), a(fill))

	func begin() -> void:
		paths = []
		cur = PackedVector2Array()

	func move(x: float, y: float) -> void:
		if cur.size() > 0:
			paths.append(cur)
		cur = PackedVector2Array([Vector2(x, y)])

	func line(x: float, y: float) -> void:
		cur.append(Vector2(x, y))

	func close() -> void:
		if cur.size() > 1:
			cur.append(cur[0])

	func ellipse(x: float, y: float, rx: float, ry: float, n := 20) -> void:
		move(x + rx, y)
		for i in range(1, n + 1):
			var t := TAU * i / n
			line(x + cos(t) * rx, y + sin(t) * ry)

	func arc(x: float, y: float, r: float) -> void:
		ellipse(x, y, r, r, maxi(12, int(r * 2.0)))

	func _all() -> Array:
		var out := paths.duplicate()
		if cur.size() > 0:
			out.append(cur)
		return out

	func do_fill() -> void:
		if alpha <= 0.0:
			return
		for p in _all():
			poly(p, a(fill))

	func do_stroke() -> void:
		if alpha <= 0.0:
			return
		for p in _all():
			if p.size() >= 2:
				c.draw_polyline(p, a(stroke), lw)

	## A polygon filled (one colour, or one for each point).
	func poly(p: PackedVector2Array, col: Color, cols := PackedColorArray()) -> void:
		var pts := p
		if pts.size() > 1 and pts[0].is_equal_approx(pts[pts.size() - 1]):
			pts = pts.slice(0, pts.size() - 1)
		if pts.size() < 3:
			return
		var idx := Geometry2D.triangulate_polygon(pts)
		if idx.is_empty():
			# (a ragged edge crossing itself: laid as a fan from its middle, as the canvas would fill it near enough)
			var mid := Vector2.ZERO
			for q in pts:
				mid += q
			mid /= pts.size()
			var fan := PackedVector2Array([mid])
			fan.append_array(pts)
			var fcols := PackedColorArray()
			if not cols.is_empty():
				var cm := Color(0, 0, 0, 0)
				for q in cols:
					cm += q
				fcols.append(cm / cols.size())
				fcols.append_array(cols.slice(0, pts.size()))
			idx = PackedInt32Array()
			for i in pts.size():
				idx.append_array([0, 1 + i, 1 + (i + 1) % pts.size()])
			pts = fan
			cols = fcols
		var colors := cols if cols.size() == pts.size() else PackedColorArray()
		if colors.is_empty():
			colors.resize(pts.size())
			colors.fill(col)
		RenderingServer.canvas_item_add_triangle_array(c.get_canvas_item(), idx, pts, colors)

	## A polygon filled with a gradient down the screen from `y0` to `y1` (stops [[k, Color], ...]).
	func poly_grad(p: PackedVector2Array, y0: float, y1: float, stops: Array) -> void:
		var cols := PackedColorArray()
		for q in p:
			var k := clampf((q.y - y0) / maxf(1e-6, y1 - y0), 0.0, 1.0)
			var col: Color = stops[0][1]
			for i in range(1, stops.size()):
				if k <= float(stops[i][0]):
					var k0: float = stops[i - 1][0]
					col = (stops[i - 1][1] as Color).lerp(stops[i][1], (k - k0) / maxf(1e-6, float(stops[i][0]) - k0))
					break
				col = stops[i][1]
			cols.append(a(col))
		poly(p, Color.WHITE, cols)

	## A closed line dashed (`pattern` [on, off]), its dashes running by `offset`.
	func dashed(p: PackedVector2Array, pattern: Array, offset: float) -> void:
		if alpha <= 0.0 or p.size() < 2:
			return
		var on := float(pattern[0])
		var period := on + float(pattern[1])
		var s := fposmod(offset, period)
		var col := a(stroke)
		for i in p.size() - 1:
			var A := p[i]
			var B := p[i + 1]
			var L := A.distance_to(B)
			var d := 0.0
			while d < L:
				var ph := fposmod(s + d, period)
				var step := (on - ph) if ph < on else (period - ph)
				step = minf(step, L - d)
				if ph < on:
					c.draw_line(A.lerp(B, d / L), A.lerp(B, (d + step) / L), col, lw)
				d += maxf(step, 1e-3)
			s += L


# --- WHAT IS KEPT of the fight here: its slams, water slams, splashes and scorches, the stone wet where each wave has been; in phase 3
# where his eye came down, where the bolts struck, when he gripped the stone's edge (colossus_fx.ts KEPT, keepColossusFx) ---

static var K := {}


static func _kept(list: Array, who: int, start: float, by: float):
	for q in list:
		if int(q["key"]) == who and absf(float(q["at"]) - by - start) < 0.05:
			return q
	return null


## What the fight leaves, looked at once a frame.
static func keep(f) -> void:
	if K.get("fight") != f:
		K = {"fight": f, "slams": [], "smashes": [], "splashes": [], "scorches": [], "wet": [], "eyeSlams": [], "bolts": [], "grip": INF}
	var now: float = f.time
	for a in f.arms:
		if a.state == "slam" and a.line != null and a.t >= F.SLAM["hit"]:
			var s = _kept(K["slams"], a.id, now - a.t, F.SLAM["hit"])
			if s == null:
				s = {"key": a.id, "at": now - (a.t - F.SLAM["hit"]), "line": a.line, "root": F.root_at(a.u), "seed": roundf(now * 7.0) * 97 + a.id * 13, "drag": INF}
				K["slams"].append(s)
			if a.t >= F.SLAM["lying"][1] - 0.55 and s["drag"] == INF:
				s["drag"] = now
		if a.state == "smash" and a.t >= F.SMASH["hit"]:
			if _kept(K["smashes"], a.id, now - a.t, F.SMASH["hit"]) == null:
				K["smashes"].append({"key": a.id, "at": now - (a.t - F.SMASH["hit"]), "u": -1.79 if a.side == "l" else F.STONE["w"] + 1.79, "v": 1.53, "seed": roundf(now * 7.0) * 31 + a.id})
	for w in f.waves:
		var had := false
		for q in K["wet"]:
			if q["from"] == w.from and absf(float(q["at"]) - (now - w.t)) < 0.05:
				had = true
		if not had:
			K["wet"].append({"from": w.from, "at": now - w.t, "meets": w.meets})
	var B = f.body2
	if B != null and B.kind == "bile" and B.landed and _kept(K["splashes"], 0, now - B.t, F.BODY2["bile"]["land"]) == null:
		K["splashes"].append({"key": 0, "at": now - (B.t - F.BODY2["bile"]["land"]), "u": B.at.x, "v": B.at.y, "seed": roundf(now * 7.0) * 53 + 7})
	var E = f.eye if f.eye != null else (B if B != null and B.kind == "gaze" else null)
	if E != null and E.kind == "gaze" and E.t >= F.GAZE["warn"]:
		var s = _kept(K["scorches"], 0, now - E.t, F.GAZE["warn"])
		if s == null:
			s = {"key": 0, "at": now - (E.t - F.GAZE["warn"]), "o": E.at, "a0": E.a0, "a1": E.a1, "to": E.a0, "done": INF}
			K["scorches"].append(s)
		var k := minf(1.0, (E.t - F.GAZE["warn"]) / F.GAZE["sweep"])
		s["to"] = E.a0 + (E.a1 - E.a0) * k
		if k >= 1.0 and s["done"] == INF:
			s["done"] = now
	var E3 = f.eye
	if E3 != null and E3.kind == "slam" and E3.landed and _kept(K["eyeSlams"], 0, now - E3.t, F.EYE_SLAM["hit"]) == null:
		K["eyeSlams"].append({"key": 0, "at": now - (E3.t - F.EYE_SLAM["hit"]), "u": E3.at.x, "v": E3.at.y, "seed": roundf(now * 7.0) * 41 + 3})
	for r in f.rains:
		if r.t < F.RAIN["warn"]:
			continue
		var had := false
		for q in K["bolts"]:
			if q["u"] == r.u and q["v"] == r.v and absf(float(q["at"]) - (now - (r.t - F.RAIN["warn"]))) < 0.05:
				had = true
		if not had:
			K["bolts"].append({"key": 0, "at": now - (r.t - F.RAIN["warn"]), "u": r.u, "v": r.v, "seed": roundf(now * 13.0) * 17 + K["bolts"].size()})
	if f.ph == 2 and f.mode == "change" and f.ph_t >= F.CHANGE3["grip"] and K["grip"] == INF:
		K["grip"] = now - (f.ph_t - F.CHANGE3["grip"])
	K["eyeSlams"] = K["eyeSlams"].filter(func(s): return now - float(s["at"]) < 6.0)
	K["bolts"] = K["bolts"].filter(func(s): return now - float(s["at"]) < 2.4)
	K["slams"] = K["slams"].filter(func(s): return now - float(s["at"]) < 7.2)
	K["smashes"] = K["smashes"].filter(func(s): return now - float(s["at"]) < 3.0)
	K["splashes"] = K["splashes"].filter(func(s): return now - float(s["at"]) < 1.6)
	K["scorches"] = K["scorches"].filter(func(s): return s["done"] == INF or now - float(s["done"]) < F.GAZE["long"] + 3.2)
	K["wet"] = K["wet"].filter(func(w): return now - float(w["at"]) < 8.0)


# --- the mark's calls (marks.gd hands "eye:fight" here) ---

static func mine(p: Dictionary) -> bool:
	return str(p.get("a1", "")) == "eye:fight"


static func _fight(p: Dictionary):
	var b = p.get("boss")
	if b == null or not is_instance_valid(b) or b.h2 == null:
		return null
	return b.h2.a1.get("fight")


## The stone's point (u, v) on the screen, game pixels, at the water's height.
static func _P(S: Vector2, u: float, v: float) -> Vector2:
	var w := F.stone_to_world(S, u, v)
	return Iso.to_screen(w.x, w.y) / 2.0


## His phase 3's tongue now: his eye's attack, his eye struck, or his droop; and its frame (colossusTongue3).
static func tongue3(f) -> Array:
	var E = f.eye
	if E != null and E.kind == "slam":
		return ["slam3.%d" % E.pic, floori(E.t * 30.0 + 1e-6)]
	if E != null and E.kind == "gaze":
		return ["gaze3.%d" % E.pic, floori(E.t * 30.0 + 1e-6)]
	if not f.struck.is_empty():
		return ["struck3.%d" % int(f.struck["from"]), floori(float(f.struck["t"]) * 30.0 + 1e-6)]
	return ["p3tongue", floori(f.body * 30.0 + 1e-6) % 90]


## (GAZE2_AIMED) His phase 2 gaze aimed now: its tongue's pictures and frame, and his body's frame under it; empty: none.
static func gaze2(f) -> Dictionary:
	var B = f.body2
	if not F.GAZE2_AIMED or f.ph != 2 or B == null or B.kind != "gaze" or B.pic < 0:
		return {}
	var k := floori(B.t * 30.0 + 1e-6)
	return {"mv": "gaze2.%d" % B.pic, "k": k, "body": (Art.P2_AT + k) % 90}


## His light in the place's dark, from his place, coming up with his eye's fire as he wakes; and as he dies, going out as he melts.
static func spots(P, p: Dictionary) -> void:
	var f = _fight(p)
	var S: Vector2 = p.get("stone", Vector2.INF)
	if f == null or S == Vector2.INF or P.look == null:
		return
	var at := _P(S, F.HIS_PLACE.x, F.HIS_PLACE.y)
	if float(p["a"]) == 1.0:
		var k := floori((float(p["t"]) - float(p["c"])) * 30.0 + 1e-6)
		var lit := 1.0 - clampf(float(k - F.DEATH["melt"][0]) / float(F.DEATH["gone"] - F.DEATH["melt"][0]), 0.0, 1.0)
		if lit > 0.0:
			P.look.spot(at + Vector2(0, -60), 190.0, 0.75 * lit)
		return
	var up := 0.0 if f.mode == "idle" else (1.0 if f.wake_t < 0.0 else clampf((f.wake_t - F.WAKE["lurk"][0]) / (F.WAKE["lurk"][1] - F.WAKE["lurk"][0]), 0.0, 1.0))
	if up > 0.0:
		P.look.spot(at + Vector2(0, -60), 190.0, 0.75 * up)


## Under the figures.
static func draw(P, p: Dictionary) -> void:
	var f = _fight(p)
	var S: Vector2 = p.get("stone", Vector2.INF)
	if S == Vector2.INF:
		return
	var g := Cx.new(P)
	P.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	if float(p["a"]) == 1.0:
		_death(g, S, float(p["t"]) - float(p["c"]), P._clock, "ground")
	elif f != null:
		_draw(g, S, f, p["boss"], P._clock)
	P.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## Over the figures.
static func air(P, c: CanvasItem, p: Dictionary) -> void:
	var f = _fight(p)
	var S: Vector2 = p.get("stone", Vector2.INF)
	if S == Vector2.INF:
		return
	var g := Cx.new(c)
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
	if float(p["a"]) == 1.0:
		_death(g, S, float(p["t"]) - float(p["c"]), P._clock, "air")
	elif f != null:
		var hx := _P(S, F.HIS_PLACE.x, F.HIS_PLACE.y)
		var eye := _eye3(f, hx) if f.ph == 3 else _eye2(f, hx)
		_air(g, S, f, P._clock, eye)
		if (f.ph == 2 and f.mode == "change") or f.ph == 3:
			_p3(g, S, f, p["boss"], hx, eye, P._clock, "air")
	c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)


## Where his eye glows now in phase 3 (game pixels), from his middle at his place at `hx`.
static func _eye3(f, hx: Vector2) -> Vector2:
	var t := tongue3(f)
	var e := Art.eye(t[0], t[1]) if Art.baked(t[0]) else Art.eye("p3tongue", floori(f.body * 30.0 + 1e-6) % 90)
	return hx + e if e != Vector2.INF else Vector2.INF


## (GAZE2_AIMED) Where his eye glows now in his phase 2 gaze aimed; INF where it is not pictured aimed.
static func _eye2(f, hx: Vector2) -> Vector2:
	var g2 := gaze2(f)
	if g2.is_empty() or not Art.baked(g2["mv"]):
		return Vector2.INF
	var e := Art.eye(g2["mv"], g2["k"])
	return hx + e if e != Vector2.INF else Vector2.INF


# --- THE FIGHT DRAWN (render/act1_fx/colossus.ts draw) ---

static func _draw(g: Cx, S: Vector2, f, boss, t: float) -> void:
	var c: CanvasItem = g.c
	var Pf := func(u: float, v: float) -> Vector2: return _P(S, u, v)
	var warn_color := func(k: float) -> Color: return GOLD if k > 0.75 else PINK
	keep(f)
	_ground(g, S, f, t)
	# (what this part of the fight wants held: his phase's pictures and his tentacles'; the rest let go)
	var base := func(ws: Array) -> Array:
		var out: Array = []
		for w in ws:
			out.append("a%d.stand" % w)
			if w == 0 or w == 2:
				out.append("a%d.smash" % w)
		return out
	var part := floori(f.ph_t * 30.0 / Art.ARM_BAKE["entrancePart"])
	var dying: Array = []
	for a in f.arms:
		if a.state == "dying":
			dying = base.call([3, 4])
	var sh = f.shovel
	var shk := floori(sh.t * 30.0) if sh != null else -1
	var sh_part := floori(float(shk) / Art.ARM_BAKE["entrancePart"])
	var shovel_wants: Array = []
	if sh != null:
		shovel_wants = ["shovel.%d" % sh_part, "shovel.%d" % (sh_part + 1), "shovel.snap", "hooks"]
		for m in base.call([0, 1, 2]):
			if not m.contains("smash"):
				shovel_wants.append(m)
		if sh_part >= 3:
			shovel_wants.append("stand")
	elif f.ph == 2 and f.mode == "fight" and f.shovel_in < 4.0:
		shovel_wants = ["shovel.0", "shovel.snap", "hooks"]
	var hs := F.world_to_stone(S, boss.mgr.hero.world.x, boss.mgr.hero.world.y)
	var g2 := gaze2(f)
	var wants: Array
	if sh != null:
		wants = shovel_wants
	elif f.ph == 1 and f.mode == "between":
		wants = ["lurk", "entrance.0"] + dying
	elif f.ph == 1 and f.mode == "change":
		wants = ["entrance.%d" % part, "entrance.%d" % (part + 1)] + (["stand"] + base.call([0, 1, 2]) if part >= 2 else [])
	elif f.ph == 1:
		wants = ["lurk"] + base.call([3, 4])
	elif f.ph == 2 and f.mode == "change":
		wants = ["stand", "slide", "p3body"]
	elif f.ph == 2:
		wants = ["stand"] + base.call([0, 1, 2]) + shovel_wants
		if f.body2 != null or (f.body2_in < 3.0 and f.shovel_in > 4.0):
			if not F.GAZE2_AIMED:
				wants += ["bile", "gaze"]
			else:
				wants.append("bile")
				if not g2.is_empty():
					wants += ["p2body", g2["mv"]]
				elif f.body2_next == "gaze" and f.body2 == null:
					wants += ["p2body", "gaze2.%d" % F.gaze2_aim_near(hs)]
		if f.mode == "between":
			wants.append("slide")
	else:
		wants = ["p3body", tongue3(f)[0]]
		if f.eye == null:
			wants.append("slam3.%d" % F.eye_spot_near(hs) if f.eye_next == "slam" else "gaze3.%d" % F.gaze_aim_near(hs))
		if not f.siege:
			wants.append("death")
	Art.want(wants, [] if sh != null else (["p3"] if f.ph == 3 else (["arms", "p2"] if F.GAZE2_AIMED else ["arms"])))
	var stand_n := Art.frames("stand")
	var standK := floori(f.body * 30.0) % maxi(1, stand_n if stand_n > 0 else 90)
	var body_at := func(u: float, v: float, move: String, k: int, otherwise: Callable) -> void:
		var q := _P(S, u, v)
		if not Art.body(c, move, k, q.x, q.y):
			otherwise.call()
	var risen: bool = not (f.ph == 1 and (f.mode == "fight" or f.mode == "between" or f.mode == "idle"))
	var him_at := func(u: float, v: float, up: float) -> void: _him_at(g, S, u, v, up)
	# (his shovel in his own pictures: him at the end, turned over at the right end where at the end; his snap whenever it comes; his
	# hooks)
	var hx := _P(S, F.HIS_PLACE.x, F.HIS_PLACE.y)
	var sh_move := "shovel.%d" % sh_part
	var sh_k := shk - sh_part * int(Art.ARM_BAKE["entrancePart"])
	var shovel_baked := false
	if sh != null and Art.baked(sh_move):
		if not sh.snapping:
			shovel_baked = Art.body(c, sh_move, sh_k, hx.x, hx.y, sh.end == "r" and Art.at_end(sh_move, sh_k))
		else:
			shovel_baked = Art.body(c, "shovel.snap", floori(sh.snap * 30.0), hx.x, hx.y, sh.end == "r")
	if sh != null and shovel_baked:
		Art.hooks(c, sh_move, sh_k, hx.x, hx.y, sh.end == "r")
	var end_u: float = (-F.SHOVEL["out"] if sh.end == "l" else F.STONE["w"] + F.SHOVEL["out"]) if sh != null else 0.0
	if sh != null and shovel_baked:
		# the tell: the water boiling off that end (the game's effect)
		if sh.t >= F.SHOVEL["tell"][0] and sh.t < F.SHOVEL["tell"][1]:
			_boil(g, S, end_u, t)
		if sh.snapping:
			_snap_reach(g, S, sh, t)
	elif sh != null:
		if sh.t >= F.SHOVEL["tell"][0] and sh.t < F.SHOVEL["tell"][1]:
			_boil(g, S, end_u, t)
		if sh.t >= F.SHOVEL["burst"] and sh.t < F.SHOVEL["back"] + 0.47:
			him_at.call(end_u, F.STONE["d"] / 2.0, 0.8)
		if sh.t < 21.0 / 30.0:
			him_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, 1.0 - sh.t / (21.0 / 30.0))
		if sh.t >= F.SHOVEL["armsUp"]:
			him_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, minf(1.0, (sh.t - F.SHOVEL["armsUp"]) / 1.0))
		if sh.snapping:
			_snap_reach(g, S, sh, t)
		# the hooks scraping toward his maw
		for hk in F.SHOVEL["hooks"]:
			var front := F.hook_front(sh.end, sh.t - hk["at"])
			if front == INF:
				continue
			var back: float = front + F.HOOK["thick"] if sh.end == "l" else front - F.HOOK["thick"]
			var v0: float = -0.6 if hk["edge"] == "back" else F.STONE["d"] - F.HOOK["reach"]["near"]
			var v1: float = F.HOOK["reach"]["back"] if hk["edge"] == "back" else F.STONE["d"] + 0.6
			_poly(g, S, [Vector2(front, v0), Vector2(back, v0), Vector2(back, v1), Vector2(front, v1)], FLESH, PINK, [], 1.0, t)
	elif f.ph == 2 and f.mode == "change":
		# (his slide forward: his stand at his place to its frame 24, then the art's slide from there)
		var k := floori((f.ph_t - F.CHANGE3["slide"]) * 30.0 + 1e-6)
		var slid := clampf((f.ph_t - F.CHANGE3["slide"]) / (F.CHANGE3["long"] - F.CHANGE3["slide"]), 0.0, 1.0)
		var v: float = F.HIS_PLACE.y + (F.FORWARD["v"] - F.HIS_PLACE.y) * slid
		# (the water heaped and foaming before him as he heaves forward, settling between: the art's lunges)
		var heave := 0.0
		for q in [[4, 30], [42, 68], [78, 104]]:
			if k >= q[0] and k < q[1]:
				heave = maxf(heave, sin(PI * (k - q[0]) / float(q[1] - q[0])))
		if k >= 0 and k < 120:
			_rings(g, S, Vector2(F.HIS_PLACE.x, v + 2.2), 6.4, 1.3, t * 1.6, 8, 0.6 + 1.4 * heave)
		if k < 0:
			body_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, "stand", standK, func(): him_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, 1.0))
		else:
			body_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, "slide", k, func(): him_at.call(F.FORWARD["u"], v, 1.0))
	elif f.ph == 3:
		# (at his new place: his body; his tongue over it (cut where his jaws are before it): his droop, his eye's attack, his eye struck)
		var tk := tongue3(f)
		var tongue_mv: String = tk[0] if Art.baked(tk[0]) else "p3tongue"
		var tongue_k: int = tk[1] if tongue_mv == tk[0] else standK
		if Art.body(c, "p3body", standK, hx.x, hx.y):
			if not Art.body(c, tongue_mv, tongue_k, hx.x, hx.y):
				Art.body(c, "p3tongue", standK, hx.x, hx.y)
		else:
			him_at.call(F.FORWARD["u"], F.FORWARD["v"], 1.0)
	elif risen and f.ph == 1 and f.mode == "change":
		var k := floori(f.ph_t * 30.0)
		var ep := int(Art.ARM_BAKE["entrancePart"])
		body_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, "entrance.%d" % (k / ep), k % ep, func(): him_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, minf(1.0, f.ph_t / 3.0)))
	elif risen and not g2.is_empty() and Art.has("p2body", g2["body"]) and Art.has(g2["mv"], g2["k"]):
		# (his phase 2 gaze aimed: his body, his tongue and eye over it, aimed where the beam goes)
		Art.body(c, "p2body", g2["body"], hx.x, hx.y)
		Art.body(c, g2["mv"], g2["k"], hx.x, hx.y)
	elif risen and f.body2 != null:
		body_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, f.body2.kind, floori(f.body2.t * 30.0), func(): body_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, "stand", standK, func(): him_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, 1.0)))
	elif risen:
		body_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, "stand", standK, func(): him_at.call(F.HIS_PLACE.x, F.HIS_PLACE.y, 1.0))
	else:
		# (under the water, his lurk; before the hero steps onto the stone nothing of him is seen; as he wakes, his eye's fire comes up)
		var lurk_a := 0.0 if f.mode == "idle" else (1.0 if f.wake_t < 0.0 else clampf((f.wake_t - F.WAKE["lurk"][0]) / (F.WAKE["lurk"][1] - F.WAKE["lurk"][0]), 0.0, 1.0))
		if lurk_a > 0.0:
			var ln := Art.frames("lurk")
			if not Art.body(c, "lurk", floori(f.body * 30.0) % maxi(1, ln if ln > 0 else 90), hx.x, hx.y, false, lurk_a * lurk_a * (3.0 - 2.0 * lurk_a)):
				var q := _P(S, F.HIS_PLACE.x, F.HIS_PLACE.y + 3.0)
				g.fill = Color(PINK, (0.25 + 0.15 * sin(t * 2.0)) * lurk_a)
				g.begin()
				g.ellipse(q.x, q.y, 26, 9)
				g.do_fill()

	# PHASE 2, HIS BODY'S OWN ATTACKS (the game's parts of them): the bile arc's warning where it will land
	var B = f.body2
	if B != null and B.kind == "bile":
		var L: Dictionary = F.BODY2["bile"]
		if B.t < L["land"]:
			var k: float = B.t / L["land"]
			_disc(g, S, B.at.x, B.at.y, L["splash"], Color(0, 0, 0, 0), warn_color.call(k), [4, 3], t)
			_disc(g, S, B.at.x, B.at.y, L["splash"] * k, Color(1.0, 61 / 255.0, 139 / 255.0, 0.16), Color(0, 0, 0, 0), [], t)
	# PHASE 3, HIS EYE: the gaze's arc laid (phase 2's gaze the same, from the water under his eye at his place); the eye slam's circle
	var E = f.eye if f.eye != null else (B if B != null and B.kind == "gaze" else null)
	if E != null and E.kind == "gaze" and E.t < F.GAZE["warn"]:
		var pts: Array = [E.at]
		for i in 13:
			var deg: float = E.a0 + (E.a1 - E.a0) * i / 12.0
			pts.append(E.at + Vector2(sin(deg * F.D), cos(deg * F.D)) * 16.0)
		_poly(g, S, pts, Color(30 / 255.0, 6 / 255.0, 24 / 255.0, 0.22), warn_color.call(E.t / F.GAZE["warn"]), [5, 3], 1.0, t)
	if E != null and E.kind == "slam":
		if not E.landed:
			var k: float = E.t / F.EYE_SLAM["hit"]
			_disc(g, S, E.at.x, E.at.y, F.EYE_SLAM["r"], Color(0, 0, 0, 0), warn_color.call(k), [4, 3], t)
			_disc(g, S, E.at.x, E.at.y, F.EYE_SLAM["r"] * minf(1.0, k), Color(1.0, 61 / 255.0, 139 / 255.0, 0.18), Color(0, 0, 0, 0), [], t)
		elif E.t < F.EYE_SLAM["up"] and not Art.baked("slam3.%d" % E.pic):
			var q := _P(S, E.at.x, E.at.y)
			g.fill = PINK
			g.begin()
			g.ellipse(q.x, q.y - 6, 30, 11)
			g.do_fill()
			g.fill = GOLD
			g.begin()
			g.ellipse(q.x, q.y - 6, 7, 9)
			g.do_fill()

	# (the rings on the water round him where he breaks it, at his place risen, or at his new place; round each tentacle standing)
	if risen and sh == null and f.ph < 3 and not (f.ph == 2 and f.mode == "change"):
		_rings(g, S, Vector2(F.HIS_PLACE.x, F.HIS_PLACE.y + 1.2), 6.5, 1.6, t, 3)
	if f.ph == 3:
		_rings(g, S, Vector2(F.FORWARD["u"], F.FORWARD["v"] + 1.6), 6.2, 1.2, t, 5)
	# (phase 3, the game's parts on the stone: his grip's cracks, his eye's, the bolts' scorches)
	if (f.ph == 2 and f.mode == "change") or f.ph == 3:
		_p3(g, S, f, boss, hx, _eye3(f, hx), t, "ground")
	for a in f.arms:
		if a.state == "stand" or a.state == "slam" or a.state == "smash":
			_rings(g, S, F.root_at(a.u), 0.5, 0.3, t + a.k * 0.4, 11 + a.k, 0.7)

	# HIS TENTACLES: each its own pictures, laid from his middle as he is (his entrance's in his entrance's pictures)
	var in_entrance: bool = f.ph == 1 and f.mode == "change" and Art.baked("entrance.0")
	for a in f.arms:
		if a.state == "dead":
			continue
		if a.state == "under" and not (sh != null and shovel_baked):
			continue
		if a.state == "under":
			_arm_pic(c, f, a, hx, in_entrance, shovel_baked, shk, boss)
			continue
		var r := F.root_at(a.u)
		var x := _P(S, r.x, r.y)
		var fade: float = maxf(0.0, 1.0 - a.t / F.ARM["death"]) if a.state == "dying" else (minf(1.0, a.t / F.ARM["burst"]) if a.state == "rise" else 1.0)
		g.alpha = fade
		# its slam's line, laid as it rears (the game's warning, drawn under its pictures)
		if a.state == "slam" and a.line != null and a.t < F.SLAM["hit"]:
			_poly(g, S, _strip(a.line["a"], a.line["b"], F.SLAM["width"] / 2.0), Color(30 / 255.0, 6 / 255.0, 24 / 255.0, 0.35), warn_color.call(a.t / F.SLAM["hit"]), [5, 3], 1.0, t)
		if a.state == "smash" and a.t < F.SMASH["hit"]:
			_poly(g, S, [Vector2(0, 0), Vector2(F.STONE["w"], 0), Vector2(F.STONE["w"], F.STONE["d"]), Vector2(0, F.STONE["d"])], Color(30 / 255.0, 6 / 255.0, 24 / 255.0, 0.18), warn_color.call(a.t / F.SMASH["hit"]), [6, 4], 1.0, t)
		g.alpha = 1.0
		if _arm_pic(c, f, a, hx, in_entrance, shovel_baked, shk, boss):
			continue
		g.alpha = fade
		# (the stand-in: lying along its line after its slam, or standing at its root)
		if a.state == "slam" and a.line != null and a.t >= F.SLAM["hit"] and a.t < F.SLAM["lying"][1]:
			_poly(g, S, _strip(r, a.line["b"], F.SLAM["width"] / 2.0 * 0.8), FLESH, FLESH_LIT, [], 1.0, t)
		var up := 1.3 if a.state == "slam" and a.t < F.SLAM["hit"] else (0.6 if a.state == "dying" else 1.0)
		g.fill = FLESH
		g.rect(x.x - 9, x.y - 70 * up, 18, 70 * up)
		g.fill = FLESH_LIT
		g.rect(x.x - 9, x.y - 70 * up, 5, 70 * up)
		g.alpha = 1.0

	# THE SIEGE'S BOLTS: their circles, filling as they come
	for rn in f.rains:
		var k: float = minf(1.0, rn.t / F.RAIN["warn"])
		_disc(g, S, rn.u, rn.v, F.RAIN["r"], Color(0, 0, 0, 0), warn_color.call(k), [4, 3], t)
		if rn.t < F.RAIN["warn"]:
			_disc(g, S, rn.u, rn.v, F.RAIN["r"] * k, Color(1.0, 61 / 255.0, 139 / 255.0, 0.18), Color(0, 0, 0, 0), [], t)
		else:
			_disc(g, S, rn.u, rn.v, F.RAIN["r"], Color(1.0, 194 / 255.0, 61 / 255.0, 0.5), Color(0, 0, 0, 0), [], t)


## Each tentacle struck: its hit's flash last seen, and when (the fight's clock) and from what frame of its stand it was struck.
static var STRUCK := {}


## A tentacle's own pictures (armPic); false where they are not here (its stand-in is drawn).
static func _arm_pic(c: CanvasItem, f, a, mid: Vector2, in_entrance: bool, shovel_baked: bool, shk: int, boss) -> bool:
	var w: int = 3 + a.k if f.ph == 1 and f.mode != "change" else a.k
	var F30 := func(x: float) -> int: return floori(x * 30.0 + 1e-6)
	var stand := func() -> bool: return Art.arm(c, w, "a%d.stand" % w, F30.call(f.arm_clock) % 45, mid.x, mid.y)
	if in_entrance:
		return true
	# (his shovel: they go down with him and come up with him at his place, in his shovel's own frames; under the water between)
	if f.shovel != null and shovel_baked and a.state != "dying":
		var down := Art.frames("a%d.sink" % w)
		var up_at := roundi(F.SHOVEL["back"] * 30.0)
		if shk < down:
			return Art.arm(c, w, "a%d.sink" % w, shk, mid.x, mid.y)
		if shk >= up_at:
			return Art.arm(c, w, "a%d.up" % w, shk - up_at, mid.x, mid.y)
		return true
	match a.state:
		"rise":
			return Art.arm(c, w, "a%d.burst" % w, F30.call(a.t), mid.x, mid.y)
		"duck":
			return Art.arm(c, w, "a%d.duck" % w, F30.call(a.t), mid.x, mid.y)
		"stand":
			# (struck: its flinch from the nearest point of its stand it is baked from)
			var m = null
			for q in boss.mgr.list:
				if is_instance_valid(q) and not q.dead and q.kind == "eye" and q.h2 != null and q.h2.a1.get("arm", -1) == a.id:
					m = q
			var s: Dictionary = STRUCK.get(a.id, {"flash": 0.0, "at": -9.0, "stand": 0})
			if m != null and m._flash > float(s["flash"]) + 0.01:
				s["at"] = f.time
				s["stand"] = F30.call(f.arm_clock) % 45
			s["flash"] = m._flash if m != null else 0.0
			STRUCK[a.id] = s
			var since: int = F30.call(f.time - float(s["at"]))
			if since >= 0 and since < 14:
				var st: int = s["stand"]
				var from: int = Art.ARM_BAKE["flinchFrom"][0]
				var dist := func(q: int) -> int: return mini(absi(q - st), 45 - absi(q - st))
				for q in Art.ARM_BAKE["flinchFrom"]:
					if dist.call(q) < dist.call(from):
						from = q
				if Art.arm(c, w, "a%d.flinch%d" % [w, from], since, mid.x, mid.y):
					return true
			return stand.call()
		"slam":
			var turns := Art.slam_turns(w)
			if turns.is_empty():
				return false
			var d: int = turns[0]
			for q in turns:
				if absf(q - a.turn) < absf(d - a.turn):
					d = q
			# (only a turn baked near enough: the game turns a picture no further than half the bake's step)
			if absf(a.turn - d) <= Art.ARM_BAKE["turnEvery"] / 2.0 + 0.01:
				return Art.arm(c, w, "a%d.slam%d" % [w, d], F30.call(a.t), mid.x, mid.y, a.turn - d) or stand.call()
			return false
		"smash":
			return Art.arm(c, w, "a%d.smash" % w, F30.call(a.t), mid.x, mid.y) or stand.call()
		"dying":
			return Art.arm(c, w, "a%d.death" % w, F30.call(a.t), mid.x, mid.y)
	return false


# --- the game's plain stand-ins and warnings (render/act1_fx/colossus.ts poly, disc, strip, himAt) ---

## A polygon of the stone's points filled and stroked (a dashed stroke running as the clock goes).
static func _poly(g: Cx, S: Vector2, pts: Array, fill: Color, stroke: Color, dash: Array, lw: float, t: float) -> void:
	var p := PackedVector2Array()
	for q in pts:
		p.append(_P(S, q.x, q.y))
	if fill.a > 0.0:
		g.poly(p, g.a(fill))
	if stroke.a > 0.0:
		p.append(p[0])
		g.stroke = stroke
		g.lw = lw
		if dash.is_empty():
			g.c.draw_polyline(p, g.a(stroke), lw)
		else:
			g.dashed(p, dash, t * 12.0)


static func _disc(g: Cx, S: Vector2, u: float, v: float, r: float, fill: Color, stroke: Color, dash: Array, t: float) -> void:
	var pts: Array = []
	for i in 28:
		pts.append(Vector2(u + cos(i / 28.0 * TAU) * r, v + sin(i / 28.0 * TAU) * r))
	_poly(g, S, pts, fill, stroke, dash, 1.0, t)


static func _strip(a: Vector2, b: Vector2, half: float) -> Array:
	var l := a.distance_to(b)
	if l == 0.0:
		l = 1.0
	var n := Vector2(-(b.y - a.y), b.x - a.x) / l * half
	return [a + n, b + n, b - n, a - n]


## His stand-in: a dark mound with his eye, `up` of him up.
static func _him_at(g: Cx, S: Vector2, u: float, v: float, up: float) -> void:
	var q := _P(S, u, v)
	var x := q.x
	var y := q.y
	g.poly(PackedVector2Array([Vector2(x - 110, y + 6), Vector2(x - 140, y - 128 * up), Vector2(x - 30, y - 10 * up), Vector2(x + 30, y - 10 * up), Vector2(x + 136, y - 146 * up), Vector2(x + 110, y + 6)]), g.a(FLESH))
	g.fill = FLESH_LIT
	g.rect(x - 8, y - 150 * up, 16, 140 * up)
	g.fill = PINK
	g.begin()
	g.ellipse(x, y - 160 * up, 32, 12)
	g.do_fill()
	g.fill = GOLD
	g.begin()
	g.ellipse(x, y - 160 * up, 8, 10)
	g.do_fill()


## The shovel's tell: the water boiling off the end he will come up at.
static func _boil(g: Cx, S: Vector2, end_u: float, t: float) -> void:
	for i in 6:
		_disc(g, S, end_u + sin(t * 7.0 + i) * 2.0, F.STONE["d"] / 2.0 + cos(t * 5.0 + i * 2) * 4.0, 0.4 + 0.3 * absf(sin(t * 9.0 + i)), Color(0, 0, 0, 0), FOAM, [], t)


## His snap's reach as he twitches and shuts (the game's warning).
static func _snap_reach(g: Cx, S: Vector2, sh, t: float) -> void:
	var u0: float = 0.0 if sh.end == "l" else F.STONE["w"] - F.SNAP["deep"]
	var a0: float = F.SNAP["across"][0]
	var a1: float = F.SNAP["across"][1]
	_poly(g, S, [Vector2(u0, a0), Vector2(u0 + F.SNAP["deep"], a0), Vector2(u0 + F.SNAP["deep"], a1), Vector2(u0, a1)],
		Color(1.0, 194 / 255.0, 61 / 255.0, 0.45) if sh.snapped else Color(1.0, 61 / 255.0, 139 / 255.0, 0.25), GOLD if sh.snapped else PINK, [4, 3], 1.0, t)


# --- ON THE STONE (colossus_fx.ts drawColossusGround, drawBubbles, brokenEllipse, quad, drawColossusRings) ---

## Bubbles coming up at each spot [u, v, seed], `k` of a boil: a few swelling and popping, then many, the water heaving pale over each.
static func _bubbles(g: Cx, S: Vector2, spots: Array, k: float, t: float) -> void:
	for sp in spots:
		var su: float = sp[0]
		var sv: float = sp[1]
		var si: float = sp[2]
		var R := 0.25 + 1.0 * k
		var n := roundi(2 + 16 * k)
		if k > 0.55:
			var b := (k - 0.55) / 0.45
			g.alpha = 0.22 * b
			g.fill = C_FOAM[1]
			g.begin()
			for i in 17:
				var a := i / 16.0 * TAU
				var r := R * 0.8 * (0.7 + 0.5 * n1(i * 0.8 + t * 2.5, si * 13 + 5))
				var q := _P(S, su + cos(a) * r, sv + sin(a) * r * 0.9)
				if i == 0:
					g.move(q.x, q.y)
				else:
					g.line(q.x, q.y)
			g.do_fill()
		for i in n:
			var per := 0.55 + 0.6 * h(si, i, 31)
			var ph := fmod(t / per + h(si, i, 32), 1.0)
			var cyc := floorf(t / per + h(si, i, 32))
			var a := h(si, i, cyc) * TAU
			var d := R * sqrt(h(si, i, cyc + 7))
			var q := _P(S, su + cos(a) * d, sv + sin(a) * d)
			if ph < 0.82:
				var r := 0.6 + 2.2 * (ph / 0.82) * (0.6 + 0.6 * h(si, i, 33))
				g.alpha = 0.85
				g.stroke = C_FOAM[2] if i % 3 != 0 else C_FOAM[3]
				g.lw = 1.0
				g.begin()
				g.ellipse(roundf(q.x) + 0.5, roundf(q.y) + 0.5, r, r * 0.7, 12)
				g.do_stroke()
				g.alpha = 0.6
				g.fill = C_FOAM[3]
				g.rect(roundf(q.x - r * 0.4), roundf(q.y - r * 0.4), 1, 1)
			else:
				var qq := (ph - 0.82) / 0.18
				g.alpha = 0.8 * (1.0 - qq)
				g.fill = C_FOAM[2]
				for j in 3:
					var aj := j / 3.0 * TAU + a
					g.rect(roundf(q.x + cos(aj) * 3 * qq), roundf(q.y - 4 * qq + 6 * qq * qq + sin(aj) * 1.5 * qq), 1, 1)
	g.alpha = 1.0


static func _ground(g: Cx, S: Vector2, f, t: float) -> void:
	var now: float = f.time
	# HIS WAKING: bubbles where his two tentacles will burst and over his eye, a few and then a boil, after the water has lain still
	if f.ph == 1 and (f.wake_t >= 0.0 or f.ph_t < F.WAKE["rise"] + 0.8) and f.mode == "fight":
		var w: float = f.wake_t if f.wake_t >= 0.0 else f.ph_t
		var k := sm(F.WAKE["still"], F.WAKE["rise"], w) * (1.0 - sm(F.WAKE["rise"], F.WAKE["rise"] + 0.8, w))
		if k > 0.0:
			var spots: Array = []
			var roots: Array = F.ROOTS[1]
			for i in roots.size():
				spots.append([roots[i], -F.ROOT_OUT, i])
			spots += [[F.HIS_PLACE.x, F.HIS_PLACE.y + 3.2, 2], [F.HIS_PLACE.x - 2, F.HIS_PLACE.y + 2.4, 3], [F.HIS_PLACE.x + 2, F.HIS_PLACE.y + 2.4, 4]]
			_bubbles(g, S, spots, k, t)
	# THE STONE WET where a wave has passed, darker and sheened, drying from its far side
	for w in K["wet"]:
		var s: float = now - float(w["at"])
		for v in range(0, int(F.STONE["d"]) + 1):
			var front := F.wave_front(w["from"], s, v + 0.5)
			var dry := maxf(0.0, 1.0 - (s - 1.5) / 4.0)
			if dry <= 0.0:
				continue
			var u0: float = clampf(front - 3.2, 0.0, F.STONE["w"]) if w["from"] == "l" else clampf(front + 3.2, 0.0, F.STONE["w"])
			var u1: float = clampf(front - F.WAVE["face"], 0.0, F.STONE["w"] / 2.0 if w["meets"] else F.STONE["w"]) if w["from"] == "l" else clampf(front + F.WAVE["face"], F.STONE["w"] / 2.0 if w["meets"] else 0.0, F.STONE["w"])
			if absf(u1 - u0) < 0.05:
				continue
			_quad(g, S, u0, v, u1, v + 1, Color8(10, 18, 16, int(255 * 0.28 * dry)))
	# THE SLAMS: the stone split along each line, slabs tipped up; the slime dragged along it
	for s in K["slams"]:
		var age: float = now - float(s["at"])
		var al := maxf(0.0, 1.0 - maxf(0.0, age - 4.0) / 3.0)
		var L: Dictionary = s["line"]
		var la: Vector2 = L["a"]
		var lb: Vector2 = L["b"]
		var ln := la.distance_to(lb)
		if ln == 0.0:
			ln = 1.0
		var du := (lb.x - la.x) / ln
		var dv := (lb.y - la.y) / ln
		var nu := -dv
		var nv := du
		var seed: float = s["seed"]
		g.save()
		g.alpha = al
		g.stroke = C_CRACK
		g.lw = 1.0
		for side in [-1, 1]:
			g.begin()
			for i in 41:
				var k := i / 40.0
				var off: float = side * 0.18 + (n1(k * 9, seed + side) - 0.5) * 0.5
				var q := _P(S, la.x + du * ln * k + nu * off, la.y + dv * ln * k + nv * off)
				if i == 0:
					g.move(q.x, q.y)
				else:
					g.line(q.x, q.y)
			g.do_stroke()
		for b in 9:
			var k := h(seed, b, 1)
			var side := -1.0 if h(seed, b, 2) < 0.5 else 1.0
			var l := 0.5 + h(seed, b, 3) * 1.1
			var u0 := la.x + du * ln * k
			var v0 := la.y + dv * ln * k
			var p0 := _P(S, u0, v0)
			var p1 := _P(S, u0 + (nu * side + du * (h(seed, b, 4) - 0.5)) * l, v0 + (nv * side + dv * (h(seed, b, 4) - 0.5)) * l)
			g.begin()
			g.move(p0.x, p0.y)
			g.line((p0.x + p1.x) / 2 + (h(seed, b, 5) - 0.5) * 3, (p0.y + p1.y) / 2 + (h(seed, b, 6) - 0.5) * 2)
			g.line(p1.x, p1.y)
			g.do_stroke()
		# (slabs tipped up along it: a lit edge and a dark face)
		for i in 7:
			var k := 0.08 + 0.84 * h(seed, i, 7)
			var side := -1.0 if h(seed, i, 8) < 0.5 else 1.0
			var q := _P(S, la.x + du * ln * k + nu * side * 0.45, la.y + dv * ln * k + nv * side * 0.45)
			var w := 3 + 3 * h(seed, i, 9)
			var up := minf(1.0, age / 0.08) * (2 + 2 * h(seed, i, 10))
			g.fill = C_STONE[0]
			g.rect(roundf(q.x - w / 2), roundf(q.y - up), roundf(w), roundf(up + 1))
			g.fill = C_STONE[3]
			g.rect(roundf(q.x - w / 2), roundf(q.y - up - 1), roundf(w), 1)
		g.restore()
		# (the slime it leaves as it is dragged back: laid along the line from its tip, fading from 1.2 s, gone 3.2 s after)
		if s["drag"] < INF:
			var sa: float = now - float(s["drag"])
			var fade := 1.0 if sa < 1.2 else maxf(0.0, 1.0 - (sa - 1.2) / 2.0)
			if fade > 0.0:
				for i in 26:
					var k := i / 25.0
					var wob := (n1(k * 7 + 3, seed + 9) - 0.5) * 0.35
					var q := _P(S, la.x + du * ln * k + nu * wob, la.y + dv * ln * k + nv * wob)
					var r := 2.2 + 2.5 * n1(k * 5, seed + 11)
					g.fill = Color(C_SLIME, 0.5 * fade)
					g.begin()
					g.ellipse(q.x, q.y, r * 1.6, r * 0.7, 14)
					g.do_fill()
	# HIS BILE'S POOLS: ragged, bubbling, burning at the edge, smoking
	for p in f.pools:
		var r := F.pool_r(p.t)
		if r <= 0.05:
			continue
		var seed := roundf(p.u * 31 + p.v * 17)
		var edge := func(a: float) -> float: return r * (0.84 + 0.24 * n1(a * 3 + p.t * 0.6, seed) + 0.06 * sin(a * 5 + p.t * 2))
		var ring := func(k: float, col: Color) -> void:
			var pts := PackedVector2Array()
			for i in 29:
				var a := i / 28.0 * TAU
				pts.append(_P(S, p.u + cos(a) * edge.call(a) * k, p.v + sin(a) * edge.call(a) * k))
			g.poly(pts, g.a(col))
		ring.call(1.08, Color(1.0, 79 / 255.0, 138 / 255.0, 0.35 + 0.15 * sin(t * 11 + seed)))
		ring.call(1.0, C_BILE[1])
		ring.call(0.82, C_BILE[2])
		ring.call(0.5, C_BILE[3])
		for i in 9:
			var life := fmod(t * 1.3 + h(seed, i), 1.0)
			var a := h(seed, i, 2) * TAU
			var d := sqrt(h(seed, i, 3)) * r * 0.75
			var q := _P(S, p.u + cos(a) * d, p.v + sin(a) * d)
			g.stroke = C_BURN[2] if life > 0.85 else C_BILE[4]
			g.lw = 1.0
			g.begin()
			g.arc(q.x, q.y - life * 1.5, 0.8 + life * 1.8)
			g.do_stroke()
		for i in 5:
			var life := fmod(t * 0.5 + h(seed, i, 5), 1.0)
			var q := _P(S, p.u + (h(seed, i, 6) - 0.5) * r, p.v + (h(seed, i, 7) - 0.5) * r)
			g.fill = Color8(40, 36, 30, int(255 * 0.3 * (1.0 - life)))
			g.begin()
			g.arc(q.x + sin(life * 6 + i) * 3, q.y - life * 26, 3 + life * 5)
			g.do_fill()
	# HIS GAZE'S SCORCH: the stone burnt where the beam passed, smouldering, cooling, fading
	for s in K["scorches"]:
		var cool: float = 0.0 if s["done"] == INF else maxf(0.0, now - float(s["done"]) - F.GAZE["long"] + F.GAZE["warn"] + F.GAZE["sweep"])
		var al := maxf(0.0, 1.0 - cool / 3.0)
		if al <= 0.0:
			continue
		var lo: float = minf(s["a0"], s["to"])
		var hi: float = maxf(s["a0"], s["to"])
		var o: Vector2 = s["o"]
		var d := lo
		while d <= hi:
			var rr := d * PI / 180.0
			for k in 14:
				var far := 4.3 + k * 0.9
				var u := o.x + sin(rr) * far
				var v := o.y + cos(rr) * far
				if u < 0.0 or u > F.STONE["w"] or v < 0.0 or v > F.STONE["d"]:
					continue
				var q := _P(S, u, v)
				var w: float = F.GAZE["width"] / 2.0 * 22.0 * (0.6 + 0.5 * n1(far * 2 + d * 0.3, 41))
				g.fill = Color(C_SCORCH, 0.12 * al)
				g.rect(roundf(q.x - w / 2), roundf(q.y - 2), roundf(w), 4)
				if h(roundf(d * 10), k, 3) < 0.08 * al:
					g.fill = C_BURN[1] if h(roundf(d * 10), k, 4) < 0.5 else C_BURN[2]
					g.rect(roundf(q.x + (h(roundf(d), k) - 0.5) * w), roundf(q.y - 1), 1, 1)
			d += 1.5
	# THE WATER SLAMS' RINGS on the water off the stone's end
	for s in K["smashes"]:
		var age: float = now - float(s["at"])
		for r in 4:
			var ra := 0.6 + age * (2.2 + r * 0.8)
			var al := maxf(0.0, 1.0 - age / (1.4 + r * 0.4))
			if al <= 0.0:
				continue
			_broken(g, S, s["u"], s["v"], ra, al, float(s["seed"]) + r, C_FOAM[2])


## A ring on the water round (u, v), `r` tiles, broken by noise.
static func _broken(g: Cx, S: Vector2, u: float, v: float, r: float, al: float, seed: float, col: Color) -> void:
	g.save()
	g.alpha = al
	g.fill = col
	var n := maxi(16, roundi(r * 14))
	for i in n:
		var k := float(i) / n
		if n1(k * 11, seed) < 0.42:
			continue
		var ang := k * TAU
		var q := _P(S, u + cos(ang) * r, v + sin(ang) * r)
		g.rect(roundf(q.x), roundf(q.y), 2, 1)
	g.restore()


## A quad of the stone from (u0, v0) to (u1, v1).
static func _quad(g: Cx, S: Vector2, u0: float, v0: float, u1: float, v1: float, fill: Color) -> void:
	g.poly(PackedVector2Array([_P(S, u0, v0), _P(S, u1, v0), _P(S, u1, v1), _P(S, u0, v1)]), g.a(fill))


## The rings on the water round him and his standing tentacles where they break it: `ru` across and `rv` deep out, each broken.
static func _rings(g: Cx, S: Vector2, at: Vector2, ru: float, rv: float, t: float, seed: float, strong := 1.0) -> void:
	for r in 5:
		var u := fmod(t / 1.5 + r / 5.0, 1.0)
		var grow := 0.6 + 3.0 * pow(u, 1.35)
		var al := (1.0 - u) * minf(1.0, u * 12.0) * 0.5 * strong
		if al <= 0.02:
			continue
		g.save()
		g.alpha = al
		g.fill = C_FOAM[2] if u < 0.3 else C_FOAM[1]
		var s := seed + r * 7 + floorf(t / 1.5 + r / 5.0) * 3
		var n := roundi((ru + rv + grow * 2) * 10)
		for i in n:
			var k := float(i) / n
			if n1(k * 13, s) < 0.45:
				continue
			var ang := k * TAU
			var q := _P(S, at.x + cos(ang) * (ru + grow), at.y + sin(ang) * (rv + grow * 0.6))
			g.rect(roundf(q.x), roundf(q.y), 2, 1)
		g.restore()


# --- OVER IT (colossus_fx.ts drawColossusAir, bounce, waveWall, crashPlume) ---

static func _air(g: Cx, S: Vector2, f, t: float, eye3: Vector2) -> void:
	var now: float = f.time
	# THE WAVES: each a wall of black water, tallest at the back, its crest breaking white
	for w in f.waves:
		_wave(g, S, w.from, w.t, w.meets, t)
	# THE CRASH: a plume of white water where they meet, falling back into foam that spreads over the stone and drains away
	if not f.crash.is_empty():
		_plume(g, S, float(f.crash["t"]), t)
	# THE SLAMS' CHUNKS AND GOO, flung up, tumbling, bouncing, splatting
	for s in K["slams"]:
		var age: float = now - float(s["at"])
		if age > 3.3:
			continue
		var la: Vector2 = s["line"]["a"]
		var lb: Vector2 = s["line"]["b"]
		var seed: float = s["seed"]
		for i in 34:
			var k := h(seed, i, 21)
			var u0 := la.x + (lb.x - la.x) * k
			var v0 := la.y + (lb.y - la.y) * k
			var ang := h(seed, i, 22) * TAU
			var sp := 0.8 + 2.4 * h(seed, i, 23)
			var vz := 2.5 + 4 * h(seed, i, 24)
			var p := _bounce(age, vz)
			var go := minf(age, p[1])
			var u := u0 + cos(ang) * sp * go * 0.8
			var v := v0 + sin(ang) * sp * go * 0.8
			if age > 3.2 - h(seed, i, 25) * 0.6:
				continue
			var q := _P(S, u, v)
			var sz := 1 + roundf(2 * h(seed, i, 26))
			g.fill = C_STONE[0]
			g.rect(roundf(q.x - sz / 2) - 1, roundf(q.y - p[0] * UP) - 1, sz + 2, sz + 1)
			g.fill = C_STONE[2 + (i % 2)]
			g.rect(roundf(q.x - sz / 2), roundf(q.y - p[0] * UP) - 1, sz, sz)
		for i in 52:
			var k := h(seed, i, 31)
			var u0 := la.x + (lb.x - la.x) * k
			var v0 := la.y + (lb.y - la.y) * k
			var ang := h(seed, i, 32) * TAU
			var sp := 0.6 + 2.2 * h(seed, i, 33)
			var vz := 2 + 4.5 * h(seed, i, 34)
			var flight := 2.0 * vz / 9.8
			var string := i >= 40
			if age < flight:
				var z := vz * age - 4.9 * age * age
				var q := _P(S, u0 + cos(ang) * sp * age, v0 + sin(ang) * sp * age)
				g.fill = C_GOO[2 + (i % 2)]
				if string:
					g.rect(roundf(q.x) - 1, roundf(q.y - z * UP), 1, 4)
				else:
					g.rect(roundf(q.x) - 1, roundf(q.y - z * UP) - 1, 2, 2)
			elif age < flight + 1.4:
				var al := 1.0 - (age - flight) / 1.4
				var q := _P(S, u0 + cos(ang) * sp * flight, v0 + sin(ang) * sp * flight)
				g.fill = Color8(46, 58, 28, int(255 * 0.85 * al))
				g.begin()
				g.ellipse(q.x, q.y, 4.0 if string else 2.5, 1.2 if string else 1.1, 12)
				g.do_fill()
	# THE WATER SLAMS' CROWNS, thrown up off the stone's end
	for s in K["smashes"]:
		var age: float = now - float(s["at"])
		if age > 1.2:
			continue
		var seed: float = s["seed"]
		for i in 40:
			var ang := i / 40.0 * TAU + h(seed, i) * 0.2
			var sp := 1.2 + 1.6 * h(seed, i, 2)
			var vz := 4 + 5 * h(seed, i, 3)
			var z := vz * age - 4.9 * age * age
			if z < 0.0:
				continue
			var q := _P(S, float(s["u"]) + cos(ang) * sp * age, float(s["v"]) + sin(ang) * sp * age * 0.6)
			g.fill = C_FOAM[2 + (i % 2)]
			g.rect(roundf(q.x), roundf(q.y - z * UP), 2, 2)
	# HIS GLOB OF BILE IN FLIGHT, and its splash's gobs
	var B = f.body2
	var L: Dictionary = F.BODY2["bile"]
	if B != null and B.kind == "bile" and B.t >= L["release"] and B.t < L["land"]:
		var throat := Vector2(7.79, -7.14)
		var s: float = (B.t - L["release"]) / (L["land"] - L["release"])
		var at := func(q: float) -> Vector2:
			var pp := _P(S, throat.x + (B.at.x - throat.x) * q, throat.y + (B.at.y - throat.y) * q)
			return Vector2(pp.x, pp.y - (1.0 + 5.1 * 4.0 * q * (1.0 - q)) * UP + q * UP)
		var gp: Vector2 = at.call(s)
		g.stroke = C_BILE[2]
		g.lw = 1.0
		g.begin()
		for i in 7:
			var q: Vector2 = at.call(maxf(0.0, s - i * 0.03))
			if i == 0:
				g.move(q.x, q.y)
			else:
				g.line(q.x + sin(i + t * 20) * 1.5, q.y)
		g.do_stroke()
		for i in 10:
			var a := h(9, i) * TAU + t * 6
			var d := 2 + 4 * h(9, i, 2)
			g.fill = C_BILE[0 if i % 3 == 0 else (2 if i % 3 == 1 else 3)]
			g.begin()
			g.arc(gp.x + cos(a) * d, gp.y + sin(a) * d * 0.8, 2.5 + 2 * h(9, i, 3))
			g.do_fill()
		g.fill = C_BILE[4]
		g.rect(roundf(gp.x - 2), roundf(gp.y - 3), 2, 1)
	for s in K["splashes"]:
		var age: float = now - float(s["at"])
		var seed: float = s["seed"]
		for i in 24:
			var ang := h(seed, i) * TAU
			var sp := 1 + 2.4 * h(seed, i, 2)
			var vz := 2 + 4 * h(seed, i, 3)
			var flight := 2.0 * vz / 9.8
			if age < flight:
				var z := vz * age - 4.9 * age * age
				var q := _P(S, float(s["u"]) + cos(ang) * sp * age, float(s["v"]) + sin(ang) * sp * age)
				g.fill = C_BILE[2 + (i % 3)]
				g.rect(roundf(q.x) - 1, roundf(q.y - z * UP) - 1, 3, 2)
			elif age < flight + 1.0:
				var al := 1.0 - (age - flight)
				var q := _P(S, float(s["u"]) + cos(ang) * sp * flight, float(s["v"]) + sin(ang) * sp * flight)
				g.fill = Color8(74, 78, 20, int(255 * 0.8 * al))
				g.begin()
				g.ellipse(q.x, q.y, 3, 1.3, 12)
				g.do_fill()
	# HIS GAZE'S BEAM: from his eye down onto the stone and along its line, burning
	var E = f.eye if f.eye != null else (B if B != null and B.kind == "gaze" else null)
	if E != null and E.kind == "gaze" and E.t >= F.GAZE["warn"] and E.t < F.GAZE["warn"] + F.GAZE["sweep"] + 0.3:
		var k := minf(1.0, (E.t - F.GAZE["warn"]) / F.GAZE["sweep"])
		var gut := maxf(0.0, 1.0 - maxf(0.0, E.t - F.GAZE["warn"] - F.GAZE["sweep"]) / 0.3)
		var deg: float = E.a0 + (E.a1 - E.a0) * k
		var r := deg * PI / 180.0
		var e0 := _P(S, E.at.x, E.at.y)
		var ex := eye3.x if eye3 != Vector2.INF else e0.x
		var ey := eye3.y if eye3 != Vector2.INF else e0.y - (2.2 if f.ph == 3 else 5.2) * UP
		var land := 0.0
		var dd := 0.0
		while dd < 20.0:
			var u: float = E.at.x + sin(r) * dd
			var v: float = E.at.y + cos(r) * dd
			if v >= 0.0 and u >= 0.0 and u <= F.STONE["w"]:
				land = dd
				break
			dd += 0.25
		var end := land
		dd = land
		while dd < 22.0:
			var u: float = E.at.x + sin(r) * dd
			var v: float = E.at.y + cos(r) * dd
			if v > F.STONE["d"] or u < 0.0 or u > F.STONE["w"]:
				break
			end = dd
			dd += 0.25
		var lp := _P(S, E.at.x + sin(r) * land, E.at.y + cos(r) * land)
		var fp := _P(S, E.at.x + sin(r) * end, E.at.y + cos(r) * end)
		var lu: float = E.at.x + sin(r) * land
		var lv: float = E.at.y + cos(r) * land
		var fu: float = E.at.x + sin(r) * end
		var fv: float = E.at.y + cos(r) * end
		var nu := cos(r)
		var nv := -sin(r)
		for q in [[1.5, C_BEAM[0], 0.3], [1.0, C_BEAM[2], 0.55], [0.55, C_BEAM[3], 0.8], [0.22, C_BEAM[5], 1.0]]:
			var kk: float = q[0]
			var flick := 0.9 + 0.2 * sin(t * 37 + kk * 9)
			var half: float = F.GAZE["width"] / 2.0 * kk * flick
			g.alpha = float(q[2]) * gut
			var a0 := _P(S, lu + nu * half, lv + nv * half)
			var a1 := _P(S, fu + nu * half, fv + nv * half)
			var b1 := _P(S, fu - nu * half, fv - nv * half)
			var b0 := _P(S, lu - nu * half, lv - nv * half)
			g.poly(PackedVector2Array([a0, a1, b1, b0]), g.a(q[1]))
			var w_eye := 2.5 * kk * 2 * flick
			var w_land := maxf(w_eye, absf(a0.x - b0.x) / 2 + 2)
			g.poly(PackedVector2Array([Vector2(ex - w_eye, ey), Vector2(ex + w_eye, ey), Vector2(lp.x + w_land, lp.y), Vector2(lp.x - w_land, lp.y)]), g.a(q[1]))
		g.alpha = 1.0
		# (the fire along its line, and sparks thrown up)
		for i in 18:
			var q := i / 17.0
			var x := lp.x + (fp.x - lp.x) * q
			var y := lp.y + (fp.y - lp.y) * q
			var fl := 3 + 5 * n1(q * 8 - t * 9, 77)
			g.fill = C_BURN[2] if i % 2 == 1 else C_BURN[1]
			g.alpha = 0.8 * gut
			g.rect(roundf(x - 1), roundf(y - fl), 2, roundf(fl))
			if h(i, floorf(t * 30), 3) < 0.3:
				g.fill = C_BURN[3]
				g.rect(roundf(x + (h(i, floorf(t * 30), 4) - 0.5) * 8), roundf(y - fl - 4 * h(i, floorf(t * 30), 5)), 1, 1)
		g.alpha = 1.0


## A chunk's height (tiles) `age` seconds after it was flung up at `vz`, bouncing twice, each lower; and when it lies still: [z, flat].
static func _bounce(age: float, vz: float) -> Array:
	var v := vz
	var t := age
	var flat := 0.0
	for b in 3:
		var fl := 2.0 * v / 9.8
		if t < fl:
			return [v * t - 4.9 * t * t, flat + fl]
		t -= fl
		flat += fl
		v *= 0.38
	return [0.0, flat]


## A wave: its wall rolling from `from`, `s` seconds after its smash; tallest at the back (1.48 tiles), 0.49 at the near edge.
static func _wave(g: Cx, S: Vector2, from: String, s: float, meets: bool, t: float) -> void:
	var d := -1.0 if from == "l" else 1.0
	var form := minf(1.0, s / 0.25)
	var crest := PackedVector2Array()
	var foot := PackedVector2Array()
	var back := PackedVector2Array()
	var v := -0.6
	while v <= F.STONE["d"] + 1.0:
		var fr0 := F.wave_front(from, s, clampf(v, 0.0, F.STONE["d"]))
		if meets:
			fr0 = minf(fr0, F.STONE["w"] / 2.0) if from == "l" else maxf(fr0, F.STONE["w"] / 2.0)
		var vv := clampf(v, 0.0, F.STONE["d"])
		var hi: float = form * (1.48 - 0.99 * vv / F.STONE["d"]) * (0.9 + 0.2 * n1(v * 1.3 - s * 4, 5)) * (maxf(0.0, 1.0 - (v - F.STONE["d"])) if v > F.STONE["d"] else 1.0)
		var fp := _P(S, fr0, v)
		var bp := _P(S, fr0 + d * (F.WAVE["face"] + 1.2), v)
		crest.append(Vector2(fp.x + d * 4, fp.y - hi * UP))
		foot.append(fp)
		back.append(bp)
		v += 0.25
	# (its body: the back slope down into the water behind, the face up to the crest)
	var top := INF
	var bottom := -INF
	for q in crest:
		top = minf(top, q.y)
	for q in foot:
		bottom = maxf(bottom, q.y)
	var stops := [[0.0, C_LIT], [0.35, C_WAVE], [1.0, C_DEEP]]
	g.alpha = 0.92
	var body := crest.duplicate()
	for i in range(back.size() - 1, -1, -1):
		body.append(back[i])
	g.poly_grad(body, top, bottom, stops)
	var face := crest.duplicate()
	for i in range(foot.size() - 1, -1, -1):
		face.append(foot[i])
	g.poly_grad(face, top, bottom, stops)
	g.alpha = 1.0
	# (its face's streaks of light, running down it)
	for i in range(0, crest.size(), 2):
		if n1(i * 0.7 + s * 3, 9) < 0.55:
			continue
		var cp := crest[i]
		var fp := foot[i]
		g.c.draw_line(Vector2(cp.x, cp.y + 2), Vector2(cp.x + (fp.x - cp.x) * 0.6, cp.y + (fp.y - cp.y) * 0.6), Color8(120, 150, 130, 89), 1.0)
	# (the crest breaking white: a ragged line of foam along it, clumps on it; spray thrown up off it in a mist)
	var jit := func(i: int, k: float) -> float: return (n1(i * 0.6 + s * 5 + t * 3, k) - 0.5) * 2
	var l1 := PackedVector2Array()
	var l2 := PackedVector2Array()
	for i in crest.size():
		var q := crest[i]
		l1.append(Vector2(q.x, q.y + 3) if i == 0 else Vector2(q.x + jit.call(i, 21), q.y + 3 + jit.call(i, 22)))
		l2.append(q if i == 0 else Vector2(q.x + jit.call(i, 23), q.y + jit.call(i, 24)))
	g.c.draw_polyline(l1, Color8(96, 128, 112, 178), 2.0)
	g.c.draw_polyline(l2, C_FOAM[2], 1.5)
	for i in crest.size():
		var x := crest[i].x
		var y := crest[i].y
		var k := n1(i * 0.45 + s * 6 + t * 1.5, 13)
		if k > 0.45:
			g.fill = C_FOAM[3 if k > 0.72 else 2]
			g.begin()
			g.ellipse(x + jit.call(i, 25) * 2, y - 1, 1.5 + 2.5 * (k - 0.45), 1 + 1.5 * (k - 0.45), 10)
			g.do_fill()
		var m := n1(i * 0.3 - t * 2, 29)
		if m > 0.55:
			g.fill = Color8(220, 230, 222, int(255 * 0.25 * (m - 0.55) * 2))
			g.begin()
			g.arc(x - d * 3 * m, y - 4 - 7 * m, 2 + 4 * m)
			g.do_fill()
		for j in 2:
			var q := h(i, floorf(t * 15) + j * 7, 31)
			if q > 0.35:
				continue
			g.fill = C_FOAM[3]
			g.rect(roundf(x + d * (2 + 6 * q) + jit.call(i, 33 + j) * 3), roundf(y - 3 - 10 * h(i, floorf(t * 15) + j, 32)), 1, 1)
	# (foam spilling over the stone ahead of its foot, a lace thinning out ahead)
	for i in foot.size():
		var fp := foot[i]
		for j in 3:
			var q := n1(i * 0.8 + j * 3.3 - s * 6, 41 + j)
			if q < 0.5:
				continue
			g.fill = C_FOAM[2] if j == 0 else C_FOAM[1]
			g.alpha = 0.5 + 0.5 * (q - 0.5) * 2
			g.rect(roundf(fp.x - d * (2 + j * 4) + jit.call(i, 45 + j) * 2), roundf(fp.y - 1 + j), 2 + roundf(3 * q), 1)
	g.alpha = 1.0


## The crash where two waves meet, `s` seconds after: a plume 5.87 tiles high (rising 0.35 s, falling 1.4 s), then its foam.
static func _plume(g: Cx, S: Vector2, s: float, t: float) -> void:
	var mid := Vector2(F.STONE["w"] / 2.0, F.CRASH["v"])
	var rise := minf(1.0, s / 0.35)
	var fall := maxf(0.0, 1.0 - (s - 0.35) / 1.4) if s > 0.35 else 1.0
	var hi := 5.87 * rise * (0.25 + 0.75 * fall)
	var half := 1.79 + (4.64 - 1.79) * minf(1.0, s / 1.75)
	if fall > 0.0:
		# (a column of mist, white at its heart, thinning out at its edges and top)
		var mp := _P(S, mid.x, mid.y)
		var top := mp.y - hi * UP
		var wide := half * 22.6
		var pts := PackedVector2Array([Vector2(mp.x - wide * 0.55, mp.y)])
		for i in 13:
			var q := i / 12.0
			pts.append(Vector2(mp.x - wide * 0.55 + wide * 1.1 * q, top + (1.0 - sin(PI * q)) * hi * UP * 0.8 + (n1(q * 6 + t * 3, 67) - 0.5) * 8))
		pts.append(Vector2(mp.x + wide * 0.55, mp.y))
		g.poly_grad(pts, top, mp.y, [[0.0, Color8(200, 214, 204, 0)], [0.35, Color(200 / 255.0, 214 / 255.0, 204 / 255.0, 0.35 * fall)], [1.0, Color(150 / 255.0, 170 / 255.0, 160 / 255.0, 0.55 * fall)]])
		# (water thrown up in it: drops and strings, rising then falling back)
		for i in 170:
			var q := h(i, 61)
			var across := (h(i, 62) * 2 - 1) * half * (0.3 + 0.7 * q)
			var up := hi * (1 - q * q) * (0.5 + 0.5 * h(i, 63))
			var p := _P(S, mid.x + across, mid.y + (h(i, 64) - 0.5) * 1.2)
			var yy := p.y - up * UP + ((s - 0.35) * 30 * h(i, 68) if s > 0.35 else 0.0)
			g.fill = C_FOAM[3 if h(i, 66) < 0.35 else (2 if h(i, 66) < 0.7 else 1)]
			g.alpha = minf(1.0, fall * 1.6)
			if h(i, 69) < 0.25:
				g.rect(roundf(p.x), roundf(yy), 1, 3 + roundf(4 * h(i, 70)))
			else:
				g.rect(roundf(p.x + sin(t * 8 + i) * 1.5), roundf(yy), 1 + roundf(2 * h(i, 65)), 1 + roundf(h(i, 71) * 1.5))
		g.alpha = 1.0
	# (the foam it leaves over the stone, spreading out either side, draining away)
	if s > F.CRASH["surge"][0]:
		var k: float = (s - F.CRASH["surge"][0]) / (F.CRASH["surge"][1] - F.CRASH["surge"][0])
		var al := maxf(0.0, 1.0 - k)
		var spread: float = F.CRASH["half"] * minf(1.0, (s - F.CRASH["surge"][0]) / 0.8)
		for i in 160:
			var u := mid.x + (h(i, 71) * 2 - 1) * spread
			var v: float = h(i, 72) * F.STONE["d"]
			if n1(u * 1.7 + v * 0.9 + s, 73) < 0.35 + 0.5 * k:
				continue
			var p := _P(S, u, v)
			g.fill = C_FOAM[3 if h(i, 74) < 0.3 else 1]
			g.alpha = al * 0.8
			g.rect(roundf(p.x), roundf(p.y), 3 + roundf(3 * h(i, 75)), 1)
		g.alpha = 1.0


# --- PHASE 3, THE GAME'S PARTS (colossus_fx.ts drawColossusP3, flame): with no pillars standing, none of theirs ---

## A flame at (x, y): ragged tongues licking up `hi` pixels, pink round a gold heart, `k` of it.
static func _flame(g: Cx, x: float, y: float, hi: float, k: float, t: float, seed: float) -> void:
	if k <= 0.02:
		return
	var H := hi * k
	for i in 9:
		var sx := (h(seed, i, 1) - 0.5) * 7 * k
		var ph := t * (6 + 4 * h(seed, i, 2)) + h(seed, i, 3) * 6
		var lick := H * (0.45 + 0.55 * n1(ph, seed + i))
		var w := maxf(1.0, roundf((2.5 - absf(sx) * 0.25) * k))
		var j := 0
		while j < lick:
			var q := j / maxf(1.0, lick)
			var sway := sin(ph * 1.7 + q * 4) * q * 2.2
			g.fill = FIRE[4] if q < 0.25 else (FIRE[3] if q < 0.5 else (FIRE[2] if q < 0.8 else FIRE[1]))
			g.alpha = minf(1.0, (1 - q * 0.6) * k)
			g.rect(roundf(x + sx + sway - w / 2), roundf(y - j), maxf(1.0, roundf(w * (1 - q * 0.6))), 1)
			j += 1
	g.alpha = 0.18 * k * (0.8 + 0.2 * sin(t * 11 + seed))
	g.fill = FIRE[2]
	g.begin()
	g.ellipse(x, y - H * 0.35, 9 * k + 2, 11 * k + 2, 14)
	g.do_fill()
	g.alpha = 1.0


static func _p3(g: Cx, S: Vector2, f, boss, _mid: Vector2, eye: Vector2, t: float, layer: String) -> void:
	var now: float = f.time
	if layer == "ground":
		# HIS GRIP: the stone cracked along its back edge where his heaps clamp onto it; the water surging over it, draining off
		if K["grip"] != INF:
			var s: float = now - float(K["grip"])
			g.fill = C_CRACK
			g.alpha = 0.9
			for c in 7:
				var u := 3.6 + c * 1.55 + (h(c, 91) - 0.5) * 0.6
				var v := 0.02
				var reach := 0.6 + 1.4 * h(c, 92)
				var grow := minf(1.0, s * 6)
				var i := 0
				while i < 14 * grow:
					var ang := PI / 2 + (n1(i * 0.7, c * 7 + 93) - 0.5) * 1.6
					u += cos(ang) * reach / 14
					v += sin(ang) * reach / 14
					var q := _P(S, u, v)
					g.rect(roundf(q.x), roundf(q.y), 1 + (1 if i < 5 else 0), 1)
					i += 1
			var wet := maxf(0.0, 1.0 - maxf(0.0, s - 0.4) / 2.2)
			if wet > 0.0:
				var reach := 1.3 * sm(0, 0.35, s) * (1 - sm(0.8, 2.6, s) * 0.6)
				var u := 2.5
				while u < 14.5:
					_quad(g, S, u, 0, u + 0.5, reach * (0.6 + 0.6 * n1(u * 1.7, 94)), Color8(10, 18, 16, int(255 * 0.35 * wet)))
					u += 0.5
				g.fill = C_FOAM[2]
				for i in 70:
					var uu := 2.5 + 12 * h(i, 95)
					var vv := reach * (0.6 + 0.6 * n1(uu * 1.7, 94)) * (0.7 + 0.3 * h(i, 96))
					if h(i, 97, floorf(t * 8)) < 0.4:
						continue
					g.alpha = 0.7 * wet
					var q := _P(S, uu, vv)
					g.rect(roundf(q.x), roundf(q.y), 2, 1)
			g.alpha = 1.0
		# HIS EYE COME DOWN: the stone cracked out from it, slime pooled round it, drying after it is dragged back up
		for e in K["eyeSlams"]:
			var s: float = now - float(e["at"])
			var al := maxf(0.0, 1.0 - maxf(0.0, s - 3.5) / 2.5)
			var seed: float = e["seed"]
			g.fill = C_CRACK
			g.alpha = al
			for c in 9:
				var a0 := c / 9.0 * TAU + h(seed, c, 1) * 0.6
				var u: float = e["u"]
				var v: float = e["v"]
				var reach: float = F.EYE_SLAM["r"] * (0.7 + 0.5 * h(seed, c, 2)) * minf(1.0, s * 8)
				for i in 16:
					var ang := a0 + (n1(i * 0.6, seed + c) - 0.5) * 1.2
					u += cos(ang) * reach / 16
					v += sin(ang) * reach / 16
					var q := _P(S, u, v)
					g.rect(roundf(q.x), roundf(q.y), 2 if i < 6 else 1, 1)
			var slime: float = minf(1.0, s * 4) if s < F.EYE_SLAM["long"] - F.EYE_SLAM["hit"] else maxf(0.0, 1.0 - (s - (F.EYE_SLAM["long"] - F.EYE_SLAM["hit"])) / 1.5)
			if slime > 0.0:
				g.alpha = 0.55 * slime
				var pts := PackedVector2Array()
				for i in 25:
					var ang := i / 24.0 * TAU
					var r := 0.9 * (0.75 + 0.45 * n1(i * 0.9 + s * 0.6, seed + 40))
					pts.append(_P(S, float(e["u"]) + cos(ang) * r, float(e["v"]) + sin(ang) * r))
				g.poly(pts, g.a(C_SLIME))
			g.alpha = 1.0
		# THE BOLTS' STRIKES: the stone scorched, smouldering, embers winking out (2.2 s)
		for b in K["bolts"]:
			var s: float = now - float(b["at"])
			var al := maxf(0.0, 1.0 - s / 2.2)
			var seed: float = b["seed"]
			g.alpha = 0.7 * al
			var pts := PackedVector2Array()
			for i in 21:
				var ang := i / 20.0 * TAU
				var r: float = F.RAIN["r"] * 0.8 * (0.7 + 0.5 * h(seed, i, 3))
				pts.append(_P(S, float(b["u"]) + cos(ang) * r, float(b["v"]) + sin(ang) * r))
			g.poly(pts, g.a(C_SCORCH))
			for i in 14:
				if h(seed, i, floorf(s * 6)) < 0.45 + s * 0.2:
					continue
				var ang := h(seed, i, 4) * TAU
				var r: float = F.RAIN["r"] * 0.7 * h(seed, i, 5)
				var q := _P(S, float(b["u"]) + cos(ang) * r, float(b["v"]) + sin(ang) * r)
				g.alpha = al
				g.fill = FIRE[2] if i % 3 != 0 else FIRE[3]
				g.rect(roundf(q.x), roundf(q.y), 1, 1)
			g.alpha = 1.0
		return
	# OVER IT: THE BOLTS: each falling out of the sky over its warning's last frames (from in front of him, a little to the left), bursting
	for r in f.rains:
		var fall: float = (r.t - 24.0 / 30.0) / (9.0 / 30.0)
		if fall < 0.0 or fall >= 1.0:
			continue
		var tp := _P(S, r.u, r.v)
		var H0 := 300.0 * (1.0 - fall)
		var H1 := maxf(0.0, 300.0 * (1.0 - fall) - 120.0)
		var a := Vector2(tp.x + 0.0866 * H0, tp.y - 0.846 * H0)
		var b := Vector2(tp.x + 0.0866 * H1, tp.y - 0.846 * H1)
		for q in [[4.0, FIRE[1], 0.45], [2.0, FIRE[3], 0.9], [1.0, FIRE[4], 1.0]]:
			var pts := PackedVector2Array([a])
			for k in range(1, 7):
				var qq := k / 6.0
				var j := (h(floorf(t * 30), k, 99) - 0.5) * 6 if k < 6 else 0.0
				pts.append(Vector2(a.x + (b.x - a.x) * qq + j, a.y + (b.y - a.y) * qq))
			g.c.draw_polyline(pts, Color(q[1], float(q[2])), float(q[0]))
	for bo in K["bolts"]:
		var s: float = now - float(bo["at"])
		if s > 0.45:
			continue
		var p := _P(S, bo["u"], bo["v"])
		var k := 1.0 - s / 0.45
		var seed: float = bo["seed"]
		_flame(g, p.x, p.y, 26 * (0.6 + 0.4 * k), k, t, seed)
		for i in 20:
			var ang := h(seed, i, 7) * PI
			var sp := 40 + 70 * h(seed, i, 8)
			var px := p.x + cos(ang) * sp * s * (-1.0 if h(seed, i, 9) < 0.5 else 1.0)
			var py := p.y - sin(ang) * sp * s + 160 * s * s
			g.alpha = k
			g.fill = FIRE[3] if i % 2 == 1 else FIRE[4]
			g.rect(roundf(px), roundf(py), 1, 1)
		g.alpha = 1.0
	# HIS EYE COME DOWN: slime and water flung up and out, chips of the stone
	for e in K["eyeSlams"]:
		var s: float = now - float(e["at"])
		if s > 1.4:
			continue
		var seed: float = e["seed"]
		for i in 40:
			var ang := h(seed, i, 11) * TAU
			var sp := 0.8 + 2.2 * h(seed, i, 12)
			var vz := 1.5 + 3.5 * h(seed, i, 13)
			var z := maxf(0.0, vz * s - 9 * s * s)
			if z <= 0.0 and s > 0.1:
				continue
			var q := _P(S, float(e["u"]) + cos(ang) * sp * s, float(e["v"]) + sin(ang) * sp * s)
			g.fill = C_STONE[2] if i < 12 else (C_GOO[2] if i % 2 == 1 else C_FOAM[1])
			g.rect(roundf(q.x), roundf(q.y - z * UP), 2, 2 if i < 12 else 1)
	# HIS GRIP: grit flung up off the stone's edge
	if K["grip"] != INF:
		var s: float = now - float(K["grip"])
		if s < 1.2:
			for i in 46:
				var u0 := 3 + 11 * h(i, 101)
				var vz := 2 + 3 * h(i, 102)
				var z := vz * s - 9 * s * s
				if z < 0.0:
					continue
				var q := _P(S, u0 + (h(i, 103) - 0.5) * s * 2, 0.1 + s * 1.2 * h(i, 104))
				g.fill = C_STONE[2] if i % 3 != 0 else C_FOAM[2]
				g.rect(roundf(q.x), roundf(q.y - z * UP), 1 + (i % 2), 1)
	# HIS EYE STRUCK: its dark ichor spurting (never cyan)
	var hit_at = boss.h2.a1.get("hitAt") if boss != null and is_instance_valid(boss) else null
	var hit_s: float = 99.0 if hit_at == null else now - float(hit_at)
	if eye != Vector2.INF and hit_s >= 0.0 and hit_s < 0.6:
		var seed := roundf(float(hit_at) * 30)
		for i in 22:
			var ang := -PI / 2 + (h(seed, i, 21) - 0.5) * 2.6
			var sp := 40 + 70 * h(seed, i, 22)
			g.alpha = maxf(0.0, 1.0 - hit_s / 0.6)
			g.fill = ICHOR[i % 4]
			g.rect(roundf(eye.x + cos(ang) * sp * hit_s), roundf(eye.y + sin(ang) * sp * hit_s + 150 * hit_s * hit_s), 2 if i % 3 != 0 else 3, 2)
		g.alpha = 1.0


# --- HIS DEATH (render/act1_fx/colossus.ts drawDeath; colossus_fx.ts drawColossusDeath): his own pictures from his middle at his place,
# the game's parts of it round them. `s`: seconds from the killing blow ---

const BURST3 := {"u": 8.71, "v": 0.72, "up": 5.68}


## One gob or drop of his ichor: [ang, d, arc, T, gob].
static func _spray(i: int) -> Array:
	var gob := i < 80
	var ang := (h(i, 701) - 0.5) * 2.6 + (h(i, 702) - 0.5) * 0.6
	return [ang, (3.0 if gob else 2.4) + 5 * pow(h(i, 703), 0.8), 0.6 + 2.4 * h(i, 704), 1 + h(i, 705), gob]


static func _spray_at(i: int, q: float) -> Vector3:
	var s := _spray(i)
	return Vector3(BURST3["u"] + sin(s[0]) * s[1] * q, BURST3["v"] + cos(s[0]) * s[1] * q, BURST3["up"] * (1 - q) + 4 * s[2] * q * (1 - q))


static func _death(g: Cx, S: Vector2, s: float, t: float, layer: String) -> void:
	var fk := s * 30.0
	var burst_s: float = s - F.DEATH["burst"] / 30.0
	var D: Dictionary = F.DEATH
	if layer == "ground":
		Art.want(["death"], [])
		# THE WATER over him: churned as he thrashes and slides back; boiling and heaving as he goes under; still at the end
		var boil := pow(sin(PI * sm(D["boil"][0], D["boil"][1], fk)), 0.7) if fk >= D["boil"][0] else 0.0
		var churn := 0.5 * (1 - sm(D["melt"][0], D["melt"][0] + 40, fk)) if fk >= 38 and fk < D["melt"][0] + 40 else 0.0
		var k := maxf(boil, churn)
		if k > 0.02:
			_bubbles(g, S, [[5.2, -2.2, 21], [8.5, -1.6, 22], [11.8, -2.2, 23], [6.8, -4.6, 24], [10.2, -4.6, 25], [8.5, -6.5, 26]], k, t)
		# HIS BONES in the shallows off the back edge, as the water clears over them
		if fk >= D["sink"][0] + 20:
			var al := sm(D["sink"][0] + 20, D["sink"][1] + 10, fk)
			var bones := [[6.2, -0.9, 0.5], [7.8, -1.35, -0.3], [9.6, -0.75, 0.2], [11.0, -1.2, -0.6]]
			for i in bones.size():
				var bq: Array = bones[i]
				var q := _P(S, bq[0], bq[1])
				var L := 9 + 4 * h(i, 711)
				g.c.draw_set_transform_matrix(Transform2D.IDENTITY.scaled(Vector2(2, 2)) * Transform2D(float(bq[2]), Vector2(roundf(q.x), roundf(q.y))))
				g.alpha = 0.55 * al
				g.fill = Color("#b8b09a")
				g.rect(-L / 2, -1, L, 2)
				g.rect(-L / 2 - 1, -2, 3, 4)
				g.rect(L / 2 - 2, -2, 3, 4)
				g.alpha = 0.35 * al
				g.fill = Color("#e4dcc4")
				g.rect(-L / 2 + 1, -1, L - 2, 1)
				g.c.draw_set_transform(Vector2.ZERO, 0.0, Vector2(2, 2))
			g.alpha = 1.0
		# HIS SLUDGE: run out over the stone's back edge as he melts, along its middle; drawn back off it after he is under
		if fk >= D["melt"][0]:
			var grow := sm(D["melt"][0], D["melt"][1], fk)
			var drain := sm(D["gone"] + 20, D["gone"] + 120, fk)
			var reach := func(u: float) -> float: return 3.4 * grow * (1 - drain) * pow(maxf(0.0, 1 - pow((u - 8.5) / 5.5, 2)), 0.55) * (0.72 + 0.4 * n1(u * 0.9 + s * 0.15, 731))
			if grow * (1 - drain) > 0.01:
				g.alpha = 0.92
				var pts := PackedVector2Array([_P(S, 3, 0)])
				var u := 3.0
				while u <= 14.001:
					pts.append(_P(S, u, reach.call(u) + 0.15 * (n1(u * 3 + s * 0.8, 732) - 0.5)))
					u += 0.2
				pts.append(_P(S, 14, 0))
				g.poly(pts, g.a(Color("#0b0a0d")))
				g.fill = Color("#2e3138")
				u = 3.2
				while u <= 13.8:
					var r: float = reach.call(u)
					if r >= 0.1:
						var q := _P(S, u, r * 0.85)
						if h(roundf(u * 4), floorf(t * 4), 733) < 0.6:
							g.rect(roundf(q.x), roundf(q.y), 2, 1)
					u += 0.25
				g.alpha = 1.0
		# HIS GORE on the stone where the spray came down: lying, fading from 5.4 s
		if burst_s > 0.0:
			var fade := 1.0 - sm(5.4, 9, burst_s)
			if fade > 0.0:
				for i in 300:
					var sp := _spray(i)
					if burst_s < sp[3]:
						continue
					var at := _spray_at(i, 1.0)
					if not F.on_stone(Vector2(at.x, at.y)):
						continue
					var q := _P(S, at.x, at.y)
					g.alpha = 0.9 * fade
					g.fill = ICHOR[i % 3]
					if sp[4]:
						var r := 2 + 2.5 * h(i, 712)
						var pts := PackedVector2Array()
						for j in 11:
							var a := j / 10.0 * TAU
							var rr := r * (0.6 + 0.6 * h(i, j, 713))
							pts.append(Vector2(q.x + cos(a) * rr, q.y + sin(a) * rr * 0.55))
						g.poly(pts, g.a(ICHOR[i % 3]))
						g.fill = Color("#4a2030")
						g.rect(roundf(q.x - r * 0.3), roundf(q.y - 1), 1, 1)
					else:
						g.rect(roundf(q.x), roundf(q.y), 1 + (i % 2), 1)
				g.alpha = 1.0
		# (his own pictures, from his middle at his place)
		var hx := _P(S, F.HIS_PLACE.x, F.HIS_PLACE.y)
		var k30 := floori(s * 30.0 + 1e-6)
		if k30 < Art.frames("death"):
			Art.body(g.c, "death", k30, hx.x, hx.y)
		return
	# OVER IT: THE BURST, a flash of his fire and then out; the spray flying, its ropes; his teeth dropping out
	var bp0 := _P(S, BURST3["u"], BURST3["v"])
	var bx := bp0.x
	var by := bp0.y - BURST3["up"] * UP
	if burst_s >= 0.0 and burst_s < 0.12:
		var k := 1.0 - burst_s / 0.12
		g.alpha = k
		g.fill = FIRE[4]
		g.begin()
		g.arc(bx, by, 10 + 30 * (1 - k))
		g.do_fill()
		g.alpha = 0.5 * k
		g.fill = FIRE[2]
		g.begin()
		g.arc(bx, by, 22 + 40 * (1 - k))
		g.do_fill()
		g.alpha = 1.0
	if burst_s >= 0.0 and burst_s < 2.2:
		if burst_s < 0.7:
			g.alpha = 0.35 * (1 - burst_s / 0.7)
			g.fill = ICHOR[1]
			g.begin()
			g.ellipse(bx, by + 10 * burst_s, 18 + 90 * burst_s, 10 + 40 * burst_s, 24)
			g.do_fill()
		if burst_s < 0.6:
			for i in 9:
				var sp := _spray(i)
				var at := _spray_at(i, minf(1.0, burst_s / sp[3]))
				var q := _P(S, at.x, at.y)
				var y := q.y - at.z * UP
				g.alpha = 0.8 * (1 - burst_s / 0.6)
				var pts := PackedVector2Array()
				var cx := (bx + q.x) / 2
				var cy := (by + y) / 2 + 14
				for j in 13:
					var tt := j / 12.0
					pts.append(Vector2((1 - tt) * (1 - tt) * bx + 2 * (1 - tt) * tt * cx + tt * tt * q.x, (1 - tt) * (1 - tt) * by + 2 * (1 - tt) * tt * cy + tt * tt * y))
				g.c.draw_polyline(pts, g.a(ICHOR[2]), 1.0)
		for i in 300:
			var sp := _spray(i)
			if burst_s >= sp[3]:
				continue
			var at := _spray_at(i, burst_s / sp[3])
			var q := _P(S, at.x, at.y)
			g.alpha = 1.0
			g.fill = ICHOR[(i + 1) % 4]
			var sz := 2 + roundf(2 * h(i, 714)) if sp[4] else 1.0
			g.rect(roundf(q.x), roundf(q.y - at.z * UP), sz, sz)
		g.alpha = 1.0
	# HIS TEETH, dropping out of his melting jaws one by one into the water (a pale tooth falling, its plop)
	if fk >= D["teeth"][0] and fk < D["teeth"][1] + 30:
		for i in 46:
			var f0: float = D["teeth"][0] + i / 46.0 * (D["teeth"][1] - D["teeth"][0]) + 6 * (h(i, 721) - 0.5)
			var ts := (fk - f0) / 30.0
			if ts < 0.0:
				continue
			var u := 4.6 + 7.8 * h(i, 722)
			var v := -1.0 - 1.6 * h(i, 723)
			var z0 := 1.6 + 2.4 * h(i, 724)
			var z := z0 - 0.5 * 14 * ts * ts
			var q := _P(S, u + 0.4 * ts * (h(i, 725) - 0.5), v)
			if z > 0.0:
				g.fill = Color("#d6cdb0")
				g.rect(roundf(q.x), roundf(q.y - z * UP) - 2, 1, 3)
				g.fill = Color("#3a3428")
				g.rect(roundf(q.x) + 1, roundf(q.y - z * UP) - 2, 1, 3)
			else:
				var ps := ts - sqrt(2 * z0 / 14)
				if ps < 0.45:
					g.alpha = 0.7 * (1 - ps / 0.45)
					g.stroke = C_FOAM[2]
					g.lw = 1.0
					g.begin()
					g.ellipse(roundf(q.x) + 0.5, roundf(q.y) + 0.5, 1 + 5 * ps, 0.6 + 2.2 * ps, 14)
					g.do_stroke()
					g.alpha = 1.0
