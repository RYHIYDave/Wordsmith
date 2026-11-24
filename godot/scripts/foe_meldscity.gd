## THE CITY'S MELDS ON A MONSTER THAT CARRIES ONE (his doc Floor 11–15 Melds' "On enemies" lines, its runes and animations, “Good”,
## “Yep good”, “Good to go”, 24 Nov 2026). As foe_melds46.gd is for the 46: laid on an altar, a meld does on its monsters what each
## of its two runes does there (foe_words.gd, hero.gd _city_words: dragged, cursed, slowed cooldowns, rooted, split in two), and a
## twist of its own, here; foe_melds52.gd hands on to these from each of its moments: a blow's weight (harder), what a blow leaves
## (after_blow), its turn (tick), its pace (rage); and monster.gd from its split in two (split). Numbers melds52.json `tune`
## (their `foe…` keys). What it lays on him to step out of is the game's own warning (perils.gd warn): the enemy's pink and gold.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")


static func _t(id: String) -> Dictionary:
	return M52.tune(id)


## How much harder a blow lands on him, of these.
static func harder(F, k: Callable, by) -> float:
	var h = F.main.hero
	var alive_by: bool = by != null and is_instance_valid(by) and not by.dead
	var s := func(w: String) -> bool: return float(k.call(w)) > 0.0
	var mult := 1.0
	var tell := func(id: String) -> void:
		var e := {"id": id, "what": "foe", "x": h.world.x, "y": h.world.y, "foe": true}
		if alive_by:
			e["x1"] = by.world.x
			e["y1"] = by.world.y
		h.m52._tell(e)
	# (Maw, Gravity: its next blow after a drag lands harder)
	for id in ["maw", "gravity"]:
		if s.call(id) and alive_by and bool(by.m52.get("foe_dragged", false)):
			by.m52["foe_dragged"] = false
			mult *= 1.0 + float(_t(id)["foeMore"])
			tell.call(id)
	if s.call("doom") and h.hex_t > 0.0:
		mult *= 1.0 + float(_t("doom")["foeMore"])
		tell.call("doom")
	if s.call("stasis") and h.still_t > 0.0:
		mult *= 1.0 + float(_t("stasis")["foeMore"]) * clampf(h.still_k / 0.5, 0.0, 1.0)
		tell.call("stasis")
	for id in ["shackle", "anchor"]:
		if s.call(id) and h.root_t > 0.0:
			mult *= 1.0 + float(_t(id)["foeMore"])
			tell.call(id)
	return mult


