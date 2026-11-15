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
			"am_lines", "am_ring", "am_drop", "am_arm":
				# (the Ossuary Amalgamation's, floor 4's boss: at the foot of this file)
				stays = _am_step(p)
			"co_crack", "co_ring", "co_left", "co_aim", "co_reach", "co_flung":
				# (THE CHAINED ONE'S, at the foot of this file)
				stays = _co_stays(p)
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
			"am_lines", "am_ring", "am_drop", "am_arm":
				# (the Ossuary Amalgamation's, floor 4's boss: at the foot of this file)
				_am_draw(p)
			"co_crack", "co_ring", "co_left", "co_aim", "co_reach", "co_flung":
				_draw_co(p)


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


# =============================================================================================
# THE OSSUARY AMALGAMATION'S (floor 4's boss: amalgam.gd): what its moves mark on the floor and leave there (game/bosses.ts
# amActing, stepAmPeril, and stepPerils' 'arm'). Stand-ins for the game's own pictures of them (render/act1_fx/amalgam.ts and
# render/bossfx.ts, from art/amalgam_action_fx.ts). Each carries its own numbers, `n`, as amalgam.gd gives them.
#   am_lines  lines marked on the floor before it while it winds up: its grasping fan's dozen arms, its devour's cone. Drawn
#             from where it stands (they go with it), running out and brightening. Harmless: the blow is its own.
#   am_ring   its weight landing: a ring going out over the floor round where its hands come down, the floor cracked a
#             while. Harmless: what strikes is the skulls and the arms.
#   am_drop   a skull of its bone rain. Its clock runs up to its landing (its 0) and on to its scuff's end: for the last `fly`
#             seconds before it lands its shadow is on the floor, growing, the reach of its burst ringed round it, and the
#             skull comes down out of its niche in the wall; at 0 it bursts, a hero within `r` struck; `mite_at` on, a bone
#             mite pulls itself together there (`form`, amalgam.gd's, is called with the place).
#   am_arm    a hole of arms of the dead. Its crack glows `warn` before; at `hit` the arms burst up, and `up` after a hero
#             within `r` is struck; they claw at the air `time`, sinking back at the last, and the crack fades over `after`.

const AM_BONE := Color(0.94, 0.91, 1.0)
const AM_BONE_DEEP := Color(0.69, 0.64, 0.88)
## (how ragged a crack's six ways are: a share each, the same every time)
const AM_RAG := [0.12, 0.83, 0.41, 0.66, 0.27, 0.95]

var _am_heard := 0.0


## Lines marked on the floor before monster `src`, each [from, to] as (tiles before it, tiles to the left it is drawn with,
## `hand`), for `dur` seconds: run out to their full length over `grow` seconds (0: whole at once, brightening over `dur`);
## `claws`: a claw's three slashes at each line's end once it is out.
func am_lines(src: Object, hand: int, segs: Array, dur: float, grow: float, claws: bool) -> void:
	list.append({"kind": "am_lines", "src": src, "hand": hand, "segs": segs, "t": 0.0, "dur": dur, "grow": grow, "claws": claws})


## The ring of its slam, `r` tiles round (x, y); `n`: {wave, fade, long}.
func am_ring(x: float, y: float, r: float, n: Dictionary) -> void:
	list.append({"kind": "am_ring", "x": x, "y": y, "r": r, "t": 0.0, "n": n})


## A skull of the bone rain that will land at (x, y) `land` seconds from now, falling from its niche at `from`; `which`: its
## own number among the rain's (for its picture, when it has one); `n`: {fly, r, mite_at, scuff, high}; `form`: called with
## where it burst, to make its mite.
func am_drop(x: float, y: float, land: float, dmg: float, from: Vector2, which: int, n: Dictionary, form: Callable) -> void:
	list.append({"kind": "am_drop", "x": x, "y": y, "t": -land, "dmg": dmg, "from": from, "which": which, "n": n, "form": form, "done": 0})


