## FLOOR 18'S BOSS: THE QUEEN (the Mirror Hall), as the game fights her (game/act1_rules/gqueen.ts; art/queen_moves.ts, queen_fx.ts;
## render/act1_fx/gqueen.ts). His picks: how she moves, “Cold and slow, then sudden (Recommended)”, and “Yes, that's the Queen
## (Recommended)”; her fifth, the ring of mirrors, at his word of 30 Oct 2026. His doc: "Her mirror hangs at the end of the hall and
## talks to her the whole fight."
##   SHE GLIDES at 2 tiles a second, cold and slow; what she does with glass is sudden.
##   THE COMB (her basic, 1.5 s, within 2.7): its reach marked; the stab at 0.8 s, whoever is before her within 2.9 (0.6 radians either
##     side) struck, and her POISON left 2.54 tiles out, 1.5 round, 2.2 s, biting whoever stands in it every half second (x0.22); the
##     stab carries her on 1.6 tiles.
##   LOOKING GLASS (every 8 s, the first after 5): into a glass beside her; out of one 3.4 tiles behind him (the way he does not face),
##     facing him, her comb up, and the stab as she comes out (within 1.9, 0.8 radians either side), x1.3.
##   REFLECTIONS (every 12 s, the first after 7): copies of him step out of her hall's awake pier glasses, one each phase, no more
##     than four about her at once (act3/reflection.gd).
##   SHATTER (every 15 s, the first after 11; 2.5 s): every pier glass trembles and the lane of floor before it lights; at 41/30 s
##     they burst at once, their glass flying straight across the hall in its lane: whoever is in a lane struck, x1.6.
##   THE RING OF MIRRORS (every 22 s, the first after 14): into a glass, and six mirrors rise round him, 9 tiles across, her in every
##     one; each breaks at three of his blows (no more than one in 0.3 s), its bar of life over it; the one she is in, broken, throws
##     her out STUNNED (3 s, taking half again from everything) and the rest burst harmlessly; if 11 s run out first, every mirror still
##     whole hurls its glass at him (x0.45 each) and she steps out of hers.
##   HER PHASES at two thirds and a third: another glass awake, her waits shorter (x0.8, x0.65).
##   HER MIRROR speaks to her through the fight, only what she wants to hear; as she dies it cracks across and tells the truth.
## Her hall, her poison, the ring: act3/marks18.gd (gqueen:hall, gqueen:cloud, gqueen:ring).
extends "res://scripts/act3/hc.gd"

const TILE3 := 39.191835884530846
const COMB := {"warn": [0.36, 0.7], "strike": 0.7333333333333333, "hit": 0.8, "reach": 2.9, "half": 0.6, "at": 2.54, "lunge": 62.70693741524936 / 39.191835884530846}
const CLOUD := {"r": 1.5, "long": 2.2, "every": 0.5, "bite": 0.22}
const GLASS := {"behind": 3.4, "reach": 1.9, "half": 0.8}
const QN_IN := {"long": 1.4, "warn": [0.46, 0.767], "hit": 0.8666666666666667}
const QN_OUT := {"long": 1.5, "warn": [0.38, 0.6], "strike": 0.6, "hit": 0.6666666666666666}
const SHATTER := {"warn": [0.5, 1.267], "hit": 1.3666666666666667, "half": 29.0 / 39.191835884530846 + 0.15, "cross": 0.25}
const RING := {"n": 6, "r": 4.5, "long": 11.0, "warn": 2.5, "each": 0.45, "fly": 0.55, "hit": 0.8, "stun": 3.0, "more": 0.5, "life": 3, "gap": 0.3}
const CD := [1.0, 0.8, 0.65]
const TALK := {"every": 13.0, "first": 4.0, "secs": 3.2, "lift": 74.0, "near": 5.0}
const MOST := 4
## (MIRROR_SAYS: the Grimms' looking-glass, in Margaret Hunt's translation of 1884, and the main chat's in its voice)
const SAYS := ["Thou, O Queen, art the fairest of all!", "None in this land is fairer than thou.", "Fairest of all. Fairest of all.", "Thou art the fairest. Strike him down."]
const TRUTH := "The king is dying. Something sits on his chest."
const RING_SAYS := "None shall find thee, my Queen."
## (the hall's pier glasses that wake, in order; the lanes of Shatter along the hall, tiles; the hall's half-depth, her lengths)
const AWAKE_ORDER := [4, 8, 0]
const HALL_AT := [-7.5, -4.5, -1.5, 1.5, 4.5, 7.5]
const ARENA_B := 333.1306050185122
## (HALL_MIRRORS: each pier glass's foot, her lengths along the hall and across it, and the side of the hall it stands on)
const HALL_MIRRORS := [[-293.93876913398134, 206.62804118628145, 1], [-293.93876913398134, -206.62804118628145, -1], [-176.36326148038881, 283.7780002579062, 1],
	[-176.36326148038881, -283.7780002579062, -1], [-58.78775382679627, 315.6444216825097, 1], [-58.78775382679627, -315.6444216825097, -1],
	[58.78775382679627, 315.6444216825097, 1], [58.78775382679627, -315.6444216825097, -1], [176.36326148038881, 283.7780002579062, 1],
	[176.36326148038881, -283.7780002579062, -1], [293.93876913398134, 206.62804118628145, 1], [293.93876913398134, -206.62804118628145, -1]]
