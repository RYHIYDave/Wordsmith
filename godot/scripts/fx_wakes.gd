## THE GROUND A MOVE LEAVES (the game's `zones` that the words behind a move lay: game.ts; drawn by render.ts drawWorld,
## "the hero's ground patches", with their clouds over the dark and their light; what each sends up as it is laid by
## render/fx.ts case 'zone'). A patch is the rules' own: {kind, x, y, r, t (seconds it has lain), dur}.
##   "burn"   Flame behind: the floor burns: a glowing bed, a brighter heart that breathes, and flames that keep rising from
##            all over it; as it is laid, flames and embers, and the floor scorched.
##   "ice"    Frost behind: the floor is frozen over: pale ice with cracks, crystals standing round its edge, glints, and
##            snow in the air above it; as it is laid, spikes of ice round it and snow.
##   "storm"  Lightning behind: the ground under a thundercloud: its shadow, a rim that flickers, arcs that jump about
##            inside it and sparks; over it, over the dark, the cloud roiling with the lightning inside it. (Its strikes on
##            those under it are the rules' own tellings: `arc` with `sky`.)
##   "venom"  Poison behind: the floor slick with it, bubbling; over it, over the dark, puffs of it turning slowly, low
##            enough to stand in; as it is laid, a ring of it billowing out.
##   "cracks" Heavy behind: cracked ground (render/words3.ts crackedGround, drawCracks: fx_words3.gd).
## THE RULES' NODE DRAWS THE FLOOR OF EACH by handing it to fx.gd `draw_wake(self, patch)` from its own _draw (it lies on the
## floor, under this). What a patch sends up, its cloud and its light are tended from the patches so handed over, a frame
## on; or from `fx.wakes.list`, if fx.gd is given the node. A patch is known by its kind and where it lies: one first seen
## in its first quarter of a second is shown being laid, the once (as the game's rules tell of ground laid, and not of a
## patch made new where it lies).
## Left out: the other words' ground (a rune, steam, a ward, a vortex, a hex circle, a bubble, a snare, thorns, the reaper's
## mark, a mirror) and a melded word's.
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")
## (THE STORM CLOUDS MADE AGAIN, behind its switch: fx_cloud.gd)
const Cloud := preload("res://scripts/fx_cloud.gd")
const Words3 := preload("res://scripts/fx_words3.gd")
## (m3: the patches a melded word lays are drawn as its own look: fx_melds3.gd; render.ts ownsZone)
const Melds3 := preload("res://scripts/fx_melds3.gd")
## (v3: and the runes of Volatile's five, Powderkeg's burning ground and Rupture's cloud, theirs: fx_volatile3.gd; render.ts ownsZoneV3)
const Volatile3 := preload("res://scripts/fx_volatile3.gd")


static func _owned(z: Dictionary) -> bool:
	return Melds3.owns_zone(z) or Volatile3.owns_zone(z)

const KINDS := ["burn", "ice", "storm", "venom", "cracks"]

var fx
## The patches handed over in the last pass of drawing, and which frame that was.
var _handed: Array = []
var _handed_frame := -1
var _list: Array = []
## What is known of each patch by its kind and place: {seen, fresh (not yet looked at as it lies), laid (when it was last
## shown being laid), web (a cracked ground's lines)}.
var _known := {}


## A layer on the floor that hands a list of patches over to be drawn, ages them and lets them go: what the rules' node of
## the ground a move left does (the check lays its patches in one of these).
class Layer extends Node2D:
	var fx
	var list: Array = []

	func age(dt: float) -> void:
		for p: Dictionary in list:
			p["t"] += dt
		list = list.filter(func(p): return p["t"] < p["dur"])
		queue_redraw()

	func _process(dt: float) -> void:
		age(dt)

	func _draw() -> void:
		for p: Dictionary in list:
			fx.draw_wake(self, p)


func clear() -> void:
	_handed = []
	_list = []
	_known = {}


func alive() -> bool:
	return not (_list.is_empty() and _handed.is_empty())


static func _key(kind: String, x: float, y: float) -> String:
	return "%s %d %d" % [kind, roundi(x * 100.0), roundi(y * 100.0)]