## A hole of arms of the dead at (x, y), bursting up `hit` seconds from now; `n`: {warn, up, r, time, after}.
func am_arm(x: float, y: float, hit: float, dmg: float, n: Dictionary) -> void:
	list.append({"kind": "am_arm", "x": x, "y": y, "t": 0.0, "hit": hit, "dmg": dmg, "n": n, "done": 0})


## A step of one of them (its clock has run on already); false: it is over.
func _am_step(p: Dictionary) -> bool:
	var at := Vector2(p.get("x", 0.0), p.get("y", 0.0))
	match p["kind"]:
		"am_lines":
			# (they are its own: gone with it)
			var s = p["src"]
			return p["t"] < p["dur"] and is_instance_valid(s) and not s.dead
		"am_ring":
			return p["t"] < p["n"]["long"]
		"am_drop":
			var n: Dictionary = p["n"]
			if p["done"] == 0 and p["t"] >= 0.0:
				# (it bursts where it lands)
				p["done"] = 1
				if hero.alive and hero.world.distance_to(at) <= n["r"]:
					hero.hurt(p["dmg"])
				hero.kick(0.6)
				# (heard, but not every skull of a wave at once: they would take every voice there is)
				var now := Time.get_ticks_msec() / 1000.0
				if now - _am_heard >= 0.04:
					_am_heard = now
					sfx.play("hit", -12.0)
			if p["done"] == 1 and p["t"] >= n["mite_at"]:
				p["done"] = 2
				var form: Callable = p["form"]
				if form.is_valid():
					form.call(at)
			return p["t"] < n["scuff"]
		"am_arm":
			var n: Dictionary = p["n"]
			if p["done"] == 0 and p["t"] >= p["hit"] + n["up"]:
				# (the arms are up: whoever stands over them is struck)
				p["done"] = 1
				if hero.alive and hero.world.distance_to(at) <= n["r"]:
					hero.hurt(p["dmg"])
				hero.kick(1.0)
			return p["t"] < p["hit"] + n["time"] + n["after"]
	return false


## A point (tiles before it, tiles to the left it is drawn with) of a figure at `world` facing `f`, on the screen.
func _am_at(world: Vector2, f: Vector2, hand: float, v: Vector2) -> Vector2:
	return Iso.to_screen(world.x + f.x * v.x + f.y * hand * v.y, world.y + f.y * v.x - f.x * hand * v.y)


## An oval on the screen round `c` (picture pixels), closed.
func _am_oval(c: Vector2, rx: float, ry: float, n := 20) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in n + 1:
		var a := TAU * i / n
		pts.append(c + Vector2(cos(a) * rx, sin(a) * ry))
	return pts


