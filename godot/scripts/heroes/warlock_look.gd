## THE WARLOCK'S EFFECTS AS THE GAME DRAWS THEM (render/warlock_fx.ts, made of the art chat's own pieces: dev/warlock_fx.ts,
## dev/demon_fx.ts; each painted once, kept here as pictures: assets/heroes/warlock_fx.png, tools/godot_warlock_fx.ts):
##   his bolt in flight       his fire laid on its side, its tail streaming back whichever way it flies (16 ways round)
##   hellOn                   a burst of his fire where the bolt bites
##   burning (hell_t)         tongues of his cyan fire licking up the one burning, round and round
##   curse                    chains of black smoke whipping out from his claw to each it curses, slack, snapped taut, burning away;
##                            a hot cyan brand at each tip
##   cursed (curse_t)         black smoke seeping up off the cursed one, cyan embers in it
##   spread                   its burns leaping in arcs from the one that died to the others, balls of his fire
##   smoke                    a river of black smoke along the floor where he went, puffs billowing up off it, thinning
##   damning                  under each it strikes: the floor cracking open in a star, a hole torn in it, a jet of its fire
##   roar                     the demon formed: a ring thrown out over the floor
##   change                   embers whirling up round him
## On the floor (under the figures) the rivers, the eruptions, the rings; in the air (over them, `air`) the rest. Each lights the
## dark as the game's do (render.ts spot: his bolt).
extends Node2D

const L := preload("res://scripts/fx_looks.gd")

var kit
var loot
var air: Node2D
var _t := 0.0
var _sheet: Texture2D
var _pics := {}
var HELL: Array = []
var SMOKE: Array = []
var chains: Array = []
var rivers: Array = []
var leaps: Array = []
var bursts: Array = []
var erupts: Array = []
var rings: Array = []
var embers: Array = []

const CHAIN := {"reach": 0.33, "hold": 0.6, "gone": 0.87}
const RIVER := 1.1
const LEAP := 0.42
const BURST := 0.3
const RING := 0.55
const EMBERS := 1.6
const ERUPT := 0.9
const BURN_LOOP := 1.6
const BOLT_WAYS := 16


class _Air extends Node2D:
	var look

	func _draw() -> void:
		look.draw_air(self)


static func _hash(i: float) -> float:
	var x := sin(i * 61.7 + 7.3) * 43758.5453
	return x - floorf(x)


func _ready() -> void:
	L.ready_up()
	var d: Dictionary = JSON.parse_string(FileAccess.get_file_as_string("res://assets/heroes/warlock_fx.json"))
	_pics = d["pics"]
	for c in d["hell"]:
		HELL.append(Color(c))
	for c in d["smoke"]:
		SMOKE.append(Color(c))
	_sheet = load("res://assets/heroes/warlock_fx.png")
	air = _Air.new()
	air.look = self
	air.z_index = 40
	add_child(air)


func on_event(e: Dictionary, _fx) -> void:
	match str(e.get("t", "")):
		"hellOn":
			bursts.append({"x": e["x"], "y": e["y"], "t": 0.0})
		"curse":
			if not e.get("echo", false) or not (e["to"] as Array).is_empty():
				chains.append({"x": e["x"], "y": e["y"], "to": (e["to"] as Array).duplicate(), "t": 0.0})
		"smoke":
			rivers.append({"x0": e["x0"], "y0": e["y0"], "x1": e["x1"], "y1": e["y1"], "t": 0.0, "demon": e.get("demon", false)})
		"damning":
			for a in e["at"]:
				erupts.append({"x": a["x"], "y": a["y"], "t": 0.0})
		"roar":
			rings.append({"x": e["x"], "y": e["y"], "r": e["r"], "t": 0.0})
		"change":
			embers.append({"x": e["x"], "y": e["y"], "t": 0.0})


## (the spreading of a cursed one's burns is told by monsters.gd, not by him: fx.gd hands it on here)
func spread(e: Dictionary) -> void:
	for o in e["to"]:
		leaps.append({"x0": e["x"], "y0": e["y"], "x1": o["x"], "y1": o["y"], "t": 0.0})


func _process(dt: float) -> void:
	_t += dt
	for pair in [[chains, CHAIN["gone"]], [rivers, RIVER], [leaps, LEAP], [bursts, BURST], [erupts, ERUPT], [rings, RING], [embers, EMBERS]]:
		var list: Array = pair[0]
		for i in range(list.size() - 1, -1, -1):
			list[i]["t"] = float(list[i]["t"]) + dt
			if float(list[i]["t"]) >= float(pair[1]):
				list.remove_at(i)
	queue_redraw()
	air.queue_redraw()


