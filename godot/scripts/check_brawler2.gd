## THE BRAWLER REMADE, PLAYED (heroes/brawler2.gd, switched on for the check alone): `--only=brawler2 --shots=<dir>`. On floor 2
## with three skeletons held before him: three taps, a jab, a cross and a hook, and the third lights a punch globe; a hold, the round
## kick, and a kick globe; the globes kept past the combo's gap, gone after KEEP; a swipe with a punch globe the flying hammerfist,
## flying at the one where it points, knocking down all round where he lands; one with a kick globe the flying knee; one with none
## the hop as before; Quick Hands, every punch a globe; Heavy Hands, no faster, his criticals harder; the fork, only one side; The
## Full Set, every globe spent in one blow three times as hard; Launcher on the hammerfist, thrown up; Thunder Knee on the knee. And
## pictures of each flying move, as it flies and as it lands.
extends RefCounted

const Talents := preload("res://scripts/talents.gd")
const B2 := preload("res://scripts/heroes/brawler2.gd")

var M
var h
var K
var dir := ""
var n := 0
var bad: Array = []
var shot := 0
var pack: Array = []
var home := Vector2.ZERO
var way := Vector2.RIGHT


func _line(ok: bool, s: String) -> void:
	n += 1
	if not ok:
		bad.append(n)
	print("BRAWLER2 %02d %s: %s" % [n, "OK" if ok else "WRONG", s])


func _snap(name: String) -> void:
	shot += 1
	await M._snap("%s/b%02d_%s.png" % [dir, shot, name])


static func _hold(m) -> void:
	if not is_instance_valid(m) or m.dead:
		return
	m.speed = 0.0
	m.state = "recover"
	m._t = 1e9
	m._cd = 1e9


func _keep() -> void:
	for m in pack:
		if is_instance_valid(m) and not m.dead:
			m.life = maxf(m.life, 1.0)
			if m.stun_t <= 0.0 and m.pop <= 0.0:
				_hold(m)


func _run(secs: float, until := Callable()) -> bool:
	var t := 0.0
	while t < secs:
		await M.get_tree().process_frame
		t += M.get_process_delta_time()
		h.life = h.max_life
		h.mana = h.max_mana
		_keep()
		if until.is_valid() and until.call():
			return true
	return not until.is_valid()


func _open_way(at: Vector2) -> Vector2:
	for a in 16:
		var w := Vector2(cos(a * PI / 8.0), sin(a * PI / 8.0))
		var clear := true
		for st in range(1, 10):
			var p: Vector2 = at + w * st
			if not h._clear(p.x, p.y):
				clear = false
				break
		if clear:
			return w
	return Vector2(1, 0)


func _put(m, at: Vector2) -> void:
	m.world = at
	m.stun_t = 0.0
	m.pop = 0.0
	m.thrown = {}
	m._place()
	_hold(m)


## All set as it was: him home, the three set out (A `a` tiles before him, B and C far off), his combo empty, his jump ready.
func _reset(a: float) -> void:
	h.world = home
	h._place()
	h._turn(way)
	K._clear_own()
	K.charges[2] = 1
	K.cd[2] = 0.0
	_put(pack[0], home + way * a)
	_put(pack[1], home + way * 12.0 + Vector2(way.y, -way.x) * 1.0)
	_put(pack[2], home + way * 12.0 - Vector2(way.y, -way.x) * 1.0)
	for m in pack:
		m.max_life = 100000.0
		m.life = 100000.0


func _press(what: String, at := Vector2.INF) -> void:
	if what == "tap":
		h.auto_attack = true
	elif what == "hold":
		h.auto_whirl = true
	elif what == "swipe":
		h.auto_lunge = at
	await M.get_tree().process_frame
	await M.get_tree().process_frame


func _played() -> bool:
	return K.mv.is_empty() and K.queue.is_empty()