func _am_draw(p: Dictionary) -> void:
	var t: float = p["t"]
	match p["kind"]:
		"am_lines":
			var src = p["src"]
			if not is_instance_valid(src):
				return
			var grow: float = p["grow"]
			var k := clampf(t / (grow if grow > 0.0 else float(p["dur"])), 0.0, 1.0)
			var c := Color(GOLD, minf(1.0, 0.25 + 0.75 * k))
			for s in p["segs"]:
				var a: Vector2 = s[0]
				var b: Vector2 = a.lerp(s[1], k) if grow > 0.0 else s[1]
				var pa := _am_at(src.world, src.face, p["hand"], a)
				var pb := _am_at(src.world, src.face, p["hand"], b)
				draw_line(pa, pb, Color(ENEMY, c.a * 0.35), 4.0)
				draw_dashed_line(pa, pb, c, 2.0, 5.0)
				if p["claws"] and k > 0.95:
					for j in [-1.0, 0.0, 1.0]:
						draw_line(pb + Vector2(-6.0 + j * 6.0, -3.0 - j * 2.0), pb + Vector2(6.0 + j * 6.0, 3.0 - j * 2.0), GOLD, 2.0)
		"am_ring":
			var n: Dictionary = p["n"]
			var r: float = p["r"]
			var reach := r * (1.0 - pow(1.0 - clampf(t / n["wave"], 0.0, 1.0), 3.0))
			var a := 1.0 - clampf((t - n["wave"]) / n["fade"], 0.0, 1.0)
			if a > 0.0:
				draw_polyline(_ring(p["x"], p["y"], reach), Color(1, 0.75, 0.8, a), 4.0)
				draw_polyline(_ring(p["x"], p["y"], reach * 0.9), Color(AM_BONE, a * 0.6), 2.0)
			# (the floor cracked round where it landed, fading)
			var left := 1.0 - clampf(t / n["long"], 0.0, 1.0)
			for i in 12:
				var ang := TAU * i / 12.0 + 0.4 * sin(i * 5.3)
				var d := Vector2(cos(ang), sin(ang))
				var from := 0.35 * r
				var to := minf(reach, r * (0.7 + 0.25 * sin(i * 3.1)))
				if to > from:
					draw_line(Iso.to_screen(p["x"] + d.x * from, p["y"] + d.y * from), Iso.to_screen(p["x"] + d.x * to, p["y"] + d.y * to), Color(SHADOW, 0.55 * left), 2.0)
		"am_drop":
			var n: Dictionary = p["n"]
			if t < -n["fly"]:
				return
			var at := Iso.to_screen(p["x"], p["y"])
			if t < 0.0:
				# (its shadow, growing and darkening as it comes down; the reach of its burst ringed round it, filling in)
				var k := clampf(1.0 + t / n["fly"], 0.0, 1.0)
				var rx := 7.0 + 20.0 * k * k
				draw_colored_polygon(_am_oval(at, rx, rx * 0.5), Color(SHADOW, 0.25 + 0.6 * k))
				draw_polyline(_ring(p["x"], p["y"], n["r"]), Color(ENEMY, 0.3 + 0.6 * k), 2.0)
				# (the skull: thrown out of its niche in the wall and in over the floor high, down steep at the last onto its
				# shadow: art/amalgam_action_fx.ts dropAt, its height in game pixels)
				var from: Vector2 = p["from"]
				var w := from.lerp(Vector2(p["x"], p["y"]), 1.0 - pow(1.0 - k, 2.2))
				var z: float = 46.0 * (1.0 - k) + n["high"] * sin(PI * minf(1.0, k * 0.62 + 0.38 * k * k)) * (1.0 - k) + 300.0 * k * (1.0 - k) * (1.0 - k)
				var s := Iso.to_screen(w.x, w.y) - Vector2(0, maxf(0.0, z) * 2.0)
				draw_line(s + Vector2(0, -8), s + Vector2(0, -30), Color(ENEMY, 0.5), 3.0)
				draw_circle(s, 9.0, AM_BONE)
				draw_circle(s + Vector2(-3, 0), 2.0, ENEMY)
				draw_circle(s + Vector2(3, 0), 2.0, ENEMY)
				return
			# (it bursts where it lands: a flash; a band of bone dust out to its reach in 0.12 s, fading; the scuff where it struck)
			var scuff: float = 1.0 - clampf((t - 0.6) / (n["scuff"] - 0.6), 0.0, 1.0)
			draw_colored_polygon(_am_oval(at, 18.0, 8.0), Color(SHADOW, 0.5 * scuff))
			var reach: float = n["r"] * (1.0 - pow(1.0 - clampf(t / 0.12, 0.0, 1.0), 3.0))
			var left := 1.0 - clampf((t - 0.12) / 0.25, 0.0, 1.0)
			if left > 0.0:
				draw_polyline(_ring(p["x"], p["y"], reach), Color(AM_BONE, left), 3.0)
			if t < 0.08:
				draw_circle(at + Vector2(0, -12), 4.0 + 8.0 * (1.0 - t / 0.08), Color(1, 0.97, 0.92, 0.8))
		"am_arm":
			var n: Dictionary = p["n"]
			var u: float = t - float(p["hit"])
			if u < -n["warn"]:
				return
			var at := Iso.to_screen(p["x"], p["y"])
			var stay: float = n["time"]
			# (the floor cracking open there, out every way, its cracks glowing brighter and longer as the arms come; dark round
			# the hole while they are up; fading after: art/boss_shots.ts drawArmCrack)
			var coming: float = 1.0 + u / n["warn"] if u < 0.0 else 1.0
			var fade: float = 1.0 if u < stay else clampf(1.0 - (u - stay) / n["after"], 0.0, 1.0)
			var hot: float = 0.35 + 0.65 * coming if u < 0.0 else clampf(1.0 - u / 0.25, 0.0, 1.0)
			for i in 6:
				var ang: float = TAU * i / 6.0 + 0.7 * AM_RAG[i]
				var long: float = (0.28 + 0.2 * AM_RAG[5 - i]) * (0.35 + 0.65 * coming)
				var tip := Iso.to_screen(p["x"] + cos(ang) * long, p["y"] + sin(ang) * long)
				draw_line(at, tip, Color(GOLD if hot > 0.6 else ENEMY, fade) if hot > 0.1 else Color(SHADOW, 0.8 * fade), 2.0)
			if u < 0.0:
				draw_circle(at, 3.0 + 4.0 * coming, Color(GOLD, 0.25 + 0.35 * coming))
				return
			if u >= stay:
				return
			# (the hole, and four arms of the dead thrust up out of it in 0.15 s, clawing, swaying; sunk back by the end:
			# art/amalgam_action_fx.ts bigArmsPainted)
			var out: float = 1.0 - pow(1.0 - u / 0.15, 2.0) if u < 0.15 else 1.0 - smoothstep(0.0, 1.0, (u - 1.0) / (stay - 0.12 - 1.0))
			draw_colored_polygon(_ring(p["x"], p["y"], 0.35), Color(SHADOW, 0.9))
			draw_polyline(_ring(p["x"], p["y"], 0.35), Color(ENEMY, 0.8), 2.0)
			for k in 4:
				var base := at + Vector2(-12.0 + 8.0 * k, 3.0 * sin(k * 2.0))
				var sway := sin(u * 7.0 + k * 2.1) * 6.0
				var elbow := base + Vector2(sway * 0.5, -34.0 * out)
				var hand := elbow + Vector2(sway + (k - 1.5) * 5.0, -30.0 * out)
				draw_line(base, elbow, AM_BONE_DEEP, 5.0)
				draw_line(elbow, hand, AM_BONE, 4.0)
				draw_circle(hand, 4.0, AM_BONE)


