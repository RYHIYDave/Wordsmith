## BIG AND WILD, THE MAGE'S SHARE (render/wild.ts; art/moves3.ts WILD, on in the game): her power getting away from her. The owner,
## of the Wave: "there should be energy crackling and bolts shooting out, barely able to contain it". In the friend's cyan, white at
## its heart (CRACKLE: what glows on a friend is cyan); what the wave throws off keeps the violet of her magic (SPARKS).
##   THE CRYSTAL CRACKLES (charge, update): where her crystal is in each picture, and how hot it burns (the bake's part `charge`),
##     throws little arcs and sparks all the time, a few in her guard and a storm of them as she gathers a spell; at its hottest,
##     bolts jump from it to the floor round her; its light flickers with it.
##   THE WAVE IS LET GO (cast): a flash at the crystal and a ring before her, a fan of sparks, bolts shot out ahead of it to the
##     floor; the screen kicks. IN FLIGHT (follow): arcs crawl along its crest and leap off it, sparks stream back off it, bolts fork
##     ahead of it to the floor. WHAT IT HITS crackles (hit: a flash, arcs crawling over the struck, sparks, a bolt to the floor).
##   THE ORB (orb_set, update, orb_gone): as the staff comes down, arcs run round her and bolts strike out of her, and a great bolt
##     leaps from her to where it hangs, which bursts with bolts to the floor; as it hangs it crackles, arcs and sparks off it and now
##     and then a bolt; its time up, its power folds in on it with a crack and is spent in a last spray of sparks. ITS WAVES (nova):
##     a ring of arcs runs out, bolts lash out to what is near (five at most), sparks fly, the screen jolts.
##   THE WARP (warp, thunder): where she went from her power folds in on her with a crack; a great bolt joins the two places, sparks
##     strewn along it; where she comes out, a thunderclap: a great flash, bolts striking out all round her, a ring of arcs, a
##     fountain of sparks, the game holding an instant and the screen kicking hard.
## Each arc a jagged line through the air (points in the world and their heights), white at its heart while fresh, cooling to the
## crystal's cyan, with a glow either side; a bolt two pixels thick while it is fresh (draw).
## fx.gd hands on to this where the game's effects hand on to `this.wild` for her.
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")

## (how high an orb hangs, game pixels: where its middle is: wild.ts ORB_Z)
const ORB_Z := 16.0
const SPARKS_MOST := 880

var fx
var clock := 0.0
var later: Array = []
## Arcs of power: {pts (x, y, z, x, y, z ...), t, dur, bolt}.
var arcs: Array = []
## Where the power she holds burns, as the renderer last said: {x, y, z, heat, fx, fy, age}.
var held := {}
## Arcs, sparks and bolts owed to the crystal by how hot it burns, carried from one moment to the next.
var owed := {"arcs": 0.0, "sparks": 0.0, "bolts": 0.0}
## Her waves in flight, as last seen: {x, y, r}: what they hit crackles.
var waves: Array = []
## Where her power burst a moment ago (an orb's wave, her coming out of a warp): {x, y, r, at}: what is hit there crackles.
var novas: Array = []
## A warp begun this step: where she went from; and where she came out (the burst there is her thunderclap).
var warp_from := {}
var warp_to := {}
## Her orbs as last seen, by id (one gone has burst out): {id: Vector2}; and the orbs as they are now ({id, x, y, t, life}).
var orbs_seen := {}
var orbs: Array = []
## The monsters as last seen, for the bolts an orb's wave lashes out to.
var mobs: Array = []

var CRACKLE: PackedColorArray
var SPARKS: PackedColorArray


func _init() -> void:
	L.ready_up()
	CRACKLE = L.CRACKLE
	var P: Dictionary = L.P
	SPARKS = PackedColorArray([CRACKLE[0], CRACKLE[1], CRACKLE[2], P["pu5"], P["pu4"]])


func clear() -> void:
	later = []
	arcs = []
	held = {}
	waves = []
	novas = []
	warp_from = {}
	warp_to = {}
	orbs_seen = {}
	orbs = []


func alive() -> bool:
	return not (arcs.is_empty() and later.is_empty() and held.is_empty() and orbs.is_empty())


