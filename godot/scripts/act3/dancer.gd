## THE MASKED DANCERS (floor 17, the Masque), as the game fights them with their new moves on (game/act1_rules/dancer.ts, the partner
## throw on: DANCER_THROW; art/masque_dancers_moves.ts, action_f16_dancer.ts; render/act1_fx/dancer.ts). His doc, level 17: "masked
## dancers who waltz until they notice you"; his picks: “Gliding fast, whirling (Recommended)”, and the throw, “Yes (Recommended)”.
##   IN PAIRS, a lady and a gentleman dressed in their room's colour (the game's forms, as exported), at one spot; while they sleep
##     they WALTZ there, each pair at its own moment in the dance (their picture list `waltz`).
##   NOTICING HIM (woken): the waltz breaks, each steps out to where it stood in the pair, and they whirl at him at 3.4 tiles a second.
##   THE CHIME (act3/masque.gd): stopped dead, the masks round to him by 0.26 s, held to 1.3 s, then at him.
##   THE PARTNER THROW, the gentleman leading, his lady within 3 tiles and neither busy (every 6 s, the first after 1): she takes his
##     hands at his right, the pair whirl round, THE LANE marked from her place on at the hero (9.1 tiles, 0.85 to either side); at 1.2 s
##     he flings her, spinning like a top down the lane (14 tiles a second, slowing to a stop in 1.3 s): a hero within 0.85 of her as she
##     comes by struck once, x1.1, and knocked 0.7.
##   THE WHIRLING SPIN, one whose partner is gone (1.8 s): the circle where it will land marked (1.5 round a point 1.25 before it);
##     carried 1.25 tiles in its strike and 1.42 in all; at 0.8 s whoever is within 1.8 of it struck.
extends "res://scripts/act3/hc.gd"

const CHIME := {"long": 1.9, "go": 1.3}
const SPIN := {"long": 1.8, "warn": [0.36, 0.7], "strike": [0.7333333333333333, 0.8], "hit": 0.8, "lunge": 1.25, "area": 1.5, "end": 1.4158508680009445}
const THROW := {"take": 0.3, "r": 0.6634034720037775, "pace": 14.0, "stop": 1.3, "half": 0.85, "r2": 0.85, "knock": 0.7, "hit": 1.2, "strike": [1.1333333333333333, 1.2], "lane": 9.1}
## (chimeSplit: where each stands in the pair, from its middle: tiles before it, to its left)
const SPLIT := {"gent": Vector2(-0.031064138924609422, -0.1764777444123552), "lady": Vector2(0.031064138924609422, 0.1764777444123552)}
const HOLD := 3.0
const GAIT := {"pace": 3.4, "cycle": 1.0 / 3.0, "setOff": 0.0, "halt": 0.0, "stopAt": 1.6, "slack": 0.3, "trueBack": true}
const ACTS := [
	{"id": "dancer:throw", "clip": "attack", "long": 2.3, "hit": 1.2, "dmg": 0.0, "cooldown": 6.0, "first": 1.0, "after": 0.6, "near": 0.0, "far": 8.5},
	{"id": "dancer:thrown", "clip": "attack", "long": 2.9, "hit": 1.2, "dmg": 1.1, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 999.0, "forced": true},
	{"id": "dancer:spin", "clip": "spin", "long": 1.8, "hit": 0.8, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 2.25},
	{"id": "dancer:chime", "clip": "chime", "long": 1.9, "hit": 1.3, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 999.0, "forced": true},
	{"id": "dancer:notice", "clip": "chime", "long": 1.9, "hit": 1.9, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 999.0, "forced": true},
]
const THROWN_I := 1
const CHIME_I := 3
const NOTICE_I := 4


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## (what it keeps, as the game laid it: its partner's number, whether it has noticed him, a chime or notice wanted, stepped out)
func _keep(m) -> Dictionary:
	if not a1.has("partner"):
		a1 = {"partner": int(m.a1_in.get("partner", -1)), "noticed": int(m.a1_in.get("noticed", 0)), "want": 0, "split": 0}
	return a1


## Its partner, alive and near enough to take the waltz's hold, or null.
func partner_near(m):
	var p := int(_keep(m)["partner"])
	if p < 0:
		return null
	for o in m.mgr.list:
		if is_instance_valid(o) and o.id == p and not o.dead:
			return o if o.world.distance_to(m.world) <= HOLD else null
	return null


## Called to the clock's chime (act3/masque.gd): woken if waltzing, and to stop dead and look.
func call_to_chime(m) -> void:
	var k := _keep(m)
	k["want"] = 1
	k["noticed"] = 1
	if m.state == "sleep":
		m.state = "chase"
		m._cd = 0.3


## (asleep, a pair waltzes at its spot: render/act1_fx/dancer.ts sprite)
func shown(m) -> Dictionary:
	var k := _keep(m)
	if m.state != "sleep" or int(k["partner"]) < 0 or not m.art.has("waltz"):
		return {}
	var n: int = m.art.count(0, "waltz")
	if n <= 0:
		return {}
	var lady: int = int(k["partner"]) if int(m.form) % 2 == 1 else m.id
	var t := Time.get_ticks_msec() / 1000.0 + lady * 0.37
	return {"list": "waltz", "i": floori(t * m.art.fps("waltz")) % n}


