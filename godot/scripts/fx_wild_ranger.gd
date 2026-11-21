## BIG AND WILD, THE RANGER'S SHARE (render/wild.ts; art/moves3.ts WILD, on in the game): WIND, not power (the owner: "Can we make
## the blue effects just like wind instead of energy?"), pale and cool and seen through (AIR).
##   THE SHOT (loose, follow, draw): a puff of white at the bow, two rings of air thrown off across the arrow's way, lines of wind
##     ahead of it, a puff of dust at his feet, the screen kicking; behind the arrow a trail of air from where it was let go to its
##     point, thinning away behind, with air spinning round its last stretch (the arrow spins), drawing in after it once it has
##     struck; now and then a line of wind peeling off its point. IT STRIKES (arrow_hit): a white burst, a ring of air, what the
##     struck is made of flung out, wind punched on out the far side, the game holding an instant, the screen kicking.
##   THE VOLLEY (volley_up, ongoing, volley_drop, volley_fall): a gust bursts off the bow, upward; a column of wind spirals up with
##     the arrows, hoops of air standing round it as it goes; grit round his knee. Wind gathers round the patch while the arrows are
##     up, and turns over it while they come down (rings of wind going round it, grit flung round). Each arrow brings a streak of
##     wind down with it; where it lands a puff of air and grit, and what it strikes it punches into.
##   THE ROLL (roll_off, ongoing): grit kicked up where he dives and a breath of wind round him; a swoosh of air along his tumble,
##     curling off behind him.
##   THE TRAP (trap_set, blast, gust_hit): the glint of its jaws as they open, a breath of wind, grit; going off, a white flash and a
##     whirlwind tearing up out of it (a funnel of air turning, narrow at the floor and wide at its top, rising and thinning away),
##     grit and dust flung round in it, a ring of wind tearing outward past its edge, the screen kicking; what it catches buffeted.
## fx.gd hands on to this where the game's effects hand on to `this.wild` for him; ranger_look.gd tells it what he is doing.
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
const SPARKS_MOST := 880

var fx
var clock := 0.0
## The trail each arrow leaves: {shot, x0, y0, ux, uy, z, hx, hy, gone, spin}.
var tracers: Array = []
## The arrows in flight as last seen (what is hit near one is struck by it), and every arrow already seen let go.
var arrows: Array = []
var _seen := {}
## Rings of air thrown off at the loose: {x, y, z, ux, uy, t, dur}.
var rings: Array = []
## Hoops of air round a rising column of wind: {x, y, z, r, t, dur, vz}.
var hoops: Array = []
## A trap's whirlwind: {x, y, r, t, dur, spin}; where one tore up a moment ago ({x, y, r, at}: what it caught is buffeted).
var twisters: Array = []
var gusts: Array = []
## (what the frame loop says of him each step: the traps as they lie, his volleys coming down, his roll)
var traps_before: Array = []
var volleys: Array = []
var move := {}
var _move_seen := {}
var hero_at := Vector2.ZERO


func _init() -> void:
	L.ready_up()


func clear() -> void:
	tracers = []
	arrows = []
	_seen = {}
	rings = []
	hoops = []
	twisters = []
	gusts = []
	traps_before = []
	volleys = []
	move = {}
	_move_seen = {}


func alive() -> bool:
	return not (tracers.is_empty() and rings.is_empty() and hoops.is_empty() and twisters.is_empty() and volleys.is_empty() and move.is_empty())


func _spark(x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, colors: PackedColorArray, grav := 180.0, streak := 0.0, size := 0.0) -> void:
	if fx.pn >= SPARKS_MOST:
		return
	fx.add(x, y, z, vx, vy, vz, life, L.pick(colors), size if size > 0.0 else (2.0 if randf() < 0.22 else 1.0), grav, null, streak)


func _air(n: int) -> PackedColorArray:
	var out := PackedColorArray()
	for i in n:
		out.append(L.AIR[i])
	return out


func _grit() -> PackedColorArray:
	var P: Dictionary = L.P
	return PackedColorArray([P["st6"], P["st5"], P["st4"]])


