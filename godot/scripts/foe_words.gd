## EVERY WORD ON A DUNGEON (game/foe_melds.ts; FOE_WORDS, on in the released game at his yes to the film of them in play, 12 Nov 2026:
## “Yes, hand it to main (Recommended)”). A melded word and a ranked one may be laid on a stronghold's altar, each counting as two
## words (his “Counts as two words”: as hard and as rich as two). On the monsters it is burned into, a melded word does what each of
## its two words does there and a twist of its own (his “Both words plus a twist”, each twist his pick: FOE_TEXT); a ranked word its
## word half as strong again (his “Yes, half as strong again”: monster.gd word_share).
## My readings, told him (as the game's): a melded word on the altar brings its own elements, and no other word of an element may lie
## beside it (one element per stronghold, as before, or a melded word's two); nor a word already in a melded word on it.
## THE TWISTS, the numbers the game's (words.json `foe.tune`):
##   on his blow (harder): AVALANCHE on him chilled; SCALD a fire blow on him chilled or a frost one on him burning, cracks; BLIGHT's
##     poison on him, every blow harder; SHIVER now and then a critical, freezing him a moment; SUNDER its next blow soon after one
##     that knocked him back; FERVOR fed by the deaths round it, its fire hotter
##   after his blow: SIPHON while its poison is on him he heals less; FROSTBITE while it has chilled him he bleeds cold; WILDFIRE a
##     small fire where he stood, sparking at him while he stays near; FORKING a lightning blow forks, a second bolt where he was;
##     ERUPTION every fourth blow its heat bursts round it; THUNDER every third blow a thunderclap round it
##   as it lives: HAILSTORM hail on a marked circle round him every few seconds; CAUTERIZE low on life it sears its wounds shut,
##     once; FERVOR's feeding wears off; RIME WARD a blow of his on its shield chills him
##   as it dies: FUMES a cloud that goes up if anything burning comes into it; CONTAGION a crackling cloud; RUPTURE a poison
##     splash; POWDERKEG burning ground as its blast goes off; CHAIN REACTION an arc at him from its blast; SHATTER a ring of ice
##     shards; DEMOLITION its blast wider, slower and harder; IMPLODE it pulls him in, then bursts; FERVOR feeds the others near
## Its grounds (fire, clouds, the pull) lie among his own in wakes.gd's list, `hostile`, drawn as the game draws a ground of their
## kind; they harm him, not the monsters (but Fumes' blast, which harms all).
extends Node

const Words := preload("res://scripts/words.gd")

var main
## (the game's clock, its own: what Sunder's and Rime Ward's moments are measured on)
var clock := 0.0
## (what the last blow's twists decided as it landed, for what it leaves: a Shiver critical, a Sunder follow-up)
var _shiver := false
var _sunder := false
## (for the checks: what it has done, newest last)
var told: Array = []


func _process(dt: float) -> void:
	clock += dt


static func D() -> Dictionary:
	return Words.data().get("foe", {})


static func T() -> Dictionary:
	return D().get("tune", {})


static func on() -> bool:
	return bool(D().get("on", false))


# --- the words themselves (foe_melds.ts) ---

static func is_meld(w: String) -> bool:
	return Words.data()["melds"]["of"].has(w)


static func is_rank(w: String) -> bool:
	return Words.data()["melds"]["rankOf"].has(w)


## (wordWeight) How many words this counts as on an altar: a melded or ranked word two, any other one.
static func weight(w: String) -> int:
	return int(T().get("weight", 2)) if on() and (is_meld(w) or is_rank(w)) else 1


static func words_weight(ws: Array) -> int:
	var n := 0
	for w in ws:
		n += weight(w)
	return n


## (partsOf) The base words a word is made of: a melded word's two, a ranked word's own, any other itself.
static func parts_of(w: String) -> Array:
	if is_meld(w):
		return (Words.data()["melds"]["of"][w] as Array).duplicate()
	if is_rank(w):
		return [str(Words.data()["melds"]["rankOf"][w]["word"])]
	return [w]


