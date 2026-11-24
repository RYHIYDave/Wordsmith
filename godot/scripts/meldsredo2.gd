## ALL MELDS: THE LEAST EXCITING REDONE, ROUND 2, on his moves (his “Then do it again.”, 24 Nov 2026): Mauler, Momentum, Needle,
## Onrush, Pin, Quickdraw, Quickening, Rapier, Reverb, Riposte, Siphon, Stillpoint, Sunder, Tailwind, Tempo, Timeslip, Transfusion,
## Vendetta, Windward, Amber. Each keeps all it did and gains, on each side, a moment seen happen. A part of meldsredo_rules.gd (`R`,
## its helpers and its switch); on a monster foe_meldsredo.gd; drawn by fx_m52p_redo.gd; their texts tools/meldsredo/redo.txt.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")

var R
var h
var threads: Array = []
var images: Array = []
var pulses: Array = []
var cracks: Array = []
var tempo_n := 0
var tf_n := 0


func _init(hub, hero) -> void:
	R = hub
	h = hero


func _H():
	return R._H()


# --- a use (`echo`: a repeat's, `at` where it lands) ---

func used(i: int, echo: bool, at: Vector2) -> void:
	var H = _H()
	var where: Vector2 = at if at != Vector2.INF else h.world + h.face * 1.2
	if echo:
		match R.b(i):
			"reverb":
				# (the repeat rings out from where it lands, throwing back those near)
				R.tell("reverb", "ring", where, {"r": 1.8})
				for q in R.near(where, 1.8):
					H.throw(q, where, 0.7)
			"tempo":
				if H.frenzy_full():
					R.tell("tempo", "beat", where, {"r": 1.8})
					for q in R.near(where, 1.8):
						H.stun(q, 0.3)
		return
	match R.f(i):
		"onrush":
			if h.haste_t > 0.0:
				# (with speed on him, the use carries him forward in a rush, bowling aside those in his way)
				var from: Vector2 = h.world
				var far := 0.0
				while far + 0.2 <= 1.6 and H.open(from + h.face * (far + 0.2)):
					far += 0.2
				if far >= 0.4:
					var to: Vector2 = from + h.face * far
					R.tell("onrush", "rush", from, {"x1": to.x, "y1": to.y})
					for q in H.on_line(from, h.face, far + 0.4, 0.6):
						var side := Vector2(-h.face.y, h.face.x)
						H.throw(q, q.world - (side if (q.world - from).dot(side) >= 0.0 else -side), 0.9)
					h.world = to
		"quickdraw":
			var rest: float = float(M52.tune("quickdraw").get("rest", 2.0))
			if R.rules.time - float(R.rules.last_use[i]) >= rest:
				# (drawn in a flash: the blow reaches a step farther)
				var to: Vector2 = h.world + h.face * 2.6
				R.tell("quickdraw", "draw", h.world, {"x1": to.x, "y1": to.y})
				for q in H.on_line(h.world, h.face, 2.6, 0.6):
					if q.world.distance_to(h.world) > 1.4:
						H.hit(q, i, 0.6, "", true)
		"quickening":
			if H.frenzy_full():
				R.tell("quickening", "ripple", h.world, {"r": 2.2})
				for q in R.near(h.world, 2.2):
					H.still(q, 2.0, 0.35)
		"timeslip":
			# (he slips a step on through time, an afterimage of him left behind that strikes what it touches)
			var from: Vector2 = h.world
			var to: Vector2 = from + h.face * 1.0
			images.append({"at": from, "until": R.clock() + 1.2, "i": i, "hit": []})
			R.tell("timeslip", "image", from, {"secs": 1.2})
			if H.open(to):
				R.tell("timeslip", "slip", from, {"x1": to.x, "y1": to.y})
				h.world = to


# --- a hit of his (`c` a critical) ---

