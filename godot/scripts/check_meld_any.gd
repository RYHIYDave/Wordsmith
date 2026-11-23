## EVERY TWO LEVEL 1 RUNES MELD (meld_any.gd): `--only=meldany --shots=<dir>`. With the switch on for the check (it stays as it is
## in the game afterwards): the 355 words any two make, each with its stone and its name; the bench melding SWIFT and HEAVY into
## SWIFT-HEAVY (two of SWIFT refused); the named melds kept (POWER and FLAME still ERUPTION); a melded word of any two set in front of
## his Strike, its name, its two words in it (FLAME at three quarters, as in SCALD), no twist, its side's damage place taken; its
## Strike striking a monster on floor 1, which burns; burned into his weapon, one property of each word, each weaker than its
## word's alone; on an altar, its two words; kept in a save. Pictures of the bench, the bag and the Strike's sockets.
extends RefCounted

const Words := preload("res://scripts/words.gd")
const MeldAny := preload("res://scripts/meld_any.gd")
const FoeWords := preload("res://scripts/foe_words.gd")
const Save := preload("res://scripts/save.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("MELDANY %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _clear_moves() -> void:
	for k in 3:
		for s in ["front", "behind"]:
			for j in h.loadout.slots(k, s).size():
				var back: String = h.loadout.take(k, s, j)
				if back != "":
					M.loot.words[back] = int(M.loot.words.get(back, 0)) + 1


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	var inv = M._inv
	var D := Words.data()
	var any: Array = D["melds"]["any"]
	var was: bool = MeldAny.ON
	# --- THE WORDS: one for each pair of the 28 that no named meld is made of, each with its stone (the gear screen's and the HUD's)
	var ids := {}
	for id in any:
		ids[id] = true
	var stones: int = any.filter(func(id): return loot.pics.has("word:" + id)).size()
	var hud: int = any.filter(func(id): return M._hud._data["pics"].has("word:" + id)).size()
	var named: int = (D["melds"]["ten"] + D["melds"]["volt"] + D["melds"]["eight"]).size()
	_line(any.size() == 28 * 27 / 2 - named and ids.size() == any.size() and stones == any.size() and hud == any.size(),
		"%d words of any two (378 pairs of the 28, less the %d named), each its own; %d stones on the gear screen, %d on the HUD" % [any.size(), named, stones, hud])
	var sw: Dictionary = Words.word("swift+heavy")
	_line(sw["name"] == "Swift-Heavy" and sw["front"] == "Swift-Heavy" and sw["behind"] == "of Swiftness and Quakes" and Words.is_meld("swift+heavy"),
		"SWIFT and HEAVY: '%s', in front '%s', behind '%s'; about: %s" % [sw["name"], sw["front"], sw["behind"], sw["about"]])
	# --- THE SWITCH OFF: the game as it was
	MeldAny.ON = false
	var off_of := Words.meld_of("swift", "heavy")
	var off_why := Words.meld_problem("swift", "heavy")
	MeldAny.ON = true
	_line(off_of == "" and off_why != "", "switched off, as the game was: SWIFT and HEAVY make '%s', refused '%s'" % [off_of, off_why])
	# --- THE RULES OF MELDING, switched on
	var r := {
		"swift+heavy": Words.meld_of("swift", "heavy"), "heavy+swift": Words.meld_of("heavy", "swift"),
		"power+fire": Words.meld_of("power", "fire"), "leech+poison": Words.meld_of("leech", "poison"),
		"fire+fire": Words.meld_of("fire", "fire"), "fire+twin": Words.meld_of("twin", "fire"),
	}
	var why := {"swift+swift": Words.meld_problem("swift", "swift"), "swift+heavy": Words.meld_problem("swift", "heavy"),
		"scald+swift": Words.meld_problem("scald", "swift"), "swift+heavy+fire": Words.meld_problem("swift+heavy", "fire")}
	_line(r["swift+heavy"] == "swift+heavy" and r["heavy+swift"] == "swift+heavy" and r["power+fire"] == "eruption" and r["leech+poison"] == "siphon" and r["fire+fire"] == "fire2" and r["fire+twin"] == "fire+twin",
		"made: %s" % str(r))
	_line(why["swift+swift"] == "Only a damage word ranks up" and why["swift+heavy"] == "" and why["scald+swift"] == "A melded word melds no further" and why["swift+heavy+fire"] == "A melded word melds no further",
		"refused: %s" % str(why))
	# --- WHAT ONE DOES ON A MOVE: both its words, a damage word at three quarters (as in SCALD), no twist
	var d := {"str": 30.0, "dex": 30.0, "int": 30.0, "area": 1.0, "aps": 1.0, "cdr": 0.0}
	var ft: Dictionary = Words.resolve("strike", ["fire+twin"], [], d)
	var two: Dictionary = Words.resolve("strike", ["fire", "twin"], [], d)
	var sc: Dictionary = Words.resolve("strike", ["scald"], [], d)
	_line(ft["count"] == 2 and is_equal_approx(ft["count_dmg"], two["count_dmg"]) and is_equal_approx(ft["ignite"], sc["ignite"]) and ft["ignite"] < two["ignite"] and ft["meld"] == null and ft["name"] == "Flame-Twin Strike" and ft["element"] == "fire",
		"'%s': two hits of %.2f each (Twin alone %.2f), burns %.3f (Flame alone %.3f, in SCALD %.3f), fire, twist %s" % [ft["name"], ft["count_dmg"], two["count_dmg"], ft["ignite"], two["ignite"], sc["ignite"], ft["meld"]])
	var bh: Dictionary = Words.resolve("strike", [], ["swift+heavy"], d)
	_line(bh["haste"] > 0.0 and bh["cracks"] > 0.0 and bh["meld_behind"] == null and bh["name"] == "Strike of Swiftness and Quakes",
		"behind: '%s': a burst of speed %.0f%%, cracked ground %.1f s, twist %s" % [bh["name"], bh["haste"], bh["cracks"], bh["meld_behind"]])
	# --- AT THE WORDSMITH: SWIFT and HEAVY melded
	await M.go_to("town", "gate")
	await M._wait(0.8)
	h.walked = 5.0
	loot.ring_lit = true
	loot.quest = ""
	loot.taught = true
	loot.furnace = "done"
	loot.meld = "open"
	loot.level = 20
	loot.derive()
	for k in loot.words.keys():
		loot.words[k] = 0
	_clear_moves()
	for k in loot.words.keys():
		loot.words[k] = 0
	loot.words["swift"] = 2
	loot.words["heavy"] = 1
	for w in ["leech+vast", "fire+twin", "poison+precise", "frost+guarding", "hexing+reaping", "bleeding+surging", "lightning+fleeting", "twin+mirroring"]:
		loot.words[w] = 1
	M.quest610.dust = 3
	h.world = M._spot_near(Vector2(9.5, 14.5), 1.4, h.world)
	inv.open_wordsmith()
	inv._press("ws_tab", null)
	await M._wait(0.3)
	inv._press("word", "swift")
	inv._press("ws_hollow", 0)
	var twice: String = inv._ws_problem("swift")
	inv._press("word", "heavy")
	inv._press("ws_to_meld", null)
	await M._wait(0.3)
	await M._snap(dir + "/a01_swift_heavy_laid.png")
	var laid: Array = inv.meld_in.duplicate()
	var ready: String = inv._ws_why()
	inv._press("ws_meld", null)
	await M._wait(0.4)
	await M._snap(dir + "/a02_swift_heavy_made.png")
	_line(laid == ["swift", "heavy"] and ready == "" and loot.melded.get("word", "") == "swift+heavy" and loot.melded.get("first", false) and int(loot.words.get("swift+heavy", 0)) == 1 and int(loot.words["swift"]) == 1 and int(loot.words["heavy"]) == 0 and M.quest610.dust == 2,
		"SWIFT and HEAVY laid %s ('%s'), melded: %s (a new word %s), SWIFT-HEAVY x%d, SWIFT x%d, HEAVY x%d, runedust %d; SWIFT twice refused: '%s'" % [str(laid), ready, loot.melded.get("word", "-"), loot.melded.get("first", false), int(loot.words.get("swift+heavy", 0)), int(loot.words["swift"]), int(loot.words["heavy"]), M.quest610.dust, twice])
	# --- ON HIS STRIKE: in front, its name; its side's damage place taken; a word already in it refused
	inv._press("close", null)
	await M._wait(0.2)
	inv.toggle()
	inv._press("tab", "attacks")
	await M._wait(0.2)
	inv._press("word", "fire+twin")
	inv._press("slot", [0, "front", 0])
	inv._press("word", "swift+heavy")
	inv._press("slot", [0, "behind", 0])
	var beside_fire: String = h.loadout.problem(0, "front", "fire")
	var beside_power: String = h.loadout.problem(0, "front", "power")
	var beside_twin: String = h.loadout.problem(0, "front", "twin")
	var nm: String = h.loadout.r(0)["name"]
	await M._wait(0.3)
	await M._snap(dir + "/a03_on_his_strike.png")
	_line(h.loadout.slots(0, "front")[0] == "fire+twin" and nm == "Flame-Twin Strike of Swiftness and Quakes" and beside_power == "One damage word per side" and beside_fire == "Already there" and beside_twin == "Already there" and h.loadout.wfronts(0) == ["fire", "twin"],
		"set in his Strike: '%s', its words in the fight %s; POWER beside it '%s' (its side's damage place taken), FLAME '%s', TWIN '%s'" % [nm, str(h.loadout.wfronts(0)), beside_power, beside_fire, beside_twin])
	# --- BURNED INTO HIS WEAPON: one property of each word, each weaker than its word's alone
	var w0: Dictionary = loot.gear["mainhand"]
	var opts: Array = loot.burn_options("leech+vast", w0)
	var alone: Array = loot.imbue_options("leech", w0) + loot.imbue_options("vast", w0)
	print("MELDANY leech's own on his weapon: ", JSON.stringify(loot.imbue_options("leech", w0)[0]["rolls"]).substr(0, 600))
	print("MELDANY in LEECH-VAST: ", JSON.stringify(opts[0]["rolls"]).substr(0, 600) if not opts.is_empty() else "-")
	var no: String = loot.burn("leech+vast", "mainhand")
	var made: Dictionary = loot.burned
	var im: Dictionary = w0["imbues"][w0["imbues"].size() - 1] if not w0.get("imbues", []).is_empty() else {}
	_line(no == "" and opts.size() >= 1 and opts.size() <= 2 and opts.all(func(o): return o.has("also") and o.has("alsoRolls")) and im.get("lines", []).size() == 2,
		"LEECH-VAST burned into his weapon (offered %d: %s; LEECH and VAST alone: %s): it became '%s'" % [opts.size(), " / ".join(PackedStringArray(opts.map(func(o): return o["range"]))), " / ".join(PackedStringArray(alone.map(func(o): return o["range"]))), made.get("text", "-")])
	await M._wait(0.2)
	await M._snap(dir + "/a04_bag_and_burned.png")
	inv.toggle()
	# --- ON AN ALTAR: its two words
	var on_altar: Array = FoeWords.foe_words_of(["swift+heavy", "fire"])
	_line(on_altar == ["swift", "heavy", "fire"] and FoeWords.weight("swift+heavy") == 2, "laid on an altar with FLAME, the monsters carry %s; it counts as %d words" % [str(on_altar), FoeWords.weight("swift+heavy")])
	# --- KEPT IN A SAVE
	var run: Dictionary = Save.run_of(M)
	var kept = JSON.parse_string(JSON.stringify(run))
	var words_back: Dictionary = {}
	for k in loot.words.keys():
		words_back[k] = loot.words[k]
	for k in loot.words.keys():
		loot.words[k] = 0
	Save.restore_run(M, kept)
	_line(int(loot.words.get("fire+twin", 0)) == int(words_back.get("fire+twin", 0)) and int(loot.words.get("poison+precise", 0)) == 1 and h.loadout.slots(0, "front")[0] == "fire+twin",
		"a save and back: POISON-PRECISE x%d kept, his Strike's front %s" % [int(loot.words.get("poison+precise", 0)), str(h.loadout.slots(0, "front"))])
	# --- IN THE FIGHT: his Strike with FLAME-TWIN in front strikes a monster of floor 1; it burns
	await M.go_to("floor1", "start")
	await M._wait(0.8)
	h.unhurt = true
	var foe = null
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and not m.boss:
			foe = m
			break
	var lost := 0.0
	var burning := false
	if foe != null:
		for q in M._monsters.list:
			if is_instance_valid(q) and q != foe and not q.dead and q.world.distance_to(foe.world) < 6.0:
				q.state = "sleep"
		foe.state = "sleep"
		var stand: Vector2 = M._spot_near(foe.world + Vector2(0.9, 0.0), 0.6, foe.world)
		h.world = stand
		h.face = (foe.world - stand).normalized()
		await M._wait(0.2)
		var life0: float = foe.life
		await M._w_strike(h, stand)
		await M._wait(0.25)
		lost = life0 - foe.life
		burning = foe.burn_t > 0.0 or foe.dead
		await M._snap(dir + "/a05_flame_twin_strike.png")
	_line(foe != null and lost > 0.0 and burning, "his FLAME-TWIN Strike on a %s of floor 1: it lost %.0f life, burning %s" % [foe.kind if foe != null else "-", lost, burning])
	# (the stones as the game made them, for the pictures: the sheet and where each lies in it)
	loot.sheet.get_image().save_png(dir + "/stones_sheet.png")
	var at := {}
	for id in any:
		var q: Rect2 = loot.pics["word:" + id]["rect"]
		at[id] = [q.position.x, q.position.y, Words.word(id)["name"]]
	for w in D["ids"]:
		var q: Rect2 = loot.pics["word:" + w]["rect"]
		at[w] = [q.position.x, q.position.y, Words.word(w)["name"]]
	var f := FileAccess.open(dir + "/stones_at.json", FileAccess.WRITE)
	f.store_string(JSON.stringify(at))
	f.close()
	MeldAny.ON = was
	print("MELDANY: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
