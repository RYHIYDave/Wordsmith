## ALL MELDS: THE LEAST EXCITING REDONE, ROUND 3, on his moves (his “Then do it a third time.”, 24 Nov 2026): Beckon, Bedrock,
## Blink, Bloodcurse, Bloodlust, Bloodtide, Blur, Brimstone, Bullseye, Burden, Cataclysm, Cauterize, Coldblood, Daze, Doubletap,
## Feeding Frenzy, Fetters, Flechette, Fortress, Frostbite. Each keeps all it did and gains, on each side, a moment seen happen. A
## part of meldsredo_rules.gd (`R`, its helpers and its switch); on a monster foe_meldsredo.gd; drawn by fx_m52p_redo.gd; their texts
## tools/meldsredo/redo.txt.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")

var R
var h
var streak_until := -99.0
var streak_i := 0
var streak_hit: Array = []
var blur_until := -99.0
var blur_i := 0
var splash_n := 0
var links: Array = []
var darts: Array = []
var creeps: Array = []
var _pair = null


func _init(hub, hero) -> void:
	R = hub
	h = hero


func _H():
	return R._H()


func _drink(o, i: int, share: float, id: String) -> void:
	R._drink(o, i, h.avg_hit(i, share), id)


# --- a use ---

func used(i: int, echo: bool, _at: Vector2) -> void:
	if echo:
		return
	var H = _H()
	if R.f(i) == "blink":
		# (a streak of light behind him; the enemies he passes through, cut)
		var back: Vector2 = h.world - h.face * 1.4
		R.tell("blink", "streak", back, {"x1": h.world.x, "y1": h.world.y})
		streak_until = R.clock() + 0.6
		streak_i = i
		streak_hit = []
	if R.b(i) == "blink":
		R.later(0.4, func() -> void:
			R.tell("blink", "flash", h.world, {"r": 1.8})
			for q in R.near(h.world, 1.8):
				H.stun(q, 0.3))


# --- a hit of his ---