## Stepped out of the pair to where it stood in it.
func _split_out(m) -> void:
	var k := _keep(m)
	if int(k["split"]) == 1 or int(k["partner"]) < 0:
		return
	k["split"] = 1
	var s: Vector2 = SPLIT["gent"] if int(m.form) % 2 == 1 else SPLIT["lady"]
	var f: Vector2 = m.face
	var p: Vector2 = m.world + f * s.x + Vector2(f.y, -f.x) * s.y
	# (its whole body clear of the walls, as any monster's step is, not the tile under its middle only: the bug hunt, 25 Nov 2026)
	if m.mgr.map.fits(p.x, p.y, m.r):
		m.world = p


## Carried along its facing by `d` tiles, so far as the floor lets it.
static func carry(m, d: float) -> void:
	var n := maxi(1, ceili(absf(d) / 0.1))
	for i in n:
		var p: Vector2 = m.world + m.face * (d / n)
		if not m.mgr.map.fits(p.x, p.y, m.r):
			return
		m.world = p


## topGone: how far down the lane she is, `u` seconds after the fling.
static func top_gone(u: float) -> float:
	var k := clampf(u, 0.0, float(THROW["stop"]))
	return float(THROW["pace"]) * k - float(THROW["pace"]) / (2.0 * float(THROW["stop"])) * k * k


func tick(m, _dt: float, _dist: float, _hero) -> bool:
	# (woken, it notices him: the waltz breaks; once)
	var k := _keep(m)
	if int(k["noticed"]) == 0 and act == null:
		k["noticed"] = 1
		k["want"] = 2
	return false


func forced(m) -> int:
	var k := _keep(m)
	if int(k["want"]) == 0:
		return -1
	return CHIME_I if int(k["want"]) == 1 else NOTICE_I


func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	match str(a["id"]):
		"dancer:spin":
			return partner_near(m) == null
		"dancer:throw":
			# (the gentleman leads; his lady not busy)
			if int(m.form) % 2 != 1:
				return false
			var o = partner_near(m)
			return o != null and o.state != "act" and int(o.h2._keep(o)["want"]) == 0
	return true


func start(m, a: Dictionary, hero) -> void:
	var id := str(a["id"])
	if id == "dancer:notice" or id == "dancer:chime":
		_keep(m)["want"] = 0
		if id == "dancer:notice":
			act["t"] = float(CHIME["go"])
		_split_out(m)
		return
	if id == "dancer:spin":
		warn(m, id, float(SPIN["warn"][0]) - 0.2, SPIN["hit"], [], [[-PI, PI, SPIN["area"], SPIN["lunge"]]])
		return
	if id != "dancer:throw":
		return
	var o = partner_near(m)
	if o == null:
		return
	# SHE TAKES HIS HANDS, at his right, facing the hero as he does: her part begins with his
	var at := beside(m.world, m.face, act["hand"], 0.0, -float(THROW["r"]))
	# (room for his whole body there: taken by the hands into a wall he stood in it; the bug hunt's fifth round)
	if m.mgr.clear(at.x, at.y, o.r):
		o.world = at
	o.h2.start_act(o, ACTS, THROWN_I, hero)
	o.face = m.face
	o.h2.act["hand"] = hand_of(true, o.face)
	# (where she is flung from: the lane is from there)
	o.h2.act["x"] = o.world.x
	o.h2.act["y"] = o.world.y
	o.h2.warn(o, "dancer:thrown", THROW["take"], THROW["hit"], [[0.0, THROW["lane"], -float(THROW["half"]), THROW["half"]]], [], false, {"at_act": true})


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	match str(a["id"]):
		"dancer:spin":
			var s0: float = SPIN["strike"][0]
			var s1: float = SPIN["strike"][1]
			# (the strike carries them in, its two frames; the wind-down a little further)
			if t1 > s0 and t0 < s1:
				carry(m, float(SPIN["lunge"]) * (minf(t1, s1) - maxf(t0, s0)) / (s1 - s0))
			if t0 >= s1 and t0 < float(a["long"]):
				carry(m, (float(SPIN["end"]) - float(SPIN["lunge"])) * (minf(t1, float(a["long"])) - t0) / (float(a["long"]) - s1))
			if crossed(t0, t1, float(SPIN["hit"]) - 0.1):
				sound(m, "whirl", 0.35)
			if crossed(t0, t1, a["hit"]) and hero.world.distance_to(m.world) <= float(SPIN["area"]) + 0.3 and open_to(hero):
				blow(m, hero, float(a["dmg"]))
		"dancer:thrown":
			if crossed(t0, t1, float(THROW["strike"][0]) - 0.05):
				sound(m, "whirl", 0.4)
			var u0 := t0 - float(THROW["strike"][0])
			var u1 := t1 - float(THROW["strike"][0])
			if u1 <= 0.0:
				return
			# SPUN DOWN THE LANE like a top, the game carrying her (so far as the floor lets her)
			carry(m, top_gone(u1) - top_gone(maxf(0.0, u0)))
			if int(act.get("a", 0)) == 1:
				return
			# (as she comes by: struck once, knocked aside)
			var from := Vector2(act["x"], act["y"])
			var r := from_figure(from, m.face, act["hand"], hero.world)
			var on := from_figure(from, m.face, act["hand"], m.world).x
			if minf(u1, float(THROW["stop"])) > float(THROW["stop"]) + 0.1 or Vector2(r.x - on, r.y).length() > float(THROW["r2"]) or not open_to(hero):
				return
			act["a"] = 1
			blow(m, hero, float(a["dmg"]))
			knock(hero, m.world, float(THROW["knock"]))
