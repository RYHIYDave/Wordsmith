## THE 52 DESIGNED MELDS AT WORK ON HIS MOVES (melds52.gd: what they are; his two docs of what each does, approved 23 Nov 2026).
## A melded word does the work of both its words already (words.gd resolve: it is both of them for every rule); what is here is
## each one's TWIST, in front (on what the move hits) and behind (what the move leaves and gives), its numbers melds52.json `tune`.
## The hero keeps one of these (hero.gd `m52`), and calls it from the few places a twist reaches into:
##   blow(i, k)           which of a use's blows is landing (Twin's two, Flurry's up to four): `blow_k`, how hard that one lands
##   crit(m, i, c)        whether a hit is critical: Duelist (one alone), Quickdraw (the first after a rest), Pressure Point (stunned)
##   more(m, i)           how much harder a hit lands: Bloodlust (full life), Cold Snap (a chilled one snapped), Berserk (the
##                        frenzy), Bulwark (behind his shield), Momentum (its build-up), Daze (stunned), Cataclysm (the crowd it
##                        catches), Duelist behind (its mark)
##   struck(m, i, ...)    after a hit lands: Onslaught's shove, Flash Freeze, Rekindle, Aftershock, Needle, Brand, Fever,
##                        Whiteout, Permafrost, Smoulder, Tempest, Bloat, Cold Snap, Flashfire, Jolt, Glacier, Inferno, Stormfront,
##                        Gale, Earthquake, Miasma
##   heal_k(m, i)         how much a Leech heal is worth: Coldblood (chilled), Marrow (stunned), Second Wind (its wait shortened)
##   used(i, echo)        a use of the move: Flurry's blows, Quickdraw's rest, Overcharge's arcs, Tailwind, Blink, Flurry behind
##   killed(m, i)         Quickfuse, Concussion, Smoulder; behind, Berserk, Fever, Whiteout, Overcharge, Blur, Coldblood
##   marked(m, i)         Precise behind's mark, the meld's own: Duelist, Needle, Brand, Seeker, Quickdraw
##   mark_spent(m)        Needle's poison doubled, Quickdraw's speed
##   wake(i, at, rad)     what the move leaves, the meld's own: Viper's second cloud, Flash Freeze's second ice, Aftershock's
##                        second quake, the Lasting, Fleeting and Vast melds' ground, the Guarding melds' wards
##   step(dt)             what goes on: aftershocks and waves to come, the wards, Tempest's web, Stormfront's links, Inferno's
##                        trail, the ground's ends (Rekindle, Cold Snap, Bloat), Cinderward's shield bursting
##   struck_him(src)      a blow on him while his shield holds: Hemlock, Static
##   planted()            Fortress: nothing knocks him back while his shield holds
##   pace(), dodge()      Blur, Windward, Tailwind, Blink
##   orb_taken()          Bloodlust and Second Wind behind
##   rate_k()             Juggernaut: no slower at a full frenzy
##   windup_k(i)          Haymaker: less wind-up
## THE LOOKS read the tellings sent here, `m52` {id, what, ...} (fx_melds52.gd).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const Words := preload("res://scripts/words.gd")

var h
var time := 0.0
## (the blow of a use landing now: 0 the first, 1 Twin's second, and on)
var blow_n := 0
## (things to come: {t, fn})
var _later: Array = []
## Flurry: blows on its next use, and when it was last used
var flurry_n := 2
var flurry_at := -99.0
## Quickdraw: when each move was last used
var last_use: Array = [-99.0, -99.0, -99.0]
var qd_ready: Array = [false, false, false]
## Momentum: the build-up, and when it last landed
var momentum := 0
var momentum_at := -99.0
## Blink, Tailwind: their own bursts of speed
var blink_t := 0.0
var blink_k := 0.0
var tail_t := 0.0
var tail_k := 0.0
## Tempest's web: {t}; Stormfront's links: {ids: Array, t, tick, dmg, i}
var webs: Array = []
var links: Array = []
## the Guarding melds: his shield as it was a frame ago (Cinderward bursts as it goes)
var _shield_was := 0.0
## the patches this follows: {z, id, ...}
var _wards: Array = []
var _web_tick := 0.0
## the monsters these have written on (monster.gd m52): only these are looked at each frame
var _tagged: Array = []
## (a monster's melds' marks on him: Rekindle's burn to light again, Bloat's burst, Flashfire's flare: foe_melds52.gd)
var on_him := {}
## (moments told no oftener than this: the last time each was told)
var _throttle := {}
var _him_burn := 0.0
var _him_poison := 0.0


func _init(hero) -> void:
	h = hero


static func on() -> bool:
	return true


# --- who has what ---

## The new meld in front of move `i`, or "".
func fid(i: int) -> String:
	if i < 0 or i > 2 or h.loadout == null:
		return ""
	var m = h.loadout.r(i)["meld"]
	return m if m != null and M52.is_new(m) else ""


## The new meld behind move `i`, or "".
func bid(i: int) -> String:
	if i < 0 or i > 2 or h.loadout == null:
		return ""
	var m = h.loadout.r(i)["meld_behind"]
	return m if m != null and M52.is_new(m) else ""


## Whether any of his moves has meld `id` in front (`front`) or behind.
func any_has(id: String, front := true) -> bool:
	for i in 3:
		if (fid(i) if front else bid(i)) == id:
			return true
	return false


func _tune(id: String) -> Dictionary:
	return M52.tune(id)


## (what each has been seen to do, "id:what", for its check: check_melds52.gd)
var told := {}


func _tell(e: Dictionary) -> void:
	e["t"] = "m52"
	var k := "%s:%s" % [e.get("id", ""), e.get("what", "")]
	told[k] = int(told.get(k, 0)) + 1
	h._tell(e)


func _mons() -> Array:
	return h.monsters.list if h.monsters != null and is_instance_valid(h.monsters) else []


func _alive(o) -> bool:
	return is_instance_valid(o) and not o.dead and o.state != "rise" and not h.monsters.shut_in(o)


func _tag(m) -> void:
	if not _tagged.has(m):
		_tagged.append(m)


func _later_do(t: float, fn: Callable) -> void:
	_later.append({"t": t, "fn": fn})


func _frenzy_most() -> int:
	return int(Words.data()["frenzy"]["max"])


func _shielded() -> bool:
	return h.shield > 0.0 or (Words.DEFENCE_WORDS and h.barrier > 0.0)


# --- the blows of a use ---

## Blow `k` of a use of move `i` is landing: how hard it lands, as a share of the use's `count_dmg` (Onslaught's second, full;
## Flurry's, each a little weaker).
func blow(i: int, k: int) -> float:
	blow_n = k
	var f := fid(i)
	var r: Dictionary = h.loadout.r(i)
	var each: float = maxf(0.01, float(r["count_dmg"]))
	if f == "onslaught" and k >= 1:
		return float(_tune("onslaught")["second"]) / each
	if f == "flurry" and k >= 2:
		return pow(float(_tune("flurry")["each"]), k - 1)
	if f == "twin2" or bid(i) == "twin2":
		return pow(float(_tune("twin2")["each"]), k)
	return 1.0


