## WHAT FLOOR 19'S OWN LAY ON THE FLOOR AND SEND OVER IT (the Keep: render/act1_fx/xbow.ts, kknight.ts), as their rules step them
## (game/act1_rules/xbow.ts, kknight.ts floorBlow). Their warnings, `<kind>:warn`, are act3/marks16.gd's.
##   xbow:show          through his shot: THE LANE on the floor, 0.8 across, drawn out from before the pavise, held, its dither of deep
##                      warning red pulsing, flaring at its end for the last moment; THE BOLT, a white-hot streak down it at the
##                      crossbow's height, grit where it strikes, thinning and gone. A deep warning red, never the enemy's pink.
##   kknight:crack      THE CRACK: the floor split on out before him in a jagged line to eight tiles, side cracks off it, stone thrown
##                      up along it, held a moment and closing to dust.
##   kknight:bannerwarn the shockwave's reach marked round where the banner will go in, as it is held aloft.
##   kknight:banner     THE BANNER standing, its cloth stirring, shuddering as a blow lands, cut down (kk_*); the shockwave rolling out,
##                      the floor cracked under its foot, and THE GOLD OF ITS REACH, 7 tiles round it: a dashed band turning slowly,
##                      twelve chevrons pointing in, a twinkle of gold within and motes drifting up; going out as it is cut down. His
##                      blows cut it down (three).
extends RefCounted

const Iso := preload("res://scripts/iso.gd")
const GP := preload("res://scripts/act2/gp.gd")
const A1 := preload("res://scripts/act1/act1.gd")
const M16 := preload("res://scripts/act3/marks16.gd")
const GW := preload("res://scripts/act3/garden_warn.gd")
const XB := preload("res://scripts/act3/xbow.gd")
const KN := preload("res://scripts/act3/kknight.gd")

## (art/keep_crossbowmen_fx.ts LINE_RED, BOLT_HOT, CB_FX)
const LINE_RED: Array[Color] = [Color("#4e0806"), Color("#86100c"), Color("#c41c14"), Color("#f0301e"), Color("#ff7a5c")]
const BOLT_HOT: Array[Color] = [Color("#fff4ea"), Color("#ffd8c4"), Color("#ff9a78")]
const CB_FX := {"grow": [0.62, 0.76], "steady": 1.22, "strike": [1.3666666666666667, 1.4333333333333333], "fade": [1.4333333333333333, 1.6533333333333333]}
const BOLT_UP := 23.0
const STONE: Array[Color] = [Color("#262a3e"), Color("#3a4058"), Color("#565e7a")]
const CRACK_INK := Color("#0c0a12")
const RALLY_GOLD: Array[Color] = [Color("#5a3c08"), Color("#a8741a"), Color("#e8b23a"), Color("#ffe08a")]
const RALLY_PINK: Array[Color] = [Color("#7a1058"), Color("#ff7aa8"), Color("#c0206a")]
## (art/act1_figs/kknight.ts BANNER_LOOP, BANNER_N)
const BANNER_LOOP := TAU / 3.1
const BANNER_N := 24


static func gone(_P, _p: Dictionary) -> void:
	pass


static func _alive(src) -> bool:
	return src != null and is_instance_valid(src) and not src.dead


static func _c01(v: float) -> float:
	return clampf(v, 0.0, 1.0)


static func _hide(p: Dictionary, key: String) -> void:
	var s = p.get(key)
	if s != null and is_instance_valid(s):
		s.visible = false


static func _acting(src, p: Dictionary) -> bool:
	return _alive(src) and src.state == "act" and src.h2 != null and src.h2.act != null and is_same(src.h2.act, p["act"])


static func step(P, p: Dictionary, dt: float) -> bool:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		return M16.step(P, p, dt)
	var t: float = p["t"]
	match name:
		"xbow:show", "kknight:bannerwarn":
			if not _acting(p.get("src"), p):
				p["dur"] = t
	return t < float(p["dur"])


## THE BANNER STRUCK (kknight.ts floorBlow): every blow of his that reaches it; at the third it is cut down.
static func floor_blow(P, p: Dictionary, at: Vector2, rad: float) -> void:
	if str(p.get("a1", "")) != "kknight:banner" or float(p["d"]) >= 0.0 or at.distance_to(Vector2(p["x"], p["y"])) > rad + 0.35:
		return
	p["c"] = int(p["c"]) + 1
	p["b"] = p["t"]
	if int(p["c"]) < KN.LIFE:
		P.sfx.play("hit", linear_to_db(0.4))
		return
	p["d"] = p["t"]
	p["dur"] = float(p["t"]) + 1.6
	P.sfx.play("shatter", linear_to_db(0.7))
	var main = P.hero.monsters.main if P.hero.monsters != null else null
	if main != null:
		main.loot.say("The banner is cut down", Color("#e8b23a"))


