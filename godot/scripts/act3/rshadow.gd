## THE SHADOWS OF THE FOUR ROYALS (floor 20, the Quiet Tower), as the game fights them (game/act1_rules/rshadow.ts; art/royal_shadows.ts,
## royal_shadows_fx.ts; render/act1_fx/rshadow.ts). His pick, “Each with one boss move (Recommended)”: "grey fog echoes of the four
## royals you beat ... each as its royal moved ... its royal's basic attack, and one of that royal's big moves, smaller"; then “Yes,
## that's them (Recommended)”.
##   WHICH ROYAL: its form (0 the Princess, 1 the Prince, 2 the Queen, 3 the King), its pace its royal's at its size, as the game laid it.
##   THE PRINCESS'S: the vine's lash (a quarter turn before her, six tiles out); THE SNARE (the vines burst up round where he stood as
##     her held hands' warning ended, 1.7 tiles round, and hold whoever they caught 1.4 s).
##   THE PRINCE'S: the rapier's thrust (a line before him); MASKS (three flung in a fan, six tiles out, each striking where it passes).
##   THE QUEEN'S: the comb (a stab before her, carrying her on); THE BLINK (into her hand mirror, out of it behind him, stabbing).
##   THE KING'S: THE CHARGE (braced, it runs 5.76 tiles along its forward, a wall stopping it; its line of sparks bursts, 2.43 to
##     2.8 s in, striking everything within 1.66 tiles of the line); THE CROWN'S WEIGHT (its crown sent up, flown out over him,
##     following him, held trembling, dropped: within 1.09 tiles of where it lands, struck; home onto its head).
## Their warnings and big moves' pictures: act3/marks20.gd.
extends "res://scripts/act3/hc.gd"

const ROYAL_IDS := ["princess", "prince", "queen", "king"]
const LASH := {"reach": 6.0, "half": 0.85, "warn": 0.4, "strike": 0.7333333333333333, "hit": 0.8}
const SNARE := {"r": 1.675, "hold": 1.4, "slow": 0.9, "warn_end": 0.72, "hit": 0.8333333333333334, "long": 2.0}
const THRUST := {"reach": 3.4959999999999996, "half": 0.6, "warn": 0.45, "strike": 0.8, "hit": 0.8666666666666667}
const MASKS := {"ways": [-36.0, 0.0, 36.0], "speed": 15.0, "reach": 6.0, "hit": 0.6, "warn": 0.45, "flight": 0.4, "burst": 0.3}
const COMB := {"reach": 2.2880000000000003, "half": 0.6, "lunge": 1.152, "warn": 0.36, "strike": 0.7333333333333333, "hit": 0.8}
const BLINK := {"behind": 2.448, "reach": 1.7679999999999998, "half": 0.8, "strikeIn": [0.6, 0.6667], "strikeOut": [0.3, 0.3667]}
## (KG_CHARGE's times; SHADOW_CHARGE: its lengths, 0.64 of the King's)
const CHARGE := {"warn": 0.3, "run": [0.8, 1.55], "strike": 0.7666666666666667, "burst": 2.15, "hit": [2.43, 2.8], "lies": 3.15, "pace": 7.68, "most": 5.76, "reach": 1.6640000000000001}
## (KG_WEIGHT's times from the move's start; SHADOW_WEIGHT)
const WEIGHT := {"send": 1.1, "hit": 4.1, "r": 1.088, "pace": 3.2, "fly": 0.45, "hold": 2.4, "home": [3.4, 4.1], "long": 4.1}

