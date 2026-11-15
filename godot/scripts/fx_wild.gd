## BIG AND WILD, THE WARRIOR'S SHARE (render/wild.ts; art/moves3.ts WILD, on in the game): what the effects add to his moves,
## "each hero in his own way": for the swordsman the blade's light, wind, dust and a kick; no crackle (that is the Mage's).
##   STRIKE (swing, blowHit): a thick crescent of the friend's light where the blade went, white at its leading edge, and a
##     slimmer sweep a moment after it as the blade follows through; white lines of wind off its edge; dust and a ring at his
##     feet; the screen kicks. The second swing of his two sweeps the other way. What it hits a moment later is struck hard:
##     a white cut and burst across it, a ring, the game holding still an instant.
##   WHAT FLIES OFF A HIT is what the struck is made of (MATTER, debris): bone and dust off a skeleton, yellow sparks and
##     flakes of iron off the armoured, scraps of robe off a cultist, a little blood off flesh.
##   THE WHIRLWIND (whirlStart, whirlTurn, ongoing, whirlEnd): a kick of dust and a flash as it begins; a ring of the blade's
##     light round him and a wider one of the wind it raises, lines of wind flung off the blade's edge and dust flung out
##     round his feet for as long as it lasts; a ring of wind thrown out with each turn; one last sweep flung wide as it ends.
##   THE THRUST LANDS (landing: the leap's "land", as his thrust, art/heroes3.ts THRUST, on in the game): a spear of the
##     blade's light and a blast of air straight on from the point, a ring of wind, the floor cracked under his front foot and
##     dust skidding on ahead; the game holding still a tenth of a second and the screen kicking hard.
## fx.gd hands on to this where the game's effects hand on to `this.wild`.
## Left out: the Mage's (her crystal's crackle, the Wave, the Orb, the Warp: arcs and bolts of power) and the Ranger's (the
## Shot, the Volley, the Trap: hoops and trails of air, a trap's whirlwind); the leap that is not a thrust (no hero leaps so
## in the game as it is); the thrust's take-off and its flight (wild.ts ongoing, thrustOff: they go by the hero's own move,
## which no telling carries).
extends RefCounted

const L := preload("res://scripts/fx_looks.gd")

## (how many particles there may be before these add no more: wild.ts spark)
const SPARKS_MOST := 880
## (how long without a turn of it ends a whirlwind that no telling ended: its turns come 0.3 s apart)
const WHIRL_OVER := 0.45

var fx
var clock := 0.0
var later: Array = []
## The hero's last swing (Strike): {x, y, reach, at}. What it hits a moment later is struck hard.
var swung := {}
## Where a heavy blow fell a moment ago (the thrust's landing, a whirlwind's turn): {x, y, r, at, force}.
var slams: Array = []
## The whirlwind he is in, if he is: {since, r, x, y, turned (when its last turn came)}.
var whirling := {}
## Rings of wind, and of the blade's light, going round a place (Vortex): {key, x, y, r, z, k, spin, fresh, blade}.
var vortices: Array = []


func clear() -> void:
	later = []
	swung = {}
	slams = []
	whirling = {}
	vortices = []


func alive() -> bool:
	return not (vortices.is_empty() and later.is_empty() and whirling.is_empty())


func _spark(x: float, y: float, z: float, vx: float, vy: float, vz: float, life: float, colors: PackedColorArray, grav := 180.0, streak := 0.0, size := 0.0) -> void:
	if fx.pn >= SPARKS_MOST:
		return
	fx.add(x, y, z, vx, vy, vz, life, L.pick(colors), size if size > 0.0 else (2.0 if randf() < 0.22 else 1.0), grav, null, streak)


## So many a second, this frame (wild.ts ongoing, `rate`).
static func _rate(dt: float, per_sec: float) -> int:
	return int(floorf(dt * per_sec + randf()))


## What is at (x, y): the figure of the monster nearest it, within a tile; "" for none (wild.ts figureAt).
func _figure_at(x: float, y: float) -> String:
	var best := ""
	var near := 1.0
	if fx.monsters == null or not is_instance_valid(fx.monsters):
		return best
	for m in fx.monsters.list:
		if not is_instance_valid(m) or m.dead:
			continue
		var d: float = m.world.distance_to(Vector2(x, y))
		if d < near:
			near = d
			var art = m.get("art")
			best = str(art.name) if art != null else str(m.kind)
	return best


