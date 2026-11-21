## WHAT FLOOR 20'S BOSS, THE MOTH MADE GHOSTLY, LAYS OVER THE TOP AND SENDS ACROSS IT (render/act1_fx/moth.ts), as her rules step them
## (game/act1_rules/moth.ts peril; act3/moth.gd), drawn by act3/moth_paint.gd (art/moth2_fx.ts, every dot the game's). Her warnings,
## `moth:warn` (the ghost wing's cone, the Hush's round, the Unwriting's whole top), are act3/marks16.gd's.
##   moth:show      through her wind-up: ECLIPSE's moon rising and her shadow thrown out toward him, its eyes opening, its edge the
##                  enemy's pink; her PHANTOMS' three lanes marked, and copies of her shimmering off her (over the dark); the chapter's
##                  pages tearing loose as she rears on the book (over the dark).
##   moth:gust      THE GHOST WING sweeping the cone before her.
##   moth:eclipse   her shadow striking: black, its eyes burning, darkness rising out of it, gone up in motes; the moon setting.
##   moth:phantoms  the three phantoms gliding down their lanes (over the dark), each lane marked till it sets off.
##   moth:dust, moth:shed  THE HUSH: its scales falling like slow snow (over the dark); settled, its haze and its letters going dark
##                  (kept to the top). Where what she sheds over him will fall, marked a second before.
##   moth:wave      THE UNWRITING: the ring of burning pages wheeling out over the whole top (over the dark), its band on the stones.
##   moth:book      THE LAST CHAPTER on the stones, from the moment it fell, under her, its pages lifting in the wind of her wings (the
##                  game's own pictures: mo_book_*, tools/godot_fx.ts).
##   moth:words     HER DEATH: every word she swallowed flying home; the light she comes apart into (over the dark), its lights.
## Each is painted afresh every frame as the game paints it (its lights given to the dark as it is), and drawn on its layer. Her
## rules for what strikes him: here too (`step`).
extends RefCounted

const M16 := preload("res://scripts/act3/marks16.gd")
const GW := preload("res://scripts/act3/garden_warn.gd")
const MP := preload("res://scripts/act3/moth_paint.gd")
const MO := preload("res://scripts/act3/moth.gd")
const Iso := preload("res://scripts/iso.gd")


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _acting(src, p: Dictionary) -> bool:
	return src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and src.h2.act != null and is_same(src.h2.act, p["act"])


static func _D() -> Dictionary:
	return MP.data()


# --- what strikes him (game/act1_rules/moth.ts peril) ---

static func step(P, p: Dictionary, dt: float) -> bool:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		return M16.step(P, p, dt)
	var t: float = p["t"]
	var hero = P.hero
	if name == "moth:show":
		if not _acting(p.get("src"), p):
			p["dur"] = t
		return t < float(p["dur"])
	if int(p["done"]) != 0 or hero == null or not hero.alive:
		return t < float(p["dur"])
	var at := Vector2(p["x"], p["y"])
	match name:
		"moth:dust", "moth:shed":
			# (once its scales have fallen: the haze of the Hush, his words dark in it, biting now and then)
			var L: float = _D()["cloudLong"]
			if t < 1.4 or t > L - float(_D()["cloudFx"]["fade"]) * 0.5:
				pass
			elif hero.world.distance_to(at) <= float(_D()["cloud"]["tiles"]) / 2.0:
				hero.hush(float(MO.T("dust")["hush"]))
				p["d"] = float(p["d"]) - dt
				if float(p["d"]) <= 0.0:
					p["d"] = MO.T("dust")["every"]
					P._hurt(p, float(p["dmg"]), hero.world)
		"moth:phantoms":
			# (each phantom strikes him once, as its body passes over him; rolling, not)
			if hero._act != "lunge":
				for i in int(_D()["phantoms"]["n"]):
					var bit := 1 << i
					if (int(p["a"]) & bit) != 0:
						continue
					if MP.phantom_over(at.x, at.y, float(p["fx"]), float(p["fy"]), i, t, hero.world.x, hero.world.y):
						p["a"] = int(p["a"]) | bit
						P._hurt(p, float(p["dmg"]), hero.world)
		"moth:wave":
			# (the Unwriting's ring rolling out over the whole top: it strikes him as it passes under him, once)
			if t <= float(_D()["waveFx"]["reach"]) + 0.1 and hero._act != "lunge":
				if absf(hero.world.distance_to(at) - MO.wave_at(t)) <= float(MO.T("beat")["wide"]):
					p["done"] = 1
					P._hurt(p, float(p["dmg"]), hero.world)
	return t < float(p["dur"])


