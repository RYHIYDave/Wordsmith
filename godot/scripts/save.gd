## THE SAVED GAME (main.ts writeSave, readSave; game.ts save, restore; game/state.ts SaveFile, RunSave, Meta): the run in progress,
## so that closing the app, or a phone call, does not end it, and apart from it what outlasts any one character, the Lexicon
## (which words are known, and how much of each; the words kept in it) and the stash. One file in the app's own folder,
## user://wordsmith_save.json: { v: 1, run: {...} or null, meta: {...} }.
##   WHEN (main.ts): every 5 s while he is up and about and nothing is changing place (saveT), and whenever the app is put away
##     or closed (visibilitychange, pagehide: here the system's notices to the app).
##   WHAT (game.ts save): who he is (level, experience, attributes and the points still to place), his gear and his bag, his
##     spare words and those set in each move's slots, his gold, the floors (how far he has reached, the floor he last came up
##     from, how many cleared), the quests (the master rune-stone, the ring, the furnace, the Meldstone, the strongholds' runedust,
##     the feather and the ward-stone's pieces, the muster roll's pages), the words bought from the wordsmith on this visit.
##   BACK (game.ts restore): in his town (the prison town, or the camp from floor 10 on), at its start, his life and his flasks
##     full, as the game brings a run back.
## No save is written or read by the checks and shot modes (`--only`, `--shots`): the game's automated tests switch saving off.
extends RefCounted

const PATH := "user://wordsmith_save.json"
const V := 1


## Everything of the run (game.ts save).
static func run_of(main) -> Dictionary:
	var loot = main.loot
	var h = main.hero
	var q = main.quest610
	var run := {
		"v": V,
		# (his class: game.ts save `cls`; NORMAL OR HARDCORE, game/modes.ts, kept for life)
		"cls": h.cls,
		"mode": main.hero_mode,
		"level": loot.level, "xp": loot.xp, "points": loot.points, "attrs": loot.attrs.duplicate(),
		"gear": loot.gear.duplicate(true), "bag": loot.bag.duplicate(true), "words": loot.words.duplicate(),
		"front": h.loadout.front.duplicate(true), "behind": h.loadout.behind.duplicate(true),
		"gold": loot.gold, "kills": loot.kills,
		# (how far through the first lessons he is: game.ts save `guide`, its `walked`)
		"walked": h.walked,
		# (and the fight's lesson: what it has seen done, game.ts save `guide` met, low, quick, slow, evade, flask)
		"guide": {"met": main.guide.met, "low": main.guide.low, "quick": main.guide.quick, "slow": main.guide.slow, "evade": main.guide.evade, "flask": main.guide.flask},
		"depth": main.last_floor, "cleared": loot.cleared, "way": main.way_depth,
		"body": loot.body_searched, "asked": loot.quest_given, "ring": loot.ring_lit, "quest": loot.quest, "caved": loot.stairs_caved, "morning": loot.morning,
		"furnace": loot.furnace, "meld": loot.meld, "meldAsk": loot.meld_ask, "toldCarrier": loot.told_carrier,
		"chainedBeaten": loot.chained_beaten.duplicate(),
		"dust": q.dust if q != null else 0, "feather": q.feather if q != null else "", "citySeen": q.city_seen if q != null else false,
		"pieces": q.pieces if q != null else 0, "rollPages": q.roll_pages if q != null else 0,
		"wordsBought": range(loot.word_stock.size()).filter(func(i): return loot.word_stock[i] == null),
		# (the run's own number: game.ts save `seed`)
		"seed": main.run_seed,
	}
	# (ENDLESS MODE: the endless level reached and the floor it is, once it is open to him: game.ts save `endless`, `endlessFloor`)
	if int(main.endless) > 0:
		run["endless"] = main.endless
		run["endlessFloor"] = main.endless_floor
		# (DELVE DEEPER: the hero's depth, for good)
		if int(main.delve) > 1:
			run["delve"] = main.delve
	# (THE SHAFT'S RIM: the endless level its record stone was last cut to, the words laid on its gate: game.ts save `rimSeen`, `plan`)
	if int(main.rim_seen) > 0:
		run["rimSeen"] = main.rim_seen
	if not main.plan.is_empty():
		run["plan"] = main.plan.duplicate()
	# (ENDLESS_KEY: the landing open for him: game.ts save `finalOpen`)
	if main.final_open:
		run["finalOpen"] = true
	# (FLOORS 11 TO 15's quests: the jar, the pages, the clapper, and the armourer's pick laid out and not yet taken: game.ts save,
	# act2/quest1115.gd)
	var q11 = main.quest1115
	if q11 != null and q11.on():
		run["jar"] = q11.jar
		run["pages"] = q11.pages
		run["clapper"] = q11.clapper
		if not q11.laid_out.is_empty():
			run["laidOut"] = {"armourer": q11.laid_out.duplicate(true)}
	# (THE SKILL TREES: the talents taken, and the picks made on them: game.ts save `talents`, `picks`)
	if not h.talents.is_empty():
		run["talents"] = h.talents.duplicate()
	if not h.picks.is_empty():
		run["picks"] = h.picks.duplicate()
	# (THE ROYAL CARDS: the cards he holds, once he has any: game.ts save `cards`)
	if not loot.cards.is_empty():
		run["cards"] = loot.cards.duplicate()
	# (FLOORS 16 TO 20's quests: the songbird, the whole court, the captain's voice: game.ts save, act3/quest1620.gd)
	var q16 = main.get("quest1620")
	if q16 != null and q16.on():
		run["bird"] = q16.bird
		run["birdParts"] = q16.bird_parts
		run["court"] = q16.court
		run["captainJar"] = q16.captain_jar
	# (FLOOR 14: a word the Physician holds is written into the save where it would go back to, as if beaten out of him: game.ts
	# save, inTheSave; the game itself goes on as it is)
	load("res://scripts/act2/physician.gd").in_the_save(run)
	return run


