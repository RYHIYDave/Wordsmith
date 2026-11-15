## THE CHECK OF FLOORS 6 TO 10 BESIDES THEIR FIGHTS (--only=quests610; main.gd sends it here): a hero well on (the ring lit, the
## Meldstone given, level 20) goes through each thing in turn, a picture and a line at each step, and the sum: QUESTS610.
##   THE STRONGHOLDS: on every floor 6 to 10 its strongholds where the game's map-maker lays them and its two guards before each
##     door; floor 6's: the altar used (its screen, a word laid, one refused for its element, a fourth refused, one taken back),
##     the door opened (its seal broken in the look, the altar gone and its tiles floor), in at the door (the hall as it is drawn
##     from in it), each of the five waves up out of its rifts (how many, their words and life as the game spawns them, "Wave k
##     of 5"), the reward (runedust, gear, gold, the muster roll's page) lying and taken, and out by the hallway; on floor 7, words
##     laid on an altar and not burned given back as he leaves the floor.
##   THE QUEST LINE: the mystic's ask in town (her mark, "Speak to the MYSTIC"); the Queen struck dead on floor 7, her feather,
##     the eyrie's scene (bars, the walk, the pan, his line, back); the mark over the waypoint with the feather in hand; the
##     feather given; floor 9, the hunt's line, the Mist Wolf, the Troll Chieftain and the Hollow Stag each dropping its piece,
##     each taken; floor 10, the pillars lit (as the Colossus's fight lights them), a piece set, one broken by blows, the siege
##     broken.
##   FLOOR 9'S SIDE AREAS: the troll camp and the mist wolf's glade, walked to along their ways in from where he comes in, and
##     pictured.
extends RefCounted

const Iso := preload("res://scripts/iso.gd")

var M  # main.gd
var dir := ""
var n := 0
var bad: Array = []


func step(name: String, ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(name)
	await M._snap(dir + "/q%02d_%s.png" % [n, name])
	print("Q610 %02d %s %s: %s" % [n, name, "ok" if ok else "WRONG", what])


func said(begins: String) -> String:
	return M._wu_said(begins)


func run(main, h, d: String) -> void:
	M = main
	dir = d
	var loot = M.loot
	loot.ring_lit = true
	loot.furnace = "done"
	loot.meld = "open"
	loot.level = 20
	loot.taught = true
	loot.derive()
	h.life = h.max_life
	h.loadout.put(0, "front", "power")
	for w in ["power", "frost", "fire", "heavy", "swift", "lightning"]:
		loot.words[w] = int(loot.words.get(w, 0)) + 2
	M.way_depth = 6
	# (well past the first steps: the guide's lessons over)
	h.walked = 100.0
	# (--part=town,holds,queen,pinewood,fen: only those; none, all of it)
	var part: String = M._arg("part")
	var want := func(k: String) -> bool: return part == "" or part.split(",").has(k)
	if want.call("town"):
		await _town_ask(h)
	if want.call("holds"):
		await _holds(h)
	if want.call("queen"):
		await _queen(h)
	if want.call("town"):
		await _town_give(h)
	if want.call("pinewood"):
		if part != "":
			M.quest610.feather = "given"
		await _pinewood(h)
	if want.call("fen"):
		if part != "":
			M.quest610.feather = "given"
			M.quest610.pieces = 7
		await _fen(h)
	print("QUESTS610: %d of %d as the game has them%s" % [n - bad.size(), n, "" if bad.is_empty() else " (wrong: %s)" % ", ".join(bad)])


func _go(where: String) -> void:
	M.go_to(where, "down" if where != "town" else "start")
	await M._w_until(func(): return M.place == where and not M._going, 4.0)
	await M._wait(1.4)


func _at(h, p: Vector2) -> void:
	h.world = M._free_near(p)
	h.home = h.world


# --- the mystic's ask ---

## Set down where the mystic can be used, across her table (town.gd USE).
func _by_mystic(h) -> void:
	var mystic := Vector2(19.5, 13.5)
	h.world = M._spot_near(mystic, 1.4, h.world)
	h.home = h.world


func _town_ask(h) -> void:
	await _go("town")
	var q6 = M.quest610
	_by_mystic(h)
	await M._wait(0.6)
	var b: Dictionary = M.guide.banner(true)
	await step("town_mystic_mark", q6.givers().has("mystic") and b.get("text", "") == "Speak to the MYSTIC", "the gate down the mountain open: the mystic has a task (givers %s); her mark over her; the line \"%s\" / \"%s\"" % [str(q6.givers()), b.get("text", ""), b.get("sub", "")])
	var asked: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.4)
	await step("town_mystic_asks", asked == "E: Mystic: a task" and q6.feather == "asked" and said("The mystic: \"No word") != "", "used (\"%s\"): \"%s\"" % [asked, said("The mystic: \"No word")])


