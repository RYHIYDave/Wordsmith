## CHECKS: THE ROYAL CARDS AND THE QUEST LINE OF FLOORS 16 TO 20 (act3/royal_cards.gd, act3/quest1620.gd; game/royal_cards.ts,
## game/quests1620.ts), `--only=quests1620`: on floor 16 the packs a royal touched, each wearing its crest; one fallen drops its
## card, walked over, his; the stranger's page of hands, one handed in (its cards gone, what it pays in his bag); the whole court
## asked and brought; the armourer's ask for the songbird (the Princess fallen), its key (the Prince), its spring (the Queen), the
## bird before the throne (the King fallen); the tower's door shut from the Keep, the bird not mended; mended, the waypoint on up to
## the tower; the captain's jar on 12, the knight-captain silent, then his voice brought (his knights stand down, his gift); all of
## it in the saved game. A line a step (QUESTS16 nn OK or WRONG), pictures at the main ones.
extends RefCounted

const Save := preload("res://scripts/save.gd")
const RoyalCards := preload("res://scripts/act3/royal_cards.gd")

var M
var h
var Q
var n := 0
var bad: Array = []
var dir := ""
var shot := 0


func _line(ok: bool, what: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("QUESTS16 %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/q16_%02d_%s.png" % [dir, shot, name])


func _run(secs: float, until := Callable()) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		h.life = h.max_life
		M.loot.offer = ""
		if until.is_valid() and until.call():
			return true
	return not until.is_valid()


func _station(kind: String) -> Vector2:
	for s in M.town.data["stations"]:
		if s["kind"] == kind:
			return Vector2(float(s["x"]), float(s["y"]))
	return Vector2.ZERO


func _near(at: Vector2) -> void:
	h.world = M._spot_near(at, 1.4, h.world)
	await _run(0.5)


func _said(start: String) -> String:
	for m in M.loot.msgs:
		if str(m["text"]).begins_with(start):
			return str(m["text"])
	return ""


func _camp() -> void:
	M.way_depth = maxi(M.way_depth, 16)
	await M.go_to("camp", "gate")
	await _run(1.0)


func _floor(n_: int) -> void:
	await M.go_to("floor%d" % n_, "down")
	await _run(1.2)
	if M.sight != null:
		M.sight.see_all()


func _alone(keep: Array) -> void:
	for o in M._monsters.list.duplicate():
		if is_instance_valid(o) and not keep.has(o):
			M._monsters.list.erase(o)
			o.queue_free()
	await _run(0.1)


## Every piece he has or that lies: worn, in his bag, on the floor.
func _pieces() -> Array:
	var out: Array = []
	for k in M.loot.gear:
		if M.loot.gear[k] != null:
			out.append(M.loot.gear[k])
	out.append_array(M.loot.bag)
	for d in M.loot._drops:
		if d["kind"] == "gear":
			out.append(d["item"])
	return out


## The pieces given him since `before` (whether they lie at his feet, are in his bag, or were put on at once).
func _given(before: Array) -> Array:
	return _pieces().filter(func(it): return not before.has(it))


func _boss(kind: String):
	for o in M._monsters.list:
		if is_instance_valid(o) and o.boss and o.kind == kind:
			return o
	return null


func run(main, hero, out: String) -> void:
	M = main
	h = hero
	dir = out
	Q = M.quest1620
	var loot = M.loot
	loot.level = 40
	loot.ring_lit = true
	loot.quest = ""
	loot.taught = true
	loot.furnace = "done"
	loot.meld_ask = true
	loot.meld = "open"
	loot.derive()
	h.walked = 50.0
	h.unhurt = false
	M.quest610.feather = "given"
	M.quest610.city_seen = true
	M.quest1115.jar = "given"
	M.quest1115.pages = 7
	M.quest1115.clapper = "given"
	loot.cleared = 15
	loot.cards = {}
	Q.bird = ""
	Q.bird_parts = 0
	Q.court = ""
	Q.captain_jar = ""
	await _touched()
	await _hands()
	await _court()
	await _bird_ask()
	await _parts()
	await _captain()
	await _tower()
	await _saved()
	print("QUESTS16 DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])


# --- THE ROYAL CARDS ---

func _touched() -> void:
	await _floor(16)
	var touched: Array = M._monsters.list.filter(func(o): return is_instance_valid(o) and o.royal != "")
	var royals := {}
	for o in touched:
		royals[o.royal] = int(royals.get(o.royal, 0)) + 1
	var whole := 0
	for o in M._monsters.list:
		if is_instance_valid(o):
			whole += 1
	_line(touched.size() > 0 and royals.size() >= 2, "floor 16: %d of its %d touched by a royal, as the game spawns them: %s" % [touched.size(), whole, royals])
	if touched.is_empty():
		return
	var o = touched[0]
	for p in touched:
		if p.world.distance_to(h.world) < o.world.distance_to(h.world):
			o = p
	await _alone([o])
	o.seen = true
	o.state = "sleep"
	h.world = M._spot_near(o.world, 2.6, h.world)
	await _run(0.4)
	var crest: bool = o._crest() and o._shows_over()
	await _snap("a_touched_one_wearing_its_crest")
	_line(crest, "one touched by the %s wears its crest over its head (%s)" % [o.royal, crest])
	var r: String = o.royal
	var drops0: int = M.loot._drops.size()
	o.dead = true
	M.loot.on_kill(o)
	var card: Array = M.loot._drops.slice(drops0).filter(func(d): return d["kind"] == "card")
	await _run(0.2)
	await _snap("its_card_lying")
	_line(card.size() == 1 and str(card[0]["royal"]) == r and card[0].has("tag") and str(card[0]["tag"].text) == "The %s's card" % M.loot.royal["names"][r]["one"],
		"fallen, it drops the %s's card, named '%s'" % [r, card[0]["tag"].text if card.size() == 1 else "-"])
	if card.is_empty():
		return
	h.world = M._spot_near(card[0]["at"], 0.3, h.world)
	await _run(1.5, func(): return int(M.loot.cards.get(r, 0)) > 0)
	_line(int(M.loot.cards.get(r, 0)) == 1 and int(M.fx.seen.get("cardGot", 0)) >= 1, "walked over, it is his: %s; the game's cardGot told (%d)" % [M.loot.cards, int(M.fx.seen.get("cardGot", 0))])


func _hands() -> void:
	var loot = M.loot
	loot.cards = {"queen": 3, "king": 2, "princess": 1}
	var hands: Array = loot.hands()
	var names: Array = hands.map(func(q): return RoyalCards.hand_name(q, loot.royal["names"]))
	var first: Dictionary = hands[0] if not hands.is_empty() else {}
	_line(names.size() == 5 and names[0] == "Full house: Queens over Kings" and RoyalCards.pays_name(RoyalCards.hand_pays(first)) == "Three rare pieces, 4 levels above you",
		"three Queens, two Kings and a Princess make %d hands, best first: %s; the best pays '%s'" % [names.size(), names, RoyalCards.pays_name(RoyalCards.hand_pays(first)) if not first.is_empty() else "-"])
	await _camp()
	await _near(_station("stranger"))
	Q.court = "given"
	await _run(0.2)
	await M._key(KEY_E)
	await _run(0.3)
	var inv = M._inv
	var tab: bool = inv.svc == "stranger" and inv._cards_open()
	inv._svc_press("gm_tab", null)
	inv._svc_press("cd_hand", RoyalCards.key_of(first))
	inv.queue_redraw()
	await _run(0.3)
	await _snap("the_strangers_cards")
	var bag0: int = loot.bag.size()
	inv._svc_press("cd_in", null)
	inv.queue_redraw()
	await _run(0.3)
	await _snap("a_hand_handed_in")
	var won: Array = loot.won_hand.map(func(i): return loot.bag[int(i)])
	var rare := won.all(func(it): return int(it["rarity"]) == 2)
	_line(tab and won.size() == 3 and rare and loot.bag.size() == bag0 + 3 and loot.cards == {"princess": 1},
		"at the stranger, his page of cards (%s); the full house handed in: three rares in his bag (%s), its cards gone (%s)" % [tab, won.map(func(it): return it["name"]), loot.cards])
	inv.toggle()
	Q.court = ""
	await _run(0.2)


func _court() -> void:
	var loot = M.loot
	loot.cards = {"princess": 1}
	await _near(_station("stranger"))
	var shown: String = M.town.prompt[0]
	await M._key(KEY_E)
	await _run(0.3)
	_line(shown == "E: Stranger: a task" and Q.court == "asked" and _said("The stranger: \"Royal cards") != "", "a card held, the stranger's prompt '%s'; used, he asks for a whole court (court %s)" % [shown, Q.court])
	loot.cards = {"princess": 2, "prince": 1, "queen": 1, "king": 1}
	await _run(0.2)
	shown = M.town.prompt[0]
	var before := _pieces()
	await M._key(KEY_E)
	await _run(0.3)
	# (laid at his feet, it is taken up at once, as the game takes a piece he stands on)
	var gift: Array = _given(before)
	await _snap("the_whole_court_brought")
	_line(shown == "E: Stranger: the whole court" and Q.court == "given" and loot.cards == {"princess": 1} and gift.size() == 1 and int(gift[0]["rarity"]) == 2 and ["amulet", "ring", "belt"].has(str(gift[0].get("slot", ""))) and _said("The stranger takes the four cards") != "",
		"the four brought ('%s'): taken, one of each (%s left), a rare %s given him (%s); court %s" % [shown, loot.cards, gift[0]["name"] if gift.size() == 1 else "-", gift[0].get("slot", "") if gift.size() == 1 else "-", Q.court])


# --- THE CLOCKWORK SONGBIRD ---

func _bird_ask() -> void:
	M.loot.cleared = 16
	await _camp()
	await _near(_station("armourer"))
	var shown: String = M.town.prompt[0]
	await M._key(KEY_E)
	await _run(0.3)
	await _snap("the_armourer_asks")
	_line(shown == "E: Armourer: a task" and Q.bird == "asked" and _said("The armourer: \"The King had a clockwork songbird") != "",
		"the Princess fallen, the armourer's prompt '%s'; used, he asks for the songbird (bird %s)" % [shown, Q.bird])


func _parts() -> void:
	# (the Prince's key, the Queen's spring: each as he or she falls, once)
	for step in [[17, "prince", "key", 1], [18, "gqueen", "spring", 3]]:
		await _floor(step[0])
		var b = _boss(step[1])
		await _alone([b])
		var had: bool = b != null
		if had:
			b.dead = true
			Q.killed(b)
			Q.killed(b)
		var lying: int = Q._things.size()
		if lying > 0:
			h.world = M._spot_near(Q._things[0]["at"], 2.4, h.world)
			await _run(0.3)
			await _snap("the_songbirds_%s_lying" % step[2])
			h.world = M._spot_near(Q._things[0]["at"], 0.3, h.world)
		await _run(2.0, func(): return Q._things.is_empty())
		_line(had and lying == 1 and Q.bird_parts == int(step[3]) and _said("You take the songbird's %s" % step[2]) != "",
			"floor %d: the %s fallen, the songbird's %s lies (%d, once); taken (parts %d): '%s'" % [step[0], step[1], step[2], lying, Q.bird_parts, _said("You take the songbird's")])
	# (floor 19: the bird before the throne, not while the King stands; his once he has fallen)
	await _floor(19)
	var king = _boss("gking")
	var at = Q._bird_at
	_line(at != null and king != null, "floor 19: the broken songbird before the throne at %s; the King stands" % [at])
	if at == null:
		return
	await _alone([king])
	king.state = "sleep"
	h.world = M._spot_near(at, 0.5, h.world)
	await _run(0.4)
	var kept: bool = Q._bird_at != null
	king.dead = true
	await _run(0.5, func(): return Q._bird_at == null)
	await _snap("the_songbird_taken")
	_line(kept and Q._bird_at == null and Q.bird_parts == 7 and _said("You take the songbird (3 of 3)") != "", "the King standing, it stays (%s); fallen, walked up to, it is his (parts %d): '%s'" % [kept, Q.bird_parts, _said("You take the songbird")])


func _captain() -> void:
	# (on 19, silent; floor 12, his voice; on 19 again, he speaks)
	var c = Q.captain
	_line(c != null and Q._captain_node != null, "floor 19: the knight-captain at his post at %s, in the barracks" % [c])
	if c == null:
		return
	h.world = M._spot_near(c, 1.2, h.world)
	await _run(0.3)
	var shown: String = M.prompt()[0]
	await _snap("the_knight_captain_silent")
	await M._key(KEY_E)
	await _run(0.2)
	_line(shown == "E: Knight-captain" and _said("The knight-captain stands at his post, silent") != "", "beside him '%s': used, silent" % shown)
	await _floor(12)
	var J = M.map.captain_jar
	_line(J != null and Q._jar != null, "floor 12: the captain's jar in a side chamber at %s" % [Vector2(J["tx"], J["ty"]) if J != null else "-"])
	if J == null:
		return
	await _alone([])
	h.world = M._spot_near(Vector2(float(J["x"]), float(J["y"])), 2.0, h.world)
	await _run(0.3)
	await _snap("the_captains_jar")
	h.world = M._spot_near(Vector2(float(J["x"]), float(J["y"])), 0.8, h.world)
	await _run(0.4)
	var speak: Dictionary = M.guide._speak
	_line(Q.captain_jar == "got" and Q._jar == null and _said("You take a jar marked with the King's crest") != "" and speak.get("who", "") == "knight-captain",
		"walked up to it: his (captain jar %s); the line: %s" % [Q.captain_jar, speak])
	await _floor(19)
	var knights0: int = M._monsters.list.filter(func(o): return is_instance_valid(o) and o.kind == "kknight").size()
	h.world = M._spot_near(Q.captain, 1.2, h.world)
	await _run(0.3)
	shown = M.prompt()[0]
	var before := _pieces()
	await M._key(KEY_E)
	await _run(0.3)
	await _snap("the_knight_captain_speaks")
	var knights: int = M._monsters.list.filter(func(o): return is_instance_valid(o) and o.kind == "kknight").size()
	var gift: Array = _given(before)
	_line(shown == "E: Knight-captain: his voice" and Q.captain_jar == "given" and knights0 > 0 and knights == 0 and gift.size() == 1 and str(gift[0].get("slot", "")) == "mainhand",
		"his voice brought ('%s'): his %d knights stand down (%d left), a weapon given him (%s)" % [shown, knights0, knights, gift[0]["name"] if gift.size() == 1 else "-"])


func _tower() -> void:
	# (from the Keep, the bird not mended: the tower's door shut, home to the camp)
	var shut: bool = Q.tower_shut()
	var ways = M.ways
	if ways != null:
		ways._go()
		await _run(1.2)
	_line(shut and M.place == "camp" and _said("The door to the Quiet Tower stays shut") != "" and int(M.loot.cleared) >= 19,
		"from the Keep, the bird not mended: the tower's door shut (%s), home to the %s: '%s'" % [shut, M.place, _said("The door to the Quiet Tower")])
	# (mended: one of the deepest words; the camp's waypoint up to the tower)
	await _near(_station("armourer"))
	var shown: String = M.town.prompt[0]
	var words0: Dictionary = M.loot.words.duplicate()
	await M._key(KEY_E)
	await _run(0.3)
	var got := ""
	for w in Q.Q["birdWords"]:
		if int(M.loot.words.get(w, 0)) == int(words0.get(w, 0)) + 1:
			got = w
	await _snap("the_songbird_mended")
	_line(shown == "E: Armourer: the songbird" and Q.bird == "mended" and got != "" and int(M.way_depth) == 20 and _said("The armourer winds the songbird") != "" and not Q.tower_shut(),
		"the three brought ('%s'): mended, %s for it; the waypoint on up to the tower (way %d)" % [shown, got.to_upper(), int(M.way_depth)])


func _saved() -> void:
	M.loot.cards = {"king": 2}
	var run: Dictionary = Save.run_of(M)
	var ok: bool = run.get("cards", {}) == {"king": 2} and run.get("bird") == "mended" and int(run.get("birdParts", -1)) == 7 and run.get("court") == "given" and run.get("captainJar") == "given"
	M.loot.cards = {}
	Q.bird = ""
	Q.bird_parts = 0
	Q.court = ""
	Q.captain_jar = ""
	Save.restore_run(M, JSON.parse_string(JSON.stringify(run)))
	_line(ok and M.loot.cards == {"king": 2} and Q.bird == "mended" and Q.bird_parts == 7 and Q.court == "given" and Q.captain_jar == "given",
		"in the saved game: cards %s, bird %s, parts %d, court %s, captain's jar %s; brought back the same" % [M.loot.cards, Q.bird, Q.bird_parts, Q.court, Q.captain_jar])
