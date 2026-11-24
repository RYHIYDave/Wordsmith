## THE CITY'S MELDS AT WORK ON HIS MOVES (his doc Floor 11–15 Melds, its runes and their animations, “Good”, “Yep good”, “Good to
## go”, 24 Nov 2026; their text tools/meldscity/docs_city.txt; behind melds52.gd CITY_ON). As melds46_rules.gd is for the 46 before
## them: a melded word does the work of both its words already (words.gd resolve, city_words.gd), and here is each one's TWIST, in
## front and behind, its numbers melds52.json `tune`. melds52_rules.gd (the hero's `m52`) hands on to this from each of its own
## moments (`y`); the city's words call it from theirs (city_words.gd: the pull, the copies, the shards, the hold; wakes.gd: the
## snare sprung).
##   PULLING:   Maw (the dragged crash together; behind, its vortex collapses in a blast), Sump (a dose for each poisoned one
##              beside; behind, a vortex of poison), Drift (the chilled dragged twice as far, freezing as they meet; behind, an icy
##              vortex freezing at its middle), Firewhirl (the blast's edge swept in, burning hotter; behind, a vortex of fire),
##              Lodestone (each arc drags what it strikes toward where it leapt from; behind, bolts on the nearest its middle),
##              Riptide (quick uses pull from farther; behind, his wake tugs them along), Gravity (drags in all near, stunning
##              them longer; behind, its vortex staggers again and again)
##   SPLITTING: Splinter (copies half again as strong, knocking back; behind, its shards build Power's bonus), Spore (copies
##              poison; behind, a cloud where each shard lands), Sleet (a copy on the frozen splits again; behind, ice), Embers
##              (copies burst; behind, burning ground), Fractal (each copy arcs; behind, a bolt where each lands), Scatter (quick
##              uses add copies, up to five; behind, a shard off each hit in a burst), Rubble (copies stagger; behind, cracks)
##   HEXING:    Doom (each hit deepens the curse; behind, Power's bonus twice as fast in its circle), Plague (a cursed one dying
##              passes it on; behind, its circle poisons), Hoarfrost (the frozen take the curse twice; behind, its circle
##              chills), Brimstone (the cursed burn hotter; behind, its circle burns), Jinx (each arc curses; behind, its bolts on
##              the cursed first), Whisper (a cursed one struck shortens the wait; behind, a burst curses those passed), Burden (the
##              stunned cursed twice as long; behind, the staggered cursed)
##   STILLING:  Stasis (a quarter of the blow again as the slow ends; behind, Power's bonus holds in its bubble), Stagnation (the
##              poison holds while the slow does; behind, its bubble poisons), Frostlock (the slowed freeze sooner and longer;
##              behind, freezing as they stay), Slow Burn (the slowed burn twice as long), Stormglass (arcs struck again as the
##              slow ends; behind, bolts on all its bubble holds), Timeslip (each slowed one near shortens the wait; behind, he is
##              faster in its bubble), Standstill (the stunned slowed, stunned half as long again; behind, staggering again)
##   BINDING:   Shackle (the held hit harder; behind, its snare bites), Strangler (the held poisoned twice as fast; behind, its
##              snare poisons), Icebound (the held chilled twice as hard; behind, its snare freezes), Firetrap (the held burn
##              hotter; behind, its snare bursts into flame), Tether (arcs between the held; behind, bolts from its snare), Lasso
##              (quick uses hold longer; behind, a burst snares the first passed), Anchor (the held stunned twice as long; behind,
##              its snare staggers)
##   EACH OTHER: Confluence, Beckon, Horizon, Reel, Coven, Constellation, Web, Torpor, Witchknot, Amber
##   LEVEL 2:   Splitting II (four copies, each a little stronger; half as many shards again); Binding II (its snare catches two);
##              the others their rune half as strong again (words.gd resolve, as any level 2 rune)
## THE LOOKS read the tellings sent (fx_m52p_city.gd), `m52` {id, what, ...}, told through the 52's (`p._tell`).
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")
const Words := preload("res://scripts/words.gd")

var h
## (the 52's rules: who has what, the tellings, the clock, the patches followed)
var p
## (quick uses within a window: Riptide, Scatter, Lasso: {i: [n, at]})
var _quick := {}
## (Lasso behind: the first passed in this burst is snared)
var _lasso_burst := false
## (what a split this use struck: Coven, Web, Sleet: {i: {use, ids}})
var _copied := {}
## (Constellation behind: shards hanging still: {at, t, i})
var _stars: Array = []
## (Whisper behind, Riptide behind: their clocks)
var _pass_t := 0.0
var _tug_t := 0.0
var _tether_t := 0.0
## (the city's runes with the floor 6–10 runes, their rules, handed on to from each moment of the city's words: meldscity2_rules.gd)
var z2


func _init(hero, rules) -> void:
	h = hero
	p = rules


func _t(id: String) -> Dictionary:
	return M52.tune(id)


func _tell(e: Dictionary) -> void:
	p._tell(e)


func _C() -> Dictionary:
	return Words.data().get("city", {})


## His city meld in front of move `i`, or "".
func f(i: int) -> String:
	var m: String = p.fid(i)
	return m if M52.is_city(m) else ""


## His city meld behind move `i`, or "".
func b(i: int) -> String:
	var m: String = p.bid(i)
	return m if M52.is_city(m) else ""


## A level 2 rune in front of move `i` (they are no melded word: resolve's `meld` never holds one).
func _front_has(i: int, w: String) -> bool:
	return i >= 0 and i <= 2 and h.loadout != null and h.loadout.wfronts(i).has(w)


func _behind_has(i: int, w: String) -> bool:
	return i >= 0 and i <= 2 and h.loadout != null and h.loadout.wbehinds(i).has(w)


func _any_city() -> bool:
	for i in 3:
		if f(i) != "" or b(i) != "" or _front_has(i, "splitting2") or _behind_has(i, "splitting2") or _behind_has(i, "binding2"):
			return true
	return false


func _avg(i: int, k: float) -> float:
	return maxf(1.0, roundf(h.avg_hit(i, 1.0) * k))


func _near(at: Vector2, rad: float, but = null) -> Array:
	var out: Array = []
	for o in p._mons():
		if p._alive(o) and o != but and o.world.distance_to(at) <= rad + o.r:
			out.append(o)
	return out


func _nearest(at: Vector2, rad: float, but = null):
	var best = null
	for o in _near(at, rad, but):
		if best == null or o.world.distance_to(at) < best.world.distance_to(at):
			best = o
	return best