static func stands(P, p: Dictionary) -> void:
	if str(p["a1"]) != "kknight:banner":
		return
	var t: float = p["t"]
	var f := Vector2(p["fx"], p["fy"])
	var view := "back" if f.x + f.y < -0.2 else "front"
	var flip := f.x - f.y < 0.0
	var cut: float = t - float(p["d"]) if float(p["d"]) >= 0.0 else -1.0
	var struck: float = t - float(p["b"]) if float(p["b"]) >= 0.0 else -1.0
	var at := Vector2(p["x"], p["y"])
	var name := ""
	var k := 0
	if cut >= 0.0:
		name = "kk_cut_" + view
		k = mini(floori(cut * 30.0), 47)
	elif struck >= 0.0 and struck < 0.4:
		name = "kk_struck_" + view
		k = mini(floori(struck * 30.0), 11)
	elif t < 0.2:
		name = "kk_plant_" + view
		k = mini(floori(t * 30.0), 5)
	else:
		name = "kk_banner_" + view
		k = floori((t - 0.2) / BANNER_LOOP * BANNER_N) % BANNER_N
	if P.has_film(name):
		P._film_one(p, "fx_stand", P._still(name, "stand", k), at, at.x + at.y, flip)
	# (splinters, as it is cut)
	if cut >= 0.0 and cut < 1.0 and P.has_film("kk_splinters"):
		P._film_one(p, "fx_air", P._still("kk_splinters", "stand", floori(cut * 30.0)), at, at.x + at.y + 0.05, false)
	else:
		_hide(p, "fx_air")


static func draw(P, p: Dictionary) -> void:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		M16.draw(P, p)
		return
	var src = p.get("src")
	match name:
		"xbow:show":
			if _acting(src, p):
				_lane(P, src, float(src.h2.act["t"]), float(src.h2.act.get("a", XB.LANE["tiles"])))
		"kknight:bannerwarn":
			if _acting(src, p):
				var k := GW.warn_k(float(src.h2.act["t"]), float(KN.BANNER["raised"]) - 0.2, KN.BANNER["hit"])
				if k >= 0.0:
					GW.fan(P, Vector2(p["x"], p["y"]), Vector2(1, 0), 1, -PI, PI, KN.BANNER["wave"], k, P._clock)
		"kknight:crack":
			_crack(P, p)
		"kknight:banner":
			_rally(P, p)


## A point `fwd` along his aim and `side` across it, from where he stands.
static func _along(m, fwd: float, side: float) -> Vector2:
	return m.world + m.face * fwd + Vector2(-m.face.y, m.face.x) * side


## THE LANE on the floor through his shot.
static func _lane(c: CanvasItem, m, T: float, len: float) -> void:
	var g0: float = CB_FX["grow"][0]
	var g1: float = CB_FX["grow"][1]
	if T < g0 or T >= float(CB_FX["strike"][0]):
		return
	var from: float = XB.LANE["from"]
	var wide: float = XB.LANE["wide"]
	var reach := from + (len - from) * _c01((T - g0) / (g1 - g0))
	var half := wide / 2.0
	var flare := T >= float(CB_FX["steady"])
	var pulse := 0.5 + 0.5 * sin(c._clock * 10.0)
	# (the dither inside: a deep red, pulsing)
	var n := GP.rnd((reach - from) * wide * 70.0)
	for i in n:
		if GP.hash(i, 1, 9301) > 0.45 + 0.2 * pulse:
			continue
		var w := _along(m, from + (reach - from) * GP.hash(i, 2, 9302), -half + wide * GP.hash(i, 3, 9303))
		var s := GP.at(w.x, w.y)
		GP.fill(c, GP.rnd(s.x), GP.rnd(s.y), 2, 1, LINE_RED[2] if flare else LINE_RED[1], 0.55 + 0.25 * pulse)
	# (its edges solid, and its end)
	var col: Color = LINE_RED[4] if flare else LINE_RED[3]
	var d := from
	while d <= reach:
		for sd in [-half, half]:
			var w := _along(m, d, sd)
			var s := GP.at(w.x, w.y)
			GP.fill(c, GP.rnd(s.x), GP.rnd(s.y), 2, 1, col, 0.9)
		d += 0.06
	var sd2 := -half
	while sd2 <= half:
		var w := _along(m, reach, sd2)
		var s := GP.at(w.x, w.y)
		GP.fill(c, GP.rnd(s.x), GP.rnd(s.y), 2, 1, col, 0.9)
		sd2 += 0.06


