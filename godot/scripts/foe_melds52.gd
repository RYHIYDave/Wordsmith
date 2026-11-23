## THE 52 DESIGNED MELDS ON A MONSTER THAT CARRIES ONE (his docs' "On enemies" lines, approved 23 Nov 2026). Laid on an altar, a
## meld does on its monsters what each of its two runes does there (foe_words.gd: both words, as the game's melds), and a twist of
## its own, here; a level 2 rune is its rune half as strong again (monster.gd word_share, `foe.rankBy`). foe_words.gd hands on to
## these from its own moments: a blow's weight (harder), what a blow leaves (after_blow), its turn (tick), its pace (rage), its
## shield struck (shield), its death (death), its dying blast (blast). Numbers melds52.json `tune` (their `foe…` keys).
## Its warnings of what to step out of are the game's own (perils.gd warn): the enemy's pink and gold.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
## (THE LAST FLOOR 1–10 MELDS on a monster, handed on to from each moment here)
const F46 := preload("res://scripts/foe_melds46.gd")


static func _t(id: String) -> Dictionary:
	return M52.tune(id)


static func _hurt_k(m) -> float:
	return clampf(1.0 - float(m.life) / maxf(1.0, float(m.max_life)), 0.0, 1.0)


## How much harder a blow lands on him, of these.
static func harder(F, k: Callable, parts: Array, by) -> float:
	var h = F.main.hero
	var mult := 1.0
	var alive_by: bool = by != null and is_instance_valid(by) and not by.dead
	var crit := false
	if float(k.call("bloodlust")) > 0.0 and alive_by and by.life >= by.max_life - 0.5:
		mult *= 1.0 + float(_t("bloodlust")["foeMore"])
		h.m52._tell({"id": "bloodlust", "what": "foe", "x": by.world.x, "y": by.world.y, "m": by})
	if float(k.call("duelist")) > 0.0 and alive_by:
		var alone := true
		for o in F.main._monsters.list:
			if is_instance_valid(o) and o != by and not o.dead and o.world.distance_to(h.world) <= 4.0:
				alone = false
				break
		crit = crit or alone
	if float(k.call("seeker")) > 0.0 and h.shock_t > 0.0:
		crit = true
	if float(k.call("quickdraw")) > 0.0 and alive_by:
		crit = crit or F.clock - float(by.m52.get("foe_last", -99.0)) >= float(_t("quickdraw")["foeRest"])
	if float(k.call("pressurepoint")) > 0.0 and alive_by and bool(by.m52.get("foe_point", false)):
		by.m52["foe_point"] = false
		crit = true
	var needle: bool = float(k.call("needle")) > 0.0 and randf() < float(_t("needle").get("foeCrit", 0.2))
	var brand: bool = float(k.call("brand")) > 0.0 and randf() < float(_t("brand").get("foeCrit", 0.2))
	if needle or brand:
		crit = true
		if alive_by:
			by.m52["foe_crit"] = "needle" if needle else "brand"
	if crit:
		mult *= float(F.T()["shiver"]["crit"])
		F._say(h.world, "Critical", "#ff8a80")
		for w in ["duelist", "needle", "brand", "seeker", "quickdraw", "pressurepoint"]:
			if float(k.call(w)) > 0.0 and alive_by:
				h.m52._tell({"id": w, "what": "foe", "x": h.world.x, "y": h.world.y, "x1": by.world.x, "y1": by.world.y, "foe": true})
				break
	if float(k.call("berserk")) > 0.0 and alive_by:
		mult *= 1.0 + float(_t("berserk")["foeMore"]) * _hurt_k(by)
	if float(k.call("bulwark")) > 0.0 and alive_by and by.shield > 0.0:
		mult *= 1.0 + float(_t("bulwark")["foeMore"])
	if float(k.call("momentum")) > 0.0 and alive_by:
		if F.clock - float(by.m52.get("foe_last", -99.0)) > float(_t("momentum")["hold"]):
			by.m52["foe_mom"] = 0
		mult *= 1.0 + float(_t("momentum")["foeEach"]) * int(by.m52.get("foe_mom", 0))
	if float(k.call("daze")) > 0.0 and (h.held > 0.0 or h._knock_t > 0.0):
		mult *= 1.0 + float(_t("daze")["foeMore"])
	return mult * F46.harder(F, k, by)


