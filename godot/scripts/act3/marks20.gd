## WHAT FLOOR 20'S OWN LAY ON THE FLOOR AND SEND OVER IT (the Quiet Tower: render/act1_fx/hshape.ts, rshadow.ts, rshade.ts), as
## their rules step them. Their warnings, `<kind>:warn`, are act3/marks16.gd's.
##   hshape:grip   THE GRIP'S COILS round whoever it caught (following him while it holds), or where it shut on nothing: its far half
##                 behind him, its near half before him (hs_grip_*), 0.8 s.
##   rshadow:show  through a royal shadow's act: ITS WARNING in the enemy's pink (the lash's quarter turn, the thrust's line, the
##                 comb's stab, the charge's way, the masks' three lines); the King's shadow's LINE OF SPARKS where it ran (painted as
##                 the art paints it, sparksFx, at its size, in fog and the dull pink); its CROWN'S WEIGHT (rsh_w*).
##   rshadow:snare THE PRINCESS'S SNARE: its round marked, then the vines bursting up, holding, sinking (rsh_snare).
##   rshadow:masks THE PRINCE'S MASKS flung in a fan and bursting into fog (rsh_masks_*).
##   rshade:line   THE RIME SHADE'S LINE: its mark, laid out toward him in the enemy's pink; the rime creeping down it, its crust on
##                 the floor and its crystals standing up out of it among the figures (those farther from the eye than him behind
##                 him, the nearer before him); painted as the game paints them, fifteen times a second (act3/rime_paint.gd).
##   rshade:ice    FROZEN IN PLACE: the frost closing over his legs (its far half under him, its near half over him), and
##                 shattering (rs_ice_*).
extends RefCounted

const M16 := preload("res://scripts/act3/marks16.gd")
const GW := preload("res://scripts/act3/garden_warn.gd")
const GP := preload("res://scripts/act2/gp.gd")
const GKM := preload("res://scripts/act3/gk_marks.gd")
const RS := preload("res://scripts/act3/rshadow.gd")
const RIME := preload("res://scripts/act3/rime_paint.gd")
const Iso := preload("res://scripts/iso.gd")

## (when the hero was last let go of a freeze, by the perils' clock: no line freezes him again within the grace)
static var freed := {}

const TILE3 := 39.191835884530846
## (art/royal_shadows.ts FOG, EYE (FLAME[1]), EYE_LIT (FLAME[2]))
const FOG: Array[Color] = [Color("#0e0e10"), Color("#18181b"), Color("#232326"), Color("#303034"), Color("#404044"), Color("#535357"),
	Color("#6a6a6d"), Color("#858483"), Color("#a4a19d"), Color("#c6c1b8"), Color("#e6e0d3")]
const EYE := Color("#c0206a")
const EYE_LIT := Color("#ff4f8a")
## (SHADOW_CHARGE: 0.64 of the King's)
const SK := 0.64


static func _acting(src, p: Dictionary) -> bool:
	return src != null and is_instance_valid(src) and not src.dead and src.state == "act" and src.h2 != null and src.h2.act != null and is_same(src.h2.act, p["act"])


static func gone(_P, _p: Dictionary) -> void:
	pass


static func step(P, p: Dictionary, dt: float) -> bool:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		return M16.step(P, p, dt)
	var t: float = p["t"]
	var hero = P.hero
	match name:
		"rshadow:show":
			if not _acting(p.get("src"), p):
				p["dur"] = t
		"rshadow:snare":
			# (the vines burst up: whoever is in their round is struck and held)
			if t >= 0.0 and float(p["a"]) == 0.0:
				p["a"] = 1.0
				if hero.world.distance_to(Vector2(p["x"], p["y"])) <= float(RS.SNARE["r"]) and hero._act != "lunge":
					P._hurt(p, float(p["dmg"]))
					hero.chill(RS.SNARE["hold"], RS.SNARE["slow"])
		"rshade:ice":
			# (the ice round his feet goes with him while he is held)
			if t < float(RIME.FROZEN_HOLD) and hero.held > 0.0:
				p["x"] = hero.world.x
				p["y"] = hero.world.y
			if int(p["done"]) == 0 and t >= float(RIME.FROZEN_HOLD):
				p["done"] = 1
				freed[P.get_instance_id()] = P._clock
		"rshade:line":
			_rime_step(P, p, t)
		"rshadow:masks":
			# (each mask strikes where it passes him; the three of one throw once at most)
			# (checked along the way each came since the last step: they are fast)
			var t0 := minf(float(p.get("pt", 0.0)), float(RS.MASKS["flight"]))
			p["pt"] = t
			if int(p["done"]) == 0 and t0 < float(RS.MASKS["flight"]):
				var t1 := minf(t, float(RS.MASKS["flight"]))
				for i in 3:
					var a := RS.mask_at(p, i, t0)
					var b := RS.mask_at(p, i, t1)
					var q := Geometry2D.get_closest_point_to_segment(hero.world, a, b)
					if hero.world.distance_to(q) > float(RS.MASKS["hit"]):
						continue
					p["done"] = 1
					P._hurt(p, float(p["dmg"]), q)
					break
	return t < float(p["dur"])


