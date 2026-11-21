## CHECKS: THE QUEST LINE OF FLOORS 11 TO 15 (act2/quest1115.gd; game/quests1115.ts), `--only=quests1115`: the mystic's ask in the
## camp (floor 11 cleared), the Crier's jar taken on floor 12 (gone from the Rat King's nest, its tile free), brought (one of the
## city's words); the three unstruck pages (the last of floor 13's pair to fall, the Physician, the stacks of floor 15); one laid in
## the Censor's fight, all his ink dried away; the armourer's ask (floor 10 cleared), the clapper falling with the Bells won, brought
## (the camp's bell hung and rung, his pick of three laid out, one taken and the others gone back); all of it in the saved game.
## A line a step (QUESTS11 nn OK or WRONG), pictures at the main ones.
extends RefCounted

const Censor := preload("res://scripts/act2/censor.gd")
const Save := preload("res://scripts/save.gd")

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
	print("QUESTS11 %02d %s: %s" % [n, "OK" if ok else "WRONG", what])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/q11_%02d_%s.png" % [dir, shot, name])


## (as the floors' own checks keep him: nothing strikes him down while he looks)
func _run(secs: float, until := Callable()) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		h.life = h.max_life
		# (a word come by is not pressed on him here: the gear screen it opens holds the game, loot.gd _offer)
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
	M.way_depth = maxi(M.way_depth, 11)
	await M.go_to("camp", "gate")
	await _run(1.0)


func _floor(n_: int) -> void:
	await M.go_to("floor%d" % n_, "down")
	await _run(1.2)
	if M.sight != null:
		M.sight.see_all()


## Everything else on the floor put away but `keep`.
func _alone(keep: Array) -> void:
	for o in M._monsters.list:
		if is_instance_valid(o) and not keep.has(o):
			o.queue_free()
	await _run(0.1)


