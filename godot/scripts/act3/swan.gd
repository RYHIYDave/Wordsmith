## THE SWANS (floor 16, the Swan Gardens), as the game fights them (game/act1_rules/swan.ts RULES, SWAN; render/act1_fx/swan.ts).
## His answers to the art chat, 28 Oct 2026: “Plain swans gone wild”, “Knee-high, in flocks”, “Waddle and charge”, “Hissing lunge, a
## bite”, “Bursts into feathers (Recommended)”.
##   THE WADDLE: 1.4 tiles a second, both feet round in 0.4 s; it stops only where both feet are down.
##   THE CHARGE: one that sees the hero within 4.5 tiles (and is not yet in its bite's reach) charges, its waddle quickened to 2.6
##     tiles a second, until it bites, loses sight of him, or 1.8 s have gone; then it waddles 2.5 s before it may charge again.
##   THE BITE (its one blow, within 1.4 tiles; 1.05 s): a crouch and a hiss from 0.2 s, the bill shut on you at 0.5 s: whoever is
##     in the strip before it, from 0.2 behind its middle to 1.6 before it and 0.7 to either side, is struck. Through its wind-up
##     the strip is marked on the floor in the enemy's pink (garden_warn.gd), from 0.08 s.
extends "res://scripts/act3/hc.gd"

const GAIT := {"pace": 1.4, "cycle": 0.2, "setOff": 0.0, "halt": 0.0, "stopAt": 1.0, "slack": 0.3, "trueBack": true}
const ACTS := [
	{"id": "swan:bite", "clip": "attack", "long": 1.05, "hit": 0.5, "dmg": 1.0, "cooldown": 0.0, "first": 0.0, "after": 0.6, "near": 0.0, "far": 1.4},
]
const BITE := {"warn": 0.2, "hit": 0.5, "at": 1.099, "from": -0.2, "more": 0.5, "half": 0.7}
const CHARGE := {"from": 4.5, "pace": 2.6, "most": 1.8, "rest": 2.5}
## (render/act1_fx/swan.ts SWAN_WARN_FROM)
const WARN_FROM := 0.08


func gait() -> Dictionary:
	return GAIT


func acts() -> Array:
	return ACTS


static func reach() -> float:
	return float(BITE["at"]) + float(BITE["more"])


func _keep(m) -> void:
	if not a1.has("v"):
		a1["v"] = m.speed
		a1["ch"] = 0.0
		a1["cd"] = 0.0


func _settle(m) -> void:
	a1["ch"] = 0.0
	a1["cd"] = CHARGE["rest"]
	m.speed = a1["v"]


func spawned(m) -> void:
	_keep(m)


func start(m, _a: Dictionary, _hero) -> void:
	_keep(m)
	if float(a1["ch"]) > 0.0:
		_settle(m)
	# (its bite's strip marked on the floor through its wind-up: act3/marks16.gd)
	warn(m, "swan:bite", WARN_FROM, BITE["hit"], [[BITE["from"], reach(), -float(BITE["half"]), float(BITE["half"])]], [])


func tick(m, dt: float, dist: float, hero) -> bool:
	_keep(m)
	a1["cd"] = maxf(0.0, float(a1["cd"]) - dt)
	if m.state == "act" or act != null or not hero.alive:
		if float(a1["ch"]) > 0.0:
			_settle(m)
		return false
	var sees: bool = m.mgr.sees(m.world, hero.world)
	if float(a1["ch"]) > 0.0:
		a1["ch"] = float(a1["ch"]) - dt
		if float(a1["ch"]) <= 0.0 or dist > float(CHARGE["from"]) + 1.0 or not sees:
			_settle(m)
	elif float(a1["cd"]) <= 0.0 and dist <= float(CHARGE["from"]) and dist > float(ACTS[0]["far"]) and sees:
		# THE CHARGE: its waddle quickened, its neck out low, hissing
		a1["ch"] = CHARGE["most"]
		m.speed = float(a1["v"]) * (float(CHARGE["pace"]) / float(GAIT["pace"]))
		sound(m, "gust", 0.2)
	return false


func acting(m, a: Dictionary, t0: float, t1: float, _dt: float, hero) -> void:
	# (the hiss as it crouches: a breath of air, no voice of its own)
	if crossed(t0, t1, BITE["warn"]):
		sound(m, "gust", 0.25)
	if a["id"] != "swan:bite" or not crossed(t0, t1, float(a["hit"])):
		return
	var r := rel(m, hero)
	if r.x >= float(BITE["from"]) and r.x <= reach() and absf(r.y) <= float(BITE["half"]):
		blow(m, hero, float(a["dmg"]))
	sound(m, "swing", 0.3)
