## THE RED TROLLS' CHARGE IN THEIR LAIRS ON FLOOR 1 (monster.gd CHARGE_SHORT): `--only=charge`. For each of floor 1's two lair
## guardians, every open spot 2.5 to 4.5 tiles from him in his lair: from how many he could charge, the game's way and now; then
## the hero set at one only the new way allows, the troll woken: he charges within 15 s.
extends RefCounted

const Mon := preload("res://scripts/monster.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("CHARGE %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run(main, hero, _d: String) -> void:
	M = main
	h = hero
	M.go_to("floor1", "start")
	var t := 0.0
	while t < 1.6:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
	h.unhurt = true
	h.walked = 1000.0
	M.loot.taught = true
	var trolls: Array = M._monsters.list.filter(func(o): return is_instance_valid(o) and not o.dead and o.kind == "brute" and o.champion)
	_line(trolls.size() == 2, "floor 1's lair guardians: %d" % trolls.size())
	var spot = null
	var troll = null
	for tr in trolls:
		var old_n := 0
		var new_n := 0
		var all := 0
		for ty in range(floori(tr.world.y) - 5, floori(tr.world.y) + 6):
			for tx in range(floori(tr.world.x) - 5, floori(tr.world.x) + 6):
				var p := Vector2(tx + 0.5, ty + 0.5)
				var d: float = p.distance_to(tr.world)
				if d < 2.5 or d > 4.5 or not M.map.walkable(tx, ty):
					continue
				all += 1
				h.world = p
				Mon.CHARGE_SHORT = false
				var was: bool = d >= 3.5 and not tr._lane(d).is_empty()
				Mon.CHARGE_SHORT = true
				var now: bool = not tr._lane(d).is_empty()
				old_n += 1 if was else 0
				new_n += 1 if now else 0
				if now and not was and spot == null:
					spot = p
					troll = tr
		_line(new_n > old_n, "a guardian at %s: of %d open spots 2.5 to 4.5 tiles off, he could charge from %d the game's way, %d now" % [str(tr.world.round()), all, old_n, new_n])
	if spot == null:
		_line(false, "no spot that only the new way allows")
	else:
		for o in M._monsters.list:
			if is_instance_valid(o) and o != troll and not o.dead:
				o.world = Vector2(-400, -400)
				o.state = "sleep"
				o._place()
		h.world = spot
		M._monsters.wake(troll)
		t = 0.0
		var charged := false
		while t < 15.0 and not charged:
			h.life = h.max_life
			h.world = spot
			await M.get_tree().process_frame
			t += M.get_process_delta_time()
			charged = troll.state == "charge"
		_line(charged, "the hero %.1f tiles off in the lair, his run reaching him but not past: woken, he charges (%.1f s)" % [spot.distance_to(troll.world), t])
	print("CHARGE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