# --- a use ---

func used(i: int, echo: bool, at := Vector2.INF) -> void:
	var f := fid(i)
	var b := bid(i)
	var r: Dictionary = h.loadout.r(i)
	if not echo:
		# FLURRY: each use within a second of the last, one more blow, up to four
		if f == "flurry":
			var F := _tune("flurry")
			flurry_n = mini(int(F["most"]), flurry_n + 1) if time - flurry_at <= float(F["window"]) else 2
			flurry_at = time
			r["count"] = flurry_n
			_tell({"id": "flurry", "what": "stack", "n": flurry_n, "x": h.world.x, "y": h.world.y, "dx": h.face.x, "dy": h.face.y})
		# QUICKDRAW: the first use after two seconds without, a certain critical
		qd_ready[i] = f == "quickdraw" and time - float(last_use[i]) >= float(_tune("quickdraw")["rest"])
		if qd_ready[i]:
			_tell({"id": "quickdraw", "what": "draw", "x": h.world.x, "y": h.world.y})
		last_use[i] = time
		# BERSERK: each use another mark of the five lit in red
		if f == "berserk" and h.frenzy > 0:
			_tell({"id": "berserk", "what": "stack", "n": h.frenzy, "x": h.world.x, "y": h.world.y})
		# OVERCHARGE: each use one more arc, as the frenzy grows, up to five
		if f == "overcharge":
			_tell({"id": "overcharge", "what": "charge", "n": mini(int(_tune("overcharge")["most"]), h.frenzy + 1), "x": h.world.x, "y": h.world.y})
			if not r.has("arcs52"):
				r["arcs52"] = int(r["arcs"])
			r["arcs"] = int(r["arcs52"]) + mini(int(_tune("overcharge")["most"]), h.frenzy)
		# TAILWIND: each use a burst of speed that holds while he keeps using it
		if f == "tailwind":
			var T := _tune("tailwind")
			tail_k = float(T["haste"])
			tail_t = float(T["hold"]) * float(r["last"])
			_tell({"id": "tailwind", "what": "gust", "x": h.world.x, "y": h.world.y})
		# BLINK: a moment of great speed after each use
		if f == "blink":
			var B := _tune("blink")
			blink_k = float(B["haste"])
			blink_t = float(B["secs"])
			_tell({"id": "blink", "what": "blink", "x": h.world.x, "y": h.world.y})
		# (Twin II in front: three of each)
		if f == "twin2":
			r["count"] = int(_tune("twin2")["count"])
	else:
		# ONSLAUGHT behind: the ring closing on the phantom left where he stood, as it strikes again
		if b == "onslaught" and at != Vector2.INF:
			_tell({"id": "onslaught", "what": "echo", "x": at.x, "y": at.y})
		# FLURRY behind: each repeat a burst of speed
		if b == "flurry":
			var F := _tune("flurry")
			h.haste = maxf(h.haste, float(F["haste"]))
			h.haste_t = maxf(h.haste_t, float(F["hasteSecs"]))
			_tell({"id": "flurry", "what": "gust", "x": h.world.x, "y": h.world.y})


# --- a hit ---

func crit(m, i: int, c: bool, quiet: bool) -> bool:
	var f := fid(i)
	match f:
		"duelist":
			var alone := true
			for o in _mons():
				if o != m and _alive(o) and o.world.distance_to(m.world) <= float(_tune("duelist")["alone"]):
					alone = false
					break
			if alone:
				if not c:
					_tell({"id": "duelist", "what": "alone", "x": m.world.x, "y": m.world.y, "m": m})
				return true
		"quickdraw":
			if qd_ready[i]:
				return true
		"pressurepoint":
			if m.stun_t > 0.0:
				if not quiet:
					_tell({"id": "pressurepoint", "what": "point", "x": m.world.x, "y": m.world.y, "m": m})
				return true
	return c


func more(m, i: int, quiet: bool) -> float:
	var f := fid(i)
	var k := 1.0
	match f:
		"bloodlust":
			if h.life >= h.max_life - 0.5:
				k *= 1.0 + float(_tune("bloodlust")["over"])
				if not quiet and time - float(_throttle.get("bloodlust", -9.0)) > 0.15:
					_throttle["bloodlust"] = time
					_tell({"id": "bloodlust", "what": "fury", "x": m.world.x, "y": m.world.y, "m": m})
		"coldsnap":
			if m.chill_t > 0.0 and m.frozen_t <= 0.0:
				k *= 1.0 + float(_tune("coldsnap")["snap"])
				m.chill_t = 0.0
				m.chill = 0.0
				_tell({"id": "coldsnap", "what": "snap", "x": m.world.x, "y": m.world.y, "m": m})
		"berserk":
			k *= 1.0 + float(_tune("berserk")["each"]) * h.frenzy
		"bulwark":
			if _shielded():
				k *= 1.0 + float(_tune("bulwark")["more"])
				if not quiet:
					_tell({"id": "bulwark", "what": "hot", "x": m.world.x, "y": m.world.y, "m": m})
		"momentum":
			if time - momentum_at > float(_tune("momentum")["hold"]):
				momentum = 0
			k *= 1.0 + float(_tune("momentum")["each"]) * momentum
		"daze":
			if m.stun_t > 0.0:
				k *= 1.0 + float(_tune("daze")["more"])
				if not quiet:
					_tell({"id": "daze", "what": "thud", "x": m.world.x, "y": m.world.y, "m": m})
		"cataclysm":
			var C := _tune("cataclysm")
			var n := 0
			var reach: float = 1.2 * float(h.loadout.r(i)["size"]) + 1.0
			for o in _mons():
				if _alive(o) and o.world.distance_to(m.world) <= reach:
					n += 1
			k *= 1.0 + minf(float(C["most"]), float(C["each"]) * maxi(0, n - 1))
			if n >= 3 and time - float(_throttle.get("cataclysm", -9.0)) > 0.3:
				_throttle["cataclysm"] = time
				_tell({"id": "cataclysm", "what": "star", "x": m.world.x, "y": m.world.y, "n": n})
	# DUELIST behind: the one it marked takes more from everything until the mark is spent
	if m.mark_t > 0.0 and str(m.m52.get("mark", "")) == "duelist":
		k *= 1.0 + float(_tune("duelist")["more"])
	return k


func heal_k(m, i: int) -> float:
	var f := fid(i)
	var k := 1.0
	match f:
		"coldblood":
			if m.chill_t > 0.0 or m.frozen_t > 0.0:
				k *= float(_tune("coldblood")["heal"])
				_tell({"id": "coldblood", "what": "drink", "x": m.world.x, "y": m.world.y, "m": m})
		"marrow":
			if m.stun_t > 0.0:
				k *= float(_tune("marrow")["heal"])
				_tell({"id": "marrow", "what": "drink", "x": m.world.x, "y": m.world.y, "m": m})
		"secondwind":
			var r: Dictionary = h.loadout.r(i)
			h.cool_by(float(r["cooldown"]) * float(_tune("secondwind")["cut"]))
			_tell({"id": "secondwind", "what": "wind", "x": h.world.x, "y": h.world.y, "i": i})
		"leech2":
			k *= float(_tune("leech2")["k"])
	return k


