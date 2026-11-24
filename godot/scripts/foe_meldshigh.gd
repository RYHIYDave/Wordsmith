## THE HIGH CITY'S RUNES MELDED ON A MONSTER THAT CARRIES ONE (his doc High City Melds, each one's "On enemies"; behind melds52.gd
## HIGH_ON). Laid on an altar, a meld does on its monsters what each of its two runes does there (Piercing's shots through walls,
## Bleeding's blows that make him bleed, Reaping rising once, Culling harder while he is low, Surging's shockwave every few seconds,
## and its other rune's), and a twist of its own, here: handed on to from foe_melds52.gd's moments (after_blow, harder, tick, rage,
## shield, death, blast) and the High City's own on a monster (monsters.gd shoot and the shots' flight: `shot`, `fly`, `hit`;
## monster.gd's rising, `rise_k` and `rise`; its shockwave, `surge_k` and `surged`; his bleeding, hero.gd `bleed_k`; and each
## frame, `frame`). Numbers melds52.json `tune`, their `foe…` keys. What it lays on him is in the enemy's own pink and gold
## (fx_m52p_high.gd).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")


static func _n(id: String, key: String, d: float) -> float:
	return float(M52.tune(id).get(key, d))


static func _tell(h, id: String, by, what := "foe", at := Vector2.INF) -> void:
	if h == null or h.m52 == null:
		return
	var p: Vector2 = h.world if at == Vector2.INF else at
	var e := {"id": id, "what": what, "x": p.x, "y": p.y, "foe": true}
	if by != null and is_instance_valid(by) and by is Node2D:
		e["x1"] = by.world.x
		e["y1"] = by.world.y
	h.m52._tell(e)


static func _has(m, id: String) -> bool:
	return M52.HIGH_ON and m != null and is_instance_valid(m) and m.words.has(id)


static func _low(h) -> bool:
	return h.life > 0.0 and h.life < h.max_life * float(preload("res://scripts/words.gd").data()["last"]["cull"]["low"])


static func _ok(m) -> bool:
	return m != null and is_instance_valid(m) and not m.dead


# --- its blows ---

## How much harder its blow lands, of these.
static func harder(F, k: Callable, _parts: Array, by) -> float:
	if not M52.HIGH_ON:
		return 1.0
	var h = F.main.hero
	var s := func(w: String) -> bool: return float(k.call(w)) > 0.0
	var mult := 1.0
	if s.call("witchpin") and h.hex_t > 0.0:
		mult *= _n("witchpin", "foeCursed", 1.3)
	if _low(h):
		if s.call("mercy"):
			mult *= _n("mercy", "foeCrit", 1.5)
			_tell(h, "mercy", by, "sight")
		if s.call("scissors") and _ok(by) and int(by.m52.get("foe_sc", 0)) % 2 == 1:
			mult *= _n("scissors", "foeSecond", 1.5)
	if s.call("scissors") and _ok(by):
		by.m52["foe_sc"] = int(by.m52.get("foe_sc", 0)) + 1
	# (Massacre: in its red frenzy it hits harder)
	if _ok(by) and float(by.m52.get("foe_red_t", 0.0)) > F.clock:
		mult *= _n("massacre", "foeRedHit", 1.2)
	# (Deadeye risen: the eye over it lets the monsters near it find a gap with every blow)
	if _ok(by) and float(by.m52.get("foe_eye_t", 0.0)) > F.clock:
		mult *= _n("deadeye", "foeEye", 1.2)
	# (Papercut's cuts on him open again with every blow)
	var cuts: int = int(h.foe_hi.get("cuts", 0))
	if cuts > 0:
		mult *= 1.0 + _n("papercut", "foeCut", 0.06) * cuts
		if F.clock - float(h.foe_hi.get("cuts_tell", -9.0)) > 0.5:
			h.foe_hi["cuts_tell"] = F.clock
			_tell(h, "papercut", by, "cuts")
	# (Bloodfeast: what it drank of his blood makes its next blow harder)
	if s.call("bloodfeast") and _ok(by) and int(by.m52.get("feast", 0)) > 0:
		mult *= 1.0 + _n("bloodfeast", "foeFed", 0.05) * int(by.m52["feast"])
		by.m52["feast"] = 0
		_tell(h, "bloodfeast", by, "fed")
	return mult


