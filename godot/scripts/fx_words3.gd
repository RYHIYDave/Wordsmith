## THE NEW WORDS AT WORK, HEAVY'S SHARE (render/words3.ts, as its `events3` calls it up from what the rules say): fx.gd
## hands on to this where the game's effects hand on to words3.ts.
##   HEAVY on the hit (heavyHit): everything holds for a tenth of a second, a low ring of shock runs out along the floor, dust
##     rolls out behind it, stone is thrown up, short cracks open in the word's bronze, and the screen kicks.
##   A STUN (stun, drawStun): three bronze sparks going round over the head, the near ones bright, the far ones dim; the
##     stunned sways a pixel each way (shift3).
##   A STAGGER (stagger, shift3): knocked back 7 pixels fast, a moment off balance, and back slow, over 0.55 s; grit kicked up.
##   CRACKED GROUND (cracks, drawCracks): a web of cracks, spokes from the middle out to the edge and breaks across them,
##     white-hot as they open, then bronze that breathes; the ground beaten down, slabs tipped, grit lying about. A Heavy
##     blow's own are short and soon gone; the ground Heavy leaves behind is the rules' patch (fx_wakes.gd draws it with this).
## What a monster is marked with is kept by its instance id. A stun and a stagger are shown from the telling, and from the
## state where monster.gd keeps it (`stun_t`, the seconds left; `stagger_t`): see `watch`.
## Left out: the other seven of the eight new words (Pulling, Splitting, Precise, Hexing, Stilling, Frenzied, Guarding).
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")

var fx
## A Heavy blow's own cracks (W3.patches of kind 'cracks'): {x, y, r, t, dur, seed, lines}.
var patches: Array = []
## What the word has done to a monster (W3.marks), by its instance id: {m, stun (seconds left), stun0 (how long it has been
## stunned), stag (seconds since a stagger began; under 0, none), sx, sy (the way it was knocked, on the screen), kept (its
## stun's time is the rules' own), latched (a stagger shown for the state it is in)}.
var marks := {}
var later: Array = []


func clear() -> void:
	patches = []
	marks = {}
	later = []


func alive() -> bool:
	return not (patches.is_empty() and marks.is_empty() and later.is_empty())


# --- bits the effects are made of, put into the effects' own lists ---

## Dust: big soft grains that roll out low over the floor and settle (words3.ts dust).
func dust(x: float, y: float, n: int, speed: float, r := 0.2) -> void:
	for i in n:
		var a := randf() * TAU
		var s := L.rnd(0.45, 1.0) * speed
		fx.add(x + cos(a) * r, y + sin(a) * r, L.rnd(0.5, 2.5), cos(a) * s, sin(a) * s, L.rnd(4, 12), L.rnd(0.4, 0.7), L.DUST[1], 3.0 if randf() < 0.5 else 2.0, 30.0, L.DUST)


## Grit kicked up from broken ground (words3.ts grit).
func grit(x: float, y: float, n: int) -> void:
	var H := L.HEAVY
	var cs := PackedColorArray([H[1], H[2], L.W3_GRIT[0], H[3]])
	for i in n:
		var a := randf() * TAU
		var s := L.rnd(0.4, 1.6)
		fx.add(x + L.rnd(-0.15, 0.15), y + L.rnd(-0.15, 0.15), 1.0, cos(a) * s, sin(a) * s, L.rnd(40, 90), L.rnd(0.3, 0.55), L.pick(cs), 2.0 if randf() < 0.3 else 1.0, 380.0)