func _spark(x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, colors: PackedColorArray, grav := 180.0, streak := 0.0, size := 0.0) -> void:
	if fx.pn >= SPARKS_MOST:
		return
	fx.add(x, y, z, vx, vy, vz, life, L.pick(colors), size if size > 0.0 else (2.0 if randf() < 0.22 else 1.0), grav, null, streak)


static func _smooth(a: float, b: float, v: float) -> float:
	var k := clampf((v - a) / (b - a), 0.0, 1.0)
	return k * k * (3.0 - 2.0 * k)


## A place in the world `right` game pixels to the right of another on the screen and `up` pixels higher (wild.ts beside).
static func _beside(x: float, y: float, z: float, right: float, up: float) -> Array:
	return [x + right / 32.0, y - right / 32.0, z + up]


## The renderer, each frame she is drawn: where the power she holds burns (a place in the world and its height), how hot, and the
## way she faces (wild.ts charge).
func charge(x: float, y: float, z: float, heat: float, fx_: float, fy_: float) -> void:
	held = {"x": x, "y": y, "z": z, "heat": heat, "fx": fx_, "fy": fy_, "age": 0.0}


## A jagged arc from one point to another (places in the world and their heights), in `n` pieces, each joint thrown `jit` tiles aside
## and `jz` pixels up or down; bowed up by `bow` pixels in the middle (wild.ts arc).
func _arc(a: Array, b: Array, n: int, jit: float, jz: float, dur: float, bolt := false, bow := 0.0) -> void:
	var pts: Array = [a[0], a[1], a[2]]
	for i in range(1, n):
		var k := float(i) / n
		pts.append(a[0] + (b[0] - a[0]) * k + L.rnd(-jit, jit))
		pts.append(a[1] + (b[1] - a[1]) * k + L.rnd(-jit, jit))
		pts.append(a[2] + (b[2] - a[2]) * k + L.rnd(-jz, jz) + sin(PI * k) * bow)
	pts.append_array([b[0], b[1], b[2]])
	arcs.append({"pts": pts, "t": 0.0, "dur": dur, "bolt": bolt})
	if arcs.size() > 240:
		arcs.pop_front()


## A bolt from a point in the air down onto the floor, and where it strikes: a flash, sparks, a moment's light (wild.ts strike).
func _strike(a: Array, x: float, y: float, big: bool) -> void:
	_arc(a, [x, y, 0.0], 10 if big else 7, 0.16 if big else 0.1, 4.0 if big else 3.0, 0.13 if big else 0.1, true, 7.0 if big else 4.0)
	fx.flash(x, y, 2.0, 0.28 if big else 0.18, 0.09, CRACKLE)
	for i in (7 if big else 4):
		var q := randf() * TAU
		var s := L.rnd(0.6, 2.2)
		_spark(x, y, 1.0, cos(q) * s, sin(q) * s, L.rnd(30, 110), L.rnd(0.15, 0.35), CRACKLE, 300.0)
	fx.glow(x, y, 40.0 if big else 28.0, 0.1, 40)


## A ring of arcs on the floor round a place: `n` of them, each from one point of the ring to the next, `z` pixels up (wild.ts arcRing).
func _arc_ring(x: float, y: float, r: float, n: int, z: float) -> void:
	var a0 := randf() * TAU
	for i in n:
		var a := a0 + float(i) / n * TAU
		var b := a + TAU / n * L.rnd(0.7, 1.05)
		_arc([x + cos(a) * r, y + sin(a) * r, z], [x + cos(b) * r, y + sin(b) * r, z], 4, 0.06, 3.0, L.rnd(0.09, 0.14))