## What flies off what was hit at (x, y), struck the way `a` (radians, on the floor) with `force` (1 a blow of Strike, less
## a lighter one) (wild.ts debris).
func _debris(x: float, y: float, a: float, force: float) -> void:
	var P: Dictionary = L.P
	var figure := _figure_at(x, y)
	# (one of a kind's other looks, '<kind>:<form>', is of its kind's matter)
	if figure.contains(":"):
		figure = figure.substr(0, figure.find(":"))
	var matter: Dictionary = L.MATTER.get(figure, {"bits": PackedColorArray([P["st6"], P["st5"]]), "sparks": false, "blood": false, "dust": true})
	var bits: PackedColorArray = matter["bits"]
	var n: int = fx._round(11.0 * force)
	for i in n:
		# (most of it flung on the way the blow went, the rest anywhere; chips big enough to see)
		var q := a + L.rnd(-0.8, 0.8) if i < n * 0.65 else randf() * TAU
		var v := L.rnd(1.2, 3.6) * (0.6 + 0.4 * force)
		_spark(x, y, L.rnd(8, 20), cos(q) * v, sin(q) * v, L.rnd(50, 140), L.rnd(0.35, 0.6), bits, 320.0, 0.0, 3.0 if randf() < 0.2 else 2.0)
	if matter["sparks"]:
		# (a spray of them, bright, flung on and bouncing off the floor)
		for i in fx._round(24.0 * force):
			var q := a + L.rnd(-1.3, 1.3)
			var v := L.rnd(2.5, 6.5)
			_spark(x, y, L.rnd(12, 24), cos(q) * v, sin(q) * v, L.rnd(40, 140), L.rnd(0.25, 0.5), L.STRUCK_STEEL, 300.0, 4.0 if i % 2 == 0 else 0.0, 2.0)
		fx.flash(x, y, 18.0, 0.3, 0.08, PackedColorArray([P["white"], P["gd5"], P["gd4"]]))
	if matter["blood"]:
		for i in fx._round(4.0 * force):
			var q := a + L.rnd(-0.7, 0.7)
			var v := L.rnd(1.0, 2.6)
			_spark(x, y, L.rnd(10, 18), cos(q) * v, sin(q) * v, L.rnd(20, 70), L.rnd(0.3, 0.5), L.WILD_BLOOD, 300.0)
	if matter["dust"]:
		# (a puff of it where the blow fell, that hangs a moment as it drifts on and settles)
		var soft := PackedColorArray([bits[bits.size() - 1], P["st5"]])
		for i in fx._round(6.0 * force):
			var q := a + L.rnd(-1.3, 1.3)
			var v := L.rnd(0.3, 1.1)
			_spark(x, y, L.rnd(9, 19), cos(q) * v, sin(q) * v, L.rnd(-4, 10), L.rnd(0.45, 0.8), soft, 14.0, 0.0, 2.0)
		var grey := PackedColorArray([P["st6"], P["st5"], P["st4"]])
		for i in fx._round(6.0 * force):
			var q := randf() * TAU
			var v := L.rnd(0.3, 1.0)
			_spark(x + cos(q) * 0.15, y + sin(q) * 0.15, L.rnd(2, 10), cos(q) * v, sin(q) * v, L.rnd(8, 30), L.rnd(0.4, 0.7), grey, 40.0)


func update(dt: float) -> void:
	clock += dt
	for i in range(later.size() - 1, -1, -1):
		var q: Dictionary = later[i]
		q["t"] -= dt
		if q["t"] <= 0.0:
			later.remove_at(i)
			(q["fn"] as Callable).call()
	for i in range(vortices.size() - 1, -1, -1):
		var v: Dictionary = vortices[i]
		v["spin"] += dt * (15.0 if v["blade"] else 5.5)
		# (one no longer told of dies down)
		if not v["fresh"]:
			v["k"] -= dt * 3.5
		v["fresh"] = false
		if v["k"] <= 0.0:
			vortices.remove_at(i)
	for i in range(slams.size() - 1, -1, -1):
		if clock - slams[i]["at"] >= 0.3:
			slams.remove_at(i)
	if dt > 0.0:
		_ongoing(dt)


