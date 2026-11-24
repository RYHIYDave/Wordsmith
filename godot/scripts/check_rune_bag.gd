## THE RUNE BAG AND THE MELDING STONE, checked and pictured (inventory.gd RUNE_BAG, rune_bag.gd, meld_stone.gd):
##   godot --path godot -- --only=runebag --shots=<dir>
## A hero deep in the game (most base runes, many melds, Scald not yet found), in town: the gear screen, RUNES pressed; the bag
## by group, a search, the melds MADE WITH FROST, a rune's card opened by holding it, the scroll bar's bubble, a rune pressed
## then a slot, a rune carried sideways to a slot; at the wordsmith, the stone, Flame laid in (the bag lighting what melds with
## it), Frost laid in, MELD and the meld played out, the new rune taken into the bag, and two of Power ranked up.
extends RefCounted

const Words := preload("res://scripts/words.gd")
const Melds52 := preload("res://scripts/melds52.gd")

var M
var h
var inv
var rb
var ok := 0
var bad := 0


func _line(good: bool, what: String) -> void:
	if good:
		ok += 1
	else:
		bad += 1
	print(("  ok  " if good else "  !!  ") + what)


func _snap(dir: String, name: String) -> void:
	if dir != "":
		await M._snap(dir + "/" + name + ".png")