## What its blow that hurt him leaves, of these.
static func after_blow(F, k: Callable, by, dmg: float, _parts: Array) -> void:
	if not M52.HIGH_ON:
		return
	var h = F.main.hero
	var s := func(w: String) -> bool: return float(k.call(w)) > 0.0
	var alive_by: bool = _ok(by)
	var away: Vector2 = (h.world - by.world).normalized() if alive_by and h.world.distance_to(by.world) > 0.01 else Vector2(1, 0)
	var low: bool = _low(h)
	var bled: bool = h.bleed_t > 0.0
	var done := {}
	var tell := func(id: String) -> void:
		done[id] = true
		_tell(h, id, by)
	# (BLEEDING'S: what makes his bleeding worse, and whose it is)
	if bled and alive_by:
		for id in ["harrow", "bloodfeast", "hemorrhage", "papercut", "bloodhex"]:
			if s.call(id):
				h.foe_hi["bleed_by"] = id
				h.foe_hi["bleed_src"] = by
				h.foe_hi["bleed_from"] = F.clock
	if bled:
		if s.call("gore"):
			h.bleed_dps *= 1.0 + minf(1.0, dmg / maxf(1.0, h.max_life) * _n("gore", "foeHard", 4.0))
			tell.call("gore")
		if s.call("gangrene") and h.poison_t > 0.0:
			h.poison_t *= _n("gangrene", "foeLonger", 1.5)
			tell.call("gangrene")
		if s.call("rimeblood"):
			h.chill_t = maxf(h.chill_t, 2.0)
			h.chill_k = maxf(h.chill_k, _n("rimeblood", "foeChill", 0.35))
			tell.call("rimeblood")
		if s.call("bloodboil") and h.burn_t > 0.0:
			h.bleed_dps *= _n("bloodboil", "foeBoil", 1.5)
			tell.call("bloodboil")
		if s.call("galvanic") and h.shock_t > 0.0:
			h.bleed_dps *= _n("galvanic", "foeTear", 1.3)
			tell.call("galvanic")
		if s.call("lacerate") and alive_by:
			by.m52["foe_lac"] = mini(3, int(by.m52.get("foe_lac", 0)) + 1)
			h.bleed_dps *= 1.0 + 0.2 * int(by.m52["foe_lac"])
			if int(by.m52["foe_lac"]) >= 3:
				# (his wound gapes and sprays: every monster near comes for him faster)
				h.foe_hi["gape_t"] = F.clock + _n("lacerate", "foeGapeSecs", 4.0)
				done["lacerate"] = true
				_tell(h, "lacerate", by, "gape")
			else:
				tell.call("lacerate")
		if s.call("mangle"):
			h.bleed_dps *= _n("mangle", "foeThrown", 1.5)
			tell.call("mangle")
		if s.call("fangs") and alive_by:
			by.m52["foe_fang"] = int(by.m52.get("foe_fang", 0)) + 1
			if int(by.m52["foe_fang"]) % 2 == 0:
				h.bleed_dps *= 2.0
				tell.call("fangs")
		if s.call("bloodrage") and alive_by:
			h.bleed_dps *= 1.0 + clampf(1.0 - by.life / maxf(1.0, by.max_life), 0.0, 1.0)
			tell.call("bloodrage")
		if s.call("fishhook"):
			h.bleed_dps *= _n("fishhook", "foeDrag", 1.5)
			tell.call("fishhook")
		if s.call("butcher") and low:
			h.bleed_dps *= _n("butcher", "foeLow", 1.5)
			tell.call("butcher")
	if s.call("artery") and alive_by:
		by.m52["foe_art"] = int(by.m52.get("foe_art", 0)) + 1
		if int(by.m52["foe_art"]) % 3 == 0:
			# (every third: his artery opened, blood jetting from him, three times as hard a moment)
			h.foe_hi["art_t"] = F.clock + _n("artery", "foeSecs", 1.5)
			var B: Dictionary = preload("res://scripts/words.gd").data()["last"]["bleed"]
			h.bleed_dps = maxf(h.bleed_dps if h.bleed_t > 0.0 else 0.0, h.max_life * float(B["heroDps"]))
			h.bleed_t = maxf(h.bleed_t, 2.0)
			done["artery"] = true
			_tell(h, "artery", by, "jet")
	if s.call("papercut"):
		h.foe_hi["cuts"] = mini(5, int(h.foe_hi.get("cuts", 0)) + 1)
		h.foe_hi["cuts_t"] = F.clock
		done["papercut"] = true
		_tell(h, "papercut", by, "cut")
	if s.call("briar") and h.root_t > 0.0:
		h.foe_hi["briar"] = by
		tell.call("briar")
	# (PIERCING'S, its blow as its shot's: hero.gd and the shots' flight do the rest)
	if s.call("batteringram"):
		h.knock(away, _n("batteringram", "foeKnock", 0.8))
	if s.call("gaff") and alive_by:
		h.knock(-away, _n("gaff", "foeDrag", 0.6))
		tell.call("gaff")
	if s.call("skewer"):
		h.root_t = maxf(h.root_t, _n("skewer", "foePin", 0.8))
		tell.call("skewer")
	if s.call("icelance") and h.chill_t > 0.0 and alive_by:
		by.m52["foe_ice"] = int(by.m52.get("foe_ice", 0)) + 1
		if int(by.m52["foe_ice"]) % 2 == 0:
			h.held = maxf(h.held, 0.6)
			h.frozen_t = maxf(h.frozen_t, 0.6)
			tell.call("icelance")
	if s.call("sundial"):
		h.still_t = maxf(h.still_t, 2.0)
		h.still_k = maxf(h.still_k, 0.3)
		tell.call("sundial")
	if s.call("longspear"):
		for f in ["poison_t", "burn_t", "chill_t"]:
			if float(h.get(f)) > 0.0:
				h.set(f, float(h.get(f)) * _n("longspear", "foeLonger", 1.3))
		tell.call("longspear")
	# (REAPING'S: a risen one's own)
	if alive_by and by.risen:
		if s.call("ghoul"):
			by.life = minf(by.max_life, by.life + dmg * _n("ghoul", "foeHeal", 0.5))
			# (and the monsters near it feed too)
			for o in F.main._monsters.list:
				if _ok(o) and o != by and o.world.distance_to(by.world) <= _n("ghoul", "foeNear", 2.5):
					o.life = minf(o.max_life, o.life + dmg * 0.25)
					_tell(h, "ghoul", o, "feed")
			tell.call("ghoul")
	# (CULLING'S: while he is low)
	if low:
		if s.call("guillotine"):
			h.knock(away, _n("guillotine", "foeThrow", 1.2))
			tell.call("guillotine")
		if s.call("nightshade") and h.poison_t > 0.0:
			h.worse("poison", "nightshade", _n("nightshade", "foeLow", 1.5))
			tell.call("nightshade")
		if s.call("coldcut"):
			h.held = maxf(h.held, 0.5)
			h.frozen_t = maxf(h.frozen_t, 0.5)
			tell.call("coldcut")
		if s.call("cremate") and h.burn_t > 0.0:
			h.worse("burn", "cremate", _n("cremate", "foeLow", 1.5))
			tell.call("cremate")
		if s.call("smite"):
			F.main.hero.hurt_by(dmg * _n("smite", "foeBolt", 0.3), "lightning", [], {}, null, h.world, true)
			tell.call("smite")
		if s.call("crusher"):
			h.held = maxf(h.held, 0.5)
			tell.call("crusher")
		if s.call("bloodprice") and alive_by:
			# (his blood streams to it, healing it twice as much)
			by.life = minf(by.max_life, by.life + by.max_life * _n("bloodprice", "foeHeal", 0.08))
			done["bloodprice"] = true
			_tell(h, "bloodprice", by, "drink")
		if s.call("deathwatch"):
			for f in ["poison_t", "burn_t", "chill_t"]:
				if float(h.get(f)) > 0.0:
					h.set(f, float(h.get(f)) * 2.0)
			done["deathwatch"] = true
			_tell(h, "deathwatch", by, "shadow")
		if s.call("quietus") and (h.poison_t > 0.0 or h.burn_t > 0.0):
			var all: float = h.poison_dps * h.poison_t + h.burn_dps * h.burn_t
			h.poison_t = 0.0
			h.burn_t = 0.0
			F.main.hero.hurt_by(all, "phys", [], {}, null, h.world, true)
			tell.call("quietus")
		if s.call("purge") and alive_by:
			F.main._monsters.perils.warn(by.world.x, by.world.y, _n("purge", "foeRing", 2.2), 0.45, dmg * 0.5, by)
			tell.call("purge")
		if s.call("gallows") and alive_by:
			h.knock(-away, _n("gallows", "foeDrag", 0.8))
			tell.call("gallows")
		if s.call("condemn") and h.hex_t > 0.0:
			h.hex_more *= _n("condemn", "foeLow", 1.5)
			tell.call("condemn")
		if s.call("finalhour") and h.still_t > 0.0:
			h.still_k = minf(0.75, h.still_k * _n("finalhour", "foeLow", 1.5))
			tell.call("finalhour")
		if s.call("noose") and h.root_t > 0.0:
			h.root_t *= 2.0
			tell.call("noose")
	# (any whose twist on him is its two runes at once: its moment as its blow lands)
	for id in M52.T().get("high", []):
		if not done.has(id) and not M52.is_new_rank(id) and s.call(id):
			tell.call(id)