static func elements_of(w: String) -> Array:
	var out: Array = []
	for p in parts_of(w):
		var el = Words.word(p).get("element") if Words.data()["words"].has(p) else null
		if el != null:
			out.append(el)
	return out


## (foeWordsOf) What laid words come to on each monster: every base word they are made of, and the melded and ranked words themselves.
static func foe_words_of(ws: Array) -> Array:
	if not on():
		return ws.duplicate()
	var out: Array = []
	for w in ws:
		var all: Array = parts_of(w)
		# (EVERY TWO RUNES MELD, meld_any.gd: one of those is carried as its two words, having no twist of its own)
		if (is_meld(w) and not str(w).contains("+")) or is_rank(w):
			all.append(w)
		for p in all:
			if not out.has(p):
				out.append(p)
	return out


## (layProblem) Why `w` may not join `laid` on an altar, or "".
static func lay_problem(laid: Array, w: String, where: String) -> String:
	var mine := parts_of(w)
	for o in laid:
		if o == w or parts_of(o).any(func(p): return mine.has(p)):
			return "Already on it"
	if not elements_of(w).is_empty() and laid.any(func(o): return not elements_of(o).is_empty()):
		return "One element per %s" % where
	return ""


## (secondElement) A melded word of two elements among `words`, and the blow's element one of them: the other.
static func second_element(words: Array, el: String) -> String:
	if not on():
		return ""
	for w in words:
		if not is_meld(w):
			continue
		var es := elements_of(w)
		if es.size() == 2 and es.has(el):
			return es[1] if es[0] == el else es[0]
	return ""


## (rankOfElement) A ranked word of this element among `words`: its statuses on him half as strong again.
static func rank_of_element(words: Array, el: String) -> float:
	if not on():
		return 1.0
	for w in words:
		if is_rank(w) and str(Words.data()["melds"]["rankOf"][w]["word"]) == el:
			return 1.5
	return 1.0


## (foeText) A melded or ranked word's page ON A DUNGEON.
static func page(w: String) -> String:
	return str(D().get("page", {}).get(w, ""))


# --- in play ---

func _say(at: Vector2, text: String, color: String) -> void:
	_tell({"t": "text", "x": at.x, "y": at.y, "text": text, "color": color})


func _tell(e: Dictionary) -> void:
	told.append(e)
	if told.size() > 64:
		told.pop_front()
	if main != null and main.hero != null and main.hero.has_method("_tell"):
		main.hero._tell(e)


func _avg(m) -> float:
	return (float(m.dmg_min) + float(m.dmg_max)) / 2.0


func _warn(at: Vector2, r: float, wait: float, dmg: float, el: String, m) -> void:
	if main == null or main._monsters == null or main._monsters.perils == null:
		return
	main._monsters.perils.warn(at.x, at.y, r, wait, dmg, null, {"el": el, "words": [el] if el != "phys" else [], "half": m.half_of() if m != null and is_instance_valid(m) else {}})


## (foeHarder) Of what's on the blow (`k`: a word's share of it), how much harder it lands on him; `by`, the monster whose blow it is.
func harder(k: Callable, parts: Array, by) -> float:
	var h = main.hero
	var U := T()
	var mult := 1.0
	_shiver = false
	_sunder = false
	var has_el := func(e: String) -> bool: return parts.any(func(p): return p[0] == e)
	if float(k.call("shiver")) > 0.0 and randf() < float(U["shiver"]["chance"]) * float(k.call("shiver")):
		_shiver = true
		mult *= float(U["shiver"]["crit"])
		_say(h.world, "Critical", "#ff8a80")
	var alive_by: bool = by != null and is_instance_valid(by)
	if alive_by and float(k.call("sunder")) > 0.0 and by.foe_sunder_at >= clock - float(U["sunder"]["window"]):
		_sunder = true
		by.foe_sunder_at = -1e9
		mult *= 1.0 + float(U["sunder"]["k"]) * float(k.call("sunder"))
		_say(h.world, "Sundered", "#ff8a80")
		_tell({"t": "burst", "x": h.world.x, "y": h.world.y, "r": 0.8, "el": "phys", "style": "shock", "words": [], "n": 0, "echo": false})
	if alive_by and by.fervor_n > 0 and has_el.call("fire"):
		mult *= 1.0 + float(U["fervor"]["fire"]) * by.fervor_n * maxf(float(k.call("fervor")), by.word_share("fervor"))
	if float(k.call("avalanche")) > 0.0 and h.chill_t > 0.0:
		mult *= 1.0 + float(U["avalanche"]) * float(k.call("avalanche"))
	if float(k.call("scald")) > 0.0 and ((h.chill_t > 0.0 and has_el.call("fire")) or (h.burn_t > 0.0 and has_el.call("frost"))):
		mult *= 1.0 + float(U["scald"]) * float(k.call("scald"))
		_say(h.world, "Cracked", "#ff8a80")
		_tell({"t": "burst", "x": h.world.x, "y": h.world.y, "r": 0.7, "el": "frost", "style": "shock", "words": [], "n": 0, "echo": false})
	if h.poison_t > 0.0 and h.blight_more > 0.0:
		mult *= 1.0 + h.blight_more
	return mult