## THE CRACK, `t` seconds after the blade bites: out in two frames, held, closing to dust.
static func _crack(c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	var C := KN.CRACK
	if t > float(C["long"]):
		return
	var from: float = C["from"]
	var reach: float = C["reach"]
	var out := from + (reach - from) * _c01(t / float(C["open"]))
	var fade := 1.0 - _c01((t - float(C["hold"])) / (float(C["long"]) - float(C["hold"])))
	var at := Vector2(p["x"], p["y"])
	var f := Vector2(p["fx"], p["fy"])
	var hand: int = p["hand"]
	# (the main split, jagged, wider near him; nine side cracks off it)
	var left := 0.0
	var fw := from
	while fw <= out:
		left = clampf(left + (GP.hash(roundi(fw * 20.0), 1, 8111) - 0.5) * 0.12, -0.35, 0.35)
		var q := A1.beside(at, f, hand, fw, left)
		var s := GP.at(q.x, q.y)
		GP.fill(c, GP.rnd(s.x) - 1, GP.rnd(s.y), 3 if fw < from + 2.0 else 2, 1, CRACK_INK, fade)
		if t < float(C["burst"]) and GP.hash(roundi(fw * 20.0), 2, 8112) < 0.35:
			GP.fill(c, GP.rnd(s.x), GP.rnd(s.y - 2.0 - 8.0 * GP.hash(roundi(fw * 20.0), 3, 8113) * (t / float(C["burst"]))), 2, 2, STONE[roundi(fw * 7.0) % 3], fade)
		fw += 0.05
	for j in 9:
		var f0 := from + (reach - from) * (j + 0.5) / 9.0
		if f0 > out:
			break
		var side := 1.0 if j % 2 == 1 else -1.0
		var a := side * deg_to_rad(40.0 + 40.0 * GP.hash(j, 4, 8114))
		var fx := f0
		var lx := 0.0
		var long := 0.5 + 0.9 * GP.hash(j, 5, 8115)
		var st := 0.0
		while st < long:
			fx += cos(a) * 0.05
			lx += sin(a) * 0.05
			a += (GP.hash(j, roundi(st * 20.0), 8116) - 0.5) * 0.3
			var q := A1.beside(at, f, hand, fx, lx)
			var s := GP.at(q.x, q.y)
			GP.fill(c, GP.rnd(s.x), GP.rnd(s.y), 1, 1, CRACK_INK, fade)
			st += 0.05


## THE BANNER'S REACH: its shockwave, the floor cracked under its foot, the gold of its reach.
static func _rally(c: CanvasItem, p: Dictionary) -> void:
	var t: float = p["t"]
	var cut: float = t - float(p["d"]) if float(p["d"]) >= 0.0 else -1.0
	var at := Vector2(p["x"], p["y"])
	var X := GP.at(at.x, at.y)
	# THE SHOCKWAVE, rolling out to its reach in a fifth of a second
	if t < 0.6:
		var k := 1.0 - pow(1.0 - _c01(t / 0.2), 2)
		var fade := 1.0 - _c01((t - 0.3) / 0.3)
		var r := float(KN.BANNER["wave"]) * k
		for dy in [0.0, 1.0]:
			c.draw_set_transform(Vector2(X.x, X.y + dy) * 2.0, 0.0, Vector2(2.0, 1.0))
			c.draw_arc(Vector2.ZERO, r * 16.0 * sqrt(2.0), 0.0, TAU, 64, Color(RALLY_PINK[1] if dy == 0.0 else RALLY_PINK[2], fade), 1.0)
		c.draw_set_transform(Vector2.ZERO, 0.0, Vector2.ONE)
	# (the floor cracked under its foot)
	if cut < 1.6:
		for j in 7:
			var a0 := GP.hash(j, 5, 1953) * TAU
			var w := at
			var n := 6 + floori(5.0 * GP.hash(j, 6, 1953))
			for i in n:
				var a := a0 + (GP.hash(j, i, 1955) - 0.5) * 0.9
				w += Vector2(cos(a), sin(a)) * 0.09
				var s := GP.at(w.x, w.y)
				GP.dot(c, s.x, s.y, Color("#120f18"))
	# THE GOLD OF ITS REACH
	var on := _c01((t - 0.15) / 0.35) * (1.0 if cut < 0.0 else 1.0 - _c01(cut / 0.5))
	if on <= 0.0:
		return
	var R: float = KN.BANNER["reach"]
	var turn := t * 0.12
	var pt := func(a: float, d: float) -> Vector2: return GP.at(at.x + cos(a) * d, at.y + sin(a) * d)
	# (the glow within: a sparse twinkle of gold; and motes of it drifting up)
	var tw := floori(t * 3.0)
	for i in 260:
		if GP.hash(i, tw, 1961) > 0.55 * on:
			continue
		var q: Vector2 = pt.call(GP.hash(i, 1, 1962) * TAU, R * 0.97 * sqrt(GP.hash(i, 2, 1962)))
		GP.dot(c, q.x, q.y, RALLY_GOLD[2] if GP.hash(i, 3, 1962) < 0.2 else RALLY_GOLD[1])
	for i in 110:
		var life := fmod(t * 0.6 + GP.hash(i, 10, 1957), 1.0)
		if life > 0.7 or GP.hash(i, 11, 1957) > on:
			continue
		var q: Vector2 = pt.call(GP.hash(i, 8, 1957) * TAU, R * sqrt(GP.hash(i, 9, 1957)))
		GP.dot(c, q.x, q.y - life * 3.0, RALLY_GOLD[2] if life < 0.3 else RALLY_GOLD[1])
	# (the ring at its edge: a thick dashed band turning slowly, its dashes bright; a fine line inside it)
	var n2 := GP.rnd(R * 60.0)
	for i in n2:
		var a := float(i) / n2 * TAU + turn
		if GP.hash(i, 7, 1957) > on:
			continue
		var dash := i % 6
		var qi: Vector2 = pt.call(a, R - 0.16)
		if i % 2 == 0:
			GP.dot(c, qi.x, qi.y, RALLY_GOLD[1])
		if dash > 3:
			continue
		var q: Vector2 = pt.call(a, R)
		var hi := dash == 1 or dash == 2
		GP.dot(c, q.x, q.y - 0.5, RALLY_GOLD[3] if hi else RALLY_GOLD[2], 2, 1)
		GP.dot(c, q.x, q.y + 0.5, RALLY_GOLD[1], 2, 1)
		GP.dot(c, q.x, q.y + 1.5, RALLY_GOLD[0], 2, 1)
	# (twelve chevrons pointing in round it)
	for k2 in 12:
		var a := k2 / 12.0 * TAU + turn
		for j in range(-6, 7):
			var side := absi(j) / 6.0
			if GP.hash(k2, j, 1965) > on + 0.2:
				continue
			var q: Vector2 = pt.call(a + j * 0.012, R - 0.32 - 0.3 * (1.0 - side))
			GP.dot(c, q.x, q.y - 0.5, RALLY_GOLD[3])
			GP.dot(c, q.x, q.y + 0.5, RALLY_GOLD[0])


static func air(_P, c: CanvasItem, p: Dictionary) -> void:
	if str(p["a1"]) != "xbow:show":
		return
	var src = p.get("src")
	if not _acting(src, p):
		return
	_bolt(c, src, float(src.h2.act["t"]), float(src.h2.act.get("a", XB.LANE["tiles"])))


## THE BOLT at the crossbow's height: half way down the lane in the strike's first frame, at its end in the second.
static func _bolt(c: CanvasItem, m, T: float, len: float) -> void:
	var s0: float = CB_FX["strike"][0]
	var s1: float = CB_FX["strike"][1]
	var f0: float = CB_FX["fade"][0]
	var f1: float = CB_FX["fade"][1]
	if T < s0 or T >= f1:
		return
	var from: float = XB.LANE["from"]
	var head := from + (len - from) * 0.5 if T < s1 else len
	var fade := 1.0 if T < f0 else 1.0 - _c01((T - f0) / (f1 - f0))
	var d := from - 0.3
	while d <= head:
		var w := _along(m, d, 0.0)
		var s := GP.at(w.x, w.y)
		var k := (head - d) / maxf(0.5, head - from)
		var col: Color = BOLT_HOT[0] if k < 0.08 else (BOLT_HOT[1] if k < 0.4 else BOLT_HOT[2])
		GP.fill(c, GP.rnd(s.x), GP.rnd(s.y) - BOLT_UP, 2 if fade > 0.5 else 1, 2 if fade > 0.6 else 1, col, fade * (0.95 - 0.5 * k))
		d += 0.05
	# (the grit where it strikes at the end)
	if T >= s1:
		var e := _along(m, len, 0.0)
		var s := GP.at(e.x, e.y)
		for i in 14:
			var a := GP.hash(i, 4, 9304) * TAU
			var r := (2.0 + 7.0 * GP.hash(i, 5, 9305)) * (0.4 + (T - s1) * 4.0)
			GP.fill(c, GP.rnd(s.x + cos(a) * r), GP.rnd(s.y - BOLT_UP * 0.5 + sin(a) * r * 0.6), 1, 1, Color("#a8a49c") if i % 3 == 0 else Color("#7c7870"), fade)


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
