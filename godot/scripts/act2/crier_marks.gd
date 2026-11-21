## WHAT THE CRIER (floor 11's boss) LAYS ON HIS SQUARE: perils.gd's marks of kind "a1" named "crier:" (marks.gd hands them here),
## stepped as his rules step them (game/act1_rules/crier.ts ACTION peril) and drawn as render/act1_fx/crier.ts ACTION_FX draws them:
##   crier:toll    a toll's mark where the hero stood as it was rung, counting down, and its burst (`hit` after): struck within
##                 TOLL.r (the game's painter, paintToll: the film cr_toll).
##   crier:shout9  the shout off the walls (`a`, `b`, `c`, `d` the far, back, left and right walls from him; `hand`): its warning, the
##                 wave and its echoes, the floor dark where they have passed; each front that passes over the hero strikes him once
##                 and hushes him (`done`, by bits).
##   crier:decree  the decree down its lane (`d` its length): the lane marked as he holds it high, the roll flung down it; its roll
##                 striking once as it passes, then the floor taken away while its letters burn (`b`: when it may strike again).
##   crier:call9   his call: the pools welling up at the edges of his square (`pools`, kept with it), the rings rolling out from
##                 him; out of each pool two of the Hushed, so many as he may call (`a`).
## Each but the toll gone if he is stopped before its blow.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const CR := preload("res://scripts/act2/crier.gd")
const CP := preload("res://scripts/act2/crier_paint.gd")
const MK := preload("res://scripts/act2/marks11.gd")
## (the word over him as the Hush takes his words: game.ts emit 'text' "Hushed", #9890b4)
const HUSHED := Color("#9890b4")
const MOVE_OF := {"crier:shout9": "crier:shout", "crier:decree": "crier:proclaim", "crier:call9": "crier:crowd"}


static func gone(_P, _p: Dictionary) -> void:
	pass


static func step(P, p: Dictionary, dt: float) -> bool:
	var hero = P.hero
	var t: float = p["t"]
	var n := str(p["a1"])
	var src = p.get("src")
	var free: bool = A1.open_to(hero)
	# (each but the toll gone if he is stopped before its blow)
	if t < float(p["hit"]) and n != "crier:toll":
		if src == null or not is_instance_valid(src) or src.dead or src.state != "act" or src.h2 == null or src.h2.act == null \
				or str(src.h2.acts()[src.h2.act["i"]]["id"]) != MOVE_OF.get(n, ""):
			p["dur"] = t
		return true
	match n:
		"crier:toll":
			if int(p["done"]) != 0 or t < float(p["hit"]):
				return true
			p["done"] = 1
			if free and hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(CR.TOLL["r"]) + A1.HERO_R * 0.5:
				P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]))
			P.sfx.play("thunder", linear_to_db(0.3))
		"crier:shout9":
			var s := t - float(p["hit"])
			var w := {"far": float(p["a"]), "back": float(p["b"]), "left": float(p["c"]), "right": float(p["d"])}
			var r: Vector2 = A1.from_figure(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), int(p["hand"]), hero.world)
			var F := CR.fronts_at(s, w)
			var B := float(CR.WALLS["band"]) + A1.HERO_R * 0.5
			var hits := [
				F["wave"] != null and r.x > 0.0 and absf(r.length() - float(F["wave"])) <= B and r.x <= w["far"] and absf(r.y) <= maxf(w["left"], w["right"]),
				F["far"] != null and absf(r.x - float(F["far"])) <= B,
				F["left"] != null and r.y > 0.0 and absf(r.y - float(F["left"])) <= B,
				F["right"] != null and r.y < 0.0 and absf(-r.y - float(F["right"])) <= B,
			]
			for k in 4:
				if not hits[k] or not free or int(p["done"]) & (1 << k):
					continue
				p["done"] = int(p["done"]) | (1 << k)
				P._hurt(p, p["dmg"], hero.world)
				if hero.hush_t <= 0.0 and src != null and is_instance_valid(src):
					A1.word(src, hero, "Hushed", HUSHED)
				hero.hush()
		"crier:decree":
			var s := t - float(p["hit"])
			var D: Dictionary = CR.DECREE
			if s >= float(D["lands"]) and s - dt < float(D["lands"]):
				P.sfx.play("slam", linear_to_db(0.3))
			if not free:
				return true
			var r: Vector2 = A1.from_figure(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), 1, hero.world)
			if int(p["done"]) == 0:
				# (its roll, racing out down the lane: whoever it passes over, struck, once)
				var d1 = CR.decree_front(s, float(p["d"]))
				var d0 = CR.decree_front(s - dt, float(p["d"]))
				var near: float = d0 if d0 != null else float(D["from"])
				if d1 != null and absf(r.y) <= float(D["half"]) + 0.15 and r.x >= near - 0.35 and r.x <= float(d1) + 0.2:
					p["done"] = 1
					p["b"] = t + float(D["every"])
					P._hurt(p, p["dmg"], hero.world)
					return true
				if s >= float(D["unrolled"]):
					p["done"] = 1
			# (THE FLOOR TAKEN AWAY while its letters burn)
			if t >= float(p["b"]) and CR.decree_burns(s, r.x, r.y, float(p["d"])):
				p["b"] = t + float(D["every"])
				P._hurt(p, float(p["dmg"]) * 0.4, hero.world)
		"crier:call9":
			# (out of each pool the Hushed come, two a pool, so many as he may call)
			var pools: Array = p.get("pools", [])
			var s := t - float(p["hit"])
			var each: int = CR.CALL["each"]
			for i in pools.size():
				for k in each:
					var bit := 1 << (i * each + k)
					if int(p["done"]) & bit or s < CR.comes_out(i, k) + float(CR.CALL["out"]):
						continue
					p["done"] = int(p["done"]) | bit
					var q: Vector2 = pools[i]
					if i * each + k >= int(p["a"]) or src == null or not is_instance_valid(src) or not src.mgr.clear(q.x, q.y, 0.3):
						continue
					var o = src.mgr.call_up("hushed", q, int(p["pack"]), hero.world - q)
					if o != null:
						o.set_meta("crier_called", true)
	return t < float(p["dur"])