## What outlasts the character (game/state.ts Meta): the Lexicon and the stash; whether he has been shown how to play.
static func meta_of(main) -> Dictionary:
	var loot = main.loot
	# (and the heroes lost: game.ts die, `meta.deaths`, the Lexicon's count of the fallen)
	return {"known": loot.known.duplicate(true), "lexicon": loot.lexicon.duplicate(), "stash": loot.stash.duplicate(true), "taught": loot.taught, "deaths": main.deaths,
		# (the mode the next hero is made in: the class cards remember it, main.ts meta.mode)
		"mode": main.next_mode,
		# (ABILITIES: COOLDOWNS or MANA: the device's choice, main.ts meta.limit)
		"limit": loot.limit,
		# (ENDLESS MODE: the deepest endless level any of his heroes has cleared: game.ts meta.bestEndless)
		"bestEndless": main.best_endless,
		# (DELVE DEEPER: the deepest any of his heroes has gone)
		"bestDelve": main.best_delve,
		# (DELVE DEEPER: each hero's deepest, the record stone's leaderboard)
		"bestDelveBy": main.delve_best_by.duplicate(true),
		# (ENDLESS_KEY: the shards of the tablet held, the account's, kept with the stash: game.ts meta.quarters)
		"quarters": main.quarters,
		# (the Rim's gate explained, the first time its page opened: inventory.gd _gate_help)
		"gateTaught": main.gate_taught}


## Written (main.ts writeSave). Not while he is down, nor between places: the run as it stands at a quiet moment. A FALLEN HERO
## (game/modes.ts): `run` given, the run to keep in place of his (a Normal hero, as he will wake in town: main.gd wake_save), or
## null for none (a Hardcore hero, lost: the Lexicon and the stash kept).
static func write(main, run = false) -> bool:
	var file := {"v": V, "run": run_of(main) if run is bool else run, "meta": meta_of(main)}
	var f := FileAccess.open(PATH, FileAccess.WRITE)
	if f == null:
		return false
	f.store_string(JSON.stringify(file))
	f.close()
	return true


## Read (main.ts readSave): {} where there is none, or none that can be read.
static func read() -> Dictionary:
	if not FileAccess.file_exists(PATH):
		return {}
	var d = JSON.parse_string(FileAccess.get_file_as_string(PATH))
	if not (d is Dictionary) or int(d.get("v", 0)) != V:
		return {}
	return d


static func _num(v, d: float) -> float:
	return float(v) if (v is float or v is int) else d