## What a blow from `by` that hurt him `dmg` leaves, of these.
static func after_blow(F, k: Callable, by, dmg: float, parts: Array) -> void:
	var h = F.main.hero
	var alive_by: bool = by != null and is_instance_valid(by) and not by.dead
	var away: Vector2 = (h.world - by.world).normalized() if alive_by and h.world.distance_to(by.world) > 0.01 else Vector2(1, 0)
	var s := func(w: String) -> float: return float(k.call(w))
	if s.call("onslaught") > 0.0:
		h.knock(away, float(_t("onslaught")["foeShove"]))
		h.m52._tell({"id": "onslaught", "what": "foe", "x": h.world.x, "y": h.world.y, "foe": true})
	if s.call("viper") > 0.0:
		h.m52._tell({"id": "viper", "what": "foe", "x": h.world.x, "y": h.world.y, "foe": true})
	if s.call("viper") > 0.0 and h.poison_t > 0.0:
		h.poison_dps *= 1.0 + float(_t("viper")["foeDoses"]) * 0.5
	if s.call("flashfreeze") > 0.0 and h.chill_t > 0.0:
		h.held = maxf(h.held, float(_t("flashfreeze")["foeFreeze"]))
		h.m52._tell({"id": "flashfreeze", "what": "foe", "x": h.world.x, "y": h.world.y, "foe": true})
		F._tell({"t": "freeze", "x": h.world.x, "y": h.world.y})
		F._say(h.world, "Frozen", "#a5d8ff")
	if s.call("rekindle") > 0.0 and h.burn_t > 0.0:
		h.m52.on_him["rekindle"] = 1
	if s.call("aftershock") > 0.0 and alive_by:
		var A := _t("aftershock")
		F._warn(h.world, float(A["foeR"]), float(A["foeDelay"]), F._avg(by) * float(A["foeShare"]), "phys", by)
	if s.call("coldblood") > 0.0 and alive_by and h.chill_t > 0.0:
		by.life = minf(by.max_life, by.life + by.max_life * 0.03)
		h.m52._tell({"id": "coldblood", "what": "foe", "x": h.world.x, "y": h.world.y, "x1": by.world.x, "y1": by.world.y})
	if s.call("conduit") > 0.0 and parts.any(func(p): return p[0] == "lightning"):
		for o in F.main._monsters.list:
			if is_instance_valid(o) and not o.dead and o.world.distance_to(h.world) <= 3.0:
				o.life = minf(o.max_life, o.life + o.max_life * 0.02)
				h.m52._tell({"id": "conduit", "what": "foe", "x": h.world.x, "y": h.world.y, "x1": o.world.x, "y1": o.world.y})
	if s.call("secondwind") > 0.0 and alive_by:
		by.m52["foe_wind_t"] = float(_t("secondwind")["foeSecs"])
		h.m52._tell({"id": "secondwind", "what": "foe", "x": by.world.x, "y": by.world.y, "m": by})
	if s.call("marrow") > 0.0 and alive_by and (s.call("heavy") > 0.0 or h._knock_t > 0.0):
		by.life = minf(by.max_life, by.life + by.max_life * float(_t("marrow")["foeHeal"]))
		h.m52._tell({"id": "marrow", "what": "foe", "x": h.world.x, "y": h.world.y, "x1": by.world.x, "y1": by.world.y})
	if alive_by:
		var crit: String = str(by.m52.get("foe_crit", ""))
		by.m52.erase("foe_crit")
		if crit == "needle" and h.poison_t > 0.0:
			h.poison_dps *= 2.0
		if crit == "brand" and h.burn_t > 0.0:
			h.burn_dps *= 2.0
			F._say(h.world, "Branded", "#ff8a80")
		if s.call("pressurepoint") > 0.0 and h._knock_t > 0.0:
			by.m52["foe_point"] = true
		by.m52["foe_mom"] = int(by.m52.get("foe_mom", 0)) + 1
		by.m52["foe_last"] = F.clock
		if s.call("flurry") > 0.0:
			by.m52["foe_flurry"] = minf(float(_t("flurry")["foeMost"]), float(by.m52.get("foe_flurry", 0.0)) + float(_t("flurry")["foeFaster"]))
	if s.call("fever") > 0.0 and alive_by and h.poison_t > 0.0:
		h.poison_dps *= 1.0 + 0.5 * _hurt_k(by) * float(_t("fever")["foeFaster"])
	if s.call("whiteout") > 0.0 and alive_by and h.chill_t > 0.0:
		h.chill_k = minf(0.85, h.chill_k + float(_t("whiteout")["foeSlow"]) * _hurt_k(by))
	if s.call("overcharge") > 0.0 and alive_by and parts.any(func(p): return p[0] == "lightning") and _hurt_k(by) > 0.4:
		F._warn(h.world, 1.0 + float(_t("overcharge")["foeReach"]) * _hurt_k(by), 0.5, F._avg(by) * 0.4, "lightning", by)
	if s.call("juggernaut") > 0.0 and alive_by:
		h.knock(away, 0.6 * _hurt_k(by))
		h.m52._tell({"id": "juggernaut", "what": "foe", "x": h.world.x, "y": h.world.y, "r": 0.8 + 1.2 * _hurt_k(by), "foe": true})
	if s.call("canker") > 0.0 and h.poison_t > 0.0:
		h.poison_t = maxf(h.poison_t, float(preload("res://scripts/words.gd").data()["poison"]["time"]))
	if s.call("bedrock") > 0.0:
		h.held = maxf(h.held, 0.3 * float(_t("bedrock")["foeLonger"]))
	if s.call("bloat") > 0.0 and h.poison_t > 0.0:
		h.m52.on_him["bloat"] = F._avg(by) if alive_by else dmg
	if s.call("coldsnap") > 0.0 and h.chill_t > 0.0:
		h.chill_t = minf(h.chill_t, 1.2)
		h.chill_k = minf(0.85, h.chill_k * 1.5)
	if s.call("flashfire") > 0.0 and h.burn_t > 0.0:
		h.burn_dps *= 1.5
		h.burn_t = minf(h.burn_t, 1.5)
		h.m52.on_him["flare"] = F._avg(by) if alive_by else dmg
	if s.call("jolt") > 0.0 and parts.any(func(p): return p[0] == "lightning"):
		h.hurt_by(dmg * float(_t("jolt")["foeJolt"]) * 0.3, "lightning", [], {}, null, h.world)
	if s.call("miasma") > 0.0 and alive_by:
		F._ground(h.world, 1.2, float(_t("miasma")["foeHaze"]), "venom", "poison", F._avg(by) * float(_t("miasma")["foeDps"]), [], by, "miasma")
	if s.call("glacier") > 0.0 and alive_by:
		F._ground(h.world, 1.2, float(_t("glacier")["foeFrost"]), "ice", "frost", F._avg(by) * 0.1, [], by, "glacier")
	if s.call("inferno") > 0.0 and alive_by:
		F._ground(h.world, 1.0, float(_t("inferno")["foeFire"]), "burn", "fire", F._avg(by) * 0.15, [], by, "inferno")
	if s.call("stormfront") > 0.0 and alive_by and parts.any(func(p): return p[0] == "lightning"):
		F._warn(h.world, 1.4 + float(_t("stormfront")["foeWider"]), 0.6, F._avg(by) * 0.3, "lightning", by)
		h.m52._tell({"id": "stormfront", "what": "foe", "x": h.world.x, "y": h.world.y, "r": 1.4 + float(_t("stormfront")["foeWider"]), "foe": true})
	if s.call("gale") > 0.0:
		h.knock(away, float(_t("gale")["foeShove"]))
		h.m52._tell({"id": "gale", "what": "foe", "x": h.world.x, "y": h.world.y, "dx": away.x, "dy": away.y, "foe": true})
	if s.call("earthquake") > 0.0:
		h.knock(away, 1.0 + float(_t("earthquake")["foeReach"]))
		h.m52._tell({"id": "earthquake", "what": "foe", "x": h.world.x, "y": h.world.y, "r": 1.0 + float(_t("earthquake")["foeReach"]), "foe": true})
	F46.after_blow(F, k, by, dmg)


