## THE BOG LEECHES (floor 10), as the game fights them (game/act1_rules/leech.ts RULES, LEECH, latchClock, latched, hanging,
## letGo; render/act1_fx/leech.ts sprite, over). His doc's table: "They latch on and drain life until you dodge them off." His
## pick for its attack: "Leap, latch on, suck (Recommended)". A tiny mob: one attack.
##   ITS SLITHER: 2.4 tiles a second, stopping at any frame; as near as 0.92 tiles (where its mouth reaches), off beyond 1.12.
##   THE LEAP AND LATCH (within 1.15 tiles; list `attack`, 1.9 s; no more than 4 hang on him or spring at him at once): reared
##     and quivering; from 0.5 s it springs, carried along its line so that its mouth comes down on him; at 0.633 s a hero 0.15
##     to 1.2 tiles before it and 0.45 to either side (not in the air of his lunge) is bitten, x0.8 ("Latched"), and IT HOLDS ON:
##     it rides along with him, its mouth on him (0.92 tiles behind where he faces it from), wherever he goes, and DRINKS, a sip
##     every 0.5 s, x0.45, healing itself by what it takes; its picture plays its clinging and swelling, then swells and eases
##     back over 1.05 to 1.233 s of it for as long as it holds on, drawn over him. IT LETS GO (and drops fat, from 1.25 s of its
##     picture) when he DODGES IT OFF (his lunge; or he is gone from under it, 1.2 tiles in a step), when it has drunk 3 s, or
##     where it would hang is a wall (scraped off). One that misses drops where it sprang (on from 1.25 s).
extends "res://scripts/act1/act1.gd"

## (RULES.gait: its slither; it stands where its mouth reaches)
const AT := 36.0 / (32.0 / sqrt(2.0 / 3.0))
const GAIT := {"pace": 2.4, "cycle": 1.0 / 30.0, "setOff": 0.0, "halt": 0.0, "stopAt": AT, "slack": 0.2, "trueBack": false}
## (ACTS)
const ACTS := [
	{"id": "leech:latch", "clip": "attack", "long": 1.9, "hit": 19.0 / 30.0, "dmg": 0.8, "cooldown": 0.0, "first": 0.0, "after": 0.7, "near": 0.0, "far": 1.15},
]
## (LEECH.latch, LEECH.drink, LEECH.most)
const LATCH := {"spring": 0.5, "hit": 19.0 / 30.0, "reach": 1.2, "half": 0.45, "letGo": 1.25, "land": 1.4}
const DRINK := {"every": 0.5, "dmg": 0.45, "most": 3.0, "loop": [1.05, 1.233]}
const MOST := 4
## (the colour of "Latched")
const LATCHED := Color("#ff8a80")


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


func spawned(_m) -> void:
	a1 = {"on": 0, "held": 0.0, "sip": 0.0, "hx": 0.0, "hy": 0.0}


## latchClock: where in its picture's clinging it is, `held` seconds after it clamped on: as painted, then there and back over
## the last of it.
static func latch_clock(held: float) -> float:
	var a: float = DRINK["loop"][0]
	var b: float = DRINK["loop"][1]
	var t := float(LATCH["hit"]) + maxf(0.0, held)
	if t <= b:
		return t
	var span := b - a
	var u := fmod(t - b, 2.0 * span)
	return b - u if u < span else a + (u - span)


## latched: is it hanging on the hero now?
func latched(m) -> bool:
	return int(a1.get("on", 0)) == 1 and m.state == "act" and act != null


## hanging: how many hang on him now, or are springing at him.
static func hanging(m) -> int:
	var n := 0
	for o in m.mgr.list:
		if is_instance_valid(o) and not o.dead and o.kind == "leech" and o.h2 != null:
			var L = o.h2
			if L.latched(o) or (o.state == "act" and L.act != null and float(L.act["t"]) < float(LATCH["hit"])):
				n += 1
	return n


## letGo: it drops, fat, where it hangs, as its picture has it.
func let_go() -> void:
	a1["on"] = 0
	if act != null:
		act["t"] = maxf(float(act["t"]), float(LATCH["letGo"]))


func can(m, _a: Dictionary, _dist: float, _los: bool) -> bool:
	return hanging(m) < MOST


