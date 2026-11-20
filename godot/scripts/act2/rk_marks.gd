## WHAT THE RAT KING (floor 12's boss) LAYS ON HIS CISTERN AND SENDS OVER IT: perils.gd's marks of kind "a1" named "ratking:" (marks.gd
## hands them here), stepped as his rules step them (game/act1_rules/ratking.ts ACTION peril, OLD peril for his words) and drawn as
## render/act1_fx/ratking.ts ACTION_FX draws them:
##   ratking:wedge   the bite's wedge before him, marked while the front rats are held reared, torn where the jaws snap.
##   ratking:aim     his stolen word's line, following the hero, then locked, its end ringed where it bursts; gone if he is stopped.
##   ratking:word    the word in flight (`a` how far, `b` which word, `d` 1 the action way's), bursting on whoever it meets or where
##                   it ends (`c` where): its harm that word's.
##   ratking:roll9   his roll's lane (`d` how far he runs), marked, run down, and the ring where he bursts open.
##   ratking:ring    the ring of rats bursting out round him as he comes apart.
##   ratking:swarm   the swarm streaming from where he came apart (x, y) to where he knots again (`a`, `b`).
##   ratking:sluice  his cistern's sluices opening (`a` half its length, `b` across, `c` 1 along y; `d` 1 while the hero is in the
##                   flood): the lanes marked, the gates, the flood; whoever it runs over struck, carried, struck again.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const RK := preload("res://scripts/act2/ratking.gd")
const RP := preload("res://scripts/act2/rk_paint.gd")
const Canvas := preload("res://scripts/act2/canvas.gd")
const MOVE_OF := {"ratking:wedge": "ratking:bite", "ratking:aim": "ratking:words"}


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _acting(src, id: String) -> bool:
	return src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and src.h2.act != null \
		and str(src.h2.acts()[src.h2.act["i"]]["id"]) == id


static func step(P, p: Dictionary, dt: float) -> bool:
	var hero = P.hero
	var t: float = p["t"]
	var n := str(p["a1"])
	var src = p.get("src")
	match n:
		"ratking:wedge", "ratking:aim":
			if not _acting(src, MOVE_OF[n]):
				p["dur"] = t
		"ratking:word":
			_word(P, p, dt)
		"ratking:sluice":
			_sluice(P, p, dt)
	return t < float(p["dur"])


## The word in flight (OLD peril, the action way's numbers): it bursts on the hero it meets, or where it ends.
static func _word(P, p: Dictionary, dt: float) -> void:
	if int(p["done"]) != 0:
		return
	var hero = P.hero
	var W: Dictionary = RK.WORDS9
	var t: float = p["t"]
	var a: float = p["a"]
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	var free: bool = A1.open_to(hero)
	var d0 := minf(a, (t - dt) * float(W["speed"]))
	var d1 := minf(a, t * float(W["speed"]))
	var steps := maxi(1, ceili((d1 - d0) / 0.2))
	for s in range(1, steps + 1):
		var d := d0 + (d1 - d0) * s / steps
		var q := at + f * d
		if hero.world.distance_to(q) <= float(W["r"]) and free:
			P._hurt(p, p["dmg"], q, str(p["el"]))
			_burst(p, d)
			return
	if d1 >= a:
		var q := at + f * a
		if hero.world.distance_to(q) <= float(W["burst"]) and free:
			P._hurt(p, p["dmg"], q, str(p["el"]))
		_burst(p, a)


static func _burst(p: Dictionary, d: float) -> void:
	p["done"] = 1
	p["c"] = d
	p["hit"] = p["t"]
	p["dur"] = float(p["t"]) + float(RK.WORDS9["burstFor"])


## THE SLUICES (ACTION peril): struck as its front passes; then carried with the water, struck again and again.
static func _sluice(P, p: Dictionary, dt: float) -> void:
	var hero = P.hero
	var C := RK.cistern_of_peril(p)
	var L := RK.lanes_for(C["across"])
	var c := RK.in_cistern(C, hero.world.x, hero.world.y)
	if not RK.flooded(c.x, c.y, float(p["t"]), C["half"], L):
		p["d"] = 0
		return
	if hero._act == "lunge" or not hero.alive:
		return
	var t: float = p["t"]
	if int(p["d"]) == 0:
		p["d"] = 1
		p["hit"] = t + float(RK.FLOOD["every"])
		if hero._invuln <= 0.0:
			P._hurt(p, p["dmg"], hero.world, "frost")
	elif t >= float(p["hit"]):
		p["hit"] = t + float(RK.FLOOD["every"])
		if hero._invuln <= 0.0:
			P._hurt(p, float(p["dmg"]) * 0.5, hero.world, "frost")
	var way := Vector2(0, 1) if C["alongY"] else Vector2(1, 0)
	hero._slide(way * float(RK.FLOOD["carry"]) * dt)


static func stands(_P, _p: Dictionary) -> void:
	pass