## After hit `dmg` of move `i` has landed on `m` (`was_*`: what it was before this hit).
func struck(m, i: int, dmg: float, c: bool, at: Vector2, quiet: bool, was_burning: bool, was_chilled: bool, was_frozen: bool, was_shocked: bool) -> void:
	var f := fid(i)
	var r: Dictionary = h.loadout.r(i)
	if f == "":
		return
	if f == "haymaker" and not quiet and time - float(_throttle.get("haymaker", -9.0)) > 0.2:
		_throttle["haymaker"] = time
		_tell({"id": "haymaker", "what": "snap", "x": at.x, "y": at.y, "m": m})
	if f == "miasma" and not quiet and time - float(_throttle.get("miasma", -9.0)) > 0.3:
		_throttle["miasma"] = time
		_tell({"id": "miasma", "what": "haze", "x": at.x, "y": at.y, "r": 1.2 * float(r["size"]) + 1.0})
	if f == "momentum":
		momentum = mini(int(_tune("momentum")["most"]), (momentum if time - momentum_at <= float(_tune("momentum")["hold"]) else 0) + 1)
		momentum_at = time
		_tell({"id": "momentum", "what": "build", "n": momentum, "x": h.world.x, "y": h.world.y})
	if m.dead:
		# (what it does as it falls is killed's)
		return
	match f:
		"onslaught":
			if blow_n >= 1:
				m.throw_from(h.world, float(_tune("onslaught")["shove"]), 0.15)
				_tell({"id": "onslaught", "what": "second", "x": at.x, "y": at.y, "m": m})
		"viper":
			_tell({"id": "viper", "what": "bite", "x": at.x, "y": at.y, "m": m})
		"flashfreeze":
			if m.frozen_t > 0.0 and not was_frozen:
				m.frozen_t = maxf(m.frozen_t, float(_tune("flashfreeze")["freeze"]) * (0.5 if m.elite else 1.0))
				_tell({"id": "flashfreeze", "what": "freeze", "x": at.x, "y": at.y, "m": m})
			elif m.chill_t > 0.0 and not was_chilled:
				_tell({"id": "flashfreeze", "what": "frost", "x": at.x, "y": at.y, "m": m})
		"rekindle":
			if m.burn_t > 0.0:
				_tag(m)
				m.m52["rekindle"] = int(_tune("rekindle")["again"])
		"aftershock":
			var A := _tune("aftershock")
			var hit := dmg
			_later_do(float(A["delay"]), func() -> void: _aftershock(at, float(A["r"]), hit * float(A["share"]), i))
		"needle":
			if c and float(r["poison"]) > 0.0:
				var dose: float = dmg * float(r["poison"]) * float(r["pace"]) * float(r.get("poison_k", 1.0))
				for n in int(_tune("needle")["doses"]) - 1:
					m.dose(dose, float(Words.data()["poison"]["time"]) * float(r["last"]) * float(r.get("poison_t", 1.0)), r["element"])
				_tell({"id": "needle", "what": "three", "x": at.x, "y": at.y, "m": m})
		"brand":
			if c:
				_tag(m)
				m.m52["brand"] = float(_tune("brand")["secs"])
				if m.burn_t > 0.0:
					m.burn_dps *= float(_tune("brand")["hot"])
				_tell({"id": "brand", "what": "brand", "x": at.x, "y": at.y, "m": m})
		"fever":
			if h.frenzy > 0 and float(r["poison"]) > 0.0:
				var dose: float = dmg * float(r["poison"]) * float(r["pace"])
				for n in mini(int(_tune("fever")["most"]), h.frenzy) - 1:
					m.dose(dose, float(Words.data()["poison"]["time"]) * float(r["last"]), r["element"])
				_tell({"id": "fever", "what": "dose", "n": h.frenzy, "x": at.x, "y": at.y, "m": m})
		"whiteout":
			if m.chill_t > 0.0:
				m.chill = minf(0.9, m.chill + float(_tune("whiteout")["slowEach"]) * h.frenzy)
			if not quiet:
				_tell({"id": "whiteout", "what": "snow", "n": h.frenzy, "x": at.x, "y": at.y, "m": m})
		"permafrost":
			_tag(m)
			m.m52["permafrost"] = time
			var P := _tune("permafrost")
			if m.chill_t > 0.0:
				m.chill_t = maxf(m.chill_t, 2.5 * float(P["chill"]))
			if m.frozen_t > 0.0 and not was_frozen:
				m.frozen_t *= float(P["freeze"])
		"smoulder":
			if m.burn_t > 0.0:
				_tag(m)
				m.m52["smoulder"] = true
		"canker", "bedrock":
			_tag(m)
			m.m52[f] = time
		"tempest":
			_tag(m)
			m.m52["tempest"] = time
			m.shock_t = maxf(m.shock_t, float(preload("res://scripts/talents.gd").D["tune"]["shockSecs"]) * float(_tune("tempest")["shock"]))
			if not quiet:
				webs.append({"t": float(_tune("tempest")["web"]), "i": i, "dmg": dmg * float(_tune("tempest")["zap"])})
		"bloat":
			if m.poison_t > 0.0:
				_tag(m)
				m.m52["bloat"] = {"dmg": dmg * float(_tune("bloat")["burst"]), "i": i}
		"coldsnap":
			if m.chill_t > 0.0 and not was_chilled:
				var C := _tune("coldsnap")
				m.chill_t = 2.5 * float(C["chill"])
				m.chill = minf(0.85, m.chill * float(C["deeper"]))
		"flashfire":
			if m.burn_t > 0.0:
				_tag(m)
				m.m52["flare"] = {"dmg": dmg * float(_tune("flashfire")["flare"]), "i": i}
		"jolt":
			if was_shocked:
				var j: float = maxf(1.0, roundf(dmg * float(_tune("jolt")["jolt"])))
				m.shock_t = 0.0
				m.damage(j, "lightning", false, false, [], false, false, i)
				_tell({"id": "jolt", "what": "jolt", "x": at.x, "y": at.y, "m": m})
		"glacier":
			if m.frozen_t > 0.0 and not was_frozen:
				var G := _tune("glacier")
				var spread: Array = []
				for o in _mons():
					if o != m and _alive(o) and o.world.distance_to(m.world) <= o.r + m.r + float(G["touch"]):
						o.chill_by(0.3)
						spread.append(o.world)
				_tell({"id": "glacier", "what": "spread", "x": at.x, "y": at.y, "to": spread})
		"inferno":
			if m.burn_t > 0.0:
				_tag(m)
				m.m52["inferno"] = {"i": i, "dps": m.burn_dps * float(_tune("inferno")["trail"]), "tick": 0.0}
		"stormfront":
			# (“One hit links the whole crowd”: the one struck and every enemy within the blow's reach of it, and any other the use
			# struck, linked by it)
			var S := _tune("stormfront")
			var L: Dictionary = {}
			for l in links:
				if int(l["use"]) == int(h.uses[i]) and int(l["i"]) == i:
					L = l
			if L.is_empty():
				L = {"ids": [], "t": float(S["link"]), "tick": 0.0, "dmg": dmg * float(S["zap"]), "i": i, "use": h.uses[i]}
				links.append(L)
			var ids: Array = L["ids"]
			if not ids.has(m):
				ids.append(m)
			if not quiet:
				var reach: float = 1.2 * float(r["size"]) + 1.0
				for o in _mons():
					if _alive(o) and not ids.has(o) and o.world.distance_to(m.world) <= reach:
						ids.append(o)
		"gale":
			var edge: float = 1.2 * float(r["size"]) + 1.0
			var far: float = maxf(0.4, edge - m.world.distance_to(h.world))
			m.throw_from(h.world, far, 0.25)
			_tell({"id": "gale", "what": "blow", "x": at.x, "y": at.y, "m": m})
		"earthquake":
			if not quiet:
				_quake(at, i)
		"miasma":
			if float(r["poison"]) > 0.0:
				var M := _tune("miasma")
				var n := 0
				for o in _mons():
					if _alive(o) and o.poison_t > 0.0 and o.world.distance_to(at) <= 4.0:
						n += 1
				var extra := minf(float(M["most"]), float(M["each"]) * maxi(0, n - 1))
				if extra > 0.0:
					m.poison_dps *= 1.0 + extra / maxf(1.0, float(m.poison_n))
	# QUICKDRAW: the drawn shot spent once it lands
	if f == "quickdraw" and qd_ready[i] and c:
		qd_ready[i] = false
		_tell({"id": "quickdraw", "what": "crack", "x": at.x, "y": at.y, "m": m})