## (foeAfterBlow) After a blow from `by` (or a mark of its) has hurt him `dmg`: what its words leave on him and round him.
func after_blow(k: Callable, by, dmg: float, parts: Array) -> void:
	var h = main.hero
	var U := T()
	var alive_by: bool = by != null and is_instance_valid(by) and not by.dead
	if float(k.call("siphon")) > 0.0 and h.poison_t > 0.0:
		if h.siphon_less <= 0.0:
			_say(h.world, "Healing cut", "#ff8a80")
		h.siphon_less = maxf(h.siphon_less, minf(0.9, float(U["siphon"]) * float(k.call("siphon"))))
	if _shiver:
		_shiver = false
		# (frozen in place a moment: as the Drowned's frost grab holds him)
		h.held = maxf(h.held, float(U["shiver"]["freeze"]))
		_tell({"t": "freeze", "x": h.world.x, "y": h.world.y})
		_say(h.world, "Frozen", "#a5d8ff")
	if alive_by and float(k.call("sunder")) > 0.0:
		if not _sunder:
			by.foe_sunder_at = clock
		_sunder = false
	if alive_by and float(k.call("forking")) > 0.0 and parts.any(func(p): return p[0] == "lightning"):
		var F: Dictionary = U["forking"]
		_warn(h.world, float(F["r"]), float(F["wait"]), _avg(by) * float(F["k"]) * float(k.call("forking")), "lightning", by)
	if float(k.call("blight")) > 0.0 and h.poison_t > 0.0:
		h.blight_more = maxf(h.blight_more, float(U["blight"]) * float(k.call("blight")))
	if float(k.call("frostbite")) > 0.0 and h.chill_t > 0.0:
		h.frostbite_dps = maxf(h.frostbite_dps, dmg * float(U["frostbite"]) * float(k.call("frostbite")))
	# (Wildfire: a small fire where he stood, sparking at him while he stays near it; not too many)
	if float(k.call("wildfire")) > 0.0 and alive_by:
		var W: Dictionary = U["wildfire"]
		var fires: Array = _grounds().filter(func(z): return z.get("foe") == "wildfire")
		var last = fires.filter(func(z): return z.get("src") == by and float(z["t"]) < float(W["gap"]))
		if last.is_empty() and fires.size() < int(W["most"]):
			_ground(h.world, float(W["r"]), float(W["secs"]), "burn", "fire", dmg * float(W["k"]) * float(k.call("wildfire")), [], by, "wildfire")
	# (Eruption's heat, Thunder's clap: counted on its blows)
	if not alive_by:
		return
	var er: float = by.word_share("eruption")
	var th: float = by.word_share("thunder")
	if er > 0.0 or th > 0.0:
		by.foe_n += 1
		var E: Dictionary = U["eruption"]
		var TH: Dictionary = U["thunder"]
		if er > 0.0 and by.foe_n % int(E["heat"]) == 0:
			_warn(by.world, float(E["r"]), float(E["wait"]), _avg(by) * float(E["k"]) * er, "fire", by)
			_say(by.world, "Heat!", "#ff8a80")
		if th > 0.0 and by.foe_n % int(TH["every"]) == 0:
			_warn(by.world, float(TH["r"]), float(TH["wait"]), _avg(by) * float(TH["k"]) * th, "lightning", by)


