## ALL MELDS: THE LEAST EXCITING REDONE, on his moves (his words, 24 Nov 2026: “Next I want you to look at the larger pool of all
## melds, and redo the 20 weakest.  Then do it again.  Then do it a third time.”). Each redone meld keeps all it did (its own rules
## stay where they are: melds.gd, melds52_rules.gd, meldscity_rules.gd, meldscity2_rules.gd) and gains, on each side, a moment seen
## happen: here, as his moves make them; on a monster foe_meldsredo.gd; drawn by fx_m52p_redo.gd. Their texts tools/meldsredo/redo.txt.
## Only with melds52.gd REDO_ON (off until his yes to their films). Called from melds52_rules.gd's own hooks, which every hit, kill,
## use, mark, ground and frame of his goes through. Its helpers are the High City hub's (meldshigh_rules.gd: near, hit, stun, bind,
## curse, throw, drag, ground, tell), none of which waits on that group's switch.
## ROUND 1: Ambush, Berserk, Blight, Bulwark, Canker, Delirium, Doom, Duelist, Eternity, Evil Eye, Fervor, Fever, Fury, Glide,
## Grudge, Haymaker, Hourglass, Lamprey, Lancet, Manacle.
extends RefCounted

const M52 := preload("res://scripts/melds52.gd")

var h
var rules
var _later: Array = []
var _once := {}
## (what each behind left on the ground, as these melds make use of it: {id, at, r, until, i, ...})
var zones: Array = []
## (what goes on over time, each its own list)
var sores: Array = []
var eyes: Array = []
var glasses: Array = []
var latches: Array = []
var bites: Array = []
var drains: Array = []
var chains: Array = []
var rings: Array = []
var embers: Array = []
var fervor_until := -99.0
## (round 2's own: meldsredo2.gd)
var r2


func _init(hero, r) -> void:
	h = hero
	rules = r
	r2 = preload("res://scripts/meldsredo2.gd").new(self, hero)


func _H():
	return h.last.high if h.last != null else null


# --- who has what ---

## His redone meld in front of move `i`, or "".
func f(i: int) -> String:
	if not M52.REDO_ON or i < 0 or i > 2 or h.loadout == null:
		return ""
	var m = h.loadout.r(i).get("meld")
	return str(m) if M52.is_redo(m) else ""


## His redone meld behind move `i`, or "".
func b(i: int) -> String:
	if not M52.REDO_ON or i < 0 or i > 2 or h.loadout == null:
		return ""
	var m = h.loadout.r(i).get("meld_behind")
	return str(m) if M52.is_redo(m) else ""


func any_f(id: String) -> int:
	for i in 3:
		if f(i) == id:
			return i
	return -1


func clock() -> float:
	return _H().clock()


func once(key: String, gap: float) -> bool:
	if clock() - float(_once.get(key, -99.0)) < gap:
		return false
	_once[key] = clock()
	return true


func later(t: float, fn: Callable) -> void:
	_later.append({"t": clock() + t, "fn": fn})


func tell(id: String, what: String, at: Vector2, more := {}) -> void:
	_H().tell(id, what, at, more)


func ok(o) -> bool:
	return _H().ok(o)


func near(at: Vector2, r: float, most := 99, but: Array = []) -> Array:
	return _H().near(at, r, most, but)


func _poison(o, dps: float, secs: float) -> void:
	if not ok(o):
		return
	o.poison_dps = maxf(o.poison_dps if o.poison_t > 0.0 else 0.0, maxf(1.0, dps))
	o.poison_t = maxf(o.poison_t, secs)
	o.poison_n = maxi(o.poison_n, 1)


func _chill(o, secs: float, k: float) -> void:
	if not ok(o):
		return
	o.chill_t = maxf(o.chill_t, secs)
	o.chill = maxf(o.chill, k)