## A curse laid as Hexing's own lays it (hero.gd hit_monster), `more` how much more it takes.
func _curse(o, more: float, secs := -1.0) -> void:
	if o.dead:
		return
	var C := _C()
	var fresh: bool = o.hex_t < 0.5
	o.hex_more = maxf(o.hex_more if o.hex_t > 0.0 else 0.0, more)
	o.hex_t = maxf(o.hex_t, float(C["hex"]["secs"]) if secs < 0.0 else secs)
	if fresh:
		h._tell({"t": "hexOn", "id": o.id, "m": o, "x": o.world.x, "y": o.world.y, "secs": o.hex_t})


## A slow in time laid as Stilling's own lays it.
func _still(o, k: float, secs := -1.0) -> void:
	if o.dead:
		return
	var C := _C()
	var fresh: bool = o.still_t < 0.5
	o.still_k = maxf(o.still_k if o.still_t > 0.0 else 0.0, minf(float(C["still"]["most"]), k))
	o.still_t = maxf(o.still_t, float(C["still"]["secs"]) if secs < 0.0 else secs)
	if fresh:
		h._tell({"t": "stillOn", "id": o.id, "m": o, "x": o.world.x, "y": o.world.y, "secs": o.still_t})


func _hold(o, secs: float) -> void:
	var held: float = h.city.bind_monster(o, secs)
	if held > 0.0:
		h._tell({"t": "bind", "id": o.id, "m": o, "secs": held})


## (each move's figures for its runes as a level 1 would give them, for what a twist lays of a rune its move has not: Coven's circles)
func _r(i: int) -> Dictionary:
	return h.loadout.r(i)


# --- a use ---

func used(i: int, echo: bool, at: Vector2) -> void:
	if echo:
		return
	var id := f(i)
	if id in ["riptide", "scatter", "lasso"]:
		var T := _t(id)
		var q: Array = _quick.get(i, [0, -99.0])
		var n: int = mini(int(T["most"]), int(q[0]) + 1) if p.time - float(q[1]) <= float(T["window"]) else 0
		_quick[i] = [n, p.time]
		if n > 0:
			_tell({"id": id, "what": "quick", "n": n, "x": h.world.x, "y": h.world.y})
	if id == "timeslip":
		var T := _t("timeslip")
		var n := 0
		for o in _near(h.world, float(T["near"])):
			if o.still_t > 0.0:
				n += 1
				if n <= 3:
					_tell({"id": "timeslip", "what": "hand", "x": o.world.x, "y": o.world.y, "x1": h.world.x, "y1": h.world.y})
		n = mini(n, int(T["most"]))
		if n > 0:
			h.cool_by(float(_r(i)["cooldown"]) * float(T["cut"]) * n)
	if b(i) == "lasso":
		_lasso_burst = true


func quick_n(i: int) -> int:
	return int(_quick.get(i, [0, -99.0])[0])


# --- how hard a hit lands ---

func more(m, i: int, quiet: bool) -> float:
	var id := f(i)
	var k := 1.0
	match id:
		"hoarfrost":
			if m.frozen_t > 0.0 and m.hex_t > 0.0:
				k *= (1.0 + float(_t("hoarfrost")["frozen"]) * m.hex_more) / (1.0 + m.hex_more)
				if not quiet:
					_tell({"id": "hoarfrost", "what": "frozen", "x": m.world.x, "y": m.world.y, "m": m})
		"torpor":
			if m.hex_t > 0.0 and m.still_t > 0.0:
				k *= 1.0 + float(_t("torpor")["more"])
				if not quiet:
					_tell({"id": "torpor", "what": "drowse", "x": m.world.x, "y": m.world.y, "m": m})
		"witchknot":
			if m.hex_t > 0.0 and m.bind_t > 0.0:
				k *= 1.0 + float(_t("witchknot")["more"])
				if not quiet:
					_tell({"id": "witchknot", "what": "knot", "x": m.world.x, "y": m.world.y, "m": m})
		"shackle":
			if m.bind_t > 0.0:
				k *= 1.0 + float(_t("shackle")["more"])
				if not quiet:
					_tell({"id": "shackle", "what": "clank", "x": m.world.x, "y": m.world.y, "m": m})
	return k


# --- what a hit has done ---

func struck(m, i: int, dmg: float, c: bool, at: Vector2, quiet: bool, was_frozen: bool) -> void:
	var id := f(i)
	var bk := b(i)
	var r: Dictionary = _r(i)
	if id != "" and not m.dead:
		p._tag(m)
		match id:
			"doom":
				if m.hex_t > 0.0:
					var T := _t("doom")
					var n: int = mini(int(T["most"]), int(m.m52.get("doom_n", 0)) + 1)
					m.m52["doom_n"] = n
					m.hex_more = maxf(m.hex_more, float(r["hex"]) * (1.0 + float(T["deeper"]) * n))
					if not quiet:
						_tell({"id": "doom", "what": "thorn", "n": n, "x": at.x, "y": at.y, "m": m})
			"brimstone":
				if m.hex_t > 0.0 and m.burn_t > 0.0 and not bool(m.m52.get("brim", false)):
					m.m52["brim"] = true
					m.burn_dps *= float(_t("brimstone")["hotter"])
					_tell({"id": "brimstone", "what": "flare", "x": at.x, "y": at.y, "m": m})
			"whisper":
				if m.hex_t > 0.0 and not quiet:
					h.cool_by(float(r["cooldown"]) * float(_t("whisper")["cut"]))
					_tell({"id": "whisper", "what": "wisp", "x": at.x, "y": at.y, "x1": h.world.x, "y1": h.world.y})
			"stasis":
				if m.still_t > 0.0:
					m.m52["stasis"] = float(m.m52.get("stasis", 0.0)) + dmg
					m.m52["stasis_i"] = i
					if not quiet:
						_tell({"id": "stasis", "what": "hold", "x": at.x, "y": at.y, "m": m})
			"frostlock":
				if m.still_t > 0.0 and not m.boss:
					if m.frozen_t <= 0.0 and m.chill_t > 0.0 and m.freeze_immune <= 0.0:
						m.freeze_now()
					if m.frozen_t > 0.0 and not bool(m.m52.get("locked", false)):
						m.m52["locked"] = true
						m.frozen_t *= float(_t("frostlock")["longer"])
						_tell({"id": "frostlock", "what": "lock", "x": at.x, "y": at.y, "m": m})
			"slowburn":
				if m.still_t > 0.0 and m.burn_t > 0.0 and not bool(m.m52.get("slowburn", false)):
					m.m52["slowburn"] = true
					m.burn_t *= float(_t("slowburn")["longer"])
					_tell({"id": "slowburn", "what": "slow", "x": at.x, "y": at.y, "m": m})
			"icebound":
				if m.bind_t > 0.0 and m.chill_t > 0.0:
					m.chill = minf(0.85, m.chill * float(_t("icebound")["chill"]))
					if not quiet:
						_tell({"id": "icebound", "what": "climb", "x": at.x, "y": at.y, "m": m})
			"firetrap":
				if m.bind_t > 0.0 and m.burn_t > 0.0 and not bool(m.m52.get("firetrap", false)):
					m.m52["firetrap"] = true
					m.burn_dps *= float(_t("firetrap")["hotter"])
					_tell({"id": "firetrap", "what": "tongues", "x": at.x, "y": at.y, "m": m})
			"plague", "burden", "stagnation", "standstill", "strangler", "tether", "anchor":
				m.m52[id] = i
	if bk != "" and not quiet:
		match bk:
			"doom":
				var z = h.wakes.patch_at("hex", m.world) if h.wakes != null else null
				if z != null and int(z.get("skill", -1)) == i and float(r["might"]) > 0.0:
					# (Power's bonus built again: twice as fast inside its circle)
					var k := float(_t("doom")["might"]) - 1.0
					h.might = minf(float(r["might"]) * p.might_most(i), h.might + float(r["might"]) * k)
					_tell({"id": "doom", "what": "might", "x": h.world.x, "y": h.world.y})
			"scatter":
				if h.haste_t > 0.0:
					var o = _nearest(m.world, float(_C()["split"]["reach"]), m)
					if o != null:
						var secs: float = maxf(0.06, o.world.distance_to(m.world) / float(_C()["split"]["speed"]))
						_tell({"id": "scatter", "what": "flick", "x": m.world.x, "y": m.world.y, "x1": o.world.x, "y1": o.world.y, "secs": secs})
						var share: float = float(_C()["split"]["shardShare"])
						h._after(secs, func() -> void: h.city._copy_hit(o, i, share, "shard"))


