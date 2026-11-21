## WHAT THE RANGER SENDS AND LAYS, AS THE GAME DRAWS IT (render/render.ts, a hero's arrow and his traps; render/fx.ts, a volley's
## arrows coming down and standing in the floor; render/wild.ts drawWildArrow): his arrows in flight at the height of the arrow on
## his string (game/defs.ts RANGER_ARROW), their shafts the colour of the words they carry, a streak of light behind them; a
## volley's arrows falling head first with a pale line of the air they came through, their shadows closing on where they land,
## then standing in the floor and fading; his traps lying open once armed, the words in front of them rings beating round them,
## the words behind sparks circling them. On the floor (under the figures) and in the air (over them, `air`).
extends Node2D

const L := preload("res://scripts/fx_looks.gd")
const Fx := preload("res://scripts/fx.gd")
const Iso := preload("res://scripts/iso.gd")

var kit
var loot
var air: Node2D
var falling: Array = []
var stuck: Array = []
var _t := 0.0
## (render/fx.ts ARROW_FALL: how fast a volley's arrow falls, game pixels a second)
const ARROW_FALL := 560.0


class _Air extends Node2D:
	var look

	func _draw() -> void:
		look.draw_air(self)


func _ready() -> void:
	L.ready_up()
	air = _Air.new()
	air.look = self
	air.z_index = 40
	add_child(air)


func _process(dt: float) -> void:
	_t += dt
	# (what he is doing, told to his wind each frame: fx_wild_ranger.gd, wild.ts see and follow)
	var fx = kit.h.fx if kit != null else null
	if fx != null and is_instance_valid(fx):
		var wr = fx.wild_ranger
		wr.traps_before = kit.traps.map(func(t): return {"x": t["x"], "y": t["y"]})
		wr.volleys = kit.volleys
		wr.move = kit.move
		wr.hero_at = kit.h.world
		wr.follow(kit.shots, dt * 60.0 * fx.room(), float(kit.T["rangerArrow"]["height"]))
		fx.follow_shots(kit.shots, dt * 60.0)
	for list in [falling, stuck]:
		for i in range(list.size() - 1, -1, -1):
			list[i]["t"] = float(list[i]["t"]) + dt
			if float(list[i]["t"]) >= float(list[i]["dur"]):
				list.remove_at(i)
	queue_redraw()
	air.queue_redraw()


static func _has(w, word: String) -> bool:
	return w is Array and (w as Array).has(word)


static func _ramp(list) -> Array:
	var out: Array = []
	for c in list:
		out.append(c)
	return out


## (render/fx.ts beamColors, arrowColors) An arrow's colours, brightest first: plain steel and wood, or what its words make of it.
static func arrow_colors(el: String, w, n: int, echo: bool) -> Array:
	var P: Dictionary = L.P
	var plain := el == "phys" and not _has(w, "power") and not _has(w, "swift") and not _has(w, "leech") and not _has(w, "poison") and not _has(w, "volatile")
	if plain and not echo and n == 0:
		return [P["white"], P["sl5"], P["wd5"], P["wd4"]]
	var heavy := _has(w, "power")
	var ramp: Array = _ramp(L.EL["arcane" if el == "phys" else el])
	ramp.reverse()
	var colors: Array = ramp
	if el == "phys":
		if heavy:
			colors = _ramp(L.POWER_HOT)
		elif _has(w, "swift"):
			colors = _ramp(L.WIND)
		elif _has(w, "leech"):
			colors = [P["white"], P["bl5"], P["bl4"], P["bl3"]]
		elif _has(w, "poison"):
			colors = _ramp(L.VENOM)
		elif _has(w, "volatile"):
			colors = _ramp(L.VIOLET)
	if echo or (n > 0 and el == "phys" and not heavy):
		colors = _ramp(L.MIRROR)
	return colors