## A drop of its life drawn into him (Lamprey, Lancet): `amount` off it, as much onto him.
func _drink(o, i: int, amount: float, id: String) -> void:
	if not ok(o):
		return
	var a: float = maxf(1.0, roundf(amount))
	o.damage(a, "phys", false, false, [], false, true, i)
	_H().heal_life(a, id)


## Thrown at him from where it stands, to within `stop` of him (a lunge, a charge: a monster's).
static func dash_at(m, to: Vector2, stop: float) -> Vector2:
	var d: Vector2 = to - m.world
	if d.length() <= stop:
		return m.world
	var was: Vector2 = m.world
	m.world = to - d.normalized() * stop
	return was


# --- a use ---

func used(i: int, echo: bool, at := Vector2.INF) -> void:
	if not M52.REDO_ON or _H() == null:
		return
	r2.used(i, echo, at)
	if echo:
		return
	var fi := f(i)
	match fi:
		"glide":
			# (he skates on after it: a trail of ice behind him, chilling what crosses it)
			var a: Vector2 = h.world
			var to: Vector2 = h.world + h.face * 1.4
			_H().haste(1.25, 0.6, "glide")
			tell("glide", "skate", a, {"x1": to.x, "y1": to.y})
			for k in 3:
				later(0.15 * k, func() -> void:
					if _H() != null:
						_H().ground("ice", i, h.world, 0.55, 2.5, h.avg_hit(i, 0.08), "frost"))
		"bulwark":
			# (behind his shield, the use drives its face forward: a wave of force throwing back those before him)
			later(0.06, func() -> void:
				if not rules._shielded():
					return
				var to: Vector2 = h.world + h.face * 2.2
				tell("bulwark", "shove", h.world, {"x1": to.x, "y1": to.y})
				for o in near(h.world, 2.4):
					if (o.world - h.world).normalized().dot(h.face) > 0.25:
						_H().throw(o, h.world, 1.0))
	# (Fervor behind, quickened by a kill: each use throws off sparks that set the nearest burning)
	if b(i) == "fervor" and clock() < fervor_until:
		for o in near(h.world, 3.5, 2):
			o.set_alight(maxf(1.0, h.avg_hit(i, 0.1)), 3.0)
			tell("fervor", "sparks", h.world, {"x1": o.world.x, "y1": o.world.y})


# --- a hit of his ---

