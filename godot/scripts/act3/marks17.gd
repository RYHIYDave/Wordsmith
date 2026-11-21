## WHAT FLOOR 17'S OWN LAY ON THE FLOOR AND SEND OVER IT (the Masque: render/act1_fx/dancer.ts, footman.ts, order.ts, prince.ts), as their
## rules step them (game/act1_rules/footman.ts, order.ts, prince.ts peril). Their warnings, `<kind>:warn`, are act3/marks16.gd's.
##   footman:show   beside him through his act: his tray in flight from as it leaves his hand to as he catches it, along its loop
##                  (ft_tray_<view>, turned as he is); his candelabrum's fire fan from its blow (ft_fire_<view>).
##   order:show     the grey wave from the palm's blow (od_wave_<view>), just behind him.
##   order:knife    the curved knife in flight and lying where it fell (od_knife_<view>): the hero within 0.6 of it in flight struck,
##                  once a throw.
##   prince:mask    a smiling mask flung spinning along its way (pc_mask, by its spin; its place and height, fx.json pc_masks): the
##                  hero where it passes him struck, once.
##   prince:dance   the ring of masked partners round where the hero stood (pc_dance), its closing circle marked; snapping shut:
##                  the hero still within 2.5 tiles caught.
##   prince:chime   Midnight's rings rolling out from the clock: a dark crimson band (the Black Room's red, never pink) with a crest
##                  of gilt light, its gap left open; one rolling over him outside its gap strikes him, once.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const M16 := preload("res://scripts/act3/marks16.gd")
const GW := preload("res://scripts/act3/garden_warn.gd")
const FT := preload("res://scripts/act3/footman.gd")
const OD := preload("res://scripts/act3/order.gd")
const PC := preload("res://scripts/act3/prince.gd")

const RED := Color("#5a0e12")
const GILT := Color("#e0b860")


static func gone(_P, _p: Dictionary) -> void:
	pass


## How near `p` comes to the way from `a` to `b` (what flies fast is checked along its way between frames, that none slips past him).
static func seg_dist(p: Vector2, a: Vector2, b: Vector2) -> float:
	var d := b - a
	var l2 := d.length_squared()
	if l2 < 1e-9:
		return p.distance_to(a)
	return p.distance_to(a + d * clampf((p - a).dot(d) / l2, 0.0, 1.0))


static func _alive(src) -> bool:
	return src != null and is_instance_valid(src) and not src.dead


static func _view(f: Vector2) -> String:
	return "back" if f.x + f.y < -0.2 else "front"


static func _flip(f: Vector2) -> bool:
	return f.x - f.y < 0.0


static func _hide(p: Dictionary, key: String) -> void:
	var s = p.get(key)
	if s != null and is_instance_valid(s):
		s.visible = false


## A mask of the Prince's fan, `t` seconds after it left his hand: [where on the floor, game pixels up, its spin].
static func mask_where(P, p: Dictionary, t: float) -> Array:
	var tab: Array = P._fx["tables"].get("pc_masks", [])
	var i: int = int(p["a"])
	if i >= tab.size():
		return [Vector2(p["x"], p["y"]), 0.0, 0.0]
	var row: Array = tab[i]
	var f: Array = row[clampi(roundi(t * 30.0), 0, row.size() - 1)]
	var fw := Vector2(p["fx"], p["fy"])
	return [Vector2(p["x"], p["y"]) + fw * float(f[0]) + Vector2(fw.y, -fw.x) * float(f[1]), float(f[2]), float(f[3])]


## The knife of a throw, `t` seconds after it left the hand: [where, flying].
static func knife_where(P, p: Dictionary, t: float) -> Array:
	var tab: Array = P._fx["tables"].get("od_knife", [])
	if tab.is_empty():
		return [Vector2(p["x"], p["y"]), false]
	var k: Array = tab[clampi(roundi(t * 30.0), 0, tab.size() - 1)]
	return [Vector2(p["x"], p["y"]) + Vector2(p["fx"], p["fy"]) * float(k[0]), int(k[1]) == 1]