static func stands(P, p: Dictionary) -> void:
	if str(p["a1"]) != "crier:decree":
		return
	# (the roll in the air, flung down from his hand)
	var t: float = p["t"]
	var s := t - CR.PROCLAIM_HIT
	var k := floori(t * 30.0) if (s >= 0.0 and s < float(CR.DECREE["lands"])) else -1
	if k == int(p.get("air_k", -2)):
		return
	p["air_k"] = k
	var pic: Dictionary = CP.decree_air(t, atan2(float(p["fy"]), float(p["fx"]))) if k >= 0 else {}
	var at := Vector2(p["x"], p["y"])
	MK._live_one(P, p, "fx_stand", pic, at, at.x + at.y + 0.5)


## On the floor, under the figures.
static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	var base := (Iso.to_screen(at.x, at.y) / 2.0).round() * 2.0
	match str(p["a1"]):
		"crier:toll":
			if P.has_film("cr_toll"):
				P._film_floor("cr_toll", t, at)
		"crier:shout9":
			CP.draw_shout(P, p, t)
		"crier:decree":
			var s := t - CR.PROCLAIM_HIT
			if s >= float(CR.DECREE["lands"]):
				CP.draw_decree(P, p, s)
				return
			# (the lane marked as he holds it high: 15 a second)
			var k := floori(t * 15.0)
			if k != int(p.get("fl_k", -2)):
				p["fl_k"] = k
				var aim := atan2(float(p["fy"]), float(p["fx"]))
				var px = CP.decree_canvas(aim, float(p["d"]))
				CP.decree_warning(px, t, aim, float(p["d"]))
				p["fl"] = px.cut()
			_put(P, p.get("fl", {}), base)
		"crier:call9":
			var pools: Array = p.get("pools", [])
			if pools.is_empty():
				return
			# (the pools and the rings: 8 a second)
			var k := floori(t * 8.0)
			if k != int(p.get("fl_k", -2)):
				p["fl_k"] = k
				var offs: Array = []
				var R := 0.0
				for q in pools:
					offs.append(q - at)
					R = maxf(R, q.distance_to(at))
				var px = CP.call_canvas(R + 2.0)
				CP.paint_call(px, t, offs)
				p["fl"] = px.cut()
			_put(P, p.get("fl", {}), base)


static func _put(P, pic: Dictionary, base: Vector2) -> void:
	if not pic.is_empty():
		P.draw_texture(pic["tex"], base + pic["at"])


static func air(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


## Their lights in the dark: the decree burning.
static func spots(P, p: Dictionary) -> void:
	if str(p["a1"]) != "crier:decree":
		return
	var s := float(p["t"]) - CR.PROCLAIM_HIT
	if s < float(CR.DECREE["lands"]) or s >= float(CR.DECREE["gone"]):
		return
	var D: Dictionary = CR.DECREE
	var to: float = p["d"]
	var unrolled := minf(to, float(D["from"]) + (to - float(D["from"])) * minf(1.0, (s - float(D["lands"])) / (float(D["unrolled"]) - float(D["lands"]))))
	var crumble := 0.0 if s < float(D["out"]) else minf(1.0, (s - float(D["out"])) / (float(D["gone"]) - float(D["out"])))
	var mid := A1.beside(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), 1, (float(D["from"]) + unrolled) / 2.0, 0.0)
	P.look.spot(P._px(mid), 40.0, 0.35 * (1.0 - crumble))


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