func _aftershock(at: Vector2, rad: float, dmg: float, i: int) -> void:
	_tell({"id": "aftershock", "what": "burst", "x": at.x, "y": at.y, "r": rad})
	for o in _mons():
		if _alive(o) and o.world.distance_to(at) <= rad + o.r:
			o.damage(maxf(1.0, roundf(dmg)), "phys", false, false, [], false, false, i)
			if not o.dead:
				o.stagger_from(at)


## EARTHQUAKE in front: its stun rolls out in a wave from where it landed, each it reaches stunned as it comes.
func _quake(at: Vector2, i: int) -> void:
	var E := _tune("earthquake")
	var reach: float = float(E["wave"]) * float(h.loadout.r(i)["wide"])
	var stun: float = float(h.loadout.r(i)["stun"])
	_tell({"id": "earthquake", "what": "wave", "x": at.x, "y": at.y, "r": reach, "speed": float(E["speed"])})
	for o in _mons():
		if not _alive(o):
			continue
		var d: float = o.world.distance_to(at)
		if d <= reach and d > 0.3:
			var who = o
			_later_do(d / float(E["speed"]), func() -> void:
				if is_instance_valid(who) and not who.dead:
					who.stun_for(stun))


# --- a kill ---

func killed(m, i: int) -> void:
	if i < 0 or i > 2:
		return
	var f := fid(i)
	var b := bid(i)
	var r: Dictionary = h.loadout.r(i)
	match f:
		"quickfuse":
			h.cool_by(float(r["cooldown"]) * float(_tune("quickfuse")["cut"]))
			_tell({"id": "quickfuse", "what": "pop", "x": m.world.x, "y": m.world.y, "i": i})
		"concussion":
			var rad := 2.0
			for o in _mons():
				if _alive(o) and o.world.distance_to(m.world) <= rad + o.r:
					o.stun_for(float(_tune("concussion")["stun"]))
			_tell({"id": "concussion", "what": "boom", "x": m.world.x, "y": m.world.y, "r": rad})
	if (bool(m.m52.get("smoulder", false)) or (f == "smoulder" and m.burn_t > 0.0)) and h.wakes != null:
		var S := _tune("smoulder")
		h.wakes.add_patch(i, "burn", m.world, 1.0, float(S["ground"]), maxf(1.0, h.avg_hit(i, 1.0) * float(S["groundDps"])), "fire", "smoulder")
		_tell({"id": "smoulder", "what": "coals", "x": m.world.x, "y": m.world.y})
	match b:
		"berserk":
			_tell({"id": "berserk", "what": "kill", "x": m.world.x, "y": m.world.y, "x1": h.world.x, "y1": h.world.y})
			var more: float = float(r["might"])
			if more > 0.0:
				h.might = minf(more * 5.0, h.might + more * float(_tune("berserk")["mightKill"]))
				h.might_t = maxf(h.might_t, 5.0 * float(r["last"]))
		"fever":
			if m.poison_t > 0.0:
				_tell({"id": "fever", "what": "kill", "x": m.world.x, "y": m.world.y, "x1": h.world.x, "y1": h.world.y})
				var F: Dictionary = Words.data()["frenzy"]
				h.frenzy_t = minf(float(F["hold"]) * 3.0 * float(r["last"]) * float(_tune("fever")["hold"]), h.frenzy_t + float(F["hold"]) * float(r["last"]))
		"whiteout":
			var W := _tune("whiteout")
			for o in _mons():
				if _alive(o) and o.world.distance_to(m.world) <= float(W["r"]):
					o.freeze_now()
			_tell({"id": "whiteout", "what": "burst", "x": m.world.x, "y": m.world.y, "r": float(W["r"])})
		"overcharge":
			var best = null
			for o in _mons():
				if _alive(o) and o != m and o.world.distance_to(m.world) <= float(_tune("overcharge")["reach"]) and (best == null or o.world.distance_to(m.world) < best.world.distance_to(m.world)):
					best = o
			if best != null:
				_tell({"id": "overcharge", "what": "bolt", "x": m.world.x, "y": m.world.y, "x1": best.world.x, "y1": best.world.y})
				best.damage(maxf(1.0, roundf(h.avg_hit(i, 1.0) * float(_tune("overcharge")["bolt"]))), "lightning", false, false, [], false, false, i)
		"blur":
			var B := _tune("blur")
			h.haste = maxf(h.haste, float(B["haste"]))
			h.haste_t = maxf(h.haste_t, float(B["hasteSecs"]))
			_tell({"id": "blur", "what": "gust", "x": h.world.x, "y": h.world.y})
		"coldblood":
			var on_ice := false
			if h.wakes != null:
				for z in h.wakes.list:
					if str(z["kind"]) == "ice" and Vector2(z["x"], z["y"]).distance_to(m.world) <= float(z["r"]):
						on_ice = true
			if on_ice and randf() < float(_tune("coldblood")["orbMore"]) and h.monsters.loot != null:
				h.monsters.loot.orb_at(m.world)
				_tell({"id": "coldblood", "what": "orb", "x": m.world.x, "y": m.world.y})
				h._tell({"t": "orb", "x": m.world.x, "y": m.world.y})


# --- Precise behind's marks ---