const GAIT := {"pace": 2.0, "cycle": 16.0 / 12.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.2, "slack": 0.5, "trueBack": true}
const ACTS := [
	{"id": "gqueen:comb", "clip": "attack", "long": 1.5, "hit": 0.8, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 2.7},
	{"id": "gqueen:glass", "clip": "glassIn", "long": 1.4, "hit": 0.8666666666666667, "dmg": 1.3, "cooldown": 8.0, "first": 5.0, "after": 0.0, "near": 0.0, "far": 14.0},
	{"id": "gqueen:reflect", "clip": "reflect", "long": 1.8, "hit": 1.0, "dmg": 0.0, "cooldown": 12.0, "first": 7.0, "after": 0.4, "near": 0.0, "far": 30.0},
	{"id": "gqueen:shatter", "clip": "shatter", "long": 2.5, "hit": 1.3666666666666667, "dmg": 1.6, "cooldown": 15.0, "first": 11.0, "after": 0.6, "near": 0.0, "far": 30.0},
	{"id": "gqueen:ring", "clip": "glassIn", "long": 1.4, "hit": 0.8666666666666667, "dmg": 0.45, "cooldown": 22.0, "first": 14.0, "after": 0.0, "near": 0.0, "far": 14.0},
	{"id": "gqueen:out", "clip": "glassOut", "long": 1.5, "hit": 0.6666666666666666, "dmg": 1.3, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 999.0, "forced": true},
	{"id": "gqueen:inring", "clip": "glassIn", "long": 11.0 + 0.55 + 0.2, "hit": 11.0, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 999.0, "forced": true},
	{"id": "gqueen:stunned", "clip": "reel", "long": 3.0, "hit": 0.05, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.3, "near": 0.0, "far": 999.0, "forced": true},
]
const OUT_I := 5
const INRING_I := 6
const STUN_I := 7


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func _id() -> String:
	return str(ACTS[act["i"]]["id"]) if act != null else ""


## Her phase: 0 above two thirds of her life, 1 above a third, 2 below.
static func phase_of(m) -> int:
	var f: float = m.life / maxf(1.0, m.max_life)
	return 0 if f > 2.0 / 3.0 else (1 if f > 1.0 / 3.0 else 2)


## The hall's own frame (world): its middle, `u` along it, `v` across it as the art's y (away from the eye); {} off her floor.
static func hall_frame(main) -> Dictionary:
	if main == null or main.map == null or main.map.land == null or main.map.land.get("gallery") == null:
		return {}
	var H = main.map.land["gallery"].get("hall")
	if H == null:
		return {}
	var along: bool = H["alongX"]
	return {"x": float(H["x"]), "y": float(H["y"]), "u": Vector2(1, 0) if along else Vector2(0, 1), "v": Vector2(0, -1) if along else Vector2(-1, 0),
		"along_x": along, "mirror": Vector2(float(H["mirror"]["x"]), float(H["mirror"]["y"]))}