static func draw(P, p: Dictionary) -> void:
	var name := str(p["a1"])
	if name.ends_with(":warn"):
		M16.draw(P, p)
		return
	match name:
		"rshadow:show":
			_show(P, p)
		"rshade:line":
			_rime_ground(P, p)
		"rshadow:snare":
			var t: float = p["t"]
			if t < 0.0:
				var k := minf(1.0, 1.0 + t / (float(RS.SNARE["hit"]) - float(RS.SNARE["warn_end"])))
				GW.fan(P, Vector2(p["x"], p["y"]), Vector2(1, 0), 1, -PI, PI, float(RS.SNARE["r"]) - 0.3, k, P._clock)


## THE RIME SHADE'S LINE, a step: marked, not yet breathed out, gone if it is stopped first; its front reaching him, struck and frozen
## in place (dodging through it, neither); the rime lying where its front has passed slowing him.
static func _rime_step(P, p: Dictionary, t: float) -> void:
	var hero = P.hero
	if t < 0.0:
		var m = p.get("src")
		if m == null or not is_instance_valid(m) or m.dead or m.state != "act" or m.h2 == null or m.h2.act == null:
			p["dur"] = t
		return
	var front := RIME.line_front(t)
	var was: float = p["b"]
	p["b"] = front
	var r := _on_line(p, hero.world)
	var hr := 0.3 * 0.5
	if absf(r.y) > RIME.HALF + hr or not hero.alive:
		return
	var free: bool = hero._act != "lunge" and hero._invuln <= 0.0
	if int(p["done"]) == 0 and free and r.x >= RIME.FROM - hr and r.x > was - hr and r.x <= front + hr:
		p["done"] = 1
		P._hurt(p, float(p["dmg"]), Vector2(p["x"], p["y"]))
		var since: float = P._clock - float(freed.get(P.get_instance_id(), -1e9))
		var icy := false
		for q in P.list:
			if str(q.get("a1", "")) == "rshade:ice" and float(q["t"]) < float(RIME.FROZEN_HOLD):
				icy = true
		if not icy and hero.held <= 0.0 and not (since >= 0.0 and since < 1.0):
			hero.held = maxf(hero.held, RIME.FROZEN_HOLD)
			hero._tell({"t": "text", "x": hero.world.x, "y": hero.world.y, "text": "Frozen", "color": "#ff8a80"})
			var ice := p.duplicate()
			for k in ice.keys():
				if str(k).begins_with("fx_") or str(k).begins_with("rs_"):
					ice.erase(k)
			ice.merge({"a1": "rshade:ice", "x": hero.world.x, "y": hero.world.y, "t": 0.0, "hit": 0.0, "dur": float(RIME.FROZEN_HOLD) + 0.32 + 0.05, "done": 0, "b": 0.0, "c": 0.0, "d": 0.0}, true)
			P.list.append(ice)
			P.sfx.play("frost", linear_to_db(0.6))
		return
	# (the rime lying where its front has passed: it slows him)
	if r.x < RIME.FROM or r.x > front:
		return
	var tr := RIME.reaches_at(clampf(r.x, RIME.FROM, RIME.FROM + RIME.LONG))
	if tr < 0.0 or RIME.rime_left(t - tr) < 0.3:
		return
	hero.chill(0.12, 0.4)


static func _on_line(p: Dictionary, at: Vector2) -> Vector2:
	var d := at - Vector2(p["x"], p["y"])
	return Vector2(d.x * float(p["fx"]) + d.y * float(p["fy"]), d.x * float(p["fy"]) - d.y * float(p["fx"]))


