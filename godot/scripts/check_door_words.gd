## THE DOOR WORDS (door_words.gd: Chains, Siege, Toll and Crown, his pick “Four new door-only words”): `--only=doorwords
## --shots=<dir>`. Switched on for the check (door_words.gd ON): each known, its stone and colour, listed on the Lexicon's page THE
## DOOR; no move, no piece of gear, no stronghold's altar and no bench takes one; the Rim's door takes it; it drops only on an
## endless level, the four sharing one rune's share; burned in, no monster carries it and it drops no more often. On an endless
## level of floor 8: Chains twice the chained rares, Crown the royals' packs for sure and twice as many, Toll the Bells for sure
## and each bell's tough ones twice; Siege two altar rooms beside the floor's own strongholds (the altar room switched on for the
## check), and on floor 3 four where there would be two. Pictured: the gate with three laid, a door word's card.
extends RefCounted

const DoorWords := preload("res://scripts/door_words.gd")
const Words := preload("res://scripts/words.gd")
const Melds52 := preload("res://scripts/melds52.gd")
const FoeWords := preload("res://scripts/foe_words.gd")
const AltarRooms := preload("res://scripts/act1/altar_rooms.gd")
const CR := preload("res://scripts/chained_rare.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("DOORWORDS %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _wait(secs: float) -> void:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()


func _go(where: String) -> void:
	await M.go_to(where, "start")
	await _wait(0.8)


func _royal_packs() -> int:
	var packs := {}
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and o.royal != "":
			packs[o.pack_id] = true
	return packs.size()


## An endless level of floor `d` with `words` burned in, the same luck each time.
func _level(d: int, words: Array) -> void:
	M.endless = 6
	M.endless_floor = d
	M.in_endless = true
	M.chained_seed = 5
	M.royal_seed = 2
	M.bells_seed = 4
	M.altar_seed = 3
	M.dungeon_words = words.duplicate()
	await _go("floor%d" % d)


func run(main, hero, dir: String) -> void:
	M = main
	h = hero
	h.unhurt = true
	M.loot.ring_lit = true
	M.loot.taught = true
	DoorWords.ON = true
	var D: Dictionary = Words.data()
	for w in DoorWords.IDS:
		Melds52.list_door(D, w)
	# THE FOUR, KNOWN
	var page = null
	for pg in D["lexPages"]:
		if str(pg["name"]) == "THE DOOR":
			page = pg
	var named: Array = DoorWords.IDS.map(func(w): return str(Words.word(w)["name"]))
	var stones: Array = DoorWords.IDS.filter(func(w): return Melds52.T()["stones"].has(w))
	_line(named == ["Chains", "Siege", "Toll", "Crown"] and stones.size() == 4 and DoorWords.IDS.all(func(w): return Words.ids().has(w)) and page != null and page["words"] == DoorWords.IDS,
		"known: %s, each its stone (%d), among the words to find, the Lexicon's page THE DOOR: %s" % [named, stones.size(), page["words"] if page != null else null])
	# NOTHING BUT THE DOOR TAKES ONE
	for w in DoorWords.IDS:
		M.loot.words[w] = 2
	var socket: String = Words.socket_problem([null], "chains")
	var place: String = Words.socket_problem([null, null], "siege", 2)
	var burn: String = M.loot.burn_problem("toll", "weapon")
	var meld := [Words.meld_problem("crown", "power"), Words.meld_problem("chains", "chains")]
	var Holds = preload("res://scripts/act1/holds.gd").new()
	Holds.st = [{"open": false, "words": []}]
	Holds.loot = M.loot
	Holds.T = {"most": 3}
	var altar: String = Holds.problem(0, "crown")
	Holds.free()
	_line(socket == "Only for the Rim's door" and place == "Only for the Rim's door" and burn == "Only for the Rim's door" and altar == "Only for the Rim's door" and meld.all(func(x): return x != "") and Words.meld_of("crown", "power") == "",
		"refused: a move's socket '%s', a side of two sockets '%s', a piece of gear '%s', a stronghold's altar '%s', the bench '%s', '%s'" % [socket, place, burn, altar, meld[0], meld[1]])
	# DROPS: ONLY ON AN ENDLESS LEVEL, THE FOUR SHARING ONE RUNE'S SHARE
	M.in_endless = false
	await _go("floor8")
	var story_pool: Array = M.loot.drops_at(8)
	var story_ok: bool = not story_pool.any(func(w): return DoorWords.is_door(w)) and not M.loot.may_drop("chains")
	M.in_endless = true
	var seen := {}
	var each_one := true
	for k in 200:
		var pool: Array = M.loot.drops_at(8)
		var doors: Array = pool.filter(func(w): return DoorWords.is_door(w))
		if doors.size() != 1:
			each_one = false
		for w in doors:
			seen[w] = true
	_line(story_ok and each_one and seen.size() == 4, "the story's floor 8 drops none (%s); an endless level's pool holds one of the four each time (%s), all four seen (%s)" % [story_ok, each_one, seen.keys()])
	# BURNED IN: NO MONSTER CARRIES IT, IT DROPS NO MORE OFTEN
	M.dungeon_words = ["chains", "twin"]
	var laid: Array = FoeWords.foe_words_of(M.dungeon_words.filter(func(w): return not M.loot.DOOR_WORDS.has(str(w))))
	var tilted := 0
	for k in 400:
		if DoorWords.is_door(M.loot.tilt_word("power")):
			tilted += 1
	_line(laid == ["twin"] and tilted == 0, "Chains and Twin burned in: what its monsters carry %s; a rune tilted to Chains %d times in 400" % [laid, tilted])
	# THE RIM'S DOOR TAKES THEM, THREE AT MOST
	M.dungeon_words = []
	M.in_endless = false
	M.go_to(M.home_place(), "start")
	await _wait(2.0)
	var whys: Array = []
	for w in ["chains", "toll", "crown"]:
		whys.append(M.plan_word(w))
	var fourth: String = M.plan_word("siege")
	_line(whys == ["", "", ""] and M.plan == ["chains", "toll", "crown"] and fourth != "", "laid on the Rim's door: %s (a fourth refused: '%s')" % [M.plan, fourth])
	M._inv.open_service("gate")
	await _wait(0.4)
	await M._snap(dir + "/door_words_gate.png")
	M._inv._word = "toll"
	await _wait(0.4)
	await M._snap(dir + "/door_words_card.png")
	M._inv._word = ""
	M._inv.toggle()
	for k in 3:
		M.unplan_word(0)
	# ON AN ENDLESS LEVEL OF FLOOR 8: NONE BURNED, THEN CHAINS, TOLL AND CROWN
	await _level(8, [])
	var c0: int = M.chained_rares.size()
	var r0: int = _royal_packs()
	var b0: bool = not M._monsters.bells.is_empty()
	await _level(8, ["chains", "toll", "crown"])
	var c1: int = M.chained_rares.size()
	var r1: int = _royal_packs()
	var held: bool = M.chained_rares.all(func(cr): return is_instance_valid(cr) and cr.held())
	_line(c1 == c0 * DoorWords.MORE and held, "Chains: %d chained rares where there were %d, each held (%s)" % [c1, c0, held])
	_line(r1 > r0, "Crown: %d royals' packs where there were %d" % [r1, r0])
	var B = M.hero.bells
	var tough := [0, 0]
	if B != null and is_instance_valid(B) and B.D.has("tough") and not (B.D["tough"] as Array).is_empty():
		B.phase = "on"
		var before: int = B.ids.size()
		B.ring(0)
		await _wait(0.2)
		tough = [(B.D["tough"][0] as Array).size(), B.ids.size() - before]
	_line(tough[0] > 0 and tough[1] == tough[0] * DoorWords.MORE, "Toll: the Bells here (%s, with this level's luck before: %s); the first bell rung called %d where its tough ones are %d" % [B != null, b0, tough[1], tough[0]])
	# CROWN AND TOLL FOR SURE: no luck fixed, ten levels each
	var sure := [0, 0]
	M.royal_seed = -1
	M.bells_seed = -1
	for k in 4:
		M.dungeon_words = ["crown", "toll"]
		await _go("floor8")
		if _royal_packs() > 0:
			sure[0] += 1
		if not M._monsters.bells.is_empty():
			sure[1] += 1
	_line(sure == [4, 4], "with no luck fixed, Crown and Toll burned in: royals' packs on %d of 4 levels, the Bells on %d of 4" % sure)
	# SIEGE: the altar room switched on for the check
	var was: bool = AltarRooms.ON
	AltarRooms.ON = true
	await _level(8, [])
	var own: int = M.quest610.holds.data["holds"].size() if M.quest610.holds != null else 0
	var beside0: bool = M.quest610.rooms == null
	await _level(8, ["siege"])
	var beside: int = M.quest610.rooms.data["holds"].size() if M.quest610.rooms != null and is_instance_valid(M.quest610.rooms) else 0
	var own1: int = M.quest610.holds.data["holds"].size() if M.quest610.holds != null else 0
	_line(own > 0 and own1 == own and beside0 and beside == DoorWords.SIEGE_OWN, "Siege on floor 8: its own %d strongholds kept (%d), and %d altar rooms beside them (none without it: %s)" % [own, own1, beside, beside0])
	if beside > 0:
		var q: Dictionary = M.quest610.rooms.data["holds"][0]
		h.world = Vector2(float(q["altar"]["x"]), float(q["altar"]["y"]) + 1.6) if q.has("altar") else h.world
		await _wait(0.6)
		var pr: Array = M.prompt()
		_line(str(pr[0]).begins_with("E: Altar"), "beside its altar: the prompt '%s'" % pr[0])
	await _level(3, [])
	var r3: int = M.quest610.holds.data["holds"].size() if M.quest610.holds != null else 0
	await _level(3, ["siege"])
	var r3s: int = M.quest610.holds.data["holds"].size() if M.quest610.holds != null else 0
	_line(r3 == AltarRooms.N and r3s == AltarRooms.N * DoorWords.MORE, "Siege on floor 3: %d altar rooms where there were %d" % [r3s, r3])
	AltarRooms.ON = was
	M.dungeon_words = []
	print("DOORWORDS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
