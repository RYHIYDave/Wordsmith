## What the monsters' moves mark on the floor, and what each does when its time comes (game.ts zones and perils; game/
## action_f1.ts). Pink and gold are the enemy's (CLAUDE.md: what glows on a friend is cyan). Drawn on the floor, under
## everyone; the game's own pictures of them (render/act1_fx, art/action_f1_fx.ts) are to come: these are stand-ins.
##   warn  a slam's red circle: when its time is out, whoever is within it (and 0.1) is struck.
##   lane  a charge's line, from the troll through where the hero stood and on: drawn while he winds up and as he runs it.
##   aim   the marksman's line of aim, run out as he draws (it follows the hero until 0.4 s before he looses).
##   rain  the arrow rain's ring, where the hero stood as the archer loosed: struck 1.5 s later, the arrows standing a while.
##   bars  the Lockdown: the bars' shadows in rows across the Warden's hall as his keys go up; at the crash a hero within 0.42
##         of a row is struck, a cell is safe; then the bars stand 1.5 s as a cage the hero cannot walk through.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const FloorMap := preload("res://scripts/floor_map.gd")
const MM := preload("res://scripts/monster_moves.gd")

const ENEMY := Color(0.96, 0.27, 0.47)
const GOLD := Color(1.0, 0.78, 0.35)
const SHADOW := Color(0.02, 0.02, 0.07)

var map: FloorMap
var hero  # hero.gd
var sfx  # sfx.gd
var list: Array = []


func warn(x: float, y: float, r: float, dur: float, dmg: float, src: Object) -> void:
	list.append({"kind": "warn", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "dmg": dmg, "src": src})


func lane(src: Object, a: Vector2, b: Vector2, half: float, dur: float) -> void:
	list.append({"kind": "lane", "a": a, "b": b, "half": half, "t": 0.0, "dur": dur, "gone": 0.0, "src": src})


func aim(src: Object, a: Vector2, b: Vector2, dur: float) -> Dictionary:
	var p := {"kind": "aim", "a": a, "b": b, "t": 0.0, "dur": dur, "src": src}
	list.append(p)
	return p


func rain(x: float, y: float, dmg: float) -> void:
	var sticks := PackedVector2Array()
	for i in 26:
		var ang := randf() * TAU
		var d := sqrt(randf()) * MM.RAIN["radius"]
		sticks.append(Vector2(x + cos(ang) * d, y + sin(ang) * d))
	list.append({"kind": "rain", "x": x, "y": y, "t": 0.0, "dmg": dmg, "done": false, "sticks": sticks})


## The Lockdown, cast with the Warden at (x, y): its rows across the room he stands in (action_f1.ts barRows).
func bars(src: Object, x: float, y: float, dmg: float, windup: float) -> void:
	var room = _room_at(x, y)
	if room == null:
		return
	var cell: float = MM.LOCKDOWN["cell"]
	var reach: float = maxf(room["w"], room["h"]) + cell
	var rows_x := PackedFloat32Array()  # rows along x, at a fixed y
	var rows_y := PackedFloat32Array()  # rows along y, at a fixed x
	for k in range(-ceili(reach / cell) - 1, ceili(reach / cell) + 2):
		var d := cell / 2.0 + k * cell
		if absf(d) > reach:
			continue
		if y + d > room["y"] and y + d < room["y"] + room["h"]:
			rows_x.append(y + d)
		if x + d > room["x"] and x + d < room["x"] + room["w"]:
			rows_y.append(x + d)
	list.append({"kind": "bars", "x": x, "y": y, "t": -windup, "dmg": dmg, "done": false, "src": src, "room": room, "rx": rows_x, "ry": rows_y})


## A monster that falls takes its marks with it (game.ts: its warn, lane and aim go).
## A red circle marked on the floor for `dur` seconds, harmless of itself (the Headsman's vault: his own blow does the harm).
func mark(x: float, y: float, r: float, dur: float, src: Object) -> void:
	list.append({"kind": "warn", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "dmg": 0.0, "src": src, "mark": true})


## A ring going out over the floor where a blow came down.
func blast(x: float, y: float, r: float) -> void:
	list.append({"kind": "blast", "x": x, "y": y, "r": r, "t": 0.0})


## THE CULTIST'S FIRE SIGIL (game/action_f2.ts): its clock from -windup (the cast) to its eruption at 0, then the floor burning.
func sigil(x: float, y: float, dmg: float, windup: float, src: Object) -> void:
	list.append({"kind": "sigil", "x": x, "y": y, "t": -windup, "cast": windup, "dmg": dmg, "src": src, "done": 0})


## THE SHADE'S RIME (game/action_f2.ts): frost on the floor that slows the hero while he stands in it.
func rime(x: float, y: float, src: Object) -> void:
	list.append({"kind": "rime", "x": x, "y": y, "t": 0.0, "src": src})