func _know(kind: String, x: float, y: float) -> Dictionary:
	var key := _key(kind, x, y)
	if not _known.has(key):
		_known[key] = {"seen": fx.clock, "fresh": true, "laid": -9.0}
	return _known[key]


## A number that is a patch's own, steady from frame to frame (render.ts: `Math.floor(z.x * 7 + z.y * 13)`).
static func _seed(x: float, y: float) -> int:
	return floori(x * 7.0 + y * 13.0)


# --- as it is laid ---

## The moment the ground is changed (fx.ts case 'zone'). `told`: by a telling (else seen in the list).
func laid(kind: String, x: float, y: float, r: float, told: bool) -> void:
	var k := _know(kind, x, y)
	if fx.clock - float(k["laid"]) <= 0.3:
		return
	k["laid"] = fx.clock
	if told:
		k["seen"] = fx.clock
	# A shot leaves a small patch every step of its way: those get a lighter touch each, and lighter still when the air is
	# full.
	var small := r < 1.2
	var room: float = fx.room() if small else 1.0
	match kind:
		"burn":
			fx.flames(x, y, r * 0.8, _few(4.0, room) if small else mini(14, fx._round(5.0 + r * 5.0)))
			fx.streaks(x, y, _few(2.0, room) if small else 5, L.EMBER, 3.5, 2.0, {"up": 80.0, "grav": 170.0, "life": 0.45, "r": r * 0.5})
			fx.scorch(x, y, r * 0.95)
		"ice":
			var n := 3 if small else mini(10, fx._round(4.0 + r * 3.0))
			var a0 := randf() * TAU
			for i in n:
				var a := a0 + float(i) / n * TAU + L.rnd(-0.2, 0.2)
				fx.spikes.append({"x0": x + cos(a) * r * 0.5, "y0": y + sin(a) * r * 0.5, "x1": x + cos(a) * r * L.rnd(0.85, 1.05), "y1": y + sin(a) * r * L.rnd(0.85, 1.05),
					"tall": L.rnd(3, 7), "t": 0.0, "dur": L.rnd(0.6, 0.9)})
			fx.snow(x, y, r, _few(3.0, room) if small else mini(10, fx._round(4.0 + r * 3.0)))
		"storm":
			if not small or randf() < 0.5:
				fx.flash(x, y, 34.0 if small else 44.0, 0.4 if small else 0.6, 0.1, L.VOLT)
			fx.streaks(x, y, _few(3.0, room) if small else 6, L.VOLT, 3.0, 2.0, {"life": 0.25, "r": r * 0.6, "z": 4.0})
		"venom":
			# the cloud billows out from where the attack hit
			fx.ring(x, y, r, 0.4, L.rest(L.VENOM), true)
			fx.bubbles(x, y, r * 0.8, mini(16, fx._round(6.0 + r * 4.0)))
		# (cracked ground is the new words' look: nothing more as it is laid than its cracks tearing open)


## So many, thinned by `k`: the whole of it, and one more by the chance of what is left over (fx.ts case 'zone', `few`).
static func _few(n: float, k: float) -> int:
	return int(floorf(n * k)) + (1 if randf() < fmod(n * k, 1.0) else 0)


## So many by a rate: the whole of it, and one more by the chance of what is left over (render.ts `some`).
static func _some(rate: float) -> int:
	return int(floorf(rate)) + (1 if randf() < fmod(rate, 1.0) else 0)


# --- each frame ---