func update(dt: float) -> void:
	clock += dt
	for i in range(tracers.size() - 1, -1, -1):
		var q: Dictionary = tracers[i]
		q["spin"] = float(q["spin"]) + dt * 40.0
		if float(q["gone"]) >= 0.0:
			q["gone"] = float(q["gone"]) + dt
		if float(q["gone"]) > 0.2:
			tracers.remove_at(i)
	for i in range(rings.size() - 1, -1, -1):
		rings[i]["t"] = float(rings[i]["t"]) + dt
		if float(rings[i]["t"]) >= float(rings[i]["dur"]):
			rings.remove_at(i)
	for i in range(twisters.size() - 1, -1, -1):
		var w: Dictionary = twisters[i]
		w["t"] = float(w["t"]) + dt
		w["spin"] = float(w["spin"]) + dt * 16.0
		if float(w["t"]) >= float(w["dur"]):
			twisters.remove_at(i)
	for i in range(hoops.size() - 1, -1, -1):
		var o: Dictionary = hoops[i]
		o["t"] = float(o["t"]) + dt
		if float(o["t"]) > 0.0:
			o["z"] = float(o["z"]) + float(o["vz"]) * dt
		if float(o["t"]) >= float(o["dur"]):
			hoops.remove_at(i)
	gusts = gusts.filter(func(s): return clock - float(s["at"]) < 0.3)
	if dt > 0.0:
		_ongoing(dt)


## Each frame: his roll as it goes, the wind over a volley's patch (wild.ts ongoing).
func _ongoing(dt: float) -> void:
	var rate := func(per_sec: float) -> int: return int(floorf(dt * per_sec + randf()))
	var P: Dictionary = L.P
	if not move.is_empty():
		if not _move_seen.has("m") or _move_seen["m"] != move:
			_move_seen = {"m": move}
			_roll_off(move["from"], move["to"])
		var x0: Vector2 = move["from"]
		var x1: Vector2 = move["to"]
		var len := x0.distance_to(x1)
		if len <= 0.0:
			len = 1.0
		var ux := (x1.x - x0.x) / len
		var uy := (x1.y - x0.y) / len
		var h := hero_at
		# (a swoosh of air along his tumble, curling off behind him; and grit kicked up)
		var side := sin(clock * 30.0)
		for i in rate.call(120.0):
			var v := L.rnd(1.5, 3.5)
			_spark(h.x - ux * 0.25 + L.rnd(-0.1, 0.1), h.y - uy * 0.25 + L.rnd(-0.1, 0.1), L.rnd(2, 16), -ux * v - uy * side * 1.6, -uy * v + ux * side * 1.6, L.rnd(-10, 30), L.rnd(0.12, 0.2), _air(3), 0.0, L.rnd(4, 7))
		for i in rate.call(40.0):
			var q := randf() * TAU
			_spark(h.x + cos(q) * 0.2, h.y + sin(q) * 0.2, 1.0, cos(q) * L.rnd(0.4, 1.2) - ux, sin(q) * L.rnd(0.4, 1.2) - uy, L.rnd(10, 40), L.rnd(0.25, 0.45), _grit(), 180.0)
	else:
		_move_seen = {}
	# THE VOLLEYS: wind gathers round the patch while the arrows are up, and turns over it while they come down
	for v in volleys:
		var up := clampf(1.0 + float(v["t"]) / 0.45, 0.0, 1.0) if float(v["t"]) < 0.0 else 1.0
		var vx: float = v["x"]
		var vy: float = v["y"]
		var vr: float = v["r"]
		fx.wild._vortex("volley%d" % int(v["id"]), vx, vy, vr * (1.35 - 0.3 * up), 7.0, 0.5 + 0.5 * up, false)
		fx.wild._vortex("volleyLow%d" % int(v["id"]), vx, vy, vr * (0.95 - 0.25 * up), 2.0, 0.4 + 0.4 * up, false)
		var cs := PackedColorArray([P["st6"], P["st5"], L.AIR[2], L.AIR[3]])
		for i in rate.call(46.0):
			var q := randf() * TAU
			var rr := vr * L.rnd(0.3, 1.15)
			var sp := L.rnd(1.5, 3.2)
			_spark(vx + cos(q) * rr, vy + sin(q) * rr, L.rnd(1, 12), -sin(q) * sp - cos(q) * 0.5, cos(q) * sp - sin(q) * 0.5, L.rnd(10, 50), L.rnd(0.3, 0.6), cs, 60.0)