const GAIT := {"pace": 2.5, "cycle": 1.0, "setOff": 0.0, "halt": 0.0, "stopAt": 2.0, "slack": 0.6, "trueBack": true}
const ACTS := [
	{"id": "rshadow:lash", "clip": "attack", "long": 1.6, "hit": 0.8, "dmg": 1.0, "cooldown": 0.0, "first": 0.4, "after": 0.6, "near": 0.0, "far": 5.5},
	{"id": "rshadow:thrust", "clip": "attack", "long": 2.0, "hit": 0.8666666666666667, "dmg": 1.0, "cooldown": 0.0, "first": 0.4, "after": 0.3, "near": 0.0, "far": 3.4959999999999996 - 0.3},
	{"id": "rshadow:comb", "clip": "attack", "long": 1.5, "hit": 0.8, "dmg": 1.0, "cooldown": 0.0, "first": 0.4, "after": 0.4, "near": 0.0, "far": 2.2880000000000003 - 0.2},
	{"id": "rshadow:charge", "clip": "attack", "long": 2.7, "hit": 2.43, "dmg": 1.2, "cooldown": 0.0, "first": 0.4, "after": 0.6, "near": 0.0, "far": 6.5},
	{"id": "rshadow:snare", "clip": "snare", "long": 1.6, "hit": 0.8333333333333334, "dmg": 1.0, "cooldown": 7.0, "first": 2.5, "after": 0.5, "near": 0.0, "far": 7.0},
	{"id": "rshadow:masks", "clip": "masks", "long": 1.85, "hit": 0.8666666666666667, "dmg": 0.8, "cooldown": 6.0, "first": 2.5, "after": 0.4, "near": 2.0, "far": 5.5},
	{"id": "rshadow:blinkIn", "clip": "blinkIn", "long": 1.0, "hit": 0.6667, "dmg": 0.0, "cooldown": 8.0, "first": 2.5, "after": 0.0, "near": 3.0, "far": 9.0},
	{"id": "rshadow:weight", "clip": "weight", "long": 5.6, "hit": 4.1, "dmg": 1.3, "cooldown": 8.0, "first": 2.5, "after": 0.6, "near": 0.0, "far": 7.0},
	{"id": "rshadow:blinkOut", "clip": "blinkOut", "long": 0.9, "hit": 0.3667, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.4, "near": 0.0, "far": 999.0, "forced": true},
]
const OWN := {"princess": ["rshadow:lash", "rshadow:snare"], "prince": ["rshadow:thrust", "rshadow:masks"],
	"queen": ["rshadow:comb", "rshadow:blinkIn", "rshadow:blinkOut"], "king": ["rshadow:charge", "rshadow:weight"]}
const BLINK_OUT := 8


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func _id() -> String:
	return str(ACTS[act["i"]]["id"]) if act != null else ""


## Which royal a shadow is.
static func royal_of(m) -> String:
	return ROYAL_IDS[clampi(int(m.form), 0, 3)]


## The axis its picture faces along (its throws drawn in its picture fly that way).
static func picture_way(f: Vector2) -> Vector2:
	var back := f.x + f.y < -0.2
	var flip := f.x - f.y < 0.0
	if back:
		return Vector2(-1, 0) if flip else Vector2(0, -1)
	return Vector2(0, 1) if flip else Vector2(1, 0)


## Where a mask of a shadow's throw is `t` seconds after it left the hand; INF once it has burst.
static func mask_at(p: Dictionary, i: int, t: float) -> Vector2:
	if t > float(MASKS["flight"]):
		return Vector2.INF
	var a := atan2(float(p["fy"]), float(p["fx"])) + deg_to_rad(float(MASKS["ways"][i]))
	var d := minf(float(MASKS["reach"]), float(MASKS["speed"]) * maxf(0.0, t))
	return Vector2(p["x"], p["y"]) + Vector2(cos(a), sin(a)) * d


## Move it `d` tiles along `w`, so far as the floor lets it.
static func carry(m, w: Vector2, d: float) -> void:
	var n := maxi(1, ceili(absf(d) / 0.1))
	for i in n:
		var p: Vector2 = m.world + w * (d / n)
		if not is_open(m, p):
			return
		m.world = p