func struck(m, i: int, dmg: float, c: bool, at: Vector2) -> void:
	if not M52.REDO_ON or _H() == null or not is_instance_valid(m):
		return
	var H = _H()
	# (poisoned when struck: what its death leaves, Blight's and Fever's, knows it, though death clears it before they look)
	if m.poison_t > 0.0:
		m.m52["rd_pois"] = true
	# (GRUDGE on a monster: struck by him, it remembers: foe_meldsredo.gd harder)
	if m.word_share("grudge") > 0.0 and not m.dead and not m.m52.get("rd_grudged", false):
		m.m52["rd_grudged"] = true
		tell("grudge", "mark", h.world, {"foe": true})
	var fi := f(i)
	var bi := b(i)
	var id_m: int = m.get_instance_id()
	match fi:
		"ambush":
			# (unhurt till now: caught off guard, it reels, and those beside it flinch back)
			if m.life + dmg >= m.max_life - 0.5 and once("amb%d" % id_m, 9.0):
				H.stun(m, 0.7)
				tell("ambush", "reel", m.world)
				for q in near(m.world, 1.4, 4, [m]):
					H.throw(q, m.world, 0.7)
					tell("ambush", "flinch", m.world, {"x1": q.world.x, "y1": q.world.y, "minor": true})
		"berserk":
			if H.frenzy_full() and once("bers", 0.25):
				tell("berserk", "quake", at, {"r": 1.6})
				for q in near(at, 1.6, 6):
					H.throw(q, at, 0.8)
		"canker":
			if m.poison_t > 0.0 and not sores.any(func(s): return s["m"] == m):
				sores.append({"m": m, "next": clock() + 2.0, "i": i})
		"delirium":
			if H.frenzy_full() and m.hex_t > 0.0 and once("del%d" % id_m, 0.8):
				tell("delirium", "mad", m.world)
				for q in near(m.world, 1.4, 3, [m]):
					H.hit(q, i, 0.35)
					tell("delirium", "flail", m.world, {"x1": q.world.x, "y1": q.world.y})
		"doom":
			if m.hex_t > 0.0:
				var n: int = int(m.m52.get("rd_doom", 0)) + 1
				if n >= 3:
					n = 0
					var mm = m
					tell("doom", "hammer", m.world)
					later(0.35, func() -> void:
						if not ok(mm):
							return
						var p: Vector2 = mm.world
						H.hit(mm, i, 1.0)
						for q in near(p, 1.4, 5, [mm]):
							H.hit(q, i, 0.5)
							H.stun(q, 0.3)
						tell("doom", "fall", p, {"r": 1.4}))
				m.m52["rd_doom"] = n
		"duelist":
			var alone: bool = near(m.world, 2.5, 2, [m]).is_empty()
			if alone and not m.dead and once("duel%d" % id_m, 3.0):
				H.bind(m, 1.0)
				tell("duelist", "challenge", m.world)
		"eternity":
			# (its slow, laid by this hit: as it runs out, time stops for it)
			if not m.dead and not m.boss:
				m.m52["rd_etern"] = true
		"evileye":
			if c and m.hex_t > 0.0 and not m.dead:
				var e = eyes.filter(func(x): return x["m"] == m)
				if e.is_empty():
					eyes.append({"m": m, "until": clock() + 3.0, "next": 0.0})
				else:
					e[0]["until"] = clock() + 3.0
				tell("evileye", "open", m.world, {"secs": 3.0})
		"fever":
			if H.frenzy_full() and m.poison_t > 0.0 and once("fev%d" % id_m, 0.7):
				tell("fever", "haze", m.world, {"r": 1.3})
				for q in near(m.world, 1.3, 3, [m]):
					_poison(q, m.poison_dps * 0.5, 3.0)
		"grudge":
			if m.hex_t > 0.0 and not m.dead:
				if m.m52.get("rd_sealed", false):
					var mm = m
					later(0.3, func() -> void:
						if ok(mm):
							H.hit(mm, i, 0.3)
							tell("grudge", "again", mm.world))
				else:
					var n: int = int(m.m52.get("rd_grudge", 0)) + 1
					m.m52["rd_grudge"] = n
					if n >= 3:
						m.m52["rd_sealed"] = true
						tell("grudge", "seal", m.world, {"secs": maxf(2.0, m.hex_t)})
		"haymaker":
			if not m.dead and not m.boss and once("hay%d" % id_m, 0.4):
				var from: Vector2 = h.world
				var way: Vector2 = (m.world - from).normalized() if m.world.distance_to(from) > 0.01 else h.face
				var to: Vector2 = m.world + way * 1.8
				tell("haymaker", "fly", m.world, {"x1": to.x, "y1": to.y})
				H.throw(m, from, 1.8)
				var mm = m
				later(0.25, func() -> void:
					var hit_any := false
					for q in near(to, 1.0, 4, [mm]):
						H.hit(q, i, 0.4)
						H.stun(q, 0.3)
						hit_any = true
					if hit_any:
						tell("haymaker", "crash", to, {"r": 1.0}))
		"hourglass":
			if (m.poison_t > 0.0 or m.burn_t > 0.0) and not m.dead and not glasses.any(func(g): return g["m"] == m):
				glasses.append({"m": m, "at": clock() + 3.0, "i": i})
				tell("hourglass", "turn", m.world, {"secs": 3.0})
		"lamprey":
			if clock() - float(m.m52.get("rd_lam", -9.0)) < 0.6:
				m.m52["rd_lam"] = -9.0
				if not m.dead:
					latches.append({"m": m, "until": clock() + 1.5, "i": i, "next": 0.0})
					tell("lamprey", "latch", m.world, {"x1": h.world.x, "y1": h.world.y})
			else:
				m.m52["rd_lam"] = clock()
		"lancet":
			if c:
				tell("lancet", "lance", m.world, {"x1": h.world.x, "y1": h.world.y})
				if not m.dead:
					h.last.bleed_monster(m, maxf(1.0, h.avg_hit(i, 0.15)), 3.0)
		"manacle":
			if m.bind_t > 0.0 and not m.dead and not chains.any(func(x): return x["m"] == m):
				chains.append({"m": m, "at": m.world, "until": clock() + m.bind_t + 5.0, "next": 0.0})
				tell("manacle", "chain", m.world)
	match bi:
		"blight":
			if m.poison_t > 0.0 and once("blp%d" % id_m, 0.6):
				tell("blight", "puff", m.world, {"r": 1.3})
				for q in near(m.world, 1.3, 3, [m]):
					_poison(q, m.poison_dps * 0.5, 3.0)
		"haymaker":
			if h.might > 0.0 and h.might >= rules.might_most(i) * 0.95 and once("hayc", 1.5):
				tell("haymaker", "crack", at, {"r": 1.8})
				for q in near(at, 1.8):
					H.stun(q, 0.4)
		"lamprey":
			if not m.dead:
				var bt = bites.filter(func(x): return x["m"] == m)
				if bt.is_empty():
					bites.append({"m": m, "until": clock() + 3.0, "i": i, "next": 0.3})
					tell("lamprey", "bite", m.world)
				else:
					bt[0]["until"] = clock() + 3.0
	# (Behind, the marks: Ambush's ring burst by the critical in time; Evil Eye's eye bursting; Lancet's blade driven in)
	if c:
		for k in range(rings.size() - 1, -1, -1):
			var rg: Dictionary = rings[k]
			if rg["kind"] == "ambush" and rg["m"] == m and clock() <= float(rg["until"]):
				rings.remove_at(k)
				tell("ambush", "snap", m.world, {"r": 1.6})
				for q in near(m.world, 1.6, 6, [m]):
					H.hit(q, int(rg["i"]), 0.4)
		if m.m52.get("rd_eye", false):
			m.m52.erase("rd_eye")
			tell("evileye", "burst", m.world, {"r": 2.0})
			for q in near(m.world, 2.0, 8):
				H.curse(q, 4.0, 0.2)
		if m.m52.get("rd_lancet", false) and not m.dead:
			m.m52.erase("rd_lancet")
			drains.append({"m": m, "until": clock() + 3.0, "i": i, "next": 0.0})
			tell("lancet", "drive", m.world)
	r2.struck(m, i, dmg, c, at)