## A point of the art's hall (her lengths: along, across) on the floor.
static func hall_at(F: Dictionary, a: float, b: float) -> Vector2:
	var u: Vector2 = F["u"]
	var v: Vector2 = F["v"]
	return Vector2(F["x"], F["y"]) + (u * a + v * b) / TILE3


## Pier glass `i` of the hall: its foot, the way its glass faces (into the hall).
static func pier_glass(F: Dictionary, i: int) -> Array:
	var q: Array = HALL_MIRRORS[i]
	var v: Vector2 = F["v"]
	return [hall_at(F, q[0], q[1]), -v * float(q[2])]


## Is `p` in one of Shatter's lanes (across the hall before each pier glass)?
static func in_lane(F: Dictionary, p: Vector2) -> bool:
	var u: Vector2 = F["u"]
	var along := (p - Vector2(F["x"], F["y"])).dot(u)
	for a in HALL_AT:
		if absf(along - float(a)) <= float(SHATTER["half"]):
			return true
	return false


## The ring of mirrors' places round where he stood as it rose (its mark's x, y), turned by its (fx, fy), drawn in where that is not
## open floor.
static func ring_spots(map, p: Dictionary) -> Array:
	var a0 := atan2(float(p["fy"]), float(p["fx"]))
	var c := Vector2(p["x"], p["y"])
	var out: Array = []
	for i in int(RING["n"]):
		var a := a0 + i * TAU / float(RING["n"])
		var put := false
		for r in [float(RING["r"]), float(RING["r"]) - 0.8, float(RING["r"]) - 1.5]:
			var q: Vector2 = c + Vector2(cos(a), sin(a)) * float(r)
			if map.walkable(floori(q.x), floori(q.y)):
				out.append(q)
				put = true
				break
		if not put:
			out.append(c + Vector2(cos(a), sin(a)) * (float(RING["r"]) - 1.5))
	return out


func _now(m) -> float:
	return m.mgr.perils._clock


## Her hall's mark (its glasses and her mirror: act3/marks18.gd): `a` awake, `b` Shatter's start (the clock; -1 none), `c` her mirror's
## mode (0 still, 1 speaking, 2 truth), `d` since when.
static func hall_of(m) -> Dictionary:
	for p in m.mgr.perils.list:
		if str(p.get("a1", "")) == "gqueen:hall":
			return p
	return {}


func _hall(m) -> void:
	if m.mgr == null or m.mgr.perils == null or not hall_of(m).is_empty() or hall_frame(m.mgr.main).is_empty():
		return
	var F := hall_frame(m.mgr.main)
	peril(m, "gqueen:hall", Vector2(F["x"], F["y"]), {"dur": 1e9, "dmg": 0.0, "a": 0, "b": -1.0, "c": 0, "d": 0.0})


## (every frame she is shown, asleep or fighting: her hall's glasses and her mirror there before the fight and after it)
func shown(m) -> Dictionary:
	_hall(m)
	# (gone into her glass, in the ring: none of her)
	if _id() == "gqueen:inring" and m.art.has("glassIn"):
		return {"list": "glassIn", "i": m.art.count(0, "glassIn") - 1}
	return {}


## Her mirror says a line: over it, or, where it is further off him than the screen holds, toward it from him.
func say(m, text: String, secs := float(TALK["secs"])) -> void:
	var P := hall_of(m)
	if P.is_empty():
		return
	if int(P["c"]) != 2:
		P["c"] = 1
		P["d"] = _now(m)
	var F := hall_frame(m.mgr.main)
	var h: Vector2 = m.mgr.hero.world
	var mir: Vector2 = F["mirror"]
	var d := h.distance_to(mir)
	var near: float = TALK["near"]
	P["say"] = text
	P["say_t"] = secs
	P["say_secs"] = secs
	P["say_at"] = mir if d <= near else h + (mir - h) / d * near
	P["say_lift"] = float(TALK["lift"]) if d <= near else 40.0


