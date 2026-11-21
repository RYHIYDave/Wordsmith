## THE CHECK OF THE CLASS CARDS (--only=cards; main.gd's shot mode sends it here): the cards up as a new game begins, and what they
## do as the game's do (ui/panels.ts drawTitle, main.ts pickClass and enter), a line a step (OK or WRONG), pictured as it goes:
##   the six cards, three across in two rows, none chosen; the first hero, left standing, doing a thing of his own a second and a
##   half on; a card under the pointer lit and its hero running on the spot; a card pressed, chosen, CONFIRM lit; the MODE pressed,
##   Hardcore and what it means, pressed again, Normal; CONFIRM: the hero picked making ready on their card, the others back in the
##   dark, then coming apart and fading; the run begun with that hero (his class, his moves, his first weapon), warping in.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []
var dir := ""
var shot := 0


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("CARDS %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/c%02d_%s.png" % [dir, shot, name])


func _run(secs: float, until := Callable()) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		if until.is_valid() and until.call():
			return true
	return not until.is_valid()


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	var cc = M.cards_up(M.place)
	cc.pointer = Vector2(2, 2)
	await _run(0.6)
	var L: Dictionary = cc._layout()
	var ids: Array = cc.K["order"]
	var rows := {}
	for r in L["cards"]:
		rows[r.position.y] = true
	await _snap("cards_up")
	_line(ids == ["warrior", "ranger", "mage", "warlock", "tinkerer", "brawler"] and L["cards"].size() == 6 and rows.size() == 2 and cc.chosen == "" and M.get_tree().paused,
		"the cards up over the game held behind them: %s, %d across in %d rows (%.0f x %.0f each), none chosen" % [ids, 3, rows.size(), L["cw"], L["ch"]])
	# the first left standing does a thing of his own a second and a half on (figure.ts reset: 1.5 s, the next 2.6 s later)
	var did: bool = await _run(3.0, func(): return cc._fig["warrior"]["doing"] != 0)
	await _run(0.5)
	await _snap("warrior_piece")
	_line(did and cc._fig["warrior"]["doing"] == 1 and cc._fig["ranger"]["doing"] == 0,
		"the Warrior, left standing, does his piece first (his idleA, %d frames); the Ranger not yet (his comes 2.6 s after)" % int(cc.D["warrior"]["card"]["idleA"]["n"]))
	# a card under the pointer: lit, its hero running on the spot
	var r_ranger: Rect2 = L["cards"][1]
	cc.pointer = r_ranger.get_center()
	await _run(0.3)
	var shown: Dictionary = cc._fig["ranger"]["shown"]
	var running := false
	for k in cc._art["ranger"].count(0, 2):
		if cc._art["ranger"].frame(0, 2, k)["tex"] == shown.get("tex"):
			running = true
	var feather: bool = cc._fig["ranger"]["tails"].chains.has("r-feather")
	await _snap("ranger_hover")
	_line(running and feather, "the pointer over the Ranger's card: he runs on the spot (his run's pictures), his feather flying (%s)" % feather)
	# pressed: chosen, CONFIRM lit
	cc.press_at(r_ranger.get_center())
	await _run(0.2)
	await _snap("ranger_chosen")
	_line(cc.chosen == "ranger", "his card pressed: chosen (%s), CONFIRM lit" % cc.chosen)
	# the MODE: Hardcore, and back
	cc.press_at(L["mode"].get_center())
	await _run(0.2)
	var hard: String = cc.mode
	cc.pointer = Vector2(2, 2)
	await _run(0.1)
	await _snap("hardcore")
	cc.press_at(L["mode"].get_center())
	await _run(0.2)
	_line(hard == "hardcore" and cc.mode == "normal", "MODE pressed: %s (\"%s\"); again: %s" % [hard, cc.K["modeLine"]["hardcore"], cc.mode])
	# CONFIRM: he makes ready, the others back in the dark; then comes apart and fades; the run begins with him
	cc.pointer = r_ranger.get_center()
	cc.press_at(L["confirm"].get_center())
	await _run(0.5)
	var making: bool = not cc.entering.is_empty() and cc.entering["cls"] == "ranger"
	var long: float = cc.entering.get("long", 0.0)
	await _snap("ranger_making_ready")
	var gone_seen: bool = await _run(3.0, func(): return cc._fig["ranger"]["gone"] > 0.3)
	await _snap("ranger_warping")
	var begun: bool = await _run(2.0, func(): return M._cards == null)
	await _run(0.1)
	var arriving: bool = h._coming > 0.0
	await _snap("ranger_arrives")
	await _run(0.6)
	await _snap("ranger_in_town")
	var weapon = M.loot.gear.get("mainhand")
	_line(making and gone_seen and begun and arriving and h.cls == "ranger" and h.kit != null and not M.get_tree().paused and weapon != null and str(weapon.get("kind", "")) == "Bow",
		"CONFIRM: the Ranger makes ready on his card (%.2f s with his warp), the others in the dark, then comes apart and fades; the run begun with him in %s (his moves %s, %s, %s; his first weapon a %s), warping in" % [long, M.place, h.loadout.r(0)["name"], h.loadout.r(1)["name"], h.loadout.r(2)["name"], weapon.get("kind", "-") if weapon != null else "-"])
	print("CARDS: %d steps, %d as the game's%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])