## What the patches send up, by the game's chances (render.ts drawWorld, as it draws each: `amb` is how much of a sixtieth
## of a second this frame stands for, thinned as the air fills); and one newly come is shown being laid.
func tend(dt: float) -> void:
	var src = fx.wakes
	if src != null and is_instance_valid(src) and src.get("list") is Array:
		_list = src.list
	else:
		# (what the last pass of drawing handed over; nothing handed over for a few frames: there is none any more)
		if Engine.get_frames_drawn() - _handed_frame > 3:
			_handed = []
		_list = _handed
	var now: float = fx.clock
	var amb: float = dt * 60.0 * fx.room()
	for p: Dictionary in _list:
		var kind := str(p.get("kind", ""))
		# (m3: a melded word's patch is its own look's, laid, sending up and lit: fx_melds3.gd; render.ts ownsZone)
		if not kind in KINDS or _owned(p):
			continue
		var x: float = p["x"]
		var y: float = p["y"]
		var r: float = p["r"]
		var t: float = p["t"]
		var k := _know(kind, x, y)
		k["seen"] = now
		# (shown being laid the once, as it first comes: the rules lay a patch again where one lies by making that one new,
		# and tell of no new ground: game.ts addGround)
		if k["fresh"]:
			k["fresh"] = false
			if t < 0.25:
				laid(kind, x, y, r, false)
		var fade := minf(1.0, (float(p["dur"]) - t) * 2.0)
		match kind:
			"venom":
				if randf() < 0.3 * r * amb:
					fx.bubbles(x, y, r * 0.85, 1)
			"burn":
				for i in _some(minf(2.4, 0.5 + r * 0.9) * fade * amb):
					fx.flames(x, y, r * 0.85, 1)
			"ice":
				if randf() < 0.25 * r * amb:
					fx.mote(x + (randf() - 0.5) * r * 1.4, y + (randf() - 0.5) * r * 1.4, PackedColorArray([L.P["white"], L.P["bu5"]]))
			"storm":
				if randf() < 0.09 * amb:
					var a := randf() * TAU
					var b := a + 1.2 + randf() * 2.4
					fx.ground_bolt(x + cos(a) * r * 0.8, y + sin(a) * r * 0.8, x + cos(b) * r * 0.8, y + sin(b) * r * 0.8)
				if randf() < 0.45 * amb:
					fx.spray(x + (randf() - 0.5) * r * 1.5, y + (randf() - 0.5) * r * 1.5, 1, L.EL["lightning"], 1.6, 40.0, 2.0)
	for key in _known.keys():
		if now - float(_known[key]["seen"]) > 0.25:
			_known.erase(key)


## Their light in the dark (render.ts light: "it dims as the patch gives out, instead of going out like a lamp"; the small
## patches along a shot's path share their light; words3.ts lights3 for cracked ground).
func lights() -> void:
	var lit := PackedFloat32Array()
	for p: Dictionary in _list:
		var kind := str(p.get("kind", ""))
		if not kind in KINDS or _owned(p):
			continue
		if kind == "cracks":
			fx.words3.crack_light(p)
			continue
		var x: float = p["x"]
		var y: float = p["y"]
		var r: float = p["r"]
		var small := r < 1.2
		if small:
			var near := false
			var i := 0
			while i < lit.size() and not near:
				near = absf(lit[i] - x) < 1.0 and absf(lit[i + 1] - y) < 1.0
				i += 2
			if near:
				continue
			lit.append(x)
			lit.append(y)
		fx.look.spot(Vector2(fx.gx(x, y), fx.gy(x, y)), (30.0 if small else 18.0) + r * 16.0, 0.7 * minf(1.0, (float(p["dur"]) - float(p["t"])) * 2.0))


# --- drawing ---