## THE ROLL BEGINS: grit kicked up where he dives, and a breath of wind round him (wild.ts rollOff).
func _roll_off(a: Vector2, b: Vector2) -> void:
	var len := a.distance_to(b)
	if len <= 0.0:
		len = 1.0
	var ux := (b.x - a.x) / len
	var uy := (b.y - a.y) / len
	for i in 12:
		var q := atan2(-uy, -ux) + L.rnd(-1.2, 1.2)
		var v := L.rnd(0.6, 2)
		_spark(a.x, a.y, 1.0, cos(q) * v, sin(q) * v, L.rnd(20, 60), L.rnd(0.3, 0.5), _grit(), 200.0)
	fx.ring(a.x, a.y, 0.7, 0.2, _air(3), false, {"swirl": true})
	fx.kick(0.7)


## A TRAP IS SET: the glint of its jaws as they open, a breath of wind round it, grit (wild.ts trapSet).
func trap_set(x: float, y: float) -> void:
	var P: Dictionary = L.P
	fx.flash(x, y, 3.0, 0.3, 0.08, PackedColorArray([P["white"], L.AIR[1], L.AIR[2]]))
	fx.ring(x, y, 0.6, 0.22, _air(3), false, {"swirl": true, "delay": 0.03})
	for i in 6:
		var q := randf() * TAU
		_spark(x, y, 1.0, cos(q) * L.rnd(0.5, 1.4), sin(q) * L.rnd(0.5, 1.4), L.rnd(20, 50), L.rnd(0.25, 0.45), PackedColorArray([P["st6"], P["st5"]]), 200.0)


## A 'burst' of the kind a trap goes off in ('blast'): if a trap lay there, IT GOES OFF IN WIND (wild.ts blast).
func blast(x: float, y: float, r: float) -> void:
	var near := false
	for t in traps_before:
		if Vector2(float(t["x"]) - x, float(t["y"]) - y).length() < 0.4:
			near = true
	if not near:
		return
	var P: Dictionary = L.P
	twisters.append({"x": x, "y": y, "r": maxf(0.55, r * 0.42), "t": 0.0, "dur": 0.8, "spin": 0.0})
	fx.flash(x, y, 5.0, 0.6, 0.09, PackedColorArray([P["white"], L.AIR[1], L.AIR[2]]))
	fx.ring(x, y, r * 1.2, 0.28, _air(3), false, {"swirl": true, "heavy": true})
	fx.ring(x, y, r * 0.75, 0.24, _air(2), false, {"swirl": true, "delay": 0.05})
	var dust := PackedColorArray([P["st6"], P["st5"], P["st4"], P["st7"]])
	for i in 30:
		var q := randf() * TAU
		var v := L.rnd(1.5, 4)
		_spark(x + cos(q) * 0.2, y + sin(q) * 0.2, L.rnd(1, 10), cos(q) * v - sin(q) * v, sin(q) * v + cos(q) * v, L.rnd(40, 150), L.rnd(0.35, 0.7), dust, 300.0, 0.0, 2.0 if randf() < 0.3 else 1.0)
	for i in 18:
		var q := randf() * TAU
		var v := L.rnd(6, 10)
		_spark(x, y, L.rnd(3, 18), cos(q) * v, sin(q) * v, L.rnd(-10, 30), L.rnd(0.08, 0.14), PackedColorArray([P["white"], L.AIR[1]]), 0.0, L.rnd(6, 10))
	fx.glow(x, y, 50.0, 0.12, 40)
	fx.kick(2.8)
	fx.hold_for(0.04)
	gusts.append({"x": x, "y": y, "r": r + 0.4, "at": clock})


