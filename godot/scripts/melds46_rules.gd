## THE LAST FLOOR 1–10 MELDS AT WORK ON HIS MOVES (his doc The Last Floor 1–10 Melds, its runes and their animations, each “Good”,
## 23 Nov 2026; their text tools/melds52/docs_last110.txt). As melds52_rules.gd is for the 52 before them: a melded word does the
## work of both its words already (words.gd resolve); here is each one's TWIST, in front and behind, its numbers melds52.json
## `tune`. melds52_rules.gd (the hero's `m52`) hands on to this from each of its own moments (`x`), so the hero's code calls one.
##   SWIFT:    Onrush (half again as hard in a burst of speed; behind, Power's bonus holds while it lasts), Hornet (barbs that
##             stack within a second; behind, every hit in a burst poisons), Glide (each chilled one hit, a little speed; behind,
##             its ice speeds him), Firewalk (bigger blasts in a burst; behind, burning footprints), Quicksilver (each arc, a
##             little speed; behind, arcs to those he runs past), Charge (no slower; each stun shortens its wait; behind, running
##             into them staggers them)
##   HEAVY:    Mire (poison on the stunned twice as fast; behind, its cracks poison what they stagger), Icebreaker (a blow on the
##             frozen breaks the ice; behind, its cracks chill), Anvil (the stunned burn twice as hot; behind, its cracks set alight),
##             Fulgurite (its arcs stun; behind, bolts along its cracks)
##   TWIN:     Lamprey, Cluster, Doubletap, Tempo, Redoubt, Reverb, Staccato, Ripple
##   LEECH:    Bloodbloom, Lancet, Feeding Frenzy, Carapace, Transfusion, Lifeline, Bloodtide
##   VOLATILE: Detonator, Mayhem, Minefield, Timebomb, Hair Trigger, Blastwave
##   PRECISE:  Rapier, Riposte, Vendetta, Ambush, Bullseye
##   FRENZIED: Shieldwall, Fury, Spree, Rampage
##   GUARDING: Sanctuary, Parry, Aegis
##   LASTING AND FLEETING: Hourglass, Aftermath, Whipcrack
## THE LOOKS read the tellings sent (fx_m52p_last110.gd), `m52` {id, what, ...}, told through the 52's (`p._tell`).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const Words := preload("res://scripts/words.gd")
const Iso := preload("res://scripts/iso.gd")

var h
## (the 52's rules: who has what, the tellings, the clock)
var p
var hornet_n := 0
var hornet_at := -99.0
## (a use's first blow critical or not, for Doubletap's second; and whether the hit now landing is critical, for Lancet)
var _first_crit: Array = [false, false, false]
var _crit_now := false
## (an echo of move i landing, till then: Lamprey, Tempo, Reverb behind)
var _echo_until: Array = [-99.0, -99.0, -99.0]
## (Redoubt's second shell given for this shell; Sanctuary, Parry, Aegis: the shield as it was, to see a fresh one)
var _redoubt_done := false
## (his shell as it was last step: Melds 52's own is already brought up to now when this runs)
var _sh_was := 0.0
var _shield_t_was := 0.0
var _parry_t := 0.0
## (Shieldwall: a use's shield to be thickened as it comes)
var _wall_due := false
## (Firewalk's footprints, Quicksilver's passing arcs, Charge's bumps: their clocks)
var _step_t := 0.0
var _pass_t := 0.0
var _bumped := {}
var _hold_told := -99.0
## (Aftermath's lingering ground: {at, r, t, dmg, i, hit: {id: true}})
var _after: Array = []
## (Transfusion's drips to come: {left, each, t})
var _drips: Array = []


func _init(hero, rules) -> void:
	h = hero
	p = rules


func _t(id: String) -> Dictionary:
	return M52.tune(id)


func _tell(e: Dictionary) -> void:
	p._tell(e)


func _mons() -> Array:
	return p._mons()


func _alive(o) -> bool:
	return p._alive(o)


func _once(key: String, secs: float) -> bool:
	if p.time - float(p._throttle.get(key, -99.0)) < secs:
		return false
	p._throttle[key] = p.time
	return true


## A burst of fire, force or frost round `at`, `r` tiles, `dmg` each, in `el`, by move `i`.
func _burst(at: Vector2, r: float, dmg: float, el: String, i: int, but = null) -> int:
	var n := 0
	for o in _mons():
		if o != but and _alive(o) and o.world.distance_to(at) <= r + o.r:
			o.damage(maxf(1.0, roundf(dmg)), el, false, false, [], false, false, i)
			n += 1
	return n


func _hasted() -> bool:
	return h.haste_t > 0.0 or p.tail_t > 0.0 or p.blink_t > 0.0


# --- a use ---

func used(i: int, echo: bool, at: Vector2) -> void:
	var f: String = p.fid(i)
	var b: String = p.bid(i)
	var r: Dictionary = h.loadout.r(i)
	if echo:
		_echo_until[i] = p.time + 0.5
		# STACCATO behind: its repeat almost at once (echo_k); RIPPLE behind: the repeat over a much bigger area
		if b == "staccato":
			_tell({"id": "staccato", "what": "quick", "x": at.x, "y": at.y})
		if b == "ripple" and at != Vector2.INF:
			var R := _t("ripple")
			_burst(at, float(R["echoR"]), h.avg_hit(i, 1.0) * float(R["echoShare"]), str(r["element"]), i)
			_tell({"id": "ripple", "what": "wide", "x": at.x, "y": at.y, "r": float(R["echoR"])})
		return
	_first_crit[i] = false
	# HORNET: each use within a second of the last, one more barb, up to three
	if f == "hornet":
		var H := _t("hornet")
		hornet_n = mini(int(H["most"]), hornet_n + 1) if p.time - hornet_at <= float(H["window"]) else 1
		hornet_at = p.time
	# SPREE: each step of the frenzy twice as big, fading in half the time
	if f == "spree" and h.frenzy > 0:
		var F: Dictionary = Words.data()["frenzy"]
		h.frenzy = mini(int(F["max"]), h.frenzy + 1)
		h.frenzy_t *= float(_t("spree")["fade"])
		_tell({"id": "spree", "what": "burst", "n": h.frenzy, "x": h.world.x, "y": h.world.y})
	# RAMPAGE: the move's area grows with the frenzy; behind, its splash
	if f == "rampage":
		if not r.has("size46"):
			r["size46"] = float(r["size"])
		r["size"] = float(r["size46"]) * (1.0 + float(_t("rampage")["each"]) * h.frenzy)
		if h.frenzy > 0:
			_tell({"id": "rampage", "what": "swell", "n": h.frenzy, "x": h.world.x, "y": h.world.y, "r": 1.2 * float(r["size"]) + 1.0})
	if b == "rampage":
		if not r.has("vast46"):
			r["vast46"] = float(r["vast"])
		r["vast"] = float(r["vast46"]) * (1.0 + float(_t("rampage")["splash"]) * h.frenzy)
	# SHIELDWALL: the shield this use gives, thicker for each step of the frenzy (step: as it comes)
	if f == "shieldwall":
		_wall_due = true
	# REDOUBT: a new shell, a new second shell to come
	if f == "redoubt":
		_redoubt_done = false


