## THE CITY'S RUNES WITH THE FLOOR 6–10 RUNES ON A MONSTER THAT CARRIES ONE (their doc's "On enemies" lines: tools/meldscity/
## docs_city2.txt; behind melds52.gd CITY2_ON). Laid on an altar, a meld does on its monsters what each of its two runes does there
## (foe_words.gd: twice, healing, exploding, the gaps in his armour, faster as it is hurt, its shield, longer, faster, wider; and
## the city's: dragged, cursed, slowed cooldowns, rooted, split in two), and a twist of its own, here, handed on to from
## foe_melds52.gd's moments (after_blow, tick, rage, shield, death, blast) and monster.gd's split (split). Numbers melds52.json
## `tune`, their `foe…` keys. What it lays on him is in the enemy's own pink and gold (fx_m52p_city2.gd).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")


static func _t(id: String) -> Dictionary:
	return M52.tune(id)


static func _tell(h, id: String, by, what := "foe") -> void:
	var e := {"id": id, "what": what, "x": h.world.x, "y": h.world.y, "foe": true}
	if by != null and is_instance_valid(by):
		e["x1"] = by.world.x
		e["y1"] = by.world.y
	h.m52._tell(e)


## What a blow from `by` that hurt him leaves, of these.
static func after_blow(F, k: Callable, by, _dmg: float) -> void:
	var h = F.main.hero
	var alive_by: bool = by != null and is_instance_valid(by) and not by.dead
	var s := func(w: String) -> bool: return float(k.call(w)) > 0.0
	var done := {}
	var tell := func(id: String) -> void:
		done[id] = true
		_tell(h, id, by)
	# (PULLING'S: Eddy keeps drawing him a moment after; Maelstrom and Whirlpool from farther)
	if s.call("eddy") and alive_by:
		by.m52["foe_eddy"] = float(_t("eddy")["foeSecs"])
		tell.call("eddy")
	if alive_by and (s.call("maelstrom") or s.call("whirlpool")):
		var far: float = float(_t("maelstrom")["foeFar"]) if s.call("maelstrom") else 1.0 + float(_t("whirlpool")["foeEach"]) * clampf(1.0 - by.life / maxf(1.0, by.max_life), 0.0, 1.0)
		var d: float = h.world.distance_to(by.world)
		if d > 0.9 and far > 1.0:
			var go: float = minf((far - 1.0) * 0.6, d - 0.8)
			h.knock((by.world - h.world) / d, go)
		tell.call("maelstrom" if s.call("maelstrom") else "whirlpool")
	# (HEXING'S: Refrain's second blow deeper; Grudge's curse twice as long; Omen's short but deep; Bloodcurse drinks deeper)
	if s.call("refrain") and alive_by and h.hex_t > 0.0:
		by.m52["foe_refrain"] = int(by.m52.get("foe_refrain", 0)) + 1
		if int(by.m52["foe_refrain"]) % 2 == 0:
			h.worse_f("hex", "refrain", "hex_more", 1.0 + float(_t("refrain")["foeDeeper"]))
			tell.call("refrain")
	if s.call("grudge") and h.hex_t > 0.0:
		h.worse_f("hex", "grudge", "hex_t", float(_t("grudge")["foeLonger"]))
		tell.call("grudge")
	if s.call("omen") and h.hex_t > 0.0:
		h.worse_f("hex", "omen", "hex_t", float(_t("omen")["foeShort"]))
		h.worse_f("hex", "omen", "hex_more", float(_t("omen")["foeDeeper"]))
		tell.call("omen")
	if s.call("bloodcurse") and alive_by and h.hex_t > 0.0:
		by.life = minf(by.max_life, by.life + by.max_life * 0.02 * float(_t("bloodcurse")["foeHeal"]))
		tell.call("bloodcurse")
	# (STILLING'S: Eternity's slow twice as long, Stutter's short but deep)
	if s.call("eternity") and h.still_t > 0.0:
		h.worse_f("still", "eternity", "still_t", float(_t("eternity")["foeLonger"]))
		tell.call("eternity")
	if s.call("stutter") and h.still_t > 0.0:
		h.worse_f("still", "stutter", "still_t", float(_t("stutter")["foeShort"]))
		h.still_k = minf(0.75, h.still_k * float(_t("stutter")["foeDeeper"]))
		tell.call("stutter")
	# (BINDING'S: Manacle roots him twice as long, Snag briefly)
	if s.call("manacle") and h.root_t > 0.0:
		h.worse_f("root", "manacle", "root_t", float(_t("manacle")["foeLonger"]))
		tell.call("manacle")
	if s.call("snag") and h.root_t > 0.0:
		h.worse_f("root", "snag", "root_t", float(_t("snag")["foeShort"]))
		tell.call("snag")
	# (any whose twist on him is its two runes at once: its moment as its blow lands, in its colour)
	for id in M52.T().get("city2", []):
		if not done.has(id) and s.call(id):
			tell.call(id)


