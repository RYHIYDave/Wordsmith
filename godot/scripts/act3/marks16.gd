## WHAT FLOOR 16'S OWN LAY ON THE FLOOR AND SEND OVER IT: perils.gd's marks of kind "a1" (marks.gd hands them here by the first word
## of their names), stepped as their rules step them and drawn as render/act1_fx/swan.ts, gardener.ts, groom.ts and pguard.ts draw
## them:
##   <kind>:warn     a blow's warning through its wind-up (act3/hc.gd warn: garden_warn.gd's strip or fan), read from the one acting
##                   each frame (where it stands, the way it faces, its act's own clock); gone with its act.
##   gardener:clip   the spray of cut grass where his lunge's blades snapped shut (the game's film gd_clip).
##   groom:horse     LOOSE THE HORSE: its line marked across the garden as he whistles (the quarry golem's lane, marks.gd _lane),
##                   broken up behind it; the horse galloping down it out of the mist and into it (gr_horse_<view>, gr_mist); a
##                   hero on its line where it comes struck once and knocked aside (game/act1_rules/groom.ts peril).
##   pguard:jav      the thrown partisan or javelin: in flight from his hand (pg_fly_<who>_<view>_<d>), sticking in the turf (a
##                   hero within 1.6 struck; the screen shaken), quivering and still (pg_stuck_<who>_<view>), the turf flung up
##                   round it (gd_clip); the partisan lies till he wrenches it out (act3/pguard.gd).
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const GW := preload("res://scripts/act3/garden_warn.gd")

## (art/action_f16_groom.ts LOOSE; game/act1_rules/groom.ts horseOn)
const LOOSE := {"aim": 0.3, "lane": 14.0, "half": 0.95, "pace": 11.0, "fade": 2.5, "body": 0.9, "knock": 0.8}
## (art/act1_figs/groom.ts HORSE_N, MIST_N: as the films have them)
## (art/action_f16_guard.ts JAV)
const JAV := {"r": 1.6, "quiver": 0.8}

static var _m6 = null


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _acting(src, id: String) -> bool:
	return src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and src.h2.act != null \
		and str(src.h2.acts()[src.h2.act["i"]]["id"]) == id


static func horse_gone(t: float) -> float:
	return maxf(0.0, t) * float(LOOSE["pace"])


static func horse_formed(t: float) -> float:
	return minf(clampf(t / 0.18, 0.0, 1.0), clampf((float(LOOSE["lane"]) - horse_gone(t)) / float(LOOSE["fade"]), 0.0, 1.0))


## (groom.ts horseOn) How far down its line the horse is, and how much of it there is, on a line `long` long.
static func horse_on(t: float, long: float) -> Vector2:
	var gone := horse_gone(t)
	var shift := float(LOOSE["lane"]) - long
	var formed := horse_formed((gone + shift) / float(LOOSE["pace"])) if gone > long - float(LOOSE["fade"]) else horse_formed(t)
	return Vector2(gone, formed)


static func step(P, p: Dictionary, _dt: float) -> bool:
	var t: float = p["t"]
	var src = p.get("src")
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		if not _acting(src, str(p["act_id"])):
			p["dur"] = t
	elif name == "groom:horse":
		_horse(P, p)
	elif name == "pguard:jav":
		_jav(P, p)
	return t < float(p["dur"])


## (groom.ts peril) THE HORSE comes by: a hero on its line within LOOSE.body of its middle struck once, and knocked aside.
static func _horse(P, p: Dictionary) -> void:
	var t: float = p["t"]
	if t < 0.0 or int(p["done"]) == 1:
		return
	var on := horse_on(t, float(p["a"]))
	if on.y <= 0.3 or on.x > float(p["a"]):
		return
	var hero = P.hero
	var r := A1.from_figure(Vector2(p["x"], p["y"]), Vector2(p["fx"], p["fy"]), 1, hero.world)
	if absf(r.y) > float(LOOSE["half"]) or absf(r.x - on.x) > float(LOOSE["body"]) or not A1.open_to(hero):
		return
	p["done"] = 1
	var f := Vector2(p["fx"], p["fy"])
	var at := Vector2(p["x"], p["y"])
	P._hurt(p, p["dmg"], at + f * on.x)
	A1.knock(hero, at + f * (on.x - 1.0), float(LOOSE["knock"]))


## (pguard.ts peril) IT STICKS, a burst of turf round it: whoever is within it struck.
static func _jav(P, p: Dictionary) -> void:
	var t: float = p["t"]
	if int(p["done"]) == 1 or t < float(p["hit"]):
		return
	p["done"] = 1
	var hero = P.hero
	if hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(JAV["r"]) and A1.open_to(hero):
		P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]))
	hero.kick(2.0)
	P.sfx.play("slam", linear_to_db(0.4))


static func _view(f: Vector2) -> String:
	return "back" if f.x + f.y < -0.2 else "front"


static func _flip(f: Vector2) -> bool:
	return f.x - f.y < 0.0


static func _hide(p: Dictionary, key: String) -> void:
	var s = p.get(key)
	if s != null and is_instance_valid(s):
		s.visible = false