func start(_m, _a: Dictionary, _hero) -> void:
	a1 = {"on": 0, "held": 0.0, "sip": 0.0, "hx": 0.0, "hy": 0.0}


func end(_m, _a: Dictionary, _hero) -> void:
	a1["on"] = 0


func tick(m, dt: float, _dist: float, hero) -> bool:
	if int(a1.get("on", 0)) != 1:
		return false
	# (broken off: it is down off him)
	if m.state != "act" or act == null:
		a1["on"] = 0
		return false
	# DODGED OFF (his lunge; he is gone from under it), its fill drunk, or knocked off him
	var gone: bool = hero.world.distance_to(Vector2(a1["hx"], a1["hy"])) > 1.2
	if not hero.alive or hero._act == "lunge" or gone or float(a1["held"]) >= float(DRINK["most"]):
		let_go()
		return false
	# IT RIDES ALONG, its mouth on him; scraped off where it would hang in a wall
	var at: Vector2 = hero.world - m.face * AT
	if not m.mgr.clear(at.x, at.y, minf(m.r, 0.3)):
		let_go()
		return false
	m.world = at
	a1["hx"] = hero.world.x
	a1["hy"] = hero.world.y
	a1["held"] = float(a1["held"]) + dt
	# IT DRINKS: a sip at a time, healed by what it takes
	a1["sip"] = float(a1["sip"]) + dt
	while float(a1["sip"]) >= float(DRINK["every"]):
		a1["sip"] = float(a1["sip"]) - float(DRINK["every"])
		_drink(m, hero, DRINK["dmg"])
		sound(m, "leech", 0.3)
	return true


## A blow of its that heals it by what it took.
func _drink(m, hero, mult: float) -> void:
	var was: float = hero.life
	blow(m, hero, mult)
	var took := maxf(0.0, was - hero.life)
	if took > 0.0:
		m.life = minf(m.max_life, m.life + took)


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "leech:latch":
		return
	var r := rel(m, hero)
	# THE LEAP: carried on (or back) along its line, so that its mouth comes down on him where its picture's does
	var spring: float = LATCH["spring"]
	var hit: float = LATCH["hit"]
	if t1 > spring and t0 < hit and r.x > 0.0 and r.x < float(LATCH["reach"]) + 0.3 and absf(r.y) <= float(LATCH["half"]) + 0.2:
		var k := minf(1.0, (t1 - maxf(t0, spring)) / maxf(1e-6, hit - maxf(t0, spring)))
		slide(m, m.face * ((r.x - AT) * k), 0.3)
	if not crossed(t0, t1, a["hit"]):
		return
	var near := rel(m, hero)
	if near.x > 0.15 and near.x <= float(LATCH["reach"]) and absf(near.y) <= float(LATCH["half"]) and open_to(hero):
		# CLAMPED ON
		a1 = {"on": 1, "held": 0.0, "sip": 0.0, "hx": hero.world.x, "hy": hero.world.y}
		var at: Vector2 = hero.world - m.face * AT
		if m.mgr.clear(at.x, at.y, minf(m.r, 0.3)):
			m.world = at
		_drink(m, hero, a["dmg"])
		word(m, hero, "Latched", LATCHED)
		sound(m, "leech", 0.6)
	else:
		# (missed: it drops where it sprang)
		act["t"] = maxf(float(act["t"]), float(LATCH["letGo"]))
		sound(m, "swing", 0.25)


## (render/act1_fx/leech.ts sprite: hanging on him, its clinging, drinking, by how long it has held on)
func shown(m) -> Dictionary:
	if not latched(m) or not m.art.has("attack"):
		return {}
	return {"list": "attack", "i": floori(latch_clock(a1["held"]) * m.art.fps("attack") + 1e-6)}


## (render/act1_fx/leech.ts over: drawn over the hero while it hangs on him, its picture's 0.633 to 1.25 s and for as long as it
## holds on)
func over(m) -> float:
	if m.state != "act" or act == null or acts()[act["i"]]["id"] != "leech:latch":
		return 0.0
	var t: float = act["t"]
	return 2.0 if latched(m) or (t >= float(LATCH["hit"]) and t < float(LATCH["letGo"])) else 0.0