func _ids(sec: Array) -> Array:
	var out: Array = []
	for s in sec:
		out.append_array(s["ids"])
	return out


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	inv = M._inv
	rb = inv._rb
	var loot = M.loot
	var smith := Vector2(9.5, 14.5)
	await M.go_to("town", "gate")
	await M._wait(0.8)
	h.walked = 5.0
	loot.ring_lit = true
	loot.quest = ""
	loot.taught = true
	loot.furnace = "done"
	loot.meld_ask = true
	loot.meld = "open"
	loot.level = 31
	loot.derive()
	M.quest610.dust = 9
	# the runes he holds: every base rune two to five times, about three melds in five, a few ranks; Scald, Wildfire, Hailstorm and
	# Flame II not had (to be found)
	seed(7)
	var leave := ["scald", "wildfire", "hailstorm", "fire2", "frost2"]
	for w in loot.words.keys():
		loot.words[w] = 0
	for w in Words.ids():
		loot.words[w] = 2 + randi() % 4
	var melds: Array = Words.made() + Melds52.T()["order"]
	for w in melds:
		if leave.has(w):
			continue
		if Words.is_rank(w):
			loot.words[w] = 1 if randf() < 0.5 else 0
		else:
			loot.words[w] = (1 + randi() % 3) if randf() < 0.6 else 0
	for w in leave:
		loot.known.erase(w)
	h.world = M._spot_near(smith, 1.4, h.world)
	await M._wait(0.4)
	var held: Array = loot.held()
	print("RUNE BAG: %d runes held" % held.size())
	# --- the gear screen, RUNES pressed: the bag over the game's half
	inv.toggle()
	inv._press("tab", "attacks")
	await M._wait(0.3)
	_line(inv._lex_r.has_area(), "RUNES under the gold and the level")
	inv._press("lex", null)
	await M._wait(0.5)
	await _snap(dir, "r01_bag_by_group")
	var counts := {}
	for w in rb.held_ids():
		counts[rb.group_of(w)] = int(counts.get(rb.group_of(w), 0)) + 1
	var secs: Array = rb._sections()
	var titles: Array = secs.map(func(s): return s["title"])
	_line(inv._rb_on == "game" and _ids(secs).size() == held.size() and titles == ["DAMAGE", "STRIKE", "TIME", "CONTROL", "SPOILS", "MELDS"].filter(func(t): return counts.has(t)),
		"the bag over the game's half (%s): every rune held in it, %d of %d, in sections %s" % [inv._rb_on, _ids(secs).size(), held.size(), str(titles)])
	_line(rb.group_of("fire2") == "DAMAGE" and rb.group_of("twin2") == "STRIKE" and rb.group_of("eruption") == "MELDS" and rb.group_of("plundering") == "SPOILS",
		"a rank in its rune's group (Flame II %s, Twin II %s), a meld in MELDS (%s), Plundering in SPOILS (%s)" % [rb.group_of("fire2"), rb.group_of("twin2"), rb.group_of("eruption"), rb.group_of("plundering")])
	# --- the search
	rb._typed("frost")
	await M._wait(0.3)
	await _snap(dir, "r02_search_frost")
	secs = rb._sections()
	var named: Array = secs[0]["ids"] if not secs.is_empty() and secs[0]["title"] == "NAMED" else []
	var with: Array = []
	for s in secs:
		if str(s["title"]).begins_with("MADE WITH"):
			with = s["ids"]
	_line(named.has("frost") and not with.is_empty() and with.all(func(w): return Words.parts_of(w).has("frost")),
		"'frost': named %s; made with Frost %d (%s...)" % [str(named), with.size(), str(with.slice(0, 4))])
	rb._typed("")
	# --- MELDS, made with Frost
	rb.group = "MELDS"
	rb.made = ["frost"]
	rb.reset()
	await M._wait(0.3)
	await _snap(dir, "r03_melds_made_with_frost")
	var mw := _ids(rb._sections())
	_line(not mw.is_empty() and mw.all(func(w): return Words.is_meld(w) and Words.parts_of(w).has("frost")), "MELDS MADE WITH FROST: %d, every one made with Frost" % mw.size())
	rb.made = ["frost", "power"]
	rb.reset()
	mw = _ids(rb._sections())
	_line(mw == (["avalanche"] if int(loot.words.get("avalanche", 0)) > 0 else []), "and with Power: %s (Avalanche, if held)" % str(mw))
	rb.group = "ALL"
	rb.made = []
	rb.reset()
	# --- a rune's card, by holding it (the pointer pressed and held still)
	await M._wait(0.2)
	var hold_w: String = "frost"
	var at: Vector2 = rb.tile_at(hold_w) + Vector2(12, 12) * 2.0
	inv._pressed(at)
	await M._wait(0.25)
	await _snap(dir, "r04_holding")
	await M._wait(0.35)
	inv._released(at)
	await M._wait(0.25)
	await _snap(dir, "r05_card")
	_line(rb.card == hold_w, "FROST pressed and held: its card (%s)" % rb.card)
	var meld_w := ""
	for w in rb.held_ids():
		if Words.is_meld(w) and Melds52.is_new(w):
			meld_w = w
			break
	rb.open_card(meld_w)
	await M._wait(0.3)
	await _snap(dir, "r06_card_meld")
	rb.card = ""
	# --- the scroll bar held: the whole bag at once, its bubble
	rb.sort = "A-Z"
	rb.reset()
	await M._wait(0.1)
	var thumb: Array = []
	for hh in rb.hits:
		if hh[1] == "thumb":
			thumb = hh
	if not thumb.is_empty():
		var tr: Rect2 = thumb[0]
		inv._pressed(Vector2(tr.get_center().x, tr.position.y + tr.size.y * 0.6))
		await M._wait(0.15)
		await _snap(dir, "r07_scroll_bar")
		inv._released(Vector2(tr.get_center().x, tr.position.y + tr.size.y * 0.6))
	_line(not thumb.is_empty() and rb.scroll > 0.0, "the scroll bar held down 60%%: the bag run through to %.0f of %.0f" % [rb.scroll, rb._max()])
	rb.sort = "GROUP"
	rb.reset()
	# --- a rune pressed, then a slot
	await M._wait(0.2)
	for k in 3:
		for s in ["front", "behind"]:
			for j in h.loadout.slots(k, s).size():
				var back: String = h.loadout.take(k, s, j)
				if back != "":
					loot.words[back] = int(loot.words.get(back, 0)) + 1
	var tw: String = "twin"
	var n0 := int(loot.words[tw])
	at = rb.tile_at(tw) + Vector2(12, 12) * 2.0
	inv._pressed(at)
	inv._released(at)
	await M._wait(0.2)
	await _snap(dir, "r08_in_hand")
	var in_hand: String = inv._word
	inv._press("slot", [0, "behind", 0])
	await M._wait(0.2)
	_line(in_hand == tw and h.loadout.slots(0, "behind")[0] == tw and int(loot.words[tw]) == n0 - 1, "TWIN pressed (in hand: %s), then Strike's slot behind: set there (%s), one fewer in the bag" % [in_hand, str(h.loadout.slots(0, "behind"))])
	# --- a rune carried sideways out of the bag to a slot
	var fw: String = "fire"
	at = rb.tile_at(fw) + Vector2(12, 12) * 2.0
	var slot_r: Rect2 = Rect2()
	for c in inv._slots:
		if c["i"] == 0 and c["side"] == "front" and c["k"] == 0:
			slot_r = c["r"]
	inv._pressed(at)
	rb.motion(at + Vector2(-30, 2))
	var carried: bool = inv._drag.get("moving", false) and inv._word == fw
	inv._mouse = inv._to_panel(inv._to_screen(slot_r.get_center()))
	await M._wait(0.1)
	await _snap(dir, "r09_carried")
	inv._released(slot_r.get_center())
	await M._wait(0.2)
	_line(carried and h.loadout.slots(0, "front")[0] == fw, "FLAME carried sideways out of the bag (a drag: %s) and let go on Strike's slot in front: %s" % [carried, str(h.loadout.slots(0, "front"))])
	await _snap(dir, "r10_strike_set")
	inv._press("lex", null)
	inv._press("close", null)
	await M._wait(0.3)
	# --- at the wordsmith: the melding stone, the bag beside it
	inv.open_wordsmith()
	inv._press("ws_tab", null)
	await M._wait(0.5)
	await _snap(dir, "s01_stone")
	_line(inv.wsmith == "meld" and inv._rb_on == "panel" and inv.meld_in == [null, null], "his half melding: the stone, the bag on the gear screen's half (%s)" % inv._rb_on)
	inv._ms_lay("fire")
	await M._wait(0.6)
	await _snap(dir, "s02_flame_in")
	var lit := 0
	var dim := 0
	for w in rb.held_ids():
		if inv._ws_problem(w) == "" and Words.meld_problem("fire", w) == "" and Words.meld_of("fire", w) != "":
			lit += 1
		else:
			dim += 1
	_line(inv.meld_in == ["fire", null] and lit > 0 and dim > 0, "FLAME laid in: of the bag, %d meld with it, %d do not (dimmed)" % [lit, dim])
	inv._ms_lay("frost")
	await M._wait(0.6)
	await _snap(dir, "s03_frost_in")
	var pt: Dictionary = inv._ms.pair()
	_line(pt["ok"] and pt["res"] == "scald" and pt["s"] == "A MELD YOU HAVE NOT FOUND", "FROST laid in: '%s' (%s)" % [pt["s"], pt["res"]])
	var dust0: int = M.quest610.dust
	inv._press("ws_meld", null)
	var made_now: bool = loot.melded.get("word", "") == "scald" and int(loot.words.get("scald", 0)) == 1 and inv.meld_in == [null, null] and M.quest610.dust == dust0 - 1
	var hidden: bool = not rb.held_ids().has("scald")
	var t0 := Time.get_ticks_msec()
	for t in [0.12, 0.35, 0.6, 0.85, 1.12, 1.3, 1.45, 1.65, 2.1, 2.6]:
		var wait: float = t - (Time.get_ticks_msec() - t0) / 1000.0
		if wait > 0.0:
			await M._wait(wait)
		await _snap(dir, "s04_meld_%04d" % int(t * 1000))
	_line(made_now and hidden, "MELD: by the rules at once (Scald made, both used, a runedust spent), the bag shows it only once it has formed (hidden: %s)" % hidden)
	_line(inv._ms.waiting() == "scald" and rb.held_ids().has("scald"), "about two seconds on: Scald formed in the hollow beneath, and in the bag (%s)" % inv._ms.waiting())
	inv._press("ms_take", null)
	await M._wait(0.25)
	await _snap(dir, "s05_flying")
	await M._wait(0.5)
	await _snap(dir, "s06_in_the_bag")
	_line(inv._ms.anim.is_empty() and rb.flash_id == "scald", "pressed: it flies into its place in the bag (%s)" % rb.flash_id)
	# --- two of Power: ranked up
	loot.words["power"] = 2
	inv._ms_lay("power")
	inv._ms_lay("power")
	await M._wait(0.4)
	await _snap(dir, "s07_power_power")
	inv._press("ws_meld", null)
	await M._wait(2.3)
	await _snap(dir, "s08_power2")
	_line(loot.melded.get("word", "") == "power2" and inv._ms.waiting() == "power2", "two of POWER: %s" % loot.melded.get("word", "-"))
	# --- what the old page's check presses still works on the stone (ws_hollow taking a rune back out)
	inv._ms.take(true)
	inv._ms_lay("swift")
	var laid: Array = inv.meld_in.duplicate()
	inv._press("ws_hollow", 0)
	_line(laid == ["swift", null] and inv.meld_in == [null, null], "SWIFT laid %s; its hollow pressed, taken back out %s" % [str(laid), str(inv.meld_in)])
	print("RUNE BAG: %d ok, %d wrong" % [ok, bad])