## What the fight tells of a volley (render/fx.ts volleyUp, volleyDrop, volleyFall): its arrows up off the bow, each coming down,
## each standing in the floor.
func on_event(e: Dictionary, fx) -> void:
	match str(e.get("t", "")):
		"volleyUp":
			var colors := arrow_colors(e["el"], e.get("words"), 0, bool(e.get("echo", false)))
			var A: Dictionary = kit.T["rangerArrow"]
			var d := Vector2(float(e["tx"]) - float(e["x"]), float(e["ty"]) - float(e["y"]))
			var along := d.length() if d.length() > 0.0 else 1.0
			var b := Vector2(e["x"], e["y"]) + d / along * float(A["volleyFrom"])
			var bz: float = A["volleyHeight"]
			if fx != null:
				for i in (3 if bool(e.get("echo", false)) else 6):
					fx.add(b.x + randf_range(-0.1, 0.1), b.y + randf_range(-0.1, 0.1), bz + randf_range(-2, 2), d.x * 0.5 + randf_range(-0.5, 0.5), d.y * 0.5 + randf_range(-0.5, 0.5),
						ARROW_FALL * randf_range(0.85, 1.1), 0.34 + i * 0.015, colors[mini(colors.size() - 1, 1 + i % 2)], 1.0, 0.0, null, 9.0)
				fx.flash(b.x, b.y, bz + 1.0, 0.34 if _has(e.get("words"), "power") else 0.22, 0.09, PackedColorArray(colors))
				fx.wild_ranger.volley_up(b.x, b.y, bz, bool(e.get("echo", false)))
		"volleyDrop":
			if fx != null:
				fx.wild_ranger.volley_drop(float(e["x"]), float(e["y"]), float(e["in"]))
			if falling.size() < 80:
				falling.append({"x": e["x"], "y": e["y"], "t": 0.0, "dur": maxf(0.02, float(e["in"])), "colors": arrow_colors(e["el"], e.get("words"), int(e["n"]), bool(e.get("echo", false))), "heavy": _has(e.get("words"), "power")})
		"volleyFall":
			var colors := arrow_colors(e["el"], e.get("words"), int(e["n"]), bool(e.get("echo", false)))
			var heavy := _has(e.get("words"), "power")
			if stuck.size() < 70:
				stuck.append({"x": e["x"], "y": e["y"], "t": 0.0, "dur": 0.8 if bool(e.get("echo", false)) else 1.5, "color": colors[mini(colors.size() - 1, 2)], "tip": colors[1], "lean": -1 if int(e["n"]) > 0 else 1})
			if fx != null:
				var P: Dictionary = L.P
				fx.spray(float(e["x"]), float(e["y"]), 4 if heavy else 2, PackedColorArray([P["st7"], P["st6"], P["st5"]]) if e["el"] == "phys" else PackedColorArray(colors.slice(1)), 1.3, 34.0, 1.0)
				if e["el"] != "phys" or heavy:
					fx.glow(float(e["x"]), float(e["y"]), 26.0 if heavy else 18.0, 0.16)
				if heavy and int(e.get("hits", 0)) > 0:
					fx.kick(0.8)
				fx.wild_ranger.volley_fall(float(e["x"]), float(e["y"]), int(e.get("hits", 0)))
		"trapSet":
			if fx != null:
				var P: Dictionary = L.P
				fx.spray(float(e["x"]), float(e["y"]), 4, PackedColorArray([P["sl5"], P["sl4"], P["sl3"]]), 1.6, 40.0, 2.0)
				fx.wild_ranger.trap_set(float(e["x"]), float(e["y"]))


## A floor point on the screen, game pixels.
static func _at(x: float, y: float) -> Vector2:
	return Iso.to_screen(x, y) / 2.0


func _draw() -> void:
	if kit == null:
		return
	var P: Dictionary = L.P
	# (a volley's arrows standing in the floor: a short shaft leaning back the way it fell, its fletching at the top, fading)
	for a in stuck:
		var k: float = float(a["t"]) / float(a["dur"])
		var s := _at(a["x"], a["y"]).round()
		var top: float = s.x + int(a["lean"]) * (3 if float(a["t"]) < 0.05 else 2)
		var al := 1.0 if k < 0.7 else maxf(0.0, 1.0 - (k - 0.7) / 0.3)
		Fx.pline(self, s.x, s.y, top, s.y - 8, Color(a["color"], al))
		draw_rect(Rect2((top - 1) * 2, (s.y - 10) * 2, 6, 4), Color(a["tip"], al))
		draw_rect(Rect2(top * 2, (s.y - 11) * 2, 2, 2), Color(a["tip"], al))
		draw_rect(Rect2((s.x - 1) * 2, s.y * 2, 8, 2), Color(P["black"], al * 0.4))
	# (and the shadow of each arrow still in the air, closing on where it will land)
	for a in falling:
		var k := minf(1.0, float(a["t"]) / float(a["dur"]))
		var s := _at(a["x"], a["y"]).round()
		var half := 1 if k > 0.6 else 2
		draw_rect(Rect2((s.x - half) * 2, s.y * 2, (half * 2 + 1) * 2, 2), Color(P["black"], 0.15 + 0.3 * k))
	# (his traps: open once armed, by its own beat; the words in front rings beating round it, the words behind sparks circling it)
	if loot != null:
		for tr in kit.traps:
			var el := str(tr["element"])
			var open := float(tr["arm"]) <= 0.0 and floori(_t * 3.0) % 2 == 0
			var pic = loot.pics.get("trap:%s:%d" % [el if loot.pics.has("trap:%s:0" % el) else "phys", 1 if open else 0])
			var c := _at(tr["x"], tr["y"])
			var front: Array = kit.h.loadout.front[int(tr["skill"])]
			var behind: Array = kit.h.loadout.behind[int(tr["skill"])]
			var k := 0
			for w in front:
				if w == null:
					continue
				var beat := sin(_t * 6.0 - k * 1.3)
				_ring_dots(c, 0.4 + k * 0.17 + beat * 0.04, L.WORD.get(w, P["white"]), 1 if beat > 0.0 else 2)
				k += 1
			var nb := behind.filter(func(x): return x != null).size()
			var j := 0
			for w in behind:
				if w == null:
					continue
				var a := _t * 2.4 + (float(j) / nb) * PI * 2.0
				var r := 0.55 + k * 0.17
				var q := _at(float(tr["x"]) + cos(a) * r, float(tr["y"]) + sin(a) * r).round()
				draw_rect(Rect2((q.x - 1) * 2, (q.y - 2) * 2, 4, 4), L.WORD.get(w, P["white"]))
				draw_rect(Rect2(q.x * 2, (q.y - 2) * 2, 2, 2), P["white"])
				j += 1
			if pic != null:
				var rect: Rect2 = pic["rect"]
				draw_texture_rect_region(loot.sheet, Rect2(c.round() * 2.0 - pic["anchor"], rect.size), rect)


