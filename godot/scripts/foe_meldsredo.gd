## ALL MELDS: THE LEAST EXCITING REDONE, on a monster (melds52.gd REDO_ON; his words, 24 Nov 2026: “Next I want you to look at the
## larger pool of all melds, and redo the 20 weakest.  Then do it again.  Then do it a third time.”). Each keeps what it did on a
## monster (foe_words.gd, foe_melds52.gd and the city's) and gains a moment seen happen, laid on him in the enemy's pink and gold
## (fx_m52p_redo.gd). Called from foe_melds52.gd's hooks and foe_words.gd's frame. Its own state on the monster is in `m.m52`
## ("rd_..."), on him in `foe_hi` ("rd_...").
## ROUND 1: Ambush, Berserk, Blight, Bulwark, Canker, Delirium, Doom, Duelist, Eternity, Evil Eye, Fervor, Fever, Fury, Glide,
## Grudge, Haymaker, Hourglass, Lamprey, Lancet, Manacle. ROUND 2: Mauler, Momentum, Needle, Onrush, Pin, Quickdraw, Quickening,
## Rapier, Reverb, Riposte, Siphon, Stillpoint, Sunder, Tailwind, Tempo, Timeslip, Transfusion, Vendetta, Windward, Amber. ROUND 3:
## Beckon, Bedrock, Blink, Bloodcurse, Bloodlust, Bloodtide, Blur, Brimstone, Bullseye, Burden, Cataclysm, Cauterize, Coldblood,
## Daze, Doubletap, Feeding Frenzy, Fetters, Flechette, Fortress, Frostbite.
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
	# (Sunder's sundered guard and Vendetta's sigil on him: its blows land harder while they last)
	if float(k.call("sunder")) > 0.0 and F.clock < float(h.foe_hi.get("rd_sunder", -1.0)):
		mult *= 1.2
	if float(k.call("vendetta")) > 0.0 and F.clock < float(h.foe_hi.get("rd_vend", -1.0)):
		mult *= 1.3
	# (Bloodtide: one its healing reached hits harder a while)
	if F.clock < float(by.m52.get("rd_tide", -1.0)):
		mult *= 1.2
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
	# --- ROUND 2
	if s.call("mauler") and (h.root_t > 0.0 or n % 2 == 0) and not h.foe_hi.has("rd_maul"):
		h.foe_hi["rd_maul"] = {"m": by, "n": 2, "next": F.clock + 0.2}
	if s.call("momentum") and n % 3 == 0:
		h.knock(away, 1.6)
		_tell(h, "momentum", "barrel", h.world)
	if s.call("needle") and n % 3 == 0:
		h.foe_hi["rd_sting"] = {"at": F.clock + 2.5, "dps": F._avg(by) * 0.15}
		_tell(h, "needle", "needle", h.world)
	if s.call("onrush") and F.clock - float(by.m52.get("rd_rushed", -9.0)) < 1.5:
		by.m52["rd_rushed"] = -9.0
		h.knock(away, 1.2)
		h.held = maxf(h.held, 0.3)
		_tell(h, "onrush", "bowl", h.world)
	if s.call("pin") and n % 2 == 1:
		h.root_t = maxf(h.root_t, 0.5) + 0.6
		_tell(h, "pin", "spike", h.world)
	if s.call("reverb"):
		var ec: Array = h.foe_hi.get("rd_echo", [])
		ec.append({"at": F.clock + 0.5, "dmg": dmg * 0.3})
		h.foe_hi["rd_echo"] = ec
	if s.call("stillpoint") and n % 3 == 0:
		h.held = maxf(h.held, 0.4)
		_tell(h, "stillpoint", "stop", h.world, {"secs": 0.4})
	if s.call("sunder") and n % 2 == 0:
		h.foe_hi["rd_sunder"] = F.clock + 3.0
		_tell(h, "sunder", "plates", h.world)
	if s.call("tempo") and n % 3 == 0:
		h.held = maxf(h.held, 0.35)
		_tell(h, "tempo", "beat", h.world)
	if s.call("vendetta") and n % 3 == 0:
		h.foe_hi["rd_vend"] = F.clock + 4.0
		_tell(h, "vendetta", "sigil", h.world, {"secs": 4.0})
	if s.call("amber"):
		h.root_t = maxf(h.root_t, 0.8)
		h.foe_hi["rd_amber"] = true
		_tell(h, "amber", "amber", h.world, {"secs": h.root_t})
	# --- ROUND 3
	if s.call("bedrock") and n % 2 == 0:
		h.held = maxf(h.held, 0.4)
		_tell(h, "bedrock", "rock", h.world)
	if s.call("bloodtide"):
		for o in F.main._monsters.list:
			if o != by and _alive(F, o) and o.world.distance_to(by.world) <= 3.0:
				o.m52["rd_tide"] = F.clock + 3.0
				_tell(h, "bloodtide", "stream", by.world, {"x1": o.world.x, "y1": o.world.y, "stay": true})
	if s.call("burden") and F.clock - float(by.m52.get("rd_weight", -9.0)) > 1.5:
		by.m52["rd_weight"] = F.clock
		h.chill(1.5, 0.3)
		_tell(h, "burden", "weight", h.world, {"secs": 1.5})
	if s.call("cataclysm") and n % 3 == 0:
		h.held = maxf(h.held, 0.3)
		h.knock(away, 0.6)
		_tell(h, "cataclysm", "split", h.world, {"r": 1.4})
	if s.call("daze") and (h.held > 0.0 or h._knock_t > 0.0 or n >= 2):
		h.chill(1.0, 0.3)
		_tell(h, "daze", "stars", h.world)
	if s.call("doubletap") and n % 2 == 0:
		h.held = maxf(h.held, 0.35)
		_tell(h, "doubletap", "down", h.world)
	if s.call("fetters"):
		h.foe_hi["rd_cuff"] = true
	if s.call("fortress") and by.shield > 0.0:
		h.held = maxf(h.held, 0.4)
		_tell(h, "fortress", "wall", h.world)


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
	# --- ROUND 2
	if m.word_share("onrush") > 0.0 and dist >= 1.8 and dist <= 5.0 and now - float(m.m52.get("rd_rush_at", -9.0)) > 4.0:
		m.m52["rd_rush_at"] = now
		m.m52["rd_rushed"] = now
		var was: Vector2 = Rules.dash_at(m, h.world, 1.0)
		_tell(h, "onrush", "rush", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("quickdraw") > 0.0 and dist >= 1.5 and dist <= 3.2 and now - float(m.m52.get("foe_last", -99.0)) >= 2.0 and now - float(m.m52.get("rd_gleam", -9.0)) > 3.0:
		m.m52["rd_gleam"] = now
		var was: Vector2 = Rules.dash_at(m, h.world, 1.0)
		_tell(h, "quickdraw", "gleam", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("quickening") > 0.0 and m.life < m.max_life * 0.7 and dist <= 4.0 and now - float(m.m52.get("rd_image", -9.0)) > 1.5:
		m.m52["rd_image"] = now
		h.hurt_by(maxf(1.0, roundf(F._avg(m) * 0.15)), "phys", [], {}, null, Vector2.INF, true)
		_tell(h, "quickening", "image", m.world, {"stay": true, "x1": h.world.x, "y1": h.world.y})
	if m.word_share("rapier") > 0.0 and m.life < m.max_life * 0.6 and dist <= 3.0 and now - float(m.m52.get("rd_lunge", -9.0)) > 3.0:
		m.m52["rd_lunge"] = now
		var was: Vector2 = m.world
		var way: Vector2 = (h.world - m.world).normalized() if dist > 0.01 else Vector2(1, 0)
		m.world = h.world + way * 1.0
		_tell(h, "rapier", "lunge", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("siphon") > 0.0 and h.poison_t > 0.0 and dist <= 6.0 and now - float(m.m52.get("rd_thread", -9.0)) > 0.8:
		m.m52["rd_thread"] = now
		h.hurt_by(1.0, "phys", [], {}, null, Vector2.INF, true)
		m.life = minf(m.max_life, m.life + 2.0)
		_tell(h, "siphon", "thread", h.world, {"x1": m.world.x, "y1": m.world.y})
	if m.word_share("tailwind") > 0.0 and dist >= 1.5 and dist <= 4.0 and now - float(m.m52.get("rd_grit", -9.0)) > 1.2:
		m.m52["rd_grit"] = now
		h.chill(1.0, 0.25)
		_tell(h, "tailwind", "grit", h.world, {"x1": m.world.x, "y1": m.world.y})
	if m.word_share("timeslip") > 0.0 and dist >= 2.0 and dist <= 6.0 and now - float(m.m52.get("rd_slip", -9.0)) > 4.0:
		m.m52["rd_slip"] = now
		var was: Vector2 = m.world
		var side := Vector2(-(h.world - m.world).y, (h.world - m.world).x).normalized()
		m.world = h.world + side * 1.0
		_tell(h, "timeslip", "slip", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("transfusion") > 0.0 and now - float(m.m52.get("rd_tf", -9.0)) > 1.0:
		m.m52["rd_tf"] = now
		for o in F.main._monsters.list:
			if o != m and _alive(F, o) and o.world.distance_to(m.world) <= 3.0:
				m.life = minf(m.max_life, m.life + 2.0)
				_tell(h, "transfusion", "thread", o.world, {"stay": true, "x1": m.world.x, "y1": m.world.y})
				break
	# --- ROUND 3
	if m.word_share("beckon") > 0.0 and h.hex_t > 0.0 and dist >= 1.4 and dist <= 6.0 and now - float(m.m52.get("rd_hand", -9.0)) > 2.5:
		m.m52["rd_hand"] = now
		var from: Vector2 = h.world
		h.world = m.world + (h.world - m.world).normalized() * 1.2
		_tell(h, "beckon", "hand", h.world, {"x1": m.world.x, "y1": m.world.y})
	if m.word_share("blink") > 0.0 and dist >= 1.5 and dist <= 4.0 and now - float(m.m52.get("rd_streak", -9.0)) > 2.5:
		m.m52["rd_streak"] = now
		var was: Vector2 = m.world
		m.world = h.world + (h.world - m.world).normalized() * 1.0
		h.hurt_by(maxf(1.0, roundf(F._avg(m) * 0.2)), "phys", [], {}, null, Vector2.INF, true)
		_tell(h, "blink", "streak", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("bloodcurse") > 0.0 and h.hex_t > 0.0 and dist <= 5.0 and now - float(m.m52.get("rd_drops", -9.0)) > 0.8:
		m.m52["rd_drops"] = now
		h.hurt_by(1.0, "phys", [], {}, null, Vector2.INF, true)
		m.life = minf(m.max_life, m.life + 2.0)
		_tell(h, "bloodcurse", "drops", h.world, {"x1": m.world.x, "y1": m.world.y})
	if m.word_share("bloodlust") > 0.0 and m.life >= m.max_life - 0.5 and dist >= 1.6 and dist <= 5.0 and now - float(m.m52.get("rd_lust", -9.0)) > 4.0:
		m.m52["rd_lust"] = now
		_tell(h, "bloodlust", "mist", m.world, {"stay": true})
		var was: Vector2 = Rules.dash_at(m, h.world, 1.0)
		_tell(h, "bloodlust", "charge", h.world, {"x1": was.x, "y1": was.y})
	if m.word_share("blur") > 0.0 and m.life < m.max_life * 0.4:
		if not m.m52.has("rd_blur"):
			m.m52["rd_blur"] = now + 3.0
		if now < float(m.m52["rd_blur"]) and now - float(m.m52.get("rd_flick", -9.0)) > 0.6:
			m.m52["rd_flick"] = now
			var a: float = (m.world - h.world).angle() + 2.1
			m.world = h.world + Vector2(cos(a), sin(a)) * 1.1
			h.hurt_by(maxf(1.0, roundf(F._avg(m) * 0.15)), "phys", [], {}, null, Vector2.INF, true)
			_tell(h, "blur", "flicker", m.world, {"stay": true})
	if m.word_share("brimstone") > 0.0 and h.burn_t > 0.0 and dist <= 6.0 and now - float(m.m52.get("rd_brim", -9.0)) > 2.5:
		m.m52["rd_brim"] = now
		var p: Vector2 = h.world + Vector2(randf_range(-0.6, 0.6), randf_range(-0.6, 0.6))
		F.main._monsters.perils.warn(p.x, p.y, 0.8, 0.8, F._avg(m) * 0.5, m)
		_tell(h, "brimstone", "brimstone", h.world, {"secs": 0.8})
	if m.word_share("bullseye") > 0.0 and dist <= 2.5 and now - float(m.m52.get("rd_rings", -9.0)) > 3.0:
		m.m52["rd_rings"] = now
		_tell(h, "bullseye", "rings", h.world, {"secs": 0.8})
	if m.word_share("cauterize") > 0.0 and m.life < m.max_life * 0.35 and not m.m52.get("rd_sear", false):
		m.m52["rd_sear"] = true
		m.life = minf(m.max_life, m.life + m.max_life * 0.15)
		if dist <= 2.0:
			h.burn_dps = maxf(h.burn_dps if h.burn_t > 0.0 else 0.0, maxf(1.0, F._avg(m) * 0.15))
			h.burn_t = maxf(h.burn_t, 3.0)
		_tell(h, "cauterize", "flare", m.world, {"stay": true})
	if m.word_share("coldblood") > 0.0 and h.chill_t > 0.0 and dist <= 5.0 and now - float(m.m52.get("rd_warm", -9.0)) > 0.8:
		m.m52["rd_warm"] = now
		h.hurt_by(1.0, "phys", [], {}, null, Vector2.INF, true)
		m.life = minf(m.max_life, m.life + 2.0)
		_tell(h, "coldblood", "warmth", h.world, {"x1": m.world.x, "y1": m.world.y})
	if m.word_share("feedingfrenzy") > 0.0 and m.life < m.max_life * 0.4 and not m.m52.get("rd_gorge", false):
		m.m52["rd_gorge"] = true
		m.life = minf(m.max_life, m.life + m.max_life * 0.2)
		_tell(h, "feedingfrenzy", "gorge", m.world, {"stay": true})
	if m.word_share("frostbite") > 0.0 and h.chill_t > 0.0 and dist <= 6.0:
		var fb: float = float(h.foe_hi.get("rd_fb", 0.0)) + _dt
		if fb >= 1.5:
			fb = 0.0
			h.held = maxf(h.held, 0.5)
			_tell(h, "frostbite", "freeze", h.world)
		h.foe_hi["rd_fb"] = fb
	if m.word_share("windward") > 0.0 and m.shield > 0.0 and dist <= 1.6 and now - float(m.m52.get("rd_gust", -9.0)) > 1.5:
		m.m52["rd_gust"] = now
		var away: Vector2 = (h.world - m.world).normalized() if dist > 0.01 else Vector2(1, 0)
		h.knock(away, 0.8)
		_tell(h, "windward", "gust", h.world)


## His blow on its shield (`soaked`): Riposte answers with a counter-thrust.
static func shield(F, m, soaked: float) -> void:
	if not _on(m) or soaked <= 0.0:
		return
	var h = F.main.hero
	if m.word_share("riposte") > 0.0 and F.clock - float(m.m52.get("rd_counter", -9.0)) > 0.8:
		m.m52["rd_counter"] = F.clock
		h.hurt_by(maxf(1.0, roundf(F._avg(m) * 0.4)), "phys", [], {}, null, Vector2.INF, true)
		_tell(h, "riposte", "counter", h.world, {"x1": m.world.x, "y1": m.world.y})


## A monster has died: Fervor's carriers near it are fed.
static func death(F, dead) -> void:
	if not M52.REDO_ON or dead == null:
		return
	var h = F.main.hero
	if dead.word_share("flechette") > 0.0:
		h.hurt_by(maxf(1.0, roundf(F._avg(dead) * 0.2)), "phys", [], {}, null, Vector2.INF, true)
		_tell(h, "flechette", "darts", h.world, {"x1": dead.world.x, "y1": dead.world.y})
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
	# --- ROUND 2: Mauler's flurry, Needle's sting, Reverb's echoes, Amber cracking away
	if h.foe_hi.has("rd_maul") and now >= float(h.foe_hi["rd_maul"]["next"]):
		var mu: Dictionary = h.foe_hi["rd_maul"]
		var mm = mu["m"]
		if _alive(F, mm):
			h.hurt_by(maxf(1.0, roundf(F._avg(mm) * 0.25)), "phys", [], {}, null, Vector2.INF, true)
			_tell(h, "mauler", "maul", h.world)
		mu["n"] = int(mu["n"]) - 1
		mu["next"] = now + 0.2
		if int(mu["n"]) <= 0 or not _alive(F, mm):
			h.foe_hi.erase("rd_maul")
	if h.foe_hi.has("rd_sting") and now >= float(h.foe_hi["rd_sting"]["at"]):
		var dps: float = float(h.foe_hi["rd_sting"]["dps"])
		h.foe_hi.erase("rd_sting")
		h.poison_dps = maxf(h.poison_dps if h.poison_t > 0.0 else 0.0, maxf(1.0, dps))
		h.poison_t = maxf(h.poison_t, 3.0)
		_tell(h, "needle", "sting", h.world)
	if h.foe_hi.has("rd_echo"):
		var ec: Array = h.foe_hi["rd_echo"]
		for k in range(ec.size() - 1, -1, -1):
			if now >= float(ec[k]["at"]):
				h.hurt_by(maxf(1.0, roundf(float(ec[k]["dmg"]))), "phys", [], {}, null, Vector2.INF, true)
				_tell(h, "reverb", "echo", h.world)
				ec.remove_at(k)
		if ec.is_empty():
			h.foe_hi.erase("rd_echo")
	if h.foe_hi.has("rd_cuff") and h.root_t <= 0.0:
		h.foe_hi.erase("rd_cuff")
		h.chill(2.0, 0.3)
		_tell(h, "fetters", "cuff", h.world)
	if h.foe_hi.has("rd_amber") and h.root_t <= 0.0:
		h.foe_hi.erase("rd_amber")
		_tell(h, "amber", "crack", h.world)
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