## One patch's floor, on a canvas that lies on the floor (render.ts drawWorld: "the hero's ground patches"; words3.ts
## drawCracks). The game paints each kind's still part once into a picture of its own and stamps it down; here it is drawn
## where it lies each frame, the same shapes at the same strengths.
func draw(c: CanvasItem, p: Dictionary) -> void:
	var frame := Engine.get_frames_drawn()
	if frame != _handed_frame:
		_handed_frame = frame
		_handed = []
	_handed.append(p)
	var kind := str(p.get("kind", ""))
	# (floors 6 to 10's words: Volatile's rune and Guarding's ward, fx_words610.gd)
	if fx.w610 != null and fx.w610.draw_patch(c, p):
		return
	# (the city's words: Pulling's vortex, Hexing's circle, Stilling's bubble, Binding's snare, fx_city3.gd)
	if fx.city3 != null and fx.city3.draw_patch(c, p):
		return
	if not kind in KINDS or _owned(p):
		return
	var P: Dictionary = L.P
	var x: float = p["x"]
	var y: float = p["y"]
	var zr: float = p["r"]
	var zt: float = p["t"]
	var t: float = fx.clock
	if kind == "cracks":
		var k := _know(kind, x, y)
		if not k.has("web"):
			k["web"] = Words3.cracks(x, y, zr, float(p["dur"]), true)
		var web: Dictionary = k["web"]
		web["t"] = zt
		web["dur"] = p["dur"]
		fx.words3.draw_cracks(c, web)
		return
	var cx: float = fx.gx(x, y)
	var cy: float = fx.gy(x, y)
	var fade := minf(1.0, (float(p["dur"]) - zt) * 2.0)
	var seed := _seed(x, y)
	var big := zr >= 1.2
	# (the still part is painted for the patch's size to an eighth of a tile, and stamped at a whole pixel)
	var r := roundf(zr * 8.0) / 8.0
	var px := floorf(cx + 0.5)
	var py := floorf(cy + 0.5)
	match kind:
		"venom":
			# Poison behind: the floor is slick with it, and a cloud of it hangs low (the cloud is drawn in the air)
			var a := fade * minf(1.0, 0.3 + zt / 0.15)
			fx.floor_oval(c, px, py, r, P["vn2"], 0.34 * a)
			fx.floor_oval(c, px, py, r * 0.7, P["vn3"], 0.22 * a)
			_ring(c, px, py, r, Color(P["vn3"], a), 2)
		"burn":
			# Flame behind: the floor burns. A glowing bed, a brighter heart that breathes, and flames that keep rising
			fx.floor_oval(c, px, py, r, P["fr2"], 0.3 * fade)
			fx.floor_oval(c, px, py, r * 0.62, P["fr4"], 0.3 * fade)
			fx.floor_oval(c, px, py, r * 0.3, P["fr5"], 0.25 * fade)
			if big:
				fx.floor_oval(c, cx, cy, zr * (0.66 + 0.07 * sin(t * 9.0 + seed)), P["fr4"], 0.12 * fade)
		"ice":
			# Frost behind: the floor is frozen over. Pale ice with cracks, crystals standing round its edge, glints
			var v := seed % 5
			# it spreads over the floor in its first moment
			var a := fade * minf(1.0, 0.25 + zt / 0.12)
			fx.floor_oval(c, px, py, r, P["bu4"], 0.28 * a)
			fx.floor_oval(c, px, py, r * 0.72, P["bu5"], 0.2 * a)
			for i in 3:
				var qa := L.hash2(i, v, 1) * TAU
				var qb := qa + 2.2 + L.hash2(i, v, 2)
				fx.pline(c, px + (cos(qa) - sin(qa)) * 16.0 * r * 0.8, py + (cos(qa) + sin(qa)) * 8.0 * r * 0.8, px + (cos(qb) - sin(qb)) * 16.0 * r * 0.6, py + (cos(qb) + sin(qb)) * 8.0 * r * 0.6, Color(P["bu5"], a))
			# (fewer crystals round the small patches a shot leaves along its path: there are many of those)
			var n: int = fx._round(7.0 + r * 5.0) if big else fx._round(3.0 + r * 4.0)
			for i in n:
				var qa := float(i) / n * TAU + L.hash2(i, v, 3) * 0.5
				var d := r * (0.86 + L.hash2(i, v, 4) * 0.12)
				var qx := px + floorf((cos(qa) - sin(qa)) * 16.0 * d + 0.5)
				var qy := py + floorf((cos(qa) + sin(qa)) * 8.0 * d + 0.5)
				var tall := floorf(3.0 + L.hash2(i, v, 5) * 6.0 + 0.5)
				fx.rect(c, qx + 1.0, qy - tall + 1.0, 1, tall, Color(P["bu4"], a))
				fx.rect(c, qx, qy - tall, 1, tall, Color(P["white"], a))
				var part := floorf(tall * 0.55 + 0.5)
				fx.rect(c, qx - 1.0, qy - part, 1, part, Color(P["bu5"], a))
			# glints that come and go
			for i in (4 if big else 2):
				if L.hash2(i, seed, floori(t * 5.0)) > 0.3:
					continue
				var qa := L.hash2(i, seed, 6) * TAU
				var d := L.hash2(i, seed, 7) * zr * 0.8
				var gx0: float = x + cos(qa) * d
				var gy0: float = y + sin(qa) * d
				fx.rect(c, floorf(fx.gx(gx0, gy0) + 0.5), floorf(fx.gy(gx0, gy0) + 0.5), 2, 1, Color(P["white"], fade))
		"storm":
			# Lightning behind: the ground under a thundercloud (the cloud itself is drawn in the air): its shadow, a rim
			# that flickers
			var lit := floori(t * 14.0) % 2 == 0
			fx.floor_oval(c, px, py, r, P["black"], 0.2 * fade)
			_ring(c, px, py, r, Color(P["lt4"] if lit else P["lt3"], fade), 2)
			if big:
				fx.floor_oval(c, cx, cy, zr * 0.55, P["lt4"], (0.05 + 0.05 * absf(sin(t * 11.0 + seed))) * fade)