## A VOLLEY IS LOOSED: a gust off the bow, upward; a column of wind spiralling up with the arrows, hoops of air round it; grit round
## his knee; the screen kicks (wild.ts volleyUp). (bx, by, bz: where the bow is.)
func volley_up(bx: float, by: float, bz: float, echo: bool) -> void:
	var P: Dictionary = L.P
	fx.flash(bx, by, bz + 2.0, 0.3 if echo else 0.5, 0.09, PackedColorArray([P["white"], L.AIR[1], L.AIR[2]]))
	for i in (2 if echo else 4):
		hoops.append({"x": bx, "y": by, "z": bz + 3.0 + i * 9.0, "r": 0.28 + i * 0.05, "t": -i * 0.03, "dur": 0.3, "vz": 90.0})
	for i in (10 if echo else 26):
		# (the column of wind: lines of it spiralling up off the bow with the arrows)
		var q := randf() * TAU
		var v := L.rnd(0.6, 1.6)
		_spark(bx + cos(q) * 0.12, by + sin(q) * 0.12, bz + L.rnd(0, 6), -sin(q) * v, cos(q) * v, L.rnd(160, 300), L.rnd(0.18, 0.32), _air(3), 0.0, L.rnd(7, 12))
	var h := hero_at
	for i in (4 if echo else 12):
		var q := randf() * TAU
		var v := L.rnd(0.6, 1.8)
		_spark(h.x + cos(q) * 0.2, h.y + sin(q) * 0.2, 1.0, cos(q) * v, sin(q) * v, L.rnd(15, 50), L.rnd(0.3, 0.55), _grit(), 200.0)
	fx.ring(h.x, h.y, 0.8, 0.2, _air(3), false, {"swirl": true})
	if not echo:
		fx.kick(1.4)


## AN ARROW OF THE VOLLEY COMES DOWN, `in_sec` from landing: a streak of wind falls with it (wild.ts volleyDrop).
func volley_drop(x: float, y: float, in_sec: float) -> void:
	var t := maxf(0.05, in_sec)
	_spark(x + L.rnd(-0.03, 0.03), y + L.rnd(-0.03, 0.03), 72.0, 0.0, 0.0, -72.0 / t, t, _air(2), 0.0, 22.0, 1.0)


## IT LANDS: a puff of air and grit where it goes in; what it struck, it punches into (wild.ts volleyFall).
func volley_fall(x: float, y: float, hits: int) -> void:
	var P: Dictionary = L.P
	fx.ring(x, y, 0.32, 0.14, _air(3), false)
	for i in 4:
		var q := randf() * TAU
		_spark(x, y, 1.0, cos(q) * L.rnd(0.4, 1.2), sin(q) * L.rnd(0.4, 1.2), L.rnd(15, 45), L.rnd(0.25, 0.45), PackedColorArray([P["st6"], P["st5"]]), 200.0)
	if hits > 0:
		fx.flash(x, y, 12.0, 0.32, 0.07, PackedColorArray([P["white"], L.AIR[1], L.AIR[2]]))
		fx.wild._debris(x, y, L.rnd(0, TAU), 0.55)
		for i in 5:
			_spark(x, y, L.rnd(14, 24), L.rnd(-0.6, 0.6), L.rnd(-0.6, 0.6), -L.rnd(120, 200), L.rnd(0.06, 0.1), _air(2), 0.0, L.rnd(6, 10))
		fx.kick(0.9)


