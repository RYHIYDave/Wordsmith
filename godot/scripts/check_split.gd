## SPLITTING, EACH ARROW (city_words.gd SPLIT_EACH; defs.ts SPLIT_EACH, his pick of 12 Nov 2026, “Every arrow splits, 21
## (Recommended)”): `--only=split`. A Ranger with Splitting and Twin in front of his Shot (two arrows a use) loosing at a pack: each
## arrow breaks into copies once of its own, two splits a use; with the switch off, one a use, as before.
extends RefCounted

const City := preload("res://scripts/city_words.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("SPLIT %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func _open_line() -> void:
	var at := Vector2i(floori(h.world.x), floori(h.world.y))
	for r in 60:
		for dy in range(-r, r + 1):
			for dx in range(-r, r + 1):
				if maxi(absi(dx), absi(dy)) != r:
					continue
				var c := at + Vector2i(dx, dy)
				var clear := true
				for y in range(-3, 4):
					for x in range(-2, 10):
						if not h.map.open_at(c.x + x, c.y + y):
							clear = false
							break
					if not clear:
						break
				if clear:
					h.world = Vector2(c.x + 0.5, c.y + 0.5)
					h.face = Vector2(1, 0)
					return


func _pack() -> Array:
	var pool: Array = []
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and not o.boss and o.state != "rise":
			pool.append(o)
	pool.sort_custom(func(a, b): return a.world.distance_to(h.world) < b.world.distance_to(h.world))
	for o in pool.slice(5):
		o.world = Vector2(-400, -400)
		o.state = "sleep"
		o.speed = 0.0
		o._cd = 1e9
		o._place()
	var out: Array = []
	var spots := [Vector2(0, 0), Vector2(0.9, 0.9), Vector2(0.9, -0.9), Vector2(1.6, 0.3), Vector2(1.6, -0.4)]
	for k in mini(5, pool.size()):
		var m = pool[k]
		m.world = h.world + Vector2(4.5, 0) + spots[k]
		m._place()
		m.max_life = 1e9
		m.life = m.max_life
		m.speed = 0.0
		m.state = "recover"
		m._t = 1e9
		m._cd = 1e9
		m.words = []
		out.append(m)
	return out


func _shoot(secs: float) -> Array:
	var s0: int = int(M.fx.seen.get("split", 0))
	var u0: int = int(h.uses[0])
	# (asked for every frame: the ask is spent as it is read)
	var t := 0.0
	while t < secs:
		h.auto_attack = true
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	h.auto_attack = false
	await _wait(0.6)
	return [int(M.fx.seen.get("split", 0)) - s0, int(h.uses[0]) - u0]


var _p: Array = []
func _near_life() -> float:
	return _p[0].life if not _p.is_empty() and is_instance_valid(_p[0]) else -1.0


func run(main, hero, _d: String) -> void:
	M = main
	h = hero
	M.go_to("floor5", "start")
	await _wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	M.set_class("ranger", true)
	M.loot.level = 30
	M.loot.ring_lit = true
	M.loot.derive()
	h.unhurt = true
	h.walked = 1000.0
	_open_line()
	_p = _pack()
	h._turn(Vector2(1, 0))
	await _wait(0.5)
	h.loadout.front[0] = ["splitting", "twin"]
	h.loadout._r = [null, null, null]
	var r: Dictionary = h.loadout.r(0)
	_line(float(r["split"]) > 0.0 and int(r["count"]) == 2, "his Shot with Splitting and Twin: %d arrows a use, Splitting %s" % [int(r["count"]), str(r["split"])])
	City.SPLIT_EACH = true
	var on: Array = await _shoot(2.5)
	_line(on[1] > 0 and on[0] == on[1] * 2, "every arrow splits: %d uses, %d splits (two arrows each)" % [on[1], on[0]])
	City.SPLIT_EACH = false
	var off: Array = await _shoot(2.5)
	_line(off[1] > 0 and off[0] == off[1], "the switch off, as before: %d uses, %d splits (the first arrow of each)" % [off[1], off[0]])
	City.SPLIT_EACH = true
	print("SPLIT: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