func struck(m, i: int, _dmg: float, c: bool, at: Vector2) -> void:
	var H = _H()
	var id_m: int = m.get_instance_id()
	var fi: String = R.f(i)
	var bi: String = R.b(i)
	match fi:
		"beckon":
			if not m.dead and R.once("bk%d" % id_m, 0.6):
				# (a hand of shadow reaching out to haul it in; those it is hauled to cursed too)
				R.tell("beckon", "hand", at, {"x1": m.world.x, "y1": m.world.y})
				var mm = m
				R.later(0.3, func() -> void:
					if R.ok(mm):
						for q in R.near(mm.world, 1.2, 4, [mm]):
							H.curse(q, 4.0, 0.15)
							R.tell("beckon", "pass", mm.world, {"x1": q.world.x, "y1": q.world.y, "minor": true}))
		"bedrock":
			if m.stun_t > 0.0 and R.once("bed%d" % id_m, 1.0):
				R.tell("bedrock", "ring", m.world, {"r": 1.3})
				for q in R.near(m.world, 1.3, 4, [m]):
					H.throw(q, m.world, 0.8)
		"bloodcurse":
			if m.hex_t > 0.0 and not m.dead and R.once("bc%d" % id_m, 0.5):
				R.tell("bloodcurse", "drops", m.world, {"x1": h.world.x, "y1": h.world.y})
				_drink(m, i, 0.05, "bloodcurse")
		"bloodlust":
			if h.life >= h.max_life - 0.5 and R.once("bl%d" % id_m, 0.3):
				R.tell("bloodlust", "spray", m.world, {"r": 1.4})
				for q in R.near(m.world, 1.4, 3, [m]):
					H.hit(q, i, 0.25)
		"bloodtide":
			if R.once("bt%d" % id_m, 0.4):
				R.tell("bloodtide", "tide", m.world, {"x1": h.world.x, "y1": h.world.y})
		"bullseye":
			if c and R.once("bull", 0.3):
				R.tell("bullseye", "rings", m.world, {"r": 1.6})
				for q in R.near(m.world, 1.6, 6, [m]):
					H.throw(q, m.world, 0.7)
		"burden":
			if m.stun_t > 0.0 and m.hex_t > 0.0 and not m.dead and not m.m52.has("rd_burden"):
				m.m52["rd_burden"] = i
				R.tell("burden", "weight", m.world, {"secs": m.stun_t, "m": m})
		"cataclysm":
			if R.once("cat", 0.4):
				var all: Array = R.near(at, 2.4)
				if all.size() >= 4:
					R.tell("cataclysm", "split", at, {"r": 2.4})
					for q in all:
						H.throw(q, at, 1.0)
		"coldblood":
			if (m.chill_t > 0.0 or m.frozen_t > 0.0) and R.once("cb%d" % id_m, 0.5):
				R.tell("coldblood", "warmth", m.world, {"x1": h.world.x, "y1": h.world.y})
		"daze":
			if m.stun_t > 0.0 and R.once("dz%d" % id_m, 0.5):
				for q in R.near(m.world, 1.4, 3, [m]):
					H.stun(q, 0.3)
					R.tell("daze", "stars", m.world, {"x1": q.world.x, "y1": q.world.y})
		"doubletap":
			if c:
				if R.clock() - float(m.m52.get("rd_dt", -9.0)) < 0.6:
					m.m52["rd_dt"] = -9.0
					R.tell("doubletap", "double", m.world, {"r": 1.5})
					for q in R.near(m.world, 1.5, 4, [m]):
						H.stun(q, 0.3)
				else:
					m.m52["rd_dt"] = R.clock()
		"feedingfrenzy":
			if H.frenzy_full() and R.once("ff%d" % id_m, 0.4):
				R.tell("feedingfrenzy", "feed", m.world, {"x1": h.world.x, "y1": h.world.y})
		"fetters":
			if m.bind_t > 0.0 and not m.dead and not links.any(func(l): return l["a"] == m or l["b"] == m):
				var to: Array = R.near(m.world, 3.5, 1, [m])
				if not to.is_empty():
					links.append({"a": m, "b": to[0], "until": R.clock() + 5.0, "next": 0.0, "id": "fetters"})
					R.tell("fetters", "cuff", m.world, {"x1": to[0].world.x, "y1": to[0].world.y})
		"fortress":
			if R.rules._shielded() and R.once("ft%d" % id_m, 0.6):
				R.tell("fortress", "slab", m.world, {"r": 1.3})
				for q in R.near(m.world, 1.3, 4, [m]):
					H.stun(q, 0.3)
		"frostbite":
			if m.chill_t > 0.0 and not m.dead:
				m.m52["rd_fb"] = i
	match bi:
		"bloodtide":
			splash_n += 1
			if splash_n % 3 == 0:
				R.tell("bloodtide", "wave", at, {"r": 2.2})
				for q in R.near(at, 2.2):
					H.throw(q, at, 0.8)
		"cataclysm":
			if R.once("cr%d" % id_m, 0.6):
				R.tell("cataclysm", "rock", m.world, {"r": 1.2})
				for q in R.near(m.world, 1.2, 4, [m]):
					H.stun(q, 0.2)
	# (behind, the marks: Bullseye's rings burst, Doubletap's link struck through)
	if c:
		if m.m52.get("rd_bull", false):
			m.m52.erase("rd_bull")
			R.tell("bullseye", "burst", m.world, {"r": 1.4})
			for q in R.near(m.world, 1.4, 4, [m]):
				H.hit(q, i, 0.3)
	for l in links:
		if l["id"] == "tap" and (l["a"] == m or l["b"] == m) and R.clock() <= float(l["until"]) and R.once("tap%d" % id_m, 0.3):
			var other = l["b"] if l["a"] == m else l["a"]
			if R.ok(other):
				H.hit(other, i, 0.4)
				R.tell("doubletap", "echo", m.world, {"x1": other.world.x, "y1": other.world.y})


## A quiet hit of his (a copy's, a splash's): Flechette's copies pin what they strike with a dart.
func quiet_struck(m, i: int) -> void:
	if R.f(i) == "flechette" and R.clock() - float(m.m52.get("copy_at", -9.0)) < 0.1 and not m.dead and R.once("fl%d" % m.get_instance_id(), 0.5):
		_H().bind(m, 0.5)
		R.tell("flechette", "dart", m.world)


# --- a kill of his ---

func killed(m, i: int) -> void:
	var H = _H()
	var at: Vector2 = m.world
	var burning: bool = m.burn_t > 0.0
	match R.f(i):
		"brimstone":
			if burning:
				R.tell("brimstone", "gout", at, {"r": 1.5})
				for q in R.near(at, 1.5, 5, [m]):
					q.set_alight(maxf(1.0, h.avg_hit(i, 0.1)), 3.0)
					H.curse(q, 4.0, 0.15)
		"cauterize":
			if burning:
				R.tell("cauterize", "sear", at, {"x1": h.world.x, "y1": h.world.y})
	match R.b(i):
		"blur":
			blur_until = R.clock() + 2.0
			blur_i = i
		"cauterize":
			if burning:
				R.tell("cauterize", "embers", at, {"r": 1.5})
				for q in R.near(at, 1.5, 4, [m]):
					q.set_alight(maxf(1.0, h.avg_hit(i, 0.08)), 3.0)
		"feedingfrenzy":
			if H.frenzy_full():
				H.heal_life(maxf(1.0, h.avg_hit(i, 0.2)), "feedingfrenzy")
				R.tell("feedingfrenzy", "orb", at, {"x1": h.world.x, "y1": h.world.y})
	for z in R.zones:
		if R.clock() > float(z["until"]) or at.distance_to(z["at"]) > float(z["r"]):
			continue
		if str(z["id"]) == "coldblood":
			R.tell("coldblood", "shatter", at, {"r": 1.4})
			for q in R.near(at, 1.4, 5, [m]):
				R._chill(q, 2.0, 0.3)