## What a blow from `by` that hurt him `dmg` leaves, of these (after his own city words: hero.gd _city_words).
static func after_blow(F, k: Callable, by, dmg: float) -> void:
	var h = F.main.hero
	var alive_by: bool = by != null and is_instance_valid(by) and not by.dead
	var s := func(w: String) -> bool: return float(k.call(w)) > 0.0
	var done := {}
	var tell := func(id: String, extra := {}) -> void:
		done[id] = true
		var e := {"id": id, "what": "foe", "x": h.world.x, "y": h.world.y, "foe": true}
		if alive_by:
			e["x1"] = by.world.x
			e["y1"] = by.world.y
		e.merge(extra)
		h.m52._tell(e)
	var dragged: bool = float(k.call("pulling")) > 0.0 or s.call("maw") or s.call("sump") or s.call("drift") or s.call("firewhirl") or s.call("lodestone") or s.call("riptide") or s.call("gravity")
	if dragged and alive_by:
		by.m52["foe_dragged"] = true
	# (PULLING'S MELDS: what each drag does)
	if s.call("sump") and alive_by:
		h.poison_dps = maxf(h.poison_dps if h.poison_t > 0.0 else 0.0, 0.0) + dmg * float(_t("sump")["foeDose"]) / 4.0
		h.poison_t = maxf(h.poison_t, 4.0)
		tell.call("sump")
	if s.call("drift") and alive_by and h.chill_t > 0.0:
		h.pulled_to(by.world, float(_t("drift")["foeK"]) - 1.0)
		tell.call("drift")
	if s.call("firewhirl") and alive_by:
		h.burn_dps = maxf(h.burn_dps if h.burn_t > 0.0 else 0.0, dmg * 0.3 / 3.0)
		h.burn_t = 3.0
		tell.call("firewhirl")
	if s.call("lodestone") and alive_by and h.shock_t > 0.0:
		h.pulled_to(by.world, float(_t("lodestone")["foeK"]) - 1.0)
		tell.call("lodestone")
	if s.call("riptide") and alive_by:
		by.m52["foe_rush"] = float(_t("riptide")["foeRushSecs"])
		tell.call("riptide")
	if s.call("gravity") and alive_by:
		# (it pulls him in instead of knocking him back)
		h._knock_t = 0.0
		h.pulled_to(by.world, 1.0)
		tell.call("gravity")
	# (HEXING'S MELDS, on a cursed him)
	if s.call("plague") and h.hex_t > 0.0 and h.poison_t > 0.0:
		h.worse("poison", "plague", float(_t("plague")["foeFaster"]), true)
		tell.call("plague")
	if s.call("hoarfrost") and h.chill_t > 0.0 and h.hex_t > 0.0:
		h.hex_t *= float(_t("hoarfrost")["foeLonger"])
		tell.call("hoarfrost")
	if s.call("brimstone") and h.hex_t > 0.0 and h.burn_t > 0.0:
		h.burn_t *= float(_t("brimstone")["foeLonger"])
		tell.call("brimstone")
	if s.call("burden") and alive_by and h.hex_t > 0.0:
		var away: Vector2 = (h.world - by.world).normalized() if h.world.distance_to(by.world) > 0.01 else Vector2(1, 0)
		h.knock(away, float(_t("burden")["foeShove"]))
		tell.call("burden", {"dx": away.x, "dy": away.y})
	# (STILLING'S MELDS: what lingers on him lingers longer)
	if s.call("stagnation") and h.poison_t > 0.0:
		h.poison_t *= float(_t("stagnation")["foeLonger"])
		tell.call("stagnation")
	if s.call("slowburn") and h.burn_t > 0.0:
		h.burn_t *= float(_t("slowburn")["foeLonger"])
		tell.call("slowburn")
	if s.call("stormglass") and h.shock_t > 0.0:
		h.shock_t *= float(_t("stormglass")["foeLonger"])
		tell.call("stormglass")
	# (BINDING'S MELDS, on a rooted him)
	if s.call("strangler") and h.root_t > 0.0 and h.poison_t > 0.0:
		h.worse("poison", "strangler", float(_t("strangler")["foeFaster"]), true)
		tell.call("strangler")
	if s.call("icebound") and h.root_t > 0.0 and h.chill_t > 0.0:
		h.root_t *= float(_t("icebound")["foeLonger"])
		tell.call("icebound")
	if s.call("firetrap") and h.root_t > 0.0 and h.burn_t > 0.0:
		h.worse("burn", "firetrap", float(_t("firetrap")["foeHotter"]))
		tell.call("firetrap")
	if s.call("anchor") and h.root_t > 0.0:
		# (rooted where he stands, not knocked back)
		h._knock_t = 0.0
		tell.call("anchor")
	if s.call("tether") and alive_by and h.root_t > 0.0:
		by.m52["foe_tether"] = h.root_t
	if s.call("shackle") and h.root_t > 0.0:
		tell.call("shackle")
	# (a meld whose twist on him is its two runes at once, and any not told above: its moment as its blow lands, in its colour; a
	# curse it lays, in the enemy's pink and gold: fx_m52p_city.gd)
	for id in M52.T().get("city", []):
		if not done.has(id) and not M52.is_new_rank(id) and s.call(id):
			tell.call(id)


## A monster's turn, awake and near, of these.
static func tick(F, m, dt: float, dist: float) -> void:
	if m.words.is_empty():
		return
	var h = F.main.hero
	if m.m52.has("foe_rush"):
		m.m52["foe_rush"] = float(m.m52["foe_rush"]) - dt
		if float(m.m52["foe_rush"]) <= 0.0:
			m.m52.erase("foe_rush")
	# (Jinx: while he is cursed, its lightning reaches him from farther: a warned strike where he stands)
	if m.word_share("jinx") > 0.0 and h.hex_t > 0.0 and m.state != "sleep" and dist <= 3.5 * float(_t("jinx")["foeReach"]):
		m.m52["foe_jinx"] = float(m.m52.get("foe_jinx", 1.5)) - dt
		if float(m.m52["foe_jinx"]) <= 0.0:
			m.m52["foe_jinx"] = 2.5
			F._warn(h.world, 0.9, 0.6, F._avg(m) * 0.35, "lightning", m)
			h.m52._tell({"id": "jinx", "what": "foe", "x": h.world.x, "y": h.world.y, "x1": m.world.x, "y1": m.world.y, "foe": true})
	# (Tether: while he is rooted, it shocks him again)
	if m.m52.has("foe_tether"):
		m.m52["foe_tether"] = float(m.m52["foe_tether"]) - dt
		m.m52["foe_teth_t"] = float(m.m52.get("foe_teth_t", 0.0)) - dt
		if h.root_t > 0.0 and float(m.m52["foe_teth_t"]) <= 0.0:
			m.m52["foe_teth_t"] = float(_t("tether")["foeEvery"])
			h.shock_t = maxf(h.shock_t, 1.0)
			h.hurt_by(F._avg(m) * float(_t("tether")["foeK"]), "lightning", [], {}, null, h.world)
			h.m52._tell({"id": "tether", "what": "foe", "x": h.world.x, "y": h.world.y, "x1": m.world.x, "y1": m.world.y, "foe": true})
		if float(m.m52["foe_tether"]) <= 0.0:
			m.m52.erase("foe_tether")
	# (Sleet's halves: ice where they walk)
	if m.m52.has("foe_sleet") and m.state == "chase":
		m.m52["foe_sleet"] = float(m.m52["foe_sleet"]) - dt
		if float(m.m52["foe_sleet"]) <= 0.0:
			m.m52["foe_sleet"] = float(_t("sleet")["foeTrail"])
			F._ground(m.world, 0.45, 2.0, "ice", "frost", F._avg(m) * 0.05, [], m, "sleet")
	# (Fractal's halves: a crackling arc between them; crossing it shocks him)
	if m.m52.has("foe_fractal"):
		var other = m.m52["foe_fractal"]
		m.m52["foe_fr_t"] = float(m.m52.get("foe_fr_t", float(_t("fractal")["foeSecs"]))) - dt
		if other == null or not is_instance_valid(other) or other.dead or float(m.m52["foe_fr_t"]) <= 0.0:
			m.m52.erase("foe_fractal")
		elif m.get_instance_id() < other.get_instance_id():
			var a: Vector2 = m.world
			var c: Vector2 = other.world
			var near: Vector2 = Geometry2D.get_closest_point_to_segment(h.world, a, c)
			m.m52["foe_fr_hit"] = float(m.m52.get("foe_fr_hit", 0.0)) - dt
			if near.distance_to(h.world) <= 0.35 and float(m.m52["foe_fr_hit"]) <= 0.0:
				m.m52["foe_fr_hit"] = 0.6
				h.shock_t = maxf(h.shock_t, 1.5)
				h.hurt_by(F._avg(m) * float(_t("fractal")["foeK"]), "lightning", [], {}, null, h.world)
				h.m52._tell({"id": "fractal", "what": "foe", "x": h.world.x, "y": h.world.y, "x1": a.x, "y1": a.y, "foe": true})
			if F.clock - float(m.m52.get("foe_fr_told", -99.0)) > 0.25:
				m.m52["foe_fr_told"] = F.clock
				h.m52._tell({"id": "fractal", "what": "foeArc", "x": a.x, "y": a.y, "x1": c.x, "y1": c.y, "foe": true})