## (foeTick) A monster's turn, awake and near: Hailstorm's hail round him; Cauterize, once, low on life; Fervor wearing off.
func tick(m, dt: float, dist: float) -> void:
	var U := T()
	if m.fervor_t > 0.0:
		m.fervor_t = maxf(0.0, m.fervor_t - dt)
		if m.fervor_t <= 0.0:
			m.fervor_n = 0
	var C: Dictionary = U["cauterize"]
	var ck: float = m.word_share("cauterize")
	if ck > 0.0 and not m.seared and m.life > 0.0 and m.life < m.max_life * float(C["below"]):
		# (a flash of its fire first, then its wounds seared shut: some of its life back)
		m.seared = true
		_tell({"t": "burst", "x": m.world.x, "y": m.world.y, "r": 1.0, "el": "fire", "style": "shock", "words": [], "n": 0, "echo": false})
		_say(m.world, "Searing", "#ffb070")
		if main.sfx != null:
			main.sfx.play("fire", linear_to_db(0.7))
		get_tree().create_timer(float(C["flash"]), false).timeout.connect(func() -> void:
			if not is_instance_valid(m) or m.dead:
				return
			m.life = minf(m.max_life, m.life + m.max_life * float(C["heal"]) * ck)
			_tell({"t": "burst", "x": m.world.x, "y": m.world.y, "r": 1.4, "el": "fire", "style": "blast", "words": [], "n": 0, "echo": false})
			_say(m.world, "Seared shut", "#ffb070"))
	var H: Dictionary = U["hailstorm"]
	var hk: float = m.word_share("hailstorm")
	if hk <= 0.0 or m.state == "sleep":
		return
	m.hail_t = (m.hail_t if m.hail_t > -1e8 else float(H["every"]) * 0.6) - dt
	if m.hail_t > 0.0:
		return
	m.hail_t = float(H["every"])
	if dist > float(H["near"]) or main._monsters.shut_in(m):
		return
	var h = main.hero
	main._monsters.perils.warn(h.world.x, h.world.y, float(H["r"]), float(H["wait"]), _avg(m) * float(H["k"]) * hk, null, {"el": "frost", "words": ["frost", "lightning", "hailstorm"], "half": m.half_of()})


## (foeBlast) A monster carrying Volatile's blast as Demolition makes it, or Implode: {r, wait, k}; empty, Volatile's own.
func blast(m) -> Dictionary:
	if not on():
		return {}
	if m.word_share("demolition") > 0.0:
		return T()["demolition"]
	if m.word_share("implode") > 0.0:
		return T()["implode"]
	return {}


## (foeRage) Its pace and the quickness of its blows, as Fervor's feeding hurries it.
func rage(m) -> float:
	if not on() or m.fervor_n <= 0:
		return 1.0
	return 1.0 + float(T()["fervor"]["speed"]) * m.fervor_n * maxf(0.5, m.word_share("fervor"))


## (foeShield) A blow of his on its shield (`soaked` of it): Rime Ward chills him.
func shield(m, soaked: float) -> void:
	var k: float = m.word_share("rimeward")
	var R: Dictionary = T()["rimeward"]
	if k <= 0.0 or soaked <= 0.0 or m.rime_at > clock - float(R["every"]):
		return
	m.rime_at = clock
	var h = main.hero
	h.chill_k = maxf(h.chill_k if h.chill_t > 0.0 else 0.0, float(R["chill"]) * k)
	h.chill_t = maxf(h.chill_t, float(R["secs"]))
	_tell({"t": "burst", "x": m.world.x, "y": m.world.y, "r": 1.0, "el": "frost", "style": "shock", "words": [], "n": 0, "echo": false})
	_say(h.world, "Chilled", "#a5d8ff")