func run(main, hero, d: String) -> void:
	M = main
	h = hero
	dir = d
	B2.on = true
	M.set_class("brawler", true)
	M.loot.level = 30
	M.go_to("floor2", "down")
	await M._wait(1.4)
	if M.sight != null:
		M.sight.see_all()
	M.loot.level = 30
	M.loot.derive()
	K = h.kit
	h.walked = 5.0
	home = h.world
	way = _open_way(home)
	var near: Array = []
	for m in M._monsters.list:
		if is_instance_valid(m) and not m.dead and m.kind == "skeleton" and not m.elite and not m.boss:
			near.append(m)
	near.sort_custom(func(a, b) -> bool: return a.world.distance_to(home) < b.world.distance_to(home))
	pack = near.slice(0, 3)
	for o in M._monsters.list:
		if is_instance_valid(o) and not pack.has(o):
			o.queue_free()
	if pack.size() < 3:
		_line(false, "floor 2 has no three skeletons to set out")
		return
	var A = pack[0]
	h.talents = []
	# THREE TAPS: jab, cross, hook; the third lights a punch globe
	_reset(1.6)
	await _run(0.3)
	var a0: float = A.life
	await _press("tap")
	await _press("tap")
	await _press("tap")
	var seen: Array = []
	# (what the watching lambdas learn: a Dictionary, as a lambda keeps its own copy of a plain value)
	var o := {"lit_at": -1}
	await _run(4.0, func():
		if not K.mv.is_empty() and (seen.is_empty() or seen.back() != K.mv["id"]):
			seen.append(K.mv["id"])
			if int(o["lit_at"]) < 0 and K.globes == ["punch"]:
				o["lit_at"] = seen.size()
		return _played() and seen.size() >= 3)
	var lit_at: int = o["lit_at"]
	_line(seen == ["jab", "cross", "hook"] and K.globes == ["punch"] and lit_at == 3 and A.life < a0,
		"three taps: %s, the globe lit with the %s (globes %s); the one before him struck (%.0f to %.0f)" % [seen, ["none", "jab", "cross", "hook"][maxi(0, lit_at)], K.globes, a0, A.life])
	# A HOLD: the round kick, a kick globe
	await _press("hold")
	await _run(2.0, func(): return _played())
	_line(K.globes == ["punch", "kick"], "a hold after: the round kick, a kick globe lit: %s" % [K.globes])
	# KEPT PAST THE GAP; GONE AFTER KEEP
	await _run(1.5)
	var kept: Array = K.globes.duplicate()
	await _run(B2.KEEP)
	_line(kept == ["punch", "kick"] and K.globes.is_empty(), "his globes kept 1.5 s after (%s), out after %.0f s (%s)" % [kept, B2.KEEP, K.globes])
	# A SWIPE WITH A PUNCH GLOBE: the flying hammerfist at one 4.5 tiles off
	_reset(4.5)
	K.globes = ["punch", "kick"]
	await _run(0.2)
	a0 = A.life
	var start: Vector2 = h.world
	await _press("swipe", A.world)
	var flying: bool = not K.mv.is_empty() and K.mv["id"] == "hammerfist"
	o = {"landed": h.world, "stunned": 0.0}
	await _run(3.0, func():
		if A.stun_t > float(o["stunned"]):
			o["stunned"] = A.stun_t
		o["landed"] = h.world
		return _played())
	var landed: Vector2 = o["landed"]
	var stunned: float = o["stunned"]
	_line(flying and K.globes == ["kick"] and A.life < a0 and start.distance_to(landed) > 3.0 and stunned > 1.0,
		"a swipe with a punch globe: the flying hammerfist (%s), the punch globe spent (left %s); he flew %.1f tiles to the one 4.5 tiles off; struck it (%.0f to %.0f), knocked down %.1f s" % [flying, K.globes, start.distance_to(landed), a0, A.life, stunned])
	# ITS PICTURES: as it flies, as it lands
	_reset(4.5)
	K.globes = ["punch"]
	await _run(0.2)
	await _press("swipe", A.world)
	await _run(0.3)
	await _snap("hammerfist_flying")
	await _run(0.25)
	await _snap("hammerfist_lands")
	await _run(2.0, func(): return _played())
	# A SWIPE WITH A KICK GLOBE: the flying knee
	_reset(4.5)
	K.globes = ["kick"]
	await _run(0.2)
	a0 = A.life
	start = h.world
	await _press("swipe", A.world)
	var knee: bool = not K.mv.is_empty() and K.mv["id"] == "flyknee"
	o = {"landed": h.world}
	await _run(3.0, func():
		o["landed"] = h.world
		return _played())
	landed = o["landed"]
	_line(knee and K.globes.is_empty() and A.life < a0 and start.distance_to(landed) > 3.0,
		"a swipe with a kick globe: the flying knee (%s); he flew %.1f tiles; struck the one there (%.0f to %.0f)" % [knee, start.distance_to(landed), a0, A.life])
	_reset(4.5)
	K.globes = ["kick"]
	await _run(0.2)
	await _press("swipe", A.world)
	await _run(0.4)
	await _snap("flyknee_flying")
	await _run(0.25)
	await _snap("flyknee_lands")
	await _run(2.0, func(): return _played())
	# A SWIPE WITH NONE LIT: the hop as before
	_reset(1.6)
	await _run(0.2)
	await _press("swipe", h.world - way * 1.0)
	var hop: bool = not K.mv.is_empty() and K.mv["id"] == "dodge"
	await _run(2.0, func(): return _played())
	_line(hop and K.globes.is_empty(), "a swipe with no globe lit: the hop, as before (%s); no globe from it (%s)" % [hop, K.globes])
	# A SWIPE BREAKS OFF WHAT HE IS DOING
	_reset(1.6)
	K.globes = ["punch"]
	await _run(0.2)
	await _press("tap")
	await _press("tap")
	await _run(0.1)
	await _press("swipe", A.world + way * 1.0)
	var broke: bool = not K.mv.is_empty() and K.mv["id"] == "hammerfist" and K.queue.is_empty()
	await _run(3.0, func(): return _played())
	_line(broke, "a swipe in the middle of his punches: they are broken off, the hammerfist at once (%s)" % broke)
	# THE FORK: Quick Hands or Heavy Hands
	var p1: String = Talents.take_problem("brawler", 50, ["vstiffjab", "vquickhands"], "vheavyhands")
	var p2: String = Talents.take_problem("brawler", 50, ["vstiffjab"], "vheavyhands")
	var p0: String = Talents.take_problem("brawler", 50, [], "vquickhands")
	_line(p1 != "" and p2 == "" and p0 != "", "the fork off Stiff Jab: Heavy Hands with Quick Hands taken \"%s\"; with Stiff Jab alone \"%s\"; Quick Hands before Stiff Jab \"%s\"" % [p1, p2, p0])
	# QUICK HANDS: every punch a globe
	h.talents = ["vstiffjab", "vquickhands"]
	_reset(1.6)
	await _run(0.2)
	await _press("tap")
	await _press("tap")
	await _run(3.0, func(): return _played())
	_line(K.globes == ["punch", "punch"], "Quick Hands: two taps, two punch globes (%s)" % [K.globes])
	# HEAVY HANDS: no faster, his criticals harder
	h.talents = []
	var fast: float = K._pace("jab")
	var crit0: float = K.more_crit(0)
	var aps0 = h.loadout.r(0)["rate"]
	h.talents = ["vstiffjab", "vheavyhands"]
	var slow: float = K._pace("jab")
	var crit1: float = K.more_crit(0)
	_line(slow <= 1.0 and crit0 == 0.0 and (fast <= 1.0 or crit1 > 0.0) and is_equal_approx(crit1, maxf(0.0, fast - 1.0) * 100.0 * B2.HEAVY),
		"Heavy Hands: his jab played at %.2f (without it %.2f, its rate %.2f); his criticals %.0f%% harder (without it %.0f%%)" % [slow, fast, aps0, crit1, crit0])
	# THE FULL SET: all three spent in one blow, three times as hard
	h.talents = ["vstiffjab", "vknockdown", "vfullset"]
	_reset(4.5)
	K.globes = ["punch", "kick", "punch"]
	await _run(0.2)
	await _press("swipe", A.world)
	var spent: bool = K.globes.is_empty() and not K.mv.is_empty() and int(K.mv.get("set", 0)) == 3
	await _run(3.0, func(): return _played())
	_line(spent, "The Full Set: all three globes lit, one swipe spends them all in the hammerfist (set %s)" % str(K.mv.get("set", "-") if not K.mv.is_empty() else 3))
	# LAUNCHER: the hammerfist throws up
	h.talents = ["vstiffjab", "vknockdown", "vlauncher"]
	_reset(4.5)
	K.globes = ["punch"]
	await _run(0.2)
	await _press("swipe", A.world)
	o = {"popped": false}
	await _run(3.0, func():
		if A.pop > 0.0:
			o["popped"] = true
		return _played() and o["popped"])
	var popped: bool = o["popped"]
	_line(popped, "Launcher: the hammerfist throws up the one it lands on (%s)" % popped)
	# THUNDER KNEE: the flying knee's lightning
	h.talents = ["vswitchkick", "vlonglegs", "vaftershock", "vthunderknee"]
	_reset(4.5)
	_put(pack[1], pack[0].world + Vector2(way.y, -way.x) * 1.6)
	K.globes = ["kick"]
	await _run(0.2)
	var b0: float = pack[1].life
	await _press("swipe", A.world)
	await _run(3.0, func(): return _played())
	_line(pack[1].life < b0, "Thunder Knee: the flying knee's lightning on to the one beside (%.0f to %.0f)" % [b0, pack[1].life])
	B2.on = false
	print("BRAWLER2: %d checks, %d wrong%s" % [n, bad.size(), "" if bad.is_empty() else " " + str(bad)])