## A line's picture of a part (`mark`, `floor`, `behind`, `before`, `all`), painted afresh when its stamp changes: [texture, box].
static func _rime_pic(p: Dictionary, part: String, stamp: String, paint: Callable) -> ImageTexture:
	var key := "rs_" + part
	var had = p.get(key)
	if had != null and str(had[0]) == stamp:
		return had[1]
	var b: Rect2i = p["rs_box"]
	var d := RIME.blank(b)
	paint.call(d, b)
	var img := Image.create_from_data(b.size.x, b.size.y, false, Image.FORMAT_RGBA8, d)
	var tex: ImageTexture = had[1] if had != null else null
	if tex == null or tex.get_width() != b.size.x or tex.get_height() != b.size.y:
		tex = ImageTexture.create_from_image(img)
	else:
		tex.update(img)
	p[key] = [stamp, tex]
	return tex


## Where the top left of a line's box is on the screen (picture pixels), its floor point on a whole game pixel.
static func _rime_tl(p: Dictionary) -> Vector2:
	var g := GP.at(p["x"], p["y"])
	var b: Rect2i = p["rs_box"]
	return Vector2(GP.rnd(g.x), GP.rnd(g.y)) * 2.0 + Vector2(b.position.x - RIME.CAX, b.position.y - RIME.CAY)


static func _rime_view(p: Dictionary) -> Array:
	if not p.has("rs_view"):
		var v := RIME.line_view(Vector2(p["fx"], p["fy"]))
		p["rs_view"] = v
		p["rs_box"] = RIME.line_box(v[0], v[1])
	return p["rs_view"]


## On the floor: its mark (from the breath's mark till the rime has crept to its end), and its crust.
static func _rime_ground(P, p: Dictionary) -> void:
	var t: float = p["t"]
	if t >= RIME.GONE:
		return
	var v := _rime_view(p)
	var back: bool = v[0]
	var turn: float = v[1]
	var stamp := str(floori(t * 15.0 + 1e-6))
	var tl := _rime_tl(p)
	var tq := floorf(t * 15.0 + 1e-6) / 15.0
	if t < RIME.LONG / RIME.PACE + 0.1:
		var tex := _rime_pic(p, "mark", stamp, func(d, b): RIME.paint_mark(d, b, tq + RIME.HIT, back, turn))
		P.draw_texture(tex, tl)
	if t < 0.0:
		return
	var crust := _rime_pic(p, "floor", stamp, func(d, b): RIME.paint_floor(d, b, tq, back, turn))
	P.draw_texture(crust, tl)


## Among what stands: its crystals (split about the hero near it), each part a picture at its own depth.
static func _rime_stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	if t < 0.0 or t >= RIME.GONE or P.stands == null:
		for k in ["fx_rs_behind", "fx_rs_before", "fx_rs_all"]:
			_hide(p, k)
		return
	var v := _rime_view(p)
	var back: bool = v[0]
	var turn: float = v[1]
	var stamp := str(floori(t * 15.0 + 1e-6))
	var tq := floorf(t * 15.0 + 1e-6) / 15.0
	var tl := _rime_tl(p)
	var r := _on_line(p, P.hero.world)
	var end := RIME.FROM + RIME.LONG
	var f := Vector2(p["fx"], p["fy"])
	var at0 := Vector2(p["x"], p["y"])
	if absf(r.y) <= 1.6 and r.x >= RIME.FROM - 1.6 and r.x <= end + 1.6:
		# (the hero near it: its crystals farther from the eye than him behind him, the nearer before him)
		var at := clampf(r.x, RIME.FROM, end)
		var w := at0 + f * at
		for side in ["behind", "before"]:
			var tex := _rime_pic(p, side, "%s:%.2f" % [stamp, at], func(d, b): RIME.paint_air(d, b, tq, back, turn, side, at))
			_rime_sprite(P, p, "fx_rs_" + side, tex, tl, w.x + w.y + (0.02 if side == "before" else -0.02))
		_hide(p, "fx_rs_all")
		return
	var all := _rime_pic(p, "all", stamp, func(d, b): RIME.paint_air(d, b, tq, back, turn, "all", 0.0))
	var mid := at0 + f * (RIME.FROM + RIME.LONG / 2.0)
	_rime_sprite(P, p, "fx_rs_all", all, tl, mid.x + mid.y)
	_hide(p, "fx_rs_behind")
	_hide(p, "fx_rs_before")