func can(m, a: Dictionary, _dist: float, _los: bool) -> bool:
	return OWN[royal_of(m)].has(str(a["id"]))


func forced(_m) -> int:
	# (the Queen's: out of her mirror at once, once she has gone into it)
	return BLINK_OUT if int(a1.get("out", 0)) != 0 else -1


func reachable(_m) -> bool:
	# (the Queen's: in her mirror, not here)
	var id := _id()
	if id == "rshadow:blinkIn":
		return float(act["t"]) < float(BLINK["strikeIn"][0])
	if id == "rshadow:blinkOut":
		return float(act["t"]) >= float(BLINK["strikeOut"][0])
	return true


func start(m, a: Dictionary, _hero) -> void:
	var id := str(a["id"])
	if id == "rshadow:blinkIn":
		sound(m, "shatter", 0.25)
	if id == "rshadow:charge":
		# (the way it will run: the way it faces, at him)
		a1["cx"] = m.face.x
		a1["cy"] = m.face.y
		a1["sx"] = m.world.x
		a1["sy"] = m.world.y
		a1["lane"] = 0.0
		a1["hit"] = 0
	if id == "rshadow:weight":
		# (its crown on its head till it is sent)
		a1["wx"] = m.world.x
		a1["wy"] = m.world.y
		a1["hit"] = 0
		a1.erase("hx")
	# (its warnings and its big moves' pictures, drawn from the act as it runs)
	peril(m, "rshadow:show", m.world, {"dur": 1e9, "act": act, "id": id})


func end(m, a: Dictionary, hero) -> void:
	var id := str(a["id"])
	if id == "rshadow:comb":
		carry(m, m.face, COMB["lunge"])
	if id == "rshadow:blinkIn":
		# (out of her mirror behind him, facing him)
		var hf: Vector2 = hero.face
		for b in [-hf, Vector2(-hf.y, hf.x), Vector2(hf.y, -hf.x), hf]:
			var p: Vector2 = hero.world + b * float(BLINK["behind"])
			if not is_open(m, p):
				continue
			m.world = p
			break
		var to: Vector2 = hero.world - m.world
		m.face = to.normalized() if to.length() > 1e-6 else m.face
		a1["out"] = 1
		return
	if id == "rshadow:blinkOut":
		a1["out"] = 0
	if id == "rshadow:charge":
		a1.erase("sx")
	if id == "rshadow:weight":
		a1.erase("wx")


