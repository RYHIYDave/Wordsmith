## THE TRAPS (game/traps.ts; game.ts updateHazards, stepSpikes, stepDarts, fireDart; render.ts the floor's holes and plates,
## standHazards), as the game lays them from floor 2 on, in the floor's own pieces (the look's `traps`):
##   A SPIKE FLOOR: its beat, from the level's start and its own phase: down 1.6 s, its holes glinting 0.3 s, up 0.6 s (the
##     spikes snapping up in 0.06 s and sinking over the last 0.15). Each time they rise they strike whatever is on the patch,
##     once: the hero a sixth of his life, before his armour (not while he lunges, nor while nothing can hurt him); every
##     monster but a bat and a boss a sixth of its own. Heard within 9 tiles as they come up.
##   A DART WALL: the hero steps on its plate, and if it is ready it clicks; 0.25 s later the first of three darts leaves the slot
##     in the wall, 0.2 s apart, all at the place where he stood as it clicked (who moves at once is missed); each flies 13 tiles
##     a second, 18 at most, and takes 12% of his life. Ready again 3 s after the click. A monster on it sets nothing off.
extends Node2D

const Iso := preload("res://scripts/iso.gd")
const Arrow := preload("res://scripts/arrow.gd")
const HH := 16.0

const SPIKE := {"down": 1.6, "warn": 0.3, "up": 0.6, "rise": 0.06, "sink": 0.15, "share": 1.0 / 6.0}
const DART := {"count": 3, "gap": 0.2, "first": 0.25, "speed": 13.0, "share": 0.12, "rearm": 3.0, "r": 0.14, "reach": 18.0}
const HERO_R := 0.3

var map
var look
var hero
var monsters
var sfx

var _t := 0.0
var _traps: Array = []  # {spot, hit, was_up, ready, left, next, pressed, aim, spikes: [Sprite2D], k}
var _darts: Array = []  # {pos, dir, left, node}
var _flat: Node2D


func _ready() -> void:
	var T: Dictionary = look.data.get("traps", {})
	for s in map.hazards:
		var z := {"spot": s, "hit": [], "was_up": false, "ready": 0.0, "left": 0, "next": 0.0, "pressed": 0.0, "aim": Vector2.ZERO, "spikes": [], "k": -1}
		if s["kind"] == "spikes":
			for ty in range(int(s["y"]), int(s["y"]) + int(s["h"])):
				for tx in range(int(s["x"]), int(s["x"]) + int(s["w"])):
					for uv in T["spots"]:
						var x := tx + 0.5 + float(uv[0])
						var y := ty + 0.5 + float(uv[1])
						z["spikes"].append([_stand(T["spikes"][0], x, y, x + y), Iso.to_screen(x, y).y, x + y])
		elif s.has("slot"):
			var q: Dictionary = s["slot"]
			var x := float(q["x"]) + 0.5 + float(q["dx"]) * 0.5
			var y := float(q["y"]) + 0.5 + float(q["dy"]) * 0.5
			var sp := _stand(T["slot"]["y"] if int(q["dy"]) != 0 else T["slot"]["x"], x, y, x + y + 4.0 / 64.0)
			sp.visible = true
		_traps.append(z)
	# (the holes and the plates lie flat on the floor, drawn with what lies there)
	_flat = _Flat.new()
	_flat.traps = self
	look.flat_layer.add_child(_flat)


func _stand(key: String, x: float, y: float, d: float) -> Sprite2D:
	var s := Sprite2D.new()
	s.texture = look._sheet
	s.region_enabled = true
	s.centered = false
	look._pic_on(s, key)
	var at := Iso.to_screen(x, y)
	s.position = Vector2(at.x, d * HH)
	s.offset.y += at.y - d * HH
	s.visible = false
	look.stands.add_child(s)
	return s


## Where a spike floor is in its beat (spikeAt): "down", "warn" or "up", and how far through that part (0 to 1).
func _beat(s: Dictionary) -> Array:
	var beat: float = SPIKE["down"] + SPIKE["warn"] + SPIKE["up"]
	var u := fposmod(_t + float(s.get("phase", 0.0)), beat)
	if u < SPIKE["down"]:
		return ["down", u / SPIKE["down"]]
	u -= SPIKE["down"]
	if u < SPIKE["warn"]:
		return ["warn", u / SPIKE["warn"]]
	u -= SPIKE["warn"]
	return ["up", u / SPIKE["up"]]


## How far up its spikes stand (spikeHeight): 0 down, 1 all the way up.
func _height(s: Dictionary) -> float:
	var b := _beat(s)
	if b[0] != "up":
		return 0.0
	var u: float = b[1] * SPIKE["up"]
	if u < SPIKE["rise"]:
		return u / SPIKE["rise"]
	if u > SPIKE["up"] - SPIKE["sink"]:
		return maxf(0.0, (SPIKE["up"] - u) / SPIKE["sink"])
	return 1.0


static func _on(s: Dictionary, at: Vector2) -> bool:
	return at.x >= float(s["x"]) and at.y >= float(s["y"]) and at.x < float(s["x"]) + float(s["w"]) and at.y < float(s["y"]) + float(s["h"])


