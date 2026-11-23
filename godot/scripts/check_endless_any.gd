## ENDLESS ANY LEVEL (his words, 23 Nov 2026: “In endless mode I want multiple chained and stronghold encounters per level.  And I
## want these random encounters, (chained, stronghold, muffled bells, and royal cards) to show up in any level.  So it's more
## random.”): `--only=endlessany`. An endless level of floor 8 (outside the first five and the High City): two or three chained rares,
## each held, well apart; a share of its packs touched by royals, each wearing its crest, one card a pack. The story's floor 8: none of
## either. Pictured.
extends RefCounted

const CR := preload("res://scripts/chained_rare.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("ENDLESSANY %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func _go(where: String) -> void:
	await M.go_to(where, "start")
	await _wait(0.8)
	if M.sight != null:
		M.sight.see_all()


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.loot.ring_lit = true
	M.loot.taught = true
	# THE STORY'S FLOOR 8: neither
	M.in_endless = false
	await _go("floor8")
	var royal0: int = M._monsters.list.filter(func(o): return is_instance_valid(o) and o.royal != "").size()
	_line(M.chained_rares.is_empty() and royal0 == 0, "the story's floor 8: %d chained rares, %d touched by a royal" % [M.chained_rares.size(), royal0])
	# AN ENDLESS LEVEL OF FLOOR 8
	M.endless = 6
	M.endless_floor = 8
	M.in_endless = true
	M.chained_seed = 5
	M.royal_seed = 2
	M.bells_seed = 4
	await _go("floor8")
	var rs: Array = M.chained_rares
	var held: bool = rs.all(func(cr): return is_instance_valid(cr) and cr.held())
	var apart := INF
	for i in rs.size():
		for j in range(i + 1, rs.size()):
			apart = minf(apart, rs[i].m.world.distance_to(rs[j].m.world))
	# (THE CHAINED RARES: the first five floors' own, his word: none on an endless level of floor 8; two or three on one of floor 3)
	_line(rs.is_empty(), "an endless level of floor 8: %d chained rares (theirs are floors 1 to 5's)" % rs.size())
	var touched: Array = M._monsters.list.filter(func(o): return is_instance_valid(o) and o.royal != "")
	var packs := {}
	for o in touched:
		packs[o.pack_id] = o.royal
	_line(touched.size() > 0 and M.loot.royal_floor(), "a share of its packs touched by a royal: %d packs, %d monsters (%s)" % [packs.size(), touched.size(), packs.values()])
	if touched.is_empty():
		print("ENDLESSANY: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
		return
	var o = touched[0]
	var pack: Array = touched.filter(func(q): return q.pack_id == o.pack_id)
	_line(o._crest(), "one of them wears the %s's crest over its head" % o.royal)
	h.world = o.world + Vector2(2.0, 0.5)
	for q in touched:
		if q.pack_id == o.pack_id:
			q.state = "sleep"
	await _wait(0.5)
	await M._snap(dir + "/endless_f8_royal.png")
	var d0: int = M.loot._drops.size()
	for q in pack:
		q.dead = true
		M.loot.on_kill(q)
	var cards: Array = M.loot._drops.slice(d0).filter(func(dd): return dd["kind"] == "card")
	_line(cards.size() == 1, "its pack of %d falls: %d card, the %s's" % [pack.size(), cards.size(), cards[0]["royal"] if cards.size() == 1 else "-"])
	# THE BELLS, made for floor 8 (act2/bells_any.gd): the Muffled Bell asleep, its bells round it, each a piece of its own
	var B = M.bells
	var made: bool = bool(B.D.get("made", false))
	var nb: int = B.D["plan"]["bells"].size() if made else 0
	_line(made and B.phase == "asleep" and nb >= 4 and nb <= 6 and B._pieces.size() == nb + 1, "the Bells made for floor 8: the Muffled Bell asleep (%s), %d bells round it, %d pieces standing" % [B.phase, nb, B._pieces.size()])
	if made:
		var mb: Dictionary = B.D["plan"]["muffled"]
		var at := Vector2(mb["x"], mb["y"])
		h.world = M._spot_near(at, 2.2, h.world)
		for q2 in M._monsters.list:
			if is_instance_valid(q2) and not q2.dead and q2.world.distance_to(at) < 14.0:
				q2.state = "sleep"
		await _wait(0.5)
		await M._snap(dir + "/endless_f8_bells_asleep.png")
		B.struck(at, 1.0)
		await _wait(0.6)
		_line(B.phase == "on" and B.states.all(func(st): return st == 1), "struck: the Hush pours out, every bell awake (%s, %s), the clock %d s" % [B.phase, B.states, int(B.limit)])
		var b0: Dictionary = B.D["plan"]["bells"][0]
		var bat := Vector2(b0["x"], b0["y"])
		h.world = M._spot_near(bat, 1.8, h.world)
		await _wait(0.3)
		B.struck(bat, 1.0)
		await _wait(0.4)
		await M._snap(dir + "/endless_f8_bell_rung.png")
		_line(B.rung[0] and int(B._shown.get("bell0", 0)) >= 2, "a bell struck: rung (%s), its picture swinging (step %d)" % [B.rung[0], int(B._shown.get("bell0", 0))])
	M.bells_seed = -1
	# AN ENDLESS LEVEL OF FLOOR 3: two or three chained rares, well apart
	M.endless_floor = 3
	await _go("floor3")
	var r3: Array = M.chained_rares
	var ap3 := INF
	for i in r3.size():
		for j in range(i + 1, r3.size()):
			ap3 = minf(ap3, r3[i].m.world.distance_to(r3[j].m.world))
	_line(r3.size() >= CR.ENDLESS_N[0] and r3.size() <= CR.ENDLESS_N[1] and r3.all(func(cr): return cr.held()) and (r3.size() < 2 or ap3 >= CR.APART), "an endless level of floor 3: %d chained rares, each held, the nearest two %.1f tiles apart: %s" % [r3.size(), ap3, ", ".join(PackedStringArray(r3.map(func(cr): return "%s carrying %s" % [cr.m.title, cr.bonus])))])
	if not r3.is_empty():
		h.world = r3[0].m.world + Vector2(1.6, 0.6)
		await _wait(0.6)
		await M._snap(dir + "/endless_f3_chained.png")
	M.in_endless = false
	print("ENDLESSANY: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