## A ring of wind (or of the blade's light) going round a place, told of again each frame it lasts (wild.ts vortex).
func _vortex(key: String, x: float, y: float, r: float, z: float, k: float, blade: bool) -> void:
	var v := {}
	for q: Dictionary in vortices:
		if q["key"] == key:
			v = q
	if v.is_empty():
		v = {"key": key, "k": 0.0, "spin": randf() * 6.0, "blade": blade}
		vortices.append(v)
	v["x"] = x
	v["y"] = y
	v["r"] = r
	v["z"] = z
	v["k"] = minf(1.0, maxf(v["k"], k))
	v["fresh"] = true


## What goes on for as long as it lasts, each frame: the whirlwind round the warrior (wild.ts ongoing).
func _ongoing(dt: float) -> void:
	if whirling.is_empty():
		return
	var P: Dictionary = L.P
	var h: Vector2 = fx.hero_at() if fx.hero() != null else Vector2(whirling["x"], whirling["y"])
	# (no telling has said it ended: no turn of it for a while, and it has)
	if clock - float(whirling["turned"]) > WHIRL_OVER:
		whirl_end(h.x, h.y)
		return
	var r: float = whirling["r"]
	# THE WHIRLWIND: a ring of the blade's light round him and a wider one of the wind it raises; lines of wind flung off
	# the blade's edge; dust and grit kicked up round his feet and flung out
	_vortex("whirl", h.x, h.y, r * 0.92, 11.0, 1.0, true)
	_vortex("whirlAir", h.x, h.y, r * 1.28, 5.0, 0.85, false)
	var wind := PackedColorArray([P["white"], L.AIR[1]])
	for i in _rate(dt, 110.0):
		var q := randf() * TAU
		var rr := r * L.rnd(0.75, 1.05)
		var v := L.rnd(4, 8)
		# (round the way he turns, and outward)
		_spark(h.x + cos(q) * rr, h.y + sin(q) * rr, L.rnd(5, 16), -sin(q) * v + cos(q) * L.rnd(1, 3), cos(q) * v + sin(q) * L.rnd(1, 3), 0.0, L.rnd(0.08, 0.14), wind, 0.0, L.rnd(6, 10))
	var grey := PackedColorArray([P["st6"], P["st5"], P["st4"]])
	for i in _rate(dt, 70.0):
		var q := randf() * TAU
		var v := L.rnd(1.2, 3.0)
		_spark(h.x + cos(q) * L.rnd(0.2, 0.7), h.y + sin(q) * L.rnd(0.2, 0.7), 1.0, cos(q) * v - sin(q) * v * 0.6, sin(q) * v + cos(q) * v * 0.6, L.rnd(20, 70), L.rnd(0.25, 0.5), grey, 220.0)
	fx.glow(h.x, h.y, 44.0 + L.rnd(0, 10), 0.05, 40)


## Cracks torn in the floor out from a place: `n` of them, about `long` tiles, lasting `dur` seconds; cold (the warrior's: no
## glow in them) (wild.ts cracksAt).
func _cracks_at(x: float, y: float, long: float, n: int, dur: float) -> void:
	var a0 := randf() * TAU
	for k in n:
		var a := a0 + float(k) / n * TAU + L.rnd(-0.3, 0.3)
		var length := long * L.rnd(0.7, 1.1)
		var pts := PackedFloat32Array([x + cos(a) * 0.08, y + sin(a) * 0.08])
		for i in range(1, 5):
			var d := length * i / 4.0
			var j := L.rnd(-0.14, 0.14) * (1.0 if i < 4 else 0.4)
			pts.append(x + cos(a) * d - sin(a) * j)
			pts.append(y + sin(a) * d + cos(a) * j)
		fx.cracks.append({"pts": pts, "t": 0.0, "dur": dur, "hot": 0.0})
	while fx.cracks.size() > 70:
		fx.cracks.pop_front()