func drop(src: Object, kinds := ["warn", "lane", "aim"]) -> void:
	list = list.filter(func(p): return not (p.get("src") == src and p["kind"] in kinds))


func _process(dt: float) -> void:
	var keep: Array = []
	for p in list:
		p["t"] += dt
		var stays := true
		match p["kind"]:
			"warn":
				if p["t"] >= p["dur"]:
					if not p.get("mark", false):
						sfx.play("slam", -2.0)
						hero.shake()
						if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= p["r"] + 0.1:
							hero.hurt(p["dmg"])
						keep.append({"kind": "blast", "x": p["x"], "y": p["y"], "r": p["r"], "t": 0.0})
					stays = false
				elif p.get("mark", false) and (not is_instance_valid(p["src"]) or p["src"].dead):
					stays = false
			"sigil":
				var at := Vector2(p["x"], p["y"])
				var w = p["src"]
				if p["t"] < -0.05:
					# (its cultist still casting: if it has fallen, or been stopped in its cast, nothing erupts)
					if not is_instance_valid(w) or w.dead or w.state != "windup":
						stays = false
				elif p["done"] == 0 and p["t"] >= 0.0:
					p["done"] = 1
					if hero.alive and hero.world.distance_to(at) <= MM.SIGIL["radius"]:
						hero.hurt(p["dmg"])
					sfx.play("fire")
					hero.kick(2.5)
				elif p["done"] > 0 and p["t"] > MM.SIGIL["strike"]:
					# (the floor burning on: a tick every 0.5 s while he stands in what still burns)
					var next: float = MM.SIGIL["strike"] + MM.SIGIL["every"] * p["done"]
					if p["t"] >= next:
						p["done"] += 1
						if hero.alive and hero.world.distance_to(at) <= MM.burn_radius(p["t"]):
							hero.hurt(p["dmg"] * MM.SIGIL["share"])
				if p["t"] >= MM.SIGIL["pillar"] + MM.SIGIL["fall"] + MM.SIGIL["burn"]:
					stays = false
			"rime":
				var d: Vector2 = hero.world - Vector2(p["x"], p["y"])
				var e := MM.rime_edge(p["t"], atan2(d.y, d.x))
				if e > 0.0 and d.length() <= e:
					hero.chill(0.12, MM.RIME["slow"])
				stays = p["t"] < MM.RIME["lie"]
			"blast":
				stays = p["t"] < 0.3
			"rain":
				if not p["done"] and p["t"] >= MM.RAIN["delay"]:
					p["done"] = true
					sfx.play("hit", -4.0)
					if hero.alive and hero.world.distance_to(Vector2(p["x"], p["y"])) <= MM.RAIN["radius"]:
						hero.hurt(p["dmg"])
				stays = p["t"] < MM.RAIN["delay"] + MM.RAIN["stuck"] + MM.RAIN["gone"]
			"bars":
				var w = p["src"]
				if p["t"] < -0.1 and (not is_instance_valid(w) or w.dead or w.state != "windup"):
					stays = false
				elif not p["done"] and p["t"] >= 0.0:
					p["done"] = true
					sfx.play("slam")
					hero.shake()
					if hero.alive and _on_a_row(p, hero.world):
						hero.hurt(p["dmg"])
				if p["t"] >= MM.LOCKDOWN["stand"] + MM.LOCKDOWN["rise"]:
					stays = false
			_:
				var s = p.get("src")
				if s != null and not is_instance_valid(s):
					stays = false
		if stays:
			keep.append(p)
	list = keep
	queue_redraw()


func _on_a_row(p: Dictionary, at: Vector2) -> bool:
	var band: float = MM.LOCKDOWN["band"]
	for ry in p["rx"]:
		if absf(at.y - ry) <= band:
			return true
	for rx in p["ry"]:
		if absf(at.x - rx) <= band:
			return true
	return false


## THE CAGE (action_f1.ts cageHero): a hero who walked from `was` to `now` is kept on his own side of every row of standing
## bars in the room he was in; where that would put him in a wall, he stays where he was.
func cage(was: Vector2, now: Vector2, r: float) -> Vector2:
	var b := now
	for p in list:
		if p["kind"] != "bars" or p["t"] < 0.0 or p["t"] >= MM.LOCKDOWN["stand"]:
			continue
		var room: Dictionary = p["room"]
		if was.x < room["x"] or was.x >= room["x"] + room["w"] or was.y < room["y"] or was.y >= room["y"] + room["h"]:
			continue
		var b0 := b
		for line in p["rx"]:
			b.y = maxf(b.y, line + r) if was.y >= line else minf(b.y, line - r)
		for line in p["ry"]:
			b.x = maxf(b.x, line + r) if was.x >= line else minf(b.x, line - r)
		if b != b0 and not _fits(b, r):
			b = was
	return b