## Among the figures: the cut grass in the air, the horse and its mist, the partisan in flight and stuck.
static func stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var at := Vector2(p["x"], p["y"])
	match str(p["a1"]):
		"gardener:clip":
			for side in ["behind", "before"]:
				var name: String = "gd_clip_" + side
				if P.has_film(name):
					P._film_one(p, "fx_" + side, P._still(name, "stand", floori(t * 30.0)), at, at.x + at.y + (0.05 if side == "before" else -0.05), false)
		"groom:horse":
			if t < 0.0:
				for k in ["fx_horse", "fx_mist", "fx_mist2"]:
					_hide(p, k)
				return
			var long: float = p["a"]
			var on := horse_on(t, long)
			var f := Vector2(p["fx"], p["fy"])
			var mi := floori(t * 30.0)
			if P.has_film("gr_mist") and P._still("gr_mist", "stand", mi) >= 0:
				P._film_one(p, "fx_mist", P._still("gr_mist", "stand", mi), at, at.x + at.y, false)
			else:
				_hide(p, "fx_mist")
			var end_t := (long - float(LOOSE["fade"]) * 0.6) / float(LOOSE["pace"])
			var ei := floori((t - end_t) * 30.0)
			var e := at + f * long
			if ei >= 0 and P.has_film("gr_mist") and P._still("gr_mist", "stand", ei) >= 0:
				P._film_one(p, "fx_mist2", P._still("gr_mist", "stand", ei), e, e.x + e.y, false)
			else:
				_hide(p, "fx_mist2")
			if on.x > long or on.y <= 0.0:
				_hide(p, "fx_horse")
				return
			var shift := float(LOOSE["lane"]) - long
			var tf := (on.x + shift) / float(LOOSE["pace"]) if on.x > long - float(LOOSE["fade"]) else t
			var name: String = "gr_horse_" + _view(f)
			if not P.has_film(name):
				return
			var n: int = P._fx["films"][name]["n"]
			var w := at + f * on.x
			P._film_one(p, "fx_horse", P._still(name, "stand", clampi(floori(tf * 30.0), 0, n - 1)), w, w.x + w.y, _flip(f))
		"pguard:jav":
			var who := "partisan" if int(p["b"]) == 0 else "sword"
			var f := Vector2(p["fx"], p["fy"])
			var view := _view(f)
			var flip := _flip(f)
			if t < float(p["hit"]):
				# IN FLIGHT, from his hand to where it sticks (its height in its picture)
				var d := clampi(roundi(float(p["c"])), 1, 8)
				var name := "pg_fly_%s_%s_%d" % [who, view, d]
				_hide(p, "fx_stuck")
				if P.has_film(name):
					var n: int = P._fx["films"][name]["n"]
					var k := clampi(floori(t / float(p["hit"]) * n), 0, n - 1)
					# (how far along its line it is: javAt, the table pg_along_<who>_<d>, its height in its picture)
					var along: Array = P._fx["tables"].get("pg_along_%s_%d" % [who, d], [])
					var j: float = float(along[k]) * float(p["c"]) / float(d) if k < along.size() else float(p["c"]) * float(k) / maxf(1.0, n - 1)
					var x := at - f * (float(p["c"]) - j)
					P._film_one(p, "fx_fly", P._still(name, "stand", k), x, x.x + x.y, flip)
				return
			_hide(p, "fx_fly")
			var u := t - float(p["hit"])
			var sname := "pg_stuck_%s_%s" % [who, view]
			if P.has_film(sname):
				var n2: int = P._fx["films"][sname]["n"]
				P._film_one(p, "fx_stuck", P._still(sname, "stand", mini(floori(minf(u, float(JAV["quiver"]) + 0.05) * 30.0), n2 - 1)), at, at.x + at.y, flip)
			for side in ["behind", "before"]:
				var cn: String = "pg_clip_" + side
				if u < 1.5 and P.has_film(cn):
					P._film_one(p, "fx_turf_" + side, P._still(cn, "stand", floori(u * 30.0)), at, at.x + at.y + (0.05 if side == "before" else -0.05), false)
				else:
					_hide(p, "fx_turf_" + side)


## On the floor, under the figures: the warnings, the horse's line, the turf flung up.
static func draw(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		var src = p.get("src")
		if not _acting(src, str(p["act_id"])):
			return
		var T: float = src.h2.act["t"]
		var k := GW.warn_k(T, float(p["w0"]), float(p["hit"]))
		if k < 0.0:
			return
		var hand: int = src.h2.act["hand"]
		for s in p["strips"]:
			GW.strip(P, src.world, src.face, hand, s[0], s[1], s[2], s[3], k, P._clock)
		for fa in p["fans"]:
			if p.get("on_hero", false):
				GW.fan(P, P.hero.world, Vector2(1, 0), 1, fa[0], fa[1], fa[2], k, P._clock)
			else:
				GW.fan(P, src.world, src.face, hand, fa[0], fa[1], fa[2], k, P._clock)
		return
	match name:
		"groom:horse":
			# THE LINE on the floor: laid out as he whistles, broken up behind the horse
			if _m6 == null:
				_m6 = load("res://scripts/act1/marks.gd")
			var long: float = p["a"]
			var k := minf(1.0, (t + 0.53) / 0.3)
			var gone := maxf(0.0, horse_on(t, long).x - 0.8) if t > 0.0 else 0.0
			if t > 0.0 and horse_on(t, long).x > long + 0.5:
				return
			_m6._dots(P, Vector2(p["x"], p["y"]), _m6._lane(Vector2(p["fx"], p["fy"]), k, gone, long, float(LOOSE["half"])))
		"pguard:jav":
			var u := t - float(p["hit"])
			if u >= 0.0 and P.has_film("pg_turf"):
				P._film_pic(P, "pg_turf", "floor", floori(minf(u, 1.85) * 30.0), Iso.to_screen(p["x"], p["y"]), false)


static func air(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
