## ALL MELDS: THE LEAST EXCITING REDONE, on a monster (melds52.gd REDO_ON; his words, 24 Nov 2026: “Next I want you to look at the
## larger pool of all melds, and redo the 20 weakest.  Then do it again.  Then do it a third time.”). Each keeps what it did on a
## monster (foe_words.gd, foe_melds52.gd and the city's) and gains a moment seen happen, laid on him in the enemy's pink and gold
## (fx_m52p_redo.gd). Called from foe_melds52.gd's hooks and foe_words.gd's frame. Its own state on the monster is in `m.m52`
## ("rd_..."), on him in `foe_hi` ("rd_...").
## ROUND 1: Ambush, Berserk, Blight, Bulwark, Canker, Delirium, Doom, Duelist, Eternity, Evil Eye, Fervor, Fever, Fury, Glide,
## Grudge, Haymaker, Hourglass, Lamprey, Lancet, Manacle.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const Rules := preload("res://scripts/meldsredo_rules.gd")


static func _on(m) -> bool:
	return M52.REDO_ON and m != null and is_instance_valid(m)


static func _tell(h, id: String, what: String, at: Vector2, more := {}) -> void:
	var e := {"id": id, "what": what, "x": at.x, "y": at.y, "foe": true}
	e.merge(more)
	if h != null and h.m52 != null:
		h.m52._tell(e)


static func _alive(F, o) -> bool:
	return o != null and is_instance_valid(o) and not o.dead and not F.main._monsters.shut_in(o)


## (how hard its blow lands, of these: Grudge's, after he struck it)
static func harder(F, k: Callable, _parts: Array, by) -> float:
	if not M52.REDO_ON or by == null or not is_instance_valid(by):
		return 1.0
	var h = F.main.hero
	var mult := 1.0
	if float(k.call("grudge")) > 0.0 and by.m52.get("rd_grudged", false):
		by.m52["rd_grudged"] = false
		mult *= 2.0
		_tell(h, "grudge", "pay", h.world)
	return mult


## After its blow has hurt him `dmg`.
static func after_blow(F, k: Callable, by, dmg: float, _parts: Array) -> void:
	if not M52.REDO_ON or by == null or not is_instance_valid(by):
		return
	var h = F.main.hero
	var s := func(w: String) -> bool: return float(k.call(w)) > 0.0
	var away: Vector2 = (h.world - by.world).normalized() if h.world.distance_to(by.world) > 0.01 else Vector2(1, 0)
	var n: int = int(by.m52.get("rd_blows", 0)) + 1
	by.m52["rd_blows"] = n
	if s.call("ambush") and not by.m52.get("rd_struck", false):
		by.m52["rd_struck"] = true
		by.modulate.a = 1.0
	if s.call("berserk") and by.m52.get("rd_swell", false):
		h.knock(away, 1.0)
		_tell(h, "berserk", "throw", h.world)
	if s.call("blight") and h.poison_t > 0.0 and F.clock - float(by.m52.get("rd_boil", -9.0)) > 1.5:
		by.m52["rd_boil"] = F.clock
		F._ground(h.world, 1.0, 3.0, "venom", "poison", F._avg(by) * 0.15, [], by, "blight")
		_tell(h, "blight", "boil", h.world, {"r": 1.0})
	if s.call("bulwark") and F.clock - float(by.m52.get("rd_charged", -9.0)) < 1.5:
		by.m52["rd_charged"] = -9.0
		h.knock(away, 1.0)
		_tell(h, "bulwark", "shove", h.world)
	if s.call("canker") and not h.foe_hi.has("rd_sore"):
		h.foe_hi["rd_sore"] = {"at": F.clock + 2.5, "dps": F._avg(by) * 0.15}
		_tell(h, "canker", "sore", h.world)
	if s.call("doom") and n % 3 == 0:
		F.main._monsters.perils.warn(h.world.x, h.world.y, 1.1, 0.9, F._avg(by) * 1.5, by)
		_tell(h, "doom", "shadow", h.world, {"r": 1.1, "secs": 0.9})
	if s.call("eternity") and F.clock - float(by.m52.get("rd_stop", -9.0)) > 3.0:
		by.m52["rd_stop"] = F.clock
		h.held = maxf(h.held, 0.45)
		_tell(h, "eternity", "stop", h.world, {"secs": 0.45})
	if s.call("fervor") and by.m52.get("rd_fed", false):
		by.m52["rd_fed"] = false
		F._ground(h.world, 1.1, 3.0, "burn", "fire", F._avg(by) * 0.2, [], by, "fervor")
		_tell(h, "fervor", "blaze", h.world, {"r": 1.1})
	if s.call("haymaker") and n % 3 == 0:
		h.held = maxf(h.held, 0.6)
		h.knock(away, 0.8)
		_tell(h, "haymaker", "down", h.world)
	if s.call("hourglass") and (h.poison_t > 0.0 or h.burn_t > 0.0 or h.chill_t > 0.0) and not h.foe_hi.has("rd_glass"):
		h.foe_hi["rd_glass"] = F.clock + 3.0
		_tell(h, "hourglass", "hang", h.world, {"secs": 3.0})
	if s.call("lamprey") and n % 2 == 0:
		h.foe_hi["rd_latch"] = {"m": by, "until": F.clock + 3.0, "next": 0.0}
		_tell(h, "lamprey", "latch", h.world, {"x1": by.world.x, "y1": by.world.y})
	if s.call("lancet") and n % 3 == 0:
		var B: Dictionary = preload("res://scripts/words.gd").data()["last"]["bleed"]
		h.bleed_dps = maxf(h.bleed_dps if h.bleed_t > 0.0 else 0.0, h.max_life * float(B["heroDps"]))
		h.bleed_t = maxf(h.bleed_t, 3.0)
		_tell(h, "lancet", "cut", h.world, {"x1": by.world.x, "y1": by.world.y})
	if s.call("manacle"):
		h.foe_hi["rd_chain"] = {"m": by, "until": F.clock + 4.0, "next": 0.0}
		_tell(h, "manacle", "chain", h.world, {"x1": by.world.x, "y1": by.world.y})