## HEAVY, on the hit at (x, y). `big`: an area ability's (cracks out to its edge); otherwise the knock of one hit
## (words3.ts heavyHit).
func heavy_hit(x: float, y: float, r: float, big: bool) -> void:
	var C := L.HEAVY
	# (through the effects' own hold, which keeps quick blows from making the game stutter)
	fx.hold(0.1)
	fx.kick(6.0 if big else 4.5)
	var rr := r if big else maxf(0.9, r)
	fx.ring(x, y, rr * 1.15, 0.3, PackedColorArray([C[5], C[4], C[3], C[2]]), false, {"heavy": true})
	fx.ring(x, y, rr * 1.5, 0.42, PackedColorArray([L.DUST[0], L.DUST[1], L.DUST[2]]), false, {"delay": 0.05})
	fx.flash(x, y, 3.0, 0.9 if big else 0.6, 0.1, PackedColorArray([C[5], C[4], C[3]]))
	# (the dust bursts out once the freeze lets go: the freeze is the instant of the blow)
	later.append({"t": 0.02, "fn": func(): dust(x, y, 20 if big else 12, 3.8 if big else 3.0, 0.25)})
	# stone thrown up: it falls fast
	var stone := PackedColorArray([L.W3_STONE[0], L.W3_STONE[1], C[2], C[3]])
	for i in (14 if big else 8):
		var a := randf() * TAU
		var s := L.rnd(1.0, 3.6 if big else 2.6)
		fx.add(x + cos(a) * 0.15, y + sin(a) * 0.15, 1.0, cos(a) * s, sin(a) * s, L.rnd(90, 170), L.rnd(0.4, 0.7), L.pick(stone), 3.0 if randf() < 0.5 else 2.0, 520.0)
	patches.append(cracks(x, y, rr if big else rr * 0.85, 1.6 if big else 1.1, big))
	fx.glow(x, y, 34.0 + rr * 16.0, 0.3)


## The lines of a web of cracks: spokes from the middle out to the edge, and breaks across them (words3.ts cracks). Each
## line is offsets from the middle, x0, y0, x1, y1 ...; the spokes are the lines of five points.
static func cracks(x: float, y: float, r: float, dur: float, big: bool, seed := -1) -> Dictionary:
	if seed < 0:
		seed = randi() % 1000000
	var lines: Array = []
	var n := 7 if big else 5
	var a0 := L.hash2(seed, 1) * TAU
	var spokes: Array = []
	for k in n:
		var a := a0 + float(k) / n * TAU + (L.hash2(seed, k, 2) - 0.5) * 0.5
		var length := r * (0.72 + L.hash2(seed, k, 3) * 0.34)
		var pts := PackedFloat32Array([cos(a) * r * 0.1, sin(a) * r * 0.1])
		for i in range(1, 5):
			var d := length * i / 4.0
			var j := (L.hash2(seed, k * 8 + i, 4) - 0.5) * r * 0.22 * (1.0 if i < 4 else 0.4)
			pts.append(cos(a) * d - sin(a) * j)
			pts.append(sin(a) * d + cos(a) * j)
		spokes.append(pts)
		lines.append(pts)
		# a short fork off the far half of some
		if L.hash2(seed, k, 5) < 0.5:
			var b := a + (0.7 if L.hash2(seed, k, 6) < 0.5 else -0.7)
			var fx0 := pts[6]
			var fy0 := pts[7]
			var fl := r * (0.18 + L.hash2(seed, k, 7) * 0.16)
			lines.append(PackedFloat32Array([fx0, fy0, fx0 + cos(b) * fl * 0.55, fy0 + sin(b) * fl * 0.55 + (L.hash2(seed, k, 8) - 0.5) * 0.05, fx0 + cos(b) * fl, fy0 + sin(b) * fl]))
	# breaks across between neighbouring spokes, part way out: the ring of a crater
	if big:
		for k in n:
			if L.hash2(seed, k, 9) < 0.35:
				continue
			var p: PackedFloat32Array = spokes[k]
			var q: PackedFloat32Array = spokes[(k + 1) % n]
			var at := 2 + (2 if L.hash2(seed, k, 10) < 0.5 else 0)
			var mx := (p[at] + q[at]) / 2.0
			var my := (p[at + 1] + q[at + 1]) / 2.0
			lines.append(PackedFloat32Array([p[at], p[at + 1], mx * 1.12, my * 1.12, q[at], q[at + 1]]))
	return {"kind": "cracks", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "seed": seed, "lines": lines}


# --- what is done to a monster ---

func _mark(m: Object) -> Dictionary:
	var id := m.get_instance_id()
	if not marks.has(id):
		marks[id] = {"m": m, "stun": 0.0, "stun0": 0.0, "stag": -1.0, "sx": 0.0, "sy": 0.0, "kept": false, "latched": false}
	return marks[id]