func update(dt: float) -> void:
	clock += dt
	for i in range(arcs.size() - 1, -1, -1):
		arcs[i]["t"] = float(arcs[i]["t"]) + dt
		if float(arcs[i]["t"]) >= float(arcs[i]["dur"]):
			arcs.remove_at(i)
	for i in range(later.size() - 1, -1, -1):
		later[i]["t"] = float(later[i]["t"]) - dt
		if float(later[i]["t"]) <= 0.0:
			var fn: Callable = later[i]["fn"]
			later.remove_at(i)
			fn.call()
	novas = novas.filter(func(s): return clock - float(s["at"]) < 0.3)
	if dt > 0.0:
		_ongoing(dt)
	var h := held
	if h.is_empty() or float(h["age"]) > 0.12 or dt <= 0.0:
		return
	h["age"] = float(h["age"]) + dt
	# THE CRYSTAL CRACKLES, by how hot it burns: a few little arcs in her guard, a storm of them as a spell gathers, and from the
	# hottest, bolts that jump to the floor round her
	var heat: float = h["heat"]
	var s := _smooth(1.2, 3.0, heat)
	# (and from a power only beginning to gather, less)
	var low := minf(1.0, heat / 1.2)
	owed["arcs"] += dt * (1.5 * low + 44.0 * s)
	owed["sparks"] += dt * (2.0 * low + 60.0 * s)
	owed["bolts"] += dt * 9.0 * _smooth(2.3, 3.0, heat)
	var reach := 5.0 + 11.0 * s
	var hx: float = h["x"]
	var hy: float = h["y"]
	var hz: float = h["z"]
	while owed["arcs"] >= 1.0:
		owed["arcs"] -= 1.0
		# (out from the crystal, mostly up and away, and now and then one that loops back into it)
		var q := L.rnd(-PI, PI * 0.25)
		var long := L.rnd(0.5, 1.0) * reach
		var end := _beside(hx, hy, hz, cos(q) * long, -sin(q) * long)
		var from := _beside(hx, hy, hz, L.rnd(-1, 1), L.rnd(-1, 1))
		if randf() < 0.3:
			var back := _beside(hx, hy, hz, L.rnd(-2, 2), L.rnd(-2, 2))
			_arc(from, end, 3, 0.03, 1.5, L.rnd(0.04, 0.07))
			_arc(end, back, 3, 0.03, 1.5, L.rnd(0.04, 0.07))
		else:
			_arc(from, end, 3 if randf() < 0.5 else 4, 0.04, 1.8, L.rnd(0.04, 0.09))
	while owed["sparks"] >= 1.0:
		owed["sparks"] -= 1.0
		var q := randf() * TAU
		var v := L.rnd(0.5, 2.6)
		_spark(hx, hy, hz, cos(q) * v, sin(q) * v, L.rnd(-20, 80), L.rnd(0.15, 0.42), CRACKLE, 170.0, 2.0 if randf() < 0.35 else 0.0)
	while owed["bolts"] >= 1.0:
		owed["bolts"] -= 1.0
		var q := atan2(float(h["fy"]), float(h["fx"])) + L.rnd(-1.5, 1.5)
		var d := L.rnd(0.7, 1.8)
		_strike([hx, hy, hz], hx + cos(q) * d, hy + sin(q) * d, false)
	# (and its light flickers with it)
	if s > 0.05:
		fx.glow(hx, hy, 16.0 + 30.0 * s + L.rnd(0, 8.0 * s), 0.05, 40)


## Each frame: THE ORBS crackle as they hang there, arcs jumping off them, sparks, now and then a bolt to the floor; one gone has burst
## out (wild.ts ongoing).
func _ongoing(dt: float) -> void:
	var rate := func(per_sec: float) -> int: return int(floorf(dt * per_sec + randf()))
	var now := {}
	for o in orbs:
		var id: int = o["id"]
		var ox: float = o["x"]
		var oy: float = o["y"]
		now[id] = true
		orbs_seen[id] = Vector2(ox, oy)
		var born := minf(1.0, float(o["t"]) / 0.2)
		for i in rate.call(34.0 * born):
			var q := L.rnd(-PI, PI)
			var long := L.rnd(6, 15)
			var from := _beside(ox, oy, ORB_Z, L.rnd(-2, 2), L.rnd(-2, 2))
			var end := _beside(ox, oy, ORB_Z, cos(q) * long, -sin(q) * long * 0.8)
			_arc(from, end, 3 if randf() < 0.5 else 4, 0.04, 2.0, L.rnd(0.04, 0.08))
		for i in rate.call(36.0 * born):
			var q := randf() * TAU
			var v := L.rnd(0.6, 2.4)
			_spark(ox, oy, ORB_Z, cos(q) * v, sin(q) * v, L.rnd(-30, 70), L.rnd(0.15, 0.4), CRACKLE, 160.0, 2.0 if randf() < 0.35 else 0.0)
		for i in rate.call(3.0 * born):
			var q := randf() * TAU
			var d := L.rnd(0.6, 1.5)
			_strike([ox, oy, ORB_Z], ox + cos(q) * d, oy + sin(q) * d, false)
		fx.glow(ox, oy, 30.0 + L.rnd(0, 14), 0.05, 40)
	for id in orbs_seen.keys():
		if now.has(id):
			continue
		var at: Vector2 = orbs_seen[id]
		orbs_seen.erase(id)
		_orb_gone(at.x, at.y)