## A monster's turn, awake and near him (`dist` from him).
static func tick(F, m, _dt: float, dist: float) -> void:
	if not _on(m) or m.words.is_empty():
		return
	var h = F.main.hero
	var now: float = F.clock
	if m.word_share("ambush") > 0.0 and not m.m52.get("rd_struck", false):
		# (it lurks, half faded, till its first blow: a lunge from out of reach)
		m.modulate.a = 0.45
		if dist >= 1.3 and dist <= 3.4 and not m.m52.get("rd_lunged", false):
			m.m52["rd_lunged"] = true
			var was: Vector2 = Rules.dash_at(m, h.world, 1.0)
			_tell(h, "ambush", "lunge", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("berserk") > 0.0 and m.life < m.max_life * 0.5 and not m.m52.get("rd_swell", false):
		m.m52["rd_swell"] = true
		m.modulate = Color(1.35, 0.75, 0.7, m.modulate.a)
		_tell(h, "berserk", "swell", m.world, {"stay": true})
	if m.word_share("bulwark") > 0.0 and m.shield > 0.0 and dist >= 1.6 and dist <= 5.0 and now - float(m.m52.get("rd_charge_at", -9.0)) > 3.0:
		m.m52["rd_charge_at"] = now
		m.m52["rd_charged"] = now
		var was: Vector2 = Rules.dash_at(m, h.world, 1.0)
		_tell(h, "bulwark", "charge", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("delirium") > 0.0 and h.hex_t > 0.0 and dist >= 1.6 and dist <= 5.5 and now - float(m.m52.get("rd_rave", -9.0)) > 2.5:
		m.m52["rd_rave"] = now
		var was: Vector2 = Rules.dash_at(m, h.world, maxf(1.0, dist - 2.0))
		_tell(h, "delirium", "rave", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("duelist") > 0.0:
		var alone := true
		for o in F.main._monsters.list:
			if o != m and _alive(F, o) and o.world.distance_to(h.world) < 4.0:
				alone = false
				break
		if alone and dist >= 1.8 and dist <= 6.0 and now - float(m.m52.get("rd_salute", -9.0)) > 4.0:
			m.m52["rd_salute"] = now
			m.m52["rd_lunge_at"] = now + 0.5
			_tell(h, "duelist", "salute", m.world, {"stay": true})
		if now >= float(m.m52.get("rd_lunge_at", INF)):
			m.m52["rd_lunge_at"] = INF
			var was: Vector2 = Rules.dash_at(m, h.world, 1.0)
			_tell(h, "duelist", "lunge", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("evileye") > 0.0 and dist <= 5.0 and now - float(m.m52.get("rd_gaze", -9.0)) > 1.0:
		m.m52["rd_gaze"] = now
		h.hex_t = maxf(h.hex_t, 1.5)
		h.hex_more = maxf(h.hex_more, 0.15)
		_tell(h, "evileye", "gaze", h.world, {"x1": m.world.x, "y1": m.world.y})
	if m.word_share("fever") > 0.0 and m.life < m.max_life * 0.75 and now - float(m.m52.get("rd_sweat", -9.0)) > 0.9:
		m.m52["rd_sweat"] = now
		F._ground(m.world, 0.8, 3.0, "venom", "poison", F._avg(m) * 0.1, [], m, "fever")
		_tell(h, "fever", "sweat", m.world, {"r": 0.8, "stay": true})
	if m.word_share("fury") > 0.0 and m.life < m.max_life * 0.5 and not m.m52.get("rd_roar", false):
		m.m52["rd_roar"] = true
		_tell(h, "fury", "roar", m.world, {"stay": true})
		var was: Vector2 = Rules.dash_at(m, h.world, maxf(1.0, dist - 2.2))
		_tell(h, "fury", "charge", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("glide") > 0.0 and dist <= 6.0 and now - float(m.m52.get("rd_ice", -9.0)) > 0.6:
		m.m52["rd_ice"] = now
		F._ground(m.world, 0.6, 3.0, "ice", "frost", F._avg(m) * 0.05, [], m, "glide")
		_tell(h, "glide", "strip", m.world, {"r": 0.6, "stay": true})


## A monster has died: Fervor's carriers near it are fed.
static func death(F, dead) -> void:
	if not M52.REDO_ON or dead == null:
		return
	var h = F.main.hero
	for o in F.main._monsters.list:
		if o != dead and _alive(F, o) and o.word_share("fervor") > 0.0 and o.world.distance_to(dead.world) <= 4.0:
			o.m52["rd_fed"] = true
			_tell(h, "fervor", "fed", o.world, {"stay": true})


## Each frame: what lies on him (Canker's sore, Hourglass's sand, Lamprey's latch, Manacle's chain).
static func frame(F, _dt: float) -> void:
	if not M52.REDO_ON or F.main == null or F.main.hero == null:
		return
	var h = F.main.hero
	var now: float = F.clock
	if h.foe_hi.has("rd_sore") and now >= float(h.foe_hi["rd_sore"]["at"]):
		var dps: float = float(h.foe_hi["rd_sore"]["dps"])
		h.foe_hi.erase("rd_sore")
		h.poison_dps = maxf(h.poison_dps if h.poison_t > 0.0 else 0.0, maxf(1.0, dps))
		h.poison_t = maxf(h.poison_t, 3.0)
		_tell(h, "canker", "burst", h.world, {"r": 1.0})
	if h.foe_hi.has("rd_glass") and now >= float(h.foe_hi["rd_glass"]):
		h.foe_hi.erase("rd_glass")
		var left: float = h.poison_dps * h.poison_t + h.burn_dps * h.burn_t
		h.poison_t = 0.0
		h.burn_t = 0.0
		_tell(h, "hourglass", "fall", h.world)
		if left > 0.0:
			h.hurt_by(minf(left, h.max_life * 0.25), "phys", [], {}, null, Vector2.INF, true)
	if h.foe_hi.has("rd_latch"):
		var l: Dictionary = h.foe_hi["rd_latch"]
		var m = l["m"]
		if not _alive(F, m) or now > float(l["until"]) or m.world.distance_to(h.world) > 2.6:
			h.foe_hi.erase("rd_latch")
		elif now >= float(l["next"]):
			l["next"] = now + 0.4
			var a: float = maxf(1.0, roundf(F._avg(m) * 0.1))
			h.hurt_by(a, "phys", [], {}, null, Vector2.INF, true)
			m.life = minf(m.max_life, m.life + a)
			_tell(h, "lamprey", "drain", h.world, {"x1": m.world.x, "y1": m.world.y, "minor": true})
	if h.foe_hi.has("rd_chain"):
		var c: Dictionary = h.foe_hi["rd_chain"]
		var m = c["m"]
		if not _alive(F, m) or now > float(c["until"]):
			h.foe_hi.erase("rd_chain")
		else:
			if h.world.distance_to(m.world) > 2.4:
				h.world = m.world + (h.world - m.world).normalized() * 2.4
			if now >= float(c["next"]):
				c["next"] = now + 0.3
				_tell(h, "manacle", "link", h.world, {"x1": m.world.x, "y1": m.world.y, "minor": true, "secs": 0.35})