# =====================================================================================================================
# THE CHAINED ONE'S (floor 3's boss: chained.gd, whose numbers these read). What his moves mark on the floor and leave on
# it, ALL DRAWN ONLY: his blows are his own, and his red circles are `mark`, above. (game/bosses.ts CO_CRACK, CO_RING_PERIL
# and the 'left' peril; the game draws them from the art chat's pictures, render/act1_fx/chained.ts and render/bossfx.ts:
# these are stand-ins.)
#   co_crack  his lash's finisher: its lane marked as his fists go up, from half a tile before him to the crack's end, as
#             wide as it strikes; from the blow, the crack running out along it, red-hot, then dark, then closing.
#   co_ring   a ring going out over the floor from a slam (his whirl's, the blow waiting's, the ball's), and the cracks
#             it opens.
#   co_left   what a chain he has broken leaves lying where he stood: his left chain (0), or the ball and its chain (1).
#   co_aim    the line his hook will fly along, run out as he aims it.
#   co_reach  how far his chains will reach, a ring round him as he gathers them for his whirl.
#   co_flung  his hook or his ball out across the room, and the chain to it; the ball's shadow where it will land; the
#             scratch of what he hauls back. chained.gd says where it is at every step of his.

const Chained := preload("res://scripts/chained.gd")
const CO_IRON := Color(0.5, 0.48, 0.6)
const CO_INK := Color(0.05, 0.05, 0.09)
const CO_DUST := Color(0.78, 0.76, 0.86)


## His lash's finisher, from where he stands (`at`) the way he faces (`way`): its lane for `warn` seconds, then the crack.
func co_crack(src: Object, at: Vector2, way: Vector2, warn: float) -> void:
	list.append({"kind": "co_crack", "x": at.x, "y": at.y, "way": way, "t": -warn, "warn": warn, "src": src})