static func _rime_sprite(P, p: Dictionary, key: String, tex: Texture2D, tl: Vector2, depth: float) -> void:
	var s = p.get(key)
	if s == null or not is_instance_valid(s):
		s = Sprite2D.new()
		s.centered = false
		P.stands.add_child(s)
		p[key] = s
	s.visible = true
	s.texture = tex
	s.position = Vector2(tl.x, depth * 16.0)
	s.offset = Vector2(0.0, tl.y - depth * 16.0)


## Through a royal shadow's act, on the floor: its warning; the King's shadow's line of sparks and its crown's floor.
static func _show(P, p: Dictionary) -> void:
	var m = p.get("src")
	if not _acting(m, p):
		return
	var a: Dictionary = m.h2.act
	var t: float = a["t"]
	var hand: int = a["hand"]
	var f: Vector2 = m.face
	var at: Vector2 = m.world
	var k := -1.0
	match str(p["id"]):
		"rshadow:lash":
			k = GW.warn_k(t, float(RS.LASH["warn"]) - 0.15, RS.LASH["hit"])
			if k >= 0.0:
				GW.fan(P, at, f, hand, -float(RS.LASH["half"]), RS.LASH["half"], RS.LASH["reach"], k, P._clock)
		"rshadow:thrust":
			k = GW.warn_k(t, float(RS.THRUST["warn"]) - 0.15, RS.THRUST["hit"])
			if k >= 0.0:
				GW.strip(P, at, f, hand, 0.2, RS.THRUST["reach"], -float(RS.THRUST["half"]), RS.THRUST["half"], k, P._clock)
		"rshadow:comb":
			k = GW.warn_k(t, float(RS.COMB["warn"]) - 0.15, RS.COMB["hit"])
			if k >= 0.0:
				GW.fan(P, at, f, hand, -float(RS.COMB["half"]), RS.COMB["half"], RS.COMB["reach"], k, P._clock)
		"rshadow:masks":
			k = GW.warn_k(t, float(RS.MASKS["warn"]) - 0.15, 0.8666666666666667)
			if k >= 0.0:
				for deg in RS.MASKS["ways"]:
					var r := deg_to_rad(float(deg))
					GW.strip(P, at, Vector2(f.x * cos(r) - f.y * sin(r), f.x * sin(r) + f.y * cos(r)), hand, 0.3, RS.MASKS["reach"], -0.35, 0.35, k, P._clock)
		"rshadow:charge":
			# (the way it will run, through its bracing; then its line of sparks where it ran, bursting)
			k = GW.warn_k(t, RS.CHARGE["warn"], RS.CHARGE["run"][0])
			if k >= 0.0:
				GW.strip(P, at, f, hand, 0.0, RS.CHARGE["most"], -0.45, 0.45, k, P._clock)
			var A: Dictionary = m.h2.a1
			if A.has("sx") and t >= float(RS.CHARGE["run"][0]) and t < float(RS.CHARGE["lies"]):
				var c := Vector2(A["cx"], A["cy"])
				_shadow_sparks(P, Vector2(A["sx"], A["sy"]), c.x + c.y < -0.2, c.x - c.y < 0.0, floori((t - float(RS.CHARGE["run"][0])) * 30.0) / 30.0, roundf(float(A.get("lane", 0.0)) * 4.0) / 4.0)
		"rshadow:weight":
			# (what the shadow crown lays on the floor under it: its shadow, the warning ring round where it will fall, the slam)
			var A: Dictionary = m.h2.a1
			var tc := t - float(RS.WEIGHT["send"])
			var film := "rsh_wfloor_" + ("back" if f.x + f.y < -0.2 else "front")
			if A.has("wx") and tc >= 0.0 and tc < float(RS.WEIGHT["long"]) and P.has_film(film):
				P._film_floor(film, tc, Vector2(A["wx"], A["wy"]), f.x - f.y < 0.0)


