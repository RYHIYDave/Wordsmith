## THE LAST FLOOR 1–10 MELDS ON A MONSTER THAT CARRIES ONE (his doc's "On enemies" lines and the animations' doc, each “Good”, 23 Nov
## 2026). As foe_melds52.gd is for the 52 before them, and handed on to from each of its moments: a blow's weight (harder), what a
## blow leaves (after_blow), its turn (tick), its pace (rage), its shield struck (shield), its death (death), its dying blast
## (blast). Each moment's look is told to the painters through the hero's rules (`h.m52._tell`, `foe`: on him). Numbers
## melds52.json `tune` (their `foe…` keys).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")


static func _t(id: String) -> Dictionary:
	return M52.tune(id)


static func _hurt_k(m) -> float:
	return clampf(1.0 - float(m.life) / maxf(1.0, float(m.max_life)), 0.0, 1.0)


static func _heal(m, share: float) -> void:
	if m != null and is_instance_valid(m) and not m.dead:
		m.life = minf(m.max_life, m.life + m.max_life * share)


## How much harder a blow lands on him, of these.
static func harder(F, k: Callable, by) -> float:
	var h = F.main.hero
	var mult := 1.0
	if by == null or not is_instance_valid(by) or by.dead:
		return mult
	var s := func(w: String) -> bool: return float(k.call(w)) > 0.0
	var rest: float = F.clock - float(by.m52.get("foe_last46", -99.0))
	var crit := false
	if s.call("onrush") and rest >= float(_t("onrush")["foeRest"]):
		mult *= 1.0 + float(_t("onrush")["foeMore"])
		h.m52._tell({"id": "onrush", "what": "foe", "x": by.world.x, "y": by.world.y, "m": by, "dx": h.world.x - by.world.x, "dy": h.world.y - by.world.y})
	if s.call("doubletap") and bool(by.m52.get("foe_tap", false)):
		crit = true
	if s.call("rapier") and randf() < float(_t("rapier")["foeEach"]) * _hurt_k(by):
		crit = true
	if s.call("riposte") and bool(by.m52.get("foe_riposte", false)):
		by.m52["foe_riposte"] = false
		crit = true
	if s.call("vendetta") and F.clock < float(by.m52.get("foe_vend_t", -99.0)) and randf() < float(_t("vendetta")["foeChance"]):
		crit = true
	if s.call("ambush") and not bool(by.m52.get("foe_hit_him", false)):
		crit = true
	# (THE PRECISE MELDS' first critical: a chance of its own, so Doubletap's second and Vendetta's run have one to follow)
	var first := 0.0
	for w in ["doubletap", "vendetta", "lancet", "detonator", "bullseye"]:
		if s.call(w):
			first = maxf(first, float(_t(w).get("foeCrit", 0.2 if w == "bullseye" else 0.15)))
	if first > 0.0 and randf() < first:
		crit = true
	by.m52["foe_crit46"] = crit
	if crit:
		mult *= float(F.T()["shiver"]["crit"])
		F._say(h.world, "Critical", "#ff8a80")
		for w in ["doubletap", "rapier", "riposte", "vendetta", "ambush", "bullseye", "lancet", "detonator"]:
			if s.call(w):
				h.m52._tell({"id": w, "what": "foe", "x": h.world.x, "y": h.world.y, "x1": by.world.x, "y1": by.world.y, "foe": true})
				break
	return mult