static func step(P, p: Dictionary, dt: float) -> bool:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		return M16.step(P, p, dt)
	var t: float = p["t"]
	var src = p.get("src")
	var hero = P.hero
	match name:
		"footman:show", "order:show":
			if not _alive(src) or src.state != "act" or src.h2 == null or not is_same(src.h2.act, p["act"]):
				p["dur"] = t
		"order:knife":
			if int(p["done"]) == 0:
				# (the knife in flight: where it passes him, it strikes, once)
				var k := knife_where(P, p, t)
				var k0 := knife_where(P, p, maxf(0.0, t - dt))
				if k[1] and hero.alive and seg_dist(hero.world, k0[0], k[0]) <= float(OD.KNIFE["hit"]) and A1.open_to(hero):
					# (the knives of one throw strike him once at most: the others of it are spent too)
					for q in P.list:
						if str(q.get("a1", "")) == "order:knife" and int(q.get("c", -1)) == int(p["c"]):
							q["done"] = 1
					P._hurt(p, p["dmg"], k[0])
		"prince:mask":
			if int(p["done"]) == 0 and t <= float(PC.MASKS["flight"]):
				var w := mask_where(P, p, t)
				var w0 := mask_where(P, p, maxf(0.0, t - dt))
				if hero.alive and seg_dist(hero.world, w0[0], w[0]) <= float(PC.MASKS["hit_r"]) and A1.open_to(hero):
					p["done"] = 1
					P._hurt(p, p["dmg"], w[0])
		"prince:dance":
			if int(p["done"]) == 0 and t >= float(PC.DANCE["snap"]):
				p["done"] = 1
				if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(PC.DANCE["caught"]) and A1.open_to(hero):
					P._hurt(p, p["dmg"], Vector2(p["x"], p["y"]))
		"prince:chime":
			var u: float = t - float(p["d"])
			if u >= 0.0:
				# (each chime the clock's bell sounds as its ring sets off)
				if u - dt < 0.0 and int(p["a"]) > 0:
					P.sfx.play("echo", linear_to_db(0.6))
				if int(p["done"]) == 0 and hero.alive:
					var r: float = float(PC.CHIME["speed"][int(p["b"])]) * u
					var d: float = hero.world.distance_to(Vector2(p["x"], p["y"]))
					if absf(d - r) <= float(PC.CHIME["band"]) / 2.0 + float(PC.CHIME["hit"]) and not PC.chime_gap(p, hero.world, r) and A1.open_to(hero):
						p["done"] = 1
						P._hurt(p, p["dmg"], hero.world)
	return t < float(p["dur"])