func tick(m, dt: float, _dist: float, _hero) -> bool:
	_hall(m)
	var ph := phase_of(m)
	# (her waits shorter each phase)
	if ph > 0 and cds.size() == ACTS.size():
		for i in range(1, cds.size()):
			cds[i] = float(cds[i]) - dt * (1.0 / float(CD[ph]) - 1.0)
	# (another glass wakes each phase; her mirror speaks as it does, and now and then between)
	var P := hall_of(m)
	if not P.is_empty():
		if int(P["a"]) != ph + 1:
			P["a"] = ph + 1
			if ph > 0:
				say(m, SAYS[ph % SAYS.size()])
		a1["talk"] = float(a1.get("talk", TALK["first"])) - dt
		if float(a1["talk"]) <= 0.0:
			a1["talk"] = TALK["every"]
			a1["said"] = (int(a1.get("said", -1)) + 1) % SAYS.size()
			say(m, SAYS[int(a1["said"])])
		if int(P["c"]) == 1 and _now(m) - float(P["d"]) > float(TALK["secs"]) + 0.6:
			P["c"] = 0
	return false


func forced(_m) -> int:
	if int(a1.get("stun", 0)) == 1:
		return STUN_I
	if int(a1.get("inring", 0)) == 1:
		return INRING_I
	if int(a1.get("out", 0)) == 1:
		return OUT_I
	return -1


func reachable(_m) -> bool:
	# (gone into her glass: in the ring, nothing reaches her but the blow that breaks her mirror)
	var id := _id()
	return not ((id == "gqueen:ring" and float(act["t"]) >= float(QN_IN["hit"])) or id == "gqueen:inring")


func start(m, a: Dictionary, _hero) -> void:
	a1["struck"] = 0
	match str(a["id"]):
		"gqueen:out":
			a1["out"] = 2
			warn(m, "gqueen:out", float(QN_OUT["warn"][0]) - 0.2, QN_OUT["hit"], [], [[-float(GLASS["half"]), GLASS["half"], GLASS["reach"]]])
		"gqueen:inring":
			a1["inring"] = 2
		"gqueen:stunned":
			a1["stun"] = 2
			m.hex_t = RING["stun"]
			m.hex_more = RING["more"]
		"gqueen:shatter":
			var P := hall_of(m)
			if not P.is_empty():
				P["b"] = _now(m)
		"gqueen:comb":
			warn(m, "gqueen:comb", float(COMB["warn"][0]) - 0.2, COMB["hit"], [], [[-float(COMB["half"]), COMB["half"], COMB["reach"]]])


func end(m, a: Dictionary, hero) -> void:
	match str(a["id"]):
		"gqueen:comb":
			# (the stab carries her on: where the art's move ends, so far as the floor lets her)
			var L: float = COMB["lunge"]
			var n := ceili(L / 0.1)
			for i in n:
				var q: Vector2 = m.world + m.face * (L / n)
				if not m.mgr.map.walkable(floori(q.x), floori(q.y)):
					break
				m.world = q
		"gqueen:glass":
			# (out of a glass behind him, the way he does not face, facing him; else beside him; on open floor)
			var h: Vector2 = hero.world
			var hf: Vector2 = hero.face.normalized() if hero.face.length() > 0.0 else Vector2(1, 0)
			var me: Vector2 = (m.world - h).normalized() if m.world.distance_to(h) > 0.0 else Vector2(1, 0)
			for w in [-hf, Vector2(-hf.y, hf.x), Vector2(hf.y, -hf.x), me]:
				var q: Vector2 = h + w * float(GLASS["behind"])
				if not m.mgr.map.walkable(floori(q.x), floori(q.y)):
					continue
				m.world = q
				m.face = (h - q).normalized()
				break
			a1["out"] = 1
		"gqueen:out":
			a1["out"] = 0
		"gqueen:stunned":
			a1["stun"] = 0
		"gqueen:ring":
			# (the ring rises round him, her in every glass; she is in one of them)
			var turn := randf_range(0.0, TAU)
			var p := peril(m, "gqueen:ring", hero.world, {"dur": float(RING["long"]) + float(RING["fly"]) + 0.8, "dmg": m._roll() * float(RING["each"]),
				"a": randi() % int(RING["n"]), "b": 0, "c": 0, "d": 0.0, "left": [3, 3, 3, 3, 3, 3], "last": [-9.0, -9.0, -9.0, -9.0, -9.0, -9.0]})
			p["fx"] = cos(turn)
			p["fy"] = sin(turn)
			m.world = ring_spots(m.mgr.map, p)[int(p["a"])]
			a1["found"] = 0
			a1["inring"] = 1
			say(m, RING_SAYS)
		"gqueen:inring":
			a1["inring"] = 0
			# (not found: she steps out of her glass, facing him)
			if int(a1.get("found", 0)) == 0:
				var to: Vector2 = hero.world - m.world
				if to.length() > 0.0:
					m.face = to.normalized()
				a1["out"] = 1