## AN ORB SET DOWN: as the staff comes down arcs run round her and bolts strike out of her; a great bolt leaps from her to where it
## hangs, and it bursts with bolts to the floor round it, sparks, a great light; the screen jolts (wild.ts orbSet).
func orb_set(x: float, y: float) -> void:
	var P: Dictionary = L.P
	var hero = fx.hero()
	var hp: Vector2 = fx.hero_at() if hero != null else Vector2(x, y)
	var face: Vector2 = hero.face if hero != null else Vector2.ZERO
	var hx := hp.x
	var hy := hp.y
	for i in 9:
		var a := float(i) / 9.0 * TAU + L.rnd(-0.2, 0.2)
		var b := a + L.rnd(0.4, 0.75)
		_arc([hx + cos(a) * 1.05, hy + sin(a) * 1.05, 2.0], [hx + cos(b) * 1.05, hy + sin(b) * 1.05, 2.0], 4, 0.07, 3.0, 0.12)
	for i in 4:
		var q := randf() * TAU
		var d := L.rnd(0.7, 1.4)
		later.append({"t": i * 0.02, "fn": func(): _strike([hx, hy, 24.0], hx + cos(q) * d, hy + sin(q) * d, false)})
	var top := [hx + face.x * 0.5, hy + face.y * 0.5, 34.0]
	_arc(top, [x, y, ORB_Z], 12, 0.2, 6.0, 0.16, true, 14.0)
	_arc(top, [x, y, ORB_Z], 9, 0.14, 4.0, 0.11, false, 8.0)
	fx.flash(x, y, ORB_Z, 0.8, 0.12, PackedColorArray([P["white"], CRACKLE[1], CRACKLE[2], P["pu4"]]))
	for i in 6:
		var q := float(i) / 6.0 * TAU + L.rnd(-0.3, 0.3)
		var d := L.rnd(0.8, 1.6)
		later.append({"t": 0.03 + i * 0.015, "fn": func(): _strike([x, y, ORB_Z], x + cos(q) * d, y + sin(q) * d, true)})
	for i in 26:
		var q := randf() * TAU
		var v := L.rnd(1.5, 4.5)
		_spark(x, y, ORB_Z, cos(q) * v, sin(q) * v, L.rnd(-20, 110), L.rnd(0.2, 0.45), SPARKS, 220.0, 2.0)
	fx.glow(x, y, 90.0, 0.2, 40)
	fx.kick(2.5)


## AN ORB IS GONE (its time up): its power folds in on it with a crack, and is spent in a last spray of sparks (wild.ts orbGone).
func _orb_gone(x: float, y: float) -> void:
	var P: Dictionary = L.P
	for i in 8:
		var q := float(i) / 8.0 * TAU
		_arc(_beside(x, y, ORB_Z, cos(q) * 16.0, sin(q) * 12.0), [x, y, ORB_Z], 4, 0.05, 2.5, 0.08)
	var spent := func() -> void:
		fx.flash(x, y, ORB_Z, 0.45, 0.1, PackedColorArray([P["white"], CRACKLE[1], CRACKLE[2]]))
		for i in 18:
			var q := randf() * TAU
			var v := L.rnd(1, 3)
			_spark(x, y, ORB_Z, cos(q) * v, sin(q) * v, L.rnd(-10, 90), L.rnd(0.2, 0.4), CRACKLE, 200.0, 2.0)
	later.append({"t": 0.07, "fn": spent})