## His arrows in flight, each frame (wild.ts follow, the arrows): each newly let go is loosed (loose), each's trail follows its point;
## now and then a line of wind peels off its point; an arrow no longer in the air has its trail drawn in after it.
func follow(shots: Array, k: float, arrow_z: float) -> void:
	arrows = []
	for p in shots:
		if p.get("look", "") != "arrow":
			continue
		arrows.append(Vector2(p["x"], p["y"]))
		var v := Vector2(p["vx"], p["vy"]).length()
		if v <= 0.0:
			v = 1.0
		var ux: float = float(p["vx"]) / v
		var uy: float = float(p["vy"]) / v
		if not p.get("_loosed", false):
			p["_loosed"] = true
			_loose(float(p["x"]) - ux * 0.2, float(p["y"]) - uy * 0.2, ux, uy, arrow_z, p)
		for q in tracers:
			if is_same(q["shot"], p):
				q["hx"] = p["x"]
				q["hy"] = p["y"]
		if k > 0.0 and randf() < 0.5 * k:
			_spark(float(p["x"]) - ux * 0.1, float(p["y"]) - uy * 0.1, arrow_z + L.rnd(-2, 2), -ux * L.rnd(1, 3) - uy * L.rnd(-0.8, 0.8), -uy * L.rnd(1, 3) + ux * L.rnd(-0.8, 0.8), 0.0, L.rnd(0.08, 0.14), _air(2), 0.0, 4.0)
	for q in tracers:
		if float(q["gone"]) < 0.0:
			var still := false
			for p in shots:
				if is_same(q["shot"], p):
					still = true
			if not still:
				q["gone"] = 0.0


## AN ARROW IS LET GO, AN ARCHER'S WAY, IN WIND (wild.ts loose).
func _loose(x: float, y: float, ux: float, uy: float, z: float, shot) -> void:
	var P: Dictionary = L.P
	fx.flash(x, y, z, 0.3, 0.07, PackedColorArray([P["white"], L.AIR[1], L.AIR[2]]))
	rings.append({"x": x + ux * 0.2, "y": y + uy * 0.2, "z": z, "ux": ux, "uy": uy, "t": 0.0, "dur": 0.22})
	rings.append({"x": x + ux * 0.65, "y": y + uy * 0.65, "z": z, "ux": ux, "uy": uy, "t": -0.04, "dur": 0.24})
	for i in 6:
		var q := atan2(uy, ux) + L.rnd(-0.25, 0.25)
		var v := L.rnd(7, 11)
		_spark(x + L.rnd(-0.1, 0.1), y + L.rnd(-0.1, 0.1), z + L.rnd(-3, 3), cos(q) * v, sin(q) * v, 0.0, L.rnd(0.06, 0.12), _air(2), 0.0, L.rnd(6, 10))
	for i in 6:
		var q := randf() * TAU
		var v := L.rnd(0.4, 1.2)
		_spark(x - ux * 0.6 + cos(q) * 0.2, y - uy * 0.6 + sin(q) * 0.2, 1.0, cos(q) * v, sin(q) * v, L.rnd(10, 40), L.rnd(0.25, 0.5), PackedColorArray([P["st6"], P["st5"]]), 160.0)
	tracers.append({"shot": shot, "x0": x, "y0": y, "ux": ux, "uy": uy, "z": z, "hx": x, "hy": y, "gone": -1.0, "spin": randf() * 6.0})
	fx.kick(1.2)


## Something was hit at (x, y): if one of his arrows is there, it punches into it; if a trap's whirlwind tore up there a moment ago,
## it buffets it. Says whether it did (wild.ts hit, his part).
func hit(x: float, y: float) -> bool:
	for a in arrows:
		if (a as Vector2).distance_to(Vector2(x, y)) <= 1.1:
			return _arrow_hit(x, y)
	for s in gusts:
		if Vector2(float(s["x"]) - x, float(s["y"]) - y).length() <= float(s["r"]):
			return _gust_hit(x, y, atan2(y - float(s["y"]), x - float(s["x"])))
	return false