## Its turn: Permafrost deepening his chill near it; Tempest's arcs at him while he is shocked; Cinderward's shield bursting;
## the bursts of speed wearing off.
static func tick(F, m, dt: float, dist: float) -> void:
	if m.m52.is_empty() and m.words.is_empty():
		return
	F46.tick(F, m, dt, dist)
	var h = F.main.hero
	if m.word_share("permafrost") > 0.0 and dist <= 2.5 and h.chill_t > 0.0:
		h.chill_k = minf(float(_t("permafrost")["foeMost"]), h.chill_k + float(_t("permafrost")["foeDeeper"]) * dt)
	if m.word_share("tempest") > 0.0 and dist <= 6.0 and h.shock_t > 0.0:
		m.m52["foe_zap"] = float(m.m52.get("foe_zap", 0.0)) - dt
		if float(m.m52["foe_zap"]) <= 0.0:
			m.m52["foe_zap"] = 0.8
			F._tell({"t": "arc", "x0": h.world.x, "y0": h.world.y - 1.0, "x1": h.world.x, "y1": h.world.y, "meld": "tempest", "foe": true})
			h.hurt_by(F._avg(m) * float(_t("tempest")["foeZap"]) * 4.0, "lightning", [], {}, null, h.world)
	if m.word_share("cinderward") > 0.0:
		var had: float = float(m.m52.get("foe_shield", 0.0))
		if had > 0.0 and m.shield <= 0.0:
			F._warn(m.world, 1.6, 0.35, F._avg(m), "fire", m)
			F._say(m.world, "Its shield bursts", "#ffb070")
		m.m52["foe_shield"] = m.shield
	for key in ["foe_wind_t", "foe_blur_t"]:
		if m.m52.has(key):
			m.m52[key] = float(m.m52[key]) - dt
			if float(m.m52[key]) <= 0.0:
				m.m52.erase(key)
	if m.m52.has("foe_flurry") and F.clock - float(m.m52.get("foe_last", -99.0)) > 2.0:
		m.m52.erase("foe_flurry")
	if m.word_share("blur") > 0.0 and not m.m52.has("foe_blurred") and m.life < m.max_life * float(_t("blur")["foeBelow"]):
		m.m52["foe_blurred"] = true
		m.m52["foe_blur_t"] = float(_t("blur")["foeSecs"])
		F._say(m.world, "A blur!", "#ff8a80")