func marked(m, i: int) -> void:
	var secs: float = maxf(0.5, m.mark_t)
	match R.b(i):
		"bullseye":
			m.m52["rd_bull"] = true
			R.tell("bullseye", "target", m.world, {"secs": secs, "m": m})
		"doubletap":
			# (two marked at once, linked by a thread of light: the second marked a moment after this one)
			R.later(0.05, func() -> void:
				if not R.ok(m):
					return
				for o in R.near(m.world, 4.0, 6, [m]):
					if o.mark_t > 0.0 and not links.any(func(l): return l["id"] == "tap" and (l["a"] == o or l["b"] == o)):
						links.append({"a": m, "b": o, "until": R.clock() + secs, "next": 0.0, "id": "tap"})
						R.tell("doubletap", "link", m.world, {"x1": o.world.x, "y1": o.world.y, "secs": secs})
						break)


## A life orb taken (Bloodlust behind: a red shockwave).
func orb_taken() -> void:
	var H = _H()
	for i in 3:
		if R.b(i) == "bloodlust":
			R.tell("bloodlust", "wave", h.world, {"r": 2.0})
			for q in R.near(h.world, 2.0):
				H.throw(q, h.world, 0.8)
			break


# --- what a move behind left on the ground ---

func wake(i: int, at: Vector2, _rad: float) -> void:
	match R.b(i):
		"flechette":
			# (a ring of darts stuck in the ground round where it ended)
			for k in 6:
				var p: Vector2 = at + Vector2(1, 0).rotated(TAU * k / 6.0) * 2.0
				darts.append({"at": p, "until": R.clock() + 4.0, "i": i, "hit": []})
			R.tell("flechette", "darts", at, {"r": 2.0, "secs": 4.0})
		"frostbite":
			creeps.append({"at": at, "n": 3, "next": R.clock() + 0.4, "i": i})


# --- each frame ---

