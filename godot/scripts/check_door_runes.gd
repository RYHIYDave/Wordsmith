## THE RIM'S DOOR: WHAT IS BURNED IN DROPS MORE (his yes, 23 Nov 2026: “Yes”; loot.gd tilt_word): `--only=doorrunes`. Runes drawn
## for drops on an endless level, many times over, with runes burned in at the door: each burned rune three times as likely as any
## other; a meld both its runes three times; a Rank II its rune five times (two of it: the door takes a rune only once, so this is
## the stacking); three laid together each by its own; nothing burned in, nothing changed. Then, at the Rim, Lightning's Rank II,
## Twin and Vast laid on the gate (its page pictured with the line naming them, switched on for the picture) and an endless level
## of floor 8 entered: what its monsters carry is tilted toward them (the rune over each one's head what it leaves).
extends RefCounted

var M
var h
var n := 0
var bad: Array = []
const DRAWS := 60000


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("DOORRUNES %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


## How much likelier each of `which` came than the average of every other rune, over DRAWS runes drawn with `burned` burned in.
func _odds(burned: Array, which: Array) -> Array:
	M.dungeon_words = burned
	var pool: Array = M.loot.words_found_at(M.loot.power())
	var count := {}
	for i in DRAWS:
		var w: String = M.loot.tilt_word(pool.pick_random())
		count[w] = int(count.get(w, 0)) + 1
	var others := 0.0
	var k := 0
	for w in pool:
		if not which.has(w):
			others += float(count.get(w, 0))
			k += 1
	var each := others / maxf(1.0, float(k))
	var out: Array = []
	for w in which:
		out.append(float(count.get(w, 0)) / maxf(1.0, each))
	return out


func _near(x: float, want: float) -> bool:
	return absf(x - want) <= want * 0.12


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.loot.ring_lit = true
	M.loot.taught = true
	M.endless = 6
	M.endless_floor = 8
	M.in_endless = true
	var pool: Array = M.loot.words_found_at(M.loot.power())
	_line(pool.has("lightning") and pool.has("twin") and pool.size() >= 8, "Endless 6 gives %d runes: %s" % [pool.size(), pool])
	var o: Array = _odds([], ["lightning"])
	_line(_near(o[0], 1.0), "nothing burned in: Lightning %.2f times as likely as the rest (1)" % o[0])
	o = _odds(["lightning"], ["lightning"])
	_line(_near(o[0], 3.0), "one Lightning burned in: %.2f times as likely (3)" % o[0])
	o = _odds(["forking"], ["twin", "lightning"])
	_line(_near(o[0], 3.0) and _near(o[1], 3.0), "Forking (Twin + Lightning) burned in: Twin %.2f, Lightning %.2f times (3 each)" % [o[0], o[1]])
	o = _odds(["lightning2"], ["lightning"])
	_line(_near(o[0], 5.0), "Lightning's Rank II burned in: Lightning %.2f times (5, two of it)" % o[0])
	o = _odds(["lightning2", "twin", "vast"], ["lightning", "twin", "vast"])
	_line(_near(o[0], 5.0) and _near(o[1], 3.0) and _near(o[2], 3.0), "Lightning's Rank II, Twin and Vast burned in: Lightning %.2f, Twin %.2f, Vast %.2f times (5, 3, 3)" % [o[0], o[1], o[2]])
	# AT THE RIM: the three laid on the gate as he would lay them, its page pictured with the line naming them
	M.dungeon_words = []
	M.go_to(M.home_place(), "start")
	await _wait(2.0)
	for w in ["lightning2", "twin", "vast"]:
		M.loot.words[w] = int(M.loot.words.get(w, 0)) + 1
	var whys: Array = []
	for w in ["lightning2", "twin", "vast"]:
		whys.append(M.plan_word(w))
	var twice: String = M.plan_word("lightning2")
	_line(M.plan == ["lightning2", "twin", "vast"] and whys == ["", "", ""] and twice != "", "laid on the gate: %s (refused a fourth: '%s')" % [M.plan, twice])
	var Inv = M._inv.get_script()
	Inv.DOOR_ODDS_LINE = true
	M._inv.open_service("gate")
	await _wait(0.3)
	await M._snap(dir + "/door_odds_line.png")
	M._inv.toggle()
	Inv.DOOR_ODDS_LINE = false
	# AN ENDLESS LEVEL OF FLOOR 8 ENTERED WITH THEM BURNED IN: what its monsters carry
	M.enter_endless()
	await _wait(2.0)
	var carried := 0
	var light := 0
	for m in M._monsters.list:
		if not is_instance_valid(m):
			continue
		for w in m.carries:
			carried += 1
			if str(w) in ["lightning", "twin", "vast"]:
				light += 1
	var base := float(carried) * 3.0 / float(pool.size())
	_line(M.dungeon_words == ["lightning2", "twin", "vast"] and M.in_endless and carried > 0, "Endless 6 entered with them burned in (%s): %d runes carried, %d of them Lightning, Twin or Vast (about %.1f if nothing were burned in, %.1f with them)" % [M.dungeon_words, carried, light, base, float(carried) * 11.0 / (float(pool.size()) + 8.0)])
	print("DOORRUNES: %d checks, %d wrong" % [n, bad.size()])