## What a blow from `by` that hurt him `dmg` leaves, of these.
static func after_blow(F, k: Callable, by, dmg: float) -> void:
	var h = F.main.hero
	var alive_by: bool = by != null and is_instance_valid(by) and not by.dead
	var away: Vector2 = (h.world - by.world).normalized() if alive_by and h.world.distance_to(by.world) > 0.01 else Vector2(1, 0)
	var s := func(w: String) -> bool: return float(k.call(w)) > 0.0
	var tell := func(id: String, extra := {}) -> void:
		var e := {"id": id, "what": "foe", "x": h.world.x, "y": h.world.y, "foe": true}
		if alive_by:
			e["x1"] = by.world.x
			e["y1"] = by.world.y
		e.merge(extra)
		h.m52._tell(e)
	var rest: float = F.clock - (float(by.m52.get("foe_last46", -99.0)) if alive_by else -99.0)
	var crit: bool = alive_by and bool(by.m52.get("foe_crit46", false))
	if s.call("hornet") and rest < float(_t("hornet")["foeWindow"]) and h.poison_t > 0.0:
		h.poison_dps *= 1.0 + float(_t("hornet")["foeDose"])
		tell.call("hornet")
	if s.call("charge") and alive_by and rest >= float(_t("charge")["foeRest"]):
		h.knock(away, float(_t("charge")["foeShove"]))
		tell.call("charge", {"dx": away.x, "dy": away.y})
	if s.call("mire") and h.poison_t > 0.0 and (h.held > 0.0 or h._knock_t > 0.0):
		h.poison_dps *= float(_t("mire")["foeFaster"])
		tell.call("mire")
	if s.call("icebreaker") and h.chill_t > 0.0:
		h.held = maxf(h.held, float(_t("icebreaker")["foeFreeze"]))
		h.frozen_t = maxf(h.frozen_t, float(_t("icebreaker")["foeFreeze"]))
		# (with the switch on, Frost's own ice bursts up round him, as for any other freeze: fx_looks.gd same)
		if preload("res://scripts/fx_looks.gd").same():
			F._tell({"t": "freeze", "x": h.world.x, "y": h.world.y})
		F._say(h.world, "Frozen", "#a5d8ff")
		tell.call("icebreaker")
	if s.call("anvil") and alive_by:
		F._ground(h.world, 0.8, float(_t("anvil")["foeFire"]), "burn", "fire", F._avg(by) * 0.15, [], by, "anvil")
		tell.call("anvil")
	if s.call("fulgurite") and alive_by:
		F._warn(h.world, 1.0, 0.6, F._avg(by) * 0.3, "lightning", by)
		tell.call("fulgurite", {"secs": float(_t("fulgurite")["foeSecs"])})
	if s.call("lamprey") and alive_by:
		_heal(by, float(_t("lamprey")["foeHeal"]) * (2.0 if rest < 0.6 else 1.0))
		tell.call("lamprey")
	if s.call("tempo") and alive_by:
		by.m52["foe_tempo"] = minf(float(_t("tempo")["foeMost"]), float(by.m52.get("foe_tempo", 0.0)) + float(_t("tempo")["foeFaster"]))
		tell.call("tempo")
	if s.call("reverb"):
		var L: float = float(_t("reverb")["foeLonger"])
		h.poison_t = minf(12.0, h.poison_t * L)
		h.burn_t = minf(12.0, h.burn_t * L)
		h.chill_t = minf(12.0, h.chill_t * L)
		tell.call("reverb")
	if s.call("staccato") and rest < 0.6:
		tell.call("staccato")
	if s.call("ripple") and alive_by:
		F._warn(h.world, float(_t("ripple")["foeR"]), 0.35, F._avg(by) * float(_t("ripple")["foeShare"]), "phys", by)
		tell.call("ripple", {"r": float(_t("ripple")["foeR"])})
	if s.call("lancet") and crit:
		_heal(by, 0.04 * float(_t("lancet")["foeHeal"]))
		tell.call("lancet")
	if s.call("feedingfrenzy") and alive_by:
		_heal(by, 0.03 * (1.0 + float(_t("feedingfrenzy")["foeMore"]) * _hurt_k(by)))
		tell.call("feedingfrenzy")
	if s.call("carapace") and alive_by:
		by.shield = minf(by.max_life * 0.3, by.shield + by.max_life * 0.05 * float(_t("carapace")["foeTop"]))
		tell.call("carapace")
	if s.call("transfusion") and alive_by:
		by.m52["foe_drip"] = 3.0
		tell.call("transfusion")
	if s.call("lifeline") and alive_by and by.life < by.max_life * float(_t("lifeline")["foeBelow"]):
		_heal(by, 0.05 * float(_t("lifeline")["foeMore"]))
		tell.call("lifeline")
	if s.call("bloodtide") and alive_by:
		for o in F.main._monsters.list:
			if is_instance_valid(o) and not o.dead and o.world.distance_to(by.world) <= 3.0:
				_heal(o, float(_t("bloodtide")["foeHeal"]))
		tell.call("bloodtide")
	if s.call("detonator") and crit and alive_by:
		F._warn(h.world, 1.2, float(_t("detonator")["foeDelay"]), F._avg(by) * float(_t("detonator")["foeShare"]), "fire", by)
		tell.call("detonator", {"secs": float(_t("detonator")["foeDelay"])})
	if s.call("vendetta") and crit and alive_by:
		by.m52["foe_vend_t"] = F.clock + float(_t("vendetta")["foeSecs"])
		tell.call("vendetta")
	if s.call("rampage") and alive_by and _hurt_k(by) > 0.2:
		F._warn(h.world, 1.0 + float(_t("rampage")["foeEach"]) * 5.0 * _hurt_k(by), 0.4, F._avg(by) * 0.3, "phys", by)
		tell.call("rampage", {"r": 1.0 + float(_t("rampage")["foeEach"]) * 5.0 * _hurt_k(by)})
	if s.call("parry") and alive_by:
		by.m52["foe_parry_t"] = F.clock + float(_t("parry")["foeSecs"])
		by.shield = maxf(by.shield, by.max_life * 0.1)
		tell.call("parry")
	if s.call("hourglass"):
		var L2: float = float(_t("hourglass")["foeLonger"])
		h.poison_t = minf(12.0, h.poison_t * L2)
		h.poison_dps *= L2
		h.burn_t = minf(12.0, h.burn_t * L2)
		h.burn_dps *= L2
		tell.call("hourglass")
	if s.call("aftermath") and alive_by:
		F._ground(h.world, 1.0, float(_t("aftermath")["foeSecs"]), "cracks", "phys", F._avg(by) * float(_t("aftermath")["foeDps"]), [], by, "aftermath")
		tell.call("aftermath", {"secs": float(_t("aftermath")["foeSecs"])})
	if s.call("whipcrack"):
		tell.call("whipcrack")
	if alive_by:
		by.m52["foe_last46"] = F.clock
		by.m52["foe_hit_him"] = true
		by.m52["foe_tap"] = crit and not bool(by.m52.get("foe_tap", false))