func struck(m, i: int, dmg: float, c: bool, at: Vector2) -> void:
	var H = _H()
	var id_m: int = m.get_instance_id()
	var fi: String = R.f(i)
	var bi: String = R.b(i)
	match fi:
		"mauler":
			if H.frenzy_full() and m.bind_t > 0.0 and not m.dead and R.once("mau%d" % id_m, 0.8):
				var to: Array = R.near(m.world, 3.5, 1, [m])
				if not to.is_empty():
					var q = to[0]
					R.tell("mauler", "fling", m.world, {"x1": q.world.x, "y1": q.world.y})
					H.drag(m, q.world, 0.5)
					var mm = m
					R.later(0.2, func() -> void:
						H.hit(mm, i, 0.4)
						H.hit(q, i, 0.4))
		"momentum":
			if int(R.rules.momentum) >= int(M52.tune("momentum").get("most", 5)) and R.once("mom", 0.4):
				var to: Vector2 = h.world + h.face * 3.5
				R.tell("momentum", "roll", h.world, {"x1": to.x, "y1": to.y})
				for q in H.on_line(h.world, h.face, 3.5, 0.7):
					H.hit(q, i, 0.3)
		"needle":
			if c and R.once("ndl%d" % id_m, 0.4):
				R.tell("needle", "mist", m.world, {"r": 1.3})
				for q in R.near(m.world, 1.3, 3, [m]):
					R._poison(q, maxf(1.0, m.poison_dps * 0.4), 3.0)
		"pin":
			if c and m.bind_t > 0.0 and not m.m52.get("rd_pinned", false):
				m.m52["rd_pinned"] = true
				m.bind_t = maxf(m.bind_t * 2.0, m.bind_t + 1.0)
				R.tell("pin", "spike", m.world)
		"rapier":
			if c and R.once("rap%d" % id_m, 0.3):
				var way: Vector2 = (m.world - h.world).normalized() if m.world.distance_to(h.world) > 0.01 else h.face
				var to: Vector2 = m.world + way * 2.5
				R.tell("rapier", "thrust", m.world, {"x1": to.x, "y1": to.y})
				for q in H.on_line(m.world, way, 2.5, 0.5, [m]):
					H.hit(q, i, 0.5)
					break
		"reverb":
			if R.once("rev%d" % id_m, 0.25):
				var mm = m
				R.later(0.3, func() -> void:
					var p: Vector2 = mm.world if is_instance_valid(mm) else at
					R.tell("reverb", "echo", p, {"r": 1.3})
					for q in R.near(p, 1.3, 3, [mm]):
						H.hit(q, i, 0.2))
		"siphon":
			if m.poison_t > 0.0 and not m.dead and not threads.any(func(t): return t["m"] == m):
				threads.append({"m": m, "until": R.clock() + minf(6.0, m.poison_t), "i": i, "next": 0.0})
		"stillpoint":
			if c and m.still_t > 0.0 and R.once("stp%d" % id_m, 0.6):
				R.tell("stillpoint", "shards", m.world, {"r": 1.8})
				for q in R.near(m.world, 1.8, 4, [m]):
					H.still(q, 2.0, 0.35)
		"sunder":
			if m.stun_t > 0.0 and not m.dead and R.once("sun%d" % id_m, 1.0):
				m.m52["rd_sunder"] = R.clock() + 3.0
				R.tell("sunder", "plates", m.world)
		"tempo":
			tempo_n += 1
			if tempo_n % 5 == 0:
				R.tell("tempo", "beat", h.world, {"r": 2.0})
				for q in R.near(h.world, 2.0):
					H.hit(q, i, 0.25)
		"transfusion":
			tf_n += 1
			if tf_n % 3 == 0:
				# (the blood drawn gathers over him in a red orb that bursts when full)
				R.tell("transfusion", "orb", h.world, {"r": 1.6})
				H.heal_life(maxf(1.0, h.avg_hit(i, 0.3)), "transfusion")
				for q in R.near(h.world, 1.6):
					H.hit(q, i, 0.3)
		"vendetta":
			if c and not m.dead and not m.m52.get("rd_vend", false):
				m.m52["rd_vend"] = true
				R.tell("vendetta", "sigil", m.world, {"secs": 6.0, "m": m})
		"amber":
			if m.bind_t > 0.0 and not m.dead and not m.m52.has("rd_amber"):
				m.m52["rd_amber"] = i
				R.tell("amber", "seal", m.world, {"secs": m.bind_t, "m": m})
	match bi:
		"momentum":
			if h.might > 0.0 and h.might >= R.rules.might_most(i) * 0.95 and R.once("drum", 2.0):
				R.tell("momentum", "drum", h.world, {"r": 2.2})
				for q in R.near(h.world, 2.2):
					H.stun(q, 0.35)
		"sunder":
			if m.stun_t > 0.0 and R.once("scr%d" % id_m, 1.5):
				cracks.append({"at": m.world, "until": R.clock() + 4.0, "i": i})
				R.tell("sunder", "crack", m.world, {"r": 0.7})
		"vendetta":
			var n: int = int(m.m52.get("rd_vn", 0)) + 1
			m.m52["rd_vn"] = n
			if n % 3 == 0:
				R.tell("vendetta", "slashes", m.world)
	# (behind, the marks: Needle's burst out in needles, Quickdraw's blow glancing on)
	if c:
		if m.m52.get("rd_needle", false):
			m.m52.erase("rd_needle")
			for q in R.near(m.world, 3.0, 3, [m]):
				R._poison(q, maxf(1.0, m.poison_dps * 0.5), 3.0)
				R.tell("needle", "needles", m.world, {"x1": q.world.x, "y1": q.world.y})
		if m.m52.get("rd_qd", false):
			m.m52.erase("rd_qd")
			var to: Array = R.near(m.world, 3.0, 1, [m])
			if not to.is_empty():
				H.hit(to[0], i, 0.5, "", true)
				R.tell("quickdraw", "glance", m.world, {"x1": to[0].world.x, "y1": to[0].world.y})