## A kill: Plague's curse and poison pass on.
func killed(m, i: int) -> void:
	if f(i) == "plague" and m.hex_t > 0.0:
		var o = _nearest(m.world, float(_t("plague")["near"]), m)
		if o != null:
			_curse(o, m.hex_more, m.hex_t)
			if m.poison_t > 0.0:
				o.dose(m.poison_dps / maxi(1, m.poison_n), m.poison_t, "poison")
			_tell({"id": "plague", "what": "pass", "x": m.world.x, "y": m.world.y, "x1": o.world.x, "y1": o.world.y, "m": o})


## An arc of move `i` has struck `o`, leaping from `from`.
func arc_struck(o, i: int, from: Vector2) -> void:
	var id := f(i)
	match id:
		"lodestone":
			if from != Vector2.INF and not o.dead and not o.boss:
				var d: Vector2 = from - o.world
				var far: float = minf(float(_t("lodestone")["tug"]) * (0.5 if o.elite else 1.0), maxf(0.0, d.length() - float(_C()["pull"]["stop"])))
				if far > 0.05:
					h.melds._slide(o, d / d.length() * far, 6)
					_tell({"id": "lodestone", "what": "tug", "x": o.world.x, "y": o.world.y, "x1": from.x, "y1": from.y, "m": o})
		"jinx":
			_curse(o, float(_r(i)["hex"]))
			_tell({"id": "jinx", "what": "mark", "x": o.world.x, "y": o.world.y, "m": o})
		"stormglass":
			if o.still_t > 0.0:
				p._tag(o)
				o.m52["glass"] = {"i": i, "dmg": _avg(i, float(_t("stormglass")["again"])), "x": from.x, "y": from.y}
				_tell({"id": "stormglass", "what": "hang", "x": o.world.x, "y": o.world.y, "x1": from.x, "y1": from.y, "m": o})
		"fractal":
			pass


# --- Pulling in front (city_words.gd pull_in) ---

## How far to reach for what to drag (Gravity drags in all near; Firewhirl its blast's edge).
func pull_reach(i: int, reach: float, single: bool) -> float:
	if z2 != null and z2.f(i) != "":
		return z2.pull_reach(i, reach)
	match f(i):
		"gravity":
			return maxf(reach, float(_t("gravity")["reach"]))
		"firewhirl":
			return reach + float(_t("firewhirl")["edge"])
	return reach


## How many times as far `o` is dragged.
func pull_k(i: int, o) -> float:
	if z2 != null and z2.f(i) != "":
		return z2.pull_k(i, o)
	match f(i):
		"drift":
			return float(_t("drift")["chilled"]) if o.chill_t > 0.0 else 1.0
		"beckon":
			return float(_t("beckon")["cursed"]) if o.hex_t > 0.0 else 1.0
		"riptide":
			return 1.0 + float(_t("riptide")["each"]) * quick_n(i)
	return 1.0