## A blow of his on its shield: Thornshield makes him bleed.
static func shield(F, m, soaked: float) -> void:
	if soaked > 0.0 and _has(m, "spearwall") and m.shield <= 0.0 and not m.m52.get("foe_sbroke", false):
		# (its shield broken, it staggers)
		m.m52["foe_sbroke"] = true
		m.stun_for(_n("spearwall", "foeStagger", 1.2))
		_tell(F.main.hero, "spearwall", m, "stagger")
	if soaked <= 0.0 or not _has(m, "thornshield"):
		return
	if m.shield <= 0.0 and not m.m52.get("foe_tbroke", false):
		# (broken, its thorns burst out at him)
		m.m52["foe_tbroke"] = true
		F.main._monsters.perils.warn(m.world.x, m.world.y, _n("thornshield", "foeBurst", 1.8), 0.3, (m.dmg_min + m.dmg_max) / 2.0 * 0.6, m, m.blow())
		_tell(F.main.hero, "thornshield", m, "burst")
	if F.clock - float(m.m52.get("foe_thorn", -99.0)) < 0.6:
		return
	m.m52["foe_thorn"] = F.clock
	var h = F.main.hero
	var B: Dictionary = preload("res://scripts/words.gd").data()["last"]["bleed"]
	h.bleed_dps = maxf(h.bleed_dps if h.bleed_t > 0.0 else 0.0, h.max_life * float(B["heroDps"]))
	h.bleed_t = maxf(h.bleed_t, float(B.get("heroSecs", 3.0)))
	_tell(h, "thornshield", m)