func marked(m, i: int) -> void:
	var b := bid(i)
	if b in ["duelist", "needle", "brand", "seeker", "quickdraw"]:
		_tag(m)
		m.m52["mark"] = b
		_tell({"id": b, "what": "mark", "x": m.world.x, "y": m.world.y, "m": m})
	if b == "precise2":
		_tag(m)
		m.m52["mark2"] = 1


func mark_spent(m) -> void:
	var b: String = str(m.m52.get("mark", ""))
	if b == "needle" and m.poison_t > 0.0:
		m.poison_dps *= float(_tune("needle")["double"])
		_tell({"id": "needle", "what": "double", "x": m.world.x, "y": m.world.y, "m": m})
	elif b == "quickdraw":
		var Q := _tune("quickdraw")
		h.haste = maxf(h.haste, float(Q["haste"]))
		h.haste_t = maxf(h.haste_t, float(Q["hasteSecs"]))
		for i in 3:
			if bid(i) == "quickdraw":
				h.cool_by(float(h.loadout.r(i)["cooldown"]) * float(Q["cut"]))
		_tell({"id": "quickdraw", "what": "crack", "x": m.world.x, "y": m.world.y, "m": m})
	m.m52.erase("mark")
	# (Precise II behind: two certain criticals)
	if int(m.m52.get("mark2", 0)) > 0:
		_tag(m)
		m.m52["mark2"] = 0
		m.mark_t = float(Words.data()["precise"]["markTime"])


## Seeker behind: the marked one, if any near, first among lightning's targets.
func seek_first(near: Array) -> Array:
	if not any_has("seeker", false):
		return near
	var out: Array = near.duplicate()
	for o in near:
		if is_instance_valid(o) and o.mark_t > 0.0 and str(o.m52.get("mark", "")) == "seeker":
			out.erase(o)
			out.push_front(o)
	return out


## SEEKER in front: lightning's targets the weakest; CONDUIT in front, each one an arc strikes heals him.
func arc_pick(near: Array, i: int) -> Array:
	if fid(i) == "seeker":
		near.sort_custom(func(a, b) -> bool: return a.life < b.life)
	return seek_first(near)


func arc_struck(o, i: int) -> void:
	if fid(i) == "seeker":
		_tell({"id": "seeker", "what": "seek", "x": o.world.x, "y": o.world.y, "m": o})
	if fid(i) == "conduit":
		var r: Dictionary = h.loadout.r(i)
		h.heal_flat(float(r["leech"]) * float(_tune("conduit")["share"]))
		_tell({"id": "conduit", "what": "bead", "x": o.world.x, "y": o.world.y, "x1": h.world.x, "y1": h.world.y})


# --- what a move leaves ---

## What move `i` left at `at` (hero.gd _wake), the patches it laid being wakes.list from `from` on: each the meld's own.
func wake(i: int, at: Vector2, rad: float, from: int) -> void:
	var b := bid(i)
	if b == "" or h.wakes == null:
		return
	var W = h.wakes
	var laid: Array = W.list.slice(from)
	for z in laid:
		z["m52"] = b
	var r: Dictionary = h.loadout.r(i)
	match b:
		"viper":
			# (a second cloud, a moment on, that creeps toward the nearest enemy)
			for z in laid:
				if str(z["kind"]) == "venom":
					var z0: Dictionary = z
					_later_do(float(_tune("viper")["second"]), func() -> void:
						W.add_cloud(i, Vector2(z0["x"], z0["y"]), float(z0["r"]), float(z0.get("dmg", 0.0)), float(z0["dur"]), r["meld_behind"])
						var z2: Dictionary = W.list[W.list.size() - 1]
						z2["m52"] = "viper"
						z2["creep"] = true)
		"flashfreeze":
			for z in laid:
				if str(z["kind"]) == "ice":
					var z0: Dictionary = z
					_later_do(float(_tune("flashfreeze")["second"]), func() -> void:
						_tell({"id": "flashfreeze", "what": "sheet", "x": z0["x"], "y": z0["y"], "r": z0["r"]})
						for o in _mons():
							if _alive(o) and o.world.distance_to(Vector2(z0["x"], z0["y"])) <= float(z0["r"]) + o.r:
								o.freeze_now())
		"aftershock":
			for z in laid:
				if str(z["kind"]) == "cracks":
					var z0: Dictionary = z
					_later_do(float(_tune("aftershock")["again"]), func() -> void:
						_tell({"id": "aftershock", "what": "quake", "x": z0["x"], "y": z0["y"], "r": z0["r"]})
						for o in _mons():
							if _alive(o) and o.world.distance_to(Vector2(z0["x"], z0["y"])) <= float(z0["r"]) + o.r:
								o.stagger_cd = 0.0
								o.stagger_from(Vector2(z0["x"], z0["y"])))
		"quickfuse":
			for z in laid:
				if str(z["kind"]) == "rune":
					z["dur"] = minf(float(z["dur"]), float(_tune("quickfuse")["rune"]))
		"concussion":
			for z in laid:
				if str(z["kind"]) == "rune":
					var z0: Dictionary = z
					_later_do(float(z0["dur"]) + 0.05, func() -> void: W.add_cracks(i, Vector2(z0["x"], z0["y"]), float(z0["r"]), float(_tune("concussion")["cracks"])))
		"permafrost":
			for z in laid:
				if str(z["kind"]) == "ice":
					z["dur"] = float(_tune("permafrost")["ice"])
		"smoulder":
			for z in laid:
				if str(z["kind"]) == "burn":
					z["dur"] = float(z["dur"]) * float(_tune("smoulder")["longer"])
		"tempest":
			for z in laid:
				if str(z["kind"]) == "storm":
					z["dur"] = float(z["dur"]) * float(_tune("tempest")["storm"])
		"canker":
			for z in laid:
				if str(z["kind"]) == "venom":
					z["dur"] = float(z["dur"]) * float(_tune("canker")["cloud"])
		"bedrock":
			for z in laid:
				if str(z["kind"]) == "cracks":
					z["dur"] = float(_tune("bedrock")["cracks"])
		"bloat":
			for z in laid:
				if str(z["kind"]) == "venom":
					z["dur"] = float(z["dur"]) * float(_tune("bloat")["fade"])
		"coldsnap":
			for z in laid:
				if str(z["kind"]) == "ice":
					z["dur"] = float(z["dur"]) * float(_tune("coldsnap")["melt"])
		"flashfire":
			for z in laid:
				if str(z["kind"]) == "burn":
					z["dur"] = float(z["dur"]) * float(_tune("flashfire")["fade"])
					z["dmg"] = float(z.get("dmg", 0.0)) * float(_tune("flashfire")["hotter"])
		"juggernaut":
			if h.frenzy >= _frenzy_most():
				for z in laid:
					if str(z["kind"]) == "cracks":
						z["r"] = float(z["r"]) * float(_tune("juggernaut")["wide"])
		"earthquake":
			for z in laid:
				if str(z["kind"]) == "cracks":
					z["r"] = float(z["r"]) * float(_tune("earthquake")["cracks"])
		"stormfront":
			for z in laid:
				if str(z["kind"]) == "storm":
					z["r"] = float(z["r"]) * float(_tune("stormfront")["storm"])
					z["drift"] = true
		"gale":
			var G := _tune("gale")
			h.haste = maxf(h.haste, float(G["haste"]))
			h.haste_t = maxf(h.haste_t, float(G["hasteSecs"]))
			if h.has_method("allies_haste"):
				h.allies_haste(float(G["haste"]), float(G["hasteSecs"]), float(G["allies"]))
			_tell({"id": "gale", "what": "gust", "x": h.world.x, "y": h.world.y, "r": float(G["allies"])})
		"heavy2":
			for z in laid:
				if str(z["kind"]) == "cracks":
					z["r"] = float(z["r"]) * float(_tune("heavy2")["wide"])
	for z in laid:
		if str(z["kind"]) in ["ward", "cracks", "burn", "ice", "storm", "venom"]:
			_wards.append(z)