# --- the strongholds ---

func _holds(h) -> void:
	var floors: Array = range(6, 11) if M._arg("floor") == "" else [int(M._arg("floor"))]
	for f in floors:
		await _go("floor%d" % f)
		var H = M.holds
		if H == null:
			await step("f%d_holds" % f, false, "floor %d has no strongholds" % f)
			continue
		var lines: Array = []
		var ok := true
		for q in H.data["holds"]:
			var guards: Array = []
			for m in M._monsters.list:
				if is_instance_valid(m) and _ids(q["guardIds"]).has(m.pack_id):
					guards.append(m)
			var carries := 0
			for g in guards:
				carries += 1 if not g.carries.is_empty() else 0
			var walls: bool = not M.map.walkable(int(q["gx"]), int(q["gy"]) + 1) and not M.map.walkable(int(q["gx"]) - 1, int(q["gy"]) + 1)
			ok = ok and guards.size() == 2 and walls and H.look.has_variant("hold%d" % int(q["n"]))
			lines.append("stronghold %d: its gate at %d,%d, the altar on its two tiles (solid: %s), %d guards (%s), %d carrying a word, its hall %dx%d at %d,%d, its look's state hold%d: %s" % [int(q["n"]), int(q["gx"]), int(q["gy"]), walls, guards.size(), ", ".join(guards.map(func(g): return "%s %s" % [g.rarity, g.kind])), carries, int(q["inside"]["w"]), int(q["inside"]["h"]), int(q["inside"]["x"]), int(q["inside"]["y"]), int(q["n"]), H.look.has_variant("hold%d" % int(q["n"]))])
		var q0: Dictionary = H.data["holds"][0]
		_at(h, Vector2(q0["altar"]["x"], q0["altar"]["y"]) + Vector2(0.4, 1.2))
		await M._wait(0.8)
		await step("f%d_stronghold" % f, ok and H.data["holds"].size() >= 1 and H.data["holds"].size() <= 2, "; ".join(lines))
		if f == 6:
			await _hold_through(h, H)
		elif f == 7:
			# (words laid and not burned go back to him as he leaves the floor)
			var had := int(M.loot.words.get("swift", 0))
			H.lay(0, "swift")
			var laid: int = int(M.loot.words.get("swift", 0))
			await _go("floor8")
			await step("f7_words_back", laid == had - 1 and int(M.loot.words.get("swift", 0)) == had, "a word laid on floor 7's altar (SWIFT %d -> %d), the floor left: given back (%d)" % [had, laid, int(M.loot.words.get("swift", 0))])