## Its turn: footprints, ice, a drip of life, shells grown back or spread, the trigger pulled.
static func tick(F, m, dt: float, dist: float) -> void:
	if m.words.is_empty():
		return
	var h = F.main.hero
	if m.word_share("firewalk") > 0.0 and m.state == "chase":
		m.m52["foe_step"] = float(m.m52.get("foe_step", 0.0)) - dt
		if float(m.m52["foe_step"]) <= 0.0:
			m.m52["foe_step"] = float(_t("firewalk")["foeEvery"])
			F._ground(m.world, 0.4, 1.5, "burn", "fire", F._avg(m) * 0.1, [], m, "firewalk")
	if m.m52.has("foe_drip"):
		m.m52["foe_drip"] = float(m.m52["foe_drip"]) - dt
		_heal(m, 0.01 * dt)
		if float(m.m52["foe_drip"]) <= 0.0:
			m.m52.erase("foe_drip")
	var had: float = float(m.m52.get("foe_shield46", 0.0))
	if m.word_share("redoubt") > 0.0 and had > 0.0 and m.shield <= 0.0 and not bool(m.m52.get("foe_second", false)):
		m.m52["foe_second"] = true
		m.shield = m.max_life * 0.08
		h.m52._tell({"id": "redoubt", "what": "foe", "x": m.world.x, "y": m.world.y, "m": m})
	if m.word_share("sanctuary") > 0.0:
		if had > 0.0 and m.shield <= 0.0:
			m.m52["foe_regrow"] = float(_t("sanctuary")["foeRegrow"])
		if m.m52.has("foe_regrow"):
			m.m52["foe_regrow"] = float(m.m52["foe_regrow"]) - dt
			if float(m.m52["foe_regrow"]) <= 0.0:
				m.m52.erase("foe_regrow")
				m.shield = m.max_life * 0.1
				h.m52._tell({"id": "sanctuary", "what": "foe", "x": m.world.x, "y": m.world.y, "m": m})
	if m.word_share("shieldwall") > 0.0 and m.shield > 0.0 and float(m.m52.get("foe_wall", 0.0)) < _hurt_k(m) - 0.15:
		m.m52["foe_wall"] = _hurt_k(m)
		m.shield *= 1.0 + float(_t("shieldwall")["foeEach"])
		h.m52._tell({"id": "shieldwall", "what": "foe", "x": m.world.x, "y": m.world.y, "m": m})
	if m.word_share("aegis") > 0.0 and m.shield > 0.0 and had <= 0.0:
		for o in F.main._monsters.list:
			if is_instance_valid(o) and o != m and not o.dead and o.world.distance_to(m.world) <= float(_t("aegis")["foeR"]) and o.shield <= 0.0:
				o.shield = m.shield * 0.5
		h.m52._tell({"id": "aegis", "what": "foe", "x": m.world.x, "y": m.world.y, "m": m, "r": float(_t("aegis")["foeR"])})
	m.m52["foe_shield46"] = m.shield
	if m.word_share("hairtrigger") > 0.0 and not m.dead and not m.boss and m.life < m.max_life * float(_t("hairtrigger")["foeBelow"]):
		h.m52._tell({"id": "hairtrigger", "what": "foe", "x": m.world.x, "y": m.world.y, "m": m})
		m.damage(m.life + 1.0, "phys", false, false, [], false, false, -1)