## Dots round a circle of `r` tiles on the floor about a whole pixel, every `gap`th (render.ts ringDots, as it is painted
## into a patch's own picture: round the picture's middle, which is then stamped at a whole pixel).
func _ring(c: CanvasItem, px: float, py: float, r: float, col: Color, gap: int) -> void:
	var n: int = maxi(16, fx._round(r * 44.0))
	for i in range(0, n, gap):
		var a := float(i) / n * TAU
		c.draw_rect(Rect2((px + floorf((cos(a) - sin(a)) * 16.0 * r + 0.5)) * 2.0, (py + floorf((cos(a) + sin(a)) * 8.0 * r + 0.5)) * 2.0, 2.0, 2.0), col)


## Over the dark: the thundercloud over a storm's patch, and the puffs of poison over a slick of it (render.ts drawWorld,
## after its darkness: "things that glow").
func draw_air(c: CanvasItem) -> void:
	if _list.is_empty():
		return
	var P: Dictionary = L.P
	var t: float = fx.clock
	var wisps := PackedFloat32Array()
	for z: Dictionary in _list:
		if str(z.get("kind", "")) != "storm" or _owned(z):
			continue
		# Lightning behind: a thundercloud hangs over its patch of ground and flickers (the small patches a shot leaves
		# along its path get a wisp of cloud each, lower down, so a trail of them does not roof the whole room over)
		var x: float = z["x"]
		var y: float = z["y"]
		var zr: float = z["r"]
		var zt: float = z["t"]
		var dur: float = z["dur"]
		var small := zr < 1.2
		if small:
			# one wisp serves the small patches near it
			var near := false
			var i := 0
			while i < wisps.size() and not near:
				near = absf(wisps[i] - x) < 1.5 and absf(wisps[i + 1] - y) < 1.5
				i += 2
			if near:
				continue
			wisps.append(x)
			wisps.append(y)
		var fade := minf(1.0, minf(zt / 0.2, (dur - zt) * 2.0))
		var seed := _seed(x, y)
		var v := seed % 5
		var wk := roundf(minf(1.4, zr) * 8.0)
		var wide := wk / 8.0 * (12.0 if small else 17.0)
		# THE CLOUD ROILS: every puff of it is drawn where it is this instant: it billows out from the middle as the cloud
		# forms, each puff turns slowly about its own place and swells and shrinks, the lightning is INSIDE it (one puff and
		# its neighbours lit from within, a different one each flicker), and at the end it thins and lifts away.
		var born := minf(1.0, zt / 0.35)
		var going := clampf((dur - zt) / 0.5, 0.0, 1.0)
		var cx: float = floorf(fx.gx(x, y) + sin(t * 0.8 + seed) * 2.0 + 0.5)
		var cy: float = floorf(fx.gy(x, y) + 0.5) - (40.0 if small else 50.0) - floorf((1.0 - going) * 6.0 + 0.5)
		var puffs := 3 if small else 9
		var beat := floori(t * 12.0)
		var struck := int(L.hash2(seed, beat, 5) * puffs) if L.hash2(seed, beat, 4) < 0.4 else -1
		var al := (0.75 if small else 0.92) * fade
		if Cloud.ON:
			# (one cloud, its billows lit from the upper left, the lightning inside it: fx_cloud.gd)
			var rect := func(x: float, y: float, w: float, h: float, col: Color, a: float) -> void: fx.rect(c, x, y, w, h, Color(col, a))
			var lt3 := Color(P["lt3"])
			Cloud.draw(rect, cx, cy, wide, t, seed, born, going, al, [Color(P["st1"]), Color(P["st2"]), Color(P["st3"]), Color(P["st5"]), Color(P["st7"])],
				[lt3.lerp(Color(P["st5"]), 0.2), lt3, Color(P["lt4"])], (float(struck) + 0.5) / float(puffs) if struck >= 0 else -1.0, 0.0 if small else 30.0)
			continue
		for i in puffs:
			var churn := t * (0.7 + L.hash2(i, v, 6) * 0.6) + i * 2.1
			var ox := ((L.hash2(i, v, 1) - 0.5) * wide * 2.0 + sin(churn) * 2.5) * (0.35 + 0.65 * born)
			var oy := (L.hash2(i, v, 2) - 0.5) * (4.0 if small else 7.0) + cos(churn * 0.8) * 1.4
			var r := maxf(1.0, ((5.0 if small else 7.0) + L.hash2(i, v, 3) * (3.0 if small else 6.0) + sin(churn * 1.3) * 0.9) * (0.4 + 0.6 * born) * (0.5 + 0.5 * going))
			var px := floorf(cx + ox + 0.5)
			var py := floorf(cy + oy + 0.5)
			# pale tops, dark bellies; a belly with the lightning in it glows, and its neighbours a little
			fx.oval(c, px, py - 2.0, r, r * 0.55, Color(P["st5"], al))
			var near := absi(i - struck) if struck >= 0 else 9
			fx.oval(c, px, py, r, r * 0.55, Color(P["lt4"] if near == 0 else (P["lt3"] if near == 1 else (P["st2"] if i % 2 == 0 else P["st3"])), al))
			if near == 0:
				fx.oval(c, px, py + 1.0, r * 0.5, r * 0.22, Color(P["white"], al))
		# ... and when it is, the underside of the whole cloud catches the light
		if struck >= 0:
			fx.rect(c, floorf(cx - wide * 0.7 + 0.5), floorf(cy + 5.0 + 0.5), floorf(wide * 1.4 + 0.5), 1, Color(P["lt3"], al))
	for z: Dictionary in _list:
		if str(z.get("kind", "")) != "venom" or _owned(z):
			continue
		# Poison behind: puffs of it turn slowly over the slick, low enough to stand in
		var x: float = z["x"]
		var y: float = z["y"]
		var zr: float = z["r"]
		var zt: float = z["t"]
		var fade := minf(1.0, minf(zt / 0.25, (float(z["dur"]) - zt) * 2.0))
		var seed := _seed(x, y)
		var n: int = fx._round(4.0 + zr * 2.0)
		for i in n:
			var a := float(i) / n * TAU + t * (0.25 + L.hash2(i, seed, 1) * 0.3) * (1.0 if i % 2 == 0 else -1.0)
			var d := zr * (0.25 + L.hash2(i, seed, 2) * 0.55)
			var qx := x + cos(a) * d
			var qy := y + sin(a) * d
			var px: float = floorf(fx.gx(qx, qy) + 0.5)
			var py: float = floorf(fx.gy(qx, qy) + 0.5) - 6.0 - floorf(L.hash2(i, seed, 3) * 8.0 + sin(t * 1.3 + i) * 2.0 + 0.5)
			var rr := 5.0 + L.hash2(i, seed, 4) * 5.0
			fx.oval(c, px, py, rr * 1.5, rr * 0.8, Color(P["vn4"] if i % 3 == 0 else P["vn3"], (0.2 + L.hash2(i, seed, 5) * 0.14) * fade))