func _hold_through(h, H) -> void:
	var q: Dictionary = H.data["holds"][0]
	# (the guards out of the way)
	for m in M._monsters.list:
		if is_instance_valid(m) and _ids(q["guardIds"]).has(m.pack_id):
			m.hurt(1e9)
	await M._wait(0.6)
	var prompt: Array = M.prompt()
	await M._key(KEY_E)
	await M._wait(0.4)
	var inv = M._inv
	await step("f6_altar_opens", str(prompt[0]) == "E: Altar: give words to open the door" and inv.visible and inv.altar == 0, "at the altar: \"%s\"; E opens the gear screen with the altar beside it" % str(prompt[0]))
	var a: String = H.lay(0, "frost")
	var b: String = H.lay(0, "fire")
	var c: String = H.lay(0, "power")
	var dd: String = H.lay(0, "heavy")
	var e: String = H.lay(0, "swift")
	var frost_left := int(M.loot.words["frost"])
	H.take_back(0, 1)
	var back_ok: bool = int(M.loot.words["power"]) == 2 and H.st[0]["words"] == ["frost", "heavy"]
	H.lay(0, "power")
	inv._word = "lightning"
	await M._wait(0.3)
	await step("f6_altar_words", a == "" and b == "One element per stronghold" and c == "" and dd == "" and e == "At most 3 words" and frost_left == 1 and back_ok and H.st[0]["words"] == ["frost", "heavy", "power"],
		"FROST laid; FLAME refused (\"%s\"); POWER, HEAVY laid; SWIFT refused (\"%s\"); POWER taken back and laid again: %s" % [b, e, str(H.st[0]["words"])])
	inv._altar_press("altar_open", null)
	await M._wait(0.6)
	var gx := int(q["gx"])
	var gy := int(q["gy"])
	var free_ok: bool = M.map.walkable(gx, gy + 1) and M.map.walkable(gx - 1, gy + 1)
	await step("f6_door_open", H.st[0]["open"] and not inv.visible and free_ok and said("The altar takes 3 words. The door's seal breaks.") != "" and H.look._shown.has("hold0"),
		"OPEN THE DOOR: \"%s\"; the seal broken and the altar gone (the look's state hold0: %s), its tiles floor: %s; the screen shut" % [said("The altar takes"), H.look._shown.has("hold0"), free_ok])
	# (in at the door)
	h.world = Vector2(gx - 0.5, gy + 0.4)
	await M._w_until(func(): return H.inside == 0 and not H._going, 3.0)
	await M._wait(0.05)
	var W1: Dictionary = q["waves"][0]
	var more := (1.0 + 0.25 * 2.0)
	await M._wait(0.35)
	await step("f6_hall_rifts", H.inside == 0 and H._risers.size() > 0 and H.st[0]["wave"] == 1, "in at the door: at the far end of the hall's hallway (%.1f, %.1f), the hall as it is drawn from in it; wave 1 coming up out of its rifts (%d coming)" % [h.world.x, h.world.y, H._risers.size()])
	# (kept in the hall, its middle, whatever knocks him about: not out by its threshold)
	var mid := Vector2(q["fight"]["x"], q["fight"]["y"]) + Vector2(0, 2.5)
	h.world = mid
	h.home = mid
	await M._w_until(func(): return H._risers.is_empty(), 4.0)
	await M._wait(0.3)
	var come: Array = _of(H.st[0]["packs"])
	var life_ok: bool = come.size() == W1["monsters"].size()
	for i in mini(come.size(), W1["monsters"].size()):
		var m0: Dictionary = W1["monsters"][i]
		var m = _by_id(come, int(m0["id"]))
		if m == null or absf(m.max_life - roundf(float(m0["maxLife"]) * more)) > 0.5 or not (m.words.has("frost") and m.words.has("heavy") and m.words.has("power")):
			life_ok = false
	await step("f6_wave1", life_ok, "wave 1: %d of the game's %d (%s), each with FROST, HEAVY and POWER and its life x%.2f" % [come.size(), W1["monsters"].size(), ", ".join(come.map(func(m): return m.kind)), more])
	for k in range(2, 6):
		h.world = mid
		for m in _of(H.st[0]["packs"]):
			m.hurt(1e9)
		await M._w_until(func(): return int(H.st[0]["wave"]) == k, 5.0)
		await M._wait(0.25)
		var Wk: Dictionary = q["waves"][k - 1]
		await M._w_until(func(): return H._risers.is_empty(), 4.0)
		var got := _of(H.st[0]["packs"])
		var mk := more * (1.0 + 0.15 * (k - 1))
		var lk: bool = got.size() == Wk["monsters"].size()
		for m in got:
			for m0 in Wk["monsters"]:
				if int(m0["id"]) == m.id and absf(m.max_life - roundf(float(m0["maxLife"]) * mk)) > 0.5:
					lk = false
		var line := said("Wave %d of 5" % k)
		await step("f6_wave%d" % k, lk and line != "", "\"%s\": %d of the game's %d (%s), life x%.3f" % [line, got.size(), Wk["monsters"].size(), ", ".join(got.map(func(m): return "%s%s" % [m.kind, " (" + m.rarity + ")" if m.rarity != "" else ""])), mk])
	for m in _of(H.st[0]["packs"]):
		m.hurt(1e9)
	await M._w_until(func(): return H.st[0]["won"], 3.0)
	var falls := said("The stronghold falls.")
	await M._wait(0.15)
	var q6 = M.quest610
	var things: Array = q6._things.map(func(t): return "%s %d" % [t["what"], int(t["n"])])
	var gear := 0
	for dr in M.loot._drops:
		if dr["kind"] == "gear":
			gear += 1
	await step("f6_won", H.st[0]["won"] and falls != "" and things.has("dust 9") and things.has("roll 0") and gear >= 6,
		"the last wave dead: \"%s\"; lying: %s, %d pieces of gear" % [falls, ", ".join(things), gear])
	var dust0: int = q6.dust
	_at(h, Vector2(q["fight"]["x"], q["fight"]["y"]) + Vector2(0.6, 0.6))
	await M._wait(0.25)
	await step("f6_reward_taken", q6.dust == dust0 + 9 and q6.roll_pages == 1, "walked to: +9 RUNEDUST, whirling into him (runedust %d), and the muster roll's page (%d of 3)" % [q6.dust, q6.roll_pages])
	M.loot.gear = M.loot.gear
	inv.toggle()
	await M._wait(0.3)
	await step("f6_runedust_shown", inv.visible, "the gear screen: the runedust carried beside the gold (%d)" % q6.dust)
	inv.toggle()
	# (out by the hallway's threshold)
	var r: Dictionary = q["way"]
	h.world = Vector2(float(r["x"]) + float(r["w"]) / 2.0, float(r["y"]) + float(r["h"]) - 0.3)
	await M._w_until(func(): return H.inside == -1 and not H._going, 3.0)
	await M._wait(0.6)
	await step("f6_out", H.inside == -1 and h.world.distance_to(Vector2(gx - 1.5, gy + 1.5)) < 0.6, "out by the hallway: before the door (%.1f, %.1f), the open ground drawn again" % [h.world.x, h.world.y])