func _process(dt: float) -> void:
	_t += dt
	var T: Dictionary = look.data["traps"]
	for z in _traps:
		var s: Dictionary = z["spot"]
		if s["kind"] == "spikes":
			_spikes(z, s, T)
		else:
			_plate(z, s, dt)
	_fly(dt)
	_flat.queue_redraw()


func _spikes(z: Dictionary, s: Dictionary, T: Dictionary) -> void:
	var up: bool = _beat(s)[0] == "up"
	if up and not z["was_up"]:
		z["hit"] = []
		var mid := Vector2(float(s["x"]) + float(s["w"]) / 2.0, float(s["y"]) + float(s["h"]) / 2.0)
		if mid.distance_to(hero.world) < 9.0:
			sfx.play("trap_spikes", linear_to_db(0.55))
	z["was_up"] = up
	# (its spikes, so many steps up)
	var k := roundi(_height(s) * int(T["steps"]))
	if k != z["k"]:
		z["k"] = k
		for q in z["spikes"]:
			var sp: Sprite2D = q[0]
			sp.visible = k > 0
			if k > 0:
				look._pic_on(sp, T["spikes"][k - 1])
				sp.offset.y += float(q[1]) - float(q[2]) * HH
	if not up:
		return
	if not z["hit"].has(-1) and hero.alive and hero._act != "lunge" and hero._invuln <= 0.0 and _on(s, hero.world):
		z["hit"].append(-1)
		hero.hurt(hero.max_life * SPIKE["share"], true)
	for m in monsters.list:
		if not is_instance_valid(m) or m.dead or m.kind == "bat" or m.boss or z["hit"].has(m.get_instance_id()) or not _on(s, m.world):
			continue
		z["hit"].append(m.get_instance_id())
		m.hurt(maxf(1.0, roundf(m.max_life * SPIKE["share"])))


func _plate(z: Dictionary, s: Dictionary, dt: float) -> void:
	z["ready"] = maxf(0.0, z["ready"] - dt)
	z["pressed"] = maxf(0.0, z["pressed"] - dt)
	if z["left"] > 0:
		z["next"] -= dt
		if z["next"] <= 0.0:
			if z["left"] == DART["count"]:
				sfx.play("trap_darts", linear_to_db(0.75))
			_fire(z, s)
			z["left"] -= 1
			z["next"] = DART["gap"]
	if z["ready"] > 0.0 or z["left"] > 0 or not hero.alive or not _on(s, hero.world):
		return
	z["left"] = DART["count"]
	z["next"] = DART["first"]
	z["ready"] = DART["rearm"]
	z["pressed"] = 0.6
	z["aim"] = hero.world
	sfx.play("trap_plate", linear_to_db(0.9))


## One dart leaves the slot (slotMouth: just out from the face of its wall), at the place he stood as the plate clicked.
func _fire(z: Dictionary, s: Dictionary) -> void:
	var q: Dictionary = s["slot"]
	var o := Vector2(float(q["x"]) + 0.5 + float(q["dx"]) * 0.62, float(q["y"]) + 0.5 + float(q["dy"]) * 0.62)
	var way: Vector2 = (z["aim"] - o)
	way = way.normalized() if way.length() > 0.001 else Vector2(float(q["dx"]), float(q["dy"]))
	var n := Arrow.new()
	n.dir = way
	n.position = Iso.to_screen(o.x, o.y)
	look.stands.add_child(n)
	_darts.append({"pos": o, "dir": way, "left": DART["reach"], "node": n})
	sfx.play("shot", linear_to_db(0.5))


func _fly(dt: float) -> void:
	var keep: Array = []
	for d in _darts:
		var step: float = DART["speed"] * dt
		d["pos"] += d["dir"] * step
		d["left"] -= step
		var p: Vector2 = d["pos"]
		var gone: bool = d["left"] <= 0.0 or not map.open_at(floori(p.x), floori(p.y))
		if not gone and hero.alive and hero._act != "lunge" and p.distance_to(hero.world) <= DART["r"] + HERO_R:
			hero.hurt(hero.max_life * DART["share"], true)
			gone = true
		if gone:
			d["node"].queue_free()
			continue
		d["node"].position = Iso.to_screen(p.x, p.y)
		keep.append(d)
	_darts = keep


func draw_flat(c: CanvasItem) -> void:
	var T: Dictionary = look.data["traps"]
	for z in _traps:
		var s: Dictionary = z["spot"]
		var key: String
		if s["kind"] == "spikes":
			key = T["holes"][1 if _beat(s)[0] == "warn" else 0]
		else:
			key = T["plate"][1 if z["pressed"] > 0.0 else 0]
		var p: Dictionary = look._pics[key]
		for ty in range(int(s["y"]), int(s["y"]) + int(s["h"])):
			for tx in range(int(s["x"]), int(s["x"]) + int(s["w"])):
				var at := Iso.to_screen(tx + 0.5, ty + 0.5)
				c.draw_texture_rect_region(look._sheet, Rect2(at - p["anchor"], p["rect"].size), p["rect"])


class _Flat extends Node2D:
	var traps

	func _draw() -> void:
		traps.draw_flat(self)