## How much harder his hit lands on `m`, of these: Sunder's sundered one.
func more(m, _i: int) -> float:
	return 1.25 if R.clock() < float(m.m52.get("rd_sunder", -1.0)) else 1.0


# --- a kill of his ---

func killed(m, i: int, was_poisoned: bool) -> void:
	var H = _H()
	var at: Vector2 = m.world
	if m.m52.get("rd_vend", false):
		# (Vendetta: its death passes the vendetta to the nearest)
		var to: Array = R.near(at, 6.0, 1, [m])
		if not to.is_empty():
			to[0].m52["rd_vend"] = true
			R.tell("vendetta", "pass", at, {"x1": to[0].world.x, "y1": to[0].world.y})
	match R.b(i):
		"rapier":
			if R.clock() - float(m.m52.get("rd_crit_at", -9.0)) < 0.2:
				R.tell("rapier", "flourish", h.world, {"r": 1.8})
				for q in R.near(h.world, 1.8):
					H.hit(q, i, 0.3)
		"siphon":
			if was_poisoned:
				H.heal_life(maxf(1.0, h.avg_hit(i, 0.15)), "siphon")
				R.tell("siphon", "motes", at, {"x1": h.world.x, "y1": h.world.y})
		"transfusion":
			pulses.append({"at": at, "until": R.clock() + 5.0, "i": i, "next": 0.0})
			R.tell("transfusion", "pool", at, {"secs": 5.0, "r": 1.5})
	for z in R.zones:
		if R.clock() > float(z["until"]) or at.distance_to(z["at"]) > float(z["r"]):
			continue
		if str(z["id"]) == "quickening":
			R.tell("quickening", "pulse", z["at"], {"r": z["r"]})
			for q in R.near(z["at"], float(z["r"])):
				H.still(q, 2.0, 0.45)