## The Lexicon and the stash put back (cleanMeta).
static func restore_meta(main, m: Dictionary) -> void:
	var loot = main.loot
	if m.get("known") is Dictionary:
		loot.known = m["known"]
	if m.get("lexicon") is Dictionary:
		loot.lexicon = {}
		for w in m["lexicon"]:
			if int(m["lexicon"][w]) > 0:
				loot.lexicon[w] = int(m["lexicon"][w])
	if m.get("stash") is Array:
		for i in mini(loot.stash.size(), m["stash"].size()):
			loot.stash[i] = m["stash"][i] if m["stash"][i] is Dictionary else null
	loot.taught = m.get("taught", false) == true
	main.deaths = maxi(0, int(_num(m.get("deaths"), 0)))
	main.best_endless = maxi(0, int(_num(m.get("bestEndless"), 0)))
	main.best_delve = maxi(1, int(_num(m.get("bestDelve"), 1)))
	main.delve_best_by = {}
	var by = m.get("bestDelveBy", {})
	if by is Dictionary:
		for c in by:
			if by[c] is Dictionary:
				main.delve_best_by[str(c)] = {"depth": maxi(0, int(_num(by[c].get("depth"), 0))), "endless": maxi(0, int(_num(by[c].get("endless"), 0)))}
	main.quarters = int(_num(m.get("quarters"), 0)) & 15
	main.gate_taught = m.get("gateTaught", false) == true
	main.next_mode = "hardcore" if m.get("mode") == "hardcore" else "normal"
	# (the mana option gone: always cooldowns, loot.gd set_limit)
	loot.limit = "cooldown"