## A ring going out from a slam at (x, y), `r` tiles round.
func co_ring(x: float, y: float, r: float) -> void:
	list.append({"kind": "co_ring", "x": x, "y": y, "r": r, "t": 0.0})


## What a broken chain leaves lying where he stood (`at`, facing `way`, drawn with `hand`): `which` 0 his left chain, 1
## the ball.
func co_left(at: Vector2, way: Vector2, hand: int, which: int) -> void:
	list.append({"kind": "co_left", "x": at.x, "y": at.y, "way": way, "hand": hand, "which": which, "t": 0.0})


## The line his hook will fly along, from `a` to `b`, run out over `dur` seconds.
func co_aim(src: Object, a: Vector2, b: Vector2, dur: float) -> void:
	list.append({"kind": "co_aim", "a": a, "b": b, "t": 0.0, "dur": dur, "src": src})


## How far his chains will reach, `r` round (x, y), for `dur` seconds.
func co_reach(src: Object, x: float, y: float, r: float, dur: float) -> void:
	list.append({"kind": "co_reach", "x": x, "y": y, "r": r, "t": 0.0, "dur": dur, "src": src})


## His hook or his ball (`what`) out across the room now: over the floor at `at`, `high` game pixels up, flying or hauled
## along the floor; its chain from over `hand` (`hand_high` up); `far`, where it bit or will land; `k`, how near to landing
## the ball is (0 to 1).
func co_flung(src: Object, what: String, at: Vector2, high: float, flying: bool, hand: Vector2, hand_high: float, far: Vector2, k: float) -> void:
	var p := {}
	for q in list:
		if q["kind"] == "co_flung" and q.get("src") == src:
			p = q
	if p.is_empty():
		p = {"kind": "co_flung", "t": 0.0, "src": src}
		list.append(p)
	p["what"] = what
	p["at"] = at
	p["high"] = high
	p["flying"] = flying
	p["hand"] = hand
	p["hand_high"] = hand_high
	p["far"] = far
	p["k"] = k


## Whether one of them stays on: each for its own length; what warns of a blow, or is in his hands, goes with him if he falls.
func _co_stays(p: Dictionary) -> bool:
	var s = p.get("src")
	var fell: bool = s != null and (not is_instance_valid(s) or s.dead)
	match p["kind"]:
		"co_crack":
			# (he fell with his fists still up: the blow never came, and its lane goes)
			return p["t"] < Chained.CRACK["long"] and not (fell and p["t"] < 0.0)
		"co_ring":
			return p["t"] < Chained.RING["long"]
		"co_left":
			return true
		"co_aim", "co_reach":
			return p["t"] < p["dur"] and not fell
	return not fell


func _draw_co(p: Dictionary) -> void:
	var t: float = p["t"]
	match p["kind"]:
		"co_crack":
			_draw_co_crack(p, t)
		"co_ring":
			_draw_co_ring(p, t)
		"co_left":
			_draw_co_left(p)
		"co_aim":
			var k := clampf(t / maxf(0.01, float(p["dur"])), 0.0, 1.0)
			var a: Vector2 = p["a"]
			var b: Vector2 = a.lerp(p["b"], clampf(k * 1.4, 0.0, 1.0))
			if a.distance_to(b) > 0.05:
				draw_dashed_line(Iso.to_screen(a.x, a.y), Iso.to_screen(b.x, b.y), Color(ENEMY, 0.3 + 0.6 * k), 2.0, 8.0)
		"co_reach":
			var k := clampf(t / maxf(0.01, float(p["dur"]) - 0.05), 0.0, 1.0)
			draw_polyline(_ring(p["x"], p["y"], p["r"], 64), Color(GOLD, 0.25 + 0.65 * k), 2.0)
		"co_flung":
			_draw_co_flung(p)