## Its pace, of these.
static func rage(F, m) -> float:
	if not M52.HIGH_ON:
		return 1.0
	var h = F.main.hero
	var k := 1.0
	if _has(m, "massacre") and _low(h):
		k *= _n("massacre", "foeLow", 1.3)
	if _has(m, "coup") and _low(h):
		k *= _n("coup", "foeRush", 1.5)
	if m.risen and (_has(m, "wraithstep") or _has(m, "fetch")):
		k *= 1.5
	if m.risen and _has(m, "macabre"):
		k *= _n("macabre", "foeFast", 1.6)
	if float(m.m52.get("foe_rush", 0.0)) > F.clock:
		k *= 1.8
	if float(m.m52.get("foe_frenzy_t", 0.0)) > F.clock:
		k *= _n("macabre", "foeSpread", 1.3)
	if float(m.m52.get("foe_red_t", 0.0)) > F.clock:
		k *= _n("massacre", "foeRed", 1.3)
	if _has(m, "bloodrage") and h.bleed_t > 0.0:
		# (it smells his blood and comes for him faster)
		k *= _n("bloodrage", "foeSmell", 1.3)
		if F.clock - float(m.m52.get("foe_smell", -9.0)) > 1.0:
			m.m52["foe_smell"] = F.clock
			_tell(h, "bloodrage", m, "rage")
	if F.clock < float(h.foe_hi.get("gape_t", -9.0)):
		k *= _n("lacerate", "foeGape", 1.25)
	if _has(m, "coup") and _low(h) and F.clock - float(m.m52.get("foe_blur", -9.0)) > 0.4:
		m.m52["foe_blur"] = F.clock
		_tell(h, "coup", m, "blur")
	if _has(m, "dart"):
		k *= _n("dart", "foeQuick", 1.2)
	return k


## A monster's turn, awake and near: what goes on of these.
static func tick(F, m, dt: float, dist: float) -> void:
	if not M52.HIGH_ON:
		return
	var h = F.main.hero
	if _has(m, "lastrites") and _low(h) and m.shield < m.max_life * 0.2:
		m.shield = minf(m.max_life * 0.2, m.shield + m.max_life * 0.05 * dt)
	if m.risen and _has(m, "haunting") and dist < 10.0:
		h.hex_t = maxf(h.hex_t, 0.5)
		h.hex_more = maxf(h.hex_more, 0.15)
		# (its ghost follows him, wailing: slowed too)
		h.chill_t = maxf(h.chill_t, 0.3)
		h.chill_k = maxf(h.chill_k, _n("haunting", "foeSlow", 0.25))
		if F.clock - float(m.m52.get("foe_wail", -9.0)) > 1.0:
			m.m52["foe_wail"] = F.clock
			_tell(h, "haunting", null, "wail")
	if m.risen and _has(m, "limbo") and dist < 10.0:
		h.still_t = maxf(h.still_t, 0.5)
		h.still_k = maxf(h.still_k, 0.25)
	if m.risen and (_has(m, "deadeye") or _has(m, "macabre")):
		# (Deadeye: an eye over it, the monsters near it finding a gap with every blow; Macabre: its frenzy spreads to them)
		var key: String = "foe_eye_t" if _has(m, "deadeye") else "foe_frenzy_t"
		for o in F.main._monsters.list:
			if _ok(o) and o.world.distance_to(m.world) <= _n("deadeye", "foeNear", 3.0):
				o.m52[key] = F.clock + 0.5
		if F.clock - float(m.m52.get("foe_aura", -9.0)) > 1.0:
			m.m52["foe_aura"] = F.clock
			_tell(h, "deadeye" if _has(m, "deadeye") else "macabre", m, "eye" if _has(m, "deadeye") else "frenzy")
	if m.risen and _has(m, "gravewarden") and F.clock - float(m.m52.get("foe_shade", -9.0)) > _n("gravewarden", "foeEvery", 3.0):
		# (a shade circles it, taking the first blow he lands each few seconds)
		m.m52["foe_shade"] = F.clock
		m.shield = maxf(m.shield, m.max_life * _n("gravewarden", "foeShade", 0.15))
		_tell(h, "gravewarden", m, "shade")
	if m.risen and _has(m, "fetch") and float(m.m52.get("foe_end", 0.0)) > 0.0 and F.clock > float(m.m52["foe_end"]):
		m.m52["foe_end"] = 0.0
		m.damage(m.life + 1.0, "phys", false, false, [], false, true, -1)


## As it dies, of these.
static func death(F, m) -> void:
	if not M52.HIGH_ON:
		return
	var h = F.main.hero
	var near: bool = h.world.distance_to(m.world) <= 2.2
	if _has(m, "bloodburst") and near:
		var B: Dictionary = preload("res://scripts/words.gd").data()["last"]["bleed"]
		h.bleed_dps = maxf(h.bleed_dps if h.bleed_t > 0.0 else 0.0, h.max_life * float(B["heroDps"]) * 1.5)
		h.bleed_t = maxf(h.bleed_t, 3.0)
		_tell(h, "bloodburst", m)
	if _low(h):
		# (Massacre: every monster dying near one drives it into a red frenzy)
		for o in F.main._monsters.list:
			if _ok(o) and o != m and _has(o, "massacre") and o.world.distance_to(m.world) <= _n("massacre", "foeNear", 3.5):
				o.m52["foe_red_t"] = F.clock + _n("massacre", "foeRedSecs", 3.0)
				_tell(h, "massacre", o, "frenzy")
	# (Harvest risen: the souls of the monsters dying near it fly into it, healing it)
	for o in F.main._monsters.list:
		if _ok(o) and o != m and o.risen and _has(o, "harvest") and o.world.distance_to(m.world) <= _n("harvest", "foeNear", 4.0):
			o.life = minf(o.max_life, o.life + o.max_life * _n("harvest", "foeSoul", 0.15))
			_tell(h, "harvest", o, "soul")
	if _has(m, "thornspray"):
		# (the split bursts in a spray of thorns)
		F.main._monsters.perils.warn(m.world.x, m.world.y, _n("thornspray", "foeSpray", 1.5), 0.3, (m.dmg_min + m.dmg_max) / 2.0 * 0.5, m, m.blow())
		_tell(h, "thornspray", m, "spray")
	if m.risen and _has(m, "undying") and h.world.distance_to(m.world) <= _n("undying", "foeHand", 4.0):
		# (fallen again: a dead hand bursts from the ground under him and holds him)
		h.root_t = maxf(h.root_t, _n("undying", "foeHold", 0.8))
		_tell(h, "undying", null, "hand")
	if _has(m, "lastrites"):
		# (its shield passes to the nearest monster)
		var best = null
		var bd: float = _n("lastrites", "foePass", 4.0)
		for o in F.main._monsters.list:
			if _ok(o) and o != m and o.world.distance_to(m.world) < bd:
				bd = o.world.distance_to(m.world)
				best = o
		if best != null:
			best.shield = maxf(best.shield, best.max_life * 0.25)
			_tell(h, "lastrites", best, "pass")
	if _has(m, "gangrene"):
		F._ground(m.world, _n("gangrene", "foeRot", 1.4), 4.0, "venom", "poison", (m.dmg_min + m.dmg_max) / 2.0 * 0.15, [], m, "gangrene")
		_tell(h, "gangrene", m, "rot")
	if _has(m, "fuse"):
		var w: Vector2 = (h.world - m.world).normalized() if h.world.distance_to(m.world) > 0.1 else Vector2(1, 0)
		for k in 4:
			var p: Vector2 = m.world + w * (1.2 + k * 1.2)
			F.main._monsters.perils.warn(p.x, p.y, 0.8, 0.5 + k * 0.15, (m.dmg_min + m.dmg_max) / 2.0 * 0.8, null, {"el": m.element(), "words": [], "half": {}})
		_tell(h, "fuse", m)