## THE KING'S SHADOW'S LINE OF SPARKS (art/royal_shadows_fx.ts sparksFx: the King's line at 0.64 of his, in fog and the dull pink),
## `t` seconds after it set off, laid where it set off; `lane` how far it ran.
static func _shadow_sparks(P, at0: Vector2, back: bool, flip: bool, t: float, lane: float) -> void:
	var pace: float = RS.CHARGE["pace"]
	var ran := lane / pace
	var tb := ran + 0.6
	if t < 0.0 or t >= tb + 1.0:
		return
	var T := TILE3
	var g := GP.at(at0.x, at0.y)
	var o := Vector2(GP.rnd(g.x), GP.rnd(g.y)) * 2.0
	var tail := 1.75 * SK
	var x0 := -tail * T
	var x1 := minf(t, ran) * pace * T - tail * T
	var since := t - tb
	var S_CUT: Array[Color] = [FOG[10], FOG[8], EYE_LIT, EYE, FOG[2]]
	var S_SPARK: Array[Color] = [FOG[10], FOG[8], EYE_LIT, EYE]
	var S_SHARD: Array[Color] = [FOG[10], FOG[8], EYE_LIT, EYE_LIT, EYE]
	var S_GRIT: Array[Color] = [FOG[3], FOG[4], FOG[5]]
	var his := GKM._charge_sparks(lane / SK)
	var at := func(q: Vector3) -> Vector2: return GKM._own(back, flip, q)
	var wob := func(x: float) -> float: return SK * GKM._wob(x / SK)
	var held := GKM.KG.smooth_in(-0.35, -0.04, since) if since < 0.0 else 0.0
	var pulse := held * (0.6 + 0.4 * sin(t * 46.0))
	var scar := 1.0 if since < 0.0 else 1.0 - GKM.KG.smooth_in(0.12, 0.95, since)
	# THE CUT: a groove scored along the stones, glowing
	var x := x0
	while x <= x1:
		var age := (x1 - x) / (pace * T) + maxf(0.0, t - ran)
		var y: float = wob.call(x)
		var col := Color(0, 0, 0, 0)
		if since >= 0.0:
			if since < 0.08:
				col = S_CUT[0]
			elif GP.hash(GP.rnd(x), 3, 9501) < scar:
				col = S_CUT[2] if since < 0.25 else (S_CUT[3] if since < 0.5 else S_CUT[4])
		elif age < 0.05:
			col = S_CUT[0]
		elif age < 0.15:
			col = S_CUT[1]
		elif held > 0.7 and GP.hash(GP.rnd(x), floori(t * 20.0), 9502) < held - 0.25:
			col = S_CUT[0]
		elif pulse > 0.4 and GP.hash(GP.rnd(x), floori(t * 20.0) + 1, 9502) < pulse:
			col = S_CUT[1]
		else:
			col = S_CUT[2] if age < 0.4 else S_CUT[3]
		if col.a > 0.0:
			GKM._lay(P, o, at.call(Vector3(x, y, 0.2)), col, 2)
			if since < 0.0:
				var lip := S_CUT[1] if age < 0.15 else (S_CUT[2] if pulse > 0.4 else S_CUT[3])
				GKM._lay(P, o, at.call(Vector3(x, y - 2.2, 0.2)), lip)
				GKM._lay(P, o, at.call(Vector3(x, y + 2.2, 0.2)), FOG[0] if GP.hash(GP.rnd(x * 2.0), 1, 9503) < 0.5 else lip)
		x += 0.6
	if since < 0.0:
		var n := GP.rnd((x1 - x0) / 2.5)
		for i in n:
			var sx := x0 + (x1 - x0) * GP.hash(i, 1, 9504)
			var age := (x1 - sx) / (pace * T) + maxf(0.0, t - ran)
			var life := GKM._fr(t * (2.2 + GP.hash(i, 2, 9504)) + GP.hash(i, 3, 9504))
			if GP.hash(i, 4, 9504) > 0.45 + 0.4 * held + (0.5 if age < 0.25 else 0.0):
				continue
			var q := Vector3(sx + (GP.hash(i, 5, 9504) - 0.5) * 4.0, float(wob.call(sx)) + (GP.hash(i, 6, 9504) - 0.5) * 8.0 * life, 0.5 + 17.0 * life * (1.0 - life) * (1.0 - 0.6 * held))
			GKM._lay(P, o, at.call(q), S_SPARK[i % 4], 2 if life < 0.35 else 1)
		if held > 0.0:
			for i in his.size():
				var q: Array = his[i]
				if float(q[0]) * SK > x1:
					continue
				var shake := (GP.hash(i, floori(t * 30.0), 9505) - 0.5) * 1.6 if held > 0.3 else 0.0
				var s: Vector2 = at.call(Vector3(float(q[0]) * SK, float(q[1]) * SK, 1.3 + 2.6 * held + shake))
				var hot := (floori(t * 30.0) + i) % 3 != 0
				if held > 0.45:
					GKM._lay(P, o, s + Vector2(-2, 0), S_SPARK[1])
					GKM._lay(P, o, s + Vector2(2, 0), S_SPARK[1])
					GKM._lay(P, o, s + Vector2(0, 2), EYE_LIT)
				GKM._lay(P, o, s, S_SPARK[0] if held > 0.5 and hot else S_SPARK[1], 2)
		return
	# THE RELEASE: a flash along the line as they tear off it, and stone chips kicked up out of it
	if since < 0.1:
		var H := 0.35 * T * SK
		var fx := x0
		while fx <= x1:
			var fy := -H
			while fy <= H:
				if GP.hash(GP.rnd(fx), GP.rnd(fy * 3.0), 9506) <= 0.6 * (1.0 - since / 0.1) * (1.0 - absf(fy) / H):
					GKM._lay(P, o, at.call(Vector3(fx, float(wob.call(fx)) + fy, 0.6)), S_SPARK[0] if absf(fy) < H * 0.4 else EYE_LIT)
				fy += 2.2
			fx += 1.1
	var nc := GP.rnd((x1 - x0) / 4.0)
	for i in nc:
		var u := since / (0.22 + 0.12 * GP.hash(i, 16, 9507))
		if u >= 1.0:
			continue
		var gx := x0 + (x1 - x0) * GP.hash(i, 17, 9507)
		var side := (GP.hash(i, 18, 9507) - 0.5) * 2.0
		GKM._lay(P, o, at.call(Vector3(gx, float(wob.call(gx)) + side * 0.45 * T * SK * u, maxf(0.5, 0.45 * T * SK * (2.6 * u - 2.6 * u * u)))), S_GRIT[i % 3], 1 + (i % 2))
	for i in his.size():
		var q: Array = his[i]
		var qat: float = q[3]
		if since < qat:
			# THE SPARK SHOT OFF: its head bone white, its streak back along the way it came
			var s: Vector2 = at.call(GKM._spark_at(q, since) * SK)
			var st: Vector2 = at.call(GKM._spark_at(q, maxf(0.0, since - 0.07)) * SK)
			var steps := maxi(1, ceili(s.distance_to(st)))
			for j in steps:
				var fj := float(j) / steps
				GKM._lay(P, o, st + (s - st) * fj, S_SPARK[3] if fj < 0.4 else (S_SPARK[2] if fj < 0.75 else S_SPARK[1]))
			GKM._lay(P, o, s + Vector2(-2, 0), S_SPARK[1])
			GKM._lay(P, o, s + Vector2(2, 0), S_SPARK[1])
			GKM._lay(P, o, s + Vector2(0, -2), S_SPARK[1])
			GKM._lay(P, o, s, S_SPARK[0], 2)
			continue
		var a := since - qat
		var pop: Vector3 = Vector3(q[2]) * SK
		var ps: Vector2 = at.call(pop)
		# ITS POP: a star of light, for a moment
		if a < 0.06:
			GKM._lay(P, o, ps, S_SPARK[0], 2)
			var L := 4 if a < 0.03 else 3
			for r in range(2, L + 1):
				var c := S_SPARK[0] if r < 3 else EYE_LIT
				for d in [Vector2(r, 0), Vector2(-r, 0), Vector2(0, r), Vector2(0, -r)]:
					GKM._lay(P, o, ps + d, c)
				if r <= L - 1:
					for d in [Vector2(r, r), Vector2(-r, r), Vector2(r, -r), Vector2(-r, -r)]:
						GKM._lay(P, o, ps + d, S_SPARK[1])
		# ITS SHRAPNEL: fragments flung out every way, streaked, cooling to the dull pink, gone
		var u := a / 0.25
		if u < 1.0:
			var c := S_SHARD[mini(4, floori(u * 5.0))]
			for j in 12:
				var sb: Vector2 = at.call(GKM._shard_at(q, i, j, maxf(0.0, u - 0.16)) * SK)
				var sa: Vector2 = at.call(GKM._shard_at(q, i, j, u) * SK)
				var steps := maxi(1, ceili(sa.distance_to(sb)))
				for mm in steps:
					GKM._lay(P, o, sb + (sa - sb) * float(mm) / steps, S_SHARD[mini(4, floori(u * 5.0) + 1)] if u < 0.5 else c)
				GKM._lay(P, o, sa, c, 2 if u < 0.3 else 1)
		# (its smoke, a few puffs of fog drifting up off where it popped)
		for mm in 3:
			var life := clampf((a - 0.05 - 0.05 * mm) / (1.0 - 0.08 - qat - 0.05 * mm), 0.0, 1.0)
			if life <= 0.0 or life >= 1.0:
				continue
			var sp := Vector3(pop.x + (GP.hash(i, 20 + mm, 9508) - 0.5) * 8.0 - 3.0 * life, pop.y + (GP.hash(i, 23 + mm, 9508) - 0.5) * 8.0, pop.z + 10.0 * life)
			GKM._lay(P, o, at.call(sp), FOG[7] if life < 0.4 else FOG[5], 2 if life < 0.5 else 1)