# --- what it looks like (render/act1_fx/moth.ts ground, standing, air, glow), painted afresh each frame ---

## A point of the floor on the screen, game pixels.
static func _at(x: float, y: float) -> Array:
	var s := Iso.to_screen(x, y)
	return [s.x / 2.0, s.y / 2.0]


## Where the top is on the screen (what lies on the floor is kept to it, not over the drop: onTheTop): [middle x, y, half width,
## half height], game pixels.
static func _top(P) -> Array:
	if P.map == null or P.map.land == null or P.map.land.get("tower") == null:
		return []
	var T: Dictionary = P.map.land["tower"]["top"]
	var c := _at(T["cx"], T["cy"])
	var r: float = float(T["r"]) + 0.25
	return [c[0], c[1], r * 16.0 * sqrt(2.0), r * 8.0 * sqrt(2.0)]


static func _clipped(P) -> MP.Pen:
	var g := MP.Pen.new()
	g.clip = _top(P)
	return g


## This frame's lights, and every layer's dots laid: called each frame as the marks' lights are (perils.gd _spots_of).
static func spots(P, p: Dictionary) -> void:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		return
	var at := func(x: float, y: float) -> Array: return _at(x, y)
	var spot := func(x: float, y: float, r: float, a: float) -> void:
		if P.look != null:
			P.look.spot(Vector2(x, y), r, a)
	var clock: float = P._clock
	var t: float = p["t"]
	var x: float = p["x"]
	var y: float = p["y"]
	var floor_pen := MP.Pen.new()
	var air_pen: MP.Pen = null
	var glow_pen: MP.Pen = null
	var top: MP.Pen = null
	var hush_r: float = float(_D()["cloud"]["tiles"]) / 2.0
	match name:
		"moth:show":
			var src = p.get("src")
			if _acting(src, p):
				var a: Dictionary = src.h2.act
				var at_t: float = a["t"]
				var ax: float = p["ax"]
				var ay: float = p["ay"]
				var mx: float = src.world.x
				var my: float = src.world.y
				match str(p["act_id"]):
					"moth:eyes":
						if at_t < float(_D()["eclipse"]["hit"]):
							top = _clipped(P)
							_eclipse(P, floor_pen, top, at, mx, my, ax, ay, at_t, clock, spot)
					"moth:swarm":
						var hit: float = _D()["phantoms"]["hit"]
						if at_t < hit:
							# (copies of her shimmering off her as she wraps her wings round herself)
							var k := clampf((at_t - 0.4) / (hit - 0.4), 0.0, 1.0)
							glow_pen = MP.Pen.new()
							MP.draw_phantoms_gather(glow_pen, at, mx, my, ax, ay, k * k, _D()["wrapH"], clock)
					"moth:beat":
						var hit: float = _D()["moves"]["beat"]["hit"]
						var B := MO.book_of(P.map)
						if at_t < hit and not B.is_empty():
							# (the chapter's pages tearing loose as she rears)
							var k := clampf((at_t - 0.3) / (hit - 0.3), 0.0, 1.0)
							glow_pen = MP.Pen.new()
							MP.draw_pages_loosing(glow_pen, at, B["book"].x, B["book"].y, k, clock)
		"moth:gust":
			MP.draw_ghost_wing(floor_pen, at, x, y, p["fx"], p["fy"], t, spot)
		"moth:eclipse":
			top = _clipped(P)
			_eclipse(P, floor_pen, top, at, x, y, p["fx"], p["fy"], float(_D()["eclipse"]["hit"]) + t, clock, spot)
		"moth:dust", "moth:shed":
			top = _clipped(P)
			MP.draw_hush_ground(top, at, x, y, hush_r, t, clock, spot)
			glow_pen = MP.Pen.new()
			MP.draw_hush_snow(glow_pen, at, x, y, hush_r, t)
		"moth:wave":
			var W: Dictionary = _D()["waveFx"]
			var fade := 1.0 - clampf((t - float(W["reach"])) / (float(W["long"]) - float(W["reach"])), 0.0, 1.0)
			top = _clipped(P)
			MP.draw_unwriting_ground(top, at, x, y, MO.wave_at(t), MO.T("beat")["wide"], fade)
			glow_pen = MP.Pen.new()
			MP.draw_unwriting_pages(glow_pen, at, x, y, MO.wave_at(t), t, fade)
		"moth:phantoms":
			glow_pen = MP.Pen.new()
			MP.draw_phantoms(glow_pen, at, x, y, p["fx"], p["fy"], t)
		"moth:words":
			var Dd: Dictionary = _D()["dies"]
			var s := _at(x, y)
			# (the words flying home, a twentieth of a second at a time, as her death's picture of them is)
			var kk := floori(t * 20.0)
			if kk / 20.0 <= float(Dd["words"][1]) + 2.2:
				air_pen = MP.Pen.new()
				var f := Vector2(p["fx"], p["fy"])
				MP.draw_words(air_pen, s[0], s[1], kk / 20.0, f.x + f.y < -0.2, f.x - f.y < 0.0)
			# (the light she comes apart into: its light in the dark; the motes off her wings and body as they crumble)
			var c0: float = Dd["crumble"][0]
			var c1: float = Dd["crumble"][1]
			MP.death_lights(s[0], s[1], (t - c0) / (c1 - c0), clock, spot)
			glow_pen = MP.Pen.new()
			var fx: float = p["fx"]
			var fy: float = p["fy"]
			var motes: Array = _D()["motes"]
			MP.draw_death_motes(glow_pen, t, func(i: int) -> Array:
				var q: Array = motes[i]["q"]
				var w := MP.art_to_world(x, y, fx, fy, q)
				var o := _at(w[0], w[1])
				return [o[0], float(o[1]) - float(q[2]) / 2.0])
	p["_pf"] = floor_pen
	p["_pt"] = top
	p["_pa"] = air_pen
	p["_pg"] = glow_pen