## THE THRUST LANDS (the leap's 'burst' land, as the warrior's thrust: wild.ts landing, thrustLanding): his front foot slams
## down into the lunge and the point is PUNCHED OUT.
func landing(x: float, y: float, r: float) -> void:
	var P: Dictionary = L.P
	var h = fx.hero()
	var a: float = atan2(h.face.y, h.face.x) if h != null else 0.0
	var ux := cos(a)
	var uy := sin(a)
	var px := x + ux * L.THRUST_POINT
	var py := y + uy * L.THRUST_POINT
	var pz := L.THRUST_POINT_Z
	var white: Color = P["white"]
	fx.flash(px, py, pz, 0.9, 0.12, PackedColorArray([white, L.AIR[1], L.CRACKLE[1], L.CRACKLE[2]]))
	# (the spear of light: straight on from the point, a long streak and a dozen shorter ones about it)
	var air3 := PackedColorArray([white, L.AIR[0], L.AIR[1]])
	for i in 18:
		var v := L.rnd(9, 16)
		var off := 0.0 if i == 0 else L.rnd(-0.12, 0.12)
		_spark(px - uy * off, py + ux * off, pz + L.rnd(-2, 2), ux * v, uy * v, 0.0, L.rnd(0.08, 0.16), L.BLADE if i < 6 else air3, 0.0, 16.0 if i == 0 else L.rnd(7, 12), 2.0 if i < 4 else 1.0)
	# (the blast of air, a cone on from the point)
	var airs := PackedColorArray([L.AIR[0], L.AIR[1], L.AIR[2]])
	for i in 22:
		var q := a + L.rnd(-0.55, 0.55)
		var v := L.rnd(5, 9)
		_spark(px, py, pz + L.rnd(-4, 4), cos(q) * v, sin(q) * v, L.rnd(-10, 10), L.rnd(0.08, 0.13), airs, 0.0, L.rnd(6, 10))
	fx.ring(px, py, maxf(0.7, r * 0.6), 0.22, airs, false, {"swirl": true, "heavy": true})
	# (his front foot: the floor cracked, and dust skidding on ahead of him)
	var fx0 := x + ux * 0.4
	var fy0 := y + uy * 0.4
	_cracks_at(fx0, fy0, 0.6, 4, 1.6)
	var stone := PackedColorArray([P["st7"], P["st6"], P["st5"], P["st4"]])
	for i in 22:
		var q := a + L.rnd(-1.1, 1.1)
		var v := L.rnd(1.2, 3.6)
		_spark(fx0 + L.rnd(-0.1, 0.1), fy0 + L.rnd(-0.1, 0.1), 1.0, cos(q) * v, sin(q) * v, L.rnd(10, 60), L.rnd(0.35, 0.7), stone, 300.0, 0.0, 2.0 if randf() < 0.4 else 1.0)
	fx.glow(px, py, 60.0, 0.14, 40)
	fx.kick(3.6)
	fx.hold_for(0.1)


## THE WHIRLWIND BEGINS (the 'channel' of a whirl: wild.ts whirlStart): a kick of dust off the floor round him, a flash on
## the blade, and the screen jolts.
func whirl_start(x: float, y: float) -> void:
	var P: Dictionary = L.P
	whirling = {"since": clock, "r": whirling.get("r", 2.0), "x": x, "y": y, "turned": clock}
	var grey := PackedColorArray([P["st6"], P["st5"], P["st4"]])
	fx.ring(x, y, 1.0, 0.22, grey, false, {"heavy": true})
	for i in 22:
		var q := randf() * TAU
		var v := L.rnd(1, 3)
		_spark(x + cos(q) * 0.2, y + sin(q) * 0.2, 1.0, cos(q) * v, sin(q) * v, L.rnd(30, 90), L.rnd(0.3, 0.55), grey, 230.0)
	fx.flash(x, y, 12.0, 0.7, 0.1, L.BLADE)
	fx.kick(1.8)


## Each turn of the whirlwind ('burst' whirl: wild.ts whirlTurn): a ring of wind thrown out past the blade, and a jolt. What
## the blade meets is struck hard. (No telling of its beginning: its first turn begins it.)
func whirl_turn(x: float, y: float, r: float) -> void:
	if whirling.is_empty():
		whirl_start(x, y)
	whirling["r"] = r
	whirling["x"] = x
	whirling["y"] = y
	whirling["turned"] = clock
	fx.ring(x, y, r * 1.3, 0.26, PackedColorArray([L.AIR[0], L.AIR[1], L.AIR[2]]), false, {"swirl": true, "heavy": true})
	slams.append({"x": x, "y": y, "r": r + 0.5, "at": clock, "force": 0.8})
	fx.kick(1.2)