## An arrow strikes (wild.ts arrowHit).
func _arrow_hit(x: float, y: float) -> bool:
	var P: Dictionary = L.P
	# (which way it was going: the trail of the arrow that is nearest)
	var ux := 1.0
	var uy := 0.0
	var near := INF
	for q in tracers:
		var d := Vector2(float(q["hx"]) - x, float(q["hy"]) - y).length()
		if d < near:
			near = d
			ux = q["ux"]
			uy = q["uy"]
	fx.flash(x, y, 12.0, 0.42, 0.08, PackedColorArray([P["white"], L.AIR[1], L.AIR[2]]))
	fx.ring(x, y, 0.55, 0.16, _air(3), false)
	fx.wild._debris(x, y, atan2(uy, ux), 0.9)
	# (punched on through: lines of wind out of the far side of it)
	for i in 8:
		var q := atan2(uy, ux) + L.rnd(-0.35, 0.35)
		var v := L.rnd(5, 9)
		_spark(x + ux * 0.2, y + uy * 0.2, L.rnd(8, 16), cos(q) * v, sin(q) * v, 0.0, L.rnd(0.08, 0.15), _air(2), 0.0, L.rnd(5, 9))
	fx.kick(1.5)
	fx.hold_for(0.03)
	return true


## A trap's whirlwind catches something: a white puff and a hoop of wind round it, lines of wind tearing past it (wild.ts gustHit).
func _gust_hit(x: float, y: float, a: float) -> bool:
	var P: Dictionary = L.P
	fx.flash(x, y, 12.0, 0.38, 0.08, PackedColorArray([P["white"], L.AIR[1], L.AIR[2]]))
	fx.ring(x, y, 0.5, 0.16, _air(3), false, {"swirl": true})
	for i in 8:
		var q := a + L.rnd(-0.5, 0.5)
		var v := L.rnd(5, 9)
		_spark(x, y, L.rnd(6, 20), cos(q) * v, sin(q) * v, L.rnd(-10, 40), L.rnd(0.08, 0.14), _air(2), 0.0, L.rnd(5, 9))
	return true


## A line of whole game pixels (wild.ts line), on `c` in picture pixels.
static func _line(c: CanvasItem, x0: float, y0: float, x1: float, y1: float, col: Color) -> void:
	var ax := roundi(x0)
	var ay := roundi(y0)
	var bx := roundi(x1)
	var by := roundi(y1)
	var dx := absi(bx - ax)
	var dy := -absi(by - ay)
	var stx := 1 if ax < bx else -1
	var sty := 1 if ay < by else -1
	var err := dx + dy
	for n in 400:
		c.draw_rect(Rect2(ax * 2, ay * 2, 2, 2), col)
		if ax == bx and ay == by:
			break
		var e2 := 2 * err
		if e2 >= dy:
			err += dy
			ax += stx
		if e2 <= dx:
			err += dx
			ay += sty