## What was dragged (`moved`) toward `at` by move `i`.
func pulled(i: int, at: Vector2, moved: Array) -> void:
	if z2 != null:
		z2.pulled(i, at, moved)
	var id := f(i)
	if id == "" or moved.is_empty():
		return
	var r: Dictionary = _r(i)
	match id:
		"maw":
			var T := _t("maw")
			var hit := {}
			for a in moved:
				for o in moved:
					if a == o or hit.has(o) or not is_instance_valid(a) or not is_instance_valid(o) or a.world.distance_to(o.world) > float(T["meet"]) + a.r + o.r:
						continue
					hit[a] = true
					hit[o] = true
					var mid: Vector2 = (a.world + o.world) * 0.5
					_tell({"id": "maw", "what": "crash", "x": mid.x, "y": mid.y, "m": a, "hold": true})
			for o in hit:
				if is_instance_valid(o) and not o.dead:
					o.damage(_avg(i, float(T["crash"])), "phys", false, true, [], false, false, i)
					o.stagger_cd = 0.0
					o.stagger_from(at)
		"sump":
			var T := _t("sump")
			for o in moved:
				if not is_instance_valid(o) or o.dead:
					continue
				var n := 0
				for q in _near(o.world, float(T["near"]), o):
					if q.poison_t > 0.0:
						n += 1
				n = mini(n, int(T["most"]))
				for k in n:
					o.dose(maxf(1.0, h.avg_hit(i, 1.0) * float(r["poison"])), float(Words.data()["poison"]["time"]) * float(r["last"]), "poison")
				if n > 0:
					_tell({"id": "sump", "what": "drip", "n": n, "x": o.world.x, "y": o.world.y, "m": o})
			_tell({"id": "sump", "what": "drain", "x": at.x, "y": at.y})
		"drift":
			var T := _t("drift")
			for a in moved:
				for o in moved:
					if a == o or not is_instance_valid(a) or not is_instance_valid(o) or a.boss or o.boss:
						continue
					if a.chill_t > 0.0 and o.chill_t > 0.0 and a.world.distance_to(o.world) <= float(T["meet"]) + a.r + o.r:
						a.freeze_now()
						o.freeze_now()
						var mid: Vector2 = (a.world + o.world) * 0.5
						_tell({"id": "drift", "what": "crust", "x": mid.x, "y": mid.y})
			for o in moved:
				if is_instance_valid(o) and o.chill_t > 0.0:
					_tell({"id": "drift", "what": "slide", "x": o.world.x, "y": o.world.y, "x1": at.x, "y1": at.y, "m": o})
		"firewhirl":
			for o in moved:
				if is_instance_valid(o) and not o.dead and o.burn_t > 0.0 and not bool(o.m52.get("whirl", false)):
					p._tag(o)
					o.m52["whirl"] = true
					o.burn_dps *= float(_t("firewhirl")["hotter"])
			_tell({"id": "firewhirl", "what": "whirl", "x": at.x, "y": at.y, "r": pull_reach(i, 1.0, false)})
		"gravity":
			for o in moved:
				if is_instance_valid(o) and not o.dead:
					p._tag(o)
					o.m52["gravity"] = true
			_tell({"id": "gravity", "what": "crater", "x": at.x, "y": at.y, "hold": true})
		"horizon":
			var k: float = float(r["still"]) * (1.0 + float(_t("horizon")["more"]))
			for o in moved:
				if is_instance_valid(o):
					_still(o, k)
			_tell({"id": "horizon", "what": "rim", "x": at.x, "y": at.y})
		"reel":
			for o in moved:
				if is_instance_valid(o) and not o.dead:
					_hold(o, float(r["bind"]) * float(_t("reel")["longer"]))
					_tell({"id": "reel", "what": "hook", "x": o.world.x, "y": o.world.y, "x1": at.x, "y1": at.y, "m": o})
		"riptide":
			if quick_n(i) > 0:
				_tell({"id": "riptide", "what": "wave", "x": at.x, "y": at.y, "n": quick_n(i)})
		"beckon":
			for o in moved:
				if is_instance_valid(o) and o.hex_t > 0.0:
					_tell({"id": "beckon", "what": "wisp", "x": o.world.x, "y": o.world.y, "x1": at.x, "y1": at.y, "m": o})
		"maw_", _:
			pass


# --- Splitting in front (city_words.gd split_first) ---

## How many copies a split of move `i` breaks into.
func split_n(i: int, n: int) -> int:
	if z2 != null and z2.f(i) != "":
		return z2.split_n(i, n)
	if f(i) == "scatter":
		return mini(int(_t("scatter")["most"]), n + quick_n(i))
	if _front_has(i, "splitting2"):
		return int(_t("splitting2")["copies"])
	return n


## How many times as strong each copy is.
func split_k(i: int) -> float:
	if z2 != null and z2.f(i) != "":
		return z2.split_k(i)
	if f(i) == "splinter":
		return float(_t("splinter")["k"])
	if _front_has(i, "splitting2"):
		return float(_t("splitting2")["each"])
	return 1.0


## (the city's runes with the floor 6–10 runes: whom the copies fly at, how fast they and the shards fly: meldscity2_rules.gd)
func split_to(i: int, near: Array) -> Array:
	return z2.split_to(i, near) if z2 != null else near


func split_speed(i: int) -> float:
	return z2.split_speed(i) if z2 != null else 1.0


func shard_speed(i: int) -> float:
	return z2.shard_speed(i) if z2 != null else 1.0


## How long the copies hang still before they fly (Constellation).
func split_delay(i: int) -> float:
	return float(_t("constellation")["hang"]) if f(i) == "constellation" else 0.0


## The split of move `i` at `at` begins (its copies flying at `to`).
func split_begun(i: int, at: Vector2, to: Array) -> void:
	_copied[i] = {"use": h.uses[i], "ids": {}, "at": at}
	var id := f(i)
	if id != "":
		_tell({"id": id, "what": "split", "x": at.x, "y": at.y, "to": to, "hang": split_delay(i)})