## The run put back (game.ts restore), before his town is laid out.
static func restore_run(main, s: Dictionary) -> void:
	var loot = main.loot
	var h = main.hero
	var q = main.quest610
	# (NORMAL OR HARDCORE: a hero saved before there were modes, Normal: game/modes.ts MODE_BEFORE)
	main.hero_mode = "hardcore" if s.get("mode") == "hardcore" else "normal"
	loot.level = maxi(1, int(_num(s.get("level"), 1)))
	loot.xp = maxf(0.0, _num(s.get("xp"), 0.0))
	loot.points = maxi(0, int(_num(s.get("points"), 0)))
	if s.get("attrs") is Dictionary:
		for k in ["str", "dex", "int"]:
			loot.attrs[k] = _num(s["attrs"].get(k), loot.attrs[k])
	if s.get("gear") is Dictionary:
		for slot in loot.gear:
			loot.gear[slot] = s["gear"].get(slot) if s["gear"].get(slot) is Dictionary else null
	if s.get("bag") is Array:
		loot.bag = s["bag"].filter(func(it): return it is Dictionary).slice(0, loot.BAG)
	if s.get("words") is Dictionary:
		loot.words = {}
		for w in s["words"]:
			if loot._words["color"].has(w):
				loot.words[w] = maxi(0, int(s["words"][w]))
	loot.gold = maxi(0, int(_num(s.get("gold"), 0)))
	h.walked = maxf(0.0, _num(s.get("walked"), 0.0))
	var gq = s.get("guide")
	if gq is Dictionary:
		for k in ["met", "low", "quick", "slow", "evade", "flask"]:
			main.guide.set(k, gq.get(k) == true)
	loot.kills = maxi(0, int(_num(s.get("kills"), 0)))
	main.last_floor = maxi(1, int(_num(s.get("depth"), 1)))
	loot.cleared = maxi(0, int(_num(s.get("cleared"), 0)))
	main.way_depth = maxi(1, int(_num(s.get("way"), 1)))
	# (the run's own number; ENDLESS MODE: the endless level reached and its floor, a floor past the last built not one)
	main.run_seed = int(_num(s.get("seed"), 0))
	if main.run_seed == 0:
		main.run_seed = randi()
	main.endless = maxi(0, int(_num(s.get("endless"), 0)))
	main.delve = maxi(1, int(_num(s.get("delve"), 1)))
	var ef := int(_num(s.get("endlessFloor"), 0))
	main.endless_floor = (ef if ef >= 1 and ef <= main.last_built() else main.endless_floor_for(main.endless, 0)) if main.endless > 0 else 0
	main.rim_seen = clampi(int(_num(s.get("rimSeen"), 0)), 0, main.endless)
	main.final_open = s.get("finalOpen") == true
	main.plan = (s.get("plan") as Array).filter(func(w): return w is String) if s.get("plan") is Array else []
	loot.body_searched = s.get("body", false) == true
	loot.stairs_caved = s.get("caved", false) == true
	# (a game saved before the night came in, and already up from floor 5: the morning come)
	loot.morning = s.get("morning", false) == true or main.way_depth >= 6 or loot.cleared >= 5
	loot.quest_given = s.get("asked", false) == true
	loot.ring_lit = s.get("ring", false) == true
	loot.quest = "heart" if s.get("quest", "") == "heart" else ""
	loot.furnace = str(s.get("furnace", "")) if s.get("furnace", "") in ["asked", "gear", "out", "done"] else ""
	loot.meld = str(s.get("meld", "")) if s.get("meld", "") in ["stone", "open"] else ""
	loot.meld_ask = s.get("meldAsk", false) == true
	loot.told_carrier = s.get("toldCarrier", false) == true
	loot.chained_beaten = (s.get("chainedBeaten") as Array).filter(func(f): return f is float or f is int).map(func(f): return int(f)) if s.get("chainedBeaten") is Array else []
	if q != null:
		q.dust = maxi(0, int(_num(s.get("dust"), 0)))
		q.feather = str(s.get("feather", "")) if s.get("feather", "") in ["asked", "got", "given"] else ""
		q.city_seen = s.get("citySeen", false) == true
		q.pieces = clampi(int(_num(s.get("pieces"), 0)), 0, 7)
		q.roll_pages = maxi(0, int(_num(s.get("rollPages"), 0)))
	# (FLOORS 11 TO 15's quests: game.ts restore, cleanLaidOut: up to three pieces of the armourer's pick)
	var q11 = main.quest1115
	if q11 != null:
		var step := func(v) -> String: return str(v) if v in ["asked", "got", "given"] else ""
		q11.jar = step.call(s.get("jar", ""))
		q11.pages = clampi(int(_num(s.get("pages"), 0)), 0, 7)
		q11.clapper = step.call(s.get("clapper", ""))
		var lo = s.get("laidOut")
		q11.laid_out = []
		if lo is Dictionary and lo.get("armourer") is Array:
			q11.laid_out = lo["armourer"].filter(func(it): return it is Dictionary).slice(0, 3)
	# (THE ROYAL CARDS: game.ts restore, cleanCards)
	loot.cards = load("res://scripts/act3/royal_cards.gd").clean(s.get("cards"))
	# (FLOORS 16 TO 20's quests: game.ts restore)
	var q16 = main.get("quest1620")
	if q16 != null:
		q16.bird = str(s.get("bird", "")) if s.get("bird", "") in ["asked", "mended"] else ""
		q16.bird_parts = clampi(int(_num(s.get("birdParts"), 0)), 0, 7)
		q16.court = str(s.get("court", "")) if s.get("court", "") in ["asked", "given"] else ""
		q16.captain_jar = str(s.get("captainJar", "")) if s.get("captainJar", "") in ["got", "given"] else ""
	# his moves' slots: the words set in each, as they were (a word no longer one of the game's is let go)
	for side in ["front", "behind"]:
		var got = s.get(side)
		if not (got is Array) or got.size() != 3:
			continue
		var into: Array = h.loadout.front if side == "front" else h.loadout.behind
		for i in 3:
			into[i] = (got[i] as Array).map(func(w): return w if (w is String and loot._words["color"].has(w)) else null) if got[i] is Array else []
	loot.derive()
	h.loadout.set_level(loot.level, loot.ring_lit)
	# (back in his town, his life and his flasks full: game.ts restore)
	h.life = h.max_life
	loot.potions = loot.POTIONS


## The words he had bought from the wordsmith on this visit, gone from his shelf again (game.ts restore, wordsBought): once his
## town is laid out and the shelf rolled.
static func restore_bought(main, s: Dictionary) -> void:
	var loot = main.loot
	if s.get("wordsBought") is Array:
		for i in s["wordsBought"]:
			var k := int(i)
			if k >= 0 and k < loot.word_stock.size():
				loot.word_stock[k] = null