## Its pace and the quickness of its blows, of these.
static func rage(F, m) -> float:
	var k := 1.0
	var h = F.main.hero
	if m.word_share("glide") > 0.0 and F.main.wakes != null and is_instance_valid(F.main.wakes) and F.main.wakes.patch_at("ice", m.world) != null:
		k *= 1.0 + float(_t("glide")["foeFaster"])
	if m.word_share("quicksilver") > 0.0 and h != null and h.shock_t > 0.0:
		k *= 1.0 + float(_t("quicksilver")["foeFaster"])
		# (seen: the quicksilver running on it while he is shocked, told now and then)
		if F.clock - float(m.m52.get("foe_qs_told", -99.0)) > 1.2:
			m.m52["foe_qs_told"] = F.clock
			h.m52._tell({"id": "quicksilver", "what": "foe", "x": m.world.x, "y": m.world.y, "m": m})
	if m.m52.has("foe_tempo"):
		k *= 1.0 + float(m.m52["foe_tempo"])
	if m.word_share("fury") > 0.0:
		m.m52["foe_fury"] = maxf(float(m.m52.get("foe_fury", 0.0)), _hurt_k(m))
		k *= 1.0 + 0.3 * float(m.m52["foe_fury"])
	if m.word_share("spree") > 0.0:
		var S := _t("spree")
		if fmod(F.clock + float(m.id % 5), float(S["foeEvery"])) < float(S["foeSecs"]):
			k *= 1.0 + float(S["foeFaster"])
	return k


## A blow of his on its shield: Riposte's next blow critical.
static func shield(F, m, soaked: float) -> void:
	if soaked <= 0.0:
		return
	if m.word_share("riposte") > 0.0:
		m.m52["foe_riposte"] = true
		F.main.hero.m52._tell({"id": "riposte", "what": "foe", "x": m.world.x, "y": m.world.y, "m": m})


## As it dies: Cluster's bomblets, Bloodbloom's healing burst, Blastwave's throw.
static func death(F, m) -> void:
	var h = F.main.hero
	if m.word_share("cluster") > 0.0:
		for n in 2:
			var a := randf() * TAU
			F._warn(m.world + Vector2(cos(a), sin(a)) * 1.1, 0.9, 0.45, F._avg(m) * float(_t("cluster")["foeShare"]), "fire", m)
		h.m52._tell({"id": "cluster", "what": "foe", "x": m.world.x, "y": m.world.y})
	if m.word_share("bloodbloom") > 0.0:
		for o in F.main._monsters.list:
			if is_instance_valid(o) and o != m and not o.dead and o.world.distance_to(m.world) <= 2.5:
				_heal(o, float(_t("bloodbloom")["foeHeal"]))
		h.m52._tell({"id": "bloodbloom", "what": "foe", "x": m.world.x, "y": m.world.y, "r": 2.5})
	if m.word_share("blastwave") > 0.0 and h.world.distance_to(m.world) <= 2.6:
		var away: Vector2 = (h.world - m.world).normalized() if h.world.distance_to(m.world) > 0.01 else Vector2(1, 0)
		h.knock(away, float(_t("blastwave")["foeShove"]))
		h.m52._tell({"id": "blastwave", "what": "foe", "x": m.world.x, "y": m.world.y, "r": 2.6})


## Its dying blast, of these: Mayhem's by its speed, Minefield's with its shield up, Timebomb's later and harder.
static func blast(m) -> Dictionary:
	if m.word_share("timebomb") > 0.0:
		return {"r": 2.2, "wait": float(_t("timebomb")["foeDelay"]), "k": float(_t("timebomb")["foeBig"])}
	if m.word_share("minefield") > 0.0 and float(m.m52.get("foe_shield46", 0.0)) > 0.0:
		return {"r": 2.0, "wait": 0.5, "k": float(_t("minefield")["foeBig"])}
	if m.word_share("mayhem") > 0.0:
		return {"r": 1.8 + float(_t("mayhem")["foeBig"]), "wait": 0.5, "k": 1.4}
	return {}