## A copy (`kind` "copy") or a shard ("shard") of move `i` has struck `o`.
func copy_hit(o, i: int, kind: String) -> void:
	if z2 != null:
		z2.copy_hit(o, i, kind)
	if o == null or not is_instance_valid(o) or o.dead and kind != "copy":
		return
	var id := f(i) if kind == "copy" else b(i)
	var r: Dictionary = _r(i)
	var cp: Dictionary = _copied.get(i, {"ids": {}, "at": h.world})
	var at0: Vector2 = cp["at"]
	if kind == "copy":
		match id:
			"splinter":
				if not o.dead:
					o.throw_from(at0, float(_t("splinter")["shove"]))
				_tell({"id": "splinter", "what": "jolt", "x": o.world.x, "y": o.world.y, "x1": at0.x, "y1": at0.y, "m": o})
			"spore":
				if not o.dead:
					o.dose(maxf(1.0, h.avg_hit(i, 1.0) * float(_t("spore")["dose"]) / 4.0), 4.0, "poison")
				_tell({"id": "spore", "what": "puff", "x": o.world.x, "y": o.world.y, "m": o})
			"sleet":
				if o.frozen_t > 0.0 and not bool(cp.get("again", false)):
					cp["again"] = true
					var near: Array = _near(o.world, float(_C()["split"]["reach"]), o)
					near.sort_custom(func(a, c): return a.world.distance_to(o.world) < c.world.distance_to(o.world))
					near = near.slice(0, int(_t("sleet")["again"]))
					var share: float = float(r["split"]) * split_k(i)
					for q in near:
						var secs: float = maxf(0.06, q.world.distance_to(o.world) / float(_C()["split"]["speed"]))
						_tell({"id": "sleet", "what": "again", "x": o.world.x, "y": o.world.y, "x1": q.world.x, "y1": q.world.y, "secs": secs})
						var qq = q
						h._after(secs, func() -> void: h.city._copy_hit(qq, i, share, "shard"))
				_tell({"id": "sleet", "what": "sliver", "x": o.world.x, "y": o.world.y, "m": o})
			"embers":
				var T := _t("embers")
				for q in _near(o.world, float(T["blast"]), null):
					q.damage(_avg(i, float(T["share"]) * float(r["split"])), "fire", false, false, [], false, false, i)
				_tell({"id": "embers", "what": "burst", "x": o.world.x, "y": o.world.y, "r": float(T["blast"])})
			"fractal":
				var q = _nearest(o.world, 3.5, o)
				if q != null:
					h._tell({"t": "arc", "x0": o.world.x, "y0": o.world.y, "x1": q.world.x, "y1": q.world.y, "meld": "fractal"})
					q.shock_t = maxf(q.shock_t, 1.0)
					q.damage(_avg(i, float(_t("fractal")["arc"]) * float(r["split"])), "lightning", false, false, [], false, false, i)
					_tell({"id": "fractal", "what": "fork", "x": o.world.x, "y": o.world.y, "x1": q.world.x, "y1": q.world.y})
			"rubble":
				if not o.dead:
					o.stagger_cd = 0.0
					o.stagger_from(at0)
				_tell({"id": "rubble", "what": "thud", "x": o.world.x, "y": o.world.y, "m": o})
			"confluence":
				if not o.dead and not o.boss:
					var d: Vector2 = at0 - o.world
					var far: float = minf(float(r["pull"]) if float(r["pull"]) > 0.0 else 1.0, maxf(0.0, d.length() - float(_C()["pull"]["stop"])))
					if far > 0.05:
						h.melds._slide(o, d / d.length() * far, 6)
				_tell({"id": "confluence", "what": "drag", "x": o.world.x, "y": o.world.y, "x1": at0.x, "y1": at0.y, "m": o})
			"coven":
				var twice: bool = cp["ids"].has(o.id)
				_curse(o, float(r["hex"]), float(_C()["hex"]["secs"]) * (float(_t("coven")["longer"]) if twice else 1.0))
				_tell({"id": "coven", "what": "twice" if twice else "mark", "x": o.world.x, "y": o.world.y, "m": o})
			"constellation":
				_still(o, float(r["still"]))
				_tell({"id": "constellation", "what": "star", "x": o.world.x, "y": o.world.y, "m": o})
			"web":
				var twice: bool = cp["ids"].has(o.id)
				_hold(o, float(r["bind"]) * (float(_t("web")["longer"]) if twice else 1.0))
				_tell({"id": "web", "what": "wrap" if twice else "thread", "x": o.world.x, "y": o.world.y, "x1": at0.x, "y1": at0.y, "m": o})
		cp["ids"][o.id] = true
		_copied[i] = cp
	else:
		match id:
			"splinter":
				h._landed_on(i)
				_tell({"id": "splinter", "what": "might", "x": o.world.x, "y": o.world.y})
			"confluence":
				var cf := _t("confluence")
				var mid: Vector2 = cp.get("shards_at", h.world)
				var oo = o
				p._later_do(float(cf["delay"]), func() -> void:
					if not is_instance_valid(oo) or oo.dead:
						return
					oo.damage(_avg(i, float(cf["again"]) * float(r["shards"])), "phys", false, false, [], false, false, i)
					if not oo.boss:
						var d: Vector2 = mid - oo.world
						if d.length() > 0.7:
							h.melds._slide(oo, d / d.length() * minf(1.0, d.length() - 0.6), 6)
					_tell({"id": "confluence", "what": "return", "x": oo.world.x, "y": oo.world.y, "x1": mid.x, "y1": mid.y, "m": oo}))


# --- Splitting behind (city_words.gd throw_shards) ---

func shard_n(i: int, n: int) -> int:
	if z2 != null and z2.b(i) != "":
		return z2.shard_n(i, n)
	return roundi(n * float(_t("splitting2")["shards"])) if _behind_has(i, "splitting2") else n


func shard_reach(i: int) -> float:
	if z2 != null and z2.b(i) != "":
		return z2.shard_reach(i)
	return float(_t("splitting2")["reach"]) if _behind_has(i, "splitting2") else 1.0


## The shards of move `i` fly out from `at`, landing at `lands`.
func shards_begun(i: int, at: Vector2, lands: Array) -> void:
	if z2 != null:
		z2.shards_begun(i, at, lands)
	var cp: Dictionary = _copied.get(i, {"use": -1, "ids": {}, "at": at})
	cp["shards_at"] = at
	_copied[i] = cp
	var id := b(i)
	if id != "":
		_tell({"id": id, "what": "shards", "x": at.x, "y": at.y, "lands": lands})


## A shard of move `i` has come down at `pos`.
func shard_land(i: int, pos: Vector2) -> void:
	if z2 != null:
		z2.shard_land(i, pos)
	var id := b(i)
	if id == "" or h.wakes == null:
		return
	var W = h.wakes
	var r: Dictionary = _r(i)
	var from: int = W.list.size()
	match id:
		"spore":
			var T := _t("spore")
			W.add_cloud(i, pos, float(T["cloud"]), maxf(1.0, h.avg_hit(i, 1.0) * float(T["dose"]) / 4.0), float(T["cloudSecs"]), "spore")
		"sleet":
			var T := _t("sleet")
			W.add_patch(i, "ice", pos, float(T["ice"]), float(T["iceSecs"]), 0.0, "frost", "sleet")
		"embers":
			var T := _t("embers")
			W.add_patch(i, "burn", pos, float(T["burnR"]), float(T["burnSecs"]), maxf(1.0, h.avg_hit(i, 1.0) * 0.15), "fire", "embers")
		"fractal":
			for o in _near(pos, 0.7):
				o.shock_t = maxf(o.shock_t, 1.0)
				o.damage(_avg(i, float(_t("fractal")["bolt"]) * float(r["shards"])), "lightning", false, false, [], false, false, i)
			h._tell({"t": "arc", "x0": pos.x, "y0": pos.y, "x1": pos.x, "y1": pos.y, "sky": true, "meld": "fractal"})
			_tell({"id": "fractal", "what": "bolt", "x": pos.x, "y": pos.y})
		"rubble":
			var T := _t("rubble")
			W.add_cracks(i, pos, float(T["crack"]), float(T["crackSecs"]))
			_tell({"id": "rubble", "what": "chunk", "x": pos.x, "y": pos.y})
		"coven":
			var T := _t("coven")
			var weak: float = float(r["hex_circle"]) if float(r["hex_circle"]) > 0.0 else float(_C()["hex"]["weaker"])
			W.add_zone("hex", i, pos, float(T["circle"]), float(T["circleSecs"]), weak)
		"constellation":
			_stars.append({"at": pos, "t": float(_t("constellation")["stay"]), "i": i})
			_tell({"id": "constellation", "what": "hang", "x": pos.x, "y": pos.y, "secs": float(_t("constellation")["stay"])})
		"web":
			W.add_snare(i, pos, float(r["snare"]) if float(r["snare"]) > 0.0 else float(_C()["bind"]["snareSecs"]))
	for z in W.list.slice(from):
		z["m52"] = id
		if not p._wards.has(z):
			p._wards.append(z)