## Its dying blast, of these: Deathburst harder while he is low.
static func blast(m) -> Dictionary:
	if _has(m, "deathburst") and m.mgr != null and m.mgr.hero != null and _low(m.mgr.hero):
		return {"r": 1.8, "wait": 0.7, "k": 1.5 * _n("deathburst", "foeLow", 1.5)}
	return {}


# --- its shots (Piercing's, through walls) ---

## A shot `a` of `m`'s has been loosed (monsters.gd shoot): its meld's own.
static func shot(mgr, m, a: Dictionary) -> void:
	if not M52.HIGH_ON or not _ok(m):
		return
	if mgr.get("_copying") == true:
		a["copy"] = true
	if _has(m, "spearwall"):
		a["walls"] = m.shield > 0.0
	if _has(m, "flicker"):
		a["speed"] = float(a["speed"]) * _n("flicker", "foeFast", 1.33)
	if _has(m, "broadspear"):
		a["r"] = float(a["r"]) * _n("broadspear", "foeWide", 2.0)
	if _has(m, "pitchfork") and not a.get("copy", false):
		var side := Vector2(-a["dir"].y, a["dir"].x) * 0.5
		mgr.call_deferred("_shot_beside", m, a, side)
	if _has(m, "barrage") and not a.get("copy", false) and m.life < m.max_life * 0.4:
		# (badly hurt, it looses them in fans of three)
		mgr.call_deferred("_shot_turned", m, a, 0.25)
		mgr.call_deferred("_shot_turned", m, a, -0.25)
		_tell(mgr.hero, "barrage", m, "fan")
	if _has(m, "flicker") and not a.get("copy", false):
		# (a flickering copy of the shot on the same path, a moment later)
		mgr.after(_n("flicker", "foeCopy", 0.25), func() -> void: mgr._shot_turned(m, a, 0.0))
		_tell(mgr.hero, "flicker", m, "echo")
	if _has(m, "dart") and not a.get("copy", false):
		# (it darts a step aside after each shot)
		var side: Vector2 = Vector2(-a["dir"].y, a["dir"].x) * (1.0 if randf() < 0.5 else -1.0) * _n("dart", "foeStep", 0.9)
		var to: Vector2 = m.world + side
		if mgr.map.open_at(floori(to.x), floori(to.y)):
			_tell(mgr.hero, "dart", m, "dash")
			m.world = to
	for id in ["impaler", "stinger", "sunspear", "stormlance", "bloodlance", "bodkin", "trident", "witchpin", "deathblow", "harrow"]:
		if _has(m, id):
			a["high"] = id