## A monster is stunned for `secs` (words3.ts stun).
func stun(m: Object, secs: float) -> void:
	var k := _mark(m)
	if k["stun"] <= 0.0:
		k["stun0"] = 0.0
	k["stun"] = maxf(k["stun"], secs)


## A monster is staggered by a blow from (from_x, from_y): knocked back a step, as every hit shows, but more; from where it
## stands itself, away from the hero (words3.ts stagger).
func stagger(m: Object, from_x: float, from_y: float) -> void:
	var k := _mark(m)
	var at: Vector2 = m.world
	var dx := (at.x - from_x - (at.y - from_y)) * 16.0
	var dy := (at.x - from_x + (at.y - from_y)) * 8.0
	if Vector2(dx, dy).length() < 0.01:
		var h: Vector2 = fx.hero_at()
		dx = (at.x - h.x - (at.y - h.y)) * 16.0
		dy = (at.x - h.x + (at.y - h.y)) * 8.0
	var length := Vector2(dx, dy).length()
	if length <= 0.0:
		length = 1.0
	k["sx"] = dx / length
	k["sy"] = dy / length
	k["stag"] = 0.0
	k["latched"] = true


## What the state itself says of a monster (monster.gd `stun_t`, the seconds its stun has left; `stagger_t`, above 0 while
## it staggers): a stun kept there is followed, whatever the telling said of its length; a stagger there that no telling
## told of is shown as one away from the hero. `stunned`, `staggered`: whether it is in each now.
func watch(m: Object, stunned: bool, staggered: bool) -> void:
	var id := m.get_instance_id()
	if stunned:
		var k := _mark(m)
		if k["stun"] <= 0.0:
			k["stun0"] = 0.0
		k["stun"] = fx.figures.state(m, "stun_t")
		k["kept"] = true
	elif marks.has(id) and marks[id]["kept"]:
		marks[id]["stun"] = 0.0
		marks[id]["kept"] = false
	if staggered:
		if not marks.has(id) or not marks[id]["latched"]:
			stagger(m, m.world.x, m.world.y)
			grit(m.world.x, m.world.y, 6)
	elif marks.has(id):
		marks[id]["latched"] = false


## Age everything (words3.ts tick3).
func tick(dt: float) -> void:
	for i in range(later.size() - 1, -1, -1):
		var q: Dictionary = later[i]
		q["t"] -= dt
		if q["t"] <= 0.0:
			later.remove_at(i)
			(q["fn"] as Callable).call()
	for i in range(patches.size() - 1, -1, -1):
		patches[i]["t"] += dt
		if patches[i]["t"] >= patches[i]["dur"]:
			patches.remove_at(i)
	for id in marks.keys():
		var k: Dictionary = marks[id]
		var m = k["m"]
		if not is_instance_valid(m) or m.dead:
			marks.erase(id)
			continue
		if k["stun"] > 0.0:
			if not k["kept"]:
				k["stun"] -= dt
			k["stun0"] += dt
		if k["stag"] >= 0.0:
			k["stag"] += dt
			if k["stag"] > L.STAGGER:
				k["stag"] = -1.0
		if k["stun"] <= 0.0 and k["stag"] < 0.0 and not k["latched"]:
			marks.erase(id)


## Where a monster's picture is moved to, in game pixels: knocked back by a stagger, swaying while stunned (words3.ts shift3).
func shift_of(m: Object) -> Vector2:
	var k = marks.get(m.get_instance_id())
	if k == null:
		return Vector2.ZERO
	var x := 0.0
	var y := 0.0
	if k["stag"] >= 0.0:
		var q: float = k["stag"] / L.STAGGER
		# knocked back fast, a moment off balance (it dips a pixel), and back slow
		var out := 1.0 - (1.0 - q / 0.15) * (1.0 - q / 0.15) if q < 0.15 else (1.0 if q < 0.42 else 1.0 - _smooth((q - 0.42) / 0.58))
		x += k["sx"] * L.STAGGER_PX * out
		y += k["sy"] * L.STAGGER_PX * out + (1.0 if q > 0.1 and q < 0.5 else 0.0)
	if k["stun"] > 0.0:
		# dazed: it sways, slowly, a pixel each way
		x += floorf(sin(fx.clock * 4.2 + m.get_instance_id() % 997) * 1.2 + 0.5)
	return Vector2(floorf(x + 0.5), floorf(y + 0.5))