# --- Binding (city_words.gd bind_monster, wakes.gd _snare) ---

## How long a hold of move `i` on `m` lasts, given Binding's own `secs`.
func bind_secs(i: int, m, secs: float) -> float:
	if z2 != null and z2.f(i) != "":
		return z2.bind_secs(i, m, secs)
	match f(i):
		"lasso":
			return secs * (1.0 + float(_t("lasso")["each"]) * quick_n(i))
		"amber":
			if m.still_t > secs:
				_tell({"id": "amber", "what": "hold", "x": m.world.x, "y": m.world.y, "m": m})
			return maxf(secs, m.still_t) * float(_t("amber")["hold"])
	return secs


## His snare `z` has sprung on `o` (wakes.gd _snare): whether the snare is spent.
func snared(z: Dictionary, o) -> bool:
	if z2 != null:
		var spent = z2.snared(z, o)
		if spent != null:
			return bool(spent)
	var i: int = int(z.get("skill", -1))
	var id: String = str(z.get("m52", ""))
	if i < 0 or i > 2:
		return true
	var at := Vector2(z["x"], z["y"])
	var r: Dictionary = _r(i)
	match id:
		"shackle":
			o.damage(_avg(i, float(_t("shackle")["bite"])), "phys", false, true, [], false, false, i)
			_tell({"id": "shackle", "what": "bite", "x": at.x, "y": at.y, "m": o, "hold": true})
		"strangler":
			for k in 2:
				o.dose(maxf(1.0, h.avg_hit(i, 1.0) * float(_t("strangler")["dose"]) / 4.0), 4.0, "poison")
			_tell({"id": "strangler", "what": "thorns", "x": at.x, "y": at.y, "m": o})
		"icebound":
			var oo = o
			_tell({"id": "icebound", "what": "jaw", "x": at.x, "y": at.y, "m": o})
			p._later_do(float(_t("icebound")["freezeAfter"]), func() -> void:
				if is_instance_valid(oo) and not oo.dead and not oo.boss:
					oo.freeze_now()
					_tell({"id": "icebound", "what": "seal", "x": oo.world.x, "y": oo.world.y, "m": oo}))
		"firetrap":
			var T := _t("firetrap")
			for q in _near(at, float(T["blaze"])):
				q.set_alight(maxf(1.0, h.avg_hit(i, 1.0) * float(T["burn"]) / 3.0), 3.0 * float(r["last"]))
			_tell({"id": "firetrap", "what": "blaze", "x": at.x, "y": at.y, "r": float(T["blaze"]), "hold": true})
		"tether":
			var T := _t("tether")
			for q in _near(at, float(T["bolt"]), o):
				h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": q.world.x, "y1": q.world.y, "meld": "tether"})
				q.shock_t = maxf(q.shock_t, 1.0)
				q.damage(_avg(i, float(T["boltK"])), "lightning", false, false, [], false, false, i)
			_tell({"id": "tether", "what": "burst", "x": at.x, "y": at.y, "r": float(T["bolt"])})
		"anchor":
			o.stagger_cd = 0.0
			o.stagger_from(at)
			_tell({"id": "anchor", "what": "sink", "x": at.x, "y": at.y, "m": o, "hold": true})
		"witchknot":
			_curse(o, float(r["hex"]) if float(r["hex"]) > 0.0 else float(_C()["hex"]["more"]))
			_tell({"id": "witchknot", "what": "tie", "x": at.x, "y": at.y, "m": o})
		"amber":
			_still(o, float(r["bubble"]) if float(r["bubble"]) > 0.0 else float(_C()["still"]["slower"]))
			_tell({"id": "amber", "what": "set", "x": at.x, "y": at.y, "m": o})
		"reel":
			_tell({"id": "reel", "what": "snare", "x": at.x, "y": at.y, "m": o})
		"web", "lasso":
			_tell({"id": id, "what": "snare", "x": at.x, "y": at.y, "m": o})
	# (Binding II behind: its snare catches two)
	if _behind_has(i, "binding2"):
		var left: int = int(z.get("left", int(_t("binding2")["catches"]))) - 1
		z["left"] = left
		_tell({"id": "binding2", "what": "caught", "x": at.x, "y": at.y, "left": left})
		return left <= 0
	return true


# --- what a move leaves ---

func wake(_i: int, _laid: Array, _id: String) -> void:
	pass


## What move `i` left, the city's words' patches and the others alike (hero.gd _wake, after the city's own are laid: wakes.list from
## `from` on): each marked as its meld's, followed (melds52_rules.gd _grounds), and what its meld adds to them.
func wake_city(i: int, from: int) -> void:
	if z2 != null:
		z2.wake_city(i, from)
	var id := b(i)
	if id == "" or h.wakes == null:
		return
	var W = h.wakes
	var laid: Array = W.list.slice(from)
	for z in laid:
		z["m52"] = id
		var k: String = str(z["kind"])
		if id == "gravity" and k == "vortex":
			W.add_cracks(i, Vector2(z["x"], z["y"]), float(z["r"]), float(z["dur"]))
		if k in ["vortex", "hex", "bubble", "snare", "storm", "cracks", "ice", "burn", "venom"] and not p._wards.has(z):
			p._wards.append(z)
	# (Gravity's cracks under its vortex, laid just now)
	for z in W.list.slice(from + laid.size()):
		z["m52"] = id
		if not p._wards.has(z):
			p._wards.append(z)
	_tell({"id": id, "what": "leave", "x": float(laid[0]["x"]) if not laid.is_empty() else h.world.x, "y": float(laid[0]["y"]) if not laid.is_empty() else h.world.y})