func _gx(x: float, y: float) -> float:
	var fx = kit.h.fx if kit != null else null
	return fx.gx(x, y) if fx != null and is_instance_valid(fx) else (x - y) * 16.0


func _gy(x: float, y: float) -> float:
	var fx = kit.h.fx if kit != null else null
	return fx.gy(x, y) if fx != null and is_instance_valid(fx) else (x + y) * 8.0


## One of the pieces, its anchor at (x, y) game pixels of the screen, on `c` (picture pixels), `a` faint.
func _piece(c: CanvasItem, key: String, x: float, y: float, a := 1.0) -> void:
	var p = _pics.get(key)
	if p == null:
		return
	c.draw_texture_rect_region(_sheet, Rect2(roundf(x) * 2.0 - float(p[4]), roundf(y) * 2.0 - float(p[5]), p[2], p[3]), Rect2(p[0], p[1], p[2], p[3]), Color(1, 1, 1, a))


## What lies on the floor: the smoke steps' rivers, the ground torn open, the demon's roar's ring (warlock_fx.ts drawGround).
func _draw() -> void:
	for r in rivers:
		var k := float(r["t"]) / RIVER
		var len := Vector2(float(r["x1"]) - float(r["x0"]), float(r["y1"]) - float(r["y0"])).length()
		var n := maxi(2, roundi(len * (3.0 if r["demon"] else 2.2)))
		var a := maxf(0.0, 1.0 - k * k)
		for i in n + 1:
			var u := float(i) / n
			# (it lies where he went, rolling on the way he went; puffs billowing up off it as it thins)
			var x := float(r["x0"]) + (float(r["x1"]) - float(r["x0"])) * u + sin(i * 1.7 + _t * 3.0) * 0.08
			var y := float(r["y0"]) + (float(r["y1"]) - float(r["y0"])) * u + cos(i * 1.3 + _t * 3.0) * 0.08
			var rise := k * (10.0 + 8.0 * _hash(i * 3)) * (1.0 if _hash(i) < 0.5 else 0.4)
			_piece(self, "puff:%d" % ((i + floori(_t * 8.0)) % 6), _gx(x, y), _gy(x, y) - rise, a)
	for e in erupts:
		_piece(self, "erupt:%d" % mini(23, floori(float(e["t"]) / ERUPT * 24.0)), _gx(e["x"], e["y"]), _gy(e["x"], e["y"]))
	for r in rings:
		var k := float(r["t"]) / RING
		var col: Color = HELL[2] if k < 0.4 else HELL[1]
		var cx := _gx(r["x"], r["y"])
		var cy := _gy(r["x"], r["y"])
		var rx := float(r["r"]) * 16.0 * (0.3 + k)
		var ry := float(r["r"]) * 8.0 * (0.3 + k)
		var n := maxi(24, roundi(rx * 1.5))
		var pts := PackedVector2Array()
		for i in n + 1:
			var a := float(i) / n * TAU
			pts.append(Vector2(cx + cos(a) * rx, cy + sin(a) * ry) * 2.0)
		draw_polyline(pts, Color(col, 1.0 - k), 2.0)