static func stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	var src = p.get("src")
	match str(p["a1"]):
		"footman:show":
			if not _alive(src) or src.h2 == null or not is_same(src.h2.act, p["act"]):
				_hide(p, "fx_stand")
				return
			var T: float = src.h2.act["t"]
			var id := str(src.h2.acts()[src.h2.act["i"]]["id"])
			var f: Vector2 = src.face
			var name := ""
			var k := -1
			if id == "footman:tray" and T >= float(FT.THROW["hit"]) and T < float(FT.THROW["catch"]):
				name = "ft_tray_" + _view(f)
				k = floori((T - float(FT.THROW["hit"])) * 30.0)
			elif id == "footman:fire" and T >= float(FT.SWING["hit"]):
				name = "ft_fire_" + _view(f)
				k = floori((T - float(FT.SWING["hit"])) * 30.0)
			if name == "" or not P.has_film(name) or k >= int(P._fx["films"][name]["n"]):
				_hide(p, "fx_stand")
				return
			P._film_one(p, "fx_stand", P._still(name, "stand", mini(k, int(P._fx["films"][name]["n"]) - 1)), src.world, src.world.x + src.world.y + 0.05, _flip(f))
		"order:show":
			if not _alive(src) or src.h2 == null or not is_same(src.h2.act, p["act"]):
				_hide(p, "fx_stand")
				return
			var T: float = src.h2.act["t"]
			var f: Vector2 = src.face
			var name := "od_wave_" + _view(f)
			var k := floori((T - float(OD.PALM["hit"])) * 30.0)
			if T < float(OD.PALM["hit"]) or not P.has_film(name) or k >= int(P._fx["films"][name]["n"]):
				_hide(p, "fx_stand")
				return
			P._film_one(p, "fx_stand", P._still(name, "stand", k), src.world, src.world.x + src.world.y - 0.3, _flip(f))
		"order:knife":
			var f := Vector2(p["fx"], p["fy"])
			var name := "od_knife_" + _view(f)
			if not P.has_film(name):
				return
			var k := knife_where(P, p, t)
			var w: Vector2 = k[0]
			P._film_one(p, "fx_stand", P._still(name, "stand", mini(floori(t * 30.0), 30)), w, w.x + w.y + 0.02, _flip(f))
		"prince:mask":
			if t >= float(PC.MASKS["flight"]) or not P.has_film("pc_mask"):
				_hide(p, "fx_stand")
				return
			var m := mask_where(P, p, t)
			var w: Vector2 = m[0]
			var k := posmod(floori(fposmod(float(m[2]) / TAU, 1.0) * 12.0), 12)
			P._film_one(p, "fx_stand", P._still("pc_mask", "stand", k), w, w.x + w.y, false, roundf(float(m[1])))
		"prince:dance":
			var k := floori(t * 15.0)
			if not P.has_film("pc_dance") or k >= int(P._fx["films"]["pc_dance"]["n"]):
				_hide(p, "fx_stand")
				return
			var at := Vector2(p["x"], p["y"])
			P._film_one(p, "fx_stand", P._still("pc_dance", "stand", k), at, at.x + at.y, false)


static func draw(P, p: Dictionary) -> void:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		M16.draw(P, p)
		return
	var t: float = p["t"]
	match name:
		"prince:dance":
			# (its closing circle marked, from as the partners close in to the snap)
			if t < float(PC.DANCE["snap"]):
				var k := GW.warn_k(t, PC.DANCE["close"], PC.DANCE["snap"])
				if k >= 0.0:
					GW.fan(P, Vector2(p["x"], p["y"]), Vector2(1, 0), 1, -PI, PI, PC.DANCE["caught"], k, P._clock)
		"prince:chime":
			_chime(P, p)


## MIDNIGHT'S RING: a dark crimson band, in runs between its gap, its crest gilt.
static func _chime(c: CanvasItem, p: Dictionary) -> void:
	var u: float = float(p["t"]) - float(p["d"])
	if u < 0.0:
		return
	var reach: float = PC.CHIME["reach"]
	var r: float = float(PC.CHIME["speed"][int(p["b"])]) * u
	if r > reach:
		return
	var band: float = PC.CHIME["band"]
	var thin := 1.0 - (r - reach * 0.85) / (reach * 0.15) if r > reach * 0.85 else 1.0
	var o := Vector2(p["x"], p["y"])
	var steps := maxi(24, ceili(r * 6.0))
	var runs: Array = []
	var run: Array = []
	for i in steps + 1:
		var a := float(i) / steps * TAU
		var d := Vector2(cos(a), sin(a))
		if PC.chime_gap(p, o + d * r, r):
			if run.size() > 1:
				runs.append(run)
			run = []
			continue
		run.append(d)
	if run.size() > 1:
		runs.append(run)
	for q in runs:
		var outer := PackedVector2Array()
		var poly := PackedVector2Array()
		for d in q:
			var s := Iso.to_screen(o.x + d.x * (r + band / 2.0), o.y + d.y * (r + band / 2.0))
			outer.append(s)
			poly.append(s)
		for i in range(q.size() - 1, -1, -1):
			var d: Vector2 = q[i]
			var ri := maxf(0.0, r - band / 2.0)
			poly.append(Iso.to_screen(o.x + d.x * ri, o.y + d.y * ri))
		if poly.size() >= 3:
			c.draw_colored_polygon(poly, Color(RED, 0.5 * thin * (0.6 if int(p["done"]) == 1 else 1.0)))
		c.draw_polyline(outer, Color(GILT, 0.85 * thin), 2.0)


static func air(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