## THE WHIRLWIND ENDS (its 'channelEnd': wild.ts whirlEnd): one last sweep of the blade flung wide, and he plants his feet:
## dust, a ring, wind flung out, and a kick.
func whirl_end(x: float, y: float) -> void:
	if whirling.is_empty():
		return
	var P: Dictionary = L.P
	var r: float = whirling["r"]
	whirling = {}
	var h = fx.hero()
	var a: float = atan2(h.face.y, h.face.x) if h != null else L.rnd(0.0, TAU)
	fx.slash(x, y, a, r * 1.05, 0.26, L.BLADE, true)
	later.append({"t": 0.05, "fn": func(): fx.slash(x, y, a + 1.6, r, 0.22, L.BLADE, false, {"faint": true})})
	fx.ring(x, y, r * 1.1, 0.25, PackedColorArray([P["st6"], P["st5"], P["st4"]]), false, {"heavy": true})
	var wind := PackedColorArray([P["white"], L.AIR[1]])
	for i in 18:
		var q := randf() * TAU
		var v := L.rnd(5, 9)
		_spark(x, y, L.rnd(5, 15), cos(q) * v, sin(q) * v, 0.0, L.rnd(0.08, 0.14), wind, 0.0, L.rnd(6, 10))
	fx.kick(2.2)


## STRIKE, BIG AND WILD, A SWORDSMAN'S (wild.ts swing). Says whether it drew the crescent (then the plain cut is not drawn):
## it does for a swing whose words leave the cut its plain shape. `back`: the second swing of his two, the swipe back.
func swing(x: float, y: float, dx: float, dy: float, reach: float, plain: bool, back: bool) -> bool:
	var P: Dictionary = L.P
	var a := atan2(dy, dx)
	var r := reach * 1.15
	var dir := -1.0 if back else 1.0
	var light := PackedColorArray([P["white"], L.CRACKLE[1], L.CRACKLE[2], L.CRACKLE[3]])
	if plain:
		fx.slash(x, y, a, r, 0.24, light, true, {"rev": back})
		# (the follow-through: on past where the blow fell, round to his other side)
		later.append({"t": 0.05, "fn": func(): fx.slash(x, y, a + 1.55 * dir, r * 0.94, 0.2, light, false, {"rev": back, "faint": true})})
	# (white lines of wind off the blade's edge, along the way it went)
	var wind := PackedColorArray([P["white"], L.AIR[1]])
	for i in 12:
		var u := L.rnd(0.45, 1.0)
		var rr := r * L.rnd(0.85, 1.05)
		var at := a + (-1.25 + 2.5 * u) * dir
		var q := at + PI / 2.0 * dir
		var v := L.rnd(5, 9)
		_spark(x + cos(at) * rr, y + sin(at) * rr, 10.0 + L.rnd(-2, 3), cos(q) * v, sin(q) * v, 0.0, L.rnd(0.08, 0.14), wind, 0.0, L.rnd(5, 9))
	# (dust and grit kicked up where his feet bite the floor, and a ring of it)
	var grey := PackedColorArray([P["st6"], P["st5"], P["st4"]])
	for i in 12:
		var q := randf() * TAU
		var v := L.rnd(0.6, 1.8)
		_spark(x + cos(q) * 0.3, y + sin(q) * 0.3, 1.0, cos(q) * v, sin(q) * v, L.rnd(20, 60), L.rnd(0.25, 0.55), grey, 200.0)
	fx.ring(x, y, 0.9, 0.2, grey, false)
	fx.kick(1.4)
	var mid := a + (-1.25 + 2.5 * 0.6) * dir
	fx.glow(x + cos(mid) * r, y + sin(mid) * r, 60.0, 0.12, 40)
	swung = {"x": x, "y": y, "reach": r, "at": clock}
	return plain