# --- what goes on ---

func step(dt: float) -> void:
	time += dt
	# (what is to come)
	if not _later.is_empty():
		var due: Array = []
		for e in _later:
			e["t"] = float(e["t"]) - dt
			if float(e["t"]) <= 0.0:
				due.append(e)
		for e in due:
			_later.erase(e)
			(e["fn"] as Callable).call()
	# (Blink's and Tailwind's speed)
	blink_t = maxf(0.0, blink_t - dt)
	tail_t = maxf(0.0, tail_t - dt)
	# CINDERWARD: his shield bursting in flame as it breaks or fades
	var sh: float = h.shield + (h.barrier if Words.DEFENCE_WORDS else 0.0)
	if _shield_was > 0.0 and sh <= 0.0 and any_has("cinderward"):
		var C := _tune("cinderward")
		_tell({"id": "cinderward", "what": "burst", "x": h.world.x, "y": h.world.y, "r": float(C["r"])})
		for o in _mons():
			if _alive(o) and o.world.distance_to(h.world) <= float(C["r"]) + o.r:
				o.damage(maxf(1.0, roundf(h.max_life * float(C["burst"]) * 0.1)), "fire", false, false, [], false, false, 0)
				if not o.dead:
					o.set_alight(maxf(1.0, h.max_life * 0.02), 3.0)
	_shield_was = sh
	# TEMPEST's web: arcs leaping between the shocked ones
	webs = webs.filter(func(w): return float(w["t"]) > 0.0)
	if not webs.is_empty():
		_web_tick -= dt
		for w in webs:
			w["t"] = float(w["t"]) - dt
		if _web_tick <= 0.0:
			_web_tick = float(_tune("tempest")["every"])
			var shocked: Array = _mons().filter(func(o): return _alive(o) and o.shock_t > 0.0)
			var w0: Dictionary = webs[0]
			for k in mini(shocked.size() - 1, 4):
				var a = shocked[k]
				var b = shocked[k + 1]
				if a.world.distance_to(b.world) <= 5.0:
					h._tell({"t": "arc", "x0": a.world.x, "y0": a.world.y, "x1": b.world.x, "y1": b.world.y, "meld": "tempest"})
					b.damage(maxf(1.0, roundf(float(w0["dmg"]))), "lightning", false, false, [], false, false, int(w0["i"]))
	# STORMFRONT's links: lightning flicking between the linked
	for L in links:
		L["t"] = float(L["t"]) - dt
		L["tick"] = float(L["tick"]) - dt
		var ids: Array = (L["ids"] as Array).filter(func(o): return _alive(o))
		L["ids"] = ids
		if float(L["tick"]) <= 0.0 and ids.size() >= 2:
			L["tick"] = float(_tune("stormfront")["every"])
			var a = ids[randi() % ids.size()]
			var b = ids[randi() % ids.size()]
			if a != b:
				h._tell({"t": "arc", "x0": a.world.x, "y0": a.world.y, "x1": b.world.x, "y1": b.world.y, "meld": "stormfront"})
				b.damage(maxf(1.0, roundf(float(L["dmg"]))), "lightning", false, false, [], false, false, int(L["i"]))
	links = links.filter(func(L): return float(L["t"]) > 0.0)
	# (what the monsters carry of these: Inferno's trail, Brand's burning)
	_tagged = _tagged.filter(func(o): return is_instance_valid(o) and not o.dead and not o.m52.is_empty())
	for o in _tagged:
		if o.m52.has("inferno"):
			var I: Dictionary = o.m52["inferno"]
			if o.burn_t <= 0.0:
				o.m52.erase("inferno")
			else:
				I["tick"] = float(I["tick"]) - dt
				if float(I["tick"]) <= 0.0 and h.wakes != null:
					I["tick"] = float(_tune("inferno")["trail"])
					h.wakes.add_patch(int(I["i"]), "burn", o.world, 0.6, float(_tune("inferno")["trailSecs"]), maxf(1.0, float(I["dps"])), "fire", "inferno")
		if o.m52.has("brand"):
			o.m52["brand"] = float(o.m52["brand"]) - dt
			if float(o.m52["brand"]) <= 0.0:
				o.m52.erase("brand")
		if o.mark_t > 0.0 and str(o.m52.get("mark", "")) == "brand":
			o.set_alight(maxf(1.0, h.avg_hit(0, 1.0) * float(_tune("brand")["burn"]) / 3.0), maxf(o.burn_t, 0.5))
	_grounds(dt)
	_on_him()


## (ON HIM, a monster's melds: Rekindle's burn lights again once as it goes out; Flashfire's flares round him; Bloat's poison
## bursts round him as it runs out)
func _on_him() -> void:
	if h.burn_t <= 0.0 and _him_burn > 0.0:
		if int(on_him.get("rekindle", 0)) > 0:
			on_him.erase("rekindle")
			h.burn_t = 3.0
			_tell({"id": "rekindle", "what": "relight", "x": h.world.x, "y": h.world.y, "foe": true})
		if on_him.has("flare"):
			var d: float = on_him["flare"]
			on_him.erase("flare")
			h.hurt_by(d * 0.5, "fire", [], {}, null, h.world)
			_tell({"id": "flashfire", "what": "flare", "x": h.world.x, "y": h.world.y, "r": 1.2, "foe": true})
	if h.poison_t <= 0.0 and _him_poison > 0.0 and on_him.has("bloat"):
		var d: float = on_him["bloat"]
		on_him.erase("bloat")
		h.hurt_by(d * 0.6, "poison", [], {}, null, h.world)
		_tell({"id": "bloat", "what": "burst", "x": h.world.x, "y": h.world.y, "r": 1.2, "foe": true})
	_him_burn = h.burn_t
	_him_poison = h.poison_t