# --- a hit ---

func crit(m, i: int, c: bool, quiet: bool) -> bool:
	var f: String = p.fid(i)
	var out := c
	match f:
		"doubletap":
			if p.blow_n == 0:
				_first_crit[i] = c
			elif _first_crit[i]:
				out = true
				if not quiet:
					_tell({"id": "doubletap", "what": "tap", "x": m.world.x, "y": m.world.y, "m": m})
		"rapier":
			if not out and randf() < float(_t("rapier")["each"]) * h.frenzy:
				out = true
		"vendetta":
			var n: int = int(m.m52.get("vendetta", 0))
			if not out and randf() < minf(float(_t("vendetta")["most"]), float(_t("vendetta")["each"]) * n):
				out = true
		"ambush":
			if m.life >= m.max_life - 0.5:
				out = true
				if not quiet:
					_tell({"id": "ambush", "what": "glint", "x": m.world.x, "y": m.world.y, "m": m})
		"bullseye":
			if not quiet:
				out = true
				_tell({"id": "bullseye", "what": "ring", "x": m.world.x, "y": m.world.y, "m": m, "r": 1.2 * float(h.loadout.r(i)["size"]) + 1.0})
	# RIPOSTE behind: inside its ward, critical more often; VENDETTA behind: its mark, every third hit
	if not out and _in_ward_of(m.world, "riposte") and randf() < float(_t("riposte")["ward"]):
		out = true
		_tell({"id": "riposte", "what": "ward", "x": m.world.x, "y": m.world.y, "m": m})
	if m.mark_t > 0.0 and str(m.m52.get("mark", "")) == "vendetta":
		m.m52["vend_n"] = int(m.m52.get("vend_n", 0)) + 1
		if int(m.m52["vend_n"]) % int(_t("vendetta")["every"]) == 0:
			out = true
			_tell({"id": "vendetta", "what": "third", "x": m.world.x, "y": m.world.y, "m": m})
	_crit_now = out
	return out


func more(m, i: int, quiet: bool) -> float:
	var f: String = p.fid(i)
	var k := 1.0
	if f == "onrush" and _hasted():
		k *= 1.0 + float(_t("onrush")["more"])
		if not quiet and _once("onrush", 0.2):
			_tell({"id": "onrush", "what": "rush", "x": m.world.x, "y": m.world.y, "m": m, "dx": h.face.x, "dy": h.face.y})
	# AMBUSH behind: its brief mark, spent in time, twice as hard
	if m.mark_t > 0.0 and str(m.m52.get("mark", "")) == "ambush":
		k *= float(_t("ambush")["double"])
		if not quiet:
			_tell({"id": "ambush", "what": "snap", "x": m.world.x, "y": m.world.y, "m": m})
	return k


func heal_k(m, i: int) -> float:
	var f: String = p.fid(i)
	var r: Dictionary = h.loadout.r(i)
	var k := 1.0
	match f:
		"lamprey":
			if p.blow_n >= 1:
				k *= float(_t("lamprey")["second"])
			_tell({"id": "lamprey", "what": "drink", "n": p.blow_n, "x": m.world.x, "y": m.world.y, "x1": h.world.x, "y1": h.world.y})
		"lancet":
			if _crit_now:
				k *= float(_t("lancet")["crit"])
				_tell({"id": "lancet", "what": "cut", "x": m.world.x, "y": m.world.y, "m": m, "x1": h.world.x, "y1": h.world.y})
		"feedingfrenzy":
			k *= 1.0 + float(_t("feedingfrenzy")["each"]) * h.frenzy
			if h.frenzy >= p._frenzy_most() or _once("feeding", 0.3):
				_tell({"id": "feedingfrenzy", "what": "jaws", "n": h.frenzy, "x": m.world.x, "y": m.world.y, "m": m, "x1": h.world.x, "y1": h.world.y})
		"carapace":
			var gives: float = float(r["leech"]) * k
			var over: float = gives - (h.max_life - h.life)
			if over > 0.0:
				h.shield = minf(h.max_life * float(_t("carapace")["most"]), h.shield + over)
				h.shield_t = maxf(h.shield_t, float(Words.data()["guard"]["shieldTime"]))
				_tell({"id": "carapace", "what": "plate", "x": h.world.x, "y": h.world.y})
		"transfusion":
			var T := _t("transfusion")
			var whole: float = float(r["leech"])
			var n: int = int(T["ticks"])
			_drips.append({"left": n, "each": whole * float(T["later"]) / n, "t": float(T["secs"]) / n, "every": float(T["secs"]) / n})
			k *= float(T["now"])
			_tell({"id": "transfusion", "what": "drip", "x": m.world.x, "y": m.world.y, "x1": h.world.x, "y1": h.world.y})
		"lifeline":
			if h.life < h.max_life * float(_t("lifeline")["below"]):
				k *= float(_t("lifeline")["more"])
				_tell({"id": "lifeline", "what": "beat", "x": h.world.x, "y": h.world.y, "x1": m.world.x, "y1": m.world.y})
		"bloodtide":
			if h.has_method("allies_heal"):
				h.allies_heal(float(r["leech"]) * float(_t("bloodtide")["share"]), 4.0)
			if _once("bloodtide", 0.25):
				_tell({"id": "bloodtide", "what": "tide", "x": m.world.x, "y": m.world.y, "x1": h.world.x, "y1": h.world.y})
	return k