func _ids(a: Array) -> Array:
	return a.map(func(x): return int(x))


func _of(packs: Array) -> Array:
	var out: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and packs.has(m.pack_id):
			out.append(m)
	return out


func _by_id(list: Array, id: int):
	for m in list:
		if m.id == id:
			return m
	return null


# --- the Queen, her feather, the eyrie's scene ---

func _queen(h) -> void:
	await _go("floor7")
	var q6 = M.quest610
	var boss = M._d_boss()
	_at(h, boss.world + Vector2(2.5, 2.5))
	await M._wait(1.0)
	await M._d_kill(boss)
	await M._wait(0.3)
	await step("f7_feather", q6.feather == "got" and said("You pluck the Queen's FEATHER.") != "" and not q6.scene.is_empty(), "the Queen struck dead: \"%s\"; the eyrie's scene begun (%s)" % [said("You pluck"), q6.scene.get("phase", "-")])
	await M._w_until(func(): return q6.scene.get("phase", "") == "walk", 4.0)
	await M._wait(0.8)
	await step("f7_scene_walk", q6.scene.get("phase", "") == "walk" and not M._hud.visible and q6._bar_rects[0].size.y > 10.0, "the bars in, the buttons gone; he is walked to the edge (%.1f, %.1f, to %.1f, %.1f)" % [h.world.x, h.world.y, q6.scene["to"].x, q6.scene["to"].y])
	await M._w_until(func(): return q6.scene.get("phase", "") == "out" or q6.scene.is_empty(), 5.0)
	await M._wait(0.8)
	await step("f7_scene_pan", q6.scene.get("phase", "") == "out" and absf(h.lean.x) > 10.0, "at the edge, turned to the drop: the picture panning out over it (%.0f picture pixels)" % h.lean.x)
	await M._w_until(func(): return q6.scene.get("said", false), 4.0)
	await M._wait(0.6)
	await step("f7_scene_town", q6.scene.get("phase", "") == "hold" and q6.scene.get("said", false), "held on the town far below under the dome: \"%s\"" % q6.T["eyrie"])
	await M._w_until(func(): return q6.scene.is_empty(), 6.0)
	await M._wait(0.4)
	await step("f7_scene_done", q6.scene.is_empty() and q6.city_seen and M._hud.visible and h.lean == Vector2.ZERO, "the picture back, the bars out, the buttons back; the town seen (%s)" % q6.city_seen)
	# (the mark over the waypoint home while he brings the feather back)
	var w: Dictionary = M.look.data["waypoint"] if M.look != null and M.look.data.has("waypoint") else {"wx": M.map.waypoint["x"], "wy": M.map.waypoint["y"]}
	_at(h, Vector2(w["wx"], w["wy"]) + Vector2(2.0, 2.0))
	M.sight.see_all()
	await M._wait(0.8)
	await step("f7_waypoint_mark", q6.turn_in_for() == "mystic", "the feather in hand: the mark over the waypoint home (for %s)" % q6.turn_in_for())