func _draw_co_crack(p: Dictionary, t: float) -> void:
	var c: Dictionary = Chained.CRACK
	var from: float = c["from"]
	var to: float = c["to"]
	var half: float = c["half"]
	var o := Vector2(p["x"], p["y"])
	var way: Vector2 = p["way"]
	var side := Vector2(-way.y, way.x)
	if t < 0.0:
		# (its lane, filling from his end as his fists stay up)
		var k := clampf(1.0 + t / maxf(0.01, float(p["warn"])), 0.0, 1.0)
		var lane := _band(o + way * 0.5, o + way * to, half)
		draw_colored_polygon(lane, Color(ENEMY, 0.12))
		if k > 0.02:
			draw_colored_polygon(_band(o + way * 0.5, o + way * lerpf(0.5, to, k), half), Color(ENEMY, 0.22))
		lane.append(lane[0])
		draw_polyline(lane, Color(ENEMY, 0.85), 2.0)
		return
	var reach := Chained.crack_reach(t)
	# (the floor heaved along it as it runs: the enemy's pink at its edges, as wide as it strikes)
	var heave := 1.0 - clampf((t - float(c["run"])) / 0.35, 0.0, 1.0)
	if heave > 0.0:
		for sg in [-1.0, 1.0]:
			var e0: Vector2 = o + way * 0.5 + side * (half * sg)
			var e1: Vector2 = o + way * reach + side * (half * sg)
			draw_line(Iso.to_screen(e0.x, e0.y), Iso.to_screen(e1.x, e1.y), Color(ENEMY, 0.75 * heave), 2.0)
	# (the crack: a jagged split from where his fists came down, as far as it has run; red-hot at first, closing at the last)
	var hot := 1.0 - clampf(t / 0.6, 0.0, 1.0)
	var left := 1.0 - clampf((t - 1.1) / (float(c["long"]) - 1.1), 0.0, 1.0)
	var pts := PackedVector2Array()
	var n := maxi(2, ceili((reach - from) / 0.25))
	for i in n + 1:
		var a := from + (reach - from) * i / n
		var q: Vector2 = o + way * a + side * (0.1 * sin(i * 2.4 + 1.3) if i > 0 and i < n else 0.0)
		pts.append(Iso.to_screen(q.x, q.y))
	draw_polyline(pts, Color(CO_INK, 0.95 * left), 5.0)
	if hot > 0.0:
		draw_polyline(pts, Color(1.0, 0.55, 0.4, hot), 2.0)


func _draw_co_ring(p: Dictionary, t: float) -> void:
	var g: Dictionary = Chained.RING
	var rad: float = p["r"]
	var o := Vector2(p["x"], p["y"])
	var reach := Chained.ring_reach(t, rad)
	# (the cracks it opens, out from its middle: red-hot at first, then dark, gone by its end)
	var hot := 1.0 - clampf(t / 0.45, 0.0, 1.0)
	var left := 1.0 - clampf((t - 1.0) / (float(g["long"]) - 1.0), 0.0, 1.0)
	var n := maxi(7, roundi(5.0 + rad * 2.5))
	for i in n:
		var a := TAU * i / n + 0.4 * sin(i * 12.9898)
		var far := minf(reach, rad * (0.38 + 0.34 * absf(sin(i * 78.233 + 2.0))))
		if far <= 0.25:
			continue
		var way := Vector2(cos(a), sin(a))
		var e0 := Iso.to_screen(o.x + way.x * 0.22, o.y + way.y * 0.22)
		var e1 := Iso.to_screen(o.x + way.x * far, o.y + way.y * far)
		draw_line(e0, e1, Color(CO_INK, 0.85 * left), 3.0)
		if hot > 0.0:
			draw_line(e0, e1, Color(1.0, 0.55, 0.4, 0.9 * hot), 1.0)
	# (the ring going out over the floor, the enemy's pink at its leading edge, breaking up)
	var wave: float = g["wave"]
	var band := 1.0 - clampf((t - wave) / float(g["fade"]), 0.0, 1.0)
	if band > 0.0 and reach > 0.15:
		var ring := _ring(o.x, o.y, reach, 56)
		draw_polyline(ring, Color(CO_DUST, 0.75 * band), 5.0)
		if t <= wave + 0.06:
			draw_polyline(ring, Color(ENEMY, 0.9), 2.0)


