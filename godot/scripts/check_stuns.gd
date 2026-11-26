## STUNS MADE RARE, CHECKED (monster.gd STUNS_RARE, on for this alone): `--only=stuns --shots=<dir>`. On floor 2 with a skeleton
## held before him: a stun not of the biggest hits (Heavy's, a meld's) is a stagger, half a second at most, and not again at once;
## the biggest hits' (The Big One's, the Smash's) are stuns still; a monster's meld that held him still slows him instead, and its
## Shiver chills him instead of freezing him; with the switch off, all as it was.
extends RefCounted

const Mon := preload("res://scripts/monster.gd")

var M
var h
var n := 0
var bad: Array = []


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("STUNS %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _fresh(m) -> void:
	m.stun_t = 0.0
	m.stagger_t = 0.0
	m.stagger_cd = 0.0


func run(main, hero, _d: String) -> void:
	M = main
	h = hero
	M.go_to("floor2", "down")
	await M._wait(1.4)
	var m = null
	for o in M._monsters.list:
		if is_instance_valid(o) and not o.dead and not o.elite and not o.boss:
			m = o
			break
	if m == null:
		_line(false, "no monster on floor 2")
		return
	# OFF: as it was
	Mon.STUNS_RARE = false
	_fresh(m)
	m.stun_for(2.0)
	_line(m.stun_t == 2.0 and m.stagger_t == 0.0, "the switch off: a stun of 2 s is a stun of 2 s (%.1f, staggered %.1f)" % [m.stun_t, m.stagger_t])
	Mon.STUNS_RARE = true
	# A COMMON STUN: a stagger
	_fresh(m)
	m.stun_for(2.0)
	_line(m.stun_t == 0.0 and m.stagger_t > 0.0 and m.stagger_t <= Mon.RARE_STAGGER, "on: a common stun of 2 s is a stagger of %.2f s (stunned %.1f)" % [m.stagger_t, m.stun_t])
	var was: float = m.stagger_t
	m.stagger_t = 0.0
	m.stun_for(2.0)
	_line(m.stagger_t == 0.0, "not staggered so again at once (%.2f; was %.2f)" % [m.stagger_t, was])
	# THE BIGGEST HITS: a stun still
	_fresh(m)
	m.stun_for(1.2, "", true)
	_line(m.stun_t == 1.2, "a big hit's stun (The Big One's, the Smash's): a stun of %.1f s" % m.stun_t)
	# HEAVY IN FRONT: its stun a stagger
	_fresh(m)
	h.loadout.front[0] = ["heavy", null]
	h.loadout._r = [null, null, null]
	var life0: float = m.life
	m.life = 1e9
	m.max_life = 1e9
	h.hit_monster(m, 0, 1.0, true)
	_line(m.stun_t == 0.0 and m.stagger_t > 0.0, "Heavy in front: what it hits staggered %.2f s, not stunned (%.1f)" % [m.stagger_t, m.stun_t])
	h.loadout.front[0] = [null, null]
	h.loadout._r = [null, null, null]
	m.max_life = life0
	m.life = life0
	# ON HIM: a monster's meld slows him, no longer holds him still
	h.held = 0.0
	h.hold_again = 0.0
	h._slow_t = 0.0
	var took: bool = h.hold_by_meld(0.5, true)
	_line(took and h.held == 0.0 and h.frozen_t == 0.0 and h._slow_t > 0.0, "on him: a monster's meld that held him still slows him %.1f s instead (held %.1f, frozen %.1f)" % [h._slow_t, h.held, h.frozen_t])
	Mon.STUNS_RARE = false
	h.hold_again = 0.0
	h._slow_t = 0.0
	h.hold_by_meld(0.5, true)
	_line(h.held == 0.5, "the switch off: it holds him still as before (%.1f s)" % h.held)
	h.held = 0.0
	h.frozen_t = 0.0
	print("STUNS: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