## (render/act1_fx/moth.ts eclipseDrawn) The moon behind her and her shadow, `t` seconds into her Eyes' move (on past the blow), she at
## (x, y) casting along (ax, ay): the moon up in the sky on her far side from him, kept on the screen; her shadow kept to the top.
static func _eclipse(P, g: MP.Pen, top: MP.Pen, at: Callable, x: float, y: float, ax: float, ay: float, t: float, clock: float, spot: Callable) -> void:
	var s := _at(x, y)
	var q := _at(x + ax * 4.0, y + ay * 4.0)
	var d := MP._hypot(q[0] - s[0], q[1] - s[1])
	if d == 0.0:
		d = 1.0
	# (the screen, game pixels)
	var inv: Transform2D = P.get_viewport().get_canvas_transform().affine_inverse()
	var tl: Vector2 = inv * Vector2.ZERO / 2.0
	var br: Vector2 = inv * P.get_viewport().get_visible_rect().size / 2.0
	var mx := minf(br.x - 60.0, maxf(tl.x + 60.0, s[0] - ((q[0] - s[0]) / d) * 230.0))
	var my := minf(br.y - 60.0, maxf(tl.y + 60.0, s[1] - float(_D()["rearH"]) - 40.0 - ((q[1] - s[1]) / d) * 70.0))
	MP.draw_moon(g, mx, my, MP.moon_at(t), clock, spot)
	var h := _at(P.hero.world.x, P.hero.world.y)
	MP.draw_eclipse(top, at, x, y, ax, ay, t, h[0], float(h[1]) - 14.0, clock, spot, "floor")
	MP.draw_eclipse(g, at, x, y, ax, ay, t, h[0], float(h[1]) - 14.0, clock, spot, "rising")


