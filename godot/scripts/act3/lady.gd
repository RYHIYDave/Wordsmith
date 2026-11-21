## THE LADIES-IN-WAITING (floor 18, the Glass Gallery), as the game fights them (game/act1_rules/lady.ts; art/gallery_ladies_moves.ts,
## gallery_ladies_fx.ts; render/act1_fx/lady.ts). His word of 2 Nov 2026, “All of it in this one”.
##   THEY KEEP THEIR DISTANCE, gliding, never a step shown: far off, they glide in at 3.2 tiles a second; between 4.5 and 6 tiles of
##     him they CIRCLE round him, facing him (2.8), all of a floor the same way round; within 3.5 they GLIDE BACK away, still facing him
##     (2.4). Each glide is an act of its own, its pictures going round (act1.gd act_clock), ended as soon as another is wanted.
##   THE FLASH FROM RANGE (1.6 s, every 3.2 s, the first after 1.2; from 3.5 to 6.2 tiles): her mirror swept up and held, the spot of
##     light skittering on the floor where it will fall, its round marked; at 0.9 s a cone of cold light from 0.45 to 6.5 tiles before
##     her (three tiles across at its end): whoever is in it struck.
extends "res://scripts/act3/hc.gd"

const TILE3 := 39.191835884530846
const FLASH := {"long": 1.6, "warn": [0.3, 0.8], "hit": 0.9, "near": 17.636326148038883 / 39.191835884530846, "reach": 254.7469332494505 / 39.191835884530846, "cd": 3.2}
## (wedgeHalf: the flash's half-width each half tile out, tiles)
const HALF := [0.1021, 0.1136, 0.2291, 0.3447, 0.4602, 0.5757, 0.6913, 0.8068, 0.9223, 1.0379, 1.1534, 1.2689, 1.3845, 1.5, 1.5]
const KEEP := [4.5, 6.0]
const BACK := 3.5
const GLIDE_LONG := 8.0 / 30.0
const PACE := {"lady:back": 2.4, "lady:left": 2.8, "lady:right": 2.8}
const GAIT := {"pace": 3.2, "cycle": 8.0 / 30.0, "setOff": 0.0, "halt": 0.0, "stopAt": 6.0, "slack": 0.5, "trueBack": true}
const LOOP := {"at": 0.0, "span": 8.0 / 30.0, "extra": 8.0 / 30.0 * 239.0}
const ACTS := [
	{"id": "lady:flash", "clip": "attack", "long": 1.6, "hit": 0.9, "dmg": 1.0, "cooldown": 3.2, "first": 1.2, "after": 0.3, "near": 0.0, "far": 254.7469332494505 / 39.191835884530846 - 0.3},
	{"id": "lady:back", "clip": "glideBack", "long": 8.0 / 30.0 * 240.0, "hit": 1e9, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true, "loop": LOOP},
	{"id": "lady:left", "clip": "glideLeft", "long": 8.0 / 30.0 * 240.0, "hit": 1e9, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true, "loop": LOOP},
	{"id": "lady:right", "clip": "glideRight", "long": 8.0 / 30.0 * 240.0, "hit": 1e9, "dmg": 0.0, "cooldown": 0.0, "first": 0.0, "after": 0.0, "near": 0.0, "far": 99.0, "forced": true, "loop": LOOP},
]
const IDX := {"lady:back": 1, "lady:left": 2, "lady:right": 3}


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


## The flash's half-width `d` tiles out before her.
static func flash_half(d: float) -> float:
	var k := clampf(d / 0.5, 0.0, HALF.size() - 1.0)
	var i := floori(k)
	var j := mini(i + 1, HALF.size() - 1)
	return lerpf(float(HALF[i]), float(HALF[j]), k - i)


## inFlash: whether a point `d` from her (facing `f`) is in her flash's wedge.
static func in_flash(f: Vector2, d: Vector2) -> bool:
	var along := d.dot(f)
	var across := absf(-d.x * f.y + d.y * f.x)
	return along >= float(FLASH["near"]) and along <= float(FLASH["reach"]) and across <= flash_half(along)