## A patch of his city meld at work (melds52_rules.gd _grounds): `tick` every half second.
func ground(z: Dictionary, id: String, at: Vector2, rad: float, tick: bool, dt: float) -> void:
	var i: int = int(z.get("skill", 0))
	var k: String = str(z["kind"])
	var near_end: bool = float(z["t"]) >= float(z["dur"]) - dt * 1.5
	var r: Dictionary = _r(i)
	match id:
		"maw":
			if k == "vortex" and near_end and not z.get("m52_end", false):
				z["m52_end"] = true
				var T := _t("maw")
				var inside: Array = _near(at, rad)
				var n: int = mini(int(T["most"]), inside.size())
				var dmg := _avg(i, float(T["collapse"]) * (1.0 + float(T["per"]) * n))
				for o in inside:
					o.damage(dmg, "phys", false, true, [], false, false, i)
				_tell({"id": "maw", "what": "collapse", "x": at.x, "y": at.y, "r": rad, "n": n, "hold": true})
		"sump":
			if k == "vortex" and tick:
				for o in _near(at, rad):
					o.dose(maxf(1.0, h.avg_hit(i, 1.0) * float(_t("sump")["dose"]) / 4.0), 4.0, "poison")
		"drift":
			if k == "vortex":
				for o in _near(at, rad):
					o.chill_by(0.3)
					if not o.boss and o.world.distance_to(at) <= float(_t("drift")["mid"]) and not z.has("fz_" + str(o.id)):
						z["fz_" + str(o.id)] = true
						o.freeze_now()
						_tell({"id": "drift", "what": "pack", "x": o.world.x, "y": o.world.y, "m": o})
		"firewhirl":
			if k == "vortex" and tick:
				for o in _near(at, rad):
					o.set_alight(maxf(1.0, h.avg_hit(i, 1.0) * float(_t("firewhirl")["burn"]) / 3.0), 3.0)
		"lodestone":
			if k == "vortex" and tick:
				var best = _nearest(at, rad)
				if best != null:
					h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": best.world.x, "y1": best.world.y, "sky": true, "meld": "lodestone"})
					best.shock_t = maxf(best.shock_t, 1.0)
					best.damage(_avg(i, 0.3), "lightning", false, false, [], false, false, i)
		"gravity":
			if k == "vortex":
				z["grav_t"] = float(z.get("grav_t", 0.0)) - dt
				if float(z["grav_t"]) <= 0.0:
					z["grav_t"] = float(_t("gravity")["every"])
					for o in _near(at, rad):
						o.stagger_cd = 0.0
						o.stagger_from(at)
					_tell({"id": "gravity", "what": "pulse", "x": at.x, "y": at.y, "r": rad})
		"beckon":
			if k == "vortex" and tick:
				for o in _near(at, rad):
					_curse(o, float(_C()["hex"]["more"]))
		"horizon":
			if k == "vortex" and tick:
				for o in _near(at, rad):
					_still(o, float(_C()["still"]["slower"]))
		"plague":
			if k == "hex":
				z["pl_t"] = float(z.get("pl_t", 0.0)) - dt
				if float(z["pl_t"]) <= 0.0:
					z["pl_t"] = float(_t("plague")["every"])
					for o in _near(at, rad):
						o.dose(maxf(1.0, h.avg_hit(i, 1.0) * float(_t("plague")["dose"]) / 4.0), 4.0, "poison")
		"hoarfrost":
			if k == "hex" and tick:
				for o in _near(at, rad):
					o.chill_by(float(_t("hoarfrost")["chill"]))
		"brimstone":
			if k == "hex" and tick:
				for o in _near(at, rad):
					o.set_alight(maxf(1.0, h.avg_hit(i, 1.0) * float(_t("brimstone")["burn"]) / 3.0), 3.0)
		"jinx":
			if k == "storm" and tick:
				for o in _near(at, rad):
					if o.hex_t > 0.0:
						h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y, "sky": true, "meld": "jinx"})
						o.damage(_avg(i, 0.3), "lightning", false, false, [], false, false, i)
						break
		"burden":
			if k == "cracks":
				for o in _near(at, rad):
					if o.stagger_t > 0.0 and o.hex_t <= 0.0:
						_curse(o, float(_C()["hex"]["more"]))
		"stasis":
			if k == "bubble" and h.world.distance_to(at) <= rad and h.might_t > 0.0:
				h.might_t = maxf(h.might_t, 0.3)
		"stagnation":
			if k == "bubble":
				z["st_t"] = float(z.get("st_t", 0.0)) - dt
				if float(z["st_t"]) <= 0.0:
					z["st_t"] = float(_t("stagnation")["every"])
					for o in _near(at, rad):
						o.dose(maxf(1.0, h.avg_hit(i, 1.0) * float(_t("stagnation")["dose"]) / 4.0), 4.0, "poison")
		"frostlock":
			if k == "bubble":
				for o in _near(at, rad):
					var key := "in_" + str(o.id)
					z[key] = float(z.get(key, 0.0)) + dt
					if float(z[key]) >= float(_t("frostlock")["stay"]) and not o.boss and o.frozen_t <= 0.0:
						z[key] = -2.0
						o.freeze_now()
						_tell({"id": "frostlock", "what": "ice", "x": o.world.x, "y": o.world.y, "m": o})
		"stormglass":
			if k == "bubble":
				z["sg_t"] = float(z.get("sg_t", 0.0)) - dt
				if float(z["sg_t"]) <= 0.0:
					z["sg_t"] = float(_t("stormglass")["every"])
					for o in _near(at, rad):
						h._tell({"t": "arc", "x0": at.x, "y0": at.y, "x1": o.world.x, "y1": o.world.y, "sky": true, "meld": "stormglass"})
						o.shock_t = maxf(o.shock_t, 1.0)
						o.damage(_avg(i, float(_t("stormglass")["bolt"])), "lightning", false, false, [], false, false, i)
		"standstill":
			if k == "bubble":
				z["ss_t"] = float(z.get("ss_t", 0.0)) - dt
				if float(z["ss_t"]) <= 0.0:
					z["ss_t"] = float(_t("standstill")["every"])
					for o in _near(at, rad):
						o.stagger_cd = 0.0
						o.stagger_from(at)
					_tell({"id": "standstill", "what": "pulse", "x": at.x, "y": at.y, "r": rad})


# --- what goes on ---