## (foeDeath) As it dies: what its melded word leaves.
func death(m) -> void:
	if not on():
		return
	var U := T()
	var avg := _avg(m)
	var s := func(w: String) -> float: return m.word_share(w)
	var F: Dictionary = U["fervor"]
	for o in main._monsters.list:
		if o == m or not is_instance_valid(o) or o.dead or o.word_share("fervor") <= 0.0 or o.world.distance_to(m.world) > float(F["near"]):
			continue
		o.fervor_n = mini(int(F["most"]), o.fervor_n + 1)
		o.fervor_t = float(F["secs"])
		_tell({"t": "burst", "x": o.world.x, "y": o.world.y, "r": 0.8, "el": "fire", "style": "shock", "words": [], "n": 0, "echo": false})
		_say(o.world, "Fervor %d" % o.fervor_n, "#ffb070")
	if float(s.call("implode")) > 0.0:
		var I: Dictionary = U["implode"]
		var z := _ground(m.world, float(I["r"]), float(I["wait"]), "vortex", "phys", 0.0, [], m, "implode")
		z["tick"] = 0.0
	if float(s.call("fumes")) > 0.0:
		var FU: Dictionary = U["fumes"]
		_ground(m.world, float(FU["r"]), float(FU["secs"]), "venom", "phys", avg * float(FU["k"]) * float(s.call("fumes")), ["poison"], m, "fumes")
	if float(s.call("contagion")) > 0.0:
		var C: Dictionary = U["contagion"]
		_ground(m.world, float(C["r"]), float(C["secs"]), "venom", "lightning", avg * float(C["k"]) * float(s.call("contagion")), ["poison"], m, "contagion")
	if float(s.call("rupture")) > 0.0:
		var R: Dictionary = U["rupture"]
		_ground(m.world, float(R["r"]), float(R["secs"]), "venom", "phys", avg * float(R["k"]) * float(s.call("rupture")), ["poison"], m, "rupture")
	# (Powderkeg's burning ground and Chain Reaction's arc come as its blast goes off: Volatile's warning, 0.7 s)
	var b := blast(m)
	var wait: float = float(b["wait"]) if not b.is_empty() else 0.7
	if float(s.call("powderkeg")) > 0.0:
		var P: Dictionary = U["powderkeg"]
		var z := _ground(m.world, float(P["r"]), float(P["secs"]) + wait, "burn", "fire", avg * float(P["k"]) * float(s.call("powderkeg")), [], m, "powderkeg")
		# (not burning till the blast: its clock starts behind)
		z["t"] = -wait
	if float(s.call("chainreaction")) > 0.0:
		var CH: Dictionary = U["chain"]
		var at: Vector2 = m.world
		var dmg: float = avg * float(CH["k"]) * float(s.call("chainreaction"))
		get_tree().create_timer(wait, false).timeout.connect(func() -> void:
			var h = main.hero
			if h == null or not h.alive or h.world.distance_to(at) > float(CH["near"]):
				return
			_tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": h.world.x, "y1": h.world.y})
			if main.sfx != null:
				main.sfx.play("zap", linear_to_db(0.6))
			h.hurt_by(dmg, "lightning", [], {}, null, at))
	if float(s.call("shatter")) > 0.0:
		var S: Dictionary = U["shatter"]
		for i in int(S["n"]):
			var a := float(i) / float(S["n"]) * TAU
			main._monsters.shoot(m, Vector2(cos(a), sin(a)), float(S["speed"]), float(S["range"]), avg * float(S["k"]) * float(s.call("shatter")), "bolt", 0.2, false, "frost")


# --- its grounds (foeGround, foeZone) ---

func _grounds() -> Array:
	var w = main.wakes if main != null else null
	return w.list if w != null and is_instance_valid(w) else []


