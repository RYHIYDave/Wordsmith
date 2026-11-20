## THE CHECK OF THE CAMP INSIDE VELLUM'S GATE (--only=camp; main.gd sends it here): his town from floor 10 on (game/camp.ts;
## game.ts campTown, takeWay 'on' from the Fen). He comes in through its city gate from the Fen (floor 10 cleared, nine before
## it), at its mouth; its look the game's own (recorded whole, its ground in blocks loaded only near him), its keepers and its
## three people by the fire among it; each of its services used as the town's (its prompt; the wordsmith's half, his shelf drawn
## from the Fen's words; the others); the kept Meldstone on its round over the wordsmith's slab; its waypoint (to the deepest
## floor the Godot version has: the city's are not in yet); its way on into the city saying so. A line a step (OK or WRONG),
## pictures at the main ones; then the sum, CAMP.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("CAMP %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _near(at: Vector2) -> void:
	h.world = M._spot_near(at, 1.4, h.world)
	await M._wait(0.5)


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	await M.go_to("town", "gate")
	await M._wait(0.3)
	h.walked = 5.0
	loot.ring_lit = true
	loot.quest = ""
	loot.taught = true
	loot.furnace = "done"
	loot.meld_ask = true
	loot.meld = "open"
	loot.level = 20
	loot.derive()
	# (the Fen, nine floors cleared before it: its boss struck dead, its way on taken, in through the city gate: ways.gd, as the
	# descent's check does it, main.gd _descent_shots)
	M.way_depth = 10
	loot.cleared = 9
	await M.go_to("floor10", "down")
	await M._wait(1.3)
	# (his fight is the Colossus's own check's, --only=boss --floor=10; here the Fen's boss fallen, its way on wakes: ways.gd _open)
	var boss = M._d_boss()
	for m in M._monsters.list:
		if is_instance_valid(m) and m.boss:
			m.dead = true
	await M._w_until(func(): return M.ways != null and M.ways.state == "open", 10.0)
	var takes: Array = M.ways.onward_tiles("takes") if M.ways != null else []
	var before: String = M.home_place()
	if not takes.is_empty():
		var i0: int = takes[takes.size() / 2]
		h.world = Vector2(i0 % M.map.w + 0.5, i0 / M.map.w + 0.5)
	await M._w_until(func(): return M.place != "floor10" and not M._going, 4.0)
	await M._wait(1.2)
	_line(before == "town" and M.place == "camp" and M.way_depth >= 11,
		"the Fen's boss fallen (%s), its way on open and taken: his town was %s, now %s (way depth %d)" % [boss.title if boss != null else "-", before, M.place, M.way_depth])
	var look = M.look
	var bk: Vector2i = look.blocks_in() if look != null and look.has_method("blocks_in") else Vector2i(-1, -1)
	var blocks: int = bk.x
	await M._snap(dir + "/c01_in_through_the_gate.png")
	_line(M.place == "camp" and M.home_place() == "camp" and h.world.distance_to(Vector2(13.6, 22.5)) < 0.05 and look != null and blocks > 0,
		"in from the Fen: the camp (%s), his town now; at the gate's mouth (%.1f, %.1f); its look the game's, %d of its ground's %d blocks loaded near him" % [M.place, h.world.x, h.world.y, blocks, bk.y])
	# --- its services
	var at := {}
	for s in M.town.data["stations"]:
		at[s["kind"]] = Vector2(s["x"], s["y"])
	var want := {"wordsmith": "E: Wordsmith", "armourer": "E: Armourer", "mystic": "E: Mystic", "stash": "E: Stash", "lexicon": "E: Lexicon", "stranger": "E: Stranger", "gate": "E: Gate"}
	var got := {}
	for k in want:
		if not at.has(k):
			got[k] = "(none)"
			continue
		await _near(at[k])
		got[k] = M.town.prompt[0]
		if k in ["armourer", "mystic"]:
			await M._snap("%s/c02_%s.png" % [dir, k])
	var all := true
	for k in want:
		# (the mystic's prompt is her task's while one is due: her ask for the Queen's feather, act1/quest610.gd)
		all = all and (got[k] == want[k] or (k == "mystic" and str(got[k]).begins_with("E: Mystic")))
	_line(all, "its services, each where the art wrote its name, used as the town's: %s" % [got])
	# --- the wordsmith: his half, his shelf drawn from the Fen's words (the game's for seed 1, from floor 10 with nine cleared)
	await _near(at["wordsmith"])
	await M._snap(dir + "/c03_the_wordsmith.png")
	await M._key(KEY_E)
	await M._wait(0.4)
	await M._snap(dir + "/c04_his_half.png")
	_line(M._inv.visible and M._inv.wsmith == "trade" and loot.word_stock == ["swift", "twin", "vast"] and loot.word_price() == 2700,
		"the wordsmith: his half (%s), his shelf %s at %d (the game's: swift, twin, vast; 2700)" % [M._inv.wsmith, loot.word_stock, loot.word_price()])
	M._inv.toggle()
	# --- the kept Meldstone, on its round over his slab
	await M._wait(0.3)
	var kept: bool = not M.town._kept.is_empty() and M.town._kept[0].visible
	_line(kept, "the Meldstone his, on its round of the column of light over the wordsmith's slab (%s)" % [M.town._kept[1] if not M.town._kept.is_empty() else "-"])
	# --- the three by the fire, and its fire
	var fire := Vector2.ZERO
	for p in M.town.data["props"]:
		if str(p.get("name", "")) == "the cooking fire":
			fire = Vector2(p["x"], p["y"])
	if fire != Vector2.ZERO:
		await _near(fire)
		await M._wait(0.6)
		await M._snap(dir + "/c05_by_the_fire.png")
	_line(fire != Vector2.ZERO, "the cooking fire at (%.1f, %.1f), its three people talking by it (picture c05)" % [fire.x, fire.y])
	# --- its waypoint: to the deepest floor the Godot version has
	var wy = M._way
	if wy != null:
		h.world = wy.at
		await M._wait(0.5)
	var wp: String = M.prompt()[0]
	_line(wy != null and wy.awake and wp == "E: Waypoint: to dungeon 10", "its waypoint, awake: '%s' (the game's takes him on to the city's floor 11, not in yet: here the deepest he has)" % wp)
	# --- its way on into the city
	var o = M.town.data.get("onward")
	h.world = Vector2(o["x"], o["y"]) if o != null else h.world
	await M._wait(0.5)
	await M._snap(dir + "/c06_the_way_on.png")
	_line(o != null and M.town._told_onward, "its way on into the city, the barricaded street (%.1f, %.1f): it says floor 11 is not in yet" % [o["x"] if o != null else 0.0, o["y"] if o != null else 0.0])
	print("CAMP: %d steps of the camp inside Vellum's gate, %d as the game's%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])