func step(dt: float) -> void:
	if not _any_city():
		_stars.clear()
		return
	# (the monsters these have written on: what they wait for)
	for m in p._tagged:
		if not is_instance_valid(m) or m.dead:
			continue
		var mm: Dictionary = m.m52
		# (Stasis: as the slow ends, a quarter of what it took while slowed lands again)
		if mm.has("stasis") and m.still_t <= 0.0:
			var dmg := maxf(1.0, roundf(float(mm["stasis"]) * float(_t("stasis")["again"])))
			var i: int = int(mm.get("stasis_i", 0))
			mm.erase("stasis")
			m.damage(dmg, "phys", false, true, [], false, false, i)
			_tell({"id": "stasis", "what": "snap", "x": m.world.x, "y": m.world.y, "m": m, "hold": true})
		# (Stormglass: its arc hung between the slowed strikes again)
		if mm.has("glass") and m.still_t <= 0.0:
			var g: Dictionary = mm["glass"]
			mm.erase("glass")
			h._tell({"t": "arc", "x0": float(g["x"]), "y0": float(g["y"]), "x1": m.world.x, "y1": m.world.y, "meld": "stormglass"})
			m.shock_t = maxf(m.shock_t, 1.0)
			m.damage(float(g["dmg"]), "lightning", false, false, [], false, false, int(g["i"]))
			_tell({"id": "stormglass", "what": "crack", "x": m.world.x, "y": m.world.y, "x1": float(g["x"]), "y1": float(g["y"])})
		# (Stagnation: the poison does not wear off while the slow holds: its time stands still as long as the slow does)
		if mm.has("stagnation") and m.still_t > 0.0 and m.poison_t > 0.0:
			m.poison_t += dt
			if float(mm.get("stag_told", -99.0)) < p.time - 0.9:
				mm["stag_told"] = p.time
				_tell({"id": "stagnation", "what": "hold", "x": m.world.x, "y": m.world.y, "m": m})
		# (Standstill, Anchor, Gravity: the stunned held, slowed or dragged in, stunned longer; Burden: the stunned cursed longer)
		if m.stun_t > 0.0:
			if not mm.get("stun_long", false):
				var k := 1.0
				if mm.has("standstill") and m.still_t > 0.0:
					k = maxf(k, float(_t("standstill")["longer"]))
				if mm.has("anchor") and m.bind_t > 0.0:
					k = maxf(k, float(_t("anchor")["stun"]))
				if mm.get("gravity", false):
					k = maxf(k, float(_t("gravity")["stun"]))
				if k > 1.0:
					mm["stun_long"] = true
					m.stun_t *= k
					var who: String = "anchor" if mm.has("anchor") and m.bind_t > 0.0 else ("standstill" if mm.has("standstill") else "gravity")
					_tell({"id": who, "what": "stun", "x": m.world.x, "y": m.world.y, "m": m, "secs": m.stun_t})
			if mm.has("burden") and m.hex_t > 0.0 and not mm.get("burden_long", false):
				mm["burden_long"] = true
				m.hex_t *= float(_t("burden")["longer"])
				_tell({"id": "burden", "what": "weight", "x": m.world.x, "y": m.world.y, "m": m})
		else:
			mm.erase("stun_long")
			mm.erase("burden_long")
			mm.erase("gravity")
		# (Strangler: the held poisoned twice as fast)
		if mm.has("strangler") and m.bind_t > 0.0 and m.poison_t > 0.0 and not mm.get("strangled", false):
			mm["strangled"] = true
			m.poison_dps *= float(_t("strangler")["faster"])
			m.poison_t /= float(_t("strangler")["faster"])
			_tell({"id": "strangler", "what": "vines", "x": m.world.x, "y": m.world.y, "m": m})
		if m.bind_t <= 0.0:
			mm.erase("strangled")
	# (Tether: arcs back and forth between the held near each other)
	_tether_t -= dt
	if _tether_t <= 0.0:
		_tether_t = float(_t("tether")["every"])
		var held: Array = []
		for m in p._tagged:
			if is_instance_valid(m) and not m.dead and m.bind_t > 0.0 and m.m52.has("tether"):
				held.append(m)
		var linked := {}
		for a in held:
			for o in p._mons():
				if a == o or not p._alive(o) or o.bind_t <= 0.0 or linked.has([o, a]) or a.world.distance_to(o.world) > float(_t("tether")["near"]):
					continue
				linked[[a, o]] = true
				var i: int = int(a.m52["tether"])
				h._tell({"t": "arc", "x0": a.world.x, "y0": a.world.y, "x1": o.world.x, "y1": o.world.y, "meld": "tether"})
				for q in [a, o]:
					q.shock_t = maxf(q.shock_t, 1.0)
					q.damage(_avg(i, float(_t("tether")["arc"])), "lightning", false, false, [], false, false, i)
				_tell({"id": "tether", "what": "chain", "x": a.world.x, "y": a.world.y, "x1": o.world.x, "y1": o.world.y})
	# (Constellation: the shards hanging in the air slow what touches them)
	for s in _stars:
		s["t"] = float(s["t"]) - dt
		for o in _near(s["at"], float(_t("constellation")["touch"])):
			if o.still_t < 0.5:
				_still(o, float(_C()["still"]["slower"]))
				_tell({"id": "constellation", "what": "touch", "x": o.world.x, "y": o.world.y, "m": o})
	_stars = _stars.filter(func(s): return float(s["t"]) > 0.0)
	# (the bursts of speed of Riptide, Whisper and Lasso behind)
	if h.haste_t > 0.0:
		_pass_t -= dt
		_tug_t -= dt
		for i in 3:
			match b(i):
				"riptide":
					if _tug_t <= 0.0:
						var T := _t("riptide")
						var behind: Vector2 = h.world - h.face.normalized() * 0.9
						for o in _near(h.world, float(T["wake"])):
							if o.boss:
								continue
							var d: Vector2 = behind - o.world
							if d.length() > 0.5:
								h.melds._slide(o, d / d.length() * minf(d.length() - 0.4, float(T["tug"]) * 0.25), 6)
						_tell({"id": "riptide", "what": "wake", "x": h.world.x, "y": h.world.y, "dx": h.face.x, "dy": h.face.y})
				"whisper":
					if _pass_t <= 0.0:
						for o in _near(h.world, float(_t("whisper")["pass"])):
							if o.hex_t <= 0.0:
								_curse(o, float(_C()["hex"]["more"]))
								_tell({"id": "whisper", "what": "pass", "x": o.world.x, "y": o.world.y, "m": o})
				"lasso":
					if _lasso_burst:
						var o = _nearest(h.world, float(_t("lasso")["pass"]))
						if o != null:
							_lasso_burst = false
							_hold(o, float(_r(i)["snare"]) if float(_r(i)["snare"]) > 0.0 else float(_C()["bind"]["snareSecs"]))
							_tell({"id": "lasso", "what": "loop", "x": o.world.x, "y": o.world.y, "x1": h.world.x, "y1": h.world.y, "m": o})
		if _tug_t <= 0.0:
			_tug_t = 0.25
		if _pass_t <= 0.0:
			_pass_t = 0.2


## His pace: Timeslip's bubble.
func pace() -> float:
	for i in 3:
		if b(i) == "timeslip" and h.wakes != null:
			var z = h.wakes.patch_at("bubble", h.world)
			if z != null and int(z.get("skill", -1)) == i:
				return 1.0 + float(_t("timeslip")["haste"])
	return 1.0


func forget() -> void:
	_quick.clear()
	_copied.clear()
	_stars.clear()
	_lasso_burst = false