## A monster's ground, hostile: it harms him, not the monsters.
func _ground(at: Vector2, r: float, secs: float, kind: String, el: String, dmg: float, words: Array, m, foe: String) -> Dictionary:
	var z := {"x": at.x, "y": at.y, "r": r, "t": 0.0, "dur": secs, "kind": kind, "element": el, "dmg": dmg, "slow": 0.0, "tick": 0.25,
		"hostile": true, "skill": -1, "words": words, "src": m, "half": m.half_of() if m != null and is_instance_valid(m) else {}, "foe": foe}
	var w = main.wakes if main != null else null
	if w != null and is_instance_valid(w):
		w.list.append(z)
		w._tell({"t": "zone", "kind": kind, "x": at.x, "y": at.y, "r": r, "el": el})
	_tell({"t": "foeGround", "foe": foe, "x": at.x, "y": at.y, "r": r})
	return z


## (hurtFrom) A ground's bite on him.
func _hurt_from(z: Dictionary) -> void:
	var h = main.hero
	h.blow_by = z.get("src")
	h.hurt_by(float(z["dmg"]), str(z["element"]), z.get("words", []), z.get("half", {}), null, Vector2(z["x"], z["y"]))
	h.blow_by = null


## (foeZone) A monster's ground as it ticks (wakes.gd). It is done with when its time is out, or `gone`.
func zone(z: Dictionary, dt: float) -> void:
	var h = main.hero
	if h == null or float(z["t"]) < 0.0:
		return
	var at := Vector2(z["x"], z["y"])
	var U := T()
	var inside: bool = h.world.distance_to(at) <= float(z["r"]) + 0.5 * 0.5
	match z["foe"]:
		"implode":
			# (drawing him in toward where it died, harming nothing itself: its blast is Volatile's warning's)
			z["tick"] = float(z["tick"]) - dt
			if float(z["tick"]) <= 0.0:
				z["tick"] = float(z["tick"]) + float(U["implode"]["every"])
				if h.world.distance_to(at) <= float(U["implode"]["pull"]):
					h.pulled_to(at, float(U["implode"]["share"]))
		"wildfire":
			# (it does not burn him to stand in; it throws a spark at him now and then while he is near)
			z["tick"] = float(z["tick"]) - dt
			if float(z["tick"]) <= 0.0:
				z["tick"] = float(z["tick"]) + float(U["wildfire"]["every"])
				if h.world.distance_to(at) <= float(z["r"]) + float(U["wildfire"]["reach"]):
					_tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": h.world.x, "y1": h.world.y, "meld": "wildfire"})
					if main.sfx != null:
						main.sfx.play("zap", linear_to_db(0.4))
					_hurt_from(z)
		"fumes":
			var lit: bool = h.burn_t > 0.0 and inside
			if not lit:
				for m in main._monsters.list:
					if is_instance_valid(m) and not m.dead and m.burn_t > 0.0 and m.world.distance_to(at) <= float(z["r"]) + m.r * 0.5:
						lit = true
						break
			if lit:
				# (anything burning comes into the cloud: it goes off)
				var F: Dictionary = U["fumes"]
				z["gone"] = true
				_tell({"t": "burst", "x": at.x, "y": at.y, "r": float(F["blastR"]), "el": "fire", "style": "blast", "words": [], "n": 0, "echo": false})
				h.kick(4.0)
				if main.sfx != null:
					main.sfx.play("explode", linear_to_db(0.8))
				var big: float = float(z["dmg"]) / float(F["k"]) * float(F["blastK"])
				if h.world.distance_to(at) <= float(F["blastR"]) + 0.1:
					h.hurt_by(big, "fire", [], {}, null, at)
				for m in main._monsters.list:
					if is_instance_valid(m) and not m.dead and m.world.distance_to(at) <= float(F["blastR"]) + m.r:
						m.damage(maxf(1.0, roundf(big)), "fire", false, false, [], false, false, -1)
				return
			_tick(z, dt, inside, 0.5)
		"contagion":
			_tick(z, dt, inside, float(U["contagion"]["tick"]))
		_:
			_tick(z, dt, inside, 0.5)


func _tick(z: Dictionary, dt: float, inside: bool, every: float) -> void:
	z["tick"] = float(z["tick"]) - dt
	if float(z["tick"]) <= 0.0:
		z["tick"] = float(z["tick"]) + every
		if inside:
			_hurt_from(z)