## A shot `a` flying from `p0` to `p1`: through a wall, near him, along its way.
static func fly(mgr, a: Dictionary, p0: Vector2, p1: Vector2) -> void:
	var id: String = str(a.get("high", ""))
	if id == "" or not M52.HIGH_ON:
		return
	var h = mgr.hero
	var map = mgr.map
	var in_wall: bool = not map.open_at(floori(p1.x), floori(p1.y))
	# (Impaler: each wall it goes into makes the shot bigger and harder)
	if id == "impaler" and in_wall and not a.get("in_wall", false):
		a["walls_n"] = int(a.get("walls_n", 0)) + 1
		a["r"] = minf(float(a["r"]) * 1.3, 1.2)
		var nd = a.get("node")
		if nd != null and is_instance_valid(nd) and nd is Node2D:
			nd.scale *= 1.3
		_tell(h, "impaler", null, "grow", p1)
	a["in_wall"] = in_wall
	if in_wall and not a.get("walled", false):
		a["walled"] = true
		if id == "trident" and not a.get("copy", false):
			for t in [-0.35, 0.35]:
				mgr.call_deferred("_shot_turned", a.get("src"), a, t)
			_tell(h, "trident", null, "split")
	match id:
		"sunspear":
			if p1.distance_to(Vector2(a.get("trail_x", -99.0), a.get("trail_y", -99.0))) > 0.9 and not in_wall:
				a["trail_x"] = p1.x
				a["trail_y"] = p1.y
				var src = a.get("src")
				if _ok(src) and mgr.main != null and mgr.main.get("_foe") != null:
					mgr.main._foe._ground(p1, 0.5, 2.5, "burn", "fire", (src.dmg_min + src.dmg_max) / 2.0 * 0.15, [], src, "sunspear")
		"stormlance":
			if not a.get("arced", false) and not a["hit"] and h.alive and p1.distance_to(h.world) <= 1.5:
				a["arced"] = true
				h.hurt_by(float(a["dmg"]) * 0.5, "lightning", [], {}, null, p1, true)
				_tell(h, "stormlance", null, "arc")
		"witchpin":
			# (while he is cursed, its shots turn in the air to follow him)
			if h.alive and h.hex_t > 0.0 and not a["hit"]:
				var want: Vector2 = (h.world - p1).normalized()
				var cur: Vector2 = a["dir"]
				var turn: float = clampf(cur.angle_to(want), -0.07, 0.07)
				a["dir"] = cur.rotated(turn)
				if not a.get("sought", false):
					a["sought"] = true
					_tell(h, "witchpin", null, "seek", p1)
		"harrow":
			# (passing close by, it rakes him: he bleeds, even standing still)
			if not a.get("raked", false) and not a["hit"] and h.alive and p1.distance_to(h.world) <= _n("harrow", "foeRake", 1.3):
				a["raked"] = true
				var B: Dictionary = preload("res://scripts/words.gd").data()["last"]["bleed"]
				h.bleed_dps = maxf(h.bleed_dps if h.bleed_t > 0.0 else 0.0, h.max_life * float(B["heroDps"]))
				h.bleed_t = maxf(h.bleed_t, 3.0)
				h.foe_hi["bleed_by"] = "harrow"
				h.foe_hi["bleed_src"] = a.get("src")
				_tell(h, "harrow", null, "rake")
		"bloodlance":
			if float(a.get("trail_k", 0.0)) <= 0.0:
				a["trail_k"] = 0.3
				_tell(h, "bloodlance", null, "trail", p1)
			a["trail_k"] = float(a.get("trail_k", 0.0)) - 0.05
			var src = a.get("src")
			for o in mgr.list:
				if _ok(o) and o != src and o.world.distance_to(p1) <= o.r + 0.3:
					var key := "bl%d" % o.get_instance_id()
					if not a.has(key):
						a[key] = true
						o.life = minf(o.max_life, o.life + o.max_life * _n("bloodlance", "foeHeal", 0.05))
						_tell(h, "bloodlance", o, "heal")


## A shot `a` has struck him for `dmg`: how hard (Impaler through a wall harder), and what it leaves.
static func hit_k(mgr, a: Dictionary) -> float:
	var id: String = str(a.get("high", ""))
	if id == "bodkin" and mgr.hero.shield > 0.0:
		# (striking his shield, it shatters it)
		mgr.hero.shield = 0.0
		_tell(mgr.hero, "bodkin", null, "shatter")
	if id == "impaler" and int(a.get("walls_n", 0)) > 0:
		_tell(mgr.hero, "impaler", null)
		return 1.0 + _n("impaler", "foeWall", 0.4) * int(a["walls_n"])
	return 1.0


## A shot `a` has come to its end at `p` (on him or not).
static func gone(mgr, a: Dictionary, p: Vector2) -> void:
	var id: String = str(a.get("high", ""))
	if id == "stinger" and mgr.main != null and mgr.main.get("_foe") != null:
		var src = a.get("src")
		if _ok(src):
			mgr.main._foe._ground(p, 0.6, 3.0, "venom", "poison", (src.dmg_min + src.dmg_max) / 2.0 * 0.12, [], src, "stinger")
			_tell(mgr.hero, "stinger", null, "cloud")


## Whether a shot of Bodkin's goes through his shield.
static func bare(a: Dictionary) -> bool:
	return str(a.get("high", "")) == "bodkin"


# --- its rising (Reaping's) ---

## How long it lies before it rises, as a share of Reaping's own (Limbo: between death and life a while).
static func rise_k(m) -> float:
	return _n("limbo", "foeHang", 1.8) if _has(m, "limbo") else 1.0


