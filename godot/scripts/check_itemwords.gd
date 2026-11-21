## CHECKS: SPLITTING AND BINDING AT THE WORDSMITH'S BENCH (loot.gd split_piece, bind_pieces; items.ts splitItem, bindItems; the gear
## screen's question, inventory.gd), `--only=itemwords`, in town: a piece of four properties split in two (shared between them,
## each its colour and price by them); two helms bound (its own kept, at least one of the other's, four at most, never two of a
## kind, the other gone); what they refuse (a unique piece, nothing to share, a full bag, two of different kinds); and both done
## on the gear screen as he would (the word pressed, the piece, BIND THEM waiting for the second). A line a step (ITEMWORDS nn).
extends RefCounted

var M
var n := 0
var bad: Array = []
var dir := ""


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("ITEMWORDS %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _props(it: Dictionary) -> Array:
	var out: Array = []
	for a in it.get("props", []):
		out.append_array(a["lines"])
	for im in it.get("imbues", []):
		out.append_array(im["lines"])
	return out


func run(main, _hero, out: String) -> void:
	M = main
	dir = out
	await M.go_to("town", "gate")
	await M._wait(0.5)
	var loot = M.loot
	loot.ring_lit = true
	loot.quest = ""
	loot.taught = true
	loot.level = 20
	loot.derive()
	M.hero.walked = 50.0
	var lv: Dictionary = loot._full_rares["12"]
	var helm: Dictionary = lv["helm"][0].duplicate(true)
	var helm2: Dictionary = lv["helm"][1].duplicate(true)
	var boots: Dictionary = lv["boots"][0].duplicate(true)
	loot.bag = [helm.duplicate(true), helm2.duplicate(true), boots.duplicate(true)]
	loot.words["splitting"] = 3
	loot.words["binding"] = 2
	# --- SPLITTING
	var before := _props(loot.bag[0])
	var why: String = loot.split_piece(0)
	var one: Dictionary = loot.bag[0]
	var two: Dictionary = loot.bag[loot.bag.size() - 1]
	var after: Array = _props(one) + _props(two)
	var same := before.size() == after.size() and before.all(func(l): return after.has(l))
	_line(why == "" and loot.bag.size() == 4 and _props(one).size() == 2 and _props(two).size() == 2 and same and int(loot.words["splitting"]) == 2,
		"SPLITTING a rare helm of four properties (%s): two pieces of two each, the same four shared (%s | %s), the word used" % [", ".join(before), ", ".join(_props(one)), ", ".join(_props(two))])
	_line(int(one["rarity"]) == 1 and int(two["rarity"]) == 1 and str(one["icon"]) == "helm:1" and int(one["value"]) < int(helm["value"]) and int(one["value"]) > 0 and int(one["affixes"]) == 2,
		"each now magic (%d, %d), its blue picture (%s), its price by its two properties (%d against the whole's %d)" % [int(one["rarity"]), int(two["rarity"]), one["icon"], int(one["value"]), int(helm["value"])])
	var mods_ok := true
	for it in [one, two]:
		var count := 0
		for m in it["mods"]:
			count += 1
		mods_ok = mods_ok and count == it.get("imods", []).size() + 2
	_line(mods_ok, "what each gives him is its base's and its two properties', no more (its mods)")
	# (what it refuses: a piece with one property, a unique, a full bag)
	var lone: Dictionary = loot._with_props(helm, [{"a": helm["props"][0]}])
	loot.bag.append(lone)
	var r1: String = loot.split_problem(loot.bag.size() - 1)
	var uniq: Dictionary = helm.duplicate(true)
	uniq["rarity"] = 3
	loot.bag.append(uniq)
	var r2: String = loot.split_problem(loot.bag.size() - 1)
	var keep: Array = loot.bag.duplicate()
	while loot.bag.size() < loot.BAG:
		loot.bag.append(boots.duplicate(true))
	var r3: String = loot.split_problem(1)
	loot.bag = keep
	_line(r1 == "Nothing on it to share between two" and r2 == "A unique piece will not split" and r3 == "No room in your bag for the second piece", "it will not split: one property ('%s'), a unique ('%s'), with the bag full ('%s')" % [r1, r2, r3])
	# --- BINDING
	loot.bag = [helm.duplicate(true), helm2.duplicate(true), boots.duplicate(true)]
	var b0: Array = _props(loot.bag[0])
	var b1: Array = _props(loot.bag[1])
	var r4: String = loot.bind_problem(0, 2)
	var r5: String = loot.bind_problem(0, 0)
	why = loot.bind_pieces(0, 1)
	var made: Dictionary = loot.bag[0]
	var mp := _props(made)
	var groups: Array = loot._props_of(made).map(loot._prop_group)
	var twice := false
	for g in groups:
		twice = twice or groups.count(g) > 1
	var own := mp.filter(func(l): return b0.has(l)).size()
	var theirs := mp.filter(func(l): return b1.has(l) and not b0.has(l)).size()
	_line(why == "" and loot.bag.size() == 2 and mp.size() <= 4 and not twice and own >= 1 and int(loot.words["binding"]) == 1,
		"BINDING two rare helms: one left (bag %d), %d properties (%d its own, %d the other's), never two of a kind (%s): %s" % [loot.bag.size(), mp.size(), own, theirs, groups, ", ".join(mp)])
	_line(r4 == "Only two pieces of the same kind bind" and r5 == "Bind it to another piece", "it will not bind a helm and boots ('%s'), nor a piece to itself ('%s')" % [r4, r5])
	# --- ON THE GEAR SCREEN, as he would
	loot.bag = [helm.duplicate(true), helm2.duplicate(true), boots.duplicate(true)]
	loot.words["splitting"] = 1
	loot.words["binding"] = 1
	var inv = M._inv
	inv.toggle()
	await M._wait(0.3)
	inv._press("tab", "gear")
	inv._press("word", "splitting")
	inv._press("bag", 0)
	await M._wait(0.2)
	await M._snap(dir + "/iw_01_split_asked.png")
	var asked: bool = not inv._pending.is_empty() and inv._pending["word"] == "splitting"
	inv._press("yes", null)
	await M._wait(0.2)
	await M._snap(dir + "/iw_02_split_done.png")
	_line(asked and loot.bag.size() == 4 and int(loot.words.get("splitting", 0)) == 0, "on the gear screen: SPLITTING pressed, then the helm: asked (SPLIT IT); yes: split, the second in the bag (%d pieces)" % loot.bag.size())
	inv._press("word", "binding")
	inv._press("bag", 1)
	await M._wait(0.2)
	var waits: bool = not inv._pending.is_empty() and not inv._pending.has("with")
	await M._snap(dir + "/iw_03_bind_asks_the_second.png")
	inv._press("bag", 0)
	await M._wait(0.2)
	await M._snap(dir + "/iw_04_bind_the_two.png")
	var with_ok: bool = inv._pending.get("with", -1) == 0
	inv._press("yes", null)
	await M._wait(0.2)
	await M._snap(dir + "/iw_05_bound.png")
	_line(waits and with_ok and loot.bag.size() == 3 and int(loot.words.get("binding", 0)) == 0, "BINDING pressed, then a helm: it asks for the second (no BIND THEM yet); the other helm pressed: BIND THEM; yes: bound (%d pieces)" % loot.bag.size())
	inv.toggle()
	print("ITEMWORDS DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])
