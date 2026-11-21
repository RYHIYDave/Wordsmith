## THE MUTE WATCH HOUNDS (floor 11, and the city's own), as the game fights them (game/act1_rules/hound.ts RULES, HOUND,
## masterOf, heelOf). His picks to the art chat, 18 Oct 2026: "... Mute watch hounds": the watch's own dogs, gagged, fast, in packs
## at the watch's heels; they crouch, tremble and pounce.
##   THEIR LOPE: 2.4 tiles a second, stopping at any frame; as near as 0.85 tiles, off again beyond 1.1.
##   THE POUNCE (their one blow, within 1.15 tiles; list `attack`, 1.2 s): crouched, trembling (the warning); its forepaws slam down
##     at 0.6 s 0.765 tiles before its middle: a hero within 0.5 of there is struck, x1.
##   AT THE WATCH'S HEELS: one awake within 7 tiles of one of the Hushed watch (its own pack's first) keeps to his heels, 1 tile
##     behind him and 0.75 to one side (its side by its own moment), loping to its place when he has left it 0.8 behind and waiting
##     there, facing as he does; LET SLIP as he comes within 3.4 of the hero, or the hero within 2.6 of it, or once it is struck:
##     then it comes on and pounces as any. Held up on its way to his heels, it is let go.
extends "res://scripts/act1/act1.gd"

## (GAIT)
const GAIT := {"pace": 2.4, "cycle": 1.0 / 16.0, "setOff": 0.0, "halt": 0.0, "stopAt": 0.85, "slack": 0.25, "trueBack": false}
## (ACTS)
const ACTS := [
	{"id": "hound:pounce", "clip": "attack", "long": 1.2, "hit": 0.6, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.5, "near": 0.0, "far": 1.15},
]
## (HOUND.pounce, HOUND.heel)
const POUNCE := {"at": 0.765, "r": 0.5}
const HEEL := {"r": 7.0, "at": 1.0, "side": 0.75, "leave": 0.8, "there": 0.3, "slip": 3.4, "near": 2.6}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## masterOf: the one of the watch whose heels it keeps to now (null: none, or let slip).
static func master_of(m, hero):
	if hero.world.distance_to(m.world) < HEEL["near"] or m.struck_t < INF:
		return null
	var best = null
	var bd := INF
	for o in m.mgr.list:
		if not is_instance_valid(o) or o.dead or o.kind != "watch" or o.state == "sleep":
			continue
		var raw: float = o.world.distance_to(m.world)
		var d: float = raw - (100.0 if o.pack_id == m.pack_id else 0.0)
		if raw > HEEL["r"] or d >= bd:
			continue
		best = o
		bd = d
	if best == null or hero.world.distance_to(best.world) < HEEL["slip"]:
		return null
	return best


## heelOf: its place at his heels, behind him and to its side of him.
static func heel_of(m, master) -> Vector2:
	return beside(master.world, master.face, hand_of(true, master.face), -float(HEEL["at"]), (1.0 if m.own_seed < 0.5 else -1.0) * float(HEEL["side"]))


func tick(m, dt: float, _dist: float, hero) -> bool:
	if m.state == "act" or act != null:
		return false
	var master = null if not hero.alive else master_of(m, hero)
	if master == null:
		a1["heel"] = 0
		return false
	# AT HIS HEELS: it lopes to its place when he has left it behind, and waits there, facing as he does
	var spot := heel_of(m, master)
	var to: Vector2 = spot - m.world
	var d := to.length()
	if d > (HEEL["there"] if int(a1.get("heel", 0)) == 1 else HEEL["leave"]):
		a1["heel"] = 1
		var step := minf(d, m.speed * m.slow() * dt)
		var was: Vector2 = m.world
		slide(m, to / d * step)
		# (held up on its way: it is let go to come on as any)
		if m.world.distance_to(was) < step * 0.3:
			a1["heel"] = 0
			return false
		m.face = to / d
		m.state = "chase"
		if mode != "walk":
			_to("walk")
		gt += step / float(GAIT["pace"])
		return true
	# (there: it stands at his heels)
	a1["heel"] = 0
	m.face = master.face
	m.state = "chase"
	if mode != "stand":
		_to("stand")
	gt += dt
	return true


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	if a["id"] != "hound:pounce" or not crossed(t0, t1, float(a["hit"])):
		return
	# (its forepaws slam down before it: whoever they come down on is struck)
	var s := beside(m.world, m.face, act["hand"], POUNCE["at"], 0.0)
	if hero.world.distance_to(s) <= POUNCE["r"]:
		blow(m, hero, float(a["dmg"]))
	# (its paws on the floor: it makes no sound with its mouth, gagged)
	sound(m, "swing", 0.4)