## One that carried `words` has risen as `o` (`M` the monsters): its meld's own.
static func rise(words: Array, M, o) -> void:
	if not M52.HIGH_ON or o == null or M == null:
		return
	var h = M.hero
	if h == null:
		return
	var keep := {"bloodharvest": "bleeding", "ghoul": "leech", "deadeye": "precise", "gravewarden": "guarding", "legion": "vast", "limbo": "stilling", "harvest": "culling"}
	for id in keep:
		if words.has(id):
			o.words = [id, keep[id]]
	if words.has("gravewarden"):
		o.shield = o.max_life * 0.3
	if words.has("undying"):
		o.max_life *= _n("undying", "foeLonger", 1.5)
		o.life = o.max_life
	if words.has("fetch"):
		o.m52["foe_end"] = M.main._foe.clock + _n("fetch", "foeBrief", 5.0) if M.main.get("_foe") != null else 0.0
		# (it blinks to his side as it rises)
		var side: Vector2 = h.world + Vector2(1, 0).rotated(randf() * TAU) * 1.2
		if M.map.open_at(floori(side.x), floori(side.y)):
			_tell(h, "fetch", o, "blink")
			o.world = side
	for id in ["wraithstep", "fetch", "macabre", "haunting"]:
		if words.has(id) and not o.words.has(id):
			o.words.append(id)
	var by: Dictionary = o.blow()
	if words.has("tombstone"):
		M.perils.warn(o.world.x, o.world.y, 1.5, 0.5, (o.dmg_min + o.dmg_max) / 2.0, o, by)
	if words.has("soulstorm"):
		M.perils.warn(o.world.x, o.world.y, 2.4, 0.6, (o.dmg_min + o.dmg_max) / 2.0 * 0.8, o, by)
	if words.has("gravewell") and h.world.distance_to(o.world) < 6.0:
		h.knock((o.world - h.world).normalized(), 1.0)
	if words.has("gravebind") and h.world.distance_to(o.world) < 6.0:
		h.root_t = maxf(h.root_t, 1.0)
	if words.has("wraithspear"):
		M.shoot(o, (h.world - o.world).normalized(), 7.0, 12.0, (o.dmg_min + o.dmg_max) / 2.0, "arrow")
		if not M._arrows.is_empty():
			M._arrows.back()["walls"] = true
	if words.has("bloodharvest") and h.bleed_t > 0.0:
		# (the blood he has shed rises with it as a second, small one)
		var two = M.call_up(o.kind, o.world + Vector2(-0.6, 0.0), o.pack_id, o.face)
		if two != null:
			two.max_life = o.max_life * _n("bloodharvest", "foeSmall", 0.4)
			two.life = two.max_life
			two.words = ["bleeding"]
			two.risen = true
			_tell(h, "bloodharvest", two, "blood")
	if words.has("revenants"):
		var two = M.call_up(o.kind, o.world + Vector2(0.6, 0.0), o.pack_id, o.face)
		if two != null:
			two.max_life = o.max_life * 0.5
			two.life = two.max_life
			two.words = []
			two.risen = true
			o.max_life *= 0.5
			o.life = o.max_life
	for id in M52.T().get("high", []):
		if words.has(id) and (M52.T()["of"].get(id, []) as Array).has("reaping"):
			_tell(h, id, o, "rise")
			break


# --- its shockwave (Surging's) ---

## Its shockwave's own: how often, how wide, how hard (shares of Surging's).
static func surge_k(m) -> Dictionary:
	var k := {"every": 1.0, "r": 1.0, "dmg": 1.0}
	if not M52.HIGH_ON:
		return k
	if _has(m, "spark"):
		k = {"every": 0.6, "r": 0.8, "dmg": 0.6}
	if _has(m, "tsunami"):
		k["r"] = 2.0
	if _has(m, "crescendo"):
		k["every"] = 0.4 + 0.6 * clampf(m.life / maxf(1.0, m.max_life), 0.0, 1.0)
	return k


## `m`'s shockwave has been warned round `at`, `r` wide, landing in `wait`: what its meld does as it lands.
static func surged(m, at: Vector2, r: float, wait: float) -> void:
	if not M52.HIGH_ON:
		return
	var M = m.mgr
	var h = M.hero
	var id := ""
	for w in M52.T().get("high", []):
		if m.words.has(w) and (M52.T()["of"].get(w, []) as Array).has("surging"):
			id = w
	if id == "":
		return
	var by: Dictionary = m.blow()
	var dmg: float = (m.dmg_min + m.dmg_max) / 2.0
	match id:
		"tremor":
			M.after(wait + 0.35, func() -> void:
				if is_instance_valid(m) and not m.dead:
					M.perils.warn(at.x, at.y, r * 1.5, 0.3, dmg * 0.6, m, by))
		"resonance":
			for n in 2:
				M.after(wait + 0.4 * (n + 1), func() -> void:
					if is_instance_valid(m) and not m.dead:
						M.perils.warn(at.x, at.y, r, 0.2, dmg * 0.4, m, by))
		"heartbeat":
			# (it throbs red, healing it and every monster it washes over)
			m.life = minf(m.max_life, m.life + m.max_life * _n("heartbeat", "foeHeal", 0.08))
			for o in M.list:
				if _ok(o) and o != m and o.world.distance_to(at) <= r:
					o.life = minf(o.max_life, o.life + o.max_life * _n("heartbeat", "foeHeal", 0.08))
					_tell(h, "heartbeat", o, "throb")
		"bastion":
			# (its shield made whole, and every monster it washes over shielded)
			m.shield = maxf(m.shield, m.max_life * 0.3)
			for o in M.list:
				if _ok(o) and o != m and o.world.distance_to(at) <= r:
					o.shield = maxf(o.shield, o.max_life * _n("bastion", "foeShare", 0.2))
					_tell(h, "bastion", o, "ward")
		"overload":
			var p: Vector2 = h.world
			M.after(wait, func() -> void: M.perils.warn(p.x, p.y, 1.0, 0.8, dmg * 0.8, null, {"el": m.element(), "words": [], "half": {}}))
		"rush":
			m.m52["foe_rush"] = (M.main._foe.clock if M.main.get("_foe") != null else 0.0) + wait + 1.5
		"spark":
			M.after(wait, func() -> void:
				if is_instance_valid(m) and not m.dead and h.alive:
					M.shoot(m, (h.world - m.world).normalized(), 9.0, 8.0, dmg * 0.3, "arrow")
					_tell(h, "spark", m, "spark"))
		"ricochet":
			M.after(wait, func() -> void:
				if is_instance_valid(m) and not m.dead and h.alive:
					for t in [-0.3, 0.0, 0.3]:
						M.shoot(m, (h.world - m.world).normalized().rotated(t), 7.0, 8.0, dmg * 0.4, "arrow"))
	M.after(wait, func() -> void:
		if not is_instance_valid(h) or not h.alive or h.world.distance_to(at) > r + 0.4:
			return
		var away: Vector2 = (h.world - at).normalized() if h.world.distance_to(at) > 0.05 else Vector2(1, 0)
		match id:
			"upheaval":
				h.knock(away, 1.2)
			"pestilence":
				h.poison_dps = maxf(h.poison_dps, dmg * 0.15)
				h.poison_t = maxf(h.poison_t, 3.0)
			"blizzard":
				h.chill_t = maxf(h.chill_t, 2.0)
				h.chill_k = maxf(h.chill_k, 0.35)
			"nova":
				h.burn_dps = maxf(h.burn_dps, dmg * 0.15)
				h.burn_t = maxf(h.burn_t, 3.0)
			"seismic":
				h.held = maxf(h.held, 0.4)
			"undertow":
				h.knock(-away, 1.0)
			"hexwave":
				h.hex_t = maxf(h.hex_t, 3.0)
				h.hex_more = maxf(h.hex_more, 0.15)
			"lull":
				h.still_t = maxf(h.still_t, 2.0)
				h.still_k = maxf(h.still_k, 0.3)
			"tangle":
				h.root_t = maxf(h.root_t, 0.9)
			"bloodwave":
				if h.bleed_t > 0.0:
					var all: float = h.bleed_dps * h.bleed_t
					h.bleed_t = 0.0
					h.hurt_by(all, "phys", [], {}, null, h.world, true)
		_tell(h, id, m, "surge"))