## A 'burst' of her power ('nova'): AN ORB'S WAVE, or the burst she comes out of a warp in (her thunderclap) (wild.ts nova).
func nova(x: float, y: float, r: float) -> void:
	if not warp_to.is_empty() and clock - float(warp_to["at"]) < 0.06 and Vector2(float(warp_to["x"]) - x, float(warp_to["y"]) - y).length() < 0.3:
		warp_to = {}
		_thunder(x, y, r)
		return
	_arc_ring(x, y, r * 0.92, 10, 3.0)
	fx.ring(x, y, r, 0.28, PackedColorArray([CRACKLE[0], CRACKLE[1], CRACKLE[2]]), false, {"heavy": true, "jag": true})
	var lashed := 0
	for m in mobs:
		if lashed >= 5 or (m as Vector2).distance_to(Vector2(x, y)) > r:
			continue
		lashed += 1
		_arc([x, y, ORB_Z], [m.x, m.y, L.rnd(10, 18)], 8, 0.12, 4.0, 0.12, true, 5.0)
	for i in range(lashed, 3):
		var q := randf() * TAU
		var d := L.rnd(0.6, r * 0.9)
		_strike([x, y, ORB_Z], x + cos(q) * d, y + sin(q) * d, false)
	for i in 16:
		var q := randf() * TAU
		var v := L.rnd(2, 4.5)
		_spark(x, y, ORB_Z, cos(q) * v, sin(q) * v, L.rnd(-10, 80), L.rnd(0.2, 0.4), SPARKS, 200.0, 2.0)
	fx.glow(x, y, 70.0, 0.14, 40)
	fx.kick(1.3)
	novas.append({"x": x, "y": y, "r": r, "at": clock})


## THE WARP ('burst' warp, twice in one step: where she went from, then where she came out) (wild.ts warp).
func warp(x: float, y: float) -> void:
	var P: Dictionary = L.P
	if warp_from.is_empty() or clock - float(warp_from["at"]) > 0.04:
		warp_from = {"x": x, "y": y, "at": clock}
		for i in 10:
			var q := float(i) / 10.0 * TAU + L.rnd(-0.2, 0.2)
			_arc([x + cos(q) * L.rnd(0.6, 1), y + sin(q) * L.rnd(0.6, 1), L.rnd(4, 34)], [x, y, 16.0], 4, 0.05, 3.0, L.rnd(0.07, 0.1))
		fx.flash(x, y, 16.0, 0.55, 0.1, PackedColorArray([P["white"], CRACKLE[1], CRACKLE[2]]))
		for i in 14:
			var q := randf() * TAU
			var v := L.rnd(1, 2.5)
			_spark(x + cos(q) * 0.5, y + sin(q) * 0.5, L.rnd(4, 28), -cos(q) * v, -sin(q) * v, L.rnd(-20, 40), L.rnd(0.12, 0.25), CRACKLE, 60.0, 2.0)
		return
	var from := warp_from
	warp_from = {}
	var fx0: float = from["x"]
	var fy0: float = from["y"]
	_arc([fx0, fy0, 18.0], [x, y, 18.0], 14, 0.2, 6.0, 0.18, true, 16.0)
	_arc([fx0, fy0, 14.0], [x, y, 16.0], 10, 0.15, 4.0, 0.13, false, 9.0)
	var len := Vector2(x - fx0, y - fy0).length()
	for i in roundi(8.0 + len * 4.0):
		var k := randf()
		var q := randf() * TAU
		_spark(fx0 + (x - fx0) * k, fy0 + (y - fy0) * k, L.rnd(8, 26), cos(q) * L.rnd(0.3, 1.2), sin(q) * L.rnd(0.3, 1.2), L.rnd(-20, 50), L.rnd(0.15, 0.35), CRACKLE, 120.0, 2.0)
	warp_to = {"x": x, "y": y, "at": clock}


## SHE COMES OUT OF A WARP: a thunderclap (wild.ts thunder).
func _thunder(x: float, y: float, r: float) -> void:
	var P: Dictionary = L.P
	fx.flash(x, y, 14.0, 1.25, 0.13, PackedColorArray([P["white"], CRACKLE[1], CRACKLE[2], P["pu4"]]))
	var a0 := randf() * TAU
	for i in 8:
		var q := a0 + float(i) / 8.0 * TAU + L.rnd(-0.25, 0.25)
		var d := r * L.rnd(0.85, 1.35)
		later.append({"t": i * 0.012, "fn": func(): _strike([x, y, 24.0], x + cos(q) * d, y + sin(q) * d, true)})
	_arc_ring(x, y, r * 0.8, 9, 3.0)
	fx.ring(x, y, r * 1.15, 0.3, PackedColorArray([CRACKLE[0], CRACKLE[1], CRACKLE[2]]), false, {"heavy": true, "jag": true})
	for i in 40:
		var q := randf() * TAU
		var v := L.rnd(1, 4.5)
		_spark(x, y, L.rnd(6, 20), cos(q) * v, sin(q) * v, L.rnd(40, 170), L.rnd(0.25, 0.55), SPARKS, 260.0, 2.0)
	fx.glow(x, y, 110.0, 0.2, 40)
	fx.kick(3.4)
	fx.hold_for(0.05)
	novas.append({"x": x, "y": y, "r": r, "at": clock})