## How much harder his hit lands on `m`, of these.
func more(m, i: int) -> float:
	if not M52.REDO_ON or _H() == null or not is_instance_valid(m):
		return 1.0
	return r2.more(m, i)


# --- a kill of his ---

func killed(m, i: int) -> void:
	if not M52.REDO_ON or _H() == null or i < 0 or i > 2:
		return
	var H = _H()
	var at: Vector2 = m.world
	var was_poisoned: bool = m.poison_t > 0.0 or m.m52.get("rd_pois", false)
	match f(i):
		"blight":
			if was_poisoned:
				tell("blight", "wither", at, {"r": 1.0})
				H.ground("venom", i, at, 1.0, 4.0, h.avg_hit(i, 0.1))
		"fervor":
			tell("fervor", "flare", at, {"r": 1.5})
			for q in near(at, 1.5, 5, [m]):
				q.set_alight(maxf(1.0, h.avg_hit(i, 0.1)), 3.0)
	match b(i):
		"berserk":
			tell("berserk", "roar", h.world, {"r": 2.5})
			for q in near(h.world, 2.5):
				H.throw(q, h.world, 0.9)
		"fervor":
			fervor_until = clock() + 3.0
		"fever":
			if was_poisoned:
				H.frenzy_up(i, 1, "fever")
				tell("fever", "pulse", at, {"x1": h.world.x, "y1": h.world.y})
		"fury":
			embers.append({"at": at, "until": clock() + 6.0, "i": i})
			tell("fury", "ember", at, {"secs": 6.0})
	# (what died in a ground these left behind)
	for z in zones:
		if clock() > float(z["until"]) or at.distance_to(z["at"]) > float(z["r"]):
			continue
		match str(z["id"]):
			"canker":
				tell("canker", "rot", at, {"r": 1.0})
				H.ground("venom", int(z["i"]), at, 1.0, 4.0, h.avg_hit(int(z["i"]), 0.1))
			"delirium":
				tell("delirium", "shriek", at, {"r": 2.2})
				for q in near(at, 2.2):
					H.curse(q, 4.0, 0.15)
			"doom":
				tell("doom", "crush", at, {"r": 1.4})
				for q in near(at, 1.4, 6, [m]):
					H.curse(q, 4.0, 0.15)
					H.stun(q, 0.3)
	r2.killed(m, i, was_poisoned)