## The ground his melds left, each its own (wakes.list's patches marked `m52`).
func _grounds(dt: float) -> void:
	if h.wakes == null or not is_instance_valid(h.wakes):
		_wards.clear()
		return
	var live: Array = h.wakes.list
	var gone: Array = []
	for z in _wards:
		if not live.has(z):
			# (gone with the floor, or ended: its end, if it has one, was seen as it came: near_end below)
			gone.append(z)
			continue
		var id: String = str(z.get("m52", ""))
		var at := Vector2(z["x"], z["y"])
		var rad: float = z["r"]
		var near_end: bool = float(z["t"]) >= float(z["dur"]) - dt * 1.5
		z["m52_t"] = float(z.get("m52_t", 0.0)) - dt
		var tick: bool = float(z["m52_t"]) <= 0.0
		if tick:
			z["m52_t"] = 0.5
		match id:
			"viper":
				if z.get("creep", false):
					var best = null
					for o in _mons():
						if _alive(o) and (best == null or o.world.distance_to(at) < best.world.distance_to(at)):
							best = o
					if best != null and best.world.distance_to(at) > 0.2:
						var to: Vector2 = at.move_toward(best.world, float(_tune("viper")["creep"]) * dt)
						z["x"] = to.x
						z["y"] = to.y
			"rekindle", "coldsnap", "bloat", "jolt":
				if near_end and not z.get("m52_end", false):
					z["m52_end"] = true
					_ended(z)
			"marrow":
				if tick:
					for o in _mons():
						if _alive(o) and o.stagger_t > 0.0 and o.world.distance_to(at) <= rad + o.r:
							h.heal_flat(float(_tune("marrow")["drain"]))
							_tell({"id": "marrow", "what": "drain", "x": o.world.x, "y": o.world.y, "x1": h.world.x, "y1": h.world.y})
			"pressurepoint":
				for o in _mons():
					if _alive(o) and o.stagger_t > 0.0 and o.mark_t <= 0.0 and o.world.distance_to(at) <= rad + o.r:
						o.mark_t = float(Words.data()["precise"]["markTime"])
						h._tell({"t": "markOn", "id": o.id, "x": o.world.x, "y": o.world.y, "secs": o.mark_t})
			"daze":
				if tick:
					z["m52_t"] = float(_tune("daze")["pulse"])
					for o in _mons():
						if _alive(o) and o.world.distance_to(at) <= rad + o.r:
							o.stagger_cd = 0.0
							o.stagger_from(at)
			"conduit":
				if tick:
					for o in _mons():
						if _alive(o) and o.world.distance_to(at) <= rad + o.r:
							h.heal_flat(float(_tune("conduit")["storm"]))
							_tell({"id": "conduit", "what": "bead", "x": o.world.x, "y": o.world.y, "x1": h.world.x, "y1": h.world.y})
							break
			"hemlock":
				if tick:
					for o in _mons():
						if _alive(o) and o.world.distance_to(at) <= rad + o.r:
							o.dose(maxf(1.0, h.avg_hit(int(z.get("skill", 0)), 1.0) * float(_tune("hemlock")["ward"]) / 4.0), 4.0, "poison")
			"cinderward":
				for o in _mons():
					if _alive(o) and absf(o.world.distance_to(at) - rad) <= 0.4:
						o.set_alight(maxf(1.0, h.avg_hit(int(z.get("skill", 0)), 1.0) * float(_tune("cinderward")["edge"]) / 3.0), 3.0)
			"static":
				if float(z["m52_t"]) <= 0.0 or tick:
					z["m52_t"] = float(_tune("static")["every"])
					for o in _mons():
						if _alive(o) and o.world.distance_to(at) <= rad + o.r:
							h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y, "meld": "static"})
							o.damage(maxf(1.0, roundf(h.avg_hit(int(z.get("skill", 0)), 1.0) * float(_tune("static")["ward"]))), "lightning", false, false, [], false, false, int(z.get("skill", 0)))
							break
			"fortress":
				for o in _mons():
					if _alive(o) and o.world.distance_to(at) <= rad + o.r and not z.has("in_" + str(o.id)):
						z["in_" + str(o.id)] = true
						o.stagger_from(at)
			"miasma":
				z["r"] = float(z["r"]) * (1.0 + float(_tune("miasma")["grow"]) * dt / maxf(1.0, float(z["dur"])) * 4.0)
			"glacier":
				z["r"] = float(z["r"]) * (1.0 + float(_tune("glacier")["creep"]) * dt / maxf(1.0, float(z["dur"])) * 4.0)
			"inferno":
				if str(z["kind"]) == "burn" and float(z["t"]) < 3.0:
					z["r"] = float(z["r"]) * (1.0 + float(_tune("inferno")["spread"]) * dt)
			"stormfront":
				if z.get("drift", false) and str(z["kind"]) == "storm":
					var best = null
					for o in _mons():
						if _alive(o) and o.world.distance_to(at) <= 8.0 and (best == null or o.world.distance_to(at) < best.world.distance_to(at)):
							best = o
					if best != null:
						var to: Vector2 = at.move_toward(best.world, 0.8 * dt)
						z["x"] = to.x
						z["y"] = to.y
	for z in gone:
		_wards.erase(z)


## A patch of his meld's ending: Rekindle's ground flares again; Cold Snap's ice freezes what is on it as it melts; Bloat's cloud
## bursts on what is in it; Jolt's storm lets all its bolts loose at once.
func _ended(z: Dictionary) -> void:
	if z.get("m52_ended", false):
		return
	z["m52_ended"] = true
	var id: String = str(z.get("m52", ""))
	var at := Vector2(z["x"], z["y"])
	var rad: float = z["r"]
	var i: int = int(z.get("skill", 0))
	match id:
		"rekindle":
			if str(z["kind"]) == "burn" and not z.get("again", false) and h.wakes != null:
				h.wakes.add_patch(i, "burn", at, rad, float(_tune("rekindle")["flare"]) * 4.0, maxf(1.0, float(z.get("dmg", 1.0))), "fire", "rekindle")
				var z2: Dictionary = h.wakes.list[h.wakes.list.size() - 1]
				z2["again"] = true
				_tell({"id": "rekindle", "what": "flare", "x": at.x, "y": at.y, "r": rad})
		"coldsnap":
			if str(z["kind"]) == "ice":
				for o in _mons():
					if _alive(o) and o.world.distance_to(at) <= rad + o.r:
						o.freeze_now()
				_tell({"id": "coldsnap", "what": "melt", "x": at.x, "y": at.y, "r": rad})
		"bloat":
			if str(z["kind"]) == "venom":
				for o in _mons():
					if _alive(o) and o.world.distance_to(at) <= rad + o.r:
						o.damage(maxf(1.0, roundf(float(z.get("dmg", 1.0)) * 3.0)), "poison", false, false, [], false, false, i)
				_tell({"id": "bloat", "what": "burst", "x": at.x, "y": at.y, "r": rad})
		"jolt":
			if str(z["kind"]) == "storm":
				for o in _mons():
					if _alive(o) and o.world.distance_to(at) <= rad + o.r:
						h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y, "sky": true, "meld": "jolt"})
						o.damage(maxf(1.0, roundf(float(z.get("dmg", 1.0)) * float(z["dur"]) * 0.6)), "lightning", false, false, [], false, false, i)
				_tell({"id": "jolt", "what": "all", "x": at.x, "y": at.y, "r": rad})