## (wild.ts draw, his part) The trails of air behind his arrows; the rings of air thrown off at the loose; a trap's whirlwind; the
## hoops of air round a volley's rising column.
func draw(c: CanvasItem) -> void:
	var A: PackedColorArray = L.AIR
	for q in tracers:
		var flown := Vector2(float(q["hx"]) - float(q["x0"]), float(q["hy"]) - float(q["y0"])).length()
		var long := minf(flown, 2.6) * (1.0 if float(q["gone"]) < 0.0 else maxf(0.0, 1.0 - float(q["gone"]) / 0.2))
		if long < 0.05:
			continue
		var z: float = q["z"]
		var hx: float = fx.gx(q["hx"], q["hy"])
		var hy: float = fx.gy(q["hx"], q["hy"]) - z
		var bx0: float = float(q["hx"]) - float(q["ux"]) * long
		var by0: float = float(q["hy"]) - float(q["uy"]) * long
		var tx: float = fx.gx(bx0, by0)
		var ty: float = fx.gy(bx0, by0) - z
		var at := func(k: float) -> Vector2: return Vector2(tx + (hx - tx) * k, ty + (hy - ty) * k)
		# (A TRAIL OF AIR, pale and seen through, thinning away behind it)
		var a: Vector2 = at.call(0.4)
		var b: Vector2 = at.call(0.75)
		_line(c, tx, ty, a.x, a.y, Color(A[2], 0.25))
		_line(c, a.x, a.y, b.x, b.y, Color(A[1], 0.45))
		_line(c, b.x, b.y, hx, hy, Color(A[0], 0.7))
		if float(q["gone"]) < 0.0:
			# (the air spinning round its last stretch)
			var len := Vector2(hx - tx, hy - ty).length()
			if len <= 0.0:
				len = 1.0
			var ox := -(hy - ty) / len
			var oy := (hx - tx) / len
			for i in range(1, 13):
				var k := 1.0 - i * 0.055
				if k < 0.2:
					break
				var p: Vector2 = at.call(k)
				var w := sin(float(q["spin"]) - i * 0.9)
				var hh := cos(float(q["spin"]) - i * 0.9)
				if hh < -0.3:
					continue
				c.draw_rect(Rect2(roundf(p.x + ox * w * 2.5) * 2.0, roundf(p.y + oy * w * 2.5 - hh) * 2.0, 2, 2), Color(A[0], 0.65 * k))
	for r in rings:
		if float(r["t"]) < 0.0:
			continue
		var k := float(r["t"]) / float(r["dur"])
		var cx: float = fx.gx(r["x"], r["y"])
		var cy: float = fx.gy(r["x"], r["y"]) - float(r["z"])
		# (a hoop of air seen a little from the side: thin along the way the arrow goes, wide across it)
		var fx0 := (float(r["ux"]) - float(r["uy"])) * 16.0
		var fy0 := (float(r["ux"]) + float(r["uy"])) * 8.0
		var fl := Vector2(fx0, fy0).length()
		if fl <= 0.0:
			fl = 1.0
		var ax := fx0 / fl
		var ay := fy0 / fl
		var big := 2.0 + 9.0 * k
		var col := Color(A[0] if k < 0.4 else A[1], 0.8 * (1.0 - k))
		for i in 18:
			var t := float(i) / 18.0 * TAU
			var along := cos(t) * big * 0.3
			var across := sin(t) * big
			c.draw_rect(Rect2(roundf(cx + ax * along - ay * across) * 2.0, roundf(cy + ay * along + ax * across) * 2.0, 2, 2), col)
	# A TRAP'S WHIRLWIND: a funnel of air turning, narrow at the floor and wide at its top, rising as it tears up and thinning away
	for w in twisters:
		var k := float(w["t"]) / float(w["dur"])
		var cx: float = fx.gx(w["x"], w["y"])
		var cy: float = fx.gy(w["x"], w["y"])
		var grow := minf(1.0, float(w["t"]) / 0.12)
		var layers := 9
		for j in layers:
			var f := float(j) / (layers - 1)
			var z := f * 44.0 * grow
			var rr := float(w["r"]) * (0.25 + 0.9 * f) * (0.7 + 0.3 * grow)
			var n := 10 + roundi(rr * 12.0)
			for i in n:
				var a := float(w["spin"]) * (1.2 - f * 0.5) + float(i) / n * TAU + j * 0.7
				var front := sin(a) > -0.2
				if not front and i % 2 == 0:
					continue
				var col := Color(A[0] if f < 0.3 else (A[1] if f < 0.65 else A[2]), (1.0 - k) * (0.75 if front else 0.3) * (0.5 + 0.5 * (1.0 - f)))
				c.draw_rect(Rect2(roundf(cx + cos(a) * rr * 22.6) * 2.0, roundf(cy - z + sin(a) * rr * 11.3) * 2.0, 4.0 if front else 2.0, 2.0), col)
	# HOOPS OF AIR lying round a rising column of wind (a volley loosed)
	for o in hoops:
		if float(o["t"]) < 0.0:
			continue
		var k := float(o["t"]) / float(o["dur"])
		var cx: float = fx.gx(o["x"], o["y"])
		var cy: float = fx.gy(o["x"], o["y"]) - float(o["z"])
		var rr := float(o["r"]) * (1.0 + 0.9 * k)
		var col := Color(A[0] if k < 0.4 else A[1], 0.85 * (1.0 - k))
		for i in 26:
			var a := float(i) / 26.0 * TAU
			c.draw_rect(Rect2(roundf(cx + cos(a) * rr * 22.6) * 2.0, roundf(cy + sin(a) * rr * 11.3) * 2.0, 2, 2), col)