func _town_give(h) -> void:
	await _go("town")
	var q6 = M.quest610
	var b: Dictionary = M.guide.banner(true)
	_by_mystic(h)
	await M._wait(0.6)
	var giving: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.4)
	await step("town_feather_given", b.get("text", "") == "Return to the MYSTIC" and giving == "E: Mystic: the Queen's feather" and q6.feather == "given" and said("The mystic: \"A dome") != "", "the line \"%s\"; \"%s\": \"%s\"" % [b.get("text", ""), giving, said("The mystic: \"A dome")])


# --- the Pinewood: the side areas, the pieces ---

func _pinewood(h) -> void:
	await _go("floor9")
	var q6 = M.quest610
	var carriers: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and m.has_meta("piece"):
			carriers.append("%s %d" % [m.kind, int(m.get_meta("piece"))])
	# (the line at the top waits behind the floor's name across the screen)
	await M._w_until(func(): return M._hud.floor_card.is_empty(), 8.0)
	await M._wait(0.3)
	var b: Dictionary = M.guide.banner(true)
	var lines: Array = b.get("lines", [])
	await step("f9_hunt", carriers.size() == 3 and lines.size() == 3 and said("The Mist Wolf, the Troll Chieftain and the Hollow Stag carry") != "", "come into the Pinewood after the ward-stone: %s carry the pieces; the line: %s" % [", ".join(carriers), ", ".join(lines.map(func(l): return "%s %s" % [l["how"], l["what"]]))])
	# THE SIDE AREAS: the camp and the glade, each walked to from where he comes in
	var land = M.map.land
	for role in ["lair", "side"]:
		for a in land["areas"]:
			if a["role"] != role:
				continue
			var mid := Vector2(a["blob"]["x"], a["blob"]["y"])
			var walks := _walks(M.map.start, M._free_near(mid))
			_at(h, mid + Vector2(1.5, 2.5))
			M.sight.see_all()
			await M._wait(1.2)
			await step("f9_%s" % ("troll_camp" if role == "lair" else "mist_glade"), walks, "%s: walked to along its way in from where he comes in (%s), its things as the floor's look draws them" % ["the Troll Chieftain's camp" if role == "lair" else "the Mist Wolf's glade", walks])
	for kind in ["mistwolf", "warchief", "stag"]:
		var m = null
		for o in M._monsters.list:
			if is_instance_valid(o) and o.kind == kind and not o.dead:
				m = o
		if m == null:
			await step("f9_%s" % kind, false, "no %s" % kind)
			continue
		_at(h, m.world + Vector2(3.0, 3.0))
		await M._wait(0.5)
		var had: int = q6.taken()
		await M._d_kill(m)
		await M._wait(0.6)
		var lying: int = q6._things.filter(func(t): return t["what"] == "piece").size()
		var bb: Dictionary = M.guide.banner(true)
		var ticks: Array = bb.get("lines", []).map(func(l): return l["done"])
		# (lying where it fell, or, where it fell near him, already come to him and taken)
		await step("f9_%s_falls" % kind, lying == 1 or q6.taken() == had + 1, "%s struck dead: a piece of the ward-stone where it fell (%s); the line's ticks %s" % [m.title, "lying" if lying == 1 else "come to him already", str(ticks)])
		for t in q6._things:
			if t["what"] == "piece":
				_at(h, t["at"] + Vector2(0.5, 0.5))
		await M._w_until(func(): return q6.taken() > had, 3.0)
		await M._wait(0.3)
		var line := said("You take a piece of the WARD-STONE (%d of 3)." % (had + 1))
		await step("f9_%s_piece" % kind, q6.taken() == had + 1 and line != "", "taken: \"%s\"%s" % [line, (" / \"%s\"" % said("All three pieces")) if q6.taken() == 3 else ""])


