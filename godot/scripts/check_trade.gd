## THE CHECK OF THE WORDSMITH'S TRADE IN WORDS (--only=trade; main.gd sends it here): in town, come up from floor 5 with four
## floors cleared, his half's first page as the game's (ui/trades.ts wordsmithSide; game.ts rollShop's lot of words, wordPrice,
## wordSellValue, buyWord, sellWord, buyBackWord): his shelf the game's own for seed 1 at that point (POISON, POWER, FROST at 1200
## gold, as tools printed it from the game), his ring dark refusing, a word read and refused for want of gold, bought, a spare word
## sold from its card and by being let go over his half, one bought back, the right button buying at once, the last nine sold
## kept, and on the next visit a new shelf (from floor 9 with eight cleared: FLEETING, POISON, VOLATILE at 2400) and nothing of
## his sold kept. A line a step (OK or WRONG), pictures at the main ones; then the sum, TRADE.
extends RefCounted

var M
var h
var n := 0
var bad: Array = []
var tag := "TRADE"


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("%s %02d %s: %s" % [tag, n, "OK" if ok else "WRONG", what])


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	var loot = M.loot
	var inv = M._inv
	var smith := Vector2(9.5, 14.5)
	# (come up from floor 5, four floors cleared: game.ts depth 5, cleared 4; in town first, so that the floor the check began on
	# is not the one he comes up from)
	await M.go_to("town", "gate")
	await M._wait(0.3)
	M.last_floor = 5
	loot.cleared = 4
	await M.go_to("town", "gate")
	await M._wait(0.8)
	h.walked = 5.0
	loot.ring_lit = false
	loot.quest_given = true
	loot.quest = ""
	loot.taught = true
	loot.level = 20
	loot.derive()
	for k in loot.words.keys():
		loot.words[k] = 0
	loot.gold = 5000
	h.world = M._spot_near(smith, 1.4, h.world)
	await M._wait(0.5)
	var stock: Array = loot.word_stock.duplicate()
	_line(stock == ["poison", "power", "frost"] and loot.word_price() == 1200 and loot.word_sell_value() == 300 and loot.words_sold.is_empty(),
		"come up from floor 5, four cleared: his shelf %s at %d gold each, he pays %d (the game's for seed 1: poison, power, frost; 1200; 300)" % [stock, loot.word_price(), loot.word_sell_value()])
	# --- his ring dark (the quest for it given): his half opens; buying refused in the game's words
	var p0: String = M.town.prompt[0]
	await M._key(KEY_E)
	await M._wait(0.3)
	inv._press("ws_cell", "word:0")
	inv._press("ws_buy", null)
	_line(p0 == "E: Wordsmith" and inv.visible and inv.wsmith == "trade" and inv._note == "The runes are dark" and loot.word_stock == stock and loot.gold == 5000,
		"his ring dark: '%s' opens his half (%s); BUY says '%s', nothing bought" % [p0, inv.wsmith, inv._note])
	inv.toggle()
	# --- his ring lit, no gold: his shelf dimmed; a word read; BUY refused
	loot.ring_lit = true
	loot.gold = 0
	await M._wait(0.2)
	await M._key(KEY_E)
	await M._wait(0.3)
	await M._snap(dir + "/t01_his_shelf.png")
	_line(inv.visible and inv.wsmith == "trade" and inv.ws_pick == "", "his ring lit: his half, HIS WORDS: %d GOLD EACH, three words (no gold: each dimmed), BUY BACK empty" % loot.word_price())
	inv._press("ws_cell", "word:1")
	await M._wait(0.2)
	await M._snap(dir + "/t02_a_word_read.png")
	inv._press("ws_buy", null)
	_line(inv.ws_pick == "word:1" and inv._note == "Not enough gold" and loot.word_stock[1] == "power", "POWER pressed: its page and BUY: 1200 GOLD, YOU HAVE 0; pressed: '%s'" % inv._note)
	# --- with gold: bought
	loot.gold = 2000
	inv._press("ws_cell", "word:1")
	inv._press("ws_buy", null)
	await M._wait(0.2)
	await M._snap(dir + "/t03_bought.png")
	_line(loot.word_stock == ["poison", null, "frost"] and int(loot.words["power"]) == 1 and loot.gold == 800 and inv.ws_pick == "",
		"with 2000 gold, BUY: POWER his (x%d), %d gold left, its place on the shelf SOLD" % [int(loot.words["power"]), loot.gold])
	# --- a spare word sold from its card
	inv._press("word", "power")
	await M._wait(0.2)
	await M._snap(dir + "/t04_sell_from_its_card.png")
	inv._press("ws_sell", null)
	_line(int(loot.words["power"]) == 0 and loot.gold == 1100 and loot.words_sold == ["power"], "POWER of his pressed: its card says what he pays, SELL: 300 GOLD; pressed: %d gold, BUY BACK %s" % [loot.gold, loot.words_sold])
	# --- and one let go over his half
	loot.words["fire"] = 1
	inv._drop("fire", inv._target_at(Vector2(inv.size.x * 0.75, inv.size.y * 0.5)))
	await M._wait(0.2)
	await M._snap(dir + "/t05_sold_two.png")
	_line(int(loot.words["fire"]) == 0 and loot.gold == 1400 and loot.words_sold == ["power", "fire"], "FLAME let go over his half: sold, %d gold, BUY BACK %s" % [loot.gold, loot.words_sold])
	# --- one bought back for what he paid
	inv._press("ws_cell", "wsold:0")
	await M._wait(0.2)
	await M._snap(dir + "/t06_buy_back_read.png")
	inv._press("ws_buy", null)
	_line(int(loot.words["power"]) == 1 and loot.gold == 1100 and loot.words_sold == ["fire"], "POWER in BUY BACK pressed, BUY BACK: 300 GOLD: his again, %d gold, BUY BACK %s" % [loot.gold, loot.words_sold])
	# --- the right button: bought at once (refused for want of gold first)
	inv._ws_quick("word:0")
	var poor: String = inv._note
	loot.gold = 5000
	inv._ws_quick("word:2")
	_line(poor == "Not enough gold" and loot.word_stock == ["poison", null, null] and int(loot.words["frost"]) == 1 and loot.gold == 3800,
		"the right button on POISON with 1100 gold: '%s'; on FROST with 5000: bought at once (%d left)" % [poor, loot.gold])
	# --- he keeps the last nine sold him
	for w in ["swift", "fire", "frost", "lightning", "poison", "power", "swift", "fire", "frost", "lightning"]:
		loot.words[w] = int(loot.words.get(w, 0)) + 1
		loot.sell_word(w)
	await M._wait(0.2)
	await M._snap(dir + "/t07_nine_kept.png")
	_line(loot.words_sold.size() == 9 and loot.words_sold[0] == "fire" and loot.words_sold[8] == "lightning", "ten more sold: he keeps the last nine (%s), the oldest gone for good" % [loot.words_sold])
	inv.toggle()
	# --- the next visit: up from floor 9, eight cleared: a new shelf, nothing sold kept
	M.last_floor = 9
	loot.cleared = 8
	await M.go_to("town", "gate")
	await M._wait(0.5)
	_line(loot.word_stock == ["fleeting", "poison", "volatile"] and loot.word_price() == 2400 and loot.words_sold.is_empty(),
		"the next visit, up from floor 9 with eight cleared: his shelf %s at %d (the game's: fleeting, poison, volatile; 2400), BUY BACK empty" % [loot.word_stock, loot.word_price()])
	h.world = M._spot_near(smith, 1.4, h.world)
	await M._wait(0.4)
	await M._key(KEY_E)
	await M._wait(0.3)
	await M._snap(dir + "/t08_next_visit.png")
	inv.toggle()
	print("TRADE: %d steps of the wordsmith's trade in words, %d as the game's%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])


## THE MELDSTONE CARRIED AND GIVEN (--only=meldstone): carried, its small picture by INVENTORY (ui/hud.ts); given, its flight to
## the wordsmith's slab at its beats (render/meld_drops.ts givenOf: risen, over, the shudder, the halves whirling, the slam and
## its burst, settling) and then its round of the column of light. A line a picture; then the sum, MELDSTONE.
func meldstone(main, hero, dir: String) -> void:
	M = main
	h = hero
	tag = "MELDSTONE"
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
	loot.meld = "stone"
	loot.derive()
	h.world = M._spot_near(smith, 1.4, h.world)
	await M._wait(0.6)
	await RenderingServer.frame_post_draw
	var img: Image = M.get_viewport().get_texture().get_image()
	img.get_region(Rect2i(0, 0, mini(img.get_width(), 960), mini(img.get_height(), 240))).save_png(dir + "/s01_carried.png")
	_line(M.town.prompt[0] == "E: Give the Meldstone", "carried: its small picture by INVENTORY (picture s01); his prompt '%s'" % M.town.prompt[0])
	await M._key(KEY_E)
	var beats := [[0.3, "rising out of him", "s02"], [1.0, "floating over to his slab", "s03"], [1.4, "a shudder, its halves straining", "s04"],
		[1.9, "its halves whirling round each other", "s05"], [2.3, "SLAMMED together, its burst", "s06"], [2.7, "going out to its round", "s07"], [3.6, "on its round of the column of light", "s08"]]
	for b in beats:
		# (by the flight's own clock: the pictures take time of their own)
		var at: float = b[0]
		if b[2] == "s08":
			await M._w_until(func() -> bool: return M.town._given.is_empty(), 6.0)
			await M._wait(0.5)
		else:
			await M._w_until(func() -> bool: return float(M.town._given.get("g", 99.0)) >= at, 6.0)
		var g: float = float(M.town._given.get("g", -1.0))
		var G: Dictionary = M.town.given_of(g, M.town._t, h.world, M.town._kept[1]) if g >= 0.0 else {}
		var what: String = "the stone %s" % ("-" if G.is_empty() or G["stone"] == null else G["stone"]["shown"])
		if not G.is_empty() and G["halves"] != null:
			what = "two halves"
		if not G.is_empty() and G["burst"] != null:
			what += ", its burst"
		await M._snap("%s/%s_given.png" % [dir, b[2]])
		var ok := true
		match b[2]:
			"s02", "s03":
				ok = not G.is_empty() and G["stone"] != null and G["stone"]["shown"] == "hang"
			"s04":
				ok = not G.is_empty() and G["stone"] != null and G["stone"]["shown"] == "apart"
			"s05":
				ok = not G.is_empty() and G["halves"] != null
			"s06":
				ok = not G.is_empty() and G["burst"] != null and bool(M.town._given["slammed"])
			"s07":
				ok = not G.is_empty() and G["stone"] != null and G["stone"]["shown"] == "whole"
			"s08":
				ok = M.town._given.is_empty() and M.town._kept[0].visible and loot.meld == "open"
		_line(ok, "%.1f s after it was given, %s: %s (picture %s)" % [b[0], b[1], what if b[2] != "s08" else "its flight over, the kept stone on its round", b[2]])
	print("MELDSTONE: %d pictures of the Meldstone carried and given, %d as the game's%s" % [n, n - bad.size(), "" if bad.is_empty() else "; NOT: " + str(bad)])