func marked(m, i: int) -> void:
	var secs: float = maxf(0.5, m.mark_t)
	match R.b(i):
		"needle":
			m.m52["rd_needle"] = true
		"quickdraw":
			m.m52["rd_qd"] = true
		"stillpoint":
			R.rings.append({"kind": "still", "m": m, "r": 1.6, "until": R.clock() + secs, "i": i})
			R.tell("stillpoint", "ring", m.world, {"r": 1.6, "secs": secs, "m": m})


## A blow on him (Riposte's answers).
func struck_him(src) -> void:
	var H = _H()
	if not R.ok(src):
		return
	for i in 3:
		if R.f(i) == "riposte" and R.rules._shielded() and R.once("rip", 0.3):
			H.hit(src, i, 0.5)
			R.tell("riposte", "answer", h.world, {"x1": src.world.x, "y1": src.world.y})
			break
	for z in R.zones:
		if str(z["id"]) == "riposte" and R.clock() <= float(z["until"]) and h.world.distance_to(z["at"]) <= float(z["r"]) and R.once("ripb", 0.3):
			var edge: Vector2 = z["at"] + (src.world - z["at"]).normalized() * float(z["r"])
			H.hit(src, int(z["i"]), 0.4)
			R.tell("riposte", "blade", edge, {"x1": src.world.x, "y1": src.world.y})
			break


# --- each frame ---

