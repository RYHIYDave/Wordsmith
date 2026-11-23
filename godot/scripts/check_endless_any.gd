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
	await _go("floor8")
	var rs: Array = M.chained_rares
	var held: bool = rs.all(func(cr): return is_instance_valid(cr) and cr.held())
	var apart := INF
	for i in rs.size():
		for j in range(i + 1, rs.size()):
			apart = minf(apart, rs[i].m.world.distance_to(rs[j].m.world))
	_line(rs.size() >= CR.ENDLESS_N[0] and rs.size() <= CR.ENDLESS_N[1] and held, "an endless level of floor 8: %d chained rares, each held (%s): %s" % [rs.size(), held, ", ".join(PackedStringArray(rs.map(func(cr): return "%s carrying %s" % [cr.m.title, cr.bonus])))])
	_line(rs.size() < 2 or apart >= CR.APART, "each well apart: the nearest two %.1f tiles (at least %.0f)" % [apart, CR.APART])
	if not rs.is_empty():
		h.world = rs[0].m.world + Vector2(1.6, 0.6)
		await _wait(0.6)
		await M._snap(dir + "/endless_f8_chained.png")
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
	M.in_endless = false
	print("ENDLESSANY: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