## (render.ts ringDots) A ring of dots on the floor `r` tiles round, every other one, `step` apart.
func _ring_dots(c: Vector2, r: float, col: Color, step: int) -> void:
	var n := 28
	for i in range(0, n, step):
		var a := float(i) / n * PI * 2.0
		var x := c.x + cos(a) * r * 16.0 * sqrt(2.0)
		var y := c.y + sin(a) * r * 8.0 * sqrt(2.0)
		draw_rect(Rect2(roundf(x) * 2, roundf(y) * 2, 2, 2), col)


## Over the figures: his arrows in flight, and a volley's coming down.
func draw_air(c: CanvasItem) -> void:
	if kit == null:
		return
	var P: Dictionary = L.P
	var A: Dictionary = kit.T["rangerArrow"]
	for p in kit.shots:
		var v := Vector2(p["vx"], p["vy"])
		# (from where the arrow on his string was, at its height)
		if 0.4 + float(p["age"]) * v.length() < float(A["from"]):
			continue
		var s := _at(p["x"], p["y"])
		var sx := s.x
		var sy := s.y - roundf(float(A["height"]))
		var d := Vector2((v.x - v.y) * 16.0, (v.x + v.y) * 8.0)
		var u := d / d.length() if d.length() > 0.0 else Vector2(1, 0)
		var w: Array = p["words"]
		var swift := w.has("swift")
		var twin := int(p["n"]) > 0
		var power := w.has("power")
		var leech := w.has("leech")
		var volatile := w.has("volatile")
		var flick := floori(_t * 20.0) % 2 == 0
		# (BIG AND WILD: a hero's arrow streaks light behind it, render/wild.ts drawWildArrow)
		Fx.pline(c, sx - u.x * 6, sy - u.y * 6, sx, sy, L.CRACKLE[0])
		c.draw_rect(Rect2((roundf(sx) - 1) * 2, (roundf(sy) - 1) * 2, 6, 6), L.CRACKLE[0])
		# (Swift: a long pale streak behind it)
		if swift:
			Fx.pline(c, sx - u.x * 24, sy - u.y * 24, sx - u.x * 6, sy - u.y * 6, P["tl3"] if twin else P["gn4"])
		var body: float = (10 if power else (9 if swift else (8 if leech or volatile or twin else 6))) + float(A["long"]) - 6.0
		# (the shaft takes the colour of the word it carries)
		var shaft: Color = P["tl4"] if twin else (P["fr5"] if power else (P["gn5"] if swift else (P["bl4"] if leech else ((P["pu5"] if flick else P["pu4"]) if volatile else P["wd5"]))))
		var jx := roundf(randf_range(-1, 1)) if volatile else 0.0
		var jy := roundf(randf_range(-1, 1)) if volatile else 0.0
		Fx.pline(c, sx - u.x * body + jx, sy - u.y * body + jy, sx + jx, sy + jy, shaft)
		var cols: Array = _ramp(L.EL[str(p["element"])]) if L.EL.has(str(p["element"])) else []
		var head: Color = P["tl5"] if twin else (P["white"] if power else (cols[cols.size() - 2] if str(p["element"]) != "phys" and cols.size() >= 2 else (P["bl5"] if leech else (P["white"] if volatile else P["sl5"]))))
		if power:
			c.draw_rect(Rect2((roundf(sx) - 1) * 2, (roundf(sy) - 1) * 2, 6, 6), head)
		else:
			c.draw_rect(Rect2((roundf(sx) + jx) * 2, (roundf(sy) + jy) * 2, 4, 4), head)
		c.draw_rect(Rect2(roundf(sx - 2) * 2, (roundf(sy) + roundf(float(A["height"]))) * 2, 8, 2), Color(P["black"], 0.35))
	# (a volley's arrows coming down: each head first, its fletching last, with a pale line of the air it came through)
	for a in falling:
		var s := _at(a["x"], a["y"])
		var px := roundf(s.x)
		var py := roundf(s.y - ARROW_FALL * maxf(0.0, float(a["dur"]) - float(a["t"])))
		var wd := 2 if bool(a["heavy"]) else 1
		var col: Array = a["colors"]
		c.draw_rect(Rect2(px * 2, (py - 30) * 2, 2, 36), Color(col[1], 0.3))
		c.draw_rect(Rect2(px * 2, (py - 12) * 2, wd * 2, 20), col[mini(col.size() - 1, 2)])
		c.draw_rect(Rect2((px - 1) * 2, (py - 13) * 2, (wd + 2) * 2, 4), col[1])
		c.draw_rect(Rect2(px * 2, (py - 3) * 2, wd * 2, 6), col[0])