## Can a body walk from `a` to `b` on the floor (the walk grid, its eight ways)?
func _walks(a: Vector2, b: Vector2) -> bool:
	var map = M.map
	var start: int = floori(a.y) * map.w + floori(a.x)
	var goal: int = floori(b.y) * map.w + floori(b.x)
	var seen := PackedByteArray()
	seen.resize(map.w * map.h)
	var q := [start]
	seen[start] = 1
	var i := 0
	while i < q.size():
		var c: int = q[i]
		i += 1
		if c == goal:
			return true
		var x: int = c % map.w
		var y: int = c / map.w
		for d in [[1, 0], [-1, 0], [0, 1], [0, -1]]:
			var nx: int = x + d[0]
			var ny: int = y + d[1]
			if nx < 0 or ny < 0 or nx >= map.w or ny >= map.h:
				continue
			var j: int = ny * map.w + nx
			if seen[j] == 0 and map.walkable(nx, ny):
				seen[j] = 1
				q.append(j)
	return false


# --- the Fen: the pillars ---

func _fen(h) -> void:
	await _go("floor10")
	var q6 = M.quest610
	var P = q6.pillars
	if P == null:
		await step("f10_pillars", false, "no pillars on floor 10")
		return
	h.world = Vector2(P.at[0]["x"], P.at[0]["y"]) + Vector2(1.0, 0.8)
	M.sight.see_all()
	P.light_at()
	await M._wait(0.5)
	await step("f10_pillars_lit", P.burning() == 3 and P.shields() and said("The cult's three obelisks blaze with the siege.") != "", "his third phase begun (the Colossus's fight's call): the three blaze: \"%s\"" % said("The cult's three obelisks"))
	var i: int = P.near()
	var prompt: Array = M.prompt()
	await M._key(KEY_E)
	await M._wait(0.4)
	await step("f10_piece_set", P.burning() == 2 and P.in_hand() == 2 and said("The ward-stone piece flares, and the obelisk goes dark. 2 still burn.") != "" and i >= 0, "beside one, \"%s\": E sets a piece: \"%s\"" % [str(prompt[0]), said("The ward-stone piece flares")])
	var p1: Dictionary = P.pillars[1]
	for k in 12:
		P.struck(Vector2(p1["x"], p1["y"]), 0.5)
		await M._wait(0.32)
	await step("f10_broken", not p1["lit"] and p1["by"] == "blows" and said("The obelisk cracks and goes dark. 1 still burns.") != "", "twelve blows at another's foot: \"%s\"" % said("The obelisk cracks"))
	h.world = Vector2(P.pillars[2]["x"], P.pillars[2]["y"]) + Vector2(1.0, 0.8)
	await M._wait(0.2)
	P.set_piece(P.near())
	await M._wait(0.4)
	await step("f10_siege_broken", P.siege_broken() and not P.shields() and said("THE SIEGE IS BROKEN.") != "", "the last set: \"%s\"" % said("THE SIEGE IS BROKEN."))
