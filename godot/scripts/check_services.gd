## THE CHECK OF THE TOWN'S OTHER SERVICES (--only=services; main.gd sends it here): in town, come up from floor 5, each used at
## its place there as the game has it: THE STRANGER (ui/trades.ts gambleSide; game.ts gamblePrice, gamble): his kinds, a throw
## paid and its piece in the bag of the kind and the floor's level, refused for want of gold and with the bag full, and 1000
## throws' qualities against the game's odds (TUNE.gambleOdds); THE STASH (game.ts stashItem, unstashItem): a piece put away
## and taken out, the stash full; THE LEXICON (game.ts keepCost, depositWord, withdrawWord; ui/lexicon28.ts its pages): its
## pages, a spare word kept for TUNE.keepCost and the next for twice that, a melded word refused, one taken out. A line a step
## (OK or WRONG), pictures; then the sum, SERVICES.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("SERVICES %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	var inv = M._inv
	await M.go_to("town", "gate")
	await M._wait(0.3)
	M.last_floor = 5
	loot.cleared = 4
	await M.go_to("town", "gate")
	await M._wait(0.8)
	h.walked = 5.0
	loot.ring_lit = true
	loot.quest = ""
	loot.taught = true
	loot.furnace = "done"
	loot.meld_ask = true
	loot.level = 20
	loot.derive()
	loot.bag.clear()
	var at := {}
	for s in M.town.data["stations"]:
		at[s["kind"]] = Vector2(s["x"], s["y"])
	var T: Dictionary = loot._tune

	# --- THE STRANGER
	h.world = M._spot_near(at["stranger"], 1.4, h.world)
	await M._wait(0.5)
	var p0: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.3)
	var kinds: Array = loot.gamble_kinds()
	_line(p0 == "E: Stranger" and inv.visible and inv.svc == "stranger" and kinds.size() == 14,
		"'%s': his half, %d kinds to throw for (%s)" % [p0, kinds.size(), ", ".join(kinds.map(func(k): return k["name"]))])
	# (a throw for a Ring coming up from floor 5: the game's price, its piece a ring of floor 5's level, in the bag)
	var ring := -1
	for k in kinds.size():
		if kinds[k]["name"] == "Ring":
			ring = k
	loot.gold = 0
	inv._press("gm_kind", ring)
	await M._wait(0.2)
	await M._snap(dir + "/s01_stranger_poor.png")
	inv._press("gm_throw", null)
	var poor: String = inv._note
	loot.gold = 1000
	var price: int = loot.gamble_price(ring)
	inv._press("gm_throw", null)
	await M._wait(0.3)
	await M._snap(dir + "/s02_stranger_won.png")
	var it: Dictionary = loot.bag[loot.won] if loot.won >= 0 and loot.won < loot.bag.size() else {}
	_line(poor == "Not enough gold" and price == 129 and loot.gold == 1000 - price and loot.bag.size() == 1 and it.get("slot", "") == "ring" and int(it.get("ilvl", 0)) == 5,
		"a Ring with no gold: '%s'; with 1000: paid %d (the game's coming up from floor 5: 129), %s in the bag (%s, level %d)" % [poor, price, it.get("name", "-"), RARITY[int(it.get("rarity", 0))], int(it.get("ilvl", 0))])
	# (the bag full)
	while loot.bag.size() < loot.BAG:
		loot.bag.append(it.duplicate(true))
	inv._press("gm_throw", null)
	_line(inv._note == "Bag is full" and loot.bag.size() == loot.BAG, "the bag full: '%s'" % inv._note)
	# (1000 throws: their qualities against the game's odds)
	var by := [0, 0, 0]
	loot.gold = 10000000
	for i in 1000:
		loot.bag.clear()
		loot.gamble(ring)
		by[int(loot.bag[0]["rarity"])] += 1
	var odds: Dictionary = T["gambleOdds"]
	var want := [1.0 - float(odds["magic"]) - float(odds["rare"]), float(odds["magic"]), float(odds["rare"])]
	var close := true
	for q in 3:
		close = close and absf(by[q] / 1000.0 - want[q]) < 0.05
	_line(close, "1000 throws: %d plain, %d magic, %d rare (the game's odds %.0f%%, %.0f%%, %.0f%%)" % [by[0], by[1], by[2], want[0] * 100.0, want[1] * 100.0, want[2] * 100.0])
	inv.toggle()

	# --- THE STASH
	loot.bag.clear()
	loot.gold = 1000
	for i in 3:
		loot.gamble(ring)
	h.world = M._spot_near(at["stash"], 1.4, h.world)
	await M._wait(0.5)
	var p1: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.3)
	var first: Dictionary = loot.bag[0]
	inv._press("bag", 0)
	inv._press("bag", 0)
	await M._wait(0.2)
	await M._snap(dir + "/s03_stash.png")
	_line(p1 == "E: Stash" and inv.svc == "stash" and loot.stash[0] == first and loot.stash[1] != null and loot.bag.size() == 1,
		"'%s': two pieces of the bag put away (%s, ...), one left in the bag" % [p1, first.get("name", "-")])
	inv._press("st_take", 0)
	var back: bool = loot.stash[0] == null and loot.bag.size() == 2
	for i in loot.stash.size():
		if loot.stash[i] == null:
			loot.stash[i] = first.duplicate(true)
	inv._press("bag", 0)
	_line(back and inv._note == "Stash is full", "one taken out into the bag again; the stash's %d places full: '%s'" % [loot.stash.size(), inv._note])
	for i in loot.stash.size():
		loot.stash[i] = null
	inv.toggle()

	# --- THE LEXICON
	for k in loot.words.keys():
		loot.words[k] = 0
	loot.words["power"] = 2
	loot.words["fire"] = 1
	loot.words["scald"] = 1
	loot._know("power")["found"] = true
	loot._know("power")["front"] = true
	loot._know("fire")["found"] = true
	loot._know("lasting")["found"] = true
	loot.gold = 500
	h.world = M._spot_near(at["lexicon"], 1.4, h.world)
	await M._wait(0.5)
	var p2: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.3)
	await M._snap(dir + "/s04_lexicon.png")
	_line(p2 == "E: Lexicon" and inv.svc == "lexicon" and inv.lx_sel == "power" and inv.lx_tab == 0,
		"'%s': the book open on its first page, DAMAGE, at POWER" % p2)
	var c0: int = loot.keep_cost()
	inv._press("word", "power")
	inv._press("lx_keep", null)
	var c1: int = loot.keep_cost()
	inv._press("word", "scald")
	inv._press("lx_keep", null)
	var meld_no: String = inv._note
	await M._wait(0.2)
	await M._snap(dir + "/s05_lexicon_kept.png")
	_line(c0 == int(T["keepCost"]) and int(loot.lexicon.get("power", 0)) == 1 and loot.gold == 500 - c0 and c1 == 2 * c0 and meld_no == "The Lexicon keeps no melded word",
		"POWER kept for %d gold (the game's TUNE.keepCost %d), the next %d; SCALD refused: '%s'" % [c0, int(T["keepCost"]), c1, meld_no])
	inv._press("lx_tab", 2)
	await M._wait(0.2)
	await M._snap(dir + "/s06_lexicon_time.png")
	inv._press("lx_kept", "power")
	inv._press("lx_take", null)
	_line(inv.lx_tab == 0 and int(loot.words["power"]) == 2 and not loot.lexicon.has("power"),
		"its third page, TIME (LASTING found); POWER on the shelf pressed, TAKE IT OUT: his again (x%d)" % int(loot.words["power"]))
	inv.toggle()
	print("SERVICES: %d steps of the stranger's gamble, the stash and the Lexicon, %d as the game's%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])


const RARITY := ["plain", "magic", "rare", "unique"]