## A monster's turn, awake and near, of these: Eddy drawing him in a moment after its blow.
static func tick(F, m, dt: float, _dist: float) -> void:
	if not m.m52.has("foe_eddy"):
		return
	var h = F.main.hero
	m.m52["foe_eddy"] = float(m.m52["foe_eddy"]) - dt
	var d: float = h.world.distance_to(m.world)
	if d > 0.9 and h.root_t <= 0.0:
		h.knock((m.world - h.world) / d, minf(0.9 * dt, d - 0.85))
	if float(m.m52["foe_eddy"]) <= 0.0:
		m.m52.erase("foe_eddy")


## Its pace, of these: Delirium faster while he is cursed; Flechette's halves quicker.
static func rage(F, m) -> float:
	var k := 1.0
	var h = F.main.hero
	if m.word_share("delirium") > 0.0 and h != null and h.hex_t > 0.0:
		k *= float(_t("delirium")["foeFast"])
	if bool(m.m52.get("foe_flechette", false)):
		k *= float(_t("flechette")["foeFast"])
	return k


## A blow of his on its shield: Talisman curses him.
static func shield(F, m, soaked: float) -> void:
	if soaked <= 0.0 or m.word_share("talisman") <= 0.0 or F.clock - float(m.m52.get("foe_tal", -99.0)) < 0.8:
		return
	m.m52["foe_tal"] = F.clock
	var h = F.main.hero
	var C: Dictionary = h.city.C()["hex"]
	h.hex_t = maxf(h.hex_t, float(C["monsterSecs"]))
	h.hex_more = maxf(h.hex_more, float(C["monster"]))
	_tell(h, "talisman", m)


## As it dies: Hexblast's blast curses him; Slow Fuse's slows his cooldowns.
static func death(F, m) -> void:
	var h = F.main.hero
	if h.world.distance_to(m.world) > 2.0:
		return
	if m.word_share("hexblast") > 0.0:
		var C: Dictionary = h.city.C()["hex"]
		h.hex_t = maxf(h.hex_t, float(C["monsterSecs"]))
		h.hex_more = maxf(h.hex_more, float(C["monster"]))
		_tell(h, "hexblast", m)
	if m.word_share("slowfuse") > 0.0:
		var S: Dictionary = h.city.C()["still"]
		var at: Vector2 = m.world
		F.main.get_tree().create_timer(float(_t("slowfuse")["foeWait"])).timeout.connect(func() -> void:
			if is_instance_valid(h) and h.world.distance_to(at) <= 2.0:
				h.still_t = maxf(h.still_t, float(S["monsterSecs"]))
				h.still_k = maxf(h.still_k, float(S["cooldowns"]))
				_tell(h, "slowfuse", null))


## Its dying blast, of these: Slow Fuse's late.
static func blast(m) -> Dictionary:
	if m.word_share("slowfuse") > 0.0:
		return {"r": 1.8, "wait": float(_t("slowfuse")["foeWait"]), "k": 1.0}
	return {}


## How many it splits into (Starburst's three).
static func halves_n(m, n: int) -> int:
	return maxi(n, 3) if m.word_share("starburst") > 0.0 else n


## A monster carrying one of these has split (monster.gd _split): what each meld makes of its halves.
static func split(F, m, halves: Array) -> void:
	if F == null:
		return
	var h = F.main.hero
	var has := func(w: String) -> bool: return m.word_share(w) > 0.0
	var told := func(id: String) -> void:
		h.m52._tell({"id": id, "what": "foeSplit", "x": m.world.x, "y": m.world.y, "m": m, "foe": true})
	# (the halves keep the floor 6–10 rune: Hydra's twice, Swarm's healing, Shellburst's blast, Riot's frenzy, Phalanx's shield)
	for pair in [["hydra", "twin"], ["swarm", "leech"], ["shellburst", "volatile"], ["riot", "frenzied"], ["phalanx", "guarding"]]:
		if has.call(pair[0]):
			for o in halves:
				o.words = [pair[1]]
			told.call(pair[0])
	if has.call("rebound"):
		for o in halves:
			o.max_life = maxf(1.0, roundf(o.max_life * float(_t("rebound")["foeLife"])))
			o.life = o.max_life
		told.call("rebound")
	if has.call("flechette"):
		for o in halves:
			o.m52["foe_flechette"] = true
		told.call("flechette")
	for id in ["pinpoint", "starburst"]:
		if has.call(id):
			told.call(id)