func died(_m) -> void:
	a1.erase("sx")
	a1.erase("wx")


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	var id := str(a["id"])
	var r := rel(m, hero)
	var d := r.length()
	var ang := absf(atan2(r.y, r.x))
	match id:
		"rshadow:lash":
			if crossed(t0, t1, LASH["strike"]):
				sound(m, "swing", 0.6)
			if crossed(t0, t1, a["hit"]) and d <= float(LASH["reach"]) and ang <= float(LASH["half"]) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
		"rshadow:thrust":
			if crossed(t0, t1, THRUST["strike"]):
				sound(m, "swing", 0.5)
			if crossed(t0, t1, a["hit"]) and r.x >= -0.3 and r.x <= float(THRUST["reach"]) and absf(r.y) <= float(THRUST["half"]) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
		"rshadow:comb":
			if crossed(t0, t1, COMB["strike"]):
				sound(m, "swing", 0.5)
			if crossed(t0, t1, a["hit"]) and d <= float(COMB["reach"]) and ang <= float(COMB["half"]) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
		"rshadow:charge":
			# (braced, then carried along its way at its pace, a wall stopping it; its line of sparks bursting, striking all near it)
			var r0: float = CHARGE["run"][0]
			var r1: float = CHARGE["run"][1]
			if crossed(t0, t1, CHARGE["strike"]):
				sound(m, "swing", 0.7)
			var c := Vector2(a1.get("cx", m.face.x), a1.get("cy", m.face.y))
			if t1 > r0 and t0 < r1:
				var was: Vector2 = m.world
				carry(m, c, float(CHARGE["pace"]) * (minf(t1, r1) - maxf(t0, r0)))
				a1["lane"] = float(a1.get("lane", 0.0)) + was.distance_to(m.world)
			if crossed(t0, t1, CHARGE["burst"]):
				sound(m, "slam", 0.5)
			if int(a1.get("hit", 0)) == 0 and a1.has("sx") and t1 >= float(CHARGE["hit"][0]) and t0 <= float(CHARGE["hit"][1]):
				# (within its reach of the line it ran)
				var s := Vector2(a1["sx"], a1["sy"])
				var u := clampf((hero.world - s).dot(c), 0.0, float(a1.get("lane", 0.0)))
				if hero.world.distance_to(s + c * u) <= float(CHARGE["reach"]) and open_to(hero):
					a1["hit"] = 1
					blow(m, hero, float(a["dmg"]))
		"rshadow:weight":
			# (its crown: sent off its head, flown out over him, following him, held, dropped; it lies, and goes home; the shadow stands)
			var tc := t1 - float(WEIGHT["send"])
			if crossed(t0, t1, WEIGHT["send"]):
				sound(m, "whirl", 0.35)
			if tc >= 0.0 and a1.has("wx"):
				var w := Vector2(a1["wx"], a1["wy"])
				if tc < float(WEIGHT["fly"]):
					w = m.world + (hero.world - m.world) * smooth_in(0.0, WEIGHT["fly"], tc)
				elif tc < float(WEIGHT["hold"]):
					var to: Vector2 = hero.world - w
					if to.length() > 1e-6:
						w += to / to.length() * minf(to.length(), float(WEIGHT["pace"]) * (t1 - t0))
				elif tc >= float(WEIGHT["home"][0]) and tc < float(WEIGHT["home"][1]):
					if not a1.has("hx"):
						a1["hx"] = w.x
						a1["hy"] = w.y
					var hx := Vector2(a1["hx"], a1["hy"])
					w = hx + (m.world - hx) * smooth_in(WEIGHT["home"][0], WEIGHT["home"][1], tc)
				a1["wx"] = w.x
				a1["wy"] = w.y
			if crossed(t0, t1, a["hit"]):
				a1.erase("hx")
				sound(m, "slam", 0.7)
				hero.kick(2.0)
				if a1.has("wx") and hero.world.distance_to(Vector2(a1["wx"], a1["wy"])) <= float(WEIGHT["r"]) and open_to(hero):
					blow(m, hero, float(a["dmg"]))
		"rshadow:snare":
			# (as her held hands' warning ends: where he stands is where the vines will burst)
			if crossed(t0, t1, SNARE["warn_end"]):
				peril(m, "rshadow:snare", hero.world, {"t": -(float(a["hit"]) - float(SNARE["warn_end"])), "dur": SNARE["long"], "dmg": m._roll() * float(a["dmg"])})
		"rshadow:masks":
			if crossed(t0, t1, a["hit"]):
				sound(m, "whirl", 0.4)
				var w := picture_way(m.face)
				peril(m, "rshadow:masks", m.world, {"fx": w.x, "fy": w.y, "dur": float(MASKS["flight"]) + float(MASKS["burst"]), "dmg": m._roll() * float(a["dmg"])})
		"rshadow:blinkOut":
			if crossed(t0, t1, BLINK["strikeOut"][0]):
				sound(m, "shatter", 0.35)
			if crossed(t0, t1, a["hit"]) and d <= float(BLINK["reach"]) and ang <= float(BLINK["half"]) and open_to(hero):
				blow(m, hero, float(a["dmg"]))


static func smooth_in(a: float, b: float, t: float) -> float:
	var u := clampf((t - a) / (b - a), 0.0, 1.0)
	return u * u * (3.0 - 2.0 * u)