static func stands(P, p: Dictionary) -> void:
	var t: float = p["t"]
	match str(p["a1"]):
		"hshape:grip":
			if t >= 0.8:
				return
			var k := mini(23, floori(t * 30.0))
			# (round him, following him while it holds: he cannot move)
			var at := Vector2(p["x"], p["y"])
			if float(p["a"]) != 0.0 and P.hero.alive:
				at = P.hero.world
			if P.has_film("hs_grip_far"):
				P._film_one(p, "fx_far", P._still("hs_grip_far", "stand", k), at, at.x + at.y - 0.04)
				P._film_one(p, "fx_near", P._still("hs_grip_near", "stand", k), at, at.x + at.y + 0.04)
		"rshade:line":
			_rime_stands(P, p)
		"rshade:ice":
			# (round him: its far half behind him, its near half before him, as he is seen)
			var k := floori(t * 30.0 + 1e-6)
			var hf: Vector2 = P.hero.face
			var view := "back" if hf.x + hf.y < -0.2 else "front"
			if k < 0 or t > float(RIME.FROZEN_HOLD) + 0.32 or not P.has_film("rs_ice_%s_far" % view):
				_hide(p, "fx_far")
				_hide(p, "fx_near")
				return
			var at := Vector2(p["x"], p["y"])
			P._film_one(p, "fx_far", P._still("rs_ice_%s_far" % view, "stand", k), at, at.x + at.y - 0.05)
			P._film_one(p, "fx_near", P._still("rs_ice_%s_near" % view, "stand", k), at, at.x + at.y + 0.05)
		"rshadow:show":
			# (THE SHADOW CROWN in the air, over the figures, at the floor point under it)
			var m = p.get("src")
			if not _acting(m, p) or str(p["id"]) != "rshadow:weight" or not m.h2.a1.has("wx"):
				_hide(p, "fx_crown")
				return
			var tc := float(m.h2.act["t"]) - float(RS.WEIGHT["send"])
			var f: Vector2 = m.face
			var film := "rsh_wcrown_" + ("back" if f.x + f.y < -0.2 else "front")
			var w := Vector2(m.h2.a1["wx"], m.h2.a1["wy"])
			var k: int = P._film_frame(film, tc) if tc >= 0.0 and tc < float(RS.WEIGHT["long"]) and P.has_film(film) else -1
			P._film_one(p, "fx_crown", P._still(film, "stand", k) if k >= 0 else -1, w, w.x + w.y + 1.5, f.x - f.y < 0.0)
		"rshadow:snare":
			if t >= 0.0 and t <= float(RS.SNARE["long"]) and P.has_film("rsh_snare"):
				var at := Vector2(p["x"], p["y"])
				P._film_one(p, "fx_snare", P._still("rsh_snare", "stand", floori(t * 30.0)), at, at.x + at.y + 0.02)
			else:
				_hide(p, "fx_snare")
		"rshadow:masks":
			var view := "back" if float(p["fx"]) + float(p["fy"]) < -0.2 else "front"
			var film := "rsh_masks_" + view
			if P.has_film(film):
				var at := Vector2(p["x"], p["y"])
				var k: int = P._film_frame(film, t)
				P._film_one(p, "fx_masks", P._still(film, "stand", k) if k >= 0 else -1, at, at.x + at.y + 0.3, float(p["fx"]) - float(p["fy"]) < 0.0)


static func _hide(p: Dictionary, key: String) -> void:
	var s = p.get(key)
	if s != null and is_instance_valid(s):
		s.visible = false


static func air(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass


static func spots(_P, _p: Dictionary) -> void:
	pass


static func glow(_P, _c: CanvasItem, _p: Dictionary) -> void:
	pass