## Something was hit at (x, y). If the hero swung a moment ago and it is in reach, the blow lands hard; if a heavy blow fell
## there a moment ago (the thrust's landing, a whirlwind's turn), it is struck hard. Either way what flies off is what the
## struck is made of. Says whether any did (wild.ts hit).
func hit(x: float, y: float) -> bool:
	if not swung.is_empty() and clock - float(swung["at"]) < 0.25 and Vector2(swung["x"] - x, swung["y"] - y).length() <= float(swung["reach"]) + 0.9:
		return _blow_hit(x, y, atan2(y - float(swung["y"]), x - float(swung["x"])))
	for s: Dictionary in slams:
		if Vector2(s["x"] - x, s["y"] - y).length() <= s["r"]:
			return _slam_hit(x, y, atan2(y - float(s["y"]), x - float(s["x"])), s["force"])
	return false


## A heavy blow of the blade lands: a white burst and a cut across the struck, what it is made of flung away from the blow,
## and a kick (wild.ts slamHit).
func _slam_hit(x: float, y: float, a: float, force: float) -> bool:
	var white: Color = L.P["white"]
	fx.flash(x, y, 14.0, 0.45 + 0.15 * force, 0.1, PackedColorArray([white, L.AIR[1], L.AIR[2], L.AIR[3]]))
	fx.slash(x, y, a + PI * 0.5, 0.4, 0.11, PackedColorArray([white, L.AIR[1], L.AIR[2]]), true)
	_debris(x, y, a, force)
	fx.kick(1.2 + force)
	fx.glow(x, y, 40.0, 0.1, 40)
	return true


## A blow of Strike lands: a white cut across what it struck, a white burst and ring, what it is made of flung on the way the
## blade went, the game holding still an instant, and the screen kicking (wild.ts blowHit).
func _blow_hit(x: float, y: float, a: float) -> bool:
	var white: Color = L.P["white"]
	# (the cut and the burst are white, not the blade's blue: what flies off a hit is the struck's)
	fx.flash(x, y, 14.0, 0.6, 0.11, PackedColorArray([white, L.AIR[1], L.AIR[2], L.AIR[3]]))
	var pale := PackedColorArray([white, L.AIR[1], L.AIR[2]])
	fx.slash(x, y, a + PI * 0.5, 0.42, 0.12, pale, true)
	fx.ring(x, y, 0.7, 0.14, pale, false)
	_debris(x, y, a, 1.4)
	fx.kick(2.2)
	fx.hold_for(0.045)
	fx.glow(x, y, 50.0, 0.12, 40)
	return true


## Over the sparks: the rings of wind going round a place, and the ring of the blade's light round him in his whirlwind:
## sweeps thin and faint at their tails and brightest at their heads, going round (wild.ts draw, its vortices).
func draw(c: CanvasItem) -> void:
	var white: Color = L.P["white"]
	for v: Dictionary in vortices:
		var cx: float = fx.gx(v["x"], v["y"])
		var cy: float = fx.gy(v["x"], v["y"]) - float(v["z"])
		var vr: float = v["r"]
		var vk: float = v["k"]
		var rx := vr * 22.6
		var ry := vr * 11.3
		var blade: bool = v["blade"]
		var sweeps := 2 if blade else 3
		var span := 2.1 if blade else 1.3
		var n := maxi(10, fx._round(span * vr * 16.0))
		for s in sweeps:
			var head: float = v["spin"] + float(s) / sweeps * TAU
			for i in n + 1:
				var u := float(i) / n
				var a := head - span * (1.0 - u)
				var px := floorf(cx + cos(a) * rx + 0.5)
				var py := floorf(cy + sin(a) * ry + 0.5)
				if blade:
					var col := Color(white if u > 0.86 else (L.BLADE[1] if u > 0.5 else L.BLADE[2]), vk * (0.25 + 0.75 * u))
					c.draw_rect(Rect2(px * 2.0, py * 2.0, 4.0, 4.0 if u > 0.6 else 2.0), col)
					# (thick at its head, as the Strike's crescent is)
					if u > 0.7:
						c.draw_rect(Rect2(px * 2.0, (py - 2.0) * 2.0, 4.0, 2.0), col)
				else:
					if i % 2 == 1 and u < 0.6:
						continue
					c.draw_rect(Rect2(px * 2.0, py * 2.0, 2.0, 2.0), Color(L.AIR[0] if u > 0.8 else (L.AIR[1] if u > 0.4 else L.AIR[2]), vk * (0.15 + 0.6 * u)))