## On the floor, under the figures.
static func draw(P, p: Dictionary) -> void:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		M16.draw(P, p)
		return
	var t: float = p["t"]
	# (the top's: what lies on its stones first, then what rises)
	if p.get("_pt") != null:
		p["_pt"].draw(P)
	if p.get("_pf") != null:
		p["_pf"].draw(P)
	match name:
		"moth:show":
			var src = p.get("src")
			if _acting(src, p) and str(p["act_id"]) == "moth:swarm" and float(src.h2.act["t"]) < float(_D()["phantoms"]["hit"]):
				_lanes(P, src.world.x, src.world.y, p["ax"], p["ay"], src.h2.act["t"])
		"moth:phantoms":
			_lanes(P, p["x"], p["y"], p["fx"], p["fy"], float(_D()["phantoms"]["hit"]) + t)
		"moth:shed":
			# (the Hush she sheds over him: where it will fall)
			if t < 0.0:
				GW.fan(P, Vector2(p["x"], p["y"]), Vector2(1, 0), 1, -PI, PI, float(_D()["cloud"]["tiles"]) / 2.0, minf(1.0, 1.0 + t / float(MO.T("shed")["warn"])), P._clock)


## (render/act1_fx/moth.ts lanesDrawn) Her phantoms' lanes marked, each until it has set off (`t`: seconds into her Swarm's move);
## over the top only.
static func _lanes(P, x: float, y: float, ax: float, ay: float, t: float) -> void:
	var PH: Dictionary = _D()["phantoms"]
	for i in int(PH["n"]):
		var off: float = float(PH["hit"]) + i * float(PH["apart"]) + 0.12
		var k := GW.warn_k(t, PH["warn"], off)
		if k < 0.0:
			continue
		var w := MP.phantom_way(ax, ay, i)
		var f := Vector2(w[0], w[1])
		GW.strip(P, Vector2(x, y), f, 1, PH["start"], _on_top(P, x, y, w[0], w[1], PH["long"]), -float(PH["half"]), PH["half"], k, P._clock)


## (onTop) How far from (x, y) along (wx, wy) the top goes on (tiles), or `most`.
static func _on_top(P, x: float, y: float, wx: float, wy: float, most: float) -> float:
	if P.map == null or P.map.land == null or P.map.land.get("tower") == null:
		return most
	var T: Dictionary = P.map.land["tower"]["top"]
	var dx: float = x - float(T["cx"])
	var dy: float = y - float(T["cy"])
	var b := dx * wx + dy * wy
	var q := dx * dx + dy * dy - float(T["r"]) * float(T["r"])
	var disc := b * b - q
	return most if disc < 0.0 else maxf(float(_D()["phantoms"]["start"]), minf(most, -b + sqrt(disc)))


## Among the figures: the last chapter on the stones.
static func stands(P, p: Dictionary) -> void:
	if str(p["a1"]) != "moth:book" or not P.has_film("mo_book_0"):
		return
	var B := MO.book_of(P.map)
	if B.is_empty():
		return
	var src = p.get("src")
	var alive: bool = src != null and is_instance_valid(src) and not src.dead
	var beating: bool = alive and src.h2 != null and src.h2.act != null and str(src.h2.acts()[src.h2.act["i"]]["id"]) == "moth:beat"
	var wind := 1.0 if beating else (0.35 if alive else 0.0)
	var film := "mo_book_100" if wind == 1.0 else ("mo_book_35" if wind > 0.0 else "mo_book_0")
	var k := floori(fmod(P._clock * 10.0, 20.0)) if wind > 0.0 else 0
	var book: Vector2 = B["book"]
	P._film_one(p, "fx_book", P._still(film, "stand", k), B["at"], book.x + book.y - 1.2)


## Over the figures, under the dark: the words flying home.
static func air(_P, c: CanvasItem, p: Dictionary) -> void:
	if p.get("_pa") != null:
		p["_pa"].draw(c)


## Over the dark: what shines.
static func glow(_P, c: CanvasItem, p: Dictionary) -> void:
	if p.get("_pg") != null:
		p["_pg"].draw(c)