## THE WAVE IS LET GO (wild.ts cast): from where the crystal comes down in front of her, a flash and a ring, a fan of sparks, bolts
## shot out ahead of it to the floor; the screen kicks. (`x`, `y`: where the rules send it from; `dx`, `dy`: the way it goes.)
func cast(x: float, y: float, dx: float, dy: float, echo: bool) -> void:
	var P: Dictionary = L.P
	var from := [x + dx * 0.9, y + dy * 0.9, 9.0]
	fx.flash(from[0], from[1], from[2], 0.45 if echo else 0.8, 0.12, PackedColorArray([P["white"], CRACKLE[1], CRACKLE[2], P["pu4"]]))
	fx.flash(x + dx, y + dy, 6.0, 0.35 if echo else 0.62, 0.1, PackedColorArray([P["white"], P["pu5"], P["pu4"]]))
	fx.ring(x + dx * 0.7, y + dy * 0.7, 1.1, 0.2, PackedColorArray([CRACKLE[1], CRACKLE[2], P["pu4"]]), false)
	var base := atan2(dy, dx)
	for i in (12 if echo else 30):
		var q := base + L.rnd(-1.1, 1.1)
		var v := L.rnd(3, 8)
		_spark(from[0], from[1], from[2], cos(q) * v, sin(q) * v, L.rnd(-10, 90), L.rnd(0.2, 0.45), SPARKS, 200.0, 3.0)
	for i in (2 if echo else 4):
		var q := base + L.rnd(-0.85, 0.85)
		var d := L.rnd(1.4, 3)
		later.append({"t": i * 0.025, "fn": func(): _strike(from, x + cos(q) * d, y + sin(q) * d, true)})
	if not echo:
		fx.kick(1.8)
	fx.glow(from[0], from[1], 100.0, 0.22, 40)


## Her waves in flight, each frame (wild.ts follow, the waves): where they are (what they hit crackles); and, by `k` (how much this
## frame is worth), arcs crawling along each crest and leaping off it, sparks streaming back off it, bolts forking ahead of it.
func follow(shots: Array, k: float) -> void:
	waves = []
	for p in shots:
		if p.get("look", "") != "wave":
			continue
		var r := float(p.get("r", 1.0)) * 1.1
		var px: float = p["x"]
		var py: float = p["y"]
		waves.append({"x": px, "y": py, "r": r})
		if k <= 0.0:
			continue
		var v := Vector2(p["vx"], p["vy"]).length()
		if v <= 0.0:
			v = 1.0
		var fwx: float = float(p["vx"]) / v
		var fwy: float = float(p["vy"]) / v
		var born := minf(1.0, float(p.get("age", 1.0)) / 0.09)
		var fade := clampf(float(p.get("dist", 9.0)) / 1.8, 0.0, 1.0)
		var span := 1.0
		var R := r / sin(span)
		var crest := func(a: float) -> Array:
			var ca := cos(a) * R - R
			var sa := sin(a) * R
			var mid := 1.0 - absf(a) / span
			return [px + fwx * ca - fwy * sa, py + fwy * ca + fwx * sa, 3.0 + 9.0 * mid * born]
		var roll := func(q: float) -> bool: return randf() < q * k * fade
		for i in 3:
			if not roll.call(1.0):
				continue
			var c: Array = crest.call(L.rnd(-span, span))
			var back := L.rnd(0.5, 2.5)
			_spark(c[0], c[1], c[2] + L.rnd(0, 3), -fwx * back + L.rnd(-0.6, 0.6), -fwy * back + L.rnd(-0.6, 0.6), L.rnd(30, 110), L.rnd(0.25, 0.5), SPARKS, 260.0)
		if roll.call(0.9):
			var a := L.rnd(-span, span)
			var b := clampf(a + L.rnd(0.15, 0.45) * (-1.0 if randf() < 0.5 else 1.0), -span, span)
			_arc(crest.call(a), crest.call(b), 5, 0.05, 3.5, 0.06)
		if roll.call(0.4):
			var a := L.rnd(-span, span)
			var c: Array = crest.call(a)
			var e: Array = crest.call(a + L.rnd(-0.12, 0.12))
			e[2] = float(c[2]) + L.rnd(8, 18)
			_arc(c, e, 3, 0.03, 2.0, 0.06)
		if roll.call(0.22):
			var c: Array = crest.call(L.rnd(-span * 0.6, span * 0.6))
			var ahead := L.rnd(0.5, 1.3)
			var side := L.rnd(-0.5, 0.5)
			_strike(c, float(c[0]) + fwx * ahead - fwy * side, float(c[1]) + fwy * ahead + fwx * side, false)


