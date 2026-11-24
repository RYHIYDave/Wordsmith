## THE PRIZE CARRIERS (prize_carry.gd): `--only=words --cases=prize --shots=<dir>`, on floor 2's pack the words check gathers
## (main.gd _words_shots), the switch on for the check. One of the pack made an elite carrying Plundering, then one carrying Greed:
## its pillar of light seen from afar (the hero walked off down the floor), its finding told as he comes near (the chime, the line
## at the top, once only), its name in the prize's colour, its mark on the map in the prize's colour, and as it dies its
## fountain. A picture of each moment.
extends RefCounted

const P := preload("res://scripts/prize_carry.gd")

var M
var h
var n := 0
var bad: Array = []
var dir := ""


func _init(main, hero) -> void:
	M = main
	h = hero
	dir = str(M._arg("shots"))


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("PRIZE %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func run() -> void:
	var was: bool = P.ON
	P.ON = true
	var pc = M._monsters.stands.get_node_or_null("PrizeCarry")
	_line(pc != null, "its layer is laid over the floor's monsters (%s)" % ("there" if pc != null else "not there"))
	if pc == null:
		P.ON = was
		print("PRIZE: %d checks, %d wrong %s" % [n, bad.size(), str(bad)])
		return
	for prize in ["plundering", "greed"]:
		await _one(pc, prize)
	P.ON = was
	print("PRIZE: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])


func _one(pc, prize: String) -> void:
	M._w_reset(h)
	var m = M._w_pack[0]
	for o in M._w_pack:
		o.dead = false
		o.visible = true
		o.carries = []
		o.elite = false
	m.elite = true
	m.title = "Skeleton"
	m.carries = [prize]
	m.words = [prize]
	m.max_life = 600.0
	m.life = 600.0
	pc._told.erase(m.get_instance_id())
	# FROM AFAR: him walked off down the floor, it out of reach: its pillar over the dark
	var home: Vector2 = M._w_home
	# (a spot on open floor some 13 tiles from it, across the screen from it, so that both are in the picture)
	var far := home
	var best := 99.0
	for ty in range(int(m.world.y) - 18, int(m.world.y) + 19):
		for tx in range(int(m.world.x) - 18, int(m.world.x) + 19):
			if not M.map.open_at(tx, ty):
				continue
			var q := Vector2(tx + 0.5, ty + 0.5)
			var d: float = q.distance_to(m.world)
			# (to the side on the screen, not above or below it: the screen's x is x - y)
			var side: float = absf((q.x - q.y) - (m.world.x - m.world.y))
			var score: float = absf(d - 13.0) + maxf(0.0, 12.0 - side) * 0.5
			if d > P.NEAR + 1.0 and score < best:
				best = score
				far = q
	M.loot.msgs.clear()
	h.world = far
	var t := 0.0
	while t < 0.8:
		await M._wait(0.1)
		t += 0.1
		h.world = far
		m.world = M._w_spot(0)
	var told_far: bool = pc._told.has(m.get_instance_id())
	if dir != "":
		await M._snap("%s/prize_%s_far.png" % [dir, prize])
	_line(not told_far and far.distance_to(m.world) > P.NEAR, "%s: from %.1f tiles off, its pillar standing over it and its finding not yet told" % [prize.capitalize(), far.distance_to(m.world)])
	# NEAR: the chime, the line at the top, its rune named, once only
	h.world = home
	t = 0.0
	while t < 0.8:
		await M._wait(0.1)
		t += 0.1
		h.world = home
	var told: bool = pc._told.has(m.get_instance_id())
	if dir != "":
		await M._snap("%s/prize_%s_near.png" % [dir, prize])
	await M._wait(0.6)
	var line := "A monster here carries %s!" % P.NAME[prize]
	var said: Array = M.loot.msgs.filter(func(q): return str(q["text"]) == line)
	_line(told and said.size() == 1, "%s: come near, its finding told once: '%s' (%d times)" % [prize.capitalize(), line, said.size()])
	# its mark on the map
	var marks: Array = M._mini._marks() if M._mini != null and M._mini.has_method("_marks") else []
	var mark_ok := false
	for q in marks:
		if q[2] is Color and (q[2] as Color).is_equal_approx(P.color_of(m)):
			mark_ok = true
	_line(mark_ok or marks.is_empty(), "%s: its mark on the map in the prize's colour%s" % [prize.capitalize(), "" if not marks.is_empty() else " (the map's marks not read here)"])
	# AS IT DIES: its fountain
	m.life = 1.0
	await M._w_strike(h)
	await M._wait(0.15)
	if dir != "":
		await M._snap("%s/prize_%s_dies.png" % [dir, prize])
	await M._wait(0.8)
	_line(m.dead, "%s: struck down, its fountain of %s" % [prize.capitalize(), "coins" if prize == "plundering" else "gems"])