## The glide she wants `d` tiles from him: back, round (to her own left or right as her picture is turned), or none.
func _wanted(m, d: float) -> String:
	if d < BACK:
		return "lady:back"
	if d <= float(KEEP[1]) + 0.3:
		var side: int = a1.get("side", 1)
		var left := (-side if m.face.x - m.face.y < 0.0 else side) > 0
		return "lady:left" if left else "lady:right"
	return ""


func _flash_ready(m, d: float, sees: bool) -> bool:
	return sees and d <= float(FLASH["reach"]) - 0.3 and d >= BACK and m._cd <= 0.0 and (cds.is_empty() or float(cds[0]) <= 0.0)


func forced(m) -> int:
	var h = m.mgr.hero
	if not h.alive:
		return -1
	var to: Vector2 = h.world - m.world
	var d := maxf(to.length(), 1e-6)
	var sees: bool = m.mgr.sees(m.world, h.world)
	# (her flash ready and he in its reach: it is made, not a glide)
	if _flash_ready(m, d, sees) or not sees:
		return -1
	m.face = to / d
	var w := _wanted(m, d)
	return int(IDX[w]) if w != "" else -1


func can(_m, a: Dictionary, _dist: float, _los: bool) -> bool:
	return not a.get("forced", false)


func start(m, a: Dictionary, _hero) -> void:
	if str(a["id"]) != "lady:flash":
		return
	# (its round, through her wind-up; the light on the floor before her: act3/marks18.gd lady:show)
	var R: float = FLASH["reach"]
	var half := atan2(flash_half(R), R)
	warn(m, "lady:flash", FLASH["warn"][0], FLASH["hit"], [], [[-half, half, R]], false, {"kmul": 0.7})
	peril(m, "lady:show", m.world, {"dur": 1e9, "act": act})


func acting(m, a: Dictionary, t0: float, t1: float, dt: float, hero) -> void:
	var id := str(a["id"])
	if id == "lady:flash":
		if crossed(t0, t1, FLASH["warn"][0]):
			sound(m, "shatter", 0.15)
		if crossed(t0, t1, a["hit"]):
			sound(m, "zap", 0.5)
			if in_flash(m.face, hero.world - m.world) and open_to(hero):
				blow(m, hero, float(a["dmg"]))
		return
	# A GLIDE: back away from him, or round him, facing him
	var h: Vector2 = hero.world
	var d := maxf(h.distance_to(m.world), 1e-6)
	var u: Vector2 = (m.world - h) / d
	var side: int = a1.get("side", 1)
	var n: Vector2 = m.world
	if id == "lady:back":
		n += u * float(PACE[id]) * dt
	else:
		# (round him, her ring drawn back toward the middle of the ring she keeps)
		var v: float = float(PACE[id]) * dt
		var mid := (float(KEEP[0]) + float(KEEP[1])) / 2.0
		var r1 := d + clampf(mid - d, -0.6 * dt, 0.6 * dt)
		var ang := atan2(u.y, u.x) + side * v / maxf(1.0, r1)
		n = h + Vector2(cos(ang), sin(ang)) * r1
	# (not into another of them: she holds where she is this step)
	var crowded := false
	if id != "lady:back":
		for o in m.mgr.list:
			if is_instance_valid(o) and o != m and not o.dead and o.kind == "lady" and o.world.distance_to(n) < 1.0 and o.world.distance_to(n) < o.world.distance_to(m.world):
				crowded = true
				break
	if crowded:
		pass
	elif is_open(m, n):
		m.world = n
	elif id != "lady:back":
		a1["side"] = -side
	var d1 := maxf(h.distance_to(m.world), 1e-6)
	m.face = (h - m.world) / d1
	# (another glide wanted, her flash ready in reach, or he out of her sight: this one ends)
	var sees: bool = m.mgr.sees(m.world, h)
	if _flash_ready(m, d1, sees) or not sees or _wanted(m, d1) != id:
		act["t"] = float(a["long"])