## Its pace and the quickness of its blows, of these.
static func rage(F, m) -> float:
	var k := 1.0
	var h = F.main.hero
	if m.m52.has("foe_rush"):
		k *= float(_t("riptide")["foeRush"])
	if m.word_share("whisper") > 0.0 and h != null and h.hex_t > 0.0:
		k *= float(_t("whisper")["foeFast"])
	if bool(m.m52.get("foe_scatter", false)):
		k *= float(_t("scatter")["foeFast"])
	return k


## A monster carrying one of these has split in two (monster.gd _split): what each meld makes of its halves. `halves` the two.
static func split(F, m, halves: Array) -> void:
	if F == null:
		return
	var h = F.main.hero
	var has := func(w: String) -> bool: return m.word_share(w) > 0.0
	var told := func(id: String) -> void:
		h.m52._tell({"id": id, "what": "foeSplit", "x": m.world.x, "y": m.world.y, "m": m, "foe": true})
	if has.call("splinter"):
		for o in halves:
			o.max_life = maxf(1.0, roundf(m.max_life * float(_t("splinter")["foeLife"])))
			o.life = o.max_life
			o.r /= float(F.main.hero.city.C()["split"]["look"]) if F.main.hero.city.C().has("split") else 1.0
			o.look = 1.0
		told.call("splinter")
	if has.call("spore"):
		for o in halves:
			F._ground(o.world, float(_t("spore")["foeCloud"]), 3.0, "venom", "poison", F._avg(m) * 0.15, [], m, "spore")
		told.call("spore")
	if has.call("sleet"):
		for o in halves:
			o.m52["foe_sleet"] = 0.0
		told.call("sleet")
	if has.call("embers"):
		for o in halves:
			o.words = ["fire"]
			o.set_meta("wreathed", true)
		told.call("embers")
	if has.call("fractal") and halves.size() >= 2:
		halves[0].m52["foe_fractal"] = halves[1]
		halves[1].m52["foe_fractal"] = halves[0]
		told.call("fractal")
	if has.call("scatter"):
		for o in halves:
			o.m52["foe_scatter"] = true
		told.call("scatter")
	if has.call("rubble"):
		if h.world.distance_to(m.world) <= 1.6:
			var away: Vector2 = (h.world - m.world).normalized() if h.world.distance_to(m.world) > 0.01 else Vector2(1, 0)
			h.knock(away, float(_t("rubble")["foeShove"]))
		told.call("rubble")
	# (the city's runes with each other: both halves keep the other rune)
	for pair in [["confluence", "pulling"], ["coven", "hexing"], ["web", "binding"], ["constellation", "stilling"]]:
		if has.call(pair[0]):
			for o in halves:
				o.words = [pair[1]]
			told.call(pair[0])
	if has.call("constellation"):
		for k in 3:
			var at: Vector2 = m.world + Vector2(randf_range(-0.9, 0.9), randf_range(-0.6, 0.6))
			F._ground(at, 0.35, 3.0, "still", "phys", 0.0, ["stilling"], m, "constellation")