static func _smooth(q: float) -> float:
	return q * q * (3.0 - 2.0 * q)


## How far over its feet the top of a monster's head is, game pixels (art/bestiary.ts FIGURE_SIZE, by its figure).
static func top_of(m: Object) -> float:
	var art = m.get("art")
	var figure: String = str(art.name) if art != null else str(m.get("kind"))
	if L.FIGURE_SIZE.has(figure):
		return float(L.FIGURE_SIZE[figure]["top"])
	var sp = m.get("_sprite")
	return -sp.offset.y * sp.scale.y / 2.0 if sp is Sprite2D else 26.0


# --- drawing ---

## ON THE FLOOR, under everything that stands: a Heavy blow's own cracks (words3.ts floor3).
func draw_floor(c: CanvasItem) -> void:
	for p: Dictionary in patches:
		draw_cracks(c, p)


## A web of cracks (words3.ts drawCracks): `p` {x, y, r, t, dur, seed, lines}.
func draw_cracks(c: CanvasItem, p: Dictionary) -> void:
	var C := L.HEAVY
	var K := L.W3_CRACKS
	var lines: Array = p["lines"]
	var pt: float = p["t"]
	var pr: float = p["r"]
	var px: float = p["x"]
	var py: float = p["y"]
	var seed: int = p["seed"]
	var fade := minf(1.0, (float(p["dur"]) - pt) / 0.6)
	var open := minf(1.0, pt / 0.07)
	var cx: float = fx.gx(px, py)
	var cy: float = fx.gy(px, py)
	# the ground is beaten down where it was struck
	fx.floor_oval(c, cx, cy, pr * 0.95, C[0], 0.16 * fade)
	fx.floor_oval(c, cx, cy, pr * 0.32, K[0], 0.34 * fade)
	# the glow in the cracks: white-hot as they open, then bronze that breathes slowly
	var hot := C[5] if pt < 0.12 else (C[4] if pt < 0.35 else (C[3] if sin(pt * 3.0 + seed) > 0.2 else C[2]))
	# grit and chips lying about
	for i in fx._round(6.0 + pr * 8.0):
		var a := L.hash2(seed, i, 21) * TAU
		var d := sqrt(L.hash2(seed, i, 22)) * pr
		var qx := px + cos(a) * d
		var qy := py + sin(a) * d
		fx.rect(c, floorf(fx.gx(qx, qy) + 0.5), floorf(fx.gy(qx, qy) + 0.5), 2 if L.hash2(seed, i, 24) < 0.3 else 1, 1, Color(K[1] if L.hash2(seed, i, 23) < 0.7 else C[2], fade * 0.8))
	# slabs between the spokes, tipped by the blow: each a little lighter or darker than the floor
	var spokes: Array = []
	for q: PackedFloat32Array in lines:
		if q.size() >= 10:
			spokes.append(q)
	if spokes.size() >= 3 and open >= 1.0:
		for k in spokes.size():
			var a: PackedFloat32Array = spokes[k]
			var b: PackedFloat32Array = spokes[(k + 1) % spokes.size()]
			var light := L.hash2(seed, k, 30) < 0.5
			var col := Color(C[4] if light else K[2], fade * (0.1 if light else 0.16))
			var quad := PackedVector2Array([
				Vector2(fx.gx(px + a[2], py + a[3]), fx.gy(px + a[2], py + a[3])) * 2.0, Vector2(fx.gx(px + a[6], py + a[7]), fx.gy(px + a[6], py + a[7])) * 2.0,
				Vector2(fx.gx(px + b[6], py + b[7]), fx.gy(px + b[6], py + b[7])) * 2.0, Vector2(fx.gx(px + b[2], py + b[3]), fx.gy(px + b[2], py + b[3])) * 2.0])
			c.draw_primitive(quad, PackedColorArray([col, col, col, col]), PackedVector2Array())
	for pts: PackedFloat32Array in lines:
		var segs := pts.size() / 2 - 1
		var upto := maxi(1, ceili(segs * open))
		for i in upto:
			var x0: float = fx.gx(px + pts[i * 2], py + pts[i * 2 + 1])
			var y0: float = fx.gy(px + pts[i * 2], py + pts[i * 2 + 1])
			var x1: float = fx.gx(px + pts[i * 2 + 2], py + pts[i * 2 + 3])
			var y1: float = fx.gy(px + pts[i * 2 + 2], py + pts[i * 2 + 3])
			# the lifted edge of the slab above the crack catches the light (upper left)
			fx.pline(c, x0 - 1.0, y0 - 1.0, x1 - 1.0, y1 - 1.0, Color(C[4], fade * 0.4))
			# the gap: dark, two pixels wide near the middle
			fx.pline(c, x0, y0 + 1.0, x1, y1 + 1.0, Color(K[3], fade))
			if segs > 2 and i < 2:
				fx.pline(c, x0 + 1.0, y0 + 1.0, x1 + 1.0, y1 + 1.0, Color(K[4], fade))
			# and the light down in it, brightest toward the middle; the far ends are dark
			if i < segs - 1 or pt < 0.35:
				fx.pline(c, x0, y0, x1, y1, Color(hot if i == 0 or pt < 0.35 else (C[3] if i < 2 else C[2]), fade))
			else:
				fx.pline(c, x0, y0, x1, y1, Color(K[5], fade))


