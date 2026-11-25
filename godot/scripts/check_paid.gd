## THE HEROES FOR SALE, THEIR CHECK AND PICTURES (--only=paid --paid=1 --shop=fake [--upright=1] --shots=<dir>): the class cards
## with the Warlock, the Tinkerer and the Brawler for sale (shop.gd, its stand-in shop), a line a step (OK or WRONG), pictured:
##   the cards up, the three locked (a padlock and the price in their corner), the first three open; the Warlock chosen: BUY and
##   his price for CONFIRM, the line over the foot; BUY pressed: the purchase under way (WAIT...), then his (the stand-in shop
##   grants it at once), UNLOCKED on his card and CONFIRM back; CONFIRM: he makes ready (he is no longer for sale). A locked hero
##   never begins a run.
extends RefCounted

var M
var n := 0
var bad: Array = []
var dir := ""


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("PAID %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _run(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func run(main, _hero, d: String) -> void:
	M = main
	dir = d
	var sh = M.shop
	var cc = M.cards_up(M.place)
	cc.pointer = Vector2(2, 2)
	await _run(0.8)
	var L: Dictionary = cc._layout()
	await M._snap("%s/paid_1_cards.png" % dir)
	var locks: Array = cc.K["order"].filter(func(c): return cc._locked(c))
	_line(sh.on and sh.fake and locks == ["warlock", "tinkerer", "brawler"], "the shop open (stand-in); locked on the cards: %s" % [locks])
	# the Warlock chosen: BUY and his price
	cc.press_at(L["cards"][3].get_center())
	await _run(0.5)
	await M._snap("%s/paid_2_warlock_chosen.png" % dir)
	_line(cc.chosen == "warlock" and cc._buy_label("warlock") == "BUY $0.99", "the Warlock chosen; CONFIRM is '%s'" % cc._buy_label("warlock"))
	# CONFIRM (BUY) pressed: under way, then his
	cc.press_at(cc._layout()["confirm"].get_center())
	await _run(0.15)
	var busy: String = sh.busy
	var label: String = cc._buy_label("warlock")
	await _run(0.5)
	await M._snap("%s/paid_3_warlock_bought.png" % dir)
	_line(busy == "warlock" and label == "WAIT..." and sh.owned.has("warlock") and not cc._locked("warlock") and cc._unlocked.has("warlock") and cc.entering.is_empty(),
		"BUY pressed: under way ('%s'), then bought: his now, unlocked, UNLOCKED on his card; he does not begin until CONFIRM" % label)
	# a locked hero chosen and CONFIRM pressed (Enter): the purchase, never a run
	cc.chosen = "brawler"
	var begun := [false]
	cc.picked.connect(func(c, _m): begun[0] = true)
	cc._pick("brawler")
	await _run(0.1)
	_line(not begun[0] and sh.busy == "brawler", "the Brawler, locked, picked: the purchase begins, not a run")
	await _run(0.6)
	# CONFIRM on the Warlock: he makes ready
	cc.chosen = "warlock"
	cc.press_at(cc._layout()["confirm"].get_center())
	await _run(0.3)
	await M._snap("%s/paid_4_warlock_ready.png" % dir)
	_line(not cc.entering.is_empty() and cc.entering["cls"] == "warlock", "CONFIRM on the Warlock, bought: he makes ready")
	print("PAID: %d checks, %s" % [n, "all OK" if bad.is_empty() else "WRONG: %s" % [bad]])