## Its pace and the quickness of its blows, of these.
static func rage(F, m) -> float:
	var k := 1.0
	if m.m52.has("foe_flurry"):
		k *= 1.0 + float(m.m52["foe_flurry"])
	if m.m52.has("foe_wind_t"):
		k *= 1.0 + float(_t("secondwind")["foeFaster"])
	if m.m52.has("foe_blur_t"):
		k *= 1.0 + float(_t("blur")["foeFaster"])
	if m.word_share("windward") > 0.0 and m.shield > 0.0:
		k *= 1.0 + float(_t("windward")["foeFaster"])
	if m.word_share("tailwind") > 0.0 and F.clock - float(m.m52.get("foe_last", -99.0)) < 3.0:
		k *= 1.25
	if m.word_share("blink") > 0.0:
		var B := _t("blink")
		if fmod(F.clock + float(m.id % 7), float(B["foeEvery"])) < float(B["foeSecs"]):
			k *= float(B["foeDart"])
	return k * F46.rage(F, m)


## A blow of his on its shield: Hemlock poisons him, Static shocks him.
static func shield(F, m, soaked: float) -> void:
	if soaked <= 0.0:
		return
	F46.shield(F, m, soaked)
	var h = F.main.hero
	if m.word_share("hemlock") > 0.0 and F.clock - float(m.m52.get("foe_hem", -99.0)) > 0.8:
		m.m52["foe_hem"] = F.clock
		h.poison_t = maxf(h.poison_t, 3.0)
		h.poison_dps = maxf(h.poison_dps, F._avg(m) * 0.15)
		F._say(h.world, "Poisoned", "#9be36a")
	if m.word_share("static") > 0.0 and F.clock - float(m.m52.get("foe_sta", -99.0)) > 0.8:
		m.m52["foe_sta"] = F.clock
		F._tell({"t": "arc", "x0": m.world.x, "y0": m.world.y, "x1": h.world.x, "y1": h.world.y, "meld": "static", "foe": true})
		h.shock_t = maxf(h.shock_t, 2.0)
		h.hurt_by(F._avg(m) * 0.3, "lightning", [], {}, null, m.world)


## As it dies: Smoulder's coals where it fell; Concussion's blast stunning him.
static func death(F, m) -> void:
	var h = F.main.hero
	if m.word_share("smoulder") > 0.0:
		F._ground(m.world, 1.2, 4.0, "burn", "fire", F._avg(m) * 0.25, [], m, "smoulder")
	if m.word_share("concussion") > 0.0 and h.world.distance_to(m.world) <= 2.2:
		var away: Vector2 = (h.world - m.world).normalized() if h.world.distance_to(m.world) > 0.01 else Vector2(1, 0)
		h.knock(away, float(_t("concussion")["foeShove"]))
		h.held = maxf(h.held, float(_t("concussion")["foeStun"]))
		h.m52._tell({"id": "concussion", "what": "foe", "x": m.world.x, "y": m.world.y, "r": 2.2})
		F._say(h.world, "Stunned", "#ff8a80")
	F46.death(F, m)


## Its dying blast, of these: Quickfuse's at once.
static func blast(m) -> Dictionary:
	if m.word_share("quickfuse") > 0.0:
		return {"r": 1.8, "wait": 0.08, "k": 1.5}
	return F46.blast(m)