## IN THE AIR, over the dark, so that it glows: the stun turning over a head (words3.ts air3, drawStun).
func draw_air(c: CanvasItem) -> void:
	var C := L.HEAVY
	var t: float = fx.clock
	for id in marks:
		var k: Dictionary = marks[id]
		var m = k["m"]
		if k["stun"] <= 0.0 or not is_instance_valid(m) or m.dead or not m.visible:
			continue
		var by := shift_of(m)
		var at: Vector2 = m.world
		var sx: float = floorf(fx.gx(at.x, at.y) + 0.5) + by.x
		var top: float = floorf(fx.gy(at.x, at.y) + 0.5) + by.y - top_of(m)
		var grow := minf(1.0, k["stun0"] / 0.15)
		var going := minf(1.0, k["stun"] / 0.2)
		# (over the bar of its life, which hangs at the top of its head)
		var cy := top - 11.0
		for pass_i in 2:
			for i in 3:
				var a := t * 6.5 + i / 3.0 * TAU
				var far := sin(a) < 0.0
				if (pass_i == 0) != far:
					continue
				var px := floorf(sx + cos(a) * 9.0 * grow + 0.5)
				var py := floorf(cy + sin(a) * 3.0 * grow + 0.5)
				if far:
					fx.rect(c, px - 1.0, py, 3, 1, Color(C[2], going))
					fx.rect(c, px, py - 1.0, 1, 3, Color(C[2], going))
				else:
					# a four-pointed spark, white at its heart, with a dark pixel under each arm's end
					fx.rect(c, px - 2.0, py + 1.0, 5, 1, Color(L.W3_STUN[0], going))
					fx.rect(c, px - 1.0, py + 3.0, 3, 1, Color(L.W3_STUN[0], going))
					fx.rect(c, px - 2.0, py, 5, 1, Color(C[3], going))
					fx.rect(c, px, py - 2.0, 1, 5, Color(C[3], going))
					fx.rect(c, px - 1.0, py, 3, 1, Color(C[4], going))
					fx.rect(c, px, py - 1.0, 1, 3, Color(C[4], going))
					fx.rect(c, px, py, 1, 1, Color(C[5], going))


## Light (words3.ts lights3): a Heavy blow's cracks, and the stun over a head.
func lights() -> void:
	for p: Dictionary in patches:
		crack_light(p)
	for id in marks:
		var k: Dictionary = marks[id]
		var m = k["m"]
		if k["stun"] > 0.0 and is_instance_valid(m) and not m.dead and m.visible:
			fx.look.spot(Vector2(fx.gx(m.world.x, m.world.y), fx.gy(m.world.x, m.world.y) - (top_of(m) + 6.0)), 16.0, 0.55)


func crack_light(p: Dictionary) -> void:
	var t: float = p["t"]
	fx.look.spot(Vector2(fx.gx(p["x"], p["y"]), fx.gy(p["x"], p["y"]) - 2.0), 18.0 + float(p["r"]) * 14.0, (0.8 if t < 0.4 else 0.5) * minf(1.0, (float(p["dur"]) - t) / 0.6))