func _fits(at: Vector2, r: float) -> bool:
	var k := r * 0.95
	for c in [Vector2(-k, -k), Vector2(k, -k), Vector2(-k, k), Vector2(k, k)]:
		var t := map.tile(floori(at.x + c.x), floori(at.y + c.y))
		if t != FloorMap.FLOOR and t != FloorMap.PIT:
			return false
	return true


func _room_at(x: float, y: float):
	for r in map.rooms:
		if x >= r["x"] and x < r["x"] + r["w"] and y >= r["y"] and y < r["y"] + r["h"]:
			return r
	return null


# --- drawing: a circle on the floor is an ellipse on the screen ---

func _ring(x: float, y: float, r: float, n := 40) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in n + 1:
		var a := TAU * i / n
		pts.append(Iso.to_screen(x + cos(a) * r, y + sin(a) * r))
	return pts


func _band(a: Vector2, b: Vector2, half: float) -> PackedVector2Array:
	var d := (b - a).normalized()
	var s := Vector2(-d.y, d.x) * half
	return PackedVector2Array([Iso.to_screen((a + s).x, (a + s).y), Iso.to_screen((b + s).x, (b + s).y), Iso.to_screen((b - s).x, (b - s).y), Iso.to_screen((a - s).x, (a - s).y)])


func _draw() -> void:
	for p in list:
		match p["kind"]:
			"warn":
				var k: float = clampf(p["t"] / p["dur"], 0.0, 1.0)
				var ring := _ring(p["x"], p["y"], p["r"])
				draw_colored_polygon(ring, Color(ENEMY, 0.10 + 0.25 * k))
				draw_polyline(ring, Color(ENEMY, 0.9), 2.0)
				if k > 0.02:
					draw_polyline(_ring(p["x"], p["y"], p["r"] * k), Color(ENEMY, 0.7), 2.0)
			"blast":
				var k: float = p["t"] / 0.3
				draw_polyline(_ring(p["x"], p["y"], p["r"] * (0.6 + 0.5 * k)), Color(1, 0.75, 0.8, 1.0 - k), 4.0)
			"lane":
				var k: float = clampf(p["t"] / p["dur"], 0.0, 1.0)
				var a: Vector2 = p["a"]
				var b: Vector2 = p["b"]
				var from := a.lerp(b, p["gone"])
				draw_colored_polygon(_band(from, b, p["half"]), Color(ENEMY, 0.12 + 0.2 * k))
				var edge := _band(from, b, p["half"])
				edge.append(edge[0])
				draw_polyline(edge, Color(ENEMY, 0.85), 2.0)
			"aim":
				var k: float = clampf(p["t"] / p["dur"], 0.0, 1.0)
				var a: Vector2 = p["a"]
				var b: Vector2 = a.lerp(p["b"], k)
				var lift := Vector2(0, -40)
				draw_line(Iso.to_screen(a.x, a.y) + lift, Iso.to_screen(b.x, b.y) + lift, Color(GOLD, 0.5 + 0.5 * k), 2.0)
				draw_line(Iso.to_screen(a.x, a.y), Iso.to_screen(b.x, b.y), Color(GOLD, 0.25), 1.0)
			"rain":
				var t: float = p["t"]
				var R: float = MM.RAIN["radius"]
				var delay: float = MM.RAIN["delay"]
				if t < delay:
					var k := t / delay
					draw_colored_polygon(_ring(p["x"], p["y"], R), Color(GOLD, 0.06 + 0.2 * k))
					draw_polyline(_ring(p["x"], p["y"], R), Color(GOLD, 0.9), 2.0)
					draw_polyline(_ring(p["x"], p["y"], R * (1.0 - k)), Color(GOLD, 0.6), 2.0)
				else:
					var fade := clampf(1.0 - (t - delay - MM.RAIN["stuck"]) / MM.RAIN["gone"], 0.0, 1.0)
					for s in p["sticks"]:
						var at := Iso.to_screen(s.x, s.y)
						draw_line(at, at + Vector2(3, -14), Color(0.8, 0.72, 0.58, fade), 2.0)
			"bars":
				_draw_bars(p)
			"sigil":
				_draw_sigil(p)
			"rime":
				_draw_rime(p)