## A monster's burning or poison has run out (monster.gd): Rekindle lights it again once; Flashfire flares; Bloat bursts.
func status_end(m, what: String) -> void:
	if m.dead:
		return
	if what == "burn":
		if int(m.m52.get("rekindle", 0)) > 0:
			_tag(m)
			m.m52["rekindle"] = int(m.m52["rekindle"]) - 1
			m.set_alight(maxf(1.0, m.burn_dps_was), 3.0)
			_tell({"id": "rekindle", "what": "relight", "x": m.world.x, "y": m.world.y, "m": m})
		if m.m52.has("flare"):
			var F: Dictionary = m.m52["flare"]
			m.m52.erase("flare")
			for o in _mons():
				if _alive(o) and o.world.distance_to(m.world) <= float(_tune("flashfire")["r"]) + o.r:
					o.damage(maxf(1.0, roundf(float(F["dmg"]))), "fire", false, false, [], false, false, int(F["i"]))
			_tell({"id": "flashfire", "what": "flare", "x": m.world.x, "y": m.world.y, "r": float(_tune("flashfire")["r"])})
	elif what == "poison":
		if m.m52.has("bloat"):
			var B: Dictionary = m.m52["bloat"]
			m.m52.erase("bloat")
			if h.wakes != null:
				h.wakes.add_cloud(int(B["i"]), m.world, float(_tune("bloat")["r"]), maxf(1.0, float(B["dmg"]) / 3.0), 1.5, null)
			_tell({"id": "bloat", "what": "burst", "x": m.world.x, "y": m.world.y, "r": float(_tune("bloat")["r"])})


# --- on him ---

## A blow on him while his shield holds (hero.gd hurt_by): HEMLOCK poisons its maker; STATIC strikes it with an arc.
func struck_him(src) -> void:
	if src == null or not is_instance_valid(src) or src.dead or not _shielded():
		return
	if any_has("hemlock"):
		src.dose(maxf(1.0, h.avg_hit(0, 1.0) * float(_tune("hemlock")["dose"]) / 4.0), 4.0, "poison")
		_tell({"id": "hemlock", "what": "thorns", "x": src.world.x, "y": src.world.y})
	if any_has("static"):
		_tell({"id": "static", "what": "zap", "x": h.world.x, "y": h.world.y, "x1": src.world.x, "y1": src.world.y})
		src.damage(maxf(1.0, roundf(h.avg_hit(0, 1.0) * float(_tune("static")["arc"]))), "lightning", false, false, [], false, false, 0)


## FORTRESS: while his shield holds, nothing knocks him back or stuns him.
func planted() -> bool:
	var p: bool = any_has("fortress") and _shielded()
	if p and time - float(_throttle.get("fortress", -9.0)) > 0.3:
		_throttle["fortress"] = time
		_tell({"id": "fortress", "what": "clang", "x": h.world.x, "y": h.world.y})
	return p


## How much faster he moves: Blur at a full frenzy, Windward behind his shield or in its ward, Tailwind, Blink.
func pace() -> float:
	var k := 1.0
	if any_has("blur") and h.frenzy >= _frenzy_most():
		k *= 1.0 + float(_tune("blur")["move"])
	if any_has("windward") and _shielded():
		k *= 1.0 + float(_tune("windward")["move"])
	if _in_ward("windward"):
		k *= 1.0 + float(_tune("windward")["wardMove"])
	if tail_t > 0.0:
		k *= 1.0 + tail_k / 100.0
	if blink_t > 0.0:
		k *= 1.0 + blink_k / 100.0
	return k


func dodge() -> float:
	if any_has("blur") and h.frenzy >= _frenzy_most():
		return float(_tune("blur")["dodge"]) / 100.0
	return 0.0


func _in_ward(id: String) -> bool:
	for z in _wards:
		if str(z.get("m52", "")) == id and str(z["kind"]) == "ward" and Vector2(z["x"], z["y"]).distance_to(h.world) <= float(z["r"]):
			return true
	return false


## BULWARK behind: inside its ward, Power's might builds twice as fast. MOMENTUM behind: two more steps of it, and longer.
## HAYMAKER behind: twice as fast, fading in half the time.
func might_k(i: int) -> float:
	var b := bid(i)
	if _in_ward("bulwark"):
		return float(_tune("bulwark")["might"])
	if b == "haymaker":
		return float(_tune("haymaker")["build"])
	return 1.0


func might_most(i: int) -> float:
	return 5.0 + (float(_tune("momentum")["might"]) if bid(i) == "momentum" else 0.0)


func might_secs(i: int) -> float:
	var b := bid(i)
	if b == "momentum":
		return 1.0 + float(_tune("momentum")["longer"])
	if b == "haymaker":
		return float(_tune("haymaker")["fade"])
	return 1.0


## The haste "of Swiftness" gives: TAILWIND behind half again as long; BLINK behind a third as long and much faster.
func haste_k(i: int) -> Array:
	var b := bid(i)
	if b == "tailwind":
		return [1.0, 1.0 + float(_tune("tailwind")["longer"])]
	if b == "blink":
		return [float(_tune("blink")["behindMore"]), float(_tune("blink")["behindShort"])]
	return [1.0, 1.0]


## A life orb taken: BLOODLUST behind, Power's might; SECOND WIND behind, a burst of speed.
func orb_taken() -> void:
	for i in 3:
		match bid(i):
			"bloodlust":
				var more: float = h.loadout.r(i)["might"]
				if more > 0.0:
					h.might = minf(more * 5.0, h.might + more * float(_tune("bloodlust")["orbMight"]))
					h.might_t = maxf(h.might_t, 5.0)
				_tell({"id": "bloodlust", "what": "orb", "x": h.world.x, "y": h.world.y})
			"secondwind":
				var S := _tune("secondwind")
				h.haste = maxf(h.haste, float(S["orbHaste"]))
				h.haste_t = maxf(h.haste_t, float(S["hasteSecs"]))
				_tell({"id": "secondwind", "what": "orb", "x": h.world.x, "y": h.world.y})


## JUGGERNAUT: at a full frenzy, Heavy no slower.
func rate_k() -> float:
	if any_has("juggernaut") and h.frenzy > 0:
		var slower: float = float(Words.data()["heavy"]["slower"])
		return 1.0 + (slower - 1.0) * float(h.frenzy) / float(_frenzy_most())
	return 1.0


## HAYMAKER: less wind-up before the blow.
func windup_k(i: int) -> float:
	return float(_tune("haymaker")["windup"]) if fid(i) == "haymaker" else 1.0


## FLURRY behind: its repeat sooner.
func echo_k(i: int) -> float:
	return float(_tune("flurry")["sooner"]) if bid(i) == "flurry" else 1.0


func forget() -> void:
	_later.clear()
	webs.clear()
	links.clear()
	_wards.clear()
	_tagged.clear()
	on_him.clear()
	_him_burn = 0.0
	_him_poison = 0.0
	momentum = 0
	last_use = [-99.0, -99.0, -99.0]
	flurry_n = 2
	blink_t = 0.0
	tail_t = 0.0