# --- Precise behind's marks ---

func marked(m, i: int) -> void:
	if not M52.REDO_ON or _H() == null:
		return
	var secs: float = maxf(0.5, m.mark_t)
	match b(i):
		"ambush":
			rings.append({"kind": "ambush", "m": m, "until": clock() + secs, "i": i})
			tell("ambush", "ring", m.world, {"secs": secs})
		"duelist":
			rings.append({"kind": "duel", "m": m, "r": 2.0, "until": clock() + secs, "i": i})
			tell("duelist", "ring", m.world, {"r": 2.0, "secs": secs})
		"evileye":
			m.m52["rd_eye"] = true
			tell("evileye", "mark", m.world, {"secs": secs})
		"lancet":
			m.m52["rd_lancet"] = true
			tell("lancet", "blade", m.world, {"secs": secs})
	r2.marked(m, i)


# --- what a move behind left on the ground ---

const ZONE_SECS := {"bulwark": 5.0, "canker": 10.0, "delirium": 5.0, "doom": 5.0, "eternity": 8.0, "grudge": 10.0, "hourglass": 3.0,
	"glide": 5.0, "manacle": 10.0,
	"mauler": 10.0, "pin": 10.0, "amber": 10.0, "riposte": 5.0, "timeslip": 6.0, "windward": 5.0, "quickening": 6.0}


func wake(i: int, at: Vector2, rad: float) -> void:
	if not M52.REDO_ON or _H() == null:
		return
	var bi := b(i)
	if not ZONE_SECS.has(bi):
		return
	var r: float = maxf(1.5, rad)
	var z := {"id": bi, "at": at, "r": r, "until": clock() + float(ZONE_SECS[bi]), "i": i, "ang": 0.0, "snapped": false}
	zones.append(z)
	match bi:
		"bulwark":
			tell("bulwark", "wall", at, {"r": r, "secs": ZONE_SECS[bi]})
		"eternity":
			tell("eternity", "clock", at, {"r": r, "secs": ZONE_SECS[bi]})
		"hourglass":
			tell("hourglass", "stand", at, {"secs": ZONE_SECS[bi]})


# --- each frame ---