func step(_dt: float) -> void:
	var H = _H()
	var now: float = R.clock()
	for z in R.zones:
		if now > float(z["until"]):
			continue
		var at: Vector2 = z["at"]
		var r: float = z["r"]
		var key: String = "z%d" % int(z.get("n", 0))
		match str(z["id"]):
			"beckon":
				for q in R.near(at, 0.8):
					if R.once("hands%d" % q.get_instance_id(), 2.0):
						H.bind(q, 0.8)
						R.tell("beckon", "hands", q.world)
			"bedrock":
				if R.once(key + "stone", 1.5):
					var on: Array = R.near(at, r)
					if not on.is_empty():
						var q = on[randi() % on.size()]
						H.hit(q, int(z["i"]), 0.3)
						H.stun(q, 0.4)
						R.tell("bedrock", "stone", q.world)
			"bloodcurse":
				if R.once(key + "drink", 0.8):
					for q in R.near(at, r, 4):
						_drink(q, int(z["i"]), 0.03, "bloodcurse")
						R.tell("bloodcurse", "thread", q.world, {"x1": h.world.x, "y1": h.world.y, "minor": true})
			"brimstone":
				if R.once(key + "jet", 1.0):
					var on: Array = R.near(at, r)
					var p: Vector2 = on[randi() % on.size()].world if not on.is_empty() else at + Vector2(randf_range(-r, r), randf_range(-r, r)) * 0.6
					R.tell("brimstone", "jet", p, {"r": 0.6})
					for q in R.near(p, 0.6):
						q.set_alight(maxf(1.0, h.avg_hit(int(z["i"]), 0.1)), 3.0)
						H.hit(q, int(z["i"]), 0.2)
			"burden":
				for q in R.near(at, r):
					if q.hex_t > 0.0 and R.once("bchain%d" % q.get_instance_id(), 2.0):
						H.bind(q, 0.8)
						R.tell("burden", "chains", q.world)
			"daze":
				if R.once(key + "jolt", 0.8):
					var on: Array = R.near(at, r)
					if not on.is_empty():
						var q = on[randi() % on.size()]
						H.stun(q, 0.2)
						R.tell("daze", "jolt", q.world)
			"fetters":
				if not z["snapped"]:
					var caught: Array = R.near(at, r).filter(func(q): return q.bind_t > 0.0)
					if not caught.is_empty():
						z["snapped"] = true
						var m = caught[0]
						var to: Array = R.near(m.world, 3.5, 1, [m])
						if not to.is_empty():
							links.append({"a": m, "b": to[0], "until": now + 5.0, "next": 0.0, "id": "fetters"})
							R.tell("fetters", "cuff", m.world, {"x1": to[0].world.x, "y1": to[0].world.y})
			"fortress":
				for q in R.near(at, r):
					if R.once("tower%d" % q.get_instance_id(), 2.0):
						H.hit(q, int(z["i"]), 0.3)
						R.tell("fortress", "stone", at, {"x1": q.world.x, "y1": q.world.y})
	# (Blink's streak; Blur's afterimages, and its blur behind)
	if now < streak_until:
		for q in R.near(h.world, 0.8):
			if not streak_hit.has(q):
				streak_hit.append(q)
				H.hit(q, streak_i, 0.35)
				R.tell("blink", "cut", q.world)
	for i in 3:
		if R.f(i) == "blur" and H.frenzy_full() and R.once("blur", 0.3):
			R.r2.images.append({"at": h.world, "until": now + 0.6, "i": i, "hit": []})
			R.tell("blur", "blur", h.world, {"secs": 0.6})
	if now < blur_until:
		for q in R.near(h.world, 1.2):
			if R.once("bp%d" % q.get_instance_id(), 0.8):
				H.hit(q, blur_i, 0.25)
				R.tell("blur", "pass", q.world)
	# (Fetters' chains; Doubletap's link)
	for k in range(links.size() - 1, -1, -1):
		var l: Dictionary = links[k]
		var a = l["a"]
		var b2 = l["b"]
		if now > float(l["until"]) or not R.ok(a) or not R.ok(b2):
			links.remove_at(k)
			continue
		if l["id"] == "fetters":
			var mid: Vector2 = (a.world + b2.world) * 0.5
			if a.world.distance_to(b2.world) > 2.0:
				a.world = mid + (a.world - mid).normalized() * 1.0
				b2.world = mid + (b2.world - mid).normalized() * 1.0
			if now >= float(l["next"]):
				l["next"] = now + 0.3
				R.tell("fetters", "link", a.world, {"x1": b2.world.x, "y1": b2.world.y, "minor": true, "secs": 0.35})
	# (Flechette's ring of darts)
	for k in range(darts.size() - 1, -1, -1):
		var d: Dictionary = darts[k]
		if now > float(d["until"]):
			darts.remove_at(k)
			continue
		for q in R.near(d["at"], 0.4):
			if not (d["hit"] as Array).has(q):
				d["hit"].append(q)
				H.hit(q, int(d["i"]), 0.2)
	# (Frostbite behind: black frost creeping toward the nearest)
	for k in range(creeps.size() - 1, -1, -1):
		var cr: Dictionary = creeps[k]
		if now < float(cr["next"]):
			continue
		var to: Array = R.near(cr["at"], 6.0, 1)
		if to.is_empty() or int(cr["n"]) <= 0:
			creeps.remove_at(k)
			continue
		var p: Vector2 = cr["at"] + (to[0].world - cr["at"]).normalized() * minf(1.0, cr["at"].distance_to(to[0].world))
		H.ground("ice", int(cr["i"]), p, 0.6, 3.0, h.avg_hit(int(cr["i"]), 0.05), "frost")
		R.tell("frostbite", "creep", cr["at"], {"x1": p.x, "y1": p.y})
		cr["at"] = p
		cr["n"] = int(cr["n"]) - 1
		cr["next"] = now + 0.5
	# (Burden: the stun ended, the weight falls away with a crash; Frostbite: the chill worn off, the frost cracks away)
	for m in H.list():
		if not R.ok(m):
			continue
		if m.m52.has("rd_burden") and m.stun_t <= 0.0:
			m.m52.erase("rd_burden")
			R.tell("burden", "crash", m.world, {"r": 1.3})
			for q in R.near(m.world, 1.3, 4, [m]):
				H.stun(q, 0.4)
		if m.m52.has("rd_fb") and m.chill_t <= 0.0 and m.frozen_t <= 0.0:
			m.m52.erase("rd_fb")
			R.tell("frostbite", "burst", m.world, {"r": 1.4})
			for q in R.near(m.world, 1.4, 5, [m]):
				R._chill(q, 2.0, 0.3)


func fresh() -> void:
	streak_until = -99.0
	streak_hit = []
	blur_until = -99.0
	splash_n = 0
	links = []
	darts = []
	creeps = []
	_pair = null