func step(_dt: float) -> void:
	var H = _H()
	var now: float = R.clock()
	# (the grounds these left)
	for z in R.zones:
		if now > float(z["until"]):
			continue
		var at: Vector2 = z["at"]
		var r: float = z["r"]
		match str(z["id"]):
			"mauler", "pin", "amber":
				if not z["snapped"]:
					var caught: Array = R.near(at, r).filter(func(q): return q.bind_t > 0.0)
					if not caught.is_empty():
						z["snapped"] = true
						var m = caught[0]
						match str(z["id"]):
							"mauler":
								var free: Array = R.near(m.world, 3.5, 1, caught)
								if not free.is_empty():
									var q = free[0]
									H.drag(q, at, 0.3)
									H.bind(q, 1.0)
									R.tell("mauler", "whip", at, {"x1": q.world.x, "y1": q.world.y})
							"pin":
								H.bind(m, 1.5)
								for q in R.near(m.world, 1.2, 4, [m]):
									H.bind(q, 0.8)
								R.tell("pin", "spike", m.world)
							"amber":
								R.tell("amber", "seal", m.world, {"secs": maxf(1.0, m.bind_t), "m": m})
								for q in R.near(m.world, 1.3, 4, [m]):
									H.still(q, 1.5, 0.4)
									R.tell("amber", "stick", m.world, {"x1": q.world.x, "y1": q.world.y})
			"timeslip":
				if h.world.distance_to(at) <= r and R.once("tsimg", 0.4):
					images.append({"at": h.world, "until": now + 1.0, "i": int(z["i"]), "hit": []})
					R.tell("timeslip", "image", h.world, {"secs": 1.0})
			"windward":
				for q in R.near(at, r + 1.0):
					var d: float = q.world.distance_to(at)
					if d >= r - 0.2 and R.once("wwg%d" % q.get_instance_id(), 1.0):
						H.throw(q, at, 0.6)
						R.tell("windward", "gust", q.world)
	# (Stillpoint's ring of stilled air round the marked)
	for rg in R.rings:
		if rg["kind"] != "still" or now > float(rg["until"]) or not R.ok(rg["m"]):
			continue
		for q in R.near(rg["m"].world, float(rg["r"]), 6, [rg["m"]]):
			if R.once("hush%d" % q.get_instance_id(), 1.0):
				H.still(q, 1.0, 0.3)
				R.tell("stillpoint", "hush", q.world)
	# (Siphon's threads of life; Transfusion's pools)
	for k in range(threads.size() - 1, -1, -1):
		var t: Dictionary = threads[k]
		var m = t["m"]
		if not R.ok(m) or now > float(t["until"]) or m.poison_t <= 0.0:
			threads.remove_at(k)
			continue
		if now >= float(t["next"]):
			t["next"] = now + 0.6
			H.heal_life(maxf(1.0, h.avg_hit(int(t["i"]), 0.03)), "siphon")
			R.tell("siphon", "thread", m.world, {"x1": h.world.x, "y1": h.world.y, "minor": true})
	for k in range(pulses.size() - 1, -1, -1):
		var p: Dictionary = pulses[k]
		if now > float(p["until"]):
			pulses.remove_at(k)
			continue
		if h.world.distance_to(p["at"]) <= 1.5 and now >= float(p["next"]):
			p["next"] = now + 0.5
			H.heal_life(maxf(1.0, h.avg_hit(int(p["i"]), 0.05)), "transfusion")
			R.tell("transfusion", "pulse", p["at"], {"r": 1.5})
	# (Sunder's cracks: those that step on them are stunned too)
	for k in range(cracks.size() - 1, -1, -1):
		var cr: Dictionary = cracks[k]
		if now > float(cr["until"]):
			cracks.remove_at(k)
			continue
		for q in R.near(cr["at"], 0.7):
			if q.stun_t <= 0.0 and R.once("trip%d" % q.get_instance_id(), 1.5):
				H.stun(q, 0.5)
				R.tell("sunder", "trip", q.world)
	# (Timeslip's afterimages strike what they touch)
	for k in range(images.size() - 1, -1, -1):
		var im: Dictionary = images[k]
		if now > float(im["until"]):
			images.remove_at(k)
			continue
		for q in R.near(im["at"], 0.6):
			if not (im["hit"] as Array).has(q):
				im["hit"].append(q)
				H.hit(q, int(im["i"]), 0.3)
	# (Onrush behind, Tailwind, Windward in front: what his speed and his wind do to those near)
	var rush_b := false
	var tail := ""
	var ww := -1
	for i in 3:
		if R.b(i) == "onrush":
			rush_b = true
		if R.f(i) == "tailwind":
			tail = "gust"
		elif R.b(i) == "tailwind" and tail == "":
			tail = "trail"
		if R.f(i) == "windward":
			ww = i
	if rush_b and h.haste_t > 0.0:
		for q in R.near(h.world, 0.8):
			if R.once("bowl%d" % q.get_instance_id(), 0.8):
				var side := Vector2(-h.face.y, h.face.x)
				H.throw(q, q.world - (side if (q.world - h.world).dot(side) >= 0.0 else -side), 1.0)
				R.tell("onrush", "bowl", q.world)
	if tail != "" and h.haste_t > 0.0 and R.once("tail", 0.4):
		for q in R.near(h.world, 2.0):
			if (q.world - h.world).normalized().dot(h.face) < -0.2:
				H.throw(q, h.world, 0.6)
				R.tell("tailwind", tail, h.world, {"x1": q.world.x, "y1": q.world.y})
	if ww >= 0 and R.rules._shielded() and R.once("whirl", 0.4):
		var any := false
		for q in R.near(h.world, 1.3):
			H.throw(q, h.world, 0.7)
			any = true
		if any:
			R.tell("windward", "whirl", h.world, {"r": 1.3})
	# (Amber in front: the hold ended, the amber shatters)
	for m in H.list():
		if R.ok(m) and m.m52.has("rd_amber") and m.bind_t <= 0.0:
			var ai: int = int(m.m52["rd_amber"])
			m.m52.erase("rd_amber")
			R.tell("amber", "shatter", m.world, {"r": 1.4})
			for q in R.near(m.world, 1.4, 5, [m]):
				H.hit(q, ai, 0.35)


func fresh() -> void:
	threads = []
	images = []
	pulses = []
	cracks = []
	tempo_n = 0
	tf_n = 0