## Something was hit at (x, y): if one of her waves is there, or her power burst there a moment ago, it crackles over what it hit.
## Says whether it did (wild.ts hit, its waves and novas).
func hit(x: float, y: float) -> bool:
	for w in waves:
		if Vector2(float(w["x"]) - x, float(w["y"]) - y).length() <= float(w["r"]) * 1.3 + 0.8:
			return _wave_hit(x, y)
	for s in novas:
		if Vector2(float(s["x"]) - x, float(s["y"]) - y).length() <= float(s["r"]) + 0.6:
			return _wave_hit(x, y)
	return false


## Her power crackles over what it hit (wild.ts waveHit).
func _wave_hit(x: float, y: float) -> bool:
	var P: Dictionary = L.P
	fx.flash(x, y, 12.0, 0.5, 0.1, PackedColorArray([P["white"], CRACKLE[1], CRACKLE[2], P["pu4"]]))
	var crawl := func(n: int) -> void:
		for i in n:
			_arc([x + L.rnd(-0.22, 0.22), y + L.rnd(-0.22, 0.22), L.rnd(3, 26)], [x + L.rnd(-0.22, 0.22), y + L.rnd(-0.22, 0.22), L.rnd(3, 26)], 4, 0.05, 2.5, 0.07)
	crawl.call(4)
	later.append({"t": 0.05, "fn": func(): crawl.call(3)})
	later.append({"t": 0.11, "fn": func(): crawl.call(2)})
	for i in 10:
		var q := randf() * TAU
		var v := L.rnd(1.5, 3.5)
		_spark(x, y, L.rnd(8, 20), cos(q) * v, sin(q) * v, L.rnd(40, 120), L.rnd(0.2, 0.42), SPARKS, 220.0)
	var q := randf() * TAU
	_strike([x, y, 14.0], x + cos(q) * 0.6, y + sin(q) * 0.6, false)
	fx.glow(x, y, 44.0, 0.12, 40)
	return true


## A line of whole game pixels from one point of the screen to another (wild.ts line), on `c` in picture pixels.
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


## Her arcs, white at the heart while fresh, cooling to the crystal's cyan, with a glow either side; a fresh bolt two pixels thick at
## its heart (wild.ts draw, the arcs).
func draw(c: CanvasItem) -> void:
	for a in arcs:
		var k: float = float(a["t"]) / float(a["dur"])
		var core: Color = CRACKLE[0] if k < 0.4 else (CRACKLE[1] if k < 0.75 else CRACKLE[2])
		var bolt: bool = a["bolt"]
		var pts: Array = a["pts"]
		var i := 0
		while i + 5 < pts.size():
			var x0: float = fx.gx(pts[i], pts[i + 1])
			var y0: float = fx.gy(pts[i], pts[i + 1]) - float(pts[i + 2])
			var x1: float = fx.gx(pts[i + 3], pts[i + 4])
			var y1: float = fx.gy(pts[i + 3], pts[i + 4]) - float(pts[i + 5])
			# (across the way it runs: what is beside it)
			var flat := absf(x1 - x0) > absf(y1 - y0)
			var ox := 0.0 if flat else 1.0
			var oy := 1.0 if flat else 0.0
			if k < 0.55:
				# (the glow either side; a bolt's is wider)
				_line(c, x0 - ox, y0 - oy, x1 - ox, y1 - oy, CRACKLE[2] if bolt else CRACKLE[3])
				var w := 2.0 if bolt else 1.0
				_line(c, x0 + ox * w, y0 + oy * w, x1 + ox * w, y1 + oy * w, CRACKLE[2])
			_line(c, x0, y0, x1, y1, core)
			# (a fresh bolt is two pixels thick at its heart)
			if bolt and k < 0.4:
				_line(c, x0 + ox, y0 + oy, x1 + ox, y1 + oy, CRACKLE[0])
			i += 3