## A canvas round its floor point with room for floor points `offs` (tiles from it) and `pad` picture pixels about them, `up` more
## above: just what the game's own bigger canvas would hold of what is painted.
static func _box(offs: Array, pad: float, up: float) -> Object:
	var lo := Vector2(INF, INF)
	var hi := Vector2(-INF, -INF)
	for o in offs:
		var q := Vector2(32.0 * (o.x - o.y), 16.0 * (o.x + o.y))
		lo = lo.min(q)
		hi = hi.max(q)
	return Canvas.new(ceili(hi.x - lo.x + 2.0 * pad), ceili(hi.y - lo.y + 2.0 * pad + up), -lo.x + pad, -lo.y + pad + up)


## A picture painted here, kept with its mark under `key` and painted afresh as `k` changes.
static func _keep(p: Dictionary, key: String, k: int, paint: Callable) -> Dictionary:
	if k != int(p.get(key + "_k", -999999)):
		p[key + "_k"] = k
		p[key] = paint.call()
	return p.get(key, {})


static func _put(c: CanvasItem, pic: Dictionary, at: Vector2) -> void:
	if not pic.is_empty():
		c.draw_texture(pic["tex"], (Iso.to_screen(at.x, at.y) / 2.0).round() * 2.0 + pic["at"])


## On the floor, under the figures.
static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var src = p.get("src")
	var aim := atan2(float(p["fy"]), float(p["fx"]))
	match str(p["a1"]):
		"ratking:wedge":
			var pic := _keep(p, "fl", floori(t * 30.0), func():
				var px = RP.canvas(float(RK.BITE9["reach"]) + 0.5)
				RP.wedge(px, t, at, aim)
				return px.cut())
			_put(P, pic, at)
		"ratking:aim":
			if not _acting(src, "ratking:words"):
				return
			var o: Array = src.h2.word_from(src)
			var a: float = src.h2.act.get("a", 0.0)
			var end: Vector2 = o[0] + o[1] * a
			var pic := _keep(p, "fl", floori(t * 20.0), func():
				var px = _box([Vector2.ZERO, end - o[0]], 72.0, 0.0)
				RP.word_line(px, o[0], end, t)
				return px.cut())
			_put(P, pic, o[0])
		"ratking:roll9":
			if t > float(RK.ROLL9["stop"]) + 0.6:
				return
			var far := RK.roll9_along(RK.ROLL9["stop"])
			var f := Vector2(p["fx"], p["fy"])
			var R: float = RK.ROLL9["endR"]
			var pic := _keep(p, "fl", floori(t * 15.0), func():
				var n := Vector2(-f.y, f.x)
				var px = _box([f * -0.7 + n * 1.3, f * -0.7 - n * 1.3, f * (far + R) + n * R, f * (far + R) - n * R, f * far + n * R, f * far - n * R], 8.0, 0.0)
				RP.roll_lane(px, t, at, aim)
				return px.cut())
			_put(P, pic, at)
			if t >= float(RK.ROLL9["stop"]) and P.has_film("rk_ring"):
				P._film_floor("rk_ring", t - float(RK.ROLL9["stop"]), at + f * float(p["d"]))
		"ratking:ring":
			if P.has_film("rk_ring"):
				P._film_floor("rk_ring", t, at)
		"ratking:swarm":
			var b := Vector2(p["a"], p["b"])
			var pic := _keep(p, "fl", floori(t * 20.0), func():
				var R := at.distance_to(b) + 2.0
				var px = RP.canvas(R)
				RP.swarm(px, at, b, t)
				return px.cut())
			_put(P, pic, at)
		"ratking:sluice":
			RP.sluice(P, p)


## Over what stands: his word in flight, and where it bursts.
static func air(P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "ratking:word":
		return
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	var kind: String = RK.STOLEN[clampi(int(p["b"]), 0, 3)]
	if int(p["done"]) == 0:
		var end: Vector2 = at + f * float(p["a"])
		var pic := _keep(p, "air", floori(t * 30.0), func():
			var px = _box([Vector2.ZERO, end - at], 72.0, float(RK.WORDS["rise"]) + 30.0)
			RP.word(px, kind, at, float(RK.WORDS["rise"]), end, t)
			return px.cut())
		_put(c, pic, at)
		return
	var name := "rk_wb_" + kind
	if P.has_film(name):
		var q := at + f * float(p["c"])
		P._film_pic(c, name, "air", P._film_frame(name, t - float(p["hit"])), Iso.to_screen(q.x, q.y))


## Their lights in the dark: his word in flight, and its burst.
static func spots(P, p: Dictionary) -> void:
	if str(p["a1"]) != "ratking:word":
		return
	var W: Dictionary = RK.WORDS9
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	if int(p["done"]) == 0:
		var u := clampf(t * float(W["speed"]) / maxf(0.01, float(p["a"])), 0.0, 1.0)
		P.look.spot(P._px(at + f * float(p["a"]) * u) + Vector2(0, -float(RK.WORDS["rise"]) * (1.0 - u)), 22.0, 0.55)
		return
	var q := at + f * float(p["c"])
	P.look.spot(P._px(q) + Vector2(0, -3), 40.0, 0.6 * (1.0 - clampf((t - float(p["hit"])) / float(W["burstFor"]), 0.0, 1.0)))


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