## Found in the ring: thrown out of her glass, stunned (act3/marks18.gd, as the blow breaks it).
func found(m, at: Vector2, hero) -> void:
	a1["found"] = 1
	a1["stun"] = 1
	m.world = at
	var to: Vector2 = hero.world - at
	if to.length() > 0.0:
		m.face = to.normalized()
	if _id() == "gqueen:inring":
		act["t"] = float(ACTS[INRING_I]["long"])


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var r := rel(m, hero)
	var d := r.length()
	match str(a["id"]):
		"gqueen:comb":
			if crossed(t0, t1, COMB["strike"]):
				sound(m, "swing", 0.6)
			if crossed(t0, t1, a["hit"]):
				sound(m, "shatter", 0.35)
				if d <= float(COMB["reach"]) and absf(atan2(r.y, r.x)) <= float(COMB["half"]) and open_to(hero):
					blow(m, hero, float(a["dmg"]))
				# (her poison where its teeth struck)
				peril(m, "gqueen:cloud", m.world + m.face * float(COMB["at"]), {"dur": CLOUD["long"], "dmg": m._roll() * float(CLOUD["bite"]), "a": 0.0})
		"gqueen:glass":
			if crossed(t0, t1, QN_IN["hit"]):
				sound(m, "shatter", 0.4)
		"gqueen:out":
			if crossed(t0, t1, QN_OUT["strike"]):
				sound(m, "shatter", 0.5)
			if crossed(t0, t1, a["hit"]) and int(a1.get("struck", 0)) == 0:
				a1["struck"] = 1
				if d <= float(GLASS["reach"]) and absf(atan2(r.y, r.x)) <= float(GLASS["half"]) and open_to(hero):
					blow(m, hero, float(a["dmg"]))
		"gqueen:reflect":
			if not crossed(t0, t1, a["hit"]):
				return
			sound(m, "shatter", 0.5)
			var F := hall_frame(m.mgr.main)
			if F.is_empty():
				return
			var live := 0
			for o in m.mgr.list:
				if is_instance_valid(o) and not o.dead and o.kind == "reflection":
					live += 1
			var n := mini(phase_of(m) + 1, MOST - live)
			for i in n:
				var g := pier_glass(F, AWAKE_ORDER[i])
				var c = m.mgr.call_up("reflection", g[0] + g[1] * 0.85, m.pack_id, g[1])
				if c == null:
					continue
				c.h2.step_out_at(g[0], g[1])
				c.h2.a1["out_done"] = 1
				c.state = "chase"
				c.xp = 0
		"gqueen:shatter":
			if crossed(t0, t1, SHATTER["warn"][0]):
				sound(m, "trapSet", 0.6)
			if crossed(t0, t1, a["hit"]):
				sound(m, "shatter", 1.0)
			# (its glass across the hall in its lane: whoever is in one as it crosses)
			if crossed(t0, t1, float(a["hit"]) + float(SHATTER["cross"])):
				var F := hall_frame(m.mgr.main)
				if not F.is_empty() and in_lane(F, hero.world) and open_to(hero):
					blow(m, hero, float(a["dmg"]))


func died(m) -> void:
	# (her poison gone; her mirror cracks across and tells the truth)
	for p in m.mgr.perils.list:
		if str(p.get("a1", "")) == "gqueen:cloud":
			p["dur"] = p["t"]
	var P := hall_of(m)
	if not P.is_empty():
		P["c"] = 2
		P["d"] = _now(m)
		P["a"] = 0
	say(m, TRUTH, 5.0)
	if not P.is_empty():
		P["c"] = 2