## What is over everything: the burning and the cursed, the chains, the bolt's burst, the burns leaping, embers, his bolts in flight
## (warlock_fx.ts drawAir, drawBolt).
func draw_air(c: CanvasItem) -> void:
	if kit == null:
		return
	var h = kit.h
	if h.monsters != null:
		for m in h.monsters.list:
			if not is_instance_valid(m) or m.dead:
				continue
			var x := roundf(_gx(m.world.x, m.world.y))
			var y := roundf(_gy(m.world.x, m.world.y))
			if m.curse_t > 0.0:
				_piece(c, "smolder:%d" % (floori((_t + m.id * 0.37) / BURN_LOOP * 16.0) % 16), x, y)
			if m.hell_t > 0.0:
				_piece(c, "burn:%d" % (floori((_t + m.id * 0.53) / BURN_LOOP * 16.0) % 16), x, y)
	# the chains of black smoke, whipping out and slack, snapped taut as he hauls back, burning away to smoke
	for ch in chains:
		var hx := _gx(ch["x"], ch["y"])
		var hy := _gy(ch["x"], ch["y"]) - 20.0
		var ct: float = ch["t"]
		var out := minf(1.0, ct / CHAIN["reach"])
		var fade: float = 1.0 - (ct - CHAIN["hold"]) / (CHAIN["gone"] - CHAIN["hold"]) if ct > CHAIN["hold"] else 1.0
		var slack: float = 1.0 if ct < CHAIN["reach"] else maxf(0.0, 1.0 - (ct - CHAIN["reach"]) / 0.15)
		var j := 0
		for o in ch["to"]:
			var tx := _gx(o["x"], o["y"])
			var ty := _gy(o["x"], o["y"]) - 16.0
			var dx := tx - hx
			var dy := ty - hy
			var len := Vector2(dx, dy).length()
			if len <= 0.0:
				len = 1.0
			var nx := -dy / len
			var ny := dx / len
			var links := maxi(4, roundi(len * out / 3.0))
			var al := maxf(0.0, fade)
			for i in links + 1:
				var u := float(i) / links * out
				var wave := sin(u * 9.0 - _t * 14.0 + j) * 5.0 * slack * sin(PI * u)
				var x := roundf(hx + dx * u + nx * wave)
				var y := roundf(hy + dy * u + ny * wave + sin(PI * u) * 6.0 * slack)
				c.draw_rect(Rect2((x - 1) * 2.0, (y - 1) * 2.0, 4, 4), Color(SMOKE[0] if i % 2 == 0 else SMOKE[1], al))
				if _hash(i * 7 + j) < 0.3:
					c.draw_rect(Rect2(x * 2.0, (y - 2) * 2.0, 2, 2), Color(SMOKE[2], al))
			# (a hot cyan brand at its tip)
			if out >= 1.0:
				var bx := roundf(hx + dx)
				var by := roundf(hy + dy)
				c.draw_rect(Rect2((bx - 1) * 2.0, (by - 1) * 2.0, 6, 6), Color(HELL[2], al))
				c.draw_rect(Rect2(bx * 2.0, by * 2.0, 2, 2), Color(HELL[3], al))
			j += 1
	for b in bursts:
		_piece(c, "burst:%d" % mini(7, floori(float(b["t"]) / BURST * 8.0)), _gx(b["x"], b["y"]), _gy(b["x"], b["y"]) - 14.0)
	for l in leaps:
		var k := float(l["t"]) / LEAP
		var x := float(l["x0"]) + (float(l["x1"]) - float(l["x0"])) * k
		var y := float(l["y0"]) + (float(l["y1"]) - float(l["y0"])) * k
		var up := sin(PI * k) * 26.0 + 14.0
		_piece(c, "ball:%d" % (floori(_t * 20.0) % 4), _gx(x, y), _gy(x, y) - up)
	# embers whirling up round him as he changes
	for e in embers:
		var k := float(e["t"]) / EMBERS
		for i in 14:
			var a := _hash(i) * TAU + float(e["t"]) * (2.0 + _hash(i * 3) * 2.0)
			var r := 6.0 + 10.0 * _hash(i * 5) + k * 8.0
			var up := fmod(float(e["t"]) * (16.0 + 14.0 * _hash(i * 7)) + _hash(i * 11) * 30.0, 46.0)
			var x := roundf(_gx(e["x"], e["y"]) + cos(a) * r)
			var y := roundf(_gy(e["x"], e["y"]) - up + sin(a) * r * 0.4)
			c.draw_rect(Rect2(x * 2.0, y * 2.0, 2, 4), Color(HELL[2] if up < 20.0 else HELL[1], 1.0 - k))
	# HIS BOLT in flight: his fire laid on its side, the way it flies on the screen
	for p in kit.shots:
		if p.get("look", "") != "hellbolt":
			continue
		var sdx := (float(p["vx"]) - float(p["vy"])) * 16.0
		var sdy := (float(p["vx"]) + float(p["vy"])) * 8.0
		var way := posmod(roundi(atan2(sdy, sdx) / TAU * BOLT_WAYS) % BOLT_WAYS, BOLT_WAYS)
		_piece(c, "bolt%d:%d" % [way, floori(_t * 20.0) % 6], _gx(p["x"], p["y"]), _gy(p["x"], p["y"]) - 14.0)


## The light his bolts cast in the dark (render.ts spot, a hero's projectile: 26 game pixels round).
func lights(spot: Callable, fx) -> void:
	for p in kit.shots:
		spot.call(fx.gx(p["x"], p["y"]), fx.gy(p["x"], p["y"]) - 10.0, 26.0, 0.8)