func step(dt: float) -> void:
	if not M52.REDO_ON or _H() == null:
		_later = []
		return
	var H = _H()
	var now: float = clock()
	for k in range(_later.size() - 1, -1, -1):
		if now >= float(_later[k]["t"]):
			var fn: Callable = _later[k]["fn"]
			_later.remove_at(k)
			fn.call()
	# (the grounds they left)
	for k in range(zones.size() - 1, -1, -1):
		var z: Dictionary = zones[k]
		var at: Vector2 = z["at"]
		var r: float = z["r"]
		if now > float(z["until"]):
			if z["id"] == "hourglass":
				# (its sand run out: the ground flares once more)
				tell("hourglass", "flare", at, {"r": r})
				for q in near(at, r):
					H.hit(q, int(z["i"]), 0.4)
			zones.remove_at(k)
			continue
		match str(z["id"]):
			"bulwark":
				for q in near(at, r + 0.25):
					var d: float = q.world.distance_to(at)
					if d >= r - 0.4 and once("bash%d" % q.get_instance_id(), 0.8):
						H.throw(q, at, r - d + 1.0)
						tell("bulwark", "bash", q.world)
			"eternity":
				z["ang"] = fmod(float(z["ang"]) + 1.4 * dt, TAU)
				var hand := Vector2(cos(z["ang"]), sin(z["ang"]))
				for q in near(at, r):
					var p: Vector2 = q.world - at
					if p.length() < 0.2 or absf(p.normalized().angle_to(hand)) < 0.35:
						if once("hand%d" % q.get_instance_id(), 1.5):
							H.stun(q, 0.5)
							tell("eternity", "stop", q.world)
			"grudge":
				for q in H.list():
					if not ok(q):
						continue
					var d: float = q.world.distance_to(at)
					if d <= r:
						q.m52["rd_gin"] = true
					elif q.m52.get("rd_gin", false) and d <= r + 3.0 and once("gch%d" % q.get_instance_id(), 1.0):
						H.drag(q, at, r * 0.7)
						tell("grudge", "chain", at, {"x1": q.world.x, "y1": q.world.y})
			"glide":
				if h.world.distance_to(at) <= r:
					for q in near(h.world, 0.9):
						if once("asd%d" % q.get_instance_id(), 1.0):
							_chill(q, 2.0, 0.3)
							var side := Vector2(-h.face.y, h.face.x)
							var away: Vector2 = side if (q.world - h.world).dot(side) >= 0.0 else -side
							H.throw(q, q.world - away, 0.8)
							tell("glide", "aside", q.world)
			"manacle":
				if not z["snapped"]:
					var caught: Array = near(at, r).filter(func(q): return q.bind_t > 0.0)
					if not caught.is_empty():
						z["snapped"] = true
						for q in near(at, 2.4):
							H.bind(q, 2.0)
							if not chains.any(func(x): return x["m"] == q):
								chains.append({"m": q, "at": at, "until": now + 4.0, "next": 0.0})
							tell("manacle", "snap", at, {"x1": q.world.x, "y1": q.world.y})
	# (Duelist's ring round the marked; Ambush's closing in)
	for k in range(rings.size() - 1, -1, -1):
		var rg: Dictionary = rings[k]
		var m = rg["m"]
		if now > float(rg["until"]) or not ok(m):
			rings.remove_at(k)
			continue
		if rg["kind"] == "duel":
			for q in near(m.world, float(rg["r"]), 6, [m]):
				if once("out%d" % q.get_instance_id(), 0.6):
					H.throw(q, m.world, float(rg["r"]) - q.world.distance_to(m.world) + 0.6)
					tell("duelist", "out", q.world)
	# (Canker's sores bursting; Evil Eye's stare)
	for k in range(sores.size() - 1, -1, -1):
		var s: Dictionary = sores[k]
		var m = s["m"]
		if not ok(m) or m.poison_t <= 0.0:
			sores.remove_at(k)
			continue
		if now >= float(s["next"]):
			s["next"] = now + 2.0
			tell("canker", "sore", m.world, {"r": 1.3})
			for q in near(m.world, 1.3, 3, [m]):
				_poison(q, m.poison_dps * 0.6, 3.0)
	for k in range(eyes.size() - 1, -1, -1):
		var e: Dictionary = eyes[k]
		var m = e["m"]
		if not ok(m) or now > float(e["until"]):
			eyes.remove_at(k)
			continue
		if now >= float(e["next"]):
			e["next"] = now + 0.5
			for q in near(m.world, 2.0, 6, [m]):
				H.curse(q, 3.0, 0.15)
				tell("evileye", "stare", m.world, {"x1": q.world.x, "y1": q.world.y, "minor": true})
	# (Eternity in front: as the slow it laid runs out, time stops for it a moment)
	for m in H.list():
		if not ok(m) or not m.m52.has("rd_etern"):
			continue
		if m.still_t > 0.0:
			m.m52["rd_slowed"] = true
		elif m.m52.get("rd_slowed", false):
			m.m52.erase("rd_etern")
			m.m52.erase("rd_slowed")
			H.stun(m, 1.2)
			tell("eternity", "stop", m.world, {"secs": 1.2})
	# (Fury in front, at a full frenzy: a red fury round him)
	var fu := any_f("fury")
	if fu >= 0 and H.frenzy_full() and once("fury", 0.5):
		tell("fury", "aura", h.world, {"r": 1.4})
		for q in near(h.world, 1.4):
			H.hit(q, fu, 0.15)
	for k in range(embers.size() - 1, -1, -1):
		var em: Dictionary = embers[k]
		if now > float(em["until"]):
			embers.remove_at(k)
		elif h.world.distance_to(em["at"]) <= 0.7:
			embers.remove_at(k)
			H.frenzy_up(int(em["i"]), 1, "fury")
			tell("fury", "take", em["at"])
	# (Hourglass in front: its sand run out, all that is left strikes at once)
	for k in range(glasses.size() - 1, -1, -1):
		var g: Dictionary = glasses[k]
		var m = g["m"]
		if not ok(m):
			glasses.remove_at(k)
			continue
		if now >= float(g["at"]):
			glasses.remove_at(k)
			var left: float = m.poison_dps * m.poison_t + m.burn_dps * m.burn_t
			tell("hourglass", "fall", m.world)
			if left > 0.0:
				m.poison_t = 0.0
				m.burn_t = 0.0
				m.damage(maxf(1.0, roundf(left)), "phys", false, false, [], false, true, int(g["i"]))
	# (Lamprey's latch and bites, Lancet's driven blade: drops of life drawn into him)
	for lst in [latches, bites, drains]:
		for k in range(lst.size() - 1, -1, -1):
			var l: Dictionary = lst[k]
			var m = l["m"]
			if not ok(m) or now > float(l["until"]):
				lst.remove_at(k)
				continue
			if now >= float(l["next"]):
				var gap: float = 0.3 if lst == latches else (0.6 if lst == bites else 0.5)
				l["next"] = now + gap
				var i: int = int(l["i"])
				_drink(m, i, h.avg_hit(i, 0.05), "lamprey" if lst != drains else "lancet")
				var what: String = "drain" if lst != bites else "drip"
				tell("lamprey" if lst != drains else "lancet", what, m.world, {"x1": h.world.x, "y1": h.world.y, "minor": true})
	# (Manacle's chains: no farther than the chain's length from where it was held)
	r2.step(dt)
	for k in range(chains.size() - 1, -1, -1):
		var ch: Dictionary = chains[k]
		var m = ch["m"]
		if not ok(m) or now > float(ch["until"]):
			chains.remove_at(k)
			continue
		var at: Vector2 = ch["at"]
		if m.world.distance_to(at) > 1.6:
			m.world = at + (m.world - at).normalized() * 1.6
		if now >= float(ch["next"]):
			ch["next"] = now + 0.3
			tell("manacle", "link", at, {"x1": m.world.x, "y1": m.world.y, "minor": true, "secs": 0.35})


## A blow on him (his shield up or not).
func struck_him(src) -> void:
	if not M52.REDO_ON or _H() == null:
		return
	r2.struck_him(src)


func fresh() -> void:
	_later = []
	_once = {}
	zones = []
	sores = []
	eyes = []
	glasses = []
	latches = []
	bites = []
	drains = []
	chains = []
	rings = []
	embers = []
	fervor_until = -99.0
	r2.fresh()