func run(main, hero, out: String) -> void:
	M = main
	h = hero
	dir = out
	Q = M.quest1115
	var loot = M.loot
	loot.level = 30
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
	loot.cleared = 11
	Q.jar = ""
	Q.pages = 0
	Q.clapper = ""
	Q.laid_out = []
	await _mystic_ask()
	await _the_jar()
	await _jar_brought()
	await _the_pages()
	await _the_page_laid()
	await _the_clapper()
	await _saved()
	print("QUESTS11 DONE %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " %s" % [bad]])


# --- THE UNSTRUCK PAGES ---

func _mystic_ask() -> void:
	await _camp()
	await _near(_station("mystic"))
	var shown: String = M.town.prompt[0]
	await _snap("mystic_a_task")
	await M._key(KEY_E)
	await _run(0.3)
	var said := _said("The mystic: \"Every voice")
	_line(M.place == "camp" and shown == "E: Mystic: a task" and Q.jar == "asked" and said != "",
		"floor 11 cleared, in the camp the mystic's prompt '%s'; used, she asks (jar %s): %s" % [shown, Q.jar, said.substr(0, 60)])
	var marks: Array = M.quest610.givers()
	_line(not marks.has("mystic"), "asked, she has nothing more for him until the jar is brought (quest marks over %s)" % [marks])


func _the_jar() -> void:
	await _floor(12)
	var J = M.map.jar
	_line(J != null and Q._jar != null and _said("Find the Crier") != "",
		"floor 12: the Crier's jar in the Rat King's nest at %s, its tile solid (%s); the line '%s'" % [Vector2(J["tx"], J["ty"]) if J != null else "-", M.map.walk[int(J["ty"]) * M.map.w + int(J["tx"])] == 0 if J != null else "-", _said("Find the Crier")])
	if J == null:
		return
	await _alone([])
	var at := Vector2(float(J["x"]), float(J["y"]))
	h.world = M._spot_near(at, 2.2, h.world)
	await _run(0.6)
	await _snap("the_jar_in_the_nest")
	h.world = M._spot_near(at, 1.0, h.world)
	await _run(0.4)
	var key := ""
	for k in M.look._shown:
		if str(k).begins_with("jar"):
			key = str(k)
	await _snap("the_jar_taken")
	_line(Q.jar == "got" and Q._jar == null and M.map.walk[int(J["ty"]) * M.map.w + int(J["tx"])] == 1 and key != "" and _said("You take the CRIER") != "",
		"walked up to it: his (jar %s), gone from the nest (the look's state %s), its tile free; '%s'" % [Q.jar, key, _said("You take the CRIER")])
	_line(M.quest610.turn_in_for() == "mystic", "on the floor, the mark over its waypoint is for the mystic (%s)" % M.quest610.turn_in_for())


func _jar_brought() -> void:
	await _camp()
	await _near(_station("mystic"))
	var shown: String = M.town.prompt[0]
	var before := {}
	for w in Q.Q["jarWords"]:
		before[w] = int(M.loot.words.get(w, 0))
	await M._key(KEY_E)
	await _run(0.3)
	var got := ""
	for w in before:
		if int(M.loot.words.get(w, 0)) == before[w] + 1:
			got = w
	var said := _said("The mystic uncorks the jar")
	await _snap("the_jar_brought")
	_line(shown == "E: Mystic: the Crier's voice" and Q.jar == "given" and got != "" and said.find(got.to_upper()) >= 0,
		"the jar brought ('%s'): she uncorks it (jar %s), and gives a city word: %s; '%s'" % [shown, Q.jar, got.to_upper(), said.substr(said.length() - 40)])


func _the_pages() -> void:
	# (floor 13: the pair, the Scraper and the Quill: the first to fall leaves no page, the last does)
	await _floor(13)
	var sc = null
	var qu = null
	for o in M._monsters.list:
		if is_instance_valid(o) and o.boss and o.kind == "scraper":
			sc = o
		if is_instance_valid(o) and o.boss and o.kind == "quill":
			qu = o
	_line(sc != null and qu != null and _said("An unstruck page is on this floor") != "", "floor 13: the pair (%s, %s); the line '%s'" % [sc.title if sc else "-", qu.title if qu else "-", _said("An unstruck page")])
	if sc == null or qu == null:
		return
	await _alone([sc, qu])
	sc.dead = true
	Q.killed(sc)
	var after_first: int = Q._things.size()
	qu.dead = true
	Q.killed(qu)
	var lying: int = Q._things.size()
	h.world = M._spot_near(Q._things[0]["at"], 2.4, h.world) if lying > 0 else h.world
	await _run(0.25)
	await _snap("the_oldest_page_lying")
	await _run(2.0, func(): return Q._things.is_empty())
	_line(after_first == 0 and lying == 1 and Q.pages == 1 and _said("UNSTRUCK PAGE (1 of 3)") != "",
		"the first of the pair fallen: no page (%d); the last: the oldest page lies (%d); walked to, taken (pages %d): '%s'" % [after_first, lying, Q.pages, _said("UNSTRUCK PAGE")])
	# (floor 14: the Physician, a page of his ledger)
	await _floor(14)
	var ph = null
	for o in M._monsters.list:
		if is_instance_valid(o) and o.boss and o.kind == "physician":
			ph = o
	await _alone([ph])
	var had: bool = ph != null
	if had:
		Q.killed(ph)
		ph.queue_free()
	var lying14: int = Q._things.size()
	if lying14 > 0:
		h.world = M._spot_near(Q._things[0]["at"], 2.4, h.world)
		await _run(0.25)
		await _snap("the_ledger_page_lying")
	await _run(2.0, func(): return Q._things.is_empty())
	_line(had and lying14 == 1 and Q.pages == 3 and _said("UNSTRUCK PAGE (2 of 3)") != "", "floor 14: the Physician fallen, a page of his ledger lies (%d); taken (pages %d)" % [lying14, Q.pages])
	# (floor 15: the third, chained in the stacks, the side area furthest from where he comes in)
	var came: Vector2 = Vector2.ZERO
	await _floor(15)
	came = M.map.start
	var lying15: int = Q._things.size()
	var at: Vector2 = Q._things[0]["at"] if lying15 > 0 else Vector2.ZERO
	var far := -1.0
	for a in M.map.land.get("areas", []):
		if a["role"] == "side":
			far = maxf(far, Vector2(float(a["blob"]["x"]), float(a["blob"]["y"])).distance_to(came))
	if lying15 > 0:
		await _alone([_censor()])
		h.world = M._spot_near(at, 2.4, h.world)
		await _run(0.25)
		await _snap("the_stacks_page_lying")
		h.world = M._spot_near(at, 0.3, h.world)
	await _run(2.0, func(): return Q._things.is_empty())
	_line(lying15 == 1 and absf(at.distance_to(came) - far) < 3.0 and Q.pages == 7 and Q.taken() == 3 and _said("UNSTRUCK PAGE (3 of 3)") != "",
		"floor 15: the third lies in the stacks at %s, %.0f tiles from where he came in (the furthest side area %.0f); taken (%d of 3)" % [at.round(), at.distance_to(came), far, Q.taken()])


func _censor():
	for o in M._monsters.list:
		if is_instance_valid(o) and o.boss and o.kind == "censor":
			return o
	return null


func _the_page_laid() -> void:
	var boss = _censor()
	if boss == null:
		_line(false, "floor 15 has no Censor")
		return
	await _alone([boss])
	boss.words = []
	var ready0: bool = Q.page_ready()
	# (his fight: met, his ink laid by his Redaction until four tiles or more lie under it)
	h.world = M._spot_near(boss.world, 4.0, h.world)
	await _run(4.0, func(): return boss.state != "sleep" and boss._said != "")
	var inked: bool = await _run(30.0, func(): return Censor.inked_count(M.map) >= 6 and boss.h2.act == null)
	var before: int = Censor.inked_count(M.map)
	h.world = M._spot_near(boss.world, 5.0, h.world)
	await _run(0.1)
	var shown: String = M.prompt()[0]
	await _snap("his_ink_on_the_floor")
	await M._key(KEY_E)
	await _run(0.15)
	await _snap("the_page_laid")
	var after: int = Censor.inked_count(M.map)
	_line(not ready0 and inked and before >= 4 and shown == "E: Unstruck page: wipe away the ink (3 left)" and after == 0 and Q.pages_used == 1 and Q.in_hand() == 2 and _said("The page drinks up his ink (2 left)") != "",
		"before his ink lies, no page to lay (%s); %d tiles under his ink: '%s'; laid: all of it dried away (%d left), %d in hand; '%s'" % [ready0, before, shown, after, Q.in_hand(), _said("The page drinks")])
	await _run(1.0)
	await _snap("the_floor_clean")


# --- THE STOLEN CLAPPER ---

func _the_clapper() -> void:
	await _camp()
	await _near(_station("armourer"))
	var shown: String = M.town.prompt[0]
	await M._key(KEY_E)
	await _run(0.3)
	var said := _said("The armourer: \"The Silent Order")
	_line(shown == "E: Armourer: a task" and Q.clapper == "asked" and said != "", "the armourer (floor 10 cleared, the furnace's quest done): '%s'; used, he asks (clapper %s)" % [shown, Q.clapper])
	# (the Bells won on floor 11: the clapper falls with the explosion, the first time)
	await _floor(11)
	await _alone([])
	var boom: Vector2 = M._spot_near(h.world, 3.0, h.world)
	Q.bells_won(boom)
	Q.bells_won(boom)
	var lying: int = Q._things.size()
	await _run(0.2)
	await _snap("the_clapper_lying")
	h.world = M._spot_near(boom, 0.3, h.world)
	await _run(2.0, func(): return Q._things.is_empty())
	Q.bells_won(boom)
	_line(lying == 1 and Q.clapper == "got" and Q._things.is_empty() and _said("You take the CLAPPER") != "", "the Bells won: the clapper falls (%d, once); taken (clapper %s); won again, no other (%d)" % [lying, Q.clapper, Q._things.size()])
	# (brought: the camp's bell hung and rung, his pick of three laid out)
	await _camp()
	var ar := _station("armourer")
	await _near(ar)
	shown = M.town.prompt[0]
	await M._key(KEY_E)
	# (laid out nearest him first, as the game lays it: one within his reach he would take at once; he steps back to look)
	h.world = M._spot_near(ar, 6.0, h.world)
	await _run(0.2)
	var picks: Array = M.loot._drops.filter(func(d): return str(d.get("choice", "")) == "armourer")
	var kinds: Array = picks.map(func(d): return str(d["item"].get("slot", d["item"].get("kind", ""))))
	var rare := picks.all(func(d): return int(d["item"]["rarity"]) == 2)
	var bell: Dictionary = Q.bell
	var b_at: Vector2 = bell.get("at", Vector2.ZERO)
	var solid: bool = not bell.is_empty() and M.map.walk[floori(b_at.y) * M.map.w + floori(b_at.x)] == 0
	await _snap("the_clapper_brought")
	await _run(0.6)
	await _snap("the_bell_swinging")
	_line(shown == "E: Armourer: the clapper" and Q.clapper == "given" and not bell.is_empty() and b_at.distance_to(ar) >= 2.0 and b_at.distance_to(ar) <= 3.2 and solid,
		"the clapper brought ('%s'): hung in the camp's bell at %s, %.1f tiles from his forge, stood on no more (%s)" % [shown, b_at, b_at.distance_to(ar), solid])
	_line(picks.size() == 3 and rare and Q.laid_out.size() == 3, "his pick laid out before him: %d pieces, %s, all rare (%s), kept for him until one is taken (%d)" % [picks.size(), kinds, rare, Q.laid_out.size()])
	var mods: Array = picks.map(func(d): return int(d["item"].get("affixes", 0)))
	_line(mods.all(func(k): return k >= 4), "each fully modded, two prefixes and two suffixes: %s properties" % [mods])
	# (coming in again before one is taken: laid out again)
	await _camp()
	var again: int = M.loot._drops.filter(func(d): return str(d.get("choice", "")) == "armourer").size()
	_line(again == 3 and not Q.bell.is_empty() and _said("Your pick is laid out by the forge") != "", "come into the camp again before taking one: laid out again (%d), the bell hung still; '%s'" % [again, _said("Your pick is laid out")])
	picks = M.loot._drops.filter(func(d): return str(d.get("choice", "")) == "armourer")
	if picks.is_empty():
		return
	var one: Dictionary = picks[0]
	var bag0: int = M.loot.bag.size()
	h.world = M._spot_near(one["at"], 0.0, h.world)
	await _run(1.0, func(): return Q.laid_out.is_empty())
	var left: int = M.loot._drops.filter(func(d): return str(d.get("choice", "")) == "armourer").size()
	await _snap("one_taken")
	_line(left == 0 and Q.laid_out.is_empty() and _said("The armourer takes the others back") != "", "one taken (bag %d to %d, or put on): the others gone back (%d left); '%s'" % [bag0, M.loot.bag.size(), left, _said("The armourer takes")])


func _saved() -> void:
	Q.laid_out = [{"name": "x", "icon": "helm", "rarity": 2}]
	var run: Dictionary = Save.run_of(M)
	var ok: bool = run.get("jar") == "given" and int(run.get("pages", -1)) == 7 and run.get("clapper") == "given" and (run.get("laidOut", {}).get("armourer", []) as Array).size() == 1
	Q.jar = ""
	Q.pages = 0
	Q.clapper = ""
	Q.laid_out = []
	Save.restore_run(M, JSON.parse_string(JSON.stringify(run)))
	_line(ok and Q.jar == "given" and Q.pages == 7 and Q.clapper == "given" and Q.laid_out.size() == 1,
		"in the saved game: jar %s, pages %d, clapper %s, the pick laid out %d; brought back the same" % [Q.jar, Q.pages, Q.clapper, Q.laid_out.size()])
	Q.laid_out = []