## The fire sigil (a stand-in for the art chat's pictures, art/action_f2_fx.ts sigilPainted): its ring traced round under the hero as
## the cultist casts, its inner ring and marks brightening; the pillar of fire as it erupts; the floor burning on, shrinking in.
func _draw_sigil(p: Dictionary) -> void:
	var t: float = p["t"]
	var R: float = MM.SIGIL["radius"]
	var fire := Color(1.0, 0.62, 0.22)
	var hot := Color(1.0, 0.98, 0.9)
	if t < 0.0:
		var k := clampf(1.0 - (-t) / maxf(0.01, float(p["cast"])), 0.0, 1.0)
		var traced := clampf(k / 0.4, 0.0, 1.0)
		var ring := _ring(p["x"], p["y"], R, 48)
		var n := maxi(2, int(ring.size() * traced))
		draw_polyline(ring.slice(0, n), Color(ENEMY, 0.85), 3.0)
		draw_colored_polygon(_ring(p["x"], p["y"], R), Color(fire, 0.08 + 0.22 * k))
		if k > 0.4:
			draw_polyline(_ring(p["x"], p["y"], R * 0.62), Color(fire, 0.4 + 0.5 * k), 2.0)
		return
	var pillar: float = MM.SIGIL["pillar"] + MM.SIGIL["fall"]
	if t < pillar:
		var up := 1.0 - clampf((t - MM.SIGIL["pillar"]) / MM.SIGIL["fall"], 0.0, 1.0)
		var base := Iso.to_screen(p["x"], p["y"])
		var half := R * 32.0 * 0.8
		var tall := 200.0 * up
		draw_colored_polygon(PackedVector2Array([base + Vector2(-half, 0), base + Vector2(-half * 0.7, -tall), base + Vector2(half * 0.7, -tall), base + Vector2(half, 0)]), Color(fire, 0.55 * up))
		draw_colored_polygon(PackedVector2Array([base + Vector2(-half * 0.4, 0), base + Vector2(-half * 0.25, -tall * 0.9), base + Vector2(half * 0.25, -tall * 0.9), base + Vector2(half * 0.4, 0)]), Color(hot, 0.7 * up))
	var rr := MM.burn_radius(t)
	if rr > 0.02:
		draw_colored_polygon(_ring(p["x"], p["y"], rr), Color(fire, 0.32))
		draw_polyline(_ring(p["x"], p["y"], rr), Color(ENEMY, 0.7), 2.0)


## The rime (a stand-in for art/action_f2_fx.ts rimePainted): a ragged crust of pale grey-blue frost, spreading, then melting in.
func _draw_rime(p: Dictionary) -> void:
	var t: float = p["t"]
	var pts := PackedVector2Array()
	for k in 40:
		var a := TAU * k / 40.0
		var e := MM.rime_edge(t, a)
		pts.append(Iso.to_screen(p["x"] + cos(a) * e, p["y"] + sin(a) * e))
	if MM.rime_edge(t, 0.0) <= 0.01:
		return
	var frost := Color(0.78, 0.8, 0.9)
	draw_colored_polygon(pts, Color(frost, 0.35))
	pts.append(pts[0])
	draw_polyline(pts, Color(0.62, 0.65, 0.8, 0.8), 2.0)


func _draw_bars(p: Dictionary) -> void:
	var room: Dictionary = p["room"]
	var x0: float = room["x"]
	var x1: float = room["x"] + room["w"]
	var y0: float = room["y"]
	var y1: float = room["y"] + room["h"]
	var t: float = p["t"]
	if t < 0.0:
		# (the bars' shadows across the floor as his keys go up, darker as the crash comes)
		var k := clampf(1.0 + t, 0.0, 1.0)
		var c := Color(SHADOW, 0.25 + 0.5 * k)
		for ry in p["rx"]:
			draw_line(Iso.to_screen(x0, ry), Iso.to_screen(x1, ry), c, 6.0)
		for rx in p["ry"]:
			draw_line(Iso.to_screen(rx, y0), Iso.to_screen(rx, y1), c, 6.0)
		return
	# (standing: iron bars along every row, 52 game pixels tall, sinking away at the end)
	var stand: float = MM.LOCKDOWN["stand"]
	var sink := clampf((t - stand) / MM.LOCKDOWN["rise"], 0.0, 1.0)
	var tall := 104.0 * (1.0 - sink)
	var iron := Color(0.55, 0.52, 0.66)
	var hot := Color(ENEMY, 0.6 * (1.0 - sink))
	for ry in p["rx"]:
		var x := x0 + 0.25
		while x < x1:
			var at := Iso.to_screen(x, ry)
			draw_line(at, at + Vector2(0, -tall), iron, 3.0)
			x += 0.5
		draw_line(Iso.to_screen(x0, ry) + Vector2(0, -tall), Iso.to_screen(x1, ry) + Vector2(0, -tall), hot, 3.0)
	for rx in p["ry"]:
		var y := y0 + 0.25
		while y < y1:
			var at := Iso.to_screen(rx, y)
			draw_line(at, at + Vector2(0, -tall), iron, 3.0)
			y += 0.5
		draw_line(Iso.to_screen(rx, y0) + Vector2(0, -tall), Iso.to_screen(rx, y1) + Vector2(0, -tall), hot, 3.0)