# --- his bleeding, of theirs ---

## How hard a bite of his bleeding is (`b` as it stands, `moved`: he moved since the last), of these.
static func bleed_k(F, h, b: float, moved: bool) -> float:
	if not M52.HIGH_ON or h.foe_hi.is_empty():
		return b
	var id: String = str(h.foe_hi.get("bleed_by", ""))
	if F.clock < float(h.foe_hi.get("art_t", -9.0)):
		b *= _n("artery", "foeOpen", 3.0)
	match id:
		"harrow":
			if not moved:
				b *= float(preload("res://scripts/words.gd").data()["last"]["bleed"]["moving"])
		"bloodfeast":
			var src = h.foe_hi.get("bleed_src")
			if _ok(src):
				src.life = minf(src.max_life, src.life + b)
				src.m52["feast"] = mini(10, int(src.m52.get("feast", 0)) + 1)
				if F.clock - float(h.foe_hi.get("drink_t", -9.0)) > 0.8:
					h.foe_hi["drink_t"] = F.clock
					_tell(h, "bloodfeast", src, "drink")
		"hemorrhage":
			var grown: float = 1.0 + 0.5 * (F.clock - float(h.foe_hi.get("bleed_from", F.clock)))
			b *= minf(3.0, grown)
			if grown >= 2.0:
				# (grown full, it ruptures and opens again, fresh)
				h.foe_hi["bleed_from"] = F.clock
				h.bleed_t = maxf(h.bleed_t, 4.0)
				_tell(h, "hemorrhage", null, "rupture")
		"papercut":
			b *= _n("papercut", "foeFast", 1.5)
		"bloodhex":
			if h.hex_t > 0.0:
				h.bleed_t = maxf(h.bleed_t, 0.6)
	return b


## Each frame of the fight, of these: Briar's root torn free.
static func frame(F, _dt: float) -> void:
	if not M52.HIGH_ON or F.main == null or F.main.hero == null:
		return
	var h = F.main.hero
	if h.foe_hi.has("briar") and h.root_t <= 0.0:
		h.foe_hi.erase("briar")
		var B: Dictionary = preload("res://scripts/words.gd").data()["last"]["bleed"]
		h.bleed_dps = maxf(h.bleed_dps if h.bleed_t > 0.0 else 0.0, h.max_life * float(B["heroDps"]) * 1.5)
		h.bleed_t = maxf(h.bleed_t, 3.0)
		_tell(h, "briar", null, "tear")
	if h.foe_hi.has("cuts") and F.clock - float(h.foe_hi.get("cuts_t", 0.0)) > 6.0:
		h.foe_hi.erase("cuts")
	if str(h.foe_hi.get("bleed_by", "")) == "bloodhex" and h.bleed_t > 0.0 and h.hex_t > 0.0:
		# (a ring of hex follows under his feet, slowing him)
		h.chill_t = maxf(h.chill_t, 0.3)
		h.chill_k = maxf(h.chill_k, _n("bloodhex", "foeSlow", 0.25))
		if F.clock - float(h.foe_hi.get("sigil_t", -9.0)) > 0.8:
			h.foe_hi["sigil_t"] = F.clock
			_tell(h, "bloodhex", null, "sigil")
	if h.bleed_t <= 0.0 and h.foe_hi.has("bleed_by"):
		h.foe_hi.erase("bleed_by")
		h.foe_hi.erase("bleed_src")