func _draw_co_left(p: Dictionary) -> void:
	var o := Vector2(p["x"], p["y"])
	var way: Vector2 = p["way"]
	var hand: int = p["hand"]
	if int(p["which"]) == 0:
		# (his left chain, lying where it fell beside him)
		_co_chain(_co_lying(o, way, hand, Vector2(0.25, 0.7), Vector2(1.05, 1.25)))
		return
	# (the ball where it lay behind him, and its chain run out from where he stood)
	var b := Chained.beside(o, way, hand, -0.87, 0.46)
	_co_chain(_co_lying(o, way, hand, Vector2(-0.15, 0.05), Vector2(-0.75, 0.42)))
	_co_ball(Iso.to_screen(b.x, b.y) + Vector2(0.0, -8.0))


func _draw_co_flung(p: Dictionary) -> void:
	var at: Vector2 = p["at"]
	var far: Vector2 = p["far"]
	var flying: bool = p["flying"]
	var ball: bool = p["what"] == "ball"
	var s := Iso.to_screen(at.x, at.y)
	var end := s + Vector2(0.0, -2.0 * float(p["high"]))
	if ball and flying:
		# (the ball's shadow where it will come down, darker and wider as it nears)
		var k: float = p["k"]
		draw_colored_polygon(_ring(far.x, far.y, 0.13 + 0.27 * k, 20), Color(0.0, 0.0, 0.0, 0.2 + 0.55 * k))
	if not flying and at.distance_to(far) > 0.05:
		# (what he hauls in scrapes the floor: a pale scratch back the way it has come)
		draw_line(s, Iso.to_screen(far.x, far.y), Color(CO_DUST, 0.35), 1.0)
	# (its chain, out from his hand)
	var h: Vector2 = p["hand"]
	var from := Iso.to_screen(h.x, h.y) + Vector2(0.0, -2.0 * float(p["hand_high"]))
	draw_line(from, end, Color(CO_INK, 0.9), 5.0)
	draw_dashed_line(from, end, CO_IRON, 2.0, 4.0)
	if ball:
		_co_ball(end)
		return
	# (the hook: a barbed iron claw)
	var way := (end - from).normalized()
	var across := Vector2(-way.y, way.x)
	draw_line(end - way * 6.0, end + way * 6.0, CO_INK, 5.0)
	draw_line(end + way * 6.0, end + way * 1.0 + across * 6.0, CO_IRON, 3.0)
	draw_line(end + way * 6.0, end + way * 1.0 - across * 6.0, CO_IRON, 3.0)
	draw_line(end - way * 5.0, end + way * 6.0, CO_IRON, 2.0)


## A chain lying on the floor from `a` to `b` (tiles before him, to his left), a little crooked: its points on the screen.
func _co_lying(o: Vector2, way: Vector2, hand: int, a: Vector2, b: Vector2) -> PackedVector2Array:
	var pts := PackedVector2Array()
	for i in 9:
		var u := i / 8.0
		var q := a.lerp(b, u) + Vector2(0.07 * sin(u * 9.0), 0.07 * cos(u * 7.0))
		var w := Chained.beside(o, way, hand, q.x, q.y)
		pts.append(Iso.to_screen(w.x, w.y))
	return pts


## A chain along `pts` (on the screen), in his old iron over a dark seam.
func _co_chain(pts: PackedVector2Array) -> void:
	draw_polyline(pts, Color(CO_INK, 0.9), 5.0)
	for i in pts.size() - 1:
		draw_dashed_line(pts[i], pts[i + 1], CO_IRON, 2.0, 4.0)


## His iron ball, its middle at `at` on the screen.
func _co_ball(at: Vector2) -> void:
	draw_circle(at, 10.0, CO_INK)
	draw_circle(at, 8.5, Color(0.3, 0.29, 0.38))
	draw_circle(at + Vector2(-2.5, -3.0), 2.5, CO_IRON)