## After hit `dmg` of move `i` has landed on `m` (`was_*`: what it was before this hit). Before the 52's own, dead or not.
func struck(m, i: int, dmg: float, c: bool, at: Vector2, quiet: bool, was_frozen: bool) -> void:
	var f: String = p.fid(i)
	var b: String = p.bid(i)
	var r: Dictionary = h.loadout.r(i)
	# (behind: what a hit does whatever the move is in front)
	if b == "hornet" and h.haste_t > 0.0 and not m.dead:
		m.dose(maxf(1.0, dmg * float(_t("hornet")["sting"])), 3.0, "poison")
		if _once("hornet_b", 0.3):
			_tell({"id": "hornet", "what": "sting", "x": at.x, "y": at.y, "m": m})
	if b == "lamprey" and p.time < float(_echo_until[i]) and float(r["leech"]) > 0.0:
		h.heal_flat(float(r["leech"]) * float(_t("lamprey")["echo"]))
		_tell({"id": "lamprey", "what": "echo", "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y})
	if b == "bloodtide" and float(r["vast"]) > 0.0 and not quiet:
		var n := 0
		for o in _mons():
			if o != m and _alive(o) and o.world.distance_to(at) <= float(Words.data()["vast"]["splashR"]) + o.r:
				n += 1
		if n > 0:
			h.heal_flat(float(r["leech"]) * float(_t("bloodtide")["splashHeal"]) * n)
			_tell({"id": "bloodtide", "what": "splash", "n": n, "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y})
	if b == "aftermath" and float(r["vast"]) > 0.0 and not quiet:
		var A := _t("aftermath")
		_after.append({"at": at, "r": float(Words.data()["vast"]["splashR"]), "t": float(A["splashSecs"]), "dmg": dmg * float(A["share"]) * 0.5, "i": i, "hit": {m.get_instance_id(): true}})
		_tell({"id": "aftermath", "what": "linger", "x": at.x, "y": at.y, "r": float(Words.data()["vast"]["splashR"]), "secs": float(A["splashSecs"])})
	if b == "whipcrack" and float(r["vast"]) > 0.0 and not quiet:
		var W := _t("whipcrack")
		var n2 := 0
		for o in _mons():
			if o != m and _alive(o) and o.world.distance_to(at) > float(Words.data()["vast"]["splashR"]) and o.world.distance_to(at) <= float(W["reach"]):
				o.damage(maxf(1.0, roundf(dmg * float(W["share"]))), str(r["element"]), false, false, [], false, false, i)
				n2 += 1
		_tell({"id": "whipcrack", "what": "snap", "x": at.x, "y": at.y, "r": float(W["reach"])})
	if f == "":
		return
	# (in front)
	match f:
		"hornet":
			if float(r["poison"]) > 0.0 and not m.dead:
				var dose: float = dmg * float(r["poison"]) * float(r["pace"])
				for n in hornet_n - 1:
					m.dose(dose, float(Words.data()["poison"]["time"]) * float(r["last"]), "poison")
			if not quiet:
				_tell({"id": "hornet", "what": "barb", "n": hornet_n, "x": at.x, "y": at.y, "m": m})
		"glide":
			if m.chill_t > 0.0:
				var G := _t("glide")
				h.haste = maxf(h.haste, float(G["haste"]))
				h.haste_t = maxf(h.haste_t, float(G["hasteSecs"]))
				if _once("glide", 0.2):
					_tell({"id": "glide", "what": "skate", "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y})
		"firewalk":
			if _hasted() and not quiet:
				var F := _t("firewalk")
				_burst(at, float(F["bloomR"]), dmg * float(F["bloom"]), "fire", i, m)
				_tell({"id": "firewalk", "what": "bloom", "x": at.x, "y": at.y, "r": float(F["bloomR"])})
		"charge":
			if m.stun_t > 0.0 and not quiet:
				h.cool_by(float(r["cooldown"]) * float(_t("charge")["cut"]))
				_tell({"id": "charge", "what": "ram", "x": at.x, "y": at.y, "m": m, "dx": h.face.x, "dy": h.face.y})
		"mire":
			if m.stun_t > 0.0 and m.poison_t > 0.0 and not m.dead and not bool(m.m52.get("mired", false)):
				p._tag(m)
				m.m52["mired"] = true
				m.poison_dps *= float(_t("mire")["faster"])
				m.poison_t /= float(_t("mire")["faster"])
			if m.stun_t > 0.0 and not quiet:
				_tell({"id": "mire", "what": "mud", "x": at.x, "y": at.y, "m": m})
		"icebreaker":
			if was_frozen and not quiet:
				var I := _t("icebreaker")
				if not m.dead:
					m.damage(maxf(1.0, roundf(dmg * float(I["shatter"]))), "frost", false, false, [], false, false, i)
				for o in _mons():
					if o != m and _alive(o) and o.world.distance_to(at) <= float(I["r"]) + o.r:
						o.stagger_cd = 0.0
						o.stagger_from(at)
				_tell({"id": "icebreaker", "what": "shatter", "x": at.x, "y": at.y, "m": m, "r": float(I["r"])})
		"anvil":
			if m.stun_t > 0.0 and not m.dead:
				if m.burn_t > 0.0 and not bool(m.m52.get("anviled", false)):
					p._tag(m)
					m.m52["anviled"] = true
					m.burn_dps *= float(_t("anvil")["hot"])
				if not quiet:
					_tell({"id": "anvil", "what": "sparks", "x": at.x, "y": at.y, "m": m, "dx": h.face.x, "dy": h.face.y})
		"tempo":
			if p.blow_n >= 1 and not quiet:
				var F: Dictionary = Words.data()["frenzy"]
				h.frenzy = mini(int(F["max"]), h.frenzy + 1)
				h.frenzy_t = maxf(h.frenzy_t, float(F["hold"]) * float(r["last"]))
			if not quiet:
				_tell({"id": "tempo", "what": "beat", "n": h.frenzy, "x": h.world.x, "y": h.world.y})
		"reverb":
			if not m.dead:
				var R := _t("reverb")
				var most: float = float(R["most"])
				for key in ["poison_t", "burn_t", "chill_t", "shock_t"]:
					var v: float = float(m.get(key))
					if v > 0.0:
						m.set(key, minf(most, v * float(R["each"])))
				if not quiet:
					_tell({"id": "reverb", "what": "ring", "x": at.x, "y": at.y, "m": m})
		"staccato":
			if p.blow_n >= 1 and not quiet:
				_tell({"id": "staccato", "what": "tick", "x": at.x, "y": at.y, "m": m, "dx": h.face.x, "dy": h.face.y})
		"ripple":
			if p.blow_n >= 1 and not quiet:
				var R := _t("ripple")
				_burst(at, float(R["r"]), dmg * float(R["share"]), str(r["element"]), i, m)
				_tell({"id": "ripple", "what": "ripple", "x": at.x, "y": at.y, "r": float(R["r"])})
		"detonator":
			if c and not quiet:
				var D := _t("detonator")
				var who = m
				var hit: float = dmg * float(D["share"])
				var el: String = str(r["element"])
				_tell({"id": "detonator", "what": "charge", "x": at.x, "y": at.y, "m": m, "secs": float(D["delay"])})
				p._later_do(float(D["delay"]), func() -> void:
					var spot: Vector2 = who.world if is_instance_valid(who) else at
					_burst(spot, float(D["r"]), hit, el, i)
					_tell({"id": "detonator", "what": "burst", "x": spot.x, "y": spot.y, "r": float(D["r"])}))
		"hairtrigger":
			if not m.dead and not m.boss and m.life < m.max_life * float(_t("hairtrigger")["below"]):
				var HT := _t("hairtrigger")
				var spot: Vector2 = m.world
				m.damage(m.life + 1.0, str(r["element"]), false, false, [], false, false, i)
				_burst(spot, float(HT["r"]), h.avg_hit(i, 1.0) * float(HT["share"]), str(r["element"]), i, m)
				_tell({"id": "hairtrigger", "what": "trigger", "x": spot.x, "y": spot.y, "r": float(HT["r"])})
		"rapier":
			if not quiet:
				_tell({"id": "rapier", "what": "flick", "n": h.frenzy, "x": at.x, "y": at.y, "m": m, "dx": h.face.x, "dy": h.face.y, "crit": c})
		"vendetta":
			if c and not m.dead:
				p._tag(m)
				m.m52["vendetta"] = int(m.m52.get("vendetta", 0)) + 1
				_tell({"id": "vendetta", "what": "tally", "n": int(m.m52["vendetta"]), "x": at.x, "y": at.y, "m": m})
		"hourglass":
			if not m.dead:
				var HG := _t("hourglass")
				if not bool(m.m52.get("glassed", false)):
					p._tag(m)
					m.m52["glassed"] = true
					for key in ["poison_t", "burn_t", "chill_t", "shock_t"]:
						var v: float = float(m.get(key))
						if v > 0.0:
							m.set(key, v * float(HG["longer"]))
				if not quiet and _once("hourglass", 0.3):
					_tell({"id": "hourglass", "what": "turn", "x": at.x, "y": at.y, "m": m})
		"aftermath":
			if not quiet:
				var A := _t("aftermath")
				var rad: float = 1.2 * float(r["size"]) + 1.0
				var hit2 := {}
				for o in _mons():
					if _alive(o) and o.world.distance_to(at) <= rad:
						hit2[o.get_instance_id()] = true
				_after.append({"at": at, "r": rad, "t": float(A["secs"]), "dmg": h.avg_hit(i, 1.0) * float(A["share"]), "i": i, "hit": hit2})
				_tell({"id": "aftermath", "what": "smoke", "x": at.x, "y": at.y, "r": rad, "secs": float(A["secs"])})
		"whipcrack":
			if not quiet:
				_tell({"id": "whipcrack", "what": "crack", "x": at.x, "y": at.y, "r": 1.2 * float(r["size"]) + 1.0, "dx": h.face.x, "dy": h.face.y})


## LIGHTNING's arcs of these: QUICKSILVER, each arc a little speed; FULGURITE, its arcs stun.
func arc_struck(o, i: int) -> void:
	match p.fid(i):
		"quicksilver":
			var Q := _t("quicksilver")
			h.haste = maxf(h.haste, float(Q["haste"]))
			h.haste_t = maxf(h.haste_t, float(Q["hasteSecs"]))
			_tell({"id": "quicksilver", "what": "thread", "x": o.world.x, "y": o.world.y, "x1": h.world.x, "y1": h.world.y})
		"fulgurite":
			o.stun_for(float(_t("fulgurite")["stun"]))
			_tell({"id": "fulgurite", "what": "stun", "x": o.world.x, "y": o.world.y, "m": o})


# --- a kill ---

func killed(m, i: int) -> void:
	var f: String = p.fid(i)
	var b: String = p.bid(i)
	var r: Dictionary = h.loadout.r(i)
	var el: String = str(r["element"])
	var at: Vector2 = m.world
	var life: float = float(m.max_life)
	var vol: float = maxf(0.2, float(r["volatile"]))
	match f:
		"cluster":
			var C := _t("cluster")
			var spots: Array = []
			for k in int(C["n"]):
				var a := randf() * TAU
				spots.append(at + Vector2(cos(a), sin(a)) * float(C["spread"]))
			var hit: float = life * vol * float(C["share"])
			_tell({"id": "cluster", "what": "bomblets", "x": at.x, "y": at.y, "to": spots})
			p._later_do(0.4, func() -> void:
				for s in spots:
					_burst(s, 1.0, hit, el, i)
				_tell({"id": "cluster", "what": "pop", "x": at.x, "y": at.y, "to": spots}))
		"bloodbloom":
			var BB := _t("bloodbloom")
			var n := 0
			for o in _mons():
				if o != m and _alive(o) and o.world.distance_to(at) <= float(BB["r"]) + o.r:
					n += 1
			h.heal_flat(maxf(1.0, float(r["leech"])) * float(BB["share"]) * maxi(1, n))
			_tell({"id": "bloodbloom", "what": "bloom", "n": n, "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y, "r": float(BB["r"])})
		"mayhem":
			var F: Dictionary = Words.data()["frenzy"]
			h.frenzy = mini(int(F["max"]), h.frenzy + 1)
			h.frenzy_t = maxf(h.frenzy_t, float(F["hold"]) * float(r["last"]))
			_tell({"id": "mayhem", "what": "spark", "n": h.frenzy, "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y})
		"minefield":
			if p._shielded():
				var MF := _t("minefield")
				_burst(at, float(MF["r"]), life * vol * float(MF["share"]), el, i, m)
				_tell({"id": "minefield", "what": "mine", "x": at.x, "y": at.y, "r": float(MF["r"])})
		"timebomb":
			var TB := _t("timebomb")
			var hit: float = life * vol * float(TB["big"])
			_tell({"id": "timebomb", "what": "tick", "x": at.x, "y": at.y, "secs": float(TB["delay"])})
			p._later_do(float(TB["delay"]), func() -> void:
				_burst(at, 1.8 * 1.3, hit, el, i)
				_tell({"id": "timebomb", "what": "boom", "x": at.x, "y": at.y, "r": 1.8 * 1.3}))
		"blastwave":
			var BW := _t("blastwave")
			for o in _mons():
				if o != m and _alive(o) and o.world.distance_to(at) <= float(BW["r"]) + o.r:
					o.throw_from(at, maxf(0.4, float(BW["r"]) - o.world.distance_to(at)), 0.25)
			_tell({"id": "blastwave", "what": "wave", "x": at.x, "y": at.y, "r": float(BW["r"])})
	# (behind)
	match b:
		"tempo", "fury":
			if b == "tempo" and p.time >= float(_echo_until[i]):
				pass
			else:
				var F: Dictionary = Words.data()["frenzy"]
				var more: float = float(F["hold"]) * float(r["last"]) * (float(_t("fury")["hold"]) - 1.0 if b == "fury" else 1.0)
				h.frenzy_t = minf(float(F["hold"]) * 4.0 * float(r["last"]), h.frenzy_t + more)
				_tell({"id": b, "what": "hold", "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y})
		"spree":
			var F: Dictionary = Words.data()["frenzy"]
			h.frenzy = mini(int(F["max"]), h.frenzy + 1)
			h.frenzy_t *= float(_t("spree")["fade"])
			_tell({"id": "spree", "what": "two", "n": h.frenzy, "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y})
		"rapier":
			if _crit_now:
				var F: Dictionary = Words.data()["frenzy"]
				h.frenzy = mini(int(F["max"]), h.frenzy + 1)
				_tell({"id": "rapier", "what": "two", "n": h.frenzy, "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y})
		"bloodbloom":
			if randf() < float(_t("bloodbloom")["orb"]) and h.monsters.loot != null:
				h.monsters.loot.orb_at(at)
				_tell({"id": "bloodbloom", "what": "orb", "x": at.x, "y": at.y})
		"feedingfrenzy":
			if h.frenzy >= p._frenzy_most() and h.monsters.loot != null:
				h.monsters.loot.orb_at(at)
				_tell({"id": "feedingfrenzy", "what": "orb", "x": at.x, "y": at.y})
		"mayhem":
			if h.frenzy >= p._frenzy_most():
				var MH := _t("mayhem")
				_burst(at, float(MH["r"]), life * maxf(0.2, vol) * float(MH["share"]), el, i, m)
				_tell({"id": "mayhem", "what": "burst", "x": at.x, "y": at.y, "r": float(MH["r"])})
		"minefield":
			if _in_ward_of(at, "minefield"):
				var MF := _t("minefield")
				_burst(at, float(MF["r"]), life * 0.3 * float(MF["share"]) * 2.0, el, i, m)
				_tell({"id": "minefield", "what": "mine", "x": at.x, "y": at.y, "r": float(MF["r"])})
		"shieldwall":
			if _in_ward_of(at, "shieldwall"):
				var F: Dictionary = Words.data()["frenzy"]
				h.frenzy_t = minf(float(F["hold"]) * 4.0, h.frenzy_t + float(F["hold"]) * (float(_t("shieldwall")["hold"]) - 1.0))
				_tell({"id": "shieldwall", "what": "pulse", "x": at.x, "y": at.y})
	# DETONATOR behind: the marked one goes up twice as big
	if str(m.m52.get("mark", "")) == "detonator" or bool(m.m52.get("det_mark", false)):
		var D := _t("detonator")
		_burst(at, 1.8 * float(D["big"]) * 0.7, life * 0.3 * float(D["big"]), el, i, m)
		_tell({"id": "detonator", "what": "boom", "x": at.x, "y": at.y, "r": 1.8 * float(D["big"]) * 0.7})


# --- Precise behind's marks ---

func marked(m, i: int) -> void:
	var b: String = p.bid(i)
	match b:
		"lancet", "vendetta", "detonator", "ambush", "doubletap", "bullseye", "riposte", "rapier":
			p._tag(m)
			m.m52["mark"] = b
			if b == "detonator":
				m.m52["det_mark"] = true
			if b == "ambush":
				m.mark_t = minf(m.mark_t, float(_t("ambush")["mark"]))
			_tell({"id": b, "what": "mark", "x": m.world.x, "y": m.world.y, "m": m})
	if b == "doubletap" or b == "bullseye":
		var reach: float = float(_t(b)["reach"])
		var n := 0
		for o in _mons():
			if o != m and _alive(o) and o.mark_t <= 0.0 and o.world.distance_to(m.world) <= reach:
				o.mark_t = float(Words.data()["precise"]["markTime"])
				h._tell({"t": "markOn", "id": o.id, "x": o.world.x, "y": o.world.y, "secs": o.mark_t})
				n += 1
				if b == "doubletap":
					break
		_tell({"id": b, "what": "marks", "n": n + 1, "x": m.world.x, "y": m.world.y, "m": m})


## A mark spent (before it is wiped): LANCET's heals; VENDETTA's stays.
func mark_spent(m) -> void:
	var b: String = str(m.m52.get("mark", ""))
	if b == "lancet":
		h.heal_flat(h.max_life * float(_t("lancet")["markHeal"]) * 0.1)
		_tell({"id": "lancet", "what": "markcut", "x": m.world.x, "y": m.world.y, "m": m, "x1": h.world.x, "y1": h.world.y})
	if b == "vendetta":
		# (until it dies: marked again at once)
		var who = m
		p._later_do(0.01, func() -> void:
			if is_instance_valid(who) and not who.dead:
				who.m52["mark"] = "vendetta"
				who.mark_t = maxf(who.mark_t, float(Words.data()["precise"]["markTime"])))


# --- what a move leaves ---

func wake(i: int, laid: Array, b: String) -> void:
	var W = h.wakes
	match b:
		"glide":
			_tell_wake(laid, "ice", "glide", "ice")
		"mire", "icebreaker", "anvil", "fulgurite":
			_tell_wake(laid, "cracks", b, "cracks")
		"cluster":
			for z in laid:
				if str(z["kind"]) == "rune":
					var z0: Dictionary = z
					p._later_do(0.45, func() -> void:
						W.add_rune(i, Vector2(z0["x"], z0["y"]) + Vector2(0.6, 0.4), float(z0["r"]), float(z0.get("dmg", 1.0)), str(z0["element"]))
						var z2: Dictionary = W.list[W.list.size() - 1]
						z2["m52"] = "cluster"
						_tell({"id": "cluster", "what": "second", "x": z2["x"], "y": z2["y"], "r": z2["r"]}))
		"redoubt":
			for z in laid:
				if str(z["kind"]) == "ward":
					W.add_ward(i, Vector2(z["x"], z["y"]) + Vector2(0.01, 0.0), float(z["r"]) * float(_t("redoubt")["inner"]), float(z["dur"]), minf(0.8, float(z.get("dmg", 0.3)) * float(_t("redoubt")["deeper"])))
					var z2: Dictionary = W.list[W.list.size() - 1]
					z2["m52"] = "redoubt"
					z2["inner"] = true
					_tell({"id": "redoubt", "what": "inner", "x": z["x"], "y": z["y"], "r": z["r"]})
					break
		"reverb":
			if p.time < float(_echo_until[i]):
				for z in laid:
					z["dur"] = float(z["dur"]) * float(_t("reverb")["ground"])
				_tell_wake(laid, "", "reverb", "ring")
		"timebomb":
			for z in laid:
				if str(z["kind"]) == "rune":
					z["dur"] = float(z["dur"]) * float(_t("timebomb")["rune"])
					z["dmg"] = float(z.get("dmg", 1.0)) * float(_t("timebomb")["big"])
			_tell_wake(laid, "rune", "timebomb", "wait")
		"hairtrigger":
			for z in laid:
				if str(z["kind"]) == "rune":
					z["touch"] = true
					z["dur"] = maxf(float(z["dur"]), 6.0)
			_tell_wake(laid, "rune", "hairtrigger", "set")
		"blastwave":
			for z in laid:
				if str(z["kind"]) == "rune":
					z["r"] = float(z["r"]) * float(_t("blastwave")["rune"])
			_tell_wake(laid, "rune", "blastwave", "wide")
		"sanctuary":
			for z in laid:
				if str(z["kind"]) == "ward":
					z["dur"] = float(_t("sanctuary")["ward"])
			_tell_wake(laid, "ward", "sanctuary", "ward")
		"parry":
			for z in laid:
				if str(z["kind"]) == "ward":
					z["dur"] = float(z["dur"]) * float(_t("parry")["wardFade"])
			_tell_wake(laid, "ward", "parry", "ward")
		"aegis":
			for z in laid:
				if str(z["kind"]) == "ward":
					z["r"] = float(z["r"]) * float(_t("aegis")["wide"])
			_tell_wake(laid, "ward", "aegis", "wide")
		"hourglass":
			for z in laid:
				z["dur"] = float(z["dur"]) * float(_t("hourglass")["ground"])
				z["dmg"] = float(z.get("dmg", 0.0)) * float(_t("hourglass")["faster"])
			_tell_wake(laid, "", "hourglass", "sand")
		"carapace", "minefield", "riposte", "shieldwall":
			_tell_wake(laid, "ward", b, "ward")


func _tell_wake(laid: Array, kind: String, id: String, what: String) -> void:
	for z in laid:
		if kind == "" or str(z["kind"]) == kind:
			_tell({"id": id, "what": what, "x": z["x"], "y": z["y"], "r": z["r"]})
			return


## Is `at` in a ward this meld left?
func _in_ward_of(at: Vector2, id: String) -> bool:
	for z in p._wards:
		if str(z.get("m52", "")) == id and str(z["kind"]) == "ward" and Vector2(z["x"], z["y"]).distance_to(at) <= float(z["r"]):
			return true
	return false


## A patch of these, as it goes on (melds52_rules.gd _grounds): each one's own.
func ground(z: Dictionary, id: String, at: Vector2, rad: float, tick: bool, dt: float) -> void:
	match id:
		"mire", "icebreaker", "anvil":
			for o in _mons():
				if _alive(o) and o.world.distance_to(at) <= rad + o.r:
					var key: String = "g_" + str(o.id)
					if id == "anvil":
						if not z.has(key):
							z[key] = true
							o.set_alight(maxf(1.0, h.avg_hit(int(z.get("skill", 0)), 1.0) * float(_t("anvil")["burn"])), 3.0)
							_tell({"id": "anvil", "what": "forge", "x": o.world.x, "y": o.world.y, "m": o})
					elif o.stagger_t > 0.0 and tick:
						if id == "mire":
							o.dose(maxf(1.0, h.avg_hit(int(z.get("skill", 0)), 1.0) * float(_t("mire")["dose"])), 3.0, "poison")
							_tell({"id": "mire", "what": "seep", "x": o.world.x, "y": o.world.y, "m": o})
						else:
							o.chill_by(0.3)
							_tell({"id": "icebreaker", "what": "glaze", "x": o.world.x, "y": o.world.y, "m": o})
		"fulgurite":
			z["f_t"] = float(z.get("f_t", 0.0)) - dt
			if float(z["f_t"]) <= 0.0:
				z["f_t"] = float(_t("fulgurite")["every"])
				for o in _mons():
					if _alive(o) and o.world.distance_to(at) <= rad + o.r:
						h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y, "meld": "fulgurite"})
						o.damage(maxf(1.0, roundf(h.avg_hit(int(z.get("skill", 0)), 1.0) * float(_t("fulgurite")["zap"]))), "lightning", false, false, [], false, false, int(z.get("skill", 0)))
						_tell({"id": "fulgurite", "what": "bolt", "x": at.x, "y": at.y, "x1": o.world.x, "y1": o.world.y})
						break
		"carapace":
			if tick and Vector2(z["x"], z["y"]).distance_to(h.world) <= rad:
				h.heal_flat(h.max_life * float(_t("carapace")["wardHeal"]) * 5.0)
				_tell({"id": "carapace", "what": "motes", "x": h.world.x, "y": h.world.y})
		"hairtrigger":
			if z.get("touch", false) and str(z["kind"]) == "rune" and float(z["t"]) < float(z["dur"]) - 0.05:
				for o in _mons():
					if _alive(o) and o.world.distance_to(at) <= rad + o.r:
						z["t"] = float(z["dur"])
						_tell({"id": "hairtrigger", "what": "touch", "x": at.x, "y": at.y, "r": rad})
						break


# --- what goes on ---

func step(dt: float) -> void:
	var sh: float = h.shield + (h.barrier if Words.DEFENCE_WORDS else 0.0)
	# (a fresh shield: Sanctuary twice as long, Parry a moment and nothing through it, Aegis its allies too, Shieldwall thicker)
	if h.shield_t > _shield_t_was + 0.3 and h.shield > 0.0:
		if p.any_has("sanctuary"):
			h.shield_t *= float(_t("sanctuary")["longer"])
			_tell({"id": "sanctuary", "what": "hold", "x": h.world.x, "y": h.world.y, "secs": h.shield_t})
		if p.any_has("parry"):
			h.shield_t = float(_t("parry")["secs"])
			_parry_t = float(_t("parry")["secs"])
			_tell({"id": "parry", "what": "flash", "x": h.world.x, "y": h.world.y})
		if p.any_has("aegis"):
			if h.has_method("allies_shield"):
				h.allies_shield(h.shield, h.shield_t, float(_t("aegis")["allies"]))
			_tell({"id": "aegis", "what": "dome", "x": h.world.x, "y": h.world.y, "r": float(_t("aegis")["allies"])})
		if _wall_due:
			_wall_due = false
			h.shield *= 1.0 + float(_t("shieldwall")["each"]) * h.frenzy
			_tell({"id": "shieldwall", "what": "band", "n": h.frenzy, "x": h.world.x, "y": h.world.y})
	_shield_t_was = h.shield_t
	_parry_t = maxf(0.0, _parry_t - dt)
	# REDOUBT: the shell gone (broken or faded), a second, smaller one in its place, once
	var sh_was := _sh_was
	_sh_was = sh
	if p.any_has("redoubt") and sh_was > 0.0 and sh <= 0.0 and not _redoubt_done:
		_redoubt_done = true
		h.shield = maxf(1.0, roundf(h.max_life * 0.1 * float(_t("redoubt")["second"]) * 2.0))
		h.shield_t = float(Words.data()["guard"]["shieldTime"]) * 0.6
		_shield_t_was = h.shield_t
		_tell({"id": "redoubt", "what": "second", "x": h.world.x, "y": h.world.y})
	# FURY: the frenzy fading a step at a time
	if p.any_has("fury") and h.frenzy > 1 and h.frenzy_t > 0.0 and h.frenzy_t <= dt * 1.5:
		h.frenzy -= 1
		h.frenzy_t = float(Words.data()["frenzy"]["hold"]) * float(_t("fury")["step"])
		_tell({"id": "fury", "what": "ember", "n": h.frenzy, "x": h.world.x, "y": h.world.y})
	# ONRUSH behind: Power's bonus holding while his burst of speed lasts
	if p.any_has("onrush", false) and h.haste_t > 0.0 and h.might > 0.0:
		h.might_t = maxf(h.might_t, 0.5)
		if p.time - _hold_told > 0.6:
			_hold_told = p.time
			_tell({"id": "onrush", "what": "hold", "x": h.world.x, "y": h.world.y})
	# FIREWALK behind: burning footprints while the burst lasts
	if p.any_has("firewalk", false) and h.haste_t > 0.0 and h.wakes != null:
		_step_t -= dt
		if _step_t <= 0.0:
			var F := _t("firewalk")
			_step_t = float(F["stepEvery"])
			var i := _behind_i("firewalk")
			h.wakes.add_patch(i, "burn", h.world - h.face * 0.3, 0.35, float(F["stepSecs"]), maxf(1.0, h.avg_hit(i, 1.0) * float(F["stepDps"])), "fire", "firewalk")
			_tell({"id": "firewalk", "what": "step", "x": h.world.x - h.face.x * 0.3, "y": h.world.y - h.face.y * 0.3})
	# QUICKSILVER behind: an arc to each enemy he runs past in the burst
	if p.any_has("quicksilver", false) and h.haste_t > 0.0:
		_pass_t -= dt
		if _pass_t <= 0.0:
			var Q := _t("quicksilver")
			_pass_t = float(Q["arcEvery"])
			var i := _behind_i("quicksilver")
			for o in _mons():
				if _alive(o) and o.world.distance_to(h.world) <= float(Q["reach"]):
					h._tell({"t": "arc", "x0": h.world.x, "y0": h.world.y, "x1": o.world.x, "y1": o.world.y, "meld": "quicksilver"})
					o.damage(maxf(1.0, roundf(h.avg_hit(i, 1.0) * float(Q["arc"]))), "lightning", false, false, [], false, false, i)
					_tell({"id": "quicksilver", "what": "pass", "x": h.world.x, "y": h.world.y, "x1": o.world.x, "y1": o.world.y})
					break
	# CHARGE behind: running into them in the burst staggers them
	if p.any_has("charge", false) and h.haste_t > 0.0:
		for o in _mons():
			if _alive(o) and o.world.distance_to(h.world) <= float(_t("charge")["bump"]) + o.r:
				var key: int = o.get_instance_id()
				if p.time - float(_bumped.get(key, -99.0)) > 1.0:
					_bumped[key] = p.time
					o.stagger_cd = 0.0
					o.stagger_from(h.world)
					_tell({"id": "charge", "what": "bump", "x": o.world.x, "y": o.world.y, "m": o})
	# GLIDE behind: on its ice, he skates (pace)
	# LIFELINE behind: its orbs fly straight to him
	if p.any_has("lifeline", false) and h.monsters != null and h.monsters.loot != null and h.monsters.loot.has_method("pull_orbs"):
		if h.monsters.loot.pull_orbs(dt, float(_t("lifeline")["pull"])) and _once("lifeline_pull", 0.4):
			_tell({"id": "lifeline", "what": "pull", "x": h.world.x, "y": h.world.y})
	# HOURGLASS: what is on him wears off a third sooner
	if p.any_has("hourglass"):
		var k: float = float(_t("hourglass")["faster"]) - 1.0
		for key in ["poison_t", "burn_t", "chill_t"]:
			var v: float = float(h.get(key))
			if v > 0.0:
				h.set(key, maxf(0.0, v - dt * k))
	# TRANSFUSION: the drips coming in
	for d in _drips:
		d["t"] = float(d["t"]) - dt
		if float(d["t"]) <= 0.0:
			d["t"] = float(d["every"])
			d["left"] = int(d["left"]) - 1
			h.heal_flat(float(d["each"]))
	_drips = _drips.filter(func(d): return int(d["left"]) > 0)
	# AFTERMATH: where it struck keeps hurting what walks in
	for a in _after:
		a["t"] = float(a["t"]) - dt
		var hit: Dictionary = a["hit"]
		for o in _mons():
			if _alive(o) and not hit.has(o.get_instance_id()) and o.world.distance_to(a["at"]) <= float(a["r"]):
				hit[o.get_instance_id()] = true
				o.damage(maxf(1.0, roundf(float(a["dmg"]))), "phys", false, false, [], false, false, int(a["i"]))
				_tell({"id": "aftermath", "what": "bite", "x": o.world.x, "y": o.world.y, "m": o})
	_after = _after.filter(func(a): return float(a["t"]) > 0.0)


func _behind_i(id: String) -> int:
	for i in 3:
		if p.bid(i) == id:
			return i
	return 0


# --- on him ---

## A blow on him while his shield holds: RIPOSTE marks its maker for a certain critical.
func struck_him(src) -> void:
	if src == null or not is_instance_valid(src) or src.dead or not p._shielded():
		return
	if p.any_has("riposte"):
		src.mark_t = maxf(src.mark_t, float(Words.data()["precise"]["markTime"]))
		h._tell({"t": "markOn", "id": src.id, "x": src.world.x, "y": src.world.y, "secs": src.mark_t})
		_tell({"id": "riposte", "what": "riposte", "x": src.world.x, "y": src.world.y, "m": src, "x1": h.world.x, "y1": h.world.y})


## PARRY: his brief shell, or its ward, and nothing gets through.
func parried(at: Vector2) -> bool:
	var yes: bool = (_parry_t > 0.0 and p._shielded() and p.any_has("parry")) or p._in_ward("parry")
	if yes:
		_tell({"id": "parry", "what": "glance", "x": h.world.x, "y": h.world.y, "x1": at.x, "y1": at.y})
	return yes


## How much faster he moves: GLIDE on its ice.
func pace() -> float:
	if p.any_has("glide", false) and h.wakes != null:
		for z in p._wards:
			if str(z.get("m52", "")) == "glide" and str(z["kind"]) == "ice" and Vector2(z["x"], z["y"]).distance_to(h.world) <= float(z["r"]):
				if _once("glide_skate", 0.5):
					_tell({"id": "glide", "what": "ice", "x": h.world.x, "y": h.world.y})
				return 1.0 + float(_t("glide")["iceMove"])
	return 1.0


## A life orb taken: TRANSFUSION behind, it heals on over a few seconds.
func orb_taken() -> void:
	for i in 3:
		if p.bid(i) == "transfusion":
			var T := _t("transfusion")
			var n: int = int(T["ticks"])
			_drips.append({"left": n, "each": h.max_life * float(T["orbHeal"]) / n, "t": float(T["secs"]) / n, "every": float(T["secs"]) / n})
			_tell({"id": "transfusion", "what": "orb", "x": h.world.x, "y": h.world.y})
			return


## CHARGE: Heavy no slower (the Strike's own pace).
func rate_k() -> float:
	if p.fid(0) == "charge":
		return float(Words.data()["heavy"]["slower"])
	return 1.0


## WHIPCRACK: no wind-up.
func windup_k(i: int) -> float:
	return float(_t("whipcrack")["windup"]) if p.fid(i) == "whipcrack" else 1.0


## STACCATO behind: its repeat almost at once.
func echo_k(i: int) -> float:
	return float(_t("staccato")["echo"]) if p.bid(i) == "staccato" else 1.0


## STACCATO in front: Twin's two blows with no pause between.
func gap_k(i: int) -> float:
	return float(_t("staccato")["gap"]) if p.fid(i) == "staccato" else 1.0


func forget() -> void:
	hornet_n = 0
	_drips.clear()
	_after.clear()
	_bumped.clear()
	_redoubt_done = false
	_sh_was = 0.0
	_parry_t = 0.0
	_wall_due = false
	_echo_until = [-99.0, -99.0, -99.0]
